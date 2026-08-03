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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 })
    }

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

    // First find the conversation's contact_id so we can fetch all messages for this contact
    // across any duplicate/historical conversation rows from previous account_id migrations
    const { data: conv } = await supabaseAdmin()
      .from('conversations')
      .select('id, contact_id')
      .eq('id', conversationId)
      .maybeSingle()

    let messages = null
    let msgError = null

    if (conv?.contact_id) {
      const { data: convRows } = await supabaseAdmin()
        .from('conversations')
        .select('id')
        .eq('contact_id', conv.contact_id)
      const convIds = (convRows || []).map((r: { id: string }) => r.id)

      if (convIds.length > 0) {
        const res = await supabaseAdmin()
          .from('messages')
          .select('*')
          .in('conversation_id', convIds)
          .order('created_at', { ascending: true })
        messages = res.data
        msgError = res.error
      }
    }

    if (!messages && !msgError) {
      const res = await supabaseAdmin()
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
      messages = res.data
      msgError = res.error
    }

    if (msgError) {
      console.error(`[GET /api/conversations/${conversationId}/messages] Error:`, msgError)
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    return NextResponse.json({ messages: messages || [] })
  } catch (error) {
    console.error('[GET /api/conversations/[id]/messages] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
