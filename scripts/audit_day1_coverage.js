const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://jjgdatjthyeesmgunnlp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZ2RhdGp0aHllZXNtZ3VubmxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MzU5NTYsImV4cCI6MjEwMDIxMTk1Nn0.iuSdvxW9VEtn_1yVLmf9ZN24CeXFxmF3aeVHEn-Dgcs';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function audit() {
  const catalogPath = path.resolve('D:/w/apps/mobile/src/data/coursesCatalog.ts');
  const code = fs.readFileSync(catalogPath, 'utf8');
  const startIdx = code.indexOf('export const ALL_COURSES: CourseOption[] = [') + 'export const ALL_COURSES: CourseOption[] = '.length;
  const endIdx = code.indexOf('export const DEFAULT_COURSE:');
  const allCourses = JSON.parse(code.substring(startIdx, endIdx).trim().replace(/;$/, ''));

  const catalogDir = path.resolve('D:/w/apps/mobile/src/data/generated_catalog');
  const localFiles = new Set(fs.existsSync(catalogDir) ? fs.readdirSync(catalogDir) : []);

  console.log(`Auditing Day 1 for all ${allCourses.length} courses against Supabase and Local files...`);

  // Query Supabase
  const { data: dbRecords, error } = await supabase
    .from('kindle_content_cache')
    .select('topic_key, topic_title');

  const dbKeys = new Set((dbRecords || []).map(r => r.topic_key));
  console.log(`Total records in Supabase kindle_content_cache: ${dbKeys.size}`);
  console.log(`Total local bundle files in generated_catalog: ${localFiles.size}`);

  let fullDay1Courses = 0;
  let partialCourses = 0;
  let missingCourses = 0;

  const missingReport = [];

  for (let cIdx = 0; cIdx < allCourses.length; cIdx++) {
    const course = allCourses[cIdx];
    const day1Key = `${course.id}_day_1`;
    const inDbPrimary = dbKeys.has(day1Key);
    const inLocalPrimary = localFiles.has(`${day1Key}.json`);

    let tasksFound = 0;
    const taskDetails = [];

    course.tasks.forEach((task, tIdx) => {
      const taskKey = `${course.id}_day_1_task_${tIdx + 1}`;
      const slugKey = (task.title || '').toLowerCase().replace(/[^a-z0-9]/g, '_');
      const inDb = dbKeys.has(taskKey) || dbKeys.has(day1Key) || dbKeys.has(slugKey);
      const inLocal = localFiles.has(`${taskKey}.json`) || localFiles.has(`${day1Key}.json`) || localFiles.has(`${slugKey}.json`);
      if (inDb || inLocal) {
        tasksFound++;
      } else {
        taskDetails.push(`Task ${tIdx + 1}: ${task.title}`);
      }
    });

    if (tasksFound === course.tasks.length && (inDbPrimary || inLocalPrimary)) {
      fullDay1Courses++;
    } else if (tasksFound > 0) {
      partialCourses++;
      missingReport.push({ course: `[${cIdx + 1}] ${course.short} (${course.id})`, status: 'Partial', missing: taskDetails });
    } else {
      missingCourses++;
      missingReport.push({ course: `[${cIdx + 1}] ${course.short} (${course.id})`, status: 'Missing', missing: taskDetails });
    }
  }

  console.log('\n================ AUDIT SUMMARY ================');
  console.log(`✅ Fully Complete Courses (All headings covered): ${fullDay1Courses} / ${allCourses.length}`);
  console.log(`⚠️ Partially Covered Courses: ${partialCourses} / ${allCourses.length}`);
  console.log(`❌ Completely Missing Courses: ${missingCourses} / ${allCourses.length}`);
  console.log('================================================\n');

  if (missingReport.length > 0) {
    console.log('Missing/Partial Courses Detail (First 20):');
    missingReport.slice(0, 20).forEach(r => {
      console.log(`- ${r.course} [${r.status}] -> Missing: ${r.missing.join(', ')}`);
    });
  }
}

audit().catch(console.error);
