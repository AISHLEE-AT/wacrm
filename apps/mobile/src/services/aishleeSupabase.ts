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
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/** Fetch today's curated news for a module from Supabase */
export async function fetchDailyNewsForModule(module: string): Promise<DailyNewsItem[]> {
  try {
    const today = todayString();
    const { data, error } = await aishleeSupabase
      .from('daily_news')
      .select('*')
      .eq('module', module)
      .eq('loaded_date', today)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data as DailyNewsItem[]) ?? [];
  } catch (e) {
    console.error('[DailyNews] fetchForModule error:', e);
    return [];
  }
}

/** Fetch ALL today's news (admin use) */
export async function fetchAllTodayNews(): Promise<DailyNewsItem[]> {
  try {
    const today = todayString();
    const { data, error } = await aishleeSupabase
      .from('daily_news')
      .select('*')
      .eq('loaded_date', today)
      .order('module', { ascending: true });
    if (error) throw error;
    return (data as DailyNewsItem[]) ?? [];
  } catch (e) {
    console.error('[DailyNews] fetchAll error:', e);
    return [];
  }
}
