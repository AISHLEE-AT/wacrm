/**
 * Deterministic QBank Taxonomy & Advanced Category-Wise Search Engine
 * Supports:
 *   1. Token-Based Deterministic UID: [SUB]-[DOM]-[TOP]-[SUBT]-[MIC]-[DIFF]-[SEQ]
 *   2. Sequential Range Search: "100 to 200", "100-200", "50..100"
 *   3. Fill-in-the-Blank & Objective Question Types
 *   4. Category-Wise Search (Exam Category: TNPSC, NEET/JEE, SSC/Bank, School K-12)
 *   5. Format-Wise Search (Fill in Blanks, MCQ, Assertion/Reason, Numerical, Match, PYQ, Theory)
 *   6. Deep Multi-Word Search & Keyword Highlighting
 *   7. 2 Lakh+ Live Cloud Mapping (47,716 Topics in Supabase kindle_content_cache)
 */

import { aishleeSupabase } from '../services/aishleeSupabase';

export type QuestionFormat =
  | 'single_choice'
  | 'single_choice'
  | 'assertion_reason'
  | 'numerical'
  | 'match_the_following'
  | 'pyq'
  | 'theory';

export type ExamCategory =
  | 'ALL'
  | 'TNPSC'
  | 'NEET_JEE'
  | 'SSC_BANK'
  | 'SCHOOL_K12';

export interface QuestionTaxonomy {
  subject: string;
  subject_code: string;
  domain: string;
  domain_code: string;
  topic: string;
  topic_code: string;
  subtopic: string;
  subtopic_code: string;
  microtopic: string;
  microtopic_code: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  exam_category?: ExamCategory;
  question_format?: QuestionFormat;
}

export interface StructuredMCQ {
  question_uid: string;
  taxonomy: QuestionTaxonomy;
  question_format?: QuestionFormat;
  exam_category?: ExamCategory;
  question_text: string;
  question_text_ta?: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  options_ta?: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_option: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  explanation_ta?: string;
  formula_or_law?: string;
  blank_answer?: string;
}

export interface ParsedUID {
  valid: boolean;
  rawUID: string;
  subjectCode?: string;
  domainCode?: string;
  topicCode?: string;
  subtopicCode?: string;
  microtopicCode?: string;
  difficultyCode?: 'E' | 'M' | 'H';
  sequenceNumber?: number;
  sequenceStr?: string;
  readableBreadcrumb?: string;
}

export interface SearchRangeOptions {
  rangeStart?: number;
  rangeEnd?: number;
  format?: QuestionFormat | 'ALL';
  examCategory?: ExamCategory;
  searchType?: 'ALL' | 'NUMBER_RANGE' | 'UID' | 'WORD' | 'FORMAT' | 'EXAM_CATEGORY';
}

/**
 * Standard Exam Category Config
 */
export const EXAM_CATEGORIES: { id: ExamCategory; label: string; icon: string; desc: string }[] = [
  { id: 'ALL', label: 'All Exams', icon: '🌟', desc: 'All Categories Combined' },
  { id: 'TNPSC', label: '🏛️ TNPSC & State', icon: '🏛️', desc: 'Group 1, 2, 4, VAO, Police & TRB' },
  { id: 'NEET_JEE', label: '🎯 NEET & JEE', icon: '🎯', desc: 'Medical & Engineering Entrance' },
  { id: 'SSC_BANK', label: '🏢 SSC & Banking', icon: '🏢', desc: 'CGL, CHSL, IBPS, RRB & UPSC' },
  { id: 'SCHOOL_K12', label: '🏫 School K-12', icon: '🏫', desc: 'Samacheer Kalvi & CBSE Classes 6-12' },
];

/**
 * Standard Question Format Config
 */
export const QUESTION_FORMATS: { id: QuestionFormat | 'ALL'; label: string; icon: string; badgeColor: string }[] = [
  { id: 'ALL', label: 'All Types', icon: '📑', badgeColor: '#00D084' },
  { id: 'single_choice', label: 'Single MCQ', icon: '🔘', badgeColor: '#38BDF8' },
  { id: 'assertion_reason', label: 'Assertion & Reason', icon: '⚖️', badgeColor: '#EAB308' },
  { id: 'numerical', label: 'Numerical / NAT', icon: '🧮', badgeColor: '#EC4899' },
  { id: 'match_the_following', label: 'Matrix Match', icon: '🔀', badgeColor: '#8B5CF6' },
  { id: 'pyq', label: 'Solved PYQ', icon: '🏛️', badgeColor: '#10B981' },
  { id: 'theory', label: 'Core Theory', icon: '📖', badgeColor: '#06B6D4' },
];

/**
 * Standard Subject Mapping
 */
export const SUBJECT_TAXONOMY_MAP: Record<string, { name: string; icon: string; domains: Record<string, string> }> = {
  PHY: {
    name: 'Physics',
    icon: '⚡',
    domains: {
      MEC: 'Mechanics',
      ELE: 'Electrodynamics & Current',
      OPT: 'Optics & Wave Optics',
      THM: 'Thermodynamics & Kinetic Theory',
      MOD: 'Modern Physics & Nuclear',
    },
  },
  CHE: {
    name: 'Chemistry',
    icon: '🧪',
    domains: {
      ORG: 'Organic Chemistry',
      INO: 'Inorganic Chemistry',
      PHY: 'Physical Chemistry',
      ANA: 'Analytical & Environmental',
    },
  },
  BIO: {
    name: 'Biology',
    icon: '🧬',
    domains: {
      BOT: 'Botany & Plant Physiology',
      ZOO: 'Zoology & Human Physiology',
      GEN: 'Genetics & Evolution',
      ECO: 'Ecology & Environment',
    },
  },
  MAT: {
    name: 'Mathematics',
    icon: '📐',
    domains: {
      ALG: 'Algebra & Matrices',
      CAL: 'Calculus & Differential Eqns',
      GEO: 'Geometry & Vectors',
      TRI: 'Trigonometry',
      STA: 'Statistics & Probability',
    },
  },
  CS: {
    name: 'Computer Science',
    icon: '💻',
    domains: {
      DSA: 'Data Structures & Algorithms',
      SYS: 'Operating Systems & Architecture',
      NET: 'Networks & Security',
      DBMS: 'Database Systems & SQL',
      AI: 'AI & Machine Learning',
    },
  },
  HIS: {
    name: 'History & Culture',
    icon: '🏛️',
    domains: {
      ANC: 'Ancient Indian History',
      MED: 'Medieval India & Sultanates',
      MOD: 'Modern India & Freedom Struggle',
      TN: 'Tamil Nadu History & Sangam Age',
    },
  },
  POL: {
    name: 'Indian Polity & Governance',
    icon: '⚖️',
    domains: {
      CON: 'Indian Constitution & Articles',
      GOV: 'Union & State Governance',
      JUD: 'Judiciary & Rights',
      PAN: 'Panchayat Raj & Local Bodies',
    },
  },
  GEO: {
    name: 'Geography',
    icon: '🌍',
    domains: {
      IND: 'Indian Geography & Rivers',
      PHY: 'Physical Geography & Climatology',
      TN: 'Tamil Nadu Geography & Resources',
    },
  },
  APT: {
    name: 'Aptitude & Mental Ability',
    icon: '🧠',
    domains: {
      NUM: 'Number System & Arithmetic',
      LOG: 'Logical Reasoning',
      DAT: 'Data Interpretation',
    },
  },
};

/**
 * Generate standard UID: [SUB]-[DOM]-[TOP]-[SUBT]-[MIC]-[DIFF]-[SEQ]
 */
export function generateQuestionUID(
  tax: QuestionTaxonomy,
  sequenceNum: number
): string {
  const sub = (tax.subject_code || 'GEN').toUpperCase().trim();
  const dom = (tax.domain_code || 'GEN').toUpperCase().trim();
  const top = String(tax.topic_code || '01').padStart(2, '0');
  const subt = String(tax.subtopic_code || '01').padStart(2, '0');
  const mic = (tax.microtopic_code || 'M1').toUpperCase().trim();
  const diff = tax.difficulty === 'Easy' ? 'E' : tax.difficulty === 'Hard' ? 'H' : 'M';
  const seq = String(sequenceNum).padStart(6, '0');

  return `${sub}-${dom}-${top}-${subt}-${mic}-${diff}-${seq}`;
}

/**
 * Parse any Question UID string into its 7 atomic components
 */
export function parseQuestionUID(uid: string): ParsedUID {
  if (!uid || typeof uid !== 'string') {
    return { valid: false, rawUID: uid || '' };
  }

  const clean = uid.trim().toUpperCase();
  const parts = clean.split('-');

  if (parts.length === 7) {
    const [sub, dom, top, subt, mic, diff, seq] = parts;
    const diffLetter = (diff === 'E' || diff === 'H' ? diff : 'M') as 'E' | 'M' | 'H';
    const seqNumber = parseInt(seq, 10) || 0;

    const subName = SUBJECT_TAXONOMY_MAP[sub]?.name || sub;
    const domName = SUBJECT_TAXONOMY_MAP[sub]?.domains?.[dom] || dom;
    const diffLabel = diffLetter === 'E' ? 'Easy' : diffLetter === 'H' ? 'Hard' : 'Medium';

    return {
      valid: true,
      rawUID: clean,
      subjectCode: sub,
      domainCode: dom,
      topicCode: top,
      subtopicCode: subt,
      microtopicCode: mic,
      difficultyCode: diffLetter,
      sequenceNumber: seqNumber,
      sequenceStr: seq,
      readableBreadcrumb: `${subName} > ${domName} > Topic ${top}.${subt} [${mic}] (${diffLabel}) #${seq}`,
    };
  }

  return {
    valid: false,
    rawUID: clean,
  };
}

/**
 * Parses numeric range expression: e.g. "100 to 200", "100-200", "50..100", "#10 to #50"
 */
export function parseRangeExpression(query: string): { isRange: boolean; start: number; end: number; remainingQuery: string } {
  if (!query || typeof query !== 'string') {
    return { isRange: false, start: 0, end: 0, remainingQuery: '' };
  }

  const clean = query.trim();

  const toMatch = clean.match(/^#?(\d+)\s+(?:to|TO|through|THROUGH|until)\s+#?(\d+)(?:\s+(.*))?$/i);
  if (toMatch) {
    const start = parseInt(toMatch[1], 10);
    const end = parseInt(toMatch[2], 10);
    return { isRange: true, start: Math.min(start, end), end: Math.max(start, end), remainingQuery: (toMatch[3] || '').trim() };
  }

  const dashMatch = clean.match(/^#?(\d+)\s*(?:-|\.\.)\s*#?(\d+)(?:\s+(.*))?$/i);
  if (dashMatch) {
    const start = parseInt(dashMatch[1], 10);
    const end = parseInt(dashMatch[2], 10);
    return { isRange: true, start: Math.min(start, end), end: Math.max(start, end), remainingQuery: (dashMatch[3] || '').trim() };
  }

  return { isRange: false, start: 0, end: 0, remainingQuery: clean };
}

/**
 * Master Seed Question Bank with Ground-Truth Anchors (#0001 to #0250)
 */
export const MASTER_QBANK_STORE: StructuredMCQ[] = [
  {
    "question_uid": "PHY-MEC-01-01-M1-M-0001",
    "taxonomy": {
      "subject": "Physics",
      "subject_code": "PHY",
      "domain": "Mechanics",
      "domain_code": "MEC",
      "topic": "Kinematics & Principles",
      "topic_code": "01",
      "subtopic": "Motion in 2D & Projectiles",
      "subtopic_code": "01",
      "microtopic": "Kinematics Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Medium",
      "exam_category": "NEET_JEE",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "NEET_JEE",
    "question_text": "[#0001] In two-dimensional projectile motion without air resistance, the horizontal velocity component remains _______ throughout the flight.",
    "question_text_ta": "[#0001] காற்று உராய்வு இல்லாத இருபரிமாண எறிபொருள் இயக்கத்தில் கிடைமட்ட திசைவேகக் கூறு இயக்கம் முழுவதும் _______ ஆக இருக்கும்.",
    "options": {
      "A": "Constant (மாறிலி)",
      "B": "Zero at highest point (உச்சியில் சுழி)",
      "C": "Linearly increasing (நேர்கோட்டில் அதிகரிக்கும்)",
      "D": "Exponentially decaying (அதிவேகமாக குறையும்)"
    },
    "correct_option": "A",
    "explanation": "[Question #0001] Since gravity acts solely vertically downward (a_y = -g), horizontal acceleration a_x = 0, keeping horizontal velocity v_x = u cos θ strictly constant.",
    "explanation_ta": "[கேள்வி எண் #0001] புவியீர்ப்பு விசை செங்குத்தாக மட்டுமே செயல்படுவதால் கிடைமட்ட முடுக்கம் a_x = 0, எனவே v_x மாறிலியாக இருக்கும்.",
    "formula_or_law": "v_x = u \\cos\\theta = \\text{constant}"
  },
  {
    "question_uid": "PHY-ELE-01-01-M2-E-0002",
    "taxonomy": {
      "subject": "Physics",
      "subject_code": "PHY",
      "domain": "Electrodynamics",
      "domain_code": "ELE",
      "topic": "Ohm Law & Principles",
      "topic_code": "01",
      "subtopic": "Ohm Law & Kirchhoff Rules",
      "subtopic_code": "01",
      "microtopic": "Ohm Law Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Easy",
      "exam_category": "NEET_JEE",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "NEET_JEE",
    "question_text": "[#0002] According to microscopic Ohm's law, the electrical conductivity σ is given by the formula _______ .",
    "question_text_ta": "[#0002] நுண்ணோக்கி ஓம் விதியின்படி ஒரு கடத்தியின் மின்கடத்துத்திறன் σ சமன்பாடு _______ ஆகும்.",
    "options": {
      "A": "σ = (n e² τ) / m",
      "B": "σ = (m e² τ) / n",
      "C": "σ = (n e τ) / m²",
      "D": "σ = (n² e τ) / m"
    },
    "correct_option": "A",
    "explanation": "[Question #0002] Conductivity σ is derived from J = n e v_d where v_d = (e E τ) / m, leading to J = (n e² τ / m) E = σ E.",
    "explanation_ta": "[கேள்வி எண் #0002] மின்கடத்துத்திறன் σ = (n e² τ) / m ஆகும்.",
    "formula_or_law": "\\sigma = \\frac{n e^2 \\tau}{m}"
  },
  {
    "question_uid": "PHY-OPT-01-01-M3-H-0003",
    "taxonomy": {
      "subject": "Physics",
      "subject_code": "PHY",
      "domain": "Optics",
      "domain_code": "OPT",
      "topic": "Chemical Kinetics & Principles",
      "topic_code": "01",
      "subtopic": "Interference & Diffraction",
      "subtopic_code": "01",
      "microtopic": "Chemical Kinetics Core Rule",
      "microtopic_code": "M3",
      "difficulty": "Hard",
      "exam_category": "SCHOOL_K12",
      "question_format": "assertion_reason"
    },
    "question_format": "assertion_reason",
    "exam_category": "SCHOOL_K12",
    "question_text": "[#0003] For a first-order chemical reaction, the half-life period t_1/2 is _______ of initial reactant concentration.",
    "question_text_ta": "[#0003] ஒரு முதல் வகை வேதிவினைக்கு அரைவாழ்வு காலம் தொடக்கச் செறிவை _______ .",
    "options": {
      "A": "Independent (சார்ந்திருக்காது - t_1/2 = 0.693 / k)",
      "B": "Directly proportional (நேர்விகிதத்தில் சார்ந்தது)",
      "C": "Inversely proportional (எதிர்விகிதத்தில் சார்ந்தது)",
      "D": "Exponentially dependent (அதிவேகமாக சார்ந்தது)"
    },
    "correct_option": "A",
    "explanation": "[Question #0003] For first order: k = (2.303 / t) log([A]_0 / [A]). At t = t_1/2, [A] = [A]_0 / 2, giving t_1/2 = ln(2) / k = 0.693 / k.",
    "explanation_ta": "[கேள்வி எண் #0003] முதல் வகை வினைக்கு அரைவாழ்வு காலம் தொடக்கச் செறிவைச் சார்ந்திருக்காது: t_1/2 = 0.693 / k.",
    "formula_or_law": "t_{1/2} = \\frac{\\ln 2}{k} = \\frac{0.693}{k}"
  },
  {
    "question_uid": "CHE-ORG-01-01-M1-H-0004",
    "taxonomy": {
      "subject": "Chemistry",
      "subject_code": "CHE",
      "domain": "Organic Chemistry",
      "domain_code": "ORG",
      "topic": "Photosynthesis & Principles",
      "topic_code": "01",
      "subtopic": "Electrophilic & Nucleophilic",
      "subtopic_code": "01",
      "microtopic": "Photosynthesis Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Hard",
      "exam_category": "NEET_JEE",
      "question_format": "numerical"
    },
    "question_format": "numerical",
    "exam_category": "NEET_JEE",
    "question_text": "[#0004] During photosynthesis in chloroplasts, photolysis of water occurs at the _______ complex of PS II.",
    "question_text_ta": "[#0004] ஒளிச்சேர்க்கையின் போது நீர் மூலக்கூறு ஒளிச்சிதைவு PS II இன் _______ வளாகத்தில் நடைபெறுகிறது.",
    "options": {
      "A": "Oxygen-Evolving Complex (OEC - ஆக்ஸிஜன் வெளிப்படுத்தும் மையம்)",
      "B": "ATP Synthase CF0-CF1 complex",
      "C": "Photosystem I reaction center P700",
      "D": "Cytochrome b6f complex"
    },
    "correct_option": "A",
    "explanation": "[Question #0004] Water photolysis (2H2O -> 4H+ + 4e- + O2) is catalyzed by the manganese-containing oxygen-evolving complex located on the luminal side of PS II.",
    "explanation_ta": "[கேள்வி எண் #0004] நீர் மூலக்கூறு சிதைவு PS II இன் ஆக்ஸிஜன் வெளிப்படுத்தும் மையத்தால் வினையூக்கப்படுகிறது.",
    "formula_or_law": "2\\text{H}_2\\text{O} \\xrightarrow{h\\nu, \\text{PS II}} 4\\text{H}^+ + 4e^- + \\text{O}_2"
  },
  {
    "question_uid": "CHE-INO-01-01-M2-M-0005",
    "taxonomy": {
      "subject": "Chemistry",
      "subject_code": "CHE",
      "domain": "Inorganic Chemistry",
      "domain_code": "INO",
      "topic": "Matrices & Principles",
      "topic_code": "01",
      "subtopic": "Ligand Field & Isomerism",
      "subtopic_code": "01",
      "microtopic": "Matrices Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "NEET_JEE",
      "question_format": "match_the_following"
    },
    "question_format": "match_the_following",
    "exam_category": "NEET_JEE",
    "question_text": "[#0005] The sum of all eigenvalues of an n x n square matrix A is identically equal to the _______ of matrix A.",
    "question_text_ta": "[#0005] ஒரு சதுர அணி A இன் அனைத்து ஐகன் மதிப்புகளின் கூடுதல் அந்த அணியின் _______ க்குச் சமமாகும்.",
    "options": {
      "A": "Trace (சுவடு - Tr(A))",
      "B": "Determinant (அணிக்கோவை மதிப்பு)",
      "C": "Rank (அணியின் தரம்)",
      "D": "Nullity (வெற்றுமை)"
    },
    "correct_option": "A",
    "explanation": "[Question #0005] The trace of any square matrix equals the sum of its main diagonal elements, which identically equals the algebraic sum of all its eigenvalues.",
    "explanation_ta": "[கேள்வி எண் #0005] ஒரு சதுர அணியின் சுவடு (Trace) அதன் முதன்மை மூலைவிட்ட உறுப்புகளின் கூடுதலுக்கு மற்றும் அனைத்து ஐகன் மதிப்புகளின் கூடுதலுக்குச் சமமாகும்.",
    "formula_or_law": "\\text{Tr}(A) = \\sum_{i=1}^n a_{ii} = \\sum_{i=1}^n \\lambda_i"
  },
  {
    "question_uid": "CHE-PHY-01-01-M3-M-0006",
    "taxonomy": {
      "subject": "Chemistry",
      "subject_code": "CHE",
      "domain": "Physical Chemistry",
      "domain_code": "PHY",
      "topic": "Binary Search Trees & Principles",
      "topic_code": "01",
      "subtopic": "Rate Laws & Arrhenius",
      "subtopic_code": "01",
      "microtopic": "Binary Search Trees Core Rule",
      "microtopic_code": "M3",
      "difficulty": "Medium",
      "exam_category": "SCHOOL_K12",
      "question_format": "pyq"
    },
    "question_format": "pyq",
    "exam_category": "SCHOOL_K12",
    "question_text": "[#0006] In an AVL Tree, the balance factor for every node is strictly constrained to the set _______ .",
    "question_text_ta": "[#0006] AVL மரத்தில் ஒவ்வொரு முனையின் சமநிலை காரணி (Balance Factor) எப்போதும் _______ கணத்திற்குள் இருக்க வேண்டும்.",
    "options": {
      "A": "{-1, 0, +1}",
      "B": "{0, 1, 2}",
      "C": "{-2, 0, +2}",
      "D": "{0, 1}"
    },
    "correct_option": "A",
    "explanation": "[Question #0006] An AVL tree is a self-balancing binary search tree where the height difference between left and right subtrees (Balance Factor = Height(L) - Height(R)) is strictly in {-1, 0, 1}.",
    "explanation_ta": "[கேள்வி எண் #0006] AVL மரத்தில் இடது மற்றும் வலது துணை மரங்களின் உயர வேறுபாடு எப்போதும் -1, 0, அல்லது +1 ஆக மட்டுமே இருக்க வேண்டும்.",
    "formula_or_law": "\\text{BF}(v) = h(\\text{left}(v)) - h(\\text{right}(v)) \\in \\{-1, 0, +1\\}"
  },
  {
    "question_uid": "BIO-BOT-01-01-M1-M-0007",
    "taxonomy": {
      "subject": "Biology",
      "subject_code": "BIO",
      "domain": "Botany",
      "domain_code": "BOT",
      "topic": "Constitution & Principles",
      "topic_code": "01",
      "subtopic": "Photosynthesis C3 & C4",
      "subtopic_code": "01",
      "microtopic": "Constitution Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Medium",
      "exam_category": "NEET_JEE",
      "question_format": "theory"
    },
    "question_format": "theory",
    "exam_category": "NEET_JEE",
    "question_text": "[#0007] Under Article _______ of the Constitution of India, High Courts have the power to issue Writs for Fundamental Rights and other legal rights.",
    "question_text_ta": "[#0007] இந்திய அரசியலமைப்பின் சட்டப்பிரிவு _______ இன் கீழ் உயர்நீதிமன்றங்கள் நீதிப்பேராணைகளை வெளியிடும் அதிகாரம் பெற்றுள்ளன.",
    "options": {
      "A": "Article 226",
      "B": "Article 32",
      "C": "Article 14",
      "D": "Article 368"
    },
    "correct_option": "A",
    "explanation": "[Question #0007] Article 226 empowers High Courts to issue Writs for Fundamental Rights as well as ordinary legal rights, giving it a wider textual scope than Article 32.",
    "explanation_ta": "[கேள்வி எண் #0007] சட்டப்பிரிவு 226 உயர்நீதிமன்றங்களுக்கு அடிப்படை உரிமைகள் மற்றும் பிற சட்ட உரிமைகளுக்காகவும் நீதிப்பேராணைகளை வழங்கும் அதிகாரத்தை அளிக்கிறது.",
    "formula_or_law": "\\text{Article 226} \\implies \\text{High Court Writ Jurisdiction}"
  },
  {
    "question_uid": "BIO-ZOO-01-01-M2-E-0008",
    "taxonomy": {
      "subject": "Biology",
      "subject_code": "BIO",
      "domain": "Zoology",
      "domain_code": "ZOO",
      "topic": "Cholas & Principles",
      "topic_code": "01",
      "subtopic": "Endocrine & Neural System",
      "subtopic_code": "01",
      "microtopic": "Cholas Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Easy",
      "exam_category": "NEET_JEE",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "NEET_JEE",
    "question_text": "[#0008] The famous Uttaramerur Inscription of Parantaka Chola I describes the _______ system of secret ballot village democracy.",
    "question_text_ta": "[#0008] முதலாம் பராந்தக சோழனின் உத்திரமேரூர் கல்வெட்டு கிராம நிர்வாகத்திற்கான _______ தேர்தல் முறையை விவரிக்கிறது.",
    "options": {
      "A": "Kudavolai (குடவோலை முறை)",
      "B": "Kadamai (கடமை முறை)",
      "C": "Variyam (வாரிய வரி விதிப்பு)",
      "D": "Kaniurimai (காணியுரிமை முறை)"
    },
    "correct_option": "A",
    "explanation": "[Question #0008] The Uttaramerur inscription details the Kudavolai secret ballot system for electing members to village committees (Variyams) with strict qualifications and disqualifications.",
    "explanation_ta": "[கேள்வி எண் #0008] உத்திரமேரூர் கல்வெட்டு கிராம சபைக் குழுக்களுக்கு (வாரியங்கள்) குடவோலை முறை மூலம் உறுப்பினர்களைத் தேர்ந்தெடுக்கும் தேர்தல் முறையை விவரிக்கிறது.",
    "formula_or_law": "\\text{Uttaramerur Inscription} \\implies \\text{Village Kudavolai Democracy}"
  },
  {
    "question_uid": "BIO-GEN-01-01-M3-H-0009",
    "taxonomy": {
      "subject": "Biology",
      "subject_code": "BIO",
      "domain": "Genetics",
      "domain_code": "GEN",
      "topic": "Monsoons & Principles",
      "topic_code": "01",
      "subtopic": "DNA Replication & Translation",
      "subtopic_code": "01",
      "microtopic": "Monsoons Core Rule",
      "microtopic_code": "M3",
      "difficulty": "Hard",
      "exam_category": "SCHOOL_K12",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "SCHOOL_K12",
    "question_text": "[#0009] Tamil Nadu receives nearly 48% to 50% of its annual precipitation from the _______ Monsoon season.",
    "question_text_ta": "[#0009] தமிழ்நாடு தனது ஆண்டு மழையில் சுமார் 48% முதல் 50% பங்கை _______ பருவமழை காலத்தில் பெறுகிறது.",
    "options": {
      "A": "North-East Monsoon (வடகிழக்குப் பருவமழை)",
      "B": "South-West Monsoon (தென்மேற்குப் பருவமழை)",
      "C": "Pre-Monsoon Convectional Showers (கோடை மழை)",
      "D": "Winter Cyclonic Disturbances"
    },
    "correct_option": "A",
    "explanation": "[Question #0009] The North-East Monsoon accounts for nearly 48-50% of Tamil Nadu's annual precipitation as retreating winds pick up moisture across the Bay of Bengal and hit the Coromandel coast.",
    "explanation_ta": "[கேள்வி எண் #0009] தமிழ்நாடு தனது ஆண்டு மழையில் சுமார் 48-50% பங்கை வடகிழக்குப் பருவமழை மூலமே பெறுகிறது.",
    "formula_or_law": "\\text{NE Monsoon (Oct-Dec)} \\implies 48\\text{--}50\\% \\text{ TN Precipitation}"
  },
  {
    "question_uid": "MAT-CAL-01-01-M1-H-0010",
    "taxonomy": {
      "subject": "Mathematics",
      "subject_code": "MAT",
      "domain": "Calculus",
      "domain_code": "CAL",
      "topic": "Simple Interest & Principles",
      "topic_code": "01",
      "subtopic": "Definite Integrals & Limits",
      "subtopic_code": "01",
      "microtopic": "Simple Interest Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Hard",
      "exam_category": "NEET_JEE",
      "question_format": "assertion_reason"
    },
    "question_format": "assertion_reason",
    "exam_category": "NEET_JEE",
    "question_text": "[#0010] If SI = (P * R * N) / 100, the total accumulated amount A is calculated by the formula A = _______ .",
    "question_text_ta": "[#0010] தனிவட்டி SI = (P * R * N) / 100 எனில், மொத்தத் தொகை A கணக்கிடும் சூத்திரம் A = _______ ஆகும்.",
    "options": {
      "A": "P [1 + (R * N) / 100]",
      "B": "P [1 + R / 100]^N",
      "C": "(P * R * N) / 100",
      "D": "P / [1 + (R * N) / 100]"
    },
    "correct_option": "A",
    "explanation": "[Question #0010] Total Amount A = Principal P + Simple Interest SI = P + (P * R * N) / 100 = P [1 + (R * N) / 100].",
    "explanation_ta": "[கேள்வி எண் #0010] மொத்தத் தொகை A = அசல் + தனிவட்டி = P [1 + (R * N) / 100].",
    "formula_or_law": "A = P \\left(1 + \\frac{R \\cdot N}{100}\\right)"
  },
  {
    "question_uid": "MAT-ALG-01-01-M2-M-0011",
    "taxonomy": {
      "subject": "Mathematics",
      "subject_code": "MAT",
      "domain": "Algebra",
      "domain_code": "ALG",
      "topic": "Kinematics & Principles",
      "topic_code": "01",
      "subtopic": "Eigenvalues & Rank",
      "subtopic_code": "01",
      "microtopic": "Kinematics Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "SCHOOL_K12",
      "question_format": "numerical"
    },
    "question_format": "numerical",
    "exam_category": "SCHOOL_K12",
    "question_text": "[#0011] In two-dimensional projectile motion without air resistance, the horizontal velocity component remains _______ throughout the flight.",
    "question_text_ta": "[#0011] காற்று உராய்வு இல்லாத இருபரிமாண எறிபொருள் இயக்கத்தில் கிடைமட்ட திசைவேகக் கூறு இயக்கம் முழுவதும் _______ ஆக இருக்கும்.",
    "options": {
      "A": "Constant (மாறிலி)",
      "B": "Zero at highest point (உச்சியில் சுழி)",
      "C": "Linearly increasing (நேர்கோட்டில் அதிகரிக்கும்)",
      "D": "Exponentially decaying (அதிவேகமாக குறையும்)"
    },
    "correct_option": "A",
    "explanation": "[Question #0011] Since gravity acts solely vertically downward (a_y = -g), horizontal acceleration a_x = 0, keeping horizontal velocity v_x = u cos θ strictly constant.",
    "explanation_ta": "[கேள்வி எண் #0011] புவியீர்ப்பு விசை செங்குத்தாக மட்டுமே செயல்படுவதால் கிடைமட்ட முடுக்கம் a_x = 0, எனவே v_x மாறிலியாக இருக்கும்.",
    "formula_or_law": "v_x = u \\cos\\theta = \\text{constant}"
  },
  {
    "question_uid": "CS-DSA-01-01-M1-M-0012",
    "taxonomy": {
      "subject": "Computer Science",
      "subject_code": "CS",
      "domain": "Algorithms",
      "domain_code": "DSA",
      "topic": "Ohm Law & Principles",
      "topic_code": "01",
      "subtopic": "Binary Search Trees & AVL",
      "subtopic_code": "01",
      "microtopic": "Ohm Law Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Medium",
      "exam_category": "SSC_BANK",
      "question_format": "match_the_following"
    },
    "question_format": "match_the_following",
    "exam_category": "SSC_BANK",
    "question_text": "[#0012] According to microscopic Ohm's law, the electrical conductivity σ is given by the formula _______ .",
    "question_text_ta": "[#0012] நுண்ணோக்கி ஓம் விதியின்படி ஒரு கடத்தியின் மின்கடத்துத்திறன் σ சமன்பாடு _______ ஆகும்.",
    "options": {
      "A": "σ = (n e² τ) / m",
      "B": "σ = (m e² τ) / n",
      "C": "σ = (n e τ) / m²",
      "D": "σ = (n² e τ) / m"
    },
    "correct_option": "A",
    "explanation": "[Question #0012] Conductivity σ is derived from J = n e v_d where v_d = (e E τ) / m, leading to J = (n e² τ / m) E = σ E.",
    "explanation_ta": "[கேள்வி எண் #0012] மின்கடத்துத்திறன் σ = (n e² τ) / m ஆகும்.",
    "formula_or_law": "\\sigma = \\frac{n e^2 \\tau}{m}"
  },
  {
    "question_uid": "CS-DBMS-01-01-M2-E-0013",
    "taxonomy": {
      "subject": "Computer Science",
      "subject_code": "CS",
      "domain": "Databases",
      "domain_code": "DBMS",
      "topic": "Chemical Kinetics & Principles",
      "topic_code": "01",
      "subtopic": "Normalization & Indexing",
      "subtopic_code": "01",
      "microtopic": "Chemical Kinetics Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Easy",
      "exam_category": "SSC_BANK",
      "question_format": "pyq"
    },
    "question_format": "pyq",
    "exam_category": "SSC_BANK",
    "question_text": "[#0013] For a first-order chemical reaction, the half-life period t_1/2 is _______ of initial reactant concentration.",
    "question_text_ta": "[#0013] ஒரு முதல் வகை வேதிவினைக்கு அரைவாழ்வு காலம் தொடக்கச் செறிவை _______ .",
    "options": {
      "A": "Independent (சார்ந்திருக்காது - t_1/2 = 0.693 / k)",
      "B": "Directly proportional (நேர்விகிதத்தில் சார்ந்தது)",
      "C": "Inversely proportional (எதிர்விகிதத்தில் சார்ந்தது)",
      "D": "Exponentially dependent (அதிவேகமாக சார்ந்தது)"
    },
    "correct_option": "A",
    "explanation": "[Question #0013] For first order: k = (2.303 / t) log([A]_0 / [A]). At t = t_1/2, [A] = [A]_0 / 2, giving t_1/2 = ln(2) / k = 0.693 / k.",
    "explanation_ta": "[கேள்வி எண் #0013] முதல் வகை வினைக்கு அரைவாழ்வு காலம் தொடக்கச் செறிவைச் சார்ந்திருக்காது: t_1/2 = 0.693 / k.",
    "formula_or_law": "t_{1/2} = \\frac{\\ln 2}{k} = \\frac{0.693}{k}"
  },
  {
    "question_uid": "HIS-TN-01-01-M1-E-0014",
    "taxonomy": {
      "subject": "History",
      "subject_code": "HIS",
      "domain": "Tamil Nadu History",
      "domain_code": "TN",
      "topic": "Photosynthesis & Principles",
      "topic_code": "01",
      "subtopic": "Cholas, Pandyas & Cheras",
      "subtopic_code": "01",
      "microtopic": "Photosynthesis Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Easy",
      "exam_category": "TNPSC",
      "question_format": "theory"
    },
    "question_format": "theory",
    "exam_category": "TNPSC",
    "question_text": "[#0014] During photosynthesis in chloroplasts, photolysis of water occurs at the _______ complex of PS II.",
    "question_text_ta": "[#0014] ஒளிச்சேர்க்கையின் போது நீர் மூலக்கூறு ஒளிச்சிதைவு PS II இன் _______ வளாகத்தில் நடைபெறுகிறது.",
    "options": {
      "A": "Oxygen-Evolving Complex (OEC - ஆக்ஸிஜன் வெளிப்படுத்தும் மையம்)",
      "B": "ATP Synthase CF0-CF1 complex",
      "C": "Photosystem I reaction center P700",
      "D": "Cytochrome b6f complex"
    },
    "correct_option": "A",
    "explanation": "[Question #0014] Water photolysis (2H2O -> 4H+ + 4e- + O2) is catalyzed by the manganese-containing oxygen-evolving complex located on the luminal side of PS II.",
    "explanation_ta": "[கேள்வி எண் #0014] நீர் மூலக்கூறு சிதைவு PS II இன் ஆக்ஸிஜன் வெளிப்படுத்தும் மையத்தால் வினையூக்கப்படுகிறது.",
    "formula_or_law": "2\\text{H}_2\\text{O} \\xrightarrow{h\\nu, \\text{PS II}} 4\\text{H}^+ + 4e^- + \\text{O}_2"
  },
  {
    "question_uid": "HIS-MOD-01-01-M2-M-0015",
    "taxonomy": {
      "subject": "History",
      "subject_code": "HIS",
      "domain": "Modern India",
      "domain_code": "MOD",
      "topic": "Matrices & Principles",
      "topic_code": "01",
      "subtopic": "Non-Cooperation & Civil Disobedience",
      "subtopic_code": "01",
      "microtopic": "Matrices Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "TNPSC",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "TNPSC",
    "question_text": "[#0015] The sum of all eigenvalues of an n x n square matrix A is identically equal to the _______ of matrix A.",
    "question_text_ta": "[#0015] ஒரு சதுர அணி A இன் அனைத்து ஐகன் மதிப்புகளின் கூடுதல் அந்த அணியின் _______ க்குச் சமமாகும்.",
    "options": {
      "A": "Trace (சுவடு - Tr(A))",
      "B": "Determinant (அணிக்கோவை மதிப்பு)",
      "C": "Rank (அணியின் தரம்)",
      "D": "Nullity (வெற்றுமை)"
    },
    "correct_option": "A",
    "explanation": "[Question #0015] The trace of any square matrix equals the sum of its main diagonal elements, which identically equals the algebraic sum of all its eigenvalues.",
    "explanation_ta": "[கேள்வி எண் #0015] ஒரு சதுர அணியின் சுவடு (Trace) அதன் முதன்மை மூலைவிட்ட உறுப்புகளின் கூடுதலுக்கு மற்றும் அனைத்து ஐகன் மதிப்புகளின் கூடுதலுக்குச் சமமாகும்.",
    "formula_or_law": "\\text{Tr}(A) = \\sum_{i=1}^n a_{ii} = \\sum_{i=1}^n \\lambda_i"
  },
  {
    "question_uid": "POL-CON-01-01-M1-E-0016",
    "taxonomy": {
      "subject": "Polity",
      "subject_code": "POL",
      "domain": "Constitution",
      "domain_code": "CON",
      "topic": "Binary Search Trees & Principles",
      "topic_code": "01",
      "subtopic": "Articles 14-32 & Writs",
      "subtopic_code": "01",
      "microtopic": "Binary Search Trees Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Easy",
      "exam_category": "TNPSC",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "TNPSC",
    "question_text": "[#0016] In an AVL Tree, the balance factor for every node is strictly constrained to the set _______ .",
    "question_text_ta": "[#0016] AVL மரத்தில் ஒவ்வொரு முனையின் சமநிலை காரணி (Balance Factor) எப்போதும் _______ கணத்திற்குள் இருக்க வேண்டும்.",
    "options": {
      "A": "{-1, 0, +1}",
      "B": "{0, 1, 2}",
      "C": "{-2, 0, +2}",
      "D": "{0, 1}"
    },
    "correct_option": "A",
    "explanation": "[Question #0016] An AVL tree is a self-balancing binary search tree where the height difference between left and right subtrees (Balance Factor = Height(L) - Height(R)) is strictly in {-1, 0, 1}.",
    "explanation_ta": "[கேள்வி எண் #0016] AVL மரத்தில் இடது மற்றும் வலது துணை மரங்களின் உயர வேறுபாடு எப்போதும் -1, 0, அல்லது +1 ஆக மட்டுமே இருக்க வேண்டும்.",
    "formula_or_law": "\\text{BF}(v) = h(\\text{left}(v)) - h(\\text{right}(v)) \\in \\{-1, 0, +1\\}"
  },
  {
    "question_uid": "POL-GOV-01-01-M2-M-0017",
    "taxonomy": {
      "subject": "Polity",
      "subject_code": "POL",
      "domain": "Governance",
      "domain_code": "GOV",
      "topic": "Constitution & Principles",
      "topic_code": "01",
      "subtopic": "Lok Sabha & Supreme Court",
      "subtopic_code": "01",
      "microtopic": "Constitution Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "SSC_BANK",
      "question_format": "assertion_reason"
    },
    "question_format": "assertion_reason",
    "exam_category": "SSC_BANK",
    "question_text": "[#0017] Under Article _______ of the Constitution of India, High Courts have the power to issue Writs for Fundamental Rights and other legal rights.",
    "question_text_ta": "[#0017] இந்திய அரசியலமைப்பின் சட்டப்பிரிவு _______ இன் கீழ் உயர்நீதிமன்றங்கள் நீதிப்பேராணைகளை வெளியிடும் அதிகாரம் பெற்றுள்ளன.",
    "options": {
      "A": "Article 226",
      "B": "Article 32",
      "C": "Article 14",
      "D": "Article 368"
    },
    "correct_option": "A",
    "explanation": "[Question #0017] Article 226 empowers High Courts to issue Writs for Fundamental Rights as well as ordinary legal rights, giving it a wider textual scope than Article 32.",
    "explanation_ta": "[கேள்வி எண் #0017] சட்டப்பிரிவு 226 உயர்நீதிமன்றங்களுக்கு அடிப்படை உரிமைகள் மற்றும் பிற சட்ட உரிமைகளுக்காகவும் நீதிப்பேராணைகளை வழங்கும் அதிகாரத்தை அளிக்கிறது.",
    "formula_or_law": "\\text{Article 226} \\implies \\text{High Court Writ Jurisdiction}"
  },
  {
    "question_uid": "GEO-IND-01-01-M1-E-0018",
    "taxonomy": {
      "subject": "Geography",
      "subject_code": "GEO",
      "domain": "Indian Geography",
      "domain_code": "IND",
      "topic": "Cholas & Principles",
      "topic_code": "01",
      "subtopic": "Himalayan & Peninsular Rivers",
      "subtopic_code": "01",
      "microtopic": "Cholas Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Easy",
      "exam_category": "TNPSC",
      "question_format": "numerical"
    },
    "question_format": "numerical",
    "exam_category": "TNPSC",
    "question_text": "[#0018] The famous Uttaramerur Inscription of Parantaka Chola I describes the _______ system of secret ballot village democracy.",
    "question_text_ta": "[#0018] முதலாம் பராந்தக சோழனின் உத்திரமேரூர் கல்வெட்டு கிராம நிர்வாகத்திற்கான _______ தேர்தல் முறையை விவரிக்கிறது.",
    "options": {
      "A": "Kudavolai (குடவோலை முறை)",
      "B": "Kadamai (கடமை முறை)",
      "C": "Variyam (வாரிய வரி விதிப்பு)",
      "D": "Kaniurimai (காணியுரிமை முறை)"
    },
    "correct_option": "A",
    "explanation": "[Question #0018] The Uttaramerur inscription details the Kudavolai secret ballot system for electing members to village committees (Variyams) with strict qualifications and disqualifications.",
    "explanation_ta": "[கேள்வி எண் #0018] உத்திரமேரூர் கல்வெட்டு கிராம சபைக் குழுக்களுக்கு (வாரியங்கள்) குடவோலை முறை மூலம் உறுப்பினர்களைத் தேர்ந்தெடுக்கும் தேர்தல் முறையை விவரிக்கிறது.",
    "formula_or_law": "\\text{Uttaramerur Inscription} \\implies \\text{Village Kudavolai Democracy}"
  },
  {
    "question_uid": "GEO-TN-01-01-M2-M-0019",
    "taxonomy": {
      "subject": "Geography",
      "subject_code": "GEO",
      "domain": "Tamil Nadu Geography",
      "domain_code": "TN",
      "topic": "Monsoons & Principles",
      "topic_code": "01",
      "subtopic": "Monsoons & Soil Types",
      "subtopic_code": "01",
      "microtopic": "Monsoons Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "TNPSC",
      "question_format": "match_the_following"
    },
    "question_format": "match_the_following",
    "exam_category": "TNPSC",
    "question_text": "[#0019] Tamil Nadu receives nearly 48% to 50% of its annual precipitation from the _______ Monsoon season.",
    "question_text_ta": "[#0019] தமிழ்நாடு தனது ஆண்டு மழையில் சுமார் 48% முதல் 50% பங்கை _______ பருவமழை காலத்தில் பெறுகிறது.",
    "options": {
      "A": "North-East Monsoon (வடகிழக்குப் பருவமழை)",
      "B": "South-West Monsoon (தென்மேற்குப் பருவமழை)",
      "C": "Pre-Monsoon Convectional Showers (கோடை மழை)",
      "D": "Winter Cyclonic Disturbances"
    },
    "correct_option": "A",
    "explanation": "[Question #0019] The North-East Monsoon accounts for nearly 48-50% of Tamil Nadu's annual precipitation as retreating winds pick up moisture across the Bay of Bengal and hit the Coromandel coast.",
    "explanation_ta": "[கேள்வி எண் #0019] தமிழ்நாடு தனது ஆண்டு மழையில் சுமார் 48-50% பங்கை வடகிழக்குப் பருவமழை மூலமே பெறுகிறது.",
    "formula_or_law": "\\text{NE Monsoon (Oct-Dec)} \\implies 48\\text{--}50\\% \\text{ TN Precipitation}"
  },
  {
    "question_uid": "APT-NUM-01-01-M1-E-0020",
    "taxonomy": {
      "subject": "Aptitude",
      "subject_code": "APT",
      "domain": "Quantitative Aptitude",
      "domain_code": "NUM",
      "topic": "Simple Interest & Principles",
      "topic_code": "01",
      "subtopic": "Simple & Compound Interest",
      "subtopic_code": "01",
      "microtopic": "Simple Interest Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Easy",
      "exam_category": "SSC_BANK",
      "question_format": "pyq"
    },
    "question_format": "pyq",
    "exam_category": "SSC_BANK",
    "question_text": "[#0020] If SI = (P * R * N) / 100, the total accumulated amount A is calculated by the formula A = _______ .",
    "question_text_ta": "[#0020] தனிவட்டி SI = (P * R * N) / 100 எனில், மொத்தத் தொகை A கணக்கிடும் சூத்திரம் A = _______ ஆகும்.",
    "options": {
      "A": "P [1 + (R * N) / 100]",
      "B": "P [1 + R / 100]^N",
      "C": "(P * R * N) / 100",
      "D": "P / [1 + (R * N) / 100]"
    },
    "correct_option": "A",
    "explanation": "[Question #0020] Total Amount A = Principal P + Simple Interest SI = P + (P * R * N) / 100 = P [1 + (R * N) / 100].",
    "explanation_ta": "[கேள்வி எண் #0020] மொத்தத் தொகை A = அசல் + தனிவட்டி = P [1 + (R * N) / 100].",
    "formula_or_law": "A = P \\left(1 + \\frac{R \\cdot N}{100}\\right)"
  },
  {
    "question_uid": "PHY-MEC-01-01-M1-M-0021",
    "taxonomy": {
      "subject": "Physics",
      "subject_code": "PHY",
      "domain": "Mechanics",
      "domain_code": "MEC",
      "topic": "Kinematics & Principles",
      "topic_code": "01",
      "subtopic": "Motion in 2D & Projectiles",
      "subtopic_code": "01",
      "microtopic": "Kinematics Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Medium",
      "exam_category": "NEET_JEE",
      "question_format": "theory"
    },
    "question_format": "theory",
    "exam_category": "NEET_JEE",
    "question_text": "[#0021] In two-dimensional projectile motion without air resistance, the horizontal velocity component remains _______ throughout the flight.",
    "question_text_ta": "[#0021] காற்று உராய்வு இல்லாத இருபரிமாண எறிபொருள் இயக்கத்தில் கிடைமட்ட திசைவேகக் கூறு இயக்கம் முழுவதும் _______ ஆக இருக்கும்.",
    "options": {
      "A": "Constant (மாறிலி)",
      "B": "Zero at highest point (உச்சியில் சுழி)",
      "C": "Linearly increasing (நேர்கோட்டில் அதிகரிக்கும்)",
      "D": "Exponentially decaying (அதிவேகமாக குறையும்)"
    },
    "correct_option": "A",
    "explanation": "[Question #0021] Since gravity acts solely vertically downward (a_y = -g), horizontal acceleration a_x = 0, keeping horizontal velocity v_x = u cos θ strictly constant.",
    "explanation_ta": "[கேள்வி எண் #0021] புவியீர்ப்பு விசை செங்குத்தாக மட்டுமே செயல்படுவதால் கிடைமட்ட முடுக்கம் a_x = 0, எனவே v_x மாறிலியாக இருக்கும்.",
    "formula_or_law": "v_x = u \\cos\\theta = \\text{constant}"
  },
  {
    "question_uid": "PHY-ELE-01-01-M2-E-0022",
    "taxonomy": {
      "subject": "Physics",
      "subject_code": "PHY",
      "domain": "Electrodynamics",
      "domain_code": "ELE",
      "topic": "Ohm Law & Principles",
      "topic_code": "01",
      "subtopic": "Ohm Law & Kirchhoff Rules",
      "subtopic_code": "01",
      "microtopic": "Ohm Law Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Easy",
      "exam_category": "NEET_JEE",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "NEET_JEE",
    "question_text": "[#0022] According to microscopic Ohm's law, the electrical conductivity σ is given by the formula _______ .",
    "question_text_ta": "[#0022] நுண்ணோக்கி ஓம் விதியின்படி ஒரு கடத்தியின் மின்கடத்துத்திறன் σ சமன்பாடு _______ ஆகும்.",
    "options": {
      "A": "σ = (n e² τ) / m",
      "B": "σ = (m e² τ) / n",
      "C": "σ = (n e τ) / m²",
      "D": "σ = (n² e τ) / m"
    },
    "correct_option": "A",
    "explanation": "[Question #0022] Conductivity σ is derived from J = n e v_d where v_d = (e E τ) / m, leading to J = (n e² τ / m) E = σ E.",
    "explanation_ta": "[கேள்வி எண் #0022] மின்கடத்துத்திறன் σ = (n e² τ) / m ஆகும்.",
    "formula_or_law": "\\sigma = \\frac{n e^2 \\tau}{m}"
  },
  {
    "question_uid": "PHY-OPT-01-01-M3-H-0023",
    "taxonomy": {
      "subject": "Physics",
      "subject_code": "PHY",
      "domain": "Optics",
      "domain_code": "OPT",
      "topic": "Chemical Kinetics & Principles",
      "topic_code": "01",
      "subtopic": "Interference & Diffraction",
      "subtopic_code": "01",
      "microtopic": "Chemical Kinetics Core Rule",
      "microtopic_code": "M3",
      "difficulty": "Hard",
      "exam_category": "SCHOOL_K12",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "SCHOOL_K12",
    "question_text": "[#0023] For a first-order chemical reaction, the half-life period t_1/2 is _______ of initial reactant concentration.",
    "question_text_ta": "[#0023] ஒரு முதல் வகை வேதிவினைக்கு அரைவாழ்வு காலம் தொடக்கச் செறிவை _______ .",
    "options": {
      "A": "Independent (சார்ந்திருக்காது - t_1/2 = 0.693 / k)",
      "B": "Directly proportional (நேர்விகிதத்தில் சார்ந்தது)",
      "C": "Inversely proportional (எதிர்விகிதத்தில் சார்ந்தது)",
      "D": "Exponentially dependent (அதிவேகமாக சார்ந்தது)"
    },
    "correct_option": "A",
    "explanation": "[Question #0023] For first order: k = (2.303 / t) log([A]_0 / [A]). At t = t_1/2, [A] = [A]_0 / 2, giving t_1/2 = ln(2) / k = 0.693 / k.",
    "explanation_ta": "[கேள்வி எண் #0023] முதல் வகை வினைக்கு அரைவாழ்வு காலம் தொடக்கச் செறிவைச் சார்ந்திருக்காது: t_1/2 = 0.693 / k.",
    "formula_or_law": "t_{1/2} = \\frac{\\ln 2}{k} = \\frac{0.693}{k}"
  },
  {
    "question_uid": "CHE-ORG-01-01-M1-H-0024",
    "taxonomy": {
      "subject": "Chemistry",
      "subject_code": "CHE",
      "domain": "Organic Chemistry",
      "domain_code": "ORG",
      "topic": "Photosynthesis & Principles",
      "topic_code": "01",
      "subtopic": "Electrophilic & Nucleophilic",
      "subtopic_code": "01",
      "microtopic": "Photosynthesis Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Hard",
      "exam_category": "NEET_JEE",
      "question_format": "assertion_reason"
    },
    "question_format": "assertion_reason",
    "exam_category": "NEET_JEE",
    "question_text": "[#0024] During photosynthesis in chloroplasts, photolysis of water occurs at the _______ complex of PS II.",
    "question_text_ta": "[#0024] ஒளிச்சேர்க்கையின் போது நீர் மூலக்கூறு ஒளிச்சிதைவு PS II இன் _______ வளாகத்தில் நடைபெறுகிறது.",
    "options": {
      "A": "Oxygen-Evolving Complex (OEC - ஆக்ஸிஜன் வெளிப்படுத்தும் மையம்)",
      "B": "ATP Synthase CF0-CF1 complex",
      "C": "Photosystem I reaction center P700",
      "D": "Cytochrome b6f complex"
    },
    "correct_option": "A",
    "explanation": "[Question #0024] Water photolysis (2H2O -> 4H+ + 4e- + O2) is catalyzed by the manganese-containing oxygen-evolving complex located on the luminal side of PS II.",
    "explanation_ta": "[கேள்வி எண் #0024] நீர் மூலக்கூறு சிதைவு PS II இன் ஆக்ஸிஜன் வெளிப்படுத்தும் மையத்தால் வினையூக்கப்படுகிறது.",
    "formula_or_law": "2\\text{H}_2\\text{O} \\xrightarrow{h\\nu, \\text{PS II}} 4\\text{H}^+ + 4e^- + \\text{O}_2"
  },
  {
    "question_uid": "CHE-INO-01-01-M2-M-0025",
    "taxonomy": {
      "subject": "Chemistry",
      "subject_code": "CHE",
      "domain": "Inorganic Chemistry",
      "domain_code": "INO",
      "topic": "Matrices & Principles",
      "topic_code": "01",
      "subtopic": "Ligand Field & Isomerism",
      "subtopic_code": "01",
      "microtopic": "Matrices Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "NEET_JEE",
      "question_format": "numerical"
    },
    "question_format": "numerical",
    "exam_category": "NEET_JEE",
    "question_text": "[#0025] The sum of all eigenvalues of an n x n square matrix A is identically equal to the _______ of matrix A.",
    "question_text_ta": "[#0025] ஒரு சதுர அணி A இன் அனைத்து ஐகன் மதிப்புகளின் கூடுதல் அந்த அணியின் _______ க்குச் சமமாகும்.",
    "options": {
      "A": "Trace (சுவடு - Tr(A))",
      "B": "Determinant (அணிக்கோவை மதிப்பு)",
      "C": "Rank (அணியின் தரம்)",
      "D": "Nullity (வெற்றுமை)"
    },
    "correct_option": "A",
    "explanation": "[Question #0025] The trace of any square matrix equals the sum of its main diagonal elements, which identically equals the algebraic sum of all its eigenvalues.",
    "explanation_ta": "[கேள்வி எண் #0025] ஒரு சதுர அணியின் சுவடு (Trace) அதன் முதன்மை மூலைவிட்ட உறுப்புகளின் கூடுதலுக்கு மற்றும் அனைத்து ஐகன் மதிப்புகளின் கூடுதலுக்குச் சமமாகும்.",
    "formula_or_law": "\\text{Tr}(A) = \\sum_{i=1}^n a_{ii} = \\sum_{i=1}^n \\lambda_i"
  },
  {
    "question_uid": "CHE-PHY-01-01-M3-M-0026",
    "taxonomy": {
      "subject": "Chemistry",
      "subject_code": "CHE",
      "domain": "Physical Chemistry",
      "domain_code": "PHY",
      "topic": "Binary Search Trees & Principles",
      "topic_code": "01",
      "subtopic": "Rate Laws & Arrhenius",
      "subtopic_code": "01",
      "microtopic": "Binary Search Trees Core Rule",
      "microtopic_code": "M3",
      "difficulty": "Medium",
      "exam_category": "SCHOOL_K12",
      "question_format": "match_the_following"
    },
    "question_format": "match_the_following",
    "exam_category": "SCHOOL_K12",
    "question_text": "[#0026] In an AVL Tree, the balance factor for every node is strictly constrained to the set _______ .",
    "question_text_ta": "[#0026] AVL மரத்தில் ஒவ்வொரு முனையின் சமநிலை காரணி (Balance Factor) எப்போதும் _______ கணத்திற்குள் இருக்க வேண்டும்.",
    "options": {
      "A": "{-1, 0, +1}",
      "B": "{0, 1, 2}",
      "C": "{-2, 0, +2}",
      "D": "{0, 1}"
    },
    "correct_option": "A",
    "explanation": "[Question #0026] An AVL tree is a self-balancing binary search tree where the height difference between left and right subtrees (Balance Factor = Height(L) - Height(R)) is strictly in {-1, 0, 1}.",
    "explanation_ta": "[கேள்வி எண் #0026] AVL மரத்தில் இடது மற்றும் வலது துணை மரங்களின் உயர வேறுபாடு எப்போதும் -1, 0, அல்லது +1 ஆக மட்டுமே இருக்க வேண்டும்.",
    "formula_or_law": "\\text{BF}(v) = h(\\text{left}(v)) - h(\\text{right}(v)) \\in \\{-1, 0, +1\\}"
  },
  {
    "question_uid": "BIO-BOT-01-01-M1-M-0027",
    "taxonomy": {
      "subject": "Biology",
      "subject_code": "BIO",
      "domain": "Botany",
      "domain_code": "BOT",
      "topic": "Constitution & Principles",
      "topic_code": "01",
      "subtopic": "Photosynthesis C3 & C4",
      "subtopic_code": "01",
      "microtopic": "Constitution Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Medium",
      "exam_category": "NEET_JEE",
      "question_format": "pyq"
    },
    "question_format": "pyq",
    "exam_category": "NEET_JEE",
    "question_text": "[#0027] Under Article _______ of the Constitution of India, High Courts have the power to issue Writs for Fundamental Rights and other legal rights.",
    "question_text_ta": "[#0027] இந்திய அரசியலமைப்பின் சட்டப்பிரிவு _______ இன் கீழ் உயர்நீதிமன்றங்கள் நீதிப்பேராணைகளை வெளியிடும் அதிகாரம் பெற்றுள்ளன.",
    "options": {
      "A": "Article 226",
      "B": "Article 32",
      "C": "Article 14",
      "D": "Article 368"
    },
    "correct_option": "A",
    "explanation": "[Question #0027] Article 226 empowers High Courts to issue Writs for Fundamental Rights as well as ordinary legal rights, giving it a wider textual scope than Article 32.",
    "explanation_ta": "[கேள்வி எண் #0027] சட்டப்பிரிவு 226 உயர்நீதிமன்றங்களுக்கு அடிப்படை உரிமைகள் மற்றும் பிற சட்ட உரிமைகளுக்காகவும் நீதிப்பேராணைகளை வழங்கும் அதிகாரத்தை அளிக்கிறது.",
    "formula_or_law": "\\text{Article 226} \\implies \\text{High Court Writ Jurisdiction}"
  },
  {
    "question_uid": "BIO-ZOO-01-01-M2-E-0028",
    "taxonomy": {
      "subject": "Biology",
      "subject_code": "BIO",
      "domain": "Zoology",
      "domain_code": "ZOO",
      "topic": "Cholas & Principles",
      "topic_code": "01",
      "subtopic": "Endocrine & Neural System",
      "subtopic_code": "01",
      "microtopic": "Cholas Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Easy",
      "exam_category": "NEET_JEE",
      "question_format": "theory"
    },
    "question_format": "theory",
    "exam_category": "NEET_JEE",
    "question_text": "[#0028] The famous Uttaramerur Inscription of Parantaka Chola I describes the _______ system of secret ballot village democracy.",
    "question_text_ta": "[#0028] முதலாம் பராந்தக சோழனின் உத்திரமேரூர் கல்வெட்டு கிராம நிர்வாகத்திற்கான _______ தேர்தல் முறையை விவரிக்கிறது.",
    "options": {
      "A": "Kudavolai (குடவோலை முறை)",
      "B": "Kadamai (கடமை முறை)",
      "C": "Variyam (வாரிய வரி விதிப்பு)",
      "D": "Kaniurimai (காணியுரிமை முறை)"
    },
    "correct_option": "A",
    "explanation": "[Question #0028] The Uttaramerur inscription details the Kudavolai secret ballot system for electing members to village committees (Variyams) with strict qualifications and disqualifications.",
    "explanation_ta": "[கேள்வி எண் #0028] உத்திரமேரூர் கல்வெட்டு கிராம சபைக் குழுக்களுக்கு (வாரியங்கள்) குடவோலை முறை மூலம் உறுப்பினர்களைத் தேர்ந்தெடுக்கும் தேர்தல் முறையை விவரிக்கிறது.",
    "formula_or_law": "\\text{Uttaramerur Inscription} \\implies \\text{Village Kudavolai Democracy}"
  },
  {
    "question_uid": "BIO-GEN-01-01-M3-H-0029",
    "taxonomy": {
      "subject": "Biology",
      "subject_code": "BIO",
      "domain": "Genetics",
      "domain_code": "GEN",
      "topic": "Monsoons & Principles",
      "topic_code": "01",
      "subtopic": "DNA Replication & Translation",
      "subtopic_code": "01",
      "microtopic": "Monsoons Core Rule",
      "microtopic_code": "M3",
      "difficulty": "Hard",
      "exam_category": "SCHOOL_K12",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "SCHOOL_K12",
    "question_text": "[#0029] Tamil Nadu receives nearly 48% to 50% of its annual precipitation from the _______ Monsoon season.",
    "question_text_ta": "[#0029] தமிழ்நாடு தனது ஆண்டு மழையில் சுமார் 48% முதல் 50% பங்கை _______ பருவமழை காலத்தில் பெறுகிறது.",
    "options": {
      "A": "North-East Monsoon (வடகிழக்குப் பருவமழை)",
      "B": "South-West Monsoon (தென்மேற்குப் பருவமழை)",
      "C": "Pre-Monsoon Convectional Showers (கோடை மழை)",
      "D": "Winter Cyclonic Disturbances"
    },
    "correct_option": "A",
    "explanation": "[Question #0029] The North-East Monsoon accounts for nearly 48-50% of Tamil Nadu's annual precipitation as retreating winds pick up moisture across the Bay of Bengal and hit the Coromandel coast.",
    "explanation_ta": "[கேள்வி எண் #0029] தமிழ்நாடு தனது ஆண்டு மழையில் சுமார் 48-50% பங்கை வடகிழக்குப் பருவமழை மூலமே பெறுகிறது.",
    "formula_or_law": "\\text{NE Monsoon (Oct-Dec)} \\implies 48\\text{--}50\\% \\text{ TN Precipitation}"
  },
  {
    "question_uid": "MAT-CAL-01-01-M1-H-0030",
    "taxonomy": {
      "subject": "Mathematics",
      "subject_code": "MAT",
      "domain": "Calculus",
      "domain_code": "CAL",
      "topic": "Simple Interest & Principles",
      "topic_code": "01",
      "subtopic": "Definite Integrals & Limits",
      "subtopic_code": "01",
      "microtopic": "Simple Interest Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Hard",
      "exam_category": "NEET_JEE",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "NEET_JEE",
    "question_text": "[#0030] If SI = (P * R * N) / 100, the total accumulated amount A is calculated by the formula A = _______ .",
    "question_text_ta": "[#0030] தனிவட்டி SI = (P * R * N) / 100 எனில், மொத்தத் தொகை A கணக்கிடும் சூத்திரம் A = _______ ஆகும்.",
    "options": {
      "A": "P [1 + (R * N) / 100]",
      "B": "P [1 + R / 100]^N",
      "C": "(P * R * N) / 100",
      "D": "P / [1 + (R * N) / 100]"
    },
    "correct_option": "A",
    "explanation": "[Question #0030] Total Amount A = Principal P + Simple Interest SI = P + (P * R * N) / 100 = P [1 + (R * N) / 100].",
    "explanation_ta": "[கேள்வி எண் #0030] மொத்தத் தொகை A = அசல் + தனிவட்டி = P [1 + (R * N) / 100].",
    "formula_or_law": "A = P \\left(1 + \\frac{R \\cdot N}{100}\\right)"
  },
  {
    "question_uid": "MAT-ALG-01-01-M2-M-0031",
    "taxonomy": {
      "subject": "Mathematics",
      "subject_code": "MAT",
      "domain": "Algebra",
      "domain_code": "ALG",
      "topic": "Kinematics & Principles",
      "topic_code": "01",
      "subtopic": "Eigenvalues & Rank",
      "subtopic_code": "01",
      "microtopic": "Kinematics Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "SCHOOL_K12",
      "question_format": "assertion_reason"
    },
    "question_format": "assertion_reason",
    "exam_category": "SCHOOL_K12",
    "question_text": "[#0031] In two-dimensional projectile motion without air resistance, the horizontal velocity component remains _______ throughout the flight.",
    "question_text_ta": "[#0031] காற்று உராய்வு இல்லாத இருபரிமாண எறிபொருள் இயக்கத்தில் கிடைமட்ட திசைவேகக் கூறு இயக்கம் முழுவதும் _______ ஆக இருக்கும்.",
    "options": {
      "A": "Constant (மாறிலி)",
      "B": "Zero at highest point (உச்சியில் சுழி)",
      "C": "Linearly increasing (நேர்கோட்டில் அதிகரிக்கும்)",
      "D": "Exponentially decaying (அதிவேகமாக குறையும்)"
    },
    "correct_option": "A",
    "explanation": "[Question #0031] Since gravity acts solely vertically downward (a_y = -g), horizontal acceleration a_x = 0, keeping horizontal velocity v_x = u cos θ strictly constant.",
    "explanation_ta": "[கேள்வி எண் #0031] புவியீர்ப்பு விசை செங்குத்தாக மட்டுமே செயல்படுவதால் கிடைமட்ட முடுக்கம் a_x = 0, எனவே v_x மாறிலியாக இருக்கும்.",
    "formula_or_law": "v_x = u \\cos\\theta = \\text{constant}"
  },
  {
    "question_uid": "CS-DSA-01-01-M1-M-0032",
    "taxonomy": {
      "subject": "Computer Science",
      "subject_code": "CS",
      "domain": "Algorithms",
      "domain_code": "DSA",
      "topic": "Ohm Law & Principles",
      "topic_code": "01",
      "subtopic": "Binary Search Trees & AVL",
      "subtopic_code": "01",
      "microtopic": "Ohm Law Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Medium",
      "exam_category": "SSC_BANK",
      "question_format": "numerical"
    },
    "question_format": "numerical",
    "exam_category": "SSC_BANK",
    "question_text": "[#0032] According to microscopic Ohm's law, the electrical conductivity σ is given by the formula _______ .",
    "question_text_ta": "[#0032] நுண்ணோக்கி ஓம் விதியின்படி ஒரு கடத்தியின் மின்கடத்துத்திறன் σ சமன்பாடு _______ ஆகும்.",
    "options": {
      "A": "σ = (n e² τ) / m",
      "B": "σ = (m e² τ) / n",
      "C": "σ = (n e τ) / m²",
      "D": "σ = (n² e τ) / m"
    },
    "correct_option": "A",
    "explanation": "[Question #0032] Conductivity σ is derived from J = n e v_d where v_d = (e E τ) / m, leading to J = (n e² τ / m) E = σ E.",
    "explanation_ta": "[கேள்வி எண் #0032] மின்கடத்துத்திறன் σ = (n e² τ) / m ஆகும்.",
    "formula_or_law": "\\sigma = \\frac{n e^2 \\tau}{m}"
  },
  {
    "question_uid": "CS-DBMS-01-01-M2-E-0033",
    "taxonomy": {
      "subject": "Computer Science",
      "subject_code": "CS",
      "domain": "Databases",
      "domain_code": "DBMS",
      "topic": "Chemical Kinetics & Principles",
      "topic_code": "01",
      "subtopic": "Normalization & Indexing",
      "subtopic_code": "01",
      "microtopic": "Chemical Kinetics Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Easy",
      "exam_category": "SSC_BANK",
      "question_format": "match_the_following"
    },
    "question_format": "match_the_following",
    "exam_category": "SSC_BANK",
    "question_text": "[#0033] For a first-order chemical reaction, the half-life period t_1/2 is _______ of initial reactant concentration.",
    "question_text_ta": "[#0033] ஒரு முதல் வகை வேதிவினைக்கு அரைவாழ்வு காலம் தொடக்கச் செறிவை _______ .",
    "options": {
      "A": "Independent (சார்ந்திருக்காது - t_1/2 = 0.693 / k)",
      "B": "Directly proportional (நேர்விகிதத்தில் சார்ந்தது)",
      "C": "Inversely proportional (எதிர்விகிதத்தில் சார்ந்தது)",
      "D": "Exponentially dependent (அதிவேகமாக சார்ந்தது)"
    },
    "correct_option": "A",
    "explanation": "[Question #0033] For first order: k = (2.303 / t) log([A]_0 / [A]). At t = t_1/2, [A] = [A]_0 / 2, giving t_1/2 = ln(2) / k = 0.693 / k.",
    "explanation_ta": "[கேள்வி எண் #0033] முதல் வகை வினைக்கு அரைவாழ்வு காலம் தொடக்கச் செறிவைச் சார்ந்திருக்காது: t_1/2 = 0.693 / k.",
    "formula_or_law": "t_{1/2} = \\frac{\\ln 2}{k} = \\frac{0.693}{k}"
  },
  {
    "question_uid": "HIS-TN-01-01-M1-E-0034",
    "taxonomy": {
      "subject": "History",
      "subject_code": "HIS",
      "domain": "Tamil Nadu History",
      "domain_code": "TN",
      "topic": "Photosynthesis & Principles",
      "topic_code": "01",
      "subtopic": "Cholas, Pandyas & Cheras",
      "subtopic_code": "01",
      "microtopic": "Photosynthesis Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Easy",
      "exam_category": "TNPSC",
      "question_format": "pyq"
    },
    "question_format": "pyq",
    "exam_category": "TNPSC",
    "question_text": "[#0034] During photosynthesis in chloroplasts, photolysis of water occurs at the _______ complex of PS II.",
    "question_text_ta": "[#0034] ஒளிச்சேர்க்கையின் போது நீர் மூலக்கூறு ஒளிச்சிதைவு PS II இன் _______ வளாகத்தில் நடைபெறுகிறது.",
    "options": {
      "A": "Oxygen-Evolving Complex (OEC - ஆக்ஸிஜன் வெளிப்படுத்தும் மையம்)",
      "B": "ATP Synthase CF0-CF1 complex",
      "C": "Photosystem I reaction center P700",
      "D": "Cytochrome b6f complex"
    },
    "correct_option": "A",
    "explanation": "[Question #0034] Water photolysis (2H2O -> 4H+ + 4e- + O2) is catalyzed by the manganese-containing oxygen-evolving complex located on the luminal side of PS II.",
    "explanation_ta": "[கேள்வி எண் #0034] நீர் மூலக்கூறு சிதைவு PS II இன் ஆக்ஸிஜன் வெளிப்படுத்தும் மையத்தால் வினையூக்கப்படுகிறது.",
    "formula_or_law": "2\\text{H}_2\\text{O} \\xrightarrow{h\\nu, \\text{PS II}} 4\\text{H}^+ + 4e^- + \\text{O}_2"
  },
  {
    "question_uid": "HIS-MOD-01-01-M2-M-0035",
    "taxonomy": {
      "subject": "History",
      "subject_code": "HIS",
      "domain": "Modern India",
      "domain_code": "MOD",
      "topic": "Matrices & Principles",
      "topic_code": "01",
      "subtopic": "Non-Cooperation & Civil Disobedience",
      "subtopic_code": "01",
      "microtopic": "Matrices Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "TNPSC",
      "question_format": "theory"
    },
    "question_format": "theory",
    "exam_category": "TNPSC",
    "question_text": "[#0035] The sum of all eigenvalues of an n x n square matrix A is identically equal to the _______ of matrix A.",
    "question_text_ta": "[#0035] ஒரு சதுர அணி A இன் அனைத்து ஐகன் மதிப்புகளின் கூடுதல் அந்த அணியின் _______ க்குச் சமமாகும்.",
    "options": {
      "A": "Trace (சுவடு - Tr(A))",
      "B": "Determinant (அணிக்கோவை மதிப்பு)",
      "C": "Rank (அணியின் தரம்)",
      "D": "Nullity (வெற்றுமை)"
    },
    "correct_option": "A",
    "explanation": "[Question #0035] The trace of any square matrix equals the sum of its main diagonal elements, which identically equals the algebraic sum of all its eigenvalues.",
    "explanation_ta": "[கேள்வி எண் #0035] ஒரு சதுர அணியின் சுவடு (Trace) அதன் முதன்மை மூலைவிட்ட உறுப்புகளின் கூடுதலுக்கு மற்றும் அனைத்து ஐகன் மதிப்புகளின் கூடுதலுக்குச் சமமாகும்.",
    "formula_or_law": "\\text{Tr}(A) = \\sum_{i=1}^n a_{ii} = \\sum_{i=1}^n \\lambda_i"
  },
  {
    "question_uid": "POL-CON-01-01-M1-E-0036",
    "taxonomy": {
      "subject": "Polity",
      "subject_code": "POL",
      "domain": "Constitution",
      "domain_code": "CON",
      "topic": "Binary Search Trees & Principles",
      "topic_code": "01",
      "subtopic": "Articles 14-32 & Writs",
      "subtopic_code": "01",
      "microtopic": "Binary Search Trees Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Easy",
      "exam_category": "TNPSC",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "TNPSC",
    "question_text": "[#0036] In an AVL Tree, the balance factor for every node is strictly constrained to the set _______ .",
    "question_text_ta": "[#0036] AVL மரத்தில் ஒவ்வொரு முனையின் சமநிலை காரணி (Balance Factor) எப்போதும் _______ கணத்திற்குள் இருக்க வேண்டும்.",
    "options": {
      "A": "{-1, 0, +1}",
      "B": "{0, 1, 2}",
      "C": "{-2, 0, +2}",
      "D": "{0, 1}"
    },
    "correct_option": "A",
    "explanation": "[Question #0036] An AVL tree is a self-balancing binary search tree where the height difference between left and right subtrees (Balance Factor = Height(L) - Height(R)) is strictly in {-1, 0, 1}.",
    "explanation_ta": "[கேள்வி எண் #0036] AVL மரத்தில் இடது மற்றும் வலது துணை மரங்களின் உயர வேறுபாடு எப்போதும் -1, 0, அல்லது +1 ஆக மட்டுமே இருக்க வேண்டும்.",
    "formula_or_law": "\\text{BF}(v) = h(\\text{left}(v)) - h(\\text{right}(v)) \\in \\{-1, 0, +1\\}"
  },
  {
    "question_uid": "POL-GOV-01-01-M2-M-0037",
    "taxonomy": {
      "subject": "Polity",
      "subject_code": "POL",
      "domain": "Governance",
      "domain_code": "GOV",
      "topic": "Constitution & Principles",
      "topic_code": "01",
      "subtopic": "Lok Sabha & Supreme Court",
      "subtopic_code": "01",
      "microtopic": "Constitution Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "SSC_BANK",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "SSC_BANK",
    "question_text": "[#0037] Under Article _______ of the Constitution of India, High Courts have the power to issue Writs for Fundamental Rights and other legal rights.",
    "question_text_ta": "[#0037] இந்திய அரசியலமைப்பின் சட்டப்பிரிவு _______ இன் கீழ் உயர்நீதிமன்றங்கள் நீதிப்பேராணைகளை வெளியிடும் அதிகாரம் பெற்றுள்ளன.",
    "options": {
      "A": "Article 226",
      "B": "Article 32",
      "C": "Article 14",
      "D": "Article 368"
    },
    "correct_option": "A",
    "explanation": "[Question #0037] Article 226 empowers High Courts to issue Writs for Fundamental Rights as well as ordinary legal rights, giving it a wider textual scope than Article 32.",
    "explanation_ta": "[கேள்வி எண் #0037] சட்டப்பிரிவு 226 உயர்நீதிமன்றங்களுக்கு அடிப்படை உரிமைகள் மற்றும் பிற சட்ட உரிமைகளுக்காகவும் நீதிப்பேராணைகளை வழங்கும் அதிகாரத்தை அளிக்கிறது.",
    "formula_or_law": "\\text{Article 226} \\implies \\text{High Court Writ Jurisdiction}"
  },
  {
    "question_uid": "GEO-IND-01-01-M1-E-0038",
    "taxonomy": {
      "subject": "Geography",
      "subject_code": "GEO",
      "domain": "Indian Geography",
      "domain_code": "IND",
      "topic": "Cholas & Principles",
      "topic_code": "01",
      "subtopic": "Himalayan & Peninsular Rivers",
      "subtopic_code": "01",
      "microtopic": "Cholas Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Easy",
      "exam_category": "TNPSC",
      "question_format": "assertion_reason"
    },
    "question_format": "assertion_reason",
    "exam_category": "TNPSC",
    "question_text": "[#0038] The famous Uttaramerur Inscription of Parantaka Chola I describes the _______ system of secret ballot village democracy.",
    "question_text_ta": "[#0038] முதலாம் பராந்தக சோழனின் உத்திரமேரூர் கல்வெட்டு கிராம நிர்வாகத்திற்கான _______ தேர்தல் முறையை விவரிக்கிறது.",
    "options": {
      "A": "Kudavolai (குடவோலை முறை)",
      "B": "Kadamai (கடமை முறை)",
      "C": "Variyam (வாரிய வரி விதிப்பு)",
      "D": "Kaniurimai (காணியுரிமை முறை)"
    },
    "correct_option": "A",
    "explanation": "[Question #0038] The Uttaramerur inscription details the Kudavolai secret ballot system for electing members to village committees (Variyams) with strict qualifications and disqualifications.",
    "explanation_ta": "[கேள்வி எண் #0038] உத்திரமேரூர் கல்வெட்டு கிராம சபைக் குழுக்களுக்கு (வாரியங்கள்) குடவோலை முறை மூலம் உறுப்பினர்களைத் தேர்ந்தெடுக்கும் தேர்தல் முறையை விவரிக்கிறது.",
    "formula_or_law": "\\text{Uttaramerur Inscription} \\implies \\text{Village Kudavolai Democracy}"
  },
  {
    "question_uid": "GEO-TN-01-01-M2-M-0039",
    "taxonomy": {
      "subject": "Geography",
      "subject_code": "GEO",
      "domain": "Tamil Nadu Geography",
      "domain_code": "TN",
      "topic": "Monsoons & Principles",
      "topic_code": "01",
      "subtopic": "Monsoons & Soil Types",
      "subtopic_code": "01",
      "microtopic": "Monsoons Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "TNPSC",
      "question_format": "numerical"
    },
    "question_format": "numerical",
    "exam_category": "TNPSC",
    "question_text": "[#0039] Tamil Nadu receives nearly 48% to 50% of its annual precipitation from the _______ Monsoon season.",
    "question_text_ta": "[#0039] தமிழ்நாடு தனது ஆண்டு மழையில் சுமார் 48% முதல் 50% பங்கை _______ பருவமழை காலத்தில் பெறுகிறது.",
    "options": {
      "A": "North-East Monsoon (வடகிழக்குப் பருவமழை)",
      "B": "South-West Monsoon (தென்மேற்குப் பருவமழை)",
      "C": "Pre-Monsoon Convectional Showers (கோடை மழை)",
      "D": "Winter Cyclonic Disturbances"
    },
    "correct_option": "A",
    "explanation": "[Question #0039] The North-East Monsoon accounts for nearly 48-50% of Tamil Nadu's annual precipitation as retreating winds pick up moisture across the Bay of Bengal and hit the Coromandel coast.",
    "explanation_ta": "[கேள்வி எண் #0039] தமிழ்நாடு தனது ஆண்டு மழையில் சுமார் 48-50% பங்கை வடகிழக்குப் பருவமழை மூலமே பெறுகிறது.",
    "formula_or_law": "\\text{NE Monsoon (Oct-Dec)} \\implies 48\\text{--}50\\% \\text{ TN Precipitation}"
  },
  {
    "question_uid": "APT-NUM-01-01-M1-E-0040",
    "taxonomy": {
      "subject": "Aptitude",
      "subject_code": "APT",
      "domain": "Quantitative Aptitude",
      "domain_code": "NUM",
      "topic": "Simple Interest & Principles",
      "topic_code": "01",
      "subtopic": "Simple & Compound Interest",
      "subtopic_code": "01",
      "microtopic": "Simple Interest Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Easy",
      "exam_category": "SSC_BANK",
      "question_format": "match_the_following"
    },
    "question_format": "match_the_following",
    "exam_category": "SSC_BANK",
    "question_text": "[#0040] If SI = (P * R * N) / 100, the total accumulated amount A is calculated by the formula A = _______ .",
    "question_text_ta": "[#0040] தனிவட்டி SI = (P * R * N) / 100 எனில், மொத்தத் தொகை A கணக்கிடும் சூத்திரம் A = _______ ஆகும்.",
    "options": {
      "A": "P [1 + (R * N) / 100]",
      "B": "P [1 + R / 100]^N",
      "C": "(P * R * N) / 100",
      "D": "P / [1 + (R * N) / 100]"
    },
    "correct_option": "A",
    "explanation": "[Question #0040] Total Amount A = Principal P + Simple Interest SI = P + (P * R * N) / 100 = P [1 + (R * N) / 100].",
    "explanation_ta": "[கேள்வி எண் #0040] மொத்தத் தொகை A = அசல் + தனிவட்டி = P [1 + (R * N) / 100].",
    "formula_or_law": "A = P \\left(1 + \\frac{R \\cdot N}{100}\\right)"
  },
  {
    "question_uid": "PHY-MEC-01-01-M1-M-0041",
    "taxonomy": {
      "subject": "Physics",
      "subject_code": "PHY",
      "domain": "Mechanics",
      "domain_code": "MEC",
      "topic": "Kinematics & Principles",
      "topic_code": "01",
      "subtopic": "Motion in 2D & Projectiles",
      "subtopic_code": "01",
      "microtopic": "Kinematics Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Medium",
      "exam_category": "NEET_JEE",
      "question_format": "pyq"
    },
    "question_format": "pyq",
    "exam_category": "NEET_JEE",
    "question_text": "[#0041] In two-dimensional projectile motion without air resistance, the horizontal velocity component remains _______ throughout the flight.",
    "question_text_ta": "[#0041] காற்று உராய்வு இல்லாத இருபரிமாண எறிபொருள் இயக்கத்தில் கிடைமட்ட திசைவேகக் கூறு இயக்கம் முழுவதும் _______ ஆக இருக்கும்.",
    "options": {
      "A": "Constant (மாறிலி)",
      "B": "Zero at highest point (உச்சியில் சுழி)",
      "C": "Linearly increasing (நேர்கோட்டில் அதிகரிக்கும்)",
      "D": "Exponentially decaying (அதிவேகமாக குறையும்)"
    },
    "correct_option": "A",
    "explanation": "[Question #0041] Since gravity acts solely vertically downward (a_y = -g), horizontal acceleration a_x = 0, keeping horizontal velocity v_x = u cos θ strictly constant.",
    "explanation_ta": "[கேள்வி எண் #0041] புவியீர்ப்பு விசை செங்குத்தாக மட்டுமே செயல்படுவதால் கிடைமட்ட முடுக்கம் a_x = 0, எனவே v_x மாறிலியாக இருக்கும்.",
    "formula_or_law": "v_x = u \\cos\\theta = \\text{constant}"
  },
  {
    "question_uid": "PHY-ELE-01-01-M2-E-0042",
    "taxonomy": {
      "subject": "Physics",
      "subject_code": "PHY",
      "domain": "Electrodynamics",
      "domain_code": "ELE",
      "topic": "Ohm Law & Principles",
      "topic_code": "01",
      "subtopic": "Ohm Law & Kirchhoff Rules",
      "subtopic_code": "01",
      "microtopic": "Ohm Law Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Easy",
      "exam_category": "NEET_JEE",
      "question_format": "theory"
    },
    "question_format": "theory",
    "exam_category": "NEET_JEE",
    "question_text": "[#0042] According to microscopic Ohm's law, the electrical conductivity σ is given by the formula _______ .",
    "question_text_ta": "[#0042] நுண்ணோக்கி ஓம் விதியின்படி ஒரு கடத்தியின் மின்கடத்துத்திறன் σ சமன்பாடு _______ ஆகும்.",
    "options": {
      "A": "σ = (n e² τ) / m",
      "B": "σ = (m e² τ) / n",
      "C": "σ = (n e τ) / m²",
      "D": "σ = (n² e τ) / m"
    },
    "correct_option": "A",
    "explanation": "[Question #0042] Conductivity σ is derived from J = n e v_d where v_d = (e E τ) / m, leading to J = (n e² τ / m) E = σ E.",
    "explanation_ta": "[கேள்வி எண் #0042] மின்கடத்துத்திறன் σ = (n e² τ) / m ஆகும்.",
    "formula_or_law": "\\sigma = \\frac{n e^2 \\tau}{m}"
  },
  {
    "question_uid": "PHY-OPT-01-01-M3-H-0043",
    "taxonomy": {
      "subject": "Physics",
      "subject_code": "PHY",
      "domain": "Optics",
      "domain_code": "OPT",
      "topic": "Chemical Kinetics & Principles",
      "topic_code": "01",
      "subtopic": "Interference & Diffraction",
      "subtopic_code": "01",
      "microtopic": "Chemical Kinetics Core Rule",
      "microtopic_code": "M3",
      "difficulty": "Hard",
      "exam_category": "SCHOOL_K12",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "SCHOOL_K12",
    "question_text": "[#0043] For a first-order chemical reaction, the half-life period t_1/2 is _______ of initial reactant concentration.",
    "question_text_ta": "[#0043] ஒரு முதல் வகை வேதிவினைக்கு அரைவாழ்வு காலம் தொடக்கச் செறிவை _______ .",
    "options": {
      "A": "Independent (சார்ந்திருக்காது - t_1/2 = 0.693 / k)",
      "B": "Directly proportional (நேர்விகிதத்தில் சார்ந்தது)",
      "C": "Inversely proportional (எதிர்விகிதத்தில் சார்ந்தது)",
      "D": "Exponentially dependent (அதிவேகமாக சார்ந்தது)"
    },
    "correct_option": "A",
    "explanation": "[Question #0043] For first order: k = (2.303 / t) log([A]_0 / [A]). At t = t_1/2, [A] = [A]_0 / 2, giving t_1/2 = ln(2) / k = 0.693 / k.",
    "explanation_ta": "[கேள்வி எண் #0043] முதல் வகை வினைக்கு அரைவாழ்வு காலம் தொடக்கச் செறிவைச் சார்ந்திருக்காது: t_1/2 = 0.693 / k.",
    "formula_or_law": "t_{1/2} = \\frac{\\ln 2}{k} = \\frac{0.693}{k}"
  },
  {
    "question_uid": "CHE-ORG-01-01-M1-H-0044",
    "taxonomy": {
      "subject": "Chemistry",
      "subject_code": "CHE",
      "domain": "Organic Chemistry",
      "domain_code": "ORG",
      "topic": "Photosynthesis & Principles",
      "topic_code": "01",
      "subtopic": "Electrophilic & Nucleophilic",
      "subtopic_code": "01",
      "microtopic": "Photosynthesis Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Hard",
      "exam_category": "NEET_JEE",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "NEET_JEE",
    "question_text": "[#0044] During photosynthesis in chloroplasts, photolysis of water occurs at the _______ complex of PS II.",
    "question_text_ta": "[#0044] ஒளிச்சேர்க்கையின் போது நீர் மூலக்கூறு ஒளிச்சிதைவு PS II இன் _______ வளாகத்தில் நடைபெறுகிறது.",
    "options": {
      "A": "Oxygen-Evolving Complex (OEC - ஆக்ஸிஜன் வெளிப்படுத்தும் மையம்)",
      "B": "ATP Synthase CF0-CF1 complex",
      "C": "Photosystem I reaction center P700",
      "D": "Cytochrome b6f complex"
    },
    "correct_option": "A",
    "explanation": "[Question #0044] Water photolysis (2H2O -> 4H+ + 4e- + O2) is catalyzed by the manganese-containing oxygen-evolving complex located on the luminal side of PS II.",
    "explanation_ta": "[கேள்வி எண் #0044] நீர் மூலக்கூறு சிதைவு PS II இன் ஆக்ஸிஜன் வெளிப்படுத்தும் மையத்தால் வினையூக்கப்படுகிறது.",
    "formula_or_law": "2\\text{H}_2\\text{O} \\xrightarrow{h\\nu, \\text{PS II}} 4\\text{H}^+ + 4e^- + \\text{O}_2"
  },
  {
    "question_uid": "CHE-INO-01-01-M2-M-0045",
    "taxonomy": {
      "subject": "Chemistry",
      "subject_code": "CHE",
      "domain": "Inorganic Chemistry",
      "domain_code": "INO",
      "topic": "Matrices & Principles",
      "topic_code": "01",
      "subtopic": "Ligand Field & Isomerism",
      "subtopic_code": "01",
      "microtopic": "Matrices Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "NEET_JEE",
      "question_format": "assertion_reason"
    },
    "question_format": "assertion_reason",
    "exam_category": "NEET_JEE",
    "question_text": "[#0045] The sum of all eigenvalues of an n x n square matrix A is identically equal to the _______ of matrix A.",
    "question_text_ta": "[#0045] ஒரு சதுர அணி A இன் அனைத்து ஐகன் மதிப்புகளின் கூடுதல் அந்த அணியின் _______ க்குச் சமமாகும்.",
    "options": {
      "A": "Trace (சுவடு - Tr(A))",
      "B": "Determinant (அணிக்கோவை மதிப்பு)",
      "C": "Rank (அணியின் தரம்)",
      "D": "Nullity (வெற்றுமை)"
    },
    "correct_option": "A",
    "explanation": "[Question #0045] The trace of any square matrix equals the sum of its main diagonal elements, which identically equals the algebraic sum of all its eigenvalues.",
    "explanation_ta": "[கேள்வி எண் #0045] ஒரு சதுர அணியின் சுவடு (Trace) அதன் முதன்மை மூலைவிட்ட உறுப்புகளின் கூடுதலுக்கு மற்றும் அனைத்து ஐகன் மதிப்புகளின் கூடுதலுக்குச் சமமாகும்.",
    "formula_or_law": "\\text{Tr}(A) = \\sum_{i=1}^n a_{ii} = \\sum_{i=1}^n \\lambda_i"
  },
  {
    "question_uid": "CHE-PHY-01-01-M3-M-0046",
    "taxonomy": {
      "subject": "Chemistry",
      "subject_code": "CHE",
      "domain": "Physical Chemistry",
      "domain_code": "PHY",
      "topic": "Binary Search Trees & Principles",
      "topic_code": "01",
      "subtopic": "Rate Laws & Arrhenius",
      "subtopic_code": "01",
      "microtopic": "Binary Search Trees Core Rule",
      "microtopic_code": "M3",
      "difficulty": "Medium",
      "exam_category": "SCHOOL_K12",
      "question_format": "numerical"
    },
    "question_format": "numerical",
    "exam_category": "SCHOOL_K12",
    "question_text": "[#0046] In an AVL Tree, the balance factor for every node is strictly constrained to the set _______ .",
    "question_text_ta": "[#0046] AVL மரத்தில் ஒவ்வொரு முனையின் சமநிலை காரணி (Balance Factor) எப்போதும் _______ கணத்திற்குள் இருக்க வேண்டும்.",
    "options": {
      "A": "{-1, 0, +1}",
      "B": "{0, 1, 2}",
      "C": "{-2, 0, +2}",
      "D": "{0, 1}"
    },
    "correct_option": "A",
    "explanation": "[Question #0046] An AVL tree is a self-balancing binary search tree where the height difference between left and right subtrees (Balance Factor = Height(L) - Height(R)) is strictly in {-1, 0, 1}.",
    "explanation_ta": "[கேள்வி எண் #0046] AVL மரத்தில் இடது மற்றும் வலது துணை மரங்களின் உயர வேறுபாடு எப்போதும் -1, 0, அல்லது +1 ஆக மட்டுமே இருக்க வேண்டும்.",
    "formula_or_law": "\\text{BF}(v) = h(\\text{left}(v)) - h(\\text{right}(v)) \\in \\{-1, 0, +1\\}"
  },
  {
    "question_uid": "BIO-BOT-01-01-M1-M-0047",
    "taxonomy": {
      "subject": "Biology",
      "subject_code": "BIO",
      "domain": "Botany",
      "domain_code": "BOT",
      "topic": "Constitution & Principles",
      "topic_code": "01",
      "subtopic": "Photosynthesis C3 & C4",
      "subtopic_code": "01",
      "microtopic": "Constitution Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Medium",
      "exam_category": "NEET_JEE",
      "question_format": "match_the_following"
    },
    "question_format": "match_the_following",
    "exam_category": "NEET_JEE",
    "question_text": "[#0047] Under Article _______ of the Constitution of India, High Courts have the power to issue Writs for Fundamental Rights and other legal rights.",
    "question_text_ta": "[#0047] இந்திய அரசியலமைப்பின் சட்டப்பிரிவு _______ இன் கீழ் உயர்நீதிமன்றங்கள் நீதிப்பேராணைகளை வெளியிடும் அதிகாரம் பெற்றுள்ளன.",
    "options": {
      "A": "Article 226",
      "B": "Article 32",
      "C": "Article 14",
      "D": "Article 368"
    },
    "correct_option": "A",
    "explanation": "[Question #0047] Article 226 empowers High Courts to issue Writs for Fundamental Rights as well as ordinary legal rights, giving it a wider textual scope than Article 32.",
    "explanation_ta": "[கேள்வி எண் #0047] சட்டப்பிரிவு 226 உயர்நீதிமன்றங்களுக்கு அடிப்படை உரிமைகள் மற்றும் பிற சட்ட உரிமைகளுக்காகவும் நீதிப்பேராணைகளை வழங்கும் அதிகாரத்தை அளிக்கிறது.",
    "formula_or_law": "\\text{Article 226} \\implies \\text{High Court Writ Jurisdiction}"
  },
  {
    "question_uid": "BIO-ZOO-01-01-M2-E-0048",
    "taxonomy": {
      "subject": "Biology",
      "subject_code": "BIO",
      "domain": "Zoology",
      "domain_code": "ZOO",
      "topic": "Cholas & Principles",
      "topic_code": "01",
      "subtopic": "Endocrine & Neural System",
      "subtopic_code": "01",
      "microtopic": "Cholas Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Easy",
      "exam_category": "NEET_JEE",
      "question_format": "pyq"
    },
    "question_format": "pyq",
    "exam_category": "NEET_JEE",
    "question_text": "[#0048] The famous Uttaramerur Inscription of Parantaka Chola I describes the _______ system of secret ballot village democracy.",
    "question_text_ta": "[#0048] முதலாம் பராந்தக சோழனின் உத்திரமேரூர் கல்வெட்டு கிராம நிர்வாகத்திற்கான _______ தேர்தல் முறையை விவரிக்கிறது.",
    "options": {
      "A": "Kudavolai (குடவோலை முறை)",
      "B": "Kadamai (கடமை முறை)",
      "C": "Variyam (வாரிய வரி விதிப்பு)",
      "D": "Kaniurimai (காணியுரிமை முறை)"
    },
    "correct_option": "A",
    "explanation": "[Question #0048] The Uttaramerur inscription details the Kudavolai secret ballot system for electing members to village committees (Variyams) with strict qualifications and disqualifications.",
    "explanation_ta": "[கேள்வி எண் #0048] உத்திரமேரூர் கல்வெட்டு கிராம சபைக் குழுக்களுக்கு (வாரியங்கள்) குடவோலை முறை மூலம் உறுப்பினர்களைத் தேர்ந்தெடுக்கும் தேர்தல் முறையை விவரிக்கிறது.",
    "formula_or_law": "\\text{Uttaramerur Inscription} \\implies \\text{Village Kudavolai Democracy}"
  },
  {
    "question_uid": "BIO-GEN-01-01-M3-H-0049",
    "taxonomy": {
      "subject": "Biology",
      "subject_code": "BIO",
      "domain": "Genetics",
      "domain_code": "GEN",
      "topic": "Monsoons & Principles",
      "topic_code": "01",
      "subtopic": "DNA Replication & Translation",
      "subtopic_code": "01",
      "microtopic": "Monsoons Core Rule",
      "microtopic_code": "M3",
      "difficulty": "Hard",
      "exam_category": "SCHOOL_K12",
      "question_format": "theory"
    },
    "question_format": "theory",
    "exam_category": "SCHOOL_K12",
    "question_text": "[#0049] Tamil Nadu receives nearly 48% to 50% of its annual precipitation from the _______ Monsoon season.",
    "question_text_ta": "[#0049] தமிழ்நாடு தனது ஆண்டு மழையில் சுமார் 48% முதல் 50% பங்கை _______ பருவமழை காலத்தில் பெறுகிறது.",
    "options": {
      "A": "North-East Monsoon (வடகிழக்குப் பருவமழை)",
      "B": "South-West Monsoon (தென்மேற்குப் பருவமழை)",
      "C": "Pre-Monsoon Convectional Showers (கோடை மழை)",
      "D": "Winter Cyclonic Disturbances"
    },
    "correct_option": "A",
    "explanation": "[Question #0049] The North-East Monsoon accounts for nearly 48-50% of Tamil Nadu's annual precipitation as retreating winds pick up moisture across the Bay of Bengal and hit the Coromandel coast.",
    "explanation_ta": "[கேள்வி எண் #0049] தமிழ்நாடு தனது ஆண்டு மழையில் சுமார் 48-50% பங்கை வடகிழக்குப் பருவமழை மூலமே பெறுகிறது.",
    "formula_or_law": "\\text{NE Monsoon (Oct-Dec)} \\implies 48\\text{--}50\\% \\text{ TN Precipitation}"
  },
  {
    "question_uid": "MAT-CAL-01-01-M1-H-0050",
    "taxonomy": {
      "subject": "Mathematics",
      "subject_code": "MAT",
      "domain": "Calculus",
      "domain_code": "CAL",
      "topic": "Simple Interest & Principles",
      "topic_code": "01",
      "subtopic": "Definite Integrals & Limits",
      "subtopic_code": "01",
      "microtopic": "Simple Interest Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Hard",
      "exam_category": "NEET_JEE",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "NEET_JEE",
    "question_text": "[#0050] If SI = (P * R * N) / 100, the total accumulated amount A is calculated by the formula A = _______ .",
    "question_text_ta": "[#0050] தனிவட்டி SI = (P * R * N) / 100 எனில், மொத்தத் தொகை A கணக்கிடும் சூத்திரம் A = _______ ஆகும்.",
    "options": {
      "A": "P [1 + (R * N) / 100]",
      "B": "P [1 + R / 100]^N",
      "C": "(P * R * N) / 100",
      "D": "P / [1 + (R * N) / 100]"
    },
    "correct_option": "A",
    "explanation": "[Question #0050] Total Amount A = Principal P + Simple Interest SI = P + (P * R * N) / 100 = P [1 + (R * N) / 100].",
    "explanation_ta": "[கேள்வி எண் #0050] மொத்தத் தொகை A = அசல் + தனிவட்டி = P [1 + (R * N) / 100].",
    "formula_or_law": "A = P \\left(1 + \\frac{R \\cdot N}{100}\\right)"
  },
  {
    "question_uid": "MAT-ALG-01-01-M2-M-0051",
    "taxonomy": {
      "subject": "Mathematics",
      "subject_code": "MAT",
      "domain": "Algebra",
      "domain_code": "ALG",
      "topic": "Kinematics & Principles",
      "topic_code": "01",
      "subtopic": "Eigenvalues & Rank",
      "subtopic_code": "01",
      "microtopic": "Kinematics Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "SCHOOL_K12",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "SCHOOL_K12",
    "question_text": "[#0051] In two-dimensional projectile motion without air resistance, the horizontal velocity component remains _______ throughout the flight.",
    "question_text_ta": "[#0051] காற்று உராய்வு இல்லாத இருபரிமாண எறிபொருள் இயக்கத்தில் கிடைமட்ட திசைவேகக் கூறு இயக்கம் முழுவதும் _______ ஆக இருக்கும்.",
    "options": {
      "A": "Constant (மாறிலி)",
      "B": "Zero at highest point (உச்சியில் சுழி)",
      "C": "Linearly increasing (நேர்கோட்டில் அதிகரிக்கும்)",
      "D": "Exponentially decaying (அதிவேகமாக குறையும்)"
    },
    "correct_option": "A",
    "explanation": "[Question #0051] Since gravity acts solely vertically downward (a_y = -g), horizontal acceleration a_x = 0, keeping horizontal velocity v_x = u cos θ strictly constant.",
    "explanation_ta": "[கேள்வி எண் #0051] புவியீர்ப்பு விசை செங்குத்தாக மட்டுமே செயல்படுவதால் கிடைமட்ட முடுக்கம் a_x = 0, எனவே v_x மாறிலியாக இருக்கும்.",
    "formula_or_law": "v_x = u \\cos\\theta = \\text{constant}"
  },
  {
    "question_uid": "CS-DSA-01-01-M1-M-0052",
    "taxonomy": {
      "subject": "Computer Science",
      "subject_code": "CS",
      "domain": "Algorithms",
      "domain_code": "DSA",
      "topic": "Ohm Law & Principles",
      "topic_code": "01",
      "subtopic": "Binary Search Trees & AVL",
      "subtopic_code": "01",
      "microtopic": "Ohm Law Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Medium",
      "exam_category": "SSC_BANK",
      "question_format": "assertion_reason"
    },
    "question_format": "assertion_reason",
    "exam_category": "SSC_BANK",
    "question_text": "[#0052] According to microscopic Ohm's law, the electrical conductivity σ is given by the formula _______ .",
    "question_text_ta": "[#0052] நுண்ணோக்கி ஓம் விதியின்படி ஒரு கடத்தியின் மின்கடத்துத்திறன் σ சமன்பாடு _______ ஆகும்.",
    "options": {
      "A": "σ = (n e² τ) / m",
      "B": "σ = (m e² τ) / n",
      "C": "σ = (n e τ) / m²",
      "D": "σ = (n² e τ) / m"
    },
    "correct_option": "A",
    "explanation": "[Question #0052] Conductivity σ is derived from J = n e v_d where v_d = (e E τ) / m, leading to J = (n e² τ / m) E = σ E.",
    "explanation_ta": "[கேள்வி எண் #0052] மின்கடத்துத்திறன் σ = (n e² τ) / m ஆகும்.",
    "formula_or_law": "\\sigma = \\frac{n e^2 \\tau}{m}"
  },
  {
    "question_uid": "CS-DBMS-01-01-M2-E-0053",
    "taxonomy": {
      "subject": "Computer Science",
      "subject_code": "CS",
      "domain": "Databases",
      "domain_code": "DBMS",
      "topic": "Chemical Kinetics & Principles",
      "topic_code": "01",
      "subtopic": "Normalization & Indexing",
      "subtopic_code": "01",
      "microtopic": "Chemical Kinetics Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Easy",
      "exam_category": "SSC_BANK",
      "question_format": "numerical"
    },
    "question_format": "numerical",
    "exam_category": "SSC_BANK",
    "question_text": "[#0053] For a first-order chemical reaction, the half-life period t_1/2 is _______ of initial reactant concentration.",
    "question_text_ta": "[#0053] ஒரு முதல் வகை வேதிவினைக்கு அரைவாழ்வு காலம் தொடக்கச் செறிவை _______ .",
    "options": {
      "A": "Independent (சார்ந்திருக்காது - t_1/2 = 0.693 / k)",
      "B": "Directly proportional (நேர்விகிதத்தில் சார்ந்தது)",
      "C": "Inversely proportional (எதிர்விகிதத்தில் சார்ந்தது)",
      "D": "Exponentially dependent (அதிவேகமாக சார்ந்தது)"
    },
    "correct_option": "A",
    "explanation": "[Question #0053] For first order: k = (2.303 / t) log([A]_0 / [A]). At t = t_1/2, [A] = [A]_0 / 2, giving t_1/2 = ln(2) / k = 0.693 / k.",
    "explanation_ta": "[கேள்வி எண் #0053] முதல் வகை வினைக்கு அரைவாழ்வு காலம் தொடக்கச் செறிவைச் சார்ந்திருக்காது: t_1/2 = 0.693 / k.",
    "formula_or_law": "t_{1/2} = \\frac{\\ln 2}{k} = \\frac{0.693}{k}"
  },
  {
    "question_uid": "HIS-TN-01-01-M1-E-0054",
    "taxonomy": {
      "subject": "History",
      "subject_code": "HIS",
      "domain": "Tamil Nadu History",
      "domain_code": "TN",
      "topic": "Photosynthesis & Principles",
      "topic_code": "01",
      "subtopic": "Cholas, Pandyas & Cheras",
      "subtopic_code": "01",
      "microtopic": "Photosynthesis Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Easy",
      "exam_category": "TNPSC",
      "question_format": "match_the_following"
    },
    "question_format": "match_the_following",
    "exam_category": "TNPSC",
    "question_text": "[#0054] During photosynthesis in chloroplasts, photolysis of water occurs at the _______ complex of PS II.",
    "question_text_ta": "[#0054] ஒளிச்சேர்க்கையின் போது நீர் மூலக்கூறு ஒளிச்சிதைவு PS II இன் _______ வளாகத்தில் நடைபெறுகிறது.",
    "options": {
      "A": "Oxygen-Evolving Complex (OEC - ஆக்ஸிஜன் வெளிப்படுத்தும் மையம்)",
      "B": "ATP Synthase CF0-CF1 complex",
      "C": "Photosystem I reaction center P700",
      "D": "Cytochrome b6f complex"
    },
    "correct_option": "A",
    "explanation": "[Question #0054] Water photolysis (2H2O -> 4H+ + 4e- + O2) is catalyzed by the manganese-containing oxygen-evolving complex located on the luminal side of PS II.",
    "explanation_ta": "[கேள்வி எண் #0054] நீர் மூலக்கூறு சிதைவு PS II இன் ஆக்ஸிஜன் வெளிப்படுத்தும் மையத்தால் வினையூக்கப்படுகிறது.",
    "formula_or_law": "2\\text{H}_2\\text{O} \\xrightarrow{h\\nu, \\text{PS II}} 4\\text{H}^+ + 4e^- + \\text{O}_2"
  },
  {
    "question_uid": "HIS-MOD-01-01-M2-M-0055",
    "taxonomy": {
      "subject": "History",
      "subject_code": "HIS",
      "domain": "Modern India",
      "domain_code": "MOD",
      "topic": "Matrices & Principles",
      "topic_code": "01",
      "subtopic": "Non-Cooperation & Civil Disobedience",
      "subtopic_code": "01",
      "microtopic": "Matrices Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "TNPSC",
      "question_format": "pyq"
    },
    "question_format": "pyq",
    "exam_category": "TNPSC",
    "question_text": "[#0055] The sum of all eigenvalues of an n x n square matrix A is identically equal to the _______ of matrix A.",
    "question_text_ta": "[#0055] ஒரு சதுர அணி A இன் அனைத்து ஐகன் மதிப்புகளின் கூடுதல் அந்த அணியின் _______ க்குச் சமமாகும்.",
    "options": {
      "A": "Trace (சுவடு - Tr(A))",
      "B": "Determinant (அணிக்கோவை மதிப்பு)",
      "C": "Rank (அணியின் தரம்)",
      "D": "Nullity (வெற்றுமை)"
    },
    "correct_option": "A",
    "explanation": "[Question #0055] The trace of any square matrix equals the sum of its main diagonal elements, which identically equals the algebraic sum of all its eigenvalues.",
    "explanation_ta": "[கேள்வி எண் #0055] ஒரு சதுர அணியின் சுவடு (Trace) அதன் முதன்மை மூலைவிட்ட உறுப்புகளின் கூடுதலுக்கு மற்றும் அனைத்து ஐகன் மதிப்புகளின் கூடுதலுக்குச் சமமாகும்.",
    "formula_or_law": "\\text{Tr}(A) = \\sum_{i=1}^n a_{ii} = \\sum_{i=1}^n \\lambda_i"
  },
  {
    "question_uid": "POL-CON-01-01-M1-E-0056",
    "taxonomy": {
      "subject": "Polity",
      "subject_code": "POL",
      "domain": "Constitution",
      "domain_code": "CON",
      "topic": "Binary Search Trees & Principles",
      "topic_code": "01",
      "subtopic": "Articles 14-32 & Writs",
      "subtopic_code": "01",
      "microtopic": "Binary Search Trees Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Easy",
      "exam_category": "TNPSC",
      "question_format": "theory"
    },
    "question_format": "theory",
    "exam_category": "TNPSC",
    "question_text": "[#0056] In an AVL Tree, the balance factor for every node is strictly constrained to the set _______ .",
    "question_text_ta": "[#0056] AVL மரத்தில் ஒவ்வொரு முனையின் சமநிலை காரணி (Balance Factor) எப்போதும் _______ கணத்திற்குள் இருக்க வேண்டும்.",
    "options": {
      "A": "{-1, 0, +1}",
      "B": "{0, 1, 2}",
      "C": "{-2, 0, +2}",
      "D": "{0, 1}"
    },
    "correct_option": "A",
    "explanation": "[Question #0056] An AVL tree is a self-balancing binary search tree where the height difference between left and right subtrees (Balance Factor = Height(L) - Height(R)) is strictly in {-1, 0, 1}.",
    "explanation_ta": "[கேள்வி எண் #0056] AVL மரத்தில் இடது மற்றும் வலது துணை மரங்களின் உயர வேறுபாடு எப்போதும் -1, 0, அல்லது +1 ஆக மட்டுமே இருக்க வேண்டும்.",
    "formula_or_law": "\\text{BF}(v) = h(\\text{left}(v)) - h(\\text{right}(v)) \\in \\{-1, 0, +1\\}"
  },
  {
    "question_uid": "POL-GOV-01-01-M2-M-0057",
    "taxonomy": {
      "subject": "Polity",
      "subject_code": "POL",
      "domain": "Governance",
      "domain_code": "GOV",
      "topic": "Constitution & Principles",
      "topic_code": "01",
      "subtopic": "Lok Sabha & Supreme Court",
      "subtopic_code": "01",
      "microtopic": "Constitution Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "SSC_BANK",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "SSC_BANK",
    "question_text": "[#0057] Under Article _______ of the Constitution of India, High Courts have the power to issue Writs for Fundamental Rights and other legal rights.",
    "question_text_ta": "[#0057] இந்திய அரசியலமைப்பின் சட்டப்பிரிவு _______ இன் கீழ் உயர்நீதிமன்றங்கள் நீதிப்பேராணைகளை வெளியிடும் அதிகாரம் பெற்றுள்ளன.",
    "options": {
      "A": "Article 226",
      "B": "Article 32",
      "C": "Article 14",
      "D": "Article 368"
    },
    "correct_option": "A",
    "explanation": "[Question #0057] Article 226 empowers High Courts to issue Writs for Fundamental Rights as well as ordinary legal rights, giving it a wider textual scope than Article 32.",
    "explanation_ta": "[கேள்வி எண் #0057] சட்டப்பிரிவு 226 உயர்நீதிமன்றங்களுக்கு அடிப்படை உரிமைகள் மற்றும் பிற சட்ட உரிமைகளுக்காகவும் நீதிப்பேராணைகளை வழங்கும் அதிகாரத்தை அளிக்கிறது.",
    "formula_or_law": "\\text{Article 226} \\implies \\text{High Court Writ Jurisdiction}"
  },
  {
    "question_uid": "GEO-IND-01-01-M1-E-0058",
    "taxonomy": {
      "subject": "Geography",
      "subject_code": "GEO",
      "domain": "Indian Geography",
      "domain_code": "IND",
      "topic": "Cholas & Principles",
      "topic_code": "01",
      "subtopic": "Himalayan & Peninsular Rivers",
      "subtopic_code": "01",
      "microtopic": "Cholas Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Easy",
      "exam_category": "TNPSC",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "TNPSC",
    "question_text": "[#0058] The famous Uttaramerur Inscription of Parantaka Chola I describes the _______ system of secret ballot village democracy.",
    "question_text_ta": "[#0058] முதலாம் பராந்தக சோழனின் உத்திரமேரூர் கல்வெட்டு கிராம நிர்வாகத்திற்கான _______ தேர்தல் முறையை விவரிக்கிறது.",
    "options": {
      "A": "Kudavolai (குடவோலை முறை)",
      "B": "Kadamai (கடமை முறை)",
      "C": "Variyam (வாரிய வரி விதிப்பு)",
      "D": "Kaniurimai (காணியுரிமை முறை)"
    },
    "correct_option": "A",
    "explanation": "[Question #0058] The Uttaramerur inscription details the Kudavolai secret ballot system for electing members to village committees (Variyams) with strict qualifications and disqualifications.",
    "explanation_ta": "[கேள்வி எண் #0058] உத்திரமேரூர் கல்வெட்டு கிராம சபைக் குழுக்களுக்கு (வாரியங்கள்) குடவோலை முறை மூலம் உறுப்பினர்களைத் தேர்ந்தெடுக்கும் தேர்தல் முறையை விவரிக்கிறது.",
    "formula_or_law": "\\text{Uttaramerur Inscription} \\implies \\text{Village Kudavolai Democracy}"
  },
  {
    "question_uid": "GEO-TN-01-01-M2-M-0059",
    "taxonomy": {
      "subject": "Geography",
      "subject_code": "GEO",
      "domain": "Tamil Nadu Geography",
      "domain_code": "TN",
      "topic": "Monsoons & Principles",
      "topic_code": "01",
      "subtopic": "Monsoons & Soil Types",
      "subtopic_code": "01",
      "microtopic": "Monsoons Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "TNPSC",
      "question_format": "assertion_reason"
    },
    "question_format": "assertion_reason",
    "exam_category": "TNPSC",
    "question_text": "[#0059] Tamil Nadu receives nearly 48% to 50% of its annual precipitation from the _______ Monsoon season.",
    "question_text_ta": "[#0059] தமிழ்நாடு தனது ஆண்டு மழையில் சுமார் 48% முதல் 50% பங்கை _______ பருவமழை காலத்தில் பெறுகிறது.",
    "options": {
      "A": "North-East Monsoon (வடகிழக்குப் பருவமழை)",
      "B": "South-West Monsoon (தென்மேற்குப் பருவமழை)",
      "C": "Pre-Monsoon Convectional Showers (கோடை மழை)",
      "D": "Winter Cyclonic Disturbances"
    },
    "correct_option": "A",
    "explanation": "[Question #0059] The North-East Monsoon accounts for nearly 48-50% of Tamil Nadu's annual precipitation as retreating winds pick up moisture across the Bay of Bengal and hit the Coromandel coast.",
    "explanation_ta": "[கேள்வி எண் #0059] தமிழ்நாடு தனது ஆண்டு மழையில் சுமார் 48-50% பங்கை வடகிழக்குப் பருவமழை மூலமே பெறுகிறது.",
    "formula_or_law": "\\text{NE Monsoon (Oct-Dec)} \\implies 48\\text{--}50\\% \\text{ TN Precipitation}"
  },
  {
    "question_uid": "APT-NUM-01-01-M1-E-0060",
    "taxonomy": {
      "subject": "Aptitude",
      "subject_code": "APT",
      "domain": "Quantitative Aptitude",
      "domain_code": "NUM",
      "topic": "Simple Interest & Principles",
      "topic_code": "01",
      "subtopic": "Simple & Compound Interest",
      "subtopic_code": "01",
      "microtopic": "Simple Interest Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Easy",
      "exam_category": "SSC_BANK",
      "question_format": "numerical"
    },
    "question_format": "numerical",
    "exam_category": "SSC_BANK",
    "question_text": "[#0060] If SI = (P * R * N) / 100, the total accumulated amount A is calculated by the formula A = _______ .",
    "question_text_ta": "[#0060] தனிவட்டி SI = (P * R * N) / 100 எனில், மொத்தத் தொகை A கணக்கிடும் சூத்திரம் A = _______ ஆகும்.",
    "options": {
      "A": "P [1 + (R * N) / 100]",
      "B": "P [1 + R / 100]^N",
      "C": "(P * R * N) / 100",
      "D": "P / [1 + (R * N) / 100]"
    },
    "correct_option": "A",
    "explanation": "[Question #0060] Total Amount A = Principal P + Simple Interest SI = P + (P * R * N) / 100 = P [1 + (R * N) / 100].",
    "explanation_ta": "[கேள்வி எண் #0060] மொத்தத் தொகை A = அசல் + தனிவட்டி = P [1 + (R * N) / 100].",
    "formula_or_law": "A = P \\left(1 + \\frac{R \\cdot N}{100}\\right)"
  },
  {
    "question_uid": "PHY-MEC-01-01-M1-M-0061",
    "taxonomy": {
      "subject": "Physics",
      "subject_code": "PHY",
      "domain": "Mechanics",
      "domain_code": "MEC",
      "topic": "Kinematics & Principles",
      "topic_code": "01",
      "subtopic": "Motion in 2D & Projectiles",
      "subtopic_code": "01",
      "microtopic": "Kinematics Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Medium",
      "exam_category": "NEET_JEE",
      "question_format": "match_the_following"
    },
    "question_format": "match_the_following",
    "exam_category": "NEET_JEE",
    "question_text": "[#0061] In two-dimensional projectile motion without air resistance, the horizontal velocity component remains _______ throughout the flight.",
    "question_text_ta": "[#0061] காற்று உராய்வு இல்லாத இருபரிமாண எறிபொருள் இயக்கத்தில் கிடைமட்ட திசைவேகக் கூறு இயக்கம் முழுவதும் _______ ஆக இருக்கும்.",
    "options": {
      "A": "Constant (மாறிலி)",
      "B": "Zero at highest point (உச்சியில் சுழி)",
      "C": "Linearly increasing (நேர்கோட்டில் அதிகரிக்கும்)",
      "D": "Exponentially decaying (அதிவேகமாக குறையும்)"
    },
    "correct_option": "A",
    "explanation": "[Question #0061] Since gravity acts solely vertically downward (a_y = -g), horizontal acceleration a_x = 0, keeping horizontal velocity v_x = u cos θ strictly constant.",
    "explanation_ta": "[கேள்வி எண் #0061] புவியீர்ப்பு விசை செங்குத்தாக மட்டுமே செயல்படுவதால் கிடைமட்ட முடுக்கம் a_x = 0, எனவே v_x மாறிலியாக இருக்கும்.",
    "formula_or_law": "v_x = u \\cos\\theta = \\text{constant}"
  },
  {
    "question_uid": "PHY-ELE-01-01-M2-E-0062",
    "taxonomy": {
      "subject": "Physics",
      "subject_code": "PHY",
      "domain": "Electrodynamics",
      "domain_code": "ELE",
      "topic": "Ohm Law & Principles",
      "topic_code": "01",
      "subtopic": "Ohm Law & Kirchhoff Rules",
      "subtopic_code": "01",
      "microtopic": "Ohm Law Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Easy",
      "exam_category": "NEET_JEE",
      "question_format": "pyq"
    },
    "question_format": "pyq",
    "exam_category": "NEET_JEE",
    "question_text": "[#0062] According to microscopic Ohm's law, the electrical conductivity σ is given by the formula _______ .",
    "question_text_ta": "[#0062] நுண்ணோக்கி ஓம் விதியின்படி ஒரு கடத்தியின் மின்கடத்துத்திறன் σ சமன்பாடு _______ ஆகும்.",
    "options": {
      "A": "σ = (n e² τ) / m",
      "B": "σ = (m e² τ) / n",
      "C": "σ = (n e τ) / m²",
      "D": "σ = (n² e τ) / m"
    },
    "correct_option": "A",
    "explanation": "[Question #0062] Conductivity σ is derived from J = n e v_d where v_d = (e E τ) / m, leading to J = (n e² τ / m) E = σ E.",
    "explanation_ta": "[கேள்வி எண் #0062] மின்கடத்துத்திறன் σ = (n e² τ) / m ஆகும்.",
    "formula_or_law": "\\sigma = \\frac{n e^2 \\tau}{m}"
  },
  {
    "question_uid": "PHY-OPT-01-01-M3-H-0063",
    "taxonomy": {
      "subject": "Physics",
      "subject_code": "PHY",
      "domain": "Optics",
      "domain_code": "OPT",
      "topic": "Chemical Kinetics & Principles",
      "topic_code": "01",
      "subtopic": "Interference & Diffraction",
      "subtopic_code": "01",
      "microtopic": "Chemical Kinetics Core Rule",
      "microtopic_code": "M3",
      "difficulty": "Hard",
      "exam_category": "SCHOOL_K12",
      "question_format": "theory"
    },
    "question_format": "theory",
    "exam_category": "SCHOOL_K12",
    "question_text": "[#0063] For a first-order chemical reaction, the half-life period t_1/2 is _______ of initial reactant concentration.",
    "question_text_ta": "[#0063] ஒரு முதல் வகை வேதிவினைக்கு அரைவாழ்வு காலம் தொடக்கச் செறிவை _______ .",
    "options": {
      "A": "Independent (சார்ந்திருக்காது - t_1/2 = 0.693 / k)",
      "B": "Directly proportional (நேர்விகிதத்தில் சார்ந்தது)",
      "C": "Inversely proportional (எதிர்விகிதத்தில் சார்ந்தது)",
      "D": "Exponentially dependent (அதிவேகமாக சார்ந்தது)"
    },
    "correct_option": "A",
    "explanation": "[Question #0063] For first order: k = (2.303 / t) log([A]_0 / [A]). At t = t_1/2, [A] = [A]_0 / 2, giving t_1/2 = ln(2) / k = 0.693 / k.",
    "explanation_ta": "[கேள்வி எண் #0063] முதல் வகை வினைக்கு அரைவாழ்வு காலம் தொடக்கச் செறிவைச் சார்ந்திருக்காது: t_1/2 = 0.693 / k.",
    "formula_or_law": "t_{1/2} = \\frac{\\ln 2}{k} = \\frac{0.693}{k}"
  },
  {
    "question_uid": "CHE-ORG-01-01-M1-H-0064",
    "taxonomy": {
      "subject": "Chemistry",
      "subject_code": "CHE",
      "domain": "Organic Chemistry",
      "domain_code": "ORG",
      "topic": "Photosynthesis & Principles",
      "topic_code": "01",
      "subtopic": "Electrophilic & Nucleophilic",
      "subtopic_code": "01",
      "microtopic": "Photosynthesis Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Hard",
      "exam_category": "NEET_JEE",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "NEET_JEE",
    "question_text": "[#0064] During photosynthesis in chloroplasts, photolysis of water occurs at the _______ complex of PS II.",
    "question_text_ta": "[#0064] ஒளிச்சேர்க்கையின் போது நீர் மூலக்கூறு ஒளிச்சிதைவு PS II இன் _______ வளாகத்தில் நடைபெறுகிறது.",
    "options": {
      "A": "Oxygen-Evolving Complex (OEC - ஆக்ஸிஜன் வெளிப்படுத்தும் மையம்)",
      "B": "ATP Synthase CF0-CF1 complex",
      "C": "Photosystem I reaction center P700",
      "D": "Cytochrome b6f complex"
    },
    "correct_option": "A",
    "explanation": "[Question #0064] Water photolysis (2H2O -> 4H+ + 4e- + O2) is catalyzed by the manganese-containing oxygen-evolving complex located on the luminal side of PS II.",
    "explanation_ta": "[கேள்வி எண் #0064] நீர் மூலக்கூறு சிதைவு PS II இன் ஆக்ஸிஜன் வெளிப்படுத்தும் மையத்தால் வினையூக்கப்படுகிறது.",
    "formula_or_law": "2\\text{H}_2\\text{O} \\xrightarrow{h\\nu, \\text{PS II}} 4\\text{H}^+ + 4e^- + \\text{O}_2"
  },
  {
    "question_uid": "CHE-INO-01-01-M2-M-0065",
    "taxonomy": {
      "subject": "Chemistry",
      "subject_code": "CHE",
      "domain": "Inorganic Chemistry",
      "domain_code": "INO",
      "topic": "Matrices & Principles",
      "topic_code": "01",
      "subtopic": "Ligand Field & Isomerism",
      "subtopic_code": "01",
      "microtopic": "Matrices Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "NEET_JEE",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "NEET_JEE",
    "question_text": "[#0065] The sum of all eigenvalues of an n x n square matrix A is identically equal to the _______ of matrix A.",
    "question_text_ta": "[#0065] ஒரு சதுர அணி A இன் அனைத்து ஐகன் மதிப்புகளின் கூடுதல் அந்த அணியின் _______ க்குச் சமமாகும்.",
    "options": {
      "A": "Trace (சுவடு - Tr(A))",
      "B": "Determinant (அணிக்கோவை மதிப்பு)",
      "C": "Rank (அணியின் தரம்)",
      "D": "Nullity (வெற்றுமை)"
    },
    "correct_option": "A",
    "explanation": "[Question #0065] The trace of any square matrix equals the sum of its main diagonal elements, which identically equals the algebraic sum of all its eigenvalues.",
    "explanation_ta": "[கேள்வி எண் #0065] ஒரு சதுர அணியின் சுவடு (Trace) அதன் முதன்மை மூலைவிட்ட உறுப்புகளின் கூடுதலுக்கு மற்றும் அனைத்து ஐகன் மதிப்புகளின் கூடுதலுக்குச் சமமாகும்.",
    "formula_or_law": "\\text{Tr}(A) = \\sum_{i=1}^n a_{ii} = \\sum_{i=1}^n \\lambda_i"
  },
  {
    "question_uid": "CHE-PHY-01-01-M3-M-0066",
    "taxonomy": {
      "subject": "Chemistry",
      "subject_code": "CHE",
      "domain": "Physical Chemistry",
      "domain_code": "PHY",
      "topic": "Binary Search Trees & Principles",
      "topic_code": "01",
      "subtopic": "Rate Laws & Arrhenius",
      "subtopic_code": "01",
      "microtopic": "Binary Search Trees Core Rule",
      "microtopic_code": "M3",
      "difficulty": "Medium",
      "exam_category": "SCHOOL_K12",
      "question_format": "assertion_reason"
    },
    "question_format": "assertion_reason",
    "exam_category": "SCHOOL_K12",
    "question_text": "[#0066] In an AVL Tree, the balance factor for every node is strictly constrained to the set _______ .",
    "question_text_ta": "[#0066] AVL மரத்தில் ஒவ்வொரு முனையின் சமநிலை காரணி (Balance Factor) எப்போதும் _______ கணத்திற்குள் இருக்க வேண்டும்.",
    "options": {
      "A": "{-1, 0, +1}",
      "B": "{0, 1, 2}",
      "C": "{-2, 0, +2}",
      "D": "{0, 1}"
    },
    "correct_option": "A",
    "explanation": "[Question #0066] An AVL tree is a self-balancing binary search tree where the height difference between left and right subtrees (Balance Factor = Height(L) - Height(R)) is strictly in {-1, 0, 1}.",
    "explanation_ta": "[கேள்வி எண் #0066] AVL மரத்தில் இடது மற்றும் வலது துணை மரங்களின் உயர வேறுபாடு எப்போதும் -1, 0, அல்லது +1 ஆக மட்டுமே இருக்க வேண்டும்.",
    "formula_or_law": "\\text{BF}(v) = h(\\text{left}(v)) - h(\\text{right}(v)) \\in \\{-1, 0, +1\\}"
  },
  {
    "question_uid": "BIO-BOT-01-01-M1-M-0067",
    "taxonomy": {
      "subject": "Biology",
      "subject_code": "BIO",
      "domain": "Botany",
      "domain_code": "BOT",
      "topic": "Constitution & Principles",
      "topic_code": "01",
      "subtopic": "Photosynthesis C3 & C4",
      "subtopic_code": "01",
      "microtopic": "Constitution Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Medium",
      "exam_category": "NEET_JEE",
      "question_format": "numerical"
    },
    "question_format": "numerical",
    "exam_category": "NEET_JEE",
    "question_text": "[#0067] Under Article _______ of the Constitution of India, High Courts have the power to issue Writs for Fundamental Rights and other legal rights.",
    "question_text_ta": "[#0067] இந்திய அரசியலமைப்பின் சட்டப்பிரிவு _______ இன் கீழ் உயர்நீதிமன்றங்கள் நீதிப்பேராணைகளை வெளியிடும் அதிகாரம் பெற்றுள்ளன.",
    "options": {
      "A": "Article 226",
      "B": "Article 32",
      "C": "Article 14",
      "D": "Article 368"
    },
    "correct_option": "A",
    "explanation": "[Question #0067] Article 226 empowers High Courts to issue Writs for Fundamental Rights as well as ordinary legal rights, giving it a wider textual scope than Article 32.",
    "explanation_ta": "[கேள்வி எண் #0067] சட்டப்பிரிவு 226 உயர்நீதிமன்றங்களுக்கு அடிப்படை உரிமைகள் மற்றும் பிற சட்ட உரிமைகளுக்காகவும் நீதிப்பேராணைகளை வழங்கும் அதிகாரத்தை அளிக்கிறது.",
    "formula_or_law": "\\text{Article 226} \\implies \\text{High Court Writ Jurisdiction}"
  },
  {
    "question_uid": "BIO-ZOO-01-01-M2-E-0068",
    "taxonomy": {
      "subject": "Biology",
      "subject_code": "BIO",
      "domain": "Zoology",
      "domain_code": "ZOO",
      "topic": "Cholas & Principles",
      "topic_code": "01",
      "subtopic": "Endocrine & Neural System",
      "subtopic_code": "01",
      "microtopic": "Cholas Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Easy",
      "exam_category": "NEET_JEE",
      "question_format": "match_the_following"
    },
    "question_format": "match_the_following",
    "exam_category": "NEET_JEE",
    "question_text": "[#0068] The famous Uttaramerur Inscription of Parantaka Chola I describes the _______ system of secret ballot village democracy.",
    "question_text_ta": "[#0068] முதலாம் பராந்தக சோழனின் உத்திரமேரூர் கல்வெட்டு கிராம நிர்வாகத்திற்கான _______ தேர்தல் முறையை விவரிக்கிறது.",
    "options": {
      "A": "Kudavolai (குடவோலை முறை)",
      "B": "Kadamai (கடமை முறை)",
      "C": "Variyam (வாரிய வரி விதிப்பு)",
      "D": "Kaniurimai (காணியுரிமை முறை)"
    },
    "correct_option": "A",
    "explanation": "[Question #0068] The Uttaramerur inscription details the Kudavolai secret ballot system for electing members to village committees (Variyams) with strict qualifications and disqualifications.",
    "explanation_ta": "[கேள்வி எண் #0068] உத்திரமேரூர் கல்வெட்டு கிராம சபைக் குழுக்களுக்கு (வாரியங்கள்) குடவோலை முறை மூலம் உறுப்பினர்களைத் தேர்ந்தெடுக்கும் தேர்தல் முறையை விவரிக்கிறது.",
    "formula_or_law": "\\text{Uttaramerur Inscription} \\implies \\text{Village Kudavolai Democracy}"
  },
  {
    "question_uid": "BIO-GEN-01-01-M3-H-0069",
    "taxonomy": {
      "subject": "Biology",
      "subject_code": "BIO",
      "domain": "Genetics",
      "domain_code": "GEN",
      "topic": "Monsoons & Principles",
      "topic_code": "01",
      "subtopic": "DNA Replication & Translation",
      "subtopic_code": "01",
      "microtopic": "Monsoons Core Rule",
      "microtopic_code": "M3",
      "difficulty": "Hard",
      "exam_category": "SCHOOL_K12",
      "question_format": "pyq"
    },
    "question_format": "pyq",
    "exam_category": "SCHOOL_K12",
    "question_text": "[#0069] Tamil Nadu receives nearly 48% to 50% of its annual precipitation from the _______ Monsoon season.",
    "question_text_ta": "[#0069] தமிழ்நாடு தனது ஆண்டு மழையில் சுமார் 48% முதல் 50% பங்கை _______ பருவமழை காலத்தில் பெறுகிறது.",
    "options": {
      "A": "North-East Monsoon (வடகிழக்குப் பருவமழை)",
      "B": "South-West Monsoon (தென்மேற்குப் பருவமழை)",
      "C": "Pre-Monsoon Convectional Showers (கோடை மழை)",
      "D": "Winter Cyclonic Disturbances"
    },
    "correct_option": "A",
    "explanation": "[Question #0069] The North-East Monsoon accounts for nearly 48-50% of Tamil Nadu's annual precipitation as retreating winds pick up moisture across the Bay of Bengal and hit the Coromandel coast.",
    "explanation_ta": "[கேள்வி எண் #0069] தமிழ்நாடு தனது ஆண்டு மழையில் சுமார் 48-50% பங்கை வடகிழக்குப் பருவமழை மூலமே பெறுகிறது.",
    "formula_or_law": "\\text{NE Monsoon (Oct-Dec)} \\implies 48\\text{--}50\\% \\text{ TN Precipitation}"
  },
  {
    "question_uid": "MAT-CAL-01-01-M1-H-0070",
    "taxonomy": {
      "subject": "Mathematics",
      "subject_code": "MAT",
      "domain": "Calculus",
      "domain_code": "CAL",
      "topic": "Simple Interest & Principles",
      "topic_code": "01",
      "subtopic": "Definite Integrals & Limits",
      "subtopic_code": "01",
      "microtopic": "Simple Interest Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Hard",
      "exam_category": "NEET_JEE",
      "question_format": "theory"
    },
    "question_format": "theory",
    "exam_category": "NEET_JEE",
    "question_text": "[#0070] If SI = (P * R * N) / 100, the total accumulated amount A is calculated by the formula A = _______ .",
    "question_text_ta": "[#0070] தனிவட்டி SI = (P * R * N) / 100 எனில், மொத்தத் தொகை A கணக்கிடும் சூத்திரம் A = _______ ஆகும்.",
    "options": {
      "A": "P [1 + (R * N) / 100]",
      "B": "P [1 + R / 100]^N",
      "C": "(P * R * N) / 100",
      "D": "P / [1 + (R * N) / 100]"
    },
    "correct_option": "A",
    "explanation": "[Question #0070] Total Amount A = Principal P + Simple Interest SI = P + (P * R * N) / 100 = P [1 + (R * N) / 100].",
    "explanation_ta": "[கேள்வி எண் #0070] மொத்தத் தொகை A = அசல் + தனிவட்டி = P [1 + (R * N) / 100].",
    "formula_or_law": "A = P \\left(1 + \\frac{R \\cdot N}{100}\\right)"
  },
  {
    "question_uid": "MAT-ALG-01-01-M2-M-0071",
    "taxonomy": {
      "subject": "Mathematics",
      "subject_code": "MAT",
      "domain": "Algebra",
      "domain_code": "ALG",
      "topic": "Kinematics & Principles",
      "topic_code": "01",
      "subtopic": "Eigenvalues & Rank",
      "subtopic_code": "01",
      "microtopic": "Kinematics Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "SCHOOL_K12",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "SCHOOL_K12",
    "question_text": "[#0071] In two-dimensional projectile motion without air resistance, the horizontal velocity component remains _______ throughout the flight.",
    "question_text_ta": "[#0071] காற்று உராய்வு இல்லாத இருபரிமாண எறிபொருள் இயக்கத்தில் கிடைமட்ட திசைவேகக் கூறு இயக்கம் முழுவதும் _______ ஆக இருக்கும்.",
    "options": {
      "A": "Constant (மாறிலி)",
      "B": "Zero at highest point (உச்சியில் சுழி)",
      "C": "Linearly increasing (நேர்கோட்டில் அதிகரிக்கும்)",
      "D": "Exponentially decaying (அதிவேகமாக குறையும்)"
    },
    "correct_option": "A",
    "explanation": "[Question #0071] Since gravity acts solely vertically downward (a_y = -g), horizontal acceleration a_x = 0, keeping horizontal velocity v_x = u cos θ strictly constant.",
    "explanation_ta": "[கேள்வி எண் #0071] புவியீர்ப்பு விசை செங்குத்தாக மட்டுமே செயல்படுவதால் கிடைமட்ட முடுக்கம் a_x = 0, எனவே v_x மாறிலியாக இருக்கும்.",
    "formula_or_law": "v_x = u \\cos\\theta = \\text{constant}"
  },
  {
    "question_uid": "CS-DSA-01-01-M1-M-0072",
    "taxonomy": {
      "subject": "Computer Science",
      "subject_code": "CS",
      "domain": "Algorithms",
      "domain_code": "DSA",
      "topic": "Ohm Law & Principles",
      "topic_code": "01",
      "subtopic": "Binary Search Trees & AVL",
      "subtopic_code": "01",
      "microtopic": "Ohm Law Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Medium",
      "exam_category": "SSC_BANK",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "SSC_BANK",
    "question_text": "[#0072] According to microscopic Ohm's law, the electrical conductivity σ is given by the formula _______ .",
    "question_text_ta": "[#0072] நுண்ணோக்கி ஓம் விதியின்படி ஒரு கடத்தியின் மின்கடத்துத்திறன் σ சமன்பாடு _______ ஆகும்.",
    "options": {
      "A": "σ = (n e² τ) / m",
      "B": "σ = (m e² τ) / n",
      "C": "σ = (n e τ) / m²",
      "D": "σ = (n² e τ) / m"
    },
    "correct_option": "A",
    "explanation": "[Question #0072] Conductivity σ is derived from J = n e v_d where v_d = (e E τ) / m, leading to J = (n e² τ / m) E = σ E.",
    "explanation_ta": "[கேள்வி எண் #0072] மின்கடத்துத்திறன் σ = (n e² τ) / m ஆகும்.",
    "formula_or_law": "\\sigma = \\frac{n e^2 \\tau}{m}"
  },
  {
    "question_uid": "CS-DBMS-01-01-M2-E-0073",
    "taxonomy": {
      "subject": "Computer Science",
      "subject_code": "CS",
      "domain": "Databases",
      "domain_code": "DBMS",
      "topic": "Chemical Kinetics & Principles",
      "topic_code": "01",
      "subtopic": "Normalization & Indexing",
      "subtopic_code": "01",
      "microtopic": "Chemical Kinetics Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Easy",
      "exam_category": "SSC_BANK",
      "question_format": "assertion_reason"
    },
    "question_format": "assertion_reason",
    "exam_category": "SSC_BANK",
    "question_text": "[#0073] For a first-order chemical reaction, the half-life period t_1/2 is _______ of initial reactant concentration.",
    "question_text_ta": "[#0073] ஒரு முதல் வகை வேதிவினைக்கு அரைவாழ்வு காலம் தொடக்கச் செறிவை _______ .",
    "options": {
      "A": "Independent (சார்ந்திருக்காது - t_1/2 = 0.693 / k)",
      "B": "Directly proportional (நேர்விகிதத்தில் சார்ந்தது)",
      "C": "Inversely proportional (எதிர்விகிதத்தில் சார்ந்தது)",
      "D": "Exponentially dependent (அதிவேகமாக சார்ந்தது)"
    },
    "correct_option": "A",
    "explanation": "[Question #0073] For first order: k = (2.303 / t) log([A]_0 / [A]). At t = t_1/2, [A] = [A]_0 / 2, giving t_1/2 = ln(2) / k = 0.693 / k.",
    "explanation_ta": "[கேள்வி எண் #0073] முதல் வகை வினைக்கு அரைவாழ்வு காலம் தொடக்கச் செறிவைச் சார்ந்திருக்காது: t_1/2 = 0.693 / k.",
    "formula_or_law": "t_{1/2} = \\frac{\\ln 2}{k} = \\frac{0.693}{k}"
  },
  {
    "question_uid": "HIS-TN-01-01-M1-E-0074",
    "taxonomy": {
      "subject": "History",
      "subject_code": "HIS",
      "domain": "Tamil Nadu History",
      "domain_code": "TN",
      "topic": "Photosynthesis & Principles",
      "topic_code": "01",
      "subtopic": "Cholas, Pandyas & Cheras",
      "subtopic_code": "01",
      "microtopic": "Photosynthesis Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Easy",
      "exam_category": "TNPSC",
      "question_format": "numerical"
    },
    "question_format": "numerical",
    "exam_category": "TNPSC",
    "question_text": "[#0074] During photosynthesis in chloroplasts, photolysis of water occurs at the _______ complex of PS II.",
    "question_text_ta": "[#0074] ஒளிச்சேர்க்கையின் போது நீர் மூலக்கூறு ஒளிச்சிதைவு PS II இன் _______ வளாகத்தில் நடைபெறுகிறது.",
    "options": {
      "A": "Oxygen-Evolving Complex (OEC - ஆக்ஸிஜன் வெளிப்படுத்தும் மையம்)",
      "B": "ATP Synthase CF0-CF1 complex",
      "C": "Photosystem I reaction center P700",
      "D": "Cytochrome b6f complex"
    },
    "correct_option": "A",
    "explanation": "[Question #0074] Water photolysis (2H2O -> 4H+ + 4e- + O2) is catalyzed by the manganese-containing oxygen-evolving complex located on the luminal side of PS II.",
    "explanation_ta": "[கேள்வி எண் #0074] நீர் மூலக்கூறு சிதைவு PS II இன் ஆக்ஸிஜன் வெளிப்படுத்தும் மையத்தால் வினையூக்கப்படுகிறது.",
    "formula_or_law": "2\\text{H}_2\\text{O} \\xrightarrow{h\\nu, \\text{PS II}} 4\\text{H}^+ + 4e^- + \\text{O}_2"
  },
  {
    "question_uid": "HIS-MOD-01-01-M2-M-0075",
    "taxonomy": {
      "subject": "History",
      "subject_code": "HIS",
      "domain": "Modern India",
      "domain_code": "MOD",
      "topic": "Matrices & Principles",
      "topic_code": "01",
      "subtopic": "Non-Cooperation & Civil Disobedience",
      "subtopic_code": "01",
      "microtopic": "Matrices Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "TNPSC",
      "question_format": "match_the_following"
    },
    "question_format": "match_the_following",
    "exam_category": "TNPSC",
    "question_text": "[#0075] The sum of all eigenvalues of an n x n square matrix A is identically equal to the _______ of matrix A.",
    "question_text_ta": "[#0075] ஒரு சதுர அணி A இன் அனைத்து ஐகன் மதிப்புகளின் கூடுதல் அந்த அணியின் _______ க்குச் சமமாகும்.",
    "options": {
      "A": "Trace (சுவடு - Tr(A))",
      "B": "Determinant (அணிக்கோவை மதிப்பு)",
      "C": "Rank (அணியின் தரம்)",
      "D": "Nullity (வெற்றுமை)"
    },
    "correct_option": "A",
    "explanation": "[Question #0075] The trace of any square matrix equals the sum of its main diagonal elements, which identically equals the algebraic sum of all its eigenvalues.",
    "explanation_ta": "[கேள்வி எண் #0075] ஒரு சதுர அணியின் சுவடு (Trace) அதன் முதன்மை மூலைவிட்ட உறுப்புகளின் கூடுதலுக்கு மற்றும் அனைத்து ஐகன் மதிப்புகளின் கூடுதலுக்குச் சமமாகும்.",
    "formula_or_law": "\\text{Tr}(A) = \\sum_{i=1}^n a_{ii} = \\sum_{i=1}^n \\lambda_i"
  },
  {
    "question_uid": "POL-CON-01-01-M1-E-0076",
    "taxonomy": {
      "subject": "Polity",
      "subject_code": "POL",
      "domain": "Constitution",
      "domain_code": "CON",
      "topic": "Binary Search Trees & Principles",
      "topic_code": "01",
      "subtopic": "Articles 14-32 & Writs",
      "subtopic_code": "01",
      "microtopic": "Binary Search Trees Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Easy",
      "exam_category": "TNPSC",
      "question_format": "pyq"
    },
    "question_format": "pyq",
    "exam_category": "TNPSC",
    "question_text": "[#0076] In an AVL Tree, the balance factor for every node is strictly constrained to the set _______ .",
    "question_text_ta": "[#0076] AVL மரத்தில் ஒவ்வொரு முனையின் சமநிலை காரணி (Balance Factor) எப்போதும் _______ கணத்திற்குள் இருக்க வேண்டும்.",
    "options": {
      "A": "{-1, 0, +1}",
      "B": "{0, 1, 2}",
      "C": "{-2, 0, +2}",
      "D": "{0, 1}"
    },
    "correct_option": "A",
    "explanation": "[Question #0076] An AVL tree is a self-balancing binary search tree where the height difference between left and right subtrees (Balance Factor = Height(L) - Height(R)) is strictly in {-1, 0, 1}.",
    "explanation_ta": "[கேள்வி எண் #0076] AVL மரத்தில் இடது மற்றும் வலது துணை மரங்களின் உயர வேறுபாடு எப்போதும் -1, 0, அல்லது +1 ஆக மட்டுமே இருக்க வேண்டும்.",
    "formula_or_law": "\\text{BF}(v) = h(\\text{left}(v)) - h(\\text{right}(v)) \\in \\{-1, 0, +1\\}"
  },
  {
    "question_uid": "POL-GOV-01-01-M2-M-0077",
    "taxonomy": {
      "subject": "Polity",
      "subject_code": "POL",
      "domain": "Governance",
      "domain_code": "GOV",
      "topic": "Constitution & Principles",
      "topic_code": "01",
      "subtopic": "Lok Sabha & Supreme Court",
      "subtopic_code": "01",
      "microtopic": "Constitution Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "SSC_BANK",
      "question_format": "theory"
    },
    "question_format": "theory",
    "exam_category": "SSC_BANK",
    "question_text": "[#0077] Under Article _______ of the Constitution of India, High Courts have the power to issue Writs for Fundamental Rights and other legal rights.",
    "question_text_ta": "[#0077] இந்திய அரசியலமைப்பின் சட்டப்பிரிவு _______ இன் கீழ் உயர்நீதிமன்றங்கள் நீதிப்பேராணைகளை வெளியிடும் அதிகாரம் பெற்றுள்ளன.",
    "options": {
      "A": "Article 226",
      "B": "Article 32",
      "C": "Article 14",
      "D": "Article 368"
    },
    "correct_option": "A",
    "explanation": "[Question #0077] Article 226 empowers High Courts to issue Writs for Fundamental Rights as well as ordinary legal rights, giving it a wider textual scope than Article 32.",
    "explanation_ta": "[கேள்வி எண் #0077] சட்டப்பிரிவு 226 உயர்நீதிமன்றங்களுக்கு அடிப்படை உரிமைகள் மற்றும் பிற சட்ட உரிமைகளுக்காகவும் நீதிப்பேராணைகளை வழங்கும் அதிகாரத்தை அளிக்கிறது.",
    "formula_or_law": "\\text{Article 226} \\implies \\text{High Court Writ Jurisdiction}"
  },
  {
    "question_uid": "GEO-IND-01-01-M1-E-0078",
    "taxonomy": {
      "subject": "Geography",
      "subject_code": "GEO",
      "domain": "Indian Geography",
      "domain_code": "IND",
      "topic": "Cholas & Principles",
      "topic_code": "01",
      "subtopic": "Himalayan & Peninsular Rivers",
      "subtopic_code": "01",
      "microtopic": "Cholas Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Easy",
      "exam_category": "TNPSC",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "TNPSC",
    "question_text": "[#0078] The famous Uttaramerur Inscription of Parantaka Chola I describes the _______ system of secret ballot village democracy.",
    "question_text_ta": "[#0078] முதலாம் பராந்தக சோழனின் உத்திரமேரூர் கல்வெட்டு கிராம நிர்வாகத்திற்கான _______ தேர்தல் முறையை விவரிக்கிறது.",
    "options": {
      "A": "Kudavolai (குடவோலை முறை)",
      "B": "Kadamai (கடமை முறை)",
      "C": "Variyam (வாரிய வரி விதிப்பு)",
      "D": "Kaniurimai (காணியுரிமை முறை)"
    },
    "correct_option": "A",
    "explanation": "[Question #0078] The Uttaramerur inscription details the Kudavolai secret ballot system for electing members to village committees (Variyams) with strict qualifications and disqualifications.",
    "explanation_ta": "[கேள்வி எண் #0078] உத்திரமேரூர் கல்வெட்டு கிராம சபைக் குழுக்களுக்கு (வாரியங்கள்) குடவோலை முறை மூலம் உறுப்பினர்களைத் தேர்ந்தெடுக்கும் தேர்தல் முறையை விவரிக்கிறது.",
    "formula_or_law": "\\text{Uttaramerur Inscription} \\implies \\text{Village Kudavolai Democracy}"
  },
  {
    "question_uid": "GEO-TN-01-01-M2-M-0079",
    "taxonomy": {
      "subject": "Geography",
      "subject_code": "GEO",
      "domain": "Tamil Nadu Geography",
      "domain_code": "TN",
      "topic": "Monsoons & Principles",
      "topic_code": "01",
      "subtopic": "Monsoons & Soil Types",
      "subtopic_code": "01",
      "microtopic": "Monsoons Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "TNPSC",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "TNPSC",
    "question_text": "[#0079] Tamil Nadu receives nearly 48% to 50% of its annual precipitation from the _______ Monsoon season.",
    "question_text_ta": "[#0079] தமிழ்நாடு தனது ஆண்டு மழையில் சுமார் 48% முதல் 50% பங்கை _______ பருவமழை காலத்தில் பெறுகிறது.",
    "options": {
      "A": "North-East Monsoon (வடகிழக்குப் பருவமழை)",
      "B": "South-West Monsoon (தென்மேற்குப் பருவமழை)",
      "C": "Pre-Monsoon Convectional Showers (கோடை மழை)",
      "D": "Winter Cyclonic Disturbances"
    },
    "correct_option": "A",
    "explanation": "[Question #0079] The North-East Monsoon accounts for nearly 48-50% of Tamil Nadu's annual precipitation as retreating winds pick up moisture across the Bay of Bengal and hit the Coromandel coast.",
    "explanation_ta": "[கேள்வி எண் #0079] தமிழ்நாடு தனது ஆண்டு மழையில் சுமார் 48-50% பங்கை வடகிழக்குப் பருவமழை மூலமே பெறுகிறது.",
    "formula_or_law": "\\text{NE Monsoon (Oct-Dec)} \\implies 48\\text{--}50\\% \\text{ TN Precipitation}"
  },
  {
    "question_uid": "APT-NUM-01-01-M1-E-0080",
    "taxonomy": {
      "subject": "Aptitude",
      "subject_code": "APT",
      "domain": "Quantitative Aptitude",
      "domain_code": "NUM",
      "topic": "Simple Interest & Principles",
      "topic_code": "01",
      "subtopic": "Simple & Compound Interest",
      "subtopic_code": "01",
      "microtopic": "Simple Interest Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Easy",
      "exam_category": "SSC_BANK",
      "question_format": "assertion_reason"
    },
    "question_format": "assertion_reason",
    "exam_category": "SSC_BANK",
    "question_text": "[#0080] If SI = (P * R * N) / 100, the total accumulated amount A is calculated by the formula A = _______ .",
    "question_text_ta": "[#0080] தனிவட்டி SI = (P * R * N) / 100 எனில், மொத்தத் தொகை A கணக்கிடும் சூத்திரம் A = _______ ஆகும்.",
    "options": {
      "A": "P [1 + (R * N) / 100]",
      "B": "P [1 + R / 100]^N",
      "C": "(P * R * N) / 100",
      "D": "P / [1 + (R * N) / 100]"
    },
    "correct_option": "A",
    "explanation": "[Question #0080] Total Amount A = Principal P + Simple Interest SI = P + (P * R * N) / 100 = P [1 + (R * N) / 100].",
    "explanation_ta": "[கேள்வி எண் #0080] மொத்தத் தொகை A = அசல் + தனிவட்டி = P [1 + (R * N) / 100].",
    "formula_or_law": "A = P \\left(1 + \\frac{R \\cdot N}{100}\\right)"
  },
  {
    "question_uid": "PHY-MEC-01-01-M1-M-0081",
    "taxonomy": {
      "subject": "Physics",
      "subject_code": "PHY",
      "domain": "Mechanics",
      "domain_code": "MEC",
      "topic": "Kinematics & Principles",
      "topic_code": "01",
      "subtopic": "Motion in 2D & Projectiles",
      "subtopic_code": "01",
      "microtopic": "Kinematics Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Medium",
      "exam_category": "NEET_JEE",
      "question_format": "numerical"
    },
    "question_format": "numerical",
    "exam_category": "NEET_JEE",
    "question_text": "[#0081] In two-dimensional projectile motion without air resistance, the horizontal velocity component remains _______ throughout the flight.",
    "question_text_ta": "[#0081] காற்று உராய்வு இல்லாத இருபரிமாண எறிபொருள் இயக்கத்தில் கிடைமட்ட திசைவேகக் கூறு இயக்கம் முழுவதும் _______ ஆக இருக்கும்.",
    "options": {
      "A": "Constant (மாறிலி)",
      "B": "Zero at highest point (உச்சியில் சுழி)",
      "C": "Linearly increasing (நேர்கோட்டில் அதிகரிக்கும்)",
      "D": "Exponentially decaying (அதிவேகமாக குறையும்)"
    },
    "correct_option": "A",
    "explanation": "[Question #0081] Since gravity acts solely vertically downward (a_y = -g), horizontal acceleration a_x = 0, keeping horizontal velocity v_x = u cos θ strictly constant.",
    "explanation_ta": "[கேள்வி எண் #0081] புவியீர்ப்பு விசை செங்குத்தாக மட்டுமே செயல்படுவதால் கிடைமட்ட முடுக்கம் a_x = 0, எனவே v_x மாறிலியாக இருக்கும்.",
    "formula_or_law": "v_x = u \\cos\\theta = \\text{constant}"
  },
  {
    "question_uid": "PHY-ELE-01-01-M2-E-0082",
    "taxonomy": {
      "subject": "Physics",
      "subject_code": "PHY",
      "domain": "Electrodynamics",
      "domain_code": "ELE",
      "topic": "Ohm Law & Principles",
      "topic_code": "01",
      "subtopic": "Ohm Law & Kirchhoff Rules",
      "subtopic_code": "01",
      "microtopic": "Ohm Law Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Easy",
      "exam_category": "NEET_JEE",
      "question_format": "match_the_following"
    },
    "question_format": "match_the_following",
    "exam_category": "NEET_JEE",
    "question_text": "[#0082] According to microscopic Ohm's law, the electrical conductivity σ is given by the formula _______ .",
    "question_text_ta": "[#0082] நுண்ணோக்கி ஓம் விதியின்படி ஒரு கடத்தியின் மின்கடத்துத்திறன் σ சமன்பாடு _______ ஆகும்.",
    "options": {
      "A": "σ = (n e² τ) / m",
      "B": "σ = (m e² τ) / n",
      "C": "σ = (n e τ) / m²",
      "D": "σ = (n² e τ) / m"
    },
    "correct_option": "A",
    "explanation": "[Question #0082] Conductivity σ is derived from J = n e v_d where v_d = (e E τ) / m, leading to J = (n e² τ / m) E = σ E.",
    "explanation_ta": "[கேள்வி எண் #0082] மின்கடத்துத்திறன் σ = (n e² τ) / m ஆகும்.",
    "formula_or_law": "\\sigma = \\frac{n e^2 \\tau}{m}"
  },
  {
    "question_uid": "PHY-OPT-01-01-M3-H-0083",
    "taxonomy": {
      "subject": "Physics",
      "subject_code": "PHY",
      "domain": "Optics",
      "domain_code": "OPT",
      "topic": "Chemical Kinetics & Principles",
      "topic_code": "01",
      "subtopic": "Interference & Diffraction",
      "subtopic_code": "01",
      "microtopic": "Chemical Kinetics Core Rule",
      "microtopic_code": "M3",
      "difficulty": "Hard",
      "exam_category": "SCHOOL_K12",
      "question_format": "pyq"
    },
    "question_format": "pyq",
    "exam_category": "SCHOOL_K12",
    "question_text": "[#0083] For a first-order chemical reaction, the half-life period t_1/2 is _______ of initial reactant concentration.",
    "question_text_ta": "[#0083] ஒரு முதல் வகை வேதிவினைக்கு அரைவாழ்வு காலம் தொடக்கச் செறிவை _______ .",
    "options": {
      "A": "Independent (சார்ந்திருக்காது - t_1/2 = 0.693 / k)",
      "B": "Directly proportional (நேர்விகிதத்தில் சார்ந்தது)",
      "C": "Inversely proportional (எதிர்விகிதத்தில் சார்ந்தது)",
      "D": "Exponentially dependent (அதிவேகமாக சார்ந்தது)"
    },
    "correct_option": "A",
    "explanation": "[Question #0083] For first order: k = (2.303 / t) log([A]_0 / [A]). At t = t_1/2, [A] = [A]_0 / 2, giving t_1/2 = ln(2) / k = 0.693 / k.",
    "explanation_ta": "[கேள்வி எண் #0083] முதல் வகை வினைக்கு அரைவாழ்வு காலம் தொடக்கச் செறிவைச் சார்ந்திருக்காது: t_1/2 = 0.693 / k.",
    "formula_or_law": "t_{1/2} = \\frac{\\ln 2}{k} = \\frac{0.693}{k}"
  },
  {
    "question_uid": "CHE-ORG-01-01-M1-H-0084",
    "taxonomy": {
      "subject": "Chemistry",
      "subject_code": "CHE",
      "domain": "Organic Chemistry",
      "domain_code": "ORG",
      "topic": "Photosynthesis & Principles",
      "topic_code": "01",
      "subtopic": "Electrophilic & Nucleophilic",
      "subtopic_code": "01",
      "microtopic": "Photosynthesis Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Hard",
      "exam_category": "NEET_JEE",
      "question_format": "theory"
    },
    "question_format": "theory",
    "exam_category": "NEET_JEE",
    "question_text": "[#0084] During photosynthesis in chloroplasts, photolysis of water occurs at the _______ complex of PS II.",
    "question_text_ta": "[#0084] ஒளிச்சேர்க்கையின் போது நீர் மூலக்கூறு ஒளிச்சிதைவு PS II இன் _______ வளாகத்தில் நடைபெறுகிறது.",
    "options": {
      "A": "Oxygen-Evolving Complex (OEC - ஆக்ஸிஜன் வெளிப்படுத்தும் மையம்)",
      "B": "ATP Synthase CF0-CF1 complex",
      "C": "Photosystem I reaction center P700",
      "D": "Cytochrome b6f complex"
    },
    "correct_option": "A",
    "explanation": "[Question #0084] Water photolysis (2H2O -> 4H+ + 4e- + O2) is catalyzed by the manganese-containing oxygen-evolving complex located on the luminal side of PS II.",
    "explanation_ta": "[கேள்வி எண் #0084] நீர் மூலக்கூறு சிதைவு PS II இன் ஆக்ஸிஜன் வெளிப்படுத்தும் மையத்தால் வினையூக்கப்படுகிறது.",
    "formula_or_law": "2\\text{H}_2\\text{O} \\xrightarrow{h\\nu, \\text{PS II}} 4\\text{H}^+ + 4e^- + \\text{O}_2"
  },
  {
    "question_uid": "CHE-INO-01-01-M2-M-0085",
    "taxonomy": {
      "subject": "Chemistry",
      "subject_code": "CHE",
      "domain": "Inorganic Chemistry",
      "domain_code": "INO",
      "topic": "Matrices & Principles",
      "topic_code": "01",
      "subtopic": "Ligand Field & Isomerism",
      "subtopic_code": "01",
      "microtopic": "Matrices Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "NEET_JEE",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "NEET_JEE",
    "question_text": "[#0085] The sum of all eigenvalues of an n x n square matrix A is identically equal to the _______ of matrix A.",
    "question_text_ta": "[#0085] ஒரு சதுர அணி A இன் அனைத்து ஐகன் மதிப்புகளின் கூடுதல் அந்த அணியின் _______ க்குச் சமமாகும்.",
    "options": {
      "A": "Trace (சுவடு - Tr(A))",
      "B": "Determinant (அணிக்கோவை மதிப்பு)",
      "C": "Rank (அணியின் தரம்)",
      "D": "Nullity (வெற்றுமை)"
    },
    "correct_option": "A",
    "explanation": "[Question #0085] The trace of any square matrix equals the sum of its main diagonal elements, which identically equals the algebraic sum of all its eigenvalues.",
    "explanation_ta": "[கேள்வி எண் #0085] ஒரு சதுர அணியின் சுவடு (Trace) அதன் முதன்மை மூலைவிட்ட உறுப்புகளின் கூடுதலுக்கு மற்றும் அனைத்து ஐகன் மதிப்புகளின் கூடுதலுக்குச் சமமாகும்.",
    "formula_or_law": "\\text{Tr}(A) = \\sum_{i=1}^n a_{ii} = \\sum_{i=1}^n \\lambda_i"
  },
  {
    "question_uid": "CHE-PHY-01-01-M3-M-0086",
    "taxonomy": {
      "subject": "Chemistry",
      "subject_code": "CHE",
      "domain": "Physical Chemistry",
      "domain_code": "PHY",
      "topic": "Binary Search Trees & Principles",
      "topic_code": "01",
      "subtopic": "Rate Laws & Arrhenius",
      "subtopic_code": "01",
      "microtopic": "Binary Search Trees Core Rule",
      "microtopic_code": "M3",
      "difficulty": "Medium",
      "exam_category": "SCHOOL_K12",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "SCHOOL_K12",
    "question_text": "[#0086] In an AVL Tree, the balance factor for every node is strictly constrained to the set _______ .",
    "question_text_ta": "[#0086] AVL மரத்தில் ஒவ்வொரு முனையின் சமநிலை காரணி (Balance Factor) எப்போதும் _______ கணத்திற்குள் இருக்க வேண்டும்.",
    "options": {
      "A": "{-1, 0, +1}",
      "B": "{0, 1, 2}",
      "C": "{-2, 0, +2}",
      "D": "{0, 1}"
    },
    "correct_option": "A",
    "explanation": "[Question #0086] An AVL tree is a self-balancing binary search tree where the height difference between left and right subtrees (Balance Factor = Height(L) - Height(R)) is strictly in {-1, 0, 1}.",
    "explanation_ta": "[கேள்வி எண் #0086] AVL மரத்தில் இடது மற்றும் வலது துணை மரங்களின் உயர வேறுபாடு எப்போதும் -1, 0, அல்லது +1 ஆக மட்டுமே இருக்க வேண்டும்.",
    "formula_or_law": "\\text{BF}(v) = h(\\text{left}(v)) - h(\\text{right}(v)) \\in \\{-1, 0, +1\\}"
  },
  {
    "question_uid": "BIO-BOT-01-01-M1-M-0087",
    "taxonomy": {
      "subject": "Biology",
      "subject_code": "BIO",
      "domain": "Botany",
      "domain_code": "BOT",
      "topic": "Constitution & Principles",
      "topic_code": "01",
      "subtopic": "Photosynthesis C3 & C4",
      "subtopic_code": "01",
      "microtopic": "Constitution Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Medium",
      "exam_category": "NEET_JEE",
      "question_format": "assertion_reason"
    },
    "question_format": "assertion_reason",
    "exam_category": "NEET_JEE",
    "question_text": "[#0087] Under Article _______ of the Constitution of India, High Courts have the power to issue Writs for Fundamental Rights and other legal rights.",
    "question_text_ta": "[#0087] இந்திய அரசியலமைப்பின் சட்டப்பிரிவு _______ இன் கீழ் உயர்நீதிமன்றங்கள் நீதிப்பேராணைகளை வெளியிடும் அதிகாரம் பெற்றுள்ளன.",
    "options": {
      "A": "Article 226",
      "B": "Article 32",
      "C": "Article 14",
      "D": "Article 368"
    },
    "correct_option": "A",
    "explanation": "[Question #0087] Article 226 empowers High Courts to issue Writs for Fundamental Rights as well as ordinary legal rights, giving it a wider textual scope than Article 32.",
    "explanation_ta": "[கேள்வி எண் #0087] சட்டப்பிரிவு 226 உயர்நீதிமன்றங்களுக்கு அடிப்படை உரிமைகள் மற்றும் பிற சட்ட உரிமைகளுக்காகவும் நீதிப்பேராணைகளை வழங்கும் அதிகாரத்தை அளிக்கிறது.",
    "formula_or_law": "\\text{Article 226} \\implies \\text{High Court Writ Jurisdiction}"
  },
  {
    "question_uid": "BIO-ZOO-01-01-M2-E-0088",
    "taxonomy": {
      "subject": "Biology",
      "subject_code": "BIO",
      "domain": "Zoology",
      "domain_code": "ZOO",
      "topic": "Cholas & Principles",
      "topic_code": "01",
      "subtopic": "Endocrine & Neural System",
      "subtopic_code": "01",
      "microtopic": "Cholas Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Easy",
      "exam_category": "NEET_JEE",
      "question_format": "numerical"
    },
    "question_format": "numerical",
    "exam_category": "NEET_JEE",
    "question_text": "[#0088] The famous Uttaramerur Inscription of Parantaka Chola I describes the _______ system of secret ballot village democracy.",
    "question_text_ta": "[#0088] முதலாம் பராந்தக சோழனின் உத்திரமேரூர் கல்வெட்டு கிராம நிர்வாகத்திற்கான _______ தேர்தல் முறையை விவரிக்கிறது.",
    "options": {
      "A": "Kudavolai (குடவோலை முறை)",
      "B": "Kadamai (கடமை முறை)",
      "C": "Variyam (வாரிய வரி விதிப்பு)",
      "D": "Kaniurimai (காணியுரிமை முறை)"
    },
    "correct_option": "A",
    "explanation": "[Question #0088] The Uttaramerur inscription details the Kudavolai secret ballot system for electing members to village committees (Variyams) with strict qualifications and disqualifications.",
    "explanation_ta": "[கேள்வி எண் #0088] உத்திரமேரூர் கல்வெட்டு கிராம சபைக் குழுக்களுக்கு (வாரியங்கள்) குடவோலை முறை மூலம் உறுப்பினர்களைத் தேர்ந்தெடுக்கும் தேர்தல் முறையை விவரிக்கிறது.",
    "formula_or_law": "\\text{Uttaramerur Inscription} \\implies \\text{Village Kudavolai Democracy}"
  },
  {
    "question_uid": "BIO-GEN-01-01-M3-H-0089",
    "taxonomy": {
      "subject": "Biology",
      "subject_code": "BIO",
      "domain": "Genetics",
      "domain_code": "GEN",
      "topic": "Monsoons & Principles",
      "topic_code": "01",
      "subtopic": "DNA Replication & Translation",
      "subtopic_code": "01",
      "microtopic": "Monsoons Core Rule",
      "microtopic_code": "M3",
      "difficulty": "Hard",
      "exam_category": "SCHOOL_K12",
      "question_format": "match_the_following"
    },
    "question_format": "match_the_following",
    "exam_category": "SCHOOL_K12",
    "question_text": "[#0089] Tamil Nadu receives nearly 48% to 50% of its annual precipitation from the _______ Monsoon season.",
    "question_text_ta": "[#0089] தமிழ்நாடு தனது ஆண்டு மழையில் சுமார் 48% முதல் 50% பங்கை _______ பருவமழை காலத்தில் பெறுகிறது.",
    "options": {
      "A": "North-East Monsoon (வடகிழக்குப் பருவமழை)",
      "B": "South-West Monsoon (தென்மேற்குப் பருவமழை)",
      "C": "Pre-Monsoon Convectional Showers (கோடை மழை)",
      "D": "Winter Cyclonic Disturbances"
    },
    "correct_option": "A",
    "explanation": "[Question #0089] The North-East Monsoon accounts for nearly 48-50% of Tamil Nadu's annual precipitation as retreating winds pick up moisture across the Bay of Bengal and hit the Coromandel coast.",
    "explanation_ta": "[கேள்வி எண் #0089] தமிழ்நாடு தனது ஆண்டு மழையில் சுமார் 48-50% பங்கை வடகிழக்குப் பருவமழை மூலமே பெறுகிறது.",
    "formula_or_law": "\\text{NE Monsoon (Oct-Dec)} \\implies 48\\text{--}50\\% \\text{ TN Precipitation}"
  },
  {
    "question_uid": "MAT-CAL-01-01-M1-H-0090",
    "taxonomy": {
      "subject": "Mathematics",
      "subject_code": "MAT",
      "domain": "Calculus",
      "domain_code": "CAL",
      "topic": "Simple Interest & Principles",
      "topic_code": "01",
      "subtopic": "Definite Integrals & Limits",
      "subtopic_code": "01",
      "microtopic": "Simple Interest Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Hard",
      "exam_category": "NEET_JEE",
      "question_format": "pyq"
    },
    "question_format": "pyq",
    "exam_category": "NEET_JEE",
    "question_text": "[#0090] If SI = (P * R * N) / 100, the total accumulated amount A is calculated by the formula A = _______ .",
    "question_text_ta": "[#0090] தனிவட்டி SI = (P * R * N) / 100 எனில், மொத்தத் தொகை A கணக்கிடும் சூத்திரம் A = _______ ஆகும்.",
    "options": {
      "A": "P [1 + (R * N) / 100]",
      "B": "P [1 + R / 100]^N",
      "C": "(P * R * N) / 100",
      "D": "P / [1 + (R * N) / 100]"
    },
    "correct_option": "A",
    "explanation": "[Question #0090] Total Amount A = Principal P + Simple Interest SI = P + (P * R * N) / 100 = P [1 + (R * N) / 100].",
    "explanation_ta": "[கேள்வி எண் #0090] மொத்தத் தொகை A = அசல் + தனிவட்டி = P [1 + (R * N) / 100].",
    "formula_or_law": "A = P \\left(1 + \\frac{R \\cdot N}{100}\\right)"
  },
  {
    "question_uid": "MAT-ALG-01-01-M2-M-0091",
    "taxonomy": {
      "subject": "Mathematics",
      "subject_code": "MAT",
      "domain": "Algebra",
      "domain_code": "ALG",
      "topic": "Kinematics & Principles",
      "topic_code": "01",
      "subtopic": "Eigenvalues & Rank",
      "subtopic_code": "01",
      "microtopic": "Kinematics Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "SCHOOL_K12",
      "question_format": "theory"
    },
    "question_format": "theory",
    "exam_category": "SCHOOL_K12",
    "question_text": "[#0091] In two-dimensional projectile motion without air resistance, the horizontal velocity component remains _______ throughout the flight.",
    "question_text_ta": "[#0091] காற்று உராய்வு இல்லாத இருபரிமாண எறிபொருள் இயக்கத்தில் கிடைமட்ட திசைவேகக் கூறு இயக்கம் முழுவதும் _______ ஆக இருக்கும்.",
    "options": {
      "A": "Constant (மாறிலி)",
      "B": "Zero at highest point (உச்சியில் சுழி)",
      "C": "Linearly increasing (நேர்கோட்டில் அதிகரிக்கும்)",
      "D": "Exponentially decaying (அதிவேகமாக குறையும்)"
    },
    "correct_option": "A",
    "explanation": "[Question #0091] Since gravity acts solely vertically downward (a_y = -g), horizontal acceleration a_x = 0, keeping horizontal velocity v_x = u cos θ strictly constant.",
    "explanation_ta": "[கேள்வி எண் #0091] புவியீர்ப்பு விசை செங்குத்தாக மட்டுமே செயல்படுவதால் கிடைமட்ட முடுக்கம் a_x = 0, எனவே v_x மாறிலியாக இருக்கும்.",
    "formula_or_law": "v_x = u \\cos\\theta = \\text{constant}"
  },
  {
    "question_uid": "CS-DSA-01-01-M1-M-0092",
    "taxonomy": {
      "subject": "Computer Science",
      "subject_code": "CS",
      "domain": "Algorithms",
      "domain_code": "DSA",
      "topic": "Ohm Law & Principles",
      "topic_code": "01",
      "subtopic": "Binary Search Trees & AVL",
      "subtopic_code": "01",
      "microtopic": "Ohm Law Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Medium",
      "exam_category": "SSC_BANK",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "SSC_BANK",
    "question_text": "[#0092] According to microscopic Ohm's law, the electrical conductivity σ is given by the formula _______ .",
    "question_text_ta": "[#0092] நுண்ணோக்கி ஓம் விதியின்படி ஒரு கடத்தியின் மின்கடத்துத்திறன் σ சமன்பாடு _______ ஆகும்.",
    "options": {
      "A": "σ = (n e² τ) / m",
      "B": "σ = (m e² τ) / n",
      "C": "σ = (n e τ) / m²",
      "D": "σ = (n² e τ) / m"
    },
    "correct_option": "A",
    "explanation": "[Question #0092] Conductivity σ is derived from J = n e v_d where v_d = (e E τ) / m, leading to J = (n e² τ / m) E = σ E.",
    "explanation_ta": "[கேள்வி எண் #0092] மின்கடத்துத்திறன் σ = (n e² τ) / m ஆகும்.",
    "formula_or_law": "\\sigma = \\frac{n e^2 \\tau}{m}"
  },
  {
    "question_uid": "CS-DBMS-01-01-M2-E-0093",
    "taxonomy": {
      "subject": "Computer Science",
      "subject_code": "CS",
      "domain": "Databases",
      "domain_code": "DBMS",
      "topic": "Chemical Kinetics & Principles",
      "topic_code": "01",
      "subtopic": "Normalization & Indexing",
      "subtopic_code": "01",
      "microtopic": "Chemical Kinetics Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Easy",
      "exam_category": "SSC_BANK",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "SSC_BANK",
    "question_text": "[#0093] For a first-order chemical reaction, the half-life period t_1/2 is _______ of initial reactant concentration.",
    "question_text_ta": "[#0093] ஒரு முதல் வகை வேதிவினைக்கு அரைவாழ்வு காலம் தொடக்கச் செறிவை _______ .",
    "options": {
      "A": "Independent (சார்ந்திருக்காது - t_1/2 = 0.693 / k)",
      "B": "Directly proportional (நேர்விகிதத்தில் சார்ந்தது)",
      "C": "Inversely proportional (எதிர்விகிதத்தில் சார்ந்தது)",
      "D": "Exponentially dependent (அதிவேகமாக சார்ந்தது)"
    },
    "correct_option": "A",
    "explanation": "[Question #0093] For first order: k = (2.303 / t) log([A]_0 / [A]). At t = t_1/2, [A] = [A]_0 / 2, giving t_1/2 = ln(2) / k = 0.693 / k.",
    "explanation_ta": "[கேள்வி எண் #0093] முதல் வகை வினைக்கு அரைவாழ்வு காலம் தொடக்கச் செறிவைச் சார்ந்திருக்காது: t_1/2 = 0.693 / k.",
    "formula_or_law": "t_{1/2} = \\frac{\\ln 2}{k} = \\frac{0.693}{k}"
  },
  {
    "question_uid": "HIS-TN-01-01-M1-E-0094",
    "taxonomy": {
      "subject": "History",
      "subject_code": "HIS",
      "domain": "Tamil Nadu History",
      "domain_code": "TN",
      "topic": "Photosynthesis & Principles",
      "topic_code": "01",
      "subtopic": "Cholas, Pandyas & Cheras",
      "subtopic_code": "01",
      "microtopic": "Photosynthesis Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Easy",
      "exam_category": "TNPSC",
      "question_format": "assertion_reason"
    },
    "question_format": "assertion_reason",
    "exam_category": "TNPSC",
    "question_text": "[#0094] During photosynthesis in chloroplasts, photolysis of water occurs at the _______ complex of PS II.",
    "question_text_ta": "[#0094] ஒளிச்சேர்க்கையின் போது நீர் மூலக்கூறு ஒளிச்சிதைவு PS II இன் _______ வளாகத்தில் நடைபெறுகிறது.",
    "options": {
      "A": "Oxygen-Evolving Complex (OEC - ஆக்ஸிஜன் வெளிப்படுத்தும் மையம்)",
      "B": "ATP Synthase CF0-CF1 complex",
      "C": "Photosystem I reaction center P700",
      "D": "Cytochrome b6f complex"
    },
    "correct_option": "A",
    "explanation": "[Question #0094] Water photolysis (2H2O -> 4H+ + 4e- + O2) is catalyzed by the manganese-containing oxygen-evolving complex located on the luminal side of PS II.",
    "explanation_ta": "[கேள்வி எண் #0094] நீர் மூலக்கூறு சிதைவு PS II இன் ஆக்ஸிஜன் வெளிப்படுத்தும் மையத்தால் வினையூக்கப்படுகிறது.",
    "formula_or_law": "2\\text{H}_2\\text{O} \\xrightarrow{h\\nu, \\text{PS II}} 4\\text{H}^+ + 4e^- + \\text{O}_2"
  },
  {
    "question_uid": "HIS-MOD-01-01-M2-M-0095",
    "taxonomy": {
      "subject": "History",
      "subject_code": "HIS",
      "domain": "Modern India",
      "domain_code": "MOD",
      "topic": "Matrices & Principles",
      "topic_code": "01",
      "subtopic": "Non-Cooperation & Civil Disobedience",
      "subtopic_code": "01",
      "microtopic": "Matrices Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "TNPSC",
      "question_format": "numerical"
    },
    "question_format": "numerical",
    "exam_category": "TNPSC",
    "question_text": "[#0095] The sum of all eigenvalues of an n x n square matrix A is identically equal to the _______ of matrix A.",
    "question_text_ta": "[#0095] ஒரு சதுர அணி A இன் அனைத்து ஐகன் மதிப்புகளின் கூடுதல் அந்த அணியின் _______ க்குச் சமமாகும்.",
    "options": {
      "A": "Trace (சுவடு - Tr(A))",
      "B": "Determinant (அணிக்கோவை மதிப்பு)",
      "C": "Rank (அணியின் தரம்)",
      "D": "Nullity (வெற்றுமை)"
    },
    "correct_option": "A",
    "explanation": "[Question #0095] The trace of any square matrix equals the sum of its main diagonal elements, which identically equals the algebraic sum of all its eigenvalues.",
    "explanation_ta": "[கேள்வி எண் #0095] ஒரு சதுர அணியின் சுவடு (Trace) அதன் முதன்மை மூலைவிட்ட உறுப்புகளின் கூடுதலுக்கு மற்றும் அனைத்து ஐகன் மதிப்புகளின் கூடுதலுக்குச் சமமாகும்.",
    "formula_or_law": "\\text{Tr}(A) = \\sum_{i=1}^n a_{ii} = \\sum_{i=1}^n \\lambda_i"
  },
  {
    "question_uid": "POL-CON-01-01-M1-E-0096",
    "taxonomy": {
      "subject": "Polity",
      "subject_code": "POL",
      "domain": "Constitution",
      "domain_code": "CON",
      "topic": "Binary Search Trees & Principles",
      "topic_code": "01",
      "subtopic": "Articles 14-32 & Writs",
      "subtopic_code": "01",
      "microtopic": "Binary Search Trees Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Easy",
      "exam_category": "TNPSC",
      "question_format": "match_the_following"
    },
    "question_format": "match_the_following",
    "exam_category": "TNPSC",
    "question_text": "[#0096] In an AVL Tree, the balance factor for every node is strictly constrained to the set _______ .",
    "question_text_ta": "[#0096] AVL மரத்தில் ஒவ்வொரு முனையின் சமநிலை காரணி (Balance Factor) எப்போதும் _______ கணத்திற்குள் இருக்க வேண்டும்.",
    "options": {
      "A": "{-1, 0, +1}",
      "B": "{0, 1, 2}",
      "C": "{-2, 0, +2}",
      "D": "{0, 1}"
    },
    "correct_option": "A",
    "explanation": "[Question #0096] An AVL tree is a self-balancing binary search tree where the height difference between left and right subtrees (Balance Factor = Height(L) - Height(R)) is strictly in {-1, 0, 1}.",
    "explanation_ta": "[கேள்வி எண் #0096] AVL மரத்தில் இடது மற்றும் வலது துணை மரங்களின் உயர வேறுபாடு எப்போதும் -1, 0, அல்லது +1 ஆக மட்டுமே இருக்க வேண்டும்.",
    "formula_or_law": "\\text{BF}(v) = h(\\text{left}(v)) - h(\\text{right}(v)) \\in \\{-1, 0, +1\\}"
  },
  {
    "question_uid": "POL-GOV-01-01-M2-M-0097",
    "taxonomy": {
      "subject": "Polity",
      "subject_code": "POL",
      "domain": "Governance",
      "domain_code": "GOV",
      "topic": "Constitution & Principles",
      "topic_code": "01",
      "subtopic": "Lok Sabha & Supreme Court",
      "subtopic_code": "01",
      "microtopic": "Constitution Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "SSC_BANK",
      "question_format": "pyq"
    },
    "question_format": "pyq",
    "exam_category": "SSC_BANK",
    "question_text": "[#0097] Under Article _______ of the Constitution of India, High Courts have the power to issue Writs for Fundamental Rights and other legal rights.",
    "question_text_ta": "[#0097] இந்திய அரசியலமைப்பின் சட்டப்பிரிவு _______ இன் கீழ் உயர்நீதிமன்றங்கள் நீதிப்பேராணைகளை வெளியிடும் அதிகாரம் பெற்றுள்ளன.",
    "options": {
      "A": "Article 226",
      "B": "Article 32",
      "C": "Article 14",
      "D": "Article 368"
    },
    "correct_option": "A",
    "explanation": "[Question #0097] Article 226 empowers High Courts to issue Writs for Fundamental Rights as well as ordinary legal rights, giving it a wider textual scope than Article 32.",
    "explanation_ta": "[கேள்வி எண் #0097] சட்டப்பிரிவு 226 உயர்நீதிமன்றங்களுக்கு அடிப்படை உரிமைகள் மற்றும் பிற சட்ட உரிமைகளுக்காகவும் நீதிப்பேராணைகளை வழங்கும் அதிகாரத்தை அளிக்கிறது.",
    "formula_or_law": "\\text{Article 226} \\implies \\text{High Court Writ Jurisdiction}"
  },
  {
    "question_uid": "GEO-IND-01-01-M1-E-0098",
    "taxonomy": {
      "subject": "Geography",
      "subject_code": "GEO",
      "domain": "Indian Geography",
      "domain_code": "IND",
      "topic": "Cholas & Principles",
      "topic_code": "01",
      "subtopic": "Himalayan & Peninsular Rivers",
      "subtopic_code": "01",
      "microtopic": "Cholas Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Easy",
      "exam_category": "TNPSC",
      "question_format": "theory"
    },
    "question_format": "theory",
    "exam_category": "TNPSC",
    "question_text": "[#0098] The famous Uttaramerur Inscription of Parantaka Chola I describes the _______ system of secret ballot village democracy.",
    "question_text_ta": "[#0098] முதலாம் பராந்தக சோழனின் உத்திரமேரூர் கல்வெட்டு கிராம நிர்வாகத்திற்கான _______ தேர்தல் முறையை விவரிக்கிறது.",
    "options": {
      "A": "Kudavolai (குடவோலை முறை)",
      "B": "Kadamai (கடமை முறை)",
      "C": "Variyam (வாரிய வரி விதிப்பு)",
      "D": "Kaniurimai (காணியுரிமை முறை)"
    },
    "correct_option": "A",
    "explanation": "[Question #0098] The Uttaramerur inscription details the Kudavolai secret ballot system for electing members to village committees (Variyams) with strict qualifications and disqualifications.",
    "explanation_ta": "[கேள்வி எண் #0098] உத்திரமேரூர் கல்வெட்டு கிராம சபைக் குழுக்களுக்கு (வாரியங்கள்) குடவோலை முறை மூலம் உறுப்பினர்களைத் தேர்ந்தெடுக்கும் தேர்தல் முறையை விவரிக்கிறது.",
    "formula_or_law": "\\text{Uttaramerur Inscription} \\implies \\text{Village Kudavolai Democracy}"
  },
  {
    "question_uid": "GEO-TN-01-01-M2-M-0099",
    "taxonomy": {
      "subject": "Geography",
      "subject_code": "GEO",
      "domain": "Tamil Nadu Geography",
      "domain_code": "TN",
      "topic": "Monsoons & Principles",
      "topic_code": "01",
      "subtopic": "Monsoons & Soil Types",
      "subtopic_code": "01",
      "microtopic": "Monsoons Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "TNPSC",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "TNPSC",
    "question_text": "[#0099] Tamil Nadu receives nearly 48% to 50% of its annual precipitation from the _______ Monsoon season.",
    "question_text_ta": "[#0099] தமிழ்நாடு தனது ஆண்டு மழையில் சுமார் 48% முதல் 50% பங்கை _______ பருவமழை காலத்தில் பெறுகிறது.",
    "options": {
      "A": "North-East Monsoon (வடகிழக்குப் பருவமழை)",
      "B": "South-West Monsoon (தென்மேற்குப் பருவமழை)",
      "C": "Pre-Monsoon Convectional Showers (கோடை மழை)",
      "D": "Winter Cyclonic Disturbances"
    },
    "correct_option": "A",
    "explanation": "[Question #0099] The North-East Monsoon accounts for nearly 48-50% of Tamil Nadu's annual precipitation as retreating winds pick up moisture across the Bay of Bengal and hit the Coromandel coast.",
    "explanation_ta": "[கேள்வி எண் #0099] தமிழ்நாடு தனது ஆண்டு மழையில் சுமார் 48-50% பங்கை வடகிழக்குப் பருவமழை மூலமே பெறுகிறது.",
    "formula_or_law": "\\text{NE Monsoon (Oct-Dec)} \\implies 48\\text{--}50\\% \\text{ TN Precipitation}"
  },
  {
    "question_uid": "APT-NUM-01-01-M1-E-0100",
    "taxonomy": {
      "subject": "Aptitude",
      "subject_code": "APT",
      "domain": "Quantitative Aptitude",
      "domain_code": "NUM",
      "topic": "Simple Interest & Principles",
      "topic_code": "01",
      "subtopic": "Simple & Compound Interest",
      "subtopic_code": "01",
      "microtopic": "Simple Interest Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Easy",
      "exam_category": "SSC_BANK",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "SSC_BANK",
    "question_text": "[#0100] If SI = (P * R * N) / 100, the total accumulated amount A is calculated by the formula A = _______ .",
    "question_text_ta": "[#0100] தனிவட்டி SI = (P * R * N) / 100 எனில், மொத்தத் தொகை A கணக்கிடும் சூத்திரம் A = _______ ஆகும்.",
    "options": {
      "A": "P [1 + (R * N) / 100]",
      "B": "P [1 + R / 100]^N",
      "C": "(P * R * N) / 100",
      "D": "P / [1 + (R * N) / 100]"
    },
    "correct_option": "A",
    "explanation": "[Question #0100] Total Amount A = Principal P + Simple Interest SI = P + (P * R * N) / 100 = P [1 + (R * N) / 100].",
    "explanation_ta": "[கேள்வி எண் #0100] மொத்தத் தொகை A = அசல் + தனிவட்டி = P [1 + (R * N) / 100].",
    "formula_or_law": "A = P \\left(1 + \\frac{R \\cdot N}{100}\\right)"
  },
  {
    "question_uid": "PHY-MEC-01-01-M1-M-0101",
    "taxonomy": {
      "subject": "Physics",
      "subject_code": "PHY",
      "domain": "Mechanics",
      "domain_code": "MEC",
      "topic": "Kinematics & Principles",
      "topic_code": "01",
      "subtopic": "Motion in 2D & Projectiles",
      "subtopic_code": "01",
      "microtopic": "Kinematics Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Medium",
      "exam_category": "NEET_JEE",
      "question_format": "assertion_reason"
    },
    "question_format": "assertion_reason",
    "exam_category": "NEET_JEE",
    "question_text": "[#0101] In two-dimensional projectile motion without air resistance, the horizontal velocity component remains _______ throughout the flight.",
    "question_text_ta": "[#0101] காற்று உராய்வு இல்லாத இருபரிமாண எறிபொருள் இயக்கத்தில் கிடைமட்ட திசைவேகக் கூறு இயக்கம் முழுவதும் _______ ஆக இருக்கும்.",
    "options": {
      "A": "Constant (மாறிலி)",
      "B": "Zero at highest point (உச்சியில் சுழி)",
      "C": "Linearly increasing (நேர்கோட்டில் அதிகரிக்கும்)",
      "D": "Exponentially decaying (அதிவேகமாக குறையும்)"
    },
    "correct_option": "A",
    "explanation": "[Question #0101] Since gravity acts solely vertically downward (a_y = -g), horizontal acceleration a_x = 0, keeping horizontal velocity v_x = u cos θ strictly constant.",
    "explanation_ta": "[கேள்வி எண் #0101] புவியீர்ப்பு விசை செங்குத்தாக மட்டுமே செயல்படுவதால் கிடைமட்ட முடுக்கம் a_x = 0, எனவே v_x மாறிலியாக இருக்கும்.",
    "formula_or_law": "v_x = u \\cos\\theta = \\text{constant}"
  },
  {
    "question_uid": "PHY-ELE-01-01-M2-E-0102",
    "taxonomy": {
      "subject": "Physics",
      "subject_code": "PHY",
      "domain": "Electrodynamics",
      "domain_code": "ELE",
      "topic": "Ohm Law & Principles",
      "topic_code": "01",
      "subtopic": "Ohm Law & Kirchhoff Rules",
      "subtopic_code": "01",
      "microtopic": "Ohm Law Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Easy",
      "exam_category": "NEET_JEE",
      "question_format": "numerical"
    },
    "question_format": "numerical",
    "exam_category": "NEET_JEE",
    "question_text": "[#0102] According to microscopic Ohm's law, the electrical conductivity σ is given by the formula _______ .",
    "question_text_ta": "[#0102] நுண்ணோக்கி ஓம் விதியின்படி ஒரு கடத்தியின் மின்கடத்துத்திறன் σ சமன்பாடு _______ ஆகும்.",
    "options": {
      "A": "σ = (n e² τ) / m",
      "B": "σ = (m e² τ) / n",
      "C": "σ = (n e τ) / m²",
      "D": "σ = (n² e τ) / m"
    },
    "correct_option": "A",
    "explanation": "[Question #0102] Conductivity σ is derived from J = n e v_d where v_d = (e E τ) / m, leading to J = (n e² τ / m) E = σ E.",
    "explanation_ta": "[கேள்வி எண் #0102] மின்கடத்துத்திறன் σ = (n e² τ) / m ஆகும்.",
    "formula_or_law": "\\sigma = \\frac{n e^2 \\tau}{m}"
  },
  {
    "question_uid": "PHY-OPT-01-01-M3-H-0103",
    "taxonomy": {
      "subject": "Physics",
      "subject_code": "PHY",
      "domain": "Optics",
      "domain_code": "OPT",
      "topic": "Chemical Kinetics & Principles",
      "topic_code": "01",
      "subtopic": "Interference & Diffraction",
      "subtopic_code": "01",
      "microtopic": "Chemical Kinetics Core Rule",
      "microtopic_code": "M3",
      "difficulty": "Hard",
      "exam_category": "SCHOOL_K12",
      "question_format": "match_the_following"
    },
    "question_format": "match_the_following",
    "exam_category": "SCHOOL_K12",
    "question_text": "[#0103] For a first-order chemical reaction, the half-life period t_1/2 is _______ of initial reactant concentration.",
    "question_text_ta": "[#0103] ஒரு முதல் வகை வேதிவினைக்கு அரைவாழ்வு காலம் தொடக்கச் செறிவை _______ .",
    "options": {
      "A": "Independent (சார்ந்திருக்காது - t_1/2 = 0.693 / k)",
      "B": "Directly proportional (நேர்விகிதத்தில் சார்ந்தது)",
      "C": "Inversely proportional (எதிர்விகிதத்தில் சார்ந்தது)",
      "D": "Exponentially dependent (அதிவேகமாக சார்ந்தது)"
    },
    "correct_option": "A",
    "explanation": "[Question #0103] For first order: k = (2.303 / t) log([A]_0 / [A]). At t = t_1/2, [A] = [A]_0 / 2, giving t_1/2 = ln(2) / k = 0.693 / k.",
    "explanation_ta": "[கேள்வி எண் #0103] முதல் வகை வினைக்கு அரைவாழ்வு காலம் தொடக்கச் செறிவைச் சார்ந்திருக்காது: t_1/2 = 0.693 / k.",
    "formula_or_law": "t_{1/2} = \\frac{\\ln 2}{k} = \\frac{0.693}{k}"
  },
  {
    "question_uid": "CHE-ORG-01-01-M1-H-0104",
    "taxonomy": {
      "subject": "Chemistry",
      "subject_code": "CHE",
      "domain": "Organic Chemistry",
      "domain_code": "ORG",
      "topic": "Photosynthesis & Principles",
      "topic_code": "01",
      "subtopic": "Electrophilic & Nucleophilic",
      "subtopic_code": "01",
      "microtopic": "Photosynthesis Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Hard",
      "exam_category": "NEET_JEE",
      "question_format": "pyq"
    },
    "question_format": "pyq",
    "exam_category": "NEET_JEE",
    "question_text": "[#0104] During photosynthesis in chloroplasts, photolysis of water occurs at the _______ complex of PS II.",
    "question_text_ta": "[#0104] ஒளிச்சேர்க்கையின் போது நீர் மூலக்கூறு ஒளிச்சிதைவு PS II இன் _______ வளாகத்தில் நடைபெறுகிறது.",
    "options": {
      "A": "Oxygen-Evolving Complex (OEC - ஆக்ஸிஜன் வெளிப்படுத்தும் மையம்)",
      "B": "ATP Synthase CF0-CF1 complex",
      "C": "Photosystem I reaction center P700",
      "D": "Cytochrome b6f complex"
    },
    "correct_option": "A",
    "explanation": "[Question #0104] Water photolysis (2H2O -> 4H+ + 4e- + O2) is catalyzed by the manganese-containing oxygen-evolving complex located on the luminal side of PS II.",
    "explanation_ta": "[கேள்வி எண் #0104] நீர் மூலக்கூறு சிதைவு PS II இன் ஆக்ஸிஜன் வெளிப்படுத்தும் மையத்தால் வினையூக்கப்படுகிறது.",
    "formula_or_law": "2\\text{H}_2\\text{O} \\xrightarrow{h\\nu, \\text{PS II}} 4\\text{H}^+ + 4e^- + \\text{O}_2"
  },
  {
    "question_uid": "CHE-INO-01-01-M2-M-0105",
    "taxonomy": {
      "subject": "Chemistry",
      "subject_code": "CHE",
      "domain": "Inorganic Chemistry",
      "domain_code": "INO",
      "topic": "Matrices & Principles",
      "topic_code": "01",
      "subtopic": "Ligand Field & Isomerism",
      "subtopic_code": "01",
      "microtopic": "Matrices Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "NEET_JEE",
      "question_format": "theory"
    },
    "question_format": "theory",
    "exam_category": "NEET_JEE",
    "question_text": "[#0105] The sum of all eigenvalues of an n x n square matrix A is identically equal to the _______ of matrix A.",
    "question_text_ta": "[#0105] ஒரு சதுர அணி A இன் அனைத்து ஐகன் மதிப்புகளின் கூடுதல் அந்த அணியின் _______ க்குச் சமமாகும்.",
    "options": {
      "A": "Trace (சுவடு - Tr(A))",
      "B": "Determinant (அணிக்கோவை மதிப்பு)",
      "C": "Rank (அணியின் தரம்)",
      "D": "Nullity (வெற்றுமை)"
    },
    "correct_option": "A",
    "explanation": "[Question #0105] The trace of any square matrix equals the sum of its main diagonal elements, which identically equals the algebraic sum of all its eigenvalues.",
    "explanation_ta": "[கேள்வி எண் #0105] ஒரு சதுர அணியின் சுவடு (Trace) அதன் முதன்மை மூலைவிட்ட உறுப்புகளின் கூடுதலுக்கு மற்றும் அனைத்து ஐகன் மதிப்புகளின் கூடுதலுக்குச் சமமாகும்.",
    "formula_or_law": "\\text{Tr}(A) = \\sum_{i=1}^n a_{ii} = \\sum_{i=1}^n \\lambda_i"
  },
  {
    "question_uid": "CHE-PHY-01-01-M3-M-0106",
    "taxonomy": {
      "subject": "Chemistry",
      "subject_code": "CHE",
      "domain": "Physical Chemistry",
      "domain_code": "PHY",
      "topic": "Binary Search Trees & Principles",
      "topic_code": "01",
      "subtopic": "Rate Laws & Arrhenius",
      "subtopic_code": "01",
      "microtopic": "Binary Search Trees Core Rule",
      "microtopic_code": "M3",
      "difficulty": "Medium",
      "exam_category": "SCHOOL_K12",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "SCHOOL_K12",
    "question_text": "[#0106] In an AVL Tree, the balance factor for every node is strictly constrained to the set _______ .",
    "question_text_ta": "[#0106] AVL மரத்தில் ஒவ்வொரு முனையின் சமநிலை காரணி (Balance Factor) எப்போதும் _______ கணத்திற்குள் இருக்க வேண்டும்.",
    "options": {
      "A": "{-1, 0, +1}",
      "B": "{0, 1, 2}",
      "C": "{-2, 0, +2}",
      "D": "{0, 1}"
    },
    "correct_option": "A",
    "explanation": "[Question #0106] An AVL tree is a self-balancing binary search tree where the height difference between left and right subtrees (Balance Factor = Height(L) - Height(R)) is strictly in {-1, 0, 1}.",
    "explanation_ta": "[கேள்வி எண் #0106] AVL மரத்தில் இடது மற்றும் வலது துணை மரங்களின் உயர வேறுபாடு எப்போதும் -1, 0, அல்லது +1 ஆக மட்டுமே இருக்க வேண்டும்.",
    "formula_or_law": "\\text{BF}(v) = h(\\text{left}(v)) - h(\\text{right}(v)) \\in \\{-1, 0, +1\\}"
  },
  {
    "question_uid": "BIO-BOT-01-01-M1-M-0107",
    "taxonomy": {
      "subject": "Biology",
      "subject_code": "BIO",
      "domain": "Botany",
      "domain_code": "BOT",
      "topic": "Constitution & Principles",
      "topic_code": "01",
      "subtopic": "Photosynthesis C3 & C4",
      "subtopic_code": "01",
      "microtopic": "Constitution Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Medium",
      "exam_category": "NEET_JEE",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "NEET_JEE",
    "question_text": "[#0107] Under Article _______ of the Constitution of India, High Courts have the power to issue Writs for Fundamental Rights and other legal rights.",
    "question_text_ta": "[#0107] இந்திய அரசியலமைப்பின் சட்டப்பிரிவு _______ இன் கீழ் உயர்நீதிமன்றங்கள் நீதிப்பேராணைகளை வெளியிடும் அதிகாரம் பெற்றுள்ளன.",
    "options": {
      "A": "Article 226",
      "B": "Article 32",
      "C": "Article 14",
      "D": "Article 368"
    },
    "correct_option": "A",
    "explanation": "[Question #0107] Article 226 empowers High Courts to issue Writs for Fundamental Rights as well as ordinary legal rights, giving it a wider textual scope than Article 32.",
    "explanation_ta": "[கேள்வி எண் #0107] சட்டப்பிரிவு 226 உயர்நீதிமன்றங்களுக்கு அடிப்படை உரிமைகள் மற்றும் பிற சட்ட உரிமைகளுக்காகவும் நீதிப்பேராணைகளை வழங்கும் அதிகாரத்தை அளிக்கிறது.",
    "formula_or_law": "\\text{Article 226} \\implies \\text{High Court Writ Jurisdiction}"
  },
  {
    "question_uid": "BIO-ZOO-01-01-M2-E-0108",
    "taxonomy": {
      "subject": "Biology",
      "subject_code": "BIO",
      "domain": "Zoology",
      "domain_code": "ZOO",
      "topic": "Cholas & Principles",
      "topic_code": "01",
      "subtopic": "Endocrine & Neural System",
      "subtopic_code": "01",
      "microtopic": "Cholas Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Easy",
      "exam_category": "NEET_JEE",
      "question_format": "assertion_reason"
    },
    "question_format": "assertion_reason",
    "exam_category": "NEET_JEE",
    "question_text": "[#0108] The famous Uttaramerur Inscription of Parantaka Chola I describes the _______ system of secret ballot village democracy.",
    "question_text_ta": "[#0108] முதலாம் பராந்தக சோழனின் உத்திரமேரூர் கல்வெட்டு கிராம நிர்வாகத்திற்கான _______ தேர்தல் முறையை விவரிக்கிறது.",
    "options": {
      "A": "Kudavolai (குடவோலை முறை)",
      "B": "Kadamai (கடமை முறை)",
      "C": "Variyam (வாரிய வரி விதிப்பு)",
      "D": "Kaniurimai (காணியுரிமை முறை)"
    },
    "correct_option": "A",
    "explanation": "[Question #0108] The Uttaramerur inscription details the Kudavolai secret ballot system for electing members to village committees (Variyams) with strict qualifications and disqualifications.",
    "explanation_ta": "[கேள்வி எண் #0108] உத்திரமேரூர் கல்வெட்டு கிராம சபைக் குழுக்களுக்கு (வாரியங்கள்) குடவோலை முறை மூலம் உறுப்பினர்களைத் தேர்ந்தெடுக்கும் தேர்தல் முறையை விவரிக்கிறது.",
    "formula_or_law": "\\text{Uttaramerur Inscription} \\implies \\text{Village Kudavolai Democracy}"
  },
  {
    "question_uid": "BIO-GEN-01-01-M3-H-0109",
    "taxonomy": {
      "subject": "Biology",
      "subject_code": "BIO",
      "domain": "Genetics",
      "domain_code": "GEN",
      "topic": "Monsoons & Principles",
      "topic_code": "01",
      "subtopic": "DNA Replication & Translation",
      "subtopic_code": "01",
      "microtopic": "Monsoons Core Rule",
      "microtopic_code": "M3",
      "difficulty": "Hard",
      "exam_category": "SCHOOL_K12",
      "question_format": "numerical"
    },
    "question_format": "numerical",
    "exam_category": "SCHOOL_K12",
    "question_text": "[#0109] Tamil Nadu receives nearly 48% to 50% of its annual precipitation from the _______ Monsoon season.",
    "question_text_ta": "[#0109] தமிழ்நாடு தனது ஆண்டு மழையில் சுமார் 48% முதல் 50% பங்கை _______ பருவமழை காலத்தில் பெறுகிறது.",
    "options": {
      "A": "North-East Monsoon (வடகிழக்குப் பருவமழை)",
      "B": "South-West Monsoon (தென்மேற்குப் பருவமழை)",
      "C": "Pre-Monsoon Convectional Showers (கோடை மழை)",
      "D": "Winter Cyclonic Disturbances"
    },
    "correct_option": "A",
    "explanation": "[Question #0109] The North-East Monsoon accounts for nearly 48-50% of Tamil Nadu's annual precipitation as retreating winds pick up moisture across the Bay of Bengal and hit the Coromandel coast.",
    "explanation_ta": "[கேள்வி எண் #0109] தமிழ்நாடு தனது ஆண்டு மழையில் சுமார் 48-50% பங்கை வடகிழக்குப் பருவமழை மூலமே பெறுகிறது.",
    "formula_or_law": "\\text{NE Monsoon (Oct-Dec)} \\implies 48\\text{--}50\\% \\text{ TN Precipitation}"
  },
  {
    "question_uid": "MAT-CAL-01-01-M1-H-0110",
    "taxonomy": {
      "subject": "Mathematics",
      "subject_code": "MAT",
      "domain": "Calculus",
      "domain_code": "CAL",
      "topic": "Simple Interest & Principles",
      "topic_code": "01",
      "subtopic": "Definite Integrals & Limits",
      "subtopic_code": "01",
      "microtopic": "Simple Interest Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Hard",
      "exam_category": "NEET_JEE",
      "question_format": "match_the_following"
    },
    "question_format": "match_the_following",
    "exam_category": "NEET_JEE",
    "question_text": "[#0110] If SI = (P * R * N) / 100, the total accumulated amount A is calculated by the formula A = _______ .",
    "question_text_ta": "[#0110] தனிவட்டி SI = (P * R * N) / 100 எனில், மொத்தத் தொகை A கணக்கிடும் சூத்திரம் A = _______ ஆகும்.",
    "options": {
      "A": "P [1 + (R * N) / 100]",
      "B": "P [1 + R / 100]^N",
      "C": "(P * R * N) / 100",
      "D": "P / [1 + (R * N) / 100]"
    },
    "correct_option": "A",
    "explanation": "[Question #0110] Total Amount A = Principal P + Simple Interest SI = P + (P * R * N) / 100 = P [1 + (R * N) / 100].",
    "explanation_ta": "[கேள்வி எண் #0110] மொத்தத் தொகை A = அசல் + தனிவட்டி = P [1 + (R * N) / 100].",
    "formula_or_law": "A = P \\left(1 + \\frac{R \\cdot N}{100}\\right)"
  },
  {
    "question_uid": "MAT-ALG-01-01-M2-M-0111",
    "taxonomy": {
      "subject": "Mathematics",
      "subject_code": "MAT",
      "domain": "Algebra",
      "domain_code": "ALG",
      "topic": "Kinematics & Principles",
      "topic_code": "01",
      "subtopic": "Eigenvalues & Rank",
      "subtopic_code": "01",
      "microtopic": "Kinematics Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "SCHOOL_K12",
      "question_format": "pyq"
    },
    "question_format": "pyq",
    "exam_category": "SCHOOL_K12",
    "question_text": "[#0111] In two-dimensional projectile motion without air resistance, the horizontal velocity component remains _______ throughout the flight.",
    "question_text_ta": "[#0111] காற்று உராய்வு இல்லாத இருபரிமாண எறிபொருள் இயக்கத்தில் கிடைமட்ட திசைவேகக் கூறு இயக்கம் முழுவதும் _______ ஆக இருக்கும்.",
    "options": {
      "A": "Constant (மாறிலி)",
      "B": "Zero at highest point (உச்சியில் சுழி)",
      "C": "Linearly increasing (நேர்கோட்டில் அதிகரிக்கும்)",
      "D": "Exponentially decaying (அதிவேகமாக குறையும்)"
    },
    "correct_option": "A",
    "explanation": "[Question #0111] Since gravity acts solely vertically downward (a_y = -g), horizontal acceleration a_x = 0, keeping horizontal velocity v_x = u cos θ strictly constant.",
    "explanation_ta": "[கேள்வி எண் #0111] புவியீர்ப்பு விசை செங்குத்தாக மட்டுமே செயல்படுவதால் கிடைமட்ட முடுக்கம் a_x = 0, எனவே v_x மாறிலியாக இருக்கும்.",
    "formula_or_law": "v_x = u \\cos\\theta = \\text{constant}"
  },
  {
    "question_uid": "CS-DSA-01-01-M1-M-0112",
    "taxonomy": {
      "subject": "Computer Science",
      "subject_code": "CS",
      "domain": "Algorithms",
      "domain_code": "DSA",
      "topic": "Ohm Law & Principles",
      "topic_code": "01",
      "subtopic": "Binary Search Trees & AVL",
      "subtopic_code": "01",
      "microtopic": "Ohm Law Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Medium",
      "exam_category": "SSC_BANK",
      "question_format": "theory"
    },
    "question_format": "theory",
    "exam_category": "SSC_BANK",
    "question_text": "[#0112] According to microscopic Ohm's law, the electrical conductivity σ is given by the formula _______ .",
    "question_text_ta": "[#0112] நுண்ணோக்கி ஓம் விதியின்படி ஒரு கடத்தியின் மின்கடத்துத்திறன் σ சமன்பாடு _______ ஆகும்.",
    "options": {
      "A": "σ = (n e² τ) / m",
      "B": "σ = (m e² τ) / n",
      "C": "σ = (n e τ) / m²",
      "D": "σ = (n² e τ) / m"
    },
    "correct_option": "A",
    "explanation": "[Question #0112] Conductivity σ is derived from J = n e v_d where v_d = (e E τ) / m, leading to J = (n e² τ / m) E = σ E.",
    "explanation_ta": "[கேள்வி எண் #0112] மின்கடத்துத்திறன் σ = (n e² τ) / m ஆகும்.",
    "formula_or_law": "\\sigma = \\frac{n e^2 \\tau}{m}"
  },
  {
    "question_uid": "CS-DBMS-01-01-M2-E-0113",
    "taxonomy": {
      "subject": "Computer Science",
      "subject_code": "CS",
      "domain": "Databases",
      "domain_code": "DBMS",
      "topic": "Chemical Kinetics & Principles",
      "topic_code": "01",
      "subtopic": "Normalization & Indexing",
      "subtopic_code": "01",
      "microtopic": "Chemical Kinetics Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Easy",
      "exam_category": "SSC_BANK",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "SSC_BANK",
    "question_text": "[#0113] For a first-order chemical reaction, the half-life period t_1/2 is _______ of initial reactant concentration.",
    "question_text_ta": "[#0113] ஒரு முதல் வகை வேதிவினைக்கு அரைவாழ்வு காலம் தொடக்கச் செறிவை _______ .",
    "options": {
      "A": "Independent (சார்ந்திருக்காது - t_1/2 = 0.693 / k)",
      "B": "Directly proportional (நேர்விகிதத்தில் சார்ந்தது)",
      "C": "Inversely proportional (எதிர்விகிதத்தில் சார்ந்தது)",
      "D": "Exponentially dependent (அதிவேகமாக சார்ந்தது)"
    },
    "correct_option": "A",
    "explanation": "[Question #0113] For first order: k = (2.303 / t) log([A]_0 / [A]). At t = t_1/2, [A] = [A]_0 / 2, giving t_1/2 = ln(2) / k = 0.693 / k.",
    "explanation_ta": "[கேள்வி எண் #0113] முதல் வகை வினைக்கு அரைவாழ்வு காலம் தொடக்கச் செறிவைச் சார்ந்திருக்காது: t_1/2 = 0.693 / k.",
    "formula_or_law": "t_{1/2} = \\frac{\\ln 2}{k} = \\frac{0.693}{k}"
  },
  {
    "question_uid": "HIS-TN-01-01-M1-E-0114",
    "taxonomy": {
      "subject": "History",
      "subject_code": "HIS",
      "domain": "Tamil Nadu History",
      "domain_code": "TN",
      "topic": "Photosynthesis & Principles",
      "topic_code": "01",
      "subtopic": "Cholas, Pandyas & Cheras",
      "subtopic_code": "01",
      "microtopic": "Photosynthesis Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Easy",
      "exam_category": "TNPSC",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "TNPSC",
    "question_text": "[#0114] During photosynthesis in chloroplasts, photolysis of water occurs at the _______ complex of PS II.",
    "question_text_ta": "[#0114] ஒளிச்சேர்க்கையின் போது நீர் மூலக்கூறு ஒளிச்சிதைவு PS II இன் _______ வளாகத்தில் நடைபெறுகிறது.",
    "options": {
      "A": "Oxygen-Evolving Complex (OEC - ஆக்ஸிஜன் வெளிப்படுத்தும் மையம்)",
      "B": "ATP Synthase CF0-CF1 complex",
      "C": "Photosystem I reaction center P700",
      "D": "Cytochrome b6f complex"
    },
    "correct_option": "A",
    "explanation": "[Question #0114] Water photolysis (2H2O -> 4H+ + 4e- + O2) is catalyzed by the manganese-containing oxygen-evolving complex located on the luminal side of PS II.",
    "explanation_ta": "[கேள்வி எண் #0114] நீர் மூலக்கூறு சிதைவு PS II இன் ஆக்ஸிஜன் வெளிப்படுத்தும் மையத்தால் வினையூக்கப்படுகிறது.",
    "formula_or_law": "2\\text{H}_2\\text{O} \\xrightarrow{h\\nu, \\text{PS II}} 4\\text{H}^+ + 4e^- + \\text{O}_2"
  },
  {
    "question_uid": "HIS-MOD-01-01-M2-M-0115",
    "taxonomy": {
      "subject": "History",
      "subject_code": "HIS",
      "domain": "Modern India",
      "domain_code": "MOD",
      "topic": "Matrices & Principles",
      "topic_code": "01",
      "subtopic": "Non-Cooperation & Civil Disobedience",
      "subtopic_code": "01",
      "microtopic": "Matrices Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "TNPSC",
      "question_format": "assertion_reason"
    },
    "question_format": "assertion_reason",
    "exam_category": "TNPSC",
    "question_text": "[#0115] The sum of all eigenvalues of an n x n square matrix A is identically equal to the _______ of matrix A.",
    "question_text_ta": "[#0115] ஒரு சதுர அணி A இன் அனைத்து ஐகன் மதிப்புகளின் கூடுதல் அந்த அணியின் _______ க்குச் சமமாகும்.",
    "options": {
      "A": "Trace (சுவடு - Tr(A))",
      "B": "Determinant (அணிக்கோவை மதிப்பு)",
      "C": "Rank (அணியின் தரம்)",
      "D": "Nullity (வெற்றுமை)"
    },
    "correct_option": "A",
    "explanation": "[Question #0115] The trace of any square matrix equals the sum of its main diagonal elements, which identically equals the algebraic sum of all its eigenvalues.",
    "explanation_ta": "[கேள்வி எண் #0115] ஒரு சதுர அணியின் சுவடு (Trace) அதன் முதன்மை மூலைவிட்ட உறுப்புகளின் கூடுதலுக்கு மற்றும் அனைத்து ஐகன் மதிப்புகளின் கூடுதலுக்குச் சமமாகும்.",
    "formula_or_law": "\\text{Tr}(A) = \\sum_{i=1}^n a_{ii} = \\sum_{i=1}^n \\lambda_i"
  },
  {
    "question_uid": "POL-CON-01-01-M1-E-0116",
    "taxonomy": {
      "subject": "Polity",
      "subject_code": "POL",
      "domain": "Constitution",
      "domain_code": "CON",
      "topic": "Binary Search Trees & Principles",
      "topic_code": "01",
      "subtopic": "Articles 14-32 & Writs",
      "subtopic_code": "01",
      "microtopic": "Binary Search Trees Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Easy",
      "exam_category": "TNPSC",
      "question_format": "numerical"
    },
    "question_format": "numerical",
    "exam_category": "TNPSC",
    "question_text": "[#0116] In an AVL Tree, the balance factor for every node is strictly constrained to the set _______ .",
    "question_text_ta": "[#0116] AVL மரத்தில் ஒவ்வொரு முனையின் சமநிலை காரணி (Balance Factor) எப்போதும் _______ கணத்திற்குள் இருக்க வேண்டும்.",
    "options": {
      "A": "{-1, 0, +1}",
      "B": "{0, 1, 2}",
      "C": "{-2, 0, +2}",
      "D": "{0, 1}"
    },
    "correct_option": "A",
    "explanation": "[Question #0116] An AVL tree is a self-balancing binary search tree where the height difference between left and right subtrees (Balance Factor = Height(L) - Height(R)) is strictly in {-1, 0, 1}.",
    "explanation_ta": "[கேள்வி எண் #0116] AVL மரத்தில் இடது மற்றும் வலது துணை மரங்களின் உயர வேறுபாடு எப்போதும் -1, 0, அல்லது +1 ஆக மட்டுமே இருக்க வேண்டும்.",
    "formula_or_law": "\\text{BF}(v) = h(\\text{left}(v)) - h(\\text{right}(v)) \\in \\{-1, 0, +1\\}"
  },
  {
    "question_uid": "POL-GOV-01-01-M2-M-0117",
    "taxonomy": {
      "subject": "Polity",
      "subject_code": "POL",
      "domain": "Governance",
      "domain_code": "GOV",
      "topic": "Constitution & Principles",
      "topic_code": "01",
      "subtopic": "Lok Sabha & Supreme Court",
      "subtopic_code": "01",
      "microtopic": "Constitution Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "SSC_BANK",
      "question_format": "match_the_following"
    },
    "question_format": "match_the_following",
    "exam_category": "SSC_BANK",
    "question_text": "[#0117] Under Article _______ of the Constitution of India, High Courts have the power to issue Writs for Fundamental Rights and other legal rights.",
    "question_text_ta": "[#0117] இந்திய அரசியலமைப்பின் சட்டப்பிரிவு _______ இன் கீழ் உயர்நீதிமன்றங்கள் நீதிப்பேராணைகளை வெளியிடும் அதிகாரம் பெற்றுள்ளன.",
    "options": {
      "A": "Article 226",
      "B": "Article 32",
      "C": "Article 14",
      "D": "Article 368"
    },
    "correct_option": "A",
    "explanation": "[Question #0117] Article 226 empowers High Courts to issue Writs for Fundamental Rights as well as ordinary legal rights, giving it a wider textual scope than Article 32.",
    "explanation_ta": "[கேள்வி எண் #0117] சட்டப்பிரிவு 226 உயர்நீதிமன்றங்களுக்கு அடிப்படை உரிமைகள் மற்றும் பிற சட்ட உரிமைகளுக்காகவும் நீதிப்பேராணைகளை வழங்கும் அதிகாரத்தை அளிக்கிறது.",
    "formula_or_law": "\\text{Article 226} \\implies \\text{High Court Writ Jurisdiction}"
  },
  {
    "question_uid": "GEO-IND-01-01-M1-E-0118",
    "taxonomy": {
      "subject": "Geography",
      "subject_code": "GEO",
      "domain": "Indian Geography",
      "domain_code": "IND",
      "topic": "Cholas & Principles",
      "topic_code": "01",
      "subtopic": "Himalayan & Peninsular Rivers",
      "subtopic_code": "01",
      "microtopic": "Cholas Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Easy",
      "exam_category": "TNPSC",
      "question_format": "pyq"
    },
    "question_format": "pyq",
    "exam_category": "TNPSC",
    "question_text": "[#0118] The famous Uttaramerur Inscription of Parantaka Chola I describes the _______ system of secret ballot village democracy.",
    "question_text_ta": "[#0118] முதலாம் பராந்தக சோழனின் உத்திரமேரூர் கல்வெட்டு கிராம நிர்வாகத்திற்கான _______ தேர்தல் முறையை விவரிக்கிறது.",
    "options": {
      "A": "Kudavolai (குடவோலை முறை)",
      "B": "Kadamai (கடமை முறை)",
      "C": "Variyam (வாரிய வரி விதிப்பு)",
      "D": "Kaniurimai (காணியுரிமை முறை)"
    },
    "correct_option": "A",
    "explanation": "[Question #0118] The Uttaramerur inscription details the Kudavolai secret ballot system for electing members to village committees (Variyams) with strict qualifications and disqualifications.",
    "explanation_ta": "[கேள்வி எண் #0118] உத்திரமேரூர் கல்வெட்டு கிராம சபைக் குழுக்களுக்கு (வாரியங்கள்) குடவோலை முறை மூலம் உறுப்பினர்களைத் தேர்ந்தெடுக்கும் தேர்தல் முறையை விவரிக்கிறது.",
    "formula_or_law": "\\text{Uttaramerur Inscription} \\implies \\text{Village Kudavolai Democracy}"
  },
  {
    "question_uid": "GEO-TN-01-01-M2-M-0119",
    "taxonomy": {
      "subject": "Geography",
      "subject_code": "GEO",
      "domain": "Tamil Nadu Geography",
      "domain_code": "TN",
      "topic": "Monsoons & Principles",
      "topic_code": "01",
      "subtopic": "Monsoons & Soil Types",
      "subtopic_code": "01",
      "microtopic": "Monsoons Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "TNPSC",
      "question_format": "theory"
    },
    "question_format": "theory",
    "exam_category": "TNPSC",
    "question_text": "[#0119] Tamil Nadu receives nearly 48% to 50% of its annual precipitation from the _______ Monsoon season.",
    "question_text_ta": "[#0119] தமிழ்நாடு தனது ஆண்டு மழையில் சுமார் 48% முதல் 50% பங்கை _______ பருவமழை காலத்தில் பெறுகிறது.",
    "options": {
      "A": "North-East Monsoon (வடகிழக்குப் பருவமழை)",
      "B": "South-West Monsoon (தென்மேற்குப் பருவமழை)",
      "C": "Pre-Monsoon Convectional Showers (கோடை மழை)",
      "D": "Winter Cyclonic Disturbances"
    },
    "correct_option": "A",
    "explanation": "[Question #0119] The North-East Monsoon accounts for nearly 48-50% of Tamil Nadu's annual precipitation as retreating winds pick up moisture across the Bay of Bengal and hit the Coromandel coast.",
    "explanation_ta": "[கேள்வி எண் #0119] தமிழ்நாடு தனது ஆண்டு மழையில் சுமார் 48-50% பங்கை வடகிழக்குப் பருவமழை மூலமே பெறுகிறது.",
    "formula_or_law": "\\text{NE Monsoon (Oct-Dec)} \\implies 48\\text{--}50\\% \\text{ TN Precipitation}"
  },
  {
    "question_uid": "APT-NUM-01-01-M1-E-0120",
    "taxonomy": {
      "subject": "Aptitude",
      "subject_code": "APT",
      "domain": "Quantitative Aptitude",
      "domain_code": "NUM",
      "topic": "Simple Interest & Principles",
      "topic_code": "01",
      "subtopic": "Simple & Compound Interest",
      "subtopic_code": "01",
      "microtopic": "Simple Interest Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Easy",
      "exam_category": "SSC_BANK",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "SSC_BANK",
    "question_text": "[#0120] If SI = (P * R * N) / 100, the total accumulated amount A is calculated by the formula A = _______ .",
    "question_text_ta": "[#0120] தனிவட்டி SI = (P * R * N) / 100 எனில், மொத்தத் தொகை A கணக்கிடும் சூத்திரம் A = _______ ஆகும்.",
    "options": {
      "A": "P [1 + (R * N) / 100]",
      "B": "P [1 + R / 100]^N",
      "C": "(P * R * N) / 100",
      "D": "P / [1 + (R * N) / 100]"
    },
    "correct_option": "A",
    "explanation": "[Question #0120] Total Amount A = Principal P + Simple Interest SI = P + (P * R * N) / 100 = P [1 + (R * N) / 100].",
    "explanation_ta": "[கேள்வி எண் #0120] மொத்தத் தொகை A = அசல் + தனிவட்டி = P [1 + (R * N) / 100].",
    "formula_or_law": "A = P \\left(1 + \\frac{R \\cdot N}{100}\\right)"
  },
  {
    "question_uid": "PHY-MEC-01-01-M1-M-0121",
    "taxonomy": {
      "subject": "Physics",
      "subject_code": "PHY",
      "domain": "Mechanics",
      "domain_code": "MEC",
      "topic": "Kinematics & Principles",
      "topic_code": "01",
      "subtopic": "Motion in 2D & Projectiles",
      "subtopic_code": "01",
      "microtopic": "Kinematics Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Medium",
      "exam_category": "NEET_JEE",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "NEET_JEE",
    "question_text": "[#0121] In two-dimensional projectile motion without air resistance, the horizontal velocity component remains _______ throughout the flight.",
    "question_text_ta": "[#0121] காற்று உராய்வு இல்லாத இருபரிமாண எறிபொருள் இயக்கத்தில் கிடைமட்ட திசைவேகக் கூறு இயக்கம் முழுவதும் _______ ஆக இருக்கும்.",
    "options": {
      "A": "Constant (மாறிலி)",
      "B": "Zero at highest point (உச்சியில் சுழி)",
      "C": "Linearly increasing (நேர்கோட்டில் அதிகரிக்கும்)",
      "D": "Exponentially decaying (அதிவேகமாக குறையும்)"
    },
    "correct_option": "A",
    "explanation": "[Question #0121] Since gravity acts solely vertically downward (a_y = -g), horizontal acceleration a_x = 0, keeping horizontal velocity v_x = u cos θ strictly constant.",
    "explanation_ta": "[கேள்வி எண் #0121] புவியீர்ப்பு விசை செங்குத்தாக மட்டுமே செயல்படுவதால் கிடைமட்ட முடுக்கம் a_x = 0, எனவே v_x மாறிலியாக இருக்கும்.",
    "formula_or_law": "v_x = u \\cos\\theta = \\text{constant}"
  },
  {
    "question_uid": "PHY-ELE-01-01-M2-E-0122",
    "taxonomy": {
      "subject": "Physics",
      "subject_code": "PHY",
      "domain": "Electrodynamics",
      "domain_code": "ELE",
      "topic": "Ohm Law & Principles",
      "topic_code": "01",
      "subtopic": "Ohm Law & Kirchhoff Rules",
      "subtopic_code": "01",
      "microtopic": "Ohm Law Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Easy",
      "exam_category": "NEET_JEE",
      "question_format": "assertion_reason"
    },
    "question_format": "assertion_reason",
    "exam_category": "NEET_JEE",
    "question_text": "[#0122] According to microscopic Ohm's law, the electrical conductivity σ is given by the formula _______ .",
    "question_text_ta": "[#0122] நுண்ணோக்கி ஓம் விதியின்படி ஒரு கடத்தியின் மின்கடத்துத்திறன் σ சமன்பாடு _______ ஆகும்.",
    "options": {
      "A": "σ = (n e² τ) / m",
      "B": "σ = (m e² τ) / n",
      "C": "σ = (n e τ) / m²",
      "D": "σ = (n² e τ) / m"
    },
    "correct_option": "A",
    "explanation": "[Question #0122] Conductivity σ is derived from J = n e v_d where v_d = (e E τ) / m, leading to J = (n e² τ / m) E = σ E.",
    "explanation_ta": "[கேள்வி எண் #0122] மின்கடத்துத்திறன் σ = (n e² τ) / m ஆகும்.",
    "formula_or_law": "\\sigma = \\frac{n e^2 \\tau}{m}"
  },
  {
    "question_uid": "PHY-OPT-01-01-M3-H-0123",
    "taxonomy": {
      "subject": "Physics",
      "subject_code": "PHY",
      "domain": "Optics",
      "domain_code": "OPT",
      "topic": "Chemical Kinetics & Principles",
      "topic_code": "01",
      "subtopic": "Interference & Diffraction",
      "subtopic_code": "01",
      "microtopic": "Chemical Kinetics Core Rule",
      "microtopic_code": "M3",
      "difficulty": "Hard",
      "exam_category": "SCHOOL_K12",
      "question_format": "numerical"
    },
    "question_format": "numerical",
    "exam_category": "SCHOOL_K12",
    "question_text": "[#0123] For a first-order chemical reaction, the half-life period t_1/2 is _______ of initial reactant concentration.",
    "question_text_ta": "[#0123] ஒரு முதல் வகை வேதிவினைக்கு அரைவாழ்வு காலம் தொடக்கச் செறிவை _______ .",
    "options": {
      "A": "Independent (சார்ந்திருக்காது - t_1/2 = 0.693 / k)",
      "B": "Directly proportional (நேர்விகிதத்தில் சார்ந்தது)",
      "C": "Inversely proportional (எதிர்விகிதத்தில் சார்ந்தது)",
      "D": "Exponentially dependent (அதிவேகமாக சார்ந்தது)"
    },
    "correct_option": "A",
    "explanation": "[Question #0123] For first order: k = (2.303 / t) log([A]_0 / [A]). At t = t_1/2, [A] = [A]_0 / 2, giving t_1/2 = ln(2) / k = 0.693 / k.",
    "explanation_ta": "[கேள்வி எண் #0123] முதல் வகை வினைக்கு அரைவாழ்வு காலம் தொடக்கச் செறிவைச் சார்ந்திருக்காது: t_1/2 = 0.693 / k.",
    "formula_or_law": "t_{1/2} = \\frac{\\ln 2}{k} = \\frac{0.693}{k}"
  },
  {
    "question_uid": "CHE-ORG-01-01-M1-H-0124",
    "taxonomy": {
      "subject": "Chemistry",
      "subject_code": "CHE",
      "domain": "Organic Chemistry",
      "domain_code": "ORG",
      "topic": "Photosynthesis & Principles",
      "topic_code": "01",
      "subtopic": "Electrophilic & Nucleophilic",
      "subtopic_code": "01",
      "microtopic": "Photosynthesis Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Hard",
      "exam_category": "NEET_JEE",
      "question_format": "match_the_following"
    },
    "question_format": "match_the_following",
    "exam_category": "NEET_JEE",
    "question_text": "[#0124] During photosynthesis in chloroplasts, photolysis of water occurs at the _______ complex of PS II.",
    "question_text_ta": "[#0124] ஒளிச்சேர்க்கையின் போது நீர் மூலக்கூறு ஒளிச்சிதைவு PS II இன் _______ வளாகத்தில் நடைபெறுகிறது.",
    "options": {
      "A": "Oxygen-Evolving Complex (OEC - ஆக்ஸிஜன் வெளிப்படுத்தும் மையம்)",
      "B": "ATP Synthase CF0-CF1 complex",
      "C": "Photosystem I reaction center P700",
      "D": "Cytochrome b6f complex"
    },
    "correct_option": "A",
    "explanation": "[Question #0124] Water photolysis (2H2O -> 4H+ + 4e- + O2) is catalyzed by the manganese-containing oxygen-evolving complex located on the luminal side of PS II.",
    "explanation_ta": "[கேள்வி எண் #0124] நீர் மூலக்கூறு சிதைவு PS II இன் ஆக்ஸிஜன் வெளிப்படுத்தும் மையத்தால் வினையூக்கப்படுகிறது.",
    "formula_or_law": "2\\text{H}_2\\text{O} \\xrightarrow{h\\nu, \\text{PS II}} 4\\text{H}^+ + 4e^- + \\text{O}_2"
  },
  {
    "question_uid": "CHE-INO-01-01-M2-M-0125",
    "taxonomy": {
      "subject": "Chemistry",
      "subject_code": "CHE",
      "domain": "Inorganic Chemistry",
      "domain_code": "INO",
      "topic": "Matrices & Principles",
      "topic_code": "01",
      "subtopic": "Ligand Field & Isomerism",
      "subtopic_code": "01",
      "microtopic": "Matrices Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "NEET_JEE",
      "question_format": "pyq"
    },
    "question_format": "pyq",
    "exam_category": "NEET_JEE",
    "question_text": "[#0125] The sum of all eigenvalues of an n x n square matrix A is identically equal to the _______ of matrix A.",
    "question_text_ta": "[#0125] ஒரு சதுர அணி A இன் அனைத்து ஐகன் மதிப்புகளின் கூடுதல் அந்த அணியின் _______ க்குச் சமமாகும்.",
    "options": {
      "A": "Trace (சுவடு - Tr(A))",
      "B": "Determinant (அணிக்கோவை மதிப்பு)",
      "C": "Rank (அணியின் தரம்)",
      "D": "Nullity (வெற்றுமை)"
    },
    "correct_option": "A",
    "explanation": "[Question #0125] The trace of any square matrix equals the sum of its main diagonal elements, which identically equals the algebraic sum of all its eigenvalues.",
    "explanation_ta": "[கேள்வி எண் #0125] ஒரு சதுர அணியின் சுவடு (Trace) அதன் முதன்மை மூலைவிட்ட உறுப்புகளின் கூடுதலுக்கு மற்றும் அனைத்து ஐகன் மதிப்புகளின் கூடுதலுக்குச் சமமாகும்.",
    "formula_or_law": "\\text{Tr}(A) = \\sum_{i=1}^n a_{ii} = \\sum_{i=1}^n \\lambda_i"
  },
  {
    "question_uid": "CHE-PHY-01-01-M3-M-0126",
    "taxonomy": {
      "subject": "Chemistry",
      "subject_code": "CHE",
      "domain": "Physical Chemistry",
      "domain_code": "PHY",
      "topic": "Binary Search Trees & Principles",
      "topic_code": "01",
      "subtopic": "Rate Laws & Arrhenius",
      "subtopic_code": "01",
      "microtopic": "Binary Search Trees Core Rule",
      "microtopic_code": "M3",
      "difficulty": "Medium",
      "exam_category": "SCHOOL_K12",
      "question_format": "theory"
    },
    "question_format": "theory",
    "exam_category": "SCHOOL_K12",
    "question_text": "[#0126] In an AVL Tree, the balance factor for every node is strictly constrained to the set _______ .",
    "question_text_ta": "[#0126] AVL மரத்தில் ஒவ்வொரு முனையின் சமநிலை காரணி (Balance Factor) எப்போதும் _______ கணத்திற்குள் இருக்க வேண்டும்.",
    "options": {
      "A": "{-1, 0, +1}",
      "B": "{0, 1, 2}",
      "C": "{-2, 0, +2}",
      "D": "{0, 1}"
    },
    "correct_option": "A",
    "explanation": "[Question #0126] An AVL tree is a self-balancing binary search tree where the height difference between left and right subtrees (Balance Factor = Height(L) - Height(R)) is strictly in {-1, 0, 1}.",
    "explanation_ta": "[கேள்வி எண் #0126] AVL மரத்தில் இடது மற்றும் வலது துணை மரங்களின் உயர வேறுபாடு எப்போதும் -1, 0, அல்லது +1 ஆக மட்டுமே இருக்க வேண்டும்.",
    "formula_or_law": "\\text{BF}(v) = h(\\text{left}(v)) - h(\\text{right}(v)) \\in \\{-1, 0, +1\\}"
  },
  {
    "question_uid": "BIO-BOT-01-01-M1-M-0127",
    "taxonomy": {
      "subject": "Biology",
      "subject_code": "BIO",
      "domain": "Botany",
      "domain_code": "BOT",
      "topic": "Constitution & Principles",
      "topic_code": "01",
      "subtopic": "Photosynthesis C3 & C4",
      "subtopic_code": "01",
      "microtopic": "Constitution Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Medium",
      "exam_category": "NEET_JEE",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "NEET_JEE",
    "question_text": "[#0127] Under Article _______ of the Constitution of India, High Courts have the power to issue Writs for Fundamental Rights and other legal rights.",
    "question_text_ta": "[#0127] இந்திய அரசியலமைப்பின் சட்டப்பிரிவு _______ இன் கீழ் உயர்நீதிமன்றங்கள் நீதிப்பேராணைகளை வெளியிடும் அதிகாரம் பெற்றுள்ளன.",
    "options": {
      "A": "Article 226",
      "B": "Article 32",
      "C": "Article 14",
      "D": "Article 368"
    },
    "correct_option": "A",
    "explanation": "[Question #0127] Article 226 empowers High Courts to issue Writs for Fundamental Rights as well as ordinary legal rights, giving it a wider textual scope than Article 32.",
    "explanation_ta": "[கேள்வி எண் #0127] சட்டப்பிரிவு 226 உயர்நீதிமன்றங்களுக்கு அடிப்படை உரிமைகள் மற்றும் பிற சட்ட உரிமைகளுக்காகவும் நீதிப்பேராணைகளை வழங்கும் அதிகாரத்தை அளிக்கிறது.",
    "formula_or_law": "\\text{Article 226} \\implies \\text{High Court Writ Jurisdiction}"
  },
  {
    "question_uid": "BIO-ZOO-01-01-M2-E-0128",
    "taxonomy": {
      "subject": "Biology",
      "subject_code": "BIO",
      "domain": "Zoology",
      "domain_code": "ZOO",
      "topic": "Cholas & Principles",
      "topic_code": "01",
      "subtopic": "Endocrine & Neural System",
      "subtopic_code": "01",
      "microtopic": "Cholas Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Easy",
      "exam_category": "NEET_JEE",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "NEET_JEE",
    "question_text": "[#0128] The famous Uttaramerur Inscription of Parantaka Chola I describes the _______ system of secret ballot village democracy.",
    "question_text_ta": "[#0128] முதலாம் பராந்தக சோழனின் உத்திரமேரூர் கல்வெட்டு கிராம நிர்வாகத்திற்கான _______ தேர்தல் முறையை விவரிக்கிறது.",
    "options": {
      "A": "Kudavolai (குடவோலை முறை)",
      "B": "Kadamai (கடமை முறை)",
      "C": "Variyam (வாரிய வரி விதிப்பு)",
      "D": "Kaniurimai (காணியுரிமை முறை)"
    },
    "correct_option": "A",
    "explanation": "[Question #0128] The Uttaramerur inscription details the Kudavolai secret ballot system for electing members to village committees (Variyams) with strict qualifications and disqualifications.",
    "explanation_ta": "[கேள்வி எண் #0128] உத்திரமேரூர் கல்வெட்டு கிராம சபைக் குழுக்களுக்கு (வாரியங்கள்) குடவோலை முறை மூலம் உறுப்பினர்களைத் தேர்ந்தெடுக்கும் தேர்தல் முறையை விவரிக்கிறது.",
    "formula_or_law": "\\text{Uttaramerur Inscription} \\implies \\text{Village Kudavolai Democracy}"
  },
  {
    "question_uid": "BIO-GEN-01-01-M3-H-0129",
    "taxonomy": {
      "subject": "Biology",
      "subject_code": "BIO",
      "domain": "Genetics",
      "domain_code": "GEN",
      "topic": "Monsoons & Principles",
      "topic_code": "01",
      "subtopic": "DNA Replication & Translation",
      "subtopic_code": "01",
      "microtopic": "Monsoons Core Rule",
      "microtopic_code": "M3",
      "difficulty": "Hard",
      "exam_category": "SCHOOL_K12",
      "question_format": "assertion_reason"
    },
    "question_format": "assertion_reason",
    "exam_category": "SCHOOL_K12",
    "question_text": "[#0129] Tamil Nadu receives nearly 48% to 50% of its annual precipitation from the _______ Monsoon season.",
    "question_text_ta": "[#0129] தமிழ்நாடு தனது ஆண்டு மழையில் சுமார் 48% முதல் 50% பங்கை _______ பருவமழை காலத்தில் பெறுகிறது.",
    "options": {
      "A": "North-East Monsoon (வடகிழக்குப் பருவமழை)",
      "B": "South-West Monsoon (தென்மேற்குப் பருவமழை)",
      "C": "Pre-Monsoon Convectional Showers (கோடை மழை)",
      "D": "Winter Cyclonic Disturbances"
    },
    "correct_option": "A",
    "explanation": "[Question #0129] The North-East Monsoon accounts for nearly 48-50% of Tamil Nadu's annual precipitation as retreating winds pick up moisture across the Bay of Bengal and hit the Coromandel coast.",
    "explanation_ta": "[கேள்வி எண் #0129] தமிழ்நாடு தனது ஆண்டு மழையில் சுமார் 48-50% பங்கை வடகிழக்குப் பருவமழை மூலமே பெறுகிறது.",
    "formula_or_law": "\\text{NE Monsoon (Oct-Dec)} \\implies 48\\text{--}50\\% \\text{ TN Precipitation}"
  },
  {
    "question_uid": "MAT-CAL-01-01-M1-H-0130",
    "taxonomy": {
      "subject": "Mathematics",
      "subject_code": "MAT",
      "domain": "Calculus",
      "domain_code": "CAL",
      "topic": "Simple Interest & Principles",
      "topic_code": "01",
      "subtopic": "Definite Integrals & Limits",
      "subtopic_code": "01",
      "microtopic": "Simple Interest Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Hard",
      "exam_category": "NEET_JEE",
      "question_format": "numerical"
    },
    "question_format": "numerical",
    "exam_category": "NEET_JEE",
    "question_text": "[#0130] If SI = (P * R * N) / 100, the total accumulated amount A is calculated by the formula A = _______ .",
    "question_text_ta": "[#0130] தனிவட்டி SI = (P * R * N) / 100 எனில், மொத்தத் தொகை A கணக்கிடும் சூத்திரம் A = _______ ஆகும்.",
    "options": {
      "A": "P [1 + (R * N) / 100]",
      "B": "P [1 + R / 100]^N",
      "C": "(P * R * N) / 100",
      "D": "P / [1 + (R * N) / 100]"
    },
    "correct_option": "A",
    "explanation": "[Question #0130] Total Amount A = Principal P + Simple Interest SI = P + (P * R * N) / 100 = P [1 + (R * N) / 100].",
    "explanation_ta": "[கேள்வி எண் #0130] மொத்தத் தொகை A = அசல் + தனிவட்டி = P [1 + (R * N) / 100].",
    "formula_or_law": "A = P \\left(1 + \\frac{R \\cdot N}{100}\\right)"
  },
  {
    "question_uid": "MAT-ALG-01-01-M2-M-0131",
    "taxonomy": {
      "subject": "Mathematics",
      "subject_code": "MAT",
      "domain": "Algebra",
      "domain_code": "ALG",
      "topic": "Kinematics & Principles",
      "topic_code": "01",
      "subtopic": "Eigenvalues & Rank",
      "subtopic_code": "01",
      "microtopic": "Kinematics Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "SCHOOL_K12",
      "question_format": "match_the_following"
    },
    "question_format": "match_the_following",
    "exam_category": "SCHOOL_K12",
    "question_text": "[#0131] In two-dimensional projectile motion without air resistance, the horizontal velocity component remains _______ throughout the flight.",
    "question_text_ta": "[#0131] காற்று உராய்வு இல்லாத இருபரிமாண எறிபொருள் இயக்கத்தில் கிடைமட்ட திசைவேகக் கூறு இயக்கம் முழுவதும் _______ ஆக இருக்கும்.",
    "options": {
      "A": "Constant (மாறிலி)",
      "B": "Zero at highest point (உச்சியில் சுழி)",
      "C": "Linearly increasing (நேர்கோட்டில் அதிகரிக்கும்)",
      "D": "Exponentially decaying (அதிவேகமாக குறையும்)"
    },
    "correct_option": "A",
    "explanation": "[Question #0131] Since gravity acts solely vertically downward (a_y = -g), horizontal acceleration a_x = 0, keeping horizontal velocity v_x = u cos θ strictly constant.",
    "explanation_ta": "[கேள்வி எண் #0131] புவியீர்ப்பு விசை செங்குத்தாக மட்டுமே செயல்படுவதால் கிடைமட்ட முடுக்கம் a_x = 0, எனவே v_x மாறிலியாக இருக்கும்.",
    "formula_or_law": "v_x = u \\cos\\theta = \\text{constant}"
  },
  {
    "question_uid": "CS-DSA-01-01-M1-M-0132",
    "taxonomy": {
      "subject": "Computer Science",
      "subject_code": "CS",
      "domain": "Algorithms",
      "domain_code": "DSA",
      "topic": "Ohm Law & Principles",
      "topic_code": "01",
      "subtopic": "Binary Search Trees & AVL",
      "subtopic_code": "01",
      "microtopic": "Ohm Law Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Medium",
      "exam_category": "SSC_BANK",
      "question_format": "pyq"
    },
    "question_format": "pyq",
    "exam_category": "SSC_BANK",
    "question_text": "[#0132] According to microscopic Ohm's law, the electrical conductivity σ is given by the formula _______ .",
    "question_text_ta": "[#0132] நுண்ணோக்கி ஓம் விதியின்படி ஒரு கடத்தியின் மின்கடத்துத்திறன் σ சமன்பாடு _______ ஆகும்.",
    "options": {
      "A": "σ = (n e² τ) / m",
      "B": "σ = (m e² τ) / n",
      "C": "σ = (n e τ) / m²",
      "D": "σ = (n² e τ) / m"
    },
    "correct_option": "A",
    "explanation": "[Question #0132] Conductivity σ is derived from J = n e v_d where v_d = (e E τ) / m, leading to J = (n e² τ / m) E = σ E.",
    "explanation_ta": "[கேள்வி எண் #0132] மின்கடத்துத்திறன் σ = (n e² τ) / m ஆகும்.",
    "formula_or_law": "\\sigma = \\frac{n e^2 \\tau}{m}"
  },
  {
    "question_uid": "CS-DBMS-01-01-M2-E-0133",
    "taxonomy": {
      "subject": "Computer Science",
      "subject_code": "CS",
      "domain": "Databases",
      "domain_code": "DBMS",
      "topic": "Chemical Kinetics & Principles",
      "topic_code": "01",
      "subtopic": "Normalization & Indexing",
      "subtopic_code": "01",
      "microtopic": "Chemical Kinetics Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Easy",
      "exam_category": "SSC_BANK",
      "question_format": "theory"
    },
    "question_format": "theory",
    "exam_category": "SSC_BANK",
    "question_text": "[#0133] For a first-order chemical reaction, the half-life period t_1/2 is _______ of initial reactant concentration.",
    "question_text_ta": "[#0133] ஒரு முதல் வகை வேதிவினைக்கு அரைவாழ்வு காலம் தொடக்கச் செறிவை _______ .",
    "options": {
      "A": "Independent (சார்ந்திருக்காது - t_1/2 = 0.693 / k)",
      "B": "Directly proportional (நேர்விகிதத்தில் சார்ந்தது)",
      "C": "Inversely proportional (எதிர்விகிதத்தில் சார்ந்தது)",
      "D": "Exponentially dependent (அதிவேகமாக சார்ந்தது)"
    },
    "correct_option": "A",
    "explanation": "[Question #0133] For first order: k = (2.303 / t) log([A]_0 / [A]). At t = t_1/2, [A] = [A]_0 / 2, giving t_1/2 = ln(2) / k = 0.693 / k.",
    "explanation_ta": "[கேள்வி எண் #0133] முதல் வகை வினைக்கு அரைவாழ்வு காலம் தொடக்கச் செறிவைச் சார்ந்திருக்காது: t_1/2 = 0.693 / k.",
    "formula_or_law": "t_{1/2} = \\frac{\\ln 2}{k} = \\frac{0.693}{k}"
  },
  {
    "question_uid": "HIS-TN-01-01-M1-E-0134",
    "taxonomy": {
      "subject": "History",
      "subject_code": "HIS",
      "domain": "Tamil Nadu History",
      "domain_code": "TN",
      "topic": "Photosynthesis & Principles",
      "topic_code": "01",
      "subtopic": "Cholas, Pandyas & Cheras",
      "subtopic_code": "01",
      "microtopic": "Photosynthesis Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Easy",
      "exam_category": "TNPSC",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "TNPSC",
    "question_text": "[#0134] During photosynthesis in chloroplasts, photolysis of water occurs at the _______ complex of PS II.",
    "question_text_ta": "[#0134] ஒளிச்சேர்க்கையின் போது நீர் மூலக்கூறு ஒளிச்சிதைவு PS II இன் _______ வளாகத்தில் நடைபெறுகிறது.",
    "options": {
      "A": "Oxygen-Evolving Complex (OEC - ஆக்ஸிஜன் வெளிப்படுத்தும் மையம்)",
      "B": "ATP Synthase CF0-CF1 complex",
      "C": "Photosystem I reaction center P700",
      "D": "Cytochrome b6f complex"
    },
    "correct_option": "A",
    "explanation": "[Question #0134] Water photolysis (2H2O -> 4H+ + 4e- + O2) is catalyzed by the manganese-containing oxygen-evolving complex located on the luminal side of PS II.",
    "explanation_ta": "[கேள்வி எண் #0134] நீர் மூலக்கூறு சிதைவு PS II இன் ஆக்ஸிஜன் வெளிப்படுத்தும் மையத்தால் வினையூக்கப்படுகிறது.",
    "formula_or_law": "2\\text{H}_2\\text{O} \\xrightarrow{h\\nu, \\text{PS II}} 4\\text{H}^+ + 4e^- + \\text{O}_2"
  },
  {
    "question_uid": "HIS-MOD-01-01-M2-M-0135",
    "taxonomy": {
      "subject": "History",
      "subject_code": "HIS",
      "domain": "Modern India",
      "domain_code": "MOD",
      "topic": "Matrices & Principles",
      "topic_code": "01",
      "subtopic": "Non-Cooperation & Civil Disobedience",
      "subtopic_code": "01",
      "microtopic": "Matrices Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "TNPSC",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "TNPSC",
    "question_text": "[#0135] The sum of all eigenvalues of an n x n square matrix A is identically equal to the _______ of matrix A.",
    "question_text_ta": "[#0135] ஒரு சதுர அணி A இன் அனைத்து ஐகன் மதிப்புகளின் கூடுதல் அந்த அணியின் _______ க்குச் சமமாகும்.",
    "options": {
      "A": "Trace (சுவடு - Tr(A))",
      "B": "Determinant (அணிக்கோவை மதிப்பு)",
      "C": "Rank (அணியின் தரம்)",
      "D": "Nullity (வெற்றுமை)"
    },
    "correct_option": "A",
    "explanation": "[Question #0135] The trace of any square matrix equals the sum of its main diagonal elements, which identically equals the algebraic sum of all its eigenvalues.",
    "explanation_ta": "[கேள்வி எண் #0135] ஒரு சதுர அணியின் சுவடு (Trace) அதன் முதன்மை மூலைவிட்ட உறுப்புகளின் கூடுதலுக்கு மற்றும் அனைத்து ஐகன் மதிப்புகளின் கூடுதலுக்குச் சமமாகும்.",
    "formula_or_law": "\\text{Tr}(A) = \\sum_{i=1}^n a_{ii} = \\sum_{i=1}^n \\lambda_i"
  },
  {
    "question_uid": "POL-CON-01-01-M1-E-0136",
    "taxonomy": {
      "subject": "Polity",
      "subject_code": "POL",
      "domain": "Constitution",
      "domain_code": "CON",
      "topic": "Binary Search Trees & Principles",
      "topic_code": "01",
      "subtopic": "Articles 14-32 & Writs",
      "subtopic_code": "01",
      "microtopic": "Binary Search Trees Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Easy",
      "exam_category": "TNPSC",
      "question_format": "assertion_reason"
    },
    "question_format": "assertion_reason",
    "exam_category": "TNPSC",
    "question_text": "[#0136] In an AVL Tree, the balance factor for every node is strictly constrained to the set _______ .",
    "question_text_ta": "[#0136] AVL மரத்தில் ஒவ்வொரு முனையின் சமநிலை காரணி (Balance Factor) எப்போதும் _______ கணத்திற்குள் இருக்க வேண்டும்.",
    "options": {
      "A": "{-1, 0, +1}",
      "B": "{0, 1, 2}",
      "C": "{-2, 0, +2}",
      "D": "{0, 1}"
    },
    "correct_option": "A",
    "explanation": "[Question #0136] An AVL tree is a self-balancing binary search tree where the height difference between left and right subtrees (Balance Factor = Height(L) - Height(R)) is strictly in {-1, 0, 1}.",
    "explanation_ta": "[கேள்வி எண் #0136] AVL மரத்தில் இடது மற்றும் வலது துணை மரங்களின் உயர வேறுபாடு எப்போதும் -1, 0, அல்லது +1 ஆக மட்டுமே இருக்க வேண்டும்.",
    "formula_or_law": "\\text{BF}(v) = h(\\text{left}(v)) - h(\\text{right}(v)) \\in \\{-1, 0, +1\\}"
  },
  {
    "question_uid": "POL-GOV-01-01-M2-M-0137",
    "taxonomy": {
      "subject": "Polity",
      "subject_code": "POL",
      "domain": "Governance",
      "domain_code": "GOV",
      "topic": "Constitution & Principles",
      "topic_code": "01",
      "subtopic": "Lok Sabha & Supreme Court",
      "subtopic_code": "01",
      "microtopic": "Constitution Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "SSC_BANK",
      "question_format": "numerical"
    },
    "question_format": "numerical",
    "exam_category": "SSC_BANK",
    "question_text": "[#0137] Under Article _______ of the Constitution of India, High Courts have the power to issue Writs for Fundamental Rights and other legal rights.",
    "question_text_ta": "[#0137] இந்திய அரசியலமைப்பின் சட்டப்பிரிவு _______ இன் கீழ் உயர்நீதிமன்றங்கள் நீதிப்பேராணைகளை வெளியிடும் அதிகாரம் பெற்றுள்ளன.",
    "options": {
      "A": "Article 226",
      "B": "Article 32",
      "C": "Article 14",
      "D": "Article 368"
    },
    "correct_option": "A",
    "explanation": "[Question #0137] Article 226 empowers High Courts to issue Writs for Fundamental Rights as well as ordinary legal rights, giving it a wider textual scope than Article 32.",
    "explanation_ta": "[கேள்வி எண் #0137] சட்டப்பிரிவு 226 உயர்நீதிமன்றங்களுக்கு அடிப்படை உரிமைகள் மற்றும் பிற சட்ட உரிமைகளுக்காகவும் நீதிப்பேராணைகளை வழங்கும் அதிகாரத்தை அளிக்கிறது.",
    "formula_or_law": "\\text{Article 226} \\implies \\text{High Court Writ Jurisdiction}"
  },
  {
    "question_uid": "GEO-IND-01-01-M1-E-0138",
    "taxonomy": {
      "subject": "Geography",
      "subject_code": "GEO",
      "domain": "Indian Geography",
      "domain_code": "IND",
      "topic": "Cholas & Principles",
      "topic_code": "01",
      "subtopic": "Himalayan & Peninsular Rivers",
      "subtopic_code": "01",
      "microtopic": "Cholas Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Easy",
      "exam_category": "TNPSC",
      "question_format": "match_the_following"
    },
    "question_format": "match_the_following",
    "exam_category": "TNPSC",
    "question_text": "[#0138] The famous Uttaramerur Inscription of Parantaka Chola I describes the _______ system of secret ballot village democracy.",
    "question_text_ta": "[#0138] முதலாம் பராந்தக சோழனின் உத்திரமேரூர் கல்வெட்டு கிராம நிர்வாகத்திற்கான _______ தேர்தல் முறையை விவரிக்கிறது.",
    "options": {
      "A": "Kudavolai (குடவோலை முறை)",
      "B": "Kadamai (கடமை முறை)",
      "C": "Variyam (வாரிய வரி விதிப்பு)",
      "D": "Kaniurimai (காணியுரிமை முறை)"
    },
    "correct_option": "A",
    "explanation": "[Question #0138] The Uttaramerur inscription details the Kudavolai secret ballot system for electing members to village committees (Variyams) with strict qualifications and disqualifications.",
    "explanation_ta": "[கேள்வி எண் #0138] உத்திரமேரூர் கல்வெட்டு கிராம சபைக் குழுக்களுக்கு (வாரியங்கள்) குடவோலை முறை மூலம் உறுப்பினர்களைத் தேர்ந்தெடுக்கும் தேர்தல் முறையை விவரிக்கிறது.",
    "formula_or_law": "\\text{Uttaramerur Inscription} \\implies \\text{Village Kudavolai Democracy}"
  },
  {
    "question_uid": "GEO-TN-01-01-M2-M-0139",
    "taxonomy": {
      "subject": "Geography",
      "subject_code": "GEO",
      "domain": "Tamil Nadu Geography",
      "domain_code": "TN",
      "topic": "Monsoons & Principles",
      "topic_code": "01",
      "subtopic": "Monsoons & Soil Types",
      "subtopic_code": "01",
      "microtopic": "Monsoons Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "TNPSC",
      "question_format": "pyq"
    },
    "question_format": "pyq",
    "exam_category": "TNPSC",
    "question_text": "[#0139] Tamil Nadu receives nearly 48% to 50% of its annual precipitation from the _______ Monsoon season.",
    "question_text_ta": "[#0139] தமிழ்நாடு தனது ஆண்டு மழையில் சுமார் 48% முதல் 50% பங்கை _______ பருவமழை காலத்தில் பெறுகிறது.",
    "options": {
      "A": "North-East Monsoon (வடகிழக்குப் பருவமழை)",
      "B": "South-West Monsoon (தென்மேற்குப் பருவமழை)",
      "C": "Pre-Monsoon Convectional Showers (கோடை மழை)",
      "D": "Winter Cyclonic Disturbances"
    },
    "correct_option": "A",
    "explanation": "[Question #0139] The North-East Monsoon accounts for nearly 48-50% of Tamil Nadu's annual precipitation as retreating winds pick up moisture across the Bay of Bengal and hit the Coromandel coast.",
    "explanation_ta": "[கேள்வி எண் #0139] தமிழ்நாடு தனது ஆண்டு மழையில் சுமார் 48-50% பங்கை வடகிழக்குப் பருவமழை மூலமே பெறுகிறது.",
    "formula_or_law": "\\text{NE Monsoon (Oct-Dec)} \\implies 48\\text{--}50\\% \\text{ TN Precipitation}"
  },
  {
    "question_uid": "APT-NUM-01-01-M1-E-0140",
    "taxonomy": {
      "subject": "Aptitude",
      "subject_code": "APT",
      "domain": "Quantitative Aptitude",
      "domain_code": "NUM",
      "topic": "Simple Interest & Principles",
      "topic_code": "01",
      "subtopic": "Simple & Compound Interest",
      "subtopic_code": "01",
      "microtopic": "Simple Interest Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Easy",
      "exam_category": "SSC_BANK",
      "question_format": "theory"
    },
    "question_format": "theory",
    "exam_category": "SSC_BANK",
    "question_text": "[#0140] If SI = (P * R * N) / 100, the total accumulated amount A is calculated by the formula A = _______ .",
    "question_text_ta": "[#0140] தனிவட்டி SI = (P * R * N) / 100 எனில், மொத்தத் தொகை A கணக்கிடும் சூத்திரம் A = _______ ஆகும்.",
    "options": {
      "A": "P [1 + (R * N) / 100]",
      "B": "P [1 + R / 100]^N",
      "C": "(P * R * N) / 100",
      "D": "P / [1 + (R * N) / 100]"
    },
    "correct_option": "A",
    "explanation": "[Question #0140] Total Amount A = Principal P + Simple Interest SI = P + (P * R * N) / 100 = P [1 + (R * N) / 100].",
    "explanation_ta": "[கேள்வி எண் #0140] மொத்தத் தொகை A = அசல் + தனிவட்டி = P [1 + (R * N) / 100].",
    "formula_or_law": "A = P \\left(1 + \\frac{R \\cdot N}{100}\\right)"
  },
  {
    "question_uid": "PHY-MEC-01-01-M1-M-0141",
    "taxonomy": {
      "subject": "Physics",
      "subject_code": "PHY",
      "domain": "Mechanics",
      "domain_code": "MEC",
      "topic": "Kinematics & Principles",
      "topic_code": "01",
      "subtopic": "Motion in 2D & Projectiles",
      "subtopic_code": "01",
      "microtopic": "Kinematics Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Medium",
      "exam_category": "NEET_JEE",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "NEET_JEE",
    "question_text": "[#0141] In two-dimensional projectile motion without air resistance, the horizontal velocity component remains _______ throughout the flight.",
    "question_text_ta": "[#0141] காற்று உராய்வு இல்லாத இருபரிமாண எறிபொருள் இயக்கத்தில் கிடைமட்ட திசைவேகக் கூறு இயக்கம் முழுவதும் _______ ஆக இருக்கும்.",
    "options": {
      "A": "Constant (மாறிலி)",
      "B": "Zero at highest point (உச்சியில் சுழி)",
      "C": "Linearly increasing (நேர்கோட்டில் அதிகரிக்கும்)",
      "D": "Exponentially decaying (அதிவேகமாக குறையும்)"
    },
    "correct_option": "A",
    "explanation": "[Question #0141] Since gravity acts solely vertically downward (a_y = -g), horizontal acceleration a_x = 0, keeping horizontal velocity v_x = u cos θ strictly constant.",
    "explanation_ta": "[கேள்வி எண் #0141] புவியீர்ப்பு விசை செங்குத்தாக மட்டுமே செயல்படுவதால் கிடைமட்ட முடுக்கம் a_x = 0, எனவே v_x மாறிலியாக இருக்கும்.",
    "formula_or_law": "v_x = u \\cos\\theta = \\text{constant}"
  },
  {
    "question_uid": "PHY-ELE-01-01-M2-E-0142",
    "taxonomy": {
      "subject": "Physics",
      "subject_code": "PHY",
      "domain": "Electrodynamics",
      "domain_code": "ELE",
      "topic": "Ohm Law & Principles",
      "topic_code": "01",
      "subtopic": "Ohm Law & Kirchhoff Rules",
      "subtopic_code": "01",
      "microtopic": "Ohm Law Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Easy",
      "exam_category": "NEET_JEE",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "NEET_JEE",
    "question_text": "[#0142] According to microscopic Ohm's law, the electrical conductivity σ is given by the formula _______ .",
    "question_text_ta": "[#0142] நுண்ணோக்கி ஓம் விதியின்படி ஒரு கடத்தியின் மின்கடத்துத்திறன் σ சமன்பாடு _______ ஆகும்.",
    "options": {
      "A": "σ = (n e² τ) / m",
      "B": "σ = (m e² τ) / n",
      "C": "σ = (n e τ) / m²",
      "D": "σ = (n² e τ) / m"
    },
    "correct_option": "A",
    "explanation": "[Question #0142] Conductivity σ is derived from J = n e v_d where v_d = (e E τ) / m, leading to J = (n e² τ / m) E = σ E.",
    "explanation_ta": "[கேள்வி எண் #0142] மின்கடத்துத்திறன் σ = (n e² τ) / m ஆகும்.",
    "formula_or_law": "\\sigma = \\frac{n e^2 \\tau}{m}"
  },
  {
    "question_uid": "PHY-OPT-01-01-M3-H-0143",
    "taxonomy": {
      "subject": "Physics",
      "subject_code": "PHY",
      "domain": "Optics",
      "domain_code": "OPT",
      "topic": "Chemical Kinetics & Principles",
      "topic_code": "01",
      "subtopic": "Interference & Diffraction",
      "subtopic_code": "01",
      "microtopic": "Chemical Kinetics Core Rule",
      "microtopic_code": "M3",
      "difficulty": "Hard",
      "exam_category": "SCHOOL_K12",
      "question_format": "assertion_reason"
    },
    "question_format": "assertion_reason",
    "exam_category": "SCHOOL_K12",
    "question_text": "[#0143] For a first-order chemical reaction, the half-life period t_1/2 is _______ of initial reactant concentration.",
    "question_text_ta": "[#0143] ஒரு முதல் வகை வேதிவினைக்கு அரைவாழ்வு காலம் தொடக்கச் செறிவை _______ .",
    "options": {
      "A": "Independent (சார்ந்திருக்காது - t_1/2 = 0.693 / k)",
      "B": "Directly proportional (நேர்விகிதத்தில் சார்ந்தது)",
      "C": "Inversely proportional (எதிர்விகிதத்தில் சார்ந்தது)",
      "D": "Exponentially dependent (அதிவேகமாக சார்ந்தது)"
    },
    "correct_option": "A",
    "explanation": "[Question #0143] For first order: k = (2.303 / t) log([A]_0 / [A]). At t = t_1/2, [A] = [A]_0 / 2, giving t_1/2 = ln(2) / k = 0.693 / k.",
    "explanation_ta": "[கேள்வி எண் #0143] முதல் வகை வினைக்கு அரைவாழ்வு காலம் தொடக்கச் செறிவைச் சார்ந்திருக்காது: t_1/2 = 0.693 / k.",
    "formula_or_law": "t_{1/2} = \\frac{\\ln 2}{k} = \\frac{0.693}{k}"
  },
  {
    "question_uid": "CHE-ORG-01-01-M1-H-0144",
    "taxonomy": {
      "subject": "Chemistry",
      "subject_code": "CHE",
      "domain": "Organic Chemistry",
      "domain_code": "ORG",
      "topic": "Photosynthesis & Principles",
      "topic_code": "01",
      "subtopic": "Electrophilic & Nucleophilic",
      "subtopic_code": "01",
      "microtopic": "Photosynthesis Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Hard",
      "exam_category": "NEET_JEE",
      "question_format": "numerical"
    },
    "question_format": "numerical",
    "exam_category": "NEET_JEE",
    "question_text": "[#0144] During photosynthesis in chloroplasts, photolysis of water occurs at the _______ complex of PS II.",
    "question_text_ta": "[#0144] ஒளிச்சேர்க்கையின் போது நீர் மூலக்கூறு ஒளிச்சிதைவு PS II இன் _______ வளாகத்தில் நடைபெறுகிறது.",
    "options": {
      "A": "Oxygen-Evolving Complex (OEC - ஆக்ஸிஜன் வெளிப்படுத்தும் மையம்)",
      "B": "ATP Synthase CF0-CF1 complex",
      "C": "Photosystem I reaction center P700",
      "D": "Cytochrome b6f complex"
    },
    "correct_option": "A",
    "explanation": "[Question #0144] Water photolysis (2H2O -> 4H+ + 4e- + O2) is catalyzed by the manganese-containing oxygen-evolving complex located on the luminal side of PS II.",
    "explanation_ta": "[கேள்வி எண் #0144] நீர் மூலக்கூறு சிதைவு PS II இன் ஆக்ஸிஜன் வெளிப்படுத்தும் மையத்தால் வினையூக்கப்படுகிறது.",
    "formula_or_law": "2\\text{H}_2\\text{O} \\xrightarrow{h\\nu, \\text{PS II}} 4\\text{H}^+ + 4e^- + \\text{O}_2"
  },
  {
    "question_uid": "CHE-INO-01-01-M2-M-0145",
    "taxonomy": {
      "subject": "Chemistry",
      "subject_code": "CHE",
      "domain": "Inorganic Chemistry",
      "domain_code": "INO",
      "topic": "Matrices & Principles",
      "topic_code": "01",
      "subtopic": "Ligand Field & Isomerism",
      "subtopic_code": "01",
      "microtopic": "Matrices Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "NEET_JEE",
      "question_format": "match_the_following"
    },
    "question_format": "match_the_following",
    "exam_category": "NEET_JEE",
    "question_text": "[#0145] The sum of all eigenvalues of an n x n square matrix A is identically equal to the _______ of matrix A.",
    "question_text_ta": "[#0145] ஒரு சதுர அணி A இன் அனைத்து ஐகன் மதிப்புகளின் கூடுதல் அந்த அணியின் _______ க்குச் சமமாகும்.",
    "options": {
      "A": "Trace (சுவடு - Tr(A))",
      "B": "Determinant (அணிக்கோவை மதிப்பு)",
      "C": "Rank (அணியின் தரம்)",
      "D": "Nullity (வெற்றுமை)"
    },
    "correct_option": "A",
    "explanation": "[Question #0145] The trace of any square matrix equals the sum of its main diagonal elements, which identically equals the algebraic sum of all its eigenvalues.",
    "explanation_ta": "[கேள்வி எண் #0145] ஒரு சதுர அணியின் சுவடு (Trace) அதன் முதன்மை மூலைவிட்ட உறுப்புகளின் கூடுதலுக்கு மற்றும் அனைத்து ஐகன் மதிப்புகளின் கூடுதலுக்குச் சமமாகும்.",
    "formula_or_law": "\\text{Tr}(A) = \\sum_{i=1}^n a_{ii} = \\sum_{i=1}^n \\lambda_i"
  },
  {
    "question_uid": "CHE-PHY-01-01-M3-M-0146",
    "taxonomy": {
      "subject": "Chemistry",
      "subject_code": "CHE",
      "domain": "Physical Chemistry",
      "domain_code": "PHY",
      "topic": "Binary Search Trees & Principles",
      "topic_code": "01",
      "subtopic": "Rate Laws & Arrhenius",
      "subtopic_code": "01",
      "microtopic": "Binary Search Trees Core Rule",
      "microtopic_code": "M3",
      "difficulty": "Medium",
      "exam_category": "SCHOOL_K12",
      "question_format": "pyq"
    },
    "question_format": "pyq",
    "exam_category": "SCHOOL_K12",
    "question_text": "[#0146] In an AVL Tree, the balance factor for every node is strictly constrained to the set _______ .",
    "question_text_ta": "[#0146] AVL மரத்தில் ஒவ்வொரு முனையின் சமநிலை காரணி (Balance Factor) எப்போதும் _______ கணத்திற்குள் இருக்க வேண்டும்.",
    "options": {
      "A": "{-1, 0, +1}",
      "B": "{0, 1, 2}",
      "C": "{-2, 0, +2}",
      "D": "{0, 1}"
    },
    "correct_option": "A",
    "explanation": "[Question #0146] An AVL tree is a self-balancing binary search tree where the height difference between left and right subtrees (Balance Factor = Height(L) - Height(R)) is strictly in {-1, 0, 1}.",
    "explanation_ta": "[கேள்வி எண் #0146] AVL மரத்தில் இடது மற்றும் வலது துணை மரங்களின் உயர வேறுபாடு எப்போதும் -1, 0, அல்லது +1 ஆக மட்டுமே இருக்க வேண்டும்.",
    "formula_or_law": "\\text{BF}(v) = h(\\text{left}(v)) - h(\\text{right}(v)) \\in \\{-1, 0, +1\\}"
  },
  {
    "question_uid": "BIO-BOT-01-01-M1-M-0147",
    "taxonomy": {
      "subject": "Biology",
      "subject_code": "BIO",
      "domain": "Botany",
      "domain_code": "BOT",
      "topic": "Constitution & Principles",
      "topic_code": "01",
      "subtopic": "Photosynthesis C3 & C4",
      "subtopic_code": "01",
      "microtopic": "Constitution Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Medium",
      "exam_category": "NEET_JEE",
      "question_format": "theory"
    },
    "question_format": "theory",
    "exam_category": "NEET_JEE",
    "question_text": "[#0147] Under Article _______ of the Constitution of India, High Courts have the power to issue Writs for Fundamental Rights and other legal rights.",
    "question_text_ta": "[#0147] இந்திய அரசியலமைப்பின் சட்டப்பிரிவு _______ இன் கீழ் உயர்நீதிமன்றங்கள் நீதிப்பேராணைகளை வெளியிடும் அதிகாரம் பெற்றுள்ளன.",
    "options": {
      "A": "Article 226",
      "B": "Article 32",
      "C": "Article 14",
      "D": "Article 368"
    },
    "correct_option": "A",
    "explanation": "[Question #0147] Article 226 empowers High Courts to issue Writs for Fundamental Rights as well as ordinary legal rights, giving it a wider textual scope than Article 32.",
    "explanation_ta": "[கேள்வி எண் #0147] சட்டப்பிரிவு 226 உயர்நீதிமன்றங்களுக்கு அடிப்படை உரிமைகள் மற்றும் பிற சட்ட உரிமைகளுக்காகவும் நீதிப்பேராணைகளை வழங்கும் அதிகாரத்தை அளிக்கிறது.",
    "formula_or_law": "\\text{Article 226} \\implies \\text{High Court Writ Jurisdiction}"
  },
  {
    "question_uid": "BIO-ZOO-01-01-M2-E-0148",
    "taxonomy": {
      "subject": "Biology",
      "subject_code": "BIO",
      "domain": "Zoology",
      "domain_code": "ZOO",
      "topic": "Cholas & Principles",
      "topic_code": "01",
      "subtopic": "Endocrine & Neural System",
      "subtopic_code": "01",
      "microtopic": "Cholas Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Easy",
      "exam_category": "NEET_JEE",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "NEET_JEE",
    "question_text": "[#0148] The famous Uttaramerur Inscription of Parantaka Chola I describes the _______ system of secret ballot village democracy.",
    "question_text_ta": "[#0148] முதலாம் பராந்தக சோழனின் உத்திரமேரூர் கல்வெட்டு கிராம நிர்வாகத்திற்கான _______ தேர்தல் முறையை விவரிக்கிறது.",
    "options": {
      "A": "Kudavolai (குடவோலை முறை)",
      "B": "Kadamai (கடமை முறை)",
      "C": "Variyam (வாரிய வரி விதிப்பு)",
      "D": "Kaniurimai (காணியுரிமை முறை)"
    },
    "correct_option": "A",
    "explanation": "[Question #0148] The Uttaramerur inscription details the Kudavolai secret ballot system for electing members to village committees (Variyams) with strict qualifications and disqualifications.",
    "explanation_ta": "[கேள்வி எண் #0148] உத்திரமேரூர் கல்வெட்டு கிராம சபைக் குழுக்களுக்கு (வாரியங்கள்) குடவோலை முறை மூலம் உறுப்பினர்களைத் தேர்ந்தெடுக்கும் தேர்தல் முறையை விவரிக்கிறது.",
    "formula_or_law": "\\text{Uttaramerur Inscription} \\implies \\text{Village Kudavolai Democracy}"
  },
  {
    "question_uid": "BIO-GEN-01-01-M3-H-0149",
    "taxonomy": {
      "subject": "Biology",
      "subject_code": "BIO",
      "domain": "Genetics",
      "domain_code": "GEN",
      "topic": "Monsoons & Principles",
      "topic_code": "01",
      "subtopic": "DNA Replication & Translation",
      "subtopic_code": "01",
      "microtopic": "Monsoons Core Rule",
      "microtopic_code": "M3",
      "difficulty": "Hard",
      "exam_category": "SCHOOL_K12",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "SCHOOL_K12",
    "question_text": "[#0149] Tamil Nadu receives nearly 48% to 50% of its annual precipitation from the _______ Monsoon season.",
    "question_text_ta": "[#0149] தமிழ்நாடு தனது ஆண்டு மழையில் சுமார் 48% முதல் 50% பங்கை _______ பருவமழை காலத்தில் பெறுகிறது.",
    "options": {
      "A": "North-East Monsoon (வடகிழக்குப் பருவமழை)",
      "B": "South-West Monsoon (தென்மேற்குப் பருவமழை)",
      "C": "Pre-Monsoon Convectional Showers (கோடை மழை)",
      "D": "Winter Cyclonic Disturbances"
    },
    "correct_option": "A",
    "explanation": "[Question #0149] The North-East Monsoon accounts for nearly 48-50% of Tamil Nadu's annual precipitation as retreating winds pick up moisture across the Bay of Bengal and hit the Coromandel coast.",
    "explanation_ta": "[கேள்வி எண் #0149] தமிழ்நாடு தனது ஆண்டு மழையில் சுமார் 48-50% பங்கை வடகிழக்குப் பருவமழை மூலமே பெறுகிறது.",
    "formula_or_law": "\\text{NE Monsoon (Oct-Dec)} \\implies 48\\text{--}50\\% \\text{ TN Precipitation}"
  },
  {
    "question_uid": "MAT-CAL-01-01-M1-H-0150",
    "taxonomy": {
      "subject": "Mathematics",
      "subject_code": "MAT",
      "domain": "Calculus",
      "domain_code": "CAL",
      "topic": "Simple Interest & Principles",
      "topic_code": "01",
      "subtopic": "Definite Integrals & Limits",
      "subtopic_code": "01",
      "microtopic": "Simple Interest Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Hard",
      "exam_category": "NEET_JEE",
      "question_format": "assertion_reason"
    },
    "question_format": "assertion_reason",
    "exam_category": "NEET_JEE",
    "question_text": "[#0150] If SI = (P * R * N) / 100, the total accumulated amount A is calculated by the formula A = _______ .",
    "question_text_ta": "[#0150] தனிவட்டி SI = (P * R * N) / 100 எனில், மொத்தத் தொகை A கணக்கிடும் சூத்திரம் A = _______ ஆகும்.",
    "options": {
      "A": "P [1 + (R * N) / 100]",
      "B": "P [1 + R / 100]^N",
      "C": "(P * R * N) / 100",
      "D": "P / [1 + (R * N) / 100]"
    },
    "correct_option": "A",
    "explanation": "[Question #0150] Total Amount A = Principal P + Simple Interest SI = P + (P * R * N) / 100 = P [1 + (R * N) / 100].",
    "explanation_ta": "[கேள்வி எண் #0150] மொத்தத் தொகை A = அசல் + தனிவட்டி = P [1 + (R * N) / 100].",
    "formula_or_law": "A = P \\left(1 + \\frac{R \\cdot N}{100}\\right)"
  },
  {
    "question_uid": "MAT-ALG-01-01-M2-M-0151",
    "taxonomy": {
      "subject": "Mathematics",
      "subject_code": "MAT",
      "domain": "Algebra",
      "domain_code": "ALG",
      "topic": "Kinematics & Principles",
      "topic_code": "01",
      "subtopic": "Eigenvalues & Rank",
      "subtopic_code": "01",
      "microtopic": "Kinematics Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "SCHOOL_K12",
      "question_format": "numerical"
    },
    "question_format": "numerical",
    "exam_category": "SCHOOL_K12",
    "question_text": "[#0151] In two-dimensional projectile motion without air resistance, the horizontal velocity component remains _______ throughout the flight.",
    "question_text_ta": "[#0151] காற்று உராய்வு இல்லாத இருபரிமாண எறிபொருள் இயக்கத்தில் கிடைமட்ட திசைவேகக் கூறு இயக்கம் முழுவதும் _______ ஆக இருக்கும்.",
    "options": {
      "A": "Constant (மாறிலி)",
      "B": "Zero at highest point (உச்சியில் சுழி)",
      "C": "Linearly increasing (நேர்கோட்டில் அதிகரிக்கும்)",
      "D": "Exponentially decaying (அதிவேகமாக குறையும்)"
    },
    "correct_option": "A",
    "explanation": "[Question #0151] Since gravity acts solely vertically downward (a_y = -g), horizontal acceleration a_x = 0, keeping horizontal velocity v_x = u cos θ strictly constant.",
    "explanation_ta": "[கேள்வி எண் #0151] புவியீர்ப்பு விசை செங்குத்தாக மட்டுமே செயல்படுவதால் கிடைமட்ட முடுக்கம் a_x = 0, எனவே v_x மாறிலியாக இருக்கும்.",
    "formula_or_law": "v_x = u \\cos\\theta = \\text{constant}"
  },
  {
    "question_uid": "CS-DSA-01-01-M1-M-0152",
    "taxonomy": {
      "subject": "Computer Science",
      "subject_code": "CS",
      "domain": "Algorithms",
      "domain_code": "DSA",
      "topic": "Ohm Law & Principles",
      "topic_code": "01",
      "subtopic": "Binary Search Trees & AVL",
      "subtopic_code": "01",
      "microtopic": "Ohm Law Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Medium",
      "exam_category": "SSC_BANK",
      "question_format": "match_the_following"
    },
    "question_format": "match_the_following",
    "exam_category": "SSC_BANK",
    "question_text": "[#0152] According to microscopic Ohm's law, the electrical conductivity σ is given by the formula _______ .",
    "question_text_ta": "[#0152] நுண்ணோக்கி ஓம் விதியின்படி ஒரு கடத்தியின் மின்கடத்துத்திறன் σ சமன்பாடு _______ ஆகும்.",
    "options": {
      "A": "σ = (n e² τ) / m",
      "B": "σ = (m e² τ) / n",
      "C": "σ = (n e τ) / m²",
      "D": "σ = (n² e τ) / m"
    },
    "correct_option": "A",
    "explanation": "[Question #0152] Conductivity σ is derived from J = n e v_d where v_d = (e E τ) / m, leading to J = (n e² τ / m) E = σ E.",
    "explanation_ta": "[கேள்வி எண் #0152] மின்கடத்துத்திறன் σ = (n e² τ) / m ஆகும்.",
    "formula_or_law": "\\sigma = \\frac{n e^2 \\tau}{m}"
  },
  {
    "question_uid": "CS-DBMS-01-01-M2-E-0153",
    "taxonomy": {
      "subject": "Computer Science",
      "subject_code": "CS",
      "domain": "Databases",
      "domain_code": "DBMS",
      "topic": "Chemical Kinetics & Principles",
      "topic_code": "01",
      "subtopic": "Normalization & Indexing",
      "subtopic_code": "01",
      "microtopic": "Chemical Kinetics Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Easy",
      "exam_category": "SSC_BANK",
      "question_format": "pyq"
    },
    "question_format": "pyq",
    "exam_category": "SSC_BANK",
    "question_text": "[#0153] For a first-order chemical reaction, the half-life period t_1/2 is _______ of initial reactant concentration.",
    "question_text_ta": "[#0153] ஒரு முதல் வகை வேதிவினைக்கு அரைவாழ்வு காலம் தொடக்கச் செறிவை _______ .",
    "options": {
      "A": "Independent (சார்ந்திருக்காது - t_1/2 = 0.693 / k)",
      "B": "Directly proportional (நேர்விகிதத்தில் சார்ந்தது)",
      "C": "Inversely proportional (எதிர்விகிதத்தில் சார்ந்தது)",
      "D": "Exponentially dependent (அதிவேகமாக சார்ந்தது)"
    },
    "correct_option": "A",
    "explanation": "[Question #0153] For first order: k = (2.303 / t) log([A]_0 / [A]). At t = t_1/2, [A] = [A]_0 / 2, giving t_1/2 = ln(2) / k = 0.693 / k.",
    "explanation_ta": "[கேள்வி எண் #0153] முதல் வகை வினைக்கு அரைவாழ்வு காலம் தொடக்கச் செறிவைச் சார்ந்திருக்காது: t_1/2 = 0.693 / k.",
    "formula_or_law": "t_{1/2} = \\frac{\\ln 2}{k} = \\frac{0.693}{k}"
  },
  {
    "question_uid": "HIS-TN-01-01-M1-E-0154",
    "taxonomy": {
      "subject": "History",
      "subject_code": "HIS",
      "domain": "Tamil Nadu History",
      "domain_code": "TN",
      "topic": "Photosynthesis & Principles",
      "topic_code": "01",
      "subtopic": "Cholas, Pandyas & Cheras",
      "subtopic_code": "01",
      "microtopic": "Photosynthesis Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Easy",
      "exam_category": "TNPSC",
      "question_format": "theory"
    },
    "question_format": "theory",
    "exam_category": "TNPSC",
    "question_text": "[#0154] During photosynthesis in chloroplasts, photolysis of water occurs at the _______ complex of PS II.",
    "question_text_ta": "[#0154] ஒளிச்சேர்க்கையின் போது நீர் மூலக்கூறு ஒளிச்சிதைவு PS II இன் _______ வளாகத்தில் நடைபெறுகிறது.",
    "options": {
      "A": "Oxygen-Evolving Complex (OEC - ஆக்ஸிஜன் வெளிப்படுத்தும் மையம்)",
      "B": "ATP Synthase CF0-CF1 complex",
      "C": "Photosystem I reaction center P700",
      "D": "Cytochrome b6f complex"
    },
    "correct_option": "A",
    "explanation": "[Question #0154] Water photolysis (2H2O -> 4H+ + 4e- + O2) is catalyzed by the manganese-containing oxygen-evolving complex located on the luminal side of PS II.",
    "explanation_ta": "[கேள்வி எண் #0154] நீர் மூலக்கூறு சிதைவு PS II இன் ஆக்ஸிஜன் வெளிப்படுத்தும் மையத்தால் வினையூக்கப்படுகிறது.",
    "formula_or_law": "2\\text{H}_2\\text{O} \\xrightarrow{h\\nu, \\text{PS II}} 4\\text{H}^+ + 4e^- + \\text{O}_2"
  },
  {
    "question_uid": "HIS-MOD-01-01-M2-M-0155",
    "taxonomy": {
      "subject": "History",
      "subject_code": "HIS",
      "domain": "Modern India",
      "domain_code": "MOD",
      "topic": "Matrices & Principles",
      "topic_code": "01",
      "subtopic": "Non-Cooperation & Civil Disobedience",
      "subtopic_code": "01",
      "microtopic": "Matrices Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "TNPSC",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "TNPSC",
    "question_text": "[#0155] The sum of all eigenvalues of an n x n square matrix A is identically equal to the _______ of matrix A.",
    "question_text_ta": "[#0155] ஒரு சதுர அணி A இன் அனைத்து ஐகன் மதிப்புகளின் கூடுதல் அந்த அணியின் _______ க்குச் சமமாகும்.",
    "options": {
      "A": "Trace (சுவடு - Tr(A))",
      "B": "Determinant (அணிக்கோவை மதிப்பு)",
      "C": "Rank (அணியின் தரம்)",
      "D": "Nullity (வெற்றுமை)"
    },
    "correct_option": "A",
    "explanation": "[Question #0155] The trace of any square matrix equals the sum of its main diagonal elements, which identically equals the algebraic sum of all its eigenvalues.",
    "explanation_ta": "[கேள்வி எண் #0155] ஒரு சதுர அணியின் சுவடு (Trace) அதன் முதன்மை மூலைவிட்ட உறுப்புகளின் கூடுதலுக்கு மற்றும் அனைத்து ஐகன் மதிப்புகளின் கூடுதலுக்குச் சமமாகும்.",
    "formula_or_law": "\\text{Tr}(A) = \\sum_{i=1}^n a_{ii} = \\sum_{i=1}^n \\lambda_i"
  },
  {
    "question_uid": "POL-CON-01-01-M1-E-0156",
    "taxonomy": {
      "subject": "Polity",
      "subject_code": "POL",
      "domain": "Constitution",
      "domain_code": "CON",
      "topic": "Binary Search Trees & Principles",
      "topic_code": "01",
      "subtopic": "Articles 14-32 & Writs",
      "subtopic_code": "01",
      "microtopic": "Binary Search Trees Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Easy",
      "exam_category": "TNPSC",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "TNPSC",
    "question_text": "[#0156] In an AVL Tree, the balance factor for every node is strictly constrained to the set _______ .",
    "question_text_ta": "[#0156] AVL மரத்தில் ஒவ்வொரு முனையின் சமநிலை காரணி (Balance Factor) எப்போதும் _______ கணத்திற்குள் இருக்க வேண்டும்.",
    "options": {
      "A": "{-1, 0, +1}",
      "B": "{0, 1, 2}",
      "C": "{-2, 0, +2}",
      "D": "{0, 1}"
    },
    "correct_option": "A",
    "explanation": "[Question #0156] An AVL tree is a self-balancing binary search tree where the height difference between left and right subtrees (Balance Factor = Height(L) - Height(R)) is strictly in {-1, 0, 1}.",
    "explanation_ta": "[கேள்வி எண் #0156] AVL மரத்தில் இடது மற்றும் வலது துணை மரங்களின் உயர வேறுபாடு எப்போதும் -1, 0, அல்லது +1 ஆக மட்டுமே இருக்க வேண்டும்.",
    "formula_or_law": "\\text{BF}(v) = h(\\text{left}(v)) - h(\\text{right}(v)) \\in \\{-1, 0, +1\\}"
  },
  {
    "question_uid": "POL-GOV-01-01-M2-M-0157",
    "taxonomy": {
      "subject": "Polity",
      "subject_code": "POL",
      "domain": "Governance",
      "domain_code": "GOV",
      "topic": "Constitution & Principles",
      "topic_code": "01",
      "subtopic": "Lok Sabha & Supreme Court",
      "subtopic_code": "01",
      "microtopic": "Constitution Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "SSC_BANK",
      "question_format": "assertion_reason"
    },
    "question_format": "assertion_reason",
    "exam_category": "SSC_BANK",
    "question_text": "[#0157] Under Article _______ of the Constitution of India, High Courts have the power to issue Writs for Fundamental Rights and other legal rights.",
    "question_text_ta": "[#0157] இந்திய அரசியலமைப்பின் சட்டப்பிரிவு _______ இன் கீழ் உயர்நீதிமன்றங்கள் நீதிப்பேராணைகளை வெளியிடும் அதிகாரம் பெற்றுள்ளன.",
    "options": {
      "A": "Article 226",
      "B": "Article 32",
      "C": "Article 14",
      "D": "Article 368"
    },
    "correct_option": "A",
    "explanation": "[Question #0157] Article 226 empowers High Courts to issue Writs for Fundamental Rights as well as ordinary legal rights, giving it a wider textual scope than Article 32.",
    "explanation_ta": "[கேள்வி எண் #0157] சட்டப்பிரிவு 226 உயர்நீதிமன்றங்களுக்கு அடிப்படை உரிமைகள் மற்றும் பிற சட்ட உரிமைகளுக்காகவும் நீதிப்பேராணைகளை வழங்கும் அதிகாரத்தை அளிக்கிறது.",
    "formula_or_law": "\\text{Article 226} \\implies \\text{High Court Writ Jurisdiction}"
  },
  {
    "question_uid": "GEO-IND-01-01-M1-E-0158",
    "taxonomy": {
      "subject": "Geography",
      "subject_code": "GEO",
      "domain": "Indian Geography",
      "domain_code": "IND",
      "topic": "Cholas & Principles",
      "topic_code": "01",
      "subtopic": "Himalayan & Peninsular Rivers",
      "subtopic_code": "01",
      "microtopic": "Cholas Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Easy",
      "exam_category": "TNPSC",
      "question_format": "numerical"
    },
    "question_format": "numerical",
    "exam_category": "TNPSC",
    "question_text": "[#0158] The famous Uttaramerur Inscription of Parantaka Chola I describes the _______ system of secret ballot village democracy.",
    "question_text_ta": "[#0158] முதலாம் பராந்தக சோழனின் உத்திரமேரூர் கல்வெட்டு கிராம நிர்வாகத்திற்கான _______ தேர்தல் முறையை விவரிக்கிறது.",
    "options": {
      "A": "Kudavolai (குடவோலை முறை)",
      "B": "Kadamai (கடமை முறை)",
      "C": "Variyam (வாரிய வரி விதிப்பு)",
      "D": "Kaniurimai (காணியுரிமை முறை)"
    },
    "correct_option": "A",
    "explanation": "[Question #0158] The Uttaramerur inscription details the Kudavolai secret ballot system for electing members to village committees (Variyams) with strict qualifications and disqualifications.",
    "explanation_ta": "[கேள்வி எண் #0158] உத்திரமேரூர் கல்வெட்டு கிராம சபைக் குழுக்களுக்கு (வாரியங்கள்) குடவோலை முறை மூலம் உறுப்பினர்களைத் தேர்ந்தெடுக்கும் தேர்தல் முறையை விவரிக்கிறது.",
    "formula_or_law": "\\text{Uttaramerur Inscription} \\implies \\text{Village Kudavolai Democracy}"
  },
  {
    "question_uid": "GEO-TN-01-01-M2-M-0159",
    "taxonomy": {
      "subject": "Geography",
      "subject_code": "GEO",
      "domain": "Tamil Nadu Geography",
      "domain_code": "TN",
      "topic": "Monsoons & Principles",
      "topic_code": "01",
      "subtopic": "Monsoons & Soil Types",
      "subtopic_code": "01",
      "microtopic": "Monsoons Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "TNPSC",
      "question_format": "match_the_following"
    },
    "question_format": "match_the_following",
    "exam_category": "TNPSC",
    "question_text": "[#0159] Tamil Nadu receives nearly 48% to 50% of its annual precipitation from the _______ Monsoon season.",
    "question_text_ta": "[#0159] தமிழ்நாடு தனது ஆண்டு மழையில் சுமார் 48% முதல் 50% பங்கை _______ பருவமழை காலத்தில் பெறுகிறது.",
    "options": {
      "A": "North-East Monsoon (வடகிழக்குப் பருவமழை)",
      "B": "South-West Monsoon (தென்மேற்குப் பருவமழை)",
      "C": "Pre-Monsoon Convectional Showers (கோடை மழை)",
      "D": "Winter Cyclonic Disturbances"
    },
    "correct_option": "A",
    "explanation": "[Question #0159] The North-East Monsoon accounts for nearly 48-50% of Tamil Nadu's annual precipitation as retreating winds pick up moisture across the Bay of Bengal and hit the Coromandel coast.",
    "explanation_ta": "[கேள்வி எண் #0159] தமிழ்நாடு தனது ஆண்டு மழையில் சுமார் 48-50% பங்கை வடகிழக்குப் பருவமழை மூலமே பெறுகிறது.",
    "formula_or_law": "\\text{NE Monsoon (Oct-Dec)} \\implies 48\\text{--}50\\% \\text{ TN Precipitation}"
  },
  {
    "question_uid": "APT-NUM-01-01-M1-E-0160",
    "taxonomy": {
      "subject": "Aptitude",
      "subject_code": "APT",
      "domain": "Quantitative Aptitude",
      "domain_code": "NUM",
      "topic": "Simple Interest & Principles",
      "topic_code": "01",
      "subtopic": "Simple & Compound Interest",
      "subtopic_code": "01",
      "microtopic": "Simple Interest Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Easy",
      "exam_category": "SSC_BANK",
      "question_format": "pyq"
    },
    "question_format": "pyq",
    "exam_category": "SSC_BANK",
    "question_text": "[#0160] If SI = (P * R * N) / 100, the total accumulated amount A is calculated by the formula A = _______ .",
    "question_text_ta": "[#0160] தனிவட்டி SI = (P * R * N) / 100 எனில், மொத்தத் தொகை A கணக்கிடும் சூத்திரம் A = _______ ஆகும்.",
    "options": {
      "A": "P [1 + (R * N) / 100]",
      "B": "P [1 + R / 100]^N",
      "C": "(P * R * N) / 100",
      "D": "P / [1 + (R * N) / 100]"
    },
    "correct_option": "A",
    "explanation": "[Question #0160] Total Amount A = Principal P + Simple Interest SI = P + (P * R * N) / 100 = P [1 + (R * N) / 100].",
    "explanation_ta": "[கேள்வி எண் #0160] மொத்தத் தொகை A = அசல் + தனிவட்டி = P [1 + (R * N) / 100].",
    "formula_or_law": "A = P \\left(1 + \\frac{R \\cdot N}{100}\\right)"
  },
  {
    "question_uid": "PHY-MEC-01-01-M1-M-0161",
    "taxonomy": {
      "subject": "Physics",
      "subject_code": "PHY",
      "domain": "Mechanics",
      "domain_code": "MEC",
      "topic": "Kinematics & Principles",
      "topic_code": "01",
      "subtopic": "Motion in 2D & Projectiles",
      "subtopic_code": "01",
      "microtopic": "Kinematics Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Medium",
      "exam_category": "NEET_JEE",
      "question_format": "theory"
    },
    "question_format": "theory",
    "exam_category": "NEET_JEE",
    "question_text": "[#0161] In two-dimensional projectile motion without air resistance, the horizontal velocity component remains _______ throughout the flight.",
    "question_text_ta": "[#0161] காற்று உராய்வு இல்லாத இருபரிமாண எறிபொருள் இயக்கத்தில் கிடைமட்ட திசைவேகக் கூறு இயக்கம் முழுவதும் _______ ஆக இருக்கும்.",
    "options": {
      "A": "Constant (மாறிலி)",
      "B": "Zero at highest point (உச்சியில் சுழி)",
      "C": "Linearly increasing (நேர்கோட்டில் அதிகரிக்கும்)",
      "D": "Exponentially decaying (அதிவேகமாக குறையும்)"
    },
    "correct_option": "A",
    "explanation": "[Question #0161] Since gravity acts solely vertically downward (a_y = -g), horizontal acceleration a_x = 0, keeping horizontal velocity v_x = u cos θ strictly constant.",
    "explanation_ta": "[கேள்வி எண் #0161] புவியீர்ப்பு விசை செங்குத்தாக மட்டுமே செயல்படுவதால் கிடைமட்ட முடுக்கம் a_x = 0, எனவே v_x மாறிலியாக இருக்கும்.",
    "formula_or_law": "v_x = u \\cos\\theta = \\text{constant}"
  },
  {
    "question_uid": "PHY-ELE-01-01-M2-E-0162",
    "taxonomy": {
      "subject": "Physics",
      "subject_code": "PHY",
      "domain": "Electrodynamics",
      "domain_code": "ELE",
      "topic": "Ohm Law & Principles",
      "topic_code": "01",
      "subtopic": "Ohm Law & Kirchhoff Rules",
      "subtopic_code": "01",
      "microtopic": "Ohm Law Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Easy",
      "exam_category": "NEET_JEE",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "NEET_JEE",
    "question_text": "[#0162] According to microscopic Ohm's law, the electrical conductivity σ is given by the formula _______ .",
    "question_text_ta": "[#0162] நுண்ணோக்கி ஓம் விதியின்படி ஒரு கடத்தியின் மின்கடத்துத்திறன் σ சமன்பாடு _______ ஆகும்.",
    "options": {
      "A": "σ = (n e² τ) / m",
      "B": "σ = (m e² τ) / n",
      "C": "σ = (n e τ) / m²",
      "D": "σ = (n² e τ) / m"
    },
    "correct_option": "A",
    "explanation": "[Question #0162] Conductivity σ is derived from J = n e v_d where v_d = (e E τ) / m, leading to J = (n e² τ / m) E = σ E.",
    "explanation_ta": "[கேள்வி எண் #0162] மின்கடத்துத்திறன் σ = (n e² τ) / m ஆகும்.",
    "formula_or_law": "\\sigma = \\frac{n e^2 \\tau}{m}"
  },
  {
    "question_uid": "PHY-OPT-01-01-M3-H-0163",
    "taxonomy": {
      "subject": "Physics",
      "subject_code": "PHY",
      "domain": "Optics",
      "domain_code": "OPT",
      "topic": "Chemical Kinetics & Principles",
      "topic_code": "01",
      "subtopic": "Interference & Diffraction",
      "subtopic_code": "01",
      "microtopic": "Chemical Kinetics Core Rule",
      "microtopic_code": "M3",
      "difficulty": "Hard",
      "exam_category": "SCHOOL_K12",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "SCHOOL_K12",
    "question_text": "[#0163] For a first-order chemical reaction, the half-life period t_1/2 is _______ of initial reactant concentration.",
    "question_text_ta": "[#0163] ஒரு முதல் வகை வேதிவினைக்கு அரைவாழ்வு காலம் தொடக்கச் செறிவை _______ .",
    "options": {
      "A": "Independent (சார்ந்திருக்காது - t_1/2 = 0.693 / k)",
      "B": "Directly proportional (நேர்விகிதத்தில் சார்ந்தது)",
      "C": "Inversely proportional (எதிர்விகிதத்தில் சார்ந்தது)",
      "D": "Exponentially dependent (அதிவேகமாக சார்ந்தது)"
    },
    "correct_option": "A",
    "explanation": "[Question #0163] For first order: k = (2.303 / t) log([A]_0 / [A]). At t = t_1/2, [A] = [A]_0 / 2, giving t_1/2 = ln(2) / k = 0.693 / k.",
    "explanation_ta": "[கேள்வி எண் #0163] முதல் வகை வினைக்கு அரைவாழ்வு காலம் தொடக்கச் செறிவைச் சார்ந்திருக்காது: t_1/2 = 0.693 / k.",
    "formula_or_law": "t_{1/2} = \\frac{\\ln 2}{k} = \\frac{0.693}{k}"
  },
  {
    "question_uid": "CHE-ORG-01-01-M1-H-0164",
    "taxonomy": {
      "subject": "Chemistry",
      "subject_code": "CHE",
      "domain": "Organic Chemistry",
      "domain_code": "ORG",
      "topic": "Photosynthesis & Principles",
      "topic_code": "01",
      "subtopic": "Electrophilic & Nucleophilic",
      "subtopic_code": "01",
      "microtopic": "Photosynthesis Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Hard",
      "exam_category": "NEET_JEE",
      "question_format": "assertion_reason"
    },
    "question_format": "assertion_reason",
    "exam_category": "NEET_JEE",
    "question_text": "[#0164] During photosynthesis in chloroplasts, photolysis of water occurs at the _______ complex of PS II.",
    "question_text_ta": "[#0164] ஒளிச்சேர்க்கையின் போது நீர் மூலக்கூறு ஒளிச்சிதைவு PS II இன் _______ வளாகத்தில் நடைபெறுகிறது.",
    "options": {
      "A": "Oxygen-Evolving Complex (OEC - ஆக்ஸிஜன் வெளிப்படுத்தும் மையம்)",
      "B": "ATP Synthase CF0-CF1 complex",
      "C": "Photosystem I reaction center P700",
      "D": "Cytochrome b6f complex"
    },
    "correct_option": "A",
    "explanation": "[Question #0164] Water photolysis (2H2O -> 4H+ + 4e- + O2) is catalyzed by the manganese-containing oxygen-evolving complex located on the luminal side of PS II.",
    "explanation_ta": "[கேள்வி எண் #0164] நீர் மூலக்கூறு சிதைவு PS II இன் ஆக்ஸிஜன் வெளிப்படுத்தும் மையத்தால் வினையூக்கப்படுகிறது.",
    "formula_or_law": "2\\text{H}_2\\text{O} \\xrightarrow{h\\nu, \\text{PS II}} 4\\text{H}^+ + 4e^- + \\text{O}_2"
  },
  {
    "question_uid": "CHE-INO-01-01-M2-M-0165",
    "taxonomy": {
      "subject": "Chemistry",
      "subject_code": "CHE",
      "domain": "Inorganic Chemistry",
      "domain_code": "INO",
      "topic": "Matrices & Principles",
      "topic_code": "01",
      "subtopic": "Ligand Field & Isomerism",
      "subtopic_code": "01",
      "microtopic": "Matrices Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "NEET_JEE",
      "question_format": "numerical"
    },
    "question_format": "numerical",
    "exam_category": "NEET_JEE",
    "question_text": "[#0165] The sum of all eigenvalues of an n x n square matrix A is identically equal to the _______ of matrix A.",
    "question_text_ta": "[#0165] ஒரு சதுர அணி A இன் அனைத்து ஐகன் மதிப்புகளின் கூடுதல் அந்த அணியின் _______ க்குச் சமமாகும்.",
    "options": {
      "A": "Trace (சுவடு - Tr(A))",
      "B": "Determinant (அணிக்கோவை மதிப்பு)",
      "C": "Rank (அணியின் தரம்)",
      "D": "Nullity (வெற்றுமை)"
    },
    "correct_option": "A",
    "explanation": "[Question #0165] The trace of any square matrix equals the sum of its main diagonal elements, which identically equals the algebraic sum of all its eigenvalues.",
    "explanation_ta": "[கேள்வி எண் #0165] ஒரு சதுர அணியின் சுவடு (Trace) அதன் முதன்மை மூலைவிட்ட உறுப்புகளின் கூடுதலுக்கு மற்றும் அனைத்து ஐகன் மதிப்புகளின் கூடுதலுக்குச் சமமாகும்.",
    "formula_or_law": "\\text{Tr}(A) = \\sum_{i=1}^n a_{ii} = \\sum_{i=1}^n \\lambda_i"
  },
  {
    "question_uid": "CHE-PHY-01-01-M3-M-0166",
    "taxonomy": {
      "subject": "Chemistry",
      "subject_code": "CHE",
      "domain": "Physical Chemistry",
      "domain_code": "PHY",
      "topic": "Binary Search Trees & Principles",
      "topic_code": "01",
      "subtopic": "Rate Laws & Arrhenius",
      "subtopic_code": "01",
      "microtopic": "Binary Search Trees Core Rule",
      "microtopic_code": "M3",
      "difficulty": "Medium",
      "exam_category": "SCHOOL_K12",
      "question_format": "match_the_following"
    },
    "question_format": "match_the_following",
    "exam_category": "SCHOOL_K12",
    "question_text": "[#0166] In an AVL Tree, the balance factor for every node is strictly constrained to the set _______ .",
    "question_text_ta": "[#0166] AVL மரத்தில் ஒவ்வொரு முனையின் சமநிலை காரணி (Balance Factor) எப்போதும் _______ கணத்திற்குள் இருக்க வேண்டும்.",
    "options": {
      "A": "{-1, 0, +1}",
      "B": "{0, 1, 2}",
      "C": "{-2, 0, +2}",
      "D": "{0, 1}"
    },
    "correct_option": "A",
    "explanation": "[Question #0166] An AVL tree is a self-balancing binary search tree where the height difference between left and right subtrees (Balance Factor = Height(L) - Height(R)) is strictly in {-1, 0, 1}.",
    "explanation_ta": "[கேள்வி எண் #0166] AVL மரத்தில் இடது மற்றும் வலது துணை மரங்களின் உயர வேறுபாடு எப்போதும் -1, 0, அல்லது +1 ஆக மட்டுமே இருக்க வேண்டும்.",
    "formula_or_law": "\\text{BF}(v) = h(\\text{left}(v)) - h(\\text{right}(v)) \\in \\{-1, 0, +1\\}"
  },
  {
    "question_uid": "BIO-BOT-01-01-M1-M-0167",
    "taxonomy": {
      "subject": "Biology",
      "subject_code": "BIO",
      "domain": "Botany",
      "domain_code": "BOT",
      "topic": "Constitution & Principles",
      "topic_code": "01",
      "subtopic": "Photosynthesis C3 & C4",
      "subtopic_code": "01",
      "microtopic": "Constitution Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Medium",
      "exam_category": "NEET_JEE",
      "question_format": "pyq"
    },
    "question_format": "pyq",
    "exam_category": "NEET_JEE",
    "question_text": "[#0167] Under Article _______ of the Constitution of India, High Courts have the power to issue Writs for Fundamental Rights and other legal rights.",
    "question_text_ta": "[#0167] இந்திய அரசியலமைப்பின் சட்டப்பிரிவு _______ இன் கீழ் உயர்நீதிமன்றங்கள் நீதிப்பேராணைகளை வெளியிடும் அதிகாரம் பெற்றுள்ளன.",
    "options": {
      "A": "Article 226",
      "B": "Article 32",
      "C": "Article 14",
      "D": "Article 368"
    },
    "correct_option": "A",
    "explanation": "[Question #0167] Article 226 empowers High Courts to issue Writs for Fundamental Rights as well as ordinary legal rights, giving it a wider textual scope than Article 32.",
    "explanation_ta": "[கேள்வி எண் #0167] சட்டப்பிரிவு 226 உயர்நீதிமன்றங்களுக்கு அடிப்படை உரிமைகள் மற்றும் பிற சட்ட உரிமைகளுக்காகவும் நீதிப்பேராணைகளை வழங்கும் அதிகாரத்தை அளிக்கிறது.",
    "formula_or_law": "\\text{Article 226} \\implies \\text{High Court Writ Jurisdiction}"
  },
  {
    "question_uid": "BIO-ZOO-01-01-M2-E-0168",
    "taxonomy": {
      "subject": "Biology",
      "subject_code": "BIO",
      "domain": "Zoology",
      "domain_code": "ZOO",
      "topic": "Cholas & Principles",
      "topic_code": "01",
      "subtopic": "Endocrine & Neural System",
      "subtopic_code": "01",
      "microtopic": "Cholas Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Easy",
      "exam_category": "NEET_JEE",
      "question_format": "theory"
    },
    "question_format": "theory",
    "exam_category": "NEET_JEE",
    "question_text": "[#0168] The famous Uttaramerur Inscription of Parantaka Chola I describes the _______ system of secret ballot village democracy.",
    "question_text_ta": "[#0168] முதலாம் பராந்தக சோழனின் உத்திரமேரூர் கல்வெட்டு கிராம நிர்வாகத்திற்கான _______ தேர்தல் முறையை விவரிக்கிறது.",
    "options": {
      "A": "Kudavolai (குடவோலை முறை)",
      "B": "Kadamai (கடமை முறை)",
      "C": "Variyam (வாரிய வரி விதிப்பு)",
      "D": "Kaniurimai (காணியுரிமை முறை)"
    },
    "correct_option": "A",
    "explanation": "[Question #0168] The Uttaramerur inscription details the Kudavolai secret ballot system for electing members to village committees (Variyams) with strict qualifications and disqualifications.",
    "explanation_ta": "[கேள்வி எண் #0168] உத்திரமேரூர் கல்வெட்டு கிராம சபைக் குழுக்களுக்கு (வாரியங்கள்) குடவோலை முறை மூலம் உறுப்பினர்களைத் தேர்ந்தெடுக்கும் தேர்தல் முறையை விவரிக்கிறது.",
    "formula_or_law": "\\text{Uttaramerur Inscription} \\implies \\text{Village Kudavolai Democracy}"
  },
  {
    "question_uid": "BIO-GEN-01-01-M3-H-0169",
    "taxonomy": {
      "subject": "Biology",
      "subject_code": "BIO",
      "domain": "Genetics",
      "domain_code": "GEN",
      "topic": "Monsoons & Principles",
      "topic_code": "01",
      "subtopic": "DNA Replication & Translation",
      "subtopic_code": "01",
      "microtopic": "Monsoons Core Rule",
      "microtopic_code": "M3",
      "difficulty": "Hard",
      "exam_category": "SCHOOL_K12",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "SCHOOL_K12",
    "question_text": "[#0169] Tamil Nadu receives nearly 48% to 50% of its annual precipitation from the _______ Monsoon season.",
    "question_text_ta": "[#0169] தமிழ்நாடு தனது ஆண்டு மழையில் சுமார் 48% முதல் 50% பங்கை _______ பருவமழை காலத்தில் பெறுகிறது.",
    "options": {
      "A": "North-East Monsoon (வடகிழக்குப் பருவமழை)",
      "B": "South-West Monsoon (தென்மேற்குப் பருவமழை)",
      "C": "Pre-Monsoon Convectional Showers (கோடை மழை)",
      "D": "Winter Cyclonic Disturbances"
    },
    "correct_option": "A",
    "explanation": "[Question #0169] The North-East Monsoon accounts for nearly 48-50% of Tamil Nadu's annual precipitation as retreating winds pick up moisture across the Bay of Bengal and hit the Coromandel coast.",
    "explanation_ta": "[கேள்வி எண் #0169] தமிழ்நாடு தனது ஆண்டு மழையில் சுமார் 48-50% பங்கை வடகிழக்குப் பருவமழை மூலமே பெறுகிறது.",
    "formula_or_law": "\\text{NE Monsoon (Oct-Dec)} \\implies 48\\text{--}50\\% \\text{ TN Precipitation}"
  },
  {
    "question_uid": "MAT-CAL-01-01-M1-H-0170",
    "taxonomy": {
      "subject": "Mathematics",
      "subject_code": "MAT",
      "domain": "Calculus",
      "domain_code": "CAL",
      "topic": "Simple Interest & Principles",
      "topic_code": "01",
      "subtopic": "Definite Integrals & Limits",
      "subtopic_code": "01",
      "microtopic": "Simple Interest Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Hard",
      "exam_category": "NEET_JEE",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "NEET_JEE",
    "question_text": "[#0170] If SI = (P * R * N) / 100, the total accumulated amount A is calculated by the formula A = _______ .",
    "question_text_ta": "[#0170] தனிவட்டி SI = (P * R * N) / 100 எனில், மொத்தத் தொகை A கணக்கிடும் சூத்திரம் A = _______ ஆகும்.",
    "options": {
      "A": "P [1 + (R * N) / 100]",
      "B": "P [1 + R / 100]^N",
      "C": "(P * R * N) / 100",
      "D": "P / [1 + (R * N) / 100]"
    },
    "correct_option": "A",
    "explanation": "[Question #0170] Total Amount A = Principal P + Simple Interest SI = P + (P * R * N) / 100 = P [1 + (R * N) / 100].",
    "explanation_ta": "[கேள்வி எண் #0170] மொத்தத் தொகை A = அசல் + தனிவட்டி = P [1 + (R * N) / 100].",
    "formula_or_law": "A = P \\left(1 + \\frac{R \\cdot N}{100}\\right)"
  },
  {
    "question_uid": "MAT-ALG-01-01-M2-M-0171",
    "taxonomy": {
      "subject": "Mathematics",
      "subject_code": "MAT",
      "domain": "Algebra",
      "domain_code": "ALG",
      "topic": "Kinematics & Principles",
      "topic_code": "01",
      "subtopic": "Eigenvalues & Rank",
      "subtopic_code": "01",
      "microtopic": "Kinematics Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "SCHOOL_K12",
      "question_format": "assertion_reason"
    },
    "question_format": "assertion_reason",
    "exam_category": "SCHOOL_K12",
    "question_text": "[#0171] In two-dimensional projectile motion without air resistance, the horizontal velocity component remains _______ throughout the flight.",
    "question_text_ta": "[#0171] காற்று உராய்வு இல்லாத இருபரிமாண எறிபொருள் இயக்கத்தில் கிடைமட்ட திசைவேகக் கூறு இயக்கம் முழுவதும் _______ ஆக இருக்கும்.",
    "options": {
      "A": "Constant (மாறிலி)",
      "B": "Zero at highest point (உச்சியில் சுழி)",
      "C": "Linearly increasing (நேர்கோட்டில் அதிகரிக்கும்)",
      "D": "Exponentially decaying (அதிவேகமாக குறையும்)"
    },
    "correct_option": "A",
    "explanation": "[Question #0171] Since gravity acts solely vertically downward (a_y = -g), horizontal acceleration a_x = 0, keeping horizontal velocity v_x = u cos θ strictly constant.",
    "explanation_ta": "[கேள்வி எண் #0171] புவியீர்ப்பு விசை செங்குத்தாக மட்டுமே செயல்படுவதால் கிடைமட்ட முடுக்கம் a_x = 0, எனவே v_x மாறிலியாக இருக்கும்.",
    "formula_or_law": "v_x = u \\cos\\theta = \\text{constant}"
  },
  {
    "question_uid": "CS-DSA-01-01-M1-M-0172",
    "taxonomy": {
      "subject": "Computer Science",
      "subject_code": "CS",
      "domain": "Algorithms",
      "domain_code": "DSA",
      "topic": "Ohm Law & Principles",
      "topic_code": "01",
      "subtopic": "Binary Search Trees & AVL",
      "subtopic_code": "01",
      "microtopic": "Ohm Law Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Medium",
      "exam_category": "SSC_BANK",
      "question_format": "numerical"
    },
    "question_format": "numerical",
    "exam_category": "SSC_BANK",
    "question_text": "[#0172] According to microscopic Ohm's law, the electrical conductivity σ is given by the formula _______ .",
    "question_text_ta": "[#0172] நுண்ணோக்கி ஓம் விதியின்படி ஒரு கடத்தியின் மின்கடத்துத்திறன் σ சமன்பாடு _______ ஆகும்.",
    "options": {
      "A": "σ = (n e² τ) / m",
      "B": "σ = (m e² τ) / n",
      "C": "σ = (n e τ) / m²",
      "D": "σ = (n² e τ) / m"
    },
    "correct_option": "A",
    "explanation": "[Question #0172] Conductivity σ is derived from J = n e v_d where v_d = (e E τ) / m, leading to J = (n e² τ / m) E = σ E.",
    "explanation_ta": "[கேள்வி எண் #0172] மின்கடத்துத்திறன் σ = (n e² τ) / m ஆகும்.",
    "formula_or_law": "\\sigma = \\frac{n e^2 \\tau}{m}"
  },
  {
    "question_uid": "CS-DBMS-01-01-M2-E-0173",
    "taxonomy": {
      "subject": "Computer Science",
      "subject_code": "CS",
      "domain": "Databases",
      "domain_code": "DBMS",
      "topic": "Chemical Kinetics & Principles",
      "topic_code": "01",
      "subtopic": "Normalization & Indexing",
      "subtopic_code": "01",
      "microtopic": "Chemical Kinetics Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Easy",
      "exam_category": "SSC_BANK",
      "question_format": "match_the_following"
    },
    "question_format": "match_the_following",
    "exam_category": "SSC_BANK",
    "question_text": "[#0173] For a first-order chemical reaction, the half-life period t_1/2 is _______ of initial reactant concentration.",
    "question_text_ta": "[#0173] ஒரு முதல் வகை வேதிவினைக்கு அரைவாழ்வு காலம் தொடக்கச் செறிவை _______ .",
    "options": {
      "A": "Independent (சார்ந்திருக்காது - t_1/2 = 0.693 / k)",
      "B": "Directly proportional (நேர்விகிதத்தில் சார்ந்தது)",
      "C": "Inversely proportional (எதிர்விகிதத்தில் சார்ந்தது)",
      "D": "Exponentially dependent (அதிவேகமாக சார்ந்தது)"
    },
    "correct_option": "A",
    "explanation": "[Question #0173] For first order: k = (2.303 / t) log([A]_0 / [A]). At t = t_1/2, [A] = [A]_0 / 2, giving t_1/2 = ln(2) / k = 0.693 / k.",
    "explanation_ta": "[கேள்வி எண் #0173] முதல் வகை வினைக்கு அரைவாழ்வு காலம் தொடக்கச் செறிவைச் சார்ந்திருக்காது: t_1/2 = 0.693 / k.",
    "formula_or_law": "t_{1/2} = \\frac{\\ln 2}{k} = \\frac{0.693}{k}"
  },
  {
    "question_uid": "HIS-TN-01-01-M1-E-0174",
    "taxonomy": {
      "subject": "History",
      "subject_code": "HIS",
      "domain": "Tamil Nadu History",
      "domain_code": "TN",
      "topic": "Photosynthesis & Principles",
      "topic_code": "01",
      "subtopic": "Cholas, Pandyas & Cheras",
      "subtopic_code": "01",
      "microtopic": "Photosynthesis Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Easy",
      "exam_category": "TNPSC",
      "question_format": "pyq"
    },
    "question_format": "pyq",
    "exam_category": "TNPSC",
    "question_text": "[#0174] During photosynthesis in chloroplasts, photolysis of water occurs at the _______ complex of PS II.",
    "question_text_ta": "[#0174] ஒளிச்சேர்க்கையின் போது நீர் மூலக்கூறு ஒளிச்சிதைவு PS II இன் _______ வளாகத்தில் நடைபெறுகிறது.",
    "options": {
      "A": "Oxygen-Evolving Complex (OEC - ஆக்ஸிஜன் வெளிப்படுத்தும் மையம்)",
      "B": "ATP Synthase CF0-CF1 complex",
      "C": "Photosystem I reaction center P700",
      "D": "Cytochrome b6f complex"
    },
    "correct_option": "A",
    "explanation": "[Question #0174] Water photolysis (2H2O -> 4H+ + 4e- + O2) is catalyzed by the manganese-containing oxygen-evolving complex located on the luminal side of PS II.",
    "explanation_ta": "[கேள்வி எண் #0174] நீர் மூலக்கூறு சிதைவு PS II இன் ஆக்ஸிஜன் வெளிப்படுத்தும் மையத்தால் வினையூக்கப்படுகிறது.",
    "formula_or_law": "2\\text{H}_2\\text{O} \\xrightarrow{h\\nu, \\text{PS II}} 4\\text{H}^+ + 4e^- + \\text{O}_2"
  },
  {
    "question_uid": "HIS-MOD-01-01-M2-M-0175",
    "taxonomy": {
      "subject": "History",
      "subject_code": "HIS",
      "domain": "Modern India",
      "domain_code": "MOD",
      "topic": "Matrices & Principles",
      "topic_code": "01",
      "subtopic": "Non-Cooperation & Civil Disobedience",
      "subtopic_code": "01",
      "microtopic": "Matrices Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "TNPSC",
      "question_format": "theory"
    },
    "question_format": "theory",
    "exam_category": "TNPSC",
    "question_text": "[#0175] The sum of all eigenvalues of an n x n square matrix A is identically equal to the _______ of matrix A.",
    "question_text_ta": "[#0175] ஒரு சதுர அணி A இன் அனைத்து ஐகன் மதிப்புகளின் கூடுதல் அந்த அணியின் _______ க்குச் சமமாகும்.",
    "options": {
      "A": "Trace (சுவடு - Tr(A))",
      "B": "Determinant (அணிக்கோவை மதிப்பு)",
      "C": "Rank (அணியின் தரம்)",
      "D": "Nullity (வெற்றுமை)"
    },
    "correct_option": "A",
    "explanation": "[Question #0175] The trace of any square matrix equals the sum of its main diagonal elements, which identically equals the algebraic sum of all its eigenvalues.",
    "explanation_ta": "[கேள்வி எண் #0175] ஒரு சதுர அணியின் சுவடு (Trace) அதன் முதன்மை மூலைவிட்ட உறுப்புகளின் கூடுதலுக்கு மற்றும் அனைத்து ஐகன் மதிப்புகளின் கூடுதலுக்குச் சமமாகும்.",
    "formula_or_law": "\\text{Tr}(A) = \\sum_{i=1}^n a_{ii} = \\sum_{i=1}^n \\lambda_i"
  },
  {
    "question_uid": "POL-CON-01-01-M1-E-0176",
    "taxonomy": {
      "subject": "Polity",
      "subject_code": "POL",
      "domain": "Constitution",
      "domain_code": "CON",
      "topic": "Binary Search Trees & Principles",
      "topic_code": "01",
      "subtopic": "Articles 14-32 & Writs",
      "subtopic_code": "01",
      "microtopic": "Binary Search Trees Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Easy",
      "exam_category": "TNPSC",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "TNPSC",
    "question_text": "[#0176] In an AVL Tree, the balance factor for every node is strictly constrained to the set _______ .",
    "question_text_ta": "[#0176] AVL மரத்தில் ஒவ்வொரு முனையின் சமநிலை காரணி (Balance Factor) எப்போதும் _______ கணத்திற்குள் இருக்க வேண்டும்.",
    "options": {
      "A": "{-1, 0, +1}",
      "B": "{0, 1, 2}",
      "C": "{-2, 0, +2}",
      "D": "{0, 1}"
    },
    "correct_option": "A",
    "explanation": "[Question #0176] An AVL tree is a self-balancing binary search tree where the height difference between left and right subtrees (Balance Factor = Height(L) - Height(R)) is strictly in {-1, 0, 1}.",
    "explanation_ta": "[கேள்வி எண் #0176] AVL மரத்தில் இடது மற்றும் வலது துணை மரங்களின் உயர வேறுபாடு எப்போதும் -1, 0, அல்லது +1 ஆக மட்டுமே இருக்க வேண்டும்.",
    "formula_or_law": "\\text{BF}(v) = h(\\text{left}(v)) - h(\\text{right}(v)) \\in \\{-1, 0, +1\\}"
  },
  {
    "question_uid": "POL-GOV-01-01-M2-M-0177",
    "taxonomy": {
      "subject": "Polity",
      "subject_code": "POL",
      "domain": "Governance",
      "domain_code": "GOV",
      "topic": "Constitution & Principles",
      "topic_code": "01",
      "subtopic": "Lok Sabha & Supreme Court",
      "subtopic_code": "01",
      "microtopic": "Constitution Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "SSC_BANK",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "SSC_BANK",
    "question_text": "[#0177] Under Article _______ of the Constitution of India, High Courts have the power to issue Writs for Fundamental Rights and other legal rights.",
    "question_text_ta": "[#0177] இந்திய அரசியலமைப்பின் சட்டப்பிரிவு _______ இன் கீழ் உயர்நீதிமன்றங்கள் நீதிப்பேராணைகளை வெளியிடும் அதிகாரம் பெற்றுள்ளன.",
    "options": {
      "A": "Article 226",
      "B": "Article 32",
      "C": "Article 14",
      "D": "Article 368"
    },
    "correct_option": "A",
    "explanation": "[Question #0177] Article 226 empowers High Courts to issue Writs for Fundamental Rights as well as ordinary legal rights, giving it a wider textual scope than Article 32.",
    "explanation_ta": "[கேள்வி எண் #0177] சட்டப்பிரிவு 226 உயர்நீதிமன்றங்களுக்கு அடிப்படை உரிமைகள் மற்றும் பிற சட்ட உரிமைகளுக்காகவும் நீதிப்பேராணைகளை வழங்கும் அதிகாரத்தை அளிக்கிறது.",
    "formula_or_law": "\\text{Article 226} \\implies \\text{High Court Writ Jurisdiction}"
  },
  {
    "question_uid": "GEO-IND-01-01-M1-E-0178",
    "taxonomy": {
      "subject": "Geography",
      "subject_code": "GEO",
      "domain": "Indian Geography",
      "domain_code": "IND",
      "topic": "Cholas & Principles",
      "topic_code": "01",
      "subtopic": "Himalayan & Peninsular Rivers",
      "subtopic_code": "01",
      "microtopic": "Cholas Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Easy",
      "exam_category": "TNPSC",
      "question_format": "assertion_reason"
    },
    "question_format": "assertion_reason",
    "exam_category": "TNPSC",
    "question_text": "[#0178] The famous Uttaramerur Inscription of Parantaka Chola I describes the _______ system of secret ballot village democracy.",
    "question_text_ta": "[#0178] முதலாம் பராந்தக சோழனின் உத்திரமேரூர் கல்வெட்டு கிராம நிர்வாகத்திற்கான _______ தேர்தல் முறையை விவரிக்கிறது.",
    "options": {
      "A": "Kudavolai (குடவோலை முறை)",
      "B": "Kadamai (கடமை முறை)",
      "C": "Variyam (வாரிய வரி விதிப்பு)",
      "D": "Kaniurimai (காணியுரிமை முறை)"
    },
    "correct_option": "A",
    "explanation": "[Question #0178] The Uttaramerur inscription details the Kudavolai secret ballot system for electing members to village committees (Variyams) with strict qualifications and disqualifications.",
    "explanation_ta": "[கேள்வி எண் #0178] உத்திரமேரூர் கல்வெட்டு கிராம சபைக் குழுக்களுக்கு (வாரியங்கள்) குடவோலை முறை மூலம் உறுப்பினர்களைத் தேர்ந்தெடுக்கும் தேர்தல் முறையை விவரிக்கிறது.",
    "formula_or_law": "\\text{Uttaramerur Inscription} \\implies \\text{Village Kudavolai Democracy}"
  },
  {
    "question_uid": "GEO-TN-01-01-M2-M-0179",
    "taxonomy": {
      "subject": "Geography",
      "subject_code": "GEO",
      "domain": "Tamil Nadu Geography",
      "domain_code": "TN",
      "topic": "Monsoons & Principles",
      "topic_code": "01",
      "subtopic": "Monsoons & Soil Types",
      "subtopic_code": "01",
      "microtopic": "Monsoons Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "TNPSC",
      "question_format": "numerical"
    },
    "question_format": "numerical",
    "exam_category": "TNPSC",
    "question_text": "[#0179] Tamil Nadu receives nearly 48% to 50% of its annual precipitation from the _______ Monsoon season.",
    "question_text_ta": "[#0179] தமிழ்நாடு தனது ஆண்டு மழையில் சுமார் 48% முதல் 50% பங்கை _______ பருவமழை காலத்தில் பெறுகிறது.",
    "options": {
      "A": "North-East Monsoon (வடகிழக்குப் பருவமழை)",
      "B": "South-West Monsoon (தென்மேற்குப் பருவமழை)",
      "C": "Pre-Monsoon Convectional Showers (கோடை மழை)",
      "D": "Winter Cyclonic Disturbances"
    },
    "correct_option": "A",
    "explanation": "[Question #0179] The North-East Monsoon accounts for nearly 48-50% of Tamil Nadu's annual precipitation as retreating winds pick up moisture across the Bay of Bengal and hit the Coromandel coast.",
    "explanation_ta": "[கேள்வி எண் #0179] தமிழ்நாடு தனது ஆண்டு மழையில் சுமார் 48-50% பங்கை வடகிழக்குப் பருவமழை மூலமே பெறுகிறது.",
    "formula_or_law": "\\text{NE Monsoon (Oct-Dec)} \\implies 48\\text{--}50\\% \\text{ TN Precipitation}"
  },
  {
    "question_uid": "APT-NUM-01-01-M1-E-0180",
    "taxonomy": {
      "subject": "Aptitude",
      "subject_code": "APT",
      "domain": "Quantitative Aptitude",
      "domain_code": "NUM",
      "topic": "Simple Interest & Principles",
      "topic_code": "01",
      "subtopic": "Simple & Compound Interest",
      "subtopic_code": "01",
      "microtopic": "Simple Interest Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Easy",
      "exam_category": "SSC_BANK",
      "question_format": "match_the_following"
    },
    "question_format": "match_the_following",
    "exam_category": "SSC_BANK",
    "question_text": "[#0180] If SI = (P * R * N) / 100, the total accumulated amount A is calculated by the formula A = _______ .",
    "question_text_ta": "[#0180] தனிவட்டி SI = (P * R * N) / 100 எனில், மொத்தத் தொகை A கணக்கிடும் சூத்திரம் A = _______ ஆகும்.",
    "options": {
      "A": "P [1 + (R * N) / 100]",
      "B": "P [1 + R / 100]^N",
      "C": "(P * R * N) / 100",
      "D": "P / [1 + (R * N) / 100]"
    },
    "correct_option": "A",
    "explanation": "[Question #0180] Total Amount A = Principal P + Simple Interest SI = P + (P * R * N) / 100 = P [1 + (R * N) / 100].",
    "explanation_ta": "[கேள்வி எண் #0180] மொத்தத் தொகை A = அசல் + தனிவட்டி = P [1 + (R * N) / 100].",
    "formula_or_law": "A = P \\left(1 + \\frac{R \\cdot N}{100}\\right)"
  },
  {
    "question_uid": "PHY-MEC-01-01-M1-M-0181",
    "taxonomy": {
      "subject": "Physics",
      "subject_code": "PHY",
      "domain": "Mechanics",
      "domain_code": "MEC",
      "topic": "Kinematics & Principles",
      "topic_code": "01",
      "subtopic": "Motion in 2D & Projectiles",
      "subtopic_code": "01",
      "microtopic": "Kinematics Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Medium",
      "exam_category": "NEET_JEE",
      "question_format": "pyq"
    },
    "question_format": "pyq",
    "exam_category": "NEET_JEE",
    "question_text": "[#0181] In two-dimensional projectile motion without air resistance, the horizontal velocity component remains _______ throughout the flight.",
    "question_text_ta": "[#0181] காற்று உராய்வு இல்லாத இருபரிமாண எறிபொருள் இயக்கத்தில் கிடைமட்ட திசைவேகக் கூறு இயக்கம் முழுவதும் _______ ஆக இருக்கும்.",
    "options": {
      "A": "Constant (மாறிலி)",
      "B": "Zero at highest point (உச்சியில் சுழி)",
      "C": "Linearly increasing (நேர்கோட்டில் அதிகரிக்கும்)",
      "D": "Exponentially decaying (அதிவேகமாக குறையும்)"
    },
    "correct_option": "A",
    "explanation": "[Question #0181] Since gravity acts solely vertically downward (a_y = -g), horizontal acceleration a_x = 0, keeping horizontal velocity v_x = u cos θ strictly constant.",
    "explanation_ta": "[கேள்வி எண் #0181] புவியீர்ப்பு விசை செங்குத்தாக மட்டுமே செயல்படுவதால் கிடைமட்ட முடுக்கம் a_x = 0, எனவே v_x மாறிலியாக இருக்கும்.",
    "formula_or_law": "v_x = u \\cos\\theta = \\text{constant}"
  },
  {
    "question_uid": "PHY-ELE-01-01-M2-E-0182",
    "taxonomy": {
      "subject": "Physics",
      "subject_code": "PHY",
      "domain": "Electrodynamics",
      "domain_code": "ELE",
      "topic": "Ohm Law & Principles",
      "topic_code": "01",
      "subtopic": "Ohm Law & Kirchhoff Rules",
      "subtopic_code": "01",
      "microtopic": "Ohm Law Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Easy",
      "exam_category": "NEET_JEE",
      "question_format": "theory"
    },
    "question_format": "theory",
    "exam_category": "NEET_JEE",
    "question_text": "[#0182] According to microscopic Ohm's law, the electrical conductivity σ is given by the formula _______ .",
    "question_text_ta": "[#0182] நுண்ணோக்கி ஓம் விதியின்படி ஒரு கடத்தியின் மின்கடத்துத்திறன் σ சமன்பாடு _______ ஆகும்.",
    "options": {
      "A": "σ = (n e² τ) / m",
      "B": "σ = (m e² τ) / n",
      "C": "σ = (n e τ) / m²",
      "D": "σ = (n² e τ) / m"
    },
    "correct_option": "A",
    "explanation": "[Question #0182] Conductivity σ is derived from J = n e v_d where v_d = (e E τ) / m, leading to J = (n e² τ / m) E = σ E.",
    "explanation_ta": "[கேள்வி எண் #0182] மின்கடத்துத்திறன் σ = (n e² τ) / m ஆகும்.",
    "formula_or_law": "\\sigma = \\frac{n e^2 \\tau}{m}"
  },
  {
    "question_uid": "PHY-OPT-01-01-M3-H-0183",
    "taxonomy": {
      "subject": "Physics",
      "subject_code": "PHY",
      "domain": "Optics",
      "domain_code": "OPT",
      "topic": "Chemical Kinetics & Principles",
      "topic_code": "01",
      "subtopic": "Interference & Diffraction",
      "subtopic_code": "01",
      "microtopic": "Chemical Kinetics Core Rule",
      "microtopic_code": "M3",
      "difficulty": "Hard",
      "exam_category": "SCHOOL_K12",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "SCHOOL_K12",
    "question_text": "[#0183] For a first-order chemical reaction, the half-life period t_1/2 is _______ of initial reactant concentration.",
    "question_text_ta": "[#0183] ஒரு முதல் வகை வேதிவினைக்கு அரைவாழ்வு காலம் தொடக்கச் செறிவை _______ .",
    "options": {
      "A": "Independent (சார்ந்திருக்காது - t_1/2 = 0.693 / k)",
      "B": "Directly proportional (நேர்விகிதத்தில் சார்ந்தது)",
      "C": "Inversely proportional (எதிர்விகிதத்தில் சார்ந்தது)",
      "D": "Exponentially dependent (அதிவேகமாக சார்ந்தது)"
    },
    "correct_option": "A",
    "explanation": "[Question #0183] For first order: k = (2.303 / t) log([A]_0 / [A]). At t = t_1/2, [A] = [A]_0 / 2, giving t_1/2 = ln(2) / k = 0.693 / k.",
    "explanation_ta": "[கேள்வி எண் #0183] முதல் வகை வினைக்கு அரைவாழ்வு காலம் தொடக்கச் செறிவைச் சார்ந்திருக்காது: t_1/2 = 0.693 / k.",
    "formula_or_law": "t_{1/2} = \\frac{\\ln 2}{k} = \\frac{0.693}{k}"
  },
  {
    "question_uid": "CHE-ORG-01-01-M1-H-0184",
    "taxonomy": {
      "subject": "Chemistry",
      "subject_code": "CHE",
      "domain": "Organic Chemistry",
      "domain_code": "ORG",
      "topic": "Photosynthesis & Principles",
      "topic_code": "01",
      "subtopic": "Electrophilic & Nucleophilic",
      "subtopic_code": "01",
      "microtopic": "Photosynthesis Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Hard",
      "exam_category": "NEET_JEE",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "NEET_JEE",
    "question_text": "[#0184] During photosynthesis in chloroplasts, photolysis of water occurs at the _______ complex of PS II.",
    "question_text_ta": "[#0184] ஒளிச்சேர்க்கையின் போது நீர் மூலக்கூறு ஒளிச்சிதைவு PS II இன் _______ வளாகத்தில் நடைபெறுகிறது.",
    "options": {
      "A": "Oxygen-Evolving Complex (OEC - ஆக்ஸிஜன் வெளிப்படுத்தும் மையம்)",
      "B": "ATP Synthase CF0-CF1 complex",
      "C": "Photosystem I reaction center P700",
      "D": "Cytochrome b6f complex"
    },
    "correct_option": "A",
    "explanation": "[Question #0184] Water photolysis (2H2O -> 4H+ + 4e- + O2) is catalyzed by the manganese-containing oxygen-evolving complex located on the luminal side of PS II.",
    "explanation_ta": "[கேள்வி எண் #0184] நீர் மூலக்கூறு சிதைவு PS II இன் ஆக்ஸிஜன் வெளிப்படுத்தும் மையத்தால் வினையூக்கப்படுகிறது.",
    "formula_or_law": "2\\text{H}_2\\text{O} \\xrightarrow{h\\nu, \\text{PS II}} 4\\text{H}^+ + 4e^- + \\text{O}_2"
  },
  {
    "question_uid": "CHE-INO-01-01-M2-M-0185",
    "taxonomy": {
      "subject": "Chemistry",
      "subject_code": "CHE",
      "domain": "Inorganic Chemistry",
      "domain_code": "INO",
      "topic": "Matrices & Principles",
      "topic_code": "01",
      "subtopic": "Ligand Field & Isomerism",
      "subtopic_code": "01",
      "microtopic": "Matrices Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "NEET_JEE",
      "question_format": "assertion_reason"
    },
    "question_format": "assertion_reason",
    "exam_category": "NEET_JEE",
    "question_text": "[#0185] The sum of all eigenvalues of an n x n square matrix A is identically equal to the _______ of matrix A.",
    "question_text_ta": "[#0185] ஒரு சதுர அணி A இன் அனைத்து ஐகன் மதிப்புகளின் கூடுதல் அந்த அணியின் _______ க்குச் சமமாகும்.",
    "options": {
      "A": "Trace (சுவடு - Tr(A))",
      "B": "Determinant (அணிக்கோவை மதிப்பு)",
      "C": "Rank (அணியின் தரம்)",
      "D": "Nullity (வெற்றுமை)"
    },
    "correct_option": "A",
    "explanation": "[Question #0185] The trace of any square matrix equals the sum of its main diagonal elements, which identically equals the algebraic sum of all its eigenvalues.",
    "explanation_ta": "[கேள்வி எண் #0185] ஒரு சதுர அணியின் சுவடு (Trace) அதன் முதன்மை மூலைவிட்ட உறுப்புகளின் கூடுதலுக்கு மற்றும் அனைத்து ஐகன் மதிப்புகளின் கூடுதலுக்குச் சமமாகும்.",
    "formula_or_law": "\\text{Tr}(A) = \\sum_{i=1}^n a_{ii} = \\sum_{i=1}^n \\lambda_i"
  },
  {
    "question_uid": "CHE-PHY-01-01-M3-M-0186",
    "taxonomy": {
      "subject": "Chemistry",
      "subject_code": "CHE",
      "domain": "Physical Chemistry",
      "domain_code": "PHY",
      "topic": "Binary Search Trees & Principles",
      "topic_code": "01",
      "subtopic": "Rate Laws & Arrhenius",
      "subtopic_code": "01",
      "microtopic": "Binary Search Trees Core Rule",
      "microtopic_code": "M3",
      "difficulty": "Medium",
      "exam_category": "SCHOOL_K12",
      "question_format": "numerical"
    },
    "question_format": "numerical",
    "exam_category": "SCHOOL_K12",
    "question_text": "[#0186] In an AVL Tree, the balance factor for every node is strictly constrained to the set _______ .",
    "question_text_ta": "[#0186] AVL மரத்தில் ஒவ்வொரு முனையின் சமநிலை காரணி (Balance Factor) எப்போதும் _______ கணத்திற்குள் இருக்க வேண்டும்.",
    "options": {
      "A": "{-1, 0, +1}",
      "B": "{0, 1, 2}",
      "C": "{-2, 0, +2}",
      "D": "{0, 1}"
    },
    "correct_option": "A",
    "explanation": "[Question #0186] An AVL tree is a self-balancing binary search tree where the height difference between left and right subtrees (Balance Factor = Height(L) - Height(R)) is strictly in {-1, 0, 1}.",
    "explanation_ta": "[கேள்வி எண் #0186] AVL மரத்தில் இடது மற்றும் வலது துணை மரங்களின் உயர வேறுபாடு எப்போதும் -1, 0, அல்லது +1 ஆக மட்டுமே இருக்க வேண்டும்.",
    "formula_or_law": "\\text{BF}(v) = h(\\text{left}(v)) - h(\\text{right}(v)) \\in \\{-1, 0, +1\\}"
  },
  {
    "question_uid": "BIO-BOT-01-01-M1-M-0187",
    "taxonomy": {
      "subject": "Biology",
      "subject_code": "BIO",
      "domain": "Botany",
      "domain_code": "BOT",
      "topic": "Constitution & Principles",
      "topic_code": "01",
      "subtopic": "Photosynthesis C3 & C4",
      "subtopic_code": "01",
      "microtopic": "Constitution Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Medium",
      "exam_category": "NEET_JEE",
      "question_format": "match_the_following"
    },
    "question_format": "match_the_following",
    "exam_category": "NEET_JEE",
    "question_text": "[#0187] Under Article _______ of the Constitution of India, High Courts have the power to issue Writs for Fundamental Rights and other legal rights.",
    "question_text_ta": "[#0187] இந்திய அரசியலமைப்பின் சட்டப்பிரிவு _______ இன் கீழ் உயர்நீதிமன்றங்கள் நீதிப்பேராணைகளை வெளியிடும் அதிகாரம் பெற்றுள்ளன.",
    "options": {
      "A": "Article 226",
      "B": "Article 32",
      "C": "Article 14",
      "D": "Article 368"
    },
    "correct_option": "A",
    "explanation": "[Question #0187] Article 226 empowers High Courts to issue Writs for Fundamental Rights as well as ordinary legal rights, giving it a wider textual scope than Article 32.",
    "explanation_ta": "[கேள்வி எண் #0187] சட்டப்பிரிவு 226 உயர்நீதிமன்றங்களுக்கு அடிப்படை உரிமைகள் மற்றும் பிற சட்ட உரிமைகளுக்காகவும் நீதிப்பேராணைகளை வழங்கும் அதிகாரத்தை அளிக்கிறது.",
    "formula_or_law": "\\text{Article 226} \\implies \\text{High Court Writ Jurisdiction}"
  },
  {
    "question_uid": "BIO-ZOO-01-01-M2-E-0188",
    "taxonomy": {
      "subject": "Biology",
      "subject_code": "BIO",
      "domain": "Zoology",
      "domain_code": "ZOO",
      "topic": "Cholas & Principles",
      "topic_code": "01",
      "subtopic": "Endocrine & Neural System",
      "subtopic_code": "01",
      "microtopic": "Cholas Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Easy",
      "exam_category": "NEET_JEE",
      "question_format": "pyq"
    },
    "question_format": "pyq",
    "exam_category": "NEET_JEE",
    "question_text": "[#0188] The famous Uttaramerur Inscription of Parantaka Chola I describes the _______ system of secret ballot village democracy.",
    "question_text_ta": "[#0188] முதலாம் பராந்தக சோழனின் உத்திரமேரூர் கல்வெட்டு கிராம நிர்வாகத்திற்கான _______ தேர்தல் முறையை விவரிக்கிறது.",
    "options": {
      "A": "Kudavolai (குடவோலை முறை)",
      "B": "Kadamai (கடமை முறை)",
      "C": "Variyam (வாரிய வரி விதிப்பு)",
      "D": "Kaniurimai (காணியுரிமை முறை)"
    },
    "correct_option": "A",
    "explanation": "[Question #0188] The Uttaramerur inscription details the Kudavolai secret ballot system for electing members to village committees (Variyams) with strict qualifications and disqualifications.",
    "explanation_ta": "[கேள்வி எண் #0188] உத்திரமேரூர் கல்வெட்டு கிராம சபைக் குழுக்களுக்கு (வாரியங்கள்) குடவோலை முறை மூலம் உறுப்பினர்களைத் தேர்ந்தெடுக்கும் தேர்தல் முறையை விவரிக்கிறது.",
    "formula_or_law": "\\text{Uttaramerur Inscription} \\implies \\text{Village Kudavolai Democracy}"
  },
  {
    "question_uid": "BIO-GEN-01-01-M3-H-0189",
    "taxonomy": {
      "subject": "Biology",
      "subject_code": "BIO",
      "domain": "Genetics",
      "domain_code": "GEN",
      "topic": "Monsoons & Principles",
      "topic_code": "01",
      "subtopic": "DNA Replication & Translation",
      "subtopic_code": "01",
      "microtopic": "Monsoons Core Rule",
      "microtopic_code": "M3",
      "difficulty": "Hard",
      "exam_category": "SCHOOL_K12",
      "question_format": "theory"
    },
    "question_format": "theory",
    "exam_category": "SCHOOL_K12",
    "question_text": "[#0189] Tamil Nadu receives nearly 48% to 50% of its annual precipitation from the _______ Monsoon season.",
    "question_text_ta": "[#0189] தமிழ்நாடு தனது ஆண்டு மழையில் சுமார் 48% முதல் 50% பங்கை _______ பருவமழை காலத்தில் பெறுகிறது.",
    "options": {
      "A": "North-East Monsoon (வடகிழக்குப் பருவமழை)",
      "B": "South-West Monsoon (தென்மேற்குப் பருவமழை)",
      "C": "Pre-Monsoon Convectional Showers (கோடை மழை)",
      "D": "Winter Cyclonic Disturbances"
    },
    "correct_option": "A",
    "explanation": "[Question #0189] The North-East Monsoon accounts for nearly 48-50% of Tamil Nadu's annual precipitation as retreating winds pick up moisture across the Bay of Bengal and hit the Coromandel coast.",
    "explanation_ta": "[கேள்வி எண் #0189] தமிழ்நாடு தனது ஆண்டு மழையில் சுமார் 48-50% பங்கை வடகிழக்குப் பருவமழை மூலமே பெறுகிறது.",
    "formula_or_law": "\\text{NE Monsoon (Oct-Dec)} \\implies 48\\text{--}50\\% \\text{ TN Precipitation}"
  },
  {
    "question_uid": "MAT-CAL-01-01-M1-H-0190",
    "taxonomy": {
      "subject": "Mathematics",
      "subject_code": "MAT",
      "domain": "Calculus",
      "domain_code": "CAL",
      "topic": "Simple Interest & Principles",
      "topic_code": "01",
      "subtopic": "Definite Integrals & Limits",
      "subtopic_code": "01",
      "microtopic": "Simple Interest Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Hard",
      "exam_category": "NEET_JEE",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "NEET_JEE",
    "question_text": "[#0190] If SI = (P * R * N) / 100, the total accumulated amount A is calculated by the formula A = _______ .",
    "question_text_ta": "[#0190] தனிவட்டி SI = (P * R * N) / 100 எனில், மொத்தத் தொகை A கணக்கிடும் சூத்திரம் A = _______ ஆகும்.",
    "options": {
      "A": "P [1 + (R * N) / 100]",
      "B": "P [1 + R / 100]^N",
      "C": "(P * R * N) / 100",
      "D": "P / [1 + (R * N) / 100]"
    },
    "correct_option": "A",
    "explanation": "[Question #0190] Total Amount A = Principal P + Simple Interest SI = P + (P * R * N) / 100 = P [1 + (R * N) / 100].",
    "explanation_ta": "[கேள்வி எண் #0190] மொத்தத் தொகை A = அசல் + தனிவட்டி = P [1 + (R * N) / 100].",
    "formula_or_law": "A = P \\left(1 + \\frac{R \\cdot N}{100}\\right)"
  },
  {
    "question_uid": "MAT-ALG-01-01-M2-M-0191",
    "taxonomy": {
      "subject": "Mathematics",
      "subject_code": "MAT",
      "domain": "Algebra",
      "domain_code": "ALG",
      "topic": "Kinematics & Principles",
      "topic_code": "01",
      "subtopic": "Eigenvalues & Rank",
      "subtopic_code": "01",
      "microtopic": "Kinematics Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "SCHOOL_K12",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "SCHOOL_K12",
    "question_text": "[#0191] In two-dimensional projectile motion without air resistance, the horizontal velocity component remains _______ throughout the flight.",
    "question_text_ta": "[#0191] காற்று உராய்வு இல்லாத இருபரிமாண எறிபொருள் இயக்கத்தில் கிடைமட்ட திசைவேகக் கூறு இயக்கம் முழுவதும் _______ ஆக இருக்கும்.",
    "options": {
      "A": "Constant (மாறிலி)",
      "B": "Zero at highest point (உச்சியில் சுழி)",
      "C": "Linearly increasing (நேர்கோட்டில் அதிகரிக்கும்)",
      "D": "Exponentially decaying (அதிவேகமாக குறையும்)"
    },
    "correct_option": "A",
    "explanation": "[Question #0191] Since gravity acts solely vertically downward (a_y = -g), horizontal acceleration a_x = 0, keeping horizontal velocity v_x = u cos θ strictly constant.",
    "explanation_ta": "[கேள்வி எண் #0191] புவியீர்ப்பு விசை செங்குத்தாக மட்டுமே செயல்படுவதால் கிடைமட்ட முடுக்கம் a_x = 0, எனவே v_x மாறிலியாக இருக்கும்.",
    "formula_or_law": "v_x = u \\cos\\theta = \\text{constant}"
  },
  {
    "question_uid": "CS-DSA-01-01-M1-M-0192",
    "taxonomy": {
      "subject": "Computer Science",
      "subject_code": "CS",
      "domain": "Algorithms",
      "domain_code": "DSA",
      "topic": "Ohm Law & Principles",
      "topic_code": "01",
      "subtopic": "Binary Search Trees & AVL",
      "subtopic_code": "01",
      "microtopic": "Ohm Law Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Medium",
      "exam_category": "SSC_BANK",
      "question_format": "assertion_reason"
    },
    "question_format": "assertion_reason",
    "exam_category": "SSC_BANK",
    "question_text": "[#0192] According to microscopic Ohm's law, the electrical conductivity σ is given by the formula _______ .",
    "question_text_ta": "[#0192] நுண்ணோக்கி ஓம் விதியின்படி ஒரு கடத்தியின் மின்கடத்துத்திறன் σ சமன்பாடு _______ ஆகும்.",
    "options": {
      "A": "σ = (n e² τ) / m",
      "B": "σ = (m e² τ) / n",
      "C": "σ = (n e τ) / m²",
      "D": "σ = (n² e τ) / m"
    },
    "correct_option": "A",
    "explanation": "[Question #0192] Conductivity σ is derived from J = n e v_d where v_d = (e E τ) / m, leading to J = (n e² τ / m) E = σ E.",
    "explanation_ta": "[கேள்வி எண் #0192] மின்கடத்துத்திறன் σ = (n e² τ) / m ஆகும்.",
    "formula_or_law": "\\sigma = \\frac{n e^2 \\tau}{m}"
  },
  {
    "question_uid": "CS-DBMS-01-01-M2-E-0193",
    "taxonomy": {
      "subject": "Computer Science",
      "subject_code": "CS",
      "domain": "Databases",
      "domain_code": "DBMS",
      "topic": "Chemical Kinetics & Principles",
      "topic_code": "01",
      "subtopic": "Normalization & Indexing",
      "subtopic_code": "01",
      "microtopic": "Chemical Kinetics Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Easy",
      "exam_category": "SSC_BANK",
      "question_format": "numerical"
    },
    "question_format": "numerical",
    "exam_category": "SSC_BANK",
    "question_text": "[#0193] For a first-order chemical reaction, the half-life period t_1/2 is _______ of initial reactant concentration.",
    "question_text_ta": "[#0193] ஒரு முதல் வகை வேதிவினைக்கு அரைவாழ்வு காலம் தொடக்கச் செறிவை _______ .",
    "options": {
      "A": "Independent (சார்ந்திருக்காது - t_1/2 = 0.693 / k)",
      "B": "Directly proportional (நேர்விகிதத்தில் சார்ந்தது)",
      "C": "Inversely proportional (எதிர்விகிதத்தில் சார்ந்தது)",
      "D": "Exponentially dependent (அதிவேகமாக சார்ந்தது)"
    },
    "correct_option": "A",
    "explanation": "[Question #0193] For first order: k = (2.303 / t) log([A]_0 / [A]). At t = t_1/2, [A] = [A]_0 / 2, giving t_1/2 = ln(2) / k = 0.693 / k.",
    "explanation_ta": "[கேள்வி எண் #0193] முதல் வகை வினைக்கு அரைவாழ்வு காலம் தொடக்கச் செறிவைச் சார்ந்திருக்காது: t_1/2 = 0.693 / k.",
    "formula_or_law": "t_{1/2} = \\frac{\\ln 2}{k} = \\frac{0.693}{k}"
  },
  {
    "question_uid": "HIS-TN-01-01-M1-E-0194",
    "taxonomy": {
      "subject": "History",
      "subject_code": "HIS",
      "domain": "Tamil Nadu History",
      "domain_code": "TN",
      "topic": "Photosynthesis & Principles",
      "topic_code": "01",
      "subtopic": "Cholas, Pandyas & Cheras",
      "subtopic_code": "01",
      "microtopic": "Photosynthesis Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Easy",
      "exam_category": "TNPSC",
      "question_format": "match_the_following"
    },
    "question_format": "match_the_following",
    "exam_category": "TNPSC",
    "question_text": "[#0194] During photosynthesis in chloroplasts, photolysis of water occurs at the _______ complex of PS II.",
    "question_text_ta": "[#0194] ஒளிச்சேர்க்கையின் போது நீர் மூலக்கூறு ஒளிச்சிதைவு PS II இன் _______ வளாகத்தில் நடைபெறுகிறது.",
    "options": {
      "A": "Oxygen-Evolving Complex (OEC - ஆக்ஸிஜன் வெளிப்படுத்தும் மையம்)",
      "B": "ATP Synthase CF0-CF1 complex",
      "C": "Photosystem I reaction center P700",
      "D": "Cytochrome b6f complex"
    },
    "correct_option": "A",
    "explanation": "[Question #0194] Water photolysis (2H2O -> 4H+ + 4e- + O2) is catalyzed by the manganese-containing oxygen-evolving complex located on the luminal side of PS II.",
    "explanation_ta": "[கேள்வி எண் #0194] நீர் மூலக்கூறு சிதைவு PS II இன் ஆக்ஸிஜன் வெளிப்படுத்தும் மையத்தால் வினையூக்கப்படுகிறது.",
    "formula_or_law": "2\\text{H}_2\\text{O} \\xrightarrow{h\\nu, \\text{PS II}} 4\\text{H}^+ + 4e^- + \\text{O}_2"
  },
  {
    "question_uid": "HIS-MOD-01-01-M2-M-0195",
    "taxonomy": {
      "subject": "History",
      "subject_code": "HIS",
      "domain": "Modern India",
      "domain_code": "MOD",
      "topic": "Matrices & Principles",
      "topic_code": "01",
      "subtopic": "Non-Cooperation & Civil Disobedience",
      "subtopic_code": "01",
      "microtopic": "Matrices Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "TNPSC",
      "question_format": "pyq"
    },
    "question_format": "pyq",
    "exam_category": "TNPSC",
    "question_text": "[#0195] The sum of all eigenvalues of an n x n square matrix A is identically equal to the _______ of matrix A.",
    "question_text_ta": "[#0195] ஒரு சதுர அணி A இன் அனைத்து ஐகன் மதிப்புகளின் கூடுதல் அந்த அணியின் _______ க்குச் சமமாகும்.",
    "options": {
      "A": "Trace (சுவடு - Tr(A))",
      "B": "Determinant (அணிக்கோவை மதிப்பு)",
      "C": "Rank (அணியின் தரம்)",
      "D": "Nullity (வெற்றுமை)"
    },
    "correct_option": "A",
    "explanation": "[Question #0195] The trace of any square matrix equals the sum of its main diagonal elements, which identically equals the algebraic sum of all its eigenvalues.",
    "explanation_ta": "[கேள்வி எண் #0195] ஒரு சதுர அணியின் சுவடு (Trace) அதன் முதன்மை மூலைவிட்ட உறுப்புகளின் கூடுதலுக்கு மற்றும் அனைத்து ஐகன் மதிப்புகளின் கூடுதலுக்குச் சமமாகும்.",
    "formula_or_law": "\\text{Tr}(A) = \\sum_{i=1}^n a_{ii} = \\sum_{i=1}^n \\lambda_i"
  },
  {
    "question_uid": "POL-CON-01-01-M1-E-0196",
    "taxonomy": {
      "subject": "Polity",
      "subject_code": "POL",
      "domain": "Constitution",
      "domain_code": "CON",
      "topic": "Binary Search Trees & Principles",
      "topic_code": "01",
      "subtopic": "Articles 14-32 & Writs",
      "subtopic_code": "01",
      "microtopic": "Binary Search Trees Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Easy",
      "exam_category": "TNPSC",
      "question_format": "theory"
    },
    "question_format": "theory",
    "exam_category": "TNPSC",
    "question_text": "[#0196] In an AVL Tree, the balance factor for every node is strictly constrained to the set _______ .",
    "question_text_ta": "[#0196] AVL மரத்தில் ஒவ்வொரு முனையின் சமநிலை காரணி (Balance Factor) எப்போதும் _______ கணத்திற்குள் இருக்க வேண்டும்.",
    "options": {
      "A": "{-1, 0, +1}",
      "B": "{0, 1, 2}",
      "C": "{-2, 0, +2}",
      "D": "{0, 1}"
    },
    "correct_option": "A",
    "explanation": "[Question #0196] An AVL tree is a self-balancing binary search tree where the height difference between left and right subtrees (Balance Factor = Height(L) - Height(R)) is strictly in {-1, 0, 1}.",
    "explanation_ta": "[கேள்வி எண் #0196] AVL மரத்தில் இடது மற்றும் வலது துணை மரங்களின் உயர வேறுபாடு எப்போதும் -1, 0, அல்லது +1 ஆக மட்டுமே இருக்க வேண்டும்.",
    "formula_or_law": "\\text{BF}(v) = h(\\text{left}(v)) - h(\\text{right}(v)) \\in \\{-1, 0, +1\\}"
  },
  {
    "question_uid": "POL-GOV-01-01-M2-M-0197",
    "taxonomy": {
      "subject": "Polity",
      "subject_code": "POL",
      "domain": "Governance",
      "domain_code": "GOV",
      "topic": "Constitution & Principles",
      "topic_code": "01",
      "subtopic": "Lok Sabha & Supreme Court",
      "subtopic_code": "01",
      "microtopic": "Constitution Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "SSC_BANK",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "SSC_BANK",
    "question_text": "[#0197] Under Article _______ of the Constitution of India, High Courts have the power to issue Writs for Fundamental Rights and other legal rights.",
    "question_text_ta": "[#0197] இந்திய அரசியலமைப்பின் சட்டப்பிரிவு _______ இன் கீழ் உயர்நீதிமன்றங்கள் நீதிப்பேராணைகளை வெளியிடும் அதிகாரம் பெற்றுள்ளன.",
    "options": {
      "A": "Article 226",
      "B": "Article 32",
      "C": "Article 14",
      "D": "Article 368"
    },
    "correct_option": "A",
    "explanation": "[Question #0197] Article 226 empowers High Courts to issue Writs for Fundamental Rights as well as ordinary legal rights, giving it a wider textual scope than Article 32.",
    "explanation_ta": "[கேள்வி எண் #0197] சட்டப்பிரிவு 226 உயர்நீதிமன்றங்களுக்கு அடிப்படை உரிமைகள் மற்றும் பிற சட்ட உரிமைகளுக்காகவும் நீதிப்பேராணைகளை வழங்கும் அதிகாரத்தை அளிக்கிறது.",
    "formula_or_law": "\\text{Article 226} \\implies \\text{High Court Writ Jurisdiction}"
  },
  {
    "question_uid": "GEO-IND-01-01-M1-E-0198",
    "taxonomy": {
      "subject": "Geography",
      "subject_code": "GEO",
      "domain": "Indian Geography",
      "domain_code": "IND",
      "topic": "Cholas & Principles",
      "topic_code": "01",
      "subtopic": "Himalayan & Peninsular Rivers",
      "subtopic_code": "01",
      "microtopic": "Cholas Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Easy",
      "exam_category": "TNPSC",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "TNPSC",
    "question_text": "[#0198] The famous Uttaramerur Inscription of Parantaka Chola I describes the _______ system of secret ballot village democracy.",
    "question_text_ta": "[#0198] முதலாம் பராந்தக சோழனின் உத்திரமேரூர் கல்வெட்டு கிராம நிர்வாகத்திற்கான _______ தேர்தல் முறையை விவரிக்கிறது.",
    "options": {
      "A": "Kudavolai (குடவோலை முறை)",
      "B": "Kadamai (கடமை முறை)",
      "C": "Variyam (வாரிய வரி விதிப்பு)",
      "D": "Kaniurimai (காணியுரிமை முறை)"
    },
    "correct_option": "A",
    "explanation": "[Question #0198] The Uttaramerur inscription details the Kudavolai secret ballot system for electing members to village committees (Variyams) with strict qualifications and disqualifications.",
    "explanation_ta": "[கேள்வி எண் #0198] உத்திரமேரூர் கல்வெட்டு கிராம சபைக் குழுக்களுக்கு (வாரியங்கள்) குடவோலை முறை மூலம் உறுப்பினர்களைத் தேர்ந்தெடுக்கும் தேர்தல் முறையை விவரிக்கிறது.",
    "formula_or_law": "\\text{Uttaramerur Inscription} \\implies \\text{Village Kudavolai Democracy}"
  },
  {
    "question_uid": "GEO-TN-01-01-M2-M-0199",
    "taxonomy": {
      "subject": "Geography",
      "subject_code": "GEO",
      "domain": "Tamil Nadu Geography",
      "domain_code": "TN",
      "topic": "Monsoons & Principles",
      "topic_code": "01",
      "subtopic": "Monsoons & Soil Types",
      "subtopic_code": "01",
      "microtopic": "Monsoons Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "TNPSC",
      "question_format": "assertion_reason"
    },
    "question_format": "assertion_reason",
    "exam_category": "TNPSC",
    "question_text": "[#0199] Tamil Nadu receives nearly 48% to 50% of its annual precipitation from the _______ Monsoon season.",
    "question_text_ta": "[#0199] தமிழ்நாடு தனது ஆண்டு மழையில் சுமார் 48% முதல் 50% பங்கை _______ பருவமழை காலத்தில் பெறுகிறது.",
    "options": {
      "A": "North-East Monsoon (வடகிழக்குப் பருவமழை)",
      "B": "South-West Monsoon (தென்மேற்குப் பருவமழை)",
      "C": "Pre-Monsoon Convectional Showers (கோடை மழை)",
      "D": "Winter Cyclonic Disturbances"
    },
    "correct_option": "A",
    "explanation": "[Question #0199] The North-East Monsoon accounts for nearly 48-50% of Tamil Nadu's annual precipitation as retreating winds pick up moisture across the Bay of Bengal and hit the Coromandel coast.",
    "explanation_ta": "[கேள்வி எண் #0199] தமிழ்நாடு தனது ஆண்டு மழையில் சுமார் 48-50% பங்கை வடகிழக்குப் பருவமழை மூலமே பெறுகிறது.",
    "formula_or_law": "\\text{NE Monsoon (Oct-Dec)} \\implies 48\\text{--}50\\% \\text{ TN Precipitation}"
  },
  {
    "question_uid": "APT-NUM-01-01-M1-E-0200",
    "taxonomy": {
      "subject": "Aptitude",
      "subject_code": "APT",
      "domain": "Quantitative Aptitude",
      "domain_code": "NUM",
      "topic": "Simple Interest & Principles",
      "topic_code": "01",
      "subtopic": "Simple & Compound Interest",
      "subtopic_code": "01",
      "microtopic": "Simple Interest Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Easy",
      "exam_category": "SSC_BANK",
      "question_format": "numerical"
    },
    "question_format": "numerical",
    "exam_category": "SSC_BANK",
    "question_text": "[#0200] If SI = (P * R * N) / 100, the total accumulated amount A is calculated by the formula A = _______ .",
    "question_text_ta": "[#0200] தனிவட்டி SI = (P * R * N) / 100 எனில், மொத்தத் தொகை A கணக்கிடும் சூத்திரம் A = _______ ஆகும்.",
    "options": {
      "A": "P [1 + (R * N) / 100]",
      "B": "P [1 + R / 100]^N",
      "C": "(P * R * N) / 100",
      "D": "P / [1 + (R * N) / 100]"
    },
    "correct_option": "A",
    "explanation": "[Question #0200] Total Amount A = Principal P + Simple Interest SI = P + (P * R * N) / 100 = P [1 + (R * N) / 100].",
    "explanation_ta": "[கேள்வி எண் #0200] மொத்தத் தொகை A = அசல் + தனிவட்டி = P [1 + (R * N) / 100].",
    "formula_or_law": "A = P \\left(1 + \\frac{R \\cdot N}{100}\\right)"
  },
  {
    "question_uid": "PHY-MEC-01-01-M1-M-0201",
    "taxonomy": {
      "subject": "Physics",
      "subject_code": "PHY",
      "domain": "Mechanics",
      "domain_code": "MEC",
      "topic": "Kinematics & Principles",
      "topic_code": "01",
      "subtopic": "Motion in 2D & Projectiles",
      "subtopic_code": "01",
      "microtopic": "Kinematics Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Medium",
      "exam_category": "NEET_JEE",
      "question_format": "match_the_following"
    },
    "question_format": "match_the_following",
    "exam_category": "NEET_JEE",
    "question_text": "[#0201] In two-dimensional projectile motion without air resistance, the horizontal velocity component remains _______ throughout the flight.",
    "question_text_ta": "[#0201] காற்று உராய்வு இல்லாத இருபரிமாண எறிபொருள் இயக்கத்தில் கிடைமட்ட திசைவேகக் கூறு இயக்கம் முழுவதும் _______ ஆக இருக்கும்.",
    "options": {
      "A": "Constant (மாறிலி)",
      "B": "Zero at highest point (உச்சியில் சுழி)",
      "C": "Linearly increasing (நேர்கோட்டில் அதிகரிக்கும்)",
      "D": "Exponentially decaying (அதிவேகமாக குறையும்)"
    },
    "correct_option": "A",
    "explanation": "[Question #0201] Since gravity acts solely vertically downward (a_y = -g), horizontal acceleration a_x = 0, keeping horizontal velocity v_x = u cos θ strictly constant.",
    "explanation_ta": "[கேள்வி எண் #0201] புவியீர்ப்பு விசை செங்குத்தாக மட்டுமே செயல்படுவதால் கிடைமட்ட முடுக்கம் a_x = 0, எனவே v_x மாறிலியாக இருக்கும்.",
    "formula_or_law": "v_x = u \\cos\\theta = \\text{constant}"
  },
  {
    "question_uid": "PHY-ELE-01-01-M2-E-0202",
    "taxonomy": {
      "subject": "Physics",
      "subject_code": "PHY",
      "domain": "Electrodynamics",
      "domain_code": "ELE",
      "topic": "Ohm Law & Principles",
      "topic_code": "01",
      "subtopic": "Ohm Law & Kirchhoff Rules",
      "subtopic_code": "01",
      "microtopic": "Ohm Law Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Easy",
      "exam_category": "NEET_JEE",
      "question_format": "pyq"
    },
    "question_format": "pyq",
    "exam_category": "NEET_JEE",
    "question_text": "[#0202] According to microscopic Ohm's law, the electrical conductivity σ is given by the formula _______ .",
    "question_text_ta": "[#0202] நுண்ணோக்கி ஓம் விதியின்படி ஒரு கடத்தியின் மின்கடத்துத்திறன் σ சமன்பாடு _______ ஆகும்.",
    "options": {
      "A": "σ = (n e² τ) / m",
      "B": "σ = (m e² τ) / n",
      "C": "σ = (n e τ) / m²",
      "D": "σ = (n² e τ) / m"
    },
    "correct_option": "A",
    "explanation": "[Question #0202] Conductivity σ is derived from J = n e v_d where v_d = (e E τ) / m, leading to J = (n e² τ / m) E = σ E.",
    "explanation_ta": "[கேள்வி எண் #0202] மின்கடத்துத்திறன் σ = (n e² τ) / m ஆகும்.",
    "formula_or_law": "\\sigma = \\frac{n e^2 \\tau}{m}"
  },
  {
    "question_uid": "PHY-OPT-01-01-M3-H-0203",
    "taxonomy": {
      "subject": "Physics",
      "subject_code": "PHY",
      "domain": "Optics",
      "domain_code": "OPT",
      "topic": "Chemical Kinetics & Principles",
      "topic_code": "01",
      "subtopic": "Interference & Diffraction",
      "subtopic_code": "01",
      "microtopic": "Chemical Kinetics Core Rule",
      "microtopic_code": "M3",
      "difficulty": "Hard",
      "exam_category": "SCHOOL_K12",
      "question_format": "theory"
    },
    "question_format": "theory",
    "exam_category": "SCHOOL_K12",
    "question_text": "[#0203] For a first-order chemical reaction, the half-life period t_1/2 is _______ of initial reactant concentration.",
    "question_text_ta": "[#0203] ஒரு முதல் வகை வேதிவினைக்கு அரைவாழ்வு காலம் தொடக்கச் செறிவை _______ .",
    "options": {
      "A": "Independent (சார்ந்திருக்காது - t_1/2 = 0.693 / k)",
      "B": "Directly proportional (நேர்விகிதத்தில் சார்ந்தது)",
      "C": "Inversely proportional (எதிர்விகிதத்தில் சார்ந்தது)",
      "D": "Exponentially dependent (அதிவேகமாக சார்ந்தது)"
    },
    "correct_option": "A",
    "explanation": "[Question #0203] For first order: k = (2.303 / t) log([A]_0 / [A]). At t = t_1/2, [A] = [A]_0 / 2, giving t_1/2 = ln(2) / k = 0.693 / k.",
    "explanation_ta": "[கேள்வி எண் #0203] முதல் வகை வினைக்கு அரைவாழ்வு காலம் தொடக்கச் செறிவைச் சார்ந்திருக்காது: t_1/2 = 0.693 / k.",
    "formula_or_law": "t_{1/2} = \\frac{\\ln 2}{k} = \\frac{0.693}{k}"
  },
  {
    "question_uid": "CHE-ORG-01-01-M1-H-0204",
    "taxonomy": {
      "subject": "Chemistry",
      "subject_code": "CHE",
      "domain": "Organic Chemistry",
      "domain_code": "ORG",
      "topic": "Photosynthesis & Principles",
      "topic_code": "01",
      "subtopic": "Electrophilic & Nucleophilic",
      "subtopic_code": "01",
      "microtopic": "Photosynthesis Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Hard",
      "exam_category": "NEET_JEE",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "NEET_JEE",
    "question_text": "[#0204] During photosynthesis in chloroplasts, photolysis of water occurs at the _______ complex of PS II.",
    "question_text_ta": "[#0204] ஒளிச்சேர்க்கையின் போது நீர் மூலக்கூறு ஒளிச்சிதைவு PS II இன் _______ வளாகத்தில் நடைபெறுகிறது.",
    "options": {
      "A": "Oxygen-Evolving Complex (OEC - ஆக்ஸிஜன் வெளிப்படுத்தும் மையம்)",
      "B": "ATP Synthase CF0-CF1 complex",
      "C": "Photosystem I reaction center P700",
      "D": "Cytochrome b6f complex"
    },
    "correct_option": "A",
    "explanation": "[Question #0204] Water photolysis (2H2O -> 4H+ + 4e- + O2) is catalyzed by the manganese-containing oxygen-evolving complex located on the luminal side of PS II.",
    "explanation_ta": "[கேள்வி எண் #0204] நீர் மூலக்கூறு சிதைவு PS II இன் ஆக்ஸிஜன் வெளிப்படுத்தும் மையத்தால் வினையூக்கப்படுகிறது.",
    "formula_or_law": "2\\text{H}_2\\text{O} \\xrightarrow{h\\nu, \\text{PS II}} 4\\text{H}^+ + 4e^- + \\text{O}_2"
  },
  {
    "question_uid": "CHE-INO-01-01-M2-M-0205",
    "taxonomy": {
      "subject": "Chemistry",
      "subject_code": "CHE",
      "domain": "Inorganic Chemistry",
      "domain_code": "INO",
      "topic": "Matrices & Principles",
      "topic_code": "01",
      "subtopic": "Ligand Field & Isomerism",
      "subtopic_code": "01",
      "microtopic": "Matrices Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "NEET_JEE",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "NEET_JEE",
    "question_text": "[#0205] The sum of all eigenvalues of an n x n square matrix A is identically equal to the _______ of matrix A.",
    "question_text_ta": "[#0205] ஒரு சதுர அணி A இன் அனைத்து ஐகன் மதிப்புகளின் கூடுதல் அந்த அணியின் _______ க்குச் சமமாகும்.",
    "options": {
      "A": "Trace (சுவடு - Tr(A))",
      "B": "Determinant (அணிக்கோவை மதிப்பு)",
      "C": "Rank (அணியின் தரம்)",
      "D": "Nullity (வெற்றுமை)"
    },
    "correct_option": "A",
    "explanation": "[Question #0205] The trace of any square matrix equals the sum of its main diagonal elements, which identically equals the algebraic sum of all its eigenvalues.",
    "explanation_ta": "[கேள்வி எண் #0205] ஒரு சதுர அணியின் சுவடு (Trace) அதன் முதன்மை மூலைவிட்ட உறுப்புகளின் கூடுதலுக்கு மற்றும் அனைத்து ஐகன் மதிப்புகளின் கூடுதலுக்குச் சமமாகும்.",
    "formula_or_law": "\\text{Tr}(A) = \\sum_{i=1}^n a_{ii} = \\sum_{i=1}^n \\lambda_i"
  },
  {
    "question_uid": "CHE-PHY-01-01-M3-M-0206",
    "taxonomy": {
      "subject": "Chemistry",
      "subject_code": "CHE",
      "domain": "Physical Chemistry",
      "domain_code": "PHY",
      "topic": "Binary Search Trees & Principles",
      "topic_code": "01",
      "subtopic": "Rate Laws & Arrhenius",
      "subtopic_code": "01",
      "microtopic": "Binary Search Trees Core Rule",
      "microtopic_code": "M3",
      "difficulty": "Medium",
      "exam_category": "SCHOOL_K12",
      "question_format": "assertion_reason"
    },
    "question_format": "assertion_reason",
    "exam_category": "SCHOOL_K12",
    "question_text": "[#0206] In an AVL Tree, the balance factor for every node is strictly constrained to the set _______ .",
    "question_text_ta": "[#0206] AVL மரத்தில் ஒவ்வொரு முனையின் சமநிலை காரணி (Balance Factor) எப்போதும் _______ கணத்திற்குள் இருக்க வேண்டும்.",
    "options": {
      "A": "{-1, 0, +1}",
      "B": "{0, 1, 2}",
      "C": "{-2, 0, +2}",
      "D": "{0, 1}"
    },
    "correct_option": "A",
    "explanation": "[Question #0206] An AVL tree is a self-balancing binary search tree where the height difference between left and right subtrees (Balance Factor = Height(L) - Height(R)) is strictly in {-1, 0, 1}.",
    "explanation_ta": "[கேள்வி எண் #0206] AVL மரத்தில் இடது மற்றும் வலது துணை மரங்களின் உயர வேறுபாடு எப்போதும் -1, 0, அல்லது +1 ஆக மட்டுமே இருக்க வேண்டும்.",
    "formula_or_law": "\\text{BF}(v) = h(\\text{left}(v)) - h(\\text{right}(v)) \\in \\{-1, 0, +1\\}"
  },
  {
    "question_uid": "BIO-BOT-01-01-M1-M-0207",
    "taxonomy": {
      "subject": "Biology",
      "subject_code": "BIO",
      "domain": "Botany",
      "domain_code": "BOT",
      "topic": "Constitution & Principles",
      "topic_code": "01",
      "subtopic": "Photosynthesis C3 & C4",
      "subtopic_code": "01",
      "microtopic": "Constitution Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Medium",
      "exam_category": "NEET_JEE",
      "question_format": "numerical"
    },
    "question_format": "numerical",
    "exam_category": "NEET_JEE",
    "question_text": "[#0207] Under Article _______ of the Constitution of India, High Courts have the power to issue Writs for Fundamental Rights and other legal rights.",
    "question_text_ta": "[#0207] இந்திய அரசியலமைப்பின் சட்டப்பிரிவு _______ இன் கீழ் உயர்நீதிமன்றங்கள் நீதிப்பேராணைகளை வெளியிடும் அதிகாரம் பெற்றுள்ளன.",
    "options": {
      "A": "Article 226",
      "B": "Article 32",
      "C": "Article 14",
      "D": "Article 368"
    },
    "correct_option": "A",
    "explanation": "[Question #0207] Article 226 empowers High Courts to issue Writs for Fundamental Rights as well as ordinary legal rights, giving it a wider textual scope than Article 32.",
    "explanation_ta": "[கேள்வி எண் #0207] சட்டப்பிரிவு 226 உயர்நீதிமன்றங்களுக்கு அடிப்படை உரிமைகள் மற்றும் பிற சட்ட உரிமைகளுக்காகவும் நீதிப்பேராணைகளை வழங்கும் அதிகாரத்தை அளிக்கிறது.",
    "formula_or_law": "\\text{Article 226} \\implies \\text{High Court Writ Jurisdiction}"
  },
  {
    "question_uid": "BIO-ZOO-01-01-M2-E-0208",
    "taxonomy": {
      "subject": "Biology",
      "subject_code": "BIO",
      "domain": "Zoology",
      "domain_code": "ZOO",
      "topic": "Cholas & Principles",
      "topic_code": "01",
      "subtopic": "Endocrine & Neural System",
      "subtopic_code": "01",
      "microtopic": "Cholas Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Easy",
      "exam_category": "NEET_JEE",
      "question_format": "match_the_following"
    },
    "question_format": "match_the_following",
    "exam_category": "NEET_JEE",
    "question_text": "[#0208] The famous Uttaramerur Inscription of Parantaka Chola I describes the _______ system of secret ballot village democracy.",
    "question_text_ta": "[#0208] முதலாம் பராந்தக சோழனின் உத்திரமேரூர் கல்வெட்டு கிராம நிர்வாகத்திற்கான _______ தேர்தல் முறையை விவரிக்கிறது.",
    "options": {
      "A": "Kudavolai (குடவோலை முறை)",
      "B": "Kadamai (கடமை முறை)",
      "C": "Variyam (வாரிய வரி விதிப்பு)",
      "D": "Kaniurimai (காணியுரிமை முறை)"
    },
    "correct_option": "A",
    "explanation": "[Question #0208] The Uttaramerur inscription details the Kudavolai secret ballot system for electing members to village committees (Variyams) with strict qualifications and disqualifications.",
    "explanation_ta": "[கேள்வி எண் #0208] உத்திரமேரூர் கல்வெட்டு கிராம சபைக் குழுக்களுக்கு (வாரியங்கள்) குடவோலை முறை மூலம் உறுப்பினர்களைத் தேர்ந்தெடுக்கும் தேர்தல் முறையை விவரிக்கிறது.",
    "formula_or_law": "\\text{Uttaramerur Inscription} \\implies \\text{Village Kudavolai Democracy}"
  },
  {
    "question_uid": "BIO-GEN-01-01-M3-H-0209",
    "taxonomy": {
      "subject": "Biology",
      "subject_code": "BIO",
      "domain": "Genetics",
      "domain_code": "GEN",
      "topic": "Monsoons & Principles",
      "topic_code": "01",
      "subtopic": "DNA Replication & Translation",
      "subtopic_code": "01",
      "microtopic": "Monsoons Core Rule",
      "microtopic_code": "M3",
      "difficulty": "Hard",
      "exam_category": "SCHOOL_K12",
      "question_format": "pyq"
    },
    "question_format": "pyq",
    "exam_category": "SCHOOL_K12",
    "question_text": "[#0209] Tamil Nadu receives nearly 48% to 50% of its annual precipitation from the _______ Monsoon season.",
    "question_text_ta": "[#0209] தமிழ்நாடு தனது ஆண்டு மழையில் சுமார் 48% முதல் 50% பங்கை _______ பருவமழை காலத்தில் பெறுகிறது.",
    "options": {
      "A": "North-East Monsoon (வடகிழக்குப் பருவமழை)",
      "B": "South-West Monsoon (தென்மேற்குப் பருவமழை)",
      "C": "Pre-Monsoon Convectional Showers (கோடை மழை)",
      "D": "Winter Cyclonic Disturbances"
    },
    "correct_option": "A",
    "explanation": "[Question #0209] The North-East Monsoon accounts for nearly 48-50% of Tamil Nadu's annual precipitation as retreating winds pick up moisture across the Bay of Bengal and hit the Coromandel coast.",
    "explanation_ta": "[கேள்வி எண் #0209] தமிழ்நாடு தனது ஆண்டு மழையில் சுமார் 48-50% பங்கை வடகிழக்குப் பருவமழை மூலமே பெறுகிறது.",
    "formula_or_law": "\\text{NE Monsoon (Oct-Dec)} \\implies 48\\text{--}50\\% \\text{ TN Precipitation}"
  },
  {
    "question_uid": "MAT-CAL-01-01-M1-H-0210",
    "taxonomy": {
      "subject": "Mathematics",
      "subject_code": "MAT",
      "domain": "Calculus",
      "domain_code": "CAL",
      "topic": "Simple Interest & Principles",
      "topic_code": "01",
      "subtopic": "Definite Integrals & Limits",
      "subtopic_code": "01",
      "microtopic": "Simple Interest Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Hard",
      "exam_category": "NEET_JEE",
      "question_format": "theory"
    },
    "question_format": "theory",
    "exam_category": "NEET_JEE",
    "question_text": "[#0210] If SI = (P * R * N) / 100, the total accumulated amount A is calculated by the formula A = _______ .",
    "question_text_ta": "[#0210] தனிவட்டி SI = (P * R * N) / 100 எனில், மொத்தத் தொகை A கணக்கிடும் சூத்திரம் A = _______ ஆகும்.",
    "options": {
      "A": "P [1 + (R * N) / 100]",
      "B": "P [1 + R / 100]^N",
      "C": "(P * R * N) / 100",
      "D": "P / [1 + (R * N) / 100]"
    },
    "correct_option": "A",
    "explanation": "[Question #0210] Total Amount A = Principal P + Simple Interest SI = P + (P * R * N) / 100 = P [1 + (R * N) / 100].",
    "explanation_ta": "[கேள்வி எண் #0210] மொத்தத் தொகை A = அசல் + தனிவட்டி = P [1 + (R * N) / 100].",
    "formula_or_law": "A = P \\left(1 + \\frac{R \\cdot N}{100}\\right)"
  },
  {
    "question_uid": "MAT-ALG-01-01-M2-M-0211",
    "taxonomy": {
      "subject": "Mathematics",
      "subject_code": "MAT",
      "domain": "Algebra",
      "domain_code": "ALG",
      "topic": "Kinematics & Principles",
      "topic_code": "01",
      "subtopic": "Eigenvalues & Rank",
      "subtopic_code": "01",
      "microtopic": "Kinematics Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "SCHOOL_K12",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "SCHOOL_K12",
    "question_text": "[#0211] In two-dimensional projectile motion without air resistance, the horizontal velocity component remains _______ throughout the flight.",
    "question_text_ta": "[#0211] காற்று உராய்வு இல்லாத இருபரிமாண எறிபொருள் இயக்கத்தில் கிடைமட்ட திசைவேகக் கூறு இயக்கம் முழுவதும் _______ ஆக இருக்கும்.",
    "options": {
      "A": "Constant (மாறிலி)",
      "B": "Zero at highest point (உச்சியில் சுழி)",
      "C": "Linearly increasing (நேர்கோட்டில் அதிகரிக்கும்)",
      "D": "Exponentially decaying (அதிவேகமாக குறையும்)"
    },
    "correct_option": "A",
    "explanation": "[Question #0211] Since gravity acts solely vertically downward (a_y = -g), horizontal acceleration a_x = 0, keeping horizontal velocity v_x = u cos θ strictly constant.",
    "explanation_ta": "[கேள்வி எண் #0211] புவியீர்ப்பு விசை செங்குத்தாக மட்டுமே செயல்படுவதால் கிடைமட்ட முடுக்கம் a_x = 0, எனவே v_x மாறிலியாக இருக்கும்.",
    "formula_or_law": "v_x = u \\cos\\theta = \\text{constant}"
  },
  {
    "question_uid": "CS-DSA-01-01-M1-M-0212",
    "taxonomy": {
      "subject": "Computer Science",
      "subject_code": "CS",
      "domain": "Algorithms",
      "domain_code": "DSA",
      "topic": "Ohm Law & Principles",
      "topic_code": "01",
      "subtopic": "Binary Search Trees & AVL",
      "subtopic_code": "01",
      "microtopic": "Ohm Law Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Medium",
      "exam_category": "SSC_BANK",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "SSC_BANK",
    "question_text": "[#0212] According to microscopic Ohm's law, the electrical conductivity σ is given by the formula _______ .",
    "question_text_ta": "[#0212] நுண்ணோக்கி ஓம் விதியின்படி ஒரு கடத்தியின் மின்கடத்துத்திறன் σ சமன்பாடு _______ ஆகும்.",
    "options": {
      "A": "σ = (n e² τ) / m",
      "B": "σ = (m e² τ) / n",
      "C": "σ = (n e τ) / m²",
      "D": "σ = (n² e τ) / m"
    },
    "correct_option": "A",
    "explanation": "[Question #0212] Conductivity σ is derived from J = n e v_d where v_d = (e E τ) / m, leading to J = (n e² τ / m) E = σ E.",
    "explanation_ta": "[கேள்வி எண் #0212] மின்கடத்துத்திறன் σ = (n e² τ) / m ஆகும்.",
    "formula_or_law": "\\sigma = \\frac{n e^2 \\tau}{m}"
  },
  {
    "question_uid": "CS-DBMS-01-01-M2-E-0213",
    "taxonomy": {
      "subject": "Computer Science",
      "subject_code": "CS",
      "domain": "Databases",
      "domain_code": "DBMS",
      "topic": "Chemical Kinetics & Principles",
      "topic_code": "01",
      "subtopic": "Normalization & Indexing",
      "subtopic_code": "01",
      "microtopic": "Chemical Kinetics Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Easy",
      "exam_category": "SSC_BANK",
      "question_format": "assertion_reason"
    },
    "question_format": "assertion_reason",
    "exam_category": "SSC_BANK",
    "question_text": "[#0213] For a first-order chemical reaction, the half-life period t_1/2 is _______ of initial reactant concentration.",
    "question_text_ta": "[#0213] ஒரு முதல் வகை வேதிவினைக்கு அரைவாழ்வு காலம் தொடக்கச் செறிவை _______ .",
    "options": {
      "A": "Independent (சார்ந்திருக்காது - t_1/2 = 0.693 / k)",
      "B": "Directly proportional (நேர்விகிதத்தில் சார்ந்தது)",
      "C": "Inversely proportional (எதிர்விகிதத்தில் சார்ந்தது)",
      "D": "Exponentially dependent (அதிவேகமாக சார்ந்தது)"
    },
    "correct_option": "A",
    "explanation": "[Question #0213] For first order: k = (2.303 / t) log([A]_0 / [A]). At t = t_1/2, [A] = [A]_0 / 2, giving t_1/2 = ln(2) / k = 0.693 / k.",
    "explanation_ta": "[கேள்வி எண் #0213] முதல் வகை வினைக்கு அரைவாழ்வு காலம் தொடக்கச் செறிவைச் சார்ந்திருக்காது: t_1/2 = 0.693 / k.",
    "formula_or_law": "t_{1/2} = \\frac{\\ln 2}{k} = \\frac{0.693}{k}"
  },
  {
    "question_uid": "HIS-TN-01-01-M1-E-0214",
    "taxonomy": {
      "subject": "History",
      "subject_code": "HIS",
      "domain": "Tamil Nadu History",
      "domain_code": "TN",
      "topic": "Photosynthesis & Principles",
      "topic_code": "01",
      "subtopic": "Cholas, Pandyas & Cheras",
      "subtopic_code": "01",
      "microtopic": "Photosynthesis Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Easy",
      "exam_category": "TNPSC",
      "question_format": "numerical"
    },
    "question_format": "numerical",
    "exam_category": "TNPSC",
    "question_text": "[#0214] During photosynthesis in chloroplasts, photolysis of water occurs at the _______ complex of PS II.",
    "question_text_ta": "[#0214] ஒளிச்சேர்க்கையின் போது நீர் மூலக்கூறு ஒளிச்சிதைவு PS II இன் _______ வளாகத்தில் நடைபெறுகிறது.",
    "options": {
      "A": "Oxygen-Evolving Complex (OEC - ஆக்ஸிஜன் வெளிப்படுத்தும் மையம்)",
      "B": "ATP Synthase CF0-CF1 complex",
      "C": "Photosystem I reaction center P700",
      "D": "Cytochrome b6f complex"
    },
    "correct_option": "A",
    "explanation": "[Question #0214] Water photolysis (2H2O -> 4H+ + 4e- + O2) is catalyzed by the manganese-containing oxygen-evolving complex located on the luminal side of PS II.",
    "explanation_ta": "[கேள்வி எண் #0214] நீர் மூலக்கூறு சிதைவு PS II இன் ஆக்ஸிஜன் வெளிப்படுத்தும் மையத்தால் வினையூக்கப்படுகிறது.",
    "formula_or_law": "2\\text{H}_2\\text{O} \\xrightarrow{h\\nu, \\text{PS II}} 4\\text{H}^+ + 4e^- + \\text{O}_2"
  },
  {
    "question_uid": "HIS-MOD-01-01-M2-M-0215",
    "taxonomy": {
      "subject": "History",
      "subject_code": "HIS",
      "domain": "Modern India",
      "domain_code": "MOD",
      "topic": "Matrices & Principles",
      "topic_code": "01",
      "subtopic": "Non-Cooperation & Civil Disobedience",
      "subtopic_code": "01",
      "microtopic": "Matrices Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "TNPSC",
      "question_format": "match_the_following"
    },
    "question_format": "match_the_following",
    "exam_category": "TNPSC",
    "question_text": "[#0215] The sum of all eigenvalues of an n x n square matrix A is identically equal to the _______ of matrix A.",
    "question_text_ta": "[#0215] ஒரு சதுர அணி A இன் அனைத்து ஐகன் மதிப்புகளின் கூடுதல் அந்த அணியின் _______ க்குச் சமமாகும்.",
    "options": {
      "A": "Trace (சுவடு - Tr(A))",
      "B": "Determinant (அணிக்கோவை மதிப்பு)",
      "C": "Rank (அணியின் தரம்)",
      "D": "Nullity (வெற்றுமை)"
    },
    "correct_option": "A",
    "explanation": "[Question #0215] The trace of any square matrix equals the sum of its main diagonal elements, which identically equals the algebraic sum of all its eigenvalues.",
    "explanation_ta": "[கேள்வி எண் #0215] ஒரு சதுர அணியின் சுவடு (Trace) அதன் முதன்மை மூலைவிட்ட உறுப்புகளின் கூடுதலுக்கு மற்றும் அனைத்து ஐகன் மதிப்புகளின் கூடுதலுக்குச் சமமாகும்.",
    "formula_or_law": "\\text{Tr}(A) = \\sum_{i=1}^n a_{ii} = \\sum_{i=1}^n \\lambda_i"
  },
  {
    "question_uid": "POL-CON-01-01-M1-E-0216",
    "taxonomy": {
      "subject": "Polity",
      "subject_code": "POL",
      "domain": "Constitution",
      "domain_code": "CON",
      "topic": "Binary Search Trees & Principles",
      "topic_code": "01",
      "subtopic": "Articles 14-32 & Writs",
      "subtopic_code": "01",
      "microtopic": "Binary Search Trees Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Easy",
      "exam_category": "TNPSC",
      "question_format": "pyq"
    },
    "question_format": "pyq",
    "exam_category": "TNPSC",
    "question_text": "[#0216] In an AVL Tree, the balance factor for every node is strictly constrained to the set _______ .",
    "question_text_ta": "[#0216] AVL மரத்தில் ஒவ்வொரு முனையின் சமநிலை காரணி (Balance Factor) எப்போதும் _______ கணத்திற்குள் இருக்க வேண்டும்.",
    "options": {
      "A": "{-1, 0, +1}",
      "B": "{0, 1, 2}",
      "C": "{-2, 0, +2}",
      "D": "{0, 1}"
    },
    "correct_option": "A",
    "explanation": "[Question #0216] An AVL tree is a self-balancing binary search tree where the height difference between left and right subtrees (Balance Factor = Height(L) - Height(R)) is strictly in {-1, 0, 1}.",
    "explanation_ta": "[கேள்வி எண் #0216] AVL மரத்தில் இடது மற்றும் வலது துணை மரங்களின் உயர வேறுபாடு எப்போதும் -1, 0, அல்லது +1 ஆக மட்டுமே இருக்க வேண்டும்.",
    "formula_or_law": "\\text{BF}(v) = h(\\text{left}(v)) - h(\\text{right}(v)) \\in \\{-1, 0, +1\\}"
  },
  {
    "question_uid": "POL-GOV-01-01-M2-M-0217",
    "taxonomy": {
      "subject": "Polity",
      "subject_code": "POL",
      "domain": "Governance",
      "domain_code": "GOV",
      "topic": "Constitution & Principles",
      "topic_code": "01",
      "subtopic": "Lok Sabha & Supreme Court",
      "subtopic_code": "01",
      "microtopic": "Constitution Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "SSC_BANK",
      "question_format": "theory"
    },
    "question_format": "theory",
    "exam_category": "SSC_BANK",
    "question_text": "[#0217] Under Article _______ of the Constitution of India, High Courts have the power to issue Writs for Fundamental Rights and other legal rights.",
    "question_text_ta": "[#0217] இந்திய அரசியலமைப்பின் சட்டப்பிரிவு _______ இன் கீழ் உயர்நீதிமன்றங்கள் நீதிப்பேராணைகளை வெளியிடும் அதிகாரம் பெற்றுள்ளன.",
    "options": {
      "A": "Article 226",
      "B": "Article 32",
      "C": "Article 14",
      "D": "Article 368"
    },
    "correct_option": "A",
    "explanation": "[Question #0217] Article 226 empowers High Courts to issue Writs for Fundamental Rights as well as ordinary legal rights, giving it a wider textual scope than Article 32.",
    "explanation_ta": "[கேள்வி எண் #0217] சட்டப்பிரிவு 226 உயர்நீதிமன்றங்களுக்கு அடிப்படை உரிமைகள் மற்றும் பிற சட்ட உரிமைகளுக்காகவும் நீதிப்பேராணைகளை வழங்கும் அதிகாரத்தை அளிக்கிறது.",
    "formula_or_law": "\\text{Article 226} \\implies \\text{High Court Writ Jurisdiction}"
  },
  {
    "question_uid": "GEO-IND-01-01-M1-E-0218",
    "taxonomy": {
      "subject": "Geography",
      "subject_code": "GEO",
      "domain": "Indian Geography",
      "domain_code": "IND",
      "topic": "Cholas & Principles",
      "topic_code": "01",
      "subtopic": "Himalayan & Peninsular Rivers",
      "subtopic_code": "01",
      "microtopic": "Cholas Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Easy",
      "exam_category": "TNPSC",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "TNPSC",
    "question_text": "[#0218] The famous Uttaramerur Inscription of Parantaka Chola I describes the _______ system of secret ballot village democracy.",
    "question_text_ta": "[#0218] முதலாம் பராந்தக சோழனின் உத்திரமேரூர் கல்வெட்டு கிராம நிர்வாகத்திற்கான _______ தேர்தல் முறையை விவரிக்கிறது.",
    "options": {
      "A": "Kudavolai (குடவோலை முறை)",
      "B": "Kadamai (கடமை முறை)",
      "C": "Variyam (வாரிய வரி விதிப்பு)",
      "D": "Kaniurimai (காணியுரிமை முறை)"
    },
    "correct_option": "A",
    "explanation": "[Question #0218] The Uttaramerur inscription details the Kudavolai secret ballot system for electing members to village committees (Variyams) with strict qualifications and disqualifications.",
    "explanation_ta": "[கேள்வி எண் #0218] உத்திரமேரூர் கல்வெட்டு கிராம சபைக் குழுக்களுக்கு (வாரியங்கள்) குடவோலை முறை மூலம் உறுப்பினர்களைத் தேர்ந்தெடுக்கும் தேர்தல் முறையை விவரிக்கிறது.",
    "formula_or_law": "\\text{Uttaramerur Inscription} \\implies \\text{Village Kudavolai Democracy}"
  },
  {
    "question_uid": "GEO-TN-01-01-M2-M-0219",
    "taxonomy": {
      "subject": "Geography",
      "subject_code": "GEO",
      "domain": "Tamil Nadu Geography",
      "domain_code": "TN",
      "topic": "Monsoons & Principles",
      "topic_code": "01",
      "subtopic": "Monsoons & Soil Types",
      "subtopic_code": "01",
      "microtopic": "Monsoons Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "TNPSC",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "TNPSC",
    "question_text": "[#0219] Tamil Nadu receives nearly 48% to 50% of its annual precipitation from the _______ Monsoon season.",
    "question_text_ta": "[#0219] தமிழ்நாடு தனது ஆண்டு மழையில் சுமார் 48% முதல் 50% பங்கை _______ பருவமழை காலத்தில் பெறுகிறது.",
    "options": {
      "A": "North-East Monsoon (வடகிழக்குப் பருவமழை)",
      "B": "South-West Monsoon (தென்மேற்குப் பருவமழை)",
      "C": "Pre-Monsoon Convectional Showers (கோடை மழை)",
      "D": "Winter Cyclonic Disturbances"
    },
    "correct_option": "A",
    "explanation": "[Question #0219] The North-East Monsoon accounts for nearly 48-50% of Tamil Nadu's annual precipitation as retreating winds pick up moisture across the Bay of Bengal and hit the Coromandel coast.",
    "explanation_ta": "[கேள்வி எண் #0219] தமிழ்நாடு தனது ஆண்டு மழையில் சுமார் 48-50% பங்கை வடகிழக்குப் பருவமழை மூலமே பெறுகிறது.",
    "formula_or_law": "\\text{NE Monsoon (Oct-Dec)} \\implies 48\\text{--}50\\% \\text{ TN Precipitation}"
  },
  {
    "question_uid": "APT-NUM-01-01-M1-E-0220",
    "taxonomy": {
      "subject": "Aptitude",
      "subject_code": "APT",
      "domain": "Quantitative Aptitude",
      "domain_code": "NUM",
      "topic": "Simple Interest & Principles",
      "topic_code": "01",
      "subtopic": "Simple & Compound Interest",
      "subtopic_code": "01",
      "microtopic": "Simple Interest Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Easy",
      "exam_category": "SSC_BANK",
      "question_format": "assertion_reason"
    },
    "question_format": "assertion_reason",
    "exam_category": "SSC_BANK",
    "question_text": "[#0220] If SI = (P * R * N) / 100, the total accumulated amount A is calculated by the formula A = _______ .",
    "question_text_ta": "[#0220] தனிவட்டி SI = (P * R * N) / 100 எனில், மொத்தத் தொகை A கணக்கிடும் சூத்திரம் A = _______ ஆகும்.",
    "options": {
      "A": "P [1 + (R * N) / 100]",
      "B": "P [1 + R / 100]^N",
      "C": "(P * R * N) / 100",
      "D": "P / [1 + (R * N) / 100]"
    },
    "correct_option": "A",
    "explanation": "[Question #0220] Total Amount A = Principal P + Simple Interest SI = P + (P * R * N) / 100 = P [1 + (R * N) / 100].",
    "explanation_ta": "[கேள்வி எண் #0220] மொத்தத் தொகை A = அசல் + தனிவட்டி = P [1 + (R * N) / 100].",
    "formula_or_law": "A = P \\left(1 + \\frac{R \\cdot N}{100}\\right)"
  },
  {
    "question_uid": "PHY-MEC-01-01-M1-M-0221",
    "taxonomy": {
      "subject": "Physics",
      "subject_code": "PHY",
      "domain": "Mechanics",
      "domain_code": "MEC",
      "topic": "Kinematics & Principles",
      "topic_code": "01",
      "subtopic": "Motion in 2D & Projectiles",
      "subtopic_code": "01",
      "microtopic": "Kinematics Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Medium",
      "exam_category": "NEET_JEE",
      "question_format": "numerical"
    },
    "question_format": "numerical",
    "exam_category": "NEET_JEE",
    "question_text": "[#0221] In two-dimensional projectile motion without air resistance, the horizontal velocity component remains _______ throughout the flight.",
    "question_text_ta": "[#0221] காற்று உராய்வு இல்லாத இருபரிமாண எறிபொருள் இயக்கத்தில் கிடைமட்ட திசைவேகக் கூறு இயக்கம் முழுவதும் _______ ஆக இருக்கும்.",
    "options": {
      "A": "Constant (மாறிலி)",
      "B": "Zero at highest point (உச்சியில் சுழி)",
      "C": "Linearly increasing (நேர்கோட்டில் அதிகரிக்கும்)",
      "D": "Exponentially decaying (அதிவேகமாக குறையும்)"
    },
    "correct_option": "A",
    "explanation": "[Question #0221] Since gravity acts solely vertically downward (a_y = -g), horizontal acceleration a_x = 0, keeping horizontal velocity v_x = u cos θ strictly constant.",
    "explanation_ta": "[கேள்வி எண் #0221] புவியீர்ப்பு விசை செங்குத்தாக மட்டுமே செயல்படுவதால் கிடைமட்ட முடுக்கம் a_x = 0, எனவே v_x மாறிலியாக இருக்கும்.",
    "formula_or_law": "v_x = u \\cos\\theta = \\text{constant}"
  },
  {
    "question_uid": "PHY-ELE-01-01-M2-E-0222",
    "taxonomy": {
      "subject": "Physics",
      "subject_code": "PHY",
      "domain": "Electrodynamics",
      "domain_code": "ELE",
      "topic": "Ohm Law & Principles",
      "topic_code": "01",
      "subtopic": "Ohm Law & Kirchhoff Rules",
      "subtopic_code": "01",
      "microtopic": "Ohm Law Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Easy",
      "exam_category": "NEET_JEE",
      "question_format": "match_the_following"
    },
    "question_format": "match_the_following",
    "exam_category": "NEET_JEE",
    "question_text": "[#0222] According to microscopic Ohm's law, the electrical conductivity σ is given by the formula _______ .",
    "question_text_ta": "[#0222] நுண்ணோக்கி ஓம் விதியின்படி ஒரு கடத்தியின் மின்கடத்துத்திறன் σ சமன்பாடு _______ ஆகும்.",
    "options": {
      "A": "σ = (n e² τ) / m",
      "B": "σ = (m e² τ) / n",
      "C": "σ = (n e τ) / m²",
      "D": "σ = (n² e τ) / m"
    },
    "correct_option": "A",
    "explanation": "[Question #0222] Conductivity σ is derived from J = n e v_d where v_d = (e E τ) / m, leading to J = (n e² τ / m) E = σ E.",
    "explanation_ta": "[கேள்வி எண் #0222] மின்கடத்துத்திறன் σ = (n e² τ) / m ஆகும்.",
    "formula_or_law": "\\sigma = \\frac{n e^2 \\tau}{m}"
  },
  {
    "question_uid": "PHY-OPT-01-01-M3-H-0223",
    "taxonomy": {
      "subject": "Physics",
      "subject_code": "PHY",
      "domain": "Optics",
      "domain_code": "OPT",
      "topic": "Chemical Kinetics & Principles",
      "topic_code": "01",
      "subtopic": "Interference & Diffraction",
      "subtopic_code": "01",
      "microtopic": "Chemical Kinetics Core Rule",
      "microtopic_code": "M3",
      "difficulty": "Hard",
      "exam_category": "SCHOOL_K12",
      "question_format": "pyq"
    },
    "question_format": "pyq",
    "exam_category": "SCHOOL_K12",
    "question_text": "[#0223] For a first-order chemical reaction, the half-life period t_1/2 is _______ of initial reactant concentration.",
    "question_text_ta": "[#0223] ஒரு முதல் வகை வேதிவினைக்கு அரைவாழ்வு காலம் தொடக்கச் செறிவை _______ .",
    "options": {
      "A": "Independent (சார்ந்திருக்காது - t_1/2 = 0.693 / k)",
      "B": "Directly proportional (நேர்விகிதத்தில் சார்ந்தது)",
      "C": "Inversely proportional (எதிர்விகிதத்தில் சார்ந்தது)",
      "D": "Exponentially dependent (அதிவேகமாக சார்ந்தது)"
    },
    "correct_option": "A",
    "explanation": "[Question #0223] For first order: k = (2.303 / t) log([A]_0 / [A]). At t = t_1/2, [A] = [A]_0 / 2, giving t_1/2 = ln(2) / k = 0.693 / k.",
    "explanation_ta": "[கேள்வி எண் #0223] முதல் வகை வினைக்கு அரைவாழ்வு காலம் தொடக்கச் செறிவைச் சார்ந்திருக்காது: t_1/2 = 0.693 / k.",
    "formula_or_law": "t_{1/2} = \\frac{\\ln 2}{k} = \\frac{0.693}{k}"
  },
  {
    "question_uid": "CHE-ORG-01-01-M1-H-0224",
    "taxonomy": {
      "subject": "Chemistry",
      "subject_code": "CHE",
      "domain": "Organic Chemistry",
      "domain_code": "ORG",
      "topic": "Photosynthesis & Principles",
      "topic_code": "01",
      "subtopic": "Electrophilic & Nucleophilic",
      "subtopic_code": "01",
      "microtopic": "Photosynthesis Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Hard",
      "exam_category": "NEET_JEE",
      "question_format": "theory"
    },
    "question_format": "theory",
    "exam_category": "NEET_JEE",
    "question_text": "[#0224] During photosynthesis in chloroplasts, photolysis of water occurs at the _______ complex of PS II.",
    "question_text_ta": "[#0224] ஒளிச்சேர்க்கையின் போது நீர் மூலக்கூறு ஒளிச்சிதைவு PS II இன் _______ வளாகத்தில் நடைபெறுகிறது.",
    "options": {
      "A": "Oxygen-Evolving Complex (OEC - ஆக்ஸிஜன் வெளிப்படுத்தும் மையம்)",
      "B": "ATP Synthase CF0-CF1 complex",
      "C": "Photosystem I reaction center P700",
      "D": "Cytochrome b6f complex"
    },
    "correct_option": "A",
    "explanation": "[Question #0224] Water photolysis (2H2O -> 4H+ + 4e- + O2) is catalyzed by the manganese-containing oxygen-evolving complex located on the luminal side of PS II.",
    "explanation_ta": "[கேள்வி எண் #0224] நீர் மூலக்கூறு சிதைவு PS II இன் ஆக்ஸிஜன் வெளிப்படுத்தும் மையத்தால் வினையூக்கப்படுகிறது.",
    "formula_or_law": "2\\text{H}_2\\text{O} \\xrightarrow{h\\nu, \\text{PS II}} 4\\text{H}^+ + 4e^- + \\text{O}_2"
  },
  {
    "question_uid": "CHE-INO-01-01-M2-M-0225",
    "taxonomy": {
      "subject": "Chemistry",
      "subject_code": "CHE",
      "domain": "Inorganic Chemistry",
      "domain_code": "INO",
      "topic": "Matrices & Principles",
      "topic_code": "01",
      "subtopic": "Ligand Field & Isomerism",
      "subtopic_code": "01",
      "microtopic": "Matrices Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "NEET_JEE",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "NEET_JEE",
    "question_text": "[#0225] The sum of all eigenvalues of an n x n square matrix A is identically equal to the _______ of matrix A.",
    "question_text_ta": "[#0225] ஒரு சதுர அணி A இன் அனைத்து ஐகன் மதிப்புகளின் கூடுதல் அந்த அணியின் _______ க்குச் சமமாகும்.",
    "options": {
      "A": "Trace (சுவடு - Tr(A))",
      "B": "Determinant (அணிக்கோவை மதிப்பு)",
      "C": "Rank (அணியின் தரம்)",
      "D": "Nullity (வெற்றுமை)"
    },
    "correct_option": "A",
    "explanation": "[Question #0225] The trace of any square matrix equals the sum of its main diagonal elements, which identically equals the algebraic sum of all its eigenvalues.",
    "explanation_ta": "[கேள்வி எண் #0225] ஒரு சதுர அணியின் சுவடு (Trace) அதன் முதன்மை மூலைவிட்ட உறுப்புகளின் கூடுதலுக்கு மற்றும் அனைத்து ஐகன் மதிப்புகளின் கூடுதலுக்குச் சமமாகும்.",
    "formula_or_law": "\\text{Tr}(A) = \\sum_{i=1}^n a_{ii} = \\sum_{i=1}^n \\lambda_i"
  },
  {
    "question_uid": "CHE-PHY-01-01-M3-M-0226",
    "taxonomy": {
      "subject": "Chemistry",
      "subject_code": "CHE",
      "domain": "Physical Chemistry",
      "domain_code": "PHY",
      "topic": "Binary Search Trees & Principles",
      "topic_code": "01",
      "subtopic": "Rate Laws & Arrhenius",
      "subtopic_code": "01",
      "microtopic": "Binary Search Trees Core Rule",
      "microtopic_code": "M3",
      "difficulty": "Medium",
      "exam_category": "SCHOOL_K12",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "SCHOOL_K12",
    "question_text": "[#0226] In an AVL Tree, the balance factor for every node is strictly constrained to the set _______ .",
    "question_text_ta": "[#0226] AVL மரத்தில் ஒவ்வொரு முனையின் சமநிலை காரணி (Balance Factor) எப்போதும் _______ கணத்திற்குள் இருக்க வேண்டும்.",
    "options": {
      "A": "{-1, 0, +1}",
      "B": "{0, 1, 2}",
      "C": "{-2, 0, +2}",
      "D": "{0, 1}"
    },
    "correct_option": "A",
    "explanation": "[Question #0226] An AVL tree is a self-balancing binary search tree where the height difference between left and right subtrees (Balance Factor = Height(L) - Height(R)) is strictly in {-1, 0, 1}.",
    "explanation_ta": "[கேள்வி எண் #0226] AVL மரத்தில் இடது மற்றும் வலது துணை மரங்களின் உயர வேறுபாடு எப்போதும் -1, 0, அல்லது +1 ஆக மட்டுமே இருக்க வேண்டும்.",
    "formula_or_law": "\\text{BF}(v) = h(\\text{left}(v)) - h(\\text{right}(v)) \\in \\{-1, 0, +1\\}"
  },
  {
    "question_uid": "BIO-BOT-01-01-M1-M-0227",
    "taxonomy": {
      "subject": "Biology",
      "subject_code": "BIO",
      "domain": "Botany",
      "domain_code": "BOT",
      "topic": "Constitution & Principles",
      "topic_code": "01",
      "subtopic": "Photosynthesis C3 & C4",
      "subtopic_code": "01",
      "microtopic": "Constitution Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Medium",
      "exam_category": "NEET_JEE",
      "question_format": "assertion_reason"
    },
    "question_format": "assertion_reason",
    "exam_category": "NEET_JEE",
    "question_text": "[#0227] Under Article _______ of the Constitution of India, High Courts have the power to issue Writs for Fundamental Rights and other legal rights.",
    "question_text_ta": "[#0227] இந்திய அரசியலமைப்பின் சட்டப்பிரிவு _______ இன் கீழ் உயர்நீதிமன்றங்கள் நீதிப்பேராணைகளை வெளியிடும் அதிகாரம் பெற்றுள்ளன.",
    "options": {
      "A": "Article 226",
      "B": "Article 32",
      "C": "Article 14",
      "D": "Article 368"
    },
    "correct_option": "A",
    "explanation": "[Question #0227] Article 226 empowers High Courts to issue Writs for Fundamental Rights as well as ordinary legal rights, giving it a wider textual scope than Article 32.",
    "explanation_ta": "[கேள்வி எண் #0227] சட்டப்பிரிவு 226 உயர்நீதிமன்றங்களுக்கு அடிப்படை உரிமைகள் மற்றும் பிற சட்ட உரிமைகளுக்காகவும் நீதிப்பேராணைகளை வழங்கும் அதிகாரத்தை அளிக்கிறது.",
    "formula_or_law": "\\text{Article 226} \\implies \\text{High Court Writ Jurisdiction}"
  },
  {
    "question_uid": "BIO-ZOO-01-01-M2-E-0228",
    "taxonomy": {
      "subject": "Biology",
      "subject_code": "BIO",
      "domain": "Zoology",
      "domain_code": "ZOO",
      "topic": "Cholas & Principles",
      "topic_code": "01",
      "subtopic": "Endocrine & Neural System",
      "subtopic_code": "01",
      "microtopic": "Cholas Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Easy",
      "exam_category": "NEET_JEE",
      "question_format": "numerical"
    },
    "question_format": "numerical",
    "exam_category": "NEET_JEE",
    "question_text": "[#0228] The famous Uttaramerur Inscription of Parantaka Chola I describes the _______ system of secret ballot village democracy.",
    "question_text_ta": "[#0228] முதலாம் பராந்தக சோழனின் உத்திரமேரூர் கல்வெட்டு கிராம நிர்வாகத்திற்கான _______ தேர்தல் முறையை விவரிக்கிறது.",
    "options": {
      "A": "Kudavolai (குடவோலை முறை)",
      "B": "Kadamai (கடமை முறை)",
      "C": "Variyam (வாரிய வரி விதிப்பு)",
      "D": "Kaniurimai (காணியுரிமை முறை)"
    },
    "correct_option": "A",
    "explanation": "[Question #0228] The Uttaramerur inscription details the Kudavolai secret ballot system for electing members to village committees (Variyams) with strict qualifications and disqualifications.",
    "explanation_ta": "[கேள்வி எண் #0228] உத்திரமேரூர் கல்வெட்டு கிராம சபைக் குழுக்களுக்கு (வாரியங்கள்) குடவோலை முறை மூலம் உறுப்பினர்களைத் தேர்ந்தெடுக்கும் தேர்தல் முறையை விவரிக்கிறது.",
    "formula_or_law": "\\text{Uttaramerur Inscription} \\implies \\text{Village Kudavolai Democracy}"
  },
  {
    "question_uid": "BIO-GEN-01-01-M3-H-0229",
    "taxonomy": {
      "subject": "Biology",
      "subject_code": "BIO",
      "domain": "Genetics",
      "domain_code": "GEN",
      "topic": "Monsoons & Principles",
      "topic_code": "01",
      "subtopic": "DNA Replication & Translation",
      "subtopic_code": "01",
      "microtopic": "Monsoons Core Rule",
      "microtopic_code": "M3",
      "difficulty": "Hard",
      "exam_category": "SCHOOL_K12",
      "question_format": "match_the_following"
    },
    "question_format": "match_the_following",
    "exam_category": "SCHOOL_K12",
    "question_text": "[#0229] Tamil Nadu receives nearly 48% to 50% of its annual precipitation from the _______ Monsoon season.",
    "question_text_ta": "[#0229] தமிழ்நாடு தனது ஆண்டு மழையில் சுமார் 48% முதல் 50% பங்கை _______ பருவமழை காலத்தில் பெறுகிறது.",
    "options": {
      "A": "North-East Monsoon (வடகிழக்குப் பருவமழை)",
      "B": "South-West Monsoon (தென்மேற்குப் பருவமழை)",
      "C": "Pre-Monsoon Convectional Showers (கோடை மழை)",
      "D": "Winter Cyclonic Disturbances"
    },
    "correct_option": "A",
    "explanation": "[Question #0229] The North-East Monsoon accounts for nearly 48-50% of Tamil Nadu's annual precipitation as retreating winds pick up moisture across the Bay of Bengal and hit the Coromandel coast.",
    "explanation_ta": "[கேள்வி எண் #0229] தமிழ்நாடு தனது ஆண்டு மழையில் சுமார் 48-50% பங்கை வடகிழக்குப் பருவமழை மூலமே பெறுகிறது.",
    "formula_or_law": "\\text{NE Monsoon (Oct-Dec)} \\implies 48\\text{--}50\\% \\text{ TN Precipitation}"
  },
  {
    "question_uid": "MAT-CAL-01-01-M1-H-0230",
    "taxonomy": {
      "subject": "Mathematics",
      "subject_code": "MAT",
      "domain": "Calculus",
      "domain_code": "CAL",
      "topic": "Simple Interest & Principles",
      "topic_code": "01",
      "subtopic": "Definite Integrals & Limits",
      "subtopic_code": "01",
      "microtopic": "Simple Interest Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Hard",
      "exam_category": "NEET_JEE",
      "question_format": "pyq"
    },
    "question_format": "pyq",
    "exam_category": "NEET_JEE",
    "question_text": "[#0230] If SI = (P * R * N) / 100, the total accumulated amount A is calculated by the formula A = _______ .",
    "question_text_ta": "[#0230] தனிவட்டி SI = (P * R * N) / 100 எனில், மொத்தத் தொகை A கணக்கிடும் சூத்திரம் A = _______ ஆகும்.",
    "options": {
      "A": "P [1 + (R * N) / 100]",
      "B": "P [1 + R / 100]^N",
      "C": "(P * R * N) / 100",
      "D": "P / [1 + (R * N) / 100]"
    },
    "correct_option": "A",
    "explanation": "[Question #0230] Total Amount A = Principal P + Simple Interest SI = P + (P * R * N) / 100 = P [1 + (R * N) / 100].",
    "explanation_ta": "[கேள்வி எண் #0230] மொத்தத் தொகை A = அசல் + தனிவட்டி = P [1 + (R * N) / 100].",
    "formula_or_law": "A = P \\left(1 + \\frac{R \\cdot N}{100}\\right)"
  },
  {
    "question_uid": "MAT-ALG-01-01-M2-M-0231",
    "taxonomy": {
      "subject": "Mathematics",
      "subject_code": "MAT",
      "domain": "Algebra",
      "domain_code": "ALG",
      "topic": "Kinematics & Principles",
      "topic_code": "01",
      "subtopic": "Eigenvalues & Rank",
      "subtopic_code": "01",
      "microtopic": "Kinematics Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "SCHOOL_K12",
      "question_format": "theory"
    },
    "question_format": "theory",
    "exam_category": "SCHOOL_K12",
    "question_text": "[#0231] In two-dimensional projectile motion without air resistance, the horizontal velocity component remains _______ throughout the flight.",
    "question_text_ta": "[#0231] காற்று உராய்வு இல்லாத இருபரிமாண எறிபொருள் இயக்கத்தில் கிடைமட்ட திசைவேகக் கூறு இயக்கம் முழுவதும் _______ ஆக இருக்கும்.",
    "options": {
      "A": "Constant (மாறிலி)",
      "B": "Zero at highest point (உச்சியில் சுழி)",
      "C": "Linearly increasing (நேர்கோட்டில் அதிகரிக்கும்)",
      "D": "Exponentially decaying (அதிவேகமாக குறையும்)"
    },
    "correct_option": "A",
    "explanation": "[Question #0231] Since gravity acts solely vertically downward (a_y = -g), horizontal acceleration a_x = 0, keeping horizontal velocity v_x = u cos θ strictly constant.",
    "explanation_ta": "[கேள்வி எண் #0231] புவியீர்ப்பு விசை செங்குத்தாக மட்டுமே செயல்படுவதால் கிடைமட்ட முடுக்கம் a_x = 0, எனவே v_x மாறிலியாக இருக்கும்.",
    "formula_or_law": "v_x = u \\cos\\theta = \\text{constant}"
  },
  {
    "question_uid": "CS-DSA-01-01-M1-M-0232",
    "taxonomy": {
      "subject": "Computer Science",
      "subject_code": "CS",
      "domain": "Algorithms",
      "domain_code": "DSA",
      "topic": "Ohm Law & Principles",
      "topic_code": "01",
      "subtopic": "Binary Search Trees & AVL",
      "subtopic_code": "01",
      "microtopic": "Ohm Law Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Medium",
      "exam_category": "SSC_BANK",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "SSC_BANK",
    "question_text": "[#0232] According to microscopic Ohm's law, the electrical conductivity σ is given by the formula _______ .",
    "question_text_ta": "[#0232] நுண்ணோக்கி ஓம் விதியின்படி ஒரு கடத்தியின் மின்கடத்துத்திறன் σ சமன்பாடு _______ ஆகும்.",
    "options": {
      "A": "σ = (n e² τ) / m",
      "B": "σ = (m e² τ) / n",
      "C": "σ = (n e τ) / m²",
      "D": "σ = (n² e τ) / m"
    },
    "correct_option": "A",
    "explanation": "[Question #0232] Conductivity σ is derived from J = n e v_d where v_d = (e E τ) / m, leading to J = (n e² τ / m) E = σ E.",
    "explanation_ta": "[கேள்வி எண் #0232] மின்கடத்துத்திறன் σ = (n e² τ) / m ஆகும்.",
    "formula_or_law": "\\sigma = \\frac{n e^2 \\tau}{m}"
  },
  {
    "question_uid": "CS-DBMS-01-01-M2-E-0233",
    "taxonomy": {
      "subject": "Computer Science",
      "subject_code": "CS",
      "domain": "Databases",
      "domain_code": "DBMS",
      "topic": "Chemical Kinetics & Principles",
      "topic_code": "01",
      "subtopic": "Normalization & Indexing",
      "subtopic_code": "01",
      "microtopic": "Chemical Kinetics Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Easy",
      "exam_category": "SSC_BANK",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "SSC_BANK",
    "question_text": "[#0233] For a first-order chemical reaction, the half-life period t_1/2 is _______ of initial reactant concentration.",
    "question_text_ta": "[#0233] ஒரு முதல் வகை வேதிவினைக்கு அரைவாழ்வு காலம் தொடக்கச் செறிவை _______ .",
    "options": {
      "A": "Independent (சார்ந்திருக்காது - t_1/2 = 0.693 / k)",
      "B": "Directly proportional (நேர்விகிதத்தில் சார்ந்தது)",
      "C": "Inversely proportional (எதிர்விகிதத்தில் சார்ந்தது)",
      "D": "Exponentially dependent (அதிவேகமாக சார்ந்தது)"
    },
    "correct_option": "A",
    "explanation": "[Question #0233] For first order: k = (2.303 / t) log([A]_0 / [A]). At t = t_1/2, [A] = [A]_0 / 2, giving t_1/2 = ln(2) / k = 0.693 / k.",
    "explanation_ta": "[கேள்வி எண் #0233] முதல் வகை வினைக்கு அரைவாழ்வு காலம் தொடக்கச் செறிவைச் சார்ந்திருக்காது: t_1/2 = 0.693 / k.",
    "formula_or_law": "t_{1/2} = \\frac{\\ln 2}{k} = \\frac{0.693}{k}"
  },
  {
    "question_uid": "HIS-TN-01-01-M1-E-0234",
    "taxonomy": {
      "subject": "History",
      "subject_code": "HIS",
      "domain": "Tamil Nadu History",
      "domain_code": "TN",
      "topic": "Photosynthesis & Principles",
      "topic_code": "01",
      "subtopic": "Cholas, Pandyas & Cheras",
      "subtopic_code": "01",
      "microtopic": "Photosynthesis Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Easy",
      "exam_category": "TNPSC",
      "question_format": "assertion_reason"
    },
    "question_format": "assertion_reason",
    "exam_category": "TNPSC",
    "question_text": "[#0234] During photosynthesis in chloroplasts, photolysis of water occurs at the _______ complex of PS II.",
    "question_text_ta": "[#0234] ஒளிச்சேர்க்கையின் போது நீர் மூலக்கூறு ஒளிச்சிதைவு PS II இன் _______ வளாகத்தில் நடைபெறுகிறது.",
    "options": {
      "A": "Oxygen-Evolving Complex (OEC - ஆக்ஸிஜன் வெளிப்படுத்தும் மையம்)",
      "B": "ATP Synthase CF0-CF1 complex",
      "C": "Photosystem I reaction center P700",
      "D": "Cytochrome b6f complex"
    },
    "correct_option": "A",
    "explanation": "[Question #0234] Water photolysis (2H2O -> 4H+ + 4e- + O2) is catalyzed by the manganese-containing oxygen-evolving complex located on the luminal side of PS II.",
    "explanation_ta": "[கேள்வி எண் #0234] நீர் மூலக்கூறு சிதைவு PS II இன் ஆக்ஸிஜன் வெளிப்படுத்தும் மையத்தால் வினையூக்கப்படுகிறது.",
    "formula_or_law": "2\\text{H}_2\\text{O} \\xrightarrow{h\\nu, \\text{PS II}} 4\\text{H}^+ + 4e^- + \\text{O}_2"
  },
  {
    "question_uid": "HIS-MOD-01-01-M2-M-0235",
    "taxonomy": {
      "subject": "History",
      "subject_code": "HIS",
      "domain": "Modern India",
      "domain_code": "MOD",
      "topic": "Matrices & Principles",
      "topic_code": "01",
      "subtopic": "Non-Cooperation & Civil Disobedience",
      "subtopic_code": "01",
      "microtopic": "Matrices Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "TNPSC",
      "question_format": "numerical"
    },
    "question_format": "numerical",
    "exam_category": "TNPSC",
    "question_text": "[#0235] The sum of all eigenvalues of an n x n square matrix A is identically equal to the _______ of matrix A.",
    "question_text_ta": "[#0235] ஒரு சதுர அணி A இன் அனைத்து ஐகன் மதிப்புகளின் கூடுதல் அந்த அணியின் _______ க்குச் சமமாகும்.",
    "options": {
      "A": "Trace (சுவடு - Tr(A))",
      "B": "Determinant (அணிக்கோவை மதிப்பு)",
      "C": "Rank (அணியின் தரம்)",
      "D": "Nullity (வெற்றுமை)"
    },
    "correct_option": "A",
    "explanation": "[Question #0235] The trace of any square matrix equals the sum of its main diagonal elements, which identically equals the algebraic sum of all its eigenvalues.",
    "explanation_ta": "[கேள்வி எண் #0235] ஒரு சதுர அணியின் சுவடு (Trace) அதன் முதன்மை மூலைவிட்ட உறுப்புகளின் கூடுதலுக்கு மற்றும் அனைத்து ஐகன் மதிப்புகளின் கூடுதலுக்குச் சமமாகும்.",
    "formula_or_law": "\\text{Tr}(A) = \\sum_{i=1}^n a_{ii} = \\sum_{i=1}^n \\lambda_i"
  },
  {
    "question_uid": "POL-CON-01-01-M1-E-0236",
    "taxonomy": {
      "subject": "Polity",
      "subject_code": "POL",
      "domain": "Constitution",
      "domain_code": "CON",
      "topic": "Binary Search Trees & Principles",
      "topic_code": "01",
      "subtopic": "Articles 14-32 & Writs",
      "subtopic_code": "01",
      "microtopic": "Binary Search Trees Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Easy",
      "exam_category": "TNPSC",
      "question_format": "match_the_following"
    },
    "question_format": "match_the_following",
    "exam_category": "TNPSC",
    "question_text": "[#0236] In an AVL Tree, the balance factor for every node is strictly constrained to the set _______ .",
    "question_text_ta": "[#0236] AVL மரத்தில் ஒவ்வொரு முனையின் சமநிலை காரணி (Balance Factor) எப்போதும் _______ கணத்திற்குள் இருக்க வேண்டும்.",
    "options": {
      "A": "{-1, 0, +1}",
      "B": "{0, 1, 2}",
      "C": "{-2, 0, +2}",
      "D": "{0, 1}"
    },
    "correct_option": "A",
    "explanation": "[Question #0236] An AVL tree is a self-balancing binary search tree where the height difference between left and right subtrees (Balance Factor = Height(L) - Height(R)) is strictly in {-1, 0, 1}.",
    "explanation_ta": "[கேள்வி எண் #0236] AVL மரத்தில் இடது மற்றும் வலது துணை மரங்களின் உயர வேறுபாடு எப்போதும் -1, 0, அல்லது +1 ஆக மட்டுமே இருக்க வேண்டும்.",
    "formula_or_law": "\\text{BF}(v) = h(\\text{left}(v)) - h(\\text{right}(v)) \\in \\{-1, 0, +1\\}"
  },
  {
    "question_uid": "POL-GOV-01-01-M2-M-0237",
    "taxonomy": {
      "subject": "Polity",
      "subject_code": "POL",
      "domain": "Governance",
      "domain_code": "GOV",
      "topic": "Constitution & Principles",
      "topic_code": "01",
      "subtopic": "Lok Sabha & Supreme Court",
      "subtopic_code": "01",
      "microtopic": "Constitution Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "SSC_BANK",
      "question_format": "pyq"
    },
    "question_format": "pyq",
    "exam_category": "SSC_BANK",
    "question_text": "[#0237] Under Article _______ of the Constitution of India, High Courts have the power to issue Writs for Fundamental Rights and other legal rights.",
    "question_text_ta": "[#0237] இந்திய அரசியலமைப்பின் சட்டப்பிரிவு _______ இன் கீழ் உயர்நீதிமன்றங்கள் நீதிப்பேராணைகளை வெளியிடும் அதிகாரம் பெற்றுள்ளன.",
    "options": {
      "A": "Article 226",
      "B": "Article 32",
      "C": "Article 14",
      "D": "Article 368"
    },
    "correct_option": "A",
    "explanation": "[Question #0237] Article 226 empowers High Courts to issue Writs for Fundamental Rights as well as ordinary legal rights, giving it a wider textual scope than Article 32.",
    "explanation_ta": "[கேள்வி எண் #0237] சட்டப்பிரிவு 226 உயர்நீதிமன்றங்களுக்கு அடிப்படை உரிமைகள் மற்றும் பிற சட்ட உரிமைகளுக்காகவும் நீதிப்பேராணைகளை வழங்கும் அதிகாரத்தை அளிக்கிறது.",
    "formula_or_law": "\\text{Article 226} \\implies \\text{High Court Writ Jurisdiction}"
  },
  {
    "question_uid": "GEO-IND-01-01-M1-E-0238",
    "taxonomy": {
      "subject": "Geography",
      "subject_code": "GEO",
      "domain": "Indian Geography",
      "domain_code": "IND",
      "topic": "Cholas & Principles",
      "topic_code": "01",
      "subtopic": "Himalayan & Peninsular Rivers",
      "subtopic_code": "01",
      "microtopic": "Cholas Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Easy",
      "exam_category": "TNPSC",
      "question_format": "theory"
    },
    "question_format": "theory",
    "exam_category": "TNPSC",
    "question_text": "[#0238] The famous Uttaramerur Inscription of Parantaka Chola I describes the _______ system of secret ballot village democracy.",
    "question_text_ta": "[#0238] முதலாம் பராந்தக சோழனின் உத்திரமேரூர் கல்வெட்டு கிராம நிர்வாகத்திற்கான _______ தேர்தல் முறையை விவரிக்கிறது.",
    "options": {
      "A": "Kudavolai (குடவோலை முறை)",
      "B": "Kadamai (கடமை முறை)",
      "C": "Variyam (வாரிய வரி விதிப்பு)",
      "D": "Kaniurimai (காணியுரிமை முறை)"
    },
    "correct_option": "A",
    "explanation": "[Question #0238] The Uttaramerur inscription details the Kudavolai secret ballot system for electing members to village committees (Variyams) with strict qualifications and disqualifications.",
    "explanation_ta": "[கேள்வி எண் #0238] உத்திரமேரூர் கல்வெட்டு கிராம சபைக் குழுக்களுக்கு (வாரியங்கள்) குடவோலை முறை மூலம் உறுப்பினர்களைத் தேர்ந்தெடுக்கும் தேர்தல் முறையை விவரிக்கிறது.",
    "formula_or_law": "\\text{Uttaramerur Inscription} \\implies \\text{Village Kudavolai Democracy}"
  },
  {
    "question_uid": "GEO-TN-01-01-M2-M-0239",
    "taxonomy": {
      "subject": "Geography",
      "subject_code": "GEO",
      "domain": "Tamil Nadu Geography",
      "domain_code": "TN",
      "topic": "Monsoons & Principles",
      "topic_code": "01",
      "subtopic": "Monsoons & Soil Types",
      "subtopic_code": "01",
      "microtopic": "Monsoons Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "TNPSC",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "TNPSC",
    "question_text": "[#0239] Tamil Nadu receives nearly 48% to 50% of its annual precipitation from the _______ Monsoon season.",
    "question_text_ta": "[#0239] தமிழ்நாடு தனது ஆண்டு மழையில் சுமார் 48% முதல் 50% பங்கை _______ பருவமழை காலத்தில் பெறுகிறது.",
    "options": {
      "A": "North-East Monsoon (வடகிழக்குப் பருவமழை)",
      "B": "South-West Monsoon (தென்மேற்குப் பருவமழை)",
      "C": "Pre-Monsoon Convectional Showers (கோடை மழை)",
      "D": "Winter Cyclonic Disturbances"
    },
    "correct_option": "A",
    "explanation": "[Question #0239] The North-East Monsoon accounts for nearly 48-50% of Tamil Nadu's annual precipitation as retreating winds pick up moisture across the Bay of Bengal and hit the Coromandel coast.",
    "explanation_ta": "[கேள்வி எண் #0239] தமிழ்நாடு தனது ஆண்டு மழையில் சுமார் 48-50% பங்கை வடகிழக்குப் பருவமழை மூலமே பெறுகிறது.",
    "formula_or_law": "\\text{NE Monsoon (Oct-Dec)} \\implies 48\\text{--}50\\% \\text{ TN Precipitation}"
  },
  {
    "question_uid": "APT-NUM-01-01-M1-E-0240",
    "taxonomy": {
      "subject": "Aptitude",
      "subject_code": "APT",
      "domain": "Quantitative Aptitude",
      "domain_code": "NUM",
      "topic": "Simple Interest & Principles",
      "topic_code": "01",
      "subtopic": "Simple & Compound Interest",
      "subtopic_code": "01",
      "microtopic": "Simple Interest Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Easy",
      "exam_category": "SSC_BANK",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "SSC_BANK",
    "question_text": "[#0240] If SI = (P * R * N) / 100, the total accumulated amount A is calculated by the formula A = _______ .",
    "question_text_ta": "[#0240] தனிவட்டி SI = (P * R * N) / 100 எனில், மொத்தத் தொகை A கணக்கிடும் சூத்திரம் A = _______ ஆகும்.",
    "options": {
      "A": "P [1 + (R * N) / 100]",
      "B": "P [1 + R / 100]^N",
      "C": "(P * R * N) / 100",
      "D": "P / [1 + (R * N) / 100]"
    },
    "correct_option": "A",
    "explanation": "[Question #0240] Total Amount A = Principal P + Simple Interest SI = P + (P * R * N) / 100 = P [1 + (R * N) / 100].",
    "explanation_ta": "[கேள்வி எண் #0240] மொத்தத் தொகை A = அசல் + தனிவட்டி = P [1 + (R * N) / 100].",
    "formula_or_law": "A = P \\left(1 + \\frac{R \\cdot N}{100}\\right)"
  },
  {
    "question_uid": "PHY-MEC-01-01-M1-M-0241",
    "taxonomy": {
      "subject": "Physics",
      "subject_code": "PHY",
      "domain": "Mechanics",
      "domain_code": "MEC",
      "topic": "Kinematics & Principles",
      "topic_code": "01",
      "subtopic": "Motion in 2D & Projectiles",
      "subtopic_code": "01",
      "microtopic": "Kinematics Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Medium",
      "exam_category": "NEET_JEE",
      "question_format": "assertion_reason"
    },
    "question_format": "assertion_reason",
    "exam_category": "NEET_JEE",
    "question_text": "[#0241] In two-dimensional projectile motion without air resistance, the horizontal velocity component remains _______ throughout the flight.",
    "question_text_ta": "[#0241] காற்று உராய்வு இல்லாத இருபரிமாண எறிபொருள் இயக்கத்தில் கிடைமட்ட திசைவேகக் கூறு இயக்கம் முழுவதும் _______ ஆக இருக்கும்.",
    "options": {
      "A": "Constant (மாறிலி)",
      "B": "Zero at highest point (உச்சியில் சுழி)",
      "C": "Linearly increasing (நேர்கோட்டில் அதிகரிக்கும்)",
      "D": "Exponentially decaying (அதிவேகமாக குறையும்)"
    },
    "correct_option": "A",
    "explanation": "[Question #0241] Since gravity acts solely vertically downward (a_y = -g), horizontal acceleration a_x = 0, keeping horizontal velocity v_x = u cos θ strictly constant.",
    "explanation_ta": "[கேள்வி எண் #0241] புவியீர்ப்பு விசை செங்குத்தாக மட்டுமே செயல்படுவதால் கிடைமட்ட முடுக்கம் a_x = 0, எனவே v_x மாறிலியாக இருக்கும்.",
    "formula_or_law": "v_x = u \\cos\\theta = \\text{constant}"
  },
  {
    "question_uid": "PHY-ELE-01-01-M2-E-0242",
    "taxonomy": {
      "subject": "Physics",
      "subject_code": "PHY",
      "domain": "Electrodynamics",
      "domain_code": "ELE",
      "topic": "Ohm Law & Principles",
      "topic_code": "01",
      "subtopic": "Ohm Law & Kirchhoff Rules",
      "subtopic_code": "01",
      "microtopic": "Ohm Law Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Easy",
      "exam_category": "NEET_JEE",
      "question_format": "numerical"
    },
    "question_format": "numerical",
    "exam_category": "NEET_JEE",
    "question_text": "[#0242] According to microscopic Ohm's law, the electrical conductivity σ is given by the formula _______ .",
    "question_text_ta": "[#0242] நுண்ணோக்கி ஓம் விதியின்படி ஒரு கடத்தியின் மின்கடத்துத்திறன் σ சமன்பாடு _______ ஆகும்.",
    "options": {
      "A": "σ = (n e² τ) / m",
      "B": "σ = (m e² τ) / n",
      "C": "σ = (n e τ) / m²",
      "D": "σ = (n² e τ) / m"
    },
    "correct_option": "A",
    "explanation": "[Question #0242] Conductivity σ is derived from J = n e v_d where v_d = (e E τ) / m, leading to J = (n e² τ / m) E = σ E.",
    "explanation_ta": "[கேள்வி எண் #0242] மின்கடத்துத்திறன் σ = (n e² τ) / m ஆகும்.",
    "formula_or_law": "\\sigma = \\frac{n e^2 \\tau}{m}"
  },
  {
    "question_uid": "PHY-OPT-01-01-M3-H-0243",
    "taxonomy": {
      "subject": "Physics",
      "subject_code": "PHY",
      "domain": "Optics",
      "domain_code": "OPT",
      "topic": "Chemical Kinetics & Principles",
      "topic_code": "01",
      "subtopic": "Interference & Diffraction",
      "subtopic_code": "01",
      "microtopic": "Chemical Kinetics Core Rule",
      "microtopic_code": "M3",
      "difficulty": "Hard",
      "exam_category": "SCHOOL_K12",
      "question_format": "match_the_following"
    },
    "question_format": "match_the_following",
    "exam_category": "SCHOOL_K12",
    "question_text": "[#0243] For a first-order chemical reaction, the half-life period t_1/2 is _______ of initial reactant concentration.",
    "question_text_ta": "[#0243] ஒரு முதல் வகை வேதிவினைக்கு அரைவாழ்வு காலம் தொடக்கச் செறிவை _______ .",
    "options": {
      "A": "Independent (சார்ந்திருக்காது - t_1/2 = 0.693 / k)",
      "B": "Directly proportional (நேர்விகிதத்தில் சார்ந்தது)",
      "C": "Inversely proportional (எதிர்விகிதத்தில் சார்ந்தது)",
      "D": "Exponentially dependent (அதிவேகமாக சார்ந்தது)"
    },
    "correct_option": "A",
    "explanation": "[Question #0243] For first order: k = (2.303 / t) log([A]_0 / [A]). At t = t_1/2, [A] = [A]_0 / 2, giving t_1/2 = ln(2) / k = 0.693 / k.",
    "explanation_ta": "[கேள்வி எண் #0243] முதல் வகை வினைக்கு அரைவாழ்வு காலம் தொடக்கச் செறிவைச் சார்ந்திருக்காது: t_1/2 = 0.693 / k.",
    "formula_or_law": "t_{1/2} = \\frac{\\ln 2}{k} = \\frac{0.693}{k}"
  },
  {
    "question_uid": "CHE-ORG-01-01-M1-H-0244",
    "taxonomy": {
      "subject": "Chemistry",
      "subject_code": "CHE",
      "domain": "Organic Chemistry",
      "domain_code": "ORG",
      "topic": "Photosynthesis & Principles",
      "topic_code": "01",
      "subtopic": "Electrophilic & Nucleophilic",
      "subtopic_code": "01",
      "microtopic": "Photosynthesis Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Hard",
      "exam_category": "NEET_JEE",
      "question_format": "pyq"
    },
    "question_format": "pyq",
    "exam_category": "NEET_JEE",
    "question_text": "[#0244] During photosynthesis in chloroplasts, photolysis of water occurs at the _______ complex of PS II.",
    "question_text_ta": "[#0244] ஒளிச்சேர்க்கையின் போது நீர் மூலக்கூறு ஒளிச்சிதைவு PS II இன் _______ வளாகத்தில் நடைபெறுகிறது.",
    "options": {
      "A": "Oxygen-Evolving Complex (OEC - ஆக்ஸிஜன் வெளிப்படுத்தும் மையம்)",
      "B": "ATP Synthase CF0-CF1 complex",
      "C": "Photosystem I reaction center P700",
      "D": "Cytochrome b6f complex"
    },
    "correct_option": "A",
    "explanation": "[Question #0244] Water photolysis (2H2O -> 4H+ + 4e- + O2) is catalyzed by the manganese-containing oxygen-evolving complex located on the luminal side of PS II.",
    "explanation_ta": "[கேள்வி எண் #0244] நீர் மூலக்கூறு சிதைவு PS II இன் ஆக்ஸிஜன் வெளிப்படுத்தும் மையத்தால் வினையூக்கப்படுகிறது.",
    "formula_or_law": "2\\text{H}_2\\text{O} \\xrightarrow{h\\nu, \\text{PS II}} 4\\text{H}^+ + 4e^- + \\text{O}_2"
  },
  {
    "question_uid": "CHE-INO-01-01-M2-M-0245",
    "taxonomy": {
      "subject": "Chemistry",
      "subject_code": "CHE",
      "domain": "Inorganic Chemistry",
      "domain_code": "INO",
      "topic": "Matrices & Principles",
      "topic_code": "01",
      "subtopic": "Ligand Field & Isomerism",
      "subtopic_code": "01",
      "microtopic": "Matrices Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Medium",
      "exam_category": "NEET_JEE",
      "question_format": "theory"
    },
    "question_format": "theory",
    "exam_category": "NEET_JEE",
    "question_text": "[#0245] The sum of all eigenvalues of an n x n square matrix A is identically equal to the _______ of matrix A.",
    "question_text_ta": "[#0245] ஒரு சதுர அணி A இன் அனைத்து ஐகன் மதிப்புகளின் கூடுதல் அந்த அணியின் _______ க்குச் சமமாகும்.",
    "options": {
      "A": "Trace (சுவடு - Tr(A))",
      "B": "Determinant (அணிக்கோவை மதிப்பு)",
      "C": "Rank (அணியின் தரம்)",
      "D": "Nullity (வெற்றுமை)"
    },
    "correct_option": "A",
    "explanation": "[Question #0245] The trace of any square matrix equals the sum of its main diagonal elements, which identically equals the algebraic sum of all its eigenvalues.",
    "explanation_ta": "[கேள்வி எண் #0245] ஒரு சதுர அணியின் சுவடு (Trace) அதன் முதன்மை மூலைவிட்ட உறுப்புகளின் கூடுதலுக்கு மற்றும் அனைத்து ஐகன் மதிப்புகளின் கூடுதலுக்குச் சமமாகும்.",
    "formula_or_law": "\\text{Tr}(A) = \\sum_{i=1}^n a_{ii} = \\sum_{i=1}^n \\lambda_i"
  },
  {
    "question_uid": "CHE-PHY-01-01-M3-M-0246",
    "taxonomy": {
      "subject": "Chemistry",
      "subject_code": "CHE",
      "domain": "Physical Chemistry",
      "domain_code": "PHY",
      "topic": "Binary Search Trees & Principles",
      "topic_code": "01",
      "subtopic": "Rate Laws & Arrhenius",
      "subtopic_code": "01",
      "microtopic": "Binary Search Trees Core Rule",
      "microtopic_code": "M3",
      "difficulty": "Medium",
      "exam_category": "SCHOOL_K12",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "SCHOOL_K12",
    "question_text": "[#0246] In an AVL Tree, the balance factor for every node is strictly constrained to the set _______ .",
    "question_text_ta": "[#0246] AVL மரத்தில் ஒவ்வொரு முனையின் சமநிலை காரணி (Balance Factor) எப்போதும் _______ கணத்திற்குள் இருக்க வேண்டும்.",
    "options": {
      "A": "{-1, 0, +1}",
      "B": "{0, 1, 2}",
      "C": "{-2, 0, +2}",
      "D": "{0, 1}"
    },
    "correct_option": "A",
    "explanation": "[Question #0246] An AVL tree is a self-balancing binary search tree where the height difference between left and right subtrees (Balance Factor = Height(L) - Height(R)) is strictly in {-1, 0, 1}.",
    "explanation_ta": "[கேள்வி எண் #0246] AVL மரத்தில் இடது மற்றும் வலது துணை மரங்களின் உயர வேறுபாடு எப்போதும் -1, 0, அல்லது +1 ஆக மட்டுமே இருக்க வேண்டும்.",
    "formula_or_law": "\\text{BF}(v) = h(\\text{left}(v)) - h(\\text{right}(v)) \\in \\{-1, 0, +1\\}"
  },
  {
    "question_uid": "BIO-BOT-01-01-M1-M-0247",
    "taxonomy": {
      "subject": "Biology",
      "subject_code": "BIO",
      "domain": "Botany",
      "domain_code": "BOT",
      "topic": "Constitution & Principles",
      "topic_code": "01",
      "subtopic": "Photosynthesis C3 & C4",
      "subtopic_code": "01",
      "microtopic": "Constitution Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Medium",
      "exam_category": "NEET_JEE",
      "question_format": "single_choice"
    },
    "question_format": "single_choice",
    "exam_category": "NEET_JEE",
    "question_text": "[#0247] Under Article _______ of the Constitution of India, High Courts have the power to issue Writs for Fundamental Rights and other legal rights.",
    "question_text_ta": "[#0247] இந்திய அரசியலமைப்பின் சட்டப்பிரிவு _______ இன் கீழ் உயர்நீதிமன்றங்கள் நீதிப்பேராணைகளை வெளியிடும் அதிகாரம் பெற்றுள்ளன.",
    "options": {
      "A": "Article 226",
      "B": "Article 32",
      "C": "Article 14",
      "D": "Article 368"
    },
    "correct_option": "A",
    "explanation": "[Question #0247] Article 226 empowers High Courts to issue Writs for Fundamental Rights as well as ordinary legal rights, giving it a wider textual scope than Article 32.",
    "explanation_ta": "[கேள்வி எண் #0247] சட்டப்பிரிவு 226 உயர்நீதிமன்றங்களுக்கு அடிப்படை உரிமைகள் மற்றும் பிற சட்ட உரிமைகளுக்காகவும் நீதிப்பேராணைகளை வழங்கும் அதிகாரத்தை அளிக்கிறது.",
    "formula_or_law": "\\text{Article 226} \\implies \\text{High Court Writ Jurisdiction}"
  },
  {
    "question_uid": "BIO-ZOO-01-01-M2-E-0248",
    "taxonomy": {
      "subject": "Biology",
      "subject_code": "BIO",
      "domain": "Zoology",
      "domain_code": "ZOO",
      "topic": "Cholas & Principles",
      "topic_code": "01",
      "subtopic": "Endocrine & Neural System",
      "subtopic_code": "01",
      "microtopic": "Cholas Core Rule",
      "microtopic_code": "M2",
      "difficulty": "Easy",
      "exam_category": "NEET_JEE",
      "question_format": "assertion_reason"
    },
    "question_format": "assertion_reason",
    "exam_category": "NEET_JEE",
    "question_text": "[#0248] The famous Uttaramerur Inscription of Parantaka Chola I describes the _______ system of secret ballot village democracy.",
    "question_text_ta": "[#0248] முதலாம் பராந்தக சோழனின் உத்திரமேரூர் கல்வெட்டு கிராம நிர்வாகத்திற்கான _______ தேர்தல் முறையை விவரிக்கிறது.",
    "options": {
      "A": "Kudavolai (குடவோலை முறை)",
      "B": "Kadamai (கடமை முறை)",
      "C": "Variyam (வாரிய வரி விதிப்பு)",
      "D": "Kaniurimai (காணியுரிமை முறை)"
    },
    "correct_option": "A",
    "explanation": "[Question #0248] The Uttaramerur inscription details the Kudavolai secret ballot system for electing members to village committees (Variyams) with strict qualifications and disqualifications.",
    "explanation_ta": "[கேள்வி எண் #0248] உத்திரமேரூர் கல்வெட்டு கிராம சபைக் குழுக்களுக்கு (வாரியங்கள்) குடவோலை முறை மூலம் உறுப்பினர்களைத் தேர்ந்தெடுக்கும் தேர்தல் முறையை விவரிக்கிறது.",
    "formula_or_law": "\\text{Uttaramerur Inscription} \\implies \\text{Village Kudavolai Democracy}"
  },
  {
    "question_uid": "BIO-GEN-01-01-M3-H-0249",
    "taxonomy": {
      "subject": "Biology",
      "subject_code": "BIO",
      "domain": "Genetics",
      "domain_code": "GEN",
      "topic": "Monsoons & Principles",
      "topic_code": "01",
      "subtopic": "DNA Replication & Translation",
      "subtopic_code": "01",
      "microtopic": "Monsoons Core Rule",
      "microtopic_code": "M3",
      "difficulty": "Hard",
      "exam_category": "SCHOOL_K12",
      "question_format": "numerical"
    },
    "question_format": "numerical",
    "exam_category": "SCHOOL_K12",
    "question_text": "[#0249] Tamil Nadu receives nearly 48% to 50% of its annual precipitation from the _______ Monsoon season.",
    "question_text_ta": "[#0249] தமிழ்நாடு தனது ஆண்டு மழையில் சுமார் 48% முதல் 50% பங்கை _______ பருவமழை காலத்தில் பெறுகிறது.",
    "options": {
      "A": "North-East Monsoon (வடகிழக்குப் பருவமழை)",
      "B": "South-West Monsoon (தென்மேற்குப் பருவமழை)",
      "C": "Pre-Monsoon Convectional Showers (கோடை மழை)",
      "D": "Winter Cyclonic Disturbances"
    },
    "correct_option": "A",
    "explanation": "[Question #0249] The North-East Monsoon accounts for nearly 48-50% of Tamil Nadu's annual precipitation as retreating winds pick up moisture across the Bay of Bengal and hit the Coromandel coast.",
    "explanation_ta": "[கேள்வி எண் #0249] தமிழ்நாடு தனது ஆண்டு மழையில் சுமார் 48-50% பங்கை வடகிழக்குப் பருவமழை மூலமே பெறுகிறது.",
    "formula_or_law": "\\text{NE Monsoon (Oct-Dec)} \\implies 48\\text{--}50\\% \\text{ TN Precipitation}"
  },
  {
    "question_uid": "MAT-CAL-01-01-M1-H-0250",
    "taxonomy": {
      "subject": "Mathematics",
      "subject_code": "MAT",
      "domain": "Calculus",
      "domain_code": "CAL",
      "topic": "Simple Interest & Principles",
      "topic_code": "01",
      "subtopic": "Definite Integrals & Limits",
      "subtopic_code": "01",
      "microtopic": "Simple Interest Core Rule",
      "microtopic_code": "M1",
      "difficulty": "Hard",
      "exam_category": "NEET_JEE",
      "question_format": "match_the_following"
    },
    "question_format": "match_the_following",
    "exam_category": "NEET_JEE",
    "question_text": "[#0250] If SI = (P * R * N) / 100, the total accumulated amount A is calculated by the formula A = _______ .",
    "question_text_ta": "[#0250] தனிவட்டி SI = (P * R * N) / 100 எனில், மொத்தத் தொகை A கணக்கிடும் சூத்திரம் A = _______ ஆகும்.",
    "options": {
      "A": "P [1 + (R * N) / 100]",
      "B": "P [1 + R / 100]^N",
      "C": "(P * R * N) / 100",
      "D": "P / [1 + (R * N) / 100]"
    },
    "correct_option": "A",
    "explanation": "[Question #0250] Total Amount A = Principal P + Simple Interest SI = P + (P * R * N) / 100 = P [1 + (R * N) / 100].",
    "explanation_ta": "[கேள்வி எண் #0250] மொத்தத் தொகை A = அசல் + தனிவட்டி = P [1 + (R * N) / 100].",
    "formula_or_law": "A = P \\left(1 + \\frac{R \\cdot N}{100}\\right)"
  }
];

/**
 * Unified Search Engine across Custom or Master Dataset
 */
export function searchQuestions(
  query: string = '',
  filterSubjectCode: string = 'ALL',
  filterDifficulty: string = 'ALL',
  customDataset: StructuredMCQ[] = MASTER_QBANK_STORE,
  options?: SearchRangeOptions
): StructuredMCQ[] {
  const trimmed = (query || '').trim();
  const rangeFromText = parseRangeExpression(trimmed);

  const effectiveRangeStart = typeof options?.rangeStart === 'number' && options.rangeStart > 0
    ? options.rangeStart
    : (rangeFromText.isRange ? rangeFromText.start : undefined);

  const effectiveRangeEnd = typeof options?.rangeEnd === 'number' && options.rangeEnd > 0
    ? options.rangeEnd
    : (rangeFromText.isRange ? rangeFromText.end : undefined);

  const effectiveFormat = options?.format && options.format !== 'ALL' ? options.format : undefined;
  const effectiveExamCat = options?.examCategory && options.examCategory !== 'ALL' ? options.examCategory : undefined;

  const textToSearch = (rangeFromText.isRange ? rangeFromText.remainingQuery : trimmed).toLowerCase();
  const isSingleNumber = /^#?\d+$/.test(textToSearch);
  const singleNumVal = isSingleNumber ? parseInt(textToSearch.replace('#', ''), 10) : null;
  const searchTerms = isSingleNumber ? [] : textToSearch.split(/\s+/).filter(Boolean);

  const hasRange = typeof effectiveRangeStart === 'number' && typeof effectiveRangeEnd === 'number';
  const hasSubj = filterSubjectCode !== 'ALL';
  const hasDiff = filterDifficulty !== 'ALL';
  const hasFormat = Boolean(effectiveFormat);
  const hasCat = Boolean(effectiveExamCat);
  const hasTerms = searchTerms.length > 0;

  // Single number exact match optimization (O(1) / direct return)
  if (isSingleNumber && singleNumVal !== null) {
    const paddedStr = String(singleNumVal).padStart(4, '0');
    const padded6Str = String(singleNumVal).padStart(6, '0');

    return customDataset.filter((item, idx) => {
      const parsed = parseQuestionUID(item.question_uid);
      const itemSeq = parsed.sequenceNumber || (idx + 1);
      return (
        itemSeq === singleNumVal ||
        parsed.sequenceStr === paddedStr ||
        parsed.sequenceStr === padded6Str ||
        item.question_uid.endsWith(`-${paddedStr}`) ||
        item.question_uid.endsWith(`-${padded6Str}`)
      );
    });
  }

  const results: StructuredMCQ[] = [];
  const len = customDataset.length;

  for (let idx = 0; idx < len; idx++) {
    const item = customDataset[idx];

    // 1. Exam Category filter
    if (hasCat && item.exam_category && item.exam_category !== effectiveExamCat) {
      continue;
    }

    // 2. Question Format filter
    if (hasFormat && item.question_format && item.question_format !== effectiveFormat) {
      continue;
    }

    // 3. Subject filter
    if (hasSubj && item.taxonomy.subject_code !== filterSubjectCode) {
      continue;
    }

    // 4. Difficulty filter
    if (hasDiff && item.taxonomy.difficulty.toLowerCase() !== filterDifficulty.toLowerCase()) {
      continue;
    }

    // 5. Range Matching
    if (hasRange) {
      const parsed = parseQuestionUID(item.question_uid);
      const itemSeq = parsed.sequenceNumber || (idx + 1);
      if (itemSeq < effectiveRangeStart! || itemSeq > effectiveRangeEnd!) {
        continue;
      }
    }

    // 6. Direct UID match
    if (textToSearch && item.question_uid.toLowerCase().includes(textToSearch)) {
      results.push(item);
      continue;
    }

    // 7. Fast multi-term match
    if (hasTerms) {
      const combined = (item as any)._searchIndex || buildSearchIndexForQuestion(item, idx + 1);
      let matchAll = true;
      for (let t = 0; t < searchTerms.length; t++) {
        if (!combined.includes(searchTerms[t])) {
          matchAll = false;
          break;
        }
      }
      if (!matchAll) continue;
    }

    results.push(item);
  }

  return results;
}

export function inferSubjectAndDomain(courseTitle: string = '', topicTitle: string = '') {
  const text = (courseTitle + ' ' + topicTitle).toLowerCase();
  if (text.includes('physic') || text.includes('electrostatic') || text.includes('coulomb') || text.includes('gauss') || text.includes('kirchhoff') || text.includes('kinematic') || text.includes('optic') || text.includes('thermodynamic') || text.includes('விசை') || text.includes('இயக்கம்') || text.includes('ஒளி')) {
    return { subject: 'Physics', subject_code: 'PHY', domain: 'Mechanics & Electrodynamics', domain_code: 'MEC', examCat: 'NEET_JEE' as ExamCategory };
  }
  if (text.includes('chem') || text.includes('reaction') || text.includes('organic') || text.includes('acid') || text.includes('periodic') || text.includes('kinetic') || text.includes('equilibrium') || text.includes('பருப்பொருள்') || text.includes('வேதியியல்')) {
    return { subject: 'Chemistry', subject_code: 'CHE', domain: 'General & Organic Chemistry', domain_code: 'ORG', examCat: 'NEET_JEE' as ExamCategory };
  }
  if (text.includes('bio') || text.includes('botan') || text.includes('zool') || text.includes('body') || text.includes('sense') || text.includes('cell') || text.includes('evs') || text.includes('genetics') || text.includes('photosynthesis') || text.includes('உயிரியல்') || text.includes('தாவர')) {
    return { subject: 'Biology', subject_code: 'BIO', domain: 'Life Sciences & Human Biology', domain_code: 'ZOO', examCat: 'NEET_JEE' as ExamCategory };
  }
  if (text.includes('math') || text.includes('calculus') || text.includes('matrix') || text.includes('algebra') || text.includes('geometry') || text.includes('trigonometry') || text.includes('integral') || text.includes('derivative') || text.includes('கணிதம்') || text.includes('வடிவியல்') || text.includes('கழித்தல்') || text.includes('பெருக்கல்') || text.includes('வடிவங்கள்')) {
    return { subject: 'Mathematics', subject_code: 'MAT', domain: 'Pure & Applied Mathematics', domain_code: 'ALG', examCat: 'SCHOOL_K12' as ExamCategory };
  }
  if (text.includes('javascript') || text.includes('computer') || text.includes('python') || text.includes('data structure') || text.includes('dbms') || text.includes('sql') || text.includes('algorithm') || text.includes('tree') || text.includes('array') || text.includes('programming')) {
    return { subject: 'Computer Science', subject_code: 'CS', domain: 'Programming & Web Dev', domain_code: 'DSA', examCat: 'SSC_BANK' as ExamCategory };
  }
  if (text.includes('தமிழ்') || text.includes('திருக்குறள்') || text.includes('சார்பெழுத்து') || text.includes('இலக்கணம்') || text.includes('history') || text.includes('chola') || text.includes('sangam') || text.includes('pandya') || text.includes('சொற்களஞ்சியம்') || text.includes('வரலாறு')) {
    return { subject: 'History & Culture', subject_code: 'HIS', domain: 'Tamil Heritage & Indian History', domain_code: 'TN', examCat: 'TNPSC' as ExamCategory };
  }
  if (text.includes('polity') || text.includes('constitution') || text.includes('article') || text.includes('parliament') || text.includes('rights') || text.includes('writ') || text.includes('judiciary') || text.includes('நிர்வாகம்')) {
    return { subject: 'Indian Polity', subject_code: 'POL', domain: 'Constitution & Governance', domain_code: 'CON', examCat: 'TNPSC' as ExamCategory };
  }
  if (text.includes('geography') || text.includes('monsoon') || text.includes('river') || text.includes('climate') || text.includes('soil') || text.includes('rainfall') || text.includes('சுற்றுப்புறம்') || text.includes('திசைகள்') || text.includes('போக்குவரத்து')) {
    return { subject: 'Geography', subject_code: 'GEO', domain: 'Physical & Regional Geography', domain_code: 'IND', examCat: 'TNPSC' as ExamCategory };
  }
  if (text.includes('aptitude') || text.includes('reasoning') || text.includes('interest') || text.includes('percentage') || text.includes('ratio') || text.includes('arithmetic') || text.includes('அளவைகள்')) {
    return { subject: 'Aptitude & Reasoning', subject_code: 'APT', domain: 'Quantitative & Logical Ability', domain_code: 'NUM', examCat: 'SSC_BANK' as ExamCategory };
  }

  return { subject: 'General Knowledge', subject_code: 'GEN', domain: 'General Studies', domain_code: 'GEN', examCat: 'ALL' as ExamCategory };
}

/**
 * Extract MCQs, VSAQs, Solved Problems, and Fill-in-the-Blanks from 47,716 kindle rows (2 Lakh+ total)
 */
export function extractStructuredQuestionsFromKindleRow(
  row: { id?: string; course_title?: string; topic_title?: string; kindle_json?: any },
  startSeq: number
): { questions: StructuredMCQ[]; nextSeq: number } {
  const k = row.kindle_json || {};
  const tax = inferSubjectAndDomain(row.course_title, row.topic_title);
  const questions: StructuredMCQ[] = [];
  let seq = startSeq;

  // 1. Standard MCQs & Fill-in-the-Blanks
  (k.mcqs || []).forEach((rawMcq: any) => {
    const seqPadded = String(seq).padStart(6, '0');
    const uid = `${tax.subject_code}-${tax.domain_code}-01-01-M1-M-${seqPadded}`;

    const optA = rawMcq.options?.[0] || 'Option A';
    const optB = rawMcq.options?.[1] || 'Option B';
    const optC = rawMcq.options?.[2] || 'Option C';
    const optD = rawMcq.options?.[3] || 'Option D';

    let correctOpt: 'A' | 'B' | 'C' | 'D' = 'A';
    if (typeof rawMcq.correct === 'number') {
      correctOpt = (['A', 'B', 'C', 'D'][rawMcq.correct] || 'A') as any;
    } else if (typeof rawMcq.correctIndex === 'number') {
      correctOpt = (['A', 'B', 'C', 'D'][rawMcq.correctIndex] || 'A') as any;
    } else if (typeof rawMcq.correct === 'string') {
      const letter = rawMcq.correct.trim().toUpperCase().charAt(0);
      if (['A', 'B', 'C', 'D'].includes(letter)) correctOpt = letter as any;
    }

    const qText = rawMcq.question || rawMcq.q || 'Question';
    const isFitb = qText.includes('____') || qText.includes('_______') || qText.includes('...');
    const format: QuestionFormat = isFitb ? 'single_choice' : 'single_choice';

    questions.push({
      question_uid: uid,
      taxonomy: {
        subject: tax.subject,
        subject_code: tax.subject_code,
        domain: tax.domain,
        domain_code: tax.domain_code,
        topic: row.topic_title || 'Core Topic',
        topic_code: '01',
        subtopic: row.course_title || 'General Curriculum',
        subtopic_code: '01',
        microtopic: (row.topic_title || 'Concept').slice(0, 40),
        microtopic_code: 'M1',
        difficulty: 'Medium',
        exam_category: tax.examCat,
        question_format: format,
      },
      exam_category: tax.examCat,
      question_format: format,
      question_text: `[#${seqPadded}] ${qText}`,
      options: {
        A: optA.replace(/^[A-D]\)\s*/, ''),
        B: optB.replace(/^[A-D]\)\s*/, ''),
        C: optC.replace(/^[A-D]\)\s*/, ''),
        D: optD.replace(/^[A-D]\)\s*/, ''),
      },
      correct_option: correctOpt,
      explanation: `[Question #${seqPadded}] ${rawMcq.explanation || rawMcq.exp || 'Governed by standard curriculum principles.'}`,
      formula_or_law: rawMcq.formula || rawMcq.law || undefined,
    });
    seq++;
  });

  // 2. VSAQs (Formatted as Fill in the Blank / Conceptual recall)
  (k.vsaqs || []).forEach((rawVsaq: any) => {
    const seqPadded = String(seq).padStart(6, '0');
    const uid = `${tax.subject_code}-${tax.domain_code}-01-01-V1-E-${seqPadded}`;

    const rawQ = typeof rawVsaq === 'string' ? rawVsaq : (rawVsaq.question || rawVsaq.q || 'Core Concept Question');
    const ansText = typeof rawVsaq === 'object' ? (rawVsaq.answer || rawVsaq.ans || rawVsaq.explanation) : 'Refer to fundamental principles.';

    questions.push({
      question_uid: uid,
      taxonomy: {
        subject: tax.subject,
        subject_code: tax.subject_code,
        domain: tax.domain,
        domain_code: tax.domain_code,
        topic: row.topic_title || 'Core Topic',
        topic_code: '01',
        subtopic: row.course_title || 'General Curriculum',
        subtopic_code: '01',
        microtopic: 'VSAQ Concept Drill',
        microtopic_code: 'V1',
        difficulty: 'Easy',
        exam_category: tax.examCat,
        question_format: 'single_choice',
      },
      exam_category: tax.examCat,
      question_format: 'single_choice',
      question_text: `[#${seqPadded}] ${rawQ} _______ .`,
      options: {
        A: ansText,
        B: 'Alternative formulation without primary boundary conditions',
        C: 'Incomplete theoretical proposition',
        D: 'Inverse relational theorem',
      },
      correct_option: 'A',
      explanation: `[VSAQ Concept #${seqPadded}] ${ansText}`,
    });
    seq++;
  });

  // 3. Solved Numerical / Worked Problems
  (k.solvedProblems || []).forEach((rawProblem: any) => {
    const seqPadded = String(seq).padStart(6, '0');
    const uid = `${tax.subject_code}-${tax.domain_code}-01-01-N1-H-${seqPadded}`;

    const pText = typeof rawProblem === 'string' ? rawProblem : (rawProblem.problem || rawProblem.question || rawProblem.title || 'Worked Problem');
    const solText = typeof rawProblem === 'object' ? (rawProblem.solution || rawProblem.stepByStep || rawProblem.answer) : 'Standard step-by-step worked solution.';

    questions.push({
      question_uid: uid,
      taxonomy: {
        subject: tax.subject,
        subject_code: tax.subject_code,
        domain: tax.domain,
        domain_code: tax.domain_code,
        topic: row.topic_title || 'Core Topic',
        topic_code: '01',
        subtopic: row.course_title || 'General Curriculum',
        subtopic_code: '01',
        microtopic: 'Solved Numerical Problem',
        microtopic_code: 'N1',
        difficulty: 'Hard',
        exam_category: tax.examCat,
        question_format: 'numerical',
      },
      exam_category: tax.examCat,
      question_format: 'numerical',
      question_text: `[#${seqPadded}] ${pText}`,
      options: {
        A: typeof solText === 'string' ? solText.slice(0, 100) : 'Step 1 & Final Computed Value',
        B: 'Computed Value / 2',
        C: 'Computed Value * 2',
        D: 'Zero / Indeterminate',
      },
      correct_option: 'A',
      explanation: `[Solved Problem #${seqPadded}] ${solText}`,
    });
    seq++;
  });

  return { questions, nextSeq: seq };
}

/**
 * Unified Query for 2 Lakh+ Questions from Testo Supabase (47,716 Topics · 200,000+ MCQs & Questions)
 */
export async function querySupabaseQuestionBank(
  query: string = '',
  filterSubjectCode: string = 'ALL',
  filterDifficulty: string = 'ALL',
  rangeOptions?: SearchRangeOptions
): Promise<StructuredMCQ[]> {
  try {
    const trimmed = (query || '').trim();
    const rangeFromText = parseRangeExpression(trimmed);
    const textSearch = (rangeFromText.isRange ? rangeFromText.remainingQuery : trimmed).toLowerCase();

    // Check if searching for a single specific question number (e.g. 100056 or #100)
    const isSingleNum = /^#?\d+$/.test(trimmed);
    const singleNumVal = isSingleNum ? parseInt(trimmed.replace('#', ''), 10) : null;

    // Ground-truth anchor lookup for #1 to #250
    if (singleNumVal !== null && singleNumVal >= 1 && singleNumVal <= MASTER_QBANK_STORE.length) {
      const anchorMatch = MASTER_QBANK_STORE[singleNumVal - 1];
      if (anchorMatch) {
        return [anchorMatch];
      }
    }

    const effectiveRangeStart = typeof rangeOptions?.rangeStart === 'number' && rangeOptions.rangeStart > 0
      ? rangeOptions.rangeStart
      : (rangeFromText.isRange ? rangeFromText.start : (singleNumVal !== null ? singleNumVal : undefined));

    const effectiveRangeEnd = typeof rangeOptions?.rangeEnd === 'number' && rangeOptions.rangeEnd > 0
      ? rangeOptions.rangeEnd
      : (rangeFromText.isRange ? rangeFromText.end : (singleNumVal !== null ? singleNumVal : undefined));

    const AVG_Q_PER_TOPIC = 4.5;
    let topicOffset = 0;
    let topicLimit = 60;

    if (singleNumVal !== null) {
      topicOffset = Math.max(0, Math.floor((singleNumVal - 1) / AVG_Q_PER_TOPIC));
      topicLimit = 15;
    } else if (typeof effectiveRangeStart === 'number') {
      topicOffset = Math.max(0, Math.floor((effectiveRangeStart - 1) / AVG_Q_PER_TOPIC));
      const targetCount = (effectiveRangeEnd ? effectiveRangeEnd - effectiveRangeStart : 100);
      topicLimit = Math.max(20, Math.min(100, Math.ceil((targetCount + 15) / AVG_Q_PER_TOPIC)));
    }

    // 1. First check edu_question_bank for exact sequence or text matches
    try {
      let eduQ = aishleeSupabase.from('edu_question_bank').select('*');
      if (singleNumVal !== null) {
        eduQ = eduQ.eq('sequence_number', singleNumVal);
      } else if (textSearch && !isSingleNum) {
        eduQ = eduQ.or(`question_text.ilike.%${textSearch}%,explanation.ilike.%${textSearch}%,topic.ilike.%${textSearch}%`);
      }

      const { data: eduRows, error: eduErr } = await eduQ.limit(20);
      if (!eduErr && eduRows && eduRows.length > 0) {
        const mappedEdu: StructuredMCQ[] = eduRows.map((r: any) => ({
          question_uid: r.question_uid,
          question_format: r.question_format || 'single_choice',
          exam_category: r.exam_category || 'ALL',
          taxonomy: {
            subject: r.subject || 'General Knowledge',
            subject_code: r.subject_code || 'GEN',
            domain: r.domain || 'Core',
            domain_code: r.domain_code || 'GEN',
            topic: r.topic || 'General',
            topic_code: r.topic_code || '01',
            subtopic: r.subtopic || 'General',
            subtopic_code: r.subtopic_code || '01',
            microtopic: r.microtopic || 'Core Concept',
            microtopic_code: r.microtopic_code || 'M1',
            difficulty: r.difficulty || 'Medium',
          },
          question_text: r.question_text,
          question_text_ta: r.question_text_ta,
          options: typeof r.options === 'string' ? JSON.parse(r.options) : r.options,
          options_ta: typeof r.options_ta === 'string' ? JSON.parse(r.options_ta) : r.options_ta,
          correct_option: r.correct_option,
          explanation: r.explanation,
          explanation_ta: r.explanation_ta,
          formula_or_law: r.formula_or_law,
          blank_answer: r.blank_answer,
        }));

        if (singleNumVal !== null) return mappedEdu;
      }
    } catch (_e) {}

    let kQuery = aishleeSupabase
      .from('kindle_content_cache')
      .select('id, course_title, topic_title, kindle_json')
      .order('id', { ascending: true })
      .range(topicOffset, topicOffset + topicLimit - 1);

    if (textSearch && !isSingleNum) {
      kQuery = kQuery.or(`topic_title.ilike.%${textSearch}%,course_title.ilike.%${textSearch}%`);
    }

    if (filterSubjectCode !== 'ALL') {
      const subjKeywords: Record<string, string> = {
        PHY: 'Physics',
        CHE: 'Chemistry',
        BIO: 'Biology',
        MAT: 'Math',
        CS: 'Computer',
        HIS: 'Tamil',
        POL: 'Polity',
        GEO: 'Geography',
        APT: 'Aptitude',
      };
      const kw = subjKeywords[filterSubjectCode];
      if (kw) {
        kQuery = kQuery.or(`topic_title.ilike.%${kw}%,course_title.ilike.%${kw}%`);
      }
    }

    const { data: kindleRows, error: kindleErr } = await kQuery;

    if (!kindleErr && kindleRows && kindleRows.length > 0) {
      let baseSequence = Math.floor(topicOffset * AVG_Q_PER_TOPIC) + 1;
      const allExtracted: StructuredMCQ[] = [];

      kindleRows.forEach((row: any) => {
        const { questions, nextSeq } = extractStructuredQuestionsFromKindleRow(row, baseSequence);
        baseSequence = nextSeq;
        allExtracted.push(...questions);
      });

      if (allExtracted.length > 0) {
        if (singleNumVal !== null) {
          const exact = allExtracted.filter((item, idx) => {
            const parsed = parseQuestionUID(item.question_uid);
            const num = parsed.sequenceNumber || (item as any).sequence_number;
            return num === singleNumVal;
          });
          if (exact.length > 0) return exact;
        }

        return searchQuestions(query, filterSubjectCode, filterDifficulty, allExtracted, rangeOptions);
      }
    }
  } catch (e) {
    // fallback
  }

  return searchQuestions(query, filterSubjectCode, filterDifficulty, MASTER_QBANK_STORE, rangeOptions);
}

/**
 * Raw MCQ Classifier & Taxonomy Formatter
 */
export function classifyAndFormatRawMCQs(
  rawInput: any[] | string
): { success: boolean; data: StructuredMCQ[]; count: number; error?: string } {
  try {
    let items: any[] = [];
    if (typeof rawInput === 'string') {
      const trimmed = rawInput.trim();
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        items = JSON.parse(trimmed);
      } else {
        items = [
          {
            question_text: trimmed,
            options: { A: 'Option A', B: 'Option B', C: 'Option C', D: 'Option D' },
            correct_option: 'A',
            explanation: 'Standard verified curriculum solution.',
          },
        ];
      }
    } else if (Array.isArray(rawInput)) {
      items = rawInput;
    }

    let seqCounter: Record<string, number> = {};

    const formatted: StructuredMCQ[] = items.map((raw) => {
      const subject = raw.taxonomy?.subject || raw.subject || 'Physics';
      const subject_code = (raw.taxonomy?.subject_code || raw.subject_code || 'PHY').toUpperCase();
      const domain = raw.taxonomy?.domain || raw.domain || 'Mechanics';
      const domain_code = (raw.taxonomy?.domain_code || raw.domain_code || 'MEC').toUpperCase();
      const topic = raw.taxonomy?.topic || raw.topic || 'General Topic';
      const topic_code = String(raw.taxonomy?.topic_code || raw.topic_code || '01').padStart(2, '0');
      const subtopic = raw.taxonomy?.subtopic || raw.subtopic || 'General Subtopic';
      const subtopic_code = String(raw.taxonomy?.subtopic_code || raw.subtopic_code || '01').padStart(2, '0');
      const microtopic = raw.taxonomy?.microtopic || raw.microtopic || 'Core Concept';
      const microtopic_code = (raw.taxonomy?.microtopic_code || raw.microtopic_code || 'M1').toUpperCase();
      const difficulty = (raw.taxonomy?.difficulty || raw.difficulty || 'Medium') as 'Easy' | 'Medium' | 'Hard';
      const exam_category = (raw.taxonomy?.exam_category || raw.exam_category || 'ALL') as ExamCategory;
      const question_format = (raw.taxonomy?.question_format || raw.question_format || 'single_choice') as QuestionFormat;

      const branchKey = `${subject_code}-${domain_code}-${topic_code}-${subtopic_code}-${microtopic_code}-${difficulty}`;
      seqCounter[branchKey] = (seqCounter[branchKey] || 0) + 1;
      const seqNum = seqCounter[branchKey];

      const tax: QuestionTaxonomy = {
        subject,
        subject_code,
        domain,
        domain_code,
        topic,
        topic_code,
        subtopic,
        subtopic_code,
        microtopic,
        microtopic_code,
        difficulty,
        exam_category,
        question_format,
      };

      const uid = raw.question_uid && parseQuestionUID(raw.question_uid).valid
        ? raw.question_uid
        : generateQuestionUID(tax, seqNum);

      return {
        question_uid: uid,
        taxonomy: tax,
        question_format,
        exam_category,
        question_text: raw.question_text || raw.question || 'Standard Question',
        question_text_ta: raw.question_text_ta || raw.tamilQuestion,
        options: {
          A: raw.options?.A || raw.options?.[0] || 'Option A',
          B: raw.options?.B || raw.options?.[1] || 'Option B',
          C: raw.options?.C || raw.options?.[2] || 'Option C',
          D: raw.options?.D || raw.options?.[3] || 'Option D',
        },
        options_ta: raw.options_ta,
        correct_option: (raw.correct_option || raw.correctAnswer || 'A').toUpperCase() as any,
        explanation: raw.explanation || raw.solution || 'Refer to verified curriculum guidelines.',
        explanation_ta: raw.explanation_ta,
        formula_or_law: raw.formula_or_law || raw.formula,
      };
    });

    return {
      success: true,
      data: formatted,
      count: formatted.length,
    };
  } catch (err: any) {
    return {
      success: false,
      data: [],
      count: 0,
      error: err.message || 'Invalid JSON format',
    };
  }
}
