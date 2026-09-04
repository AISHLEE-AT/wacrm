import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Ride ID required' }, { status: 400 });
    }

    const supabase = supabaseAdmin();

    // 1. Query Supabase rides
    const { data: ride, error } = await supabase
      .from('rides')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!error && ride) {
      return NextResponse.json(ride);
    }

    // 2. Fallback to OCI backend
    try {
      const ociRes = await fetch(`http://152.67.7.216:8080/api/rides/${id}`, {
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(3000),
      });
      if (ociRes.ok) {
        const ociData = await ociRes.json();
        return NextResponse.json(ociData);
      }
    } catch (_) {}

    return NextResponse.json({ error: 'Ride not found' }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
