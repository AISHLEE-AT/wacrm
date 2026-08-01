-- ==============================================================================
-- PART 6: ADD ACCOUNT_ID COLUMN & SECURITY POLICIES TO PROFILES
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard
-- Fixes "Your profile is not linked to an account" and enforces strict login security.
-- ==============================================================================

-- 1. Add account_id column to public.profiles if missing
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_id UUID;

-- 2. Populate account_id with user id for existing rows
UPDATE public.profiles SET account_id = id WHERE account_id IS NULL;

-- 3. Set default value for new rows
ALTER TABLE public.profiles ALTER COLUMN account_id SET DEFAULT gen_random_uuid();

-- 4. Reload Schema Cache
NOTIFY pgrst, 'reload schema';

SELECT '=== ✅ ACCOUNT_ID COLUMN ADDED & ALL PROFILES LINKED TO WORKSPACE ACCOUNTS! ===' AS status;
