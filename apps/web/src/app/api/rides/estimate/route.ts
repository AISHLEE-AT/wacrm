import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const pickup_lat = parseFloat(searchParams.get('pickup_lat') || '0');
    const pickup_lng = parseFloat(searchParams.get('pickup_lng') || '0');
    const dropoff_lat = parseFloat(searchParams.get('dropoff_lat') || '0');
    const dropoff_lng = parseFloat(searchParams.get('dropoff_lng') || '0');
    const vehicle_category = searchParams.get('vehicle_category');

    if (!pickup_lat || !pickup_lng || !dropoff_lat || !dropoff_lng) {
      return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 });
    }

    const distance_km = calculateDistance(pickup_lat, pickup_lng, dropoff_lat, dropoff_lng);
    const estimated_minutes = Math.round(distance_km * 2.5); // Rough estimate: 2.5 mins per km

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let query = supabase.from('ride_categories').select('*').eq('is_active', true);
    if (vehicle_category) {
      query = query.eq('id', vehicle_category);
    }

    const { data: categories, error } = await query;
    if (error) throw error;

    const currentHour = new Date().getHours();
    const isNight = currentHour >= 22 || currentHour < 6;

    const estimates = categories?.map(category => {
      const { base_fare, base_km, per_km_rate, per_min_rate, night_surcharge_multiplier } = category;
      
      let distanceFare = 0;
      if (distance_km > base_km) {
        distanceFare = (distance_km - base_km) * per_km_rate;
      }
      
      const timeFare = estimated_minutes * per_min_rate;
      let total = base_fare + distanceFare + timeFare;
      
      if (isNight && night_surcharge_multiplier) {
        total *= night_surcharge_multiplier;
      }
      
      let platform_fee = total * 0.05;
      if (platform_fee < 5) platform_fee = 5;
      
      total += platform_fee;

      return {
        category: category.id,
        name: category.name,
        icon: category.icon,
        fare_breakdown: {
          base: base_fare,
          distance: distanceFare,
          time: timeFare,
          platform_fee,
          total: Math.round(total)
        },
        eta_minutes: Math.round(distance_km * 3), // time to pickup estimate
        distance_km: parseFloat(distance_km.toFixed(2)),
        duration_mins: estimated_minutes
      };
    });

    return NextResponse.json({ estimates });
  } catch (error: any) {
    console.error('Estimate error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
