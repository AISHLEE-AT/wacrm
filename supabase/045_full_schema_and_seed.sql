-- ==============================================================================
-- 045 Full Schema & Seed (Bulletproof version with ALTER TABLE checks)
-- ==============================================================================

-- 1. Ensure Profile Additions
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS upi_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS permanent_pincode TEXT;

-- 2. CREATE ALL MODULE TABLES IF THEY DON'T EXIST & FORCE COLUMNS

-- TeachO (LMS - Courses)
CREATE TABLE IF NOT EXISTS public.teacho_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE public.teacho_courses ADD COLUMN IF NOT EXISTS instructor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.teacho_courses ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.teacho_courses ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.teacho_courses ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE public.teacho_courses ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.teacho_courses ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'DRAFT';
ALTER TABLE public.teacho_courses ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- TestO (Assessments)
CREATE TABLE IF NOT EXISTS public.testo_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE public.testo_assessments ADD COLUMN IF NOT EXISTS creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.testo_assessments ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.testo_assessments ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.testo_assessments ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 60;
ALTER TABLE public.testo_assessments ADD COLUMN IF NOT EXISTS total_marks INTEGER DEFAULT 100;
ALTER TABLE public.testo_assessments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'DRAFT';

-- TourO (Travel)
CREATE TABLE IF NOT EXISTS public.touro (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE public.touro ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.touro ADD COLUMN IF NOT EXISTS tour_name TEXT;
ALTER TABLE public.touro ADD COLUMN IF NOT EXISTS destination TEXT;
ALTER TABLE public.touro ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE public.touro ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE public.touro ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'PENDING';
ALTER TABLE public.touro ADD COLUMN IF NOT EXISTS booking_details JSONB;

-- MoneyO (Savings)
CREATE TABLE IF NOT EXISTS public.moneyo_savings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE public.moneyo_savings ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.moneyo_savings ADD COLUMN IF NOT EXISTS scheme_name TEXT;
ALTER TABLE public.moneyo_savings ADD COLUMN IF NOT EXISTS amount DECIMAL(10,2);
ALTER TABLE public.moneyo_savings ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE';

-- TaskO (Productivity)
CREATE TABLE IF NOT EXISTS public.tasko_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE public.tasko_tasks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.tasko_tasks ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.tasko_tasks ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'TODO';
ALTER TABLE public.tasko_tasks ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE;

-- TradeO (Marketplace)
CREATE TABLE IF NOT EXISTS public.tradeo_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE public.tradeo_listings ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.tradeo_listings ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.tradeo_listings ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.tradeo_listings ADD COLUMN IF NOT EXISTS price DECIMAL(10,2);
ALTER TABLE public.tradeo_listings ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'AVAILABLE';
ALTER TABLE public.tradeo_listings ADD COLUMN IF NOT EXISTS seller_upi_id TEXT;
ALTER TABLE public.tradeo_listings ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';
ALTER TABLE public.tradeo_listings ADD COLUMN IF NOT EXISTS image_url TEXT;

-- TvO (Media)
CREATE TABLE IF NOT EXISTS public.tvo_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE public.tvo_videos ADD COLUMN IF NOT EXISTS creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.tvo_videos ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.tvo_videos ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.tvo_videos ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.tvo_videos ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE public.tvo_videos ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;

-- Purchases (Universal Payments tracking)
CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS item_type TEXT;
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS item_id TEXT;
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS amount DECIMAL(10,2);
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS payment_id TEXT;
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'PENDING_VERIFICATION';


-- ==============================================================================
-- 3. Seed Data (High-Quality Realistic Tamil Nadu Context)
-- ==============================================================================

-- TeachO (LMS)
INSERT INTO public.teacho_courses (instructor_id, title, description, price, category, status, thumbnail_url)
SELECT id, 
       'TNPSC Group 4 Masterclass (Tamil Medium)', 
       'Complete syllabus coverage for TNPSC Group 4 including Pothu Tamil, General Studies, and Mental Ability.', 
       2499.00, 
       'Competitive Exams', 
       'PUBLISHED', 
       'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=400' 
FROM auth.users LIMIT 1;

INSERT INTO public.teacho_courses (instructor_id, title, description, price, category, status, thumbnail_url)
SELECT id, 
       'Spoken English for Tamil Speakers', 
       'Learn fluent English communication in just 30 days. Specifically designed for Tamil medium students.', 
       999.00, 
       'Language & Communication', 
       'PUBLISHED', 
       'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=400' 
FROM auth.users LIMIT 1;

-- TestO (Assessments)
INSERT INTO public.testo_assessments (creator_id, title, description, duration_minutes, total_marks, status)
SELECT id, 
       'TNPSC Group 2 Prelims Full Mock Test - 01', 
       'Full length mock test strictly following the latest TNPSC Group 2 syllabus.', 
       180, 
       300, 
       'PUBLISHED' 
FROM auth.users LIMIT 1;

-- TourO (Travel)
INSERT INTO public.touro (user_id, tour_name, destination, start_date, end_date, status, booking_details)
SELECT id, 
       'Kodaikanal Weekend Retreat', 
       'Kodaikanal, Dindigul District', 
       CURRENT_DATE + INTERVAL '10 days', 
       CURRENT_DATE + INTERVAL '12 days', 
       'CONFIRMED', 
       '{"hotel": "Kodai Resort Hotel", "transport": "AC Sleeper Bus from Chennai", "pax": 2}' 
FROM auth.users LIMIT 1;

-- MoneyO (Savings)
INSERT INTO public.moneyo_savings (user_id, scheme_name, amount, status)
SELECT id, 
       'Post Office Recurring Deposit (RD)', 
       5000.00, 
       'ACTIVE' 
FROM auth.users LIMIT 1;

-- TaskO (Productivity)
INSERT INTO public.tasko_tasks (user_id, title, status, due_date)
SELECT id, 'Renew LIC Premium - Jeevan Anand', 'TODO', CURRENT_DATE + INTERVAL '5 days' FROM auth.users LIMIT 1;

INSERT INTO public.tasko_tasks (user_id, title, status, due_date)
SELECT id, 'Submit TNEB Electricity Bill', 'DONE', CURRENT_DATE - INTERVAL '1 day' FROM auth.users LIMIT 1;

-- TradeO (Marketplace)
INSERT INTO public.tradeo_listings (seller_id, title, description, price, status, seller_upi_id, category, image_url)
SELECT id, 
       'TVS Jupiter 125 - 2023 Model', 
       'Single owner, gently used in Coimbatore city.', 
       65000.00, 
       'AVAILABLE', 
       '9486335870@hdfcbank', 
       'Vehicles', 
       'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=400' 
FROM auth.users LIMIT 1;

INSERT INTO public.tradeo_listings (seller_id, title, description, price, status, seller_upi_id, category, image_url)
SELECT id, 
       'Pure Kanchipuram Silk Saree (Bridal)', 
       'Brand new, authentic handwoven Kanchipuram silk saree with pure zari.', 
       18500.00, 
       'AVAILABLE', 
       '9486335870@hdfcbank', 
       'Fashion', 
       'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400' 
FROM auth.users LIMIT 1;

-- TvO (Media)
INSERT INTO public.tvo_videos (creator_id, title, description, video_url, thumbnail_url, views_count)
SELECT id, 
       'History of Chola Empire - Part 1', 
       'A deep dive into the architectural marvels of the Chola Dynasty.', 
       'https://www.youtube.com/watch?v=placeholder1', 
       'https://images.unsplash.com/photo-1582510003544-4d00b7f7415e?auto=format&fit=crop&w=400', 
       15420 
FROM auth.users LIMIT 1;

-- Assign Admin UPI to Dummy User
UPDATE public.profiles 
SET upi_id = '9486335870@hdfcbank', whatsapp_number = '6381029380' 
WHERE id = (SELECT id FROM auth.users LIMIT 1);
