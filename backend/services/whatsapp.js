const axios = require('axios');
const multer = require('multer');

const upload = multer({
  limits: { fileSize: 30 * 1024 * 1024 }, // 30 MB max
  storage: multer.memoryStorage()
});

const sendWhatsAppMessage = async (to, message, options = {}) => {
  const token = process.env.META_ACCESS_TOKEN;
  const phoneId = process.env.META_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    console.warn('[WHATSAPP] Meta API keys missing in environment!');
    return { success: false, error: 'Meta API keys missing in environment' };
  }

  // Ensure 'to' number is digits only
  const cleanTo = (to || '').replace('+', '').replace(/\D/g, '');

  let payload = {
    messaging_product: 'whatsapp',
    to: cleanTo,
  };

  if (options.templateName) {
    payload.type = 'template';
    payload.template = {
      name: options.templateName,
      language: { code: options.templateLang || 'en_US' },
    };
    if (options.components && Array.isArray(options.components)) {
      payload.template.components = options.components;
    }
  } else if (options.mediaKind && options.mediaUrl) {
    // Media message (image/video/document/audio)
    payload.type = options.mediaKind;
    const media = { link: options.mediaUrl };
    if (options.mediaKind !== 'audio' && message) media.caption = message;
    if (options.mediaKind === 'document' && options.filename) media.filename = options.filename;
    payload[options.mediaKind] = media;
  } else {
    payload.type = 'text';
    payload.text = { body: message || '' };
  }

  try {
    const response = await axios({
      method: 'POST',
      url: `https://graph.facebook.com/v21.0/${phoneId}/messages`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: payload,
      timeout: 12000
    });
    const messageId = response.data?.messages?.[0]?.id || null;
    console.log(`[WHATSAPP SUCCESS] Message sent to ${cleanTo} (id: ${messageId}):`, response.data);
    return { success: true, messageId, data: response.data };
  } catch (error) {
    const errorData = error.response?.data || error.message;
    console.error(`[WHATSAPP ERROR] Failed to send to ${cleanTo}:`, errorData);
    return { success: false, error: errorData };
  }
};

module.exports = {
  upload,
  sendWhatsAppMessage,
};
