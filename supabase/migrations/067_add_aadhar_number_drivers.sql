-- 067_add_aadhar_number_drivers.sql
ALTER TABLE public.drivers 
  ADD COLUMN IF NOT EXISTS aadhar_number TEXT,
  ADD COLUMN IF NOT EXISTS vehicle_model TEXT;
