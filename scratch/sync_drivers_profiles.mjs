import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: 'D:\\w\\apps\\web\\.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function syncAndDeduplicate() {
  console.log('Cleaning up duplicate driver rows and syncing real names...');

  // 1. Get profile for 9123596988
  const { data: prof1 } = await supabase
    .from('profiles')
    .select('id, full_name, phone')
    .or('phone.ilike.%9123596988%,whatsapp.ilike.%9123596988%')
    .maybeSingle();

  const realName1 = prof1?.full_name || 'RAJA-D';

  // Delete older legacy test driver row
  await supabase
    .from('drivers')
    .delete()
    .eq('id', '003f2fcb-9766-4405-a387-b59851871991');

  // Update remaining driver row for 9123596988
  await supabase
    .from('drivers')
    .update({
      name: realName1,
      user_id: prof1?.id || '6d4d9aba-9dbe-4395-a6b9-7dcec3c06152',
      phone: '919123596988',
      mobile_number: '919123596988',
      whatsapp_number: '919123596988',
      vehicle_type: 'all',
      vehicle_model: 'Swift Dzire (TN 49 AZ 7788)',
      vehicle_number: 'TN 49 AZ 7788',
      status: 'online'
    })
    .eq('id', '842cfd72-0d94-4ac3-b3e0-f254d267443a');

  // 2. Sync profile and driver for 9486335870
  await supabase
    .from('profiles')
    .update({
      full_name: 'Admin-RAJA',
      role: 'admin',
      main_category: 'Admin'
    })
    .or('phone.ilike.%9486335870%,whatsapp.ilike.%9486335870%');

  await supabase
    .from('drivers')
    .update({
      name: 'Admin-RAJA',
      phone: '919486335870',
      mobile_number: '919486335870',
      whatsapp_number: '919486335870',
      vehicle_type: 'all',
      vehicle_model: 'Innova Crysta (TN 49 AZ 9999)',
      vehicle_number: 'TN 49 AZ 9999',
      status: 'online'
    })
    .eq('id', '44cfe9ef-74b8-4c4c-908d-fb4a14d4c995');

  console.log('Sync complete! Checking updated drivers table:');
  const { data: updatedDrivers } = await supabase.from('drivers').select('*');
  console.log(JSON.stringify(updatedDrivers, null, 2));
}

syncAndDeduplicate();
