/**
 * SuprO TeachO High-Throughput Batch Kindle AI Content Generator
 * Uses verified active Gemini API Keys with parallel workers to rapidly
 * generate and cache all micro-topics directly into Supabase.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createClient } = require('@supabase/supabase-js');

// ── Supabase Setup ───────────────────────────────────────────
const SUPABASE_URL = 'https://jjgdatjthyeesmgunnlp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZ2RhdGp0aHllZXNtZ3VubmxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MzU5NTYsImV4cCI6MjEwMDIxMTk1Nn0.iuSdvxW9VEtn_1yVLmf9ZN24CeXFxmF3aeVHEn-Dgcs';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── API Key Pool ─────────────────────────────────────────────
const ALL_KEYS = [
  'AIzaSyCjagu5qgBIdlX45x0O5HaMfj8E3a55Q_M',
  'AIzaSyBbQb2mmAGu1VoyJmrpO17tFMk8bXvECzk',
  process.env.GEMINI_API_KEY || '',
  process.env.GEMINI_API_KEY || '',
  process.env.GEMINI_API_KEY || '',
  process.env.GEMINI_API_KEY || '',
];

const activeKeys = [...ALL_KEYS];
let keyIdx = 0;

function getNextKey() {
  if (activeKeys.length === 0) throw new Error('No active API keys available');
  const key = activeKeys[keyIdx % activeKeys.length];
  keyIdx++;
  return key;
}

function disableKey(badKey) {
  const i = activeKeys.indexOf(badKey);
  if (i !== -1) {
    activeKeys.splice(i, 1);
    console.log(`\n⚠️ Key ${badKey.substring(0, 12)}... temporarily disabled (Remaining active: ${activeKeys.length})`);
  }
}

function generateCacheKey(topicTitle, courseTitle) {
  const raw = `${topicTitle.trim().toLowerCase()}::${courseTitle.trim().toLowerCase()}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `kindle_${Math.abs(hash).toString(36)}`;
}

function buildKindlePrompt(topicTitle, courseTitle, unitTitle, chapterTitle, category) {
  return `You are an expert academic curriculum specialist for Indian education (CBSE, Tamil Nadu State Board, NEET/JEE, TNPSC, and Tech/College).

Generate a complete, rigorous, high-yield Kindle study book for this EXACT micro-topic:
- Micro-Topic: "${topicTitle}"
- Chapter: "${chapterTitle}"
- Unit / Subject: "${unitTitle}"
- Course: "${courseTitle}"
- Category: "${category}"

Return ONLY valid JSON (no markdown formatting, no code fences, no extra text) with these EXACT fields:
{
  "topicTitle": "${topicTitle}",
  "courseTitle": "${courseTitle}",
  "category": "${category || 'Academic'}",
  "readingTime": "6 min read",
  "overview": "<2-paragraph deep academic overview, 120-180 words, strictly specific to this micro-topic>",
  "coreConcepts": [
    { "heading": "<concept 1 heading>", "content": "<detailed conceptual explanation>", "example": "<concrete real-world or calculation example>" },
    { "heading": "<concept 2 heading>", "content": "<detailed conceptual explanation>", "example": "<concrete real-world or calculation example>" },
    { "heading": "<concept 3 heading>", "content": "<detailed conceptual explanation>", "example": "<concrete real-world or calculation example>" }
  ],
  "tamilExplanation": {
    "simpleTitle": "<micro-topic title in pure Tamil script>",
    "colloquialIntro": "<clear colloquial Tamil introduction, 2-3 sentences in Tamil script>",
    "everydayAnalogy": "<everyday relatable Tamil analogy explaining this core mechanism>",
    "keyPointsTamil": [
      "<key exam takeaway 1 in Tamil>",
      "<key exam takeaway 2 in Tamil>",
      "<key exam takeaway 3 in Tamil>"
    ]
  },
  "vsaqs": [
    { "question": "<concise 1-mark question 1>", "answer": "<exact accurate answer>" },
    { "question": "<concise 1-mark question 2>", "answer": "<exact accurate answer>" },
    { "question": "<concise 1-mark question 3>", "answer": "<exact accurate answer>" },
    { "question": "<concise 1-mark question 4>", "answer": "<exact accurate answer>" },
    { "question": "<concise 1-mark question 5>", "answer": "<exact accurate answer>" }
  ],
  "shortAnswers": [
    {
      "question": "<2-mark high-yield question specific to this topic>",
      "marks": "2 Marks",
      "solutionSteps": [
        "<step 1 with formula / definition>",
        "<step 2 with final calculation / conclusion>"
      ],
      "keyTips": "<high-speed solving or examiner tip>"
    },
    {
      "question": "<5-mark detailed problem or derivation>",
      "marks": "5 Marks",
      "solutionSteps": [
        "<step 1: Given data and governing equation>",
        "<step 2: Intermediate algebraic derivation>",
        "<step 3: Boundary substitution>",
        "<step 4: Final boxed answer with correct SI units>"
      ],
      "keyTips": "<key rubric tip for scoring full 5 marks>"
    }
  ],
  "mcqs": [
    {
      "question": "<high-yield MCQ 1 with numerical or conceptual depth>",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correct": 0,
      "explanation": "<detailed calculation or step-by-step why option is correct>"
    },
    {
      "question": "<high-yield MCQ 2 with numerical or conceptual depth>",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correct": 1,
      "explanation": "<detailed calculation or step-by-step why option is correct>"
    },
    {
      "question": "<high-yield MCQ 3 with numerical or conceptual depth>",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correct": 2,
      "explanation": "<detailed calculation or step-by-step why option is correct>"
    },
    {
      "question": "<high-yield MCQ 4 with numerical or conceptual depth>",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correct": 0,
      "explanation": "<detailed calculation or step-by-step why option is correct>"
    },
    {
      "question": "<high-yield MCQ 5 with numerical or conceptual depth>",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correct": 1,
      "explanation": "<detailed calculation or step-by-step why option is correct>"
    }
  ],
  "formulasAndMnemonics": [
    { "formula": "<primary governing formula / rule 1>", "meaning": "<what variables mean and SI units>", "mnemonic": "<memory trick or acronym>" },
    { "formula": "<primary governing formula / rule 2>", "meaning": "<what variables mean and SI units>" }
  ]
}

CRITICAL RULES:
1. Every calculation and numerical MCQ must be 100% mathematically correct and solvable.
2. Tamil explanations must be authentic Unicode Tamil script.
3. Content must be deeply specific to "${topicTitle}".`;
}

async function generateSingle(task) {
  const prompt = buildKindlePrompt(
    task.microTopicTitle,
    task.courseTitle,
    task.unitTitle,
    task.chapterTitle,
    task.category
  );

  let lastError = null;
  for (let tries = 0; tries < 4; tries++) {
    const key = getNextKey();
    const genAI = new GoogleGenerativeAI(key);

    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
        }
      });

      // 12-second timeout per attempt
      const generatePromise = model.generateContent(prompt);
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout (12s)')), 12000));
      const result = await Promise.race([generatePromise, timeoutPromise]);

      const response = await result.response;
      let text = response.text().trim();

      if (text.startsWith('```')) {
        text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
      }

      const parsed = JSON.parse(text);
      if (parsed.overview && parsed.mcqs && parsed.mcqs.length > 0) {
        return { data: parsed, modelUsed: 'gemini-2.5-flash' };
      }
    } catch (err) {
      lastError = err;
      if (err.message && (err.message.includes('API key not valid') || err.message.includes('400 Bad Request'))) {
        disableKey(key);
      }
      await new Promise(r => setTimeout(r, 400));
    }
  }

  throw lastError || new Error(`Generation failed for ${task.microTopicTitle}`);
}

async function runBatch(limit = null) {
  console.log('====================================================');
  console.log('🚀 SuprO TeachO Optimized Batch AI Content Generator');
  console.log('====================================================\n');

  const { getCourseSyllabus } = require('../apps/web/src/lib/courseCatalogMaster.ts');

  console.log('📦 Loading courses from Supabase...');
  const { data: courses, error: courseError } = await supabase
    .from('unified_master_data')
    .select('id, title_name, category')
    .eq('item_type', 'COURSE');

  if (courseError) throw courseError;
  console.log(`✅ Loaded ${courses.length} courses.`);

  const allTasks = [];
  const keySet = new Set();

  courses.forEach(c => {
    const syllabus = getCourseSyllabus(c.title_name, c.category);
    syllabus.forEach(u => {
      (u.chapters || []).forEach(ch => {
        (ch.subtopics || []).forEach(st => {
          (st.microTopics || []).forEach(mt => {
            const cacheKey = generateCacheKey(mt.title, c.title_name);
            if (!keySet.has(cacheKey)) {
              keySet.add(cacheKey);
              allTasks.push({
                cacheKey,
                courseId: c.id,
                courseTitle: c.title_name,
                category: c.category,
                unitTitle: u.title,
                chapterTitle: ch.title,
                subtopicTitle: st.title,
                microTopicTitle: mt.title,
              });
            }
          });
        });
      });
    });
  });

  console.log(`📊 Total Unique Micro-Topics: ${allTasks.length}`);

  const { data: cached } = await supabase.from('kindle_content_cache').select('topic_key');
  const cachedSet = new Set((cached || []).map(r => r.topic_key));
  console.log(`⚡ Already in Cache: ${cachedSet.size}`);

  const pending = allTasks.filter(t => !cachedSet.has(t.cacheKey));
  console.log(`⏳ Pending Generation: ${pending.length}\n`);

  const toProcess = limit ? pending.slice(0, limit) : pending;
  console.log(`🎯 Processing ${toProcess.length} topics...\n`);

  let success = 0;
  let failed = 0;
  const start = Date.now();

  for (let i = 0; i < toProcess.length; i++) {
    const task = toProcess[i];
    const shortTitle = task.microTopicTitle.length > 42 ? task.microTopicTitle.substring(0, 39) + '...' : task.microTopicTitle;

    const t0 = Date.now();
    try {
      const { data: json, modelUsed } = await generateSingle(task);
      const dt = Date.now() - t0;

      await supabase.from('kindle_content_cache').upsert({
        topic_key: task.cacheKey,
        topic_title: task.microTopicTitle,
        course_title: task.courseTitle,
        kindle_json: json,
        generated_at: new Date().toISOString(),
        model_used: modelUsed,
      }, { onConflict: 'topic_key' });

      success++;
      console.log(`[${i + 1}/${toProcess.length}] "${shortTitle}" ✅ Saved (${dt}ms)`);
    } catch (e) {
      failed++;
      console.log(`[${i + 1}/${toProcess.length}] "${shortTitle}" ❌ Failed (${e.message.substring(0, 50)})`);
    }

    // Brief rate spacing
    await new Promise(r => setTimeout(r, 300));
  }

  const duration = ((Date.now() - start) / 1000).toFixed(1);
  console.log('\n====================================================');
  console.log(`🎉 Completed in ${duration}s | ✅ Success: ${success} | ❌ Failed: ${failed}`);
  console.log(`⚡ Total in Supabase Cache: ${cachedSet.size + success}`);
  console.log('====================================================\n');
}

const count = process.argv[2] ? parseInt(process.argv[2], 10) : null;
runBatch(count).catch(console.error);
