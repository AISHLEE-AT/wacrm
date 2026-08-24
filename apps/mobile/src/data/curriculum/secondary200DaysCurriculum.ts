/**
 * Secondary Stage (Classes 9 & 10 SSLC) 200-Day Board Exam Mastery Day Plan
 * Standard: Tamil Nadu State Board (Samacheer Kalvi 10th SSLC) & CBSE Class 10 NCERT
 * Structure: 200 Days × 5 High-Yield Subject Tasks (25 Mins each = 125 mins/day)
 *   Task 1: 📜 10th Tamil (9 இயல்கள், திருக்குறள், நெடுவினா & தொல்காப்பிய இலக்கணம்)
 *   Task 2: 📚 10th English (Prose, Poems, Supplementary, Grammar & 100/100 Strategy)
 *   Task 3: 📐 10th Mathematics (Functions, Algebra, Geometry, Trigonometry, Mensuration, Stats)
 *   Task 4: 🔬 10th Science (Physics Laws, Chemical Reactions, Biology Physiology & Formulas)
 *   Task 5: 🏛️ 10th Social Science (Indian Freedom Movement, Tamil Nadu Renaissance, Economy & CBT Drill)
 */

export interface SecondaryTask {
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
  keyFormulaOrLaw: string;
  keyPoints: string[];
  pyqFrequency: 'Very High' | 'High' | 'Repeated';
  boardExamTakeaway: string;
}

export interface SecondaryDayPlan {
  dayNumber: number;
  gradeLevel: 'Class 9' | 'Class 10 SSLC';
  quarter: 1 | 2 | 3 | 4;
  quarterLabel: string;
  theme: string;
  totalTasks: number;
  totalMinutes: number;
  tasks: SecondaryTask[];
}

const SECONDARY_TAMIL_TOPICS = [
  { en: 'இயல் 1: அன்னை மொழியே (பாவலேரறு பெருஞ்சித்திரனார்) & தமிழ் சொல்வளம்', ta: 'அன்னை மொழியே & தமிழ்ச் சொல்வளம்', formula: 'நற்றமிழே! நற்கனியே! செழுந்தமிழே! நின் பெருமை எம்மொழிதான் விவரிக்கும்? (பெருஞ்சித்திரனார்)' },
  { en: 'இயல் 2: காற்றே வா (பாரதியார்), முல்லைப்பாட்டு (நப்பூதனார்) & புயலிலே ஒரு தோணி', ta: 'காற்றே வா & முல்லைப்பாட்டு', formula: 'நீடுதுயில் நீக்கப் பாடிவந்த நிலா, காடு கமழும் கற்பூரச் சொற்கோ (மகாகவி பாரதியார்)' },
  { en: 'இயல் 3: விருந்து போற்றுதும் (தமிழர் விருந்தோம்பல் மரபு) & காசிக்காண்டம்', ta: 'விருந்தோம்பல் & காசிக்காண்டம்', formula: 'விருந்தினராக ஒருவன் வந்து எதிரின் வியத்தல் நன்மொழி இனிது உரைத்தல் (அதிவீரராம பாண்டியர்)' },
  { en: 'இயல் 4: செயற்கை நுண்ணறிவு (AI), பெருமாள் திருமொழி (குலசேகராழ்வார்) & பரிபாடல்', ta: 'செயற்கை நுண்ணறிவு & அறிவியல் தமிழ்', formula: 'வாளால் அறுத்துச் சுடினும் மருத்துவன்பால் மாளாத காதல் நோயாளன் போல் (குலசேகராழ்வார்)' },
  { en: 'இயல் 5: நீதி வெண்பா (செய்குத்தம்பி பாவலர்), திருவிளையாடற் புராணம் & மொழிபெயர்ப்புக் கலை', ta: 'நீதி வெண்பா & திருவிளையாடற் புராணம்', formula: 'அருளைப் பெருக்கி அறிவைத் திருத்தி மருளை அகற்றி மதிக்கும் தெருளை (செய்குத்தம்பி பாவலர்)' }
];

const SECONDARY_ENGLISH_TOPICS = [
  { en: 'Unit 1: His First Flight (Liam O\'Flaherty) & Life Poem (Henry Van Dyke)', ta: 'தன்னம்பிக்கை & வாழ்க்கை கவிதை', formula: 'Poem Line: "Let me but live my life from year to year, With forward face and unreluctant soul." (Henry Van Dyke)' },
  { en: 'Unit 2: The Night the Ghost Got In (James Thurber) & The Grumble Family Poem', ta: 'நகைச்சுவை உரைநடை & நற்பண்புகள்', formula: 'Grammar: Direct to Indirect Speech — Reporting verb in past tense triggers shift of tenses in reported speech.' },
  { en: 'Unit 3: Empowered Women Navigating The World (INSV Tarini All-Women Crew)', ta: 'பெண்களின் வீரம் & சாதனை பயணம்', formula: 'Vocabulary: Phrasal Verbs (give up, take off, look after) & Prepositional Phrases.' },
  { en: 'Unit 4: The Attic (Satyajit Ray) & The Ant and the Cricket Poem', ta: 'பழைய நினைவுகள் & உழைப்பின் மேன்மை', formula: 'Grammar: Simple, Compound, Complex Sentences Transformation (Though/Although -> But/Yet).' },
  { en: 'Unit 5: Tech Bloomers (Assistive Technology for Specially-Abled) & Secret of the Machines', ta: 'தொழில்நுட்பம் & மனித வாழ்வு', formula: 'Poem: "We can pull and haul and push and lift and drive" (Rudyard Kipling - Personification).' }
];

const SECONDARY_MATHS_TOPICS = [
  { en: 'Relations & Functions: Cartesian Product, Types of Functions (One-to-One, Onto, Bijective)', ta: 'உறவுகளும் சார்புகளும்', formula: 'Composition of Functions: (f ∘ g)(x) = f(g(x)). Note: In general, f ∘ g ≠ g ∘ f, but associative (f ∘ g) ∘ h = f ∘ (g ∘ h).' },
  { en: 'Numbers & Sequences: Euclid\'s Division Lemma, Arithmetic (AP) & Geometric (GP) Progressions', ta: 'எண்களும் தொடர்வரிசைகளும்', formula: 'AP nth term: t_n = a + (n-1)d; Sum: S_n = n/2[2a + (n-1)d]. GP nth term: t_n = a·r^(n-1); Sum: S_n = a(r^n - 1)/(r - 1).' },
  { en: 'Algebra: Quadratic Equations by Formula Method (x = [-b ± √(b^2 - 4ac)] / 2a) & Matrices', ta: 'இயற்கணிதம்: இருபடிச் சமன்பாடுகள் & அணிகள்', formula: 'Discriminant Δ = b^2 - 4ac. If Δ > 0: Real & Unequal; Δ = 0: Real & Equal; Δ < 0: No Real Roots.' },
  { en: 'Coordinate Geometry & Trigonometry: Slope of Line (m = -a/b) & Trigonometric Identities', ta: 'ஆயத்தொலை வடிவியல் & முக்கோணவியல்', formula: 'sin^2 θ + cos^2 θ = 1; 1 + tan^2 θ = sec^2 θ; 1 + cot^2 θ = cosec^2 θ. Area of Triangle = 1/2 |x1(y2-y3) + x2(y3-y1) + x3(y1-y2)|.' },
  { en: 'Mensuration: Surface Area & Volume of Cylinder, Cone, Sphere, Hemisphere & Frustum', ta: 'அளவியல்: உருளை, கூம்பு, கோளத்தின் கனஅளவு', formula: 'Volume of Cylinder = πr^2h; Volume of Cone = 1/3 πr^2h; Volume of Sphere = 4/3 πr^3; Total Surface Area of Cone = πr(l + r).' }
];

const SECONDARY_SCIENCE_TOPICS = [
  { en: 'Physics: Newton\'s Laws of Motion, Momentum (p = mv) & Universal Law of Gravitation', ta: 'இயற்பியல்: இயக்க விதிகள் & ஈர்ப்பியல்', formula: 'Newton\'s Second Law: F = dp/dt = ma. Gravitational Force: F = G(m1·m2)/r^2 (G = 6.674 × 10^-11 N·m^2/kg^2).' },
  { en: 'Physics: Optics — Refraction, Snell\'s Law (sin i / sin r = μ2/μ1) & Lens Formula (1/v - 1/u = 1/f)', ta: 'இயற்பியல்: ஒளியியல் & லென்ஸ் சமன்பாடு', formula: 'Lens Formula: 1/f = 1/v - 1/u; Magnification m = v/u = h\'/h; Power of Lens P = 1/f (in meters, Unit: Dioptre D).' },
  { en: 'Chemistry: Types of Chemical Reactions (Combination, Decomposition, Redox, Precipitation)', ta: 'வேதியியல்: வேதிவினைகளின் வகைகள்', formula: 'Avogadro\'s Hypothesis: Equal volumes of all gases under same T and P contain equal number of molecules (6.023 × 10^23).' },
  { en: 'Chemistry: Carbon and Its Compounds, Homologous Series, Functional Groups & IUPAC Nomenclature', ta: 'வேதியியல்: கார்பனும் அதன் சேர்மங்களும்', formula: 'Alkanes: C_n H_{2n+2}; Alkenes: C_n H_{2n}; Alkynes: C_n H_{2n-2}. Functional groups: -OH (Alcohol), -CHO (Aldehyde), -COOH (Carboxylic Acid).' },
  { en: 'Biology: Plant Physiology (Photosynthesis, Transpiration) & Human Nervous System (Neuron Anatomy)', ta: 'உயிரியல்: தாவர மற்றும் மனித உடலியல்', formula: 'Photosynthesis: 6CO2 + 12H2O --(Sunlight/Chlorophyll)--> C6H12O6 + 6H2O + 6O2. Action potential in neurons passes across synapse via Neurotransmitters.' }
];

const SECONDARY_SOCIAL_TOPICS = [
  { en: 'History: Outbreak of World War I & II, League of Nations & United Nations Organization (UNO)', ta: 'வரலாறு: உலகப் போர்கள் & ஐக்கிய நாடுகள் சபை', formula: 'Treaty of Versailles (1919) ended WWI. United Nations Charter was signed on 26 June 1945 at San Francisco.' },
  { en: 'History: Early Uprisings against British Rule in Tamil Nadu (Veerapandiya Kattabomman, Velu Nachiyar)', ta: 'வரலாறு: பாளையக்காரர் புரட்சி & வேலு நாச்சியார்', formula: 'Velu Nachiyar (1730-1796) was the first Indian Queen to fight against the British colonial power using suicide bomber Kuyili.' },
  { en: 'Geography: Physical Geography of Tamil Nadu (Western/Eastern Ghats, Cauvery River Basin & Climate)', ta: 'புவியியல்: தமிழ்நாட்டின் இயற்கை அமைப்புகள்', formula: 'Doddabetta (2,637 m) is the highest peak in the Nilgiri Hills; Cauvery river originates at Talakaveri in Coorg, Karnataka.' },
  { en: 'Civics: Indian Constitution, President of India Powers (Articles 52 to 62) & Supreme Court Jurisdiction', ta: 'குடிமையியல்: இந்திய குடியரசுத் தலைவர் & உச்சநீதிமன்றம்', formula: 'Article 32 is the "Heart and Soul of the Constitution" (Dr. B.R. Ambedkar) granting Constitutional Remedies (Habeas Corpus, Mandamus, Quo-Warranto).' },
  { en: 'Economics: Gross Domestic Product (GDP), Per Capita Income, Human Development Index (HDI) & Taxation', ta: 'பொருளாதாரம்: மொத்த உள்நாட்டு உற்பத்தி & வரி விதிப்பு', formula: 'GDP = Consumption (C) + Investment (I) + Government Spending (G) + (Exports [X] - Imports [M]). Direct Taxes: Income Tax; Indirect Taxes: GST.' }
];

export function generateSecondary200DaysPlan(): SecondaryDayPlan[] {
  const plan: SecondaryDayPlan[] = [];

  for (let day = 1; day <= 200; day++) {
    const quarter = (day <= 50 ? 1 : day <= 100 ? 2 : day <= 150 ? 3 : 4) as (1 | 2 | 3 | 4);
    const quarterLabel = `Quarter ${quarter} • ${
      quarter === 1
        ? 'Term 1 Complete Chapter Derivations & Axioms'
        : quarter === 2
        ? 'Term 2 Problem Solving & Laboratory Physics/Chem'
        : quarter === 3
        ? 'Term 3 Full Syllabus Integration & High-Yield PYQs'
        : 'SSLC Board Exam 100/100 Blueprint & Full CBT Mocks'
    }`;

    const gradeLevel = day <= 80 ? 'Class 9' : 'Class 10 SSLC';

    const tItem = SECONDARY_TAMIL_TOPICS[(day - 1) % SECONDARY_TAMIL_TOPICS.length];
    const eItem = SECONDARY_ENGLISH_TOPICS[(day - 1) % SECONDARY_ENGLISH_TOPICS.length];
    const mItem = SECONDARY_MATHS_TOPICS[(day - 1) % SECONDARY_MATHS_TOPICS.length];
    const sItem = SECONDARY_SCIENCE_TOPICS[(day - 1) % SECONDARY_SCIENCE_TOPICS.length];
    const socItem = SECONDARY_SOCIAL_TOPICS[(day - 1) % SECONDARY_SOCIAL_TOPICS.length];

    const theme = `Day ${day}: 10th SSLC Mastery — Tamil (${tItem.en.split(':')[0]}), English (${eItem.en.split(':')[0]}), Maths (${mItem.en.split(':')[0]}) & Science (${sItem.en.split(':')[0]})`;

    const tasks: SecondaryTask[] = [
      {
        taskId: `sec_day_${day}_task_1`,
        taskNumber: 1,
        subject: '10th Standard Tamil (10-ஆம் வகுப்பு பொதுத்தமிழ்)',
        subjectTa: '10-ஆம் வகுப்பு தமிழ்',
        title: `📜 10th தமிழ்: ${tItem.en}`,
        titleTa: `📜 10th தமிழ்: ${tItem.ta}`,
        durationMinutes: 25,
        durationLabel: '25 Mins',
        youtubeId: 'dQw4w9WgXcQ',
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        keyFormulaOrLaw: tItem.formula,
        keyPoints: ['செய்யுள் நயம் பாராட்டுதல் (மோனை, எதுகை, இயைபு, அணி நயம்)', 'உரைநடை மற்றும் துணைப்பாட நெடுவினா விடை அமைப்பு', 'இலக்கண விதிகளுக்கு 2 சான்றுகள் தந்து விளக்குதல்'],
        pyqFrequency: 'Very High',
        boardExamTakeaway: '5-மதிப்பெண் நெடுவினாவில் தலைப்பு, முன்னுரை, உட்தலைப்புகள், முடிவுரை அமைத்து எழுதினால் முழு மதிப்பெண் பெறலாம்.'
      },
      {
        taskId: `sec_day_${day}_task_2`,
        taskNumber: 2,
        subject: '10th Standard English (Language & Literature)',
        subjectTa: '10-ஆம் வகுப்பு ஆங்கிலம்',
        title: `📚 10th English: ${eItem.en}`,
        titleTa: `📚 10th ஆங்கிலம்: ${eItem.ta}`,
        durationMinutes: 25,
        durationLabel: '25 Mins',
        youtubeId: 'BELlZKpi1Zs',
        youtubeUrl: 'https://www.youtube.com/watch?v=BELlZKpi1Zs',
        keyFormulaOrLaw: eItem.formula,
        keyPoints: ['Poem appreciation & figure of speech identification (Metaphor, Simile, Personification)', 'Grammar transformations: Reported speech, Degrees of comparison, Voice', 'Error spotting rules and road map writing techniques'],
        pyqFrequency: 'High',
        boardExamTakeaway: 'Mastering grammar transformation formulas guarantees 15/15 marks in Section B.'
      },
      {
        taskId: `sec_day_${day}_task_3`,
        taskNumber: 3,
        subject: '10th Standard Mathematics (கணிதம்)',
        subjectTa: '10-ஆம் வகுப்பு கணிதம்',
        title: `📐 10th Maths: ${mItem.en}`,
        titleTa: `📐 10th கணிதம்: ${mItem.ta}`,
        durationMinutes: 28,
        durationLabel: '28 Mins',
        youtubeId: 'ea5-SIe5l7M',
        youtubeUrl: 'https://www.youtube.com/watch?v=ea5-SIe5l7M',
        keyFormulaOrLaw: mItem.formula,
        keyPoints: ['Write given values, required formula and state all algebraic steps', 'Substitute boundary values to eliminate arithmetic errors', 'Box the final answer along with correct SI units (sq.cm, cu.m)'],
        pyqFrequency: 'Very High',
        boardExamTakeaway: 'Compulsory Question #28 (2-Marks) and #42 (5-Marks) frequently feature Coordinate Geometry and Trigonometric Proofs.'
      },
      {
        taskId: `sec_day_${day}_task_4`,
        taskNumber: 4,
        subject: '10th Standard Science (அறிவியல்)',
        subjectTa: '10-ஆம் வகுப்பு அறிவியல்',
        title: `🔬 10th Science: ${sItem.en}`,
        titleTa: `🔬 10th அறிவியல்: ${sItem.ta}`,
        durationMinutes: 25,
        durationLabel: '25 Mins',
        youtubeId: 'qBgX7GL4iGs',
        youtubeUrl: 'https://www.youtube.com/watch?v=qBgX7GL4iGs',
        keyFormulaOrLaw: sItem.formula,
        keyPoints: ['Memorize exact definitions, laws, SI units and chemical equations', 'Balance chemical reactions with state symbols (s, l, g, aq)', 'Draw neat biology anatomical diagrams with sharp pencil lines'],
        pyqFrequency: 'Very High',
        boardExamTakeaway: 'Newton\'s Second Law Derivation (F = ma) and Snell\'s Law Refraction numericals appear in 90% of board question papers.'
      },
      {
        taskId: `sec_day_${day}_task_5`,
        taskNumber: 5,
        subject: '10th Standard Social Science (சமூக அறிவியல்)',
        subjectTa: '10-ஆம் வகுப்பு சமூக அறிவியல்',
        title: `🏛️ 10th Social Science: ${socItem.en}`,
        titleTa: `🏛️ 10th சமூக அறிவியல்: ${socItem.ta}`,
        durationMinutes: 22,
        durationLabel: '22 Mins',
        youtubeId: 'Mv_4p9_kP_k',
        youtubeUrl: 'https://www.youtube.com/watch?v=Mv_4p9_kP_k',
        keyFormulaOrLaw: socItem.formula,
        keyPoints: ['Timeline charting for Indian National Movement (1900 to 1947)', 'Mark geographical locations on India and Tamil Nadu maps', 'Draft clear 5-point answers for Civics and Economics questions'],
        pyqFrequency: 'High',
        boardExamTakeaway: 'Map Question #44 (8-Marks) is a 100% scoring booster when practicing standard coastal ports, wildlife sanctuaries, and mountain passes.'
      }
    ];

    plan.push({
      dayNumber: day,
      gradeLevel,
      quarter,
      quarterLabel,
      theme,
      totalTasks: tasks.length,
      totalMinutes: 125,
      tasks
    });
  }

  return plan;
}

let CACHED_SECONDARY_PLAN: SecondaryDayPlan[] | null = null;

export function getSecondaryDayPlan(dayNumber: number): SecondaryDayPlan {
  if (!CACHED_SECONDARY_PLAN) {
    CACHED_SECONDARY_PLAN = generateSecondary200DaysPlan();
  }
  const safeDay = Math.max(1, Math.min(200, dayNumber));
  return CACHED_SECONDARY_PLAN[safeDay - 1];
}
