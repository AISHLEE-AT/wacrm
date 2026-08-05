import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0


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
    // Query profiles to see if the user exists
    const { data: profile, error } = await admin
      .from('profiles')
      .select('id, full_name, main_category, role, pin_hash')
      .or(`phone.eq.${phone},phone.eq.91${phone},whatsapp.eq.${phone},whatsapp.eq.91${phone}`)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (profile) {
      return NextResponse.json({ 
        exists: true, 
        name: profile.full_name, 
        category: profile.main_category, 
        role: profile.role, 
        has_pin: !!profile.pin_hash 
      })
    }
    
    return NextResponse.json({ 
      exists: false, 
      reason: 'Profile not found', 
      debug_phone: phone, 
      debug_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      debug_error: error 
    })
  } catch (err: any) {
    return NextResponse.json({ exists: false, error: err.message })
  }
}



