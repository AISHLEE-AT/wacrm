/**
 * SuprO TeachO Automated 200-Day & 360-Day Curriculum Plan Seeding Engine
 * Generates official syllabus-aligned, subject-wise, 10-day block plans with micro-topics,
 * activity prompts, and revision/quizzes using Gemini 2.5 Flash and writes to Supabase.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// ─── Supabase Configuration ─────────────────────────────────────
const SUPABASE_URL = 'https://jjgdatjthyeesmgunnlp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZ2RhdGp0aHllZXNtZ3VubmxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MzU5NTYsImV4cCI6MjEwMDIxMTk1Nn0.iuSdvxW9VEtn_1yVLmf9ZN24CeXFxmF3aeVHEn-Dgcs';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── API Key Pool with Rotation ────────────────────────────────
const API_KEYS = [
  process.env.GEMINI_API_KEY || '',
  process.env.GEMINI_API_KEY || '',
  process.env.GEMINI_API_KEY || '',
  'AIzaSyCjagu5qgBIdlX45x0O5HaMfj8E3a55Q_M'
];

let currentKeyIndex = 0;
function getNextApiKey() {
  const key = API_KEYS[currentKeyIndex % API_KEYS.length];
  currentKeyIndex++;
  return key;
}

// ─── Output Directory for Local Offline App Cache ──────────────
const LOCAL_OUTPUT_DIR = path.resolve('D:/w/apps/mobile/src/lib/dailyCoursePlans');
if (!fs.existsSync(LOCAL_OUTPUT_DIR)) {
  fs.mkdirSync(LOCAL_OUTPUT_DIR, { recursive: true });
}

// ─── LKG Verified Golden Starter Seed (Days 1–10) ──────────────
const LKG_DAYS_1_TO_10 = [
  {
    dayNumber: 1,
    blockNumber: 1,
    phaseTitle: 'Phase 1: Foundation & Pre-Writing Readiness',
    themeTitle: 'Vowels அ, ஆ, இ, ஈ, Letters A–D & Counting 1–5',
    totalDurationMins: 130,
    tasks: [
      { subject: 'Tamil', topic: 'Vowels அ, ஆ, இ, ஈ', subtopic: 'Flashcards & Oral repetition', durationMinutes: 15, taskType: 'reading', activityPrompt: 'Show flashcards of அ (அம்மா), ஆ (ஆடு) and repeat aloud 5 times.' },
      { subject: 'English', topic: 'Letters A–D', subtopic: 'Phonics song & tracing in sand', durationMinutes: 15, taskType: 'activity', activityPrompt: 'Trace letter A and B on sand tray or drawing sheet.' },
      { subject: 'Maths', topic: 'Numbers 1–5 recognition', subtopic: 'One-to-one object counting', durationMinutes: 20, taskType: 'practice', activityPrompt: 'Count 5 colorful buttons or crayons one by one.' },
      { subject: 'EVS', topic: 'Colors (Red, Blue, Green)', subtopic: 'Identifying primary colors in surroundings', durationMinutes: 20, taskType: 'activity', activityPrompt: 'Point out 3 red and 3 green items in the room.' },
      { subject: 'Rhymes & Stories', topic: 'Tamil Rhyme + "Lion and Mouse" Story', subtopic: 'Listening comprehension & gestures', durationMinutes: 20, taskType: 'video', activityPrompt: 'Listen to story and roar like a lion.' },
      { subject: 'Arts & Crafts', topic: 'Color a Bright Sun', subtopic: 'Yellow crayon coloring within borders', durationMinutes: 10, taskType: 'activity', activityPrompt: 'Fill the sun drawing with bright yellow color.' },
      { subject: 'Physical Activity', topic: 'Running & Jumping in Place', subtopic: 'Gross motor coordination', durationMinutes: 10, taskType: 'activity', activityPrompt: '10 small hops on both feet followed by high jumps.' },
      { subject: 'Music & Rhythm', topic: 'Clap Along to Rhythm', subtopic: 'Beat matching (1-2-3 clap)', durationMinutes: 10, taskType: 'activity', activityPrompt: 'Clap fast, then clap slow to the music beat.' },
      { subject: 'Daily Revision', topic: 'Recap Letters A–D & Numbers 1–5', subtopic: 'Quick 10-minute bedtime recap', durationMinutes: 10, taskType: 'revision', activityPrompt: 'Recall all letters and numbers learned today.' }
    ],
    dailyRevision: 'Recap letters A–D and numbers 1–5 with bedtime flashcard game.',
    dailyTestSummary: { questionCount: 3, testType: 'oral', focusArea: 'Letter & Number Recognition' }
  },
  {
    dayNumber: 2,
    blockNumber: 1,
    phaseTitle: 'Phase 1: Foundation & Pre-Writing Readiness',
    themeTitle: 'Consonants க, ங, ச, Letters E–H & Shapes',
    totalDurationMins: 130,
    tasks: [
      { subject: 'Tamil', topic: 'Consonants க, ங, ச', subtopic: 'Sound recognition (கண், சக்கரம்)', durationMinutes: 15, taskType: 'reading', activityPrompt: 'Say க for கண் and ச for சக்கரம் with gestures.' },
      { subject: 'English', topic: 'Letters E–H (Elephant, Fish)', subtopic: 'Letter sounds and animal pictures', durationMinutes: 15, taskType: 'reading', activityPrompt: 'Match letter E with Elephant and F with Fish.' },
      { subject: 'Maths', topic: 'Numbers 6–10 Recognition', subtopic: 'Count fingers on two hands', durationMinutes: 20, taskType: 'practice', activityPrompt: 'Count all 10 fingers slowly.' },
      { subject: 'EVS', topic: 'Shapes (Circle, Square, Triangle)', subtopic: 'Shape recognition in daily objects', durationMinutes: 20, taskType: 'activity', activityPrompt: 'Find round plates (circle) and square boxes at home.' },
      { subject: 'Rhymes & Stories', topic: '“Humpty Dumpty” + “Thirsty Crow”', subtopic: 'Story moral & pebble dropping action', durationMinutes: 20, taskType: 'video', activityPrompt: 'Enact the thirsty crow picking pebbles.' },
      { subject: 'Arts & Crafts', topic: 'Draw and Color a Circle', subtopic: 'Hand control with circular motion', durationMinutes: 10, taskType: 'activity', activityPrompt: 'Draw 3 circles using a bangle and color them blue.' },
      { subject: 'Physical Activity', topic: 'Tree Pose Yoga for Kids', subtopic: 'Balance and posture', durationMinutes: 10, taskType: 'activity', activityPrompt: 'Stand on one leg with hands raised like a tree branch.' },
      { subject: 'Music & Rhythm', topic: 'Tamil Action Song (கைவீசம்மா கைவீசு)', subtopic: 'Movement with song', durationMinutes: 10, taskType: 'activity', activityPrompt: 'Swing arms and walk around singing.' },
      { subject: 'Daily Revision', topic: 'Recap Letters E–H & Numbers 6–10', subtopic: 'Flashcard matching', durationMinutes: 10, taskType: 'revision', activityPrompt: 'Match number cards 6 to 10 with dot count.' }
    ],
    dailyRevision: 'Recap consonants க, ங, ச and shapes (Circle, Square, Triangle).',
    dailyTestSummary: { questionCount: 3, testType: 'oral', focusArea: 'Shapes & Letters E-H' }
  },
  {
    dayNumber: 3,
    blockNumber: 1,
    phaseTitle: 'Phase 1: Foundation & Pre-Writing Readiness',
    themeTitle: 'Vowels உ, ஊ, எ, ஏ, Letters I–L & Fruits',
    totalDurationMins: 130,
    tasks: [
      { subject: 'Tamil', topic: 'Vowels உ, ஊ, எ, ஏ', subtopic: 'உரல், ஊஞ்சல், எலி, ஏணி flashcards', durationMinutes: 15, taskType: 'reading', activityPrompt: 'Pronounce short உ vs long ஊ sounds clearly.' },
      { subject: 'English', topic: 'Letters I–L', subtopic: 'Igloo, Jam, Kite, Lion recognition', durationMinutes: 15, taskType: 'reading', activityPrompt: 'Trace standing and sleeping lines for I and L.' },
      { subject: 'Maths', topic: 'Count Objects up to 10', subtopic: 'Counting leaves or marbles', durationMinutes: 20, taskType: 'practice', activityPrompt: 'Line up 10 blocks and count forward from 1 to 10.' },
      { subject: 'EVS', topic: 'Fruits (Apple, Banana, Mango)', subtopic: 'Taste, color and fruit names', durationMinutes: 20, taskType: 'activity', activityPrompt: 'Identify red apple, yellow banana and sweet mango.' },
      { subject: 'Rhymes & Stories', topic: '“Jack and Jill” + Tamil Rhyme (நிலா நிலா ஓடி வா)', subtopic: 'Action rhyme and moon story', durationMinutes: 20, taskType: 'video', activityPrompt: 'Sing along and clap to Nila Nila Odi Vaa.' },
      { subject: 'Arts & Crafts', topic: 'Finger Painting Fruit Tree', subtopic: 'Fine motor dip and dab', durationMinutes: 10, taskType: 'activity', activityPrompt: 'Dip thumb in red paint to make apples on paper.' },
      { subject: 'Physical Activity', topic: 'Ball Passing Game', subtopic: 'Hand-eye coordination', durationMinutes: 10, taskType: 'activity', activityPrompt: 'Pass soft ball back and forth with parent 15 times.' },
      { subject: 'Music & Rhythm', topic: 'Simple Drum Beats', subtopic: 'Tapping desk/instrument rhythmically', durationMinutes: 10, taskType: 'activity', activityPrompt: 'Tap desk with pencils like drumsticks (Ta-Ta-Dhum).' },
      { subject: 'Daily Revision', topic: 'Recap Fruits & Letters I–L', subtopic: 'Identify fruits from pictures', durationMinutes: 10, taskType: 'revision', activityPrompt: 'Name all 3 fruits and point out letter L.' }
    ],
    dailyRevision: 'Recap vowels உ, ஊ, எ, ஏ and counting up to 10.',
    dailyTestSummary: { questionCount: 3, testType: 'oral', focusArea: 'Fruits & Vowels' }
  },
  {
    dayNumber: 4,
    blockNumber: 1,
    phaseTitle: 'Phase 1: Foundation & Pre-Writing Readiness',
    themeTitle: 'Consonants ட, ண, த, Letters M–P & Animals',
    totalDurationMins: 130,
    tasks: [
      { subject: 'Tamil', topic: 'Consonants ட, ண, த', subtopic: 'படம், கண், தவளை identification', durationMinutes: 15, taskType: 'reading', activityPrompt: 'Repeat ட, த sounds with word examples.' },
      { subject: 'English', topic: 'Letters M–P', subtopic: 'Monkey, Nest, Orange, Parrot', durationMinutes: 15, taskType: 'reading', activityPrompt: 'Trace M and N shapes in the air.' },
      { subject: 'Maths', topic: 'Shapes Practice (Triangle & Square)', subtopic: 'Counting sides (3 sides vs 4 sides)', durationMinutes: 20, taskType: 'practice', activityPrompt: 'Count 3 sides of a sandwich triangle and 4 of a tile.' },
      { subject: 'EVS', topic: 'Domestic Animals (Dog, Cat, Cow)', subtopic: 'Animal sounds and care', durationMinutes: 20, taskType: 'activity', activityPrompt: 'Make sounds: Dog (Bow-wow), Cat (Meow), Cow (Moo).' },
      { subject: 'Rhymes & Stories', topic: '“Baa Baa Black Sheep”', subtopic: 'Animal sounds rhyme & wool meaning', durationMinutes: 20, taskType: 'video', activityPrompt: 'Sing Baa Baa Black Sheep with rhythm.' },
      { subject: 'Arts & Crafts', topic: 'Clay / Playdough Modeling', subtopic: 'Rolling balls and snakes', durationMinutes: 10, taskType: 'activity', activityPrompt: 'Roll dough into 3 small balls and 1 long snake.' },
      { subject: 'Physical Activity', topic: 'Jumping Jacks & Toe Touches', subtopic: 'Agility & flexibility', durationMinutes: 10, taskType: 'activity', activityPrompt: 'Do 8 easy jumping jacks and reach down to toes.' },
      { subject: 'Music & Rhythm', topic: 'Group Animal Sound Song', subtopic: 'Pitch and imitation', durationMinutes: 10, taskType: 'activity', activityPrompt: 'Sing Old MacDonald Had a Farm.' },
      { subject: 'Daily Revision', topic: 'Recap Animals & Letters M–P', subtopic: 'Animal sound quiz', durationMinutes: 10, taskType: 'revision', activityPrompt: 'Parent asks sound, child identifies the animal.' }
    ],
    dailyRevision: 'Recap animals and letters M–P.',
    dailyTestSummary: { questionCount: 3, testType: 'oral', focusArea: 'Animals & Shapes' }
  },
  {
    dayNumber: 5,
    blockNumber: 1,
    phaseTitle: 'Phase 1: Foundation & Pre-Writing Readiness',
    themeTitle: 'Vowels ஐ, ஒ, ஓ, Letters Q–T & Transport',
    totalDurationMins: 130,
    tasks: [
      { subject: 'Tamil', topic: 'Vowels ஐ, ஒ, ஓ', subtopic: 'ஐந்து, ஒட்டகம், ஓடம்', durationMinutes: 15, taskType: 'reading', activityPrompt: 'Count ஐ (5) fingers, say ஒட்டகம் (camel).' },
      { subject: 'English', topic: 'Letters Q–T', subtopic: 'Queen, Rabbit, Sun, Tiger', durationMinutes: 15, taskType: 'reading', activityPrompt: 'Trace S for Sun and T for Tiger.' },
      { subject: 'Maths', topic: 'Numbers 11–15 Recognition', subtopic: '10 + 1 bundle concept', durationMinutes: 20, taskType: 'practice', activityPrompt: 'Make 1 bundle of 10 pencils and add 1 more for 11.' },
      { subject: 'EVS', topic: 'Transport (Bus, Car, Train)', subtopic: 'Wheels and travel modes', durationMinutes: 20, taskType: 'activity', activityPrompt: 'Chug like a train: Chuku-Chuku-Chuku!' },
      { subject: 'Rhymes & Stories', topic: 'Tamil Rhyme (வண்டி வருது வண்டி வருது) + Fox & Grapes', subtopic: 'Transport song & story lesson', durationMinutes: 20, taskType: 'video', activityPrompt: 'Act out the fox jumping for grapes.' },
      { subject: 'Arts & Crafts', topic: 'Draw a Simple Box Bus', subtopic: 'Rectangles and 2 round wheels', durationMinutes: 10, taskType: 'activity', activityPrompt: 'Draw a big rectangle and 2 circle wheels for a bus.' },
      { subject: 'Physical Activity', topic: 'Circle Running & Freeze Game', subtopic: 'Listening and reflex control', durationMinutes: 10, taskType: 'activity', activityPrompt: 'Run in circle; when parent says "Freeze", stop instantly.' },
      { subject: 'Music & Rhythm', topic: 'Dance with Claps', subtopic: 'Body movement coordination', durationMinutes: 10, taskType: 'activity', activityPrompt: 'Step left, clap; step right, clap.' },
      { subject: 'Daily Revision', topic: 'Recap Transport & Numbers 11–15', subtopic: 'Count transport toys', durationMinutes: 10, taskType: 'revision', activityPrompt: 'Recall all vehicles and count numbers 11 to 15.' }
    ],
    dailyRevision: 'Recap transport modes and numbers 11–15.',
    dailyTestSummary: { questionCount: 3, testType: 'oral', focusArea: 'Vehicles & Counting 11-15' }
  },
  {
    dayNumber: 6,
    blockNumber: 1,
    phaseTitle: 'Phase 1: Foundation & Pre-Writing Readiness',
    themeTitle: 'Consonants ப, ம, ய, Letters U–X & Seasons',
    totalDurationMins: 130,
    tasks: [
      { subject: 'Tamil', topic: 'Consonants ப, ம, ய', subtopic: 'பட்டம், மரம், முயல்', durationMinutes: 15, taskType: 'reading', activityPrompt: 'Say ப for பட்டம் (kite) and ம for மரம் (tree).' },
      { subject: 'English', topic: 'Letters U–X', subtopic: 'Umbrella, Van, Watch, Xylophone', durationMinutes: 15, taskType: 'reading', activityPrompt: 'Hold imaginary umbrella for U.' },
      { subject: 'Maths', topic: 'Numbers 16–20 Recognition', subtopic: 'Counting from 1 to 20 in sequence', durationMinutes: 20, taskType: 'practice', activityPrompt: 'Clap 20 times counting 1, 2, 3... 20.' },
      { subject: 'EVS', topic: 'Seasons (Summer, Rainy, Winter)', subtopic: 'Hot sun, rain umbrellas and warm clothes', durationMinutes: 20, taskType: 'activity', activityPrompt: 'Discuss why we need an umbrella when it rains.' },
      { subject: 'Rhymes & Stories', topic: '“Rain Rain Go Away”', subtopic: 'Weather song with rain sound actions', durationMinutes: 20, taskType: 'video', activityPrompt: 'Tap fingertips on table to mimic raindrops (pitter-patter).' },
      { subject: 'Arts & Crafts', topic: 'Paper Folding (Origami Boat)', subtopic: 'Simple paper boat folding', durationMinutes: 10, taskType: 'activity', activityPrompt: 'Fold a paper boat with parent and float in a bowl of water.' },
      { subject: 'Physical Activity', topic: 'Yoga Breathing (Smell the Flower, Blow the Candle)', subtopic: 'Deep breathing relaxation', durationMinutes: 10, taskType: 'activity', activityPrompt: 'Breathe in deep through nose, blow out softly through mouth.' },
      { subject: 'Music & Rhythm', topic: 'Tamil Rain Song (மழை வருது மழை வருது குடை பிடி)', subtopic: 'Rhythmic chanting', durationMinutes: 10, taskType: 'activity', activityPrompt: 'Chant Mazhai Varudhu with actions.' },
      { subject: 'Daily Revision', topic: 'Recap Seasons & Letters U–X', subtopic: 'Season association game', durationMinutes: 10, taskType: 'revision', activityPrompt: 'Name 3 seasons and point to umbrella letter U.' }
    ],
    dailyRevision: 'Recap seasons, consonants ப, ம, ய and numbers 16–20.',
    dailyTestSummary: { questionCount: 3, testType: 'oral', focusArea: 'Weather & Letters U-X' }
  },
  {
    dayNumber: 7,
    blockNumber: 1,
    phaseTitle: 'Phase 1: Foundation & Pre-Writing Readiness',
    themeTitle: 'Vowels ஔ, ஃ, Letters Y–Z & Family Members',
    totalDurationMins: 130,
    tasks: [
      { subject: 'Tamil', topic: 'Vowels ஔ, ஃ (ஆய்த எழுத்து)', subtopic: 'ஔவையார், எஃகு வாள்', durationMinutes: 15, taskType: 'reading', activityPrompt: 'Learn 3 dots of ஃ (ஆய்த எழுத்து).' },
      { subject: 'English', topic: 'Letters Y–Z (Complete Alphabet Mastery!)', subtopic: 'Yak, Zebra & full A to Z chant', durationMinutes: 15, taskType: 'reading', activityPrompt: 'Sing complete A to Z phonics song!' },
      { subject: 'Maths', topic: 'Counting Objects up to 20', subtopic: 'Grouping in 5s and 10s', durationMinutes: 20, taskType: 'practice', activityPrompt: 'Count 20 grain seeds or beads.' },
      { subject: 'EVS', topic: 'Family Members (Amma, Appa, Brother, Sister)', subtopic: 'Love, respect and helping at home', durationMinutes: 20, taskType: 'activity', activityPrompt: 'Give a big hug to Amma and Appa.' },
      { subject: 'Rhymes & Stories', topic: '“Finger Family Song” (Daddy Finger...)', subtopic: 'Finger puppets & family roles', durationMinutes: 20, taskType: 'video', activityPrompt: 'Wiggle thumb for Daddy, index for Mommy.' },
      { subject: 'Arts & Crafts', topic: 'Draw My Family Picture', subtopic: 'Stick figures for family members', durationMinutes: 10, taskType: 'activity', activityPrompt: 'Draw circles for heads and lines for bodies of family.' },
      { subject: 'Physical Activity', topic: 'Skipping & Toe Jumping', subtopic: 'Calf strength and balance', durationMinutes: 10, taskType: 'activity', activityPrompt: 'Jump 10 times holding an imaginary skipping rope.' },
      { subject: 'Music & Rhythm', topic: 'Family Rhyme in Tamil', subtopic: 'Singing with pride', durationMinutes: 10, taskType: 'activity', activityPrompt: 'Sing அன்பான குடும்பம் song.' },
      { subject: 'Daily Revision', topic: 'Recap Family Words & Letters Y–Z', subtopic: 'Family member naming', durationMinutes: 10, taskType: 'revision', activityPrompt: 'Name each person in the home and recite full A-Z.' }
    ],
    dailyRevision: 'Recap full Tamil vowels (அ to ஔ, ஃ) and English alphabet (A to Z).',
    dailyTestSummary: { questionCount: 4, testType: 'oral', focusArea: 'Full Alphabet & Family' }
  },
  {
    dayNumber: 8,
    blockNumber: 1,
    phaseTitle: 'Phase 1: Foundation & Pre-Writing Readiness',
    themeTitle: 'Simple Tamil Words (அம்மா, அப்பா), Phonics & School Objects',
    totalDurationMins: 130,
    tasks: [
      { subject: 'Tamil', topic: 'Simple Words (அம்மா, அப்பா, அனில்)', subtopic: 'Two-letter word blending', durationMinutes: 15, taskType: 'reading', activityPrompt: 'Read அ-ம்-மா = அம்மா with phonics.' },
      { subject: 'English', topic: 'Phonics Sounds A–Z Review', subtopic: 'A says /æ/, B says /b/, C says /k/', durationMinutes: 15, taskType: 'reading', activityPrompt: 'Make sound of each letter from A to Z.' },
      { subject: 'Maths', topic: 'Numbers 21–25 Recognition', subtopic: 'Writing numbers 21 to 25', durationMinutes: 20, taskType: 'practice', activityPrompt: 'Write numbers 21, 22, 23, 24, 25 on paper.' },
      { subject: 'EVS', topic: 'School Objects (Book, Pencil, Bag, Water Bottle)', subtopic: 'Names and caring for school belongings', durationMinutes: 20, taskType: 'activity', activityPrompt: 'Pack and unpack pencil, eraser, and book in school bag.' },
      { subject: 'Rhymes & Stories', topic: '“Off to School Song”', subtopic: 'Excitement for learning and friends', durationMinutes: 20, taskType: 'video', activityPrompt: 'Sing along to school morning routine song.' },
      { subject: 'Arts & Crafts', topic: 'Color a School Bag', subtopic: 'Multi-color pattern coloring', durationMinutes: 10, taskType: 'activity', activityPrompt: 'Color school bag with favorite 2 colors.' },
      { subject: 'Physical Activity', topic: 'Throw & Catch Ball with Two Hands', subtopic: 'Catch reflex and hand speed', durationMinutes: 10, taskType: 'activity', activityPrompt: 'Catch soft ball 10 times without dropping.' },
      { subject: 'Music & Rhythm', topic: 'Clap Rhythm Pattern (1-2, 1-2-3)', subtopic: 'Syncopated clapping', durationMinutes: 10, taskType: 'activity', activityPrompt: 'Follow parent’s clap rhythm.' },
      { subject: 'Daily Revision', topic: 'Recap School Objects & Phonics', subtopic: 'Object naming game', durationMinutes: 10, taskType: 'revision', activityPrompt: 'Identify pencil, eraser, notebook from sight.' }
    ],
    dailyRevision: 'Recap school objects and numbers 21–25.',
    dailyTestSummary: { questionCount: 3, testType: 'oral', focusArea: 'School Objects & Phonics' }
  },
  {
    dayNumber: 9,
    blockNumber: 1,
    phaseTitle: 'Phase 1: Foundation & Pre-Writing Readiness',
    themeTitle: 'Words with Vowels (ஆடு, ஈகை), CVC Words & Vegetables',
    totalDurationMins: 130,
    tasks: [
      { subject: 'Tamil', topic: 'Words with Vowels (ஆடு, இலை, ஈகை, உரல்)', subtopic: 'Picture to word matching', durationMinutes: 15, taskType: 'reading', activityPrompt: 'Match picture of goat with ஆடு.' },
      { subject: 'English', topic: 'Small CVC Words (cat, bat, mat, rat)', subtopic: '-at family blending', durationMinutes: 15, taskType: 'reading', activityPrompt: 'Blend c-a-t = cat, b-a-t = bat.' },
      { subject: 'Maths', topic: 'Numbers 26–30 Recognition', subtopic: 'Counting groups of 5 objects', durationMinutes: 20, taskType: 'practice', activityPrompt: 'Count up to 30 with counting beads.' },
      { subject: 'EVS', topic: 'Vegetables (Carrot, Potato, Tomato, Onion)', subtopic: 'Healthy eating & colors of veggies', durationMinutes: 20, taskType: 'activity', activityPrompt: 'Touch smooth tomato and orange carrot in kitchen.' },
      { subject: 'Rhymes & Stories', topic: '“Vegetable Song” (Carrots, Peas & Broccoli...)', subtopic: 'Nutrition rhyme and vegetable puppet show', durationMinutes: 20, taskType: 'video', activityPrompt: 'Sing vegetable soup song.' },
      { subject: 'Arts & Crafts', topic: 'Vegetable Stamping (Ladyfinger / Potato Stamp)', subtopic: 'Block stamping with paint', durationMinutes: 10, taskType: 'activity', activityPrompt: 'Dip cut ladyfinger in paint to make flower patterns on paper.' },
      { subject: 'Physical Activity', topic: 'Full Body Stretching & Side Bends', subtopic: 'Spine flexibility', durationMinutes: 10, taskType: 'activity', activityPrompt: 'Reach high like touching clouds, bend left and right.' },
      { subject: 'Music & Rhythm', topic: 'Tamil Chanting Rhyme (காய்கறி பாட்டு)', subtopic: 'Word association song', durationMinutes: 10, taskType: 'activity', activityPrompt: 'Sing தக்காளி சிவப்பு, வெண்டைக்காய் பச்சை.' },
      { subject: 'Daily Revision', topic: 'Recap Vegetables & CVC Words', subtopic: 'Reading -at words', durationMinutes: 10, taskType: 'revision', activityPrompt: 'Read cat, bat, mat aloud and name 3 vegetables.' }
    ],
    dailyRevision: 'Recap vegetables and -at word family.',
    dailyTestSummary: { questionCount: 3, testType: 'oral', focusArea: 'CVC Words & Vegetables' }
  },
  {
    dayNumber: 10,
    blockNumber: 1,
    phaseTitle: 'Phase 1: Foundation & Pre-Writing Readiness',
    themeTitle: 'Consonant Words (கல், பல்), -og Words, Birds & Block 1 Milestone',
    totalDurationMins: 130,
    tasks: [
      { subject: 'Tamil', topic: 'Words with Consonants (கல், பல், கண், மண்)', subtopic: 'Two-letter word pronunciation', durationMinutes: 15, taskType: 'reading', activityPrompt: 'Touch tooth for பல் and stone for கல்.' },
      { subject: 'English', topic: 'Words with Vowels (dog, log, fog, frog)', subtopic: '-og family blending & reading', durationMinutes: 15, taskType: 'reading', activityPrompt: 'Read d-o-g = dog, l-o-g = log.' },
      { subject: 'Maths', topic: 'Numbers 31–35 & Review 1–35', subtopic: 'Full milestone count 1 to 35', durationMinutes: 20, taskType: 'practice', activityPrompt: 'Write numbers 1 to 35 on blackboard/slate.' },
      { subject: 'EVS', topic: 'Birds (Crow, Parrot, Sparrow, Peacock)', subtopic: 'Feathers, wings and bird calls', durationMinutes: 20, taskType: 'activity', activityPrompt: 'Flap arms like wings and whistle like a bird.' },
      { subject: 'Rhymes & Stories', topic: '“Two Little Dicky Birds” + Peacock Dance', subtopic: 'Bird rhyme with hand actions', durationMinutes: 20, taskType: 'video', activityPrompt: 'Act out: Peter fly away, Paul fly away!' },
      { subject: 'Arts & Crafts', topic: 'Draw & Color a Green Parrot with Red Beak', subtopic: 'Color combination', durationMinutes: 10, taskType: 'activity', activityPrompt: 'Color parrot body green and beak bright red.' },
      { subject: 'Physical Activity', topic: '10-Meter Sprint / Running Race', subtopic: 'Speed and stamina', durationMinutes: 10, taskType: 'activity', activityPrompt: 'Run 10 meters fast to touch parent’s hand.' },
      { subject: 'Music & Rhythm', topic: 'Group Celebration Song for Completing Day 10!', subtopic: 'Celebration clapping and dancing', durationMinutes: 10, taskType: 'activity', activityPrompt: 'Sing and celebrate completing Block 1 (Days 1–10)!' },
      { subject: 'Daily Revision', topic: 'Grand Review of Block 1 (Days 1–10)', subtopic: 'Celebratory milestone quiz', durationMinutes: 10, taskType: 'revision', activityPrompt: 'Review letters A-Z, Tamil vowels, and numbers 1-35.' }
    ],
    dailyRevision: 'Block 1 Complete! Grand review of all letters, numbers 1–35, shapes, and colors.',
    dailyTestSummary: { questionCount: 5, testType: 'oral', focusArea: 'Block 1 Grand Milestone Quiz' }
  }
];

// ─── Automated AI Curriculum Generator for Any Course ──────────
async function generateBlockWithGemini(courseTitle, category, standard, startDay, endDay, totalDays, subjects) {
  const blockNum = Math.ceil(startDay / 10);
  const prompt = `You are the Master Academic Curriculum Specialist for Government of Tamil Nadu (TNSB Samacheer Kalvi), CBSE NCERT, TNPSC, UPSC, NEET/JEE, and Professional Tech Education.

Generate a rigorously structured, day-by-day coaching plan for:
- Course / Program: "${courseTitle}"
- Category: "${category}"
- Standard / Level: "${standard}"
- Target Days in this Block: Days ${startDay} to ${endDay} (out of ${totalDays} Total Days)
- Core Subjects / Domains to cover across these days: ${subjects.join(', ')}

Structure each day (from Day ${startDay} to Day ${endDay}) strictly with the following JSON schema:
[
  {
    "dayNumber": ${startDay},
    "blockNumber": ${blockNum},
    "phaseTitle": "Phase 1: Core Foundation & Syllabus Orientation",
    "themeTitle": "<concise theme for this day>",
    "totalDurationMins": 120,
    "tasks": [
      {
        "subject": "<Subject Name>",
        "topic": "<Specific Topic aligned with latest govt syllabus>",
        "subtopic": "<Micro-topic or specific sub-skill>",
        "durationMinutes": 15,
        "taskType": "reading|video|practice|activity|test|revision",
        "activityPrompt": "<Concrete actionable learning instruction>"
      }
      // 5 to 8 timed tasks covering the required subjects for this grade/exam
    ],
    "dailyRevision": "<Specific revision summary instruction for end of day>",
    "dailyTestSummary": {
      "questionCount": 5,
      "testType": "oral|mcq|hands-on",
      "focusArea": "<Target focus area of today's mini test>"
    }
  }
]

CRITICAL RULES:
1. Aligns 100% with the official government / board syllabus.
2. If Tamil medium or TNPSC Tamil, include authentic Tamil script in topics/tasks.
3. Output MUST be ONLY valid JSON array (no markdown fences, no explanatory text).`;

  for (let attempt = 0; attempt < 3; attempt++) {
    const key = getNextApiKey();
    try {
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
        }
      });

      const res = await model.generateContent(prompt);
      const txt = (await res.response).text().trim();
      let clean = txt;
      if (clean.startsWith('```')) {
        clean = clean.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
      }
      const parsed = JSON.parse(clean);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (err) {
      console.warn(`[Gemini Attempt ${attempt + 1} for ${courseTitle} Days ${startDay}-${endDay}]:`, err.message);
      await new Promise(r => setTimeout(r, 600));
    }
  }

  throw new Error(`Failed to generate block for ${courseTitle} Days ${startDay}-${endDay}`);
}

// ─── Save Plan to Supabase & Local JSON ─────────────────────────
async function saveCoursePlan(courseId, courseTitle, category, totalDays, dayPlans) {
  // 1. Save locally for instant offline mobile load
  const sanitized = courseTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const filePath = path.join(LOCAL_OUTPUT_DIR, `${sanitized}_plan.json`);
  
  let existing = [];
  if (fs.existsSync(filePath)) {
    try {
      existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {}
  }
  
  // Merge by dayNumber
  const planMap = new Map();
  existing.forEach(d => planMap.set(d.dayNumber, d));
  dayPlans.forEach(d => planMap.set(d.dayNumber, d));
  const merged = Array.from(planMap.values()).sort((a, b) => a.dayNumber - b.dayNumber);

  fs.writeFileSync(filePath, JSON.stringify(merged, null, 2), 'utf8');
  console.log(`💾 Saved ${merged.length} days locally to: ${filePath}`);

  // 2. Save into Supabase unified_master_data
  try {
    const supabasePayload = {
      item_type: 'o_course_daily_plan',
      title_name: courseTitle,
      category: category,
      additional_info: {
        totalDays: totalDays,
        plansCount: merged.length,
        dayPlans: merged
      },
      metadata: {
        updatedAt: new Date().toISOString(),
        source: 'Automated AI Curriculum Engine v2.0'
      }
    };

    const { data, error } = await supabase
      .from('unified_master_data')
      .upsert(supabasePayload, { onConflict: 'item_type,title_name' })
      .select('id');

    if (error) {
      console.warn(`⚠️ Supabase Upsert Note for ${courseTitle}:`, error.message);
    } else {
      console.log(`☁️ Supabase Synced successfully for ${courseTitle}!`);
    }
  } catch (err) {
    console.warn(`Supabase network write skipped:`, err.message);
  }
}

// ─── Master Runner ─────────────────────────────────────────────
async function runSeeding() {
  console.log('====================================================');
  console.log('🚀 TeachO Automated 200/360-Day Curriculum Seeder');
  console.log('====================================================\n');

  // 1. Seed LKG Golden Plan (Days 1–10)
  console.log('🌱 Seeding LKG Foundation (Days 1–10)...');
  await saveCoursePlan(
    'lkg_tnsb_200',
    'LKG Foundation Tuition & Activity Routine',
    'school_tnsb_en',
    200,
    LKG_DAYS_1_TO_10
  );

  // 2. Target courses to generate Days 1–10 initial blocks
  const targetCourses = [
    {
      id: 'ukg_tnsb_200',
      title: 'UKG Kindergarten & Phonics Routine',
      category: 'school_tnsb_en',
      standard: 'UKG',
      totalDays: 200,
      subjects: ['Tamil Phonics & Words', 'English CVC & Sight Words', 'Maths 1-50 & Addition', 'EVS & Habits', 'Rhymes & Moral Stories', 'Drawing & Motor Skills', 'Physical Yoga']
    },
    {
      id: 'class_1_tnsb_200',
      title: 'Class 1 (TNSB English Medium)',
      category: 'school_tnsb_en',
      standard: 'Class 1',
      totalDays: 200,
      subjects: ['Tamil (தமிழ் பாடநூல்)', 'English (Prose & Poem)', 'Mathematics (Addition, Subtraction & Shapes)', 'EVS (Our Environment)', 'General Knowledge & Quiz', 'Daily Revision']
    },
    {
      id: 'class_2_tnsb_200',
      title: 'Class 2 (TNSB English Medium)',
      category: 'school_tnsb_en',
      standard: 'Class 2',
      totalDays: 200,
      subjects: ['Tamil (பாடம் & செய்யுள்)', 'English (Reading & Phonics)', 'Mathematics (2-Digit Numbers & Money)', 'EVS (Plants & Animals)', 'Daily Revision']
    },
    {
      id: 'class_3_tnsb_200',
      title: 'Class 3 (TNSB English Medium)',
      category: 'school_tnsb_en',
      standard: 'Class 3',
      totalDays: 200,
      subjects: ['Tamil (இலக்கணம் & உரைநடை)', 'English (Grammar & Stories)', 'Mathematics (Multiplication & Division)', 'Science (Living & Non-Living)', 'Social Science', 'Daily Revision']
    },
    {
      id: 'class_4_tnsb_200',
      title: 'Class 4 (TNSB English Medium)',
      category: 'school_tnsb_en',
      standard: 'Class 4',
      totalDays: 200,
      subjects: ['Tamil (செய்யுள் & இலக்கணம்)', 'English (Grammar & Composition)', 'Mathematics (Fractions & Geometry)', 'Science (Matter & Energy)', 'Social Science (Monuments & Kings)', 'Daily Practice Test']
    },
    {
      id: 'class_5_tnsb_200',
      title: 'Class 5 (TNSB English Medium)',
      category: 'school_tnsb_en',
      standard: 'Class 5',
      totalDays: 200,
      subjects: ['Tamil (செய்யுள், உரைநடை, இலக்கணம்)', 'English Grammar & Comprehension', 'Mathematics (Fractions, Decimals, Perimeter)', 'Science (Organ Systems, Matter)', 'Social Science (History, Globe)', 'Daily Practice Test']
    },
    {
      id: 'tnpsc_grp4_ta_360',
      title: 'TNPSC Group 4 & VAO (தமிழ் வழி)',
      category: 'tnpsc',
      standard: 'TNPSC Group 4',
      totalDays: 360,
      subjects: ['பொதுத்தமிழ் (பகுதி அ, ஆ, இ)', 'இந்திய அரசியலமைப்பு (Polity)', 'கணிதம் & உளவியல் (Aptitude)', 'இந்திய வரலாறு & பண்பாடு (History)', 'நடப்பு நிகழ்வுகள் (Current Affairs)', 'தினசரி மாதிரித் தேர்வு (Daily OMR Test)']
    },
    {
      id: 'upsc_civil_360',
      title: 'UPSC Civil Services (IAS / IPS / IFS)',
      category: 'upsc_central',
      standard: 'UPSC Civil Services',
      totalDays: 360,
      subjects: ['Indian Polity & Governance (Laxmikanth)', 'Modern Indian History & Freedom Struggle (Spectrum)', 'Indian Economy & Budget', 'Geography & Environment (NCERT + Mapping)', 'CSAT Aptitude & Comprehension', 'Daily Prelims & Mains Answer Writing']
    },
    {
      id: 'neet_ug_360',
      title: 'NEET UG Medical (Target 680+)',
      category: 'entrance',
      standard: 'NEET UG',
      totalDays: 360,
      subjects: ['Physics (Mechanics, Kinematics & Formulas)', 'Chemistry (Inorganic, Organic & Physical NCERT)', 'Botany (Plant Diversity & Cell Biology)', 'Zoology (Human Physiology & Genetics)', 'Daily 45-Min Speed Mock Test']
    },
    {
      id: 'fullstack_web_180',
      title: 'Full-Stack Web & Mobile App Developer',
      category: 'skills',
      standard: 'Professional Tech',
      totalDays: 180,
      subjects: ['TypeScript & Modern ES6+', 'React Native & Mobile Architecture', 'Node.js & Supabase Backend APIs', 'UI/UX & Accessibility Styling', 'Git, Deployment & Live Project Building']
    }
  ];

  for (const c of targetCourses) {
    console.log(`\n📚 Generating Days 1–10 for: "${c.title}" (${c.totalDays} Total Days)...`);
    try {
      const generatedDays = await generateBlockWithGemini(
        c.title,
        c.category,
        c.standard,
        1,
        10,
        c.totalDays,
        c.subjects
      );
      console.log(`✅ Generated ${generatedDays.length} days for ${c.title}.`);
      await saveCoursePlan(c.id, c.title, c.category, c.totalDays, generatedDays);
    } catch (e) {
      console.error(`❌ Error generating ${c.title}:`, e.message);
    }
  }

  console.log('\n🎉 Seeding initial 10-Day Blocks Completed for all target courses!');
}

if (require.main === module) {
  runSeeding().catch(console.error);
}

module.exports = {
  runSeeding,
  generateBlockWithGemini,
  saveCoursePlan,
  LKG_DAYS_1_TO_10
};
