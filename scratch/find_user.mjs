import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gmahjdzqitbomtmdzlfp.supabase.co';
const SUPABASE_SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtYWhqZHpxaXRib210bWR6bGZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjI1MTcyNywiZXhwIjoyMDk3ODI3NzI3fQ.t0dqkLlGK0P9SwdYveBFgQDIify4UTpVGvZZeiF7Mn0';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

async function findUserProfile() {
  const { data: p1 } = await supabase.from('profiles').select('*').ilike('phone', '%8248818077%');
  console.log('Profiles by phone:', p1);

  const { data: p2 } = await supabase.from('contacts').select('*').ilike('phone', '%8248818077%');
  console.log('Contacts by phone:', p2);

  const { data: p3 } = await supabase.from('drivers').select('*').ilike('phone', '%8248818077%');
  console.log('Drivers by phone:', p3);

  const { data: p4 } = await supabase.from('rides').select('*').ilike('passenger_phone', '%8248818077%').limit(2);
  console.log('Rides by phone:', p4);
}

findUserProfile();
