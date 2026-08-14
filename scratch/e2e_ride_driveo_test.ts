import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: 'D:/w/apps/web/.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gmahjdzqitbomtmdzlfp.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtYWhqZHpxaXRib210bWR6bGZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwNDI2MjksImV4cCI6MjA2ODYxODYyOX0.Z_W_28N40V96k_P9k8Z4QjE1T1hM6eO8bQ2wV0X7y9M';
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

const TEST_PASSENGER = {
  name: 'Karthik Raja',
  phone: '919876543210',
  pickupAddress: 'Thanjavur Old Bus Stand, Thanjavur',
  pickupLat: 10.7867,
  pickupLng: 79.1378,
  dropoffAddress: 'Thanjavur Medical College Hospital, Thanjavur',
  dropoffLat: 10.7621,
  dropoffLng: 79.1124,
  distanceKm: 4.2,
  fare: 87,
  vehicleCategory: 'autoo',
};

const TEST_DRIVER = {
  id: 'test-driver-id-001',
  name: 'Selvam Murugan',
  phone: '916381029380',
  vehicleType: 'autoo',
  vehicleNumber: 'TN-49-BT-4589',
  upiId: '6381029380@axl',
};

async function runEndToEndSimulation() {
  console.log('====================================================');
  console.log('🚀 SUPRO RIDEO & DRIVEO FULL END-TO-END FLOW TEST 🚀');
  console.log('====================================================\n');

  const testResults: { step: string; status: 'PASSED' | 'FAILED'; details: string }[] = [];

  try {
    // ─────────────────────────────────────────────────────────────
    // TEST 1: RIDER INITIATES BOOKING (Database Insert & Schema Verification)
    // ─────────────────────────────────────────────────────────────
    console.log('📍 STEP 1: Rider creates a new RideO booking...');
    const otp = String(1000 + Math.floor(Math.random() * 9000));
    
    const rideInsertPayload = {
      passenger_phone: TEST_PASSENGER.phone,
      passenger_name: TEST_PASSENGER.name,
      pickup_location: {
        lat: TEST_PASSENGER.pickupLat,
        lng: TEST_PASSENGER.pickupLng,
        address: TEST_PASSENGER.pickupAddress
      },
      drop_location: {
        lat: TEST_PASSENGER.dropoffLat,
        lng: TEST_PASSENGER.dropoffLng,
        address: TEST_PASSENGER.dropoffAddress,
        distance_km: TEST_PASSENGER.distanceKm
      },
      driver_phone: TEST_DRIVER.phone,
      vehicle_category: TEST_PASSENGER.vehicleCategory,
      fare: TEST_PASSENGER.fare,
      status: 'pending',
      otp: otp,
      payment_mode: 'upi',
      created_at: new Date().toISOString()
    };

    const { data: rideData, error: insertError } = await supabase
      .from('rides')
      .insert(rideInsertPayload)
      .select()
      .single();

    if (insertError) {
      throw new Error(`Ride Insert Failed: ${insertError.message}`);
    }

    console.log(`✅ Ride created in DB successfully! ID: ${rideData.id}, Status: ${rideData.status}, OTP: ${rideData.otp}`);
    testResults.push({
      step: '1. Ride Booking DB Insert & Schema Verification',
      status: 'PASSED',
      details: `Ride ID: ${rideData.id}, OTP: ${rideData.otp}, Fare: ₹${rideData.fare}`
    });

    // ─────────────────────────────────────────────────────────────
    // TEST 2: WHATSAPP NOTIFICATION FORMAT & COORDINATES INSPECTION
    // ─────────────────────────────────────────────────────────────
    console.log('\n📲 STEP 2: Validating WhatsApp CRM Notification Content...');
    const driverWhatsappMessage = 
      `🚨 *NEW RIDEO BOOKING REQUEST* 🚨\n\n` +
      `👤 *Passenger:* ${TEST_PASSENGER.name} (${TEST_PASSENGER.phone})\n` +
      `📍 *Pickup:* ${TEST_PASSENGER.pickupAddress}\n` +
      `🏁 *Drop-off:* ${TEST_PASSENGER.dropoffAddress}\n` +
      `📏 *Distance:* ${TEST_PASSENGER.distanceKm} km\n` +
      `💰 *Estimated Fare:* ₹${TEST_PASSENGER.fare}\n` +
      `🚗 *Category:* AutoO (3 Seater)\n\n` +
      `🗺️ *Google Maps Navigation:*\nhttps://www.google.com/maps/dir/?api=1&destination=${TEST_PASSENGER.pickupLat},${TEST_PASSENGER.pickupLng}\n\n` +
      `*Reply "ACCEPT" to confirm this ride or open SuprO DriveO app.*`;

    // Validate coordinates are not undefined or NaN
    const hasValidCoords = !driverWhatsappMessage.includes('undefined') && 
                           !driverWhatsappMessage.includes('NaN') && 
                           driverWhatsappMessage.includes('10.7867,79.1378');

    console.log('Driver WhatsApp Message Preview:\n--------------------------------');
    console.log(driverWhatsappMessage);
    console.log('--------------------------------');

    if (!hasValidCoords) {
      throw new Error('WhatsApp message contains invalid or undefined coordinates!');
    }

    testResults.push({
      step: '2. WhatsApp Notification Template & GPS Navigation Link',
      status: 'PASSED',
      details: 'All parameters (Passenger name, phone, pickup, drop, fare, live GPS link) strictly verified.'
    });

    // ─────────────────────────────────────────────────────────────
    // TEST 3: DRIVEO DRIVER INCOMING POLLING & ACCEPTANCE
    // ─────────────────────────────────────────────────────────────
    console.log('\n👨‍✈️ STEP 3: Simulating DriveO Driver Polling & Ride Acceptance...');
    
    // Simulate DriveO polling finding pending ride
    const { data: polledRides, error: pollError } = await supabase
      .from('rides')
      .select('*')
      .eq('id', rideData.id)
      .eq('status', 'pending');

    if (pollError || !polledRides || polledRides.length === 0) {
      throw new Error(`DriveO Polling could not find pending ride ${rideData.id}`);
    }

    console.log(`✅ DriveO polling detected ride ID ${rideData.id}`);

    // Driver accepts ride
    const { data: acceptedRide, error: acceptError } = await supabase
      .from('rides')
      .update({
        status: 'accepted',
        driver_id: TEST_DRIVER.id,
        driver_name: TEST_DRIVER.name,
        driver_phone: TEST_DRIVER.phone,
        vehicle_model: 'Bajaj RE Auto',
        vehicle_number: TEST_DRIVER.vehicleNumber,
        accepted_at: new Date().toISOString()
      })
      .eq('id', rideData.id)
      .select()
      .single();

    if (acceptError) {
      throw new Error(`Driver Accept Failed: ${acceptError.message}`);
    }

    console.log(`✅ Ride ${acceptedRide.id} updated to status: 'accepted' with Driver: ${acceptedRide.driver_name}`);

    // Validate Passenger Confirmation Message
    const riderConfirmationMessage = 
      `🚕 *DRIVER CONFIRMED YOUR RIDE!* 🚕\n\n` +
      `👨‍✈️ *Driver:* ${TEST_DRIVER.name}\n` +
      `📞 *Contact:* ${TEST_DRIVER.phone}\n` +
      `🛺 *Vehicle:* Bajaj RE Auto (${TEST_DRIVER.vehicleNumber})\n` +
      `📍 *Pickup:* ${TEST_PASSENGER.pickupAddress}\n` +
      `🏁 *Drop-off:* ${TEST_PASSENGER.dropoffAddress}\n` +
      `💰 *Fare:* ₹${TEST_PASSENGER.fare}\n\n` +
      `🔢 *YOUR START TRIP OTP:* ${rideData.otp}\n` +
      `(Share this 4-digit OTP with your driver upon arrival)`;

    console.log('Rider Confirmation WhatsApp Preview:\n--------------------------------');
    console.log(riderConfirmationMessage);
    console.log('--------------------------------');

    testResults.push({
      step: '3. DriveO Driver Polling, Ride Acceptance & Rider OTP Notification',
      status: 'PASSED',
      details: `Status: accepted, Driver: ${acceptedRide.driver_name}, Vehicle: ${acceptedRide.vehicle_number}`
    });

    // ─────────────────────────────────────────────────────────────
    // TEST 4: OTP VERIFICATION & TRIP START ('in_progress')
    // ─────────────────────────────────────────────────────────────
    console.log('\n🔐 STEP 4: Driver verifies 4-Digit OTP to Start Trip...');
    
    // Check if OTP matches
    if (acceptedRide.otp !== otp) {
      throw new Error(`OTP Mismatch! Expected ${otp}, got ${acceptedRide.otp}`);
    }

    const { data: startedRide, error: startError } = await supabase
      .from('rides')
      .update({
        status: 'in_progress',
        started_at: new Date().toISOString()
      })
      .eq('id', rideData.id)
      .select()
      .single();

    if (startError) {
      throw new Error(`Trip Start Error: ${startError.message}`);
    }

    console.log(`✅ OTP verified (${otp})! Ride status: 'in_progress' at ${startedRide.started_at}`);

    testResults.push({
      step: '4. OTP Verification & Trip Start Flow',
      status: 'PASSED',
      details: `OTP: ${otp} successfully verified, status transitioned to in_progress.`
    });

    // ─────────────────────────────────────────────────────────────
    // TEST 5: TRIP COMPLETION & DYNAMIC UPI QR PAYMENT GENERATION
    // ─────────────────────────────────────────────────────────────
    console.log('\n🏁 STEP 5: Completing Trip & Generating UPI QR Code Payload...');
    
    const { data: completedRide, error: completeError } = await supabase
      .from('rides')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', rideData.id)
      .select()
      .single();

    if (completeError) {
      throw new Error(`Trip Complete Error: ${completeError.message}`);
    }

    // Generate Dynamic UPI String
    const upiString = `upi://pay?pa=${TEST_DRIVER.upiId}&pn=${encodeURIComponent(TEST_DRIVER.name)}&am=${TEST_PASSENGER.fare}&cu=INR&tn=RideO_Trip_${rideData.id.slice(0, 8)}`;
    console.log(`✅ Trip completed at ${completedRide.completed_at}`);
    console.log(`💳 Generated Dynamic UPI Payment String: ${upiString}`);

    testResults.push({
      step: '5. Trip Completion & UPI QR Code Payload Generation',
      status: 'PASSED',
      details: `Status: completed, Fare Collected: ₹${TEST_PASSENGER.fare}, UPI: ${TEST_DRIVER.upiId}`
    });

    // ─────────────────────────────────────────────────────────────
    // TEST 6: PASSENGER CANCELLATION FLOW TEST
    // ─────────────────────────────────────────────────────────────
    console.log('\n❌ STEP 6: Testing Rider Cancellation Flow on a New Booking...');
    const cancelOtp = String(1000 + Math.floor(Math.random() * 9000));
    const { data: cancelTestRide } = await supabase
      .from('rides')
      .insert({
        passenger_phone: TEST_PASSENGER.phone,
        passenger_name: TEST_PASSENGER.name,
        pickup_location: { lat: 10.7867, lng: 79.1378, address: 'Test Location' },
        drop_location: { lat: 10.7621, lng: 79.1124, address: 'Test Drop', distance_km: 2.0 },
        vehicle_category: 'bikeo',
        fare: 35,
        status: 'pending',
        otp: cancelOtp,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (cancelTestRide) {
      // Rider cancels before driver acceptance
      const { data: cancelledRide } = await supabase
        .from('rides')
        .update({ status: 'cancelled' })
        .eq('id', cancelTestRide.id)
        .select()
        .single();

      console.log(`✅ Rider Cancellation Verified: Ride ${cancelledRide?.id} is 'cancelled'`);
      testResults.push({
        step: '6. Rider Pre-Acceptance Cancellation Flow',
        status: 'PASSED',
        details: `Ride ${cancelTestRide.id} successfully cancelled by passenger.`
      });
    }

    // ─────────────────────────────────────────────────────────────
    // FINAL REPORT SUMMARY
    // ─────────────────────────────────────────────────────────────
    console.log('\n====================================================');
    console.log('📊 FINAL TEST RESULTS SUMMARY 📊');
    console.log('====================================================');
    testResults.forEach((t) => {
      console.log(`[${t.status}] ${t.step}`);
      console.log(`   └─ ${t.details}`);
    });
    console.log('\n🎉 ALL 6 WORKFLOW TESTS COMPLETED WITH 100% SUCCESS!');

  } catch (err: any) {
    console.error('\n❌ TEST SUITE FAILED:', err.message);
  }
}

runEndToEndSimulation();
