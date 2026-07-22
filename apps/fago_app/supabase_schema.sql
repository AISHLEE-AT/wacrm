-- ==============================================================================
-- WACRM & FAGO (RideO + DriveO + WhatsApp CRM) Supabase Database Migration SQL
-- Execute this SQL in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Create Contacts Table for WhatsApp CRM Lead & Contact Management
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_null(),
    name TEXT NOT NULL DEFAULT 'Rider Lead',
    phone TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'Rider',
    city TEXT DEFAULT 'Unknown',
    last_vehicle_category TEXT DEFAULT 'General',
    source TEXT DEFAULT 'RideO Mobile App',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index on phone for ultra-fast CRM contact search & upsert
CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_phone ON public.contacts (phone);


-- 2. Create Ride Requests Table for Realtime Ride Matching (RideO & DriveO)
CREATE TABLE IF NOT EXISTS public.ride_requests (
    id TEXT PRIMARY KEY,
    rider_id TEXT NOT NULL,
    rider_phone TEXT NOT NULL,
    pickup_location JSONB NOT NULL,
    pickup_address TEXT NOT NULL,
    dropoff_location JSONB NOT NULL,
    dropoff_address TEXT NOT NULL,
    vehicle_category TEXT NOT NULL DEFAULT 'Auto',
    estimated_fare NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'requested', -- requested, accepted, inProgress, completed, cancelled
    driver_id TEXT,
    driver_phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index on status for instant Driver Radar query filtering
CREATE INDEX IF NOT EXISTS idx_ride_requests_status ON public.ride_requests (status);


-- 3. Enable Supabase Realtime Streaming Replication for Live Driver Radar
ALTER PUBLICATION supabase_realtime ADD TABLE public.ride_requests;


-- 4. Enable Row Level Security (RLS) & Public Read/Write Policies
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ride_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read/write on contacts" 
ON public.contacts FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read/write on ride_requests" 
ON public.ride_requests FOR ALL USING (true) WITH CHECK (true);
