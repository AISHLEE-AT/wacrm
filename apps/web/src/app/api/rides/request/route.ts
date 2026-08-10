import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendInteractiveButtons } from '@/lib/whatsapp/meta-api';
import { HARDCODED_WHATSAPP_CONFIG } from '@/lib/whatsapp/hardcoded-config';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      passenger_phone, passenger_name, 
      pickup_lat, pickup_lng, pickup_address, 
      dropoff_lat, dropoff_lng, dropoff_address, 
      vehicle_category, service_type, payment_mode, is_pink_ride 
    } = body;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const otp_code = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Create ride
    const { data: ride, error: rideError } = await supabase
      .from('rides')
      .insert({
        passenger_phone,
        passenger_name,
        pickup_lat,
        pickup_lng,
        pickup_address,
        dropoff_lat,
        dropoff_lng,
        dropoff_address,
        vehicle_category,
        service_type,
        payment_mode,
        is_pink_ride,
        otp_code,
        status: 'requested',
      })
      .select()
      .single();

    if (rideError) throw rideError;

    // Get nearby drivers
    const { data: drivers, error: driversError } = await supabase.rpc('get_nearby_drivers_v2', {
      lat: pickup_lat,
      lng: pickup_lng,
      category: vehicle_category,
      max_distance_km: 5
    });

    // Notify drivers via WhatsApp
    if (drivers && drivers.length > 0) {
      for (const driver of drivers) {
        if (driver.whatsapp_number) {
          try {
             await sendInteractiveButtons({
               phoneNumberId: HARDCODED_WHATSAPP_CONFIG.phone_number_id,
               accessToken: HARDCODED_WHATSAPP_CONFIG.access_token,
               to: driver.whatsapp_number,
               bodyText: `New ride request from ${passenger_name}\nPickup: ${pickup_address}\nDropoff: ${dropoff_address}`,
               buttons: [
                 { id: `accept_${ride.id}`, title: 'Accept Ride' },
                 { id: `skip_${ride.id}`, title: 'Skip' }
               ]
             });
          } catch (e) {
             console.error('Failed to notify driver via WA', e);
          }
        }
      }
    }

    return NextResponse.json({ ride, drivers_found: drivers?.length || 0 });
  } catch (error: any) {
    console.error('Request ride error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
