/**
 * Clean Secret Literals across repository to comply with GitHub Push Protection
 */

const fs = require('fs');
const path = require('path');

const filesToClean = [
  'D:/w/apps/web/src/lib/coursePlayerEngine.ts',
  'D:/w/apps/mobile/src/lib/coursePlayerEngine.ts',
  'D:/w/apps/web/src/app/api/kindle-ai/route.ts',
  'D:/w/apps/mobile/src/services/geminiToolsService.ts',
  'D:/w/apps/mobile/scripts/dayFirstSequentialGenerator.js',
  'D:/w/apps/mobile/scripts/masterDayFirstGenerator.js',
  'D:/w/scripts/automate_day_wise_content_generation.js',
  'D:/w/scripts/batch_generate_kindle_content.js',
  'D:/w/scripts/batch_generate_micro_topic_player_content.js',
  'D:/w/scripts/batch_seed_daily_plans.js',
  'D:/w/scripts/run_full_curriculum_seeder.js',
  'D:/w/scripts/schedule_multiday_generation.js',
  'D:/w/scripts/test_candidate_models.js',
  'D:/w/scripts/test_keys.js',
  'D:/w/scripts/test_working_models.js'
];

function sanitizeFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace raw literal AQ keys with dynamic environment loader
  const aqPattern = /'AQ\.Ab8RN6[A-Za-z0-9_-]+'/g;
  
  if (filePath.includes('apps/web/src/lib/coursePlayerEngine.ts') || filePath.includes('apps/mobile/src/lib/coursePlayerEngine.ts')) {
    content = content.replace(/const GEMINI_API_KEYS = \[[\s\S]*?\];/, `function getCandidatePool(): string[] {
  if (typeof window !== 'undefined') {
    const userKey = localStorage.getItem('user_gemini_api_key') || localStorage.getItem('gemini_api_key');
    if (userKey) return [userKey];
  }
  const envKeys = (process.env.GEMINI_API_KEYS || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '').split(',').map(k => k.trim()).filter(Boolean);
  if (envKeys.length > 0) return envKeys;
  return [(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '').trim()].filter(Boolean);
}

let currentKeyIndex = 0;
function getNextGeminiKey(): string {
  const keys = getCandidatePool();
  if (keys.length === 0) return '';
  const key = keys[currentKeyIndex % keys.length];
  currentKeyIndex++;
  return key;
}`);
  } else if (filePath.includes('apps/web/src/app/api/kindle-ai/route.ts')) {
    content = content.replace(/const fallbackPool = \[[\s\S]*?\];[\s\S]*?fallbackPool\.forEach\(k => \{[\s\S]*?\}\);/, `// Load from server environment
  const envPool = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '').split(',').map(k => k.trim()).filter(Boolean);
  envPool.forEach(k => {
    if (!pool.includes(k)) pool.push(k);
  });`);
  } else if (filePath.includes('apps/mobile/src/services/geminiToolsService.ts')) {
    content = content.replace(/const FALLBACK_KEYS = \[[\s\S]*?\];/, `const FALLBACK_KEYS = (process.env.EXPO_PUBLIC_GEMINI_API_KEY || '').split(',').map(k => k.trim()).filter(Boolean);`);
  } else {
    // In scripts, read from .env.local dynamically
    content = content.replace(/const GEMINI_KEYS = \[[\s\S]*?\];/, `function loadEnvKeys() {
  const envPath = path.resolve(__dirname, '../apps/web/.env.local');
  if (fs.existsSync(envPath)) {
    const txt = fs.readFileSync(envPath, 'utf8');
    const m = txt.match(/GEMINI_API_KEYS=([^\r\n]+)/);
    if (m) return m[1].split(',').map(k => k.trim()).filter(Boolean);
  }
  return (process.env.GEMINI_API_KEYS || '').split(',').map(k => k.trim()).filter(Boolean);
}
const GEMINI_KEYS = loadEnvKeys();`);
    content = content.replace(aqPattern, "process.env.GEMINI_API_KEY || ''");
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Sanitized:', filePath);
}

filesToClean.forEach(sanitizeFile);
