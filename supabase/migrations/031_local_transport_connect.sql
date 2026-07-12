-- Enable PostGIS extension for spatial queries
CREATE EXTENSION IF NOT EXISTS postgis SCHEMA extensions;

CREATE TABLE public.local_transport_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('traveler', 'transporter')),
  vehicle_type TEXT,
  lat FLOAT NOT NULL,
  lng FLOAT NOT NULL,
  location geography(Point, 4326),
  radius_m INT DEFAULT 10,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'matched', 'completed', 'cancelled')),
  matched_with UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for spatial queries
CREATE INDEX local_transport_requests_location_idx ON public.local_transport_requests USING GIST (location);

-- Function to handle inserts and update the geography column automatically
CREATE OR REPLACE FUNCTION update_local_transport_location()
RETURNS TRIGGER AS $$
BEGIN
  NEW.location = extensions.ST_SetSRID(extensions.ST_MakePoint(NEW.lng, NEW.lat), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_local_transport_location_trigger
BEFORE INSERT OR UPDATE OF lat, lng ON public.local_transport_requests
FOR EACH ROW
EXECUTE FUNCTION update_local_transport_location();

-- Function to find nearby transport requests
CREATE OR REPLACE FUNCTION get_nearby_transports(
  query_lat FLOAT,
  query_lng FLOAT,
  query_radius_m FLOAT,
  query_role TEXT
)
RETURNS SETOF public.local_transport_requests AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.local_transport_requests
  WHERE status = 'active'
    AND role = query_role
    AND extensions.ST_DWithin(
      location,
      extensions.ST_SetSRID(extensions.ST_MakePoint(query_lng, query_lat), 4326)::geography,
      query_radius_m
    )
  ORDER BY extensions.ST_Distance(
    location,
    extensions.ST_SetSRID(extensions.ST_MakePoint(query_lng, query_lat), 4326)::geography
  ) ASC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS policies
ALTER TABLE public.local_transport_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active requests"
ON public.local_transport_requests
FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own requests"
ON public.local_transport_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own requests or ones they are matched with"
ON public.local_transport_requests
FOR UPDATE
USING (auth.uid() = user_id OR auth.uid() = matched_with)
WITH CHECK (auth.uid() = user_id OR auth.uid() = matched_with);

CREATE POLICY "Users can delete their own requests"
ON public.local_transport_requests
FOR DELETE
USING (auth.uid() = user_id);

-- Enable Realtime
alter publication supabase_realtime add table public.local_transport_requests;
