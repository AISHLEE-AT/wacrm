/**
 * TeachO Micro-Topic Course Player Content Batch Generator
 * Uses Gemini 2.5 Flash with key rotation pool to generate full 7-tier academic modules
 * (Notes, 1-Line Q&A, Fill Blanks, MCQs, 2-Mark, 5-Mark, Essay, YouTube @aishleetechnology)
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://jjgdatjthyeesmgunnlp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZ2RhdGp0aHllZXNtZ3VubmxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MzU5NTYsImV4cCI6MjEwMDIxMTk1Nn0.iuSdvxW9VEtn_1yVLmf9ZN24CeXFxmF3aeVHEn-Dgcs';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const API_KEYS = [
  process.env.GEMINI_API_KEY || '',
  process.env.GEMINI_API_KEY || '',
  process.env.GEMINI_API_KEY || '',
  'AIzaSyCjagu5qgBIdlX45x0O5HaMfj8E3a55Q_M'
];

let keyIndex = 0;
function getNextKey() {
  const k = API_KEYS[keyIndex % API_KEYS.length];
  keyIndex++;
  return k;
}

async function generateMicroTopicContent(topicTitle, subject, courseTitle, standard) {
  const prompt = `You are a premier Curriculum & Subject Matter Master for Tamil Nadu State Board (Samacheer Kalvi), CBSE NCERT, TNPSC & UPSC.

Generate complete, authentic, academic learning content for:
- Course: "${courseTitle}"
- Subject: "${subject}"
- Standard / Exam Level: "${standard}"
- Micro-Topic: "${topicTitle}"
- Official YouTube Channel: "@aishleetechnology"

Return ONLY valid JSON matching this exact structure:
{
  "topicKey": "${topicTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}",
  "topicTitle": "${topicTitle}",
  "courseTitle": "${courseTitle}",
  "subject": "${subject}",
  "standardOrExam": "${standard}",
  "dayNumber": 1,
  "videoMeta": {
    "channel": "@aishleetechnology",
    "channelUrl": "https://www.youtube.com/@aishleetechnology",
    "youtubeVideoId": "aishlee_video_${topicTitle.slice(0, 8).toLowerCase()}",
    "videoTitle": "${subject}: ${topicTitle} Masterclass by @aishleetechnology",
    "durationMinutes": 25,
    "isOfficialAishlee": true
  },
  "notes": {
    "overview": "<2-3 paragraphs theoretical background & examination context>",
    "keyPoints": ["<bullet 1>", "<bullet 2>", "<bullet 3>"],
    "coreConcepts": [
      { "heading": "<Concept 1>", "body": "<Detailed explanation>", "formulaOrExample": "<Example or Formula>" },
      { "heading": "<Concept 2>", "body": "<Detailed explanation>", "formulaOrExample": "<Example or Formula>" }
    ],
    "bilingualExplanation": {
      "tamil": "<எளிய தமிழ் விளக்கம்>",
      "english": "<Crisp English conceptual summary>"
    },
    "formulasAndShortcuts": [
      { "name": "<Formula/Rule Name>", "formula": "<Equation>", "tip": "<Exam trick>" }
    ]
  },
  "oneLineQnA": [
    { "question": "<Q1>", "answer": "<A1>" },
    { "question": "<Q2>", "answer": "<A2>" },
    { "question": "<Q3>", "answer": "<A3>" }
  ],
  "fillInTheBlanks": [
    { "sentenceWithBlank": "<Sentence with ______ blank>", "answer": "<Word>", "hint": "<Hint>" },
    { "sentenceWithBlank": "<Sentence with ______ blank>", "answer": "<Word>", "hint": "<Hint>" }
  ],
  "mcqs": [
    {
      "question": "<High-yield MCQ Question>",
      "options": ["<Option A>", "<Option B>", "<Option C>", "<Option D>"],
      "correctIndex": 0,
      "explanation": "<Clear reason why Option A is correct>"
    }
  ],
  "twoMarkQuestions": [
    {
      "question": "<2-Mark Board/Exam Question>",
      "marks": 2,
      "modelAnswer": "<Precise 2-mark model answer>",
      "keyPointsToInclude": ["<Point 1>", "<Point 2>"]
    }
  ],
  "fiveMarkQuestions": [
    {
      "question": "<5-Mark Structured Question>",
      "marks": 5,
      "stepByStepSolution": ["<Step 1>", "<Step 2>", "<Step 3>", "<Step 4>"],
      "diagramOrFormulaNote": "<Note on diagrams/equations>"
    }
  ],
  "essayQuestions": [
    {
      "question": "<10-Mark Descriptive / Essay Question>",
      "marks": 10,
      "structuredOutline": ["<Heading 1>", "<Heading 2>", "<Heading 3>"],
      "modelEssay": "<Complete structured essay answer with intro, body, conclusion>"
    }
  ]
}`;

  for (let attempt = 0; attempt < 4; attempt++) {
    const key = getNextKey();
    try {
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
        }
      });

      const res = await model.generateContent(prompt);
      let text = (await res.response).text().trim();
      if (text.startsWith('```')) {
        text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
      }
      return JSON.parse(text);
    } catch (e) {
      console.log(`[Pacing delay]: waiting 8s for API reset... (${e.message.substring(0, 40)})`);
      await new Promise(r => setTimeout(r, 8000));
    }
  }
  return null;
}

module.exports = { generateMicroTopicContent };
