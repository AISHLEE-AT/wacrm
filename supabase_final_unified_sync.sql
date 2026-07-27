-- ==============================================================================
-- FAGO SUPER APP: Unified Cross-Platform Profile Sync & Fast-Pass SQL Script
-- Run this script in the Supabase SQL Editor for project: gmahjdzqitbomtmdzlfp
-- Dashboard Link: https://supabase.com/dashboard/project/gmahjdzqitbomtmdzlfp/sql
-- ==============================================================================

-- 1. Ensure all essential columns exist in public.profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone          TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whatsapp       TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name      TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role           TEXT DEFAULT 'user';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS main_category  TEXT DEFAULT 'Traveller';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS default_module TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pin             TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address         TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS upi_id          TEXT;

-- 2. Create sub-10ms B-Tree Indexes on phone and whatsapp columns
CREATE INDEX IF NOT EXISTS idx_profiles_phone     ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_whatsapp  ON public.profiles(whatsapp);
CREATE INDEX IF NOT EXISTS idx_profiles_phone_91  ON public.profiles(phone) WHERE phone LIKE '91%';
CREATE INDEX IF NOT EXISTS idx_profiles_role      ON public.profiles(role);

-- 3. Ensure whatsapp_otps table exists for resilient OTP handling
CREATE TABLE IF NOT EXISTS public.whatsapp_otps (
    phone_number TEXT PRIMARY KEY,
    otp          TEXT NOT NULL,
    expires_at   TIMESTAMPTZ NOT NULL,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Grant RLS access to whatsapp_otps
ALTER TABLE public.whatsapp_otps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public WhatsApp OTP access" ON public.whatsapp_otps;
CREATE POLICY "Public WhatsApp OTP access" ON public.whatsapp_otps FOR ALL USING (true);

-- 4. RPC Function: get_profile_by_phone
--    Enables instant phone-based profile pickup across Web, Flutter, and Native Android
CREATE OR REPLACE FUNCTION public.get_profile_by_phone(p_phone TEXT)
RETURNS SETOF public.profiles
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.profiles
  WHERE phone = p_phone
     OR phone = '91' || p_phone
     OR phone = right(p_phone, 10)
     OR whatsapp = p_phone
     OR whatsapp = '91' || p_phone
  LIMIT 1;
$$;

-- 5. RPC Function: upsert_profile_by_phone
--    Syncs profiles ensuring no duplicates when switching between Web and Mobile
CREATE OR REPLACE FUNCTION public.upsert_profile_by_phone(
  p_user_id       UUID,
  p_phone         TEXT,
  p_full_name     TEXT,
  p_role          TEXT DEFAULT 'user',
  p_main_category TEXT DEFAULT 'Traveller'
)
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_existing_id UUID;
  v_result      public.profiles;
BEGIN
  SELECT id INTO v_existing_id
  FROM public.profiles
  WHERE phone = p_phone OR whatsapp = p_phone OR phone = right(p_phone, 10)
  LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    UPDATE public.profiles
    SET
      full_name     = COALESCE(NULLIF(p_full_name, ''), full_name),
      role          = COALESCE(NULLIF(p_role, ''), role),
      main_category = COALESCE(NULLIF(p_main_category, ''), main_category),
      phone         = p_phone,
      whatsapp      = p_phone,
      updated_at    = NOW()
    WHERE id = v_existing_id;

    SELECT * INTO v_result FROM public.profiles WHERE id = v_existing_id;
  ELSE
    INSERT INTO public.profiles (id, phone, whatsapp, full_name, role, main_category, updated_at)
    VALUES (p_user_id, p_phone, p_phone, p_full_name, p_role, p_main_category, NOW())
    ON CONFLICT (id) DO UPDATE
    SET
      phone         = EXCLUDED.phone,
      whatsapp      = EXCLUDED.whatsapp,
      full_name     = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
      main_category = COALESCE(EXCLUDED.main_category, public.profiles.main_category),
      updated_at    = NOW();

    SELECT * INTO v_result FROM public.profiles WHERE id = p_user_id;
  END IF;

  RETURN v_result;
END;
$$;

-- 6. Grant Execution Permissions to authenticated and anon roles
GRANT EXECUTE ON FUNCTION public.get_profile_by_phone(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.upsert_profile_by_phone(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated, anon;

-- 7. Verification Query
SELECT 'Unified Sync Setup Complete!' AS status;
