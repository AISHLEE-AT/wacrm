-- ==============================================================================
-- Migration: 072_supro_agro_and_user_category_update.sql
-- Description: Supports User Category dropdown & AgrO Media/Content
-- Target: Supabase Postgres
-- ==============================================================================

-- 1. Ensure profiles table has user category and default module columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS main_category TEXT DEFAULT 'Traveller';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS default_module TEXT DEFAULT '/rideo';

-- 2. Ensure unified_master_data table exists for Admin Agri Videos & LMS
CREATE TABLE IF NOT EXISTS public.unified_master_data (
    id TEXT PRIMARY KEY,
    item_type TEXT NOT NULL, -- 'AGRI_MEDIA', 'COURSE', 'o_test', 'RESOURCE'
    category TEXT,
    title_name TEXT NOT NULL,
    description_purpose TEXT,
    links_data TEXT,
    additional_info JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_unified_master_item_type ON public.unified_master_data(item_type);
CREATE INDEX IF NOT EXISTS idx_unified_master_category ON public.unified_master_data(category);

-- 3. Row Level Security for unified_master_data
ALTER TABLE public.unified_master_data ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Public can view master data" ON public.unified_master_data;
    CREATE POLICY "Public can view master data" ON public.unified_master_data FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Authenticated users can insert master data" ON public.unified_master_data;
    CREATE POLICY "Authenticated users can insert master data" ON public.unified_master_data FOR INSERT WITH CHECK (auth.role() = 'authenticated');
END $$;
