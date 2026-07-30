import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendTextMessage } from '@/lib/whatsapp/meta-api'

export async function POST(request: Request) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10)
    if (cleanPhone.length !== 10) {
      return NextResponse.json({ error: 'Invalid phone number. Must be 10 digits.' }, { status: 400 })
    }
    const ninetyOnePhone = `91${cleanPhone}`

    const supabase = supabaseAdmin()

    // 1. Check if this is a returning user and get their profile
    const { data: profileRecords } = await supabase
      .from('profiles')
      .select('full_name, main_category, role, pin_hash')
      .or(`phone.eq.${cleanPhone},phone.eq.91${cleanPhone},phone.eq.+91${cleanPhone},whatsapp.eq.${cleanPhone},whatsapp.eq.91${cleanPhone}`)
      .limit(1)

    const existingProfile = profileRecords?.[0] || null
    const isReturningUser = !!(existingProfile?.full_name)

    // 2. Generate 6-digit NUMERIC OTP (Valid for 10 minutes)
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    try {
      // Upsert OTP for both phone formats
      await supabase.from('whatsapp_otps').upsert([
        { phone_number: cleanPhone, otp, expires_at: expiresAt },
        { phone_number: ninetyOnePhone, otp, expires_at: expiresAt }
      ])
    } catch (err) {
      console.warn('Supabase OTP upsert note:', err)
    }

    // 3. Send OTP via WhatsApp
    const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN
    const META_PHONE_NUMBER_ID = process.env.META_PHONE_NUMBER_ID

    let whatsappSent = false
    if (META_ACCESS_TOKEN && META_PHONE_NUMBER_ID) {
      try {
        await sendTextMessage({
          accessToken: META_ACCESS_TOKEN,
          phoneNumberId: META_PHONE_NUMBER_ID,
          to: ninetyOnePhone,
          text: `🔑 *FAGO Login OTP: ${otp}*\n\nValid for 10 minutes.\nEnter this code on your FAGO login screen.\n\n⚠️ Do not share this code with anyone.\n\n– Team FAGO (தமிழன் AISHO)`
        })
        whatsappSent = true
      } catch (err) {
        console.warn('WhatsApp OTP send failed, OTP still valid:', err)
      }
    }

    return NextResponse.json({ 
      success: true, 
      is_returning_user: isReturningUser,
      full_name: isReturningUser ? existingProfile.full_name : null,
      main_category: isReturningUser ? existingProfile.main_category : null,
      has_pin: isReturningUser && !!(existingProfile.pin_hash),
      message: whatsappSent
        ? 'OTP sent via WhatsApp! Check your messages.'
        : 'OTP generated. Check your WhatsApp or use the code below.',
      // Only return OTP in dev mode for testing
      ...(process.env.NODE_ENV !== 'production' ? { otp } : {})
    })
  } catch (error: any) {
    console.error('Send OTP Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
