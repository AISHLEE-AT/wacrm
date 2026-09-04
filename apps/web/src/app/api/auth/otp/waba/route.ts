import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Fetch the primary connected whatsapp_config
    const { data: config } = await admin
      .from('whatsapp_config')
      .select('phone_number_id')
      .eq('status', 'connected')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!config) {
      return NextResponse.json({ phone: '919486335870' }) // Meta verified WhatsApp Business Account
    }

    // Meta verified WhatsApp Business Account phone number (+91 94863 35870)
    return NextResponse.json({ phone: '919486335870' })

  } catch (err) {
    return NextResponse.json({ phone: '919486335870' })
  }
}
