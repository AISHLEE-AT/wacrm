-- ============================================================
-- SuprO: Daily News Broadcast System
-- Admin loads news once at 6 AM → All users read from here
-- ============================================================

-- Create the daily_news table
create table if not exists public.daily_news (
  id          uuid        default gen_random_uuid() primary key,
  module      text        not null,        -- agro | teacho | dealo | jobo | driveo | testo | general
  title       text        not null,
  description text,
  image_url   text,
  source_name text        not null,
  link        text,
  published_date text,
  loaded_date date        not null default current_date,
  data_type   text        default 'rss',  -- 'rss' | 'govt_api' | 'mandi' | 'commodity_price'
  extra_data  jsonb,                       -- For structured govt data (prices, etc.)
  created_at  timestamptz default now()
);

-- Fast query index: module + date
create index if not exists idx_daily_news_module_date
  on public.daily_news (module, loaded_date);

-- Fast query index: date only (for admin "load all today")
create index if not exists idx_daily_news_loaded_date
  on public.daily_news (loaded_date);

-- Enable RLS
alter table public.daily_news enable row level security;

-- All authenticated users can SELECT today's news
create policy "Authenticated users can read daily news"
  on public.daily_news for select
  to authenticated
  using (true);

-- Only service_role (Edge Functions, cron) can INSERT / UPDATE / DELETE
create policy "Service role manages daily news"
  on public.daily_news for all
  to service_role
  using (true)
  with check (true);

-- ============================================================
-- pg_cron: Auto-trigger at 6:00 AM IST = 00:30 UTC daily
-- Run this AFTER enabling the pg_cron extension in Supabase
-- Dashboard → Database → Extensions → Search "pg_cron" → Enable
-- ============================================================

-- Uncomment after enabling pg_cron + pg_net extensions:
-- select cron.schedule(
--   'supro-daily-news-6am-ist',
--   '30 0 * * *',
--   $$
--   select net.http_post(
--     url    := current_setting('app.supabase_url') || '/functions/v1/fetch-daily-news',
--     headers := jsonb_build_object(
--       'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
--       'Content-Type', 'application/json'
--     ),
--     body   := '{}'::jsonb
--   );
--   $$
-- );
