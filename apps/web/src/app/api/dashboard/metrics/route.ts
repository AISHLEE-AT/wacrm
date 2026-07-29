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

function startOfLocalDay(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function daysAgoStart(days: number): Date {
  const d = startOfLocalDay()
  d.setDate(d.getDate() - days)
  return d
}

export async function GET() {
  try {
    const { createClient: createServerClient } = await import('@/lib/supabase/server')
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const todayStart = startOfLocalDay().toISOString()
    const yesterdayStart = daysAgoStart(1).toISOString()
    const db = supabaseAdmin()

    const [
      openConvCur,
      newConvToday,
      newConvYesterday,
      newContactsToday,
      newContactsYesterday,
      openDeals,
      messagesToday,
      messagesYesterday,
      recentContacts,
      recentMessages,
    ] = await Promise.all([
      db.from('conversations').select('id', { count: 'exact', head: true }).eq('status', 'open'),
      db
        .from('conversations')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'open')
        .gte('created_at', todayStart),
      db
        .from('conversations')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'open')
        .gte('created_at', yesterdayStart)
        .lt('created_at', todayStart),
      db.from('contacts').select('id', { count: 'exact', head: true }).gte('created_at', todayStart),
      db
        .from('contacts')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', yesterdayStart)
        .lt('created_at', todayStart),
      db.from('deals').select('value, status').eq('status', 'open'),
      db
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', todayStart),
      db
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', yesterdayStart)
        .lt('created_at', todayStart),
      db.from('contacts').select('id, name, phone, created_at').order('created_at', { ascending: false }).limit(10),
      db
        .from('messages')
        .select('id, content_text, created_at, conversation_id')
        .order('created_at', { ascending: false })
        .limit(10),
    ])

    const openDealsRows = (openDeals.data ?? []) as { value: number | null }[]
    const openDealsValue = openDealsRows.reduce((sum, d) => sum + (d.value ?? 0), 0)

    const metrics = {
      activeConversations: {
        current: openConvCur.count ?? 0,
        previous: (newConvToday.count ?? 0) - (newConvYesterday.count ?? 0),
      },
      newContactsToday: {
        current: newContactsToday.count ?? 0,
        previous: newContactsYesterday.count ?? 0,
      },
      openDealsValue,
      openDealsCount: openDealsRows.length,
      messagesSentToday: {
        current: messagesToday.count ?? 0,
        previous: messagesYesterday.count ?? 0,
      },
    }

    const activity: any[] = []
    for (const c of recentContacts.data || []) {
      activity.push({
        id: `contact-${c.id}`,
        kind: 'contact',
        text: `New contact: ${c.name || c.phone}`,
        at: c.created_at,
        href: '/contacts',
      })
    }
    for (const m of recentMessages.data || []) {
      activity.push({
        id: `msg-${m.id}`,
        kind: 'message',
        text: `Message: ${m.content_text?.substring(0, 40) || 'Attachment'}`,
        at: m.created_at,
        href: `/inbox?c=${m.conversation_id}`,
      })
    }
    activity.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())

    return NextResponse.json({ metrics, activity })
  } catch (error) {
    console.error('[GET /api/dashboard/metrics] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
