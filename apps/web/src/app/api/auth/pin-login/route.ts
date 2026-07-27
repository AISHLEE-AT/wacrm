import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const { phone, pin } = await request.json()

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10)
    const supabase = supabaseAdmin()

    // 1. Check if user profile exists for this phone number
    const { data: records } = await supabase
      .from('profiles')
      .select('id, full_name, main_category, role')
      .or(`phone.eq.${cleanPhone},phone.eq.91${cleanPhone},phone.eq.+91${cleanPhone},email.eq.${cleanPhone}@whatsapp.wacrm.local`);

    const profile = records?.[0]

    if (!profile) {
      return NextResponse.json({ error: 'No registered account found for this mobile number. Please request a WhatsApp OTP first.' }, { status: 404 })
    }

    // 2. Manage User Session in Supabase Auth Admin
    const syntheticEmail = `${cleanPhone}@whatsapp.wacrm.local`
    const securePassword = crypto.randomBytes(32).toString('hex')

    let { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    if (listError) {
      console.error('Error listing users:', listError)
      return NextResponse.json({ error: 'Authentication error' }, { status: 500 })
    }

    let user = users.find(u => u.email === syntheticEmail)

    if (!user) {
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: syntheticEmail,
        email_confirm: true,
        password: securePassword,
        user_metadata: { phone: cleanPhone, full_name: profile.full_name, main_category: profile.main_category, quick_pin: pin || '1234' }
      })
      if (createError || !newUser.user) {
        return NextResponse.json({ error: 'Failed to authenticate account' }, { status: 500 })
      }
      user = newUser.user
    } else {
      const existingPin = user.user_metadata?.quick_pin
      if (existingPin && pin && existingPin !== pin) {
        return NextResponse.json({ error: 'Incorrect 4-Digit Quick PIN. Please try again or verify via WhatsApp OTP.' }, { status: 400 })
      }

      await supabase.auth.admin.updateUserById(user.id, {
        password: securePassword,
        user_metadata: {
          ...user.user_metadata,
          ...(pin && !existingPin ? { quick_pin: pin } : {})
        }
      })
    }

    // 3. Sign in to generate a fresh Supabase session
    const standardSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: sessionData, error: signInError } = await standardSupabase.auth.signInWithPassword({
      email: syntheticEmail,
      password: securePassword
    })

    if (signInError || !sessionData.session) {
      console.error('Error signing in:', signInError)
      return NextResponse.json({ error: 'Failed to generate session' }, { status: 500 })
    }

    const isAdminPhone = cleanPhone === "9486335870" || cleanPhone === "919486335870" || cleanPhone.endsWith("9486335870") || profile.role === "admin" || profile.role === "ADMIN";

    // Check driver verification status in drivers table
    const { data: driverRecords } = await supabase
      .from('drivers')
      .select('id, is_verified')
      .or(`mobile_number.eq.${cleanPhone},mobile_number.eq.91${cleanPhone},whatsapp_number.eq.${cleanPhone},user_id.eq.${profile.id}`);
    const isDriver = (driverRecords && driverRecords.length > 0 && driverRecords[0].is_verified) || profile.role === "driver" || profile.role === "DRIVER";

    const resolvedRole = isAdminPhone ? "admin" : (isDriver ? "driver" : (profile.role || "user"));
    const resolvedCategory = isDriver ? "Driver" : (profile.main_category || "Traveller");

    return NextResponse.json({
      success: true,
      session: sessionData.session,
      category: resolvedCategory,
      role: resolvedRole,
      isDriver: isDriver,
      isAdmin: isAdminPhone
    })

  } catch (error: any) {
    console.error('PIN Login API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
