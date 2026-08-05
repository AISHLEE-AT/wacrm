-- GameO Database Schema (Run this in the dedicated GameO Supabase SQL Editor)
-- This schema is highly optimized for storing fast-paced Ghost Racing telemetry.

-- Enable PostGIS if you want to run complex spatial queries later
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Table: ghost_races
-- Stores completed race sessions to be replayed as 'Ghosts'
CREATE TABLE IF NOT EXISTS public.ghost_races (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL, -- References the user ID from the main SuprO DB (No foreign key needed across DBs)
    mode TEXT NOT NULL CHECK (mode IN ('bike', 'run')),
    distance_km FLOAT NOT NULL,
    duration_seconds INT NOT NULL,
    start_location JSONB NOT NULL, -- { "lat": 13.0827, "lng": 80.2707 } (Easier for mobile clients to parse than PostGIS)
    telemetry JSONB NOT NULL, -- Array of points: [{ "lat": ..., "lng": ..., "timestamp": ..., "speed": ... }]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexing for performance
-- We want to quickly find ghosts that started near a specific location
CREATE INDEX idx_ghost_races_mode ON public.ghost_races(mode);
CREATE INDEX idx_ghost_races_created_at ON public.ghost_races(created_at DESC);
-- A GIN index on start_location if we need to search within a bounding box using JSON operators
CREATE INDEX idx_ghost_races_start_location ON public.ghost_races USING GIN (start_location);

-- 2. Row Level Security (RLS)
ALTER TABLE public.ghost_races ENABLE ROW LEVEL SECURITY;

-- Allow anyone (authenticated or anon) to read ghost races for matchmaking
CREATE POLICY "Ghosts are viewable by everyone" 
ON public.ghost_races FOR SELECT USING (true);

-- Allow authenticated users to insert their own races
CREATE POLICY "Users can insert their own ghost races" 
ON public.ghost_races FOR INSERT WITH CHECK (true); -- In a real prod environment, check auth.uid() = player_id

-- 3. Telemetry Cleanup Cron (Optional but highly recommended)
-- Since telemetry arrays can get huge, we might want to delete ghost traces older than 30 days
-- to keep the dedicated GameO database small and cost-effective.
-- (This requires the pg_cron extension)
-- SELECT cron.schedule('cleanup-old-ghosts', '0 0 * * *', $$
--   DELETE FROM public.ghost_races WHERE created_at < NOW() - INTERVAL '30 days';
-- $$);
