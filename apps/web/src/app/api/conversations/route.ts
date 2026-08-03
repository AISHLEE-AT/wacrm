import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

let _adminClient: any = null
function supabaseAdmin() {
  if (!_adminClient) {
    _adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return _adminClient
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const { createClient: createServerClient } = await import('@/lib/supabase/server')
    const supabase = await createServerClient()
    let { data: { user } } = await supabase.auth.getUser()

    if (!user && authHeader) {
      const { createClient } = await import('@supabase/supabase-js')
      const tokenClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: authHeader } } }
      )
      const res = await tokenClient.auth.getUser()
      user = res.data.user
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch conversations with joined contact using service role to bypass RLS mismatches
    const { data: conversations, error: convError } = await supabaseAdmin()
      .from('conversations')
      .select('*, contact:contacts(*)')
      .order('last_message_at', { ascending: false, nullsFirst: false })

    if (convError) {
      console.error('[GET /api/conversations] Error fetching conversations:', convError)
      return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
    }

    // Deduplicate conversations by contact_id so duplicate historical rows never split chat history
    const seenContacts = new Set<string>()
    const dedupedConversations = []
    for (const conv of (conversations || [])) {
      const key = conv.contact_id || conv.id
      if (!seenContacts.has(key)) {
        seenContacts.add(key)
        dedupedConversations.push(conv)
      }
    }

    return NextResponse.json({ conversations: dedupedConversations })
  } catch (error) {
    console.error('[GET /api/conversations] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
