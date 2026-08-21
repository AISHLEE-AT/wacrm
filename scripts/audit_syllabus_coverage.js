const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const url = 'https://jjgdatjthyeesmgunnlp.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZ2RhdGp0aHllZXNtZ3VubmxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MzU5NTYsImV4cCI6MjEwMDIxMTk1Nn0.iuSdvxW9VEtn_1yVLmf9ZN24CeXFxmF3aeVHEn-Dgcs';
const supabase = createClient(url, key);

async function testResolverEngine() {
  const { data: courses, error } = await supabase.from('unified_master_data').select('*').eq('item_type', 'COURSE');
  if (error) throw error;

  console.log(`Loaded ${courses.length} courses from Supabase.`);

  // Load updated course catalog
  const { getCourseSyllabus } = require('D:/w/apps/web/src/lib/courseCatalogMaster.ts');

  let totalMicroTopics = 0;
  const missingOrShort = [];
  const categoryStats = {};

  courses.forEach(course => {
    const syllabus = getCourseSyllabus(course.title_name, course.category);
    let mtCount = 0;
    syllabus.forEach(u => {
      (u.chapters || []).forEach(ch => {
        (ch.subtopics || []).forEach(st => {
          mtCount += (st.microTopics || []).length;
        });
      });
    });

    totalMicroTopics += mtCount;
    categoryStats[course.category || 'other'] = (categoryStats[course.category || 'other'] || 0) + mtCount;

    if (mtCount < 2) {
      missingOrShort.push({ id: course.id, title: course.title_name, mtCount });
    }
  });

  console.log('Total Micro-topics generated across all 164 courses:', totalMicroTopics);
  console.log('Category Micro-topic distribution:', categoryStats);
  console.log('Courses with < 2 microtopics:', missingOrShort.length);
  if (missingOrShort.length > 0) {
    console.log('Under-resolved courses:', missingOrShort);
  }
}

testResolverEngine().catch(console.error);
