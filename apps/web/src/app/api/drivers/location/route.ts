import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { driver_id, latitude, longitude, status } = body;

    if (!driver_id || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: 'Missing location data' }, { status: 400 });
    }

    const supabase = supabaseAdmin();
    const nowIso = new Date().toISOString();

    const updatePayload: Record<string, any> = {
      latitude,
      longitude,
      last_location_update: nowIso,
      updated_at: nowIso,
    };
    if (status) {
      updatePayload.status = status;
    }

    // 1. Update driver location in Supabase drivers table
    const { data: updatedDriver, error } = await supabase
      .from('drivers')
      .update(updatePayload)
      .eq('id', driver_id)
      .select()
      .maybeSingle();

    // 2. Dual-sync to OCI backend in background
    try {
      fetch('http://152.67.7.216:8080/api/drivers/location', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(3000),
      }).catch(() => {});
    } catch (_) {}

    if (error && !updatedDriver) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(updatedDriver || { success: true, latitude, longitude });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
