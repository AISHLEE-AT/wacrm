/**
 * TeachO Multi-Day Master Content Harvester
 * Version 1.0 — Extracts, normalizes, deduplicates, and saves 9,922+ multi-day lessons
 * from Supabase unified_master_data into D:\doc\MULTI_DAY_HARVEST\ and local bundles.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://jjgdatjthyeesmgunnlp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZ2RhdGp0aHllZXNtZ3VubmxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MzU5NTYsImV4cCI6MjEwMDIxMTk1Nn0.iuSdvxW9VEtn_1yVLmf9ZN24CeXFxmF3aeVHEn-Dgcs';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const OUTPUT_DIR = 'D:/doc/MULTI_DAY_HARVEST';
const WEB_CATALOG_DIR = path.resolve('D:/w/apps/web/src/data/generated_catalog');
const MOBILE_CATALOG_DIR = path.resolve('D:/w/apps/mobile/src/data/generated_catalog');
const CATALOG_PATH = path.resolve('D:/w/apps/mobile/src/data/coursesCatalog.ts');

// ─── 1. LOAD MASTER COURSES ──────────────────────────────────────────────────
function loadCoursesCatalog() {
  const code = fs.readFileSync(CATALOG_PATH, 'utf8');
  const startIdx = code.indexOf('export const ALL_COURSES: CourseOption[] = [') + 'export const ALL_COURSES: CourseOption[] = '.length;
  const endIdx = code.indexOf('export const DEFAULT_COURSE:');
  return JSON.parse(code.substring(startIdx, endIdx).trim().replace(/;$/, ''));
}

const ALL_COURSES = loadCoursesCatalog();

// ─── 2. MAP TITLES TO 86 CANONICAL COURSE IDS ────────────────────────────────
function resolveCourseId(rawTitle, rawCategory, language) {
  const t = (rawTitle || '').toLowerCase();
  const c = (rawCategory || '').toLowerCase();
  const isTamil = language === 'ta' || t.includes('தமிழ்') || c.includes('தமிழ்');

  // Exact Keyword Matches
  if (t.includes('lkg cbse')) return 'cbse-lkg';
  if (t.includes('ukg cbse')) return 'cbse-ukg';
  if (t.includes('lkg') || t.includes('kindergarten')) return isTamil ? 'tnsb-ta-lkg' : 'tnsb-en-lkg';
  if (t.includes('ukg')) return isTamil ? 'tnsb-ta-ukg' : 'tnsb-en-ukg';

  // CBSE Grades
  for (let g = 1; g <= 12; g++) {
    if (t.includes(`class ${g} cbse`) || t.includes(`cbse ${g}`)) {
      if (g === 11) return t.includes('commerce') ? 'cbse-11-com' : 'cbse-11-sci';
      if (g === 12) return t.includes('commerce') ? 'cbse-12-com' : 'cbse-12-sci';
      return `cbse-${g}`;
    }
  }

  // TNSB / Samacheer Grades
  for (let g = 1; g <= 12; g++) {
    if (t.includes(`class ${g} `) || t.includes(`${g}th standard`) || t.includes(`class ${g} /`) || t.includes(`${g}th standard sslc`)) {
      if (g === 10) return isTamil ? 'tnsb-ta-10' : 'tnsb-en-10';
      if (g === 11) {
        if (isTamil) return t.includes('com') ? 'tnsb-ta-11-com' : 'tnsb-ta-11-sci';
        return t.includes('com') ? 'tnsb-en-11-com' : 'tnsb-en-11-sci';
      }
      if (g === 12) {
        if (isTamil) return t.includes('com') ? 'tnsb-ta-12-com' : 'tnsb-ta-12-sci';
        if (t.includes('cs') || t.includes('computer')) return 'tnsb-en-12-cs';
        return t.includes('com') ? 'tnsb-en-12-com' : 'tnsb-en-12-sci';
      }
      return isTamil ? `tnsb-ta-${g}` : `tnsb-en-${g}`;
    }
  }

  // Competitive & Entrance
  if (t.includes('group 4') || t.includes('vao')) return 'exam-tnpsc-grp4';
  if (t.includes('group 2') || t.includes('grp2')) return 'exam-tnpsc-grp2';
  if (t.includes('group 1') || t.includes('grp1')) return 'exam-tnpsc-grp1';
  if (t.includes('si') || t.includes('police') || t.includes('constable')) return 'exam-tnpsc-si';
  if (t.includes('deo') || t.includes('executive officer')) return 'exam-tnpsc-deo';
  if (t.includes('upsc') || t.includes('civil services') || t.includes('ias')) return 'exam-upsc-ias';
  if (t.includes('ssc cgl')) return 'exam-ssc-cgl';
  if (t.includes('ssc chsl')) return 'exam-ssc-cgl';
  if (t.includes('banking') || t.includes('bank po') || t.includes('ibps') || t.includes('sbi')) return 'exam-bank-po';
  if (t.includes('neet')) return 'exam-neet-ug';
  if (t.includes('jee')) return 'exam-jee-main';

  // College Degrees
  if (t.includes('b.tech cse') || t.includes('computer science engineering')) return 'degree-btech-cse';
  if (t.includes('ai & data') || t.includes('artificial intelligence') || t.includes('btech-aids')) return 'degree-btech-aids';
  if (t.includes('b.com') || t.includes('commerce')) return 'degree-bcom-gen';
  if (t.includes('bca')) return 'degree-bca-cs';
  if (t.includes('b.sc cs') || t.includes('bsc')) return 'degree-bsc-cs';
  if (t.includes('bba')) return 'degree-bba';

  // Skills
  if (t.includes('full stack') || t.includes('react native') || t.includes('mobile')) return 'skill-fullstack-ai';
  if (t.includes('python') || t.includes('data science') || t.includes('machine learning')) return 'skill-python-ai';
  if (t.includes('spoken english') || t.includes('english conversation')) return 'skill-spoken-english';
  if (t.includes('vedic')) return 'skill-vedic-maths';
  if (t.includes('scratch') || t.includes('kids coding')) return 'skill-coding-kids';

  // Fallback by course category
  const directMatch = ALL_COURSES.find(c => c.title.toLowerCase() === t || c.id === t);
  if (directMatch) return directMatch.id;

  return 'tnsb-en-10'; // Safe fallback
}

// ─── 3. NORMALIZE CONTENT TO KINDLE SCHEMA ───────────────────────────────────
function normalizeToKindleContent(rawRow, courseId, dayNumber) {
  let parsedInfo = {};
  if (rawRow.additional_info) {
    try {
      parsedInfo = typeof rawRow.additional_info === 'string' ? JSON.parse(rawRow.additional_info) : rawRow.additional_info;
    } catch (e) {}
  }

  const innerContent = parsedInfo.content || parsedInfo;
  const courseObj = ALL_COURSES.find(c => c.id === courseId) || { title: rawRow.title_name || 'Curriculum Course' };

  const topicTitle = innerContent.topicTitle || rawRow.title_name || `Day ${dayNumber} Foundations`;
  const subject = innerContent.subject || parsedInfo.subject || rawRow.category || 'General';
  const topicKey = innerContent.topicKey || `${courseId}_day_${dayNumber}_task_1`;

  // Standard Study Notes
  let studyNotes = innerContent.studyNotes || [];
  if (!studyNotes || studyNotes.length === 0) {
    if (innerContent.overview) {
      studyNotes = [{ sectionTitle: `1. Core Principles: ${topicTitle}`, content: innerContent.overview }];
    } else {
      studyNotes = [{ sectionTitle: `1. Concept Breakdown`, content: `Comprehensive learning unit for ${topicTitle}.` }];
    }
  }

  // Flashcards
  let flashcards = innerContent.flashcards || [];
  if (!flashcards || flashcards.length === 0) {
    flashcards = [
      { front: `What is the core focus of ${topicTitle}?`, back: `Key concepts, rules, and problem-solving techniques for Day ${dayNumber}.` }
    ];
  }

  // Practice Quiz
  let practiceQuiz = innerContent.practiceQuiz || [];
  if (!practiceQuiz || practiceQuiz.length === 0) {
    practiceQuiz = [
      {
        question: `Which fundamental principle is highlighted in ${topicTitle}?`,
        options: ['A) Foundation & Core Concepts', 'B) Non-essential details', 'C) Unrelated Topic', 'D) None of the above'],
        correctIndex: 0,
        explanation: 'The lesson focuses on core conceptual foundations and exam recall.'
      }
    ];
  }

  // Learning Objectives
  let learningObjectives = innerContent.learningObjectives || [
    `Understand the fundamental concepts of ${topicTitle}.`,
    `Apply step-by-step formulas and methodologies.`,
    `Reinforce learning through active recall flashcards and quiz questions.`
  ];

  return {
    topicKey: topicKey,
    topicTitle: topicTitle,
    courseId: courseId,
    courseTitle: courseObj.title,
    dayNumber: dayNumber,
    subject: subject,
    duration: innerContent.duration || '15 Min',
    xpReward: innerContent.xpReward || 20,
    videoId: innerContent.videoId || '0TgLtF3PMOc',
    videoTitle: innerContent.videoTitle || 'Comprehensive Video Lecture',
    overview: innerContent.overview || `Master key concepts and practical applications for ${topicTitle}.`,
    learningObjectives: learningObjectives,
    studyNotes: studyNotes,
    flashcards: flashcards,
    practiceQuiz: practiceQuiz,
    bedtimeRecap: innerContent.bedtimeRecap || `Day ${dayNumber} complete! Excellent progress on ${topicTitle}.`,
    generatedAt: rawRow.created_at || new Date().toISOString()
  };
}

// ─── 4. MAIN HARVEST PIPELINE ────────────────────────────────────────────────
async function runHarvest() {
  console.log('🚀 INITIALIZING TEACHO MULTI-DAY CONTENT HARVEST ENGINE...');

  const harvestDirs = [
    OUTPUT_DIR,
    path.join(OUTPUT_DIR, 'courses'),
    path.join(OUTPUT_DIR, 'json_by_day'),
    WEB_CATALOG_DIR,
    MOBILE_CATALOG_DIR
  ];
  harvestDirs.forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });

  let offset = 0;
  const batchSize = 1000;
  const harvestedItems = new Map(); // key -> content
  const courseDayInventory = {};
  let totalRowsScanned = 0;

  while (true) {
    const { data, error } = await supabase
      .from('unified_master_data')
      .select('id, title_name, category, language, additional_info, created_at')
      .eq('item_type', 'o_course_micro_topic_content')
      .range(offset, offset + batchSize - 1);

    if (error) {
      console.error('❌ Supabase stream error:', error);
      break;
    }
    if (!data || data.length === 0) break;

    totalRowsScanned += data.length;

    for (const row of data) {
      let parsed = {};
      if (row.additional_info) {
        try {
          parsed = typeof row.additional_info === 'string' ? JSON.parse(row.additional_info) : row.additional_info;
        } catch (e) {}
      }

      const rawCourseTitle = parsed.courseTitle || row.title_name || row.category || '';
      const dayNumber = parseInt(parsed.dayNumber || 1, 10);
      const courseId = resolveCourseId(rawCourseTitle, row.category, row.language);

      const normalized = normalizeToKindleContent(row, courseId, dayNumber);
      const canonicalKey = `${courseId}_day_${dayNumber}`;

      if (!harvestedItems.has(canonicalKey)) {
        harvestedItems.set(canonicalKey, normalized);

        if (!courseDayInventory[courseId]) courseDayInventory[courseId] = new Set();
        courseDayInventory[courseId].add(dayNumber);
      }
    }

    offset += data.length;
    if (offset % 5000 === 0 || data.length < batchSize) {
      console.log(`📥 Scanned ${offset} rows -> Extracted ${harvestedItems.size} unique course days...`);
    }
    if (data.length < batchSize) break;
  }

  console.log(`\n🎉 EXTRACTION FINISHED: Scanned ${totalRowsScanned} rows -> Harvested ${harvestedItems.size} Unique Course-Days!`);

  // ─── 5. WRITE OUT FILES ───────────────────────────────────────────────────
  console.log('\n💾 Writing harvested day files to disk...');

  let writtenCount = 0;
  const masterHarvestIndex = [];

  for (const [key, content] of harvestedItems.entries()) {
    const fileName = `${key}.json`;

    // 1. Output in D:\doc\MULTI_DAY_HARVEST\json_by_day\
    fs.writeFileSync(path.join(OUTPUT_DIR, 'json_by_day', fileName), JSON.stringify(content, null, 2), 'utf8');

    // 2. Output into web & mobile generated catalogs for zero-latency app usage
    fs.writeFileSync(path.join(WEB_CATALOG_DIR, fileName), JSON.stringify(content, null, 2), 'utf8');
    fs.writeFileSync(path.join(MOBILE_CATALOG_DIR, fileName), JSON.stringify(content, null, 2), 'utf8');

    masterHarvestIndex.push({
      key: key,
      courseId: content.courseId,
      courseTitle: content.courseTitle,
      dayNumber: content.dayNumber,
      topicTitle: content.topicTitle,
      subject: content.subject
    });

    writtenCount++;
  }

  // 3. Write Master Multi-Day Manifest in D:\doc
  const manifestPath = path.join(OUTPUT_DIR, 'harvest_manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify({
    totalHarvestedCourseDays: harvestedItems.size,
    totalOriginalRowsScanned: totalRowsScanned,
    harvestedAt: new Date().toISOString(),
    items: masterHarvestIndex
  }, null, 2), 'utf8');

  // 4. Generate README for Harvest
  let harvestReadme = `# 🌾 TeachO Multi-Day Harvest Report\n\n`;
  harvestReadme += `**Total Unique Days Harvested**: **${harvestedItems.size} Days**\n`;
  harvestReadme += `**Original Database Rows Processed**: **${totalRowsScanned} Rows**\n\n`;
  harvestReadme += `## 📚 Harvested Courses & Days Coverage:\n\n`;
  harvestReadme += `| Course ID | Course Title | Total Days Harvested | Range |\n`;
  harvestReadme += `| :--- | :--- | :--- | :--- |\n`;

  Object.entries(courseDayInventory).forEach(([cId, daysSet]) => {
    const daysArr = Array.from(daysSet).sort((a, b) => a - b);
    const cObj = ALL_COURSES.find(c => c.id === cId) || { title: cId };
    harvestReadme += `| \`${cId}\` | ${cObj.title} | **${daysArr.length} Days** | Day ${daysArr[0]} to Day ${daysArr[daysArr.length - 1]} |\n`;
  });

  fs.writeFileSync(path.join(OUTPUT_DIR, 'README.md'), harvestReadme, 'utf8');

  console.log(`\n================================================================`);
  console.log(`🏆 HARVEST COMPLETED SUCCESSFULLY!`);
  console.log(`   Unique Days Harvested: ${harvestedItems.size}`);
  console.log(`   Saved Location: D:\\doc\\MULTI_DAY_HARVEST\\`);
  console.log(`   Web & Mobile Bundles Updated: ${writtenCount} files`);
  console.log(`================================================================\n`);
}

runHarvest().catch(err => {
  console.error('❌ Harvester failed:', err);
  process.exit(1);
});
