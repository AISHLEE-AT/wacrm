import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendInteractiveButtons } from '@/lib/whatsapp/meta-api';
import { decrypt } from '@/lib/whatsapp/encryption';

// Initialize Supabase admin client to bypass RLS for server-side ops
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
      vehicle_info
    } = body;

    if (!ride_id || !driver_phone) {
      return NextResponse.json({ error: 'Missing ride_id or driver_phone' }, { status: 400 });
    }

    const supabase = supabaseAdmin();
    
    // Fetch WhatsApp config (assume single tenant for this prototype)
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

    // Construct the interactive message body
    const messageText = `*[New Ride Request - RideO]*\n\n` +
      `📍 *Pickup:* ${pickup_address}\n` +
      `🏁 *Drop-off:* ${dropoff_address}\n` +
      `🚗 *Vehicle:* ${vehicle_info}\n` +
      `📏 *Distance:* ${distance_km} km\n` +
      `💰 *Est. Fare:* ₹${estimated_fare}\n\n` +
      `👤 *Driver:* ${driver_name} (${driver_rating} ⭐)\n` +
      `🆔 *Ride ID:* ${String(ride_id).slice(0, 8)}\n\n` +
      `Please accept or decline this ride below:`;

    // Dispatch via Meta API
    await sendInteractiveButtons({
      phoneNumberId,
      accessToken,
      to: whatsappPhone,
      bodyText: messageText,
      buttons: [
        { id: `accept_ride_${ride_id}`, title: '✅ Accept' },
        { id: `decline_ride_${ride_id}`, title: '❌ Decline' }
      ]
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Failed to send interactive ride request:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
