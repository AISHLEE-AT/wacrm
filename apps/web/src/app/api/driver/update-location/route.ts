import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { driver_id, lat, lng, heading, speed } = body;

    if (!driver_id || !lat || !lng) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update driver's current location
    await supabase.from('drivers').update({
      pickup_latitude: lat,
      pickup_longitude: lng,
      updated_at: new Date().toISOString()
    }).eq('id', driver_id);

    // Log to location history (best effort, don't fail if table doesn't exist)
    try {
      await supabase.from('driver_location_logs').insert({
        driver_id,
        latitude: lat,
        longitude: lng,
        speed: speed || null,
        heading: heading || null
      });
    } catch(e) { /* table may not exist yet */ }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update location error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
