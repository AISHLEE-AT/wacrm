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
    const hashedPin = hashPin(pin)

    // 1. Fetch profile to check PIN hash or existing profile (limit 1 to avoid duplicates)
    const { data: existingProfile } = await admin
      .from('profiles')
      .select('id, full_name, role, main_category, pin_hash')
      .or(`phone.eq.${cleanPhone},phone.eq.91${cleanPhone},whatsapp.eq.${cleanPhone},whatsapp.eq.91${cleanPhone}`)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    // --- SECURITY: Strict PIN verification ---
    // If user profile EXISTS:
    //   - They MUST have a pin_hash set
    //   - The submitted PIN MUST match that hash
    // Only brand-new users (no profile at all) can set a PIN for the first time
    if (existingProfile) {
      if (!existingProfile.pin_hash) {
        // User exists but never set a PIN — block login, force them to use WhatsApp OTP
        return NextResponse.json({
          error: 'No PIN set for this account. Please login via WhatsApp OTP to set your PIN first.',
          code: 'NO_PIN_SET',
        }, { status: 401 })
      }
      if (existingProfile.pin_hash !== hashedPin) {
        return NextResponse.json({ error: 'Invalid PIN entered. Please check your 4-digit PIN.' }, { status: 401 })
      }
    }

    // 2. Flexible Supabase Auth User Lookup
    let existingUser = null;
    
    // Always prioritize the ID from the existing profile so we don't accidentally create a duplicate
    if (existingProfile?.id) {
      const { data: uData } = await admin.auth.admin.getUserById(existingProfile.id)
      existingUser = uData?.user || null
    }

    // Fallback: search by phone if profile lookup didn't find the auth user
    if (!existingUser) {
      const { data: usersData } = await admin.auth.admin.listUsers({ perPage: 1000 })
      const allUsers = usersData?.users || []
      existingUser = allUsers.find(u => 
        (u.email && u.email.includes(cleanPhone)) ||
        (u.phone && u.phone.includes(cleanPhone)) ||
        (u.user_metadata && (u.user_metadata.phone === cleanPhone || u.user_metadata.phone === `+91${cleanPhone}`))
      )
    }

    const targetEmail = existingUser?.email || `user_${cleanPhone}@wacrm.local`
    const syntheticPassword = `PinAuth_${cleanPhone}_${pin}`

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

    // 3. Sign in via anon client
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

    // Check if phone matches any registered driver partner
    const { data: driverMatch } = await admin
      .from('drivers')
      .select('id')
      .or(`phone.ilike.%${cleanPhone}%,mobile_number.ilike.%${cleanPhone}%,whatsapp_number.ilike.%${cleanPhone}%`)
      .limit(1)
      .maybeSingle()

    const isDriverPartner = !!driverMatch || 
      (existingProfile as any)?.role?.toLowerCase().includes('driver') || 
      (existingProfile as any)?.main_category?.toLowerCase().includes('driver') ||
      category?.toLowerCase().includes('driver');

    const resolvedRole = isDriverPartner ? 'driver' : (existingProfile?.role || 'user')
    const finalCategory = isDriverPartner ? 'Driver' : (category || (existingProfile as any)?.main_category || 'Traveller')
    const defaultModule = isDriverPartner ? '/drivo' : ((existingProfile as any)?.default_module || '/rideo')

    const finalName = fullName || existingProfile?.full_name || `User ${cleanPhone.slice(-4)}`

    // 4. Upsert profile in Supabase DB with clean PIN hash (fail-safe)
    try {
      await admin.from('profiles').upsert({
        id: userId,
        phone: cleanPhone,
        whatsapp: cleanPhone,
        full_name: finalName,
        role: resolvedRole,
        main_category: finalCategory,
        default_module: defaultModule,
        pin_hash: hashedPin,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })
    } catch (profileErr) {
      console.warn('Profile upsert with pin_hash failed, falling back without pin_hash:', profileErr)
      await admin.from('profiles').upsert({
        id: userId,
        phone: cleanPhone,
        whatsapp: cleanPhone,
        full_name: finalName,
        role: resolvedRole,
        main_category: finalCategory,
        default_module: defaultModule,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })
    }

    if (driverMatch) {
      await admin.from('drivers').update({ user_id: userId }).eq('id', driverMatch.id)
    }

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
      redirect_to: '/',
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
