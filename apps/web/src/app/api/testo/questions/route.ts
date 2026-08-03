import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET /api/testo/questions?paper_id=
// Returns questions WITHOUT correct_answer (security: answers only on server during submit)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const paper_id = searchParams.get('paper_id')
    const phone = searchParams.get('phone')

    if (!paper_id) return NextResponse.json({ error: 'paper_id required' }, { status: 400 })

    const admin = getAdminClient()

    // Verify the user has a verified purchase (if phone provided)
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '').slice(-10)
      const { data: purchase } = await admin
        .from('test_purchases')
        .select('id, status')
        .eq('paper_id', paper_id)
        .eq('phone', cleanPhone)
        .eq('status', 'verified')
        .maybeSingle()

      if (!purchase) {
        return NextResponse.json({ error: 'No verified purchase found' }, { status: 403 })
      }
    }

    // Return questions WITHOUT correct_answer
    const { data: questions, error } = await admin
      .from('test_questions')
      .select('id, question_no, question_text, option_a, option_b, option_c, option_d, marks')
      .eq('paper_id', paper_id)
      .order('question_no', { ascending: true })

    if (error) throw error

    return NextResponse.json({ questions: questions || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
