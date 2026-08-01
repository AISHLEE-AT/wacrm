import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { rateLimitPoll } from '@/lib/auth/whatsapp-login-security'

/**
 * GET /api/auth/whatsapp/poll-session?poll_id=<UUID>
 * 
 * Polls the status of a WhatsApp login session.
 * Returns:
 *   - { status: 'pending' } — waiting for WhatsApp message
 *   - { status: 'verified', session: {...}, role, category, ... } — login complete
 *   - { status: 'expired' } — 10-minute timeout
 * 
 * SECURITY:
 * - Rate limited: Max 120 polls per poll_id per 10 minutes (2/sec for 60s)
 * - poll_id is a UUID (unguessable)
 * - No sensitive data leaked until verified
 */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const pollId = searchParams.get('poll_id')

    if (!pollId) {
      return NextResponse.json(
        { error: 'poll_id is required' },
        { status: 400 }
      )
    }

    // Validate poll_id format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(pollId)) {
      return NextResponse.json(
        { error: 'Invalid poll_id format' },
        { status: 400 }
      )
    }

    // Rate limit polling
    if (!rateLimitPoll(pollId)) {
      return NextResponse.json(
        { error: 'Polling too fast. Please slow down.' },
        { status: 429 }
      )
    }

    const supabase = supabaseAdmin()

    const { data: session, error: fetchError } = await supabase
      .from('whatsapp_login_sessions')
      .select('status, supabase_session, expires_at, phone, full_name, category')
      .eq('poll_id', pollId)
      .maybeSingle()

    if (fetchError || !session) {
      return NextResponse.json(
        { status: 'not_found', error: 'Session not found. Please start a new login.' },
        { status: 404 }
      )
    }

    // Check expiry
    if (new Date(session.expires_at) < new Date()) {
      // Clean up expired session
      await supabase
        .from('whatsapp_login_sessions')
        .delete()
        .eq('poll_id', pollId)

      return NextResponse.json({ status: 'expired' })
    }

    if (session.status === 'verified' && session.supabase_session) {
      // Session is verified — return the auth tokens
      const sessionData = session.supabase_session as any

      // Delete the session row (single-use)
      await supabase
        .from('whatsapp_login_sessions')
        .delete()
        .eq('poll_id', pollId)

      // Determine redirect based on role/category
      const role = sessionData.role || 'user'
      const category = sessionData.category || session.category || 'Traveller'
      const isAdmin = role === 'admin'
      const isDriver = role === 'driver'

      const routeMap: Record<string, string> = {
        Traveller: '/rideo', Driver: '/drivo', Farmer: '/rento',
        Shopper: '/dealo', Student: '/teacho', Teacher: '/teacho',
        Financier: '/moneyo', JobSeeker: '/teacho', Employer: '/',
        Tourist: '/touro'
      }
      const redirectTo = isAdmin ? '/crm' : (isDriver ? '/drivo' : (routeMap[category] || '/rideo'))

      return NextResponse.json({
        status: 'verified',
        session: {
          access_token: sessionData.access_token,
          refresh_token: sessionData.refresh_token,
        },
        role,
        category,
        full_name: sessionData.full_name || session.full_name,
        isAdmin,
        isDriver,
        redirect_to: redirectTo,
      })
    }

    // Still pending
    return NextResponse.json({ status: 'pending' })

  } catch (error: any) {
    console.error('[poll-session] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
