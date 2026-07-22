import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendTextMessage } from '@/lib/whatsapp/meta-api'

export async function POST(request: Request) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    const cleanPhone = phone.replace(/\D/g, '')
    const tenDigitPhone = cleanPhone.slice(-10)
    const ninetyOnePhone = `91${tenDigitPhone}`

    // Generate 6-digit NUMERIC OTP (Valid for 10 minutes)
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    const supabase = supabaseAdmin()

    // 1. Store the OTP in the database under both 10-digit and 91-prefixed keys
    const { error: dbError } = await supabase
      .from('whatsapp_otps')
      .upsert([
        { phone_number: tenDigitPhone, otp, expires_at: expiresAt },
        { phone_number: ninetyOnePhone, otp, expires_at: expiresAt }
      ])

    if (dbError) {
      console.error('Error saving OTP:', dbError)
      return NextResponse.json({ error: 'Failed to generate OTP' }, { status: 500 })
    }

    // 2. ZERO-COST FREE SESSION REPLY (No Paid Meta Templates)
    const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN
    const META_PHONE_NUMBER_ID = process.env.META_PHONE_NUMBER_ID

    if (META_ACCESS_TOKEN && META_PHONE_NUMBER_ID) {
      try {
        await sendTextMessage({
          accessToken: META_ACCESS_TOKEN,
          phoneNumberId: META_PHONE_NUMBER_ID,
          to: cleanPhone,
          text: `🔑 YOUR FAGO LOGIN OTP IS: ${otp}\n\nValid for 10 minutes. Enter this code on your FAGO login screen to sign in.\n\nDo not share this code with anyone.`
        })
      } catch (err) {
        console.warn('Free session text send note (user can send incoming message to trigger reply):', err)
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'OTP generated successfully. Tap "Send WhatsApp Message" to receive it for FREE via WhatsApp!',
      fallbackOtp: otp 
    })
  } catch (error: any) {
    console.error('Send OTP Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
