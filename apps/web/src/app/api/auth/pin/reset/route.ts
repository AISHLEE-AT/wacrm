import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const adminAuthClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

export async function POST(request: Request) {
  // CORS Headers for preflight requests are handled by middleware.ts, but let's add them here just in case.
  const origin = request.headers.get('origin') ?? '*'
  const headers = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true'
  }

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers })
  }

  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401, headers })
    }

    const token = authHeader.split('Bearer ')[1]
    
    // Verify the token
    const { data: { user }, error: authError } = await adminAuthClient.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401, headers })
    }

    const body = await request.json()
    const { oldPin, newPin } = body

    if (!oldPin || !newPin || oldPin.length !== 4 || newPin.length !== 4) {
      return NextResponse.json({ error: 'Both old and new PINs must be 4 digits' }, { status: 400, headers })
    }

    // Check old PIN
    const { data: profile, error: profileError } = await adminAuthClient
      .from('profiles')
      .select('pin_hash')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404, headers })
    }

    if (profile.pin_hash !== oldPin) {
      return NextResponse.json({ error: 'Incorrect old PIN' }, { status: 400, headers })
    }

    // Update with new PIN
    const { error: updateError } = await adminAuthClient
      .from('profiles')
      .update({ pin_hash: newPin })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating PIN:', updateError)
      return NextResponse.json({ error: 'Failed to update PIN in database' }, { status: 500, headers })
    }

    return NextResponse.json({ success: true, message: 'PIN updated successfully' }, { status: 200, headers })

  } catch (error: any) {
    console.error('PIN Reset error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers })
  }
}
