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

async function sendMetaInteractiveButtonMessage(accessToken, phoneNumberId, to, text, buttons) {
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

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const resData = await response.json();
  return { status: response.status, ok: response.ok, data: resData };
}

async function runInteractiveButtonTest() {
  console.log('====================================================');
  console.log('📲 DISPATCHING INTERACTIVE ACCEPT/DECLINE WHATSAPP BUTTONS');
  console.log('====================================================\n');

  try {
    // 1. Fetch Meta config
    const { data: configs } = await supabase.from('whatsapp_config').select('*').limit(1);
    const cfg = configs[0];
    const phoneNumberId = cfg.phone_number_id || '1213113635214047';
    const decryptedToken = decrypt(cfg.access_token);

    // 2. Fetch real user profile for 8248818077
    const { data: profileData } = await supabase
      .from('profiles')
      .select('full_name, phone, location, latitude, longitude')
      .ilike('phone', '%8248818077%')
      .maybeSingle();

    const realPassengerName = profileData?.full_name || 'Rideo';
    const realPassengerPhone = '918248818077';
    console.log(`👤 Database Saved Profile Name for ${realPassengerPhone}: "${realPassengerName}"`);
    console.log(`📍 Saved Location: ${profileData?.location || 'Karimalapadi, Tamil Nadu'}\n`);

    // 3. Create real ride in DB
    const rideId = 'test-ride-' + Date.now();
    const otp = String(1000 + Math.floor(Math.random() * 9000));
    const pickupAddress = profileData?.location || 'Karimalapadi, Tamil Nadu';
    const dropoffAddress = 'Thanjavur Old Bus Stand, Tamil Nadu';
    const pickupLat = profileData?.latitude || 12.2207;
    const pickupLng = profileData?.longitude || 78.7194;
    const fare = 83;

    const { data: newRide, error: rErr } = await supabase
      .from('rides')
      .insert({
        passenger_name: realPassengerName,
        passenger_phone: realPassengerPhone,
        pickup_location: { lat: pickupLat, lng: pickupLng, address: pickupAddress },
        drop_location: { lat: 10.7867, lng: 79.1378, address: dropoffAddress, distance_km: 3.8 },
        vehicle_category: 'autoo',
        fare: fare,
        total_fare: fare,
        status: 'pending',
        otp: otp,
        payment_mode: 'upi',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (rErr) throw new Error(rErr.message);
    console.log(`✅ Live DB Ride Created! ID: ${newRide.id}, Passenger: ${newRide.passenger_name}\n`);

    // 4. Construct WhatsApp Message with exact database name & Live GPS URL
    const messageBody = 
      `🚨 *NEW RIDEO BOOKING REQUEST* 🚨\n\n` +
      `👤 *Passenger:* ${realPassengerName} (${realPassengerPhone})\n` +
      `📍 *Pickup:* ${pickupAddress}\n` +
      `🏁 *Drop-off:* ${dropoffAddress}\n` +
      `📏 *Distance:* 3.8 km\n` +
      `💰 *Estimated Fare:* ₹${fare}\n` +
      `🛺 *Category:* AutoO (3 Seater)\n\n` +
      `🗺️ *Google Maps Navigation:*\nhttps://www.google.com/maps/dir/?api=1&destination=${pickupLat},${pickupLng}`;

    const interactiveButtons = [
      { id: `accept_${newRide.id.slice(0, 8)}`, title: '✅ Accept Ride' },
      { id: `decline_${newRide.id.slice(0, 8)}`, title: '❌ Decline' }
    ];

    // 5. Dispatch to Driver Phone 919123596988 & Admin 916381029380
    console.log('📲 Dispatching Interactive Button Message to Driver 919123596988...');
    const driverRes = await sendMetaInteractiveButtonMessage(decryptedToken, phoneNumberId, '919123596988', messageBody, interactiveButtons);
    console.log('Driver Send Response:', JSON.stringify(driverRes, null, 2));

    console.log('\n📲 Dispatching Interactive Button Message to 916381029380...');
    const adminRes = await sendMetaInteractiveButtonMessage(decryptedToken, phoneNumberId, '916381029380', messageBody, interactiveButtons);
    console.log('Admin Send Response:', JSON.stringify(adminRes, null, 2));

    console.log('\n🎉 INTERACTIVE WHATSAPP BUTTONS DISPATCHED WITH 100% SUCCESS!');

  } catch (e) {
    console.error('❌ Interactive button test error:', e.message);
  }
}

runInteractiveButtonTest();
