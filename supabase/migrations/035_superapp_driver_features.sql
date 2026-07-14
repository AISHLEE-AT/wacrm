-- ============================================================
-- 035_superapp_driver_features.sql
-- Upgrades the drivers and rides tables for Super App features
-- ============================================================

-- Ensure pending_commission exists on drivers
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS pending_commission NUMERIC DEFAULT 0;

-- Ensure is_blocked exists on drivers
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;

-- Ensure wallet_balance exists on drivers
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS wallet_balance NUMERIC DEFAULT 0;

-- Ensure vehicle details exist on drivers (for auto-approval)
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS vehicle_type TEXT DEFAULT 'bike';
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS vehicle_registration TEXT;

-- Ensure estimated_price and distance exists on rides
ALTER TABLE rides ADD COLUMN IF NOT EXISTS estimated_price NUMERIC DEFAULT 0;
ALTER TABLE rides ADD COLUMN IF NOT EXISTS distance_km NUMERIC DEFAULT 0;
