/**
 * Master Real-World Academic Course Catalog with 5-Level Syllabus Hierarchy:
 * Course -> Units -> Chapters -> Topics -> Subtopics -> Micro-topics
 * Full coverage: CBSE (NCERT), TN Board (Tamil & English Medium), Web & AI Tech,
 * NEET/JEE, TNPSC/UPSC, College/Engineering, and Early Childhood.
 */

export interface MicroTopic {
  id: string;
  title: string;
  tamilTitle?: string;
  keyAxiom: string;
  formulaOrRule?: string;
  pyqFrequency?: 'High' | 'Very High' | 'Medium';
}

export interface SubTopic {
  id: string;
  title: string;
  tamilTitle?: string;
  microTopics: MicroTopic[];
}

export interface Chapter {
  id: string;
  chapterNumber: number | string;
  title: string;
  tamilTitle?: string;
  videoUrl?: string;
  youtubeId?: string;
  duration?: string;
  topics?: string[];
  subtopics?: SubTopic[];
}

export interface SyllabusUnit {
  id: string;
  unitNumber: number | string;
  title: string;
  tamilTitle?: string;
  subjectName: string;
  chapters: Chapter[];
}

export interface MasterCourse {
  id: string;
  title_name: string;
  tamil_title?: string;
  category: 'school' | 'entrance' | 'govt' | 'college' | 'skills' | 'others';
  subCategory?: string;
  standardOrExam?: string;
  boardOrAuthority?: string;
  description_purpose: string;
  links_data: string;
  youtube_id?: string;
  units: SyllabusUnit[];
}

// ----------------------------------------------------
// SYLLABUS RESOLVER FOR ALL 164 COURSES
// ----------------------------------------------------
export function getCourseSyllabus(courseTitle: string, category: string = ''): SyllabusUnit[] {
  const cleanTitle = courseTitle || 'Masterclass Course';
  const t = cleanTitle.toLowerCase();
  const cat = (category || '').toLowerCase();

  // 1. CBSE BOARD (NCERT Curriculum — LKG to Class 12)
  if (t.includes('cbse') || t.includes('ncert')) {
    const isKg = t.includes('lkg') || t.includes('ukg') || t.includes('kindergarten');
    const isPrimary = /\bclass\s*[1-5]\b/.test(t) || /\b[1-5](st|nd|rd|th)\s*standard/.test(t);
    const isMiddle = /\bclass\s*[6-8]\b/.test(t) || /\b[6-8]th\s*standard/.test(t);
    const isSSLC = /\bclass\s*(9|10)\b/.test(t) || /\bsslc\b/.test(t) || /\b(9|10)th\s*standard/.test(t);
    const isHSC = /\bclass\s*(11|12)\b/.test(t) || /\bhsc\b/.test(t) || /\bplus\s*(one|two|1|2)\b/.test(t);

    if (isKg) {
      return [
        { id: 'cbse_kg_u1', unitNumber: 'Unit 1', subjectName: 'English Phonics', title: 'Alphabet Recognition, Phonics Sounds & Simple Words',
          chapters: [
            { id: 'cbse_kg_c1', chapterNumber: 1, title: 'Alphabet A-Z: Recognition, Sounds & Writing', subtopics: [
              { id: 'cbse_kg_s1', title: 'Capital & Small Letters', microTopics: [
                { id: 'cbse_kg_m1', title: 'Letter Recognition A-M with Phonics Sounds', keyAxiom: 'Each letter has a name and a sound (phoneme).', pyqFrequency: 'Very High' },
                { id: 'cbse_kg_m2', title: 'Letter Recognition N-Z with Phonics Sounds', keyAxiom: 'Phonics builds the bridge between written letters and spoken sounds.', pyqFrequency: 'Very High' },
                { id: 'cbse_kg_m3', title: 'CVC Words: Cat, Bat, Mat — Blending 3-Letter Words', keyAxiom: 'Consonant-Vowel-Consonant (CVC) pattern is the foundation of early reading.', pyqFrequency: 'High' }
              ]}
            ]}
          ]
        },
        { id: 'cbse_kg_u2', unitNumber: 'Unit 2', subjectName: 'Mathematics (Numbers & Shapes)', title: 'Counting 1-50, Shapes, Colors & Patterns',
          chapters: [
            { id: 'cbse_kg_c2', chapterNumber: 2, title: 'Numbers 1-20 & 2D Shapes', subtopics: [
              { id: 'cbse_kg_s2', title: 'Number Sense', microTopics: [
                { id: 'cbse_kg_m4', title: 'Counting Objects 1-10: One-to-One Correspondence', keyAxiom: 'Each object gets exactly one count — the cardinality principle.', pyqFrequency: 'Very High' },
                { id: 'cbse_kg_m5', title: '2D Shapes: Circle, Triangle, Square — Properties', keyAxiom: 'Shapes are classified by the number of sides and corners.', pyqFrequency: 'High' }
              ]}
            ]}
          ]
        },
        { id: 'cbse_kg_u3', unitNumber: 'Unit 3', subjectName: 'EVS & Hindi', title: 'My Family, Body Parts & Hindi Alphabets',
          chapters: [
            { id: 'cbse_kg_c3', chapterNumber: 3, title: 'Five Senses & Hindi Swar (अ-अः)', subtopics: [
              { id: 'cbse_kg_s3', title: 'Self Awareness & Hindi', microTopics: [
                { id: 'cbse_kg_m6', title: 'Five Senses & Personal Hygiene Habits', keyAxiom: 'We use five senses to observe and interact with the world.', pyqFrequency: 'High' },
                { id: 'cbse_kg_m7', title: 'Hindi Swar अ आ इ ई — Recognition & Writing', keyAxiom: 'Hindi vowels (स्वर) form the phonetic base of the language.', pyqFrequency: 'Very High' }
              ]}
            ]}
          ]
        }
      ];
    }

    if (isHSC) {
      return [
        { id: 'cbse_hsc_u1', unitNumber: 'Unit 1', subjectName: 'Physics (NCERT)', title: 'Electrostatics, Current Electricity & Magnetism',
          chapters: [
            { id: 'cbse_hsc_c1', chapterNumber: 1, title: 'Electric Charges & Fields — Coulomb\'s Law and Gauss Law', subtopics: [
              { id: 'cbse_hsc_s1', title: 'Electrostatics', microTopics: [
                { id: 'cbse_hsc_m1', title: 'Coulomb\'s Law: F = (1/4πε₀)(q₁q₂/r²) — Force in Vacuum & Dielectrics', keyAxiom: 'Electric force follows inverse-square geometry.', formulaOrRule: 'F = (1/4πε₀)(q₁q₂/r²)', pyqFrequency: 'Very High' },
                { id: 'cbse_hsc_m2', title: 'Gauss\'s Law: Φ = ∮E⃗·dA⃗ = q_enc/ε₀ & Field Applications', keyAxiom: 'Total electric flux through a closed Gaussian surface depends only on enclosed net charge.', formulaOrRule: 'Φ = q/ε₀', pyqFrequency: 'Very High' }
              ]}
            ]},
            { id: 'cbse_hsc_c2', chapterNumber: 2, title: 'Current Electricity — Ohm\'s Law, Kirchhoff\'s Rules & Wheatstone Bridge', subtopics: [
              { id: 'cbse_hsc_s2', title: 'DC Circuit Analysis', microTopics: [
                { id: 'cbse_hsc_m3', title: 'Kirchhoff\'s Laws: Junction Rule (ΣI=0) & Loop Rule (ΣV=0)', keyAxiom: 'KCL conserves charge; KVL conserves energy.', formulaOrRule: 'ΣI = 0, ΣV = 0', pyqFrequency: 'Very High' },
                { id: 'cbse_hsc_m4', title: 'Wheatstone Bridge Balance Condition: P/Q = R/S', keyAxiom: 'Zero deflection in galvanometer indicates bridge equilibrium.', formulaOrRule: 'P/Q = R/S', pyqFrequency: 'High' }
              ]}
            ]}
          ]
        },
        { id: 'cbse_hsc_u2', unitNumber: 'Unit 2', subjectName: 'Chemistry (NCERT)', title: 'Solid State, Solutions, Electrochemistry & Kinetics',
          chapters: [
            { id: 'cbse_hsc_c3', chapterNumber: 3, title: 'Solutions & Colligative Properties', subtopics: [
              { id: 'cbse_hsc_s3', title: 'Thermodynamics of Solutions', microTopics: [
                { id: 'cbse_hsc_m5', title: 'Raoult\'s Law: P_A = P°_A · x_A & Colligative Elevations', keyAxiom: 'Vapor pressure lowering is proportional to solute mole fraction.', formulaOrRule: 'ΔTb = Kb·m, ΔTf = Kf·m', pyqFrequency: 'Very High' },
                { id: 'cbse_hsc_m6', title: 'Nernst Equation: E_cell = E°_cell - (0.0591/n)log Q', keyAxiom: 'Electrode potential varies logarithmically with reaction quotient.', formulaOrRule: 'E = E° - (RT/nF)ln Q', pyqFrequency: 'Very High' }
              ]}
            ]}
          ]
        },
        { id: 'cbse_hsc_u3', unitNumber: 'Unit 3', subjectName: 'Mathematics & Computer Science', title: 'Calculus, Relations & Python/Data Structures',
          chapters: [
            { id: 'cbse_hsc_c4', chapterNumber: 4, title: 'Calculus & Boolean Logic / Python Functions', subtopics: [
              { id: 'cbse_hsc_s4', title: 'Core Formulations', microTopics: [
                { id: 'cbse_hsc_m7', title: 'Definite Integrals & Fundamental Theorem of Calculus', keyAxiom: '∫[a,b] f(x)dx = F(b) - F(a) yields exact accumulated area.', formulaOrRule: '∫ f(x)dx = F(x) + C', pyqFrequency: 'Very High' },
                { id: 'cbse_hsc_m8', title: 'Python Recursion, File Handling & SQL Queries in CBSE CS', keyAxiom: 'Python handles text/binary streams via file pointers with context managers.', formulaOrRule: 'with open("data.dat", "rb") as f:', pyqFrequency: 'Very High' }
              ]}
            ]}
          ]
        }
      ];
    }

    if (isSSLC) {
      return [
        { id: 'cbse_10_u1', unitNumber: 'Unit 1', subjectName: 'Mathematics (NCERT)', title: 'Real Numbers, Polynomials, Linear Equations & Quadratics',
          chapters: [
            { id: 'cbse_10_c1', chapterNumber: 1, title: 'Real Numbers & Quadratic Equations', subtopics: [
              { id: 'cbse_10_s1', title: 'Number Theory & Algebra', microTopics: [
                { id: 'cbse_10_m1', title: 'Euclid\'s Division Lemma & Fundamental Theorem of Arithmetic', keyAxiom: 'Every composite number is uniquely factorable into prime factors.', formulaOrRule: 'a = bq + r, 0 ≤ r < b', pyqFrequency: 'Very High' },
                { id: 'cbse_10_m2', title: 'Quadratic Formula: x = (-b ± √(b² - 4ac))/(2a) & Nature of Roots', keyAxiom: 'Discriminant D = b² - 4ac determines real, equal, or complex roots.', formulaOrRule: 'D = b² - 4ac', pyqFrequency: 'Very High' }
              ]}
            ]}
          ]
        },
        { id: 'cbse_10_u2', unitNumber: 'Unit 2', subjectName: 'Science (NCERT)', title: 'Chemical Reactions, Life Processes & Electricity',
          chapters: [
            { id: 'cbse_10_c2', chapterNumber: 2, title: 'Chemical Reactions & Current Electricity', subtopics: [
              { id: 'cbse_10_s2', title: 'Physics & Chemistry', microTopics: [
                { id: 'cbse_10_m3', title: 'Ohm\'s Law V=IR, Series/Parallel Resistors & Joule\'s Heating H=I²Rt', keyAxiom: 'Current in conductors is directly proportional to voltage at constant temp.', formulaOrRule: 'V = IR, P = VI = I²R', pyqFrequency: 'Very High' },
                { id: 'cbse_10_m4', title: 'Redox Reactions, Balancing Equations & Corrosion Prevention', keyAxiom: 'Mass is conserved; electrons lost equals electrons gained.', pyqFrequency: 'Very High' }
              ]}
            ]}
          ]
        },
        { id: 'cbse_10_u3', unitNumber: 'Unit 3', subjectName: 'Social Science (NCERT)', title: 'Nationalism in Europe/India, Resources & Democratic Politics',
          chapters: [
            { id: 'cbse_10_c3', chapterNumber: 3, title: 'Indian Freedom Movement & Soil Resources', subtopics: [
              { id: 'cbse_10_s3', title: 'History & Geography', microTopics: [
                { id: 'cbse_10_m5', title: 'Non-Cooperation, Civil Disobedience & Salt Satyagraha (1930)', keyAxiom: 'Gandhi mobilized mass non-violent resistance against British monopolies.', pyqFrequency: 'Very High' },
                { id: 'cbse_10_m6', title: 'Soil Types in India: Alluvial, Black (Regur), Red & Conservation', keyAxiom: 'Black soil is ideal for cotton; alluvial soil supports intense agriculture.', pyqFrequency: 'High' }
              ]}
            ]}
          ]
        }
      ];
    }

    if (isPrimary) {
      return [
        { id: 'cbse_pri_u1', unitNumber: 'Unit 1', subjectName: 'English & Hindi (NCERT)', title: 'Reading Comprehension, Grammar & Creative Expression',
          chapters: [
            { id: 'cbse_pri_c1', chapterNumber: 1, title: 'Stories, Poems & Parts of Speech', subtopics: [
              { id: 'cbse_pri_s1', title: 'Language Skills', microTopics: [
                { id: 'cbse_pri_m1', title: 'Nouns, Pronouns, Verbs, Adjectives & Sentence Construction', keyAxiom: 'A complete sentence requires a subject and a predicate.', pyqFrequency: 'Very High' },
                { id: 'cbse_pri_m2', title: 'Reading Comprehension: Main Idea & Answering Questions', keyAxiom: 'Context clues help infer meanings of unfamiliar vocabulary.', pyqFrequency: 'High' }
              ]}
            ]}
          ]
        },
        { id: 'cbse_pri_u2', unitNumber: 'Unit 2', subjectName: 'Mathematics (NCERT)', title: 'Place Value, Four Basic Operations & Fractions',
          chapters: [
            { id: 'cbse_pri_c2', chapterNumber: 2, title: 'Arithmetic Operations & Geometric Shapes', subtopics: [
              { id: 'cbse_pri_s2', title: 'Foundational Numeracy', microTopics: [
                { id: 'cbse_pri_m3', title: 'Place Value: Units, Tens, Hundreds, Thousands & Expanded Form', keyAxiom: 'Positional number system multiplies digit by power of 10.', pyqFrequency: 'Very High' },
                { id: 'cbse_pri_m4', title: 'Multiplication Tables 2-15 & Division with Remainders', keyAxiom: 'Dividend = (Divisor × Quotient) + Remainder.', formulaOrRule: 'a = b·q + r', pyqFrequency: 'Very High' }
              ]}
            ]}
          ]
        },
        { id: 'cbse_pri_u3', unitNumber: 'Unit 3', subjectName: 'EVS / Environmental Studies', title: 'Plants, Animals, Water, Food & Cleanliness',
          chapters: [
            { id: 'cbse_pri_c3', chapterNumber: 3, title: 'Living Things & Natural Resources', subtopics: [
              { id: 'cbse_pri_s3', title: 'Nature & Science', microTopics: [
                { id: 'cbse_pri_m5', title: 'Parts of Plants, Photosynthesis & Food Chains', keyAxiom: 'Green plants use chlorophyll and sunlight to produce glucose.', pyqFrequency: 'High' },
                { id: 'cbse_pri_m6', title: 'Water Cycle: Evaporation, Condensation, Precipitation', keyAxiom: 'Solar heat continuously cycles water between land, oceans, and clouds.', pyqFrequency: 'High' }
              ]}
            ]}
          ]
        }
      ];
    }

    // Default CBSE Middle (Class 6-8)
    return [
      { id: 'cbse_mid_u1', unitNumber: 'Unit 1', subjectName: 'Mathematics (NCERT)', title: 'Integers, Rational Numbers, Simple Equations & Geometry',
        chapters: [
          { id: 'cbse_mid_c1', chapterNumber: 1, title: 'Integers, Fractions & Linear Equations in One Variable', subtopics: [
            { id: 'cbse_mid_s1', title: 'Number Operations', microTopics: [
              { id: 'cbse_mid_m1', title: 'Integer Rules: Addition, Subtraction, Multiplication & Sign Laws', keyAxiom: 'Product of two negatives is positive; division follows identical sign laws.', formulaOrRule: '(-a) × (-b) = +(a·b)', pyqFrequency: 'Very High' },
              { id: 'cbse_mid_m2', title: 'Solving Linear Equations: ax + b = c by Transposition', keyAxiom: 'Applying equal operations on both sides preserves equality.', formulaOrRule: 'ax + b = c => x = (c-b)/a', pyqFrequency: 'Very High' }
            ]}
          ]}
        ]
      },
      { id: 'cbse_mid_u2', unitNumber: 'Unit 2', subjectName: 'Science (NCERT)', title: 'Motion, Force, Light, Reproduction & Matter',
        chapters: [
          { id: 'cbse_mid_c2', chapterNumber: 2, title: 'Motion, Force & Reflection of Light', subtopics: [
            { id: 'cbse_mid_s2', title: 'Physical Science', microTopics: [
              { id: 'cbse_mid_m3', title: 'Speed Formula v = d/t, Distance-Time Graphs & Uniform Motion', keyAxiom: 'Slope of distance-time graph represents instantaneous speed.', formulaOrRule: 'v = d/t', pyqFrequency: 'Very High' },
              { id: 'cbse_mid_m4', title: 'Laws of Reflection: Angle i = Angle r & Plane Mirrors', keyAxiom: 'Incident ray, reflected ray, and normal lie in the same plane.', formulaOrRule: '∠i = ∠r', pyqFrequency: 'Very High' }
            ]}
          ]}
        ]
      },
      { id: 'cbse_mid_u3', unitNumber: 'Unit 3', subjectName: 'Social Science (NCERT)', title: 'History, Geography & Democratic Governance',
        chapters: [
          { id: 'cbse_mid_c3', chapterNumber: 3, title: 'Our Past, Earth\'s Structure & Indian Constitution', subtopics: [
            { id: 'cbse_mid_s3', title: 'History & Civics', microTopics: [
              { id: 'cbse_mid_m5', title: 'Indus Valley Civilisation: Urban Planning, Great Bath & Seals', keyAxiom: 'Harappan cities featured advanced grid layouts and covered drainage systems.', pyqFrequency: 'High' },
              { id: 'cbse_mid_m6', title: 'Preamble to Indian Constitution & Six Fundamental Rights', keyAxiom: 'The Constitution establishes India as a Sovereign, Socialist, Secular, Democratic Republic.', pyqFrequency: 'Very High' }
            ]}
          ]}
        ]
      }
    ];
  }

  // 2. TN BOARD SAMACHEER KALVI — ENGLISH MEDIUM (LKG to 12th Standard)
  if (t.includes('english medium') || (t.includes('samacheer') && (t.includes('english') || cat.includes('english')))) {
    const isKg = t.includes('lkg') || t.includes('ukg') || t.includes('kindergarten') || t.includes('early childhood');
    const isPrimary = /\bclass\s*[1-5]\b/.test(t) || /\b[1-5](st|nd|rd|th)\s*standard/.test(t);
    const isMiddle = /\bclass\s*[6-8]\b/.test(t) || /\b[6-8]th\s*standard/.test(t);
    const is9th = /\bclass\s*9\b/.test(t) || /\b9th\s*standard/.test(t);
    const isSSLC = /\bclass\s*10\b/.test(t) || /\bsslc\b/.test(t) || /\b10th\b/.test(t);
    const isHSC = /\bclass\s*(11|12)\b/.test(t) || /\bhsc\b/.test(t) || /\bplus\s*(one|two|1|2)\b/.test(t);

    if (isKg) {
      return [
        { id: 'tnen_kg_u1', unitNumber: 'Unit 1', subjectName: 'English & Tamil Phonics', title: 'Alphabet Recognition, Phonics Sounds & Tamil Vowels',
          chapters: [
            { id: 'tnen_kg_c1', chapterNumber: 1, title: 'English A-Z Phonics & Tamil உயிர் எழுத்துக்கள்', subtopics: [
              { id: 'tnen_kg_s1', title: 'Letter Sounds & Blending', microTopics: [
                { id: 'tnen_kg_m1', title: 'English Phonics A to Z: Letter Sounds & Word Examples', keyAxiom: 'Phonics connects written letter graphemes with spoken phonemes.', pyqFrequency: 'Very High' },
                { id: 'tnen_kg_m2', title: 'தமிழ் உயிர் எழுத்துக்கள் 12 (அ முதல் ஔ) & ஆய்த எழுத்து (ஃ)', keyAxiom: 'உயிர் எழுத்துக்கள் பிற ஒலிகளின் துணையின்றி சுயமாக ஒலிக்கும்.', pyqFrequency: 'Very High' },
                { id: 'tnen_kg_m3', title: '3-Letter CVC Word Reading: Bat, Cat, Dog, Sun, Pen', keyAxiom: 'Blending consonant and vowel sounds develops independent reading.', pyqFrequency: 'High' }
              ]}
            ]}
          ]
        },
        { id: 'tnen_kg_u2', unitNumber: 'Unit 2', subjectName: 'Mathematics (Numbers & Shapes)', title: 'Numbers 1-50, Shapes, Colors & Counting',
          chapters: [
            { id: 'tnen_kg_c2', chapterNumber: 2, title: 'Foundational Numbers & 2D Shapes', subtopics: [
              { id: 'tnen_kg_s2', title: 'Counting & Spatial Skills', microTopics: [
                { id: 'tnen_kg_m4', title: 'Counting Objects 1 to 20 with One-to-One Correspondence', keyAxiom: 'The last number spoken represents the total quantity in the set.', pyqFrequency: 'Very High' },
                { id: 'tnen_kg_m5', title: '2D Shapes: Circle, Square, Triangle, Rectangle & Colors', keyAxiom: 'Shapes are identified by counting straight sides and sharp corners.', pyqFrequency: 'High' }
              ]}
            ]}
          ]
        },
        { id: 'tnen_kg_u3', unitNumber: 'Unit 3', subjectName: 'EVS / Environmental Awareness', title: 'My Family, Body Parts, Animals & Good Habits',
          chapters: [
            { id: 'tnen_kg_c3', chapterNumber: 3, title: 'Body Parts & Healthy Habits', subtopics: [
              { id: 'tnen_kg_s3', title: 'Hygiene & Nature', microTopics: [
                { id: 'tnen_kg_m6', title: 'Human Body Parts & Five Senses Functions', keyAxiom: 'Sense organs help us see, hear, smell, taste, and touch.', pyqFrequency: 'High' },
                { id: 'tnen_kg_m7', title: 'Domestic vs Wild Animals & Plant Care', keyAxiom: 'Living organisms require air, water, food, and shelter to grow.', pyqFrequency: 'High' }
              ]}
            ]}
          ]
        }
      ];
    }

    if (isPrimary) {
      return [
        { id: 'tnen_pri_u1', unitNumber: 'Unit 1', subjectName: 'English & Tamil (Language)', title: 'Grammar, Reading Comprehension & Tamil செய்யுள்',
          chapters: [
            { id: 'tnen_pri_c1', chapterNumber: 1, title: 'English Grammar & Samacheer Tamil Lessons', subtopics: [
              { id: 'tnen_pri_s1', title: 'Grammar & Vocabulary', microTopics: [
                { id: 'tnen_pri_m1', title: 'Nouns, Pronouns, Verbs, Adjectives & Tenses (Present/Past/Future)', keyAxiom: 'Verbs indicate actions and inflect according to tense and person.', pyqFrequency: 'Very High' },
                { id: 'tnen_pri_m2', title: 'ஔவையாரின் ஆத்திசூடி & இனியவை நாற்பது நீதிநெறி கருத்துக்கள்', keyAxiom: 'ஆத்திசூடி நன்னெறி கருத்துக்கள் அறவாழ்விற்கு அடித்தளம் அமைக்கும்.', pyqFrequency: 'Very High' }
              ]}
            ]}
          ]
        },
        { id: 'tnen_pri_u2', unitNumber: 'Unit 2', subjectName: 'Mathematics (Samacheer)', title: 'Numbers, Addition, Subtraction, Multiplication & Geometry',
          chapters: [
            { id: 'tnen_pri_c2', chapterNumber: 2, title: 'Arithmetic Operations & Place Value', subtopics: [
              { id: 'tnen_pri_s2', title: 'Numeracy & Operations', microTopics: [
                { id: 'tnen_pri_m3', title: 'Place Value up to 10,000 & Expanded Form Addition/Subtraction', keyAxiom: 'Carrying and borrowing preserve positional base-10 value.', pyqFrequency: 'Very High' },
                { id: 'tnen_pri_m4', title: 'Multiplication Tables 2-12 & Division Word Problems', keyAxiom: 'Multiplication is repeated addition; division is equal sharing.', formulaOrRule: 'Dividend = Divisor × Quotient + Remainder', pyqFrequency: 'Very High' }
              ]}
            ]}
          ]
        },
        { id: 'tnen_pri_u3', unitNumber: 'Unit 3', subjectName: 'Science & Social Studies', title: 'Plants, Animals, Water Cycle & Tamil Nadu Heritage',
          chapters: [
            { id: 'tnen_pri_c3', chapterNumber: 3, title: 'Living World & Our Environment', subtopics: [
              { id: 'tnen_pri_s3', title: 'Science & Geography', microTopics: [
                { id: 'tnen_pri_m5', title: 'Parts of Plants, Root Types & Photosynthesis Process', keyAxiom: 'Green leaves absorb sunlight to synthesize glucose from CO2 and water.', pyqFrequency: 'Very High' },
                { id: 'tnen_pri_m6', title: 'Districts of Tamil Nadu, Monuments & Water Bodies', keyAxiom: 'Rivers like Cauvery, Vaigai, and Thamirabarani sustain TN agriculture.', pyqFrequency: 'High' }
              ]}
            ]}
          ]
        }
      ];
    }

    if (isMiddle) {
      return [
        { id: 'tnen_mid_u1', unitNumber: 'Unit 1', subjectName: 'Mathematics (Samacheer)', title: 'Rational Numbers, Measurements, Algebra & Life Mathematics',
          chapters: [
            { id: 'tnen_mid_c1', chapterNumber: 1, title: 'Rational Numbers, Linear Equations & Commercial Math', subtopics: [
              { id: 'tnen_mid_s1', title: 'Algebra & Arithmetic', microTopics: [
                { id: 'tnen_mid_m1', title: 'Rational Numbers Arithmetic Operations & Number Line Representation', keyAxiom: 'Every rational number can be expressed as p/q where q ≠ 0.', formulaOrRule: 'a/b ± c/d = (ad ± bc)/bd', pyqFrequency: 'Very High' },
                { id: 'tnen_mid_m2', title: 'Profit & Loss, Percentage, Simple Interest: I = PNR/100', keyAxiom: 'Simple interest grows linearly with principal, time, and annual rate.', formulaOrRule: 'I = P·N·R/100, A = P + I', pyqFrequency: 'Very High' }
              ]}
            ]}
          ]
        },
        { id: 'tnen_mid_u2', unitNumber: 'Unit 2', subjectName: 'Science (Physics, Chem & Bio)', title: 'Measurement, Light, Matter, Plant Kingdom & Human Organs',
          chapters: [
            { id: 'tnen_mid_c2', chapterNumber: 2, title: 'Force, Pressure, Matter & Cell Biology', subtopics: [
              { id: 'tnen_mid_s2', title: 'Physical & Biological Sciences', microTopics: [
                { id: 'tnen_mid_m3', title: 'Pressure Formula P = F/A, Atmospheric Pressure & Barometer', keyAxiom: 'Pressure is force acting perpendicularly per unit surface area.', formulaOrRule: 'P = F/A, 1 atm = 1.013 × 10⁵ Pa', pyqFrequency: 'Very High' },
                { id: 'tnen_mid_m4', title: 'Plant & Animal Cell Structure: Nucleus, Mitochondria, Chloroplast', keyAxiom: 'Mitochondria generates ATP via cellular respiration; chloroplast drives photosynthesis.', pyqFrequency: 'Very High' }
              ]}
            ]}
          ]
        },
        { id: 'tnen_mid_u3', unitNumber: 'Unit 3', subjectName: 'Social Science (TN Board)', title: 'Tamil Nadu Kingdoms, Earth Resources & Indian Democracy',
          chapters: [
            { id: 'tnen_mid_c3', chapterNumber: 3, title: 'South Indian Dynasties & Indian Constitution', subtopics: [
              { id: 'tnen_mid_s3', title: 'History & Civics', microTopics: [
                { id: 'tnen_mid_m5', title: 'Imperial Cholas: Rajaraja I, Brihadisvara Temple & Naval Expeditions', keyAxiom: 'Rajaraja Chola built Thanjavur Big Temple and centralized administrative bureaucracy.', pyqFrequency: 'Very High' },
                { id: 'tnen_mid_m6', title: 'State Government Structure: Governor, Chief Minister & Legislative Assembly', keyAxiom: 'The Governor is constitutional head; the Chief Minister is real executive head.', pyqFrequency: 'Very High' }
              ]}
            ]}
          ]
        }
      ];
    }

    if (is9th) {
      return [
        { id: 'tnen_9_u1', unitNumber: 'Unit 1', subjectName: 'Mathematics (9th Samacheer)', title: 'Set Language, Real Numbers, Algebra & Coordinate Geometry',
          chapters: [
            { id: 'tnen_9_c1', chapterNumber: 1, title: 'Set Operations, Polynomials & Distance Formula', subtopics: [
              { id: 'tnen_9_s1', title: 'Sets & Coordinate Geometry', microTopics: [
                { id: 'tnen_9_m1', title: 'Set Operations: Union, Intersection, Difference & De Morgan\'s Laws', keyAxiom: '(A ∪ B)\' = A\' ∩ B\' and (A ∩ B)\' = A\' ∪ B\'', formulaOrRule: 'n(A ∪ B) = n(A) + n(B) - n(A ∩ B)', pyqFrequency: 'Very High' },
                { id: 'tnen_9_m2', title: 'Distance Formula d = √[(x₂-x₁)² + (y₂-y₁)²] & Midpoint Formula', keyAxiom: 'Euclidean distance is the square root of sum of squared coordinate differences.', formulaOrRule: 'd = √[(x₂-x₁)² + (y₂-y₁)²], M = ((x₁+x₂)/2, (y₁+y₂)/2)', pyqFrequency: 'Very High' }
              ]}
            ]}
          ]
        },
        { id: 'tnen_9_u2', unitNumber: 'Unit 2', subjectName: 'Science (9th Samacheer)', title: 'Motion, Light, Periodic Table, Atomic Structure & Tissues',
          chapters: [
            { id: 'tnen_9_c2', chapterNumber: 2, title: 'Equations of Motion, Atoms & Plant Tissues', subtopics: [
              { id: 'tnen_9_s2', title: 'Physics, Chemistry & Biology', microTopics: [
                { id: 'tnen_9_m3', title: 'Equations of Motion: v = u + at, s = ut + 1/2at², v² = u² + 2as', keyAxiom: 'Applies to uniformly accelerated linear motion.', formulaOrRule: 'v = u + at, s = ut + (1/2)at², v² = u² + 2as', pyqFrequency: 'Very High' },
                { id: 'tnen_9_m4', title: 'Bohr Model of Atom: 2n² Shell Rule & Valence Electrons', keyAxiom: 'Electrons orbit in quantized non-radiating energy shells.', formulaOrRule: 'Max electrons = 2n²', pyqFrequency: 'Very High' }
              ]}
            ]}
          ]
        },
        { id: 'tnen_9_u3', unitNumber: 'Unit 3', subjectName: 'Social Science (9th Samacheer)', title: 'Ancient Civilisations, Earth Spheres & Tamil Nadu Economy',
          chapters: [
            { id: 'tnen_9_c3', chapterNumber: 3, title: 'Keeladi Archaeology & Earth\'s Lithosphere', subtopics: [
              { id: 'tnen_9_s3', title: 'History, Geography & Economics', microTopics: [
                { id: 'tnen_9_m5', title: 'Keeladi Sangam Age Urban Settlement & Tamil-Brahmi Script Artifacts', keyAxiom: 'Keeladi artifacts date Tamil urban civilization back to 6th century BCE.', pyqFrequency: 'Very High' },
                { id: 'tnen_9_m6', title: 'Tamil Nadu Economy: Agriculture, Industrial Corridors & Service Sector', keyAxiom: 'Tamil Nadu is India\'s second largest state economy with strong manufacturing base.', pyqFrequency: 'Very High' }
              ]}
            ]}
          ]
        }
      ];
    }

    if (isSSLC) {
      return [
        { id: 'tnen_10_u1', unitNumber: 'Unit 1', subjectName: 'Mathematics (10th Samacheer)', title: 'Relations, Functions, Progressions, Algebra & Coordinate Geometry',
          chapters: [
            { id: 'tnen_10_c1', chapterNumber: 1, title: 'Relations and Functions — Cartesian Product & Types', subtopics: [
              { id: 'tnen_10_s1', title: 'Cartesian Product', microTopics: [
                { id: 'tnen_10_m1', title: 'Cartesian Product A×B: n(A×B) = n(A) · n(B)', keyAxiom: 'A relation R from A to B is any valid subset of A×B.', formulaOrRule: 'n(A×B) = n(A) × n(B)', pyqFrequency: 'Very High' },
                { id: 'tnen_10_m2', title: 'Arithmetic Progression: tn = a + (n-1)d & Sum Sn', keyAxiom: 'Common difference d is invariant across successive terms.', formulaOrRule: 'tn = a + (n-1)d, Sn = (n/2)[2a + (n-1)d]', pyqFrequency: 'Very High' }
              ]}
            ]}
          ]
        },
        { id: 'tnen_10_u2', unitNumber: 'Unit 2', subjectName: 'Science (10th Samacheer)', title: 'Laws of Motion, Optics, Thermal Physics, Solutions & Genetics',
          chapters: [
            { id: 'tnen_10_c2', chapterNumber: 2, title: 'Newton\'s Laws of Motion & Thin Lens Formula', subtopics: [
              { id: 'tnen_10_s2', title: 'Physics Fundamentals', microTopics: [
                { id: 'tnen_10_m3', title: 'Newton\'s Second Law F=ma & Linear Momentum Conservation', keyAxiom: 'Total initial momentum equals total final momentum in isolated systems.', formulaOrRule: 'F = ma, m1u1 + m2u2 = m1v1 + m2v2', pyqFrequency: 'Very High' },
                { id: 'tnen_10_m4', title: 'Lens Formula 1/f = 1/v - 1/u & Power P = 1/f in Dioptres', keyAxiom: 'Convex lens has positive focal length; concave lens has negative focal length.', formulaOrRule: '1/f = 1/v - 1/u, P = 1/f', pyqFrequency: 'Very High' }
              ]}
            ]}
          ]
        },
        { id: 'tnen_10_u3', unitNumber: 'Unit 3', subjectName: 'Social Science & Tamil', title: 'Freedom Struggle in Tamil Nadu, Constitution & Tamil Literature',
          chapters: [
            { id: 'tnen_10_c3', chapterNumber: 3, title: 'Freedom Struggle in TN & Thirukkural', subtopics: [
              { id: 'tnen_10_s3', title: 'History & Ethics', microTopics: [
                { id: 'tnen_10_m5', title: 'V.O.C. & Swadeshi Steam Navigation Company vs British Monopoly', keyAxiom: 'V.O. Chidambaram established India\'s first indigenous shipping enterprise in Tuticorin.', pyqFrequency: 'Very High' },
                { id: 'tnen_10_m6', title: 'Thirukkural Couplets on Wisdom (அறிவுடைமை) & Statecraft', keyAxiom: 'Thiruvalluvar provides universal guidelines for ethical governance and conduct.', pyqFrequency: 'Very High' }
              ]}
            ]}
          ]
        }
      ];
    }

    if (isHSC) {
      return [
        { id: 'tnen_hsc_u1', unitNumber: 'Unit 1', subjectName: 'Physics (12th English Medium)', title: 'Electrostatics, Magnetism, AC Circuits & Wave Optics',
          chapters: [
            { id: 'tnen_hsc_c1', chapterNumber: 1, title: 'Coulomb\'s Law, Gauss Law & Wheatstone Bridge', subtopics: [
              { id: 'tnen_hsc_s1', title: 'Electrodynamics', microTopics: [
                { id: 'tnen_hsc_m1', title: 'Coulomb\'s Force F = kq1q2/r² & Potential Energy U = kq1q2/r', keyAxiom: 'Conservative electric field enables definition of scalar potential.', formulaOrRule: 'F = (1/4πε₀)(q₁q₂/r²)', pyqFrequency: 'Very High' },
                { id: 'tnen_hsc_m2', title: 'Wheatstone Bridge Balance Condition: P/Q = R/S', keyAxiom: 'Galvanometer current Ig = 0 when bridge is balanced.', formulaOrRule: 'P/Q = R/S', pyqFrequency: 'Very High' }
              ]}
            ]}
          ]
        },
        { id: 'tnen_hsc_u2', unitNumber: 'Unit 2', subjectName: 'Chemistry (12th English Medium)', title: 'Electrochemistry, Organic Reactions & Coordination Compounds',
          chapters: [
            { id: 'tnen_hsc_c2', chapterNumber: 2, title: 'Nernst Equation & Coordination Nomenclature', subtopics: [
              { id: 'tnen_hsc_s2', title: 'Chemistry Core', microTopics: [
                { id: 'tnen_hsc_m3', title: 'Nernst Equation for Cell EMF: E = E° - (0.0591/n)log Q', keyAxiom: 'Non-standard cell potential depends on ion concentration ratio.', formulaOrRule: 'E = E° - (0.0591/n)log Q', pyqFrequency: 'Very High' },
                { id: 'tnen_hsc_m4', title: 'Werner\'s Theory of Coordination Compounds & Primary/Secondary Valence', keyAxiom: 'Primary valence is ionizable; secondary valence represents coordination number.', pyqFrequency: 'Very High' }
              ]}
            ]}
          ]
        },
        { id: 'tnen_hsc_u3', unitNumber: 'Unit 3', subjectName: 'Mathematics & Biology', title: 'Matrices, Calculus, Genetics & Plant Biotechnology',
          chapters: [
            { id: 'tnen_hsc_c3', chapterNumber: 3, title: 'Inverse Matrices, Derivatives & DNA Replication', subtopics: [
              { id: 'tnen_hsc_s3', title: 'Mathematics & Biology', microTopics: [
                { id: 'tnen_hsc_m5', title: 'Matrix Inverse Formula A⁻¹ = (1/|A|) adj(A) for Invertible Systems', keyAxiom: 'A matrix is invertible if and only if its determinant |A| ≠ 0.', formulaOrRule: 'A⁻¹ = (1/|A|) adj(A)', pyqFrequency: 'Very High' },
                { id: 'tnen_hsc_m6', title: 'Mendel\'s Laws of Inheritance: Law of Segregation & Independent Assortment', keyAxiom: 'Alleles segregate during gamete formation and re-pair randomly in zygote.', formulaOrRule: 'Monohybrid 3:1 (1:2:1), Dihybrid 9:3:3:1', pyqFrequency: 'Very High' }
              ]}
            ]}
          ]
        }
      ];
    }
  }

  // 3. TECH, AI & WEB APP DEVELOPMENT (Full-Stack, React, Next.js, Node, Python, Cloud, Docker)
  if (t.includes('web') || t.includes('full stack') || t.includes('frontend') || t.includes('backend') || t.includes('react') || t.includes('node') || t.includes('javascript') || t.includes('typescript') || t.includes('python') || t.includes('sql') || t.includes('docker') || t.includes('devops') || t.includes('cloud') || t.includes('cyber') || t.includes('ai') || t.includes('machine learning') || t.includes('flutter') || /செயற்கை நுண்ணறிவு|தரவு அறிவியல்|சைபர்|கணினி|பைதான்/.test(t)) {
    return [
      {
        id: 'tech_u1',
        unitNumber: 'Unit 1',
        subjectName: 'Modern Architecture & Core Frameworks',
        title: 'Frontend Architecture, React 19, TypeScript & Next.js App Router',
        tamilTitle: 'அலகு 1: நவீன மென்பொருள் கட்டமைப்பு & ரியாக்ட்',
        chapters: [
          {
            id: 'tech_c1',
            chapterNumber: 1,
            title: 'Semantic HTML5, CSS Grid, Tailwind & V8 Event Loop',
            tamilTitle: 'வலை வடிவமைப்பு & ஜாவாஸ்கிரிப்ட்',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: 'tech_c1_s1',
                title: 'Grid Layouts, V8 Microtasks & TypeScript Type Systems',
                microTopics: [
                  { id: 'tech_m1', title: 'CSS Grid repeat(auto-fit, minmax(280px, 1fr)) & Flexbox Alignment', keyAxiom: 'Flexbox aligns along one axis; CSS Grid establishes explicit 2D matrix coordinate tracks.', formulaOrRule: 'display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))', pyqFrequency: 'Very High' },
                  { id: 'tech_m2', title: 'JavaScript Event Loop: Microtask (Promise) Priority over Macrotask (setTimeout)', keyAxiom: 'Microtask queue is completely drained after each synchronous call stack turn before any macrotask runs.', formulaOrRule: 'Call Stack -> Microtasks (Promises) -> Macrotasks (Timers) -> Render', pyqFrequency: 'Very High' },
                  { id: 'tech_m3', title: 'TypeScript Generics, Conditional Types & Satisfies Operator', keyAxiom: 'Generics parameterize types without losing type safety or falling back to "any".', formulaOrRule: 'type Result<T> = { data: T; error?: string }', pyqFrequency: 'High' }
                ]
              }
            ]
          },
          {
            id: 'tech_c2',
            chapterNumber: 2,
            title: 'React Server Components (RSC), Next.js 15 App Router & State Stores',
            tamilTitle: 'ரியாக்ட் சர்வர் காம்பொனன்ட்ஸ் & ஸ்டேட் மேனேஜ்மென்ட்',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: 'tech_c2_s1',
                title: 'Server Components, Server Actions & Zustand Global Store',
                microTopics: [
                  { id: 'tech_m4', title: 'React Server Components (RSC) vs Client Components ("use client")', keyAxiom: 'Server Components execute only on server with direct DB access and emit 0kb JavaScript bundle weight.', formulaOrRule: 'Server: async function Page() { const data = await db.query(); }', pyqFrequency: 'Very High' },
                  { id: 'tech_m5', title: 'Next.js 15 Server Actions with optimistic UI updates & Zod validation', keyAxiom: 'Server Actions eliminate boilerplate API endpoints through progressive form submissions.', formulaOrRule: '"use server"; export async function createItem(formData: FormData)', pyqFrequency: 'High' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'tech_u2',
        unitNumber: 'Unit 2',
        subjectName: 'Backend, Database & Cloud DevOps',
        title: 'REST/GraphQL APIs, PostgreSQL Indexing, Docker & AI Model Integration',
        tamilTitle: 'அலகு 2: பேக்-எண்ட், டேட்டாபேஸ் & கிளவுட்',
        chapters: [
          {
            id: 'tech_c3',
            chapterNumber: 3,
            title: 'JWT Auth with HttpOnly Refresh Tokens & PostgreSQL B-Tree Indexing',
            tamilTitle: 'செக்யூரிட்டி & டேட்டாபேஸ் ஆப்டிமைசேஷன்',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: 'tech_c3_s1',
                title: 'Security, B-Tree Query Cost & Docker Multi-Stage Builds',
                microTopics: [
                  { id: 'tech_m6', title: 'Stateless JWT Auth with HttpOnly Refresh Token Rotation', keyAxiom: 'Access tokens are short-lived (15m); Refresh tokens in HttpOnly cookies prevent XSS theft.', formulaOrRule: 'Authorization: Bearer <AccessToken> + HttpOnly Cookie: <RefreshToken>', pyqFrequency: 'Very High' },
                  { id: 'tech_m7', title: 'PostgreSQL B-Tree Indexing on Foreign Keys: O(log N) vs O(N) Table Scan', keyAxiom: 'Indexes on WHERE and JOIN foreign keys avoid sequential full-table scans.', formulaOrRule: 'CREATE INDEX idx_orders_user_id ON orders(user_id);', pyqFrequency: 'Very High' },
                  { id: 'tech_m8', title: 'Docker Multi-Stage Builds with Alpine Linux for Minimal Image Size', keyAxiom: 'Multi-stage builds discard compilers, producing lean production runtime artifacts under 100MB.', formulaOrRule: 'FROM node:20-alpine AS runner', pyqFrequency: 'High' }
                ]
              }
            ]
          }
        ]
      }
    ];
  }

  // 4. NEET / JEE ENTRANCE (Physics, Chemistry, Biology, Mathematics)
  if (t.includes('neet') || t.includes('jee') || t.includes('iit')) {
    return [
      {
        id: 'neet_u1',
        unitNumber: 'Unit 1',
        subjectName: 'Physics (Mechanics, Electrodynamics & Optics)',
        title: 'Newtonian Dynamics, Projectiles, Capacitors, Ray Optics & Modern Physics',
        tamilTitle: 'இயற்பியல்: விசையியல் & மின்னோட்டவியல்',
        chapters: [
          {
            id: 'neet_c1',
            chapterNumber: 1,
            title: 'Kinematics & 2D Projectile Motion',
            tamilTitle: 'இயக்கவியல் & எறிபொருள் இயக்கம்',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: 'neet_c1_s1',
                title: 'Projectile Trajectory & Range Shortcuts',
                microTopics: [
                  { id: 'neet_m1', title: 'Maximum Horizontal Range R_max = u²/g at θ = 45° and Trajectory y = x tanθ - (gx²)/(2u²cos²θ)', keyAxiom: 'Horizontal velocity u_x remains constant while vertical velocity u_y undergoes gravitational acceleration g.', formulaOrRule: 'R = (u² sin 2θ)/g, H_max = (u² sin²θ)/(2g)', pyqFrequency: 'Very High' },
                  { id: 'neet_m2', title: 'Newton\'s Second Law Vector Form F⃗ = dp⃗/dt = m·a⃗ and Impulse J⃗ = ∫F dt = Δp', keyAxiom: 'In an elastic collision, both kinetic energy and linear momentum are conserved.', formulaOrRule: 'F = ma, J = Δp = F · Δt', pyqFrequency: 'Very High' }
                ]
              }
            ]
          },
          {
            id: 'neet_c2',
            chapterNumber: 2,
            title: 'Electrostatics, Gauss\'s Law & Wheatstone Bridge',
            tamilTitle: 'மின்னியல் & காந்தவியல்',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: 'neet_c2_s1',
                title: 'Coulomb Law & Circuit Theorems',
                microTopics: [
                  { id: 'neet_m3', title: 'Coulomb\'s Law F = (1/4πε₀)(q1q2/r²) and Electric Field E = F/q', keyAxiom: 'Electric force satisfies inverse-square geometry with vector superposition.', formulaOrRule: 'F = (1/4πε₀)(q₁q₂/r²)', pyqFrequency: 'Very High' },
                  { id: 'neet_m4', title: 'Wheatstone Bridge Balance Condition P/Q = R/S & Meter Bridge', keyAxiom: 'At null deflection, potential difference across the galvanometer is exactly zero.', formulaOrRule: 'P/Q = R/S', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'neet_u2',
        unitNumber: 'Unit 2',
        subjectName: 'Chemistry & Biology (Physical, Organic & Genetics)',
        title: 'Chemical Kinetics, Coordination Compounds, DNA Replication & Cell Cycle',
        tamilTitle: 'வேதியியல் & உயிரியல்',
        chapters: [
          {
            id: 'neet_c3',
            chapterNumber: 3,
            title: 'Chemical Kinetics, Nernst Equation & DNA Replication',
            tamilTitle: 'வேதியிய இயக்கவியல் & மரபியல்',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: 'neet_c3_s1',
                title: 'Rate Laws & Molecular Genetics',
                microTopics: [
                  { id: 'neet_m5', title: 'First-Order Reaction Half-Life t½ = 0.693/k & Arrhenius Equation k = A e^(-Ea/RT)', keyAxiom: 'First-order half-life is strictly independent of initial reactant concentration.', formulaOrRule: 't1/2 = 0.693/k, ln(k2/k1) = (Ea/R)(1/T1 - 1/T2)', pyqFrequency: 'Very High' },
                  { id: 'neet_m6', title: 'DNA Replication: Leading vs Lagging Strand, Okazaki Fragments & DNA Polymerase III', keyAxiom: 'DNA polymerase synthesizes only in the 5\' to 3\' direction, creating Okazaki fragments on lagging strand.', formulaOrRule: '5\' -> 3\' Directionality', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      }
    ];
  }

  // 5. TNPSC / UPSC / GOVT EXAMS (Polity, History, Economy, Geography, General Tamil)
  if (t.includes('tnpsc') || t.includes('upsc') || t.includes('group 1') || t.includes('group 2') || t.includes('group 4') || t.includes('group iv') || t.includes('vao') || t.includes('பொதுத்தமிழ்') || t.includes('polity') || t.includes('police') || t.includes('si') || t.includes('constable') || t.includes('ssc') || t.includes('banking') || t.includes('rrb') || t.includes('nda') || t.includes('cds') || t.includes('agniveer') || t.includes('forest guard')) {
    return [
      {
        id: 'govt_u1',
        unitNumber: 'Unit 1',
        subjectName: 'பொதுத்தமிழ் (General Tamil) & தமிழ்நாடு வரலாறு',
        title: 'தமிழ் இலக்கணம், சங்க இலக்கியம், திருக்குறள் & கீழடி அகழாய்வு',
        tamilTitle: 'அலகு 1: பொதுத்தமிழ் & தமிழ்நாடு மரபு',
        chapters: [
          {
            id: 'govt_c1',
            chapterNumber: 1,
            title: 'இலக்கணம்: எழுத்து, சொல், பொருள், யாப்பு, அணி & வேற்றுமை உருபுகள்',
            tamilTitle: 'தமிழ் இலக்கணம்',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: 'govt_c1_s1',
                title: 'எழுத்திலக்கணம், சொல்லிலக்கணம் & தொகாநிலைத் தொடர்கள்',
                microTopics: [
                  { id: 'govt_m1', title: 'சார்பெழுத்துகள் 10 வகை: உயிர்மெய், ஆய்தம், உயிரளபெடை (இசைநிறை, சொல்லிசை, இன்னிசை) & ஒற்றளபெடை', keyAxiom: 'உயிரளபெடை செய்யுளில் ஓசை குறையும் போது அளபெடுக்கும்; மூன்று மாத்திரை பெறும்.', formulaOrRule: 'உயிரளபெடை = 3 மாத்திரை, ஒற்றளபெடை = 1 மாத்திரை', pyqFrequency: 'Very High' },
                  { id: 'govt_m2', title: 'வேற்றுமை உருபுகள் (ஐ, ஆல், கு, இன், அது, கண்) & இரண்டாம், நான்காம் வேற்றுமை மயக்கம்', keyAxiom: 'முதல் வேற்றுமைக்கும் எட்டாம் வேற்றுமைக்கும் உருபுகள் இல்லை.', formulaOrRule: '2:ஐ, 3:ஆல்/ஆன், 4:கு, 5:இன்/இல், 6:அது, 7:கண்', pyqFrequency: 'Very High' }
                ]
              }
            ]
          },
          {
            id: 'govt_c2',
            chapterNumber: 2,
            title: 'திருக்குறள் 25 அதிகாரங்கள் & சங்க இலக்கியம் (எட்டுத்தொகை, பத்துப்பாட்டு)',
            tamilTitle: 'தமிழ் இலக்கியம்',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: 'govt_c2_s1',
                title: 'அறத்துப்பால், பொருட்பால் & கீழடி அகழாய்வு சான்றுகள்',
                microTopics: [
                  { id: 'govt_m3', title: 'திருக்குறள்: அறிவுடைமை, ஒழுக்கமுடைமை, காலமறிதல் & செங்கோன்மை அதிகாரங்கள்', keyAxiom: 'அறிவுடையார் ஆவது அறிவார் அறிவிலார் அஃதறி கல்லா தவர் (அதிகாரம்: அறிவுடைமை).', pyqFrequency: 'Very High' },
                  { id: 'govt_m4', title: 'கீழடி அகழாய்வு: வைகை நதிக்கரை நாகரிகம், தமிழ்-பிராமி பானை ஓடுகள் & நகர கட்டமைப்பு', keyAxiom: 'கீழடி நகர நாகரிகம் கிமு 6-ஆம் நூற்றாண்டைச் சேர்ந்தது என கதிரியக்க கரிம ஆய்வுகள் நிரூபித்துள்ளன.', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'govt_u2',
        unitNumber: 'Unit 2',
        subjectName: 'General Studies & Indian Polity (இந்திய அரசியலமைப்பு)',
        title: 'Fundamental Rights, Parliament, Supreme Court & TN Administration',
        tamilTitle: 'அலகு 2: இந்திய அரசியலமைப்பு & தமிழ்நாடு நிர்வாகம்',
        chapters: [
          {
            id: 'govt_c3',
            chapterNumber: 3,
            title: 'Indian Constitution: Articles 14 to 32, Writs & Directive Principles (DPSP)',
            tamilTitle: 'அடிப்படை உரிமைகள் & நெறிமுறைக் கோட்பாடுகள்',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: 'govt_c3_s1',
                title: 'Constitutional Articles & Judicial Review',
                microTopics: [
                  { id: 'govt_m5', title: 'Article 32: Constitutional Remedies & 5 Types of Writs (Habeas Corpus, Mandamus, Prohibition, Quo-Warranto, Certiorari)', keyAxiom: 'Dr. B.R. Ambedkar designated Article 32 as the "Heart and Soul of the Constitution".', formulaOrRule: 'SC: Art 32, HC: Art 226', pyqFrequency: 'Very High' },
                  { id: 'govt_m6', title: '73rd & 74th Constitutional Amendments: Panchayati Raj & Municipalities 3-Tier System', keyAxiom: '11th Schedule contains 29 functional items for Panchayats; 12th Schedule contains 18 items for Urban local bodies.', pyqFrequency: 'Very High' },
                  { id: 'govt_m7', title: 'Aptitude & Mental Ability: HCF/LCM, Simple/Compound Interest, Time & Work Short-Tricks', keyAxiom: 'Product of two numbers equals Product of their HCF and LCM: A × B = HCF(A,B) × LCM(A,B).', formulaOrRule: 'A × B = HCF × LCM, Work = Efficiency × Time', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      }
    ];
  }

  // 6. CLASS 11 & 12 HSC (Tamil Nadu State Board Samacheer Kalvi)
  if (t.includes('11th') || t.includes('12th') || t.includes('hsc') || t.includes('plus one') || t.includes('plus two')) {
    return [
      {
        id: 'hsc_u1',
        unitNumber: 'Unit 1',
        subjectName: 'இயற்பியல் & கணிதம் (Physics & Mathematics)',
        title: 'நிலைமின்னியல், மின்னோட்டவியல், அணிகள் & வகை நுண்கணிதம்',
        tamilTitle: 'அலகு 1: இயற்பியல் & கணிதவியல்',
        chapters: [
          {
            id: 'hsc_c1',
            chapterNumber: 1,
            title: 'நிலைமின்னியல்: கூலும் விதி, காஸ் விதி & மின்புலக் கோடுகள்',
            tamilTitle: 'நிலைமின்னியல் & மின்சுற்றுகள்',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: 'hsc_c1_s1',
                title: 'கூலும் விசை & காஸ் தேற்றம்',
                microTopics: [
                  { id: 'hsc_m1', title: 'கூலும் விதி: F = (1/4πε₀)(q₁q₂/r²) மற்றும் மின்புலச் செறிவு E = F/q', keyAxiom: 'மின்புலக் கோடுகள் நேர்மின்னூட்டத்தில் தொடங்கி எதிர்மின்னூட்டத்தில் முடிவடையும்.', formulaOrRule: 'F = (1/4πε₀)(q₁q₂/r²), E = kq/r²', pyqFrequency: 'Very High' },
                  { id: 'hsc_m2', title: 'வீட்ஸ்டோன் சமனச் சுற்று நிபந்தனை: P/Q = R/S & மீட்ட சமனச் சுற்று', keyAxiom: 'கால்வனோமீட்டரில் சுழி விலகல் ஏற்படும் போது சமனச் சுற்று சமநிலையில் இருக்கும்.', formulaOrRule: 'P/Q = R/S', pyqFrequency: 'Very High' }
                ]
              }
            ]
          },
          {
            id: 'hsc_c2',
            chapterNumber: 2,
            title: 'அணிகள்: நேர்மாறு அணி A⁻¹ = (1/|A|) adj(A) & கிரேமரின் விதி',
            tamilTitle: 'அணிகள் மற்றும் அணிக்கோவைகள்',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: 'hsc_c2_s1',
                title: 'அணிக்கோவைகள் & சமன்பாட்டுத் தொகுப்புகள்',
                microTopics: [
                  { id: 'hsc_m3', title: 'நேர்மாறு அணி காணுதல்: A⁻¹ = (1/|A|) adj(A) மற்றும் |A| ≠ 0 நிபந்தனை', keyAxiom: 'பூச்சியமற்ற அணிக்கோவை உடைய சதுர அணிக்கு மட்டுமே நேர்மாறு அணி உண்டு.', formulaOrRule: 'A⁻¹ = (1/|A|) adj(A)', pyqFrequency: 'Very High' },
                  { id: 'hsc_m4', title: 'கிரேமரின் விதி மூலம் நேரியல் சமன்பாடுகளைத் தீர்த்தல் (x = Δx/Δ, y = Δy/Δ)', keyAxiom: 'Δ ≠ 0 எனில் சமன்பாட்டுத் தொகுப்பிற்கு ஒரே ஒரு தனித்த தீர்வு உண்டு.', formulaOrRule: 'x = Δx/Δ, y = Δy/Δ, z = Δz/Δ', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'hsc_u2',
        unitNumber: 'Unit 2',
        subjectName: 'வேதியியல், உயிரியல் & கணினி அறிவியல்',
        title: 'மின்வேதியியல், மரபியல், தாவர உடலியங்கியல் & பைதான் நிரலாக்கம்',
        tamilTitle: 'அலகு 2: வேதியியல், உயிரியல் & கணினி அறிவியல்',
        chapters: [
          {
            id: 'hsc_c3',
            chapterNumber: 3,
            title: 'நேர்ன்ஸ்ட் சமன்பாடு & டிஎன்ஏ இரட்டிப்பாதல்',
            tamilTitle: 'வேதியியல் & மூலக்கூறு மரபியல்',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: 'hsc_c3_s1',
                title: 'மின்முனை மின்னழுத்தம் & டிஎன்ஏ மூலக்கூறு',
                microTopics: [
                  { id: 'hsc_m5', title: 'நேர்ன்ஸ்ட் சமன்பாடு: E = E° - (0.0591/n) log Q மற்றும் மின்கல மின்னழுத்தம்', keyAxiom: 'மின்கலத்தின் மின்னியக்கு விசை அயனிகளின் செறிவைச் சார்ந்தது.', formulaOrRule: 'E = E° - (0.0591/n)log Q', pyqFrequency: 'Very High' },
                  { id: 'hsc_m6', title: 'டிஎன்ஏ இரட்டிப்பாதல்: ஒகசாகி துண்டுகள், லேகிங் இழை & டிஎன்ஏ பாலிமரேஸ்', keyAxiom: 'டிஎன்ஏ இரட்டிப்பாதல் அரை பழமை பேணும் (Semi-conservative) முறையில் நிகழ்கிறது.', formulaOrRule: '5\' -> 3\' Directionality', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      }
    ];
  }

  // 7. CLASS 10 SSLC (Tamil Nadu State Board Samacheer Kalvi)
  if (t.includes('10th') || t.includes('sslc') || t.includes('பத்தாம் வகுப்பு')) {
    return [
      {
        id: 'sslc_u1',
        unitNumber: 'Unit 1',
        subjectName: 'கணிதம் (Mathematics)',
        title: 'உறவுகளும் சார்புகளும், எண்களும் தொடர்வரிசைகளும் & இயற்கணிதம்',
        tamilTitle: 'அலகு 1: பத்தாம் வகுப்பு கணிதம்',
        chapters: [
          {
            id: 'sslc_c1',
            chapterNumber: 1,
            title: 'கார்டீசியன் பெருக்கல் & கூட்டுத்தொடர் வரிசை (AP/GP)',
            tamilTitle: 'உறவுகள் & தொடர்வரிசைகள்',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: 'sslc_c1_s1',
                title: 'கார்டீசியன் பெருக்கல் & தொடர்வரிசைகள்',
                microTopics: [
                  { id: 'sslc_m1', title: 'கார்டீசியன் பெருக்கல்: n(A×B) = n(A) · n(B) மற்றும் சார்புகளின் வகைகள்', keyAxiom: 'ஒவ்வொரு உள்ளீட்டிற்கும் (domain) ஒரே ஒரு நிழலுரு (range) மட்டுமே இருக்க வேண்டும்.', formulaOrRule: 'n(A×B) = n(A) × n(B)', pyqFrequency: 'Very High' },
                  { id: 'sslc_m2', title: 'கூட்டுத்தொடர் வரிசை: tn = a + (n-1)d மற்றும் முதல் n உறுப்புகளின் கூடுதல் Sn', keyAxiom: 'அடுத்தடுத்த இரண்டு உறுப்புகளுக்கு இடையேயான பொது வித்தியாசம் (d) சமமாக இருக்கும்.', formulaOrRule: 'tn = a + (n-1)d, Sn = (n/2)[2a + (n-1)d]', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'sslc_u2',
        unitNumber: 'Unit 2',
        subjectName: 'அறிவியல் (Science — Physics, Chemistry, Biology)',
        title: 'இயக்க விதிகள், ஒளியியல், வேதிவினைகளின் வகைகள் & தாவர உள்ளமைப்பியல்',
        tamilTitle: 'அலகு 2: பத்தாம் வகுப்பு அறிவியல்',
        chapters: [
          {
            id: 'sslc_c2',
            chapterNumber: 2,
            title: 'நியூட்டனின் இயக்க விதிகள் & லென்ஸ் சமன்பாடு',
            tamilTitle: 'இயற்பியல் & வேதியியல்',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: 'sslc_c2_s1',
                title: 'விசை, உந்தம் & ஒளிவிலகல்',
                microTopics: [
                  { id: 'sslc_m3', title: 'நியூட்டனின் இரண்டாம் விதி F = ma & நேர்க்கோட்டு உந்த மாறாக்கோட்பாடு', keyAxiom: 'புறவிசை செயல்படாத வரையில் ஒரு அமைப்பின் மொத்த நேர்க்கோட்டு உந்தம் மாறாது.', formulaOrRule: 'F = ma, m1u1 + m2u2 = m1v1 + m2v2', pyqFrequency: 'Very High' },
                  { id: 'sslc_m4', title: 'மெல்லிய லென்ஸ் சமன்பாடு 1/f = 1/v - 1/u & லென்சின் திறன் P = 1/f', keyAxiom: 'குவி லென்சின் குவியத்தூரம் நேர்மதிப்பு; குழி லென்சின் குவியத்தூரம் எதிர்மதிப்பு.', formulaOrRule: '1/f = 1/v - 1/u, P = 1/f (டயாப்டர்)', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'sslc_u3',
        unitNumber: 'Unit 3',
        subjectName: 'தமிழ் & சமூக அறிவியல்',
        title: 'அன்னை மொழியே, அளபெடை, தமிழ்நாட்டில் விடுதலைப் போராட்டம் & இந்திய அரசியலமைப்பு',
        tamilTitle: 'அலகு 3: தமிழ் & சமூக அறிவியல்',
        chapters: [
          {
            id: 'sslc_c3',
            chapterNumber: 3,
            title: 'பாவலரேறு பெருஞ்சித்திரனார் அன்னை மொழியே & வ.உ.சி கப்பலோட்டிய தமிழன்',
            tamilTitle: 'தமிழ் & வரலாறு',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: 'sslc_c3_s1',
                title: 'செய்யுள் & விடுதலைப் போராட்டம்',
                microTopics: [
                  { id: 'sslc_m5', title: 'அன்னை மொழியே: நற்றமிழே, பேரரசே, பாப்பத்தே, எண்தொகையே பாடல் நயம்', keyAxiom: 'கணிச்சாறு தொகுதியிலிருந்து எடுக்கப்பட்ட அன்னை மொழியே செய்யுள் தமிழ் மொழியின் சிறப்பைப் போற்றுகிறது.', pyqFrequency: 'Very High' },
                  { id: 'sslc_m6', title: 'சுதேசிக் கப்பல் நிறுவனம்: வ.உ.சிதம்பரனார் ஆங்கிலேய ஏகபோகத்திற்கு எதிரான போராட்டம்', keyAxiom: 'வ.உ.சி தூத்துக்குடி - கொழும்பு இடையே சுதேசி கப்பல் இயக்கி சுதேசி இயக்கத்திற்கு வித்திட்டார்.', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      }
    ];
  }

  // 8. CLASS 6 TO 9 (Middle School — Samacheer Kalvi)
  if (t.includes('6th') || t.includes('7th') || t.includes('8th') || t.includes('9th') || t.includes('class 6') || t.includes('class 7') || t.includes('class 8') || t.includes('class 9')) {
    return [
      {
        id: 'mid_u1',
        unitNumber: 'Unit 1',
        subjectName: 'கணிதம் (Mathematics)',
        title: 'முழுக்கள், விகிதமுறு எண்கள், இயற்கணிதம் & வாழ்வியல் கணிதம்',
        tamilTitle: 'அலகு 1: கணிதம்',
        chapters: [
          {
            id: 'mid_c1',
            chapterNumber: 1,
            title: 'முழுக்களின் கூட்டல்/கழித்தல் & ஒருபடிச் சமன்பாடுகள்',
            tamilTitle: 'எண் கணிதம் & இயற்கணிதம்',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: 'mid_c1_s1',
                title: 'முழுக்கள் & சமன்பாடுகள்',
                microTopics: [
                  { id: 'mid_m1', title: 'முழுக்களின் பெருக்கல் குறிகள் விதி: (-a) × (-b) = +ab', keyAxiom: 'ஒத்த குறிகளைப் பெருக்கினால் நேர்மதிப்பு; எதிரெதிர் குறிகளைப் பெருக்கினால் எதிர்மதிப்பு.', formulaOrRule: '(-) × (-) = (+), (+) × (-) = (-)', pyqFrequency: 'Very High' },
                  { id: 'mid_m2', title: 'ஒருபடிச் சமன்பாடு தீர்த்தல்: ax + b = c சமன்பாட்டின் தீர்வு x = (c-b)/a', keyAxiom: 'சமன்பாட்டின் இருபுறமும் சமமான செயல்பாடுகளைச் செய்தால் சமநிலை மாறாது.', formulaOrRule: 'ax + b = c => x = (c-b)/a', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'mid_u2',
        unitNumber: 'Unit 2',
        subjectName: 'அறிவியல் (Science)',
        title: 'இயக்கம், விசை, அணு அமைப்பு & மனித உறுப்பு மண்டலங்கள்',
        tamilTitle: 'அலகு 2: அறிவியல்',
        chapters: [
          {
            id: 'mid_c2',
            chapterNumber: 2,
            title: 'இயக்கச் சமன்பாடுகள் & போர் அணு மாதிரி',
            tamilTitle: 'இயற்பியல் & வேதியியல்',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: 'mid_c2_s1',
                title: 'இயக்கம் & அணுக்கள்',
                microTopics: [
                  { id: 'mid_m3', title: 'இயக்கச் சமன்பாடு v = u + at மற்றும் தொலைவு-கால வரைபடம்', keyAxiom: 'தொலைவு-கால வரைபடத்தின் சாய்வு (slope) திசைவேகத்தைக் குறிக்கும்.', formulaOrRule: 'v = u + at, s = ut + 1/2at²', pyqFrequency: 'Very High' },
                  { id: 'mid_m4', title: 'போர் அணு மாதிரி: 2n² எலக்ட்ரான் பகிர்வு விதி (K, L, M, N கூடுகள்)', keyAxiom: 'ஒவ்வொரு ஆற்றல் மட்டத்திலும் இடம்பெறும் அதிகபட்ச எலக்ட்ரான்களின் எண்ணிக்கை 2n² ஆகும்.', formulaOrRule: 'Max electrons = 2n²', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'mid_u3',
        unitNumber: 'Unit 3',
        subjectName: 'சமூக அறிவியல் & தமிழ்',
        title: 'சோழப் பேரரசு, பூமியின் அமைப்பு, இந்திய அரசமைப்பு & நன்னெறித் தமிழ்',
        tamilTitle: 'அலகு 3: சமூக அறிவியல்',
        chapters: [
          {
            id: 'mid_c3',
            chapterNumber: 3,
            title: 'இராசராச சோழன் தஞ்சை பெரிய கோவில் & அடிப்படை உரிமைகள்',
            tamilTitle: 'வரலாறு & குடிமையியல்',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: 'mid_c3_s1',
                title: 'வரலாறு & அரசமைப்பு',
                microTopics: [
                  { id: 'mid_m5', title: 'முதலாம் இராசராசன்: தஞ்சைப் பெருவுடையார் கோயில் கட்டடக் கலை & குடவோலை முறை', keyAxiom: 'உத்திரமேரூர் கல்வெட்டுகள் சோழர் கால உள்ளாட்சி மற்றும் ஜனநாயக குடவோலை முறையை விவரிக்கின்றன.', pyqFrequency: 'Very High' },
                  { id: 'mid_m6', title: 'இந்திய அரசியலமைப்பின் 6 அடிப்படை உரிமைகள் & கடமைகள்', keyAxiom: 'சமத்துவ உரிமை, சுதந்திர உரிமை, சுரண்டலுக்கு எதிரான உரிமை உள்ளிட்ட 6 உரிமைகள் உறுதி செய்யப்பட்டுள்ளன.', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      }
    ];
  }

  // 9. CLASS 1 TO 5 (Primary Education — Foundational Samacheer Kalvi)
  if (t.includes('class 1') || t.includes('class 2') || t.includes('class 3') || t.includes('class 4') || t.includes('class 5') || t.includes('1st') || t.includes('2nd') || t.includes('3rd') || t.includes('4th') || t.includes('5th') || t.includes('basic maths') || t.includes('maths basics')) {
    return [
      {
        id: 'pri_u1',
        unitNumber: 'Unit 1',
        subjectName: 'தமிழ் & ஆங்கிலம் (Tamil & English)',
        title: 'தமிழ் எழுத்துகள், ஆத்திசூடி, ஆங்கில இலக்கணம் & சொல் வளம்',
        tamilTitle: 'அலகு 1: தமிழ் & ஆங்கில மொழித்திறன்',
        chapters: [
          {
            id: 'pri_c1',
            chapterNumber: 1,
            title: 'உயிர், மெய், உயிர்மெய் எழுத்துகள் & எளிய வாக்கியங்கள்',
            tamilTitle: 'தமிழ் எழுத்துகள் & இலக்கணம்',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: 'pri_c1_s1',
                title: 'எழுத்தறிதல் & வாசித்தல்',
                microTopics: [
                  { id: 'pri_m1', title: 'தமிழ் உயிர் எழுத்துகள் (12), மெய் எழுத்துகள் (18), உயிர்மெய் (216), ஆய்தம் (1) = 247 எழுத்துகள்', keyAxiom: 'உயிர் எழுத்தும் மெய் எழுத்தும் சேர்ந்து பிறப்பவை உயிர்மெய் எழுத்துகள் ஆகும்.', formulaOrRule: '12 + 18 + 216 + 1 = 247', pyqFrequency: 'Very High' },
                  { id: 'pri_m2', title: 'ஔவையார் ஆத்திசூடி: "அறஞ்செய விரும்பு", "ஆறுவது சினம்", "இயல்வது கரவேல்"', keyAxiom: 'ஆத்திசூடி அகரவரிசையில் அமைந்த நீதிநூல் ஆகும்.', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'pri_u2',
        unitNumber: 'Unit 2',
        subjectName: 'கணிதம் (Mathematics)',
        title: 'இடமதிப்பு, கூட்டல், கழித்தல், பெருக்கல் வாய்ப்பாடு & வடிவங்கள்',
        tamilTitle: 'அலகு 2: தொடக்கக் கணிதம்',
        chapters: [
          {
            id: 'pri_c2',
            chapterNumber: 2,
            title: 'இடமதிப்பு & பெருக்கல் வாய்ப்பாடுகள் (2 முதல் 10 வரை)',
            tamilTitle: 'எண் கணிதம்',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: 'pri_c2_s1',
                title: 'எண் கணிதம் & வாய்ப்பாடு',
                microTopics: [
                  { id: 'pri_m3', title: 'இடமதிப்பு: ஒன்றுகள், பத்துகள், நூறுகள், ஆயிரங்கள் & எண்களை விரித்தெழுதுதல்', keyAxiom: 'ஒவ்வொரு இடமும் முந்தைய இடத்தின் மதிப்பை விட 10 மடங்கு அதிகம்.', pyqFrequency: 'Very High' },
                  { id: 'pri_m4', title: 'பெருக்கல் வாய்ப்பாடு: 2 முதல் 10 வரை மற்றும் எளிய கணக்குகள்', keyAxiom: 'பெருக்கல் என்பது தொடர் கூட்டலின் சுருக்கமான வடிவமாகும்.', formulaOrRule: 'a × b = b + b + ... (a முறை)', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'pri_u3',
        unitNumber: 'Unit 3',
        subjectName: 'சூழ்நிலையியல் / அறிவியல் (EVS)',
        title: 'தாவரங்கள், விலங்குகள், நீர் சுழற்சி & தனிநபர் சுகாதாரம்',
        tamilTitle: 'அலகு 3: சூழ்நிலையியல்',
        chapters: [
          {
            id: 'pri_c3',
            chapterNumber: 3,
            title: 'தாவர பாகங்கள், ஒளிச்சேர்க்கை & நீர் சேமிப்பு',
            tamilTitle: 'அறிவியல் & இயற்கை',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: 'pri_c3_s1',
                title: 'இயற்கை & சுகாதாரம்',
                microTopics: [
                  { id: 'pri_m5', title: 'தாவரத்தின் முதன்மை பாகங்கள்: வேர், தண்டு, இலை, பூ, காய், கனி & அவற்றின் பணிகள்', keyAxiom: 'வேர் மண்ணிலிருந்து நீரையும் கனிமங்களையும் உறிஞ்சி தாவரத்திற்கு அளிக்கிறது.', pyqFrequency: 'High' },
                  { id: 'pri_m6', title: 'நீர் சுழற்சி: ஆவியாதல், ஆவி சுருங்குதல், மழை & மழைநீர் சேகரிப்பு', keyAxiom: 'சூரிய வெப்பத்தால் நீர் நிலைகளிலிருந்து நீர் ஆவியாகி மேகமாகி மழையாகப் பொழிகிறது.', pyqFrequency: 'High' }
                ]
              }
            ]
          }
        ]
      }
    ];
  }

  // 10. UKG & LKG (Early Childhood Education)
  if (t.includes('lkg') || t.includes('ukg') || t.includes('kg') || t.includes('kindergarten')) {
    return [
      {
        id: 'kg_u1',
        unitNumber: 'Unit 1',
        subjectName: 'தமிழ் & ஆங்கில ஒலிப்பு (Language & Phonics)',
        title: 'தமிழ் உயிர் எழுத்துகள், Phonics A-Z, CVC Words & மழலையர் பாடல்கள்',
        tamilTitle: 'அலகு 1: மொழி ஒலிப்பு & எழுத்துகள்',
        chapters: [
          {
            id: 'kg_c1',
            chapterNumber: 1,
            title: 'ஆங்கில A-Z எழுத்துகள் ஒலிப்பு & தமிழ் உயிர் எழுத்துகள்',
            tamilTitle: 'ஒலிப்பு முறைகள்',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: 'kg_c1_s1',
                title: 'எழுத்து & ஒலி',
                microTopics: [
                  { id: 'kg_m1', title: 'Phonics A-Z: A for Apple (/æ/), B for Ball (/b/), C for Cat (/k/) ஒலிப்பு முறைகள்', keyAxiom: 'ஒலிப்பு முறை (Phonics) மூலம் எழுத்துகளின் ஒலிகளை இணைத்து வாசிக்க முடியும்.', pyqFrequency: 'Very High' },
                  { id: 'kg_m2', title: 'தமிழ் உயிர் எழுத்துகள் அ முதல் ஔ வரை படம் பார்த்து அறிதல்', keyAxiom: 'அ - அம்மா, ஆ - ஆடு, இ - இலை என படங்களோடு இணைத்துக் கற்றல்.', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'kg_u2',
        unitNumber: 'Unit 2',
        subjectName: 'எண்கள் & வடிவங்கள் (Numbers & Shapes)',
        title: 'எண்கள் 1-50, எண்ணுதல், வடிவங்கள் (வட்டம், சதுரம்) & வண்ணங்கள்',
        tamilTitle: 'அலகு 2: எண்களும் வடிவங்களும்',
        chapters: [
          {
            id: 'kg_c2',
            chapterNumber: 2,
            title: 'பொருள்களை எண்ணுதல் 1-20 & வடிவங்களை அடையாளம் காணுதல்',
            tamilTitle: 'எண்ணுதல் & வடிவங்கள்',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: 'kg_c2_s1',
                title: 'எண்கள் & வண்ணங்கள்',
                microTopics: [
                  { id: 'kg_m3', title: 'பொருள்களை 1 முதல் 20 வரை விரல் வைத்து எண்ணும் பயிற்சி', keyAxiom: 'ஒவ்வொரு பொருளுக்கும் ஒரு எண் என்ற விகிதத்தில் எண்ண வேண்டும் (1-to-1 Correspondence).', pyqFrequency: 'Very High' },
                  { id: 'kg_m4', title: 'அடிப்படை வடிவங்கள்: வட்டம், சதுரம், முக்கோணம், செவ்வகம் & முதன்மை வண்ணங்கள்', keyAxiom: 'வட்டத்திற்கு பக்கங்கள் இல்லை; சதுரத்திற்கு நான்கு சம பக்கங்கள் உண்டு.', pyqFrequency: 'High' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'kg_u3',
        unitNumber: 'Unit 3',
        subjectName: 'பொது அறிவு & நற்பழக்கங்கள் (General Awareness)',
        title: 'உடல் உறுப்புகள், விலங்குகள், பழங்கள் & நல்ல பழக்கவழக்கங்கள்',
        tamilTitle: 'அலகு 3: நற்பழக்கங்கள்',
        chapters: [
          {
            id: 'kg_c3',
            chapterNumber: 3,
            title: 'உடல் பாகங்கள் & தினசரி நல்ல பழக்கங்கள்',
            tamilTitle: 'சுய ஒழுக்கம் & சூழல்',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: 'kg_c3_s1',
                title: 'உடல் & பழக்கங்கள்',
                microTopics: [
                  { id: 'kg_m5', title: 'கண்கள், காதுகள், மூக்கு, வாய், கைகள் - ஐந்து புலன்களின் பயன்பாடுகள்', keyAxiom: 'ஐந்து புலன் உறுப்புகளும் நாம் உலகை உணர உதவுகின்றன.', pyqFrequency: 'High' },
                  { id: 'kg_m6', title: 'காலை எழுந்தவுடன் பல் துலக்குதல், கை கழுவுதல் & தூய்மைப் பழக்கங்கள்', keyAxiom: 'சுத்தம் சுகம் தரும்; ஆரோக்கியமான பழக்கங்கள் நோயைத் தடுக்கும்.', pyqFrequency: 'High' }
                ]
              }
            ]
          }
        ]
      }
    ];
  }

  // 11. COLLEGE, ENGINEERING & SPOKEN ENGLISH (UG / PG Degrees)
  if (t.includes('college') || t.includes('engineering') || t.includes('spoken english') || t.includes('data structures') || t.includes('architecture') || t.includes('degree') || t.includes('b.tech') || t.includes('trb')) {
    return [
      {
        id: 'col_u1',
        unitNumber: 'Unit 1',
        subjectName: 'Computer Science Core & Data Structures',
        title: 'Linear & Non-Linear Data Structures, Tree Traversal & Algorithm Complexity',
        tamilTitle: 'அலகு 1: தரவு அமைப்புகள் & அல்காரிதம்',
        chapters: [
          {
            id: 'col_c1',
            chapterNumber: 1,
            title: 'Arrays, Linked Lists, Stacks, Queues & AVL Trees',
            tamilTitle: 'தரவு கட்டமைப்புகள்',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: 'col_c1_s1',
                title: 'Asymptotic Notation & Self-Balancing Trees',
                microTopics: [
                  { id: 'col_m1', title: 'Big-O Time Complexity: Array O(1) Index Access vs Singly Linked List O(N) Search', keyAxiom: 'Contiguous memory in arrays permits instant pointer arithmetic computation.', formulaOrRule: 'Array Access: O(1), LL Search: O(N)', pyqFrequency: 'Very High' },
                  { id: 'col_m2', title: 'AVL Tree Self-Balancing via LL, RR, LR, RL Rotations: Balance Factor in {-1, 0, +1}', keyAxiom: 'Height balance factor guarantees O(log N) worst-case search, insertion, and deletion.', formulaOrRule: 'BF = Height(Left) - Height(Right)', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'col_u2',
        unitNumber: 'Unit 2',
        subjectName: 'Operating Systems & Database Architecture',
        title: 'Process Scheduling, Mutex/Semaphores & ACID Transactions / B-Trees',
        tamilTitle: 'அலகு 2: இயங்குதளங்கள் & தரவுத்தளங்கள்',
        chapters: [
          {
            id: 'col_c2',
            chapterNumber: 2,
            title: 'OS Process Concurrency & SQL Relational Normalisation',
            tamilTitle: 'இயங்குதளம் & SQL',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: 'col_c2_s1',
                title: 'Concurrency & ACID Transactions',
                microTopics: [
                  { id: 'col_m3', title: 'Dijkstra\'s Semaphores: Wait(S) and Signal(S) to Prevent Deadlock & Race Conditions', keyAxiom: 'Mutual exclusion ensures only one process enters critical section simultaneously.', formulaOrRule: 'Wait(S): while(S<=0); S--; | Signal(S): S++;', pyqFrequency: 'Very High' },
                  { id: 'col_m4', title: 'ACID Properties (Atomicity, Consistency, Isolation, Durability) in PostgreSQL', keyAxiom: 'WAL (Write-Ahead Logging) guarantees durability and crash recovery.', formulaOrRule: 'ACID + B-Tree Indexes', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'col_u3',
        unitNumber: 'Unit 3',
        subjectName: 'Professional Communication & Spoken English',
        title: 'Fluency, Phrasal Verbs, Business Presentations & Interview Skills',
        tamilTitle: 'அலகு 3: ஆங்கில உரையாடல் & வேலைவாய்ப்புத் திறன்',
        chapters: [
          {
            id: 'col_c3',
            chapterNumber: 3,
            title: 'Conversational Fluency, Active Listening & Corporate Presentations',
            tamilTitle: 'ஆங்கில உரையாடல்',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: 'col_c3_s1',
                title: 'Fluency & Corporate Communication',
                microTopics: [
                  { id: 'col_m5', title: 'Overcoming Hesitation: Thought-to-Speech Flow, Linking Words & Voice Modulation', keyAxiom: 'Fluency develops through continuous spontaneous output without mental translation.', pyqFrequency: 'Very High' },
                  { id: 'col_m6', title: 'Top 50 Workplace Idioms, Phrasal Verbs & Formal Email Etiquette', keyAxiom: 'Clear professional phrasing improves cross-cultural collaboration and career mobility.', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      }
    ];
  }

  // 12. UNIVERSAL ACADEMIC FALLBACK (Dynamic course-adapted master syllabus)
  return [
    {
      id: 'gen_u1',
      unitNumber: 'Unit 1',
      subjectName: 'Foundations & Core Principles',
      title: `${cleanTitle} — Core Axioms, Principles & Theory`,
      tamilTitle: `அலகு 1: ${cleanTitle} — அடிப்படை கோட்பாடுகள்`,
      chapters: [
        {
          id: 'gen_c1',
          chapterNumber: 1,
          title: `Foundational Frameworks of ${cleanTitle}`,
          tamilTitle: 'அடிப்படை விதிகள்',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          youtubeId: 'dQw4w9WgXcQ',
          subtopics: [
            {
              id: 'gen_c1_s1',
              title: 'Governing Definitions & Problem Solving',
              microTopics: [
                { id: 'gen_m1', title: `Core Axioms & Governing Relationships of ${cleanTitle}`, keyAxiom: 'Every problem begins by identifying governing equations and standard boundary conditions.', formulaOrRule: 'Output = Rate × Invariant_Parameter', pyqFrequency: 'Very High' },
                { id: 'gen_m2', title: `Boundary Conditions, SI Unit Standards & Error Elimination in ${cleanTitle}`, keyAxiom: 'Strict SI unit consistency prevents power-of-10 calculation errors.', pyqFrequency: 'Very High' }
              ]
            }
          ]
        },
        {
          id: 'gen_c2',
          chapterNumber: 2,
          title: `Analytical Applications & Derivations in ${cleanTitle}`,
          tamilTitle: 'பகுப்பாய்வு மற்றும் பயன்பாடுகள்',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          youtubeId: 'dQw4w9WgXcQ',
          subtopics: [
            {
              id: 'gen_c2_s1',
              title: 'Derivations & Real-World Systems',
              microTopics: [
                { id: 'gen_m3', title: `Step-by-Step Mathematical Formulation & Proofs for ${cleanTitle}`, keyAxiom: 'Applying systematic algebraic transformations guarantees dimensional balance.', pyqFrequency: 'High' },
                { id: 'gen_m4', title: `Top Ranker Shortcuts & 45-Second Exam Elimination Traps in ${cleanTitle}`, keyAxiom: 'Checking dimensional homogeneity eliminates at least 2 multiple-choice options.', pyqFrequency: 'Very High' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'gen_u2',
      unitNumber: 'Unit 2',
      subjectName: 'Advanced Applications & Real-World Case Studies',
      title: `${cleanTitle} — Practical Implementation, Case Studies & Solutions`,
      tamilTitle: `அலகு 2: ${cleanTitle} — நடைமுறை பயன்பாடுகள்`,
      chapters: [
        {
          id: 'gen_c3',
          chapterNumber: 3,
          title: `Industry & Examination Mastery in ${cleanTitle}`,
          tamilTitle: 'தேர்வு மற்றும் தொழில்முறை தேர்ச்சி',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          youtubeId: 'dQw4w9WgXcQ',
          subtopics: [
            {
              id: 'gen_c3_s1',
              title: 'Comprehensive Review & Practice Problems',
              microTopics: [
                { id: 'gen_m5', title: `High-Yield Question Patterns & Multi-Variable Scenarios in ${cleanTitle}`, keyAxiom: 'Practicing boundary-case variations builds robust conceptual and calculation mastery.', pyqFrequency: 'Very High' },
                { id: 'gen_m6', title: `Comprehensive Summary, Memory Mnemonics & Formula Cheat Sheet in ${cleanTitle}`, keyAxiom: 'Structured mnemonics accelerate long-term memory retrieval during time-pressured exams.', pyqFrequency: 'High' }
              ]
            }
          ]
        }
      ]
    }
  ];
}
