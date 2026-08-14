import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const SUPABASE_URL = 'https://gmahjdzqitbomtmdzlfp.supabase.co';
const SUPABASE_SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtYWhqZHpxaXRib210bWR6bGZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjI1MTcyNywiZXhwIjoyMDk3ODI3NzI3fQ.t0dqkLlGK0P9SwdYveBFgQDIify4UTpVGvZZeiF7Mn0';
const ENCRYPTION_KEY = '6495b3e0d5028165fd45be8f31e272d6dd7083522e8f23dfc9dfa08d6f06912d';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

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
  }
  throw new Error('Invalid encrypted format');
}

async function sendInteractiveButtons(accessToken, phoneNumberId, to, text, buttons) {
  const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;
  const cleanTo = to.replace(/\D/g, '');
  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: cleanTo,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: { text: text },
      action: {
        buttons: buttons.map((b) => ({
          type: 'reply',
          reply: { id: b.id, title: b.title }
        }))
      }
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

async function sendTextMessage(accessToken, phoneNumberId, to, text) {
  const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;
  const cleanTo = to.replace(/\D/g, '');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanTo,
      type: 'text',
      text: { body: text }
    })
  });
  return res.json();
}

async function testDualMapsAndSecureOtp() {
  console.log('====================================================');
  console.log('🚀 TESTING DUAL MAP LINKS & SECURE RIDER OTP FLOW 🚀');
  console.log('====================================================\n');

  const { data: configs } = await supabase.from('whatsapp_config').select('*').limit(1);
  const cfg = configs[0];
  const phoneNumberId = cfg.phone_number_id || '1213113635214047';
  const decryptedToken = decrypt(cfg.access_token);

  // 1. Fetch Real Rider Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, location, latitude, longitude')
    .ilike('phone', '%8248818077%')
    .maybeSingle();

  const riderName = profile?.full_name || 'Rideo';
  const riderPhone = '918248818077';
  const driverPhone = '919123596988';
  const driverName = 'Selvam Murugan';

  const pickupAddress = profile?.location || 'Karimalapadi, Tamil Nadu, India';
  const dropoffAddress = 'Thanjavur Old Bus Stand, Tamil Nadu';
  const pickupLat = profile?.latitude || 12.2207;
  const pickupLng = profile?.longitude || 78.7194;
  const dropLat = 10.7867;
  const dropLng = 79.1378;
  const fare = 83;
  const distanceKm = 3.8;
  const privateOtp = String(1000 + Math.floor(Math.random() * 9000));

  // 2. Create Live Ride in Supabase
  const { data: ride } = await supabase
    .from('rides')
    .insert({
      passenger_name: riderName,
      passenger_phone: riderPhone,
      pickup_location: { lat: pickupLat, lng: pickupLng, address: pickupAddress },
      drop_location: { lat: dropLat, lng: dropLng, address: dropoffAddress, distance_km: distanceKm },
      vehicle_category: 'autoo',
      fare: fare,
      status: 'pending',
      otp: privateOtp,
      payment_mode: 'upi',
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  console.log(`✅ Live DB Ride Created (ID: ${ride.id}) with Private OTP: ${privateOtp}\n`);

  // 3. Dispatch Interactive Message to Driver (NO OTP INCLUDED!)
  const driverMessage = 
    `🚨 *NEW RIDEO BOOKING REQUEST* 🚨\n\n` +
    `👤 *Passenger:* ${riderName} (${riderPhone})\n` +
    `📍 *Pickup:* ${pickupAddress}\n` +
    `🏁 *Drop-off:* ${dropoffAddress}\n` +
    `🛺 *Vehicle:* AutoO (3 Seater)\n` +
    `📏 *Distance:* ${distanceKm} km\n` +
    `💰 *Estimated Fare:* ₹${fare}\n\n` +
    `🔢 *Trip OTP:* (Ask passenger for the 4-digit OTP upon arrival to verify & start trip)\n\n` +
    `🗺️ *Pickup Navigation:*\nhttps://www.google.com/maps/dir/?api=1&destination=${pickupLat},${pickupLng}\n\n` +
    `🗺️ *Drop-off Destination:*\nhttps://www.google.com/maps/dir/?api=1&destination=${dropLat},${dropLng}\n\n` +
    `Please accept or decline this ride below:`;

  console.log('📲 Dispatching to Driver (919123596988)...');
  const dRes = await sendInteractiveButtons(
    decryptedToken,
    phoneNumberId,
    driverPhone,
    driverMessage,
    [
      { id: `accept_ride_${ride.id.slice(0, 8)}`, title: '✅ Accept Ride' },
      { id: `decline_ride_${ride.id.slice(0, 8)}`, title: '❌ Decline' }
    ]
  );
  console.log('Driver Response:', dRes);

  // 4. Dispatch Confirmation to Rider (CONTAINS PRIVATE OTP & DUAL MAPS)
  const riderMessage = 
    `🚕 *DRIVER CONFIRMED YOUR RIDE!* 🚕\n\n` +
    `👨‍✈️ *Driver:* ${driverName}\n` +
    `📞 *Contact:* ${driverPhone}\n` +
    `🛺 *Vehicle:* Bajaj RE Auto (TN-49-BT-4589)\n` +
    `📍 *Pickup:* ${pickupAddress}\n` +
    `🏁 *Drop-off:* ${dropoffAddress}\n` +
    `💰 *Fare:* ₹${fare}\n\n` +
    `🔢 *YOUR START TRIP OTP:* ${privateOtp}\n` +
    `(Tell this 4-digit OTP directly to your driver when you meet to begin trip)\n\n` +
    `🗺️ *Pickup Location:*\nhttps://www.google.com/maps/dir/?api=1&destination=${pickupLat},${pickupLng}\n\n` +
    `🗺️ *Drop-off Destination:*\nhttps://www.google.com/maps/dir/?api=1&destination=${dropLat},${dropLng}\n\n` +
    `🆔 *Ride ID:* ${ride.id.slice(0, 8)}`;

  console.log('\n📲 Dispatching Private OTP & Dual Maps to Rider (918248818077)...');
  const rRes = await sendTextMessage(decryptedToken, phoneNumberId, riderPhone, riderMessage);
  console.log('Rider Response:', rRes);

  console.log('\n🎉 DUAL MAPS & SECURE OTP DISPATCH TEST COMPLETED SUCCESSFULLY!');
}

testDualMapsAndSecureOtp();
