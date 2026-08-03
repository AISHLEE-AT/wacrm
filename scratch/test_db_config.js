const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/web/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data: config, error: cfgErr } = await supabase.from('whatsapp_config').select('*');
  console.log('WhatsApp Config rows:', config, cfgErr);

  const { data: otps, error: otpErr } = await supabase.from('whatsapp_otps').select('*').limit(5);
  console.log('WhatsApp OTPs rows:', otps, otpErr);
}

check();
