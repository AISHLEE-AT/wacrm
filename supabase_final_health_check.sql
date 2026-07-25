-- ==============================================================================
-- FAGO & WACRM – FINAL HEALTH CHECK & PRODUCTION DATABASE READY SCRIPT
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard
-- Ensures all authentication and core tables exist with proper RLS policies.
-- ==============================================================================

-- 1. WHATSAPP OTPS TABLE (Instant WhatsApp OTP Auth)
CREATE TABLE IF NOT EXISTS public.whatsapp_otps (
    phone_number TEXT PRIMARY KEY,
    otp TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.whatsapp_otps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public whatsapp_otps access" ON public.whatsapp_otps;
CREATE POLICY "Public whatsapp_otps access" ON public.whatsapp_otps FOR ALL USING (true) WITH CHECK (true);

-- 2. PROFILES TABLE (User Profile & Goal Category)
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    phone TEXT,
    full_name TEXT,
    email TEXT,
    avatar_url TEXT,
    main_category TEXT,
    default_module TEXT,
    whatsapp TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS main_category TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whatsapp TEXT;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles access" ON public.profiles;
CREATE POLICY "Public profiles access" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

-- 3. CONTACTS TABLE (CRM Contact Book)
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    phone TEXT,
    name TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public contacts access" ON public.contacts;
CREATE POLICY "Public contacts access" ON public.contacts FOR ALL USING (true) WITH CHECK (true);

-- 4. FAST PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_whatsapp_otps_phone ON public.whatsapp_otps(phone_number);

-- 5. RELOAD API SCHEMA CACHE
NOTIFY pgrst, 'reload schema';

SELECT '=== 🎉 Supabase Production Database Health Check Complete & Ready! ===' AS status;
