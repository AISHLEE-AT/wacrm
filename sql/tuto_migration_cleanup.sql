-- ============================================================================
-- Migration: TutO Module Consolidation & TeachO / TestO Cleanup
-- Database: LMS Supabase (jjgdatjthyeesmgunnlp.supabase.co)
-- 
-- Run this in: Supabase Dashboard > SQL Editor (on the LMS project)
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- Section 1: Update Profiles Default Module
-- ----------------------------------------------------------------------------
UPDATE profiles 
SET default_module = '/tuto' 
WHERE default_module IN ('/teacho', '/testo');

-- ----------------------------------------------------------------------------
-- Section 2: Update Unified Master Data Item Types
-- ----------------------------------------------------------------------------
UPDATE unified_master_data 
SET item_type = REPLACE(REPLACE(item_type, 'teacho_', 'tuto_'), 'testo_', 'tuto_') 
WHERE item_type LIKE 'teacho_%' OR item_type LIKE 'testo_%';

-- ----------------------------------------------------------------------------
-- Section 3: Register TutO Module
-- ----------------------------------------------------------------------------
INSERT INTO unified_master_data (
    id, item_type, title_name, description_purpose, category,
    permanent_pincode, approval_status, links_data, additional_info,
    language, description, metadata, created_by, created_at
)
SELECT 
    gen_random_uuid(),
    'module_registration', 
    'TutO',
    NULL,
    'Education',
    NULL,
    'APPROVED',
    NULL,
    '{"type":"UNIFIED_MODULE","replaces":["teacho","testo"]}',
    'en',
    'Unified Learning & Mock Test Super Module (TeachO + TestO combined)',
    '{"icon":"GraduationCap","color":"#00D084","path":"/tuto","pricing":{"plan":"TutO Pass Pro","price_inr":199,"period":"year"}}',
    NULL,
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM unified_master_data 
    WHERE item_type = 'module_registration' AND title_name = 'TutO'
);

-- ----------------------------------------------------------------------------
-- Section 4: Remove Obsolete TeachO and TestO Module Registrations
-- ----------------------------------------------------------------------------
DELETE FROM unified_master_data 
WHERE item_type = 'module_registration' 
  AND title_name IN ('TeachO', 'TestO');

-- ----------------------------------------------------------------------------
-- Section 5: kindle_content_cache NOT touched (~47,716 rows preserved)
-- ----------------------------------------------------------------------------

COMMIT;
