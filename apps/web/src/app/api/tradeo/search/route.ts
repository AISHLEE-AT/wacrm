import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Search providers by keyword + pincode + optional category
export async function POST(request: Request) {
  try {
    const { keyword, pincode, category } = await request.json()
    if (!keyword || !pincode) {
      return NextResponse.json({ error: 'keyword and pincode required' }, { status: 400 })
    }

    let query = supabase()
      .from('providers')
      .select('id, business_name, phone_number, pincode, category, services, is_active')
      .eq('pincode', pincode)
      .eq('is_active', true)

    if (category && category !== 'All') {
      query = query.eq('category', category)
    }

    const { data: providers, error } = await query

    if (error) throw error

    // Filter by keyword match in services array (case-insensitive)
    const kw = keyword.toLowerCase().trim()
    const matched = (providers || []).filter(p => {
      const inServices = (p.services || []).some((s: string) =>
        s.toLowerCase().includes(kw) || kw.includes(s.toLowerCase())
      )
      const inName = p.business_name?.toLowerCase().includes(kw)
      const inCategory = p.category?.toLowerCase().includes(kw)
      return inServices || inName || inCategory
    })

    return NextResponse.json({ providers: matched, total: matched.length })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
