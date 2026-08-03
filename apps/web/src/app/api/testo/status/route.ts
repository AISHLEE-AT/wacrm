import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET /api/testo/status?phone=&paper_id=
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')?.replace(/\D/g, '').slice(-10)
    const paper_id = searchParams.get('paper_id')
    const utr = searchParams.get('utr')?.trim().toUpperCase()

    if (!phone) return NextResponse.json({ error: 'phone required' }, { status: 400 })

    const admin = getAdminClient()

    let query = admin
      .from('test_purchases')
      .select('id, status, utr, purchased_at, verified_at, paper_id')
      .eq('phone', phone)
      .order('purchased_at', { ascending: false })

    if (paper_id) query = query.eq('paper_id', paper_id)
    if (utr) query = query.eq('utr', utr)

    const { data: purchases } = await query.limit(10)

    // Also check attempts to see if test already completed
    let attempts: any[] = []
    if (paper_id) {
      const { data: att } = await admin
        .from('test_attempts')
        .select('id, score, total_marks, percentage, completed_at')
        .eq('phone', phone)
        .eq('paper_id', paper_id)
        .order('completed_at', { ascending: false })
        .limit(1)
      attempts = att || []
    }

    const verified = purchases?.find(p => p.status === 'verified' && (!paper_id || p.paper_id === paper_id))
    const pending = purchases?.find(p => p.status === 'pending' && (!paper_id || p.paper_id === paper_id))

    return NextResponse.json({
      status: verified ? 'verified' : pending ? 'pending' : 'none',
      purchase: verified || pending || null,
      all_purchases: purchases || [],
      completed_attempt: attempts[0] || null,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
