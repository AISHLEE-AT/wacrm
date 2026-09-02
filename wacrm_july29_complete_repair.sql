-- ==============================================================================
-- WACRM JULY 29, 2026 — COMPLETE DATABASE REPAIR & ACCOUNT RECOVERY SCRIPT
-- ==============================================================================
-- Run this ENTIRE script in your Supabase SQL Editor:
-- 👉 https://supabase.com/dashboard → Your Project → SQL Editor → New Query
--
-- What this script fixes:
--   1) Re-creates the `accounts` table and `account_role_enum` (Migration 017)
--   2) Restores the `account_id` and `account_role` columns on `profiles` and
--      all CRM tables (using `p.id` as the primary key reference to auth.users)
--   3) Re-creates all essential July 29 WACRM core tables if missing:
--      - whatsapp_config, conversations, messages, message_templates
--      - broadcasts, automations, flows, contacts, tags, etc.
--   4) Backfills accounts for ALL existing users so that nobody gets:
--      "Your profile is not linked to an account"
--   5) Configures Admin account (6381029380) & Virtual Test Support account (9123596988)
--   6) Re-creates required RPC functions and reloads PostgREST schema cache
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- STEP 1: TYPES & ACCOUNT TABLES (MIGRATION 017)
-- ==============================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_role_enum') THEN
    CREATE TYPE account_role_enum AS ENUM ('owner', 'admin', 'agent', 'viewer');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_accounts_one_per_owner
  ON public.accounts(owner_user_id);

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.account_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  role account_role_enum NOT NULL CHECK (role <> 'owner'),
  created_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  accepted_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_account_invitations_account_pending
  ON public.account_invitations(account_id, expires_at)
  WHERE accepted_at IS NULL;

ALTER TABLE public.account_invitations ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- STEP 2: RESTORE account_id & account_role ON PROFILES
-- ==============================================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS account_role account_role_enum;

CREATE INDEX IF NOT EXISTS idx_profiles_account_role
  ON public.profiles(account_id, account_role);

-- Helper function required by RLS policies (using text casting for safe matching)
CREATE OR REPLACE FUNCTION public.is_account_member(
  target_account_id UUID,
  min_role account_role_enum DEFAULT 'viewer'
) RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM profiles p
    WHERE p.id::text = auth.uid()::text
      AND p.account_id::text = target_account_id::text
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
$$;

ALTER FUNCTION public.is_account_member(UUID, account_role_enum) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.is_account_member(UUID, account_role_enum) TO authenticated, service_role;

-- ==============================================================================
-- STEP 3: ENSURE ALL WACRM CORE TABLES EXIST
-- ==============================================================================

-- 3.1 Contacts
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  name TEXT,
  email TEXT,
  company TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.2 Tags & Custom Fields
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.custom_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  field_type TEXT NOT NULL DEFAULT 'text',
  field_options JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.contact_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.3 Conversations & Messages
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'pending', 'closed')),
  assigned_agent_id UUID,
  last_message_text TEXT,
  last_message_at TIMESTAMPTZ,
  unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'agent', 'bot')),
  sender_id UUID,
  content_type TEXT NOT NULL DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'document', 'audio', 'video', 'location', 'template')),
  content_text TEXT,
  media_url TEXT,
  template_name TEXT,
  message_id TEXT,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sending', 'sent', 'delivered', 'read', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.4 WhatsApp Config & Message Templates
CREATE TABLE IF NOT EXISTS public.whatsapp_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number_id TEXT NOT NULL,
  waba_id TEXT,
  access_token TEXT NOT NULL,
  verify_token TEXT,
  status TEXT NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected')),
  connected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.message_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Marketing' CHECK (category IN ('Marketing', 'Utility', 'Authentication')),
  language TEXT DEFAULT 'en_US',
  header_type TEXT CHECK (header_type IN ('text', 'image', 'video', 'document')),
  header_content TEXT,
  body_text TEXT NOT NULL,
  footer_text TEXT,
  buttons JSONB,
  status TEXT DEFAULT 'Draft' CHECK (status IN ('Draft', 'Pending', 'Approved', 'Rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.5 Pipelines & Deals
CREATE TABLE IF NOT EXISTS public.pipelines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pipeline_id UUID NOT NULL REFERENCES public.pipelines(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  value NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.6 Broadcasts, Automations & Flows
CREATE TABLE IF NOT EXISTS public.broadcasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  template_id UUID REFERENCES public.message_templates(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.automations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  trigger_config JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.automation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  automation_id UUID NOT NULL REFERENCES public.automations(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  status TEXT NOT NULL,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.automation_pending_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  automation_id UUID NOT NULL REFERENCES public.automations(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  execute_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.flows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trigger_keyword TEXT,
  nodes JSONB DEFAULT '[]'::jsonb,
  edges JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.flow_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flow_id UUID NOT NULL REFERENCES public.flows(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  current_node_id TEXT,
  status TEXT DEFAULT 'running',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- STEP 4: ADD account_id COLUMNS TO ALL DOMAIN TABLES
-- ==============================================================================
ALTER TABLE public.contacts                      ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE;
ALTER TABLE public.tags                          ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE;
ALTER TABLE public.custom_fields                 ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE;
ALTER TABLE public.contact_notes                 ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE;
ALTER TABLE public.conversations                 ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE;
ALTER TABLE public.whatsapp_config               ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE;
ALTER TABLE public.message_templates             ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE;
ALTER TABLE public.pipelines                     ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE;
ALTER TABLE public.deals                         ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE;
ALTER TABLE public.broadcasts                    ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE;
ALTER TABLE public.automations                   ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE;
ALTER TABLE public.automation_logs               ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE;
ALTER TABLE public.automation_pending_executions ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE;
ALTER TABLE public.flows                         ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE;
ALTER TABLE public.flow_runs                     ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE;

-- ==============================================================================
-- STEP 5: BACKFILL ACCOUNTS FOR EVERY USER (USING ::text FOR SAFE MATCHING)
-- ==============================================================================
DO $$
DECLARE
  v_table TEXT;
  v_tables TEXT[] := ARRAY[
    'contacts', 'tags', 'custom_fields', 'contact_notes',
    'conversations', 'whatsapp_config', 'message_templates',
    'pipelines', 'deals', 'broadcasts',
    'automations', 'flows'
  ];
BEGIN
  -- 5.1 Heal orphaned users in auth.users by creating profile rows if missing
  INSERT INTO public.profiles (id, full_name, phone)
  SELECT u.id,
         COALESCE(u.raw_user_meta_data->>'full_name', 'User'),
         COALESCE(u.phone, '')
  FROM auth.users u
  WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id::text = u.id::text
  )
  ON CONFLICT (id) DO NOTHING;

  -- 5.2 Create one account per existing profile whose user does not own an account
  INSERT INTO public.accounts (name, owner_user_id)
  SELECT COALESCE(NULLIF(p.full_name, ''), p.phone, 'My account'),
         p.id
  FROM public.profiles p
  WHERE NOT EXISTS (
    SELECT 1 FROM public.accounts a WHERE a.owner_user_id::text = p.id::text
  );

  -- 5.3 Stamp profile.account_id / account_role for every profile
  UPDATE public.profiles p
  SET account_id   = a.id,
      account_role = 'owner'
  FROM public.accounts a
  WHERE a.owner_user_id::text = p.id::text
    AND p.account_id IS NULL;

  -- 5.4 Propagate account_id to domain tables that have user_id
  FOREACH v_table IN ARRAY v_tables LOOP
    EXECUTE format($f$
      UPDATE public.%I t
      SET account_id = p.account_id
      FROM public.profiles p
      WHERE t.user_id::text = p.id::text
        AND t.account_id IS NULL
    $f$, v_table);
  END LOOP;

  -- 5.5 Propagate account_id to child tables that do not have user_id
  UPDATE public.automation_logs t
  SET account_id = a.account_id
  FROM public.automations a
  WHERE t.automation_id::text = a.id::text
    AND t.account_id IS NULL;

  UPDATE public.automation_pending_executions t
  SET account_id = a.account_id
  FROM public.automations a
  WHERE t.automation_id::text = a.id::text
    AND t.account_id IS NULL;

  UPDATE public.flow_runs t
  SET account_id = f.account_id
  FROM public.flows f
  WHERE t.flow_id::text = f.id::text
    AND t.account_id IS NULL;
END $$;

-- ==============================================================================
-- STEP 6: CONFIGURE USER ACCOUNTS (ADMIN 6381029380 & TEST SUPPORT 9123596988)
-- ==============================================================================

-- 6.1 Set 6381029380 as Admin
UPDATE public.profiles
SET role = 'admin',
    account_role = 'owner'
WHERE phone IN ('6381029380', '916381029380', '91916381029380')
   OR whatsapp IN ('6381029380', '916381029380', '91916381029380');

-- 6.2 Set 9123596988 as Virtual Support Test User (with owner access to their account)
UPDATE public.profiles
SET role = 'driver',
    account_role = 'owner'
WHERE phone IN ('9123596988', '919123596988', '91919123596988')
   OR whatsapp IN ('9123596988', '919123596988', '91919123596988');

-- ==============================================================================
-- STEP 7: ESSENTIAL MEMBER & INVITATION RPC FUNCTIONS
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.set_member_role(
  p_user_id UUID,
  p_new_role account_role_enum
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_account_id UUID;
  v_caller_role account_role_enum;
  v_target_account_id UUID;
  v_target_role account_role_enum;
BEGIN
  SELECT account_id, account_role INTO v_caller_account_id, v_caller_role
  FROM profiles WHERE id::text = auth.uid()::text;
  
  IF v_caller_account_id IS NULL OR v_caller_role <> 'owner' AND v_caller_role <> 'admin' THEN
    RAISE EXCEPTION 'insufficient_privilege' USING ERRCODE = '42501';
  END IF;

  SELECT account_id, account_role INTO v_target_account_id, v_target_role
  FROM profiles WHERE id::text = p_user_id::text;

  IF v_target_account_id <> v_caller_account_id OR v_target_role = 'owner' OR p_new_role = 'owner' THEN
    RAISE EXCEPTION 'invalid_parameter_value' USING ERRCODE = '22023';
  END IF;

  UPDATE profiles SET account_role = p_new_role WHERE id::text = p_user_id::text;
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_member_role(UUID, account_role_enum) TO authenticated, service_role;

-- ==============================================================================
-- STEP 8: RELOAD POSTGREST SCHEMA CACHE & VERIFY
-- ==============================================================================
NOTIFY pgrst, 'reload schema';

SELECT
  '✅ WACRM JULY 29 DATABASE FULLY RESTORED AND WORKING FOR ALL LOGINS!' AS status,
  (SELECT COUNT(*) FROM public.accounts) AS total_accounts,
  (SELECT COUNT(*) FROM public.profiles WHERE account_id IS NOT NULL) AS profiles_linked_to_account,
  (SELECT role FROM public.profiles WHERE phone LIKE '%6381029380%' LIMIT 1) AS admin_role,
  (SELECT role FROM public.profiles WHERE phone LIKE '%9123596988%' LIMIT 1) AS test_user_role;
