import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gmahjdzqitbomtmdzlfp.supabase.co';
const SUPABASE_SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtYWhqZHpxaXRib210bWR6bGZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjI1MTcyNywiZXhwIjoyMDk3ODI3NzI3fQ.t0dqkLlGK0P9SwdYveBFgQDIify4UTpVGvZZeiF7Mn0';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

async function findTargetDrivers() {
  const { data: d1 } = await supabase.from('drivers').select('*').or('phone.ilike.%9123596988%,mobile_number.ilike.%9123596988%,whatsapp_number.ilike.%9123596988%');
  console.log('Driver with 9123596988:', d1);

  const { data: d2 } = await supabase.from('drivers').select('*').or('phone.ilike.%8248818077%,mobile_number.ilike.%8248818077%,whatsapp_number.ilike.%8248818077%');
  console.log('Driver with 8248818077:', d2);

  const { data: d3 } = await supabase.from('drivers').select('*').or('phone.ilike.%6381029380%,mobile_number.ilike.%6381029380%,whatsapp_number.ilike.%6381029380%');
  console.log('Driver with 6381029380:', d3);
}

findTargetDrivers();
