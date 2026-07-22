import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendTextMessage } from '@/lib/whatsapp/meta-api'

export async function POST(request: Request) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    // Format phone number (remove +, spaces, dashes, etc.)
    const cleanPhone = phone.replace(/\D/g, '')

    // Generate 6-digit NUMERIC OTP (e.g. 492015)
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Expires in 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    const supabase = supabaseAdmin()

    // 1. Store the OTP in the database
    const { error: dbError } = await supabase
      .from('whatsapp_otps')
      .upsert(
        { phone_number: cleanPhone, otp, expires_at: expiresAt },
        { onConflict: 'phone_number' }
      )

    if (dbError) {
      console.error('Error saving OTP:', dbError)
      return NextResponse.json({ error: 'Failed to generate OTP' }, { status: 500 })
    }

    // 2. Send the WhatsApp message
    const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN
    const META_PHONE_NUMBER_ID = process.env.META_PHONE_NUMBER_ID

    if (!META_ACCESS_TOKEN || !META_PHONE_NUMBER_ID) {
      console.warn('Missing Meta configuration, returning fallback OTP response')
      return NextResponse.json({ success: true, message: 'OTP saved successfully', fallbackOtp: otp })
    }

    // Attempt 1: Direct text message
    try {
      await sendTextMessage({
        accessToken: META_ACCESS_TOKEN,
        phoneNumberId: META_PHONE_NUMBER_ID,
        to: cleanPhone,
        text: `🔐 YOUR FAGO LOGIN OTP IS: ${otp}\n\nValid for 10 minutes. Enter this code on your FAGO login screen to sign in.\n\nDo not share this code with anyone.`
      })
    } catch (textErr) {
      console.warn('Direct WhatsApp text message failed, attempting template payload:', textErr)
      
      // Attempt 2: Template message
      const payload = {
        messaging_product: 'whatsapp',
        to: cleanPhone,
        type: 'template',
        template: {
          name: 'app_login_otp',
          language: { code: 'en' },
          components: [
            { type: 'body', parameters: [{ type: 'text', text: otp }] }
          ]
        }
      }

      await fetch(`https://graph.facebook.com/v21.0/${META_PHONE_NUMBER_ID}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${META_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
    }

    return NextResponse.json({ success: true, message: 'OTP sent successfully', fallbackOtp: otp })
  } catch (error: any) {
    console.error('Send OTP Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
