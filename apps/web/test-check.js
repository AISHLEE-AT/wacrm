const { createClient } = require('@supabase/supabase-js');
const admin = createClient(
  'https://gmahjdzqitbomtmdzlfp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtYWhqZHpxaXRib210bWR6bGZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjI1MTcyNywiZXhwIjoyMDk3ODI3NzI3fQ.t0dqkLlGK0P9SwdYveBFgQDIify4UTpVGvZZeiF7Mn0'
);

async function run() {
  const phone = '9123596988';
  const { data, error } = await admin
      .from('profiles')
      .select('id, full_name, main_category, role, pin_hash')
      .or(`phone.eq.${phone},phone.eq.91${phone},whatsapp.eq.${phone},whatsapp.eq.91${phone}`)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
  console.log('Result:', data, error);
}
run();
