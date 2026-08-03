import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Called by Google Apps Script every 5 minutes after reading HDFC email
// Body: { utr: string, amount: number, secret: string }
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { utr, amount, secret } = body

    // Validate webhook secret
    if (secret !== process.env.UPI_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!utr || !amount) {
      return NextResponse.json({ error: 'UTR and amount required' }, { status: 400 })
    }

    const admin = getAdmin()

    // Find matching pending payment — must be within 5-minute window and not expired
    const { data: payment, error } = await admin
      .from('pending_payments')
      .select('*')
      .eq('utr', utr.trim())
      .eq('status', 'pending')
      .gte('expires_at', new Date().toISOString())
      .order('submitted_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error || !payment) {
      console.log('[UPI verify] No matching pending payment for UTR:', utr)
      return NextResponse.json({ matched: false, message: 'No pending payment found for this UTR' })
    }

    // Validate amount matches (allow ±1 rupee tolerance for rounding)
    const paidAmount = Number(amount)
    const expectedAmount = Number(payment.amount)
    if (Math.abs(paidAmount - expectedAmount) > 1) {
      // Mark as failed
      await admin.from('pending_payments')
        .update({ status: 'failed', verified_at: new Date().toISOString() })
        .eq('id', payment.id)

      console.log(`[UPI verify] Amount mismatch for UTR ${utr}: expected ₹${expectedAmount}, got ₹${paidAmount}`)
      return NextResponse.json({ matched: false, message: 'Amount mismatch' })
    }

    // ✅ MATCH — mark as verified
    await admin.from('pending_payments')
      .update({ status: 'verified', verified_at: new Date().toISOString() })
      .eq('id', payment.id)

    // Unlock testo purchase if applicable
    if (payment.service.startsWith('testo:')) {
      await admin.from('test_purchases')
        .update({ status: 'verified', verified_at: new Date().toISOString() })
        .eq('utr', utr)
    }

    // Send WhatsApp CRM confirmation to user
    const serviceLabel: Record<string, string> = {
      rento: '🚜 RentO Equipment Booking',
      tasko: '📋 TaskO Gig Payment',
      drivo_sub: '🚗 DriveO Subscription',
      touro: '🛕 TourO Package Booking',
      dealo: '🛍️ DealO Purchase',
    }
    const label = serviceLabel[payment.service] || '✅ SuprO Payment'

    const whatsappMessage = `✅ *Payment Verified!*

${label}
💰 Amount: ₹${expectedAmount}
🔖 UTR: \`${utr}\`
📅 Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

உங்கள் பணம் வெற்றிகரமாக பெறப்பட்டது!
Your payment has been received successfully.

🙏 Thank you for using SuprO — for Local Needs!
watscrm.vercel.app`

    // Send via our WhatsApp CRM API
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://watscrm.vercel.app'}/api/whatsapp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: payment.phone,
          message: whatsappMessage,
          type: 'text',
        }),
      })
    } catch (waErr) {
      console.error('[UPI verify] WhatsApp send failed:', waErr)
      // Don't fail the verification if WA send fails
    }

    console.log(`[UPI verify] ✅ Verified payment: UTR=${utr}, ₹${expectedAmount}, phone=${payment.phone}`)

    return NextResponse.json({
      matched: true,
      message: 'Payment verified and WhatsApp confirmation sent',
      payment: {
        id: payment.id,
        service: payment.service,
        amount: expectedAmount,
        phone: payment.phone,
        utr,
      },
    })
  } catch (err: any) {
    console.error('[UPI verify] Error:', err)
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}
