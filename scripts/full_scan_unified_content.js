const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = 'https://jjgdatjthyeesmgunnlp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZ2RhdGp0aHllZXNtZ3VubmxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MzU5NTYsImV4cCI6MjEwMDIxMTk1Nn0.iuSdvxW9VEtn_1yVLmf9ZN24CeXFxmF3aeVHEn-Dgcs';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fullScanSummary() {
  console.log('🔍 Running full table inventory of unified_master_data (o_course_micro_topic_content)...');

  let offset = 0;
  const batchSize = 1000;
  const courseDayMap = {};
  let totalRows = 0;

  while (true) {
    const { data, error } = await supabase
      .from('unified_master_data')
      .select('title_name, category, language, additional_info')
      .eq('item_type', 'o_course_micro_topic_content')
      .range(offset, offset + batchSize - 1);

    if (error) {
      console.error('Error:', error);
      break;
    }
    if (!data || data.length === 0) break;

    totalRows += data.length;
    for (const row of data) {
      if (row.additional_info) {
        try {
          const parsed = typeof row.additional_info === 'string' ? JSON.parse(row.additional_info) : row.additional_info;
          const cTitle = parsed.courseTitle || row.category || 'General';
          const day = parsed.dayNumber || 1;
          const key = `${cTitle}__day_${day}`;
          courseDayMap[key] = (courseDayMap[key] || 0) + 1;
        } catch (e) {}
      }
    }

    offset += data.length;
    if (offset % 10000 === 0) {
      console.log(`Processed ${offset} rows...`);
    }
    if (data.length < batchSize) break;
  }

  console.log(`\n🎉 Full scan completed: Scanned ${totalRows} total rows.`);
  const uniqueCourseDays = Object.keys(courseDayMap);
  console.log(`Total Unique [Course + Day] Combinations: ${uniqueCourseDays.length}`);
  
  // Group by Course
  const coursesFound = {};
  uniqueCourseDays.forEach(cd => {
    const [cTitle, dayPart] = cd.split('__day_');
    if (!coursesFound[cTitle]) coursesFound[cTitle] = [];
    coursesFound[cTitle].push(parseInt(dayPart));
  });

  console.log('\n--- Courses & Days Inventory ---');
  Object.entries(coursesFound).forEach(([cTitle, days]) => {
    days.sort((a, b) => a - b);
    console.log(`• ${cTitle} -> Days: ${days.length} (From Day ${days[0]} to Day ${days[days.length - 1]})`);
  });
}

fullScanSummary();
