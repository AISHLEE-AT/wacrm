-- schema_dealo.sql
-- DealO Module (Marketplace Listings) Schema for OCI Backend

CREATE TABLE IF NOT EXISTS market_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_name TEXT NOT NULL,
  seller_phone TEXT NOT NULL,
  seller_whatsapp TEXT NOT NULL,
  seller_upi TEXT,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'farm_produce',
  price NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'per_item', 
  quantity NUMERIC DEFAULT 1,
  description TEXT,
  image_url TEXT,
  pincode VARCHAR(10) NOT NULL,
  district TEXT,
  location_name TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  status TEXT NOT NULL DEFAULT 'pending',
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
