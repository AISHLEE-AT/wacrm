-- ============================================================================
-- Migration 049: Cleanup Legacy Tables & Enforce Unified App Schema
-- Active Modules: WhatsApp CRM, RideO, DrivO, Admin, Wallet, Profile & Settings
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. SAFELY DROP LEGACY TABLES (From Purged Modules)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS public.testo_user_answers CASCADE;
DROP TABLE IF EXISTS public.testo_test_attempts CASCADE;
DROP TABLE IF EXISTS public.testo_questions CASCADE;
DROP TABLE IF EXISTS public.testo_tests CASCADE;

DROP TABLE IF EXISTS public.tasko_submissions CASCADE;
DROP TABLE IF EXISTS public.tasko_tasks CASCADE;

DROP TABLE IF EXISTS public.tradeo_orders CASCADE;
DROP TABLE IF EXISTS public.tradeo_products CASCADE;

DROP TABLE IF EXISTS public.tvo_views CASCADE;
DROP TABLE IF EXISTS public.tvo_videos CASCADE;

DROP TABLE IF EXISTS public.aishlee_lms_enrollments CASCADE;
DROP TABLE IF EXISTS public.aishlee_lms_lessons CASCADE;
DROP TABLE IF EXISTS public.aishlee_lms_courses CASCADE;
DROP TABLE IF EXISTS public.aishlee_purchases CASCADE;

-- ----------------------------------------------------------------------------
-- 2. ENSURE UNIFIED PROFILES SCHEMA
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS upi_id TEXT,
  ADD COLUMN IF NOT EXISTS digital_id_hash TEXT,
  ADD COLUMN IF NOT EXISTS skills TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS education_level TEXT,
  ADD COLUMN IF NOT EXISTS employment_status TEXT,
  ADD COLUMN IF NOT EXISTS experience_years TEXT,
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS profile_complete BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'agent';

CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ----------------------------------------------------------------------------
-- 3. ENSURE UNIFIED DRIVERS SCHEMA
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  mobile_number TEXT,
  whatsapp_number TEXT,
  driving_license TEXT,
  vehicle_type TEXT DEFAULT 'Car',
  vehicle_registration TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'offline',
  wallet_balance NUMERIC DEFAULT 0,
  pending_commission NUMERIC DEFAULT 0,
  upi_id TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.drivers
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS mobile_number TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_number TEXT,
  ADD COLUMN IF NOT EXISTS driving_license TEXT,
  ADD COLUMN IF NOT EXISTS vehicle_type TEXT DEFAULT 'Car',
  ADD COLUMN IF NOT EXISTS vehicle_registration TEXT,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'offline',
  ADD COLUMN IF NOT EXISTS wallet_balance NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pending_commission NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS upi_id TEXT,
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_drivers_user_id ON public.drivers(user_id);
CREATE INDEX IF NOT EXISTS idx_drivers_status ON public.drivers(status);
CREATE INDEX IF NOT EXISTS idx_drivers_is_verified ON public.drivers(is_verified);

-- ----------------------------------------------------------------------------
-- 4. ENSURE DRIVER APPLICATIONS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.driver_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  whatsapp_number TEXT,
  driving_license TEXT NOT NULL,
  vehicle_type TEXT DEFAULT 'Car',
  vehicle_registration TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 5. ENSURE RIDES & DELIVERIES (DrivO) TABLES & COLUMNS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  pickup_address TEXT,
  pickup_latitude DOUBLE PRECISION,
  pickup_longitude DOUBLE PRECISION,
  dropoff_address TEXT,
  dropoff_latitude DOUBLE PRECISION,
  dropoff_longitude DOUBLE PRECISION,
  status TEXT DEFAULT 'requested',
  fare NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure rider_id exists on rides even if table was created previously
ALTER TABLE public.rides
  ADD COLUMN IF NOT EXISTS rider_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS pickup_address TEXT,
  ADD COLUMN IF NOT EXISTS dropoff_address TEXT,
  ADD COLUMN IF NOT EXISTS fare NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  pickup_address TEXT NOT NULL,
  dropoff_address TEXT NOT NULL,
  package_type TEXT DEFAULT 'Documents',
  estimated_cost NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure sender_id exists on deliveries even if table was created previously
ALTER TABLE public.deliveries
  ADD COLUMN IF NOT EXISTS sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS package_type TEXT DEFAULT 'Documents',
  ADD COLUMN IF NOT EXISTS estimated_cost NUMERIC DEFAULT 0;

-- ----------------------------------------------------------------------------
-- 6. RLS POLICIES & SECURITY
-- ----------------------------------------------------------------------------
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;

-- Clean existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow auth read drivers" ON public.drivers;
DROP POLICY IF EXISTS "Allow driver self update" ON public.drivers;

DROP POLICY IF EXISTS "Allow auth read applications" ON public.driver_applications;
DROP POLICY IF EXISTS "Allow user create application" ON public.driver_applications;

DROP POLICY IF EXISTS "Allow auth read rides" ON public.rides;
DROP POLICY IF EXISTS "Allow user create rides" ON public.rides;

DROP POLICY IF EXISTS "Allow auth read deliveries" ON public.deliveries;
DROP POLICY IF EXISTS "Allow user create deliveries" ON public.deliveries;

-- Re-create clean policies
CREATE POLICY "Allow auth read drivers" ON public.drivers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow driver self update" ON public.drivers FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Allow auth read applications" ON public.driver_applications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow user create application" ON public.driver_applications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow auth read rides" ON public.rides FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow user create rides" ON public.rides FOR INSERT TO authenticated WITH CHECK (rider_id IS NULL OR auth.uid() = rider_id);

CREATE POLICY "Allow auth read deliveries" ON public.deliveries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow user create deliveries" ON public.deliveries FOR INSERT TO authenticated WITH CHECK (sender_id IS NULL OR auth.uid() = sender_id);

-- Grants
GRANT ALL ON public.drivers TO authenticated;
GRANT ALL ON public.driver_applications TO authenticated;
GRANT ALL ON public.rides TO authenticated;
GRANT ALL ON public.deliveries TO authenticated;

-- ============================================================================
-- Migration 049 Completed Successfully
-- ============================================================================
