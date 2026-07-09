import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST /api/tradeo/quotes
// Body: { provider_phone: string, price: number, provider_message?: string }
export async function POST(request: Request) {
  try {
    const { provider_phone, price, provider_message = '' } = await request.json()

    if (!provider_phone || !price) {
      return NextResponse.json({ error: 'provider_phone and price required' }, { status: 400 })
    }

    if (price <= 0 || price > 10000000) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 })
    }

    // 1. Find provider
    const { data: provider } = await supabaseAdmin()
      .from('providers')
      .select('id')
      .eq('phone_number', provider_phone)
      .eq('is_active', true)
      .maybeSingle()

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found or inactive' }, { status: 404 })
    }

    // 2. Find oldest pending quote
    const { data: pendingQuote } = await supabaseAdmin()
      .from('quotes')
      .select('id, request_id')
      .eq('provider_id', provider.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (!pendingQuote) {
      return NextResponse.json({ error: 'No pending quotes found for this provider' }, { status: 404 })
    }

    // 3. Update the quote
    const { error: updateErr } = await supabaseAdmin()
      .from('quotes')
      .update({
        price,
        provider_message: provider_message || `₹${price}`,
        status: 'submitted'
      })
      .eq('id', pendingQuote.id)

    if (updateErr) throw updateErr

    return NextResponse.json({ 
      success: true, 
      quote_id: pendingQuote.id,
      request_id: pendingQuote.request_id 
    })

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
