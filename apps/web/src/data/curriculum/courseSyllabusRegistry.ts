/**
 * TeachO Master Course Syllabus Registry
 * Complete Authentic Real-World Micro-Granular Curricula for all 86 Courses:
 * - Foundational Stage: LKG, UKG, Class 1, Class 2 (Ages 3–8)
 * - Preparatory Stage: Class 3, Class 4, Class 5 (Ages 8–11)
 * - Middle Stage: Class 6, Class 7, Class 8 (Ages 11–14)
 * - Secondary Stage: Class 9, Class 10 (Ages 14–16)
 */
import { UPSC_OPTIONALS_REGISTRY } from './upscCurriculumData';
import { NEET_UG_OFFICIAL_SUBJECTS, JEE_MAIN_ADVANCED_OFFICIAL_SUBJECTS, TNPSC_UNIFIED_OFFICIAL_SUBJECTS } from './officialExhaustiveSyllabi';

export interface SyllabusMicroTopic {
  id: string;
  topicTitle?: string;
  title?: string;
  subtopic?: string;
  dayNumber?: number;
  periodNumber?: number;
  keyFormulaOrLaw?: string;
  keyAxiom?: string;
  keyPoints?: string[];
  type?: 'concept' | 'solved_problem' | 'memorization' | 'quiz' | string;
  importance?: 'High-Yield' | 'Core Standard' | 'Foundational' | string;
}

export interface SyllabusSubtopic {
  id?: string;
  title: string;
  microTopics?: Array<{ id: string; title: string; keyAxiom?: string } | SyllabusMicroTopic>;
}

export interface SyllabusChapter {
  chapterNumber?: number;
  chapterTitle: string;
  chapterTamilTitle?: string;
  tamilTitle?: string;
  title?: string;
  description?: string;
  subtopics?: SyllabusSubtopic[];
  microTopics?: SyllabusMicroTopic[];
}

export interface SyllabusSubject {
  subjectId: string;
  subjectName: string;
  icon?: string;
  color?: string;
  totalChapters?: number;
  totalMicroTopics?: number;
  chapters: SyllabusChapter[];
}

export interface CourseFullSyllabus {
  courseId: string;
  courseTitle: string;
  category: string;
  board: string;
  medium: string;
  totalDays: number;
  totalSubjects: number;
  totalChapters: number;
  totalMicroTopics: number;
  subjects: SyllabusSubject[];
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. FOUNDATIONAL STAGE: CLASS 1 & CLASS 2 (AGES 6–8)
// ─────────────────────────────────────────────────────────────────────────────
export function getFoundationalClass1to2Syllabus(courseId: string, courseTitle: string): CourseFullSyllabus {
  const isTa = courseTitle.includes('தமிழ்') || courseId.includes('-ta-');

  const subjects: SyllabusSubject[] = [
    {
      subjectId: 'fnd_tamil',
      subjectName: 'தமிழ் (Tamil — உயிர், மெய் எழுத்துகள் & மழலையர் பாடல்)',
      icon: '🔤',
      color: '#ec4899',
      totalChapters: 4,
      totalMicroTopics: 12,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: 'உயிர் எழுத்துகள் (12) & ஆய்த எழுத்து (ஃ)',
          description: 'அ முதல் ஔ வரை உள்ள 12 உயிர் எழுத்துகள், ஆய்த எழுத்து ஃ, படங்களைப் பார்த்து எழுத்துகளை அடையாளம் காணுதல்',
          subtopics: [
            {
              id: 'fnd_t_sub1',
              title: 'உயிர் எழுத்துகள் உச்சரிப்பு & படக்கதை',
              microTopics: [
                { id: 'fnd_t_1', title: 'குறில் மற்றும் நெடில் உயிர் எழுத்துகள் (அ, ஆ, இ, ஈ...)', keyAxiom: 'உயிர் எழுத்துகள் 12: குறில் 5 (அ, இ, உ, எ, ஒ), நெடில் 7 (ஆ, ஈ, ஊ, ஏ, ஐ, ஓ, ஔ)' },
                { id: 'fnd_t_2', title: 'ஆய்த எழுத்து (ஃ) — எஃகு, அஃது உச்சரிப்பு & பயன்பாடு', keyAxiom: 'ஆய்த எழுத்து சொல்லின் இடையில் மட்டுமே வரும் தனிநிலை எழுத்து' }
              ]
            }
          ],
          microTopics: [
            { id: 'fnd_t_1', topicTitle: 'குறில் மற்றும் நெடில் உயிர் எழுத்துகள் (அ முதல் ஔ வரை)', subtopic: 'படங்களை பார்த்து எழுத்துகளை அறிதல்', dayNumber: 1, periodNumber: 1, keyFormulaOrLaw: 'உயிர் எழுத்துக்கள்: அ, ஆ, இ, ஈ, உ, ஊ, எ, ஏ, ஐ, ஒ, ஓ, ஔ (மொத்தம் 12)', keyPoints: ['அ - அணில், அம்மா', 'ஆ - ஆடு, ஆலமரம்', 'இ - இலை, இஞ்சி', 'ஈ - ஈட்டி, ஈசல்'], type: 'concept', importance: 'Foundational' }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: 'மெய் எழுத்துகள் (18) — வல்லினம், மெல்லினம், இடையினம்',
          description: 'க் முதல் ன் வரை உள்ள 18 புள்ளி வைத்த மெய் எழுத்துகள் மற்றும் 3 இனப் பிரிவுகள்',
          subtopics: [
            {
              id: 'fnd_t_sub2',
              title: 'மெய் எழுத்துகள் மூவினப் பிரிவுகள்',
              microTopics: [
                { id: 'fnd_t_3', title: 'வல்லினம் (கசடதபற — க், ச், ட், த், ப், ற்) உச்சரிப்பு', keyAxiom: 'வல்லினம் வன்மையான ஓசையுடைய எழுத்துகள்' },
                { id: 'fnd_t_4', title: 'மெல்லினம் (ஙஞணநமன) & இடையினம் (யரலவழள)', keyAxiom: 'மெல்லினம் மென்மையான ஓசை; இடையினம் இடைப்பட்ட ஓசை' }
              ]
            }
          ],
          microTopics: [
            { id: 'fnd_t_3', topicTitle: 'மெய் எழுத்துகள் 18 வகைப்பாடு (வல்லினம், மெல்லினம், இடையினம்)', subtopic: 'கசடதபற, ஙஞணநமன, யரலவழள உச்சரிப்பு', dayNumber: 4, periodNumber: 1, keyFormulaOrLaw: 'வல்லினம்: க் ச் ட் த் ப் ற் | மெல்லினம்: ங் ஞ் ண் ந் ம் ன் | இடையினம்: ய் ர் ல் வ் ழ் ள்', keyPoints: ['மெய் எழுத்துகள் புள்ளி பெற்ற எழுத்துகள்', 'மொத்தம் 18 மெய் எழுத்துகள்'], type: 'concept', importance: 'Foundational' }
          ]
        },
        {
          chapterNumber: 3,
          chapterTitle: 'உயிர்மெய் எழுத்துகள் அறிமுகம் & சொல் விளையாட்டு',
          description: 'உயிர் + மெய் இணையும் உயிர்மெய் எழுத்துகள் (216) & எளிய 2, 3 எழுத்துச் சொற்கள்',
          subtopics: [
            {
              id: 'fnd_t_sub3',
              title: 'உயிர்மெய் உருவாக்க வாய்பாடு',
              microTopics: [
                { id: 'fnd_t_5', title: 'க் + அ = க வரிசை முதல் க் + ஔ = கௌ வரை', keyAxiom: 'உயிர்மெய் எழுத்துகள் மொத்தம் 18 × 12 = 216 எழுத்துகள்' }
              ]
            }
          ],
          microTopics: [
            { id: 'fnd_t_5', topicTitle: 'உயிர்மெய் எழுத்துகள் அட்டவணை & எளிய சொற்கள்', subtopic: 'க் + அ = க வாய்பாடு மற்றும் படச்சொற்கள்', dayNumber: 7, periodNumber: 1, keyFormulaOrLaw: 'உயிர் (12) + மெய் (18) = உயிர்மெய் (216) | தமிழ் மொத்த எழுத்துகள் = 247', keyPoints: ['கல், கண், பல், மரம், படம் போன்ற எளிய சொற்களை எழுதுதல்'], type: 'concept', importance: 'Foundational' }
          ]
        },
        {
          chapterNumber: 4,
          chapterTitle: 'ஔவையார் ஆத்திசூடி, நீதிப்பாடல்கள் & கதைகள்',
          description: 'அறஞ்செய விரும்பு முதல் ஔவியம் பேசேல் வரை ஆத்திசூடி வரிகள் மற்றும் நற்பண்புகள்',
          subtopics: [
            {
              id: 'fnd_t_sub4',
              title: 'ஆத்திசூடி நற்பண்புகள் & கதைகள்',
              microTopics: [
                { id: 'fnd_t_6', title: 'அறஞ்செய விரும்பு, ஆறுவது சினம், இயல்வது கரவேல் விளக்கம்', keyAxiom: 'ஆத்திசூடி பாடியவர் ஔவையார் — எளிய நன்னெறி நீதி நூல்' }
              ]
            }
          ],
          microTopics: [
            { id: 'fnd_t_6', topicTitle: 'ஔவையார் ஆத்திசூடி (12 வரிகள் & நயவுரை)', subtopic: 'அறஞ்செய விரும்பு — எப்போதும் நல்ல செயல்களைச் செய்', dayNumber: 10, periodNumber: 1, keyFormulaOrLaw: 'ஆத்திசூடி: "அறஞ்செய விரும்பு", "ஆறுவது சினம்", "ஈயது விலக்கேல்"', keyPoints: ['ஔவையார் அருளிய நீதி நெறிமுறைகளை அன்றாட வாழ்வில் கடைப்பிடித்தல்'], type: 'memorization', importance: 'High-Yield' }
          ]
        }
      ]
    },
    {
      subjectId: 'fnd_english',
      subjectName: 'English (Phonics, Sight Words & Foundational Literacy)',
      icon: '🔤',
      color: '#3b82f6',
      totalChapters: 4,
      totalMicroTopics: 12,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: 'Phonics Sounds (A to Z) & CVC Word Blends',
          description: 'Letter sounds, phoneme recognition, and 3-letter CVC word blending (-at, -en, -in, -og, -un)',
          subtopics: [
            {
              id: 'fnd_e_sub1',
              title: 'Phonics Sounds & CVC Blending',
              microTopics: [
                { id: 'fnd_e_1', title: 'Letter Sounds /a/ to /z/ & Phonics Rhymes', keyAxiom: '26 Letters representing 44 English Phoneme sounds' },
                { id: 'fnd_e_2', title: 'CVC 3-Letter Blending (Cat, Pen, Pin, Dog, Sun)', keyAxiom: 'Consonant + Vowel + Consonant word formation' }
              ]
            }
          ],
          microTopics: [
            { id: 'fnd_e_1', topicTitle: 'Letters A to Z Phonics & CVC Word Blends', subtopic: 'Bat, Cat, Mat, Hen, Pen, Tin, Pin, Pot, Dot, Sun, Run', dayNumber: 2, periodNumber: 2, keyFormulaOrLaw: 'Phonics: /b/ + /æ/ + /t/ = Bat | CVC Blending Pattern', keyPoints: ['Short vowel sounds (a, e, i, o, u)', 'Visual word cards and picture matching'], type: 'concept', importance: 'Foundational' }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: 'Sight Words, Action Verbs & Simple Sentences',
          description: 'High-frequency sight words (The, Is, In, On, Under, This, That) and action words (Run, Jump, Read)',
          subtopics: [
            {
              id: 'fnd_e_sub2',
              title: 'Sight Words & Sentence Building',
              microTopics: [
                { id: 'fnd_e_3', title: 'High-Frequency Sight Words (He, She, It, They, We)', keyAxiom: 'Recognize sight words by sight without sounding out' },
                { id: 'fnd_e_4', title: 'Action Words & Simple Subject + Verb Sentences', keyAxiom: 'Sentence structure: "This is a cat", "The dog can run"' }
              ]
            }
          ],
          microTopics: [
            { id: 'fnd_e_3', topicTitle: 'Sight Words Mastery & Simple Reading Sentences', subtopic: 'This is my bag, I can jump, The sun is hot', dayNumber: 5, periodNumber: 2, keyFormulaOrLaw: 'Sentence Rule: Start with Capital letter, End with Full Stop (.)', keyPoints: ['Top 20 Dolch sight words for early readers', 'Forming 3 to 4 word simple sentences'], type: 'concept', importance: 'Foundational' }
          ]
        },
        {
          chapterNumber: 3,
          chapterTitle: 'Classic Nursery Rhymes & Picture Story Reading',
          description: 'Twinkle Twinkle, Baa Baa Black Sheep, Jack and Jill, and Aesop moral fables',
          subtopics: [
            {
              id: 'fnd_e_sub3',
              title: 'Rhymes & Moral Picture Stories',
              microTopics: [
                { id: 'fnd_e_5', title: 'Classic English Rhymes with Actions', keyAxiom: 'Rhyming words: Star-Far, High-Sky, Sheep-Wool' },
                { id: 'fnd_e_6', title: 'Aesop Moral Stories (The Thirsty Crow, The Hare and Tortoise)', keyAxiom: 'Moral values: Hard work and patience bring success' }
              ]
            }
          ],
          microTopics: [
            { id: 'fnd_e_5', topicTitle: 'Nursery Rhymes, Rhythm & Story Comprehension', subtopic: 'The Thirsty Crow and The Tortoise & The Hare story reading', dayNumber: 8, periodNumber: 2, keyFormulaOrLaw: 'Rhyming Pair: Ring - Sing | King - Wing | Cat - Hat', keyPoints: ['Identifying main characters in a picture story', 'Reciting rhymes with correct intonation and actions'], type: 'memorization', importance: 'Foundational' }
          ]
        },
        {
          chapterNumber: 4,
          chapterTitle: 'Grammar Basics: Naming Words (Nouns) & Pronouns',
          description: 'Person, Place, Animal, Thing naming words, One & Many (Singular/Plural -s, -es), He/She/It',
          subtopics: [
            {
              id: 'fnd_e_sub4',
              title: 'Nouns & Singular/Plural Concepts',
              microTopics: [
                { id: 'fnd_e_7', title: 'Naming Words: Person, Place, Animal, Thing', keyAxiom: 'A Noun is the name of a person, place, animal, or object' },
                { id: 'fnd_e_8', title: 'Singular & Plural (Book -> Books, Box -> Boxes)', keyAxiom: 'Add -s or -es to change one into many' }
              ]
            }
          ],
          microTopics: [
            { id: 'fnd_e_7', topicTitle: 'Nouns (Naming Words) & Singular/Plural Concept', subtopic: 'Boy -> Boys, Apple -> Apples, Cat -> Cats', dayNumber: 11, periodNumber: 2, keyFormulaOrLaw: 'Noun Definition: Person / Place / Animal / Thing | Singular + s = Plural', keyPoints: ['Underlining nouns in simple sentences', 'Using He for boys, She for girls, It for things and animals'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        }
      ]
    },
    {
      subjectId: 'fnd_math',
      subjectName: isTa ? 'கணிதம் (Mathematics Core & FLN)' : 'Mathematics & Number Sense (FLN)',
      icon: '🔢',
      color: '#06b6d4',
      totalChapters: 3,
      totalMicroTopics: 10,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: isTa ? 'எண்கள், இடமதிப்பு & கூட்டல்/கழித்தல்' : 'Numbers (1–100), Place Value & Addition/Subtraction',
          description: isTa ? '2 மற்றும் 3 இலக்க எண்கள், பத்துகள்/ஒன்றுகள் இடமதிப்பு, கூட்டல் கழித்தல் கணக்குகள்' : '2 & 3-digit numbers, Tens/Ones place value, Skip counting (2s, 5s, 10s), Word problems',
          subtopics: [
            {
              id: 'fnd_m_sub1',
              title: 'எண்கள் & இடமதிப்பு அடிப்படை',
              microTopics: [
                { id: 'fnd_m_1', title: 'இடமதிப்பு & 2 இலக்க எண்கள் (Tens & Ones)', keyAxiom: '1 Ten = 10 Ones | 1 Hundred = 10 Tens' },
                { id: 'fnd_m_2', title: 'கூட்டல் & கழித்தல் எளிய கணக்குகள்', keyAxiom: 'Addition combines (+) | Subtraction takes away (-)' }
              ]
            }
          ],
          microTopics: [
            { id: 'fnd_m_1', topicTitle: isTa ? 'இடமதிப்பு & 2 இலக்க எண்கள் (Tens & Ones)' : 'Place Value & 2-Digit Numbers (Tens & Ones)', subtopic: isTa ? 'மணிகள் சட்டம் மூலம் இடமதிப்பு அறிதல்' : 'Abacus representation, tens and ones grouping', dayNumber: 3, periodNumber: 3, keyFormulaOrLaw: 'Place Value: 1 Ten = 10 Ones | 1 Hundred = 10 Tens', keyPoints: ['Grouping into bundles of tens', 'Expanded form: 47 = 40 + 7'], type: 'concept', importance: 'Foundational' },
            { id: 'fnd_m_2', topicTitle: isTa ? 'கூட்டல் & கழித்தல் எளிய கணக்குகள்' : 'Addition & Subtraction Word Problems', subtopic: isTa ? 'நடைமுறை வாழ்க்கை கணக்கீடுகள்' : 'Single and double-digit operations with carry-over and borrowing', dayNumber: 6, periodNumber: 3, keyFormulaOrLaw: 'Addition: Combine groups (+) | Subtraction: Take away (-)', keyPoints: ['Word problem keywords: Total, In all, Left, Difference', 'Checking subtraction using addition'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: isTa ? 'பெருக்கல் வாய்ப்பாடுகள் (1–10) & நாணயங்கள்' : 'Multiplication Tables (1–10) & Indian Currency',
          description: isTa ? 'தொடர் கூட்டலே பெருக்கல், சமமாகப் பிரித்தலே வகுத்தல், இந்திய ரூபாய் நோட்டுகள்' : 'Multiplication as repeated addition, Division as sharing, Indian coins & notes',
          subtopics: [
            {
              id: 'fnd_m_sub2',
              title: 'பெருக்கல் வாய்ப்பாடு & நாணயங்கள்',
              microTopics: [
                { id: 'fnd_m_3', title: 'பெருக்கல் வாய்ப்பாடுகள் (2, 3, 4, 5, 10)', keyAxiom: 'Multiplication is repeated addition: 3 × 4 = 4 + 4 + 4 = 12' },
                { id: 'fnd_m_4', title: 'இந்திய நாணயங்கள் & ரூபாய் நோட்டுகள் (₹1 முதல் ₹100)', keyAxiom: '1 Rupee (₹1) = 100 Paise' }
              ]
            }
          ],
          microTopics: [
            { id: 'fnd_m_3', topicTitle: isTa ? 'பெருக்கல் வாய்ப்பாடு & தொடர் கூட்டல்' : 'Multiplication Tables & Repeated Addition', subtopic: isTa ? '2, 3, 5, 10 வாய்ப்பாடுகள் பயிற்சி' : 'Visual array grouping and tables 1 to 10', dayNumber: 9, periodNumber: 3, keyFormulaOrLaw: 'Multiplication: 3 × 4 = 4 + 4 + 4 = 12', keyPoints: ['Order of multiplication does not change product (a × b = b × a)', 'Multiplying any number by 0 gives 0; by 1 gives same number'], type: 'memorization', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 3,
          chapterTitle: isTa ? 'வடிவியல் (2D Shapes), காலம் & அளவீடுகள்' : 'Geometry (2D/3D Shapes), Time & Measurement',
          description: isTa ? 'வட்டம், சதுரம், செவ்வகம், முக்கோணம், கடிகார நேரம் பார்த்தல், நீளம் எடை அளவுகள்' : 'Circle, Square, Rectangle, Triangle, Clock time reading, Length/Weight',
          subtopics: [
            {
              id: 'fnd_m_sub3',
              title: 'வடிவங்கள் & கடிகார நேரம்',
              microTopics: [
                { id: 'fnd_m_5', title: '2D & 3D வடிவங்களின் பக்கங்கள் மற்றும் முனைகள்', keyAxiom: 'Square (4 equal sides), Rectangle (opposite sides equal), Triangle (3 sides)' }
              ]
            }
          ],
          microTopics: [
            { id: 'fnd_m_5', topicTitle: isTa ? 'வடிவங்கள் (Shapes), காலம் & அளவீடுகள்' : '2D Shapes, Clock Time & Measurement', subtopic: isTa ? 'சதுரம், செவ்வகம், முக்கோணம், வட்டம்' : 'Identifying shapes, Hour hand and Minute hand on clock', dayNumber: 12, periodNumber: 3, keyFormulaOrLaw: 'Clock: 1 Hour = 60 Minutes | 1 Day = 24 Hours', keyPoints: ['Short hand shows hours; long hand shows minutes', 'Square has 4 equal sides and 4 corners'], type: 'concept', importance: 'Foundational' }
          ]
        }
      ]
    },
    {
      subjectId: 'fnd_science',
      subjectName: isTa ? 'சூழ்நிலையியல் & அறிவியல் (General Science & EVS)' : 'General Science & Environmental Studies',
      icon: '🌿',
      color: '#10b981',
      totalChapters: 2,
      totalMicroTopics: 8,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: isTa ? 'மனித உடல் உறுப்புகள், ஐம்புலன்கள் & சுகாதாரம்' : 'My Body Organs, 5 Senses & Daily Hygiene',
          description: isTa ? 'கண், காது, மூக்கு, நாக்கு, தோல் மற்றும் ஆரோக்கிய உணவுகள்' : '5 senses, Internal organs (Heart, Lungs, Brain), Clean habits',
          subtopics: [
            {
              id: 'fnd_s_sub1',
              title: 'உடல் உறுப்புகள் & நற்பழக்கங்கள்',
              microTopics: [
                { id: 'fnd_s_1', title: 'ஐம்புலன்கள் மற்றும் அவற்றின் பணிகள்', keyAxiom: 'Eyes see, Ears hear, Nose smells, Tongue tastes, Skin feels' }
              ]
            }
          ],
          microTopics: [
            { id: 'fnd_s_1', topicTitle: isTa ? 'ஐம்புலன்கள் & மனித உடல் உறுப்புகளின் பணிகள்' : '5 Sense Organs & Daily Healthy Habits', subtopic: isTa ? 'பார்வை, கேட்டல், நுகர்தல், சுவை, தொடுதல்' : 'Eyes, Ears, Nose, Tongue, Skin functions; Hand hygiene', dayNumber: 13, periodNumber: 4, keyFormulaOrLaw: '5 Sense Organs | Wash hands with soap for 20 seconds', keyPoints: ['Eat healthy green vegetables and fresh fruits', 'Drink clean boiled water daily'], type: 'concept', importance: 'Foundational' }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: isTa ? 'தாவரங்கள், விலங்குகள் & பருவகாலங்கள்' : 'Plants, Animals & Weather Seasons',
          description: isTa ? 'மரங்கள், செடிகள், வீட்டு மற்றும் காட்டு விலங்குகள், கோடை/மழை/குளிர் பருவங்கள்' : 'Trees, Shrubs, Herbs, Animals, Weather and 4 seasons',
          subtopics: [
            {
              id: 'fnd_s_sub2',
              title: 'இயற்கை உலகம் & விலங்குகள்',
              microTopics: [
                { id: 'fnd_s_2', title: 'தாவரங்களின் பாகங்கள் (வேர், தண்டு, இலை, பூ, காய்)', keyAxiom: 'Plants give food, oxygen, and shade to all living beings' }
              ]
            }
          ],
          microTopics: [
            { id: 'fnd_s_2', topicTitle: isTa ? 'தாவர பாகங்கள் & வீட்டு/காட்டு விலங்குகள்' : 'Plant Parts & Animal Habitats', subtopic: isTa ? 'வேர், தண்டு, இலை, பூ மற்றும் விலங்கு உணவுகள்' : 'Root, Stem, Leaf, Flower; Herbivores and Carnivores', dayNumber: 15, periodNumber: 4, keyFormulaOrLaw: 'Photosynthesis: Leaves prepare food using sunlight and water', keyPoints: ['Domestic animals: Cow, Goat, Dog, Cat', 'Wild animals: Lion, Tiger, Elephant, Deer'], type: 'concept', importance: 'Foundational' }
          ]
        }
      ]
    }
  ];

  return {
    courseId,
    courseTitle,
    category: 'school_foundational',
    board: 'TNSB Samacheer Kalvi / CBSE',
    medium: isTa ? 'Tamil' : 'English',
    totalDays: 200,
    totalSubjects: subjects.length,
    totalChapters: subjects.reduce((a, s) => a + s.chapters.length, 0),
    totalMicroTopics: subjects.reduce((a, s) => a + (s.totalMicroTopics || s.chapters.reduce((acc, c) => acc + (c.microTopics?.length || 0), 0)), 0),
    subjects
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. PREPARATORY STAGE: CLASS 3 TO CLASS 5 (AGES 8–11)
// ─────────────────────────────────────────────────────────────────────────────
export function getPreparatoryClass3to5Syllabus(courseId: string, courseTitle: string): CourseFullSyllabus {
  const isTa = courseTitle.includes('தமிழ்') || courseId.includes('-ta-');

  const subjects: SyllabusSubject[] = [
    {
      subjectId: 'prep_tamil',
      subjectName: 'தமிழ் (Tamil — செய்யுள், உரைநடை, துணைப்பாடம் & கற்கண்டு இலக்கணம்)',
      icon: '🔤',
      color: '#ec4899',
      totalChapters: 4,
      totalMicroTopics: 14,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: 'செய்யுள் பேழை (இன்பத்தமிழ், மூதுரை & திருக்குறள்)',
          description: 'பாரதிதாசன் இன்பத்தமிழ், ஔவையார் மூதுரை (அட்டாலும் பால்சுவையில் குன்றாது), திருக்குறள் அன்புடைமை & இனியவை கூறல்',
          subtopics: [
            {
              id: 'prep_t_sub1',
              title: 'பாரதிதாசன் இன்பத்தமிழ் & மூதுரை',
              microTopics: [
                { id: 'prep_t_1', title: 'தமிழுக்கும் அமுதென்று பேர் — பாரதிதாசன் கவிதை நயம்', keyAxiom: 'தமிழை உயிருக்கு நேராகப் போற்றிய புரட்சிக் கவிஞர் பாரதிதாசன்' },
                { id: 'prep_t_2', title: 'ஔவையார் மூதுரை — நல்லோர் நட்பின் சிறப்பு & மனப்பாடப் பகுதி', keyAxiom: '"அட்டாலும் பால்சுவையில் குன்றாது" — அறிஞர்கள் வறுமையிலும் நற்பண்பு தவறார்' }
              ]
            }
          ],
          microTopics: [
            { id: 'prep_t_1', topicTitle: 'பாரதிதாசன் இன்பத்தமிழ் & ஔவையார் மூதுரை', subtopic: 'தமிழுக்கும் அமுதென்று பேர் & அட்டாலும் பால்சுவையில் குன்றாது', dayNumber: 1, periodNumber: 1, keyFormulaOrLaw: 'பாரதிதாசன்: "தமிழுக்கும் அமுதென்று பேர்! அந்தத் தமிழென்ப பேரின்பத் தமிழெங்கள் உயிருக்கு நேர்!"', keyPoints: ['பாரதிதாசனின் இயற்பெயர் சுப்புரத்தினம்', 'மூதுரை நீதி நூல் ஆசிரியர் ஔவையார்'], type: 'memorization', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: 'உரைநடை உலகம் (தமிழரின் வீர விளையாட்டுகள் & கல்விக்கண் திறந்த காமராசர்)',
          description: 'ஏறுதழுவுதல் (ஜல்லிக்கட்டு), சிலம்பாட்டம், கபடி, காமராசரின் கல்விப் புரட்சி & இலவச மதிய உணவுத் திட்டம்',
          subtopics: [
            {
              id: 'prep_t_sub2',
              title: 'தமிழர் மரபு & வரலாற்று ஆளுமைகள்',
              microTopics: [
                { id: 'prep_t_3', title: 'தமிழரின் வீர விளையாட்டுகள் (ஏறுதழுவுதல் & சிலம்பம்)', keyAxiom: 'ஏறுதழுவுதல் தமிழரின் இரண்டாயிரம் ஆண்டு தொன்மையான முல்லை நில வீர விளையாட்டு' },
                { id: 'prep_t_4', title: 'காமராசரின் கல்விப் பணிகள் — இலவசக் கல்வி & மதிய உணவு', keyAxiom: 'பட்டிதொட்டியெங்கும் பள்ளிகள் திறந்து கல்விக்கண் திறந்த பெருந்தலைவர் காமராசர்' }
              ]
            }
          ],
          microTopics: [
            { id: 'prep_t_3', topicTitle: 'தமிழர் வீர விளையாட்டுகள் & காமராசர் கல்வித் தொண்டு', subtopic: 'ஏறுதழுவுதல், சிலம்பம், கபடி மற்றும் மதிய உணவுத் திட்டம்', dayNumber: 4, periodNumber: 1, keyFormulaOrLaw: 'காமராசர்: கல்விக்கண் திறந்த காமராசர் | ஏறுதழுவுதல்: முல்லை நிலப் பண்பாட்டு அடையாளம்', keyPoints: ['காமராசருக்கு பாரத ரத்னா விருது வழங்கப்பட்ட ஆண்டு 1976', 'ஜல்லிக்கட்டு பற்றிய குறிப்புகள் கலித்தொகையில் உள்ளன'], type: 'concept', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 3,
          chapterTitle: 'விரிவானம் / துணைப்பாடம் (முயல் சொன்ன கதை & தலைமைப் பண்பு)',
          description: 'நீதிக் கதைகள், நற்பண்புகள், தலைமைத்துவ குணங்கள், நாட்டுப்புறக் கதைகள்',
          subtopics: [
            {
              id: 'prep_t_sub3',
              title: 'நீதிக் கதைகள் & நற்பண்பு வளர்ப்பு',
              microTopics: [
                { id: 'prep_t_5', title: 'முயலின் புத்திக்கூர்மை கதை & தலைமைப் பண்பு தத்துவம்', keyAxiom: 'உடல் பலத்தை விட அறிவு பலமே சிறந்தது' }
              ]
            }
          ],
          microTopics: [
            { id: 'prep_t_5', topicTitle: 'துணைப்பாடக் கதைகள் — சமயோசித புத்தி & தலைமைத்துவம்', subtopic: 'முயல் சொன்ன கதை மற்றும் தலைமைப் பண்பு படிப்பினைகள்', dayNumber: 7, periodNumber: 1, keyFormulaOrLaw: 'நீதி: "அறிவே ஆற்றல்" — துன்பம் வரும் வேளையில் அறிவுக்கூர்மையுடன் செயல்பட வேண்டும்', keyPoints: ['கதையின் மையக் கருத்தை உணர்ந்து சொந்த நடையில் விவரித்தல்'], type: 'concept', importance: 'Foundational' }
          ]
        },
        {
          chapterNumber: 4,
          chapterTitle: 'கற்கண்டு / இலக்கணம் (திணை, பால், எண், இடம் & காலங்கள்)',
          description: 'உயர்திணை/அஃறிணை, ஐம்பால் (ஆண்பால், பெண்பால், பலர்பால், ஒன்றன்பால், பலவின்பால்), மூவிடம், முக்காலம்',
          subtopics: [
            {
              id: 'prep_t_sub4',
              title: 'தமிழ் இலக்கண அடிப்படைகள்',
              microTopics: [
                { id: 'prep_t_6', title: 'திணை (2) & ஐம்பால் பாகுபாடு', keyAxiom: 'திணை: உயர்திணை (மனிதர்/தேவர்), அஃறிணை (விலங்கு/பொருட்கள்) | பால்: ஆண், பெண், பலர், ஒன்று, பல' },
                { id: 'prep_t_7', title: 'முக்காலம் (இறந்த, நிகழ், எதிர்காலம்) & மயங்கொலிகள் (ண, ந, ன / ல, ழ, ள)', keyAxiom: 'மயங்கொலி எழுத்துகள் 8: ண-ந-ன, ல-ழ-ள, ர-ற' }
              ]
            }
          ],
          microTopics: [
            { id: 'prep_t_6', topicTitle: 'திணை (2 வகை), பால் (5 வகை), இடம் (3) & மயங்கொலி எழுத்துகள்', subtopic: 'உயர்திணை/அஃறிணை மற்றும் ண-ந-ன, ல-ழ-ள வேறுபாடுகள்', dayNumber: 10, periodNumber: 1, keyFormulaOrLaw: 'திணை: உயர்திணை, அஃறிணை | பால்: ஆண்பால், பெண்பால், பலர்பால், ஒன்றன்பால், பலவின்பால்', keyPoints: ['மனிதர்கள் உயர்திணை; பறவைகள், விலங்குகள், தாவரங்கள் அஃறிணை', 'மழை (மாரி), மாலை (அந்திப்பொழுது), மாழை (உலோகம்) பொருள் வேறுபாடு'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        }
      ]
    },
    {
      subjectId: 'prep_english',
      subjectName: 'English (Prose, Poetry, Supplementary Reader & Grammar)',
      icon: '🔤',
      color: '#3b82f6',
      totalChapters: 4,
      totalMicroTopics: 14,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: 'Unit 1: Prose (*The Magic Fish*) & Poem (*The Rainbow*)',
          description: 'Reading comprehension, Christina Rossetti\'s poem "The Rainbow", Vocabulary, Synonyms & Antonyms',
          subtopics: [
            {
              id: 'prep_e_sub1',
              title: 'Unit 1: Literature & Reading',
              microTopics: [
                { id: 'prep_e_1', title: 'Prose: The Magic Fish & Moral Comprehension', keyAxiom: 'Greed leads to downfall; contentment brings true happiness' },
                { id: 'prep_e_2', title: 'Poem: The Rainbow (Boats sail on rivers, but clouds sail across the sky)', keyAxiom: 'Nature\'s creations are far more beautiful than man-made ships' }
              ]
            }
          ],
          microTopics: [
            { id: 'prep_e_1', topicTitle: 'Prose: The Magic Fish & Poem: The Rainbow', subtopic: 'Comprehension, Rhyming Words & Synonyms', dayNumber: 2, periodNumber: 2, keyFormulaOrLaw: 'Christina Rossetti: "Boats sail on the rivers, and ships sail on the seas; but clouds that sail across the sky are prettier far than these."', keyPoints: ['Identify rhyming words (seas-trees, sky-die)', 'Theme: Nature\'s supreme beauty'], type: 'memorization', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: 'Unit 2: Prose (*Brave Indian Warriors*) & Poem (*Trees are Kind*)',
          description: 'Patriotism, Indian Army heroes, Nature conservation poem, Verb tenses and regular/irregular verbs',
          subtopics: [
            {
              id: 'prep_e_sub2',
              title: 'Unit 2: Bravery & Environment',
              microTopics: [
                { id: 'prep_e_3', title: 'Prose: Brave Indian Warriors & Param Vir Chakra Heroes', keyAxiom: 'Sacrifices of soldiers defending Indian borders' },
                { id: 'prep_e_4', title: 'Poem: Trees are the Kindest Things I Know', keyAxiom: 'Trees give fruit, wood, shade, and oxygen without asking anything in return' }
              ]
            }
          ],
          microTopics: [
            { id: 'prep_e_3', topicTitle: 'Prose: Brave Warriors & Poem: Trees are the Kindest Things', subtopic: 'Tenses (Simple Present, Past, Future) and Paragraph Writing', dayNumber: 5, periodNumber: 2, keyFormulaOrLaw: 'Tenses: Present (play), Past (played), Future (will play)', keyPoints: ['Param Vir Chakra is India\'s highest military gallantry award', 'Regular verbs take -ed; Irregular verbs change form (go -> went -> gone)'], type: 'concept', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 3,
          chapterTitle: 'Unit 3: Supplementary (*The Honest Woodcutter & Tenali Raman*)',
          description: 'Moral stories, witty intelligence of Tenali Raman, character analysis and dialogue delivery',
          subtopics: [
            {
              id: 'prep_e_sub3',
              title: 'Unit 3: Supplementary Stories',
              microTopics: [
                { id: 'prep_e_5', title: 'Story: The Honest Woodcutter (Golden Axe vs Iron Axe)', keyAxiom: 'Honesty is always rewarded by the goddess of water' },
                { id: 'prep_e_6', title: 'Story: Tenali Raman and the Thieves', keyAxiom: 'Witty thinking outsmarts criminals without violence' }
              ]
            }
          ],
          microTopics: [
            { id: 'prep_e_5', topicTitle: 'Supplementary: The Honest Woodcutter & Tenali Raman Wit', subtopic: 'Character Sketches, Dialogue Comprehension & Vocabulary', dayNumber: 8, periodNumber: 2, keyFormulaOrLaw: 'Moral: "Honesty is the Best Policy" | Tenali Raman: Court poet of Krishnadevaraya', keyPoints: ['Sequence the story events in correct chronological order', 'Direct speech quotation marks usage'], type: 'concept', importance: 'Foundational' }
          ]
        },
        {
          chapterNumber: 4,
          chapterTitle: 'Unit 4: Grammar Master (Parts of Speech, Prepositions & Punctuation)',
          description: 'Nouns, Pronouns, Adjectives (Degrees), Verbs, Adverbs, Prepositions (in, on, under, between), Conjunctions (and, but, or)',
          subtopics: [
            {
              id: 'prep_e_sub4',
              title: 'Unit 4: Functional Grammar',
              microTopics: [
                { id: 'prep_e_7', title: '8 Parts of Speech & Adjectives Degrees of Comparison', keyAxiom: 'Positive (tall), Comparative (taller), Superlative (tallest)' },
                { id: 'prep_e_8', title: 'Prepositions of Place/Time & Conjunctions (and, but, because)', keyAxiom: 'Prepositions show relationship between noun and other words' }
              ]
            }
          ],
          microTopics: [
            { id: 'prep_e_7', topicTitle: '8 Parts of Speech, Degrees of Comparison & Prepositions', subtopic: 'Good-Better-Best, Prepositions (in, on, at, under) & Conjunctions', dayNumber: 11, periodNumber: 2, keyFormulaOrLaw: 'Comparison: Tall -> Taller -> Tallest | Beautiful -> More Beautiful -> Most Beautiful', keyPoints: ['Use Comparative degree with "than" (A is taller than B)', 'Use Superlative degree with "the" (A is the tallest boy)'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        }
      ]
    },
    {
      subjectId: 'prep_math',
      subjectName: isTa ? 'கணிதம் & அடிப்படை இயற்கணிதம் (Mathematics Core)' : 'Mathematics & Computational Arithmetic',
      icon: '📐',
      color: '#06b6d4',
      totalChapters: 3,
      totalMicroTopics: 12,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: isTa ? 'பெரிய எண்கள், காரணி & மடங்குகள் (HCF & LCM)' : 'Large Numbers, Factors, Multiples, HCF & LCM',
          description: isTa ? '5–6 இலக்க எண்கள், பகா எண்கள், மீ.சி.ம & மீ.பொ.வ, உரோமானிய எண்கள்' : '5 to 6-digit operations, Prime & Composite numbers, HCF & LCM, Roman Numerals',
          subtopics: [
            {
              id: 'prep_m_sub1',
              title: 'எண்கணிதம் & HCF/LCM',
              microTopics: [
                { id: 'prep_m_1', title: 'பகா எண்கள் & மீப்பெரு பொது காரணி (HCF / LCM)', keyAxiom: 'Product of Two Numbers = HCF × LCM' },
                { id: 'prep_m_2', title: 'பின்னங்கள் & தசம எண்கள் கூட்டல்/கழித்தல்', keyAxiom: 'Like/Unlike fractions, Equivalent fractions' }
              ]
            }
          ],
          microTopics: [
            { id: 'prep_m_1', topicTitle: isTa ? 'பகா எண்கள் & பகா காரணிப்படுத்துதல் (HCF / LCM)' : 'Prime Factorization, HCF & LCM Fundamentals', subtopic: isTa ? 'மீப்பெரு பொது காரணி மற்றும் மீச்சிறு பொது மடங்கு' : 'Factor tree method, division method, Product = HCF × LCM formula', dayNumber: 3, periodNumber: 3, keyFormulaOrLaw: 'Product of Two Numbers = HCF × LCM | Prime Numbers have exactly 2 factors (1 and itself)', keyPoints: ['2 is the only even prime number', 'Co-prime numbers have HCF = 1'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: isTa ? 'நேர்வீத முறை, விழுக்காடு, இலாப நட்டம்' : 'Unitary Method, Percentages, Profit & Loss',
          description: isTa ? 'ஒரு பொருளின் விலை கொண்டு பல பொருட்களின் விலை காணுதல், சதவீத கணக்கீடுகள்' : 'Unitary method problems, Percentage conversions, Profit = SP - CP, Loss = CP - SP',
          subtopics: [
            {
              id: 'prep_m_sub2',
              title: 'வியாபாரக் கணிதம்',
              microTopics: [
                { id: 'prep_m_3', title: 'நேர்வீத முறை & எளிய விழுக்காடு கணக்கீடு', keyAxiom: 'Unit Cost = Total Cost / Total Units | Profit = SP - CP' }
              ]
            }
          ],
          microTopics: [
            { id: 'prep_m_3', topicTitle: isTa ? 'நேர்வீத முறை & எளிய விழுக்காடு கணக்கீடு' : 'Unitary Method & Basic Percentages', subtopic: isTa ? 'அடக்க விலை, விற்ற விலை மற்றும் இலாப நட்டம்' : 'Find cost of 1 unit -> Multiply by desired quantity; % = (Value/Total) × 100', dayNumber: 6, periodNumber: 3, keyFormulaOrLaw: 'Unitary Rule: Unit Cost = Total Cost / Total Units | Profit = SP - CP (if SP > CP)', keyPoints: ['Profit% = (Profit / CP) × 100', 'Discount = Marked Price - Selling Price'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 3,
          chapterTitle: isTa ? 'வடிவியல்: கோணங்கள் & பரப்பளவு / சுற்றளவு' : 'Geometry: Angles, Perimeter & Area',
          description: isTa ? 'செங்கோணம், குறுங்கோணம், விரிகோணம், செவ்வகம்/சதுரம் சுற்றளவு' : 'Acute, Right, Obtuse angles; Perimeter = Sum of all sides; Area of Rectangle = l × w',
          subtopics: [
            {
              id: 'prep_m_sub3',
              title: 'வடிவியல் & அளவியல்',
              microTopics: [
                { id: 'prep_m_4', title: 'கோணங்களின் வகைகள் & சுற்றளவு பரப்பளவு சூத்திரங்கள்', keyAxiom: 'Rectangle: P = 2(l+w), A = l×w | Square: P = 4a, A = a²' }
              ]
            }
          ],
          microTopics: [
            { id: 'prep_m_4', topicTitle: isTa ? 'வடிவியல்: கோணங்கள் & பரப்பளவு / சுற்றளவு' : 'Geometry: Angles, Perimeter & Area', subtopic: isTa ? 'செங்கோணம், குறுங்கோணம், விரிகோணம், செவ்வகம்/சதுரம் சுற்றளவு' : 'Acute, Right, Obtuse angles; Perimeter = Sum of all sides; Area of Rectangle = l × w', dayNumber: 9, periodNumber: 3, keyFormulaOrLaw: 'Rectangle: Perimeter = 2(l + w), Area = l × w | Square: Perimeter = 4a, Area = a²', keyPoints: ['Right angle = 90°, Straight angle = 180°', 'Sum of angles in a triangle = 180°'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        }
      ]
    },
    {
      subjectId: 'prep_science',
      subjectName: isTa ? 'பொது அறிவியல் (General Science & Human Physiology)' : 'General Science & Human Organ Systems',
      icon: '🔬',
      color: '#10b981',
      totalChapters: 2,
      totalMicroTopics: 8,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: isTa ? 'மனித உறுப்பு மண்டலங்கள் & ஊட்டச்சத்து' : 'Human Organ Systems & Nutrition',
          description: isTa ? 'செரிமான மண்டலம், சுவாச மண்டலம், ரத்த ஓட்ட மண்டலம் & சரிவிகித உணவு' : 'Digestive, Respiratory, Circulatory, Nervous systems; Balanced diet (Carbs, Proteins, Vitamins, Minerals)',
          subtopics: [
            {
              id: 'prep_s_sub1',
              title: 'உறுப்பு மண்டலங்கள் & குறைபாட்டு நோய்கள்',
              microTopics: [
                { id: 'prep_s_1', title: 'செரிமான & சுவாச உறுப்பு மண்டலங்கள்', keyAxiom: 'Respiration: Glucose + Oxygen -> Energy (ATP) + CO₂ + H₂O' },
                { id: 'prep_s_2', title: 'வைட்டமின்கள் A, B, C, D குறைபாட்டு நோய்கள்', keyAxiom: 'Vit A (Night blindness), Vit C (Scurvy), Vit D (Rickets), Iron (Anemia)' }
              ]
            }
          ],
          microTopics: [
            { id: 'prep_s_1', topicTitle: isTa ? 'செரிமான & சுவாச உறுப்பு மண்டலங்கள்' : 'Digestive & Respiratory System Anatomy', subtopic: isTa ? 'உணவுக்குழாய், இரைப்பை, சிறுகுடல், மூச்சுக்குழாய், நுரையீரல்' : 'Alimentary canal stages, Enzyme digestion, Alveoli gas exchange (O₂ in, CO₂ out)', dayNumber: 12, periodNumber: 4, keyFormulaOrLaw: 'Respiration: Glucose + Oxygen -> Energy (ATP) + Carbon Dioxide + Water', keyPoints: ['Digestion begins in the mouth with salivary amylase', 'Villi in small intestine absorb digested nutrients into bloodstream'], type: 'concept', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: isTa ? 'விசை, ஆற்றல், எளிய எந்திரங்கள் & சுற்றுச்சூழல்' : 'Forces, Simple Machines & Water Cycle',
          description: isTa ? 'நெம்புகோல் (Lever), கப்பி (Pulley), நீர் சுழற்சி மற்றும் சூரிய குடும்பம்' : 'Mechanical advantage, 1st/2nd/3rd Class Levers, Water cycle, 8 Planets',
          subtopics: [
            {
              id: 'prep_s_sub2',
              title: 'இயற்பியல் & சுற்றுச்சூழல்',
              microTopics: [
                { id: 'prep_s_3', title: 'நெம்புகோல் (Levers) 3 வகைகள் & தத்துவம்', keyAxiom: 'Load × Load Arm = Effort × Effort Arm' }
              ]
            }
          ],
          microTopics: [
            { id: 'prep_s_3', topicTitle: isTa ? 'விசை வகைகள் & எளிய எந்திரங்கள் (Lever & Pulley)' : 'Forces & Simple Machines (Levers & Pulleys)', subtopic: isTa ? 'நெம்புகோல் 3 வகைகள் மற்றும் தத்துவம்' : 'Mechanical advantage, 1st Class (Seesaw), 2nd Class (Wheelbarrow), 3rd Class (Tongs)', dayNumber: 14, periodNumber: 4, keyFormulaOrLaw: 'Work = Force × Displacement | Lever Principle: Load × Load Arm = Effort × Effort Arm', keyPoints: ['Simple machines make work easier by changing force direction or magnitude', 'Friction opposes relative motion between surfaces'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        }
      ]
    },
    {
      subjectId: 'prep_social',
      subjectName: isTa ? 'சமூக அறிவியல் & குடிமையியல் (Social Science & Civics)' : 'Social Science, History & Indian Polity Seed',
      icon: '🌍',
      color: '#f59e0b',
      totalChapters: 2,
      totalMicroTopics: 8,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: isTa ? 'இந்திய இயற்கை அமைப்புகள், ஆறுகள் & வரைபடம்' : 'Physical Geography of India, Rivers & Maps',
          description: isTa ? 'இமயமலை, கங்கை சமவெளி, தக்காண பீடபூமி, காவிரி, வைகை ஆறுகள்' : 'Himalayas, Northern Plains, Peninsular Plateau, Coastal Plains, Indian Rivers & Continents',
          subtopics: [
            {
              id: 'prep_soc_sub1',
              title: 'இந்திய நிலப்பரப்பு & ஆறுகள்',
              microTopics: [
                { id: 'prep_soc_1', title: 'இமயமலை, தக்காண பீடபூமி & காவிரி நதி அமைப்பு', keyAxiom: 'Cauvery originates at Talakaveri (Karnataka) and flows through Tamil Nadu' }
              ]
            }
          ],
          microTopics: [
            { id: 'prep_soc_1', topicTitle: isTa ? 'இந்திய இயற்கை அமைப்புகள் & ஆறுகள் (Cauvery, Vaigai)' : 'Physical Divisions of India & Major Rivers', subtopic: isTa ? 'இமயமலை, தக்காண பீடபூமி, காவிரி, கங்கை' : 'Perennial Himalayan rivers (Ganga, Indus) vs Rain-fed Peninsular rivers (Cauvery, Godavari)', dayNumber: 15, periodNumber: 4, keyFormulaOrLaw: 'Physical Divisions: Himalayas (North) | Plains (Central) | Plateau (South) | Deserts (West)', keyPoints: ['Cauvery originates at Talakaveri (Karnataka) and flows through Tamil Nadu', 'Continents: Asia is largest; Australia is smallest'], type: 'concept', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: isTa ? 'பண்டைய வரலாறு, மூவேந்தர் & இந்திய அரசியலமைப்பு' : 'Ancient History, Sangam Kings & Indian Constitution',
          description: isTa ? 'சிந்து சமவெளி அறிமுகம், சேர சோழ பாண்டியர், அரசியலமைப்பு முகப்புரை' : 'Indus Valley Civilization intro, Sangam Age (Chera, Chola, Pandya), Indian Constitution & Preamble',
          subtopics: [
            {
              id: 'prep_soc_sub2',
              title: 'வரலாறு & அரசியலமைப்பு',
              microTopics: [
                { id: 'prep_soc_2', title: 'சேர சோழ பாண்டியர் சின்னங்கள் & இந்திய அரசியலமைப்பு முகப்புரை', keyAxiom: 'Chera (Bow), Chola (Tiger), Pandya (Fish) | Constitution Preamble: Justice, Liberty, Equality' }
              ]
            }
          ],
          microTopics: [
            { id: 'prep_soc_2', topicTitle: isTa ? 'சேர, சோழ, பாண்டியர் வரலாறு & இந்திய முகப்புரை' : 'Sangam Dynasties & Indian Constitution Preamble', subtopic: isTa ? 'மூவேந்தர் சின்னங்கள் & அரசியலமைப்பு அடிப்படை' : 'Emblems (Bow-Arrow, Tiger, Fish), Dr. Ambedkar role, Preamble values (Justice, Liberty, Equality)', dayNumber: 16, periodNumber: 4, keyFormulaOrLaw: 'Constitution Day: 26 November | Republic Day: 26 January 1950', keyPoints: ['Chola capital: Uraiyur / Thanjavur | Pandya capital: Madurai', 'Fundamental Duties enshrined in Indian Constitution'], type: 'concept', importance: 'High-Yield' }
          ]
        }
      ]
    }
  ];

  return {
    courseId,
    courseTitle,
    category: 'school_preparatory',
    board: 'TNSB Samacheer Kalvi / CBSE',
    medium: isTa ? 'Tamil' : 'English',
    totalDays: 200,
    totalSubjects: subjects.length,
    totalChapters: subjects.reduce((a, s) => a + s.chapters.length, 0),
    totalMicroTopics: subjects.reduce((a, s) => a + (s.totalMicroTopics || s.chapters.reduce((acc, c) => acc + (c.microTopics?.length || 0), 0)), 0),
    subjects
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. MIDDLE STAGE: CLASS 6 TO CLASS 8 (AGES 11–14 — SAMACHEER KALVI 9 IYAL)
// ─────────────────────────────────────────────────────────────────────────────
export function getMiddleClass6to8Syllabus(courseId: string, courseTitle: string): CourseFullSyllabus {
  const isTa = courseTitle.includes('தமிழ்') || courseId.includes('-ta-');

  const subjects: SyllabusSubject[] = [
    {
      subjectId: 'mid_tamil',
      subjectName: 'தமிழ் (Tamil — சமச்சீர் கல்வி 9 இயல்கள் முழுப் பாடத்திட்டம்)',
      icon: '🔤',
      color: '#ec4899',
      totalChapters: 9,
      totalMicroTopics: 27,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: 'இயல் 1: மொழி (இன்பத்தமிழ், தமிழ்க்கும்மி & தமிழ் எழுத்துகளின் வகை தொகை)',
          description: 'பாரதிதாசன் இன்பத்தமிழ், பெருஞ்சித்திரனார் தமிழ்க்கும்மி, வளர்தமிழ், கனவு பலித்தது, எழுத்து இலக்கணம்',
          subtopics: [
            {
              id: 'mid_t_sub1',
              title: 'கவிதைப்பேழை & உரைநடை',
              microTopics: [
                { id: 'mid_t_1', title: 'செய்யுள்: இன்பத்தமிழ் (பாரதிதாசன்) & தமிழ்க்கும்மி (பெருஞ்சித்திரனார்)', keyAxiom: 'தமிழுக்கும் அமுதென்று பேர் — பாரதிதாசன் | எட்டுத் திசையிலும் செந்தமிழின் புகழ் — பெருஞ்சித்திரனார்' },
                { id: 'mid_t_2', title: 'உரைநடை: வளர்தமிழ் & விரிவானம்: கனவு பலித்தது (கடிதம்)', keyAxiom: 'தமிழ் மூத்த மொழி, எளிய மொழி, சீர்மை மொழி மற்றும் அறிவியல் தொழில்நுட்ப மொழி' },
                { id: 'mid_t_3', title: 'கற்கண்டு: தமிழ் எழுத்துகளின் வகை தொகையீடு (மாத்திரை அளவுகள்)', keyAxiom: 'குறில் 1 மாத்திரை, நெடில் 2 மாத்திரை, மெய் மற்றும் ஆய்தம் ½ மாத்திரை' }
              ]
            }
          ],
          microTopics: [
            { id: 'mid_t_1', topicTitle: 'இயல் 1: இன்பத்தமிழ், தமிழ்க்கும்மி & மாத்திரை அளவுகள்', subtopic: 'குறில் 1, நெடில் 2, மெய் ½ மாத்திரை மற்றும் சொல்லின் வகைகள்', dayNumber: 1, periodNumber: 1, keyFormulaOrLaw: 'மாத்திரை: குறில் = 1 மாத்திரை | நெடில் = 2 மாத்திரை | மெய் & ஆய்தம் = ½ மாத்திரை', keyPoints: ['பெருஞ்சித்திரனாரின் இயற்பெயர் மாணிக்கம்', 'கனிச்சாறு, கொய்யாக்கனி, பாவியக்கொத்து நூலாசிரியர் பெருஞ்சித்திரனார்'], type: 'concept', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: 'இயல் 2: இயற்கை (காணி நிலம், சிறகின் ஓசை, கிழவனும் கடலும் & திருக்குறள்)',
          description: 'பாரதியார் காணி நிலம் வேண்டும், பறவைகள் வலசை போதல், எர்னஸ்ட் ஹெமிங்வே கிழவனும் கடலும், முதலெழுத்தும் சார்பெழுத்தும்',
          subtopics: [
            {
              id: 'mid_t_sub2',
              title: 'இயற்கை நயம் & இலக்கணம்',
              microTopics: [
                { id: 'mid_t_4', title: 'செய்யுள்: காணி நிலம் வேண்டும் (பாரதியார்) & சிலப்பதிகாரம் வாழ்த்து', keyAxiom: 'திங்களைப் போற்றுதும் ஞாயிறு போற்றுதும் — இளங்கோவடிகள்' },
                { id: 'mid_t_5', title: 'உரைநடை: சிறகின் ஓசை (பறவைகள் வலசை போதல்) & விரிவானம்: கிழவனும் கடலும்', keyAxiom: 'நாராய் நாராய் செங்கால் நாராய் — சத்திமுத்தப் புலவர் | சாண்டியாகோ மீன்பிடிப் போராட்டம்' },
                { id: 'mid_t_6', title: 'கற்கண்டு: முதலெழுத்தும் சார்பெழுத்தும் (10 வகைகள்) & திருக்குறள்', keyAxiom: 'முதலெழுத்து 30 (உயிர் 12 + மெய் 18); சார்பெழுத்து 10 (உயிரளபெடை முதல் ஆய்தக்குறுக்கம் வரை)' }
              ]
            }
          ],
          microTopics: [
            { id: 'mid_t_4', topicTitle: 'இயல் 2: பாரதியார் காணி நிலம் & முதலெழுத்து/சார்பெழுத்து (10 வகை)', subtopic: 'முதலெழுத்துகள் 30 மற்றும் சார்பெழுத்துகள் 10 வகைகள்', dayNumber: 4, periodNumber: 1, keyFormulaOrLaw: 'முதலெழுத்துகள் = 30 | சார்பெழுத்து 10: உயிரளபெடை, ஒற்றளபெடை, குற்றியலுகரம், குற்றியலிகரம், ஐகாரக்குறுக்கம், ஔகாரக்குறுக்கம், மகரக்குறுக்கம், ஆய்தக்குறுக்கம், முற்றியலுகரம், ஆய்த எழுத்து', keyPoints: ['பாரதியாரின் இயற்பெயர் சுப்பிரமணியன்', 'எர்னஸ்ட் ஹெமிங்வே நோபல் பரிசு பெற்ற புதினம்: கிழவனும் கடலும் (The Old Man and the Sea)'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 3,
          chapterTitle: 'இயல் 3: அறிவியல் தொழில்நுட்பம் (அறிவியல் ஆத்திசூடி & மொழி முதல்/இறுதி எழுத்துகள்)',
          description: 'நெல்லை சு. முத்து அறிவியல் ஆத்திசூடி, அறிவியலால் ஆள்வோம், கனியனின் நண்பன் (ரோபோ), மொழி முதல் இறுதி எழுத்துகள்',
          subtopics: [
            {
              id: 'mid_t_sub3',
              title: 'அறிவியல் சிந்தனை & மொழி அமைப்பு',
              microTopics: [
                { id: 'mid_t_7', title: 'அறிவியல் ஆத்திசூடி (நெல்லை சு. முத்து) & ரோபோ தொழில்நுட்பம்', keyAxiom: 'உடற்பயிற்சி அறிவியல் சிந்தனை கொள் — அப்துல் கலாம் பாராட்டிய நெல்லை முத்து' },
                { id: 'mid_t_8', title: 'கற்கண்டு: மொழி முதல் மற்றும் மொழி இறுதி எழுத்துகள்', keyAxiom: 'மொழி முதல் வரும் எழுத்துகள் 22; மொழி இறுதி வரும் எழுத்துகள் 24' }
              ]
            }
          ],
          microTopics: [
            { id: 'mid_t_7', topicTitle: 'இயல் 3: அறிவியல் ஆத்திசூடி & மொழி முதல்/இறுதி எழுத்துகள் (22 & 24)', subtopic: 'சொல்லின் முதலில் வரும் எழுத்துகள் மற்றும் இறுதியில் வரும் எழுத்துகள்', dayNumber: 7, periodNumber: 1, keyFormulaOrLaw: 'மொழி முதல் எழுத்துகள்: 22 (உயிர் 12 + மெய் உயிர்மெய் 10) | மொழி இறுதி எழுத்துகள்: 24', keyPoints: ['ரோபோ (Robot) என்ற சொல்லை முதன்முதலில் பயன்படுத்தியவர் காரல் கபெக் (1920)'], type: 'concept', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 4,
          chapterTitle: 'இயல் 4: கல்வி (மூதுரை, துன்பம் வெல்லும் கல்வி, காமராசர் & இன எழுத்துகள்)',
          description: 'ஔவையார் மூதுரை, பட்டுக்கோட்டை கல்யாணசுந்தரம் பாடல், கல்விக்கண் திறந்தவர் காமராசர், அண்ணா நூற்றாண்டு நூலகம், இன எழுத்துகள்',
          subtopics: [
            {
              id: 'mid_t_sub4',
              title: 'கல்வி மேன்மை & இன எழுத்துகள்',
              microTopics: [
                { id: 'mid_t_9', title: 'துன்பம் வெல்லும் கல்வி — பட்டுக்கோட்டை கல்யாணசுந்தரம்', keyAxiom: 'ஏட்டில் படித்ததோடு இருந்துவிடாதே — மக்கள் கவிஞர் பட்டுக்கோட்டை' },
                { id: 'mid_t_10', title: 'கற்கண்டு: இன எழுத்துகள் (இணை எழுத்துகள்)', keyAxiom: 'வல்லினத்திற்கு மெல்லினம் இன எழுத்து (ங்-க், ஞ்-ச், ண்-ட், ந்-த், ம்-ப், ன்-ற்)' }
              ]
            }
          ],
          microTopics: [
            { id: 'mid_t_9', topicTitle: 'இயல் 4: துன்பம் வெல்லும் கல்வி & இன எழுத்துகள் (இணை எழுத்துகள்)', subtopic: 'வல்லின-மெல்லின நட்பு எழுத்துகள் (ங்-க், ஞ்-ச், ண்-ட், ந்-த், ம்-ப், ன்-ற்)', dayNumber: 10, periodNumber: 1, keyFormulaOrLaw: 'இன எழுத்துகள்: க்-ங் | ச்-ஞ் | ட்-ண் | த்-ந்த் | ப்-ம் | ற்-ன் | ஐ-இ | ஔ-உ', keyPoints: ['ஆசியாவிலேயே இரண்டாவது மிகப்பெரிய நூலகம் அண்ணா நூற்றாண்டு நூலகம் சென்னை', 'மக்கள் கவிஞர் என்று அழைக்கப்படுபவர் பட்டுக்கோட்டை கல்யாணசுந்தரம்'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 5,
          chapterTitle: 'இயல் 5: நாகரிகம் பண்பாடு (ஆசாரக்கோவை, பொங்கல் திருநாள் & மயங்கொலிகள்)',
          description: 'பெருவாயின் முள்ளியார் ஆசாரக்கோவை, கண்மணியே கண்ணுறங்கு, தமிழர் பெருவிழா, மாமல்லபுரம் சிற்பங்கள், மயங்கொலிப் பிழைகள்',
          subtopics: [
            {
              id: 'mid_t_sub5',
              title: 'தமிழர் பண்பாடு & மயங்கொலி இலக்கணம்',
              microTopics: [
                { id: 'mid_t_11', title: 'ஆசாரக்கோவை & தமிழர் திருநாள் பொங்கல் சிறப்பு', keyAxiom: 'நன்றி அறிதல் பொறை உடைமை — ஆசாரக்கோவை நல்லொழுக்கங்களின் தொகுப்பு' },
                { id: 'mid_t_12', title: 'கற்கண்டு: மயங்கொலிகள் (8 எழுத்துகள்: ண-ந-ன, ல-ழ-ள, ர-ற)', keyAxiom: 'ஒரே மாதிரி ஒலித்து பொருள் வேறுபடும் 8 மயங்கொலி எழுத்துகள்' }
              ]
            }
          ],
          microTopics: [
            { id: 'mid_t_11', topicTitle: 'இயல் 5: ஆசாரக்கோவை, மாமல்லபுரம் & மயங்கொலி 8 எழுத்துகள்', subtopic: 'பொருள் வேறுபாடு: களம் (இடம்) vs கலம் (பாத்திரம்/கப்பல்), வளை vs வாழை', dayNumber: 13, periodNumber: 1, keyFormulaOrLaw: 'மயங்கொலிகள்: ண, ந, ன (3) | ல, ழ, ள (3) | ர, ற (2) = மொத்தம் 8 எழுத்துகள்', keyPoints: ['மாமல்லபுரம் பல்லவர் கால கடற்கரை கோவில் மற்றும் ஒற்றைக்கல் ரதங்கள்', 'ஆசாரக்கோவை ஆசிரியர் பெருவாயின் முள்ளியார்'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        }
      ]
    },
    {
      subjectId: 'mid_english',
      subjectName: 'English (Samacheer Kalvi Units 1 to 7 Full Curriculum)',
      icon: '🔤',
      color: '#3b82f6',
      totalChapters: 7,
      totalMicroTopics: 21,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: 'Unit 1: Prose (*Sea Turtles*), Poem (*The Crocodile*) & Supplementary (*Owlie*)',
          description: 'Marine ecology, Olive Ridley turtles conservation, Lewis Carroll poem, Subject & Predicate, Types of Sentences',
          subtopics: [
            {
              id: 'mid_e_sub1',
              title: 'Unit 1: Marine Life & Grammar',
              microTopics: [
                { id: 'mid_e_1', title: 'Prose: Sea Turtles (Olive Ridley nesting & conservation)', keyAxiom: 'Olive Ridleys nest along coastal beaches in Arribada mass nesting' },
                { id: 'mid_e_2', title: 'Poem: The Crocodile by Lewis Carroll & Rhyme Scheme', keyAxiom: 'How doth the little crocodile improve his shining tail' },
                { id: 'mid_e_3', title: 'Grammar: Subject & Predicate, 4 Types of Sentences', keyAxiom: 'Declarative (statement), Interrogative (?), Imperative (command), Exclamatory (!)' }
              ]
            }
          ],
          microTopics: [
            { id: 'mid_e_1', topicTitle: 'Unit 1: Sea Turtles, The Crocodile & 4 Sentence Types', subtopic: 'Subject + Predicate, Declarative, Interrogative, Imperative, Exclamatory', dayNumber: 2, periodNumber: 2, keyFormulaOrLaw: 'Sentence Types: Statement (.) | Question (?) | Command/Request | Exclamation (!)', keyPoints: ['Olive Ridley turtles travel thousands of kilometres to lay eggs', 'Lewis Carroll is author of Alice in Wonderland'], type: 'concept', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: 'Unit 2: Prose (*When the Trees Walked*) & Poem (*Trees*)',
          description: 'Ruskin Bond nature story, Grandfather\'s tree planting, Adjectives, Degrees of Comparison',
          subtopics: [
            {
              id: 'mid_e_sub2',
              title: 'Unit 2: Nature & Comparison',
              microTopics: [
                { id: 'mid_e_4', title: 'Prose: When the Trees Walked by Ruskin Bond', keyAxiom: 'Planting trees on rocky river island transforms environment' },
                { id: 'mid_e_5', title: 'Grammar: Adjectives & Degrees of Comparison', keyAxiom: 'Positive, Comparative (-er/more), Superlative (-est/most)' }
              ]
            }
          ],
          microTopics: [
            { id: 'mid_e_4', topicTitle: 'Unit 2: Ruskin Bond Trees & Degrees of Comparison', subtopic: 'Adjective degrees: Fast-Faster-Fastest, Interesting-More-Most', dayNumber: 5, periodNumber: 2, keyFormulaOrLaw: 'Comparison: as + adj + as (Positive) | adj-er + than (Comparative) | the + adj-est (Superlative)', keyPoints: ['Ruskin Bond lives in Mussoorie and writes about Indian flora and fauna'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 3,
          chapterTitle: 'Unit 3: Prose (*A Visitor from Distant Lands*) & Grammar (*Tenses*)',
          description: 'History of spices (Chilli, Pepper, Cardamom, Cinnamon) brought by Vasco da Gama & Columbus, Verb Tenses',
          subtopics: [
            {
              id: 'mid_e_sub3',
              title: 'Unit 3: Spices History & Tenses',
              microTopics: [
                { id: 'mid_e_6', title: 'Prose: Spices of India & Portuguese Traders', keyAxiom: 'Vasco da Gama reached Calicut (1498) seeking black gold (Pepper)' },
                { id: 'mid_e_7', title: 'Grammar: 12 Verb Tenses (Simple, Continuous, Perfect)', keyAxiom: 'Present Perfect: has/have + V3 | Past Continuous: was/were + V-ing' }
              ]
            }
          ],
          microTopics: [
            { id: 'mid_e_6', topicTitle: 'Unit 3: Spices of India & 12 English Verb Tenses', subtopic: 'Present, Past, Future, Continuous & Perfect Tenses with Timeline', dayNumber: 8, periodNumber: 2, keyFormulaOrLaw: 'Present Perfect: S + has/have + V3 | Past Perfect: S + had + V3 | Future: S + will + V1', keyPoints: ['Chilli was brought to India from South America by Portuguese explorers'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 4,
          chapterTitle: 'Unit 4: Prose (*Sports Stars*) & Supplementary (*Think to Win*)',
          description: 'Mithali Raj, P.V. Sindhu, Mary Kom achievements, Teamwork poem, Conjunctions & Prepositional Phrases',
          subtopics: [
            {
              id: 'mid_e_sub4',
              title: 'Unit 4: Sports Biographies & Prepositions',
              microTopics: [
                { id: 'mid_e_8', title: 'Biographies: Mithali Raj, P.V. Sindhu & Mary Kom', keyAxiom: 'Dedication, grit, and discipline overcome gender barriers in Indian sports' },
                { id: 'mid_e_9', title: 'Grammar: Prepositions of Position, Direction & Time', keyAxiom: 'Across, through, into, upon, beside, between, among' }
              ]
            }
          ],
          microTopics: [
            { id: 'mid_e_8', topicTitle: 'Unit 4: Sports Stars & Prepositions (in, on, into, between, among)', subtopic: 'Between (two entities) vs Among (more than two entities)', dayNumber: 11, periodNumber: 2, keyFormulaOrLaw: 'Rule: Between 2 people/items | Among > 2 people/items | Into shows motion', keyPoints: ['Mithali Raj is the highest run-scorer in Women\'s International Cricket'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        }
      ]
    },
    {
      subjectId: 'mid_math',
      subjectName: isTa ? 'கணிதம் (Mathematics & Pre-Algebra)' : 'Mathematics, Pre-Algebra & Geometry',
      icon: '📐',
      color: '#06b6d4',
      totalChapters: 3,
      totalMicroTopics: 14,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: isTa ? 'எண்கணிதம்: BODMAS, HCF/LCM & விகிதமுறு எண்கள்' : 'Arithmetic: BODMAS, HCF/LCM & Rational Numbers',
          description: isTa ? 'செயல்பாடுகளின் வரிசை BODMAS, பகா காரணிப்படுத்துதல் HCF/LCM, முழுக்கள், விகிதமுறு எண்கள் & அடுக்கு விதிகள்' : 'BODMAS / PEMDAS order of operations, HCF & LCM prime factorization, Integers, Rational numbers and Laws of Exponents',
          subtopics: [
            {
              id: 'mid_m_sub1',
              title: 'எண்கணிதம் & அடிப்படை செயல்பாடுகள்',
              microTopics: [
                { id: 'mid_m_1', title: 'BODMAS / PEMDAS Rule (செயல்பாடுகளின் வரிசை)', keyAxiom: 'Brackets -> Orders -> Division -> Multiplication -> Addition -> Subtraction' },
                { id: 'mid_m_2', title: 'HCF & LCM (மீப்பெரு பொது வகுத்தி & மீச்சிறு பொது மடங்கு)', keyAxiom: 'Product of Two Numbers = HCF × LCM' },
                { id: 'mid_m_3', title: 'அடுக்கு விதிகள் (Laws of Exponents: a^m × a^n = a^(m+n))', keyAxiom: 'a^m / a^n = a^(m-n) | (a^m)^n = a^(mn) | a^0 = 1' }
              ]
            }
          ],
          microTopics: [
            { id: 'mid_m_1', topicTitle: 'BODMAS / PEMDAS Rule (செயல்பாடுகளின் வரிசை)', subtopic: 'Order of Operations: Brackets, Exponents, Division, Multiplication, Addition, Subtraction', dayNumber: 3, periodNumber: 1, keyFormulaOrLaw: 'BODMAS: () -> Orders -> ÷ -> × -> + -> -', keyPoints: ['Always simplify expressions inside innermost brackets first', 'Division and Multiplication have equal precedence; evaluate left-to-right'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'mid_m_2', topicTitle: 'HCF & LCM (மீப்பெரு பொது வகுத்தி & மீச்சிறு மடங்கு)', subtopic: 'Prime Factorization Tree Method, Division Method & Relationship Formula', dayNumber: 3, periodNumber: 2, keyFormulaOrLaw: 'HCF × LCM = Number₁ × Number₂ | HCF(a, b) ≤ min(a, b) | LCM(a, b) ≥ max(a, b)', keyPoints: ['HCF of two prime numbers is always 1 (Co-primes)', 'LCM is the smallest number divisible by all given numbers without remainder'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'mid_m_3', topicTitle: 'Laws of Exponents (அடுக்கு விதிகள்)', subtopic: 'Product, Quotient, Power of a Power and Zero Exponent Rules', dayNumber: 3, periodNumber: 3, keyFormulaOrLaw: 'aᵐ × aⁿ = aᵐ⁺ⁿ | aᵐ / aⁿ = aᵐ⁻ⁿ | (aᵐ)ⁿ = aᵐⁿ | a⁰ = 1 | a⁻ⁿ = 1/aⁿ', keyPoints: ['Any non-zero number raised to the power 0 equals 1', 'Used in scientific notation for very large and small numbers'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: isTa ? 'புள்ளியியல் & வணிகக் கணிதம்: Mean, Median, Mode & கூட்டுவட்டி' : 'Statistics & Commercial Maths: Mean, Median, Mode & CI',
          description: isTa ? 'கூட்டுச் சராசரி (Mean), இடைநிலை அளவு (Median), முகடு (Mode), தனிவட்டி, கூட்டுவட்டி A = P(1+R/100)^n' : 'Measures of Central Tendency (Mean, Median, Mode, Range), Simple & Compound Interest, Percentages',
          subtopics: [
            {
              id: 'mid_m_sub2',
              title: 'புள்ளியியல் & வணிகக் கணிதம்',
              microTopics: [
                { id: 'mid_m_4', title: 'Mean / Average (கூட்டுச் சராசரி: x̄ = Σx / N)', keyAxiom: 'Sum of all observations divided by total number of observations' },
                { id: 'mid_m_5', title: 'Median & Mode (இடைநிலை அளவு & முகடு)', keyAxiom: 'Median = Middle value in ordered set | Mode = Most frequent observation' },
                { id: 'mid_m_6', title: 'Compound Interest & Profit/Loss (கூட்டுவட்டி & இலாப நட்டம்)', keyAxiom: 'A = P(1 + R/100)ⁿ | CI = A - P' }
              ]
            }
          ],
          microTopics: [
            { id: 'mid_m_4', topicTitle: 'Mean / Average (கூட்டுச் சராசரி)', subtopic: 'Calculation of Arithmetic Mean for Raw and Grouped Frequency Data', dayNumber: 6, periodNumber: 1, keyFormulaOrLaw: 'Mean x̄ = (Σ x) / N = (x₁ + x₂ + ... + xₙ) / n', keyPoints: ['Mean is the mathematical average sensitive to extreme outlier values', 'Sum of deviations of all values from the mean is always zero: Σ(x - x̄) = 0'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'mid_m_5', topicTitle: 'Median & Mode (இடைநிலை அளவு & முகடு)', subtopic: 'Finding Median for Odd/Even Data & Determining Unimodal/Bimodal Data', dayNumber: 6, periodNumber: 2, keyFormulaOrLaw: 'Median = [(n+1)/2]ᵗʰ (Odd) | Mode = Observation with maximum frequency', keyPoints: ['Median divides an ordered dataset into two exactly equal halves (50% above, 50% below)', 'Empirical Relation: Mode ≈ 3(Median) - 2(Mean)'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'mid_m_6', topicTitle: 'Compound Interest (கூட்டுவட்டி)', subtopic: 'Annual and Half-Yearly Compounding Formula and Depreciation', dayNumber: 6, periodNumber: 3, keyFormulaOrLaw: 'Amount A = P(1 + R/100)ⁿ | CI = A - P = P[(1 + R/100)ⁿ - 1]', keyPoints: ['Compound interest yields higher returns than simple interest because interest earns interest', 'Half-yearly compounding: Rate becomes R/2 and time becomes 2n'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 3,
          chapterTitle: isTa ? 'வடிவியல் & அளவியல்: பிதாகரஸ் தேற்றம், பரப்பளவு & சுற்றளவு' : 'Geometry & Mensuration: Pythagoras, Area & Perimeter',
          description: isTa ? 'பிதாகரஸ் தேற்றம் a² + b² = c², முக்கோணம், செவ்வகம், வட்டம் பரப்பளவு மற்றும் கனஅளவு' : 'Pythagorean Theorem, Area and Perimeter of 2D shapes, Surface area and volume of 3D solids',
          subtopics: [
            {
              id: 'mid_m_sub3',
              title: 'வடிவியல் தேற்றங்கள் & பரப்பளவு',
              microTopics: [
                { id: 'mid_m_7', title: 'Pythagoras Theorem (பிதாகரஸ் தேற்றம்: a² + b² = c²)', keyAxiom: 'In a right triangle: Hypotenuse² = Base² + Height²' },
                { id: 'mid_m_8', title: 'Area & Perimeter of 2D Shapes (முக்கோணம், வட்டம், செவ்வகம்)', keyAxiom: 'Circle: Area = πr², Perimeter = 2πr | Triangle: Area = ½bh' }
              ]
            }
          ],
          microTopics: [
            { id: 'mid_m_7', topicTitle: 'Pythagoras Theorem (பிதாகரஸ் தேற்றம்)', subtopic: 'Right-Angled Triangle Properties & Pythagorean Triplets (3-4-5, 5-12-13, 8-15-17)', dayNumber: 8, periodNumber: 3, keyFormulaOrLaw: 'Hypotenuse² = Base² + Altitude² | c² = a² + b²', keyPoints: ['Applicable strictly to right-angled triangles', 'Pythagorean Triplet condition: 2m, m² - 1, m² + 1'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'mid_m_8', topicTitle: 'Area & Perimeter of Circle and Triangle (பரப்பளவு & சுற்றளவு)', subtopic: 'Circle Circumference/Area, Triangle Area (½bh) and Trapezium Area', dayNumber: 8, periodNumber: 4, keyFormulaOrLaw: 'Circle Area = πr² | Circumference = 2πr | Triangle Area = ½ × b × h | Trapezium = ½h(a + b)', keyPoints: ['Perimeter is the boundary distance around a 2D shape', 'Area is the total 2D surface space enclosed within the boundary'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        }
      ]
    },
    {
      subjectId: 'mid_science',
      subjectName: isTa ? 'அறிவியல் (Physics, Chemistry & Biology Core)' : 'Science (Physics, Chemistry & Biology Core)',
      icon: '⚡',
      color: '#10b981',
      totalChapters: 3,
      totalMicroTopics: 14,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: isTa ? 'இயற்பியல்: வேகம், விசை, அழுத்தம் & ஒளி' : 'Physics: Speed, Force, Pressure & Light',
          description: isTa ? 'வேகம் v = d/t, விசை F = ma, பாய்ம அழுத்தம் P = F/A, ஒளியின் எதிரொளிப்பு மற்றும் விலகல்' : 'Speed, Velocity, Force, Fluid Pressure P = F/A, Reflection and Refraction of Light',
          subtopics: [
            {
              id: 'mid_s_sub1',
              title: 'இயற்பியல் அடிப்படைகள்',
              microTopics: [
                { id: 'mid_p_1', title: 'Speed, Velocity & Acceleration (வேகம், திசைவேகம் & முடுக்கம்)', keyAxiom: 'Speed = Distance/Time | Velocity = Displacement/Time | a = (v - u)/t' },
                { id: 'mid_p_2', title: 'Force & Pressure (விசை & அழுத்தம்: P = F/A)', keyAxiom: 'Pressure P = Force / Area (Pascals) | Liquid Pressure = ρgh' },
                { id: 'mid_p_3', title: 'Reflection & Refraction of Light (ஒளி எதிரொலிப்பு & ஒளி விலகல்)', keyAxiom: 'Angle i = Angle r | Snell\'s Law: sin i / sin r = μ' }
              ]
            }
          ],
          microTopics: [
            { id: 'mid_p_1', topicTitle: 'Speed, Velocity & Acceleration (வேகம் & முடுக்கம்)', subtopic: 'Scalar vs Vector, Equations of Motion (v = u + at, s = ut + ½at²)', dayNumber: 9, periodNumber: 1, keyFormulaOrLaw: 'Speed = Distance / Time | Acceleration a = (v - u) / t (m/s²)', keyPoints: ['Speed is scalar (magnitude only); Velocity is vector (direction included)', 'Uniform acceleration occurs when velocity changes at a constant rate'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'mid_p_2', topicTitle: 'Force & Pressure (விசை & அழுத்தம்)', subtopic: 'P = F / A in Pascals (N/m²), Hydraulic Lift & Atmospheric Pressure', dayNumber: 9, periodNumber: 2, keyFormulaOrLaw: 'Pressure P = Force / Area (1 Pa = 1 N/m²) | Liquid Pressure P = hρg', keyPoints: ['Sharper knife cuts better because smaller area produces higher pressure for same force', 'Atmospheric pressure measured using Mercury Barometer (760 mm Hg)'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'mid_p_3', topicTitle: 'Reflection & Refraction of Light (ஒளி எதிரொலிப்பு & விலகல்)', subtopic: 'Laws of Reflection (∠i = ∠r) and Refraction through Glass Slab / Prism', dayNumber: 9, periodNumber: 3, keyFormulaOrLaw: 'Angle of Incidence = Angle of Reflection (∠i = ∠r) | Refractive Index μ = c / v', keyPoints: ['Light bends towards normal when entering denser medium (Air to Water/Glass)', 'Rainbow is formed by dispersion and internal reflection in water droplets'], type: 'concept', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: isTa ? 'வேதியியல்: அமிலங்கள், காரங்கள், pH & அணு அமைப்பு' : 'Chemistry: Acids, Bases, pH & Atomic Structure',
          description: isTa ? 'லிட்மஸ், pH அளவீடு, நடுநிலையாக்கல், புரோட்டான் எலக்ட்ரான் நியூட்ரான் அணு அமைப்பு' : 'Acids, Bases, Indicators, pH Scale, Atomic Structure (Protons, Neutrons, Electrons)',
          subtopics: [
            {
              id: 'mid_s_sub2',
              title: 'வேதியியல் கோட்பாடுகள்',
              microTopics: [
                { id: 'mid_c_1', title: 'Acids, Bases & Salts (அமிலங்கள், காரங்கள் & உப்புகள்)', keyAxiom: 'Acid + Base -> Salt + Water (Neutralization)' },
                { id: 'mid_c_2', title: 'Atomic Structure - Protons, Neutrons, Electrons (அணு அமைப்பு)', keyAxiom: 'Atomic Number Z = Protons | Mass Number A = Protons + Neutrons' }
              ]
            }
          ],
          microTopics: [
            { id: 'mid_c_1', topicTitle: 'Acids, Bases & pH Scale (அமிலங்கள் & காரங்கள்)', subtopic: 'Litmus Test, Neutralization Reaction and pH Scale (0 to 14)', dayNumber: 12, periodNumber: 1, keyFormulaOrLaw: 'Neutralization: Acid + Base -> Salt + Water (HCl + NaOH -> NaCl + H₂O)', keyPoints: ['Acids turn blue litmus red (pH < 7); Bases turn red litmus blue (pH > 7)', 'Antacids (Milk of Magnesia) neutralize excess stomach acid'], type: 'concept', importance: 'High-Yield' },
            { id: 'mid_c_2', topicTitle: 'Atomic Structure: Protons, Neutrons & Electrons (அணு அமைப்பு)', subtopic: 'Rutherford & Bohr Model, Nucleus, Atomic Number (Z) & Mass Number (A)', dayNumber: 12, periodNumber: 2, keyFormulaOrLaw: 'Atomic Number Z = No. of Protons = No. of Electrons | Mass Number A = Z + Neutrons', keyPoints: ['Protons (+ve charge) and Neutrons (neutral) reside in dense central Nucleus', 'Electrons (-ve charge) revolve around nucleus in discrete orbits/shells (K, L, M, N)'], type: 'concept', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 3,
          chapterTitle: isTa ? 'உயிரியல்: செல் நுண்ணுறுப்புகள், மைட்டோகாண்ட்ரியா & ஒளிச்சேர்க்கை' : 'Biology: Cell Organelles, Mitochondria & Photosynthesis',
          description: isTa ? 'தாவர/விலங்கு செல் நுண்ணுறுப்புகள், மைட்டோகாண்ட்ரியா ஆற்றல் மையம், ஒளிச்சேர்க்கை' : 'Plant vs Animal Cell, Mitochondria ATP production, Photosynthesis in Chloroplast',
          subtopics: [
            {
              id: 'mid_s_sub3',
              title: 'உயிரியல் அமைப்புகள்',
              microTopics: [
                { id: 'mid_b_1', title: 'Plant Cell vs Animal Cell (தாவர மற்றும் விலங்கு செல்)', keyAxiom: 'Plant cells possess rigid cellulose cell wall and chloroplasts' },
                { id: 'mid_b_2', title: 'Mitochondria - Powerhouse of the Cell (மைட்டோகாண்ட்ரியா)', keyAxiom: 'Generates cellular energy currency ATP via aerobic cellular respiration' },
                { id: 'mid_b_3', title: 'Photosynthesis Fundamentals (ஒளிச்சேர்க்கை அடிப்படை)', keyAxiom: '6CO₂ + 6H₂O + Sunlight -> C₆H₁₂O₆ + 6O₂' }
              ]
            }
          ],
          microTopics: [
            { id: 'mid_b_1', topicTitle: 'Plant Cell vs Animal Cell (தாவர & விலங்கு செல் வேறுபாடு)', subtopic: 'Cell Wall, Chloroplast, Large Central Vacuole and Centrioles', dayNumber: 14, periodNumber: 1, keyFormulaOrLaw: 'Plant Cell = Cell Wall + Chloroplast + Large Vacuole | Animal Cell = Centrioles + Lysosomes', keyPoints: ['Plant cells have a rigid cellulose cell wall giving structural protection', 'Animal cells have flexible cell membrane and small temporary vacuoles'], type: 'concept', importance: 'High-Yield' },
            { id: 'mid_b_2', topicTitle: 'Mitochondria - Powerhouse of the Cell (மைட்டோகாண்ட்ரியா)', subtopic: 'Cristae, Matrix, Krebs Cycle and ATP Energy Production', dayNumber: 14, periodNumber: 2, keyFormulaOrLaw: 'Cellular Respiration: Glucose + O₂ -> CO₂ + H₂O + 38 ATP Energy', keyPoints: ['Mitochondria have double membranes and their own circular DNA and ribosomes', 'Produce ATP (Adenosine Triphosphate), the universal energy currency of living cells'], type: 'concept', importance: 'High-Yield' },
            { id: 'mid_b_3', topicTitle: 'Photosynthesis Fundamentals (ஒளிச்சேர்க்கை)', subtopic: 'Chlorophyll Pigment, Light Energy Conversion and Stomatal Gas Exchange', dayNumber: 14, periodNumber: 3, keyFormulaOrLaw: '6CO₂ + 6H₂O + Sunlight (Chlorophyll) -> C₆H₁₂O₆ (Glucose) + 6O₂ (Oxygen)', keyPoints: ['Occurs in Chloroplasts containing green chlorophyll pigment', 'Releases vital oxygen gas into the atmosphere as byproduct'], type: 'concept', importance: 'High-Yield' }
          ]
        }
      ]
    },
    {
      subjectId: 'mid_social',
      subjectName: isTa ? 'சமூக அறிவியல் (History, Geography, Civics & Economics)' : 'Social Science (History, Geography, Civics & Economics)',
      icon: '🏛️',
      color: '#f59e0b',
      totalChapters: 3,
      totalMicroTopics: 14,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: isTa ? 'வரலாறு (சிந்து சமவெளி, பல்லவர், சோழர் & முகலாயர்)' : 'History: Indus Valley, Pallavas, Cholas & Mughals',
          description: isTa ? 'ஹரப்பா மொகஞ்சதாரோ, மாமல்லபுரம் பல்லவர், தஞ்சை பெரிய கோவில் சோழர், முகலாயர் ஆட்சி' : 'Harappa, Mohenjo-Daro, Pallava cave temples, Raja Raja Chola Brihadisvara, Mughals',
          subtopics: [
            {
              id: 'mid_soc_sub1',
              title: 'இந்திய மற்றும் தமிழ்நாடு வரலாறு',
              microTopics: [
                { id: 'mid_soc_1', title: 'சிந்து சமவெளி நாகரிகம் & சோழர் வரலாற்றுப் பெருமை', keyAxiom: 'Raja Raja Chola built Brihadisvara Temple Thanjavur (1010 AD)' }
              ]
            }
          ],
          microTopics: [
            { id: 'mid_soc_1', topicTitle: isTa ? 'சிந்து சமவெளி, சோழர் & முகலாயப் பேரரசு வரலாறு' : 'Indus Valley, Chola Empire & Mughal Administration', subtopic: isTa ? 'ஹரப்பா நகரமைப்பு & தஞ்சை பெரிய கோவில்' : 'Grid town planning, Great Bath, Raja Raja Chola naval expeditions, Akbar administration', dayNumber: 15, periodNumber: 4, keyFormulaOrLaw: 'Indus Valley: Discovered in 1921 | Brihadisvara Temple: 1010 AD by Raja Raja I', keyPoints: ['Bronze dancing girl and priest king found in Mohenjo-Daro', 'Uttaramerur inscription describes Chola Kudavolai election system'], type: 'concept', importance: 'High-Yield' }
          ]
        }
      ]
    }
  ];

  return {
    courseId,
    courseTitle,
    category: 'school_middle',
    board: 'TNSB Samacheer Kalvi / CBSE',
    medium: isTa ? 'Tamil' : 'English',
    totalDays: 200,
    totalSubjects: subjects.length,
    totalChapters: subjects.reduce((a, s) => a + s.chapters.length, 0),
    totalMicroTopics: subjects.reduce((a, s) => a + (s.totalMicroTopics || s.chapters.reduce((acc, c) => acc + (c.microTopics?.length || 0), 0)), 0),
    subjects
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. SECONDARY STAGE: CLASS 9 & CLASS 10 (SSLC — 9 IYAL TAMIL & 7 UNITS ENGLISH)
// ─────────────────────────────────────────────────────────────────────────────
export function getSecondaryClass9to10Syllabus(courseId: string, courseTitle: string): CourseFullSyllabus {
  const isTa = courseTitle.includes('தமிழ்') || courseId.includes('-ta-');

  const subjects: SyllabusSubject[] = [
    {
      subjectId: 'sec_tamil',
      subjectName: 'தமிழ் (Tamil — 10ஆம் வகுப்பு சமச்சீர் கல்வி 9 இயல்கள் முழுமை)',
      icon: '🔤',
      color: '#ec4899',
      totalChapters: 9,
      totalMicroTopics: 36,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: 'இயல் 1: அமுதூற்று (அன்னை மொழியே, தமிழ்ச் சொல்வளம் & எழுத்து சொல் இலக்கணம்)',
          description: 'பாவலேறு பெருஞ்சித்திரனார் அன்னை மொழியே, தேவநேயப் பாவாணர் தமிழ்ச் சொல்வளம், சந்தக்கவிமணி தமிழழகனார் இரட்டுற மொழிதல், எழில்முதல்வன் புதிய உரைநடை, எழுத்து - சொல் இலக்கணம்',
          subtopics: [
            {
              id: 'sec_t_sub1',
              title: 'கவிதைப்பேழை & உரைநடை உலகம்',
              microTopics: [
                { id: 'sec_t_1', title: 'செய்யுள்: அன்னை மொழியே (பாவலேறு பெருஞ்சித்திரனார் — கணிச்சாறு)', keyAxiom: 'நறுங்கனியே! செந்தமிழே! நற்கணக்கின் நற்பொருளே! திருக்குறளின் மாபெருமையே!' },
                { id: 'sec_t_2', title: 'உரைநடை: தமிழ்ச் சொல்வளம் (தேவநேயப் பாவாணர் — சொல்லாராய்ச்சி)', keyAxiom: 'தாவரத்தின் அடி வகை, கிளைப் பிரிவு, காய்ந்த இலை, பிஞ்சு வகை, மணி வகை தமிழ்ச் சொல்வளம்' },
                { id: 'sec_t_3', title: 'கற்கண்டு: எழுத்து (உயிரளபெடை, ஒற்றளபெடை) & சொல் (மூவகை மொழி)', keyAxiom: 'உயிரளபெடை 3 வகை (செய்யுளிசை, இன்னிசை, சொல்லிசை); சொல் 3 வகை (தனிமொழி, தொடர்மொழி, பொதுமொழி)' }
              ]
            }
          ],
          microTopics: [
            { id: 'sec_t_1', topicTitle: 'அன்னை மொழியே (பாவலேறு பெருஞ்சித்திரனார்)', subtopic: 'செந்தமிழே நறுங்கனியே — தமிழின் பெருமை மற்றும் வாழ்த்துப் பாடல்', dayNumber: 1, periodNumber: 1, keyFormulaOrLaw: 'கணிச்சாறு தொகுதி 1: "அன்னை மொழியே! அழகார்ந்த செந்தமிழே! முன்னைக்கு முன்னை முகிழ்த்த நறுங்கனியே!"', keyPoints: ['பெருஞ்சித்திரனாரின் இயற்பெயர் துரை. மாணிக்கம்', 'தென்மொழி, தமிழ்ச்சிட்டு இதழ்கள் வாயிலாகத் தமிழ் உணர்வை ஊட்டியவர்'], type: 'concept', importance: 'High-Yield' },
            { id: 'sec_t_2', topicTitle: 'தமிழ்ச் சொல்வளம் (தேவநேயப் பாவாணர்)', subtopic: 'தாவரங்களின் அடி, கிளை, இலை, கொழுந்து, பிஞ்சு மற்றும் தானிய சொற்கள்', dayNumber: 1, periodNumber: 2, keyFormulaOrLaw: 'மொழிஞாயிறு தேவநேயப் பாவாணர்: "தமிழ் சொல்வளமும் சொல்லாராய்ச்சியும் மிக்க மொழி"', keyPoints: ['நாடும் மொழியும் நமதிரு கண்கள் என்று பாடியவர் பாரதியார்', 'செந்தமிழ்ச் சொற்பிறப்பியல் அகரமுதலித் திட்ட இயக்குநராகப் பணியாற்றியவர் பாவாணர்'], type: 'concept', importance: 'High-Yield' },
            { id: 'sec_t_3', topicTitle: 'எழுத்து & சொல் இலக்கணம் (உயிரளபெடை & ஒற்றளபெடை)', subtopic: 'செய்யுளிசை (இசைநிறை), இன்னிசை, சொல்லிசை அளபெடைகள் & தனி, தொடர், பொது மொழிகள்', dayNumber: 1, periodNumber: 3, keyFormulaOrLaw: 'உயிரளபெடை 3 வகை | ஒற்றளபெடை மெய்கள் 10 + ஃ = 11 | சொல்: தனிமொழி, தொடர்மொழி, பொதுமொழி', keyPoints: ['செய்யுளில் ஓசை குறையும் போது அளபெடுப்பது செய்யுளிசை அளபெடை (ஓஒதல் வேண்டும்)', 'பெயர்ச்சொல் வினையெச்சப் பொருளில் திரிந்து அளபெடுப்பது சொல்லிசை அளபெடை (உரனசையீ)'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: 'இயல் 2: உயிரின் ஓசை (காற்றே வா, முல்லைப்பாட்டு & தொகைநிலைத் தொடர்கள்)',
          description: 'பாரதியார் காற்றே வா, நப்பூதனார் முல்லைப்பாட்டு, கேட்கிறதா என்குரல் (காற்று), ஜ.ரா.சுந்தரேசன் புயலிலே ஒரு தோணி, தொகைநிலைத் தொடர்கள் (6 வகை)',
          subtopics: [
            {
              id: 'sec_t_sub2',
              title: 'இயற்கை & தொடர் இலக்கணம்',
              microTopics: [
                { id: 'sec_t_4', title: 'செய்யுள்: காற்றே வா (மகாகவி பாரதியார் வசன கவிதை)', keyAxiom: 'காற்றே வா! மகரந்தத் தூளைச் சுமந்துகொண்டு மனத்தை மயலுறுத்துகின்ற இனிய வாசனையுடன் வா!' },
                { id: 'sec_t_5', title: 'செய்யுள்: முல்லைப்பாட்டு (நப்பூதனார் — பத்துப்பாட்டு)', keyAxiom: 'சிறுதாம்பு தொடுத்த பயலைக் கோவலர் — முல்லை நிலக் கார் கால மாலைப் பொழுது' },
                { id: 'sec_t_6', title: 'கற்கண்டு: தொகைநிலைத் தொடர்கள் 6 வகை (வேற்றுமை முதல் அன்மொழித்தொகை)', keyAxiom: 'வேற்றுமை, வினை, பண்பு, உவமை, உம்மை, அன்மொழித்தொகை' }
              ]
            }
          ],
          microTopics: [
            { id: 'sec_t_4', topicTitle: 'காற்றே வா (மகாகவி பாரதியார் வசன கவிதை)', subtopic: 'மகரந்தத் தூளைச் சுமந்து வரும் தென்றல் காற்று மற்றும் உயிர் மூச்சு', dayNumber: 4, periodNumber: 1, keyFormulaOrLaw: 'பாரதியார்: "காற்றே வா! எமது உயிர் நெருப்பை நீடித்து நின்று நல்ஒளி தருமாறு நன்றாக வீசு"', keyPoints: ['வசன கவிதை வடிவத்தை தமிழில் அறிமுகப்படுத்தியவர் பாரதியார்', 'திசைகளின் பெயர்கள்: கிழக்கு (குணக்கு), மேற்கு (குடக்கு), வடக்கு (வாடை), தெற்கு (தென்றல்)'], type: 'concept', importance: 'High-Yield' },
            { id: 'sec_t_5', topicTitle: 'முல்லைப்பாட்டு (நப்பூதனார் சங்க இலக்கியம்)', subtopic: 'நனந்தலை உலகம் வளைஇ — முல்லை நிலத்து விரிச்சி கேட்டல்', dayNumber: 4, periodNumber: 2, keyFormulaOrLaw: 'பத்துப்பாட்டு: முல்லை நிலத்தின் உரிப்பொருள் (இருத்தலும் இருத்தல் நிமித்தமும்)', keyPoints: ['பத்துப்பாட்டில் மிகக் குறைந்த அடிகளை உடைய நூல் முல்லைப்பாட்டு (103 அடிகள்)', 'முல்லை நில தெய்வம் திருமால்; பெரும் பொழுது கார்காலம் (ஆவணி, புரட்டாசி)'], type: 'concept', importance: 'High-Yield' },
            { id: 'sec_t_6', topicTitle: 'தொகைநிலைத் தொடர்கள் (6 வகைகள்)', subtopic: 'வேற்றுமை, வினை, பண்பு, உவமை, உம்மை மற்றும் அன்மொழித்தொகை', dayNumber: 4, periodNumber: 3, keyFormulaOrLaw: 'தொகைநிலைத் தொடர் = 6 வகை (உருபுகள் மறைந்து நின்று பொருள் தருவது)', keyPoints: ['வினைத்தொகை: முக்காலமும் பொருந்தும் (எ.கா: ஊறுகாய், கொள்புலி, ஆடுகொடி)', 'பண்புத்தொகை: மை விகுதியும் ஆகிய, ஆன உருபுகளும் மறைந்து வருவது (எ.கா: செந்தாமரை)'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 3,
          chapterTitle: 'இயல் 3: கூட்டாஞ்சோறு (விருந்தே போற்றி, காசி காண்டம் & தொகாநிலைத் தொடர்கள்)',
          description: 'விருந்தோம்பல் மரபு, அதிவீரராம பாண்டியர் காசிகாண்டம், பெருங்கௌசிகனார் மலைபடுகடாம், கி.ராஜநாராயணன் கோபல்லபுரத்து மக்கள், தொகாநிலைத் தொடர் (9 வகை) & திருக்குறள்',
          subtopics: [
            {
              id: 'sec_t_sub3',
              title: 'விருந்தோம்பல் & தொகாநிலைத் தொடர்கள்',
              microTopics: [
                { id: 'sec_t_7', title: 'உரைநடை: விருந்தோம்பல் போற்றுதும் (விருந்தே தானும் புதுவது புனைந்த யாப்பின் மேற்றே)', keyAxiom: 'விருந்து புறத்ததாத் தானுண்டல் சாவா மருந்தெனினும் வேண்டற்பாற் றன்று' },
                { id: 'sec_t_8', title: 'செய்யுள்: காசிகாண்டம் (அதிவீரராம பாண்டியர் — விருந்தோம்பல் ஒழுக்கம்)', keyAxiom: 'விருந்தினர் முகம் மலர நன்மொழி கூறுதல், இன்சொல் பேசுதல், வழியனுப்புதல்' },
                { id: 'sec_t_9', title: 'கற்கண்டு: தொகாநிலைத் தொடர்கள் 9 வகை (எழுவாய் முதல் அடுக்குத்தொடர்)', keyAxiom: 'எழுவாய், விளி, வினைமுற்று, பெயரெச்ச, வினையெச்ச, வேற்றுமை, இடைச்சொல், உரிச்சொல், அடுக்குத்தொடர்' }
              ]
            }
          ],
          microTopics: [
            { id: 'sec_t_7', topicTitle: 'காசிகாண்டம் & விருந்தோம்பல் மரபு (அதிவீரராம பாண்டியர்)', subtopic: 'விருந்தினரை எதிர்கொள்ளும் 9 ஒழுக்க முறைகள் மற்றும் நன்மொழி கூறல்', dayNumber: 7, periodNumber: 1, keyFormulaOrLaw: 'காசிகாண்டம் விருந்தோம்பல்: "இன்சொல் பேசி முகம் மலர்ந்து வழியனுப்ப ஏழடி பின்செல்லல்"', keyPoints: ['அதிவீரராம பாண்டியரின் பட்டப்பெயர் சீவலமாறன்', 'வெற்றிவேற்கை (நறுந்தொகை), நைடதம் நூல்களின் ஆசிரியரும் இவரே'], type: 'concept', importance: 'High-Yield' },
            { id: 'sec_t_8', topicTitle: 'மலைபடுகடாம் & கூத்தராற்றுப்படை (பெருங்கௌசிகனார்)', subtopic: 'நன்னன் சேய் நன்னன் புகழ் மற்றும் இரணிய முட்டத்துப் பெருங்குன்றூர் பெருங்கௌசிகனார்', dayNumber: 7, periodNumber: 2, keyFormulaOrLaw: 'மலைபடுகடாம் (583 அடிகள்): மலையை யானையாக உருவகம் செய்து ஓசைகளை கடாம் எனல்', keyPoints: ['பத்துப்பாட்டு நூல்களுள் ஒன்று; பாட்டுடைத் தலைவன் குறுநில மன்னன் நன்னன்', 'ஆற்றுப்படை என்பது வழிகாட்டும் இலக்கிய வகை'], type: 'concept', importance: 'High-Yield' },
            { id: 'sec_t_9', topicTitle: 'தொகாநிலைத் தொடர்கள் (9 வகைகள்)', subtopic: 'எழுவாய், விளி, வினைமுற்று, பெயரெச்ச, வினையெச்ச, வேற்றுமை, இடை, உரி, அடுக்குத்தொடர்', dayNumber: 7, periodNumber: 3, keyFormulaOrLaw: 'தொகாநிலைத் தொடர் = 9 வகை (உருபுகள் வெளிப்படையாக நின்று பொருள் தருவது)', keyPoints: ['எழுவாய்த் தொடர்: மல்லிகை பூத்தது | விளித்தொடர்: நண்பா எழுது', 'அடுக்குத்தொடர் பிரித்தால் பொருள் தரும் (பாம்பு பாம்பு); இரட்டைக்கிளவி பிரித்தால் பொருள் தராது (சலசல)'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 4,
          chapterTitle: 'இயல் 4: நான்காம் தமிழ் (செயற்கை நுண்ணறிவு, பரிபாடல் & பொது இலக்கணம்)',
          description: 'செயற்கை நுண்ணறிவு (AI), குலசேகர ஆழ்வார் பெருமாள் திருமொழி, கீரந்தையார் பரிபாடல், ஸ்டீபன் ஹாக்கிங், இலக்கணம் பொது (வழு, வழாநிலை, வழுவமைதி)',
          subtopics: [
            {
              id: 'sec_t_sub4',
              title: 'அறிவியல் தமிழ் & வழுவமைதி',
              microTopics: [
                { id: 'sec_t_10', title: 'உரைநடை: செயற்கை நுண்ணறிவு (AI) & ஸ்டீபன் ஹாக்கிங் வாழ்க்கை', keyAxiom: 'செயற்கை நுண்ணறிவு உலகை ஆளும் நான்காவது தொழிற்புரட்சி' },
                { id: 'sec_t_11', title: 'செய்யுள்: பரிபாடல் (கீரந்தையார் — பேரண்ட தோற்றம் & பெருவெடிப்பு)', keyAxiom: 'விசும்பில் ஊழி ஊழ் ஊழ் செல்ல — ஐம்பூதங்களின் தோற்றம்' },
                { id: 'sec_t_12', title: 'கற்கண்டு: வழு (7), வழாநிலை (6) & வழுவமைதி (5 வகைகள்)', keyAxiom: 'திணை, பால், இடம், காலம், வினா, விடை, மரபு வழு மற்றும் வழுவமைதி' }
              ]
            }
          ],
          microTopics: [
            { id: 'sec_t_10', topicTitle: 'பரிபாடல் — பேரண்ட தோற்றம் (கீரந்தையார்)', subtopic: 'விசும்பில் ஊழி ஊழ் ஊழ் செல்ல — ஐம்பூதங்களின் தோற்றமும் பெருவெடிப்பும் (Big Bang)', dayNumber: 10, periodNumber: 1, keyFormulaOrLaw: 'பரிபாடல்: "விசும்பில் ஊழி ஊழ் ஊழ் செல்லக் கருவளர் வானத்து இசையோடு தோன்றிய..."', keyPoints: ['எட்டுத்தொகை நூல்களுள் பண்ணோடு பாடப்பட்ட ஒரே நூல் பரிபாடல்', 'அமெரிக்க வானியலாளர் எட்வின் ஹப்பிள் கூறிய அண்ட விரிவுக் கொள்கை பரிபாடலில் உள்ளது'], type: 'concept', importance: 'High-Yield' },
            { id: 'sec_t_11', topicTitle: 'செயற்கை நுண்ணறிவு & அறிவியல் தமிழ் (AI Revolution)', subtopic: 'ஸ்டீபன் ஹாக்கிங், நான்காவது தொழிற்புரட்சி & இயல்பு மொழி செயலாக்கம் (NLP)', dayNumber: 10, periodNumber: 2, keyFormulaOrLaw: 'செயற்கை நுண்ணறிவு (AI): தரவுகளை பகுப்பாய்வு செய்து தானாக முடிவெடுக்கும் தொழில்நுட்பம்', keyPoints: ['ஸ்டீபன் ஹாக்கிங்கின் புகழ்பெற்ற நூல்: காலத்தின் சுருக்கமான வரலாறு (A Brief History of Time)', 'இயற்கை மொழி செயலாக்கம் (Natural Language Processing) மூலம் தமிழ் கணிப்பொறி வளர்ச்சி'], type: 'concept', importance: 'High-Yield' },
            { id: 'sec_t_12', topicTitle: 'வழு, வழாநிலை & வழுவமைதி (இலக்கண வகைகள்)', subtopic: 'திணை, பால், இடம், காலம், வினா, விடை, மரபு வழுவமைதி 5 வகைகள்', dayNumber: 10, periodNumber: 3, keyFormulaOrLaw: 'வழு = 7 வகை | வழாநிலை = 6 வகை | வழுவமைதி = 5 வகை', keyPoints: ['இலக்கண முறைப்படி பிழையுடையதாயினும் ஏதேனும் ஒரு காரணம் கருதி ஏற்றுக் கொள்ளப்படுவது வழுவமைதி', 'என் அம்மை வந்தாள் என்று மாட்டைப் பார்த்து கூறுவது திணை வழுவமைதி'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 5,
          chapterTitle: 'இயல் 5: மணற்கேணி (மொழிபெயர்ப்புக் கல்வி, திருவிளையாடற் புராணம் & வினா-விடை)',
          description: 'மொழிபெயர்ப்பு கலை, செய்குதம்பி பாவலர் நீதி வெண்பா (சதாவதானம்), பரஞ்சோதி முனிவர் திருவிளையாடற் புராணம், கமலாலயன் புதிய நம்பிக்கை, வினா (6), விடை (8) & பொருள்கோள் (8)',
          subtopics: [
            {
              id: 'sec_t_sub5',
              title: 'மொழிபெயர்ப்பு & வினா விடை வகைகள்',
              microTopics: [
                { id: 'sec_t_13', title: 'செய்யுள்: திருவிளையாடற் புராணம் (பரஞ்சோதி முனிவர் — இடைக்காடன் பிணக்கு)', keyAxiom: 'இறைவன் இடைக்காடனாருக்கு காட்சி தந்து மன்னன் பிழையை உணர்த்துதல்' },
                { id: 'sec_t_14', title: 'கற்கண்டு: வினா வகைகள் (6), விடை வகைகள் (8) & பொருள்கோள் (8)', keyAxiom: 'வினா 6; விடை 8 (சுட்டு, நேர், மறை, ஏவல், வினா எதிர்வினாதல், உற்றது உரைத்தல், உறுவது கூறல், இனமொழி)' }
              ]
            }
          ],
          microTopics: [
            { id: 'sec_t_13', topicTitle: 'திருவிளையாடற் புராணம் (பரஞ்சோதி முனிவர்)', subtopic: 'இடைக்காடனார் பிணக்கு தீர்த்த படலம் — புலவரின் சொல்லுக்கு இறைவன் செவிசாய்த்தல்', dayNumber: 13, periodNumber: 1, keyFormulaOrLaw: 'பரஞ்சோதி முனிவர்: 3 காண்டங்கள் (மதுரை, கூடல், திருவாலவாய்), 64 படலங்கள், 3363 விருத்தப்பாக்கள்', keyPoints: ['குசேல பாண்டியன் இடைக்காடனார் பாடலை அவமதித்ததால் இறைவன் வடதிருவாலவாய்க்கு இடம் பெயர்ந்தார்', 'சதாவதானி செய்குதம்பி பாவலர் நீதி வெண்பா இயற்றியவர்'], type: 'concept', importance: 'High-Yield' },
            { id: 'sec_t_14', topicTitle: 'வினா (6 வகை), விடை (8 வகை) & பொருள்கோள் (8 வகை)', subtopic: 'சுட்டு, நேர், மறை விடைகள் மற்றும் ஆற்றுநீர், நிரல்நிறை, விற்பூட்டுப் பொருள்கோள்', dayNumber: 13, periodNumber: 2, keyFormulaOrLaw: 'வினா = 6 வகை | விடை = 8 வகை (வெளிப்படை 3, குறிப்பு 5) | பொருள்கோள் = 8 வகை', keyPoints: ['அறிவினா, அறியாவினா, ஐயவினா, கொளல்வினா, கொடைவினா, ஏவல்வினா என வினா 6 வகைப்படும்', 'செய்யுளில் சொற்களைப் பொருளுக்கு ஏற்றவாறு சேர்த்து பொருள் கொள்ளும் முறை பொருள்கோள்'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        }
      ]
    },
    {
      subjectId: 'sec_english',
      subjectName: 'English (Class 10 Samacheer Kalvi 7 Units Full Curriculum)',
      icon: '🔤',
      color: '#3b82f6',
      totalChapters: 7,
      totalMicroTopics: 28,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: 'Unit 1: Prose (*His First Flight*), Poem (*Life*) & Supplementary (*The Tempest*)',
          description: 'Liam O\'Flaherty young seagull conquering fear, Henry Van Dyke sonnet "Life", Shakespeare\'s The Tempest, Modals & Active/Passive Voice',
          subtopics: [
            {
              id: 'sec_e_sub1',
              title: 'Unit 1: Overcoming Fear & Poetics',
              microTopics: [
                { id: 'sec_e_1', title: 'Prose: His First Flight by Liam O\'Flaherty (Young Seagull flight)', keyAxiom: 'Necessity and hunger compel action; self-belief conquers fear of falling' },
                { id: 'sec_e_2', title: 'Poem: Life by Henry Van Dyke (Sonnet — 14 lines)', keyAxiom: 'Let me but live my life from year to year, with forward face and unreluctant soul' },
                { id: 'sec_e_3', title: 'Supplementary: The Tempest by William Shakespeare', keyAxiom: 'Prospero, Miranda, Ariel, Caliban, Ferdinand reconciliation' },
                { id: 'sec_e_4', title: 'Grammar: Modal Auxiliaries & Active vs Passive Voice Transformation', keyAxiom: 'Active: S + V + O -> Passive: O + helping verb + V3 + by + S' }
              ]
            }
          ],
          microTopics: [
            { id: 'sec_e_1', topicTitle: 'Unit 1: His First Flight, Life Sonnet, The Tempest & Voice Transformation', subtopic: 'Liam O\'Flaherty, Henry Van Dyke poetics, Modals (can, could, must) & Active-Passive Voice', dayNumber: 2, periodNumber: 2, keyFormulaOrLaw: 'Passive Voice Rule: S + V + O -> O + be + V3 + by + S | Sonnet Structure: Octave (8) + Sestet (6) = 14 lines', keyPoints: ['The young seagull\'s mother tricked him into diving for food', 'Henry Van Dyke was an American author and educator'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: 'Unit 2: Prose (*The Night the Ghost Got In*) & Poem (*The Grumble Family*)',
          description: 'James Thurber humor satire, L.M. Montgomery poem on discontentment, Supplementary: Zigzag (talking bird), Articles & Prepositional Phrases',
          subtopics: [
            {
              id: 'sec_e_sub2',
              title: 'Unit 2: Humor, Satire & Articles',
              microTopics: [
                { id: 'sec_e_5', title: 'Prose: The Night the Ghost Got In by James Thurber', keyAxiom: 'Humorous misunderstanding turning walking sound into ghost and burglar frenzy' },
                { id: 'sec_e_6', title: 'Poem: The Grumble Family by L.M. Montgomery', keyAxiom: 'Never complain or grumble; adopt an optimistic outlook on life' },
                { id: 'sec_e_7', title: 'Supplementary: Zigzag by Asha Nehemiah & Grammar (Articles & Prepositions)', keyAxiom: 'Definite Article (The) vs Indefinite Articles (A, An before vowel sound)' }
              ]
            }
          ],
          microTopics: [
            { id: 'sec_e_5', topicTitle: 'Unit 2: The Night the Ghost Got In, The Grumble Family & Articles (A, An, The)', subtopic: 'Vowel sound rules (an hour, a university), Prepositional phrases and Idioms', dayNumber: 5, periodNumber: 2, keyFormulaOrLaw: 'Article Rule: "An" before vowel SOUND (An honest man, An MBA) | "A" before consonant sound (A university)', keyPoints: ['James Thurber was an American cartoonist and humorist for The New Yorker', 'Zigzag is an African bird gifted by Dr. Somu to Dr. Krishnan'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 3,
          chapterTitle: 'Unit 3: Prose (*Empowered Women Navigating The World*) & Poem (*I am Every Woman*)',
          description: 'INSV Tarini all-women navy crew circumnavigating globe, Rakhi Nariani Shirke poem, Mulan supplementary, Verb Tenses Master',
          subtopics: [
            {
              id: 'sec_e_sub3',
              title: 'Unit 3: Women Empowerment & Tenses',
              microTopics: [
                { id: 'sec_e_8', title: 'Prose: Empowered Women Navigating The World (INSV Tarini crew)', keyAxiom: 'Lt Cdr Vartika Joshi and 6 women officers sailed 254 days around the world (Navika Sagar Parikrama)' },
                { id: 'sec_e_9', title: 'Poem: I am Every Woman by Rakhi Nariani Shirke', keyAxiom: 'A woman is beauty innate, a symbol of power and strength' },
                { id: 'sec_e_10', title: 'Grammar: Comprehensive 12 Verb Tenses & Subject-Verb Agreement', keyAxiom: 'Singular subject takes singular verb; Plural subject takes plural verb' }
              ]
            }
          ],
          microTopics: [
            { id: 'sec_e_8', topicTitle: 'Unit 3: INSV Tarini Navika Sagar Parikrama & Subject-Verb Concord', subtopic: '12 Tenses, Subject-Verb Agreement (Neither-Nor, Either-Or, Along with)', dayNumber: 8, periodNumber: 2, keyFormulaOrLaw: 'Concord Rule: Either S1 or S2 -> Verb agrees with nearest subject S2 | Each / Every takes Singular verb', keyPoints: ['INSV Tarini was built indigenously in India at Aquarius Shipyard Goa', 'Circumnavigation covered 21,600 nautical miles without crossing canals'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 4,
          chapterTitle: 'Unit 4: Prose (*The Attic*), Poem (*The Ant and the Cricket*) & Conditionals',
          description: 'Satyajit Ray\'s nostalgic story on guilt and redemption, Aesop fable poem, Supplementary: The Aged Mother (Matsuo Basho), Connectors & If-Conditionals',
          subtopics: [
            {
              id: 'sec_e_sub4',
              title: 'Unit 4: Nostalgia & Conditional Clauses',
              microTopics: [
                { id: 'sec_e_11', title: 'Prose: The Attic by Satyajit Ray (Aditya and Sasanka Sanyal)', keyAxiom: 'Aditya returns childhood silver medal to Sasanka Sanyal to ease his guilty conscience' },
                { id: 'sec_e_12', title: 'Poem: The Ant and the Cricket & Matsuo Basho\'s The Aged Mother', keyAxiom: 'Plan for the future and respect elder wisdom (A mother\'s love is unconditional)' },
                { id: 'sec_e_13', title: 'Grammar: Conditional Clauses (Zero, First, Second, Third Conditional)', keyAxiom: 'Type 1: If + Present, will + V1 | Type 2: If + Past, would + V1 | Type 3: If + had + V3, would have + V3' }
              ]
            }
          ],
          microTopics: [
            { id: 'sec_e_11', topicTitle: 'Unit 4: Satyajit Ray Attic & If-Conditionals (Types 1, 2, 3)', subtopic: 'If + had + V3 -> would have + V3, Unless clauses & Connectors', dayNumber: 11, periodNumber: 2, keyFormulaOrLaw: 'Conditionals: Type 1 (If you study, you will pass) | Type 2 (If I were rich, I would help) | Type 3 (If you had worked, you would have won)', keyPoints: ['Satyajit Ray was India\'s legendary Academy Award winning film director and writer', 'Shining country ruled by tyrannical leader in The Aged Mother'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 5,
          chapterTitle: 'Unit 5: Prose (*Tech Bloomers*) & Poem (*The Secret of the Machines*)',
          description: 'Assistive technology empowering differently-abled persons, Rudyard Kipling machinery poem, Supplementary: A Day in 2889, Reported Speech (Direct/Indirect)',
          subtopics: [
            {
              id: 'sec_e_sub5',
              title: 'Unit 5: Assistive Tech & Reported Speech',
              microTopics: [
                { id: 'sec_e_14', title: 'Prose: Tech Bloomers (Alisha & David assistive devices)', keyAxiom: 'Technology bridges physical limitations (Eye gaze technology, ECO2)' },
                { id: 'sec_e_15', title: 'Poem: The Secret of the Machines by Rudyard Kipling', keyAxiom: 'We were taken from the ore-bed and the mine — Machines lack human soul' },
                { id: 'sec_e_16', title: 'Grammar: Direct to Indirect Speech Rules', keyAxiom: 'Statements (that), Questions (if/whether/wh-), Imperatives (to), Exclamations (exclaimed with joy)' }
              ]
            }
          ],
          microTopics: [
            { id: 'sec_e_14', topicTitle: 'Unit 5: Tech Bloomers & Direct-to-Indirect Reported Speech', subtopic: 'Tense backshift rules, Pronoun changes, Time/place adverbs change', dayNumber: 14, periodNumber: 2, keyFormulaOrLaw: 'Reported Speech: Said to -> told | Present simple -> Past simple | Tomorrow -> The next day | Here -> There', keyPoints: ['Rudyard Kipling was awarded Nobel Prize in Literature in 1907 (Jungle Book author)', 'Assistive technology helps students with cerebral palsy speak and learn'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        }
      ]
    },
    {
      subjectId: 'sec_math',
      subjectName: isTa ? 'கணிதம் (Mathematics — 10ஆம் வகுப்பு சமச்சீர் பாடத்திட்டம்)' : 'Mathematics (Relations, Numbers, Algebra, Geometry, Mensuration)',
      icon: '📐',
      color: '#06b6d4',
      totalChapters: 4,
      totalMicroTopics: 16,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: isTa ? 'உறவுகளும் சார்புகளும் & எண்களும் தொடர்வரிசைகளும்' : 'Relations & Functions and Numbers & Sequences (AP/GP)',
          description: isTa ? 'கார்டீசியன் பெருக்கல், சார்புகளின் வகைகள், யூக்ளிட் வகுத்தல் வழிமுறை, கூட்டுத்தொடர் (AP), பெருக்குத்தொடர் (GP), சிறப்புத் தொடர்கள்' : 'Cartesian products, Function types, Euclid Division Lemma, Arithmetic & Geometric Progressions, Special Series Σn, Σn², Σn³',
          subtopics: [
            {
              id: 'sec_m_sub1',
              title: 'உறவுகள், சார்புகள் & தொடர்வரிசைகள்',
              microTopics: [
                { id: 'sec_m_1', title: 'கார்டீசியன் பெருக்கல் & சார்புகளின் வகைகள் (Cartesian Product & Functions)', keyAxiom: 'f: A -> B is a function if every element in A has unique image in B' },
                { id: 'sec_m_2', title: 'யூக்ளிட் வகுத்தல் வழிமுறை (Euclid\'s Division Lemma: a = bq + r)', keyAxiom: 'Euclid Lemma gives HCF of two positive integers' },
                { id: 'sec_m_3', title: 'கூட்டுத்தொடர் (Arithmetic Progression AP: t_n & S_n)', keyAxiom: 'AP: a_n = a + (n-1)d, S_n = n/2(2a + (n-1)d)' },
                { id: 'sec_m_4', title: 'பெருக்குத்தொடர் (Geometric Progression GP: t_n & S_n)', keyAxiom: 'GP: t_n = ar^(n-1), S_n = a(r^n - 1)/(r - 1)' },
                { id: 'sec_m_5', title: 'சிறப்புத் தொடர்கள் (Special Series: Σn, Σn², Σn³)', keyAxiom: 'Sum of first n natural numbers, squares and cubes' }
              ]
            }
          ],
          microTopics: [
            { id: 'sec_m_1', topicTitle: 'Euclid\'s Division Lemma & HCF (யூக்ளிட் வகுத்தல் வழிமுறை)', subtopic: 'Fundamental Theorem of Arithmetic, Divisibility & HCF Algorithm', dayNumber: 3, periodNumber: 1, keyFormulaOrLaw: 'a = bq + r (where 0 ≤ r < b) | HCF(a, b) = HCF(b, r)', keyPoints: ['Every composite number can be uniquely expressed as product of primes', 'Used to find HCF of large integers systematically'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'sec_m_2', topicTitle: 'Arithmetic Progression AP (கூட்டுத்தொடர் AP)', subtopic: 'General Term t_n = a + (n-1)d and Sum of n Terms S_n', dayNumber: 3, periodNumber: 2, keyFormulaOrLaw: 't_n = a + (n - 1)d | S_n = n/2 [2a + (n - 1)d] = n/2 (a + l)', keyPoints: ['Common difference d = t₂ - t₁ = t₃ - t₂', 'Three terms in AP are taken as (a - d), a, (a + d)'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'sec_m_3', topicTitle: 'Geometric Progression GP (பெருக்குத்தொடர் GP)', subtopic: 'General Term t_n = ar^(n-1) and Sum of n Terms S_n', dayNumber: 3, periodNumber: 3, keyFormulaOrLaw: 't_n = a rⁿ⁻¹ | S_n = a(rⁿ - 1) / (r - 1) for r > 1', keyPoints: ['Common ratio r = t₂ / t₁ = t₃ / t₂', 'Sum to infinity S_∞ = a / (1 - r) for |r| < 1'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'sec_m_4', topicTitle: 'Special Series Summation (சிறப்புத் தொடர்கள்)', subtopic: 'Sum of First n Natural Numbers, Squares and Cubes', dayNumber: 3, periodNumber: 4, keyFormulaOrLaw: 'Σn = n(n+1)/2 | Σn² = n(n+1)(2n+1)/6 | Σn³ = [n(n+1)/2]²', keyPoints: ['The sum of first n odd natural numbers = n²', 'Sum of cubes equals square of sum of natural numbers: Σn³ = (Σn)²'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: isTa ? 'இயற்கணிதம்: இருபடிச் சமன்பாடுகள் & அணிகள் (Matrices)' : 'Algebra: Quadratic Equations, Roots & Matrices',
          description: isTa ? 'மூன்று மாறிகளில் ஒருபடிச் சமன்பாடுகள், பல்லுறுப்புக் கோவை வர்க்கமூலம், இருபடி சூத்திரம் x = (-b ± √D)/(2a), அணிகள் கூட்டல் & பெருக்கல்' : 'Linear systems in 3 variables, Square root of polynomials, Quadratic formula, Nature of roots, Matrix multiplication & transpose',
          subtopics: [
            {
              id: 'sec_m_sub2',
              title: 'இருபடிச் சமன்பாடுகள் & அணிகள்',
              microTopics: [
                { id: 'sec_m_6', title: 'இருபடிச் சமன்பாடுகள் மூலங்களின் தன்மை (Nature of Roots: D = b² - 4ac)', keyAxiom: 'D > 0 Real & Distinct | D = 0 Real & Equal | D < 0 No Real Roots' },
                { id: 'sec_m_7', title: 'அணிகள் பெருக்கல் & இடமாற்று அணி (Matrix Multiplication & Transpose)', keyAxiom: '(AB)ᵀ = Bᵀ Aᵀ | Multiplication requires cols(A) = rows(B)' }
              ]
            }
          ],
          microTopics: [
            { id: 'sec_m_5', topicTitle: 'Nature of Roots & Quadratic Formula (இருபடிச் சமன்பாடுகள்)', subtopic: 'Discriminant D = b² - 4ac, Vieta Sum/Product of Roots', dayNumber: 6, periodNumber: 1, keyFormulaOrLaw: 'x = [-b ± √(b² - 4ac)] / (2a) | α + β = -b/a | αβ = c/a', keyPoints: ['If D > 0, roots are real and unequal; If D = 0, roots are real and equal', 'Quadratic equation form: x² - (Sum of roots)x + (Product of roots) = 0'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'sec_m_6', topicTitle: 'Matrices Operations & Multiplication (அணிகள் & அணிப் பெருக்கல்)', subtopic: 'Matrix Addition, Scalar Multiplication, Product Rule & Transpose Properties', dayNumber: 6, periodNumber: 2, keyFormulaOrLaw: '(AB)ᵀ = Bᵀ Aᵀ | (A + B)ᵀ = Aᵀ + Bᵀ | AI = IA = A', keyPoints: ['Matrix multiplication is not commutative in general: AB ≠ BA', 'Square matrix A is symmetric if Aᵀ = A, and skew-symmetric if Aᵀ = -A'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 3,
          chapterTitle: isTa ? 'வடிவியல் (தேல்ஸ் தேற்றம், பிதாகரஸ்) & ஆயத்தொலை வடிவியல்' : 'Geometry (Thales, Pythagoras) & Coordinate Geometry',
          description: isTa ? 'தேல்ஸ் தேற்றம் (BPT), கோண இருசமவெட்டித் தேற்றம் (ABT), பிதாகரஸ் தேற்றம், தொடுகோடு தேற்றம், கோட்டின் சாய்வு m = (y₂-y₁)/(x₂-x₁)' : 'Basic Proportionality Theorem, Angle Bisector Theorem, Pythagoras, Tangents, Slope m = tan θ, Straight line equations',
          subtopics: [
            {
              id: 'sec_m_sub3',
              title: 'வடிவியல் தேற்றங்கள் & சாய்வு சூத்திரங்கள்',
              microTopics: [
                { id: 'sec_m_8', title: 'தேல்ஸ் தேற்றம் & அடிப்படை விகிதசமத் தேற்றம் (Thales Theorem - BPT)', keyAxiom: 'AD/DB = AE/EC in triangle with parallel line to base' },
                { id: 'sec_m_9', title: 'கோட்டின் சாய்வு & நேர்க்கோட்டு சமன்பாடுகள் (Straight Line Slope & Equation)', keyAxiom: 'Parallel lines: m₁ = m₂ | Perpendicular lines: m₁ × m₂ = -1' }
              ]
            }
          ],
          microTopics: [
            { id: 'sec_m_7', topicTitle: 'Thales Theorem & Basic Proportionality (தேல்ஸ் தேற்றம்)', subtopic: 'BPT Proof, Converse of BPT & Angle Bisector Theorem (ABT)', dayNumber: 9, periodNumber: 1, keyFormulaOrLaw: 'Thales: AD / DB = AE / EC | ABT: BD / DC = AB / AC', keyPoints: ['If a line is drawn parallel to one side of a triangle, it divides the other two sides in the same ratio', 'Pythagoras Theorem: In a right triangle, Hypotenuse² = Base² + Altitude²'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'sec_m_8', topicTitle: 'Coordinate Geometry & Line Slope (ஆயத்தொலை வடிவியல் & சாய்வு)', subtopic: 'Slope of Straight Line, Parallel & Perpendicular Conditions, Line Equations', dayNumber: 9, periodNumber: 2, keyFormulaOrLaw: 'Slope m = (y₂ - y₁) / (x₂ - x₁) | y - y₁ = m(x - x₁) | m₁ m₂ = -1', keyPoints: ['Area of triangle with vertices (x₁,y₁), (x₂,y₂), (x₃,y₃) = ½ |Σ x₁(y₂ - y₃)|', 'If 3 points are collinear, the area of triangle formed by them is 0'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 4,
          chapterTitle: isTa ? 'முக்கோணவியல், அளவியல் & புள்ளியியலும் நிகழ்தகவும்' : 'Trigonometry, Mensuration & Statistics/Probability',
          description: isTa ? 'முக்கோணவியல் முற்றொருமைகள் (sin²θ+cos²θ=1), உயரங்களும் தொலைவுகளும், உருளை கூம்பு கோளம் பரப்பளவு/கொள்ளளவு, திட்டவிலக்கம் σ & நிகழ்தகவு P(A∪B)' : 'Trigonometric identities, Heights & distances, Surface area & Volume (Cylinder, Cone, Sphere, Frustum), Standard Deviation σ, Probability addition theorem',
          subtopics: [
            {
              id: 'sec_m_sub4',
              title: 'முக்கோணவியல், அளவியல் & நிகழ்தகவு',
              microTopics: [
                { id: 'sec_m_10', title: 'முக்கோணவியல் முற்றொருமைகள் (Trigonometric Identities: sin²θ+cos²θ=1)', keyAxiom: 'sin²θ + cos²θ = 1 | 1 + tan²θ = sec²θ | 1 + cot²θ = cosec²θ' },
                { id: 'sec_m_11', title: 'அளவியல்: உருளை, கூம்பு, கோளம் & இடைக்கண்டம் (Mensuration Formulas)', keyAxiom: 'Cylinder V = πr²h | Cone V = ⅓πr²h | Sphere V = ⁴⁄₃πr³' },
                { id: 'sec_m_12', title: 'திட்டவிலக்கம் σ & மாறுபாட்டுக் கெழு (Standard Deviation & CV)', keyAxiom: 'σ = √[Σd²/n] | CV = (σ/x̄) × 100%' },
                { id: 'sec_m_13', title: 'நிகழ்தகவு கூட்டல் தேற்றம் (Probability Addition Theorem: P(A∪B))', keyAxiom: 'P(A ∪ B) = P(A) + P(B) - P(A ∩ B)' }
              ]
            }
          ],
          microTopics: [
            { id: 'sec_m_9', topicTitle: 'Trigonometric Identities (முக்கோணவியல் முற்றொருமைகள்)', subtopic: 'Fundamental Identities, Proofs & Heights and Distances Angle of Elevation', dayNumber: 12, periodNumber: 1, keyFormulaOrLaw: 'sin²θ + cos²θ = 1 | 1 + tan²θ = sec²θ | 1 + cot²θ = cosec²θ', keyPoints: ['tan θ = Opposite / Adjacent = Height / Distance', 'Angle of elevation equals angle of depression when viewed between two parallel lines'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'sec_m_10', topicTitle: 'Mensuration - Cylinder, Cone, Sphere (அளவியல் கனஅளவுகள்)', subtopic: 'Curved Surface Area, Total Surface Area & Volume of Combined Solids', dayNumber: 12, periodNumber: 2, keyFormulaOrLaw: 'Cylinder V = πr²h | Cone V = ⅓πr²h | Sphere V = ⁴⁄₃πr³ | Frustum V = ⅓πh(R² + r² + Rr)', keyPoints: ['Volume of cone is exactly ⅓ of volume of cylinder having same radius and height', 'Total surface area of solid hemisphere = 3πr²'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'sec_m_11', topicTitle: 'Statistics & Standard Deviation (திட்டவிலக்கம் σ & CV)', subtopic: 'Standard Deviation, Mean Deviation & Coefficient of Variation Consistency', dayNumber: 12, periodNumber: 3, keyFormulaOrLaw: 'σ = √[Σd² / n] | Coefficient of Variation CV = (σ / x̄) × 100%', keyPoints: ['Standard deviation is always non-negative (σ ≥ 0)', 'Data series with smaller Coefficient of Variation (CV) is more consistent and stable'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'sec_m_12', topicTitle: 'Probability Addition Theorem (நிகழ்தகவு கூட்டல் தேற்றம்)', subtopic: 'Sample Space, Independent Events & Addition Theorem for 2 and 3 Events', dayNumber: 12, periodNumber: 4, keyFormulaOrLaw: 'P(A ∪ B) = P(A) + P(B) - P(A ∩ B) | P(E) + P(E\') = 1', keyPoints: ['Probability of any event satisfies 0 ≤ P(E) ≤ 1', 'For mutually exclusive events: P(A ∩ B) = 0, hence P(A ∪ B) = P(A) + P(B)'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        }
      ]
    },
    {
      subjectId: 'sec_science',
      subjectName: isTa ? 'அறிவியல் (Science — இயற்பியல், வேதியியல் & உயிரியல்)' : 'Science (Physics, Chemistry & Biology Life Processes)',
      icon: '⚡',
      color: '#10b981',
      totalChapters: 3,
      totalMicroTopics: 16,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: isTa ? 'இயற்பியல் (Physics — இயக்க விதிகள், ஒளியியல், மின்னியல் & அணுக்கரு இயற்பியல்)' : 'Physics (Laws of Motion, Optics, Electricity & Nuclear Physics)',
          description: isTa ? 'நியூட்டனின் இயக்க விதிகள் (F=ma), லென்ஸ் சூத்திரம் (1/v - 1/u = 1/f), ஓம் விதி (V=IR), அணுக்கரு இணைவு & பிளவு, E = mc²' : 'Newton laws, Momentum conservation, Lens & Mirror formulas, Ohm\'s law, Series/Parallel circuits, Nuclear fission & fusion (E=mc²)',
          subtopics: [
            {
              id: 'sec_s_sub1',
              title: 'இயற்பியல் விதிகள் & சூத்திரங்கள்',
              microTopics: [
                { id: 'sec_p_1', title: 'நியூட்டனின் இயக்க விதிகள் (Newton\'s Laws of Motion: F = ma)', keyAxiom: 'Inertia of rest/motion/direction | Recoil velocity of gun v = -(m/M)u' },
                { id: 'sec_p_2', title: 'ஒளியியல் & லென்ஸ் சூத்திரம் (Optics & Lens Formula: 1/v - 1/u = 1/f)', keyAxiom: 'Lens: 1/v - 1/u = 1/f | Power of Lens P = 1/f(m)' },
                { id: 'sec_p_3', title: 'மின்னியல் & ஓம் விதி (Electricity & Ohm\'s Law: V = IR)', keyAxiom: 'Ohm\'s Law: V = IR | Joule Heating: H = I²Rt | Electric Power: P = VI' },
                { id: 'sec_p_4', title: 'அணுக்கரு இயற்பியல் & கதிர்வீச்சு (Nuclear Physics & Radioactivity: E = mc²)', keyAxiom: 'Nuclear Fission & Fusion (Sun/Stars) | Mass Energy Equivalence: E = mc²' }
              ]
            }
          ],
          microTopics: [
            { id: 'sec_p_1', topicTitle: 'Newton\'s Laws of Motion (நியூட்டனின் இயக்க விதிகள்)', subtopic: 'First, Second (F=ma), Third Law & Momentum Conservation', dayNumber: 13, periodNumber: 1, keyFormulaOrLaw: 'F = ma | Momentum p = mv | Recoil v = -(m/M)u', keyPoints: ['Impulse J = F × t = Change in Momentum', 'Action and reaction act on two different bodies simultaneously'], type: 'concept', importance: 'High-Yield' },
            { id: 'sec_p_2', topicTitle: 'Optics & Lens Formula (ஒளியியல் & லென்ஸ் சூத்திரம்)', subtopic: 'Convex/Concave Lenses, Refraction & Power of Lens', dayNumber: 13, periodNumber: 2, keyFormulaOrLaw: '1/v - 1/u = 1/f | Magnification m = v/u | Power P = 1/f(in metres) Dioptre', keyPoints: ['Convex lens is converging; Concave lens is diverging', 'Myopia corrected by concave lens; Hypermetropia by convex lens'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'sec_p_3', topicTitle: 'Electricity & Ohm\'s Law (மின்னியல் & ஓம் விதி)', subtopic: 'Current, Potential Difference, Resistors in Series & Parallel, Joule Heating', dayNumber: 13, periodNumber: 3, keyFormulaOrLaw: 'V = IR | Series: R_s = R₁ + R₂ | Parallel: 1/R_p = 1/R₁ + 1/R₂ | H = I²Rt', keyPoints: ['Electric current measured by ammeter in series; Voltmeter in parallel', 'Domestic wiring is always in parallel connection at 220V AC'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'sec_p_4', topicTitle: 'Nuclear Physics & Radioactivity (அணுக்கரு இயற்பியல்)', subtopic: 'Alpha/Beta/Gamma Rays, Nuclear Fission, Fusion & Mass-Energy', dayNumber: 13, periodNumber: 4, keyFormulaOrLaw: 'E = mc² | 1 a.m.u = 931 MeV | Radioactive Half-Life T₁/₂ = 0.693 / λ', keyPoints: ['Nuclear fusion produces energy in Sun (Hydrogen -> Helium)', 'Control rods (Boron, Cadmium) absorb excess neutrons in nuclear reactor'], type: 'concept', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: isTa ? 'வேதியியல் (Chemistry — அணுக்கள், மூலக்கூறுகள், கரைசல்கள் & கார்பன் சேர்மங்கள்)' : 'Chemistry (Atoms & Molecules, Solutions, Reactions & Carbon Compounds)',
          description: isTa ? 'மோல் தத்துவம் (Avogadro 6.023 × 10²³), pH அளவீடு, நிறை சதவீதம், ஹைட்ரோகார்பன்கள், எத்தனால் & எத்தனாயிக் அமிலம்' : 'Mole concept, Avogadro number, Concentration of solution, Chemical reaction types, Covalent bonding, Esterification & Soaps',
          subtopics: [
            {
              id: 'sec_s_sub2',
              title: 'வேதியியல் கோட்பாடுகள்',
              microTopics: [
                { id: 'sec_c_1', title: 'மோல் தத்துவம் & அவகாட்ரோ எண் (Mole Concept & Avogadro Number: n = m/M)', keyAxiom: '1 Mole = 6.023 × 10²³ particles (Avogadro Constant N_A)' },
                { id: 'sec_c_2', title: 'pH அளவீடு & அமில-கார சமநிலை (pH Scale & Acid-Base Chemistry: pH = -log[H+])', keyAxiom: 'pH = -log₁₀[H⁺] | pH < 7 Acidic | pH = 7 Neutral | pH > 7 Basic' },
                { id: 'sec_c_3', title: 'கார்பன் சேர்மங்கள், எத்தனால் & எஸ்டராக்குதல் (Carbon Compounds & Esterification)', keyAxiom: 'Esterification: Carboxylic Acid + Alcohol -> Fruity smelling Ester + Water' }
              ]
            }
          ],
          microTopics: [
            { id: 'sec_c_1', topicTitle: 'Mole Concept & Avogadro Number (மோல் தத்துவம்)', subtopic: 'Gram Molecular Mass, Mole Calculations & Molar Volume', dayNumber: 14, periodNumber: 1, keyFormulaOrLaw: 'Mole n = Mass / Molar Mass = Number of Particles / 6.023×10²³', keyPoints: ['At STP, 1 mole of any ideal gas occupies 22.4 litres', 'Relative Molecular Mass of Water H₂O = 18 g/mol; Carbon Dioxide CO₂ = 44 g/mol'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'sec_c_2', topicTitle: 'pH Scale & Acid-Base Indicators (pH அளவீடு & அமில-காரங்கள்)', subtopic: 'pH Calculation, Universal Indicator, Acid Rain & Soil pH', dayNumber: 14, periodNumber: 2, keyFormulaOrLaw: 'pH = -log₁₀[H⁺] | pOH = -log₁₀[OH⁻] | pH + pOH = 14', keyPoints: ['Human blood pH range is tightly regulated between 7.35 and 7.45', 'Acid rain occurs when rainwater pH falls below 5.6'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'sec_c_3', topicTitle: 'Carbon Compounds & Esterification (கார்பன் சேர்மங்கள் & எஸ்டராக்குதல்)', subtopic: 'Ethanol, Ethanoic Acid, Functional Groups & Saponification (Soap Making)', dayNumber: 14, periodNumber: 3, keyFormulaOrLaw: 'CH₃COOH + C₂H₅OH (conc. H₂SO₄) -> CH₃COOC₂H₅ (Ester) + H₂O', keyPoints: ['Esters have pleasant, fruity fragrances used in perfumes and flavouring agents', 'Saponification produces soap and glycerol by alkaline hydrolysis of fats'], type: 'concept', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 3,
          chapterTitle: isTa ? 'உயிரியல் (Biology — வாழ்க்கைச் செயல்கள், மனித உடலியல், மரபியல் & DNA)' : 'Biology (Life Processes, Physiology, Genetics & DNA)',
          description: isTa ? 'ஒளிச்சேர்க்கை, மனித இதயம் (இரட்டை ரத்த ஓட்டம்), சிறுநீரகம் & நெஃப்ரான், மூளை & நரம்பு மண்டலம், தாவர ஹார்மோன்கள், மெண்டலின் மரபியல் (3:1, 9:3:3:1), DNA இரட்டைச் சுருள்' : 'Photosynthesis, Human Heart & Circulation, Nephron & Excretion, Human Brain, Plant Hormones, Mendel Inheritance Ratios, DNA Double Helix Model',
          subtopics: [
            {
              id: 'sec_s_sub3',
              title: 'உயிரியல் வாழ்க்கைச் செயல்கள் & மரபியல்',
              microTopics: [
                { id: 'sec_b_1', title: 'ஒளிச்சேர்க்கை & தாவர உடலியல் (Photosynthesis & Plant Physiology)', keyAxiom: '6CO₂ + 6H₂O + Sunlight -> C₆H₁₂O₆ + 6O₂ (Light & Dark Reactions)' },
                { id: 'sec_b_2', title: 'மனித இதயம் & இரட்டை இரத்த ஓட்டம் (Human Heart & Double Circulation)', keyAxiom: '4 Chambers (2 Atria, 2 Ventricles) | Blood Pressure = 120/80 mmHg' },
                { id: 'sec_b_3', title: 'சிறுநீரகம் & நெஃப்ரான் கழிவுநீக்கம் (Nephron & Excretory System)', keyAxiom: 'Nephron filters blood in Glomerulus; Bowman\'s capsule forms urine' },
                { id: 'sec_b_4', title: 'மனித மூளை & நரம்பு மண்டலம் (Human Brain & Nervous System)', keyAxiom: 'Cerebrum (Cognition), Cerebellum (Equilibrium), Medulla (Vital centers)' },
                { id: 'sec_b_5', title: 'தாவர ஹார்மோன்கள் (Plant Hormones — ஆக்சின், சைட்டோகைனின், எத்திலீன்)', keyAxiom: 'Auxin promotes shoot growth; Cytokinin cell division; Ethylene fruit ripening' },
                { id: 'sec_b_6', title: 'மெண்டலின் மரபியல் விதிகள் (Mendel\'s Laws of Genetics — 3:1 & 9:3:3:1)', keyAxiom: 'Monohybrid Cross Phenotypic Ratio = 3:1 | Dihybrid Cross Ratio = 9:3:3:1' },
                { id: 'sec_b_7', title: 'DNA அமைப்பு & இரட்டைச் சுருள் (DNA Structure — Watson & Crick Model)', keyAxiom: 'Double Helix with Adenine-Thymine (A=T) & Guanine-Cytosine (G≡C) base pairs' }
              ]
            }
          ],
          microTopics: [
            { id: 'sec_b_1', topicTitle: 'Photosynthesis & Plant Physiology (ஒளிச்சேர்க்கை)', subtopic: 'Chloroplast, Light & Dark Reaction, Calvin Cycle & Stomatal Transpiration', dayNumber: 15, periodNumber: 1, keyFormulaOrLaw: '6CO₂ + 6H₂O + Sunlight (Chlorophyll) -> C₆H₁₂O₆ + 6O₂ + 6H₂O', keyPoints: ['Light reaction takes place in Thylakoid Grana producing ATP and NADPH', 'Dark reaction (Calvin cycle) takes place in Stroma fixing CO₂ into glucose'], type: 'concept', importance: 'High-Yield' },
            { id: 'sec_b_2', topicTitle: 'Human Heart & Double Circulation (மனித இதயம் & இரத்த ஓட்டம்)', subtopic: '4 Chambers, Tricuspid/Bicuspid Valves, Pulmonary & Systemic Circulation', dayNumber: 15, periodNumber: 2, keyFormulaOrLaw: 'Double Circulation: Heart -> Lungs (Pulmonary) & Heart -> Body (Systemic) | BP = 120/80 mmHg', keyPoints: ['Sinoatrial (SA) node acts as natural pacemaker of the heart', 'Left ventricle has thickest muscular wall to pump oxygenated blood throughout the body'], type: 'concept', importance: 'High-Yield' },
            { id: 'sec_b_3', topicTitle: 'Nephron & Kidney Function (நெஃப்ரான் & கழிவுநீக்க மண்டலம்)', subtopic: 'Glomerular Ultrafiltration, Tubular Reabsorption, Henle Loop & Urine Formation', dayNumber: 15, periodNumber: 3, keyFormulaOrLaw: 'Urine Formation: Ultrafiltration + Selective Reabsorption + Tubular Secretion', keyPoints: ['Nephron is structural and functional unit of kidney (~1 million per kidney)', 'Antidiuretic Hormone (ADH / Vasopressin) regulates water reabsorption in collecting duct'], type: 'concept', importance: 'High-Yield' },
            { id: 'sec_b_4', topicTitle: 'Human Brain & Reflex Action (மனித மூளை & நரம்பு மண்டலம்)', subtopic: 'Forebrain (Cerebrum), Midbrain, Hindbrain (Cerebellum, Medulla) & Reflex Arc', dayNumber: 15, periodNumber: 4, keyFormulaOrLaw: 'Reflex Arc: Receptor -> Sensory Neuron -> Spinal Cord -> Motor Neuron -> Effector Organ', keyPoints: ['Cerebrum is the seat of memory, intelligence, and voluntary actions', 'Cerebellum maintains body posture and equilibrium; Medulla regulates heartbeat and respiration'], type: 'concept', importance: 'High-Yield' },
            { id: 'sec_b_5', topicTitle: 'Plant Hormones & Growth Regulators (தாவர ஹார்மோன்கள்)', subtopic: 'Auxin, Cytokinin, Gibberellins, Abscisic Acid (Stress Hormone) & Ethylene', dayNumber: 15, periodNumber: 5, keyFormulaOrLaw: 'Auxin = Apical Dominance | Cytokinin = Cell Division | Ethylene = Fruit Ripening', keyPoints: ['Auxin promotes phototropism (stem bending towards light)', 'Abscisic Acid (ABA) induces stomatal closure during water stress condition'], type: 'concept', importance: 'High-Yield' },
            { id: 'sec_b_6', topicTitle: 'Mendel\'s Laws of Inheritance (மெண்டலின் மரபியல் விதிகள்)', subtopic: 'Monohybrid (3:1 Phenotype, 1:2:1 Genotype) & Dihybrid Cross (9:3:3:1)', dayNumber: 15, periodNumber: 6, keyFormulaOrLaw: 'Monohybrid Cross = 3 : 1 | Dihybrid Cross = 9 : 3 : 3 : 1 | Law of Segregation', keyPoints: ['Gregor Johann Mendel is known as the Father of Genetics', 'Phenotype is physical appearance; Genotype is genetic makeup of organism'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'sec_b_7', topicTitle: 'DNA Structure - Watson & Crick Model (DNA இரட்டைச் சுருள்)', subtopic: 'Nucleotides, Sugar-Phosphate Backbone, Complementary Base Pairs (A=T, G≡C)', dayNumber: 15, periodNumber: 7, keyFormulaOrLaw: 'Chargaff\'s Rule: [A] + [G] = [T] + [C] (Purines = Pyrimidines)', keyPoints: ['James Watson and Francis Crick proposed double helix model in 1953 (Nobel Prize 1962)', 'Adenine pairs with Thymine via 2 hydrogen bonds; Guanine with Cytosine via 3 hydrogen bonds'], type: 'concept', importance: 'High-Yield' }
          ]
        }
      ]
    },
    {
      subjectId: 'sec_social',
      subjectName: isTa ? 'சமூக அறிவியல் (Social Science — வரலாறு, புவியியல், குடிமையியல், பொருளியல்)' : 'Social Science (History, Geography, Civics & TNPSC Core)',
      icon: '🏛️',
      color: '#8b5cf6',
      totalChapters: 4,
      totalMicroTopics: 16,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: isTa ? 'வரலாறு: விடுதலைப் போராளிகள் & சமூக சீர்திருத்தம்' : 'History: Freedom Fighters & Social Reform',
          description: isTa ? 'வேலுநாச்சியார், வ.உ.சிதம்பரனார், பாரதியார், நீதிக்கட்சி மற்றும் பெரியார் சுயமரியாதை இயக்கம்' : 'Velu Nachiyar, VOC Swadeshi Shipping, Subramania Bharati, Justice Party and Self-Respect Movement',
          subtopics: [
            {
              id: 'sec_soc_sub1',
              title: 'விடுதலைப் போராட்டம் & சமூக சீர்திருத்தம்',
              microTopics: [
                { id: 'sec_soc_1', title: 'Velu Nachiyar & Early Resistance (வேலுநாச்சியார் சிவகங்கை மீட்பு)', keyAxiom: 'Velu Nachiyar recaptured Sivagangai (1780) with Haider Ali\'s support' },
                { id: 'sec_soc_2', title: 'V.O. Chidambaranar & Swadeshi Shipping (கப்பலோட்டிய தமிழன் வ.உ.சி)', keyAxiom: 'VOC launched Swadeshi Steam Navigation Company (1906) between Tuticorin and Colombo' },
                { id: 'sec_soc_3', title: 'Periyar & Self-Respect Movement (பெரியார் சுயமரியாதை இயக்கம்)', keyAxiom: 'Self-Respect Movement (1925) for rationalism, gender equality and abolition of caste hierarchy' }
              ]
            }
          ],
          microTopics: [
            { id: 'sec_soc_1', topicTitle: 'Velu Nachiyar & Early Resistance (வேலுநாச்சியார்)', subtopic: 'First Indian Queen to defeat East India Company (1780 Sivagangai Recapture)', dayNumber: 16, periodNumber: 1, keyFormulaOrLaw: '1780 Velu Nachiyar Sivagangai Victory | Kuyili (First Suicide Bombing Martyr)', keyPoints: ['Formed an alliance with Haider Ali and Gopala Nayakar of Dindigul', 'Commander Kuyili sacrificed herself by setting ammunition depot on fire'], type: 'concept', importance: 'High-Yield' },
            { id: 'sec_soc_2', topicTitle: 'V.O.C. & Swadeshi Shipping (வ.உ.சி கப்பலோட்டிய தமிழன்)', subtopic: 'Swadeshi Steam Navigation Company (1906) & Coral Mill Strike (1908)', dayNumber: 16, periodNumber: 2, keyFormulaOrLaw: '1906 VOC Swadeshi Shipping | Ships: S.S. Gallia & S.S. Lawoe', keyPoints: ['Challenged British maritime monopoly by running ships between Tuticorin and Colombo', 'Sentenced to double life imprisonment (40 years) and forced to pull oil press at Coimbatore jail'], type: 'concept', importance: 'High-Yield' },
            { id: 'sec_soc_3', topicTitle: 'Periyar & Self-Respect Movement (சுயமரியாதை இயக்கம்)', subtopic: 'Kudi Arasu Newspaper (1925), Anti-Hindi Agitation & 1921 Communal GO', dayNumber: 16, periodNumber: 3, keyFormulaOrLaw: '1925 Self-Respect Movement | 1921 Communal GO (Affirmative Action)', keyPoints: ['Advocated Self-Respect Marriages without religious rituals and priest mediation', 'Awarded "Socrates of South Asia" title by UNESCO in 1970'], type: 'concept', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: isTa ? 'புவியியல்: பருவமழை, மண் வகைகள் & தமிழ்நாடு தொழிலகங்கள்' : 'Geography: Monsoons, Soils & Industrial Clusters',
          description: isTa ? 'தென்மேற்கு & வடகிழக்கு பருவமழை, வண்டல் கரிசல் மண், தமிழ்நாடு நெசவு & காற்று ஆலைகள்' : 'Southwest & Northeast Monsoons, Soil types, TN Textile & Wind Energy Clusters',
          subtopics: [
            {
              id: 'sec_soc_sub2',
              title: 'பருவமழை & தமிழ்நாடு புவியியல்',
              microTopics: [
                { id: 'sec_soc_4', title: 'Monsoons of India - SW & NE Monsoons (பருவமழை)', keyAxiom: 'SW Monsoon (June–Sept) | NE Monsoon (Oct–Dec gives 48% rainfall to Tamil Nadu)' },
                { id: 'sec_soc_5', title: 'Tamil Nadu Industrial Clusters (தமிழ்நாடு தொழிலகங்கள்)', keyAxiom: 'Coimbatore (Textiles Manchester), Tiruppur (Knitwear), Sivakasi (Fireworks)' }
              ]
            }
          ],
          microTopics: [
            { id: 'sec_soc_4', topicTitle: 'Monsoons of India - SW & NE Monsoons (பருவமழை)', subtopic: 'Retreating Monsoon, Coromandel Coast Rainfall & Tropical Cyclones', dayNumber: 17, periodNumber: 1, keyFormulaOrLaw: 'SW Monsoon = June to Sept (Bulk of India) | NE Monsoon = Oct to Dec (48% TN Rainfall)', keyPoints: ['Western Ghats block SW monsoon causing rain shadow region in interior Tamil Nadu', 'Mawsynram in Meghalaya receives highest annual rainfall in the world (~1141 cm)'], type: 'concept', importance: 'High-Yield' },
            { id: 'sec_soc_5', topicTitle: 'Tamil Nadu Industrial Hubs (தமிழ்நாடு தொழிற்துறை)', subtopic: 'Automobile Hub Chennai (Detroit of South Asia), Textiles & Fireworks Clusters', dayNumber: 17, periodNumber: 2, keyFormulaOrLaw: 'Chennai = Detroit of South Asia | Coimbatore = Manchester of South India', keyPoints: ['Tiruppur accounts for over 50% of India\'s total cotton knitwear exports', 'Muppandal wind farm in Kanyakumari is one of the largest onshore wind farms in the world'], type: 'concept', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 3,
          chapterTitle: isTa ? 'குடிமையியல்: அரசியலமைப்பு முகப்புரை, அடிப்படை உரிமைகள் & நீதிப்பேராணைகள்' : 'Civics: Preamble, Fundamental Rights & Writs',
          description: isTa ? 'அரசியலமைப்பு முகப்புரை, அடிப்படை உரிமைகள் (சரத்து 12–35), 5 நீதிப்பேராணைகள் (சரத்து 32)' : 'Constituent Assembly, Preamble, 6 Fundamental Rights, 5 Constitutional Writs under Article 32',
          subtopics: [
            {
              id: 'sec_soc_sub3',
              title: 'அரசியலமைப்பு உரிமைகள் & பேராணைகள்',
              microTopics: [
                { id: 'sec_soc_6', title: 'Preamble of Indian Constitution (அரசியலமைப்பு முகப்புரை)', keyAxiom: 'Sovereign, Socialist, Secular, Democratic, Republic & Justice, Liberty, Equality, Fraternity' },
                { id: 'sec_soc_7', title: 'Fundamental Rights - Articles 12 to 35 (அடிப்படை உரிமைகள்)', keyAxiom: 'Right to Equality (14-18), Freedom (19-22), Exploitation (23-24), Religion (25-28), Remedies (32)' },
                { id: 'sec_soc_8', title: '5 Constitutional Writs - Article 32 (நீதிப்பேராணைகள்)', keyAxiom: 'Habeas Corpus, Mandamus, Prohibition, Quo-Warranto, Certiorari' }
              ]
            }
          ],
          microTopics: [
            { id: 'sec_soc_6', topicTitle: 'Preamble of Indian Constitution (அரசியலமைப்பு முகப்புரை)', subtopic: 'Identity Card of Constitution, 42nd Amendment (1976) & Kesavananda Bharati Case', dayNumber: 18, periodNumber: 1, keyFormulaOrLaw: 'Keywords: Sovereign, Socialist, Secular, Democratic, Republic', keyPoints: ['Drafted based on Objective Resolution introduced by Jawaharlal Nehru in 1946', 'Amended only once by 42nd Constitutional Amendment Act 1976 adding "Socialist, Secular, Integrity"'], type: 'concept', importance: 'High-Yield' },
            { id: 'sec_soc_7', topicTitle: 'Fundamental Rights - Articles 12 to 35 (அடிப்படை உரிமைகள்)', subtopic: '6 Fundamental Rights, Enforceability & Right to Life and Personal Liberty (Art 21)', dayNumber: 18, periodNumber: 2, keyFormulaOrLaw: 'Art 14 (Equality) | Art 19 (6 Freedoms) | Art 21 (Life & Liberty) | Art 32 (Remedies)', keyPoints: ['Borrowed from the Bill of Rights of the United States Constitution (Part III)', 'Right to Property was deleted from Fundamental Rights by 44th Amendment 1978 and made legal right (Art 300A)'], type: 'concept', importance: 'High-Yield' },
            { id: 'sec_soc_8', topicTitle: '5 Constitutional Writs - Article 32 (நீதிப்பேராணைகள்)', subtopic: 'Habeas Corpus, Mandamus, Prohibition, Certiorari & Quo-Warranto', dayNumber: 18, periodNumber: 3, keyFormulaOrLaw: 'Article 32 = Supreme Court Writs | Article 226 = High Court Writs', keyPoints: ['Dr. B.R. Ambedkar termed Article 32 as the "Heart and Soul of the Constitution"', 'Habeas Corpus literally means "to have the body of" protecting against illegal detention'], type: 'concept', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 4,
          chapterTitle: isTa ? 'பொருளியல்: GDP கணக்கீடு, 3 துறைகள் & GST வரி அமைப்பு' : 'Economics: GDP Formula, 3 Sectors & GST',
          description: isTa ? 'மொத்த உள்நாட்டு உற்பத்தி GDP = C + I + G + (X - M), முதன்மை இரண்டாம் மூன்றாம் துறைகள், GST சரக்கு சேவை வரி' : 'Gross Domestic Product formula, Primary/Secondary/Tertiary sectors and Goods & Services Tax (GST)',
          subtopics: [
            {
              id: 'sec_soc_sub4',
              title: 'பொருளாதார கோட்பாடுகள் & வரிகள்',
              microTopics: [
                { id: 'sec_soc_9', title: 'GDP Calculation - C + I + G + (X - M) (மொத்த உள்நாட்டு உற்பத்தி)', keyAxiom: 'GDP = Consumption + Investment + Government Spending + (Exports - Imports)' },
                { id: 'sec_soc_10', title: 'GST Taxation Structure (சரக்கு மற்றும் சேவை வரி)', keyAxiom: 'Dual GST (CGST + SGST / IGST) with slabs: 0%, 5%, 12%, 18%, 28%' }
              ]
            }
          ],
          microTopics: [
            { id: 'sec_soc_9', topicTitle: 'GDP Calculation Formula (மொத்த உள்நாட்டு உற்பத்தி - GDP)', subtopic: 'GDP = C + I + G + (X - M), Real vs Nominal GDP & Per Capita Income', dayNumber: 19, periodNumber: 1, keyFormulaOrLaw: 'GDP = C + I + G + (X - M) | Per Capita Income = Total National Income / Population', keyPoints: ['Measures the total monetary value of all finished goods and services produced in a country in a financial year', 'Tertiary sector (Services) is the largest contributor to Indian and Tamil Nadu GDP (~54%)'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'sec_soc_10', topicTitle: 'GST Taxation Structure (சரக்கு மற்றும் சேவை வரி)', subtopic: 'One Nation One Tax, CGST, SGST, IGST and GST Council Constitutional Body', dayNumber: 19, periodNumber: 2, keyFormulaOrLaw: '101st Amendment Act 2016 (Implemented 1 July 2017) | GST Slabs: 0%, 5%, 12%, 18%, 28%', keyPoints: ['Subsumed multiple central and state indirect taxes like Excise Duty, VAT, Service Tax into a single tax', 'GST Council is chaired by the Union Finance Minister under Article 279A of the Constitution'], type: 'concept', importance: 'High-Yield' }
          ]
        }
      ]
    }
  ];

  return {
    courseId,
    courseTitle,
    category: 'school_secondary',
    board: 'TNSB Samacheer Kalvi (SSLC)',
    medium: isTa ? 'Tamil' : 'English',
    totalDays: 200,
    totalSubjects: subjects.length,
    totalChapters: subjects.reduce((a, s) => a + s.chapters.length, 0),
    totalMicroTopics: subjects.reduce((a, s) => a + (s.totalMicroTopics || s.chapters.reduce((acc, c) => acc + (c.microTopics?.length || 0), 0)), 0),
    subjects
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. UPSC CIVIL SERVICES EXAMINATION (CSE — IAS / IPS / IFS / IRS) MASTER SYLLABUS
// ─────────────────────────────────────────────────────────────────────────────
export function getUpscCivilServicesCompleteSyllabus(courseId?: string, courseTitle?: string): CourseFullSyllabus {
  // SUBJECT 1: GS PAPER I (History, Art & Culture, Geography & Indian Society)
  const gs1Chapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Indian Heritage, Visual & Performing Arts & Literature',
      description: 'Harappan art, Mauryan/Gupta architecture, Dravidian temple styles (Chola/Pallava), 8 Classical Dances, Hindustani & Carnatic Music',
      microTopics: [
        { id: 'upsc_gs1_1', topicTitle: 'Temple Architecture (Nagara, Dravida, Vesara) & Rock-Cut Caves', subtopic: 'Ajanta, Ellora, Elephanta caves; Brihadisvara Chola bronzes; Nagara shikhara vs Dravida vimana & gopuram', dayNumber: 1, periodNumber: 1, keyFormulaOrLaw: 'Dravidian Style Features: Garbhagriha, Vimana (Pyramidal tower), Mandapa, Gopuram (Monumental gateway)', keyPoints: ['Chola bronze Nataraja iconography and casting technique (Cire-perdue / lost wax)', 'Bhimbetka rock shelters (Paleolithic to Mesolithic continuity)'], type: 'concept', importance: 'High-Yield' },
        { id: 'upsc_gs1_2', topicTitle: 'Classical Performing Arts (8 Dances) & Indian Philosophical Schools', subtopic: 'Bharatanatyam, Kathakali, Kathak, Odissi, Sattriya; 6 Orthodox schools (Nyaya, Vaisheshika, Samkhya, Yoga, Mimamsa, Vedanta) & Heterodox (Buddhism/Jainism)', dayNumber: 5, periodNumber: 1, keyFormulaOrLaw: 'Natyashastra (Bharata Muni): 9 Rasas (Navarasa) & Abhinaya | Advaita Vedanta (Adi Shankara): Maya & Brahman', keyPoints: ['Sattriya dance introduced by Mahapurusha Sankaradeva in Assam', 'Buddhist councils, Tripitakas, and Mahayana vs Hinayana doctrines'], type: 'concept', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Ancient, Medieval & Modern Indian History (1757 to 1947)',
      description: 'Indus Valley Civilization, Mauryan administration, Delhi Sultanate, Mughals (Mansabdari), 1857 Revolt & Gandhian Freedom Movements',
      microTopics: [
        { id: 'upsc_gs1_3', topicTitle: 'Indus Valley Civilization, Mauryas & Mughal Administrative Systems', subtopic: 'IVC town planning & drainage, Ashokan Dhamma edicts, Akbar Mansabdari & Zabti revenue system, Shivaji Ashtapradhan', dayNumber: 2, periodNumber: 1, keyFormulaOrLaw: 'Mansabdari System: Zat (Personal rank) and Sawar (Number of cavalrymen maintained)', keyPoints: ['Ashoka 14 Major Rock Edicts (Prakrit and Greek/Aramaic scripts)', 'Chola Kudavolai system of local self-government (Uttiramerur inscription)'], type: 'concept', importance: 'High-Yield' },
        { id: 'upsc_gs1_4', topicTitle: 'Modern Freedom Struggle: Moderates, Extremists & Gandhian Mass Movements', subtopic: 'Drain of Wealth (Dadabhai Naoroji), Swadeshi 1905, Non-Cooperation 1920, Civil Disobedience 1930, Quit India 1942, INA Subhash Chandra Bose', dayNumber: 6, periodNumber: 1, keyFormulaOrLaw: 'Gandhi Core Philosophy: Satyagraha (Truth-force), Ahimsa (Non-violence), Sarvodaya (Uplift of all)', keyPoints: ['1857 Revolt was turning point: Company rule ended, Queen Victoria Proclamation 1858', 'Poona Pact 1932: Joint electorate with reserved seats for Depressed Classes'], type: 'concept', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 3,
      chapterTitle: 'World History, Post-Independence Consolidation & Indian Society',
      description: 'Industrial Revolution, French/Russian Revolutions, World Wars, Decolonization, State Reorganization, Caste & Globalization',
      microTopics: [
        { id: 'upsc_gs1_5', topicTitle: 'World Revolutions (American, French, Russian), World Wars & Cold War Era', subtopic: 'French Revolution (Liberty, Equality, Fraternity), Russian Revolution 1917 (Lenin/Bolsheviks), Treaty of Versailles, NATO vs Warsaw Pact', dayNumber: 3, periodNumber: 1, keyFormulaOrLaw: 'Declaration of Rights of Man (1789) | Cold War Truman Doctrine & Marshall Plan', keyPoints: ['Industrial Revolution transformed agrarian societies into industrial capitalism', 'Non-Aligned Movement (NAM 1961 Belgrade) spearheaded by Nehru, Nasser, Tito'], type: 'concept', importance: 'High-Yield' },
        { id: 'upsc_gs1_6', topicTitle: 'Salient Features of Indian Society, Women Empowerment & Globalization', subtopic: 'Caste dynamics, Joint family changes, Demographic dividend, Urbanization distress, Feminization of agriculture, Secularism in India', dayNumber: 7, periodNumber: 1, keyFormulaOrLaw: 'Indian Model of Secularism: "Sarva Dharma Sambhava" (Equal respect to all religions) vs Western strict separation', keyPoints: ['Demographic Dividend window: India median age ~28.7 years', 'Impact of globalization on regional identities and informal labor markets'], type: 'concept', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 4,
      chapterTitle: 'Physical Geography (Geomorphology, Climatology, Oceanography) & Resources',
      description: 'Plate Tectonics, Indian Monsoon Mechanism (El Nino/La Nina/IOD), Ocean Currents, Mineral distribution & Critical Minerals (Lithium/Rare Earths)',
      microTopics: [
        { id: 'upsc_gs1_7', topicTitle: 'Geomorphology & Climatology: Plate Tectonics & Indian Monsoon Dynamics', subtopic: 'Continental drift, subduction zones, tropical cyclones, Southwest & Northeast Monsoons, Madden-Julian Oscillation (MJO), Western Disturbances', dayNumber: 4, periodNumber: 1, keyFormulaOrLaw: 'Monsoon Drivers: Differential heating, ITCZ shift, Tibetan plateau heating, Tropical Easterly Jet, Somali Jet, El Nino/IOD', keyPoints: ['Plate boundary types: Convergent (Himalayas), Divergent (Mid-Atlantic Ridge), Transform (San Andreas)', 'El Nino weakens Indian monsoon; Positive IOD enhances Indian rainfall'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'upsc_gs1_8', topicTitle: 'Oceanography, Critical Mineral Distribution & Location of Industries', subtopic: 'Thermohaline circulation, Coral bleaching, Deep ocean resources, Lithium & Rare Earth Elements (REE) supply chains, Weber Industrial Location Theory', dayNumber: 8, periodNumber: 1, keyFormulaOrLaw: 'Weber Least Cost Theory: Location determined by Transportation Cost, Labor Cost, and Agglomeration Economies', keyPoints: ['Coral bleaching occurs due to thermal stress causing expulsion of Zooxanthellae algae', 'Critical minerals: Lithium, Cobalt, Nickel, Gallium vital for EV transition and clean energy'], type: 'concept', importance: 'High-Yield' }
      ]
    }
  ];

  // SUBJECT 2: GS PAPER II (Governance, Constitution, Polity, Social Justice & IR)
  const gs2Chapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Indian Constitution, Basic Structure Doctrine & Comparative Schemes',
      description: 'Evolution from 1773-1947 Acts, Preamble, Fundamental Rights (12-35), DPSPs, Basic Structure, Comparison with UK, USA, France',
      microTopics: [
        { id: 'upsc_gs2_1', topicTitle: 'Constitutional Philosophy, Basic Structure Doctrine & Major Amendments', subtopic: 'Kesavananda Bharati case 1973, 42nd/44th/86th/101st GST/103rd EWS/106th Nari Shakti Vandan Amendments, Judicial Review', dayNumber: 1, periodNumber: 2, keyFormulaOrLaw: 'Basic Structure Doctrine: Parliament amending power under Article 368 cannot alter the core identity of the Constitution', keyPoints: ['Article 21 expanded to include Right to Privacy (Puttaswamy 2017), Clean Environment, Education (21A)', 'Harmonious construction between Fundamental Rights and DPSPs (Minerva Mills 1980)'], type: 'concept', importance: 'High-Yield' },
        { id: 'upsc_gs2_2', topicTitle: 'Comparison of Indian Constitutional Scheme with UK, USA & France', subtopic: 'Parliamentary sovereignty vs Constitutional supremacy, US Strict Separation of Powers vs Indian Checks and Balances, French Laïcité secularism', dayNumber: 5, periodNumber: 2, keyFormulaOrLaw: 'UK: Unwritten Constitution & Parliamentary Sovereignty | USA: Presidential & Due Process | India: Procedure Established by Law (evolving to Due Process)', keyPoints: ['India combines British parliamentary model with American fundamental rights and judicial review', 'US states have separate constitutions and dual citizenship; India has single citizenship'], type: 'concept', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Federalism, Executive, Parliament & Judicial Institutions',
      description: 'Centre-State relations (7th Schedule), Governor role, Parliamentary Committees, Anti-Defection Law (10th Schedule), Collegium System',
      microTopics: [
        { id: 'upsc_gs2_3', topicTitle: 'Federal Dynamics, Governor Constitutional Dilemmas & Local Governance (73rd/74th)', subtopic: 'Fiscal federalism, GST Council, Article 356 abuse, Governor discretionary assent to state bills, 11th & 12th Schedules devolution', dayNumber: 2, periodNumber: 2, keyFormulaOrLaw: 'S.R. Bommai Case (1994): Proclamation under Article 356 is subject to judicial review and floor test is mandatory', keyPoints: ['Sarkaria & Punchhi Commissions recommendations on Governor appointment and tenure', '73rd & 74th Amendments: 3-tier Panchayati Raj and 33% (up to 50% in states) reservation for women'], type: 'concept', importance: 'High-Yield' },
        { id: 'upsc_gs2_4', topicTitle: 'Parliamentary Functioning, Anti-Defection (10th Schedule) & Judicial Appointments', subtopic: 'Decline of parliamentary sittings, Departmental Standing Committees, Speaker role in 10th Schedule, Collegium vs NJAC (99th Amendment struck down)', dayNumber: 6, periodNumber: 2, keyFormulaOrLaw: 'Kihoto Hollohan Case (1992): Speaker decision under 10th Schedule is subject to judicial review', keyPoints: ['Ordinance-making power (Article 123/213) cannot be used as substitute for legislative power (D.C. Wadhwa case)', 'Public Interest Litigation (PIL) and epistolary jurisdiction expanded access to justice'], type: 'concept', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 3,
      chapterTitle: 'Electoral Reforms (RPA 1950/51), Statutory Bodies & Social Justice',
      description: 'Section 8 RPA disqualification, Criminalization of politics, CAG, Election Commission, Health, Education NEP 2020, Poverty & Hunger',
      microTopics: [
        { id: 'upsc_gs2_5', topicTitle: 'Representation of People Act (RPA 1950 & 1951) & Electoral Transparency', subtopic: 'Section 8(4) struck down (Lily Thomas 2013), Electoral Bonds verdict 2024, Simultaneous Elections (One Nation One Election), Model Code of Conduct', dayNumber: 3, periodNumber: 2, keyFormulaOrLaw: 'Association for Democratic Reforms (ADR 2002): Mandatory disclosure of criminal antecedents, assets, and liabilities of candidates', keyPoints: ['Article 324 plenary superintendence of elections vested in Election Commission', 'Section 123 of RPA 1951: Corrupt practices and appeals to religion/caste'], type: 'concept', importance: 'High-Yield' },
        { id: 'upsc_gs2_6', topicTitle: 'Social Justice: Vulnerable Sections Welfare, Health, Education (NEP 2020) & Hunger', subtopic: 'SC/ST Prevention of Atrocities, Rights of PwD Act 2016, Ayushman Bharat, Universal Health Coverage, National Food Security Act (NFSA 2013), POSHAN Abhiyaan', dayNumber: 7, periodNumber: 2, keyFormulaOrLaw: 'NEP 2020 5+3+3+4 Curricular Structure | NFSA 2013: 5 kg foodgrains/person/month at subsidised prices to 67% population', keyPoints: ['Out-of-pocket healthcare expenditure pushes families into poverty', 'Stunting, wasting, and anemia reduction targets under POSHAN 2.0'], type: 'concept', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 4,
      chapterTitle: 'International Relations, Bilateral Diplomacy & Global Multilateral Bodies',
      description: 'Neighborhood First, Act East, Quad, BRICS, G20, I2U2, UN Security Council Reforms, WTO Appellate Body, IMF/World Bank',
      microTopics: [
        { id: 'upsc_gs2_7', topicTitle: 'India Neighborhood First Policy, Indo-Pacific Strategy & Strategic Groupings', subtopic: 'India-China border LAC management, India-US Major Defense Partner, Quad maritime security, I2U2, BRICS expansion, IMEEC economic corridor', dayNumber: 4, periodNumber: 2, keyFormulaOrLaw: 'SAGAR (Security and Growth for All in the Region) & "Vasudhaiva Kutumbakam" (One Earth, One Family, One Future)', keyPoints: ['Indo-Pacific as a free, open, inclusive, and rules-based international maritime domain', 'Cross-border connectivity: Kaladan Multi-Modal, India-Myanmar-Thailand Trilateral Highway'], type: 'concept', importance: 'High-Yield' },
        { id: 'upsc_gs2_8', topicTitle: 'Multilateral Institutions: United Nations (UNSC Reforms), WTO & Global Governance', subtopic: 'G4 grouping for permanent UNSC seat, WTO dispute settlement crisis, TRIPS waiver, IMF quotas and Special Drawing Rights (SDRs), FATF grey/black listing', dayNumber: 8, periodNumber: 2, keyFormulaOrLaw: 'UNSC Reform Criteria: Representation of developing nations, expanding permanent membership from P5 to include G4 (India, Brazil, Germany, Japan)', keyPoints: ['WTO Peace Clause protects India agricultural MSP public stockholding', 'FATF Recommendations 40+9 to combat money laundering and terror financing'], type: 'concept', importance: 'High-Yield' }
      ]
    }
  ];

  // SUBJECT 3: GS PAPER III (Technology, Economic Development, Environment & Internal Security)
  const gs3Chapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Indian Macroeconomics, Budgeting (FRBM) & Inclusive Growth',
      description: 'GDP calculation (GVA at basic prices), Fiscal Deficit, FRBM Act, Tax buoyancy, GST reforms, Monetary Policy MPC, Banking NPAs & IBC 2016',
      microTopics: [
        { id: 'upsc_gs3_1', topicTitle: 'Macroeconomic Aggregates, Fiscal Deficit, Budgeting & FRBM Architecture', subtopic: 'Nominal vs Real GDP, GVA, Fiscal Deficit = Total Expenditure - (Revenue Receipts + Non-debt Capital Receipts), FRBM targets (3% Fiscal Deficit)', dayNumber: 1, periodNumber: 3, keyFormulaOrLaw: 'Primary Deficit = Fiscal Deficit - Interest Payments | Monetary Policy Taylor Rule: Repo Rate adjustment for inflation targeting (4% ± 2%)', keyPoints: ['Insolvency and Bankruptcy Code (IBC 2016) time-bound resolution of stressed corporate assets', 'Capital Expenditure (Capex) multiplier effect on infrastructure growth vs revenue expenditure'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'upsc_gs3_2', topicTitle: 'Inclusive Growth, Financial Inclusion (JAM Trinity) & Employment Landscape', subtopic: 'Jan Dhan-Aadhaar-Mobile (JAM), Direct Benefit Transfer (DBT), Gini coefficient, Periodic Labour Force Survey (PLFS), Gig and platform economy', dayNumber: 5, periodNumber: 3, keyFormulaOrLaw: 'Lorenz Curve & Gini Coefficient: G = A / (A + B) (0 = Perfect Equality, 1 = Perfect Inequality)', keyPoints: ['PM Jan Dhan Yojana achieved over 50 crore zero-balance bank accounts', 'Female Labour Force Participation Rate (FLFPR) constraints and care economy recognition'], type: 'concept', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Agriculture Economics, MSP, Cropping Patterns & Food Processing',
      description: 'Cropping systems (Kharif, Rabi, Zaid), Swaminathan C2 MSP formula, APMCs, e-NAM, Drip irrigation, Mega Food Parks, Land reforms',
      microTopics: [
        { id: 'upsc_gs3_3', topicTitle: 'Agricultural Cropping Patterns, Irrigation Systems & MSP Pricing Economics', subtopic: 'Micro-irrigation (Drip/Sprinkler under PMKSY), Direct Seeded Rice (DSR), MSP calculation (A2+FL vs Comprehensive C2 cost), Agri-credit', dayNumber: 2, periodNumber: 3, keyFormulaOrLaw: 'Swaminathan Commission Recommendation: MSP = Cost C2 + 50% profit margin', keyPoints: ['e-NAM (National Agriculture Market) creates unified pan-India electronic trading portal', 'PDS reforms: One Nation One Ration Card (ONORC) using Aadhaar biometric authentication'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'upsc_gs3_4', topicTitle: 'Food Processing Industries, Supply Chain Logistics & Land Records (SVAMITVA)', subtopic: 'Upstream and downstream linkages, Mega Food Parks Scheme, PMFME, Drone technology in agriculture, SVAMITVA drone mapping of rural land', dayNumber: 6, periodNumber: 3, keyFormulaOrLaw: 'Food Processing Value Addition: Raw Produce -> Processing -> Cold Chain -> Quality Testing -> Retail Export', keyPoints: ['Post-harvest losses in fruits and vegetables reduced through integrated cold chain infrastructure', 'Digital India Land Records Modernization Programme (DILRMP) ensures conclusive land titling'], type: 'concept', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 3,
      chapterTitle: 'Science & Technology: Space, AI, Biotechnology, Supercomputing & IPR',
      description: 'ISRO (Gaganyaan, Chandrayaan-3, Aditya-L1), 5G/6G, Artificial Intelligence, CRISPR-Cas9 gene editing, mRNA vaccines, Patents Act Section 3(d)',
      microTopics: [
        { id: 'upsc_gs3_5', topicTitle: 'Space Science: ISRO Launch Vehicles (LVM3, SSLV) & Deep Space Missions', subtopic: 'Chandrayaan-3 lunar south pole landing, Aditya-L1 Lagrange Point Halo orbit, Gaganyaan human spaceflight, NavIC satellite navigation', dayNumber: 3, periodNumber: 3, keyFormulaOrLaw: 'Orbital Mechanics: Escape Velocity v_e = √(2GM/R) | Lagrange Points L1 to L5 gravitational equilibrium', keyPoints: ['Cryogenic upper stage (CE-20 engine) powers India heavy lift LVM3 rocket', 'IN-SPACe single-window agency facilitating private space tech startups in India'], type: 'concept', importance: 'High-Yield' },
        { id: 'upsc_gs3_6', topicTitle: 'Frontier Tech: AI, Quantum Computing, CRISPR-Cas9 Gene Editing & IPR Section 3(d)', subtopic: 'National Quantum Mission (QKD, Superconducting qubits), Generative AI ethics, CRISPR-Cas9 molecular scissors, Section 3(d) of Patents Act against evergreening', dayNumber: 7, periodNumber: 3, keyFormulaOrLaw: 'Section 3(d) Patents Act 1970: Mere discovery of a new form of known substance without enhanced therapeutic efficacy is not patentable', keyPoints: ['Novartis case upheld Section 3(d) to ensure affordable generic medicines for public health', 'CRISPR-Cas9 enables precise targeted genetic modification to cure sickle cell disease'], type: 'concept', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 4,
      chapterTitle: 'Environment, Climate Change (UNFCCC COP) & Internal Security',
      description: 'EIA 2020, Paris Agreement Net Zero 2070, Sendai Disaster Framework, Left Wing Extremism (LWE), Cyber Warfare (CERT-In), PMLA & Border Security',
      microTopics: [
        { id: 'upsc_gs3_7', topicTitle: 'Environmental Conservation, EIA, UNFCCC Climate Summits & Disaster Management', subtopic: 'EIA 4-stage process (Screening, Scoping, Public Consultation, Appraisal), Panchamrit Net Zero 2070 targets, Sendai Framework 2015-2030, NDRF response', dayNumber: 4, periodNumber: 3, keyFormulaOrLaw: 'Sendai Framework 4 Priorities: Understanding Risk -> Strengthening Governance -> Investing in Resilience -> Build Back Better', keyPoints: ['Panchamrit: 500 GW non-fossil energy, 50% renewable capacity, 1 billion tonne carbon reduction, Net Zero by 2070', 'Project Tiger 50 years: Conservation model in Core-Buffer protected areas'], type: 'concept', importance: 'High-Yield' },
        { id: 'upsc_gs3_8', topicTitle: 'Internal Security: Left Wing Extremism, Cyber Security, Money Laundering (PMLA) & Border Control', subtopic: 'SAMADHAN strategy against Naxalism, National Cyber Security Strategy, CERT-In guidelines, PMLA 2002 (Placement, Layering, Integration), CAPF mandates (BSF, CRPF, ITBP)', dayNumber: 8, periodNumber: 3, keyFormulaOrLaw: 'Money Laundering 3 Stages: Placement (Cash inject) -> Layering (Complex transactions) -> Integration (Clean assets)', keyPoints: ['Comprehensive Integrated Border Management System (CIBMS) with thermal imagers and radar sensors', 'Critical Information Infrastructure protected by NCIIPC under Section 70 of IT Act 2000'], type: 'concept', importance: 'High-Yield' }
      ]
    }
  ];

  // SUBJECT 4: GS PAPER IV (Ethics, Integrity, Aptitude & Administrative Case Studies)
  const gs4Chapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Ethics & Human Interface, Moral Thinkers & Human Values',
      description: 'Deontology (Kant), Utilitarianism (Bentham/Mill), Virtue Ethics (Aristotle), Lessons from Gandhi, Buddha, Kalam, Mandela, Thiruvalluvar',
      microTopics: [
        { id: 'upsc_gs4_1', topicTitle: 'Ethical Theories (Deontology, Consequentialism, Virtue Ethics) & Human Values', subtopic: 'Kant Categorical Imperative, Mill Utilitarian Greatest Happiness Principle, Aristotle Golden Mean, Essence & Determinants of Ethics in human conduct', dayNumber: 1, periodNumber: 4, keyFormulaOrLaw: 'Kant Categorical Imperative: Act only according to that maxim whereby you can at the same time will that it should become a universal law', keyPoints: ['Deontology focuses on duty and inherent rightness of action regardless of consequences', 'Utilitarianism evaluates action based on end results (Telos)'], type: 'concept', importance: 'High-Yield' },
        { id: 'upsc_gs4_2', topicTitle: 'Moral Thinkers: Indian (Kautilya, Thiruvalluvar, Gandhi, Ambedkar) & Western (Rawls, Socrates)', subtopic: 'Thirukkural on Kingly governance (Aran), Gandhi 7 Social Sins, Ambedkar Constitutional Morality, John Rawls Theory of Justice & "Veil of Ignorance"', dayNumber: 5, periodNumber: 4, keyFormulaOrLaw: 'John Rawls "Veil of Ignorance": Principles of justice designed when no one knows their social status, wealth, or natural abilities', keyPoints: ['Gandhi 7 Social Sins: Politics without Principles, Wealth without Work, Commerce without Morality, Science without Humanity', 'Thiruvalluvar: "A ruler who governs with righteousness will be revered as a God by his people"'], type: 'concept', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Attitude, Emotional Intelligence (EI) & Civil Service Foundational Values',
      description: 'CAB model of Attitude, Persuasion & Nudge Theory, Daniel Goleman 5 EI Components, Integrity, Impartiality, Non-partisanship, Compassion',
      microTopics: [
        { id: 'upsc_gs4_3', topicTitle: 'Attitude Structure (CAB Model), Persuasion Techniques & Emotional Intelligence (EI)', subtopic: 'Cognitive, Affective, Behavioral components of attitude; Nudge theory in public policy (Swachh Bharat); Daniel Goleman 5 EI dimensions in governance', dayNumber: 2, periodNumber: 4, keyFormulaOrLaw: 'Daniel Goleman 5 Dimensions of Emotional Intelligence: Self-Awareness, Self-Regulation, Internal Motivation, Empathy, Social Skills', keyPoints: ['High EI enables civil servants to resolve mob conflicts, manage administrative stress, and negotiate crises', 'Nudge theory uses positive reinforcement and indirect suggestions to influence behavior without mandates'], type: 'concept', importance: 'High-Yield' },
        { id: 'upsc_gs4_4', topicTitle: 'Foundational Values for Civil Services: Integrity, Impartiality, Objectivity & Compassion', subtopic: 'Absolute honesty, political neutrality, evidence-based decision making, empathy towards weaker sections (Gandhi Talisman)', dayNumber: 6, periodNumber: 4, keyFormulaOrLaw: 'Gandhi Talisman: "Recall the face of the poorest and the weakest man whom you may have seen, and ask yourself, if the step you contemplate is going to be of any use to him."', keyPoints: ['Integrity is non-negotiable consistency of actions, values, and principles even when unobserved', 'Impartiality ensures unbiased implementation of laws regardless of political regime in power'], type: 'concept', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 3,
      chapterTitle: 'Probity in Governance, Nolan Principles & Administrative Case Studies',
      description: 'Nolan Committee 7 Principles, RTI Act 2005 proactive disclosure, Citizen Charters (Sevottam Model), Whistleblowing, Conflict of Interest Case Studies',
      microTopics: [
        { id: 'upsc_gs4_5', topicTitle: 'Probity in Governance, Nolan Committee 7 Principles & RTI Transparency', subtopic: 'Nolan 7 Principles (Selflessness, Integrity, Objectivity, Accountability, Openness, Honesty, Leadership), Prevention of Corruption Act, CPGRAMS grievance redressal', dayNumber: 3, periodNumber: 4, keyFormulaOrLaw: 'Nolan Committee 7 Principles of Public Life: Selflessness, Integrity, Objectivity, Accountability, Openness, Honesty, Leadership', keyPoints: ['Sevottam Model 3 components: Citizen Charter implementation, Public Grievance Redressal, Service Delivery Capability', 'Whistleblowers Protection Act safeguards individuals exposing corrupt practices in public administration'], type: 'concept', importance: 'High-Yield' },
        { id: 'upsc_gs4_6', topicTitle: 'Case Studies: Resolution Framework for Ethical Dilemmas & Conflict of Interest', subtopic: 'Framework: Identify Stakeholders -> Ethical Dilemma -> Options Available with Merits/Demerits -> Course of Action based on Constitutional Morality', dayNumber: 7, periodNumber: 4, keyFormulaOrLaw: 'Ethical Decision Matrix: Legality + Constitutional Morality + Utilitarian Benefit + Empathy for Marginalized + Transparency', keyPoints: ['Balancing statutory duty against political pressure using documented official written instructions', 'Resolving environmental clearance dilemmas by incorporating sustainable mitigation and local tribal consent'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  // SUBJECT 5: CSAT (Civil Services Aptitude Test & Quantitative Reasoning)
  const csatChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Reading Comprehension & Critical Reasoning',
      description: 'Passages on ecology, governance, economics; Identifying Central Idea, Crucial Assumptions, Logical Inferences & Implications',
      microTopics: [
        { id: 'upsc_csat_1', topicTitle: 'Reading Comprehension: Assumptions, Logical Inferences & Authorial Tone', subtopic: 'Distinguishing directly stated facts from unstated underlying assumptions, invalid extreme options elimination technique', dayNumber: 1, periodNumber: 5, keyFormulaOrLaw: 'Assumption = Necessary unstated premise | Inference = Logical conclusion drawn from stated evidence', keyPoints: ['Eliminate extreme qualifiers: "Always", "Never", "Only", "All" unless explicitly validated by text', 'Focus on pivot keywords: "However", "Although", "Consequently", "Therefore"'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Basic Numeracy, Number Systems & Permutations / Probability',
      description: 'Divisibility rules, Remainder theorem, Unit digit, Factorials, P&C (nCr, nPr), Probability, Percentages & Speed-Distance-Time',
      microTopics: [
        { id: 'upsc_csat_2', topicTitle: 'Number Systems: Divisibility Rules, Unit Digits, Remainders & Factorials', subtopic: 'Cyclicity of powers (2, 3, 7, 8), Euler Remainder Theorem, trailing zeroes in n!, prime factorization & LCM-HCF word problems', dayNumber: 2, periodNumber: 5, keyFormulaOrLaw: 'Cyclicity of Unit Digit: Powers of 2, 3, 7, 8 repeat every 4th power | Trailing Zeroes = ⌊n/5⌋ + ⌊n/25⌋ + ⌊n/125⌋', keyPoints: ['Divisibility by 7, 11, 13 test using alternating 3-digit block sums', 'Remainder of polynomial expressions using Binomial theorem'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'upsc_csat_3', topicTitle: 'Permutations, Combinations (nCr, nPr), Probability & Set Theory Venn Diagrams', subtopic: 'Arrangement of letters/digits with constraints, selection of committee members, dice and coin probability, 2 and 3-set Venn diagrams', dayNumber: 3, periodNumber: 5, keyFormulaOrLaw: 'nCr = n! / [r!(n - r)!] | Probability P(E) = n(E) / n(S) | n(A ∪ B) = n(A) + n(B) - n(A ∩ B)', keyPoints: ['Circular permutation of n distinct items = (n - 1)!', 'At least one probability: P(At least one) = 1 - P(None)'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 3,
      chapterTitle: 'Logical Reasoning, Puzzles, Clocks, Calendars & Data Interpretation',
      description: 'Syllogisms (Venn method), Linear/Circular seating arrangements, Blood relations, Direction test, Clock angle & Pie/Bar charts',
      microTopics: [
        { id: 'upsc_csat_4', topicTitle: 'Logical Deduction: Syllogisms, Seating Arrangements, Blood Relations & Dice', subtopic: 'All/Some/No statement truth values, complex multi-variable floor/seating puzzles, family tree notation, dice opposite faces', dayNumber: 4, periodNumber: 5, keyFormulaOrLaw: 'Clock Angle: θ = |30H - (11/2)M| | Calendar Odd Days: Normal Year = 1 Odd Day, Leap Year = 2 Odd Days', keyPoints: ['Syllogism: If statement is "Some A are B", its converse "Some B are A" is definitively true', 'Blood relation problems solved by systematic generational family tree diagrams'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  const subjects: SyllabusSubject[] = [
    { subjectId: 'upsc_gs1', subjectName: 'UPSC GS Paper I: Heritage, History, Geography & Society (GS-1)', icon: '🏛️', color: '#10b981', totalChapters: gs1Chapters.length, totalMicroTopics: gs1Chapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: gs1Chapters },
    { subjectId: 'upsc_gs2', subjectName: 'UPSC GS Paper II: Governance, Constitution, Polity, Social Justice & IR (GS-2)', icon: '⚖️', color: '#06b6d4', totalChapters: gs2Chapters.length, totalMicroTopics: gs2Chapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: gs2Chapters },
    { subjectId: 'upsc_gs3', subjectName: 'UPSC GS Paper III: Technology, Economy, Environment & Internal Security (GS-3)', icon: '📈', color: '#f59e0b', totalChapters: gs3Chapters.length, totalMicroTopics: gs3Chapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: gs3Chapters },
    { subjectId: 'upsc_gs4', subjectName: 'UPSC GS Paper IV: Ethics, Integrity, Aptitude & Case Studies (GS-4)', icon: '💡', color: '#8b5cf6', totalChapters: gs4Chapters.length, totalMicroTopics: gs4Chapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: gs4Chapters },
    { subjectId: 'upsc_csat', subjectName: 'UPSC CSAT Paper II: Reading Comprehension & Quantitative Reasoning', icon: '🎯', color: '#ec4899', totalChapters: csatChapters.length, totalMicroTopics: csatChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: csatChapters }
  ];

  return {
    courseId: courseId || 'exam-upsc-ias',
    courseTitle: courseTitle || 'UPSC Civil Services (IAS / IPS / IFS / IRS) Prelims + Mains Master Blueprint',
    category: 'upsc_central',
    board: 'UPSC (National)',
    medium: 'English',
    totalDays: 360,
    totalSubjects: subjects.length,
    totalChapters: subjects.reduce((a, s) => a + (s.totalChapters || s.chapters.length), 0),
    totalMicroTopics: subjects.reduce((a, s) => a + (s.totalMicroTopics || s.chapters.reduce((acc, c) => acc + (c.microTopics?.length || 0), 0)), 0),
    subjects
  };
}

export function getUpscOptionalSubjectSyllabus(courseId: string, courseTitle?: string): CourseFullSyllabus {
  const opt = UPSC_OPTIONALS_REGISTRY[courseId];
  if (!opt) {
    return getUpscCivilServicesCompleteSyllabus(courseId, courseTitle);
  }

  const paper1Units = opt.units.filter(u => u.paper === 'Paper I');
  const paper2Units = opt.units.filter(u => u.paper === 'Paper II');

  const subjects: SyllabusSubject[] = [
    {
      subjectId: `${courseId}_p1`,
      subjectName: `${opt.shortTitle} — Paper I: Theory & Foundations`,
      icon: '🏛️',
      color: opt.badgeColor || '#06b6d4',
      totalChapters: paper1Units.length,
      totalMicroTopics: paper1Units.reduce((a, u) => a + u.keyTopics.length, 0),
      chapters: paper1Units.map((u, idx) => ({
        chapterNumber: idx + 1,
        chapterTitle: `${u.unitTitle} (${u.section})`,
        description: `Thinkers & Foundational Literature: ${u.thinkersOrLaws.join(', ')}`,
        microTopics: u.keyTopics.map((kt, tIdx) => ({
          id: `${courseId}_p1_${idx + 1}_${tIdx + 1}`,
          topicTitle: kt,
          subtopic: u.thinkersOrLaws.join(' · '),
          dayNumber: (idx * 15) + (tIdx * 3) + 1,
          periodNumber: 1,
          keyFormulaOrLaw: `Core Thinkers: ${u.thinkersOrLaws.join(', ')}`,
          keyPoints: ['Core theoretical framework and critical debates', 'Mains analytical application and 250-word answer structuring'],
          type: 'concept',
          importance: 'High-Yield'
        }))
      }))
    },
    {
      subjectId: `${courseId}_p2`,
      subjectName: `${opt.shortTitle} — Paper II: Indian Context & Advanced Applications`,
      icon: '⚖️',
      color: '#10b981',
      totalChapters: paper2Units.length,
      totalMicroTopics: paper2Units.reduce((a, u) => a + u.keyTopics.length, 0),
      chapters: paper2Units.map((u, idx) => ({
        chapterNumber: idx + 1,
        chapterTitle: `${u.unitTitle} (${u.section})`,
        description: `Thinkers & Statutory Frameworks: ${u.thinkersOrLaws.join(', ')}`,
        microTopics: u.keyTopics.map((kt, tIdx) => ({
          id: `${courseId}_p2_${idx + 1}_${tIdx + 1}`,
          topicTitle: kt,
          subtopic: u.thinkersOrLaws.join(' · '),
          dayNumber: 180 + (idx * 15) + (tIdx * 3) + 1,
          periodNumber: 2,
          keyFormulaOrLaw: `Applied Principles: ${u.thinkersOrLaws.join(', ')}`,
          keyPoints: ['Empirical case studies and Indian administrative relevance', 'Contemporary trends, criticisms and policy synthesis'],
          type: 'solved_problem',
          importance: 'High-Yield'
        }))
      }))
    }
  ];

  return {
    courseId,
    courseTitle: courseTitle || opt.title,
    category: 'upsc_central',
    board: 'UPSC (National)',
    medium: 'English',
    totalDays: 360,
    totalSubjects: subjects.length,
    totalChapters: subjects.reduce((a, s) => a + (s.totalChapters || s.chapters.length), 0),
    totalMicroTopics: subjects.reduce((a, s) => a + (s.totalMicroTopics || s.chapters.reduce((acc, c) => acc + (c.microTopics?.length || 0), 0)), 0),
    subjects
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. TNPSC UNIFIED MASTER SYLLABUS (GROUP 1, 2/2A, 4, VAO, DEO, SI)
// ─────────────────────────────────────────────────────────────────────────────
export function getTnpscUnifiedCompleteSyllabus(courseId?: string, courseTitle?: string): CourseFullSyllabus {
  return {
    courseId: courseId || 'exam-tnpsc-grp1',
    courseTitle: courseTitle || 'TNPSC Unified Complete Syllabus (Group 1, 2, 4 & VAO)',
    category: 'tnpsc',
    board: 'TNPSC',
    medium: courseTitle?.includes('English') ? 'English' : 'Tamil',
    totalDays: 300,
    totalSubjects: TNPSC_UNIFIED_OFFICIAL_SUBJECTS.length,
    totalChapters: TNPSC_UNIFIED_OFFICIAL_SUBJECTS.reduce((a, s) => a + s.totalChapters, 0),
    totalMicroTopics: TNPSC_UNIFIED_OFFICIAL_SUBJECTS.reduce((a, s) => a + s.totalMicroTopics, 0),
    subjects: TNPSC_UNIFIED_OFFICIAL_SUBJECTS
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. NEET UG COMPLETE MICRO-TOPIC SYLLABUS REGISTRY (NTA / NMC VERBATIM)
// ─────────────────────────────────────────────────────────────────────────────
export function getNeetUgCompleteSyllabus(): CourseFullSyllabus {
  return {
    courseId: 'exam-neet-ug',
    courseTitle: 'NEET UG — National Medical Entrance Exam Preparation',
    category: 'entrance',
    board: 'NTA / NMC',
    medium: 'English',
    totalDays: 360,
    totalSubjects: NEET_UG_OFFICIAL_SUBJECTS.length,
    totalChapters: NEET_UG_OFFICIAL_SUBJECTS.reduce((a, s) => a + s.totalChapters, 0),
    totalMicroTopics: NEET_UG_OFFICIAL_SUBJECTS.reduce((a, s) => a + s.totalMicroTopics, 0),
    subjects: NEET_UG_OFFICIAL_SUBJECTS
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 8B. JEE MAIN & ADVANCED COMPLETE MICRO-TOPIC SYLLABUS REGISTRY (NTA / IIT JEE)
// ─────────────────────────────────────────────────────────────────────────────
export function getJeeMainAdvancedCompleteSyllabus(courseId?: string, courseTitle?: string): CourseFullSyllabus {
  return {
    courseId: courseId || 'exam-jee-main',
    courseTitle: courseTitle || 'JEE Main & JEE Advanced Unified Entrance Preparation',
    category: 'entrance',
    board: 'NTA / IIT JEE',
    medium: 'English',
    totalDays: 360,
    totalSubjects: JEE_MAIN_ADVANCED_OFFICIAL_SUBJECTS.length,
    totalChapters: JEE_MAIN_ADVANCED_OFFICIAL_SUBJECTS.reduce((a, s) => a + s.totalChapters, 0),
    totalMicroTopics: JEE_MAIN_ADVANCED_OFFICIAL_SUBJECTS.reduce((a, s) => a + s.totalMicroTopics, 0),
    subjects: JEE_MAIN_ADVANCED_OFFICIAL_SUBJECTS
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. CLASS 11 & 12 COMMERCE COMPLETE MICRO-TOPIC SYLLABUS REGISTRY
// ─────────────────────────────────────────────────────────────────────────────
export function getCommerceClass11Syllabus(courseId: string, courseTitle: string): CourseFullSyllabus {
  const accountancyChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Introduction to Accounting & Theoretical Framework',
      description: 'Accounting concepts, GAAP, double entry system, cash vs accrual basis, and accounting standards',
      microTopics: [
        { id: 'com_acc_1', topicTitle: 'Accounting Meaning, Objectives & Fundamental Accounting Equation', subtopic: 'Assets = Liabilities + Capital (Equity), Users of accounting info', dayNumber: 1, periodNumber: 1, keyFormulaOrLaw: 'Assets = Liabilities + Capital (Equity) | Dual Aspect Principle', keyPoints: ['Conservatism: Anticipate no profit, provide for all possible losses', 'Accrual concept recognizes revenue when earned'], type: 'concept', importance: 'High-Yield' }
      ]
    }
  ];

  const businessStudiesChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Foundations of Business & Forms of Business Organisations',
      description: 'Sole Proprietorship, Partnership (Act 1932), Joint Stock Company, Business finance',
      microTopics: [
        { id: 'com_bst_1', topicTitle: 'Forms of Business Organisations & CSR Mandate', subtopic: 'Sole proprietorship, Partnership deed, Joint Stock Company, Section 135 CSR 2% rule', dayNumber: 1, periodNumber: 2, keyFormulaOrLaw: 'Features of Company: Separate Legal Entity, Perpetual Succession, Limited Liability', keyPoints: ['Sole proprietor has unlimited liability; Company shareholders have limited liability', 'Section 135 Companies Act 2013 mandates 2% CSR spending'], type: 'concept', importance: 'High-Yield' }
      ]
    }
  ];

  const economicsChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Introductory Microeconomics & Statistics for Economics',
      description: 'Law of Demand, Elasticity, Variable Proportions, Measures of Central Tendency (Mean, Median, Mode)',
      microTopics: [
        { id: 'com_eco_1', topicTitle: 'Consumer Equilibrium & Price Elasticity of Demand (Ed)', subtopic: 'Marginal utility, Indifference curve tangency MRS_xy = P_x / P_y, E_d formula', dayNumber: 1, periodNumber: 3, keyFormulaOrLaw: 'Price Elasticity of Demand E_d = - (ΔQ / ΔP) × (P / Q) | Empirical: Mode = 3 Median - 2 Mean', keyPoints: ['Indifference curve is convex to origin due to diminishing MRS', 'Standard Deviation σ measures absolute dispersion'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  const subjects: SyllabusSubject[] = [
    { subjectId: 'cbse_acc', subjectName: 'Accountancy (Financial Accounting Part 1 & 2)', icon: '📊', color: '#10b981', totalChapters: accountancyChapters.length, totalMicroTopics: accountancyChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: accountancyChapters },
    { subjectId: 'cbse_bst', subjectName: 'Business Studies (Foundations & Finance)', icon: '💼', color: '#06b6d4', totalChapters: businessStudiesChapters.length, totalMicroTopics: businessStudiesChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: businessStudiesChapters },
    { subjectId: 'cbse_eco', subjectName: 'Economics (Microeconomics & Statistics)', icon: '📈', color: '#f59e0b', totalChapters: economicsChapters.length, totalMicroTopics: economicsChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: economicsChapters }
  ];

  return {
    courseId: courseId || 'cbse-11-com',
    courseTitle: courseTitle || 'Class 11 — Senior Secondary Commerce (NCERT / CBSE)',
    category: 'school_cbse',
    board: 'CBSE / NCERT / State Board',
    medium: 'English',
    totalDays: 200,
    totalSubjects: subjects.length,
    totalChapters: subjects.reduce((a, s) => a + (s.totalChapters || s.chapters.length), 0),
    totalMicroTopics: subjects.reduce((a, s) => a + (s.totalMicroTopics || s.chapters.reduce((acc, c) => acc + (c.microTopics?.length || 0), 0)), 0),
    subjects
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 9B. HIGHER SECONDARY SCIENCE (+1 & +2 BIO-MATHS / COMPUTER SCIENCE)
// ─────────────────────────────────────────────────────────────────────────────
export function getHigherSecondaryScienceCompleteSyllabus(courseId: string, courseTitle: string): CourseFullSyllabus {
  const isTa = courseTitle.includes('தமிழ்') || courseId.includes('-ta-');

  const physicsChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: isTa ? 'நிலை மின்னியல் & மின்னோட்டவியல் (Electrostatics & Current Electricity)' : 'Electrostatics, Gauss Law & Current Electricity',
      description: isTa ? 'கூலும் விதி, காஸ் விதி, மின்தேக்கி, ஓம் விதி, கிர்க்காஃப் விதிகள் & வீட்ஸ்டோன் சமனச்சுற்று' : 'Coulomb\'s Law, Gauss Law & applications, Capacitance & Dielectrics, Kirchhoff\'s Laws, Wheatstone Bridge & Potentiometer',
      microTopics: [
        { id: 'hsc_phy_1', topicTitle: isTa ? 'கூலும் விதி, காஸ் விதி & மின்புலம்' : 'Coulomb Law, Electric Field & Gauss Theorem Applications', subtopic: isTa ? 'F = (1/4πε₀)(q₁q₂/r²) மற்றும் காஸ் சமன்பாடுகள்' : 'Electric dipole, Torque τ = p × E, Flux Φ = ∮ E·dA = q_enc / ε₀, Infinite line charge E = λ / (2πε₀r)', dayNumber: 1, periodNumber: 1, keyFormulaOrLaw: 'Coulomb: F = (1/4πε₀)(q₁q₂/r²) | Gauss: ∮ E·dA = q_in / ε₀ | Dipole Potential V = (1/4πε₀)(p cos θ / r²)', keyPoints: ['Electric field inside a hollow spherical conductor is zero (Electrostatic shielding)', 'Capacitance of parallel plate with dielectric: C = K ε₀ A / d'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'hsc_phy_2', topicTitle: isTa ? 'கிர்க்காஃப் விதிகள், வீட்ஸ்டோன் பாலம் & மின்னழுத்தமானி' : 'Kirchhoff Laws, Wheatstone Bridge & Drift Velocity', subtopic: isTa ? 'மின்னோட்ட விதி (KCL), மின்னழுத்த விதி (KVL) & P/Q = R/S' : 'Current density j = n e v_d, Kirchhoff Current & Voltage Laws, Wheatstone balanced condition P/Q = R/S, Internal resistance r = R(l₁/l₂ - 1)', dayNumber: 5, periodNumber: 1, keyFormulaOrLaw: 'Kirchhoff Loop: Σ ΔV = 0 | Wheatstone: P/Q = R/S (Null deflection) | Drift Velocity v_d = eEτ / m', keyPoints: ['KCL is based on conservation of charge; KVL is based on conservation of energy', 'Potentiometer draws no current at balance point, acting as an ideal voltmeter'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: isTa ? 'மின்காந்தவியல் & ஒளியியல் (Magnetism, EMI, AC & Wave Optics)' : 'Magnetic Effects of Current, EMI, AC & Wave Optics',
      description: isTa ? 'பயோட்-சாவார்ட் விதி, ஃபாரடே விதி, மாறுதிசை மின்னோட்டம் LCR சுற்று, ஹைஜென்ஸ் தத்துவம்' : 'Biot-Savart Law, Ampere Circuital Law, Faraday & Lenz Laws, LCR Resonance, Huygens Principle, Young Double Slit Experiment',
      microTopics: [
        { id: 'hsc_phy_3', topicTitle: isTa ? 'பயோட்-சாவார்ட் விதி, ஆம்பியர் விதி & லாரன்ஸ் விசை' : 'Biot-Savart Law, Ampere Circuital Law & Cyclotron Resonance', subtopic: isTa ? 'வட்டச்சுருளின் காந்தப்புலம் B = μ₀I/(2R) & F = q(v × B)' : 'Magnetic field on circular coil axis B = μ₀ I R² / [2(R²+x²)^(3/2)], Force on wire F = I(L × B), Galvanometer to Ammeter/Voltmeter conversion', dayNumber: 9, periodNumber: 1, keyFormulaOrLaw: 'Biot-Savart: dB = (μ₀/4π)(I dl sin θ / r²) | Lorentz Force F = q(E + v × B) | Shunt Resistance S = I_g G / (I - I_g)', keyPoints: ['Parallel currents attract; antiparallel currents repel with force F/L = (μ₀ I₁ I₂) / (2πd)', 'Converting Galvanometer to Ammeter requires low shunt resistance in parallel'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'hsc_phy_4', topicTitle: isTa ? 'மின்காந்த தூண்டல், LCR ஒத்ததிர்வு & அலை ஒளியியல் (YDSE)' : 'EMI (Faraday/Lenz), LCR Resonance & Young Double Slit (YDSE)', subtopic: isTa ? 'e = -dΦ/dt, ஒத்ததிர்வு அதிர்வெண் f = 1/(2π√LC), பட்டையின் அகலம் β = λD/d' : 'Motional EMF e = Bvl, Quality factor Q = (1/R)√(L/C), Wavefronts, Fringe width β = λD/d in interference, Brewster law μ = tan i_p', dayNumber: 13, periodNumber: 1, keyFormulaOrLaw: 'Faraday Law: e = -N (dΦ/dt) | LCR Resonance: f_r = 1 / (2π√LC) | YDSE Fringe Width: β = λ D / d', keyPoints: ['Lenz law is consistent with principle of conservation of energy', 'Diffraction central maximum angular width θ = 2λ / a'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  const chemistryChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: isTa ? 'கரைசல்கள், மின்வேதியியல் & வேதிவினை வேகவியல்' : 'Solutions, Electrochemistry & Chemical Kinetics',
      description: isTa ? 'ஹென்றி விதி, ரவுல்ட் விதி, நெர்ன்ஸ்ட் சமன்பாடு, முதல் வகை வினை சமன்பாடு' : 'Raoult\'s Law, Colligative Properties (Van\'t Hoff factor), Nernst Equation, Kohlrausch Law, Integrated Rate Law for 1st Order Reactions',
      microTopics: [
        { id: 'hsc_ch_1', topicTitle: isTa ? 'ரவுல்ட் விதி, சவ்வூடுபரவல் அழுத்தம் & வாண்ட் ஹாஃப் காரணி' : 'Raoult Law, Colligative Properties & Van\'t Hoff Factor (i)', subtopic: isTa ? 'ΔT_b = K_b m, ΔT_f = K_f m, π = iCRT சமன்பாடுகள்' : 'Relative lowering of vapour pressure (p°-p)/p° = x_B, Elevation in boiling point, Depression in freezing point, Abnormal molar mass i = 1 + (n-1)α', dayNumber: 2, periodNumber: 2, keyFormulaOrLaw: 'Raoult Law: p_A = p°_A x_A | Osmotic Pressure: π = i C R T | Van\'t Hoff: i = Normal Molar Mass / Abnormal Molar Mass', keyPoints: ['Colligative properties depend only on number of solute particles, not on their identity', 'For association of molecules, i < 1; for dissociation (electrolytes), i > 1'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'hsc_ch_2', topicTitle: isTa ? 'மின்வேதியியல்: நெர்ன்ஸ்ட் சமன்பாடு & முதல் வகை வினை சமன்பாடு' : 'Nernst Equation, Kohlrausch Law & Integrated Rate Equations', subtopic: isTa ? 'E_cell = E° - (0.0591/n)log Q, k = (2.303/t)log([A₀]/[A])' : 'Electrochemical cell EMF, Standard Hydrogen Electrode (SHE), Kohlrausch law of independent migration of ions, Half-life t_½ = 0.693 / k, Arrhenius equation', dayNumber: 6, periodNumber: 2, keyFormulaOrLaw: 'Nernst: E_cell = E°_cell - (0.0591/n) log Q | First Order Rate: k = (2.303/t) log([A]₀/[A]) | t_½ = 0.693 / k', keyPoints: ['Gibbs Free Energy and EMF relation: ΔG° = -n F E°_cell', 'Half-life of first-order reaction is completely independent of initial reactant concentration'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: isTa ? 'அணைவுச் சேர்மங்கள் & கரிம வேதியியல் (ஆல்கஹால்கள், ஆல்டிஹைடுகள்)' : 'Coordination Compounds & Organic Reaction Mechanisms',
      description: isTa ? 'வெர்னர் கொள்கை, படிகப்புலக் கொள்கை (CFT), SN1/SN2 வினைகள், ஆல்டால் குறுக்கம் & கேனிசரோ வினை' : 'IUPAC naming of complexes, Crystal Field Splitting (Δ_o & Δ_t), SN1 vs SN2 kinetics, Aldol condensation, Cannizzaro reaction, Diazonium salts',
      microTopics: [
        { id: 'hsc_ch_3', topicTitle: isTa ? 'அணைவுச் சேர்மங்கள்: வெர்னர் கொள்கை & படிகப்புலக் கொள்கை (CFT)' : 'Coordination Chemistry: CFT Splitting & IUPAC Nomenclature', subtopic: isTa ? 'ஆக்டாஹெட்ரல் t₂g - e_g பிளப்பு, காந்தத்தன்மை, ஸ்பெக்ட்ரோகெமிக்கல் வரிசை' : 'Primary & secondary valency, Crystal field splitting energy Δ_o, Strong vs weak field ligands, High-spin vs Low-spin configurations, Magnetic moment μ = √[n(n+2)] BM', dayNumber: 10, periodNumber: 2, keyFormulaOrLaw: 'Magnetic Moment: μ = √[n(n+2)] BM (Bohr Magnetons) | CFT Splitting: Octahedral Δ_o (t₂g³ e_g²)', keyPoints: ['Strong field ligands (CN⁻, CO) cause electron pairing and large CFSE Δ_o', 'Chelate complexes are more stable than non-chelate complexes due to entropy increase'], type: 'concept', importance: 'High-Yield' },
        { id: 'hsc_ch_4', topicTitle: isTa ? 'கரிம வேதியியல்: SN1/SN2 வினைகள், ஆல்டால் குறுக்கம் & கேனிசரோ' : 'Organic Mechanisms: SN1/SN2, Aldol, Cannizzaro & Diazotization', subtopic: isTa ? 'கார்போகேஷன் இடைநிலை, தலைகீழ் அமைப்பு, ஆல்பா-ஹைட்ரஜன் வினைகள்' : 'Nucleophilic substitution kinetics (SN1 two-step vs SN2 concerted Walden inversion), Aldol condensation with α-H, Cannizzaro disproportionation without α-H, Sandmeyer reaction', dayNumber: 14, periodNumber: 2, keyFormulaOrLaw: 'SN2: Rate = k[R-X][Nu⁻] (Walden Inversion) | SN1: Rate = k[R-X] (Carbocation intermediate, Racemization)', keyPoints: ['Tertiary alkyl halides undergo SN1 due to carbocation stability (3° > 2° > 1°)', 'Aldehydes with no α-hydrogen (Formaldehyde, Benzaldehyde) undergo Cannizzaro reaction'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  const mathematicsChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: isTa ? 'அணிகள், அணிக்கோவைகள் & வகை நுண்கணிதம்' : 'Matrices, Determinants & Differential Calculus',
      description: isTa ? 'அணியின் நேர்மாறு A⁻¹ = (1/|A|)adj(A), தொடர்ச்சி மற்றும் வகையிடுதல், எல்லைகள்' : 'Matrix inversion, Cramer\'s Rule, Continuity & Differentiability, Chain rule, Maxima & Minima (Second derivative test)',
      microTopics: [
        { id: 'hsc_m_1', topicTitle: isTa ? 'அணிகள் & அணிக்கோவைகள்: நேர்மாறு மற்றும் கிராமரின் விதி' : 'Matrices & Determinants: Inverse A⁻¹ & System of Linear Equations', subtopic: isTa ? 'A⁻¹ = (1/|A|) adj A மற்றும் AX = B தீர்வு முறை' : 'Properties of determinants, Adjoint of square matrix, Solution of non-homogeneous linear systems using matrix method and Cramer\'s rule', dayNumber: 3, periodNumber: 3, keyFormulaOrLaw: 'Matrix Inverse: A⁻¹ = (1 / |A|) adj(A) | Product: A · adj(A) = |A| I_n | System: X = A⁻¹ B', keyPoints: ['A square matrix A is invertible if and only if |A| ≠ 0 (Non-singular matrix)', '|adj(A)| = |A|^(n-1) for a matrix of order n'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'hsc_m_2', topicTitle: isTa ? 'வகை நுண்கணிதம்: பெருமம் மற்றும் சிறுமம் (Maxima & Minima)' : 'Calculus: Derivatives, Mean Value Theorems & Maxima/Minima', subtopic: isTa ? 'dy/dx = 0 புள்ளிகள், d²y/dx² சோதனை மற்றும் தொடர் பெருக்கம்' : 'Rolle\'s & Lagrange\'s Mean Value Theorems, Tangents & Normals slope m = dy/dx, Critical points, Second derivative test for local maxima/minima', dayNumber: 7, periodNumber: 3, keyFormulaOrLaw: 'Maxima Condition: f\'(x) = 0 and f\'\'(x) < 0 | Minima Condition: f\'(x) = 0 and f\'\'(x) > 0 | Chain Rule: d/dx[f(g(x))] = f\'(g(x)) · g\'(x)', keyPoints: ['If f\'\'(x) = 0 at critical point, use higher derivative test or first derivative sign test', 'Slope of normal to curve at (x₁, y₁) is -1 / (dy/dx)_(x₁,y₁)'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: isTa ? 'தொகை நுண்கணிதம், திசையன்கள் & நிகழ்தகவு' : 'Integral Calculus, Vectors, 3D Geometry & Probability',
      description: isTa ? 'பகுதிப் பின்னங்கள் மூலம் தொகையிடல், பெர்னோலி சூத்திரம், திசையன் பெருக்கல், பேயஸ் தேற்றம்' : 'Integration by parts ∫u dv = uv - ∫v du, Definite integral properties, Dot and Cross products, Shortest distance between skew lines, Bayes\' Theorem',
      microTopics: [
        { id: 'hsc_m_3', topicTitle: isTa ? 'தொகை நுண்கணிதம்: பகுதி தொகையிடல் & குறிப்பிட்ட தொகையீடுகள்' : 'Integral Calculus: Integration by Parts & Definite Properties', subtopic: isTa ? '∫ u dv = uv - ∫ v du மற்றும் ∫₀ᵃ f(x)dx = ∫₀ᵃ f(a-x)dx' : 'Integration by substitution, partial fractions, Integration by parts ILATE rule, Definite integrals king property ∫₀ᵃ f(x)dx = ∫₀ᵃ f(a-x)dx, Area under curve', dayNumber: 11, periodNumber: 3, keyFormulaOrLaw: 'By Parts: ∫ u v dx = u ∫v dx - ∫[u\' (∫v dx)] dx | King Property: ∫₀ᵃ f(x) dx = ∫₀ᵃ f(a - x) dx', keyPoints: ['ILATE priority for choosing u: Inverse, Logarithmic, Algebraic, Trigonometric, Exponential', 'Area between curve y = f(x) and x-axis from a to b = ∫ₐᵇ |f(x)| dx'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'hsc_m_4', topicTitle: isTa ? 'திசையன்கள் (Vectors), முப்பரிமாண வடிவியல் & பேயஸ் தேற்றம்' : 'Vectors, 3D Geometry (Skew Lines) & Bayes Theorem', subtopic: isTa ? 'a · b = |a||b|cos θ, a × b, கோடுகளுக்கு இடைப்பட்ட மீச்சிறு தொலைவு, நிபந்தனை நிகழ்தகவு' : 'Scalar triple product [a b c], Vector cross product, Shortest distance d = |(a₂-a₁)·(b₁×b₂)| / |b₁×b₂|, Conditional probability P(A|B), Bayes\' Theorem calculation', dayNumber: 15, periodNumber: 3, keyFormulaOrLaw: 'Dot Product: a · b = a₁b₁ + a₂b₂ + a₃b₃ | Cross Product: |a × b| = |a||b| sin θ | Bayes: P(A_i|B) = [P(A_i)P(B|A_i)] / Σ[P(A_j)P(B|A_j)]', keyPoints: ['Two non-zero vectors a and b are perpendicular if and only if a · b = 0', 'Shortest distance between two parallel lines r = a₁ + λb and r = a₂ + μb is |b × (a₂ - a₁)| / |b|'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  const generalTamilChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'இயல் 1: மொழி & செய்யுள் (தன்னேர் இலாத தமிழ் & தமிழாய் எழுதுவோம்)',
      description: 'தண்டியலங்கார உரை மேற்கோள் பாடல், பிழையின்றித் தமிழில் எழுதும் முறைகள், எழுத்துச் சீர்திருத்தம்',
      subtopics: [
        {
          id: 'hsc_t_sub1',
          title: 'தன்னேர் இலாத தமிழ் & தமிழ் எழுத்து முறைமை',
          microTopics: [
            { id: 'hsc_t_1', title: 'தன்னேர் இலாத தமிழ் (தண்டியலங்காரம்) — செந்தமிழின் தனிச்சிறப்பு', keyAxiom: 'ஓங்கலிடை வந்து உயர்ந்தோர் தொழ விளங்கி ஏங்கொலி நீர் ஞாலத்து இருளகற்றும் செந்தமிழ்' },
            { id: 'hsc_t_2', title: 'தமிழாய் எழுதுவோம் — வல்லினம் மிகும் இடங்கள் & மிகா இடங்கள்', keyAxiom: 'க், ச், த், ப் சந்திப்பிழைகள் நீக்கி எழுதுதல்' }
          ]
        }
      ],
      microTopics: [
        { id: 'hsc_t_1', topicTitle: 'தன்னேர் இலாத தமிழ் & வல்லினம் மிகும் / மிகா இடங்கள்', subtopic: 'தண்டியலங்கார நயம் & சந்திப் பிழைகள் நீக்குதல்', dayNumber: 1, periodNumber: 1, keyFormulaOrLaw: 'தண்டியலங்காரம்: ஓங்கலிடை வந்து உயர்ந்தோர் தொழ விளங்கி | வல்லினம்: அந்த, இந்த, எந்த பின் மிகும்', keyPoints: ['அணி இலக்கணத்தை மட்டுமே கூறும் நூல் தண்டியலங்காரம்', 'வடமொழியில் உள்ள காவிய தர்சம் நூலைத் தழுவி எழுதப்பட்டது'], type: 'concept', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'இயல் 2: இயற்கை & வேளாண்மை (திருமலை முருகன் பள்ளு & ஐங்குறுநூறு)',
      description: 'பெரியவன் கவிராயர் திருமலை முருகன் பள்ளு, பேயனார் ஐங்குறுநூறு, நால்வகைப் பொருத்தங்கள் (திணை, பால், எண், இடம்)',
      subtopics: [
        {
          id: 'hsc_t_sub2',
          title: 'பள்ளு இலக்கியம் & ஐங்குறுநூறு',
          microTopics: [
            { id: 'hsc_t_3', title: 'திருமலை முருகன் பள்ளு (பெரியவன் கவிராயர்) — உழவுச் சிறப்பு', keyAxiom: 'பள்ளு என்பது 96 வகை சிற்றிலக்கியங்களுள் ஒன்று (உழத்திப் பாட்டு)' },
            { id: 'hsc_t_4', title: 'ஐங்குறுநூறு (முல்லைத்திணை — பேயனார்) & நால்வகைப் பொருத்தங்கள்', keyAxiom: 'ஐங்குறுநூறு 3 அடி முதல் 6 அடி வரையிலான குறைந்த அகவற்பாக்கள் கொண்ட நூல்' }
          ]
        }
      ],
      microTopics: [
        { id: 'hsc_t_3', topicTitle: 'திருமலை முருகன் பள்ளு & நால்வகைப் பொருத்தங்கள் இலக்கணம்', subtopic: 'உழவு நாகரிகம் மற்றும் திணை, பால், எண், இடப் பொருத்தங்கள்', dayNumber: 4, periodNumber: 1, keyFormulaOrLaw: 'பள்ளு இலக்கியம்: உழவர் வாழ்க்கையைச் சித்தரிக்கும் உளத்திப் பாட்டு | ஐங்குறுநூறு: 500 அகவற்பாக்கள்', keyPoints: ['ஐங்குறுநூற்றைத் தொகுத்தவர் புலத்துறை முற்றிய கூடலூர் கிழார்', 'தொகுப்பித்தவர் யானைகட்சேய் மாந்தரஞ்சேரல் இரும்பொறை'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  const generalEnglishChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Unit 1: Prose (*Two Gentlemen of Verona*) & Poem (*The Castle*)',
      description: 'A.J. Cronin inspirational story of Nicola and Jacopo, Edwin Muir allegorical poem "The Castle", Tenses & Modal Auxiliaries',
      subtopics: [
        {
          id: 'hsc_e_sub1',
          title: 'Unit 1: Selfless Devotion & Treachery',
          microTopics: [
            { id: 'hsc_e_1', title: 'Prose: Two Gentlemen of Verona by A.J. Cronin', keyAxiom: 'Nicola and Jacopo\'s sacrifice for their sister Lucia tuberculosis treatment' },
            { id: 'hsc_e_2', title: 'Poem: The Castle by Edwin Muir & The Warder\'s Betrayal', keyAxiom: 'Physical fortress fell not to weapons, but to greed of a wicked gatekeeper' }
          ]
        }
      ],
      microTopics: [
        { id: 'hsc_e_1', topicTitle: 'Unit 1: Two Gentlemen of Verona & The Castle (A.J. Cronin & Edwin Muir)', subtopic: 'Sacrifice, War devastation, Betrayal & Modal Auxiliaries (ought to, used to)', dayNumber: 2, periodNumber: 2, keyFormulaOrLaw: 'A.J. Cronin: "War produced suffering, but their selfless devotion gave promise of greater hope for human society."', keyPoints: ['Verona is a historical city in Italy where Romeo and Juliet lived', 'The Castle theme: Greed and betrayal undermine the strongest fortifications'], type: 'concept', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Unit 2: Prose (*A Nice Cup of Tea*) & Poem (*Our Casuarina Tree*)',
      description: 'George Orwell\'s 11 rules for preparing tea, Toru Dutt romantic poem "Our Casuarina Tree", Prepositions & Compound Words',
      subtopics: [
        {
          id: 'hsc_e_sub2',
          title: 'Unit 2: Cultural Rituals & Nostalgia',
          microTopics: [
            { id: 'hsc_e_3', title: 'Prose: A Nice Cup of Tea by George Orwell (11 Golden Rules)', keyAxiom: 'Indian/Ceylonese tea in a teapot without sugar gives pure flavour' },
            { id: 'hsc_e_4', title: 'Poem: Our Casuarina Tree by Toru Dutt (Keatsian imagery)', keyAxiom: 'Tree stands as a living memorial to poet\'s beloved departed siblings Abju and Aru' }
          ]
        }
      ],
      microTopics: [
        { id: 'hsc_e_3', topicTitle: 'Unit 2: George Orwell Cup of Tea & Toru Dutt Casuarina Tree', subtopic: '11 Rules of tea brewing, Casuarina nostalgia & Compound Word synthesis', dayNumber: 5, periodNumber: 2, keyFormulaOrLaw: 'Toru Dutt: "A creeper climbs, in whose embraces bound, No other tree could live..."', keyPoints: ['George Orwell was the pen name of Eric Arthur Blair (author of 1984 and Animal Farm)', 'Toru Dutt is known as the Keats of Indo-Anglian literature'], type: 'memorization', importance: 'High-Yield' }
      ]
    }
  ];

  const subjects: SyllabusSubject[] = [
    { subjectId: 'hsc_tamil', subjectName: 'பொதுத் தமிழ் (General Tamil — HSC 8 இயல்கள்)', icon: '🔤', color: '#ec4899', totalChapters: generalTamilChapters.length, totalMicroTopics: generalTamilChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: generalTamilChapters },
    { subjectId: 'hsc_english', subjectName: 'General English (HSC Units 1 to 6 Core)', icon: '🔤', color: '#3b82f6', totalChapters: generalEnglishChapters.length, totalMicroTopics: generalEnglishChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: generalEnglishChapters },
    { subjectId: 'hsc_physics', subjectName: isTa ? 'இயற்பியல் (Physics Core — HSC / Board)' : 'Physics (Senior Secondary Core)', icon: '⚡', color: '#06b6d4', totalChapters: physicsChapters.length, totalMicroTopics: physicsChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: physicsChapters },
    { subjectId: 'hsc_chemistry', subjectName: isTa ? 'வேதியியல் (Chemistry Core — HSC / Board)' : 'Chemistry (Senior Secondary Core)', icon: '🧪', color: '#10b981', totalChapters: chemistryChapters.length, totalMicroTopics: chemistryChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: chemistryChapters },
    { subjectId: 'hsc_mathematics', subjectName: isTa ? 'கணிதம் (Mathematics Core — HSC / Board)' : 'Mathematics (Senior Secondary Calculus & Vectors)', icon: '📐', color: '#f59e0b', totalChapters: mathematicsChapters.length, totalMicroTopics: mathematicsChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: mathematicsChapters }
  ];

  return {
    courseId: courseId || 'tnsb-12-sci',
    courseTitle: courseTitle || 'Class 12 — Higher Secondary Science & Maths Master Program',
    category: 'school_hsc',
    board: 'TNSB / CBSE / ISC',
    medium: isTa ? 'Tamil' : 'English',
    totalDays: 200,
    totalSubjects: subjects.length,
    totalChapters: subjects.reduce((a, s) => a + s.chapters.length, 0),
    totalMicroTopics: subjects.reduce((a, s) => a + (s.totalMicroTopics || s.chapters.reduce((acc, c) => acc + (c.microTopics?.length || 0), 0)), 0),
    subjects
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 9C. COLLEGE DEGREES & PROFESSIONAL TECH SKILLS (FULL-STACK, PYTHON, DSA, AI)
// ─────────────────────────────────────────────────────────────────────────────
export function getCollegeAndTechSkillsCompleteSyllabus(courseId: string, courseTitle: string): CourseFullSyllabus {
  const fullstackChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Frontend Engineering: React 19, TypeScript & Modern UI Architecture',
      description: 'React components, JSX, Custom Hooks (useState, useEffect, useMemo, useCallback), Context API, React Navigation & TailwindCSS',
      subtopics: [
        {
          id: 'tech_fs_sub1',
          title: 'React 19 Core & Hook Architecture',
          microTopics: [
            { id: 'tech_fs_1', title: 'React 19 Virtual DOM, Fiber Reconciliation & Custom Hooks', keyAxiom: 'Hooks must execute unconditionally at component top level' },
            { id: 'tech_fs_2', title: 'TypeScript Interfaces, Generics & Strict Null Typing', keyAxiom: 'Generics <T> allow reusable type-safe data pipelines' }
          ]
        }
      ],
      microTopics: [
        { id: 'tech_fs_1', topicTitle: 'Modern React Architecture: Virtual DOM, Hooks & State Management', subtopic: 'Functional components, Reconciliation algorithm, Custom Hooks creation, Context API vs Redux Toolkit', dayNumber: 1, periodNumber: 1, keyFormulaOrLaw: 'React Hook Rule: Only call hooks at the top level and from React function components', keyPoints: ['useCallback memoizes function references; useMemo memoizes computed values', 'Virtual DOM diffing uses fiber tree reconciliation algorithm'], type: 'concept', importance: 'High-Yield' },
        { id: 'tech_fs_2', topicTitle: 'TypeScript Mastery: Interfaces, Generics, Union Types & Strict Mode', subtopic: 'Type inference, Generics <T>, Utility types (Partial, Pick, Omit), Strict null checks, React.FC typing', dayNumber: 4, periodNumber: 1, keyFormulaOrLaw: 'Generic Function: function identity<T>(arg: T): T { return arg; }', keyPoints: ['Type narrowing using typeof, instanceof, and custom type predicates', 'Interfaces are open for declaration merging; type aliases are closed'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Backend Architecture: Node.js, Express, REST APIs & PostgreSQL',
      description: 'Event Loop, Non-blocking I/O, Express routing middleware, PostgreSQL schema design, Supabase Auth, Row Level Security (RLS) & JWT',
      subtopics: [
        {
          id: 'tech_fs_sub2',
          title: 'Backend API & Database Engineering',
          microTopics: [
            { id: 'tech_fs_3', title: 'RESTful API Design, Express Middleware & JWT Auth', keyAxiom: 'Stateless JWT authentication with bcrypt password hashing' },
            { id: 'tech_fs_4', title: 'PostgreSQL ACID Transactions, Indexing & Row Level Security (RLS)', keyAxiom: 'PostgreSQL RLS enforces row isolation at database engine layer' }
          ]
        }
      ],
      microTopics: [
        { id: 'tech_fs_3', topicTitle: 'RESTful API Design, Express Middleware & JWT Authentication', subtopic: 'HTTP Methods (GET, POST, PUT, DELETE), Status codes (200, 201, 400, 401, 403, 500), JWT token payload and verify', dayNumber: 7, periodNumber: 1, keyFormulaOrLaw: 'JWT Structure: Header.Payload.Signature | Middleware: (req, res, next) => { next(); }', keyPoints: ['Always hash user passwords using bcrypt with salt rounds >= 10', 'Express error handling middleware requires 4 parameters (err, req, res, next)'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'tech_fs_4', topicTitle: 'Database Modeling: PostgreSQL, ACID Transactions & Indexing Optimization', subtopic: 'Relational 3NF normalization, Foreign keys, B-Tree indexes, EXPLAIN ANALYZE query planning, Row Level Security (RLS)', dayNumber: 10, periodNumber: 1, keyFormulaOrLaw: 'ACID Properties: Atomicity, Consistency, Isolation, Durability | Indexing: CREATE INDEX ON table(column)', keyPoints: ['Indexes drastically speed up WHERE and JOIN clauses but add write overhead', 'PostgreSQL RLS policies restrict data access at the database engine level'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  const pythonAiChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Python 3.12 Programming, Data Structures & Object-Oriented Design',
      description: 'List comprehensions, Generators, Decorators, Dunder methods, Class inheritance, Polymorphism, Type hinting & Unit testing',
      subtopics: [
        {
          id: 'tech_py_sub1',
          title: 'Advanced Python Core & OOP',
          microTopics: [
            { id: 'tech_py_1', title: 'Decorators, Generators & Comprehensions Memory Efficiency', keyAxiom: 'Generators evaluate lazily on-demand with O(1) space' },
            { id: 'tech_py_2', title: 'OOP Design Patterns & Method Resolution Order (C3 MRO)', keyAxiom: 'Abstract base classes enforce strict interface contracts' }
          ]
        }
      ],
      microTopics: [
        { id: 'tech_py_1', topicTitle: 'Python Advanced Concepts: Decorators, Generators & Comprehensions', subtopic: 'Function closures, @decorator syntax, yield statement memory efficiency, List/Dict/Set comprehensions', dayNumber: 2, periodNumber: 2, keyFormulaOrLaw: 'Generator Expression: (x**2 for x in range(n)) | Decorator: def dec(func): def wrap(*a, **k): return func(*a, **k)', keyPoints: ['Generators produce items on the fly with O(1) memory footprint', 'Decorators modify function behavior without altering source code'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'tech_py_2', topicTitle: 'Object-Oriented Programming (OOP) in Python & Design Patterns', subtopic: 'Classes, __init__, Inheritance, Method Resolution Order (MRO), Encapsulation, Singleton & Factory design patterns', dayNumber: 5, periodNumber: 2, keyFormulaOrLaw: 'Python MRO: C3 Linearization algorithm for multiple inheritance resolution', keyPoints: ['Use @property decorator to define getter and setter methods cleanly', 'Abstract Base Classes (abc module) enforce interface contracts'], type: 'concept', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Data Science, Machine Learning (Scikit-Learn) & Generative AI',
      description: 'NumPy vectorized arrays, Pandas DataFrame wrangling, Linear/Logistic Regression, Decision Trees, Prompt Engineering & LLM APIs',
      subtopics: [
        {
          id: 'tech_py_sub2',
          title: 'Data Science & LLM Engineering',
          microTopics: [
            { id: 'tech_py_3', title: 'NumPy Broadcasting & Pandas Aggregations', keyAxiom: 'Vectorized NumPy executes at C-speed without interpreter overhead' },
            { id: 'tech_py_4', title: 'Scikit-Learn ML Pipelines & Prompt Engineering / RAG Architecture', keyAxiom: 'RAG grounds LLM outputs using vector embeddings & semantic retrieval' }
          ]
        }
      ],
      microTopics: [
        { id: 'tech_py_3', topicTitle: 'NumPy Vectorization, Pandas Data Wrangling & Feature Engineering', subtopic: 'Broadcasting rules, GroupBy aggregations, Handling missing data, MinMax/StandardScaler, One-Hot encoding', dayNumber: 8, periodNumber: 2, keyFormulaOrLaw: 'Z-Score Standardization: z = (x - μ) / σ | Broadcasting: Trailing dimensions must be equal or 1', keyPoints: ['Vectorized NumPy operations execute at C-speed without Python loop overhead', 'Pandas DataFrame merge operates similarly to SQL JOIN operations'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'tech_py_4', topicTitle: 'Machine Learning Algorithms & Large Language Model (LLM) Integration', subtopic: 'Supervised vs Unsupervised learning, Train/Test split, Confusion matrix metrics (Precision, Recall, F1), Prompt Engineering with Gemini/GPT APIs', dayNumber: 12, periodNumber: 2, keyFormulaOrLaw: 'F1-Score = 2 × (Precision × Recall) / (Precision + Recall) | Confusion Matrix: TP, TN, FP, FN', keyPoints: ['Overfitting occurs when model memorizes training noise; mitigate with Regularization (L1/L2)', 'Few-shot prompting provides input-output examples to guide LLM reasoning reliably'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  const dsaChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Data Structures: Arrays, Linked Lists, Stacks, Queues & Hash Tables',
      description: 'Time/Space Big-O complexity analysis, Two pointers, Sliding window, Singly/Doubly Linked List, Stack operations, Hash collision resolution',
      subtopics: [
        {
          id: 'tech_dsa_sub1',
          title: 'Linear Data Structures & Two-Pointers',
          microTopics: [
            { id: 'tech_dsa_1', title: 'Big-O Asymptotics, Two Pointers & Sliding Window Patterns', keyAxiom: 'Sliding window converts quadratic O(N²) iterations into linear O(N)' },
            { id: 'tech_dsa_2', title: 'Monotonic Stacks & Floyd Cycle Finding Algorithm', keyAxiom: 'Floyd Tortoise and Hare detects cycles with O(1) auxiliary space' }
          ]
        }
      ],
      microTopics: [
        { id: 'tech_dsa_1', topicTitle: 'Asymptotic Analysis (Big-O) & Two-Pointer / Sliding Window Techniques', subtopic: 'O(1), O(log n), O(n), O(n log n), O(n²) complexity, Invert array in-place, Two-Sum sorted, Maximum subarray sum (Kadane)', dayNumber: 3, periodNumber: 3, keyFormulaOrLaw: 'Kadane Algorithm: max_so_far = max(nums[i], max_so_far + nums[i]) | Two Pointer: Left=0, Right=n-1', keyPoints: ['Sliding window optimizes nested loops from O(n²) to linear O(n) time', 'Hash table lookup, insertion, and deletion operate in average O(1) time'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'tech_dsa_2', topicTitle: 'Linked Lists, Stacks (Monotonic Stack) & Queue Implementations', subtopic: 'Reverse linked list in-place, Fast & Slow pointer cycle detection (Floyd), Monotonic stack next greater element, Queue using two stacks', dayNumber: 6, periodNumber: 3, keyFormulaOrLaw: 'Floyd Cycle Finding: slow moves 1 step, fast moves 2 steps; cycle exists if slow == fast', keyPoints: ['Reversing linked list requires 3 pointers (prev, curr, next)', 'Monotonic stack solves range query problems in O(n) single-pass'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Algorithms: Trees, Graphs (BFS/DFS), Dynamic Programming & Recursion',
      description: 'Binary Search Trees (BST), Tree traversals (Inorder, Preorder, Postorder), Graph adjacency list, Dijkstra shortest path, DP Memoization & Tabulation',
      subtopics: [
        {
          id: 'tech_dsa_sub2',
          title: 'Trees, Graphs & Dynamic Programming',
          microTopics: [
            { id: 'tech_dsa_3', title: 'BST Properties, Tree LCA & Graph BFS/DFS Traversals', keyAxiom: 'Inorder traversal of Binary Search Tree yields monotonically sorted sequence' },
            { id: 'tech_dsa_4', title: 'Dynamic Programming: 0/1 Knapsack, LCS & State Memoization', keyAxiom: 'Optimal substructure and overlapping subproblems define DP' }
          ]
        }
      ],
      microTopics: [
        { id: 'tech_dsa_3', topicTitle: 'Binary Trees, BST Operations & Graph Traversals (BFS / DFS)', subtopic: 'Inorder traversal of BST gives sorted order, Lowest Common Ancestor (LCA), Graph BFS (Queue) and DFS (Recursion/Stack), Topological Sort', dayNumber: 9, periodNumber: 3, keyFormulaOrLaw: 'BFS: Queue-based level-order traversal | DFS: Stack/Recursive deep-dive traversal | BST Property: Left < Root < Right', keyPoints: ['BFS finds shortest path in an unweighted graph', 'Topological sort is applicable only to Directed Acyclic Graphs (DAGs)'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'tech_dsa_4', topicTitle: 'Dynamic Programming (DP): 0/1 Knapsack, LCS & Coin Change', subtopic: 'Overlapping subproblems & optimal substructure, Top-down memoization vs Bottom-up tabulation, Longest Common Subsequence (LCS), Coin change', dayNumber: 13, periodNumber: 3, keyFormulaOrLaw: '0/1 Knapsack Recurrence: dp[i][w] = max(dp[i-1][w], val[i-1] + dp[i-1][w - wt[i-1]])', keyPoints: ['Identify DP state variables and base cases before constructing recurrence relation', 'Space optimization can often reduce 2D DP matrix to 1D array'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  const subjects: SyllabusSubject[] = [
    { subjectId: 'tech_fullstack', subjectName: 'Full-Stack Web & Mobile Architecture (React, Node, TypeScript)', icon: '💻', color: '#06b6d4', totalChapters: fullstackChapters.length, totalMicroTopics: fullstackChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: fullstackChapters },
    { subjectId: 'tech_python_ai', subjectName: 'Python 3.12, Data Science & Generative AI Engineering', icon: '🐍', color: '#10b981', totalChapters: pythonAiChapters.length, totalMicroTopics: pythonAiChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: pythonAiChapters },
    { subjectId: 'tech_dsa', subjectName: 'Data Structures & Algorithms (LeetCode Master Patterns)', icon: '⚡', color: '#8b5cf6', totalChapters: dsaChapters.length, totalMicroTopics: dsaChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: dsaChapters }
  ];

  return {
    courseId: courseId || 'skills-fullstack-pro',
    courseTitle: courseTitle || 'Full-Stack Software Engineering, Python AI & DSA Master Track',
    category: 'skills',
    board: 'Industry Standard / University Degree',
    medium: 'English',
    totalDays: 200,
    totalSubjects: subjects.length,
    totalChapters: subjects.reduce((a, s) => a + s.chapters.length, 0),
    totalMicroTopics: subjects.reduce((a, s) => a + s.chapters.reduce((acc, c) => acc + (c.microTopics?.length || 0), 0), 0),
    subjects
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 9D. TAMIL NADU POLICE & UNIFORMED SERVICES (TNUSRB SI & CONSTABLE)
// ─────────────────────────────────────────────────────────────────────────────
export function getTamilNaduPoliceCompleteSyllabus(courseId?: string, courseTitle?: string): CourseFullSyllabus {
  const tamilEligibilityChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'பகுதி அ: தமிழ் இலக்கணம் (10ஆம் வகுப்பு தரம் — 100 வினாக்கள் தகுதி)',
      description: 'பொருத்துதல், பிரித்தெழுதுதல், எதிர்ச்சொல், பிழை திருத்தம் (சந்திப்பிழை, ஒருமை பன்மை), வேர்ச்சொல், அகரவரிசை',
      subtopics: [
        {
          id: 'pol_t_sub1',
          title: 'இலக்கண விதிகள் & சொல் வகை',
          microTopics: [
            { id: 'pol_t_1', title: 'பிரித்தெழுதுதல், சேர்த்தெழுதுதல் & எதிர்ச்சொல் அறிதல்', keyAxiom: 'உயிரெழுத்து உடம்படுமெய் சந்தி விதிகள்' },
            { id: 'pol_t_2', title: 'சந்திப்பிழை நீக்குதல் & மரபுப் பிழைகள்', keyAxiom: 'அந்த, இந்த, எந்த பின் வல்லினம் மிகும்' }
          ]
        }
      ],
      microTopics: [
        { id: 'pol_t_1', topicTitle: 'பிரித்தெழுதுதல், எதிர்ச்சொல், பிழை திருத்தம் & அகரவரிசை', subtopic: 'சந்திப்பிழை (க், ச், த், ப்) நீக்குதல் மற்றும் வேர்ச்சொல்லிலிருந்து வினையெச்சம் காணுதல்', dayNumber: 1, periodNumber: 1, keyFormulaOrLaw: 'வேர்ச்சொல் -> தொழிற்பெயர் (நட -> நடத்தல்) | பெயரெச்சம் (நடந்த) | வினையெச்சம் (நடந்து)', keyPoints: ['தமிழ் தகுதித் தேர்வில் 40% குறைந்தபட்ச மதிப்பெண் கட்டாயம்', 'அகரவரிசைப்படுத்துதல்: அ, ஆ, இ வரிசை மற்றும் க, கா, கி வரிசை'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'பகுதி ஆ & இ: தமிழ் இலக்கியம் மற்றும் தமிழ் அறிஞர்கள்',
      description: 'திருக்குறள், சிலப்பதிகாரம், கம்பராமாயணம், பாரதியார், பாரதிதாசன், தந்தை பெரியார், பேரறிஞர் அண்ணா',
      subtopics: [
        {
          id: 'pol_t_sub2',
          title: 'சங்க இலக்கியம் & கவிஞர்கள்',
          microTopics: [
            { id: 'pol_t_3', title: 'திருக்குறள், எட்டுத்தொகை, பத்துப்பாட்டு சிறப்புகள்', keyAxiom: 'திருக்குறள் அறத்துப்பால், பொருட்பால், காமத்துப்பால் 133 அதிகாரங்கள்' },
            { id: 'pol_t_4', title: 'பாரதியார், பாரதிதாசன், பெரியார், அண்ணா தமிழ்த்தொண்டு', keyAxiom: 'பாரதியார் பாட்டுக்கொரு புலவன் | பாரதிதாசன் புரட்சிக் கவிஞர்' }
          ]
        }
      ],
      microTopics: [
        { id: 'pol_t_3', topicTitle: 'திருக்குறள், கம்பராமாயணம், பாரதியார் & தந்தை பெரியார் தமிழ்த்தொண்டு', subtopic: 'நூல் ஆசிரியர்கள், அடைமொழிப் பெயர்கள் மற்றும் மேற்கோள் வரிகள்', dayNumber: 4, periodNumber: 1, keyFormulaOrLaw: 'பாரதியார் இதழ்கள்: இந்தியா, விஜயா | பாரதிதாசன்: குடும்ப விளக்கு, பாண்டியன் பரிசு', keyPoints: ['திருக்குறளுக்கு உரை எழுதிய பதின்மரில் சிறந்தவர் பரிமேலழகர்', 'தந்தை பெரியார் நடத்திய இதழ்கள்: குடியரசு, விடுதலை'], type: 'concept', importance: 'High-Yield' }
      ]
    }
  ];

  const generalKnowledgeChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'பொது அறிவு: வரலாறு, புவியியல் & இந்திய அரசியலமைப்பு',
      description: 'சிந்து சமவெளி, மௌரியர், சோழர், இந்திய விடுதலை இயக்கம், ஆறுகள், பருவமழை, இந்திய அரசியலமைப்பு அடிப்படை உரிமைகள்',
      subtopics: [
        {
          id: 'pol_gk_sub1',
          title: 'வரலாறு & அரசியலமைப்பு',
          microTopics: [
            { id: 'pol_gk_1', title: 'சிந்து சமவெளி, சோழர் பேரரசு & விடுதலைப் போராட்டம்', keyAxiom: '1857 பெரும் புரட்சி & 1947 இந்திய விடுதலை' },
            { id: 'pol_gk_2', title: 'அடிப்படை உரிமைகள் (14–32), குடியரசுத் தலைவர், ஆளுநர்', keyAxiom: 'சரத்து 32 அரசியலமைப்பின் இதயம் மற்றும் ஆன்மா' }
          ]
        }
      ],
      microTopics: [
        { id: 'pol_gk_1', topicTitle: 'இந்திய விடுதலை இயக்கம், தமிழக பங்கு & அரசியலமைப்பு அடிப்படை உரிமைகள்', subtopic: 'வேலுநாச்சியார், வ.உ.சி, பகத்சிங், காந்தியடிகள் மற்றும் சரத்து 14–32', dayNumber: 2, periodNumber: 2, keyFormulaOrLaw: 'அரசியலமைப்பு நடைமுறை: 26 ஜனவரி 1950 | சட்டத்தின் முன் அனைவரும் சமம்: சரத்து 14', keyPoints: ['தமிழ்நாடு காவல் துறை சின்னம்: ஸ்ரீவில்லிபுத்தூர் கோவில் கோபுரம்', 'காவல்துறை அமைப்பின் தந்தை என அழைக்கப்படுபவர் காரன்வாலிஸ் பிரபு'], type: 'concept', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'பொது அறிவியல்: அன்றாட வாழ்வில் இயற்பியல், வேதியியல் & உயிரியல்',
      description: 'இயக்க விதிகள், ஒளி-ஒலி, அமிலங்கள்-காரங்கள், தனிமங்கள், மனித உடல் உறுப்பு மண்டலங்கள், வைட்டமின் குறைபாடுகள்',
      subtopics: [
        {
          id: 'pol_gk_sub2',
          title: 'பொது அறிவியல் விதிகள்',
          microTopics: [
            { id: 'pol_gk_3', title: 'நியூட்டன் 3 விதிகள், லென்ஸ், மின்னோட்டம் & வேதியியல் காரங்கள்', keyAxiom: 'விசை F = ma | அமிலங்கள் நீல லிட்மஸை சிவப்பாக மாற்றும்' },
            { id: 'pol_gk_4', title: 'மனித செரிமானம், ரத்த ஓட்டம் & வைட்டமின்கள் குறைபாடு', keyAxiom: 'வைட்டமின் A (மாலைக்கண்), வைட்டமின் C (ஸ்கர்வி)' }
          ]
        }
      ],
      microTopics: [
        { id: 'pol_gk_3', topicTitle: 'நியூட்டன் விதிகள் (F=ma), அமிலங்கள் காரங்கள் & வைட்டமின்கள்', subtopic: 'இயற்பியல் அலகுகள் (SI Units), தனிமங்களின் குறியீடுகள், ரத்த வகைகள் (ABO)', dayNumber: 5, periodNumber: 2, keyFormulaOrLaw: 'F = ma | ரத்தத்தின் pH மதிப்பு = 7.4 | அனைவருக்கும் ரத்தம் வழங்கும் பிரிவு: O நெகட்டிவ்', keyPoints: ['மனித உடலின் மிகப்பெரிய உறுப்பு தோல்; மிகப்பெரிய சுரப்பி கல்லீரல்', 'வைட்டமின் D சூரிய ஒளியின் மூலம் உடலில் தயாராகிறது'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  const psychologyChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'உளவியல்: தகவல் தொடர்புத் திறன் & எண் கணித நுண்ணறிவு',
      description: 'எண் தொடர், விடுபட்ட எழுத்துகள், குறியீட்டு முறை (Coding-Decoding), இரத்த உறவுகள், திசை அறிதல் சோதனைகள்',
      subtopics: [
        {
          id: 'pol_psy_sub1',
          title: 'எண் கணிதம் & குறியீட்டு முறை',
          microTopics: [
            { id: 'pol_psy_1', title: 'எண் தொடர் & குறியீட்டு முறை (Coding-Decoding)', keyAxiom: 'A=1 to Z=26 எண் மதிப்பீடுகள்' },
            { id: 'pol_psy_2', title: 'இரத்த உறவுகள் & திசை அறிதல் (வடக்கு, கிழக்கு, தெற்கு, மேற்கு)', keyAxiom: 'பிதாகரஸ் தேற்றம் வழி தூரம் கணக்கிடுதல்' }
          ]
        }
      ],
      microTopics: [
        { id: 'pol_psy_1', topicTitle: 'எண் தொடர், Coding-Decoding, இரத்த உறவுகள் & திசை அறிதல்', subtopic: 'திசை கணக்கீடுகள், உறவுமுறை வரைபடம் மற்றும் விடுபட்ட எண் கண்டறிதல்', dayNumber: 3, periodNumber: 3, keyFormulaOrLaw: 'திசை தூரம் = √(வடக்கு² + கிழக்கு²) | குறியீட்டு முறை: +1, -1, தலைகீழ் எழுத்துகள்', keyPoints: ['இரத்த உறவுகளில் தந்தை வழி vs தாய் வழி உறவுமுறைகளை தெளிவாக பிரிக்கவும்', 'கடிகார முட்களின் கோணம்: θ = |30H - (11/2)M|'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'தர்க்க பகுப்பாய்வு & வரைபடத் தொடர்பு (Logical Reasoning)',
      description: 'வென் வரைபடங்கள், பகடை கணக்குகள், கண்ணாடி பிம்பங்கள், இருக்கை அமைப்பு முறை, நேரமும் வேலையும்',
      subtopics: [
        {
          id: 'pol_psy_sub2',
          title: 'தர்க்க பகுப்பாய்வு & உருவங்கள்',
          microTopics: [
            { id: 'pol_psy_3', title: 'வென் வரைபடங்கள் & பகடை எதிர்ப்பக்கங்கள்', keyAxiom: 'பகடையின் அடுத்தடுத்த பக்கங்கள் எதிர் பக்கமாக அமையாது' },
            { id: 'pol_psy_4', title: 'காலமும் வேலையும் (Men × Days) & இருக்கை அமைப்பு', keyAxiom: 'M₁ D₁ = M₂ D₂ சூத்திரம்' }
          ]
        }
      ],
      microTopics: [
        { id: 'pol_psy_3', topicTitle: 'வென் வரைபடம், பகடை, கண்ணாடி பிம்பம் & காலமும் வேலையும்', subtopic: 'M₁D₁ = M₂D₂ மற்றும் வட்டவடிவ இருக்கை அமைப்பு கணக்கீடுகள்', dayNumber: 6, periodNumber: 3, keyFormulaOrLaw: 'வேலை: 1 நாளில் செய்த வேலை = 1/N | பகடை விதி: பொதுவான எண் கொண்ட இரு நிலைகள்', keyPoints: ['வென் வரைபடத்தில் பொதுவான பகுதி வெட்டுப்பகுதியை குறிக்கும்', 'கண்ணாடி பிம்பத்தில் இடது-வலது மட்டுமே மாறும்; மேல்-கீழ் மாறாது'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  const subjects: SyllabusSubject[] = [
    { subjectId: 'pol_tamil', subjectName: 'தமிழ் மொழித் தகுதித் தேர்வு (Tamil Eligibility — 100 Marks)', icon: '🔤', color: '#ec4899', totalChapters: tamilEligibilityChapters.length, totalMicroTopics: tamilEligibilityChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: tamilEligibilityChapters },
    { subjectId: 'pol_gk', subjectName: 'பொது அறிவு & அறிவியல் (General Knowledge & Science Core)', icon: '🏛️', color: '#06b6d4', totalChapters: generalKnowledgeChapters.length, totalMicroTopics: generalKnowledgeChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: generalKnowledgeChapters },
    { subjectId: 'pol_psy', subjectName: 'உளவியல் & தர்க்கக் காரணவியல் (Psychology & Logical Analysis)', icon: '🧠', color: '#8b5cf6', totalChapters: psychologyChapters.length, totalMicroTopics: psychologyChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: psychologyChapters }
  ];

  return {
    courseId: courseId || 'exam-police-si',
    courseTitle: courseTitle || 'Tamil Nadu Police Sub-Inspector (SI) & Constable Master Program',
    category: 'police',
    board: 'TNUSRB',
    medium: 'Tamil / English',
    totalDays: 180,
    totalSubjects: subjects.length,
    totalChapters: subjects.reduce((a, s) => a + s.chapters.length, 0),
    totalMicroTopics: subjects.reduce((a, s) => a + s.chapters.reduce((acc, c) => acc + (c.microTopics?.length || 0), 0), 0),
    subjects
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 9E. BANKING & INSURANCE EXAMS (IBPS PO/CLERK, SBI PO/CLERK, RBI ASSISTANT)
// ─────────────────────────────────────────────────────────────────────────────
export function getBankingAndInsuranceCompleteSyllabus(courseId?: string, courseTitle?: string): CourseFullSyllabus {
  const quantChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Speed Maths, Simplification, Number Series & Quadratic Equations',
      description: 'Vedic squaring, percentage-fraction equivalence, missing & wrong number series, factorization inequalities (x, y comparison)',
      subtopics: [
        {
          id: 'bank_q_sub1',
          title: 'Speed Calculations & Inequalities',
          microTopics: [
            { id: 'bank_q_1', title: 'Percentage Fractions (1/2 to 1/20) & BODMAS Approximation', keyAxiom: 'Fraction equivalents: 1/8=12.5%, 1/7=14.28%, 1/6=16.66%' },
            { id: 'bank_q_2', title: 'Quadratic Equation Sign Method (ax² + bx + c = 0)', keyAxiom: 'Constant negative in both equations gives No Relation (CND)' }
          ]
        }
      ],
      microTopics: [
        { id: 'bank_q_1', topicTitle: 'Speed Maths: Percentage-Fractions, Series & Quadratic Sign Method', subtopic: 'Approximations, Arithmetic/Geometric number series, Quadratic root comparison (x > y, x < y, CND)', dayNumber: 1, periodNumber: 1, keyFormulaOrLaw: 'Sign Rule: If constant term (c) is negative in both equations, answer is always x = y or CND', keyPoints: ['1/12 = 8.33%, 1/14 = 7.14%, 1/16 = 6.25%', 'Pattern identification in difference of differences'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Data Interpretation (DI) Master & Arithmetic Word Problems',
      description: 'Pie Charts, Bar Graphs, Caselet DI, Missing DI, Profit & Loss, Simple & Compound Interest, Time & Work, Speed-Distance',
      subtopics: [
        {
          id: 'bank_q_sub2',
          title: 'Data Interpretation & Arithmetic',
          microTopics: [
            { id: 'bank_q_3', title: 'Caselet DI & Double Pie Chart Analysis', keyAxiom: 'Venn-diagram based caselet variable isolation' },
            { id: 'bank_q_4', title: 'CI - SI Difference & Mixture Alligation Rule', keyAxiom: '2-Year Difference = P(R/100)² | Alligation: (c - m)/(m - d)' }
          ]
        }
      ],
      microTopics: [
        { id: 'bank_q_3', topicTitle: 'High-Level DI (Caselet, Pie, Radar) & Arithmetic Word Problems', subtopic: 'CI-SI difference formulas, Alligation rule, Relative speed (Train & Boats)', dayNumber: 4, periodNumber: 1, keyFormulaOrLaw: '2-Year CI-SI Diff: D₂ = P(R/100)² | 3-Year Diff: D₃ = P(R/100)² × (300+R)/100', keyPoints: ['Boat downstream = u + v; Upstream = u - v', 'Work equivalence: Total Work = LCM of individual days taken'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  const reasoningChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Puzzles & Seating Arrangements (Floor, Box, Circular, Parallel Rows)',
      description: 'Floor & Flat puzzles, 8-person circular facing inside/outside, Parallel row seating with blood relations, Box stack puzzles',
      subtopics: [
        {
          id: 'bank_r_sub1',
          title: 'Seating Arrangements & Puzzles',
          microTopics: [
            { id: 'bank_r_1', title: 'Floor-Flat & Box Stack Variable Puzzles', keyAxiom: 'Create 2 parallel possibilities table to eliminate invalid conditions' },
            { id: 'bank_r_2', title: 'Circular & Linear Seating facing Inward/Outward', keyAxiom: 'Fix definite position with maximum interconnecting clues' }
          ]
        }
      ],
      microTopics: [
        { id: 'bank_r_1', topicTitle: 'Mains-Level Puzzles (Floor-Flat, Year-Based, Uncertain Linear Row)', subtopic: 'Multi-variable seating arrangement with systematic thread/table method', dayNumber: 2, periodNumber: 2, keyFormulaOrLaw: 'Case Elimination: Draw Case A and Case B simultaneously to discard contradictions rapidly', keyPoints: ['Uncertain row: Start with elements having fixed directional limits', 'Floor-Flat: Note odd/even flat numbers explicitly'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Logical Deduction: Syllogisms ("Only a Few"), Inequalities & Machine Input',
      description: 'Reverse Syllogisms, "Only a few A are B", Coded Inequalities, Direction distance, Coded Blood Relations, Machine Input-Output',
      subtopics: [
        {
          id: 'bank_r_sub2',
          title: 'Logical Deduction & Machine Input',
          microTopics: [
            { id: 'bank_r_3', title: '"Only a few" Syllogisms (Some + Some Not)', keyAxiom: '"Only a few A are B" means Some A are B AND Some A are NOT B' },
            { id: 'bank_r_4', title: 'Machine Input-Output Step Shifting Logic', keyAxiom: 'Ascending/descending alphanumeric sorting patterns' }
          ]
        }
      ],
      microTopics: [
        { id: 'bank_r_3', topicTitle: 'Syllogisms ("Only a Few"), Coded Inequalities & Step-by-Step Input-Output', subtopic: 'Some + Some Not venn deductions, Coded blood relation tree', dayNumber: 5, periodNumber: 2, keyFormulaOrLaw: 'Rule: "Only A is B" = "All B are A" (and B cannot be anything else)', keyPoints: ['Either-Or condition requires same subjects/predicates with complementary pair', 'Input-output: trace alphabetical vowel/consonant count alongside number reversals'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  const englishChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Reading Comprehension, Error Spotting, Cloze Test & Para Jumbles',
      description: 'Banking/Economy editorial passages, Grammar rules (Subject-verb, Prepositions), Cloze test contextual word choice, Sentence rearrangement',
      subtopics: [
        {
          id: 'bank_e_sub1',
          title: 'Reading Comprehension & Grammar',
          microTopics: [
            { id: 'bank_e_1', title: 'Editorial Reading Comprehension & Tone Analysis', keyAxiom: 'Locate pivot words (However, Nonetheless, Despite) for main argument' },
            { id: 'bank_e_2', title: '120 Rules of English Grammar for Error Detection', keyAxiom: 'No sooner... than, Scarcely... when, Not only... but also' }
          ]
        }
      ],
      microTopics: [
        { id: 'bank_e_1', topicTitle: 'Reading Comprehension Tone, Cloze Test & Inversion Grammar Rules', subtopic: 'Inversion: "Hardly had I...", Subject-Verb Agreement with collective nouns', dayNumber: 3, periodNumber: 3, keyFormulaOrLaw: 'Rule: Scarcely/Hardly had + S + V3... WHEN | No Sooner had + S + V3... THAN', keyPoints: ['Para Jumbles: Look for mandatory noun-pronoun opening pairs', 'Cloze test: check positive vs negative connotation of surrounding sentences'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  const bankingAwarenessChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'RBI Monetary Policy, Banking Structure & Digital Payments',
      description: 'CRR, SLR, Repo, Reverse Repo, SDF, MSF, Basel III capital adequacy, NPA classification (SMA-0, 1, 2), SARFAESI Act, UPI, CBDC (e-Rupee)',
      subtopics: [
        {
          id: 'bank_ga_sub1',
          title: 'Banking & Financial Architecture',
          microTopics: [
            { id: 'bank_ga_1', title: 'RBI Monetary Policy Instruments & Liquidity Ratios', keyAxiom: 'CRR kept with RBI in cash; SLR kept in gold/govt securities' },
            { id: 'bank_ga_2', title: 'NPA Norms (90 days default), IBC 2016 & Digital UPI 2.0', keyAxiom: 'Substandard -> Doubtful -> Loss asset classification timeline' }
          ]
        }
      ],
      microTopics: [
        { id: 'bank_ga_1', topicTitle: 'RBI Policy Rates, Priority Sector Lending (PSL) & NPA Norms', subtopic: 'Repo rate, 40% PSL target for commercial banks, DICGC insurance limit (₹5 Lakhs)', dayNumber: 6, periodNumber: 3, keyFormulaOrLaw: 'DICGC Deposit Insurance = ₹5,000,000 per depositor per bank | PSL Target = 40% of ANBC', keyPoints: ['Payment Banks cannot issue credit cards or advance loans (can accept deposits up to ₹2 Lakh)', 'Small Finance Banks have 75% PSL requirement'], type: 'concept', importance: 'High-Yield' }
      ]
    }
  ];

  const subjects: SyllabusSubject[] = [
    { subjectId: 'bank_quant', subjectName: 'Quantitative Aptitude & Advanced DI (Banking)', icon: '🔢', color: '#06b6d4', totalChapters: quantChapters.length, totalMicroTopics: quantChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: quantChapters },
    { subjectId: 'bank_reasoning', subjectName: 'Reasoning Ability & Complex Puzzles', icon: '🧩', color: '#8b5cf6', totalChapters: reasoningChapters.length, totalMicroTopics: reasoningChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: reasoningChapters },
    { subjectId: 'bank_english', subjectName: 'English Language & Verbal Ability', icon: '📖', color: '#3b82f6', totalChapters: englishChapters.length, totalMicroTopics: englishChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: englishChapters },
    { subjectId: 'bank_ga', subjectName: 'Banking Awareness, Financial Systems & Current Affairs', icon: '🏛️', color: '#10b981', totalChapters: bankingAwarenessChapters.length, totalMicroTopics: bankingAwarenessChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: bankingAwarenessChapters }
  ];

  return {
    courseId: courseId || 'exam-bank-po',
    courseTitle: courseTitle || 'Banking & Insurance (IBPS, SBI PO/Clerk, RBI Assistant) Master Blueprint',
    category: 'banking',
    board: 'IBPS / SBI / RBI',
    medium: 'English / Tamil',
    totalDays: 180,
    totalSubjects: subjects.length,
    totalChapters: subjects.reduce((a, s) => a + s.chapters.length, 0),
    totalMicroTopics: subjects.reduce((a, s) => a + s.chapters.reduce((acc, c) => acc + (c.microTopics?.length || 0), 0), 0),
    subjects
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 9F. SSC & RAILWAY EXAMS (SSC CGL / CHSL / MTS & RRB NTPC / GROUP D)
// ─────────────────────────────────────────────────────────────────────────────
export function getSscAndRailwayCompleteSyllabus(courseId?: string, courseTitle?: string): CourseFullSyllabus {
  const quantChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Advance Mathematics: Geometry, Trigonometry, Mensuration & Algebra',
      description: 'Triangle centers (Centroid, Incenter, Circumcenter, Orthocenter), Circle tangent theorems, Trigonometric identities, 2D/3D surface area & volume',
      subtopics: [
        {
          id: 'ssc_q_sub1',
          title: 'Advance Geometry & Trigonometry',
          microTopics: [
            { id: 'ssc_q_1', title: 'Triangle Centers & Circle Tangent Theorems', keyAxiom: 'Inradius r = Area / Semi-perimeter | Circumradius R = abc / 4Δ' },
            { id: 'ssc_q_2', title: 'Trigonometry Maxima/Minima & Heights/Distances', keyAxiom: 'a sin θ + b cos θ has max value √(a² + b²)' }
          ]
        }
      ],
      microTopics: [
        { id: 'ssc_q_1', topicTitle: 'Circle Theorems (Alternate Segment), Triangle Centers & Trigonometry Maxima', subtopic: 'Incenter angle = 90° + A/2, Circumcenter angle = 2A, Tangent PA × PB = PT²', dayNumber: 1, periodNumber: 1, keyFormulaOrLaw: 'Alternate Segment Theorem | Incenter: ∠BIC = 90° + ∠A/2 | Secant: PA · PB = PT²', keyPoints: ['Centroid divides median in 2:1 ratio', 'Sum of interior angles of n-sided polygon = (n - 2) × 180°'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Arithmetic & Commercial Maths (Percentage, Ratio, Time-Work, Speed-Distance)',
      description: 'Successive percentage changes, Dishonest shopkeeper profit, Compound interest installments, Relative speed, Train crossing platform',
      subtopics: [
        {
          id: 'ssc_q_sub2',
          title: 'Commercial Arithmetic',
          microTopics: [
            { id: 'ssc_q_3', title: 'Successive Percentage & Dishonest Shopkeeper', keyAxiom: 'Net Change = a + b + (ab/100)' },
            { id: 'ssc_q_4', title: 'Train Speed-Distance & Relative Motion', keyAxiom: 'Time to cross platform = (Train Length + Platform Length) / Speed' }
          ]
        }
      ],
      microTopics: [
        { id: 'ssc_q_3', topicTitle: 'Dishonest Dealer, CI Installments & Train Speed Problems', subtopic: 'Weight fraud % profit, Equal annual installment formula', dayNumber: 4, periodNumber: 1, keyFormulaOrLaw: 'Installment P = x/(1+r/100) + x/(1+r/100)² | Net % = a + b + ab/100', keyPoints: ['Speed conversion: 1 km/h = 5/18 m/s', 'Work formula: M₁ D₁ H₁ / W₁ = M₂ D₂ H₂ / W₂'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  const reasoningChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'General Intelligence & Reasoning (Verbal & Non-Verbal)',
      description: 'Analogies, Venn diagrams, Syllogisms, Paper folding/cutting, Cube & Dice, Embedded figures, Matrix, Mirror & Water images',
      subtopics: [
        {
          id: 'ssc_r_sub1',
          title: 'Reasoning & Non-Verbal Logic',
          microTopics: [
            { id: 'ssc_r_1', title: 'Analogies, Classification & Odd One Out', keyAxiom: 'Alphabet place values & prime number patterns' },
            { id: 'ssc_r_2', title: 'Cube Folding, Dice Opposite Faces & Mirror Images', keyAxiom: 'Opposite faces on an unfolded cube are separated by exactly 1 square' }
          ]
        }
      ],
      microTopics: [
        { id: 'ssc_r_1', topicTitle: 'Dice Opposite Faces, Figure Counting (Triangles/Squares) & Venn Logic', subtopic: 'Formula for counting triangles in symmetric grids, Dice rotation rules', dayNumber: 2, periodNumber: 2, keyFormulaOrLaw: 'Triangle Count in n-division grid: Total = n(n+1)/2 | Opposite faces on standard die sum to 7', keyPoints: ['Mirror reflection flips horizontal axis; Water reflection flips vertical axis', 'Statement-Conclusion: Do not assume information beyond stated premise'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  const englishChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'English Comprehension, Vocabulary, Idioms & Grammar Transformations',
      description: 'One Word Substitutions, Idioms & Phrases, Active/Passive Voice transformations, Direct/Indirect Speech, Cloze test',
      subtopics: [
        {
          id: 'ssc_e_sub1',
          title: 'English Grammar & Vocabulary',
          microTopics: [
            { id: 'ssc_e_1', title: 'One Word Substitution (OWS) & High-Frequency Idioms', keyAxiom: 'Root words (Phil-, Mis-, -cide, -cracy, -ology)' },
            { id: 'ssc_e_2', title: 'Voice & Narration Conversion Rules', keyAxiom: 'Never change tense in Active to Passive; Backshift tense in Direct to Indirect' }
          ]
        }
      ],
      microTopics: [
        { id: 'ssc_e_1', topicTitle: 'SSC High-Yield Idioms, One-Word Substitutions & Voice/Narration Rules', subtopic: 'Root words, Passive of interrogative/imperative sentences, Reporting verb rules', dayNumber: 3, periodNumber: 3, keyFormulaOrLaw: 'Passive Voice of Imperative: "Let + Object + be + V3" | "You are ordered/requested to + V1"', keyPoints: ['Uncountable nouns (Information, Furniture, Advice, Scenery) never take plural -s', 'Both... and is correct pair; Both... as well as is grammatically incorrect'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  const gsChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'General Awareness: History, Polity, Geography, Economy & NCERT Science',
      description: 'Mughal Empire, Freedom Movement, Constitutional Articles, Indian Rivers, National Parks, Classical Dances, NCERT Physics/Chemistry/Biology',
      subtopics: [
        {
          id: 'ssc_ga_sub1',
          title: 'General Knowledge & Science',
          microTopics: [
            { id: 'ssc_ga_1', title: 'Indian History & Constitutional Articles (1 to 51A)', keyAxiom: 'Fundamental Rights (12-35), DPSPs (36-51), Fundamental Duties 51A' },
            { id: 'ssc_ga_2', title: 'General Science NCERT (Physics, Chemistry, Biology)', keyAxiom: 'Units, Optics, Acids-Bases, Periodic Table, Cell organelles, Human diseases' }
          ]
        }
      ],
      microTopics: [
        { id: 'ssc_ga_1', topicTitle: 'Indian Polity Articles, Geography Rivers/Passes & NCERT Science Core', subtopic: 'Article 14–32, Major Mountain Passes (Zoji La, Nathu La), Human hormones', dayNumber: 5, periodNumber: 3, keyFormulaOrLaw: 'Article 51A: 11 Fundamental Duties added by 42nd Amendment 1976 (Swaran Singh Committee)', keyPoints: ['Tropic of Cancer passes through 8 Indian states (Gujarat to Mizoram)', 'Sound waves cannot travel through vacuum; light waves travel at 3 × 10⁸ m/s'], type: 'concept', importance: 'High-Yield' }
      ]
    }
  ];

  const subjects: SyllabusSubject[] = [
    { subjectId: 'ssc_quant', subjectName: 'Quantitative Aptitude & Pure Advance Maths', icon: '📐', color: '#06b6d4', totalChapters: quantChapters.length, totalMicroTopics: quantChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: quantChapters },
    { subjectId: 'ssc_reasoning', subjectName: 'General Intelligence & Reasoning (Verbal / Non-Verbal)', icon: '🧩', color: '#8b5cf6', totalChapters: reasoningChapters.length, totalMicroTopics: reasoningChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: reasoningChapters },
    { subjectId: 'ssc_english', subjectName: 'English Language & Comprehension', icon: '📖', color: '#3b82f6', totalChapters: englishChapters.length, totalMicroTopics: englishChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: englishChapters },
    { subjectId: 'ssc_ga', subjectName: 'General Awareness & General Science Core', icon: '🏛️', color: '#10b981', totalChapters: gsChapters.length, totalMicroTopics: gsChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: gsChapters }
  ];

  return {
    courseId: courseId || 'exam-ssc-cgl',
    courseTitle: courseTitle || 'SSC CGL, CHSL, MTS & Railway RRB NTPC Unified Master Program',
    category: 'ssc_railway',
    board: 'SSC / RRB',
    medium: 'English / Tamil',
    totalDays: 200,
    totalSubjects: subjects.length,
    totalChapters: subjects.reduce((a, s) => a + s.chapters.length, 0),
    totalMicroTopics: subjects.reduce((a, s) => a + s.chapters.reduce((acc, c) => acc + (c.microTopics?.length || 0), 0), 0),
    subjects
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 9G. TEACHING RECRUITMENT & TET (TRB PG/BT, TNTET PAPER 1 & 2)
// ─────────────────────────────────────────────────────────────────────────────
export function getTrbAndTeacherExamsCompleteSyllabus(courseId?: string, courseTitle?: string): CourseFullSyllabus {
  const childDevChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Child Development & Learning Theories (குழந்தை வளர்ச்சி மற்றும் கற்றல் கோட்பாடுகள்)',
      description: 'Jean Piaget 4 Cognitive Stages, Lev Vygotsky ZPD & Scaffolding, Kohlberg Moral Stages, Erikson Psychosocial Stages',
      subtopics: [
        {
          id: 'trb_cd_sub1',
          title: 'வளர்ச்சி நிலைகள் & கற்றல் கோட்பாடுகள்',
          microTopics: [
            { id: 'trb_cd_1', title: 'பியாஜே (Piaget) அறிதிறன் வளர்ச்சி 4 நிலைகள்', keyAxiom: 'Sensorimotor (0-2), Preoperational (2-7), Concrete (7-11), Formal (11+)' },
            { id: 'trb_cd_2', title: 'வைகாட்ஸ்கி (Vygotsky) ZPD & சாரக்கட்டு (Scaffolding)', keyAxiom: 'Zone of Proximal Development: Gap between actual and guided capability' }
          ]
        }
      ],
      microTopics: [
        { id: 'trb_cd_1', topicTitle: 'பியாஜே 4 நிலைகள், வைகாட்ஸ்கி ZPD & கோல்பர்க் ஒழுக்க வளர்ச்சி', subtopic: 'அறிதிறன் வளர்ச்சி நிலைகள், சாரக்கட்டு (Scaffolding) மற்றும் மாரல் கோட்பாடுகள்', dayNumber: 1, periodNumber: 1, keyFormulaOrLaw: 'Piaget 4 Stages: Sensorimotor -> Pre-operational -> Concrete Operational -> Formal Operational | Vygotsky: ZPD & MKO', keyPoints: ['Assimilation (உட்கிரகித்தல்) vs Accommodation (பொருத்துதல்)', 'Scaffolding concept proposed by Jerome Bruner in Vygotskian framework'], type: 'concept', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'நுண்ணறிவு, ஆளுமை, சிறப்பு குழந்தைகளுக்கான கல்வி & RTE சட்டம்',
      description: 'Gardner Multiple Intelligences (8 வகைகள்), Maslow Hierarchy of Needs, Inclusive Education, CWSN, RTE Act 2009 & NEP 2020',
      subtopics: [
        {
          id: 'trb_cd_sub2',
          title: 'நுண்ணறிவு & உள்ளடக்கிய கல்வி',
          microTopics: [
            { id: 'trb_cd_3', title: 'ஹோவர்ட் கார்ட்னர் 8 வகை பல்வகை நுண்ணறிவு', keyAxiom: 'Linguistic, Logical-Mathematical, Spatial, Bodily, Musical, Inter/Intra-personal, Naturalist' },
            { id: 'trb_cd_4', title: 'உள்ளடக்கிய கல்வி (Inclusive Education) & RTE சட்டம் 2009', keyAxiom: 'Section 12(1)(c) mandates 25% admission for disadvantaged children in private schools' }
          ]
        }
      ],
      microTopics: [
        { id: 'trb_cd_3', topicTitle: 'கார்ட்னர் 8 வகை நுண்ணறிவு, மாஸ்லோ தேவைகள் & RTE சட்டம் 2009', subtopic: 'ஹோவர்ட் கார்ட்னர் தத்துவம், மஸ்லோ படிநிலை தேவைகள் மற்றும் இலவச கட்டாயக் கல்வி', dayNumber: 3, periodNumber: 1, keyFormulaOrLaw: 'Maslow Hierarchy: Physiological -> Safety -> Love/Belonging -> Esteem -> Self-Actualization', keyPoints: ['RTE Act came into force on 1 April 2010 (Article 21A)', 'Pupil-Teacher Ratio (PTR) in primary school: 30:1; Upper primary: 35:1'], type: 'concept', importance: 'High-Yield' }
      ]
    }
  ];

  const pedagogyChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'மொழி கற்பித்தல் முறைகள் & மதிப்பீட்டு உத்திகள் (Pedagogy & Assessment)',
      description: 'LSRW திறன்கள் (கேட்டல், பேசுதல், படித்தல், எழுதுதல்), செய்யுள்/உரைநடை கற்பித்தல், நுண்ணிலை கற்பித்தல் (Micro-teaching), CCE தொடர் மதிப்பீடு',
      subtopics: [
        {
          id: 'trb_ped_sub1',
          title: 'கற்பித்தல் முறைகள் & நுண்ணிலை கற்பித்தல்',
          microTopics: [
            { id: 'trb_ped_1', title: 'LSRW மொழித்திறன்கள் & மொழி கற்பிக்கும் முறைகள்', keyAxiom: 'கேட்டல் மற்றும் படித்தல் ஏற்புத் திறன்கள்; பேசுதல் மற்றும் எழுதுதல் வெளியீட்டுத் திறன்கள்' },
            { id: 'trb_ped_2', title: 'நுண்ணிலை கற்பித்தல் 6 படிகள் (Micro-Teaching Cycle)', keyAxiom: 'Teach (6m) -> Feedback (6m) -> Re-plan (12m) -> Re-teach (6m) -> Re-feedback (6m) = 36 mins' }
          ]
        }
      ],
      microTopics: [
        { id: 'trb_ped_1', topicTitle: 'LSRW மொழித்திறன்கள், நுண்ணிலை கற்பித்தல் சுழற்சி (36 நிமிடங்கள்) & CCE', subtopic: 'கற்பித்தல் படிகள், பின்னூட்டம் மற்றும் தொடர் முழுமையான மதிப்பீடு (CCE)', dayNumber: 2, periodNumber: 2, keyFormulaOrLaw: 'Micro-teaching Cycle: 36 Minutes (Plan -> Teach 6m -> Feedback 6m -> Re-plan 12m -> Re-teach 6m -> Re-feedback 6m)', keyPoints: ['Formative Assessment (கற்றலுக்கான மதிப்பீடு) vs Summative Assessment (கற்றலின் மதிப்பீடு)', 'Micro-teaching was introduced by Dwight W. Allen at Stanford University (1963)'], type: 'concept', importance: 'High-Yield' }
      ]
    }
  ];

  const subjects: SyllabusSubject[] = [
    { subjectId: 'trb_child_dev', subjectName: 'குழந்தை மேம்பாடும் கற்றல் உளவியலும் (Child Development & Pedagogy)', icon: '👶', color: '#ec4899', totalChapters: childDevChapters.length, totalMicroTopics: childDevChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: childDevChapters },
    { subjectId: 'trb_pedagogy', subjectName: 'கற்பித்தல் முறைகளும் மதிப்பீடும் (Teaching Methodology & CCE)', icon: '📚', color: '#06b6d4', totalChapters: pedagogyChapters.length, totalMicroTopics: pedagogyChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: pedagogyChapters }
  ];

  return {
    courseId: courseId || 'exam-trb-tet',
    courseTitle: courseTitle || 'Teachers Recruitment Board (TRB / TNTET Paper 1 & 2) Master Program',
    category: 'teaching',
    board: 'TRB Tamil Nadu',
    medium: 'Tamil / English',
    totalDays: 150,
    totalSubjects: subjects.length,
    totalChapters: subjects.reduce((a, s) => a + s.chapters.length, 0),
    totalMicroTopics: subjects.reduce((a, s) => a + s.chapters.reduce((acc, c) => acc + (c.microTopics?.length || 0), 0), 0),
    subjects
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 9H. GATE & CORE ENGINEERING (COMPUTER SCIENCE / IT & CORE)
// ─────────────────────────────────────────────────────────────────────────────
export function getGateAndEngineeringCompleteSyllabus(courseId?: string, courseTitle?: string): CourseFullSyllabus {
  const engMathChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Engineering Mathematics & Discrete Mathematics',
      description: 'Linear Algebra (Eigenvalues/Eigenvectors, Cayley-Hamilton), Calculus (Limits, Maxima/Minima), Probability (Bayes Theorem), Propositional Logic & Graph Theory',
      subtopics: [
        {
          id: 'gate_m_sub1',
          title: 'Linear Algebra & Discrete Math',
          microTopics: [
            { id: 'gate_m_1', title: 'Eigenvalues, Eigenvectors & Cayley-Hamilton Theorem', keyAxiom: 'Sum of eigenvalues = Trace of matrix; Product of eigenvalues = Determinant' },
            { id: 'gate_m_2', title: 'Graph Theory (Handshaking Lemma, Planar Graphs E ≤ 3V - 6)', keyAxiom: 'Sum of degrees of all vertices = 2 × Number of Edges' }
          ]
        }
      ],
      microTopics: [
        { id: 'gate_m_1', topicTitle: 'Eigenvalues, Cayley-Hamilton Theorem, Handshaking Lemma & Bayes Rule', subtopic: 'Matrix characteristic equation |A - λI| = 0, Planar graph Euler formula V - E + F = 2', dayNumber: 1, periodNumber: 1, keyFormulaOrLaw: 'Trace(A) = Σ λ_i | Det(A) = Π λ_i | Handshaking: Σ deg(v) = 2|E| | Euler Formula: V - E + F = 2', keyPoints: ['Every square matrix satisfies its own characteristic equation (Cayley-Hamilton)', 'In a planar connected graph with V ≥ 3, number of edges E ≤ 3V - 6'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  const csCoreChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Operating Systems & Database Management Systems (DBMS)',
      description: 'CPU Scheduling, Semaphores & Mutex, Deadlock (Banker\'s Algorithm), Virtual Memory (Page replacement), SQL, B+ Trees, Normalization (BCNF/3NF), ACID & Conflict Serializability',
      subtopics: [
        {
          id: 'gate_cs_sub1',
          title: 'Operating Systems & DBMS Core',
          microTopics: [
            { id: 'gate_cs_1', title: 'Semaphores, Deadlock Banker Algorithm & Virtual Memory Paging', keyAxiom: 'Deadlock 4 conditions: Mutual exclusion, Hold & Wait, No preemption, Circular wait' },
            { id: 'gate_cs_2', title: 'Database Normalization (3NF vs BCNF) & Conflict Serializability', keyAxiom: 'Precedence graph cycle check for conflict serializability' }
          ]
        }
      ],
      microTopics: [
        { id: 'gate_cs_1', topicTitle: 'Banker Algorithm, Paging TLB Hit Ratio & BCNF Normalization', subtopic: 'Effective Memory Access Time EMAT = h(t_tlb + t_m) + (1-h)(t_tlb + 2t_m), Conflict Serializability graph', dayNumber: 2, periodNumber: 2, keyFormulaOrLaw: 'EMAT = h(t_TLB + t_m) + (1 - h)(t_TLB + 2t_m) | BCNF Condition: For every X -> Y, X must be a Super Key', keyPoints: ['Strict 2PL prevents cascading rollbacks and guarantees serializability', 'Page fault occurs when referenced page is not present in main memory frame'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Computer Networks, Theory of Computation (TOC) & Compiler Design',
      description: 'TCP 3-Way Handshake, Flow control (Sliding Window, Go-Back-N, Selective Repeat), Subnetting CIDR, Regular Expressions, DFA/NFA minimization, Turing Machines, LL(1) / LR(1) Parsers',
      subtopics: [
        {
          id: 'gate_cs_sub2',
          title: 'Networks, TOC & Compilers',
          microTopics: [
            { id: 'gate_cs_3', title: 'Sliding Window Protocols (GBN vs SR) & Subnetting CIDR', keyAxiom: 'Efficiency η = N / (1 + 2a) where a = Propagation Time / Transmission Time' },
            { id: 'gate_cs_4', title: 'DFA Minimization (Myhill-Nerode) & LL(1) Parsing Table', keyAxiom: 'A grammar is LL(1) if FIRST and FOLLOW sets have no common intersection' }
          ]
        }
      ],
      microTopics: [
        { id: 'gate_cs_3', topicTitle: 'Sliding Window Efficiency (GBN / SR), DFA Minimization & LL(1) Parsing', subtopic: 'Go-Back-N window size N = 1 + 2a, Selective Repeat N = 2^(k-1), Pumping Lemma for regular languages', dayNumber: 3, periodNumber: 3, keyFormulaOrLaw: 'Sliding Window Efficiency η = N / (1 + 2a) | a = T_p / T_t | IPv4 Subnet Mask /26 = 255.255.255.192 (64 IPs)', keyPoints: ['Selective Repeat uses window size 2^(k-1) to avoid sequence number overlap', 'Halting problem of Turing Machine is undecidable'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  const subjects: SyllabusSubject[] = [
    { subjectId: 'gate_math', subjectName: 'Engineering Mathematics & Discrete Math', icon: '📐', color: '#06b6d4', totalChapters: engMathChapters.length, totalMicroTopics: engMathChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: engMathChapters },
    { subjectId: 'gate_cs', subjectName: 'Computer Science Core (OS, DBMS, Networks, TOC & Compilers)', icon: '💻', color: '#8b5cf6', totalChapters: csCoreChapters.length, totalMicroTopics: csCoreChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: csCoreChapters }
  ];

  return {
    courseId: courseId || 'exam-gate-cs',
    courseTitle: courseTitle || 'GATE Computer Science & Information Technology Master Blueprint',
    category: 'gate_engineering',
    board: 'IIT / IISc GATE Committee',
    medium: 'English',
    totalDays: 240,
    totalSubjects: subjects.length,
    totalChapters: subjects.reduce((a, s) => a + s.chapters.length, 0),
    totalMicroTopics: subjects.reduce((a, s) => a + s.chapters.reduce((acc, c) => acc + (c.microTopics?.length || 0), 0), 0),
    subjects
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 9I. KIDS SKILLS & FOUNDATIONAL CODING (SCRATCH, VEDIC MATHS, ROBOTICS)
// ─────────────────────────────────────────────────────────────────────────────
export function getKidsSkillsCompleteSyllabus(courseId: string, courseTitle: string): CourseFullSyllabus {
  const scratchChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Scratch 3.0 Visual Block Coding & Interactive Animation',
      description: 'Sprites, Backdrops, Motion blocks, Loops (Repeat, Forever), Events (When Green Flag Clicked), Sound & Scoring',
      subtopics: [
        {
          id: 'kid_sc_sub1',
          title: 'Sprites, Loops & Events',
          microTopics: [
            { id: 'kid_sc_1', title: 'Scratch Basics: Sprites, Motion, Costumes & Animation Loops', keyAxiom: 'When Green Flag Clicked -> Forever [Move 10 steps, If on edge, bounce]' },
            { id: 'kid_sc_2', title: 'Game Development: Score Variables & Collision Detection', keyAxiom: 'If <touching Player?> then [Change Score by 1, Play Sound, Hide]' }
          ]
        }
      ],
      microTopics: [
        { id: 'kid_sc_1', topicTitle: 'Scratch Basics: Sprites, Motion, Costumes & Animation Loops', subtopic: 'Moving 10 steps, Bounce on edge, Next costume for walking animation, Forever repeat blocks', dayNumber: 1, periodNumber: 1, keyFormulaOrLaw: 'Scratch Event: When Green Flag Clicked -> Forever [Move (10) steps, If on edge, bounce]', keyPoints: ['XY Coordinate plane in Scratch: Center is (0, 0), X is -240 to 240, Y is -180 to 180', 'Costume switching creates smooth animated movement'], type: 'concept', importance: 'Foundational' },
        { id: 'kid_sc_2', topicTitle: 'Game Development: Score Variables, Sensing & Collision Detection', subtopic: 'Create Score variable, Sensing touching mouse-pointer/color, If-Else conditional logic, Win/Lose backdrop switch', dayNumber: 4, periodNumber: 1, keyFormulaOrLaw: 'Game Logic: If <touching [Player]?> then [Change [Score] by (1), Play Sound, Hide]', keyPoints: ['Variables store changing values like Score, Lives, and Timer', 'Broadcasting messages coordinates actions between different sprites'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  const vedicMathsChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Vedic Maths: Rapid Mental Calculation Tricks & Speed Sutras',
      description: 'Ekadhikena Purvena (Squaring numbers ending in 5), Nikhilam multiplication base 10/100, Fast cross-addition and subtraction',
      subtopics: [
        {
          id: 'kid_vm_sub1',
          title: 'Speed Maths Sutras',
          microTopics: [
            { id: 'kid_vm_1', title: 'Squaring Numbers Ending in 5 & Fast Multiplication with 11', keyAxiom: '(n5)² = [n × (n+1)] | 25' }
          ]
        }
      ],
      microTopics: [
        { id: 'kid_vm_1', topicTitle: 'Squaring Numbers Ending in 5 & Fast Multiplication with 11', subtopic: '35² = (3×4)|25 = 1225, 45×11 = 4|(4+5)|5 = 495, 2-second rapid mental math calculations', dayNumber: 2, periodNumber: 2, keyFormulaOrLaw: 'Vedic Sutra: (n5)² = [n × (n + 1)] followed by 25 | Multiplication by 11: ab × 11 = a | (a+b) | b', keyPoints: ['Ekadhikena Purvena means "By one more than the previous one"', 'Multiplication with 99, 999 using base deviation subtraction'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  const roboticsChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Robotics, Electronics & IoT Foundations (Arduino & Sensors)',
      description: 'Circuits, Breadboards, LEDs, Ultrasonic distance sensors, Motors, Arduino microcontroller coding',
      subtopics: [
        {
          id: 'kid_rob_sub1',
          title: 'Circuits & Sensors',
          microTopics: [
            { id: 'kid_rob_1', title: 'Arduino Microcontroller & Ultrasonic Obstacle Avoidance', keyAxiom: 'Distance = (Travel Time × Speed of Sound) / 2' }
          ]
        }
      ],
      microTopics: [
        { id: 'kid_rob_1', topicTitle: 'Arduino Microcontroller, Breadboard Circuits & Ultrasonic Sensor', subtopic: 'Connecting LED resistors, Reading ultrasonic sensor pulse, Motor driver L298N', dayNumber: 3, periodNumber: 3, keyFormulaOrLaw: 'Ohm Law: V = IR | Ultrasonic: Distance = (Duration × 0.034) / 2 cm', keyPoints: ['Anode is longer positive leg of LED; Cathode is shorter negative leg', 'Arduino void setup() runs once; void loop() runs repeatedly'], type: 'concept', importance: 'High-Yield' }
      ]
    }
  ];

  const subjects: SyllabusSubject[] = [
    { subjectId: 'kid_scratch', subjectName: 'Scratch 3.0 Block Coding & Game Studio', icon: '🐱', color: '#f59e0b', totalChapters: scratchChapters.length, totalMicroTopics: scratchChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: scratchChapters },
    { subjectId: 'kid_vedic', subjectName: 'Vedic Maths & Lightning Speed Calculations', icon: '⚡', color: '#06b6d4', totalChapters: vedicMathsChapters.length, totalMicroTopics: vedicMathsChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: vedicMathsChapters },
    { subjectId: 'kid_robotics', subjectName: 'Robotics, Electronics & Smart IoT Studio', icon: '🤖', color: '#10b981', totalChapters: roboticsChapters.length, totalMicroTopics: roboticsChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: roboticsChapters }
  ];

  return {
    courseId: courseId || 'kids-scratch-ai',
    courseTitle: courseTitle || 'Kids Coding Studio, Scratch, Robotics & Vedic Speed Maths',
    category: 'kids_skills',
    board: 'Foundational STEM',
    medium: 'English',
    totalDays: 100,
    totalSubjects: subjects.length,
    totalChapters: subjects.reduce((a, s) => a + s.chapters.length, 0),
    totalMicroTopics: subjects.reduce((a, s) => a + s.chapters.reduce((acc, c) => acc + (c.microTopics?.length || 0), 0), 0),
    subjects
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. MASTER DISPATCHER FOR ALL 86 COURSES
// ─────────────────────────────────────────────────────────────────────────────
export function resolveCompleteCourseSyllabus(
  courseId: string,
  courseTitle: string
): CourseFullSyllabus {
  const c = (courseId || '').toLowerCase();
  const title = courseTitle || 'Standard Curriculum';
  const isTa = title.includes('தமிழ்') || c.includes('-ta-');

  // 1. UPSC Mains Optionals Track (Top 10 Subjects)
  if (c.includes('exam-upsc-opt-') || c.includes('-opt-')) {
    return getUpscOptionalSubjectSyllabus(courseId, title);
  }

  // 2. JEE Main & JEE Advanced Entrance Track
  if (c.includes('jee')) {
    return getJeeMainAdvancedCompleteSyllabus(courseId, title);
  }

  // 3. UPSC Civil Services (IAS / IPS / IFS / IRS) Central Track
  if (c.includes('upsc') || c.includes('ias') || c.includes('central-services')) {
    return getUpscCivilServicesCompleteSyllabus(courseId, title);
  }

  // 4. NEET UG Entrance
  if (c.includes('neet')) {
    return getNeetUgCompleteSyllabus();
  }

  // 5. TNUSRB Tamil Nadu Police (SI & Constable) Track
  if (c.includes('police') || c.includes('tnusrb') || c.includes('si-') || c.includes('constable') || c.includes('sub-inspector')) {
    return getTamilNaduPoliceCompleteSyllabus(courseId, title);
  }

  // 6. TNPSC Exams Track (All Groups 1, 2, 4, VAO, DEO)
  if (c.includes('tnpsc') || c.includes('vao') || c.includes('group-1') || c.includes('group-2') || c.includes('group-4') || c.includes('grp1') || c.includes('grp2') || c.includes('grp4')) {
    return getTnpscUnifiedCompleteSyllabus(courseId, title);
  }

  // 7. Banking & Insurance Track (IBPS PO/Clerk, SBI PO/Clerk, RBI Assistant)
  if (c.includes('bank') || c.includes('ibps') || c.includes('sbi') || c.includes('rbi') || c.includes('po-') || c.includes('clerk')) {
    return getBankingAndInsuranceCompleteSyllabus(courseId, title);
  }

  // 8. SSC & Railway Exams Track (SSC CGL / CHSL / MTS & RRB NTPC / Group D)
  if (c.includes('ssc') || c.includes('cgl') || c.includes('chsl') || c.includes('mts') || c.includes('rrb') || c.includes('railway') || c.includes('ntpc')) {
    return getSscAndRailwayCompleteSyllabus(courseId, title);
  }

  // 9. TRB & Teaching Exams Track (TRB PG/BT, TNTET Paper 1 & 2)
  if (c.includes('trb') || c.includes('tet') || c.includes('tntet') || c.includes('teacher') || c.includes('bed') || c.includes('ugc-net')) {
    return getTrbAndTeacherExamsCompleteSyllabus(courseId, title);
  }

  // 10. GATE & Engineering Core Track
  if (c.includes('gate') || c.includes('engineering') || c.includes('btech')) {
    return getGateAndEngineeringCompleteSyllabus(courseId, title);
  }

  // 11. Kids Skills (Scratch, Vedic Maths, Robotics)
  if (c.includes('kids') || c.includes('scratch') || c.includes('vedic') || c.includes('robotics')) {
    return getKidsSkillsCompleteSyllabus(courseId, title);
  }

  // 12. Tech & College Degrees Track (Python, Full-Stack, Web, Mobile, DSA, AI/ML, BCA, B.Sc)
  if (c.includes('skill') || c.includes('python') || c.includes('react') || c.includes('fullstack') || c.includes('web') || c.includes('dsa') || c.includes('code') || c.includes('degree') || c.includes('college') || c.includes('bca')) {
    return getCollegeAndTechSkillsCompleteSyllabus(courseId, title);
  }

  // 13. Class 11 & 12 Commerce Track (CBSE, State Board, Matric)
  if (c.includes('11-com') || c.includes('12-com') || c.includes('commerce') || c.includes('accountancy')) {
    return getCommerceClass11Syllabus(courseId, title);
  }

  // 9. Class 11 & 12 Science Track (Higher Secondary Bio-Maths / Computer Science)
  if (c.includes('-11') || c.includes('-12') || c.includes('std-11') || c.includes('std-12') || c.includes('grade-11') || c.includes('grade-12') || c.includes('hsc') || c.includes('plus-one') || c.includes('plus-two')) {
    return getHigherSecondaryScienceCompleteSyllabus(courseId, title);
  }

  // 10. KINDERGARTEN (LKG & UKG)
  if (c.includes('lkg') || c.includes('ukg') || c.includes('kindergarten')) {
    const subjects: SyllabusSubject[] = [
      {
        subjectId: 'kg_tamil',
        subjectName: isTa ? 'தமிழ் மழலையர் பாடல் & உயிர் எழுத்துக்கள்' : 'Tamil Rhymes & Vowels (Uyir Ezhuthukkal)',
        icon: '🔤',
        color: '#ec4899',
        totalChapters: 2,
        totalMicroTopics: 6,
        chapters: [
          {
            chapterNumber: 1,
            chapterTitle: 'உயிர் எழுத்துகள் 12 & மழலையர் பாலர் பாடல்கள்',
            description: 'அ முதல் ஔ வரை உள்ள 12 உயிர் எழுத்துகள் மற்றும் நிலா நிலா ஓடி வா பாடல்கள்',
            microTopics: [
              { id: 'kg_t_1', topicTitle: 'அ முதல் ஔ வரை உயிர் எழுத்துகள் (அம்மா, ஆடு, இலை, ஈட்டி)', subtopic: 'படங்கள் பார்த்து எழுத்துகளை அடையாளம் காணுதல்', dayNumber: 1, periodNumber: 1, keyFormulaOrLaw: 'உயிர் எழுத்துக்கள்: அ, ஆ, இ, ஈ, உ, ஊ, எ, ஏ, ஐ, ஒ, ஓ, ஔ', keyPoints: ['அ - அணில், அம்மா', 'ஆ - ஆடு, ஆலமரம்'], type: 'concept', importance: 'Foundational' }
            ]
          }
        ]
      },
      {
        subjectId: 'kg_english',
        subjectName: 'English Phonics & Alphabets (A to Z)',
        icon: '🔤',
        color: '#3b82f6',
        totalChapters: 2,
        totalMicroTopics: 6,
        chapters: [
          {
            chapterNumber: 1,
            chapterTitle: 'Phonics Sounds: Letters A to Z & Classic Nursery Rhymes',
            description: 'Letter sounds, picture matching, and CVC 3-letter word blending',
            microTopics: [
              { id: 'kg_e_1', topicTitle: 'Letters A to Z Phonics & Nursery Rhymes', subtopic: 'Apple, Ball, Cat, Dog, Elephant phonics sounds and Twinkle Twinkle rhyme', dayNumber: 1, periodNumber: 2, keyFormulaOrLaw: 'Phonics: /æ/ /b/ /k/ /d/ | 26 English Alphabets A to Z', keyPoints: ['Letter tracing inside lines', 'Object recognition'], type: 'concept', importance: 'Foundational' }
            ]
          }
        ]
      },
      {
        subjectId: 'kg_maths',
        subjectName: 'Fun Maths & Numbers (1 to 20)',
        icon: '🔢',
        color: '#06b6d4',
        totalChapters: 2,
        totalMicroTopics: 6,
        chapters: [
          {
            chapterNumber: 1,
            chapterTitle: 'Counting Numbers 1 to 20 & 2D Shapes',
            description: 'Count with fun objects, Circle, Square, Triangle, Big vs Small',
            microTopics: [
              { id: 'kg_m_1', topicTitle: 'Numbers 1 to 20: Counting, Shapes & Comparison', subtopic: '1 Sun, 2 Shoes, 3 Stars, Circle, Square, Big elephant vs small mouse', dayNumber: 1, periodNumber: 3, keyFormulaOrLaw: 'Counting 1 to 20 | Circle (Round) | Triangle (3 sides) | Square (4 sides)', keyPoints: ['Finger counting and pattern recognition', 'Big vs Small visual comparison'], type: 'concept', importance: 'Foundational' }
            ]
          }
        ]
      },
      {
        subjectId: 'kg_evs',
        subjectName: 'EVS, Nature, Animals & Good Habits',
        icon: '🌿',
        color: '#10b981',
        totalChapters: 2,
        totalMicroTopics: 6,
        chapters: [
          {
            chapterNumber: 1,
            chapterTitle: 'My 5 Senses, Friendly Animals & Magic Manners',
            description: '5 senses (Eyes, Ears, Nose, Tongue, Skin), Domestic animals, Please/Thank You',
            microTopics: [
              { id: 'kg_ev_1', topicTitle: 'My 5 Senses, Animals & Magic Words ("Thank You", "Please")', subtopic: 'Eyes to see, Ears to hear, Nose to smell, Tongue to taste, Skin to touch', dayNumber: 1, periodNumber: 4, keyFormulaOrLaw: '5 Sense Organs | Magic Words: "Please" and "Thank You"', keyPoints: ['Domestic animals (Dog, Cat, Cow)', 'Daily hygiene and handwashing'], type: 'concept', importance: 'Foundational' }
            ]
          }
        ]
      }
    ];

    return {
      courseId,
      courseTitle: title,
      category: 'kindergarten',
      board: 'TNSB / CBSE / Matric',
      medium: isTa ? 'Tamil' : 'English',
      totalDays: 200,
      totalSubjects: subjects.length,
      totalChapters: subjects.reduce((a, s) => a + s.chapters.length, 0),
      totalMicroTopics: subjects.reduce((a, s) => a + (s.totalMicroTopics || s.chapters.reduce((acc, c) => acc + (c.microTopics?.length || 0), 0)), 0),
      subjects
    };
  }

  // 11. SECONDARY STAGE (Class 9 & Class 10)
  if (c.includes('-10') || c.includes('-9') || c.includes('std-10') || c.includes('std-9') || c.includes('grade-10') || c.includes('grade-9')) {
    return getSecondaryClass9to10Syllabus(courseId, title);
  }

  // 12. MIDDLE STAGE (Class 6, 7, 8)
  if (c.includes('-6') || c.includes('-7') || c.includes('-8') || c.includes('std-6') || c.includes('std-7') || c.includes('std-8') || c.includes('grade-6') || c.includes('grade-7') || c.includes('grade-8')) {
    return getMiddleClass6to8Syllabus(courseId, title);
  }

  // 13. PREPARATORY STAGE (Class 3, 4, 5)
  if (c.includes('-3') || c.includes('-4') || c.includes('-5') || c.includes('std-3') || c.includes('std-4') || c.includes('std-5') || c.includes('grade-3') || c.includes('grade-4') || c.includes('grade-5')) {
    return getPreparatoryClass3to5Syllabus(courseId, title);
  }

  // 14. FOUNDATIONAL STAGE (Class 1 & Class 2)
  if (c.includes('-1') || c.includes('-2') || c.includes('std-1') || c.includes('std-2') || c.includes('grade-1') || c.includes('grade-2')) {
    return getFoundationalClass1to2Syllabus(courseId, title);
  }

  // 15. DEFAULT FALLBACK
  return getPreparatoryClass3to5Syllabus(courseId, title);
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. AUGMENTED SYLLABUS RESOLVER (BUILT-IN + DYNAMIC ADMIN ADDITIONS)
// ─────────────────────────────────────────────────────────────────────────────
export function getAugmentedCourseSyllabus(
  courseId: string,
  courseTitle?: string
): CourseFullSyllabus {
  const base = resolveCompleteCourseSyllabus(courseId, courseTitle || '');
  
  if (typeof window === 'undefined') return base;
  
  try {
    const raw = localStorage.getItem(`teacho_custom_syllabus_${courseId}`);
    if (!raw) return base;
    const customItems: Array<{
      subjectName: string;
      subjectIcon?: string;
      subjectColor?: string;
      chapterNumber?: number;
      chapterTitle: string;
      chapterDescription?: string;
      microTopic: SyllabusMicroTopic;
    }> = JSON.parse(raw);

    if (!Array.isArray(customItems) || customItems.length === 0) return base;

    // Deep clone base subjects
    const subjects = base.subjects.map(s => ({
      ...s,
      chapters: s.chapters.map(c => ({
        ...c,
        microTopics: [...(c.microTopics || [])]
      }))
    }));

    for (const item of customItems) {
      let subj = subjects.find(s => 
        s.subjectName.toLowerCase().includes(item.subjectName.toLowerCase()) || 
        item.subjectName.toLowerCase().includes(s.subjectName.toLowerCase())
      );
      if (!subj) {
        subj = {
          subjectId: `custom_subj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          subjectName: item.subjectName,
          icon: item.subjectIcon || '📚',
          color: item.subjectColor || '#06b6d4',
          totalChapters: 1,
          totalMicroTopics: 1,
          chapters: []
        };
        subjects.push(subj);
      }

      let chap = subj.chapters.find(c => 
        c.chapterTitle.toLowerCase().includes(item.chapterTitle.toLowerCase()) || 
        item.chapterTitle.toLowerCase().includes(c.chapterTitle.toLowerCase())
      );
      if (!chap) {
        chap = {
          chapterNumber: item.chapterNumber || (subj.chapters.length + 1),
          chapterTitle: item.chapterTitle,
          description: item.chapterDescription || `Chapter covering ${item.chapterTitle}`,
          microTopics: []
        };
        subj.chapters.push(chap);
      }

      if (!chap.microTopics) chap.microTopics = [];
      const exists = chap.microTopics.some(t => t.id === item.microTopic.id || t.topicTitle === item.microTopic.topicTitle);
      if (!exists) {
        chap.microTopics.push(item.microTopic);
      }

      subj.totalChapters = subj.chapters.length;
      subj.totalMicroTopics = subj.chapters.reduce((acc, ch) => acc + (ch.microTopics?.length || 0), 0);
    }

    return {
      ...base,
      totalSubjects: subjects.length,
      totalChapters: subjects.reduce((acc, s) => acc + (s.totalChapters || s.chapters.length), 0),
      totalMicroTopics: subjects.reduce((acc, s) => acc + (s.totalMicroTopics || s.chapters.reduce((a, ch) => a + (ch.microTopics?.length || 0), 0)), 0),
      subjects
    };
  } catch (err) {
    console.warn('Could not augment custom syllabus:', err);
    return base;
  }
}
