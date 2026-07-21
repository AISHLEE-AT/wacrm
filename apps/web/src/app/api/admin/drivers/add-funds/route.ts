import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireRole, toErrorResponse } from '@/lib/auth/account'

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: Request) {
  try {
    await requireRole('admin')
    const { driver_id, amount } = await req.json()
    if (!driver_id || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Valid Driver ID and positive amount required' }, { status: 400 })
    }

    const supabase = supabaseAdmin()
    
    // First fetch the driver's current balance
    const { data: driver, error: fetchError } = await supabase
      .from('drivers')
      .select('wallet_balance')
      .eq('id', driver_id)
      .single()
      
    if (fetchError || !driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 })
    }
    
    const newBalance = (driver.wallet_balance || 0) + amount

    // Update the balance
    const { error: updateError } = await supabase
      .from('drivers')
      .update({ wallet_balance: newBalance })
      .eq('id', driver_id)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ success: true, new_balance: newBalance })
  } catch (err) {
    return toErrorResponse(err)
  }
}
