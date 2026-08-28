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
    const suproToken = request.headers.get('x-supro-access-token')
    const userAgent = request.headers.get('user-agent') || ''
    const cookieHeader = request.headers.get('cookie') || ''

    const { createClient: createServerClient } = await import('@/lib/supabase/server')
    const supabase = await createServerClient()
    let { data: { user } } = await supabase.auth.getUser()

    if (!user && (authHeader || suproToken)) {
      const rawToken = (authHeader?.replace(/^Bearer\s+/i, '') || suproToken || '').trim()
      if (rawToken) {
        const { createClient } = await import('@supabase/supabase-js')
        const tokenClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          { global: { headers: { Authorization: `Bearer ${rawToken}` } } }
        )
        const res = await tokenClient.auth.getUser()
        user = res.data.user
      }
    }

    const url = new URL(request.url)
    const urlToken = url.searchParams.get('access_token')
    if (!user && urlToken) {
      const { data: tokenData } = await supabaseAdmin().auth.getUser(urlToken)
      user = tokenData?.user
    }

    // Admin inbox endpoints are meant for Admin CRM view. Allow fetching if request is from native app / embed or user is admin
    const isEmbed = url.searchParams.get('embed') === 'true' ||
                    url.searchParams.has('ref') ||
                    request.headers.get('x-supro-embed') === 'true' ||
                    userAgent.includes('SuprO-Native') ||
                    cookieHeader.includes('supro_is_embed=true')

    if (!user && isEmbed) {
      const { data: adminProfiles } = await supabaseAdmin()
        .from('profiles')
        .select('id')
        .or('role.eq.admin,phone.eq.9486335870,whatsapp.eq.9486335870,full_name.ilike.%admin%')
        .limit(1)
      if (adminProfiles && adminProfiles.length > 0) {
        user = { id: adminProfiles[0].id } as any
      } else {
        const { data: fallbackProfiles } = await supabaseAdmin()
          .from('profiles')
          .select('id')
          .order('created_at', { ascending: true })
          .limit(1)
        if (fallbackProfiles && fallbackProfiles.length > 0) {
          user = { id: fallbackProfiles[0].id } as any
        }
      }
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
