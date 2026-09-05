import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Resilient model fallback hierarchy
const CANDIDATE_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-2.5-pro',
  'gemini-1.5-pro',
];

// Helper to get available API keys
function getApiKeys(clientApiKey?: string): string[] {
  if (clientApiKey) return [clientApiKey];
  const pool = (process.env.GEMINI_API_KEYS || '')
    .split(',')
    .map(k => k.trim())
    .filter(Boolean);
  const primary = process.env.GEMINI_API_KEY?.trim();
  if (primary && !pool.includes(primary)) pool.unshift(primary);
  return pool;
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, type, apiKey: clientApiKey, base64Audio, base64Image, imageMimeType, grade, subject, courseContext, day } = await req.json();

    const keys = getApiKeys(clientApiKey);
    if (keys.length === 0) {
      return NextResponse.json({ error: 'Please provide a Gemini API Key to use this feature.' }, { status: 400 });
    }

    let systemPrompt = '';
    if (type === 'teacho_book_scanner') {
      systemPrompt = `You are the TutO AI Textbook Scanner & Personal Tutor for Indian Students (Class ${grade || '5'}, Subject: ${subject || 'General'}).
Analyze the provided textbook page image or text content.
Return STRICTLY a JSON object without markdown fences, conforming to this exact structure:
{
  "pageTitle": "Chapter and Topic Name",
  "grade": "${grade || 'Class 5'}",
  "subject": "${subject || 'General'}",
  "howToRead": [
    { "step": 1, "title": "Step 1 Title", "instruction": "Clear reading instruction", "tip": "Practical study tip" },
    { "step": 2, "title": "Step 2 Title", "instruction": "Clear reading instruction", "tip": "Practical study tip" },
    { "step": 3, "title": "Step 3 Title", "instruction": "Clear reading instruction", "tip": "Practical study tip" },
    { "step": 4, "title": "Step 4 Title", "instruction": "Clear reading instruction", "tip": "Practical study tip" }
  ],
  "conceptBreakdown": {
    "summaryEnglish": "Detailed English conceptual explanation with formulas",
    "summaryTamil": "விரிவான தமிழ் விளக்கம் மற்றும் எளிய எடுத்துக்காட்டு",
    "keyPoints": ["Point 1", "Point 2", "Point 3"],
    "keyFormulasOrRules": ["Formula 1", "Rule 2"]
  },
  "textbookQA": [
    { "question": "Question 1 from page", "answer": "Step-by-step solution for homework", "type": "short" },
    { "question": "Question 2 from page", "answer": "Step-by-step solution for homework", "type": "short" },
    { "question": "Question 3 from page", "answer": "Step-by-step solution for homework", "type": "short" }
  ],
  "mcqDrill": [
    { "id": 1, "question": "MCQ 1", "options": { "A": "...", "B": "...", "C": "...", "D": "..." }, "correctOption": "A", "explanation": "..." },
    { "id": 2, "question": "MCQ 2", "options": { "A": "...", "B": "...", "C": "...", "D": "..." }, "correctOption": "B", "explanation": "..." },
    { "id": 3, "question": "MCQ 3", "options": { "A": "...", "B": "...", "C": "...", "D": "..." }, "correctOption": "C", "explanation": "..." },
    { "id": 4, "question": "MCQ 4", "options": { "A": "...", "B": "...", "C": "...", "D": "..." }, "correctOption": "D", "explanation": "..." },
    { "id": 5, "question": "MCQ 5", "options": { "A": "...", "B": "...", "C": "...", "D": "..." }, "correctOption": "A", "explanation": "..." }
  ]
}
`;
    } else if (type === 'teacho_tutor') {
      systemPrompt = `You are the TeachO 1-on-1 AI Personal Tutor for Indian Students (covering CBSE NCERT, Tamil Nadu State Board Samacheer Kalvi, Matriculation, TNPSC, UPSC, Engineering, and Tech Skills).
Current Course Context: ${courseContext || 'General Academics'} (Day ${day || 1}).
Your goal:
1. Provide extremely clear, pedagogically sound, and engaging explanations.
2. Give step-by-step mathematical/conceptual derivations with clear formulas where applicable.
3. Provide bilingual support (English with natural Tamil explanations/terms when helpful).
4. Give real-world examples and high-yield exam tips to help students score 100/100.
5. Keep formatting clean using bold headings, bullet points, and numbered steps.

Student Question:
`;
    } else if (type === 'translate') {
      systemPrompt = 'You are an expert English to Tamil and Tamil to English translator. Translate the following text naturally and accurately:\n\n';
    } else if (type === 'whatsapp') {
      systemPrompt = 'You are a professional WhatsApp business auto-reply generator. Write a concise, polite, and helpful auto-reply for the following scenario/message:\n\n';
    } else if (type === 'summarize') {
      systemPrompt = 'You are an expert document summarizer. Extract the most important key points from the following text and present them as a bulleted list:\n\n';
    } else if (type === 'market_summary') {
      systemPrompt = 'You are an expert agriculture market analyst for Tamil Nadu. Analyze the following raw market data and write a concise, helpful daily summary for farmers and traders. Highlight major trends, high/low prices, or notable changes:\n\n';
    } else if (type === 'weekly_agro_news') {
      systemPrompt = 'You are an expert Indian Agriculture News Analyst. Based on the following raw government market data, generate a comprehensive "Weekly Agro News Relay". Focus heavily on Tamil Nadu related news and Indian level important updates. Format the output with clear headings, bullet points, and actionable insights for farmers.\n\n';
    } else if (type === 'status_quote') {
      systemPrompt = 'You are a viral Tamil quote generator. The user will provide a topic or keyword. Generate exactly ONE short, punchy, motivational or cinema-style quote in Tamil (with English transliteration if helpful) suitable for a WhatsApp status. Do not include any extra chat or explanations, just the quote.\n\n';
    } else {
      systemPrompt = 'You are Gemini AI, a helpful and knowledgeable assistant built into the SuprO Local Ecosystem platform. Answer the following query clearly and concisely:\n\n';
    }

    let lastError: any = null;

    // Try keys and models in order
    for (const key of keys) {
      const genAI = new GoogleGenerativeAI(key);

      for (const modelName of CANDIDATE_MODELS) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          let result;

          if (base64Audio) {
            const audioPart = {
              inlineData: {
                data: base64Audio,
                mimeType: 'audio/webm',
              },
            };
            const contentParts: any[] = [audioPart];
            if (prompt) contentParts.push({ text: systemPrompt + prompt });
            else contentParts.push({ text: 'Please respond to the audio in Tamil.' });

            result = await model.generateContent(contentParts);
          } else if (base64Image) {
            const imagePart = {
              inlineData: {
                data: base64Image,
                mimeType: imageMimeType || 'image/jpeg',
              },
            };
            const contentParts: any[] = [imagePart];
            contentParts.push({ text: systemPrompt + (prompt || 'Please analyze this textbook page.') });

            result = await model.generateContent(contentParts);
          } else {
            if (!prompt) {
              return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
            }
            const fullPrompt = systemPrompt + prompt;
            result = await model.generateContent(fullPrompt);
          }

          const response = await result.response;
          const text = response.text();

          if (text && text.trim().length > 0) {
            return NextResponse.json({ result: text.trim(), model: modelName });
          }
        } catch (err: any) {
          lastError = err;
          console.warn(`Gemini Model ${modelName} on key ${key.substring(0, 8)}... failed:`, err.message);
        }
      }
    }

    throw lastError || new Error('Failed to generate AI response from all available Gemini models');
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate AI response' }, { status: 500 });
  }
}
