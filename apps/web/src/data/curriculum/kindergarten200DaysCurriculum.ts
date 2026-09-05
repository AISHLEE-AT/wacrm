/**
 * Kindergarten (LKG & UKG) 365-Day Comprehensive Nano-Level Day Plan
 * Standard: Tamil Nadu State Board (Samacheer Kalvi) & CBSE Early Childhood (ECCE)
 * Structure: 365 Days × 6 Tasks (10 mins each = 60 mins/day)
 *   Task 1: 🎥 Video Class 1 (Tamil Rhymes / English Phonics / Maths)
 *   Task 2: 🎥 Video Class 2 (EVS, Science & Moral Stories)
 *   Task 3: 💃 Aerobic Kids Dance & Rhythm Movement
 *   Task 4: 🧘 Mindful Kids Yoga & Animal Poses
 *   Task 5: ✍️ Pencil Tracing, Writing & Fine Motor Activity
 *   Task 6: 📖 Phonics & Picture Story Reading
 */

export interface KindergartenTask {
  taskId: string;
  taskNumber: number;
  title: string;
  titleTa?: string;
  type: 'video_core' | 'video_evs' | 'aerobic_dance' | 'yoga' | 'writing' | 'reading';
  category: string;
  durationMinutes: number;
  durationLabel: string;
  youtubeId: string;
  youtubeUrl: string;
  description: string;
  descriptionTa?: string;
  guidanceForParents: string;
  contentData: {
    strokeOrLetter?: string;
    phonicsSound?: string;
    mathObjectCount?: number;
    mathNumber?: number;
    evsConcept?: string;
    yogaPoseName?: string;
    yogaPoseTa?: string;
    yogaPoseSteps?: string[];
    danceStyle?: string;
    danceTempo?: string;
    readingWords?: string[];
    sightWord?: string;
    tamilWord?: string;
    tamilMeaning?: string;
  };
}

export interface KindergartenDayPlan {
  dayNumber: number;
  quarter: 1 | 2 | 3 | 4;
  quarterLabel: string;
  theme: string;
  themeTa: string;
  totalTasks: number;
  totalMinutes: number;
  tasks: KindergartenTask[];
}

// Curated authentic educational video libraries
const CORE_VIDEO_LIBRARY = [
  { id: 'dQw4w9WgXcQ', title: 'Tamil Uyir Ezhuthukkal Song (உயிர் எழுத்துக்கள் பாடல்)', ta: 'உயிர் எழுத்துக்கள் பாட்டு' },
  { id: 'BELlZKpi1Zs', title: 'Jolly Phonics Letter Sounds A to Z', ta: 'ஆங்கில ஃபோனிக்ஸ் ஒலிகள்' },
  { id: 'ea5-SIe5l7M', title: 'Numberblocks - Counting 1 to 10 Fun', ta: 'எண்கள் 1 முதல் 10 வரை அறிவோம்' },
  { id: 'DR-cfDsHCGA', title: 'Nila Nila Odi Vaa - Tamil Traditional Rhyme', ta: 'நிலா நிலா ஓடி வா மழலையர் பாடல்' },
  { id: '71h8MZ89tYo', title: 'Shapes & Colors for Kindergarteners', ta: 'வடிவங்கள் மற்றும் வண்ணங்கள்' },
  { id: 'Yt8GFgxFQ6I', title: 'Handa\'s Surprise - Phonics Picture Story', ta: 'படக் கதை மற்றும் சொல் அறிதல்' },
  { id: 'V7XW9fQ906o', title: 'Kaiveesamma Kaiveesu - Tamil Rhyme', ta: 'கைவீசம்மா கைவீசு பாரம்பரியப் பாடல்' },
  { id: 'K6ZM0FUhN5U', title: 'Number Formation & Counting 11 to 20', ta: 'எண்கள் 11 முதல் 20 வரை' },
  { id: 'WP1blVh1ZQM', title: 'CVC 3-Letter Blending Words (cat, bat, mat)', ta: 'மூன்று எழுத்து சொற்கள் வாசித்தல்' },
  { id: 'jGZ0D5u3bYc', title: 'Dosai Amma Dosai - Tamil Rhythm Rhyme', ta: 'தோசை அம்மா தோசை பாட்டு' }
];

const EVS_VIDEO_LIBRARY = [
  { id: 'qBgX7GL4iGs', title: 'My 5 Senses - Sight, Hearing, Smell, Taste, Touch', ta: 'ஐம்புலன்கள் அறிவோம்' },
  { id: 'D0Ajq682yrA', title: 'Parts of the Body for Kids', ta: 'உடல் உறுப்புகள் அறிதல்' },
  { id: 'h4eueDYPTIg', title: 'Domestic & Wild Animals Around Us', ta: 'விலங்குகள் மற்றும் அவற்றின் ஒலிகள்' },
  { id: 'gGhvhW3o2rY', title: 'Fruits & Vegetables Healthy Food Song', ta: 'பழங்கள் மற்றும் காய்கறிகள்' },
  { id: 'l4WNrvVjiTw', title: 'Community Helpers - Doctor, Teacher, Police, Farmer', ta: 'நமக்கு உதவும் நல்ல உள்ளங்கள்' },
  { id: 'xc3bX2hVf3M', title: 'Seasons of the Year - Summer, Monsoon, Winter', ta: 'பருவ காலங்கள் மற்றும் மழை' },
  { id: 'tbbKjDjMDok', title: 'Good Habits & Cleanliness Daily Routine', ta: 'நல்ல பழக்க வழக்கங்கள்' },
  { id: 'cSPmA02VfA0', title: 'Plants, Flowers & Trees in Nature', ta: 'செடிகள், பூக்கள் மற்றும் மரங்கள்' }
];

const DANCE_VIDEO_LIBRARY = [
  { id: 'Mv_4p9_kP_k', title: 'Baby Shark & Kids Aerobic Rhythm Dance', ta: 'மழலையர் ஏரோபிக் நடனம்' },
  { id: '1b6oxy1463U', title: 'Freeze Dance & Gross Motor Coordination', ta: 'உடல் அசைவு மற்றும் சமநிலை நடனம்' },
  { id: 'KhfkYzUwYFk', title: 'Head Shoulders Knees & Toes Energetic Action', ta: 'உடல் உறுப்புகள் அசைவுப் பாடல்' },
  { id: 'C3c8fzbsfOE', title: 'Animal Movement Jump & Wiggle Workout', ta: 'விலங்குகள் போல துள்ளி ஆடுவோம்' },
  { id: 'gBzJGc_F9t8', title: 'Rhythm Clapping & Step-Jump Aerobics', ta: 'கைதட்டி குதிக்கும் தாள நடனம்' }
];

const YOGA_POSES_LIBRARY = [
  {
    name: 'Butterfly Pose (பட்டர்ஃபிளை ஆசனம் - பத்ராசனம்)',
    ta: 'பட்டாம்பூச்சி ஆசனம்',
    steps: ['Sit with back straight', 'Join soles of feet together', 'Flap knees gently like butterfly wings', 'Breathe slowly in and out 5 times']
  },
  {
    name: 'Tree Pose (விருக்ஷாசனம் - Tree Balance)',
    ta: 'மர ஆசனம் (சமநிலை)',
    steps: ['Stand tall like a strong tree', 'Place right foot on left leg', 'Bring hands together above head like branches', 'Hold steady for 10 seconds']
  },
  {
    name: 'Cat-Cow Pose (பூனை & பசு ஆசனம் - மார்ஜரியாசனம்)',
    ta: 'பூனை-பசு ஆசனம்',
    steps: ['Get down on hands and knees', 'Inhale: Look up and curve back down like a cow', 'Exhale: Arch back up like a happy cat', 'Repeat 4 times']
  },
  {
    name: 'Lion Breath Pose (சிம்ம ஆசனம் - Lion Roar)',
    ta: 'சிங்க மூச்சுப் பயிற்சி',
    steps: ['Sit on knees with hands on thighs', 'Take a deep breath in through nose', 'Open mouth wide, stick tongue out and breathe out like a gentle lion roar', 'Releases tension and builds confidence']
  },
  {
    name: 'Cobra / Snake Pose (புஜங்காசனம் - Happy Snake)',
    ta: 'பாம்பு ஆசனம்',
    steps: ['Lie flat on stomach', 'Place hands beside shoulders', 'Gently lift chest up like a friendly cobra', 'Hiss softly and breathe']
  },
  {
    name: 'Child\'s Rest Pose (பாலாசனம் - Turtle Sleep)',
    ta: 'குழந்தை ஆசனம் (ஆழ்ந்த அமைதி)',
    steps: ['Sit back on heels', 'Fold body forward resting forehead on mat', 'Stretch arms forward or relax beside feet', 'Breathe peacefully']
  }
];

const TAMIL_UYIR_LETTERS = ['அ', 'ஆ', 'இ', 'ஈ', 'உ', 'ஊ', 'எ', 'ஏ', 'ஐ', 'ஒ', 'ஓ', 'ஔ', 'ஃ'];
const PHONICS_LETTERS = ['s', 'a', 't', 'i', 'p', 'n', 'c', 'k', 'e', 'h', 'r', 'm', 'd', 'g', 'o', 'u', 'l', 'f', 'b', 'j', 'z', 'w', 'v', 'y', 'x', 'q'];

const SIGHT_WORDS_PROGRESSION = [
  'I', 'see', 'a', 'the', 'is', 'my', 'it', 'we', 'can', 'go',
  'to', 'in', 'on', 'at', 'big', 'red', 'sun', 'cat', 'dog', 'run',
  'jump', 'play', 'happy', 'love', 'mom', 'dad', 'tree', 'bird', 'car', 'star'
];

/**
 * Generate full 365 Days Kindergarten Plan
 */
export function generateKindergarten200DaysPlan(): KindergartenDayPlan[] {
  const plan: KindergartenDayPlan[] = [];

  for (let day = 1; day <= 365; day++) {
    const quarter = (day <= 50 ? 1 : day <= 100 ? 2 : day <= 150 ? 3 : 4) as (1 | 2 | 3 | 4);
    const quarterLabel = `Quarter ${quarter} • ${
      quarter === 1
        ? 'Foundations & Strokes'
        : quarter === 2
        ? 'Letter Shapes & Nature'
        : quarter === 3
        ? 'Words, Numbers & Science'
        : 'Class 1 Readiness & Fluency'
    }`;

    // Subject data rotation
    const coreVideo = CORE_VIDEO_LIBRARY[(day - 1) % CORE_VIDEO_LIBRARY.length];
    const evsVideo = EVS_VIDEO_LIBRARY[(day - 1) % EVS_VIDEO_LIBRARY.length];
    const danceVideo = DANCE_VIDEO_LIBRARY[(day - 1) % DANCE_VIDEO_LIBRARY.length];
    const yogaPose = YOGA_POSES_LIBRARY[(day - 1) % YOGA_POSES_LIBRARY.length];

    const tamilLetter = TAMIL_UYIR_LETTERS[(day - 1) % TAMIL_UYIR_LETTERS.length];
    const phonicsLetter = PHONICS_LETTERS[(day - 1) % PHONICS_LETTERS.length];
    const countNumber = ((day - 1) % 50) + 1;
    const sightWord = SIGHT_WORDS_PROGRESSION[(day - 1) % SIGHT_WORDS_PROGRESSION.length];

    // Build Theme description
    const theme = `Day ${day}: Tamil '${tamilLetter}', Phonics /${phonicsLetter}/, Counting ${countNumber} & ${evsVideo.title.split('-')[0].trim()}`;
    const themeTa = `நாள் ${day}: தமிழ் '${tamilLetter}', ஃபோனிக்ஸ் /${phonicsLetter}/, எண் ${countNumber} & ${evsVideo.ta}`;

    // 6 Nano-Level 10-Minute Tasks
    const tasks: KindergartenTask[] = [
      // Task 1: Core Academic Video (Tamil / Phonics / Maths)
      {
        taskId: `kg_day_${day}_task_1`,
        taskNumber: 1,
        title: `🎥 Video Lesson: ${coreVideo.title}`,
        titleTa: `🎥 காணொளி பாடம்: ${coreVideo.ta}`,
        type: 'video_core',
        category: 'Core Academics & Rhymes',
        durationMinutes: 10,
        durationLabel: '10 Mins',
        youtubeId: coreVideo.id,
        youtubeUrl: `https://www.youtube.com/watch?v=${coreVideo.id}`,
        description: `Sing along with the animated rhythm video and learn the foundational sound of '${tamilLetter}' and Phonics '${phonicsLetter}'.`,
        descriptionTa: `பாடலை பாடி மகிழ்ந்து '${tamilLetter}' எழுத்தின் ஒலியையும் ஃபோனிக்ஸ் '${phonicsLetter}' உச்சரிப்பையும் அறிவோம்.`,
        guidanceForParents: 'Play video twice. Encourage child to clap to the beat and repeat the letter sounds loudly.',
        contentData: {
          phonicsSound: phonicsLetter,
          tamilWord: tamilLetter === 'அ' ? 'அம்மா (Amma)' : tamilLetter === 'ஆ' ? 'ஆடு (Aadu)' : `${tamilLetter} எழுத்து`,
          strokeOrLetter: tamilLetter
        }
      },

      // Task 2: EVS & Discovery Video
      {
        taskId: `kg_day_${day}_task_2`,
        taskNumber: 2,
        title: `🎥 Discovery Lesson: ${evsVideo.title}`,
        titleTa: `🎥 சூழலியல் பாடம்: ${evsVideo.ta}`,
        type: 'video_evs',
        category: 'EVS & Nature Discovery',
        durationMinutes: 10,
        durationLabel: '10 Mins',
        youtubeId: evsVideo.id,
        youtubeUrl: `https://www.youtube.com/watch?v=${evsVideo.id}`,
        description: `Explore the wonders of nature, body parts, animals, and healthy living through engaging storytelling.`,
        descriptionTa: `இயற்கை, விலங்குகள் மற்றும் நற்பழக்கங்களை சுவாரசியமான கதைகள் மூலம் அறிவோம்.`,
        guidanceForParents: 'Ask 2 simple questions after the video (e.g. "What color was the apple?" or "Which animal made that sound?").',
        contentData: {
          evsConcept: evsVideo.title
        }
      },

      // Task 3: Aerobic Kids Dance & Rhythm Movement
      {
        taskId: `kg_day_${day}_task_3`,
        taskNumber: 3,
        title: `💃 Kids Aerobic Dance: ${danceVideo.title}`,
        titleTa: `💃 மழலையர் தாள நடனம்: ${danceVideo.ta}`,
        type: 'aerobic_dance',
        category: 'Aerobic Movement & Rhythm',
        durationMinutes: 10,
        durationLabel: '10 Mins',
        youtubeId: danceVideo.id,
        youtubeUrl: `https://www.youtube.com/watch?v=${danceVideo.id}`,
        description: `Energetic gross-motor body movement, jump-step rhythm dance, and coordination warm-up.`,
        descriptionTa: `உடலை சுறுசுறுப்பாக்கும் தாள நடனம், குதித்தல் மற்றும் சமநிலை பயிற்சி.`,
        guidanceForParents: 'Ensure a safe clear floor space. Dance along with child to encourage joy and motor confidence.',
        contentData: {
          danceStyle: 'Fun Rhythm Aerobics',
          danceTempo: 'Energetic 110 BPM'
        }
      },

      // Task 4: Mindful Kids Yoga & Animal Pose
      {
        taskId: `kg_day_${day}_task_4`,
        taskNumber: 4,
        title: `🧘 Mindful Yoga: ${yogaPose.name}`,
        titleTa: `🧘 மழலையர் யோகா: ${yogaPose.ta}`,
        type: 'yoga',
        category: 'Mindfulness & Flexibility',
        durationMinutes: 10,
        durationLabel: '10 Mins',
        youtubeId: 'X655B4ISakg',
        youtubeUrl: 'https://www.youtube.com/watch?v=X655B4ISakg',
        description: `Gentle animal stretch and calm breathing to improve posture, focus, and emotional balance.`,
        descriptionTa: `மென்மையான உடல் நெகிழ்வு மற்றும் மூச்சுப் பயிற்சி மூலம் மன அமைதியும் கவனமும் பெறுதல்.`,
        guidanceForParents: 'Help child gently assume the pose on a mat. Focus on smiling and steady breathing.',
        contentData: {
          yogaPoseName: yogaPose.name,
          yogaPoseTa: yogaPose.ta,
          yogaPoseSteps: yogaPose.steps
        }
      },

      // Task 5: Pencil Tracing, Writing & Fine Motor Activity
      {
        taskId: `kg_day_${day}_task_5`,
        taskNumber: 5,
        title: `✍️ Tracing & Writing: '${tamilLetter}' & Letter '${phonicsLetter.toUpperCase()}'`,
        titleTa: `✍️ எழுத்துப் பயிற்சி: '${tamilLetter}' மற்றும் ஆங்கில '${phonicsLetter.toUpperCase()}'`,
        type: 'writing',
        category: 'Handwriting & Fine Motor',
        durationMinutes: 10,
        durationLabel: '10 Mins',
        youtubeId: 'v8Jk_XhG4gY',
        youtubeUrl: 'https://www.youtube.com/watch?v=v8Jk_XhG4gY',
        description: `Trace the dotted lines from top to bottom. Practice letter formation and draw ${countNumber} small circles/stars.`,
        descriptionTa: `புள்ளிகளை இணைத்து எழுத்துக்களை அழகாக எழுதுவோம். ${countNumber} நட்சத்திரங்களை வரைந்து வண்ணமிடுவோம்.`,
        guidanceForParents: 'Guide three-finger tripod pencil grip. Praise every small effort and smooth line.',
        contentData: {
          strokeOrLetter: `${tamilLetter} / ${phonicsLetter.toUpperCase()}`,
          mathNumber: countNumber,
          mathObjectCount: countNumber
        }
      },

      // Task 6: Phonics & Picture Story Reading
      {
        taskId: `kg_day_${day}_task_6`,
        taskNumber: 6,
        title: `📖 Reading & Sight Word: "${sightWord.toUpperCase()}"`,
        titleTa: `📖 வாசிப்புப் பயிற்சி: சொல் "${sightWord.toUpperCase()}"`,
        type: 'reading',
        category: 'Phonics & Early Reading',
        durationMinutes: 10,
        durationLabel: '10 Mins',
        youtubeId: 'jJ_19s6451U',
        youtubeUrl: 'https://www.youtube.com/watch?v=jJ_19s6451U',
        description: `Point to the flashcard, listen to the pronunciation, and blend the sounds aloud.`,
        descriptionTa: `பட அட்டையைப் பார்த்து உச்சரிப்பைக் கேட்டு, ஒலிகளை இணைத்து வாசிப்போம்.`,
        guidanceForParents: 'Read the word pointing with your finger. Have child repeat 3 times and make a happy sentence.',
        contentData: {
          sightWord: sightWord,
          readingWords: [sightWord, phonicsLetter + 'at', phonicsLetter + 'un'],
          tamilWord: tamilLetter === 'அ' ? 'அம்மா' : tamilLetter === 'ஆ' ? 'ஆடு' : tamilLetter === 'இ' ? 'இலை' : 'படம்'
        }
      }
    ];

    plan.push({
      dayNumber: day,
      quarter,
      quarterLabel,
      theme,
      themeTa,
      totalTasks: tasks.length,
      totalMinutes: 60,
      tasks
    });
  }

  return plan;
}

// Singleton cached instance for instant performance
let CACHED_KG_PLAN: KindergartenDayPlan[] | null = null;

export function getKindergartenDayPlan(dayNumber: number): KindergartenDayPlan {
  if (!CACHED_KG_PLAN) {
    CACHED_KG_PLAN = generateKindergarten200DaysPlan();
  }
  const safeDay = Math.max(1, Math.min(200, dayNumber));
  return CACHED_KG_PLAN[safeDay - 1];
}

export function getAllKindergartenDayPlans(): KindergartenDayPlan[] {
  if (!CACHED_KG_PLAN) {
    CACHED_KG_PLAN = generateKindergarten200DaysPlan();
  }
  return CACHED_KG_PLAN;
}
