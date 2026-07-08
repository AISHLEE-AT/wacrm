import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const pincode = searchParams.get('pincode')
    const category = searchParams.get('category')

    let query = supabase()
      .from('providers')
      .select(`
        id, business_name, phone_number, pincode, category, services, is_active, created_at,
        quotes(id)
      `)
      .order('created_at', { ascending: false })

    if (pincode) query = query.eq('pincode', pincode)
    if (category && category !== 'All') query = query.eq('category', category)

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ providers: data })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { business_name, phone_number, pincode, category, services, user_id } = body
    if (!phone_number || !pincode || !category) {
      return NextResponse.json({ error: 'phone_number, pincode and category required' }, { status: 400 })
    }

    const { data, error } = await supabase()
      .from('providers')
      .insert({ business_name, phone_number, pincode, category, services: services || [], user_id, is_active: true })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ provider: data })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const { data, error } = await supabase()
      .from('providers')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ provider: data })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
