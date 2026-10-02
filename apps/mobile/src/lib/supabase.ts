import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { ENV } from '../config/env';

const SUPABASE_URL = ENV.CRM_URL || 'https://mysupro-crm.duckdns.org';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoicG9zdGdyZXMiLCJpc3MiOiJzdXByby1vY2kiLCJpYXQiOjE3OTA0MDAwMDYsImV4cCI6MjEwNTk3NjAwNn0.5JnlOQOdNyLuYrZp0SV7MtQ8sAzz0daLgnYT7Z43pHo';

// ─── SecureStore-backed storage adapter for Supabase Auth ───
// This ensures the Supabase client automatically persists and restores
// the user's auth session across app restarts. Every part of the app
// (profile queries, storage uploads, realtime subscriptions) will be
// authenticated without needing manual setSession calls.
const SecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {}
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {}
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: SecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // not needed in React Native
  },
});
