-- ==============================================================================
-- FAGO WACRM: Critical Fix — Cross-Platform Profile Sync (Mobile ↔ Web)
-- Issue: Users registered on WEB have a different Supabase auth.users UUID
--        than what the mobile app creates. This causes profiles to not load.
-- Fix: Add phone indexes + RPC function to upsert/find profile by phone.
-- Run this in Supabase SQL Editor → https://supabase.com/dashboard/project/gmahjdzqitbomtmdzlfp/sql
-- ==============================================================================

-- 1. Add indexes on phone/whatsapp columns for fast lookup
CREATE INDEX IF NOT EXISTS idx_profiles_phone     ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_whatsapp  ON public.profiles(whatsapp);
CREATE INDEX IF NOT EXISTS idx_profiles_phone_91  ON public.profiles(phone) WHERE phone LIKE '91%';

-- 2. RPC Function: get_profile_by_phone
--    Allows mobile app to look up a profile using phone number instead of user ID.
--    Returns the profile row (including the Supabase user ID) so we can merge.
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

-- 3. RPC Function: upsert_profile_by_phone
--    Used by mobile app to sync/create profile ensuring no duplicates by phone.
--    If a profile with this phone exists (created from web login), it UPDATES it.
--    Otherwise it creates a new one with the provided user_id.
CREATE OR REPLACE FUNCTION public.upsert_profile_by_phone(
  p_user_id    UUID,
  p_phone      TEXT,
  p_full_name  TEXT,
  p_role       TEXT DEFAULT 'user'
)
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_existing_id   UUID;
  v_existing_name TEXT;
  v_existing_role TEXT;
  v_result        public.profiles;
BEGIN
  -- Check if profile exists by this phone (from web registration)
  SELECT id, full_name, role
  INTO v_existing_id, v_existing_name, v_existing_role
  FROM public.profiles
  WHERE phone = p_phone
     OR phone = '91' || p_phone
     OR phone = right(p_phone, 10)
     OR whatsapp = p_phone
  LIMIT 1;

  IF v_existing_id IS NOT NULL AND v_existing_id <> p_user_id THEN
    -- Profile found under a different user ID (web-registered user)
    -- Update the existing profile with the new mobile auth user ID info
    UPDATE public.profiles
    SET
      -- Only update name if the existing one is a placeholder
      full_name  = CASE
                     WHEN v_existing_name IS NULL OR v_existing_name LIKE 'User %'
                     THEN COALESCE(p_full_name, v_existing_name)
                     ELSE v_existing_name
                   END,
      phone      = p_phone,
      whatsapp   = p_phone,
      updated_at = NOW()
    WHERE id = v_existing_id;

    SELECT * INTO v_result FROM public.profiles WHERE id = v_existing_id;
  ELSE
    -- No existing profile by phone — upsert by user ID (normal mobile flow)
    INSERT INTO public.profiles (id, phone, whatsapp, full_name, role, updated_at)
    VALUES (p_user_id, p_phone, p_phone, p_full_name, p_role, NOW())
    ON CONFLICT (id) DO UPDATE
    SET
      phone      = EXCLUDED.phone,
      whatsapp   = EXCLUDED.whatsapp,
      full_name  = CASE
                     WHEN public.profiles.full_name IS NULL OR public.profiles.full_name LIKE 'User %'
                     THEN EXCLUDED.full_name
                     ELSE public.profiles.full_name
                   END,
      updated_at = NOW();

    SELECT * INTO v_result FROM public.profiles WHERE id = p_user_id;
  END IF;

  RETURN v_result;
END;
$$;

-- 4. RLS: Allow authenticated users to call these functions
GRANT EXECUTE ON FUNCTION public.get_profile_by_phone(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_profile_by_phone(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.upsert_profile_by_phone(UUID, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_profile_by_phone(UUID, TEXT, TEXT, TEXT) TO anon;

-- 5. Verify test user 9123596988 profile exists
--    Run this after the above to confirm the fix works:
SELECT id, full_name, phone, whatsapp, role, updated_at
FROM public.profiles
WHERE phone IN ('9123596988', '919123596988')
   OR whatsapp IN ('9123596988', '919123596988');
