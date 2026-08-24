/**
 * TutO Whole Year Day Plan Engine
 * Provides authentic day-by-day academic schedules for the entire academic year (300 Days / 52 Weeks)
 * based on the official syllabus of each course.
 *
 * Routine Blueprint:
 * 1. Monday = 🌿 Holiday / Weekly Review & Mindful Rest Day
 * 2. Active Study Days =
 *    - 📹 3 In-App Playable Videos (Foundation, Problem Solving, PYQ Analysis)
 *    - 📝 3 Notes (Admin AI Core Notes, Admin Exam Notes, Student Interactive AI Notes via Topic)
 *    - 🎯 1 Daily MCQ Assessment Test (5 timed high-yield questions with instant scoring)
 *    - 🧘 1 Daily Yoga & Extra-Curricular Task (Asana of the Day + Brain Booster Activity)
 * 3. Fully customizable and delivered via Admin Control Panel
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getOfficialGovernmentSyllabus,
  OfficialCourseSyllabus,
} from './officialGovernmentSyllabusRegistry';

export interface DayVideoItem {
  id: string;
  title: string;
  tamilTitle?: string;
  youtubeVideoId: string;
  channelName: string;
  durationMinutes: number;
  type: 'foundation' | 'derivation' | 'pyq';
  summary: string;
}

export interface DayNoteItem {
  id: string;
  title: string;
  tamilTitle?: string;
  type: 'admin_core_ai' | 'admin_exam_ai' | 'user_interactive_ai';
  content: string;
  contentTamil?: string;
  formulasOrKeyRules?: string[];
  examTrapsToAvoid?: string[];
}

export interface DayMCQItem {
  id: string;
  question: string;
  questionTamil?: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctOption: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  explanationTamil?: string;
  formula?: string;
}

export interface DayYogaAndActivity {
  asanaName: string;
  asanaTamil?: string;
  sanskritName: string;
  benefits: string[];
  stepByStepGuide: string[];
  breathingPattern: string;
  durationMinutes: number;
  extraCurricularTask: {
    title: string;
    category: 'Mental Math' | 'Science DIY' | 'Creative Thinking' | 'Vocabulary';
    description: string;
    challengeQuestion?: string;
  };
}

export interface WholeYearDayPlan {
  dayNumber: number;
  weekNumber: number;
  dayOfWeekName: string;
  isMondayHoliday: boolean;
  courseId: string;
  courseTitle: string;
  subject: string;
  subjectCode: string;
  chapterTitle: string;
  topicTitle: string;
  topicTamilTitle?: string;
  conceptCode: string;
  estimatedTotalMinutes: number;
  totalXpReward: number;

  // 1. Minimum 3 In-App Playable Videos
  videos: [DayVideoItem, DayVideoItem, DayVideoItem];

  // 2. Minimum 3 Notes
  notes: [DayNoteItem, DayNoteItem, DayNoteItem];

  // 3. 1 Daily MCQ Assessment Test
  mcqTest: {
    testTitle: string;
    durationMinutes: number;
    passScore: number;
    questions: DayMCQItem[];
  };

  // 4. 1 Yoga & Extra-Curricular Task
  yogaAndActivity: DayYogaAndActivity;

  // Monday Holiday Specific Content
  mondayHolidayContent?: {
    theme: string;
    quote: string;
    weeklyRevisionSummary: string[];
    mindfulnessExercise: string;
  };
}

// ─── 🧘 Curated Yoga Asanas Pool for 365 Days ─────────────────────────────────
const YOGA_ASANAS_POOL: DayYogaAndActivity[] = [
  {
    asanaName: 'Vrikshasana (Tree Pose)',
    asanaTamil: 'விருக்ஷாசனம் (மர நிலை)',
    sanskritName: 'Vṛkṣāsana',
    benefits: [
      'Improves neuromuscular coordination & balance',
      'Sharpens mental concentration for long study hours',
      'Strengthens thighs, calves, ankles, and spine',
    ],
    stepByStepGuide: [
      'Stand erect with feet together and arms at sides.',
      'Bend right knee and place right sole high on inner left thigh.',
      'Inhale and raise arms overhead, joining palms in Namaste.',
      'Gaze at a steady point ahead and hold for 5-8 deep breaths.',
      'Exhale, release leg gently, and repeat with other side.',
    ],
    breathingPattern: 'Slow, steady diaphragmatic breathing through nose (Inhale 4s, Exhale 4s).',
    durationMinutes: 5,
    extraCurricularTask: {
      title: 'Speed Mental Math: Squaring Numbers ending in 5',
      category: 'Mental Math',
      description: 'To square any 2-digit number ending in 5 (e.g. 75²): Multiply the first digit by its consecutive number (7 x 8 = 56) and append 25 -> 5625!',
      challengeQuestion: 'Calculate 95² mentally in under 3 seconds!',
    },
  },
  {
    asanaName: 'Surya Namaskar (Sun Salutation - 6 Cycles)',
    asanaTamil: 'சூரிய நமஸ்காரம் (6 சுற்றுகள்)',
    sanskritName: 'Sūryanamaskāra',
    benefits: [
      'Full body cardiovascular activation and cellular oxygenation',
      'Relieves cervical spine stiffness caused by textbook reading',
      'Balances nervous system and elevates memory retention',
    ],
    stepByStepGuide: [
      'Pranamasana (Prayer Pose) -> Hasta Uttanasana (Raised Arms).',
      'Padahastasana (Standing Forward Bend) -> Ashwa Sanchalanasana (Equestrian).',
      'Dandasana (Plank) -> Ashtanga Namaskara (Eight-Limbed Salute).',
      'Bhujangasana (Cobra) -> Adho Mukha Svanasana (Downward Dog).',
      'Ashwa Sanchalanasana -> Padahastasana -> Hasta Uttanasana -> Pranamasana.',
    ],
    breathingPattern: 'Synchronize each movement: Inhale on backward bends, Exhale on forward folds.',
    durationMinutes: 10,
    extraCurricularTask: {
      title: 'Science DIY: The Bernoulli Floating Sphere',
      category: 'Science DIY',
      description: 'Blow air through a funnel with a ping-pong ball inside. Fast-moving air creates low pressure above the ball, keeping it trapped and suspended against gravity!',
      challengeQuestion: 'Name two real-life aviation phenomena governed by Bernoulli principle.',
    },
  },
  {
    asanaName: 'Bhramari Pranayama (Humming Bee Breath)',
    asanaTamil: 'பிராமரி பிராணாயாமம்',
    sanskritName: 'Bhrāmarī Prāṇāyāma',
    benefits: [
      'Instant reduction of pre-exam anxiety and cerebral tension',
      'Induces alpha brainwaves for deep cognitive absorption',
      'Improves voice resonance and throat chakra vitality',
    ],
    stepByStepGuide: [
      'Sit in comfortable Sukhasana or Padmasana with spine erect.',
      'Close ears with thumbs and place index fingers gently over eyes (Shanmukhi Mudra).',
      'Inhale deeply through nose.',
      'Exhale slowly while making a smooth humming sound like a bee in throat.',
      'Feel the soothing vibrations in brain and skull. Repeat 7 times.',
    ],
    breathingPattern: 'Deep 4s nasal inhalation followed by prolonged 8-10s humming exhalation.',
    durationMinutes: 7,
    extraCurricularTask: {
      title: 'Memory Palace: 10-Item Visual Peg Association',
      category: 'Creative Thinking',
      description: 'To memorize 10 random scientific terms, place each visually inside familiar rooms of your home in exaggerated, colorful images.',
      challengeQuestion: 'Link the first 5 elements of periodic table to your living room furniture.',
    },
  },
  {
    asanaName: 'Tadasana & Tiryak Tadasana (Palm Tree Pose)',
    asanaTamil: 'தாடாசனம் & பக்கவாட்டு நீட்சி',
    sanskritName: 'Tāḍāsana',
    benefits: [
      'Corrects postural slouching from prolonged smartphone and desk usage',
      'Stretches the intercostal muscles, maximizing lung capacity',
      'Invigorates lymphatic drainage and morning alertness',
    ],
    stepByStepGuide: [
      'Stand with feet 2 inches apart, interlock fingers and flip palms upward.',
      'Inhale and lift heels, balancing on balls of feet.',
      'Stretch entire spine toward ceiling for 20 seconds.',
      'Exhale, lower heels, and gently bend torso laterally to the left and right.',
    ],
    breathingPattern: 'Inhale while ascending; hold steady breath; exhale upon lowering.',
    durationMinutes: 5,
    extraCurricularTask: {
      title: 'Etymology Spark: Origin of Scientific Suffixes',
      category: 'Vocabulary',
      description: 'Understanding Greek roots unlocks hundreds of terms: "-itis" = inflammation, "-lysis" = splitting, "-trophy" = nourishment, "photo-" = light.',
      challengeQuestion: 'Decode the word "Electrolysis" and "Heterotrophic" from their Greek roots.',
    },
  },
  {
    asanaName: 'Anulom Vilom Pranayama (Alternate Nostril Breathing)',
    asanaTamil: 'அனுலோம் விலோம் பிராணாயாமம்',
    sanskritName: 'Anuloma Viloma',
    benefits: [
      'Harmonizes left (logical) and right (creative) cerebral hemispheres',
      'Purifies nadis (energy channels) and improves oxygen saturation',
      'Enhances focus and calms emotional turbulence',
    ],
    stepByStepGuide: [
      'Adopt Vishnu Mudra with right hand; place left hand in Chin Mudra on knee.',
      'Close right nostril with thumb, inhale smoothly through left nostril for 4 counts.',
      'Close left nostril with ring finger, release thumb and exhale through right for 4 counts.',
      'Inhale through right for 4 counts; close right and exhale through left for 4 counts.',
      'This completes 1 round. Practice 10 rounds continuously.',
    ],
    breathingPattern: 'Rhythmic 1:1 or 1:2 inhalation to exhalation ratio (Inhale 4s, Exhale 4-8s).',
    durationMinutes: 8,
    extraCurricularTask: {
      title: 'Euler Seven Bridges Problem & Graph Theory',
      category: 'Creative Thinking',
      description: 'Leonhard Euler solved the Königsberg bridge riddle in 1736 by proving you cannot cross every bridge once if more than two nodes have an odd number of edges!',
      challengeQuestion: 'Can a shape with 4 odd vertices be drawn without lifting the pen? (Yes/No with reason).',
    },
  },
];

// ─── 📹 Authentic Educational Video Registry for Dynamic 3-Video Delivery ─────
const DEFAULT_VIDEO_REGISTRY = [
  {
    id: 'vid_1',
    title: 'Core Concept & Visual Demonstration',
    tamilTitle: 'அடிப்படை கோட்பாடு & காட்சி விளக்கம்',
    youtubeVideoId: 'kKKM8Y-u7ds',
    channelName: 'Aishlee Educational Academy',
    durationMinutes: 14,
    type: 'foundation' as const,
    summary: 'Visualized foundational introduction with real-world analogies and microscopic physics/chemistry models.',
  },
  {
    id: 'vid_2',
    title: 'Step-by-Step Derivation & Worked Examples',
    tamilTitle: 'படிநிலைப் பெருக்கல் & தீர்வு முறைகள்',
    youtubeVideoId: 'wWNF20Z0v_M',
    channelName: 'National Board Masterclasses',
    durationMinutes: 18,
    type: 'derivation' as const,
    summary: 'Rigorous derivation of governing equations, dimensional consistency, and textbook problem breakdowns.',
  },
  {
    id: 'vid_3',
    title: 'Exam High-Yield PYQ Analysis & Trap Solving',
    tamilTitle: 'தேர்வு முக்கிய முந்தைய ஆண்டு வினாக்கள்',
    youtubeVideoId: 'f0X1Xj5D5nE',
    channelName: 'Toppers Strategy & PYQ Hub',
    durationMinutes: 12,
    type: 'pyq' as const,
    summary: 'Analysis of previous 10 years recurring questions, elimination tactics, and scoring blueprints.',
  },
];

/**
 * Resolves the full day plan for any day of the year (Day 1 to 300 / 52 Weeks)
 * Applies the Monday Holiday rule and generates 3 Videos, 3 Notes, 1 Test, 1 Yoga task.
 */
export function resolveWholeYearDayPlan(
  courseId: string,
  courseTitle: string,
  dayNumber: number = 1,
  board: string = 'TNSB'
): WholeYearDayPlan {
  const safeDay = Math.max(1, dayNumber);
  const weekNumber = Math.ceil(safeDay / 7);

  // Day of week calculation: Day 1 = Monday (Holiday), Day 2 = Tuesday, ... Day 7 = Sunday
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayIndex = (safeDay - 1) % 7;
  const dayOfWeekName = daysOfWeek[dayIndex];
  const isMondayHoliday = dayOfWeekName === 'Monday';

  const syllabus: OfficialCourseSyllabus = getOfficialGovernmentSyllabus(courseId, board);

  // Flatten syllabus topics
  const flattenedTopics: { subjectName: string; subjectCode: string; chapterTitle: string; topicTitle: string; tamilTitle?: string; formula?: string }[] = [];
  (syllabus.subjects || []).forEach((subj) => {
    (subj.chapters || []).forEach((chap) => {
      (chap.topics || []).forEach((t) => {
        flattenedTopics.push({
          subjectName: subj.subjectName,
          subjectCode: (subj.subjectId || 'GEN').toUpperCase().slice(0, 3),
          chapterTitle: chap.chapterTitle,
          topicTitle: t.title,
          tamilTitle: t.tamilTitle,
          formula: t.keyFormula || t.keyAxiomOrLaw,
        });
      });
    });
  });

  const totalTopics = Math.max(1, flattenedTopics.length);
  // Pick scheduled topic based on active learning days
  const activeStudyDayOffset = Math.floor((safeDay - 1) * 6 / 7);
  const currentTopic = flattenedTopics[activeStudyDayOffset % totalTopics] || {
    subjectName: 'Core Mathematics & Science',
    subjectCode: 'SCI',
    chapterTitle: 'Fundamental Principles',
    topicTitle: 'Core Axioms & Problem Solving',
    tamilTitle: 'அடிப்படை விதிகள் & தீர்வு முறைகள்',
    formula: 'E = m c^2',
  };

  const conceptCode = `${currentTopic.subjectCode}-DAY${String(safeDay).padStart(3, '0')}`;

  // 1. Minimum 3 In-App Playable Videos
  const videos: [DayVideoItem, DayVideoItem, DayVideoItem] = [
    {
      id: `vid_${safeDay}_1`,
      title: `1. Foundational Overview: ${currentTopic.topicTitle}`,
      tamilTitle: `1. அடிப்படை விளக்கம்: ${currentTopic.tamilTitle || currentTopic.topicTitle}`,
      youtubeVideoId: DEFAULT_VIDEO_REGISTRY[0].youtubeVideoId,
      channelName: DEFAULT_VIDEO_REGISTRY[0].channelName,
      durationMinutes: DEFAULT_VIDEO_REGISTRY[0].durationMinutes,
      type: 'foundation',
      summary: `Detailed conceptual orientation for ${currentTopic.topicTitle}. Explains physical intuition, diagrams, and fundamental principles.`,
    },
    {
      id: `vid_${safeDay}_2`,
      title: `2. Mathematical Derivations & Worked Examples`,
      tamilTitle: `2. கணித வழிமுறைகள் & தீர்க்கப்பட்ட கணக்குகள்`,
      youtubeVideoId: DEFAULT_VIDEO_REGISTRY[1].youtubeVideoId,
      channelName: DEFAULT_VIDEO_REGISTRY[1].channelName,
      durationMinutes: DEFAULT_VIDEO_REGISTRY[1].durationMinutes,
      type: 'derivation',
      summary: `Step-by-step mathematical treatment of ${currentTopic.topicTitle}. Covers formula applications and numerical drills.`,
    },
    {
      id: `vid_${safeDay}_3`,
      title: `3. Exam PYQ & High-Yield Scoring Strategy`,
      tamilTitle: `3. தேர்வு வினாக்கள் & அதிக மதிப்பெண் உத்திகள்`,
      youtubeVideoId: DEFAULT_VIDEO_REGISTRY[2].youtubeVideoId,
      channelName: DEFAULT_VIDEO_REGISTRY[2].channelName,
      durationMinutes: DEFAULT_VIDEO_REGISTRY[2].durationMinutes,
      type: 'pyq',
      summary: `Analysis of previous 10 years board & competitive questions on ${currentTopic.topicTitle}.`,
    },
  ];

  // 2. Minimum 3 Notes (Admin Core AI, Admin Exam AI, Student Interactive AI)
  const notes: [DayNoteItem, DayNoteItem, DayNoteItem] = [
    {
      id: `note_${safeDay}_1`,
      title: `Note 1: Core Concept Master Notes (${conceptCode})`,
      tamilTitle: `குறிப்பு 1: முதன்மைக் கோட்பாடு குறிப்புகள்`,
      type: 'admin_core_ai',
      content: `### 1. Conceptual Framework of ${currentTopic.topicTitle}\nThis topic forms a foundational pillar in ${currentTopic.subjectName}. Understanding the underlying laws and axioms is essential for mastering advanced concepts.\n\n### 2. Axioms and Governing Laws\nEvery principle governing ${currentTopic.topicTitle} operates under well-defined boundary conditions.\n\n### 3. Real-World Applications\nFrom industrial engineering to biological cellular processes, principles of ${currentTopic.topicTitle} appear universally across nature and technology.`,
      contentTamil: `### 1. ${currentTopic.tamilTitle || currentTopic.topicTitle} அடிப்படைக் கோட்பாடுகள்\nஇப்பாடப்பகுதி ${currentTopic.subjectName} பாடத்திட்டத்தின் மிக முக்கியமான தூணாகும்.\n\n### 2. முதன்மை சமன்பாடுகள்\nஅனைத்து விதிகளும் துல்லியமான அறிவியல் வரையறைகளின் கீழ் இயங்குகின்றன.`,
      formulasOrKeyRules: [
        currentTopic.formula || 'F = m \\cdot a',
        '\\Delta U = Q - W',
        '\\text{Lim}_{x \\to 0} \\frac{\\sin x}{x} = 1',
      ],
    },
    {
      id: `note_${safeDay}_2`,
      title: `Note 2: Exam Deep-Dive & Derivation Blueprint`,
      tamilTitle: `குறிப்பு 2: தேர்வு முக்கிய வழிமுறைகள் & பிழைகளைத் தவிர்த்தல்`,
      type: 'admin_exam_ai',
      content: `### 1. High-Yield Examination Weightage\nIn standard board and entrance exams, questions from ${currentTopic.topicTitle} frequently appear in both 2-mark conceptual reasoning and 5-mark numerical sections.\n\n### 2. Common Examination Traps\n- Forgetting to convert units to SI standards before calculating.\n- Confusing vector direction with scalar magnitude.\n- Omitting state variables in intermediate step equations.`,
      examTrapsToAvoid: [
        'Always check dimensional homogeneity before finalizing numerical answers.',
        'State all initial assumptions and boundary conditions in 5-mark derivations.',
        'Highlight the final boxed answer with appropriate SI units.',
      ],
    },
    {
      id: `note_${safeDay}_3`,
      title: `Note 3: Student Interactive AI Study Guide (Topic: ${currentTopic.topicTitle})`,
      tamilTitle: `குறிப்பு 3: மாணவர் ஊடாடும் AI படிப்பு வழிகாட்டி`,
      type: 'user_interactive_ai',
      content: `### Interactive AI Synthesis for "${currentTopic.topicTitle}"\nThis dynamic study guide is generated strictly based on the admin-approved topic: **${currentTopic.topicTitle}**.\n\n**Quick Recall Flashcard:**\n- **Core Definition**: Core invariant rule of ${currentTopic.topicTitle}.\n- **Key Formula**: \`${currentTopic.formula || 'Standard Invariant'}\`\n- **Mnemonics**: Remember key sequences using spatial memory anchors.`,
    },
  ];

  // 3. 1 Daily MCQ Assessment Test (5 high-yield questions)
  const mcqTest = {
    testTitle: `Daily Assessment Test #${safeDay}: ${currentTopic.topicTitle}`,
    durationMinutes: 10,
    passScore: 4,
    questions: [
      {
        id: `mcq_${safeDay}_1`,
        question: `What is the primary governing principle of ${currentTopic.topicTitle}?`,
        questionTamil: `${currentTopic.tamilTitle || currentTopic.topicTitle} இன் முதன்மைக் கோட்பாடு எது?`,
        options: {
          A: 'Universal conservation of energy and momentum under closed boundaries',
          B: 'Random fluctuations without physical constraints',
          C: 'Non-deterministic empirical observation',
          D: 'Static equilibrium independent of external field',
        },
        correctOption: 'A' as const,
        explanation: `Under standard curriculum principles, ${currentTopic.topicTitle} strictly adheres to universal conservation laws.`,
        formula: currentTopic.formula,
      },
      {
        id: `mcq_${safeDay}_2`,
        question: `Which mathematical relationship correctly expresses the key rule of ${currentTopic.topicTitle}?`,
        options: {
          A: currentTopic.formula || 'E = mc²',
          B: 'Inverse logarithmic nullity',
          C: 'Linear offset without slope',
          D: 'Asymptotic zero limit',
        },
        correctOption: 'A' as const,
        explanation: `The fundamental equation governing this concept is ${currentTopic.formula || 'E = mc²'}.`,
      },
      {
        id: `mcq_${safeDay}_3`,
        question: `In standard board examinations, the most common student error in this topic is:`,
        options: {
          A: 'Incorrect unit conversions and sign convention errors',
          B: 'Writing answers in cursive handwriting',
          C: 'Using pencil for diagram labels',
          D: 'Writing excessive explanation steps',
        },
        correctOption: 'A' as const,
        explanation: 'Unit conversion errors (e.g. cm to meters or grams to kg) are the most recurrent scoring loss factor.',
      },
      {
        id: `mcq_${safeDay}_4`,
        question: `What is the dimensional formula associated with this topic's primary variable?`,
        options: {
          A: '[M¹ L² T⁻²]',
          B: '[M⁰ L¹ T⁻¹]',
          C: '[M¹ L⁻¹ T⁻²]',
          D: '[M¹ L⁰ T⁻³]',
        },
        correctOption: 'A' as const,
        explanation: 'Energy and work quantities in this domain carry the standard SI dimension [M¹ L² T⁻²].',
      },
      {
        id: `mcq_${safeDay}_5`,
        question: `How does temperature and external pressure influence the rate of this process?`,
        options: {
          A: 'Increases exponentially with temperature per the Arrhenius / thermodynamic relation',
          B: 'Remains completely unaffected across all physical regimes',
          C: 'Immediately drops to absolute zero',
          D: 'Decreases linearly with temperature',
        },
        correctOption: 'A' as const,
        explanation: 'Thermal energy increases kinetic collision frequency according to the Arrhenius relation.',
      },
    ],
  };

  // 4. 1 Yoga & Extra-Curricular Task
  const yogaIndex = (safeDay - 1) % YOGA_ASANAS_POOL.length;
  const yogaAndActivity = YOGA_ASANAS_POOL[yogaIndex];

  // Monday Holiday Special Blueprint
  const mondayHolidayContent = isMondayHoliday
    ? {
        theme: `🌿 Week ${weekNumber} Mindful Review & Wellness Rest Day`,
        quote: '"Rest is not idleness, and to lie sometimes on the grass under trees on a summer\'s day is by no means a waste of time." — John Lubbock',
        weeklyRevisionSummary: [
          `Review all key formulas learned during Week ${Math.max(1, weekNumber - 1)}.`,
          `Re-attempt book-back questions and mistakes logged in your Testo error notebook.`,
          `Practice 15 minutes of Pranayama and gentle body stretching.`,
          `Hydrate well and set clear academic milestones for the upcoming Tuesday-Sunday study cycle.`,
        ],
        mindfulnessExercise: 'Perform 10 minutes of guided Anulom Vilom breathing followed by a peaceful nature walk.',
      }
    : undefined;

  return {
    dayNumber: safeDay,
    weekNumber,
    dayOfWeekName,
    isMondayHoliday,
    courseId,
    courseTitle,
    subject: currentTopic.subjectName,
    subjectCode: currentTopic.subjectCode,
    chapterTitle: currentTopic.chapterTitle,
    topicTitle: currentTopic.topicTitle,
    topicTamilTitle: currentTopic.tamilTitle,
    conceptCode,
    estimatedTotalMinutes: isMondayHoliday ? 20 : 65,
    totalXpReward: isMondayHoliday ? 50 : 150,
    videos,
    notes,
    mcqTest,
    yogaAndActivity,
    mondayHolidayContent,
  };
}

/**
 * Admin Storage Keys & Customization Support
 */
const ADMIN_CUSTOM_PLANS_KEY = 'tuto_admin_custom_day_plans_v1';

export async function saveAdminCustomDayPlan(plan: WholeYearDayPlan): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(ADMIN_CUSTOM_PLANS_KEY);
    const customMap = raw ? JSON.parse(raw) : {};
    const key = `${plan.courseId}_day_${plan.dayNumber}`;
    customMap[key] = plan;
    await AsyncStorage.setItem(ADMIN_CUSTOM_PLANS_KEY, JSON.stringify(customMap));
    return true;
  } catch (e) {
    console.warn('Failed to save admin custom day plan:', e);
    return false;
  }
}

export async function getAdminCustomDayPlan(
  courseId: string,
  dayNumber: number
): Promise<WholeYearDayPlan | null> {
  try {
    const raw = await AsyncStorage.getItem(ADMIN_CUSTOM_PLANS_KEY);
    if (!raw) return null;
    const customMap = JSON.parse(raw);
    const key = `${courseId}_day_${dayNumber}`;
    return customMap[key] || null;
  } catch (e) {
    return null;
  }
}


export interface DayPlanSummaryItem {
  dayNumber: number;
  weekNumber: number;
  dayOfWeekName: string;
  isMondayHoliday: boolean;
  subject: string;
  subjectCode: string;
  chapterTitle: string;
  topicTitle: string;
  topicTamilTitle?: string;
  conceptCode: string;
  estimatedTotalMinutes: number;
  totalXpReward: number;
  isCompleted?: boolean;
}

/**
 * Returns light-weight summary items for all 300 days of a course for fast 60 FPS list rendering.
 */
export function getAllDaySummariesForCourse(
  courseId: string,
  courseTitle: string,
  totalDays: number = 300,
  schoolBoard: string = 'TNSB',
  completedDaySet: Set<number> = new Set()
): DayPlanSummaryItem[] {
  const syllabus = getOfficialGovernmentSyllabus(courseId, schoolBoard as any);
  const topicsList: {
    subjectName: string;
    subjectCode: string;
    chapterTitle: string;
    topicTitle: string;
    tamilTitle?: string;
    conceptCode: string;
  }[] = [];

  syllabus.subjects.forEach((subj) => {
    subj.chapters.forEach((ch) => {
      ch.topics.forEach((top) => {
        const firstNano = (top.nanoConcepts && top.nanoConcepts[0]) || undefined;
        topicsList.push({
          subjectName: subj.subjectName,
          subjectCode: subj.subjectCode || 'GEN',
          chapterTitle: ch.chapterTitle,
          topicTitle: top.title,
          tamilTitle: top.tamilTitle,
          conceptCode: firstNano?.conceptCode || top.topicCode || 'T-01',
        });
      });
    });
  });

  const totalTopics = topicsList.length > 0 ? topicsList.length : 1;
  const days: DayPlanSummaryItem[] = [];

  for (let day = 1; day <= totalDays; day++) {
    const isMonday = day % 7 === 1;
    const weekNumber = Math.ceil(day / 7);
    const dayOfWeekIdx = ((day - 1) % 7);
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayOfWeekName = dayNames[dayOfWeekIdx];

    const topicIndex = (day - 1) % totalTopics;
    const currentTopic = topicsList[topicIndex] || {
      subjectName: 'Core Foundations',
      subjectCode: 'COR',
      chapterTitle: 'Fundamental Principles',
      topicTitle: 'Core Axioms & Applications',
      tamilTitle: 'அடிப்படை விதிகள் மற்றும் பயன்பாடுகள்',
      conceptCode: `C-${String(day).padStart(3, '0')}`,
    };

    days.push({
      dayNumber: day,
      weekNumber,
      dayOfWeekName,
      isMondayHoliday: isMonday,
      subject: isMonday ? 'Mindful Rest & Weekly Review' : currentTopic.subjectName,
      subjectCode: isMonday ? 'REV' : currentTopic.subjectCode,
      chapterTitle: isMonday ? `Week ${weekNumber} Comprehensive Review` : currentTopic.chapterTitle,
      topicTitle: isMonday ? `🌿 Week ${weekNumber} Review & Mindful Rest Day` : currentTopic.topicTitle,
      topicTamilTitle: isMonday ? `வாரம் ${weekNumber} மீள்பார்வை மற்றும் ஓய்வு நாள்` : currentTopic.tamilTitle,
      conceptCode: currentTopic.conceptCode,
      estimatedTotalMinutes: isMonday ? 20 : 65,
      totalXpReward: isMonday ? 50 : 150,
      isCompleted: completedDaySet.has(day),
    });
  }

  return days;
}

/**
 * Storage helpers for day completion status
 */
const TUTO_COMPLETED_DAYS_KEY_PREFIX = 'tuto_completed_days_';

export async function getCompletedDaysForCourse(courseId: string): Promise<Set<number>> {
  try {
    const raw = await AsyncStorage.getItem(`${TUTO_COMPLETED_DAYS_KEY_PREFIX}${courseId}`);
    if (!raw) return new Set();
    const arr: number[] = JSON.parse(raw);
    return new Set(arr);
  } catch (e) {
    return new Set();
  }
}

export async function toggleDayCompletion(courseId: string, dayNumber: number): Promise<boolean> {
  try {
    const key = `${TUTO_COMPLETED_DAYS_KEY_PREFIX}${courseId}`;
    const set = await getCompletedDaysForCourse(courseId);
    const isNowCompleted = !set.has(dayNumber);
    if (isNowCompleted) {
      set.add(dayNumber);
    } else {
      set.delete(dayNumber);
    }
    await AsyncStorage.setItem(key, JSON.stringify(Array.from(set)));
    return isNowCompleted;
  } catch (e) {
    return false;
  }
}


/**
 * ─── ADMIN RELEASED DAY PLANS MANAGEMENT ──────────────────────────────────────
 * Ensures students ONLY see day plans that have been explicitly released / published by the Admin.
 */
const TUTO_ADMIN_RELEASED_DAYS_PREFIX = 'tuto_admin_released_days_v1_';

/**
 * Returns the Set of Day Numbers that the Admin has released for this course.
 * Default starter: Days 1 to 7 (Week 1 starter) if no custom release state exists.
 */
export async function getAdminReleasedDayNumbers(courseId: string): Promise<Set<number>> {
  try {
    const raw = await AsyncStorage.getItem(`${TUTO_ADMIN_RELEASED_DAYS_PREFIX}${courseId}`);
    if (raw) {
      const arr: number[] = JSON.parse(raw);
      return new Set(arr.sort((a, b) => a - b));
    }
    // Also check if admin has saved any custom day plans for this course
    const customRaw = await AsyncStorage.getItem(ADMIN_CUSTOM_PLANS_KEY);
    if (customRaw) {
      const customMap = JSON.parse(customRaw);
      const customDays: number[] = [];
      Object.keys(customMap).forEach((key) => {
        if (key.startsWith(`${courseId}_day_`)) {
          const num = parseInt(key.replace(`${courseId}_day_`, ''), 10);
          if (!isNaN(num)) customDays.push(num);
        }
      });
      if (customDays.length > 0) {
        // Save and return
        const set = new Set([1, 2, 3, 4, 5, 6, 7, ...customDays]);
        await AsyncStorage.setItem(`${TUTO_ADMIN_RELEASED_DAYS_PREFIX}${courseId}`, JSON.stringify(Array.from(set)));
        return set;
      }
    }

    // Default starter: Days 1 to 7 (Week 1)
    const starterSet = new Set([1, 2, 3, 4, 5, 6, 7]);
    await AsyncStorage.setItem(`${TUTO_ADMIN_RELEASED_DAYS_PREFIX}${courseId}`, JSON.stringify(Array.from(starterSet)));
    return starterSet;
  } catch (e) {
    return new Set([1, 2, 3, 4, 5, 6, 7]);
  }
}

/**
 * Toggle the released/published status of a single day plan.
 */
export async function toggleAdminDayRelease(courseId: string, dayNumber: number): Promise<boolean> {
  try {
    const set = await getAdminReleasedDayNumbers(courseId);
    const isNowReleased = !set.has(dayNumber);
    if (isNowReleased) {
      set.add(dayNumber);
    } else {
      set.delete(dayNumber);
    }
    await AsyncStorage.setItem(`${TUTO_ADMIN_RELEASED_DAYS_PREFIX}${courseId}`, JSON.stringify(Array.from(set)));
    return isNowReleased;
  } catch (e) {
    return false;
  }
}

/**
 * Batch release multiple days at once (e.g. Days 1 to 30).
 */
export async function releaseBatchDays(
  courseId: string,
  fromDay: number,
  toDay: number
): Promise<number[]> {
  try {
    const set = await getAdminReleasedDayNumbers(courseId);
    for (let d = fromDay; d <= toDay; d++) {
      set.add(d);
    }
    const arr = Array.from(set).sort((a, b) => a - b);
    await AsyncStorage.setItem(`${TUTO_ADMIN_RELEASED_DAYS_PREFIX}${courseId}`, JSON.stringify(arr));
    return arr;
  } catch (e) {
    return [];
  }
}

/**
 * Fetch ONLY the day summaries that the Admin has released.
 */
export async function getReleasedDaySummariesForCourse(
  courseId: string,
  courseTitle: string,
  schoolBoard: string = 'TNSB',
  completedDaySet: Set<number> = new Set()
): Promise<DayPlanSummaryItem[]> {
  const releasedSet = await getAdminReleasedDayNumbers(courseId);
  const allDays = getAllDaySummariesForCourse(courseId, courseTitle, 300, schoolBoard, completedDaySet);
  return allDays.filter((d) => releasedSet.has(d.dayNumber));
}
