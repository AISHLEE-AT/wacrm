import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Ride ID required' }, { status: 400 });
    }

    const body = await request.json();
    const { status, driver_id } = body;

    const supabase = supabaseAdmin();
    const nowIso = new Date().toISOString();

    const updatePayload: Record<string, any> = {
      status,
      updated_at: nowIso,
    };
    if (driver_id) {
      updatePayload.driver_id = driver_id;
    }

    // 1. Update Supabase rides table
    const { data: updatedRide, error } = await supabase
      .from('rides')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .maybeSingle();

    // 2. Dual-sync to OCI backend in background
    try {
      fetch(`http://152.67.7.216:8080/api/rides/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(3000),
      }).catch(() => {});
    } catch (_) {}

    if (error && !updatedRide) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(updatedRide || { success: true, status });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
