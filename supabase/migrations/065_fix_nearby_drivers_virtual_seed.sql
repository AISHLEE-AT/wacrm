-- ============================================================
-- 065_fix_nearby_drivers_virtual_seed.sql
-- 1. Fix get_nearby_drivers RPC (vehicle_model column missing)
-- 2. Add vehicle_model + phone columns to drivers table
-- 3. Seed 15 virtual drivers for ALL vehicle types (Chennai)
-- ============================================================

-- Step 1: Add missing columns to drivers table
ALTER TABLE public.drivers
  ADD COLUMN IF NOT EXISTS vehicle_model TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS current_lat NUMERIC,
  ADD COLUMN IF NOT EXISTS current_lng NUMERIC,
  ADD COLUMN IF NOT EXISTS eta_minutes INT DEFAULT 3;

-- Sync phone = mobile_number where phone is null
UPDATE public.drivers SET phone = mobile_number WHERE phone IS NULL AND mobile_number IS NOT NULL;

-- Step 2: Fix get_nearby_drivers RPC — safe Haversine (no PostGIS required)
CREATE OR REPLACE FUNCTION get_nearby_drivers(
  pickup_lat NUMERIC,
  pickup_lon NUMERIC,
  radius_km NUMERIC DEFAULT 2
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  phone TEXT,
  vehicle_type TEXT,
  vehicle_model TEXT,
  vehicle_number TEXT,
  rating NUMERIC,
  status TEXT,
  distance_km NUMERIC,
  eta_minutes INT,
  upi_id TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.name,
    COALESCE(d.phone, d.mobile_number, d.whatsapp_number) AS phone,
    d.vehicle_type,
    COALESCE(d.vehicle_model, '') AS vehicle_model,
    COALESCE(d.vehicle_number, d.vehicle_registration, '') AS vehicle_number,
    COALESCE(d.rating, 4.5) AS rating,
    d.status,
    -- Haversine distance in km
    ROUND((6371.0 * acos(
      LEAST(1.0, GREATEST(-1.0,
        cos(radians(pickup_lat)) *
        cos(radians(COALESCE(d.pickup_latitude, d.current_lat, d.lat))) *
        cos(radians(COALESCE(d.pickup_longitude, d.current_lng, d.lng)) - radians(pickup_lon)) +
        sin(radians(pickup_lat)) *
        sin(radians(COALESCE(d.pickup_latitude, d.current_lat, d.lat)))
      ))
    ))::NUMERIC, 2) AS distance_km,
    COALESCE(d.eta_minutes,
      GREATEST(2, (
        6371.0 * acos(
          LEAST(1.0, GREATEST(-1.0,
            cos(radians(pickup_lat)) *
            cos(radians(COALESCE(d.pickup_latitude, d.current_lat, d.lat))) *
            cos(radians(COALESCE(d.pickup_longitude, d.current_lng, d.lng)) - radians(pickup_lon)) +
            sin(radians(pickup_lat)) *
            sin(radians(COALESCE(d.pickup_latitude, d.current_lat, d.lat)))
          ))
        * 2.0
      )::INT)
    ) AS eta_minutes,
    COALESCE(d.upi_id, '') AS upi_id
  FROM public.drivers d
  WHERE
    d.status = 'online'
    AND COALESCE(d.is_blocked, false) = false
    AND COALESCE(d.pickup_latitude, d.current_lat, d.lat) IS NOT NULL
    AND COALESCE(d.pickup_longitude, d.current_lng, d.lng) IS NOT NULL
    -- Fast bounding box pre-filter
    AND COALESCE(d.pickup_latitude, d.current_lat, d.lat)
        BETWEEN pickup_lat - (radius_km / 111.0) AND pickup_lat + (radius_km / 111.0)
    AND COALESCE(d.pickup_longitude, d.current_lng, d.lng)
        BETWEEN pickup_lon - (radius_km / (111.0 * cos(radians(pickup_lat))))
            AND pickup_lon + (radius_km / (111.0 * cos(radians(pickup_lat))))
    -- Exact Haversine radius check
    AND (6371.0 * acos(
      LEAST(1.0, GREATEST(-1.0,
        cos(radians(pickup_lat)) *
        cos(radians(COALESCE(d.pickup_latitude, d.current_lat, d.lat))) *
        cos(radians(COALESCE(d.pickup_longitude, d.current_lng, d.lng)) - radians(pickup_lon)) +
        sin(radians(pickup_lat)) *
        sin(radians(COALESCE(d.pickup_latitude, d.current_lat, d.lat)))
      ))
    )) <= radius_km
  ORDER BY distance_km ASC
  LIMIT 20;
END;
$$;

GRANT EXECUTE ON FUNCTION get_nearby_drivers(NUMERIC, NUMERIC, NUMERIC) TO anon, authenticated;

-- Step 3: Clear old test virtual drivers (safe — only our virtual numbers)
DELETE FROM public.drivers
WHERE mobile_number IN (
  '9000000001','9000000002','9000000003','9000000004','9000000005',
  '9000000006','9000000007','9000000008','9000000009','9000000010',
  '9000000011','9000000012','9000000013','9000000014','9000000015'
);

-- Step 4: Seed 15 virtual drivers — 5 Chennai zones × 3 vehicle types each
-- Chennai GPS centre: 13.0827° N, 80.2707° E

INSERT INTO public.drivers (
  name, mobile_number, whatsapp_number, phone,
  vehicle_type, vehicle_model, vehicle_number,
  gender, rating, total_trips,
  is_verified, status,
  pickup_latitude, pickup_longitude,
  current_lat, current_lng,
  upi_id, subscription_valid_until, eta_minutes
) VALUES

-- ── Zone 1: T.Nagar / Anna Salai (13.0350, 80.2310) ──────────────────────
('🏍️ Kumar (Virtual)',        '9000000001','9000000001','9000000001', 'bike',  'Honda Activa 6G',      'TN 09 BK 1001', 'male',   4.9, 412,  true,'online', 13.0350,80.2310,13.0350,80.2310, 'kumar.ride@upi',    NOW()+INTERVAL '90 days', 3),
('🛺 Selvam (Virtual)',        '9000000002','9000000002','9000000002', 'auto',  'Bajaj RE Auto',        'TN 09 AU 1002', 'male',   4.8, 892,  true,'online', 13.0365,80.2325,13.0365,80.2325, 'selvam.auto@upi',   NOW()+INTERVAL '90 days', 4),
('🚕 Praveen (Virtual)',       '9000000003','9000000003','9000000003', 'cab',   'Maruti Swift Dzire',   'TN 09 CB 1003', 'male',   4.7,1203,  true,'online', 13.0340,80.2295,13.0340,80.2295, 'praveen.cab@upi',   NOW()+INTERVAL '90 days', 5),

-- ── Zone 2: Anna Nagar / Kilpauk (13.0850, 80.2101) ──────────────────────
('🏍️ Dinesh (Virtual)',       '9000000004','9000000004','9000000004', 'bike',  'TVS Jupiter',          'TN 09 BK 1004', 'male',   4.6, 287,  true,'online', 13.0850,80.2101,13.0850,80.2101, 'dinesh.bike@upi',   NOW()+INTERVAL '90 days', 3),
('🛺 Meena (Virtual)',         '9000000005','9000000005','9000000005', 'auto',  'TVS King Auto',        'TN 09 AU 1005', 'female', 5.0, 743,  true,'online', 13.0862,80.2115,13.0862,80.2115, 'meena.auto@upi',    NOW()+INTERVAL '90 days', 4),
('🚐 Suresh SUV (Virtual)',    '9000000006','9000000006','9000000006', 'suv',   'Toyota Innova Crysta', 'TN 09 SV 1006', 'male',   4.9, 567,  true,'online', 13.0838,80.2088,13.0838,80.2088, 'suresh.suv@upi',    NOW()+INTERVAL '90 days', 6),

-- ── Zone 3: Adyar / Besant Nagar (13.0012, 80.2565) ─────────────────────
('🏍️ Rajan (Virtual)',        '9000000007','9000000007','9000000007', 'bike',  'Bajaj Pulsar 150',     'TN 09 BK 1007', 'male',   4.5, 198,  true,'online', 13.0012,80.2565,13.0012,80.2565, 'rajan.bike@upi',    NOW()+INTERVAL '90 days', 3),
('🛺 Kavitha (Virtual)',       '9000000008','9000000008','9000000008', 'auto',  'Bajaj RE 4S',          'TN 09 AU 1008', 'female', 4.9,1120,  true,'online', 13.0022,80.2577,13.0022,80.2577, 'kavitha.auto@upi',  NOW()+INTERVAL '90 days', 4),
('🚗 Arun Mini (Virtual)',     '9000000009','9000000009','9000000009', 'mini',  'Maruti WagonR',        'TN 09 MN 1009', 'male',   4.7, 445,  true,'online', 13.0005,80.2555,13.0005,80.2555, 'arun.mini@upi',     NOW()+INTERVAL '90 days', 5),

-- ── Zone 4: Velachery / OMR (12.9815, 80.2180) ───────────────────────────
('🏍️ Vijay (Virtual)',        '9000000010','9000000010','9000000010', 'bike',  'Hero Splendor Plus',   'TN 09 BK 1010', 'male',   4.8, 320,  true,'online', 12.9815,80.2180,12.9815,80.2180, 'vijay.bike@upi',    NOW()+INTERVAL '90 days', 3),
('🚙 Senthil (Virtual)',       '9000000011','9000000011','9000000011', 'sedan', 'Honda City',           'TN 09 SD 1011', 'male',   4.8, 876,  true,'online', 12.9825,80.2192,12.9825,80.2192, 'senthil.sedan@upi', NOW()+INTERVAL '90 days', 6),
('🛻 Balu Cargo (Virtual)',    '9000000012','9000000012','9000000012', 'cargo', 'Mahindra Ape Xtra',    'TN 09 CG 1012', 'male',   4.6, 234,  true,'online', 12.9830,80.2172,12.9830,80.2172, 'balu.cargo@upi',    NOW()+INTERVAL '90 days', 7),

-- ── Zone 5: Porur / Guindy (13.0372, 80.1758) ────────────────────────────
('🏍️ Karthik (Virtual)',      '9000000013','9000000013','9000000013', 'bike',  'Yamaha FZ S',          'TN 09 BK 1013', 'male',   4.7, 156,  true,'online', 13.0372,80.1758,13.0372,80.1758, 'karthik.bike@upi',  NOW()+INTERVAL '90 days', 3),
('🛺 Anbu Auto (Virtual)',     '9000000014','9000000014','9000000014', 'auto',  'Piaggio Ape Auto',     'TN 09 AU 1014', 'male',   4.9, 678,  true,'online', 13.0382,80.1770,13.0382,80.1770, 'anbu.auto@upi',     NOW()+INTERVAL '90 days', 4),
('🚐 Mani SUV (Virtual)',      '9000000015','9000000015','9000000015', 'suv',   'Mahindra Bolero',      'TN 09 SV 1015', 'male',   4.8, 934,  true,'online', 13.0362,80.1745,13.0362,80.1745, 'mani.suv@upi',      NOW()+INTERVAL '90 days', 7);

-- Step 5: Backfill vehicle_model for any existing drivers missing it
UPDATE public.drivers
SET vehicle_model = CASE
  WHEN LOWER(vehicle_type) IN ('bike','moto','motorcycle') THEN 'Honda Activa'
  WHEN LOWER(vehicle_type) = 'auto'                        THEN 'Bajaj RE Auto'
  WHEN LOWER(vehicle_type) IN ('cab','taxi')               THEN 'Swift Dzire'
  WHEN LOWER(vehicle_type) = 'sedan'                       THEN 'Honda City'
  WHEN LOWER(vehicle_type) IN ('mini','hatchback')         THEN 'WagonR'
  WHEN LOWER(vehicle_type) IN ('suv','innova')             THEN 'Toyota Innova'
  WHEN LOWER(vehicle_type) IN ('cargo','minivan')          THEN 'Mahindra Ape'
  ELSE 'Standard Vehicle'
END
WHERE (vehicle_model IS NULL OR vehicle_model = '')
  AND vehicle_type IS NOT NULL;
