-- ==============================================================================
-- PART 2: FRESH FAGO & WACRM SUPER APP DATABASE CREATION (STEP-BY-STEP)
-- Run this in your Supabase SQL Editor AFTER running Part 1.
-- Creates only the clean, essential tables required by the current app.
-- ==============================================================================

-- ==============================================================================
-- STEP 1: USER PROFILES & AUTOMATIC SIGNUP TRIGGER
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    whatsapp TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user',
    main_category TEXT DEFAULT 'Traveller',
    default_module TEXT DEFAULT 'rideo',
    profile_complete BOOLEAN DEFAULT false,
    location TEXT,
    address TEXT,
    pincode TEXT DEFAULT '641001',
    referred_by TEXT DEFAULT '9344532738',
    points INTEGER DEFAULT 0,
    upi_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger Function to Automatically Create Profile when User Signs Up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    phone, 
    whatsapp, 
    role, 
    main_category, 
    pincode
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'FAGO User'),
    COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.phone, NEW.raw_user_meta_data->>'whatsapp', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    COALESCE(NEW.raw_user_meta_data->>'main_category', 'Traveller'),
    COALESCE(NEW.raw_user_meta_data->>'pincode', '641001')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach Signup Trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ==============================================================================
-- STEP 2: DRIVEO & RIDEO (DRIVERS & FLEET BOOKINGS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    driver_name TEXT,
    mobile_number TEXT,
    phone TEXT,
    whatsapp TEXT,
    vehicle_number TEXT,
    vehicle_type TEXT,
    vehicle_category TEXT,
    driving_license TEXT DEFAULT 'VERIFIED',
    upi_id TEXT,
    status TEXT DEFAULT 'online',
    pincode TEXT DEFAULT '641001',
    is_online BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT true,
    verification_status TEXT DEFAULT 'approved',
    pickup_latitude NUMERIC,
    pickup_longitude NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
    passenger_name TEXT,
    passenger_phone TEXT,
    pickup_location TEXT,
    drop_location TEXT,
    fare NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'SEARCHING',
    pincode TEXT DEFAULT '641001',
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ==============================================================================
-- STEP 3: TEACHO, TESTO, TVO & LMS COURSES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.lms_courses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    subtitle TEXT,
    thumbnail_url TEXT,
    category TEXT DEFAULT 'General',
    sub_category TEXT,
    level TEXT DEFAULT 'Beginner',
    price NUMERIC DEFAULT 0,
    video_url TEXT,
    pdf_url TEXT,
    curriculum TEXT,
    icon TEXT DEFAULT '📚',
    admin_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.testo_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER DEFAULT 60,
    total_marks INTEGER DEFAULT 100,
    status TEXT DEFAULT 'PUBLISHED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tvo_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT,
    thumbnail_url TEXT,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ==============================================================================
-- STEP 4: UNIFIED MASTER DATA & MARKETPLACE (MANDI, RENTO, TOURO, TASK)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.unified_master_data (
    id TEXT PRIMARY KEY,
    item_type TEXT,
    type TEXT,
    data TEXT DEFAULT '{}',
    title_name TEXT,
    description_purpose TEXT,
    category TEXT,
    permanent_pincode TEXT DEFAULT '641001',
    approval_status TEXT DEFAULT 'APPROVED',
    links_data TEXT,
    additional_info TEXT,
    language TEXT DEFAULT 'ta',
    description TEXT,
    metadata TEXT,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    title TEXT NOT NULL,
    price NUMERIC DEFAULT 0,
    type TEXT DEFAULT 'sell',
    location TEXT,
    pincode TEXT DEFAULT '641001',
    seller_name TEXT,
    seller_phone TEXT,
    upi_id TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.touro (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tour_name TEXT NOT NULL,
    destination TEXT,
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'CONFIRMED',
    booking_details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.moneyo_savings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    scheme_name TEXT NOT NULL,
    amount NUMERIC(10,2) DEFAULT 0,
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tasko_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'TODO',
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ==============================================================================
-- STEP 5: WHATSAPP CRM & CONTACTS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    name TEXT,
    phone TEXT,
    email TEXT,
    pincode TEXT DEFAULT '641001',
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ==============================================================================
-- STEP 6: PURCHASES, POINT LOGS & NOTIFICATIONS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.purchases (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    item_id TEXT,
    item_type TEXT,
    transaction_id TEXT,
    buyer_name TEXT,
    buyer_contact TEXT,
    amount NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'COMPLETED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.point_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    action TEXT,
    points_awarded INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    title TEXT,
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ==============================================================================
-- STEP 7: GEMINI AI CONVERSATIONS & HISTORY
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.gemini_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    prompt TEXT,
    response TEXT,
    module TEXT DEFAULT 'general',
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ==============================================================================
-- STEP 8: ROW LEVEL SECURITY & PUBLIC PERMISSIVE POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testo_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tvo_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unified_master_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.touro ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moneyo_savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasko_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gemini_conversations ENABLE ROW LEVEL SECURITY;

-- Apply Allow-All Public Permissive Policies
CREATE POLICY "Public profiles all" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public drivers all" ON public.drivers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public rides all" ON public.rides FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public lms_courses all" ON public.lms_courses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public testo_assessments all" ON public.testo_assessments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public tvo_videos all" ON public.tvo_videos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public master_data all" ON public.unified_master_data FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public deals all" ON public.deals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public touro all" ON public.touro FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public moneyo_savings all" ON public.moneyo_savings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public tasko_tasks all" ON public.tasko_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public contacts all" ON public.contacts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public purchases all" ON public.purchases FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public point_logs all" ON public.point_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public notifications all" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public gemini_conversations all" ON public.gemini_conversations FOR ALL USING (true) WITH CHECK (true);


-- ==============================================================================
-- STEP 9: PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_drivers_pincode ON public.drivers(pincode);
CREATE INDEX IF NOT EXISTS idx_deals_pincode ON public.deals(pincode);
CREATE INDEX IF NOT EXISTS idx_lms_courses_cat ON public.lms_courses(category);
CREATE INDEX IF NOT EXISTS idx_master_item_type ON public.unified_master_data(item_type);


-- ==============================================================================
-- STEP 10: SEED HIGH-QUALITY TEST DATA (FRESH STARTER DATA)
-- ==============================================================================

-- 1. LMS Courses (TeachO, TestO, TvO)
INSERT INTO public.lms_courses (id, title, subtitle, description, category, level, icon, video_url, pdf_url, curriculum)
VALUES
(
  'tnpsc_group4',
  'TNPSC Group 4 & Group 2 பொதுத் தமிழ் & பொது அறிவு',
  'Complete TNPSC Tamil & General Studies Mastery Course',
  'TNPSC தேர்வுக்கான 6 முதல் 10-ஆம் வகுப்பு வரையிலான சமச்சீர் கல்வி தமிழ் வினா-விடைகள், வரலாறு, அரசியல் மற்றும் கணிதம் பாடக் குறிப்புகள்.',
  'TNPSC Exam',
  'Beginner to Advanced',
  '📚',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  '• அலகு 1: பொதுத் தமிழ் இலக்கணம் & இலக்கியம்'||chr(10)||'• அலகு 2: இந்திய தேசிய இயக்கம் & தமிழ்நாடு வரலாறு'||chr(10)||'• அலகு 3: கணிதம் & திறனறி தேர்வு (Aptitude)'
),
(
  'computer_ops',
  'கணினி செயல்பாடுகள் & அலுவலக தொகுப்பு - மேம்பட்ட பயிற்சி',
  'COMPUTER OPERATIONS & OFFICE SUITE - ADVANCED',
  'கணினி இயக்க முறைமை, MS Office, தமிழ் தட்டச்சு மற்றும் இணைய பயன்பாடுகள் பற்றிய முழுமையான தொடக்கநிலை பாடங்கள்.',
  'Tech & Careers',
  'Advanced',
  '💻',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  '• 1. Introduction to Computer & Windows OS'||chr(10)||'• 2. MS Word & Tamil Typing Mastery'||chr(10)||'• 3. MS Excel Data Analysis & Formatting'
),
(
  'tractor_depth',
  'டிராக்டர் உழவு ஆழம் & ரோட்டவேட்டர் அமைத்தல்',
  'Tractor Rotavator & Disc Plough Depth Calibration Guide',
  'டிராக்டர் ரோட்டவேட்டர் ஆழம் அமைப்பது எப்படி? டீசல் சிக்கனம் மற்றும் மண் உழவு நுட்பங்கள் பற்றிய நேரடி வீடியோ வழிகாட்டி.',
  'Agri Machinery',
  'Practical Guide',
  '🚜',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  '• பகுதி 1: ரோட்டவேட்டர் பிளேடு அமைவு'||chr(10)||'• பகுதி 2: 3-பாயிண்ட் ஹிட்ச் ஆழம் கட்டுப்பாடு'||chr(10)||'• பகுதி 3: எரிபொருள் சிக்கன உழவு நுட்பம்'
)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, video_url = EXCLUDED.video_url;

-- 2. Unified Master Data (Mandi Prices, RentO, TourO, Tools, Tasks)
INSERT INTO public.unified_master_data (id, item_type, type, data, title_name, description_purpose, category, permanent_pincode, links_data)
VALUES
('mandi_tomato_641001', 'MANDI_PRICE', 'MANDI_PRICE', '{}', 'தக்காளி (Tomato) - உழவர் சந்தை விலை', '₹35 - ₹42 / கிலோ (கோயம்புத்தூர் உழவர் சந்தை தினசரி விலை)', 'Vegetables', '641001', 'https://watscrm.vercel.app/mandi'),
('mandi_onion_641001',  'MANDI_PRICE', 'MANDI_PRICE', '{}', 'வெங்காயம் (Onion) - உழவர் சந்தை விலை',  '₹45 - ₹55 / கிலோ (சின்ன வெங்காயம் & பல்லாரி விலை)',      'Vegetables', '641001', 'https://watscrm.vercel.app/mandi'),
('rento_tractor_55hp',  'RENTO_EQUIPMENT', 'RENTO_EQUIPMENT', '{}', 'Mahindra 575 DI Tractor (55 HP)', 'ரோட்டவேட்டர் & கலப்பை வாடகைக்கு - ₹900 / மணிநேரம்',    'Machinery',  '641001', 'https://watscrm.vercel.app/rento'),
('touro_palani_temple', 'TOURO_SPOT', 'TOURO_SPOT', '{}', 'பழனி தண்டாயுதபாணி சுவாமி திருக்கோயில்', 'அருள்மிகு பழனி முருகன் கோயில் தரிசனம் & தங்கும் வசதி',    'Spiritual',  '624601', 'https://watscrm.vercel.app/touro'),
('tool_seed_calc',      'TOOL', 'TOOL', '{}', 'விதை & உரம் கணக்கிடும் கருவி (Seed Calc)', 'நிலப்பரப்புக்கு தேவையான விதை மற்றும் உரம் அளவு கணக்கீடு', 'Agri Tool',  '641001', 'https://watscrm.vercel.app/toolso')
ON CONFLICT (id) DO UPDATE SET title_name = EXCLUDED.title_name;

-- 3. DealO Hyperlocal Marketplace Test Deals
INSERT INTO public.deals (title, price, type, location, pincode, seller_name, seller_phone, upi_id, status)
VALUES
('Fresh Organic Farm Tomatoes (25 Kg Box)', 850, 'sell', 'Coimbatore', '641001', 'Arun Kumar', '9486335870', '9486335870@hdfcbank', 'active'),
('TVS Jupiter 125 Scooter (2023 Model)', 65000, 'sell', 'Gandhipuram, Coimbatore', '641001', 'Senthil Nathan', '9344532738', '9344532738@ybl', 'active');

-- Reload Schema Cache
NOTIFY pgrst, 'reload schema';

SELECT '=== 🎉 FRESH FAGO & WACRM DATABASE SUCCESSFULLY CREATED & SEEDED! ===' AS status;
