import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing ride ID' }, { status: 400 });
  }

  // Use Service Role to bypass RLS for magic links
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_GAMEO_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
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
      const { error: updateError } = await supabase
        .from('rides')
        .update({ status: 'declined' })
        .eq('id', id);

      if (updateError) throw updateError;
    }

    // Redirect to a simple thank you page since they declined it
    return new NextResponse(`
      <html>
        <head><meta name="viewport" content="width=device-width, initial-scale=1"></head>
        <body style="font-family: sans-serif; text-align: center; padding: 2rem; background: #020617; color: white;">
          <h2 style="color: #f87171;">Ride Declined</h2>
          <p>You have declined this ride request. The customer has been notified.</p>
          <a href="/drivo" style="color: #34d399; text-decoration: none; margin-top: 2rem; display: inline-block;">Return to Dashboard</a>
        </body>
      </html>
    `, { headers: { 'content-type': 'text/html' } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
