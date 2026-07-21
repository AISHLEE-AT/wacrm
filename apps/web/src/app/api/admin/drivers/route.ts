import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireRole, toErrorResponse } from '@/lib/auth/account'

export const dynamic = 'force-dynamic'

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET() {
  try {
    await requireRole('admin')
    const supabase = supabaseAdmin()
    
    // Fetch drivers and their vehicle
    const { data: drivers, error } = await supabase
      .from('drivers')
      .select(`
        *,
        vehicle:vehicles(name, type, base_fare)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching drivers:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!drivers || drivers.length === 0) {
      return NextResponse.json({ drivers: [] })
    }

    const userIds = drivers.map((d: any) => d.user_id)

    const { data: profiles, error: pError } = await supabase
      .from('profiles')
      .select('user_id, full_name, email, account_id')
      .in('user_id', userIds)

    if (pError) {
      console.error('Error fetching profiles:', pError)
    }

    const driversWithProfiles = drivers.map((d: any) => ({
      ...d,
      profile: profiles?.find((p: any) => p.user_id === d.user_id) || null
    }))

    return NextResponse.json({ drivers: driversWithProfiles })
  } catch (err) {
    return toErrorResponse(err)
  }
}

export async function PATCH(req: Request) {
  try {
    await requireRole('admin')
    const { driver_id, is_verified } = await req.json()
    if (!driver_id || is_verified === undefined) {
      return NextResponse.json({ error: 'Driver ID and is_verified required' }, { status: 400 })
    }

    const supabase = supabaseAdmin()
    
    const { error } = await supabase
      .from('drivers')
      .update({ is_verified })
      .eq('id', driver_id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return toErrorResponse(err)
  }
}

export async function DELETE(req: Request) {
  try {
    await requireRole('admin')
    const { searchParams } = new URL(req.url)
    const driver_id = searchParams.get('id')
    if (!driver_id) {
      return NextResponse.json({ error: 'Driver ID required' }, { status: 400 })
    }

    const supabase = supabaseAdmin()
    
    const { error } = await supabase
      .from('drivers')
      .delete()
      .eq('id', driver_id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return toErrorResponse(err)
  }
}
