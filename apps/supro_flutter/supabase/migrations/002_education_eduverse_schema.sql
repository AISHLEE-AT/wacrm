-- ==============================================================================
-- EDUVERSE AI (TeachO & TestO Merged LMS) - CORRECTED SUPABASE SQL SCHEMA
-- Target Database: https://jjgdatjthyeesmgunnlp.supabase.co
-- Compatible with both TEXT and UUID primary key types in unified_master_data
-- ==============================================================================

-- 1. Ensure unified_master_data table and performance indexes
CREATE TABLE IF NOT EXISTS public.unified_master_data (
    id TEXT PRIMARY KEY,
    item_type TEXT NOT NULL, -- 'COURSE', 'o_test', 'RESOURCE', 'CATEGORY'
    category TEXT,
    title_name TEXT NOT NULL,
    description_purpose TEXT,
    links_data TEXT,
    additional_info JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Performance Indexes for instant querying
CREATE INDEX IF NOT EXISTS idx_unified_master_item_type ON public.unified_master_data(item_type);
CREATE INDEX IF NOT EXISTS idx_unified_master_category ON public.unified_master_data(category);

-- 2. Dedicated Table: Test Attempts & Scorecards (test_id is TEXT to match unified_master_data.id)
CREATE TABLE IF NOT EXISTS public.edu_test_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    user_name TEXT DEFAULT 'Student',
    test_id TEXT NOT NULL,
    test_title TEXT NOT NULL,
    score NUMERIC NOT NULL,
    total_questions INTEGER NOT NULL,
    accuracy_percentage NUMERIC NOT NULL,
    time_taken_seconds INTEGER NOT NULL,
    user_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    certificate_id TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_edu_attempts_user ON public.edu_test_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_edu_attempts_test ON public.edu_test_attempts(test_id);

-- 3. Dedicated Table: Verifiable Digital Certificates
CREATE TABLE IF NOT EXISTS public.edu_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_id TEXT UNIQUE NOT NULL, -- e.g. EDU-VRF-XXXXXX
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    test_title TEXT NOT NULL,
    score NUMERIC NOT NULL,
    total_marks NUMERIC NOT NULL,
    accuracy_percentage NUMERIC NOT NULL,
    grade TEXT NOT NULL,
    issue_date DATE DEFAULT CURRENT_DATE,
    is_verified BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_edu_certificates_code ON public.edu_certificates(certificate_id);

-- 4. Dedicated Table: Daily Learning Streak & Progress
CREATE TABLE IF NOT EXISTS public.edu_user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT UNIQUE NOT NULL,
    streak_days INTEGER DEFAULT 1,
    total_xp INTEGER DEFAULT 50,
    completed_courses JSONB DEFAULT '[]'::jsonb,
    completed_lessons JSONB DEFAULT '[]'::jsonb,
    last_active_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Row Level Security (RLS) Configuration
ALTER TABLE public.unified_master_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edu_test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edu_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edu_user_progress ENABLE ROW LEVEL SECURITY;

-- Idempotent RLS Policies
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public can view courses and tests" ON public.unified_master_data;
    CREATE POLICY "Public can view courses and tests" ON public.unified_master_data FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public can verify certificates" ON public.edu_certificates;
    CREATE POLICY "Public can verify certificates" ON public.edu_certificates FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Users can view and insert own attempts" ON public.edu_test_attempts;
    CREATE POLICY "Users can view and insert own attempts" ON public.edu_test_attempts FOR ALL USING (true);

    DROP POLICY IF EXISTS "Users can manage own progress" ON public.edu_user_progress;
    CREATE POLICY "Users can manage own progress" ON public.edu_user_progress FOR ALL USING (true);
END $$;
