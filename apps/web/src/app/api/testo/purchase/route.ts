import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// POST /api/testo/purchase — submit UTR + screenshot for a test
export async function POST(request: Request) {
  try {
    const { paper_id, phone, utr, screenshot_url, user_id, user_name } = await request.json()

    if (!paper_id || !phone || !utr) {
      return NextResponse.json({ error: 'paper_id, phone and utr are required' }, { status: 400 })
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10)
    const cleanUtr = utr.trim().toUpperCase()

    const admin = getAdminClient()

    // Check if already purchased & verified
    const { data: existing } = await admin
      .from('test_purchases')
      .select('id, status')
      .eq('paper_id', paper_id)
      .eq('phone', cleanPhone)
      .in('status', ['verified'])
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'You have already purchased this test.', already_purchased: true }, { status: 400 })
    }

    // Check if UTR already submitted
    const { data: dupUtr } = await admin
      .from('test_purchases')
      .select('id, status')
      .eq('utr', cleanUtr)
      .maybeSingle()

    if (dupUtr) {
      return NextResponse.json({
        purchase_id: dupUtr.id,
        status: dupUtr.status,
        message: 'UTR already submitted. Checking status...'
      })
    }

    // Get paper details for amount
    const { data: paper } = await admin
      .from('test_papers')
      .select('price, title')
      .eq('id', paper_id)
      .single()

    const amount = paper?.price || 22

    // Insert into test_purchases
    const { data: purchase, error: purchaseErr } = await admin
      .from('test_purchases')
      .insert({
        user_id: user_id || null,
        paper_id,
        phone: cleanPhone,
        utr: cleanUtr,
        amount,
        screenshot_url: screenshot_url || null,
        status: 'pending',
      })
      .select()
      .single()

    if (purchaseErr) throw purchaseErr

    // Also insert into pending_payments for auto-verify
    await admin.from('pending_payments').insert({
      utr: cleanUtr,
      amount,
      phone: cleanPhone,
      service: `testo:${paper_id}`,
      status: 'pending',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24hr window for manual payments
    }).then(r => { if (r.error) console.warn('pending_payments insert warn:', r.error.message) })

    return NextResponse.json({
      success: true,
      purchase_id: purchase.id,
      status: 'pending',
      message: 'Payment submitted. Verification usually takes 5-15 minutes.',
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
