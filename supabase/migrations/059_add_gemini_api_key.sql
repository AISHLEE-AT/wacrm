-- 059_add_gemini_api_key.sql

-- Safely add the gemini_api_key column to the profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gemini_api_key TEXT;
