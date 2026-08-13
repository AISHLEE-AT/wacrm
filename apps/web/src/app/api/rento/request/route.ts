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
      booking_code,
      user_phone,
      user_name,
      service_category,
      vehicle_type,
      pickup_address,
      destination_address,
      estimated_fare,
      driver_phone
    } = body;

    const supabase = supabaseAdmin();

    // Fetch WhatsApp configuration
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

    // Target Phone (default to admin driver if not specified)
    const targetPhone = driver_phone || '919486335870';
    const cleanPhone = targetPhone.replace(/\D/g, '');
    const whatsappPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

    const categoryTitle = 
      service_category === 'agri' ? '🚜 [New Agri Machinery Rental - RentO]' :
      service_category === 'cargo' ? '🚚 [New Cargo Mandi Transport - RentO]' :
      service_category === 'package' ? '🚕 [New Hourly Package Rental - RentO]' :
      '🏔️ [New Outstation / Tour Rental - RentO]';

    const messageText = `*${categoryTitle}*\n\n` +
      `👤 *Customer/Farmer:* ${user_name || 'Customer'}\n` +
      `📞 *Phone:* ${user_phone || '—'}\n` +
      `🚜 *Machinery/Vehicle:* ${vehicle_type}\n` +
      `📍 *Field / Pickup:* ${pickup_address}\n` +
      `🏬 *Drop / Mandi:* ${destination_address || 'As directed'}\n` +
      `💰 *Est. Fare:* ₹${estimated_fare}\n` +
      `🆔 *Booking Code:* ${booking_code || 'RNT-NEW'}\n\n` +
      `Please accept or decline this RentO booking below:`;

    // Dispatch via Meta API
    await sendInteractiveButtons({
      phoneNumberId,
      accessToken,
      to: whatsappPhone,
      bodyText: messageText,
      buttons: [
        { id: `accept_rento_${booking_code}`, title: '✅ Accept Booking' },
        { id: `decline_rento_${booking_code}`, title: '❌ Decline' }
      ]
    });

    return NextResponse.json({ success: true, booking_code });
  } catch (err: any) {
    console.error('Failed to dispatch RentO booking:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
