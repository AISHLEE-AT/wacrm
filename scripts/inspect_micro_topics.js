const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://jjgdatjthyeesmgunnlp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZ2RhdGp0aHllZXNtZ3VubmxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MzU5NTYsImV4cCI6MjEwMDIxMTk1Nn0.iuSdvxW9VEtn_1yVLmf9ZN24CeXFxmF3aeVHEn-Dgcs';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function inspectMicroTopics() {
  const { data, error } = await supabase
    .from('unified_master_data')
    .select('*')
    .eq('item_type', 'o_course_micro_topic_content')
    .limit(5);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Found ${data.length} micro_topic rows:`);
  data.forEach((d, i) => {
    console.log(`\n================ ROW ${i + 1} ================`);
    console.log('ID:', d.id);
    console.log('Title Name:', d.title_name);
    console.log('Category:', d.category);
    console.log('Language:', d.language);
    console.log('Description Purpose:', d.description_purpose ? d.description_purpose.substring(0, 100) : null);
    console.log('Additional Info Type:', typeof d.additional_info);
    if (d.additional_info) {
      console.log('Additional Info Sample:', JSON.stringify(d.additional_info).substring(0, 300));
    }
    console.log('Metadata:', JSON.stringify(d.metadata));
    console.log('Links Data:', JSON.stringify(d.links_data));
    console.log('Created At:', d.created_at);
  });
}

inspectMicroTopics();
