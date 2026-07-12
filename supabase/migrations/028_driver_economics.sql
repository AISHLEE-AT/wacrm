-- ============================================================
-- 028_driver_economics.sql — Optimizations for Ride-Hailing
-- Adds wallet balances, scheduled rides, stops, and anti-haggling flags
-- ============================================================

-- Add economic and trust fields to drivers
ALTER TABLE drivers
  ADD COLUMN IF NOT EXISTS wallet_balance NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS commission_rate NUMERIC NOT NULL DEFAULT 5.0; -- 5% flat commission by default to keep drivers happy

-- Add advanced features and reporting flags to rides
ALTER TABLE rides
  ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS stops JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS flag_reason TEXT;

-- Create an index to quickly find flagged rides for the dispatch dashboard
CREATE INDEX IF NOT EXISTS idx_rides_flagged ON rides(account_id) WHERE is_flagged = true;
