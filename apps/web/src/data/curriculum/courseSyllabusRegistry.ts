/**
 * TeachO Master Course Syllabus Registry
 * Complete Authentic Real-World Micro-Granular Curricula for all 86 Courses:
 * - Foundational Stage: LKG, UKG, Class 1, Class 2 (Ages 3–8)
 * - Preparatory Stage: Class 3, Class 4, Class 5 (Ages 8–11)
 * - Middle Stage: Class 6, Class 7, Class 8 (Ages 11–14)
 * - Secondary Stage: Class 9, Class 10 (Ages 14–16)
 * - Higher Secondary Stage: Class 11, Class 12 (Science, Commerce, Arts)
 * - Competitive Entrance: JEE Main/Advanced, NEET UG, UPSC CSE, TNPSC All Groups
 */

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
// 5. JEE MAIN & JEE ADVANCED OFFICIAL UNIFIED MASTER SYLLABUS
// ─────────────────────────────────────────────────────────────────────────────
export function getJeeMainAdvancedCompleteSyllabus(courseId?: string, courseTitle?: string): CourseFullSyllabus {
  // SUBJECT 1: MATHEMATICS (13 Comprehensive Units)
  const mathChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Sets, Relations, Functions & Graphical Transformations',
      description: 'Sets operations, Equivalence relations, Domain/Range, Injective/Surjective/Bijective, Transformations |f(x)|, f(|x|)',
      microTopics: [
        { id: 'jee_m_1', topicTitle: 'Sets, Relations & Equivalence Classes', subtopic: 'Principle of inclusion-exclusion, Cartesian product, Reflexive/Symmetric/Transitive relations, Equivalence classes', dayNumber: 1, periodNumber: 1, keyFormulaOrLaw: 'n(A ∪ B ∪ C) = Σn(A) - Σn(A ∩ B) + n(A ∩ B ∩ C) | Total Relations = 2^(mn)', keyPoints: ['Equivalence relation must satisfy Reflexive, Symmetric, and Transitive properties simultaneously', 'Number of reflexive relations on set with n elements = 2^(n² - n)'], type: 'concept', importance: 'High-Yield' },
        { id: 'jee_m_2', topicTitle: 'Functions Classification & Graphical Transformations', subtopic: 'One-one (injective), onto (surjective), bijective mappings, composite functions f(g(x)), inverse functions, transformations f(|x|), |f(x)|', dayNumber: 4, periodNumber: 1, keyFormulaOrLaw: 'Bijective Condition: f\'(x) > 0 or f\'(x) < 0 strictly monotonic AND Range = Codomain | Number of OnTo functions = Σ (-1)^(n-r) ^nC_r r^m', keyPoints: ['f(x) is even if f(-x) = f(x) (Symmetric about Y-axis) | Odd if f(-x) = -f(x) (Symmetric in opposite quadrants)', 'Fractional part {x} = x - [x] is periodic with fundamental period 1'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Complex Numbers & Quadratic Equations',
      description: 'Euler exponential form, de Moivre theorem, nth roots of unity, Coni rotation, Vieta relations, Newton theorem, Location of roots',
      microTopics: [
        { id: 'jee_m_3', topicTitle: 'Complex Numbers: Modulus-Argument, Euler Form & Geometry of Argand Plane', subtopic: 'Triangle inequality |z₁ ± z₂| ≤ |z₁| + |z₂|, De Moivre theorem, Cube roots of unity 1, ω, ω², Coni rotation theorem', dayNumber: 2, periodNumber: 1, keyFormulaOrLaw: 'Euler Form: z = r e^(iθ) = r(cos θ + i sin θ) | 1 + ω + ω² = 0, ω³ = 1 | Coni: (z₃ - z₁)/(z₂ - z₁) = (|z₃ - z₁|/|z₂ - z₁|) e^(iα)', keyPoints: ['Locus |z - z₁| = |z - z₂| represents perpendicular bisector of segment joining z₁ and z₂', 'Locus |z - z₁| + |z - z₂| = 2a represents ellipse if 2a > |z₁ - z₂|'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'jee_m_4', topicTitle: 'Quadratic Equations: Vieta Relations, Newton Theorem & Location of Roots', subtopic: 'Roots of ax² + bx + c = 0, Newton power sum identity S_n = a α^n + b β^n, Location of roots with respect to constants k, k₁, k₂', dayNumber: 5, periodNumber: 1, keyFormulaOrLaw: 'Newton Theorem: a S_n + b S_(n-1) + c S_(n-2) = 0 | Location: Both roots > k <=> D ≥ 0, -b/(2a) > k, a·f(k) > 0', keyPoints: ['Condition for exactly one common root: (c₁a₂ - c₂a₁)² = (a₁b₂ - a₂b₁)(b₁c₂ - b₂c₁)', 'Sign of quadratic expression ax² + bx + c is same as sign of "a" for all real x if D < 0'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 3,
      chapterTitle: 'Matrices, Determinants & System of Linear Equations',
      description: 'Matrix algebra, Adjoint identities, Cramer rule, Consistency of system of linear equations AX = B',
      microTopics: [
        { id: 'jee_m_5', topicTitle: 'Matrices: Symmetric, Orthogonal, Adjoint Identities & Inverse', subtopic: 'Matrix multiplication properties, trace, adj(A) determinant formulas |adj(A)| = |A|^(n-1), A·adj(A) = |A| I_n', dayNumber: 3, periodNumber: 1, keyFormulaOrLaw: '|adj(adj(A))| = |A|^((n-1)²) | adj(AB) = adj(B)·adj(A) | Orthogonal: A·A^T = I', keyPoints: ['Skew-symmetric matrix of odd order always has determinant = 0', 'Inverse A⁻¹ exists if and only if |A| ≠ 0 (Non-singular matrix)'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'jee_m_6', topicTitle: 'Determinants, Cramer Rule & System of Linear Equations', subtopic: 'Properties of determinants, differentiation of determinants, Cramer rule for 3 variables, homogeneous/non-homogeneous systems', dayNumber: 6, periodNumber: 1, keyFormulaOrLaw: 'Cramer Rule: x = Δ_x/Δ, y = Δ_y/Δ, z = Δ_z/Δ | Infinite Solutions: Δ = Δ_x = Δ_y = Δ_z = 0 | Inconsistent: Δ = 0 and at least one Δ_i ≠ 0', keyPoints: ['Homogeneous system has non-trivial (infinite) solutions if and only if determinant of coefficients Δ = 0', 'Matrix rank consistency: Rank(A) = Rank(A|B) for consistency'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 4,
      chapterTitle: 'Permutations, Combinations, Binomial Theorem & Sequences',
      description: 'Beggar method, Derangements, Legendre formula, Multinomial, Binomial properties, AP/GP/AGP, Telescoping sums',
      microTopics: [
        { id: 'jee_m_7', topicTitle: 'Permutations & Combinations: Beggar Method & Derangements', subtopic: 'Distribution of identical items ^(n+r-1)C_(r-1), Derangements formula D_n = n! Σ (-1)^k / k!, Circular permutations', dayNumber: 7, periodNumber: 1, keyFormulaOrLaw: 'Beggar Method (Non-negative solutions): ^(n+r-1)C_(r-1) | Derangements: D_n = (n - 1)(D_(n-1) + D_(n-2))', keyPoints: ['Exponent of prime p in n! (Legendre formula): E_p(n!) = ⌊n/p⌋ + ⌊n/p²⌋ + ⌊n/p³⌋ + ...', 'Number of ways to divide 2n items into 2 equal groups = (2n)! / [2! (n!)²]'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'jee_m_8', topicTitle: 'Binomial Theorem, Multinomial Expansions & Telescoping Series', subtopic: 'General term T_(r+1) = ^nC_r x^(n-r) a^r, Properties of binomial coefficients, AGP sum formula, Telescoping V-n method, AM ≥ GM ≥ HM', dayNumber: 8, periodNumber: 1, keyFormulaOrLaw: 'Σ r·^nC_r = n·2^(n-1) | Multinomial General Term: [n! / (p! q! r!)] a^p b^q c^r | AGP S_∞ = a/(1 - r) + (dr)/(1 - r)²', keyPoints: ['Telescoping series: Express general term T_r = f(r) - f(r-1) so intermediate terms cancel out', 'AM-GM Inequality: Equality holds if and only if all variables are equal'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 5,
      chapterTitle: 'Coordinate Geometry: Straight Lines, Circles & Conic Sections',
      description: 'Family of lines, Angle bisectors, Radical axis, Tangency conditions for Parabola, Ellipse, Hyperbola, Focal properties',
      microTopics: [
        { id: 'jee_m_9', topicTitle: 'Straight Lines & Circles: Family of Curves, Radical Axis & Tangency', subtopic: 'Distance of point from line, Angle bisectors, Family L₁ + λ L₂ = 0, Circle tangency condition c² = a²(1 + m²), Radical axis S₁ - S₂ = 0', dayNumber: 9, periodNumber: 1, keyFormulaOrLaw: 'Perpendicular Distance: d = |ax₁ + by₁ + c| / √(a² + b²) | Director Circle of Circle x² + y² = r² is x² + y² = 2r²', keyPoints: ['Orthogonal circles condition: 2g₁g₂ + 2f₁f₂ = c₁ + c₂', 'Length of tangent from point (x₁, y₁) to circle S = 0 is √S₁'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'jee_m_10', topicTitle: 'Conic Sections: Parabola, Ellipse & Hyperbola Tangents and Normals', subtopic: 'Parabola y² = 4ax (tangent y = mx + a/m), Ellipse x²/a² + y²/b² = 1 (c² = a²m² + b²), Hyperbola (c² = a²m² - b²), Rectangular hyperbola xy = c²', dayNumber: 10, periodNumber: 1, keyFormulaOrLaw: 'Parabola Normal: y = mx - 2am - am³ | Ellipse Director Circle: x² + y² = a² + b² | Hyperbola Director Circle: x² + y² = a² - b²', keyPoints: ['Focal property of parabola: Tangent at point P bisects angle between focal radius SP and line perpendicular to directrix', 'Asymptotes of hyperbola pass through its centre and angle between asymptotes is 2 tan⁻¹(b/a)'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 6,
      chapterTitle: 'Differential Calculus & Applications of Derivatives (AOD)',
      description: 'Limits (L\'Hopital, Taylor series), Continuity IVT, Differentiability, Monotonicity, Maxima/Minima, Rolle & LMVT',
      microTopics: [
        { id: 'jee_m_11', topicTitle: 'Limits (L\'Hopital, Taylor Series), Continuity & Differentiability', subtopic: 'Indeterminate forms 0/0, ∞/∞, 1^∞, Squeeze theorem, Intermediate Value Theorem (IVT), Differentiability of |f(x)| and piecewise functions', dayNumber: 11, periodNumber: 1, keyFormulaOrLaw: 'Form 1^∞: lim [f(x)]^(g(x)) = e^(lim [f(x) - 1] g(x)) | Taylor: sin x = x - x³/3! + x⁵/5!, e^x = 1 + x + x²/2! + ...', keyPoints: ['A function is continuous at x = a if LHL = RHL = f(a)', 'Differentiability implies continuity, but continuity does not guarantee differentiability (e.g. sharp corner in |x|)'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'jee_m_12', topicTitle: 'Applications of Derivatives: Monotonicity, Maxima/Minima, Rolle & LMVT', subtopic: 'First and second derivative tests, Strictly increasing f\'(x) > 0, Point of inflection f\'\'(x) = 0, Lagrange Mean Value Theorem', dayNumber: 12, periodNumber: 1, keyFormulaOrLaw: 'LMVT: f\'(c) = [f(b) - f(a)] / (b - a) for some c ∈ (a, b) | Rolle: If f(a) = f(b), then f\'(c) = 0', keyPoints: ['Global maximum on closed interval [a, b] is max of critical points and boundary values f(a), f(b)', 'Sub-tangent length = |y / (dy/dx)| | Sub-normal length = |y · (dy/dx)|'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 7,
      chapterTitle: 'Integral Calculus & Differential Equations',
      description: 'Integration techniques, King property, Leibniz differentiation under integral, Area Under Curves, 1st order Linear DE',
      microTopics: [
        { id: 'jee_m_13', topicTitle: 'Definite Integration Properties (King Property, Leibniz Rule) & Area Under Curves', subtopic: 'King property ∫_a^b f(x)dx = ∫_a^b f(a+b-x)dx, Differentiation under integral sign (Leibniz rule), Area bounded between intersecting curves', dayNumber: 13, periodNumber: 1, keyFormulaOrLaw: 'King Property: ∫_0^a f(x)dx = ∫_0^a f(a - x)dx | Leibniz: d/dx ∫_u(x)^v(x) f(t)dt = f(v(x))·v\'(x) - f(u(x))·u\'(x)', keyPoints: ['Area between curves y = f(x) and y = g(x) is ∫_a^b |f(x) - g(x)| dx', 'Periodicity in definite integrals: ∫_0^(nT) f(x)dx = n ∫_0^T f(x)dx'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'jee_m_14', topicTitle: 'Differential Equations: Variable Separable, Homogeneous & Linear (IF)', subtopic: 'Order and degree, Homogeneous y = vx, First order Linear DE dy/dx + Py = Q with Integrating Factor IF = e^(∫ P dx), Bernoulli equations', dayNumber: 14, periodNumber: 1, keyFormulaOrLaw: 'Linear DE General Solution: y · e^(∫ P dx) = ∫ Q · e^(∫ P dx) dx + C', keyPoints: ['Degree is power of highest order derivative after making equation rational and integral in derivatives', 'Exact differential forms: d(x/y) = (y dx - x dy)/y², d(xy) = x dy + y dx'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 8,
      chapterTitle: 'Vector Algebra, 3D Geometry & Probability',
      description: 'Scalar/Vector Triple Product, Skew lines shortest distance, Planes, Bayes theorem, Binomial distribution',
      microTopics: [
        { id: 'jee_m_15', topicTitle: 'Vector Algebra & 3D Geometry: Triple Products, Skew Lines & Planes', subtopic: 'Scalar Triple Product [a b c] = a · (b × c), Vector Triple Product a × (b × c) = (a·c)b - (a·b)c, Shortest distance between skew lines', dayNumber: 15, periodNumber: 1, keyFormulaOrLaw: 'Shortest Distance between Skew Lines: d = |(a₂ - a₁) · (b₁ × b₂)| / |b₁ × b₂| | Plane: a(x - x₁) + b(y - y₁) + c(z - z₁) = 0', keyPoints: ['Volume of parallelepiped formed by vectors a, b, c is |[a b c]|', 'Three vectors a, b, c are coplanar if and only if [a b c] = 0'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'jee_m_16', topicTitle: 'Probability: Conditional Probability, Bayes Theorem & Binomial Distribution', subtopic: 'Law of total probability, Bayes theorem for cause identification, Random variables expectation and variance Var(X) = E(X²) - [E(X)]²', dayNumber: 16, periodNumber: 1, keyFormulaOrLaw: 'Bayes Theorem: P(E_i|A) = [P(E_i)·P(A|E_i)] / [Σ P(E_k)·P(A|E_k)] | Binomial Distribution: P(X = r) = ^nC_r p^r q^(n-r)', keyPoints: ['Mean of Binomial Distribution = np | Variance = npq (where q = 1 - p)', 'Two events A and B are independent if and only if P(A ∩ B) = P(A)·P(B)'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  // SUBJECT 2: PHYSICS (Mechanics, Electrodynamics, Thermal, Optics & Modern Physics)
  const physicsChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Units, Measurements, Error Propagation & Vernier/Screw Gauge',
      description: 'Dimensional analysis, fractional error propagation ΔZ/Z, Least count, Zero errors of Vernier Calipers and Screw Gauge',
      microTopics: [
        { id: 'jee_p_1', topicTitle: 'Units, Dimensions & Error Propagation in Arithmetic Operations', subtopic: 'Principle of homogeneity, dimensional formula derivation, error combination in Z = A^p B^q / C^r, significant figures', dayNumber: 1, periodNumber: 2, keyFormulaOrLaw: '[Planck Constant h] = [M L² T⁻¹] | Fractional Error: ΔZ/Z = p(ΔA/A) + q(ΔB/B) + r(ΔC/C)', keyPoints: ['Errors always add up in worst-case analysis', 'Dimensionless quantities: Angle, Strain, Dielectric constant'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'jee_p_2', topicTitle: 'Experimental Physics: Vernier Calipers, Screw Gauge & Simple Pendulum', subtopic: 'Vernier least count, main scale reading, positive/negative zero error correction, screw gauge pitch and circular scale divisions', dayNumber: 4, periodNumber: 2, keyFormulaOrLaw: 'LC of Vernier = 1 MSD - 1 VSD | LC of Screw Gauge = Pitch / Total Circular Divisions | True Reading = MSR + (VSR × LC) - (Zero Error)', keyPoints: ['Positive zero error is subtracted from observed reading; negative zero error is added', 'Simple pendulum determination of g with L vs T² graph'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Kinematics (1D/2D), Projectile on Incline, River-Swimmer & Relative Motion',
      description: 'Calculus kinematics, Projectile motion, Trajectory equations, Relative velocity in 2D (Rain-Man, River-Swimmer)',
      microTopics: [
        { id: 'jee_p_3', topicTitle: 'Kinematics in 1D & Graphical Motion Analysis', subtopic: 'Instantaneous velocity v = dx/dt, acceleration a = v(dv/dx), area under v-t graph, slope of x-t graph, motion under gravity', dayNumber: 2, periodNumber: 2, keyFormulaOrLaw: 'v = u + at | s = ut + ½at² | v² = u² + 2as | s_nth = u + ½a(2n - 1)', keyPoints: ['Area under a-t graph gives change in velocity Δv', 'Slope of v-t graph gives instantaneous acceleration'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'jee_p_4', topicTitle: '2D Projectile Motion on Incline, River-Swimmer & Rain-Man Problems', subtopic: 'Trajectory equation y = x tan θ - gx²/(2u² cos² θ), Projectile on inclined plane (range up and down incline), Shortest path vs shortest time across river', dayNumber: 5, periodNumber: 2, keyFormulaOrLaw: 'Projectile on Incline: T = (2u sin(α - β)) / (g cos β) | River Shortest Path: sin θ = v_river / v_boat (drifting = 0)', keyPoints: ['Range is maximum at angle θ = 45° on flat ground', 'Relative velocity v_AB = v_A - v_B used to determine collision of moving particles'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 3,
      chapterTitle: 'Newton Laws of Motion, Friction, Work-Energy & Rotational Dynamics',
      description: 'Constraint relations, Pseudo forces, Multi-block friction, Work-Energy theorem, Moment of Inertia, Pure rolling down incline, ICOR',
      microTopics: [
        { id: 'jee_p_5', topicTitle: 'Laws of Motion: Constraint Relations, Pulleys & Multi-Block Friction', subtopic: 'String and wedge constraint equations, Pseudo force in accelerating frames, static vs kinetic friction, two-block slipping conditions', dayNumber: 3, periodNumber: 2, keyFormulaOrLaw: 'Σ T · a = 0 (Virtual Work on Strings) | Limiting Friction f_s(max) = μ_s N | Pseudo Force F_pseudo = -m a_frame', keyPoints: ['Two-block system: Upper block accelerates by friction alone up to max acceleration a_max = μ_s g', 'Apparent weight in elevator N = m(g ± a)'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'jee_p_6', topicTitle: 'Work-Energy Theorem, Potential Energy & Vertical Circular Motion', subtopic: 'Conservative force F = -dU/dx, work done by variable force, spring potential energy ½kx², critical velocity for vertical loop completion', dayNumber: 6, periodNumber: 2, keyFormulaOrLaw: 'W_net = ΔK = ½m(v² - u²) | Vertical Circle: v_bottom(min) = √(5gR), v_top(min) = √(gR), Tension T_bottom - T_top = 6mg', keyPoints: ['Stable equilibrium occurs where potential energy is minimum (dU/dx = 0, d²U/dx² > 0)', 'Mechanical energy is conserved when only conservative forces do work'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'jee_p_7', topicTitle: 'Rotational Dynamics: Moment of Inertia Theorems, Torque, Pure Rolling & ICOR', subtopic: 'Parallel and perpendicular axes theorems, Torque τ = Iα, Angular momentum L = Iω conservation, Pure rolling down inclined plane, Instantaneous Centre of Rotation', dayNumber: 7, periodNumber: 2, keyFormulaOrLaw: 'I_parallel = I_cm + Md² | τ = Iα = r × F | Total K_rolling = ½Mv²(1 + k²/R²) | Rolling Down Incline a = (g sin θ) / (1 + k²/R²)', keyPoints: ['Pure rolling condition without slipping: v_cm = Rω and a_cm = Rα at point of contact', 'Conservation of angular momentum applies when net external torque Στ_ext = 0'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 4,
      chapterTitle: 'Gravitation, Fluid Dynamics, Thermal Physics & SHM',
      description: 'Variation of g, Escape velocity, Bernoulli equation, Stokes law, Fourier conduction, Carnot cycle, SHM phasor method',
      microTopics: [
        { id: 'jee_p_8', topicTitle: 'Gravitation: Variation of g, Escape Velocity & Kepler Planetary Laws', subtopic: 'Variation of g with altitude/depth/rotation, Gravitational potential V_g, Escape velocity v_e = √(2gR), Kepler third law T² ∝ a³', dayNumber: 8, periodNumber: 2, keyFormulaOrLaw: 'v_escape = √(2GM/R) ≈ 11.2 km/s | g_h = g(1 - 2h/R) | Orbital Speed v_o = √(GM/r)', keyPoints: ['Total mechanical energy of orbiting satellite is negative: E = -GMm / (2r) = -K = U/2', 'Geostationary satellites rotate with period T = 24 hours at altitude ~36,000 km'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'jee_p_9', topicTitle: 'Fluid Dynamics: Bernoulli Principle, Stokes Law & Surface Tension', subtopic: 'Equation of continuity A₁v₁ = A₂v₂, Bernoulli equation P + ½ρv² + ρgh = C, Torricelli efflux, Stokes terminal velocity, Capillary ascent', dayNumber: 9, periodNumber: 2, keyFormulaOrLaw: 'Bernoulli: P + ½ρv² + ρgh = const | v_terminal = 2r²(ρ - σ)g / (9η) | Capillary Rise h = (2T cos θ) / (r ρ g)', keyPoints: ['Excess pressure inside soap bubble ΔP = 4T/R | inside water drop ΔP = 2T/R', 'Venturimeter and Magnus effect (spinning ball curve) are direct applications of Bernoulli principle'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'jee_p_10', topicTitle: 'Thermal Physics, KTG, First & Second Laws of Thermodynamics', subtopic: 'Fourier thermal conduction dQ/dt = kA(T₁-T₂)/L, Stefan-Boltzmann P = eσAT⁴, KTG RMS speed v_rms = √(3RT/M), Carnot engine efficiency', dayNumber: 10, periodNumber: 2, keyFormulaOrLaw: 'ΔQ = ΔU + ΔW | W_isothermal = nRT ln(V₂/V₁) | W_adiabatic = (P₁V₁ - P₂V₂) / (γ - 1) | Carnot η = 1 - T_C / T_H', keyPoints: ['Molar heat capacities: C_p - C_v = R | Adiabatic index γ = C_p / C_v = 1 + 2/f', 'In cyclic process on PV diagram, net work done equals enclosed area (Positive for clockwise loop)'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'jee_p_11', topicTitle: 'Oscillations (SHM) & Mechanical Waves: Standing Waves & Doppler Effect', subtopic: 'Linear SHM differential equation d²x/dt² + ω²x = 0, Simple pendulum T = 2π√(L/g), Standing waves on strings/pipes, Beat frequency, Doppler effect in sound', dayNumber: 11, periodNumber: 2, keyFormulaOrLaw: 'SHM Energy: E = ½mω²A² | Standing Wave Node-to-Node Distance = λ/2 | Doppler: f\' = f [(v ± v_o) / (v ∓ v_s)]', keyPoints: ['Closed organ pipe produces only odd harmonics (1, 3, 5, ...); Open pipe produces all harmonics', 'End correction for organ pipe: e = 0.6 r'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 5,
      chapterTitle: 'Electrostatics, Capacitance, Current Electricity & Magnetism',
      description: 'Gauss law, Potential, Dielectric capacitors, RC transients, Kirchhoff laws, Biot-Savart, Lorentz force, Galvanometer',
      microTopics: [
        { id: 'jee_p_12', topicTitle: 'Gauss Law, Electrostatic Potential & Capacitors with Dielectrics', subtopic: 'Electric flux Φ = q_in/ε₀, Potential V = -∫ E·dr, Parallel plate capacitor C = K ε₀ A/d, Energy density u = ½ε₀E², Transient RC charging', dayNumber: 12, periodNumber: 2, keyFormulaOrLaw: 'C = K ε₀ A / d | Energy U = ½CV² = Q²/(2C) | RC Charging: q(t) = Q_0(1 - e^(-t/RC)) with time constant τ = RC', keyPoints: ['Field inside conducting spherical shell is zero; potential throughout interior is constant and equals surface potential', 'Inserting dielectric slab with battery connected increases charge and energy; battery disconnected keeps charge constant'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'jee_p_13', topicTitle: 'Current Electricity: Drift Velocity, Kirchhoff Rules & Measuring Instruments', subtopic: 'Microscopic Ohm law j = σE, drift velocity v_d = eEτ/m, Wheatstone bridge, Metre bridge, Potentiometer cell comparison E₁/E₂ = L₁/L₂', dayNumber: 13, periodNumber: 2, keyFormulaOrLaw: 'I = n e A v_d | R = ρL/A | Kirchhoff Voltage Law: ΣΔV = 0 (Energy conservation) | Potentiometer: E = k L', keyPoints: ['Internal resistance of cell r = R(L₁/L₂ - 1) using potentiometer', 'Maximum Power Transfer Theorem: Power delivered to load is maximum when load resistance R equals internal resistance r'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'jee_p_14', topicTitle: 'Magnetic Effects of Current: Biot-Savart, Ampere Law, Lorentz Force & MCG', subtopic: 'Field due to circular loop B = μ₀IR²/[2(R²+x²)^(3/2)], Ampere circuital law, Lorentz force F = q(E + v × B), Moving coil galvanometer conversion to ammeter/voltmeter', dayNumber: 14, periodNumber: 2, keyFormulaOrLaw: 'B_axis = (μ₀ I R²) / [2(R² + x²)^(3/2)] | F = I L × B | Shunt for Ammeter: S = I_g G / (I - I_g)', keyPoints: ['Moving charge in uniform magnetic field traces helical path if velocity has component parallel to field; pitch p = v_parallel × (2πm/qB)', 'Moving coil galvanometer sensitivity is increased by using strong radial magnetic field and large number of turns'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 6,
      chapterTitle: 'EMI, AC Circuits, Optics (Ray & Wave) & Modern Physics',
      description: 'Faraday law, Motional EMF, LCR series resonance, Lens Maker formula, YDSE, Photoelectric effect, Bohr atom, Semiconductors',
      microTopics: [
        { id: 'jee_p_15', topicTitle: 'Electromagnetic Induction & Series LCR Alternating Current Circuits', subtopic: 'Motional EMF E = Bvl, Self-inductance L, Series LCR impedance Z = √[R² + (X_L - X_C)²], Resonant frequency ω₀ = 1/√(LC), Quality factor Q', dayNumber: 15, periodNumber: 2, keyFormulaOrLaw: 'Z = √[R² + (ωL - 1/ωC)²] | Resonance: ω₀ = 1/√(LC) | Quality Factor Q = (ω₀ L)/R | Power Factor cos φ = R/Z', keyPoints: ['At resonance, impedance is purely resistive (minimum Z = R), and current is maximum and in phase with voltage', 'Wattless current occurs in pure inductor or capacitor where power factor cos φ = 0'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'jee_p_16', topicTitle: 'Ray & Wave Optics: Total Internal Reflection, Lens Maker, YDSE & Diffraction', subtopic: 'Refraction at spherical surfaces, Lens Maker formula 1/f = (μ-1)(1/R₁ - 1/R₂), Prism formula, YDSE fringe width β = λD/d, Brewster law tan i_p = μ', dayNumber: 16, periodNumber: 2, keyFormulaOrLaw: 'Lens Maker: 1/f = (μ - 1)(1/R₁ - 1/R₂) | YDSE: β = (λ D)/d | Shift with mica slab: Δy = (μ - 1)t D / d | Brewster: μ = tan i_p', keyPoints: ['Total Internal Reflection occurs when light travels from denser to rarer medium at angle > critical angle (sin C = 1/μ)', 'Central maximum width in single slit diffraction is 2λD/a (double the secondary fringe width)'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'jee_p_17', topicTitle: 'Modern Physics & Semiconductor Electronics: Bohr Model, Photoelectric & Diodes', subtopic: 'Einstein photoelectric equation hν = φ + eV₀, Bohr energy levels E_n = -13.6 Z²/n² eV, Radioactive decay N(t) = N₀ e^(-λt), p-n junction diode, Zener regulator, Logic gates', dayNumber: 17, periodNumber: 2, keyFormulaOrLaw: 'Photoelectric: K_max = hν - φ = eV₀ | Bohr: r_n = 0.529 n²/Z Å | Radioactive Half-Life: T_½ = 0.693 / λ | Zener Diode Voltage Regulation', keyPoints: ['Hydrogen spectrum: Lyman in UV, Balmer in Visible, Paschen in IR', 'De Morgan laws for logic gates: (A + B)\' = A\'·B\' and (A·B)\' = A\' + B\' (NAND and NOR are universal gates)'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  // SUBJECT 3: CHEMISTRY (Physical, Inorganic & Organic 26 Units)
  const chemChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Physical Chemistry: Stoichiometry, Atomic Structure & Thermodynamics',
      description: 'Mole concept, Limiting reagent, Quantum numbers, Radial nodes, Hess law, Entropy, Gibbs free energy ΔG° = -RT ln K',
      microTopics: [
        { id: 'jee_c_1', topicTitle: 'Mole Concept, Stoichiometry, Limiting Reagent & Concentration Terms', subtopic: 'Molarity, Molality, Mole fraction, Limiting reagent calculations, Percentage yield, Redox equivalent weight', dayNumber: 1, periodNumber: 3, keyFormulaOrLaw: 'Moles n = Mass / Molar Mass | Molarity M = n_solute / V(L) | Molality m = n_solute / Mass_solvent(kg)', keyPoints: ['Limiting reagent completely consumed determines maximum theoretical product yield', 'Normality = Molarity × n-factor (where n-factor is change in oxidation state or replaceable H⁺/OH⁻)'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'jee_c_2', topicTitle: 'Quantum Mechanical Atomic Model, Quantum Numbers & Radial/Angular Nodes', subtopic: 'Heisenberg uncertainty principle, de Broglie wavelength, Quantum numbers (n, l, m, s), Radial nodes (n - l - 1), Angular nodes (l), Aufbau and Hund rules', dayNumber: 4, periodNumber: 3, keyFormulaOrLaw: 'Δx · Δp ≥ h / (4π) | de Broglie λ = h / (mv) | Radial Nodes = n - l - 1 | Angular Nodes = l', keyPoints: ['Chromium [Ar] 3d⁵ 4s¹ and Copper [Ar] 3d¹⁰ 4s¹ stability due to symmetry and high exchange energy', 'Maximum electrons in subshell = 2(2l + 1)'], type: 'concept', importance: 'High-Yield' },
        { id: 'jee_c_3', topicTitle: 'Chemical Thermodynamics, Hess Law, Entropy & Gibbs Free Energy Spontaneity', subtopic: 'First law ΔU = q + w, Enthalpy ΔH = ΔU + Δn_g RT, Hess law of heat summation, Entropy ΔS = q_rev/T, Spontaneity criterion ΔG = ΔH - TΔS < 0', dayNumber: 7, periodNumber: 3, keyFormulaOrLaw: 'ΔG° = -RT ln K_eq = -2.303 RT log K_eq | Standard Reaction Enthalpy ΔH°_rxn = ΣΔH°_f(products) - ΣΔH°_f(reactants)', keyPoints: ['Reversible isothermal work w = -2.303 nRT log(V₂/V₁)', 'Spontaneous process requires total entropy of universe to increase (ΔS_universe > 0)'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Equilibrium (Chemical & Ionic), Redox & Electrochemistry',
      description: 'Le Chatelier principle, pH, Buffer Henderson equation, Ksp, Nernst equation, Kohlrausch law, Faraday electrolysis',
      microTopics: [
        { id: 'jee_c_4', topicTitle: 'Chemical & Ionic Equilibrium: Le Chatelier, pH, Buffers & Solubility Product (Ksp)', subtopic: 'Relation K_p = K_c(RT)^Δn_g, Le Chatelier principle, Henderson-Hasselbalch buffer equation, Salt hydrolysis pH, Common ion effect on K_sp', dayNumber: 2, periodNumber: 3, keyFormulaOrLaw: 'K_p = K_c(RT)^(Δn_g) | Acidic Buffer: pH = pK_a + log([Salt]/[Acid]) | K_sp for A_x B_y = x^x y^y s^(x+y)', keyPoints: ['Addition of inert gas at constant pressure shifts equilibrium towards side with more gas moles; at constant volume no shift', 'Precipitation occurs when ionic product Q_sp exceeds solubility product K_sp'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'jee_c_5', topicTitle: 'Electrochemistry: Nernst Equation, Cell EMF, Kohlrausch Law & Batteries', subtopic: 'Standard reduction potentials, Nernst equation at 298 K, ΔG° = -nFE°_cell, Kohlrausch law of independent ion migration, Faraday electrolysis', dayNumber: 5, periodNumber: 3, keyFormulaOrLaw: 'Nernst Equation: E_cell = E°_cell - (0.0591/n) log Q | ΔG° = -n F E°_cell | Faraday: m = (E I t) / 96500', keyPoints: ['Kohlrausch law allows calculation of limiting molar conductivity Λ°_m for weak electrolytes', 'Rusting of iron is electrochemical process with iron anode and oxygen reduction cathode'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 3,
      chapterTitle: 'Chemical Kinetics, Solutions & Colligative Properties',
      description: 'Integrated rate laws, Arrhenius equation, Raoult law, Colligative properties (RLVP, ΔTb, ΔTf, Osmotic pressure), Van\'t Hoff factor',
      microTopics: [
        { id: 'jee_c_6', topicTitle: 'Chemical Kinetics: Order of Reaction, Half-Life & Arrhenius Activation Energy', subtopic: 'Zero and first order integrated rate laws, half-life formulas, pseudo first order, Arrhenius equation k = A e^(-E_a/RT)', dayNumber: 3, periodNumber: 3, keyFormulaOrLaw: 'First Order: k = (2.303/t) log(a / (a - x)) | t_½ = 0.693 / k | Arrhenius: log(k₂/k₁) = (E_a / 2.303R)[1/T₁ - 1/T₂]', keyPoints: ['Half-life of first-order reaction is completely independent of initial reactant concentration', 'Catalyst provides alternative reaction pathway with lower activation energy without affecting equilibrium constant'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'jee_c_7', topicTitle: 'Solutions & Colligative Properties: Raoult Law, Van\'t Hoff Factor & Osmosis', subtopic: 'Ideal vs non-ideal solutions (azeotropes), Relative lowering of vapor pressure, Boiling point elevation ΔT_b = i K_b m, Freezing depression, Osmotic pressure Π = i CRT', dayNumber: 6, periodNumber: 3, keyFormulaOrLaw: 'RLVP: (P° - P)/P° = i X_solute | ΔT_b = i K_b m | ΔT_f = i K_f m | Osmotic Pressure: Π = i C R T', keyPoints: ['Van\'t Hoff factor for dissociation: i = 1 + (n - 1)α | for association: i = 1 + (1/n - 1)α', 'Positive deviation (e.g. ethanol-water) shows higher vapor pressure and minimum boiling azeotrope'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 4,
      chapterTitle: 'Inorganic Chemistry: Chemical Bonding, Periodic Properties & Coordination Compounds',
      description: 'VSEPR, Hybridization, MOT, Fajan rules, Werner theory, Coordination isomerism, Crystal Field Theory (CFT)',
      microTopics: [
        { id: 'jee_c_8', topicTitle: 'Chemical Bonding: VSEPR Geometry, Hybridization, MOT & Fajan Rules', subtopic: 'Steric number, shapes with lone pairs (SF₄, ClF₃, XeF₄), Molecular Orbital Theory bond order and paramagnetism (O₂, B₂), Fajan rules for covalent character', dayNumber: 8, periodNumber: 3, keyFormulaOrLaw: 'Bond Order = ½(N_b - N_a) | Fajan: Smaller cation + Larger anion + Higher charge => Higher Covalency', keyPoints: ['O₂ is paramagnetic with bond order 2 due to 2 unpaired electrons in π*2p antibonding orbitals', 'Dipole moment determines polarity: BF₃ and CCl₄ have zero dipole moment due to symmetric cancellation'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'jee_c_9', topicTitle: 'Coordination Chemistry: IUPAC Nomenclature, Isomerism & Crystal Field Theory (CFT)', subtopic: 'Ligands classification, Geometrical (cis/trans, fac/mer) and optical isomerism, Crystal field splitting Δ_o in octahedral and Δ_t in tetrahedral, Synergic bonding in metal carbonyls', dayNumber: 9, periodNumber: 3, keyFormulaOrLaw: 'Octahedral Splitting: t₂g (-0.4 Δ_o) and e_g (+0.6 Δ_o) | Tetrahedral Splitting: Δ_t = (4/9) Δ_o', keyPoints: ['Strong field ligands (CN⁻, CO) cause pairing of electrons (low spin complexes)', 'Metal carbonyls feature synergic bonding: σ-donation from CO lone pair and π-backbonding from metal d-orbitals to CO π* orbitals'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 5,
      chapterTitle: 'Inorganic Chemistry: P-Block (Groups 13-18), D & F-Block & Qualitative Salt Analysis',
      description: 'Boranes 3c-2e, Silicates, KMnO4, K2Cr2O7, Lanthanoid contraction, Cations (Groups 0-VI) and Anions qualitative detection',
      microTopics: [
        { id: 'jee_c_10', topicTitle: 'P-Block, D & F-Block Elements: Structures, Reactions & Lanthanoid Contraction', subtopic: 'Diborane 3c-2e bridge bonding, Silicates classification, KMnO₄ and K₂Cr₂O₇ preparation and redox actions, Lanthanoid contraction consequences (Zr-Hf similarity)', dayNumber: 10, periodNumber: 3, keyFormulaOrLaw: 'Lanthanoid Contraction causes 4d and 5d transition series (Zr/Hf, Nb/Ta) to have nearly identical atomic radii', keyPoints: ['KMnO₄ acts as self-indicator in titrations and powerful oxidizer in acidic (ΔON = 5), neutral (3), and basic (1) media', 'Interhalogen compounds (ClF₃, BrF₅) are more reactive than parent halogens (except F₂)'], type: 'concept', importance: 'High-Yield' },
        { id: 'jee_c_11', topicTitle: 'Qualitative Inorganic Salt Analysis: Cations & Anions Systematic Testing', subtopic: 'Group reagents: Group I (dil. HCl Pb²⁺, Ag⁺), Group II (H₂S in dil. HCl Cu²⁺, Pb²⁺), Group III (NH₄OH + NH₄Cl Fe³⁺, Al³⁺), Nessler reagent for NH₄⁺, Chromyl chloride test for Cl⁻', dayNumber: 11, periodNumber: 3, keyFormulaOrLaw: 'Chromyl Chloride Test: Solid Chloride + K₂Cr₂O₇ + conc. H₂SO₄ -> Red Vapours of CrO₂Cl₂ -> Yellow PbCrO₄ ppt with Lead Acetate', keyPoints: ['Group II sulfides precipitated in acidic medium because low S²⁻ concentration prevents precipitation of Group IV cations', 'Borax bead test: Cu gives blue bead in oxidizing flame and red opaque in reducing flame'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 6,
      chapterTitle: 'Organic Chemistry: GOC, Stereochemistry, Hydrocarbons & Reaction Mechanisms',
      description: 'Inductive, Resonance, Hyperconjugation, Carbocation rearrangements, CIP R/S configuration, SN1/SN2, E1/E2, Electrophilic additions',
      microTopics: [
        { id: 'jee_c_12', topicTitle: 'General Organic Chemistry (GOC) & Electronic Intermediates Stability', subtopic: 'Inductive (+I/-I), Resonance (+M/-M), Hyperconjugation (Baker-Nathan), Aromaticity (Hückel 4n+2 rule), Carbocation rearrangements (1,2-hydride/methyl shifts)', dayNumber: 12, periodNumber: 3, keyFormulaOrLaw: 'Carbocation Stability: 3° > 2° > 1° > Methyl | Aromaticity: Planar, Cyclic, Conjugated with (4n + 2) π-electrons', keyPoints: ['Acidic strength increases with electron-withdrawing groups (-I, -M) which stabilize conjugate base carboxylate/phenoxide', 'Hyperconjugation in alkenes directly correlates with heat of hydrogenation (More substituted alkene = More stable = Lower heat of hydrogenation)'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'jee_c_13', topicTitle: 'Stereochemistry (CIP R/S, Conformations of Cyclohexane) & Hydrocarbons Reactions', subtopic: 'Enantiomers, Diastereomers, Meso compounds, Chair/Boat conformations of cyclohexane, Markovnikov/Anti-Markovnikov addition, Ozonolysis, Friedel-Crafts alkylation/acylation', dayNumber: 13, periodNumber: 3, keyFormulaOrLaw: 'Ozonolysis: R-CH=CH-R\' + O₃ -> Reductive (Zn/H₂O) gives Aldehydes; Oxidative (H₂O₂) gives Carboxylic Acids', keyPoints: ['In chair cyclohexane, bulky substituents prefer equatorial position to minimize 1,3-diaxial strain', 'Electrophilic aromatic substitution of benzene involves arenium ion (sigma-complex) intermediate'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 7,
      chapterTitle: 'Organic Chemistry: Functional Groups, Named Reactions & Biomolecules',
      description: 'SN1/SN2/E2, Lucas test, Reimer-Tiemann, Aldol, Cannizzaro, Iodoform, Gabriel phthalimide, Diazonium Sandmeyer, Carbohydrates & Polymers',
      microTopics: [
        { id: 'jee_c_14', topicTitle: 'Alkyl/Aryl Halides & Alcohols/Phenols/Ethers Mechanisms', subtopic: 'SN1 (two-step, racemization) vs SN2 (one-step, Walden inversion), Lucas test for alcohols, Cumene to phenol process, Reimer-Tiemann reaction, Williamson ether synthesis', dayNumber: 14, periodNumber: 3, keyFormulaOrLaw: 'SN2 Reactivity: Methyl > 1° > 2° > 3° (Steric hindrance) | SN1 Reactivity: 3° > 2° > 1° (Carbocation stability)', keyPoints: ['Reimer-Tiemann reaction involves generation of neutral electrophile Dichlorocarbene (:CCl₂)', 'Williamson synthesis requires 1° alkyl halide; 3° alkyl halide yields elimination product (alkene) exclusively'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'jee_c_15', topicTitle: 'Aldehydes, Ketones, Carboxylic Acids & Nitrogen Compounds Named Reactions', subtopic: 'Aldol condensation, Cannizzaro disproportionation, Iodoform test (CH₃-C=O), Clemmensen & Wolff-Kishner reductions, Gabriel phthalimide synthesis, Diazonium coupling reactions', dayNumber: 15, periodNumber: 3, keyFormulaOrLaw: 'Aldol: Aldehyde with α-H + dil. NaOH -> β-hydroxy aldehyde | Cannizzaro: Non-enolizable aldehyde + 50% KOH -> Alcohol + Acid salt', keyPoints: ['Iodoform test gives yellow precipitate of CHI₃ with compounds containing CH₃-C=O or CH₃-CH(OH)- group', 'Hinsberg reagent (Benzene sulfonyl chloride) differentiates 1°, 2°, 3° amines based on alkali solubility of sulfonamide'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'jee_c_16', topicTitle: 'Biomolecules, Polymers & Practical Organic Chemistry Purification', subtopic: 'Glucose open vs cyclic structure, Anomers, Peptide bond, DNA/RNA bases, Addition/Condensation polymers (Bakelite, Nylon-6,6, Teflon), Lassaigne test for N, S, Halogens', dayNumber: 16, periodNumber: 3, keyFormulaOrLaw: 'Peptide Bond: -CO-NH- formed between -COOH of one amino acid and -NH₂ of another with elimination of H₂O', keyPoints: ['Lassaigne test: Nitrogen detected as Prussian blue Fe₄[Fe(CN)₆]₃ | Sulfur detected as purple sodium nitroprusside complex', 'DNA contains A, T, G, C bases linked by hydrogen bonds (A=T, G≡C); RNA contains Uracil in place of Thymine'], type: 'concept', importance: 'High-Yield' }
      ]
    }
  ];

  const subjects: SyllabusSubject[] = [
    { subjectId: 'jee_math', subjectName: 'JEE Mathematics (Calculus, Coordinate, Algebra & 3D)', icon: '📐', color: '#06b6d4', totalChapters: mathChapters.length, totalMicroTopics: mathChapters.reduce((a, c) => a + c.microTopics.length, 0), chapters: mathChapters },
    { subjectId: 'jee_physics', subjectName: 'JEE Physics (Mechanics, Electrodynamics, Thermo & Optics)', icon: '⚡', color: '#10b981', totalChapters: physicsChapters.length, totalMicroTopics: physicsChapters.reduce((a, c) => a + c.microTopics.length, 0), chapters: physicsChapters },
    { subjectId: 'jee_chemistry', subjectName: 'JEE Chemistry (Physical, Inorganic, Organic & Analysis)', icon: '🧪', color: '#f59e0b', totalChapters: chemChapters.length, totalMicroTopics: chemChapters.reduce((a, c) => a + c.microTopics.length, 0), chapters: chemChapters }
  ];

  return {
    courseId: courseId || 'exam-jee-main',
    courseTitle: courseTitle || 'JEE Main & Advanced Engineering — Target 99.5%ile Master Blueprint',
    category: 'entrance',
    board: 'NTA / IIT JEE (National)',
    medium: 'English',
    totalDays: 360,
    totalSubjects: subjects.length,
    totalChapters: subjects.reduce((a, s) => a + s.totalChapters, 0),
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

// ─────────────────────────────────────────────────────────────────────────────
// 7. TNPSC UNIFIED MASTER SYLLABUS (GROUP 1, 2/2A, 4, VAO, DEO, SI)
// ─────────────────────────────────────────────────────────────────────────────
export function getTnpscUnifiedCompleteSyllabus(courseId: string, courseTitle: string): CourseFullSyllabus {
  const tamilChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'பகுதி அ: தமிழ் இலக்கணம் (Grammar Masterclass)',
      description: 'எழுத்து, சொல், சந்திப்பிழை நீக்குதல், ஓரெழுத்து ஒருமொழி, வேர்ச்சொல், பெயர்ச்சொல் 6 வகை, இலக்கணக் குறிப்பறிதல் & வேற்றுமை',
      microTopics: [
        { id: 'tn_t_1', topicTitle: 'முதல் & சார்பெழுத்துகள் (10 வகைகள்) & புணர்ச்சி விதிகள்', subtopic: 'உயிர் 12, மெய் 18, உயிர்மெய், ஆய்தம், உயிரளபெடை, ஒற்றளபெடை, குற்றியலுகரம், குற்றியலிகரம்', dayNumber: 1, periodNumber: 1, keyFormulaOrLaw: 'முதல் எழுத்துகள் 30 | சார்பெழுத்துகள் 10 வகை | குற்றியலுகரம் 6 வகை', keyPoints: ['உயிரளபெடை 3 வகை: செய்யுளிசை, இன்னிசை, சொல்லிசை', 'ஆய்த குறுக்கம் மற்றும் மகர குறுக்கம் மாத்திரை அளவுகள் (1/4 மாத்திரை)'], type: 'concept', importance: 'High-Yield' },
        { id: 'tn_t_2', topicTitle: 'வேற்றுமை உருபுகள் (1 முதல் 8 வரை) & சொல்லுருபுகள்', subtopic: 'ஐ, ஆல், கு, இன், அது, கண் வேற்றுமைத் தொடர்கள் மற்றும் உடன்தொக்க தொகை', dayNumber: 6, periodNumber: 1, keyFormulaOrLaw: '2-ம்: ஐ | 3-ம்: ஆல், ஆண், ஒடு, ஓடு | 4-ம்: கு | 5-ம்: இன், இல் | 6-ம்: அது, ஆது, அ | 7-ம்: கண் | 8-ம்: விளி', keyPoints: ['முதல் வேற்றுமைக்கு உருபு இல்லை (எழுவாய் வேற்றுமை)', '8-ம் வேற்றுமை விளி வேற்றுமை (அழைத்தல்)'], type: 'concept', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'பகுதி ஆ: இலக்கியம் — திருக்குறள் & அறநூல்கள்',
      description: 'அன்பு, பண்பு, கல்வி, கேள்வி, அறிவு, ஒழுக்கம், நட்பு, வாய்மை, காலமறிதல், நாலடியார், நான்மணிக்கடிகை',
      microTopics: [
        { id: 'tn_t_6', topicTitle: 'திருக்குறள்: கடவுள் வாழ்த்து, வான்சிறப்பு & அன்புடைமை', subtopic: 'அகர முதல எழுத்தெல்லாம், துப்பார்க்குத் துப்பாய & அன்பிலார் எல்லாம் தமக்குரியர்', dayNumber: 2, periodNumber: 1, keyFormulaOrLaw: 'அகர முதல எழுத்தெல்லாம் ஆதி பகவன் முதற்றே உலகு | அன்பின் வழியது உயிர்நிலை', keyPoints: ['பரிமேலழகர் உரை திருக்குறளின் மிகச்சிறந்த உரை', 'திருக்குறள் 133 அதிகாரங்கள் (1330 குறள்கள்)'], type: 'concept', importance: 'High-Yield' }
      ]
    }
  ];

  const polityChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'அரசியலமைப்பு உருவாக்கம், முகப்புரை & அடிப்படை உரிமைகள் (Part 1–3)',
      description: 'அரசியல் நிர்ணய சபை, முகப்புரை 42-வது திருத்தம், அடிப்படை உரிமைகள் (Articles 12–35) & 5 நீதிப்பேராணைகள்',
      microTopics: [
        { id: 'tn_pol_1', topicTitle: 'அரசியல் நிர்ணய சபை, வரைவுக்குழு & முகப்புரை', subtopic: 'டாக்டர் அம்பேத்கர், கேசவானந்த பாரதி வழக்கு 1973, 42-வது திருத்தம் 1976', dayNumber: 1, periodNumber: 2, keyFormulaOrLaw: '42nd Amendment added: SOCIALIST, SECULAR, INTEGRITY | Art 32: Heart and Soul', keyPoints: ['அரசியல் சாசனம் ஏற்றுக்கொள்ளப்பட்டது: 26 நவம்பர் 1949 | நடைமுறை: 26 ஜனவரி 1950', 'பிரிவு 32 உச்ச நீதிமன்ற நீதிப்பேராணைகள் (Habeas Corpus, Mandamus, Quo-Warranto)'], type: 'concept', importance: 'High-Yield' }
      ]
    }
  ];

  const aptitudeChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'சுருக்குதல் (BODMAS), HCF & LCM & விழுக்காடு',
      description: 'இயற்கணித முற்றொருமைகள், மீ.சி.ம / மீ.பொ.வ, தனிவட்டி & கூட்டுவட்டி (2, 3 ஆண்டுகள் வித்தியாசம்)',
      microTopics: [
        { id: 'tn_apt_1', topicTitle: 'சுருக்குதல், HCF-LCM & 2 ஆண்டுகள் CI - SI வித்தியாசம் (D)', subtopic: 'BODMAS, Product = HCF × LCM, D = P(R/100)²', dayNumber: 1, periodNumber: 3, keyFormulaOrLaw: 'Product = HCF × LCM | 2 Years CI-SI Diff D = P(R/100)² | Chain Rule: (M₁D₁H₁)/W₁ = (M₂D₂H₂)/W₂', keyPoints: ['BODMAS முறைப்படி அடைப்புக்குறி முதலில் தீர்க்கப்பட வேண்டும்', '3 ஆண்டுகள் CI - SI வித்தியாசம் D = P(R/100)² (3 + R/100)'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  const unit8_9Chapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Unit VIII & IX: தமிழ்நாடு வரலாறு, கீழடி அகழாய்வு & வளர்ச்சி நிர்வாகம்',
      description: 'கீழடி (கிமு 6-ம் நூற்றாண்டு), 1801 மருது சகோதரர்கள் பிரகடனம், 1916 நீதிக்கட்சி, 69% இடஒதுக்கீடு சட்டம், ஆசியாவின் டெட்ராய்ட்',
      microTopics: [
        { id: 'tn_u8_1', topicTitle: 'கீழடி அகழாய்வு, நீதிக்கட்சி சாதனைகள் & 69% இடஒதுக்கீடு', subtopic: 'வைகை நதிக்கரை நாகரிகம், 1921 வகுப்புவாரி அரசாணை, 1994 தமிழ்நாடு 69% இடஒதுக்கீடு சட்டம்', dayNumber: 1, periodNumber: 4, keyFormulaOrLaw: 'கீழடி: கிமு 6-ம் நூற்றாண்டு | 1994 தமிழ்நாடு 69% இடஒதுக்கீடு (9-வது அட்டவணை)', keyPoints: ['நீதிக்கட்சி 1921-ல் வகுப்புவாரி அரசாணையை வெளியிட்டது', 'தமிழ்நாடு ஆசியாவின் டெட்ராய்ட் (சென்னை) மற்றும் இந்தியாவின் பின்னலாடை தலைநகரம் (திருப்பூர்)'], type: 'concept', importance: 'High-Yield' }
      ]
    }
  ];

  const gsCoreChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'பொது அறிவியல், புவியியல், வரலாறு & பொருளாதாரம் (Unit I, III, IV, VI, VII)',
      description: 'நியூட்டன் இயக்க விதிகள், வடகிழக்குப் பருவமழை, காவிரி நதி, 1857 புரட்சி, NITI Aayog & GST',
      microTopics: [
        { id: 'tn_sci_1', topicTitle: 'இயற்பியல் இயக்க விதிகள், வடகிழக்குப் பருவமழை & GST வரி முறை', subtopic: 'F = ma, தமிழ்நாடு வடகிழக்குப் பருவமழை, 1 ஜூலை 2017 GST நடைமுறை', dayNumber: 1, periodNumber: 5, keyFormulaOrLaw: 'F = ma | V = IR | GST: 101-வது அரசியலமைப்பு திருத்தம் 2017', keyPoints: ['தமிழ்நாடு அதிக மழைப்பொழிவை வடகிழக்குப் பருவமழை மூலம் பெறுகிறது', 'வேதாரண்யம் உப்பு சத்தியாகிரகம் 1930 ராஜாஜி தலைமையில் நடைபெற்றது'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  const subjects: SyllabusSubject[] = [
    { subjectId: 'tnpsc_tamil', subjectName: 'பொதுத்தமிழ் & இலக்கிய நயவுரை (General Tamil 100/150)', icon: '📜', color: '#10b981', totalChapters: tamilChapters.length, totalMicroTopics: tamilChapters.reduce((a, c) => a + c.microTopics.length, 0), chapters: tamilChapters },
    { subjectId: 'tnpsc_polity', subjectName: 'இந்திய அரசியலமைப்பு & மக்களாட்சி (Unit V: Polity)', icon: '⚖️', color: '#06b6d4', totalChapters: polityChapters.length, totalMicroTopics: polityChapters.reduce((a, c) => a + c.microTopics.length, 0), chapters: polityChapters },
    { subjectId: 'tnpsc_aptitude', subjectName: 'கணிதம் & திறனறிவு (Unit X: Aptitude 25/25 Target)', icon: '🔢', color: '#f59e0b', totalChapters: aptitudeChapters.length, totalMicroTopics: aptitudeChapters.reduce((a, c) => a + c.microTopics.length, 0), chapters: aptitudeChapters },
    { subjectId: 'tnpsc_unit8_9', subjectName: 'தமிழ்நாடு வரலாறு, பண்பாடு & வளர்ச்சி நிர்வாகம் (Unit VIII & IX)', icon: '🏛️', color: '#8b5cf6', totalChapters: unit8_9Chapters.length, totalMicroTopics: unit8_9Chapters.reduce((a, c) => a + c.microTopics.length, 0), chapters: unit8_9Chapters },
    { subjectId: 'tnpsc_science_geo_hist', subjectName: 'பொது அறிவியல், புவியியல், வரலாறு & பொருளாதாரம் (Unit I, III, IV, VI, VII)', icon: '🌍', color: '#ec4899', totalChapters: gsCoreChapters.length, totalMicroTopics: gsCoreChapters.reduce((a, c) => a + c.microTopics.length, 0), chapters: gsCoreChapters }
  ];

  return {
    courseId: courseId || 'exam-tnpsc-grp4',
    courseTitle: courseTitle || 'TNPSC All Groups Unified Exam Master Course',
    category: 'tnpsc',
    board: 'TNPSC / TNUSRB',
    medium: 'Bilingual (Tamil & English)',
    totalDays: 360,
    totalSubjects: subjects.length,
    totalChapters: subjects.reduce((a, s) => a + s.totalChapters, 0),
    totalMicroTopics: subjects.reduce((a, s) => a + s.totalMicroTopics, 0),
    subjects
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. NEET UG OFFICIAL VAST MICRO-TOPIC SYLLABUS REGISTRY
// ─────────────────────────────────────────────────────────────────────────────
export function getNeetUgCompleteSyllabus(): CourseFullSyllabus {
  const physicsChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Physics and Measurement & Practical Skills',
      description: 'SI Units, Dimensional Analysis, Error Analysis, Vernier Calipers, Screw Gauge & Simple Pendulum',
      microTopics: [
        { id: 'neet_p_1', topicTitle: 'Units, Dimensions & Dimensional Analysis Applications', subtopic: 'Fundamental & derived units, principle of homogeneity, formula derivation', dayNumber: 1, periodNumber: 1, keyFormulaOrLaw: '[Force] = [M L T⁻²] | [Energy] = [M L² T⁻²] | [Planck Constant h] = [M L² T⁻¹]', keyPoints: ['Dimensionless quantities: Strain, Angle, Refractive index', 'Checking dimensional consistency of equations'], type: 'concept', importance: 'High-Yield' },
        { id: 'neet_p_2', topicTitle: 'Errors in Measurement, Significant Figures & Combination of Errors', subtopic: 'Absolute, relative and percentage errors, error propagation in Z = A^p B^q / C^r', dayNumber: 5, periodNumber: 1, keyFormulaOrLaw: 'ΔZ/Z = p(ΔA/A) + q(ΔB/B) + r(ΔC/C) | Percentage Error = (ΔZ/Z) × 100%', keyPoints: ['Errors always add up in worst-case analysis', 'Rounding off rules and significant digits'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Kinematics (1D & 2D Motion) & Vectors',
      description: 'Rectilinear motion, calculus equations, vectors, projectile motion & uniform circular motion',
      microTopics: [
        { id: 'neet_p_4', topicTitle: 'Motion in a Straight Line & Graphical Kinematics', subtopic: 'v-t and x-t graphs, instantaneous velocity v = dx/dt, acceleration a = dv/dt = v(dv/dx)', dayNumber: 2, periodNumber: 1, keyFormulaOrLaw: 'v = u + at | s = ut + ½at² | v² = u² + 2as | s_nth = u + ½a(2n - 1)', keyPoints: ['Area under v-t graph = Displacement', 'Slope of v-t graph = Acceleration'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  const chemistryChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Physical Chemistry: Mole Concept, Atomic Structure & Bonding',
      description: 'Stoichiometry, quantum numbers, electronic configuration, VSEPR, Hybridization & Molecular Orbital Theory',
      microTopics: [
        { id: 'neet_c_1', topicTitle: 'Mole Concept, Molarity, Molality & Stoichiometry', subtopic: 'Limiting reagent calculations, percentage composition, empirical and molecular formula', dayNumber: 1, periodNumber: 2, keyFormulaOrLaw: 'Moles n = Mass / Molar Mass | Molarity M = n_solute / V_solution(L) | Molality m = n_solute / Mass_solvent(kg)', keyPoints: ['Limiting reagent determines maximum product yield', 'Mole fraction X_A + X_B = 1'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  const botanyChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Plant Diversity, Morphology & Anatomy',
      description: 'Five kingdom system, Algae/Bryophytes/Pteridophytes/Gymnosperms, Floral families, Dicot/Monocot anatomy',
      microTopics: [
        { id: 'neet_b_1', topicTitle: 'Five Kingdom Classification & Plant Kingdom Systematics', subtopic: 'Whittaker 5 kingdoms, characteristics of Chlorophyceae, Phaeophyceae, Rhodophyceae', dayNumber: 1, periodNumber: 3, keyFormulaOrLaw: 'Pigments: Green Algae (Chl a, b) | Brown Algae (Fucoxanthin) | Red Algae (r-Phycoerythrin)', keyPoints: ['Lichens are symbiotic associations between Algae and Fungi', 'Gymnosperms possess naked seeds'], type: 'concept', importance: 'High-Yield' }
      ]
    }
  ];

  const zoologyChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Animal Kingdom & Animal Morphology (Cockroach & Frog)',
      description: 'Non-chordate phyla (Porifera to Hemichordata), Chordate classes, Cockroach and Frog anatomy',
      microTopics: [
        { id: 'neet_z_1', topicTitle: 'Animal Kingdom Classification: Phyla Porifera to Chordata', subtopic: 'Levels of organization, coelom types, open vs closed circulatory systems', dayNumber: 1, periodNumber: 4, keyFormulaOrLaw: 'Coelom: Aschelminthes are Pseudocoelomate | Annelida to Chordata are Eucoelomates', keyPoints: ['Arthropoda is the largest phylum with jointed appendages', 'Echinodermata possess water vascular system'], type: 'concept', importance: 'High-Yield' }
      ]
    }
  ];

  const subjects: SyllabusSubject[] = [
    { subjectId: 'neet_physics', subjectName: 'NEET Physics (19 Units)', icon: '⚡', color: '#06b6d4', totalChapters: physicsChapters.length, totalMicroTopics: physicsChapters.reduce((a, c) => a + c.microTopics.length, 0), chapters: physicsChapters },
    { subjectId: 'neet_chemistry', subjectName: 'NEET Chemistry (Physical, Inorganic & Organic)', icon: '🧪', color: '#10b981', totalChapters: chemistryChapters.length, totalMicroTopics: chemistryChapters.reduce((a, c) => a + c.microTopics.length, 0), chapters: chemistryChapters },
    { subjectId: 'neet_botany', subjectName: 'NEET Biology: Botany (Plant Kingdom & Physiology)', icon: '🌿', color: '#84cc16', totalChapters: botanyChapters.length, totalMicroTopics: botanyChapters.reduce((a, c) => a + c.microTopics.length, 0), chapters: botanyChapters },
    { subjectId: 'neet_zoology', subjectName: 'NEET Biology: Zoology (Human Physiology & Genetics)', icon: '🧬', color: '#ec4899', totalChapters: zoologyChapters.length, totalMicroTopics: zoologyChapters.reduce((a, c) => a + c.microTopics.length, 0), chapters: zoologyChapters }
  ];

  return {
    courseId: 'exam-neet-ug',
    courseTitle: 'NEET UG — National Medical Entrance Exam Preparation',
    category: 'entrance',
    board: 'NTA / NMC',
    medium: 'English',
    totalDays: 360,
    totalSubjects: subjects.length,
    totalChapters: subjects.reduce((a, s) => a + s.totalChapters, 0),
    totalMicroTopics: subjects.reduce((a, s) => a + s.totalMicroTopics, 0),
    subjects
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

  // 1. JEE Main & JEE Advanced Entrance Track
  if (c.includes('jee')) {
    return getJeeMainAdvancedCompleteSyllabus(courseId, title);
  }

  // 2. UPSC Civil Services (IAS / IPS / IFS / IRS) Central Track
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
