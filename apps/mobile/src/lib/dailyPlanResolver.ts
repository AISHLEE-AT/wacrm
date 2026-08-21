/**
 * TeachO Daily Plan Resolver
 * Resolves full 200-day or 360-day structured daily tasks for any grade or exam.
 * Fallbacks to verified master offline catalogs if network is unavailable.
 */

import { aishleeSupabase } from '../services/aishleeSupabase';

export interface DailySubjectTask {
  subject: string;
  topic: string;
  subtopic?: string;
  microTopicKey?: string;
  durationMinutes: number;
  taskType: 'video' | 'reading' | 'practice' | 'activity' | 'test' | 'revision';
  activityPrompt?: string;
  completed?: boolean;
}

export interface DayPlan {
  dayNumber: number;
  blockNumber: number;
  phaseTitle: string;
  themeTitle: string;
  totalDurationMins: number;
  tasks: DailySubjectTask[];
  dailyRevision: string;
  dailyTestSummary: {
    questionCount: number;
    testType: 'oral' | 'mcq' | 'hands-on';
    focusArea: string;
  };
}

// ─── Golden LKG Plan (Days 1–10 Fallback) ────────────────────────
export const LKG_GOLDEN_DAYS: DayPlan[] = [
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
  }
];

// ─── 1. COMPREHENSIVE 360-DAY TNPSC SYLLABUS TOPIC MATRICES ───────────────────

// Tamil Literature & Grammar Matrix (30 Thematic Units covering 133 Adhikarams & 100/100 Syllabus)
const TNPSC_TAMIL_SYLLABUS = [
  { topic: 'பகுதி ஆ: திருக்குறள் — கடவுள் வாழ்த்து & வான்சிறப்பு (அதிகாரம் 1, 2)', subtopic: 'அகர முதல எழுத்தெல்லாம் & துப்பார்க்குத் துப்பாய குறட்பாக்கள் நயவுரை' },
  { topic: 'பகுதி ஆ: திருக்குறள் — நீத்தார் பெருமை & அறன் வலியுறுத்தல் (அதிகாரம் 3, 4)', subtopic: 'ஒழுக்கத்து நீத்தார் பெருமை & மனத்துக்கண் மாசிலன் ஆதல்' },
  { topic: 'பகுதி ஆ: திருக்குறள் — இல்வாழ்க்கை & வாழ்க்கைத் துணைநலம் (அதிகாரம் 5, 6)', subtopic: 'அன்பும் அறனும் உடைத்தாயின் இல்வாழ்க்கை பண்பும் பயனும் அது' },
  { topic: 'பகுதி ஆ: திருக்குறள் — மக்கட்பேறு & அன்படைமை (அதிகாரம் 7, 8)', subtopic: 'தம்பொருள் என்பதம் மக்கள் & அன்பிலார் எல்லாம் தமக்குரியர்' },
  { topic: 'பகுதி ஆ: திருக்குறள் — விருந்தோம்பல் & இனியவை கூறல் (அதிகாரம் 9, 10)', subtopic: 'விருந்து புறத்ததாத் தானுண்டல் & பணிவுடையன் இன்சொலன் ஆதல்' },
  { topic: 'பகுதி ஆ: திருக்குறள் — செய்ந்நன்றியறிதல் & நடுவுநிலைமை (அதிகாரம் 11, 12)', subtopic: 'செய்யாமல் செய்த உதவி & சமன்செய்து சீர்தூக்கும் கோல்போல்' },
  { topic: 'பகுதி ஆ: திருக்குறள் — அடக்கமுடைமை & ஒழுக்கமுடைமை (அதிகாரம் 13, 14)', subtopic: 'யாகாவா ராயினும் நாகாக்க & ஒழுக்கம் விழுப்பம் தரலான்' },
  { topic: 'பகுதி ஆ: திருக்குறள் — பொறையுடைமை & தீவினையச்சம் (அதிகாரம் 16, 21)', subtopic: 'அகழ்வாரைத் தாங்கும் நிலம்போல & தீயவை தீய பயத்தலால்' },
  { topic: 'பகுதி ஆ: திருக்குறள் — கல்வி, கல்லாமை & கேள்வி (அதிகாரம் 40, 41, 42)', subtopic: 'கற்க கசடறக் கற்பவை & செல்வத்துள் செல்வம் செவிச்செல்வம்' },
  { topic: 'பகுதி ஆ: திருக்குறள் — அறிவுடைமை & பெரியாரைத் துணைக்கோடல் (அதிகாரம் 43, 45)', subtopic: 'அறிவற்றங் காக்கும் கருவி & இடிப்பாரை இல்லாத ஏமரா மன்னன்' },
  { topic: 'பகுதி ஆ: திருக்குறள் — காலம் அறிதல் & இடம் அறிதல் (அதிகாரம் 49, 50)', subtopic: 'பகல்வெல்லும் கூகையைக் காக்கை & நெடும்புனலுள் வெல்லும் முதலை' },
  { topic: 'பகுதி ஆ: திருக்குறள் — தெரிந்து செயல்வகை & வலி அறிதல் (அதிகாரம் 47, 48)', subtopic: 'செய்தக்க அல்ல செயக்கெடும் & பீலிபெய் சாகாடும் அச்சிறும்' },
  { topic: 'பகுதி அ: எழுத்து இலக்கணம் — முதல் & சார்பெழுத்துகள் (10 வகைகள்)', subtopic: 'உயிர்மெய், ஆய்தம், உயிரளபெடை, ஒற்றளபெடை, குற்றியலுகரம், குற்றியலிகரம்' },
  { topic: 'பகுதி அ: சொல் இலக்கணம் — பெயர், வினை, இடை, உரிச்சொற்கள்', subtopic: 'பகாப்பதம், பகுபதம், பகுபத உறுப்புகள் (6 உறுப்புகள்) அறிதல்' },
  { topic: 'பகுதி அ: வேற்றுமை உருபுகள் (1 முதல் 8 வரை) & சொல்லுருபுகள்', subtopic: 'ஐ, ஆல், கு, இன், அது, கண் வேற்றுமை தொடர்கள் & விளி வேற்றுமை' },
  { topic: 'பகுதி அ: வலிமிகும் இடங்கள் & வலிமிகா இடங்கள் விதிகள்', subtopic: 'நிலைமொழி, வருமொழி சந்தி விதிகள் & பிழையற்ற தமிழ் வாக்கியங்கள்' },
  { topic: 'பகுதி அ: ஓரெழுத்து ஒருமொழி (42 சொற்கள்) & வேர்ச்சொல் மாற்றம்', subtopic: 'ஆ, மா, கோ, தீ, பூ, தை, வை மற்றும் வினையாலணையும் பெயர் விதிகள்' },
  { topic: 'பகுதி அ: இலக்கணக் குறிப்பறிதல் — பண்புத்தொகை, உவமைத்தொகை, உம்மைத்தொகை', subtopic: 'அன்மொழித்தொகை, வினைத்தொகை & இருபெயரொட்டுப் பண்புத்தொகை' },
  { topic: 'பகுதி ஆ: சிலப்பதிகாரம் — மங்கல வாழ்த்துப் பாடல் & புகார்க் காண்டம்', subtopic: 'திங்களைப் போற்றுதும், ஞாயிறு போற்றுதும் & இளங்கோவடிகள் வரலாறு' },
  { topic: 'பகுதி ஆ: மணிமேகலை — ஆபுத்திரன் நாடு அடைந்த காதை & பாத்திர மரபு', subtopic: 'சீத்தலைச் சாத்தனார் & பசிப்பிணி போக்கிய அமுதசுரபி சிறப்புகள்' },
  { topic: 'பகுதி ஆ: கம்பராமாயணம் — பால காண்டம் & குகப் படலம்', subtopic: 'கம்பர் வரலாறு, 6 காண்டங்கள், 118 படலங்கள், "அண்ணலும் நோக்கினான் அவளும் நோக்கினாள்"' },
  { topic: 'பகுதி ஆ: பெரியபுராணம் & திருவிளையாடற் புராணம்', subtopic: 'சேக்கிழார் இயற்றிய திருத்தொண்டர் புராணம் & பரஞ்சோதி முனிவர் திருவிளையாடல்கள்' },
  { topic: 'பகுதி ஆ: எட்டுத்தொகை நூல்கள் — நற்றிணை, குறுந்தொகை, ஐங்குறுநூறு', subtopic: 'திணைப் பாடல்கள், அடிவரையறை, தொகுத்தவர், தொகுப்பித்தவர் குறிப்புகள்' },
  { topic: 'பகுதி ஆ: பத்துப்பாட்டு நூல்கள் — முல்லைப்பாட்டு, குறிஞ்சிப்பாட்டு, பட்டினப்பாலை', subtopic: 'நக்கீரர், கபிலர், நப்பூதனார் & சங்ககால வணிகத் துறைமுகங்கள்' },
  { topic: 'பகுதி இ: பாரதியார் — பாஞ்சாலி சபதம், கண்ணன் பாட்டு, விடுதலைப் பாடல்கள்', subtopic: 'சுதேசமித்திரன், இந்தியா இதழ்கள் & மகாகவி பாரதியாரின் தமிழ்த் தொண்டு' },
  { topic: 'பகுதி இ: பாரதிதாசன் — பாண்டியன் பரிசு, அழகின் சிரிப்பு, குடும்ப விளக்கு', subtopic: 'புரட்சிக் கவிஞர் & பாவேந்தர் படைப்புகளின் சமுதாய விழிப்புணர்வு' },
  { topic: 'பகுதி இ: உ.வே. சாமிநாதையர் & மறைமலையடிகள் தமிழ்த் தொண்டு', subtopic: 'தமிழ்த்தாத்தா ஓலைச்சுவடிப் பதிப்புப் பணிகள் & தனித்தமிழ் இயக்கம்' },
  { topic: 'பகுதி இ: தந்தை பெரியார் & பேரறிஞர் அண்ணா சமுதாய சீர்திருத்தங்கள்', subtopic: 'சுயமரியாதை இயக்கம், குடியரசு இதழ், பெண் விடுதலை & தமிழ் எழுத்துச் சீர்திருத்தம்' },
  { topic: 'பகுதி இ: டாக்டர் பாபாசாகேப் அம்பேத்கர் & பசும்பொன் முத்துராமலிங்கத் தேவர்', subtopic: 'இந்திய அரசியலமைப்பு வரைவுக்குழு தலைமை & நேதாஜியுடன் தேசியத் தொண்டு' },
  { topic: 'பகுதி இ: நவீன தமிழ் இலக்கியம் — புதுக்கவிதைகள், சிறுகதைகள் & உரைநடை', subtopic: 'நா. பார்த்தசாரதி, புதுமைப்பித்தன், சுஜாதா & சாகித்திய அகாதெமி விருதுகள்' }
];

// Indian Polity Matrix (30 High-Yield Sequential Modules)
const TNPSC_POLITY_SYLLABUS = [
  { topic: 'இந்திய அரசியலமைப்பு உருவாக்கம் & வரைவுக்குழு (1946–1949)', subtopic: 'டாக்டர் அம்பேத்கர், கேபினட் மிஷன், 2 ஆண்டுகள் 11 மாதங்கள் 18 நாட்கள் வரலாறு' },
  { topic: 'இந்திய அரசியலமைப்பின் சிறப்பியல்புகள் & முகப்புரை (Preamble)', subtopic: 'சமதர்ம, மதச்சார்பற்ற, ஜனநாயக, குடியரசு & 42-வது அரசியலமைப்பு திருத்தம்' },
  { topic: 'பகுதி 1 & 2: இந்திய ஒன்றியம் மற்றும் குடியுரிமை (Articles 1–11)', subtopic: 'மாநிலங்கள் மறுசீரமைப்பு சட்டம் 1956 & குடியுரிமை சட்டம் 1955 (5 வழிகள்)' },
  { topic: 'பகுதி 3: அடிப்படை உரிமைகள் — சமத்துவ உரிமை (Articles 14–18)', subtopic: 'சட்டத்தின் முன் சமம், பாகுபாடு தடை, தீண்டாமை ஒழிப்பு (Art 17), பட்டங்கள் ஒழிப்பு' },
  { topic: 'பகுதி 3: சுதந்திர உரிமை & வாழ்வுரிமை (Articles 19–22)', subtopic: '6 அடிப்படை சுதந்திரங்கள், குற்றங்களுக்கு எதிரான பாதுகாப்பு & பிரிவு 21 வாழ்வுரிமை' },
  { topic: 'பகுதி 3: கல்வி உரிமை (Art 21A) & சுரண்டலுக்கு எதிரான உரிமை (Art 23–24)', subtopic: '86-வது திருத்தம் 2002, கொத்தடிமை முறை ஒழிப்பு & குழந்தைத் தொழிலாளர் தடை' },
  { topic: 'பகுதி 3: மத சுதந்திரம் & கலாச்சார கல்வி உரிமைகள் (Articles 25–30)', subtopic: 'மதத்தைப் பரப்பும் சுதந்திரம், சிறுபான்மையினர் கல்வி நிறுவனங்கள் அமைக்கும் உரிமை' },
  { topic: 'பகுதி 3: அரசியலமைப்பு தீர்வு காணும் உரிமை & 5 நீதிப்பேராணைகள் (Art 32 & 226)', subtopic: 'ஆட்கொணர்வு, கட்டளையிடும், தடையுறுத்தும், ஆவணக்கேட்பு, தகுதிமுறை வினவும் நீதிப்பேராணைகள்' },
  { topic: 'பகுதி 4: அரசு வழிகாட்டு நெறிமுறைகள் — DPSP (Articles 36–51)', subtopic: 'சமதர்ம, காந்திய, தாராளமய கோட்பாடுகள் & பொது சிவில் சட்டம் (Article 44)' },
  { topic: 'பகுதி 4A: அடிப்படைக் கடமைகள் (Article 51A — 11 கடமைகள்)', subtopic: 'ஸ்வரண் சிங் கமிட்டி, 42-வது திருத்தம் 1976 & 6-14 வயது குழந்தைக் கல்வி கடமை' },
  { topic: 'பகுதி 5: இந்தியக் குடியரசுத் தலைவர் — தகுதிகள், அதிகாரங்கள் & தேர்தல் (Art 52–62)', subtopic: 'ஒற்றை மாற்று வாக்கு முறை, மன்னிப்பளிக்கும் அதிகாரம் (Art 72), பதவி நீக்கம் (Art 61)' },
  { topic: 'பகுதி 5: இந்தியத் துணைக் குடியரசுத் தலைவர் & பிரதமர் (Articles 63–75)', subtopic: 'மாநிலங்களவைத் தலைவர் & மத்திய அமைச்சரவை கூட்டுப் பொறுப்பு விதி' },
  { topic: 'பகுதி 5: இந்திய நாடாளுமன்றம் — மக்களவை & மாநிலங்களவை (Articles 79–106)', subtopic: 'மக்களவை சபாநாயகர், நிதி மசோதா (Art 110), ஆண்டு நிதிநிலை அறிக்கை (Art 112)' },
  { topic: 'பகுதி 5: இந்திய உச்ச நீதிமன்றம் — நீதித்துறை & கொலீஜியம் (Articles 124–147)', subtopic: 'தலைமை நீதிபதி, அசல், மேல்முறையீட்டு & நீதி மறுஆய்வு (Judicial Review) அதிகாரங்கள்' },
  { topic: 'பகுதி 5: இந்திய தலைமை கணக்குத் தணிக்கையாளர் — CAG (Articles 148–151)', subtopic: 'பொது நிதியின் பாதுகாவலர், தணிக்கை அறிக்கைகள் & பொதுக்கணக்குக் குழு' },
  { topic: 'பகுதி 6: மாநில ஆளுநர் — நியமனம், அதிகாரங்கள் & வரம்புகள் (Articles 153–162)', subtopic: 'குடியரசுத் தலைவர் பிரதிநிதி, தன்னிச்சை அதிகாரங்கள் & பிரிவு 356 பரிந்துரை' },
  { topic: 'பகுதி 6: மாநில முதலமைச்சர் & அமைச்சரவை (Articles 163–167)', subtopic: 'மாநில அரசின் உண்மையான தலைவர் & சட்டப்பேரவைக்குப் பொறுப்புடைமை' },
  { topic: 'பகுதி 6: மாநில சட்டமன்றம் — சட்டப்பேரவை & சட்ட மேலவை (Articles 168–212)', subtopic: 'தமிழ்நாடு சட்டமன்ற கட்டமைப்பு, மசோதாக்கள் நிறைவேறும் முறை' },
  { topic: 'பகுதி 6: சென்னை உயர் நீதிமன்றம் & கீழமை நீதிமன்றங்கள் (Articles 214–237)', subtopic: 'நீதிப்பேராணை அதிகாரம் (Art 226), மதுரை கிளை & லோக் அதாலத் (மக்கள் நீதிமன்றம்)' },
  { topic: 'பகுதி 9: பஞ்சாயத்து ராஜ் அமைப்புகள் (73-வது அரசியலமைப்பு திருத்தம் 1992)', subtopic: 'பல்வந்த்ராய் மேத்தா குழு, 3 அடுக்கு முறை, கிராம சபை & 11-வது அட்டவணை (29 பணிகள்)' },
  { topic: 'பகுதி 9A: நகராட்சிகள் & மாநகராட்சிகள் (74-வது அரசியலமைப்பு திருத்தம் 1992)', subtopic: 'சென்னை மாநகராட்சி (1688), நகராட்சித் தலைவர் & 12-வது அட்டவணை (18 பணிகள்)' },
  { topic: 'பகுதி 11 & 12: மத்திய-மாநில உறவுகள் (சட்ட, நிர்வாக & நிதி உறவுகள்)', subtopic: 'சர்க்காரியா ஆணையம், பூஞ்சி ஆணையம், ராஜமன்னார் குழு & ஜி.எஸ்.டி கவுன்சில்' },
  { topic: 'நிதி ஆணையம் (Article 280) & மத்திய திட்டமிடல் பரிணாமம்', subtopic: 'மத்திய-மாநில வரிப் பகிர்வு, 15-வது நிதி ஆணையம் & நிதி ஆயோக் (NITI Aayog)' },
  { topic: 'பகுதி 14: அரசுப் பணியாளர் தேர்வாணையங்கள் — UPSC & TNPSC (Art 315–323)', subtopic: 'அகில இந்தியப் பணிகள் (IAS, IPS, IFS Art 312), TNPSC தலைவர் & உறுப்பினர்கள் நியமனம்' },
  { topic: 'பகுதி 15: இந்தியத் தேர்தல் ஆணையம் & தேர்தல் சீர்திருத்தங்கள் (Art 324–329)', subtopic: 'வாக்குரிமை வயது 18 (61-வது திருத்தம்), தேர்தல் நடத்தை விதிகள், EVM & VVPAT முறை' },
  { topic: 'பகுதி 17: ஆட்சி மொழிகள் & எட்டாவது அட்டவணை (22 மொழிகள்)', subtopic: 'செம்மொழித் தகுதி (தமிழ் - 2004), அலுவல் மொழிச் சட்டம் 1963 & பிரிவு 343-351' },
  { topic: 'பகுதி 18: அவசரநிலைப் பிரகடனங்கள் (Articles 352, 356 & 360)', subtopic: 'தேசிய அவசரநிலை, மாநிலக் குடியரசுத் தலைவர் ஆட்சி & நிதி அவசரநிலை விதிகள்' },
  { topic: 'பகுதி 20: அரசியலமைப்பு திருத்தச் சட்டம் (Article 368 நடைமுறைகள்)', subtopic: 'சாதாரண பெரும்பான்மை, தனிப் பெரும்பான்மை & முக்கிய அரசியலமைப்பு திருத்தங்கள்' },
  { topic: 'கட்சித் தாவல் தடைச் சட்டம் (10-வது அட்டவணை, 52 & 91-வது திருத்தங்கள்)', subtopic: 'சபாநாயகர் அதிகாரம், 1/3 முதல் 2/3 உறுப்பினர்கள் விலக்கு விதிகள்' },
  { topic: 'ஊழல் தடுப்பு அமைப்புகள் — லோக்பால், லோக் ஆயுக்தா, CVC & தகவல் அறியும் உரிமை', subtopic: 'RTI சட்டம் 2005, மத்திய விஜிலென்ஸ் கமிஷன், சிபிஐ & மனித உரிமைகள் ஆணையம்' }
];

// Aptitude & Mathematics Matrix (30 Progressive Topic Modules)
const TNPSC_MATHS_SYLLABUS = [
  { topic: 'சுருக்குதல் (Simplification) — BODMAS விதி & இயற்கணித முற்றொருமைகள்', subtopic: 'a²+b², a³+b³ சூத்திரங்கள், பின்னங்கள், தசம எண்கள் & வர்க்கமூலம் காணுதல்' },
  { topic: 'மீப்பெரு பொது காரணி — மீ.பொ.வ (HCF) & காரணிகள் முறை', subtopic: 'பகா காரணி முறை, தொடர் வகுத்தல் முறை & பின்னங்களின் மீ.பொ.வ' },
  { topic: 'மீச்சிறு பொது மடங்கு — மீ.சி.ம (LCM) & குறுக்குவழி கணக்கீடுகள்', subtopic: 'இரு எண்களின் பெருக்கற்பலன் = HCF × LCM சூத்திரப் பயன்பாடு' },
  { topic: 'விழுக்காடு (Percentage) — அடிப்படை கணக்கீடுகள் & தேர்வு வினாக்கள்', subtopic: 'பின்னத்தை சதவீதமாக மாற்றுதல், விலை ஏற்ற/இறக்க சதவீத சமன்பாடுகள்' },
  { topic: 'விழுக்காடு — மக்கள் தொகை வளர்ச்சி & இயந்திர தேய்மானக் கணக்குகள்', subtopic: 'P(1 + r/100)ⁿ மற்றும் P(1 - r/100)ⁿ சூத்திரப் பயன்பாடு' },
  { topic: 'விகிதம் மற்றும் விகிதாச்சாரம் (Ratio & Proportion) — பகுதி 1', subtopic: 'A:B, B:C கொடுக்கப்பட்டால் A:B:C காணும் குறுக்குவழி & நேர்விகிதம்/எதிர்விகிதம்' },
  { topic: 'விகிதம் மற்றும் விகிதாச்சாரம் — கலவை மற்றும் கூட்டு விகிதங்கள்', subtopic: 'நாணயங்கள் கணக்குகள், பால்-தண்ணீர் கலவை கணக்குகள் தீர்வு முறை' },
  { topic: 'தனிவட்டி (Simple Interest) — அடிப்படை சூத்திரங்கள் & அசல் காணுதல்', subtopic: 'SI = (P × N × R) / 100, காலம் (N) மற்றும் வட்டி வீதம் (R) சமமாக இருக்கும் வினாக்கள்' },
  { topic: 'தனிவட்டி — தொகை மடங்காதல் குறுக்குவழி சூத்திரங்கள்', subtopic: 'N ஆண்டுகளில் தொகை இரட்டிப்பானால் R = 100/N, 3 மடங்கு ஆனால் R = 200/N' },
  { topic: 'கூட்டுவட்டி (Compound Interest) — ஆண்டிற்கு ஒருமுறை கணக்கிடுதல்', subtopic: 'A = P(1 + R/100)ⁿ மற்றும் கூட்டுவட்டி CI = A - P கணக்கீடுகள்' },
  { topic: 'கூட்டுவட்டி — அரை ஆண்டு மற்றும் காலாண்டு வட்டி முறைகள்', subtopic: 'A = P(1 + R/200)²ⁿ மற்றும் A = P(1 + R/400)⁴ⁿ சூத்திரப் பிரயோகங்கள்' },
  { topic: 'தனிவட்டி மற்றும் கூட்டுவட்டி இடையேயான வித்தியாசம் (2 & 3 ஆண்டுகள்)', subtopic: '2 ஆண்டு வித்தியாசம் D = P(R/100)², 3 ஆண்டு வித்தியாசம் D = P(R/100)²[3 + R/100]' },
  { topic: 'பரப்பளவு மற்றும் சுற்றளவு — 2D முக்கோணம், சமபக்க முக்கோணம் & நாற்கரங்கள்', subtopic: 'ஹெரான் சூத்திரம் √[s(s-a)(s-b)(s-c)], சமபக்க முக்கோண பரப்பளவு (√3/4)a²' },
  { topic: 'பரப்பளவு — செவ்வகம், சதுரம், சாய் சதுரம் & இணைகரம்', subtopic: 'செவ்வகப் பாதையின் பரப்பளவு, சாய் சதுரப் பரப்பளவு (1/2)d₁d₂' },
  { topic: 'வட்டம் மற்றும் வட்டக்கோணப் பகுதி (Circle & Sector)', subtopic: 'வட்டப் பரப்பளவு πr², சுற்றளவு 2πr, வட்டக்கோண வில்லின் நீளம் (θ/360)×2πr' },
  { topic: 'கனஅளவு (3D Mensuration) — கனச்சதுரம் & கனச்செவ்வகம்', subtopic: 'Volume = a³, Volume = lbh, மொத்தப் புறப்பரப்பளவு & மூலைவிட்டம் காணுதல்' },
  { topic: 'கனஅளவு — நேர்வட்ட உருளை & உள்ளீடற்ற உருளை (Cylinder)', subtopic: 'வளைபரப்பு 2πrh, மொத்தப் புறப்பரப்பு 2πr(h+r), கனஅளவு πr²h' },
  { topic: 'கனஅளவு — நேர்வட்ட கூம்பு (Cone) & இடைக்கண்டம்', subtopic: 'சாயுயரம் l = √(h²+r²), கூம்பின் கனஅளவு (1/3)πr²h, வளைபரப்பு πrl' },
  { topic: 'கனஅளவு — கோளம் (Sphere) & அரைக் கோளம் (Hemisphere)', subtopic: 'கோளத்தின் கனஅளவு (4/3)πr³, அரைக் கோள மொத்தப் பரப்பு 3πr²' },
  { topic: 'காலம் மற்றும் வேலை (Time & Work) — தனிநபர் மற்றும் கூட்டாண்மை', subtopic: 'A மற்றும் B சேர்ந்து செய்யும் வேலை = (xy)/(x+y) நாட்கள் குறுக்குவழி' },
  { topic: 'காலம் மற்றும் வேலை — ஆட்கள்-நாட்கள் சமன்பாடு (Chain Rule)', subtopic: '(M₁ × D₁ × H₁) / W₁ = (M₂ × D₂ × H₂) / W₂ சூத்திரப் பயன்பாடு' },
  { topic: 'குழாய்கள் மற்றும் தொட்டி (Pipes and Cisterns)', subtopic: 'நிரப்பும் குழாய் (+), காலி செய்யும் கசிவு குழாய் (-) கணக்கீடுகள்' },
  { topic: 'வேகம், காலம் மற்றும் தொலைவு (Speed, Time & Distance)', subtopic: 'Speed = Distance/Time, km/h to m/s (× 5/18), சராசரி வேகம் 2xy/(x+y)' },
  { topic: 'ரயில்கள் கணக்குகள் (Problems on Trains)', subtopic: 'ரயில் கம்பத்தை கடக்க எடுக்கும் நேரம் vs பாலத்தை கடக்க எடுக்கும் நேரம்' },
  { topic: 'தருக்கக் காரணவியல் — பகடை கணக்குகள் (Dice Problems)', subtopic: 'நிலையான பக்கம் முறை, பொதுவான எண் சுழற்சி முறை வினாக்கள்' },
  { topic: 'எண்தொடர் மற்றும் எழுத்துத் தொடர் (Number & Alpha Series)', subtopic: 'கூட்டுத் தொடர், பெருக்குத் தொடர், வர்க்க/கன எண்கள் தொடர் நிரப்புதல்' },
  { topic: 'இரத்த உறவுகள் மற்றும் திசை அறிதல் (Blood Relations & Direction)', subtopic: 'குடும்ப மர வரைபடம் (Family Tree) & பிதாகரஸ் தேற்ற திசை தொலைவு' },
  { topic: 'வென் வரைபடங்கள் மற்றும் தருக்க முடிவுகள் (Venn Diagrams & Syllogism)', subtopic: 'மூன்று கணங்களின் தொடர்பு, சில/அனைத்தும் நிபந்தனை வினாக்கள்' },
  { topic: 'தரவு விளக்கம் (Data Interpretation) — வட்ட விளக்கப்படம் (Pie Chart)', subtopic: 'கோண அளவு (Degree) to சதவீதம் (%) மாற்றம் & ஒப்பீட்டுக் கணக்குகள்' },
  { topic: 'தரவு விளக்கம் — பட்டை வரைபடம் & அட்டவணை பகுப்பாய்வு (Bar & Table)', subtopic: 'சராசரி, வளர்ச்சி விகிதம் மற்றும் வினாடி வேகக் கணக்கீடுகள்' }
];

// History, Culture & Unit 8/9 Matrix (30 Curated Modules)
const TNPSC_HISTORY_CULTURE_SYLLABUS = [
  { topic: 'சிந்து சமவெளி நாகரிகம் & கீழடி அகழாய்வுகள் ஒப்பீடு', subtopic: 'ஹரப்பா, மொகஞ்சதாரோ, தானியக் களஞ்சியம், கீழடி சுடுமண் பொருட்கள் & தமிழ் பிராமி' },
  { topic: 'சங்க காலம் — மூவேந்தர்கள் (சேர, சோழ, பாண்டியர்) & குறுநில மன்னர்கள்', subtopic: 'முசிறி, தொண்டி, காவிரிப்பூம்பட்டினம் துறைமுகங்கள், கடையெழு வள்ளல்கள்' },
  { topic: 'பல்லவர்கள் — மாமல்லபுரம் குடைவரைக் கோயில்கள் & நிர்வாகம்', subtopic: 'முதலாம் மகேந்திரவர்மன், நரசிம்மவர்மன், காஞ்சி கைலாசநாதர் கோயில் & சிம்மவிஷ்ணு' },
  { topic: 'பிற்காலச் சோழர்கள் — முதலாம் ராஜராஜன் & ராஜேந்திரன் சாதனைகள்', subtopic: 'தஞ்சைப் பெரிய கோயில், கங்கைகொண்ட சோழபுரம், கடாரம் கொண்ட வெற்றி & குடவோலை முறை' },
  { topic: 'பிற்காலப் பாண்டியர்கள் & மதுரை நாயக்கர் ஆட்சி', subtopic: 'சடையவர்மன் சுந்தரபாண்டியன், திருமலை நாயக்கர் மஹால் & மீனாட்சி அம்மன் கோயில் திருப்பணிகள்' },
  { topic: 'தில்லி சுல்தானியம் — அடிமை, கில்ஜி & துக்ளக் வம்சங்கள்', subtopic: 'குதுப்மினார், அலாவுதீன் கில்ஜி அங்காடி சீர்திருத்தம், முகமது பின் துக்ளக் நாணய முறை' },
  { topic: 'முகலாயப் பேரரசு — பாபர் முதல் ஔரங்கசீப் வரை & நிர்வாகம்', subtopic: 'பானிபட் போர்கள், அக்பரின் தீன்-இ-இலாஹி, மன்சப்தாரி முறை & தாஜ்மஹால் கலை' },
  { topic: 'மராத்தியர்கள் & விஜயநகர பேரரசு வரலாறு', subtopic: 'சத்ரபதி சிவாஜி கொரில்லா போர் முறை, அஷ்டபிரதான் & கிருஷ்ணதேவராயர் சாதனைகள்' },
  { topic: 'ஐரோப்பியர் வருகை — கர்நாடகப் போர்கள் & பிளாசிப் போர் (1757)', subtopic: 'வாஸ்கோடகாமா, ராபர்ட் கிளைவ் இரட்டை ஆட்சி முறை & வந்தவாசிப் போர் 1760' },
  { topic: 'பாளையக்காரர் புரட்சி — பூலித்தேவர் & வீரபாண்டிய கட்டபொம்மன்', subtopic: 'நெற்கட்டும்செவல் போர் 1755, பாஞ்சாலங்குறிச்சி போர் & கயத்தாறு தூக்கிலிடல் 1799' },
  { topic: 'வீரமங்கை வேலு நாச்சியார் — சிவகங்கை விடுதலைப் போராட்டம் (1780)', subtopic: 'ஆங்கிலேயரை வென்ற முதல் இந்திய அரசி, குயிலி தற்கொலைப்படை & ஹைதர் அலி உதவி' },
  { topic: 'மருது சகோதரர்கள் & திருச்சிராப்பள்ளி பிரகடனம் 1801', subtopic: 'ஜம்புத்தீவு பிரகடனம், காளையார் கோயில் போர் & திருப்பத்தூர் தூக்கு 1801' },
  { topic: 'தீரன் சின்னமலை & கொங்கு நாட்டு விடுதலைப் போர்', subtopic: 'ஓடாநிலை கோட்டை, காவேரி கரைப் போர்கள் & சங்ககிரி கோட்டை வீரமரணம் 1805' },
  { topic: 'வேலூர் புரட்சி 1806 — 1857 பெருங்கலகத்தின் முன்னோடி', subtopic: 'புதிய தலைப்பாகை & துப்பாக்கி ரவை எதிர்ப்பு, கர்னல் கில்லஸ்பி ஒடுக்குமுறை' },
  { topic: '1857 பெருங்கிளர்ச்சி & விக்டோரியா மகாராணியின் பேரறிக்கை 1858', subtopic: 'மங்கள் பாண்டே, ஜான்சி ராணி லட்சுமிபாய் & கிழக்கிந்திய கம்பெனி ஆட்சி முடிவு' },
  { topic: 'இந்திய தேசிய காங்கிரஸ் உருவாக்கம் (1885) & மிதவாதிகள் காலம்', subtopic: 'ஏ.ஓ. ஹியூம், டபிள்யூ.சி. பானர்ஜி, தாதாபாய் நௌரோஜி செல்வச் சுரண்டல் கோட்பாடு' },
  { topic: 'வங்கப் பிரிவினை (1905) & சுதேசி இயக்கம்', subtopic: 'கர்சன் பிரபு, வந்தே மாதரம் இயக்கம் & சுதேசி நீராவிக் கப்பல் கம்பெனி (வ.உ.சிதம்பரனார்)' },
  { topic: 'தமிழ்நாட்டில் சுதேசி இயக்கம் — பாரதியார் & சுப்பிரமணிய சிவா', subtopic: 'தூத்துக்குடி கோரல் மில் வேலைநிறுத்தம் 1908, திருநெல்வேலி எழுச்சி & ஆஷ் படுகொலை' },
  { topic: 'காந்தியடிகள் சகாப்தம் — ஒத்துழையாமை இயக்கம் & ரௌலட் சட்டம் (1919–1922)', subtopic: 'ஜாலியன் வாலாபாக் படுகொலை, சௌரி சௌரா நிகழ்வு & கதர் ஆடை இயக்கம்' },
  { topic: 'சட்டமறுப்பு இயக்கம் — வேதாரண்யம் உப்புச் சத்தியாகிரகம் (1930)', subtopic: 'ராஜாஜி தலைமையில் திருச்சி-வேதாரண்யம் நடைபயணம், ருக்மணி லட்சுமிபதி கைது' },
  { topic: 'வெள்ளையனே வெளியேறு இயக்கம் (1942) & நேதாஜியின் INA படை', subtopic: 'செய் அல்லது செத்து மடி, தில்லியை நோக்கிப் புறப்படு & இந்திய தேசிய ராணுவம்' },
  { topic: '19-ம் நூற்றாண்டு சமூக சமய சீர்திருத்த இயக்கங்கள்', subtopic: 'பிரம்ம சமாஜம் (ராசாராம் மோகன்ராய்), ஆரிய சமாஜம், ராமகிருஷ்ண மிஷன் & விவேகானந்தர்' },
  { topic: 'தமிழ்நாட்டின் சமூக சீர்திருத்தவாதிகள் — வள்ளலார் & அயோத்திதாச பண்டிதர்', subtopic: 'சமரச சுத்த சன்மார்க்க சங்கம், வடலூர் தருமசாலை, ஒரு பைசா தமிழன் இதழ்' },
  { topic: 'நீதிக்கட்சி ஆட்சி (1920–1937) & வரலாற்றுச் சாதனைகள்', subtopic: 'தியாகராய செட்டியார், டி.எம். நாயர், வகுப்புவாரி பிரதிநிதித்துவம் (G.O.), இலவச மதிய உணவு' },
  { topic: 'சுயமரியாதை இயக்கம் & தந்தை பெரியாரின் பெண்ணியக் கொள்கைகள்', subtopic: 'வைக்கம் போராட்டம், சுயமரியாதைத் திருமணச் சட்டம், செங்கல்பட்டு மாநாடு 1929' },
  { topic: 'தமிழ்நாட்டில் சமூக நீதியும் இடஒதுக்கீட்டு வரலாறும்', subtopic: '69% இடஒதுக்கீடு சட்டம் (பிரிவு 31C), முதல் அரசியலமைப்பு திருத்தம் & உச்ச நீதிமன்ற தீர்ப்புகள்' },
  { topic: 'தமிழ்நாடு அரசு முன்னோடி நலத்திட்டங்கள் — கல்வி & சுகாதாரம்', subtopic: 'காமராஜர் மதிய உணவுத் திட்டம், எம்.ஜி.ஆர் சத்துணவுத் திட்டம், புதுமைப் பெண் திட்டம்' },
  { topic: 'தமிழ்நாட்டின் மனிதவள மேம்பாட்டு குறியீடு (HDI) & தொழில் வளர்ச்சி', subtopic: 'வாகன உற்பத்தி தலைநகரம் (சென்னை), பின்னலாடை (திருப்பூர்), தோல் தொழில் (வேலூர்)' },
  { topic: 'தமிழ்நாடு புவியியல் — ஆறுகள், மலைகள், காடுகள் & கனிம வளங்கள்', subtopic: 'காவிரி, வைகை, தாமிரபரணி, மேற்குத் தொடர்ச்சி மலை & நெய்வேலி லிக்னைட்' },
  { topic: 'தமிழ்நாடு மின்னாளுமை (e-Governance) & டிஜிட்டல் முன்முயற்சிகள்', subtopic: 'இ-சேவை மையங்கள், தமிழ்நாடு கண்ணாடி இழை வலைப்பின்னல் (TANFINET) & தகவல் தளம்' }
];

// General Science & Geography Matrix (30 Modules)
const TNPSC_SCIENCE_GEO_SYLLABUS = [
  { topic: 'ஒளியியல் (Optics) — ஒளி எதிரொளிப்பு, ஒளிவிலகல் & ஸ்நெல் விதி', subtopic: 'குழி/குவி ஆடிகள், லென்சு சமன்பாடு 1/f = 1/v - 1/u & பார்வை குறைபாடுகள் தீர்வு' },
  { topic: 'முழு அக எதிரொளிப்பு & ஒளியிழைக் கம்பிகள் (Optical Fibres)', subtopic: 'மாறுநிலைக்கோணம், கானல்நீர், வைரத்தின் மின்னல் & நவீன அதிவேக இணைய தொடர்பு' },
  { topic: 'ஒலியியல் (Acoustics) — ஒலி அலைகள், எதிரொலி & டாப்ளர் விளைவு', subtopic: 'மீயொலி (Ultrasound), சோனார் (SONAR) பயன்பாடுகள் & வௌவால்களின் எதிரொலி வழிநடத்தல்' },
  { topic: 'மின்னியல் (Electricity) — ஓம் விதி, மின் தடை & ஜூல் வெப்ப விதி', subtopic: 'V = IR, தொடர் மற்றும் பக்க இணைப்பு மின்சுற்றுகள், மின்திறன் P = VI சமன்பாடு' },
  { topic: 'காந்தவியல் & மின்காந்தத் தூண்டல் (Electromagnetic Induction)', subtopic: 'பாரடே விதிகள், பிளெமிங்கின் வலது/இடது கை விதிகள் & மின்மாற்றி (Transformer) தத்துவம்' },
  { topic: 'அணுக்கரு இயற்பியல் (Nuclear Physics) — அணுக்கரு பிளவு & இணைவு', subtopic: 'கதிரியக்கம் (ஆல்பா, பீட்டா, காமா), அணு உலைகள் & கல்பாக்கம்/கூடங்குளம் நிலையங்கள்' },
  { topic: 'வேதியியல் — தனிமங்கள், சேர்மங்கள் & நவீன ஆவர்த்தன அட்டவணை', subtopic: 'மெண்டலீவ் அட்டவணை, மோஸ்லே நவீன விதி (118 தனிமங்கள்), உலோகங்கள் & அலோகங்கள்' },
  { topic: 'அமிலங்கள், காரங்கள் மற்றும் உப்புகள் (Acids, Bases & Salts)', subtopic: 'pH மதிப்பு அளவீடு (இரத்தம் 7.4, உமிழ்நீர், மழைநீர்), லிட்மஸ் தாள் & பிளீச்சிங் பவுடர்' },
  { topic: 'கார்பனும் அதன் சேர்மங்களும் — ஹைட்ரோகார்பன்கள் & அன்றாட வேதியியல்', subtopic: 'வைரம், கிராபைட், ஃபுல்லரீன் புறவேற்றுமை வடிவங்கள், உரங்கள் & பூச்சிக்கொல்லிகள்' },
  { topic: 'உயிரியல் — செல் கட்டமைப்பு, மைட்டோசிஸ் & மியாசிஸ் செல் பிரிவு', subtopic: 'மைட்டோகாண்ட்ரியா (செல்லின் ஆற்றல் மையம்), உட்கரு DNA/RNA கட்டமைப்பு' },
  { topic: 'மனித செரிமான மண்டலம் & சுவாச மண்டலம்', subtopic: 'என்சைம்கள் (பெப்சின், அமிலேஸ்), கல்லீரல் பித்தநீர் & அல்வியோலி வாயு பரிமாற்றம்' },
  { topic: 'இரத்த ஓட்ட மண்டலம் & இதயத்தின் இயக்கம்', subtopic: 'இதய அறைகள், தமனி vs சிறை, இரத்த வகைகள் (A, B, AB, O), Rh காரணி & இரத்த அழுத்தம்' },
  { topic: 'நரம்பு மண்டலம் & நாளமில்லாச் சுரப்பிகள் (Hormones)', subtopic: 'மூளை பாகங்கள் (பெருமூளை, சிறுமூளை), பிட்யூட்டரி, தைராய்டு, கணையம் இன்சுலின்' },
  { topic: 'மரபியல் — மெண்டலின் மரபியல் விதிகள் & மரபணு நோய்கள்', subtopic: 'குரோமோசோம்கள் (46), DNA இரட்டைச் சுருள் மாதிரி & டவுன் சிண்ட்ரோம்' },
  { topic: 'ஊட்டச்சத்து, வைட்டமின்கள் & குறைபாட்டு நோய்கள்', subtopic: 'வைட்டமின் A (மாலைக்கண்), B (பெரிபெரி), C (ஸ்கர்வி), D (ரிக்கெட்ஸ்), இரும்புச்சத்து அனீமியா' },
  { topic: 'நுண்ணுயிரியல் — பாக்டீரியா, வைரஸ், பூஞ்சை & தடுப்பூசிகள்', subtopic: 'தட்டம்மை, போலியோ, காசநோய் (BCG), எய்ட்ஸ், பென்சிலின் கண்டுபிடிப்பு' },
  { topic: 'சுற்றுச்சூழலியல் — உணவுச் சங்கிலி, கார்பன் சுழற்சி & பல்லுயிர் பாதுகாப்பு', subtopic: 'பசுமை இல்ல வாயுக்கள், புவி வெப்பமயமாதல், ராம்சார் ஈரநிலங்கள் (தமிழ்நாடு)' },
  { topic: 'பேரண்டத்தின் கட்டமைப்பு, சூரிய குடும்பம் & இஸ்ரோ (ISRO) திட்டங்கள்', subtopic: 'சந்திரயான் 1, 2, 3, ஆதித்யா L1, ககன்யான் திட்டம் & ஸ்ரீஹரிகோட்டா ஏவுதளம்' },
  { topic: 'இந்திய புவியியல் — இமயமலை & தீபகற்ப ஆறுகள் அமைப்பு', subtopic: 'கங்கை, பிரம்மபுத்திரா, சிந்து, கோதாவரி, கிருஷ்ணா & நீர்மின் திட்டங்கள்' },
  { topic: 'இந்தியாவின் தட்பவெப்பநிலை & பருவமழைகள்', subtopic: 'தென்மேற்கு பருவமழை, வடகிழக்கு பருவமழை (தமிழ்நாடு மழைப்பொழிவு) & எல் நினோ' },
  { topic: 'இந்திய மண் வகைகள் & வேளாண்மை பயிர் முறைகள்', subtopic: 'வண்டல் மண், கரிசல் மண் (பருத்தி), செம்மண், காரீப், ரபி பயிர் பருவங்கள்' },
  { topic: 'இந்தியாவின் கனிம வளங்கள் & முக்கிய தொழிற்சாலைகள்', subtopic: 'இரும்பு-எஃகு ஆலைகள் (சேலம், ஜாம்ஷெட்பூர்), தாமிரம், பாக்சைட் & பெட்ரோலியம்' },
  { topic: 'இந்திய போக்குவரத்து — இரயில்வே மண்டலங்கள், தேசிய நெடுஞ்சாலைகள் & துறைமுகங்கள்', subtopic: 'தங்க நாற்கரச் சாலை திட்டம், சென்னை-தூத்துக்குடி துறைமுகங்கள் & வந்தே பாரத்' },
  { topic: 'இந்தியாவின் மக்கள் தொகை பரவல் & 2011 மக்கள் தொகை கணக்கெடுப்பு', subtopic: 'பாலின விகிதம், எழுத்தறிவு விகிதம், மக்கள் தொகை அடர்த்தி & தமிழ்நாடு புள்ளிவிவரங்கள்' },
  { topic: 'இந்தியாவின் இயற்கை பேரிடர்கள் & பேரிடர் மேலாண்மை', subtopic: 'சுனாமி, புயல் எச்சரிக்கை கூண்டுகள், நிலநடுக்க மண்டலங்கள் & NDRF மீட்புப் படை' },
  { topic: 'தமிழ்நாடு நதிகள் மற்றும் அணைக்கட்டுகள் அமைப்பு', subtopic: 'மேட்டூர் அணை (காவிரி), பவானி சாகர், வைகை அணை, மணிமுத்தாறு & பாலாறு' },
  { topic: 'தமிழ்நாட்டின் வனவிலங்கு சரணாலயங்கள் & தேசியப் பூங்காக்கள்', subtopic: 'முதுமலை, ஆனைமலை, மன்னார் வளைகுடா கடல்சார் பூங்கா & புலிகள் காப்பகங்கள்' },
  { topic: 'தமிழ்நாடு புதுப்பிக்கத்தக்க ஆற்றல் — காற்று & சூரிய மின் உற்பத்தி', subtopic: 'முப்பந்தல் காற்றாலை பண்ணை (கன்னியாகுமரி), கமுதி சூரிய மின் நிலையம்' },
  { topic: 'இந்திய வனங்கள் வகைப்பாடு & காடுகள் பாதுகாப்பு சட்டம் 1980', subtopic: 'வெப்பமண்டல பசுமைமாறா காடுகள், இலையுதிர் காடுகள் & சதுப்புநில அலையாத்தி காடுகள்' },
  { topic: 'இந்திய கடலோரப் பகுதிகள், தீவுகள் & பவளப்பாறைகள்', subtopic: 'அந்தமான் நிக்கோபார் (10 டிகிரி கால்வாய்), லட்சத்தீவு & பாக் ஜலசந்தி' }
];

// Current Affairs & Daily Test Matrix (10 Modules)
const TNPSC_CA_SYLLABUS = [
  { topic: 'தமிழ்நாடு அரசு பட்ஜெட் முக்கிய அறிவிப்புகள் & நிதி ஒதுக்கீடுகள்', subtopic: 'மகளிர் உரிமைத் தொகை திட்டம், புதுமைப் பெண், நான் முதல்வன் திட்டங்கள்' },
  { topic: 'இந்திய விண்வெளி ஆராய்ச்சி — ISRO சாதனைகள் & புதிய செயற்கைக்கோள்கள்', subtopic: 'SSLV, PSLV, GSLV ஏவுதல்கள், குலசேகரப்பட்டினம் இரண்டாவது ராக்கெட் ஏவுதளம்' },
  { topic: 'இந்தியாவின் முக்கிய தேசிய மற்றும் சர்வதேச விருதுகள்', subtopic: 'பாரத ரத்னா, பத்ம விருதுகள், தாதாசாகேப் பால்கே, ஞானபீட விருது & நோபல் பரிசுகள்' },
  { topic: 'தமிழ்நாடு இலக்கிய விருதுகள் & சிறந்த ஆளுமைகள்', subtopic: 'கலைஞர் நினைவு செம்மொழித் தமிழ் விருது, திருவள்ளுவர் விருது & சாகித்திய அகாதெமி' },
  { topic: 'முக்கிய நியமனங்கள் — உச்ச நீதிமன்ற நீதிபதிகள், ஆளுநர்கள் & தேர்தல் ஆணையர்கள்', subtopic: 'மத்திய அமைச்சரவை இலாகாக்கள், முப்படைத் தளபதிகள் & TNPSC அதிகாரிகள்' },
  { topic: 'சர்வதேச மாநாடுகள் & இந்திய கூட்டமைப்புகள் (G20, BRICS, SCO, ASEAN)', subtopic: 'தலைமைத்துவம், கூட்டுப் பிரகடனங்கள் & காலநிலை மாற்ற ஒப்பந்தங்கள்' },
  { topic: 'விளையாட்டு நடப்பு நிகழ்வுகள் — ஒலிம்பிக், ஆசிய விளையாட்டுகள் & செஸ்', subtopic: 'செஸ் ஒலிம்பியாட் (மாமல்லபுரம்), கேலோ இந்தியா போட்டிகள் & கிரிக்கெட் உலகக்கோப்பை' },
  { topic: 'இந்திய ராணுவ கூட்டுப் பயிற்சிகள் & புதிய பாதுகாப்பு தளவாடங்கள்', subtopic: 'மிலன், இந்திர தனுஷ், பிரமோஸ் ஏவுகணை & INS விக்ராந்த் விமானந்தாங்கி கப்பல்' },
  { topic: 'சுற்றுச்சூழல் குறியீடுகள் & உலகளாவிய அறிக்கைகளில் இந்தியாவின் இடம்', subtopic: 'மனித மேம்பாட்டுக் குறியீடு, உலக மகிழ்ச்சி அறிக்கை & காற்றுத் தரக் குறியீடு (AQI)' },
  { topic: 'தமிழ்நாடு தொல்லியல் துறை புதிய கண்டுபிடிப்புகள்', subtopic: 'கொற்கை, அழகன்குளம், கொடுமணல், மயிலாடும்பாறை இரும்புக்கால ஆய்வுகள்' }
];

// ─── 2. TNPSC 360-DAY DYNAMIC MASTER PLAN BUILDER ────────────────────────────
export function createTNPSCDayPlan(courseTitle: string, day: number): DayPlan {
  const blockNum = Math.ceil(day / 10);
  const phaseNum = day <= 120 ? 1 : day <= 240 ? 2 : 3;
  const phaseTitle = phaseNum === 1
    ? 'Phase 1: 6th–10th Samacheer Kalvi Core Foundation'
    : phaseNum === 2
    ? 'Phase 2: 11th–12th Master Standard & High-Yield GS Deep Dive'
    : 'Phase 3: TNPSC Top Rankers Speed Revision & PYQ Simulation';

  // Topic Indexes based on day number
  const tamilIndex = (day - 1) % TNPSC_TAMIL_SYLLABUS.length;
  const polityIndex = (day - 1) % TNPSC_POLITY_SYLLABUS.length;
  const mathsIndex = (day - 1) % TNPSC_MATHS_SYLLABUS.length;
  const histIndex = (day - 1) % TNPSC_HISTORY_CULTURE_SYLLABUS.length;
  const sciGeoIndex = (day - 1) % TNPSC_SCIENCE_GEO_SYLLABUS.length;
  const caIndex = (day - 1) % TNPSC_CA_SYLLABUS.length;

  const tTamil = TNPSC_TAMIL_SYLLABUS[tamilIndex];
  const tPolity = TNPSC_POLITY_SYLLABUS[polityIndex];
  const tMaths = TNPSC_MATHS_SYLLABUS[mathsIndex];
  const tHist = TNPSC_HISTORY_CULTURE_SYLLABUS[histIndex];
  const tSciGeo = TNPSC_SCIENCE_GEO_SYLLABUS[sciGeoIndex];
  const tCA = TNPSC_CA_SYLLABUS[caIndex];

  const tasks: DailySubjectTask[] = [
    {
      subject: 'பொதுத்தமிழ்',
      topic: tTamil.topic,
      subtopic: tTamil.subtopic,
      durationMinutes: 25,
      taskType: 'video',
      activityPrompt: `Day ${day}: பாடக் குறிப்புகளை வாசித்து 5 முக்கிய இலக்கண/இலக்கிய வினாக்களைக் குறிப்பெடுக்கவும்.`
    },
    {
      subject: 'இந்திய அரசியலமைப்பு',
      topic: tPolity.topic,
      subtopic: tPolity.subtopic,
      durationMinutes: 25,
      taskType: 'reading',
      activityPrompt: `Day ${day}: அரசியலமைப்பு விதிகள் மற்றும் முக்கிய வழக்குகளை அட்டவணைப்படுத்தி மனனம் செய்யவும்.`
    },
    {
      subject: 'கணிதம் & திறனறிவு',
      topic: tMaths.topic,
      subtopic: tMaths.subtopic,
      durationMinutes: 25,
      taskType: 'practice',
      activityPrompt: `Day ${day}: 10 வினாடி குறுக்குவழி சூத்திரங்களைப் பயன்படுத்தி 5 மாதிரி வினாக்களைத் தீர்க்கவும்.`
    },
    {
      subject: 'வரலாறு & பண்பாடு',
      topic: tHist.topic,
      subtopic: tHist.subtopic,
      durationMinutes: 20,
      taskType: 'reading',
      activityPrompt: `Day ${day}: காலக்கோடு மற்றும் முக்கிய நிகழ்வுகளை சுருக்கமாக வரைந்து பார்க்கவும்.`
    },
    {
      subject: 'அறிவியல் & புவியியல்',
      topic: tSciGeo.topic,
      subtopic: tSciGeo.subtopic,
      durationMinutes: 15,
      taskType: 'reading',
      activityPrompt: `Day ${day}: அறிவியல் விதிகள் மற்றும் புவியியல் வரைபடக் குறிப்புகளைப் பதிவு செய்யவும்.`
    },
    {
      subject: 'தினசரி OMR மாதிரித் தேர்வு',
      topic: `Day ${day}: 10 High-Yield OMR Mock Test (Tamil, Polity, Maths, GS)`,
      subtopic: `${tTamil.topic.split('—')[0]} + ${tPolity.topic.split('—')[0]} வினாக்கள்`,
      durationMinutes: 15,
      taskType: 'test',
      activityPrompt: `Day ${day} பாடங்களில் இருந்து 10 வினாக்களுக்கு விடையளித்து உடனுக்குடன் தீர்வு காணவும்.`
    }
  ];

  return {
    dayNumber: day,
    blockNumber: blockNum,
    phaseTitle,
    themeTitle: `Day ${day} of 360: ${tTamil.topic.split('—')[0]} • ${tPolity.topic.split('—')[0]} • ${tMaths.topic.split('—')[0]}`,
    totalDurationMins: 125,
    tasks,
    dailyRevision: `இன்று படித்த ${tTamil.topic} மற்றும் ${tPolity.topic} சூத்திரங்களை உறங்கும் முன் ஒருமுறை நினைவுகூர்க.`,
    dailyTestSummary: {
      questionCount: 10,
      testType: 'mcq',
      focusArea: `${tTamil.topic.split('—')[0]} & ${tMaths.topic.split('—')[0]}`
    }
  };
}

// ─── 3. UPSC 360-DAY PLAN RESOLVER ───────────────────────────────────────────
export function createUPSCDayPlan(courseTitle: string, day: number): DayPlan {
  const blockNum = Math.ceil(day / 10);
  const phaseNum = day <= 120 ? 1 : day <= 240 ? 2 : 3;
  const phaseTitle = phaseNum === 1
    ? 'Phase 1: NCERT Foundation & Syllabus Mapping (GS 1–4)'
    : phaseNum === 2
    ? 'Phase 2: Standard Reference & Mains Answer Writing Mastery'
    : 'Phase 3: High-Yield Prelims Test Series & Rankers Revision';

  const polityIndex = (day - 1) % TNPSC_POLITY_SYLLABUS.length;
  const histIndex = (day - 1) % TNPSC_HISTORY_CULTURE_SYLLABUS.length;
  const geoIndex = (day - 1) % TNPSC_SCIENCE_GEO_SYLLABUS.length;
  const caIndex = (day - 1) % TNPSC_CA_SYLLABUS.length;

  const tPolity = TNPSC_POLITY_SYLLABUS[polityIndex];
  const tHist = TNPSC_HISTORY_CULTURE_SYLLABUS[histIndex];
  const tGeo = TNPSC_SCIENCE_GEO_SYLLABUS[geoIndex];
  const tCA = TNPSC_CA_SYLLABUS[caIndex];

  const tasks: DailySubjectTask[] = [
    {
      subject: 'Indian Polity & Governance',
      topic: `GS 2: ${tPolity.topic}`,
      subtopic: `Laxmikanth Analysis: ${tPolity.subtopic}`,
      durationMinutes: 30,
      taskType: 'reading',
      activityPrompt: `Draft a 150-word analytical answer on: "${tPolity.topic}".`
    },
    {
      subject: 'Modern History & Culture',
      topic: `GS 1: ${tHist.topic}`,
      subtopic: `Spectrum & NCERT: ${tHist.subtopic}`,
      durationMinutes: 30,
      taskType: 'video',
      activityPrompt: `Construct a chronological mindmap for ${tHist.topic}.`
    },
    {
      subject: 'Geography & Environment',
      topic: `GS 1/3: ${tGeo.topic}`,
      subtopic: `Physical & Applied Geography: ${tGeo.subtopic}`,
      durationMinutes: 25,
      taskType: 'reading',
      activityPrompt: `Mark key physical locations and biosphere boundaries on India map.`
    },
    {
      subject: 'CSAT & Analytical Aptitude',
      topic: `CSAT Paper II: Analytical Reasoning & Numerical Ability (Day ${day})`,
      subtopic: `Speed math & reading comprehension passages`,
      durationMinutes: 20,
      taskType: 'practice',
      activityPrompt: `Solve 5 CSAT PYQs with 2-minute time constraint per question.`
    },
    {
      subject: 'Daily Prelims MCQs & Editorial',
      topic: `The Hindu / Indian Express Editorial & 15 Daily Prelims MCQs`,
      subtopic: `Current Affairs: ${tCA.topic}`,
      durationMinutes: 25,
      taskType: 'test',
      activityPrompt: `Summarize 3 core editorial arguments and test 15 MCQs.`
    }
  ];

  return {
    dayNumber: day,
    blockNumber: blockNum,
    phaseTitle,
    themeTitle: `Day ${day} of 360: ${tPolity.topic} & ${tHist.topic}`,
    totalDurationMins: 130,
    tasks,
    dailyRevision: `Revise key Articles and historical timeline for Day ${day} before end of day.`,
    dailyTestSummary: {
      questionCount: 15,
      testType: 'mcq',
      focusArea: 'Polity GS 2 & Modern History GS 1'
    }
  };
}

// ─── 4. K-12 STATE BOARD & CBSE PROCEDURAL PLAN BUILDER ──────────────────────
export function createProceduralDayPlan(courseTitle: string, day: number, totalDays: number, subjects: string[]): DayPlan {
  const blockNum = Math.ceil(day / 10);
  const phaseNum = Math.ceil(day / (totalDays / 4));
  const unitNum = Math.ceil(day / 15);

  const tasks: DailySubjectTask[] = subjects.map((subj, idx) => {
    let taskType: DailySubjectTask['taskType'] = 'practice';
    if (idx === 0) taskType = 'video';
    else if (idx === 1) taskType = 'reading';
    else if (idx === subjects.length - 1) taskType = 'test';
    else if (idx === subjects.length - 2) taskType = 'revision';

    return {
      subject: subj,
      topic: `${subj}: Unit ${unitNum} Core Concepts & Key Formulas (Day ${day})`,
      subtopic: `Curriculum textbook lesson, interactive examples & solved problems`,
      durationMinutes: idx === subjects.length - 1 ? 15 : 20,
      taskType,
      activityPrompt: `Complete Day ${day} textbook exercises and self-assessment in ${subj}.`
    };
  });

  return {
    dayNumber: day,
    blockNumber: blockNum,
    phaseTitle: `Phase ${phaseNum}: Term ${Math.ceil(day / (totalDays / 3))} Conceptual Mastery`,
    themeTitle: `Day ${day} of ${totalDays}: Unit ${unitNum} Comprehensive Daily Routine`,
    totalDurationMins: tasks.reduce((sum, t) => sum + t.durationMinutes, 0),
    tasks,
    dailyRevision: `Recap all ${subjects.length} subjects covered today in your daily study log.`,
    dailyTestSummary: {
      questionCount: 5,
      testType: 'mcq',
      focusArea: `Day ${day} ${subjects[0]} & ${subjects[1]}`
    }
  };
}

import { resolveMasterCurriculumPlan } from '../data/curriculum';

// ─── 5. MASTER ENTRY RESOLVER ────────────────────────────────────────────────
export async function getDayPlanForCourse(
  courseOrTitle: any,
  category: string,
  targetDay: number = 1
): Promise<DayPlan> {
  // Leverage the authentic master curriculum registry
  return resolveMasterCurriculumPlan(courseOrTitle, category, targetDay);
}


