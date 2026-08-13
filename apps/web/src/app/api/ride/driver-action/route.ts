import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendTextMessage } from '@/lib/whatsapp/meta-api';
import { decrypt } from '@/lib/whatsapp/encryption';

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  try {
    const { ride_id, driver_id, action } = await request.json();

    if (!ride_id || !driver_id || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = supabaseAdmin();
    
    // Fetch WhatsApp config
    const { data: config } = await supabase.from('whatsapp_config').select('*').limit(1).maybeSingle();
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
      return NextResponse.json({ error: 'Missing access token' }, { status: 500 });
    }

    // Fetch driver phone
    const { data: driver } = await supabase.from('drivers').select('*').eq('id', driver_id).single();
    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    const driverPhone = driver.whatsapp_number || driver.mobile_number || driver.phone;
    if (!driverPhone) {
      return NextResponse.json({ error: 'Driver has no phone number' }, { status: 400 });
    }

    const cleanPhone = driverPhone.replace(/\D/g, '');
    const whatsappPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

    let text = '';
    if (action === 'accepted') {
      text = '✅ You have accepted this ride on the SuprO App. Please navigate to the pickup location using the app.';
    } else if (action === 'cancelled') {
      text = '❌ You have cancelled this ride via the SuprO App.';
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await sendTextMessage({
      phoneNumberId,
      accessToken,
      to: whatsappPhone,
      text
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Failed to notify driver via WhatsApp:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
