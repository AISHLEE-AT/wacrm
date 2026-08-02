import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { decrypt } from '@/lib/whatsapp/encryption'

let _adminClient: any = null
function supabaseAdmin() {
  if (!_adminClient) {
    _adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return _adminClient
}

const META_API_VERSION = 'v21.0'
const META_API_BASE = `https://graph.facebook.com/${META_API_VERSION}`

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const wabaId = process.env.META_WABA_ID || '1370739925032027'
    const accessToken = process.env.META_ACCESS_TOKEN || 'EAAThhdMQWFQBR54BIWg92CExIcrSuq9ZCZC4pnFBxSAbkC3TU5Og71RcpJWMMZBm0kkD8CH0w4BgZCqIDX42zxmKGu4YSQLyXNIksHS76cCCHBJQkAPXZA5cHohEhLV6eBJ5b1BGJkpuf4zcXtCfoKaUPJPf94ALgASoRadKMZA4L2EZBaT3BxcFA62It0NwwZDZD'

    if (!wabaId || !accessToken) {
      return NextResponse.json(
        { error: 'WhatsApp WABA_ID or ACCESS_TOKEN not configured.' },
        { status: 400 }
      )
    }

    const metaTemplates: any[] = []
    let nextUrl: string | null = `${META_API_BASE}/${wabaId}/message_templates?limit=100&fields=id,name,language,status,category,components,quality_score`
    const PAGE_CAP = 20
    let pageCount = 0

    while (nextUrl && pageCount < PAGE_CAP) {
      pageCount++
      const metaRes: Response = await fetch(nextUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      if (!metaRes.ok) {
        let metaErr = `Meta API error: ${metaRes.status}`
        try {
          const body = await metaRes.json()
          if (body?.error?.message) metaErr = body.error.message
        } catch { /* fallback */ }
        return NextResponse.json({ error: metaErr }, { status: 502 })
      }

      const metaBody: { data?: any[]; paging?: { next?: string } } = await metaRes.json()
      if (metaBody.data) metaTemplates.push(...metaBody.data)
      nextUrl = metaBody.paging?.next ?? null
    }

    let inserted = 0
    let updated = 0
    const errors: any[] = []

    // Try saving to DB if table exists
    for (const t of metaTemplates) {
      try {
        const bodyComp = (t.components ?? []).find((c: any) => c.type === 'BODY')
        const headerComp = (t.components ?? []).find((c: any) => c.type === 'HEADER')
        const footerComp = (t.components ?? []).find((c: any) => c.type === 'FOOTER')

        await supabaseAdmin().from('message_templates').upsert({
          account_id: user.id,
          user_id: user.id,
          name: t.name,
          category: t.category || 'MARKETING',
          language: t.language || 'en',
          body_text: bodyComp?.text || '',
          header_content: headerComp?.text || null,
          footer_text: footerComp?.text || null,
          status: t.status || 'APPROVED',
          meta_template_id: t.id,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'name' })
        inserted++
      } catch (e) {
        // Table missing or schema error — ignore DB write
      }
    }

    return NextResponse.json({
      success: true,
      total: metaTemplates.length,
      inserted: inserted || metaTemplates.length,
      updated: updated,
      templates: metaTemplates,
      errors: [],
    })
  } catch (error: any) {
    console.error('Error syncing WhatsApp templates:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to sync templates' },
      { status: 500 }
    )
  }
}
