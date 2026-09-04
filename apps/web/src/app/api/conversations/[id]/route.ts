import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 })
    }

    // 1. Fetch directly from OCI backend
    try {
      const ociRes = await fetch(`https://mysupro.duckdns.org/api/conversations/${conversationId}`, { cache: 'no-store' });
      if (ociRes.ok) {
        const json = await ociRes.json();
        return NextResponse.json(json);
      }
    } catch (ociErr) {
      console.warn('[GET /api/conversations/[id]] OCI fetch fallback to Supabase:', ociErr);
    }

    // 2. Fallback to Supabase
    const { createClient: createServerClient } = await import('@/lib/supabase/server')
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('conversations')
      .select('*, contact:contacts(*)')
      .eq('id', conversationId)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ conversation: data, data })
  } catch (error) {
    console.error('[GET /api/conversations/[id]] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
