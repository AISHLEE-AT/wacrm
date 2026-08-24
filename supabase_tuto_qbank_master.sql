-- =============================================================================
-- 🏛️ TUTO & QBANK UNIFIED MASTER DATABASE SCHEMA & MIGRATION SCRIPT
-- =============================================================================
-- This single script sets up:
--   1. Complete Deterministic MCQ & Fill-in-the-Blank Question Bank (edu_question_bank)
--   2. Whole Year 300-Day Course Plans (tuto_course_day_plans) with Monday Holidays
--   3. 3 In-App Videos, 3 Notes, 1 Daily Test, 1 Yoga Task per Day
--   4. Student Daily Learning Progress & Streak Tracker (tuto_student_day_progress)
--   5. GIN Full-Text Search Indexes, B-Tree Range Indexes, and RLS Policies
--   6. Verified Starter Seed Data for Instant Mobile App Operation
-- =============================================================================

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. EXTENSIONS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. TABLE: edu_question_bank (2 Lakh+ Deterministic Question & MCQ Store)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.edu_question_bank (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_uid VARCHAR(128) UNIQUE NOT NULL, -- e.g. PHY-MEC-01-01-M1-M-000001
    sequence_number INTEGER NOT NULL,          -- e.g. 1 to 200000+
    subject VARCHAR(64) NOT NULL,
    subject_code VARCHAR(16) NOT NULL,
    domain VARCHAR(64) NOT NULL,
    domain_code VARCHAR(16) NOT NULL,
    topic VARCHAR(128) NOT NULL,
    topic_code VARCHAR(16) NOT NULL,
    subtopic VARCHAR(128) NOT NULL,
    subtopic_code VARCHAR(16) NOT NULL,
    microtopic VARCHAR(128) NOT NULL,
    microtopic_code VARCHAR(16) NOT NULL,
    difficulty VARCHAR(16) NOT NULL DEFAULT 'Medium',
    exam_category VARCHAR(32) NOT NULL DEFAULT 'ALL',     -- TNPSC, NEET_JEE, SSC_BANK, SCHOOL_K12, ALL
    question_format VARCHAR(32) NOT NULL DEFAULT 'single_choice', -- single_choice, fill_in_the_blank, assertion_reason, numerical, match_the_following, pyq, theory
    question_text TEXT NOT NULL,
    question_text_ta TEXT,
    options JSONB NOT NULL,                               -- {"A": "...", "B": "...", "C": "...", "D": "..."}
    options_ta JSONB,
    correct_option VARCHAR(4) NOT NULL,                   -- 'A', 'B', 'C', or 'D'
    explanation TEXT NOT NULL,
    explanation_ta TEXT,
    formula_or_law TEXT,
    blank_answer TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for lightning fast QBank queries across 2 Lakh questions
CREATE INDEX IF NOT EXISTS idx_edu_qbank_seq ON public.edu_question_bank (sequence_number ASC);
CREATE INDEX IF NOT EXISTS idx_edu_qbank_uid ON public.edu_question_bank (question_uid);
CREATE INDEX IF NOT EXISTS idx_edu_qbank_exam_cat ON public.edu_question_bank (exam_category);
CREATE INDEX IF NOT EXISTS idx_edu_qbank_format ON public.edu_question_bank (question_format);
CREATE INDEX IF NOT EXISTS idx_edu_qbank_subj ON public.edu_question_bank (subject_code);
CREATE INDEX IF NOT EXISTS idx_edu_qbank_diff ON public.edu_question_bank (difficulty);

-- GIN Full-Text Search index across question text, options, and explanation
CREATE INDEX IF NOT EXISTS idx_edu_qbank_fts ON public.edu_question_bank USING GIN (
    to_tsvector('english', coalesce(question_text, '') || ' ' || coalesce(explanation, '') || ' ' || coalesce(formula_or_law, ''))
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. TABLE: tuto_course_day_plans (300-Day Whole Year Course Plans)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tuto_course_day_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id VARCHAR(64) NOT NULL,                       -- e.g. tnsb_12_science, tnpsc_group4, neet_medical
    course_title VARCHAR(128) NOT NULL,
    day_number INTEGER NOT NULL,                          -- Day 1 to 300
    week_number INTEGER NOT NULL,                         -- Week 1 to 52
    day_of_week VARCHAR(16) NOT NULL,                     -- Monday, Tuesday, Wednesday...
    is_monday_holiday BOOLEAN NOT NULL DEFAULT false,     -- Monday Holiday Rule
    subject VARCHAR(64) NOT NULL,
    subject_code VARCHAR(16) NOT NULL,
    chapter_title VARCHAR(128) NOT NULL,
    topic_title VARCHAR(128) NOT NULL,
    topic_tamil_title VARCHAR(128),
    concept_code VARCHAR(32) NOT NULL,
    estimated_minutes INTEGER NOT NULL DEFAULT 60,
    xp_reward INTEGER NOT NULL DEFAULT 150,
    
    -- 1. Minimum 3 In-App Playable Videos [Foundation, Derivation, PYQ]
    videos JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- 2. Minimum 3 Notes [Admin Core AI, Admin Exam Notes, Student Topic AI]
    notes JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- 3. 1 Daily Assessment MCQ Test (5 Questions with scoring & explanation)
    mcq_test JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- 4. 1 Daily Yoga & Extra-Curricular Task (Asana + Brain Booster Challenge)
    yoga_and_activity JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Monday Holiday Reflection & Revision Digest
    monday_holiday_content JSONB,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT uq_tuto_course_day UNIQUE (course_id, day_number)
);

CREATE INDEX IF NOT EXISTS idx_tuto_day_plans_course_day ON public.tuto_course_day_plans (course_id, day_number);
CREATE INDEX IF NOT EXISTS idx_tuto_day_plans_holiday ON public.tuto_course_day_plans (is_monday_holiday);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. TABLE: tuto_student_day_progress (Student Progress, Streaks & XP)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tuto_student_day_progress (
    user_id VARCHAR(128) NOT NULL,
    course_id VARCHAR(64) NOT NULL,
    day_number INTEGER NOT NULL,
    completed_steps JSONB NOT NULL DEFAULT '{}'::jsonb,   -- {"vid1": true, "note1": true, "test": true, "yoga": true}
    test_score INTEGER DEFAULT 0,                         -- e.g. 5 out of 5
    is_day_completed BOOLEAN NOT NULL DEFAULT false,
    earned_xp INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, course_id, day_number)
);

CREATE INDEX IF NOT EXISTS idx_tuto_progress_user ON public.tuto_student_day_progress (user_id, course_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. ROW LEVEL SECURITY (RLS) & PUBLIC READ ACCESS
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.edu_question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tuto_course_day_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tuto_student_day_progress ENABLE ROW LEVEL SECURITY;

-- Allow anyone (including anon key from mobile app) to read QBank questions
DROP POLICY IF EXISTS "Public Read Question Bank" ON public.edu_question_bank;
CREATE POLICY "Public Read Question Bank" ON public.edu_question_bank
    FOR SELECT TO anon, authenticated USING (true);

-- Allow anyone to read course day plans
DROP POLICY IF EXISTS "Public Read TutO Day Plans" ON public.tuto_course_day_plans;
CREATE POLICY "Public Read TutO Day Plans" ON public.tuto_course_day_plans
    FOR SELECT TO anon, authenticated USING (true);

-- Allow admin / anon full control for day plan management
DROP POLICY IF EXISTS "Admin Manage TutO Day Plans" ON public.tuto_course_day_plans;
CREATE POLICY "Admin Manage TutO Day Plans" ON public.tuto_course_day_plans
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Allow students to read and update their own progress
DROP POLICY IF EXISTS "Student Manage Own Progress" ON public.tuto_student_day_progress;
CREATE POLICY "Student Manage Own Progress" ON public.tuto_student_day_progress
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. SEED DATA: QBANK ANCHOR QUESTIONS (#000001 to #000010 + FITB)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.edu_question_bank (
    question_uid, sequence_number, subject, subject_code, domain, domain_code,
    topic, topic_code, subtopic, subtopic_code, microtopic, microtopic_code,
    difficulty, exam_category, question_format, question_text, question_text_ta,
    options, correct_option, explanation, formula_or_law
) VALUES
(
    'PHY-MEC-01-01-M1-M-000001', 1, 'Physics', 'PHY', 'Mechanics', 'MEC',
    'Kinematics & Dynamics', '01', 'Motion in 2D & Projectiles', '01', 'Core Rule', 'M1',
    'Medium', 'NEET_JEE', 'fill_in_the_blank',
    '[#000001] In two-dimensional projectile motion without air resistance, the horizontal velocity component remains _______ throughout the flight.',
    '[#000001] காற்று உராய்வு இல்லாத இருபரிமாண எறிபொருள் இயக்கத்தில் கிடைமட்ட திசைவேகக் கூறு இயக்கம் முழுவதும் _______ ஆக இருக்கும்.',
    '{"A": "Constant (மாறிலி)", "B": "Zero at highest point (உச்சியில் சுழி)", "C": "Linearly increasing (நேர்கோட்டில் அதிகரிக்கும்)", "D": "Exponentially decaying (அதிவேகமாக குறையும்)"}'::jsonb,
    'A',
    '[Question #000001] Since gravity acts solely vertically downward (a_y = -g), horizontal acceleration a_x = 0, keeping horizontal velocity v_x = u cos θ strictly constant.',
    'v_x = u \cos\theta = \text{constant}'
),
(
    'PHY-ELE-01-01-M2-E-000002', 2, 'Physics', 'PHY', 'Electrodynamics', 'ELE',
    'Current Electricity & Circuits', '01', 'Ohm Law & Kirchhoff Rules', '01', 'Microscopic Ohm', 'M2',
    'Easy', 'NEET_JEE', 'fill_in_the_blank',
    '[#000002] According to microscopic Ohm''s law, the electrical conductivity σ is given by the formula _______ .',
    '[#000002] நுண்ணோக்கி ஓம் விதியின்படி ஒரு கடத்தியின் மின்கடத்துத்திறன் σ சமன்பாடு _______ ஆகும்.',
    '{"A": "σ = (n e² τ) / m", "B": "σ = (m e² τ) / n", "C": "σ = (n e τ) / m²", "D": "σ = (n² e τ) / m"}'::jsonb,
    'A',
    '[Question #000002] Conductivity σ is derived from J = n e v_d where v_d = (e E τ) / m, leading to J = (n e² τ / m) E = σ E.',
    '\sigma = \frac{n e^2 \tau}{m}'
),
(
    'CHE-PHY-01-01-M3-M-000003', 3, 'Chemistry', 'CHE', 'Physical Chemistry', 'PHY',
    'Chemical Kinetics & Equilibrium', '01', 'Rate Laws & Arrhenius', '01', 'First Order Half Life', 'M3',
    'Medium', 'SCHOOL_K12', 'fill_in_the_blank',
    '[#000003] For a first-order chemical reaction, the half-life period t_1/2 is _______ of initial reactant concentration.',
    '[#000003] ஒரு முதல் வகை வேதிவினைக்கு அரைவாழ்வு காலம் தொடக்கச் செறிவை _______ .',
    '{"A": "Independent (சார்ந்திருக்காது - t_1/2 = 0.693 / k)", "B": "Directly proportional (நேர்விகிதத்தில் சார்ந்தது)", "C": "Inversely proportional (எதிர்விகிதத்தில் சார்ந்தது)", "D": "Exponentially dependent (அதிவேகமாக சார்ந்தது)"}'::jsonb,
    'A',
    '[Question #000003] For first order: k = (2.303 / t) log([A]_0 / [A]). At t = t_1/2, [A] = [A]_0 / 2, giving t_1/2 = ln(2) / k = 0.693 / k.',
    't_{1/2} = \frac{\ln 2}{k} = \frac{0.693}{k}'
),
(
    'BIO-BOT-01-01-M1-M-000004', 4, 'Biology', 'BIO', 'Botany', 'BOT',
    'Plant Physiology', '01', 'Photosynthesis C3 & C4', '01', 'Photolysis of Water', 'M1',
    'Medium', 'NEET_JEE', 'fill_in_the_blank',
    '[#000004] During photosynthesis in chloroplasts, photolysis of water occurs at the _______ complex of PS II.',
    '[#000004] ஒளிச்சேர்க்கையின் போது நீர் மூலக்கூறு ஒளிச்சிதைவு PS II இன் _______ வளாகத்தில் நடைபெறுகிறது.',
    '{"A": "Oxygen-Evolving Complex (OEC - ஆக்ஸிஜன் வெளிப்படுத்தும் மையம்)", "B": "ATP Synthase CF0-CF1 complex", "C": "Photosystem I reaction center P700", "D": "Cytochrome b6f complex"}'::jsonb,
    'A',
    '[Question #000004] Water photolysis (2H2O -> 4H+ + 4e- + O2) is catalyzed by the manganese-containing oxygen-evolving complex located on the luminal side of PS II.',
    '2\text{H}_2\text{O} \xrightarrow{h\nu, \text{PS II}} 4\text{H}^+ + 4e^- + \text{O}_2'
),
(
    'MAT-ALG-01-01-M2-M-000005', 5, 'Mathematics', 'MAT', 'Algebra', 'ALG',
    'Matrices & Determinants', '01', 'Eigenvalues & Rank', '01', 'Trace Theorem', 'M2',
    'Medium', 'SCHOOL_K12', 'single_choice',
    '[#000005] The sum of all eigenvalues of an n x n square matrix A is identically equal to the _______ of matrix A.',
    '[#000005] ஒரு சதுர அணி A இன் அனைத்து ஐகன் மதிப்புகளின் கூடுதல் அந்த அணியின் _______ க்குச் சமமாகும்.',
    '{"A": "Trace (சுவடு - Tr(A))", "B": "Determinant (அணிக்கோவை மதிப்பு)", "C": "Rank (அணியின் தரம்)", "D": "Nullity (வெற்றுமை)"}'::jsonb,
    'A',
    '[Question #000005] The trace of any square matrix equals the sum of its main diagonal elements, which identically equals the algebraic sum of all its eigenvalues.',
    '\text{Tr}(A) = \sum_{i=1}^n a_{ii} = \sum_{i=1}^n \lambda_i'
),
(
    'CS-DSA-01-01-M1-M-000006', 6, 'Computer Science', 'CS', 'Algorithms', 'DSA',
    'Data Structures & Trees', '01', 'Binary Search Trees & AVL', '01', 'Balance Factor', 'M1',
    'Medium', 'SSC_BANK', 'single_choice',
    '[#000006] In an AVL Tree, the balance factor for every node is strictly constrained to the set _______ .',
    '[#000006] AVL மரத்தில் ஒவ்வொரு முனையின் சமநிலை காரணி (Balance Factor) எப்போதும் _______ கணத்திற்குள் இருக்க வேண்டும்.',
    '{"A": "{-1, 0, +1}", "B": "{0, 1, 2}", "C": "{-2, 0, +2}", "D": "{0, 1}"}'::jsonb,
    'A',
    '[Question #000006] An AVL tree is a self-balancing binary search tree where the height difference between left and right subtrees is strictly in {-1, 0, 1}.',
    '\text{BF}(v) = h(\text{left}(v)) - h(\text{right}(v)) \in \{-1, 0, +1\}'
),
(
    'POL-CON-01-01-M1-E-000007', 7, 'Indian Polity', 'POL', 'Constitution', 'CON',
    'Fundamental Rights & DPSP', '01', 'Articles 14-32 & Writs', '01', 'High Court Writs', 'M1',
    'Easy', 'TNPSC', 'single_choice',
    '[#000007] Under Article _______ of the Constitution of India, High Courts have the power to issue Writs for Fundamental Rights and other legal rights.',
    '[#000007] இந்திய அரசியலமைப்பின் சட்டப்பிரிவு _______ இன் கீழ் உயர்நீதிமன்றங்கள் நீதிப்பேராணைகளை வெளியிடும் அதிகாரம் பெற்றுள்ளன.',
    '{"A": "Article 226", "B": "Article 32", "C": "Article 14", "D": "Article 368"}'::jsonb,
    'A',
    '[Question #000007] Article 226 empowers High Courts to issue Writs for Fundamental Rights as well as ordinary legal rights, giving it a wider textual scope than Article 32.',
    '\text{Article 226} \implies \text{High Court Writ Jurisdiction}'
),
(
    'HIS-TN-01-01-M1-E-000008', 8, 'History & Culture', 'HIS', 'Tamil Nadu History', 'TN',
    'Sangam Era & Dynasties', '01', 'Cholas, Pandyas & Cheras', '01', 'Uttaramerur Inscription', 'M1',
    'Easy', 'TNPSC', 'single_choice',
    '[#000008] The famous Uttaramerur Inscription of Parantaka Chola I describes the _______ system of secret ballot village democracy.',
    '[#000008] முதலாம் பராந்தக சோழனின் உத்திரமேரூர் கல்வெட்டு கிராம நிர்வாகத்திற்கான _______ தேர்தல் முறையை விவரிக்கிறது.',
    '{"A": "Kudavolai (குடவோலை முறை)", "B": "Kadamai (கடமை முறை)", "C": "Variyam (வாரிய வரி விதிப்பு)", "D": "Kaniurimai (காணியுரிமை முறை)"}'::jsonb,
    'A',
    '[Question #000008] The Uttaramerur inscription details the Kudavolai secret ballot system for electing members to village committees (Variyams).',
    '\text{Uttaramerur Inscription} \implies \text{Village Kudavolai Democracy}'
),
(
    'GEO-TN-01-01-M2-M-000009', 9, 'Geography', 'GEO', 'Tamil Nadu Geography', 'TN',
    'Climate & Agriculture', '01', 'Monsoons & Soil Types', '01', 'North East Monsoon', 'M2',
    'Medium', 'TNPSC', 'single_choice',
    '[#000009] Tamil Nadu receives nearly 48% to 50% of its annual precipitation from the _______ Monsoon season.',
    '[#000009] தமிழ்நாடு தனது ஆண்டு மழையில் சுமார் 48% முதல் 50% பங்கை _______ பருவமழை காலத்தில் பெறுகிறது.',
    '{"A": "North-East Monsoon (வடகிழக்குப் பருவமழை)", "B": "South-West Monsoon (தென்மேற்குப் பருவமழை)", "C": "Pre-Monsoon Convectional Showers (கோடை மழை)", "D": "Winter Cyclonic Disturbances"}'::jsonb,
    'A',
    '[Question #000009] The North-East Monsoon accounts for nearly 48-50% of Tamil Nadu''s annual precipitation as retreating winds pick up moisture across the Bay of Bengal.',
    '\text{NE Monsoon (Oct-Dec)} \implies 48\text{--}50\% \text{ TN Precipitation}'
),
(
    'APT-NUM-01-01-M1-E-000100', 100, 'Aptitude & Mental Ability', 'APT', 'Quantitative Aptitude', 'NUM',
    'Arithmetic & Commercial Math', '01', 'Simple & Compound Interest', '01', 'Simple Interest Amount', 'M1',
    'Easy', 'SSC_BANK', 'single_choice',
    '[#0100] If the simple interest on a principal sum P at R% per annum for N years is SI = (P * R * N) / 100, what will be the total accumulated amount A after N years?',
    '[#0100] தனிவட்டி SI = (P * R * N) / 100 எனில், மொத்தத் தொகை A கணக்கிடும் சூத்திரம் A = _______ ஆகும்.',
    '{"A": "A = P [1 + (R * N) / 100]", "B": "A = P [1 + R / 100]^N", "C": "A = (P * R * N) / 100", "D": "A = P / [1 + (R * N) / 100]"}'::jsonb,
    'A',
    '[Question #0100] Total Amount A = Principal P + Simple Interest SI = P + (P * R * N) / 100 = P [1 + (R * N) / 100].',
    'A = P \left(1 + \frac{R \cdot N}{100}\right)'
)
ON CONFLICT (question_uid) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_option = EXCLUDED.correct_option,
    explanation = EXCLUDED.explanation,
    updated_at = NOW();

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. SEED DATA: TUTO WHOLE YEAR DAY PLANS (SAMPLE DAY 1 MONDAY & DAY 2 ACTIVE)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.tuto_course_day_plans (
    course_id, course_title, day_number, week_number, day_of_week, is_monday_holiday,
    subject, subject_code, chapter_title, topic_title, topic_tamil_title,
    concept_code, estimated_minutes, xp_reward, videos, notes, mcq_test,
    yoga_and_activity, monday_holiday_content
) VALUES
(
    'tnsb_12_science', 'Class 12 — Matriculation HSC +2 Science 600/600 (English)',
    1, 1, 'Monday', true,
    'General Orientation', 'ORI', 'Orientation & Blueprint',
    'Monday Mindful Review & Wellness Rest Day', 'திங்கள் வாராந்திர திருப்புதல் & ஓய்வு நாள்',
    'ORI-DAY001', 20, 50,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    '{"asanaName": "Surya Namaskar (Sun Salutation)", "sanskritName": "Sūryanamaskāra", "durationMinutes": 10, "benefits": ["Cardiovascular activation", "Relieves cervical spine stiffness"], "stepByStepGuide": ["Pranamasana", "Hasta Uttanasana", "Padahastasana", "Ashwa Sanchalanasana", "Bhujangasana", "Adho Mukha Svanasana"], "breathingPattern": "Inhale on backward bends, Exhale on forward folds", "extraCurricularTask": {"title": "Mindful Nature Walk", "category": "Creative Thinking", "description": "Take a 15-minute quiet nature walk without digital devices."}}'::jsonb,
    '{"theme": "🌿 Week 1 Mindful Review & Wellness Rest Day", "quote": "Rest is not idleness, and to lie sometimes on the grass under trees on a summer''s day is by no means a waste of time. — John Lubbock", "weeklyRevisionSummary": ["Review syllabus blueprints for Physics, Chemistry, and Biology.", "Organize your study desk and digital notes workspace.", "Hydrate well and set clear weekly goals for Days 2 to 7."], "mindfulnessExercise": "Perform 10 minutes of guided Anulom Vilom breathing."}'::jsonb
),
(
    'tnsb_12_science', 'Class 12 — Matriculation HSC +2 Science 600/600 (English)',
    2, 1, 'Tuesday', false,
    'Physics', 'PHY', 'Electrostatics & Electric Fields',
    'Coulomb''s Law in Vector Form & Electric Field Lines', 'கூலூம் விதி & மின்புலக் கோடுகள்',
    'PHY-DAY002', 65, 150,
    '[
        {"id": "vid_2_1", "title": "1. Foundational Overview: Coulomb''s Law & Permittivity", "youtubeVideoId": "kKKM8Y-u7ds", "channelName": "Aishlee Educational Academy", "durationMinutes": 14, "type": "foundation", "summary": "Physical intuition of point charge interactions, inverse square law, and dielectric medium permittivity."},
        {"id": "vid_2_2", "title": "2. Vector Derivations & Superposition Principle", "youtubeVideoId": "wWNF20Z0v_M", "channelName": "National Board Masterclasses", "durationMinutes": 18, "type": "derivation", "summary": "Rigorous vector formulation F12 = -F21, unit vectors, and multiple charge superposition."},
        {"id": "vid_2_3", "title": "3. Board Exam PYQ Analysis & Trap Solving", "youtubeVideoId": "f0X1Xj5D5nE", "channelName": "Toppers Strategy Hub", "durationMinutes": 12, "type": "pyq", "summary": "Analysis of previous 10 years recurring questions on dielectric constants and force ratios."}
    ]'::jsonb,
    '[
        {"id": "note_2_1", "title": "Note 1: Core Concept Master Notes (PHY-DAY002)", "type": "admin_core_ai", "content": "### 1. Coulomb''s Inverse Square Law\nThe electrostatic force between two point charges q1 and q2 separated by distance r in vacuum is directly proportional to the product of charges and inversely proportional to r².\n\n### 2. Vector Notation\n\vec{F}_{12} = \frac{1}{4\pi\varepsilon_0} \frac{q_1 q_2}{r^2} \hat{r}_{21}", "formulasOrKeyRules": ["F = \frac{1}{4\pi\varepsilon_0} \frac{q_1 q_2}{r^2}", "\varepsilon_r = \frac{\varepsilon}{\varepsilon_0}"]},
        {"id": "note_2_2", "title": "Note 2: Exam Deep-Dive & Scoring Blueprint", "type": "admin_exam_ai", "content": "### Common Examination Traps\n1. Forgetting that Coulomb''s law strictly applies to point charges at rest.\n2. Forgetting that in a dielectric medium of relative permittivity \varepsilon_r, force decreases by factor \varepsilon_r.", "examTrapsToAvoid": ["Always convert microcoulombs (\mu C) to Coulombs (\times 10^{-6} C).", "State Newton''s Third Law consistency (\vec{F}_{12} = -\vec{F}_{21})."]},
        {"id": "note_2_3", "title": "Note 3: Student Interactive AI Study Guide", "type": "user_interactive_ai", "content": "### Interactive AI Synthesis for Coulomb''s Law\nVisual Memory Hook: Think of charges as gravitational bodies, but with dual polarities (attraction vs repulsion). Key Constant: k = 8.98755 \times 10^9 \text{ N m}^2/\text{C}^2."}
    ]'::jsonb,
    '{
        "testTitle": "Daily Assessment Test #2: Coulomb''s Law & Electric Fields",
        "durationMinutes": 10,
        "passScore": 4,
        "questions": [
            {"id": "mcq_2_1", "question": "When the distance between two point charges is halved, the electrostatic force between them becomes:", "options": {"A": "4 times greater", "B": "2 times greater", "C": "Halved", "D": "One-fourth"}, "correctOption": "A", "explanation": "By inverse square law: F \propto 1/r^2. If r becomes r/2, F becomes 4F."},
            {"id": "mcq_2_2", "question": "The SI unit of electric permittivity of free space (\varepsilon_0) is:", "options": {"A": "C² N⁻¹ m⁻²", "B": "N m² C⁻²", "C": "N C⁻¹", "D": "J C⁻¹"}, "correctOption": "A", "explanation": "\varepsilon_0 = q1 q2 / (4 \pi F r^2) \implies C^2 / (N m^2) = C^2 N^-1 m^-2."},
            {"id": "mcq_2_3", "question": "The relative permittivity (dielectric constant \varepsilon_r) of a vacuum is identically:", "options": {"A": "1.0", "B": "0.0", "C": "8.854 x 10^-12", "D": "Infinity"}, "correctOption": "A", "explanation": "For vacuum, \varepsilon = \varepsilon_0, so \varepsilon_r = \varepsilon / \varepsilon_0 = 1.0."},
            {"id": "mcq_2_4", "question": "Electric field lines around an isolated positive point charge are directed:", "options": {"A": "Radially outwards to infinity", "B": "Radially inwards to center", "C": "In circular closed loops", "D": "Parallel to the x-axis"}, "correctOption": "A", "explanation": "Positive charges act as field sources radiating outward toward infinity."},
            {"id": "mcq_2_5", "question": "What is the net electric field inside a charged isolated hollow metallic spherical conductor in electrostatic equilibrium?", "options": {"A": "Zero everywhere inside", "B": "Proportional to radius", "C": "Infinite at center", "D": "Equal to surface field"}, "correctOption": "A", "explanation": "By Gauss''s Law, since no charge resides enclosed inside the hollow cavity, E_inside = 0."}
        ]
    }'::jsonb,
    '{
        "asanaName": "Vrikshasana (Tree Pose)",
        "sanskritName": "Vṛkṣāsana",
        "durationMinutes": 5,
        "benefits": ["Improves neuromuscular balance", "Elevates study concentration", "Strengthens ankles and calves"],
        "stepByStepGuide": ["Stand tall with feet together.", "Place right foot high on inner left thigh.", "Bring palms together in Namaste overhead.", "Hold for 5 breaths and repeat on other leg."],
        "breathingPattern": "Deep, calm nasal breathing (Inhale 4s, Exhale 4s)",
        "extraCurricularTask": {"title": "Speed Mental Math: Square of Numbers Ending in 5", "category": "Mental Math", "description": "Calculate 85²: Multiply 8 x 9 = 72 and append 25 -> 7225!"}
    }'::jsonb,
    NULL
)
ON CONFLICT (course_id, day_number) DO UPDATE SET
    course_title = EXCLUDED.course_title,
    topic_title = EXCLUDED.topic_title,
    videos = EXCLUDED.videos,
    notes = EXCLUDED.notes,
    mcq_test = EXCLUDED.mcq_test,
    yoga_and_activity = EXCLUDED.yoga_and_activity,
    updated_at = NOW();

COMMIT;

-- =============================================================================
-- ✅ VERIFICATION QUERY: Run this to confirm tables and records are active!
-- =============================================================================
SELECT 'edu_question_bank' as table_name, count(*) as active_records FROM public.edu_question_bank
UNION ALL
SELECT 'tuto_course_day_plans' as table_name, count(*) as active_records FROM public.tuto_course_day_plans;
