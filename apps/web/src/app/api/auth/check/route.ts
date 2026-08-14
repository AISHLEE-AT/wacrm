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
      .select('id, full_name, main_category, role, pin_hash, gemini_api_key, upi_id, avatar_url, location, latitude, longitude, city, state, country, pincode, profile_complete')
      .or(`phone.eq.${phone},phone.eq.91${phone},whatsapp.eq.${phone},whatsapp.eq.91${phone}`)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    // Check if phone matches any driver in drivers table
    const cleanPhone = phone.slice(-10);
    const { data: driverRow } = await admin
      .from('drivers')
      .select('id, upi_id, vehicle_type, vehicle_model, vehicle_number')
      .or(`phone.ilike.%${cleanPhone}%,mobile_number.ilike.%${cleanPhone}%,whatsapp_number.ilike.%${cleanPhone}%`)
      .limit(1)
      .maybeSingle()

    const isDriverPartner = !!driverRow || 
      profile?.role?.toLowerCase().includes('driver') || 
      profile?.main_category?.toLowerCase().includes('driver');

    const resolvedRole = isDriverPartner ? 'driver' : (profile?.role || 'user');
    const resolvedCategory = isDriverPartner ? 'Driver' : (profile?.main_category || 'Traveller');
    const resolvedUpi = profile?.upi_id || driverRow?.upi_id || '';

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
        id: profile?.id,
        name: profile?.full_name || 'Driver Partner', 
        full_name: profile?.full_name || 'Driver Partner',
        category: resolvedCategory, 
        role: resolvedRole, 
        has_pin: !!profile?.pin_hash,
        gemini_api_key: profile?.gemini_api_key,
        upi_id: resolvedUpi,
        avatar_url: profile?.avatar_url || '',
        location: profile?.location || '',
        latitude: profile?.latitude || null,
        longitude: profile?.longitude || null,
        city: profile?.city || '',
        state: profile?.state || '',
        country: profile?.country || 'India',
        pincode: profile?.pincode || '',
        profile_complete: profile?.profile_complete || (!!profile?.full_name && !!profile?.location)
      })
    }
    
    return NextResponse.json({ 
      exists: false, 
      category: 'Traveller', 
      role: 'user', 
      has_pin: false 
    })
  } catch (err: any) {
    return NextResponse.json({ exists: false, error: err.message })
  }



