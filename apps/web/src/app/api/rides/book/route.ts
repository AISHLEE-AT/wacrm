import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { calculateDistanceKm, calculateEstimatedPrice, generateRideOTP } from '@/lib/rides/dispatch'

export async function POST(req: Request) {
  try {
    const { pickupLat, pickupLng, dropoffLat, dropoffLng, vehicleType, userPhone, accountId, contactId } = await req.json()

    if (!pickupLat || !dropoffLat || !vehicleType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const distance = calculateDistanceKm(pickupLat, pickupLng, dropoffLat, dropoffLng)
    const price = calculateEstimatedPrice(distance, vehicleType)
    const otp = generateRideOTP()

    // Create the ride record in pending state
    const { data: ride, error } = await supabaseAdmin()
      .from('rides')
      .insert({
        account_id: accountId || '00000000-0000-0000-0000-000000000000', // Default or grab from CRM
        contact_id: contactId || '00000000-0000-0000-0000-000000000000',
        user_phone: userPhone,
        vehicle_type: vehicleType,
        pickup_lat: pickupLat,
        pickup_lng: pickupLng,
        dropoff_lat: dropoffLat,
        dropoff_lng: dropoffLng,
        distance_km: parseFloat(distance.toFixed(2)),
        estimated_price: price,
        status: 'searching',
        otp: otp
      })
      .select()
      .single()

    if (error) {
      console.error('Ride creation error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, ride })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
