-- ====================================================================
-- FAGO & WACRM PRODUCTION SUPABASE DATABASE SCHEMA UPDATE SCRIPT
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ====================================================================

-- 1. PROFILES TABLE (User Accounts, Roles, Pincodes & Referrals)
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
  address TEXT,
  pincode TEXT DEFAULT '641001',
  referred_by TEXT DEFAULT '9344532738',
  points INTEGER DEFAULT 0,
  upi_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safely add missing columns to profiles table if it already existed
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS default_module TEXT DEFAULT 'rideo';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_complete BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pincode TEXT DEFAULT '641001';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by TEXT DEFAULT '9344532738';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS upi_id TEXT;


-- 2. DRIVERS TABLE (DriveO Driver Partner Records & Verification)
CREATE TABLE IF NOT EXISTS public.drivers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  driver_name TEXT,
  mobile_number TEXT,
  phone TEXT,
  whatsapp TEXT,
  vehicle_number TEXT,
  vehicle_type TEXT,
  vehicle_category TEXT,
  driving_license TEXT DEFAULT 'PENDING-VERIFICATION',
  upi_id TEXT,
  status TEXT DEFAULT 'online',
  pincode TEXT DEFAULT '641001',
  is_online BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT true,
  verification_status TEXT DEFAULT 'approved',
  pickup_latitude NUMERIC,
  pickup_longitude NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safely add missing columns to drivers table if it already existed
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS driver_name TEXT;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS mobile_number TEXT;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS vehicle_number TEXT;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS vehicle_type TEXT;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS vehicle_category TEXT;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS driving_license TEXT DEFAULT 'PENDING-VERIFICATION';
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS upi_id TEXT;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'online';
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS pincode TEXT DEFAULT '641001';
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT true;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT true;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'approved';
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS pickup_latitude NUMERIC;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS pickup_longitude NUMERIC;


-- 3. DEALS TABLE (DealO 5km Hyperlocal Marketplace)
CREATE TABLE IF NOT EXISTS public.deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  title TEXT,
  price NUMERIC,
  type TEXT DEFAULT 'sell',
  location TEXT,
  pincode TEXT DEFAULT '641001',
  seller_name TEXT,
  seller_phone TEXT,
  upi_id TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safely add missing columns to deals table if it already existed
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS price NUMERIC;
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'sell';
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS pincode TEXT DEFAULT '641001';
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS seller_name TEXT;
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS seller_phone TEXT;
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS upi_id TEXT;
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';


-- 4. RIDES & RIDE_REQUESTS TABLES (RideO Transport Bookings)
CREATE TABLE IF NOT EXISTS public.rides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rider_id TEXT,
  driver_id TEXT,
  phone TEXT,
  pickup_address TEXT,
  dropoff_address TEXT,
  pincode TEXT DEFAULT '641001',
  pickup_latitude NUMERIC,
  pickup_longitude NUMERIC,
  dropoff_latitude NUMERIC,
  dropoff_longitude NUMERIC,
  vehicle_category TEXT,
  fare NUMERIC DEFAULT 100,
  status TEXT DEFAULT 'requested',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.rides ADD COLUMN IF NOT EXISTS rider_id TEXT;
ALTER TABLE public.rides ADD COLUMN IF NOT EXISTS driver_id TEXT;
ALTER TABLE public.rides ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.rides ADD COLUMN IF NOT EXISTS pickup_address TEXT;
ALTER TABLE public.rides ADD COLUMN IF NOT EXISTS dropoff_address TEXT;
ALTER TABLE public.rides ADD COLUMN IF NOT EXISTS pincode TEXT DEFAULT '641001';
ALTER TABLE public.rides ADD COLUMN IF NOT EXISTS vehicle_category TEXT;
ALTER TABLE public.rides ADD COLUMN IF NOT EXISTS fare NUMERIC DEFAULT 100;
ALTER TABLE public.rides ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'requested';

CREATE TABLE IF NOT EXISTS public.ride_requests (
  id TEXT PRIMARY KEY,
  rider_id TEXT,
  rider_phone TEXT,
  pickup_address TEXT,
  dropoff_address TEXT,
  pincode TEXT DEFAULT '641001',
  vehicle_category TEXT,
  estimated_fare NUMERIC,
  status TEXT DEFAULT 'requested',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ride_requests ADD COLUMN IF NOT EXISTS rider_id TEXT;
ALTER TABLE public.ride_requests ADD COLUMN IF NOT EXISTS rider_phone TEXT;
ALTER TABLE public.ride_requests ADD COLUMN IF NOT EXISTS pickup_address TEXT;
ALTER TABLE public.ride_requests ADD COLUMN IF NOT EXISTS dropoff_address TEXT;
ALTER TABLE public.ride_requests ADD COLUMN IF NOT EXISTS pincode TEXT DEFAULT '641001';
ALTER TABLE public.ride_requests ADD COLUMN IF NOT EXISTS vehicle_category TEXT;
ALTER TABLE public.ride_requests ADD COLUMN IF NOT EXISTS estimated_fare NUMERIC;
ALTER TABLE public.ride_requests ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'requested';


-- 5. AREA_ADMINS TABLE (Area Admin & Pincode Territory Management)
CREATE TABLE IF NOT EXISTS public.area_admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  assigned_pincodes TEXT[] DEFAULT ARRAY['641001', '606703'],
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.area_admins ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.area_admins ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.area_admins ADD COLUMN IF NOT EXISTS assigned_pincodes TEXT[] DEFAULT ARRAY['641001', '606703'];
ALTER TABLE public.area_admins ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';


-- 6. CONTACTS TABLE (WhatsApp CRM & Lead Capture)
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  name TEXT,
  phone TEXT,
  email TEXT,
  pincode TEXT DEFAULT '641001',
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS pincode TEXT DEFAULT '641001';
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS tags TEXT[];


-- 7. ENABLE ROW LEVEL SECURITY (RLS) & POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ride_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.area_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Set Permissive Policies for App Operation
DROP POLICY IF EXISTS "Public profiles read" ON public.profiles;
CREATE POLICY "Public profiles read" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users update profiles" ON public.profiles;
CREATE POLICY "Users update profiles" ON public.profiles FOR ALL USING (true);

DROP POLICY IF EXISTS "Public drivers read" ON public.drivers;
CREATE POLICY "Public drivers read" ON public.drivers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public drivers all" ON public.drivers;
CREATE POLICY "Public drivers all" ON public.drivers FOR ALL USING (true);

DROP POLICY IF EXISTS "Public deals all" ON public.deals;
CREATE POLICY "Public deals all" ON public.deals FOR ALL USING (true);

DROP POLICY IF EXISTS "Public rides all" ON public.rides;
CREATE POLICY "Public rides all" ON public.rides FOR ALL USING (true);

DROP POLICY IF EXISTS "Public ride_requests all" ON public.ride_requests;
CREATE POLICY "Public ride_requests all" ON public.ride_requests FOR ALL USING (true);

DROP POLICY IF EXISTS "Public area_admins all" ON public.area_admins;
CREATE POLICY "Public area_admins all" ON public.area_admins FOR ALL USING (true);

DROP POLICY IF EXISTS "Public contacts all" ON public.contacts;
CREATE POLICY "Public contacts all" ON public.contacts FOR ALL USING (true);


-- 8. FAST INDEXES FOR HIGH PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_pincode ON public.profiles(pincode);
CREATE INDEX IF NOT EXISTS idx_drivers_pincode ON public.drivers(pincode);
CREATE INDEX IF NOT EXISTS idx_drivers_user ON public.drivers(user_id);
CREATE INDEX IF NOT EXISTS idx_deals_pincode ON public.deals(pincode);
CREATE INDEX IF NOT EXISTS idx_contacts_pincode ON public.contacts(pincode);
