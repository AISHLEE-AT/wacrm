-- Migration 053: Seed Virtual & Verified Drivers across ALL Vehicle Categories
-- Enables testing in all regions for Bike, Auto, Cab, SUV, RentO Agri Tractor, and MiniVan.

ALTER TABLE public.drivers 
  ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'male',
  ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 4.9,
  ADD COLUMN IF NOT EXISTS total_trips INT DEFAULT 120,
  ADD COLUMN IF NOT EXISTS vehicle_model TEXT DEFAULT 'Standard',
  ADD COLUMN IF NOT EXISTS eta_minutes INT DEFAULT 4;

-- Seed virtual drivers across all categories
INSERT INTO public.drivers (id, name, mobile_number, whatsapp_number, vehicle_type, vehicle_number, vehicle_model, gender, rating, total_trips, is_verified, status, pickup_latitude, pickup_longitude)
VALUES 
  (gen_random_uuid(), 'Captain Senthil Kumar', '9486335870', '9486335870', 'Bike', 'TN 38 BL 9486', 'Honda Activa 6G', 'male', 4.9, 342, true, 'online', 11.0168, 76.9558),
  (gen_random_uuid(), 'Driver Anitha R', '9123596988', '9123596988', 'Auto', 'TN 37 AB 1234', 'Bajaj RE Auto', 'female', 5.0, 512, true, 'online', 11.0190, 76.9580),
  (gen_random_uuid(), 'Captain Karthik Raja', '9876543210', '9876543210', 'Cab', 'TN 38 CZ 5678', 'Swift Dzire AC', 'male', 4.8, 289, true, 'online', 11.0150, 76.9520),
  (gen_random_uuid(), 'Driver Priya Lakshmi', '9443322110', '9443322110', 'SUV', 'TN 38 EY 9988', 'Innova Crysta AC', 'female', 4.9, 195, true, 'online', 11.0200, 76.9600),
  (gen_random_uuid(), 'Farmer Murugan', '9789012345', '9789012345', 'Tractor', 'TN 38 TR 4321', 'Mahindra 575 DI', 'male', 4.9, 88, true, 'online', 11.0100, 76.9400),
  (gen_random_uuid(), 'Driver Rajesh', '9894012345', '9894012345', 'MiniVan', 'TN 38 MV 8899', 'Tata Ace Gold', 'male', 4.7, 140, true, 'online', 11.0220, 76.9650)
ON CONFLICT (id) DO NOTHING;
