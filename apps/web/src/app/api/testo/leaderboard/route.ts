import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET /api/testo/leaderboard?paper_id=&limit=10
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const paper_id = searchParams.get('paper_id')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!paper_id) return NextResponse.json({ error: 'paper_id required' }, { status: 400 })

    const admin = getAdminClient()

    const { data: attempts, error } = await admin
      .from('test_attempts')
      .select('user_name, phone, score, total_marks, percentage, time_taken_seconds, completed_at, rank')
      .eq('paper_id', paper_id)
      .order('score', { ascending: false })
      .order('time_taken_seconds', { ascending: true })
      .limit(limit)

    if (error) throw error

    // Mask phone numbers for privacy: show only last 4 digits
    const leaderboard = (attempts || []).map((a, i) => ({
      rank: i + 1,
      name: a.user_name || `User ${(a.phone || '').slice(-4)}`,
      phone_masked: `+91 ****${(a.phone || '').slice(-4)}`,
      score: a.score,
      total_marks: a.total_marks,
      percentage: a.percentage,
      time_taken_seconds: a.time_taken_seconds,
      completed_at: a.completed_at,
    }))

    return NextResponse.json({ leaderboard })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
