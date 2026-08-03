import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * POST /api/admin/testo/import
 *
 * Accepts two modes:
 *   mode: 'manual'   — direct questions array
 *   mode: 'gas'      — payload from Google Apps Script
 *
 * Body (manual):
 * {
 *   mode: 'manual',
 *   paper: { title, subject, topic, description, duration_minutes, total_questions, form_id, thumbnail_emoji },
 *   questions: [{ question_no, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, marks }]
 * }
 *
 * Body (gas / Google Apps Script):
 * {
 *   mode: 'gas',
 *   secret: process.env.ADMIN_API_SECRET,
 *   forms: [
 *     {
 *       formId: '...',
 *       title: '...',
 *       subject: '9th Maths',
 *       topic: 'Module 1: Real Numbers',
 *       questions: [...]
 *     }
 *   ]
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { mode, secret, paper, questions, forms } = body

    // Auth check
    const adminSecret = process.env.ADMIN_API_SECRET || 'FAGO_ADMIN_2024'
    if (secret !== adminSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = getAdminClient()

    if (mode === 'gas' && forms?.length) {
      // Bulk import from Google Apps Script
      const results = []
      for (const form of forms) {
        const result = await importSinglePaper(admin, {
          title: form.title,
          subject: form.subject || 'General',
          topic: form.topic || form.title,
          description: form.description,
          duration_minutes: form.duration_minutes || 30,
          total_questions: form.questions?.length || 0,
          form_id: form.formId,
          thumbnail_emoji: form.emoji || '📝',
          sort_order: form.sort_order || 0,
        }, form.questions || [])
        results.push(result)
      }
      return NextResponse.json({ success: true, imported: results.length, results })
    }

    if (mode === 'manual' && paper && questions?.length) {
      const result = await importSinglePaper(admin, {
        title: paper.title,
        subject: paper.subject,
        topic: paper.topic,
        description: paper.description,
        duration_minutes: paper.duration_minutes || 30,
        total_questions: questions.length,
        form_id: paper.form_id || null,
        thumbnail_emoji: paper.thumbnail_emoji || '📝',
        sort_order: paper.sort_order || 0,
      }, questions)
      return NextResponse.json({ success: true, result })
    }

    return NextResponse.json({ error: 'Invalid mode or missing data' }, { status: 400 })
  } catch (err: any) {
    console.error('Import error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

async function importSinglePaper(admin: any, paperData: any, questions: any[]) {
  // Upsert paper (match by form_id if present, else title+subject)
  let paperId: string

  if (paperData.form_id) {
    const { data: existing } = await admin
      .from('test_papers')
      .select('id')
      .eq('form_id', paperData.form_id)
      .maybeSingle()

    if (existing) {
      await admin.from('test_papers').update({ ...paperData, total_questions: questions.length }).eq('id', existing.id)
      paperId = existing.id
      // Delete old questions for re-import
      await admin.from('test_questions').delete().eq('paper_id', paperId)
    } else {
      const { data } = await admin.from('test_papers').insert({ ...paperData, is_active: true }).select('id').single()
      paperId = data.id
    }
  } else {
    const { data } = await admin
      .from('test_papers')
      .insert({ ...paperData, is_active: true })
      .select('id')
      .single()
    paperId = data.id
  }

  // Insert questions
  const questionRows = questions.map((q, idx) => ({
    paper_id: paperId,
    question_no: q.question_no || idx + 1,
    question_text: q.question_text || q.question,
    option_a: q.option_a || q.options?.[0] || '',
    option_b: q.option_b || q.options?.[1] || '',
    option_c: q.option_c || q.options?.[2] || '',
    option_d: q.option_d || q.options?.[3] || '',
    correct_answer: (q.correct_answer || 'A').toUpperCase(),
    explanation: q.explanation || null,
    marks: q.marks || 1,
  }))

  await admin.from('test_questions').insert(questionRows)

  return { paper_id: paperId, questions_imported: questionRows.length, title: paperData.title }
}

// GET — list all papers for admin
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')
    const adminSecret = process.env.ADMIN_API_SECRET || 'FAGO_ADMIN_2024'
    if (secret !== adminSecret) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = getAdminClient()
    const { data: papers } = await admin
      .from('test_papers')
      .select('*, test_questions(count)')
      .order('subject')
      .order('sort_order')

    return NextResponse.json({ papers: papers || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
