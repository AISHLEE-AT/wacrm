import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: 'D:\\w\\apps\\web\\.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspect() {
  console.log('--- PROFILES ---');
  const { data: profs } = await supabase
    .from('profiles')
    .select('id, full_name, phone, whatsapp, role, main_category, upi_id, location')
    .or('phone.ilike.%9123596988%,phone.ilike.%9486335870%,whatsapp.ilike.%9123596988%,whatsapp.ilike.%9486335870%');
  console.log(JSON.stringify(profs, null, 2));

  console.log('--- DRIVERS ---');
  const { data: drivers } = await supabase
    .from('drivers')
    .select('id, user_id, name, phone, mobile_number, whatsapp_number, vehicle_type, vehicle_model, vehicle_number, status')
    .or('phone.ilike.%9123596988%,phone.ilike.%9486335870%,mobile_number.ilike.%9123596988%,mobile_number.ilike.%9486335870%,whatsapp_number.ilike.%9123596988%,whatsapp_number.ilike.%9486335870%');
  console.log(JSON.stringify(drivers, null, 2));

  console.log('--- RECENT RIDES ---');
  const { data: rides } = await supabase
    .from('rides')
    .select('id, created_at, passenger_name, passenger_phone, driver_id, vehicle_category, fare, status, otp')
    .order('created_at', { ascending: false })
    .limit(5);
  console.log(JSON.stringify(rides, null, 2));
}

inspect();
