import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

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
  const pool = process.env.GEMINI_API_KEYS?.split(',').map(k => k.trim()).filter(Boolean) || [];
  const primary = process.env.GEMINI_API_KEY?.trim();
  if (primary && !pool.includes(primary)) pool.unshift(primary);
  
  // Known active fallback key pool
  // Load from server environment
  const envPool = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '').split(',').map(k => k.trim()).filter(Boolean);
  envPool.forEach(k => {
    if (!pool.includes(k)) pool.push(k);
  });

  pool.forEach(k => {
    if (!keys.includes(k)) keys.push(k);
  });
  return keys;
}

// ── Helper to normalize cached item to Admin & Player schema ──
function normalizeLessonItem(raw: any, primaryKey: string) {
  if (!raw) return null;
  const coreConcepts = raw.coreConcepts?.length ? raw.coreConcepts : (raw.studyNotes || []).map((sn: any) => ({
    heading: sn.sectionTitle || 'Core Concept',
    content: sn.content || '',
    example: sn.example || ''
  }));

  const mcqs = raw.mcqs?.length ? raw.mcqs : (raw.practiceQuiz || []).map((pq: any, i: number) => ({
    id: `q${i + 1}`,
    question: pq.question || '',
    options: pq.options || ['A', 'B', 'C', 'D'],
    correctAnswer: pq.correctIndex ?? pq.correctAnswer ?? 0,
    explanation: pq.explanation || ''
  }));

  const vsaqs = raw.vsaqs?.length ? raw.vsaqs : (raw.flashcards || []).map((fc: any) => ({
    question: fc.front || 'Key Question',
    answer: fc.back || '',
    marks: 2
  }));

  const formulasAndMnemonics = raw.formulasAndMnemonics?.length ? raw.formulasAndMnemonics : [
    { name: raw.topicTitle || 'Core Formula', formula: 'Key Principles & Steps', mnemonic: 'Active Recall Rule' }
  ];

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
    videoMeta: raw.videoMeta || {
      youtubeVideoId: raw.videoId || '0TgLtF3PMOc',
      videoTitle: raw.videoTitle || raw.topicTitle || 'Masterclass',
      channelName: 'TeachO 1-on-1 Tuition'
    },
    videoId: raw.videoId || raw.videoMeta?.youtubeVideoId || '0TgLtF3PMOc'
  };
}

// ── Structured prompt for micro-topic content ─────────────────
function buildPrompt(topicTitle: string, courseTitle: string, board: string, standard: string, dayNumber?: number): string {
  return `You are an expert academic content creator for Indian education (CBSE NCERT, TN State Board Samacheer, TNPSC, and NEET).

Generate a COMPLETE Kindle study book and interactive lesson for this EXACT micro-topic.
- Topic: "${topicTitle}"
- Course: "${courseTitle}"
- Board: "${board}"
- Class/Standard: "${standard}"
${dayNumber ? `- Day Number: ${dayNumber}` : ''}

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
function generateCacheKey(topicTitle: string, courseTitle: string, courseId?: string, dayNumber?: number): string {
  if (courseId && dayNumber) {
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
      board,
      standard,
      forceRefresh = false,
      isAdminEdit = false,
      adminContent = null,
      userGeminiKey = null,
    } = body;

    const headerUserKey = req.headers.get('x-user-gemini-key');
    const effectiveUserKey = userGeminiKey || headerUserKey;

    if (!topicTitle && !adminContent) {
      return NextResponse.json({ error: 'topicTitle or adminContent is required' }, { status: 400 });
    }

    const cleanTopic = (topicTitle || adminContent?.topicTitle || '').trim();
    const cleanCourse = (courseTitle || adminContent?.courseTitle || 'Master Course').trim();
    const cleanBoard = (board || 'General').trim();
    const cleanStandard = (standard || '').trim();
    const primaryKey = generateCacheKey(cleanTopic, cleanCourse, courseId, dayNumber);

    // ── Handle Admin Direct Save / Publish ────────────────────
    if (isAdminEdit && adminContent) {
      try {
        const payloadToSave = {
          ...adminContent,
          is_admin_verified: true,
          updated_at: new Date().toISOString(),
          courseId: courseId || adminContent.courseId,
          dayNumber: dayNumber || adminContent.dayNumber || 1,
        };

        await lms.from('kindle_content_cache').upsert({
          topic_key: primaryKey,
          topic_title: cleanTopic,
          course_title: cleanCourse,
          kindle_json: payloadToSave,
          generated_at: new Date().toISOString(),
          model_used: 'admin-studio',
        }, { onConflict: 'topic_key' });

        return NextResponse.json({
          success: true,
          content: payloadToSave,
          _meta: { source: 'admin-published', topicKey: primaryKey }
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
          courseId && dayNumber ? `${courseId}_day_${dayNumber}` : null,
          courseId && dayNumber ? `${courseId}_day_${dayNumber}_task_1` : null,
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
                  isAdminVerified: Boolean(normalized.is_admin_verified || cached.model_used === 'admin-studio'),
                  latencyMs: elapsed,
                  cacheKey: cKey
                }
              });
            }
          }
        }

        // Check local bundle & harvest fallback files
        const localCandidates = [
          path.join(process.cwd(), 'src/data/generated_catalog', `${primaryKey}.json`),
          courseId && dayNumber ? path.join(process.cwd(), 'src/data/generated_catalog', `${courseId}_day_${dayNumber}.json`) : null,
          courseId && dayNumber ? path.join(process.cwd(), 'src/data/generated_catalog', `${courseId}_day_${dayNumber}_task_1.json`) : null,
          courseId && dayNumber ? `D:/doc/MULTI_DAY_HARVEST/json_by_day/${courseId}_day_${dayNumber}.json` : null,
        ].filter(Boolean) as string[];

        for (const fPath of localCandidates) {
          if (fs.existsSync(fPath)) {
            try {
              const fileContent = JSON.parse(fs.readFileSync(fPath, 'utf8'));
              const normalized = normalizeLessonItem(fileContent, primaryKey);
              if (normalized) {
                const elapsed = Date.now() - startTime;
                return NextResponse.json({
                  ...normalized,
                  _meta: {
                    source: 'local-file-bundle',
                    isAdminVerified: false,
                    latencyMs: elapsed,
                    cacheKey: primaryKey
                  }
                });
              }
            } catch {}
          }
        }
      } catch (err) {
        // Cache miss — proceed to live JIT generation
      }
    }

    // ── Step 2: Live JIT Generation with Candidate Keys ────────
    const candidateKeys = getCandidateApiKeys(effectiveUserKey);
    if (candidateKeys.length === 0) {
      return NextResponse.json({
        error: 'No Gemini API key available. Please add your Gemini API key in your Profile.',
        fallback: true
      }, { status: 400 });
    }

    const prompt = buildPrompt(cleanTopic, cleanCourse, cleanBoard, cleanStandard, dayNumber);
    let generatedJson: any = null;
    let usedModel = '';
    let usedKeyType = '';
    let lastError: any = null;

    // Try keys starting with user's personal key
    for (let kIdx = 0; kIdx < candidateKeys.length; kIdx++) {
      const apiKey = candidateKeys[kIdx];
      const isUserKey = Boolean(effectiveUserKey && apiKey === effectiveUserKey.trim());
      const genAI = new GoogleGenerativeAI(apiKey);

      for (const modelName of CANDIDATE_MODELS) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
              temperature: 0.6,
              maxOutputTokens: 8192,
              responseMimeType: 'application/json',
            }
          });

          const result = await model.generateContent(prompt);
          const response = await result.response;
          let text = response.text().trim();

          if (text.startsWith('```')) {
            text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
          }

          generatedJson = JSON.parse(text);
          usedModel = modelName;
          usedKeyType = isUserKey ? 'user-profile-key' : 'system-key-pool';
          break;
        } catch (err: any) {
          lastError = err;
          console.warn(`[Kindle JIT AI] Key #${kIdx} (${isUserKey ? 'user' : 'system'}) Model ${modelName} attempt failed:`, err.message?.substring(0, 100));
        }
      }

      if (generatedJson) break; // Successfully generated
    }

    if (!generatedJson) {
      return NextResponse.json({
        error: 'AI generation failed across all available keys and models',
        fallback: true,
        details: lastError?.message
      }, { status: 503 });
    }

    // ── Step 3: Store in Supabase cache for all future users ───
    try {
      generatedJson.courseId = courseId;
      generatedJson.dayNumber = dayNumber;

      await lms.from('kindle_content_cache').upsert({
        topic_key: primaryKey,
        topic_title: cleanTopic,
        course_title: cleanCourse,
        kindle_json: generatedJson,
        generated_at: new Date().toISOString(),
        model_used: `${usedModel} (${usedKeyType})`,
      }, { onConflict: 'topic_key' });
    } catch (cacheErr: any) {
      console.warn('[Kindle AI] Cache write failed (non-fatal):', cacheErr.message);
    }

    const elapsed = Date.now() - startTime;
    return NextResponse.json({
      ...generatedJson,
      _meta: {
        source: 'jit-generated',
        model: usedModel,
        keySource: usedKeyType,
        latencyMs: elapsed,
        cacheKey: primaryKey
      }
    });

  } catch (error: any) {
    console.error('[Kindle AI] Unexpected error:', error);
    return NextResponse.json({
      error: error.message || 'Kindle AI content generation failed',
      fallback: true
    }, { status: 500 });
  }
}
