import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import {
  generateSessionToken,
  generatePollId,
  rateLimitByPhone,
  rateLimitByIP,
  getClientIP,
} from '@/lib/auth/whatsapp-login-security'

/**
 * POST /api/auth/whatsapp/init-session
 * 
 * Initiates a WhatsApp inbound login session.
 * Returns a deep link URL and poll_id for the client to use.
 * 
 * SECURITY:
 * - Rate limited: 5 sessions per phone per 10 min, 20 per IP per 10 min
 * - Token is cryptographically random (8 chars, ~41 bits entropy)
 * - Session expires in 10 minutes
 * - Single-use: token is invalidated after verification
 */

// The WABA phone number users will message TO (with country code, no +)
const WABA_PHONE = process.env.NEXT_PUBLIC_WABA_PHONE_NUMBER || '916381029380'

export async function POST(request: Request) {
  try {
    const clientIP = getClientIP(request)

    // Rate limit by IP first (cheapest check)
    if (!rateLimitByIP(clientIP)) {
      return NextResponse.json(
        { error: 'Too many login attempts from this location. Please wait a few minutes.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { phone, fullName, category } = body

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10)
    if (cleanPhone.length !== 10) {
      return NextResponse.json(
        { error: 'Invalid phone number. Please enter a 10-digit Indian mobile number.' },
        { status: 400 }
      )
    }

    // Rate limit by phone number
    if (!rateLimitByPhone(cleanPhone)) {
      return NextResponse.json(
        { error: 'Too many login attempts for this number. Please wait 10 minutes.' },
        { status: 429 }
      )
    }

    const supabase = supabaseAdmin()

    // Clean up any expired sessions for this phone (prevent stale rows)
    await supabase
      .from('whatsapp_login_sessions')
      .delete()
      .eq('phone', cleanPhone)
      .lt('expires_at', new Date().toISOString())

    // Check if there's already an active pending session for this phone
    // (prevent flooding the table with duplicate sessions)
    const { data: existingSession } = await supabase
      .from('whatsapp_login_sessions')
      .select('session_token, poll_id, created_at')
      .eq('phone', cleanPhone)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    let sessionToken: string
    let pollId: string

    if (existingSession) {
      // Reuse existing session (prevents spamming new tokens)
      sessionToken = existingSession.session_token
      pollId = existingSession.poll_id
    } else {
      // Generate new session
      sessionToken = generateSessionToken()
      pollId = generatePollId()

      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 min

      const { error: insertError } = await supabase
        .from('whatsapp_login_sessions')
        .insert({
          session_token: sessionToken,
          phone: cleanPhone,
          full_name: fullName?.trim() || null,
          category: category || 'Traveller',
          status: 'pending',
          poll_id: pollId,
          expires_at: expiresAt,
        })

      if (insertError) {
        console.error('[init-session] Insert error:', insertError)
        return NextResponse.json(
          { error: 'Failed to create login session. Please try again.' },
          { status: 500 }
        )
      }
    }

    // Build the WhatsApp deep link
    const messageText = `Verify login: ${sessionToken}`
    const encodedMessage = encodeURIComponent(messageText)
    const deepLinkUrl = `https://wa.me/${WABA_PHONE}?text=${encodedMessage}`

    // Check if user is returning (existing profile)
    let isReturning = false
    let existingName: string | null = null
    let existingCategory: string | null = null
    let hasPin = false

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, main_category, pin_hash')
      .or(`phone.eq.${cleanPhone},phone.eq.91${cleanPhone},whatsapp.eq.${cleanPhone},whatsapp.eq.91${cleanPhone}`)
      .limit(1)
      .maybeSingle()

    if (profile?.full_name) {
      isReturning = true
      existingName = profile.full_name
      existingCategory = profile.main_category
      hasPin = !!profile.pin_hash
    }

    return NextResponse.json({
      success: true,
      session_token: sessionToken,
      poll_id: pollId,
      deep_link_url: deepLinkUrl,
      waba_phone: WABA_PHONE,
      expires_in_seconds: 600,
      // Returning user metadata
      is_returning: isReturning,
      existing_name: existingName,
      existing_category: existingCategory,
      has_pin: hasPin,
    })

  } catch (error: any) {
    console.error('[init-session] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
