/**
 * Master Real-World Academic Course Catalog with 5-Level Syllabus Hierarchy:
 * Course -> Units -> Chapters -> Topics -> Subtopics -> Micro-topics
 * Full coverage: School (LKG to Class 12), NEET/JEE, TNPSC/UPSC, College, and AI Tech Skills.
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
// SYLLABUS RESOLVER FOR ALL CLASSES (LKG to Class 12) & BEYOND
// ----------------------------------------------------
export function getCourseSyllabus(courseTitle: string, category: string = ''): SyllabusUnit[] {
  const t = (courseTitle || '').toLowerCase();

  // 1. LKG
  if (t.includes('lkg') || t.includes('lower kindergarten')) {
    return [
      {
        id: 'lkg_tam',
        unitNumber: 'பகுதி 1',
        subjectName: 'தமிழ் (Tamil Early)',
        title: 'தமிழ் உயிர் எழுத்துக்கள் அறிமுகம் (அ முதல் ஔ வரை)',
        chapters: [
          {
            id: 'lkg_tam_c1',
            chapterNumber: 1,
            title: 'உயிர் எழுத்துக்கள் (அ, ஆ, இ, ஈ) & எளிய சொற்கள்',
            tamilTitle: 'உயிர் எழுத்துக்கள் பாட்டு',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: 'lkg_tam_s1',
                title: 'அ - அம்மா, ஆ - ஆடு பட விளக்கங்கள்',
                microTopics: [
                  { id: 'lkg_tam_m1', title: 'அ முதல் ஔ வரையிலான 12 உயிர் எழுத்துக்களின் உச்சரிப்பு', keyAxiom: 'உயிர் எழுத்துக்கள் 12 தனித்து இயங்கும் ஆற்றல் கொண்டவை.', pyqFrequency: 'High' },
                  { id: 'lkg_tam_m2', title: 'எழுத்துக்களோடு தொடங்கும் எளிய சொற்கள் மற்றும் படங்கள்', keyAxiom: 'படங்களை அடையாளம் கண்டு முதல் எழுத்தை ஒலித்தல்.', pyqFrequency: 'Medium' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'lkg_eng',
        unitNumber: 'Unit 2',
        subjectName: 'English (Phonics & ABC)',
        title: 'Alphabet Phonics A-Z & Rhymes',
        chapters: [
          {
            id: 'lkg_eng_c1',
            chapterNumber: 1,
            title: 'Phonic Sounds of A to Z with Picture Association',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: 'lkg_eng_s1',
                title: 'Letter Identification & Auditory Discrimination',
                microTopics: [
                  { id: 'lkg_eng_m1', title: 'Letter sounds A (/æ/) to Z (/z/) and tracing direction', keyAxiom: 'Phonics connects written letters directly to spoken sounds.', pyqFrequency: 'High' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'lkg_math',
        unitNumber: 'Unit 3',
        subjectName: 'Mathematics (Early Numbers)',
        title: 'Numbers 1 to 20 & Shapes Recognition',
        chapters: [
          {
            id: 'lkg_mat_c1',
            chapterNumber: 1,
            title: 'Counting Objects 1 to 20 and Basic 2D Shapes',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: 'lkg_mat_s1',
                title: 'One-to-One Correspondence and Shapes (Circle, Square, Triangle)',
                microTopics: [
                  { id: 'lkg_mat_m1', title: 'Counting with physical objects & Big vs Small comparison', keyAxiom: 'Cardinality rule: the last count represents total quantity.', formulaOrRule: 'Count 1 to 20', pyqFrequency: 'High' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'lkg_evs',
        unitNumber: 'Unit 4',
        subjectName: 'General Awareness / EVS',
        title: 'My World: Colors, Fruits, Animals & Good Habits',
        chapters: [
          {
            id: 'lkg_evs_c1',
            chapterNumber: 1,
            title: 'Identifying Animals, Fruits, Vegetables & Hygiene',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: 'lkg_evs_s1',
                title: 'Daily Cleanliness & Environmental Awareness',
                microTopics: [
                  { id: 'lkg_evs_m1', title: 'Good manners (Please, Thank You) and handwashing hygiene', keyAxiom: 'Personal hygiene and polite speech form character foundations.', pyqFrequency: 'Medium' }
                ]
              }
            ]
          }
        ]
      }
    ];
  }

  // 2. UKG
  if (t.includes('ukg') || t.includes('upper kindergarten')) {
    return [
      {
        id: 'ukg_tam',
        unitNumber: 'பகுதி 1',
        subjectName: 'தமிழ் (Tamil UKG)',
        title: 'மெய் எழுத்துக்கள் (18) & எளிய சொல் உருவாக்கம்',
        chapters: [
          {
            id: 'ukg_tam_c1',
            chapterNumber: 1,
            title: 'க் முதல் ன் வரை 18 மெய் எழுத்துக்கள் & ஆய்த எழுத்து',
            tamilTitle: 'மெய் எழுத்துக்கள் பயிற்சி',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: 'ukg_tam_s1',
                title: 'வல்லினம், மெல்லினம், இடையினம் அறிமுகம்',
                microTopics: [
                  { id: 'ukg_tam_m1', title: 'மெய் எழுத்துக்கள் 18 (க், ங், ச், ஞ், ட், ண்...) புள்ளி வைத்த எழுத்துக்கள்', keyAxiom: 'மெய் எழுத்துக்களின் ஒலி அரை மாத்திரை அளவு கொண்டது.', pyqFrequency: 'High' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'ukg_eng',
        unitNumber: 'Unit 2',
        subjectName: 'English (Sight Words & Vowels)',
        title: 'Vowels (A,E,I,O,U), 3-Letter Words & Simple Sentences',
        chapters: [
          {
            id: 'ukg_eng_c1',
            chapterNumber: 1,
            title: 'CVC Words (Cat, Dog, Sun) & High-Frequency Sight Words',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: 'ukg_eng_s1',
                title: 'Consonant-Vowel-Consonant Blending',
                microTopics: [
                  { id: 'ukg_eng_m1', title: 'Blending 3-letter phonetic words and reading simple sentences', keyAxiom: 'Vowels provide vocalic nucleus for English syllables.', formulaOrRule: 'C + V + C', pyqFrequency: 'High' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'ukg_math',
        unitNumber: 'Unit 3',
        subjectName: 'Mathematics (Numbers & Basic Addition)',
        title: 'Numbers 1 to 50, Single-Digit Addition & Subtraction',
        chapters: [
          {
            id: 'ukg_mat_c1',
            chapterNumber: 1,
            title: 'Forward & Backward Counting, Simple Addition (+)',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: 'ukg_mat_s1',
                title: 'Visual Addition using Number Lines & Finger Counting',
                microTopics: [
                  { id: 'ukg_mat_m1', title: 'Single-digit addition facts up to 10 (e.g., 3 + 4 = 7)', keyAxiom: 'Addition represents combining two discrete sets of items.', formulaOrRule: 'a + b = c', pyqFrequency: 'High' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'ukg_evs',
        unitNumber: 'Unit 4',
        subjectName: 'Environmental Studies (EVS)',
        title: 'My Family, Seasons, Community Helpers & Solar System',
        chapters: [
          {
            id: 'ukg_evs_c1',
            chapterNumber: 1,
            title: 'Community Helpers (Doctor, Teacher, Farmer) & Seasons',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: 'ukg_evs_s1',
                title: 'Role of Community Helpers & Basic Climate Cycles',
                microTopics: [
                  { id: 'ukg_evs_m1', title: 'Understanding community professions and weather seasons', keyAxiom: 'Human society functions through interdependent specialized roles.', pyqFrequency: 'Medium' }
                ]
              }
            ]
          }
        ]
      }
    ];
  }

  // 3. Class 1 (1st Standard)
  if (t.includes('class 1') || t.includes('1st standard') || t.includes('1-ஆம் வகுப்பு')) {
    return [
      {
        id: 'c1_tam',
        unitNumber: 'பகுதி 1',
        subjectName: 'தமிழ் (Tamil)',
        title: 'உயிர்மெய் எழுத்துக்கள் & ஆத்திசூடி',
        chapters: [
          {
            id: 'c1_tam_c1',
            chapterNumber: 1,
            title: 'உயிர்மெய் எழுத்துக்கள் உருவாக்கம் (216) & ஒளவையார் ஆத்திசூடி',
            tamilTitle: 'உயிர்மெய் எழுத்துக்கள் & அறநெறி',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: 'c1_tam_s1',
                title: 'க் + அ = க வரிசை வாய்ப்பாடுகள்',
                microTopics: [
                  { id: 'c1_tam_m1', title: 'உயிர் (12) x மெய் (18) = 216 உயிர்மெய் எழுத்துக்கள்', keyAxiom: 'மெய்யெழுத்தின் மீது உயிரெழுத்து ஏறி உருவாவது உயிர்மெய்.', formulaOrRule: '12 x 18 = 216', pyqFrequency: 'High' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'c1_eng',
        unitNumber: 'Unit 2',
        subjectName: 'English',
        title: 'Naming Words (Nouns), Action Words & Story Reading',
        chapters: [
          {
            id: 'c1_eng_c1',
            chapterNumber: 1,
            title: 'Nouns (Person, Place, Animal, Thing) & Simple Sentences',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: 'c1_eng_s1',
                title: 'Identifying Common Nouns and Verbs',
                microTopics: [
                  { id: 'c1_eng_m1', title: 'Subject-Verb agreement in simple present tense', keyAxiom: 'A sentence must contain a naming word and an action word.', formulaOrRule: 'Subject + Verb', pyqFrequency: 'High' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'c1_mat',
        unitNumber: 'Unit 3',
        subjectName: 'Mathematics',
        title: 'Numbers 1 to 100, Place Value (Tens & Ones) & Measurement',
        chapters: [
          {
            id: 'c1_mat_c1',
            chapterNumber: 1,
            title: 'Place Value up to 99, 2-Digit Addition & Subtraction',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: 'c1_mat_s1',
                title: 'Bundles of 10s and Loose 1s Place Value System',
                microTopics: [
                  { id: 'c1_mat_m1', title: 'Decomposing 2-digit numbers into Tens and Ones', keyAxiom: 'Base-10 positional notation assigns value based on column position.', formulaOrRule: 'Tens + Ones', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'c1_evs',
        unitNumber: 'Unit 4',
        subjectName: 'Environmental Studies (EVS)',
        title: 'Our Body & Sense Organs, Plant Kingdom & Food We Eat',
        chapters: [
          {
            id: 'c1_evs_c1',
            chapterNumber: 1,
            title: '5 Sense Organs, Healthy Food & Care for Living Plants',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: 'c1_evs_s1',
                title: 'Sensory Perception and Nutrition Basics',
                microTopics: [
                  { id: 'c1_evs_m1', title: 'Functions of Eyes, Ears, Nose, Tongue, and Skin', keyAxiom: 'Sense organs transduce environmental stimuli into neural signals.', pyqFrequency: 'High' }
                ]
              }
            ]
          }
        ]
      }
    ];
  }

  // 4. Class 2 to 5 (Primary School)
  if (t.includes('class 2') || t.includes('2nd standard') || t.includes('class 3') || t.includes('3rd standard') || t.includes('class 4') || t.includes('4th standard') || t.includes('class 5') || t.includes('5th standard')) {
    const clsNum = t.includes('class 2') || t.includes('2nd') ? '2' : t.includes('class 3') || t.includes('3rd') ? '3' : t.includes('class 4') || t.includes('4th') ? '4' : '5';
    return [
      {
        id: `c${clsNum}_tam`,
        unitNumber: 'பகுதி 1',
        subjectName: 'தமிழ் (Tamil Literature & Grammar)',
        title: `வகுப்பு ${clsNum}: செய்யுள், உரைநடை & இலக்கணப் பயிற்சிகள்`,
        chapters: [
          {
            id: `c${clsNum}_tam_c1`,
            chapterNumber: 1,
            title: 'திருக்குறள், மூதுரை, கொன்றை வேந்தன் & நீதிநெறி விளக்கம்',
            tamilTitle: 'நீதி இலக்கியங்கள்',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: `c${clsNum}_tam_s1`,
                title: 'பெயர்ச்சொல், வினைச்சொல், நிறுத்தற்குறிகள் & மரபுச்சொற்கள்',
                microTopics: [
                  { id: `c${clsNum}_tam_m1`, title: 'இலக்கண வகைப்பாடுகள் & செய்யுள் பாடல் பொருள் விளக்கம்', keyAxiom: 'சொற்கள் பொருளுணர்த்தும் முறையே இலக்கணம் எனப்படும்.', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: `c${clsNum}_eng`,
        unitNumber: 'Unit 2',
        subjectName: 'English (Grammar & Reading)',
        title: `Class ${clsNum}: Tenses, Pronouns, Adjectives & Comprehension`,
        chapters: [
          {
            id: `c${clsNum}_eng_c1`,
            chapterNumber: 1,
            title: 'Past, Present, Future Tenses & Paragraph Composition',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: `c${clsNum}_eng_s1`,
                title: 'Grammar Mechanics & Vocabulary Expansion',
                microTopics: [
                  { id: `c${clsNum}_eng_m1`, title: 'Regular/Irregular verb transformations & Prepositions usage', keyAxiom: 'Tense specifies the temporal location of an action relative to speaking time.', formulaOrRule: 'Verb Conjugation', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: `c${clsNum}_mat`,
        unitNumber: 'Unit 3',
        subjectName: 'Mathematics',
        title: `Class ${clsNum}: Numbers, Operations, Fractions & Geometry`,
        chapters: [
          {
            id: `c${clsNum}_mat_c1`,
            chapterNumber: 1,
            title: 'Multiplication Tables, Long Division, LCM/GCD & Area/Perimeter',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: `c${clsNum}_mat_s1`,
                title: 'Arithmetic Operations & Geometric Perimeter Formulas',
                microTopics: [
                  { id: `c${clsNum}_mat_m1`, title: 'Multiplication as repeated addition & Division as equal sharing', keyAxiom: 'Dividend = (Divisor x Quotient) + Remainder', formulaOrRule: 'D = d*q + r', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: `c${clsNum}_sci`,
        unitNumber: 'Unit 4',
        subjectName: 'Science',
        title: `Class ${clsNum}: Human Organ Systems, Plants, Energy & Space`,
        chapters: [
          {
            id: `c${clsNum}_sci_c1`,
            chapterNumber: 1,
            title: 'Circulatory, Digestive Systems, States of Matter & Solar System',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: `c${clsNum}_sci_s1`,
                title: 'Biological Anatomy and Physical Matter Transformations',
                microTopics: [
                  { id: `c${clsNum}_sci_m1`, title: 'Heart pumping mechanism, blood vessels, and gas exchange in lungs', keyAxiom: 'Circulatory system delivers oxygen and nutrients to cellular mitochondria.', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: `c${clsNum}_soc`,
        unitNumber: 'Unit 5',
        subjectName: 'Social Science',
        title: `Class ${clsNum}: Tamil Nadu Landforms, Indian Heritage & Maps`,
        chapters: [
          {
            id: `c${clsNum}_soc_c1`,
            chapterNumber: 1,
            title: 'Physical Geography of Tamil Nadu, Historical Forts & Civics',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: `c${clsNum}_soc_s1`,
                title: 'Landforms (Kurinji, Mullai, Marutham, Neithal, Paalai) & Heritage',
                microTopics: [
                  { id: `c${clsNum}_soc_m1`, title: 'Five ecological landscapes of ancient Tamilagam and local governance', keyAxiom: 'Ancient Tamil civilization classified geography by ecological habitats.', pyqFrequency: 'High' }
                ]
              }
            ]
          }
        ]
      }
    ];
  }

  // 5. Class 6 to 9 (Middle & High School)
  if (t.includes('class 6') || t.includes('6th standard') || t.includes('class 7') || t.includes('7th standard') || t.includes('class 8') || t.includes('8th standard') || t.includes('class 9') || t.includes('9th standard')) {
    const clsNum = t.includes('class 6') || t.includes('6th') ? '6' : t.includes('class 7') || t.includes('7th') ? '7' : t.includes('class 8') || t.includes('8th') ? '8' : '9';
    return [
      {
        id: `c${clsNum}_tam`,
        unitNumber: 'இயல் 1 & 2',
        subjectName: 'தமிழ் (Tamil)',
        title: `வகுப்பு ${clsNum}: மொழி, இயற்கை, அறிவியல் & இலக்கணம்`,
        chapters: [
          {
            id: `c${clsNum}_tam_c1`,
            chapterNumber: 1,
            title: 'இன்பத்தமிழ், தமிழ் கும்மி, வளர்தமிழ் & எழுத்துக்களின் பிறப்பு',
            tamilTitle: 'மொழி & இலக்கணம்',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: `c${clsNum}_tam_s1`,
                title: 'சார்பெழுத்து வகைகள், தொடர் இலக்கணம் & வல்லினம் மிகும் இடங்கள்',
                microTopics: [
                  { id: `c${clsNum}_tam_m1`, title: 'திராவிட மொழிக் குடும்பம் & தொல்காப்பிய இலக்கண விதிகள்', keyAxiom: 'தமிழ் மொழியின் தனிச்சிறப்புகள் மற்றும் இலக்கண மரபுகள்.', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: `c${clsNum}_eng`,
        unitNumber: 'Unit 1 & 2',
        subjectName: 'English',
        title: `Class ${clsNum}: Prose, Poetry, Voices, Clauses & Tenses`,
        chapters: [
          {
            id: `c${clsNum}_eng_c1`,
            chapterNumber: 1,
            title: 'Prose Comprehension, Poetic Devices & Active/Passive Voice',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: `c${clsNum}_eng_s1`,
                title: 'Transformational Grammar & Direct/Indirect Speech',
                microTopics: [
                  { id: `c${clsNum}_eng_m1`, title: 'Clause identification (Noun, Adjective, Adverb Clauses)', keyAxiom: 'A clause contains a subject and a predicate.', formulaOrRule: 'Dependent + Independent Clause', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: `c${clsNum}_mat`,
        unitNumber: 'Unit 1 & 2',
        subjectName: 'Mathematics',
        title: `Class ${clsNum}: Number Systems, Algebra, Geometry & Statistics`,
        chapters: [
          {
            id: `c${clsNum}_mat_c1`,
            chapterNumber: 1,
            title: 'Rational/Real Numbers, Algebraic Identities & Polynomials',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: `c${clsNum}_mat_s1`,
                title: 'Algebraic Factorization & Coordinate Geometry Distance Formula',
                microTopics: [
                  { id: `c${clsNum}_mat_m1`, title: 'Distance between two points: d = sqrt((x2-x1)^2 + (y2-y1)^2)', keyAxiom: 'Euclidean metric calculates shortest distance between coordinates.', formulaOrRule: 'd = sqrt((x2-x1)^2 + (y2-y1)^2)', pyqFrequency: 'Very High' },
                  { id: `c${clsNum}_mat_m2`, title: 'Standard Identities: (a+b)^2, (a-b)^2, a^2-b^2, (x+a)(x+b)', keyAxiom: 'Algebraic identities hold true for all numerical replacements.', formulaOrRule: '(a+b)^2 = a^2 + 2ab + b^2', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: `c${clsNum}_sci`,
        unitNumber: 'Unit 1 & 2',
        subjectName: 'Science',
        title: `Class ${clsNum}: Physics, Chemistry & Biology Foundations`,
        chapters: [
          {
            id: `c${clsNum}_sci_c1`,
            chapterNumber: 1,
            title: 'Force & Motion, Structure of Atom, Periodic Table & Cell Tissues',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: `c${clsNum}_sci_s1`,
                title: 'Newtonian Mechanics & Atomic Subparticles (Electrons, Protons)',
                microTopics: [
                  { id: `c${clsNum}_sci_m1`, title: 'Equations of Motion: v = u + at, s = ut + 0.5at^2, v^2 = u^2 + 2as', keyAxiom: 'Uniform acceleration yields quadratic displacement profiles.', formulaOrRule: 'v^2 = u^2 + 2as', pyqFrequency: 'Very High' },
                  { id: `c${clsNum}_sci_m2`, title: 'Bohr’s Model of Atom: 2n^2 electron capacity rule per shell', keyAxiom: 'Electrons occupy discrete quantized energy orbits.', formulaOrRule: 'Capacity = 2n^2', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: `c${clsNum}_soc`,
        unitNumber: 'Unit 1 & 2',
        subjectName: 'Social Science',
        title: `Class ${clsNum}: History, Geography, Civics & Economics`,
        chapters: [
          {
            id: `c${clsNum}_soc_c1`,
            chapterNumber: 1,
            title: 'Indus Valley Civilisation, Medieval Cholas, Lithosphere & Constitution',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: `c${clsNum}_soc_s1`,
                title: 'Archaeological Sources & Democratic Governance Institutions',
                microTopics: [
                  { id: `c${clsNum}_soc_m1`, title: 'Harappan town planning, Great Bath, and Sangam port cities (Poompuhar, Keeladi)', keyAxiom: 'Urban grid drainage architecture demonstrates advanced engineering.', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      }
    ];
  }

  // 6. Class 10 (10th Standard SSLC)
  if (t.includes('10th') || t.includes('sslc') || t.includes('10-ஆம் வகுப்பு')) {
    return [
      {
        id: '10_tamil_u1',
        unitNumber: 'இயல் 1',
        subjectName: 'தமிழ் (Tamil)',
        title: 'மொழி: அன்னை மொழியே, தமிழ்ச்சொல் வளம் & எழுத்து, சொல் இலக்கணம்',
        tamilTitle: 'இயல் 1: மொழி - அன்னை மொழியே, தமிழ்ச்சொல் வளம்',
        chapters: [
          {
            id: '10_tam_c1',
            chapterNumber: 1,
            title: 'அன்னை மொழியே (செய்யுள் - பாவலரேறு பெருஞ்சித்திரனார்)',
            tamilTitle: 'அன்னை மொழியே',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: '10_tam_c1_s1',
                title: 'அழகார்ந்த செந்தமிழே & செப்பரிய நின் பெருமை',
                microTopics: [
                  { id: '10_tam_m1', title: 'பாவலரேறு பெருஞ்சித்திரனாரின் கணிச்சாறு பாடல் விளக்கம்', keyAxiom: 'தமிழ் மொழியின் தொன்மை, நற்றினை, எட்டுத்தொகை பெருமைகள்.', pyqFrequency: 'High' },
                  { id: '10_tam_m2', title: 'முந்துற்றோம் யாண்டுண்டும் - நும் பெருமை யாவுரைப்போம்', keyAxiom: 'தமிழைத் தாயாகப் போற்றிப் பாடும் மரபு.', pyqFrequency: 'Medium' }
                ]
              }
            ]
          },
          {
            id: '10_tam_c2',
            chapterNumber: 2,
            title: 'தமிழ்ச்சொல் வளம் (உரைநடை உலகம் - தேவநேயப் பாவாணர்)',
            tamilTitle: 'தமிழ்ச்சொல் வளம்',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: '10_tam_c2_s1',
                title: 'தாவரத்தின் அடிப்பகுதி, கிளைப்பிரிவு மற்றும் இலைவகைப் பெயர்கள்',
                microTopics: [
                  { id: '10_tam_m3', title: 'அடிவகை (தாள், தண்டு, கோல், தூறு) & இலைவகைகள்', keyAxiom: 'தமிழின் தாவரச் சொல்வளம் உலக மொழிகளிலேயே மிக நுட்பமானது.', pyqFrequency: 'Very High' }
                ]
              }
            ]
          },
          {
            id: '10_tam_c3',
            chapterNumber: 3,
            title: 'எழுத்து, சொல் இலக்கணம் (கற்கண்டு)',
            tamilTitle: 'எழுத்து, சொல் இலக்கணம்',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: '10_tam_c3_s1',
                title: 'சார்பெழுத்துக்கள் (உயிரளபெடை, ஒற்றளபெடை) மற்றும் மொழி வகைகள்',
                microTopics: [
                  { id: '10_tam_m4', title: 'உயிரளபெடை (செய்யுளிசை, இன்னிசை, சொல்லிசை அளபெடை)', keyAxiom: 'செய்யுளில் ஓசை குறையும் போது அளபெடுப்பது செய்யுளிசை அளபெடை.', pyqFrequency: 'Very High' },
                  { id: '10_tam_m5', title: 'தனிமொழி, தொடர்மொழி, பொதுமொழி இலக்கண விதிகள்', keyAxiom: 'ஒரு சொல் தனித்து நின்று ஒரு பொருளையும், தொடர்ந்து நின்று வேறு பொருளையும் தருவது பொதுமொழி.', pyqFrequency: 'High' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: '10_eng_u1',
        unitNumber: 'Unit 1',
        subjectName: 'English',
        title: 'Prose: His First Flight | Poem: Life | Grammar: Active & Passive Voice',
        tamilTitle: 'பகுதி 1: ஆங்கில உரைநடை & இலக்கணம்',
        chapters: [
          {
            id: '10_eng_c1',
            chapterNumber: 1,
            title: 'Prose: His First Flight (Liam O’Flaherty)',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: '10_eng_c1_s1',
                title: 'Young Seagull’s Fear of Flying & Parental Motivation',
                microTopics: [
                  { id: '10_eng_m1', title: 'Seagull’s ledge struggle, hunger, and maiden flight takeoff', keyAxiom: 'Courage overcomes innate fear through survival instinct.', pyqFrequency: 'High' }
                ]
              }
            ]
          },
          {
            id: '10_eng_c2',
            chapterNumber: 2,
            title: 'Poem: Life (Henry Van Dyke) & Grammar: Active/Passive Voice',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: '10_eng_c2_s1',
                title: 'Sonnet Structure & Transformation of Active to Passive Voice',
                microTopics: [
                  { id: '10_eng_m2', title: 'Rhyme scheme of Shakespearean/Petrarchan sonnets', keyAxiom: '14-line sonnet with abba cddc rhyme structure.', pyqFrequency: 'High' },
                  { id: '10_eng_m3', title: 'Active to Passive Voice conversion rules for past continuous tense', keyAxiom: 'Subject + was/were + being + V3 + by + Object', formulaOrRule: 'S + was/were + being + V3', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: '10_math_u1',
        unitNumber: 'Unit 1',
        subjectName: 'Mathematics (கணிதம்)',
        title: 'Relations and Functions (உறவுகளும் சார்புகளும்)',
        tamilTitle: 'அலகு 1: உறவுகளும் சார்புகளும்',
        chapters: [
          {
            id: '10_mat_c1',
            chapterNumber: 1,
            title: 'Cartesian Products & Relations (கார்டீசியன் பெருக்கல் & உறவுகள்)',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: '10_mat_c1_s1',
                title: 'A x B, B x A and Null Set Product Axioms',
                microTopics: [
                  { id: '10_mat_m1', title: 'Number of elements in Cartesian Product: n(A x B) = n(A) * n(B)', keyAxiom: 'If n(A) = p and n(B) = q, then n(A x B) = pq.', formulaOrRule: 'n(A x B) = n(A) * n(B)', pyqFrequency: 'Very High' },
                  { id: '10_mat_m2', title: 'Arrow diagram and set builder representation of Relations', keyAxiom: 'Every relation is a subset of the Cartesian product: R subset of A x B.', pyqFrequency: 'High' }
                ]
              }
            ]
          },
          {
            id: '10_mat_c2',
            chapterNumber: 2,
            title: 'Euclid’s Lemma, AP & GP (தொடர்வரிசைகள்)',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: '10_mat_c2_s1',
                title: 'AP & GP nth Term & Sum to n Terms',
                microTopics: [
                  { id: '10_mat_m3', title: 'Arithmetic Progression nth term: t_n = a + (n-1)d', keyAxiom: 'Constant difference d = t_n - t_(n-1).', formulaOrRule: 't_n = a + (n-1)d', pyqFrequency: 'Very High' },
                  { id: '10_mat_m4', title: 'Geometric Progression nth term: t_n = a * r^(n-1)', keyAxiom: 'Constant ratio r = t_n / t_(n-1).', formulaOrRule: 'S_n = a(r^n - 1)/(r - 1)', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: '10_sci_u1',
        unitNumber: 'Unit 1',
        subjectName: 'Science (அறிவியல்)',
        title: 'Laws of Motion & Optics (இயக்க விதிகள் & ஒளியியல்)',
        tamilTitle: 'அலகு 1: இயக்க விதிகள் & ஒளியியல்',
        chapters: [
          {
            id: '10_sci_c1',
            chapterNumber: 1,
            title: 'Laws of Motion (நியூட்டனின் இயக்க விதிகள்)',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: '10_sci_c1_s1',
                title: 'Inertia Types & Linear Momentum Conservation',
                microTopics: [
                  { id: '10_sci_m1', title: 'Newton’s Second Law: Force F = m*a with SI Unit Newton (N)', keyAxiom: 'Rate of change of momentum is proportional to impressed force.', formulaOrRule: 'F = m * a (1 N = 10^5 dyne)', pyqFrequency: 'Very High' },
                  { id: '10_sci_m2', title: 'Principle of Conservation of Linear Momentum during Collisions', keyAxiom: 'm1*u1 + m2*u2 = m1*v1 + m2*v2', formulaOrRule: 'p_initial = p_final', pyqFrequency: 'Very High' }
                ]
              }
            ]
          },
          {
            id: '10_sci_c2',
            chapterNumber: 2,
            title: 'Optics: Refraction, Lenses & Eye Defects (ஒளியியல்)',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: '10_sci_c2_s1',
                title: 'Snell’s Law of Refraction and Convex/Concave Lens Formula',
                microTopics: [
                  { id: '10_sci_m3', title: 'Lens Formula: 1/f = 1/v - 1/u & Power of Lens P = 1/f', keyAxiom: 'Convex lens has positive focal length; concave is negative.', formulaOrRule: '1/f = 1/v - 1/u, P = 1/f', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: '10_soc_u1',
        unitNumber: 'Unit 1',
        subjectName: 'Social Science (சமூக அறிவியல்)',
        title: 'Freedom Struggle in Tamil Nadu & Indian Constitution',
        tamilTitle: 'அலகு 1: தமிழ்நாட்டில் விடுதலைப் போராட்டம் & இந்திய அரசியலமைப்பு',
        chapters: [
          {
            id: '10_soc_c1',
            chapterNumber: 1,
            title: 'Freedom Struggle in Tamil Nadu (தமிழ்நாட்டில் விடுதலைப் போராட்டம்)',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: '10_soc_c1_s1',
                title: 'VOC & Vedaranyam Salt March (1930)',
                microTopics: [
                  { id: '10_soc_m1', title: 'V.O. Chidambaranar Swadeshi Steam Navigation & Rajaji Salt March', keyAxiom: 'VOC launched Swadeshi ships between Tuticorin and Colombo in 1906.', pyqFrequency: 'Very High' }
                ]
              }
            ]
          },
          {
            id: '10_soc_c2',
            chapterNumber: 2,
            title: 'Indian Constitution & Fundamental Rights (இந்திய அரசியலமைப்பு)',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: '10_soc_c2_s1',
                title: 'Fundamental Rights (Articles 12-35) & Writs (Article 32)',
                microTopics: [
                  { id: '10_soc_m2', title: '5 Writs: Habeas Corpus, Mandamus, Prohibition, Certiorari, Quo-Warranto', keyAxiom: 'Dr. Ambedkar called Article 32 the "Heart and Soul of the Constitution".', formulaOrRule: 'Articles 12-35', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      }
    ];
  }

  // 7. Class 11 (11th Standard Plus One)
  if (t.includes('class 11') || t.includes('11th') || t.includes('plus one')) {
    return [
      {
        id: '11_phy',
        unitNumber: 'Unit 1: Physics',
        subjectName: 'Physics (இயற்பியல்)',
        title: 'Kinematics, Laws of Motion & Thermodynamics',
        chapters: [
          {
            id: '11_phy_c1',
            chapterNumber: 1,
            title: 'Vectors, 2D Projectile Motion & Newton’s Laws',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: '11_phy_s1',
                title: 'Parabolic Trajectory & Work-Energy Theorem',
                microTopics: [
                  { id: '11_phy_m1', title: 'Range R = (u^2 * sin 2θ)/g and Max Height H = (u^2 * sin^2 θ)/(2g)', keyAxiom: 'Horizontal motion has zero acceleration; vertical has constant -g.', formulaOrRule: 'R_max = u^2/g', pyqFrequency: 'Very High' },
                  { id: '11_phy_m2', title: 'Work-Energy Theorem: W_net = Delta K = 0.5*m*v^2 - 0.5*m*u^2', keyAxiom: 'Net work done by all forces equals change in kinetic energy.', formulaOrRule: 'W = Delta K', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: '11_chem',
        unitNumber: 'Unit 2: Chemistry',
        subjectName: 'Chemistry (வேதியியல்)',
        title: 'Atomic Structure, Chemical Bonding & Thermodynamics',
        chapters: [
          {
            id: '11_ch_c1',
            chapterNumber: 1,
            title: 'Quantum Mechanical Model of Atom & Periodic Trends',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: '11_ch_s1',
                title: 'Quantum Numbers (n, l, m, s) and Electronic Configuration',
                microTopics: [
                  { id: '11_ch_m1', title: 'Aufbau Principle, Pauli Exclusion, Hund’s Rule of Maximum Multiplicity', keyAxiom: 'No two electrons in an atom can have the same set of 4 quantum numbers.', formulaOrRule: '2n^2 capacity', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: '11_mat',
        unitNumber: 'Unit 3: Mathematics',
        subjectName: 'Mathematics (கணிதம்)',
        title: 'Trigonometry, Combinatorics & Differential Calculus',
        chapters: [
          {
            id: '11_mat_c1',
            chapterNumber: 1,
            title: 'Trigonometric Identities & First Principle Derivatives',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: '11_mat_s1',
                title: 'Limit Definition of Derivative: f’(x) = lim (f(x+h) - f(x))/h',
                microTopics: [
                  { id: '11_mat_m1', title: 'Product Rule (uv)’ = u’v + uv’ and Quotient Rule (u/v)’ = (u’v - uv’)/v^2', keyAxiom: 'Differentiation yields instantaneous slope of tangent line.', formulaOrRule: 'd/dx(x^n) = n*x^(n-1)', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: '11_bio',
        unitNumber: 'Unit 4: Biology',
        subjectName: 'Biology / Computer Science',
        title: 'Cell Cycle, Plant Physiology & Python OOP Foundations',
        chapters: [
          {
            id: '11_bio_c1',
            chapterNumber: 1,
            title: 'Mitosis vs Meiosis, Photosynthesis Light Reactions & Python Loops',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: '11_bio_s1',
                title: 'Calvin Cycle C3/C4 pathways & Python Data Structures',
                microTopics: [
                  { id: '11_bio_m1', title: 'Rubisco enzyme carbon fixation & PyTorch/Python syntax rules', keyAxiom: 'Photosynthesis converts photons into stable chemical ATP/NADPH bonds.', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      }
    ];
  }

  // 8. Class 12 (12th Standard Plus Two / HSC)
  if (t.includes('class 12') || t.includes('12th') || t.includes('plus two') || t.includes('hsc')) {
    return [
      {
        id: '12_phy',
        unitNumber: 'Unit 1: Physics',
        subjectName: 'Physics (இயற்பியல்)',
        title: 'Electrostatics, Current Electricity & Wave Optics',
        chapters: [
          {
            id: '12_phy_c1',
            chapterNumber: 1,
            title: 'Coulomb’s Law, Gauss’s Law & Kirchhoff’s Circuit Laws',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: '12_phy_s1',
                title: 'Electric Flux Phi = Q_enclosed / epsilon_0 & Wheatstone Bridge',
                microTopics: [
                  { id: '12_phy_m1', title: 'Coulomb Force: F = (1/(4*pi*eps0)) * (q1*q2)/r^2', keyAxiom: 'Electrostatic force follows inverse-square central field law.', formulaOrRule: 'F = k*q1*q2/r^2', pyqFrequency: 'Very High' },
                  { id: '12_phy_m2', title: 'Wheatstone Bridge balance condition: P/Q = R/S', keyAxiom: 'Zero galvanometer deflection occurs when potential at bridge nodes is equal.', formulaOrRule: 'P/Q = R/S', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: '12_chem',
        unitNumber: 'Unit 2: Chemistry',
        subjectName: 'Chemistry (வேதியியல்)',
        title: 'Electrochemistry, Chemical Kinetics & Carbonyl Compounds',
        chapters: [
          {
            id: '12_chem_c1',
            chapterNumber: 1,
            title: 'Nernst Equation, First Order Rate Law & Aldol Condensation',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: '12_chem_s1',
                title: 'Electrode Potentials E_cell = E0_cell - (0.0591/n) log Q',
                microTopics: [
                  { id: '12_chem_m1', title: 'First Order Kinetics half-life: t_1/2 = 0.693 / k', keyAxiom: 'Half-life of first-order reaction is independent of initial concentration.', formulaOrRule: 't_1/2 = 0.693/k', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: '12_mat',
        unitNumber: 'Unit 3: Mathematics',
        subjectName: 'Mathematics (கணிதம்)',
        title: 'Matrices, Integral Calculus & Differential Equations',
        chapters: [
          {
            id: '12_mat_c1',
            chapterNumber: 1,
            title: 'Matrix Inversion A^-1 = (1/|A|) adj(A) & Definite Integrals',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: '12_mat_s1',
                title: 'Integration by Parts: integral u dv = uv - integral v du',
                microTopics: [
                  { id: '12_mat_m1', title: 'Rank of Matrix and Cramer’s Rule solution for linear systems', keyAxiom: 'A unique solution exists if and only if determinant |A| != 0.', formulaOrRule: 'x = Delta_x / Delta', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: '12_bio',
        unitNumber: 'Unit 4: Biology / CS',
        subjectName: 'Biology / Computer Science',
        title: 'Molecular Genetics & Relational Databases (SQL)',
        chapters: [
          {
            id: '12_bio_c1',
            chapterNumber: 1,
            title: 'DNA Double Helix Replication & SQL Joins / Aggregates',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: '12_bio_s1',
                title: 'Semi-Conservative DNA Replication (Meselson-Stahl)',
                microTopics: [
                  { id: '12_bio_m1', title: 'DNA Polymerase 5’ to 3’ synthesis & Okazaki fragments on lagging strand', keyAxiom: 'Antiparallel double helix replicates semi-conservatively.', formulaOrRule: 'Central Dogma: DNA->RNA->Protein', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      }
    ];
  }

  // 9. NEET / JEE Entrance
  if (t.includes('neet') || t.includes('jee') || t.includes('iit')) {
    return [
      {
        id: 'neet_u1',
        unitNumber: 'Unit 1: Mechanics',
        subjectName: 'NEET / JEE Physics',
        title: 'Kinematics, 2D Projectiles & Work-Energy-Power',
        chapters: [
          {
            id: 'np_c1',
            chapterNumber: 1,
            title: '2D Projectile Motion & Vectors',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: 'np_c1_s1',
                title: 'Trajectory Equation and Max Range at 45°',
                microTopics: [
                  { id: 'np_m1', title: 'Max Horizontal Range: R_max = u^2 / g at theta = 45 degrees', keyAxiom: 'At 45 degrees elevation, horizontal range is maximized in vacuum.', formulaOrRule: 'R = (u^2 * sin(2*theta)) / g', pyqFrequency: 'Very High' },
                  { id: 'np_m2', title: 'Time of Flight T = (2*u*sin(theta))/g and Max Height H = (u^2*sin^2(theta))/(2g)', keyAxiom: 'Vertical velocity is 0 at maximum height.', formulaOrRule: 'H_max = (u_y^2) / (2g)', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'neet_u2',
        unitNumber: 'Unit 2: Electrodynamics',
        subjectName: 'NEET / JEE Physics',
        title: 'Current Electricity & Photoelectric Effect',
        chapters: [
          {
            id: 'np_c2',
            chapterNumber: 2,
            title: 'Drift Velocity, Kirchhoff Laws & Einstein Photoelectric Equation',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: 'np_c2_s1',
                title: 'Drift Velocity I = n*e*A*v_d & Einstein Equation h*nu = phi + K_max',
                microTopics: [
                  { id: 'np_m3', title: 'Photoelectric work function and stopping potential: e*V_0 = h*nu - phi', keyAxiom: 'Photoelectron kinetic energy depends solely on photon frequency, not intensity.', formulaOrRule: 'h*nu = phi + e*V_0', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      }
    ];
  }

  // 10. TNPSC / Govt Exams
  if (t.includes('tnpsc') || t.includes('group 1') || t.includes('group 2') || t.includes('group 4') || t.includes('vao') || t.includes('police') || t.includes('upsc')) {
    return [
      {
        id: 'tnpsc_u1',
        unitNumber: 'பகுதி (அ)',
        subjectName: 'பொதுத்தமிழ்',
        title: 'இலக்கணம்: வேர்ச்சொல், பிரித்தெழுதுதல் & சந்திப்பிழை',
        chapters: [
          {
            id: 'tp_c1',
            chapterNumber: 1,
            title: 'வேர்ச்சொல் அறிதல் & அகரவரிசைப்படுத்துதல்',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: 'tp_c1_s1',
                title: 'வல்லினம் மிகும் / மிகா இடங்கள் மற்றும் அகரவரிசை',
                microTopics: [
                  { id: 'tp_m1', title: 'நிலைமொழி உயிர் ஈறாக வரும்போது வல்லினம் மிகும் இடங்கள்', keyAxiom: 'அ, இ, எ என்னும் சுட்டெழுத்துக்களுக்குப் பின் வல்லினம் மிகும்.', formulaOrRule: 'சுட்டெழுத்து + க,ச,த,ப', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'tnpsc_u2',
        unitNumber: 'Unit 8 & 9',
        subjectName: 'பொது அறிவு (GS)',
        title: 'தமிழ்நாடு வரலாறு, கீழடி அகழாய்வு & இந்திய அரசியலமைப்பு',
        chapters: [
          {
            id: 'tp_c2',
            chapterNumber: 2,
            title: 'கீழடி, கொடுமணல் தொல்லியல் கண்டுபிடிப்புகள் & நீதிக்கட்சி',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: 'tp_c2_s1',
                title: 'வைகை நதிக்கரை நாகரிகம் & 1921 வகுப்புவாரி பிரதிநிதித்துவ ஆணை',
                microTopics: [
                  { id: 'tp_m2', title: 'கீழடி தொல்லியல் ஆய்வில் வெளிப்பட்ட 2600 ஆண்டுகள் பழமையான எழுத்தறிவு', keyAxiom: 'வைகை நதிக்கரை நகர நாகரிகம் எழுத்தறிவு பெற்ற மதச்சார்பற்ற சமூகம்.', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      }
    ];
  }

  // 11. Generic Master Fallback
  return [
    {
      id: 'gen_u1',
      unitNumber: 'Unit 1',
      subjectName: `${courseTitle} — Core Foundations`,
      title: `${courseTitle} — Foundational Concepts & Axioms`,
      chapters: [
        {
          id: 'gen_c1',
          chapterNumber: 1,
          title: `${courseTitle} — Theory & Core Formulations`,
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          youtubeId: 'dQw4w9WgXcQ',
          subtopics: [
            {
              id: 'gen_c1_s1',
              title: 'Governing Theorems & Structural Principles',
              microTopics: [
                { id: 'gen_m1', title: `${courseTitle} — Governing Equations & Proofs`, keyAxiom: 'Fundamental theorem of the discipline governing state transitions.', pyqFrequency: 'Very High' },
                { id: 'gen_m2', title: `${courseTitle} — Standard Units, Limits and Constraints`, keyAxiom: 'Boundary conditions and SI dimensional consistency rules.', pyqFrequency: 'High' }
              ]
            }
          ]
        },
        {
          id: 'gen_c2',
          chapterNumber: 2,
          title: `${courseTitle} — Problem Solving & Speed Techniques`,
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          youtubeId: 'dQw4w9WgXcQ',
          subtopics: [
            {
              id: 'gen_c2_s1',
              title: 'Option Elimination and 45-Second Solving Rules',
              microTopics: [
                { id: 'gen_m3', title: `${courseTitle} — High-Yield Question Patterns & Pitfalls`, keyAxiom: 'Fast estimation heuristics and dimensional elimination.', pyqFrequency: 'Very High' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'gen_u2',
      unitNumber: 'Unit 2',
      subjectName: `${courseTitle} — Advanced Practice`,
      title: `${courseTitle} — Real-World Application & Practice`,
      chapters: [
        {
          id: 'gen_c3',
          chapterNumber: 3,
          title: `${courseTitle} — Exam Mock Scenarios & Solutions`,
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          youtubeId: 'dQw4w9WgXcQ',
          subtopics: [
            {
              id: 'gen_c3_s1',
              title: 'Comprehensive Capstone Analysis',
              microTopics: [
                { id: 'gen_m4', title: `${courseTitle} — Case Studies & Production Architectures`, keyAxiom: 'End-to-end integration testing and performance optimization.', pyqFrequency: 'High' }
              ]
            }
          ]
        }
      ]
    }
  ];
}
