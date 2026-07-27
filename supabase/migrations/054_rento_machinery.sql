-- Migration 054: Create RentO Machinery Table & Seed Test Machines
CREATE TABLE IF NOT EXISTS public.rento_machinery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  operator_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  vehicle_number TEXT,
  hourly_rate NUMERIC DEFAULT 700.0,
  specifications TEXT,
  rating NUMERIC DEFAULT 4.9,
  is_verified BOOLEAN DEFAULT true,
  is_virtual BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'available',
  latitude NUMERIC DEFAULT 11.0168,
  longitude NUMERIC DEFAULT 76.9558,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Virtual Test Machinery across all farming & heavy machinery categories
INSERT INTO public.rento_machinery (id, name, category, operator_name, phone, whatsapp_number, vehicle_number, hourly_rate, specifications, rating, is_verified, is_virtual, status)
VALUES
  (gen_random_uuid(), 'Mahindra 575 DI Tractor + Rotavator', 'Tractor', 'Farmer Murugan', '9789012345', '9789012345', 'TN 38 TR 4321', 700.0, '50 HP • 4WD • Rotary Tiller Attachment', 4.9, true, true, 'available'),
  (gen_random_uuid(), 'Kubota DC68G Paddy Harvester', 'Harvester', 'Captain Senthil Kumar', '9486335870', '9486335870', 'TN 38 HV 9988', 1800.0, '68 HP • Rubber Track Crawler • Paddy & Wheat', 5.0, true, true, 'available'),
  (gen_random_uuid(), 'Tata Ace Gold Agri Mini-Van', 'MiniVan', 'Driver Rajesh', '9894012345', '9894012345', 'TN 38 MV 8899', 500.0, '750 kg Payload • Crop Transport to Mandi', 4.7, true, true, 'available'),
  (gen_random_uuid(), 'Kirloskar 5HP Diesel Drip Irrigation Pump', 'Pump', 'Selvam Agri Tools', '9123596988', '9123596988', 'TN 37 PUMP 12', 350.0, '5 HP High Pressure Diesel • Drip Set Included', 4.8, true, true, 'available'),
  (gen_random_uuid(), 'JCB 3CX Heavy Excavator & Loader', 'JCB', 'Operator Velu', '9486335870', '9486335870', 'TN 38 JCB 1122', 1500.0, '76 HP Heavy Digging & Farm Leveling', 4.9, true, true, 'available')
ON CONFLICT (id) DO NOTHING;
