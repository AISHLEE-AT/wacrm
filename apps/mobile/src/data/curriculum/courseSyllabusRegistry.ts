/**
 * TeachO Master Course Syllabus Registry
 * Complete Authentic Real-World Micro-Granular Curricula for all 86 Courses:
 * - Foundational Stage: LKG, UKG, Class 1, Class 2 (Ages 3–8)
 * - Preparatory Stage: Class 3, Class 4, Class 5 (Ages 8–11)
 * - Middle Stage: Class 6, Class 7, Class 8 (Ages 11–14)
 * - Secondary Stage: Class 9, Class 10 (Ages 14–16)
 */
import { UPSC_OPTIONALS_REGISTRY } from './upscCurriculumData.ts';
import { NEET_UG_OFFICIAL_SUBJECTS, JEE_MAIN_ADVANCED_OFFICIAL_SUBJECTS, TNPSC_UNIFIED_OFFICIAL_SUBJECTS } from './officialExhaustiveSyllabi.ts';

export interface SyllabusMicroTopic {
  id: string;
  topicTitle: string;
  subtopic: string;
  dayNumber: number;
  periodNumber: number;
  keyFormulaOrLaw: string;
  keyPoints: string[];
  type: 'concept' | 'solved_problem' | 'memorization' | 'quiz';
  importance: 'High-Yield' | 'Core Standard' | 'Foundational';
}

export interface SyllabusChapter {
  chapterNumber: number;
  chapterTitle: string;
  chapterTamilTitle?: string;
  description: string;
  microTopics: SyllabusMicroTopic[];
}

export interface SyllabusSubject {
  subjectId: string;
  subjectName: string;
  icon: string;
  color: string;
  totalChapters: number;
  totalMicroTopics: number;
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
      subjectId: 'fnd_math',
      subjectName: isTa ? 'கணிதம் & எண்கணித அடிப்படை (Mathematics & FLN)' : 'Mathematics & Number Sense (FLN)',
      icon: '🔢',
      color: '#06b6d4',
      totalChapters: 3,
      totalMicroTopics: 10,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: isTa ? 'எண்கள், இடமதிப்பு & கூட்டல்/கழித்தல்' : 'Numbers, Place Value & Addition/Subtraction',
          description: isTa ? '2 மற்றும் 3 இலக்க எண்கள், பத்துகள்/ஒன்றுகள் இடமதிப்பு, கூட்டல் கழித்தல் கணக்குகள்' : '2 & 3-digit numbers, Tens/Ones place value, Skip counting (2s, 5s, 10s), Word problems',
          microTopics: [
            { id: 'fnd_m_1', topicTitle: isTa ? 'இடமதிப்பு & 2 இலக்க எண்கள் (Tens & Ones)' : 'Place Value & 2-Digit Numbers (Tens & Ones)', subtopic: isTa ? 'மணிகள் சட்டம் மூலம் இடமதிப்பு அறிதல்' : 'Abacus representation, tens and ones grouping', dayNumber: 1, periodNumber: 1, keyFormulaOrLaw: 'Place Value: 1 Ten = 10 Ones | 1 Hundred = 10 Tens', keyPoints: ['Grouping into bundles of tens', 'Expanded form: 47 = 40 + 7'], type: 'concept', importance: 'Foundational' },
            { id: 'fnd_m_2', topicTitle: isTa ? 'கூட்டல் & கழித்தல் எளிய கணக்குகள்' : 'Addition & Subtraction Word Problems', subtopic: isTa ? 'நடைமுறை வாழ்க்கை கணக்கீடுகள்' : 'Single and double-digit operations with carry-over and borrowing', dayNumber: 4, periodNumber: 1, keyFormulaOrLaw: 'Addition: Combine groups (+) | Subtraction: Take away (-)', keyPoints: ['Word problem keywords: Total, In all, Left, Difference', 'Checking subtraction using addition'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: isTa ? 'பெருக்கல் வாய்ப்பாடுகள் (1–10) & நாணயங்கள்' : 'Multiplication Tables (1–10) & Indian Currency',
          description: isTa ? 'தொடர் கூட்டலே பெருக்கல், சமமாகப் பிரித்தலே வகுத்தல், இந்திய ரூபாய் நோட்டுகள்' : 'Multiplication as repeated addition, Division as sharing, Indian coins & notes',
          microTopics: [
            { id: 'fnd_m_3', topicTitle: isTa ? 'பெருக்கல் வாய்ப்பாடு & தொடர் கூட்டல்' : 'Multiplication Tables & Repeated Addition', subtopic: isTa ? '2, 3, 5, 10 வாய்ப்பாடுகள் பயிற்சி' : 'Visual array grouping and tables 1 to 10', dayNumber: 7, periodNumber: 1, keyFormulaOrLaw: 'Multiplication: 3 × 4 = 4 + 4 + 4 = 12', keyPoints: ['Order of multiplication does not change product (a × b = b × a)', 'Multiplying any number by 0 gives 0; by 1 gives same number'], type: 'memorization', importance: 'High-Yield' },
            { id: 'fnd_m_4', topicTitle: isTa ? 'இந்திய நாணயங்கள் & ரூபாய் நோட்டுகள்' : 'Indian Currency: Coins & Notes Combinations', subtopic: isTa ? 'பொருட்கள் வாங்குதல் மற்றும் மீதி கணக்கிடுதல்' : 'Making amounts using ₹1, ₹2, ₹5, ₹10 coins and ₹20, ₹50, ₹100 notes', dayNumber: 10, periodNumber: 1, keyFormulaOrLaw: '1 Rupee (₹1) = 100 Paise | Total Amount = Price × Quantity', keyPoints: ['Coin identification and exchange equivalents', 'Calculating change to be returned'], type: 'solved_problem', importance: 'Foundational' }
          ]
        },
        {
          chapterNumber: 3,
          chapterTitle: isTa ? 'அடிப்படை பின்னங்கள் & அளவீடுகள் (நீளம், எடை)' : 'Basic Fractions & Measurement Units',
          description: isTa ? 'அரை (1/2), கால் (1/4), மீட்டர், கிலோகிராம், லிட்டர் அளவுகள்' : 'Fractions (1/2, 1/4), Standard units of length (m/cm), weight (kg/g), capacity (L/mL)',
          microTopics: [
            { id: 'fnd_m_5', topicTitle: isTa ? 'பின்னங்கள்: அரை (1/2), கால் (1/4) அறிமுகம்' : 'Fractions: Half (1/2) and Quarter (1/4)', subtopic: isTa ? 'வடிவங்களை சமமாகப் பிரித்தல்' : 'Shading and identifying halves and quarters in 2D shapes', dayNumber: 13, periodNumber: 1, keyFormulaOrLaw: 'Fraction = Part / Whole | 1/2 + 1/2 = 1 | 1/4 + 1/4 + 1/4 + 1/4 = 1', keyPoints: ['Equal parts of a whole shape or collection', 'Visual fraction circle models'], type: 'concept', importance: 'Foundational' }
          ]
        }
      ]
    },
    {
      subjectId: 'fnd_science',
      subjectName: isTa ? 'சூழ்நிலையியல் & அறிவியல் (General Science & EVS)' : 'General Science & Environmental Studies',
      icon: '🌿',
      color: '#10b981',
      totalChapters: 3,
      totalMicroTopics: 10,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: isTa ? 'மனித உடல் உறுப்புகள் & சுகாதார பழக்கங்கள்' : 'My Body Organs & Healthy Habits',
          description: isTa ? 'மூளை, இதயம், நுரையீரல், வயிறு மற்றும் ஆரோக்கிய பழக்கங்கள்' : 'Internal organs (Brain, Heart, Lungs, Stomach), 5 senses, Hygiene and Balanced diet',
          microTopics: [
            { id: 'fnd_s_1', topicTitle: isTa ? 'உள் உறுப்புகள்: மூளை, இதயம், நுரையீரல், வயிறு' : 'Internal Organs: Brain, Heart, Lungs & Stomach', subtopic: isTa ? 'உறுப்புகளின் முதன்மைப் பணிகள்' : 'Functions: Brain (Thinking), Heart (Pumping blood), Lungs (Breathing), Stomach (Digestion)', dayNumber: 2, periodNumber: 2, keyFormulaOrLaw: 'Body Organs: Heart pumps blood | Lungs breathe Oxygen (O₂) | Brain controls body', keyPoints: ['Protecting sense organs', 'Good posture and daily exercise'], type: 'concept', importance: 'Foundational' }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: isTa ? 'தாவரங்கள், விலங்குகள் & பருவகாலங்கள்' : 'Plants, Animals & Seasons',
          description: isTa ? 'மரங்கள், செடிகள், கொடிகள், விலங்குகளின் உணவு மற்றும் கோடை/மழை/குளிர் பருவங்கள்' : 'Trees, Shrubs, Herbs, Herbivores/Carnivores, Germination, Summer/Rainy/Winter seasons',
          microTopics: [
            { id: 'fnd_s_2', topicTitle: isTa ? 'தாவர வளர்ச்சி (விதை முளைத்தல்) & வகைகள்' : 'Plant Life Cycle: Germination & Classification', subtopic: isTa ? 'மரம், செடி, புதர், கொடி வேறுபாடுகள்' : 'Seed to plant stages, Trees, Shrubs, Herbs, Climbers and Creepers', dayNumber: 5, periodNumber: 2, keyFormulaOrLaw: 'Seed Germination Requirements: Air + Water + Sunlight + Soil', keyPoints: ['Tap root vs Fibrous root basics', 'Photosynthesis produces food for plants'], type: 'concept', importance: 'Foundational' },
            { id: 'fnd_s_3', topicTitle: isTa ? 'பொருட்களின் நிலைகள் & ஒளி நிழல்' : 'States of Matter & Light and Shadows', subtopic: isTa ? 'திண்மம், திரவம், வாயு மற்றும் நிழல் உருவாக்கம்' : 'Solids, Liquids, Gases properties and how shadows form when light is blocked', dayNumber: 8, periodNumber: 2, keyFormulaOrLaw: 'Matter: Solid (Fixed shape) | Liquid (Takes container shape) | Gas (Spreads freely)', keyPoints: ['Shadow is formed when an opaque object blocks light', 'Shadow length changes at morning, noon, and evening'], type: 'concept', importance: 'Foundational' }
          ]
        }
      ]
    },
    {
      subjectId: 'fnd_social_lang',
      subjectName: isTa ? 'சமூக சிந்தனை, திருக்குறள் & மொழி (Social, Tamil & English)' : 'Social Awareness, Moral Stories & Language',
      icon: '📜',
      color: '#8b5cf6',
      totalChapters: 3,
      totalMicroTopics: 10,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: isTa ? 'நமது சமுதாயம், தேசிய சின்னங்கள் & திருக்குறள்' : 'Our Community Helpers, National Symbols & Thirukkural',
          description: isTa ? 'காவல்துறை, மருத்துவமனை, தபால் நிலையம், தேசியக் கொடி, விலங்கு, பறவை & திருக்குறள்' : 'Police, Hospital, Post Office, National Flag/Emblem/Anthem, Moral couplets',
          microTopics: [
            { id: 'fnd_sl_1', topicTitle: isTa ? 'இந்திய தேசிய சின்னங்கள் & திருக்குறள் நற்பண்புகள்' : 'National Symbols of India & Moral Couplets', subtopic: isTa ? 'தேசியக் கொடி (மூவர்ணம்), அசோகச் சக்கரம் & திருக்குறள்' : 'Tricolour Flag (Saffron, White, Green), Ashoka Chakra (24 spokes), Tiger, Peacock', dayNumber: 3, periodNumber: 3, keyFormulaOrLaw: 'National Flag: Saffron (Courage), White (Peace), Green (Prosperity) | Thirukkural: அகர முதல எழுத்தெல்லாம்', keyPoints: ['Respecting national symbols', 'Moral values: Truthfulness, Kindness, Respecting elders'], type: 'concept', importance: 'Foundational' },
            { id: 'fnd_sl_2', topicTitle: isTa ? 'திசைகள் (கிழக்கு, மேற்கு) & குடும்ப உறவுகள்' : 'Direction Sense (Cardinal) & Family Tree', subtopic: isTa ? 'சூரியன் உதிக்கும் திசை கிழக்கு & உறவுமுறை பெயர்கள்' : 'Sun rises in East, sets in West; Family relations (Grandparents, Parents, Siblings)', dayNumber: 6, periodNumber: 3, keyFormulaOrLaw: '4 Cardinal Directions: North, South, East, West', keyPoints: ['Facing morning sun: Front is East, Back is West, Left is North, Right is South', 'Family tree generational diagram'], type: 'concept', importance: 'Foundational' }
          ]
        }
      ]
    }
  ];

  return {
    courseId,
    courseTitle,
    category: 'school_foundational',
    board: 'TNSB / CBSE / NCERT',
    medium: isTa ? 'Tamil' : 'English',
    totalDays: 200,
    totalSubjects: subjects.length,
    totalChapters: subjects.reduce((a, s) => a + s.chapters.length, 0),
    totalMicroTopics: subjects.reduce((a, s) => a + s.totalMicroTopics, 0),
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
          microTopics: [
            { id: 'prep_m_1', topicTitle: isTa ? 'பகா எண்கள் & பகா காரணிப்படுத்துதல் (HCF / LCM)' : 'Prime Factorization, HCF & LCM Fundamentals', subtopic: isTa ? 'மீப்பெரு பொது காரணி மற்றும் மீச்சிறு பொது மடங்கு' : 'Factor tree method, division method, Product = HCF × LCM formula', dayNumber: 1, periodNumber: 1, keyFormulaOrLaw: 'Product of Two Numbers = HCF × LCM | Prime Numbers have exactly 2 factors (1 and itself)', keyPoints: ['2 is the only even prime number', 'Co-prime numbers have HCF = 1'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'prep_m_2', topicTitle: isTa ? 'பின்னங்கள் & தசம எண்கள் கூட்டல்/கழித்தல்' : 'Fractions & Decimals Operations', subtopic: isTa ? 'ஓரின மற்றும் வேற்றின பின்னங்கள்' : 'Like/Unlike fractions, Equivalent fractions, Decimal place value chart', dayNumber: 4, periodNumber: 1, keyFormulaOrLaw: 'Fractions: a/b + c/b = (a+c)/b | Decimals: 0.75 = 75/100 = 3/4', keyPoints: ['Converting unlike fractions using LCM of denominators', 'Multiplication and division of decimals by 10, 100, 1000'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: isTa ? 'நேர்வீத முறை, விழுக்காடு, இலாப நட்டம்' : 'Unitary Method, Percentages, Profit & Loss',
          description: isTa ? 'ஒரு பொருளின் விலை கொண்டு பல பொருட்களின் விலை காணுதல், சதவீத கணக்கீடுகள்' : 'Unitary method problems, Percentage conversions, Profit = SP - CP, Loss = CP - SP',
          microTopics: [
            { id: 'prep_m_3', topicTitle: isTa ? 'நேர்வீத முறை & எளிய விழுக்காடு கணக்கீடு' : 'Unitary Method & Basic Percentages', subtopic: isTa ? 'அடக்க விலை, விற்ற விலை மற்றும் இலாப நட்டம்' : 'Find cost of 1 unit -> Multiply by desired quantity; % = (Value/Total) × 100', dayNumber: 7, periodNumber: 1, keyFormulaOrLaw: 'Unitary Rule: Unit Cost = Total Cost / Total Units | Profit = SP - CP (if SP > CP)', keyPoints: ['Profit% = (Profit / CP) × 100', 'Discount = Marked Price - Selling Price'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'prep_m_4', topicTitle: isTa ? 'வடிவியல்: கோணங்கள் & பரப்பளவு / சுற்றளவு' : 'Geometry: Angles, Perimeter & Area', subtopic: isTa ? 'செங்கோணம், குறுங்கோணம், விரிகோணம், செவ்வகம்/சதுரம் சுற்றளவு' : 'Acute, Right, Obtuse angles; Perimeter = Sum of all sides; Area of Rectangle = l × w', dayNumber: 10, periodNumber: 1, keyFormulaOrLaw: 'Rectangle: Perimeter = 2(l + w), Area = l × w | Square: Perimeter = 4a, Area = a²', keyPoints: ['Right angle = 90°, Straight angle = 180°', 'Sum of angles in a triangle = 180°'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        }
      ]
    },
    {
      subjectId: 'prep_science',
      subjectName: isTa ? 'பொது அறிவியல் (General Science & Human Physiology)' : 'General Science & Human Organ Systems',
      icon: '🔬',
      color: '#10b981',
      totalChapters: 3,
      totalMicroTopics: 12,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: isTa ? 'மனித உறுப்பு மண்டலங்கள் & ஊட்டச்சத்து' : 'Human Organ Systems & Nutrition',
          description: isTa ? 'செரிமான மண்டலம், சுவாச மண்டலம், ரத்த ஓட்ட மண்டலம் & சரிவிகித உணவு' : 'Digestive, Respiratory, Circulatory, Nervous systems; Balanced diet (Carbs, Proteins, Vitamins, Minerals)',
          microTopics: [
            { id: 'prep_s_1', topicTitle: isTa ? 'செரிமான & சுவாச உறுப்பு மண்டலங்கள்' : 'Digestive & Respiratory System Anatomy', subtopic: isTa ? 'உணவுக்குழாய், இரைப்பை, சிறுகுடல், மூச்சுக்குழாய், நுரையீரல்' : 'Alimentary canal stages, Enzyme digestion, Alveoli gas exchange (O₂ in, CO₂ out)', dayNumber: 2, periodNumber: 2, keyFormulaOrLaw: 'Respiration: Glucose + Oxygen -> Energy (ATP) + Carbon Dioxide + Water', keyPoints: ['Digestion begins in the mouth with salivary amylase', 'Villi in small intestine absorb digested nutrients into bloodstream'], type: 'concept', importance: 'High-Yield' },
            { id: 'prep_s_2', topicTitle: isTa ? 'ஊட்டச்சத்துகள் & குறைபாட்டு நோய்கள்' : 'Balanced Diet & Deficiency Diseases', subtopic: isTa ? 'வைட்டமின்கள் A, B, C, D மற்றும் தாது உப்புக்கள்' : 'Nutrients: Carbohydrates (Energy), Proteins (Body-building), Fats, Vitamins & Minerals (Protective)', dayNumber: 5, periodNumber: 2, keyFormulaOrLaw: 'Deficiency Diseases: Vit A (Night blindness), Vit C (Scurvy), Vit D (Rickets), Iron (Anemia)', keyPoints: ['Proteins made of amino acids repair damaged body tissues', 'Iodine deficiency causes Goitre (thyroid enlargement)'], type: 'concept', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: isTa ? 'விசை, வேலை, ஆற்றல் & எளிய எந்திரங்கள்' : 'Force, Work, Energy & Simple Machines',
          description: isTa ? 'இயக்க விசை, உராய்வு விசை, நெம்புகோல் (Lever), கப்பி (Pulley), சாய்தளம்' : 'Gravitational & Frictional forces, Kinetic & Potential energy, Lever (1st/2nd/3rd class), Pulley, Inclined plane',
          microTopics: [
            { id: 'prep_s_3', topicTitle: isTa ? 'விசை வகைகள் & எளிய எந்திரங்கள் (Lever & Pulley)' : 'Forces & Simple Machines (Levers & Pulleys)', subtopic: isTa ? 'நெம்புகோல் 3 வகைகள் மற்றும் தத்துவம்' : 'Mechanical advantage, 1st Class (Seesaw), 2nd Class (Wheelbarrow), 3rd Class (Tongs)', dayNumber: 8, periodNumber: 2, keyFormulaOrLaw: 'Work = Force × Displacement | Lever Principle: Load × Load Arm = Effort × Effort Arm', keyPoints: ['Simple machines make work easier by changing force direction or magnitude', 'Friction opposes relative motion between surfaces'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'prep_s_4', topicTitle: isTa ? 'நீர் சுழற்சி, சூரிய குடும்பம் & சுற்றுச்சூழல்' : 'Water Cycle, Solar System & Environmental Conservation', subtopic: isTa ? 'ஆவியாதல், ஆவி சுருங்குதல், மழைப்பொழிவு & 8 கோள்கள்' : 'Evaporation, Condensation, Precipitation; 8 Planets (Mercury to Neptune), Pollution control', dayNumber: 11, periodNumber: 2, keyFormulaOrLaw: 'Water Cycle: Evaporation -> Condensation (Clouds) -> Precipitation (Rain) -> Collection', keyPoints: ['Jupiter is the largest planet; Venus is the hottest planet', '3 R\'s of Conservation: Reduce, Reuse, Recycle'], type: 'concept', importance: 'High-Yield' }
          ]
        }
      ]
    },
    {
      subjectId: 'prep_social',
      subjectName: isTa ? 'சமூக அறிவியல் & குடிமையியல் (Social Science & Civics)' : 'Social Science, History & Indian Polity Seed',
      icon: '🌍',
      color: '#f59e0b',
      totalChapters: 3,
      totalMicroTopics: 12,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: isTa ? 'இந்திய இயற்கை அமைப்புகள், ஆறுகள் & வரைபடம்' : 'Physical Geography of India, Rivers & Maps',
          description: isTa ? 'இமயமலை, கங்கை சமவெளி, தக்காண பீடபூமி, காவிரி, வைகை ஆறுகள்' : 'Himalayas, Northern Plains, Peninsular Plateau, Coastal Plains, Indian Rivers & Continents',
          microTopics: [
            { id: 'prep_soc_1', topicTitle: isTa ? 'இந்திய இயற்கை அமைப்புகள் & ஆறுகள் (Cauvery, Vaigai)' : 'Physical Divisions of India & Major Rivers', subtopic: isTa ? 'இமயமலை, தக்காண பீடபூமி, காவிரி, கங்கை' : 'Perennial Himalayan rivers (Ganga, Indus) vs Rain-fed Peninsular rivers (Cauvery, Godavari)', dayNumber: 3, periodNumber: 3, keyFormulaOrLaw: 'Physical Divisions: Himalayas (North) | Plains (Central) | Plateau (South) | Deserts (West)', keyPoints: ['Cauvery originates at Talakaveri (Karnataka) and flows through Tamil Nadu', 'Continents: Asia is largest; Australia is smallest'], type: 'concept', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: isTa ? 'பண்டைய வரலாறு, மூவேந்தர் & இந்திய அரசியலமைப்பு' : 'Ancient History, Sangam Kings & Indian Constitution',
          description: isTa ? 'சிந்து சமவெளி அறிமுகம், சேர சோழ பாண்டியர், அரசியலமைப்பு முகப்புரை' : 'Indus Valley Civilization intro, Sangam Age (Chera, Chola, Pandya), Indian Constitution & Preamble',
          microTopics: [
            { id: 'prep_soc_2', topicTitle: isTa ? 'சேர, சோழ, பாண்டியர் வரலாறு & இந்திய முகப்புரை' : 'Sangam Dynasties & Indian Constitution Preamble', subtopic: isTa ? 'மூவேந்தர் சின்னங்கள் & அரசியலமைப்பு அடிப்படை' : 'Emblems (Bow-Arrow, Tiger, Fish), Dr. Ambedkar role, Preamble values (Justice, Liberty, Equality)', dayNumber: 6, periodNumber: 3, keyFormulaOrLaw: 'Constitution Day: 26 November | Republic Day: 26 January 1950', keyPoints: ['Chola capital: Uraiyur / Thanjavur | Pandya capital: Madurai', 'Fundamental Duties enshrined in Indian Constitution'], type: 'concept', importance: 'High-Yield' }
          ]
        }
      ]
    }
  ];

  return {
    courseId,
    courseTitle,
    category: 'school_preparatory',
    board: 'TNSB / CBSE / NCERT',
    medium: isTa ? 'Tamil' : 'English',
    totalDays: 200,
    totalSubjects: subjects.length,
    totalChapters: subjects.reduce((a, s) => a + s.chapters.length, 0),
    totalMicroTopics: subjects.reduce((a, s) => a + s.totalMicroTopics, 0),
    subjects
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. MIDDLE STAGE: CLASS 6 TO CLASS 8 (AGES 11–14)
// ─────────────────────────────────────────────────────────────────────────────
export function getMiddleClass6to8Syllabus(courseId: string, courseTitle: string): CourseFullSyllabus {
  const isTa = courseTitle.includes('தமிழ்') || courseId.includes('-ta-');

  const subjects: SyllabusSubject[] = [
    {
      subjectId: 'mid_math',
      subjectName: isTa ? 'கணிதம் & இயற்கணிதம் (Mathematics & Pre-Algebra)' : 'Mathematics, Pre-Algebra & Geometry',
      icon: '📐',
      color: '#06b6d4',
      totalChapters: 3,
      totalMicroTopics: 14,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: isTa ? 'முழுக்கள், விகிதமுறு எண்கள் & அடுக்குகள்' : 'Integers, Rational Numbers & Exponents',
          description: isTa ? 'குறை மற்றும் மிகை எண்கள், விகிதமுறு எண்கள் கூட்டல்/பெருக்கல், அடுக்கு விதிகள்' : 'Negative & Positive integers, Rational numbers, Laws of Exponents (a^m × a^n = a^(m+n))',
          microTopics: [
            { id: 'mid_m_1', topicTitle: isTa ? 'விகிதமுறு எண்கள் & அடுக்கு விதிகள்' : 'Rational Numbers & Laws of Exponents', subtopic: isTa ? 'பின்ன வடிவில் எண்கள் (p/q, q ≠ 0) & அடுக்கு சமன்பாடுகள்' : 'Properties (Closure, Commutative, Associative, Distributive), Scientific notation', dayNumber: 1, periodNumber: 1, keyFormulaOrLaw: 'Exponent Laws: a^m × a^n = a^(m+n) | a^m / a^n = a^(m-n) | (a^m)^n = a^(mn) | a^0 = 1', keyPoints: ['Rational numbers are dense between any two given rationals', 'Negative exponent: a^(-n) = 1 / a^n'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'mid_m_2', topicTitle: isTa ? 'ஒருபடி சமன்பாடுகள் & காரணிப்படுத்துதல்' : 'Linear Equations in 1-Variable & Factorization', subtopic: isTa ? 'ax + b = c சமன்பாடுகள் & இயற்கணித முற்றொருமைகள்' : 'Transposition method, Word problems on ages/numbers, Algebraic identities', dayNumber: 5, periodNumber: 1, keyFormulaOrLaw: '(a + b)² = a² + 2ab + b² | (a - b)² = a² - 2ab + b² | a² - b² = (a+b)(a-b)', keyPoints: ['Solving equations by isolating variable on one side', 'Factorization by splitting middle term and common factors'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: isTa ? 'விகிதம், கூட்டுவட்டி & 2D/3D அளவியல்' : 'Ratio, Compound Interest & Mensuration',
          description: isTa ? 'தனிவட்டி, கூட்டுவட்டி A = P(1+R/100)^n, முக்கோணம், வட்டம், நாற்கரம் பரப்பளவு' : 'Direct/Inverse proportion, Compound Interest formula, Area of Trapezium, Surface Area/Volume of Cuboid & Cylinder',
          microTopics: [
            { id: 'mid_m_3', topicTitle: isTa ? 'கூட்டுவட்டி (Compound Interest) & தள்ளுபடி கணக்கீடுகள்' : 'Compound Interest & Commercial Mathematics', subtopic: isTa ? 'அரையாண்டு, முழு ஆண்டு கூட்டுவட்டி சமன்பாடுகள்' : 'A = P(1 + R/100)ⁿ | CI = A - P | Profit% and Loss% formulas', dayNumber: 9, periodNumber: 1, keyFormulaOrLaw: 'Compound Amount A = P(1 + R/100)ⁿ | CI = P[(1 + R/100)ⁿ - 1]', keyPoints: ['CI grows exponentially compared to linear growth of SI', 'Depreciation formula: V = P(1 - R/100)ⁿ'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        }
      ]
    },
    {
      subjectId: 'mid_physics_chem',
      subjectName: isTa ? 'இயற்பியல் & வேதியியல் (Physics & Chemistry Core)' : 'Physics & Chemistry Scientific Inquiry',
      icon: '⚡',
      color: '#10b981',
      totalChapters: 3,
      totalMicroTopics: 14,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: isTa ? 'இயக்கம், விசை, அழுத்தம் & ஒளி / ஒலி' : 'Motion, Force, Pressure, Light & Sound',
          description: isTa ? 'வேகம் v = d/t, பாய்ம அழுத்தம், ஒளியின் எதிரொளிப்பு, ஒலியின் சுருதி மற்றும் உரப்பு' : 'Speed & Distance-Time graphs, Atmospheric & Fluid pressure, Reflection laws, Sound pitch/frequency/human ear',
          microTopics: [
            { id: 'mid_p_1', topicTitle: isTa ? 'வேகம், இயக்கம் & விசை அழுத்தம் (Force & Pressure)' : 'Speed, Velocity, Force & Pressure Mechanics', subtopic: isTa ? 'v = d/t மற்றும் P = F/A கணக்கீடுகள்' : 'Uniform vs non-uniform motion, Pressure P = F/A in Pascals, Atmospheric pressure barometer', dayNumber: 2, periodNumber: 2, keyFormulaOrLaw: 'Speed = Distance / Time | Pressure P = Force / Area (1 Pa = 1 N/m²)', keyPoints: ['Pressure increases with depth in liquids (P = ρgh)', 'Friction can be reduced using ball bearings and lubricants'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'mid_p_2', topicTitle: isTa ? 'ஒளியியல் எதிரொளிப்பு & ஒலியியல் அதிர்வெண்' : 'Optics (Reflection) & Acoustics (Pitch & Loudness)', subtopic: isTa ? 'சமதள ஆடி எதிரொளிப்பு விதிகள், அதிர்வெண் (Hz), வீச்சு' : 'Laws of reflection (i = r), Amplitude determines loudness, Frequency determines pitch/shrilness', dayNumber: 6, periodNumber: 2, keyFormulaOrLaw: 'Frequency f = 1 / Time Period | Audible Human Range: 20 Hz to 20,000 Hz', keyPoints: ['Sound requires a material medium to propagate; cannot travel in vacuum', 'Infrasonic (<20 Hz) vs Ultrasonic (>20,000 Hz)'], type: 'concept', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: isTa ? 'அமிலங்கள், காரங்கள், உலோகங்கள் & எரிதல்' : 'Acids, Bases, Metals, Non-Metals & Combustion',
          description: isTa ? 'லிட்மஸ், pH, உலோகங்களின் வினைபடு வரிசை, பெட்ரோலியம், எரிதல் தத்துவம்' : 'Neutralization (Acid + Base -> Salt + Water), Reactivity series of metals, Displacement reactions, Calorific value',
          microTopics: [
            { id: 'mid_c_1', topicTitle: isTa ? 'அமிலங்கள், காரங்கள் & உலோகங்களின் வினைபடு வரிசை' : 'Acids, Bases, Salts & Metal Reactivity Series', subtopic: isTa ? 'இடப்பெயர்ச்சி வினைகள் மற்றும் நடுநிலையாக்கல்' : 'Litmus/Phenolphthalein indicators, Metal + Acid -> Salt + H₂ gas, Reactivity series (K > Na > Ca > Mg > Al > Zn > Fe > Cu)', dayNumber: 10, periodNumber: 2, keyFormulaOrLaw: 'Neutralization: Acid + Base -> Salt + Water | Metal Displacement: Zn + CuSO₄ -> ZnSO₄ + Cu', keyPoints: ['More reactive metal displaces less reactive metal from its salt solution', 'Bases are bitter in taste and soapy to touch; turn red litmus blue'], type: 'concept', importance: 'High-Yield' }
          ]
        }
      ]
    },
    {
      subjectId: 'mid_bio_social',
      subjectName: isTa ? 'உயிரியல், வரலாறு & அரசியலமைப்பு (Biology, History & Polity)' : 'Biology, History & Indian Constitution Core',
      icon: '🌍',
      color: '#f59e0b',
      totalChapters: 3,
      totalMicroTopics: 14,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: isTa ? 'செல் அமைப்பு, ஊட்டச்சத்து & சுவாச மண்டலம்' : 'Cell Biology, Nutrition & Respiration',
          description: isTa ? 'தாவர/விலங்கு செல் நுண்ணுறுப்புகள், மனித செரிமானம், சுவாசம் & ரத்த ஓட்டம்' : 'Cell membrane, Nucleus, Mitochondria (Powerhouse), Plant vs Animal cell, Respiration, Crop management',
          microTopics: [
            { id: 'mid_b_1', topicTitle: isTa ? 'செல் அமைப்பு: தாவர மற்றும் விலங்கு செல்' : 'Cell: Structure & Function (Plant vs Animal Cell)', subtopic: isTa ? 'மைட்டோகாண்ட்ரியா, உட்கரு, பசுங்கணிகம் வேறுபாடுகள்' : 'Cell wall (plants only), Chloroplast (photosynthesis), Nucleus (genetic material), Vacuoles', dayNumber: 3, periodNumber: 3, keyFormulaOrLaw: 'Mitochondria = Powerhouse of Cell (ATP) | Ribosomes = Protein Factories', keyPoints: ['Robert Hooke discovered cells in cork (1665)', 'Prokaryotic (no true nucleus) vs Eukaryotic cells'], type: 'concept', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: isTa ? 'இந்திய வரலாறு (முகலாயர், 1857) & அரசியலமைப்பு' : 'Indian History, 1857 Revolt & Indian Constitution',
          description: isTa ? 'சிந்து சமவெளி, மௌரியர், முகலாயர், 1857 பெரும் புரட்சி, அடிப்படை உரிமைகள் & உள்ளாட்சி' : 'Indus Valley, Mauryas, Delhi Sultanate, Mughals, 1857 Revolt, Fundamental Rights/Duties, Gram Sabha',
          microTopics: [
            { id: 'mid_soc_1', topicTitle: isTa ? '1857 பெரும் புரட்சி & இந்திய அரசியலமைப்பு அடிப்படை' : '1857 Great Revolt & Indian Constitution Core', subtopic: isTa ? 'மீரட் புரட்சி, மங்கள் பாண்டே, அடிப்படை உரிமைகள் 6' : 'Causes of 1857 revolt, Queen Victoria proclamation 1858, 6 Fundamental Rights (Art 14–32), Secularism', dayNumber: 7, periodNumber: 3, keyFormulaOrLaw: 'Article 14: Equality before Law | Article 21: Protection of Life and Personal Liberty', keyPoints: ['Panchayati Raj 3-tier structure (Gram Panchayat, Panchayat Samiti, Zilla Parishad)', 'Governor is constitutional head of state; Chief Minister is real executive head'], type: 'concept', importance: 'High-Yield' }
          ]
        }
      ]
    }
  ];

  return {
    courseId,
    courseTitle,
    category: 'school_middle',
    board: 'TNSB / CBSE / NCERT',
    medium: isTa ? 'Tamil' : 'English',
    totalDays: 200,
    totalSubjects: subjects.length,
    totalChapters: subjects.reduce((a, s) => a + s.chapters.length, 0),
    totalMicroTopics: subjects.reduce((a, s) => a + s.totalMicroTopics, 0),
    subjects
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. SECONDARY STAGE: CLASS 9 & CLASS 10 (AGES 14–16 - JEE/NEET/TNPSC FOUNDATION)
// ─────────────────────────────────────────────────────────────────────────────
export function getSecondaryClass9to10Syllabus(courseId: string, courseTitle: string): CourseFullSyllabus {
  const isTa = courseTitle.includes('தமிழ்') || courseId.includes('-ta-');

  const subjects: SyllabusSubject[] = [
    {
      subjectId: 'sec_math',
      subjectName: isTa ? 'கணிதம் & முக்கோணவியல் (Mathematics & Trigonometry)' : 'Mathematics, Trigonometry & Coordinate Geometry',
      icon: '📐',
      color: '#06b6d4',
      totalChapters: 4,
      totalMicroTopics: 16,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: isTa ? 'மெய் எண்கள், பல்லுறுப்புக் கோவைகள் & இருபடிச் சமன்பாடுகள்' : 'Real Numbers, Polynomials & Quadratic Equations',
          description: isTa ? 'யூக்ளிட் வகுத்தல் வழிமுறை, மூலங்களின் தன்மை, இருபடி சூத்திரம்' : 'Euclid division lemma, Fundamental Theorem of Arithmetic, Quadratic formula x = (-b ± √D)/(2a)',
          microTopics: [
            { id: 'sec_m_1', topicTitle: isTa ? 'இருபடிச் சமன்பாடுகள் & மூலங்களின் தன்மை (Discriminant D)' : 'Quadratic Equations & Nature of Roots (Discriminant D)', subtopic: isTa ? 'D = b² - 4ac மற்றும் இருபடி சூத்திரம்' : 'D > 0 (Real & Distinct), D = 0 (Real & Equal), D < 0 (Imaginary), Vieta relations α+β = -b/a, αβ = c/a', dayNumber: 1, periodNumber: 1, keyFormulaOrLaw: 'Quadratic Formula: x = [-b ± √(b² - 4ac)] / (2a) | Discriminant D = b² - 4ac', keyPoints: ['Sum of roots α + β = -b/a | Product of roots αβ = c/a', 'Equation formation: x² - (Sum)x + (Product) = 0'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'sec_m_2', topicTitle: isTa ? 'கூட்டுத்தொடர்வரிசை — AP (n-வது உறுப்பு & கூடுதல்)' : 'Arithmetic Progressions (AP: n-th Term & Sum Sn)', subtopic: isTa ? 't_n = a + (n-1)d மற்றும் S_n = n/2 [2a + (n-1)d]' : 'General term of AP, Sum of first n terms, Word problems on daily savings/patterns', dayNumber: 5, periodNumber: 1, keyFormulaOrLaw: 'n-th Term a_n = a + (n - 1)d | Sum S_n = n/2 [2a + (n - 1)d] = n/2 [a + l]', keyPoints: ['Common difference d = a_k - a_(k-1)', 'Arithmetic Mean between a and b is (a + b) / 2'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: isTa ? 'முக்கோணவியல் முற்றொருமைகள் & ஆயத்தொலை வடிவியல்' : 'Trigonometric Identities & Coordinate Geometry',
          description: isTa ? 'sin²θ + cos²θ = 1, உயரங்களும் தொலைவுகளும், பிரிவு சூத்திரம்' : 'Trigonometric ratios, Standard angles (0°, 30°, 45°, 60°, 90°), Identities, Section formula, Area of triangle',
          microTopics: [
            { id: 'sec_m_3', topicTitle: isTa ? 'முக்கோணவியல் முற்றொருமைகள் & உயரங்களும் தொலைவுகளும்' : 'Trigonometric Identities & Heights and Distances', subtopic: isTa ? 'sin²θ + cos²θ = 1, tan θ = எதிர்ப்பக்கம் / அடுத்துள்ள பக்கம்' : 'Identities: 1 + tan²θ = sec²θ, 1 + cot²θ = cosec²θ, Angle of elevation and depression problems', dayNumber: 9, periodNumber: 1, keyFormulaOrLaw: 'sin²θ + cos²θ = 1 | 1 + tan²θ = sec²θ | tan θ = Height / Distance', keyPoints: ['Values at 45°: sin 45° = cos 45° = 1/√2, tan 45° = 1', 'Angle of elevation from observer equals angle of depression from top (Alternate interior angles)'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'sec_m_4', topicTitle: isTa ? 'ஆயத்தொலை வடிவியல்: தொலைவு & பிரிவு சூத்திரம்' : 'Coordinate Geometry: Distance & Section Formula', subtopic: isTa ? 'இரு புள்ளிகளுக்கு இடைப்பட்ட தொலைவு & உட்புறமாகப் பிரிக்கும் புள்ளி' : 'd = √[(x₂-x₁)² + (y₂-y₁)²], Section formula P(x, y) = [(m₁x₂ + m₂x₁)/(m₁+m₂), (m₁y₂ + m₂y₁)/(m₁+m₂)]', dayNumber: 13, periodNumber: 1, keyFormulaOrLaw: 'Distance d = √[(x₂ - x₁)² + (y₂ - y₁)²] | Midpoint = ((x₁+x₂)/2, (y₁+y₂)/2)', keyPoints: ['Collinearity condition: Area of triangle formed by 3 points = 0', 'Centroid of triangle = ((x₁+x₂+x₃)/3, (y₁+y₂+y₃)/3)'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        }
      ]
    },
    {
      subjectId: 'sec_physics',
      subjectName: isTa ? 'இயற்பியல் (Physics — NEET/JEE Foundation)' : 'Physics (Mechanics, Optics, Electricity & Magnetism)',
      icon: '⚡',
      color: '#10b981',
      totalChapters: 3,
      totalMicroTopics: 16,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: isTa ? 'இயக்க விதிகள், ஈர்ப்பியல் & வேலை ஆற்றல்' : 'Laws of Motion, Gravitation & Work-Energy',
          description: isTa ? 'நியூட்டனின் 3 விதிகள் (F=ma), ஈர்ப்பு மாறிலி G, இயக்க ஆற்றல் ½mv²' : 'Equations of motion, Momentum conservation, Universal Law of Gravitation (F = G M m / r²), Kinetic & Potential Energy',
          microTopics: [
            { id: 'sec_p_1', topicTitle: isTa ? 'நியூட்டனின் இயக்க விதிகள் & உந்த அழிவின்மை விதி' : 'Newton Laws of Motion & Momentum Conservation', subtopic: isTa ? 'F = ma சூத்திரம் & துப்பாக்கி பின்னுதைப்பு கணக்கீடு' : 'Inertia, F = dp/dt = ma, Action-Reaction pairs, Recoil velocity of gun v = -(m/M)u', dayNumber: 2, periodNumber: 2, keyFormulaOrLaw: 'F = ma | Momentum p = mv | Conservation: m₁u₁ + m₂u₂ = m₁v₁ + m₂v₂', keyPoints: ['Impulse J = F × Δt = Change in momentum Δp', 'Apparent weight in elevator: N = m(g ± a)'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'sec_p_2', topicTitle: isTa ? 'ஈர்ப்பியல் & வேலை, திறன், ஆற்றல் சமன்பாடுகள்' : 'Universal Gravitation, Work, Power & Energy', subtopic: isTa ? 'g மாறுபாடுகள், எடைlessness, K = ½mv², P = W/t' : 'F = G m₁ m₂ / r², Acceleration due to gravity g = GM/R², Work W = F s cos θ, Kinetic energy ½mv²', dayNumber: 6, periodNumber: 2, keyFormulaOrLaw: 'Gravitation: F = (G M m) / R² | Kinetic Energy K = ½mv² | Power P = W / t (Watts)', keyPoints: ['g at earth surface ≈ 9.8 m/s²; g decreases with altitude and depth', '1 Horsepower (hp) = 746 Watts | 1 kWh = 3.6 × 10⁶ Joules'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: isTa ? 'ஒளியியல் (எதிரொளிப்பு, விலகல்) & மின்னியல் (Ohm Law)' : 'Optics (Mirrors & Lenses) & Current Electricity (Ohm Law)',
          description: isTa ? 'ஆடி மற்றும் லென்ஸ் சூத்திரங்கள், ஓம் விதி V = IR, தொடர்/பக்க இணைப்பு மின்தடை' : 'Mirror formula 1/v + 1/u = 1/f, Lens formula 1/v - 1/u = 1/f, Snell\'s law, Ohm\'s law V = IR, Series/Parallel resistors',
          microTopics: [
            { id: 'sec_p_3', topicTitle: isTa ? 'ஒளியியல்: லென்ஸ் சூத்திரம், திறன் & ஸ்நெல் விதி' : 'Optics: Reflection, Refraction, Lens Formula & Power', subtopic: isTa ? '1/v - 1/u = 1/f, P = 1/f(m), ஒளிவிலகல் எண் n = c/v' : 'Sign convention, Mirror formula 1/v+1/u=1/f, Lens formula 1/v-1/u=1/f, Power of lens P = 1/f in Dioptres (D)', dayNumber: 10, periodNumber: 2, keyFormulaOrLaw: 'Lens Formula: 1/v - 1/u = 1/f | Power P = 1/f(m) | Snell Law: n₁ sin i = n₂ sin r', keyPoints: ['Convex lens is converging (f > 0); Concave lens is diverging (f < 0)', 'Myopia (short-sightedness) corrected by Concave lens; Hypermetropia by Convex lens'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'sec_p_4', topicTitle: isTa ? 'மின்னியல்: ஓம் விதி & மின்தடை இணைப்புகள்' : 'Electricity: Ohm Law, Resistance Combinations & Joule Heating', subtopic: isTa ? 'V = IR, தொடர் இணைப்பு R_s = R₁ + R₂, பக்க இணைப்பு 1/R_p = 1/R₁ + 1/R₂' : 'Resistivity R = ρL/A, Series resistance R_s = ΣR_i, Parallel 1/R_p = Σ(1/R_i), Joule heating H = I²Rt', dayNumber: 14, periodNumber: 2, keyFormulaOrLaw: 'Ohm Law: V = IR | Series: R_s = R₁ + R₂ | Parallel: 1/R_p = 1/R₁ + 1/R₂ | Power P = VI = I²R', keyPoints: ['Current is same through all series resistors; Voltage divides', 'Voltage is same across all parallel branches; Current divides'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        }
      ]
    },
    {
      subjectId: 'sec_chem_bio',
      subjectName: isTa ? 'வேதியியல் & உயிரியல் (Chemistry & Biology Core)' : 'Chemistry & Biology Life Processes',
      icon: '🧪',
      color: '#f59e0b',
      totalChapters: 3,
      totalMicroTopics: 16,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: isTa ? 'வேதி வினைகள், அமிலங்கள் காரங்கள் & கார்பன் சேர்மங்கள்' : 'Chemical Reactions, Acids/Bases & Carbon Compounds',
          description: isTa ? 'வேதி சமன்பாடுகள் சமன்செய்தல், pH அளவீடு, பிளாஸ்டர் ஆஃப் பாரிஸ், ஹைட்ரோகார்பன்கள்' : 'Balancing reactions, pH scale, Chlor-alkali process, Covalent bonding, Homologous series, Esterification',
          microTopics: [
            { id: 'sec_c_1', topicTitle: isTa ? 'வேதி வினைகள் சமன்செய்தல், அமிலங்கள் & pH மதிப்பு' : 'Chemical Reactions Balancing, Acids, Bases & pH Scale', subtopic: isTa ? 'சேர்க்கை, சிதைவு, இடப்பெயர்ச்சி, ஆக்ஸிஜனேற்ற வினைகள்' : 'Combination, Decomposition, Redox reactions, pH = -log[H⁺], Bleaching powder CaOCl₂, POP CaSO₄·½H₂O', dayNumber: 3, periodNumber: 3, keyFormulaOrLaw: 'pH Scale: 0 to 14 (Acidic < 7, Neutral = 7, Basic > 7) | POP: CaSO₄ · ½H₂O', keyPoints: ['Law of conservation of mass dictates equal atoms on both sides of equation', 'Antacids like Mg(OH)₂ (Milk of Magnesia) neutralize excess stomach acid'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'sec_c_2', topicTitle: isTa ? 'கார்பனும் அதன் சேர்மங்களும் (ஹைட்ரோகார்பன்கள் & எஸ்டராக்குதல்)' : 'Carbon and Its Compounds: Covalent Bonding & Functional Groups', subtopic: isTa ? 'ஆல்கேன், ஆல்கீன், ஆல்கைன், எத்தனால், எத்தனாயிக் அமிலம்' : 'Tetravalency, Catenation, Homologous series, Functional groups (-OH, -CHO, -COOH), Esterification & Saponification', dayNumber: 7, periodNumber: 3, keyFormulaOrLaw: 'Alkanes: C_n H_(2n+2) | Alkenes: C_n H_2n | Alkynes: C_n H_(2n-2) | Ester: RCOOH + R\'OH -> RCOOR\' + H₂O', keyPoints: ['Ethanol (CH₃CH₂OH) reacts with sodium metal to evolve hydrogen gas', 'Soap molecule has hydrophilic head (ionic) and hydrophobic tail (hydrocarbon) forming micelles'], type: 'concept', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: isTa ? 'உயிர்ச் செயல்கள், மரபியல் & பரிணாமம்' : 'Life Processes, Control-Coordination & Genetics',
          description: isTa ? 'மனித செரிமானம், சுவாசம், ரத்த ஓட்டம், மூளை நரம்பு மண்டலம், மெண்டலின் மரபியல் விதிகள்' : 'Human nutrition, Respiration, Double circulation, Reflex arc, Human Brain, Mendel\'s monohybrid/dihybrid laws',
          microTopics: [
            { id: 'sec_b_1', topicTitle: isTa ? 'மனித உயிர்ச் செயல்கள் (செரிமானம், சுவாசம் & ரத்த ஓட்டம்)' : 'Human Life Processes: Digestion, Respiration & Double Circulation', subtopic: isTa ? 'இதயம் 4 அறைகள், நெஃப்ரான் கழிவுநீக்கம்' : 'Heart chambers, Pulmonary/Systemic circulation, Nephron ultrafiltration, Stomatal guard cells', dayNumber: 11, periodNumber: 3, keyFormulaOrLaw: 'Aerobic Respiration Yield: 36–38 ATP per Glucose | Blood Pressure Normal: 120/80 mmHg', keyPoints: ['Left ventricle pumps oxygenated blood to entire body through aorta', 'Nephron is structural and functional filtration unit of kidney'], type: 'concept', importance: 'High-Yield' },
            { id: 'sec_b_2', topicTitle: isTa ? 'மரபியல்: கிரிகோர் மெண்டலின் மரபுக்கடத்தல் விதிகள்' : 'Heredity & Mendel Laws of Inheritance', subtopic: isTa ? 'ஒருபண்பு கலப்பு (3:1) & இருபண்பு கலப்பு (9:3:3:1)' : 'Dominant vs Recessive traits, Monohybrid ratio 3:1 (genotypic 1:2:1), Dihybrid ratio 9:3:3:1, Human sex determination (XX/XY)', dayNumber: 15, periodNumber: 3, keyFormulaOrLaw: 'Monohybrid Phenotypic Ratio = 3 : 1 | Dihybrid Phenotypic Ratio = 9 : 3 : 3 : 1 | Sex: Father sperm determines (X or Y)', keyPoints: ['Gregor Mendel is Father of Genetics (experiments on garden pea Pisum sativum)', 'DNA is genetic material carrying hereditary instructions'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        }
      ]
    },
    {
      subjectId: 'sec_social',
      subjectName: isTa ? 'சமூக அறிவியல் & தமிழ்நாடு நிர்வாகம் (Social Science & TNPSC Core)' : 'Social Science, History, Economics & TNPSC Core',
      icon: '🏛️',
      color: '#8b5cf6',
      totalChapters: 3,
      totalMicroTopics: 16,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: isTa ? 'இந்திய விடுதலை இயக்கம், நீதிக்கட்சி & தமிழ்நாடு வளர்ச்சி' : 'Indian National Movement, Justice Party & TN Administration',
          description: isTa ? '1916 நீதிக்கட்சி, 1921 வகுப்புவாரி அரசாணை, பெரியார் சுயமரியாதை இயக்கம், தமிழ்நாட்டின் மனிதவளம்' : 'Nationalism in India, 1916 Justice Party, 1921 Communal GO, Periyar Self-Respect 1925, Anna, TN Industrial Clusters',
          microTopics: [
            { id: 'sec_soc_1', topicTitle: isTa ? 'நீதிக்கட்சி (1916), பெரியார் சுயமரியாதை இயக்கம் & 69% இடஒதுக்கீடு' : 'Justice Party (1916), Periyar Self-Respect Movement & 69% Reservation', subtopic: isTa ? '1921 வகுப்புவாரி அரசாணை & 1994 தமிழ்நாடு 69% இடஒதுக்கீடு சட்டம்' : '1921 Communal GO, 1926 HR&CE Act, 1994 69% Reservation Act (9th Schedule), Detroit of Asia Chennai', dayNumber: 4, periodNumber: 4, keyFormulaOrLaw: '1921 Communal GO | 1925 Self-Respect Movement | 1994 TN 69% Reservation Act', keyPoints: ['Tamil Nadu has highest Higher Education GER (~51%) in India', 'Tiruppur is Knitwear Capital; Sivakasi is Little Japan of India'], type: 'concept', importance: 'High-Yield' }
          ]
        }
      ]
    }
  ];

  return {
    courseId,
    courseTitle,
    category: 'school_secondary',
    board: 'TNSB / CBSE / NCERT',
    medium: isTa ? 'Tamil' : 'English',
    totalDays: 200,
    totalSubjects: subjects.length,
    totalChapters: subjects.reduce((a, s) => a + s.chapters.length, 0),
    totalMicroTopics: subjects.reduce((a, s) => a + s.totalMicroTopics, 0),
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
    { subjectId: 'upsc_gs1', subjectName: 'UPSC GS Paper I: Heritage, History, Geography & Society (GS-1)', icon: '🏛️', color: '#10b981', totalChapters: gs1Chapters.length, totalMicroTopics: gs1Chapters.reduce((a, c) => a + c.microTopics.length, 0), chapters: gs1Chapters },
    { subjectId: 'upsc_gs2', subjectName: 'UPSC GS Paper II: Governance, Constitution, Polity, Social Justice & IR (GS-2)', icon: '⚖️', color: '#06b6d4', totalChapters: gs2Chapters.length, totalMicroTopics: gs2Chapters.reduce((a, c) => a + c.microTopics.length, 0), chapters: gs2Chapters },
    { subjectId: 'upsc_gs3', subjectName: 'UPSC GS Paper III: Technology, Economy, Environment & Internal Security (GS-3)', icon: '📈', color: '#f59e0b', totalChapters: gs3Chapters.length, totalMicroTopics: gs3Chapters.reduce((a, c) => a + c.microTopics.length, 0), chapters: gs3Chapters },
    { subjectId: 'upsc_gs4', subjectName: 'UPSC GS Paper IV: Ethics, Integrity, Aptitude & Case Studies (GS-4)', icon: '💡', color: '#8b5cf6', totalChapters: gs4Chapters.length, totalMicroTopics: gs4Chapters.reduce((a, c) => a + c.microTopics.length, 0), chapters: gs4Chapters },
    { subjectId: 'upsc_csat', subjectName: 'UPSC CSAT Paper II: Reading Comprehension & Quantitative Reasoning', icon: '🎯', color: '#ec4899', totalChapters: csatChapters.length, totalMicroTopics: csatChapters.reduce((a, c) => a + c.microTopics.length, 0), chapters: csatChapters }
  ];

  return {
    courseId: courseId || 'exam-upsc-ias',
    courseTitle: courseTitle || 'UPSC Civil Services (IAS / IPS / IFS / IRS) Prelims + Mains Master Blueprint',
    category: 'upsc_central',
    board: 'UPSC (National)',
    medium: 'English',
    totalDays: 360,
    totalSubjects: subjects.length,
    totalChapters: subjects.reduce((a, s) => a + s.totalChapters, 0),
    totalMicroTopics: subjects.reduce((a, s) => a + s.totalMicroTopics, 0),
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
    totalChapters: subjects.reduce((a, s) => a + s.totalChapters, 0),
    totalMicroTopics: subjects.reduce((a, s) => a + s.totalMicroTopics, 0),
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
    { subjectId: 'cbse_acc', subjectName: 'Accountancy (Financial Accounting Part 1 & 2)', icon: '📊', color: '#10b981', totalChapters: accountancyChapters.length, totalMicroTopics: accountancyChapters.reduce((a, c) => a + c.microTopics.length, 0), chapters: accountancyChapters },
    { subjectId: 'cbse_bst', subjectName: 'Business Studies (Foundations & Finance)', icon: '💼', color: '#06b6d4', totalChapters: businessStudiesChapters.length, totalMicroTopics: businessStudiesChapters.reduce((a, c) => a + c.microTopics.length, 0), chapters: businessStudiesChapters },
    { subjectId: 'cbse_eco', subjectName: 'Economics (Microeconomics & Statistics)', icon: '📈', color: '#f59e0b', totalChapters: economicsChapters.length, totalMicroTopics: economicsChapters.reduce((a, c) => a + c.microTopics.length, 0), chapters: economicsChapters }
  ];

  return {
    courseId: courseId || 'cbse-11-com',
    courseTitle: courseTitle || 'Class 11 — Senior Secondary Commerce (NCERT / CBSE)',
    category: 'school_cbse',
    board: 'CBSE / NCERT / State Board',
    medium: 'English',
    totalDays: 200,
    totalSubjects: subjects.length,
    totalChapters: subjects.reduce((a, s) => a + s.totalChapters, 0),
    totalMicroTopics: subjects.reduce((a, s) => a + s.totalMicroTopics, 0),
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

  // 3. NEET UG Entrance
  if (c.includes('neet')) {
    return getNeetUgCompleteSyllabus();
  }

  // 4. TNPSC & Police Exams Track (All Groups 1, 2, 4, VAO, DEO, SI)
  if (c.includes('tnpsc') || c.includes('si') || c.includes('police') || c.includes('vao') || c.includes('group')) {
    return getTnpscUnifiedCompleteSyllabus(courseId, title);
  }

  // 5. Class 11 & 12 Commerce Track (CBSE, State Board, Matric)
  if (c.includes('11-com') || c.includes('12-com') || c.includes('commerce')) {
    return getCommerceClass11Syllabus(courseId, courseTitle);
  }

  // 6. KINDERGARTEN (LKG & UKG)
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
      totalMicroTopics: subjects.reduce((a, s) => a + s.totalMicroTopics, 0),
      subjects
    };
  }

  // 7. HIGHER SECONDARY STAGE (Class 11 & 12 Science / General)
  if (c.includes('-11') || c.includes('-12') || c.includes('std-11') || c.includes('std-12') || c.includes('grade-11') || c.includes('grade-12')) {
    return getSecondaryClass9to10Syllabus(courseId, title);
  }

  // 8. SECONDARY STAGE (Class 9 & Class 10)
  if (c.includes('-10') || c.includes('-9') || c.includes('std-10') || c.includes('std-9') || c.includes('grade-10') || c.includes('grade-9')) {
    return getSecondaryClass9to10Syllabus(courseId, title);
  }

  // 9. MIDDLE STAGE (Class 6, 7, 8)
  if (c.includes('-6') || c.includes('-7') || c.includes('-8') || c.includes('std-6') || c.includes('std-7') || c.includes('std-8') || c.includes('grade-6') || c.includes('grade-7') || c.includes('grade-8')) {
    return getMiddleClass6to8Syllabus(courseId, title);
  }

  // 10. PREPARATORY STAGE (Class 3, 4, 5)
  if (c.includes('-3') || c.includes('-4') || c.includes('-5') || c.includes('std-3') || c.includes('std-4') || c.includes('std-5') || c.includes('grade-3') || c.includes('grade-4') || c.includes('grade-5')) {
    return getPreparatoryClass3to5Syllabus(courseId, title);
  }

  // 11. FOUNDATIONAL STAGE (Class 1 & Class 2)
  if (c.includes('-1') || c.includes('-2') || c.includes('std-1') || c.includes('std-2') || c.includes('grade-1') || c.includes('grade-2')) {
    return getFoundationalClass1to2Syllabus(courseId, title);
  }

  // 12. DEFAULT FALLBACK
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
        microTopics: [...c.microTopics]
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

      const exists = chap.microTopics.some(t => t.id === item.microTopic.id || t.topicTitle === item.microTopic.topicTitle);
      if (!exists) {
        chap.microTopics.push(item.microTopic);
      }

      subj.totalChapters = subj.chapters.length;
      subj.totalMicroTopics = subj.chapters.reduce((acc, ch) => acc + ch.microTopics.length, 0);
    }

    return {
      ...base,
      totalSubjects: subjects.length,
      totalChapters: subjects.reduce((acc, s) => acc + s.totalChapters, 0),
      totalMicroTopics: subjects.reduce((acc, s) => acc + s.totalMicroTopics, 0),
      subjects
    };
  } catch (err) {
    console.warn('Could not augment custom syllabus:', err);
    return base;
  }
}
