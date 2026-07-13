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
    
    // We fetch the applications and their corresponding user profiles to show names/emails
    const { data: applications, error } = await supabase
      .from('driver_applications')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching driver applications:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!applications || applications.length === 0) {
      return NextResponse.json({ applications: [] })
    }

    const userIds = applications.map((app: any) => app.user_id)

    const { data: profiles, error: pError } = await supabase
      .from('profiles')
      .select('user_id, full_name, email, account_id')
      .in('user_id', userIds)

    if (pError) {
      console.error('Error fetching profiles:', pError)
    }

    const applicationsWithProfiles = applications.map((app: any) => ({
      ...app,
      profile: profiles?.find((p: any) => p.user_id === app.user_id) || null
    }))

    return NextResponse.json({ applications: applicationsWithProfiles })
  } catch (error) {
    console.error('Admin driver applications error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status, accountId, userId, vehicleType } = await request.json()

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = supabaseAdmin()

    if (status === 'approved') {
      // 1. We might want to auto-create a default vehicle for them
      const vehicleName = `${vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1)}`
      
      const { data: vehicle, error: vError } = await supabase
        .from('vehicles')
        .insert({
          account_id: accountId,
          name: `Driver ${vehicleName}`,
          type: vehicleType,
          base_fare: 50,
          per_km_rate: 15,
          per_minute_rate: 2
        })
        .select()
        .single()

      if (vError) throw vError

      // 2. Insert into drivers table
      const { error: dError } = await supabase
        .from('drivers')
        .insert({
          account_id: accountId,
          user_id: userId,
          vehicle_id: vehicle.id,
          status: 'offline'
        })

      if (dError) {
        // If driver exists or fails, rollback isn't trivial in REST, but we can catch it
        if (!dError.message.includes('duplicate key')) {
           throw dError
        }
      }
    }

    // 3. Update application status
    const { error: updateError } = await supabase
      .from('driver_applications')
      .update({ status })
      .eq('id', id)

    if (updateError) throw updateError

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Admin approve/reject error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
