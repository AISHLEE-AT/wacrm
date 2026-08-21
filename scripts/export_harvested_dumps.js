/**
 * Export Multi-Day Harvest Database Dumps
 * Creates unified SQL and JSON dumps for all 8,104 harvested course-days
 */

const fs = require('fs');
const path = require('path');

const HARVEST_DIR = 'D:/doc/MULTI_DAY_HARVEST';
const JSON_DIR = path.join(HARVEST_DIR, 'json_by_day');
const SQL_OUT = path.join(HARVEST_DIR, 'SQL_DATABASE');
const JSON_OUT = path.join(HARVEST_DIR, 'JSON_DATABASE');

[SQL_OUT, JSON_OUT].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

async function exportDumps() {
  console.log('📦 Exporting multi-day SQL & JSON dumps...');

  const files = fs.readdirSync(JSON_DIR).filter(f => f.endsWith('.json'));
  console.log(`Found ${files.length} day files to pack.`);

  const sqlPath = path.join(SQL_OUT, 'teacho_all_multiday_harvest_supabase_import.sql');
  const jsonPath = path.join(JSON_OUT, 'teacho_all_multiday_harvest_master_dump.json');

  let sqlHeader = `-- TeachO Master Multi-Day Curriculum Database Dump
-- Total Unique Course-Days: ${files.length} (Covering Days 1 to 360)
-- Target: PostgreSQL / Supabase kindle_content_cache

CREATE TABLE IF NOT EXISTS public.kindle_content_cache (
    topic_key TEXT PRIMARY KEY,
    topic_title TEXT,
    course_title TEXT,
    kindle_json JSONB,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    model_used TEXT
);

CREATE INDEX IF NOT EXISTS idx_kindle_content_topic_key ON public.kindle_content_cache(topic_key);

`;

  const writeStreamSql = fs.createWriteStream(sqlPath, { flags: 'w' });
  writeStreamSql.write(sqlHeader);

  const allItems = [];

  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const raw = fs.readFileSync(path.join(JSON_DIR, f), 'utf8');
    try {
      const data = JSON.parse(raw);
      allItems.push({
        topic_key: data.topicKey || f.replace('.json', ''),
        topic_title: data.topicTitle,
        course_title: data.courseTitle,
        day_number: data.dayNumber,
        subject: data.subject
      });

      const key = (data.topicKey || f.replace('.json', '')).replace(/'/g, "''");
      const title = (data.topicTitle || 'Lesson').replace(/'/g, "''");
      const cTitle = (data.courseTitle || 'Course').replace(/'/g, "''");
      const jsonStr = raw.replace(/'/g, "''");

      const sqlStmt = `INSERT INTO public.kindle_content_cache (topic_key, topic_title, course_title, kindle_json, generated_at, model_used)
VALUES ('${key}', '${title}', '${cTitle}', '${jsonStr}'::jsonb, NOW(), 'gemini-flash-harvested')
ON CONFLICT (topic_key) DO UPDATE 
SET topic_title = EXCLUDED.topic_title,
    course_title = EXCLUDED.course_title,
    kindle_json = EXCLUDED.kindle_json,
    generated_at = EXCLUDED.generated_at;\n\n`;

      writeStreamSql.write(sqlStmt);
    } catch (e) {}

    if (i % 1000 === 0 || i === files.length - 1) {
      console.log(`Processed ${i + 1} / ${files.length} files...`);
    }
  }

  writeStreamSql.end();

  // Write Master JSON Manifest
  fs.writeFileSync(jsonPath, JSON.stringify({
    totalItems: allItems.length,
    exportedAt: new Date().toISOString(),
    items: allItems
  }, null, 2), 'utf8');

  console.log(`\n✅ Saved SQL Dump: ${sqlPath}`);
  console.log(`✅ Saved Master JSON Dump: ${jsonPath}`);
}

exportDumps().catch(console.error);
