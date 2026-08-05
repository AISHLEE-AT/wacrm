import { createClient } from '@supabase/supabase-js';

// Separate Supabase DB instance specifically for the GameO module
// This prevents high-frequency game telemetry (like Ghost racing coordinates)
// from bogging down the main SuprO ecosystem database.

const GAMEO_SUPABASE_URL = process.env.EXPO_PUBLIC_GAMEO_SUPABASE_URL || 'https://maznlybuvhcobppndxsg.supabase.co';
const GAMEO_SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_GAMEO_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hem5seWJ1dmhjb2JwcG5keHNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4OTc0NDAsImV4cCI6MjEwMTQ3MzQ0MH0.h47SZoRDleIEEo-Ms0cLLI67bEbFlIRTta_wXmvZoFc';

export const gameoSupabase = createClient(GAMEO_SUPABASE_URL, GAMEO_SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true, // We can persist this separately from the main app
  },
});
