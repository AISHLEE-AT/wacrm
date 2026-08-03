import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

function hashPin(pin: string): string {
  return crypto.createHash('sha256').update(`FAGO_PIN_${pin}`).digest('hex')
}

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: Request) {
  try {
    const { phone, otp, fullName, category, pin } = await request.json()

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    if (!otp || typeof otp !== 'string' || otp.length !== 6) {
      return NextResponse.json({ error: 'Valid 6-digit OTP is required' }, { status: 400 })
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10)
    if (cleanPhone.length !== 10) {
      return NextResponse.json({ error: 'Invalid 10-digit phone number' }, { status: 400 })
    }

    const admin = getAdminClient()

    // 1. Verify OTP — WhatsApp webhook stores phone with country code (919123596988)
    const dbPhone = `91${cleanPhone}`

    const { data: otpRecord, error: otpErr } = await admin
      .from('whatsapp_otps')
      .select('*')
      .eq('phone_number', dbPhone)
      .maybeSingle()

    if (otpErr || !otpRecord || otpRecord.otp !== otp) {
      return NextResponse.json({ error: 'Invalid or expired OTP. Please request a new one.' }, { status: 401 })
    }

    if (new Date(otpRecord.expires_at).getTime() < Date.now()) {
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 401 })
    }

    // OTP valid — delete it so it cannot be reused
    await admin.from('whatsapp_otps').delete().eq('phone_number', dbPhone)

    // 2. Find the ONE canonical profile for this phone (most recently updated)
    //    ⚠️ STRICT RULE: We NEVER create a second profile for an existing phone number.
    const { data: existingProfile } = await admin
      .from('profiles')
      .select('id, full_name, role, main_category, pin_hash')
      .or(`phone.eq.${cleanPhone},phone.eq.91${cleanPhone},whatsapp.eq.${cleanPhone},whatsapp.eq.91${cleanPhone}`)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const isExistingUser = !!existingProfile

    // 3. Find existing Supabase Auth user — always prefer the one tied to the existing profile
    let existingUser = null

    if (existingProfile?.id) {
      const { data: uData } = await admin.auth.admin.getUserById(existingProfile.id)
      existingUser = uData?.user || null
    }

    // Fallback: scan auth users by phone/email patterns
    if (!existingUser) {
      const { data: usersData } = await admin.auth.admin.listUsers({ perPage: 1000 })
      const allUsers = usersData?.users || []
      existingUser = allUsers.find(u =>
        (u.email && u.email.includes(cleanPhone)) ||
        (u.phone && u.phone.includes(cleanPhone)) ||
        (u.user_metadata && (u.user_metadata.phone === cleanPhone || u.user_metadata.phone === `+91${cleanPhone}`))
      ) || null
    }

    const targetEmail = existingUser?.email || `user_${cleanPhone}@wacrm.local`
    const syntheticPassword = `OtpAuth_${cleanPhone}_${otp}`

    if (existingUser) {
      // ✅ Existing user: just update the password — NO new auth user created
      await admin.auth.admin.updateUserById(existingUser.id, {
        password: syntheticPassword,
        email_confirm: true,
      })
    } else {
      // 🆕 Truly new user: create auth account
      const { data: newUser, error: createErr } = await admin.auth.admin.createUser({
        email: targetEmail,
        password: syntheticPassword,
        phone: `+91${cleanPhone}`,
        email_confirm: true,
        user_metadata: {
          full_name: fullName || `User ${cleanPhone.slice(-4)}`,
          role: 'user',
          phone: cleanPhone,
        },
      })

      if (createErr || !newUser?.user) {
        console.error('Failed to create Supabase Auth user:', createErr)
        return NextResponse.json({ error: createErr?.message || 'Failed to create user' }, { status: 500 })
      }
    }

    // 4. Sign in via anon client to get the session
    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const authResult = await anonClient.auth.signInWithPassword({
      email: targetEmail,
      password: syntheticPassword,
    })

    if (authResult.error || !authResult.data.session) {
      console.error('SignInWithPassword error:', authResult.error)
      return NextResponse.json({ error: authResult.error?.message || 'Authentication failed' }, { status: 401 })
    }

    const userId = authResult.data.user.id
    const resolvedRole = existingProfile?.role || 'user'

    // ⚠️ For existing users: NEVER overwrite their name or category from login fields
    const finalName = isExistingUser
      ? (existingProfile?.full_name || `User ${cleanPhone.slice(-4)}`)
      : (fullName || `User ${cleanPhone.slice(-4)}`)

    const finalCategory = isExistingUser
      ? (existingProfile?.main_category || 'Traveller')
      : (category || 'Traveller')

    // 5. SAFE UPSERT — always targets the canonical existing profile ID
    //    This guarantees one and only one profile row per phone number.
    const canonicalProfileId = existingProfile?.id || userId

    const profileData: any = {
      id: canonicalProfileId,
      phone: cleanPhone,
      whatsapp: cleanPhone,
      full_name: finalName,
      role: resolvedRole,
      main_category: finalCategory,
      updated_at: new Date().toISOString(),
    }

    // Save PIN hash only if provided (new user setup or PIN change)
    if (pin && typeof pin === 'string' && pin.length === 4) {
      profileData.pin_hash = hashPin(pin)
    }

    await admin.from('profiles').upsert(profileData, { onConflict: 'id' })

    // Determine if user still needs to set a PIN (no pin_hash in DB and none provided now)
    const hasPinNow = !!(pin && pin.length === 4)
    const hadPinBefore = !!(existingProfile?.pin_hash)
    const needsPinSetup = !hasPinNow && !hadPinBefore

    const response = NextResponse.json({
      success: true,
      message: 'OTP authentication successful',
      needs_pin_setup: needsPinSetup,
      session: {
        access_token: authResult.data.session.access_token,
        refresh_token: authResult.data.session.refresh_token,
        expires_at: authResult.data.session.expires_at,
      },
      user: {
        id: canonicalProfileId,
        phone: cleanPhone,
        fullName: finalName,
        role: resolvedRole,
        category: finalCategory,
      },
      redirect_to: resolvedRole === 'admin' ? '/admin' : '/rideo',
    })

    // Set session cookie
    response.cookies.set('sb-access-token', authResult.data.session.access_token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (err: any) {
    console.error('OTP Auth Route Error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
