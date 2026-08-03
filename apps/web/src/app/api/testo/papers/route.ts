import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET() {
  try {
    const admin = getAdminClient()

    const { data: papers, error } = await admin
      .from('test_papers')
      .select('*')
      .eq('is_active', true)
      .order('subject', { ascending: true })
      .order('sort_order', { ascending: true })

    if (error) throw error

    // Group by subject
    const grouped: Record<string, any[]> = {}
    for (const paper of papers || []) {
      if (!grouped[paper.subject]) grouped[paper.subject] = []
      grouped[paper.subject].push(paper)
    }

    return NextResponse.json({ papers: papers || [], grouped })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
