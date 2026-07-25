import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10)
    const supabase = supabaseAdmin()

    // 1. Check if user profile exists for this phone number
    const { data: records } = await supabase
      .from('profiles')
      .select('id, full_name, main_category')
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
        user_metadata: { phone: cleanPhone, full_name: profile.full_name, main_category: profile.main_category }
      })
      if (createError || !newUser.user) {
        return NextResponse.json({ error: 'Failed to authenticate account' }, { status: 500 })
      }
      user = newUser.user
    } else {
      await supabase.auth.admin.updateUserById(user.id, {
        password: securePassword
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

    return NextResponse.json({
      success: true,
      session: sessionData.session,
      category: profile.main_category || 'Traveller'
    })

  } catch (error: any) {
    console.error('PIN Login API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
