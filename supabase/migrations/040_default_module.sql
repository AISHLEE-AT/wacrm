-- Add default_module column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS default_module TEXT;
