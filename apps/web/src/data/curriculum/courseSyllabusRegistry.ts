/**
 * TeachO Master Course Syllabus Registry
 * Complete Authentic Real-World Micro-Granular Curricula for all 86 Courses:
 * - Foundational Stage: LKG, UKG, Class 1, Class 2 (Ages 3–8)
 * - Preparatory Stage: Class 3, Class 4, Class 5 (Ages 8–11)
 * - Middle Stage: Class 6, Class 7, Class 8 (Ages 11–14)
 * - Secondary Stage: Class 9, Class 10 (Ages 14–16)
 * - Higher Secondary, Competitive Exams, Skills, College & Degrees
 */

import { UPSC_OPTIONALS_REGISTRY } from './upscCurriculumData';
import {
  NEET_UG_OFFICIAL_SUBJECTS,
  JEE_MAIN_ADVANCED_OFFICIAL_SUBJECTS,
  TNPSC_UNIFIED_OFFICIAL_SUBJECTS
} from './officialExhaustiveSyllabi';

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

export function getFoundationalClass1to2Syllabus(
  courseId: string,
  courseTitle: string
): CourseFullSyllabus {
  const isTa = courseTitle.includes('தமிழ்') || courseId.includes('-ta-');
  const subjects: SyllabusSubject[] = [
    {
      subjectId: 'fnd_tamil',
      subjectName: 'தமிழ் (Tamil — உயிர், மெய் எழுத்துக்கள் & மழலையர் பாடல்)',
      icon: '🔤',
      color: '#ec4899',
      totalChapters: 4,
      totalMicroTopics: 12,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: 'உயிர் எழுத்துக்கள் (12) & ஆய்த எழுத்து (ஃ)',
          description:
            'அ முதல் ஔ வரை உள்ள 12 உயிர் எழுத்துக்கள், ஆய்த எழுத்து ஃ, படங்களைப் பார்த்து எழுத்துக்களை அடையாளம் காணுதல்',
          subtopics: [
            {
              id: 'fnd_t_sub1',
              title: 'உயிர் எழுத்துக்கள் உச்சரிப்பு & படித்தல்',
              microTopics: [
                {
                  id: 'fnd_t_1',
                  title: 'குறில் மற்றும் நெடில் உயிர் எழுத்துக்கள் (அ, ஆ, இ, ஈ...)',
                  keyAxiom:
                    'உயிர் எழுத்துக்கள் 12: குறில் 5 (அ, இ, உ, எ, ஒ), நெடில் 7 (ஆ, ஈ, ஊ, ஏ, ஐ, ஒ, ஔ)'
                },
                {
                  id: 'fnd_t_2',
                  title: 'ஆய்த எழுத்து (ஃ) — எ ஃ கு, அ ஃது உச்சரிப்பு & பயன்பாடு',
                  keyAxiom: 'ஆய்த எழுத்து சொல்லின் இடையில் மட்டுமே வரும் தனிநிலை எழுத்து'
                }
              ]
            }
          ],
          microTopics: [
            {
              id: 'fnd_t_1',
              topicTitle: 'குறில் மற்றும் நெடில் உயிர் எழுத்துக்கள் (அ முதல் ஔ வரை)',
              subtopic: 'படங்களை பார்த்து எழுத்துகளை அறிதல்',
              dayNumber: 1,
              periodNumber: 1,
              keyFormulaOrLaw:
                'உயிர் எழுத்துக்கள்: அ, ஆ, இ, ஈ, உ, ஊ, எ, ஏ, ஐ, ஒ, ஓ, ஔ (மொத்தம் 12)',
              keyPoints: [
                'அ - அணில், அம்மா',
                'ஆ - ஆடு, ஆலமரம்',
                'இ - இலை, இஞ்சி',
                'ஈ - ஈட்டி, ஈசல்'
              ],
              type: 'concept',
              importance: 'Foundational'
            }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: 'மெய் எழுத்துக்கள் (18) — வல்லினம், மெல்லினம், இடையினம்',
          description:
            'க் முதல் ன் வரை உள்ள 18 புள்ளி வைத்த மெய் எழுத்துக்கள் மற்றும் 3 இனப் பிரிவுகள்',
          subtopics: [
            {
              id: 'fnd_t_sub2',
              title: 'மெய் எழுத்துக்கள் மூவினப் பிரிவுகள்',
              microTopics: [
                {
                  id: 'fnd_t_3',
                  title: 'வல்லினம் ( க, ச, ட, த, ப, ற — க், ச், ட், த், ப், ற்) உச்சரிப்பு',
                  keyAxiom: 'வல்லினம் வன்மையான ஓசையுடைய எழுத்துக்கள்'
                },
                {
                  id: 'fnd_t_4',
                  title: 'மெல்லினம் ( ங, ஞ, ண, ந, ம, ன) & இடையினம் (ய, ர, ல, வ, ழ, ள)',
                  keyAxiom: 'மெல்லினம் மென்மையான ஓசை; இடையினம் இடைப்பட்ட ஓசை'
                }
              ]
            }
          ],
          microTopics: [
            {
              id: 'fnd_t_3',
              topicTitle: 'மெய் எழுத்துக்கள் 18 வகைப்பாடு (வல்லினம், மெல்லினம், இடையினம்)',
              subtopic: 'க, ச, ட, த, ப, ற, ங, ஞ, ண, ந, ம, ன, ய, ர, ல, வ, ழ, ள உச்சரிப்பு',
              dayNumber: 4,
              periodNumber: 1,
              keyFormulaOrLaw:
                'வல்லினம்: க், ச், ட், த், ப், ற் | மெல்லினம்: ங், ஞ், ண், ந், ம், ன் | இடையினம்: ய், ர், ல், வ், ழ், ள்',
              keyPoints: [
                'மெய் எழுத்துக்கள் புள்ளி பெற்ற எழுத்துக்கள்',
                'மொத்தம் 18 மெய் எழுத்துக்கள்'
              ],
              type: 'concept',
              importance: 'Foundational'
            }
          ]
        },
        {
          chapterNumber: 3,
          chapterTitle: 'உயிர்மெய் எழுத்துக்கள் அறிமுகம் & சொல் விளையாட்டு',
          description:
            'உயிர் + மெய் இணையும் உயிர்மெய் எழுத்துக்கள் (216) & எளிய 2, 3 எழுத்துச் சொற்கள்',
          subtopics: [
            {
              id: 'fnd_t_sub3',
              title: 'உயிர்மெய் உருவாக்க வாய்பாடு',
              microTopics: [
                {
                  id: 'fnd_t_5',
                  title: 'க் + அ = க வரிசை முதல் க் + ஔ = கௌ வரை',
                  keyAxiom: 'உயிர்மெய் எழுத்துக்கள் மொத்தம் 18 × 12 = 216 எழுத்துக்கள்'
                }
              ]
            }
          ],
          microTopics: [
            {
              id: 'fnd_t_5',
              topicTitle: 'உயிர்மெய் எழுத்துக்கள் அட்டவணை & எளிய சொற்கள்',
              subtopic: 'க் + அ = க வாய்பாடு மற்றும் படச் சொற்கள்',
              dayNumber: 7,
              periodNumber: 1,
              keyFormulaOrLaw:
                'உயிர் (12) + மெய் (18) = உயிர்மெய் (216) | தமிழ் மொத்த எழுத்துக்கள் = 247',
              keyPoints: ['கல், கண், பல், மரம், படம் போன்ற எளிய சொற்களை எழுதுதல்'],
              type: 'concept',
              importance: 'Foundational'
            }
          ]
        },
        {
          chapterNumber: 4,
          chapterTitle: 'ஔவையார் ஆத்திச₹டி, நீதிப்பாடல்கள் & கதைகள்',
          description:
            'அறஞ்செய விரும்பு முதல் ஓடலின் நன்று வரை ஆத்திச₹டி வரிகள் மற்றும் நற்பண்புகள்',
          subtopics: [
            {
              id: 'fnd_t_sub4',
              title: 'ஆத்திச₹டி நற்பண்புகள் & கதைகள்',
              microTopics: [
                {
                  id: 'fnd_t_6',
                  title: 'அறஞ்செய விரும்பு, ஆறுவது சினம், இயல்வது கரவேல் விளக்கம்',
                  keyAxiom: 'ஆத்தி ச₹ டி பா டியவர் ஔவையார் — எளிய நன்னெறி நீதி நூல்'
                }
              ]
            }
          ],
          microTopics: [
            {
              id: 'fnd_t_6',
              topicTitle: 'ஔவையார் ஆத்திச₹டி (12 வரிகள் & நயவுரை)',
              subtopic: 'அறஞ்செய விரும்பு — எப்போதும் நல்ல செயல்களை ச் செய்',
              dayNumber: 10,
              periodNumber: 1,
              keyFormulaOrLaw:
                'ஆத்தி ச₹ டி: "அறஞ்செய விரும்பு", "ஆறுவது சினம்", "ஈயது வில க் க இல்"',
              keyPoints: ['ஔவையார் அருளிய நீதி நெறிமுறைகளை அன்றா ட வாழ்வில் கடைப்பிடித்தல்'],
              type: 'memorization',
              importance: 'High-Yield'
            }
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
          description:
            'Letter sounds, phoneme recognition, and 3-letter CVC word blending (-at, -en, -in, -og, -un)',
          subtopics: [
            {
              id: 'fnd_e_sub1',
              title: 'Phonics Sounds & CVC Blending',
              microTopics: [
                {
                  id: 'fnd_e_1',
                  title: 'Letter Sounds /a/ to /z/ & Phonics Rhymes',
                  keyAxiom: '26 Letters representing 44 English Phoneme sounds'
                },
                {
                  id: 'fnd_e_2',
                  title: 'CVC 3-Letter Blending (Cat, Pen, Pin, Dog, Sun)',
                  keyAxiom: 'Consonant + Vowel + Consonant word formation'
                }
              ]
            }
          ],
          microTopics: [
            {
              id: 'fnd_e_1',
              topicTitle: 'Letters A to Z Phonics & CVC Word Blends',
              subtopic: 'Bat, Cat, Mat, Hen, Pen, Tin, Pin, Pot, Dot, Sun, Run',
              dayNumber: 2,
              periodNumber: 2,
              keyFormulaOrLaw: 'Phonics: /b/ + /æ/ + /t/ = Bat | CVC Blending Pattern',
              keyPoints: [
                'Short vowel sounds (a, e, i, o, u)',
                'Visual word cards and picture matching'
              ],
              type: 'concept',
              importance: 'Foundational'
            }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: 'Sight Words, Action Verbs & Simple Sentences',
          description:
            'High-frequency sight words (The, Is, In, On, Under, This, That) and action words (Run, Jump, Read)',
          subtopics: [
            {
              id: 'fnd_e_sub2',
              title: 'Sight Words & Sentence Building',
              microTopics: [
                {
                  id: 'fnd_e_3',
                  title: 'High-Frequency Sight Words (He, She, It, They, We)',
                  keyAxiom: 'Recognize sight words by sight without sounding out'
                },
                {
                  id: 'fnd_e_4',
                  title: 'Action Words & Simple Subject + Verb Sentences',
                  keyAxiom: 'Sentence structure: "This is a cat", "The dog can run"'
                }
              ]
            }
          ],
          microTopics: [
            {
              id: 'fnd_e_3',
              topicTitle: 'Sight Words Mastery & Simple Reading Sentences',
              subtopic: 'This is my bag, I can jump, The sun is hot',
              dayNumber: 5,
              periodNumber: 2,
              keyFormulaOrLaw: 'Sentence Rule: Start with Capital letter, End with Full Stop (.)',
              keyPoints: [
                'Top 20 Dolch sight words for early readers',
                'Forming 3 to 4 word simple sentences'
              ],
              type: 'concept',
              importance: 'Foundational'
            }
          ]
        },
        {
          chapterNumber: 3,
          chapterTitle: 'Classic Nursery Rhymes & Picture Story Reading',
          description:
            'Twinkle Twinkle, Baa Baa Black Sheep, Jack and Jill, and Aesop moral fables',
          subtopics: [
            {
              id: 'fnd_e_sub3',
              title: 'Rhymes & Moral Picture Stories',
              microTopics: [
                {
                  id: 'fnd_e_5',
                  title: 'Classic English Rhymes with Actions',
                  keyAxiom: 'Rhyming words: Star-Far, High-Sky, Sheep-Wool'
                },
                {
                  id: 'fnd_e_6',
                  title: 'Aesop Moral Stories (The Thirsty Crow, The Hare and Tortoise)',
                  keyAxiom: 'Moral values: Hard work and patience bring success'
                }
              ]
            }
          ],
          microTopics: [
            {
              id: 'fnd_e_5',
              topicTitle: 'Nursery Rhymes, Rhythm & Story Comprehension',
              subtopic: 'The Thirsty Crow and The Tortoise & The Hare story reading',
              dayNumber: 8,
              periodNumber: 2,
              keyFormulaOrLaw: 'Rhyming Pair: Ring - Sing | King - Wing | Cat - Hat',
              keyPoints: [
                'Identifying main characters in a picture story',
                'Reciting rhymes with correct intonation and actions'
              ],
              type: 'memorization',
              importance: 'Foundational'
            }
          ]
        },
        {
          chapterNumber: 4,
          chapterTitle: 'Grammar Basics: Naming Words (Nouns) & Pronouns',
          description:
            'Person, Place, Animal, Thing naming words, One & Many (Singular/Plural -s, -es), He/She/It',
          subtopics: [
            {
              id: 'fnd_e_sub4',
              title: 'Nouns & Singular/Plural Concepts',
              microTopics: [
                {
                  id: 'fnd_e_7',
                  title: 'Naming Words: Person, Place, Animal, Thing',
                  keyAxiom: 'A Noun is the name of a person, place, animal, or object'
                },
                {
                  id: 'fnd_e_8',
                  title: 'Singular & Plural (Book -> Books, Box -> Boxes)',
                  keyAxiom: 'Add -s or -es to change one into many'
                }
              ]
            }
          ],
          microTopics: [
            {
              id: 'fnd_e_7',
              topicTitle: 'Nouns (Naming Words) & Singular/Plural Concept',
              subtopic: 'Boy -> Boys, Apple -> Apples, Cat -> Cats',
              dayNumber: 11,
              periodNumber: 2,
              keyFormulaOrLaw:
                'Noun Definition: Person / Place / Animal / Thing | Singular + s = Plural',
              keyPoints: [
                'Underlining nouns in simple sentences',
                'Using He for boys, She for girls, It for things and animals'
              ],
              type: 'solved_problem',
              importance: 'High-Yield'
            }
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
          chapterTitle: isTa
            ? 'எண்கள், இ டமதிப்பு & க₹ ட் டல்/ கழித்தல்'
            : 'Numbers (1–100), Place Value & Addition/Subtraction',
          description: isTa
            ? '2 மற்றும் 3 இலக்க எண்கள், பத்து கள்/ ஒன்று கள் இ டமதிப்பு, க₹ ட் டல் கழித்தல் கணக்குகள்'
            : '2 & 3-digit numbers, Tens/Ones place value, Skip counting (2s, 5s, 10s), Word problems',
          subtopics: [
            {
              id: 'fnd_m_sub1',
              title: 'எண்கள் & இடமதிப்பு அடிப்படை',
              microTopics: [
                {
                  id: 'fnd_m_1',
                  title: 'இடமதிப்பு & 2 இலக்க எண்கள் (Tens & Ones)',
                  keyAxiom: '1 Ten = 10 Ones | 1 Hundred = 10 Tens'
                },
                {
                  id: 'fnd_m_2',
                  title: 'க₹ட்டல் & கழித்தல் எளிய கணக்குகள்',
                  keyAxiom: 'Addition combines (+) | Subtraction takes away (-)'
                }
              ]
            }
          ],
          microTopics: [
            {
              id: 'fnd_m_1',
              topicTitle: isTa
                ? 'இடமதிப்பு & 2 இலக்க எண்கள் (Tens & Ones)'
                : 'Place Value & 2-Digit Numbers (Tens & Ones)',
              subtopic: isTa
                ? 'மணி கள் சட்டம் மூலம் இ டமதிப்பு அறிதல்'
                : 'Abacus representation, tens and ones grouping',
              dayNumber: 3,
              periodNumber: 3,
              keyFormulaOrLaw: 'Place Value: 1 Ten = 10 Ones | 1 Hundred = 10 Tens',
              keyPoints: ['Grouping into bundles of tens', 'Expanded form: 47 = 40 + 7'],
              type: 'concept',
              importance: 'Foundational'
            },
            {
              id: 'fnd_m_2',
              topicTitle: isTa
                ? 'க₹ட்டல் & கழித்தல் எளிய கணக்குகள்'
                : 'Addition & Subtraction Word Problems',
              subtopic: isTa
                ? 'ந ட ஈமுறை வாழ் க் க ஈ கணக்கீடுகள்'
                : 'Single and double-digit operations with carry-over and borrowing',
              dayNumber: 6,
              periodNumber: 3,
              keyFormulaOrLaw: 'Addition: Combine groups (+) | Subtraction: Take away (-)',
              keyPoints: [
                'Word problem keywords: Total, In all, Left, Difference',
                'Checking subtraction using addition'
              ],
              type: 'solved_problem',
              importance: 'High-Yield'
            }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: isTa
            ? 'பெருக்கல் வாய்ப்பாடுகள் (1–10) & நாணயங்கள்'
            : 'Multiplication Tables (1–10) & Indian Currency',
          description: isTa
            ? 'தொடர் க₹ட்டலே பெருக்கல், சமமாகப் பிரித்தலே வகுத்தல், இந்திய ர₹பாய் நோட்டுகள்'
            : 'Multiplication as repeated addition, Division as sharing, Indian coins & notes',
          subtopics: [
            {
              id: 'fnd_m_sub2',
              title: 'பெருக்கல் வாய்ப்பாடு & நாணயங்கள்',
              microTopics: [
                {
                  id: 'fnd_m_3',
                  title: 'பெருக்கல் வாய்ப்பாடுகள் (2, 3, 4, 5, 10)',
                  keyAxiom: 'Multiplication is repeated addition: 3 4 = 4 + 4 + 4 = 12'
                },
                {
                  id: 'fnd_m_4',
                  title: 'இந்திய நாணயங்கள் & ர₹பாய் நோட்டுகள் (₹1 முதல்₹100)',
                  keyAxiom: '1 Rupee (₹1) = 100 Paise'
                }
              ]
            }
          ],
          microTopics: [
            {
              id: 'fnd_m_3',
              topicTitle: isTa
                ? 'பெருக்கல் வாய்ப்பாடு & தொடர் க₹ட்டல்'
                : 'Multiplication Tables & Repeated Addition',
              subtopic: isTa
                ? '2, 3, 5, 10 வாய்ப்பாடுகள் பயிற்சி'
                : 'Visual array grouping and tables 1 to 10',
              dayNumber: 9,
              periodNumber: 3,
              keyFormulaOrLaw: 'Multiplication: 3 4 = 4 + 4 + 4 = 12',
              keyPoints: [
                'Order of multiplication does not change product (a b = b a)',
                'Multiplying any number by 0 gives 0; by 1 gives same number'
              ],
              type: 'memorization',
              importance: 'High-Yield'
            }
          ]
        },
        {
          chapterNumber: 3,
          chapterTitle: isTa
            ? 'வடிவியல் (2D Shapes), காலம் & அளவீடுகள்'
            : 'Geometry (2D/3D Shapes), Time & Measurement',
          description: isTa
            ? 'வட்டம், சதுரம், செவ்வகம், முக்கோணம், கடிகார நேரம் பார்த்தல், நீளம் எடை அளவுகள்'
            : 'Circle, Square, Rectangle, Triangle, Clock time reading, Length/Weight',
          subtopics: [
            {
              id: 'fnd_m_sub3',
              title: 'வடிவங்கள் & கடிகார நேரம்',
              microTopics: [
                {
                  id: 'fnd_m_5',
                  title: '2D & 3D வடிவங்களின் பக்கங்கள் மற்றும் முனைகள்',
                  keyAxiom:
                    'Square (4 equal sides), Rectangle (opposite sides equal), Triangle (3 sides)'
                }
              ]
            }
          ],
          microTopics: [
            {
              id: 'fnd_m_5',
              topicTitle: isTa
                ? 'வடிவங்கள் (Shapes), காலம் & அளவீடுகள்'
                : '2D Shapes, Clock Time & Measurement',
              subtopic: isTa
                ? 'சதுரம், செவ்வகம், மு க் கோணம், வட்டம்'
                : 'Identifying shapes, Hour hand and Minute hand on clock',
              dayNumber: 12,
              periodNumber: 3,
              keyFormulaOrLaw: 'Clock: 1 Hour = 60 Minutes | 1 Day = 24 Hours',
              keyPoints: [
                'Short hand shows hours; long hand shows minutes',
                'Square has 4 equal sides and 4 corners'
              ],
              type: 'concept',
              importance: 'Foundational'
            }
          ]
        }
      ]
    },
    {
      subjectId: 'fnd_science',
      subjectName: isTa
        ? 'ச₹ழ்நிலையியல் & அறிவியல் (General Science & EVS)'
        : 'General Science & Environmental Studies',
      icon: '🌿',
      color: '#10b981',
      totalChapters: 2,
      totalMicroTopics: 8,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: isTa
            ? 'மனித உடல் உறுப்புகள், ஐம்புலன்கள் & சுகாதாரம்'
            : 'My Body Organs, 5 Senses & Daily Hygiene',
          description: isTa
            ? 'கண், காது, மூ க் கு, நா க் கு, தோல் மற்றும் ஆரோ க் கிய உணவு கள்'
            : '5 senses, Internal organs (Heart, Lungs, Brain), Clean habits',
          subtopics: [
            {
              id: 'fnd_s_sub1',
              title: 'உடல் உறுப்பு கள் & நற்பழக்கங்கள்',
              microTopics: [
                {
                  id: 'fnd_s_1',
                  title: 'ஐம்புலன் கள் மற்றும் அவற்றின் பணிகள்',
                  keyAxiom: 'Eyes see, Ears hear, Nose smells, Tongue tastes, Skin feels'
                }
              ]
            }
          ],
          microTopics: [
            {
              id: 'fnd_s_1',
              topicTitle: isTa
                ? 'ஐம்புலன் கள் & மனித உடல் உறுப்பு களின் பணிகள்'
                : '5 Sense Organs & Daily Healthy Habits',
              subtopic: isTa
                ? 'பார்வை, கேட்டல், நு கர்தல், சுவை, தொடுதல்'
                : 'Eyes, Ears, Nose, Tongue, Skin functions; Hand hygiene',
              dayNumber: 13,
              periodNumber: 4,
              keyFormulaOrLaw: '5 Sense Organs | Wash hands with soap for 20 seconds',
              keyPoints: [
                'Eat healthy green vegetables and fresh fruits',
                'Drink clean boiled water daily'
              ],
              type: 'concept',
              importance: 'Foundational'
            }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: isTa
            ? 'தாவரங்கள், விலங்குகள் & பருவ காலங்கள்'
            : 'Plants, Animals & Weather Seasons',
          description: isTa
            ? 'மரங்கள், செடிகள், வீட்டு மற்றும் காட்டு விலங்குகள், கோடை/மழை/ குளிர் பருவ ங் கள்'
            : 'Trees, Shrubs, Herbs, Animals, Weather and 4 seasons',
          subtopics: [
            {
              id: 'fnd_s_sub2',
              title: 'இயற்கை உலகம் & விலங்குகள்',
              microTopics: [
                {
                  id: 'fnd_s_2',
                  title: 'தாவர ங் களின் பாகங்கள் (வேர், தண்டு, இலை, பூ, காய்)',
                  keyAxiom: 'Plants give food, oxygen, and shade to all living beings'
                }
              ]
            }
          ],
          microTopics: [
            {
              id: 'fnd_s_2',
              topicTitle: isTa
                ? 'தாவர பாகங்கள் & வீட்டு/ காட்டு விலங்குகள்'
                : 'Plant Parts & Animal Habitats',
              subtopic: isTa
                ? 'வேர், தண்டு, இலை, பூ மற்றும் விலங்கு உணவு கள்'
                : 'Root, Stem, Leaf, Flower; Herbivores and Carnivores',
              dayNumber: 15,
              periodNumber: 4,
              keyFormulaOrLaw: 'Photosynthesis: Leaves prepare food using sunlight and water',
              keyPoints: [
                'Domestic animals: Cow, Goat, Dog, Cat',
                'Wild animals: Lion, Tiger, Elephant, Deer'
              ],
              type: 'concept',
              importance: 'Foundational'
            }
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
    totalMicroTopics: subjects.reduce(
      (a, s) =>
        a +
        (s.totalMicroTopics ||
          s.chapters.reduce((acc, c) => acc + (c.microTopics?.length || 0), 0)),
      0
    ),
    subjects
  };
}

export function getPreparatoryClass3to5Syllabus(
  courseId: string,
  courseTitle: string
): CourseFullSyllabus {
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
          description:
            'பாரதிதாசன் இன்பத்தமிழ், ஔவையார் மூதுரை (அட்டாலும் பால் சுவையில் குன்றாது), திருக்குறள் அன்புடைமை & இனியவை கூறல்',
          subtopics: [
            {
              id: 'prep_t_sub1',
              title: 'பாரதிதாசன் இன்பத்தமிழ் & மூதுரை',
              microTopics: [
                {
                  id: 'prep_t_1',
                  title: 'தமிழுக்கும் அமுதென்று பேர் — பாரதிதாசன் கவிதை நயம்',
                  keyAxiom: 'தமிழ ஈ உயிருக்கு நேராகப் போற்றிய புரட்சிக் கவிஞர் பாரதிதாசன்'
                },
                {
                  id: 'prep_t_2',
                  title: 'ஔவையார் மூதுரை — நல்லோர் நட்பின் சிறப்பு & மனப்பாடப் பகுதி',
                  keyAxiom:
                    '"அட்டாலும் பால் சுவையில் குன்றாது" — அறிஞர்கள் வறுமையிலும் நற்பண்பு தவறார்'
                }
              ]
            }
          ],
          microTopics: [
            {
              id: 'prep_t_1',
              topicTitle: 'பாரதிதாசன் இன்பத்தமிழ் & ஔவையார் மூதுரை',
              subtopic: 'தமிழுக்கும் அமுதென்று பேர் & அட்டாலும் பால் சுவையில் குன்றாது',
              dayNumber: 1,
              periodNumber: 1,
              keyFormulaOrLaw:
                'பாரதிதாசன்: "தமிழுக்கும் அமுதென்று பேர்! அந்தத் தமிழென்ப பேரின்பத் தமிழெங்கள் உயிருக்கு நேர்!"',
              keyPoints: [
                'பாரதிதாசனின் இயற்பெயர் சுப்புரத்தினம்',
                'மூதுரை நீதி நூல் ஆசிரியர் ஔவையார்'
              ],
              type: 'memorization',
              importance: 'High-Yield'
            }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: 'உரைநடை உலகம் (தமிழரின் வீர விளையாட்டுகள் & கல்விக்கண் திறந்த காமராசர்)',
          description:
            'ஏறுதழுவுதல் (ஜல்லிக்கட்டு), சிலம்பாட்டம், கபடி, காமராசரின் கல்விப் புரட்சி & இலவச மதிய உணவுத் திட்டம்',
          subtopics: [
            {
              id: 'prep_t_sub2',
              title: 'தமிழர் மரபு & வரலாற்று ஆளுமைகள்',
              microTopics: [
                {
                  id: 'prep_t_3',
                  title: 'தமிழரின் வீர விளையாட்டுகள் (ஏறுதழுவுதல் & சிலம்பம்)',
                  keyAxiom:
                    'ஏறுதழுவுதல் தமிழரின் இரண்டாயிரம் ஆண்டு தொன்மையான முல்லை நில வீர விளையாட்டு'
                },
                {
                  id: 'prep_t_4',
                  title: 'காமராசரின் கல்விப் பணிகள் — இலவசக் கல்வி & மதிய உணவு',
                  keyAxiom:
                    'பட்டிதொட்டியெங்கும் பள்ளிகள் திறந்து கல்விக்கண் திறந்த பெருந்தலைவர் காமராசர்'
                }
              ]
            }
          ],
          microTopics: [
            {
              id: 'prep_t_3',
              topicTitle: 'தமிழர் வீர விளையாட்டுகள் & காமராசர் கல்வித் தொண்டு',
              subtopic: 'ஏறுதழுவுதல், சிலம்பம், கபடி மற்றும் மதிய உணவுத் திட்டம்',
              dayNumber: 4,
              periodNumber: 1,
              keyFormulaOrLaw:
                'காமராசர்: கல்விக்கண் திறந்த காமராசர் | ஏறுதழுவுதல்: முல்லை நிலப் பண்பாட்டு அடையாளம்',
              keyPoints: [
                'காமரா சரு க் கு பாரத ரத்னா விருது வழங்கப்பட்ட ஆண்டு 1976',
                'ஜல்லிக்கட்டு பற்றிய குறிப்புகள் கலித்தொகையில் உள்ளன'
              ],
              type: 'concept',
              importance: 'High-Yield'
            }
          ]
        },
        {
          chapterNumber: 3,
          chapterTitle: 'விரிவானம் / துணைப்பாடம் (முயல் சொன்ன கதை & தலைமைப் பண்பு)',
          description: 'நீதி க் கதைகள், நற்பண்பு கள், தலைமைத்துவ குணங்கள், நாட்டுப்புறக் கதைகள்',
          subtopics: [
            {
              id: 'prep_t_sub3',
              title: 'நீதி க் கதைகள் & நற்பண்பு வளர்ப்பு',
              microTopics: [
                {
                  id: 'prep_t_5',
                  title: 'முயலின் புத்தி க் க₹ர்ம ஈ கதை & தலைமைப் பண்பு தத்துவம்',
                  keyAxiom: 'உடல் பலத்தை விட அறிவு பலமே சிறந்தது'
                }
              ]
            }
          ],
          microTopics: [
            {
              id: 'prep_t_5',
              topicTitle: 'துணைப்பாடக் கதைகள் — சமயோ சித புத்தி & தலைமைத்துவம்',
              subtopic: 'முயல் சொன்ன கதை மற்றும் தலைமைப் பண்பு படிப்பினைகள்',
              dayNumber: 7,
              periodNumber: 1,
              keyFormulaOrLaw:
                'நீதி: "அறிவே ஆற்றல்" — துன்பம் வரும் வேளையில் அறிவு க் க₹ர்ம ஈயு டன் செயல்ப ட வேண்டும்',
              keyPoints: ['கதையின் மையக் கருத்தை உணர்ந்து சொந்த ந ட ஈயில் விவரித்தல்'],
              type: 'concept',
              importance: 'Foundational'
            }
          ]
        },
        {
          chapterNumber: 4,
          chapterTitle: 'கற்கண்டு / இலக்கணம் (திணை, பால், எண், இ டம் & காலங்கள்)',
          description:
            'உயர்திணை/ அஃறிணை, ஐம்பால் (ஆண்பால், பெண்பால், பலர்பால், ஒன்றன்பால், பலவின்பால்), மூவிடம், முக்காலம்',
          subtopics: [
            {
              id: 'prep_t_sub4',
              title: 'தமிழ் இலக்கண அடிப்படை',
              microTopics: [
                {
                  id: 'prep_t_6',
                  title: 'திணை (2) & ஐம்பால் பாகுபாடு',
                  keyAxiom:
                    'திணை: உயர்திணை (மனிதர்/தேவர்), அஃறிணை (விலங்கு/பொருட்கள்) | பால்: ஆண், பெண், பலர், ஒன்று, பல'
                },
                {
                  id: 'prep_t_7',
                  title: 'முக்காலம் (இறந்த, நி கழ், எதிர் காலம்) & மயங்கொலிகள் (ண, ந, ன / ல, ழ, ள)',
                  keyAxiom: 'மயங்கொலி எழுத்துக்கள் 8: ண-ந-ன, ல-ழ-ள, ர-ற'
                }
              ]
            }
          ],
          microTopics: [
            {
              id: 'prep_t_6',
              topicTitle: 'திணை (2 வகை), பால் (5 வகை), இ டம் (3) & மயங்கொலி எழுத்துக்கள்',
              subtopic: 'உயர்திணை/ அஃறிணை மற்றும் ண-ந-ன, ல-ழ-ள வேறுபாடுகள்',
              dayNumber: 10,
              periodNumber: 1,
              keyFormulaOrLaw:
                'திணை: உயர்திணை, அஃறிணை | பால்: ஆண்பால், பெண்பால், பலர்பால், ஒன்றன்பால், பலவின்பால்',
              keyPoints: [
                'மனிதர்கள் உயர்திணை; பறவைகள், விலங்குகள், தாவரங்கள் அஃறிணை',
                'மழை (மாரி), மாலை (அந்திப்பொழுது), மாழை (உலோகம்) பொருள் வேறுபாடு'
              ],
              type: 'solved_problem',
              importance: 'High-Yield'
            }
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
          description:
            'Reading comprehension, Christina Rossetti\'s poem "The Rainbow", Vocabulary, Synonyms & Antonyms',
          subtopics: [
            {
              id: 'prep_e_sub1',
              title: 'Unit 1: Literature & Reading',
              microTopics: [
                {
                  id: 'prep_e_1',
                  title: 'Prose: The Magic Fish & Moral Comprehension',
                  keyAxiom: 'Greed leads to downfall; contentment brings true happiness'
                },
                {
                  id: 'prep_e_2',
                  title: 'Poem: The Rainbow (Boats sail on rivers, but clouds sail across the sky)',
                  keyAxiom: "Nature's creations are far more beautiful than man-made ships"
                }
              ]
            }
          ],
          microTopics: [
            {
              id: 'prep_e_1',
              topicTitle: 'Prose: The Magic Fish & Poem: The Rainbow',
              subtopic: 'Comprehension, Rhyming Words & Synonyms',
              dayNumber: 2,
              periodNumber: 2,
              keyFormulaOrLaw:
                'Christina Rossetti: "Boats sail on the rivers, and ships sail on the seas; but clouds that sail across the sky are prettier far than these."',
              keyPoints: [
                'Identify rhyming words (seas-trees, sky-die)',
                "Theme: Nature's supreme beauty"
              ],
              type: 'memorization',
              importance: 'High-Yield'
            }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: 'Unit 2: Prose (*Brave Indian Warriors*) & Poem (*Trees are Kind*)',
          description:
            'Patriotism, Indian Army heroes, Nature conservation poem, Verb tenses and regular/irregular verbs',
          subtopics: [
            {
              id: 'prep_e_sub2',
              title: 'Unit 2: Bravery & Environment',
              microTopics: [
                {
                  id: 'prep_e_3',
                  title: 'Prose: Brave Indian Warriors & Param Vir Chakra Heroes',
                  keyAxiom: 'Sacrifices of soldiers defending Indian borders'
                },
                {
                  id: 'prep_e_4',
                  title: 'Poem: Trees are the Kindest Things I Know',
                  keyAxiom:
                    'Trees give fruit, wood, shade, and oxygen without asking anything in return'
                }
              ]
            }
          ],
          microTopics: [
            {
              id: 'prep_e_3',
              topicTitle: 'Prose: Brave Warriors & Poem: Trees are the Kindest Things',
              subtopic: 'Tenses (Simple Present, Past, Future) and Paragraph Writing',
              dayNumber: 5,
              periodNumber: 2,
              keyFormulaOrLaw: 'Tenses: Present (play), Past (played), Future (will play)',
              keyPoints: [
                "Param Vir Chakra is India's highest military gallantry award",
                'Regular verbs take -ed; Irregular verbs change form (go -> went -> gone)'
              ],
              type: 'concept',
              importance: 'High-Yield'
            }
          ]
        },
        {
          chapterNumber: 3,
          chapterTitle: 'Unit 3: Supplementary (*The Honest Woodcutter & Tenali Raman*)',
          description:
            'Moral stories, witty intelligence of Tenali Raman, character analysis and dialogue delivery',
          subtopics: [
            {
              id: 'prep_e_sub3',
              title: 'Unit 3: Supplementary Stories',
              microTopics: [
                {
                  id: 'prep_e_5',
                  title: 'Story: The Honest Woodcutter (Golden Axe vs Iron Axe)',
                  keyAxiom: 'Honesty is always rewarded by the goddess of water'
                },
                {
                  id: 'prep_e_6',
                  title: 'Story: Tenali Raman and the Thieves',
                  keyAxiom: 'Witty thinking outsmarts criminals without violence'
                }
              ]
            }
          ],
          microTopics: [
            {
              id: 'prep_e_5',
              topicTitle: 'Supplementary: The Honest Woodcutter & Tenali Raman Wit',
              subtopic: 'Character Sketches, Dialogue Comprehension & Vocabulary',
              dayNumber: 8,
              periodNumber: 2,
              keyFormulaOrLaw:
                'Moral: "Honesty is the Best Policy" | Tenali Raman: Court poet of Krishnadevaraya',
              keyPoints: [
                'Sequence the story events in correct chronological order',
                'Direct speech quotation marks usage'
              ],
              type: 'concept',
              importance: 'Foundational'
            }
          ]
        },
        {
          chapterNumber: 4,
          chapterTitle: 'Unit 4: Grammar Master (Parts of Speech, Prepositions & Punctuation)',
          description:
            'Nouns, Pronouns, Adjectives (Degrees), Verbs, Adverbs, Prepositions (in, on, under, between), Conjunctions (and, but, or)',
          subtopics: [
            {
              id: 'prep_e_sub4',
              title: 'Unit 4: Functional Grammar',
              microTopics: [
                {
                  id: 'prep_e_7',
                  title: '8 Parts of Speech & Adjectives Degrees of Comparison',
                  keyAxiom: 'Positive (tall), Comparative (taller), Superlative (tallest)'
                },
                {
                  id: 'prep_e_8',
                  title: 'Prepositions of Place/Time & Conjunctions (and, but, because)',
                  keyAxiom: 'Prepositions show relationship between noun and other words'
                }
              ]
            }
          ],
          microTopics: [
            {
              id: 'prep_e_7',
              topicTitle: '8 Parts of Speech, Degrees of Comparison & Prepositions',
              subtopic: 'Good-Better-Best, Prepositions (in, on, at, under) & Conjunctions',
              dayNumber: 11,
              periodNumber: 2,
              keyFormulaOrLaw:
                'Comparison: Tall -> Taller -> Tallest | Beautiful -> More Beautiful -> Most Beautiful',
              keyPoints: [
                'Use Comparative degree with "than" (A is taller than B)',
                'Use Superlative degree with "the" (A is the tallest boy)'
              ],
              type: 'solved_problem',
              importance: 'High-Yield'
            }
          ]
        }
      ]
    },
    {
      subjectId: 'prep_math',
      subjectName: isTa
        ? 'கணிதம் & அடிப்படை இயற்கணிதம் (Mathematics Core)'
        : 'Mathematics & Computational Arithmetic',
      icon: '📐ஐ',
      color: '#06b6d4',
      totalChapters: 3,
      totalMicroTopics: 12,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: isTa
            ? 'பெரிய எண்கள், காரணி & மடங்குகள் (HCF & LCM)'
            : 'Large Numbers, Factors, Multiples, HCF & LCM',
          description: isTa
            ? '5–6 இலக்க எண்கள், பகா எண்கள், மீ. சி.ம & மீ.பொ.வ, உரோமானிய எண்கள்'
            : '5 to 6-digit operations, Prime & Composite numbers, HCF & LCM, Roman Numerals',
          subtopics: [
            {
              id: 'prep_m_sub1',
              title: 'எண் கணிதம் & HCF/LCM',
              microTopics: [
                {
                  id: 'prep_m_1',
                  title: 'பகா எண்கள் & மீப்பெரு பொது காரணி (HCF / LCM)',
                  keyAxiom: 'Product of Two Numbers = HCF LCM'
                },
                {
                  id: 'prep_m_2',
                  title: 'பின்னங்கள் & தசம எண்கள் க₹ ட் டல்/ கழித்தல்',
                  keyAxiom: 'Like/Unlike fractions, Equivalent fractions'
                }
              ]
            }
          ],
          microTopics: [
            {
              id: 'prep_m_1',
              topicTitle: isTa
                ? 'பகா எண்கள் & பகா காரணிப்ப டுத்துதல் (HCF / LCM)'
                : 'Prime Factorization, HCF & LCM Fundamentals',
              subtopic: isTa
                ? 'மீப்பெரு பொது காரணி மற்றும் மீச்சிறு பொது மடங்கு'
                : 'Factor tree method, division method, Product = HCF LCM formula',
              dayNumber: 3,
              periodNumber: 3,
              keyFormulaOrLaw:
                'Product of Two Numbers = HCF LCM | Prime Numbers have exactly 2 factors (1 and itself)',
              keyPoints: ['2 is the only even prime number', 'Co-prime numbers have HCF = 1'],
              type: 'solved_problem',
              importance: 'High-Yield'
            }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: isTa
            ? 'நேர்வீத முறை, விழுக்காடு, இலாப நட்டம்'
            : 'Unitary Method, Percentages, Profit & Loss',
          description: isTa
            ? 'ஒரு பொருளின் விலை கொண்டு பல பொரு ட் களின் விலை காணுதல், சதவீத கணக்கீடுகள்'
            : 'Unitary method problems, Percentage conversions, Profit = SP - CP, Loss = CP - SP',
          subtopics: [
            {
              id: 'prep_m_sub2',
              title: 'வியாபாரக் கணிதம்',
              microTopics: [
                {
                  id: 'prep_m_3',
                  title: 'நேர்வீத முறை & எளிய விழுக்காடு கணக்கீடு',
                  keyAxiom: 'Unit Cost = Total Cost / Total Units | Profit = SP - CP'
                }
              ]
            }
          ],
          microTopics: [
            {
              id: 'prep_m_3',
              topicTitle: isTa
                ? 'நேர்வீத முறை & எளிய விழுக்காடு கணக்கீடு'
                : 'Unitary Method & Basic Percentages',
              subtopic: isTa
                ? 'அடக்க விலை, விற்ற விலை மற்றும் இலாப நட்டம்'
                : 'Find cost of 1 unit -> Multiply by desired quantity; % = (Value/Total) 100',
              dayNumber: 6,
              periodNumber: 3,
              keyFormulaOrLaw:
                'Unitary Rule: Unit Cost = Total Cost / Total Units | Profit = SP - CP (if SP > CP)',
              keyPoints: ['Profit% = (Profit / CP) 100', 'Discount = Marked Price - Selling Price'],
              type: 'solved_problem',
              importance: 'High-Yield'
            }
          ]
        },
        {
          chapterNumber: 3,
          chapterTitle: isTa
            ? 'வடிவியல்: கோணங்கள் & பரப்பளவு / சுற்றளவு'
            : 'Geometry: Angles, Perimeter & Area',
          description: isTa
            ? 'செங்கோணம், குறுங்கோணம், விரிகோணம், செவ்வகம்/ சதுரம் சுற்றளவு'
            : 'Acute, Right, Obtuse angles; Perimeter = Sum of all sides; Area of Rectangle = l w',
          subtopics: [
            {
              id: 'prep_m_sub3',
              title: 'வடிவியல் & அளவியல்',
              microTopics: [
                {
                  id: 'prep_m_4',
                  title: 'கோண ங் களின் வகைகள் & சுற்றளவு பரப்பளவு ச₹த்திர ங் கள்',
                  keyAxiom: 'Rectangle: P = 2(l+w), A = l w | Square: P = 4a, A = a '
                }
              ]
            }
          ],
          microTopics: [
            {
              id: 'prep_m_4',
              topicTitle: isTa
                ? 'வடிவியல்: கோணங்கள் & பரப்பளவு / சுற்றளவு'
                : 'Geometry: Angles, Perimeter & Area',
              subtopic: isTa
                ? 'செங்கோணம், குறுங்கோணம், விரிகோணம், செவ்வகம்/ சதுரம் சுற்றளவு'
                : 'Acute, Right, Obtuse angles; Perimeter = Sum of all sides; Area of Rectangle = l w',
              dayNumber: 9,
              periodNumber: 3,
              keyFormulaOrLaw:
                'Rectangle: Perimeter = 2(l + w), Area = l w | Square: Perimeter = 4a, Area = a ',
              keyPoints: [
                'Right angle = 90, Straight angle = 180 ',
                'Sum of angles in a triangle = 180 '
              ],
              type: 'solved_problem',
              importance: 'High-Yield'
            }
          ]
        }
      ]
    },
    {
      subjectId: 'prep_science',
      subjectName: isTa
        ? 'பொது அறிவியல் (General Science & Human Physiology)'
        : 'General Science & Human Organ Systems',
      icon: '🔬',
      color: '#10b981',
      totalChapters: 2,
      totalMicroTopics: 8,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: isTa
            ? 'மனித உறுப்பு மண்டலங்கள் &ஊட்டச்சத்து'
            : 'Human Organ Systems & Nutrition',
          description: isTa
            ? 'செரிமான மண்டலம், சுவாச மண்டலம், ரத்த ஓட்ட மண்டலம் & சரிவி கித உணவு'
            : 'Digestive, Respiratory, Circulatory, Nervous systems; Balanced diet (Carbs, Proteins, Vitamins, Minerals)',
          subtopics: [
            {
              id: 'prep_s_sub1',
              title: 'உறுப்பு மண்டலங்கள் & குறைபாட்டு நோய்கள்',
              microTopics: [
                {
                  id: 'prep_s_1',
                  title: 'செரிமான & சுவாச உறுப்பு மண்டலங்கள்',
                  keyAxiom: 'Respiration: Glucose + Oxygen -> Energy (ATP) + CO₹₹ + H₹₹O'
                },
                {
                  id: 'prep_s_2',
                  title: 'வைட்டமின்கள் A, B, C, D குறைபாட்டு நோய்கள்',
                  keyAxiom:
                    'Vit A (Night blindness), Vit C (Scurvy), Vit D (Rickets), Iron (Anemia)'
                }
              ]
            }
          ],
          microTopics: [
            {
              id: 'prep_s_1',
              topicTitle: isTa
                ? 'செரிமான & சுவாச உறுப்பு மண்டலங்கள்'
                : 'Digestive & Respiratory System Anatomy',
              subtopic: isTa
                ? 'உணவு க் குழாய், இர ஈப்ப ஈ, சிறு கு டல், மூ ச் சு க் குழாய், நுர ஈயீரல்'
                : 'Alimentary canal stages, Enzyme digestion, Alveoli gas exchange (O₹₹ in, CO₹₹ out)',
              dayNumber: 12,
              periodNumber: 4,
              keyFormulaOrLaw:
                'Respiration: Glucose + Oxygen -> Energy (ATP) + Carbon Dioxide + Water',
              keyPoints: [
                'Digestion begins in the mouth with salivary amylase',
                'Villi in small intestine absorb digested nutrients into bloodstream'
              ],
              type: 'concept',
              importance: 'High-Yield'
            }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: isTa
            ? 'வி ச ஈ, ஆற்றல், எளிய எந்திர ங் கள் & சுற்று ச் ச₹ழல்'
            : 'Forces, Simple Machines & Water Cycle',
          description: isTa
            ? 'ந ஆம்பு கோல் (Lever), கப்பி (Pulley), நீர் சுழற் சி மற்றும் ச₹ரிய கு டும்பம்'
            : 'Mechanical advantage, 1st/2nd/3rd Class Levers, Water cycle, 8 Planets',
          subtopics: [
            {
              id: 'prep_s_sub2',
              title: 'இயற்பியல் & சுற்று ச் ச₹ழல்',
              microTopics: [
                {
                  id: 'prep_s_3',
                  title: 'ந ஆம்பு கோல் (Levers) 3 வகைகள் & தத்துவம்',
                  keyAxiom: 'Load Load Arm = Effort Effort Arm'
                }
              ]
            }
          ],
          microTopics: [
            {
              id: 'prep_s_3',
              topicTitle: isTa
                ? 'வி ச ஈ வகைகள் & எளிய எந்திர ங் கள் (Lever & Pulley)'
                : 'Forces & Simple Machines (Levers & Pulleys)',
              subtopic: isTa
                ? 'ந ஆம்பு கோல் 3 வகைகள் மற்றும் தத்துவம்'
                : 'Mechanical advantage, 1st Class (Seesaw), 2nd Class (Wheelbarrow), 3rd Class (Tongs)',
              dayNumber: 14,
              periodNumber: 4,
              keyFormulaOrLaw:
                'Work = Force Displacement | Lever Principle: Load Load Arm = Effort Effort Arm',
              keyPoints: [
                'Simple machines make work easier by changing force direction or magnitude',
                'Friction opposes relative motion between surfaces'
              ],
              type: 'solved_problem',
              importance: 'High-Yield'
            }
          ]
        }
      ]
    },
    {
      subjectId: 'prep_social',
      subjectName: isTa
        ? 'சமூ க அறிவியல் & கு டிம ஈயியல் (Social Science & Civics)'
        : 'Social Science, History & Indian Polity Seed',
      icon: '🌍',
      color: '#f59e0b',
      totalChapters: 2,
      totalMicroTopics: 8,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: isTa
            ? 'இந்திய இயற்கை அம ஈப்பு கள், ஆறு கள் & வரைபடம்'
            : 'Physical Geography of India, Rivers & Maps',
          description: isTa
            ? 'இமயமல ஈ, க ங் க ஈ சமவ ஆளி, த க் காண பீ டபூமி, காவிரி, வ ஈ க ஈ ஆறு கள்'
            : 'Himalayas, Northern Plains, Peninsular Plateau, Coastal Plains, Indian Rivers & Continents',
          subtopics: [
            {
              id: 'prep_soc_sub1',
              title: 'இந்திய நிலப்பரப்பு & ஆறு கள்',
              microTopics: [
                {
                  id: 'prep_soc_1',
                  title: 'இமயமல ஈ, த க் காண பீ டபூமி & காவிரி நதி அம ஈப்பு',
                  keyAxiom:
                    'Cauvery originates at Talakaveri (Karnataka) and flows through Tamil Nadu'
                }
              ]
            }
          ],
          microTopics: [
            {
              id: 'prep_soc_1',
              topicTitle: isTa
                ? 'இந்திய இயற்கை அம ஈப்பு கள் & ஆறு கள் (Cauvery, Vaigai)'
                : 'Physical Divisions of India & Major Rivers',
              subtopic: isTa
                ? 'இமயமல ஈ, த க் காண பீ டபூமி, காவிரி, க ங் க ஈ'
                : 'Perennial Himalayan rivers (Ganga, Indus) vs Rain-fed Peninsular rivers (Cauvery, Godavari)',
              dayNumber: 15,
              periodNumber: 4,
              keyFormulaOrLaw:
                'Physical Divisions: Himalayas (North) | Plains (Central) | Plateau (South) | Deserts (West)',
              keyPoints: [
                'Cauvery originates at Talakaveri (Karnataka) and flows through Tamil Nadu',
                'Continents: Asia is largest; Australia is smallest'
              ],
              type: 'concept',
              importance: 'High-Yield'
            }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: isTa
            ? 'பண் ட ஈய வரலாறு, மூவ இந்தர் & இந்திய அர சியலம ஈப்பு'
            : 'Ancient History, Sangam Kings & Indian Constitution',
          description: isTa
            ? 'சிந்து சமவ ஆளி அறிமு கம், ச இர சோழ பாண் டியர், அர சியலம ஈப்பு மு கப்புர ஈ'
            : 'Indus Valley Civilization intro, Sangam Age (Chera, Chola, Pandya), Indian Constitution & Preamble',
          subtopics: [
            {
              id: 'prep_soc_sub2',
              title: 'வரலாறு & அர சியலம ஈப்பு',
              microTopics: [
                {
                  id: 'prep_soc_2',
                  title: 'ச இர சோழ பாண் டியர் சின்ன ங் கள் & இந்திய அர சியலம ஈப்பு மு கப்புர ஈ',
                  keyAxiom:
                    'Chera (Bow), Chola (Tiger), Pandya (Fish) | Constitution Preamble: Justice, Liberty, Equality'
                }
              ]
            }
          ],
          microTopics: [
            {
              id: 'prep_soc_2',
              topicTitle: isTa
                ? 'ச இர, சோழ, பாண் டியர் வரலாறு & இந்திய மு கப்புர ஈ'
                : 'Sangam Dynasties & Indian Constitution Preamble',
              subtopic: isTa
                ? 'மூவ இந்தர் சின்ன ங் கள் & அர சியலம ஈப்பு அடிப்படை'
                : 'Emblems (Bow-Arrow, Tiger, Fish), Dr. Ambedkar role, Preamble values (Justice, Liberty, Equality)',
              dayNumber: 16,
              periodNumber: 4,
              keyFormulaOrLaw: 'Constitution Day: 26 November | Republic Day: 26 January 1950',
              keyPoints: [
                'Chola capital: Uraiyur / Thanjavur | Pandya capital: Madurai',
                'Fundamental Duties enshrined in Indian Constitution'
              ],
              type: 'concept',
              importance: 'High-Yield'
            }
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
    totalMicroTopics: subjects.reduce(
      (a, s) =>
        a +
        (s.totalMicroTopics ||
          s.chapters.reduce((acc, c) => acc + (c.microTopics?.length || 0), 0)),
      0
    ),
    subjects
  };
}

export function getMiddleClass6to8Syllabus(
  courseId: string,
  courseTitle: string
): CourseFullSyllabus {
  const isTa = courseTitle.includes('தமிழ்') || courseId.includes('-ta-');
  const subjects: SyllabusSubject[] = [
    {
      subjectId: 'mid_tamil',
      subjectName: 'தமிழ் (Tamil — சமச்சீர் கல்வி 9 இயல்கள் முழுப் பாடத்திட்டம்)',
      icon: '🔤',
      color: '#ec4899',
      totalChapters: 3,
      totalMicroTopics: 17,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: 'தமிழ் நானோ அலகுகள்: உயிர், மெய், மாத்திரை & ஆய்தம் (Days 41–46)',
          description:
            '5 குறில் எழுத்துக்கள், 7 நெடில் எழுத்துக்கள், வல்லினம் மெல்லினம் இடையினம், ஆய்த எழுத்து ஃ மற்றும் மாத்திரை கால அளவு கள்',
          subtopics: [
            {
              id: 'mid_t_sub1',
              title: 'எழுத்து இலக்கண நானோ அலகுகள்',
              microTopics: [
                {
                  id: 'mid_t_41',
                  title: 'உயிர் எழுத்துக்கள்: 5 குறில் எழுத்துக்கள் (1 மாத்திரை) (Day 41)',
                  keyAxiom: 'அ, இ, உ, எ, ஒ — குறுகிய ஓசையுடைய 5 உயிர் எழுத்துக்கள்'
                },
                {
                  id: 'mid_t_42',
                  title: 'உயிர் எழுத்துக்கள்: 7 நெடில் எழுத்துக்கள் (2 மாத்திரை) (Day 42)',
                  keyAxiom: 'ஆ, ஈ, ஊ, ஏ, ஐ, ஒ, ஓ, ஔ — நீண்ட ஓசையுடைய 7 உயிர் எழுத்துக்கள்'
                },
                {
                  id: 'mid_t_43',
                  title: 'வல்லின மெய் எழுத்துக்கள்: க, ச, ட, த, ப, ற (Day 43)',
                  keyAxiom: 'க், ச், ட், த், ப், ற் — வன்மையான ஓசையுடைய 6 மெய் எழுத்துக்கள்'
                },
                {
                  id: 'mid_t_44',
                  title: 'மெல்லின மெய் எழுத்துக்கள்: ங, ஞ, ண, ந, ம, ன (Day 44)',
                  keyAxiom: 'ங், ஞ், ண், ந், ம், ன் — மென்மையான மூக்கொலியுடைய 6 மெய் எழுத்துக்கள்'
                },
                {
                  id: 'mid_t_45',
                  title: 'இடையின மெய் எழுத்துக்கள்: ய, ர, ல, வ, ழ, ள (Day 45)',
                  keyAxiom: 'ய், ர், ல், வ், ழ், ள் — இடைப்பட்ட ஓசையுடைய 6 மெய் எழுத்துக்கள்'
                },
                {
                  id: 'mid_t_46',
                  title: 'ஆய்த எழுத்து (ஃ) பயன்பா ட் டு விதிகள் (Day 46)',
                  keyAxiom: 'சொல்லின் இடையில் மட்டுமே வரும்; எ ஃ கு, அ ஃது, இ ஃது'
                }
              ]
            }
          ],
          microTopics: [
            {
              id: 'mid_t_41',
              topicTitle: 'உயிர் எழுத்துக்கள்: 5 குறில் எழுத்துக்கள் (Day 41)',
              subtopic: 'குறுகிய ஓசையுடைய எழுத்துக்கள்: அ, இ, உ, எ, ஒ (1 மாத்திரை கால அளவு)',
              dayNumber: 41,
              periodNumber: 1,
              keyFormulaOrLaw:
                'குறில் எழுத்து மாத்திரை = 1 மாத்திரை (ஒரு முறை கண் இம ஈ க் கும் அல்லது க ஈ நொ டி க் கும் ந இரம்)',
              keyPoints: [
                'உயிர் எழுத்து களில் குறில் எழுத்துக்கள் மொத்தம் 5',
                'குறில் எழுத்துக்கள் சொல்லின் முதலில் உயிரா கவும், மெய்யு டன் இண ஈந்து உயிர்மெய் க் குறிலா கவும் வரும்'
              ],
              type: 'concept',
              importance: 'High-Yield'
            },
            {
              id: 'mid_t_42',
              topicTitle: 'உயிர் எழுத்துக்கள்: 7 நெடில் எழுத்துக்கள் (Day 42)',
              subtopic: 'நீண்ட ஓசையுடைய எழுத்துக்கள்: ஆ, ஈ, ஊ, ஏ, ஐ, ஒ, ஓ, ஔ (2 மாத்திரை கால அளவு)',
              dayNumber: 42,
              periodNumber: 1,
              keyFormulaOrLaw:
                'நெடில் எழுத்து மாத்திரை = 2 மாத்திரை (இரண் டு முறை கண் இம ஈ க் கும் கால அளவு)',
              keyPoints: [
                'ஐ மற்றும் ஔ ஆ கிய இரண் டும் நெடில் எழுத்து களா கும்',
                'நெடில் எழுத்துக்கள் தனித்தும் மெய்யோ டு இண ஈந்தும் 2 மாத்திரை ஒலி க் கும்'
              ],
              type: 'concept',
              importance: 'High-Yield'
            },
            {
              id: 'mid_t_43',
              topicTitle: 'வல்லின மெய் எழுத்துக்கள்: க, ச, ட, த, ப, ற (Day 43)',
              subtopic: 'வன்மையான ஓசையுடைய எழுத்துக்கள்: க், ச், ட், த், ப், ற் (அர ஈ மாத்திரை)',
              dayNumber: 43,
              periodNumber: 1,
              keyFormulaOrLaw: 'வல்லினம் = க், ச், ட், த், ப், ற் | மாத்திரை அளவு = மாத்திரை',
              keyPoints: [
                'மார்ப ஈத் தலைம ஈயா க க் கொண்டு பிற க் கும் வன்மையான எழுத்துக்கள்',
                'சொல்லின் இறுதியில் ட், த், ப் போன்ற சில வல்லின மெய் கள் வாரா'
              ],
              type: 'concept',
              importance: 'High-Yield'
            },
            {
              id: 'mid_t_44',
              topicTitle: 'மெல்லின மெய் எழுத்துக்கள்: ங, ஞ, ண, ந, ம, ன (Day 44)',
              subtopic: 'மென்மையான ஓசையுடைய எழுத்துக்கள்: ங், ஞ், ண், ந், ம், ன் (அர ஈ மாத்திரை)',
              dayNumber: 44,
              periodNumber: 1,
              keyFormulaOrLaw: 'மெல்லினம் = ங், ஞ், ண், ந், ம், ன் | மாத்திரை அளவு = மாத்திரை',
              keyPoints: [
                'மூ க் க ஈத் தலைம ஈயா க க் கொண்டு பிற க் கும் ம ஆல்லிய எழுத்துக்கள்',
                'வல்லின எழுத்து களு க் கு இன எழுத்து களா க நட்பு எழுத்து களா க அம ஈ கின்றன ( ங்- க், ஞ்- ச், ண்- ட், ந்-த், ம்-ப், ன்-ற்)'
              ],
              type: 'concept',
              importance: 'High-Yield'
            },
            {
              id: 'mid_t_45',
              topicTitle: 'இடையின மெய் எழுத்துக்கள்: ய, ர, ல, வ, ழ, ள (Day 45)',
              subtopic: 'இடைப்பட்ட ஓசையுடைய எழுத்துக்கள்: ய், ர், ல், வ், ழ், ள் (அர ஈ மாத்திரை)',
              dayNumber: 45,
              periodNumber: 1,
              keyFormulaOrLaw: 'இடையினம் = ய், ர், ல், வ், ழ், ள் | மாத்திரை அளவு = மாத்திரை',
              keyPoints: [
                'கழுத்த ஈத் தலைம ஈயா க க் கொண்டு வன்மை க் கும் ம ஆன்ம ஈ க் கும் இடைப்பட்டு பிற க் கின்றன',
                'தமிழ் மொழி க் க இ சிறப்பான "ழ்" ( சிறப்பு ழ கரம்) இடையின எழுத்து களில் ஒன்றா கும்'
              ],
              type: 'concept',
              importance: 'High-Yield'
            },
            {
              id: 'mid_t_46',
              topicTitle: 'ஆய்த எழுத்து (ஃ) பயன்பா ட் டு விதிகள் (Day 46)',
              subtopic: 'முப்புள்ளி, முப்பாற்புள்ளி, தனிநிலை (அர ஈ மாத்திரை)',
              dayNumber: 46,
              periodNumber: 1,
              keyFormulaOrLaw:
                'ஆய்தம் = ஃ | மாத்திரை = | விதி: தன க் கு முன் ஒரு குறில ஈயும் பின் ஒரு வல்லின உயிர்மெய்ய ஈயும் ப ஆறும்',
              keyPoints: [
                'சொல்லின் முதலிலோ இறுதியிலோ வராது; சொல்லின் இடையில் மட்டுமே வரும் (எ. கா: எ ஃ கு, அ ஃது, இ ஃது)',
                'ஆய்த எழுத்த ஈ முதன்மையா க க் கொண் ட சொல் தனிநிலை ச் சொல் எனப்ப டும்'
              ],
              type: 'concept',
              importance: 'High-Yield'
            }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: 'தமிழ் நானோ அலகுகள்: திணை, பால் & முக்காலம் (Days 47–51)',
          description:
            'உயர்திணை அஃறிணை, ஆண்பால் பெண்பால் பலர்பால் ஒன்றன்பால் பலவின்பால் மற்றும் இறந்த, நி கழ் கால, எதிர் கால இடைநிலைகள்',
          subtopics: [
            {
              id: 'mid_t_sub2',
              title: 'திணை, பால், கால நானோ அலகுகள்',
              microTopics: [
                {
                  id: 'mid_t_47',
                  title: 'திணை பாகுபாடு: உயர்திணை vs அஃறிணை (Day 47)',
                  keyAxiom: 'ப குத்தறிவுள்ள ம க் கள் உயர்திணை; பறவ ஈ, விலங்கு, தாவரங்கள் அஃறிணை'
                },
                {
                  id: 'mid_t_48',
                  title: 'ஐம்பால் பாகுபாடு (ஆண், பெண், பலர், ஒன்று, பல) (Day 48)',
                  keyAxiom: 'உயர்திணை 3 பால் (ஆண், பெண், பலர்); அஃறிணை 2 பால் (ஒன்று, பல)'
                },
                {
                  id: 'mid_t_49',
                  title: 'முக்காலம்: இறந்த கால இடைநிலைகள் (த், ட், ற், இன்) (Day 49)',
                  keyAxiom: 'செய்தான் (த்), உண் டான் ( ட்), கற்றான் (ற்), பா டினான் (இன்)'
                },
                {
                  id: 'mid_t_50',
                  title: 'முக்காலம்: நி கழ் கால இடைநிலைகள் ( கிறு, கின்று, ஆநின்று) (Day 50)',
                  keyAxiom: 'செய் கிறான் ( கிறு), உண் கின்றான் ( கின்று), வாராநின்றான் (ஆநின்று)'
                },
                {
                  id: 'mid_t_51',
                  title: 'முக்காலம்: எதிர் கால இடைநிலைகள் (ப், வ்) (Day 51)',
                  keyAxiom: 'ப டிப்பான் (ப்), வருவான் (வ்)'
                }
              ]
            }
          ],
          microTopics: [
            {
              id: 'mid_t_47',
              topicTitle: 'திணை பாகுபாடு: உயர்திணை vs அஃறிணை (Day 47)',
              subtopic: 'ஒழுக்கம் மற்றும் ப குத்தறிவு அடிப்படையில் இருதிணை வகைப்பா டு',
              dayNumber: 47,
              periodNumber: 1,
              keyFormulaOrLaw:
                'திணை 2: உயர்திணை (மனிதர்கள், தேவர் கள், நர கர்) | அஃறிணை (அல் + திணை = உயிரற்றவ ஈ, விலங்குகள், தாவரங்கள்)',
              keyPoints: [
                'கண்ணன், ஆசிரியர், மருத்துவர் - உயர்திணை',
                'மரம், நாய், க டல், ம இ கம், நிலா - அஃறிணை'
              ],
              type: 'concept',
              importance: 'High-Yield'
            },
            {
              id: 'mid_t_48',
              topicTitle: 'ஐம்பால் பாகுபாடு (Day 48)',
              subtopic: 'பால் என்பது திணையின் உ ட்பிரிவு (5 வகைகள்)',
              dayNumber: 48,
              periodNumber: 1,
              keyFormulaOrLaw:
                'உயர்திணை: ஆண்பால் (அன்), பெண்பால் (அள்), பலர்பால் (அர்) | அஃறிணை: ஒன்றன்பால் (து), பலவின்பால் (அ)',
              keyPoints: [
                'மாணவன் (ஆண்பால்), மாணவி (பெண்பால்), மாணவர் கள் (பலர்பால்)',
                'குதிர ஈ வந்தது (ஒன்றன்பால்), குதிர ஈ கள் வந்தன (பலவின்பால்)'
              ],
              type: 'concept',
              importance: 'High-Yield'
            },
            {
              id: 'mid_t_49',
              topicTitle: 'முக்காலம்: இறந்த கால இடைநிலைகள் (Day 49)',
              subtopic: 'ந டந்து மு டிந்த ச ஆயல ஈ க் குறி க் கும் இடைநிலைகள்: த், ட், ற், இன்',
              dayNumber: 49,
              periodNumber: 1,
              keyFormulaOrLaw: 'இறந்த கால இடைநிலைகள்: த், ட், ற், இன் (பகுதி + இடைநிலை + வி குதி)',
              keyPoints: [
                'செய்தான் = செய் + த் + ஆன் (த் = இறந்த கால இடைநிலை)',
                'ஒ டினான் = ஒ டு + இன் + ஆன் (இன் = இறந்த கால இடைநிலை)'
              ],
              type: 'solved_problem',
              importance: 'High-Yield'
            },
            {
              id: 'mid_t_50',
              topicTitle: 'முக்காலம்: நி கழ் கால இடைநிலைகள் (Day 50)',
              subtopic:
                'இப்போது நி கழும் ச ஆயல ஈ க் குறி க் கும் இடைநிலைகள்: கிறு, கின்று, ஆநின்று',
              dayNumber: 50,
              periodNumber: 1,
              keyFormulaOrLaw: 'நி கழ் கால இடைநிலைகள்: கிறு, கின்று, ஆநின்று',
              keyPoints: [
                'ப டி க் கிறான் = ப டி + க் + கிறு + ஆன் ( கிறு = நி கழ் கால இடைநிலை)',
                'உண் கின்றான் = உண் + கின்று + ஆன் ( கின்று = நி கழ் கால இடைநிலை)'
              ],
              type: 'solved_problem',
              importance: 'High-Yield'
            },
            {
              id: 'mid_t_51',
              topicTitle: 'முக்காலம்: எதிர் கால இடைநிலைகள் (Day 51)',
              subtopic: 'இனிம இல் ந ட க் கவிரு க் கும் ச ஆயல ஈ க் குறி க் கும் இடைநிலைகள்: ப், வ்',
              dayNumber: 51,
              periodNumber: 1,
              keyFormulaOrLaw: 'எதிர் கால இடைநிலைகள்: ப், வ்',
              keyPoints: [
                'காண்பான் = காண் + ப் + ஆன் (ப் = எதிர் கால இடைநிலை)',
                'வருவான் = வா(வரு) + வ் + ஆன் (வ் = எதிர் கால இடைநிலை)'
              ],
              type: 'solved_problem',
              importance: 'High-Yield'
            }
          ]
        },
        {
          chapterNumber: 3,
          chapterTitle: 'தமிழ் நானோ அலகுகள்: தொ க ஈநிலைத் தொ டர் கள் & புணர் ச் சி (Days 52–57)',
          description:
            'வ இற்றும ஈத்தொ க ஈ, வின ஈத்தொ க ஈ, பண்புத்தொ க ஈ, உவம ஈத்தொ க ஈ, உம்ம ஈத்தொ க ஈ மற்றும் வல்லினம் மி கும்/மி கா இ ட ங் கள்',
          subtopics: [
            {
              id: 'mid_t_sub3',
              title: 'தொ க ஈநிலை & புணர் ச் சி நானோ அலகுகள்',
              microTopics: [
                {
                  id: 'mid_t_52',
                  title: 'வ இற்றும ஈத் தொ க ஈ: ஐ, ஆல், கு, இன், அது, கண் மற ஈதல் (Day 52)',
                  keyAxiom:
                    'பால் கு டித்தான் = பால ஈ க் கு டித்தான் (2- ஆம் வ இற்றும ஈ உருபு ஐ மற ஈந்தது)'
                },
                {
                  id: 'mid_t_53',
                  title: 'வின ஈத்தொ க ஈ: மு க் காலமும் மற ஈந்து வருதல் (Day 53)',
                  keyAxiom:
                    'ொறு காய் =ொறிய காய்,ொறு கின்ற காய்,ொறும் காய் ( காலம் காட்டும் இடைநிலை மற ஈந்தது)'
                },
                {
                  id: 'mid_t_54',
                  title: 'பண்புத்தொ க ஈ: ம ஈ வி குதியும் ஆ கிய, ஆன உருபு களும் மற ஈதல் (Day 54)',
                  keyAxiom:
                    'ச ஆந்தாமர ஈ = ச ஆம்ம ஈயா கிய தாமர ஈ | வ ட் டத்தொ ட் டி = வ ட் டமா கிய தொ ட் டி'
                },
                {
                  id: 'mid_t_55',
                  title: 'உவம ஈத்தொ க ஈ & உம்ம ஈத்தொ க ஈ (Day 55)',
                  keyAxiom:
                    'மலர்விழி (போல மற ஈந்தது) | தாய் தந்த ஈ (தாயும் தந்த ஈயும் - உம் மற ஈந்தது)'
                },
                {
                  id: 'mid_t_56',
                  title:
                    'வல்லினம் மி கும் இ ட ங் கள்: அந்த, இந்த சு ட் டுப்ப ஆயர் கள் பின் (Day 56)',
                  keyAxiom: 'அந்த + கா டு = அந்த க் கா டு | இந்த + ப ஈயன் = இந்தப்ப ஈயன்'
                },
                {
                  id: 'mid_t_57',
                  title: 'வல்லினம் மி கா இ ட ங் கள்: வின ஈத்தொ க ஈ & அது, இது பின் (Day 57)',
                  keyAxiom: 'கு டி தண்ணீர் (வின ஈத்தொ க ஈ மி காது) | அது ச ஆன்றது (மி காது)'
                }
              ]
            }
          ],
          microTopics: [
            {
              id: 'mid_t_52',
              topicTitle: 'வ இற்றும ஈத் தொ க ஈ (Day 52)',
              subtopic:
                'வ இற்றும ஈ உருபு கள் (ஐ, ஆல், கு, இன், அது, கண்) சொல்லின் ந டுவில் மற ஈந்து வருதல்',
              dayNumber: 52,
              periodNumber: 1,
              keyFormulaOrLaw:
                'வ இற்றும ஈத் தொ க ஈ: ப ஆயர் ச் சொல் + ப ஆயர் ச் சொல் (வ இற்றும ஈ உருபு மற ஈவு)',
              keyPoints: [
                'கரும்பு தின்றான் = கரும்ப ஈத் தின்றான் (2- ஆம் வ இற்றும ஈத் தொ க ஈ)',
                'தலை வண ங் கினான் = தலையால் வண ங் கினான் (3- ஆம் வ இற்றும ஈத் தொ க ஈ)'
              ],
              type: 'solved_problem',
              importance: 'High-Yield'
            },
            {
              id: 'mid_t_53',
              topicTitle: 'வின ஈத்தொ க ஈ:ொறு காய் (Day 53)',
              subtopic:
                'வின ஈப்பகுதியும் ப ஆயர் ச் சொல்லும் இண ஈந்து மு க் காலமும் மற ஈந்து நின்று பொருள் தருதல்',
              dayNumber: 53,
              periodNumber: 1,
              keyFormulaOrLaw:
                'வின ஈத்தொ க ஈ = வின ஈப்பகுதி (ஏவல்) + ப ஆயர் ச் சொல் ( காலம் கரந்த ப ஆயர ஆ ச் சம்)',
              keyPoints: [
                'ொறு காய் =ொறிய காய்,ொறு கின்ற காய்,ொறும் காய்',
                'சு டு சோறு, அல ஈ க டல், பாய்புலி, வளர்பிற ஈ ஆ கியவ ஈ வின ஈத்தொ க ஈ கள்'
              ],
              type: 'solved_problem',
              importance: 'High-Yield'
            },
            {
              id: 'mid_t_54',
              topicTitle: 'பண்புத்தொ க ஈ: ச ஆந்தாமர ஈ (Day 54)',
              subtopic:
                'நிறம், வ டிவம், சுவை, அளவு ஆ கிய பண்பு கள ஈ உணர்த்தி "ம ஈ"வி குதி மற ஈந்து வருதல்',
              dayNumber: 54,
              periodNumber: 1,
              keyFormulaOrLaw: 'பண்புத்தொ க ஈ = பண்புப்ப ஆயர் + ஆ கிய/ ஆன உருபு மற ஈவு',
              keyPoints: [
                'ச ஆந்தாமர ஈ = ச ஆம்ம ஈ + தாமர ஈ ( ச ஆம்ம ஈயா கிய தாமர ஈ)',
                'வ ஆண்ணிலவு = வ ஆண்ம ஈ + நிலவு | கரு ங் குவள ஈ = கரும ஈ + குவள ஈ'
              ],
              type: 'solved_problem',
              importance: 'High-Yield'
            },
            {
              id: 'mid_t_55',
              topicTitle: 'உவம ஈத்தொ க ஈ & உம்ம ஈத்தொ க ஈ (Day 55)',
              subtopic: 'உவம உருபு (போல, போன்ற) மற்றும் எண்ணும்ம ஈ (உம்) மற ஈந்து வருதல்',
              dayNumber: 55,
              periodNumber: 1,
              keyFormulaOrLaw:
                'உவம ஈத்தொ க ஈ: உவமானம் + உவம இயம் | உம்ம ஈத்தொ க ஈ: எண்ணல்/ அளவை ச் சொற் களில் "உம்"மற ஈவு',
              keyPoints: [
                'மலர்விழி = மலர் போன்ற விழி (உவம ஈத்தொ க ஈ)',
                'இரவுப கல் = இரவும் ப கலும் | அண்ணன் தம்பி = அண்ணனும் தம்பியும் (உம்ம ஈத்தொ க ஈ)'
              ],
              type: 'solved_problem',
              importance: 'High-Yield'
            },
            {
              id: 'mid_t_56',
              topicTitle: 'வல்லினம் மி கும் இ ட ங் கள் (Day 56)',
              subtopic:
                'அ, இ சு ட் ட ஆழுத்து களின் பின்னும், எ வினாவ ஆழுத்தின் பின்னும் வல்லினம் மி கும்',
              dayNumber: 56,
              periodNumber: 1,
              keyFormulaOrLaw: 'விதி: அந்த, இந்த, எந்த + வல்லின மெய் ( க், ச், த், ப்) மி கும்',
              keyPoints: [
                'அந்த + கா டு = அந்த க் கா டு | இந்த + ச ட் ட ஈ = இந்த ச் ச ட் ட ஈ',
                'எந்த + புத்த கம் = எந்தப்புத்த கம்'
              ],
              type: 'solved_problem',
              importance: 'High-Yield'
            },
            {
              id: 'mid_t_57',
              topicTitle: 'வல்லினம் மி கா இ ட ங் கள் (Day 57)',
              subtopic:
                'வின ஈத்தொ க ஈயிலும், அது, இது, எது சு ட் டுப் ப ஆயர் களின் பின்னும் வல்லினம் மி காது',
              dayNumber: 57,
              periodNumber: 1,
              keyFormulaOrLaw:
                'விதி: வின ஈத்தொ க ஈயில் வல்லினம் மி காது | அது, இது, எது பின் மி காது',
              keyPoints: [
                'கு டி தண்ணீர் ( கு டித்தண்ணீர் தவறு)',
                'அது பறந்தது (அதுப்பறந்தது தவறு) | எது கண் டாய் (எது க் கண் டாய் தவறு)'
              ],
              type: 'solved_problem',
              importance: 'High-Yield'
            }
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
          chapterTitle:
            'Unit 1: Prose (*Sea Turtles*), Poem (*The Crocodile*) & Supplementary (*Owlie*)',
          description:
            'Marine ecology, Olive Ridley turtles conservation, Lewis Carroll poem, Subject & Predicate, Types of Sentences',
          subtopics: [
            {
              id: 'mid_e_sub1',
              title: 'Unit 1: Marine Life & Grammar',
              microTopics: [
                {
                  id: 'mid_e_1',
                  title: 'Prose: Sea Turtles (Olive Ridley nesting & conservation)',
                  keyAxiom: 'Olive Ridleys nest along coastal beaches in Arribada mass nesting'
                },
                {
                  id: 'mid_e_2',
                  title: 'Poem: The Crocodile by Lewis Carroll & Rhyme Scheme',
                  keyAxiom: 'How doth the little crocodile improve his shining tail'
                },
                {
                  id: 'mid_e_3',
                  title: 'Grammar: Subject & Predicate, 4 Types of Sentences',
                  keyAxiom:
                    'Declarative (statement), Interrogative (?), Imperative (command), Exclamatory (!)'
                }
              ]
            }
          ],
          microTopics: [
            {
              id: 'mid_e_1',
              topicTitle: 'Unit 1: Sea Turtles, The Crocodile & 4 Sentence Types',
              subtopic: 'Subject + Predicate, Declarative, Interrogative, Imperative, Exclamatory',
              dayNumber: 2,
              periodNumber: 2,
              keyFormulaOrLaw:
                'Sentence Types: Statement (.) | Question (?) | Command/Request | Exclamation (!)',
              keyPoints: [
                'Olive Ridley turtles travel thousands of kilometres to lay eggs',
                'Lewis Carroll is author of Alice in Wonderland'
              ],
              type: 'concept',
              importance: 'High-Yield'
            }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: 'Unit 2: Prose (*When the Trees Walked*) & Poem (*Trees*)',
          description:
            "Ruskin Bond nature story, Grandfather's tree planting, Adjectives, Degrees of Comparison",
          subtopics: [
            {
              id: 'mid_e_sub2',
              title: 'Unit 2: Nature & Comparison',
              microTopics: [
                {
                  id: 'mid_e_4',
                  title: 'Prose: When the Trees Walked by Ruskin Bond',
                  keyAxiom: 'Planting trees on rocky river island transforms environment'
                },
                {
                  id: 'mid_e_5',
                  title: 'Grammar: Adjectives & Degrees of Comparison',
                  keyAxiom: 'Positive, Comparative (-er/more), Superlative (-est/most)'
                }
              ]
            }
          ],
          microTopics: [
            {
              id: 'mid_e_4',
              topicTitle: 'Unit 2: Ruskin Bond Trees & Degrees of Comparison',
              subtopic: 'Adjective degrees: Fast-Faster-Fastest, Interesting-More-Most',
              dayNumber: 5,
              periodNumber: 2,
              keyFormulaOrLaw:
                'Comparison: as + adj + as (Positive) | adj-er + than (Comparative) | the + adj-est (Superlative)',
              keyPoints: ['Ruskin Bond lives in Mussoorie and writes about Indian flora and fauna'],
              type: 'solved_problem',
              importance: 'High-Yield'
            }
          ]
        },
        {
          chapterNumber: 3,
          chapterTitle: 'Unit 3: Prose (*A Visitor from Distant Lands*) & Grammar (*Tenses*)',
          description:
            'History of spices (Chilli, Pepper, Cardamom, Cinnamon) brought by Vasco da Gama & Columbus, Verb Tenses',
          subtopics: [
            {
              id: 'mid_e_sub3',
              title: 'Unit 3: Spices History & Tenses',
              microTopics: [
                {
                  id: 'mid_e_6',
                  title: 'Prose: Spices of India & Portuguese Traders',
                  keyAxiom: 'Vasco da Gama reached Calicut (1498) seeking black gold (Pepper)'
                },
                {
                  id: 'mid_e_7',
                  title: 'Grammar: 12 Verb Tenses (Simple, Continuous, Perfect)',
                  keyAxiom: 'Present Perfect: has/have + V3 | Past Continuous: was/were + V-ing'
                }
              ]
            }
          ],
          microTopics: [
            {
              id: 'mid_e_6',
              topicTitle: 'Unit 3: Spices of India & 12 English Verb Tenses',
              subtopic: 'Present, Past, Future, Continuous & Perfect Tenses with Timeline',
              dayNumber: 8,
              periodNumber: 2,
              keyFormulaOrLaw:
                'Present Perfect: S + has/have + V3 | Past Perfect: S + had + V3 | Future: S + will + V1',
              keyPoints: ['Chilli was brought to India from South America by Portuguese explorers'],
              type: 'solved_problem',
              importance: 'High-Yield'
            }
          ]
        },
        {
          chapterNumber: 4,
          chapterTitle: 'Unit 4: Prose (*Sports Stars*) & Supplementary (*Think to Win*)',
          description:
            'Mithali Raj, P.V. Sindhu, Mary Kom achievements, Teamwork poem, Conjunctions & Prepositional Phrases',
          subtopics: [
            {
              id: 'mid_e_sub4',
              title: 'Unit 4: Sports Biographies & Prepositions',
              microTopics: [
                {
                  id: 'mid_e_8',
                  title: 'Biographies: Mithali Raj, P.V. Sindhu & Mary Kom',
                  keyAxiom:
                    'Dedication, grit, and discipline overcome gender barriers in Indian sports'
                },
                {
                  id: 'mid_e_9',
                  title: 'Grammar: Prepositions of Position, Direction & Time',
                  keyAxiom: 'Across, through, into, upon, beside, between, among'
                }
              ]
            }
          ],
          microTopics: [
            {
              id: 'mid_e_8',
              topicTitle: 'Unit 4: Sports Stars & Prepositions (in, on, into, between, among)',
              subtopic: 'Between (two entities) vs Among (more than two entities)',
              dayNumber: 11,
              periodNumber: 2,
              keyFormulaOrLaw:
                'Rule: Between 2 people/items | Among > 2 people/items | Into shows motion',
              keyPoints: ["Mithali Raj is the highest run-scorer in Women's International Cricket"],
              type: 'solved_problem',
              importance: 'High-Yield'
            }
          ]
        }
      ]
    },
    {
      subjectId: 'mid_math',
      subjectName: isTa
        ? 'கணிதம் (Mathematics & Pre-Algebra)'
        : 'Mathematics, Pre-Algebra & Geometry',
      icon: '📐ஐ',
      color: '#06b6d4',
      totalChapters: 3,
      totalMicroTopics: 18,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: isTa
            ? 'எண் கணிதம் & வரிசை: BODMAS, HCF & LCM நானோ தலைப்பு கள்'
            : 'Arithmetic & Operations: BODMAS, HCF & LCM Nano-Topics',
          description: isTa
            ? 'செயல்பா டு களின் வரிசை BODMAS பிரா க் க ஆ ட் டு கள், வ குத்தல் ப ஆரு க் கல் முன்னுரிம ஈ, பகா காரணி மரம், ய₹ க்ளி ட் வழிமுறை, மீ.பொ.வ மற்றும் மீ. சி.ம பயன்பா ட் டு க் கணக்குகள்'
            : 'BODMAS bracket hierarchy, Division/Multiplication precedence, Prime factorization tree, Euclid long division, and Real-world HCF/LCM word problems',
          subtopics: [
            {
              id: 'mid_m_sub1',
              title: 'BODMAS & HCF/LCM Nano-Units',
              microTopics: [
                {
                  id: 'mid_m_1',
                  title: 'BODMAS: Brackets Hierarchy (), {}, [] (Day 1)',
                  keyAxiom: 'Innermost () first, then {}, finally outer []'
                },
                {
                  id: 'mid_m_2',
                  title: 'BODMAS: Division & Multiplication Priority (Day 2)',
                  keyAxiom: ' and × have equal precedence; evaluate Left-to-Right'
                },
                {
                  id: 'mid_m_3',
                  title: 'BODMAS: Addition & Subtraction Priority (Day 3)',
                  keyAxiom: '+ and - have equal precedence; evaluate Left-to-Right'
                },
                {
                  id: 'mid_m_4',
                  title: 'HCF: Prime Factorization Tree Method (Day 4)',
                  keyAxiom: 'Product of lowest powers of common prime factors'
                },
                {
                  id: 'mid_m_5',
                  title: 'HCF: Euclid Division / Long Division Method (Day 5)',
                  keyAxiom: 'a = bq + r until remainder r = 0'
                },
                {
                  id: 'mid_m_6',
                  title: 'LCM: Common Division Method (Day 6)',
                  keyAxiom: 'Product of all prime divisors including remaining factors'
                },
                {
                  id: 'mid_m_7',
                  title: 'HCF × LCM = Product of Two Numbers Identity (Day 7)',
                  keyAxiom: 'Number₹ × Number₹₹ = HCF(a,b) × LCM(a,b)'
                },
                {
                  id: 'mid_m_8',
                  title: 'HCF & LCM Word Problems: Bells & Tiles (Day 8)',
                  keyAxiom: 'HCF for largest tile size; LCM for simultaneous bell intervals'
                }
              ]
            }
          ],
          microTopics: [
            {
              id: 'mid_m_1',
              topicTitle: 'BODMAS: Brackets Hierarchy (), {}, [] (Day 1)',
              subtopic:
                'Solving Innermost Round Brackets (), Curly Brackets {}, and Square Brackets []',
              dayNumber: 1,
              periodNumber: 1,
              keyFormulaOrLaw: 'BODMAS Order: () -> {} -> [] -> Orders ->  -> × -> + -> -',
              keyPoints: [
                'Always simplify expressions inside the innermost parentheses first',
                'Nested brackets evaluate from inside out like peeling an onion'
              ],
              type: 'solved_problem',
              importance: 'High-Yield'
            },
            {
              id: 'mid_m_2',
              topicTitle: 'BODMAS: Division & Multiplication Precedence (Day 2)',
              subtopic:
                'Left-to-Right Rule for Equal Precedence Operations in 24  4 × 2 vs 24 × 4  2',
              dayNumber: 2,
              periodNumber: 1,
              keyFormulaOrLaw:
                'Rule: Division and Multiplication have EQUAL priority; Evaluate Left-to-Right',
              keyPoints: [
                'In 24  4 × 2, do 24  4 = 6 first, then 6 × 2 = 12 (not 24  8)',
                'Never prioritize multiplication over division unless indicated by brackets'
              ],
              type: 'solved_problem',
              importance: 'High-Yield'
            },
            {
              id: 'mid_m_3',
              topicTitle: 'BODMAS: Addition & Subtraction Precedence (Day 3)',
              subtopic: 'Left-to-Right Evaluation and Grouping Positive and Negative Terms',
              dayNumber: 3,
              periodNumber: 1,
              keyFormulaOrLaw:
                'Rule: Addition and Subtraction have EQUAL priority; Evaluate Left-to-Right',
              keyPoints: [
                'Group all positive numbers together and all negative numbers together',
                'Subtract the sum of negative terms from the sum of positive terms'
              ],
              type: 'solved_problem',
              importance: 'High-Yield'
            },
            {
              id: 'mid_m_4',
              topicTitle: 'HCF: Prime Factorization Tree Method (Day 4)',
              subtopic:
                'Breaking Numbers into Prime Factors and Taking Smallest Powers of Common Factors',
              dayNumber: 4,
              periodNumber: 1,
              keyFormulaOrLaw: 'HCF(a, b) = Product of smallest power of each common prime factor',
              keyPoints: [
                'For 24 (2³ × 3) and 36 (2² × 3²), HCF = 2² × 3 = 12',
                'HCF is always less than or equal to the smallest number'
              ],
              type: 'solved_problem',
              importance: 'High-Yield'
            },
            {
              id: 'mid_m_5',
              topicTitle: 'HCF: Euclid Division / Long Division Method (Day 5)',
              subtopic: 'Successive Division Algorithm: Dividend = Divisor × Quotient + Remainder',
              dayNumber: 5,
              periodNumber: 1,
              keyFormulaOrLaw:
                'Euclid Algorithm: a = bq + r (0 ≤ r < b) | Last non-zero divisor is HCF',
              keyPoints: [
                'Efficient method for finding HCF of very large 3-digit and 4-digit numbers',
                'When remainder becomes 0, the divisor at that stage is the exact HCF'
              ],
              type: 'solved_problem',
              importance: 'High-Yield'
            },
            {
              id: 'mid_m_6',
              topicTitle: 'LCM: Common Division Method (Day 6)',
              subtopic: 'Simultaneous Division of Multiple Numbers by Common Prime Divisors',
              dayNumber: 6,
              periodNumber: 1,
              keyFormulaOrLaw:
                'LCM(a, b) = Product of all prime divisors and undivided remainder quotients',
              keyPoints: [
                'LCM is the smallest positive number that is a multiple of all given numbers',
                'LCM is always greater than or equal to the largest number'
              ],
              type: 'solved_problem',
              importance: 'High-Yield'
            },
            {
              id: 'mid_m_7',
              topicTitle: 'HCF × LCM = a × b Core Identity (Day 7)',
              subtopic:
                'Finding One Unknown Number or HCF/LCM Using the Product Relationship Formula',
              dayNumber: 7,
              periodNumber: 1,
              keyFormulaOrLaw:
                'Number₹ × Number₹₹ = HCF(a, b) × LCM(a, b) | Number₹₹ = (HCF × LCM) / Number₹',
              keyPoints: [
                'Applicable strictly to any two positive integers',
                'Given HCF = 6, LCM = 36, Number₹ = 12 -> Number₹₹ = (6 × 36)/12 = 18'
              ],
              type: 'solved_problem',
              importance: 'High-Yield'
            },
            {
              id: 'mid_m_8',
              topicTitle: 'HCF & LCM Word Problems: Bells & Tiles (Day 8)',
              subtopic:
                'Real-World Applications: Paving Floors with Minimum Square Tiles & Bell Intervals',
              dayNumber: 8,
              periodNumber: 1,
              keyFormulaOrLaw:
                'Max Tile Side = HCF(Length, Breadth) | Next Toll Time = LCM(Interval₹, Interval₹₹)',
              keyPoints: [
                'Use HCF when dividing or partitioning into maximum equal sizes',
                'Use LCM when synchronizing repeating cycles or periodic events'
              ],
              type: 'solved_problem',
              importance: 'High-Yield'
            }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: isTa
            ? 'புள்ளியியல் நானோ தலைப்பு கள்: Mean, Median, Mode, Range & CI'
            : 'Statistics & Commercial Nano-Topics: Mean, Median, Mode & CI',
          description: isTa
            ? 'க₹ ட் டு ச் சரா சரி (Mean), ஒற்ற ஈப்ப ட ஈ/ இர ட் ட ஈப்ப ட ஈ இடைநிலை (Median), மு க டு (Mode), வீ ச் சு (Range), க₹ ட் டுவ ட் டி'
            : 'Arithmetic Mean calculation, ODD/EVEN Median rules, Mode peak detection, Range spread, and Compound Interest',
          subtopics: [
            {
              id: 'mid_m_sub2',
              title: 'புள்ளியியல் & வணி க க் கணிதம்',
              microTopics: [
                {
                  id: 'mid_m_9',
                  title: 'Arithmetic Mean: Ungrouped Raw Data Average (Day 9)',
                  keyAxiom: 'Mean xÌ„ = (Σx) / N'
                },
                {
                  id: 'mid_m_10',
                  title: 'Median: Finding Middle Term for ODD Dataset (Day 10)',
                  keyAxiom: 'Median = [(n + 1)/2]áµ—Ê° term after sorting'
                },
                {
                  id: 'mid_m_11',
                  title: 'Median: Finding Middle Average for EVEN Dataset (Day 11)',
                  keyAxiom: 'Median = Average of (n/2)áµ—Ê° and (n/2 + 1)áµ—Ê° terms'
                },
                {
                  id: 'mid_m_12',
                  title: 'Mode: Identifying Peak Frequency Values (Day 12)',
                  keyAxiom: 'Mode = Most frequently occurring observation'
                },
                {
                  id: 'mid_m_13',
                  title: 'Range & Coefficient of Range (Day 13)',
                  keyAxiom: 'Range = Largest - Smallest | Coefficient = (L-S)/(L+S)'
                },
                {
                  id: 'mid_m_14',
                  title: 'Empirical Formula: Mode ≈ 3(Median) - 2(Mean) (Day 14)',
                  keyAxiom: 'Mode = 3 Median - 2 Mean for moderately skewed distribution'
                }
              ]
            }
          ],
          microTopics: [
            {
              id: 'mid_m_9',
              topicTitle: 'Arithmetic Mean: Raw Data Average (Day 9)',
              subtopic:
                'Calculation of Arithmetic Mean: Sum of Observations Divided by Total Count',
              dayNumber: 9,
              periodNumber: 1,
              keyFormulaOrLaw: 'Mean xÌ„ = (Σ x) / N = (x₹ + x₹₹ + ... + x₹ங) / n',
              keyPoints: [
                'Mean is the mathematical center balance of numerical data',
                'If each observation is increased by k, the new mean increases by k'
              ],
              type: 'solved_problem',
              importance: 'High-Yield'
            },
            {
              id: 'mid_m_10',
              topicTitle: 'Median: Middle Term for ODD Dataset (Day 10)',
              subtopic:
                'Sorting in Ascending Order and Selecting Exact Center Position [(n+1)/2]áµ—Ê°',
              dayNumber: 10,
              periodNumber: 1,
              keyFormulaOrLaw: 'For Odd n: Median = Value of [(n + 1) / 2]áµ—Ê° term',
              keyPoints: [
                'Always arrange data in ascending or descending order first',
                'For 7 items, Median is the 4th item; 50% values lie below and 50% above'
              ],
              type: 'solved_problem',
              importance: 'High-Yield'
            },
            {
              id: 'mid_m_11',
              topicTitle: 'Median: Middle Average for EVEN Dataset (Day 11)',
              subtopic: 'Finding the Arithmetic Average of the Two Central Values for Even Count',
              dayNumber: 11,
              periodNumber: 1,
              keyFormulaOrLaw: 'For Even n: Median = ½ [ (n/2)áµ—Ê° term + (n/2 + 1)áµ—Ê° term ]',
              keyPoints: [
                'For 8 items, Median is average of 4th and 5th items',
                'Median is not affected by extreme outlier values unlike Mean'
              ],
              type: 'solved_problem',
              importance: 'High-Yield'
            },
            {
              id: 'mid_m_12',
              topicTitle: 'Mode: Identifying Peak Frequency Values (Day 12)',
              subtopic:
                'Finding the Most Frequently Occurring Observation; Unimodal and Bimodal Data',
              dayNumber: 12,
              periodNumber: 1,
              keyFormulaOrLaw: 'Mode = Observation with the highest frequency in the dataset',
              keyPoints: [
                'A dataset can have one mode (unimodal), two modes (bimodal), or no mode at all',
                'Useful in manufacturing and business for identifying most popular shoe size or clothing item'
              ],
              type: 'solved_problem',
              importance: 'High-Yield'
            },
            {
              id: 'mid_m_13',
              topicTitle: 'Range & Coefficient of Range (Day 13)',
              subtopic: 'Measuring Data Dispersion: Difference Between Maximum and Minimum Values',
              dayNumber: 13,
              periodNumber: 1,
              keyFormulaOrLaw:
                'Range R = Largest (L) - Smallest (S) | Coefficient of Range = (L - S) / (L + S)',
              keyPoints: [
                'Simplest measure of data dispersion and variability',
                'Range depends only on extreme values and ignores all intermediate numbers'
              ],
              type: 'solved_problem',
              importance: 'High-Yield'
            },
            {
              id: 'mid_m_14',
              topicTitle: 'Empirical Relation: Mode, Median & Mean (Day 14)',
              subtopic:
                'Karl Pearson Empirical Relationship Formula for Moderately Skewed Distributions',
              dayNumber: 14,
              periodNumber: 1,
              keyFormulaOrLaw: 'Mode ≈ 3(Median) - 2(Mean) | Mean - Mode = 3(Mean - Median)',
              keyPoints: [
                'Allows calculating any one statistic if the other two are known',
                'In a perfectly symmetrical normal distribution: Mean = Median = Mode'
              ],
              type: 'solved_problem',
              importance: 'High-Yield'
            }
          ]
        },
        {
          chapterNumber: 3,
          chapterTitle: isTa
            ? 'வடிவியல் & அளவியல் நானோ தலைப்பு கள்: பிதா கரஸ் & வட்டம்'
            : 'Geometry & Mensuration Nano-Topics: Pythagoras & Circle',
          description: isTa
            ? 'பிதா கரஸ் த இற்றம், மு க் கோண வி கித ங் கள், வ ட் டத்தின் சுற்றளவு 2ீr மற்றும் பரப்பளவுீr '
            : 'Pythagorean theorem, Pythagorean triplets, Circle circumference (2ீr) and Circle area (ீr )',
          subtopics: [
            {
              id: 'mid_m_sub3',
              title: 'வடிவியல் & அளவியல்',
              microTopics: [
                {
                  id: 'mid_m_15',
                  title: 'Pythagoras Theorem: Finding Hypotenuse (Day 15)',
                  keyAxiom: 'c² = a² + b² (Hypotenuse = √(Base² + Height²))'
                },
                {
                  id: 'mid_m_16',
                  title: 'Pythagoras Triplets: 3-4-5, 5-12-13, 8-15-17 (Day 16)',
                  keyAxiom: '(2m, m² - 1, m² + 1) generates right triangle integer sides'
                },
                {
                  id: 'mid_m_17',
                  title: 'Circle: Circumference Formula 2πr (Day 17)',
                  keyAxiom: 'Circumference = 2 × (22/7) × radius'
                },
                {
                  id: 'mid_m_18',
                  title: 'Circle: Area Formula πr² (Day 18)',
                  keyAxiom: 'Area = (22/7) × radius²'
                }
              ]
            }
          ],
          microTopics: [
            {
              id: 'mid_m_15',
              topicTitle: 'Pythagoras Theorem: Finding Hypotenuse (Day 15)',
              subtopic: 'Right-Angled Triangle Side Calculation: Hypotenuse² = Base² + Altitude²',
              dayNumber: 15,
              periodNumber: 1,
              keyFormulaOrLaw: 'Hypotenuse c = √(a² + b²) | a² + b² = c²',
              keyPoints: [
                'Strictly applies only to 90-degree right-angled triangles',
                'The hypotenuse is always the longest side opposite the 90° right angle'
              ],
              type: 'solved_problem',
              importance: 'High-Yield'
            },
            {
              id: 'mid_m_16',
              topicTitle: 'Pythagorean Triplets (3-4-5, 5-12-13, 8-15-17) (Day 16)',
              subtopic: 'Integer Side Combinations and Formula (2m, m² - 1, m² + 1)',
              dayNumber: 16,
              periodNumber: 1,
              keyFormulaOrLaw: 'Pythagorean Triplet: 2m, m² - 1, m² + 1 for any integer m > 1',
              keyPoints: [
                'Multiples of triplets also form right triangles (e.g. 6-8-10 is 2× of 3-4-5)',
                'Used in construction for verifying perfect 90-degree right-angle corners'
              ],
              type: 'solved_problem',
              importance: 'High-Yield'
            },
            {
              id: 'mid_m_17',
              topicTitle: 'Circle: Circumference Formula 2πr (Day 17)',
              subtopic: 'Boundary Distance of Circle, Diameter Relation (C = πd) & Wheel Rotations',
              dayNumber: 17,
              periodNumber: 1,
              keyFormulaOrLaw: 'Circumference C = 2πr = πd (where π ≈ 22/7 or 3.14159)',
              keyPoints: [
                'Circumference is the distance traveled by a wheel in one complete revolution',
                'Ratio of Circumference to Diameter is constant π for all circles'
              ],
              type: 'solved_problem',
              importance: 'High-Yield'
            },
            {
              id: 'mid_m_18',
              topicTitle: 'Circle: Area Formula πr² (Day 18)',
              subtopic: 'Calculating 2D Enclosed Surface Area of Circle and Semicircle (½πr²)',
              dayNumber: 18,
              periodNumber: 1,
              keyFormulaOrLaw:
                'Circle Area A = πr² | Semicircle Area = ½πr² | Quadrant Area = ¼πr²',
              keyPoints: [
                'Area units are always square units (cm², m²)',
                'Doubling the radius increases the circle area by 4 times (2² = 4)'
              ],
              type: 'solved_problem',
              importance: 'High-Yield'
            }
          ]
        }
      ]
    },
    {
      subjectId: 'mid_science',
      subjectName: isTa
        ? 'அறிவியல் (Physics, Chemistry & Biology Core)'
        : 'Science (Physics, Chemistry & Biology Core)',
      icon: '⚡',
      color: '#10b981',
      totalChapters: 3,
      totalMicroTopics: 22,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: isTa
            ? 'இயற்பியல் நானோ அலகுகள்: இய க் கம், வி ச ஈ, அழுத்தம் & ஒளி'
            : 'Physics Nano-Units: Motion, Force, Pressure & Light',
          description: isTa
            ? 'வ இ கம், மு டு க் கம், வி ச ஈ F=ma, நிய₹ ட் டன் விதிகள் 1/2/3, ஒம் விதி, மின்த ட ஈ தொ டர்/ப க் க இண ஈப்பு, ஒளி எதிரொலிப்பு மற்றும் வில கல்'
            : "Speed, Acceleration, Force F=ma, Newton 1st/2nd/3rd Laws, Ohm's Law, Series/Parallel Resistors, Reflection and Refraction",
          subtopics: [
            {
              id: 'mid_s_sub1',
              title: 'இயற்பியல் நானோ அலகுகள்',
              microTopics: [
                {
                  id: 'mid_p_19',
                  title: 'Speed vs Velocity vs Acceleration (Day 19)',
                  keyAxiom: 'Speed = Distance/Time | a = (v - u)/t (m/s²)'
                },
                {
                  id: 'mid_p_20',
                  title: 'Fluid Pressure: P = F/A & Liquid Depth P = πgh (Day 20)',
                  keyAxiom: 'Pressure in liquid increases linearly with depth'
                },
                {
                  id: 'mid_p_21',
                  title: 'Newton 1st Law: Inertia of Rest and Motion (Day 21)',
                  keyAxiom: 'Objects resist change in velocity unless acted by net force'
                },
                {
                  id: 'mid_p_22',
                  title: 'Newton 2nd Law: F = ma & Momentum Impulse (Day 22)',
                  keyAxiom: 'Force equals mass times acceleration (F = dp/dt)'
                },
                {
                  id: 'mid_p_23',
                  title: 'Newton 3rd Law: Action & Reaction Pairs (Day 23)',
                  keyAxiom: 'For every action, equal and opposite reaction (F₹₹₹ = -F₹₹₹)'
                },
                {
                  id: 'mid_p_24',
                  title: "Ohm's Law: Voltage, Current & Resistance V = IR (Day 24)",
                  keyAxiom: 'Current is directly proportional to potential difference'
                },
                {
                  id: 'mid_p_25',
                  title: 'Resistors in Series: R_s = R₹ + R₹₹ + R₹ஃ (Day 25)',
                  keyAxiom: 'Same current; Total resistance is sum of individual resistances'
                },
                {
                  id: 'mid_p_26',
                  title: 'Resistors in Parallel: 1/R_p = 1/R₹ + 1/R₹₹ (Day 26)',
                  keyAxiom: 'Same voltage; Reciprocal sum gives inverse equivalent resistance'
                }
              ]
            }
          ],
          microTopics: [
            {
              id: 'mid_p_19',
              topicTitle: 'Speed, Velocity & Acceleration (Day 19)',
              subtopic:
                'Scalar Speed, Vector Velocity and Rate of Change of Velocity Acceleration (a = Δv/Δt)',
              dayNumber: 19,
              periodNumber: 1,
              keyFormulaOrLaw:
                'Speed = Distance / Time | Velocity = Displacement / Time | Acceleration a = (v - u) / t',
              keyPoints: [
                'Speed is scalar (no direction); Velocity is vector (magnitude and direction)',
                'Deceleration / Retardation is negative acceleration when brakes are applied'
              ],
              type: 'solved_problem',
              importance: 'High-Yield'
            },
            {
              id: 'mid_p_20',
              topicTitle: 'Fluid Pressure & Atmospheric Barometer (Day 20)',
              subtopic:
                'Pressure P = F/A (1 Pa = 1 N/m²), Hydrostatic Pressure (P = hπg) & Mercury Column',
              dayNumber: 20,
              periodNumber: 1,
              keyFormulaOrLaw:
                'Pressure P = Force / Area (Pa) | Liquid Hydrostatic Pressure P = h × π × g',
              keyPoints: [
                'Dams are built wider at the bottom because liquid pressure increases with depth',
                'Standard atmospheric pressure at sea level is 760 mm Hg (1.013 × 10µ Pa)'
              ],
              type: 'solved_problem',
              importance: 'High-Yield'
            },
            {
              id: 'mid_p_21',
              topicTitle: "Newton's 1st Law: Inertia of Rest & Motion (Day 21)",
              subtopic:
                'Galileo Concept of Inertia, Inertia of Rest, Motion, Direction and Mass as Measure of Inertia',
              dayNumber: 21,
              periodNumber: 1,
              keyFormulaOrLaw: "Newton's First Law: Σ F = 0 -> Velocity is Constant (Inertia)",
              keyPoints: [
                'Passengers lean backwards when bus starts suddenly due to inertia of rest',
                'Heavier objects have greater inertia because inertia is directly proportional to mass'
              ],
              type: 'concept',
              importance: 'High-Yield'
            },
            {
              id: 'mid_p_22',
              topicTitle: "Newton's 2nd Law: Force Formula F = ma (Day 22)",
              subtopic: 'Momentum (p = mv), Rate of Change of Momentum and Impulse (J = F × Δt)',
              dayNumber: 22,
              periodNumber: 1,
              keyFormulaOrLaw: 'Force F = m × a = (mv - mu) / t | Impulse J = Force × Time = Δp',
              keyPoints: [
                'Fielder pulls hands backward while catching ball to increase time, reducing impact force',
                '1 Newton is the force that produces an acceleration of 1 m/s² on a 1 kg mass'
              ],
              type: 'solved_problem',
              importance: 'High-Yield'
            },
            {
              id: 'mid_p_23',
              topicTitle: "Newton's 3rd Law: Action & Reaction Pairs (Day 23)",
              subtopic:
                'Simultaneous Force Pairs Acting on Different Bodies, Recoil of Gun and Rocket Propulsion',
              dayNumber: 23,
              periodNumber: 1,
              keyFormulaOrLaw: 'Force on A by B = - Force on B by A | F₹₹₹ = -F₹₹₹',
              keyPoints: [
                'Action and reaction never cancel each other because they act on two different bodies',
                'Rocket moves upward as high-speed combustion exhaust gases push downward'
              ],
              type: 'concept',
              importance: 'High-Yield'
            },
            {
              id: 'mid_p_24',
              topicTitle: "Ohm's Law: Voltage, Current & Resistance V = IR (Day 24)",
              subtopic: 'Ohmic Conductors, V-I Linear Characteristic Graph and Resistance Concept',
              dayNumber: 24,
              periodNumber: 1,
              keyFormulaOrLaw:
                'Potential Difference V = Current (I) × Resistance (R) | R = V / I (Ohms Ω)',
              keyPoints: [
                'At constant temperature, current through metallic conductor is proportional to voltage',
                'Slope of V-I graph represents electrical resistance of the conductor'
              ],
              type: 'solved_problem',
              importance: 'High-Yield'
            },
            {
              id: 'mid_p_25',
              topicTitle: 'Resistors in Series: R_s = R₹ + R₹₹ + R₹ஃ (Day 25)',
              subtopic:
                'Single Pathway Circuit, Same Current Through All Resistors & Voltage Division',
              dayNumber: 25,
              periodNumber: 1,
              keyFormulaOrLaw:
                'Series Equivalent: R_s = R₹ + R₹₹ + R₹ஃ | Total Voltage V = V₹ + V₹₹ + V₹ஃ',
              keyPoints: [
                'Equivalent series resistance is always greater than the largest individual resistor',
                'If any one component in series breaks, the entire circuit stops working'
              ],
              type: 'solved_problem',
              importance: 'High-Yield'
            },
            {
              id: 'mid_p_26',
              topicTitle: 'Resistors in Parallel: 1/R_p = 1/R₹ + 1/R₹₹ (Day 26)',
              subtopic:
                'Multiple Current Branches, Same Voltage Across Resistors & Domestic Wiring',
              dayNumber: 26,
              periodNumber: 1,
              keyFormulaOrLaw:
                'Parallel Equivalent: 1/R_p = 1/R₹ + 1/R₹₹ | Total Current I = I₹ + I₹₹',
              keyPoints: [
                'Equivalent parallel resistance is always smaller than the smallest individual resistor',
                'Home appliances are connected in parallel so each operates independently at 220V'
              ],
              type: 'solved_problem',
              importance: 'High-Yield'
            }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: isTa
            ? 'வ இதியியல் நானோ அலகுகள்: அமில ங் கள், கார ங் கள், pH & அணு அம ஈப்பு'
            : 'Chemistry Nano-Units: Acids, Bases, pH & Atomic Structure',
          description: isTa
            ? 'லி ட்மஸ், ந டுநிலையா க் கல், pH அளவீ டு (0–14), புரோ ட் டான், எல க் ட்ரான், நிய₹ ட்ரான், அணு எண் Z மற்றும் நிற ஈ எண் A'
            : 'Litmus indicators, Neutralization, pH scale (0 to 14), Subatomic particles, Atomic number Z and Mass number A',
          subtopics: [
            {
              id: 'mid_s_sub2',
              title: 'வ இதியியல் நானோ அலகுகள்',
              microTopics: [
                {
                  id: 'mid_c_27',
                  title: 'Acids & Bases: Litmus Indicators (Day 27)',
                  keyAxiom: 'Acids turn blue litmus red; Bases turn red litmus blue'
                },
                {
                  id: 'mid_c_28',
                  title: 'Neutralization: Acid + Base -> Salt + Water (Day 28)',
                  keyAxiom: 'HCl + NaOH -> NaCl + H₹₹O + Heat energy'
                },
                {
                  id: 'mid_c_29',
                  title: 'pH Scale: 0 to 14 Acidity & Basicity Measure (Day 29)',
                  keyAxiom: 'pH = -log₹₹ீ[Hº] | pH < 7 Acidic | pH = 7 Neutral | pH > 7 Basic'
                },
                {
                  id: 'mid_c_30',
                  title: 'Atomic Structure: Protons, Neutrons & Electrons (Day 30)',
                  keyAxiom: 'Protons (+), Neutrons (0) in Nucleus; Electrons (-) in Shells'
                }
              ]
            }
          ],
          microTopics: [
            {
              id: 'mid_c_27',
              topicTitle: 'Acids & Bases: Litmus & Indicators (Day 27)',
              subtopic:
                'Natural Indicators (Turmeric, China Rose, Red Cabbage) and Synthetic Indicators (Phenolphthalein)',
              dayNumber: 27,
              periodNumber: 1,
              keyFormulaOrLaw:
                'Acids: Sour Taste, pH < 7, Blue Litmus -> Red | Bases: Bitter, Soapy, Red Litmus -> Blue',
              keyPoints: [
                'Phenolphthalein turns bright pink in basic solutions and remains colorless in acids',
                'Methyl orange turns red in acidic solutions and yellow in basic solutions'
              ],
              type: 'concept',
              importance: 'High-Yield'
            },
            {
              id: 'mid_c_28',
              topicTitle: 'Neutralization: Acid + Base -> Salt + Water (Day 28)',
              subtopic: 'Exothermic Neutralization Reaction, Salt Formation & Antacid Treatment',
              dayNumber: 28,
              periodNumber: 1,
              keyFormulaOrLaw:
                'Neutralization: Acid + Base -> Salt + Water (e.g. HCl + NaOH -> NaCl + H₹₹O)',
              keyPoints: [
                'Antacid tablets containing Magnesium Hydroxide Mg(OH)₹₹ neutralize excess stomach acid',
                'Bee sting is acidic (formic acid), treated by applying mild base like baking soda'
              ],
              type: 'concept',
              importance: 'High-Yield'
            },
            {
              id: 'mid_c_29',
              topicTitle: 'pH Scale: 0 to 14 Acidity & Alkalinity (Day 29)',
              subtopic:
                'Sorenson pH Scale, Hydrogen Ion Concentration & Universal Indicator Color Chart',
              dayNumber: 29,
              periodNumber: 1,
              keyFormulaOrLaw:
                'pH = -log₹₹ீ[Hº] | Acidic: 0 to 6.9 | Neutral: 7.0 | Basic / Alkaline: 7.1 to 14',
              keyPoints: [
                'Human blood maintains strict homeostasis around pH 7.35 to 7.45',
                'Acid rain occurs when atmospheric sulfur/nitrogen oxides drop rain pH below 5.6'
              ],
              type: 'solved_problem',
              importance: 'High-Yield'
            },
            {
              id: 'mid_c_30',
              topicTitle: 'Atomic Structure: Protons, Neutrons & Electrons (Day 30)',
              subtopic:
                'Bohr-Rutherford Planetary Model, Atomic Number Z, Mass Number A & Shell Filling',
              dayNumber: 30,
              periodNumber: 1,
              keyFormulaOrLaw:
                'Atomic Number Z = Protons = Electrons | Mass Number A = Protons + Neutrons',
              keyPoints: [
                'Protons (+1 charge) and Neutrons (0 charge) form the heavy central Nucleus',
                'Electrons (-1 charge) revolve in discrete energy shells following the 2n² rule (K=2, L=8, M=18)'
              ],
              type: 'concept',
              importance: 'High-Yield'
            }
          ]
        },
        {
          chapterNumber: 3,
          chapterTitle: isTa
            ? 'உயிரியல் நானோ அலகுகள்: ஒளி ச் ச இர் க் க ஈ, இதயம், ந ஆ ஃப்ரான் & மூள ஈ'
            : 'Biology Nano-Units: Photosynthesis, Heart, Nephron & Brain',
          description: isTa
            ? 'ஒளி ச் ச இர் க் க ஈ ஒளி/ இருள் வின ஈ கள், இதயத்தின் 4 அற ஈ கள் & ப இஸ்ம இ க் கர், ந ஆ ஃப்ரான் வ டி க ட் டுதல், மூள ஈயின் பகுதி கள் மற்றும் தாவர ஹார்மோன் கள்'
            : 'Light & Dark photosynthesis, Heart 4 chambers & SA node, Nephron ultrafiltration, Brain regions and Plant hormones',
          subtopics: [
            {
              id: 'mid_s_sub3',
              title: 'உயிரியல் நானோ அலகுகள்',
              microTopics: [
                {
                  id: 'mid_b_31',
                  title: 'Photosynthesis: Light Reaction in Thylakoids (Day 31)',
                  keyAxiom: 'Photolysis: 2H₹₹O + Light -> 4Hº + 4e» + O₹₹ + ATP + NADPH'
                },
                {
                  id: 'mid_b_32',
                  title: 'Photosynthesis: Dark Reaction Calvin Cycle (Day 32)',
                  keyAxiom: 'RuBisCO fixes CO₹₹ + ATP + NADPH into Glucose in Stroma'
                },
                {
                  id: 'mid_b_33',
                  title: 'Human Heart: SA Node Natural Pacemaker (Day 33)',
                  keyAxiom: 'Sinoatrial node generates rhythmic 72 electrical impulses/min'
                },
                {
                  id: 'mid_b_34',
                  title: 'Human Heart: Double Circulation Flow (Day 34)',
                  keyAxiom: 'Pulmonary circuit (Lungs) + Systemic circuit (Body organs)'
                },
                {
                  id: 'mid_b_35',
                  title: 'Nephron: Glomerular Ultrafiltration (Day 35)',
                  keyAxiom: "Bowman's capsule filters waste under high glomerular pressure"
                },
                {
                  id: 'mid_b_36',
                  title: 'Nephron: Selective Reabsorption in Henle Loop (Day 36)',
                  keyAxiom: 'Reabsorbs 99% water, glucose and amino acids into capillaries'
                },
                {
                  id: 'mid_b_37',
                  title: 'Human Brain: Cerebrum & Cognitive Functions (Day 37)',
                  keyAxiom:
                    'Cerebrum governs conscious thought, speech, sensory perception and memory'
                },
                {
                  id: 'mid_b_38',
                  title: 'Human Brain: Cerebellum & Body Equilibrium (Day 38)',
                  keyAxiom: 'Cerebellum coordinates voluntary muscle movements and motor balance'
                },
                {
                  id: 'mid_b_39',
                  title: 'Plant Hormones: Auxin & Phototropism (Day 39)',
                  keyAxiom:
                    'Auxin elongates cells on shaded side causing stem to bend towards sunlight'
                },
                {
                  id: 'mid_b_40',
                  title: 'Plant Hormones: Ethylene & Fruit Ripening (Day 40)',
                  keyAxiom:
                    'Gaseous hormone converting complex fruit starches to simple sweet sugars'
                }
              ]
            }
          ],
          microTopics: [
            {
              id: 'mid_b_31',
              topicTitle: 'Photosynthesis: Light Reaction in Thylakoids (Day 31)',
              subtopic:
                'Photolysis of Water, Chlorophyll Light Absorption, ATP and NADPH Energy Synthesis',
              dayNumber: 31,
              periodNumber: 1,
              keyFormulaOrLaw:
                'Photolysis: 2H₹₹O + Sunlight -> 4Hº + 4e» + O₹₹ (Oxygen Released) + ATP + NADPH',
              keyPoints: [
                'Occurs in the Thylakoid Grana membranes of Chloroplasts containing green chlorophyll',
                'Solar energy is converted into chemical energy currencies ATP and NADPH'
              ],
              type: 'concept',
              importance: 'High-Yield'
            },
            {
              id: 'mid_b_32',
              topicTitle: 'Photosynthesis: Dark Reaction Calvin Cycle (Day 32)',
              subtopic: 'Stroma Carbon Fixation, RuBisCO Enzyme and Glucose C₹ஆH₹₹₹O₹ஆ Synthesis',
              dayNumber: 32,
              periodNumber: 1,
              keyFormulaOrLaw:
                'Calvin Cycle: 6CO₹₹ + 18 ATP + 12 NADPH -> C₹ஆH₹₹₹O₹ஆ (Glucose) + 18 ADP + 12 NADPº',
              keyPoints: [
                'Takes place in the fluid Stroma of Chloroplasts independent of direct light',
                'RuBisCO is the most abundant enzyme on Earth responsible for fixing atmospheric CO₹₹'
              ],
              type: 'concept',
              importance: 'High-Yield'
            },
            {
              id: 'mid_b_33',
              topicTitle: 'Human Heart: SA Node Natural Pacemaker (Day 33)',
              subtopic:
                'Sinoatrial Node Electrical Conduction, Atrial Depolarization & Cardiac Pulse',
              dayNumber: 33,
              periodNumber: 1,
              keyFormulaOrLaw:
                'Cardiac Output = Stroke Volume (70 mL) × Heart Rate (72 bpm) ≈ 5.0 Litres/min',
              keyPoints: [
                'SA node located in the right atrium generates rhythmic electrical impulses spontaneously',
                'Artificial electronic pacemakers are implanted when the natural SA node malfunctions'
              ],
              type: 'concept',
              importance: 'High-Yield'
            },
            {
              id: 'mid_b_34',
              topicTitle: 'Human Heart: Double Circulation Flow (Day 34)',
              subtopic:
                'Pulmonary Circulation (Deoxygenated to Lungs) vs Systemic Circulation (Oxygenated to Body)',
              dayNumber: 34,
              periodNumber: 1,
              keyFormulaOrLaw:
                'Double Circuit: Heart -> Lungs -> Heart (Pulmonary) & Heart -> Body -> Heart (Systemic)',
              keyPoints: [
                'Prevents mixing of oxygen-rich and carbon dioxide-rich blood for maximum oxygen efficiency',
                'Left ventricle has the thickest muscular myocardium wall to pump blood against systemic resistance'
              ],
              type: 'concept',
              importance: 'High-Yield'
            },
            {
              id: 'mid_b_35',
              topicTitle: 'Nephron: Glomerular Ultrafiltration (Day 35)',
              subtopic:
                "Afferent vs Efferent Arteriole Hydrostatic Pressure and Bowman's Capsule Filtration",
              dayNumber: 35,
              periodNumber: 1,
              keyFormulaOrLaw:
                'Glomerular Filtration Rate (GFR) ≈ 125 mL/min = 180 Litres/day of Primary Filtrate',
              keyPoints: [
                'High pressure in glomerulus capillaries forces water, urea, ions, and glucose into Bowman capsule',
                'Blood cells and large plasma proteins (Albumin) are retained in bloodstream'
              ],
              type: 'concept',
              importance: 'High-Yield'
            },
            {
              id: 'mid_b_36',
              topicTitle: 'Nephron: Selective Reabsorption in Henle Loop (Day 36)',
              subtopic:
                'Proximal Convoluted Tubule (PCT), Loop of Henle Counter-Current and Urine Concentration',
              dayNumber: 36,
              periodNumber: 1,
              keyFormulaOrLaw:
                'Urine Output = 180 L GFR - 178.5 L Reabsorbed = 1.5 Litres/day of Concentrated Urine',
              keyPoints: [
                '100% of vital glucose and amino acids are actively reabsorbed back into peritubular capillaries',
                'Antidiuretic Hormone (ADH) controls water permeability in collecting ducts'
              ],
              type: 'concept',
              importance: 'High-Yield'
            },
            {
              id: 'mid_b_37',
              topicTitle: 'Human Brain: Cerebrum & Cognitive Functions (Day 37)',
              subtopic:
                'Cerebral Cortex, 4 Lobes (Frontal, Parietal, Occipital, Temporal) & Voluntary Control',
              dayNumber: 37,
              periodNumber: 1,
              keyFormulaOrLaw:
                'Cerebrum = Largest Part (~80% of brain) | Seat of Logic, Memory, Emotion and Sensory Processing',
              keyPoints: [
                'Left hemisphere controls right side of body and governs logic/language skills',
                'Right hemisphere controls left side of body and governs spatial awareness/creativity'
              ],
              type: 'concept',
              importance: 'High-Yield'
            },
            {
              id: 'mid_b_38',
              topicTitle: 'Human Brain: Cerebellum & Body Equilibrium (Day 38)',
              subtopic:
                'Hindbrain Motor Coordination, Muscular Posture, Precision Timing and Balance',
              dayNumber: 38,
              periodNumber: 1,
              keyFormulaOrLaw:
                'Cerebellum = "Little Brain" | Coordinates Voluntary Muscular Precision & Posture Balance',
              keyPoints: [
                'Allows smooth coordinated movements like walking a tightrope, cycling, or playing piano',
                'Alcohol consumption impairs cerebellum function causing loss of muscular coordination and slurred speech'
              ],
              type: 'concept',
              importance: 'High-Yield'
            },
            {
              id: 'mid_b_39',
              topicTitle: 'Plant Hormones: Auxin & Phototropism (Day 39)',
              subtopic:
                'Indole-3-Acetic Acid (IAA), Apical Dominance and Stem Bending Towards Light',
              dayNumber: 39,
              periodNumber: 1,
              keyFormulaOrLaw:
                'Phototropism: Auxin migrates to shaded side -> Stimulates cell elongation -> Stem bends to light',
              keyPoints: [
                'Auxin is produced in the growing shoot tips (apical meristems)',
                'Synthetic auxins (2,4-D) are used as selective weed killers in cereal farming'
              ],
              type: 'concept',
              importance: 'High-Yield'
            },
            {
              id: 'mid_b_40',
              topicTitle: 'Plant Hormones: Ethylene & Fruit Ripening (Day 40)',
              subtopic:
                'Gaseous Phytohormone (C₹₹H₹„), Starch Breakdown, Aroma Development and Abscission',
              dayNumber: 40,
              periodNumber: 1,
              keyFormulaOrLaw:
                'Ethylene: Converts starch to sugars | Breaks down chlorophyll | Softens fruit cell walls',
              keyPoints: [
                'Only known gaseous plant hormone in nature',
                'Placing a ripe banana with raw fruits accelerates ripening of the other fruits'
              ],
              type: 'concept',
              importance: 'High-Yield'
            }
          ]
        }
      ]
    },
    {
      subjectId: 'mid_social',
      subjectName: isTa
        ? 'சமூ க அறிவியல் (History, Geography, Civics & Economics)'
        : 'Social Science (History, Geography, Civics & Economics)',
      icon: 'ðடஏ›ï¸ஏ',
      color: '#f59e0b',
      totalChapters: 3,
      totalMicroTopics: 14,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: isTa
            ? 'வரலாறு ( சிந்து சமவ ஆளி, பல்லவர், சோழர் & மு கலாயர்)'
            : 'History: Indus Valley, Pallavas, Cholas & Mughals',
          description: isTa
            ? 'ஹரப்பா மொ க ஞ் சதாரோ, மாமல்லபுரம் பல்லவர், த ஞ் ச ஈ பெரிய கோவில் சோழர், மு கலாயர் ஆ ட் சி'
            : 'Harappa, Mohenjo-Daro, Pallava cave temples, Raja Raja Chola Brihadisvara, Mughals',
          subtopics: [
            {
              id: 'mid_soc_sub1',
              title: 'இந்திய மற்றும் தமிழ்நா டு வரலாறு',
              microTopics: [
                {
                  id: 'mid_soc_1',
                  title: 'சிந்து சமவ ஆளி நா கரி கம் & சோழர் வரலாற்றுப் ப ஆரும ஈ',
                  keyAxiom: 'Raja Raja Chola built Brihadisvara Temple Thanjavur (1010 AD)'
                }
              ]
            }
          ],
          microTopics: [
            {
              id: 'mid_soc_1',
              topicTitle: isTa
                ? 'சிந்து சமவ ஆளி, சோழர் & மு கலாயப் ப இரர சு வரலாறு'
                : 'Indus Valley, Chola Empire & Mughal Administration',
              subtopic: isTa
                ? 'ஹரப்பா ந கரம ஈப்பு & த ஞ் ச ஈ பெரிய கோவில்'
                : 'Grid town planning, Great Bath, Raja Raja Chola naval expeditions, Akbar administration',
              dayNumber: 15,
              periodNumber: 4,
              keyFormulaOrLaw:
                'Indus Valley: Discovered in 1921 | Brihadisvara Temple: 1010 AD by Raja Raja I',
              keyPoints: [
                'Bronze dancing girl and priest king found in Mohenjo-Daro',
                'Uttaramerur inscription describes Chola Kudavolai election system'
              ],
              type: 'concept',
              importance: 'High-Yield'
            }
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
    totalMicroTopics: subjects.reduce(
      (a, s) =>
        a +
        (s.totalMicroTopics ||
          s.chapters.reduce((acc, c) => acc + (c.microTopics?.length || 0), 0)),
      0
    ),
    subjects
  };
}

export function getSecondaryClass9to10Syllabus(courseId: string, courseTitle: string): any {
  const isTa = courseTitle.includes('தமிழ்') || courseId.includes('-ta-');
  const subjects = [
    {
      subjectId: 'sec_math',
      subjectName: 'Mathematics',
      icon: '📐ஐ',
      color: '#06b6d4',
      totalChapters: 8,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: 'Relations and Functions',
          microTopics: [
            {
              id: 'm1_1',
              topicTitle: 'Ordered Pair Definition',
              subtopic: 'Relations',
              dayNumber: 1,
              periodNumber: 1,
              keyFormulaOrLaw: '(a,b) = (c,d) iff a=c, b=d',
              keyPoints: ['An ordered pair consists of two elements in a fixed order'],
              type: 'concept',
              importance: 'Foundational'
            },
            {
              id: 'm1_2',
              topicTitle: 'Cartesian Product AxB',
              subtopic: 'Relations',
              dayNumber: 1,
              periodNumber: 2,
              keyFormulaOrLaw: 'AxB = {(a,b) | a in A, b in B}',
              keyPoints: ['Set of all ordered pairs'],
              type: 'formula',
              importance: 'Core Standard'
            },
            {
              id: 'm1_3',
              topicTitle: 'Relation Definition',
              subtopic: 'Relations',
              dayNumber: 1,
              periodNumber: 3,
              keyFormulaOrLaw: 'R is subset of AxB',
              keyPoints: ['A relation links elements of A to B'],
              type: 'concept',
              importance: 'Foundational'
            },
            {
              id: 'm1_4',
              topicTitle: 'Arrow Diagram Representation',
              subtopic: 'Relations',
              dayNumber: 1,
              periodNumber: 4,
              keyFormulaOrLaw: 'Visual mapping',
              keyPoints: ['Visualizing relations using arrows'],
              type: 'concept',
              importance: 'Foundational'
            },
            {
              id: 'm1_5',
              topicTitle: 'Domain of a Relation',
              subtopic: 'Relations',
              dayNumber: 2,
              periodNumber: 1,
              keyFormulaOrLaw: 'Domain = {a | (a,b) in R}',
              keyPoints: ['Set of all first elements'],
              type: 'concept',
              importance: 'Core Standard'
            },
            {
              id: 'm1_6',
              topicTitle: 'Range of a Relation',
              subtopic: 'Relations',
              dayNumber: 2,
              periodNumber: 2,
              keyFormulaOrLaw: 'Range = {b | (a,b) in R}',
              keyPoints: ['Set of all second elements'],
              type: 'concept',
              importance: 'Core Standard'
            },
            {
              id: 'm1_7',
              topicTitle: 'Function Definition',
              subtopic: 'Functions',
              dayNumber: 2,
              periodNumber: 3,
              keyFormulaOrLaw: 'Each input has exactly one output',
              keyPoints: ['Special type of relation'],
              type: 'concept',
              importance: 'High-Yield'
            },
            {
              id: 'm1_8',
              topicTitle: 'Vertical Line Test',
              subtopic: 'Functions',
              dayNumber: 2,
              periodNumber: 4,
              keyFormulaOrLaw: 'Intersects at most once',
              keyPoints: ['Test to determine if graph is a function'],
              type: 'solved_problem',
              importance: 'Core Standard'
            },
            {
              id: 'm1_9',
              topicTitle: 'One-to-One Function',
              subtopic: 'Types of Functions',
              dayNumber: 3,
              periodNumber: 1,
              keyFormulaOrLaw: 'f(a)=f(b) implies a=b',
              keyPoints: ['Distinct inputs have distinct outputs'],
              type: 'concept',
              importance: 'High-Yield'
            },
            {
              id: 'm1_10',
              topicTitle: 'Onto Function',
              subtopic: 'Types of Functions',
              dayNumber: 3,
              periodNumber: 2,
              keyFormulaOrLaw: 'Range = Codomain',
              keyPoints: ['Every element in codomain is mapped'],
              type: 'concept',
              importance: 'High-Yield'
            },
            {
              id: 'm1_11',
              topicTitle: 'Composition of Functions',
              subtopic: 'Composition',
              dayNumber: 3,
              periodNumber: 3,
              keyFormulaOrLaw: '(fog)(x) = f(g(x))',
              keyPoints: ['Applying one function to the result of another'],
              type: 'formula',
              importance: 'High-Yield'
            },
            {
              id: 'm1_12',
              topicTitle: 'Inverse of a Function',
              subtopic: 'Inverse',
              dayNumber: 3,
              periodNumber: 4,
              keyFormulaOrLaw: 'f(f^-1(x)) = x',
              keyPoints: ['Reversing the mapping'],
              type: 'formula',
              importance: 'Core Standard'
            }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: 'Numbers and Sequences',
          microTopics: [
            {
              id: 'm2_1',
              topicTitle: 'Euclids Division Lemma',
              subtopic: 'Numbers',
              dayNumber: 4,
              periodNumber: 1,
              keyFormulaOrLaw: 'a = bq + r',
              keyPoints: ['Fundamental division rule'],
              type: 'formula',
              importance: 'High-Yield'
            },
            {
              id: 'm2_2',
              topicTitle: 'Fundamental Theorem of Arithmetic',
              subtopic: 'Numbers',
              dayNumber: 4,
              periodNumber: 2,
              keyFormulaOrLaw: 'Unique prime factorization',
              keyPoints: ['Every integer greater than 1 is prime or product of primes'],
              type: 'concept',
              importance: 'High-Yield'
            },
            {
              id: 'm2_3',
              topicTitle: 'Arithmetic Progression Definition',
              subtopic: 'Sequences',
              dayNumber: 4,
              periodNumber: 3,
              keyFormulaOrLaw: 'Common difference d',
              keyPoints: ['Sequence with constant difference'],
              type: 'concept',
              importance: 'Foundational'
            },
            {
              id: 'm2_4',
              topicTitle: 'Nth Term of AP',
              subtopic: 'Sequences',
              dayNumber: 4,
              periodNumber: 4,
              keyFormulaOrLaw: 'tn = a + (n-1)d',
              keyPoints: ['Finding specific term in AP'],
              type: 'formula',
              importance: 'High-Yield'
            },
            {
              id: 'm2_5',
              topicTitle: 'Sum of AP',
              subtopic: 'Sequences',
              dayNumber: 5,
              periodNumber: 1,
              keyFormulaOrLaw: 'Sn = n/2(2a + (n-1)d)',
              keyPoints: ['Summing terms in AP'],
              type: 'formula',
              importance: 'High-Yield'
            },
            {
              id: 'm2_6',
              topicTitle: 'Geometric Progression Definition',
              subtopic: 'Sequences',
              dayNumber: 5,
              periodNumber: 2,
              keyFormulaOrLaw: 'Common ratio r',
              keyPoints: ['Sequence with constant ratio'],
              type: 'concept',
              importance: 'Foundational'
            },
            {
              id: 'm2_7',
              topicTitle: 'Nth Term of GP',
              subtopic: 'Sequences',
              dayNumber: 5,
              periodNumber: 3,
              keyFormulaOrLaw: 'tn = a*r^(n-1)',
              keyPoints: ['Finding specific term in GP'],
              type: 'formula',
              importance: 'High-Yield'
            },
            {
              id: 'm2_8',
              topicTitle: 'Sum of GP',
              subtopic: 'Sequences',
              dayNumber: 5,
              periodNumber: 4,
              keyFormulaOrLaw: 'Sn = a(r^n - 1)/(r - 1)',
              keyPoints: ['Summing terms in GP'],
              type: 'formula',
              importance: 'High-Yield'
            },
            {
              id: 'm2_9',
              topicTitle: 'Sum of First N Natural Numbers',
              subtopic: 'Special Series',
              dayNumber: 6,
              periodNumber: 1,
              keyFormulaOrLaw: 'n(n+1)/2',
              keyPoints: ['Special series summation'],
              type: 'formula',
              importance: 'Core Standard'
            },
            {
              id: 'm2_10',
              topicTitle: 'Sum of Squares of First N Natural Numbers',
              subtopic: 'Special Series',
              dayNumber: 6,
              periodNumber: 2,
              keyFormulaOrLaw: 'n(n+1)(2n+1)/6',
              keyPoints: ['Special series summation'],
              type: 'formula',
              importance: 'Core Standard'
            },
            {
              id: 'm2_11',
              topicTitle: 'Sum of Cubes of First N Natural Numbers',
              subtopic: 'Special Series',
              dayNumber: 6,
              periodNumber: 3,
              keyFormulaOrLaw: '(n(n+1)/2)^2',
              keyPoints: ['Special series summation'],
              type: 'formula',
              importance: 'Core Standard'
            }
          ]
        },
        {
          chapterNumber: 3,
          chapterTitle: 'Algebra',
          microTopics: [
            {
              id: 'm3_1',
              topicTitle: 'Simultaneous Linear Equations',
              subtopic: 'Equations',
              dayNumber: 7,
              periodNumber: 1,
              keyFormulaOrLaw: 'ax+by=c',
              keyPoints: ['Solving two equations'],
              type: 'solved_problem',
              importance: 'High-Yield'
            },
            {
              id: 'm3_2',
              topicTitle: 'GCD of Polynomials',
              subtopic: 'Polynomials',
              dayNumber: 7,
              periodNumber: 2,
              keyFormulaOrLaw: 'Greatest Common Divisor',
              keyPoints: ['Finding GCD using division'],
              type: 'solved_problem',
              importance: 'Core Standard'
            },
            {
              id: 'm3_3',
              topicTitle: 'Rational Expressions',
              subtopic: 'Expressions',
              dayNumber: 7,
              periodNumber: 3,
              keyFormulaOrLaw: 'P(x)/Q(x)',
              keyPoints: ['Simplifying rational expressions'],
              type: 'concept',
              importance: 'Foundational'
            },
            {
              id: 'm3_4',
              topicTitle: 'Quadratic Equation Standard Form',
              subtopic: 'Quadratic',
              dayNumber: 7,
              periodNumber: 4,
              keyFormulaOrLaw: 'ax^2+bx+c=0',
              keyPoints: ['Standard representation'],
              type: 'formula',
              importance: 'Foundational'
            },
            {
              id: 'm3_5',
              topicTitle: 'Solving Quadratics by Factorization',
              subtopic: 'Quadratic',
              dayNumber: 8,
              periodNumber: 1,
              keyFormulaOrLaw: '(x-p)(x-q)=0',
              keyPoints: ['Factoring to find roots'],
              type: 'solved_problem',
              importance: 'Core Standard'
            },
            {
              id: 'm3_6',
              topicTitle: 'Quadratic Formula',
              subtopic: 'Quadratic',
              dayNumber: 8,
              periodNumber: 2,
              keyFormulaOrLaw: 'x = (-b ± √(b^2-4ac))/2a',
              keyPoints: ['Formula for roots'],
              type: 'formula',
              importance: 'High-Yield'
            },
            {
              id: 'm3_7',
              topicTitle: 'Nature of Roots Discriminant',
              subtopic: 'Quadratic',
              dayNumber: 8,
              periodNumber: 3,
              keyFormulaOrLaw: 'Δ = b^2-4ac',
              keyPoints: ['Determining root types'],
              type: 'concept',
              importance: 'High-Yield'
            }
          ]
        },
        {
          chapterNumber: 4,
          chapterTitle: 'Geometry',
          microTopics: [
            {
              id: 'm4_1',
              topicTitle: 'Similarity of Triangles',
              subtopic: 'Triangles',
              dayNumber: 9,
              periodNumber: 1,
              keyFormulaOrLaw: 'AAA Similarity',
              keyPoints: ['Corresponding angles equal'],
              type: 'concept',
              importance: 'Foundational'
            },
            {
              id: 'm4_2',
              topicTitle: 'Thales Theorem Definition',
              subtopic: 'Theorems',
              dayNumber: 9,
              periodNumber: 2,
              keyFormulaOrLaw: 'Basic Proportionality',
              keyPoints: ['Parallel line divides sides proportionally'],
              type: 'memorization',
              importance: 'High-Yield'
            },
            {
              id: 'm4_3',
              topicTitle: 'Angle Bisector Theorem',
              subtopic: 'Theorems',
              dayNumber: 9,
              periodNumber: 3,
              keyFormulaOrLaw: 'AB/AC = BD/DC',
              keyPoints: ['Bisector divides opposite side'],
              type: 'formula',
              importance: 'High-Yield'
            },
            {
              id: 'm4_4',
              topicTitle: 'Pythagoras Theorem',
              subtopic: 'Theorems',
              dayNumber: 9,
              periodNumber: 4,
              keyFormulaOrLaw: 'a^2 + b^2 = c^2',
              keyPoints: ['Right triangle side relationship'],
              type: 'formula',
              importance: 'High-Yield'
            },
            {
              id: 'm4_5',
              topicTitle: 'Circles Definition',
              subtopic: 'Circles',
              dayNumber: 10,
              periodNumber: 1,
              keyFormulaOrLaw: 'Radius and diameter',
              keyPoints: ['Basic circle components'],
              type: 'concept',
              importance: 'Foundational'
            },
            {
              id: 'm4_6',
              topicTitle: 'Tangents to a Circle',
              subtopic: 'Circles',
              dayNumber: 10,
              periodNumber: 2,
              keyFormulaOrLaw: 'Perpendicular to radius',
              keyPoints: ['Tangent properties'],
              type: 'concept',
              importance: 'Core Standard'
            }
          ]
        },
        {
          chapterNumber: 5,
          chapterTitle: 'Coordinate Geometry',
          microTopics: [
            {
              id: 'm5_1',
              topicTitle: 'Area of Triangle Formula',
              subtopic: 'Area',
              dayNumber: 11,
              periodNumber: 1,
              keyFormulaOrLaw: '0.5|x1(y2-y3)+x2(y3-y1)+x3(y1-y2)|',
              keyPoints: ['Calculating area using coordinates'],
              type: 'formula',
              importance: 'High-Yield'
            },
            {
              id: 'm5_2',
              topicTitle: 'Collinearity Condition',
              subtopic: 'Collinearity',
              dayNumber: 11,
              periodNumber: 2,
              keyFormulaOrLaw: 'Area = 0',
              keyPoints: ['Points on the same line'],
              type: 'concept',
              importance: 'Core Standard'
            },
            {
              id: 'm5_3',
              topicTitle: 'Slope of a Line',
              subtopic: 'Lines',
              dayNumber: 11,
              periodNumber: 3,
              keyFormulaOrLaw: 'm = (y2-y1)/(x2-x1)',
              keyPoints: ['Steepness of a line'],
              type: 'formula',
              importance: 'High-Yield'
            },
            {
              id: 'm5_4',
              topicTitle: 'Straight Line Equation',
              subtopic: 'Lines',
              dayNumber: 11,
              periodNumber: 4,
              keyFormulaOrLaw: 'y = mx + c',
              keyPoints: ['Slope-intercept form'],
              type: 'formula',
              importance: 'High-Yield'
            },
            {
              id: 'm5_5',
              topicTitle: 'Section Formula',
              subtopic: 'Coordinates',
              dayNumber: 12,
              periodNumber: 1,
              keyFormulaOrLaw: '[(mx2+nx1)/(m+n), (my2+ny1)/(m+n)]',
              keyPoints: ['Dividing a segment'],
              type: 'formula',
              importance: 'Core Standard'
            }
          ]
        },
        {
          chapterNumber: 6,
          chapterTitle: 'Trigonometry',
          microTopics: [
            {
              id: 'm6_1',
              topicTitle: 'Trigonometric Identities Definition',
              subtopic: 'Identities',
              dayNumber: 13,
              periodNumber: 1,
              keyFormulaOrLaw: 'sin^2(θ) + cos^2(θ) = 1',
              keyPoints: ['Basic identities'],
              type: 'formula',
              importance: 'High-Yield'
            },
            {
              id: 'm6_2',
              topicTitle: 'Heights and Distances',
              subtopic: 'Applications',
              dayNumber: 13,
              periodNumber: 2,
              keyFormulaOrLaw: 'tan(θ) = opposite/adjacent',
              keyPoints: ['Angle of elevation'],
              type: 'solved_problem',
              importance: 'High-Yield'
            },
            {
              id: 'm6_3',
              topicTitle: 'Trigonometric Ratios of Allied Angles',
              subtopic: 'Ratios',
              dayNumber: 13,
              periodNumber: 3,
              keyFormulaOrLaw: 'sin(90-θ) = cos(θ)',
              keyPoints: ['Complementary angles'],
              type: 'formula',
              importance: 'Core Standard'
            }
          ]
        },
        {
          chapterNumber: 7,
          chapterTitle: 'Mensuration',
          microTopics: [
            {
              id: 'm7_1',
              topicTitle: 'Surface Area of Cone',
              subtopic: 'Areas',
              dayNumber: 14,
              periodNumber: 1,
              keyFormulaOrLaw: 'πrl',
              keyPoints: ['Curved surface area'],
              type: 'formula',
              importance: 'Core Standard'
            },
            {
              id: 'm7_2',
              topicTitle: 'Volume of Cone',
              subtopic: 'Volumes',
              dayNumber: 14,
              periodNumber: 2,
              keyFormulaOrLaw: '(1/3)πr^2h',
              keyPoints: ['Cone capacity'],
              type: 'formula',
              importance: 'Core Standard'
            },
            {
              id: 'm7_3',
              topicTitle: 'Surface Area of Sphere',
              subtopic: 'Areas',
              dayNumber: 14,
              periodNumber: 3,
              keyFormulaOrLaw: '4πr^2',
              keyPoints: ['Sphere surface'],
              type: 'formula',
              importance: 'High-Yield'
            },
            {
              id: 'm7_4',
              topicTitle: 'Volume of Sphere',
              subtopic: 'Volumes',
              dayNumber: 14,
              periodNumber: 4,
              keyFormulaOrLaw: '(4/3)πr^3',
              keyPoints: ['Sphere capacity'],
              type: 'formula',
              importance: 'High-Yield'
            },
            {
              id: 'm7_5',
              topicTitle: 'Hemisphere Properties',
              subtopic: 'Solids',
              dayNumber: 15,
              periodNumber: 1,
              keyFormulaOrLaw: '2πr^2',
              keyPoints: ['Half sphere properties'],
              type: 'formula',
              importance: 'Core Standard'
            },
            {
              id: 'm7_6',
              topicTitle: 'Volume of Frustum',
              subtopic: 'Volumes',
              dayNumber: 15,
              periodNumber: 2,
              keyFormulaOrLaw: '(1/3)πh(r1^2 + r2^2 + r1r2)',
              keyPoints: ['Frustum capacity'],
              type: 'formula',
              importance: 'High-Yield'
            },
            {
              id: 'm7_7',
              topicTitle: 'Combined Solids Properties',
              subtopic: 'Solids',
              dayNumber: 15,
              periodNumber: 3,
              keyFormulaOrLaw: 'Additive volumes',
              keyPoints: ['Adding volumes of basic solids'],
              type: 'solved_problem',
              importance: 'Core Standard'
            }
          ]
        },
        {
          chapterNumber: 8,
          chapterTitle: 'Statistics and Probability',
          microTopics: [
            {
              id: 'm8_1',
              topicTitle: 'Mean for Grouped Data',
              subtopic: 'Statistics',
              dayNumber: 16,
              periodNumber: 1,
              keyFormulaOrLaw: 'Σfx/Σf',
              keyPoints: ['Average calculation'],
              type: 'formula',
              importance: 'Core Standard'
            },
            {
              id: 'm8_2',
              topicTitle: 'Median for Grouped Data',
              subtopic: 'Statistics',
              dayNumber: 16,
              periodNumber: 2,
              keyFormulaOrLaw: 'l + [(n/2 - cf)/f]*h',
              keyPoints: ['Middle value'],
              type: 'formula',
              importance: 'High-Yield'
            },
            {
              id: 'm8_3',
              topicTitle: 'Mode for Grouped Data',
              subtopic: 'Statistics',
              dayNumber: 16,
              periodNumber: 3,
              keyFormulaOrLaw: 'l + [(f1-f0)/(2f1-f0-f2)]*h',
              keyPoints: ['Most frequent value'],
              type: 'formula',
              importance: 'Core Standard'
            },
            {
              id: 'm8_4',
              topicTitle: 'Standard Deviation Definition',
              subtopic: 'Statistics',
              dayNumber: 16,
              periodNumber: 4,
              keyFormulaOrLaw: '√(Variance)',
              keyPoints: ['Measure of spread'],
              type: 'formula',
              importance: 'High-Yield'
            },
            {
              id: 'm8_5',
              topicTitle: 'Coefficient of Variation',
              subtopic: 'Statistics',
              dayNumber: 17,
              periodNumber: 1,
              keyFormulaOrLaw: '(SD/Mean)*100',
              keyPoints: ['Relative variability'],
              type: 'formula',
              importance: 'Core Standard'
            },
            {
              id: 'm8_6',
              topicTitle: 'Probability Definition',
              subtopic: 'Probability',
              dayNumber: 17,
              periodNumber: 2,
              keyFormulaOrLaw: 'Favorable/Total',
              keyPoints: ['Basic chance calculation'],
              type: 'concept',
              importance: 'Foundational'
            }
          ]
        }
      ]
    },
    {
      subjectId: 'sec_science',
      subjectName: 'Science',
      icon: '🔬',
      color: '#10b981',
      totalChapters: 23,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: 'Laws of Motion',
          microTopics: [
            {
              id: 's1_1',
              topicTitle: 'Newtons First Law',
              subtopic: 'Physics',
              dayNumber: 1,
              periodNumber: 1,
              keyFormulaOrLaw: 'Inertia',
              keyPoints: ['Object remains at rest'],
              type: 'memorization',
              importance: 'Foundational'
            }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: 'Optics',
          microTopics: [
            {
              id: 's2_1',
              topicTitle: 'Reflection of Light',
              subtopic: 'Physics',
              dayNumber: 2,
              periodNumber: 1,
              keyFormulaOrLaw: 'Angle of incidence equals reflection',
              keyPoints: ['Light bouncing back'],
              type: 'concept',
              importance: 'Foundational'
            }
          ]
        },
        {
          chapterNumber: 3,
          chapterTitle: 'Thermal Physics',
          microTopics: [
            {
              id: 's3_1',
              topicTitle: 'Heat Transfer Mechanisms',
              subtopic: 'Physics',
              dayNumber: 3,
              periodNumber: 1,
              keyFormulaOrLaw: 'Q = mcΔT',
              keyPoints: ['Conduction, Convection, Radiation'],
              type: 'concept',
              importance: 'Core Standard'
            }
          ]
        },
        {
          chapterNumber: 4,
          chapterTitle: 'Electricity',
          microTopics: [
            {
              id: 's4_1',
              topicTitle: 'Ohms Law',
              subtopic: 'Physics',
              dayNumber: 4,
              periodNumber: 1,
              keyFormulaOrLaw: 'V = IR',
              keyPoints: ['Voltage proportional to current'],
              type: 'formula',
              importance: 'High-Yield'
            }
          ]
        },
        {
          chapterNumber: 5,
          chapterTitle: 'Acoustics',
          microTopics: [
            {
              id: 's5_1',
              topicTitle: 'Sound Wave Properties',
              subtopic: 'Physics',
              dayNumber: 5,
              periodNumber: 1,
              keyFormulaOrLaw: 'v = fλ',
              keyPoints: ['Frequency and wavelength'],
              type: 'concept',
              importance: 'Core Standard'
            }
          ]
        },
        {
          chapterNumber: 6,
          chapterTitle: 'Nuclear Physics',
          microTopics: [
            {
              id: 's6_1',
              topicTitle: 'Radioactivity Definition',
              subtopic: 'Physics',
              dayNumber: 6,
              periodNumber: 1,
              keyFormulaOrLaw: 'E=mc^2',
              keyPoints: ['Decay of atomic nucleus'],
              type: 'concept',
              importance: 'Foundational'
            }
          ]
        },
        {
          chapterNumber: 7,
          chapterTitle: 'Atoms and Molecules',
          microTopics: [
            {
              id: 's7_1',
              topicTitle: 'Atomic Structure Basics',
              subtopic: 'Chemistry',
              dayNumber: 7,
              periodNumber: 1,
              keyFormulaOrLaw: 'Protons, Neutrons, Electrons',
              keyPoints: ['Components of an atom'],
              type: 'concept',
              importance: 'Foundational'
            }
          ]
        },
        {
          chapterNumber: 8,
          chapterTitle: 'Periodic Classification',
          microTopics: [
            {
              id: 's8_1',
              topicTitle: 'Modern Periodic Law',
              subtopic: 'Chemistry',
              dayNumber: 8,
              periodNumber: 1,
              keyFormulaOrLaw: 'Properties depend on atomic number',
              keyPoints: ['Arrangement of elements'],
              type: 'memorization',
              importance: 'High-Yield'
            }
          ]
        },
        {
          chapterNumber: 9,
          chapterTitle: 'Solutions',
          microTopics: [
            {
              id: 's9_1',
              topicTitle: 'Solute and Solvent',
              subtopic: 'Chemistry',
              dayNumber: 9,
              periodNumber: 1,
              keyFormulaOrLaw: 'Solution = Solute + Solvent',
              keyPoints: ['Components of a solution'],
              type: 'concept',
              importance: 'Foundational'
            }
          ]
        },
        {
          chapterNumber: 10,
          chapterTitle: 'Types of Chemical Reactions',
          microTopics: [
            {
              id: 's10_1',
              topicTitle: 'Combination Reaction',
              subtopic: 'Chemistry',
              dayNumber: 10,
              periodNumber: 1,
              keyFormulaOrLaw: 'A + B -> AB',
              keyPoints: ['Two substances combine'],
              type: 'concept',
              importance: 'Core Standard'
            }
          ]
        },
        {
          chapterNumber: 11,
          chapterTitle: 'Carbon Compounds',
          microTopics: [
            {
              id: 's11_1',
              topicTitle: 'Covalent Bonding in Carbon',
              subtopic: 'Chemistry',
              dayNumber: 11,
              periodNumber: 1,
              keyFormulaOrLaw: 'Sharing of electrons',
              keyPoints: ['Tetravalency of carbon'],
              type: 'concept',
              importance: 'High-Yield'
            }
          ]
        },
        {
          chapterNumber: 12,
          chapterTitle: 'Plant Anatomy & Physiology',
          microTopics: [
            {
              id: 's12_1',
              topicTitle: 'Tissue Systems in Plants',
              subtopic: 'Biology',
              dayNumber: 12,
              periodNumber: 1,
              keyFormulaOrLaw: 'Xylem and Phloem',
              keyPoints: ['Transport systems in plants'],
              type: 'concept',
              importance: 'Core Standard'
            }
          ]
        },
        {
          chapterNumber: 13,
          chapterTitle: 'Structural Organisation of Animals',
          microTopics: [
            {
              id: 's13_1',
              topicTitle: 'Animal Tissues Overview',
              subtopic: 'Biology',
              dayNumber: 13,
              periodNumber: 1,
              keyFormulaOrLaw: 'Epithelial, Connective',
              keyPoints: ['Types of animal tissues'],
              type: 'concept',
              importance: 'Foundational'
            }
          ]
        },
        {
          chapterNumber: 14,
          chapterTitle: 'Transportation & Circulation',
          microTopics: [
            {
              id: 's14_1',
              topicTitle: 'Human Heart Structure',
              subtopic: 'Biology',
              dayNumber: 14,
              periodNumber: 1,
              keyFormulaOrLaw: 'Four chambers',
              keyPoints: ['Pumping organ'],
              type: 'memorization',
              importance: 'High-Yield'
            }
          ]
        },
        {
          chapterNumber: 15,
          chapterTitle: 'Nervous System',
          microTopics: [
            {
              id: 's15_1',
              topicTitle: 'Neuron Structure',
              subtopic: 'Biology',
              dayNumber: 15,
              periodNumber: 1,
              keyFormulaOrLaw: 'Axon, Dendrite',
              keyPoints: ['Nerve cell components'],
              type: 'concept',
              importance: 'High-Yield'
            }
          ]
        },
        {
          chapterNumber: 16,
          chapterTitle: 'Plant & Animal Hormones',
          microTopics: [
            {
              id: 's16_1',
              topicTitle: 'Role of Auxin',
              subtopic: 'Biology',
              dayNumber: 16,
              periodNumber: 1,
              keyFormulaOrLaw: 'Growth promotion',
              keyPoints: ['Plant hormone'],
              type: 'concept',
              importance: 'Core Standard'
            }
          ]
        },
        {
          chapterNumber: 17,
          chapterTitle: 'Reproduction',
          microTopics: [
            {
              id: 's17_1',
              topicTitle: 'Asexual Reproduction Types',
              subtopic: 'Biology',
              dayNumber: 17,
              periodNumber: 1,
              keyFormulaOrLaw: 'Fission, Budding',
              keyPoints: ['Without gametes'],
              type: 'concept',
              importance: 'Foundational'
            }
          ]
        },
        {
          chapterNumber: 18,
          chapterTitle: 'Heredity',
          microTopics: [
            {
              id: 's18_1',
              topicTitle: 'Mendels Laws',
              subtopic: 'Biology',
              dayNumber: 18,
              periodNumber: 1,
              keyFormulaOrLaw: 'Segregation, Independent Assortment',
              keyPoints: ['Basic genetics laws'],
              type: 'memorization',
              importance: 'High-Yield'
            }
          ]
        },
        {
          chapterNumber: 19,
          chapterTitle: 'Origin & Evolution',
          microTopics: [
            {
              id: 's19_1',
              topicTitle: 'Theory of Natural Selection',
              subtopic: 'Biology',
              dayNumber: 19,
              periodNumber: 1,
              keyFormulaOrLaw: 'Survival of fittest',
              keyPoints: ['Darwins theory'],
              type: 'concept',
              importance: 'Core Standard'
            }
          ]
        },
        {
          chapterNumber: 20,
          chapterTitle: 'Breeding & Biotechnology',
          microTopics: [
            {
              id: 's20_1',
              topicTitle: 'Genetic Engineering Basics',
              subtopic: 'Biology',
              dayNumber: 20,
              periodNumber: 1,
              keyFormulaOrLaw: 'DNA manipulation',
              keyPoints: ['Altering genetic material'],
              type: 'concept',
              importance: 'Foundational'
            }
          ]
        },
        {
          chapterNumber: 21,
          chapterTitle: 'Health & Diseases',
          microTopics: [
            {
              id: 's21_1',
              topicTitle: 'Communicable Diseases Types',
              subtopic: 'Biology',
              dayNumber: 21,
              periodNumber: 1,
              keyFormulaOrLaw: 'Pathogens',
              keyPoints: ['Spread via agents'],
              type: 'concept',
              importance: 'Core Standard'
            }
          ]
        },
        {
          chapterNumber: 22,
          chapterTitle: 'Environmental Management',
          microTopics: [
            {
              id: 's22_1',
              topicTitle: 'Conservation of Resources',
              subtopic: 'Biology',
              dayNumber: 22,
              periodNumber: 1,
              keyFormulaOrLaw: 'Sustainable use',
              keyPoints: ['Protecting environment'],
              type: 'concept',
              importance: 'Foundational'
            }
          ]
        },
        {
          chapterNumber: 23,
          chapterTitle: 'Visual Communication',
          microTopics: [
            {
              id: 's23_1',
              topicTitle: 'Basics of Scratch',
              subtopic: 'Computer Science',
              dayNumber: 23,
              periodNumber: 1,
              keyFormulaOrLaw: 'Block coding',
              keyPoints: ['Introduction to programming'],
              type: 'concept',
              importance: 'Foundational'
            }
          ]
        }
      ]
    },
    {
      subjectId: 'sec_social',
      subjectName: 'Social Science',
      icon: '🌍',
      color: '#f59e0b',
      totalChapters: 12,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: 'Outbreak of WWI',
          microTopics: [
            {
              id: 'so1_1',
              topicTitle: 'Causes of WWI',
              subtopic: 'History',
              dayNumber: 1,
              periodNumber: 1,
              keyFormulaOrLaw: 'Alliances and Militarism',
              keyPoints: ['Assassination of Archduke'],
              type: 'memorization',
              importance: 'High-Yield'
            }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: 'League of Nations',
          microTopics: [
            {
              id: 'so2_1',
              topicTitle: 'Formation of League',
              subtopic: 'History',
              dayNumber: 2,
              periodNumber: 1,
              keyFormulaOrLaw: 'Treaty of Versailles',
              keyPoints: ['Aim to prevent war'],
              type: 'concept',
              importance: 'Core Standard'
            }
          ]
        },
        {
          chapterNumber: 3,
          chapterTitle: 'WWII',
          microTopics: [
            {
              id: 'so3_1',
              topicTitle: 'Causes of WWII',
              subtopic: 'History',
              dayNumber: 3,
              periodNumber: 1,
              keyFormulaOrLaw: 'Failure of League',
              keyPoints: ['Rise of Fascism'],
              type: 'memorization',
              importance: 'High-Yield'
            }
          ]
        },
        {
          chapterNumber: 4,
          chapterTitle: 'UN',
          microTopics: [
            {
              id: 'so4_1',
              topicTitle: 'Establishment of UN',
              subtopic: 'History',
              dayNumber: 4,
              periodNumber: 1,
              keyFormulaOrLaw: 'San Francisco Conference',
              keyPoints: ['Successor to League'],
              type: 'concept',
              importance: 'Foundational'
            }
          ]
        },
        {
          chapterNumber: 5,
          chapterTitle: 'India Location & Relief',
          microTopics: [
            {
              id: 'so5_1',
              topicTitle: 'Himalayan Mountains',
              subtopic: 'Geography',
              dayNumber: 5,
              periodNumber: 1,
              keyFormulaOrLaw: 'Northern boundary',
              keyPoints: ['Physical feature of India'],
              type: 'concept',
              importance: 'Core Standard'
            }
          ]
        },
        {
          chapterNumber: 6,
          chapterTitle: 'Climate & Vegetation',
          microTopics: [
            {
              id: 'so6_1',
              topicTitle: 'Monsoon Mechanism',
              subtopic: 'Geography',
              dayNumber: 6,
              periodNumber: 1,
              keyFormulaOrLaw: 'Seasonal wind reversal',
              keyPoints: ['Indian climate driver'],
              type: 'concept',
              importance: 'High-Yield'
            }
          ]
        },
        {
          chapterNumber: 7,
          chapterTitle: 'Resources & Industries',
          microTopics: [
            {
              id: 'so7_1',
              topicTitle: 'Iron and Steel Industry',
              subtopic: 'Geography',
              dayNumber: 7,
              periodNumber: 1,
              keyFormulaOrLaw: 'Basic industry',
              keyPoints: ['Industrial backbone'],
              type: 'concept',
              importance: 'Core Standard'
            }
          ]
        },
        {
          chapterNumber: 8,
          chapterTitle: 'Indian Constitution',
          microTopics: [
            {
              id: 'so8_1',
              topicTitle: 'Preamble of Constitution',
              subtopic: 'Civics',
              dayNumber: 8,
              periodNumber: 1,
              keyFormulaOrLaw: 'Sovereign Socialist Secular',
              keyPoints: ['Introduction to Constitution'],
              type: 'memorization',
              importance: 'High-Yield'
            }
          ]
        },
        {
          chapterNumber: 9,
          chapterTitle: 'Central Government',
          microTopics: [
            {
              id: 'so9_1',
              topicTitle: 'Powers of the President',
              subtopic: 'Civics',
              dayNumber: 9,
              periodNumber: 1,
              keyFormulaOrLaw: 'Executive head',
              keyPoints: ['Nominal head of state'],
              type: 'concept',
              importance: 'Core Standard'
            }
          ]
        },
        {
          chapterNumber: 10,
          chapterTitle: 'State Government',
          microTopics: [
            {
              id: 'so10_1',
              topicTitle: 'Role of Chief Minister',
              subtopic: 'Civics',
              dayNumber: 10,
              periodNumber: 1,
              keyFormulaOrLaw: 'Head of state government',
              keyPoints: ['Real executive of state'],
              type: 'concept',
              importance: 'High-Yield'
            }
          ]
        },
        {
          chapterNumber: 11,
          chapterTitle: 'Gross Domestic Product',
          microTopics: [
            {
              id: 'so11_1',
              topicTitle: 'GDP Definition',
              subtopic: 'Economics',
              dayNumber: 11,
              periodNumber: 1,
              keyFormulaOrLaw: 'C + I + G + (X-M)',
              keyPoints: ['Total value of goods'],
              type: 'formula',
              importance: 'High-Yield'
            }
          ]
        },
        {
          chapterNumber: 12,
          chapterTitle: 'Government & Taxes',
          microTopics: [
            {
              id: 'so12_1',
              topicTitle: 'Direct vs Indirect Taxes',
              subtopic: 'Economics',
              dayNumber: 12,
              periodNumber: 1,
              keyFormulaOrLaw: 'Incidence of tax',
              keyPoints: ['Income tax vs GST'],
              type: 'concept',
              importance: 'Core Standard'
            }
          ]
        }
      ]
    },
    {
      subjectId: 'sec_tamil',
      subjectName: 'Tamil',
      icon: '🔤',
      color: '#ec4899',
      totalChapters: 9,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: 'Iyal 1',
          microTopics: [
            {
              id: 't1_1',
              topicTitle: 'Seyul Poem 1',
              subtopic: 'Poetry',
              dayNumber: 1,
              periodNumber: 1,
              keyFormulaOrLaw: 'Tamil literature',
              keyPoints: ['Poetic structure'],
              type: 'memorization',
              importance: 'High-Yield'
            }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: 'Iyal 2',
          microTopics: [
            {
              id: 't2_1',
              topicTitle: 'Urai Nadai Prose',
              subtopic: 'Prose',
              dayNumber: 2,
              periodNumber: 1,
              keyFormulaOrLaw: 'Tamil prose',
              keyPoints: ['Essay structure'],
              type: 'concept',
              importance: 'Core Standard'
            }
          ]
        },
        {
          chapterNumber: 3,
          chapterTitle: 'Iyal 3',
          microTopics: [
            {
              id: 't3_1',
              topicTitle: 'Grammar Section 3',
              subtopic: 'Grammar',
              dayNumber: 3,
              periodNumber: 1,
              keyFormulaOrLaw: 'Tamil grammar rules',
              keyPoints: ['Rules application'],
              type: 'formula',
              importance: 'High-Yield'
            }
          ]
        },
        {
          chapterNumber: 4,
          chapterTitle: 'Iyal 4',
          microTopics: [
            {
              id: 't4_1',
              topicTitle: 'Supplementary Reading 4',
              subtopic: 'Reading',
              dayNumber: 4,
              periodNumber: 1,
              keyFormulaOrLaw: 'Story analysis',
              keyPoints: ['Plot and theme'],
              type: 'concept',
              importance: 'Foundational'
            }
          ]
        },
        {
          chapterNumber: 5,
          chapterTitle: 'Iyal 5',
          microTopics: [
            {
              id: 't5_1',
              topicTitle: 'Seyul Poem 5',
              subtopic: 'Poetry',
              dayNumber: 5,
              periodNumber: 1,
              keyFormulaOrLaw: 'Tamil literature',
              keyPoints: ['Poetic structure'],
              type: 'memorization',
              importance: 'High-Yield'
            }
          ]
        },
        {
          chapterNumber: 6,
          chapterTitle: 'Iyal 6',
          microTopics: [
            {
              id: 't6_1',
              topicTitle: 'Urai Nadai Prose 6',
              subtopic: 'Prose',
              dayNumber: 6,
              periodNumber: 1,
              keyFormulaOrLaw: 'Tamil prose',
              keyPoints: ['Essay structure'],
              type: 'concept',
              importance: 'Core Standard'
            }
          ]
        },
        {
          chapterNumber: 7,
          chapterTitle: 'Iyal 7',
          microTopics: [
            {
              id: 't7_1',
              topicTitle: 'Grammar Section 7',
              subtopic: 'Grammar',
              dayNumber: 7,
              periodNumber: 1,
              keyFormulaOrLaw: 'Tamil grammar rules',
              keyPoints: ['Rules application'],
              type: 'formula',
              importance: 'High-Yield'
            }
          ]
        },
        {
          chapterNumber: 8,
          chapterTitle: 'Iyal 8',
          microTopics: [
            {
              id: 't8_1',
              topicTitle: 'Supplementary Reading 8',
              subtopic: 'Reading',
              dayNumber: 8,
              periodNumber: 1,
              keyFormulaOrLaw: 'Story analysis',
              keyPoints: ['Plot and theme'],
              type: 'concept',
              importance: 'Foundational'
            }
          ]
        },
        {
          chapterNumber: 9,
          chapterTitle: 'Iyal 9',
          microTopics: [
            {
              id: 't9_1',
              topicTitle: 'Comprehensive Revision',
              subtopic: 'Revision',
              dayNumber: 9,
              periodNumber: 1,
              keyFormulaOrLaw: 'All concepts',
              keyPoints: ['Final review'],
              type: 'concept',
              importance: 'High-Yield'
            }
          ]
        }
      ]
    },
    {
      subjectId: 'sec_english',
      subjectName: 'English',
      icon: '🔤',
      color: '#3b82f6',
      totalChapters: 7,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: 'Unit 1',
          microTopics: [
            {
              id: 'e1_1',
              topicTitle: 'Prose Comprehension 1',
              subtopic: 'Prose',
              dayNumber: 1,
              periodNumber: 1,
              keyFormulaOrLaw: 'Reading skills',
              keyPoints: ['Passage analysis'],
              type: 'concept',
              importance: 'High-Yield'
            }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: 'Unit 2',
          microTopics: [
            {
              id: 'e2_1',
              topicTitle: 'Poem Analysis 2',
              subtopic: 'Poem',
              dayNumber: 2,
              periodNumber: 1,
              keyFormulaOrLaw: 'Figures of speech',
              keyPoints: ['Poetic devices'],
              type: 'memorization',
              importance: 'Core Standard'
            }
          ]
        },
        {
          chapterNumber: 3,
          chapterTitle: 'Unit 3',
          microTopics: [
            {
              id: 'e3_1',
              topicTitle: 'Grammar Focus 3',
              subtopic: 'Grammar',
              dayNumber: 3,
              periodNumber: 1,
              keyFormulaOrLaw: 'Tenses and Voice',
              keyPoints: ['Active Passive Voice'],
              type: 'formula',
              importance: 'High-Yield'
            }
          ]
        },
        {
          chapterNumber: 4,
          chapterTitle: 'Unit 4',
          microTopics: [
            {
              id: 'e4_1',
              topicTitle: 'Supplementary Reading 4',
              subtopic: 'Reading',
              dayNumber: 4,
              periodNumber: 1,
              keyFormulaOrLaw: 'Story details',
              keyPoints: ['Character sketch'],
              type: 'concept',
              importance: 'Foundational'
            }
          ]
        },
        {
          chapterNumber: 5,
          chapterTitle: 'Unit 5',
          microTopics: [
            {
              id: 'e5_1',
              topicTitle: 'Prose Comprehension 5',
              subtopic: 'Prose',
              dayNumber: 5,
              periodNumber: 1,
              keyFormulaOrLaw: 'Reading skills',
              keyPoints: ['Passage analysis'],
              type: 'concept',
              importance: 'High-Yield'
            }
          ]
        },
        {
          chapterNumber: 6,
          chapterTitle: 'Unit 6',
          microTopics: [
            {
              id: 'e6_1',
              topicTitle: 'Poem Analysis 6',
              subtopic: 'Poem',
              dayNumber: 6,
              periodNumber: 1,
              keyFormulaOrLaw: 'Figures of speech',
              keyPoints: ['Poetic devices'],
              type: 'memorization',
              importance: 'Core Standard'
            }
          ]
        },
        {
          chapterNumber: 7,
          chapterTitle: 'Unit 7',
          microTopics: [
            {
              id: 'e7_1',
              topicTitle: 'Grammar Focus 7',
              subtopic: 'Grammar',
              dayNumber: 7,
              periodNumber: 1,
              keyFormulaOrLaw: 'Direct Indirect Speech',
              keyPoints: ['Reported speech rules'],
              type: 'formula',
              importance: 'High-Yield'
            }
          ]
        }
      ]
    }
  ];
  return {
    courseId,
    courseTitle,
    category: 'school_secondary',
    board: 'TNSB Samacheer Kalvi / CBSE',
    medium: isTa ? 'Tamil' : 'English',
    totalDays: 200,
    totalSubjects: subjects.length,
    totalChapters: subjects.reduce((a, s) => a + s.chapters.length, 0),
    totalMicroTopics: subjects.reduce(
      (a, s) =>
        a + s.chapters.reduce((acc, c) => acc + (c.microTopics ? c.microTopics.length : 0), 0),
      0
    ),
    subjects
  };
}

export function getUpscCivilServicesCompleteSyllabus(
  courseId?: string,
  courseTitle?: string
): CourseFullSyllabus {
  // SUBJECT 1:  GS PAPER I (History, Art & Culture, Geography & Indian Society)
  const gs1Chapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Indian Heritage, Visual & Performing Arts & Literature',
      description:
        'Harappan art, Mauryan/Gupta architecture, Dravidian temple styles (Chola/Pallava), 8 Classical Dances, Hindustani & Carnatic Music',
      microTopics: [
        {
          id: 'upsc_gs1_1',
          topicTitle: 'Temple Architecture (Nagara, Dravida, Vesara) & Rock-Cut Caves',
          subtopic:
            'Ajanta, Ellora, Elephanta caves; Brihadisvara Chola bronzes; Nagara shikhara vs Dravida vimana & gopuram',
          dayNumber: 1,
          periodNumber: 1,
          keyFormulaOrLaw:
            'Dravidian Style Features: Garbhagriha, Vimana (Pyramidal tower), Mandapa, Gopuram (Monumental gateway)',
          keyPoints: [
            'Chola bronze Nataraja iconography and casting technique (Cire-perdue / lost wax)',
            'Bhimbetka rock shelters (Paleolithic to Mesolithic continuity)'
          ],
          type: 'concept',
          importance: 'High-Yield'
        },
        {
          id: 'upsc_gs1_2',
          topicTitle: 'Classical Performing Arts (8 Dances) & Indian Philosophical Schools',
          subtopic:
            'Bharatanatyam, Kathakali, Kathak, Odissi, Sattriya; 6 Orthodox schools (Nyaya, Vaisheshika, Samkhya, Yoga, Mimamsa, Vedanta) & Heterodox (Buddhism/Jainism)',
          dayNumber: 5,
          periodNumber: 1,
          keyFormulaOrLaw:
            'Natyashastra (Bharata Muni): 9 Rasas (Navarasa) & Abhinaya | Advaita Vedanta (Adi Shankara): Maya & Brahman',
          keyPoints: [
            'Sattriya dance introduced by Mahapurusha Sankaradeva in Assam',
            'Buddhist councils, Tripitakas, and Mahayana vs Hinayana doctrines'
          ],
          type: 'concept',
          importance: 'High-Yield'
        }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Ancient, Medieval & Modern Indian History (1757 to 1947)',
      description:
        'Indus Valley Civilization, Mauryan administration, Delhi Sultanate, Mughals (Mansabdari), 1857 Revolt & Gandhian Freedom Movements',
      microTopics: [
        {
          id: 'upsc_gs1_3',
          topicTitle: 'Indus Valley Civilization, Mauryas & Mughal Administrative Systems',
          subtopic:
            'IVC town planning & drainage, Ashokan Dhamma edicts, Akbar Mansabdari & Zabti revenue system, Shivaji Ashtapradhan',
          dayNumber: 2,
          periodNumber: 1,
          keyFormulaOrLaw:
            'Mansabdari System: Zat (Personal rank) and Sawar (Number of cavalrymen maintained)',
          keyPoints: [
            'Ashoka 14 Major Rock Edicts (Prakrit and Greek/Aramaic scripts)',
            'Chola Kudavolai system of local self-government (Uttiramerur inscription)'
          ],
          type: 'concept',
          importance: 'High-Yield'
        },
        {
          id: 'upsc_gs1_4',
          topicTitle: 'Modern Freedom Struggle: Moderates, Extremists & Gandhian Mass Movements',
          subtopic:
            'Drain of Wealth (Dadabhai Naoroji), Swadeshi 1905, Non-Cooperation 1920, Civil Disobedience 1930, Quit India 1942, INA Subhash Chandra Bose',
          dayNumber: 6,
          periodNumber: 1,
          keyFormulaOrLaw:
            'Gandhi Core Philosophy: Satyagraha (Truth-force), Ahimsa (Non-violence), Sarvodaya (Uplift of all)',
          keyPoints: [
            '1857 Revolt was turning point: Company rule ended, Queen Victoria Proclamation 1858',
            'Poona Pact 1932: Joint electorate with reserved seats for Depressed Classes'
          ],
          type: 'concept',
          importance: 'High-Yield'
        }
      ]
    },
    {
      chapterNumber: 3,
      chapterTitle: 'World History, Post-Independence Consolidation & Indian Society',
      description:
        'Industrial Revolution, French/Russian Revolutions, World Wars, Decolonization, State Reorganization, Caste & Globalization',
      microTopics: [
        {
          id: 'upsc_gs1_5',
          topicTitle: 'World Revolutions (American, French, Russian), World Wars & Cold War Era',
          subtopic:
            'French Revolution (Liberty, Equality, Fraternity), Russian Revolution 1917 (Lenin/Bolsheviks), Treaty of Versailles, NATO vs Warsaw Pact',
          dayNumber: 3,
          periodNumber: 1,
          keyFormulaOrLaw:
            'Declaration of Rights of Man (1789) | Cold War Truman Doctrine & Marshall Plan',
          keyPoints: [
            'Industrial Revolution transformed agrarian societies into industrial capitalism',
            'Non-Aligned Movement (NAM 1961 Belgrade) spearheaded by Nehru, Nasser, Tito'
          ],
          type: 'concept',
          importance: 'High-Yield'
        },
        {
          id: 'upsc_gs1_6',
          topicTitle: 'Salient Features of Indian Society, Women Empowerment & Globalization',
          subtopic:
            'Caste dynamics, Joint family changes, Demographic dividend, Urbanization distress, Feminization of agriculture, Secularism in India',
          dayNumber: 7,
          periodNumber: 1,
          keyFormulaOrLaw:
            'Indian Model of Secularism: "Sarva Dharma Sambhava" (Equal respect to all religions) vs Western strict separation',
          keyPoints: [
            'Demographic Dividend window: India median age ~28.7 years',
            'Impact of globalization on regional identities and informal labor markets'
          ],
          type: 'concept',
          importance: 'High-Yield'
        }
      ]
    },
    {
      chapterNumber: 4,
      chapterTitle: 'Physical Geography (Geomorphology, Climatology, Oceanography) & Resources',
      description:
        'Plate Tectonics, Indian Monsoon Mechanism (El Nino/La Nina/IOD), Ocean Currents, Mineral distribution & Critical Minerals (Lithium/Rare Earths)',
      microTopics: [
        {
          id: 'upsc_gs1_7',
          topicTitle: 'Geomorphology & Climatology: Plate Tectonics & Indian Monsoon Dynamics',
          subtopic:
            'Continental drift, subduction zones, tropical cyclones, Southwest & Northeast Monsoons, Madden-Julian Oscillation (MJO), Western Disturbances',
          dayNumber: 4,
          periodNumber: 1,
          keyFormulaOrLaw:
            'Monsoon Drivers: Differential heating, ITCZ shift, Tibetan plateau heating, Tropical Easterly Jet, Somali Jet, El Nino/IOD',
          keyPoints: [
            'Plate boundary types: Convergent (Himalayas), Divergent (Mid-Atlantic Ridge), Transform (San Andreas)',
            'El Nino weakens Indian monsoon; Positive IOD enhances Indian rainfall'
          ],
          type: 'solved_problem',
          importance: 'High-Yield'
        },
        {
          id: 'upsc_gs1_8',
          topicTitle: 'Oceanography, Critical Mineral Distribution & Location of Industries',
          subtopic:
            'Thermohaline circulation, Coral bleaching, Deep ocean resources, Lithium & Rare Earth Elements (REE) supply chains, Weber Industrial Location Theory',
          dayNumber: 8,
          periodNumber: 1,
          keyFormulaOrLaw:
            'Weber Least Cost Theory: Location determined by Transportation Cost, Labor Cost, and Agglomeration Economies',
          keyPoints: [
            'Coral bleaching occurs due to thermal stress causing expulsion of Zooxanthellae algae',
            'Critical minerals: Lithium, Cobalt, Nickel, Gallium vital for EV transition and clean energy'
          ],
          type: 'concept',
          importance: 'High-Yield'
        }
      ]
    }
  ];
  // SUBJECT 2:  GS PAPER II (Governance, Constitution, Polity, Social Justice & IR)
  const gs2Chapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Indian Constitution, Basic Structure Doctrine & Comparative Schemes',
      description:
        'Evolution from 1773-1947 Acts, Preamble, Fundamental Rights (12-35), DPSPs, Basic Structure, Comparison with UK, USA, France',
      microTopics: [
        {
          id: 'upsc_gs2_1',
          topicTitle: 'Constitutional Philosophy, Basic Structure Doctrine & Major Amendments',
          subtopic:
            'Kesavananda Bharati case 1973, 42nd/44th/86th/101st GST/103rd EWS/106th Nari Shakti Vandan Amendments, Judicial Review',
          dayNumber: 1,
          periodNumber: 2,
          keyFormulaOrLaw:
            'Basic Structure Doctrine: Parliament amending power under Article 368 cannot alter the core identity of the Constitution',
          keyPoints: [
            'Article 21 expanded to include Right to Privacy (Puttaswamy 2017), Clean Environment, Education (21A)',
            'Harmonious construction between Fundamental Rights and DPSPs (Minerva Mills 1980)'
          ],
          type: 'concept',
          importance: 'High-Yield'
        },
        {
          id: 'upsc_gs2_2',
          topicTitle: 'Comparison of Indian Constitutional Scheme with UK, USA & France',
          subtopic:
            'Parliamentary sovereignty vs Constitutional supremacy, US Strict Separation of Powers vs Indian Checks and Balances, French Laïcité secularism',
          dayNumber: 5,
          periodNumber: 2,
          keyFormulaOrLaw:
            'UK: Unwritten Constitution & Parliamentary Sovereignty | USA: Presidential & Due Process | India: Procedure Established by Law (evolving to Due Process)',
          keyPoints: [
            'India combines British parliamentary model with American fundamental rights and judicial review',
            'US states have separate constitutions and dual citizenship; India has single citizenship'
          ],
          type: 'concept',
          importance: 'High-Yield'
        }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Federalism, Executive, Parliament & Judicial Institutions',
      description:
        'Centre-State relations (7th Schedule), Governor role, Parliamentary Committees, Anti-Defection Law (10th Schedule), Collegium System',
      microTopics: [
        {
          id: 'upsc_gs2_3',
          topicTitle:
            'Federal Dynamics, Governor Constitutional Dilemmas & Local Governance (73rd/74th)',
          subtopic:
            'Fiscal federalism, GST Council, Article 356 abuse, Governor discretionary assent to state bills, 11th & 12th Schedules devolution',
          dayNumber: 2,
          periodNumber: 2,
          keyFormulaOrLaw:
            'S.R. Bommai Case (1994): Proclamation under Article 356 is subject to judicial review and floor test is mandatory',
          keyPoints: [
            'Sarkaria & Punchhi Commissions recommendations on Governor appointment and tenure',
            '73rd & 74th Amendments: 3-tier Panchayati Raj and 33% (up to 50% in states) reservation for women'
          ],
          type: 'concept',
          importance: 'High-Yield'
        },
        {
          id: 'upsc_gs2_4',
          topicTitle:
            'Parliamentary Functioning, Anti-Defection (10th Schedule) & Judicial Appointments',
          subtopic:
            'Decline of parliamentary sittings, Departmental Standing Committees, Speaker role in 10th Schedule, Collegium vs NJAC (99th Amendment struck down)',
          dayNumber: 6,
          periodNumber: 2,
          keyFormulaOrLaw:
            'Kihoto Hollohan Case (1992): Speaker decision under 10th Schedule is subject to judicial review',
          keyPoints: [
            'Ordinance-making power (Article 123/213) cannot be used as substitute for legislative power (D.C. Wadhwa case)',
            'Public Interest Litigation (PIL) and epistolary jurisdiction expanded access to justice'
          ],
          type: 'concept',
          importance: 'High-Yield'
        }
      ]
    },
    {
      chapterNumber: 3,
      chapterTitle: 'Electoral Reforms (RPA 1950/51), Statutory Bodies & Social Justice',
      description:
        'Section 8 RPA disqualification, Criminalization of politics, CAG, Election Commission, Health, Education NEP 2020, Poverty & Hunger',
      microTopics: [
        {
          id: 'upsc_gs2_5',
          topicTitle: 'Representation of People Act (RPA 1950 & 1951) & Electoral Transparency',
          subtopic:
            'Section 8(4) struck down (Lily Thomas 2013), Electoral Bonds verdict 2024, Simultaneous Elections (One Nation One Election), Model Code of Conduct',
          dayNumber: 3,
          periodNumber: 2,
          keyFormulaOrLaw:
            'Association for Democratic Reforms (ADR 2002): Mandatory disclosure of criminal antecedents, assets, and liabilities of candidates',
          keyPoints: [
            'Article 324 plenary superintendence of elections vested in Election Commission',
            'Section 123 of RPA 1951: Corrupt practices and appeals to religion/caste'
          ],
          type: 'concept',
          importance: 'High-Yield'
        },
        {
          id: 'upsc_gs2_6',
          topicTitle:
            'Social Justice: Vulnerable Sections Welfare, Health, Education (NEP 2020) & Hunger',
          subtopic:
            'SC/ST Prevention of Atrocities, Rights of PwD Act 2016, Ayushman Bharat, Universal Health Coverage, National Food Security Act (NFSA 2013), POSHAN Abhiyaan',
          dayNumber: 7,
          periodNumber: 2,
          keyFormulaOrLaw:
            'NEP 2020 5+3+3+4 Curricular Structure | NFSA 2013: 5 kg foodgrains/person/month at subsidised prices to 67% population',
          keyPoints: [
            'Out-of-pocket healthcare expenditure pushes families into poverty',
            'Stunting, wasting, and anemia reduction targets under POSHAN 2.0'
          ],
          type: 'concept',
          importance: 'High-Yield'
        }
      ]
    },
    {
      chapterNumber: 4,
      chapterTitle: 'International Relations, Bilateral Diplomacy & Global Multilateral Bodies',
      description:
        'Neighborhood First, Act East, Quad, BRICS, G20, I2U2, UN Security Council Reforms, WTO Appellate Body, IMF/World Bank',
      microTopics: [
        {
          id: 'upsc_gs2_7',
          topicTitle:
            'India Neighborhood First Policy, Indo-Pacific Strategy & Strategic Groupings',
          subtopic:
            'India-China border LAC management, India-US Major Defense Partner, Quad maritime security, I2U2, BRICS expansion, IMEEC economic corridor',
          dayNumber: 4,
          periodNumber: 2,
          keyFormulaOrLaw:
            'SAGAR (Security and Growth for All in the Region) & "Vasudhaiva Kutumbakam" (One Earth, One Family, One Future)',
          keyPoints: [
            'Indo-Pacific as a free, open, inclusive, and rules-based international maritime domain',
            'Cross-border connectivity: Kaladan Multi-Modal, India-Myanmar-Thailand Trilateral Highway'
          ],
          type: 'concept',
          importance: 'High-Yield'
        },
        {
          id: 'upsc_gs2_8',
          topicTitle:
            'Multilateral Institutions: United Nations (UNSC Reforms), WTO & Global Governance',
          subtopic:
            'G4 grouping for permanent UNSC seat, WTO dispute settlement crisis, TRIPS waiver, IMF quotas and Special Drawing Rights (SDRs), FATF grey/black listing',
          dayNumber: 8,
          periodNumber: 2,
          keyFormulaOrLaw:
            'UNSC Reform Criteria: Representation of developing nations, expanding permanent membership from P5 to include G4 (India, Brazil, Germany, Japan)',
          keyPoints: [
            'WTO Peace Clause protects India agricultural MSP public stockholding',
            'FATF Recommendations 40+9 to combat money laundering and terror financing'
          ],
          type: 'concept',
          importance: 'High-Yield'
        }
      ]
    }
  ];
  // SUBJECT 3:  GS PAPER III (Technology, Economic Development, Environment & Internal Security)
  const gs3Chapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Indian Macroeconomics, Budgeting (FRBM) & Inclusive Growth',
      description:
        'GDP calculation (GVA at basic prices), Fiscal Deficit, FRBM Act, Tax buoyancy, GST reforms, Monetary Policy MPC, Banking NPAs & IBC 2016',
      microTopics: [
        {
          id: 'upsc_gs3_1',
          topicTitle: 'Macroeconomic Aggregates, Fiscal Deficit, Budgeting & FRBM Architecture',
          subtopic:
            'Nominal vs Real GDP, GVA, Fiscal Deficit = Total Expenditure - (Revenue Receipts + Non-debt Capital Receipts), FRBM targets (3% Fiscal Deficit)',
          dayNumber: 1,
          periodNumber: 3,
          keyFormulaOrLaw:
            'Primary Deficit = Fiscal Deficit - Interest Payments | Monetary Policy Taylor Rule: Repo Rate adjustment for inflation targeting (4% ± 2%)',
          keyPoints: [
            'Insolvency and Bankruptcy Code (IBC 2016) time-bound resolution of stressed corporate assets',
            'Capital Expenditure (Capex) multiplier effect on infrastructure growth vs revenue expenditure'
          ],
          type: 'solved_problem',
          importance: 'High-Yield'
        },
        {
          id: 'upsc_gs3_2',
          topicTitle: 'Inclusive Growth, Financial Inclusion (JAM Trinity) & Employment Landscape',
          subtopic:
            'Jan Dhan-Aadhaar-Mobile (JAM), Direct Benefit Transfer (DBT), Gini coefficient, Periodic Labour Force Survey (PLFS), Gig and platform economy',
          dayNumber: 5,
          periodNumber: 3,
          keyFormulaOrLaw:
            'Lorenz Curve & Gini Coefficient: G = A / (A + B) (0 = Perfect Equality, 1 = Perfect Inequality)',
          keyPoints: [
            'PM Jan Dhan Yojana achieved over 50 crore zero-balance bank accounts',
            'Female Labour Force Participation Rate (FLFPR) constraints and care economy recognition'
          ],
          type: 'concept',
          importance: 'High-Yield'
        }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Agriculture Economics, MSP, Cropping Patterns & Food Processing',
      description:
        'Cropping systems (Kharif, Rabi, Zaid), Swaminathan C2 MSP formula, APMCs, e-NAM, Drip irrigation, Mega Food Parks, Land reforms',
      microTopics: [
        {
          id: 'upsc_gs3_3',
          topicTitle: 'Agricultural Cropping Patterns, Irrigation Systems & MSP Pricing Economics',
          subtopic:
            'Micro-irrigation (Drip/Sprinkler under PMKSY), Direct Seeded Rice (DSR), MSP calculation (A2+FL vs Comprehensive C2 cost), Agri-credit',
          dayNumber: 2,
          periodNumber: 3,
          keyFormulaOrLaw:
            'Swaminathan Commission Recommendation: MSP = Cost C2 + 50% profit margin',
          keyPoints: [
            'e-NAM (National Agriculture Market) creates unified pan-India electronic trading portal',
            'PDS reforms: One Nation One Ration Card (ONORC) using Aadhaar biometric authentication'
          ],
          type: 'solved_problem',
          importance: 'High-Yield'
        },
        {
          id: 'upsc_gs3_4',
          topicTitle:
            'Food Processing Industries, Supply Chain Logistics & Land Records (SVAMITVA)',
          subtopic:
            'Upstream and downstream linkages, Mega Food Parks Scheme, PMFME, Drone technology in agriculture, SVAMITVA drone mapping of rural land',
          dayNumber: 6,
          periodNumber: 3,
          keyFormulaOrLaw:
            'Food Processing Value Addition: Raw Produce -> Processing -> Cold Chain -> Quality Testing -> Retail Export',
          keyPoints: [
            'Post-harvest losses in fruits and vegetables reduced through integrated cold chain infrastructure',
            'Digital India Land Records Modernization Programme (DILRMP) ensures conclusive land titling'
          ],
          type: 'concept',
          importance: 'High-Yield'
        }
      ]
    },
    {
      chapterNumber: 3,
      chapterTitle: 'Science & Technology: Space, AI, Biotechnology, Supercomputing & IPR',
      description:
        'ISRO (Gaganyaan, Chandrayaan-3, Aditya-L1), 5G/6G, Artificial Intelligence, CRISPR-Cas9 gene editing, mRNA vaccines, Patents Act Section 3(d)',
      microTopics: [
        {
          id: 'upsc_gs3_5',
          topicTitle: 'Space Science: ISRO Launch Vehicles (LVM3, SSLV) & Deep Space Missions',
          subtopic:
            'Chandrayaan-3 lunar south pole landing, Aditya-L1 Lagrange Point Halo orbit, Gaganyaan human spaceflight, NavIC satellite navigation',
          dayNumber: 3,
          periodNumber: 3,
          keyFormulaOrLaw:
            'Orbital Mechanics: Escape Velocity v_e = √(2GM/R) | Lagrange Points L1 to L5 gravitational equilibrium',
          keyPoints: [
            'Cryogenic upper stage (CE-20 engine) powers India heavy lift LVM3 rocket',
            'IN-SPACe single-window agency facilitating private space tech startups in India'
          ],
          type: 'concept',
          importance: 'High-Yield'
        },
        {
          id: 'upsc_gs3_6',
          topicTitle:
            'Frontier Tech: AI, Quantum Computing, CRISPR-Cas9 Gene Editing & IPR Section 3(d)',
          subtopic:
            'National Quantum Mission (QKD, Superconducting qubits), Generative AI ethics, CRISPR-Cas9 molecular scissors, Section 3(d) of Patents Act against evergreening',
          dayNumber: 7,
          periodNumber: 3,
          keyFormulaOrLaw:
            'Section 3(d) Patents Act 1970: Mere discovery of a new form of known substance without enhanced therapeutic efficacy is not patentable',
          keyPoints: [
            'Novartis case upheld Section 3(d) to ensure affordable generic medicines for public health',
            'CRISPR-Cas9 enables precise targeted genetic modification to cure sickle cell disease'
          ],
          type: 'concept',
          importance: 'High-Yield'
        }
      ]
    },
    {
      chapterNumber: 4,
      chapterTitle: 'Environment, Climate Change (UNFCCC COP) & Internal Security',
      description:
        'EIA 2020, Paris Agreement Net Zero 2070, Sendai Disaster Framework, Left Wing Extremism (LWE), Cyber Warfare (CERT-In), PMLA & Border Security',
      microTopics: [
        {
          id: 'upsc_gs3_7',
          topicTitle:
            'Environmental Conservation, EIA, UNFCCC Climate Summits & Disaster Management',
          subtopic:
            'EIA 4-stage process (Screening, Scoping, Public Consultation, Appraisal), Panchamrit Net Zero 2070 targets, Sendai Framework 2015-2030, NDRF response',
          dayNumber: 4,
          periodNumber: 3,
          keyFormulaOrLaw:
            'Sendai Framework 4 Priorities: Understanding Risk -> Strengthening Governance -> Investing in Resilience -> Build Back Better',
          keyPoints: [
            'Panchamrit: 500 GW non-fossil energy, 50% renewable capacity, 1 billion tonne carbon reduction, Net Zero by 2070',
            'Project Tiger 50 years: Conservation model in Core-Buffer protected areas'
          ],
          type: 'concept',
          importance: 'High-Yield'
        },
        {
          id: 'upsc_gs3_8',
          topicTitle:
            'Internal Security: Left Wing Extremism, Cyber Security, Money Laundering (PMLA) & Border Control',
          subtopic:
            'SAMADHAN strategy against Naxalism, National Cyber Security Strategy, CERT-In guidelines, PMLA 2002 (Placement, Layering, Integration), CAPF mandates (BSF, CRPF, ITBP)',
          dayNumber: 8,
          periodNumber: 3,
          keyFormulaOrLaw:
            'Money Laundering 3 Stages: Placement (Cash inject) -> Layering (Complex transactions) -> Integration (Clean assets)',
          keyPoints: [
            'Comprehensive Integrated Border Management System (CIBMS) with thermal imagers and radar sensors',
            'Critical Information Infrastructure protected by NCIIPC under Section 70 of IT Act 2000'
          ],
          type: 'concept',
          importance: 'High-Yield'
        }
      ]
    }
  ];
  // SUBJECT 4:  GS PAPER IV (Ethics, Integrity, Aptitude & Administrative Case Studies)
  const gs4Chapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Ethics & Human Interface, Moral Thinkers & Human Values',
      description:
        'Deontology (Kant), Utilitarianism (Bentham/Mill), Virtue Ethics (Aristotle), Lessons from Gandhi, Buddha, Kalam, Mandela, Thiruvalluvar',
      microTopics: [
        {
          id: 'upsc_gs4_1',
          topicTitle:
            'Ethical Theories (Deontology, Consequentialism, Virtue Ethics) & Human Values',
          subtopic:
            'Kant Categorical Imperative, Mill Utilitarian Greatest Happiness Principle, Aristotle Golden Mean, Essence & Determinants of Ethics in human conduct',
          dayNumber: 1,
          periodNumber: 4,
          keyFormulaOrLaw:
            'Kant Categorical Imperative: Act only according to that maxim whereby you can at the same time will that it should become a universal law',
          keyPoints: [
            'Deontology focuses on duty and inherent rightness of action regardless of consequences',
            'Utilitarianism evaluates action based on end results (Telos)'
          ],
          type: 'concept',
          importance: 'High-Yield'
        },
        {
          id: 'upsc_gs4_2',
          topicTitle:
            'Moral Thinkers: Indian (Kautilya, Thiruvalluvar, Gandhi, Ambedkar) & Western (Rawls, Socrates)',
          subtopic:
            'Thirukkural on Kingly governance (Aran), Gandhi 7 Social Sins, Ambedkar Constitutional Morality, John Rawls Theory of Justice & "Veil of Ignorance"',
          dayNumber: 5,
          periodNumber: 4,
          keyFormulaOrLaw:
            'John Rawls "Veil of Ignorance": Principles of justice designed when no one knows their social status, wealth, or natural abilities',
          keyPoints: [
            'Gandhi 7 Social Sins: Politics without Principles, Wealth without Work, Commerce without Morality, Science without Humanity',
            'Thiruvalluvar: "A ruler who governs with righteousness will be revered as a God by his people"'
          ],
          type: 'concept',
          importance: 'High-Yield'
        }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Attitude, Emotional Intelligence (EI) & Civil Service Foundational Values',
      description:
        'CAB model of Attitude, Persuasion & Nudge Theory, Daniel Goleman 5 EI Components, Integrity, Impartiality, Non-partisanship, Compassion',
      microTopics: [
        {
          id: 'upsc_gs4_3',
          topicTitle:
            'Attitude Structure (CAB Model), Persuasion Techniques & Emotional Intelligence (EI)',
          subtopic:
            'Cognitive, Affective, Behavioral components of attitude; Nudge theory in public policy (Swachh Bharat); Daniel Goleman 5 EI dimensions in governance',
          dayNumber: 2,
          periodNumber: 4,
          keyFormulaOrLaw:
            'Daniel Goleman 5 Dimensions of Emotional Intelligence: Self-Awareness, Self-Regulation, Internal Motivation, Empathy, Social Skills',
          keyPoints: [
            'High EI enables civil servants to resolve mob conflicts, manage administrative stress, and negotiate crises',
            'Nudge theory uses positive reinforcement and indirect suggestions to influence behavior without mandates'
          ],
          type: 'concept',
          importance: 'High-Yield'
        },
        {
          id: 'upsc_gs4_4',
          topicTitle:
            'Foundational Values for Civil Services: Integrity, Impartiality, Objectivity & Compassion',
          subtopic:
            'Absolute honesty, political neutrality, evidence-based decision making, empathy towards weaker sections (Gandhi Talisman)',
          dayNumber: 6,
          periodNumber: 4,
          keyFormulaOrLaw:
            'Gandhi Talisman: "Recall the face of the poorest and the weakest man whom you may have seen, and ask yourself, if the step you contemplate is going to be of any use to him."',
          keyPoints: [
            'Integrity is non-negotiable consistency of actions, values, and principles even when unobserved',
            'Impartiality ensures unbiased implementation of laws regardless of political regime in power'
          ],
          type: 'concept',
          importance: 'High-Yield'
        }
      ]
    },
    {
      chapterNumber: 3,
      chapterTitle: 'Probity in Governance, Nolan Principles & Administrative Case Studies',
      description:
        'Nolan Committee 7 Principles, RTI Act 2005 proactive disclosure, Citizen Charters (Sevottam Model), Whistleblowing, Conflict of Interest Case Studies',
      microTopics: [
        {
          id: 'upsc_gs4_5',
          topicTitle: 'Probity in Governance, Nolan Committee 7 Principles & RTI Transparency',
          subtopic:
            'Nolan 7 Principles (Selflessness, Integrity, Objectivity, Accountability, Openness, Honesty, Leadership), Prevention of Corruption Act, CPGRAMS grievance redressal',
          dayNumber: 3,
          periodNumber: 4,
          keyFormulaOrLaw:
            'Nolan Committee 7 Principles of Public Life: Selflessness, Integrity, Objectivity, Accountability, Openness, Honesty, Leadership',
          keyPoints: [
            'Sevottam Model 3 components: Citizen Charter implementation, Public Grievance Redressal, Service Delivery Capability',
            'Whistleblowers Protection Act safeguards individuals exposing corrupt practices in public administration'
          ],
          type: 'concept',
          importance: 'High-Yield'
        },
        {
          id: 'upsc_gs4_6',
          topicTitle:
            'Case Studies: Resolution Framework for Ethical Dilemmas & Conflict of Interest',
          subtopic:
            'Framework: Identify Stakeholders -> Ethical Dilemma -> Options Available with Merits/Demerits -> Course of Action based on Constitutional Morality',
          dayNumber: 7,
          periodNumber: 4,
          keyFormulaOrLaw:
            'Ethical Decision Matrix: Legality + Constitutional Morality + Utilitarian Benefit + Empathy for Marginalized + Transparency',
          keyPoints: [
            'Balancing statutory duty against political pressure using documented official written instructions',
            'Resolving environmental clearance dilemmas by incorporating sustainable mitigation and local tribal consent'
          ],
          type: 'solved_problem',
          importance: 'High-Yield'
        }
      ]
    }
  ];
  // SUBJECT 5:  CSAT (Civil Services Aptitude Test & Quantitative Reasoning)
  const csatChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Reading Comprehension & Critical Reasoning',
      description:
        'Passages on ecology, governance, economics; Identifying Central Idea, Crucial Assumptions, Logical Inferences & Implications',
      microTopics: [
        {
          id: 'upsc_csat_1',
          topicTitle: 'Reading Comprehension: Assumptions, Logical Inferences & Authorial Tone',
          subtopic:
            'Distinguishing directly stated facts from unstated underlying assumptions, invalid extreme options elimination technique',
          dayNumber: 1,
          periodNumber: 5,
          keyFormulaOrLaw:
            'Assumption = Necessary unstated premise | Inference = Logical conclusion drawn from stated evidence',
          keyPoints: [
            'Eliminate extreme qualifiers: "Always", "Never", "Only", "All" unless explicitly validated by text',
            'Focus on pivot keywords: "However", "Although", "Consequently", "Therefore"'
          ],
          type: 'solved_problem',
          importance: 'High-Yield'
        }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Basic Numeracy, Number Systems & Permutations / Probability',
      description:
        'Divisibility rules, Remainder theorem, Unit digit, Factorials, P&C (nCr, nPr), Probability, Percentages & Speed-Distance-Time',
      microTopics: [
        {
          id: 'upsc_csat_2',
          topicTitle: 'Number Systems: Divisibility Rules, Unit Digits, Remainders & Factorials',
          subtopic:
            'Cyclicity of powers (2, 3, 7, 8), Euler Remainder Theorem, trailing zeroes in n!, prime factorization & LCM-HCF word problems',
          dayNumber: 2,
          periodNumber: 5,
          keyFormulaOrLaw:
            'Cyclicity of Unit Digit: Powers of 2, 3, 7, 8 repeat every 4th power | Trailing Zeroes = ௌொn/5ௌோ + ௌொn/25ௌோ + ௌொn/125ௌோ',
          keyPoints: [
            'Divisibility by 7, 11, 13 test using alternating 3-digit block sums',
            'Remainder of polynomial expressions using Binomial theorem'
          ],
          type: 'solved_problem',
          importance: 'High-Yield'
        },
        {
          id: 'upsc_csat_3',
          topicTitle:
            'Permutations, Combinations (nCr, nPr), Probability & Set Theory Venn Diagrams',
          subtopic:
            'Arrangement of letters/digits with constraints, selection of committee members, dice and coin probability, 2 and 3-set Venn diagrams',
          dayNumber: 3,
          periodNumber: 5,
          keyFormulaOrLaw:
            'nCr = n! / [r!(n - r)!] | Probability P(E) = n(E) / n(S) | n(A ஈª B) = n(A) + n(B) - n(A ஈ© B)',
          keyPoints: [
            'Circular permutation of n distinct items = (n - 1)!',
            'At least one probability: P(At least one) = 1 - P(None)'
          ],
          type: 'solved_problem',
          importance: 'High-Yield'
        }
      ]
    },
    {
      chapterNumber: 3,
      chapterTitle: 'Logical Reasoning, Puzzles, Clocks, Calendars & Data Interpretation',
      description:
        'Syllogisms (Venn method), Linear/Circular seating arrangements, Blood relations, Direction test, Clock angle & Pie/Bar charts',
      microTopics: [
        {
          id: 'upsc_csat_4',
          topicTitle: 'Logical Deduction: Syllogisms, Seating Arrangements, Blood Relations & Dice',
          subtopic:
            'All/Some/No statement truth values, complex multi-variable floor/seating puzzles, family tree notation, dice opposite faces',
          dayNumber: 4,
          periodNumber: 5,
          keyFormulaOrLaw:
            'Clock Angle: θ = |30H - (11/2)M| | Calendar Odd Days: Normal Year = 1 Odd Day, Leap Year = 2 Odd Days',
          keyPoints: [
            'Syllogism: If statement is "Some A are B", its converse "Some B are A" is definitively true',
            'Blood relation problems solved by systematic generational family tree diagrams'
          ],
          type: 'solved_problem',
          importance: 'High-Yield'
        }
      ]
    }
  ];
  const subjects: SyllabusSubject[] = [
    {
      subjectId: 'upsc_gs1',
      subjectName: 'UPSC GS Paper I: Heritage, History, Geography & Society (GS-1)',
      icon: 'ðடஏ›ï¸ஏ',
      color: '#10b981',
      totalChapters: gs1Chapters.length,
      totalMicroTopics: gs1Chapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0),
      chapters: gs1Chapters
    },
    {
      subjectId: 'upsc_gs2',
      subjectName: 'UPSC GS Paper II: Governance, Constitution, Polity, Social Justice & IR (GS-2)',
      icon: 'ச–ï¸ஏ',
      color: '#06b6d4',
      totalChapters: gs2Chapters.length,
      totalMicroTopics: gs2Chapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0),
      chapters: gs2Chapters
    },
    {
      subjectId: 'upsc_gs3',
      subjectName: 'UPSC GS Paper III: Technology, Economy, Environment & Internal Security (GS-3)',
      icon: '📈',
      color: '#f59e0b',
      totalChapters: gs3Chapters.length,
      totalMicroTopics: gs3Chapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0),
      chapters: gs3Chapters
    },
    {
      subjectId: 'upsc_gs4',
      subjectName: 'UPSC GS Paper IV: Ethics, Integrity, Aptitude & Case Studies (GS-4)',
      icon: '💡',
      color: '#8b5cf6',
      totalChapters: gs4Chapters.length,
      totalMicroTopics: gs4Chapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0),
      chapters: gs4Chapters
    },
    {
      subjectId: 'upsc_csat',
      subjectName: 'UPSC CSAT Paper II: Reading Comprehension & Quantitative Reasoning',
      icon: '🎯',
      color: '#ec4899',
      totalChapters: csatChapters.length,
      totalMicroTopics: csatChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0),
      chapters: csatChapters
    }
  ];
  return {
    courseId: courseId || 'exam-upsc-ias',
    courseTitle:
      courseTitle || 'UPSC Civil Services (IAS / IPS / IFS / IRS) Prelims + Mains Master Blueprint',
    category: 'upsc_central',
    board: 'UPSC (National)',
    medium: 'English',
    totalDays: 360,
    totalSubjects: subjects.length,
    totalChapters: subjects.reduce((a, s) => a + (s.totalChapters || s.chapters.length), 0),
    totalMicroTopics: subjects.reduce(
      (a, s) =>
        a +
        (s.totalMicroTopics ||
          s.chapters.reduce((acc, c) => acc + (c.microTopics?.length || 0), 0)),
      0
    ),
    subjects
  };
}

export function getUpscOptionalSubjectSyllabus(
  courseId: string,
  courseTitle?: string
): CourseFullSyllabus {
  const opt = UPSC_OPTIONALS_REGISTRY[courseId];
  if (!opt) {
    return getUpscCivilServicesCompleteSyllabus(courseId, courseTitle);
  }
  const paper1Units = opt.units.filter((u) => u.paper === 'Paper I');
  const paper2Units = opt.units.filter((u) => u.paper === 'Paper II');
  const subjects: SyllabusSubject[] = [
    {
      subjectId: `${courseId}_p1`,
      subjectName: `${opt.shortTitle} — Paper I: Theory & Foundations`,
      icon: 'ðடஏ›ï¸ஏ',
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
          dayNumber: idx * 15 + tIdx * 3 + 1,
          periodNumber: 1,
          keyFormulaOrLaw: `Core Thinkers: ${u.thinkersOrLaws.join(', ')}`,
          keyPoints: [
            'Core theoretical framework and critical debates',
            'Mains analytical application and 250-word answer structuring'
          ],
          type: 'concept',
          importance: 'High-Yield'
        }))
      }))
    },
    {
      subjectId: `${courseId}_p2`,
      subjectName: `${opt.shortTitle} — Paper II: Indian Context & Advanced Applications`,
      icon: 'ச–ï¸ஏ',
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
          dayNumber: 180 + idx * 15 + tIdx * 3 + 1,
          periodNumber: 2,
          keyFormulaOrLaw: `Applied Principles: ${u.thinkersOrLaws.join(', ')}`,
          keyPoints: [
            'Empirical case studies and Indian administrative relevance',
            'Contemporary trends, criticisms and policy synthesis'
          ],
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
    totalMicroTopics: subjects.reduce(
      (a, s) =>
        a +
        (s.totalMicroTopics ||
          s.chapters.reduce((acc, c) => acc + (c.microTopics?.length || 0), 0)),
      0
    ),
    subjects
  };
}

export function getTnpscUnifiedCompleteSyllabus(
  courseId?: string,
  courseTitle?: string
): CourseFullSyllabus {
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

export function getJeeMainAdvancedCompleteSyllabus(
  courseId?: string,
  courseTitle?: string
): CourseFullSyllabus {
  return {
    courseId: courseId || 'exam-jee-main',
    courseTitle: courseTitle || 'JEE Main & JEE Advanced Unified Entrance Preparation',
    category: 'entrance',
    board: 'NTA / IIT JEE',
    medium: 'English',
    totalDays: 360,
    totalSubjects: JEE_MAIN_ADVANCED_OFFICIAL_SUBJECTS.length,
    totalChapters: JEE_MAIN_ADVANCED_OFFICIAL_SUBJECTS.reduce((a, s) => a + s.totalChapters, 0),
    totalMicroTopics: JEE_MAIN_ADVANCED_OFFICIAL_SUBJECTS.reduce(
      (a, s) => a + s.totalMicroTopics,
      0
    ),
    subjects: JEE_MAIN_ADVANCED_OFFICIAL_SUBJECTS
  };
}

export function getCommerceClass11Syllabus(
  courseId: string,
  courseTitle: string
): CourseFullSyllabus {
  const accountancyChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Introduction to Accounting & Theoretical Framework',
      description:
        'Accounting concepts, GAAP, double entry system, cash vs accrual basis, and accounting standards',
      microTopics: [
        {
          id: 'com_acc_1',
          topicTitle: 'Accounting Meaning, Objectives & Fundamental Accounting Equation',
          subtopic: 'Assets = Liabilities + Capital (Equity), Users of accounting info',
          dayNumber: 1,
          periodNumber: 1,
          keyFormulaOrLaw: 'Assets = Liabilities + Capital (Equity) | Dual Aspect Principle',
          keyPoints: [
            'Conservatism: Anticipate no profit, provide for all possible losses',
            'Accrual concept recognizes revenue when earned'
          ],
          type: 'concept',
          importance: 'High-Yield'
        }
      ]
    }
  ];
  const businessStudiesChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Foundations of Business & Forms of Business Organisations',
      description:
        'Sole Proprietorship, Partnership (Act 1932), Joint Stock Company, Business finance',
      microTopics: [
        {
          id: 'com_bst_1',
          topicTitle: 'Forms of Business Organisations & CSR Mandate',
          subtopic:
            'Sole proprietorship, Partnership deed, Joint Stock Company, Section 135 CSR 2% rule',
          dayNumber: 1,
          periodNumber: 2,
          keyFormulaOrLaw:
            'Features of Company: Separate Legal Entity, Perpetual Succession, Limited Liability',
          keyPoints: [
            'Sole proprietor has unlimited liability; Company shareholders have limited liability',
            'Section 135 Companies Act 2013 mandates 2% CSR spending'
          ],
          type: 'concept',
          importance: 'High-Yield'
        }
      ]
    }
  ];
  const economicsChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Introductory Microeconomics & Statistics for Economics',
      description:
        'Law of Demand, Elasticity, Variable Proportions, Measures of Central Tendency (Mean, Median, Mode)',
      microTopics: [
        {
          id: 'com_eco_1',
          topicTitle: 'Consumer Equilibrium & Price Elasticity of Demand (Ed)',
          subtopic: 'Marginal utility, Indifference curve tangency MRS_xy = P_x / P_y, E_d formula',
          dayNumber: 1,
          periodNumber: 3,
          keyFormulaOrLaw:
            'Price Elasticity of Demand E_d = - (ΔQ / ΔP) × (P / Q) | Empirical: Mode = 3 Median - 2 Mean',
          keyPoints: [
            'Indifference curve is convex to origin due to diminishing MRS',
            'Standard Deviation σ measures absolute dispersion'
          ],
          type: 'solved_problem',
          importance: 'High-Yield'
        }
      ]
    }
  ];
  const subjects: SyllabusSubject[] = [
    {
      subjectId: 'cbse_acc',
      subjectName: 'Accountancy (Financial Accounting Part 1 & 2)',
      icon: '📊',
      color: '#10b981',
      totalChapters: accountancyChapters.length,
      totalMicroTopics: accountancyChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0),
      chapters: accountancyChapters
    },
    {
      subjectId: 'cbse_bst',
      subjectName: 'Business Studies (Foundations & Finance)',
      icon: '💡¼',
      color: '#06b6d4',
      totalChapters: businessStudiesChapters.length,
      totalMicroTopics: businessStudiesChapters.reduce(
        (a, c) => a + (c.microTopics?.length || 0),
        0
      ),
      chapters: businessStudiesChapters
    },
    {
      subjectId: 'cbse_eco',
      subjectName: 'Economics (Microeconomics & Statistics)',
      icon: '📈',
      color: '#f59e0b',
      totalChapters: economicsChapters.length,
      totalMicroTopics: economicsChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0),
      chapters: economicsChapters
    }
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
    totalMicroTopics: subjects.reduce(
      (a, s) =>
        a +
        (s.totalMicroTopics ||
          s.chapters.reduce((acc, c) => acc + (c.microTopics?.length || 0), 0)),
      0
    ),
    subjects
  };
}

export function getHigherSecondaryScienceCompleteSyllabus(
  courseId: string,
  courseTitle: string
): CourseFullSyllabus {
  const isTa = courseTitle.includes('தமிழ்') || courseId.includes('-ta-');
  const physicsChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: isTa
        ? 'நிலை மின்னியல் & மின்னோட்டவியல் (Electrostatics & Current Electricity)'
        : 'Electrostatics, Gauss Law & Current Electricity',
      description: isTa
        ? 'க₹லும் விதி, காஸ் விதி, மின்தேக்கி, ஒம் விதி, கிர்க்காஃப் விதிகள் & வீட்ஸ்டோன் சமன்பாட்டுச் சுற்று'
        : "Coulomb's Law, Gauss Law & applications, Capacitance & Dielectrics, Kirchhoff's Laws, Wheatstone Bridge & Potentiometer",
      microTopics: [
        {
          id: 'hsc_phy_1',
          topicTitle: isTa
            ? 'க₹லும் விதி, காஸ் விதி & மின்புலம்'
            : 'Coulomb Law, Electric Field & Gauss Theorem Applications',
          subtopic: isTa
            ? 'F = (1 / (4πε₀))((q₁ · q₂) / r² ) மற்றும் காஸ் சமன்பாடுகள்'
            : 'Electric dipole, Torque „ = p E, Flux Φ = ஈ E dA = q_enc / ε₹ீ, Infinite line charge E = λ / (2ீε₹ீr)',
          dayNumber: 1,
          periodNumber: 1,
          keyFormulaOrLaw:
            'Coulomb: F = (1 / (4πε₀))((q₁ · q₂) / r² ) | Gauss: ஈ E dA = q_in / ε₹ீ | Dipole Potential V = (1 / (4πε₀))(p cos θ / r )',
          keyPoints: [
            'Electric field inside a hollow spherical conductor is zero (Electrostatic shielding)',
            'Capacitance of parallel plate with dielectric: C = K ε₹ீ A / d'
          ],
          type: 'solved_problem',
          importance: 'High-Yield'
        },
        {
          id: 'hsc_phy_2',
          topicTitle: isTa
            ? 'கிர்க்காஃப் விதிகள், வீட்ஸ்டோன் பாலம் & மின்னழுத்தமானி'
            : 'Kirchhoff Laws, Wheatstone Bridge & Drift Velocity',
          subtopic: isTa
            ? 'மின்னோ ட் ட விதி (KCL), மின்னழுத்த விதி (KVL) & P/Q = R/S'
            : 'Current density j = n e v_d, Kirchhoff Current & Voltage Laws, Wheatstone balanced condition P/Q = R/S, Internal resistance r = R(l₹ /l₹₹ - 1)',
          dayNumber: 5,
          periodNumber: 1,
          keyFormulaOrLaw:
            'Kirchhoff Loop: Σ ஔV = 0 | Wheatstone: P/Q = R/S (Null deflection) | Drift Velocity v_d = eE „ / m',
          keyPoints: [
            'KCL is based on conservation of charge; KVL is based on conservation of energy',
            'Potentiometer draws no current at balance point, acting as an ideal voltmeter'
          ],
          type: 'solved_problem',
          importance: 'High-Yield'
        }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: isTa
        ? 'மின் காந்தவியல் & ஒளியியல் (Magnetism, EMI, AC & Wave Optics)'
        : 'Magnetic Effects of Current, EMI, AC & Wave Optics',
      description: isTa
        ? 'பயோ ட்- சாவார் ட் விதி, ஃபார ட இ விதி, மாறுதி ச ஈ மின்னோ ட் டம் LCR சுற்று, ஹ ஈ œ ஆன்ஸ் தத்துவம்'
        : 'Biot-Savart Law, Ampere Circuital Law, Faraday & Lenz Laws, LCR Resonance, Huygens Principle, Young Double Slit Experiment',
      microTopics: [
        {
          id: 'hsc_phy_3',
          topicTitle: isTa
            ? 'பயோ ட்- சாவார் ட் விதி, ஆம்பியர் விதி & லாரன்ஸ் வி ச ஈ'
            : 'Biot-Savart Law, Ampere Circuital Law & Cyclotron Resonance',
          subtopic: isTa
            ? 'வ ட் ட ச் சுருளின் காந்தப்புலம் B = μ₹ீI/(2R) & F = q(v B)'
            : 'Magnetic field on circular coil axis B = μ₹ீ I R / [2(R +x )^(3/2)], Force on wire F = I(L B), Galvanometer to Ammeter/Voltmeter conversion',
          dayNumber: 9,
          periodNumber: 1,
          keyFormulaOrLaw:
            'Biot-Savart: dB = (μ₹ீ/4ீ)(I dl sin θ / r ) | Lorentz Force F = q(E + v B) | Shunt Resistance S = I_g G / (I - I_g)',
          keyPoints: [
            'Parallel currents attract; antiparallel currents repel with force F/L = (μ₹ீ I₹ I₹₹) / (2ீd)',
            'Converting Galvanometer to Ammeter requires low shunt resistance in parallel'
          ],
          type: 'solved_problem',
          importance: 'High-Yield'
        },
        {
          id: 'hsc_phy_4',
          topicTitle: isTa
            ? 'மின் காந்த தூண் டல், LCR ஒத்ததிர்வு & அல ஈ ஒளியியல் (YDSE)'
            : 'EMI (Faraday/Lenz), LCR Resonance & Young Double Slit (YDSE)',
          subtopic: isTa
            ? 'e = -dΦ/dt, ஒத்ததிர்வு அதிர்வ ஆண் f = 1/(2ீ ஈசLC), ப ட் ட ஈயின் அ கலம் β = λD/d'
            : 'Motional EMF e = Bvl, Quality factor Q = (1/R) ஈச(L/C), Wavefronts, Fringe width β = λD/d in interference, Brewster law μ = tan i_p',
          dayNumber: 13,
          periodNumber: 1,
          keyFormulaOrLaw:
            'Faraday Law: e = -N (dΦ/dt) | LCR Resonance: f_r = 1 / (2ீ ஈசLC) | YDSE Fringe Width: β = λ D / d',
          keyPoints: [
            'Lenz law is consistent with principle of conservation of energy',
            'Diffraction central maximum angular width θ = 2λ / a'
          ],
          type: 'solved_problem',
          importance: 'High-Yield'
        }
      ]
    }
  ];
  const chemistryChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: isTa
        ? 'கர ஈசல் கள், மின்வ இதியியல் & வ இதிவின ஈ வ இ கவியல்'
        : 'Solutions, Electrochemistry & Chemical Kinetics',
      description: isTa
        ? 'ஹ ஆன்றி விதி, ரவுல் ட் விதி, ந ஆர்ன்ஸ் ட் சமன்பாடு, முதல் வகை வின ஈ சமன்பாடு'
        : "Raoult's Law, Colligative Properties (Van't Hoff factor), Nernst Equation, Kohlrausch Law, Integrated Rate Law for 1st Order Reactions",
      microTopics: [
        {
          id: 'hsc_ch_1',
          topicTitle: isTa
            ? 'ரவுல் ட் விதி, சவ்வூ டுபரவல் அழுத்தம் & வாண் ட் ஹா ஃப் காரணி'
            : "Raoult Law, Colligative Properties & Van't Hoff Factor (i)",
          subtopic: isTa
            ? 'ஔT_b = K_b m, ஔT_f = K_f m,ீ = iCRT சமன்பாடுகள்'
            : 'Relative lowering of vapour pressure (p -p)/p = x_B, Elevation in boiling point, Depression in freezing point, Abnormal molar mass i = 1 + (n-1)α',
          dayNumber: 2,
          periodNumber: 2,
          keyFormulaOrLaw:
            "Raoult Law: p_A = p _A x_A | Osmotic Pressure:ீ = i C R T | Van't Hoff: i = Normal Molar Mass / Abnormal Molar Mass",
          keyPoints: [
            'Colligative properties depend only on number of solute particles, not on their identity',
            'For association of molecules, i < 1; for dissociation (electrolytes), i > 1'
          ],
          type: 'solved_problem',
          importance: 'High-Yield'
        },
        {
          id: 'hsc_ch_2',
          topicTitle: isTa
            ? 'மின்வ இதியியல்: ந ஆர்ன்ஸ் ட் சமன்பாடு & முதல் வகை வின ஈ சமன்பாடு'
            : 'Nernst Equation, Kohlrausch Law & Integrated Rate Equations',
          subtopic: isTa
            ? 'E_cell = E - (0.0591/n)log Q, k = (2.303/t)log([A₹ீ]/[A])'
            : 'Electrochemical cell EMF, Standard Hydrogen Electrode (SHE), Kohlrausch law of independent migration of ions, Half-life t_ = 0.693 / k, Arrhenius equation',
          dayNumber: 6,
          periodNumber: 2,
          keyFormulaOrLaw:
            'Nernst: E_cell = E _cell - (0.0591/n) log Q | First Order Rate: k = (2.303/t) log([A]₹ீ/[A]) | t_ = 0.693 / k',
          keyPoints: [
            'Gibbs Free Energy and EMF relation: ஔG = -n F E _cell',
            'Half-life of first-order reaction is completely independent of initial reactant concentration'
          ],
          type: 'solved_problem',
          importance: 'High-Yield'
        }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: isTa
        ? 'அண ஈவு ச் ச இர்ம ங் கள் & கரிம வ இதியியல் (ஆல் கஹால் கள், ஆல் டிஹ ஈ டு கள்)'
        : 'Coordination Compounds & Organic Reaction Mechanisms',
      description: isTa
        ? 'வ ஆர்னர் கொள் க ஈ, ப டி கப்புல க் கொள் க ஈ (CFT), SN1/SN2 வின ஈ கள், ஆல் டால் குறு க் கம் & க இனி சரோ வின ஈ'
        : 'IUPAC naming of complexes, Crystal Field Splitting (ஔ_o & ஔ_t), SN1 vs SN2 kinetics, Aldol condensation, Cannizzaro reaction, Diazonium salts',
      microTopics: [
        {
          id: 'hsc_ch_3',
          topicTitle: isTa
            ? 'அண ஈவு ச் ச இர்ம ங் கள்: வ ஆர்னர் கொள் க ஈ & ப டி கப்புல க் கொள் க ஈ (CFT)'
            : 'Coordination Chemistry: CFT Splitting & IUPAC Nomenclature',
          subtopic: isTa
            ? 'ஆ க் டாஹ ஆ ட்ரல் t₹₹g - e_g பிளப்பு, காந்தத்தன்மை, ஸ்ப ஆ க் ட்ரோ க ஆமி க் கல் வரிசை'
            : 'Primary & secondary valency, Crystal field splitting energy ஔ_o, Strong vs weak field ligands, High-spin vs Low-spin configurations, Magnetic moment μ = ஈச[n(n+2)] BM',
          dayNumber: 10,
          periodNumber: 2,
          keyFormulaOrLaw:
            'Magnetic Moment: μ = ஈச[n(n+2)] BM (Bohr Magnetons) | CFT Splitting: Octahedral ஔ_o (t₹₹g e_g )',
          keyPoints: [
            'Strong field ligands (CN⁻, CO) cause electron pairing and large CFSE ஔ_o',
            'Chelate complexes are more stable than non-chelate complexes due to entropy increase'
          ],
          type: 'concept',
          importance: 'High-Yield'
        },
        {
          id: 'hsc_ch_4',
          topicTitle: isTa
            ? 'கரிம வ இதியியல்: SN1/SN2 வின ஈ கள், ஆல் டால் குறு க் கம் & க இனி சரோ'
            : 'Organic Mechanisms: SN1/SN2, Aldol, Cannizzaro & Diazotization',
          subtopic: isTa
            ? 'கார்போ க இஷன் இடைநிலை, தலை கீழ் அம ஈப்பு, ஆல்பா-ஹ ஈ ட்ர œன் வின ஈ கள்'
            : 'Nucleophilic substitution kinetics (SN1 two-step vs SN2 concerted Walden inversion), Aldol condensation with α-H, Cannizzaro disproportionation without α-H, Sandmeyer reaction',
          dayNumber: 14,
          periodNumber: 2,
          keyFormulaOrLaw:
            'SN2: Rate = k[R-X][Nu⁻] (Walden Inversion) | SN1: Rate = k[R-X] (Carbocation intermediate, Racemization)',
          keyPoints: [
            'Tertiary alkyl halides undergo SN1 due to carbocation stability (3 > 2 > 1 )',
            'Aldehydes with no α-hydrogen (Formaldehyde, Benzaldehyde) undergo Cannizzaro reaction'
          ],
          type: 'solved_problem',
          importance: 'High-Yield'
        }
      ]
    }
  ];
  const mathematicsChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: isTa
        ? 'அணி கள், அணி க் கோவ ஈ கள் & வகை நுண் கணிதம்'
        : 'Matrices, Determinants & Differential Calculus',
      description: isTa
        ? 'அணியின் நேர்மாறு A⁻ = (1/|A|)adj(A), தொ டர் ச் சி மற்றும் வகையி டுதல், எல்ல ஈ கள்'
        : "Matrix inversion, Cramer's Rule, Continuity & Differentiability, Chain rule, Maxima & Minima (Second derivative test)",
      microTopics: [
        {
          id: 'hsc_m_1',
          topicTitle: isTa
            ? 'அணி கள் & அணி க் கோவ ஈ கள்: நேர்மாறு மற்றும் கிராமரின் விதி'
            : 'Matrices & Determinants: Inverse A⁻ & System of Linear Equations',
          subtopic: isTa
            ? 'A⁻ = (1/|A|) adj A மற்றும் AX = B தீர்வு முறை'
            : "Properties of determinants, Adjoint of square matrix, Solution of non-homogeneous linear systems using matrix method and Cramer's rule",
          dayNumber: 3,
          periodNumber: 3,
          keyFormulaOrLaw:
            'Matrix Inverse: A⁻ = (1 / |A|) adj(A) | Product: A adj(A) = |A| I_n | System: X = A⁻ B',
          keyPoints: [
            'A square matrix A is invertible if and only if |A| உ 0 (Non-singular matrix)',
            '|adj(A)| = |A|^(n-1) for a matrix of order n'
          ],
          type: 'solved_problem',
          importance: 'High-Yield'
        },
        {
          id: 'hsc_m_2',
          topicTitle: isTa
            ? 'வகை நுண் கணிதம்: ப ஆருமம் மற்றும் சிறுமம் (Maxima & Minima)'
            : 'Calculus: Derivatives, Mean Value Theorems & Maxima/Minima',
          subtopic: isTa
            ? 'dy/dx = 0 புள்ளி கள், d y/dx சோதன ஈ மற்றும் தொ டர் ப ஆரு க் கம்'
            : "Rolle's & Lagrange's Mean Value Theorems, Tangents & Normals slope m = dy/dx, Critical points, Second derivative test for local maxima/minima",
          dayNumber: 7,
          periodNumber: 3,
          keyFormulaOrLaw:
            "Maxima Condition: f'(x) = 0 and f''(x) < 0 | Minima Condition: f'(x) = 0 and f''(x) > 0 | Chain Rule: d/dx[f(g(x))] = f'(g(x)) g'(x)",
          keyPoints: [
            "If f''(x) = 0 at critical point, use higher derivative test or first derivative sign test",
            'Slope of normal to curve at (x₹, y₹ ) is -1 / (dy/dx)_(x₹ ,y₹ )'
          ],
          type: 'solved_problem',
          importance: 'High-Yield'
        }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: isTa
        ? 'தொ க ஈ நுண் கணிதம், தி ச ஈயன் கள் & நி கழ்த கவு'
        : 'Integral Calculus, Vectors, 3D Geometry & Probability',
      description: isTa
        ? 'பகுதிப் பின்னங்கள் மூலம் தொ க ஈயி டல், ப ஆர்னோலி ச₹த்திரம், தி ச ஈயன் ப ஆரு க் கல், ப இயஸ் த இற்றம்'
        : "Integration by parts ஈ u dv = uv - ஈ v du, Definite integral properties, Dot and Cross products, Shortest distance between skew lines, Bayes' Theorem",
      microTopics: [
        {
          id: 'hsc_m_3',
          topicTitle: isTa
            ? 'தொ க ஈ நுண் கணிதம்: பகுதி தொ க ஈயி டல் & குறிப்பி ட் ட தொ க ஈயீ டு கள்'
            : 'Integral Calculus: Integration by Parts & Definite Properties',
          subtopic: isTa
            ? 'ஈ u dv = uv - ஈ v du மற்றும் ஈ₹ீ ஃ f(x)dx = ஈ₹ீ ஃ f(a-x)dx'
            : 'Integration by substitution, partial fractions, Integration by parts ILATE rule, Definite integrals king property ஈ₹ீ ஃ f(x)dx = ஈ₹ீ ஃ f(a-x)dx, Area under curve',
          dayNumber: 11,
          periodNumber: 3,
          keyFormulaOrLaw:
            "By Parts: ஈ u v dx = u ஈ v dx - ஈ [u' (ஈ v dx)] dx | King Property: ஈ₹ீ ஃ f(x) dx = ஈ₹ீ ஃ f(a - x) dx",
          keyPoints: [
            'ILATE priority for choosing u: Inverse, Logarithmic, Algebraic, Trigonometric, Exponential',
            'Area between curve y = f(x) and x-axis from a to b = ஈ₹ இ |f(x)| dx'
          ],
          type: 'solved_problem',
          importance: 'High-Yield'
        },
        {
          id: 'hsc_m_4',
          topicTitle: isTa
            ? 'தி ச ஈயன் கள் (Vectors), முப்பரிமாண வடிவியல் & ப இயஸ் த இற்றம்'
            : 'Vectors, 3D Geometry (Skew Lines) & Bayes Theorem',
          subtopic: isTa
            ? 'a b = |a||b|cos θ, a b, கோ டு களு க் கு இடைப்பட்ட மீச்சிறு தொல ஈவு, நிபந்தன ஈ நி கழ்த கவு'
            : "Scalar triple product [a b c], Vector cross product, Shortest distance d = |(a₹₹-a₹ ) (b₹ b₹₹)| / |b₹ b₹₹|, Conditional probability P(A|B), Bayes' Theorem calculation",
          dayNumber: 15,
          periodNumber: 3,
          keyFormulaOrLaw:
            'Dot Product: a b = a₹ b₹ + a₹₹b₹₹ + a₹ஃb₹ஃ | Cross Product: |a b| = |a||b| sin θ | Bayes: P(A_i|B) = [P(A_i)P(B|A_i)] / Σ[P(A_j)P(B|A_j)]',
          keyPoints: [
            'Two non-zero vectors a and b are perpendicular if and only if a b = 0',
            'Shortest distance between two parallel lines r = a₹ + λb and r = a₹₹ + μb is |b (a₹₹ - a₹ )| / |b|'
          ],
          type: 'solved_problem',
          importance: 'High-Yield'
        }
      ]
    }
  ];
  const generalTamilChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'இயல் 1: மொழி & செய்யுள் (தன்ன இர் இலாத தமிழ் & தமிழாய் எழுதுவோம்)',
      description:
        'தண் டியல ங் கார உரை ம இற் கோள் பா டல், பிழையின்றித் தமிழில் எழுதும் முறை கள், எழுத்து ச் சீர்திருத்தம்',
      subtopics: [
        {
          id: 'hsc_t_sub1',
          title: 'தன்ன இர் இலாத தமிழ் & தமிழ் எழுத்து முறைம ஈ',
          microTopics: [
            {
              id: 'hsc_t_1',
              title: 'தன்ன இர் இலாத தமிழ் (தண் டியல ங் காரம்) — ச ஆந்தமிழின் தனி ச் சிறப்பு',
              keyAxiom:
                'ஒ ங் கலி ட ஈ வந்து உயர்ந்தோர் தொழ விள ங் கி ஏ ங் கொலி நீர் ஞாலத்து இருள கற்றும் ச ஆந்தமிழ்'
            },
            {
              id: 'hsc_t_2',
              title: 'தமிழாய் எழுதுவோம் — வல்லினம் மி கும் இ ட ங் கள் & மி கா இ ட ங் கள்',
              keyAxiom: 'க், ச், த், ப் சந்திப்பிழைகள் நீக்கி எழுதுதல்'
            }
          ]
        }
      ],
      microTopics: [
        {
          id: 'hsc_t_1',
          topicTitle: 'தன்ன இர் இலாத தமிழ் & வல்லினம் மி கும் / மி கா இ ட ங் கள்',
          subtopic: 'தண் டியல ங் கார நயம் & சந்திப் பிழைகள் நீக்குதல்',
          dayNumber: 1,
          periodNumber: 1,
          keyFormulaOrLaw:
            'தண் டியல ங் காரம்: ஒ ங் கலி ட ஈ வந்து உயர்ந்தோர் தொழ விள ங் கி | வல்லினம்: அந்த, இந்த, எந்த பின் மி கும்',
          keyPoints: [
            'அணி இலக்கணத்த ஈ மட்டுமே க₹றும் நூல் தண் டியல ங் காரம்',
            'வ டமொழியில் உள்ள காவிய தர் சம் நூல ஈத் தழுவி எழுதப்ப ட் டது'
          ],
          type: 'concept',
          importance: 'High-Yield'
        }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'இயல் 2: இயற்கை & வ இளாண்ம ஈ (திருமல ஈ முரு கன் பள்ளு & ஐ ங் குறுநூறு)',
      description:
        'பெரியவன் கவிராயர் திருமல ஈ முரு கன் பள்ளு, ப இயனார் ஐ ங் குறுநூறு, நால்வகைப் பொருத்த ங் கள் (திணை, பால், எண், இ டம்)',
      subtopics: [
        {
          id: 'hsc_t_sub2',
          title: 'பள்ளு இலக்கியம் & ஐ ங் குறுநூறு',
          microTopics: [
            {
              id: 'hsc_t_3',
              title: 'திருமல ஈ முரு கன் பள்ளு (பெரியவன் கவிராயர்) — உழவு ச் சிறப்பு',
              keyAxiom: 'பள்ளு என்பது 96 வகை சிற்றில க் கிய ங் களுள் ஒன்று (உழத்திப் பா ட் டு)'
            },
            {
              id: 'hsc_t_4',
              title: 'ஐ ங் குறுநூறு (முல்லைத்திணை — ப இயனார்) & நால்வகைப் பொருத்த ங் கள்',
              keyAxiom:
                'ஐ ங் குறுநூறு 3 அ டி முதல் 6 அ டி வரையிலான குறைந்த அ கவற்பா க் கள் கொண் ட நூல்'
            }
          ]
        }
      ],
      microTopics: [
        {
          id: 'hsc_t_3',
          topicTitle: 'திருமல ஈ முரு கன் பள்ளு & நால்வகைப் பொருத்த ங் கள் இலக்கணம்',
          subtopic: 'உழவு நா கரி கம் மற்றும் திணை, பால், எண், இ டப் பொருத்த ங் கள்',
          dayNumber: 4,
          periodNumber: 1,
          keyFormulaOrLaw:
            'பள்ளு இலக்கியம்: உழவர் வாழ் க் க ஈய ஈ ச் சித்தரி க் கும் உளத்திப் பா ட் டு | ஐ ங் குறுநூறு: 500 அ கவற்பா க் கள்',
          keyPoints: [
            'ஐ ங் குறுநூற்ற ஈத் தொ குத்தவர் புலத்துற ஈ முற்றிய க₹ டல₹ர் கிழார்',
            'தொ குப்பித்தவர் யான ஈ க ட் ச இய் மாந்தர ஞ் ச இரல் இரும்பொற ஈ'
          ],
          type: 'solved_problem',
          importance: 'High-Yield'
        }
      ]
    }
  ];
  const generalEnglishChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Unit 1: Prose (*Two Gentlemen of Verona*) & Poem (*The Castle*)',
      description:
        'A.J. Cronin inspirational story of Nicola and Jacopo, Edwin Muir allegorical poem "The Castle", Tenses & Modal Auxiliaries',
      subtopics: [
        {
          id: 'hsc_e_sub1',
          title: 'Unit 1: Selfless Devotion & Treachery',
          microTopics: [
            {
              id: 'hsc_e_1',
              title: 'Prose: Two Gentlemen of Verona by A.J. Cronin',
              keyAxiom:
                "Nicola and Jacopo's sacrifice for their sister Lucia tuberculosis treatment"
            },
            {
              id: 'hsc_e_2',
              title: "Poem: The Castle by Edwin Muir & The Warder's Betrayal",
              keyAxiom: 'Physical fortress fell not to weapons, but to greed of a wicked gatekeeper'
            }
          ]
        }
      ],
      microTopics: [
        {
          id: 'hsc_e_1',
          topicTitle: 'Unit 1: Two Gentlemen of Verona & The Castle (A.J. Cronin & Edwin Muir)',
          subtopic: 'Sacrifice, War devastation, Betrayal & Modal Auxiliaries (ought to, used to)',
          dayNumber: 2,
          periodNumber: 2,
          keyFormulaOrLaw:
            'A.J. Cronin: "War produced suffering, but their selfless devotion gave promise of greater hope for human society."',
          keyPoints: [
            'Verona is a historical city in Italy where Romeo and Juliet lived',
            'The Castle theme: Greed and betrayal undermine the strongest fortifications'
          ],
          type: 'concept',
          importance: 'High-Yield'
        }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Unit 2: Prose (*A Nice Cup of Tea*) & Poem (*Our Casuarina Tree*)',
      description:
        'George Orwell\'s 11 rules for preparing tea, Toru Dutt romantic poem "Our Casuarina Tree", Prepositions & Compound Words',
      subtopics: [
        {
          id: 'hsc_e_sub2',
          title: 'Unit 2: Cultural Rituals & Nostalgia',
          microTopics: [
            {
              id: 'hsc_e_3',
              title: 'Prose: A Nice Cup of Tea by George Orwell (11 Golden Rules)',
              keyAxiom: 'Indian/Ceylonese tea in a teapot without sugar gives pure flavour'
            },
            {
              id: 'hsc_e_4',
              title: 'Poem: Our Casuarina Tree by Toru Dutt (Keatsian imagery)',
              keyAxiom:
                "Tree stands as a living memorial to poet's beloved departed siblings Abju and Aru"
            }
          ]
        }
      ],
      microTopics: [
        {
          id: 'hsc_e_3',
          topicTitle: 'Unit 2: George Orwell Cup of Tea & Toru Dutt Casuarina Tree',
          subtopic: '11 Rules of tea brewing, Casuarina nostalgia & Compound Word synthesis',
          dayNumber: 5,
          periodNumber: 2,
          keyFormulaOrLaw:
            'Toru Dutt: "A creeper climbs, in whose embraces bound, No other tree could live..."',
          keyPoints: [
            'George Orwell was the pen name of Eric Arthur Blair (author of 1984 and Animal Farm)',
            'Toru Dutt is known as the Keats of Indo-Anglian literature'
          ],
          type: 'memorization',
          importance: 'High-Yield'
        }
      ]
    }
  ];
  const subjects: SyllabusSubject[] = [
    {
      subjectId: 'hsc_tamil',
      subjectName: 'பொதுத் தமிழ் (General Tamil — HSC 8 இயல்கள்)',
      icon: ' ',
      color: '#ec4899',
      totalChapters: generalTamilChapters.length,
      totalMicroTopics: generalTamilChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0),
      chapters: generalTamilChapters
    },
    {
      subjectId: 'hsc_english',
      subjectName: 'General English (HSC Units 1 to 6 Core)',
      icon: '🔤',
      color: '#3b82f6',
      totalChapters: generalEnglishChapters.length,
      totalMicroTopics: generalEnglishChapters.reduce(
        (a, c) => a + (c.microTopics?.length || 0),
        0
      ),
      chapters: generalEnglishChapters
    },
    {
      subjectId: 'hsc_physics',
      subjectName: isTa
        ? 'இயற்பியல் (Physics Core — HSC / Board)'
        : 'Physics (Senior Secondary Core)',
      icon: '⚡',
      color: '#06b6d4',
      totalChapters: physicsChapters.length,
      totalMicroTopics: physicsChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0),
      chapters: physicsChapters
    },
    {
      subjectId: 'hsc_chemistry',
      subjectName: isTa
        ? 'வ இதியியல் (Chemistry Core — HSC / Board)'
        : 'Chemistry (Senior Secondary Core)',
      icon: 'ட ',
      color: '#10b981',
      totalChapters: chemistryChapters.length,
      totalMicroTopics: chemistryChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0),
      chapters: chemistryChapters
    },
    {
      subjectId: 'hsc_mathematics',
      subjectName: isTa
        ? 'கணிதம் (Mathematics Core — HSC / Board)'
        : 'Mathematics (Senior Secondary Calculus & Vectors)',
      icon: 'டஒ ',
      color: '#f59e0b',
      totalChapters: mathematicsChapters.length,
      totalMicroTopics: mathematicsChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0),
      chapters: mathematicsChapters
    }
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
    totalMicroTopics: subjects.reduce(
      (a, s) =>
        a +
        (s.totalMicroTopics ||
          s.chapters.reduce((acc, c) => acc + (c.microTopics?.length || 0), 0)),
      0
    ),
    subjects
  };
}

export function getCollegeAndTechSkillsCompleteSyllabus(
  courseId: string,
  courseTitle: string
): CourseFullSyllabus {
  const fullstackChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Frontend Engineering: React 19, TypeScript & Modern UI Architecture',
      description:
        'React components, JSX, Custom Hooks (useState, useEffect, useMemo, useCallback), Context API, React Navigation & TailwindCSS',
      subtopics: [
        {
          id: 'tech_fs_sub1',
          title: 'React 19 Core & Hook Architecture',
          microTopics: [
            {
              id: 'tech_fs_1',
              title: 'React 19 Virtual DOM, Fiber Reconciliation & Custom Hooks',
              keyAxiom: 'Hooks must execute unconditionally at component top level'
            },
            {
              id: 'tech_fs_2',
              title: 'TypeScript Interfaces, Generics & Strict Null Typing',
              keyAxiom: 'Generics <T> allow reusable type-safe data pipelines'
            }
          ]
        }
      ],
      microTopics: [
        {
          id: 'tech_fs_1',
          topicTitle: 'Modern React Architecture: Virtual DOM, Hooks & State Management',
          subtopic:
            'Functional components, Reconciliation algorithm, Custom Hooks creation, Context API vs Redux Toolkit',
          dayNumber: 1,
          periodNumber: 1,
          keyFormulaOrLaw:
            'React Hook Rule: Only call hooks at the top level and from React function components',
          keyPoints: [
            'useCallback memoizes function references; useMemo memoizes computed values',
            'Virtual DOM diffing uses fiber tree reconciliation algorithm'
          ],
          type: 'concept',
          importance: 'High-Yield'
        },
        {
          id: 'tech_fs_2',
          topicTitle: 'TypeScript Mastery: Interfaces, Generics, Union Types & Strict Mode',
          subtopic:
            'Type inference, Generics <T>, Utility types (Partial, Pick, Omit), Strict null checks, React.FC typing',
          dayNumber: 4,
          periodNumber: 1,
          keyFormulaOrLaw: 'Generic Function: function identity<T>(arg: T): T { return arg; }',
          keyPoints: [
            'Type narrowing using typeof, instanceof, and custom type predicates',
            'Interfaces are open for declaration merging; type aliases are closed'
          ],
          type: 'solved_problem',
          importance: 'High-Yield'
        }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Backend Architecture: Node.js, Express, REST APIs & PostgreSQL',
      description:
        'Event Loop, Non-blocking I/O, Express routing middleware, PostgreSQL schema design, Supabase Auth, Row Level Security (RLS) & JWT',
      subtopics: [
        {
          id: 'tech_fs_sub2',
          title: 'Backend API & Database Engineering',
          microTopics: [
            {
              id: 'tech_fs_3',
              title: 'RESTful API Design, Express Middleware & JWT Auth',
              keyAxiom: 'Stateless JWT authentication with bcrypt password hashing'
            },
            {
              id: 'tech_fs_4',
              title: 'PostgreSQL ACID Transactions, Indexing & Row Level Security (RLS)',
              keyAxiom: 'PostgreSQL RLS enforces row isolation at database engine layer'
            }
          ]
        }
      ],
      microTopics: [
        {
          id: 'tech_fs_3',
          topicTitle: 'RESTful API Design, Express Middleware & JWT Authentication',
          subtopic:
            'HTTP Methods (GET, POST, PUT, DELETE), Status codes (200, 201, 400, 401, 403, 500), JWT token payload and verify',
          dayNumber: 7,
          periodNumber: 1,
          keyFormulaOrLaw:
            'JWT Structure: Header.Payload.Signature | Middleware: (req, res, next) => { next(); }',
          keyPoints: [
            'Always hash user passwords using bcrypt with salt rounds >= 10',
            'Express error handling middleware requires 4 parameters (err, req, res, next)'
          ],
          type: 'solved_problem',
          importance: 'High-Yield'
        },
        {
          id: 'tech_fs_4',
          topicTitle: 'Database Modeling: PostgreSQL, ACID Transactions & Indexing Optimization',
          subtopic:
            'Relational 3NF normalization, Foreign keys, B-Tree indexes, EXPLAIN ANALYZE query planning, Row Level Security (RLS)',
          dayNumber: 10,
          periodNumber: 1,
          keyFormulaOrLaw:
            'ACID Properties: Atomicity, Consistency, Isolation, Durability | Indexing: CREATE INDEX ON table(column)',
          keyPoints: [
            'Indexes drastically speed up WHERE and JOIN clauses but add write overhead',
            'PostgreSQL RLS policies restrict data access at the database engine level'
          ],
          type: 'solved_problem',
          importance: 'High-Yield'
        }
      ]
    }
  ];
  const pythonAiChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Python 3.12 Programming, Data Structures & Object-Oriented Design',
      description:
        'List comprehensions, Generators, Decorators, Dunder methods, Class inheritance, Polymorphism, Type hinting & Unit testing',
      subtopics: [
        {
          id: 'tech_py_sub1',
          title: 'Advanced Python Core & OOP',
          microTopics: [
            {
              id: 'tech_py_1',
              title: 'Decorators, Generators & Comprehensions Memory Efficiency',
              keyAxiom: 'Generators evaluate lazily on-demand with O(1) space'
            },
            {
              id: 'tech_py_2',
              title: 'OOP Design Patterns & Method Resolution Order (C3 MRO)',
              keyAxiom: 'Abstract base classes enforce strict interface contracts'
            }
          ]
        }
      ],
      microTopics: [
        {
          id: 'tech_py_1',
          topicTitle: 'Python Advanced Concepts: Decorators, Generators & Comprehensions',
          subtopic:
            'Function closures, @decorator syntax, yield statement memory efficiency, List/Dict/Set comprehensions',
          dayNumber: 2,
          periodNumber: 2,
          keyFormulaOrLaw:
            'Generator Expression: (x**2 for x in range(n)) | Decorator: def dec(func): def wrap(*a, **k): return func(*a, **k)',
          keyPoints: [
            'Generators produce items on the fly with O(1) memory footprint',
            'Decorators modify function behavior without altering source code'
          ],
          type: 'solved_problem',
          importance: 'High-Yield'
        },
        {
          id: 'tech_py_2',
          topicTitle: 'Object-Oriented Programming (OOP) in Python & Design Patterns',
          subtopic:
            'Classes, __init__, Inheritance, Method Resolution Order (MRO), Encapsulation, Singleton & Factory design patterns',
          dayNumber: 5,
          periodNumber: 2,
          keyFormulaOrLaw:
            'Python MRO: C3 Linearization algorithm for multiple inheritance resolution',
          keyPoints: [
            'Use @property decorator to define getter and setter methods cleanly',
            'Abstract Base Classes (abc module) enforce interface contracts'
          ],
          type: 'concept',
          importance: 'High-Yield'
        }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Data Science, Machine Learning (Scikit-Learn) & Generative AI',
      description:
        'NumPy vectorized arrays, Pandas DataFrame wrangling, Linear/Logistic Regression, Decision Trees, Prompt Engineering & LLM APIs',
      subtopics: [
        {
          id: 'tech_py_sub2',
          title: 'Data Science & LLM Engineering',
          microTopics: [
            {
              id: 'tech_py_3',
              title: 'NumPy Broadcasting & Pandas Aggregations',
              keyAxiom: 'Vectorized NumPy executes at C-speed without interpreter overhead'
            },
            {
              id: 'tech_py_4',
              title: 'Scikit-Learn ML Pipelines & Prompt Engineering / RAG Architecture',
              keyAxiom: 'RAG grounds LLM outputs using vector embeddings & semantic retrieval'
            }
          ]
        }
      ],
      microTopics: [
        {
          id: 'tech_py_3',
          topicTitle: 'NumPy Vectorization, Pandas Data Wrangling & Feature Engineering',
          subtopic:
            'Broadcasting rules, GroupBy aggregations, Handling missing data, MinMax/StandardScaler, One-Hot encoding',
          dayNumber: 8,
          periodNumber: 2,
          keyFormulaOrLaw:
            'Z-Score Standardization: z = (x - μ) / σ | Broadcasting: Trailing dimensions must be equal or 1',
          keyPoints: [
            'Vectorized NumPy operations execute at C-speed without Python loop overhead',
            'Pandas DataFrame merge operates similarly to SQL JOIN operations'
          ],
          type: 'solved_problem',
          importance: 'High-Yield'
        },
        {
          id: 'tech_py_4',
          topicTitle: 'Machine Learning Algorithms & Large Language Model (LLM) Integration',
          subtopic:
            'Supervised vs Unsupervised learning, Train/Test split, Confusion matrix metrics (Precision, Recall, F1), Prompt Engineering with Gemini/GPT APIs',
          dayNumber: 12,
          periodNumber: 2,
          keyFormulaOrLaw:
            'F1-Score = 2 × (Precision × Recall) / (Precision + Recall) | Confusion Matrix: TP, TN, FP, FN',
          keyPoints: [
            'Overfitting occurs when model memorizes training noise; mitigate with Regularization (L1/L2)',
            'Few-shot prompting provides input-output examples to guide LLM reasoning reliably'
          ],
          type: 'solved_problem',
          importance: 'High-Yield'
        }
      ]
    }
  ];
  const dsaChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Data Structures: Arrays, Linked Lists, Stacks, Queues & Hash Tables',
      description:
        'Time/Space Big-O complexity analysis, Two pointers, Sliding window, Singly/Doubly Linked List, Stack operations, Hash collision resolution',
      subtopics: [
        {
          id: 'tech_dsa_sub1',
          title: 'Linear Data Structures & Two-Pointers',
          microTopics: [
            {
              id: 'tech_dsa_1',
              title: 'Big-O Asymptotics, Two Pointers & Sliding Window Patterns',
              keyAxiom: 'Sliding window converts quadratic O(N²) iterations into linear O(N)'
            },
            {
              id: 'tech_dsa_2',
              title: 'Monotonic Stacks & Floyd Cycle Finding Algorithm',
              keyAxiom: 'Floyd Tortoise and Hare detects cycles with O(1) auxiliary space'
            }
          ]
        }
      ],
      microTopics: [
        {
          id: 'tech_dsa_1',
          topicTitle: 'Asymptotic Analysis (Big-O) & Two-Pointer / Sliding Window Techniques',
          subtopic:
            'O(1), O(log n), O(n), O(n log n), O(n²) complexity, Invert array in-place, Two-Sum sorted, Maximum subarray sum (Kadane)',
          dayNumber: 3,
          periodNumber: 3,
          keyFormulaOrLaw:
            'Kadane Algorithm: max_so_far = max(nums[i], max_so_far + nums[i]) | Two Pointer: Left=0, Right=n-1',
          keyPoints: [
            'Sliding window optimizes nested loops from O(n²) to linear O(n) time',
            'Hash table lookup, insertion, and deletion operate in average O(1) time'
          ],
          type: 'solved_problem',
          importance: 'High-Yield'
        },
        {
          id: 'tech_dsa_2',
          topicTitle: 'Linked Lists, Stacks (Monotonic Stack) & Queue Implementations',
          subtopic:
            'Reverse linked list in-place, Fast & Slow pointer cycle detection (Floyd), Monotonic stack next greater element, Queue using two stacks',
          dayNumber: 6,
          periodNumber: 3,
          keyFormulaOrLaw:
            'Floyd Cycle Finding: slow moves 1 step, fast moves 2 steps; cycle exists if slow == fast',
          keyPoints: [
            'Reversing linked list requires 3 pointers (prev, curr, next)',
            'Monotonic stack solves range query problems in O(n) single-pass'
          ],
          type: 'solved_problem',
          importance: 'High-Yield'
        }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Algorithms: Trees, Graphs (BFS/DFS), Dynamic Programming & Recursion',
      description:
        'Binary Search Trees (BST), Tree traversals (Inorder, Preorder, Postorder), Graph adjacency list, Dijkstra shortest path, DP Memoization & Tabulation',
      subtopics: [
        {
          id: 'tech_dsa_sub2',
          title: 'Trees, Graphs & Dynamic Programming',
          microTopics: [
            {
              id: 'tech_dsa_3',
              title: 'BST Properties, Tree LCA & Graph BFS/DFS Traversals',
              keyAxiom:
                'Inorder traversal of Binary Search Tree yields monotonically sorted sequence'
            },
            {
              id: 'tech_dsa_4',
              title: 'Dynamic Programming: 0/1 Knapsack, LCS & State Memoization',
              keyAxiom: 'Optimal substructure and overlapping subproblems define DP'
            }
          ]
        }
      ],
      microTopics: [
        {
          id: 'tech_dsa_3',
          topicTitle: 'Binary Trees, BST Operations & Graph Traversals (BFS / DFS)',
          subtopic:
            'Inorder traversal of BST gives sorted order, Lowest Common Ancestor (LCA), Graph BFS (Queue) and DFS (Recursion/Stack), Topological Sort',
          dayNumber: 9,
          periodNumber: 3,
          keyFormulaOrLaw:
            'BFS: Queue-based level-order traversal | DFS: Stack/Recursive deep-dive traversal | BST Property: Left < Root < Right',
          keyPoints: [
            'BFS finds shortest path in an unweighted graph',
            'Topological sort is applicable only to Directed Acyclic Graphs (DAGs)'
          ],
          type: 'solved_problem',
          importance: 'High-Yield'
        },
        {
          id: 'tech_dsa_4',
          topicTitle: 'Dynamic Programming (DP): 0/1 Knapsack, LCS & Coin Change',
          subtopic:
            'Overlapping subproblems & optimal substructure, Top-down memoization vs Bottom-up tabulation, Longest Common Subsequence (LCS), Coin change',
          dayNumber: 13,
          periodNumber: 3,
          keyFormulaOrLaw:
            '0/1 Knapsack Recurrence: dp[i][w] = max(dp[i-1][w], val[i-1] + dp[i-1][w - wt[i-1]])',
          keyPoints: [
            'Identify DP state variables and base cases before constructing recurrence relation',
            'Space optimization can often reduce 2D DP matrix to 1D array'
          ],
          type: 'solved_problem',
          importance: 'High-Yield'
        }
      ]
    }
  ];
  const subjects: SyllabusSubject[] = [
    {
      subjectId: 'tech_fullstack',
      subjectName: 'Full-Stack Web & Mobile Architecture (React, Node, TypeScript)',
      icon: '💻',
      color: '#06b6d4',
      totalChapters: fullstackChapters.length,
      totalMicroTopics: fullstackChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0),
      chapters: fullstackChapters
    },
    {
      subjectId: 'tech_python_ai',
      subjectName: 'Python 3.12, Data Science & Generative AI Engineering',
      icon: 'ðடஐ',
      color: '#10b981',
      totalChapters: pythonAiChapters.length,
      totalMicroTopics: pythonAiChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0),
      chapters: pythonAiChapters
    },
    {
      subjectId: 'tech_dsa',
      subjectName: 'Data Structures & Algorithms (LeetCode Master Patterns)',
      icon: '⚡',
      color: '#8b5cf6',
      totalChapters: dsaChapters.length,
      totalMicroTopics: dsaChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0),
      chapters: dsaChapters
    }
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
    totalMicroTopics: subjects.reduce(
      (a, s) => a + s.chapters.reduce((acc, c) => acc + (c.microTopics?.length || 0), 0),
      0
    ),
    subjects
  };
}

export function getTamilNaduPoliceCompleteSyllabus(
  courseId?: string,
  courseTitle?: string
): CourseFullSyllabus {
  const tamilEligibilityChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'பகுதி அ: தமிழ் இலக்கணம் (10 ஆம் வகுப்பு தரம் — 100 வினாக்கள் தகுதி)',
      description:
        'பொருத்துதல், பிரித்தெழுதுதல், எதிர்ச்சொல், பிழை திருத்தம் (சந்திப்பிழை, ஒருமை பன்மை), வேர்ச்சொல், அகரவரிசை',
      subtopics: [
        {
          id: 'pol_t_sub1',
          title: 'இலக்கண விதிகள் & சொல் வகை',
          microTopics: [
            {
              id: 'pol_t_1',
              title: 'பிரித்தெழுதுதல், சேர்த்தெழுதுதல் & எதிர்ச்சொல் அறிதல்',
              keyAxiom: 'உயிரெழுத்து உ டம்ப டுமெய் சந்தி விதிகள்'
            },
            {
              id: 'pol_t_2',
              title: 'சந்திப்பிழை நீக்குதல் & மரபுப் பிழைகள்',
              keyAxiom: 'அந்த, இந்த, எந்த பின் வல்லினம் மி கும்'
            }
          ]
        }
      ],
      microTopics: [
        {
          id: 'pol_t_1',
          topicTitle: 'பிரித்தெழுதுதல், எதிர்ச்சொல், பிழை திருத்தம் & அகரவரிசை',
          subtopic:
            'சந்திப்பிழை ( க், ச், த், ப்) நீக்குதல் மற்றும் வேர்ச்சொல்லிலிருந்து வின ஈய ஆ ச் சம் காணுதல்',
          dayNumber: 1,
          periodNumber: 1,
          keyFormulaOrLaw:
            'வேர்ச்சொல் -> தொழிற்ப ஆயர் (ந ட -> ந டத்தல்) | ப ஆயர ஆ ச் சம் (ந டந்த) | வின ஈய ஆ ச் சம் (ந டந்து)',
          keyPoints: [
            'தமிழ் தகுதித் த இர்வில் 40% குறைந்தப ட் ச மதிப்பெண் க ட் டாயம்',
            'அகரவரிசைப்ப டுத்துதல்: அ, ஆ, இ வரிசை மற்றும் க, கா, கி வரிசை'
          ],
          type: 'solved_problem',
          importance: 'High-Yield'
        }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'பகுதி ஆ & இ: தமிழ் இலக்கியம் மற்றும் தமிழ் அறிஞர்கள்',
      description:
        'திருக்குறள், சிலப்பதி காரம், கம்பராமாயணம், பாரதியார், பாரதிதாசன், தந்த ஈ பெரியார், ப இரறி ஞர் அண்ணா',
      subtopics: [
        {
          id: 'pol_t_sub2',
          title: 'ச ங் க இலக்கியம் & கவி ஞர் கள்',
          microTopics: [
            {
              id: 'pol_t_3',
              title: 'திருக்குறள், எ ட் டுத்தொ க ஈ, பத்துப்பா ட் டு சிறப்பு கள்',
              keyAxiom: 'திருக்குறள் அறத்துப்பால், பொரு ட்பால், காமத்துப்பால் 133 அதி கார ங் கள்'
            },
            {
              id: 'pol_t_4',
              title: 'பாரதியார், பாரதிதாசன், பெரியார், அண்ணா தமிழ்த்தொண்டு',
              keyAxiom: 'பாரதியார் பா ட் டு க் கொரு புலவன் | பாரதிதாசன் புரட்சிக் கவிஞர்'
            }
          ]
        }
      ],
      microTopics: [
        {
          id: 'pol_t_3',
          topicTitle: 'திருக்குறள், கம்பராமாயணம், பாரதியார் & தந்த ஈ பெரியார் தமிழ்த்தொண்டு',
          subtopic: 'நூல் ஆசிரியர் கள், அடைமொழிப் ப ஆயர் கள் மற்றும் ம இற் கோள் வரி கள்',
          dayNumber: 4,
          periodNumber: 1,
          keyFormulaOrLaw:
            'பாரதியார் இதழ் கள்: இந்தியா, வி œயா | பாரதிதாசன்: கு டும்ப விள க் கு, பாண் டியன் பரி சு',
          keyPoints: [
            'திரு க் குறளு க் கு உரை எழுதிய பதின்மரில் சிறந்தவர் பரிம இலழ கர்',
            'தந்த ஈ பெரியார் ந டத்திய இதழ் கள்: கு டியர சு, விடுதலை'
          ],
          type: 'concept',
          importance: 'High-Yield'
        }
      ]
    }
  ];
  const generalKnowledgeChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'பொது அறிவு: வரலாறு, புவியியல் & இந்திய அர சியலம ஈப்பு',
      description:
        'சிந்து சமவ ஆளி, மௌரியர், சோழர், இந்திய விடுதலை இய க் கம், ஆறு கள், பருவமழை, இந்திய அர சியலம ஈப்பு அடிப்படை உரிம ஈ கள்',
      subtopics: [
        {
          id: 'pol_gk_sub1',
          title: 'வரலாறு & அர சியலம ஈப்பு',
          microTopics: [
            {
              id: 'pol_gk_1',
              title: 'சிந்து சமவ ஆளி, சோழர் ப இரர சு & விடுதலைப் போரா ட் டம்',
              keyAxiom: '1857 ப ஆரும் புரட்சி & 1947 இந்திய விடுதலை'
            },
            {
              id: 'pol_gk_2',
              title: 'அடிப்படை உரிம ஈ கள் (14–32), கு டியர சுத் தலைவர், ஆளுநர்',
              keyAxiom: 'சரத்து 32 அர சியலம ஈப்பின் இதயம் மற்றும் ஆன்மா'
            }
          ]
        }
      ],
      microTopics: [
        {
          id: 'pol_gk_1',
          topicTitle:
            'இந்திய விடுதலை இய க் கம், தமிழ க ப ங் கு & அர சியலம ஈப்பு அடிப்படை உரிம ஈ கள்',
          subtopic: 'வ இலுநா ச் சியார், வ. உ. சி, ப கத் சி ங், காந்திய டி கள் மற்றும் சரத்து 14–32',
          dayNumber: 2,
          periodNumber: 2,
          keyFormulaOrLaw:
            'அர சியலம ஈப்பு ந ட ஈமுறை: 26 œனவரி 1950 | ச ட் டத்தின் முன் அன ஈவரும் சமம்: சரத்து 14',
          keyPoints: [
            'தமிழ்நா டு காவல் துற ஈ சின்னம்: ஸ்ரீவில்லிபுத்தூர் கோவில் கோபுரம்',
            'காவல்துற ஈ அம ஈப்பின் தந்த ஈ என அழ ஈ க் கப்ப டுபவர் காரன்வாலிஸ் பிரபு'
          ],
          type: 'concept',
          importance: 'High-Yield'
        }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'பொது அறிவியல்: அன்றா ட வாழ்வில் இயற்பியல், வ இதியியல் & உயிரியல்',
      description:
        'இய க் க விதிகள், ஒளி- ஒலி, அமில ங் கள்- கார ங் கள், தனிம ங் கள், மனித உடல் உறுப்பு மண்டலங்கள், வைட்டமின் குறைபா டு கள்',
      subtopics: [
        {
          id: 'pol_gk_sub2',
          title: 'பொது அறிவியல் விதிகள்',
          microTopics: [
            {
              id: 'pol_gk_3',
              title: 'நிய₹ ட் டன் 3 விதிகள், ல ஆன்ஸ், மின்னோ ட் டம் & வ இதியியல் கார ங் கள்',
              keyAxiom: 'வி ச ஈ F = ma | அமில ங் கள் நீல லி ட்மஸ ஈ சிவப்பா க மாற்றும்'
            },
            {
              id: 'pol_gk_4',
              title: 'மனித செரிமானம், ரத்த ஓட்டம் & வைட்டமின்கள் குறைபா டு',
              keyAxiom: 'வைட்டமின் A (மாலை க் கண்), வைட்டமின் C (ஸ் கர்வி)'
            }
          ]
        }
      ],
      microTopics: [
        {
          id: 'pol_gk_3',
          topicTitle: 'நிய₹ ட் டன் விதிகள் (F=ma), அமில ங் கள் கார ங் கள் & வைட்டமின்கள்',
          subtopic: 'இயற்பியல் அலகுகள் (SI Units), தனிம ங் களின் குறியீ டு கள், ரத்த வகைகள் (ABO)',
          dayNumber: 5,
          periodNumber: 2,
          keyFormulaOrLaw:
            'F = ma | ரத்தத்தின் pH மதிப்பு = 7.4 | அன ஈவரு க் கும் ரத்தம் வழ ங் கும் பிரிவு: O ந ஆ க ட் டிவ்',
          keyPoints: [
            'மனித உ டலின் மி கப்பெரிய உறுப்பு தோல்; மி கப்பெரிய சுரப்பி கல்லீரல்',
            'வைட்டமின் D ச₹ரிய ஒளியின் மூலம் உ டலில் தயாரா கிறது'
          ],
          type: 'solved_problem',
          importance: 'High-Yield'
        }
      ]
    }
  ];
  const psychologyChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'உளவியல்: த கவல் தொ டர்புத் திறன் & எண் கணித நுண்ணறிவு',
      description:
        'எண் தொ டர், விடுப ட் ட எழுத்துக்கள், குறியீ ட் டு முறை (Coding-Decoding), இரத்த உறவு கள், தி ச ஈ அறிதல் சோதன ஈ கள்',
      subtopics: [
        {
          id: 'pol_psy_sub1',
          title: 'எண் கணிதம் & குறியீ ட் டு முறை',
          microTopics: [
            {
              id: 'pol_psy_1',
              title: 'எண் தொ டர் & குறியீ ட் டு முறை (Coding-Decoding)',
              keyAxiom: 'A=1 to Z=26 எண் மதிப்பீ டு கள்'
            },
            {
              id: 'pol_psy_2',
              title: 'இரத்த உறவு கள் & தி ச ஈ அறிதல் (வ ட க் கு, கிழ க் கு, த ஆற் கு, ம இற் கு)',
              keyAxiom: 'பிதா கரஸ் த இற்றம் வழி தூரம் கண க் கி டுதல்'
            }
          ]
        }
      ],
      microTopics: [
        {
          id: 'pol_psy_1',
          topicTitle: 'எண் தொ டர், Coding-Decoding, இரத்த உறவு கள் & தி ச ஈ அறிதல்',
          subtopic: 'தி ச ஈ கணக்கீடுகள், உறவுமுறை வரைபடம் மற்றும் விடுப ட் ட எண் கண் டறிதல்',
          dayNumber: 3,
          periodNumber: 3,
          keyFormulaOrLaw:
            'தி ச ஈ தூரம் = ஈச(வ ட க் கு + கிழ க் கு ) | குறியீ ட் டு முறை: +1, -1, தலை கீழ் எழுத்துக்கள்',
          keyPoints: [
            'இரத்த உறவு களில் தந்த ஈ வழி vs தாய் வழி உறவுமுறை கள ஈ த ஆளிவா க பிரி க் கவும்',
            'க டி கார மு ட் களின் கோணம்: θ = |30H - (11/2)M|'
          ],
          type: 'solved_problem',
          importance: 'High-Yield'
        }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'தர்க்கப் பகுப்பாய்வு & வரைபடத் தொடர்பு (Logical Reasoning)',
      description:
        'வென் வரைபடங்கள், பகடை கணக்குகள், கண்ணாடி பிம்பங்கள், இருக்கை அமைப்பு முறை, நேரமும் வேலையும்',
      subtopics: [
        {
          id: 'pol_psy_sub2',
          title: 'தர்க்கப் பகுப்பாய்வு & உருவங்கள்',
          microTopics: [
            {
              id: 'pol_psy_3',
              title: 'வ ஆன் வரைபடங்கள் & ப க ட ஈ எதிர்ப்ப க் க ங் கள்',
              keyAxiom: 'ப க ட ஈயின் அ டுத்த டுத்த ப க் க ங் கள் எதிர் ப க் கமா க அம ஈயாது'
            },
            {
              id: 'pol_psy_4',
              title: 'காலமும் வ இலையும் (Men Days) & இரு க் க ஈ அம ஈப்பு',
              keyAxiom: 'M1 D1 = M2 D2 ச₹த்திரம்'
            }
          ]
        }
      ],
      microTopics: [
        {
          id: 'pol_psy_3',
          topicTitle: 'வ ஆன் வரைபடம், ப க ட ஈ, கண்ணா டி பிம்பம் & காலமும் வ இலையும்',
          subtopic: 'M₹ D₹ = M₹₹D₹₹ மற்றும் வ ட் டவ டிவ இரு க் க ஈ அம ஈப்பு கணக்கீடுகள்',
          dayNumber: 6,
          periodNumber: 3,
          keyFormulaOrLaw:
            'வ இலை: 1 நாளில் செய்த வ இலை = 1/N | ப க ட ஈ விதி: பொதுவான எண் கொண் ட இரு நிலைகள்',
          keyPoints: [
            'வ ஆன் வரைப டத்தில் பொதுவான பகுதி வ ஆ ட் டுப்பகுதிய ஈ குறி க் கும்',
            'கண்ணா டி பிம்பத்தில் இ டது-வலது மட்டுமே மாறும்; ம இல்- கீழ் மாறாது'
          ],
          type: 'solved_problem',
          importance: 'High-Yield'
        }
      ]
    }
  ];
  const subjects: SyllabusSubject[] = [
    {
      subjectId: 'pol_tamil',
      subjectName: 'தமிழ் மொழித் தகுதித் த இர்வு (Tamil Eligibility — 100 Marks)',
      icon: ' ',
      color: '#ec4899',
      totalChapters: tamilEligibilityChapters.length,
      totalMicroTopics: tamilEligibilityChapters.reduce(
        (a, c) => a + (c.microTopics?.length || 0),
        0
      ),
      chapters: tamilEligibilityChapters
    },
    {
      subjectId: 'pol_gk',
      subjectName: 'பொது அறிவு & அறிவியல் (General Knowledge & Science Core)',
      icon: 'ட ›️',
      color: '#06b6d4',
      totalChapters: generalKnowledgeChapters.length,
      totalMicroTopics: generalKnowledgeChapters.reduce(
        (a, c) => a + (c.microTopics?.length || 0),
        0
      ),
      chapters: generalKnowledgeChapters
    },
    {
      subjectId: 'pol_psy',
      subjectName: 'உளவியல் & தர் க் க க் காரணவியல் (Psychology & Logical Analysis)',
      icon: 'ட ',
      color: '#8b5cf6',
      totalChapters: psychologyChapters.length,
      totalMicroTopics: psychologyChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0),
      chapters: psychologyChapters
    }
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
    totalMicroTopics: subjects.reduce(
      (a, s) => a + s.chapters.reduce((acc, c) => acc + (c.microTopics?.length || 0), 0),
      0
    ),
    subjects
  };
}

export function getBankingAndInsuranceCompleteSyllabus(
  courseId?: string,
  courseTitle?: string
): CourseFullSyllabus {
  const quantChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Speed Maths, Simplification, Number Series & Quadratic Equations',
      description:
        'Vedic squaring, percentage-fraction equivalence, missing & wrong number series, factorization inequalities (x, y comparison)',
      subtopics: [
        {
          id: 'bank_q_sub1',
          title: 'Speed Calculations & Inequalities',
          microTopics: [
            {
              id: 'bank_q_1',
              title: 'Percentage Fractions (1/2 to 1/20) & BODMAS Approximation',
              keyAxiom: 'Fraction equivalents: 1/8=12.5%, 1/7=14.28%, 1/6=16.66%'
            },
            {
              id: 'bank_q_2',
              title: 'Quadratic Equation Sign Method (ax² + bx + c = 0)',
              keyAxiom: 'Constant negative in both equations gives No Relation (CND)'
            }
          ]
        }
      ],
      microTopics: [
        {
          id: 'bank_q_1',
          topicTitle: 'Speed Maths: Percentage-Fractions, Series & Quadratic Sign Method',
          subtopic:
            'Approximations, Arithmetic/Geometric number series, Quadratic root comparison (x > y, x < y, CND)',
          dayNumber: 1,
          periodNumber: 1,
          keyFormulaOrLaw:
            'Sign Rule: If constant term (c) is negative in both equations, answer is always x = y or CND',
          keyPoints: [
            '1/12 = 8.33%, 1/14 = 7.14%, 1/16 = 6.25%',
            'Pattern identification in difference of differences'
          ],
          type: 'solved_problem',
          importance: 'High-Yield'
        }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Data Interpretation (DI) Master & Arithmetic Word Problems',
      description:
        'Pie Charts, Bar Graphs, Caselet DI, Missing DI, Profit & Loss, Simple & Compound Interest, Time & Work, Speed-Distance',
      subtopics: [
        {
          id: 'bank_q_sub2',
          title: 'Data Interpretation & Arithmetic',
          microTopics: [
            {
              id: 'bank_q_3',
              title: 'Caselet DI & Double Pie Chart Analysis',
              keyAxiom: 'Venn-diagram based caselet variable isolation'
            },
            {
              id: 'bank_q_4',
              title: 'CI - SI Difference & Mixture Alligation Rule',
              keyAxiom: '2-Year Difference = P(R/100)² | Alligation: (c - m)/(m - d)'
            }
          ]
        }
      ],
      microTopics: [
        {
          id: 'bank_q_3',
          topicTitle: 'High-Level DI (Caselet, Pie, Radar) & Arithmetic Word Problems',
          subtopic: 'CI-SI difference formulas, Alligation rule, Relative speed (Train & Boats)',
          dayNumber: 4,
          periodNumber: 1,
          keyFormulaOrLaw:
            '2-Year CI-SI Diff: D₹₹ = P(R/100)² | 3-Year Diff: D₹ஃ = P(R/100)² × (300+R)/100',
          keyPoints: [
            'Boat downstream = u + v; Upstream = u - v',
            'Work equivalence: Total Work = LCM of individual days taken'
          ],
          type: 'solved_problem',
          importance: 'High-Yield'
        }
      ]
    }
  ];
  const reasoningChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Puzzles & Seating Arrangements (Floor, Box, Circular, Parallel Rows)',
      description:
        'Floor & Flat puzzles, 8-person circular facing inside/outside, Parallel row seating with blood relations, Box stack puzzles',
      subtopics: [
        {
          id: 'bank_r_sub1',
          title: 'Seating Arrangements & Puzzles',
          microTopics: [
            {
              id: 'bank_r_1',
              title: 'Floor-Flat & Box Stack Variable Puzzles',
              keyAxiom: 'Create 2 parallel possibilities table to eliminate invalid conditions'
            },
            {
              id: 'bank_r_2',
              title: 'Circular & Linear Seating facing Inward/Outward',
              keyAxiom: 'Fix definite position with maximum interconnecting clues'
            }
          ]
        }
      ],
      microTopics: [
        {
          id: 'bank_r_1',
          topicTitle: 'Mains-Level Puzzles (Floor-Flat, Year-Based, Uncertain Linear Row)',
          subtopic: 'Multi-variable seating arrangement with systematic thread/table method',
          dayNumber: 2,
          periodNumber: 2,
          keyFormulaOrLaw:
            'Case Elimination: Draw Case A and Case B simultaneously to discard contradictions rapidly',
          keyPoints: [
            'Uncertain row: Start with elements having fixed directional limits',
            'Floor-Flat: Note odd/even flat numbers explicitly'
          ],
          type: 'solved_problem',
          importance: 'High-Yield'
        }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Logical Deduction: Syllogisms ("Only a Few"), Inequalities & Machine Input',
      description:
        'Reverse Syllogisms, "Only a few A are B", Coded Inequalities, Direction distance, Coded Blood Relations, Machine Input-Output',
      subtopics: [
        {
          id: 'bank_r_sub2',
          title: 'Logical Deduction & Machine Input',
          microTopics: [
            {
              id: 'bank_r_3',
              title: '"Only a few" Syllogisms (Some + Some Not)',
              keyAxiom: '"Only a few A are B" means Some A are B AND Some A are NOT B'
            },
            {
              id: 'bank_r_4',
              title: 'Machine Input-Output Step Shifting Logic',
              keyAxiom: 'Ascending/descending alphanumeric sorting patterns'
            }
          ]
        }
      ],
      microTopics: [
        {
          id: 'bank_r_3',
          topicTitle: 'Syllogisms ("Only a Few"), Coded Inequalities & Step-by-Step Input-Output',
          subtopic: 'Some + Some Not venn deductions, Coded blood relation tree',
          dayNumber: 5,
          periodNumber: 2,
          keyFormulaOrLaw: 'Rule: "Only A is B" = "All B are A" (and B cannot be anything else)',
          keyPoints: [
            'Either-Or condition requires same subjects/predicates with complementary pair',
            'Input-output: trace alphabetical vowel/consonant count alongside number reversals'
          ],
          type: 'solved_problem',
          importance: 'High-Yield'
        }
      ]
    }
  ];
  const englishChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Reading Comprehension, Error Spotting, Cloze Test & Para Jumbles',
      description:
        'Banking/Economy editorial passages, Grammar rules (Subject-verb, Prepositions), Cloze test contextual word choice, Sentence rearrangement',
      subtopics: [
        {
          id: 'bank_e_sub1',
          title: 'Reading Comprehension & Grammar',
          microTopics: [
            {
              id: 'bank_e_1',
              title: 'Editorial Reading Comprehension & Tone Analysis',
              keyAxiom: 'Locate pivot words (However, Nonetheless, Despite) for main argument'
            },
            {
              id: 'bank_e_2',
              title: '120 Rules of English Grammar for Error Detection',
              keyAxiom: 'No sooner... than, Scarcely... when, Not only... but also'
            }
          ]
        }
      ],
      microTopics: [
        {
          id: 'bank_e_1',
          topicTitle: 'Reading Comprehension Tone, Cloze Test & Inversion Grammar Rules',
          subtopic: 'Inversion: "Hardly had I...", Subject-Verb Agreement with collective nouns',
          dayNumber: 3,
          periodNumber: 3,
          keyFormulaOrLaw:
            'Rule: Scarcely/Hardly had + S + V3... WHEN | No Sooner had + S + V3... THAN',
          keyPoints: [
            'Para Jumbles: Look for mandatory noun-pronoun opening pairs',
            'Cloze test: check positive vs negative connotation of surrounding sentences'
          ],
          type: 'solved_problem',
          importance: 'High-Yield'
        }
      ]
    }
  ];
  const bankingAwarenessChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'RBI Monetary Policy, Banking Structure & Digital Payments',
      description:
        'CRR, SLR, Repo, Reverse Repo, SDF, MSF, Basel III capital adequacy, NPA classification (SMA-0, 1, 2), SARFAESI Act, UPI, CBDC (e-Rupee)',
      subtopics: [
        {
          id: 'bank_ga_sub1',
          title: 'Banking & Financial Architecture',
          microTopics: [
            {
              id: 'bank_ga_1',
              title: 'RBI Monetary Policy Instruments & Liquidity Ratios',
              keyAxiom: 'CRR kept with RBI in cash; SLR kept in gold/govt securities'
            },
            {
              id: 'bank_ga_2',
              title: 'NPA Norms (90 days default), IBC 2016 & Digital UPI 2.0',
              keyAxiom: 'Substandard -> Doubtful -> Loss asset classification timeline'
            }
          ]
        }
      ],
      microTopics: [
        {
          id: 'bank_ga_1',
          topicTitle: 'RBI Policy Rates, Priority Sector Lending (PSL) & NPA Norms',
          subtopic:
            'Repo rate, 40% PSL target for commercial banks, DICGC insurance limit (₹¹5 Lakhs)',
          dayNumber: 6,
          periodNumber: 3,
          keyFormulaOrLaw:
            'DICGC Deposit Insurance = ₹¹5,000,000 per depositor per bank | PSL Target = 40% of ANBC',
          keyPoints: [
            'Payment Banks cannot issue credit cards or advance loans (can accept deposits up to ₹¹2 Lakh)',
            'Small Finance Banks have 75% PSL requirement'
          ],
          type: 'concept',
          importance: 'High-Yield'
        }
      ]
    }
  ];
  const subjects: SyllabusSubject[] = [
    {
      subjectId: 'bank_quant',
      subjectName: 'Quantitative Aptitude & Advanced DI (Banking)',
      icon: '🔢',
      color: '#06b6d4',
      totalChapters: quantChapters.length,
      totalMicroTopics: quantChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0),
      chapters: quantChapters
    },
    {
      subjectId: 'bank_reasoning',
      subjectName: 'Reasoning Ability & Complex Puzzles',
      icon: '🧩',
      color: '#8b5cf6',
      totalChapters: reasoningChapters.length,
      totalMicroTopics: reasoningChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0),
      chapters: reasoningChapters
    },
    {
      subjectId: 'bank_english',
      subjectName: 'English Language & Verbal Ability',
      icon: '📖',
      color: '#3b82f6',
      totalChapters: englishChapters.length,
      totalMicroTopics: englishChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0),
      chapters: englishChapters
    },
    {
      subjectId: 'bank_ga',
      subjectName: 'Banking Awareness, Financial Systems & Current Affairs',
      icon: 'ðடஏ›ï¸ஏ',
      color: '#10b981',
      totalChapters: bankingAwarenessChapters.length,
      totalMicroTopics: bankingAwarenessChapters.reduce(
        (a, c) => a + (c.microTopics?.length || 0),
        0
      ),
      chapters: bankingAwarenessChapters
    }
  ];
  return {
    courseId: courseId || 'exam-bank-po',
    courseTitle:
      courseTitle || 'Banking & Insurance (IBPS, SBI PO/Clerk, RBI Assistant) Master Blueprint',
    category: 'banking',
    board: 'IBPS / SBI / RBI',
    medium: 'English / Tamil',
    totalDays: 180,
    totalSubjects: subjects.length,
    totalChapters: subjects.reduce((a, s) => a + s.chapters.length, 0),
    totalMicroTopics: subjects.reduce(
      (a, s) => a + s.chapters.reduce((acc, c) => acc + (c.microTopics?.length || 0), 0),
      0
    ),
    subjects
  };
}

export function getSscAndRailwayCompleteSyllabus(
  courseId?: string,
  courseTitle?: string
): CourseFullSyllabus {
  const quantChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Advance Mathematics: Geometry, Trigonometry, Mensuration & Algebra',
      description:
        'Triangle centers (Centroid, Incenter, Circumcenter, Orthocenter), Circle tangent theorems, Trigonometric identities, 2D/3D surface area & volume',
      subtopics: [
        {
          id: 'ssc_q_sub1',
          title: 'Advance Geometry & Trigonometry',
          microTopics: [
            {
              id: 'ssc_q_1',
              title: 'Triangle Centers & Circle Tangent Theorems',
              keyAxiom: 'Inradius r = Area / Semi-perimeter | Circumradius R = abc / 4Δ'
            },
            {
              id: 'ssc_q_2',
              title: 'Trigonometry Maxima/Minima & Heights/Distances',
              keyAxiom: 'a sin θ + b cos θ has max value √(a² + b²)'
            }
          ]
        }
      ],
      microTopics: [
        {
          id: 'ssc_q_1',
          topicTitle: 'Circle Theorems (Alternate Segment), Triangle Centers & Trigonometry Maxima',
          subtopic: 'Incenter angle = 90° + A/2, Circumcenter angle = 2A, Tangent PA × PB = PT²',
          dayNumber: 1,
          periodNumber: 1,
          keyFormulaOrLaw:
            'Alternate Segment Theorem | Incenter: ஈ BIC = 90° + ஈ A/2 | Secant: PA · PB = PT²',
          keyPoints: [
            'Centroid divides median in 2:1 ratio',
            'Sum of interior angles of n-sided polygon = (n - 2) × 180°'
          ],
          type: 'solved_problem',
          importance: 'High-Yield'
        }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Arithmetic & Commercial Maths (Percentage, Ratio, Time-Work, Speed-Distance)',
      description:
        'Successive percentage changes, Dishonest shopkeeper profit, Compound interest installments, Relative speed, Train crossing platform',
      subtopics: [
        {
          id: 'ssc_q_sub2',
          title: 'Commercial Arithmetic',
          microTopics: [
            {
              id: 'ssc_q_3',
              title: 'Successive Percentage & Dishonest Shopkeeper',
              keyAxiom: 'Net Change = a + b + (ab/100)'
            },
            {
              id: 'ssc_q_4',
              title: 'Train Speed-Distance & Relative Motion',
              keyAxiom: 'Time to cross platform = (Train Length + Platform Length) / Speed'
            }
          ]
        }
      ],
      microTopics: [
        {
          id: 'ssc_q_3',
          topicTitle: 'Dishonest Dealer, CI Installments & Train Speed Problems',
          subtopic: 'Weight fraud % profit, Equal annual installment formula',
          dayNumber: 4,
          periodNumber: 1,
          keyFormulaOrLaw: 'Installment P = x/(1+r/100) + x/(1+r/100)² | Net % = a + b + ab/100',
          keyPoints: [
            'Speed conversion: 1 km/h = 5/18 m/s',
            'Work formula: M₹ D₹ H₹ / W₹ = M₹₹ D₹₹ H₹₹ / W₹₹'
          ],
          type: 'solved_problem',
          importance: 'High-Yield'
        }
      ]
    }
  ];
  const reasoningChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'General Intelligence & Reasoning (Verbal & Non-Verbal)',
      description:
        'Analogies, Venn diagrams, Syllogisms, Paper folding/cutting, Cube & Dice, Embedded figures, Matrix, Mirror & Water images',
      subtopics: [
        {
          id: 'ssc_r_sub1',
          title: 'Reasoning & Non-Verbal Logic',
          microTopics: [
            {
              id: 'ssc_r_1',
              title: 'Analogies, Classification & Odd One Out',
              keyAxiom: 'Alphabet place values & prime number patterns'
            },
            {
              id: 'ssc_r_2',
              title: 'Cube Folding, Dice Opposite Faces & Mirror Images',
              keyAxiom: 'Opposite faces on an unfolded cube are separated by exactly 1 square'
            }
          ]
        }
      ],
      microTopics: [
        {
          id: 'ssc_r_1',
          topicTitle: 'Dice Opposite Faces, Figure Counting (Triangles/Squares) & Venn Logic',
          subtopic: 'Formula for counting triangles in symmetric grids, Dice rotation rules',
          dayNumber: 2,
          periodNumber: 2,
          keyFormulaOrLaw:
            'Triangle Count in n-division grid: Total = n(n+1)/2 | Opposite faces on standard die sum to 7',
          keyPoints: [
            'Mirror reflection flips horizontal axis; Water reflection flips vertical axis',
            'Statement-Conclusion: Do not assume information beyond stated premise'
          ],
          type: 'solved_problem',
          importance: 'High-Yield'
        }
      ]
    }
  ];
  const englishChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'English Comprehension, Vocabulary, Idioms & Grammar Transformations',
      description:
        'One Word Substitutions, Idioms & Phrases, Active/Passive Voice transformations, Direct/Indirect Speech, Cloze test',
      subtopics: [
        {
          id: 'ssc_e_sub1',
          title: 'English Grammar & Vocabulary',
          microTopics: [
            {
              id: 'ssc_e_1',
              title: 'One Word Substitution (OWS) & High-Frequency Idioms',
              keyAxiom: 'Root words (Phil-, Mis-, -cide, -cracy, -ology)'
            },
            {
              id: 'ssc_e_2',
              title: 'Voice & Narration Conversion Rules',
              keyAxiom:
                'Never change tense in Active to Passive; Backshift tense in Direct to Indirect'
            }
          ]
        }
      ],
      microTopics: [
        {
          id: 'ssc_e_1',
          topicTitle: 'SSC High-Yield Idioms, One-Word Substitutions & Voice/Narration Rules',
          subtopic:
            'Root words, Passive of interrogative/imperative sentences, Reporting verb rules',
          dayNumber: 3,
          periodNumber: 3,
          keyFormulaOrLaw:
            'Passive Voice of Imperative: "Let + Object + be + V3" | "You are ordered/requested to + V1"',
          keyPoints: [
            'Uncountable nouns (Information, Furniture, Advice, Scenery) never take plural -s',
            'Both... and is correct pair; Both... as well as is grammatically incorrect'
          ],
          type: 'solved_problem',
          importance: 'High-Yield'
        }
      ]
    }
  ];
  const gsChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'General Awareness: History, Polity, Geography, Economy & NCERT Science',
      description:
        'Mughal Empire, Freedom Movement, Constitutional Articles, Indian Rivers, National Parks, Classical Dances, NCERT Physics/Chemistry/Biology',
      subtopics: [
        {
          id: 'ssc_ga_sub1',
          title: 'General Knowledge & Science',
          microTopics: [
            {
              id: 'ssc_ga_1',
              title: 'Indian History & Constitutional Articles (1 to 51A)',
              keyAxiom: 'Fundamental Rights (12-35), DPSPs (36-51), Fundamental Duties 51A'
            },
            {
              id: 'ssc_ga_2',
              title: 'General Science NCERT (Physics, Chemistry, Biology)',
              keyAxiom:
                'Units, Optics, Acids-Bases, Periodic Table, Cell organelles, Human diseases'
            }
          ]
        }
      ],
      microTopics: [
        {
          id: 'ssc_ga_1',
          topicTitle: 'Indian Polity Articles, Geography Rivers/Passes & NCERT Science Core',
          subtopic: 'Article 14–32, Major Mountain Passes (Zoji La, Nathu La), Human hormones',
          dayNumber: 5,
          periodNumber: 3,
          keyFormulaOrLaw:
            'Article 51A: 11 Fundamental Duties added by 42nd Amendment 1976 (Swaran Singh Committee)',
          keyPoints: [
            'Tropic of Cancer passes through 8 Indian states (Gujarat to Mizoram)',
            'Sound waves cannot travel through vacuum; light waves travel at 3 × 10¸ m/s'
          ],
          type: 'concept',
          importance: 'High-Yield'
        }
      ]
    }
  ];
  const subjects: SyllabusSubject[] = [
    {
      subjectId: 'ssc_quant',
      subjectName: 'Quantitative Aptitude & Pure Advance Maths',
      icon: '📐ஐ',
      color: '#06b6d4',
      totalChapters: quantChapters.length,
      totalMicroTopics: quantChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0),
      chapters: quantChapters
    },
    {
      subjectId: 'ssc_reasoning',
      subjectName: 'General Intelligence & Reasoning (Verbal / Non-Verbal)',
      icon: '🧩',
      color: '#8b5cf6',
      totalChapters: reasoningChapters.length,
      totalMicroTopics: reasoningChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0),
      chapters: reasoningChapters
    },
    {
      subjectId: 'ssc_english',
      subjectName: 'English Language & Comprehension',
      icon: '📖',
      color: '#3b82f6',
      totalChapters: englishChapters.length,
      totalMicroTopics: englishChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0),
      chapters: englishChapters
    },
    {
      subjectId: 'ssc_ga',
      subjectName: 'General Awareness & General Science Core',
      icon: 'ðடஏ›ï¸ஏ',
      color: '#10b981',
      totalChapters: gsChapters.length,
      totalMicroTopics: gsChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0),
      chapters: gsChapters
    }
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
    totalMicroTopics: subjects.reduce(
      (a, s) => a + s.chapters.reduce((acc, c) => acc + (c.microTopics?.length || 0), 0),
      0
    ),
    subjects
  };
}

export function getTrbAndTeacherExamsCompleteSyllabus(
  courseId?: string,
  courseTitle?: string
): CourseFullSyllabus {
  const childDevChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle:
        'Child Development & Learning Theories ( குழந்தை வளர்ச்சி மற்றும் கற்றல் கோட்பாடுகள்)',
      description:
        'Jean Piaget 4 Cognitive Stages, Lev Vygotsky ZPD & Scaffolding, Kohlberg Moral Stages, Erikson Psychosocial Stages',
      subtopics: [
        {
          id: 'trb_cd_sub1',
          title: 'வளர்ச்சி நிலைகள் & கற்றல் கோட்பாடுகள்',
          microTopics: [
            {
              id: 'trb_cd_1',
              title: 'பியாஜே (Piaget) அறிதிறன் வளர்ச்சி 4 நிலைகள்',
              keyAxiom: 'Sensorimotor (0-2), Preoperational (2-7), Concrete (7-11), Formal (11+)'
            },
            {
              id: 'trb_cd_2',
              title: 'வைகாட்ஸ்கி (Vygotsky) ZPD & சாரக்கட்டு (Scaffolding)',
              keyAxiom: 'Zone of Proximal Development: Gap between actual and guided capability'
            }
          ]
        }
      ],
      microTopics: [
        {
          id: 'trb_cd_1',
          topicTitle: 'பியாஜே 4 நிலைகள், வைகாட்ஸ்கி ZPD & கோல்பர்க் ஒழுக்க வளர்ச்சி',
          subtopic: 'அறிதிறன் வளர்ச்சி நிலைகள், சாரக்கட்டு (Scaffolding) மற்றும் மாரல் கோட்பாடுகள்',
          dayNumber: 1,
          periodNumber: 1,
          keyFormulaOrLaw:
            'Piaget 4 Stages: Sensorimotor -> Pre-operational -> Concrete Operational -> Formal Operational | Vygotsky: ZPD & MKO',
          keyPoints: [
            'Assimilation (உ ட் கிர கித்தல்) vs Accommodation (பொருத்துதல்)',
            'Scaffolding concept proposed by Jerome Bruner in Vygotskian framework'
          ],
          type: 'concept',
          importance: 'High-Yield'
        }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'நுண்ணறிவு, ஆளுமை, சிறப்பு குழந்தை களு க் கான கல்வி & RTE சட்டம்',
      description:
        'Gardner Multiple Intelligences (8 வகைகள்), Maslow Hierarchy of Needs, Inclusive Education, CWSN, RTE Act 2009 & NEP 2020',
      subtopics: [
        {
          id: 'trb_cd_sub2',
          title: 'நுண்ணறிவு & உள்ள ட க் கிய கல்வி',
          microTopics: [
            {
              id: 'trb_cd_3',
              title: 'ஹோவர் ட் கார் ட்னர் 8 வகை பல்வகை நுண்ணறிவு',
              keyAxiom:
                'Linguistic, Logical-Mathematical, Spatial, Bodily, Musical, Inter/Intra-personal, Naturalist'
            },
            {
              id: 'trb_cd_4',
              title: 'உள்ள ட க் கிய கல்வி (Inclusive Education) & RTE சட்டம் 2009',
              keyAxiom:
                'Section 12(1)(c) mandates 25% admission for disadvantaged children in private schools'
            }
          ]
        }
      ],
      microTopics: [
        {
          id: 'trb_cd_3',
          topicTitle: 'கார் ட்னர் 8 வகை நுண்ணறிவு, மாஸ்லோ த இவ ஈ கள் & RTE சட்டம் 2009',
          subtopic:
            'ஹோவர் ட் கார் ட்னர் தத்துவம், மஸ்லோ ப டிநிலை த இவ ஈ கள் மற்றும் இலவச க ட் டாய க் கல்வி',
          dayNumber: 3,
          periodNumber: 1,
          keyFormulaOrLaw:
            'Maslow Hierarchy: Physiological -> Safety -> Love/Belonging -> Esteem -> Self-Actualization',
          keyPoints: [
            'RTE Act came into force on 1 April 2010 (Article 21A)',
            'Pupil-Teacher Ratio (PTR) in primary school: 30:1; Upper primary: 35:1'
          ],
          type: 'concept',
          importance: 'High-Yield'
        }
      ]
    }
  ];
  const pedagogyChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'மொழி கற்பித்தல் முறை கள் & மதிப்பீ ட் டு உத்தி கள் (Pedagogy & Assessment)',
      description:
        'LSRW திறன் கள் ( கேட்டல், ப இ சுதல், ப டித்தல், எழுதுதல்), செய்யுள்/ உரைநடை கற்பித்தல், நுண்ணில ஈ கற்பித்தல் (Micro-teaching), CCE தொ டர் மதிப்பீ டு',
      subtopics: [
        {
          id: 'trb_ped_sub1',
          title: 'கற்பித்தல் முறை கள் & நுண்ணில ஈ கற்பித்தல்',
          microTopics: [
            {
              id: 'trb_ped_1',
              title: 'LSRW மொழித்திறன் கள் & மொழி கற்பி க் கும் முறை கள்',
              keyAxiom:
                'கேட்டல் மற்றும் ப டித்தல் ஏற்புத் திறன் கள்; ப இ சுதல் மற்றும் எழுதுதல் வ ஆளியீ ட் டுத் திறன் கள்'
            },
            {
              id: 'trb_ped_2',
              title: 'நுண்ணில ஈ கற்பித்தல் 6 ப டி கள் (Micro-Teaching Cycle)',
              keyAxiom:
                'Teach (6m) -> Feedback (6m) -> Re-plan (12m) -> Re-teach (6m) -> Re-feedback (6m) = 36 mins'
            }
          ]
        }
      ],
      microTopics: [
        {
          id: 'trb_ped_1',
          topicTitle:
            'LSRW மொழித்திறன் கள், நுண்ணில ஈ கற்பித்தல் சுழற் சி (36 நிமி ட ங் கள்) & CCE',
          subtopic: 'கற்பித்தல் ப டி கள், பின்ன₹ ட் டம் மற்றும் தொ டர் முழும ஈயான மதிப்பீ டு (CCE)',
          dayNumber: 2,
          periodNumber: 2,
          keyFormulaOrLaw:
            'Micro-teaching Cycle: 36 Minutes (Plan -> Teach 6m -> Feedback 6m -> Re-plan 12m -> Re-teach 6m -> Re-feedback 6m)',
          keyPoints: [
            'Formative Assessment ( கற்றலு க் கான மதிப்பீ டு) vs Summative Assessment ( கற்றலின் மதிப்பீ டு)',
            'Micro-teaching was introduced by Dwight W. Allen at Stanford University (1963)'
          ],
          type: 'concept',
          importance: 'High-Yield'
        }
      ]
    }
  ];
  const subjects: SyllabusSubject[] = [
    {
      subjectId: 'trb_child_dev',
      subjectName: 'குழந்தை ம இம்பா டும் கற்றல் உளவியலும் (Child Development & Pedagogy)',
      icon: 'ட‘ ',
      color: '#ec4899',
      totalChapters: childDevChapters.length,
      totalMicroTopics: childDevChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0),
      chapters: childDevChapters
    },
    {
      subjectId: 'trb_pedagogy',
      subjectName: 'கற்பித்தல் முறை களும் மதிப்பீ டும் (Teaching Methodology & CCE)',
      icon: ' ',
      color: '#06b6d4',
      totalChapters: pedagogyChapters.length,
      totalMicroTopics: pedagogyChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0),
      chapters: pedagogyChapters
    }
  ];
  return {
    courseId: courseId || 'exam-trb-tet',
    courseTitle:
      courseTitle || 'Teachers Recruitment Board (TRB / TNTET Paper 1 & 2) Master Program',
    category: 'teaching',
    board: 'TRB Tamil Nadu',
    medium: 'Tamil / English',
    totalDays: 150,
    totalSubjects: subjects.length,
    totalChapters: subjects.reduce((a, s) => a + s.chapters.length, 0),
    totalMicroTopics: subjects.reduce(
      (a, s) => a + s.chapters.reduce((acc, c) => acc + (c.microTopics?.length || 0), 0),
      0
    ),
    subjects
  };
}

export function getGateAndEngineeringCompleteSyllabus(
  courseId?: string,
  courseTitle?: string
): CourseFullSyllabus {
  const engMathChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Engineering Mathematics & Discrete Mathematics',
      description:
        'Linear Algebra (Eigenvalues/Eigenvectors, Cayley-Hamilton), Calculus (Limits, Maxima/Minima), Probability (Bayes Theorem), Propositional Logic & Graph Theory',
      subtopics: [
        {
          id: 'gate_m_sub1',
          title: 'Linear Algebra & Discrete Math',
          microTopics: [
            {
              id: 'gate_m_1',
              title: 'Eigenvalues, Eigenvectors & Cayley-Hamilton Theorem',
              keyAxiom: 'Sum of eigenvalues = Trace of matrix; Product of eigenvalues = Determinant'
            },
            {
              id: 'gate_m_2',
              title: 'Graph Theory (Handshaking Lemma, Planar Graphs E ≤ 3V - 6)',
              keyAxiom: 'Sum of degrees of all vertices = 2 × Number of Edges'
            }
          ]
        }
      ],
      microTopics: [
        {
          id: 'gate_m_1',
          topicTitle: 'Eigenvalues, Cayley-Hamilton Theorem, Handshaking Lemma & Bayes Rule',
          subtopic:
            'Matrix characteristic equation |A - λI| = 0, Planar graph Euler formula V - E + F = 2',
          dayNumber: 1,
          periodNumber: 1,
          keyFormulaOrLaw:
            'Trace(A) = Σ λ_i | Det(A) = Π λ_i | Handshaking: Σ deg(v) = 2|E| | Euler Formula: V - E + F = 2',
          keyPoints: [
            'Every square matrix satisfies its own characteristic equation (Cayley-Hamilton)',
            'In a planar connected graph with V ≥ 3, number of edges E ≤ 3V - 6'
          ],
          type: 'solved_problem',
          importance: 'High-Yield'
        }
      ]
    }
  ];
  const csCoreChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Operating Systems & Database Management Systems (DBMS)',
      description:
        "CPU Scheduling, Semaphores & Mutex, Deadlock (Banker's Algorithm), Virtual Memory (Page replacement), SQL, B+ Trees, Normalization (BCNF/3NF), ACID & Conflict Serializability",
      subtopics: [
        {
          id: 'gate_cs_sub1',
          title: 'Operating Systems & DBMS Core',
          microTopics: [
            {
              id: 'gate_cs_1',
              title: 'Semaphores, Deadlock Banker Algorithm & Virtual Memory Paging',
              keyAxiom:
                'Deadlock 4 conditions: Mutual exclusion, Hold & Wait, No preemption, Circular wait'
            },
            {
              id: 'gate_cs_2',
              title: 'Database Normalization (3NF vs BCNF) & Conflict Serializability',
              keyAxiom: 'Precedence graph cycle check for conflict serializability'
            }
          ]
        }
      ],
      microTopics: [
        {
          id: 'gate_cs_1',
          topicTitle: 'Banker Algorithm, Paging TLB Hit Ratio & BCNF Normalization',
          subtopic:
            'Effective Memory Access Time EMAT = h(t_tlb + t_m) + (1-h)(t_tlb + 2t_m), Conflict Serializability graph',
          dayNumber: 2,
          periodNumber: 2,
          keyFormulaOrLaw:
            'EMAT = h(t_TLB + t_m) + (1 - h)(t_TLB + 2t_m) | BCNF Condition: For every X -> Y, X must be a Super Key',
          keyPoints: [
            'Strict 2PL prevents cascading rollbacks and guarantees serializability',
            'Page fault occurs when referenced page is not present in main memory frame'
          ],
          type: 'solved_problem',
          importance: 'High-Yield'
        }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Computer Networks, Theory of Computation (TOC) & Compiler Design',
      description:
        'TCP 3-Way Handshake, Flow control (Sliding Window, Go-Back-N, Selective Repeat), Subnetting CIDR, Regular Expressions, DFA/NFA minimization, Turing Machines, LL(1) / LR(1) Parsers',
      subtopics: [
        {
          id: 'gate_cs_sub2',
          title: 'Networks, TOC & Compilers',
          microTopics: [
            {
              id: 'gate_cs_3',
              title: 'Sliding Window Protocols (GBN vs SR) & Subnetting CIDR',
              keyAxiom: 'Efficiency η = N / (1 + 2a) where a = Propagation Time / Transmission Time'
            },
            {
              id: 'gate_cs_4',
              title: 'DFA Minimization (Myhill-Nerode) & LL(1) Parsing Table',
              keyAxiom: 'A grammar is LL(1) if FIRST and FOLLOW sets have no common intersection'
            }
          ]
        }
      ],
      microTopics: [
        {
          id: 'gate_cs_3',
          topicTitle: 'Sliding Window Efficiency (GBN / SR), DFA Minimization & LL(1) Parsing',
          subtopic:
            'Go-Back-N window size N = 1 + 2a, Selective Repeat N = 2^(k-1), Pumping Lemma for regular languages',
          dayNumber: 3,
          periodNumber: 3,
          keyFormulaOrLaw:
            'Sliding Window Efficiency η = N / (1 + 2a) | a = T_p / T_t | IPv4 Subnet Mask /26 = 255.255.255.192 (64 IPs)',
          keyPoints: [
            'Selective Repeat uses window size 2^(k-1) to avoid sequence number overlap',
            'Halting problem of Turing Machine is undecidable'
          ],
          type: 'solved_problem',
          importance: 'High-Yield'
        }
      ]
    }
  ];
  const subjects: SyllabusSubject[] = [
    {
      subjectId: 'gate_math',
      subjectName: 'Engineering Mathematics & Discrete Math',
      icon: '📐ஐ',
      color: '#06b6d4',
      totalChapters: engMathChapters.length,
      totalMicroTopics: engMathChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0),
      chapters: engMathChapters
    },
    {
      subjectId: 'gate_cs',
      subjectName: 'Computer Science Core (OS, DBMS, Networks, TOC & Compilers)',
      icon: '💻',
      color: '#8b5cf6',
      totalChapters: csCoreChapters.length,
      totalMicroTopics: csCoreChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0),
      chapters: csCoreChapters
    }
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
    totalMicroTopics: subjects.reduce(
      (a, s) => a + s.chapters.reduce((acc, c) => acc + (c.microTopics?.length || 0), 0),
      0
    ),
    subjects
  };
}

export function getKidsSkillsCompleteSyllabus(
  courseId: string,
  courseTitle: string
): CourseFullSyllabus {
  const scratchChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Scratch 3.0 Visual Block Coding & Interactive Animation',
      description:
        'Sprites, Backdrops, Motion blocks, Loops (Repeat, Forever), Events (When Green Flag Clicked), Sound & Scoring',
      subtopics: [
        {
          id: 'kid_sc_sub1',
          title: 'Sprites, Loops & Events',
          microTopics: [
            {
              id: 'kid_sc_1',
              title: 'Scratch Basics: Sprites, Motion, Costumes & Animation Loops',
              keyAxiom: 'When Green Flag Clicked -> Forever [Move 10 steps, If on edge, bounce]'
            },
            {
              id: 'kid_sc_2',
              title: 'Game Development: Score Variables & Collision Detection',
              keyAxiom: 'If <touching Player?> then [Change Score by 1, Play Sound, Hide]'
            }
          ]
        }
      ],
      microTopics: [
        {
          id: 'kid_sc_1',
          topicTitle: 'Scratch Basics: Sprites, Motion, Costumes & Animation Loops',
          subtopic:
            'Moving 10 steps, Bounce on edge, Next costume for walking animation, Forever repeat blocks',
          dayNumber: 1,
          periodNumber: 1,
          keyFormulaOrLaw:
            'Scratch Event: When Green Flag Clicked -> Forever [Move (10) steps, If on edge, bounce]',
          keyPoints: [
            'XY Coordinate plane in Scratch: Center is (0, 0), X is -240 to 240, Y is -180 to 180',
            'Costume switching creates smooth animated movement'
          ],
          type: 'concept',
          importance: 'Foundational'
        },
        {
          id: 'kid_sc_2',
          topicTitle: 'Game Development: Score Variables, Sensing & Collision Detection',
          subtopic:
            'Create Score variable, Sensing touching mouse-pointer/color, If-Else conditional logic, Win/Lose backdrop switch',
          dayNumber: 4,
          periodNumber: 1,
          keyFormulaOrLaw:
            'Game Logic: If <touching [Player]?> then [Change [Score] by (1), Play Sound, Hide]',
          keyPoints: [
            'Variables store changing values like Score, Lives, and Timer',
            'Broadcasting messages coordinates actions between different sprites'
          ],
          type: 'solved_problem',
          importance: 'High-Yield'
        }
      ]
    }
  ];
  const vedicMathsChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Vedic Maths: Rapid Mental Calculation Tricks & Speed Sutras',
      description:
        'Ekadhikena Purvena (Squaring numbers ending in 5), Nikhilam multiplication base 10/100, Fast cross-addition and subtraction',
      subtopics: [
        {
          id: 'kid_vm_sub1',
          title: 'Speed Maths Sutras',
          microTopics: [
            {
              id: 'kid_vm_1',
              title: 'Squaring Numbers Ending in 5 & Fast Multiplication with 11',
              keyAxiom: '(n5)² = [n × (n+1)] | 25'
            }
          ]
        }
      ],
      microTopics: [
        {
          id: 'kid_vm_1',
          topicTitle: 'Squaring Numbers Ending in 5 & Fast Multiplication with 11',
          subtopic:
            '35² = (3×4)|25 = 1225, 45×11 = 4|(4+5)|5 = 495, 2-second rapid mental math calculations',
          dayNumber: 2,
          periodNumber: 2,
          keyFormulaOrLaw:
            'Vedic Sutra: (n5)² = [n × (n + 1)] followed by 25 | Multiplication by 11: ab × 11 = a | (a+b) | b',
          keyPoints: [
            'Ekadhikena Purvena means "By one more than the previous one"',
            'Multiplication with 99, 999 using base deviation subtraction'
          ],
          type: 'solved_problem',
          importance: 'High-Yield'
        }
      ]
    }
  ];
  const roboticsChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Robotics, Electronics & IoT Foundations (Arduino & Sensors)',
      description:
        'Circuits, Breadboards, LEDs, Ultrasonic distance sensors, Motors, Arduino microcontroller coding',
      subtopics: [
        {
          id: 'kid_rob_sub1',
          title: 'Circuits & Sensors',
          microTopics: [
            {
              id: 'kid_rob_1',
              title: 'Arduino Microcontroller & Ultrasonic Obstacle Avoidance',
              keyAxiom: 'Distance = (Travel Time × Speed of Sound) / 2'
            }
          ]
        }
      ],
      microTopics: [
        {
          id: 'kid_rob_1',
          topicTitle: 'Arduino Microcontroller, Breadboard Circuits & Ultrasonic Sensor',
          subtopic: 'Connecting LED resistors, Reading ultrasonic sensor pulse, Motor driver L298N',
          dayNumber: 3,
          periodNumber: 3,
          keyFormulaOrLaw: 'Ohm Law: V = IR | Ultrasonic: Distance = (Duration × 0.034) / 2 cm',
          keyPoints: [
            'Anode is longer positive leg of LED; Cathode is shorter negative leg',
            'Arduino void setup() runs once; void loop() runs repeatedly'
          ],
          type: 'concept',
          importance: 'High-Yield'
        }
      ]
    }
  ];
  const subjects: SyllabusSubject[] = [
    {
      subjectId: 'kid_scratch',
      subjectName: 'Scratch 3.0 Block Coding & Game Studio',
      icon: 'ðடஐ±',
      color: '#f59e0b',
      totalChapters: scratchChapters.length,
      totalMicroTopics: scratchChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0),
      chapters: scratchChapters
    },
    {
      subjectId: 'kid_vedic',
      subjectName: 'Vedic Maths & Lightning Speed Calculations',
      icon: '⚡',
      color: '#06b6d4',
      totalChapters: vedicMathsChapters.length,
      totalMicroTopics: vedicMathsChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0),
      chapters: vedicMathsChapters
    },
    {
      subjectId: 'kid_robotics',
      subjectName: 'Robotics, Electronics & Smart IoT Studio',
      icon: '🤖',
      color: '#10b981',
      totalChapters: roboticsChapters.length,
      totalMicroTopics: roboticsChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0),
      chapters: roboticsChapters
    }
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
    totalMicroTopics: subjects.reduce(
      (a, s) => a + s.chapters.reduce((acc, c) => acc + (c.microTopics?.length || 0), 0),
      0
    ),
    subjects
  };
}

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
  if (
    c.includes('police') ||
    c.includes('tnusrb') ||
    c.includes('si-') ||
    c.includes('constable') ||
    c.includes('sub-inspector')
  ) {
    return getTamilNaduPoliceCompleteSyllabus(courseId, title);
  }
  // 6. TNPSC Exams Track (All Groups 1, 2, 4, VAO, DEO)
  if (
    c.includes('tnpsc') ||
    c.includes('vao') ||
    c.includes('group-1') ||
    c.includes('group-2') ||
    c.includes('group-4') ||
    c.includes('grp1') ||
    c.includes('grp2') ||
    c.includes('grp4')
  ) {
    return getTnpscUnifiedCompleteSyllabus(courseId, title);
  }
  // 7. Banking & Insurance Track (IBPS PO/Clerk, SBI PO/Clerk, RBI Assistant)
  if (
    c.includes('bank') ||
    c.includes('ibps') ||
    c.includes('sbi') ||
    c.includes('rbi') ||
    c.includes('po-') ||
    c.includes('clerk')
  ) {
    return getBankingAndInsuranceCompleteSyllabus(courseId, title);
  }
  // 8. SSC & Railway Exams Track (SSC CGL / CHSL / MTS & RRB NTPC / Group D)
  if (
    c.includes('ssc') ||
    c.includes('cgl') ||
    c.includes('chsl') ||
    c.includes('mts') ||
    c.includes('rrb') ||
    c.includes('railway') ||
    c.includes('ntpc')
  ) {
    return getSscAndRailwayCompleteSyllabus(courseId, title);
  }
  // 9. TRB & Teaching Exams Track (TRB PG/BT, TNTET Paper 1 & 2)
  if (
    c.includes('trb') ||
    c.includes('tet') ||
    c.includes('tntet') ||
    c.includes('teacher') ||
    c.includes('bed') ||
    c.includes('ugc-net')
  ) {
    return getTrbAndTeacherExamsCompleteSyllabus(courseId, title);
  }
  // 10. GATE & Engineering Core Track
  if (c.includes('gate') || c.includes('engineering') || c.includes('btech')) {
    return getGateAndEngineeringCompleteSyllabus(courseId, title);
  }
  // 11. Kids Skills (Scratch, Vedic Maths, Robotics)
  if (
    c.includes('kids') ||
    c.includes('scratch') ||
    c.includes('vedic') ||
    c.includes('robotics')
  ) {
    return getKidsSkillsCompleteSyllabus(courseId, title);
  }
  // 12. Tech & College Degrees Track (Python, Full-Stack, Web, Mobile, DSA, AI/ML, BCA, B.Sc)
  if (
    c.includes('skill') ||
    c.includes('python') ||
    c.includes('react') ||
    c.includes('fullstack') ||
    c.includes('web') ||
    c.includes('dsa') ||
    c.includes('code') ||
    c.includes('degree') ||
    c.includes('college') ||
    c.includes('bca')
  ) {
    return getCollegeAndTechSkillsCompleteSyllabus(courseId, title);
  }
  // 13. Class 11 & 12 Commerce Track (CBSE, State Board, Matric)
  if (
    c.includes('11-com') ||
    c.includes('12-com') ||
    c.includes('commerce') ||
    c.includes('accountancy')
  ) {
    return getCommerceClass11Syllabus(courseId, title);
  }
  // 9. Class 11 & 12 Science Track (Higher Secondary Bio-Maths / Computer Science)
  if (
    c.includes('-11') ||
    c.includes('-12') ||
    c.includes('std-11') ||
    c.includes('std-12') ||
    c.includes('grade-11') ||
    c.includes('grade-12') ||
    c.includes('hsc') ||
    c.includes('plus-one') ||
    c.includes('plus-two')
  ) {
    return getHigherSecondaryScienceCompleteSyllabus(courseId, title);
  }
  // 10. KINDERGARTEN (LKG & UKG)
  if (c.includes('lkg') || c.includes('ukg') || c.includes('kindergarten')) {
    const subjects: SyllabusSubject[] = [
      {
        subjectId: 'kg_tamil',
        subjectName: isTa
          ? 'தமிழ் மழலையர் பாடல் & உயிர் எழுத்துக்கள்'
          : 'Tamil Rhymes & Vowels (Uyir Ezhuthukkal)',
        icon: '🔤',
        color: '#ec4899',
        totalChapters: 2,
        totalMicroTopics: 6,
        chapters: [
          {
            chapterNumber: 1,
            chapterTitle: 'உயிர் எழுத்துக்கள் 12 & மழலையர் பாலர் பாடல்கள்',
            description:
              'அ முதல் ஔ வரை உள்ள 12 உயிர் எழுத்துக்கள் மற்றும் நிலா நிலா ஓடி வா பாடல்கள்',
            subtopics: [
              {
                id: 'kg_t_sub1',
                title: 'உயிர் எழுத்துகள் & படங்கள்',
                microTopics: [
                  {
                    id: 'kg_t_1',
                    title: 'அ முதல் ஔ வரை உயிர் எழுத்துக்கள் (அம்மா, ஆடு, இலை, ஈட்டி)',
                    keyAxiom: 'உயிர் எழுத்துக்கள் மொத்தம் 12: அ, ஆ, இ, ஈ, உ, ஊ, எ, ஏ, ஐ, ஒ, ஓ, ஔ'
                  },
                  {
                    id: 'kg_t_2',
                    title: 'நிலா நிலா ஓடி வா & கைவீசம்மா கைவீசு மழலையர் பாடல்கள்',
                    keyAxiom: 'மழலையர் பாலர் பாடல்கள் மற்றும் எளிய உச்சரிப்புப் பயிற்சி'
                  }
                ]
              }
            ],
            microTopics: [
              {
                id: 'kg_t_1',
                topicTitle: 'அ முதல் ஔ வரை உயிர் எழுத்துக்கள் (அம்மா, ஆடு, இலை, ஈட்டி)',
                subtopic: 'படங்கள் பார்த்து எழுத்துக்களை அடையாளம் காணுதல்',
                dayNumber: 1,
                periodNumber: 1,
                keyFormulaOrLaw:
                  'உயிர் எழுத்துக்கள் 12: அ, ஆ, இ, ஈ, உ, ஊ, எ, ஏ, ஐ, ஒ, ஓ, ஔ | ஆய்த எழுத்து: ஃ',
                keyPoints: [
                  'அ - அணில், அம்மா',
                  'ஆ - ஆடு, ஆலமரம்',
                  'இ - இலை, இட்லி',
                  'ஈ - ஈட்டி, ஈ'
                ],
                type: 'concept',
                importance: 'Foundational'
              },
              {
                id: 'kg_t_2',
                topicTitle: 'நிலா நிலா ஓடி வா மழலையர் பாடல்',
                subtopic: 'ராகத்தோடு பாடி அபிநயம் செய்தல்',
                dayNumber: 1,
                periodNumber: 2,
                keyFormulaOrLaw: 'பாடல்: நிலா நிலா ஓடி வா, நில்லாமல் ஓடி வா',
                keyPoints: ['ஒலி நயத்தோடு பாடுதல்', 'எளிய உடல் அசைவுகள்'],
                type: 'concept',
                importance: 'Foundational'
              }
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
            subtopics: [
              {
                id: 'kg_e_sub1',
                title: 'Phonics A to Z',
                microTopics: [
                  {
                    id: 'kg_e_1',
                    title: 'Letters A to Z Phonics & Nursery Rhymes',
                    keyAxiom: 'Phonics: /æ/ /b/ /k/ /d/ | 26 English Alphabets A to Z'
                  }
                ]
              }
            ],
            microTopics: [
              {
                id: 'kg_e_1',
                topicTitle: 'Letters A to Z Phonics & Nursery Rhymes',
                subtopic:
                  'Apple, Ball, Cat, Dog, Elephant phonics sounds and Twinkle Twinkle rhyme',
                dayNumber: 1,
                periodNumber: 2,
                keyFormulaOrLaw: 'Phonics: /æ/ /b/ /k/ /d/ | 26 English Alphabets A to Z',
                keyPoints: ['Letter tracing inside lines', 'Object recognition'],
                type: 'concept',
                importance: 'Foundational'
              }
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
            subtopics: [
              {
                id: 'kg_m_sub1',
                title: 'Numbers 1 to 20',
                microTopics: [
                  {
                    id: 'kg_m_1',
                    title: 'Numbers 1 to 20: Counting, Shapes & Comparison',
                    keyAxiom:
                      'Counting 1 to 20 | Circle (Round) | Triangle (3 sides) | Square (4 sides)'
                  }
                ]
              }
            ],
            microTopics: [
              {
                id: 'kg_m_1',
                topicTitle: 'Numbers 1 to 20: Counting, Shapes & Comparison',
                subtopic: '1 Sun, 2 Shoes, 3 Stars, Circle, Square, Big elephant vs small mouse',
                dayNumber: 1,
                periodNumber: 3,
                keyFormulaOrLaw:
                  'Counting 1 to 20 | Circle (Round) | Triangle (3 sides) | Square (4 sides)',
                keyPoints: [
                  'Finger counting and pattern recognition',
                  'Big vs Small visual comparison'
                ],
                type: 'concept',
                importance: 'Foundational'
              }
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
            description:
              '5 senses (Eyes, Ears, Nose, Tongue, Skin), Domestic animals, Please/Thank You',
            subtopics: [
              {
                id: 'kg_evs_sub1',
                title: '5 Senses & Animals',
                microTopics: [
                  {
                    id: 'kg_evs_1',
                    title: '5 Senses, Healthy Habits & Gentle Animal Friends',
                    keyAxiom:
                      '5 Senses: Sight (Eyes), Hearing (Ears), Smell (Nose), Taste (Tongue), Touch (Skin)'
                  }
                ]
              }
            ],
            microTopics: [
              {
                id: 'kg_evs_1',
                topicTitle: '5 Senses, Healthy Habits & Gentle Animal Friends',
                subtopic:
                  'Eyes to see, Ears to hear, Nose to smell, Tongue to taste, Skin to touch',
                dayNumber: 1,
                periodNumber: 4,
                keyFormulaOrLaw:
                  '5 Senses: Sight (Eyes), Hearing (Ears), Smell (Nose), Taste (Tongue), Touch (Skin)',
                keyPoints: ['Brush teeth twice a day', 'Wash hands before eating meals'],
                type: 'concept',
                importance: 'Foundational'
              }
            ]
          }
        ]
      }
    ];
    return {
      courseId: courseId || 'kindergarten-master',
      courseTitle: title || 'Kindergarten (LKG & UKG) Foundation',
      category: 'kindergarten',
      board: 'TNSB / CBSE / Matric',
      medium: isTa ? 'Tamil' : 'English',
      totalDays: 200,
      totalSubjects: subjects.length,
      totalChapters: subjects.reduce((a, s) => a + s.chapters.length, 0),
      totalMicroTopics: subjects.reduce(
        (a, s) =>
          a +
          (s.totalMicroTopics ||
            s.chapters.reduce((acc, c) => acc + (c.microTopics?.length || 0), 0)),
        0
      ),
      subjects
    };
  }
  // 11. SECONDARY STAGE (Class 9 & Class 10 SSLC)
  if (
    c.includes('-10') ||
    c.includes('-9') ||
    c.includes('10th') ||
    c.includes('9th') ||
    c.includes('10_') ||
    c.includes('9_') ||
    c.includes('std-10') ||
    c.includes('std-9') ||
    c.includes('grade-10') ||
    c.includes('grade-9') ||
    c.includes('sslc')
  ) {
    return getSecondaryClass9to10Syllabus(courseId, title);
  }
  // 12. MIDDLE STAGE (Class 6, 7, 8)
  if (
    c.includes('-6') ||
    c.includes('-7') ||
    c.includes('-8') ||
    c.includes('6th') ||
    c.includes('7th') ||
    c.includes('8th') ||
    c.includes('6_') ||
    c.includes('7_') ||
    c.includes('8_') ||
    c.includes('std-6') ||
    c.includes('std-7') ||
    c.includes('std-8') ||
    c.includes('grade-6') ||
    c.includes('grade-7') ||
    c.includes('grade-8') ||
    c.includes('middle') ||
    c.includes('class-6') ||
    c.includes('class_6')
  ) {
    return getMiddleClass6to8Syllabus(courseId, title);
  }
  // 13. TNPSC & GENERAL STUDIES SUB-TOPICS (Tamil, GK, Polity, History, Science)
  if (
    c.includes('பொருத்துதல்') ||
    c.includes('இலக்கணம்') ||
    c.includes('வேர்ச்சொல்') ||
    c.includes('தமிழ்') ||
    c.includes('tamil') ||
    c.includes('வரலாறு') ||
    c.includes('அரசியல்') ||
    c.includes('புவியியல்') ||
    c.includes('பொருளாதாரம்') ||
    c.includes('gk') ||
    c.includes('rrb') ||
    c.includes('constitution') ||
    c.includes('பெரியார்') ||
    c.includes('பாரதியார்') ||
    c.includes('அண்ணா') ||
    c.includes('காமராசர்') ||
    c.includes('ராஜாஜி') ||
    c.includes('விருதுகள்')
  ) {
    return getTnpscUnifiedCompleteSyllabus(courseId, title);
  }
  // 14. PREPARATORY STAGE (Class 3, 4, 5)
  if (
    c.includes('-3') ||
    c.includes('-4') ||
    c.includes('-5') ||
    c.includes('3rd') ||
    c.includes('4th') ||
    c.includes('5th') ||
    c.includes('std-3') ||
    c.includes('std-4') ||
    c.includes('std-5') ||
    c.includes('grade-3') ||
    c.includes('grade-4') ||
    c.includes('grade-5')
  ) {
    return getPreparatoryClass3to5Syllabus(courseId, title);
  }
  // 15. FOUNDATIONAL STAGE (Class 1 & Class 2)
  if (
    c.includes('-1') ||
    c.includes('-2') ||
    c.includes('1st') ||
    c.includes('2nd') ||
    c.includes('std-1') ||
    c.includes('std-2') ||
    c.includes('grade-1') ||
    c.includes('grade-2')
  ) {
    return getFoundationalClass1to2Syllabus(courseId, title);
  }
  // 16. DEFAULT FALLBACK
  return getTnpscUnifiedCompleteSyllabus(courseId, title);
}

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
    const subjects = base.subjects.map((s) => ({
      ...s,
      chapters: s.chapters.map((c) => ({ ...c, microTopics: [...(c.microTopics || [])] }))
    }));
    for (const item of customItems) {
      let subj = subjects.find(
        (s) =>
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
      let chap = subj.chapters.find(
        (c) =>
          c.chapterTitle.toLowerCase().includes(item.chapterTitle.toLowerCase()) ||
          item.chapterTitle.toLowerCase().includes(c.chapterTitle.toLowerCase())
      );
      if (!chap) {
        chap = {
          chapterNumber: item.chapterNumber || subj.chapters.length + 1,
          chapterTitle: item.chapterTitle,
          description: item.chapterDescription || `Chapter covering ${item.chapterTitle}`,
          microTopics: []
        };
        subj.chapters.push(chap);
      }
      if (!chap.microTopics) chap.microTopics = [];
      const exists = chap.microTopics.some(
        (t) => t.id === item.microTopic.id || t.topicTitle === item.microTopic.topicTitle
      );
      if (!exists) {
        chap.microTopics.push(item.microTopic);
      }
      subj.totalChapters = subj.chapters.length;
      subj.totalMicroTopics = subj.chapters.reduce(
        (acc, ch) => acc + (ch.microTopics?.length || 0),
        0
      );
    }
    return {
      ...base,
      totalSubjects: subjects.length,
      totalChapters: subjects.reduce((acc, s) => acc + (s.totalChapters || s.chapters.length), 0),
      totalMicroTopics: subjects.reduce(
        (acc, s) =>
          acc +
          (s.totalMicroTopics ||
            s.chapters.reduce((a, ch) => a + (ch.microTopics?.length || 0), 0)),
        0
      ),
      subjects
    };
  } catch (err) {
    console.warn('Could not augment custom syllabus:', err);
    return base;
  }
}
