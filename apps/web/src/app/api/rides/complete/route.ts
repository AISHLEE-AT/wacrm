import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendTextMessage } from '@/lib/whatsapp/meta-api';
import { HARDCODED_WHATSAPP_CONFIG } from '@/lib/whatsapp/hardcoded-config';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ride_id, final_distance_km } = body;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: ride } = await supabase
      .from('rides')
      .select('*, driver:drivers(*)')
      .eq('id', ride_id)
      .single();

    if (!ride) return NextResponse.json({ error: 'Ride not found' }, { status: 404 });

    const total_fare = ride.estimated_fare || 0; // In reality, recalculate based on final distance
    let platform_fee = total_fare * 0.05;
    if (platform_fee < 5) platform_fee = 5;
    const driver_earnings = total_fare - platform_fee;
    
    // Update ride
    const { data: updatedRide, error: updateError } = await supabase
      .from('rides')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        final_distance: final_distance_km || ride.estimated_distance,
        total_fare,
        platform_fee
      })
      .eq('id', ride_id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Credit driver earnings?
    // Subscription logic
    await supabase.from('driver_subscriptions').insert({
      driver_id: ride.driver_id,
      amount: platform_fee,
      status: 'pending',
      ride_id: ride.id,
      admin_upi: '9486335870@hdfcbank'
    });

    // Notify passenger
    await sendTextMessage(
      HARDCODED_WHATSAPP_CONFIG.phone_number_id,
      HARDCODED_WHATSAPP_CONFIG.access_token,
      ride.passenger_phone,
      `Ride completed! Total Fare: ₹${total_fare}. Thank you for riding with us. Please rate your driver out of 5.`
    );

    // Notify driver
    if (ride.driver?.whatsapp_number) {
        await sendTextMessage(
        HARDCODED_WHATSAPP_CONFIG.phone_number_id,
        HARDCODED_WHATSAPP_CONFIG.access_token,
        ride.driver.whatsapp_number,
        `Ride completed! Fare collected: ₹${total_fare}. Platform fee of ₹${platform_fee} has been logged to your account.`
        );
    }

    return NextResponse.json({ success: true, ride: updatedRide });
  } catch (error: any) {
    console.error('Complete ride error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
