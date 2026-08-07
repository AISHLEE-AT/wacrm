import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

let gameoClient: SupabaseClient | undefined

export function getGameOClient() {
  if (gameoClient) return gameoClient

  if (process.env.NEXT_PUBLIC_GAMEO_SUPABASE_URL && process.env.NEXT_PUBLIC_GAMEO_SUPABASE_ANON_KEY) {
    gameoClient = createBrowserClient(
      process.env.NEXT_PUBLIC_GAMEO_SUPABASE_URL,
      process.env.NEXT_PUBLIC_GAMEO_SUPABASE_ANON_KEY
    )
  } else {
    gameoClient = createClient()
  }

  return gameoClient
}
