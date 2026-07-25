-- ==========================================================
-- 🧹 WACRM UNNECESSARY TABLE CLEANUP SCRIPT
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/gmahjdzqitbomtmdzlfp/sql
-- ==========================================================

-- Safely drop unused duplicate tables created earlier
DROP TABLE IF EXISTS public.lms_courses CASCADE;
DROP TABLE IF EXISTS public.unified_master_data CASCADE;
DROP TABLE IF EXISTS public.purchases CASCADE;
DROP TABLE IF EXISTS public.point_logs CASCADE;

-- Confirm core active production tables remain untouched:
-- ✅ public.profiles
-- ✅ public.contacts
-- ✅ public.whatsapp_otps
-- ✅ public.drivers
-- ✅ public.gemini_ai_history
