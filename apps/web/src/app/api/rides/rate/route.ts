import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ride_id, rating, review } = body;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: ride } = await supabase
      .from('rides')
      .update({
        driver_rating: rating,
        review
      })
      .eq('id', ride_id)
      .select()
      .single();

    if (ride?.driver_id) {
        // Calculate new average rating for driver
        const { data: driverRides } = await supabase
            .from('rides')
            .select('driver_rating')
            .eq('driver_id', ride.driver_id)
            .not('driver_rating', 'is', null);
        
        if (driverRides && driverRides.length > 0) {
            const sum = driverRides.reduce((acc, curr) => acc + (curr.driver_rating || 0), 0);
            const avg = sum / driverRides.length;
            await supabase.from('drivers').update({ rating: avg }).eq('id', ride.driver_id);
        }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Rate ride error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
