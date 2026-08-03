import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

function hashPin(pin: string): string {
  return crypto.createHash('sha256').update(`FAGO_PIN_${pin}`).digest('hex')
}

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: Request) {
  try {
    const { phone, pin, confirmPin } = await request.json()

    if (!phone || !pin || !confirmPin) {
      return NextResponse.json({ error: 'Phone, PIN and confirm PIN are required' }, { status: 400 })
    }

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return NextResponse.json({ error: 'PIN must be exactly 4 digits' }, { status: 400 })
    }

    if (pin !== confirmPin) {
      return NextResponse.json({ error: 'PINs do not match. Please try again.' }, { status: 400 })
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10)
    if (cleanPhone.length !== 10) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    }

    const admin = getAdminClient()
    const pinHash = hashPin(pin)

    // Update pin_hash for this phone
    const { error } = await admin
      .from('profiles')
      .update({ pin_hash: pinHash, pin_set_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .or(`phone.eq.${cleanPhone},phone.eq.91${cleanPhone},whatsapp.eq.${cleanPhone},whatsapp.eq.91${cleanPhone}`)

    if (error) {
      console.error('Error saving PIN:', error)
      return NextResponse.json({ error: 'Failed to save PIN. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'PIN saved successfully' })
  } catch (err: any) {
    console.error('PIN Set Route Error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
