const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://jjgdatjthyeesmgunnlp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZ2RhdGp0aHllZXNtZ3VubmxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MzU5NTYsImV4cCI6MjEwMDIxMTk1Nn0.iuSdvxW9VEtn_1yVLmf9ZN24CeXFxmF3aeVHEn-Dgcs';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function inspectSchema() {
  const { data, error } = await supabase
    .from('unified_master_data')
    .select('*')
    .limit(3);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Sample row column keys:', Object.keys(data[0]));
  console.log('\nFull Sample Row 1:\n', JSON.stringify(data[0], null, 2));
}

inspectSchema();
