-- ==============================================================================
-- PART 1: COMPLETE DATABASE FLUSH & RESET SCRIPT (SUPABASE / POSTGRES)
-- WARNING: THIS WILL PERMANENTLY DELETE ALL USER ACCOUNTS, PROFILES, AND DATA!
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard
-- ==============================================================================

-- 1. Temporarily bypass triggers during cleanup
SET session_replication_role = 'replica';

-- 2. Drop user signup trigger & trigger function on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;

-- 3. Drop all tables in the public schema CASCADE
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;

-- 4. Drop all custom views in the public schema CASCADE
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT table_name FROM information_schema.views WHERE table_schema = 'public') LOOP
        EXECUTE 'DROP VIEW IF EXISTS public.' || quote_ident(r.table_name) || ' CASCADE';
    END LOOP;
END $$;

-- 5. Delete all registered user records from auth schema (auth.users & dependencies)
DELETE FROM auth.users;

-- 6. Restore normal trigger processing
SET session_replication_role = 'origin';

-- 7. Reload Supabase API Schema Cache
NOTIFY pgrst, 'reload schema';

SELECT '=== 💥 DATABASE COMPLETELY FLUSHED! ZERO USERS, ZERO DATA REMAINING ===' AS status;
