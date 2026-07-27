-- ============================================================
-- FAGO Super App & WhatsApp CRM - Complete SQL Integrity Script
-- ============================================================

-- 1. Ensure 9123596988 is demoted to a regular user
UPDATE public.profiles
SET role = 'user',
    updated_at = NOW()
WHERE phone IN ('9123596988', '919123596988')
   OR whatsapp IN ('9123596988', '919123596988');

-- 2. Ensure Primary Admin (9486335870) has full Admin / Owner role
UPDATE public.profiles
SET role = 'admin',
    account_role = 'owner',
    updated_at = NOW()
WHERE phone IN ('9486335870', '919486335870')
   OR whatsapp IN ('9486335870', '919486335870')
   OR email = 'aishleetechnology@gmail.com';

-- 3. Auto-create default accounts for any orphaned profiles without an account_id
INSERT INTO public.accounts (id, name, owner_user_id, created_at)
SELECT 
    p.id AS id,
    COALESCE(p.full_name, 'Account') || ' Workspace' AS name,
    p.id AS owner_user_id,
    NOW() AS created_at
FROM public.profiles p
WHERE p.account_id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 4. Link orphaned profiles to their respective accounts
UPDATE public.profiles p
SET account_id = p.id,
    account_role = COALESCE(p.account_role, 'owner'),
    updated_at = NOW()
WHERE p.account_id IS NULL;

-- 5. Ensure whatsapp_config table exists with proper UNIQUE constraint on account_id
CREATE TABLE IF NOT EXISTS public.whatsapp_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    phone_number_id TEXT NOT NULL,
    waba_id TEXT,
    verify_token TEXT,
    access_token TEXT NOT NULL,
    status TEXT DEFAULT 'connected',
    registered_at TIMESTAMPTZ,
    connected_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT whatsapp_config_account_id_key UNIQUE (account_id)
);

-- 6. Grant read/write access to service_role and authenticated users
GRANT ALL ON TABLE public.whatsapp_config TO service_role;
GRANT ALL ON TABLE public.whatsapp_config TO authenticated;

-- Verification Query
SELECT id, full_name, phone, whatsapp, role, account_id, account_role 
FROM public.profiles 
WHERE phone IN ('9486335870', '9123596988')
   OR email = 'aishleetechnology@gmail.com';
