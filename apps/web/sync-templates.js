require('dotenv').config({path: '.env'});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
(async () => {
  const waba_id = '1370739925032027';
  const token = process.env.META_ACCESS_TOKEN;
  const res = await fetch(`https://graph.facebook.com/v21.0/${waba_id}/message_templates?limit=100&fields=id,name,language,status,category,components`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  const templates = data.data || [];
  
  const account_id = '37afac54-b0a2-45b1-bd73-920aebfec2da'; // Aishlee Technology
  
  for (const t of templates) {
    const { error } = await supabase.from('message_templates').upsert({
      meta_template_id: t.id,
      account_id: account_id,
      name: t.name,
      language: t.language,
      status: t.status,
      category: t.category,
      components: t.components
    }, { onConflict: 'meta_template_id' });
    if (error) console.error('Error inserting', t.name, error);
    else console.log('Inserted', t.name);
  }
  console.log('Done!');
})();
