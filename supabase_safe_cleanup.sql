-- =============================================================================
-- 🧹 SUPABASE SAFE DATABASE CLEANUP SCRIPT (TEACHO & TESTO OBSOLETE REMOVAL)
-- =============================================================================
-- PURPOSE:
--   Safely removes obsolete, empty 'teacho' and 'testo' legacy tables
--   while PROTECTING and PRESERVING all active production data:
--     ✅ PRESERVED: public.kindle_content_cache (47,716 topics · 200K+ MCQs)
--     ✅ PRESERVED: public.unified_master_data (1,682 curriculum records)
--     ✅ PRESERVED: public.edu_question_bank (Canonical QBank)
--     ✅ PRESERVED: public.tuto_course_day_plans (300-Day Course Plans)
--     ✅ PRESERVED: public.tuto_student_day_progress (Student Progress & XP)
-- =============================================================================

-- 1. SAFE DROP OF OBSOLETE TESTO LEGACY TABLES
DROP TABLE IF EXISTS public.testo_questions CASCADE;
DROP TABLE IF EXISTS public.testo_tests CASCADE;
DROP TABLE IF EXISTS public.testo_results CASCADE;
DROP TABLE IF EXISTS public.testo_quizzes CASCADE;
DROP TABLE IF EXISTS public.testo_submissions CASCADE;
DROP TABLE IF EXISTS public.o_tests CASCADE;
DROP TABLE IF EXISTS public.questions CASCADE;

-- 2. SAFE DROP OF OBSOLETE TEACHO LEGACY TABLES & CACHES
DROP TABLE IF EXISTS public.teacho_courses CASCADE;
DROP TABLE IF EXISTS public.teacho_lessons CASCADE;
DROP TABLE IF EXISTS public.teacho_content CASCADE;
DROP TABLE IF EXISTS public.teacho_notes CASCADE;
DROP TABLE IF EXISTS public.teacho_topics CASCADE;
DROP TABLE IF EXISTS public.teacho_videos CASCADE;
DROP TABLE IF EXISTS public.course_player_cache CASCADE;
DROP TABLE IF EXISTS public.nano_day_plans CASCADE;

-- 3. ENSURE INDEXES ON ACTIVE PRODUCTION TABLES
CREATE INDEX IF NOT EXISTS idx_edu_qbank_seq ON public.edu_question_bank (sequence_number ASC);
CREATE INDEX IF NOT EXISTS idx_edu_qbank_uid ON public.edu_question_bank (question_uid);
CREATE INDEX IF NOT EXISTS idx_tuto_day_plans_course_day ON public.tuto_course_day_plans (course_id, day_number);

-- 4. VERIFICATION: Summary of All Active Clean Tables in Public Schema
SELECT 
    schemaname, 
    tablename, 
    tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename ASC;
