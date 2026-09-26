const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { pool } = require('../db');
const { JWT_SECRET } = require('../middleware/auth');
const { hashPinSha } = require('../services/crypto');
const { sendWhatsAppMessage } = require('../services/whatsapp');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://gmahjdzqitbomtmdzlfp.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtYWhqZHpxaXRib210bWR6bGZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjI1MTcyNywiZXhwIjoyMDk3ODI3NzI3fQ.t0dqkLlGK0P9SwdYveBFgQDIify4UTpVGvZZeiF7Mn0';

const ADMIN_PHONES_LIST = ['6381029380', '916381029380', '9486335870', '919486335870'];

function isPhoneAdminCheck(p) {
  const clean = (p || '').replace(/\D/g, '').slice(-10);
  return ADMIN_PHONES_LIST.some(ap => ap.replace(/\D/g, '').slice(-10) === clean);
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
        is_whatsapp_session_active: false,
        whatsapp_window_expires_at: null,
        whatsapp_hours_remaining: 0
      });
    }

    const resolvedRole = isAdmin ? 'admin' : (driver ? 'driver' : (profile?.role || 'user'));
    const resolvedCategory = isAdmin ? 'Admin' : (driver ? 'Driver' : (profile?.main_category || 'Traveller'));
    const resolvedName = profile?.full_name || driver?.name || (isAdmin ? 'Admin-RAJA' : 'SuprO User');

    let lastInbound = profile?.last_whatsapp_inbound_at ? new Date(profile.last_whatsapp_inbound_at).getTime() : 0;
    const isWindowActive = lastInbound > 0 && (Date.now() - lastInbound) < 24 * 60 * 60 * 1000;
    const expiresAt = lastInbound > 0 ? new Date(lastInbound + 24 * 60 * 60 * 1000).toISOString() : null;
    const hoursRemaining = isWindowActive ? Math.max(0, Math.round(((lastInbound + 24 * 60 * 60 * 1000 - Date.now()) / (1000 * 60 * 60)) * 10) / 10) : 0;

    return res.json({
      exists: true,
      id: profile?.id || driver?.id || `user_${clean}`,
      name: resolvedName,
      fullName: resolvedName,
      category: resolvedCategory,
      role: resolvedRole,
      has_pin: !!profile?.pin_hash,
      is_whatsapp_session_active: isWindowActive || isAdmin,
      whatsapp_window_expires_at: expiresAt,
      whatsapp_hours_remaining: hoursRemaining || 24,
      gemini_api_key: profile?.gemini_api_key || '',
      upi_id: profile?.upi_id || driver?.upi_id || '6381029380@hdfcbank'
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

    // Dual-sync to Supabase Cloud whatsapp_otps for both phone formats
    for (const ph of [`91${cleanPhone}`, cleanPhone]) {
      try {
        await axios.post(`${SUPABASE_URL}/rest/v1/whatsapp_otps`, {
          phone_number: ph,
          otp: otp,
          expires_at: expiresAt.toISOString()
        }, {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
          },
          timeout: 4000
        });
      } catch (sbErr) {
        console.warn('[SUPABASE OTP REQUEST SYNC WARN]', ph, sbErr.message);
      }
    }

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

    // Fallback: check Supabase Cloud whatsapp_otps
    if (!validOtp) {
      try {
        const sbRes = await axios.get(
          `${SUPABASE_URL}/rest/v1/whatsapp_otps?or=(phone_number.eq.91${clean},phone_number.eq.${clean})&select=*&order=created_at.desc&limit=1`,
          {
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`
            },
            timeout: 3000
          }
        );
        if (Array.isArray(sbRes.data) && sbRes.data.length > 0) {
          const sbOtp = sbRes.data[0];
          if (sbOtp.otp === otp.trim() && new Date(sbOtp.expires_at).getTime() >= Date.now()) {
            validOtp = true;
          }
        }
      } catch (sbErr) {
        console.warn('[SUPABASE VERIFY FALLBACK WARN]', sbErr.message);
      }
    }

    // Master OTP for testing / admin bypass
    if (!validOtp && isPhoneAdminCheck(clean) && (otp === '696133' || otp === '123456')) {
      validOtp = true;
    }

    if (!validOtp) {
      return res.status(401).json({ error: 'Invalid or expired OTP. Please request a new one.' });
    }

    // Delete used OTP from OCI Postgres and Supabase Cloud
    await pool.query('DELETE FROM whatsapp_otps WHERE phone_number = $1 OR phone_number = $2', [clean, `91${clean}`]).catch(() => {});
    try {
      await axios.delete(`${SUPABASE_URL}/rest/v1/whatsapp_otps?or=(phone_number.eq.91${clean},phone_number.eq.${clean})`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        },
        timeout: 3000
      });
    } catch (_) {}

    // Provision or fetch user profile in profiles table
    let profRes = await pool.query(
      `SELECT * FROM profiles 
       WHERE phone LIKE $1 OR whatsapp LIKE $1 OR phone LIKE $2 OR whatsapp LIKE $2
       LIMIT 1`,
      [`%${clean}%`, `%91${clean}%`]
    );

    let profile = profRes.rows[0];
    const isAdmin = isPhoneAdminCheck(clean);
    const resolvedRole = isAdmin ? 'admin' : (profile?.role || 'user');
    const resolvedCat = isAdmin ? 'Admin' : (category || profile?.main_category || 'Traveller');
    const resolvedName = fullName || full_name || profile?.full_name || (isAdmin ? 'Admin-RAJA' : 'SuprO User');

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
        `UPDATE profiles SET last_whatsapp_inbound_at = NOW(), updated_at = NOW() WHERE id = $1`,
        [profile.id]
      );
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

    return res.json({
      message: 'Login successful!',
      token,
      user: {
        id: profile.id,
        phone: clean,
        fullName: resolvedName,
        role: resolvedRole,
        category: resolvedCat
      },
      session: {
        access_token: token,
        refresh_token: token
      },
      needs_pin_setup: !profile.pin_hash
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
       LIMIT 1`,
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
    await pool.query(
      `UPDATE profiles SET last_whatsapp_inbound_at = NOW(), updated_at = NOW() WHERE id = $1`,
      [profile.id]
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

    return res.json({
      user: {
        id: profile.id,
        phone: clean,
        fullName: profile.full_name || 'SuprO User',
        role: resolvedRole,
        category: resolvedCat
      },
      session: {
        access_token: token,
        refresh_token: token
      }
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
    if (pin !== confirmPin) {
      return res.status(400).json({ error: 'PINs do not match' });
    }

    const clean = phone.replace(/\D/g, '').slice(-10);
    const hashedSha = hashPinSha(pin);

    await pool.query(
      `UPDATE profiles 
       SET pin_hash = $1, pin_set_at = NOW(), updated_at = NOW() 
       WHERE phone LIKE $2 OR whatsapp LIKE $2 OR phone LIKE $3 OR whatsapp LIKE $3`,
      [hashedSha, `%${clean}%`, `%91${clean}%`]
    );

    return res.json({ success: true, message: 'PIN set successfully' });
  } catch (err) {
    console.error('[PIN SET ERROR]', err);
    res.status(500).json({ error: 'Failed to set PIN' });
  }
});

module.exports = router;
