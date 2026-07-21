-- 046_onboarding_fields.sql

-- Extend profiles table with new onboarding and module preferences
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS whatsapp TEXT,
ADD COLUMN IF NOT EXISTS main_category TEXT,
ADD COLUMN IF NOT EXISTS sub_categories JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS default_module TEXT,
ADD COLUMN IF NOT EXISTS profile_complete BOOLEAN DEFAULT false;

-- To force schema cache reload on PostgREST
NOTIFY pgrst, 'reload schema';
