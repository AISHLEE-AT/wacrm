import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function sendWhatsAppText(phone: string, message: string) {
  const token = process.env.META_ACCESS_TOKEN
  const phoneId = process.env.META_PHONE_NUMBER_ID
  await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: phone,
      type: 'text',
      text: { body: message }
    })
  })
}

export async function POST(request: Request) {
  try {
    const { request_id, quote_id } = await request.json()
    if (!request_id || !quote_id) {
      return NextResponse.json({ error: 'request_id and quote_id required' }, { status: 400 })
    }

    // Get the winning quote + provider
    const { data: winnerQuote, error: qErr } = await supabase()
      .from('quotes')
      .select('id, price, provider_id, providers(phone_number, business_name)')
      .eq('id', quote_id)
      .single()

    if (qErr || !winnerQuote) throw new Error('Quote not found')

    // Get the request details
    const { data: req } = await supabase()
      .from('requests')
      .select('item_requested, pincode, buyer_phone, buyer_user_id')
      .eq('id', request_id)
      .single()

    // Get all OTHER quotes for this request
    const { data: otherQuotes } = await supabase()
      .from('quotes')
      .select('id, provider_id, providers(phone_number)')
      .eq('request_id', request_id)
      .neq('id', quote_id)

    // Update request as closed with winner
    await supabase()
      .from('requests')
      .update({ status: 'closed', winner_provider_id: winnerQuote.provider_id })
      .eq('id', request_id)

    // Mark winner quote
    await supabase().from('quotes').update({ status: 'won' }).eq('id', quote_id)

    // Mark other quotes as lost
    const otherIds = (otherQuotes || []).map((q: Record<string, unknown>) => q.id)
    if (otherIds.length > 0) {
      await supabase().from('quotes').update({ status: 'lost' }).in('id', otherIds)
    }

    // Get winner phone number
    const provider = winnerQuote.providers as unknown as { phone_number: string; business_name: string }
    const winnerPhone = provider?.phone_number
    const buyerPhone = req?.buyer_phone || 'the buyer'

    // Send winner WhatsApp message (they initiated a conversation so 24hr window is open)
    if (winnerPhone) {
      await sendWhatsAppText(
        winnerPhone,
        `🎉 Congratulations! Your quote of ₹${winnerQuote.price} for "${req?.item_requested}" has been accepted! The buyer will contact you soon. Thank you for using our service!`
      ).catch(e => console.error('Winner WA failed:', e))
    }

    // Send loser messages
    for (const q of otherQuotes || []) {
      const loserProvider = q.providers as unknown as { phone_number: string }
      if (loserProvider?.phone_number) {
        await sendWhatsAppText(
          loserProvider.phone_number,
          `Thank you for your quote for "${req?.item_requested}". Unfortunately, another provider was selected this time. We'll notify you for future requests in your area!`
        ).catch(e => console.error('Loser WA failed:', e))
      }
    }

    return NextResponse.json({
      success: true,
      winner: { quote_id, price: winnerQuote.price, provider: provider?.business_name }
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
