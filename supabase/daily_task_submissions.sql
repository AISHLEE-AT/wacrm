-- ============================================================================
-- SUPRO DAILY TASK SUBMISSIONS & GOOGLE DRIVE VIDEO MAPPING TABLE
-- Database: Main SuprO Supabase (https://gmahjdzqitbomtmdzlfp.supabase.co)
-- ============================================================================

-- 1. Ensure columns exist on profiles table for Google Drive account mapping
ALTER TABLE IF EXISTS public.profiles
ADD COLUMN IF NOT EXISTS google_drive_connected BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS google_account_email TEXT,
ADD COLUMN IF NOT EXISTS google_drive_folder_id TEXT;

-- 2. Create daily_task_submissions table
CREATE TABLE IF NOT EXISTS public.daily_task_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_phone TEXT NOT NULL,
    user_name TEXT DEFAULT 'SuprO Student',
    course_id TEXT NOT NULL,
    course_title TEXT,
    day_number INTEGER NOT NULL,
    topic_title TEXT NOT NULL,
    feedback_text TEXT,
    video_drive_file_id TEXT NOT NULL,
    video_drive_link TEXT NOT NULL,
    rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewed', 'approved', 'rejected')),
    admin_remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create indexes for fast retrieval by user phone, course, day, and status
CREATE INDEX IF NOT EXISTS idx_task_submissions_phone ON public.daily_task_submissions(user_phone);
CREATE INDEX IF NOT EXISTS idx_task_submissions_course_day ON public.daily_task_submissions(course_id, day_number);
CREATE INDEX IF NOT EXISTS idx_task_submissions_status ON public.daily_task_submissions(status);
CREATE INDEX IF NOT EXISTS idx_task_submissions_created_at ON public.daily_task_submissions(created_at DESC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.daily_task_submissions ENABLE ROW LEVEL SECURITY;

-- 5. Drop policies if they already exist, then recreate (clean idempotent syntax)
DROP POLICY IF EXISTS "Allow read all submissions" ON public.daily_task_submissions;
CREATE POLICY "Allow read all submissions" ON public.daily_task_submissions
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert submissions" ON public.daily_task_submissions;
CREATE POLICY "Allow insert submissions" ON public.daily_task_submissions
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update submissions" ON public.daily_task_submissions;
CREATE POLICY "Allow update submissions" ON public.daily_task_submissions
    FOR UPDATE USING (true);
