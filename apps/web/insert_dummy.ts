import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data, error } = await supabase.from('drivers').insert([
    {
      user_id: '00000000-0000-0000-0000-000000000001',
      status: 'online',
      vehicle_type: 'car',
      vehicle_registration: 'TN01AB1234',
      is_verified: true,
      mobile_number: '9876543210',
      lat: 13.0850,
      lng: 80.2700,
      name: 'Dummy Car Driver'
    },
    {
      user_id: '00000000-0000-0000-0000-000000000002',
      status: 'online',
      vehicle_type: 'bike',
      vehicle_registration: 'TN02CD5678',
      is_verified: true,
      mobile_number: '9876543211',
      lat: 13.0800,
      lng: 80.2750,
      name: 'Dummy Bike Driver'
    }
  ]);
  console.log('Error:', error);
  console.log('Data:', data);
}
run();
