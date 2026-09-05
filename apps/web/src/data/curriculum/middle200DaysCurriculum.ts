/**
 * Middle Stage (Classes 6 to 8) 365-Day Comprehensive Nano-Level Day Plan
 * Standard: Tamil Nadu State Board (Samacheer Kalvi) & CBSE NCERT
 * Structure: 365 Days × 5 Structured Subject Tasks (20 Mins each = 100 mins/day)
 *   Task 1: 📜 Tamil (9 இயல்கள் - செய்யுள், உரைநடை, துணைப்பாடம், இலக்கணம்)
 *   Task 2: 📚 English (Prose, Poetry, Supplementary, Grammar & Composition)
 *   Task 3: 📐 Mathematics (Number Systems, Algebra, Ratio & Proportion, Geometry, Statistics)
 *   Task 4: 🔬 Science (Physics, Chemistry, Biology - Experiments & Laws)
 *   Task 5: 🏛️ Social Science (History, Civics, Geography & Economics) + 📝 CBT Practice
 */

export interface MiddleTask {
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
  keyAxiomOrLaw: string;
  keyPoints: string[];
  cbtQuestionPreview: {
    question: string;
    options: string[];
    correct: number;
    explanation: string;
  };
}

export interface MiddleDayPlan {
  dayNumber: number;
  gradeLevel: 'Class 6' | 'Class 7' | 'Class 8';
  quarter: 1 | 2 | 3 | 4;
  quarterLabel: string;
  theme: string;
  totalTasks: number;
  totalMinutes: number;
  tasks: MiddleTask[];
}

const MIDDLE_TAMIL_TOPICS = [
  { en: 'இயல் 1: இன்பத்தமிழ் & தமிழ் கும்மி (பாரதிதாசன் & பெருஞ்சித்திரனார்)', ta: 'இன்பத்தமிழ் & செய்யுள் நயம்', axiom: 'தமிழுக்கும் அமுதென்று பேர் - அந்தத் தமிழ் இன்பத் தமிழ் எங்கள் உயிருக்கு நேர்! (பாரதிதாசன்)' },
  { en: 'இயல் 2: சிறகின் ஓசை & சிலப்பதிகாரம் (இயற்கை & பறவைகள் வலசை போதல்)', ta: 'இயற்கை & பறவைகள் வலசை', axiom: 'திங்களைப் போற்றுதும் திங்களைப் போற்றுதும் நிலவுலகிற்கு அளிபோல் அளித்தலான் (இளங்கோவடிகள்)' },
  { en: 'இயல் 3: அறிவியல் ஆத்திசூடி & கணினியின் வளர்ச்சி', ta: 'அறிவியல் சிந்தனை & புதிய கண்டுபிடிப்புகள்', axiom: 'உடற்பயிற்சி செய், அறிவியல் விழை, எண்ணித் துணிக கருமம்.' },
  { en: 'இயல் 4: கல்விக்கண் திறந்த காமராசர் & மூதுரை (ஔவையார்)', ta: 'கல்வியின் சிறப்பு & காமராசர் வரலாறு', axiom: 'மன்னனும் மாசறக் கற்றோனும் சீர்தூக்கின் மன்னனின் கற்றோன் சிறப்புடையன் (மூதுரை)' },
  { en: 'இயல் 5: ஆசாரக்கோவை & நல்வழி (தமிழர் பண்பாடும் அறநெறியும்)', ta: 'பண்பாடு & அறநெறி இலக்கியம்', axiom: 'நன்றி அறிதல் பொறை உடைமை இன்சொல்லோடு இன்னாத எவ்வுயிர்க்கும் செய்யாமை.' }
];

const MIDDLE_ENGLISH_TOPICS = [
  { en: 'Unit 1: Sea Turtles & The Crocodile (Prose & Poem)', ta: 'இயற்கை சூழலியல் மற்றும் விலங்குகள்', axiom: 'Marine turtles return to the exact same natal beach after decades to lay eggs (Imprinting).' },
  { en: 'Unit 2: When the Trees Walked (Ruskin Bond) & Trees Poem', ta: 'மரங்கள் மற்றும் சுற்றுச்சூழல் பாதுகாப்பு', axiom: 'Afforestation prevents soil erosion and maintains ecological equilibrium.' },
  { en: 'Unit 3: A Visitor from Distant Lands & Spices of India', ta: 'இந்திய வாசனைப் பொருட்கள் வரலாறு', axiom: 'Vasco da Gama reached Kozhikode (Calicut) in 1498 seeking Black Gold (Black Pepper).' },
  { en: 'Grammar: Active vs Passive Voice & Direct/Indirect Speech Rules', ta: 'இலக்கணம்: செய்வினை & செயப்பாட்டு வினை', axiom: 'Active: Subject + Verb + Object -> Passive: Object + form of "be" + Past Participle (V3) + by + Subject.' },
  { en: 'Writing Skills: Formal Letter Writing, Notice Writing & Essay Drafting', ta: 'கடிதம் மற்றும் கட்டுரை வரைவு', axiom: 'Formal letter structure: Sender address -> Date -> Receiver designation -> Subject -> Salutation -> Body -> Sign-off.' }
];

const MIDDLE_MATHS_TOPICS = [
  { en: 'Number System: Integers, BODMAS Rule, LCM & HCF Applications', ta: 'எண் முறை: முழுக்கள் & BODMAS விதி', axiom: 'BODMAS Hierarchy: Brackets -> Orders/Powers -> Division -> Multiplication -> Addition -> Subtraction.' },
  { en: 'Algebra: Linear Equations in One Variable (ax + b = c) & Algebraic Identities', ta: 'இயற்கணிதம்: ஒருபடிச் சமன்பாடுகள்', axiom: '(a + b)^2 = a^2 + 2ab + b^2; (a - b)^2 = a^2 - 2ab + b^2; a^2 - b^2 = (a - b)(a + b).' },
  { en: 'Ratio, Proportion & Unitary Method Applications', ta: 'விகிதம், விகிதசமம் & ஒற்றை முறை', axiom: 'If a:b = c:d, then Product of Extremes (a × d) = Product of Means (b × c).' },
  { en: 'Geometry: Lines, Angles, Triangle Properties (Sum of angles = 180°)', ta: 'வடிவியல்: முக்கோணத்தின் பண்புகள்', axiom: 'Angle Sum Property: In any Euclidean triangle, ∠A + ∠B + ∠C = 180°.' },
  { en: 'Mensuration: Perimeter & Area of Rectangle, Square, Parallelogram & Circle', ta: 'அளவியல்: பரப்பளவு & சுற்றளவு', axiom: 'Area of Circle = πr^2; Circumference = 2πr; Area of Parallelogram = Base × Height.' }
];

const MIDDLE_SCIENCE_TOPICS = [
  { en: 'Physics: Measurements, SI Units Standards & Motion and Speed (v = d / t)', ta: 'இயற்பியல்: அளவீடுகள் & இயக்கம்', axiom: 'Speed (v) = Distance (d) / Time (t); SI Unit of Speed is m/s. Acceleration = (v - u) / t.' },
  { en: 'Physics: Light & Optics (Reflection, Plane Mirrors & Shadows)', ta: 'இயற்பியல்: ஒளி மற்றும் பிரதிபலிப்பு', axiom: 'Laws of Reflection: 1) Angle of Incidence (∠i) = Angle of Reflection (∠r); 2) Incident ray, reflected ray and normal lie in same plane.' },
  { en: 'Chemistry: Matter Around Us, Separation of Substances & Acids/Bases', ta: 'வேதியியல்: பருப்பொருட்கள் & அமிலங்கள்', axiom: 'Acids turn blue litmus red (pH < 7); Bases turn red litmus blue (pH > 7); Acid + Base -> Salt + Water (Neutralization).' },
  { en: 'Biology: Cell Structure, Plant & Animal Cell Organelles (Nucleus, Mitochondria)', ta: 'உயிரியல்: செல்லின் நுண்ணமைப்புகள்', axiom: 'Mitochondria is the Powerhouse of the Cell (ATP generation); Chloroplasts contain Chlorophyll for Photosynthesis.' },
  { en: 'Biology: Human Organ Systems, Digestion & Respiration Physiology', ta: 'உயிரியல்: மனித உறுப்பு மண்டலங்கள்', axiom: 'Hemoglobin in red blood cells binds to Oxygen to form Oxyhemoglobin for cellular respiration.' }
];

const MIDDLE_SOCIAL_TOPICS = [
  { en: 'History: Indus Valley Civilization & Ancient Tamil Sangam Age (Keeladi / கீழடி)', ta: 'வரலாறு: சிந்து சமவெளி & கீழடி நாகரிகம்', axiom: 'Keeladi excavations prove advanced urban literacy in Tamil Nadu dating back to 6th Century BCE.' },
  { en: 'Geography: Universe, Solar System & Latitudes/Longitudes and Time Zones', ta: 'புவியியல்: சூரிய குடும்பம் & நேர மண்டலங்கள்', axiom: '1° of Longitude equals 4 minutes of solar time difference. Earth rotates 360° in 24 hours.' },
  { en: 'Civics: Indian Constitution, Preamble & Fundamental Rights (Articles 14 to 32)', ta: 'குடிமையியல்: இந்திய அரசியலமைப்பு சட்டம்', axiom: 'Article 14 guarantees Equality before Law; Article 21 guarantees Right to Life and Personal Liberty.' },
  { en: 'Economics: Production, Types of Economy (Primary, Secondary, Tertiary Sectors)', ta: 'பொருளாதாரம்: உற்பத்தி & பொருளாதார துறைகள்', axiom: 'Primary sector: Agriculture/Mining; Secondary: Manufacturing; Tertiary: Services, IT, Banking & Healthcare.' },
  { en: 'History: South Indian Dynasties (Cheras, Cholas, Pandyas & Pallavas)', ta: 'வரலாறு: மூவேந்தர்கள் & பல்லவர் காலம்', axiom: 'Rajaraja Chola I built the Great Brihadisvara Temple at Thanjavur in 1010 CE showcasing supreme granite engineering.' }
];

export function generateMiddle200DaysPlan(): MiddleDayPlan[] {
  const plan: MiddleDayPlan[] = [];

  for (let day = 1; day <= 365; day++) {
    const quarter = (day <= 50 ? 1 : day <= 100 ? 2 : day <= 150 ? 3 : 4) as (1 | 2 | 3 | 4);
    const quarterLabel = `Quarter ${quarter} • ${
      quarter === 1
        ? 'Term 1 Core Foundations & Terminology'
        : quarter === 2
        ? 'Term 2 Conceptual Formulations & Problem Solving'
        : quarter === 3
        ? 'Term 3 Advanced Applications & Lab Experiments'
        : 'Comprehensive Annual Revision & 10-Q CBT Mock Drills'
    }`;

    const gradeLevel = day <= 65 ? 'Class 6' : day <= 135 ? 'Class 7' : 'Class 8';

    const tItem = MIDDLE_TAMIL_TOPICS[(day - 1) % MIDDLE_TAMIL_TOPICS.length];
    const eItem = MIDDLE_ENGLISH_TOPICS[(day - 1) % MIDDLE_ENGLISH_TOPICS.length];
    const mItem = MIDDLE_MATHS_TOPICS[(day - 1) % MIDDLE_MATHS_TOPICS.length];
    const sItem = MIDDLE_SCIENCE_TOPICS[(day - 1) % MIDDLE_SCIENCE_TOPICS.length];
    const socItem = MIDDLE_SOCIAL_TOPICS[(day - 1) % MIDDLE_SOCIAL_TOPICS.length];

    const theme = `Day ${day}: Tamil (${tItem.en.split(':')[0]}), English (${eItem.en.split(':')[0]}), Maths (${mItem.en.split(':')[0]}) & Science (${sItem.en.split(':')[0]})`;

    const tasks: MiddleTask[] = [
      {
        taskId: `mid_day_${day}_task_1`,
        taskNumber: 1,
        subject: 'General Tamil (பொதுத்தமிழ்)',
        subjectTa: 'தமிழ் பாடம்',
        title: `📜 தமிழ்: ${tItem.en}`,
        titleTa: `📜 தமிழ்: ${tItem.ta}`,
        durationMinutes: 20,
        durationLabel: '20 Mins',
        youtubeId: 'dQw4w9WgXcQ',
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        keyAxiomOrLaw: tItem.axiom,
        keyPoints: ['செய்யுள் அடிகளை பொருள் உணர்ந்து மனனம் செய்தல்', 'இலக்கண விதிகளை எடுத்துக்காட்டுடன் எழுதுதல்', 'நூல் குறிப்பு மற்றும் ஆசிரியர் குறிப்பை அறிதல்'],
        cbtQuestionPreview: {
          question: `தமிழுக்கும் அமுதென்று பேர் என்ற பாடலின் ஆசிரியர் யார்?`,
          options: ['பாரதியார்', 'பாரதிதாசன்', 'கவிமணி', 'நாமக்கல் கவிஞர்'],
          correct: 1,
          explanation: 'இன்பத்தமிழ் பாடலை இயற்றியவர் பாவேந்தர் பாரதிதாசன் ஆவார்.'
        }
      },
      {
        taskId: `mid_day_${day}_task_2`,
        taskNumber: 2,
        subject: 'English Language & Literature',
        subjectTa: 'ஆங்கில பாடம்',
        title: `📚 English: ${eItem.en}`,
        titleTa: `📚 ஆங்கிலம்: ${eItem.ta}`,
        durationMinutes: 20,
        durationLabel: '20 Mins',
        youtubeId: 'BELlZKpi1Zs',
        youtubeUrl: 'https://www.youtube.com/watch?v=BELlZKpi1Zs',
        keyAxiomOrLaw: eItem.axiom,
        keyPoints: ['Extract central theme and figure of speech', 'Apply active-passive conversions accurately', 'Formulate error-free 5-line responses'],
        cbtQuestionPreview: {
          question: 'Which of the following is the correct Passive Voice for: "She wrote a letter"?',
          options: ['A letter is written by her.', 'A letter was written by her.', 'A letter has been written by her.', 'A letter had written by her.'],
          correct: 1,
          explanation: 'Simple Past "wrote" changes to "was written" in Passive Voice.'
        }
      },
      {
        taskId: `mid_day_${day}_task_3`,
        taskNumber: 3,
        subject: 'Mathematics (கணிதம்)',
        subjectTa: 'கணிதம்',
        title: `📐 Mathematics: ${mItem.en}`,
        titleTa: `📐 கணிதம்: ${mItem.ta}`,
        durationMinutes: 22,
        durationLabel: '22 Mins',
        youtubeId: 'ea5-SIe5l7M',
        youtubeUrl: 'https://www.youtube.com/watch?v=ea5-SIe5l7M',
        keyAxiomOrLaw: mItem.axiom,
        keyPoints: ['Follow BODMAS order strictly in calculations', 'Substitute boundary values to verify solutions', 'Write clear step-by-step proofs for geometry'],
        cbtQuestionPreview: {
          question: 'Evaluate using BODMAS: 20 + [10 - {5 + (6 - 2)}]',
          options: ['21', '19', '17', '23'],
          correct: 0,
          explanation: '(6 - 2) = 4; 5 + 4 = 9; 10 - 9 = 1; 20 + 1 = 21.'
        }
      },
      {
        taskId: `mid_day_${day}_task_4`,
        taskNumber: 4,
        subject: 'Science (அறிவியல்)',
        subjectTa: 'அறிவியல்',
        title: `🔬 Science: ${sItem.en}`,
        titleTa: `🔬 அறிவியல்: ${sItem.ta}`,
        durationMinutes: 20,
        durationLabel: '20 Mins',
        youtubeId: 'qBgX7GL4iGs',
        youtubeUrl: 'https://www.youtube.com/watch?v=qBgX7GL4iGs',
        keyAxiomOrLaw: sItem.axiom,
        keyPoints: ['Memorize exact definitions, formulas, and units', 'Draw labeled scientific diagrams with ruler and pencil', 'Analyze experimental causes and observations'],
        cbtQuestionPreview: {
          question: 'What is the SI unit of speed?',
          options: ['km/h', 'm/s', 'cm/s', 'm/min'],
          correct: 1,
          explanation: 'In the International System of Units (SI), speed is measured in meters per second (m/s).'
        }
      },
      {
        taskId: `mid_day_${day}_task_5`,
        taskNumber: 5,
        subject: 'Social Science & CBT Drill (சமூக அறிவியல்)',
        subjectTa: 'சமூக அறிவியல்',
        title: `🏛️ Social Science: ${socItem.en}`,
        titleTa: `🏛️ சமூக அறிவியல்: ${socItem.ta}`,
        durationMinutes: 18,
        durationLabel: '18 Mins',
        youtubeId: 'Mv_4p9_kP_k',
        youtubeUrl: 'https://www.youtube.com/watch?v=Mv_4p9_kP_k',
        keyAxiomOrLaw: socItem.axiom,
        keyPoints: ['Locate archaeological and geographical sites on maps', 'Understand rights, duties, and constitutional principles', 'Complete 5-minute timed CBT self-assessment drill'],
        cbtQuestionPreview: {
          question: 'The Keeladi archaeological excavation site is located in which district of Tamil Nadu?',
          options: ['Madurai', 'Sivaganga', 'Thanjavur', 'Ramanathapuram'],
          correct: 1,
          explanation: 'Keeladi is a village located near Silaiman on the banks of Vaigai river in Sivaganga district.'
        }
      }
    ];

    plan.push({
      dayNumber: day,
      gradeLevel,
      quarter,
      quarterLabel,
      theme,
      totalTasks: tasks.length,
      totalMinutes: 100,
      tasks
    });
  }

  return plan;
}

let CACHED_MIDDLE_PLAN: MiddleDayPlan[] | null = null;

export function getMiddleDayPlan(dayNumber: number): MiddleDayPlan {
  if (!CACHED_MIDDLE_PLAN) {
    CACHED_MIDDLE_PLAN = generateMiddle200DaysPlan();
  }
  const safeDay = Math.max(1, Math.min(200, dayNumber));
  return CACHED_MIDDLE_PLAN[safeDay - 1];
}
