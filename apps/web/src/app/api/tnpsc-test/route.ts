/**
 * TNPSC Group 2 Online Test Generation API Route
 * 
 * Generates topic-specific MCQ tests with detailed bilingual explanations
 * using server-side Gemini API keys. Tests are generated from the study notes
 * to ensure "full notes-based questions" coverage.
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      dayNumber, 
      topicTitle, 
      subject, 
      count = 25, 
      difficulty = 'mixed',
      notesContext = '',
    } = body;

    if (!topicTitle) {
      return NextResponse.json({ success: false, error: 'topicTitle is required' }, { status: 400 });
    }

    const apiKeys = getApiKeys();
    if (apiKeys.length === 0) {
      return NextResponse.json({ success: false, error: 'No Gemini API key configured' }, { status: 500 });
    }

    const prompt = `You are a TNPSC Group 2 & 2A Exam Question Paper Generator for Tamil Nadu Public Service Commission.

Generate a COMPREHENSIVE online test with ${count} MCQ questions for the following topic. Each question must be exam-quality with detailed explanations.

**Exam**: TNPSC Group 2 & 2A (Prelims) — 200 Questions, 300 Marks, 3 Hours
**Day**: ${dayNumber || 'Practice'} of 25
**Subject**: ${subject || 'General Studies'}
**Topic**: ${topicTitle}
**Difficulty Mix**: ${difficulty === 'mixed' ? '40% Easy, 40% Medium, 20% Hard' : difficulty}
${notesContext ? `\n**Study Notes Context (generate questions based on these notes):**\n${notesContext.slice(0, 3000)}` : ''}

Generate EXACTLY ${count} questions in this JSON format:

{
  "testTitle": "TNPSC Group 2 - ${subject || 'General Studies'}: ${topicTitle}",
  "totalQuestions": ${count},
  "totalMarks": ${count * 1.5},
  "timeMinutes": ${count},
  "negativeMarking": true,
  "markingScheme": "+1.5 for correct, -0.5 for wrong",
  "questions": [
    {
      "id": "q1",
      "sequence_number": 1,
      "subject": "${subject || 'General Studies'}",
      "topic": "${topicTitle}",
      "difficulty": "Easy|Medium|Hard",
      "question_text": "Full question text in English",
      "question_text_ta": "முழு கேள்வி தமிழில்",
      "options": {"A": "Option A text", "B": "Option B text", "C": "Option C text", "D": "Option D text"},
      "options_ta": {"A": "விருப்பம் A", "B": "விருப்பம் B", "C": "விருப்பம் C", "D": "விருப்பம் D"},
      "correct_option": "A",
      "explanation": "Detailed 3-5 sentence explanation in English. Explain why the correct answer is correct, and briefly note why other options are wrong. Include the relevant article/section/formula/date.",
      "explanation_ta": "தமிழில் விரிவான விளக்கம் - 3-5 வாக்கியங்கள்",
      "formula_or_law": "Relevant formula, article, or law reference"
    }
  ]
}

RULES:
- Generate exactly ${count} questions covering ALL aspects of the topic
- 40% Easy (direct recall), 40% Medium (application/analysis), 20% Hard (tricky/multi-concept)
- Each question MUST have exactly 4 options and 1 correct answer
- Explanations must explain why each wrong option is wrong
- Include Tamil translations for questions, options, and explanations
- Match authentic TNPSC exam question patterns and difficulty
- If notes context is provided, base AT LEAST 60% of questions on that content
- Respond ONLY with valid parseable JSON, no markdown fencing`;

    let testData: any = null;
    let usedModel = '';

    for (const apiKey of apiKeys) {
      const genAI = new GoogleGenerativeAI(apiKey);
      for (const modelName of CANDIDATE_MODELS) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          let jsonStr = result.response.text().trim();
          jsonStr = jsonStr.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
          testData = JSON.parse(jsonStr);
          usedModel = modelName;
          break;
        } catch (err: any) {
          console.warn(`Test gen - Model ${modelName} failed:`, err.message?.slice(0, 100));
          continue;
        }
      }
      if (testData) break;
    }

    if (!testData || !testData.questions?.length) {
      return NextResponse.json({ success: false, error: 'Failed to generate test questions' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      source: 'ai_generated',
      model: usedModel,
      testTitle: testData.testTitle,
      totalQuestions: testData.questions.length,
      markingScheme: testData.markingScheme,
      timeMinutes: testData.timeMinutes,
      questions: testData.questions,
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Internal error' }, { status: 500 });
  }
}
