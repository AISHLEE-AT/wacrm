-- ====================================================================
-- FAGO & WACRM SUPABASE DATABASE SCHEMA UPDATE SCRIPT
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ====================================================================

-- 1. Ensure `profiles` table has all required columns (UPI ID, Role, Location)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  whatsapp TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  default_module TEXT DEFAULT 'rideo',
  profile_complete BOOLEAN DEFAULT false,
  location TEXT,
  upi_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add any missing columns safely
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS default_module TEXT DEFAULT 'rideo';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_complete BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS upi_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whatsapp TEXT;

-- 2. Ensure `contacts` table exists (For Lead Capture & WhatsApp CRM)
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  phone TEXT NOT NULL,
  name TEXT,
  city TEXT,
  category TEXT,
  role TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS category TEXT;

-- 3. Ensure `drivers` table exists (DriveO Verification)
CREATE TABLE IF NOT EXISTS public.drivers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  mobile_number TEXT,
  vehicle_number TEXT,
  vehicle_type TEXT,
  vehicle_category TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS vehicle_category TEXT;

-- 4. Ensure `ride_requests` table exists (RideO & Transport Bookings)
CREATE TABLE IF NOT EXISTS public.ride_requests (
  id TEXT PRIMARY KEY,
  rider_id TEXT,
  rider_phone TEXT,
  pickup_address TEXT,
  dropoff_address TEXT,
  vehicle_category TEXT,
  estimated_fare NUMERIC,
  status TEXT DEFAULT 'requested',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Optional `mandi_prices` cache table
CREATE TABLE IF NOT EXISTS public.mandi_prices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mandi_name TEXT NOT NULL,
  district TEXT,
  commodity TEXT NOT NULL,
  modal_price NUMERIC,
  unit TEXT DEFAULT 'kg',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Enable Row Level Security (RLS) & Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ride_requests ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read/update their own profile
DROP POLICY IF EXISTS "Public profiles read" ON public.profiles;
CREATE POLICY "Public profiles read" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Allow authenticated and guest users to insert into contacts & ride_requests
DROP POLICY IF EXISTS "Anyone can insert contacts" ON public.contacts;
CREATE POLICY "Anyone can insert contacts" ON public.contacts FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can read contacts" ON public.contacts;
CREATE POLICY "Anyone can read contacts" ON public.contacts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert ride requests" ON public.ride_requests;
CREATE POLICY "Anyone can insert ride requests" ON public.ride_requests FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can read ride requests" ON public.ride_requests;
CREATE POLICY "Anyone can read ride requests" ON public.ride_requests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can read drivers" ON public.drivers;
CREATE POLICY "Anyone can read drivers" ON public.drivers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Drivers can insert profile" ON public.drivers;
CREATE POLICY "Drivers can insert profile" ON public.drivers FOR INSERT WITH CHECK (true);

-- Create fast indexes for phone numbers & roles
CREATE INDEX IF NOT EXISTS idx_contacts_phone ON public.contacts(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_drivers_user ON public.drivers(user_id);
