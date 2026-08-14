import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gmahjdzqitbomtmdzlfp.supabase.co';
const SUPABASE_SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtYWhqZHpxaXRib210bWR6bGZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjI1MTcyNywiZXhwIjoyMDk3ODI3NzI3fQ.t0dqkLlGK0P9SwdYveBFgQDIify4UTpVGvZZeiF7Mn0';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

async function triggerLiveIncomingRide() {
  console.log('========================================================');
  console.log('🚗 CREATING LIVE INCOMING RIDE FOR DRIVER 9123596988 🚗');
  console.log('========================================================\n');

  // 1. Fetch real rider profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, location, latitude, longitude')
    .ilike('phone', '%8248818077%')
    .maybeSingle();

  const riderName = profile?.full_name || 'Rideo';
  const riderPhone = '918248818077';
  
  const pickupAddress = profile?.location || 'Karimalapadi, Tamil Nadu, India';
  const dropoffAddress = 'Thanjavur Old Bus Stand, Tamil Nadu';
  const pickupLat = profile?.latitude || 12.2207;
  const pickupLng = profile?.longitude || 78.7194;
  const dropLat = 10.7867;
  const dropLng = 79.1378;
  const fare = 85;
  const distanceKm = 4.2;
  const otp = String(1000 + Math.floor(Math.random() * 9000));

  // 2. Find and set Driver to 'online'
  const { data: driverRows } = await supabase
    .from('drivers')
    .select('id, name, phone, mobile_number, status')
    .or('phone.ilike.%9123596988%,mobile_number.ilike.%9123596988%,whatsapp_number.ilike.%9123596988%')
    .limit(1);

  let driverId = driverRows && driverRows.length > 0 ? driverRows[0].id : '003f2fcb-9766-4405-a387-b59851871991';
  
  // Make sure driver is marked online
  await supabase.from('drivers').update({ status: 'online', is_online: true }).eq('id', driverId);
  console.log(`✅ Set Driver (${driverId}) status to 'online'`);

  // 3. Insert Live Pending Ride
  const { data: newRide, error } = await supabase
    .from('rides')
    .insert({
      passenger_name: riderName,
      passenger_phone: riderPhone,
      driver_id: driverId,
      pickup_location: { lat: pickupLat, lng: pickupLng, address: pickupAddress },
      drop_location: { lat: dropLat, lng: dropLng, address: dropoffAddress, distance_km: distanceKm },
      vehicle_category: 'autoo',
      vehicle_type: 'auto',
      fare: fare,
      total_fare: fare,
      status: 'pending',
      otp: otp,
      payment_mode: 'upi',
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating pending ride:', error.message);
    return;
  }

  console.log(`\n🎉 SUCCESS! Active Pending Ride is now LIVE in Supabase:`);
  console.log(`- Ride ID: ${newRide.id}`);
  console.log(`- Status: ${newRide.status}`);
  console.log(`- Passenger: ${newRide.passenger_name} (${newRide.passenger_phone})`);
  console.log(`- Pickup: ${pickupAddress}`);
  console.log(`- Drop-off: ${dropoffAddress}`);
  console.log(`- Fare: ₹${fare}`);
  console.log(`- Rider OTP (Private): ${otp}`);
  console.log(`\n👉 Driver 9123596988 opening DriveO will see this live popup right now!`);
}

triggerLiveIncomingRide();
