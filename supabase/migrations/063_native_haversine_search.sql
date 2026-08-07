-- ============================================================
-- 063_native_haversine_search.sql 
-- Creates an RPC function for native mobile apps to search 
-- nearby drivers efficiently using Haversine formula
-- ============================================================

-- Function to fetch nearby drivers within a certain radius (km)
CREATE OR REPLACE FUNCTION get_nearby_drivers(
  pickup_lat NUMERIC, 
  pickup_lon NUMERIC, 
  radius_km NUMERIC DEFAULT 2
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  vehicle_type TEXT,
  vehicle_model TEXT,
  vehicle_number TEXT,
  rating NUMERIC,
  status TEXT,
  pickup_latitude NUMERIC,
  pickup_longitude NUMERIC,
  distance_km NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.name,
    d.vehicle_type,
    d.vehicle_model,
    d.vehicle_number,
    d.rating,
    d.status,
    d.pickup_latitude,
    d.pickup_longitude,
    -- Haversine formula calculation in kilometers
    (6371 * acos(
      cos(radians(pickup_lat)) * cos(radians(d.pickup_latitude)) * 
      cos(radians(d.pickup_longitude) - radians(pickup_lon)) + 
      sin(radians(pickup_lat)) * sin(radians(d.pickup_latitude))
    ))::NUMERIC AS distance_km
  FROM 
    public.drivers d
  WHERE 
    d.status = 'online'
    AND d.pickup_latitude IS NOT NULL
    AND d.pickup_longitude IS NOT NULL
    -- Optimization: Rough bounding box filtering before exact Haversine
    AND d.pickup_latitude BETWEEN pickup_lat - (radius_km / 111.0) AND pickup_lat + (radius_km / 111.0)
    AND d.pickup_longitude BETWEEN pickup_lon - (radius_km / (111.0 * cos(radians(pickup_lat)))) AND pickup_lon + (radius_km / (111.0 * cos(radians(pickup_lat))))
  ORDER BY 
    distance_km ASC
  LIMIT 20;
END;
$$;
