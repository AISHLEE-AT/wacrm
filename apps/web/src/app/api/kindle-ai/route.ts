import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

// ── Supabase LMS client (server-side) ──────────────────────────
const LMS_URL = process.env.NEXT_PUBLIC_LMS_SUPABASE_URL || 'https://jjgdatjthyeesmgunnlp.supabase.co';
const LMS_KEY = process.env.NEXT_PUBLIC_LMS_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZ2RhdGp0aHllZXNtZ3VubmxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MzU5NTYsImV4cCI6MjEwMDIxMTk1Nn0.iuSdvxW9VEtn_1yVLmf9ZN24CeXFxmF3aeVHEn-Dgcs';
const lms = createClient(LMS_URL, LMS_KEY);

// ── Gemini model fallback hierarchy ────────────────────────────
const CANDIDATE_MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-1.5-flash',
  'gemini-2.5-pro',
  'gemini-1.5-pro',
];

// ── Round-robin key rotation ──────────────────────────────────
let keyIndex = 0;
function getNextApiKey(): string {
  const pool = process.env.GEMINI_API_KEYS?.split(',').map(k => k.trim()).filter(Boolean) || [];
  const primary = process.env.GEMINI_API_KEY?.trim();
  if (primary && !pool.includes(primary)) pool.unshift(primary);
  if (pool.length === 0) throw new Error('No Gemini API keys configured');
  const key = pool[keyIndex % pool.length];
  keyIndex++;
  return key;
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
      adminContent = null
    } = body;

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
        const { data: cached } = await lms
          .from('kindle_content_cache')
          .select('kindle_json, model_used')
          .eq('topic_key', primaryKey)
          .single();

        if (cached?.kindle_json) {
          const item = cached.kindle_json;
          // If valid rich content or admin verified, return immediately (0ms)
          if (item && item.overview && item.mcqs && item.mcqs.length > 0) {
            const elapsed = Date.now() - startTime;
            return NextResponse.json({
              ...item,
              _meta: {
                source: 'cache',
                isAdminVerified: Boolean(item.is_admin_verified || cached.model_used === 'admin-studio'),
                latencyMs: elapsed,
                cacheKey: primaryKey
              }
            });
          }
        }
      } catch {
        // Cache miss — proceed to live JIT generation
      }
    }

    // ── Step 2: Live JIT Generation with Gemini API ────────────
    let generatedJson: any = null;
    let usedModel = '';
    let lastError: any = null;

    try {
      const apiKey = getNextApiKey();
      const genAI = new GoogleGenerativeAI(apiKey);
      const prompt = buildPrompt(cleanTopic, cleanCourse, cleanBoard, cleanStandard, dayNumber);

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
          break;
        } catch (err: any) {
          lastError = err;
          console.warn(`[Kindle JIT AI] Model ${modelName} attempt failed:`, err.message?.substring(0, 100));
        }
      }
    } catch (keyErr: any) {
      lastError = keyErr;
    }

    if (!generatedJson) {
      return NextResponse.json({
        error: 'AI generation failed across all models',
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
        model_used: usedModel || 'gemini-jit-live',
      }, { onConflict: 'topic_key' });
    } catch (cacheErr: any) {
      console.warn('[Kindle AI] Cache write failed (non-fatal):', cacheErr.message);
    }

    const elapsed = Date.now() - startTime;
    return NextResponse.json({
      ...generatedJson,
      _meta: { source: 'jit-generated', model: usedModel, latencyMs: elapsed, cacheKey: primaryKey }
    });

  } catch (error: any) {
    console.error('[Kindle AI] Unexpected error:', error);
    return NextResponse.json({
      error: error.message || 'Kindle AI content generation failed',
      fallback: true
    }, { status: 500 });
  }
}
