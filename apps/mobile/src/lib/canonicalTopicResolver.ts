/**
 * TeachO Canonical Micro-Topic Resolver & Deduplication Engine
 * Maps various course/grade micro-topics to normalized canonical domain keys.
 * Enables zero-redundancy content generation and instant cross-course reuse.
 */

export interface CanonicalTopicDefinition {
  canonicalKey: string;
  domain: 'math' | 'science_evs' | 'tamil' | 'phonics_english' | 'activity_moral' | 'coding_tech' | 'polity_exam' | 'general';
  standardTitle: string;
  standardSubject: string;
  videoId: string;
  videoTitle: string;
  keywords: string[];
}

export const CANONICAL_TOPIC_REGISTRY: CanonicalTopicDefinition[] = [
  // ─── 1. PRIMARY MATHEMATICS (TOPIC-SPECIFIC CHAPTERS) ─────────────────────
  {
    canonicalKey: 'canonical_math_addition_subtraction',
    domain: 'math',
    standardTitle: 'Addition & Subtraction Adventures (1 to 20)',
    standardSubject: 'Mathematics',
    videoId: 'igcoDFokKzM',
    videoTitle: 'Basic Addition & Subtraction For Kids | Kindergarten Math',
    keywords: [
      'addition & subtraction',
      'addition and subtraction',
      'addition adventures',
      'subtraction adventures',
      'addition',
      'subtraction',
      'add and subtract',
      'plus',
      'minus',
      'taking away',
      'putting together',
      'carrying over',
      'number line jumps',
      'கூட்டல் மற்றும் கழித்தல்',
      'கூட்டலும் கழித்தலும்',
      'கூட்டல்',
      'கழித்தல்',
    ],
  },
  {
    canonicalKey: 'canonical_math_multiplication_division',
    domain: 'math',
    standardTitle: 'Multiplication Tables & Division Play',
    standardSubject: 'Mathematics',
    videoId: 'eW2LzZ5e6jY',
    videoTitle: 'Multiplication & Division Made Easy For Kids',
    keywords: [
      'multiplication tables',
      'multiplication and division',
      'multiplication',
      'division',
      'multiply',
      'divide',
      'tables 2 to 10',
      'repeated addition',
      'equal sharing',
      'பெருக்கல்',
      'வகுத்தல்',
      'வாய்ப்பாடு',
    ],
  },
  {
    canonicalKey: 'canonical_math_shapes_patterns',
    domain: 'math',
    standardTitle: '2D & 3D Shapes, Space & Patterns',
    standardSubject: 'Mathematics',
    videoId: 'WTeqUejf3D0',
    videoTitle: 'Learn 2D and 3D Shapes For Kids | Math Shapes Song',
    keywords: [
      'shapes, space & patterns',
      'shapes and patterns',
      '2d shapes',
      '3d shapes',
      'circle, square, triangle',
      'cube, cone, cylinder',
      'symmetry',
      'shape',
      'shapes',
      'வடிவங்கள்',
      'வடிவியல்',
      'சமச்சீர்',
    ],
  },
  {
    canonicalKey: 'canonical_math_fractions_measurement',
    domain: 'math',
    standardTitle: 'Fractions, Money & Measurement',
    standardSubject: 'Mathematics',
    videoId: 'Vm8YpmsqVl4',
    videoTitle: 'Fractions, Money & Measurement For Kids',
    keywords: [
      'fractions, money & measurement',
      'fractions and money',
      'fraction',
      'fractions',
      'half (1/2)',
      'quarter (1/4)',
      'rupee notes',
      'money calculation',
      'length (m/cm)',
      'weight (kg/g)',
      'clock time reading',
      'பின்னங்கள்',
      'ரூபாய்',
      'அளவீடுகள்',
    ],
  },
  {
    canonicalKey: 'canonical_math_counting_1_100',
    domain: 'math',
    standardTitle: 'Number Magic & Counting (1 to 100)',
    standardSubject: 'Mathematics',
    videoId: '0TgLtF3PMOc',
    videoTitle: 'Numbers 1 to 20 Song | Counting Numbers For Kids',
    keywords: [
      'number magic & counting',
      'counting with objects',
      'forward & backward counting',
      'before, after and between',
      'number names in words',
      'tens and ones',
      'counting',
      '1 to 20',
      '1 to 100',
      'எண்கள் 1 முதல்',
      'எண்ணுதல்',
    ],
  },

  // ─── 2. PRIMARY EVS & SCIENCE (TOPIC-SPECIFIC CHAPTERS) ───────────────────
  {
    canonicalKey: 'canonical_evs_five_senses',
    domain: 'science_evs',
    standardTitle: 'My Amazing Body & Five Senses',
    standardSubject: 'Science & EVS',
    videoId: 'q1xNuU7gaAQ',
    videoTitle: 'The Five Senses | The Dr. Binocs Show',
    keywords: [
      'my amazing body & five senses',
      'amazing body',
      'five senses',
      'sense organs',
      'eyes, ears, nose',
      'good touch',
      'dental & body hygiene',
      'புலன்கள்',
      'ஐம்புலன்கள்',
      'உடல் உறுப்புகள்',
    ],
  },
  {
    canonicalKey: 'canonical_evs_plant_kingdom',
    domain: 'science_evs',
    standardTitle: 'Plant Kingdom & Nature Friends',
    standardSubject: 'Science & EVS',
    videoId: 'X6TLFZUC9gI',
    videoTitle: 'Parts of a Plant | The Dr. Binocs Show',
    keywords: [
      'plant kingdom & nature friends',
      'plant kingdom',
      'parts of a plant',
      'root, stem, leaf',
      'germination',
      'photosynthesis',
      'trees, shrubs, herbs',
      'தாவர உலகம்',
      'செடிகள்',
      'மரங்கள்',
      'இலைகள்',
      'ஒளிச்சேர்க்கை',
    ],
  },
  {
    canonicalKey: 'canonical_evs_animal_world',
    domain: 'science_evs',
    standardTitle: 'Animal World & Habitats',
    standardSubject: 'Science & EVS',
    videoId: 'yK8_mN9g4g0',
    videoTitle: 'Animals for Kids | Wild, Domestic and Farm Animals',
    keywords: [
      'animal world & habitats',
      'animal world',
      'domestic, wild and farm',
      'birds, insects and water',
      'herbivore, carnivore',
      'விலங்கு உலகம்',
      'விலங்குகள்',
      'பறவைகள்',
      'வாழிடம்',
    ],
  },
  {
    canonicalKey: 'canonical_evs_water_weather',
    domain: 'science_evs',
    standardTitle: 'Water, Air & Weather Seasons',
    standardSubject: 'Science & EVS',
    videoId: 'zBnKgwnn7i4',
    videoTitle: 'Water Cycle, Air & Four Seasons for Kids',
    keywords: [
      'water, air & weather seasons',
      'water cycle',
      'sources of fresh water',
      'four seasons in india',
      'air has weight',
      'நீர் மற்றும் காற்று',
      'பருவகாலங்கள்',
      'மழை',
    ],
  },
  {
    canonicalKey: 'canonical_evs_community_helpers',
    domain: 'science_evs',
    standardTitle: 'Our Community, Family & Safety Rules',
    standardSubject: 'Science & EVS',
    videoId: 'jt2q1cWsH6U',
    videoTitle: 'Community Helpers & Road Safety For Kids',
    keywords: [
      'our community, family & safety',
      'community helpers',
      'my loving family',
      'traffic signals and road safety',
      'clean earth & recycling',
      'நமது சமூகம்',
      'குடும்பம்',
      'சாலை பாதுகாப்பு',
    ],
  },

  // ─── 3. PRIMARY TAMIL FOUNDATIONS ─────────────────────────────────────────
  {
    canonicalKey: 'canonical_tamil_uyir_ezhuthu',
    domain: 'tamil',
    standardTitle: 'தமிழ் உயிர் எழுத்துகள் (12) & ஆய்த எழுத்து (ஃ)',
    standardSubject: 'தமிழ் பாடம்',
    videoId: '_sF-D_oN-2Y',
    videoTitle: 'தமிழ் உயிர் எழுத்துகள் பாடல் (அ முதல் ஔ வரை) | Infobells',
    keywords: [
      'உயிர் எழுத்துகள் (12)',
      'உயிர் எழுத்துகள்',
      'ஆய்த எழுத்து (ஃ)',
      'அ முதல் ஔ வரை',
      'உயிர் எழுத்து',
      'uyir ezhuthu',
    ],
  },
  {
    canonicalKey: 'canonical_tamil_mei_ezhuthu',
    domain: 'tamil',
    standardTitle: 'தமிழ் மெய் எழுத்துகள் (18) & வல்லினம், மெல்லினம், இடையினம்',
    standardSubject: 'தமிழ் பாடம்',
    videoId: 'bU92Pjh_qZk',
    videoTitle: 'தமிழ் மெய் எழுத்துகள் பாடல் (க் முதல் ன் வரை)',
    keywords: [
      'மெய் எழுத்துகள் (18)',
      'மெய் எழுத்துகள்',
      'க் முதல் ன்',
      'வல்லினம்',
      'மெல்லினம்',
      'இடையினம்',
      'mei ezhuthu',
    ],
  },
  {
    canonicalKey: 'canonical_tamil_aathichudi_kural',
    domain: 'tamil',
    standardTitle: 'ஔவையாரின் ஆத்திசூடி & எளிய திருக்குறள் கதைகள்',
    standardSubject: 'தமிழ் பாடம்',
    videoId: 'E9Jk2Xv8U2M',
    videoTitle: 'ஔவையார் ஆத்திசூடி விளக்கக் கதைகள்',
    keywords: [
      'ஔவையார் ஆத்திசூடி',
      'ஆத்திசூடி',
      'திருக்குறள் கதைகள்',
      'அறஞ்செய விரும்பு',
      'aathichudi',
      'thirukkural',
    ],
  },

  // ─── 4. PRIMARY PHONICS & ENGLISH ─────────────────────────────────────────
  {
    canonicalKey: 'canonical_phonics_az_sounds',
    domain: 'phonics_english',
    standardTitle: 'Alphabet Letter Sounds A-Z & Phonics Song',
    standardSubject: 'English Phonics',
    videoId: 'BELlZKpi1Zs',
    videoTitle: 'Phonics Song with TWO Words - A For Apple - ABC Alphabet Songs',
    keywords: ['phonics sounds a-z', 'alphabet sounds', 'letter sound', 'abc phonics', 'phonics'],
  },
  {
    canonicalKey: 'canonical_phonics_cvc_words',
    domain: 'phonics_english',
    standardTitle: 'CVC 3-Letter Word Blending & Sight Words',
    standardSubject: 'English Phonics',
    videoId: 'qWn-gx44wEc',
    videoTitle: 'CVC Words | Phonics 3-Letter Blending For Kindergarten',
    keywords: ['cvc 3-letter', 'cvc words', 'sight words', 'word blending', '3-letter words'],
  },

  // ─── 5. KIDS BEDTIME & MORAL ACTIVITY ─────────────────────────────────────
  {
    canonicalKey: 'canonical_activity_bedtime_story',
    domain: 'activity_moral',
    standardTitle: 'Bedtime Moral Story & Creative Hands-on Craft',
    standardSubject: 'Creative Lab & Moral Values',
    videoId: 'qV3puciQoMM',
    videoTitle: 'The Thirsty Crow & Moral Stories For Children',
    keywords: ['bedtime moral story', 'bedtime recap', 'creative lab', 'hands-on craft', 'moral stories'],
  },

  // ─── 6. HIGH SCHOOL SCIENCE & MATH ────────────────────────────────────────
  {
    canonicalKey: 'canonical_science_newton_laws',
    domain: 'science_evs',
    standardTitle: "Newton's Three Laws of Motion & Gravitational Mechanics",
    standardSubject: 'Physics & Science',
    videoId: 'kKKM8Y-u7ds',
    videoTitle: "Newton's Laws of Motion | Physics Crash Course",
    keywords: ['newton laws of motion', 'laws of motion', 'inertia', 'f=ma', 'gravity', 'நியூட்டன் விதிகள்'],
  },
  {
    canonicalKey: 'canonical_math_quadratic_equations',
    domain: 'math',
    standardTitle: 'Quadratic Equations, Factorization & Quadratic Formula',
    standardSubject: 'Mathematics',
    videoId: 'I_nJ7t-eD5E',
    videoTitle: 'Quadratic Equations - Solving by Factoring and Formula',
    keywords: ['quadratic equations', 'factorization', 'quadratic formula', 'இருபடிச் சமன்பாடுகள்'],
  },

  // ─── 7. COMPUTER SCIENCE & CODING ─────────────────────────────────────────
  {
    canonicalKey: 'canonical_cs_python_basics',
    domain: 'coding_tech',
    standardTitle: 'Python Programming Foundations: Variables, Loops & Functions',
    standardSubject: 'Computer Science & AI',
    videoId: '_uQrJ0TkZlc',
    videoTitle: 'Python Tutorial for Beginners - Full Course in 1 Hour',
    keywords: ['python programming', 'python', 'scratch 3.0', 'variables and loops', 'functions in python'],
  },
  {
    canonicalKey: 'canonical_cs_data_structures',
    domain: 'coding_tech',
    standardTitle: 'Data Structures & Algorithms: Arrays, Stacks, Queues & Big-O',
    standardSubject: 'Computer Science',
    videoId: '8hly31xKli0',
    videoTitle: 'Data Structures and Algorithms for Beginners',
    keywords: ['data structures & algorithms', 'dsa', 'arrays, stacks, queues', 'big-o notation', 'linked list'],
  },

  // ─── 8. INDIAN POLITY & COMPETITIVE EXAMS ──────────────────────────────────
  {
    canonicalKey: 'canonical_polity_fundamental_rights',
    domain: 'polity_exam',
    standardTitle: 'Indian Constitution: Fundamental Rights (Articles 14 to 32) & Writs',
    standardSubject: 'Indian Polity & General Studies',
    videoId: 'MjhvG73P_pM',
    videoTitle: 'Fundamental Rights Articles 12 to 35 | Indian Polity',
    keywords: ['fundamental rights (articles 14 to 32)', 'fundamental rights', 'writs in constitution', 'article 14 to 32', 'அடிப்படை உரிமைகள்'],
  },
];

/**
 * Resolve any topic/subject string to its Canonical Topic Key and Definition.
 * Uses high-precision topic-first matching and scoring to prevent cross-topic collisions.
 */
export function resolveCanonicalTopic(topic: string, subject: string, courseTitle: string = ''): CanonicalTopicDefinition {
  const t = (topic || '').toLowerCase().trim();
  const s = (subject || '').toLowerCase().trim();

  let bestMatch: CanonicalTopicDefinition | null = null;
  let highestScore = 0;

  // 1. Check EXACT or high-confidence keyword match on TOPIC FIRST (Highest priority)
  for (const def of CANONICAL_TOPIC_REGISTRY) {
    for (const kw of def.keywords) {
      const lowerKw = kw.toLowerCase();
      if (t.includes(lowerKw)) {
        // Score by keyword length so specific multi-word phrases win
        const score = lowerKw.length * 10;
        if (score > highestScore) {
          highestScore = score;
          bestMatch = def;
        }
      }
    }
  }

  if (bestMatch && highestScore >= 30) {
    return bestMatch;
  }

  // 2. If topic had weak match, check subject with topic combined
  for (const def of CANONICAL_TOPIC_REGISTRY) {
    for (const kw of def.keywords) {
      const lowerKw = kw.toLowerCase();
      if (s.includes(lowerKw) || t.includes(lowerKw)) {
        const score = lowerKw.length * 2;
        if (score > highestScore) {
          highestScore = score;
          bestMatch = def;
        }
      }
    }
  }

  if (bestMatch) {
    return bestMatch;
  }

  // 3. Clean fallback canonical key
  const sanitizedTopic = (topic || 'general')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  const sanitizedSubject = (subject || 'academic')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return {
    canonicalKey: `canonical_${sanitizedSubject}_${sanitizedTopic}`,
    domain: 'general',
    standardTitle: topic || 'Academic Masterclass Lesson',
    standardSubject: subject || 'Academic',
    videoId: '0aJ_y0k5S_g',
    videoTitle: `${topic || 'Lesson'} Masterclass`,
    keywords: [topic, subject],
  };
}
