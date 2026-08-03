-- 056_fix_phone_auth_profiles.sql
-- Fixes the issue where users signing up with a phone number (no email)
-- fail to have a profile/account generated because `email` was NOT NULL.

-- 1. Make email optional since phone signups don't have one initially
ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;

-- 2. Update the trigger to handle missing emails safely
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name TEXT;
  v_account_id UUID;
BEGIN
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');

  INSERT INTO public.accounts (name, owner_user_id)
  VALUES (COALESCE(NULLIF(v_full_name, ''), NEW.email, NEW.phone, 'My account'), NEW.id)
  RETURNING id INTO v_account_id;

  INSERT INTO public.profiles (id, user_id, full_name, email, phone, account_id, account_role)
  VALUES (NEW.id, NEW.id, v_full_name, NEW.email, NEW.phone, v_account_id, 'owner');

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to bootstrap account/profile for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- 3. Backfill missing profiles for existing orphaned users (like those who signed up with phone)
INSERT INTO public.profiles (id, user_id, full_name, email, phone)
SELECT 
  u.id,
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', 'User'),
  u.email,
  u.phone
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id::text = u.id::text
)
ON CONFLICT (id) DO NOTHING;

-- 4. Backfill missing accounts for orphaned profiles
INSERT INTO public.accounts (name, owner_user_id)
SELECT 
  COALESCE(NULLIF(p.full_name, ''), p.email, p.phone, 'My account'),
  p.id
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.accounts a WHERE a.owner_user_id::text = p.id::text
);

-- 5. Stamp account_id and account_role back onto the profiles
UPDATE public.profiles p
SET account_id = a.id,
    account_role = 'owner'
FROM public.accounts a
WHERE p.id::text = a.owner_user_id::text
  AND p.account_id IS NULL;
