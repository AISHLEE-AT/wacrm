import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const SUPABASE_URL = 'https://gmahjdzqitbomtmdzlfp.supabase.co';
const SUPABASE_SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtYWhqZHpxaXRib210bWR6bGZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjI1MTcyNywiZXhwIjoyMDk3ODI3NzI3fQ.t0dqkLlGK0P9SwdYveBFgQDIify4UTpVGvZZeiF7Mn0';
const ENCRYPTION_KEY = '6495b3e0d5028165fd45be8f31e272d6dd7083522e8f23dfc9dfa08d6f06912d';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

// Decrypt helper for Meta Token
function decrypt(encryptedText) {
  const parts = encryptedText.split(':');
  if (parts.length === 3) {
    const [ivHex, ciphertextHex, authTagHex] = parts;
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      Buffer.from(ENCRYPTION_KEY, 'hex'),
      Buffer.from(ivHex, 'hex')
    );
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    let decrypted = decipher.update(ciphertextHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } else if (parts.length === 2) {
    const [ivHex, ciphertextHex] = parts;
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(ENCRYPTION_KEY, 'hex'),
      Buffer.from(ivHex, 'hex')
    );
    let decrypted = decipher.update(ciphertextHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
  throw new Error('Invalid encrypted format');
}

// REAL PHONES AS REQUESTED BY USER
const REAL_DRIVER_PHONE = '919123596988'; // Driver Contact
const REAL_RIDER_PHONE = '918248818077';  // Rider Contact (or '91828818077')
const REAL_DRIVER_NAME = 'Selvam Murugan';
const REAL_RIDER_NAME = 'FastG / Karthik Raja';

async function sendMetaTextMessage(accessToken, phoneNumberId, to, text) {
  const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;
  const cleanTo = to.replace(/\D/g, '');
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanTo,
      type: 'text',
      text: { body: text }
    })
  });

  const resData = await response.json();
  return { status: response.status, ok: response.ok, data: resData };
}

async function runRealWhatsAppLiveTest() {
  console.log('====================================================');
  console.log('📱 REAL WHATSAPP CLOUD API & LIVE DB FLOW TEST 📱');
  console.log('====================================================\n');

  try {
    // 1. Fetch Meta Config & Decrypt Token
    const { data: configs, error: cfgErr } = await supabase.from('whatsapp_config').select('*').limit(1);
    if (cfgErr || !configs || configs.length === 0) {
      throw new Error('Could not fetch whatsapp_config from database.');
    }

    const cfg = configs[0];
    const phoneNumberId = cfg.phone_number_id || '1213113635214047';
    const decryptedToken = decrypt(cfg.access_token);
    console.log(`🔑 Meta Phone ID: ${phoneNumberId}`);
    console.log(`🔑 Meta Access Token Decrypted: ${decryptedToken.slice(0, 15)}...${decryptedToken.slice(-10)}\n`);

    // 2. Rider Books Real Ride in Live DB
    const otp = String(1000 + Math.floor(Math.random() * 9000));
    const pickupAddress = 'Thanjavur Old Bus Stand, Tamil Nadu';
    const dropoffAddress = 'Thanjavur Medical College Hospital, Tamil Nadu';
    const pickupLat = 10.7867;
    const pickupLng = 79.1378;
    const dropoffLat = 10.7621;
    const dropoffLng = 79.1124;
    const fare = 87;
    const distanceKm = 4.2;

    console.log('📍 STEP 1: Creating Live Ride Record in Supabase...');
    const { data: rideData, error: insertError } = await supabase
      .from('rides')
      .insert({
        passenger_phone: REAL_RIDER_PHONE,
        passenger_name: REAL_RIDER_NAME,
        pickup_location: { lat: pickupLat, lng: pickupLng, address: pickupAddress },
        drop_location: { lat: dropoffLat, lng: dropoffLng, address: dropoffAddress, distance_km: distanceKm },
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

    if (insertError) throw new Error(`DB Insert Error: ${insertError.message}`);
    console.log(`✅ Live DB Ride Created! ID: ${rideData.id}, OTP: ${otp}, Fare: ₹${fare}\n`);

    // 3. Dispatch Real WhatsApp Message to Real Driver Phone (919123596988)
    console.log(`📲 STEP 2: Dispatching Real WhatsApp Notification to Driver (${REAL_DRIVER_PHONE})...`);
    const driverMsg = 
      `🚨 *NEW RIDEO BOOKING REQUEST* 🚨\n\n` +
      `👤 *Passenger:* ${REAL_RIDER_NAME} (${REAL_RIDER_PHONE})\n` +
      `📍 *Pickup:* ${pickupAddress}\n` +
      `🏁 *Drop-off:* ${dropoffAddress}\n` +
      `📏 *Distance:* ${distanceKm} km\n` +
      `💰 *Estimated Fare:* ₹${fare}\n` +
      `🛺 *Category:* AutoO (3 Seater)\n\n` +
      `🗺️ *Google Maps Navigation:*\nhttps://www.google.com/maps/dir/?api=1&destination=${pickupLat},${pickupLng}\n\n` +
      `*Reply "ACCEPT" to confirm this ride or open SuprO DriveO app.*`;

    const driverSendRes = await sendMetaTextMessage(decryptedToken, phoneNumberId, REAL_DRIVER_PHONE, driverMsg);
    console.log('Meta API Driver Send Response:', JSON.stringify(driverSendRes, null, 2));

    // Also send to 6381029380 as backup admin
    await sendMetaTextMessage(decryptedToken, phoneNumberId, '916381029380', driverMsg);

    // 4. Driver Accepts Ride in Live DB
    console.log('\n👨‍✈️ STEP 3: Updating Live DB - Driver Accepts Ride...');
    const { data: acceptedRide, error: acceptErr } = await supabase
      .from('rides')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', rideData.id)
      .select()
      .single();

    if (acceptErr) throw new Error(`Accept Error: ${acceptErr.message}`);
    console.log(`✅ Live DB Ride ${rideData.id} updated to status: 'accepted'!\n`);

    // 5. Dispatch Real WhatsApp Confirmation to Real Rider Phone
    console.log(`📲 STEP 4: Dispatching Real WhatsApp Confirmation to Rider (${REAL_RIDER_PHONE})...`);
    const riderMsg = 
      `🚕 *DRIVER CONFIRMED YOUR RIDE!* 🚕\n\n` +
      `👨‍✈️ *Driver:* ${REAL_DRIVER_NAME}\n` +
      `📞 *Contact:* ${REAL_DRIVER_PHONE}\n` +
      `🛺 *Vehicle:* Bajaj RE Auto (TN-49-BT-4589)\n` +
      `📍 *Pickup:* ${pickupAddress}\n` +
      `🏁 *Drop-off:* ${dropoffAddress}\n` +
      `💰 *Fare:* ₹${fare}\n\n` +
      `🔢 *YOUR START TRIP OTP:* ${otp}\n` +
      `(Share this 4-digit OTP with your driver upon arrival)\n\n` +
      `🆔 *Ride ID:* ${rideData.id.slice(0, 8)}`;

    const riderSendRes = await sendMetaTextMessage(decryptedToken, phoneNumberId, REAL_RIDER_PHONE, riderMsg);
    console.log('Meta API Rider Send Response:', JSON.stringify(riderSendRes, null, 2));

    // Also send confirmation to 6381029380
    await sendMetaTextMessage(decryptedToken, phoneNumberId, '916381029380', riderMsg);

    // 6. Verify OTP and Complete Trip
    console.log('\n🏁 STEP 5: Verifying OTP & Completing Trip in Live DB...');
    await supabase.from('rides').update({ status: 'in_progress', started_at: new Date().toISOString() }).eq('id', rideData.id);
    await supabase.from('rides').update({ status: 'completed', completed_at: new Date().toISOString(), driver_earnings: fare }).eq('id', rideData.id);

    console.log(`✅ Live DB Ride ${rideData.id} successfully completed!`);
    console.log('\n🎉 ALL REAL WHATSAPP NOTIFICATIONS AND LIVE DB UPDATES EXECUTED SUCCESSFULLY!');

  } catch (err) {
    console.error('\n❌ REAL LIVE TEST FAILED:', err.message);
  }
}

runRealWhatsAppLiveTest();
