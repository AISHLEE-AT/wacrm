/**
 * TeachO Universal Content & Question Bank Search Service
 * Blazing-fast multi-index search across:
 * 1. 96+ Master Courses & Curricula
 * 2. Micro-topics, Chapters, Axioms, Governing Laws, Formulas
 * 3. Question Bank MCQs, PYQs, and Practice Questions (Bilingual EN/TA)
 */

import { ALL_COURSES, CourseOption } from '../data/coursesCatalog';
import { resolveCompleteCourseSyllabus } from '../data/curriculum/courseSyllabusRegistry';
import { MASTER_TEACHO_COURSES } from '../data/curriculum/masterCurriculumRegistry';
import { lmsSupabase as aishleeSupabase } from '../lib/lms-supabase';

export interface ContentSearchResult {
  id: string;
  courseId: string;
  courseTitle: string;
  category: string;
  subject: string;
  chapterTitle: string;
  topicTitle: string;
  subtopic?: string;
  keyAxiom?: string;
  keyFormulaOrLaw?: string;
  keyPoints?: string[];
  dayNumber?: number;
  periodNumber?: number;
}

export interface McqSearchResult {
  id: string;
  question: string;
  question_ta?: string;
  options: string[];
  answer: string;
  correctIndex?: number;
  explanation: string;
  subject: string;
  topicTitle: string;
  courseTitle?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  examTag?: string;
}

// ─── STATIC CORE QUESTION BANK FOR OFFLINE & INSTANT SEARCH ───────────────────
export const STATIC_QUESTION_BANK: McqSearchResult[] = [
  // Science / Physics / Chemistry / Biology
  {
    id: 'mcq_sci_1',
    question: 'In thermodynamics, which law establishes that energy cannot be created or destroyed, only transformed?',
    question_ta: 'வெப்ப இயக்கவியலில், ஆற்றலை உருவாக்கவோ அழிக்கவோ முடியாது, மாற்ற மட்டுமே முடியும் என்பதை எந்த விதி நிறுவுகிறது?',
    options: ['A) First Law of Thermodynamics', 'B) Second Law of Thermodynamics', 'C) Zeroth Law of Thermodynamics', 'D) Third Law of Thermodynamics'],
    answer: 'A) First Law of Thermodynamics',
    correctIndex: 0,
    explanation: 'The First Law of Thermodynamics is the universal law of conservation of energy: ΔU = Q - W.',
    subject: 'Physics',
    topicTitle: 'Laws of Thermodynamics & Conservation of Energy',
    courseTitle: 'Class 11 & 12 Science',
    difficulty: 'Easy',
    examTag: 'NEET / JEE / Board'
  },
  {
    id: 'mcq_sci_2',
    question: 'What is the rate of change of momentum of a body directly proportional to according to Newton\'s Second Law?',
    question_ta: 'நியூட்டனின் இரண்டாம் விதியின்படி, ஒரு பொருளின் உந்த மாறுபாட்டு வீதம் எதற்கு நேர்விகிதத்தில் இருக்கும்?',
    options: ['A) Applied external force', 'B) Mass of the object', 'C) Velocity squared', 'D) Gravitational potential'],
    answer: 'A) Applied external force',
    correctIndex: 0,
    explanation: 'Newton\'s Second Law states: Force = mass × acceleration (F = dp/dt = ma).',
    subject: 'Physics',
    topicTitle: 'Newton\'s Laws of Motion',
    courseTitle: 'Class 9 to 12 Science',
    difficulty: 'Easy',
    examTag: 'CBSE / TNSB / NEET'
  },
  {
    id: 'mcq_sci_3',
    question: 'Which organelle is known as the powerhouse of the cell due to ATP synthesis?',
    question_ta: 'ATP உற்பத்தி காரணமாக செல்லின் ஆற்றல் மையம் (Powerhouse) என்று அழைக்கப்படும் செல் உறுப்பு எது?',
    options: ['A) Mitochondria', 'B) Endoplasmic Reticulum', 'C) Golgi Apparatus', 'D) Ribosome'],
    answer: 'A) Mitochondria',
    correctIndex: 0,
    explanation: 'Mitochondria generate most of the cell\'s chemical energy in the form of Adenosine Triphosphate (ATP) via cellular respiration.',
    subject: 'Biology',
    topicTitle: 'Cell Biology & Cellular Respiration',
    courseTitle: 'Class 9 & 10 Science',
    difficulty: 'Easy',
    examTag: 'Board / NEET'
  },
  {
    id: 'mcq_sci_4',
    question: 'What is the chemical formula for quicklime and its reaction product with water (slaked lime)?',
    question_ta: 'சுட்ட சுண்ணாம்பின் வேதியியல் வாய்ப்பாடு மற்றும் அது நீருடன் வினைபுரியும் போது கிடைக்கும் நீற்று சுண்ணாம்பின் வாய்ப்பாடு என்ன?',
    options: ['A) CaO and Ca(OH)2', 'B) CaCO3 and CaO', 'C) CaCl2 and Ca(OH)2', 'D) CaSO4 and CaO'],
    answer: 'A) CaO and Ca(OH)2',
    correctIndex: 0,
    explanation: 'Quicklime is Calcium Oxide (CaO). CaO + H2O → Ca(OH)2 (Calcium Hydroxide / Slaked Lime) with release of heat.',
    subject: 'Chemistry',
    topicTitle: 'Chemical Reactions and Equations',
    courseTitle: 'Class 10 Science',
    difficulty: 'Medium',
    examTag: 'Class 10 Board / SSLC'
  },
  {
    id: 'mcq_sci_5',
    question: 'During photosynthesis, which wavelength range of light is most effectively absorbed by chlorophyll pigments?',
    question_ta: 'ஒளிச்சேர்க்கையின் போது, பச்சைய நிறமிகளால் மிகவும் திறம்பட உறிஞ்சப்படும் ஒளியின் அலைநீள வரம்பு எது?',
    options: ['A) Blue (430–450 nm) and Red (640–660 nm)', 'B) Green (500–550 nm)', 'C) Infrared (>750 nm)', 'D) Ultraviolet (<380 nm)'],
    answer: 'A) Blue (430–450 nm) and Red (640–660 nm)',
    correctIndex: 0,
    explanation: 'Chlorophyll a and b absorb maximally in the blue-violet and red regions of the visible spectrum and reflect green light.',
    subject: 'Biology',
    topicTitle: 'Photosynthesis & Plant Physiology',
    courseTitle: 'Class 11 & 12 Biology',
    difficulty: 'Medium',
    examTag: 'NEET / Board'
  },

  // Mathematics
  {
    id: 'mcq_math_1',
    question: 'If a triangle has sides of lengths a, b, and c with right angle opposite to c, what is the Pythagoras theorem statement?',
    question_ta: 'ஒரு செங்கோண முக்கோணத்தில் பக்கங்களின் நீளம் a, b மற்றும் கர்ணம் c எனில், பிதாகரஸ் தேற்றத்தின் சமன்பாடு எது?',
    options: ['A) c^2 = a^2 + b^2', 'B) c = a + b', 'C) c^2 = a^2 - b^2', 'D) a^2 = b^2 + c^2'],
    answer: 'A) c^2 = a^2 + b^2',
    correctIndex: 0,
    explanation: 'Pythagoras Theorem: In a right-angled triangle, the square of the hypotenuse is equal to the sum of the squares of the other two sides.',
    subject: 'Mathematics',
    topicTitle: 'Pythagoras Theorem & Trigonometry',
    courseTitle: 'Class 8 to 10 Mathematics',
    difficulty: 'Easy',
    examTag: 'Class 10 Board'
  },
  {
    id: 'mcq_math_2',
    question: 'What is the sum of the first n natural numbers?',
    question_ta: 'முதல் n இயல் எண்களின் கூடுதல் காணும் வாய்ப்பாடு எது?',
    options: ['A) n(n+1)/2', 'B) n(n-1)/2', 'C) (n(n+1)/2)^2', 'D) n^2'],
    answer: 'A) n(n+1)/2',
    correctIndex: 0,
    explanation: 'Sum of first n natural numbers S_n = 1 + 2 + 3 + ... + n = n(n + 1) / 2.',
    subject: 'Mathematics',
    topicTitle: 'Arithmetic Progressions & Special Series',
    courseTitle: 'Class 10 Mathematics',
    difficulty: 'Easy',
    examTag: 'SSLC / CBSE'
  },
  {
    id: 'mcq_math_3',
    question: 'If the discriminant Δ = b^2 - 4ac of a quadratic equation ax^2 + bx + c = 0 is greater than 0 (Δ > 0), what is the nature of its roots?',
    question_ta: 'இருபடிச் சமன்பாடு ax^2 + bx + c = 0 இன் தன்மைகாட்டி Δ = b^2 - 4ac > 0 எனில், மூலங்களின் தன்மை யாது?',
    options: ['A) Real and Unequal (மெய் மற்றும் சமமற்றவை)', 'B) Real and Equal (மெய் மற்றும் சமமானவை)', 'C) No Real Roots (மெய் மூலங்கள் இல்லை)', 'D) Imaginary only (கற்பனை மட்டுமே)'],
    answer: 'A) Real and Unequal (மெய் மற்றும் சமமற்றவை)',
    correctIndex: 0,
    explanation: 'When discriminant b^2 - 4ac > 0, the quadratic equation possesses two distinct real roots.',
    subject: 'Mathematics',
    topicTitle: 'Quadratic Equations & Nature of Roots',
    courseTitle: 'Class 10 & 11 Mathematics',
    difficulty: 'Medium',
    examTag: 'Class 10 SSLC / CBSE'
  },

  // General Tamil / தமிழ் இலக்கியம் & இலக்கணம்
  {
    id: 'mcq_ta_1',
    question: 'தமிழ் மொழியில் உள்ள மொத்த உயிர் எழுத்துக்கள் மற்றும் மெய் எழுத்துக்களின் எண்ணிக்கை முறையே யாவை?',
    question_ta: 'தமிழ் மொழியில் உள்ள மொத்த உயிர் எழுத்துக்கள் மற்றும் மெய் எழுத்துக்களின் எண்ணிக்கை முறையே யாவை?',
    options: ['A) 12 மற்றும் 18', 'B) 18 மற்றும் 12', 'C) 12 மற்றும் 216', 'D) 216 மற்றும் 1'],
    answer: 'A) 12 மற்றும் 18',
    correctIndex: 0,
    explanation: 'தமிழ் மொழியில் உயிர் எழுத்துக்கள் 12 (அ முதல் ஔ வரை), மெய் எழுத்துக்கள் 18 (க் முதல் ன் வரை), ஆய்த எழுத்து 1 (ஃ), உயிர்மெய் 216 ஆக மொத்தம் 247 எழுத்துக்கள் உள்ளன.',
    subject: 'தமிழ் (Tamil)',
    topicTitle: 'உயிர் மற்றும் மெய் எழுத்துக்கள் (தமிழ் இலக்கணம்)',
    courseTitle: 'Samacheer Kalvi & TNPSC General Tamil',
    difficulty: 'Easy',
    examTag: 'TNPSC Group 4 / School'
  },
  {
    id: 'mcq_ta_2',
    question: 'திருக்குறளில் உள்ள மொத்த அதிகாரங்கள் மற்றும் பாடல்களின் எண்ணிக்கை யாது?',
    question_ta: 'திருக்குறளில் உள்ள மொத்த அதிகாரங்கள் மற்றும் பாடல்களின் எண்ணிக்கை யாது?',
    options: ['A) 133 அதிகாரங்கள், 1330 குறள்கள்', 'B) 130 அதிகாரங்கள், 1300 குறள்கள்', 'C) 100 அதிகாரங்கள், 1000 குறள்கள்', 'D) 150 அதிகாரங்கள், 1500 குறள்கள்'],
    answer: 'A) 133 அதிகாரங்கள், 1330 குறள்கள்',
    correctIndex: 0,
    explanation: 'திருவள்ளுவர் இயற்றிய திருக்குறள் 3 பால்கள் (அறத்துப்பால், பொருட்பால், காமத்துப்பால்), 133 அதிகாரங்கள் மற்றும் 1330 குறட்பாக்களைக் கொண்டது.',
    subject: 'தமிழ் (Tamil)',
    topicTitle: 'திருக்குறள் இலக்கியச் சிறப்புகள்',
    courseTitle: 'TNPSC & School Tamil',
    difficulty: 'Easy',
    examTag: 'TNPSC Group 1, 2, 4'
  },
  {
    id: 'mcq_ta_3',
    question: '"செந்தமிழ் நாடெனும் போதினிலே - இன்பத் தேன்வந்து பாயுது காதினிலே" என்ற புகழ்மிக்க தேசபக்திப் பாடலை இயற்றியவர் யார்?',
    question_ta: '"செந்தமிழ் நாடெனும் போதினிலே - இன்பத் தேன்வந்து பாயுது காதினிலே" என்ற புகழ்மிக்க பாடலை இயற்றியவர் யார்?',
    options: ['A) மகாகவி சுப்பிரமணிய பாரதியார்', 'B) பாரதிதாசன்', 'C) நாமக்கல் கவிஞர்', 'D) கவிமணி தேசிக விநாயகம் பிள்ளை'],
    answer: 'A) மகாகவி சுப்பிரமணிய பாரதியார்',
    correctIndex: 0,
    explanation: 'மகாகவி பாரதியார் தமிழ்நாட்டின் பெருமையையும் தேசிய ஒருமைப்பாட்டையும் போற்றி இப்பாடலை இயற்றினார்.',
    subject: 'தமிழ் (Tamil)',
    topicTitle: 'பாரதியார் கவிதைகள் & தேசிய இயக்கம்',
    courseTitle: 'TNPSC Group 2/4 & 10th Tamil',
    difficulty: 'Easy',
    examTag: 'TNPSC / Board'
  },

  // TNPSC & Indian Polity / History
  {
    id: 'mcq_polity_1',
    question: 'Which Article of the Indian Constitution is referred to as the "Heart and Soul of the Constitution" by Dr. B.R. Ambedkar?',
    question_ta: 'டாக்டர் பி.ஆர். அம்பேத்கர் அவர்களால் "இந்திய அரசியலமைப்பின் இதயம் மற்றும் ஆன்மா" என்று வர்ணிக்கப்பட்ட சட்டப்பிரிவு எது?',
    options: ['A) Article 32 (Right to Constitutional Remedies)', 'B) Article 21 (Right to Life and Personal Liberty)', 'C) Article 14 (Equality before Law)', 'D) Article 19 (Right to Freedom)'],
    answer: 'A) Article 32 (Right to Constitutional Remedies)',
    correctIndex: 0,
    explanation: 'Article 32 empowers citizens to move the Supreme Court directly via writs (Habeas Corpus, Mandamus, Prohibition, Quo-Warranto, Certiorari) for the enforcement of Fundamental Rights.',
    subject: 'Indian Polity',
    topicTitle: 'Fundamental Rights & Constitutional Remedies (Article 32)',
    courseTitle: 'TNPSC Group 1, 2, 4 & UPSC',
    difficulty: 'Medium',
    examTag: 'TNPSC / UPSC'
  },
  {
    id: 'mcq_polity_2',
    question: 'Who founded the Swadeshi Steam Navigation Company in Tuticorin (1906) to challenge British monopoly?',
    question_ta: 'பிரிட்டிஷ் கப்பல் போக்குவரத்தின் ஏகபோக உரிமையை எதிர்த்து தூத்துக்குடியில் சுதேசி நீராவிக் கப்பல் நிறுவனத்தை (1906) நிறுவியவர் யார்?',
    options: ['A) V.O. Chidambaram Pillai (வ.உ. சிதம்பரம் பிள்ளை)', 'B) Subramania Siva (சுப்பிரமணிய சிவா)', 'C) Tiruppur Kumaran (திருப்பூர் குமரன்)', 'D) Rajaji (இராஜாஜி)'],
    answer: 'A) V.O. Chidambaram Pillai (வ.உ. சிதம்பரம் பிள்ளை)',
    correctIndex: 0,
    explanation: 'V.O. Chidambaram Pillai (Kappalottiya Tamizhan) launched the S.S. Gallia and S.S. Lawoe between Tuticorin and Colombo in 1906.',
    subject: 'History & Culture',
    topicTitle: 'Indian National Movement in Tamil Nadu — V.O.C',
    courseTitle: 'TNPSC Unit 8 & Indian History',
    difficulty: 'Easy',
    examTag: 'TNPSC Group 1, 2, 4'
  }
];

export const POPULAR_KEYWORDS = [
  'உயிர் எழுத்துக்கள்',
  'Pythagoras Theorem',
  'Newton\'s Laws',
  'Photosynthesis',
  'Article 32 Polity',
  'Quadratic Equations',
  'திருக்குறள்',
  'V.O. Chidambaram',
  'Mitochondria ATP',
  'Thermodynamics',
  'Periodic Table',
  'Indus Valley',
  'Tamil Nadu Heritage',
  'Chemical Reactions'
];

/**
 * Fast in-memory curriculum content search across all courses and syllabi
 */
export function searchCurriculumContent(
  query: string,
  filterCategory: string = 'all'
): ContentSearchResult[] {
  const cleanQuery = (query || '').trim().toLowerCase();
  if (!cleanQuery) return [];

  const results: ContentSearchResult[] = [];
  const seenIds = new Set<string>();

  // 1. Search in ALL_COURSES and their syllabus registry
  for (const course of ALL_COURSES) {
    if (filterCategory !== 'all' && course.category !== filterCategory) {
      // Allow cross-match if query specifically matches
    }

    try {
      const syllabus = resolveCompleteCourseSyllabus(course.id, course.title);
      if (syllabus && syllabus.subjects) {
        for (const subj of syllabus.subjects) {
          for (const ch of subj.chapters || []) {
            const chTitle = ch.chapterTitle || ch.title || '';
            const chDesc = ch.description || '';
            const chMatch =
              chTitle.toLowerCase().includes(cleanQuery) ||
              chDesc.toLowerCase().includes(cleanQuery) ||
              subj.subjectName.toLowerCase().includes(cleanQuery);

            // Collect all micro topics from both direct ch.microTopics and ch.subtopics[].microTopics
            const allMicroTopics: any[] = [...(ch.microTopics || [])];
            for (const st of ch.subtopics || []) {
              const stTitle = st.title || '';
              if (stTitle.toLowerCase().includes(cleanQuery)) {
                // If subtopic title matches, include it
                const uniqueStId = `${course.id}_${subj.subjectId}_${ch.chapterNumber || chTitle}_st_${st.id || stTitle}`;
                if (!seenIds.has(uniqueStId)) {
                  seenIds.add(uniqueStId);
                  results.push({
                    id: uniqueStId,
                    courseId: course.id,
                    courseTitle: course.title,
                    category: course.category,
                    subject: subj.subjectName,
                    chapterTitle: chTitle,
                    topicTitle: stTitle,
                    subtopic: chDesc,
                    keyAxiom: '',
                    keyFormulaOrLaw: '',
                    keyPoints: [],
                    dayNumber: 1,
                    periodNumber: 1,
                  });
                }
              }
              if (st.microTopics) {
                allMicroTopics.push(...st.microTopics);
              }
            }

            for (const mt of allMicroTopics) {
              const topicTitle = mt.topicTitle || mt.title || '';
              const subtopic = mt.subtopic || '';
              const axiom = mt.keyAxiom || '';
              const formula = mt.keyFormulaOrLaw || '';
              const points = Array.isArray(mt.keyPoints) ? mt.keyPoints.join(' ') : '';

              const topicMatch =
                topicTitle.toLowerCase().includes(cleanQuery) ||
                subtopic.toLowerCase().includes(cleanQuery) ||
                axiom.toLowerCase().includes(cleanQuery) ||
                formula.toLowerCase().includes(cleanQuery) ||
                points.toLowerCase().includes(cleanQuery);

              if (topicMatch || chMatch) {
                const uniqueId = `${course.id}_${subj.subjectId}_${ch.chapterNumber || chTitle}_${mt.id || topicTitle}`;
                if (!seenIds.has(uniqueId)) {
                  seenIds.add(uniqueId);
                  results.push({
                    id: uniqueId,
                    courseId: course.id,
                    courseTitle: course.title,
                    category: course.category,
                    subject: subj.subjectName,
                    chapterTitle: chTitle,
                    topicTitle: topicTitle || chTitle,
                    subtopic: subtopic || chDesc,
                    keyAxiom: axiom,
                    keyFormulaOrLaw: formula,
                    keyPoints: Array.isArray(mt.keyPoints) ? mt.keyPoints : [],
                    dayNumber: mt.dayNumber || 1,
                    periodNumber: mt.periodNumber || 1
                  });
                }
              }
            }
          }
        }
      }
    } catch (err) {
      // non-blocking
    }
  }

  // 2. Search in MASTER_TEACHO_COURSES
  for (const masterCourse of MASTER_TEACHO_COURSES) {
    if (masterCourse.days) {
      for (const day of masterCourse.days) {
        const titleMatch = day.topicTitle?.toLowerCase().includes(cleanQuery);
        const overviewMatch = day.overview?.toLowerCase().includes(cleanQuery);
        const subjectMatch = masterCourse.subject?.toLowerCase().includes(cleanQuery);
        const courseMatch = masterCourse.title?.toLowerCase().includes(cleanQuery);

        if (titleMatch || overviewMatch || subjectMatch || courseMatch) {
          const uniqueId = `master_${masterCourse.id}_day_${day.dayNumber}_task_${day.taskNumber}`;
          if (!seenIds.has(uniqueId)) {
            seenIds.add(uniqueId);
            results.push({
              id: uniqueId,
              courseId: masterCourse.id,
              courseTitle: masterCourse.title,
              category: masterCourse.category,
              subject: masterCourse.subject || 'Core Subject',
              chapterTitle: day.topicTitle,
              topicTitle: day.topicTitle,
              subtopic: day.overview ? day.overview.substring(0, 150) : '',
              keyAxiom: '',
              keyFormulaOrLaw: '',
              keyPoints: [],
              dayNumber: day.dayNumber,
              periodNumber: day.taskNumber
            });
          }
        }
      }
    }
  }

  return results.slice(0, 40);
}

/**
 * Fast search across Questions & MCQ Banks (Static + Database Query)
 */
export async function searchMcqQuestions(
  query: string,
  filterSubject: string = 'all'
): Promise<McqSearchResult[]> {
  const cleanQuery = (query || '').trim().toLowerCase();
  if (!cleanQuery) return STATIC_QUESTION_BANK.slice(0, 8);

  const matchedList: McqSearchResult[] = [];
  const seenQ = new Set<string>();

  // 1. Search local high-yield static bank
  for (const q of STATIC_QUESTION_BANK) {
    const qText = q.question.toLowerCase();
    const qTa = (q.question_ta || '').toLowerCase();
    const exp = (q.explanation || '').toLowerCase();
    const sub = (q.subject || '').toLowerCase();
    const top = (q.topicTitle || '').toLowerCase();
    const opt = (q.options || []).join(' ').toLowerCase();

    if (
      qText.includes(cleanQuery) ||
      qTa.includes(cleanQuery) ||
      exp.includes(cleanQuery) ||
      sub.includes(cleanQuery) ||
      top.includes(cleanQuery) ||
      opt.includes(cleanQuery)
    ) {
      seenQ.add(q.id);
      matchedList.push(q);
    }
  }

  // 2. Query Ultra-Fast OCI PostgreSQL Question Bank (30,145 Questions via GIN index)
  try {
    const isBrowser = typeof window !== 'undefined';
    const ociBase = isBrowser ? '' : 'https://mysupro.duckdns.org';
    const apiRes = await fetch(`${ociBase}/api/tuto/qbank/search?query=${encodeURIComponent(cleanQuery)}&limit=25`, { cache: 'no-store' });
    if (apiRes.ok) {
      const rows = await apiRes.json();
      if (Array.isArray(rows)) {
        for (const r of rows) {
          if (!seenQ.has(r.question_uid)) {
            seenQ.add(r.question_uid);
            const opts = typeof r.options === 'string' ? JSON.parse(r.options) : (r.options || {});
            const optList = [
              opts.A || opts[0] ? `A) ${opts.A || opts[0]}` : '',
              opts.B || opts[1] ? `B) ${opts.B || opts[1]}` : '',
              opts.C || opts[2] ? `C) ${opts.C || opts[2]}` : '',
              opts.D || opts[3] ? `D) ${opts.D || opts[3]}` : '',
            ].filter(Boolean);

            const correctLetter = (r.correct_option || 'A').toUpperCase();
            const correctIdx = correctLetter === 'B' ? 1 : correctLetter === 'C' ? 2 : correctLetter === 'D' ? 3 : 0;

            matchedList.push({
              id: r.question_uid,
              question: r.question_text,
              question_ta: r.question_text_ta,
              options: optList,
              answer: optList[correctIdx] || `Option ${correctLetter}`,
              correctIndex: correctIdx,
              explanation: r.explanation || `Core concept from ${r.topic || r.subject}.`,
              subject: r.subject || 'General Knowledge',
              topicTitle: r.topic || r.microtopic || 'Exam Question',
              courseTitle: r.exam_category || 'SuprO Question Bank',
              difficulty: (r.difficulty || 'Medium') as any,
              examTag: r.exam_category || 'Exam QBank'
            });
          }
        }
      }
    }
  } catch (err) {
    // Non-blocking fallback
  }

  return matchedList;
}
