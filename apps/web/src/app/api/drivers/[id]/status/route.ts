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
      return NextResponse.json({ error: 'Driver ID required' }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    const supabase = supabaseAdmin();
    const nowIso = new Date().toISOString();

    // 1. Update Supabase drivers table
    const { data: updatedDriver, error } = await supabase
      .from('drivers')
      .update({ status, updated_at: nowIso })
      .eq('id', id)
      .select()
      .maybeSingle();

    // 2. Dual-sync to OCI backend in background
    try {
      fetch(`http://152.67.7.216:8080/api/drivers/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(3000),
      }).catch(() => {});
    } catch (_) {}

    if (error && !updatedDriver) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(updatedDriver || { success: true, status });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
