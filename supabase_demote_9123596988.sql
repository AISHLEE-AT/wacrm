-- ==============================================================================
-- FAGO WACRM: Demote 9123596988 to Normal User
-- Set role = 'user' in profiles table for 9123596988 and 919123596988
-- ==============================================================================

UPDATE public.profiles
SET role = 'user', account_role = 'viewer', updated_at = NOW()
WHERE phone IN ('9123596988', '919123596988')
   OR whatsapp IN ('9123596988', '919123596988')
   OR email LIKE '%9123596988%';

SELECT id, full_name, phone, whatsapp, role, account_role, updated_at
FROM public.profiles
WHERE phone IN ('9123596988', '919123596988')
   OR whatsapp IN ('9123596988', '919123596988');
