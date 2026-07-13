require('dotenv').config({path: '.env'});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
(async () => {
  const waba_id = '1370739925032027';
  const token = process.env.META_ACCESS_TOKEN;
  const res = await fetch(`https://graph.facebook.com/v21.0/${waba_id}/message_templates?limit=100&fields=id,name,language,status`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  console.log('Meta Templates:', JSON.stringify(data.data ? data.data.map(t => ({name: t.name, status: t.status})) : data, null, 2));

  const { data: dbTemplates } = await supabase.from('message_templates').select('name, status, account_id');
  console.log('DB Templates:', JSON.stringify(dbTemplates, null, 2));
})();
