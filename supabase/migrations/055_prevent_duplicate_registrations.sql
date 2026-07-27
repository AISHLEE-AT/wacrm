-- Migration 055: Prevent Duplicate Driver & Module Registrations
-- 1. Deduplicate existing drivers table records
DELETE FROM public.drivers a
USING public.drivers b
WHERE a.id < b.id 
  AND (a.mobile_number = b.mobile_number OR (a.user_id IS NOT NULL AND a.user_id = b.user_id));

-- 2. Add Unique Constraints to Prevent Duplicate Rows
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'unique_drivers_mobile_number'
    ) THEN
        ALTER TABLE public.drivers ADD CONSTRAINT unique_drivers_mobile_number UNIQUE (mobile_number);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'unique_drivers_user_id'
    ) THEN
        ALTER TABLE public.drivers ADD CONSTRAINT unique_drivers_user_id UNIQUE (user_id);
    END IF;
END $$;

-- 3. Upsert Admin Driver Profile for 9486335870
INSERT INTO public.drivers (id, user_id, driver_name, mobile_number, vehicle_number, vehicle_type, status, is_verified, verification_status, created_at)
VALUES (
  '00000000-0000-0000-0000-000000009486',
  '00000000-0000-0000-0000-000000009486',
  'Captain Rajakumaran (Area Admin)',
  '9486335870',
  'TN 38 BL 9486',
  'Car',
  'online',
  true,
  'approved',
  NOW()
)
ON CONFLICT (mobile_number) DO UPDATE SET
  is_verified = true,
  verification_status = 'approved',
  driver_name = EXCLUDED.driver_name,
  vehicle_number = EXCLUDED.vehicle_number;
