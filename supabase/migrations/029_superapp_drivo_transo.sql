-- ============================================================
-- 029_superapp_drivo_transo.sql 
-- Adds Driver Applications and updates rides for B2C passenger flow
-- ============================================================

-- 1. Create driver_applications table
CREATE TABLE IF NOT EXISTS driver_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('bike', 'car', 'cargo')),
  registration_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE driver_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own application" ON driver_applications;
DROP POLICY IF EXISTS "Users can insert own application" ON driver_applications;
DROP POLICY IF EXISTS "Users can update own application" ON driver_applications;

CREATE POLICY "Users can view own application" ON driver_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own application" ON driver_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own application" ON driver_applications FOR UPDATE USING (auth.uid() = user_id);

-- 2. Modify rides table to support B2C passenger bookings (no contact_id or account_id needed)
ALTER TABLE rides ALTER COLUMN account_id DROP NOT NULL;
ALTER TABLE rides ALTER COLUMN contact_id DROP NOT NULL;
ALTER TABLE rides ADD COLUMN IF NOT EXISTS passenger_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update RLS for rides so passengers can view and create their own rides
DROP POLICY IF EXISTS "Passengers can view own rides" ON rides;
DROP POLICY IF EXISTS "Passengers can insert own rides" ON rides;

CREATE POLICY "Passengers can view own rides" ON rides FOR SELECT USING (auth.uid() = passenger_id);
CREATE POLICY "Passengers can insert own rides" ON rides FOR INSERT WITH CHECK (auth.uid() = passenger_id);

-- Ensure drivers can be queried by anyone (so passengers can see active drivers if needed)
DROP POLICY IF EXISTS "Anyone can view drivers" ON drivers;
CREATE POLICY "Anyone can view drivers" ON drivers FOR SELECT USING (true);
