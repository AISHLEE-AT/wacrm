const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const { JWT_SECRET } = require('../middleware/auth');
const { hashPinSha } = require('../services/crypto');
const { sendWhatsAppMessage } = require('../services/whatsapp');

const ADMIN_PHONES_LIST = ['6381029380', '916381029380', '9486335870', '919486335870'];

function isPhoneAdminCheck(p) {
  const clean = (p || '').replace(/\D/g, '').slice(-10);
  return ADMIN_PHONES_LIST.some(ap => ap.replace(/\D/g, '').slice(-10) === clean);
}

// Helper: Resolve unified 24h WhatsApp session status across profiles, contacts, conversations & messages
async function resolveWhatsAppSessionStatus(cleanPhone, profileRow = null) {
  const timestamps = [];

  if (profileRow?.last_whatsapp_inbound_at) {
    const t = new Date(profileRow.last_whatsapp_inbound_at).getTime();
    if (!isNaN(t) && t > 0) timestamps.push(t);
  }

  if (cleanPhone) {
    try {
      // 1. Check all matching profile rows for this phone
      const allProfRes = await pool.query(
        `SELECT MAX(last_whatsapp_inbound_at) AS max_inbound
         FROM profiles
         WHERE phone LIKE $1 OR whatsapp LIKE $1 OR phone LIKE $2 OR whatsapp LIKE $2`,
        [`%${cleanPhone}%`, `%91${cleanPhone}%`]
      );
      if (allProfRes.rows[0]?.max_inbound) {
        const t = new Date(allProfRes.rows[0].max_inbound).getTime();
        if (!isNaN(t) && t > 0) timestamps.push(t);
      }

      // 2. Check CRM conversations & contacts for this phone (matches WhatsApp CRM Inbox timer)
      const convRes = await pool.query(
        `SELECT MAX(GREATEST(c.last_message_at, c.updated_at)) AS max_conv_at,
                ARRAY_AGG(c.id) AS conv_ids
         FROM conversations c
         JOIN contacts ct ON c.contact_id = ct.id
         WHERE ct.phone LIKE $1 OR ct.phone LIKE $2`,
        [`%${cleanPhone}%`, `%91${cleanPhone}%`]
      );
      if (convRes.rows[0]?.max_conv_at) {
        const t = new Date(convRes.rows[0].max_conv_at).getTime();
        if (!isNaN(t) && t > 0) timestamps.push(t);
      }

      // 3. Check latest message in those conversations
      const convIds = (convRes.rows[0]?.conv_ids || []).filter(Boolean);
      if (convIds.length > 0) {
        const msgRes = await pool.query(
          `SELECT MAX(created_at) AS max_msg_at FROM messages WHERE conversation_id = ANY($1::uuid[])`,
          [convIds]
        );
        if (msgRes.rows[0]?.max_msg_at) {
          const t = new Date(msgRes.rows[0].max_msg_at).getTime();
          if (!isNaN(t) && t > 0) timestamps.push(t);
        }
      }
    } catch (e) {
      console.warn('[SESSION SYNC CHECK WARN]', e.message);
    }
  }

  const lastInbound = timestamps.length > 0 ? Math.max(...timestamps) : 0;
  const lastInboundIso = lastInbound > 0 ? new Date(lastInbound).toISOString() : null;

  // Self-heal profile.last_whatsapp_inbound_at if CRM conversation/message has a fresher timestamp
  const profTs = profileRow?.last_whatsapp_inbound_at ? new Date(profileRow.last_whatsapp_inbound_at).getTime() : 0;
  if (cleanPhone && lastInbound > 0 && (!profTs || isNaN(profTs) || lastInbound > profTs + 1000)) {
    pool.query(
      `UPDATE profiles SET last_whatsapp_inbound_at = $1
       WHERE phone LIKE $2 OR whatsapp LIKE $2 OR phone LIKE $3 OR whatsapp LIKE $3`,
      [lastInboundIso, `%${cleanPhone}%`, `%91${cleanPhone}%`]
    ).catch(() => {});
  }

  const isWindowActive = lastInbound > 0 && (Date.now() - lastInbound) < 24 * 60 * 60 * 1000;
  const expiresAt = lastInbound > 0 ? new Date(lastInbound + 24 * 60 * 60 * 1000).toISOString() : null;
  const hoursRemaining = isWindowActive
    ? Math.max(0, Math.round(((lastInbound + 24 * 60 * 60 * 1000 - Date.now()) / (1000 * 60 * 60)) * 10) / 10)
    : 0;

  return {
    lastInbound,
    lastInboundIso,
    isWindowActive,
    expiresAt,
    hoursRemaining,
  };
}

// 1. GET /api/auth/otp/waba - Return configured WABA Admin number
router.get('/otp/waba', (req, res) => {
  res.json({ phone: '916381029380' });
});

// 2. GET /api/auth/check - Fast profile & session verification
router.get('/check', async (req, res) => {
  try {
    const rawPhone = req.query.phone;
    if (!rawPhone) return res.json({ exists: false });

    const clean = rawPhone.replace(/\D/g, '').slice(-10);
    const isAdmin = isPhoneAdminCheck(clean);

    // Search profiles table
    const profileRes = await pool.query(
      `SELECT * FROM profiles 
       WHERE phone LIKE $1 OR whatsapp LIKE $1 OR phone LIKE $2 OR whatsapp LIKE $2
       ORDER BY updated_at DESC NULLS LAST LIMIT 1`,
      [`%${clean}%`, `%91${clean}%`]
    );

    // Search drivers table
    const driverRes = await pool.query(
      `SELECT * FROM drivers 
       WHERE phone LIKE $1 OR mobile_number LIKE $1 OR whatsapp_number LIKE $1
       LIMIT 1`,
      [`%${clean}%`]
    );

    const profile = profileRes.rows[0] || null;
    const driver = driverRes.rows[0] || null;

    if (!profile && !driver && !isAdmin) {
      return res.json({
        exists: false,
        category: 'Traveller',
        role: 'user',
        has_pin: false,
        last_whatsapp_inbound_at: null,
        is_whatsapp_session_active: false,
        whatsapp_window_expires_at: null,
        whatsapp_hours_remaining: 0
      });
    }

    const hasExplicitRole = profile?.role && !['user', 'traveller', 'authenticated'].includes(String(profile.role).toLowerCase());
    const hasExplicitCat = profile?.main_category && !['traveller', 'user'].includes(String(profile.main_category).toLowerCase());
    const resolvedRole = isAdmin ? 'admin' : (hasExplicitRole ? profile.role : (driver ? 'driver' : (profile?.role || 'user')));
    const resolvedCategory = isAdmin ? 'Admin' : (hasExplicitCat ? profile.main_category : (driver ? 'Driver' : (profile?.main_category || 'Traveller')));
    const resolvedName = profile?.full_name || driver?.name || (isAdmin ? 'Admin-RAJA' : 'SuprO User');

    const { lastInboundIso, isWindowActive, expiresAt, hoursRemaining } = await resolveWhatsAppSessionStatus(clean, profile);

    return res.json({
      exists: true,
      id: profile?.id || driver?.id || `user_${clean}`,
      name: resolvedName,
      fullName: resolvedName,
      full_name: resolvedName,
      phone: clean,
      whatsapp: clean,
      category: resolvedCategory,
      main_category: resolvedCategory,
      role: resolvedRole,
      has_pin: !!profile?.pin_hash,
      last_whatsapp_inbound_at: lastInboundIso,
      is_whatsapp_session_active: isWindowActive || isAdmin,
      whatsapp_window_expires_at: expiresAt,
      whatsapp_hours_remaining: isWindowActive ? hoursRemaining : (isAdmin ? 24 : 0),
      gemini_api_key: profile?.gemini_api_key || '',
      upi_id: profile?.upi_id || driver?.upi_id || '6381029380@hdfcbank',
      location: profile?.location || '',
      avatar_url: profile?.avatar_url || '',
      driver_profile: driver || null
    });
  } catch (err) {
    console.error('[AUTH CHECK ERROR]', err);
    res.status(500).json({ error: 'Failed to check user' });
  }
});

// 3. POST /api/auth/otp/request & /api/auth/request-otp
router.post(['/otp/request', '/request-otp'], async (req, res) => {
  try {
    const rawPhone = req.body.phone || req.body.phone_number;
    if (!rawPhone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ error: 'Invalid 10-digit phone number' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    // Store in both phone formats in whatsapp_otps
    await pool.query(
      `INSERT INTO whatsapp_otps (phone_number, otp, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (phone_number)
       DO UPDATE SET otp = EXCLUDED.otp, expires_at = EXCLUDED.expires_at`,
      [`91${cleanPhone}`, otp, expiresAt]
    );
    await pool.query(
      `INSERT INTO whatsapp_otps (phone_number, otp, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (phone_number)
       DO UPDATE SET otp = EXCLUDED.otp, expires_at = EXCLUDED.expires_at`,
      [cleanPhone, otp, expiresAt]
    );

    // Send via Meta WhatsApp if configured
    await sendWhatsAppMessage(
      `91${cleanPhone}`,
      `🔐 *Your SuprO Login OTP is:* *${otp}*\n\nValid for 5 minutes. Enter this 6-digit code in your SuprO app to complete login.`
    );

    return res.json({
      success: true,
      message: 'OTP request initiated. Please send the WhatsApp verification message.',
      phone: cleanPhone,
      _test_otp: otp
    });
  } catch (err) {
    console.error('[OTP REQUEST ERROR]', err);
    res.status(500).json({ error: 'Failed to request OTP' });
  }
});

// 3b. POST /api/auth/check-otp - Internal fallback check for OTP validity across systems
router.post('/check-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) return res.status(400).json({ valid: false, error: 'Phone and OTP required' });
    const clean = phone.replace(/\D/g, '').slice(-10);
    const otpRes = await pool.query(
      `SELECT * FROM whatsapp_otps 
       WHERE (phone_number = $1 OR phone_number = $2 OR phone_number = $3) 
         AND expires_at > NOW() 
       ORDER BY created_at DESC LIMIT 1`,
      [clean, `91${clean}`, `+91${clean}`]
    );
    if (otpRes.rows.length > 0 && otpRes.rows[0].otp === otp.trim()) {
      await pool.query('DELETE FROM whatsapp_otps WHERE phone_number = $1 OR phone_number = $2', [clean, `91${clean}`]).catch(() => {});
      return res.json({ valid: true });
    }
    return res.status(401).json({ valid: false, error: 'Invalid or expired OTP' });
  } catch (err) {
    res.status(500).json({ valid: false, error: err.message });
  }
});

// 4. POST /api/auth/otp/verify & /api/auth/verify-otp
router.post(['/otp/verify', '/verify-otp'], async (req, res) => {
  try {
    const { phone, phone_number, otp, fullName, full_name, category } = req.body;
    const targetPhone = phone || phone_number;
    if (!targetPhone || !otp) {
      return res.status(400).json({ error: 'Phone and 6-digit OTP required' });
    }

    const clean = targetPhone.replace(/\D/g, '').slice(-10);

    // Verify OTP against whatsapp_otps
    const otpRes = await pool.query(
      `SELECT * FROM whatsapp_otps 
       WHERE (phone_number = $1 OR phone_number = $2 OR phone_number = $3) 
         AND expires_at > NOW() 
       ORDER BY created_at DESC LIMIT 1`,
      [clean, `91${clean}`, `+91${clean}`]
    );

    let validOtp = false;
    let otpRowId = null;

    if (otpRes.rows.length > 0 && otpRes.rows[0].otp === otp.trim()) {
      validOtp = true;
      otpRowId = otpRes.rows[0].phone_number;
    } else {
      // Fallback: check otp_sessions table
      const sessRes = await pool.query(
        `SELECT * FROM otp_sessions 
         WHERE (phone_number = $1 OR phone_number = $2) AND is_used = FALSE AND expires_at > NOW() 
         ORDER BY created_at DESC LIMIT 1`,
        [clean, `91${clean}`]
      );
      if (sessRes.rows.length > 0) {
        const isMatch = await bcrypt.compare(otp.trim(), sessRes.rows[0].otp_hash);
        if (isMatch) {
          validOtp = true;
          await pool.query('UPDATE otp_sessions SET is_used = TRUE WHERE id = $1', [sessRes.rows[0].id]);
        }
      }
    }

    // Master OTP for testing / admin bypass
    if (!validOtp && isPhoneAdminCheck(clean) && (otp === '696133' || otp === '123456')) {
      validOtp = true;
    }

    if (!validOtp) {
      return res.status(401).json({ error: 'Invalid or expired OTP. Please request a new one.' });
    }

    // Delete used OTP from OCI Postgres
    await pool.query('DELETE FROM whatsapp_otps WHERE phone_number = $1 OR phone_number = $2', [clean, `91${clean}`]).catch(() => {});

    // Provision or fetch user profile in profiles table
    let profRes = await pool.query(
      `SELECT * FROM profiles 
       WHERE phone LIKE $1 OR whatsapp LIKE $1 OR phone LIKE $2 OR whatsapp LIKE $2
       ORDER BY updated_at DESC NULLS LAST LIMIT 1`,
      [`%${clean}%`, `%91${clean}%`]
    );

    const driverRes = await pool.query(
      `SELECT * FROM drivers 
       WHERE phone LIKE $1 OR mobile_number LIKE $1 OR whatsapp_number LIKE $1
       LIMIT 1`,
      [`%${clean}%`]
    ).catch(() => ({ rows: [] }));
    const driver = driverRes.rows[0] || null;

    let profile = profRes.rows[0];
    const isAdmin = isPhoneAdminCheck(clean);
    const hasExplicitRole = profile?.role && !['user', 'traveller', 'authenticated'].includes(String(profile.role).toLowerCase());
    const hasExplicitCat = profile?.main_category && !['traveller', 'user'].includes(String(profile.main_category).toLowerCase());
    const resolvedRole = isAdmin ? 'admin' : (hasExplicitRole ? profile.role : (driver ? 'driver' : (profile?.role || 'user')));
    const resolvedCat = isAdmin ? 'Admin' : (hasExplicitCat ? profile.main_category : (driver ? 'Driver' : (category || profile?.main_category || 'Traveller')));
    const resolvedName = fullName || full_name || profile?.full_name || driver?.name || (isAdmin ? 'Admin-RAJA' : 'SuprO User');
    const nowIso = new Date().toISOString();
    const expiresAtIso = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    if (!profile) {
      const newId = `user_${clean}_${Date.now()}`;
      const insertRes = await pool.query(
        `INSERT INTO profiles (id, full_name, phone, whatsapp, role, main_category, last_whatsapp_inbound_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW(), NOW())
         RETURNING *`,
        [newId, resolvedName, clean, clean, resolvedRole, resolvedCat]
      );
      profile = insertRes.rows[0];
    } else {
      await pool.query(
        `UPDATE profiles
         SET last_whatsapp_inbound_at = NOW(), updated_at = NOW()
         WHERE id = $1`,
        [profile.id]
      );
      await pool.query(
        `UPDATE profiles
         SET last_whatsapp_inbound_at = NOW()
         WHERE phone LIKE $1 OR whatsapp LIKE $1 OR phone LIKE $2 OR whatsapp LIKE $2`,
        [`%${clean}%`, `%91${clean}%`]
      ).catch(() => {});
      profile.last_whatsapp_inbound_at = nowIso;
      profile.updated_at = nowIso;

      // Sync 24h WhatsApp window: touch conversations so CRM inbox sees fresh timestamp
      await pool.query(
        `UPDATE conversations SET last_message_at = NOW(), updated_at = NOW()
         WHERE contact_id IN (
           SELECT id FROM contacts WHERE phone LIKE $1 OR phone LIKE $2
         )`,
        [`%${clean}%`, `%91${clean}%`]
      ).catch(() => {});
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: profile.id, phone: clean, role: resolvedRole, category: resolvedCat },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    const hasPin = !!profile.pin_hash;
    const defaultModule = profile.default_module || (isAdmin ? '/admin/tuto' : (resolvedRole === 'driver' ? '/drivo' : '/rideo'));

    res.cookie('sb-access-token', token, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    return res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: profile.id,
        phone: clean,
        fullName: resolvedName,
        role: resolvedRole,
        category: resolvedCat,
        last_whatsapp_inbound_at: nowIso
      },
      profile: {
        ...profile,
        last_whatsapp_inbound_at: nowIso,
        is_whatsapp_session_active: true,
        whatsapp_window_expires_at: expiresAtIso,
        whatsapp_hours_remaining: 24
      },
      last_whatsapp_inbound_at: nowIso,
      is_whatsapp_session_active: true,
      whatsapp_window_expires_at: expiresAtIso,
      whatsapp_hours_remaining: 24,
      session: {
        access_token: token,
        refresh_token: token
      },
      hasPin,
      has_pin: hasPin,
      needs_pin_setup: !hasPin,
      redirectUrl: defaultModule,
      redirect_to: defaultModule
    });
  } catch (err) {
    console.error('[OTP VERIFY ERROR]', err);
    res.status(500).json({ error: err.message || 'Authentication failed' });
  }
});

// 5. POST /api/auth/pin - 4-digit PIN Login
router.post('/pin', async (req, res) => {
  try {
    const { phone, pin } = req.body;
    if (!phone || !pin) {
      return res.status(400).json({ error: 'Phone and 4-digit PIN required' });
    }

    const clean = phone.replace(/\D/g, '').slice(-10);
    const hashedSha = hashPinSha(pin);

    // Fetch profile
    const profRes = await pool.query(
      `SELECT * FROM profiles 
       WHERE phone LIKE $1 OR whatsapp LIKE $1 OR phone LIKE $2 OR whatsapp LIKE $2
       ORDER BY updated_at DESC NULLS LAST LIMIT 1`,
      [`%${clean}%`, `%91${clean}%`]
    );

    const profile = profRes.rows[0];
    const isAdmin = isPhoneAdminCheck(clean);

    if (!profile) {
      return res.status(401).json({ error: 'Account not found. Please login via WhatsApp OTP first.' });
    }

    let pinValid = false;
    if (profile.pin_hash) {
      if (profile.pin_hash === hashedSha) {
        pinValid = true;
      } else {
        try {
          pinValid = await bcrypt.compare(pin, profile.pin_hash);
        } catch (_) {}
      }
    }

    // Master default PIN (1234) for admin phone during setup
    if (!pinValid && isAdmin && pin === '1234') {
      pinValid = true;
    }

    if (!pinValid) {
      return res.status(401).json({ error: 'Invalid PIN entered. Please check your 4-digit PIN.' });
    }

    // Touch profile & conversation so 24h WhatsApp window is kept fresh
    const nowIso = new Date().toISOString();
    const expiresAtIso = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await pool.query(
      `UPDATE profiles
       SET last_whatsapp_inbound_at = NOW(), updated_at = NOW()
       WHERE id = $1`,
      [profile.id]
    ).catch(() => {});
    await pool.query(
      `UPDATE profiles
       SET last_whatsapp_inbound_at = NOW()
       WHERE phone LIKE $1 OR whatsapp LIKE $1 OR phone LIKE $2 OR whatsapp LIKE $2`,
      [`%${clean}%`, `%91${clean}%`]
    ).catch(() => {});
    await pool.query(
      `UPDATE conversations SET last_message_at = NOW(), updated_at = NOW()
       WHERE contact_id IN (
         SELECT id FROM contacts WHERE phone LIKE $1 OR phone LIKE $2
       )`,
      [`%${clean}%`, `%91${clean}%`]
    ).catch(() => {});

    const resolvedRole = isAdmin ? 'admin' : (profile.role || 'user');
    const resolvedCat = isAdmin ? 'Admin' : (profile.main_category || 'Traveller');

    const token = jwt.sign(
      { id: profile.id, phone: clean, role: resolvedRole, category: resolvedCat },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    const defaultModule = profile.default_module || (isAdmin ? '/admin/tuto' : (resolvedRole === 'driver' ? '/drivo' : '/rideo'));

    res.cookie('sb-access-token', token, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    return res.json({
      success: true,
      message: 'PIN login successful',
      token,
      user: {
        id: profile.id,
        phone: clean,
        fullName: profile.full_name || 'SuprO User',
        role: resolvedRole,
        category: resolvedCat,
        last_whatsapp_inbound_at: nowIso
      },
      profile: {
        ...profile,
        last_whatsapp_inbound_at: nowIso,
        is_whatsapp_session_active: true,
        whatsapp_window_expires_at: expiresAtIso,
        whatsapp_hours_remaining: 24
      },
      last_whatsapp_inbound_at: nowIso,
      is_whatsapp_session_active: true,
      whatsapp_window_expires_at: expiresAtIso,
      whatsapp_hours_remaining: 24,
      session: {
        access_token: token,
        refresh_token: token
      },
      hasPin: true,
      has_pin: true,
      needs_pin_setup: false,
      redirectUrl: defaultModule,
      redirect_to: defaultModule
    });
  } catch (err) {
    console.error('[PIN LOGIN ERROR]', err);
    res.status(500).json({ error: 'PIN login failed' });
  }
});

// 6. POST /api/auth/pin/set - Set 4-digit secure PIN
router.post('/pin/set', async (req, res) => {
  try {
    const { phone, pin, confirmPin } = req.body;
    if (!phone || !pin || pin.length !== 4) {
      return res.status(400).json({ error: 'Valid 4-digit PIN is required' });
    }
    if (confirmPin !== undefined && pin !== confirmPin) {
      return res.status(400).json({ error: 'PINs do not match' });
    }

    const clean = phone.replace(/\D/g, '').slice(-10);
    const hashedSha = hashPinSha(pin);

    await pool.query(
      `UPDATE profiles 
       SET pin_hash = $1, pin_set_at = NOW() 
       WHERE phone LIKE $2 OR whatsapp LIKE $2 OR phone LIKE $3 OR whatsapp LIKE $3`,
      [hashedSha, `%${clean}%`, `%91${clean}%`]
    );

    return res.json({ success: true, message: 'PIN set successfully' });
  } catch (err) {
    console.error('[PIN SET ERROR]', err);
    res.status(500).json({ error: 'Failed to set PIN' });
  }
});

// 6b. POST /api/auth/logout - Clear session cookie
router.post('/logout', (req, res) => {
  res.clearCookie('sb-access-token', { path: '/' });
  return res.json({ success: true });
});

// 7. GET /api/auth/me - Verify session cookie and return user profile
router.get('/me', async (req, res) => {
  try {
    let token = req.cookies ? req.cookies['sb-access-token'] : null;
    if (!token && req.headers.cookie) {
      const match = req.headers.cookie.match(/sb-access-token=([^;]+)/);
      if (match) token = match[1];
    }
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts[0] === 'Bearer' && parts[1]) token = parts[1];
    }
    if (!token && req.headers['x-supro-access-token']) {
      token = req.headers['x-supro-access-token'];
    }

    if (!token) {
      return res.json({ authenticated: false, user: null, profile: null });
    }

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      payload = jwt.decode(token);
    }

    if (!payload || (!payload.id && !payload.phone && !payload.sub)) {
      return res.json({ authenticated: false, user: null, profile: null });
    }

    const rawPhone = payload.phone || payload.user_metadata?.phone || '';
    let clean = rawPhone.replace(/\D/g, '').slice(-10);
    const userId = payload.id || payload.sub || (clean ? `user_${clean}` : 'user_authenticated');

    let profile = null;
    if (clean) {
      const profRes = await pool.query(
        `SELECT * FROM profiles 
         WHERE phone LIKE $1 OR whatsapp LIKE $1 OR phone LIKE $2 OR whatsapp LIKE $2
         ORDER BY updated_at DESC NULLS LAST LIMIT 1`,
        [`%${clean}%`, `%91${clean}%`]
      );
      if (profRes.rows.length > 0) profile = profRes.rows[0];
    } else if (userId && !userId.startsWith('user_')) {
      const profRes = await pool.query(`SELECT * FROM profiles WHERE id = $1 LIMIT 1`, [userId]);
      if (profRes.rows.length > 0) profile = profRes.rows[0];
    }

    if (!clean && (profile?.phone || profile?.whatsapp)) {
      clean = (profile.phone || profile.whatsapp || '').replace(/\D/g, '').slice(-10);
    }

    let driver = null;
    if (clean) {
      const drvRes = await pool.query(
        `SELECT * FROM drivers
         WHERE phone LIKE $1 OR mobile_number LIKE $1 OR whatsapp_number LIKE $1
         LIMIT 1`,
        [`%${clean}%`]
      ).catch(() => ({ rows: [] }));
      driver = drvRes.rows[0] || null;
    }

    const isAdmin = isPhoneAdminCheck(clean);
    const hasExplicitRole = profile?.role && !['user', 'traveller', 'authenticated'].includes(String(profile.role).toLowerCase());
    const hasExplicitCat = profile?.main_category && !['traveller', 'user'].includes(String(profile.main_category).toLowerCase());
    const resolvedRole = isAdmin ? 'admin' : (hasExplicitRole ? profile.role : (driver ? 'driver' : (profile?.role || payload.role || 'user')));
    const resolvedCat = isAdmin ? 'Admin' : (hasExplicitCat ? profile.main_category : (driver ? 'Driver' : (profile?.main_category || payload.category || 'Traveller')));
    const resolvedName = profile?.full_name || driver?.name || payload.fullName || payload.name || `User ${clean.slice(-4)}`;

    const { lastInboundIso, isWindowActive, expiresAt, hoursRemaining } = await resolveWhatsAppSessionStatus(clean, profile);

    const user = {
      id: profile?.id || userId,
      phone: clean,
      email: profile?.email || payload.email || '',
      role: resolvedRole,
      app_metadata: {},
      user_metadata: {
        id: profile?.id || userId,
        phone: clean,
        fullName: resolvedName,
        role: resolvedRole,
        category: resolvedCat,
        last_whatsapp_inbound_at: lastInboundIso
      }
    };

    const finalProfile = {
      ...(profile || {
        id: userId,
        full_name: resolvedName,
        phone: clean,
        whatsapp: clean,
        role: resolvedRole,
        main_category: resolvedCat,
        account_id: 'f21e8cdb-e27d-41fa-9aa4-af06ccdc0feb',
        account_role: resolvedRole === 'admin' ? 'admin' : 'owner',
      }),
      last_whatsapp_inbound_at: lastInboundIso,
      is_whatsapp_session_active: isWindowActive || isAdmin,
      whatsapp_window_expires_at: expiresAt,
      whatsapp_hours_remaining: isWindowActive ? hoursRemaining : (isAdmin ? 24 : 0),
    };

    return res.json({
      authenticated: true,
      user,
      profile: finalProfile,
      driver_profile: driver,
      last_whatsapp_inbound_at: lastInboundIso,
      is_whatsapp_session_active: isWindowActive || isAdmin,
      whatsapp_window_expires_at: expiresAt,
      whatsapp_hours_remaining: isWindowActive ? hoursRemaining : (isAdmin ? 24 : 0),
      token
    });
  } catch (err) {
    console.error('[AUTH ME ERROR]', err);
    return res.status(500).json({ authenticated: false, error: err.message });
  }
});

module.exports = router;
