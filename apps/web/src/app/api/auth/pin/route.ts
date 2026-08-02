import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function hashPin(pin: string): string {
  return crypto.createHash('sha256').update(`FAGO_PIN_${pin}`).digest('hex')
}

export async function POST(request: Request) {
  try {
    const { phone, pin, fullName, category } = await request.json()

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    if (!pin || typeof pin !== 'string' || pin.length < 4) {
      return NextResponse.json({ error: 'Valid 4-digit PIN is required' }, { status: 400 })
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10)
    if (cleanPhone.length !== 10) {
      return NextResponse.json({ error: 'Invalid 10-digit phone number' }, { status: 400 })
    }

    const admin = getAdminClient()
    const syntheticEmail = `user_${cleanPhone}@wacrm.local`
    const syntheticPassword = `PinAuth_${cleanPhone}_${pin}`
    const hashedPin = hashPin(pin)

    // 1. Check if profile exists in Supabase DB
    const { data: existingProfile } = await admin
      .from('profiles')
      .select('id, full_name, role, main_category, pin_hash')
      .or(`phone.eq.${cleanPhone},phone.eq.91${cleanPhone},whatsapp.eq.${cleanPhone},whatsapp.eq.91${cleanPhone}`)
      .maybeSingle()

    // 2. Attempt Supabase Auth Sign In
    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    let authResult = await anonClient.auth.signInWithPassword({
      email: syntheticEmail,
      password: syntheticPassword,
    })

    // If first sign-in failed, attempt password update/sync or user creation
    if (authResult.error) {
      const { data: usersList } = await admin.auth.admin.listUsers()
      const existingUser = usersList?.users?.find(
        u => u.email === syntheticEmail || u.phone === cleanPhone || u.phone === `+91${cleanPhone}`
      )

      if (existingUser) {
        // Update user password to match current PIN
        await admin.auth.admin.updateUserById(existingUser.id, {
          password: syntheticPassword,
          email_confirm: true,
        })
        // Retry sign in
        authResult = await anonClient.auth.signInWithPassword({
          email: syntheticEmail,
          password: syntheticPassword,
        })
      } else {
        // Create new user in Supabase Auth
        const { data: newUser, error: createErr } = await admin.auth.admin.createUser({
          email: syntheticEmail,
          password: syntheticPassword,
          phone: `+91${cleanPhone}`,
          email_confirm: true,
          user_metadata: {
            full_name: fullName || existingProfile?.full_name || `User ${cleanPhone.slice(-4)}`,
            role: cleanPhone === '9486335870' ? 'admin' : (existingProfile?.role || 'user'),
          },
        })

        if (createErr || !newUser?.user) {
          return NextResponse.json({ error: createErr?.message || 'Failed to create user' }, { status: 500 })
        }

        // Retry sign in
        authResult = await anonClient.auth.signInWithPassword({
          email: syntheticEmail,
          password: syntheticPassword,
        })
      }
    }

    if (authResult.error || !authResult.data.session) {
      return NextResponse.json({ error: authResult.error?.message || 'Authentication failed' }, { status: 401 })
    }

    const userId = authResult.data.user.id
    const resolvedRole = cleanPhone === '9486335870' ? 'admin' : (existingProfile?.role || 'user')
    const finalName = fullName || existingProfile?.full_name || `User ${cleanPhone.slice(-4)}`
    const finalCategory = category || existingProfile?.main_category || 'Traveller'

    // 3. Upsert profile in Supabase DB
    await admin.from('profiles').upsert({
      id: userId,
      phone: cleanPhone,
      whatsapp: cleanPhone,
      full_name: finalName,
      role: resolvedRole,
      main_category: finalCategory,
      pin_hash: hashedPin,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })

    const response = NextResponse.json({
      success: true,
      message: 'PIN authentication successful',
      session: {
        access_token: authResult.data.session.access_token,
        refresh_token: authResult.data.session.refresh_token,
        expires_at: authResult.data.session.expires_at,
      },
      user: {
        id: userId,
        phone: cleanPhone,
        fullName: finalName,
        role: resolvedRole,
        category: finalCategory,
      },
      redirect_to: resolvedRole === 'admin' ? '/crm' : '/rideo',
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
    console.error('PIN Auth Route Error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
