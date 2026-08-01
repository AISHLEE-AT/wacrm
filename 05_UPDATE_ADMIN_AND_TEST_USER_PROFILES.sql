-- ==============================================================================
-- PART 5: EXPLICIT UPDATE FOR ADMIN (9486335870) & DRIVER (9123596988) PROFILES
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard
-- Ensures pre-fill & login details match exact SuperAdmin & Driver names.
-- ==============================================================================

-- 1. Update Admin User 9486335870 in public.profiles
UPDATE public.profiles
SET 
    full_name = 'Admin User (FAGO & WACRM SuperAdmin)',
    role = 'admin',
    main_category = 'Admin',
    default_module = 'crm',
    profile_complete = true,
    whatsapp = '9486335870'
WHERE phone LIKE '%9486335870%' OR whatsapp LIKE '%9486335870%';

-- 2. Update Virtual Driver 9123596988 in public.profiles
UPDATE public.profiles
SET 
    full_name = 'FAGO Test Driver (Virtual Respondent)',
    role = 'driver',
    main_category = 'Driver',
    default_module = 'drivo',
    profile_complete = true,
    whatsapp = '9123596988'
WHERE phone LIKE '%9123596988%' OR whatsapp LIKE '%9123596988%';

-- 3. Reload Schema Cache
NOTIFY pgrst, 'reload schema';

SELECT '=== 👑 PROFILES FOR ADMIN (9486335870) & DRIVER (9123596988) SUCCESSFULLY UPDATED! ===' AS status;
