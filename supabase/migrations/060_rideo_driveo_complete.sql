-- Migration 060: Rideo & Driveo Complete Schema Update
-- Safe and idempotent operations

-- 1. Create ride_categories table
CREATE TABLE IF NOT EXISTS public.ride_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  capacity INT DEFAULT 1,
  base_fare NUMERIC NOT NULL,
  base_km NUMERIC DEFAULT 1.5,
  per_km_rate NUMERIC NOT NULL,
  per_min_rate NUMERIC DEFAULT 1.0,
  min_fare NUMERIC NOT NULL,
  night_surcharge NUMERIC DEFAULT 0,
  peak_multiplier NUMERIC DEFAULT 1.0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed ride_categories
INSERT INTO public.ride_categories (id, name, description, icon, capacity, base_fare, base_km, per_km_rate, per_min_rate, min_fare, night_surcharge, peak_multiplier)
VALUES
  ('bikeo', 'Bikeo', 'Quick and affordable bike ride', '🏍️', 1, 15, 1.5, 8, 0.5, 25, 5, 1.0),
  ('autoo', 'Autoo', 'Classic auto rickshaw', '🛺', 3, 30, 1.5, 14, 1.0, 45, 10, 1.0),
  ('mini', 'Mini', 'Compact cars for city rides', '🚗', 4, 50, 2.0, 14, 1.5, 89, 15, 1.0),
  ('sedan', 'Sedan', 'Comfortable sedans', '🚙', 4, 70, 2.0, 16, 2.0, 129, 20, 1.0),
  ('suv', 'SUV', 'Spacious SUVs for family', '🚐', 6, 120, 2.0, 22, 2.5, 199, 30, 1.0),
  ('cargo_ape', 'Cargo Ape', 'Mini trucks for goods transport', '🛻', 1, 60, 2.0, 18, 1.0, 99, 15, 1.0)
ON CONFLICT (id) DO UPDATE SET
  base_fare = EXCLUDED.base_fare,
  base_km = EXCLUDED.base_km,
  per_km_rate = EXCLUDED.per_km_rate,
  per_min_rate = EXCLUDED.per_min_rate,
  min_fare = EXCLUDED.min_fare,
  night_surcharge = EXCLUDED.night_surcharge;

-- 2. Create rental_packages table
CREATE TABLE IF NOT EXISTS public.rental_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_name TEXT NOT NULL,
  hours INT NOT NULL,
  included_km INT NOT NULL,
  vehicle_category TEXT NOT NULL REFERENCES public.ride_categories(id),
  base_price NUMERIC NOT NULL,
  extra_km_rate NUMERIC NOT NULL,
  extra_hr_rate NUMERIC NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add unique constraint for idempotent seeding
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_package_vehicle'
  ) THEN
    ALTER TABLE public.rental_packages ADD CONSTRAINT unique_package_vehicle UNIQUE (package_name, vehicle_category);
  END IF;
END $$;

-- Seed rental_packages
INSERT INTO public.rental_packages (package_name, hours, included_km, vehicle_category, base_price, extra_km_rate, extra_hr_rate)
VALUES
  -- Auto
  ('1h/10km', 1, 10, 'autoo', 149, 14, 60),
  ('2h/20km', 2, 20, 'autoo', 249, 14, 60),
  ('4h/40km', 4, 40, 'autoo', 449, 14, 60),
  ('8h/80km', 8, 80, 'autoo', 799, 14, 60),
  ('12h/120km', 12, 120, 'autoo', 1099, 14, 60),
  -- Mini
  ('1h/10km', 1, 10, 'mini', 249, 14, 100),
  ('2h/20km', 2, 20, 'mini', 399, 14, 100),
  ('4h/40km', 4, 40, 'mini', 699, 14, 100),
  ('8h/80km', 8, 80, 'mini', 1199, 14, 100),
  ('12h/120km', 12, 120, 'mini', 1599, 14, 100),
  -- Sedan
  ('1h/10km', 1, 10, 'sedan', 349, 16, 120),
  ('2h/20km', 2, 20, 'sedan', 549, 16, 120),
  ('4h/40km', 4, 40, 'sedan', 999, 16, 120),
  ('8h/80km', 8, 80, 'sedan', 1699, 16, 120),
  ('12h/120km', 12, 120, 'sedan', 2299, 16, 120),
  -- SUV
  ('1h/10km', 1, 10, 'suv', 549, 22, 150),
  ('2h/20km', 2, 20, 'suv', 899, 22, 150),
  ('4h/40km', 4, 40, 'suv', 1599, 22, 150),
  ('8h/80km', 8, 80, 'suv', 2799, 22, 150),
  ('12h/120km', 12, 120, 'suv', 3799, 22, 150)
ON CONFLICT (package_name, vehicle_category) DO NOTHING;

-- 3. Enhance existing rides table
ALTER TABLE public.rides
  ADD COLUMN IF NOT EXISTS service_type TEXT DEFAULT 'daily',
  ADD COLUMN IF NOT EXISTS vehicle_category TEXT DEFAULT 'autoo',
  ADD COLUMN IF NOT EXISTS rental_package_id UUID,
  ADD COLUMN IF NOT EXISTS otp_code TEXT,
  ADD COLUMN IF NOT EXISTS payment_mode TEXT DEFAULT 'upi',
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS base_fare NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS distance_fare NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS time_fare NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS platform_fee NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_fare NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS driver_earnings NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS subscription_charge NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
  ADD COLUMN IF NOT EXISTS cancelled_by TEXT,
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS review TEXT,
  ADD COLUMN IF NOT EXISTS driver_upi_id TEXT,
  ADD COLUMN IF NOT EXISTS is_pink_ride BOOLEAN DEFAULT false;

-- 4. Create driver_subscriptions table
CREATE TABLE IF NOT EXISTS public.driver_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL,
  ride_id UUID,
  amount NUMERIC NOT NULL DEFAULT 5.0,
  admin_upi_id TEXT DEFAULT '6381029380@hdfcbank',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create ride_safety_alerts table
CREATE TABLE IF NOT EXISTS public.ride_safety_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL,
  alert_type TEXT NOT NULL,
  reported_by TEXT NOT NULL,
  description TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Enhance drivers table
ALTER TABLE public.drivers
  ADD COLUMN IF NOT EXISTS upi_id TEXT,
  ADD COLUMN IF NOT EXISTS daily_subscription_paid BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS acceptance_rate NUMERIC DEFAULT 100,
  ADD COLUMN IF NOT EXISTS cancellation_rate NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_pink_driver BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS documents_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS dl_number TEXT,
  ADD COLUMN IF NOT EXISTS rc_number TEXT,
  ADD COLUMN IF NOT EXISTS insurance_expiry DATE,
  ADD COLUMN IF NOT EXISTS aadhar_verified BOOLEAN DEFAULT false;

-- 7. PostGIS function for nearby drivers by category
CREATE OR REPLACE FUNCTION get_nearby_drivers_v2(
  p_lat FLOAT,
  p_lng FLOAT,
  p_radius_km FLOAT DEFAULT 3.0,
  p_vehicle_category TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  mobile_number TEXT,
  whatsapp_number TEXT,
  vehicle_type TEXT,
  vehicle_number TEXT,
  vehicle_model TEXT,
  upi_id TEXT,
  rating NUMERIC,
  total_trips INT,
  gender TEXT,
  is_pink_driver BOOLEAN,
  eta_minutes INT,
  distance_km FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.name,
    d.mobile_number,
    d.whatsapp_number,
    d.vehicle_type,
    COALESCE(d.vehicle_number, d.vehicle_registration) as vehicle_number,
    d.vehicle_model,
    d.upi_id,
    COALESCE(d.rating, 4.5) as rating,
    COALESCE(d.total_trips, 0) as total_trips,
    COALESCE(d.gender, 'male') as gender,
    COALESCE(d.is_pink_driver, false) as is_pink_driver,
    COALESCE(d.eta_minutes, GREATEST(2, ROUND(
      extensions.ST_Distance(
        extensions.ST_SetSRID(extensions.ST_MakePoint(COALESCE(d.pickup_longitude, d.lng, d.current_lng), COALESCE(d.pickup_latitude, d.lat, d.current_lat)), 4326)::geography,
        extensions.ST_SetSRID(extensions.ST_MakePoint(p_lng, p_lat), 4326)::geography
      ) / 500.0
    )::INT)) as eta_minutes,
    ROUND((
      extensions.ST_Distance(
        extensions.ST_SetSRID(extensions.ST_MakePoint(COALESCE(d.pickup_longitude, d.lng, d.current_lng), COALESCE(d.pickup_latitude, d.lat, d.current_lat)), 4326)::geography,
        extensions.ST_SetSRID(extensions.ST_MakePoint(p_lng, p_lat), 4326)::geography
      ) / 1000.0
    )::NUMERIC, 1)::FLOAT as distance_km
  FROM public.drivers d
  WHERE 
    d.status = 'online'
    AND COALESCE(d.is_blocked, false) = false
    AND COALESCE(d.is_verified, true) = true
    AND (COALESCE(d.pickup_latitude, d.lat, d.current_lat) IS NOT NULL)
    AND (COALESCE(d.pickup_longitude, d.lng, d.current_lng) IS NOT NULL)
    AND (
      p_vehicle_category IS NULL 
      OR LOWER(d.vehicle_type) = LOWER(p_vehicle_category)
      OR (p_vehicle_category = 'bikeo' AND LOWER(d.vehicle_type) = 'bike')
      OR (p_vehicle_category = 'autoo' AND LOWER(d.vehicle_type) = 'auto')
      OR (p_vehicle_category = 'mini' AND LOWER(d.vehicle_type) IN ('mini', 'hatchback'))
      OR (p_vehicle_category = 'sedan' AND LOWER(d.vehicle_type) IN ('sedan', 'cab'))
      OR (p_vehicle_category = 'suv' AND LOWER(d.vehicle_type) IN ('suv', 'innova'))
      OR (p_vehicle_category = 'cargo_ape' AND LOWER(d.vehicle_type) IN ('cargo', 'minivan', 'tractor'))
    )
    AND extensions.ST_DWithin(
      extensions.ST_SetSRID(extensions.ST_MakePoint(COALESCE(d.pickup_longitude, d.lng, d.current_lng), COALESCE(d.pickup_latitude, d.lat, d.current_lat)), 4326)::geography,
      extensions.ST_SetSRID(extensions.ST_MakePoint(p_lng, p_lat), 4326)::geography,
      p_radius_km * 1000
    )
  ORDER BY distance_km ASC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. RLS Policies
ALTER TABLE public.ride_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read ride_categories" ON public.ride_categories;
CREATE POLICY "Public read ride_categories" ON public.ride_categories FOR SELECT USING (true);

ALTER TABLE public.rental_packages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read rental_packages" ON public.rental_packages;
CREATE POLICY "Public read rental_packages" ON public.rental_packages FOR SELECT USING (true);

ALTER TABLE public.driver_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access driver_subscriptions" ON public.driver_subscriptions;
CREATE POLICY "Public access driver_subscriptions" ON public.driver_subscriptions FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.ride_safety_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access ride_safety_alerts" ON public.ride_safety_alerts;
CREATE POLICY "Public access ride_safety_alerts" ON public.ride_safety_alerts FOR ALL USING (true) WITH CHECK (true);

-- 9. Enable Realtime
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'ride_categories') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.ride_categories;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'ride_safety_alerts') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.ride_safety_alerts;
  END IF;
END $$;
