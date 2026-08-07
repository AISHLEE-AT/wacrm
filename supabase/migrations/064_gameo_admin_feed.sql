-- Migration 064_gameo_admin_feed.sql
-- Run this in the GameO Supabase Database SQL Editor

CREATE TABLE IF NOT EXISTS public.admin_public_feed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    author_phone TEXT,
    published_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS and create policies
ALTER TABLE public.admin_public_feed ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read the feed
CREATE POLICY "Enable read access for all users" ON public.admin_public_feed
    FOR SELECT USING (true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_public_feed;

-- Create pg_cron job to auto-delete records older than 24 hours
-- Runs every day at 4:00 AM
SELECT cron.schedule(
    'delete_old_admin_feed',
    '0 4 * * *',
    $$DELETE FROM public.admin_public_feed WHERE published_at < NOW() - INTERVAL '24 hours'$$
);
