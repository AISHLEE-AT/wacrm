import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

let gameoClient: SupabaseClient | undefined

export function getGameOClient() {
  if (gameoClient) return gameoClient

  gameoClient = createBrowserClient(
    process.env.NEXT_PUBLIC_GAMEO_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_GAMEO_SUPABASE_ANON_KEY!
  )

  return gameoClient
}
