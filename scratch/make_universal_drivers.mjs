import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gmahjdzqitbomtmdzlfp.supabase.co';
const SUPABASE_SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtYWhqZHpxaXRib210bWR6bGZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjI1MTcyNywiZXhwIjoyMDk3ODI3NzI3fQ.t0dqkLlGK0P9SwdYveBFgQDIify4UTpVGvZZeiF7Mn0';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

async function makeUniversalDrivers() {
  await supabase
    .from('drivers')
    .update({
      vehicle_type: 'all',
      status: 'online',
      is_online: true,
      is_verified: true,
      verification_status: 'approved'
    })
    .or('phone.ilike.%9123596988%,mobile_number.ilike.%9123596988%,phone.ilike.%8248818077%,mobile_number.ilike.%8248818077%');

  console.log('✅ Driver records for 9123596988 updated to vehicle_type: "all" and status: "online"!');
}

makeUniversalDrivers();
