-- ============================================================
-- 037_ratings_and_phones.sql
-- Adds rating columns to the rides table
-- ============================================================

ALTER TABLE rides ADD COLUMN IF NOT EXISTS driver_rating INTEGER CHECK (driver_rating >= 1 AND driver_rating <= 5);
ALTER TABLE rides ADD COLUMN IF NOT EXISTS rider_rating INTEGER CHECK (rider_rating >= 1 AND rider_rating <= 5);
