-- ==============================================================================
-- FAGO SUPER APP - GAPS & ZERO-COST FEATURE ADDITIONS MIGRATION SCRIPT
-- Version: v2.0.0 (2026-07-27)
-- Features: 7-Day Mandi Price History, Driver Zero-Fee UPI Payout Log, 
--           RentO Equipment Availability, and TestO Regional Leaderboard.
-- ==============================================================================

-- 1. MANDI 7-DAY PRICE HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.mandi_price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    district TEXT NOT NULL,
    commodity TEXT NOT NULL,
    price_per_kg NUMERIC NOT NULL,
    min_price_30d NUMERIC,
    max_price_30d NUMERIC,
    recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_district_commodity_date UNIQUE (district, commodity, recorded_date)
);

-- Enable RLS for Mandi Price History
ALTER TABLE public.mandi_price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for mandi price history"
    ON public.mandi_price_history FOR SELECT
    USING (true);

CREATE POLICY "Admin write access for mandi price history"
    ON public.mandi_price_history FOR ALL
    USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- Index for fast sparkline history queries
CREATE INDEX IF NOT EXISTS idx_mandi_history_district_commodity_date 
    ON public.mandi_price_history (district, commodity, recorded_date DESC);


-- 2. DRIVER ZERO-FEE UPI PAYOUT REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.driver_payout_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id TEXT NOT NULL,
    driver_name TEXT NOT NULL,
    driver_phone TEXT NOT NULL,
    upi_id TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    trips_count INT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'completed', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for Driver Payout Requests
ALTER TABLE public.driver_payout_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can view their own payout requests"
    ON public.driver_payout_requests FOR SELECT
    USING (auth.uid()::text = driver_id OR driver_phone IN (SELECT phone FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Drivers can create payout requests"
    ON public.driver_payout_requests FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can manage payout requests"
    ON public.driver_payout_requests FOR ALL
    USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));


-- 3. RENTO EQUIPMENT TABLE & AVAILABILITY EXTENSIONS
CREATE TABLE IF NOT EXISTS public.rento_equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id TEXT,
    machine_name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Tractor',
    operator_name TEXT,
    operator_phone TEXT,
    hourly_rate NUMERIC NOT NULL DEFAULT 700.0,
    specs TEXT,
    availability_status TEXT DEFAULT 'AVAILABLE NOW',
    next_available_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for RentO Equipment
ALTER TABLE public.rento_equipment ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'rento_equipment' AND policyname = 'Public read access for rento_equipment'
    ) THEN
        CREATE POLICY "Public read access for rento_equipment" ON public.rento_equipment FOR SELECT USING (true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='rento_equipment' AND column_name='availability_status') THEN
        ALTER TABLE public.rento_equipment ADD COLUMN availability_status TEXT DEFAULT 'AVAILABLE NOW';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='rento_equipment' AND column_name='next_available_date') THEN
        ALTER TABLE public.rento_equipment ADD COLUMN next_available_date DATE;
    END IF;
END $$;


-- 4. TESTO SCORES & REGIONAL TNPSC LEADERBOARD VIEW
CREATE TABLE IF NOT EXISTS public.testo_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    exam_title TEXT NOT NULL DEFAULT 'TNPSC Group 4 Mock',
    score INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for TestO Scores
ALTER TABLE public.testo_scores ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'testo_scores' AND policyname = 'Public read access for testo_scores'
    ) THEN
        CREATE POLICY "Public read access for testo_scores" ON public.testo_scores FOR SELECT USING (true);
    END IF;
END $$;

CREATE OR REPLACE VIEW public.testo_leaderboard AS
SELECT 
    p.id AS user_id,
    COALESCE(p.full_name, 'Tamil Scholar') AS scholar_name,
    COALESCE(p.address, 'Coimbatore') AS district,
    COUNT(t.id) AS tests_completed,
    COALESCE(MAX(t.score), 0) AS top_score,
    COALESCE(AVG(t.score), 0)::NUMERIC(5,2) AS avg_score,
    CASE 
        WHEN MAX(t.score) >= 90 THEN '🌾 Agri Master Scholar'
        WHEN MAX(t.score) >= 75 THEN '📚 TNPSC High Scorer'
        ELSE '📝 Active Learner'
    END AS achievement_badge
FROM public.profiles p
LEFT JOIN public.testo_scores t ON p.id::text = t.user_id::text
GROUP BY p.id, p.full_name, p.address
ORDER BY top_score DESC, avg_score DESC;


-- 5. SEED SAMPLE DATA FOR 7-DAY MANDI PRICE HISTORY (0% API COST)
INSERT INTO public.mandi_price_history (district, commodity, price_per_kg, min_price_30d, max_price_30d, recorded_date)
VALUES 
  ('Coimbatore', 'Paddy (நெல்)', 24.50, 21.00, 26.00, CURRENT_DATE - INTERVAL '6 days'),
  ('Coimbatore', 'Paddy (நெல்)', 24.80, 21.00, 26.00, CURRENT_DATE - INTERVAL '5 days'),
  ('Coimbatore', 'Paddy (நெல்)', 25.00, 21.00, 26.00, CURRENT_DATE - INTERVAL '4 days'),
  ('Coimbatore', 'Paddy (நெல்)', 25.20, 21.00, 26.00, CURRENT_DATE - INTERVAL '3 days'),
  ('Coimbatore', 'Paddy (நெல்)', 25.50, 21.00, 26.00, CURRENT_DATE - INTERVAL '2 days'),
  ('Coimbatore', 'Paddy (நெல்)', 25.80, 21.00, 26.00, CURRENT_DATE - INTERVAL '1 day'),
  ('Coimbatore', 'Paddy (நெல்)', 26.00, 21.00, 26.00, CURRENT_DATE),

  ('Erode', 'Turmeric (மஞ்சள்)', 135.00, 120.00, 142.00, CURRENT_DATE - INTERVAL '6 days'),
  ('Erode', 'Turmeric (மஞ்சள்)', 136.50, 120.00, 142.00, CURRENT_DATE - INTERVAL '5 days'),
  ('Erode', 'Turmeric (மஞ்சள்)', 138.00, 120.00, 142.00, CURRENT_DATE - INTERVAL '4 days'),
  ('Erode', 'Turmeric (மஞ்சள்)', 139.00, 120.00, 142.00, CURRENT_DATE - INTERVAL '3 days'),
  ('Erode', 'Turmeric (மஞ்சள்)', 140.00, 120.00, 142.00, CURRENT_DATE - INTERVAL '2 days'),
  ('Erode', 'Turmeric (மஞ்சள்)', 141.50, 120.00, 142.00, CURRENT_DATE - INTERVAL '1 day'),
  ('Erode', 'Turmeric (மஞ்சள்)', 142.00, 120.00, 142.00, CURRENT_DATE)
ON CONFLICT (district, commodity, recorded_date) DO UPDATE
SET price_per_kg = EXCLUDED.price_per_kg;

-- SUCCESS SUMMARY NOTICE
SELECT 'FAGO Super App Gap Closures & $0-Cost Optimizations SQL Migration Completed Successfully!' AS status;
