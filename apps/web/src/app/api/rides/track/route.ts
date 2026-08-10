import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ride_id = searchParams.get('ride_id');

    if (!ride_id) return NextResponse.json({ error: 'Missing ride_id' }, { status: 400 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: ride, error } = await supabase
      .from('rides')
      .select('*, driver:drivers(id, name, pickup_latitude, pickup_longitude, vehicle_number, mobile_number, whatsapp_number, vehicle_type, vehicle_model, rating, upi_id)')
      .eq('id', ride_id)
      .single();

    if (error) throw error;

    return NextResponse.json({ ride });
  } catch (error: any) {
    console.error('Track ride error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
