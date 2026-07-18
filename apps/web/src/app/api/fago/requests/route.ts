import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const { data, error } = await supabase()
      .from('requests')
      .select(`
        id, item_requested, pincode, category, status, created_at, auto_select_at,
        buyer_phone, winner_provider_id,
        quotes(id, price, status)
      `)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error
    return NextResponse.json({ requests: data })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { item_requested, pincode, category, buyer_phone, buyer_user_id } = body
    if (!item_requested || !pincode) {
      return NextResponse.json({ error: 'item_requested and pincode required' }, { status: 400 })
    }

    const { data, error } = await supabase()
      .from('requests')
      .insert({ item_requested, pincode, category, buyer_phone, buyer_user_id, status: 'pending' })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ request: data })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
