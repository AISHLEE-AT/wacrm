// ============================================================
// SuprO — fetch-daily-news Edge Function
// Auto-triggered at 6:00 AM IST (00:30 UTC) via pg_cron
// Also callable manually from Admin UI
// ============================================================
// GOVERNMENT DATA SOURCES USED:
//  1. data.gov.in → Agmarknet Mandi Prices (Tamil Nadu) → AgrO module
//  2. data.gov.in → Consumer Affairs Daily Commodity Retail Prices → DealO module
//  3. RSS Feeds → Dinamalar (Agri/Education/Business/Jobs/Health), BBC Tamil → All modules
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GOV_API_KEY = '579b464db66ec23bdd0000010e0f365c1ff840af51b6b8944d54f72b'

const RSS_FEEDS = [
  { module: 'agro',    name: 'Dinamalar Vivasayam', url: 'https://www.dinamalar.com/rss_vivasayam.asp' },
  { module: 'teacho',  name: 'Dinamalar Kalvi',     url: 'https://www.dinamalar.com/rss_kalvi.asp' },
  { module: 'dealo',   name: 'Dinamalar Vanikam',   url: 'https://www.dinamalar.com/rss_vanikam.asp' },
  { module: 'jobo',    name: 'Dinamalar Thozil',    url: 'https://www.dinamalar.com/rss_thozil.asp' },
  { module: 'testo',   name: 'Dinamalar Health',    url: 'https://www.dinamalar.com/rss_health.asp' },
  { module: 'general', name: 'Dinamalar Main',      url: 'https://www.dinamalar.com/rss.asp' },
  { module: 'general', name: 'BBC Tamil',           url: 'https://feeds.bbci.co.uk/tamil/rss.xml' },
  { module: 'general', name: 'OneIndia Tamil',      url: 'https://tamil.oneindia.com/rss/tamil-news-fb.xml' },
  { module: 'driveo',  name: 'OneIndia Auto',       url: 'https://tamil.oneindia.com/rss/auto-news.xml' },
]

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const today = new Date().toISOString().split('T')[0]  // YYYY-MM-DD
  const allItems: any[] = []
  const log: string[] = []

  // ── 1. RSS FEEDS ────────────────────────────────────────────────────────────
  log.push(`[${new Date().toISOString()}] Starting RSS fetch...`)
  for (const feed of RSS_FEEDS) {
    try {
      const res = await fetch(feed.url, { signal: AbortSignal.timeout(12000) })
      if (!res.ok) continue

      const body = await res.text()
      const items = [...body.matchAll(/<item>([\s\S]*?)<\/item>/g)]

      for (const [, itemXml] of items) {
        const title       = extractTag(itemXml, 'title')
        const link        = extractTag(itemXml, 'link')
        const pubDate     = extractTag(itemXml, 'pubDate')
        let   description = extractTag(itemXml, 'description')

        // Extract image
        let imageUrl: string | null = null
        const enclosureMatch = itemXml.match(/enclosure[^>]+url="([^"]+)"/)
        if (enclosureMatch) {
          imageUrl = enclosureMatch[1]
        } else {
          const imgMatch = description.match(/src="([^"]+\.(jpg|jpeg|png|webp))"/i)
          if (imgMatch) imageUrl = imgMatch[1]
        }

        // Clean HTML from description
        description = description.replace(/<[^>]*>|&[^;]+;/g, '').trim()
        if (description.length > 200) description = description.slice(0, 200) + '...'

        if (title) {
          allItems.push({
            module: feed.module,
            title: title.trim(),
            description,
            image_url: imageUrl,
            source_name: feed.name,
            link: link.trim(),
            published_date: pubDate.trim(),
            loaded_date: today,
            data_type: 'rss',
          })
        }
      }
      log.push(`  ✅ ${feed.name}: parsed ${items.length} items`)
    } catch (e) {
      log.push(`  ❌ ${feed.name}: ${e}`)
    }
  }

  // ── 2. GOVERNMENT API: MANDI PRICES (data.gov.in) ────────────────────────
  // Dataset: Agmarknet Daily Prices (Resource ID: 9ef84268-d588-465a-a308-a864a43d0070)
  // Purpose: Real-time mandi market prices for Tamil Nadu commodities → AgrO module
  log.push(`[${new Date().toISOString()}] Fetching Mandi prices from data.gov.in...`)
  try {
    const mandiUrl =
      `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070` +
      `?api-key=${GOV_API_KEY}&format=json&filters[state]=Tamil+Nadu&limit=25`

    const res = await fetch(mandiUrl, { signal: AbortSignal.timeout(15000) })
    if (res.ok) {
      const data = await res.json()
      const records: any[] = data.records ?? []

      for (const r of records) {
        const commodity   = r.commodity   || ''
        const market      = r.market      || ''
        const district    = r.district    || ''
        const modal       = r.modal_price || '0'
        const min         = r.min_price   || '0'
        const max         = r.max_price   || '0'
        const arrivalDate = r.arrival_date || today

        allItems.push({
          module: 'agro',
          title: `🌾 ${commodity} – ₹${modal}/Qtl @ ${market}`,
          description: `${commodity} (${district}) | Min: ₹${min} | Max: ₹${max} | Modal: ₹${modal} per Quintal | Arrival: ${arrivalDate}`,
          image_url: null,
          source_name: 'data.gov.in — Agmarknet',
          link: 'https://agmarknet.gov.in',
          published_date: today,
          loaded_date: today,
          data_type: 'mandi',
          extra_data: { commodity, market, district, modal_price: modal, min_price: min, max_price: max, arrival_date: arrivalDate },
        })
      }
      log.push(`  ✅ Mandi: ${records.length} price records fetched`)
    }
  } catch (e) {
    log.push(`  ❌ Mandi API: ${e}`)
  }

  // ── 3. GOVERNMENT API: COMMODITY RETAIL PRICES (data.gov.in) ─────────────
  // Dataset: Dept. of Consumer Affairs Daily Retail Prices
  // Purpose: Fair price reference for vegetables, pulses, grains → DealO module
  // Resource: 65f3dc88-4d95-4f9c-9e6d-2a47d1a25b7e
  log.push(`[${new Date().toISOString()}] Fetching commodity retail prices from data.gov.in...`)
  try {
    const commodityUrl =
      `https://api.data.gov.in/resource/65f3dc88-4d95-4f9c-9e6d-2a47d1a25b7e` +
      `?api-key=${GOV_API_KEY}&format=json&limit=15`

    const res = await fetch(commodityUrl, { signal: AbortSignal.timeout(15000) })
    if (res.ok) {
      const data = await res.json()
      const records: any[] = data.records ?? []

      for (const r of records) {
        const commodity   = r.commodity    || r.Commodity    || ''
        const retailPrice = r.retail_price || r.RetailPrice  || ''
        const centre      = r.centre       || r.Centre       || 'India'

        if (!commodity) continue

        allItems.push({
          module: 'dealo',
          title: `🛒 ${commodity} – ₹${retailPrice}/Kg`,
          description: `Today's government retail price for ${commodity} is ₹${retailPrice} per Kg at ${centre}. Source: Dept. of Consumer Affairs, Govt. of India.`,
          image_url: null,
          source_name: 'data.gov.in — Consumer Affairs',
          link: 'https://fcainfoweb.nic.in/pmws',
          published_date: today,
          loaded_date: today,
          data_type: 'commodity_price',
          extra_data: { commodity, retail_price: retailPrice, centre },
        })
      }
      log.push(`  ✅ Commodity Prices: ${records.length} items fetched`)
    }
  } catch (e) {
    log.push(`  ❌ Commodity Price API: ${e}`)
  }

  // ── 4. SAVE TO SUPABASE ──────────────────────────────────────────────────
  log.push(`[${new Date().toISOString()}] Saving ${allItems.length} items to Supabase...`)

  // Delete today's existing news first (idempotent — safe to re-run)
  await supabase.from('daily_news').delete().eq('loaded_date', today)

  // Batch insert in chunks of 100
  let savedCount = 0
  for (let i = 0; i < allItems.length; i += 100) {
    const chunk = allItems.slice(i, i + 100)
    const { error } = await supabase.from('daily_news').insert(chunk)
    if (!error) savedCount += chunk.length
    else log.push(`  ⚠️ Insert chunk error: ${error.message}`)
  }

  log.push(`[${new Date().toISOString()}] ✅ Done — ${savedCount}/${allItems.length} items saved for ${today}`)

  return new Response(
    JSON.stringify({
      success: true,
      date: today,
      totalFetched: allItems.length,
      totalSaved: savedCount,
      log,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})

// ── XML Tag Extractor ─────────────────────────────────────────────────────────
function extractTag(xml: string, tag: string): string {
  // Try CDATA first
  const cdataMatch = xml.match(new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`))
  if (cdataMatch) return cdataMatch[1].trim()
  // Plain text
  const plainMatch = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`))
  return plainMatch ? plainMatch[1].trim() : ''
}
