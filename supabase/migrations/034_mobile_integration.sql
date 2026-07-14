-- ============================================================
-- 034_mobile_integration.sql
-- Enables rides and drivers from mobile apps (Firebase Auth)
-- ============================================================

-- 1. Modify rides to support mobile riders
ALTER TABLE rides ADD COLUMN IF NOT EXISTS passenger_firebase_uid TEXT;

-- 2. Modify drivers to support mobile drivers
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS firebase_uid TEXT UNIQUE;
ALTER TABLE drivers ALTER COLUMN account_id DROP NOT NULL;
ALTER TABLE drivers ALTER COLUMN user_id DROP NOT NULL;
