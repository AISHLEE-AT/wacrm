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
      .select('id, full_name, main_category, role, pin_hash, gemini_api_key')
      .or(`phone.eq.${phone},phone.eq.91${phone},whatsapp.eq.${phone},whatsapp.eq.91${phone}`)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    // Check if phone matches any driver in drivers table
    const cleanPhone = phone.slice(-10);
    const { data: driverRow } = await admin
      .from('drivers')
      .select('id')
      .or(`phone.ilike.%${cleanPhone}%,mobile_number.ilike.%${cleanPhone}%,whatsapp_number.ilike.%${cleanPhone}%`)
      .limit(1)
      .maybeSingle()

    const isDriverPartner = !!driverRow || 
      profile?.role?.toLowerCase().includes('driver') || 
      profile?.main_category?.toLowerCase().includes('driver');

    const resolvedRole = isDriverPartner ? 'driver' : (profile?.role || 'user');
    const resolvedCategory = isDriverPartner ? 'Driver' : (profile?.main_category || 'Traveller');

    if (profile || driverRow) {
      // Self-heal profile if user is driver partner but profile had legacy category
      if (profile && isDriverPartner && (profile.main_category !== 'Driver' || profile.role !== 'driver')) {
        await admin.from('profiles').update({
          role: 'driver',
          main_category: 'Driver',
          default_module: '/drivo'
        }).eq('id', profile.id);
      }

      return NextResponse.json({ 
        exists: true, 
        name: profile?.full_name || 'Driver Partner', 
        category: resolvedCategory, 
        role: resolvedRole, 
        has_pin: !!profile?.pin_hash,
        gemini_api_key: profile?.gemini_api_key
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



