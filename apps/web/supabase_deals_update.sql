-- ==============================================================================
-- FAGO SUPER APP: FULL SQL SCHEMA UPDATES FOR DEALO & PROFILES
-- Run this script in Supabase SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Ensure local_deals table exists with all new Tamilnadu & P2P features
CREATE TABLE IF NOT EXISTS public.local_deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    deal_type TEXT NOT NULL DEFAULT 'sell', -- 'sell' or 'buy'
    title TEXT NOT NULL,
    title_tamil TEXT,                       -- Tamil Title (குரல் தட்டச்சு)
    description TEXT,
    category TEXT NOT NULL DEFAULT 'electronics',
    price NUMERIC NOT NULL DEFAULT 0,
    is_negotiable BOOLEAN DEFAULT true,
    allow_barter BOOLEAN DEFAULT false,     -- Barter Trade Option (பொருட்கள் மாற்று)
    images TEXT[],                          -- Array of photo URLs
    pincode TEXT NOT NULL DEFAULT '641001',
    location_name TEXT DEFAULT 'Coimbatore, Tamil Nadu',
    lat DOUBLE PRECISION DEFAULT 11.0168,
    lng DOUBLE PRECISION DEFAULT 76.9558,
    seller_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    upi_id TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Defensive ADD COLUMN IF NOT EXISTS statements for existing local_deals
ALTER TABLE public.local_deals ADD COLUMN IF NOT EXISTS title_tamil TEXT;
ALTER TABLE public.local_deals ADD COLUMN IF NOT EXISTS allow_barter BOOLEAN DEFAULT false;
ALTER TABLE public.local_deals ADD COLUMN IF NOT EXISTS upi_id TEXT;
ALTER TABLE public.local_deals ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION DEFAULT 11.0168;
ALTER TABLE public.local_deals ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION DEFAULT 76.9558;

-- Enable Row Level Security (RLS) and grant open public access
ALTER TABLE public.local_deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to local_deals" ON public.local_deals
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to local_deals" ON public.local_deals
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to update their own deals" ON public.local_deals
    FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);


-- 2. Ensure profiles table has fcm_token and main_category columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fcm_token TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS main_category TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;


-- 3. Ensure drivers table schema is defensive for driver registration queries
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS driver_name TEXT;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS service_type TEXT;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true;

-- Update existing NULL driver_name from full_name if available
UPDATE public.drivers 
SET driver_name = full_name 
WHERE driver_name IS NULL AND full_name IS NOT NULL;

UPDATE public.drivers 
SET full_name = driver_name 
WHERE full_name IS NULL AND driver_name IS NOT NULL;
