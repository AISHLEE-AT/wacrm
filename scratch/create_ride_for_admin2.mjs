import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gmahjdzqitbomtmdzlfp.supabase.co';
const SUPABASE_SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtYWhqZHpxaXRib210bWR6bGZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjI1MTcyNywiZXhwIjoyMDk3ODI3NzI3fQ.t0dqkLlGK0P9SwdYveBFgQDIify4UTpVGvZZeiF7Mn0';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

async function createRideForAdmin2() {
  const driverId = '842cfd72-0d94-4ac3-b3e0-f254d267443a';
  const riderPhone = '918248818077';
  const riderName = 'Rideo';
  const otp = String(1000 + Math.floor(Math.random() * 9000));

  // Cancel any old pending rides
  await supabase.from('rides').update({ status: 'cancelled' }).eq('status', 'pending');

  // Insert targeted pending ride for admin2
  const { data: newRide, error } = await supabase
    .from('rides')
    .insert({
      passenger_name: riderName,
      passenger_phone: riderPhone,
      driver_id: driverId,
      pickup_location: { lat: 12.2215995, lng: 78.7132961, address: 'Karimalapadi, Tamil Nadu, India' },
      drop_location: { lat: 10.7867, lng: 79.1378, address: 'Thanjavur Old Bus Stand, Tamil Nadu', distance_km: 3.8 },
      vehicle_category: 'truck',
      vehicle_type: 'truck',
      fare: 85,
      total_fare: 85,
      status: 'pending',
      otp: otp,
      payment_mode: 'upi',
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Error inserting ride:', error.message);
    return;
  }

  console.log('========================================================');
  console.log('✅ LIVE PENDING RIDE CREATED FOR ADMIN2!');
  console.log('========================================================');
  console.log(`- Ride ID: ${newRide.id}`);
  console.log(`- Driver ID: ${newRide.driver_id}`);
  console.log(`- Status: ${newRide.status}`);
  console.log(`- Passenger: ${newRide.passenger_name} (${newRide.passenger_phone})`);
  console.log(`- Pickup: Karimalapadi, Tamil Nadu`);
  console.log(`- Drop-off: Thanjavur Old Bus Stand`);
  console.log(`- Fare: ₹85`);
}

createRideForAdmin2();
