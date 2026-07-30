-- ============================================================
-- FAGO / WACRM — UNIFIED AUTH FIX
-- Adds pin_hash (bcrypt), platform tracking, last_login
-- Sets admin role for known admin phones in profiles
-- Run this in Supabase SQL Editor ONCE
-- ============================================================

-- Add new unified columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS pin_hash TEXT,
  ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'web',
  ADD COLUMN IF NOT EXISTS whatsapp_connected BOOLEAN DEFAULT FALSE;

-- Ensure whatsapp_otps table exists with all required columns
CREATE TABLE IF NOT EXISTS public.whatsapp_otps (
  phone_number TEXT PRIMARY KEY,
  otp TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grant admin role to all known admin phones
-- This replaces hardcoded phone lists in code
UPDATE public.profiles
  SET role = 'admin'
  WHERE phone IN ('9486335870', '919486335870', '9123596988', '919123596988')
     OR whatsapp IN ('9486335870', '919486335870', '9123596988', '919123596988');

-- Ensure RLS is enabled on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read/update their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Service role full access" ON public.profiles;
CREATE POLICY "Service role full access"
  ON public.profiles FOR ALL
  USING (auth.role() = 'service_role');

-- Index for fast phone lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_whatsapp ON public.profiles(whatsapp);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- whatsapp_otps RLS
ALTER TABLE public.whatsapp_otps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role can manage OTPs" ON public.whatsapp_otps;
CREATE POLICY "Service role can manage OTPs"
  ON public.whatsapp_otps FOR ALL
  USING (auth.role() = 'service_role');

SELECT 'FAGO Unified Auth Schema Applied Successfully' as status;
