-- ==============================================================================
-- MIGRATION 070: SuprO Comprehensive SQL Updates
-- Covers:
-- 1. WhatsApp 23-Hour CRM Window Tracking & Inbound Timestamps on Profiles
-- 2. RentO Machinery & Agriculture Equipment Booking Engine Tables
-- 3. Unified Master Data for AI Hub TestO Quizzes & LMS Content
-- 4. Geospatial / Haversine Distance Search RPC for Nearby Farm Equipment
-- 5. Safe RLS Policies & Indexes for Realtime Performance
-- ==============================================================================

-- ─── 1. PROFILES TABLE ENHANCEMENTS ──────────────────────────────────────────

-- Ensure all modern profile columns exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_whatsapp_inbound_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gemini_api_key TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS default_module TEXT DEFAULT 'Map';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS push_token TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS latitude NUMERIC;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS longitude NUMERIC;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'India';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pincode TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS upi_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Traveller';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whatsapp TEXT;

-- Create index on phone and whatsapp for lightning-fast profile lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone_clean ON public.profiles ((regexp_replace(phone, '\D', '', 'g')));
CREATE INDEX IF NOT EXISTS idx_profiles_last_whatsapp_inbound ON public.profiles (last_whatsapp_inbound_at);

-- RPC Function: 1-Tap Fast Update for WhatsApp Inbound & 24h Window Renewal
CREATE OR REPLACE FUNCTION public.record_whatsapp_inbound(p_phone TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_clean_phone TEXT;
  v_updated_rows INT;
BEGIN
  v_clean_phone := RIGHT(regexp_replace(p_phone, '\D', '', 'g'), 10);
  
  UPDATE public.profiles
  SET last_whatsapp_inbound_at = NOW(),
      updated_at = NOW()
  WHERE phone ILIKE '%' || v_clean_phone || '%'
     OR whatsapp ILIKE '%' || v_clean_phone || '%';
     
  GET DIAGNOSTICS v_updated_rows = ROW_COUNT;
  
  RETURN jsonb_build_object(
    'success', true,
    'phone', v_clean_phone,
    'synced_at', NOW(),
    'expires_at', NOW() + INTERVAL '24 hours',
    'rows_updated', v_updated_rows
  );
END;
$$;


-- ─── 2. RENTO MACHINERY & BOOKINGS ENGINE ─────────────────────────────────────

-- Table: rento_machinery (Tractors, Harvesters, JCBs, Drones, Sprayers, Trucks)
CREATE TABLE IF NOT EXISTS public.rento_machinery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'Tractor' | 'Harvester' | 'JCB' | 'MiniVan' | 'Drone' | 'Pump'
  operator_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  vehicle_number TEXT,
  hourly_rate NUMERIC DEFAULT 700.0,
  acre_rate NUMERIC DEFAULT 1200.0,
  specifications TEXT,
  rating NUMERIC DEFAULT 4.9,
  is_verified BOOLEAN DEFAULT true,
  is_virtual BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'available', -- 'available' | 'busy' | 'offline'
  latitude NUMERIC DEFAULT 11.0168,
  longitude NUMERIC DEFAULT 76.9558,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: rento_bookings (Rental Equipment Requests & Job Orders)
CREATE TABLE IF NOT EXISTS public.rento_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_phone TEXT NOT NULL,
  farmer_name TEXT,
  operator_id UUID REFERENCES public.rento_machinery(id) ON DELETE SET NULL,
  operator_name TEXT,
  operator_phone TEXT,
  equipment_category TEXT NOT NULL, -- 'Tractor' | 'Harvester' | 'JCB' | 'Drone' | 'Truck'
  equipment_name TEXT,
  service_type TEXT DEFAULT 'acres', -- 'acres' | 'hours' | 'mandi_transport'
  quantity NUMERIC DEFAULT 1.0,
  pickup_address TEXT,
  pickup_lat NUMERIC,
  pickup_lng NUMERIC,
  dropoff_address TEXT,
  dropoff_lat NUMERIC,
  dropoff_lng NUMERIC,
  total_price NUMERIC NOT NULL DEFAULT 0.0,
  otp_pin TEXT,
  payment_method TEXT DEFAULT 'UPI', -- 'UPI' | 'Cash'
  payment_status TEXT DEFAULT 'pending', -- 'pending' | 'paid'
  status TEXT DEFAULT 'searching', -- 'searching' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.rento_machinery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rento_bookings ENABLE ROW LEVEL SECURITY;

-- Allow public read & write access with anon key
DROP POLICY IF EXISTS "Public rento_machinery access" ON public.rento_machinery;
CREATE POLICY "Public rento_machinery access" ON public.rento_machinery FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public rento_bookings access" ON public.rento_bookings;
CREATE POLICY "Public rento_bookings access" ON public.rento_bookings FOR ALL USING (true) WITH CHECK (true);

-- Geospatial Haversine Search for RentO Farm Machinery
CREATE OR REPLACE FUNCTION public.get_nearby_machinery(
  p_lat NUMERIC,
  p_lng NUMERIC,
  p_radius_km NUMERIC DEFAULT 50.0,
  p_category TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  category TEXT,
  operator_name TEXT,
  phone TEXT,
  whatsapp_number TEXT,
  vehicle_number TEXT,
  hourly_rate NUMERIC,
  acre_rate NUMERIC,
  specifications TEXT,
  rating NUMERIC,
  status TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  distance_km NUMERIC
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    m.id,
    m.name,
    m.category,
    m.operator_name,
    m.phone,
    m.whatsapp_number,
    m.vehicle_number,
    m.hourly_rate,
    m.acre_rate,
    m.specifications,
    m.rating,
    m.status,
    m.latitude,
    m.longitude,
    ROUND(
      (6371 * acos(
        LEAST(1.0, GREATEST(-1.0,
          cos(radians(p_lat)) * cos(radians(m.latitude)) *
          cos(radians(m.longitude) - radians(p_lng)) +
          sin(radians(p_lat)) * sin(radians(m.latitude))
        ))
      ))::numeric, 2
    ) AS distance_km
  FROM public.rento_machinery m
  WHERE (p_category IS NULL OR m.category ILIKE '%' || p_category || '%')
    AND m.status = 'available'
    AND (
      6371 * acos(
        LEAST(1.0, GREATEST(-1.0,
          cos(radians(p_lat)) * cos(radians(m.latitude)) *
          cos(radians(m.longitude) - radians(p_lng)) +
          sin(radians(p_lat)) * sin(radians(m.latitude))
        ))
      )
    ) <= p_radius_km
  ORDER BY distance_km ASC;
$$;


-- ─── 3. UNIFIED MASTER DATA (AI Hub TestO Quizzes & LMS Content) ──────────────

CREATE TABLE IF NOT EXISTS public.unified_master_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_type TEXT NOT NULL, -- 'o_test' | 'study_notes' | 'scheme_guide' | 'farming_manual'
  title_name TEXT NOT NULL,
  description_purpose TEXT,
  additional_info JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_unified_master_data_type ON public.unified_master_data (item_type);

ALTER TABLE public.unified_master_data ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public unified_master_data access" ON public.unified_master_data;
CREATE POLICY "Public unified_master_data access" ON public.unified_master_data FOR ALL USING (true) WITH CHECK (true);


-- ─── 4. DAILY NEWS & MANDI AGRI FEED TABLE ───────────────────────────────────

CREATE TABLE IF NOT EXISTS public.daily_news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module TEXT NOT NULL, -- 'agro' | 'rideo' | 'teacho' | 'dealo' | 'all'
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  source_name TEXT DEFAULT 'SuprO News Relay',
  link TEXT,
  published_date TEXT,
  loaded_date TEXT DEFAULT TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD'),
  data_type TEXT DEFAULT 'rss', -- 'rss' | 'mandi' | 'govt_api' | 'ai_summary'
  extra_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_news_module_loaded ON public.daily_news (module, loaded_date);

ALTER TABLE public.daily_news ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public daily_news access" ON public.daily_news;
CREATE POLICY "Public daily_news access" ON public.daily_news FOR ALL USING (true) WITH CHECK (true);


-- ─── 5. SEED VIRTUAL TAMIL NADU RENTAL MACHINERY ─────────────────────────────

INSERT INTO public.rento_machinery (
  id, name, category, operator_name, phone, whatsapp_number, vehicle_number, hourly_rate, acre_rate, specifications, rating, is_verified, is_virtual, status, latitude, longitude
) VALUES
  (gen_random_uuid(), 'Mahindra 575 DI Tractor (Rotavator + Cultivator)', 'Tractor', 'Farmer Murugan', '9789012345', '9789012345', 'TN 38 TR 4321', 700.0, 1200.0, '50 HP • 4WD • Rotary Tiller & Disc Plough Included', 4.9, true, true, 'available', 11.0168, 76.9558),
  (gen_random_uuid(), 'Kubota DC-68G Rubber Track Paddy Harvester', 'Harvester', 'Captain Senthil Kumar', '6381029380', '6381029380', 'TN 38 HV 9988', 1800.0, 2200.0, '68 HP • Wetland Rubber Tracks • Paddy, Corn & Wheat', 5.0, true, true, 'available', 10.7905, 79.1378),
  (gen_random_uuid(), 'Tata Ace Gold Agri Mandi Mini-Truck', 'MiniVan', 'Driver Rajesh', '9894012345', '9894012345', 'TN 38 MV 8899', 450.0, 800.0, '750 kg Payload • Fresh Vegetable & Grain Transport', 4.8, true, true, 'available', 9.9252, 78.1198),
  (gen_random_uuid(), 'DJI Agras T40 Agriculture Drone Sprayer', 'Drone', 'Drone Pilot Vignesh', '6381029380', '6381029380', 'TN 38 DR 0007', 800.0, 450.0, '40 Liter Tank • Nano-Mist Precision Pesticide & Fertilizer', 4.9, true, true, 'available', 11.6643, 78.1460),
  (gen_random_uuid(), 'JCB 3CX Eco Heavy Excavator & Leveler', 'JCB', 'Operator Velu', '9123596988', '9123596988', 'TN 38 JCB 1122', 1400.0, 2500.0, '76 HP Heavy Land Clearing, Pond Digging & Leveling', 4.9, true, true, 'available', 10.3673, 77.9803)
ON CONFLICT (id) DO NOTHING;

-- ─── 6. SUPABASE STORAGE BUCKET FOR USER AVATARS ────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies for avatar uploads
DROP POLICY IF EXISTS "Public avatar access" ON storage.objects;
CREATE POLICY "Public avatar access" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Allow authenticated avatar uploads" ON storage.objects;
CREATE POLICY "Allow authenticated avatar uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Allow authenticated avatar updates" ON storage.objects;
CREATE POLICY "Allow authenticated avatar updates" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars');

-- End of Migration 070
