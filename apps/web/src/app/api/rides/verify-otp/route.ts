import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendTextMessage } from '@/lib/whatsapp/meta-api';
import { HARDCODED_WHATSAPP_CONFIG } from '@/lib/whatsapp/hardcoded-config';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ride_id, otp_code } = body;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: ride } = await supabase
      .from('rides')
      .select('*')
      .eq('id', ride_id)
      .single();

    if (!ride) return NextResponse.json({ error: 'Ride not found' }, { status: 404 });
    if (ride.otp_code !== otp_code) return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });

    const { data: updatedRide, error: updateError } = await supabase
      .from('rides')
      .update({
        status: 'in_progress',
        started_at: new Date().toISOString()
      })
      .eq('id', ride_id)
      .select()
      .single();

    if (updateError) throw updateError;

    await sendTextMessage(
      HARDCODED_WHATSAPP_CONFIG.phone_number_id,
      HARDCODED_WHATSAPP_CONFIG.access_token,
      ride.passenger_phone,
      "Trip started! Your driver is on the way to your destination."
    );

    return NextResponse.json({ success: true, ride: updatedRide });
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
