import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// POST /api/testo/submit — submit answers, calculate score, save attempt
export async function POST(request: Request) {
  try {
    const { paper_id, purchase_id, phone, user_id, user_name, answers, time_taken_seconds } = await request.json()

    if (!paper_id || !answers || !phone) {
      return NextResponse.json({ error: 'paper_id, phone and answers required' }, { status: 400 })
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10)
    const admin = getAdminClient()

    // Verify purchase is valid
    const { data: purchase } = await admin
      .from('test_purchases')
      .select('id, status')
      .eq('paper_id', paper_id)
      .eq('phone', cleanPhone)
      .eq('status', 'verified')
      .maybeSingle()

    if (!purchase) {
      return NextResponse.json({ error: 'No verified purchase found for this test.' }, { status: 403 })
    }

    // Check if already attempted
    const { data: existingAttempt } = await admin
      .from('test_attempts')
      .select('id, score, total_marks, percentage')
      .eq('paper_id', paper_id)
      .eq('phone', cleanPhone)
      .maybeSingle()

    if (existingAttempt) {
      return NextResponse.json({
        already_attempted: true,
        attempt: existingAttempt,
        message: 'You have already completed this test.',
      })
    }

    // Get all questions with correct answers
    const { data: questions, error: qErr } = await admin
      .from('test_questions')
      .select('id, question_no, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, marks')
      .eq('paper_id', paper_id)
      .order('question_no', { ascending: true })

    if (qErr || !questions?.length) {
      return NextResponse.json({ error: 'Could not load test questions.' }, { status: 500 })
    }

    // Calculate score
    let score = 0
    let totalMarks = 0
    const results: any[] = []

    for (const q of questions) {
      totalMarks += (q.marks || 1)
      const userAnswer = answers[q.id] || answers[`q${q.question_no}`] || null
      const isCorrect = userAnswer === q.correct_answer
      if (isCorrect) score += (q.marks || 1)

      results.push({
        question_no: q.question_no,
        question_text: q.question_text,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_answer: q.correct_answer,
        user_answer: userAnswer,
        is_correct: isCorrect,
        explanation: q.explanation,
        marks: q.marks || 1,
        marks_obtained: isCorrect ? (q.marks || 1) : 0,
      })
    }

    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100 * 100) / 100 : 0
    const passed = percentage >= 40

    // Save attempt
    const { data: attempt, error: attErr } = await admin
      .from('test_attempts')
      .insert({
        user_id: user_id || null,
        paper_id,
        purchase_id: purchase.id,
        phone: cleanPhone,
        user_name: user_name || `User ${cleanPhone.slice(-4)}`,
        answers,
        score,
        total_marks: totalMarks,
        percentage,
        time_taken_seconds: time_taken_seconds || null,
      })
      .select()
      .single()

    if (attErr) throw attErr

    // Compute rank: how many attempts scored higher?
    const { count: rank } = await admin
      .from('test_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('paper_id', paper_id)
      .gt('score', score)

    const finalRank = (rank || 0) + 1

    // Update rank in attempt
    await admin.from('test_attempts').update({ rank: finalRank }).eq('id', attempt.id)

    return NextResponse.json({
      success: true,
      score,
      total_marks: totalMarks,
      percentage,
      passed,
      rank: finalRank,
      attempt_id: attempt.id,
      results, // full breakdown with explanations
      certificate_eligible: percentage >= 60,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
