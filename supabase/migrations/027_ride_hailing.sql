-- ============================================================
-- 027_ride_hailing.sql — Schema for ride-hailing/rental features
-- ============================================================

-- ============================================================
-- VEHICLES
-- ============================================================
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('bike', 'car', 'cargo')),
  base_fare NUMERIC NOT NULL DEFAULT 0,
  per_km_rate NUMERIC NOT NULL DEFAULT 0,
  per_minute_rate NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicles_account ON vehicles(account_id);

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Account members can view vehicles" ON vehicles;
DROP POLICY IF EXISTS "Account admins can manage vehicles" ON vehicles;
CREATE POLICY "Account members can view vehicles" ON vehicles FOR SELECT USING (is_account_member(account_id, 'viewer'));
CREATE POLICY "Account admins can manage vehicles" ON vehicles FOR ALL USING (is_account_member(account_id, 'admin'));

-- ============================================================
-- DRIVERS
-- ============================================================
CREATE TABLE IF NOT EXISTS drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('offline', 'online', 'busy')),
  current_lat NUMERIC,
  current_lng NUMERIC,
  last_location_update TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_drivers_account ON drivers(account_id);

ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Account members can view drivers" ON drivers;
DROP POLICY IF EXISTS "Drivers can update own location and status" ON drivers;
DROP POLICY IF EXISTS "Account admins can manage drivers" ON drivers;
CREATE POLICY "Account members can view drivers" ON drivers FOR SELECT USING (is_account_member(account_id, 'viewer'));
CREATE POLICY "Drivers can update own location and status" ON drivers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Account admins can manage drivers" ON drivers FOR ALL USING (is_account_member(account_id, 'admin'));

-- ============================================================
-- RIDES
-- ============================================================
CREATE TABLE IF NOT EXISTS rides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'en_route', 'completed', 'cancelled')),
  pickup_lat NUMERIC NOT NULL,
  pickup_lng NUMERIC NOT NULL,
  pickup_address TEXT,
  dropoff_lat NUMERIC NOT NULL,
  dropoff_lng NUMERIC NOT NULL,
  dropoff_address TEXT,
  distance_km NUMERIC,
  estimated_duration_mins NUMERIC,
  estimated_price NUMERIC,
  final_price NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rides_account ON rides(account_id);
CREATE INDEX IF NOT EXISTS idx_rides_contact ON rides(contact_id);
CREATE INDEX IF NOT EXISTS idx_rides_driver ON rides(driver_id);

ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Account members can view rides" ON rides;
DROP POLICY IF EXISTS "Account agents can insert rides" ON rides;
DROP POLICY IF EXISTS "Assigned driver or agents can update rides" ON rides;
CREATE POLICY "Account members can view rides" ON rides FOR SELECT USING (is_account_member(account_id, 'viewer'));
CREATE POLICY "Account agents can insert rides" ON rides FOR INSERT WITH CHECK (is_account_member(account_id, 'agent'));
CREATE POLICY "Assigned driver or agents can update rides" ON rides FOR UPDATE USING (
  is_account_member(account_id, 'agent') OR 
  (EXISTS (SELECT 1 FROM drivers WHERE drivers.id = rides.driver_id AND drivers.user_id = auth.uid()))
);

-- Realtime publications for dashboard and drivers tracking rides/locations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'rides'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE rides;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'drivers'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE drivers;
  END IF;
END $$;
