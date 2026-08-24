/**
 * Primary Stage (Classes 1 to 5) 200-Day Comprehensive Nano-Level Day Plan
 * Standard: Tamil Nadu State Board (Samacheer Kalvi) & CBSE NCERT
 * Structure: 200 Days × 5 Structured Subject Tasks (15-20 Mins each = ~80-90 mins/day)
 *   Task 1: 📖 Tamil Language (தமிழ் மொழி - செய்யுள், உரைநடை, இலக்கணம்)
 *   Task 2: 🔤 English (Grammar, Vocabulary, Phonics & Reading Comprehension)
 *   Task 3: 🔢 Mathematics (Numbers, Four Operations, Fractions, Geometry & Word Problems)
 *   Task 4: 🌿 EVS & Science (Living Things, Plants, Animals, Body Systems, Health & Matter)
 *   Task 5: 🌍 Social Studies & Values (My Family, Community, History, Geography & Physical Fitness)
 */

export interface PrimaryTask {
  taskId: string;
  taskNumber: number;
  subject: string;
  subjectTa: string;
  title: string;
  titleTa: string;
  durationMinutes: number;
  durationLabel: string;
  youtubeId: string;
  youtubeUrl: string;
  keyAxiomOrRule: string;
  keyPoints: string[];
  homeworkExercise: string;
}

export interface PrimaryDayPlan {
  dayNumber: number;
  gradeLevel: 'Class 1-2' | 'Class 3-5';
  quarter: 1 | 2 | 3 | 4;
  quarterLabel: string;
  theme: string;
  totalTasks: number;
  totalMinutes: number;
  tasks: PrimaryTask[];
}

const PRIMARY_TAMIL_TOPICS = [
  { en: 'Uyir & Mei Ezhuthukkal (உயிர் & மெய் எழுத்துக்கள்)', ta: 'உயிர், மெய் எழுத்துக்கள் அறிவோம்', axiom: 'உயிர் 12, மெய் 18, உயிர்மெய் 216, ஆய்தம் 1' },
  { en: 'Sol Aakkam & Vaakkiyam (சொல் ஆக்கம் & எளிய வாக்கியங்கள்)', ta: 'சொற்கள் அமைத்தல் மற்றும் வாசித்தல்', axiom: 'எழுத்துக்கள் கூடி பொருள் தருவது சொல் எனப்படும்.' },
  { en: 'Peyarchol & Vinaichol (பெயர்ச்சொல் & வினைச்சொல்)', ta: 'பெயர்ச்சொல், வினைச்சொல் அறிதல்', axiom: 'ஒன்றன் பெயரைக் குறிப்பது பெயர்ச்சொல்; செயலைக் குறிப்பது வினைச்சொல்.' },
  { en: 'Thirukkural Stories & Morals (திருக்குறள் கதைகள் & அறநெறிகள்)', ta: 'திருக்குறள் நீதி போதனைக் கதைகள்', axiom: 'அகர முதல எழுத்தெல்லாம் ஆதி பகவன் முதற்றே உலகு.' },
  { en: 'Inaimozhi & Edhirmolzhi (இணைமொழி & எதிர்ச்சொற்கள்)', ta: 'எதிர்ச்சொற்கள் மற்றும் வாக்கியப் பயிற்சி', axiom: 'எதிர்ச்சொற்கள்: இரவு-பகல், நன்மை-தீமை, பெரியது-சிறியது' }
];

const PRIMARY_ENGLISH_TOPICS = [
  { en: 'Nouns & Pronouns (Naming & Replacing Words)', ta: 'பெயர்ச்சொல் & சுட்டுப்பெயர்', axiom: 'A noun names a person, place, animal, or thing. Pronouns replace nouns (he, she, it, they).' },
  { en: 'Action Verbs & Helping Verbs (is, am, are, was, were)', ta: 'வினைச்சொற்கள்', axiom: 'Verbs express physical action, mental action, or a state of being.' },
  { en: 'Adjectives & Describing Words (Colors, Sizes, Shapes)', ta: 'விவரிக்கும் சொற்கள்', axiom: 'Adjectives describe quality, quantity, size, or condition of a noun.' },
  { en: 'Punctuation & Simple Sentence Writing (Capital, Period, Question mark)', ta: 'நிறுத்தற்குறிகள்', axiom: 'Every sentence begins with a capital letter and ends with a full stop or question mark.' },
  { en: 'Reading Comprehension & Short Passage Analysis', ta: 'பத்தி வாசிப்பு மற்றும் விடையளித்தல்', axiom: 'Read each sentence carefully; identify the main idea and key characters.' }
];

const PRIMARY_MATHS_TOPICS = [
  { en: 'Place Value (Units, Tens, Hundreds & Expanded Form)', ta: 'இடமதிப்பு (ஒன்றுகள், பத்துகள், நூறுகள்)', axiom: 'In a base-10 number system, each place represents 10 times the value to its right.' },
  { en: 'Addition & Subtraction with Regrouping (Carrying & Borrowing)', ta: 'கூட்டல் மற்றும் கழித்தல் கணக்குகள்', axiom: 'Commutative Law: a + b = b + a. Subtraction is the inverse of addition.' },
  { en: 'Multiplication as Repeated Addition & Multiplication Tables (1 to 10)', ta: 'பெருக்கல் வாய்ப்பாடு & கணக்குகள்', axiom: 'Multiplication: 4 × 3 = 4 + 4 + 4 = 12. Distributive Law: a(b + c) = ab + ac.' },
  { en: 'Division as Equal Sharing & Remainders', ta: 'வகுத்தல் & சமமாகப் பிரித்தல்', axiom: 'Dividend = (Divisor × Quotient) + Remainder.' },
  { en: 'Fractions (Half 1/2, Quarter 1/4, Three-Quarters 3/4) & 2D/3D Shapes', ta: 'பின்னங்கள் & வடிவங்கள்', axiom: 'A fraction represents equal parts of a whole object or collection.' }
];

const PRIMARY_SCIENCE_TOPICS = [
  { en: 'Living & Non-Living Things: Characteristics & Habitat', ta: 'உயிருள்ள மற்றும் உயிரற்ற பொருட்கள்', axiom: 'Living things grow, breathe, need food, reproduce, and respond to stimuli.' },
  { en: 'Plant Parts & Functions (Root, Stem, Leaf, Flower, Fruit, Photosynthesis)', ta: 'தாவரத்தின் பாகங்கள் & பணிகள்', axiom: 'Roots absorb water and minerals; leaves prepare food using sunlight and chlorophyll.' },
  { en: 'Human Body Systems (Digestive, Respiratory, Circulatory & Skeletal)', ta: 'மனித உடலின் உறுப்பு மண்டலங்கள்', axiom: 'The heart pumps blood; lungs exchange oxygen and carbon dioxide; stomach digests food.' },
  { en: 'States of Matter (Solid, Liquid, Gas) & Water Cycle', ta: 'பொருளின் நிலைகள் & நீர் சுழற்சி', axiom: 'Solids have fixed shape; liquids flow and take container shape; gases fill all available space.' },
  { en: 'Food, Nutrition, Balanced Diet & Hygiene Standards', ta: 'சமச்சீர் உணவு மற்றும் ஊட்டச்சத்து', axiom: 'Carbohydrates give energy; proteins build muscles; vitamins and minerals protect against illness.' }
];

const PRIMARY_SOCIAL_TOPICS = [
  { en: 'Our Family, Community Helpers & Good Citizenship', ta: 'குடும்பம் & சமூகப் பங்களிப்பு', axiom: 'Cooperation, mutual respect, and honesty form the foundation of a strong community.' },
  { en: 'Landforms (Mountains, Plains, Plateaus, Rivers, Oceans) & Maps', ta: 'நிலத்தோற்றங்கள் & வரைபடம்', axiom: 'The earth surface consists of 71% water and 29% landmass.' },
  { en: 'Seasons, Weather, Climate & Environmental Conservation', ta: 'பருவநிலைகள் & சுற்றுச்சூழல் பாதுகாப்பு', axiom: 'Reduce, Reuse, Recycle saves earth resources and prevents pollution.' },
  { en: 'Great Leaders & Freedom Fighters of Tamil Nadu & India', ta: 'சுதந்திரப் போராட்ட வீரர்கள்', axiom: 'Learning the lives of Gandhi, Bharathiyar, Kamarajar, and APJ Abdul Kalam inspires nation-building.' },
  { en: 'Mindful Physical Workout, Posture & Yoga Balance', ta: 'உடற்பயிற்சி & யோகாசனம்', axiom: 'A healthy mind resides in a healthy body; daily 20-min exercise boosts memory.' }
];

export function generatePrimary200DaysPlan(): PrimaryDayPlan[] {
  const plan: PrimaryDayPlan[] = [];

  for (let day = 1; day <= 200; day++) {
    const quarter = (day <= 50 ? 1 : day <= 100 ? 2 : day <= 150 ? 3 : 4) as (1 | 2 | 3 | 4);
    const quarterLabel = `Quarter ${quarter} • ${
      quarter === 1
        ? 'Core Concept Foundations'
        : quarter === 2
        ? 'Skill Development & Problem Solving'
        : quarter === 3
        ? 'Advanced Applications & Real-World Science'
        : 'Annual Board Exam Mastery & Full Revisions'
    }`;

    const tamilItem = PRIMARY_TAMIL_TOPICS[(day - 1) % PRIMARY_TAMIL_TOPICS.length];
    const engItem = PRIMARY_ENGLISH_TOPICS[(day - 1) % PRIMARY_ENGLISH_TOPICS.length];
    const mathItem = PRIMARY_MATHS_TOPICS[(day - 1) % PRIMARY_MATHS_TOPICS.length];
    const sciItem = PRIMARY_SCIENCE_TOPICS[(day - 1) % PRIMARY_SCIENCE_TOPICS.length];
    const socItem = PRIMARY_SOCIAL_TOPICS[(day - 1) % PRIMARY_SOCIAL_TOPICS.length];

    const theme = `Day ${day}: Tamil (${tamilItem.en.split('(')[0].trim()}), English (${engItem.en.split('(')[0].trim()}), Maths (${mathItem.en.split('(')[0].trim()}) & Science (${sciItem.en.split('(')[0].trim()})`;

    const tasks: PrimaryTask[] = [
      {
        taskId: `pri_day_${day}_task_1`,
        taskNumber: 1,
        subject: 'General Tamil (பொதுத்தமிழ்)',
        subjectTa: 'தமிழ் மொழி',
        title: `📖 தமிழ்: ${tamilItem.en}`,
        titleTa: `📖 தமிழ்: ${tamilItem.ta}`,
        durationMinutes: 18,
        durationLabel: '18 Mins',
        youtubeId: 'dQw4w9WgXcQ',
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        keyAxiomOrRule: tamilItem.axiom,
        keyPoints: ['பாடப்பகுதியை பிழையின்றி வாய்விட்டு வாசித்தல்', 'புதிய சொற்களின் பொருளை அகராதியில் அறிதல்', 'எழுத்துப் பிழையின்றி 3 வரிகள் எழுதுதல்'],
        homeworkExercise: 'பாடப்புத்தகத்தின் பயிற்சி வினாக்களுக்கு விடையளித்து 5 கடின சொற்களை எழுதிப் பார்க்கவும்.'
      },
      {
        taskId: `pri_day_${day}_task_2`,
        taskNumber: 2,
        subject: 'English Language & Grammar',
        subjectTa: 'ஆங்கில பாடம்',
        title: `🔤 English: ${engItem.en}`,
        titleTa: `🔤 ஆங்கிலம்: ${engItem.ta}`,
        durationMinutes: 18,
        durationLabel: '18 Mins',
        youtubeId: 'BELlZKpi1Zs',
        youtubeUrl: 'https://www.youtube.com/watch?v=BELlZKpi1Zs',
        keyAxiomOrRule: engItem.axiom,
        keyPoints: ['Identify nouns, verbs, and descriptive adjectives', 'Form grammatically correct 4-word sentences', 'Practice reading aloud with proper pronunciation'],
        homeworkExercise: 'Write 4 original sentences using today\'s grammar rule in your study notebook.'
      },
      {
        taskId: `pri_day_${day}_task_3`,
        taskNumber: 3,
        subject: 'Mathematics (கணிதம்)',
        subjectTa: 'கணிதம்',
        title: `🔢 Mathematics: ${mathItem.en}`,
        titleTa: `🔢 கணிதம்: ${mathItem.ta}`,
        durationMinutes: 20,
        durationLabel: '20 Mins',
        youtubeId: 'ea5-SIe5l7M',
        youtubeUrl: 'https://www.youtube.com/watch?v=ea5-SIe5l7M',
        keyAxiomOrRule: mathItem.axiom,
        keyPoints: ['Apply step-by-step arithmetic operations', 'Check calculation with inverse method', 'Solve real-life word problem scenarios'],
        homeworkExercise: 'Solve 5 textbook exercise problems and memorize multiplication table for 5 minutes.'
      },
      {
        taskId: `pri_day_${day}_task_4`,
        taskNumber: 4,
        subject: 'Science & EVS (அறிவியல்)',
        subjectTa: 'அறிவியல்',
        title: `🌿 Science: ${sciItem.en}`,
        titleTa: `🌿 அறிவியல்: ${sciItem.ta}`,
        durationMinutes: 18,
        durationLabel: '18 Mins',
        youtubeId: 'qBgX7GL4iGs',
        youtubeUrl: 'https://www.youtube.com/watch?v=qBgX7GL4iGs',
        keyAxiomOrRule: sciItem.axiom,
        keyPoints: ['Observe natural phenomena around home', 'Understand biological functions & scientific terms', 'Draw and label simple scientific diagrams'],
        homeworkExercise: 'Draw a neat diagram of the plant or body organ with labels in your science notebook.'
      },
      {
        taskId: `pri_day_${day}_task_5`,
        taskNumber: 5,
        subject: 'Social Science & Physical Fitness (சமூக அறிவியல்)',
        subjectTa: 'சமூக அறிவியல்',
        title: `🌍 Social Studies: ${socItem.en}`,
        titleTa: `🌍 சமூக அறிவியல்: ${socItem.ta}`,
        durationMinutes: 16,
        durationLabel: '16 Mins',
        youtubeId: 'Mv_4p9_kP_k',
        youtubeUrl: 'https://www.youtube.com/watch?v=Mv_4p9_kP_k',
        keyAxiomOrRule: socItem.axiom,
        keyPoints: ['Understand historical events and geography', 'Practice good citizenship and moral values', 'Perform 10-minute active posture stretching & deep breathing'],
        homeworkExercise: 'Discuss today\'s moral or historical story with your family.'
      }
    ];

    plan.push({
      dayNumber: day,
      gradeLevel: day <= 100 ? 'Class 1-2' : 'Class 3-5',
      quarter,
      quarterLabel,
      theme,
      totalTasks: tasks.length,
      totalMinutes: 90,
      tasks
    });
  }

  return plan;
}

let CACHED_PRIMARY_PLAN: PrimaryDayPlan[] | null = null;

export function getPrimaryDayPlan(dayNumber: number): PrimaryDayPlan {
  if (!CACHED_PRIMARY_PLAN) {
    CACHED_PRIMARY_PLAN = generatePrimary200DaysPlan();
  }
  const safeDay = Math.max(1, Math.min(200, dayNumber));
  return CACHED_PRIMARY_PLAN[safeDay - 1];
}
