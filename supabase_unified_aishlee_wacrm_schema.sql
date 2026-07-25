-- ==============================================================================
-- FAGO & WACRM – UNIFIED AISHLEE-WEB & WACRM DATABASE SCHEMA & SEED SCRIPT
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard
-- This connects & merges ALL 10 Super App modules into a single database.
-- Defensive: Drops NOT NULL constraints on legacy columns (data, type, etc.).
-- ==============================================================================

-- ── 0. CONVERT ID COLUMNS TO TEXT & DISCOVER ALL REFERENCING FOREIGN KEYS ────
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop any foreign key referencing lms_courses
    FOR r IN (
        SELECT tc.table_schema, tc.table_name, tc.constraint_name, kcu.column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND ccu.table_name = 'lms_courses'
    ) LOOP
        EXECUTE format('ALTER TABLE %I.%I DROP CONSTRAINT IF EXISTS %I;', r.table_schema, r.table_name, r.constraint_name);
        EXECUTE format('ALTER TABLE %I.%I ALTER COLUMN %I TYPE TEXT USING %I::TEXT;', r.table_schema, r.table_name, r.column_name, r.column_name);
    END LOOP;

    -- Drop any foreign key referencing unified_master_data
    FOR r IN (
        SELECT tc.table_schema, tc.table_name, tc.constraint_name, kcu.column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND ccu.table_name = 'unified_master_data'
    ) LOOP
        EXECUTE format('ALTER TABLE %I.%I DROP CONSTRAINT IF EXISTS %I;', r.table_schema, r.table_name, r.constraint_name);
        EXECUTE format('ALTER TABLE %I.%I ALTER COLUMN %I TYPE TEXT USING %I::TEXT;', r.table_schema, r.table_name, r.column_name, r.column_name);
    END LOOP;

    -- Safely alter column types only if columns exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lms_courses' AND column_name = 'id') THEN
        ALTER TABLE public.lms_courses ALTER COLUMN id DROP IDENTITY IF EXISTS;
        ALTER TABLE public.lms_courses ALTER COLUMN id TYPE TEXT USING id::TEXT;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lms_courses' AND column_name = 'curriculum') THEN
        ALTER TABLE public.lms_courses ALTER COLUMN curriculum TYPE TEXT USING curriculum::TEXT;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'unified_master_data' AND column_name = 'id') THEN
        ALTER TABLE public.unified_master_data ALTER COLUMN id DROP IDENTITY IF EXISTS;
        ALTER TABLE public.unified_master_data ALTER COLUMN id TYPE TEXT USING id::TEXT;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'unified_master_data' AND column_name = 'links_data') THEN
        ALTER TABLE public.unified_master_data ALTER COLUMN links_data TYPE TEXT USING links_data::TEXT;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'unified_master_data' AND column_name = 'metadata') THEN
        ALTER TABLE public.unified_master_data ALTER COLUMN metadata TYPE TEXT USING metadata::TEXT;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'unified_master_data' AND column_name = 'type') THEN
        ALTER TABLE public.unified_master_data ALTER COLUMN "type" DROP NOT NULL;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'unified_master_data' AND column_name = 'data') THEN
        ALTER TABLE public.unified_master_data ALTER COLUMN "data" DROP NOT NULL;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchases' AND column_name = 'id') THEN
        ALTER TABLE public.purchases ALTER COLUMN id DROP IDENTITY IF EXISTS;
        ALTER TABLE public.purchases ALTER COLUMN id TYPE TEXT USING id::TEXT;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'point_logs' AND column_name = 'id') THEN
        ALTER TABLE public.point_logs ALTER COLUMN id DROP IDENTITY IF EXISTS;
        ALTER TABLE public.point_logs ALTER COLUMN id TYPE TEXT USING id::TEXT;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'id') THEN
        ALTER TABLE public.notifications ALTER COLUMN id DROP IDENTITY IF EXISTS;
        ALTER TABLE public.notifications ALTER COLUMN id TYPE TEXT USING id::TEXT;
    END IF;
END $$;

-- ── 1. PROFILES TABLE ────────────────────────────────────────────────────────
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

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS main_category TEXT DEFAULT 'Traveller';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS default_module TEXT DEFAULT 'rideo';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_complete BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pincode TEXT DEFAULT '641001';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by TEXT DEFAULT '9344532738';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS upi_id TEXT;

-- ── 2. LMS_COURSES TABLE (TeachO, TestO, TvO Courses & Video Guides) ─────────
CREATE TABLE IF NOT EXISTS public.lms_courses (
    id TEXT PRIMARY KEY,
    title TEXT,
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

ALTER TABLE public.lms_courses ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.lms_courses ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.lms_courses ADD COLUMN IF NOT EXISTS subtitle TEXT;
ALTER TABLE public.lms_courses ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE public.lms_courses ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';
ALTER TABLE public.lms_courses ADD COLUMN IF NOT EXISTS sub_category TEXT;
ALTER TABLE public.lms_courses ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'Beginner';
ALTER TABLE public.lms_courses ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0;
ALTER TABLE public.lms_courses ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.lms_courses ADD COLUMN IF NOT EXISTS pdf_url TEXT;
ALTER TABLE public.lms_courses ADD COLUMN IF NOT EXISTS curriculum TEXT;
ALTER TABLE public.lms_courses ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT '📚';
ALTER TABLE public.lms_courses ADD COLUMN IF NOT EXISTS admin_id TEXT;

-- ── 3. UNIFIED_MASTER_DATA TABLE (Mandi Rates, RentO, TourO, ToolsO, TaskO) ───
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

ALTER TABLE public.unified_master_data ADD COLUMN IF NOT EXISTS item_type TEXT;
ALTER TABLE public.unified_master_data ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE public.unified_master_data ADD COLUMN IF NOT EXISTS data TEXT DEFAULT '{}';
ALTER TABLE public.unified_master_data ADD COLUMN IF NOT EXISTS title_name TEXT;
ALTER TABLE public.unified_master_data ADD COLUMN IF NOT EXISTS description_purpose TEXT;
ALTER TABLE public.unified_master_data ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.unified_master_data ADD COLUMN IF NOT EXISTS permanent_pincode TEXT DEFAULT '641001';
ALTER TABLE public.unified_master_data ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'APPROVED';
ALTER TABLE public.unified_master_data ADD COLUMN IF NOT EXISTS links_data TEXT;
ALTER TABLE public.unified_master_data ADD COLUMN IF NOT EXISTS additional_info TEXT;
ALTER TABLE public.unified_master_data ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'ta';
ALTER TABLE public.unified_master_data ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.unified_master_data ADD COLUMN IF NOT EXISTS metadata TEXT;

-- ── 4. DEALS TABLE (DealO 5km Radius Hyperlocal Marketplace) ─────────────────
CREATE TABLE IF NOT EXISTS public.deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  title TEXT,
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

ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0;
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'sell';
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS pincode TEXT DEFAULT '641001';
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS seller_name TEXT;
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS seller_phone TEXT;
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS upi_id TEXT;

-- ── 5. DRIVERS TABLE (DriveO Driver Fleet & Verification) ────────────────────
CREATE TABLE IF NOT EXISTS public.drivers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  driver_name TEXT,
  mobile_number TEXT,
  phone TEXT,
  whatsapp TEXT,
  vehicle_number TEXT,
  vehicle_type TEXT,
  vehicle_category TEXT,
  driving_license TEXT DEFAULT 'PENDING-VERIFICATION',
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

-- ── 6. CONTACTS TABLE (WhatsApp CRM Leads) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  name TEXT,
  phone TEXT,
  email TEXT,
  pincode TEXT DEFAULT '641001',
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS phone TEXT;

-- ── 7. PURCHASES TABLE ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.purchases (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    item_id TEXT,
    item_type TEXT,
    transaction_id TEXT,
    buyer_name TEXT,
    buyer_contact TEXT,
    status TEXT DEFAULT 'COMPLETED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 8. POINT_LOGS TABLE ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.point_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    action TEXT,
    points_awarded INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 9. NOTIFICATIONS TABLE ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    title TEXT,
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 10. ENABLE ROW LEVEL SECURITY & PUBLIC PERMISSIVE POLICIES ────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unified_master_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles all" ON public.profiles;
CREATE POLICY "Public profiles all" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public lms_courses all" ON public.lms_courses;
CREATE POLICY "Public lms_courses all" ON public.lms_courses FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public master_data all" ON public.unified_master_data;
CREATE POLICY "Public master_data all" ON public.unified_master_data FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public deals all" ON public.deals;
CREATE POLICY "Public deals all" ON public.deals FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public drivers all" ON public.drivers;
CREATE POLICY "Public drivers all" ON public.drivers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public contacts all" ON public.contacts;
CREATE POLICY "Public contacts all" ON public.contacts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public purchases all" ON public.purchases;
CREATE POLICY "Public purchases all" ON public.purchases FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public point_logs all" ON public.point_logs;
CREATE POLICY "Public point_logs all" ON public.point_logs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public notifications all" ON public.notifications;
CREATE POLICY "Public notifications all" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

-- ── 11. SEED UNIFIED SAMPLE DATA FOR ALL MODULES ──────────────────────────────

-- Seed LMS Courses (TeachO, TestO, TvO)
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
),
(
  'drip_maint',
  'சொட்டு நீர் பாசனம் & பம்ப் பராமரிப்பு',
  'Drip Irrigation Filter Cleaning & Submersible Motor Fixes',
  'சொட்டு நீர் பாசன பில்டர் அடைப்பு நீக்குதல், வென்ச்சுரி உரம் செலுத்துதல் மற்றும் சப்மர்சிபிள் பம்ப் பராமரிப்பு செய்முறை.',
  'Water Management',
  'Practical Guide',
  '💧',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  '• பகுதி 1: டிஸ்க் பில்டர் ஆசிட் வாஷ்'||chr(10)||'• பகுதி 2: வென்ச்சுரி இன்ஜெக்டர் இயக்கம்'||chr(10)||'• பகுதி 3: மோட்டார் ஸ்டார்ட்டர் பழுதுநீக்கம்'
)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, video_url = EXCLUDED.video_url;

-- Seed Unified Master Data (Mandi Prices, RentO, TourO, ToolsO, TaskO)
INSERT INTO public.unified_master_data (id, item_type, type, data, title_name, description_purpose, category, permanent_pincode, links_data)
VALUES
('mandi_tomato_641001', 'MANDI_PRICE', 'MANDI_PRICE', '{}', 'தக்காளி (Tomato) - உழவர் சந்தை விலை', '₹35 - ₹42 / கிலோ (கோயம்புத்தூர் உழவர் சந்தை தினசரி விலை)', 'Vegetables', '641001', 'https://watscrm.vercel.app/mandi'),
('mandi_onion_641001',  'MANDI_PRICE', 'MANDI_PRICE', '{}', 'வெங்காயம் (Onion) - உழவர் சந்தை விலை',  '₹45 - ₹55 / கிலோ (சின்ன வெங்காயம் & பல்லாரி விலை)',      'Vegetables', '641001', 'https://watscrm.vercel.app/mandi'),
('rento_tractor_55hp',  'RENTO_EQUIPMENT', 'RENTO_EQUIPMENT', '{}', 'Mahindra 575 DI Tractor (55 HP)', 'ரோட்டவேட்டர் & கலப்பை வாடகைக்கு - ₹900 / மணிநேரம்',    'Machinery',  '641001', 'https://watscrm.vercel.app/rento'),
('touro_palani_temple', 'TOURO_SPOT', 'TOURO_SPOT', '{}', 'பழனி தண்டாயுதபாணி சுவாமி திருக்கோயில்', 'அருள்மிகு பழனி முருகன் கோயில் தரிசனம் & தங்கும் வசதி',    'Spiritual',  '624601', 'https://watscrm.vercel.app/touro'),
('tool_seed_calc',      'TOOL', 'TOOL', '{}', 'விதை & உரம் கணக்கிடும் கருவி (Seed Calc)', 'நிலப்பரப்புக்கு தேவையான விதை மற்றும் உரம் அளவு கணக்கீடு', 'Agri Tool',  '641001', 'https://watscrm.vercel.app/toolso'),
('task_field_survey',   'TASK', 'TASK', '{}', 'தினசரி கள ஆய்வு & உழவர் சந்தை பதிவு பணி', 'TNPSC மாதிரி தேர்வு & உழவர் சந்தை தினசரி பதிவு படிவம்', 'Survey Task','641001', 'https://forms.gle/sample_tnpsc_registration')
ON CONFLICT (id) DO UPDATE SET title_name = EXCLUDED.title_name;

-- ── 12. FAST PERFORMANCE INDEXES ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_lms_courses_cat ON public.lms_courses(category);
CREATE INDEX IF NOT EXISTS idx_master_item_type ON public.unified_master_data(item_type);
CREATE INDEX IF NOT EXISTS idx_deals_pincode ON public.deals(pincode);
CREATE INDEX IF NOT EXISTS idx_drivers_user ON public.drivers(user_id);

-- ── 13. RELOAD API SCHEMA CACHE ───────────────────────────────────────────────
NOTIFY pgrst, 'reload schema';

SELECT '=== ✅ Unified Aishlee-Web & WACRM Schema Update Complete! ===' AS status;
