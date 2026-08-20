import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { checkIsAdmin } from '@/lib/auth/admin'

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

    // Profiles table query
    const cleanPhone = phone.slice(-10)
    const { data: profile, error } = await admin
      .from('profiles')
      .select('id, full_name, main_category, role, pin_hash, gemini_api_key, upi_id, avatar_url, location, latitude, longitude, city, state, country, pincode, profile_complete, last_whatsapp_inbound_at')
      .or(`phone.eq.${cleanPhone},phone.eq.91${cleanPhone},phone.ilike.%${cleanPhone}%,whatsapp.eq.${cleanPhone},whatsapp.ilike.%${cleanPhone}%`)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    // Check if phone matches any driver in drivers table
    const { data: driverRow } = await admin
      .from('drivers')
      .select('id, name, upi_id, vehicle_type, vehicle_model, vehicle_number')
      .or(`phone.ilike.%${cleanPhone}%,mobile_number.ilike.%${cleanPhone}%,whatsapp_number.ilike.%${cleanPhone}%`)
      .limit(1)
      .maybeSingle()

    const isAdminUser = checkIsAdmin(cleanPhone, profile || undefined)

    const isDriverPartner = !isAdminUser && (
      !!driverRow || 
      profile?.role?.toLowerCase().includes('driver') || 
      profile?.main_category?.toLowerCase().includes('driver')
    )

    const resolvedRole = isAdminUser ? 'admin' : (isDriverPartner ? 'driver' : (profile?.role || 'user'))
    const resolvedCategory = isAdminUser ? 'Admin' : (isDriverPartner ? 'Driver' : (profile?.main_category || 'Traveller'))
    const resolvedUpi = profile?.upi_id || driverRow?.upi_id || ''

    // Compute Meta 24-hour customer service window status from last_whatsapp_inbound_at
    let lastInbound = profile?.last_whatsapp_inbound_at ? new Date(profile.last_whatsapp_inbound_at).getTime() : 0
    let resolvedLastInboundIso = profile?.last_whatsapp_inbound_at || null

    // Fallback: check contacts & conversations if profile doesn't have last_whatsapp_inbound_at
    if ((!lastInbound || isNaN(lastInbound) || lastInbound <= 0)) {
      try {
        const { data: convData } = await admin
          .from('conversations')
          .select('last_message_at, updated_at, contact:contacts!inner(phone)')
          .or(`phone.ilike.%${cleanPhone}%,whatsapp.ilike.%${cleanPhone}%`, { foreignTable: 'contacts' })
          .order('last_message_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        const convTime = convData?.last_message_at || convData?.updated_at
        if (convTime) {
          const parsed = new Date(convTime).getTime()
          if (!isNaN(parsed) && parsed > 0) {
            lastInbound = parsed
            resolvedLastInboundIso = new Date(parsed).toISOString()
            if (profile?.id) {
              await admin.from('profiles').update({
                last_whatsapp_inbound_at: resolvedLastInboundIso,
              }).eq('id', profile.id)
            }
          }
        }
      } catch (_) {}
    }

    const isWindowActive = lastInbound > 0 && (Date.now() - lastInbound) < 24 * 60 * 60 * 1000
    const hoursRemaining = isWindowActive ? Math.max(0, Math.round(((lastInbound + 24 * 60 * 60 * 1000 - Date.now()) / (1000 * 60 * 60)) * 10) / 10) : 0
    const expiresAt = lastInbound > 0 ? new Date(lastInbound + 24 * 60 * 60 * 1000).toISOString() : null

    if (profile || driverRow) {
      // Self-heal profile if user is driver partner but profile had legacy category
      if (profile && !isAdminUser && isDriverPartner && (profile.main_category !== 'Driver' || profile.role !== 'driver')) {
        await admin.from('profiles').update({
          role: 'driver',
          main_category: 'Driver',
          default_module: '/drivo'
        }).eq('id', profile.id)
      } else if (profile && isAdminUser && (profile.role !== 'admin' || profile.main_category !== 'Admin')) {
        await admin.from('profiles').update({
          role: 'admin',
          main_category: 'Admin',
        }).eq('id', profile.id)
      }

      return NextResponse.json({ 
        exists: true, 
        id: profile?.id,
        name: profile?.full_name || 'Driver Partner', 
        full_name: profile?.full_name || 'Driver Partner',
        category: resolvedCategory, 
        role: resolvedRole, 
        has_pin: !!profile?.pin_hash,
        last_whatsapp_inbound_at: resolvedLastInboundIso,
        is_whatsapp_session_active: isWindowActive,
        whatsapp_window_expires_at: expiresAt,
        whatsapp_hours_remaining: hoursRemaining,
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
      has_pin: false,
      is_whatsapp_session_active: false,
      whatsapp_window_expires_at: null,
      whatsapp_hours_remaining: 0
    })
  } catch (err: any) {
    return NextResponse.json({ exists: false, error: err.message })
  }
}
