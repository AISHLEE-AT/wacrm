import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ─── Supabase service-role client (bypasses RLS for INSERT) ──────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// ─── RSS Feed config ──────────────────────────────────────────────────────────
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
];

const GOV_API_KEY = '579b464db66ec23bdd0000010e0f365c1ff840af51b6b8944d54f72b';

function todayString() {
  return new Date().toISOString().split('T')[0];
}

function extractTag(xml: string, tag: string): string {
  const cdata = xml.match(new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`));
  if (cdata) return cdata[1].trim();
  const plain = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
  return plain ? plain[1].trim() : '';
}

export async function GET() {
  const today = todayString();
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  // ── Check if already loaded today ────────────────────────────────────────
  const { count } = await supabase
    .from('daily_news')
    .select('id', { count: 'exact', head: true })
    .eq('loaded_date', today);

  if ((count ?? 0) > 0) {
    return NextResponse.json({ message: 'Already loaded today', count, date: today });
  }

  const allItems: Record<string, unknown>[] = [];
  const log: string[] = [];

  // ── 1. RSS Feeds ─────────────────────────────────────────────────────────
  for (const feed of RSS_FEEDS) {
    try {
      const res = await fetch(feed.url, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) continue;
      const body = await res.text();
      const items = [...body.matchAll(/<item>([\s\S]*?)<\/item>/g)];

      for (const [, itemXml] of items) {
        const title   = extractTag(itemXml, 'title');
        const link    = extractTag(itemXml, 'link');
        const pubDate = extractTag(itemXml, 'pubDate');
        let   desc    = extractTag(itemXml, 'description');

        let imageUrl: string | null = null;
        const enc = itemXml.match(/enclosure[^>]+url="([^"]+)"/);
        if (enc) imageUrl = enc[1];
        else {
          const img = desc.match(/src="([^"]+\.(jpg|jpeg|png|webp))"/i);
          if (img) imageUrl = img[1];
        }

        desc = desc.replace(/<[^>]*>|&[^;]+;/g, '').trim();
        if (desc.length > 200) desc = desc.slice(0, 200) + '...';

        if (title) {
          allItems.push({
            module: feed.module, title: title.trim(), description: desc,
            image_url: imageUrl, source_name: feed.name,
            link: link.trim(), published_date: pubDate.trim(),
            loaded_date: today, data_type: 'rss',
          });
        }
      }
      log.push(`✅ ${feed.name}: ${items.length} items`);
    } catch (e) { log.push(`❌ ${feed.name}: ${e}`); }
  }

  // ── 2. data.gov.in — Mandi Prices (AgrO) ────────────────────────────────
  try {
    const res = await fetch(
      `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${GOV_API_KEY}&format=json&filters[state]=Tamil+Nadu&limit=1000`,
      { signal: AbortSignal.timeout(20000) } // increased timeout for larger payload
    );
    if (res.ok) {
      const data = await res.json();
      for (const r of (data.records ?? [])) {
        allItems.push({
          module: 'agro',
          title: `🌾 ${r.commodity} – ₹${r.modal_price}/Qtl @ ${r.market}`,
          description: `${r.commodity} (${r.district}) | Min: ₹${r.min_price} | Max: ₹${r.max_price} | Modal: ₹${r.modal_price}/Qtl | Arrival: ${r.arrival_date ?? today}`,
          image_url: null, source_name: 'data.gov.in — Agmarknet',
          link: 'https://agmarknet.gov.in', published_date: today,
          loaded_date: today, data_type: 'mandi',
          extra_data: { commodity: r.commodity, market: r.market, district: r.district, modal_price: r.modal_price },
        });
      }
      log.push(`✅ Mandi: ${data.records?.length ?? 0} records fetched`);
    }
  } catch (e) { log.push(`❌ Mandi API: ${e}`); }

  // ── 3. data.gov.in — Commodity Retail Prices (DealO) ─────────────────────
  try {
    const res = await fetch(
      `https://api.data.gov.in/resource/65f3dc88-4d95-4f9c-9e6d-2a47d1a25b7e?api-key=${GOV_API_KEY}&format=json&limit=15`,
      { signal: AbortSignal.timeout(15000) }
    );
    if (res.ok) {
      const data = await res.json();
      for (const r of (data.records ?? [])) {
        const commodity = r.commodity || r.Commodity || '';
        const price     = r.retail_price || r.RetailPrice || '';
        const centre    = r.centre || r.Centre || 'India';
        if (!commodity) continue;
        allItems.push({
          module: 'dealo',
          title: `🛒 ${commodity} – ₹${price}/Kg`,
          description: `Today's government retail price for ${commodity} is ₹${price} per Kg at ${centre}. Source: Dept. of Consumer Affairs, Govt. of India.`,
          image_url: null, source_name: 'data.gov.in — Consumer Affairs',
          link: 'https://fcainfoweb.nic.in/pmws', published_date: today,
          loaded_date: today, data_type: 'commodity_price',
          extra_data: { commodity, retail_price: price, centre },
        });
      }
      log.push(`✅ Commodity prices: ${data.records?.length ?? 0} records`);
    }
  } catch (e) { log.push(`❌ Commodity API: ${e}`); }

  // ── Save to Supabase ──────────────────────────────────────────────────────
  let saved = 0;
  for (let i = 0; i < allItems.length; i += 100) {
    const { error } = await supabase.from('daily_news').insert(allItems.slice(i, i + 100));
    if (!error) saved += Math.min(100, allItems.length - i);
  }

  log.push(`💾 Saved ${saved}/${allItems.length} to Supabase`);
  return NextResponse.json({ success: true, date: today, total: allItems.length, saved, log });
}
