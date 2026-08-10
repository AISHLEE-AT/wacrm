import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendTextMessage } from '@/lib/whatsapp/meta-api';
import { HARDCODED_WHATSAPP_CONFIG } from '@/lib/whatsapp/hardcoded-config';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ride_id, cancelled_by, reason } = body;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: ride } = await supabase
      .from('rides')
      .select('*, driver:drivers(*)')
      .eq('id', ride_id)
      .single();

    if (!ride) return NextResponse.json({ error: 'Ride not found' }, { status: 404 });

    if (ride.status === 'completed' || ride.status === 'cancelled') {
      return NextResponse.json({ error: 'Ride cannot be cancelled at this stage' }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from('rides')
      .update({
        status: 'cancelled',
        cancelled_by,
        cancellation_reason: reason,
        completed_at: new Date().toISOString()
      })
      .eq('id', ride_id);

    if (updateError) throw updateError;

    if (ride.driver_id) {
      await supabase.from('drivers').update({ status: 'online' }).eq('id', ride.driver_id);
    }

    // Notify the other party
    if (cancelled_by === 'passenger' && ride.driver?.whatsapp_number) {
      await sendTextMessage({
        phoneNumberId: HARDCODED_WHATSAPP_CONFIG.phone_number_id,
        accessToken: HARDCODED_WHATSAPP_CONFIG.access_token,
        to: ride.driver.whatsapp_number,
        text: `Ride cancelled by passenger. Reason: ${reason || 'Not provided'}`,
      });
    } else if (cancelled_by === 'driver' && ride.passenger_phone) {
      await sendTextMessage({
        phoneNumberId: HARDCODED_WHATSAPP_CONFIG.phone_number_id,
        accessToken: HARDCODED_WHATSAPP_CONFIG.access_token,
        to: ride.passenger_phone,
        text: `Ride cancelled by driver. Reason: ${reason || 'Not provided'}`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Cancel ride error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
