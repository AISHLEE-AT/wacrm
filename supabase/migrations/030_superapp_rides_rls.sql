-- ============================================================
-- 030_superapp_rides_rls.sql
-- Fixes RLS policies for the Super App Rides flow
-- ============================================================

-- 1. Passengers need to be able to UPDATE their own rides (e.g., to cancel)
DROP POLICY IF EXISTS "Passengers can update own rides" ON rides;
CREATE POLICY "Passengers can update own rides" ON rides FOR UPDATE USING (auth.uid() = passenger_id);

-- 2. Drivers need to be able to view pending rides
DROP POLICY IF EXISTS "Drivers can view pending rides" ON rides;
CREATE POLICY "Drivers can view pending rides" ON rides FOR SELECT USING (
  status = 'pending' 
  AND EXISTS (SELECT 1 FROM drivers WHERE user_id = auth.uid())
);

-- 3. Drivers need to be able to claim pending rides
-- (They update a ride where driver_id is NULL)
DROP POLICY IF EXISTS "Drivers can claim pending rides" ON rides;
CREATE POLICY "Drivers can claim pending rides" ON rides FOR UPDATE USING (
  status = 'pending' 
  AND driver_id IS NULL 
  AND EXISTS (SELECT 1 FROM drivers WHERE user_id = auth.uid())
);

-- 4. Drivers need to be able to view rides assigned to them
DROP POLICY IF EXISTS "Drivers can view assigned rides" ON rides;
CREATE POLICY "Drivers can view assigned rides" ON rides FOR SELECT USING (
  EXISTS (SELECT 1 FROM drivers WHERE drivers.id = rides.driver_id AND drivers.user_id = auth.uid())
);
