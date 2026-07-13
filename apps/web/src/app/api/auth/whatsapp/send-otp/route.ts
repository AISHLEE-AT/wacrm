import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    // Format phone number (remove +, spaces, dashes, etc.)
    const cleanPhone = phone.replace(/\D/g, '')

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString()
    
    // Expires in 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()

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
      console.error('Missing Meta configuration')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const payload = {
      messaging_product: 'whatsapp',
      to: cleanPhone,
      type: 'template',
      template: {
        name: 'app_login_otp',
        language: {
          code: 'en'
        },
        components: [
          {
            type: 'body',
            parameters: [
              {
                type: 'text',
                text: otp
              }
            ]
          },
          {
            type: 'button',
            sub_type: 'url',
            index: 0,
            parameters: [
              {
                type: 'text',
                text: otp
              }
            ]
          }
        ]
      }
    }

    const res = await fetch(`https://graph.facebook.com/v21.0/${META_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${META_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('Meta API Error:', JSON.stringify(data, null, 2))
      return NextResponse.json({ error: 'Failed to send WhatsApp message' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'OTP sent successfully' })
  } catch (error: any) {
    console.error('Send OTP Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
