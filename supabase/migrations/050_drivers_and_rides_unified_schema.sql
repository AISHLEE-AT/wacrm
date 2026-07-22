-- Migration 050: Ensure all columns for Drivers, Vehicle Categories, Rides & Live WhatsApp GPS Pinning exist cleanly
-- Safe & idempotent script: can be executed repeatedly in Supabase SQL Editor

-- 1. Ensure drivers table has all onboarding, verification, and live GPS location columns
ALTER TABLE public.drivers 
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS mobile_number TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_number TEXT,
  ADD COLUMN IF NOT EXISTS vehicle_type TEXT DEFAULT 'bike',
  ADD COLUMN IF NOT EXISTS vehicle_registration TEXT,
  ADD COLUMN IF NOT EXISTS vehicle_number TEXT,
  ADD COLUMN IF NOT EXISTS driving_license TEXT,
  ADD COLUMN IF NOT EXISTS upi_id TEXT,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS wallet_balance NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pending_commission NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'online',
  ADD COLUMN IF NOT EXISTS pickup_latitude NUMERIC,
  ADD COLUMN IF NOT EXISTS pickup_longitude NUMERIC,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Ensure rides table has all transport & fare calculation columns
ALTER TABLE public.rides
  ADD COLUMN IF NOT EXISTS rider_id UUID,
  ADD COLUMN IF NOT EXISTS passenger_id UUID,
  ADD COLUMN IF NOT EXISTS driver_id UUID,
  ADD COLUMN IF NOT EXISTS pickup_latitude NUMERIC,
  ADD COLUMN IF NOT EXISTS pickup_longitude NUMERIC,
  ADD COLUMN IF NOT EXISTS pickup_address TEXT,
  ADD COLUMN IF NOT EXISTS dropoff_latitude NUMERIC,
  ADD COLUMN IF NOT EXISTS dropoff_longitude NUMERIC,
  ADD COLUMN IF NOT EXISTS dropoff_address TEXT,
  ADD COLUMN IF NOT EXISTS fare NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS estimated_price NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS distance_km NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'requested',
  ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS flag_reason TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Sync vehicle_number and vehicle_registration if one is filled
UPDATE public.drivers SET vehicle_registration = vehicle_number WHERE vehicle_registration IS NULL AND vehicle_number IS NOT NULL;
UPDATE public.drivers SET vehicle_number = vehicle_registration WHERE vehicle_number IS NULL AND vehicle_registration IS NOT NULL;

-- 4. Enable RLS and public access for driver registration & rides
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public select drivers" ON public.drivers;
CREATE POLICY "Public select drivers" ON public.drivers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert/update drivers" ON public.drivers;
CREATE POLICY "Public insert/update drivers" ON public.drivers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public select rides" ON public.rides;
CREATE POLICY "Public select rides" ON public.rides FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert/update rides" ON public.rides;
CREATE POLICY "Public insert/update rides" ON public.rides FOR ALL USING (true) WITH CHECK (true);
