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

    // Notify the other party
    if (cancelled_by === 'passenger' && ride.driver?.whatsapp_number) {
        await sendTextMessage(
            HARDCODED_WHATSAPP_CONFIG.phone_number_id,
            HARDCODED_WHATSAPP_CONFIG.access_token,
            ride.driver.whatsapp_number,
            `Ride cancelled by passenger. Reason: ${reason || 'Not provided'}`
        );
    } else if (cancelled_by === 'driver' && ride.passenger_phone) {
        await sendTextMessage(
            HARDCODED_WHATSAPP_CONFIG.phone_number_id,
            HARDCODED_WHATSAPP_CONFIG.access_token,
            ride.passenger_phone,
            `Ride cancelled by driver. Reason: ${reason || 'Not provided'}`
        );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Cancel ride error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
