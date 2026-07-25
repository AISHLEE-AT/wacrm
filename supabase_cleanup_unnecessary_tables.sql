-- ==============================================================================
-- FAGO & WACRM – UNNECESSARY TABLE REMOVAL SCRIPT
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard
-- Removes all duplicate/unnecessary tables created during previous testing.
-- Since WACRM directly loads/embeds live Aishlee-web modules (thamizhan.vercel.app),
-- WACRM does not require these duplicate tables.
-- ==============================================================================

-- 1. Drop foreign key constraints on child tables first
DO $$
BEGIN
  ALTER TABLE IF EXISTS public.course_progress DROP CONSTRAINT IF EXISTS course_progress_course_id_fkey;
  ALTER TABLE IF EXISTS public.lms_contents DROP CONSTRAINT IF EXISTS lms_contents_course_id_fkey;
  ALTER TABLE IF EXISTS public.user_lessons DROP CONSTRAINT IF EXISTS user_lessons_course_id_fkey;
  ALTER TABLE IF EXISTS public.purchases DROP CONSTRAINT IF EXISTS purchases_item_id_fkey;
  ALTER TABLE IF EXISTS public.certificate_requests DROP CONSTRAINT IF EXISTS certificate_requests_course_id_fkey;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 2. Drop unnecessary duplicate tables cleanly
DROP TABLE IF EXISTS public.lms_courses CASCADE;
DROP TABLE IF EXISTS public.unified_master_data CASCADE;
DROP TABLE IF EXISTS public.purchases CASCADE;
DROP TABLE IF EXISTS public.point_logs CASCADE;

-- 3. Reload PostgREST API schema cache
NOTIFY pgrst, 'reload schema';

SELECT '=== ✅ Unnecessary tables removed cleanly! Supabase DB is now clean! ===' AS status;
