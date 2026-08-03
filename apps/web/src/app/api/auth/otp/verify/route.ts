import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: Request) {
  try {
    const { phone, otp, fullName, category } = await request.json()

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

    // 1. Verify OTP in whatsapp_otps
    const { data: otpRecord, error: otpErr } = await admin
      .from('whatsapp_otps')
      .select('*')
      .eq('phone', cleanPhone)
      .maybeSingle()

    if (otpErr || !otpRecord || otpRecord.otp !== otp) {
      return NextResponse.json({ error: 'Invalid or expired OTP. Please request a new one.' }, { status: 401 })
    }

    if (new Date(otpRecord.expires_at).getTime() < Date.now()) {
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 401 })
    }

    // OTP is valid! Delete it so it can't be reused.
    await admin.from('whatsapp_otps').delete().eq('phone', cleanPhone)

    // 2. Fetch profile to get existing user info
    const { data: existingProfile } = await admin
      .from('profiles')
      .select('id, full_name, role, main_category')
      .or(`phone.eq.${cleanPhone},phone.eq.91${cleanPhone},whatsapp.eq.${cleanPhone},whatsapp.eq.91${cleanPhone}`)
      .maybeSingle()

    // 3. Flexible Supabase Auth User Lookup
    const { data: usersData } = await admin.auth.admin.listUsers({ perPage: 1000 })
    const allUsers = usersData?.users || []
    const existingUser = allUsers.find(u => 
      (u.email && u.email.includes(cleanPhone)) ||
      (u.phone && u.phone.includes(cleanPhone)) ||
      (u.user_metadata && (u.user_metadata.phone === cleanPhone || u.user_metadata.phone === `+91${cleanPhone}`))
    )

    const targetEmail = existingUser?.email || `user_${cleanPhone}@wacrm.local`
    const syntheticPassword = `OtpAuth_${cleanPhone}_${otp}` // New password every time for security

    if (existingUser) {
      // Sync password & confirm email
      await admin.auth.admin.updateUserById(existingUser.id, {
        password: syntheticPassword,
        email_confirm: true,
      })
    } else {
      // Create new Supabase Auth user
      const { data: newUser, error: createErr } = await admin.auth.admin.createUser({
        email: targetEmail,
        password: syntheticPassword,
        phone: `+91${cleanPhone}`,
        email_confirm: true,
        user_metadata: {
          full_name: fullName || existingProfile?.full_name || `User ${cleanPhone.slice(-4)}`,
          role: existingProfile?.role || 'user',
          phone: cleanPhone,
        },
      })

      if (createErr || !newUser?.user) {
        console.error('Failed to create Supabase Auth user:', createErr)
        return NextResponse.json({ error: createErr?.message || 'Failed to create user' }, { status: 500 })
      }
    }

    // 4. Sign in via anon client
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
    const finalName = fullName || existingProfile?.full_name || `User ${cleanPhone.slice(-4)}`
    const finalCategory = category || existingProfile?.main_category || 'Traveller'

    // 5. Upsert profile in Supabase DB
    await admin.from('profiles').upsert({
      id: userId,
      phone: cleanPhone,
      whatsapp: cleanPhone,
      full_name: finalName,
      role: resolvedRole,
      main_category: finalCategory,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })

    const response = NextResponse.json({
      success: true,
      message: 'OTP authentication successful',
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
