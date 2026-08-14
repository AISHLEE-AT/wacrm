import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendInteractiveButtons } from '@/lib/whatsapp/meta-api';
import { decrypt } from '@/lib/whatsapp/encryption';

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      ride_id, 
      driver_phone, 
      pickup_address, 
      dropoff_address, 
      distance_km, 
      estimated_fare, 
      driver_name, 
      driver_rating,
      vehicle_info,
      pickup_lat,
      pickup_lng,
      passenger_name,
      passenger_phone
    } = body;

    if (!ride_id || !driver_phone) {
      return NextResponse.json({ error: 'Missing ride_id or driver_phone' }, { status: 400 });
    }

    const supabase = supabaseAdmin();
    
    // Look up passenger saved profile name if not provided
    let finalPassengerName = passenger_name;
    if (!finalPassengerName && passenger_phone) {
      const cleanRiderPhone = passenger_phone.replace(/\D/g, '').slice(-10);
      const { data: prof } = await supabase
        .from('profiles')
        .select('full_name')
        .ilike('phone', `%${cleanRiderPhone}%`)
        .maybeSingle();
      finalPassengerName = prof?.full_name || 'Passenger';
    }

    // Fetch WhatsApp config
    const { data: config } = await supabase
      .from('whatsapp_config')
      .select('*')
      .limit(1)
      .maybeSingle();

    const phoneNumberId = config?.phone_number_id || process.env.META_PHONE_NUMBER_ID || '1213113635214047';
    let accessToken = '';

    if (config?.access_token) {
      try {
        accessToken = decrypt(config.access_token);
      } catch (err) {
        accessToken = process.env.META_ACCESS_TOKEN || '';
      }
    } else {
      accessToken = process.env.META_ACCESS_TOKEN || '';
    }

    if (!accessToken) {
      return NextResponse.json({ error: 'Server configuration error (no access token)' }, { status: 500 });
    }

    // Format phone number
    const cleanPhone = driver_phone.replace(/\D/g, '');
    const whatsappPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

    const navLink = (pickup_lat && pickup_lng) 
      ? `\n🗺️ *Google Maps Navigation:*\nhttps://www.google.com/maps/dir/?api=1&destination=${pickup_lat},${pickup_lng}\n\n` 
      : '\n';

    // Construct the interactive message body
    const messageText = `🚨 *NEW RIDEO BOOKING REQUEST* 🚨\n\n` +
      `👤 *Passenger:* ${finalPassengerName || 'Passenger'} (${passenger_phone || ''})\n` +
      `📍 *Pickup:* ${pickup_address}\n` +
      `🏁 *Drop-off:* ${dropoff_address}\n` +
      `🚗 *Vehicle:* ${vehicle_info || 'Standard Auto'}\n` +
      `📏 *Distance:* ${distance_km} km\n` +
      `💰 *Estimated Fare:* ₹${estimated_fare}\n` +
      navLink +
      `Please accept or decline this ride below:`;

    // Dispatch Interactive Buttons via Meta API
    await sendInteractiveButtons({
      phoneNumberId,
      accessToken,
      to: whatsappPhone,
      bodyText: messageText,
      buttons: [
        { id: `accept_ride_${ride_id}`, title: '✅ Accept Ride' },
        { id: `decline_ride_${ride_id}`, title: '❌ Decline' }
      ]
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Failed to send interactive ride request:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
