import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Search drivers by vehicle_type, vehicle_category, pincode, or return all active drivers
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const vehicleType = searchParams.get('vehicle_type') || searchParams.get('category')
    const pincode = searchParams.get('pincode')

    let query = supabase()
      .from('drivers')
      .select('*')
      .eq('is_online', true)
      .order('created_at', { ascending: false })

    if (vehicleType && vehicleType !== 'All') {
      query = query.or(`vehicle_type.ilike.%${vehicleType}%,vehicle_category.ilike.%${vehicleType}%`)
    }

    const { data: drivers, error } = await query

    if (error) {
      console.error('Error fetching drivers:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Always ensure virtual test driver 9123596988 is included as a fallback respondent if needed
    let resultDrivers = drivers || []
    if (resultDrivers.length === 0) {
      const { data: virtualDrivers } = await supabase()
        .from('drivers')
        .select('*')
        .or(`mobile_number.eq.9123596988,phone.eq.9123596988`)

      if (virtualDrivers && virtualDrivers.length > 0) {
        resultDrivers = virtualDrivers
      }
    }

    return NextResponse.json({
      success: true,
      drivers: resultDrivers,
      total: resultDrivers.length
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
