import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: Request) {
  try {
    const { driver_id } = await req.json()
    if (!driver_id) {
      return NextResponse.json({ error: 'Driver ID required' }, { status: 400 })
    }

    const supabase = supabaseAdmin()
    
    const { error } = await supabase
      .from('drivers')
      .update({ pending_commission: 0 })
      .eq('id', driver_id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Clear commission error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
