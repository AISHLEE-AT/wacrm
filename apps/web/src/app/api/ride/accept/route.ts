import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing ride ID' }, { status: 400 });
  }

  // Use the Service Role Key to bypass RLS. This is required because the driver 
  // might click this link from WhatsApp on their phone, which opens a system browser 
  // where they might not be authenticated, but we still want the acceptance to succeed.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_GAMEO_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Check if ride is already accepted
    const { data: ride, error: fetchError } = await supabase
      .from('rides')
      .select('status')
      .eq('id', id)
      .maybeSingle();
      
    if (fetchError) throw fetchError;
    
    if (!ride) {
      return NextResponse.json({ error: 'Ride not found' }, { status: 404 });
    }

    if (ride.status === 'pending') {
      // Update the ride status to accepted
      const { error: updateError } = await supabase
        .from('rides')
        .update({ status: 'accepted' })
        .eq('id', id);

      if (updateError) throw updateError;
    }

    // Redirect the driver directly into their DriveO dashboard where the 
    // real-time listener will now show this accepted ride as the Active Order.
    return NextResponse.redirect(new URL('/drivo?accepted=true', request.url));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
