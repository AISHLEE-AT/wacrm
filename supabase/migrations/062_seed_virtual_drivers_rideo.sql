-- ============================================================
-- 062_seed_virtual_drivers_rideo.sql - Seed Virtual Drivers
-- Seeds drivers with Subscriptions and UPI IDs for testing
-- ============================================================

-- First, ensure the columns from 061 exist
ALTER TABLE public.drivers
  ADD COLUMN IF NOT EXISTS upi_id TEXT,
  ADD COLUMN IF NOT EXISTS accepted_payment_methods TEXT[] DEFAULT ARRAY['cash', 'upi']::TEXT[],
  ADD COLUMN IF NOT EXISTS subscription_valid_until TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days';

-- Insert/Update Virtual Drivers (using names from 053 or new ones)
-- We use ON CONFLICT to just update the existing virtual drivers if they exist
-- Since 053 used ON CONFLICT DO NOTHING, we will just insert new ones with fixed UUIDs 
-- to ensure they update properly, or we can use a DO block to update by name.

DO $$
BEGIN
    -- Update existing virtual drivers to have active subscriptions and UPI
    UPDATE public.drivers
    SET 
        upi_id = 'driver@upi',
        subscription_valid_until = NOW() + INTERVAL '30 days',
        accepted_payment_methods = ARRAY['cash', 'upi']::TEXT[],
        status = 'online'
    WHERE is_verified = true;
    
    -- If no drivers exist (e.g. testing in a fresh environment), insert some fresh virtual drivers
    IF NOT EXISTS (SELECT 1 FROM public.drivers WHERE is_verified = true) THEN
        INSERT INTO public.drivers (id, name, mobile_number, whatsapp_number, vehicle_type, vehicle_number, vehicle_model, gender, rating, total_trips, is_verified, status, pickup_latitude, pickup_longitude, upi_id, subscription_valid_until)
        VALUES 
          (gen_random_uuid(), 'Captain Senthil Kumar', '6381029380', '6381029380', 'Bike', 'TN 38 BL 9486', 'Honda Activa 6G', 'male', 4.9, 342, true, 'online', 11.0168, 76.9558, 'senthil@upi', NOW() + INTERVAL '30 days'),
          (gen_random_uuid(), 'Driver Anitha R', '9123596988', '9123596988', 'Auto', 'TN 37 AB 1234', 'Bajaj RE Auto', 'female', 5.0, 512, true, 'online', 11.0190, 76.9580, 'anitha@upi', NOW() + INTERVAL '30 days'),
          (gen_random_uuid(), 'Captain Karthik Raja', '9876543210', '9876543210', 'Cab', 'TN 38 CZ 5678', 'Swift Dzire AC', 'male', 4.8, 289, true, 'online', 11.0150, 76.9520, 'karthik@upi', NOW() + INTERVAL '30 days');
    END IF;
END $$;
