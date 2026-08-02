import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: Request) {
  try {
    const { userId, phone, full_name, upi_id, location, main_category } = await request.json()

    if (!userId && !phone) {
      return NextResponse.json({ error: 'User ID or Phone number is required' }, { status: 400 })
    }

    const admin = getAdminClient()
    const cleanPhone = phone ? phone.replace(/\D/g, '').slice(-10) : null

    // Build update object with only provided fields
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (full_name !== undefined) updates.full_name = full_name.trim()
    if (upi_id !== undefined) updates.upi_id = upi_id.trim()
    if (location !== undefined) updates.location = location.trim()
    if (main_category !== undefined) updates.main_category = main_category

    // Strategy 1: Update by userId or id
    let updateResult = null
    if (userId) {
      const { data, error } = await admin
        .from('profiles')
        .update(updates)
        .or(`id.eq.${userId},user_id.eq.${userId}`)
        .select('*')
      
      if (data && data.length > 0) updateResult = data[0]
    }

    // Strategy 2: Fallback update by phone
    if (!updateResult && cleanPhone) {
      const { data, error } = await admin
        .from('profiles')
        .update(updates)
        .or(`phone.eq.${cleanPhone},phone.eq.91${cleanPhone},whatsapp.eq.${cleanPhone},whatsapp.eq.91${cleanPhone}`)
        .select('*')

      if (data && data.length > 0) updateResult = data[0]
    }

    if (!updateResult) {
      // Upsert profile if missing
      const targetId = userId || `user_${cleanPhone}`
      const { data: upsertData, error: upsertErr } = await admin
        .from('profiles')
        .upsert({
          id: targetId,
          phone: cleanPhone,
          whatsapp: cleanPhone,
          ...updates,
        }, { onConflict: 'id' })
        .select('*')
        .maybeSingle()

      updateResult = upsertData
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: updateResult,
    })
  } catch (err: any) {
    console.error('Error in /api/profile/update:', err)
    return NextResponse.json({ error: err.message || 'Failed to update profile' }, { status: 500 })
  }
}
