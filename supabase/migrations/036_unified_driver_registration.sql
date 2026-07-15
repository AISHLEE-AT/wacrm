-- ============================================================
-- 036_unified_driver_registration.sql
-- Unifies driver schema for both Flutter mobile + Next.js web
-- Single source of truth: Supabase
-- ============================================================

-- 1. Driver profile fields (matching Flutter registration form)
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS mobile_number TEXT;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS driving_license TEXT;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS insurance_details TEXT;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS upi_id TEXT;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- 2. Firebase UID for mobile auth bridge (Flutter uses Firebase Phone Auth)
--    Already added in 034 but ensure it exists
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS firebase_uid TEXT;

-- 3. FCM token for push notifications (both web + mobile)
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS fcm_token TEXT;

-- 4. Ensure drivers can be created without account_id (B2C mobile drivers)
--    Already done in 034 but be safe
ALTER TABLE drivers ALTER COLUMN account_id DROP NOT NULL;
ALTER TABLE drivers ALTER COLUMN user_id DROP NOT NULL;

-- 5. RLS: Allow authenticated users to register as driver
DROP POLICY IF EXISTS "Authenticated users can register as driver" ON drivers;
CREATE POLICY "Authenticated users can register as driver" ON drivers 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR firebase_uid IS NOT NULL);

-- 6. RLS: Drivers can update their own record (status, location, fcm_token)
DROP POLICY IF EXISTS "Drivers can update own record by uid" ON drivers;
CREATE POLICY "Drivers can update own record by uid" ON drivers 
  FOR UPDATE USING (auth.uid() = user_id);

-- 7. RLS: Drivers with firebase_uid can update their record
DROP POLICY IF EXISTS "Firebase drivers can update own record" ON drivers;
CREATE POLICY "Firebase drivers can update own record" ON drivers 
  FOR UPDATE USING (firebase_uid IS NOT NULL AND firebase_uid = current_setting('request.jwt.claims', true)::json->>'firebase_uid');

-- 8. Add passenger phone fields to rides for mobile riders
ALTER TABLE rides ADD COLUMN IF NOT EXISTS passenger_phone TEXT;
ALTER TABLE rides ADD COLUMN IF NOT EXISTS passenger_name TEXT;
