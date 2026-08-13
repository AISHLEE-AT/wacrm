const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

async function main() {
  const supabaseUrl = 'https://gmahjdzqitbomtmdzlfp.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtYWhqZHpxaXRib210bWR6bGZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjI1MTcyNywiZXhwIjoyMDk3ODI3NzI3fQ.t0dqkLlGK0P9SwdYveBFgQDIify4UTpVGvZZeiF7Mn0';
  const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

  console.log('Reading APK...');
  const apkPath = 'D:\\w\\apps\\mobile\\android\\app\\build\\outputs\\apk\\release\\app-release.apk';
  const fileData = fs.readFileSync(apkPath);
  const fileName = 'app-release-' + Date.now() + '.apk';

  console.log('Ensuring apks bucket exists...');
  await supabase.storage.createBucket('apks', { public: true, allowedMimeTypes: ['application/vnd.android.package-archive', 'application/octet-stream'] }).catch(() => {});

  console.log('Uploading to Supabase...');
  const { data, error } = await supabase.storage.from('apks').upload(fileName, fileData, {
    contentType: 'application/vnd.android.package-archive',
    upsert: true
  });

  if (error) {
    console.error('Upload error:', error);
    return;
  }

  const { data: publicData } = supabase.storage.from('apks').getPublicUrl(fileName);
  const publicUrl = publicData.publicUrl;
  console.log('Public URL:', publicUrl);

  const metaAccessToken = 'EAAThhdMQWFQBR54BIWg92CExIcrSuq9ZCZC4pnFBxSAbkC3TU5Og71RcpJWMMZBm0kkD8CH0w4BgZCqIDX42zxmKGu4YSQLyXNIksHS76cCCHBJQkAPXZA5cHohEhLV6eBJ5b1BGJkpuf4zcXtCfoKaUPJPf94ALgASoRadKMZA4L2EZBaT3BxcFA62It0NwwZDZD';
  const phoneNumberId = '1213113635214047';
  const toPhone = '918248818077';

  const body = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: toPhone,
    type: 'document',
    document: {
      link: publicUrl,
      filename: 'SuproApp.apk'
    }
  };

  console.log('Sending via Meta API...');
  const res = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${metaAccessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const resJson = await res.json();
  console.log('Meta API Response:', JSON.stringify(resJson, null, 2));
  
  const waMessageId = resJson.messages?.[0]?.id || 'unknown';

  console.log('Inserting into CRM database...');
  const conversation_id = '03026f26-c9c2-45c8-80ec-3feebeaa8019';
  await supabase.from('messages').insert({
    conversation_id,
    sender_type: 'agent',
    content_type: 'document',
    content_text: 'Here is the latest APK build.',
    media_url: publicUrl,
    message_id: waMessageId,
    status: 'sent'
  });

  await supabase.from('conversations').update({
    last_message_text: '[document]',
    last_message_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq('id', conversation_id);
  
  console.log('Successfully added to CRM Inbox!');
}

main().catch(console.error);
