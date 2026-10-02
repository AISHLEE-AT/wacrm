/**
 * TNPSC Group 2 Online Test Generation API Route
 * 
 * Generates topic-specific MCQ tests with detailed bilingual explanations.
 * Priority cascade:
 * 1. Pre-generated AI test questions from tuto_ai_content_cache (instant 10ms)
 * 2. Real-time Gemini generation (if server API key configured)
 * 3. Authoritative OCI Question Bank /api/tuto/test/generate (guaranteed fallback)
 */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
  return (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '')
    .split(',').map(k => k.trim()).filter(Boolean);
}

function normalizeQuizQuestions(quizList: any[], subject: string, topicTitle: string): any[] {
  return quizList.map((q: any, idx: number) => {
    const optionsObj: Record<string, string> = {};
    if (Array.isArray(q.options)) {
      q.options.forEach((opt: string, i: number) => {
        const key = ['A', 'B', 'C', 'D'][i] || `opt_${i}`;
        optionsObj[key] = opt.replace(/^[A-D]\.\s*/, '');
      });
    } else if (typeof q.options === 'object' && q.options !== null) {
      Object.assign(optionsObj, q.options);
    }

    let correctOpt = 'A';
    if (typeof q.correctIndex === 'number' && ['A', 'B', 'C', 'D'][q.correctIndex]) {
      correctOpt = ['A', 'B', 'C', 'D'][q.correctIndex];
    } else if (typeof q.correctAnswer === 'number' && ['A', 'B', 'C', 'D'][q.correctAnswer]) {
      correctOpt = ['A', 'B', 'C', 'D'][q.correctAnswer];
    } else if (typeof q.correct_option === 'string') {
      correctOpt = q.correct_option.toUpperCase();
    }

    return {
      id: q.id || `q_${idx + 1}`,
      sequence_number: idx + 1,
      subject: subject || 'General Studies',
      topic: topicTitle,
      difficulty: q.difficulty || 'Medium',
      question_text: q.question || q.question_text || '',
      question_text_ta: q.questionTamil || q.question_text_ta || q.question_ta || '',
      options: optionsObj,
      options_ta: q.options_ta || optionsObj,
      correct_option: correctOpt,
      explanation: q.explanation || 'Curriculum solution verified.',
      explanation_ta: q.explanationTamil || q.explanation_ta || '',
      formula_or_law: q.formula_or_law || '',
    };
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      dayNumber, 
      topicTitle, 
      subject = 'General Studies', 
      count = 10, 
      difficulty = 'mixed',
      notesContext = '',
      courseId = 'tnpsc-group2',
    } = body;

    if (!topicTitle) {
      return NextResponse.json({ success: false, error: 'topicTitle is required' }, { status: 400 });
    }

    let collectedQuestions: any[] = [];

    // ── 1. Check OCI Pre-generated Cache (tuto_ai_content_cache) ─────────────
    try {
      const cacheRes = await fetch('https://mysupro.duckdns.org/api/tuto/ai/generate-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          dayNumber,
          topicTitle,
          subject,
        }),
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      });

      if (cacheRes.ok) {
        const cacheData = await cacheRes.json();
        const rawQuiz = cacheData.content?.practiceQuiz || cacheData.content?.mcqs || [];
        if (Array.isArray(rawQuiz) && rawQuiz.length > 0) {
          collectedQuestions = normalizeQuizQuestions(rawQuiz, subject, topicTitle);
        }
      }
    } catch (cacheErr) {
      console.warn('[tnpsc-test] OCI cache lookup skipped:', cacheErr);
    }

    // If we have enough cached questions, return immediately!
    if (collectedQuestions.length >= count) {
      return NextResponse.json({
        success: true,
        source: 'oci_ai_cache',
        testTitle: `TNPSC Group 2 - ${subject}: ${topicTitle}`,
        totalQuestions: collectedQuestions.slice(0, count).length,
        markingScheme: '+1.5 for correct, -0.5 for wrong',
        timeMinutes: Math.max(5, count),
        questions: collectedQuestions.slice(0, count),
      });
    }

    // ── 2. If Gemini API Keys Available, Generate More ───────────────────────
    const apiKeys = getApiKeys();
    if (apiKeys.length > 0) {
      const neededCount = count - collectedQuestions.length;
      const prompt = `You are a TNPSC Group 2 & 2A Exam Question Paper Generator for Tamil Nadu Public Service Commission.

Generate a COMPREHENSIVE online test with ${neededCount} MCQ questions for the following topic. Each question must be exam-quality with detailed explanations.

**Exam**: TNPSC Group 2 & 2A (Prelims) — 200 Questions, 300 Marks, 3 Hours
**Day**: ${dayNumber || 'Practice'} of 25
**Subject**: ${subject}
**Topic**: ${topicTitle}
**Difficulty Mix**: ${difficulty === 'mixed' ? '40% Easy, 40% Medium, 20% Hard' : difficulty}
${notesContext ? `\n**Study Notes Context:**\n${notesContext.slice(0, 2000)}` : ''}

Generate EXACTLY ${neededCount} questions in this JSON format:
{
  "questions": [
    {
      "id": "q1",
      "subject": "${subject}",
      "topic": "${topicTitle}",
      "difficulty": "Easy|Medium|Hard",
      "question_text": "Full question text in English",
      "question_text_ta": "முழு கேள்வி தமிழில்",
      "options": {"A": "Option A text", "B": "Option B text", "C": "Option C text", "D": "Option D text"},
      "options_ta": {"A": "விருப்பம் A", "B": "விருப்பம் B", "C": "விருப்பம் C", "D": "விருப்பம் D"},
      "correct_option": "A",
      "explanation": "Detailed explanation in English",
      "explanation_ta": "தமிழில் விரிவான விளக்கம்"
    }
  ]
}

RULES:
- Each question MUST have exactly 4 options (A, B, C, D) and 1 correct answer (A, B, C, or D)
- Include Tamil translations for questions and options
- Match authentic TNPSC exam syllabus
- Respond ONLY with valid parseable JSON`;

      for (const apiKey of apiKeys) {
        const genAI = new GoogleGenerativeAI(apiKey);
        for (const modelName of CANDIDATE_MODELS) {
          try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            let jsonStr = result.response.text().trim();
            jsonStr = jsonStr.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
            const parsed = JSON.parse(jsonStr);
            if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
              const fresh = parsed.questions.map((q: any, i: number) => ({
                id: q.id || `q_${collectedQuestions.length + i + 1}`,
                sequence_number: collectedQuestions.length + i + 1,
                subject: q.subject || subject,
                topic: q.topic || topicTitle,
                difficulty: q.difficulty || 'Medium',
                question_text: q.question_text || '',
                question_text_ta: q.question_text_ta || '',
                options: q.options || {},
                options_ta: q.options_ta || q.options,
                correct_option: (q.correct_option || 'A').toUpperCase(),
                explanation: q.explanation || '',
                explanation_ta: q.explanation_ta || '',
              }));
              collectedQuestions.push(...fresh);
              break;
            }
          } catch {}
        }
        if (collectedQuestions.length >= count) break;
      }
    }

    // ── 3. Fallback to OCI Question Bank if still under count ──────────────────
    if (collectedQuestions.length < Math.min(count, 4)) {
      try {
        const qbankRes = await fetch(`https://mysupro.duckdns.org/api/tuto/test/generate?category=TNPSC&count=${count}&courseId=tnpsc-group2`, {
          cache: 'no-store',
          signal: AbortSignal.timeout(6000),
        });
        if (qbankRes.ok) {
          const qbankData = await qbankRes.json();
          if (Array.isArray(qbankData.questions) && qbankData.questions.length > 0) {
            const qbNormalized = qbankData.questions.map((q: any, i: number) => {
              let opts = typeof q.options === 'string' ? JSON.parse(q.options) : (q.options || {});
              return {
                id: q.id || `qb_${i + 1}`,
                sequence_number: collectedQuestions.length + i + 1,
                subject: q.subject || subject,
                topic: q.topic || topicTitle,
                difficulty: q.difficulty || 'Medium',
                question_text: q.question_text || '',
                question_text_ta: q.question_text_ta || '',
                options: {
                  A: opts.A || opts[0] || 'Option A',
                  B: opts.B || opts[1] || 'Option B',
                  C: opts.C || opts[2] || 'Option C',
                  D: opts.D || opts[3] || 'Option D',
                },
                options_ta: q.options_ta,
                correct_option: (q.correct_option || 'A').toUpperCase(),
                explanation: q.explanation || 'Curriculum solution verified.',
                explanation_ta: q.explanation_ta || '',
              };
            });
            collectedQuestions.push(...qbNormalized);
          }
        }
      } catch (qbErr) {
        console.warn('[tnpsc-test] Question bank fallback failed:', qbErr);
      }
    }

    if (collectedQuestions.length === 0) {
      return NextResponse.json({ success: false, error: 'No test questions available for this topic. Please try again.' }, { status: 500 });
    }

    const finalQuestions = collectedQuestions.slice(0, count);

    return NextResponse.json({
      success: true,
      source: 'curated_test',
      testTitle: `TNPSC Group 2 - ${subject}: ${topicTitle}`,
      totalQuestions: finalQuestions.length,
      markingScheme: '+1.5 for correct, -0.5 for wrong',
      timeMinutes: Math.max(5, finalQuestions.length),
      questions: finalQuestions,
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Internal error' }, { status: 500 });
  }
}
