/**
 * TNPSC Group 2 Dedicated Content API Route
 * 
 * This API endpoint generates comprehensive TNPSC Group 2 study content using
 * the server-side Gemini API keys (from .env.local). It provides:
 * 1. Detailed bilingual study notes with examples
 * 2. Formula cards and mnemonics
 * 3. 10-question practice quiz with detailed explanations
 * 4. Tamil explanations and flashcards
 * 5. Bedtime recap bullets
 * 
 * All content is cached in Supabase LMS (tuto_ai_content_cache table) for instant loading.
 */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini model fallback hierarchy
const CANDIDATE_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.5-flash',
  'gemini-flash-latest',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-pro-latest',
];

function getApiKeys(): string[] {
  const keys: string[] = [];
  const pool = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '').split(',').map(k => k.trim()).filter(Boolean);
  pool.forEach(k => { if (!keys.includes(k)) keys.push(k); });
  return keys;
}

// In-memory cache to avoid repeated DB/API calls within same server session
const memCache = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dayNumber, topicTitle, subject, courseId = 'tnpsc-group2' } = body;

    if (!topicTitle) {
      return NextResponse.json({ success: false, error: 'topicTitle is required' }, { status: 400 });
    }

    const cacheKey = `tnpsc_g2_d${dayNumber}_${topicTitle}`.toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 200);

    // 1. Check in-memory cache first
    if (memCache.has(cacheKey)) {
      return NextResponse.json({ success: true, source: 'mem_cache', content: memCache.get(cacheKey) });
    }

    // 2. Check OCI backend cache (authoritative tuto_ai_content_cache)
    try {
      const apiKeys = getApiKeys();
      const ociRes = await fetch('https://mysupro.duckdns.org/api/tuto/ai/generate-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          dayNumber,
          topicTitle,
          subject: subject || 'General',
          userApiKey: apiKeys[0] || '',
        }),
        cache: 'no-store',
        signal: AbortSignal.timeout(12000),
      });
      if (ociRes.ok) {
        const ociData = await ociRes.json();
        if (ociData.success && ociData.content) {
          memCache.set(cacheKey, ociData.content);
          return NextResponse.json({ success: true, source: ociData.source || 'oci_cache', content: ociData.content });
        }
      }
    } catch (ociErr) {
      console.warn('[tnpsc-content] OCI cache lookup failed:', ociErr);
    }

    // 3. Generate fresh content with Gemini
    const apiKeys = getApiKeys();
    if (apiKeys.length === 0) {
      return NextResponse.json({ success: false, error: 'No Gemini API key configured. Add GEMINI_API_KEY to .env.local' }, { status: 500 });
    }

    const prompt = `You are the TNPSC Group 2 & 2A Master Study AI for Tamil Nadu Public Service Commission Combined Civil Services Preliminary Examination.

Generate a COMPREHENSIVE study package for the following TNPSC Group 2 syllabus topic. The content must be EXAM-READY and cover every micro-concept that can appear as an MCQ.

**Course**: TNPSC Group 2 & 2A (Prelims) — Code 495
**Day**: ${dayNumber} of 25
**Subject**: ${subject || 'General'}
**Topic**: ${topicTitle}

Generate DETAILED content in the following JSON structure. Be thorough — each section must have real facts, dates, names, formulas, and exam-critical details:

{
  "topicTitle": "${topicTitle}",
  "subject": "${subject || 'General'}",
  "overview": "4-5 sentence detailed overview explaining why this topic is critical for TNPSC Group 2 and how many questions typically come from this area.",
  "tamilExplanation": {
    "simpleTitle": "Topic title in Tamil",
    "colloquialIntro": "3-4 sentences in simple conversational Tamil explaining the core concept",
    "keyPointsTamil": ["Point 1 in Tamil", "Point 2 in Tamil", "Point 3 in Tamil", "Point 4 in Tamil", "Point 5 in Tamil"]
  },
  "learningObjectives": ["Objective 1 — specific measurable", "Objective 2", "Objective 3", "Objective 4"],
  "coreConcepts": [
    {
      "heading": "1. First Major Concept (e.g., Constitutional Framework)",
      "content": "Detailed 200+ word explanation with specific facts, dates, article numbers, case law, formulas, or scientific principles. Include real TNPSC exam examples.",
      "example": "Specific worked example, historical event, or formula application"
    },
    {
      "heading": "2. Second Major Concept",
      "content": "Another detailed explanation covering a different aspect of the topic",
      "example": "Another specific example"
    },
    {
      "heading": "3. Third Major Concept",
      "content": "Deep dive into nuances that TNPSC loves to test",
      "example": "Tricky exam scenario"
    },
    {
      "heading": "4. Fourth Major Concept",
      "content": "Additional coverage for complete mastery",
      "example": "Application-based example"
    }
  ],
  "studyNotes": [
    {"sectionTitle": "Quick Reference Table", "content": "Tabulated data: key dates, article numbers, names, places, or formulas in bullet format"},
    {"sectionTitle": "Comparison & Differences", "content": "Compare related concepts (e.g., Lok Sabha vs Rajya Sabha, SI vs CI)"},
    {"sectionTitle": "Common Exam Traps", "content": "List 5 tricky areas where candidates make mistakes"}
  ],
  "formulasAndMnemonics": [
    {"name": "Formula/Rule 1", "formula": "Actual formula or rule statement", "mnemonic": "Memory trick to remember"},
    {"name": "Formula/Rule 2", "formula": "Actual formula or rule", "mnemonic": "Memory trick"}
  ],
  "flashcards": [
    {"front": "Question 1 (direct fact-based)", "back": "Precise answer with key detail"},
    {"front": "Question 2", "back": "Answer"},
    {"front": "Question 3", "back": "Answer"},
    {"front": "Question 4", "back": "Answer"},
    {"front": "Question 5", "back": "Answer"},
    {"front": "Question 6", "back": "Answer"},
    {"front": "Question 7", "back": "Answer"},
    {"front": "Question 8", "back": "Answer"}
  ],
  "mcqs": [
    {
      "id": "q1",
      "question": "TNPSC-style MCQ question 1 covering core concept from this topic",
      "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
      "correctAnswer": 0,
      "explanation": "Detailed 3-4 sentence explanation of why this is correct and why other options are wrong"
    },
    {
      "id": "q2",
      "question": "MCQ question 2",
      "options": ["A.", "B.", "C.", "D."],
      "correctAnswer": 1,
      "explanation": "Detailed explanation"
    },
    {
      "id": "q3",
      "question": "MCQ question 3",
      "options": ["A.", "B.", "C.", "D."],
      "correctAnswer": 2,
      "explanation": "Detailed explanation"
    },
    {
      "id": "q4",
      "question": "MCQ question 4",
      "options": ["A.", "B.", "C.", "D."],
      "correctAnswer": 0,
      "explanation": "Detailed explanation"
    },
    {
      "id": "q5",
      "question": "MCQ question 5",
      "options": ["A.", "B.", "C.", "D."],
      "correctAnswer": 3,
      "explanation": "Detailed explanation"
    },
    {
      "id": "q6",
      "question": "MCQ question 6 (application-based)",
      "options": ["A.", "B.", "C.", "D."],
      "correctAnswer": 1,
      "explanation": "Detailed explanation"
    },
    {
      "id": "q7",
      "question": "MCQ question 7 (assertion-reason format)",
      "options": ["A. Both correct, R explains A", "B. Both correct, R does not explain A", "C. A correct, R wrong", "D. A wrong, R correct"],
      "correctAnswer": 0,
      "explanation": "Detailed explanation"
    },
    {
      "id": "q8",
      "question": "MCQ question 8",
      "options": ["A.", "B.", "C.", "D."],
      "correctAnswer": 2,
      "explanation": "Detailed explanation"
    },
    {
      "id": "q9",
      "question": "MCQ question 9",
      "options": ["A.", "B.", "C.", "D."],
      "correctAnswer": 0,
      "explanation": "Detailed explanation"
    },
    {
      "id": "q10",
      "question": "MCQ question 10 (previous year pattern)",
      "options": ["A.", "B.", "C.", "D."],
      "correctAnswer": 1,
      "explanation": "Detailed explanation with reference to TNPSC pattern"
    }
  ],
  "vsaqs": [
    {"question": "2-mark question 1", "answer": "Model answer (3-4 lines)", "marks": 2},
    {"question": "2-mark question 2", "answer": "Model answer", "marks": 2},
    {"question": "2-mark question 3", "answer": "Model answer", "marks": 2},
    {"question": "2-mark question 4", "answer": "Model answer", "marks": 2},
    {"question": "5-mark question", "answer": "Detailed model answer (8-10 lines)", "marks": 5}
  ],
  "bedtimeRecap": "• Key point 1 for night revision\\n• Key point 2\\n• Key point 3\\n• Key point 4\\n• Key point 5\\n• Master formula/rule to remember\\n• Tomorrow's connection point"
}

IMPORTANT RULES:
- All factual content must be accurate (dates, article numbers, historical events, scientific facts)
- Include both English and Tamil where relevant
- MCQ questions must have EXACTLY 4 options and 1 correct answer
- Explanations must explain why wrong options are wrong
- Make content specific to TNPSC Group 2 exam pattern
- Respond ONLY with valid parseable JSON, no markdown fencing`;

    let generatedContent: any = null;
    let usedModel = '';

    for (const apiKey of apiKeys) {
      const genAI = new GoogleGenerativeAI(apiKey);
      
      for (const modelName of CANDIDATE_MODELS) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          const responseText = result.response.text();
          
          // Extract JSON from response
          let jsonStr = responseText.trim();
          // Remove markdown fencing if present
          jsonStr = jsonStr.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
          
          generatedContent = JSON.parse(jsonStr);
          usedModel = modelName;
          break;
        } catch (modelErr: any) {
          console.warn(`Model ${modelName} failed:`, modelErr.message?.slice(0, 100));
          continue;
        }
      }
      if (generatedContent) break;
    }

    if (!generatedContent) {
      return NextResponse.json({ success: false, error: 'All Gemini models failed to generate content' }, { status: 500 });
    }

    // Cache in memory
    memCache.set(cacheKey, generatedContent);

    // Also try to cache on OCI backend
    try {
      await fetch('https://mysupro.duckdns.org/api/tuto/ai/generate-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          dayNumber,
          topicTitle,
          subject: subject || 'General',
          userApiKey: apiKeys[0],
        }),
        signal: AbortSignal.timeout(15000),
      });
    } catch {}

    return NextResponse.json({
      success: true,
      source: 'ai_generated',
      model: usedModel,
      content: generatedContent,
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Internal error' }, { status: 500 });
  }
}
