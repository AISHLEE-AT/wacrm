import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// User submits their UTR after paying via UPI
// Body: { utr: string, amount: number, phone: string, service: string }
export async function POST(request: Request) {
  try {
    const { utr, amount, phone, service } = await request.json()

    if (!utr || !amount || !phone) {
      return NextResponse.json({ error: 'UTR, amount, and phone are required' }, { status: 400 })
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10)
    const admin = getAdmin()

    // Check for duplicate UTR submission
    const { data: existing } = await admin
      .from('pending_payments')
      .select('id, status')
      .eq('utr', utr.trim())
      .maybeSingle()

    if (existing) {
      if (existing.status === 'verified') {
        return NextResponse.json({ error: 'This UTR has already been verified.' }, { status: 400 })
      }
      if (existing.status === 'pending') {
        return NextResponse.json({
          success: true,
          message: 'Already submitted. Verification is in progress — you will receive a WhatsApp confirmation within 5 minutes.',
          id: existing.id,
        })
      }
    }

    // Insert new pending payment (expires in 5 minutes)
    const { data: payment, error } = await admin
      .from('pending_payments')
      .insert({
        utr: utr.trim(),
        amount: Number(amount),
        phone: cleanPhone,
        service: service || 'general',
        status: 'pending',
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('[payments/submit] Insert error:', error)
      return NextResponse.json({ error: 'Failed to submit payment' }, { status: 500 })
    }

    // Immediately send a "we received your UTR" WhatsApp acknowledgement
    try {
      const ackMessage = `⏳ *Payment Verification Started*

UTR: \`${utr.trim()}\`
Amount: ₹${amount}
Service: ${service || 'SuprO'}

உங்கள் UTR பெறப்பட்டது! 5 நிமிடங்களுக்குள் தானாக சரிபார்க்கப்படும்.
Your UTR has been received and will be auto-verified within 5 minutes.

📞 SuprO — for Local Needs
watscrm.vercel.app`

      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://watscrm.vercel.app'}/api/whatsapp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: cleanPhone, message: ackMessage, type: 'text' }),
      })
    } catch {
      // Non-fatal
    }

    return NextResponse.json({
      success: true,
      message: 'UTR submitted. You will receive WhatsApp confirmation within 5 minutes.',
      id: payment.id,
    })
  } catch (err: any) {
    console.error('[payments/submit] Error:', err)
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}
