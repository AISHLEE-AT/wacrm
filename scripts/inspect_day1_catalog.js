const fs = require('fs');
const path = require('path');

const catalogPath = 'D:/w/apps/mobile/src/data/coursesCatalog.ts';
const code = fs.readFileSync(catalogPath, 'utf8');
const startIdx = code.indexOf('export const ALL_COURSES: CourseOption[] = [') + 'export const ALL_COURSES: CourseOption[] = '.length;
const endIdx = code.indexOf('export const DEFAULT_COURSE:');
const allCourses = JSON.parse(code.substring(startIdx, endIdx).trim().replace(/;$/, ''));

console.log('Total courses in catalog:', allCourses.length);
let totalDay1Tasks = 0;
allCourses.forEach((c, idx) => {
  console.log(`Course ${idx + 1}/${allCourses.length}: [${c.id}] ${c.short} — ${c.tasks.length} tasks`);
  totalDay1Tasks += c.tasks.length;
  c.tasks.forEach((t, tIdx) => {
    console.log(`   Task ${tIdx + 1}: [${t.type}] "${t.title}" | Subj: ${t.rawSubject || 'Core'} | Focus: ${t.subtitle || t.rawTopic || ''}`);
  });
});
console.log('\nTotal Day 1 Tasks across all 86 courses:', totalDay1Tasks);
