/**
 * Entrance Exams (NEET UG / JEE Main) & Competitive Exams (TNPSC / UPSC / Banking / SSC / Police) 365-Day Mastery Plan
 * Standard: NTA NEET/JEE Syllabus 2026 & TNPSC/UPSC Commission Standards
 * Structure: 365 Days × 5 Comprehensive Tasks (30 Mins each = 150 mins/day)
 *   Task 1: 🧬 Domain Major 1 (Biology / Higher Maths / TNPSC General Tamil / UPSC History)
 *   Task 2: ⚡ Domain Major 2 (Physics / Quantitative Aptitude / UPSC Polity & Governance)
 *   Task 3: 🧪 Domain Major 3 (Chemistry / Reasoning Ability / UPSC Economy & Geography)
 *   Task 4: 📝 45-Second Shortcut Drills, Governing Formulas & Memory Mnemonics
 *   Task 5: ⏱️ 10-Q High-Yield CBT Mock Exam & PYQ Trap Elimination
 */

export interface ExamTask {
  taskId: string;
  taskNumber: number;
  subject: string;
  title: string;
  durationMinutes: number;
  durationLabel: string;
  youtubeId: string;
  youtubeUrl: string;
  keyAxiomOrFormula: string;
  pyqAnalysis: string;
  shortcutEliminationTrick: string;
}

export interface ExamDayPlan {
  dayNumber: number;
  category: 'NEET' | 'JEE' | 'TNPSC' | 'UPSC' | 'Banking_SSC' | 'Police';
  quarter: 1 | 2 | 3 | 4;
  quarterLabel: string;
  theme: string;
  totalTasks: number;
  totalMinutes: number;
  tasks: ExamTask[];
}

const TNPSC_SYLLABUS_ROTATION = [
  { s1: 'பொதுத்தமிழ்: பகுதி (அ) இலக்கணம் — பொருத்துதல், வேர்ச்சொல், சந்திப்பிழை & அணி இலக்கணம்', s2: 'Unit 8: தமிழ்நாட்டின் வரலாறு, மரபு, பண்பாடு & திருக்குறள் அறநெறி', s3: 'Unit 9: தமிழகத்தில் வளர்ச்சி நிர்வாகம் & சமூக நீதி இயக்கங்கள்', s4: 'Aptitude: சுருக்குதல், மீ.பொ.வ (HCF), மீ.சி.ம (LCM) & சதவீதம்', formula: 'திருக்குறள்: ஒழுக்கம் விழுப்பம் தரலான் ஒழுக்கம் உயிரினும் ஓம்பப் படும்.' },
  { s1: 'பொதுத்தமிழ்: பகுதி (ஆ) இலக்கியம் — எட்டுத்தொகை, பத்துப்பாட்டு, ஐம்பெருங்காப்பியங்கள்', s2: 'Unit 4: இந்தியாவின் வரலாறும் பண்பாடும் — சிந்து சமவெளி முதல் முகலாயர் வரை', s3: 'Unit 5: இந்திய ஆட்சியியல் (Polity) — அரசியலமைப்பு சாசனம், அடிப்படை உரிமைகள் & பாராளுமன்றம்', s4: 'Aptitude: தனிவட்டி (SI = PNR/100) & கூட்டுவட்டி (CI = P(1+R/100)^N - P)', formula: 'Article 32: Constitutional Remedies (5 Types of Writs); Article 324: Election Commission.' },
  { s1: 'பொதுத்தமிழ்: பகுதி (இ) தமிழ் அறிஞர்களும் தமிழ்த் தொண்டும் — பாரதியார், பாரதிதாசன், தந்தை பெரியார்', s2: 'Unit 6: இந்தியப் பொருளாதாரம் — திட்டக்குழு, நிதி ஆயோக், GST & RBI நிதிக் கொள்கை', s3: 'Unit 7: இந்திய தேசிய இயக்கம் (INM) — 1857 பெரும்புரட்சி, காந்திய சகாப்தம் & தமிழகத்தின் பங்கு', s4: 'Aptitude: காலமும் வேலையும் (Time & Work) & குழாய்கள் கணக்குகள்', formula: 'Efficiency Formula: If A does work in x days and B in y days, together = xy / (x + y) days.' }
];

const NEET_JEE_SYLLABUS_ROTATION = [
  { s1: 'NEET Biology: Human Physiology (Neural Control & Chemical Coordination) / JEE Maths: Calculus (Limits & Derivatives)', s2: 'Physics: Mechanics — Laws of Motion, Work Energy Power & System of Particles', s3: 'Chemistry: Chemical Bonding, Molecular Orbital Theory (MOT) & Thermodynamics', s4: 'High-Yield PYQ Analysis: 45-Second Elimination Traps & Dimensional Homogeneity', formula: 'Bond Order = 1/2 [N_b - N_a]; Work-Energy Theorem: W_net = ΔK = 1/2 m(v^2 - u^2).' },
  { s1: 'NEET Biology: Genetics & Molecular Basis of Inheritance / JEE Maths: Coordinate Geometry (Conics, Ellipse, Hyperbola)', s2: 'Physics: Electrodynamics — Gauss\'s Law, Capacitance & Current Electricity (Kirchhoff\'s Rules)', s3: 'Chemistry: Organic Chemistry — Reaction Mechanisms (SN1, SN2, E1, E2) & Aldehydes/Ketones', s4: 'High-Yield PYQ Analysis: Ranker Shortcut Derivations & Error Reduction', formula: 'Gauss Law: ∮ E·dA = q_enclosed / ε_0; SN2 Mechanism is 1-step bimolecular with 100% Walden Inversion.' },
  { s1: 'NEET Biology: Ecology & Biodiversity Conservation / JEE Maths: Vectors & 3D Geometry (Shortest Distance)', s2: 'Physics: Modern Physics — Photoelectric Effect (Einstein Eq: hν = Φ + KE_max) & Nuclear Physics', s3: 'Chemistry: Coordination Compounds (Crystal Field Theory CFT) & d-and-f Block Elements', s4: 'High-Yield PYQ Analysis: Fast Calculation Tricks & Options Substitution Method', formula: 'Einstein Photoelectric: hν = hν_0 + 1/2 mv_max^2; de Broglie wavelength λ = h / p = h / √(2mE).' }
];

export function generateExam200DaysPlan(category: 'TNPSC' | 'NEET' | 'JEE' | 'UPSC' = 'TNPSC'): ExamDayPlan[] {
  const plan: ExamDayPlan[] = [];

  for (let day = 1; day <= 365; day++) {
    const quarter = (day <= 50 ? 1 : day <= 100 ? 2 : day <= 150 ? 3 : 4) as (1 | 2 | 3 | 4);
    const quarterLabel = `Quarter ${quarter} • ${
      quarter === 1
        ? 'Foundational Concepts & Core Theory Mapping'
        : quarter === 2
        ? 'High-Yield PYQs & Problem Solving Tactics'
        : quarter === 3
        ? 'Speed Accuracy Drills & 45-Second Traps'
        : 'Full Mock Test Series & Rank Booster Strategy'
    }`;

    const isMedicalOrEng = category === 'NEET' || category === 'JEE';
    const rot = isMedicalOrEng
      ? NEET_JEE_SYLLABUS_ROTATION[(day - 1) % NEET_JEE_SYLLABUS_ROTATION.length]
      : TNPSC_SYLLABUS_ROTATION[(day - 1) % TNPSC_SYLLABUS_ROTATION.length];

    const theme = `Day ${day}: ${category} Master Drill — ${rot.s1.split(':')[0]} & ${rot.s2.split(':')[0]}`;

    const tasks: ExamTask[] = [
      {
        taskId: `exam_day_${day}_task_1`,
        taskNumber: 1,
        subject: rot.s1.split(':')[0],
        title: `🧬 ${rot.s1}`,
        durationMinutes: 30,
        durationLabel: '30 Mins',
        youtubeId: 'dQw4w9WgXcQ',
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        keyAxiomOrFormula: rot.formula,
        pyqAnalysis: 'Frequently asked across 2019-2024 question papers (Weightage: ~15-20% of paper).',
        shortcutEliminationTrick: 'Eliminate options violating dimensional symmetry or historical chronological sequence.'
      },
      {
        taskId: `exam_day_${day}_task_2`,
        taskNumber: 2,
        subject: rot.s2.split(':')[0],
        title: `⚡ ${rot.s2}`,
        durationMinutes: 30,
        durationLabel: '30 Mins',
        youtubeId: 'BELlZKpi1Zs',
        youtubeUrl: 'https://www.youtube.com/watch?v=BELlZKpi1Zs',
        keyAxiomOrFormula: rot.formula,
        pyqAnalysis: 'Core scoring pillar. Direct numerical and concept application questions guaranteed.',
        shortcutEliminationTrick: 'Check boundary condition extremes (θ = 0°, θ = 90° or t = 0, t = ∞) to instantly pick the correct curve.'
      },
      {
        taskId: `exam_day_${day}_task_3`,
        taskNumber: 3,
        subject: rot.s3.split(':')[0],
        title: `🧪 ${rot.s3}`,
        durationMinutes: 30,
        durationLabel: '30 Mins',
        youtubeId: 'ea5-SIe5l7M',
        youtubeUrl: 'https://www.youtube.com/watch?v=ea5-SIe5l7M',
        keyAxiomOrFormula: rot.formula,
        pyqAnalysis: 'High-concept retention area. NCERT line-by-line statements and Tamil Nadu Samacheer boxes tested directly.',
        shortcutEliminationTrick: 'Look for qualifying words: "Always", "Never", "Only" are false 85% of the time in multi-statement questions.'
      },
      {
        taskId: `exam_day_${day}_task_4`,
        taskNumber: 4,
        subject: 'Aptitude & Shortcut Mastery',
        title: `📐 ${rot.s4}`,
        durationMinutes: 30,
        durationLabel: '30 Mins',
        youtubeId: 'qBgX7GL4iGs',
        youtubeUrl: 'https://www.youtube.com/watch?v=qBgX7GL4iGs',
        keyAxiomOrFormula: rot.formula,
        pyqAnalysis: 'Aptitude guarantees 25/25 in TNPSC and 100+ raw score in CSAT/JEE.',
        shortcutEliminationTrick: 'Use Unit Digit verification and Digital Root Method to solve arithmetic calculations in under 15 seconds.'
      },
      {
        taskId: `exam_day_${day}_task_5`,
        taskNumber: 5,
        subject: '10-Q CBT Mock Drill & PYQ Trap Review',
        title: `📝 Day ${day} Official 10-Q CBT Mock Exam Drill`,
        durationMinutes: 30,
        durationLabel: '30 Mins',
        youtubeId: 'Mv_4p9_kP_k',
        youtubeUrl: 'https://www.youtube.com/watch?v=Mv_4p9_kP_k',
        keyAxiomOrFormula: rot.formula,
        pyqAnalysis: 'Timed CBT practice under real exam pressure conditions (+4, -1 marking scheme).',
        shortcutEliminationTrick: 'If unsure between 2 filtered choices, re-read the question stem to identify the exact negative keyword ("NOT true", "EXCEPT").'
      }
    ];

    plan.push({
      dayNumber: day,
      category,
      quarter,
      quarterLabel,
      theme,
      totalTasks: tasks.length,
      totalMinutes: 150,
      tasks
    });
  }

  return plan;
}

let CACHED_TNPSC_PLAN: ExamDayPlan[] | null = null;
let CACHED_NEET_PLAN: ExamDayPlan[] | null = null;

export function getExamDayPlan(category: 'TNPSC' | 'NEET' | 'JEE' | 'UPSC', dayNumber: number): ExamDayPlan {
  if (category === 'NEET' || category === 'JEE') {
    if (!CACHED_NEET_PLAN) CACHED_NEET_PLAN = generateExam200DaysPlan('NEET');
    const safeDay = Math.max(1, Math.min(200, dayNumber));
    return CACHED_NEET_PLAN[safeDay - 1];
  }
  if (!CACHED_TNPSC_PLAN) CACHED_TNPSC_PLAN = generateExam200DaysPlan('TNPSC');
  const safeDay = Math.max(1, Math.min(200, dayNumber));
  return CACHED_TNPSC_PLAN[safeDay - 1];
}
