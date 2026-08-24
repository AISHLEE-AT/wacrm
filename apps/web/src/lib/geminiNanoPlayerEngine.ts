/**
 * TutO Gemini Nano Player Engine
 * Direct integration with Google Gemini REST API to dynamically generate
 * rich, interactive study decks, audio/video lesson simulations, and CBT quizzes
 * for any nano-concept node across all 59 courses.
 */

import { geminiToolsService, GEMINI_MODELS } from './geminiToolsService';

export interface GeneratedNanoLesson {
  conceptCode: string;
  title: string;
  tamilTitle?: string;
  subject: string;
  summary: string;
  tamilSummary?: string;
  lectureSlides: Array<{
    slideNumber: number;
    heading: string;
    tamilHeading?: string;
    points: string[];
    audioScript: string;
    formulaOrRule?: string;
  }>;
  detailedNotesMarkdown: string;
  keyFormulas: string[];
  modelQuestions: Array<{
    type: string;
    marks: number;
    question: string;
    tamilQuestion?: string;
    stepByStepAnswer: string;
  }>;
  quizQuestions: Array<{
    id: string;
    question: string;
    tamilQuestion?: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    tamilExplanation?: string;
  }>;
}

// In-memory & local cache for instant replay
const NANO_CONTENT_CACHE: Record<string, GeneratedNanoLesson> = {};

export const geminiNanoPlayerEngine = {
  /**
   * Generates or fetches cached complete interactive nano lesson content
   */
  async getOrGenerateNanoContent(
    courseId: string,
    subject: string,
    topicTitle: string,
    tamilTopicTitle?: string,
    conceptCode?: string,
    keyFormulaOrRule?: string,
    userApiKey?: string,
    preferredLanguage: 'Bilingual' | 'Tamil' | 'English' = 'Bilingual'
  ): Promise<GeneratedNanoLesson> {
    const cacheKey = `${courseId}_${subject}_${topicTitle}_${conceptCode || ''}_${preferredLanguage}`.toLowerCase().replace(/\s+/g, '_');

    if (NANO_CONTENT_CACHE[cacheKey]) {
      return NANO_CONTENT_CACHE[cacheKey];
    }

    const prompt = `You are the Master TutO AI Academic Engine & Curriculum Expert.
Generate an exhaustive, highly engaging, interactive Nano-Learning Module for the following government-notified curriculum node:

Course ID: ${courseId}
Subject: ${subject}
Topic / Nano-Concept: ${topicTitle}
${tamilTopicTitle ? `Tamil Name: ${tamilTopicTitle}` : ''}
${conceptCode ? `Concept Code: ${conceptCode}` : ''}
${keyFormulaOrRule ? `Key Rule / Formula: ${keyFormulaOrRule}` : ''}
Language Mode: ${preferredLanguage} (Bilingual Tamil & English preferred)

Respond ONLY with a valid, parseable JSON object matching this exact TypeScript structure:
{
  "conceptCode": "${conceptCode || 'NANO-01'}",
  "title": "${topicTitle}",
  "tamilTitle": "${tamilTopicTitle || topicTitle}",
  "subject": "${subject}",
  "summary": "2-3 sentence engaging conceptual summary in English",
  "tamilSummary": "2-3 sentence summary in clear Tamil (தமிழ் விளக்கம்)",
  "lectureSlides": [
    {
      "slideNumber": 1,
      "heading": "Introduction & Real-World Analogy",
      "tamilHeading": "அறிமுகம் & நடைமுறை உதாரணம்",
      "points": ["Key bullet 1", "Key bullet 2", "Key bullet 3"],
      "audioScript": "Engaging conversational teacher voiceover script in bilingual style explaining slide 1",
      "formulaOrRule": "${keyFormulaOrRule || ''}"
    },
    {
      "slideNumber": 2,
      "heading": "Core Principles & Mathematical/Grammatical Mechanics",
      "tamilHeading": "முக்கிய விதிகள் & கோட்பாடுகள்",
      "points": ["Mechanic step 1", "Mechanic step 2"],
      "audioScript": "Detailed walkthrough audio script explaining the inner mechanics",
      "formulaOrRule": "${keyFormulaOrRule || ''}"
    },
    {
      "slideNumber": 3,
      "heading": "Exam High-Yield Traps & Centum Tips",
      "tamilHeading": "தேர்வு குறிப்புகள் & முக்கிய வினாக்கள்",
      "points": ["Common student mistake", "Centum score tip"],
      "audioScript": "Exam strategy audio script"
    }
  ],
  "detailedNotesMarkdown": "# Comprehensive Study Notes\\n\\n### 1. Key Definitions\\n...\\n### 2. Axioms & Laws\\n...\\n### 3. Solved Application Examples\\n...",
  "keyFormulas": ["${keyFormulaOrRule || 'Core Axiom Definition'}"],
  "modelQuestions": [
    {
      "type": "2-Mark Short Answer",
      "marks": 2,
      "question": "Standard 2-mark board question",
      "tamilQuestion": "2-மதிப்பெண் வினா",
      "stepByStepAnswer": "Step-by-step standard answer matching official evaluation blueprint."
    },
    {
      "type": "5-Mark Long Derivation / Problem",
      "marks": 5,
      "question": "Standard 5-mark long question",
      "tamilQuestion": "5-மதிப்பெண் பெருவினா",
      "stepByStepAnswer": "Step 1: Given... Step 2: Formula... Step 3: Derivation... Final Result."
    }
  ],
  "quizQuestions": [
    {
      "id": "q1",
      "question": "High-yield MCQ question 1?",
      "tamilQuestion": "வினா 1?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Detailed explanation of why Option A is correct.",
      "tamilExplanation": "காரணம் மற்றும் விளக்கம்."
    },
    {
      "id": "q2",
      "question": "High-yield MCQ question 2?",
      "tamilQuestion": "வினா 2?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 1,
      "explanation": "Detailed explanation of why Option B is correct.",
      "tamilExplanation": "காரணம் மற்றும் விளக்கம்."
    },
    {
      "id": "q3",
      "question": "High-yield MCQ question 3?",
      "tamilQuestion": "வினா 3?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 2,
      "explanation": "Detailed explanation of why Option C is correct.",
      "tamilExplanation": "காரணம் மற்றும் விளக்கம்."
    }
  ]
}`;

    try {
      const response = await geminiToolsService.executePrompt(
        prompt,
        userApiKey,
        'Tamil',
        [],
        GEMINI_MODELS.FLASH_25 || 'gemini-2.5-flash'
      );

      if (response && response.text) {
        // Clean JSON formatting
        let jsonStr = response.text.trim();
        if (jsonStr.startsWith('```json')) {
          jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (jsonStr.startsWith('```')) {
          jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        const parsed: GeneratedNanoLesson = JSON.parse(jsonStr);
        NANO_CONTENT_CACHE[cacheKey] = parsed;
        return parsed;
      }
    } catch (e) {
      console.warn('Gemini AI dynamic generation fallback used:', e);
    }

    // High-quality deterministic fallback if offline or API unavailable
    const fallbackLesson: GeneratedNanoLesson = {
      conceptCode: conceptCode || 'NANO-01',
      title: topicTitle,
      tamilTitle: tamilTopicTitle || topicTitle,
      subject,
      summary: `In-depth study of ${topicTitle} per government-notified curriculum standards.`,
      tamilSummary: `${topicTitle} பற்றிய முழுமையான தேர்வு நோக்கு பாடக் குறிப்புகள் மற்றும் விளக்கம்.`,
      lectureSlides: [
        {
          slideNumber: 1,
          heading: `Introduction to ${topicTitle}`,
          tamilHeading: `${tamilTopicTitle || topicTitle} — அறிமுகம்`,
          points: [
            'Core definition & government standard scope',
            'Fundamental laws, axioms, and formulas',
            'Real-world applications and exam relevance'
          ],
          audioScript: `Welcome to today's lesson on ${topicTitle}. We will master the core definitions, formulas, and previous exam questions step-by-step.`,
          formulaOrRule: keyFormulaOrRule
        },
        {
          slideNumber: 2,
          heading: 'Core Principles & Step-by-Step Derivation',
          tamilHeading: 'முக்கிய சமன்பாடுகள் & தீர்வுகள்',
          points: [
            keyFormulaOrRule || 'Fundamental law or formula',
            'Step-by-step derivation for 5-mark examination answers',
            'Unit conversions and standard dimensional checks'
          ],
          audioScript: `Let us examine the exact mathematical and theoretical framework required for scoring centum in this topic.`,
          formulaOrRule: keyFormulaOrRule
        },
        {
          slideNumber: 3,
          heading: 'Exam Centum Mastery & Model Questions',
          tamilHeading: 'தேர்வு மாதிரி வினா-விடைகள்',
          points: [
            '2-Mark short answer keywords and definitions',
            '5-Mark long answer blueprint representation',
            'Frequently tested traps and tricky questions'
          ],
          audioScript: `Make sure to memorize the highlighted formulas and standard definitions for full marks in your board and competitive exams.`
        }
      ],
      detailedNotesMarkdown: `# ${topicTitle} (${tamilTopicTitle || ''})\n\n## 1. Official Curriculum Overview\n- **Subject:** ${subject}\n- **Concept Code:** ${conceptCode || 'NANO-01'}\n- **Standard Rule / Formula:** \`${keyFormulaOrRule || 'Core Definition'}\`\n\n## 2. Key Principles & Formulas\n${keyFormulaOrRule ? `$$\n${keyFormulaOrRule}\n$$` : 'Foundational concepts established under official board regulations.'}\n\n## 3. High-Yield Summary\nMastering this topic guarantees vital marks across school term exams and state/national level competitive examinations.`,
      keyFormulas: [keyFormulaOrRule || 'Standard Definition'],
      modelQuestions: [
        {
          type: '2-Mark Short Answer',
          marks: 2,
          question: `Define ${topicTitle} and state its key formula/axiom.`,
          tamilQuestion: `${tamilTopicTitle || topicTitle} வரையறை தருக.`,
          stepByStepAnswer: `1. Definition: Exact definition per official textbook.\n2. Formula: ${keyFormulaOrRule || 'Standard form'}.`
        },
        {
          type: '5-Mark Long Answer',
          marks: 5,
          question: `Explain the detailed theory and mathematical formulation of ${topicTitle}.`,
          tamilQuestion: `${tamilTopicTitle || topicTitle} விவரித்து விளக்குக.`,
          stepByStepAnswer: `Step 1: Statement of Law.\nStep 2: Mathematical Derivation.\nStep 3: Graph / Diagram representation.\nStep 4: Real-world applications.`
        }
      ],
      quizQuestions: [
        {
          id: 'q1',
          question: `Which of the following is the key formula/rule for ${topicTitle}?`,
          tamilQuestion: `${tamilTopicTitle || topicTitle} என்பதன் சரியான சமன்பாடு எது?`,
          options: [
            keyFormulaOrRule || 'Primary Option A',
            'Alternative Option B',
            'Option C',
            'Option D'
          ],
          correctIndex: 0,
          explanation: `Option A is the authentic government-notified formulation for ${topicTitle}.`,
          tamilExplanation: `சரியான தேர்வு A.`
        }
      ]
    };

    NANO_CONTENT_CACHE[cacheKey] = fallbackLesson;
    return fallbackLesson;
  },

  /**
   * Socratic AI Tutor Chat for live doubt resolution on the active nano topic
   */
  async askSocraticTutor(
    question: string,
    topicTitle: string,
    subject: string,
    courseTitle: string,
    userApiKey?: string,
    conversationHistory: Array<{ sender: 'user' | 'ai'; text: string }> = []
  ): Promise<string> {
    const historyText = conversationHistory
      .slice(-4)
      .map(m => `${m.sender === 'user' ? 'Student' : 'Tutor'}: ${m.text}`)
      .join('\n');

    const prompt = `You are TutO AI, an empathetic, brilliant Socratic tutor helping a student master the following curriculum topic:

Topic: ${topicTitle}
Subject: ${subject}
Course: ${courseTitle}

Conversation History:
${historyText}

Student Question: "${question}"

Instructions:
1. Explain clearly in friendly, encouraging Bilingual Tamil & English style.
2. Use clear analogies, step-by-step logic, and exact formulas.
3. End with a short engaging check-for-understanding question to test their concept mastery.`;

    try {
      const response = await geminiToolsService.executePrompt(
        prompt,
        userApiKey,
        'Tamil',
        [],
        GEMINI_MODELS.FLASH_25 || 'gemini-2.5-flash'
      );
      if (response && response.text) {
        return response.text;
      }
    } catch (e) {
      console.warn('AI Tutor query fallback:', e);
    }

    return `Super question! In ${topicTitle} (${subject}), remember that the key rule is to understand the fundamental principle step-by-step. Let me know if you would like me to solve a specific 2-mark or 5-mark numerical problem for you!`;
  }
};
