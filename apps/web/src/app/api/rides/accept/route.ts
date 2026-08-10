import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendTextMessage } from '@/lib/whatsapp/meta-api';
import { HARDCODED_WHATSAPP_CONFIG } from '@/lib/whatsapp/hardcoded-config';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ride_id, driver_id } = body;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get ride
    const { data: ride } = await supabase
      .from('rides')
      .select('*')
      .eq('id', ride_id)
      .single();

    if (!ride) return NextResponse.json({ error: 'Ride not found' }, { status: 404 });
    if (ride.status !== 'requested') return NextResponse.json({ error: 'Ride no longer available' }, { status: 400 });

    // Get driver
    const { data: driver } = await supabase
      .from('drivers')
      .select('*')
      .eq('id', driver_id)
      .single();
      
    if (!driver) return NextResponse.json({ error: 'Driver not found' }, { status: 404 });

    const driver_upi_id = driver.upi_id || '9486335870@hdfcbank';

    // Update ride
    const { data: updatedRide, error: updateError } = await supabase
      .from('rides')
      .update({
        driver_id,
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', ride_id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Send WhatsApp to passenger
    const passengerMsg = `Driver ${driver.name} accepted! Vehicle: ${driver.vehicle_number}. OTP: ${ride.otp_code}. UPI Payment QR: upi://pay?pa=${driver_upi_id}&am=${ride.estimated_fare || 0}`;
    await sendTextMessage({
      phoneNumberId: HARDCODED_WHATSAPP_CONFIG.phone_number_id,
      accessToken: HARDCODED_WHATSAPP_CONFIG.access_token,
      to: ride.passenger_phone,
      text: passengerMsg,
    });

    // Send WhatsApp to driver
    const driverMsg = `Ride confirmed! Pickup: ${ride.pickup_address}. Customer: ${ride.passenger_name}. Collect OTP before starting.`;
    if (driver.whatsapp_number) {
      await sendTextMessage({
        phoneNumberId: HARDCODED_WHATSAPP_CONFIG.phone_number_id,
        accessToken: HARDCODED_WHATSAPP_CONFIG.access_token,
        to: driver.whatsapp_number,
        text: driverMsg,
      });
    }

    return NextResponse.json({ ride: updatedRide });
  } catch (error: any) {
    console.error('Accept ride error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
