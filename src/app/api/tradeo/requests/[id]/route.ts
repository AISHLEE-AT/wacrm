import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data, error } = await supabase()
      .from('requests')
      .select(`
        id, item_requested, pincode, category, status, created_at, auto_select_at,
        buyer_phone, winner_provider_id,
        quotes(
          id, price, status, created_at, provider_message,
          provider_id,
          providers(id, business_name, phone_number, category)
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return NextResponse.json({ request: data })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
