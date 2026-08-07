import { createBrowserClient } from '@supabase/ssr';

export function createLMSClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_LMS_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_LMS_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing NEXT_PUBLIC_LMS_SUPABASE_URL or NEXT_PUBLIC_LMS_SUPABASE_ANON_KEY in environment variables.');
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}
