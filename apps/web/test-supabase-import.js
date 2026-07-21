require('dotenv').config({ path: '.env.local' }); const { supabase } = require('./src/aishlee/lib/supabaseClient'); console.log('Supabase:', supabase);
