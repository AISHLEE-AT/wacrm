import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    let phone = searchParams.get('phone')
    if (!phone) {
      return NextResponse.json({ exists: false })
    }

    phone = phone.replace(/\D/g, '')

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Profiles table might store phone as 10 digits or with 91. 
    // We can use an OR query just in case.
    const { data: profile } = await admin
      .from('profiles')
      .select('id, full_name')
      .or(`phone.eq.${phone},phone.eq.91${phone}`)
      .limit(1)
      .maybeSingle()

    if (profile) {
      return NextResponse.json({ exists: true, name: profile.full_name })
    }
    
    return NextResponse.json({ exists: false })
  } catch (err) {
    return NextResponse.json({ exists: false })
  }
}
