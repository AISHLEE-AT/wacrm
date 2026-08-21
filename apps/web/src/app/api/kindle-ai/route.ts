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
  const pool = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '').split(',').map(k => k.trim()).filter(Boolean);
  pool.forEach(k => {
    if (!keys.includes(k)) keys.push(k);
  });
  return keys;
}

// ── Helper to normalize cached item to Admin & Player schema ──
function normalizeLessonItem(raw: any, primaryKey: string) {
  if (!raw) return null;
  const coreConcepts = raw.coreConcepts?.length ? raw.coreConcepts : (raw.studyNotes || []).map((sn: any) => ({
    heading: sn.sectionTitle || sn.heading || 'Core Concept',
    content: sn.content || sn.body || '',
    example: sn.example || sn.formulaOrExample || ''
  }));

  const mcqs = (raw.mcqs?.length ? raw.mcqs : (raw.practiceQuiz || [])).map((pq: any, i: number) => ({
    id: `q${i + 1}`,
    question: pq.question || `Diagnostic Question ${i + 1}`,
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
  const isTamil = courseTitle.includes('தமிழ்') || courseId.includes('-ta-');
  const safeDay = Math.max(1, dayNumber || 1);
  const taskIdx = taskNumber ? Math.max(0, taskNumber - 1) : 0;

  let subject = 'General Studies';
  let topicName = `Day ${safeDay} Mastery`;
  let formula = 'Standard Formula / Method';

  if (courseId.includes('jee') || courseId.includes('engineering')) {
    const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Daily Problem Sprint'];
    const activeSub = taskNumber ? subjects[taskIdx % subjects.length] : subjects[(safeDay - 1) % 3];
    subject = activeSub;
    const topicsMap: Record<string, string[]> = {
      Mathematics: ['Straight Lines & Coordinate Geometry', 'Complex Numbers & Quadratic Equations', 'Matrices & Determinants', 'Differential Calculus', 'Integral Calculus & Areas', 'Vectors & 3D Geometry', 'Probability & Statistics', 'Trigonometric Equations'],
      Physics: ['Kinematics & Laws of Motion', 'Work, Energy & Rotational Motion', 'Gravitation & Fluids', 'Thermodynamics & Heat', 'Electrostatics & Capacitance', 'Current Electricity & Magnetism', 'Ray Optics & Wave Optics', 'Modern Physics & Semiconductors'],
      Chemistry: ['Chemical Bonding & Molecular Structure', 'Chemical Thermodynamics & Equilibrium', 'Solutions & Electrochemistry', 'Chemical Kinetics', 'General Organic Chemistry (GOC)', 'Hydrocarbons & Haloalkanes', 'Coordination Compounds', 'Biomolecules & Polymers'],
      'Daily Problem Sprint': ['10-Question High-Speed JEE Sprint', 'Advanced Multi-Concept Integration', 'Previous Year Examination Drills', 'Error Elimination & Time Strategy']
    };
    const list = topicsMap[subject] || topicsMap.Mathematics;
    topicName = `${subject}: ${list[(Math.floor((safeDay - 1) / 2)) % list.length]} (Day ${safeDay})`;
    formula = subject === 'Mathematics' ? 'Perpendicular Distance: d = |ax1 + by1 + c| / sqrt(a^2 + b^2)' : (subject === 'Physics' ? 'Work-Energy: W_net = Delta K = 1/2 m(v^2 - u^2)' : 'Equilibrium Constant: Delta G^0 = -RT ln(K_eq)');
  } else if (courseId.includes('neet') || courseId.includes('medical')) {
    const subjects = ['Botany & Plant Physiology', 'Zoology & Human Physiology', 'Physics', 'Chemistry'];
    const activeSub = taskNumber ? subjects[taskIdx % subjects.length] : subjects[(safeDay - 1) % subjects.length];
    subject = activeSub;
    const topicsMap: Record<string, string[]> = {
      'Botany & Plant Physiology': ['Cell Cycle & Division', 'Plant Physiology: Photosynthesis & Respiration', 'Plant Kingdom & Morphology', 'Ecology & Environmental Issues'],
      'Zoology & Human Physiology': ['Human Digestion & Respiration', 'Circulation & Excretory System', 'Neural Control & Coordination', 'Genetics & Molecular Evolution'],
      Physics: ['Kinematics & Dynamics', 'Thermodynamics', 'Ray Optics & Waves', 'Electrostatics & Magnetic Effects'],
      Chemistry: ['Atomic Structure & Periodic Trends', 'Thermodynamics & Solutions', 'Organic Reactions & Mechanisms', 'Coordination Chemistry']
    };
    const list = topicsMap[subject] || topicsMap['Botany & Plant Physiology'];
    topicName = `${subject}: ${list[(Math.floor((safeDay - 1) / 2)) % list.length]} (Day ${safeDay})`;
    formula = subject.includes('Botany') || subject.includes('Zoology') ? 'Hardy-Weinberg Principle: p^2 + 2pq + q^2 = 1' : 'Snell Law: n1 sin(i) = n2 sin(r)';
  } else if (courseId.includes('tnpsc') || courseId.includes('upsc') || courseId.includes('ssc')) {
    const subjects = isTamil 
      ? ['பொதுத்தமிழ் & செய்யுள்', 'இந்திய அரசியலமைப்பு (Polity)', 'இந்திய வரலாறு & தமிழ்நாடு பண்பாடு', 'பொது அறிவியல் & பொருளாதாரம்', 'திறனறிவும் மனக்கணக்கும் (Aptitude)']
      : ['General English & Lit', 'Indian Polity & Constitution', 'History & Culture of India', 'General Science & Economy', 'Aptitude & Mental Ability'];
    const activeSub = taskNumber ? subjects[taskIdx % subjects.length] : subjects[(safeDay - 1) % subjects.length];
    subject = activeSub;
    const polityTopics = ['Preamble & Salient Features of Constitution', 'Fundamental Rights (Articles 14–32)', 'Directive Principles & Fundamental Duties', 'Union Executive: President & Prime Minister', 'Parliament: Lok Sabha & Rajya Sabha Powers', 'Judiciary: Supreme Court & Judicial Review', 'State Government & Governor Powers', 'Constitutional Bodies & Election Commission'];
    topicName = `${subject}: ${polityTopics[(safeDay - 1) % polityTopics.length]} (Day ${safeDay})`;
    formula = subject.includes('Aptitude') || subject.includes('திறனறிவும்') ? 'Simple Interest: SI = (P * N * R) / 100' : 'Article 32: Constitutional Remedies (Writs)';
  } else {
    // K-12 Tamil / English Medium Schools (e.g. Class 7, 10, 12)
    const subjects = isTamil 
      ? ['தமிழ் மொழி & செய்யுள்', 'கணிதம்', 'அறிவியல்', 'சமூக அறிவியல்', 'ஆங்கிலம்', 'மாதிரித் தேர்வு & வினாடி வினா']
      : ['Language (Tamil/Hindi)', 'Mathematics', 'Science (EVS/Physics/Chem)', 'Social Science', 'English & Phonics', 'Daily Assessment Quiz'];
    const activeSub = taskNumber ? subjects[taskIdx % subjects.length] : subjects[(safeDay - 1) % subjects.length];
    subject = activeSub;
    
    // Class-level topics
    if (isTamil) {
      const tamilUnits = ['இயல் 1: கவிதைப்பேழை & எங்கள் தமிழ்', 'இயல் 2: உரைநடை உலகம் & விலங்குகள் உலகம்', 'இயல் 3: விரிவானம் & இலக்கணம்', 'இயல் 4: அறிவியல் ஆக்கம் & கவிதை', 'இயல் 5: கல்வியே செல்வம்'];
      const mathsUnits = ['அலகு 1: எண்கள் & முழுக்கள்', 'அலகு 2: அளவைகள் & சுற்றளவு', 'அலகு 3: இயற்கணிதம் & மாறிகள்', 'அலகு 4: நேர் மற்றும் எதிர் விகிதங்கள்', 'அலகு 5: வடிவியல்'];
      const sciUnits = ['அலகு 1: அளவீட்டியல் & இயக்கம்', 'அலகு 2: விசையும் அழுத்தமும்', 'அலகு 3: நம்மைச் சுற்றியுள்ள பருப்பொருள்கள்', 'அலகு 4: அணு அமைப்பு', 'அலகு 5: தாவரங்களின் இனப்பெருக்கம்'];
      const socUnits = ['வரலாறு: இடைக்கால இந்திய வரலாற்று ஆதாரங்கள்', 'புவியியல்: புவியின் உள் அமைப்பு', 'குடிமையியல்: சமத்துவம்', 'வரலாறு: தென்னிந்திய அரசுகள்', 'புவியியல்: நிலத்தோற்றங்கள்'];

      if (subject.includes('தமிழ்')) topicName = `${subject}: ${tamilUnits[(safeDay - 1) % tamilUnits.length]} (நாள் ${safeDay})`;
      else if (subject.includes('கணிதம்')) topicName = `${subject}: ${mathsUnits[(safeDay - 1) % mathsUnits.length]} (நாள் ${safeDay})`;
      else if (subject.includes('அறிவியல்')) topicName = `${subject}: ${sciUnits[(safeDay - 1) % sciUnits.length]} (நாள் ${safeDay})`;
      else if (subject.includes('சமூக')) topicName = `${subject}: ${socUnits[(safeDay - 1) % socUnits.length]} (நாள் ${safeDay})`;
      else if (subject.includes('ஆங்கிலம்')) topicName = `${subject}: Unit ${((safeDay - 1) % 5) + 1} Prose & Grammar (Day ${safeDay})`;
      else topicName = `${subject}: நாள் ${safeDay} முழு மாதிரித் தேர்வு (50 மதிப்பெண்கள்)`;
    } else {
      topicName = `${subject}: Day ${safeDay} Chapter Foundations & Key Drills`;
    }
    formula = subject.includes('கணிதம்') || subject.includes('Math') ? '(a + b)^2 = a^2 + 2ab + b^2' : (subject.includes('அறிவியல்') || subject.includes('Science') ? 'Speed = Distance / Time' : 'Subject + Verb + Object');
  }

  return {
    topicTitle: topicName,
    courseTitle: courseTitle,
    category: subject,
    subject: subject,
    dayNumber: safeDay,
    taskNumber: taskNumber || 1,
    overview: `Day ${safeDay} structured academic session on ${topicName}. This session covers theoretical concepts, illustrative examples, exam guidelines, and retention drills aligned with board curriculum standards.`,
    coreConcepts: [
      {
        heading: `1. Core Theoretical Foundations: ${topicName}`,
        content: `Master the key definitions, underlying principles, and essential textbook rules of ${topicName}. Designed for conceptual clarity and exam readiness.`,
        example: `Standard textbook problem and illustrative real-world application.`
      },
      {
        heading: `2. Methodologies & Step-by-Step Problem Solving`,
        content: `Systematic approach to solving exam questions for ${topicName}. Details required steps, working notes, and presentation methods.`,
        example: `Worked model question highlighting scoring points.`
      },
      {
        heading: `3. High-Yield Exam Formulas & Traps to Avoid`,
        content: `Crucial memory aids, formulas, and rapid elimination rules to prevent marks loss in exams.`,
        example: formula
      }
    ],
    tamilExplanation: {
      simpleTitle: isTamil ? topicName : `${topicName} (தமிழ் விளக்கம்)`,
      colloquialIntro: `இன்றைய பாடம் (நாள் ${safeDay}, பிரிவு ${taskNumber || 1}): ${topicName} பற்றிய எளிய தமிழ் விளக்கம்.`,
      everydayAnalogy: `நமது அன்றாட வாழ்வியல் உதாரணங்கள் மூலம் இந்த கருத்தை எளிதாக நினைவில் கொள்ளலாம்.`,
      keyPointsTamil: [
        `கருத்து 1: ${topicName} அடிப்படைக் கோட்பாடுகள்`,
        `கருத்து 2: தேர்வுக்கான முக்கிய சூத்திரங்கள் மற்றும் முறைகள்`,
        `கருத்து 3: நினைவில் கொள்ள வேண்டிய எளிய குறுக்குவழிகள்`
      ]
    },
    vsaqs: [
      { question: `State the primary definition or rule for ${topicName}.`, answer: `Standard academic definition and conditions for ${topicName}.`, marks: 2 },
      { question: `Write the governing formula, principle, or key takeaway.`, answer: formula, marks: 2 }
    ],
    mcqs: [
      {
        id: 'q1',
        question: `Which option represents the primary governing principle of ${topicName}?`,
        options: ['A) Primary Governing Principle', 'B) Secondary Approximate Rule', 'C) Special Case Exception', 'D) None of the above'],
        correctAnswer: 0,
        explanation: 'Option A is the verified core definition according to standard textbook curriculum.'
      },
      {
        id: 'q2',
        question: `What is the governing equation or rule for ${topicName}?`,
        options: [`A) ${formula}`, 'B) Inverted Variable Ratio', 'C) Non-Standard Expression', 'D) Empirical Constant Only'],
        correctAnswer: 0,
        explanation: `The exact formulation is: ${formula}.`
      },
      {
        id: 'q3',
        question: `In standard board and competitive examinations, this topic carries:`,
        options: ['A) High weightage with recurring questions', 'B) Negligible weightage', 'C) Optional reading only', 'D) Non-evaluated section'],
        correctAnswer: 0,
        explanation: 'This is an essential core syllabus component with recurring questions.'
      },
      {
        id: 'q4',
        question: `What is the most frequent examination error to avoid in ${topicName}?`,
        options: ['A) Calculation and sign errors', 'B) Incorrect unit conversion', 'C) Formula misapplication', 'D) All of the above'],
        correctAnswer: 3,
        explanation: 'Step-by-step verification of signs, units, and boundary conditions prevents common marks deduction.'
      }
    ],
    formulasAndMnemonics: [
      { name: `${topicName} Master Rule`, formula: formula, mnemonic: 'Active Recall Examination Rule' }
    ],
    videoMeta: {
      youtubeVideoId: '0TgLtF3PMOc',
      videoTitle: `${topicName} Masterclass`,
      channelName: 'TeachO 1-on-1 Tuition'
    },
    videoId: '0TgLtF3PMOc'
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
    
    // Auto-resolve authentic day and section topic if generic or missing
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

        // Check local bundle & harvest fallback files
        const localCandidates = [
          path.join(process.cwd(), 'src/data/generated_catalog', `${primaryKey}.json`),
          cleanCourseId && safeDay && safeTask > 1 ? path.join(process.cwd(), 'src/data/generated_catalog', `${cleanCourseId}_day_${safeDay}_task_${safeTask}.json`) : null,
          cleanCourseId && safeDay ? path.join(process.cwd(), 'src/data/generated_catalog', `${cleanCourseId}_day_${safeDay}_task_1.json`) : null,
          cleanCourseId && safeDay ? path.join(process.cwd(), 'src/data/generated_catalog', `${cleanCourseId}_day_${safeDay}.json`) : null,
          cleanCourseId && safeDay ? `D:/doc/MULTI_DAY_HARVEST/json_by_day/${cleanCourseId}_day_${safeDay}.json` : null,
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
                    isVerifiedInDb: false,
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
    let generatedJson: any = null;
    let usedModel = '';
    let usedKeyType = '';

    if (candidateKeys.length > 0) {
      const prompt = buildPrompt(cleanTopic, cleanCourse, cleanBoard, cleanStandard, safeDay, safeTask);

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
            console.warn(`[Kindle JIT AI] Key #${kIdx} (${isUserKey ? 'user' : 'system'}) Model ${modelName} attempt failed:`, err.message?.substring(0, 100));
          }
        }

        if (generatedJson) break; // Successfully generated
      }
    }

    // ── Step 3: If AI Generation Succeeded, Cache & Return ──────
    if (generatedJson) {
      try {
        generatedJson.courseId = cleanCourseId;
        generatedJson.dayNumber = safeDay;
        generatedJson.taskNumber = safeTask;

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
        ...normalizeLessonItem(generatedJson, primaryKey),
        _meta: {
          source: 'jit-generated',
          isVerifiedInDb: true,
          model: usedModel,
          keySource: usedKeyType,
          latencyMs: elapsed,
          cacheKey: primaryKey
        }
      });
    }

    // ── Step 4: Deterministic Day & Section Specific Fallback ──
    const synthesized = synthesizeDaySpecificCurriculum(cleanCourseId, cleanCourse, safeDay, cleanBoard, safeTask);
    const normalizedFallback = normalizeLessonItem(synthesized, primaryKey);
    const elapsed = Date.now() - startTime;

    return NextResponse.json({
      ...normalizedFallback,
      _meta: {
        source: 'curriculum-engine',
        isVerifiedInDb: false,
        isDaySpecific: true,
        dayNumber: safeDay,
        taskNumber: safeTask,
        latencyMs: elapsed,
        cacheKey: primaryKey
      }
    });

  } catch (error: any) {
    console.error('[Kindle AI] Unexpected error:', error);
    const fallback = synthesizeDaySpecificCurriculum('', 'Master Course', 1);
    return NextResponse.json({
      ...fallback,
      _meta: { source: 'emergency-fallback', isVerifiedInDb: false }
    });
  }
}
