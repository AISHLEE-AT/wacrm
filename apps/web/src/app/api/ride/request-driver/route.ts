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
      service_type,
      pickup_lat,
      pickup_lng,
      dropoff_lat,
      dropoff_lng,
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
      finalPassengerName = prof?.full_name || 'Customer';
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

    // Clean up addresses
    const cleanPickup = (pickup_address || 'Current Location').replace(/^Unnamed Road,\s*/i, '');
    const cleanDropoff = (dropoff_address || 'Destination').replace(/^Unnamed Road,\s*/i, '');
    const isLocalService = !dropoff_address || dropoff_address === 'Local Mandi / Market' || dropoff_address === cleanPickup;
    const riderDisplayPhone = passenger_phone ? `(📞 +91 ${passenger_phone.replace(/\D/g, '').slice(-10)})` : '';

    const isRento = service_type === 'rento' || /tractor|tiller|drone|harvester|coconut|ace|truck|cargo|plow/i.test(vehicle_info || '');

    const pickupMap = (pickup_lat && pickup_lng) ? `🗺️ *Field / Location Map:* https://maps.google.com/?q=${pickup_lat},${pickup_lng}\n` : '';
    const dropMap = (!isLocalService && dropoff_lat && dropoff_lng) ? `🏁 *Destination Map:* https://maps.google.com/?q=${dropoff_lat},${dropoff_lng}\n\n` : '\n';

    // Construct the interactive message body
    const headerTitle = isRento 
      ? `🚜 *NEW SUPRO RENTO (AGRI / CARGO) REQUEST* 🚜` 
      : `🚨 *NEW SUPRO RIDEO BOOKING REQUEST* 🚨`;

    const serviceLabel = isRento ? `🌾 *Service / Equipment:*` : `🚗 *Vehicle:*`;
    const locLabel = isRento ? `📍 *Farm / Field Location:*` : `📍 *Pickup Location:*`;

    const messageText = `${headerTitle}\n\n` +
      `👤 *Customer:* ${finalPassengerName || 'Customer'} ${riderDisplayPhone}\n` +
      `${serviceLabel} ${vehicle_info || (isRento ? 'Agri Machinery' : 'Standard Vehicle')}\n` +
      `${locLabel} ${cleanPickup}\n` +
      (!isLocalService ? `🏁 *Destination / Mandi:* ${cleanDropoff}\n` : '') +
      (distance_km && parseFloat(distance_km) > 0 ? `📏 *Distance:* ${distance_km} km\n` : '') +
      `💰 *Estimated Fare:* ₹${estimated_fare}\n\n` +
      `⚡ *Action Required:*\n` +
      `👉 *Open your SuprO App -> DriveO page to Accept & Confirm or Contact the Customer immediately.*\n` +
      `🔢 *Trip PIN (OTP):* (Customer will share the 4-digit PIN upon arrival to start work)\n\n` +
      pickupMap +
      dropMap +
      `Please accept or decline this request below:`;

    // Dispatch Interactive Buttons via Meta API
    await sendInteractiveButtons({
      phoneNumberId,
      accessToken,
      to: whatsappPhone,
      bodyText: messageText,
      buttons: [
        { id: `accept_ride_${ride_id}`, title: isRento ? '✅ Accept on DriveO' : '✅ Accept Ride' },
        { id: `decline_ride_${ride_id}`, title: '❌ Decline' }
      ]
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Failed to send interactive ride request:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
