import { createClient } from '@supabase/supabase-js';

const LMS_SUPABASE_URL = process.env.NEXT_PUBLIC_LMS_SUPABASE_URL || 'https://mysupro-crm.duckdns.org';
const LMS_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_LMS_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoicG9zdGdyZXMiLCJpc3MiOiJzdXByby1vY2kiLCJpYXQiOjE3OTA0MDAwMDYsImV4cCI6MjEwNTk3NjAwNn0.5JnlOQOdNyLuYrZp0SV7MtQ8sAzz0daLgnYT7Z43pHo';

export const lmsSupabase = createClient(LMS_SUPABASE_URL, LMS_SUPABASE_ANON_KEY);
