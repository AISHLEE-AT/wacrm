import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { phone } = await request.json()
    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }
    const cleanPhone = phone.replace(/\D/g, '').slice(-10)
    if (cleanPhone.length !== 10) {
      return NextResponse.json({ error: 'Invalid 10-digit phone number' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'OTP request initiated. Please send the WhatsApp verification message.',
      phone: cleanPhone,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to process OTP request' }, { status: 500 })
  }
}
