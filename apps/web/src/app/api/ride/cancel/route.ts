import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const actor = searchParams.get('actor');

  if (!id) {
    return NextResponse.json({ error: 'Missing ride ID' }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_GAMEO_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { error: updateError } = await supabase
      .from('rides')
      .update({
        status: 'cancelled',
      })
      .eq('id', id);

    if (updateError) throw updateError;

    if (actor === 'driver') {
      return NextResponse.redirect(new URL('/drivo?cancelled=true', request.url));
    } else {
      return NextResponse.redirect(new URL('/rideo?cancelled=true', request.url));
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
