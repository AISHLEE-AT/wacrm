const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = 'https://jjgdatjthyeesmgunnlp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZ2RhdGp0aHllZXNtZ3VubmxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MzU5NTYsImV4cCI6MjEwMDIxMTk1Nn0.iuSdvxW9VEtn_1yVLmf9ZN24CeXFxmF3aeVHEn-Dgcs';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function analyze() {
  console.log('📊 Scanning unified_master_data (o_course_micro_topic_content) in batches of 1,000...');

  let offset = 0;
  const batchSize = 1000;
  let totalWithDays = 0;
  let totalWithContent = 0;
  const daysMap = {};
  const coursesMap = {};
  const subjectMap = {};

  while (offset < 10000) { // scan first 10,000 for high-confidence statistical sample
    const { data, error } = await supabase
      .from('unified_master_data')
      .select('id, title_name, category, language, additional_info')
      .eq('item_type', 'o_course_micro_topic_content')
      .range(offset, offset + batchSize - 1);

    if (error) {
      console.error('Error fetching batch:', error);
      break;
    }
    if (!data || data.length === 0) break;

    for (const row of data) {
      if (row.additional_info) {
        try {
          const parsed = typeof row.additional_info === 'string' ? JSON.parse(row.additional_info) : row.additional_info;
          if (parsed.dayNumber) {
            totalWithDays++;
            daysMap[parsed.dayNumber] = (daysMap[parsed.dayNumber] || 0) + 1;
          }
          if (parsed.courseTitle) {
            coursesMap[parsed.courseTitle] = (coursesMap[parsed.courseTitle] || 0) + 1;
          }
          if (parsed.subject) {
            subjectMap[parsed.subject] = (subjectMap[parsed.subject] || 0) + 1;
          }
          if (parsed.content || (parsed.studyNotes || parsed.learningObjectives)) {
            totalWithContent++;
          }
        } catch (e) {}
      }
    }

    offset += data.length;
    console.log(`Scanned ${offset} rows...`);
    if (data.length < batchSize) break;
  }

  console.log('\n================ STATISTICAL SAMPLE SUMMARY (10,000 rows) ================');
  console.log(`Total rows with Day Numbers: ${totalWithDays} (${((totalWithDays / offset) * 100).toFixed(1)}%)`);
  console.log(`Total rows with Structured Content: ${totalWithContent} (${((totalWithContent / offset) * 100).toFixed(1)}%)`);
  console.log(`Distinct Days found:`, Object.keys(daysMap).sort((a, b) => parseInt(a) - parseInt(b)).slice(0, 30));
  console.log(`Distinct Courses count:`, Object.keys(coursesMap).length);
  console.log(`Top 10 Courses by volume:`, Object.entries(coursesMap).sort((a, b) => b[1] - a[1]).slice(0, 10));
  console.log(`Top 10 Subjects by volume:`, Object.entries(subjectMap).sort((a, b) => b[1] - a[1]).slice(0, 10));
}

analyze();
