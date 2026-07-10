import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { HARDCODED_WHATSAPP_CONFIG } from '@/lib/whatsapp/hardcoded-config'

const supabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function sendWhatsAppTemplate(phone: string, item: string, pincode: string) {
  const token = HARDCODED_WHATSAPP_CONFIG.access_token
  const phoneId = HARDCODED_WHATSAPP_CONFIG.phone_number_id
  const url = `https://graph.facebook.com/v19.0/${phoneId}/messages`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: phone,
      type: 'template',
      template: {
        name: '_service_request_alert',
        language: { code: 'en' },
        components: [{
          type: 'body',
          parameters: [
            { type: 'text', text: item },
            { type: 'text', text: pincode }
          ]
        }]
      }
    })
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || 'WhatsApp send failed')
  return data.messages?.[0]?.id
}

export async function POST(request: Request) {
  try {
    const { request_id, provider_ids, item_requested, pincode } = await request.json()
    if (!request_id || !provider_ids?.length) {
      return NextResponse.json({ error: 'request_id and provider_ids required' }, { status: 400 })
    }

    // Fetch selected providers
    const { data: providers, error } = await supabase()
      .from('providers')
      .select('id, phone_number, business_name')
      .in('id', provider_ids)

    if (error) throw error

    // Set auto-select time (5 minutes from now)
    const autoSelectAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()
    await supabase()
      .from('requests')
      .update({ status: 'broadcasted', auto_select_at: autoSelectAt })
      .eq('id', request_id)

    // Broadcast to each provider
    const results = []
    for (const p of providers || []) {
      try {
        const msgId = await sendWhatsAppTemplate(p.phone_number, item_requested, pincode)

        // Create a pending quote record so the webhook can match replies
        await supabase()
          .from('quotes')
          .insert({
            request_id,
            provider_id: p.id,
            price: 0,
            status: 'pending',
            whatsapp_message_id: msgId || null
          })

        results.push({ provider_id: p.id, success: true, whatsapp_message_id: msgId })
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Unknown'
        results.push({ provider_id: p.id, success: false, error: msg })
      }
    }

    return NextResponse.json({ success: true, auto_select_at: autoSelectAt, broadcasts: results })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
