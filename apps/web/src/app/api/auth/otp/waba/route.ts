import { NextResponse } from 'next/server'

// Official Aishlee Technologies / SuprO WhatsApp CRM Number: +91 63810 29380
// (Meta Phone Number ID: 1213113635214047, WABA ID: 1370739925032027)
const WABA_CRM_NUMBER = '916381029380'

export async function GET() {
  return NextResponse.json({ phone: WABA_CRM_NUMBER })
}
