const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../web/.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function runTest() {
  console.log('--- Starting Flow Test ---');
  
  // 1. Fetch a driver
  const { data: drivers } = await supabase.from('drivers').select('*').limit(1);
  if (!drivers || drivers.length === 0) {
    console.log('No online drivers found.');
    return;
  }
  const driver = drivers[0];
  console.log('Found Driver:', driver.name, driver.phone);

  // 2. Simulate passenger inserting a ride
  console.log('\n[PASSENGER] Creating new ride request...');
  const { data: ride, error: insertError } = await supabase.from('rides').insert({
    passenger_phone: '919123596988',
    driver_id: driver.id,
    vehicle_type: driver.vehicle_type,
    fare: 150,
    status: 'pending',
    payment_mode: 'upi',
    pickup_location: 'Test Pickup, Coimbatore',
    drop_location: 'Test Dropoff, Airport'
  }).select().single();

  if (insertError) {
    console.error('Failed to create ride:', insertError);
    return;
  }
  console.log('Ride created with ID:', ride.id);

  // 3. Simulate calling the request-driver API (Meta WhatsApp Integration)
  console.log('\n[PASSENGER] Triggering Meta WhatsApp notification via API...');
  try {
    const res = await fetch(`http://localhost:3000/api/ride/request-driver`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ride_id: ride.id,
        driver_phone: driver.phone || driver.mobile_number,
        pickup_address: ride.pickup_location,
        dropoff_address: ride.drop_location,
        distance_km: '10',
        estimated_fare: ride.fare,
        driver_name: driver.name,
        driver_rating: driver.rating || '4.5',
        vehicle_info: driver.vehicle_type
      })
    });
    const text = await res.text();
    console.log('API Response Status:', res.status);
    console.log('API Response:', text);
  } catch (err) {
    console.log('Failed to call API, is the local server running? Skipping WhatsApp notification...');
  }

  // 4. Simulate driver receiving it via real-time and accepting
  console.log('\n[DRIVER] Accepting ride and generating OTP...');
  const tripOtp = String(1000 + Math.floor(Math.random() * 9000));
  
  const { data: updatedRide, error: updateError } = await supabase.from('rides').update({
    status: 'accepted',
    otp: tripOtp
  }).eq('id', ride.id).select().single();

  if (updateError) {
    console.error('Failed to update ride:', updateError);
    return;
  }
  
  console.log('Ride successfully accepted!');
  console.log('Generated OTP for trip:', updatedRide.otp);
  console.log('Final Ride State:', updatedRide.status);
  console.log('--- Test Complete ---');
}

runTest();
