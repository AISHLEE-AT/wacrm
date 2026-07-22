import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const { phone, otp } = await request.json()

    if (!phone || !otp) {
      return NextResponse.json({ error: 'Phone and OTP are required' }, { status: 400 })
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10)
    const supabase = supabaseAdmin()

    // 1. Verify OTP in database (support 10-digit & 91-prefixed phone keys)
    const { data: records, error: dbError } = await supabase
      .from('whatsapp_otps')
      .select('*')
      .or(`phone_number.eq.${cleanPhone},phone_number.eq.91${cleanPhone}`)

    const record = records?.[0]

    if (dbError || !record) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 })
    }

    if (record.otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 })
    }

    const now = new Date()
    const expiresAt = new Date(record.expires_at)
    
    // Delete OTP to prevent reuse
    await supabase.from('whatsapp_otps').delete().eq('phone_number', cleanPhone)

    if (now > expiresAt) {
      return NextResponse.json({ error: 'OTP has expired' }, { status: 400 })
    }

    // 2. Manage the User in Supabase Auth
    const syntheticEmail = `${cleanPhone}@whatsapp.wacrm.local`
    const securePassword = crypto.randomBytes(32).toString('hex') // new random password for this session
    
    // Check if user exists
    let { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('Error listing users:', listError)
      return NextResponse.json({ error: 'Authentication error' }, { status: 500 })
    }
    
    let user = users.find(u => u.email === syntheticEmail)
    
    if (!user) {
      // Create new user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: syntheticEmail,
        email_confirm: true,
        password: securePassword,
        user_metadata: {
          phone: cleanPhone,
          whatsapp_verified: true
        }
      })
      
      if (createError) {
        console.error('Error creating user:', createError)
        return NextResponse.json({ error: 'Failed to create user account' }, { status: 500 })
      }
      user = newUser.user
    } else {
      // Update existing user with the new secure password so we can sign in
      const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
        password: securePassword
      })
      
      if (updateError) {
        console.error('Error updating user password:', updateError)
        return NextResponse.json({ error: 'Failed to authenticate user' }, { status: 500 })
      }
    }

    // 3. Sign in to generate a session (using standard client to get session)
    const standardSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    const { data: sessionData, error: signInError } = await standardSupabase.auth.signInWithPassword({
      email: syntheticEmail,
      password: securePassword
    })

    if (signInError) {
      console.error('Error signing in:', signInError)
      return NextResponse.json({ error: 'Failed to generate session' }, { status: 500 })
    }

    // 4. Return session tokens to the mobile app
    return NextResponse.json({ 
      success: true, 
      session: sessionData.session 
    })
    
  } catch (error: any) {
    console.error('Verify OTP Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
