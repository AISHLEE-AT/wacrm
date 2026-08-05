import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jjgdatjthyeesmgunnlp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZ2RhdGp0aHllZXNtZ3VubmxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MzU5NTYsImV4cCI6MjEwMDIxMTk1Nn0.iuSdvxW9VEtn_1yVLmf9ZN24CeXFxmF3aeVHEn-Dgcs';

export const aishleeSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Daily News: read from admin-curated Supabase table ──────────────────────

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
  data_type: string; // rss | mandi | commodity_price | govt_api
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

/** Fetch latest news for a module — last 1 day tolerance */
export async function fetchDailyNewsForModule(module: string): Promise<DailyNewsItem[]> {
  try {
    const yesterday = yesterdayString();
    const { data, error } = await aishleeSupabase
      .from('daily_news')
      .select('*')
      .eq('module', module)
      .gte('loaded_date', yesterday)    // ← last 1 day
      .order('loaded_date', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(30);
    if (error) throw error;
    return (data as DailyNewsItem[]) ?? [];
  } catch (e) {
    console.error('[DailyNews] fetchForModule error:', e);
    return [];
  }
}

/** Fetch ALL latest news across all modules (admin) */
export async function fetchAllTodayNews(): Promise<DailyNewsItem[]> {
  try {
    const yesterday = yesterdayString();
    const { data, error } = await aishleeSupabase
      .from('daily_news')
      .select('*')
      .gte('loaded_date', yesterday)
      .order('loaded_date', { ascending: false })
      .order('module', { ascending: true });
    if (error) throw error;
    return (data as DailyNewsItem[]) ?? [];
  } catch (e) {
    console.error('[DailyNews] fetchAll error:', e);
    return [];
  }
}
