import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Unified admin phones — DB role='admin' is source of truth
// These are bootstrap-only fallbacks
const BOOTSTRAP_ADMIN_PHONES = [
  '9486335870', '919486335870'
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
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'fago_wacrm_auth_secret_key'
    const securePassword = crypto.createHmac('sha256', serviceKey).update(`FAGO_AUTH_${cleanPhone}`).digest('hex')
    
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
      // Ensure password and metadata are in sync without race condition
      await supabase.auth.admin.updateUserById(user.id, {
        password: securePassword,
        user_metadata: { ...user.user_metadata, whatsapp_verified: true, phone: cleanPhone }
      }).catch(() => {})
    }

    // 3. Get/build profile payload with DUAL ID + PHONE lookup
    const { data: matchedProfiles } = await supabase
      .from('profiles')
      .select('id, full_name, main_category, role, pin_hash')
      .or(`id.eq.${user.id},phone.eq.${cleanPhone},phone.eq.91${cleanPhone},whatsapp.eq.${cleanPhone},whatsapp.eq.91${cleanPhone}`)

    let bestName: string | null = null
    let bestCategory: string | null = null
    let bestRole: string | null = null
    let bestPinHash: string | null = null

    if (matchedProfiles && matchedProfiles.length > 0) {
      for (const p of matchedProfiles) {
        if (p.full_name && !p.full_name.startsWith('User ') && !p.full_name.match(/^\d+$/)) {
          bestName = p.full_name
        }
        if (p.main_category && p.main_category !== 'Traveller') {
          bestCategory = p.main_category
        } else if (p.main_category && !bestCategory) {
          bestCategory = p.main_category
        }
        if (p.role && p.role !== 'user') {
          bestRole = p.role
        } else if (p.role && !bestRole) {
          bestRole = p.role
        }
        if (p.pin_hash) {
          bestPinHash = p.pin_hash
        }
      }

      const oldIds = matchedProfiles.map((p: any) => p.id).filter((id: string) => id !== user.id)
      if (oldIds.length > 0) {
        await supabase.from('profiles').delete().in('id', oldIds)
      }
    }

    // Determine role: DB first, then bootstrap fallback
    const isBootstrapAdmin = BOOTSTRAP_ADMIN_PHONES.some(p =>
      cleanPhone === p || cleanPhone === p.slice(-10)
    )
    const dbRole = bestRole
    const isAdmin = dbRole === 'admin' || dbRole === 'ADMIN' || isBootstrapAdmin

    // Check driver status
    const { data: driverRecords } = await supabase
      .from('drivers')
      .select('id, is_verified')
      .or(`mobile_number.eq.${cleanPhone},mobile_number.eq.91${cleanPhone},user_id.eq.${user.id}`)
    const isDriver = (driverRecords && driverRecords.length > 0 && driverRecords[0].is_verified)
      || dbRole === 'driver' || dbRole === 'DRIVER'

    const resolvedRole = isAdmin ? 'admin' : (isDriver ? 'driver' : (dbRole || 'user'))
    const resolvedCategory = isDriver ? 'Driver' : (bestCategory || category || 'Traveller')

    // PIN hash: use bcrypt-compatible SHA-256 for cross-platform compatibility
    let pinHash: string | undefined = bestPinHash || undefined
    if (pin && pin.length === 4) {
      pinHash = crypto.createHash('sha256').update(`FAGO_PIN_${cleanPhone}_${pin}`).digest('hex')
    }

    const finalName = (bestName && !bestName.startsWith('User '))
      ? bestName
      : (fullName && fullName.trim()) ? fullName.trim() : `User ${cleanPhone.slice(-4)}`

    // Build profile payload
    const profilePayload: Record<string, any> = {
      id: user.id,
      phone: cleanPhone,
      whatsapp: cleanPhone,
      full_name: finalName,
      main_category: resolvedCategory,
      role: resolvedRole,
      updated_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
      platform: 'web',
    }
    if (pinHash) profilePayload.pin_hash = pinHash

    await supabase.from('profiles').upsert(profilePayload, { onConflict: 'id' })

    // Sync Auth Metadata
    await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: {
        phone: cleanPhone,
        full_name: finalName,
        main_category: resolvedCategory,
        role: resolvedRole,
        whatsapp_verified: true,
      }
    })

    // Sync contact
    try {
      await supabase.from('contacts').upsert({
        user_id: user.id,
        phone: cleanPhone,
        name: profilePayload.full_name,
        notes: `Category: ${profilePayload.main_category}`
      })
    } catch { /* non-critical */ }

    // 4. Generate Supabase session with fail-safe retry
    const standardSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    let sessionData = await standardSupabase.auth.signInWithPassword({
      email: syntheticEmail,
      password: securePassword
    })

    if (sessionData.error || !sessionData.data.session) {
      console.warn('First signInWithPassword attempt failed, syncing user password & retrying:', sessionData.error?.message)
      await supabase.auth.admin.updateUserById(user.id, {
        password: securePassword,
        email_confirm: true,
        user_metadata: { phone: cleanPhone, whatsapp_verified: true }
      }).catch(() => {})

      sessionData = await standardSupabase.auth.signInWithPassword({
        email: syntheticEmail,
        password: securePassword
      })
    }

    if (sessionData.error || !sessionData.data.session) {
      console.error('Error signing in after retry:', sessionData.error)
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
      session: sessionData.data.session,
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
