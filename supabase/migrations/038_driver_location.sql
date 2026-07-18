-- ============================================================
-- 038_driver_location.sql
-- Adds location tracking columns to drivers table for the Rider app map
-- ============================================================

ALTER TABLE drivers ADD COLUMN IF NOT EXISTS lat FLOAT;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS lng FLOAT;
