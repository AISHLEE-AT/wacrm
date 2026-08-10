-- Migration: Complete Ride Flow Enhancements
-- Adds missing tables and columns for production ride-hailing

-- 1. ride_dispatches table - track which drivers received which ride offers
CREATE TABLE IF NOT EXISTS ride_dispatches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
  offered_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ,
  response TEXT CHECK (response IN ('accepted', 'declined', 'timed_out')),
  distance_km NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. driver_location_logs table - GPS history for route replay
CREATE TABLE IF NOT EXISTS driver_location_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  speed NUMERIC,
  heading NUMERIC,
  recorded_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_driver_loc_logs_driver_time 
  ON driver_location_logs(driver_id, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_ride_dispatches_ride 
  ON ride_dispatches(ride_id);

CREATE INDEX IF NOT EXISTS idx_ride_dispatches_driver 
  ON ride_dispatches(driver_id, offered_at DESC);

-- 3. Add missing columns to rides table (safe - IF NOT EXISTS pattern via DO blocks)
DO $$ BEGIN
  BEGIN ALTER TABLE rides ADD COLUMN cancellation_reason TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
  BEGIN ALTER TABLE rides ADD COLUMN cancelled_by TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
  BEGIN ALTER TABLE rides ADD COLUMN driver_rating INTEGER CHECK (driver_rating BETWEEN 1 AND 5); EXCEPTION WHEN duplicate_column THEN NULL; END;
  BEGIN ALTER TABLE rides ADD COLUMN rider_rating INTEGER CHECK (rider_rating BETWEEN 1 AND 5); EXCEPTION WHEN duplicate_column THEN NULL; END;
  BEGIN ALTER TABLE rides ADD COLUMN review TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
  BEGIN ALTER TABLE rides ADD COLUMN accepted_at TIMESTAMPTZ; EXCEPTION WHEN duplicate_column THEN NULL; END;
END $$;

-- 4. Add to realtime publication
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE ride_dispatches;
  ALTER PUBLICATION supabase_realtime ADD TABLE driver_location_logs;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 5. RLS policies for new tables
ALTER TABLE ride_dispatches ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_location_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for ride_dispatches" ON ride_dispatches FOR ALL USING (true);
CREATE POLICY "Allow all for driver_location_logs" ON driver_location_logs FOR ALL USING (true);
