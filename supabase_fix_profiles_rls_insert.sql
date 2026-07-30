-- ==============================================================================
-- FAGO WACRM: Fix Missing RLS INSERT Policy on Profiles Table
-- This allows users to auto-create (upsert) their own profile on first login.
-- Run this in your Supabase SQL Editor.
-- ==============================================================================

-- Drop if it already exists just in case
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create policy to allow INSERT only for the logged-in user
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Make sure we also allow service role to insert profiles if needed
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;
CREATE POLICY "Service role can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.role() = 'service_role');
