import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Unified admin phones — DB role='admin' is source of truth
// These are bootstrap-only fallbacks
const BOOTSTRAP_ADMIN_PHONES = [
  '9486335870', '919486335870',
  '9123596988', '919123596988'
]

export async function POST(request: Request) {
  try {
    const { phone, otp, fullName, category, pin } = await request.json()

    if (!phone || !otp) {
      return NextResponse.json({ error: 'Phone and OTP are required' }, { status: 400 })
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10)
    const supabase = supabaseAdmin()

    // 1. Verify OTP in database
    const { data: records, error: dbError } = await supabase
      .from('whatsapp_otps')
      .select('*')
      .or(`phone_number.eq.${cleanPhone},phone_number.eq.91${cleanPhone}`)

    const record = records?.[0]

    if (dbError || !record) {
      return NextResponse.json({ error: 'Invalid or expired OTP. Please request a new one.' }, { status: 400 })
    }

    // Check expiry BEFORE verifying OTP
    const now = new Date()
    const expiresAt = new Date(record.expires_at)
    if (now > expiresAt) {
      await supabase.from('whatsapp_otps').delete()
        .or(`phone_number.eq.${cleanPhone},phone_number.eq.91${cleanPhone}`)
      return NextResponse.json({ error: 'OTP has expired. Please request a new OTP.' }, { status: 400 })
    }

    if (record.otp !== otp) {
      // Purge on wrong attempt to block brute-force
      await supabase.from('whatsapp_otps').delete()
        .or(`phone_number.eq.${cleanPhone},phone_number.eq.91${cleanPhone}`)
      return NextResponse.json({ error: 'Incorrect OTP. Please request a fresh OTP.' }, { status: 400 })
    }

    // Delete used OTP
    await supabase.from('whatsapp_otps').delete()
      .or(`phone_number.eq.${cleanPhone},phone_number.eq.91${cleanPhone}`)

    // 2. Manage Supabase Auth user (email-based with synthetic email)
    const syntheticEmail = `${cleanPhone}@whatsapp.wacrm.local`
    const securePassword = crypto.randomBytes(32).toString('hex')
    
    // Find or create user
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 })
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
        user_metadata: { phone: cleanPhone, whatsapp_verified: true }
      })
      if (createError || !newUser.user) {
        console.error('Error creating user:', createError)
        return NextResponse.json({ error: 'Failed to create user account' }, { status: 500 })
      }
      user = newUser.user
    } else {
      // Rotate password for fresh session
      await supabase.auth.admin.updateUserById(user.id, {
        password: securePassword,
        user_metadata: { ...user.user_metadata, whatsapp_verified: true, phone: cleanPhone }
      })
    }

    // 3. Get/build profile payload
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('full_name, main_category, role, pin_hash')
      .eq('id', user.id)
      .maybeSingle()

    // Determine role: DB first, then bootstrap fallback
    const isBootstrapAdmin = BOOTSTRAP_ADMIN_PHONES.some(p =>
      cleanPhone === p || cleanPhone === p.slice(-10)
    )
    const dbRole = existingProfile?.role
    const isAdmin = dbRole === 'admin' || dbRole === 'ADMIN' || isBootstrapAdmin

    // Check driver status
    const { data: driverRecords } = await supabase
      .from('drivers')
      .select('id, is_verified')
      .or(`mobile_number.eq.${cleanPhone},mobile_number.eq.91${cleanPhone},user_id.eq.${user.id}`)
    const isDriver = (driverRecords && driverRecords.length > 0 && driverRecords[0].is_verified)
      || dbRole === 'driver' || dbRole === 'DRIVER'

    const resolvedRole = isAdmin ? 'admin' : (isDriver ? 'driver' : (dbRole || 'user'))
    const resolvedCategory = isDriver ? 'Driver' : (existingProfile?.main_category || category || 'Traveller')

    // PIN hash: use bcrypt-compatible SHA-256 for cross-platform compatibility
    let pinHash: string | undefined
    if (pin && pin.length === 4) {
      pinHash = crypto.createHash('sha256').update(`FAGO_PIN_${cleanPhone}_${pin}`).digest('hex')
    }

    // Build profile upsert
    const profilePayload: Record<string, any> = {
      id: user.id,
      phone: cleanPhone,
      whatsapp: cleanPhone,
      updated_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
      platform: 'web',
    }

    // Preserve existing name if it's a real name (not auto-generated)
    if (existingProfile?.full_name && !existingProfile.full_name.startsWith('User ')) {
      profilePayload.full_name = existingProfile.full_name
    } else if (fullName && fullName.trim()) {
      profilePayload.full_name = fullName.trim()
    } else {
      profilePayload.full_name = `User ${cleanPhone.slice(-4)}`
    }

    // Only set category if not already set
    if (existingProfile?.main_category) {
      profilePayload.main_category = existingProfile.main_category
    } else if (category && category.trim()) {
      profilePayload.main_category = category.trim()
    } else {
      profilePayload.main_category = 'Traveller'
    }

    // Set role from DB or promote bootstrap admin
    profilePayload.role = resolvedRole

    // Store PIN hash if provided
    if (pinHash) {
      profilePayload.pin_hash = pinHash
    }

    await supabase.from('profiles').upsert(profilePayload, { onConflict: 'id' })

    // Sync contact
    try {
      await supabase.from('contacts').upsert({
        user_id: user.id,
        phone: cleanPhone,
        name: profilePayload.full_name,
        notes: `Category: ${profilePayload.main_category}`
      })
    } catch { /* non-critical */ }

    // 4. Generate Supabase session
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
      return NextResponse.json({ error: 'Failed to generate session. Please try again.' }, { status: 500 })
    }

    // 5. Determine post-login redirect hint
    const redirectTo = isAdmin ? '/crm'
      : isDriver ? '/drivo'
      : (() => {
          const cat = profilePayload.main_category
          const routeMap: Record<string, string> = {
            Traveller: '/rideo', Driver: '/drivo', Farmer: '/rento',
            Shopper: '/dealo', Student: '/teacho', Teacher: '/teacho',
            Financier: '/moneyo', JobSeeker: '/teacho', Employer: '/',
            Tourist: '/touro'
          }
          return routeMap[cat] || '/rideo'
        })()

    return NextResponse.json({
      success: true,
      session: sessionData.session,
      role: resolvedRole,
      category: resolvedCategory,
      full_name: profilePayload.full_name,
      isDriver,
      isAdmin,
      redirect_to: redirectTo
    })
    
  } catch (error: any) {
    console.error('Verify OTP Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
