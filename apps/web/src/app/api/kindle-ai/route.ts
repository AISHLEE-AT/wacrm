import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { resolveMasterSequentialSyllabus } from '@/data/curriculum/masterCurriculumRegistry';

// ── Supabase LMS client (server-side) ──────────────────────────
const LMS_URL = process.env.NEXT_PUBLIC_LMS_SUPABASE_URL || 'https://jjgdatjthyeesmgunnlp.supabase.co';
const LMS_KEY = process.env.NEXT_PUBLIC_LMS_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZ2RhdGp0aHllZXNtZ3VubmxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MzU5NTYsImV4cCI6MjEwMDIxMTk1Nn0.iuSdvxW9VEtn_1yVLmf9ZN24CeXFxmF3aeVHEn-Dgcs';
const lms = createClient(LMS_URL, LMS_KEY);

// ── Gemini model fallback hierarchy ────────────────────────────
const CANDIDATE_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.1-flash-lite-preview',
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-1.5-flash',
  'gemini-2.5-pro',
  'gemini-1.5-pro',
];

// ── Key pool builder with user-saved profile key priority ───────
function getCandidateApiKeys(userProvidedKey?: string | null): string[] {
  const keys: string[] = [];
  if (userProvidedKey && userProvidedKey.trim().length > 10) {
    keys.push(userProvidedKey.trim());
  }
  const pool = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '').split(',').map(k => k.trim()).filter(Boolean);
  pool.forEach(k => {
    if (!keys.includes(k)) keys.push(k);
  });
  return keys;
}

// ── Deep Unicode Sanitizer ─────────────────────────────────────
function cleanUnicodeString(str: any): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/\uFFFD/g, '')
    .replace(/[\u0080-\u009F]/g, '')
    .replace(/[^\x20-\x7E\u0B80-\u0BFF\u0900-\u097F\u0A80-\u0AFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F\n\r\t.,!?:;'"()\[\]{}\/\\+\-*=<>%@#$&_~`^|—–•✓✗🏆🔥✨📚🎒📝💡📖]/gu, '')
    .trim();
}

function deepSanitize(obj: any): any {
  if (typeof obj === 'string') return cleanUnicodeString(obj);
  if (Array.isArray(obj)) return obj.map(deepSanitize);
  if (obj !== null && typeof obj === 'object') {
    const res: any = {};
    for (const [k, v] of Object.entries(obj)) {
      res[cleanUnicodeString(k)] = deepSanitize(v);
    }
    return res;
  }
  return obj;
}

// ── Helper to normalize cached item to Admin & Player schema ──
function normalizeLessonItem(rawInput: any, primaryKey: string) {
  if (!rawInput) return null;
  const raw = deepSanitize(rawInput);
  const coreConcepts = raw.coreConcepts?.length ? raw.coreConcepts : (raw.studyNotes || []).map((sn: any) => ({
    heading: sn.sectionTitle || sn.heading || 'Core Concept',
    content: sn.content || sn.body || '',
    example: sn.example || sn.formulaOrExample || ''
  }));

  const mcqs = (raw.mcqs?.length ? raw.mcqs : (raw.practiceQuiz || [])).map((pq: any, i: number) => ({
    id: pq.id || `q${i + 1}`,
    question: pq.question || 'Review Question',
    options: Array.isArray(pq.options) && pq.options.length >= 2 ? pq.options : ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: pq.correctAnswer !== undefined ? pq.correctAnswer : (pq.correctIndex !== undefined ? pq.correctIndex : 0),
    explanation: pq.explanation || 'Verified curriculum standard answer.'
  }));

  const vsaqs = (raw.vsaqs?.length ? raw.vsaqs : (raw.flashcards || raw.twoMarkQuestions || raw.oneLineQnA || [])).map((fc: any) => ({
    question: fc.question || fc.front || 'Key Question',
    answer: fc.answer || fc.modelAnswer || fc.back || 'Key Concept Definition',
    marks: 2
  }));

  const formulasAndMnemonics = raw.formulasAndMnemonics?.length ? raw.formulasAndMnemonics : (raw.notes?.formulasAndShortcuts?.length ? raw.notes.formulasAndShortcuts.map((f: any) => ({
    name: f.name || 'Master Rule',
    formula: f.formula || 'Standard Formulation',
    mnemonic: f.tip || f.mnemonic || 'Exam Recall Tip'
  })) : [
    { name: `${raw.topicTitle || 'Lesson'} Master Rule`, formula: 'Standard Method', mnemonic: 'Active Recall Rule' }
  ]);

  return {
    ...raw,
    topicTitle: raw.topicTitle || raw.title || '',
    category: raw.category || raw.subject || 'Academic',
    overview: raw.overview || raw.notes?.overview || '',
    coreConcepts,
    studyNotes: raw.studyNotes || coreConcepts.map((c: any) => ({ sectionTitle: c.heading, content: c.content })),
    mcqs,
    practiceQuiz: raw.practiceQuiz || mcqs.map((m: any) => ({ question: m.question, options: m.options, correctIndex: m.correctAnswer, explanation: m.explanation })),
    vsaqs,
    flashcards: raw.flashcards || vsaqs.map((v: any) => ({ front: v.question, back: v.answer })),
    formulasAndMnemonics,
    tamilExplanation: raw.tamilExplanation || raw.notes?.tamilExplanation || {
      simpleTitle: raw.topicTitle || '',
      colloquialIntro: 'பாடத்தின் சுருக்கம் மற்றும் எளிய தமிழ் விளக்கம்.',
      everydayAnalogy: 'வாழ்வியல் ஒப்பீடு.',
      keyPointsTamil: ['முக்கிய கருத்து 1', 'முக்கிய கருத்து 2', 'முக்கிய கருத்து 3']
    },
    videoMeta: raw.videoMeta || {
      youtubeVideoId: raw.videoId || '0TgLtF3PMOc',
      videoTitle: raw.videoTitle || raw.topicTitle || 'Masterclass',
      channelName: 'TeachO 1-on-1 Tuition'
    },
    videoId: raw.videoId || raw.videoMeta?.youtubeVideoId || '0TgLtF3PMOc'
  };
}

// ── Multi-Day & Multi-Section Curriculum Synthesizer ──────────
function synthesizeDaySpecificCurriculum(courseId: string, courseTitle: string, dayNumber: number, board?: string, taskNumber?: number) {
  const safeDay = Math.max(1, dayNumber || 1);
  const safeTask = Math.max(1, taskNumber || 1);

  const sequential = resolveMasterSequentialSyllabus(courseId, courseTitle, safeDay, safeTask);

  return {
    topicTitle: sequential.topicTitle,
    courseTitle: courseTitle,
    category: sequential.subject,
    subject: sequential.subject,
    subtopic: sequential.subtopic,
    chapterTitle: sequential.chapterTitle,
    dayNumber: safeDay,
    taskNumber: safeTask,
    overview: sequential.overview,
    coreConcepts: sequential.keyConcepts,
    tamilExplanation: {
      simpleTitle: sequential.tamilTitle,
      colloquialIntro: sequential.tamilIntro,
      everydayAnalogy: 'நமது அன்றாட வாழ்வியல் உதாரணங்கள் மூலம் இந்த கருத்தை எளிதாக நினைவில் கொள்ளலாம்.',
      keyPointsTamil: [
        `கருத்து 1: ${sequential.topicTitle} அடிப்படைக் கோட்பாடுகள்`,
        `கருத்து 2: தேர்வுக்கான முக்கிய சூத்திரங்கள்: ${sequential.formulaOrLaw}`,
        `கருத்து 3: நினைவில் கொள்ள வேண்டிய எளிய குறுக்குவழிகள்`
      ]
    },
    vsaqs: sequential.vsaqs.map(v => ({ ...v, marks: 2 })),
    mcqs: sequential.mcqs.map((m, idx) => ({
      id: `q${idx + 1}`,
      question: m.question,
      options: m.options,
      correctAnswer: m.correctAnswer,
      explanation: m.explanation
    })),
    formulasAndMnemonics: [
      { name: `${sequential.topicTitle} Master Rule`, formula: sequential.formulaOrLaw, mnemonic: 'Active Recall Examination Rule' }
    ],
    videoMeta: sequential.videoMeta || {
      youtubeVideoId: sequential.youtubeVideoId || 'LgCg_1yP6_M',
      videoTitle: `${sequential.topicTitle} Masterclass`,
      channelName: 'TeachO Masterclass'
    },
    videoId: sequential.youtubeVideoId || 'LgCg_1yP6_M'
  };
}

// ── Structured prompt for micro-topic content ─────────────────
function buildPrompt(topicTitle: string, courseTitle: string, board: string, standard: string, dayNumber?: number, taskNumber?: number): string {
  return `You are an expert academic content creator for Indian education (CBSE NCERT, TN State Board Samacheer, TNPSC, and NEET).

Generate a COMPLETE Kindle study book and interactive lesson for this EXACT micro-topic.
- Topic: "${topicTitle}"
- Course: "${courseTitle}"
- Board: "${board}"
- Class/Standard: "${standard}"
${dayNumber ? `- Day Number: ${dayNumber}` : ''}
${taskNumber ? `- Section/Task Number: ${taskNumber}` : ''}

Return ONLY valid JSON (no markdown, no code fences, no explanation) with these EXACT fields:
{
  "topicTitle": "${topicTitle}",
  "courseTitle": "${courseTitle}",
  "category": "<subject area>",
  "readingTime": "6 min read",
  "overview": "<2-paragraph academic overview, 120-180 words, SPECIFIC to this exact topic with key definitions>",
  "coreConcepts": [
    { "heading": "<concept 1 heading>", "content": "<detailed academic explanation>", "example": "<real concrete mathematical or scientific example>" },
    { "heading": "<concept 2 heading>", "content": "<detailed academic explanation>", "example": "<real concrete mathematical or scientific example>" },
    { "heading": "<concept 3 heading>", "content": "<detailed academic explanation>", "example": "<real concrete mathematical or scientific example>" }
  ],
  "tamilExplanation": {
    "simpleTitle": "<topic in Tamil script>",
    "colloquialIntro": "<Tamil colloquial introduction, 2-3 sentences in Tamil script>",
    "everydayAnalogy": "<Tamil everyday analogy explaining this concept>",
    "keyPointsTamil": ["<key point 1 in Tamil>", "<key point 2 in Tamil>", "<key point 3 in Tamil>"]
  },
  "vsaqs": [
    { "question": "<specific 1-line question>", "answer": "<precise 1-line answer>", "marks": 2 },
    { "question": "<specific 1-line question>", "answer": "<precise 1-line answer>", "marks": 2 }
  ],
  "shortAnswers": [
    {
      "question": "<2-mark or 3-mark analytical question specific to this topic>",
      "points": ["<step 1>", "<step 2>", "<step 3>"],
      "marks": 3
    }
  ],
  "mcqs": [
    { "id": "q1", "question": "<specific MCQ 1>", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correctAnswer": 0, "explanation": "<step-by-step why correct>" },
    { "id": "q2", "question": "<specific MCQ 2>", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correctAnswer": 0, "explanation": "<step-by-step why correct>" },
    { "id": "q3", "question": "<specific MCQ 3>", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correctAnswer": 0, "explanation": "<step-by-step why correct>" },
    { "id": "q4", "question": "<specific MCQ 4>", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correctAnswer": 0, "explanation": "<step-by-step why correct>" }
  ],
  "formulasAndMnemonics": [
    { "name": "${topicTitle} Master Equation", "formula": "<key formula or theorem>", "mnemonic": "<memory aid or shortcut>" }
  ]
}

CRITICAL RULES:
1. ALL content must be 100% SPECIFIC to "${topicTitle}" — do NOT use generic placeholder templates.
2. MCQ numerical values and formulas must be CORRECT and FACTUAL.
3. Tamil explanations must use proper Unicode Tamil script.
4. Return ONLY valid raw JSON object.`;
}

// ── Cache key generator ─────────────────────────────────────
function generateCacheKey(topicTitle: string, courseTitle: string, courseId?: string, dayNumber?: number, taskNumber?: number): string {
  if (courseId && dayNumber) {
    if (taskNumber && taskNumber > 1) {
      return `${courseId}_day_${dayNumber}_task_${taskNumber}`;
    }
    return `${courseId}_day_${dayNumber}`;
  }
  const raw = `${topicTitle.trim().toLowerCase()}::${courseTitle.trim().toLowerCase()}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `kindle_${Math.abs(hash).toString(36)}`;
}

// ── Main POST handler ────────────────────────────────────────
export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await req.json();
    const {
      topicTitle,
      courseTitle,
      courseId,
      dayNumber,
      taskNumber,
      sectionNumber,
      board,
      standard,
      forceRefresh = false,
      isAdminEdit = false,
      adminContent = null,
      userGeminiKey = null,
    } = body;

    const headerUserKey = req.headers.get('x-user-gemini-key');
    const effectiveUserKey = userGeminiKey || headerUserKey;

    const safeDay = Math.max(1, parseInt(dayNumber || '1', 10));
    const safeTask = parseInt(taskNumber || sectionNumber || '1', 10) || 1;
    const cleanCourseId = (courseId || '').trim();
    const cleanCourse = (courseTitle || adminContent?.courseTitle || 'Master Course').trim();
    const cleanBoard = (board || 'General').trim();
    const cleanStandard = (standard || '').trim();
    
    // Auto-resolve authentic day and section topic from master sequential curriculum
    let cleanTopic = (topicTitle || adminContent?.topicTitle || '').trim();
    if (!cleanTopic || cleanTopic === `${cleanCourse} Day ${safeDay}`) {
      const syn = synthesizeDaySpecificCurriculum(cleanCourseId, cleanCourse, safeDay, cleanBoard, safeTask);
      cleanTopic = syn.topicTitle;
    }

    const primaryKey = generateCacheKey(cleanTopic, cleanCourse, cleanCourseId, safeDay, safeTask);

    // ── Handle Admin Direct Save / Publish ────────────────────
    if (isAdminEdit && adminContent) {
      try {
        const payloadToSave = {
          ...adminContent,
          is_admin_verified: true,
          updated_at: new Date().toISOString(),
          courseId: cleanCourseId || adminContent.courseId,
          dayNumber: safeDay || adminContent.dayNumber || 1,
          taskNumber: safeTask || adminContent.taskNumber || 1,
        };

        // Save section-specific key
        await lms.from('kindle_content_cache').upsert({
          topic_key: primaryKey,
          topic_title: cleanTopic,
          course_title: cleanCourse,
          kindle_json: payloadToSave,
          generated_at: new Date().toISOString(),
          model_used: 'admin-studio',
        }, { onConflict: 'topic_key' });

        // If this is task 1, also update day root key
        if (safeTask === 1 && cleanCourseId && safeDay) {
          const rootKey = `${cleanCourseId}_day_${safeDay}`;
          await lms.from('kindle_content_cache').upsert({
            topic_key: rootKey,
            topic_title: cleanTopic,
            course_title: cleanCourse,
            kindle_json: payloadToSave,
            generated_at: new Date().toISOString(),
            model_used: 'admin-studio',
          }, { onConflict: 'topic_key' });
        }

        return NextResponse.json({
          success: true,
          content: payloadToSave,
          _meta: { source: 'admin-published', topicKey: primaryKey, isVerifiedInDb: true }
        });
      } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Failed to save admin content' }, { status: 500 });
      }
    }

    // ── Step 1: Check Supabase cache (unless forceRefresh) ─────
    if (!forceRefresh) {
      try {
        const candidateKeys = [
          primaryKey,
          cleanCourseId && safeDay && safeTask > 1 ? `${cleanCourseId}_day_${safeDay}_task_${safeTask}` : null,
          cleanCourseId && safeDay && safeTask === 1 ? `${cleanCourseId}_day_${safeDay}_task_1` : null,
          cleanCourseId && safeDay ? `${cleanCourseId}_day_${safeDay}` : null,
        ].filter(Boolean) as string[];

        for (const cKey of candidateKeys) {
          const { data: cached } = await lms
            .from('kindle_content_cache')
            .select('kindle_json, model_used')
            .eq('topic_key', cKey)
            .maybeSingle();

          if (cached?.kindle_json) {
            const normalized = normalizeLessonItem(cached.kindle_json, cKey);
            if (normalized && (normalized.overview || normalized.studyNotes?.length || normalized.coreConcepts?.length)) {
              const elapsed = Date.now() - startTime;
              return NextResponse.json({
                ...normalized,
                _meta: {
                  source: 'cache',
                  isVerifiedInDb: true,
                  isAdminVerified: Boolean(normalized.is_admin_verified || cached.model_used === 'admin-studio'),
                  latencyMs: elapsed,
                  cacheKey: cKey
                }
              });
            }
          }
        }

        // Check local bundle fallback files
        const localCandidates = [
          path.join(process.cwd(), 'src/data/generated_catalog', `${primaryKey}.json`),
          cleanCourseId && safeDay && safeTask > 1 ? path.join(process.cwd(), 'src/data/generated_catalog', `${cleanCourseId}_day_${safeDay}_task_${safeTask}.json`) : null,
          cleanCourseId && safeDay ? path.join(process.cwd(), 'src/data/generated_catalog', `${cleanCourseId}_day_${safeDay}_task_1.json`) : null,
          cleanCourseId && safeDay ? path.join(process.cwd(), 'src/data/generated_catalog', `${cleanCourseId}_day_${safeDay}.json`) : null,
        ].filter(Boolean) as string[];

        for (const fpath of localCandidates) {
          if (fs.existsSync(fpath)) {
            try {
              const parsed = JSON.parse(fs.readFileSync(fpath, 'utf8'));
              const normalized = normalizeLessonItem(parsed, primaryKey);
              if (normalized && (normalized.overview || normalized.coreConcepts?.length)) {
                return NextResponse.json({
                  ...normalized,
                  _meta: { source: 'local-bundle', isVerifiedInDb: true, cacheKey: primaryKey, latencyMs: Date.now() - startTime }
                });
              }
            } catch (e) {}
          }
        }
      } catch (cacheErr) {
        console.warn('Cache lookup failed, proceeding:', cacheErr);
      }
    }

    // ── Step 2: Try live Gemini AI generation ────────────────
    const candidateKeys = getCandidateApiKeys(effectiveUserKey);
    let rawContent: any = null;
    let modelUsed = 'synthesizer-academic-core';

    if (candidateKeys.length > 0) {
      const prompt = buildPrompt(cleanTopic, cleanCourse, cleanBoard, cleanStandard, safeDay, safeTask);

      for (const apiKey of candidateKeys) {
        for (const modelName of CANDIDATE_MODELS) {
          try {
            const ai = new GoogleGenerativeAI(apiKey);
            const model = ai.getGenerativeModel({
              model: modelName,
              generationConfig: {
                temperature: 0.2,
                topP: 0.85,
                maxOutputTokens: 2500,
                responseMimeType: 'application/json',
              }
            });

            const result = await model.generateContent(prompt);
            const text = result.response.text();

            if (text && text.length > 50) {
              try {
                rawContent = JSON.parse(text);
                modelUsed = modelName;
                break;
              } catch (parseErr) {
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                  rawContent = JSON.parse(jsonMatch[0]);
                  modelUsed = modelName;
                  break;
                }
              }
            }
          } catch (modelErr: any) {
            continue;
          }
        }
        if (rawContent) break;
      }
    }

    // ── Step 3: Use Master Sequential Syllabus Synthesizer ───
    if (!rawContent) {
      rawContent = synthesizeDaySpecificCurriculum(cleanCourseId, cleanCourse, safeDay, cleanBoard, safeTask);
      modelUsed = 'master-sequential-curriculum';
    }

    const normalized = normalizeLessonItem(rawContent, primaryKey);
    normalized.topicTitle = cleanTopic;
    normalized.courseTitle = cleanCourse;
    normalized.courseId = cleanCourseId;
    normalized.dayNumber = safeDay;
    normalized.taskNumber = safeTask;

    // Asynchronously cache in Supabase
    (async () => {
      try {
        await lms.from('kindle_content_cache').upsert({
          topic_key: primaryKey,
          topic_title: cleanTopic,
          course_title: cleanCourse,
          kindle_json: normalized,
          generated_at: new Date().toISOString(),
          model_used: modelUsed,
        }, { onConflict: 'topic_key' });
      } catch (saveErr) {
        console.warn('Async Supabase caching error:', saveErr);
      }
    })();

    return NextResponse.json({
      ...normalized,
      _meta: {
        source: 'live-generated',
        isVerifiedInDb: false,
        modelUsed,
        topicKey: primaryKey,
        latencyMs: Date.now() - startTime
      }
    });

  } catch (err: any) {
    console.error('API Handler Error:', err);
    return NextResponse.json({
      error: err.message || 'Failed to process request',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }, { status: 500 });
  }
}
