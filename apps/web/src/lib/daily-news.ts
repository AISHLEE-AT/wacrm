// ============================================================
// SuprO Web — Daily News Service
// Reads from Supabase daily_news table (admin-curated at 6 AM)
// Falls back to latest 1 day if today has no news yet.
// ============================================================

import { createClient } from '@/lib/supabase/client';

export interface DailyNewsItem {
  id: string;
  module: string;
  title: string;
  description: string;
  image_url?: string;
  source_name: string;
  link: string;
  published_date: string;
  loaded_date: string;
  data_type: string;
  extra_data?: Record<string, string>;
}

function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

function yesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

/**
 * Auto-triggers the server-side news loader if Supabase is empty.
 * Runs in the background — won't block the UI.
 */
async function triggerLoadIfEmpty(): Promise<void> {
  try {
    await fetch('/api/load-daily-news', { method: 'GET' });
  } catch (_) { /* silent */ }
}

/**
 * Fetch today's (or latest within 1 day) curated news for a specific module.
 * Auto-triggers a load if Supabase has no data.
 */
export async function fetchDailyNewsForModule(module: string): Promise<DailyNewsItem[]> {
  try {
    const supabase = createClient();
    const yesterday = yesterdayString();
    const cacheKey = `supro_news_cache_${module}`;

    // Try to get from localStorage first (offline support)
    let cachedItems: DailyNewsItem[] = [];
    try {
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          cachedItems = JSON.parse(cached);
        }
      }
    } catch (e) {
      console.warn("Failed to read cache", e);
    }

    const { data, error } = await supabase
      .from('daily_news')
      .select('*')
      .eq('module', module)
      .gte('loaded_date', yesterday)          // ← last 1 day, not just today
      .order('loaded_date', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(30);

    // If network fails and we have cache, return cache
    if (error && cachedItems.length > 0) {
      console.warn("Network error, returning cached news:", error);
      return cachedItems;
    } else if (error) {
      throw error;
    }

    const items = (data as DailyNewsItem[]) ?? [];

    // If empty → silently trigger server-side load and retry once
    if (items.length === 0) {
      if (cachedItems.length > 0) {
        // Return cache instantly but trigger background fetch
        triggerLoadIfEmpty();
        return cachedItems;
      }
      
      await triggerLoadIfEmpty();
      // Short wait then retry
      await new Promise(r => setTimeout(r, 2500));
      const { data: retryData, error: retryError } = await supabase
        .from('daily_news')
        .select('*')
        .eq('module', module)
        .gte('loaded_date', yesterday)
        .order('loaded_date', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(30);
      
      const retryItems = (retryData as DailyNewsItem[]) ?? [];
      
      // Save retry items to cache
      if (retryItems.length > 0 && typeof window !== 'undefined') {
        localStorage.setItem(cacheKey, JSON.stringify(retryItems));
      }
      
      return retryItems;
    }

    // Save successful fetch to cache
    if (items.length > 0 && typeof window !== 'undefined') {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(items));
      } catch (e) {
        console.warn("Failed to set cache", e);
      }
    }

    return items;
  } catch (e) {
    console.error('fetchDailyNewsForModule error:', e);
    
    // Ultimate fallback: return cache if we hit any exception
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(`supro_news_cache_${module}`);
        if (cached) return JSON.parse(cached);
      } catch (_) {}
    }
    
    return [];
  }
}

/** Fetch ALL latest news across all modules (admin panel) */
export async function fetchAllTodayNews(): Promise<DailyNewsItem[]> {
  try {
    const supabase = createClient();
    const yesterday = yesterdayString();
    const { data, error } = await supabase
      .from('daily_news')
      .select('*')
      .gte('loaded_date', yesterday)
      .order('loaded_date', { ascending: false })
      .order('module', { ascending: true });
    if (error) throw error;
    return (data as DailyNewsItem[]) ?? [];
  } catch (e) {
    console.error('fetchAllTodayNews error:', e);
    return [];
  }
}

/** Save an AI generated summary to the daily_news table */
export async function saveAiSummary(module: string, title: string, description: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const today = todayString();
    const { error } = await supabase.from('daily_news').insert({
      module,
      title,
      description,
      source_name: 'SuprO AI',
      published_date: today,
      loaded_date: today,
      data_type: 'weekly_ai_news',
    });
    if (error) throw error;
    return true;
  } catch (e) {
    console.error('saveAiSummary error:', e);
    return false;
  }
}

/** Module metadata */
export const MODULE_META: Record<string, { label: string; color: string; emoji: string }> = {
  agro:    { label: 'AgrO',    color: '#10b981', emoji: '🌾' },
  teacho:  { label: 'TeachO',  color: '#6366f1', emoji: '📚' },
  dealo:   { label: 'DealO',   color: '#f59e0b', emoji: '🛒' },
  jobo:    { label: 'JobO',    color: '#3b82f6', emoji: '💼' },
  driveo:  { label: 'DriveO',  color: '#ef4444', emoji: '🚗' },
  testo:   { label: 'TestO',   color: '#ec4899', emoji: '🏥' },
  general: { label: 'General', color: '#94a3b8', emoji: '📰' },
};
