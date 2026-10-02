-- schema_tuto_lms.sql (Clean OCI version - tables only, no seed data or RLS)

CREATE EXTENSION IF NOT EXISTS "pg_trgm";

CREATE TABLE IF NOT EXISTS public.edu_question_bank (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_uid VARCHAR(128) UNIQUE NOT NULL,
    sequence_number INTEGER NOT NULL,
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
    exam_category VARCHAR(32) NOT NULL DEFAULT 'ALL',
    question_format VARCHAR(32) NOT NULL DEFAULT 'single_choice',
    question_text TEXT NOT NULL,
    question_text_ta TEXT,
    options JSONB NOT NULL,
    options_ta JSONB,
    correct_option VARCHAR(4) NOT NULL,
    explanation TEXT NOT NULL,
    explanation_ta TEXT,
    formula_or_law TEXT,
    blank_answer TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qbank_subject ON public.edu_question_bank (subject_code);
CREATE INDEX IF NOT EXISTS idx_qbank_seq ON public.edu_question_bank (sequence_number);
CREATE INDEX IF NOT EXISTS idx_qbank_difficulty ON public.edu_question_bank (difficulty);
CREATE INDEX IF NOT EXISTS idx_qbank_exam ON public.edu_question_bank (exam_category);

CREATE TABLE IF NOT EXISTS public.tuto_course_day_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id VARCHAR(64) NOT NULL,
    course_title VARCHAR(128) NOT NULL,
    day_number INTEGER NOT NULL,
    week_number INTEGER NOT NULL,
    day_of_week VARCHAR(16) NOT NULL,
    is_monday_holiday BOOLEAN NOT NULL DEFAULT false,
    subject VARCHAR(64) NOT NULL,
    subject_code VARCHAR(16) NOT NULL,
    chapter_title VARCHAR(128) NOT NULL,
    topic_title VARCHAR(128) NOT NULL,
    topic_tamil_title VARCHAR(128),
    concept_code VARCHAR(32) NOT NULL,
    estimated_minutes INTEGER NOT NULL DEFAULT 60,
    xp_reward INTEGER NOT NULL DEFAULT 150,
    videos JSONB NOT NULL DEFAULT '[]'::jsonb,
    notes JSONB NOT NULL DEFAULT '[]'::jsonb,
    daily_test JSONB NOT NULL DEFAULT '{}'::jsonb,
    yoga_task JSONB NOT NULL DEFAULT '{}'::jsonb,
    admin_released BOOLEAN NOT NULL DEFAULT false,
    release_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(course_id, day_number)
);

CREATE INDEX IF NOT EXISTS idx_day_plans_course ON public.tuto_course_day_plans (course_id, day_number);

CREATE TABLE IF NOT EXISTS public.tuto_student_day_progress (
    user_id VARCHAR(128) NOT NULL,
    user_phone VARCHAR(20),
    user_name VARCHAR(128),
    course_id VARCHAR(64) NOT NULL,
    day_number INTEGER NOT NULL,
    completed_steps JSONB NOT NULL DEFAULT '{}'::jsonb,
    test_score INTEGER DEFAULT 0,
    is_day_completed BOOLEAN NOT NULL DEFAULT false,
    earned_xp INTEGER NOT NULL DEFAULT 0,
    video_file_id TEXT,
    review_feedback TEXT,
    status VARCHAR(32) DEFAULT 'pending',
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, course_id, day_number)
);

CREATE INDEX IF NOT EXISTS idx_tuto_progress_user ON public.tuto_student_day_progress (user_id, course_id);
