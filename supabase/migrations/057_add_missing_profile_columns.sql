-- 057_add_missing_profile_columns.sql

-- 1. Safely add all columns that the frontend expects in the `profiles` table.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS beta_features JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_role account_role_enum DEFAULT 'viewer';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS upi_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pincode TEXT;
-- (phone, whatsapp, full_name, and role usually already exist based on recent schemas, but this ensures safety)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whatsapp TEXT;

-- 2. Ensure email is NOT required so phone sign-ups work gracefully.
ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;

-- 3. Update the trigger to handle missing emails safely
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

  INSERT INTO public.profiles (id, full_name, email, phone, account_id, account_role)
  VALUES (NEW.id, v_full_name, NEW.email, NEW.phone, v_account_id, 'owner');

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to bootstrap account/profile for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- 4. Backfill missing profiles for existing orphaned users (like those who signed up with phone)
INSERT INTO public.profiles (id, full_name, email, phone)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', 'User'),
  u.email,
  u.phone
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id::text = u.id::text
)
ON CONFLICT (id) DO NOTHING;

-- 5. Backfill missing accounts for orphaned profiles
INSERT INTO public.accounts (name, owner_user_id)
SELECT 
  COALESCE(NULLIF(p.full_name, ''), p.email, p.phone, 'My account'),
  p.id
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.accounts a WHERE a.owner_user_id::text = p.id::text
);

-- 6. Stamp account_id and account_role back onto the profiles
UPDATE public.profiles p
SET account_id = a.id,
    account_role = 'owner'
FROM public.accounts a
WHERE p.id::text = a.owner_user_id::text
  AND p.account_id IS NULL;

-- 7. Fix is_account_member function which might still reference the old user_id column instead of id.
CREATE OR REPLACE FUNCTION public.is_account_member(
  target_account_id UUID,
  min_role public.account_role_enum DEFAULT 'viewer'::public.account_role_enum
) RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $func
  SELECT EXISTS (
    SELECT 1
    FROM profiles p
    WHERE p.id = auth.uid()
      AND p.account_id = target_account_id
      AND CASE p.account_role
            WHEN 'owner'  THEN 4
            WHEN 'admin'  THEN 3
            WHEN 'agent'  THEN 2
            WHEN 'viewer' THEN 1
          END
        >=
          CASE min_role
            WHEN 'owner'  THEN 4
            WHEN 'admin'  THEN 3
            WHEN 'agent'  THEN 2
            WHEN 'viewer' THEN 1
          END
  );
$func;
