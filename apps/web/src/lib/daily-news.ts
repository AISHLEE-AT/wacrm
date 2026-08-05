// ============================================================
// SuprO Web — Daily News Service
// Reads from Supabase daily_news table (admin-curated at 6 AM)
// ============================================================

import { createClient } from '@/lib/supabase/client';

export interface DailyNewsItem {
  id: string;
  module: string;      // agro | teacho | dealo | jobo | driveo | testo | general
  title: string;
  description: string;
  image_url?: string;
  source_name: string;
  link: string;
  published_date: string;
  loaded_date: string;
  data_type: string;   // rss | govt_api | mandi | commodity_price
  extra_data?: Record<string, string>;
}

function todayString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0]; // YYYY-MM-DD
}

/** Fetch today's curated news for a specific module */
export async function fetchDailyNewsForModule(module: string): Promise<DailyNewsItem[]> {
  try {
    const supabase = createClient();
    const today = todayString();
    const { data, error } = await supabase
      .from('daily_news')
      .select('*')
      .eq('module', module)
      .eq('loaded_date', today)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data as DailyNewsItem[]) ?? [];
  } catch (e) {
    console.error('fetchDailyNewsForModule error:', e);
    return [];
  }
}

/** Fetch ALL today's news (admin panel use) */
export async function fetchAllTodayNews(): Promise<DailyNewsItem[]> {
  try {
    const supabase = createClient();
    const today = todayString();
    const { data, error } = await supabase
      .from('daily_news')
      .select('*')
      .eq('loaded_date', today)
      .order('module', { ascending: true });

    if (error) throw error;
    return (data as DailyNewsItem[]) ?? [];
  } catch (e) {
    console.error('fetchAllTodayNews error:', e);
    return [];
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
