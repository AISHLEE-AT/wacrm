import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Bootstrap admin phones — DB role='admin' is primary source of truth
const BOOTSTRAP_ADMIN_PHONES = [
  '9486335870', '919486335870',
  '9123596988', '919123596988'
]

export async function POST(request: Request) {
  try {
    const { phone, pin } = await request.json()

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }
    if (!pin || pin.length !== 4) {
      return NextResponse.json({ error: '4-digit PIN is required' }, { status: 400 })
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10)
    const supabase = supabaseAdmin()

    // 1. Find profile by phone
    const { data: records } = await supabase
      .from('profiles')
      .select('id, full_name, main_category, role, pin_hash')
      .or(`phone.eq.${cleanPhone},phone.eq.91${cleanPhone},phone.eq.+91${cleanPhone},whatsapp.eq.${cleanPhone},whatsapp.eq.91${cleanPhone}`)
      .limit(1)

    const profile = records?.[0]
    if (!profile) {
      return NextResponse.json({
        error: 'No account found for this phone number. Please register via WhatsApp OTP first.'
      }, { status: 404 })
    }

    // 2. Verify PIN — DB hash takes priority, fallback to user_metadata
    const inputPinHash = crypto.createHash('sha256')
      .update(`FAGO_PIN_${cleanPhone}_${pin}`)
      .digest('hex')

    if (profile.pin_hash) {
      // Primary: verify against DB hash
      if (profile.pin_hash !== inputPinHash) {
        return NextResponse.json({
          error: 'Incorrect PIN. Try again or use WhatsApp OTP to reset.'
        }, { status: 401 })
      }
    } else {
      // No PIN set in DB — force OTP first
      return NextResponse.json({
        error: 'No PIN set. Please login via WhatsApp OTP first, then set your PIN.',
        need_otp: true
      }, { status: 401 })
    }

    // 3. Generate fresh session
    const syntheticEmail = `${cleanPhone}@whatsapp.wacrm.local`
    const securePassword = crypto.randomBytes(32).toString('hex')

    const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 })
    let user = users.find(u => u.email === syntheticEmail)

    if (!user) {
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: syntheticEmail,
        email_confirm: true,
        password: securePassword,
        user_metadata: { phone: cleanPhone, full_name: profile.full_name }
      })
      if (createError || !newUser.user) {
        return NextResponse.json({ error: 'Failed to authenticate account' }, { status: 500 })
      }
      user = newUser.user
    } else {
      await supabase.auth.admin.updateUserById(user.id, { password: securePassword })
    }

    const standardSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data: sessionData, error: signInError } = await standardSupabase.auth.signInWithPassword({
      email: syntheticEmail,
      password: securePassword
    })
    if (signInError || !sessionData.session) {
      return NextResponse.json({ error: 'Failed to generate session. Please try WhatsApp OTP.' }, { status: 500 })
    }

    // Update last_login
    await supabase.from('profiles').update({ last_login: new Date().toISOString(), platform: 'web' })
      .eq('id', user.id)

    // 4. Resolve role
    const isBootstrapAdmin = BOOTSTRAP_ADMIN_PHONES.some(p =>
      cleanPhone === p || cleanPhone === p.slice(-10)
    )
    const isAdmin = profile.role === 'admin' || profile.role === 'ADMIN' || isBootstrapAdmin

    const { data: driverRecords } = await supabase
      .from('drivers').select('id, is_verified')
      .or(`mobile_number.eq.${cleanPhone},user_id.eq.${profile.id}`)
    const isDriver = (driverRecords && driverRecords.length > 0 && driverRecords[0].is_verified)
      || profile.role === 'driver'

    const resolvedRole = isAdmin ? 'admin' : (isDriver ? 'driver' : (profile.role || 'user'))
    const resolvedCategory = isDriver ? 'Driver' : (profile.main_category || 'Traveller')

    const routeMap: Record<string, string> = {
      Traveller: '/rideo', Driver: '/drivo', Farmer: '/rento',
      Shopper: '/dealo', Student: '/teacho', Teacher: '/teacho',
      Financier: '/moneyo', JobSeeker: '/teacho', Employer: '/',
      Tourist: '/touro'
    }
    const redirectTo = isAdmin ? '/crm' : (isDriver ? '/drivo' : (routeMap[resolvedCategory] || '/rideo'))

    return NextResponse.json({
      success: true,
      session: sessionData.session,
      category: resolvedCategory,
      role: resolvedRole,
      full_name: profile.full_name,
      isDriver,
      isAdmin,
      redirect_to: redirectTo
    })

  } catch (error: any) {
    console.error('PIN Login API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
