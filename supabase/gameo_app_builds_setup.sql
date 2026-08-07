-- Run this in the SQL Editor of your GAMEO Supabase project to create the table we just set up the webhook to read from!

CREATE TABLE IF NOT EXISTS public.app_builds (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    platform text NOT NULL, -- e.g., 'flutter' or 'react'
    version text,
    download_url text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (Optional, but good practice)
ALTER TABLE public.app_builds ENABLE ROW LEVEL SECURITY;

-- Allow read access to anyone
CREATE POLICY "Enable read access for all users" ON public.app_builds
    FOR SELECT USING (true);

-- Insert initial records so the webhook has something to return right away
INSERT INTO public.app_builds (platform, download_url) VALUES 
('react', 'https://watcrm.vercel.app'),
('flutter', 'https://supro.app/download');
