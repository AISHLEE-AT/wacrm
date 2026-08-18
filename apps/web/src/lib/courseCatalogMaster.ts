/**
 * Master Real-World Academic Course Catalog with 5-Level Syllabus Hierarchy:
 * Course -> Units -> Chapters -> Topics -> Subtopics -> Micro-topics
 * Full coverage: Web App Development, School (LKG to Class 12), NEET/JEE, TNPSC/UPSC, College, and AI Tech Skills.
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
// SYLLABUS RESOLVER FOR ALL COURSES (Web Dev, LKG-12th, NEET, TNPSC, AI)
// ----------------------------------------------------
export function getCourseSyllabus(courseTitle: string, category: string = ''): SyllabusUnit[] {
  const t = (courseTitle || '').toLowerCase();

  // 1. WEB APP DEVELOPMENT & FULL-STACK ENGINEERING
  if (t.includes('web') || t.includes('full stack') || t.includes('frontend') || t.includes('backend') || t.includes('react') || t.includes('node') || t.includes('javascript') || t.includes('typescript')) {
    return [
      {
        id: 'web_u1',
        unitNumber: 'Unit 1',
        subjectName: 'Frontend Architecture (HTML5, CSS3, Tailwind)',
        title: 'Modern Responsive Layouts, Flexbox, Grid & Tailwind CSS',
        tamilTitle: 'அலகு 1: நவீன பயனர் இடைமுகம் & வலை வடிவமைப்பு',
        chapters: [
          {
            id: 'web_c1',
            chapterNumber: 1,
            title: 'HTML5 Semantic Structure, Flexbox & CSS Grid Mastery',
            tamilTitle: 'HTML5 மற்றும் CSS கட்டமைப்பு',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: 'web_c1_s1',
                title: 'Semantic HTML, 2D Grid Layouts & Mobile-First Breakpoints',
                microTopics: [
                  { id: 'web_m1', title: 'Flexbox vs CSS Grid: 1D Alignment vs 2D Matrix Layouts', keyAxiom: 'Flexbox distributes space along a single axis; Grid creates explicit two-dimensional coordinate layouts.', formulaOrRule: 'display: flex | grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))', pyqFrequency: 'Very High' },
                  { id: 'web_m2', title: 'Tailwind CSS utility classes, arbitrary values, and dark mode configuration', keyAxiom: 'Tailwind compiles purged atomic CSS rules without runtime overhead.', formulaOrRule: 'className="flex flex-col md:flex-row dark:bg-slate-900"', pyqFrequency: 'High' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'web_u2',
        unitNumber: 'Unit 2',
        subjectName: 'Modern JavaScript (ES6+) & TypeScript',
        title: 'V8 Event Loop, Async/Await, TypeScript Generics & Type Systems',
        tamilTitle: 'அலகு 2: ஜாவாஸ்கிரிப்ட் மற்றும் டைப்ஸ்கிரிப்ட்',
        chapters: [
          {
            id: 'web_c2',
            chapterNumber: 2,
            title: 'Event Loop, Microtasks, Closures & TypeScript Generics',
            tamilTitle: 'ஈவென்ட் லூப் & டைப்ஸ்கிரிப்ட்',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: 'web_c2_s1',
                title: 'Asynchronous Microtask Queue vs Macrotask Queue',
                microTopics: [
                  { id: 'web_m3', title: 'V8 Call Stack, Microtasks (Promise.then) and Macrotasks (setTimeout)', keyAxiom: 'Microtask queue drains completely before the next macrotask executes in the Event Loop.', formulaOrRule: 'Call Stack -> Microtask Queue -> Macrotask Queue -> Render', pyqFrequency: 'Very High' },
                  { id: 'web_m4', title: 'TypeScript Generics, Discriminated Unions & Type Narrowing', keyAxiom: 'Generic type constraints ensure compile-time type safety with dynamic polymorphic inputs.', formulaOrRule: 'type Result<T> = { status: "success", data: T } | { status: "error", error: string }', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'web_u3',
        unitNumber: 'Unit 3',
        subjectName: 'React 19 & Next.js 15 App Router',
        title: 'React Hooks, Server Components, SSR/SSG & Server Actions',
        tamilTitle: 'அலகு 3: ரியாக்ட் மற்றும் நெக்ஸ்ட் ஜேஎஸ் ஆப் ரூட்டர்',
        chapters: [
          {
            id: 'web_c3',
            chapterNumber: 3,
            title: 'React Core Hooks, Server Components & Next.js Data Fetching',
            tamilTitle: 'ரியாக்ட் ஹுக்ஸ் & சர்வர் கம்போனண்ட்ஸ்',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: 'web_c3_s1',
                title: 'Virtual DOM Diffing, useState, useEffect & Server Actions',
                microTopics: [
                  { id: 'web_m5', title: 'React Server Components (RSC) vs Client Components ("use client")', keyAxiom: 'Server components execute exclusively on the server, sending zero JavaScript bundle weight to the client browser.', formulaOrRule: 'export default async function Page() { const data = await db.query(); return <UI />; }', pyqFrequency: 'Very High' },
                  { id: 'web_m6', title: 'Zustand Global State Management & React Suspense Streaming', keyAxiom: 'Zustand provides boilerplate-free immutable state stores without context re-render cascades.', formulaOrRule: 'const useStore = create((set) => ({ count: 0, inc: () => set((s) => ({ count: s.count + 1 })) }))', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'web_u4',
        unitNumber: 'Unit 4',
        subjectName: 'Backend & API Engineering (Node.js, Express, REST & GraphQL)',
        title: 'Node.js Express APIs, JWT Authentication & WebSockets',
        tamilTitle: 'அலகு 4: பேக் எண்ட் ஏபிஐ மற்றும் பாதுகாப்பு',
        chapters: [
          {
            id: 'web_c4',
            chapterNumber: 4,
            title: 'RESTful API Design, JWT Auth, Middleware & Rate Limiting',
            tamilTitle: 'ரெஸ்ட் ஏபிஐ & டோக்கன் பாதுகாப்பு',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: 'web_c4_s1',
                title: 'Stateless JWT Auth, CORS, Helmet Headers & Input Validation',
                microTopics: [
                  { id: 'web_m7', title: 'JSON Web Token (JWT) Access + Refresh Token Rotation Strategy', keyAxiom: 'Short-lived access tokens (15 mins) paired with secure HttpOnly refresh cookies prevent XSS credential theft.', formulaOrRule: 'jwt.sign({ userId }, SECRET, { expiresIn: "15m" })', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'web_u5',
        unitNumber: 'Unit 5',
        subjectName: 'Databases, DevOps & Cloud (PostgreSQL, Supabase, Docker, Vercel)',
        title: 'PostgreSQL Relational Design, Redis Caching, Docker & CI/CD',
        tamilTitle: 'அலகு 5: டேட்டாபேஸ், கிளவுட் & டாக்கர்',
        chapters: [
          {
            id: 'web_c5',
            chapterNumber: 5,
            title: 'PostgreSQL Queries, Prisma ORM, Redis & Docker Deployment',
            tamilTitle: 'டேட்டாபேஸ் வினவல்கள் & டாக்கர்',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: 'web_c5_s1',
                title: 'ACID Transactions, Redis Cache-Aside & Multi-Stage Dockerfile',
                microTopics: [
                  { id: 'web_m8', title: 'PostgreSQL Indexing (B-Tree, GIN) and Query Optimization with EXPLAIN ANALYZE', keyAxiom: 'Proper B-Tree indexing on foreign keys reduces table scan time from O(N) to O(log N).', formulaOrRule: 'CREATE INDEX idx_user_email ON users(email);', pyqFrequency: 'Very High' },
                  { id: 'web_m9', title: 'Docker Multi-Stage Build for Next.js/Node production containerization', keyAxiom: 'Multi-stage builds eliminate compiler toolchains from final minimal runtime images.', formulaOrRule: 'FROM node:20-alpine AS runner', pyqFrequency: 'High' }
                ]
              }
            ]
          }
        ]
      }
    ];
  }

  // 2. LKG
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
                  { id: 'lkg_tam_m1', title: 'அ முதல் ஔ வரையிலான 12 உயிர் எழுத்துக்களின் உச்சரிப்பு', keyAxiom: 'உயிர் எழுத்துக்கள் 12 தனித்து இயங்கும் ஆற்றல் கொண்டவை.', pyqFrequency: 'High' }
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
                title: 'One-to-One Correspondence and Shapes',
                microTopics: [
                  { id: 'lkg_mat_m1', title: 'Counting with physical objects & Big vs Small comparison', keyAxiom: 'Cardinality rule: the last count represents total quantity.', formulaOrRule: 'Count 1 to 20', pyqFrequency: 'High' }
                ]
              }
            ]
          }
        ]
      }
    ];
  }

  // 3. UKG
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
                  { id: 'ukg_tam_m1', title: 'மெய் எழுத்துக்கள் 18 புள்ளி வைத்த எழுத்துக்கள்', keyAxiom: 'மெய் எழுத்துக்களின் ஒலி அரை மாத்திரை அளவு கொண்டது.', pyqFrequency: 'High' }
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
        subjectName: 'Mathematics',
        title: 'Numbers 1 to 50 & Single-Digit Addition',
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
                title: 'Visual Addition using Number Lines',
                microTopics: [
                  { id: 'ukg_mat_m1', title: 'Single-digit addition facts up to 10 (3 + 4 = 7)', keyAxiom: 'Addition represents combining two discrete sets of items.', formulaOrRule: 'a + b = c', pyqFrequency: 'High' }
                ]
              }
            ]
          }
        ]
      }
    ];
  }

  // 4. Class 1 to 5 (Primary School)
  if (t.includes('class 1') || t.includes('1st standard') || t.includes('class 2') || t.includes('2nd standard') || t.includes('class 3') || t.includes('3rd standard') || t.includes('class 4') || t.includes('4th standard') || t.includes('class 5') || t.includes('5th standard')) {
    const clsNum = t.includes('class 1') || t.includes('1st') ? '1' : t.includes('class 2') || t.includes('2nd') ? '2' : t.includes('class 3') || t.includes('3rd') ? '3' : t.includes('class 4') || t.includes('4th') ? '4' : '5';
    return [
      {
        id: `c${clsNum}_tam`,
        unitNumber: 'பகுதி 1',
        subjectName: 'தமிழ் (Tamil)',
        title: `வகுப்பு ${clsNum}: செய்யுள், உரைநடை & இலக்கணப் பயிற்சிகள்`,
        chapters: [
          {
            id: `c${clsNum}_tam_c1`,
            chapterNumber: 1,
            title: 'ஆத்திசூடி, கொன்றை வேந்தன், மூதுரை & நீதிநூல்கள்',
            tamilTitle: 'நீதி இலக்கியங்கள்',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: `c${clsNum}_tam_s1`,
                title: 'பெயர்ச்சொல், வினைச்சொல் & நிறுத்தற்குறிகள்',
                microTopics: [
                  { id: `c${clsNum}_tam_m1`, title: 'உயிர்மெய் எழுத்துக்கள் & பாடல் நயம்', keyAxiom: 'சொற்கள் பொருளுணர்த்தும் முறையே இலக்கணம் எனப்படும்.', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: `c${clsNum}_eng`,
        unitNumber: 'Unit 2',
        subjectName: 'English',
        title: `Class ${clsNum}: Tenses, Pronouns, Adjectives & Comprehension`,
        chapters: [
          {
            id: `c${clsNum}_eng_c1`,
            chapterNumber: 1,
            title: 'Action Words, Tenses & Paragraph Composition',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: `c${clsNum}_eng_s1`,
                title: 'Grammar Mechanics & Vocabulary Expansion',
                microTopics: [
                  { id: `c${clsNum}_eng_m1`, title: 'Regular/Irregular verb transformations & Prepositions', keyAxiom: 'Tense specifies the temporal location of an action.', formulaOrRule: 'Verb Conjugation', pyqFrequency: 'Very High' }
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
        title: `Class ${clsNum}: Numbers, Multiplication Tables & Geometry`,
        chapters: [
          {
            id: `c${clsNum}_mat_c1`,
            chapterNumber: 1,
            title: 'Multiplication Tables, Long Division & Area/Perimeter',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: `c${clsNum}_mat_s1`,
                title: 'Arithmetic Operations & Geometric Formulas',
                microTopics: [
                  { id: `c${clsNum}_mat_m1`, title: 'Dividend = (Divisor x Quotient) + Remainder', keyAxiom: 'Multiplication represents repeated addition.', formulaOrRule: 'D = d*q + r', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: `c${clsNum}_sci`,
        unitNumber: 'Unit 4',
        subjectName: 'Science / EVS',
        title: `Class ${clsNum}: Human Organ Systems, Plants & Solar System`,
        chapters: [
          {
            id: `c${clsNum}_sci_c1`,
            chapterNumber: 1,
            title: 'Sense Organs, Food & Digestion, Circulatory System',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: `c${clsNum}_sci_s1`,
                title: 'Biological Anatomy and Plants',
                microTopics: [
                  { id: `c${clsNum}_sci_m1`, title: 'Heart pumping mechanism, blood vessels, and photosynthesis', keyAxiom: 'Circulatory system delivers oxygen and nutrients to cellular mitochondria.', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      }
    ];
  }

  // 5. Class 6 to 9 (Middle & Secondary)
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
            title: 'இன்பத்தமிழ், திராவிட மொழிக்குடும்பம் & இலக்கணம்',
            tamilTitle: 'மொழி & இலக்கணம்',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: `c${clsNum}_tam_s1`,
                title: 'சார்பெழுத்துக்கள் & வல்லினம் மிகும் இடங்கள்',
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
                  { id: `c${clsNum}_eng_m1`, title: 'Clause identification and voice transformation', keyAxiom: 'A clause contains a subject and a predicate.', formulaOrRule: 'Dependent + Independent Clause', pyqFrequency: 'Very High' }
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
            title: 'Real Numbers, Algebraic Identities & Coordinate Geometry',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: `c${clsNum}_mat_s1`,
                title: 'Coordinate Distance Formula & Factorization',
                microTopics: [
                  { id: `c${clsNum}_mat_m1`, title: 'Distance formula: d = sqrt((x2-x1)^2 + (y2-y1)^2)', keyAxiom: 'Euclidean metric calculates distance between coordinates.', formulaOrRule: 'd = sqrt((x2-x1)^2 + (y2-y1)^2)', pyqFrequency: 'Very High' }
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
        title: `Class ${clsNum}: Force & Motion, Structure of Atom & Tissues`,
        chapters: [
          {
            id: `c${clsNum}_sci_c1`,
            chapterNumber: 1,
            title: 'Equations of Motion (v=u+at) & Bohr Model',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: `c${clsNum}_sci_s1`,
                title: 'Kinematics & Atomic Quantization',
                microTopics: [
                  { id: `c${clsNum}_sci_m1`, title: 'v^2 = u^2 + 2as and 2n^2 electron shell capacity', keyAxiom: 'Electrons occupy discrete quantized energy orbits.', formulaOrRule: 'v^2 = u^2 + 2as', pyqFrequency: 'Very High' }
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
                  { id: '10_tam_m1', title: 'பாவலரேறு பெருஞ்சித்திரனாரின் கணிச்சாறு பாடல் விளக்கம்', keyAxiom: 'தமிழ் மொழியின் தொன்மை, நற்றினை, எட்டுத்தொகை பெருமைகள்.', pyqFrequency: 'High' }
                ]
              }
            ]
          },
          {
            id: '10_tam_c2',
            chapterNumber: 2,
            title: 'தமிழ்ச்சொல் வளம் (உரைநடை - தேவநேயப் பாவாணர்)',
            tamilTitle: 'தமிழ்ச்சொல் வளம்',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: '10_tam_c2_s1',
                title: 'தாவரத்தின் அடிப்பகுதி மற்றும் இலைவகைப் பெயர்கள்',
                microTopics: [
                  { id: '10_tam_m2', title: 'அடிவகை (தாள், தண்டு, கோல்) & இலைவகைகள்', keyAxiom: 'தமிழின் தாவரச் சொல்வளம் உலக மொழிகளிலேயே மிக நுட்பமானது.', pyqFrequency: 'Very High' }
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
        title: 'Prose: His First Flight | Poem: Life | Active & Passive Voice',
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
                title: 'Young Seagull’s Flight & Parental Motivation',
                microTopics: [
                  { id: '10_eng_m1', title: 'Seagull’s ledge struggle and maiden flight takeoff', keyAxiom: 'Courage overcomes innate fear through survival instinct.', pyqFrequency: 'High' }
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
        title: 'Relations, Functions, Numbers & Sequences (உறவுகளும் எண்களும்)',
        tamilTitle: 'அலகு 1: உறவுகளும் சார்புகளும்',
        chapters: [
          {
            id: '10_mat_c1',
            chapterNumber: 1,
            title: 'Cartesian Products & Relations (கார்டீசியன் பெருக்கல்)',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: '10_mat_c1_s1',
                title: 'Cartesian Product n(A x B) = n(A) * n(B)',
                microTopics: [
                  { id: '10_mat_m1', title: 'Cartesian Product cardinality: n(A x B) = n(A) * n(B)', keyAxiom: 'If n(A) = p and n(B) = q, then n(A x B) = pq.', formulaOrRule: 'n(A x B) = n(A)*n(B)', pyqFrequency: 'Very High' }
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
            title: 'Newton’s Second Law & Momentum Conservation',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: '10_sci_c1_s1',
                title: 'Force F = ma and Conservation of Momentum',
                microTopics: [
                  { id: '10_sci_m1', title: 'F = m*a & m1*u1 + m2*u2 = m1*v1 + m2*v2', keyAxiom: 'Rate of change of momentum is proportional to applied force.', formulaOrRule: 'F = m * a', pyqFrequency: 'Very High' }
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
        title: 'Freedom Struggle in TN & Indian Constitution',
        tamilTitle: 'அலகு 1: விடுதலைப் போராட்டம் & அரசியலமைப்பு',
        chapters: [
          {
            id: '10_soc_c1',
            chapterNumber: 1,
            title: 'VOC Swadeshi Ships & Fundamental Rights (Articles 12-35)',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: '10_soc_c1_s1',
                title: 'Vedaranyam March and 5 Constitutional Writs',
                microTopics: [
                  { id: '10_soc_m1', title: 'VOC Swadeshi Steam Navigation & Article 32 Writs', keyAxiom: 'Dr. Ambedkar called Article 32 the "Heart and Soul of the Constitution".', formulaOrRule: 'Articles 12-35', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      }
    ];
  }

  // 7. Class 11 & 12 (Higher Secondary)
  if (t.includes('class 11') || t.includes('11th') || t.includes('plus one') || t.includes('class 12') || t.includes('12th') || t.includes('plus two') || t.includes('hsc')) {
    const is11 = t.includes('11');
    return [
      {
        id: 'hsc_phy',
        unitNumber: 'Unit 1: Physics',
        subjectName: 'Physics (இயற்பியல்)',
        title: is11 ? 'Kinematics, Newton’s Laws & Thermodynamics' : 'Electrostatics, Current Electricity & Wave Optics',
        chapters: [
          {
            id: 'hsc_phy_c1',
            chapterNumber: 1,
            title: is11 ? '2D Projectiles & Work-Energy Theorem' : 'Coulomb’s Law, Gauss’s Law & Wheatstone Bridge',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: 'hsc_phy_s1',
                title: 'Physics Derivations and Problem Solving',
                microTopics: [
                  { id: 'hsc_phy_m1', title: is11 ? 'R_max = u^2/g at 45°' : 'F = k*q1*q2/r^2 & P/Q = R/S', keyAxiom: 'Governing electrostatic and kinematic field equations.', formulaOrRule: is11 ? 'R_max = u^2/g' : 'P/Q = R/S', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'hsc_chem',
        unitNumber: 'Unit 2: Chemistry',
        subjectName: 'Chemistry (வேதியியல்)',
        title: is11 ? 'Atomic Structure & Chemical Bonding' : 'Electrochemistry, Chemical Kinetics & Organic',
        chapters: [
          {
            id: 'hsc_ch_c1',
            chapterNumber: 1,
            title: is11 ? 'Quantum Numbers & Aufbau Principle' : 'Nernst Equation & First Order Kinetics (t_1/2=0.693/k)',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: 'hsc_ch_s1',
                title: 'Chemical Equations and Reaction Rates',
                microTopics: [
                  { id: 'hsc_ch_m1', title: is11 ? 'Pauli exclusion & Hund rule' : 'E_cell = E0 - (0.0591/n)log Q', keyAxiom: 'Thermodynamic potentials determine reaction spontaneity.', formulaOrRule: is11 ? '2n^2' : 'E_cell = E0 - (0.0591/n)log Q', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'hsc_mat',
        unitNumber: 'Unit 3: Mathematics',
        subjectName: 'Mathematics (கணிதம்)',
        title: is11 ? 'Trigonometry & Differential Calculus' : 'Matrices, Integral Calculus & Differential Equations',
        chapters: [
          {
            id: 'hsc_mat_c1',
            chapterNumber: 1,
            title: is11 ? 'Product/Quotient Rules of Differentiation' : 'Matrix Inverses & Integration by Parts',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            youtubeId: 'dQw4w9WgXcQ',
            subtopics: [
              {
                id: 'hsc_mat_s1',
                title: 'Calculus Theorems & Matrices',
                microTopics: [
                  { id: 'hsc_mat_m1', title: is11 ? 'd/dx(x^n) = n*x^(n-1)' : 'A^-1 = (1/|A|) adj(A)', keyAxiom: 'Matrix inverse exists if determinant |A| != 0.', formulaOrRule: is11 ? 'd/dx(x^n) = n*x^(n-1)' : 'A^-1 = (1/|A|) adj(A)', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      }
    ];
  }

  // 8. NEET / JEE Entrance
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
                  { id: 'np_m1', title: 'Max Horizontal Range: R_max = u^2 / g at theta = 45 degrees', keyAxiom: 'At 45 degrees elevation, horizontal range is maximized in vacuum.', formulaOrRule: 'R = (u^2 * sin(2*theta)) / g', pyqFrequency: 'Very High' }
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
                title: 'Drift Velocity I = n*e*A*v_d & Einstein Equation',
                microTopics: [
                  { id: 'np_m2', title: 'Photoelectric work function: e*V_0 = h*nu - phi', keyAxiom: 'Photoelectron kinetic energy depends solely on photon frequency.', formulaOrRule: 'h*nu = phi + e*V_0', pyqFrequency: 'Very High' }
                ]
              }
            ]
          }
        ]
      }
    ];
  }

  // 9. TNPSC / Govt Exams
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

  // 10. Generic Master Fallback
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
          id: 'gen_c2',
          chapterNumber: 2,
          title: `${courseTitle} — Exam Mock Scenarios & Solutions`,
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          youtubeId: 'dQw4w9WgXcQ',
          subtopics: [
            {
              id: 'gen_c2_s1',
              title: 'Comprehensive Capstone Analysis',
              microTopics: [
                { id: 'gen_m3', title: `${courseTitle} — Case Studies & Production Architectures`, keyAxiom: 'End-to-end integration testing and performance optimization.', pyqFrequency: 'High' }
              ]
            }
          ]
        }
      ]
    }
  ];
}
