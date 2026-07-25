import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const { phone, otp, fullName, category } = await request.json()

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
      // Anti-Spam Protection: Immediate purge of wrong OTP attempts to block brute-force attacks
      await supabase.from('whatsapp_otps').delete().or(`phone_number.eq.${cleanPhone},phone_number.eq.91${cleanPhone}`)
      return NextResponse.json({ error: 'Invalid OTP code. Please request a fresh OTP via WhatsApp.' }, { status: 400 })
    }

    const now = new Date()
    const expiresAt = new Date(record.expires_at)
    
    // CRITICAL: Check expiry BEFORE deleting — otherwise user cannot retry with a valid OTP
    if (now > expiresAt) {
      // Clean up the expired record
      await supabase.from('whatsapp_otps').delete()
        .or(`phone_number.eq.${cleanPhone},phone_number.eq.91${cleanPhone}`)
      return NextResponse.json({ error: 'OTP has expired. Please request a new OTP.' }, { status: 400 })
    }

    // Delete OTP (both 10-digit and 91-prefixed entries) to prevent reuse
    await supabase.from('whatsapp_otps').delete()
      .or(`phone_number.eq.${cleanPhone},phone_number.eq.91${cleanPhone}`)


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
    
    const userMetadata: any = {
      phone: cleanPhone,
      whatsapp_verified: true
    }
    if (fullName && fullName.trim()) userMetadata.full_name = fullName.trim()
    if (category && category.trim()) userMetadata.main_category = category.trim()

    if (!user) {
      // Create new user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: syntheticEmail,
        email_confirm: true,
        password: securePassword,
        user_metadata: userMetadata
      })
      
      if (createError) {
        console.error('Error creating user:', createError)
        return NextResponse.json({ error: 'Failed to create user account' }, { status: 500 })
      }
      user = newUser.user
    } else {
      // Update existing user with the new secure password and latest name/category
      const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
        password: securePassword,
        user_metadata: {
          ...user.user_metadata,
          ...userMetadata
        }
      })
      
      if (updateError) {
        console.error('Error updating user:', updateError)
        return NextResponse.json({ error: 'Failed to authenticate user' }, { status: 500 })
      }
    }

    // Check if profile already exists for this user/phone to prevent duplicate registrations or overwriting existing user names
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('full_name, main_category')
      .eq('id', user.id)
      .maybeSingle()

    // Auto-update profiles table with verified phone, full_name and main_category
    const profilePayload: any = {
      id: user.id,
      phone: cleanPhone,
      whatsapp: cleanPhone,
      updated_at: new Date().toISOString()
    }

    // Only set/update full_name if existing profile doesn't already have a valid custom name
    if (existingProfile?.full_name && !existingProfile.full_name.startsWith('User ')) {
      // Retain existing registered name to prevent name hijacking on duplicate login
      profilePayload.full_name = existingProfile.full_name
    } else if (fullName && fullName.trim()) {
      profilePayload.full_name = fullName.trim()
    } else if (user.user_metadata?.full_name) {
      profilePayload.full_name = user.user_metadata.full_name
    } else {
      profilePayload.full_name = `User ${cleanPhone.slice(-4)}`
    }

    // Only update category if existing profile doesn't have one or if category was explicitly passed
    if (existingProfile?.main_category) {
      profilePayload.main_category = existingProfile.main_category
    } else if (category && category.trim()) {
      profilePayload.main_category = category.trim()
    }

    await supabase.from('profiles').upsert(profilePayload, { onConflict: 'id' });

    try {
      await supabase.from('contacts').upsert({
        user_id: user.id,
        phone: cleanPhone,
        name: profilePayload.full_name,
        notes: profilePayload.main_category ? `Category: ${profilePayload.main_category}` : undefined
      });
    } catch (contactErr) {
      console.warn('Contact sync note:', contactErr);
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
