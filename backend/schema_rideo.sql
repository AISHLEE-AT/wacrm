-- schema_rideo.sql
-- Rideo & DriveO Module Schema for Custom OCI Backend

-- 1. Ride Categories (Pricing Models)
CREATE TABLE IF NOT EXISTS ride_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  capacity INT DEFAULT 1,
  base_fare NUMERIC NOT NULL,
  base_km NUMERIC DEFAULT 1.5,
  per_km_rate NUMERIC NOT NULL,
  per_min_rate NUMERIC DEFAULT 1.0,
  min_fare NUMERIC NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO ride_categories (id, name, description, capacity, base_fare, base_km, per_km_rate, per_min_rate, min_fare)
VALUES
  ('bikeo', 'Bikeo', 'Quick and affordable bike ride', 1, 15, 1.5, 8, 0.5, 25),
  ('autoo', 'Autoo', 'Classic auto rickshaw', 3, 30, 1.5, 14, 1.0, 45),
  ('mini', 'Mini', 'Compact cars for city rides', 4, 50, 2.0, 14, 1.5, 89),
  ('cargo_ape', 'Cargo Ape', 'Mini trucks for goods transport', 1, 60, 2.0, 18, 1.0, 99)
ON CONFLICT (id) DO NOTHING;

-- 2. Drivers
CREATE TABLE IF NOT EXISTS drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT UNIQUE NOT NULL,
  name TEXT,
  vehicle_type TEXT DEFAULT 'bikeo',
  vehicle_registration TEXT,
  driving_license TEXT,
  upi_id TEXT,
  is_verified BOOLEAN DEFAULT false,
  wallet_balance NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'offline', -- 'offline', 'online', 'busy'
  latitude NUMERIC,
  longitude NUMERIC,
  last_location_update TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Rides
CREATE TABLE IF NOT EXISTS rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_phone TEXT NOT NULL,
  driver_id UUID REFERENCES drivers(id),
  service_type TEXT REFERENCES ride_categories(id),
  pickup_address TEXT NOT NULL,
  pickup_latitude NUMERIC NOT NULL,
  pickup_longitude NUMERIC NOT NULL,
  dropoff_address TEXT NOT NULL,
  dropoff_latitude NUMERIC NOT NULL,
  dropoff_longitude NUMERIC NOT NULL,
  distance_km NUMERIC DEFAULT 0,
  estimated_fare NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'requested', -- 'requested', 'accepted', 'arrived', 'started', 'completed', 'cancelled'
  otp_pin TEXT, -- The 4-digit PIN the customer must give the driver to start
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
