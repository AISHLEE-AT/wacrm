/**
 * TeachO Master Unified Course Catalog
 * 100% Comprehensive Master Coverage: LKG to 12th Std across ALL boards,
 * TNPSC, UPSC, NEET, JEE, College Degrees, and Tech/Kids Skills.
 */

export interface CourseSubject {
  id: string;
  name: string;
  completed: number;
  total: number;
  icon: string;
  color: string;
  currentChapter: string;
}

export interface RoutineTaskTemplate {
  title: string;
  subtitle: string;
  rawTopic: string;
  rawSubject: string;
  duration: string;
  xp: number;
  type: 'video' | 'notes' | 'quiz' | 'code';
}

export interface CourseOption {
  id: string;
  category:
    | 'school_tnsb_en'
    | 'school_tnsb_ta'
    | 'school_cbse'
    | 'school_matric'
    | 'college_degree'
    | 'tnpsc'
    | 'upsc_central'
    | 'entrance'
    | 'skills'
    | 'kids_skills';
  gradeLevel: 'primary' | 'middle' | 'high' | 'hsc' | 'college' | 'exam' | 'skill';
  title: string;
  subtitle: string;
  short: string;
  medium: 'English' | 'Tamil' | 'Bilingual';
  board: 'TNSB' | 'CBSE' | 'Matric' | 'National' | 'University';
  totalDays: number;
  currentDayDefault: number;
  streakDefault: number;
  xpDefault: number;
  badge: string;
  badgeColor: string;
  phaseTitle: string;
  phaseSub: string;
  subjects: CourseSubject[];
  tasks: RoutineTaskTemplate[];
  milestoneTitle: string;
  milestoneDesc: string;
  milestoneDaysLeft: number;
  parentGuidance?: string;
}

export const ALL_COURSES: CourseOption[] = [
  {
    "id": "tnsb-en-lkg",
    "category": "school_tnsb_en",
    "gradeLevel": "primary",
    "title": "LKG — Early Discovery & Foundations (English Medium)",
    "subtitle": "200-Day Academic Tuition & Board Mastery",
    "short": "LKG • TNSB English",
    "medium": "English",
    "board": "TNSB",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "LKG Pre-School",
    "badgeColor": "#ec4899",
    "phaseTitle": "Phase 1: Academic Foundation & Core Subject Concepts",
    "phaseSub": "Day 1 of 200 • Daily Routine & Key Formulations",
    "subjects": [
      {
        "id": "tnsb-en-lkg-s1",
        "name": "English Phonics, Alphabets & Rhymes",
        "completed": 1,
        "total": 30,
        "icon": "🔤",
        "color": "#ec4899",
        "currentChapter": "Unit 1: Phonics A-Z & Sight Words"
      },
      {
        "id": "tnsb-en-lkg-s2",
        "name": "Number Magic, Counting & Shapes",
        "completed": 1,
        "total": 30,
        "icon": "🔢",
        "color": "#06b6d4",
        "currentChapter": "Unit 1: Numbers 1 to 20 & Shapes"
      },
      {
        "id": "tnsb-en-lkg-s3",
        "name": "General Awareness, Body & Nature (EVS)",
        "completed": 0,
        "total": 30,
        "icon": "🌿",
        "color": "#10b981",
        "currentChapter": "Unit 1: My Body & Five Senses"
      },
      {
        "id": "tnsb-en-lkg-s4",
        "name": "Creative Drawing, Motor Skills & Stories",
        "completed": 0,
        "total": 30,
        "icon": "🎨",
        "color": "#f59e0b",
        "currentChapter": "Unit 1: Colors & Pattern Tracing"
      }
    ],
    "tasks": [
      {
        "title": "Phonics Fun: Letter A Sound & Tracing",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Letter A Sound & Tracing",
        "rawSubject": "Phonics Fun",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Math Magic: Counting 1 to 3",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Counting 1 to 3",
        "rawSubject": "Math Magic",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "EVS: Five Senses - Eyes & Ears",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "Five Senses - Eyes & Ears",
        "rawSubject": "EVS",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Bedtime Rhyme: Twinkle Little Star",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "Twinkle Little Star",
        "rawSubject": "Bedtime Rhyme",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "LKG Pre-School Honor Roll",
    "milestoneDesc": "Complete syllabus lessons with targeted daily tests and mock exams.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "tnsb-en-ukg",
    "category": "school_tnsb_en",
    "gradeLevel": "primary",
    "title": "UKG — Senior Kindergarten Foundation (English Medium)",
    "subtitle": "200-Day Academic Tuition & Board Mastery",
    "short": "UKG • TNSB English",
    "medium": "English",
    "board": "TNSB",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "UKG Prep",
    "badgeColor": "#8b5cf6",
    "phaseTitle": "Phase 1: Academic Foundation & Core Subject Concepts",
    "phaseSub": "Day 1 of 200 • Daily Routine & Key Formulations",
    "subjects": [
      {
        "id": "tnsb-en-ukg-s1",
        "name": "English Phonics, Alphabets & Rhymes",
        "completed": 1,
        "total": 30,
        "icon": "🔤",
        "color": "#ec4899",
        "currentChapter": "Unit 1: Phonics A-Z & Sight Words"
      },
      {
        "id": "tnsb-en-ukg-s2",
        "name": "Number Magic, Counting & Shapes",
        "completed": 1,
        "total": 30,
        "icon": "🔢",
        "color": "#06b6d4",
        "currentChapter": "Unit 1: Numbers 1 to 20 & Shapes"
      },
      {
        "id": "tnsb-en-ukg-s3",
        "name": "General Awareness, Body & Nature (EVS)",
        "completed": 0,
        "total": 30,
        "icon": "🌿",
        "color": "#10b981",
        "currentChapter": "Unit 1: My Body & Five Senses"
      },
      {
        "id": "tnsb-en-ukg-s4",
        "name": "Creative Drawing, Motor Skills & Stories",
        "completed": 0,
        "total": 30,
        "icon": "🎨",
        "color": "#f59e0b",
        "currentChapter": "Unit 1: Colors & Pattern Tracing"
      }
    ],
    "tasks": [
      {
        "title": "English Phonics: -at & -an Word Families",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "-at & -an Word Families",
        "rawSubject": "English Phonics",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Mathematics: Picture Addition (1-10)",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Picture Addition (1-10)",
        "rawSubject": "Mathematics",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "Science: How Seeds Grow into Plants",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "How Seeds Grow into Plants",
        "rawSubject": "Science",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Daily Story: The Lion & Rabbit",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "The Lion & Rabbit",
        "rawSubject": "Daily Story",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "UKG Prep Honor Roll",
    "milestoneDesc": "Complete syllabus lessons with targeted daily tests and mock exams.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "tnsb-en-1",
    "category": "school_tnsb_en",
    "gradeLevel": "primary",
    "title": "Class 1 — Tamil Nadu State Board (English)",
    "subtitle": "200-Day Academic Tuition & Board Mastery",
    "short": "Class 1 • TNSB English",
    "medium": "English",
    "board": "TNSB",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "1st Std Tuition",
    "badgeColor": "#06b6d4",
    "phaseTitle": "Phase 1: Academic Foundation & Core Subject Concepts",
    "phaseSub": "Day 1 of 200 • Daily Routine & Key Formulations",
    "subjects": [
      {
        "id": "tnsb-en-1-s1",
        "name": "Mathematics (Number Magic & Geometry)",
        "completed": 1,
        "total": 40,
        "icon": "🔢",
        "color": "#06b6d4",
        "currentChapter": "Unit 1: Shapes, Space & Numbers"
      },
      {
        "id": "tnsb-en-1-s2",
        "name": "Environmental Studies (EVS & Science)",
        "completed": 1,
        "total": 40,
        "icon": "🌿",
        "color": "#10b981",
        "currentChapter": "Unit 1: Plants, Animals & Family"
      },
      {
        "id": "tnsb-en-1-s3",
        "name": "English Language & Reading Literacy",
        "completed": 0,
        "total": 40,
        "icon": "📖",
        "color": "#ec4899",
        "currentChapter": "Unit 1: Prose, Poetry & Phonics"
      },
      {
        "id": "tnsb-en-1-s4",
        "name": "Tamil / Second Language & General Knowledge",
        "completed": 0,
        "total": 40,
        "icon": "✍️",
        "color": "#f59e0b",
        "currentChapter": "Unit 1: Language Basics & Values"
      }
    ],
    "tasks": [
      {
        "title": "கணிதம் (Mathematics): Number Magic & Counting (1 to 100)",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Number Magic & Counting (1 to 100)",
        "rawSubject": "கணிதம் (Mathematics)",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "சூழ்நிலையியல் (EVS & Science): My Amazing Body & Five Senses",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "My Amazing Body & Five Senses",
        "rawSubject": "சூழ்நிலையியல் (EVS & Science)",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "தமிழ் பாடம் (Tamil): உயிர் எழுத்துக்கள் (அ முதல் ஔ வரை) & சொற்கள்",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "உயிர் எழுத்துக்கள் (அ முதல் ஔ வரை) & சொற்கள்",
        "rawSubject": "தமிழ் பாடம் (Tamil)",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Parent-Assisted 5-Minute Bedtime Revision & Story Time",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "Parent-Assisted 5-Minute Bedtime Revision & Story Time",
        "rawSubject": "Hands-On & Recap",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "1st Std Tuition Honor Roll",
    "milestoneDesc": "Complete syllabus lessons with targeted daily tests and mock exams.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "tnsb-en-2",
    "category": "school_tnsb_en",
    "gradeLevel": "primary",
    "title": "Class 2 — Tamil Nadu State Board (English)",
    "subtitle": "200-Day Academic Tuition & Board Mastery",
    "short": "Class 2 • TNSB English",
    "medium": "English",
    "board": "TNSB",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "2nd Std Tuition",
    "badgeColor": "#06b6d4",
    "phaseTitle": "Phase 1: Academic Foundation & Core Subject Concepts",
    "phaseSub": "Day 1 of 200 • Daily Routine & Key Formulations",
    "subjects": [
      {
        "id": "tnsb-en-2-s1",
        "name": "Mathematics (Number Magic & Geometry)",
        "completed": 1,
        "total": 40,
        "icon": "🔢",
        "color": "#06b6d4",
        "currentChapter": "Unit 1: Shapes, Space & Numbers"
      },
      {
        "id": "tnsb-en-2-s2",
        "name": "Environmental Studies (EVS & Science)",
        "completed": 1,
        "total": 40,
        "icon": "🌿",
        "color": "#10b981",
        "currentChapter": "Unit 1: Plants, Animals & Family"
      },
      {
        "id": "tnsb-en-2-s3",
        "name": "English Language & Reading Literacy",
        "completed": 0,
        "total": 40,
        "icon": "📖",
        "color": "#ec4899",
        "currentChapter": "Unit 1: Prose, Poetry & Phonics"
      },
      {
        "id": "tnsb-en-2-s4",
        "name": "Tamil / Second Language & General Knowledge",
        "completed": 0,
        "total": 40,
        "icon": "✍️",
        "color": "#f59e0b",
        "currentChapter": "Unit 1: Language Basics & Values"
      }
    ],
    "tasks": [
      {
        "title": "Mathematics: 2-Digit Addition with Regrouping",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "2-Digit Addition with Regrouping",
        "rawSubject": "Mathematics",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "EVS: Animals and Their Habitats",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Animals and Their Habitats",
        "rawSubject": "EVS",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "English: Action Verbs and Simple Present",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "Action Verbs and Simple Present",
        "rawSubject": "English",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Daily 5-Question Quick Quiz",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "Daily 5-Question Quick Quiz",
        "rawSubject": "Hands-On & Recap",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "2nd Std Tuition Honor Roll",
    "milestoneDesc": "Complete syllabus lessons with targeted daily tests and mock exams.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "tnsb-en-3",
    "category": "school_tnsb_en",
    "gradeLevel": "primary",
    "title": "Class 3 — Tamil Nadu State Board (English)",
    "subtitle": "200-Day Academic Tuition & Board Mastery",
    "short": "Class 3 • TNSB English",
    "medium": "English",
    "board": "TNSB",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "3rd Std Tuition",
    "badgeColor": "#06b6d4",
    "phaseTitle": "Phase 1: Academic Foundation & Core Subject Concepts",
    "phaseSub": "Day 1 of 200 • Daily Routine & Key Formulations",
    "subjects": [
      {
        "id": "tnsb-en-3-s1",
        "name": "Mathematics (Number Magic & Geometry)",
        "completed": 1,
        "total": 40,
        "icon": "🔢",
        "color": "#06b6d4",
        "currentChapter": "Unit 1: Shapes, Space & Numbers"
      },
      {
        "id": "tnsb-en-3-s2",
        "name": "Environmental Studies (EVS & Science)",
        "completed": 1,
        "total": 40,
        "icon": "🌿",
        "color": "#10b981",
        "currentChapter": "Unit 1: Plants, Animals & Family"
      },
      {
        "id": "tnsb-en-3-s3",
        "name": "English Language & Reading Literacy",
        "completed": 0,
        "total": 40,
        "icon": "📖",
        "color": "#ec4899",
        "currentChapter": "Unit 1: Prose, Poetry & Phonics"
      },
      {
        "id": "tnsb-en-3-s4",
        "name": "Tamil / Second Language & General Knowledge",
        "completed": 0,
        "total": 40,
        "icon": "✍️",
        "color": "#f59e0b",
        "currentChapter": "Unit 1: Language Basics & Values"
      }
    ],
    "tasks": [
      {
        "title": "Mathematics: Multiplication Tables 1 to 10 Made Easy",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Multiplication Tables 1 to 10 Made Easy",
        "rawSubject": "Mathematics",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Science: Solid, Liquid, Gas - States of Matter",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Solid, Liquid, Gas - States of Matter",
        "rawSubject": "Science",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "Social Science: Our Local Helpers & Safety Rules",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "Our Local Helpers & Safety Rules",
        "rawSubject": "Social Science",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "English: Adjectives and Descriptive Sentences",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "Adjectives and Descriptive Sentences",
        "rawSubject": "English",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "3rd Std Tuition Honor Roll",
    "milestoneDesc": "Complete syllabus lessons with targeted daily tests and mock exams.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "tnsb-en-4",
    "category": "school_tnsb_en",
    "gradeLevel": "primary",
    "title": "Class 4 — Tamil Nadu State Board (English)",
    "subtitle": "200-Day Academic Tuition & Board Mastery",
    "short": "Class 4 • TNSB English",
    "medium": "English",
    "board": "TNSB",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "4th Std Tuition",
    "badgeColor": "#06b6d4",
    "phaseTitle": "Phase 1: Academic Foundation & Core Subject Concepts",
    "phaseSub": "Day 1 of 200 • Daily Routine & Key Formulations",
    "subjects": [
      {
        "id": "tnsb-en-4-s1",
        "name": "Mathematics (Number Magic & Geometry)",
        "completed": 1,
        "total": 40,
        "icon": "🔢",
        "color": "#06b6d4",
        "currentChapter": "Unit 1: Shapes, Space & Numbers"
      },
      {
        "id": "tnsb-en-4-s2",
        "name": "Environmental Studies (EVS & Science)",
        "completed": 1,
        "total": 40,
        "icon": "🌿",
        "color": "#10b981",
        "currentChapter": "Unit 1: Plants, Animals & Family"
      },
      {
        "id": "tnsb-en-4-s3",
        "name": "English Language & Reading Literacy",
        "completed": 0,
        "total": 40,
        "icon": "📖",
        "color": "#ec4899",
        "currentChapter": "Unit 1: Prose, Poetry & Phonics"
      },
      {
        "id": "tnsb-en-4-s4",
        "name": "Tamil / Second Language & General Knowledge",
        "completed": 0,
        "total": 40,
        "icon": "✍️",
        "color": "#f59e0b",
        "currentChapter": "Unit 1: Language Basics & Values"
      }
    ],
    "tasks": [
      {
        "title": "Mathematics: Long Division & Quotient-Remainder",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Long Division & Quotient-Remainder",
        "rawSubject": "Mathematics",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Science: Human Digestive System - Food Journey",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Human Digestive System - Food Journey",
        "rawSubject": "Science",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "Social Science: The Great Chola Empire & Temples",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "The Great Chola Empire & Temples",
        "rawSubject": "Social Science",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Daily 5-Question Concept Test",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "Daily 5-Question Concept Test",
        "rawSubject": "Hands-On & Recap",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "4th Std Tuition Honor Roll",
    "milestoneDesc": "Complete syllabus lessons with targeted daily tests and mock exams.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "tnsb-en-5",
    "category": "school_tnsb_en",
    "gradeLevel": "primary",
    "title": "Class 5 — Tamil Nadu State Board (English)",
    "subtitle": "200-Day Academic Tuition & Board Mastery",
    "short": "Class 5 • TNSB English",
    "medium": "English",
    "board": "TNSB",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "5th Std Tuition",
    "badgeColor": "#06b6d4",
    "phaseTitle": "Phase 1: Academic Foundation & Core Subject Concepts",
    "phaseSub": "Day 1 of 200 • Daily Routine & Key Formulations",
    "subjects": [
      {
        "id": "tnsb-en-5-s1",
        "name": "Mathematics (Number Magic & Geometry)",
        "completed": 1,
        "total": 40,
        "icon": "🔢",
        "color": "#06b6d4",
        "currentChapter": "Unit 1: Shapes, Space & Numbers"
      },
      {
        "id": "tnsb-en-5-s2",
        "name": "Environmental Studies (EVS & Science)",
        "completed": 1,
        "total": 40,
        "icon": "🌿",
        "color": "#10b981",
        "currentChapter": "Unit 1: Plants, Animals & Family"
      },
      {
        "id": "tnsb-en-5-s3",
        "name": "English Language & Reading Literacy",
        "completed": 0,
        "total": 40,
        "icon": "📖",
        "color": "#ec4899",
        "currentChapter": "Unit 1: Prose, Poetry & Phonics"
      },
      {
        "id": "tnsb-en-5-s4",
        "name": "Tamil / Second Language & General Knowledge",
        "completed": 0,
        "total": 40,
        "icon": "✍️",
        "color": "#f59e0b",
        "currentChapter": "Unit 1: Language Basics & Values"
      }
    ],
    "tasks": [
      {
        "title": "Mathematics: Place Value of 6-Digit Numbers",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Place Value of 6-Digit Numbers",
        "rawSubject": "Mathematics",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Science: Human Circulatory System - Heart & Arteries",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Human Circulatory System - Heart & Arteries",
        "rawSubject": "Science",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "Social Science: Golden Age of Pallavas & Cholas",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "Golden Age of Pallavas & Cholas",
        "rawSubject": "Social Science",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Daily 5-Question Rapid Fire Quiz",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "Daily 5-Question Rapid Fire Quiz",
        "rawSubject": "Hands-On & Recap",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "5th Std Tuition Honor Roll",
    "milestoneDesc": "Complete syllabus lessons with targeted daily tests and mock exams.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "tnsb-en-6",
    "category": "school_tnsb_en",
    "gradeLevel": "middle",
    "title": "Class 6 — Tamil Nadu State Board (English)",
    "subtitle": "200-Day Academic Tuition & Board Mastery",
    "short": "Class 6 • TNSB English",
    "medium": "English",
    "board": "TNSB",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "6th Std Tuition",
    "badgeColor": "#3b82f6",
    "phaseTitle": "Phase 1: Academic Foundation & Core Subject Concepts",
    "phaseSub": "Day 1 of 200 • Daily Routine & Key Formulations",
    "subjects": [
      {
        "id": "tnsb-en-6-s1",
        "name": "Mathematics (Algebra, Geometry & Arithmetic)",
        "completed": 1,
        "total": 45,
        "icon": "📐",
        "color": "#06b6d4",
        "currentChapter": "Unit 1: Number Systems & Algebra"
      },
      {
        "id": "tnsb-en-6-s2",
        "name": "Science (Physics, Chemistry & Biology)",
        "completed": 1,
        "total": 45,
        "icon": "🔬",
        "color": "#10b981",
        "currentChapter": "Unit 1: Measurement & Living World"
      },
      {
        "id": "tnsb-en-6-s3",
        "name": "Social Science (History, Civics & Geography)",
        "completed": 0,
        "total": 45,
        "icon": "🌍",
        "color": "#f59e0b",
        "currentChapter": "Unit 1: Ancient Civilization & Maps"
      },
      {
        "id": "tnsb-en-6-s4",
        "name": "English Literature, Grammar & Composition",
        "completed": 0,
        "total": 45,
        "icon": "📚",
        "color": "#ec4899",
        "currentChapter": "Unit 1: Prose, Grammar & Tenses"
      }
    ],
    "tasks": [
      {
        "title": "Mathematics: Large Numbers & Estimation",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Large Numbers & Estimation",
        "rawSubject": "Mathematics",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Science: SI Units & Physical Quantities",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "SI Units & Physical Quantities",
        "rawSubject": "Science",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "Social Science: Indus Valley Civilisation - Harappa",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "Indus Valley Civilisation - Harappa",
        "rawSubject": "Social Science",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Daily 5-Question Diagnostic Practice Quiz",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "Daily 5-Question Diagnostic Practice Quiz",
        "rawSubject": "Hands-On & Recap",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "6th Std Tuition Honor Roll",
    "milestoneDesc": "Complete syllabus lessons with targeted daily tests and mock exams.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "tnsb-en-7",
    "category": "school_tnsb_en",
    "gradeLevel": "middle",
    "title": "Class 7 — Tamil Nadu State Board (English)",
    "subtitle": "200-Day Academic Tuition & Board Mastery",
    "short": "Class 7 • TNSB English",
    "medium": "English",
    "board": "TNSB",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "7th Std Tuition",
    "badgeColor": "#3b82f6",
    "phaseTitle": "Phase 1: Academic Foundation & Core Subject Concepts",
    "phaseSub": "Day 1 of 200 • Daily Routine & Key Formulations",
    "subjects": [
      {
        "id": "tnsb-en-7-s1",
        "name": "Mathematics (Algebra, Geometry & Arithmetic)",
        "completed": 1,
        "total": 45,
        "icon": "📐",
        "color": "#06b6d4",
        "currentChapter": "Unit 1: Number Systems & Algebra"
      },
      {
        "id": "tnsb-en-7-s2",
        "name": "Science (Physics, Chemistry & Biology)",
        "completed": 1,
        "total": 45,
        "icon": "🔬",
        "color": "#10b981",
        "currentChapter": "Unit 1: Measurement & Living World"
      },
      {
        "id": "tnsb-en-7-s3",
        "name": "Social Science (History, Civics & Geography)",
        "completed": 0,
        "total": 45,
        "icon": "🌍",
        "color": "#f59e0b",
        "currentChapter": "Unit 1: Ancient Civilization & Maps"
      },
      {
        "id": "tnsb-en-7-s4",
        "name": "English Literature, Grammar & Composition",
        "completed": 0,
        "total": 45,
        "icon": "📚",
        "color": "#ec4899",
        "currentChapter": "Unit 1: Prose, Grammar & Tenses"
      }
    ],
    "tasks": [
      {
        "title": "Mathematics: Integer Multiplication & Division",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Integer Multiplication & Division",
        "rawSubject": "Mathematics",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Science: Heat Transfer - Conduction, Convection & Radiation",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Heat Transfer - Conduction, Convection & Radiation",
        "rawSubject": "Science",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "Social Science: Sources of Medieval India",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "Sources of Medieval India",
        "rawSubject": "Social Science",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Daily 5-Question Diagnostic Practice Quiz",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "Daily 5-Question Diagnostic Practice Quiz",
        "rawSubject": "Hands-On & Recap",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "7th Std Tuition Honor Roll",
    "milestoneDesc": "Complete syllabus lessons with targeted daily tests and mock exams.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "tnsb-en-8",
    "category": "school_tnsb_en",
    "gradeLevel": "middle",
    "title": "Class 8 — Tamil Nadu State Board (English)",
    "subtitle": "200-Day Academic Tuition & Board Mastery",
    "short": "Class 8 • TNSB English",
    "medium": "English",
    "board": "TNSB",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "8th Std Tuition",
    "badgeColor": "#3b82f6",
    "phaseTitle": "Phase 1: Academic Foundation & Core Subject Concepts",
    "phaseSub": "Day 1 of 200 • Daily Routine & Key Formulations",
    "subjects": [
      {
        "id": "tnsb-en-8-s1",
        "name": "Mathematics (Algebra, Geometry & Arithmetic)",
        "completed": 1,
        "total": 45,
        "icon": "📐",
        "color": "#06b6d4",
        "currentChapter": "Unit 1: Number Systems & Algebra"
      },
      {
        "id": "tnsb-en-8-s2",
        "name": "Science (Physics, Chemistry & Biology)",
        "completed": 1,
        "total": 45,
        "icon": "🔬",
        "color": "#10b981",
        "currentChapter": "Unit 1: Measurement & Living World"
      },
      {
        "id": "tnsb-en-8-s3",
        "name": "Social Science (History, Civics & Geography)",
        "completed": 0,
        "total": 45,
        "icon": "🌍",
        "color": "#f59e0b",
        "currentChapter": "Unit 1: Ancient Civilization & Maps"
      },
      {
        "id": "tnsb-en-8-s4",
        "name": "English Literature, Grammar & Composition",
        "completed": 0,
        "total": 45,
        "icon": "📚",
        "color": "#ec4899",
        "currentChapter": "Unit 1: Prose, Grammar & Tenses"
      }
    ],
    "tasks": [
      {
        "title": "Mathematics: Rational Numbers & Properties",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Rational Numbers & Properties",
        "rawSubject": "Mathematics",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Science: Atmospheric Pressure & Barometers",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Atmospheric Pressure & Barometers",
        "rawSubject": "Science",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "Social Science: Advent of Europeans in India",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "Advent of Europeans in India",
        "rawSubject": "Social Science",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Daily 5-Question Diagnostic Practice Quiz",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "Daily 5-Question Diagnostic Practice Quiz",
        "rawSubject": "Hands-On & Recap",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "8th Std Tuition Honor Roll",
    "milestoneDesc": "Complete syllabus lessons with targeted daily tests and mock exams.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "tnsb-en-9",
    "category": "school_tnsb_en",
    "gradeLevel": "high",
    "title": "Class 9 — Tamil Nadu State Board (English)",
    "subtitle": "200-Day Academic Tuition & Board Mastery",
    "short": "Class 9 • TNSB English",
    "medium": "English",
    "board": "TNSB",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "9th Std Pre-Board",
    "badgeColor": "#6366f1",
    "phaseTitle": "Phase 1: Academic Foundation & Core Subject Concepts",
    "phaseSub": "Day 1 of 200 • Daily Routine & Key Formulations",
    "subjects": [
      {
        "id": "tnsb-en-9-s1",
        "name": "Mathematics (Real Numbers, Algebra & Geometry)",
        "completed": 1,
        "total": 50,
        "icon": "📐",
        "color": "#06b6d4",
        "currentChapter": "Chapter 1: Relations, Functions & Real Numbers"
      },
      {
        "id": "tnsb-en-9-s2",
        "name": "Science (Physics, Chemistry & Biology)",
        "completed": 1,
        "total": 50,
        "icon": "🔬",
        "color": "#10b981",
        "currentChapter": "Chapter 1: Laws of Motion, Reactions & Life Processes"
      },
      {
        "id": "tnsb-en-9-s3",
        "name": "Social Science (History, Geography & Economics)",
        "completed": 0,
        "total": 50,
        "icon": "🌍",
        "color": "#f59e0b",
        "currentChapter": "Chapter 1: Contemporary World & Resource Economics"
      },
      {
        "id": "tnsb-en-9-s4",
        "name": "English Language & Literary Analysis",
        "completed": 0,
        "total": 50,
        "icon": "📚",
        "color": "#ec4899",
        "currentChapter": "Unit 1: Prose, Poetic Devices & Applied Grammar"
      }
    ],
    "tasks": [
      {
        "title": "Mathematics: Set Language & Venn Diagrams",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Set Language & Venn Diagrams",
        "rawSubject": "Mathematics",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Science: Equations of Motion Derivations (v = u + at)",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Equations of Motion Derivations (v = u + at)",
        "rawSubject": "Science",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "Social Science: Evolution of Humans & Stone Age",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "Evolution of Humans & Stone Age",
        "rawSubject": "Social Science",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Daily 5-Question Board Foundation Quiz",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "Daily 5-Question Board Foundation Quiz",
        "rawSubject": "Hands-On & Recap",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "9th Std Pre-Board Honor Roll",
    "milestoneDesc": "Complete syllabus lessons with targeted daily tests and mock exams.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "tnsb-en-10",
    "category": "school_tnsb_en",
    "gradeLevel": "high",
    "title": "Class 10 — Tamil Nadu State Board SSLC 500/500 (English)",
    "subtitle": "200-Day Academic Tuition & Board Mastery",
    "short": "Class 10 • TNSB English",
    "medium": "English",
    "board": "TNSB",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "SSLC 500/500 Centum",
    "badgeColor": "#ec4899",
    "phaseTitle": "Phase 1: Academic Foundation & Core Subject Concepts",
    "phaseSub": "Day 1 of 200 • Daily Routine & Key Formulations",
    "subjects": [
      {
        "id": "tnsb-en-10-s1",
        "name": "Mathematics (Real Numbers, Algebra & Geometry)",
        "completed": 1,
        "total": 50,
        "icon": "📐",
        "color": "#06b6d4",
        "currentChapter": "Chapter 1: Relations, Functions & Real Numbers"
      },
      {
        "id": "tnsb-en-10-s2",
        "name": "Science (Physics, Chemistry & Biology)",
        "completed": 1,
        "total": 50,
        "icon": "🔬",
        "color": "#10b981",
        "currentChapter": "Chapter 1: Laws of Motion, Reactions & Life Processes"
      },
      {
        "id": "tnsb-en-10-s3",
        "name": "Social Science (History, Geography & Economics)",
        "completed": 0,
        "total": 50,
        "icon": "🌍",
        "color": "#f59e0b",
        "currentChapter": "Chapter 1: Contemporary World & Resource Economics"
      },
      {
        "id": "tnsb-en-10-s4",
        "name": "English Language & Literary Analysis",
        "completed": 0,
        "total": 50,
        "icon": "📚",
        "color": "#ec4899",
        "currentChapter": "Unit 1: Prose, Poetic Devices & Applied Grammar"
      }
    ],
    "tasks": [
      {
        "title": "Mathematics: Cartesian Products & Relations (5-Mark)",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Cartesian Products & Relations (5-Mark)",
        "rawSubject": "Mathematics",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Science: Newton’s Laws of Motion & Proofs",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Newton’s Laws of Motion & Proofs",
        "rawSubject": "Science",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "Social Science: Causes of World War I & Aftermath",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "Causes of World War I & Aftermath",
        "rawSubject": "Social Science",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "SSLC Centum Blueprint: 10 High-Yield One-Marks",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "10 High-Yield One-Marks",
        "rawSubject": "SSLC Centum Blueprint",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "SSLC 500/500 Centum Honor Roll",
    "milestoneDesc": "Complete syllabus lessons with targeted daily tests and mock exams.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "tnsb-en-11-sci",
    "category": "school_tnsb_en",
    "gradeLevel": "hsc",
    "title": "Class 11 — TNSB HSC +1 Science (English)",
    "subtitle": "200-Day Academic Tuition & Board Mastery",
    "short": "Class 11 • TNSB English",
    "medium": "English",
    "board": "TNSB",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "HSC +1 Science",
    "badgeColor": "#6366f1",
    "phaseTitle": "Phase 1: Academic Foundation & Core Subject Concepts",
    "phaseSub": "Day 1 of 200 • Daily Routine & Key Formulations",
    "subjects": [
      {
        "id": "tnsb-en-11-sci-s1",
        "name": "Physics (Mechanics, Optics & Electromagnetism)",
        "completed": 1,
        "total": 50,
        "icon": "⚡",
        "color": "#06b6d4",
        "currentChapter": "Unit 1: Electrostatics & Current Electricity"
      },
      {
        "id": "tnsb-en-11-sci-s2",
        "name": "Chemistry (Physical, Organic & Inorganic)",
        "completed": 1,
        "total": 50,
        "icon": "🧪",
        "color": "#10b981",
        "currentChapter": "Unit 1: Metallurgy, Solid State & Solutions"
      },
      {
        "id": "tnsb-en-11-sci-s3",
        "name": "Mathematics (Calculus, Vectors & Coordinate)",
        "completed": 0,
        "total": 50,
        "icon": "📐",
        "color": "#f59e0b",
        "currentChapter": "Unit 1: Matrices & Differential Calculus"
      },
      {
        "id": "tnsb-en-11-sci-s4",
        "name": "Biology (Botany, Zoology) / Computer Science",
        "completed": 0,
        "total": 50,
        "icon": "🧬",
        "color": "#ec4899",
        "currentChapter": "Unit 1: Reproduction, Genetics / OOP Python C++"
      }
    ],
    "tasks": [
      {
        "title": "Mathematics: Sets, Relations & Functions",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Sets, Relations & Functions",
        "rawSubject": "Mathematics",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Physics: Vectors, Dot & Cross Products",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Vectors, Dot & Cross Products",
        "rawSubject": "Physics",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "Chemistry: Mole Concept & Stoichiometry",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "Mole Concept & Stoichiometry",
        "rawSubject": "Chemistry",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Daily 5-Mark Question: Step-by-Step Solution",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "Step-by-Step Solution",
        "rawSubject": "Daily 5-Mark Question",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "HSC +1 Science Honor Roll",
    "milestoneDesc": "Complete syllabus lessons with targeted daily tests and mock exams.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "tnsb-en-11-com",
    "category": "school_tnsb_en",
    "gradeLevel": "hsc",
    "title": "Class 11 — TNSB HSC +1 Commerce & Accountancy (English)",
    "subtitle": "200-Day Academic Tuition & Board Mastery",
    "short": "Class 11 • TNSB English",
    "medium": "English",
    "board": "TNSB",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "HSC +1 Commerce",
    "badgeColor": "#10b981",
    "phaseTitle": "Phase 1: Academic Foundation & Core Subject Concepts",
    "phaseSub": "Day 1 of 200 • Daily Routine & Key Formulations",
    "subjects": [
      {
        "id": "tnsb-en-11-com-s1",
        "name": "Accountancy & Financial Statements",
        "completed": 1,
        "total": 50,
        "icon": "📊",
        "color": "#06b6d4",
        "currentChapter": "Unit 1: Partnership Accounting & Balance Sheets"
      },
      {
        "id": "tnsb-en-11-com-s2",
        "name": "Commerce & Principles of Management",
        "completed": 1,
        "total": 50,
        "icon": "💼",
        "color": "#10b981",
        "currentChapter": "Unit 1: Management Functions & Corporate Finance"
      },
      {
        "id": "tnsb-en-11-com-s3",
        "name": "Economics (Micro, Macro & Indian Economy)",
        "completed": 0,
        "total": 50,
        "icon": "📈",
        "color": "#f59e0b",
        "currentChapter": "Unit 1: Macroeconomics & National Income"
      },
      {
        "id": "tnsb-en-11-com-s4",
        "name": "Business Mathematics / Computer Applications",
        "completed": 0,
        "total": 50,
        "icon": "💻",
        "color": "#ec4899",
        "currentChapter": "Unit 1: Matrices, Calculus & Spreadsheet Models"
      }
    ],
    "tasks": [
      {
        "title": "Accountancy: Golden Rules of Accounting",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Golden Rules of Accounting",
        "rawSubject": "Accountancy",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Commerce: Economic & Non-Economic Activities",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Economic & Non-Economic Activities",
        "rawSubject": "Commerce",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "Economics: Definitions of Economics (Smith/Robbins)",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "Definitions of Economics (Smith/Robbins)",
        "rawSubject": "Economics",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Daily Problem: Journal Entry Drafting",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "Journal Entry Drafting",
        "rawSubject": "Daily Problem",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "HSC +1 Commerce Honor Roll",
    "milestoneDesc": "Complete syllabus lessons with targeted daily tests and mock exams.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "tnsb-en-12-sci",
    "category": "school_tnsb_en",
    "gradeLevel": "hsc",
    "title": "Class 12 — TNSB HSC +2 Science 600/600 (English)",
    "subtitle": "200-Day Academic Tuition & Board Mastery",
    "short": "Class 12 • TNSB English",
    "medium": "English",
    "board": "TNSB",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "HSC +2 Centum Science",
    "badgeColor": "#ec4899",
    "phaseTitle": "Phase 1: Academic Foundation & Core Subject Concepts",
    "phaseSub": "Day 1 of 200 • Daily Routine & Key Formulations",
    "subjects": [
      {
        "id": "tnsb-en-12-sci-s1",
        "name": "Physics (Mechanics, Optics & Electromagnetism)",
        "completed": 1,
        "total": 50,
        "icon": "⚡",
        "color": "#06b6d4",
        "currentChapter": "Unit 1: Electrostatics & Current Electricity"
      },
      {
        "id": "tnsb-en-12-sci-s2",
        "name": "Chemistry (Physical, Organic & Inorganic)",
        "completed": 1,
        "total": 50,
        "icon": "🧪",
        "color": "#10b981",
        "currentChapter": "Unit 1: Metallurgy, Solid State & Solutions"
      },
      {
        "id": "tnsb-en-12-sci-s3",
        "name": "Mathematics (Calculus, Vectors & Coordinate)",
        "completed": 0,
        "total": 50,
        "icon": "📐",
        "color": "#f59e0b",
        "currentChapter": "Unit 1: Matrices & Differential Calculus"
      },
      {
        "id": "tnsb-en-12-sci-s4",
        "name": "Biology (Botany, Zoology) / Computer Science",
        "completed": 0,
        "total": 50,
        "icon": "🧬",
        "color": "#ec4899",
        "currentChapter": "Unit 1: Reproduction, Genetics / OOP Python C++"
      }
    ],
    "tasks": [
      {
        "title": "Mathematics: Inverse of Matrix by Gauss-Jordan",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Inverse of Matrix by Gauss-Jordan",
        "rawSubject": "Mathematics",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Physics: Electric Field of Dipole on Axial Line",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Electric Field of Dipole on Axial Line",
        "rawSubject": "Physics",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "Chemistry: Froth Floatation & Leaching",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "Froth Floatation & Leaching",
        "rawSubject": "Chemistry",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "HSC Centum Drill: 15 High-Yield Objective Qs",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "15 High-Yield Objective Qs",
        "rawSubject": "HSC Centum Drill",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "HSC +2 Centum Science Honor Roll",
    "milestoneDesc": "Complete syllabus lessons with targeted daily tests and mock exams.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "tnsb-en-12-cs",
    "category": "school_tnsb_en",
    "gradeLevel": "hsc",
    "title": "Class 12 — TNSB HSC +2 Computer Science (English)",
    "subtitle": "200-Day Academic Tuition & Board Mastery",
    "short": "Class 12 • TNSB English",
    "medium": "English",
    "board": "TNSB",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "HSC +2 CS 100/100",
    "badgeColor": "#06b6d4",
    "phaseTitle": "Phase 1: Academic Foundation & Core Subject Concepts",
    "phaseSub": "Day 1 of 200 • Daily Routine & Key Formulations",
    "subjects": [
      {
        "id": "tnsb-en-12-cs-s1",
        "name": "Physics (Mechanics, Optics & Electromagnetism)",
        "completed": 1,
        "total": 50,
        "icon": "⚡",
        "color": "#06b6d4",
        "currentChapter": "Unit 1: Electrostatics & Current Electricity"
      },
      {
        "id": "tnsb-en-12-cs-s2",
        "name": "Chemistry (Physical, Organic & Inorganic)",
        "completed": 1,
        "total": 50,
        "icon": "🧪",
        "color": "#10b981",
        "currentChapter": "Unit 1: Metallurgy, Solid State & Solutions"
      },
      {
        "id": "tnsb-en-12-cs-s3",
        "name": "Mathematics (Calculus, Vectors & Coordinate)",
        "completed": 0,
        "total": 50,
        "icon": "📐",
        "color": "#f59e0b",
        "currentChapter": "Unit 1: Matrices & Differential Calculus"
      },
      {
        "id": "tnsb-en-12-cs-s4",
        "name": "Biology (Botany, Zoology) / Computer Science",
        "completed": 0,
        "total": 50,
        "icon": "🧬",
        "color": "#ec4899",
        "currentChapter": "Unit 1: Reproduction, Genetics / OOP Python C++"
      }
    ],
    "tasks": [
      {
        "title": "Computer Science: LEGB Scope Rule & Functions",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "LEGB Scope Rule & Functions",
        "rawSubject": "Computer Science",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Mathematics: Cramer’s Rule & Linear Equations",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Cramer’s Rule & Linear Equations",
        "rawSubject": "Mathematics",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "Physics: Capacitors in Series and Parallel",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "Capacitors in Series and Parallel",
        "rawSubject": "Physics",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Code Practice: Python Recursion Program",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "Python Recursion Program",
        "rawSubject": "Code Practice",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "HSC +2 CS 100/100 Honor Roll",
    "milestoneDesc": "Complete syllabus lessons with targeted daily tests and mock exams.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "tnsb-en-12-com",
    "category": "school_tnsb_en",
    "gradeLevel": "hsc",
    "title": "Class 12 — TNSB HSC +2 Commerce & Accountancy (English)",
    "subtitle": "200-Day Academic Tuition & Board Mastery",
    "short": "Class 12 • TNSB English",
    "medium": "English",
    "board": "TNSB",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "HSC +2 Centum Commerce",
    "badgeColor": "#f59e0b",
    "phaseTitle": "Phase 1: Academic Foundation & Core Subject Concepts",
    "phaseSub": "Day 1 of 200 • Daily Routine & Key Formulations",
    "subjects": [
      {
        "id": "tnsb-en-12-com-s1",
        "name": "Accountancy & Financial Statements",
        "completed": 1,
        "total": 50,
        "icon": "📊",
        "color": "#06b6d4",
        "currentChapter": "Unit 1: Partnership Accounting & Balance Sheets"
      },
      {
        "id": "tnsb-en-12-com-s2",
        "name": "Commerce & Principles of Management",
        "completed": 1,
        "total": 50,
        "icon": "💼",
        "color": "#10b981",
        "currentChapter": "Unit 1: Management Functions & Corporate Finance"
      },
      {
        "id": "tnsb-en-12-com-s3",
        "name": "Economics (Micro, Macro & Indian Economy)",
        "completed": 0,
        "total": 50,
        "icon": "📈",
        "color": "#f59e0b",
        "currentChapter": "Unit 1: Macroeconomics & National Income"
      },
      {
        "id": "tnsb-en-12-com-s4",
        "name": "Business Mathematics / Computer Applications",
        "completed": 0,
        "total": 50,
        "icon": "💻",
        "color": "#ec4899",
        "currentChapter": "Unit 1: Matrices, Calculus & Spreadsheet Models"
      }
    ],
    "tasks": [
      {
        "title": "Accountancy: Statement of Affairs Net Profit",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Statement of Affairs Net Profit",
        "rawSubject": "Accountancy",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Commerce: Henri Fayol 14 Principles of Management",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Henri Fayol 14 Principles of Management",
        "rawSubject": "Commerce",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "Economics: Circular Flow of Income Models",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "Circular Flow of Income Models",
        "rawSubject": "Economics",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Board Practice: 5-Mark Practical Problem",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "5-Mark Practical Problem",
        "rawSubject": "Board Practice",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "HSC +2 Centum Commerce Honor Roll",
    "milestoneDesc": "Complete syllabus lessons with targeted daily tests and mock exams.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "tnsb-ta-lkg",
    "category": "school_tnsb_ta",
    "gradeLevel": "primary",
    "title": "மழலையர் LKG — தமிழ் வழி ஆரம்பக் கல்வி",
    "subtitle": "200-நாள் தமிழ் வழி அரசுப் பாடத்திட்டப் பயிற்சி",
    "short": "மழலையர் LKG • தமிழ் வழி",
    "medium": "Tamil",
    "board": "TNSB",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "மழலையர் LKG",
    "badgeColor": "#ec4899",
    "phaseTitle": "பகுதி 1: அரசுப் பாடநூல் அடிப்படை மற்றும் முக்கிய வினா விடைகள்",
    "phaseSub": "நாள் 1 / 200 • தினசரி அட்டவணை & சூத்திரங்கள்",
    "subjects": [
      {
        "id": "tnsb-ta-lkg-s1",
        "name": "தமிழ் உயிர் எழுத்துக்கள் & மழலைப் பாட்டு",
        "completed": 1,
        "total": 30,
        "icon": "✍️",
        "color": "#ec4899",
        "currentChapter": "அலகு 1: தமிழ் எழுத்து அறிமுகம்"
      },
      {
        "id": "tnsb-ta-lkg-s2",
        "name": "எண்கள் & வடிவங்கள் (Number Fun)",
        "completed": 1,
        "total": 30,
        "icon": "🔢",
        "color": "#06b6d4",
        "currentChapter": "அலகு 1: 1 முதல் 10 வரை எண்கள்"
      },
      {
        "id": "tnsb-ta-lkg-s3",
        "name": "சூழ்நிலையியல் & பழக்க வழக்கங்கள் (EVS)",
        "completed": 0,
        "total": 30,
        "icon": "🌿",
        "color": "#10b981",
        "currentChapter": "அலகு 1: நமது உடல் உறுப்புகள்"
      },
      {
        "id": "tnsb-ta-lkg-s4",
        "name": "வண்ணங்கள், கைவினை & கதைகள்",
        "completed": 0,
        "total": 30,
        "icon": "🎨",
        "color": "#f59e0b",
        "currentChapter": "அலகு 1: வண்ணங்கள் அறிவோம்"
      }
    ],
    "tasks": [
      {
        "title": "தமிழ்: உயிர் எழுத்துக்கள் (அ முதல் ஔ) அறிமுகம்",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "உயிர் எழுத்துக்கள் (அ முதல் ஔ) அறிமுகம்",
        "rawSubject": "தமிழ்",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "கணிதம்: எண்கள் 1-5 விரல் எண்ணுதல்",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "எண்கள் 1-5 விரல் எண்ணுதல்",
        "rawSubject": "கணிதம்",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "சூழ்நிலையியல்: ஐம்புலன்கள் மற்றும் உறுப்புகள்",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "ஐம்புலன்கள் மற்றும் உறுப்புகள்",
        "rawSubject": "சூழ்நிலையியல்",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "மழலையர் பாடல்: கைவீசம்மா கைவீசு பாடி ஆடுதல்",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "கைவீசம்மா கைவீசு பாடி ஆடுதல்",
        "rawSubject": "மழலையர் பாடல்",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "மழலையர் LKG சாதனையாளர் விருது",
    "milestoneDesc": "அனைத்துப் பாடங்களிலும் முழு மதிப்பெண் பெறும் தினசரி பயிற்சி.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "tnsb-ta-ukg",
    "category": "school_tnsb_ta",
    "gradeLevel": "primary",
    "title": "மழலையர் UKG — தமிழ் வழி பாலர் கல்வி",
    "subtitle": "200-நாள் தமிழ் வழி அரசுப் பாடத்திட்டப் பயிற்சி",
    "short": "மழலையர் UKG • தமிழ் வழி",
    "medium": "Tamil",
    "board": "TNSB",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "மழலையர் UKG",
    "badgeColor": "#8b5cf6",
    "phaseTitle": "பகுதி 1: அரசுப் பாடநூல் அடிப்படை மற்றும் முக்கிய வினா விடைகள்",
    "phaseSub": "நாள் 1 / 200 • தினசரி அட்டவணை & சூத்திரங்கள்",
    "subjects": [
      {
        "id": "tnsb-ta-ukg-s1",
        "name": "தமிழ் உயிர் எழுத்துக்கள் & மழலைப் பாட்டு",
        "completed": 1,
        "total": 30,
        "icon": "✍️",
        "color": "#ec4899",
        "currentChapter": "அலகு 1: தமிழ் எழுத்து அறிமுகம்"
      },
      {
        "id": "tnsb-ta-ukg-s2",
        "name": "எண்கள் & வடிவங்கள் (Number Fun)",
        "completed": 1,
        "total": 30,
        "icon": "🔢",
        "color": "#06b6d4",
        "currentChapter": "அலகு 1: 1 முதல் 10 வரை எண்கள்"
      },
      {
        "id": "tnsb-ta-ukg-s3",
        "name": "சூழ்நிலையியல் & பழக்க வழக்கங்கள் (EVS)",
        "completed": 0,
        "total": 30,
        "icon": "🌿",
        "color": "#10b981",
        "currentChapter": "அலகு 1: நமது உடல் உறுப்புகள்"
      },
      {
        "id": "tnsb-ta-ukg-s4",
        "name": "வண்ணங்கள், கைவினை & கதைகள்",
        "completed": 0,
        "total": 30,
        "icon": "🎨",
        "color": "#f59e0b",
        "currentChapter": "அலகு 1: வண்ணங்கள் அறிவோம்"
      }
    ],
    "tasks": [
      {
        "title": "தமிழ்: மெய் எழுத்துக்கள் (க் முதல் ன்) 18",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "மெய் எழுத்துக்கள் (க் முதல் ன்) 18",
        "rawSubject": "தமிழ்",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "கணிதம்: எளிய கூட்டல் (1-10) படங்கள் மூலம்",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "எளிய கூட்டல் (1-10) படங்கள் மூலம்",
        "rawSubject": "கணிதம்",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "அறிவியல்: விதைகள் செடியாக வளரும் விதம்",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "விதைகள் செடியாக வளரும் விதம்",
        "rawSubject": "அறிவியல்",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "நீதிக்கதை: ஒற்றுமையே பலம் புறாக்கள் கதை",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "ஒற்றுமையே பலம் புறாக்கள் கதை",
        "rawSubject": "நீதிக்கதை",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "மழலையர் UKG சாதனையாளர் விருது",
    "milestoneDesc": "அனைத்துப் பாடங்களிலும் முழு மதிப்பெண் பெறும் தினசரி பயிற்சி.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "tnsb-ta-1",
    "category": "school_tnsb_ta",
    "gradeLevel": "primary",
    "title": "1-ஆம் வகுப்பு — தமிழ்நாடு அரசுப் பாடத்திட்டம் (தமிழ் வழி)",
    "subtitle": "200-நாள் தமிழ் வழி அரசுப் பாடத்திட்டப் பயிற்சி",
    "short": "1-ஆம் வகுப்பு • தமிழ் வழி",
    "medium": "Tamil",
    "board": "TNSB",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "1-ஆம் வகுப்பு",
    "badgeColor": "#10b981",
    "phaseTitle": "பகுதி 1: அரசுப் பாடநூல் அடிப்படை மற்றும் முக்கிய வினா விடைகள்",
    "phaseSub": "நாள் 1 / 200 • தினசரி அட்டவணை & சூத்திரங்கள்",
    "subjects": [
      {
        "id": "tnsb-ta-1-s1",
        "name": "தமிழ் பாடம் & இலக்கணம்",
        "completed": 1,
        "total": 40,
        "icon": "📖",
        "color": "#ec4899",
        "currentChapter": "இயல் 1: ஆத்திசூடி & இனிய தமிழ்"
      },
      {
        "id": "tnsb-ta-1-s2",
        "name": "கணிதம் (Mathematics)",
        "completed": 1,
        "total": 40,
        "icon": "🔢",
        "color": "#06b6d4",
        "currentChapter": "அலகு 1: எண்களின் அமைப்புகள் & கூட்டல்"
      },
      {
        "id": "tnsb-ta-1-s3",
        "name": "சூழ்நிலையியல் & அறிவியல் (EVS)",
        "completed": 0,
        "total": 40,
        "icon": "🌿",
        "color": "#10b981",
        "currentChapter": "அலகு 1: நமது சுற்றுப்புறம் & தாவரங்கள்"
      },
      {
        "id": "tnsb-ta-1-s4",
        "name": "ஆங்கிலம் (English Basics)",
        "completed": 0,
        "total": 40,
        "icon": "🔤",
        "color": "#f59e0b",
        "currentChapter": "Unit 1: Vocabulary & Simple Sentences"
      }
    ],
    "tasks": [
      {
        "title": "தமிழ்: உயிர் எழுத்துக்கள் 12 மற்றும் ஆத்திசூடி",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "உயிர் எழுத்துக்கள் 12 மற்றும் ஆத்திசூடி",
        "rawSubject": "தமிழ்",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "கணிதம்: எண்கள் 1 முதல் 20 வரை வரிசைப்படுத்துதல்",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "எண்கள் 1 முதல் 20 வரை வரிசைப்படுத்துதல்",
        "rawSubject": "கணிதம்",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "சூழ்நிலையியல்: ஐம்புலன்கள் மற்றும் அவற்றின் பயன்கள்",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "ஐம்புலன்கள் மற்றும் அவற்றின் பயன்கள்",
        "rawSubject": "சூழ்நிலையியல்",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "தினசரி 5 வினாக்கள் பயிற்சித் தேர்வு",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "தினசரி 5 வினாக்கள் பயிற்சித் தேர்வு",
        "rawSubject": "Hands-On & Recap",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "1-ஆம் வகுப்பு சாதனையாளர் விருது",
    "milestoneDesc": "அனைத்துப் பாடங்களிலும் முழு மதிப்பெண் பெறும் தினசரி பயிற்சி.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "tnsb-ta-2",
    "category": "school_tnsb_ta",
    "gradeLevel": "primary",
    "title": "2-ஆம் வகுப்பு — தமிழ்நாடு அரசுப் பாடத்திட்டம் (தமிழ் வழி)",
    "subtitle": "200-நாள் தமிழ் வழி அரசுப் பாடத்திட்டப் பயிற்சி",
    "short": "2-ஆம் வகுப்பு • தமிழ் வழி",
    "medium": "Tamil",
    "board": "TNSB",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "2-ஆம் வகுப்பு",
    "badgeColor": "#10b981",
    "phaseTitle": "பகுதி 1: அரசுப் பாடநூல் அடிப்படை மற்றும் முக்கிய வினா விடைகள்",
    "phaseSub": "நாள் 1 / 200 • தினசரி அட்டவணை & சூத்திரங்கள்",
    "subjects": [
      {
        "id": "tnsb-ta-2-s1",
        "name": "தமிழ் பாடம் & இலக்கணம்",
        "completed": 1,
        "total": 40,
        "icon": "📖",
        "color": "#ec4899",
        "currentChapter": "இயல் 1: ஆத்திசூடி & இனிய தமிழ்"
      },
      {
        "id": "tnsb-ta-2-s2",
        "name": "கணிதம் (Mathematics)",
        "completed": 1,
        "total": 40,
        "icon": "🔢",
        "color": "#06b6d4",
        "currentChapter": "அலகு 1: எண்களின் அமைப்புகள் & கூட்டல்"
      },
      {
        "id": "tnsb-ta-2-s3",
        "name": "சூழ்நிலையியல் & அறிவியல் (EVS)",
        "completed": 0,
        "total": 40,
        "icon": "🌿",
        "color": "#10b981",
        "currentChapter": "அலகு 1: நமது சுற்றுப்புறம் & தாவரங்கள்"
      },
      {
        "id": "tnsb-ta-2-s4",
        "name": "ஆங்கிலம் (English Basics)",
        "completed": 0,
        "total": 40,
        "icon": "🔤",
        "color": "#f59e0b",
        "currentChapter": "Unit 1: Vocabulary & Simple Sentences"
      }
    ],
    "tasks": [
      {
        "title": "தமிழ்: கொன்றை வேந்தன் செய்யுள் விளக்கம்",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "கொன்றை வேந்தன் செய்யுள் விளக்கம்",
        "rawSubject": "தமிழ்",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "கணிதம்: ஈரிலக்க எண்களின் இடமதிப்பு & கூட்டல்",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "ஈரிலக்க எண்களின் இடமதிப்பு & கூட்டல்",
        "rawSubject": "கணிதம்",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "சூழ்நிலையியல்: தாவரத்தின் முக்கிய பாகங்கள்",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "தாவரத்தின் முக்கிய பாகங்கள்",
        "rawSubject": "சூழ்நிலையியல்",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "தினசரி வினாடி வினா",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "தினசரி வினாடி வினா",
        "rawSubject": "Hands-On & Recap",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "2-ஆம் வகுப்பு சாதனையாளர் விருது",
    "milestoneDesc": "அனைத்துப் பாடங்களிலும் முழு மதிப்பெண் பெறும் தினசரி பயிற்சி.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "tnsb-ta-3",
    "category": "school_tnsb_ta",
    "gradeLevel": "primary",
    "title": "3-ஆம் வகுப்பு — தமிழ்நாடு அரசுப் பாடத்திட்டம் (தமிழ் வழி)",
    "subtitle": "200-நாள் தமிழ் வழி அரசுப் பாடத்திட்டப் பயிற்சி",
    "short": "3-ஆம் வகுப்பு • தமிழ் வழி",
    "medium": "Tamil",
    "board": "TNSB",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "3-ஆம் வகுப்பு",
    "badgeColor": "#10b981",
    "phaseTitle": "பகுதி 1: அரசுப் பாடநூல் அடிப்படை மற்றும் முக்கிய வினா விடைகள்",
    "phaseSub": "நாள் 1 / 200 • தினசரி அட்டவணை & சூத்திரங்கள்",
    "subjects": [
      {
        "id": "tnsb-ta-3-s1",
        "name": "தமிழ் பாடம் & இலக்கணம்",
        "completed": 1,
        "total": 40,
        "icon": "📖",
        "color": "#ec4899",
        "currentChapter": "இயல் 1: ஆத்திசூடி & இனிய தமிழ்"
      },
      {
        "id": "tnsb-ta-3-s2",
        "name": "கணிதம் (Mathematics)",
        "completed": 1,
        "total": 40,
        "icon": "🔢",
        "color": "#06b6d4",
        "currentChapter": "அலகு 1: எண்களின் அமைப்புகள் & கூட்டல்"
      },
      {
        "id": "tnsb-ta-3-s3",
        "name": "சூழ்நிலையியல் & அறிவியல் (EVS)",
        "completed": 0,
        "total": 40,
        "icon": "🌿",
        "color": "#10b981",
        "currentChapter": "அலகு 1: நமது சுற்றுப்புறம் & தாவரங்கள்"
      },
      {
        "id": "tnsb-ta-3-s4",
        "name": "ஆங்கிலம் (English Basics)",
        "completed": 0,
        "total": 40,
        "icon": "🔤",
        "color": "#f59e0b",
        "currentChapter": "Unit 1: Vocabulary & Simple Sentences"
      }
    ],
    "tasks": [
      {
        "title": "தமிழ்: ஔவையாரின் மூதுரை செய்யுள் நயம்",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "ஔவையாரின் மூதுரை செய்யுள் நயம்",
        "rawSubject": "தமிழ்",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "கணிதம்: பெருக்கல் வாய்ப்பாடு 1 முதல் 10 வரை",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "பெருக்கல் வாய்ப்பாடு 1 முதல் 10 வரை",
        "rawSubject": "கணிதம்",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "அறிவியல்: திண்மம், திரவம், வாயு பருப்பொருட்கள்",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "திண்மம், திரவம், வாயு பருப்பொருட்கள்",
        "rawSubject": "அறிவியல்",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "சமூக அறிவியல்: கிராம ஊராட்சி மன்ற பணிகள்",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "கிராம ஊராட்சி மன்ற பணிகள்",
        "rawSubject": "சமூக அறிவியல்",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "3-ஆம் வகுப்பு சாதனையாளர் விருது",
    "milestoneDesc": "அனைத்துப் பாடங்களிலும் முழு மதிப்பெண் பெறும் தினசரி பயிற்சி.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "tnsb-ta-4",
    "category": "school_tnsb_ta",
    "gradeLevel": "primary",
    "title": "4-ஆம் வகுப்பு — தமிழ்நாடு அரசுப் பாடத்திட்டம் (தமிழ் வழி)",
    "subtitle": "200-நாள் தமிழ் வழி அரசுப் பாடத்திட்டப் பயிற்சி",
    "short": "4-ஆம் வகுப்பு • தமிழ் வழி",
    "medium": "Tamil",
    "board": "TNSB",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "4-ஆம் வகுப்பு",
    "badgeColor": "#10b981",
    "phaseTitle": "பகுதி 1: அரசுப் பாடநூல் அடிப்படை மற்றும் முக்கிய வினா விடைகள்",
    "phaseSub": "நாள் 1 / 200 • தினசரி அட்டவணை & சூத்திரங்கள்",
    "subjects": [
      {
        "id": "tnsb-ta-4-s1",
        "name": "தமிழ் பாடம் & இலக்கணம்",
        "completed": 1,
        "total": 40,
        "icon": "📖",
        "color": "#ec4899",
        "currentChapter": "இயல் 1: ஆத்திசூடி & இனிய தமிழ்"
      },
      {
        "id": "tnsb-ta-4-s2",
        "name": "கணிதம் (Mathematics)",
        "completed": 1,
        "total": 40,
        "icon": "🔢",
        "color": "#06b6d4",
        "currentChapter": "அலகு 1: எண்களின் அமைப்புகள் & கூட்டல்"
      },
      {
        "id": "tnsb-ta-4-s3",
        "name": "சூழ்நிலையியல் & அறிவியல் (EVS)",
        "completed": 0,
        "total": 40,
        "icon": "🌿",
        "color": "#10b981",
        "currentChapter": "அலகு 1: நமது சுற்றுப்புறம் & தாவரங்கள்"
      },
      {
        "id": "tnsb-ta-4-s4",
        "name": "ஆங்கிலம் (English Basics)",
        "completed": 0,
        "total": 40,
        "icon": "🔤",
        "color": "#f59e0b",
        "currentChapter": "Unit 1: Vocabulary & Simple Sentences"
      }
    ],
    "tasks": [
      {
        "title": "தமிழ்: வெற்றி வேற்கை பாடல்கள் பொருள்",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "வெற்றி வேற்கை பாடல்கள் பொருள்",
        "rawSubject": "தமிழ்",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "கணிதம்: நீள் வகுத்தல் மற்றும் ஈவு, மீதி",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "நீள் வகுத்தல் மற்றும் ஈவு, மீதி",
        "rawSubject": "கணிதம்",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "அறிவியல்: மனித செரிமான மண்டலம் மற்றும் உணவுப் பயணம்",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "மனித செரிமான மண்டலம் மற்றும் உணவுப் பயணம்",
        "rawSubject": "அறிவியல்",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "சமூக அறிவியல்: சோழப் பேரரசு மற்றும் தஞ்சைப் பெரிய கோயில்",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "சோழப் பேரரசு மற்றும் தஞ்சைப் பெரிய கோயில்",
        "rawSubject": "சமூக அறிவியல்",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "4-ஆம் வகுப்பு சாதனையாளர் விருது",
    "milestoneDesc": "அனைத்துப் பாடங்களிலும் முழு மதிப்பெண் பெறும் தினசரி பயிற்சி.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "tnsb-ta-5",
    "category": "school_tnsb_ta",
    "gradeLevel": "primary",
    "title": "5-ஆம் வகுப்பு — தமிழ்நாடு அரசுப் பாடத்திட்டம் (தமிழ் வழி)",
    "subtitle": "200-நாள் தமிழ் வழி அரசுப் பாடத்திட்டப் பயிற்சி",
    "short": "5-ஆம் வகுப்பு • தமிழ் வழி",
    "medium": "Tamil",
    "board": "TNSB",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "5-ஆம் வகுப்பு",
    "badgeColor": "#10b981",
    "phaseTitle": "பகுதி 1: அரசுப் பாடநூல் அடிப்படை மற்றும் முக்கிய வினா விடைகள்",
    "phaseSub": "நாள் 1 / 200 • தினசரி அட்டவணை & சூத்திரங்கள்",
    "subjects": [
      {
        "id": "tnsb-ta-5-s1",
        "name": "தமிழ் பாடம் & இலக்கணம்",
        "completed": 1,
        "total": 40,
        "icon": "📖",
        "color": "#ec4899",
        "currentChapter": "இயல் 1: ஆத்திசூடி & இனிய தமிழ்"
      },
      {
        "id": "tnsb-ta-5-s2",
        "name": "கணிதம் (Mathematics)",
        "completed": 1,
        "total": 40,
        "icon": "🔢",
        "color": "#06b6d4",
        "currentChapter": "அலகு 1: எண்களின் அமைப்புகள் & கூட்டல்"
      },
      {
        "id": "tnsb-ta-5-s3",
        "name": "சூழ்நிலையியல் & அறிவியல் (EVS)",
        "completed": 0,
        "total": 40,
        "icon": "🌿",
        "color": "#10b981",
        "currentChapter": "அலகு 1: நமது சுற்றுப்புறம் & தாவரங்கள்"
      },
      {
        "id": "tnsb-ta-5-s4",
        "name": "ஆங்கிலம் (English Basics)",
        "completed": 0,
        "total": 40,
        "icon": "🔤",
        "color": "#f59e0b",
        "currentChapter": "Unit 1: Vocabulary & Simple Sentences"
      }
    ],
    "tasks": [
      {
        "title": "தமிழ்: பாவேந்தர் பாரதிதாசனின் இன்பத்தமிழ்",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "பாவேந்தர் பாரதிதாசனின் இன்பத்தமிழ்",
        "rawSubject": "தமிழ்",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "கணிதம்: 6-இலக்க எண்களின் இடமதிப்பு முறை",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "6-இலக்க எண்களின் இடமதிப்பு முறை",
        "rawSubject": "கணிதம்",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "அறிவியல்: மனித இரத்த ஓட்ட மண்டலம் - இதயம்",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "மனித இரத்த ஓட்ட மண்டலம் - இதயம்",
        "rawSubject": "அறிவியல்",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "சமூக அறிவியல்: பல்லவர் மற்றும் சோழர்களின் கட்டிடக்கலை",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "பல்லவர் மற்றும் சோழர்களின் கட்டிடக்கலை",
        "rawSubject": "சமூக அறிவியல்",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "5-ஆம் வகுப்பு சாதனையாளர் விருது",
    "milestoneDesc": "அனைத்துப் பாடங்களிலும் முழு மதிப்பெண் பெறும் தினசரி பயிற்சி.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "tnsb-ta-6",
    "category": "school_tnsb_ta",
    "gradeLevel": "middle",
    "title": "6-ஆம் வகுப்பு — தமிழ்நாடு அரசுப் பாடத்திட்டம் (தமிழ் வழி)",
    "subtitle": "200-நாள் தமிழ் வழி அரசுப் பாடத்திட்டப் பயிற்சி",
    "short": "6-ஆம் வகுப்பு • தமிழ் வழி",
    "medium": "Tamil",
    "board": "TNSB",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "6-ஆம் வகுப்பு",
    "badgeColor": "#3b82f6",
    "phaseTitle": "பகுதி 1: அரசுப் பாடநூல் அடிப்படை மற்றும் முக்கிய வினா விடைகள்",
    "phaseSub": "நாள் 1 / 200 • தினசரி அட்டவணை & சூத்திரங்கள்",
    "subjects": [
      {
        "id": "tnsb-ta-6-s1",
        "name": "தமிழ் மொழி & செய்யுள்",
        "completed": 1,
        "total": 45,
        "icon": "📜",
        "color": "#ec4899",
        "currentChapter": "இயல் 1: இன்பத்தமிழ் & தமிழ் கும்மி"
      },
      {
        "id": "tnsb-ta-6-s2",
        "name": "கணிதம் (எண்கள், இயற்கணிதம் & வடிவியல்)",
        "completed": 1,
        "total": 45,
        "icon": "📐",
        "color": "#06b6d4",
        "currentChapter": "அலகு 1: எண்கள் & முழுக்கள்"
      },
      {
        "id": "tnsb-ta-6-s3",
        "name": "அறிவியல் (இயற்பியல், வேதியியல், உயிரியல்)",
        "completed": 0,
        "total": 45,
        "icon": "🔬",
        "color": "#10b981",
        "currentChapter": "அலகு 1: அளவீட்டியல் & விசை"
      },
      {
        "id": "tnsb-ta-6-s4",
        "name": "சமூக அறிவியல் (வரலாறு, புவியியல், குடிமையியல்)",
        "completed": 0,
        "total": 45,
        "icon": "🌍",
        "color": "#f59e0b",
        "currentChapter": "அலகு 1: வரலாறு என்றால் என்ன?"
      }
    ],
    "tasks": [
      {
        "title": "தமிழ்: இயல் 1 செய்யுள் நயம் & இலக்கணக் குறிப்புகள்",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "இயல் 1 செய்யுள் நயம் & இலக்கணக் குறிப்புகள்",
        "rawSubject": "தமிழ்",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "கணிதம்: பெரிய எண்கள் & BODMAS விதி",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "பெரிய எண்கள் & BODMAS விதி",
        "rawSubject": "கணிதம்",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "அறிவியல்: நீளம், நிறை, காலத்தின் SI அலகுகள்",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "நீளம், நிறை, காலத்தின் SI அலகுகள்",
        "rawSubject": "அறிவியல்",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "சமூக அறிவியல்: சிந்துவெளி நாகரிகம் - ஹரப்பா",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "சிந்துவெளி நாகரிகம் - ஹரப்பா",
        "rawSubject": "சமூக அறிவியல்",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "6-ஆம் வகுப்பு சாதனையாளர் விருது",
    "milestoneDesc": "அனைத்துப் பாடங்களிலும் முழு மதிப்பெண் பெறும் தினசரி பயிற்சி.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "tnsb-ta-7",
    "category": "school_tnsb_ta",
    "gradeLevel": "middle",
    "title": "7-ஆம் வகுப்பு — தமிழ்நாடு அரசுப் பாடத்திட்டம் (தமிழ் வழி)",
    "subtitle": "200-நாள் தமிழ் வழி அரசுப் பாடத்திட்டப் பயிற்சி",
    "short": "7-ஆம் வகுப்பு • தமிழ் வழி",
    "medium": "Tamil",
    "board": "TNSB",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "7-ஆம் வகுப்பு",
    "badgeColor": "#3b82f6",
    "phaseTitle": "பகுதி 1: அரசுப் பாடநூல் அடிப்படை மற்றும் முக்கிய வினா விடைகள்",
    "phaseSub": "நாள் 1 / 200 • தினசரி அட்டவணை & சூத்திரங்கள்",
    "subjects": [
      {
        "id": "tnsb-ta-7-s1",
        "name": "தமிழ் மொழி & செய்யுள்",
        "completed": 1,
        "total": 45,
        "icon": "📜",
        "color": "#ec4899",
        "currentChapter": "இயல் 1: இன்பத்தமிழ் & தமிழ் கும்மி"
      },
      {
        "id": "tnsb-ta-7-s2",
        "name": "கணிதம் (எண்கள், இயற்கணிதம் & வடிவியல்)",
        "completed": 1,
        "total": 45,
        "icon": "📐",
        "color": "#06b6d4",
        "currentChapter": "அலகு 1: எண்கள் & முழுக்கள்"
      },
      {
        "id": "tnsb-ta-7-s3",
        "name": "அறிவியல் (இயற்பியல், வேதியியல், உயிரியல்)",
        "completed": 0,
        "total": 45,
        "icon": "🔬",
        "color": "#10b981",
        "currentChapter": "அலகு 1: அளவீட்டியல் & விசை"
      },
      {
        "id": "tnsb-ta-7-s4",
        "name": "சமூக அறிவியல் (வரலாறு, புவியியல், குடிமையியல்)",
        "completed": 0,
        "total": 45,
        "icon": "🌍",
        "color": "#f59e0b",
        "currentChapter": "அலகு 1: வரலாறு என்றால் என்ன?"
      }
    ],
    "tasks": [
      {
        "title": "தமிழ்: நாமக்கல் கவிஞர் எங்கள் தமிழ் பாடல்",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "நாமக்கல் கவிஞர் எங்கள் தமிழ் பாடல்",
        "rawSubject": "தமிழ்",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "கணிதம்: முழுக்களின் பெருக்கல் மற்றும் வகுத்தல்",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "முழுக்களின் பெருக்கல் மற்றும் வகுத்தல்",
        "rawSubject": "கணிதம்",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "அறிவியல்: வெப்பக் கடத்தல், வெப்பச் சலனம், கதிர்வீச்சு",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "வெப்பக் கடத்தல், வெப்பச் சலனம், கதிர்வீச்சு",
        "rawSubject": "அறிவியல்",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "சமூக அறிவியல்: இடைக்கால இந்திய வரலாற்றுச் சான்றுகள்",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "இடைக்கால இந்திய வரலாற்றுச் சான்றுகள்",
        "rawSubject": "சமூக அறிவியல்",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "7-ஆம் வகுப்பு சாதனையாளர் விருது",
    "milestoneDesc": "அனைத்துப் பாடங்களிலும் முழு மதிப்பெண் பெறும் தினசரி பயிற்சி.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "tnsb-ta-8",
    "category": "school_tnsb_ta",
    "gradeLevel": "middle",
    "title": "8-ஆம் வகுப்பு — தமிழ்நாடு அரசுப் பாடத்திட்டம் (தமிழ் வழி)",
    "subtitle": "200-நாள் தமிழ் வழி அரசுப் பாடத்திட்டப் பயிற்சி",
    "short": "8-ஆம் வகுப்பு • தமிழ் வழி",
    "medium": "Tamil",
    "board": "TNSB",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "8-ஆம் வகுப்பு",
    "badgeColor": "#3b82f6",
    "phaseTitle": "பகுதி 1: அரசுப் பாடநூல் அடிப்படை மற்றும் முக்கிய வினா விடைகள்",
    "phaseSub": "நாள் 1 / 200 • தினசரி அட்டவணை & சூத்திரங்கள்",
    "subjects": [
      {
        "id": "tnsb-ta-8-s1",
        "name": "தமிழ் மொழி & செய்யுள்",
        "completed": 1,
        "total": 45,
        "icon": "📜",
        "color": "#ec4899",
        "currentChapter": "இயல் 1: இன்பத்தமிழ் & தமிழ் கும்மி"
      },
      {
        "id": "tnsb-ta-8-s2",
        "name": "கணிதம் (எண்கள், இயற்கணிதம் & வடிவியல்)",
        "completed": 1,
        "total": 45,
        "icon": "📐",
        "color": "#06b6d4",
        "currentChapter": "அலகு 1: எண்கள் & முழுக்கள்"
      },
      {
        "id": "tnsb-ta-8-s3",
        "name": "அறிவியல் (இயற்பியல், வேதியியல், உயிரியல்)",
        "completed": 0,
        "total": 45,
        "icon": "🔬",
        "color": "#10b981",
        "currentChapter": "அலகு 1: அளவீட்டியல் & விசை"
      },
      {
        "id": "tnsb-ta-8-s4",
        "name": "சமூக அறிவியல் (வரலாறு, புவியியல், குடிமையியல்)",
        "completed": 0,
        "total": 45,
        "icon": "🌍",
        "color": "#f59e0b",
        "currentChapter": "அலகு 1: வரலாறு என்றால் என்ன?"
      }
    ],
    "tasks": [
      {
        "title": "தமிழ்: பாரதியாரின் தமிழ்மொழி வாழ்த்து",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "பாரதியாரின் தமிழ்மொழி வாழ்த்து",
        "rawSubject": "தமிழ்",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "கணிதம்: விகிதமுறு எண்களின் அடைவு, சேர்ப்புப் பண்புகள்",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "விகிதமுறு எண்களின் அடைவு, சேர்ப்புப் பண்புகள்",
        "rawSubject": "கணிதம்",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "அறிவியல்: வளிமண்டல அழுத்தம் & பாஸ்கல் விதி",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "வளிமண்டல அழுத்தம் & பாஸ்கல் விதி",
        "rawSubject": "அறிவியல்",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "சமூக அறிவியல்: ஐரோப்பியர்களின் வருகை",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "ஐரோப்பியர்களின் வருகை",
        "rawSubject": "சமூக அறிவியல்",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "8-ஆம் வகுப்பு சாதனையாளர் விருது",
    "milestoneDesc": "அனைத்துப் பாடங்களிலும் முழு மதிப்பெண் பெறும் தினசரி பயிற்சி.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "tnsb-ta-9",
    "category": "school_tnsb_ta",
    "gradeLevel": "high",
    "title": "9-ஆம் வகுப்பு — தமிழ்நாடு அரசுப் பாடத்திட்டம் (தமிழ் வழி)",
    "subtitle": "200-நாள் தமிழ் வழி அரசுப் பாடத்திட்டப் பயிற்சி",
    "short": "9-ஆம் வகுப்பு • தமிழ் வழி",
    "medium": "Tamil",
    "board": "TNSB",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "9-ஆம் வகுப்பு",
    "badgeColor": "#6366f1",
    "phaseTitle": "பகுதி 1: அரசுப் பாடநூல் அடிப்படை மற்றும் முக்கிய வினா விடைகள்",
    "phaseSub": "நாள் 1 / 200 • தினசரி அட்டவணை & சூத்திரங்கள்",
    "subjects": [
      {
        "id": "tnsb-ta-9-s1",
        "name": "தமிழ் மொழி & இலக்கியம் (SSLC 100/100)",
        "completed": 1,
        "total": 50,
        "icon": "📜",
        "color": "#ec4899",
        "currentChapter": "இயல் 1: அன்னை மொழியே & தமிழ்ச்சொல் வளம்"
      },
      {
        "id": "tnsb-ta-9-s2",
        "name": "கணிதம் (வடிவியல், இயற்கணிதம் & முக்கோணவியல்)",
        "completed": 1,
        "total": 50,
        "icon": "📐",
        "color": "#06b6d4",
        "currentChapter": "அலகு 1: உறவுகளும் சார்புகளும்"
      },
      {
        "id": "tnsb-ta-9-s3",
        "name": "அறிவியல் (இயற்பியல், வேதியியல், உயிரியல்)",
        "completed": 0,
        "total": 50,
        "icon": "🔬",
        "color": "#10b981",
        "currentChapter": "அலகு 1: இயக்க விதிகள் & ஒளியியல்"
      },
      {
        "id": "tnsb-ta-9-s4",
        "name": "சமூக அறிவியல் (வரலாறு, புவியியல், பொருளியல்)",
        "completed": 0,
        "total": 50,
        "icon": "🌍",
        "color": "#f59e0b",
        "currentChapter": "அலகு 1: முதல் உலகப்போர் & உலக மாற்றங்கள்"
      }
    ],
    "tasks": [
      {
        "title": "தமிழ்: திராவிட மொழிக் குடும்பத்தின் தோற்றம் & வகைகள்",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "திராவிட மொழிக் குடும்பத்தின் தோற்றம் & வகைகள்",
        "rawSubject": "தமிழ்",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "கணிதம்: கணங்களின் சேர்ப்பு, வெட்டு & வென்படம்",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "கணங்களின் சேர்ப்பு, வெட்டு & வென்படம்",
        "rawSubject": "கணிதம்",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "அறிவியல்: இயக்கச் சமன்பாடுகள் தருவித்தல் (v = u+at)",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "இயக்கச் சமன்பாடுகள் தருவித்தல் (v = u+at)",
        "rawSubject": "அறிவியல்",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "சமூக அறிவியல்: மனிதப் பரிணாம வளர்ச்சி",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "மனிதப் பரிணாம வளர்ச்சி",
        "rawSubject": "சமூக அறிவியல்",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "9-ஆம் வகுப்பு சாதனையாளர் விருது",
    "milestoneDesc": "அனைத்துப் பாடங்களிலும் முழு மதிப்பெண் பெறும் தினசரி பயிற்சி.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "tnsb-ta-10",
    "category": "school_tnsb_ta",
    "gradeLevel": "high",
    "title": "10-ஆம் வகுப்பு — SSLC பொதுத்தேர்வு 500/500 (தமிழ் வழி)",
    "subtitle": "200-நாள் தமிழ் வழி அரசுப் பாடத்திட்டப் பயிற்சி",
    "short": "10-ஆம் வகுப்பு • தமிழ் வழி",
    "medium": "Tamil",
    "board": "TNSB",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "SSLC 500/500 தமிழ்",
    "badgeColor": "#ec4899",
    "phaseTitle": "பகுதி 1: அரசுப் பாடநூல் அடிப்படை மற்றும் முக்கிய வினா விடைகள்",
    "phaseSub": "நாள் 1 / 200 • தினசரி அட்டவணை & சூத்திரங்கள்",
    "subjects": [
      {
        "id": "tnsb-ta-10-s1",
        "name": "தமிழ் மொழி & இலக்கியம் (SSLC 100/100)",
        "completed": 1,
        "total": 50,
        "icon": "📜",
        "color": "#ec4899",
        "currentChapter": "இயல் 1: அன்னை மொழியே & தமிழ்ச்சொல் வளம்"
      },
      {
        "id": "tnsb-ta-10-s2",
        "name": "கணிதம் (வடிவியல், இயற்கணிதம் & முக்கோணவியல்)",
        "completed": 1,
        "total": 50,
        "icon": "📐",
        "color": "#06b6d4",
        "currentChapter": "அலகு 1: உறவுகளும் சார்புகளும்"
      },
      {
        "id": "tnsb-ta-10-s3",
        "name": "அறிவியல் (இயற்பியல், வேதியியல், உயிரியல்)",
        "completed": 0,
        "total": 50,
        "icon": "🔬",
        "color": "#10b981",
        "currentChapter": "அலகு 1: இயக்க விதிகள் & ஒளியியல்"
      },
      {
        "id": "tnsb-ta-10-s4",
        "name": "சமூக அறிவியல் (வரலாறு, புவியியல், பொருளியல்)",
        "completed": 0,
        "total": 50,
        "icon": "🌍",
        "color": "#f59e0b",
        "currentChapter": "அலகு 1: முதல் உலகப்போர் & உலக மாற்றங்கள்"
      }
    ],
    "tasks": [
      {
        "title": "தமிழ்: அன்னை மொழியே பாடல் நயமும் வினா விடைகளும்",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "அன்னை மொழியே பாடல் நயமும் வினா விடைகளும்",
        "rawSubject": "தமிழ்",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "கணிதம்: கார்டீசியன் பெருக்கல், உறவுகள் & சார்புகள் (5-மதிப்பெண்)",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "கார்டீசியன் பெருக்கல், உறவுகள் & சார்புகள் (5-மதிப்பெண்)",
        "rawSubject": "கணிதம்",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "அறிவியல்: நியூட்டன் 3 இயக்க விதிகள் & உந்த மாறாக் கோட்பாடு",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "நியூட்டன் 3 இயக்க விதிகள் & உந்த மாறாக் கோட்பாடு",
        "rawSubject": "அறிவியல்",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "சமூக அறிவியல்: முதல் உலகப்போரின் முக்கிய காரணங்கள்",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "முதல் உலகப்போரின் முக்கிய காரணங்கள்",
        "rawSubject": "சமூக அறிவியல்",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "SSLC 500/500 தமிழ் சாதனையாளர் விருது",
    "milestoneDesc": "அனைத்துப் பாடங்களிலும் முழு மதிப்பெண் பெறும் தினசரி பயிற்சி.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "tnsb-ta-11-sci",
    "category": "school_tnsb_ta",
    "gradeLevel": "hsc",
    "title": "11-ஆம் வகுப்பு — +1 மேல்நிலை அறிவியல் (தமிழ் வழி)",
    "subtitle": "200-நாள் தமிழ் வழி அரசுப் பாடத்திட்டப் பயிற்சி",
    "short": "11-ஆம் வகுப்பு • தமிழ் வழி",
    "medium": "Tamil",
    "board": "TNSB",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "+1 அறிவியல் தமிழ்",
    "badgeColor": "#6366f1",
    "phaseTitle": "பகுதி 1: அரசுப் பாடநூல் அடிப்படை மற்றும் முக்கிய வினா விடைகள்",
    "phaseSub": "நாள் 1 / 200 • தினசரி அட்டவணை & சூத்திரங்கள்",
    "subjects": [
      {
        "id": "tnsb-ta-11-sci-s1",
        "name": "இயற்பியல் (Physics 100/100)",
        "completed": 1,
        "total": 50,
        "icon": "⚡",
        "color": "#06b6d4",
        "currentChapter": "அலகு 1: நிலைமின்னியல் & மின்னோட்டவியல்"
      },
      {
        "id": "tnsb-ta-11-sci-s2",
        "name": "வேதியியல் (Chemistry 100/100)",
        "completed": 1,
        "total": 50,
        "icon": "🧪",
        "color": "#10b981",
        "currentChapter": "அலகு 1: உலோகவியல் & திண்ம நிலை"
      },
      {
        "id": "tnsb-ta-11-sci-s3",
        "name": "கணிதம் (Mathematics 100/100)",
        "completed": 0,
        "total": 50,
        "icon": "📐",
        "color": "#f59e0b",
        "currentChapter": "அலகு 1: அணிகள் & வகை நுண்கணிதம்"
      },
      {
        "id": "tnsb-ta-11-sci-s4",
        "name": "உயிரியல் / கணினி அறிவியல்",
        "completed": 0,
        "total": 50,
        "icon": "🧬",
        "color": "#ec4899",
        "currentChapter": "அலgu 1: உயிரினங்களின் இனப்பெருக்கம் / Python C++"
      }
    ],
    "tasks": [
      {
        "title": "கணிதம்: கணங்கள், தொடர்புகள் & சார்புகள்",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "கணங்கள், தொடர்புகள் & சார்புகள்",
        "rawSubject": "கணிதம்",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "இயற்பியல்: திசையன் கூட்டல், புள்ளி/குறுக்குப் பெருக்கல்",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "திசையன் கூட்டல், புள்ளி/குறுக்குப் பெருக்கல்",
        "rawSubject": "இயற்பியல்",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "வேதியியல்: மோல் கருத்து & ஸ்டாய்க்கியோமெட்ரி",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "மோல் கருத்து & ஸ்டாய்க்கியோமெட்ரி",
        "rawSubject": "வேதியியல்",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "மாதிரி 5-மதிப்பெண் வினா படிப்படியான தீர்வு",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "மாதிரி 5-மதிப்பெண் வினா படிப்படியான தீர்வு",
        "rawSubject": "Hands-On & Recap",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "+1 அறிவியல் தமிழ் சாதனையாளர் விருது",
    "milestoneDesc": "அனைத்துப் பாடங்களிலும் முழு மதிப்பெண் பெறும் தினசரி பயிற்சி.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "tnsb-ta-11-com",
    "category": "school_tnsb_ta",
    "gradeLevel": "hsc",
    "title": "11-ஆம் வகுப்பு — +1 மேல்நிலை வணிகவியல் (தமிழ் வழி)",
    "subtitle": "200-நாள் தமிழ் வழி அரசுப் பாடத்திட்டப் பயிற்சி",
    "short": "11-ஆம் வகுப்பு • தமிழ் வழி",
    "medium": "Tamil",
    "board": "TNSB",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "+1 வணிகவியல் தமிழ்",
    "badgeColor": "#10b981",
    "phaseTitle": "பகுதி 1: அரசுப் பாடநூல் அடிப்படை மற்றும் முக்கிய வினா விடைகள்",
    "phaseSub": "நாள் 1 / 200 • தினசரி அட்டவணை & சூத்திரங்கள்",
    "subjects": [
      {
        "id": "tnsb-ta-11-com-s1",
        "name": "கணக்குப் பதிவியல் (Accountancy)",
        "completed": 1,
        "total": 50,
        "icon": "📊",
        "color": "#06b6d4",
        "currentChapter": "அலகு 1: கூட்டாண்மை கணக்குகள் & நிதிநிலை"
      },
      {
        "id": "tnsb-ta-11-com-s2",
        "name": "வணிகவியல் (Commerce & Business)",
        "completed": 1,
        "total": 50,
        "icon": "💼",
        "color": "#10b981",
        "currentChapter": "அலகு 1: மேலாண்மை தத்துவங்கள்"
      },
      {
        "id": "tnsb-ta-11-com-s3",
        "name": "பொருளியல் (Economics & Statistics)",
        "completed": 0,
        "total": 50,
        "icon": "📈",
        "color": "#f59e0b",
        "currentChapter": "அலகு 1: பேரியல் பொருளியல்"
      },
      {
        "id": "tnsb-ta-11-com-s4",
        "name": "வணிகக் கணிதம் / கணினி பயன்பாடுகள்",
        "completed": 0,
        "total": 50,
        "icon": "💻",
        "color": "#ec4899",
        "currentChapter": "அலகு 1: அணிகள் & வணிக பயன்பாடுகள்"
      }
    ],
    "tasks": [
      {
        "title": "கணக்குப் பதிவியல்: கணக்கியலின் பொன்விதிகள்",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "கணக்கியலின் பொன்விதிகள்",
        "rawSubject": "கணக்குப் பதிவியல்",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "வணிகவியல்: பொருளாதார மற்றும் சார்பற்ற நடவடிக்கைகள்",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "பொருளாதார மற்றும் சார்பற்ற நடவடிக்கைகள்",
        "rawSubject": "வணிகவியல்",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "பொருளியல்: ஆடம் ஸ்மித் vs ராபின்ஸ் இலக்கணம்",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "ஆடம் ஸ்மித் vs ராபின்ஸ் இலக்கணம்",
        "rawSubject": "பொருளியல்",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "மாதிரிக் கணக்கு: குறிப்பேட்டுப் பதிவுகள்",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "குறிப்பேட்டுப் பதிவுகள்",
        "rawSubject": "மாதிரிக் கணக்கு",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "+1 வணிகவியல் தமிழ் சாதனையாளர் விருது",
    "milestoneDesc": "அனைத்துப் பாடங்களிலும் முழு மதிப்பெண் பெறும் தினசரி பயிற்சி.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "tnsb-ta-12-sci",
    "category": "school_tnsb_ta",
    "gradeLevel": "hsc",
    "title": "12-ஆம் வகுப்பு — +2 பொதுத்தேர்வு அறிவியல் 600/600 (தமிழ் வழி)",
    "subtitle": "200-நாள் தமிழ் வழி அரசுப் பாடத்திட்டப் பயிற்சி",
    "short": "12-ஆம் வகுப்பு • தமிழ் வழி",
    "medium": "Tamil",
    "board": "TNSB",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "+2 செண்டம் 600/600",
    "badgeColor": "#ec4899",
    "phaseTitle": "பகுதி 1: அரசுப் பாடநூல் அடிப்படை மற்றும் முக்கிய வினா விடைகள்",
    "phaseSub": "நாள் 1 / 200 • தினசரி அட்டவணை & சூத்திரங்கள்",
    "subjects": [
      {
        "id": "tnsb-ta-12-sci-s1",
        "name": "இயற்பியல் (Physics 100/100)",
        "completed": 1,
        "total": 50,
        "icon": "⚡",
        "color": "#06b6d4",
        "currentChapter": "அலகு 1: நிலைமின்னியல் & மின்னோட்டவியல்"
      },
      {
        "id": "tnsb-ta-12-sci-s2",
        "name": "வேதியியல் (Chemistry 100/100)",
        "completed": 1,
        "total": 50,
        "icon": "🧪",
        "color": "#10b981",
        "currentChapter": "அலகு 1: உலோகவியல் & திண்ம நிலை"
      },
      {
        "id": "tnsb-ta-12-sci-s3",
        "name": "கணிதம் (Mathematics 100/100)",
        "completed": 0,
        "total": 50,
        "icon": "📐",
        "color": "#f59e0b",
        "currentChapter": "அலகு 1: அணிகள் & வகை நுண்கணிதம்"
      },
      {
        "id": "tnsb-ta-12-sci-s4",
        "name": "உயிரியல் / கணினி அறிவியல்",
        "completed": 0,
        "total": 50,
        "icon": "🧬",
        "color": "#ec4899",
        "currentChapter": "அலgu 1: உயிரினங்களின் இனப்பெருக்கம் / Python C++"
      }
    ],
    "tasks": [
      {
        "title": "கணிதம்: காஸ்-ஜோர்டான் முறையில் நேர்மாறு அணி (5-மதிப்பெண்)",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "காஸ்-ஜோர்டான் முறையில் நேர்மாறு அணி (5-மதிப்பெண்)",
        "rawSubject": "கணிதம்",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "இயற்பியல்: மின் இருமுனை அச்சுக்கோட்டு மின்புலம்",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "மின் இருமுனை அச்சுக்கோட்டு மின்புலம்",
        "rawSubject": "இயற்பியல்",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "வேதியியல்: நுரை மிதப்பு முறை & சயனைடு கழுவுதல்",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "நுரை மிதப்பு முறை & சயனைடு கழுவுதல்",
        "rawSubject": "வேதியியல்",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "+2 செண்டம் பயிற்சி: 15 ஒரு மதிப்பெண் வினாக்கள்",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "15 ஒரு மதிப்பெண் வினாக்கள்",
        "rawSubject": "+2 செண்டம் பயிற்சி",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "+2 செண்டம் 600/600 சாதனையாளர் விருது",
    "milestoneDesc": "அனைத்துப் பாடங்களிலும் முழு மதிப்பெண் பெறும் தினசரி பயிற்சி.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "tnsb-ta-12-com",
    "category": "school_tnsb_ta",
    "gradeLevel": "hsc",
    "title": "12-ஆம் வகுப்பு — +2 பொதுத்தேர்வு வணிகவியல் (தமிழ் வழி)",
    "subtitle": "200-நாள் தமிழ் வழி அரசுப் பாடத்திட்டப் பயிற்சி",
    "short": "12-ஆம் வகுப்பு • தமிழ் வழி",
    "medium": "Tamil",
    "board": "TNSB",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "+2 வணிகவியல் செண்டம்",
    "badgeColor": "#f59e0b",
    "phaseTitle": "பகுதி 1: அரசுப் பாடநூல் அடிப்படை மற்றும் முக்கிய வினா விடைகள்",
    "phaseSub": "நாள் 1 / 200 • தினசரி அட்டவணை & சூத்திரங்கள்",
    "subjects": [
      {
        "id": "tnsb-ta-12-com-s1",
        "name": "கணக்குப் பதிவியல் (Accountancy)",
        "completed": 1,
        "total": 50,
        "icon": "📊",
        "color": "#06b6d4",
        "currentChapter": "அலகு 1: கூட்டாண்மை கணக்குகள் & நிதிநிலை"
      },
      {
        "id": "tnsb-ta-12-com-s2",
        "name": "வணிகவியல் (Commerce & Business)",
        "completed": 1,
        "total": 50,
        "icon": "💼",
        "color": "#10b981",
        "currentChapter": "அலகு 1: மேலாண்மை தத்துவங்கள்"
      },
      {
        "id": "tnsb-ta-12-com-s3",
        "name": "பொருளியல் (Economics & Statistics)",
        "completed": 0,
        "total": 50,
        "icon": "📈",
        "color": "#f59e0b",
        "currentChapter": "அலகு 1: பேரியல் பொருளியல்"
      },
      {
        "id": "tnsb-ta-12-com-s4",
        "name": "வணிகக் கணிதம் / கணினி பயன்பாடுகள்",
        "completed": 0,
        "total": 50,
        "icon": "💻",
        "color": "#ec4899",
        "currentChapter": "அலகு 1: அணிகள் & வணிக பயன்பாடுகள்"
      }
    ],
    "tasks": [
      {
        "title": "கணக்குப் பதிவியல்: நிலை அறிக்கை முறை நிகர இலாபம்",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "நிலை அறிக்கை முறை நிகர இலாபம்",
        "rawSubject": "கணக்குப் பதிவியல்",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "வணிகவியல்: ஹென்றி ஃபாயலின் 14 மேலாண்மைக் கோட்பாடுகள்",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "ஹென்றி ஃபாயலின் 14 மேலாண்மைக் கோட்பாடுகள்",
        "rawSubject": "வணிகவியல்",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "பொருளியல்: வருவாயின் வட்ட ஓட்டம் (2, 3, 4 துறை மாதிரி)",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "வருவாயின் வட்ட ஓட்டம் (2, 3, 4 துறை மாதிரி)",
        "rawSubject": "பொருளியல்",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "மாதிரிக் கணக்கு: 5-மதிப்பெண் நிலை அறிக்கை",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "5-மதிப்பெண் நிலை அறிக்கை",
        "rawSubject": "மாதிரிக் கணக்கு",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "+2 வணிகவியல் செண்டம் சாதனையாளர் விருது",
    "milestoneDesc": "அனைத்துப் பாடங்களிலும் முழு மதிப்பெண் பெறும் தினசரி பயிற்சி.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "cbse-lkg",
    "category": "school_cbse",
    "gradeLevel": "primary",
    "title": "CBSE LKG — Early Years Foundation (NCERT)",
    "subtitle": "200-Day NCERT Curriculum & Board Blueprint",
    "short": "CBSE LKG • CBSE",
    "medium": "English",
    "board": "CBSE",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "CBSE Pre-Primary",
    "badgeColor": "#ec4899",
    "phaseTitle": "Phase 1: NCERT Concepts, Formulas & Exemplar Problems",
    "phaseSub": "Day 1 of 200 • Key Definitions & Daily Drill",
    "subjects": [
      {
        "id": "cbse-lkg-s1",
        "name": "English Phonics, Alphabets & Rhymes",
        "completed": 1,
        "total": 30,
        "icon": "🔤",
        "color": "#ec4899",
        "currentChapter": "Unit 1: Phonics A-Z & Sight Words"
      },
      {
        "id": "cbse-lkg-s2",
        "name": "Number Magic, Counting & Shapes",
        "completed": 1,
        "total": 30,
        "icon": "🔢",
        "color": "#06b6d4",
        "currentChapter": "Unit 1: Numbers 1 to 20 & Shapes"
      },
      {
        "id": "cbse-lkg-s3",
        "name": "General Awareness, Body & Nature (EVS)",
        "completed": 0,
        "total": 30,
        "icon": "🌿",
        "color": "#10b981",
        "currentChapter": "Unit 1: My Body & Five Senses"
      },
      {
        "id": "cbse-lkg-s4",
        "name": "Creative Drawing, Motor Skills & Stories",
        "completed": 0,
        "total": 30,
        "icon": "🎨",
        "color": "#f59e0b",
        "currentChapter": "Unit 1: Colors & Pattern Tracing"
      }
    ],
    "tasks": [
      {
        "title": "Phonics Fun: Letter A Sound, Tracing & Object Match",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Letter A Sound, Tracing & Object Match",
        "rawSubject": "Phonics Fun",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Math Magic: Counting 1 to 3 with Animal Cutouts",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Counting 1 to 3 with Animal Cutouts",
        "rawSubject": "Math Magic",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "EVS: Five Senses - Seeing, Hearing, Tasting",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "Five Senses - Seeing, Hearing, Tasting",
        "rawSubject": "EVS",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Bedtime Story: The Clever Fox and Crow",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "The Clever Fox and Crow",
        "rawSubject": "Bedtime Story",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "CBSE Pre-Primary Topper Award",
    "milestoneDesc": "NCERT line-by-line mastery and CBSE board question banks.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "cbse-ukg",
    "category": "school_cbse",
    "gradeLevel": "primary",
    "title": "CBSE UKG — Senior Kindergarten Foundation (NCERT)",
    "subtitle": "200-Day NCERT Curriculum & Board Blueprint",
    "short": "CBSE UKG • CBSE",
    "medium": "English",
    "board": "CBSE",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "CBSE Prep",
    "badgeColor": "#8b5cf6",
    "phaseTitle": "Phase 1: NCERT Concepts, Formulas & Exemplar Problems",
    "phaseSub": "Day 1 of 200 • Key Definitions & Daily Drill",
    "subjects": [
      {
        "id": "cbse-ukg-s1",
        "name": "English Phonics, Alphabets & Rhymes",
        "completed": 1,
        "total": 30,
        "icon": "🔤",
        "color": "#ec4899",
        "currentChapter": "Unit 1: Phonics A-Z & Sight Words"
      },
      {
        "id": "cbse-ukg-s2",
        "name": "Number Magic, Counting & Shapes",
        "completed": 1,
        "total": 30,
        "icon": "🔢",
        "color": "#06b6d4",
        "currentChapter": "Unit 1: Numbers 1 to 20 & Shapes"
      },
      {
        "id": "cbse-ukg-s3",
        "name": "General Awareness, Body & Nature (EVS)",
        "completed": 0,
        "total": 30,
        "icon": "🌿",
        "color": "#10b981",
        "currentChapter": "Unit 1: My Body & Five Senses"
      },
      {
        "id": "cbse-ukg-s4",
        "name": "Creative Drawing, Motor Skills & Stories",
        "completed": 0,
        "total": 30,
        "icon": "🎨",
        "color": "#f59e0b",
        "currentChapter": "Unit 1: Colors & Pattern Tracing"
      }
    ],
    "tasks": [
      {
        "title": "English Phonics: 3-Letter CVC -at Word Family",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "3-Letter CVC -at Word Family",
        "rawSubject": "English Phonics",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Math: Picture Addition (2 apples + 3 apples)",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Picture Addition (2 apples + 3 apples)",
        "rawSubject": "Math",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "Science: How Seeds Germinate with Sunlight",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "How Seeds Germinate with Sunlight",
        "rawSubject": "Science",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Daily Story: The Lion and the Mouse",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "The Lion and the Mouse",
        "rawSubject": "Daily Story",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "CBSE Prep Topper Award",
    "milestoneDesc": "NCERT line-by-line mastery and CBSE board question banks.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "cbse-1",
    "category": "school_cbse",
    "gradeLevel": "primary",
    "title": "Class 1 — CBSE NCERT Curriculum",
    "subtitle": "200-Day NCERT Curriculum & Board Blueprint",
    "short": "Class 1 • CBSE",
    "medium": "English",
    "board": "CBSE",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "CBSE Class 1",
    "badgeColor": "#06b6d4",
    "phaseTitle": "Phase 1: NCERT Concepts, Formulas & Exemplar Problems",
    "phaseSub": "Day 1 of 200 • Key Definitions & Daily Drill",
    "subjects": [
      {
        "id": "cbse-1-s1",
        "name": "Mathematics (Number Magic & Geometry)",
        "completed": 1,
        "total": 40,
        "icon": "🔢",
        "color": "#06b6d4",
        "currentChapter": "Unit 1: Shapes, Space & Numbers"
      },
      {
        "id": "cbse-1-s2",
        "name": "Environmental Studies (EVS & Science)",
        "completed": 1,
        "total": 40,
        "icon": "🌿",
        "color": "#10b981",
        "currentChapter": "Unit 1: Plants, Animals & Family"
      },
      {
        "id": "cbse-1-s3",
        "name": "English Language & Reading Literacy",
        "completed": 0,
        "total": 40,
        "icon": "📖",
        "color": "#ec4899",
        "currentChapter": "Unit 1: Prose, Poetry & Phonics"
      },
      {
        "id": "cbse-1-s4",
        "name": "Tamil / Second Language & General Knowledge",
        "completed": 0,
        "total": 40,
        "icon": "✍️",
        "color": "#f59e0b",
        "currentChapter": "Unit 1: Language Basics & Values"
      }
    ],
    "tasks": [
      {
        "title": "Mathematics: Spatial Relationships - Inside/Outside, Top/Bottom",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Spatial Relationships - Inside/Outside, Top/Bottom",
        "rawSubject": "Mathematics",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "English: Action Poem Recitation & Sight Words",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Action Poem Recitation & Sight Words",
        "rawSubject": "English",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "EVS: My Body Parts and Personal Cleanliness",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "My Body Parts and Personal Cleanliness",
        "rawSubject": "EVS",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Bedtime Revision: 5-Question Oral Recall",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "5-Question Oral Recall",
        "rawSubject": "Bedtime Revision",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "CBSE Class 1 Topper Award",
    "milestoneDesc": "NCERT line-by-line mastery and CBSE board question banks.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "cbse-2",
    "category": "school_cbse",
    "gradeLevel": "primary",
    "title": "Class 2 — CBSE NCERT Curriculum",
    "subtitle": "200-Day NCERT Curriculum & Board Blueprint",
    "short": "Class 2 • CBSE",
    "medium": "English",
    "board": "CBSE",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "CBSE Class 2",
    "badgeColor": "#06b6d4",
    "phaseTitle": "Phase 1: NCERT Concepts, Formulas & Exemplar Problems",
    "phaseSub": "Day 1 of 200 • Key Definitions & Daily Drill",
    "subjects": [
      {
        "id": "cbse-2-s1",
        "name": "Mathematics (Number Magic & Geometry)",
        "completed": 1,
        "total": 40,
        "icon": "🔢",
        "color": "#06b6d4",
        "currentChapter": "Unit 1: Shapes, Space & Numbers"
      },
      {
        "id": "cbse-2-s2",
        "name": "Environmental Studies (EVS & Science)",
        "completed": 1,
        "total": 40,
        "icon": "🌿",
        "color": "#10b981",
        "currentChapter": "Unit 1: Plants, Animals & Family"
      },
      {
        "id": "cbse-2-s3",
        "name": "English Language & Reading Literacy",
        "completed": 0,
        "total": 40,
        "icon": "📖",
        "color": "#ec4899",
        "currentChapter": "Unit 1: Prose, Poetry & Phonics"
      },
      {
        "id": "cbse-2-s4",
        "name": "Tamil / Second Language & General Knowledge",
        "completed": 0,
        "total": 40,
        "icon": "✍️",
        "color": "#f59e0b",
        "currentChapter": "Unit 1: Language Basics & Values"
      }
    ],
    "tasks": [
      {
        "title": "Mathematics: Rolling and Sliding Objects & Shapes",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Rolling and Sliding Objects & Shapes",
        "rawSubject": "Mathematics",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "English: Nouns and Sentence Construction",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Nouns and Sentence Construction",
        "rawSubject": "English",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "EVS: Types of Plants - Herbs, Shrubs, Trees",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "Types of Plants - Herbs, Shrubs, Trees",
        "rawSubject": "EVS",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Daily 5-Question Activity Quiz",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "Daily 5-Question Activity Quiz",
        "rawSubject": "Hands-On & Recap",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "CBSE Class 2 Topper Award",
    "milestoneDesc": "NCERT line-by-line mastery and CBSE board question banks.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "cbse-3",
    "category": "school_cbse",
    "gradeLevel": "primary",
    "title": "Class 3 — CBSE NCERT Curriculum",
    "subtitle": "200-Day NCERT Curriculum & Board Blueprint",
    "short": "Class 3 • CBSE",
    "medium": "English",
    "board": "CBSE",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "CBSE Class 3",
    "badgeColor": "#06b6d4",
    "phaseTitle": "Phase 1: NCERT Concepts, Formulas & Exemplar Problems",
    "phaseSub": "Day 1 of 200 • Key Definitions & Daily Drill",
    "subjects": [
      {
        "id": "cbse-3-s1",
        "name": "Mathematics (Number Magic & Geometry)",
        "completed": 1,
        "total": 40,
        "icon": "🔢",
        "color": "#06b6d4",
        "currentChapter": "Unit 1: Shapes, Space & Numbers"
      },
      {
        "id": "cbse-3-s2",
        "name": "Environmental Studies (EVS & Science)",
        "completed": 1,
        "total": 40,
        "icon": "🌿",
        "color": "#10b981",
        "currentChapter": "Unit 1: Plants, Animals & Family"
      },
      {
        "id": "cbse-3-s3",
        "name": "English Language & Reading Literacy",
        "completed": 0,
        "total": 40,
        "icon": "📖",
        "color": "#ec4899",
        "currentChapter": "Unit 1: Prose, Poetry & Phonics"
      },
      {
        "id": "cbse-3-s4",
        "name": "Tamil / Second Language & General Knowledge",
        "completed": 0,
        "total": 40,
        "icon": "✍️",
        "color": "#f59e0b",
        "currentChapter": "Unit 1: Language Basics & Values"
      }
    ],
    "tasks": [
      {
        "title": "Mathematics: Symmetrical Shapes & 3-Digit Place Value",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Symmetrical Shapes & 3-Digit Place Value",
        "rawSubject": "Mathematics",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "EVS: Animal Classification by Movement (Fly, Crawl)",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Animal Classification by Movement (Fly, Crawl)",
        "rawSubject": "EVS",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "English: Adjectives and Comprehension Reading",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "Adjectives and Comprehension Reading",
        "rawSubject": "English",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Creative Task: Draw Leaves with Margin Patterns",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "Draw Leaves with Margin Patterns",
        "rawSubject": "Creative Task",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "CBSE Class 3 Topper Award",
    "milestoneDesc": "NCERT line-by-line mastery and CBSE board question banks.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "cbse-4",
    "category": "school_cbse",
    "gradeLevel": "primary",
    "title": "Class 4 — CBSE NCERT Curriculum",
    "subtitle": "200-Day NCERT Curriculum & Board Blueprint",
    "short": "Class 4 • CBSE",
    "medium": "English",
    "board": "CBSE",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "CBSE Class 4",
    "badgeColor": "#06b6d4",
    "phaseTitle": "Phase 1: NCERT Concepts, Formulas & Exemplar Problems",
    "phaseSub": "Day 1 of 200 • Key Definitions & Daily Drill",
    "subjects": [
      {
        "id": "cbse-4-s1",
        "name": "Mathematics (Number Magic & Geometry)",
        "completed": 1,
        "total": 40,
        "icon": "🔢",
        "color": "#06b6d4",
        "currentChapter": "Unit 1: Shapes, Space & Numbers"
      },
      {
        "id": "cbse-4-s2",
        "name": "Environmental Studies (EVS & Science)",
        "completed": 1,
        "total": 40,
        "icon": "🌿",
        "color": "#10b981",
        "currentChapter": "Unit 1: Plants, Animals & Family"
      },
      {
        "id": "cbse-4-s3",
        "name": "English Language & Reading Literacy",
        "completed": 0,
        "total": 40,
        "icon": "📖",
        "color": "#ec4899",
        "currentChapter": "Unit 1: Prose, Poetry & Phonics"
      },
      {
        "id": "cbse-4-s4",
        "name": "Tamil / Second Language & General Knowledge",
        "completed": 0,
        "total": 40,
        "icon": "✍️",
        "color": "#f59e0b",
        "currentChapter": "Unit 1: Language Basics & Values"
      }
    ],
    "tasks": [
      {
        "title": "Mathematics: Floor Patterns, Brick Faces & Arches",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Floor Patterns, Brick Faces & Arches",
        "rawSubject": "Mathematics",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "EVS: How Children Reach School Across India",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "How Children Reach School Across India",
        "rawSubject": "EVS",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "English: Descriptive Writing & Simple Past Tense",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "Descriptive Writing & Simple Past Tense",
        "rawSubject": "English",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Daily 5-Question Concept Test",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "Daily 5-Question Concept Test",
        "rawSubject": "Hands-On & Recap",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "CBSE Class 4 Topper Award",
    "milestoneDesc": "NCERT line-by-line mastery and CBSE board question banks.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "cbse-5",
    "category": "school_cbse",
    "gradeLevel": "primary",
    "title": "Class 5 — CBSE NCERT Curriculum",
    "subtitle": "200-Day NCERT Curriculum & Board Blueprint",
    "short": "Class 5 • CBSE",
    "medium": "English",
    "board": "CBSE",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "CBSE Class 5",
    "badgeColor": "#06b6d4",
    "phaseTitle": "Phase 1: NCERT Concepts, Formulas & Exemplar Problems",
    "phaseSub": "Day 1 of 200 • Key Definitions & Daily Drill",
    "subjects": [
      {
        "id": "cbse-5-s1",
        "name": "Mathematics (Number Magic & Geometry)",
        "completed": 1,
        "total": 40,
        "icon": "🔢",
        "color": "#06b6d4",
        "currentChapter": "Unit 1: Shapes, Space & Numbers"
      },
      {
        "id": "cbse-5-s2",
        "name": "Environmental Studies (EVS & Science)",
        "completed": 1,
        "total": 40,
        "icon": "🌿",
        "color": "#10b981",
        "currentChapter": "Unit 1: Plants, Animals & Family"
      },
      {
        "id": "cbse-5-s3",
        "name": "English Language & Reading Literacy",
        "completed": 0,
        "total": 40,
        "icon": "📖",
        "color": "#ec4899",
        "currentChapter": "Unit 1: Prose, Poetry & Phonics"
      },
      {
        "id": "cbse-5-s4",
        "name": "Tamil / Second Language & General Knowledge",
        "completed": 0,
        "total": 40,
        "icon": "✍️",
        "color": "#f59e0b",
        "currentChapter": "Unit 1: Language Basics & Values"
      }
    ],
    "tasks": [
      {
        "title": "Mathematics: Boat Speeds, Fish Weights & Profit/Loss",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Boat Speeds, Fish Weights & Profit/Loss",
        "rawSubject": "Mathematics",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "EVS: Amazing Animal Senses - Ants Smelling Trail",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Amazing Animal Senses - Ants Smelling Trail",
        "rawSubject": "EVS",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "English: Vocabulary Building & Wonderful Waste",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "Vocabulary Building & Wonderful Waste",
        "rawSubject": "English",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Daily 5-Question Rapid Fire Quiz",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "Daily 5-Question Rapid Fire Quiz",
        "rawSubject": "Hands-On & Recap",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "CBSE Class 5 Topper Award",
    "milestoneDesc": "NCERT line-by-line mastery and CBSE board question banks.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "cbse-6",
    "category": "school_cbse",
    "gradeLevel": "middle",
    "title": "Class 6 — CBSE NCERT Curriculum",
    "subtitle": "200-Day NCERT Curriculum & Board Blueprint",
    "short": "Class 6 • CBSE",
    "medium": "English",
    "board": "CBSE",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "CBSE Class 6",
    "badgeColor": "#3b82f6",
    "phaseTitle": "Phase 1: NCERT Concepts, Formulas & Exemplar Problems",
    "phaseSub": "Day 1 of 200 • Key Definitions & Daily Drill",
    "subjects": [
      {
        "id": "cbse-6-s1",
        "name": "Mathematics (Algebra, Geometry & Arithmetic)",
        "completed": 1,
        "total": 45,
        "icon": "📐",
        "color": "#06b6d4",
        "currentChapter": "Unit 1: Number Systems & Algebra"
      },
      {
        "id": "cbse-6-s2",
        "name": "Science (Physics, Chemistry & Biology)",
        "completed": 1,
        "total": 45,
        "icon": "🔬",
        "color": "#10b981",
        "currentChapter": "Unit 1: Measurement & Living World"
      },
      {
        "id": "cbse-6-s3",
        "name": "Social Science (History, Civics & Geography)",
        "completed": 0,
        "total": 45,
        "icon": "🌍",
        "color": "#f59e0b",
        "currentChapter": "Unit 1: Ancient Civilization & Maps"
      },
      {
        "id": "cbse-6-s4",
        "name": "English Literature, Grammar & Composition",
        "completed": 0,
        "total": 45,
        "icon": "📚",
        "color": "#ec4899",
        "currentChapter": "Unit 1: Prose, Grammar & Tenses"
      }
    ],
    "tasks": [
      {
        "title": "Mathematics: Place Value, Estimation & Roman Numerals",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Place Value, Estimation & Roman Numerals",
        "rawSubject": "Mathematics",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Science: Food Nutrient Testing (Iodine & CuSO4)",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Food Nutrient Testing (Iodine & CuSO4)",
        "rawSubject": "Science",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "Social Science: Archaeological Findings at Mehrgarh",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "Archaeological Findings at Mehrgarh",
        "rawSubject": "Social Science",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Daily 5-Question Diagnostic Practice Quiz",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "Daily 5-Question Diagnostic Practice Quiz",
        "rawSubject": "Hands-On & Recap",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "CBSE Class 6 Topper Award",
    "milestoneDesc": "NCERT line-by-line mastery and CBSE board question banks.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "cbse-7",
    "category": "school_cbse",
    "gradeLevel": "middle",
    "title": "Class 7 — CBSE NCERT Curriculum",
    "subtitle": "200-Day NCERT Curriculum & Board Blueprint",
    "short": "Class 7 • CBSE",
    "medium": "English",
    "board": "CBSE",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "CBSE Class 7",
    "badgeColor": "#3b82f6",
    "phaseTitle": "Phase 1: NCERT Concepts, Formulas & Exemplar Problems",
    "phaseSub": "Day 1 of 200 • Key Definitions & Daily Drill",
    "subjects": [
      {
        "id": "cbse-7-s1",
        "name": "Mathematics (Algebra, Geometry & Arithmetic)",
        "completed": 1,
        "total": 45,
        "icon": "📐",
        "color": "#06b6d4",
        "currentChapter": "Unit 1: Number Systems & Algebra"
      },
      {
        "id": "cbse-7-s2",
        "name": "Science (Physics, Chemistry & Biology)",
        "completed": 1,
        "total": 45,
        "icon": "🔬",
        "color": "#10b981",
        "currentChapter": "Unit 1: Measurement & Living World"
      },
      {
        "id": "cbse-7-s3",
        "name": "Social Science (History, Civics & Geography)",
        "completed": 0,
        "total": 45,
        "icon": "🌍",
        "color": "#f59e0b",
        "currentChapter": "Unit 1: Ancient Civilization & Maps"
      },
      {
        "id": "cbse-7-s4",
        "name": "English Literature, Grammar & Composition",
        "completed": 0,
        "total": 45,
        "icon": "📚",
        "color": "#ec4899",
        "currentChapter": "Unit 1: Prose, Grammar & Tenses"
      }
    ],
    "tasks": [
      {
        "title": "Mathematics: Closure & Distributive Laws on Integers",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Closure & Distributive Laws on Integers",
        "rawSubject": "Mathematics",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Science: Photosynthesis Equation & Stomata Action",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Photosynthesis Equation & Stomata Action",
        "rawSubject": "Science",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "Social Science: Cartography Evolution & Medieval Maps",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "Cartography Evolution & Medieval Maps",
        "rawSubject": "Social Science",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Daily 5-Question Diagnostic Practice Quiz",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "Daily 5-Question Diagnostic Practice Quiz",
        "rawSubject": "Hands-On & Recap",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "CBSE Class 7 Topper Award",
    "milestoneDesc": "NCERT line-by-line mastery and CBSE board question banks.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "cbse-8",
    "category": "school_cbse",
    "gradeLevel": "middle",
    "title": "Class 8 — CBSE NCERT Curriculum",
    "subtitle": "200-Day NCERT Curriculum & Board Blueprint",
    "short": "Class 8 • CBSE",
    "medium": "English",
    "board": "CBSE",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "CBSE Class 8",
    "badgeColor": "#3b82f6",
    "phaseTitle": "Phase 1: NCERT Concepts, Formulas & Exemplar Problems",
    "phaseSub": "Day 1 of 200 • Key Definitions & Daily Drill",
    "subjects": [
      {
        "id": "cbse-8-s1",
        "name": "Mathematics (Algebra, Geometry & Arithmetic)",
        "completed": 1,
        "total": 45,
        "icon": "📐",
        "color": "#06b6d4",
        "currentChapter": "Unit 1: Number Systems & Algebra"
      },
      {
        "id": "cbse-8-s2",
        "name": "Science (Physics, Chemistry & Biology)",
        "completed": 1,
        "total": 45,
        "icon": "🔬",
        "color": "#10b981",
        "currentChapter": "Unit 1: Measurement & Living World"
      },
      {
        "id": "cbse-8-s3",
        "name": "Social Science (History, Civics & Geography)",
        "completed": 0,
        "total": 45,
        "icon": "🌍",
        "color": "#f59e0b",
        "currentChapter": "Unit 1: Ancient Civilization & Maps"
      },
      {
        "id": "cbse-8-s4",
        "name": "English Literature, Grammar & Composition",
        "completed": 0,
        "total": 45,
        "icon": "📚",
        "color": "#ec4899",
        "currentChapter": "Unit 1: Prose, Grammar & Tenses"
      }
    ],
    "tasks": [
      {
        "title": "Mathematics: Additive & Multiplicative Inverses of Rationals",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Additive & Multiplicative Inverses of Rationals",
        "rawSubject": "Mathematics",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Science: Crop Production - Soil Prep, Sowing & Manure",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Crop Production - Soil Prep, Sowing & Manure",
        "rawSubject": "Science",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "Social Science: Key Features of Indian Constitution",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "Key Features of Indian Constitution",
        "rawSubject": "Social Science",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Daily 5-Question Diagnostic Practice Quiz",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "Daily 5-Question Diagnostic Practice Quiz",
        "rawSubject": "Hands-On & Recap",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "CBSE Class 8 Topper Award",
    "milestoneDesc": "NCERT line-by-line mastery and CBSE board question banks.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "cbse-9",
    "category": "school_cbse",
    "gradeLevel": "high",
    "title": "Class 9 — CBSE NCERT Curriculum",
    "subtitle": "200-Day NCERT Curriculum & Board Blueprint",
    "short": "Class 9 • CBSE",
    "medium": "English",
    "board": "CBSE",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "CBSE 9th Pre-Board",
    "badgeColor": "#6366f1",
    "phaseTitle": "Phase 1: NCERT Concepts, Formulas & Exemplar Problems",
    "phaseSub": "Day 1 of 200 • Key Definitions & Daily Drill",
    "subjects": [
      {
        "id": "cbse-9-s1",
        "name": "Mathematics (Real Numbers, Algebra & Geometry)",
        "completed": 1,
        "total": 50,
        "icon": "📐",
        "color": "#06b6d4",
        "currentChapter": "Chapter 1: Relations, Functions & Real Numbers"
      },
      {
        "id": "cbse-9-s2",
        "name": "Science (Physics, Chemistry & Biology)",
        "completed": 1,
        "total": 50,
        "icon": "🔬",
        "color": "#10b981",
        "currentChapter": "Chapter 1: Laws of Motion, Reactions & Life Processes"
      },
      {
        "id": "cbse-9-s3",
        "name": "Social Science (History, Geography & Economics)",
        "completed": 0,
        "total": 50,
        "icon": "🌍",
        "color": "#f59e0b",
        "currentChapter": "Chapter 1: Contemporary World & Resource Economics"
      },
      {
        "id": "cbse-9-s4",
        "name": "English Language & Literary Analysis",
        "completed": 0,
        "total": 50,
        "icon": "📚",
        "color": "#ec4899",
        "currentChapter": "Unit 1: Prose, Poetic Devices & Applied Grammar"
      }
    ],
    "tasks": [
      {
        "title": "Mathematics: Representing √2, √3, √5 on Number Line",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Representing √2, √3, √5 on Number Line",
        "rawSubject": "Mathematics",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Science: Evaporation Factors & Latent Heat of Fusion",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Evaporation Factors & Latent Heat of Fusion",
        "rawSubject": "Science",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "Social Science: French Revolution & Estates General",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "French Revolution & Estates General",
        "rawSubject": "Social Science",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Daily 5-Question Board Foundation Quiz",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "Daily 5-Question Board Foundation Quiz",
        "rawSubject": "Hands-On & Recap",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "CBSE 9th Pre-Board Topper Award",
    "milestoneDesc": "NCERT line-by-line mastery and CBSE board question banks.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "cbse-10",
    "category": "school_cbse",
    "gradeLevel": "high",
    "title": "Class 10 — CBSE Board Exam Mastery (NCERT)",
    "subtitle": "200-Day NCERT Curriculum & Board Blueprint",
    "short": "Class 10 • CBSE",
    "medium": "English",
    "board": "CBSE",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "CBSE 10th Centum",
    "badgeColor": "#ec4899",
    "phaseTitle": "Phase 1: NCERT Concepts, Formulas & Exemplar Problems",
    "phaseSub": "Day 1 of 200 • Key Definitions & Daily Drill",
    "subjects": [
      {
        "id": "cbse-10-s1",
        "name": "Mathematics (Real Numbers, Algebra & Geometry)",
        "completed": 1,
        "total": 50,
        "icon": "📐",
        "color": "#06b6d4",
        "currentChapter": "Chapter 1: Relations, Functions & Real Numbers"
      },
      {
        "id": "cbse-10-s2",
        "name": "Science (Physics, Chemistry & Biology)",
        "completed": 1,
        "total": 50,
        "icon": "🔬",
        "color": "#10b981",
        "currentChapter": "Chapter 1: Laws of Motion, Reactions & Life Processes"
      },
      {
        "id": "cbse-10-s3",
        "name": "Social Science (History, Geography & Economics)",
        "completed": 0,
        "total": 50,
        "icon": "🌍",
        "color": "#f59e0b",
        "currentChapter": "Chapter 1: Contemporary World & Resource Economics"
      },
      {
        "id": "cbse-10-s4",
        "name": "English Language & Literary Analysis",
        "completed": 0,
        "total": 50,
        "icon": "📚",
        "color": "#ec4899",
        "currentChapter": "Unit 1: Prose, Poetic Devices & Applied Grammar"
      }
    ],
    "tasks": [
      {
        "title": "Mathematics: Proof of Irrationality of √3 and √5 (5-Mark)",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Proof of Irrationality of √3 and √5 (5-Mark)",
        "rawSubject": "Mathematics",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Science: Balancing Chemical Equations & Redox Types",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Balancing Chemical Equations & Redox Types",
        "rawSubject": "Science",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "Social Science: Rise of Nationalism in Europe",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "Rise of Nationalism in Europe",
        "rawSubject": "Social Science",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "CBSE Board Drill: 10 High-Yield Assertion-Reason Qs",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "10 High-Yield Assertion-Reason Qs",
        "rawSubject": "CBSE Board Drill",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "CBSE 10th Centum Topper Award",
    "milestoneDesc": "NCERT line-by-line mastery and CBSE board question banks.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "cbse-11-sci",
    "category": "school_cbse",
    "gradeLevel": "hsc",
    "title": "Class 11 — CBSE Senior Secondary Science (NCERT)",
    "subtitle": "200-Day NCERT Curriculum & Board Blueprint",
    "short": "Class 11 • CBSE",
    "medium": "English",
    "board": "CBSE",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "CBSE +1 Science",
    "badgeColor": "#6366f1",
    "phaseTitle": "Phase 1: NCERT Concepts, Formulas & Exemplar Problems",
    "phaseSub": "Day 1 of 200 • Key Definitions & Daily Drill",
    "subjects": [
      {
        "id": "cbse-11-sci-s1",
        "name": "Physics (Mechanics, Optics & Electromagnetism)",
        "completed": 1,
        "total": 50,
        "icon": "⚡",
        "color": "#06b6d4",
        "currentChapter": "Unit 1: Electrostatics & Current Electricity"
      },
      {
        "id": "cbse-11-sci-s2",
        "name": "Chemistry (Physical, Organic & Inorganic)",
        "completed": 1,
        "total": 50,
        "icon": "🧪",
        "color": "#10b981",
        "currentChapter": "Unit 1: Metallurgy, Solid State & Solutions"
      },
      {
        "id": "cbse-11-sci-s3",
        "name": "Mathematics (Calculus, Vectors & Coordinate)",
        "completed": 0,
        "total": 50,
        "icon": "📐",
        "color": "#f59e0b",
        "currentChapter": "Unit 1: Matrices & Differential Calculus"
      },
      {
        "id": "cbse-11-sci-s4",
        "name": "Biology (Botany, Zoology) / Computer Science",
        "completed": 0,
        "total": 50,
        "icon": "🧬",
        "color": "#ec4899",
        "currentChapter": "Unit 1: Reproduction, Genetics / OOP Python C++"
      }
    ],
    "tasks": [
      {
        "title": "Mathematics: Power Sets, Cartesian Products & Domain",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Power Sets, Cartesian Products & Domain",
        "rawSubject": "Mathematics",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Physics: Dimensional Analysis & Error Propagation",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Dimensional Analysis & Error Propagation",
        "rawSubject": "Physics",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "Chemistry: Mole Concept & Empirical Formula",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "Mole Concept & Empirical Formula",
        "rawSubject": "Chemistry",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Daily 5-Mark Question: Step-by-Step Derivation",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "Step-by-Step Derivation",
        "rawSubject": "Daily 5-Mark Question",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "CBSE +1 Science Topper Award",
    "milestoneDesc": "NCERT line-by-line mastery and CBSE board question banks.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "cbse-11-com",
    "category": "school_cbse",
    "gradeLevel": "hsc",
    "title": "Class 11 — CBSE Senior Secondary Commerce (NCERT)",
    "subtitle": "200-Day NCERT Curriculum & Board Blueprint",
    "short": "Class 11 • CBSE",
    "medium": "English",
    "board": "CBSE",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "CBSE +1 Commerce",
    "badgeColor": "#10b981",
    "phaseTitle": "Phase 1: NCERT Concepts, Formulas & Exemplar Problems",
    "phaseSub": "Day 1 of 200 • Key Definitions & Daily Drill",
    "subjects": [
      {
        "id": "cbse-11-com-s1",
        "name": "Accountancy & Financial Statements",
        "completed": 1,
        "total": 50,
        "icon": "📊",
        "color": "#06b6d4",
        "currentChapter": "Unit 1: Partnership Accounting & Balance Sheets"
      },
      {
        "id": "cbse-11-com-s2",
        "name": "Commerce & Principles of Management",
        "completed": 1,
        "total": 50,
        "icon": "💼",
        "color": "#10b981",
        "currentChapter": "Unit 1: Management Functions & Corporate Finance"
      },
      {
        "id": "cbse-11-com-s3",
        "name": "Economics (Micro, Macro & Indian Economy)",
        "completed": 0,
        "total": 50,
        "icon": "📈",
        "color": "#f59e0b",
        "currentChapter": "Unit 1: Macroeconomics & National Income"
      },
      {
        "id": "cbse-11-com-s4",
        "name": "Business Mathematics / Computer Applications",
        "completed": 0,
        "total": 50,
        "icon": "💻",
        "color": "#ec4899",
        "currentChapter": "Unit 1: Matrices, Calculus & Spreadsheet Models"
      }
    ],
    "tasks": [
      {
        "title": "Accountancy: Basic Accounting Terms & GAAP",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Basic Accounting Terms & GAAP",
        "rawSubject": "Accountancy",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Business Studies: Business vs Profession vs Employment",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Business vs Profession vs Employment",
        "rawSubject": "Business Studies",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "Economics: Production Possibility Curve (PPC) & Cost",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "Production Possibility Curve (PPC) & Cost",
        "rawSubject": "Economics",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Daily Practice Problem: Accounting Equation",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "Accounting Equation",
        "rawSubject": "Daily Practice Problem",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "CBSE +1 Commerce Topper Award",
    "milestoneDesc": "NCERT line-by-line mastery and CBSE board question banks.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "cbse-12-sci",
    "category": "school_cbse",
    "gradeLevel": "hsc",
    "title": "Class 12 — CBSE Board Exam Mastery Science (NCERT)",
    "subtitle": "200-Day NCERT Curriculum & Board Blueprint",
    "short": "Class 12 • CBSE",
    "medium": "English",
    "board": "CBSE",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "CBSE 12th Centum Sci",
    "badgeColor": "#ec4899",
    "phaseTitle": "Phase 1: NCERT Concepts, Formulas & Exemplar Problems",
    "phaseSub": "Day 1 of 200 • Key Definitions & Daily Drill",
    "subjects": [
      {
        "id": "cbse-12-sci-s1",
        "name": "Physics (Mechanics, Optics & Electromagnetism)",
        "completed": 1,
        "total": 50,
        "icon": "⚡",
        "color": "#06b6d4",
        "currentChapter": "Unit 1: Electrostatics & Current Electricity"
      },
      {
        "id": "cbse-12-sci-s2",
        "name": "Chemistry (Physical, Organic & Inorganic)",
        "completed": 1,
        "total": 50,
        "icon": "🧪",
        "color": "#10b981",
        "currentChapter": "Unit 1: Metallurgy, Solid State & Solutions"
      },
      {
        "id": "cbse-12-sci-s3",
        "name": "Mathematics (Calculus, Vectors & Coordinate)",
        "completed": 0,
        "total": 50,
        "icon": "📐",
        "color": "#f59e0b",
        "currentChapter": "Unit 1: Matrices & Differential Calculus"
      },
      {
        "id": "cbse-12-sci-s4",
        "name": "Biology (Botany, Zoology) / Computer Science",
        "completed": 0,
        "total": 50,
        "icon": "🧬",
        "color": "#ec4899",
        "currentChapter": "Unit 1: Reproduction, Genetics / OOP Python C++"
      }
    ],
    "tasks": [
      {
        "title": "Mathematics: Equivalence Relations & Invertible Functions",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Equivalence Relations & Invertible Functions",
        "rawSubject": "Mathematics",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Physics: Coulomb’s Law Vector Form & Axial Field",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Coulomb’s Law Vector Form & Axial Field",
        "rawSubject": "Physics",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "Chemistry: Raoult’s Law & Colligative Properties",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "Raoult’s Law & Colligative Properties",
        "rawSubject": "Chemistry",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "CBSE Centum Drill: 15 Objective & Case Questions",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "15 Objective & Case Questions",
        "rawSubject": "CBSE Centum Drill",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "CBSE 12th Centum Sci Topper Award",
    "milestoneDesc": "NCERT line-by-line mastery and CBSE board question banks.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "cbse-12-com",
    "category": "school_cbse",
    "gradeLevel": "hsc",
    "title": "Class 12 — CBSE Board Exam Mastery Commerce (NCERT)",
    "subtitle": "200-Day NCERT Curriculum & Board Blueprint",
    "short": "Class 12 • CBSE",
    "medium": "English",
    "board": "CBSE",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "CBSE 12th Centum Com",
    "badgeColor": "#f59e0b",
    "phaseTitle": "Phase 1: NCERT Concepts, Formulas & Exemplar Problems",
    "phaseSub": "Day 1 of 200 • Key Definitions & Daily Drill",
    "subjects": [
      {
        "id": "cbse-12-com-s1",
        "name": "Accountancy & Financial Statements",
        "completed": 1,
        "total": 50,
        "icon": "📊",
        "color": "#06b6d4",
        "currentChapter": "Unit 1: Partnership Accounting & Balance Sheets"
      },
      {
        "id": "cbse-12-com-s2",
        "name": "Commerce & Principles of Management",
        "completed": 1,
        "total": 50,
        "icon": "💼",
        "color": "#10b981",
        "currentChapter": "Unit 1: Management Functions & Corporate Finance"
      },
      {
        "id": "cbse-12-com-s3",
        "name": "Economics (Micro, Macro & Indian Economy)",
        "completed": 0,
        "total": 50,
        "icon": "📈",
        "color": "#f59e0b",
        "currentChapter": "Unit 1: Macroeconomics & National Income"
      },
      {
        "id": "cbse-12-com-s4",
        "name": "Business Mathematics / Computer Applications",
        "completed": 0,
        "total": 50,
        "icon": "💻",
        "color": "#ec4899",
        "currentChapter": "Unit 1: Matrices, Calculus & Spreadsheet Models"
      }
    ],
    "tasks": [
      {
        "title": "Accountancy: Profit & Loss Appropriation Account",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Profit & Loss Appropriation Account",
        "rawSubject": "Accountancy",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Business Studies: F.W. Taylor Scientific Management",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "F.W. Taylor Scientific Management",
        "rawSubject": "Business Studies",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "Economics: Circular Flow of Income & Value Added GDP",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "Circular Flow of Income & Value Added GDP",
        "rawSubject": "Economics",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Board Practice: 6-Mark Comprehensive Problem",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "6-Mark Comprehensive Problem",
        "rawSubject": "Board Practice",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "CBSE 12th Centum Com Topper Award",
    "milestoneDesc": "NCERT line-by-line mastery and CBSE board question banks.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "matric-lkg",
    "category": "school_matric",
    "gradeLevel": "primary",
    "title": "LKG — Matriculation Kindergarten Academy",
    "subtitle": "200-Day Matriculation School Tuition & Exam Drill",
    "short": "LKG • Matric",
    "medium": "English",
    "board": "Matric",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "Matric LKG Star",
    "badgeColor": "#ec4899",
    "phaseTitle": "Phase 1: Matric Curriculum & High-Score Exam Drills",
    "phaseSub": "Day 1 of 200 • Daily Routine & Core Concepts",
    "subjects": [
      {
        "id": "matric-lkg-s1",
        "name": "English Phonics, Alphabets & Rhymes",
        "completed": 1,
        "total": 30,
        "icon": "🔤",
        "color": "#ec4899",
        "currentChapter": "Unit 1: Phonics A-Z & Sight Words"
      },
      {
        "id": "matric-lkg-s2",
        "name": "Number Magic, Counting & Shapes",
        "completed": 1,
        "total": 30,
        "icon": "🔢",
        "color": "#06b6d4",
        "currentChapter": "Unit 1: Numbers 1 to 20 & Shapes"
      },
      {
        "id": "matric-lkg-s3",
        "name": "General Awareness, Body & Nature (EVS)",
        "completed": 0,
        "total": 30,
        "icon": "🌿",
        "color": "#10b981",
        "currentChapter": "Unit 1: My Body & Five Senses"
      },
      {
        "id": "matric-lkg-s4",
        "name": "Creative Drawing, Motor Skills & Stories",
        "completed": 0,
        "total": 30,
        "icon": "🎨",
        "color": "#f59e0b",
        "currentChapter": "Unit 1: Colors & Pattern Tracing"
      }
    ],
    "tasks": [
      {
        "title": "Phonics Fun: Letter A Sound & Alphabet Phonics A-E",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Letter A Sound & Alphabet Phonics A-E",
        "rawSubject": "Phonics Fun",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Number Magic: Counting 1 to 3 with Colorful Animals",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Counting 1 to 3 with Colorful Animals",
        "rawSubject": "Number Magic",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "EVS: Five Senses - Eyes to See & Ears to Hear",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "Five Senses - Eyes to See & Ears to Hear",
        "rawSubject": "EVS",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Bedtime Rhyme: Twinkle Twinkle Little Star",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "Twinkle Twinkle Little Star",
        "rawSubject": "Bedtime Rhyme",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "Matric LKG Star Honor Roll",
    "milestoneDesc": "Complete matric curriculum with comprehensive revision tests.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "matric-ukg",
    "category": "school_matric",
    "gradeLevel": "primary",
    "title": "UKG — Matriculation Senior Kindergarten Prep",
    "subtitle": "200-Day Matriculation School Tuition & Exam Drill",
    "short": "UKG • Matric",
    "medium": "English",
    "board": "Matric",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "Matric UKG Prep",
    "badgeColor": "#8b5cf6",
    "phaseTitle": "Phase 1: Matric Curriculum & High-Score Exam Drills",
    "phaseSub": "Day 1 of 200 • Daily Routine & Core Concepts",
    "subjects": [
      {
        "id": "matric-ukg-s1",
        "name": "English Phonics, Alphabets & Rhymes",
        "completed": 1,
        "total": 30,
        "icon": "🔤",
        "color": "#ec4899",
        "currentChapter": "Unit 1: Phonics A-Z & Sight Words"
      },
      {
        "id": "matric-ukg-s2",
        "name": "Number Magic, Counting & Shapes",
        "completed": 1,
        "total": 30,
        "icon": "🔢",
        "color": "#06b6d4",
        "currentChapter": "Unit 1: Numbers 1 to 20 & Shapes"
      },
      {
        "id": "matric-ukg-s3",
        "name": "General Awareness, Body & Nature (EVS)",
        "completed": 0,
        "total": 30,
        "icon": "🌿",
        "color": "#10b981",
        "currentChapter": "Unit 1: My Body & Five Senses"
      },
      {
        "id": "matric-ukg-s4",
        "name": "Creative Drawing, Motor Skills & Stories",
        "completed": 0,
        "total": 30,
        "icon": "🎨",
        "color": "#f59e0b",
        "currentChapter": "Unit 1: Colors & Pattern Tracing"
      }
    ],
    "tasks": [
      {
        "title": "English Phonics: 3-Letter -at & -an Word Families",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "3-Letter -at & -an Word Families",
        "rawSubject": "English Phonics",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Mathematics: Basic Picture Addition (1-10)",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Basic Picture Addition (1-10)",
        "rawSubject": "Mathematics",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "Science: Parts of a Plant & How Seeds Grow",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "Parts of a Plant & How Seeds Grow",
        "rawSubject": "Science",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Daily Story: The Lion and the Clever Rabbit",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "The Lion and the Clever Rabbit",
        "rawSubject": "Daily Story",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "Matric UKG Prep Honor Roll",
    "milestoneDesc": "Complete matric curriculum with comprehensive revision tests.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "matric-1",
    "category": "school_matric",
    "gradeLevel": "primary",
    "title": "Class 1 — Matriculation Board Tuition",
    "subtitle": "200-Day Matriculation School Tuition & Exam Drill",
    "short": "Class 1 • Matric",
    "medium": "English",
    "board": "Matric",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "Matric Class 1",
    "badgeColor": "#06b6d4",
    "phaseTitle": "Phase 1: Matric Curriculum & High-Score Exam Drills",
    "phaseSub": "Day 1 of 200 • Daily Routine & Core Concepts",
    "subjects": [
      {
        "id": "matric-1-s1",
        "name": "Mathematics (Number Magic & Geometry)",
        "completed": 1,
        "total": 40,
        "icon": "🔢",
        "color": "#06b6d4",
        "currentChapter": "Unit 1: Shapes, Space & Numbers"
      },
      {
        "id": "matric-1-s2",
        "name": "Environmental Studies (EVS & Science)",
        "completed": 1,
        "total": 40,
        "icon": "🌿",
        "color": "#10b981",
        "currentChapter": "Unit 1: Plants, Animals & Family"
      },
      {
        "id": "matric-1-s3",
        "name": "English Language & Reading Literacy",
        "completed": 0,
        "total": 40,
        "icon": "📖",
        "color": "#ec4899",
        "currentChapter": "Unit 1: Prose, Poetry & Phonics"
      },
      {
        "id": "matric-1-s4",
        "name": "Tamil / Second Language & General Knowledge",
        "completed": 0,
        "total": 40,
        "icon": "✍️",
        "color": "#f59e0b",
        "currentChapter": "Unit 1: Language Basics & Values"
      }
    ],
    "tasks": [
      {
        "title": "Mathematics: Numbers 1 to 100 with Place Value",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Numbers 1 to 100 with Place Value",
        "rawSubject": "Mathematics",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Science: My Amazing Body & Five Senses Functions",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "My Amazing Body & Five Senses Functions",
        "rawSubject": "Science",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "English: Phonics Blends & Sight Words Recognition",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "Phonics Blends & Sight Words Recognition",
        "rawSubject": "English",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Daily 5-Question Recall Practice",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "Daily 5-Question Recall Practice",
        "rawSubject": "Hands-On & Recap",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "Matric Class 1 Honor Roll",
    "milestoneDesc": "Complete matric curriculum with comprehensive revision tests.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "matric-2",
    "category": "school_matric",
    "gradeLevel": "primary",
    "title": "Class 2 — Matriculation Board Tuition",
    "subtitle": "200-Day Matriculation School Tuition & Exam Drill",
    "short": "Class 2 • Matric",
    "medium": "English",
    "board": "Matric",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "Matric Class 2",
    "badgeColor": "#06b6d4",
    "phaseTitle": "Phase 1: Matric Curriculum & High-Score Exam Drills",
    "phaseSub": "Day 1 of 200 • Daily Routine & Core Concepts",
    "subjects": [
      {
        "id": "matric-2-s1",
        "name": "Mathematics (Number Magic & Geometry)",
        "completed": 1,
        "total": 40,
        "icon": "🔢",
        "color": "#06b6d4",
        "currentChapter": "Unit 1: Shapes, Space & Numbers"
      },
      {
        "id": "matric-2-s2",
        "name": "Environmental Studies (EVS & Science)",
        "completed": 1,
        "total": 40,
        "icon": "🌿",
        "color": "#10b981",
        "currentChapter": "Unit 1: Plants, Animals & Family"
      },
      {
        "id": "matric-2-s3",
        "name": "English Language & Reading Literacy",
        "completed": 0,
        "total": 40,
        "icon": "📖",
        "color": "#ec4899",
        "currentChapter": "Unit 1: Prose, Poetry & Phonics"
      },
      {
        "id": "matric-2-s4",
        "name": "Tamil / Second Language & General Knowledge",
        "completed": 0,
        "total": 40,
        "icon": "✍️",
        "color": "#f59e0b",
        "currentChapter": "Unit 1: Language Basics & Values"
      }
    ],
    "tasks": [
      {
        "title": "Mathematics: 2-Digit Addition with Word Problems",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "2-Digit Addition with Word Problems",
        "rawSubject": "Mathematics",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Science: Plant Kingdom & Parts of a Tree",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Plant Kingdom & Parts of a Tree",
        "rawSubject": "Science",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "English Grammar: Nouns, Pronouns & Sentences",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "Nouns, Pronouns & Sentences",
        "rawSubject": "English Grammar",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Bedtime Moral Story: The Honest Woodcutter",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "The Honest Woodcutter",
        "rawSubject": "Bedtime Moral Story",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "Matric Class 2 Honor Roll",
    "milestoneDesc": "Complete matric curriculum with comprehensive revision tests.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "matric-3",
    "category": "school_matric",
    "gradeLevel": "primary",
    "title": "Class 3 — Matriculation Board Tuition",
    "subtitle": "200-Day Matriculation School Tuition & Exam Drill",
    "short": "Class 3 • Matric",
    "medium": "English",
    "board": "Matric",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "Matric Class 3",
    "badgeColor": "#06b6d4",
    "phaseTitle": "Phase 1: Matric Curriculum & High-Score Exam Drills",
    "phaseSub": "Day 1 of 200 • Daily Routine & Core Concepts",
    "subjects": [
      {
        "id": "matric-3-s1",
        "name": "Mathematics (Number Magic & Geometry)",
        "completed": 1,
        "total": 40,
        "icon": "🔢",
        "color": "#06b6d4",
        "currentChapter": "Unit 1: Shapes, Space & Numbers"
      },
      {
        "id": "matric-3-s2",
        "name": "Environmental Studies (EVS & Science)",
        "completed": 1,
        "total": 40,
        "icon": "🌿",
        "color": "#10b981",
        "currentChapter": "Unit 1: Plants, Animals & Family"
      },
      {
        "id": "matric-3-s3",
        "name": "English Language & Reading Literacy",
        "completed": 0,
        "total": 40,
        "icon": "📖",
        "color": "#ec4899",
        "currentChapter": "Unit 1: Prose, Poetry & Phonics"
      },
      {
        "id": "matric-3-s4",
        "name": "Tamil / Second Language & General Knowledge",
        "completed": 0,
        "total": 40,
        "icon": "✍️",
        "color": "#f59e0b",
        "currentChapter": "Unit 1: Language Basics & Values"
      }
    ],
    "tasks": [
      {
        "title": "Mathematics: Multiplication Tables 1 to 10 Made Easy",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Multiplication Tables 1 to 10 Made Easy",
        "rawSubject": "Mathematics",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Science: Solid, Liquid, Gas - Matter & Materials",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Solid, Liquid, Gas - Matter & Materials",
        "rawSubject": "Science",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "Social Science: Community Helpers & Panchayat Rules",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "Community Helpers & Panchayat Rules",
        "rawSubject": "Social Science",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Creative Task: Draw and Label States of Water",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "Draw and Label States of Water",
        "rawSubject": "Creative Task",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "Matric Class 3 Honor Roll",
    "milestoneDesc": "Complete matric curriculum with comprehensive revision tests.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "matric-4",
    "category": "school_matric",
    "gradeLevel": "primary",
    "title": "Class 4 — Matriculation Board Tuition",
    "subtitle": "200-Day Matriculation School Tuition & Exam Drill",
    "short": "Class 4 • Matric",
    "medium": "English",
    "board": "Matric",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "Matric Class 4",
    "badgeColor": "#06b6d4",
    "phaseTitle": "Phase 1: Matric Curriculum & High-Score Exam Drills",
    "phaseSub": "Day 1 of 200 • Daily Routine & Core Concepts",
    "subjects": [
      {
        "id": "matric-4-s1",
        "name": "Mathematics (Number Magic & Geometry)",
        "completed": 1,
        "total": 40,
        "icon": "🔢",
        "color": "#06b6d4",
        "currentChapter": "Unit 1: Shapes, Space & Numbers"
      },
      {
        "id": "matric-4-s2",
        "name": "Environmental Studies (EVS & Science)",
        "completed": 1,
        "total": 40,
        "icon": "🌿",
        "color": "#10b981",
        "currentChapter": "Unit 1: Plants, Animals & Family"
      },
      {
        "id": "matric-4-s3",
        "name": "English Language & Reading Literacy",
        "completed": 0,
        "total": 40,
        "icon": "📖",
        "color": "#ec4899",
        "currentChapter": "Unit 1: Prose, Poetry & Phonics"
      },
      {
        "id": "matric-4-s4",
        "name": "Tamil / Second Language & General Knowledge",
        "completed": 0,
        "total": 40,
        "icon": "✍️",
        "color": "#f59e0b",
        "currentChapter": "Unit 1: Language Basics & Values"
      }
    ],
    "tasks": [
      {
        "title": "Mathematics: Long Division & Quotient-Remainder",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Long Division & Quotient-Remainder",
        "rawSubject": "Mathematics",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Science: How Digestion Works - Journey of Food",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "How Digestion Works - Journey of Food",
        "rawSubject": "Science",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "Social Science: The Great Chola Empire & Temples",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "The Great Chola Empire & Temples",
        "rawSubject": "Social Science",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Daily Quiz: 5-Question Recall Practice",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "5-Question Recall Practice",
        "rawSubject": "Daily Quiz",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "Matric Class 4 Honor Roll",
    "milestoneDesc": "Complete matric curriculum with comprehensive revision tests.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "matric-5",
    "category": "school_matric",
    "gradeLevel": "primary",
    "title": "Class 5 — Matriculation Board Tuition",
    "subtitle": "200-Day Matriculation School Tuition & Exam Drill",
    "short": "Class 5 • Matric",
    "medium": "English",
    "board": "Matric",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "Matric Class 5",
    "badgeColor": "#06b6d4",
    "phaseTitle": "Phase 1: Matric Curriculum & High-Score Exam Drills",
    "phaseSub": "Day 1 of 200 • Daily Routine & Core Concepts",
    "subjects": [
      {
        "id": "matric-5-s1",
        "name": "Mathematics (Number Magic & Geometry)",
        "completed": 1,
        "total": 40,
        "icon": "🔢",
        "color": "#06b6d4",
        "currentChapter": "Unit 1: Shapes, Space & Numbers"
      },
      {
        "id": "matric-5-s2",
        "name": "Environmental Studies (EVS & Science)",
        "completed": 1,
        "total": 40,
        "icon": "🌿",
        "color": "#10b981",
        "currentChapter": "Unit 1: Plants, Animals & Family"
      },
      {
        "id": "matric-5-s3",
        "name": "English Language & Reading Literacy",
        "completed": 0,
        "total": 40,
        "icon": "📖",
        "color": "#ec4899",
        "currentChapter": "Unit 1: Prose, Poetry & Phonics"
      },
      {
        "id": "matric-5-s4",
        "name": "Tamil / Second Language & General Knowledge",
        "completed": 0,
        "total": 40,
        "icon": "✍️",
        "color": "#f59e0b",
        "currentChapter": "Unit 1: Language Basics & Values"
      }
    ],
    "tasks": [
      {
        "title": "Mathematics: Place Value of 6-Digit Numbers",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Place Value of 6-Digit Numbers",
        "rawSubject": "Mathematics",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Science: Human Circulatory System - Heart & Arteries",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Human Circulatory System - Heart & Arteries",
        "rawSubject": "Science",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "Social Science: Golden Age of Pallavas & Cholas",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "Golden Age of Pallavas & Cholas",
        "rawSubject": "Social Science",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Daily 5-Question Diagnostic Practice Quiz",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "Daily 5-Question Diagnostic Practice Quiz",
        "rawSubject": "Hands-On & Recap",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "Matric Class 5 Honor Roll",
    "milestoneDesc": "Complete matric curriculum with comprehensive revision tests.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "matric-6",
    "category": "school_matric",
    "gradeLevel": "middle",
    "title": "Class 6 — Matriculation Board Tuition",
    "subtitle": "200-Day Matriculation School Tuition & Exam Drill",
    "short": "Class 6 • Matric",
    "medium": "English",
    "board": "Matric",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "Matric Class 6",
    "badgeColor": "#3b82f6",
    "phaseTitle": "Phase 1: Matric Curriculum & High-Score Exam Drills",
    "phaseSub": "Day 1 of 200 • Daily Routine & Core Concepts",
    "subjects": [
      {
        "id": "matric-6-s1",
        "name": "Mathematics (Algebra, Geometry & Arithmetic)",
        "completed": 1,
        "total": 45,
        "icon": "📐",
        "color": "#06b6d4",
        "currentChapter": "Unit 1: Number Systems & Algebra"
      },
      {
        "id": "matric-6-s2",
        "name": "Science (Physics, Chemistry & Biology)",
        "completed": 1,
        "total": 45,
        "icon": "🔬",
        "color": "#10b981",
        "currentChapter": "Unit 1: Measurement & Living World"
      },
      {
        "id": "matric-6-s3",
        "name": "Social Science (History, Civics & Geography)",
        "completed": 0,
        "total": 45,
        "icon": "🌍",
        "color": "#f59e0b",
        "currentChapter": "Unit 1: Ancient Civilization & Maps"
      },
      {
        "id": "matric-6-s4",
        "name": "English Literature, Grammar & Composition",
        "completed": 0,
        "total": 45,
        "icon": "📚",
        "color": "#ec4899",
        "currentChapter": "Unit 1: Prose, Grammar & Tenses"
      }
    ],
    "tasks": [
      {
        "title": "Mathematics: Large Numbers & Estimation in Indian/Intl",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Large Numbers & Estimation in Indian/Intl",
        "rawSubject": "Mathematics",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Science: SI Units, Parallax Error & Measurements",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "SI Units, Parallax Error & Measurements",
        "rawSubject": "Science",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "Social Science: Indus Valley Civilisation - Harappa",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "Indus Valley Civilisation - Harappa",
        "rawSubject": "Social Science",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Daily 5-Question Diagnostic Practice Quiz",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "Daily 5-Question Diagnostic Practice Quiz",
        "rawSubject": "Hands-On & Recap",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "Matric Class 6 Honor Roll",
    "milestoneDesc": "Complete matric curriculum with comprehensive revision tests.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "matric-7",
    "category": "school_matric",
    "gradeLevel": "middle",
    "title": "Class 7 — Matriculation Board Tuition",
    "subtitle": "200-Day Matriculation School Tuition & Exam Drill",
    "short": "Class 7 • Matric",
    "medium": "English",
    "board": "Matric",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "Matric Class 7",
    "badgeColor": "#3b82f6",
    "phaseTitle": "Phase 1: Matric Curriculum & High-Score Exam Drills",
    "phaseSub": "Day 1 of 200 • Daily Routine & Core Concepts",
    "subjects": [
      {
        "id": "matric-7-s1",
        "name": "Mathematics (Algebra, Geometry & Arithmetic)",
        "completed": 1,
        "total": 45,
        "icon": "📐",
        "color": "#06b6d4",
        "currentChapter": "Unit 1: Number Systems & Algebra"
      },
      {
        "id": "matric-7-s2",
        "name": "Science (Physics, Chemistry & Biology)",
        "completed": 1,
        "total": 45,
        "icon": "🔬",
        "color": "#10b981",
        "currentChapter": "Unit 1: Measurement & Living World"
      },
      {
        "id": "matric-7-s3",
        "name": "Social Science (History, Civics & Geography)",
        "completed": 0,
        "total": 45,
        "icon": "🌍",
        "color": "#f59e0b",
        "currentChapter": "Unit 1: Ancient Civilization & Maps"
      },
      {
        "id": "matric-7-s4",
        "name": "English Literature, Grammar & Composition",
        "completed": 0,
        "total": 45,
        "icon": "📚",
        "color": "#ec4899",
        "currentChapter": "Unit 1: Prose, Grammar & Tenses"
      }
    ],
    "tasks": [
      {
        "title": "Mathematics: Integer Multiplication & Division",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Integer Multiplication & Division",
        "rawSubject": "Mathematics",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Science: Heat Transfer - Conduction, Convection & Radiation",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Heat Transfer - Conduction, Convection & Radiation",
        "rawSubject": "Science",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "Social Science: Epigraphy & Sources of Medieval India",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "Epigraphy & Sources of Medieval India",
        "rawSubject": "Social Science",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Daily 5-Question Diagnostic Practice Quiz",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "Daily 5-Question Diagnostic Practice Quiz",
        "rawSubject": "Hands-On & Recap",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "Matric Class 7 Honor Roll",
    "milestoneDesc": "Complete matric curriculum with comprehensive revision tests.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "matric-8",
    "category": "school_matric",
    "gradeLevel": "middle",
    "title": "Class 8 — Matriculation Board Tuition",
    "subtitle": "200-Day Matriculation School Tuition & Exam Drill",
    "short": "Class 8 • Matric",
    "medium": "English",
    "board": "Matric",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "Matric Class 8",
    "badgeColor": "#3b82f6",
    "phaseTitle": "Phase 1: Matric Curriculum & High-Score Exam Drills",
    "phaseSub": "Day 1 of 200 • Daily Routine & Core Concepts",
    "subjects": [
      {
        "id": "matric-8-s1",
        "name": "Mathematics (Algebra, Geometry & Arithmetic)",
        "completed": 1,
        "total": 45,
        "icon": "📐",
        "color": "#06b6d4",
        "currentChapter": "Unit 1: Number Systems & Algebra"
      },
      {
        "id": "matric-8-s2",
        "name": "Science (Physics, Chemistry & Biology)",
        "completed": 1,
        "total": 45,
        "icon": "🔬",
        "color": "#10b981",
        "currentChapter": "Unit 1: Measurement & Living World"
      },
      {
        "id": "matric-8-s3",
        "name": "Social Science (History, Civics & Geography)",
        "completed": 0,
        "total": 45,
        "icon": "🌍",
        "color": "#f59e0b",
        "currentChapter": "Unit 1: Ancient Civilization & Maps"
      },
      {
        "id": "matric-8-s4",
        "name": "English Literature, Grammar & Composition",
        "completed": 0,
        "total": 45,
        "icon": "📚",
        "color": "#ec4899",
        "currentChapter": "Unit 1: Prose, Grammar & Tenses"
      }
    ],
    "tasks": [
      {
        "title": "Mathematics: Rational Numbers & Arithmetic Properties",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Rational Numbers & Arithmetic Properties",
        "rawSubject": "Mathematics",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Science: Atmospheric Pressure & Barometer Laws",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Atmospheric Pressure & Barometer Laws",
        "rawSubject": "Science",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "Social Science: European Settlements in India",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "European Settlements in India",
        "rawSubject": "Social Science",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Daily 5-Question Diagnostic Practice Quiz",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "Daily 5-Question Diagnostic Practice Quiz",
        "rawSubject": "Hands-On & Recap",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "Matric Class 8 Honor Roll",
    "milestoneDesc": "Complete matric curriculum with comprehensive revision tests.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "matric-9",
    "category": "school_matric",
    "gradeLevel": "high",
    "title": "Class 9 — Matriculation Board Tuition",
    "subtitle": "200-Day Matriculation School Tuition & Exam Drill",
    "short": "Class 9 • Matric",
    "medium": "English",
    "board": "Matric",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "Matric 9th Pre-Board",
    "badgeColor": "#6366f1",
    "phaseTitle": "Phase 1: Matric Curriculum & High-Score Exam Drills",
    "phaseSub": "Day 1 of 200 • Daily Routine & Core Concepts",
    "subjects": [
      {
        "id": "matric-9-s1",
        "name": "Mathematics (Real Numbers, Algebra & Geometry)",
        "completed": 1,
        "total": 50,
        "icon": "📐",
        "color": "#06b6d4",
        "currentChapter": "Chapter 1: Relations, Functions & Real Numbers"
      },
      {
        "id": "matric-9-s2",
        "name": "Science (Physics, Chemistry & Biology)",
        "completed": 1,
        "total": 50,
        "icon": "🔬",
        "color": "#10b981",
        "currentChapter": "Chapter 1: Laws of Motion, Reactions & Life Processes"
      },
      {
        "id": "matric-9-s3",
        "name": "Social Science (History, Geography & Economics)",
        "completed": 0,
        "total": 50,
        "icon": "🌍",
        "color": "#f59e0b",
        "currentChapter": "Chapter 1: Contemporary World & Resource Economics"
      },
      {
        "id": "matric-9-s4",
        "name": "English Language & Literary Analysis",
        "completed": 0,
        "total": 50,
        "icon": "📚",
        "color": "#ec4899",
        "currentChapter": "Unit 1: Prose, Poetic Devices & Applied Grammar"
      }
    ],
    "tasks": [
      {
        "title": "Mathematics: Set Language & Venn Diagrams",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Set Language & Venn Diagrams",
        "rawSubject": "Mathematics",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Science: Equations of Motion Derivations (v = u + at)",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Equations of Motion Derivations (v = u + at)",
        "rawSubject": "Science",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "Social Science: Prehistoric Humans & Stone Age",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "Prehistoric Humans & Stone Age",
        "rawSubject": "Social Science",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Daily 5-Question Board Foundation Quiz",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "Daily 5-Question Board Foundation Quiz",
        "rawSubject": "Hands-On & Recap",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "Matric 9th Pre-Board Honor Roll",
    "milestoneDesc": "Complete matric curriculum with comprehensive revision tests.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "matric-10",
    "category": "school_matric",
    "gradeLevel": "high",
    "title": "Class 10 — Matriculation State Board SSLC (English)",
    "subtitle": "200-Day Matriculation School Tuition & Exam Drill",
    "short": "Class 10 • Matric",
    "medium": "English",
    "board": "Matric",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "Matric SSLC Centum",
    "badgeColor": "#ec4899",
    "phaseTitle": "Phase 1: Matric Curriculum & High-Score Exam Drills",
    "phaseSub": "Day 1 of 200 • Daily Routine & Core Concepts",
    "subjects": [
      {
        "id": "matric-10-s1",
        "name": "Mathematics (Real Numbers, Algebra & Geometry)",
        "completed": 1,
        "total": 50,
        "icon": "📐",
        "color": "#06b6d4",
        "currentChapter": "Chapter 1: Relations, Functions & Real Numbers"
      },
      {
        "id": "matric-10-s2",
        "name": "Science (Physics, Chemistry & Biology)",
        "completed": 1,
        "total": 50,
        "icon": "🔬",
        "color": "#10b981",
        "currentChapter": "Chapter 1: Laws of Motion, Reactions & Life Processes"
      },
      {
        "id": "matric-10-s3",
        "name": "Social Science (History, Geography & Economics)",
        "completed": 0,
        "total": 50,
        "icon": "🌍",
        "color": "#f59e0b",
        "currentChapter": "Chapter 1: Contemporary World & Resource Economics"
      },
      {
        "id": "matric-10-s4",
        "name": "English Language & Literary Analysis",
        "completed": 0,
        "total": 50,
        "icon": "📚",
        "color": "#ec4899",
        "currentChapter": "Unit 1: Prose, Poetic Devices & Applied Grammar"
      }
    ],
    "tasks": [
      {
        "title": "Mathematics: Cartesian Products & Relations (5-Mark Theorem)",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Cartesian Products & Relations (5-Mark Theorem)",
        "rawSubject": "Mathematics",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Science: Newton’s 3 Laws of Motion & Momentum Conservation",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Newton’s 3 Laws of Motion & Momentum Conservation",
        "rawSubject": "Science",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "Social Science: Causes of World War I & Treaty of Versailles",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "Causes of World War I & Treaty of Versailles",
        "rawSubject": "Social Science",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "SSLC Centum Blueprint: 10 High-Yield One-Marks",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "10 High-Yield One-Marks",
        "rawSubject": "SSLC Centum Blueprint",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "Matric SSLC Centum Honor Roll",
    "milestoneDesc": "Complete matric curriculum with comprehensive revision tests.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "matric-11-sci",
    "category": "school_matric",
    "gradeLevel": "hsc",
    "title": "Class 11 — Matriculation HSC +1 Science (English)",
    "subtitle": "200-Day Matriculation School Tuition & Exam Drill",
    "short": "Class 11 • Matric",
    "medium": "English",
    "board": "Matric",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "Matric +1 Science",
    "badgeColor": "#6366f1",
    "phaseTitle": "Phase 1: Matric Curriculum & High-Score Exam Drills",
    "phaseSub": "Day 1 of 200 • Daily Routine & Core Concepts",
    "subjects": [
      {
        "id": "matric-11-sci-s1",
        "name": "Physics (Mechanics, Optics & Electromagnetism)",
        "completed": 1,
        "total": 50,
        "icon": "⚡",
        "color": "#06b6d4",
        "currentChapter": "Unit 1: Electrostatics & Current Electricity"
      },
      {
        "id": "matric-11-sci-s2",
        "name": "Chemistry (Physical, Organic & Inorganic)",
        "completed": 1,
        "total": 50,
        "icon": "🧪",
        "color": "#10b981",
        "currentChapter": "Unit 1: Metallurgy, Solid State & Solutions"
      },
      {
        "id": "matric-11-sci-s3",
        "name": "Mathematics (Calculus, Vectors & Coordinate)",
        "completed": 0,
        "total": 50,
        "icon": "📐",
        "color": "#f59e0b",
        "currentChapter": "Unit 1: Matrices & Differential Calculus"
      },
      {
        "id": "matric-11-sci-s4",
        "name": "Biology (Botany, Zoology) / Computer Science",
        "completed": 0,
        "total": 50,
        "icon": "🧬",
        "color": "#ec4899",
        "currentChapter": "Unit 1: Reproduction, Genetics / OOP Python C++"
      }
    ],
    "tasks": [
      {
        "title": "Mathematics: Sets, Relations, Functions & Domain",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Sets, Relations, Functions & Domain",
        "rawSubject": "Mathematics",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Physics: Vector Addition, Dot & Cross Product Mechanics",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Vector Addition, Dot & Cross Product Mechanics",
        "rawSubject": "Physics",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "Chemistry: Mole Concept & Empirical Formula Calculations",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "Mole Concept & Empirical Formula Calculations",
        "rawSubject": "Chemistry",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Daily 5-Mark Question: Step-by-Step Model Solution",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "Step-by-Step Model Solution",
        "rawSubject": "Daily 5-Mark Question",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "Matric +1 Science Honor Roll",
    "milestoneDesc": "Complete matric curriculum with comprehensive revision tests.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "matric-11-com",
    "category": "school_matric",
    "gradeLevel": "hsc",
    "title": "Class 11 — Matriculation HSC +1 Commerce (English)",
    "subtitle": "200-Day Matriculation School Tuition & Exam Drill",
    "short": "Class 11 • Matric",
    "medium": "English",
    "board": "Matric",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "Matric +1 Commerce",
    "badgeColor": "#10b981",
    "phaseTitle": "Phase 1: Matric Curriculum & High-Score Exam Drills",
    "phaseSub": "Day 1 of 200 • Daily Routine & Core Concepts",
    "subjects": [
      {
        "id": "matric-11-com-s1",
        "name": "Accountancy & Financial Statements",
        "completed": 1,
        "total": 50,
        "icon": "📊",
        "color": "#06b6d4",
        "currentChapter": "Unit 1: Partnership Accounting & Balance Sheets"
      },
      {
        "id": "matric-11-com-s2",
        "name": "Commerce & Principles of Management",
        "completed": 1,
        "total": 50,
        "icon": "💼",
        "color": "#10b981",
        "currentChapter": "Unit 1: Management Functions & Corporate Finance"
      },
      {
        "id": "matric-11-com-s3",
        "name": "Economics (Micro, Macro & Indian Economy)",
        "completed": 0,
        "total": 50,
        "icon": "📈",
        "color": "#f59e0b",
        "currentChapter": "Unit 1: Macroeconomics & National Income"
      },
      {
        "id": "matric-11-com-s4",
        "name": "Business Mathematics / Computer Applications",
        "completed": 0,
        "total": 50,
        "icon": "💻",
        "color": "#ec4899",
        "currentChapter": "Unit 1: Matrices, Calculus & Spreadsheet Models"
      }
    ],
    "tasks": [
      {
        "title": "Accountancy: Golden Rules of Accounting (Personal/Real/Nominal)",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Golden Rules of Accounting (Personal/Real/Nominal)",
        "rawSubject": "Accountancy",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Commerce: Economic & Non-Economic Activities",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Economic & Non-Economic Activities",
        "rawSubject": "Commerce",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "Economics: Adam Smith vs Lionel Robbins Definitions",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "Adam Smith vs Lionel Robbins Definitions",
        "rawSubject": "Economics",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Daily Problem: Journal Entry Drafting",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "Journal Entry Drafting",
        "rawSubject": "Daily Problem",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "Matric +1 Commerce Honor Roll",
    "milestoneDesc": "Complete matric curriculum with comprehensive revision tests.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "matric-12-sci",
    "category": "school_matric",
    "gradeLevel": "hsc",
    "title": "Class 12 — Matriculation HSC +2 Science 600/600 (English)",
    "subtitle": "200-Day Matriculation School Tuition & Exam Drill",
    "short": "Class 12 • Matric",
    "medium": "English",
    "board": "Matric",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "Matric +2 Centum 600",
    "badgeColor": "#ec4899",
    "phaseTitle": "Phase 1: Matric Curriculum & High-Score Exam Drills",
    "phaseSub": "Day 1 of 200 • Daily Routine & Core Concepts",
    "subjects": [
      {
        "id": "matric-12-sci-s1",
        "name": "Physics (Mechanics, Optics & Electromagnetism)",
        "completed": 1,
        "total": 50,
        "icon": "⚡",
        "color": "#06b6d4",
        "currentChapter": "Unit 1: Electrostatics & Current Electricity"
      },
      {
        "id": "matric-12-sci-s2",
        "name": "Chemistry (Physical, Organic & Inorganic)",
        "completed": 1,
        "total": 50,
        "icon": "🧪",
        "color": "#10b981",
        "currentChapter": "Unit 1: Metallurgy, Solid State & Solutions"
      },
      {
        "id": "matric-12-sci-s3",
        "name": "Mathematics (Calculus, Vectors & Coordinate)",
        "completed": 0,
        "total": 50,
        "icon": "📐",
        "color": "#f59e0b",
        "currentChapter": "Unit 1: Matrices & Differential Calculus"
      },
      {
        "id": "matric-12-sci-s4",
        "name": "Biology (Botany, Zoology) / Computer Science",
        "completed": 0,
        "total": 50,
        "icon": "🧬",
        "color": "#ec4899",
        "currentChapter": "Unit 1: Reproduction, Genetics / OOP Python C++"
      }
    ],
    "tasks": [
      {
        "title": "Mathematics: Inverse of Matrix by Gauss-Jordan (5 Marks)",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Inverse of Matrix by Gauss-Jordan (5 Marks)",
        "rawSubject": "Mathematics",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Physics: Electric Field of Dipole on Axial & Equatorial Line",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Electric Field of Dipole on Axial & Equatorial Line",
        "rawSubject": "Physics",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "Chemistry: Froth Floatation, Magnetic Separation & Leaching",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "Froth Floatation, Magnetic Separation & Leaching",
        "rawSubject": "Chemistry",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "HSC Centum Drill: 15 High-Yield Objective Questions",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "15 High-Yield Objective Questions",
        "rawSubject": "HSC Centum Drill",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "Matric +2 Centum 600 Honor Roll",
    "milestoneDesc": "Complete matric curriculum with comprehensive revision tests.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "matric-12-com",
    "category": "school_matric",
    "gradeLevel": "hsc",
    "title": "Class 12 — Matriculation HSC +2 Commerce 600/600 (English)",
    "subtitle": "200-Day Matriculation School Tuition & Exam Drill",
    "short": "Class 12 • Matric",
    "medium": "English",
    "board": "Matric",
    "totalDays": 200,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "Matric +2 Centum Com",
    "badgeColor": "#f59e0b",
    "phaseTitle": "Phase 1: Matric Curriculum & High-Score Exam Drills",
    "phaseSub": "Day 1 of 200 • Daily Routine & Core Concepts",
    "subjects": [
      {
        "id": "matric-12-com-s1",
        "name": "Accountancy & Financial Statements",
        "completed": 1,
        "total": 50,
        "icon": "📊",
        "color": "#06b6d4",
        "currentChapter": "Unit 1: Partnership Accounting & Balance Sheets"
      },
      {
        "id": "matric-12-com-s2",
        "name": "Commerce & Principles of Management",
        "completed": 1,
        "total": 50,
        "icon": "💼",
        "color": "#10b981",
        "currentChapter": "Unit 1: Management Functions & Corporate Finance"
      },
      {
        "id": "matric-12-com-s3",
        "name": "Economics (Micro, Macro & Indian Economy)",
        "completed": 0,
        "total": 50,
        "icon": "📈",
        "color": "#f59e0b",
        "currentChapter": "Unit 1: Macroeconomics & National Income"
      },
      {
        "id": "matric-12-com-s4",
        "name": "Business Mathematics / Computer Applications",
        "completed": 0,
        "total": 50,
        "icon": "💻",
        "color": "#ec4899",
        "currentChapter": "Unit 1: Matrices, Calculus & Spreadsheet Models"
      }
    ],
    "tasks": [
      {
        "title": "Accountancy: Statement of Affairs Net Profit Calculation",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Statement of Affairs Net Profit Calculation",
        "rawSubject": "Accountancy",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Commerce: Henri Fayol 14 Principles of Modern Management",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Henri Fayol 14 Principles of Modern Management",
        "rawSubject": "Commerce",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "Economics: Circular Flow of Income in 2, 3, 4 Sector Models",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "Circular Flow of Income in 2, 3, 4 Sector Models",
        "rawSubject": "Economics",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Board Practice: 5-Mark Practical Problem",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "5-Mark Practical Problem",
        "rawSubject": "Board Practice",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "Matric +2 Centum Com Honor Roll",
    "milestoneDesc": "Complete matric curriculum with comprehensive revision tests.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "exam-tnpsc-grp1",
    "category": "tnpsc",
    "gradeLevel": "exam",
    "title": "TNPSC Group 1 — Deputy Collector & DSP Prelims+Mains",
    "subtitle": "360-Day Comprehensive Professional Master Program",
    "short": "TNPSC Group 1",
    "medium": "Bilingual",
    "board": "National",
    "totalDays": 360,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "Group 1 Officer",
    "badgeColor": "#f59e0b",
    "phaseTitle": "Phase 1: Foundation, Advanced Core & Mock Tests",
    "phaseSub": "Day 1 of 360 • Daily Routine & Problem Solving",
    "subjects": [
      {
        "id": "exam-tnpsc-grp1-s1",
        "name": "பொதுத்தமிழ் & தமிழ் அறிஞர்கள் (100 வினாக்கள்)",
        "completed": 1,
        "total": 60,
        "icon": "📜",
        "color": "#ec4899",
        "currentChapter": "பகுதி அ: இலக்கணம், இலக்கியம் & அறிஞர்கள்"
      },
      {
        "id": "exam-tnpsc-grp1-s2",
        "name": "இந்திய அரசியலமைப்பு & சட்டங்கள் (Polity)",
        "completed": 1,
        "total": 60,
        "icon": "⚖️",
        "color": "#06b6d4",
        "currentChapter": "அலகு 1: முகப்புரை, அடிப்படை உரிமைகள் & நாடாளுமன்றம்"
      },
      {
        "id": "exam-tnpsc-grp1-s3",
        "name": "கணிதம் & திறனறிவு (Aptitude & Mental Ability 25/25)",
        "completed": 0,
        "total": 60,
        "icon": "🔢",
        "color": "#10b981",
        "currentChapter": "அலகு 1: சுருக்குதல், மீ.பொ.வ, விகிதம் & சதவீதம்"
      },
      {
        "id": "exam-tnpsc-grp1-s4",
        "name": "தமிழ்நாடு வரலாறு, பண்பாடு & நிர்வாகம் (Unit 8 & 9)",
        "completed": 0,
        "total": 60,
        "icon": "🏛️",
        "color": "#f59e0b",
        "currentChapter": "அலகு 8: திருக்குறள் & விடுதலைப் போராட்டத்தில் தமிழகம்"
      }
    ],
    "tasks": [
      {
        "title": "Polity: Preamble Philosophy & Basic Structure Doctrine",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Preamble Philosophy & Basic Structure Doctrine",
        "rawSubject": "Polity",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Unit 8: Thirukkural Couplets on Statecraft & Ethics",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Thirukkural Couplets on Statecraft & Ethics",
        "rawSubject": "Unit 8",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "Aptitude: Percentage & Ratio Speed Shortcuts",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "Percentage & Ratio Speed Shortcuts",
        "rawSubject": "Aptitude",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Daily 15-Question Prelims Mock Drill",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "Daily 15-Question Prelims Mock Drill",
        "rawSubject": "Hands-On & Recap",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "Group 1 Officer Master Medal",
    "milestoneDesc": "Complete the rigorous program syllabus and build rock-solid mastery.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "exam-tnpsc-grp2",
    "category": "tnpsc",
    "gradeLevel": "exam",
    "title": "TNPSC Group 2 & 2A — Sub-Registrar & Municipal Commissioner",
    "subtitle": "360-Day Comprehensive Professional Master Program",
    "short": "TNPSC Group 2 & 2A",
    "medium": "Bilingual",
    "board": "National",
    "totalDays": 360,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "Group 2 Officer",
    "badgeColor": "#10b981",
    "phaseTitle": "Phase 1: Foundation, Advanced Core & Mock Tests",
    "phaseSub": "Day 1 of 360 • Daily Routine & Problem Solving",
    "subjects": [
      {
        "id": "exam-tnpsc-grp2-s1",
        "name": "பொதுத்தமிழ் & தமிழ் அறிஞர்கள் (100 வினாக்கள்)",
        "completed": 1,
        "total": 60,
        "icon": "📜",
        "color": "#ec4899",
        "currentChapter": "பகுதி அ: இலக்கணம், இலக்கியம் & அறிஞர்கள்"
      },
      {
        "id": "exam-tnpsc-grp2-s2",
        "name": "இந்திய அரசியலமைப்பு & சட்டங்கள் (Polity)",
        "completed": 1,
        "total": 60,
        "icon": "⚖️",
        "color": "#06b6d4",
        "currentChapter": "அலகு 1: முகப்புரை, அடிப்படை உரிமைகள் & நாடாளுமன்றம்"
      },
      {
        "id": "exam-tnpsc-grp2-s3",
        "name": "கணிதம் & திறனறிவு (Aptitude & Mental Ability 25/25)",
        "completed": 0,
        "total": 60,
        "icon": "🔢",
        "color": "#10b981",
        "currentChapter": "அலகு 1: சுருக்குதல், மீ.பொ.வ, விகிதம் & சதவீதம்"
      },
      {
        "id": "exam-tnpsc-grp2-s4",
        "name": "தமிழ்நாடு வரலாறு, பண்பாடு & நிர்வாகம் (Unit 8 & 9)",
        "completed": 0,
        "total": 60,
        "icon": "🏛️",
        "color": "#f59e0b",
        "currentChapter": "அலகு 8: திருக்குறள் & விடுதலைப் போராட்டத்தில் தமிழகம்"
      }
    ],
    "tasks": [
      {
        "title": "பொதுத்தமிழ்: பொருத்துதல் - பொருத்தமான பொருள் தேர்வு",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "பொருத்துதல் - பொருத்தமான பொருள் தேர்வு",
        "rawSubject": "பொதுத்தமிழ்",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "General Studies: இந்திய அரசியலமைப்பு வரைவுக்குழு வரலாறு",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "இந்திய அரசியலமைப்பு வரைவுக்குழு வரலாறு",
        "rawSubject": "General Studies",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "கணிதம்: காலமும் வேலையும் (Time & Work) குறுக்குவழிகள்",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "காலமும் வேலையும் (Time & Work) குறுக்குவழிகள்",
        "rawSubject": "கணிதம்",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "OMR மாதிரித் தேர்வு: 25 வினாக்கள் தினசரி",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "25 வினாக்கள் தினசரி",
        "rawSubject": "OMR மாதிரித் தேர்வு",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "Group 2 Officer Master Medal",
    "milestoneDesc": "Complete the rigorous program syllabus and build rock-solid mastery.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "exam-tnpsc-grp4",
    "category": "tnpsc",
    "gradeLevel": "exam",
    "title": "TNPSC Group 4 & VAO — 200/200 Full Master Course",
    "subtitle": "360-Day Comprehensive Professional Master Program",
    "short": "TNPSC Group 4 & VAO",
    "medium": "Tamil",
    "board": "National",
    "totalDays": 360,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "VAO Target 185+",
    "badgeColor": "#10b981",
    "phaseTitle": "Phase 1: Foundation, Advanced Core & Mock Tests",
    "phaseSub": "Day 1 of 360 • Daily Routine & Problem Solving",
    "subjects": [
      {
        "id": "exam-tnpsc-grp4-s1",
        "name": "பொதுத்தமிழ் & தமிழ் அறிஞர்கள் (100 வினாக்கள்)",
        "completed": 1,
        "total": 60,
        "icon": "📜",
        "color": "#ec4899",
        "currentChapter": "பகுதி அ: இலக்கணம், இலக்கியம் & அறிஞர்கள்"
      },
      {
        "id": "exam-tnpsc-grp4-s2",
        "name": "இந்திய அரசியலமைப்பு & சட்டங்கள் (Polity)",
        "completed": 1,
        "total": 60,
        "icon": "⚖️",
        "color": "#06b6d4",
        "currentChapter": "அலகு 1: முகப்புரை, அடிப்படை உரிமைகள் & நாடாளுமன்றம்"
      },
      {
        "id": "exam-tnpsc-grp4-s3",
        "name": "கணிதம் & திறனறிவு (Aptitude & Mental Ability 25/25)",
        "completed": 0,
        "total": 60,
        "icon": "🔢",
        "color": "#10b981",
        "currentChapter": "அலகு 1: சுருக்குதல், மீ.பொ.வ, விகிதம் & சதவீதம்"
      },
      {
        "id": "exam-tnpsc-grp4-s4",
        "name": "தமிழ்நாடு வரலாறு, பண்பாடு & நிர்வாகம் (Unit 8 & 9)",
        "completed": 0,
        "total": 60,
        "icon": "🏛️",
        "color": "#f59e0b",
        "currentChapter": "அலகு 8: திருக்குறள் & விடுதலைப் போராட்டத்தில் தமிழகம்"
      }
    ],
    "tasks": [
      {
        "title": "பொதுத்தமிழ்: 6-ஆம் வகுப்பு தமிழ் இயல் 1 செய்யுள் & இலக்கணம்",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "6-ஆம் வகுப்பு தமிழ் இயல் 1 செய்யுள் & இலக்கணம்",
        "rawSubject": "பொதுத்தமிழ்",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "அரசியலமைப்பு: முகவுரை, 22 பகுதிகள், 12 அட்டவணைகள்",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "முகவுரை, 22 பகுதிகள், 12 அட்டவணைகள்",
        "rawSubject": "அரசியலமைப்பு",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "கணிதம்: சுருக்குக (BODMAS) & விழுக்காடு 5 நொடித் தீர்வுகள்",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "சுருக்குக (BODMAS) & விழுக்காடு 5 நொடித் தீர்வுகள்",
        "rawSubject": "கணிதம்",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "தினசரி மாதிரித் தேர்வு: 25 OMR வினாக்கள்",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "25 OMR வினாக்கள்",
        "rawSubject": "தினசரி மாதிரித் தேர்வு",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "VAO Target 185+ Master Medal",
    "milestoneDesc": "Complete the rigorous program syllabus and build rock-solid mastery.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "exam-tnpsc-deo",
    "category": "tnpsc",
    "gradeLevel": "exam",
    "title": "TNPSC DEO & Executive Officer (EO Grade 1-4)",
    "subtitle": "360-Day Comprehensive Professional Master Program",
    "short": "TNPSC DEO & Executive Officer (EO Grade 1-4)",
    "medium": "Tamil",
    "board": "National",
    "totalDays": 360,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "TNPSC Executive Officer",
    "badgeColor": "#f59e0b",
    "phaseTitle": "Phase 1: Foundation, Advanced Core & Mock Tests",
    "phaseSub": "Day 1 of 360 • Daily Routine & Problem Solving",
    "subjects": [
      {
        "id": "exam-tnpsc-deo-s1",
        "name": "பொதுத்தமிழ் & தமிழ் அறிஞர்கள் (100 வினாக்கள்)",
        "completed": 1,
        "total": 60,
        "icon": "📜",
        "color": "#ec4899",
        "currentChapter": "பகுதி அ: இலக்கணம், இலக்கியம் & அறிஞர்கள்"
      },
      {
        "id": "exam-tnpsc-deo-s2",
        "name": "இந்திய அரசியலமைப்பு & சட்டங்கள் (Polity)",
        "completed": 1,
        "total": 60,
        "icon": "⚖️",
        "color": "#06b6d4",
        "currentChapter": "அலகு 1: முகப்புரை, அடிப்படை உரிமைகள் & நாடாளுமன்றம்"
      },
      {
        "id": "exam-tnpsc-deo-s3",
        "name": "கணிதம் & திறனறிவு (Aptitude & Mental Ability 25/25)",
        "completed": 0,
        "total": 60,
        "icon": "🔢",
        "color": "#10b981",
        "currentChapter": "அலகு 1: சுருக்குதல், மீ.பொ.வ, விகிதம் & சதவீதம்"
      },
      {
        "id": "exam-tnpsc-deo-s4",
        "name": "தமிழ்நாடு வரலாறு, பண்பாடு & நிர்வாகம் (Unit 8 & 9)",
        "completed": 0,
        "total": 60,
        "icon": "🏛️",
        "color": "#f59e0b",
        "currentChapter": "அலகு 8: திருக்குறள் & விடுதலைப் போராட்டத்தில் தமிழகம்"
      }
    ],
    "tasks": [
      {
        "title": "இந்து மதம்: சைவ சித்தாந்தத்தின் முப்பொருள் உண்மை",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "சைவ சித்தாந்தத்தின் முப்பொருள் உண்மை",
        "rawSubject": "இந்து மதம்",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "HR&CE சட்டம்: 1959-ஆம் ஆண்டு அறநிலையச் சட்டம் முக்கிய பிரிவுகள்",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "1959-ஆம் ஆண்டு அறநிலையச் சட்டம் முக்கிய பிரிவுகள்",
        "rawSubject": "HR&CE சட்டம்",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "பொது அறிவு: அரசியலமைப்பு சமய சுதந்திர உரிமை (25-28)",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "அரசியலமைப்பு சமய சுதந்திர உரிமை (25-28)",
        "rawSubject": "பொது அறிவு",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "மாதிரித் தேர்வு: 25 சிறப்பு வினாக்கள்",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "25 சிறப்பு வினாக்கள்",
        "rawSubject": "மாதிரித் தேர்வு",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "TNPSC Executive Officer Master Medal",
    "milestoneDesc": "Complete the rigorous program syllabus and build rock-solid mastery.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "exam-tnpsc-si",
    "category": "tnpsc",
    "gradeLevel": "exam",
    "title": "TNUSRB Police Sub-Inspector (SI) & Constable Exam Prep",
    "subtitle": "360-Day Comprehensive Professional Master Program",
    "short": "TNUSRB Police Sub-Inspector (SI) & Constable Exam Prep",
    "medium": "Tamil",
    "board": "National",
    "totalDays": 360,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "Police SI Target",
    "badgeColor": "#06b6d4",
    "phaseTitle": "Phase 1: Foundation, Advanced Core & Mock Tests",
    "phaseSub": "Day 1 of 360 • Daily Routine & Problem Solving",
    "subjects": [
      {
        "id": "exam-tnpsc-si-s1",
        "name": "பொதுத்தமிழ் & தமிழ் அறிஞர்கள் (100 வினாக்கள்)",
        "completed": 1,
        "total": 60,
        "icon": "📜",
        "color": "#ec4899",
        "currentChapter": "பகுதி அ: இலக்கணம், இலக்கியம் & அறிஞர்கள்"
      },
      {
        "id": "exam-tnpsc-si-s2",
        "name": "இந்திய அரசியலமைப்பு & சட்டங்கள் (Polity)",
        "completed": 1,
        "total": 60,
        "icon": "⚖️",
        "color": "#06b6d4",
        "currentChapter": "அலகு 1: முகப்புரை, அடிப்படை உரிமைகள் & நாடாளுமன்றம்"
      },
      {
        "id": "exam-tnpsc-si-s3",
        "name": "கணிதம் & திறனறிவு (Aptitude & Mental Ability 25/25)",
        "completed": 0,
        "total": 60,
        "icon": "🔢",
        "color": "#10b981",
        "currentChapter": "அலகு 1: சுருக்குதல், மீ.பொ.வ, விகிதம் & சதவீதம்"
      },
      {
        "id": "exam-tnpsc-si-s4",
        "name": "தமிழ்நாடு வரலாறு, பண்பாடு & நிர்வாகம் (Unit 8 & 9)",
        "completed": 0,
        "total": 60,
        "icon": "🏛️",
        "color": "#f59e0b",
        "currentChapter": "அலகு 8: திருக்குறள் & விடுதலைப் போராட்டத்தில் தமிழகம்"
      }
    ],
    "tasks": [
      {
        "title": "உளவியல்: எண் தொடர் வரிசை & விடுபட்ட எண்கள் குறுக்குவழிகள்",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "எண் தொடர் வரிசை & விடுபட்ட எண்கள் குறுக்குவழிகள்",
        "rawSubject": "உளவியல்",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "அறிவியல்: நியூட்டனின் இயக்க விதிகள் & முடுக்கம் சமன்பாடுகள்",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "நியூட்டனின் இயக்க விதிகள் & முடுக்கம் சமன்பாடுகள்",
        "rawSubject": "அறிவியல்",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "பொது அறிவு: அரசியலமைப்பு அடிப்படை உரிமைகள் & காவல்துறை",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "அரசியலமைப்பு அடிப்படை உரிமைகள் & காவல்துறை",
        "rawSubject": "பொது அறிவு",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "மாதிரித் தேர்வு: 30 வினாடிகள் வேக உளவியல் தேர்வு",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "30 வினாடிகள் வேக உளவியல் தேர்வு",
        "rawSubject": "மாதிரித் தேர்வு",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "Police SI Target Master Medal",
    "milestoneDesc": "Complete the rigorous program syllabus and build rock-solid mastery.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "exam-upsc-ias",
    "category": "upsc_central",
    "gradeLevel": "exam",
    "title": "UPSC Civil Services (IAS / IPS / IFS) Prelims + Mains",
    "subtitle": "360-Day Comprehensive Professional Master Program",
    "short": "UPSC Civil Services (IAS / IPS / IFS) Prelims + Mains",
    "medium": "English",
    "board": "National",
    "totalDays": 360,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "IAS Blueprint",
    "badgeColor": "#8b5cf6",
    "phaseTitle": "Phase 1: Foundation, Advanced Core & Mock Tests",
    "phaseSub": "Day 1 of 360 • Daily Routine & Problem Solving",
    "subjects": [
      {
        "id": "exam-upsc-ias-s1",
        "name": "Indian Polity, Governance & Constitution (GS-2)",
        "completed": 1,
        "total": 60,
        "icon": "⚖️",
        "color": "#06b6d4",
        "currentChapter": "Module 1: Constitutional Framework & Judiciary"
      },
      {
        "id": "exam-upsc-ias-s2",
        "name": "Modern Indian History & Art and Culture (GS-1)",
        "completed": 1,
        "total": 60,
        "icon": "🏛️",
        "color": "#10b981",
        "currentChapter": "Module 1: Freedom Struggle & Cultural Heritage"
      },
      {
        "id": "exam-upsc-ias-s3",
        "name": "Indian Economy & Sustainable Development (GS-3)",
        "completed": 0,
        "total": 60,
        "icon": "📈",
        "color": "#f59e0b",
        "currentChapter": "Module 1: National Income, Banking & Budgeting"
      },
      {
        "id": "exam-upsc-ias-s4",
        "name": "CSAT Reasoning, Quantitative Aptitude & PYQs",
        "completed": 0,
        "total": 60,
        "icon": "🎯",
        "color": "#ec4899",
        "currentChapter": "Module 1: Comprehension & Logical Deductions"
      }
    ],
    "tasks": [
      {
        "title": "Polity: Preamble - Sovereign, Socialist, Secular Keywords",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Preamble - Sovereign, Socialist, Secular Keywords",
        "rawSubject": "Polity",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Modern History: Causes and Nature of Revolt of 1857",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Causes and Nature of Revolt of 1857",
        "rawSubject": "Modern History",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "Economy: Real vs Nominal GDP & Deflator Calculations",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "Real vs Nominal GDP & Deflator Calculations",
        "rawSubject": "Economy",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Daily Answer Writing: 150-Word Mains Question",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "150-Word Mains Question",
        "rawSubject": "Daily Answer Writing",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "IAS Blueprint Master Medal",
    "milestoneDesc": "Complete the rigorous program syllabus and build rock-solid mastery.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "exam-ssc-cgl",
    "category": "upsc_central",
    "gradeLevel": "exam",
    "title": "SSC CGL & CHSL — Combined Graduate Level Full Course",
    "subtitle": "360-Day Comprehensive Professional Master Program",
    "short": "SSC CGL & CHSL",
    "medium": "English",
    "board": "National",
    "totalDays": 360,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "SSC Inspector",
    "badgeColor": "#06b6d4",
    "phaseTitle": "Phase 1: Foundation, Advanced Core & Mock Tests",
    "phaseSub": "Day 1 of 360 • Daily Routine & Problem Solving",
    "subjects": [
      {
        "id": "exam-ssc-cgl-s1",
        "name": "Indian Polity, Governance & Constitution (GS-2)",
        "completed": 1,
        "total": 60,
        "icon": "⚖️",
        "color": "#06b6d4",
        "currentChapter": "Module 1: Constitutional Framework & Judiciary"
      },
      {
        "id": "exam-ssc-cgl-s2",
        "name": "Modern Indian History & Art and Culture (GS-1)",
        "completed": 1,
        "total": 60,
        "icon": "🏛️",
        "color": "#10b981",
        "currentChapter": "Module 1: Freedom Struggle & Cultural Heritage"
      },
      {
        "id": "exam-ssc-cgl-s3",
        "name": "Indian Economy & Sustainable Development (GS-3)",
        "completed": 0,
        "total": 60,
        "icon": "📈",
        "color": "#f59e0b",
        "currentChapter": "Module 1: National Income, Banking & Budgeting"
      },
      {
        "id": "exam-ssc-cgl-s4",
        "name": "CSAT Reasoning, Quantitative Aptitude & PYQs",
        "completed": 0,
        "total": 60,
        "icon": "🎯",
        "color": "#ec4899",
        "currentChapter": "Module 1: Comprehension & Logical Deductions"
      }
    ],
    "tasks": [
      {
        "title": "Quantitative Aptitude: Percentage Calculation Speed Shortcuts",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Percentage Calculation Speed Shortcuts",
        "rawSubject": "Quantitative Aptitude",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Reasoning: Syllogisms - 100% Accuracy Venn Diagram",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Syllogisms - 100% Accuracy Venn Diagram",
        "rawSubject": "Reasoning",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "English: Subject-Verb Agreement 10 Golden Rules",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "Subject-Verb Agreement 10 Golden Rules",
        "rawSubject": "English",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Daily 25-Question Timed Tier-1 Simulation Test",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "Daily 25-Question Timed Tier-1 Simulation Test",
        "rawSubject": "Hands-On & Recap",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "SSC Inspector Master Medal",
    "milestoneDesc": "Complete the rigorous program syllabus and build rock-solid mastery.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "exam-bank-po",
    "category": "upsc_central",
    "gradeLevel": "exam",
    "title": "Bank PO & Clerk (IBPS, SBI, RBI Grade B)",
    "subtitle": "360-Day Comprehensive Professional Master Program",
    "short": "Bank PO & Clerk (IBPS, SBI, RBI Grade B)",
    "medium": "English",
    "board": "National",
    "totalDays": 360,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "Bank PO Candidate",
    "badgeColor": "#10b981",
    "phaseTitle": "Phase 1: Foundation, Advanced Core & Mock Tests",
    "phaseSub": "Day 1 of 360 • Daily Routine & Problem Solving",
    "subjects": [
      {
        "id": "exam-bank-po-s1",
        "name": "Indian Polity, Governance & Constitution (GS-2)",
        "completed": 1,
        "total": 60,
        "icon": "⚖️",
        "color": "#06b6d4",
        "currentChapter": "Module 1: Constitutional Framework & Judiciary"
      },
      {
        "id": "exam-bank-po-s2",
        "name": "Modern Indian History & Art and Culture (GS-1)",
        "completed": 1,
        "total": 60,
        "icon": "🏛️",
        "color": "#10b981",
        "currentChapter": "Module 1: Freedom Struggle & Cultural Heritage"
      },
      {
        "id": "exam-bank-po-s3",
        "name": "Indian Economy & Sustainable Development (GS-3)",
        "completed": 0,
        "total": 60,
        "icon": "📈",
        "color": "#f59e0b",
        "currentChapter": "Module 1: National Income, Banking & Budgeting"
      },
      {
        "id": "exam-bank-po-s4",
        "name": "CSAT Reasoning, Quantitative Aptitude & PYQs",
        "completed": 0,
        "total": 60,
        "icon": "🎯",
        "color": "#ec4899",
        "currentChapter": "Module 1: Comprehension & Logical Deductions"
      }
    ],
    "tasks": [
      {
        "title": "Data Interpretation: Tabular DI with Percentages",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Tabular DI with Percentages",
        "rawSubject": "Data Interpretation",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Reasoning: 8-Person Circular Seating Arrangement",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "8-Person Circular Seating Arrangement",
        "rawSubject": "Reasoning",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "Banking Awareness: RBI Monetary Policy Tools (Repo/CRR)",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "RBI Monetary Policy Tools (Repo/CRR)",
        "rawSubject": "Banking Awareness",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Daily 20-Minute Speed Math Sprint",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "Daily 20-Minute Speed Math Sprint",
        "rawSubject": "Hands-On & Recap",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "Bank PO Candidate Master Medal",
    "milestoneDesc": "Complete the rigorous program syllabus and build rock-solid mastery.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "exam-neet-ug",
    "category": "entrance",
    "gradeLevel": "exam",
    "title": "NEET UG Medical Entrance — Target 680+/720",
    "subtitle": "360-Day Comprehensive Professional Master Program",
    "short": "NEET UG Medical Entrance",
    "medium": "English",
    "board": "National",
    "totalDays": 360,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "AIIMS Doctor Target",
    "badgeColor": "#ec4899",
    "phaseTitle": "Phase 1: Foundation, Advanced Core & Mock Tests",
    "phaseSub": "Day 1 of 360 • Daily Routine & Problem Solving",
    "subjects": [
      {
        "id": "exam-neet-ug-s1",
        "name": "NEET Biology (Botany & Zoology 360/360)",
        "completed": 1,
        "total": 60,
        "icon": "🧬",
        "color": "#10b981",
        "currentChapter": "Unit 1: Diversity in Living World & Genetics"
      },
      {
        "id": "exam-neet-ug-s2",
        "name": "NEET Physics (Mechanics, Waves & Modern Physics)",
        "completed": 1,
        "total": 60,
        "icon": "⚡",
        "color": "#06b6d4",
        "currentChapter": "Unit 1: Kinematics, Laws of Motion & Optics"
      },
      {
        "id": "exam-neet-ug-s3",
        "name": "NEET Chemistry (Physical, Organic & Inorganic)",
        "completed": 0,
        "total": 60,
        "icon": "🧪",
        "color": "#f59e0b",
        "currentChapter": "Unit 1: Chemical Bonding & Reaction Mechanisms"
      },
      {
        "id": "exam-neet-ug-s4",
        "name": "NEET Speed Drills, High-Yield PYQs & OMR Mocks",
        "completed": 0,
        "total": 60,
        "icon": "🎯",
        "color": "#ec4899",
        "currentChapter": "Unit 1: NCERT Line-by-Line Mock Drills"
      }
    ],
    "tasks": [
      {
        "title": "Biology: NCERT Line-by-Line Breakdown of Living World",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "NCERT Line-by-Line Breakdown of Living World",
        "rawSubject": "Biology",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Physics: Projectile Motion Derivations & Range Formulas",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Projectile Motion Derivations & Range Formulas",
        "rawSubject": "Physics",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "Chemistry: Stoichiometry & Limiting Reagent Numericals",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "Stoichiometry & Limiting Reagent Numericals",
        "rawSubject": "Chemistry",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Daily 20-Question NEET Mock Test (-1 Negative Marking)",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "Daily 20-Question NEET Mock Test (-1 Negative Marking)",
        "rawSubject": "Hands-On & Recap",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "AIIMS Doctor Target Master Medal",
    "milestoneDesc": "Complete the rigorous program syllabus and build rock-solid mastery.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "exam-jee-main",
    "category": "entrance",
    "gradeLevel": "exam",
    "title": "JEE Main & Advanced Engineering — Target 99.5%ile",
    "subtitle": "360-Day Comprehensive Professional Master Program",
    "short": "JEE Main & Advanced Engineering",
    "medium": "English",
    "board": "National",
    "totalDays": 360,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "IITian Target 99.5%",
    "badgeColor": "#06b6d4",
    "phaseTitle": "Phase 1: Foundation, Advanced Core & Mock Tests",
    "phaseSub": "Day 1 of 360 • Daily Routine & Problem Solving",
    "subjects": [
      {
        "id": "exam-jee-main-s1",
        "name": "JEE Mathematics (Calculus, Coordinate & Algebra)",
        "completed": 1,
        "total": 60,
        "icon": "📐",
        "color": "#06b6d4",
        "currentChapter": "Unit 1: Functions, Limits & Coordinate Geometry"
      },
      {
        "id": "exam-jee-main-s2",
        "name": "JEE Physics (Mechanics, Electrodynamics & Thermo)",
        "completed": 1,
        "total": 60,
        "icon": "⚡",
        "color": "#10b981",
        "currentChapter": "Unit 1: Rotational Dynamics & Electromagnetism"
      },
      {
        "id": "exam-jee-main-s3",
        "name": "JEE Chemistry (Thermodynamics, Organic & Inorganic)",
        "completed": 0,
        "total": 60,
        "icon": "🧪",
        "color": "#f59e0b",
        "currentChapter": "Unit 1: Chemical Equilibrium & Organic Synthesis"
      },
      {
        "id": "exam-jee-main-s4",
        "name": "JEE NTA Numerical Type & Advanced Problem Solving",
        "completed": 0,
        "total": 60,
        "icon": "🎯",
        "color": "#ec4899",
        "currentChapter": "Unit 1: Speed Drills & 20-Year PYQs"
      }
    ],
    "tasks": [
      {
        "title": "Mathematics: Straight Lines - Distance of Point from Line",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Straight Lines - Distance of Point from Line",
        "rawSubject": "Mathematics",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Physics: Constrained Motion, Pseudo Force & Pulleys",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Constrained Motion, Pseudo Force & Pulleys",
        "rawSubject": "Physics",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "Chemistry: VSEPR Theory, Hybridization & MOT",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "VSEPR Theory, Hybridization & MOT",
        "rawSubject": "Chemistry",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Daily 10-Question JEE Advanced Problem Sprint",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "Daily 10-Question JEE Advanced Problem Sprint",
        "rawSubject": "Hands-On & Recap",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "IITian Target 99.5% Master Medal",
    "milestoneDesc": "Complete the rigorous program syllabus and build rock-solid mastery.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "degree-btech-cse",
    "category": "college_degree",
    "gradeLevel": "college",
    "title": "B.Tech Computer Science & Engineering (CSE Core)",
    "subtitle": "360-Day Comprehensive Professional Master Program",
    "short": "B.Tech Computer Science & Engineering (CSE Core)",
    "medium": "English",
    "board": "National",
    "totalDays": 360,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "B.Tech CSE Core",
    "badgeColor": "#06b6d4",
    "phaseTitle": "Phase 1: Foundation, Advanced Core & Mock Tests",
    "phaseSub": "Day 1 of 360 • Daily Routine & Problem Solving",
    "subjects": [
      {
        "id": "degree-btech-cse-s1",
        "name": "Data Structures, Algorithms & Problem Solving (DSA)",
        "completed": 1,
        "total": 40,
        "icon": "💻",
        "color": "#06b6d4",
        "currentChapter": "Module 1: Arrays, Linked Lists & Dynamic Programming"
      },
      {
        "id": "degree-btech-cse-s2",
        "name": "Database Systems (DBMS, SQL & NoSQL Architecture)",
        "completed": 1,
        "total": 40,
        "icon": "🗄️",
        "color": "#10b981",
        "currentChapter": "Module 1: Relational Schema & Query Optimization"
      },
      {
        "id": "degree-btech-cse-s3",
        "name": "Operating Systems & Computer Networks (OS & CN)",
        "completed": 0,
        "total": 40,
        "icon": "🌐",
        "color": "#f59e0b",
        "currentChapter": "Module 1: Concurrency, TCP/IP & Socket Programming"
      },
      {
        "id": "degree-btech-cse-s4",
        "name": "Artificial Intelligence, Cloud & System Design",
        "completed": 0,
        "total": 40,
        "icon": "🤖",
        "color": "#ec4899",
        "currentChapter": "Module 1: Scalable Architectures & ML Pipelines"
      }
    ],
    "tasks": [
      {
        "title": "DSA: Big-O, Big-Omega, Big-Theta Asymptotic Analysis",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Big-O, Big-Omega, Big-Theta Asymptotic Analysis",
        "rawSubject": "DSA",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "OS: CPU Scheduling Algorithms (FCFS, SJF, Round Robin)",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "CPU Scheduling Algorithms (FCFS, SJF, Round Robin)",
        "rawSubject": "OS",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "DBMS: 1NF, 2NF, 3NF, BCNF Normalization Proofs",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "1NF, 2NF, 3NF, BCNF Normalization Proofs",
        "rawSubject": "DBMS",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Hands-On Coding: Implement LRU Cache in C++/Python",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "Implement LRU Cache in C++/Python",
        "rawSubject": "Hands-On Coding",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "B.Tech CSE Core Master Medal",
    "milestoneDesc": "Complete the rigorous program syllabus and build rock-solid mastery.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "degree-btech-aids",
    "category": "college_degree",
    "gradeLevel": "college",
    "title": "B.Tech Artificial Intelligence & Data Science",
    "subtitle": "360-Day Comprehensive Professional Master Program",
    "short": "B.Tech Artificial Intelligence & Data Science",
    "medium": "English",
    "board": "National",
    "totalDays": 360,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "AI Data Scientist",
    "badgeColor": "#ec4899",
    "phaseTitle": "Phase 1: Foundation, Advanced Core & Mock Tests",
    "phaseSub": "Day 1 of 360 • Daily Routine & Problem Solving",
    "subjects": [
      {
        "id": "degree-btech-aids-s1",
        "name": "Data Structures, Algorithms & Problem Solving (DSA)",
        "completed": 1,
        "total": 40,
        "icon": "💻",
        "color": "#06b6d4",
        "currentChapter": "Module 1: Arrays, Linked Lists & Dynamic Programming"
      },
      {
        "id": "degree-btech-aids-s2",
        "name": "Database Systems (DBMS, SQL & NoSQL Architecture)",
        "completed": 1,
        "total": 40,
        "icon": "🗄️",
        "color": "#10b981",
        "currentChapter": "Module 1: Relational Schema & Query Optimization"
      },
      {
        "id": "degree-btech-aids-s3",
        "name": "Operating Systems & Computer Networks (OS & CN)",
        "completed": 0,
        "total": 40,
        "icon": "🌐",
        "color": "#f59e0b",
        "currentChapter": "Module 1: Concurrency, TCP/IP & Socket Programming"
      },
      {
        "id": "degree-btech-aids-s4",
        "name": "Artificial Intelligence, Cloud & System Design",
        "completed": 0,
        "total": 40,
        "icon": "🤖",
        "color": "#ec4899",
        "currentChapter": "Module 1: Scalable Architectures & ML Pipelines"
      }
    ],
    "tasks": [
      {
        "title": "Mathematics: Eigenvalues, Eigenvectors & PCA for ML",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Eigenvalues, Eigenvectors & PCA for ML",
        "rawSubject": "Mathematics",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "ML: Mathematical Derivation of Gradient Descent Optimizer",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Mathematical Derivation of Gradient Descent Optimizer",
        "rawSubject": "ML",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "Python Lab: Linear Regression from Scratch without Sklearn",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "Linear Regression from Scratch without Sklearn",
        "rawSubject": "Python Lab",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Project Sprint: Train Cancer Classifier (98% ROC-AUC)",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "Train Cancer Classifier (98% ROC-AUC)",
        "rawSubject": "Project Sprint",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "AI Data Scientist Master Medal",
    "milestoneDesc": "Complete the rigorous program syllabus and build rock-solid mastery.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "degree-bcom-gen",
    "category": "college_degree",
    "gradeLevel": "college",
    "title": "B.Com — Bachelor of Commerce (General & CA Foundation)",
    "subtitle": "360-Day Comprehensive Professional Master Program",
    "short": "B.Com",
    "medium": "English",
    "board": "National",
    "totalDays": 360,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "B.Com Professional",
    "badgeColor": "#10b981",
    "phaseTitle": "Phase 1: Foundation, Advanced Core & Mock Tests",
    "phaseSub": "Day 1 of 360 • Daily Routine & Problem Solving",
    "subjects": [
      {
        "id": "degree-bcom-gen-s1",
        "name": "Corporate Accounting & Financial Management",
        "completed": 1,
        "total": 40,
        "icon": "📊",
        "color": "#06b6d4",
        "currentChapter": "Module 1: Corporate Accounts & Valuation"
      },
      {
        "id": "degree-bcom-gen-s2",
        "name": "Business Law, Taxation & Company Compliance",
        "completed": 1,
        "total": 40,
        "icon": "⚖️",
        "color": "#10b981",
        "currentChapter": "Module 1: Indian Companies Act & GST"
      },
      {
        "id": "degree-bcom-gen-s3",
        "name": "Marketing Management & Strategic Business",
        "completed": 0,
        "total": 40,
        "icon": "💼",
        "color": "#f59e0b",
        "currentChapter": "Module 1: Brand Strategy & Operations"
      },
      {
        "id": "degree-bcom-gen-s4",
        "name": "Financial Analytics, Excel Modeling & Case Studies",
        "completed": 0,
        "total": 40,
        "icon": "💻",
        "color": "#ec4899",
        "currentChapter": "Module 1: Practical Financial Modeling"
      }
    ],
    "tasks": [
      {
        "title": "Accounting: Issue of Shares at Premium & Forfeiture Entries",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Issue of Shares at Premium & Forfeiture Entries",
        "rawSubject": "Accounting",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Business Law: Essential Elements of Valid Contract 1872",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Essential Elements of Valid Contract 1872",
        "rawSubject": "Business Law",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "Taxation: Residential Status & Scope of Total Income",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "Residential Status & Scope of Total Income",
        "rawSubject": "Taxation",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Case Study: Corporate Financial Ratio Analysis",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "Corporate Financial Ratio Analysis",
        "rawSubject": "Case Study",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "B.Com Professional Master Medal",
    "milestoneDesc": "Complete the rigorous program syllabus and build rock-solid mastery.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "degree-bca-cs",
    "category": "college_degree",
    "gradeLevel": "college",
    "title": "BCA — Bachelor of Computer Applications",
    "subtitle": "360-Day Comprehensive Professional Master Program",
    "short": "BCA",
    "medium": "English",
    "board": "National",
    "totalDays": 360,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "BCA Tech Major",
    "badgeColor": "#6366f1",
    "phaseTitle": "Phase 1: Foundation, Advanced Core & Mock Tests",
    "phaseSub": "Day 1 of 360 • Daily Routine & Problem Solving",
    "subjects": [
      {
        "id": "degree-bca-cs-s1",
        "name": "Data Structures, Algorithms & Problem Solving (DSA)",
        "completed": 1,
        "total": 40,
        "icon": "💻",
        "color": "#06b6d4",
        "currentChapter": "Module 1: Arrays, Linked Lists & Dynamic Programming"
      },
      {
        "id": "degree-bca-cs-s2",
        "name": "Database Systems (DBMS, SQL & NoSQL Architecture)",
        "completed": 1,
        "total": 40,
        "icon": "🗄️",
        "color": "#10b981",
        "currentChapter": "Module 1: Relational Schema & Query Optimization"
      },
      {
        "id": "degree-bca-cs-s3",
        "name": "Operating Systems & Computer Networks (OS & CN)",
        "completed": 0,
        "total": 40,
        "icon": "🌐",
        "color": "#f59e0b",
        "currentChapter": "Module 1: Concurrency, TCP/IP & Socket Programming"
      },
      {
        "id": "degree-bca-cs-s4",
        "name": "Artificial Intelligence, Cloud & System Design",
        "completed": 0,
        "total": 40,
        "icon": "🤖",
        "color": "#ec4899",
        "currentChapter": "Module 1: Scalable Architectures & ML Pipelines"
      }
    ],
    "tasks": [
      {
        "title": "Java: Method Overloading vs Overriding & Polymorphism",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Method Overloading vs Overriding & Polymorphism",
        "rawSubject": "Java",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Web: Modern CSS Flexbox & Grid Responsive Layouts",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Modern CSS Flexbox & Grid Responsive Layouts",
        "rawSubject": "Web",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "Database: SQL Joins with Group By Complex Queries",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "SQL Joins with Group By Complex Queries",
        "rawSubject": "Database",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Lab Sprint: Build Auth System with Node & JWT",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "Build Auth System with Node & JWT",
        "rawSubject": "Lab Sprint",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "BCA Tech Major Master Medal",
    "milestoneDesc": "Complete the rigorous program syllabus and build rock-solid mastery.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "degree-bsc-cs",
    "category": "college_degree",
    "gradeLevel": "college",
    "title": "B.Sc Computer Science & Data Analytics",
    "subtitle": "360-Day Comprehensive Professional Master Program",
    "short": "B.Sc Computer Science & Data Analytics",
    "medium": "English",
    "board": "National",
    "totalDays": 360,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "B.Sc CS Graduate",
    "badgeColor": "#10b981",
    "phaseTitle": "Phase 1: Foundation, Advanced Core & Mock Tests",
    "phaseSub": "Day 1 of 360 • Daily Routine & Problem Solving",
    "subjects": [
      {
        "id": "degree-bsc-cs-s1",
        "name": "Data Structures, Algorithms & Problem Solving (DSA)",
        "completed": 1,
        "total": 40,
        "icon": "💻",
        "color": "#06b6d4",
        "currentChapter": "Module 1: Arrays, Linked Lists & Dynamic Programming"
      },
      {
        "id": "degree-bsc-cs-s2",
        "name": "Database Systems (DBMS, SQL & NoSQL Architecture)",
        "completed": 1,
        "total": 40,
        "icon": "🗄️",
        "color": "#10b981",
        "currentChapter": "Module 1: Relational Schema & Query Optimization"
      },
      {
        "id": "degree-bsc-cs-s3",
        "name": "Operating Systems & Computer Networks (OS & CN)",
        "completed": 0,
        "total": 40,
        "icon": "🌐",
        "color": "#f59e0b",
        "currentChapter": "Module 1: Concurrency, TCP/IP & Socket Programming"
      },
      {
        "id": "degree-bsc-cs-s4",
        "name": "Artificial Intelligence, Cloud & System Design",
        "completed": 0,
        "total": 40,
        "icon": "🤖",
        "color": "#ec4899",
        "currentChapter": "Module 1: Scalable Architectures & ML Pipelines"
      }
    ],
    "tasks": [
      {
        "title": "C++: Pointer Arithmetic & Memory Allocation (new/delete)",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Pointer Arithmetic & Memory Allocation (new/delete)",
        "rawSubject": "C++",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "DSA: Singly Linked List Insertion, Deletion & Reversal",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Singly Linked List Insertion, Deletion & Reversal",
        "rawSubject": "DSA",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "Statistics: Normal Distribution Curve & Standard Deviation",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "Normal Distribution Curve & Standard Deviation",
        "rawSubject": "Statistics",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Lab Task: Student Record Management with MySQL",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "Student Record Management with MySQL",
        "rawSubject": "Lab Task",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "B.Sc CS Graduate Master Medal",
    "milestoneDesc": "Complete the rigorous program syllabus and build rock-solid mastery.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "degree-bba",
    "category": "college_degree",
    "gradeLevel": "college",
    "title": "BBA — Bachelor of Business Administration",
    "subtitle": "360-Day Comprehensive Professional Master Program",
    "short": "BBA",
    "medium": "English",
    "board": "National",
    "totalDays": 360,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "BBA Leader",
    "badgeColor": "#f59e0b",
    "phaseTitle": "Phase 1: Foundation, Advanced Core & Mock Tests",
    "phaseSub": "Day 1 of 360 • Daily Routine & Problem Solving",
    "subjects": [
      {
        "id": "degree-bba-s1",
        "name": "Corporate Accounting & Financial Management",
        "completed": 1,
        "total": 40,
        "icon": "📊",
        "color": "#06b6d4",
        "currentChapter": "Module 1: Corporate Accounts & Valuation"
      },
      {
        "id": "degree-bba-s2",
        "name": "Business Law, Taxation & Company Compliance",
        "completed": 1,
        "total": 40,
        "icon": "⚖️",
        "color": "#10b981",
        "currentChapter": "Module 1: Indian Companies Act & GST"
      },
      {
        "id": "degree-bba-s3",
        "name": "Marketing Management & Strategic Business",
        "completed": 0,
        "total": 40,
        "icon": "💼",
        "color": "#f59e0b",
        "currentChapter": "Module 1: Brand Strategy & Operations"
      },
      {
        "id": "degree-bba-s4",
        "name": "Financial Analytics, Excel Modeling & Case Studies",
        "completed": 0,
        "total": 40,
        "icon": "💻",
        "color": "#ec4899",
        "currentChapter": "Module 1: Practical Financial Modeling"
      }
    ],
    "tasks": [
      {
        "title": "Management: Henri Fayol 14 Principles for Modern Tech",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Henri Fayol 14 Principles for Modern Tech",
        "rawSubject": "Management",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Marketing: STP (Segmentation, Targeting, Positioning)",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "STP (Segmentation, Targeting, Positioning)",
        "rawSubject": "Marketing",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "Finance: Time Value of Money - PV & FV Formula Solutions",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "Time Value of Money - PV & FV Formula Solutions",
        "rawSubject": "Finance",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Business Case: Apple Product Strategy & 4Ps Mix",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "Apple Product Strategy & 4Ps Mix",
        "rawSubject": "Business Case",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "BBA Leader Master Medal",
    "milestoneDesc": "Complete the rigorous program syllabus and build rock-solid mastery.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "skill-fullstack-ai",
    "category": "skills",
    "gradeLevel": "skill",
    "title": "Full-Stack Web & Mobile AI Architect (180-Day)",
    "subtitle": "180-Day Comprehensive Professional Master Program",
    "short": "Full-Stack Web & Mobile AI Architect (180-Day)",
    "medium": "English",
    "board": "National",
    "totalDays": 180,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "Senior AI Developer",
    "badgeColor": "#06b6d4",
    "phaseTitle": "Phase 1: Foundation, Advanced Core & Mock Tests",
    "phaseSub": "Day 1 of 180 • Daily Routine & Problem Solving",
    "subjects": [
      {
        "id": "skill-fullstack-ai-s1",
        "name": "Full-Stack Architecture & Modern Frontend (React/Next)",
        "completed": 1,
        "total": 45,
        "icon": "⚛️",
        "color": "#06b6d4",
        "currentChapter": "Module 1: Components, Hooks & State Management"
      },
      {
        "id": "skill-fullstack-ai-s2",
        "name": "Backend Engineering, APIs & Database (Node/Postgres)",
        "completed": 1,
        "total": 45,
        "icon": "🚀",
        "color": "#10b981",
        "currentChapter": "Module 1: RESTful Services & Database Modeling"
      },
      {
        "id": "skill-fullstack-ai-s3",
        "name": "AI Engineering, LLM Integration & LangChain / Agents",
        "completed": 0,
        "total": 45,
        "icon": "🤖",
        "color": "#f59e0b",
        "currentChapter": "Module 1: Prompt Engineering & Vector Embeddings"
      },
      {
        "id": "skill-fullstack-ai-s4",
        "name": "Production DevOps, Docker & Cloud Deployment",
        "completed": 0,
        "total": 45,
        "icon": "☁️",
        "color": "#ec4899",
        "currentChapter": "Module 1: CI/CD Pipelines & Containerization"
      }
    ],
    "tasks": [
      {
        "title": "Architecture: Next.js 15 App Router - Server vs Client",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Next.js 15 App Router - Server vs Client",
        "rawSubject": "Architecture",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Database: Supabase Row Level Security (RLS) Policies",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Supabase Row Level Security (RLS) Policies",
        "rawSubject": "Database",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "Mobile: Expo Router Stack & Tab Navigation with Reanimated",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "Expo Router Stack & Tab Navigation with Reanimated",
        "rawSubject": "Mobile",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Code Challenge: AI Markdown Notes Generator",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "AI Markdown Notes Generator",
        "rawSubject": "Code Challenge",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "Senior AI Developer Master Medal",
    "milestoneDesc": "Complete the rigorous program syllabus and build rock-solid mastery.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "skill-python-ai",
    "category": "skills",
    "gradeLevel": "skill",
    "title": "Python AI, Data Science & Machine Learning (180-Day)",
    "subtitle": "180-Day Comprehensive Professional Master Program",
    "short": "Python AI, Data Science & Machine Learning (180-Day)",
    "medium": "English",
    "board": "National",
    "totalDays": 180,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "Python AI Specialist",
    "badgeColor": "#10b981",
    "phaseTitle": "Phase 1: Foundation, Advanced Core & Mock Tests",
    "phaseSub": "Day 1 of 180 • Daily Routine & Problem Solving",
    "subjects": [
      {
        "id": "skill-python-ai-s1",
        "name": "Full-Stack Architecture & Modern Frontend (React/Next)",
        "completed": 1,
        "total": 45,
        "icon": "⚛️",
        "color": "#06b6d4",
        "currentChapter": "Module 1: Components, Hooks & State Management"
      },
      {
        "id": "skill-python-ai-s2",
        "name": "Backend Engineering, APIs & Database (Node/Postgres)",
        "completed": 1,
        "total": 45,
        "icon": "🚀",
        "color": "#10b981",
        "currentChapter": "Module 1: RESTful Services & Database Modeling"
      },
      {
        "id": "skill-python-ai-s3",
        "name": "AI Engineering, LLM Integration & LangChain / Agents",
        "completed": 0,
        "total": 45,
        "icon": "🤖",
        "color": "#f59e0b",
        "currentChapter": "Module 1: Prompt Engineering & Vector Embeddings"
      },
      {
        "id": "skill-python-ai-s4",
        "name": "Production DevOps, Docker & Cloud Deployment",
        "completed": 0,
        "total": 45,
        "icon": "☁️",
        "color": "#ec4899",
        "currentChapter": "Module 1: CI/CD Pipelines & Containerization"
      }
    ],
    "tasks": [
      {
        "title": "Python: Custom Decorators & Generator Pipelines",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Custom Decorators & Generator Pipelines",
        "rawSubject": "Python",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "NumPy: 100x Speedup with Vectorized Broadcasting",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "100x Speedup with Vectorized Broadcasting",
        "rawSubject": "NumPy",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "ML: Feature Engineering Pipeline with ColumnTransformer",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "Feature Engineering Pipeline with ColumnTransformer",
        "rawSubject": "ML",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Live Coding: Deploy FastAPI Inference Server with Docker",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "Deploy FastAPI Inference Server with Docker",
        "rawSubject": "Live Coding",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "Python AI Specialist Master Medal",
    "milestoneDesc": "Complete the rigorous program syllabus and build rock-solid mastery.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "skill-spoken-english",
    "category": "skills",
    "gradeLevel": "skill",
    "title": "Spoken English & Professional Communication (90-Day)",
    "subtitle": "90-Day Comprehensive Professional Master Program",
    "short": "Spoken English & Professional Communication (90-Day)",
    "medium": "Bilingual",
    "board": "National",
    "totalDays": 90,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "Fluent Speaker",
    "badgeColor": "#14b8a6",
    "phaseTitle": "Phase 1: Foundation, Advanced Core & Mock Tests",
    "phaseSub": "Day 1 of 90 • Daily Routine & Problem Solving",
    "subjects": [
      {
        "id": "skill-spoken-english-s1",
        "name": "Everyday Conversation Fluency & Vocabulary",
        "completed": 1,
        "total": 30,
        "icon": "🗣️",
        "color": "#06b6d4",
        "currentChapter": "Module 1: Sentence Patterns & Daily Conversations"
      },
      {
        "id": "skill-spoken-english-s2",
        "name": "Grammar Without Rules & Natural Phrasing",
        "completed": 1,
        "total": 30,
        "icon": "💬",
        "color": "#10b981",
        "currentChapter": "Module 1: Tenses in Action & Idiomatic Expressions"
      },
      {
        "id": "skill-spoken-english-s3",
        "name": "Accent Neutralization, Pronunciation & Phonics",
        "completed": 0,
        "total": 30,
        "icon": "🎙️",
        "color": "#f59e0b",
        "currentChapter": "Module 1: Syllable Stress & Clear Articulation"
      },
      {
        "id": "skill-spoken-english-s4",
        "name": "Professional Speaking, Presentations & Interviews",
        "completed": 0,
        "total": 30,
        "icon": "👔",
        "color": "#ec4899",
        "currentChapter": "Module 1: Corporate Communication & Email Crafting"
      }
    ],
    "tasks": [
      {
        "title": "Conversation: 5-Minute Self-Introduction with Impact",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "5-Minute Self-Introduction with Impact",
        "rawSubject": "Conversation",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Pronunciation: Common Mispronounced Everyday Words",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Common Mispronounced Everyday Words",
        "rawSubject": "Pronunciation",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "Vocabulary: 10 Powerful Action Verbs in Real Dialogues",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "10 Powerful Action Verbs in Real Dialogues",
        "rawSubject": "Vocabulary",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Speaking Challenge: Record & Review 1-Minute Speech",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "Record & Review 1-Minute Speech",
        "rawSubject": "Speaking Challenge",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "Fluent Speaker Master Medal",
    "milestoneDesc": "Complete the rigorous program syllabus and build rock-solid mastery.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "skill-vedic-maths",
    "category": "kids_skills",
    "gradeLevel": "skill",
    "title": "Vedic Maths & Speed Mental Arithmetic (60-Day Kids Program)",
    "subtitle": "60-Day Comprehensive Professional Master Program",
    "short": "Vedic Maths & Speed Mental Arithmetic (60-Day Kids Program)",
    "medium": "Bilingual",
    "board": "National",
    "totalDays": 60,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "Kids Brain Booster",
    "badgeColor": "#f59e0b",
    "phaseTitle": "Phase 1: Foundation, Advanced Core & Mock Tests",
    "phaseSub": "Day 1 of 60 • Daily Routine & Problem Solving",
    "subjects": [
      {
        "id": "skill-vedic-maths-s1",
        "name": "Vedic Mental Maths / Scratch 3.0 Fundamentals",
        "completed": 1,
        "total": 30,
        "icon": "⚡",
        "color": "#06b6d4",
        "currentChapter": "Module 1: Speed Arithmetic & Sprite Animation"
      },
      {
        "id": "skill-vedic-maths-s2",
        "name": "Interactive Game Creation & Rapid Puzzles",
        "completed": 1,
        "total": 30,
        "icon": "🎮",
        "color": "#10b981",
        "currentChapter": "Module 1: Maze Building & Number Tricks"
      },
      {
        "id": "skill-vedic-maths-s3",
        "name": "Python Turtle Graphics & Visual Loops",
        "completed": 0,
        "total": 30,
        "icon": "🐢",
        "color": "#f59e0b",
        "currentChapter": "Module 1: Geometric Patterns & Algorithms"
      },
      {
        "id": "skill-vedic-maths-s4",
        "name": "Daily Brain Sprint Challenge & Star Badges",
        "completed": 0,
        "total": 30,
        "icon": "🎯",
        "color": "#ec4899",
        "currentChapter": "Module 1: 5-Minute Rapid-Fire Quizzes"
      }
    ],
    "tasks": [
      {
        "title": "Vedic Maths: Ekadhikena Purvena (Squaring Ending in 5)",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Ekadhikena Purvena (Squaring Ending in 5)",
        "rawSubject": "Vedic Maths",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Mental Speed Drill: All From 9 and Last From 10 Trick",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "All From 9 and Last From 10 Trick",
        "rawSubject": "Mental Speed Drill",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "Calculation Challenge: 10 Rapid Mental Arithmetic Qs",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "10 Rapid Mental Arithmetic Qs",
        "rawSubject": "Calculation Challenge",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Bedtime Puzzle: Lightning Math Riddles for Family",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "Lightning Math Riddles for Family",
        "rawSubject": "Bedtime Puzzle",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "Kids Brain Booster Master Medal",
    "milestoneDesc": "Complete the rigorous program syllabus and build rock-solid mastery.",
    "milestoneDaysLeft": 5
  },
  {
    "id": "skill-coding-kids",
    "category": "kids_skills",
    "gradeLevel": "skill",
    "title": "Coding for Kids — Scratch 3.0 & Python AI (90-Day)",
    "subtitle": "90-Day Comprehensive Professional Master Program",
    "short": "Coding for Kids",
    "medium": "English",
    "board": "National",
    "totalDays": 90,
    "currentDayDefault": 1,
    "streakDefault": 1,
    "xpDefault": 50,
    "badge": "Kids Game Creator",
    "badgeColor": "#6366f1",
    "phaseTitle": "Phase 1: Foundation, Advanced Core & Mock Tests",
    "phaseSub": "Day 1 of 90 • Daily Routine & Problem Solving",
    "subjects": [
      {
        "id": "skill-coding-kids-s1",
        "name": "Vedic Mental Maths / Scratch 3.0 Fundamentals",
        "completed": 1,
        "total": 30,
        "icon": "⚡",
        "color": "#06b6d4",
        "currentChapter": "Module 1: Speed Arithmetic & Sprite Animation"
      },
      {
        "id": "skill-coding-kids-s2",
        "name": "Interactive Game Creation & Rapid Puzzles",
        "completed": 1,
        "total": 30,
        "icon": "🎮",
        "color": "#10b981",
        "currentChapter": "Module 1: Maze Building & Number Tricks"
      },
      {
        "id": "skill-coding-kids-s3",
        "name": "Python Turtle Graphics & Visual Loops",
        "completed": 0,
        "total": 30,
        "icon": "🐢",
        "color": "#f59e0b",
        "currentChapter": "Module 1: Geometric Patterns & Algorithms"
      },
      {
        "id": "skill-coding-kids-s4",
        "name": "Daily Brain Sprint Challenge & Star Badges",
        "completed": 0,
        "total": 30,
        "icon": "🎯",
        "color": "#ec4899",
        "currentChapter": "Module 1: 5-Minute Rapid-Fire Quizzes"
      }
    ],
    "tasks": [
      {
        "title": "Scratch 3.0: Sprite Motion, Keyboard Controls & Sounds",
        "subtitle": "Core Concept & Interactive Tutorial",
        "rawTopic": "Sprite Motion, Keyboard Controls & Sounds",
        "rawSubject": "Scratch 3.0",
        "duration": "15 Min",
        "xp": 20,
        "type": "notes"
      },
      {
        "title": "Python Turtle: Drawing Geometric Spirals with Loops",
        "subtitle": "Video Masterclass & Live Walkthrough",
        "rawTopic": "Drawing Geometric Spirals with Loops",
        "rawSubject": "Python Turtle",
        "duration": "12 Min",
        "xp": 20,
        "type": "video"
      },
      {
        "title": "Interactive Story: 2-Character Dialogue in Scratch",
        "subtitle": "Targeted Practice & 5-Question Daily Test",
        "rawTopic": "2-Character Dialogue in Scratch",
        "rawSubject": "Interactive Story",
        "duration": "10 Min",
        "xp": 20,
        "type": "quiz"
      },
      {
        "title": "Creative Project: Build Balloon Pop Video Game",
        "subtitle": "Daily Challenge & Bedtime Summary",
        "rawTopic": "Build Balloon Pop Video Game",
        "rawSubject": "Creative Project",
        "duration": "8 Min",
        "xp": 15,
        "type": "code"
      }
    ],
    "milestoneTitle": "Kids Game Creator Master Medal",
    "milestoneDesc": "Complete the rigorous program syllabus and build rock-solid mastery.",
    "milestoneDaysLeft": 5
  }
];

export const DEFAULT_COURSE: CourseOption = ALL_COURSES.find((c) => c.id === 'tnsb-en-1') || ALL_COURSES[0];
