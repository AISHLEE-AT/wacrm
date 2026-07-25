-- ==============================================================================
-- FAGO & WACRM – TeachO / TestO / TvO LMS Courses Setup Script
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard
-- This populates the `lms_courses` table with ready-to-watch courses
-- ==============================================================================

-- 1. Create lms_courses table if it doesn't exist yet
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

-- Ensure all necessary columns exist on lms_courses
ALTER TABLE public.lms_courses ADD COLUMN IF NOT EXISTS subtitle TEXT;
ALTER TABLE public.lms_courses ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT '📚';

-- 2. Enable Row Level Security (RLS) & Allow Public Read Access
ALTER TABLE public.lms_courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access on lms_courses" ON public.lms_courses;
CREATE POLICY "Allow public read access on lms_courses" 
ON public.lms_courses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public write on lms_courses" ON public.lms_courses;
CREATE POLICY "Allow public write on lms_courses" 
ON public.lms_courses FOR ALL USING (true) WITH CHECK (true);

-- 3. Seed real LMS Courses into lms_courses
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
),
(
  'panchagavya',
  'இயற்கை விவசாய பஞ்சகவ்விய & ஜீவாமிர்தம் தயாரிப்பு',
  'Organic Panchagavya & Natural Bio-Fertilizer Formulas',
  'பஞ்சகவ்வியம், ஜீவாமிர்தம் மற்றும் மீன் அமிலம் தயாரிக்கும் முறைகள், பயன்படுத்தும் அளவுகள் மற்றும் நன்மைகள்.',
  'Organic Farming',
  'Organic Guide',
  '🍃',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  '• பகுதி 1: பஞ்சகவ்விய தயாரிப்பு பொருட்கள் & நாட்கள்'||chr(10)||'• பகுதி 2: ஜீவாமிர்தம் கரைசல் தயாரிப்பு'||chr(10)||'• பகுதி 3: தெளிக்கும் முறை & பூச்சி விரட்டி தயாரிப்பு'
),
(
  'commercial_permit',
  'வணிக ஓட்டுநர் உரிமம் & பேட்ஜ் அனுமதி வழிகாட்டி',
  'Commercial Driving Permit Renewal & Road Safety Rules',
  'வணிக வாகன ஓட்டுநர் உரிமம் (Badge) புதுப்பித்தல், மருத்துவ சான்றிதழ் படிவம் 1A மற்றும் சாலை பாதுகாப்பு விதிகள்.',
  'Driver Skills',
  'Driver Guide',
  '🚛',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  '• பகுதி 1: RTO புதுப்பித்தல் விண்ணப்பம்'||chr(10)||'• பகுதி 2: மருத்துவ தகுதி சான்றிதழ் சமர்ப்பித்தல்'||chr(10)||'• பகுதி 3: ஹெவி வாகன சாலை பாதுகாப்பு விதிகள்'
),
(
  'police_constable',
  'தமிழ்நாடு காவலர் தேர்வு (TNUSRB Police Constable)',
  'TNUSRB Grade II Police Constable Prep',
  'TNUSRB இரண்டாம் நிலை காவலர் தேர்வுக்கான உளவியல், பொது அறிவு மற்றும் உடற்தகுதி தேர்வு வழிகாட்டி பாடங்கள்.',
  'Police Exam',
  'Exam Prep',
  '👮‍♂️',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  '• பகுதி 1: உளவியல் & கணித புதிர்கள்'||chr(10)||'• பகுதி 2: அறிவியல் & சமூக அறிவியல் வினாக்கள்'||chr(10)||'• பகுதி 3: உடற்தகுதி தேர்வு பயிற்சி'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  video_url = EXCLUDED.video_url,
  pdf_url = EXCLUDED.pdf_url,
  curriculum = EXCLUDED.curriculum;

-- 4. Reload schema cache
NOTIFY pgrst, 'reload schema';

SELECT '✅ LMS Courses setup complete!' AS status;
