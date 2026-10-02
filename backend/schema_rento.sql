-- schema_rento.sql
-- RentO Machinery and Bookings Schema for OCI Backend

CREATE TABLE IF NOT EXISTS rento_machinery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tamil_name TEXT,
  category TEXT NOT NULL, -- 'agri' | 'cargo' | 'hourly' | 'tour'
  operator_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  vehicle_number TEXT,
  rate NUMERIC DEFAULT 700.0,
  unit TEXT,
  specifications TEXT,
  rating NUMERIC DEFAULT 4.9,
  is_verified BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'available',
  latitude NUMERIC DEFAULT 11.0168,
  longitude NUMERIC DEFAULT 76.9558,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rento_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  machinery_id UUID REFERENCES rento_machinery(id),
  customer_name TEXT,
  customer_phone TEXT,
  booking_location TEXT,
  booking_date DATE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial machinery
INSERT INTO rento_machinery (name, tamil_name, category, operator_name, phone, whatsapp_number, rate, unit, specifications, icon)
VALUES 
('Mahindra 575 DI Tractor + Rotavator', 'டிராக்டர் + ரொட்டவேட்டர்', 'agri', 'Farmer Murugan', '9789012345', '9789012345', 700.0, 'per hour', '50 HP, 4WD', '🚜'),
('Kubota DC68G Paddy Harvester', 'நெல் அறுவடை இயந்திரம் (Harvester)', 'agri', 'Senthil', '6381029380', '6381029380', 1800.0, 'per acre', '68 HP, Paddy & Wheat', '🌾'),
('Tata Ace Gold Agri Mini-Van', 'டாடா ஏஸ் வேளாண் மினி வேன்', 'cargo', 'Rajesh', '9894012345', '9894012345', 500.0, 'per trip', '750 kg Payload', '🚚')
ON CONFLICT DO NOTHING;
