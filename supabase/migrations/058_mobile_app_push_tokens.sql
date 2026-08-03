-- ============================================================
-- 058_mobile_app_push_tokens.sql
-- Adds the push_token column to the profiles table for Expo Push Notifications
-- ============================================================

-- 1. Add the push_token column to allow the mobile app to receive native notifications
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS push_token TEXT;

-- 2. Ensure RLS policies allow users to update their own profile (which usually already exists, but good to be safe)
-- Note: the actual update logic happens securely through the Next.js API in /api/profile/update, 
-- which uses a service role or handles its own auth checks.
