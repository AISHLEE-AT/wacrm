import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mysupro-crm.duckdns.org';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoicG9zdGdyZXMiLCJpc3MiOiJzdXByby1vY2kiLCJpYXQiOjE3OTA0MDAwMDYsImV4cCI6MjEwNTk3NjAwNn0.5JnlOQOdNyLuYrZp0SV7MtQ8sAzz0daLgnYT7Z43pHo';

export const aishleeSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
