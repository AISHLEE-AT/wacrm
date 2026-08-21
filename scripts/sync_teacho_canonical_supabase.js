/**
 * TeachO Canonical Micro-Topic Content Generator & Supabase Synchronizer
 * 
 * Features:
 * 1. Resolves syllabus topics to Canonical Micro-Topic Keys.
 * 2. Deduplicates generation across 40 courses.
 * 3. Enforces 100% topic accuracy (Math -> Math, EVS -> Body/Senses, Tamil -> Vowels, etc.).
 * 4. Saves and persists to Supabase (kindle_content_cache & unified_master_data).
 * 5. Saves static bundles to apps/mobile/src/data/generated_catalog/ for 0ms offline access.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { createClient } = require('@supabase/supabase-js');

// ─── 1. SUPABASE CLIENT SETUP ────────────────────────────────────────────────
const SUPABASE_URL = 'https://jjgdatjthyeesmgunnlp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZ2RhdGp0aHllZXNtZ3VubmxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MzU5NTYsImV4cCI6MjEwMDIxMTk1Nn0.iuSdvxW9VEtn_1yVLmf9ZN24CeXFxmF3aeVHEn-Dgcs';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── 2. GEMINI API KEY SETUP ─────────────────────────────────────────────────
function getGeminiApiKeys() {
  const envPath = path.join(__dirname, '../apps/web/.env.local');
  if (fs.existsSync(envPath)) {
    const text = fs.readFileSync(envPath, 'utf8');
    const singleMatch = text.match(/GEMINI_API_KEY=([^\r\n]+)/);
    const multiMatch = text.match(/GEMINI_API_KEYS=([^\r\n]+)/);
    const keys = [];
    if (multiMatch && multiMatch[1]) {
      keys.push(...multiMatch[1].split(',').map(k => k.trim()).filter(Boolean));
    }
    if (singleMatch && singleMatch[1]) {
      keys.push(singleMatch[1].trim());
    }
    if (keys.length > 0) return Array.from(new Set(keys));
  }
  return [];
}

const GEMINI_KEYS = getGeminiApiKeys();
let currentKeyIndex = 0;

function getNextGeminiKey() {
  if (GEMINI_KEYS.length === 0) return null;
  const key = GEMINI_KEYS[currentKeyIndex % GEMINI_KEYS.length];
  currentKeyIndex++;
  return key;
}

// ─── 3. CANONICAL TOPIC REGISTRY ─────────────────────────────────────────────
const CANONICAL_TOPICS = [
  {
    canonicalKey: 'canonical_evs_five_senses',
    domain: 'science_evs',
    topicTitle: 'My Amazing Body & Five Senses',
    subject: 'Science & EVS',
    videoId: 'q1xNuU7gaAQ',
    videoTitle: 'The Five Senses | The Dr. Binocs Show',
    targetPrompt: '1st Grade / Primary Environmental Science (EVS) lesson on Human Body Parts and the Five Sense Organs (Eyes for seeing, Ears for hearing, Nose for smelling, Tongue for tasting, Skin for feeling). Include hygiene and body care habits. Explain in simple Tamil and English.'
  },
  {
    canonicalKey: 'canonical_evs_hygiene_habits',
    domain: 'science_evs',
    topicTitle: 'Healthy Habits, Cleanliness & Daily Hygiene',
    subject: 'Science & EVS',
    videoId: 'dDHJW4r3elE',
    videoTitle: 'Personal Hygiene & Good Habits For Kids',
    targetPrompt: 'Primary School EVS lesson on personal hygiene (brushing teeth, taking daily bath, washing hands with soap before meals, cutting nails, drinking pure water). Simple bilingual Tamil and English.'
  },
  {
    canonicalKey: 'canonical_evs_plants_trees',
    domain: 'science_evs',
    topicTitle: 'Plants Around Us: Roots, Stems, Leaves & Flowers',
    subject: 'Science & EVS',
    videoId: 'X6TLFZUC9gI',
    videoTitle: 'Parts of a Plant | The Dr. Binocs Show',
    targetPrompt: 'Primary school science lesson on parts of a plant (roots, stem, leaves, flower, fruit) and how plants need sunlight, water, and soil. Simple bilingual Tamil and English.'
  },
  {
    canonicalKey: 'canonical_math_counting_1_20',
    domain: 'math',
    topicTitle: 'Number Magic & Counting (1 to 20)',
    subject: 'Mathematics',
    videoId: '0TgLtF3PMOc',
    videoTitle: 'Numbers 1 to 20 Song | Counting Numbers For Kids',
    targetPrompt: 'Primary school mathematics lesson on counting numbers 1 to 20 with real-world objects (apples, stars, crayons), number names in English (One, Two... Twenty) and Tamil (ஒன்று, இரண்டு... இருபது), before/after numbers.'
  },
  {
    canonicalKey: 'canonical_math_addition_basics',
    domain: 'math',
    topicTitle: 'Fun with Addition: Combining Real Objects (1 to 10)',
    subject: 'Mathematics',
    videoId: 'igcoDFokKzM',
    videoTitle: 'Basic Addition For Kids | Kindergarten Math',
    targetPrompt: 'Primary school mathematics lesson on basic addition (combining two groups of objects up to 10, using the plus sign +, e.g., 2 apples + 3 apples = 5 apples). Simple bilingual explanation.'
  },
  {
    canonicalKey: 'canonical_math_subtraction_basics',
    domain: 'math',
    topicTitle: 'Simple Subtraction: Taking Away Objects (1 to 10)',
    subject: 'Mathematics',
    videoId: 'PWuG5m6Fz_w',
    videoTitle: 'Basic Subtraction For Kids | Math Learning',
    targetPrompt: 'Primary school mathematics lesson on basic subtraction (taking away objects, minus sign -, e.g., 5 birds on a tree - 2 fly away = 3 birds left).'
  },
  {
    canonicalKey: 'canonical_math_shapes_patterns',
    domain: 'math',
    topicTitle: 'Basic 2D Shapes and Patterns: Circle, Square, Triangle',
    subject: 'Mathematics',
    videoId: 'WTeqUejf3D0',
    videoTitle: 'Learn 2D Shapes For Kids | Math Shapes Song',
    targetPrompt: 'Primary school geometry on basic 2D shapes (Circle, Square, Rectangle, Triangle), number of sides and corners, real-world examples (sun is circle, door is rectangle).'
  },
  {
    canonicalKey: 'canonical_tamil_uyir_ezhuthu',
    domain: 'tamil',
    topicTitle: 'தமிழ் உயிர் எழுத்துகள் (12) & ஆய்த எழுத்து (ஃ)',
    subject: 'தமிழ் பாடம்',
    videoId: '_sF-D_oN-2Y',
    videoTitle: 'தமிழ் உயிர் எழுத்துகள் பாடல் (அ முதல் ஔ வரை) | Infobells',
    targetPrompt: 'தொடக்கக் கல்வி தமிழ் பாடம்: 12 உயிர் எழுத்துகள் (அ, ஆ, இ, ஈ, உ, ஊ, எ, ஏ, ஐ, ஒ, ஓ, ஔ) மற்றும் 1 ஆய்த எழுத்து (ஃ). குறில் (5) மற்றும் நெடில் (7) எழுத்துகள் விளக்கம், படங்களுடன் கூடிய சொற்கள் (அம்மா, ஆடு, இலை, ஈட்டி, உரல், ஊஞ்சல், எலி, ஏணி, ஐவர், ஒட்டகம், ஓடம், ஔவையார், எஃகு).'
  },
  {
    canonicalKey: 'canonical_tamil_mei_ezhuthu',
    domain: 'tamil',
    topicTitle: 'தமிழ் மெய் எழுத்துகள் (18) & சொல் உச்சரிப்பு',
    subject: 'தமிழ் பாடம்',
    videoId: 'bU92Pjh_qZk',
    videoTitle: 'தமிழ் மெய் எழுத்துகள் பாடல் (க் முதல் ன் வரை)',
    targetPrompt: 'தொடக்கக் கல்வி தமிழ் பாடம்: 18 மெய் எழுத்துகள் (க் முதல் ன் வரை), வல்லினம் (கசடதபற), மெல்லினம் (ஙஞணநமன), இடையினம் (யரலவழள) 3 வகை இனப் பாகுபாடு மற்றும் சொல் பயிற்சி (சக்கரம், சங்கு, பட்டம், கண், நத்தை, கம்பு).'
  },
  {
    canonicalKey: 'canonical_tamil_aathichudi_kural',
    domain: 'tamil',
    topicTitle: 'ஔவையாரின் ஆத்திசூடி & எளிய திருக்குறள் கதைகள்',
    subject: 'தமிழ் பாடம்',
    videoId: 'E9Jk2Xv8U2M',
    videoTitle: 'ஔவையார் ஆத்திசூடி விளக்கக் கதைகள்',
    targetPrompt: 'தமிழ் அறநூல் பாடம்: ஔவையாரின் ஆத்திசூடி முதல் 10 வரிகள் (அறஞ்செய விரும்பு, ஆறுவது சினம், இயல்வது கரவேல், ஈவது விலக்கேல், உடையது விளம்பேல்...) மற்றும் எளிய திருக்குறள் (அகர முதல எழுத்தெல்லாம்) விளக்கக் கதைகள்.'
  },
  {
    canonicalKey: 'canonical_phonics_az_sounds',
    domain: 'phonics_english',
    topicTitle: 'Alphabet Letter Sounds A-Z & Phonics Song',
    subject: 'English Phonics',
    videoId: 'BELlZKpi1Zs',
    videoTitle: 'Phonics Song with TWO Words - A For Apple - ABC Alphabet Songs',
    targetPrompt: 'Primary English Phonics: Letter sounds A-Z (a says /æ/, b says /b/, c says /k/...), uppercase and lowercase recognition, sound-to-letter matching with simple 3-letter examples.'
  },
  {
    canonicalKey: 'canonical_phonics_cvc_words',
    domain: 'phonics_english',
    topicTitle: 'CVC 3-Letter Word Blending: -at, -an, -in, -op Words',
    subject: 'English Phonics',
    videoId: 'qWn-gx44wEc',
    videoTitle: 'CVC Words | Phonics 3-Letter Blending For Kindergarten',
    targetPrompt: 'Primary English Phonics: CVC (Consonant-Vowel-Consonant) 3-letter word blending families: -at family (cat, bat, mat, hat), -an family (pan, fan, van), -in family (pin, bin, win). Rhyming exercises.'
  },
  {
    canonicalKey: 'canonical_activity_bedtime_story',
    domain: 'activity_moral',
    topicTitle: 'Bedtime Moral Story & Creative Hands-on Craft',
    subject: 'Creative Lab & Moral Values',
    videoId: 'qV3puciQoMM',
    videoTitle: 'The Thirsty Crow & Moral Stories For Children',
    targetPrompt: 'Kids moral bedtime story (The Clever Thirsty Crow finding pebbles to raise water level) emphasizing perseverance and problem-solving, plus a fun 5-minute hands-on paper folding / drawing craft activity.'
  },
  {
    canonicalKey: 'canonical_science_newton_laws',
    domain: 'science_evs',
    topicTitle: "Newton's Three Laws of Motion & Gravitational Mechanics",
    subject: 'Physics & Science',
    videoId: 'kKKM8Y-u7ds',
    videoTitle: "Newton's Laws of Motion | Physics Crash Course",
    targetPrompt: "High school physics (Class 9/10/11) on Newton's Three Laws of Motion: 1st Law (Inertia), 2nd Law (F = ma & rate of change of momentum), 3rd Law (Action-Reaction pairs). SI units, solved numericals, real-world examples (seatbelts, rocket propulsion)."
  },
  {
    canonicalKey: 'canonical_math_quadratic_equations',
    domain: 'math',
    topicTitle: 'Quadratic Equations, Factorization & Quadratic Formula',
    subject: 'Mathematics',
    videoId: 'I_nJ7t-eD5E',
    videoTitle: 'Quadratic Equations - Solving by Factoring and Formula',
    targetPrompt: '10th Standard / SSLC / CBSE Mathematics on Quadratic Equations: standard form ax^2 + bx + c = 0, discriminant D = b^2 - 4ac, nature of roots, solving by middle-term splitting and quadratic formula x = (-b ± sqrt(D))/(2a).'
  },
  {
    canonicalKey: 'canonical_cs_python_basics',
    domain: 'coding_tech',
    topicTitle: 'Python Programming Foundations: Variables, Loops & Functions',
    subject: 'Computer Science & AI',
    videoId: '_uQrJ0TkZlc',
    videoTitle: 'Python Tutorial for Beginners - Full Course in 1 Hour',
    targetPrompt: 'Computer science / programming fundamentals in Python: variable types (int, float, str, list), if/elif/else conditions, for and while loops, defining functions with def, return values, and practical mini code exercises.'
  },
  {
    canonicalKey: 'canonical_polity_fundamental_rights',
    domain: 'polity_exam',
    topicTitle: 'Indian Constitution: Fundamental Rights (Articles 14 to 32) & Writs',
    subject: 'Indian Polity & General Studies',
    videoId: 'MjhvG73P_pM',
    videoTitle: 'Fundamental Rights Articles 12 to 35 | Indian Polity',
    targetPrompt: 'TNPSC & UPSC Indian Polity: Part III Articles 12 to 35, 6 Fundamental Rights (Articles 14-18 Equality, 19-22 Freedom, 23-24 Anti-Exploitation, 25-28 Religion, 29-30 Minority Culture, 32 Constitutional Remedies & 5 Writs: Habeas Corpus, Mandamus, Prohibition, Certiorari, Quo-Warranto).'
  }
];

// ─── 4. GEMINI API GENERATOR HELPER ──────────────────────────────────────────
function callGemini(promptText) {
  return new Promise((resolve, reject) => {
    const key = getNextGeminiKey();
    if (!key) return reject(new Error('No Gemini API keys found'));

    const postData = JSON.stringify({
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json'
      }
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 30000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.candidates && parsed.candidates[0] && parsed.candidates[0].content) {
            const rawText = parsed.candidates[0].content.parts[0].text;
            const json = JSON.parse(rawText);
            resolve(json);
          } else {
            reject(new Error('Invalid Gemini response: ' + data.substring(0, 150)));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Gemini API timeout'));
    });
    req.write(postData);
    req.end();
  });
}

// ─── 5. GENERATE OR FETCH TOPIC CONTENT ──────────────────────────────────────
async function generateTopicContent(def) {
  const prompt = `
You are the Chief Academic Master Teacher for TeachO LMS.
Generate a structured, complete, high-quality, topic-accurate JSON lesson for the following topic ONLY:
Topic: "${def.topicTitle}"
Subject: "${def.subject}"
Domain Instructions: ${def.targetPrompt}

STRICT RULE: Focus 100% on the exact subject matter described above. DO NOT mix unrelated topics (e.g. no grammar or polity on science/EVS topics; no algebra on phonics).

Return a valid JSON matching this exact CoursePlayerContent schema:
{
  "topicKey": "${def.canonicalKey}",
  "topicTitle": "${def.topicTitle}",
  "courseTitle": "${def.standardSubject || def.subject} Masterclass",
  "subject": "${def.subject}",
  "standardOrExam": "School / College / Competitive",
  "dayNumber": 1,
  "videoMeta": {
    "channel": "@aishleetechnology",
    "channelUrl": "https://www.youtube.com/@aishleetechnology",
    "youtubeVideoId": "${def.videoId}",
    "videoTitle": "${def.videoTitle}",
    "durationMinutes": 15,
    "isOfficialAishlee": true
  },
  "notes": {
    "overview": "Clear 2-3 sentence overview in simple Tamil and English.",
    "keyPoints": [
      "4 to 6 authentic bullet points with relevant emojis"
    ],
    "coreConcepts": [
      {
        "heading": "1. Core Foundation",
        "body": "Detailed paragraph explaining the topic.",
        "formulaOrExample": "Key rule, example, or mnemonic"
      },
      {
        "heading": "2. Practical Applications & Real-world Usage",
        "body": "How this concept works in daily life or exams.",
        "formulaOrExample": "Practical illustration"
      }
    ],
    "bilingualExplanation": {
      "tamil": "விரிவான தமிழ் விளக்கம்...",
      "english": "Detailed English explanation..."
    },
    "formulasAndShortcuts": [
      {
        "name": "Key Rule / Memory Trick",
        "formula": "Core formula or memory rhyme",
        "tip": "Exam tip or practical trick"
      }
    ]
  },
  "oneLineQnA": [
    { "question": "Question 1", "answer": "Clear direct answer" },
    { "question": "Question 2", "answer": "Clear direct answer" },
    { "question": "Question 3", "answer": "Clear direct answer" }
  ],
  "fillInTheBlanks": [
    { "sentenceWithBlank": "Sentence with ______ blank space.", "answer": "Word", "hint": "Helpful hint" },
    { "sentenceWithBlank": "Sentence 2 with ______ blank.", "answer": "Word", "hint": "Helpful hint" },
    { "sentenceWithBlank": "Sentence 3 with ______ blank.", "answer": "Word", "hint": "Helpful hint" }
  ],
  "mcqs": [
    {
      "question": "Multiple choice question 1?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Clear explanation of why this answer is correct."
    },
    {
      "question": "Multiple choice question 2?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 1,
      "explanation": "Clear explanation."
    },
    {
      "question": "Multiple choice question 3?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 2,
      "explanation": "Clear explanation."
    },
    {
      "question": "Multiple choice question 4?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Clear explanation."
    }
  ],
  "twoMarkQuestions": [
    {
      "question": "Define/explain topic in 2 marks?",
      "marks": 2,
      "modelAnswer": "Clear 2-mark answer."
    },
    {
      "question": "List key properties or examples? (2 marks)",
      "marks": 2,
      "modelAnswer": "Clear 2-mark answer."
    }
  ],
  "fiveMarkQuestions": [
    {
      "question": "Explain with diagram/steps in 5 marks?",
      "marks": 5,
      "stepByStepSolution": ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"]
    }
  ],
  "essayQuestions": [
    {
      "question": "Comprehensive structured question (10 marks)",
      "marks": 10,
      "structuredOutline": ["Introduction", "Core Principles", "Examples", "Conclusion"],
      "modelEssay": "Full structured model answer."
    }
  ]
}
`;

  try {
    const json = await callGemini(prompt);
    return json;
  } catch (e) {
    console.warn(`[GEMINI FALLBACK for ${def.canonicalKey}]:`, e.message);
    return null;
  }
}

// ─── 6. MAIN SYNC & PERSISTENCE PROCESS ──────────────────────────────────────
// Supports: node sync_teacho_canonical_supabase.js [--day-start N] [--day-end N] [--dry-run]
const args = process.argv.slice(2);
const DAY_START = parseInt(args.find((a, i) => a === '--day-start' && args[i + 1]) ? args[args.indexOf('--day-start') + 1] : '1');
const DAY_END = parseInt(args.find((a, i) => a === '--day-end' && args[i + 1]) ? args[args.indexOf('--day-end') + 1] : '5');
const DRY_RUN = args.includes('--dry-run');
const PROGRESS_FILE = path.join(__dirname, '.sync_progress.json');

function loadProgress() {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    }
  } catch (e) {}
  return { lastTopicIndex: 0, lastDay: DAY_START };
}

function saveProgress(topicIndex, day) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify({ lastTopicIndex: topicIndex, lastDay: day, updatedAt: new Date().toISOString() }), 'utf8');
}

async function runSync() {
  console.log('================================================================');
  console.log('🚀 TEACHO DAY-AWARE CANONICAL SUPABASE SYNC & GENERATOR');
  console.log('================================================================');
  console.log(`Loaded ${CANONICAL_TOPICS.length} Canonical Micro-Topics.`);
  console.log(`Available Gemini Keys: ${GEMINI_KEYS.length}`);
  console.log(`Day Range: Day ${DAY_START} to Day ${DAY_END}`);
  if (DRY_RUN) console.log('🔍 DRY RUN MODE — no API calls or DB writes');

  const catalogDir = path.join(__dirname, '../apps/mobile/src/data/generated_catalog');
  if (!fs.existsSync(catalogDir)) {
    fs.mkdirSync(catalogDir, { recursive: true });
  }

  const progress = loadProgress();
  const generatedIndex = [];
  let totalGenerated = 0;
  let totalSkipped = 0;
  let quotaExhausted = false;

  for (let i = 0; i < CANONICAL_TOPICS.length; i++) {
    if (quotaExhausted) break;
    const def = CANONICAL_TOPICS[i];

    for (let day = DAY_START; day <= DAY_END; day++) {
      if (quotaExhausted) break;

      // Resume support: skip already-processed items
      if (i < progress.lastTopicIndex || (i === progress.lastTopicIndex && day < progress.lastDay)) {
        continue;
      }

      const daySpecificKey = `${def.canonicalKey}_day_${day}`;
      console.log(`\n[Topic ${i + 1}/${CANONICAL_TOPICS.length}, Day ${day}] Processing: ${daySpecificKey}...`);

      if (DRY_RUN) {
        console.log(`  🔍 DRY RUN: Would check/generate for ${daySpecificKey}`);
        totalSkipped++;
        continue;
      }

      // Step A: Check Supabase kindle_content_cache with day-specific key
      let existingContent = null;
      try {
        const { data, error } = await supabase
          .from('kindle_content_cache')
          .select('kindle_json')
          .eq('topic_key', daySpecificKey)
          .limit(1);

        if (!error && data && data.length > 0 && data[0].kindle_json) {
          existingContent = data[0].kindle_json;
          console.log(`  ✅ Found cached content for ${daySpecificKey} — SKIPPING`);
          totalSkipped++;
          continue;
        }

        // Fallback: check day-agnostic key
        const { data: canonData, error: canonError } = await supabase
          .from('kindle_content_cache')
          .select('kindle_json')
          .eq('topic_key', def.canonicalKey)
          .limit(1);

        if (!canonError && canonData && canonData.length > 0 && canonData[0].kindle_json) {
          // Clone and adjust for this specific day
          existingContent = { ...canonData[0].kindle_json, dayNumber: day, topicKey: daySpecificKey };
          console.log(`  ♻️ Reusing canonical content with day override for Day ${day}`);
        }
      } catch (e) {
        console.warn('  Supabase check warning:', e.message);
      }

      // Step B: If missing, generate via Gemini API
      if (!existingContent) {
        console.log(`  ✨ Generating Day ${day} content via Gemini 2.5 Flash...`);
        try {
          existingContent = await generateTopicContent({
            ...def,
            canonicalKey: daySpecificKey,
            targetPrompt: def.targetPrompt + ` This is content for DAY ${day} of the course. Tailor difficulty and focus appropriately for day ${day} progression.`
          });
        } catch (genErr) {
          if (genErr.message && (genErr.message.includes('429') || genErr.message.includes('quota') || genErr.message.includes('RESOURCE_EXHAUSTED'))) {
            console.error(`\n🛑 QUOTA EXHAUSTED at Topic ${i + 1}, Day ${day}. Saving progress and exiting.`);
            saveProgress(i, day);
            quotaExhausted = true;
            break;
          }
          console.warn(`  ⚠️ Generation failed: ${genErr.message}`);
          continue;
        }
      }

      if (!existingContent) {
        console.error(`  ❌ Failed to generate content for ${daySpecificKey}`);
        continue;
      }

      // Ensure dayNumber is correct
      existingContent.dayNumber = day;
      existingContent.topicKey = daySpecificKey;

      // Step C: Persist to Supabase kindle_content_cache with day-specific key
      try {
        const { error: kErr } = await supabase
          .from('kindle_content_cache')
          .upsert({
            topic_key: daySpecificKey,
            topic_title: def.topicTitle,
            course_title: def.standardSubject || def.subject,
            kindle_json: existingContent,
            generated_at: new Date().toISOString(),
            model_used: 'gemini-2.5-flash'
          }, { onConflict: 'topic_key' });

        if (kErr) {
          console.warn('  Supabase kindle_content_cache upsert note:', kErr.message);
        } else {
          console.log('  💾 Persisted to Supabase kindle_content_cache successfully');
        }
      } catch (e) {
        console.warn('  Supabase kindle error:', e.message);
      }

      // Step D: Persist to Supabase unified_master_data
      try {
        const { error: uErr } = await supabase
          .from('unified_master_data')
          .upsert({
            item_type: 'o_course_micro_topic_content',
            title_name: `${def.topicTitle} (Day ${day})`,
            category: def.subject,
            language: 'Bilingual',
            description: `${def.subject} Day ${day} micro-topic lesson: ${def.topicTitle}`,
            additional_info: {
              canonicalTopicKey: daySpecificKey,
              dayNumber: day,
              topicTitle: def.topicTitle,
              subject: def.subject,
              content: existingContent
            }
          });

        if (uErr) {
          console.warn('  Supabase unified_master_data upsert note:', uErr.message);
        } else {
          console.log('  💾 Persisted to Supabase unified_master_data successfully');
        }
      } catch (e) {
        console.warn('  Supabase unified error:', e.message);
      }

      // Step E: Save local bundled JSON file
      const safeFileName = `${daySpecificKey}.json`;
      const filePath = path.join(catalogDir, safeFileName);
      fs.writeFileSync(filePath, JSON.stringify(existingContent, null, 2), 'utf8');
      generatedIndex.push({
        key: daySpecificKey,
        file: `./${safeFileName}`,
        topicTitle: `${def.topicTitle} (Day ${day})`,
        subject: def.subject
      });
      console.log(`  📦 Saved local bundle: ${safeFileName}`);
      totalGenerated++;

      // Save progress after each successful generation
      saveProgress(i, day + 1);

      // Rate limiting: small delay between API calls
      await new Promise(r => setTimeout(r, 500));
    }
  }

  // Step F: Update generated_catalog/index.ts (append new entries)
  const indexTsPath = path.join(catalogDir, 'index.ts');
  let indexTsContent = '/**\n * Auto-generated TeachO Bundled Course Catalog Index\n * Day-Aware Canonical Micro-Topic Content\n */\n\n';

  // Read all existing JSON files in the catalog dir
  const allJsonFiles = fs.readdirSync(catalogDir).filter(f => f.endsWith('.json'));
  allJsonFiles.forEach((file, idx) => {
    const key = file.replace('.json', '');
    const importName = `catalog_item_${idx}`;
    indexTsContent += `import ${importName} from './${file}';\n`;
  });

  indexTsContent += '\nexport const BUNDLED_COURSE_CATALOG: Record<string, any> = {\n';
  allJsonFiles.forEach((file, idx) => {
    const key = file.replace('.json', '');
    const importName = `catalog_item_${idx}`;
    indexTsContent += `  '${key}': ${importName},\n`;
  });
  indexTsContent += '};\n';

  fs.writeFileSync(indexTsPath, indexTsContent, 'utf8');

  console.log(`\n================================================================`);
  console.log(`📊 SYNC COMPLETE`);
  console.log(`  Generated: ${totalGenerated} | Skipped (cached): ${totalSkipped}`);
  console.log(`  Total catalog files: ${allJsonFiles.length}`);
  if (quotaExhausted) {
    console.log(`  ⚠️ Quota exhausted — resume with: node sync_teacho_canonical_supabase.js --day-start ${DAY_START} --day-end ${DAY_END}`);
  } else {
    // Clear progress file on successful completion
    try { fs.unlinkSync(PROGRESS_FILE); } catch (e) {}
  }
  console.log('================================================================');
}

runSync();

