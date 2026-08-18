import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

// ── Supabase LMS client (server-side) ──────────────────────────
const LMS_URL  = process.env.NEXT_PUBLIC_LMS_SUPABASE_URL!;
const LMS_KEY  = process.env.NEXT_PUBLIC_LMS_SUPABASE_ANON_KEY!;
const lms      = createClient(LMS_URL, LMS_KEY);

// ── Gemini model fallback hierarchy ────────────────────────────
const CANDIDATE_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-2.5-pro',
  'gemini-1.5-pro',
];

// ── Round-robin key rotation ──────────────────────────────────
let keyIndex = 0;
function getNextApiKey(): string {
  const pool = process.env.GEMINI_API_KEYS?.split(',').map(k => k.trim()).filter(Boolean) || [];
  const primary = process.env.GEMINI_API_KEY;
  if (primary && pool.length === 0) return primary;
  if (pool.length === 0 && !primary) throw new Error('No Gemini API keys configured');
  const keys = pool.length > 0 ? pool : [primary!];
  const key = keys[keyIndex % keys.length];
  keyIndex++;
  return key;
}

// ── Structured prompt for micro-topic content ─────────────────
function buildPrompt(topicTitle: string, courseTitle: string, board: string, standard: string): string {
  return `You are an expert academic content creator for Indian education (CBSE, TN State Board, competitive exams).

Generate a COMPLETE Kindle study book for this EXACT micro-topic.
- Topic: "${topicTitle}"
- Course: "${courseTitle}"
- Board: "${board}"
- Class/Standard: "${standard}"

Return ONLY valid JSON (no markdown, no code fences, no explanation) with these EXACT fields:
{
  "topicTitle": "${topicTitle}",
  "courseTitle": "${courseTitle}",
  "category": "<subject area>",
  "readingTime": "<X> min read",
  "overview": "<2-paragraph academic overview, 120-180 words, SPECIFIC to this exact topic>",
  "coreConcepts": [
    { "heading": "<concept 1 heading>", "content": "<detailed explanation>", "example": "<real concrete example>" },
    { "heading": "<concept 2 heading>", "content": "<detailed explanation>", "example": "<real concrete example>" },
    { "heading": "<concept 3 heading>", "content": "<detailed explanation>", "example": "<real concrete example>" }
  ],
  "tamilExplanation": {
    "simpleTitle": "<topic in Tamil script>",
    "colloquialIntro": "<Tamil colloquial introduction, 2-3 sentences in Tamil script>",
    "everydayAnalogy": "<Tamil everyday analogy explaining this concept>",
    "keyPointsTamil": ["<key point 1 in Tamil>", "<key point 2 in Tamil>", "<key point 3 in Tamil>"]
  },
  "vsaqs": [
    { "question": "<specific 1-line question>", "answer": "<precise 1-line answer>" },
    { "question": "<specific 1-line question>", "answer": "<precise 1-line answer>" },
    { "question": "<specific 1-line question>", "answer": "<precise 1-line answer>" },
    { "question": "<specific 1-line question>", "answer": "<precise 1-line answer>" },
    { "question": "<specific 1-line question>", "answer": "<precise 1-line answer>" }
  ],
  "shortAnswers": [
    {
      "question": "<2-mark question specific to this topic>",
      "marks": "2 Marks",
      "solutionSteps": ["<step 1>", "<step 2>"],
      "keyTips": "<exam tip>"
    },
    {
      "question": "<5-mark question with derivation/proof>",
      "marks": "5 Marks",
      "solutionSteps": ["<step 1>", "<step 2>", "<step 3>", "<step 4>"],
      "keyTips": "<exam tip>"
    }
  ],
  "mcqs": [
    { "question": "<specific MCQ>", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correct": <0-3 index>, "explanation": "<why correct>" },
    { "question": "<specific MCQ>", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correct": <0-3 index>, "explanation": "<why correct>" },
    { "question": "<specific MCQ>", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correct": <0-3 index>, "explanation": "<why correct>" },
    { "question": "<specific MCQ>", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correct": <0-3 index>, "explanation": "<why correct>" },
    { "question": "<specific MCQ>", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correct": <0-3 index>, "explanation": "<why correct>" }
  ],
  "formulasAndMnemonics": [
    { "formula": "<key formula 1>", "meaning": "<what it means>", "mnemonic": "<memory aid>" },
    { "formula": "<key formula 2>", "meaning": "<what it means>" }
  ]
}

CRITICAL RULES:
1. ALL content must be SPECIFIC to "${topicTitle}" — do NOT use generic templates.
2. MCQ numerical values must be CORRECT and SOLVABLE.
3. Tamil explanations must use proper Tamil script (Unicode).
4. VSAQs must have factually accurate answers.
5. Return ONLY the JSON object. No markdown formatting, no code blocks, no extra text.`;
}

// ── Cache key generator ─────────────────────────────────────
function generateCacheKey(topicTitle: string, courseTitle: string): string {
  const raw = `${topicTitle.trim().toLowerCase()}::${courseTitle.trim().toLowerCase()}`;
  // Simple hash — consistent across requests
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit int
  }
  return `kindle_${Math.abs(hash).toString(36)}`;
}

// ── Main POST handler ────────────────────────────────────────
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { topicTitle, courseTitle, board, standard } = await req.json();
    
    if (!topicTitle) {
      return NextResponse.json({ error: 'topicTitle is required' }, { status: 400 });
    }

    const cleanTopic = topicTitle.trim();
    const cleanCourse = (courseTitle || 'Masterclass Course').trim();
    const cleanBoard = (board || 'General').trim();
    const cleanStandard = (standard || '').trim();
    const cacheKey = generateCacheKey(cleanTopic, cleanCourse);

    // ── Step 1: Check Supabase cache ──────────────────────────
    try {
      const { data: cached } = await lms
        .from('kindle_content_cache')
        .select('kindle_json')
        .eq('topic_key', cacheKey)
        .single();

      if (cached?.kindle_json) {
        const elapsed = Date.now() - startTime;
        return NextResponse.json({
          ...cached.kindle_json,
          _meta: { source: 'cache', latencyMs: elapsed, cacheKey }
        });
      }
    } catch {
      // Cache miss or table doesn't exist yet — continue to AI generation
    }

    // ── Step 2: Generate with Gemini API ────────────────────────
    const apiKey = getNextApiKey();
    const genAI = new GoogleGenerativeAI(apiKey);
    const prompt = buildPrompt(cleanTopic, cleanCourse, cleanBoard, cleanStandard);

    let generatedJson: any = null;
    let usedModel = '';
    let lastError: any = null;

    for (const modelName of CANDIDATE_MODELS) {
      try {
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
            responseMimeType: 'application/json',
          }
        });

        // 8-second timeout per model attempt
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        
        const result = await model.generateContent(prompt);
        clearTimeout(timeout);
        
        const response = await result.response;
        let text = response.text().trim();
        
        // Strip markdown code fences if present
        if (text.startsWith('```')) {
          text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/,'');
        }
        
        generatedJson = JSON.parse(text);
        usedModel = modelName;
        break; // Success — stop trying models
      } catch (err: any) {
        lastError = err;
        console.warn(`[Kindle AI] Model ${modelName} failed:`, err.message?.substring(0, 100));
      }
    }

    if (!generatedJson) {
      return NextResponse.json({
        error: 'AI generation failed across all models',
        fallback: true,
        details: lastError?.message
      }, { status: 503 });
    }

    // ── Step 3: Store in Supabase cache ─────────────────────────
    try {
      await lms.from('kindle_content_cache').upsert({
        topic_key: cacheKey,
        topic_title: cleanTopic,
        course_title: cleanCourse,
        kindle_json: generatedJson,
        generated_at: new Date().toISOString(),
        model_used: usedModel,
      }, { onConflict: 'topic_key' });
    } catch (cacheErr: any) {
      console.warn('[Kindle AI] Cache write failed (non-fatal):', cacheErr.message);
    }

    const elapsed = Date.now() - startTime;
    return NextResponse.json({
      ...generatedJson,
      _meta: { source: 'ai', model: usedModel, latencyMs: elapsed, cacheKey }
    });

  } catch (error: any) {
    console.error('[Kindle AI] Unexpected error:', error);
    return NextResponse.json({
      error: error.message || 'Kindle AI content generation failed',
      fallback: true
    }, { status: 500 });
  }
}
