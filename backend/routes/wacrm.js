const express = require('express');
const router = express.Router();
const axios = require('axios');
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { upload, sendWhatsAppMessage } = require('../services/whatsapp');

// 1. CRM Customers
router.get('/customers', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers ORDER BY created_at DESC');
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching customers.' });
  }
});

router.post('/customers', authenticateToken, async (req, res) => {
  const { phone_number, name, status } = req.body;
  if (!phone_number) return res.status(400).json({ error: 'Customer phone number required.' });

  try {
    const result = await pool.query(
      'INSERT INTO customers (phone_number, name, status, assigned_to) VALUES ($1, $2, $3, $4) ON CONFLICT (phone_number) DO UPDATE SET name = EXCLUDED.name RETURNING *',
      [phone_number, name || 'Unknown', status || 'Lead', req.user?.id || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating customer.' });
  }
});

// 2. Messaging: Send WhatsApp Message (Agent CRM)
router.post('/messages/send', authenticateToken, async (req, res) => {
  const { customer_id, content } = req.body;
  if (!customer_id || !content) return res.status(400).json({ error: 'Customer ID and content required.' });

  try {
    const customerRes = await pool.query('SELECT phone_number FROM customers WHERE id = $1', [customer_id]);
    if (customerRes.rows.length === 0) return res.status(404).json({ error: 'Customer not found.' });

    await sendWhatsAppMessage(customerRes.rows[0].phone_number, content);

    const result = await pool.query(
      'INSERT INTO messages (customer_id, sender, content) VALUES ($1, $2, $3) RETURNING *',
      [customer_id, 'agent', content]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error sending message.' });
  }
});

// 3. Conversations Feed
router.get('/conversations', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.id, c.contact_id, c.last_message_text, c.last_message_at, c.unread_count, c.status, c.created_at, c.updated_at,
        json_build_object('id', ct.id, 'name', ct.name, 'phone', ct.phone, 'email', ct.email) as contact
      FROM conversations c
      LEFT JOIN contacts ct ON c.contact_id = ct.id
      ORDER BY c.last_message_at DESC NULLS LAST
    `);
    res.json({ conversations: result.rows, data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/conversations/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT 
        c.id, c.contact_id, c.last_message_text, c.last_message_at, c.unread_count, c.status, c.created_at, c.updated_at,
        json_build_object('id', ct.id, 'name', ct.name, 'phone', ct.phone, 'email', ct.email) as contact
      FROM conversations c
      LEFT JOIN contacts ct ON c.contact_id = ct.id
      WHERE c.id = $1
    `, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    res.json({ conversation: result.rows[0], data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/conversations/:id/messages', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT 
        id, conversation_id, sender_type, sender, content_type,
        COALESCE(content_text, content) as content_text,
        COALESCE(content_text, content) as content,
        media_url, template_name, message_id, status, created_at
      FROM messages
      WHERE conversation_id = $1
      ORDER BY created_at ASC
    `, [id]);
    res.json({ messages: result.rows, data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. WhatsApp Configuration
router.get('/whatsapp/config', (req, res) => {
  const phoneId = process.env.META_PHONE_NUMBER_ID || '1213113635214047';
  const wabaId = process.env.META_WABA_ID || '1370739925032027';
  const verifyToken = process.env.META_VERIFY_TOKEN || 'Aishlee';

  res.json({
    connected: true,
    status: 'connected',
    phone_info: {
      id: phoneId,
      display_phone_number: '+91 94863 35870',
      verified_name: 'SuprO WhatsApp CRM',
      quality_rating: 'GREEN',
    },
    config: {
      phone_number_id: phoneId,
      waba_id: wabaId,
      verify_token: verifyToken,
      status: 'connected',
      connected_at: new Date().toISOString(),
    }
  });
});

// 5. Send Outbound WhatsApp Message
router.post('/whatsapp/send', async (req, res) => {
  const conversation_id = req.body.conversation_id || req.body.conversationId;
  const reqPhone = req.body.phone || req.body.to;
  const msgText = req.body.content_text || req.body.text || req.body.message || '';
  const message_type = req.body.message_type || 'text';
  const template_name = req.body.template_name || req.body.templateName;
  const template_lang = req.body.template_language || req.body.templateLang || 'en_US';
  const template_components = req.body.template_components || req.body.components;

  const media_url = req.body.media_url || req.body.mediaUrl || '';
  const filename = req.body.filename || '';
  const MEDIA_KINDS = ['image', 'video', 'document', 'audio'];
  const isMedia = MEDIA_KINDS.includes(message_type);

  if (!msgText && !template_name && !isMedia) {
    return res.status(400).json({ error: 'content_text, template_name, or media_url required' });
  }
  if (isMedia && !media_url) {
    return res.status(400).json({ error: 'media_url is required for ' + message_type + ' messages' });
  }

  try {
    let resolvedConvId = conversation_id;
    let recipientPhone = reqPhone;

    if (resolvedConvId) {
      const convRes = await pool.query(`
        SELECT c.id, ct.phone 
        FROM conversations c 
        JOIN contacts ct ON c.contact_id = ct.id 
        WHERE c.id = $1
      `, [resolvedConvId]);

      if (convRes.rows.length > 0) {
        recipientPhone = convRes.rows[0].phone;
      }
    }

    if (!recipientPhone && reqPhone) {
      recipientPhone = reqPhone;
    }

    if (!resolvedConvId && recipientPhone) {
      const clean10 = recipientPhone.replace(/\D/g, '').slice(-10);
      let ctRes = await pool.query('SELECT id FROM contacts WHERE phone LIKE $1 LIMIT 1', [`%${clean10}%`]);
      let contactId;
      if (ctRes.rows.length > 0) {
        contactId = ctRes.rows[0].id;
      } else {
        const newCt = await pool.query('INSERT INTO contacts (phone, name) VALUES ($1, $2) RETURNING id', [recipientPhone, 'WhatsApp User ' + clean10]);
        contactId = newCt.rows[0].id;
      }

      let cRes = await pool.query('SELECT id FROM conversations WHERE contact_id = $1 LIMIT 1', [contactId]);
      if (cRes.rows.length > 0) {
        resolvedConvId = cRes.rows[0].id;
      } else {
        const newConv = await pool.query('INSERT INTO conversations (contact_id, last_message_text, last_message_at, unread_count, status) VALUES ($1, $2, NOW(), 0, $3) RETURNING id', [contactId, msgText || template_name, 'open']);
        resolvedConvId = newConv.rows[0].id;
      }
    }

    if (!recipientPhone) {
      return res.status(400).json({ error: 'Recipient phone number could not be determined' });
    }

    // Call Meta API
    const sendRes = await sendWhatsAppMessage(recipientPhone, msgText, {
      templateName: template_name,
      templateLang: template_lang,
      components: template_components,
      mediaKind: isMedia ? message_type : undefined,
      mediaUrl: media_url || undefined,
      filename: filename || undefined,
    });

    const isMetaSuccess = sendRes.success;
    const metaMessageId = sendRes.messageId || null;
    const msgStatus = isMetaSuccess ? 'sent' : 'failed';

    const insertRes = await pool.query(`
      INSERT INTO messages (
        id, conversation_id, sender_type, sender,
        content_type, content_text, content, media_url, message_id, status, created_at
      ) VALUES (
        gen_random_uuid(), $1, 'agent', 'agent',
        $2, $3, $3, $4, $5, $6, NOW()
      ) RETURNING *
    `, [resolvedConvId, message_type || 'text', msgText || (isMedia ? `[${message_type}]` : `[Template: ${template_name}]`), media_url || null, metaMessageId, msgStatus]);

    if (resolvedConvId) {
      await pool.query(`
        UPDATE conversations 
        SET last_message_text = $1, last_message_at = NOW(), updated_at = NOW() 
        WHERE id = $2
      `, [msgText || `[Template: ${template_name}]`, resolvedConvId]);
    }

    // Dual-sync to Supabase Realtime
    const SUPABASE_URL = process.env.SUPABASE_URL || 'https://gmahjdzqitbomtmdzlfp.supabase.co';
    const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtYWhqZHpxaXRib210bWR6bGZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjI1MTcyNywiZXhwIjoyMDk3ODI3NzI3fQ.t0dqkLlGK0P9SwdYveBFgQDIify4UTpVGvZZeiF7Mn0';
    try {
      if (resolvedConvId) {
        await axios.post(`${SUPABASE_URL}/rest/v1/messages`, {
          conversation_id: resolvedConvId,
          sender_type: 'agent',
          content_type: message_type || 'text',
          content_text: msgText || (isMedia ? `[${message_type}]` : `[Template: ${template_name}]`),
          media_url: media_url || null,
          message_id: metaMessageId,
          status: msgStatus,
          created_at: new Date().toISOString()
        }, {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          timeout: 4000
        });
        await axios.patch(`${SUPABASE_URL}/rest/v1/conversations?id=eq.${resolvedConvId}`, {
          last_message_text: msgText || `[Template: ${template_name}]`,
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          timeout: 4000
        });
      }
    } catch (sbErr) {
      console.warn('[SUPABASE DUAL-SYNC NOTE]', sbErr.message);
    }

    if (!isMetaSuccess) {
      const errStr = JSON.stringify(sendRes.error || {});
      const isSessionExpired = errStr.includes('131047') || errStr.toLowerCase().includes('24 hour') || errStr.toLowerCase().includes('window');
      return res.status(isSessionExpired ? 400 : 502).json({
        success: false,
        error: isSessionExpired 
          ? '24-hour customer messaging window is closed. Meta requires sending an approved WhatsApp Template to re-open the conversation.' 
          : 'Meta WhatsApp delivery failed: ' + (sendRes.error?.error?.message || errStr),
        code: isSessionExpired ? 'SESSION_EXPIRED' : 'META_ERROR',
        isSessionExpired,
        message: insertRes.rows[0],
      });
    }

    res.json({ success: true, message: insertRes.rows[0], message_id: metaMessageId });
  } catch (err) {
    console.error('[WHATSAPP SEND ERROR]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 6. Direct WhatsApp Media Upload Pipeline
router.post('/whatsapp/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const SUPABASE_URL = process.env.SUPABASE_URL || 'https://gmahjdzqitbomtmdzlfp.supabase.co';
    const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtYWhqZHpxaXRib210bWR6bGZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjI1MTcyNywiZXhwIjoyMDk3ODI3NzI3fQ.t0dqkLlGK0P9SwdYveBFgQDIify4UTpVGvZZeiF7Mn0';

    const origName = req.file.originalname || 'upload.bin';
    const ext = origName.includes('.') ? origName.split('.').pop().toLowerCase() : 'bin';
    const safeBase = origName
      .replace(/\.[^.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]+/g, '_')
      .slice(0, 40) || 'file';
    const bucket = req.body.bucket || 'chat-media';
    const accountId = req.body.account_id || req.body.accountId || 'crm-default';
    const storagePath = `account-${accountId}/${Date.now()}-${safeBase}.${ext}`;

    await axios.post(
      `${SUPABASE_URL}/storage/v1/object/${bucket}/${storagePath}`,
      req.file.buffer,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': req.file.mimetype || 'application/octet-stream',
          'x-upsert': 'true'
        },
        timeout: 30000
      }
    );

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${storagePath}`;
    console.log(`[OCI MEDIA UPLOAD] Uploaded ${origName} (${req.file.size} bytes) -> ${publicUrl}`);

    res.json({
      success: true,
      publicUrl,
      path: storagePath,
      filename: origName,
      mimeType: req.file.mimetype,
      size: req.file.size
    });
  } catch (err) {
    console.error('[OCI MEDIA UPLOAD ERROR]', err.response?.data || err.message);
    res.status(500).json({
      error: 'Failed to upload media file',
      details: err.response?.data || err.message
    });
  }
});

// 7. WhatsApp Media Proxy Route
router.get('/whatsapp/media/:mediaId', async (req, res) => {
  const { mediaId } = req.params;
  if (!mediaId) {
    return res.status(400).json({ error: 'Media ID is required' });
  }

  const token = process.env.META_ACCESS_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'META_ACCESS_TOKEN is missing' });
  }

  try {
    const metaRes = await axios.get(`https://graph.facebook.com/v21.0/${mediaId}`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 12000
    });

    const downloadUrl = metaRes.data?.url;
    const mimeType = metaRes.data?.mime_type || 'application/octet-stream';
    const fileSize = metaRes.data?.file_size;

    if (!downloadUrl) {
      return res.status(404).json({ error: 'Media URL not found in Meta response' });
    }

    const mediaStream = await axios({
      method: 'GET',
      url: downloadUrl,
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'stream',
      timeout: 30000
    });

    res.set('Content-Type', mimeType);
    res.set('Cache-Control', 'public, max-age=86400');
    if (fileSize) {
      res.set('Content-Length', fileSize);
    }

    mediaStream.data.pipe(res);
  } catch (err) {
    console.error(`[WHATSAPP MEDIA FETCH ERROR] Media ID ${mediaId}:`, err.response?.data || err.message);
    const status = err.response?.status || 500;
    res.status(status).json({
      error: 'Failed to fetch WhatsApp media',
      details: err.response?.data || err.message
    });
  }
});

// 8. WhatsApp Webhook Ingress (Verification + Incoming Messages/Statuses)
router.get('/webhooks/whatsapp', (req, res) => {
  const verify_token = process.env.META_VERIFY_TOKEN;
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === verify_token) {
      console.log('[WEBHOOK] Meta Webhook Verified!');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

router.post('/webhooks/whatsapp', async (req, res) => {
  try {
    const body = req.body;
    
    if (body.object) {
      // 1. Status updates
      if (body.entry?.[0]?.changes?.[0]?.value?.statuses?.[0]) {
        const st = body.entry[0].changes[0].value.statuses[0];
        const statusVal = st.status;
        const wamid = st.id;

        if (wamid && statusVal) {
          try {
            await pool.query('UPDATE messages SET status = $1 WHERE message_id = $2', [statusVal, wamid]);

            const SUPABASE_URL = process.env.SUPABASE_URL || 'https://gmahjdzqitbomtmdzlfp.supabase.co';
            const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtYWhqZHpxaXRib210bWR6bGZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjI1MTcyNywiZXhwIjoyMDk3ODI3NzI3fQ.t0dqkLlGK0P9SwdYveBFgQDIify4UTpVGvZZeiF7Mn0';
            await axios.patch(`${SUPABASE_URL}/rest/v1/messages?message_id=eq.${wamid}`, {
              status: statusVal
            }, {
              headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
              },
              timeout: 4000
            }).catch(() => {});
          } catch (stErr) {
            console.warn('[STATUS UPDATE WARN]', stErr.message);
          }
        }
      }

      // 2. Incoming messages
      if (body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
        const msg = body.entry[0].changes[0].value.messages[0];
        const from_number = msg.from;
        const clean10 = from_number.slice(-10);
        const messageId = msg.id || ('wamid.' + Date.now());

        const MEDIA_KINDS = ['image', 'video', 'document', 'audio', 'sticker'];
        const isMedia = MEDIA_KINDS.includes(msg.type);
        let mediaId = null;
        let mediaUrl = null;
        let contentType = 'text';
        let caption = '';
        let filename = '';

        if (isMedia) {
          if (msg.type === 'image' && msg.image?.id) {
            mediaId = msg.image.id;
            caption = msg.image.caption || '';
            contentType = 'image';
          } else if (msg.type === 'video' && msg.video?.id) {
            mediaId = msg.video.id;
            caption = msg.video.caption || '';
            contentType = 'video';
          } else if (msg.type === 'document' && msg.document?.id) {
            mediaId = msg.document.id;
            caption = msg.document.caption || msg.document.filename || '';
            filename = msg.document.filename || '';
            contentType = 'document';
          } else if (msg.type === 'audio' && msg.audio?.id) {
            mediaId = msg.audio.id;
            contentType = 'audio';
          } else if (msg.type === 'sticker' && msg.sticker?.id) {
            mediaId = msg.sticker.id;
            contentType = 'image';
          }
          if (mediaId) {
            mediaUrl = `/api/whatsapp/media/${mediaId}`;
          }
        }

        const text = caption || (filename ? filename : (msg.text ? msg.text.body : (msg.type ? `[${msg.type}]` : '[Message]')));
        const lastMsgPreview = text || (isMedia ? `[${contentType}]` : '[Message]');

        // A. Customers
        let customerRes = await pool.query('SELECT id FROM customers WHERE phone_number = $1 OR phone_number LIKE $2', [from_number, `%${clean10}`]);
        let customerId;
        if (customerRes.rows.length === 0) {
          const newCust = await pool.query('INSERT INTO customers (phone_number, name, status) VALUES ($1, $2, $3) RETURNING id', [from_number, 'New WhatsApp Lead', 'Lead']);
          customerId = newCust.rows[0].id;
        } else {
          customerId = customerRes.rows[0].id;
        }

        // B. Contacts
        let contactRes = await pool.query('SELECT id, name FROM contacts WHERE phone = $1 OR phone LIKE $2', [from_number, `%${clean10}`]);
        let contactId;
        if (contactRes.rows.length === 0) {
          const newCt = await pool.query(
            'INSERT INTO contacts (phone, name) VALUES ($1, $2) RETURNING id',
            [from_number, 'WhatsApp User ' + clean10]
          );
          contactId = newCt.rows[0].id;
        } else {
          contactId = contactRes.rows[0].id;
        }

        // C. Conversations
        let convRes = await pool.query('SELECT id FROM conversations WHERE contact_id = $1 LIMIT 1', [contactId]);
        let conversationId;
        if (convRes.rows.length === 0) {
          const newConv = await pool.query(
            'INSERT INTO conversations (contact_id, last_message_text, last_message_at, unread_count, status) VALUES ($1, $2, NOW(), 1, $3) RETURNING id',
            [contactId, lastMsgPreview, 'open']
          );
          conversationId = newConv.rows[0].id;
        } else {
          conversationId = convRes.rows[0].id;
          await pool.query(
            'UPDATE conversations SET last_message_text = $1, last_message_at = NOW(), updated_at = NOW(), unread_count = COALESCE(unread_count, 0) + 1 WHERE id = $2',
            [lastMsgPreview, conversationId]
          );
        }

        // D. Insert message
        const msgInsertSql = `
          INSERT INTO messages (
            id, conversation_id, customer_id, sender_type, sender,
            content_type, content_text, content, media_url, message_id, status, created_at
          ) VALUES (
            gen_random_uuid(), $1, $2, 'customer', 'customer',
            $3, $4, $4, $5, $6, 'delivered', NOW()
          ) RETURNING *
        `;
        await pool.query(msgInsertSql, [conversationId, customerId, contentType, text, mediaUrl, messageId]);

        // E. Touch profile
        await pool.query(
          'UPDATE profiles SET last_whatsapp_inbound_at = NOW() WHERE phone LIKE $1 OR whatsapp LIKE $1',
          [`%${clean10}%`]
        );

        // F. Auto-Replies (OTP Hook / Session Renewal / Help)
        const lowerText = (text || '').toLowerCase().trim();
        const SUPABASE_URL = process.env.SUPABASE_URL || 'https://gmahjdzqitbomtmdzlfp.supabase.co';
        const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtYWhqZHpxaXRib210bWR6bGZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjI1MTcyNywiZXhwIjoyMDk3ODI3NzI3fQ.t0dqkLlGK0P9SwdYveBFgQDIify4UTpVGvZZeiF7Mn0';

        if (lowerText.includes('requesting otp') || lowerText.includes('request otp') || lowerText.includes('login otp') || lowerText.includes('otp for login') || lowerText.includes('login verification') || lowerText.includes('supro login')) {
          try {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpMsg = '🔐 *Your SuprO Login OTP is:* *' + otp + '*\n\nValid for 5 minutes. Enter this 6-digit code in your SuprO app to complete login. Do not share this code with anyone.';
            
            const mobileMatch = (text || '').match(/Mobile:\s*(\d{10,12})/i);
            const extractedPhone = mobileMatch ? mobileMatch[1].replace(/\D/g, '').slice(-10) : '';

            const fromClean10 = (from_number || '').replace(/\D/g, '').slice(-10);
            const phoneVariants = new Set();
            if (from_number) phoneVariants.add(from_number);
            if (fromClean10) {
              phoneVariants.add(fromClean10);
              phoneVariants.add(`91${fromClean10}`);
            }
            if (extractedPhone && extractedPhone.length === 10) {
              phoneVariants.add(extractedPhone);
              phoneVariants.add(`91${extractedPhone}`);
            }

            const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

            // 1. Save into OCI PostgreSQL whatsapp_otps for ALL phone variants
            for (const ph of phoneVariants) {
              try {
                await pool.query(
                  'INSERT INTO whatsapp_otps (phone_number, otp, expires_at) VALUES ($1, $2, $3) ON CONFLICT (phone_number) DO UPDATE SET otp = EXCLUDED.otp, expires_at = EXCLUDED.expires_at',
                  [ph, otp, expiresAt]
                );
              } catch (dbErr) {
                console.warn('[OCI OTP DB WARN]', ph, dbErr.message);
              }
            }

            // 2. Dual-sync to Supabase Cloud whatsapp_otps for ALL phone variants
            for (const ph of phoneVariants) {
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
              } catch (sbOtpErr) {
                console.warn('[SUPABASE OTP SYNC WARN]', ph, sbOtpErr.message);
              }
            }

            // Dual-sync touch profile in Supabase Cloud
            try {
              await axios.patch(`${SUPABASE_URL}/rest/v1/profiles?or=(phone.ilike.*${clean10}*,whatsapp.ilike.*${clean10}*)`, {
                last_whatsapp_inbound_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }, {
                headers: {
                  'apikey': SUPABASE_KEY,
                  'Authorization': `Bearer ${SUPABASE_KEY}`,
                  'Content-Type': 'application/json',
                  'Prefer': 'return=minimal'
                },
                timeout: 4000
              });
            } catch (_) {}

            await sendWhatsAppMessage(from_number, otpMsg);
            if (extractedPhone && `91${extractedPhone}` !== from_number && extractedPhone !== from_number) {
              await sendWhatsAppMessage(`91${extractedPhone}`, otpMsg);
            }

            await pool.query(
              'INSERT INTO messages (id, conversation_id, customer_id, sender_type, sender, content_type, content_text, content, status, created_at) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW())',
              [conversationId, customerId, 'agent', 'agent', 'text', otpMsg, otpMsg, 'sent']
            );
          } catch (otpErr) {
            console.error('[OTP AUTO-REPLY ERROR]', otpErr.message);
          }
        } else if (lowerText.includes('keep-alive') || lowerText.includes('24h') || lowerText.includes('renew') || lowerText.includes('daily sync') || lowerText.includes('notification window')) {
          try {
            const renewalMsg = `✅ SuprO 24-Hour Active Session is renewed! 🎉\n\nYou now have full real-time access to RideO, RentO, Agro, and DriveO updates for the next 24 hours.`;
            await sendWhatsAppMessage(from_number, renewalMsg);
            await pool.query(
              'INSERT INTO messages (id, conversation_id, customer_id, sender_type, sender, content_type, content_text, content, status, created_at) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW())',
              [conversationId, customerId, 'agent', 'agent', 'text', renewalMsg, renewalMsg, 'sent']
            );

            // Dual-sync touch profile in Supabase Cloud
            try {
              await axios.patch(`${SUPABASE_URL}/rest/v1/profiles?or=(phone.ilike.*${clean10}*,whatsapp.ilike.*${clean10}*)`, {
                last_whatsapp_inbound_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }, {
                headers: {
                  'apikey': SUPABASE_KEY,
                  'Authorization': `Bearer ${SUPABASE_KEY}`,
                  'Content-Type': 'application/json',
                  'Prefer': 'return=minimal'
                },
                timeout: 4000
              });
            } catch (_) {}
          } catch (autoErr) {
            console.error('[AUTO-REPLY ERROR]', autoErr.message);
          }
        } else if (lowerText === 'help' || lowerText === 'menu' || lowerText === 'start' || lowerText === '/help' || lowerText === '/start') {
          try {
            const appDownloadUrl = 'https://mysupro-cdn.duckdns.org/apk/supro-app.apk';
            const autoReply = `🙏 *வணக்கம்! Welcome to SuprO!* 🚀\n\n` +
              `Download our SuprO App now:\n📱 ${appDownloadUrl}\n\n` +
              `*Features:*\n` +
              `🚗 RideO - Book rides instantly\n` +
              `🛒 DealO - Buy & sell locally\n` +
              `🚜 RentO - Rent machinery\n` +
              `👥 GroupO - Self-help group ledgers\n` +
              `📚 TutO - Free education & exams\n\n` +
              `Type *HELP* for more options.`;
            await sendWhatsAppMessage(from_number, autoReply);
            await pool.query(
              'INSERT INTO messages (id, conversation_id, customer_id, sender_type, sender, content_type, content_text, content, status, created_at) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW())',
              [conversationId, customerId, 'agent', 'agent', 'text', autoReply, autoReply, 'sent']
            );
          } catch (autoErr) {
            console.error('[AUTO-REPLY ERROR]', autoErr.message);
          }
        }
      }
      res.status(200).send('EVENT_RECEIVED');
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error('[WEBHOOK ERROR]', error);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
