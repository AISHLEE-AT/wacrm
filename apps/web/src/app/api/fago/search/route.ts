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

// Phone profile search for login auto-prefill (bypasses RLS safely via service role)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')
    if (!phone) {
      return NextResponse.json({ error: 'Phone parameter required' }, { status: 400 })
    }

    const clean = phone.replace(/\D/g, '').slice(-10)
    if (clean.length < 10) {
      return NextResponse.json({ profile: null })
    }

    const { data: records } = await supabase()
      .from('profiles')
      .select('full_name, main_category, role, phone, whatsapp')
      .or(`phone.eq.${clean},phone.eq.91${clean},phone.eq.+91${clean},whatsapp.eq.${clean},whatsapp.eq.91${clean}`)

    if (records && records.length > 0) {
      records.sort((a, b) => {
        const nameA = a.full_name?.trim() || ''
        const nameB = b.full_name?.trim() || ''
        const isNumA = /^\d+$/.test(nameA)
        const isNumB = /^\d+$/.test(nameB)
        
        let scoreA = 0
        let scoreB = 0
        
        if (nameA.length > 0 && !isNumA) scoreA += 50
        if (nameB.length > 0 && !isNumB) scoreB += 50

        return scoreB - scoreA
      })
    }

    const profile = (records && records.length > 0) ? records[0] : null
    return NextResponse.json({ profile })
  } catch (err: unknown) {
    return NextResponse.json({ profile: null })
  }
}
