-- Migration 052: Idempotent Schema Update for FAGO Role Management & Driver Verification
-- Safe & idempotent script: can be executed repeatedly in Supabase SQL Editor

-- 1. Ensure profiles table has main_category and role columns
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE,
  whatsapp TEXT,
  full_name TEXT,
  main_category TEXT DEFAULT 'Traveller',
  role TEXT DEFAULT 'user',
  profile_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS main_category TEXT DEFAULT 'Traveller';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- 2. Auto-heal Admin role for 9486335870
UPDATE public.profiles 
SET role = 'admin' 
WHERE phone IN ('9486335870', '919486335870', '+919486335870')
   OR whatsapp IN ('9486335870', '919486335870', '+919486335870');

-- 3. Ensure drivers table has is_verified flag
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- 4. Sync verified driver roles back to profiles table automatically
CREATE OR REPLACE FUNCTION public.sync_driver_verification_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_verified = true THEN
    UPDATE public.profiles 
    SET role = 'driver' 
    WHERE phone = NEW.mobile_number 
       OR phone = '91' || NEW.mobile_number 
       OR phone = NEW.whatsapp_number;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_driver_role ON public.drivers;
CREATE TRIGGER trg_sync_driver_role
AFTER INSERT OR UPDATE OF is_verified ON public.drivers
FOR EACH ROW EXECUTE FUNCTION public.sync_driver_verification_role();
