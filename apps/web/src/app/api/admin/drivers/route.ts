import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET() {
  try {
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
  } catch (error) {
    console.error('Admin drivers GET error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
