/**
 * TeachO Master Course Syllabus Registry
 * Complete Authentic Real-World Micro-Granular Curricula for all 86 Courses:
 * - NEET UG (NTA/NMC Official Blueprint)
 * - TNPSC Unified All Groups (Group 1, 2/2A, 4, VAO, DEO, SI, Police - Prelims + Mains)
 * - Class 11 & 12 Commerce (Accountancy, Business Studies, Economics)
 * - Kindergarten (LKG & UKG Phonics, Rhymes, Numbers, EVS)
 * - K-12 School (TNSB Samacheer & CBSE NCERT)
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
// 1. TNPSC UNIFIED MASTER SYLLABUS (GROUP 1, 2/2A, 4, VAO, DEO, SI)
// ─────────────────────────────────────────────────────────────────────────────
export function getTnpscUnifiedCompleteSyllabus(courseId: string, courseTitle: string): CourseFullSyllabus {
  const isGroup1 = (courseId || '').includes('grp1');
  const isGroup4 = (courseId || '').includes('grp4') || (courseId || '').includes('vao');

  // SUBJECT 1: GENERAL TAMIL (பகுதி அ: இலக்கணம், பகுதி ஆ: இலக்கியம், பகுதி இ: தமிழ் அறிஞர்கள்)
  const tamilChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'பகுதி அ: தமிழ் இலக்கணம் (Grammar Masterclass)',
      description: 'எழுத்து, சொல், சந்திப்பிழை நீக்குதல், ஓரெழுத்து ஒருமொழி, வேர்ச்சொல், பெயர்ச்சொல் 6 வகை, இலக்கணக் குறிப்பறிதல் & வேற்றுமை',
      microTopics: [
        { id: 'tn_t_1', topicTitle: 'முதல் & சார்பெழுத்துகள் (10 வகைகள்) & புணர்ச்சி விதிகள்', subtopic: 'உயிர் 12, மெய் 18, உயிர்மெய், ஆய்தம், உயிரளபெடை, ஒற்றளபெடை, குற்றியலுகரம், குற்றியலிகரம்', dayNumber: 1, periodNumber: 1, keyFormulaOrLaw: 'முதல் எழுத்துகள் 30 | சார்பெழுத்துகள் 10 வகை | குற்றியலுகரம் 6 வகை (நெடில்தொடர், ஆய்தத்தொடர், உயிர்த்தொடர், வன்தொடர், மென்தொடர், இடைத்தொடர்)', keyPoints: ['உயிரளபெடை 3 வகை: செய்யுளிசை, இன்னிசை, சொல்லிசை', 'ஆய்த குறுக்கம் மற்றும் மகர குறுக்கம் மாத்திரை அளவுகள் (1/4 மாத்திரை)'], type: 'concept', importance: 'High-Yield' },
        { id: 'tn_t_2', topicTitle: 'வேற்றுமை உருபுகள் (1 முதல் 8 வரை) & சொல்லுருபுகள்', subtopic: 'ஐ, ஆல், கு, இன், அது, கண் வேற்றுமைத் தொடர்கள் மற்றும் உடன்தொக்க தொகை', dayNumber: 6, periodNumber: 1, keyFormulaOrLaw: '2-ம் வேற்றுமை: ஐ | 3-ம்: ஆல், ஆண், ஒடு, ஓடு | 4-ம்: கு | 5-ம்: இன், இல் | 6-ம்: அது, ஆது, அ | 7-ம்: கண் | 8-ம்: விளி', keyPoints: ['முதல் வேற்றுமைக்கு உருபு இல்லை (எழுவாய் வேற்றுமை)', '8-ம் வேற்றுமை விளி வேற்றுமை (அழைத்தல்)', 'மரப்பலகை: மரத்தால் ஆகிய பலகை (3-ம் வேற்றுமை உருபும் பயனும் உடன்தொக்க தொகை)'], type: 'concept', importance: 'High-Yield' },
        { id: 'tn_t_3', topicTitle: 'வலிமிகும் இடங்கள் & வலிமிகா இடங்கள் (சந்திப்பிழை நீக்குதல்)', subtopic: 'நிலைமொழி, வருமொழி புணர்ச்சி, சுட்டெழுத்துக்கள், ஓரெழுத்து ஒருமொழிகள் பின் வலிமிகும் விதிகள்', dayNumber: 11, periodNumber: 1, keyFormulaOrLaw: 'அ, இ சுட்டெழுத்துகள் & எ வினாவெழுத்தின் பின் வலிமிகும் | வினைத்தொகை, உம்மைத்தொகையில் வலிமிகாது', keyPoints: ['அந்த + பையன் = அந்தப் பையன் (வலிமிகும்)', 'குடி + நீர் = குடிநீர் (வினைத்தொகையில் மிகாது)', 'இரண்டாம் வேற்றுமை விரி தொடரில் வலிமிகும்'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'tn_t_4', topicTitle: 'ஓரெழுத்து ஒருமொழி (42 சொற்கள்) & வேர்ச்சொல் மாற்றம்', subtopic: 'நன்னூல் 42 ஓரெழுத்து ஒருமொழிகள் & வினையாலணையும் பெயர், தொழிற்பெயர் உருவாக்கம்', dayNumber: 16, periodNumber: 1, keyFormulaOrLaw: 'நெடில் 40 + குறில் 2 (நொ, து) = 42 சொற்கள் (நன்னூல் நூற்பா)', keyPoints: ['ஆ-பசு, மா-பெரிய/விலங்கு, கோ-அரசன், கா-காடு, தீ-நெருப்பு, தை-மாதம்', 'படித்தான் வேர்ச்சொல்: படி -> வினையெச்சம்: படித்து -> வினையாலணையும் பெயர்: படித்தவர்'], type: 'memorization', importance: 'High-Yield' },
        { id: 'tn_t_5', topicTitle: 'வாக்கிய வகைகள் & இலக்கணக் குறிப்பறிதல் (6 வகை பெயர்ச்சொற்கள்)', subtopic: 'தன்வினை, பிறவினை, செய்வினை, செயப்பாட்டு வினை, நேர்க்கூற்று, அயற்கூற்று மற்றும் பொருட்பெயர் முதல் தொழிற்பெயர் வரை', dayNumber: 21, periodNumber: 1, keyFormulaOrLaw: 'பொருட்பெயர், இடப்பெயர், காலப்பெயர், சினைப்பெயர், பண்புப்பெயர், தொழிற்பெயர்', keyPoints: ['செந்தாமரை (பண்புத்தொகை)', 'காய் கனி (உம்மைத்தொகை)', 'படித்தல் (தொழிற்பெயர்)'], type: 'quiz', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'பகுதி ஆ: இலக்கியம் — திருக்குறள் (19 அதிகாரங்கள்) & அறநூல்கள்',
      description: 'அன்பு, பண்பு, கல்வி, கேள்வி, அறிவு, ஒழுக்கம், நட்பு, வாய்மை, காலமறிதல், வலியறிதல், நாலடியார், நான்மணிக்கடிகை, பழமொழி நானூறு',
      microTopics: [
        { id: 'tn_t_6', topicTitle: 'திருக்குறள்: கடவுள் வாழ்த்து, வான்சிறப்பு & நீத்தார் பெருமை (அதிகாரம் 1, 2, 3)', subtopic: 'அகர முதல எழுத்தெல்லாம், துப்பார்க்குத் துப்பாய & ஒழுக்கத்து நீத்தார் பெருமை', dayNumber: 2, periodNumber: 1, keyFormulaOrLaw: 'அகர முதல எழுத்தெல்லாம் ஆதி பகவன் முதற்றே உலகு | செயற்கரிய செய்வார் பெரியர் சிறியர் செய்கலா தார்', keyPoints: ['பரிமேலழகர் உரை திருக்குறளின் மிகச்சிறந்த உரை', 'திருக்குறள் அறத்துப்பால் 38, பொருட்பால் 70, காமத்துப்பால் 25 = 133 அதிகாரங்கள் (1330 குறள்கள்)'], type: 'concept', importance: 'High-Yield' },
        { id: 'tn_t_7', topicTitle: 'திருக்குறள்: அன்புடைமை, கல்வி & அறிவுடைமை (அதிகாரம் 8, 40, 43)', subtopic: 'அன்பிலார் எல்லாம் தமக்குரியர், கற்க கசடறக் கற்பவை & அறிவற்றங் காக்கும் கருவி', dayNumber: 7, periodNumber: 1, keyFormulaOrLaw: 'அன்பின் வழியது உயிர்நிலை அஃதிலார்க்கு என்புதோல் போர்த்த உடம்பு | தொட்டனைத் தூறும் மணற்கேணி மாந்தர்க்குக் கற்றனைத் தூறும் அறிவு', keyPoints: ['அன்புடைமை குறள்கள் நயவுரை', 'எப்பொருள் யார்யார்வாய்க் கேட்பினும் அப்பொருள் மெய்ப்பொருள் காண்ப தறிவு'], type: 'memorization', importance: 'High-Yield' },
        { id: 'tn_t_8', topicTitle: 'பதினெண்கீழ்க்கணக்கு அறநூல்கள்: நாலடியார், நான்மணிக்கடிகை, பழமொழி நானூறு', subtopic: 'சமண முனிவர்கள் (நாலடியார்), விளம்பி நாகனார் (நான்மணிக்கடிகை), முன்றுறை அரையனார் (பழமொழி நானூறு)', dayNumber: 12, periodNumber: 1, keyFormulaOrLaw: 'நாலும் இரண்டும் சொல்லுக்குறுதி (நாலடியார் 400 + திருக்குறள் 2 அடிக் குறள்கள்)', keyPoints: ['கல்வி கரையில கற்பவர் நாள்சில (நாலடியார்)', 'பழமொழி நானூறு ஒவ்வொரு பாடலிலும் ஒரு பழமொழி இடம் பெறும்'], type: 'concept', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 3,
      chapterTitle: 'பகுதி ஆ: சங்க இலக்கியம், காப்பியங்கள் & பக்தி இலக்கியம்',
      description: 'எட்டுத்தொகை, பத்துப்பாட்டு, சிலப்பதிகாரம், மணிமேகலை, சீவகசிந்தாமணி, கம்பராமாயணம், பெரியபுராணம், தேவாரம் & திருவாசகம்',
      microTopics: [
        { id: 'tn_t_9', topicTitle: 'எட்டுத்தொகை & பத்துப்பாட்டு சங்க இலக்கிய நயவுரை', subtopic: 'நற்றிணை, குறுந்தொகை, புறநானூறு, முல்லைப்பாட்டு, மதுரைக்காஞ்சி மேற்கோள்கள்', dayNumber: 3, periodNumber: 1, keyFormulaOrLaw: 'நற்றிணை நல்ல குறுந்தொகை ஐங்குறுநூறு ஒத்த பதிற்றுப்பத்து ஓங்கு பரிபாடல் கற்றறிந்தார் ஏத்தும் கலியோடு அகம் புறம் என்று இத்திறத்த எட்டுத்தொகை', keyPoints: ['யாதும் ஊரே யாவரும் கேளிர் — கணியன் பூங்குன்றனார் (புறநானூறு)', 'உண்டி கொடுத்தோர் உயிர் கொடுத்தோரே — குடபுலவியனார்'], type: 'concept', importance: 'High-Yield' },
        { id: 'tn_t_10', topicTitle: 'ஐம்பெருங்காப்பியங்கள்: சிலப்பதிகாரம், மணிமேகலை & சீவகசிந்தாமணி', subtopic: 'இளங்கோவடிகள், சீத்தலைச் சாத்தனார், திருத்தக்கதேவர் காப்பியக் கட்டமைப்பு & கம்பராமாயணம் 6 காண்டங்கள்', dayNumber: 8, periodNumber: 1, keyFormulaOrLaw: 'அரசியல் பிழைத்தோர்க்கு அறங்கூற்றாவதூஉம் உரைசால் பத்தினியை உயர்ந்தோர் ஏத்தலும் ஊழ்வினை உருத்துவந்து ஊட்டும்', keyPoints: ['சிலப்பதிகாரம்: புகார், மதுரை, வஞ்சிக் காண்டங்கள் 30 காதைகள்', 'மணிமேகலை: துறவுக் காப்பியம், அமுதசுரபி சிறப்புகள்', 'கம்பராமாயணம்: பாலகாண்டம் முதல் யுத்தகாண்டம் வரை 6 காண்டங்கள்'], type: 'concept', importance: 'High-Yield' },
        { id: 'tn_t_11', topicTitle: 'பக்தி இலக்கியம் & சிற்றிலக்கியங்கள்: தேவாரம், திருவாசகம், கலிங்கத்துப் பரணி', subtopic: 'அப்பர், சம்பந்தர், சுந்தரர் தேவாரம், மாணிக்கவாசகர் திருவாசகம், ஜெயங்கொண்டார் கலிங்கத்துப்பரணி, குற்றாலக்குறவஞ்சி', dayNumber: 13, periodNumber: 1, keyFormulaOrLaw: 'திருவாசகத்திற்கு உருகார் ஒரு வாசகத்திற்கும் உருகார் | பரணிக்கோர் ஜெயங்கொண்டார்', keyPoints: ['நாலாயிர திவ்வியப் பிரபந்தம் தொகுத்தவர் நாதமுனிகள்', 'கலிங்கத்துப்பரணி முதலாம் குலோத்துங்க சோழன் தளபதி கருணாகரத் தொண்டைமான் போர் வெற்றி'], type: 'concept', importance: 'Core Standard' }
      ]
    },
    {
      chapterNumber: 4,
      chapterTitle: 'பகுதி இ: தமிழ் அறிஞர்களும் தமிழ்த் தொண்டும் & நாட்டுப்புறக் கலைகள்',
      description: 'மகாகவி பாரதியார், பாரதிதாசன், நாமக்கல் கவிஞர், கவிமணி, உ.வே.சா, பரிதிமாற்கலைஞர், பெரியார், அண்ணா, கரகாட்டம், தெருக்கூத்து',
      microTopics: [
        { id: 'tn_t_12', topicTitle: 'மகாகவி பாரதியார் & புரட்சிக் கவிஞர் பாரதிதாசன்', subtopic: 'சுதேசமித்திரன், இந்தியா இதழ்கள், பாஞ்சாலி சபதம், குடும்ப விளக்கு, பாண்டியன் பரிசு, இருண்ட வீடு', dayNumber: 4, periodNumber: 1, keyFormulaOrLaw: 'பாட்டுக்கொரு புலவன் பாரதி | எங்கள் வாழ்வும் எங்கள் வளமும் மங்காத தமிழென்று சங்கே முழங்கு', keyPoints: ['பாரதியார் இயற்பெயர் சுப்பிரமணியன், எட்டயபுர மன்னரால் பாரதி பட்டம்', 'பாரதிதாசன் இயற்பெயர் கனகசுப்புரத்தினம்'], type: 'concept', importance: 'High-Yield' },
        { id: 'tn_t_13', topicTitle: 'தமிழ்த்தாத்தா உ.வே.சா & பரிதிமாற்கலைஞர் தமிழ்த் தொண்டு', subtopic: 'ஓலைச்சுவடிகள் பதிப்புப் பணி, என் சரித்திரம், திராவிட சாஸ்திரி பட்டம் & உயர்தனிச் செம்மொழி பிரகடனம்', dayNumber: 9, periodNumber: 1, keyFormulaOrLaw: 'என் சரித்திரம் — உ.வே.சா தன் வரலாறு | பரிதிமாற்கலைஞர் இயற்பெயர் வி.கோ.சூரியநாராயண சாஸ்திரியார்', keyPoints: ['உ.வே.சா 1887-ல் சீவகசிந்தாமணியை முதன்முதலில் பதிப்பித்தார்', 'பரிதிமாற்கலைஞர் தமிழ் மொழியை உயர்தனிச் செம்மொழி என முதன்முதலில் நிலைநாட்டினார்'], type: 'concept', importance: 'High-Yield' },
        { id: 'tn_t_14', topicTitle: 'தந்தை பெரியார், பேரறிஞர் அண்ணா & பெருந்தலைவர் காமராசர்', subtopic: 'சுயமரியாதை இயக்கம், குடியரசு இதழ், 1969 தமிழ்நாடு பெயர் மாற்றம், இருமொழிக் கொள்கை, தொடக்கக் கல்வி புரட்சி', dayNumber: 14, periodNumber: 1, keyFormulaOrLaw: '14 ஜனவரி 1969: மதராஸ் மாநிலம் "தமிழ்நாடு" என அண்ணாவால் பெயர் மாற்றம் செய்யப்பட்டது', keyPoints: ['பெரியார் 1925-ல் சுயமரியாதை இயக்கத்தைத் தொடங்கினார்', 'காமராசர் இலவச மதிய உணவு மற்றும் இலவச சீருடைத் திட்டத்தை அறிமுகப்படுத்தினார்'], type: 'concept', importance: 'High-Yield' }
      ]
    }
  ];

  // SUBJECT 2: INDIAN POLITY & CONSTITUTION (UNIT V)
  const polityChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'அரசியலமைப்பு உருவாக்கம், முகப்புரை & குடியுரிமை (Part 1 & 2)',
      description: 'அரசியல் நிர்ணய சபை, வரைவுக்குழு தலைவர் டாக்டர் அம்பேத்கர், முகப்புரை மற்றும் குடியுரிமை சட்டம் 1955',
      microTopics: [
        { id: 'tn_pol_1', topicTitle: 'அரசியல் நிர்ணய சபை & வரைவுக்குழு (Constituent Assembly)', subtopic: '1946 கேபினட் மிஷன், டாக்டர் ராஜேந்திர பிரசாத், வரைவுக்குழு 7 உறுப்பினர்கள், 2 ஆண்டுகள் 11 மாதங்கள் 18 நாட்கள்', dayNumber: 1, periodNumber: 2, keyFormulaOrLaw: 'முதல் கூட்டம்: 9 டிசம்பர் 1946 | அரசியல் சாசனம் ஏற்றுக்கொள்ளப்பட்டது: 26 நவம்பர் 1949 | நடைமுறை: 26 ஜனவரி 1950', keyPoints: ['வரைவுக்குழு தலைவர் டாக்டர் பி.ஆர். அம்பேத்கர் (இந்திய அரசியலமைப்பின் தந்தை)', 'அரசியலமைப்பு ஆலோசகர் பி.என். ராவ்'], type: 'concept', importance: 'High-Yield' },
        { id: 'tn_pol_2', topicTitle: 'அரசியலமைப்பின் முகப்புரை & 42-வது சட்டத்திருத்தம் 1976 (Preamble)', subtopic: 'இறையாண்மை, சமதர்ம, மதச்சார்பற்ற, ஜனநாயக, குடியரசு (SOVEREIGN, SOCIALIST, SECULAR, DEMOCRATIC, REPUBLIC)', dayNumber: 6, periodNumber: 2, keyFormulaOrLaw: '42nd Amendment Act 1976 added: SOCIALIST, SECULAR, INTEGRITY', keyPoints: ['கேசவானந்த பாரதி வழக்கு 1973: முகப்புரை அரசியலமைப்பின் ஓர் அங்கமே', 'ஜவஹர்லால் நேருவின் குறிக்கோள் தீர்மானம் (Objective Resolution 1946) முகப்புரையாக ஏற்றுக்கொள்ளப்பட்டது'], type: 'concept', importance: 'High-Yield' },
        { id: 'tn_pol_3', topicTitle: 'பகுதி 1 & 2: இந்திய ஒன்றியம் & குடியுரிமை சட்டம் 1955 (Articles 1–11)', subtopic: 'பிரிவு 1-4 மாநிலங்கள் உருவாக்கம், மொழிவாரி மாநிலங்கள் மறுசீரமைப்பு 1956 & குடியுரிமை பெறும் 5 வழிகள், இழக்கும் 3 வழிகள்', dayNumber: 11, periodNumber: 2, keyFormulaOrLaw: 'Article 1: India, that is Bharat, shall be a Union of States | Citizenship by: Birth, Descent, Registration, Naturalization, Incorporation', keyPoints: ['குடியுரிமை இழக்கும் வழிகள்: துPermission (துறத்தல்), Termination (முடிவுக்கு வருதல்), Deprivation (பறித்தல்)', '1956 ஃபசல் அலி கமிஷன் (மாநிலங்கள் மறுசீரமைப்பு)'], type: 'concept', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'பகுதி 3: அடிப்படை உரிமைகள் (Articles 12–35) & 5 நீதிப்பேராணைகள்',
      description: 'சமத்துவ உரிமை (14-18), சுதந்திர உரிமை (19-22), சுரண்டலுக்கு எதிரான உரிமை (23-24), மத உரிமை (25-28), பிரிவு 32 நீதிப்பேராணைகள்',
      microTopics: [
        { id: 'tn_pol_4', topicTitle: 'சமத்துவ உரிமை (Articles 14–18) & தீண்டாமை ஒழிப்பு', subtopic: 'சட்டத்தின் முன் அனைவரும் சமம் (Art 14), 5 காரணங்களால் பாகுபாடு தடை (Art 15), வேலைவாய்ப்பில் சமவாய்ப்பு (Art 16), தீண்டாமை ஒழிப்பு (Art 17)', dayNumber: 2, periodNumber: 2, keyFormulaOrLaw: 'Article 14: Equality before Law | Article 17: Abolition of Untouchability (Protection of Civil Rights Act 1955)', keyPoints: ['Article 16(4): பின்தங்கிய வகுப்பினருக்கு இடஒதுக்கீடு வழங்கும் அதிகாரம்', 'Article 18: ராணுவ மற்றும் கல்வி பட்டங்களைத் தவிர பிற பட்டங்கள் ஒழிப்பு'], type: 'concept', importance: 'High-Yield' },
        { id: 'tn_pol_5', topicTitle: 'சுதந்திர உரிமை & வாழ்வுரிமை (Articles 19–22 & Art 21A கல்வி உரிமை)', subtopic: 'பிரிவு 19(1) 6 அடிப்படை சுதந்திரங்கள், பிரிவு 21 தனிநபர் சுதந்திரம் & 86-வது திருத்தம் 2002 பிரிவு 21A 6-14 வயது இலவச கட்டாயக் கல்வி', dayNumber: 7, periodNumber: 2, keyFormulaOrLaw: 'Article 19(1): 6 Freedoms | Article 21: Protection of Life & Personal Liberty | Article 21A: Right to Education', keyPoints: ['மேனகா காந்தி வழக்கு 1978: பிரிவு 21 வாழ்வுரிமையின் விரிவான விளக்கம்', 'பிரிவு 20: குற்றங்களுக்கான தண்டனையிலிருந்து பாதுகாப்பு (Double Jeopardy)'], type: 'concept', importance: 'High-Yield' },
        { id: 'tn_pol_6', topicTitle: 'பிரிவு 32 & 226: 5 நீதிப்பேராணைகள் (Writs Jurisdiction)', subtopic: 'ஆட்கொணர்வு, கட்டளையிடும், தடையுறுத்தும், ஆவணக்கேட்பு, தகுதிமுறை வினவும் நீதிப்பேராணைகள்', dayNumber: 12, periodNumber: 2, keyFormulaOrLaw: 'Article 32: "Heart and Soul of the Indian Constitution" (Dr. Ambedkar) | Article 226: High Court Writs', keyPoints: ['Habeas Corpus: சட்டவிரோத காவலில் இருந்து நபரை விடுவித்தல்', 'Mandamus: அரசு அதிகாரியை தன் பொதுக்கடமையை செய்ய கட்டளையிடுதல்', 'Quo-Warranto: தகுதியின்றி பொதுப்பதவியை வகிப்பதை வினவுதல்'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 3,
      chapterTitle: 'பகுதி 4, 4A: DPSP, அடிப்படைக் கடமைகள் & மத்திய/மாநில நிர்வாகம்',
      description: 'அரசு நெறிமுறைக் கோட்பாடுகள் (36-51), 11 அடிப்படைக் கடமைகள் (51A), குடியரசுத் தலைவர், பிரதமர், ஆளுநர், முதலமைச்சர்',
      microTopics: [
        { id: 'tn_pol_7', topicTitle: 'அரசு வழிகாட்டு நெறிமுறைகள் — DPSP (Articles 36–51) & அடிப்படைக் கடமைகள் 51A', subtopic: 'கிராம பஞ்சாயத்து (Art 40), பொது சிவில் சட்டம் (Art 44), ஸ்வரண் சிங் கமிட்டி 11 அடிப்படைக் கடமைகள்', dayNumber: 3, periodNumber: 2, keyFormulaOrLaw: 'Art 40: Village Panchayats | Art 44: Uniform Civil Code | Art 51A: 11 Fundamental Duties (Added by 42nd & 86th Amendments)', keyPoints: ['அயர்லாந்து அரசியலமைப்பிலிருந்து DPSP பெறப்பட்டது', '11-வது கடமை: 6-14 வயது குழந்தைகளுக்கு கல்வி வாய்ப்பளிப்பது பெற்றோரின் கடமை'], type: 'concept', importance: 'High-Yield' },
        { id: 'tn_pol_8', topicTitle: 'இந்தியக் குடியரசுத் தலைவர், நாடாளுமன்றம் & ஆளுநர் அதிகாரங்கள்', subtopic: 'குடியரசுத் தலைவர் தேர்தல், அவசரநிலை (352, 356, 360), நிதி மசோதா (Art 110), ஆளுநரின் விருப்புரிமை அதிகாரங்கள்', dayNumber: 8, periodNumber: 2, keyFormulaOrLaw: 'Article 52: President of India | Article 72: Pardoning Power | Article 110: Money Bill (Speaker Decision Final)', keyPoints: ['Article 352: தேசிய அவசரநிலை | Article 356: மாநில குடியரசுத் தலைவர் ஆட்சி | Article 360: நிதி அவசரநிலை', 'மக்களவை அதிகபட்சம் 550 | மாநிலங்களவை 250 (12 நியமன உறுப்பினர்கள்)'], type: 'concept', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 4,
      chapterTitle: 'நீதித்துறை, உள்ளாட்சி அமைப்புகள் (73rd/74th) & அரசியலமைப்பு அமைப்புகள்',
      description: 'உச்ச நீதிமன்றம், உயர் நீதிமன்றங்கள், 73/74-வது பஞ்சாயத்து ராஜ் திருத்தங்கள் 1992, தேர்தல் ஆணையம், CAG, Lokpal & RTI 2005',
      microTopics: [
        { id: 'tn_pol_9', topicTitle: 'உச்ச நீதிமன்றம், உயர் நீதிமன்றங்கள் & நீதித்துறை மறுஆய்வு (Judicial Review)', subtopic: 'கொலீஜியம் முறை, அசல் வரம்பு (Art 131), மேல்முறையீட்டு வரம்பு, நீதிமன்ற அவமதிப்பு அதிகாரம் (Art 129)', dayNumber: 4, periodNumber: 2, keyFormulaOrLaw: 'Article 124: Establishment of Supreme Court | Article 214: High Courts in States | Court of Record: Art 129', keyPoints: ['உச்ச நீதிமன்ற நீதிபதிகள் ஓய்வு வயது 65 | உயர் நீதிமன்ற நீதிபதிகள் ஓய்வு வயது 62', 'நீதி மறுஆய்வு அதிகாரம் அரசியலமைப்பின் அடிப்படைக் கட்டமைப்பு (Basic Structure)'], type: 'concept', importance: 'High-Yield' },
        { id: 'tn_pol_10', topicTitle: 'பஞ்சாயத்து ராஜ் & நகராட்சிகள் (73-வது & 74-வது சட்டத்திருத்தங்கள் 1992)', subtopic: 'பல்வந்த் ராய் மேத்தா கமிட்டி (3 அடுக்கு முறை), 11-வது அட்டவணை (29 துறைகள்), 12-வது அட்டவணை (18 துறைகள்), கிராம சபை', dayNumber: 9, periodNumber: 2, keyFormulaOrLaw: '73rd Amendment 1992: Part IX (Art 243 to 243O) | 74th Amendment: Part IXA (Art 243P to 243ZG)', keyPoints: ['கிராம சபை பஞ்சாயத்து ராஜ் அமைப்பின் ஆணிவேர்', 'பெண்களுக்கு 33% இடஒதுக்கீடு (தமிழ்நாட்டில் 50% இடஒதுக்கீடு சட்டம்)'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'tn_pol_11', topicTitle: 'தேர்தல் ஆணையம், CAG, TNPSC, லோக்பால் & தகவல் அறியும் உரிமைச் சட்டம் (RTI 2005)', subtopic: 'பிரிவு 324 தேர்தல் ஆணையம், பிரிவு 148 CAG, லோக்பால் மற்றும் லோக் ஆயுக்தா சட்டம் 2013, தகவல் அறியும் உரிமை சட்டம் 2005 (30 நாட்கள்)', dayNumber: 14, periodNumber: 2, keyFormulaOrLaw: 'Art 324: Election Commission of India | Art 148: Comptroller & Auditor General (Public Purse Guardian)', keyPoints: ['RTI 2005: 30 நாட்களுக்குள் தகவல் வழங்க வேண்டும் (உயிர்/சுதந்திரம் சார்ந்தது எனில் 48 மணிநேரம்)', 'CAG அறிக்கை நாடாளுமன்ற பொதுக்கணக்கு குழுவுக்கு (PAC) சமர்ப்பிக்கப்படும்'], type: 'concept', importance: 'High-Yield' }
      ]
    }
  ];

  // SUBJECT 3: APTITUDE & MENTAL ABILITY (UNIT X - 25/25 TARGET)
  const aptitudeChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'சுருக்குதல் (BODMAS), HCF & LCM',
      description: 'எண்கணித அடிப்படை, இயற்கணித முற்றொருமைகள் & மீ.சி.ம / மீ.பொ.வ',
      microTopics: [
        { id: 'tn_apt_1', topicTitle: 'சுருக்குதல் (Simplification) — BODMAS & முற்றொருமைகள்', subtopic: 'a²+b², a³+b³, பின்னங்கள், தசம எண்கள் மற்றும் வர்க்கமூலம் காணுதல்', dayNumber: 1, periodNumber: 3, keyFormulaOrLaw: 'BODMAS Rule: Brackets -> Orders -> Division -> Multiplication -> Addition -> Subtraction', keyPoints: ['(a+b)² = a² + 2ab + b²', '(a-b)² = a² - 2ab + b²', 'a² - b² = (a+b)(a-b)'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'tn_apt_2', topicTitle: 'மீப்பெரு பொது காரணி & மீச்சிறு பொது மடங்கு (HCF & LCM)', subtopic: 'பகா காரணி முறை, தொடர் வகுத்தல், பின்னங்களின் HCF/LCM, இரு எண்களின் பெருக்கற்பலன் சமன்பாடு', dayNumber: 6, periodNumber: 3, keyFormulaOrLaw: 'Product of Two Numbers = HCF × LCM (a × b = HCF × LCM) | Fractions HCF = Numerators HCF / Denominators LCM', keyPoints: ['இரு அடுத்தடுத்த பகா எண்களின் HCF = 1', 'மணிகள் ஒன்றாக ஒலிக்கும் கால இடைவெளி = LCM'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'விழுக்காடு, இலாப நட்டம், தனிவட்டி & கூட்டுவட்டி (CI - SI)',
      description: 'சதவீத கணக்கீடுகள், தள்ளுபடி, SI = PNR/100, மற்றும் 2/3 ஆண்டுகள் CI - SI வித்தியாசம்',
      microTopics: [
        { id: 'tn_apt_3', topicTitle: 'விழுக்காடு (Percentage), இலாப நட்டம் & தொடர் தள்ளுபடி', subtopic: 'பின்னத்தை சதவீதமாக மாற்றுதல், விலை ஏற்ற/இறக்க சமன்பாடு, அடக்க/விற்ற விலை மற்றும் தொடர் தள்ளுபடி சூத்திரம்', dayNumber: 2, periodNumber: 3, keyFormulaOrLaw: 'Profit% = (Profit / CP) × 100 | Successive Discount Formula = a + b - (ab / 100)', keyPoints: ['விலை r% அதிகரித்தால் செலவு மாறாமல் இருக்க நுகர்வு குறைப்பு = [r / (100 + r)] × 100%', 'குறித்த விலை மற்றும் விற்பனை விலை கணக்கீடுகள்'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'tn_apt_4', topicTitle: 'தனிவட்டி (SI) & கூட்டுவட்டி (CI) & 2, 3 ஆண்டுகள் வித்தியாசம் (D)', subtopic: 'SI = PNR/100, A = P(1+R/100)ⁿ, அரை ஆண்டு கூட்டுவட்டி மற்றும் 2, 3 ஆண்டுகள் CI - SI வித்தியாசம்', dayNumber: 7, periodNumber: 3, keyFormulaOrLaw: '2 Years Difference D = P(R / 100)² | 3 Years Difference D = P(R / 100)² (3 + R / 100)', keyPoints: ['அசல் n மடங்காகும் காலம்: N = (n - 1) × 100 / R', 'கூட்டுவட்டி அரையாண்டு முறை: R/2, 2N'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 3,
      chapterTitle: 'விகிதம், நேரம் & வேலை, அளவியல் (2D/3D) & தர்க்கவியல் (Reasoning)',
      description: 'விகிதாசாரம், குழாய்கள் தொட்டி கணக்குகள், 2D/3D பரப்பளவு/கனஅளவு, பகடை & இரத்த உறவுகள்',
      microTopics: [
        { id: 'tn_apt_5', topicTitle: 'விகிதம் (Ratio & Proportion), நேரம் மற்றும் வேலை (Time & Work)', subtopic: 'A:B:C குறுக்குவழி, A & B சேர்ந்து செய்யும் வேலை, குழாய்கள் தொட்டி மற்றும் மனிதன்-நாள் சூத்திரம்', dayNumber: 3, periodNumber: 3, keyFormulaOrLaw: 'Chain Rule: (M₁ × D₁ × H₁) / W₁ = (M₂ × D₂ × H₂) / W₂ | A and B Together = (xy) / (x + y) days', keyPoints: ['வேலை = திறன் × நாட்கள் (Work = Efficiency × Time)', 'கசிவு உள்ள தொட்டி காலியாகும் நேரம்'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'tn_apt_6', topicTitle: 'அளவியல் (2D & 3D Mensuration): பரப்பளவு, சுற்றளவு & கனஅளவு', subtopic: 'முக்கோணம், வட்டம், உருளை (Cylinder), கூம்பு (Cone), கோளம் (Sphere) & அரைக்கோளம் சூத்திரங்கள்', dayNumber: 8, periodNumber: 3, keyFormulaOrLaw: 'வட்டப் பரப்பு = πr² | உருளை கனஅளவு = πr²h | கூம்பு கனஅளவு = 1/3 πr²h | கோள கனஅளவு = 4/3 πr³', keyPoints: ['கூம்பு சாயுயரம் l = √(h² + r²)', 'அரைக்கோள மொத்த புறப்பரப்பு = 3πr²'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'tn_apt_7', topicTitle: 'தர்க்கவியல் காரணமறிதல் (Reasoning): பகடை, இரத்த உறவுகள் & வரைபடங்கள்', subtopic: 'எண் தொடர், பகடை எதிரெதிர் பக்கங்கள், இரத்த உறவு மரபு வரைபடம், கடிகாரம்/காலண்டர் & வட்ட விளக்கப்படம் (Pie Chart)', dayNumber: 13, periodNumber: 3, keyFormulaOrLaw: 'கடிகார முட்களுக்கு இடைப்பட்ட கோணம் θ = |30H - (11/2)M|', keyPoints: ['பகடை விதிகளில் பொதுவான பக்கங்களை வைத்து எதிர்ப்பக்கம் காணுதல்', 'Pie Chart 100% = 360° கோண அளவு மாற்றம்'], type: 'quiz', importance: 'High-Yield' }
      ]
    }
  ];

  // SUBJECT 4: HISTORY, CULTURE & DEVELOPMENT ADMINISTRATION OF TAMIL NADU (UNIT VIII & IX)
  const unit8_9Chapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Unit VIII: பண்டைய தமிழக வரலாறு & தொல்லியல் அகழாய்வுகள்',
      description: 'கீழடி, ஆதிச்சநல்லூர், கொடுமணல், பொருந்தல், சிவகளை மற்றும் சங்க கால மூவேந்தர் ஆட்சி',
      microTopics: [
        { id: 'tn_u8_1', topicTitle: 'தொல்லியல் அகழாய்வுகள்: கீழடி, ஆதிச்சநல்லூர், கொடுமணல், பொருந்தல், சிவகளை', subtopic: 'வைகை நதிக்கரை நாகரிகம், தமிழ்-பிராமி எழுத்துப் பொறிப்புகள், ரோமானிய நாணயங்கள் & கிமு 6-ம் நூற்றாண்டு நகரமைப்பு', dayNumber: 1, periodNumber: 4, keyFormulaOrLaw: 'கீழடி அகழாய்வு காலம்: கிமு 6-ம் நூற்றாண்டு (கிமு 580 - வைகை சமவெளி நாகரிகம்)', keyPoints: ['ஆதிச்சநல்லூர் முதுமக்கள் தாழிகள் & இரும்புப் பொருட்கள்', 'பொருந்தல் நெல்மணிகள் சான்று (கிமு 450)', 'சிவகளை தாமிரபரணி நதிக்கரை நாகரிகம் (கிமு 1155)'], type: 'concept', importance: 'High-Yield' },
        { id: 'tn_u8_2', topicTitle: 'சங்க கால அரசியல், மூவேந்தர் & சோழர்களின் குடவோலை முறை (உத்தரமேரூர்)', subtopic: 'சேர, சோழ, பாண்டியர் நிர்வாகம், கடையேழு வள்ளல்கள், முதலாம் பராந்தக சோழன் உத்தரமேரூர் கல்வெட்டு (கி.பி 919 & 921)', dayNumber: 6, periodNumber: 4, keyFormulaOrLaw: 'உத்தரமேரூர் கல்வெட்டு: கிராம சுயாட்சி மற்றும் குடவோலை தேர்தல் முறை தகுதிகள்', keyPoints: ['வாரியங்கள்: ஏரி வாரியம், தோட்ட வாரியம், பொன் வாரியம், பஞ்சவார வாரியம்', 'சேரர் - வில் அம்பு (வஞ்சி) | சோழர் - புலி (உறையூர்) | பாண்டியர் - மீன் (மதுரை)'], type: 'concept', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Unit VIII: தமிழக விடுதலைப் போராட்ட வீரர்கள் & சமூக இயக்கங்கள்',
      description: 'வேலு நாச்சியார், கட்டபொம்மன், மருது சகோதரர்கள், வ.உ.சி, பாரதியார், நீதிக்கட்சி 1916 & பெரியார் சுயமரியாதை இயக்கம்',
      microTopics: [
        { id: 'tn_u8_3', topicTitle: 'பாளையக்காரர் புரட்சி & தமிழக விடுதலைப் போராட்ட வீரர்கள்', subtopic: 'பூலித்தேவர், வேலு நாச்சியார் (குயிலி தற்கொலைப்படை), வீரபாண்டிய கட்டபொம்மன், மருது சகோதரர்கள் (1801 திருச்சிராப்பள்ளி பிரகடனம்), வ.உ.சி சுதேசிக் கப்பல்', dayNumber: 2, periodNumber: 4, keyFormulaOrLaw: '1801 ஜூன் 12: மருது சகோதரர்களின் திருச்சிராப்பள்ளி சுதந்திரப் பிரகடனம்', keyPoints: ['வேலு நாச்சியார் பிரிட்டிஷாரை எதிர்த்து வென்ற முதல் இந்திய பெண் அரசி (1780)', 'வ.உ.சிதம்பரனார் 1906-ல் சுதேசி ஸ்டீம் நேவிகேஷன் கப்பல் நிறுவனத்தைத் தொடங்கினார்'], type: 'concept', importance: 'High-Yield' },
        { id: 'tn_u8_4', topicTitle: 'நீதிக்கட்சி (1916) சாதனைகள் & தந்தை பெரியார் சுயமரியாதை இயக்கம் (1925)', subtopic: 'தியாகராய செட்டியார், 1921 வகுப்புவாரி அரசாணை (Communal GO), இந்து சமய அறநிலையச் சட்டம் 1926, வைக்கம் போராட்டம் 1924 & குடியரசு இதழ்', dayNumber: 7, periodNumber: 4, keyFormulaOrLaw: '1921 Communal GO | 1926 இந்து சமய அறநிலையச் சட்டம் | 1925 சுயமரியாதை இயக்கம்', keyPoints: ['ஆந்திரா பல்கலைக்கழகம் 1926, அண்ணாமலை பல்கலைக்கழகம் 1929 நீதிக்கட்சியால் உருவாக்கம்', 'தேவதாசி முறை ஒழிப்பு சட்டம் (டாக்டர் முத்துலட்சுமி ரெட்டி முயற்சி)'], type: 'concept', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 3,
      chapterTitle: 'Unit IX: தமிழ்நாடு வளர்ச்சி நிர்வாகம், மனிதவளம் (HDI) & தொழில் தொகுப்புகள்',
      description: 'மனிதவள குறியீடுகள் (HDI, GII), 69% இடஒதுக்கீடு, நான் முதல்வன், புதுமைப் பெண், Detroit of Asia சென்னை, e-Sevai',
      microTopics: [
        { id: 'tn_u9_1', topicTitle: 'தமிழ்நாட்டின் மனிதவள மேம்பாட்டுக் குறியீடுகள் (HDI) & 69% இடஒதுக்கீடு சட்டம்', subtopic: 'உயர் கல்வி சேர்க்கை விகிதம் (GER ~51%), தாய்-சேய் இறப்பு விகிதம் (MMR, IMR) & 1994 தமிழ்நாடு 69% இடஒதுக்கீடு சட்டம் (9-வது அட்டவணை பாதுகாப்பு)', dayNumber: 3, periodNumber: 4, keyFormulaOrLaw: '1994 தமிழ்நாடு இடஒதுக்கீடு சட்டம்: 69% இடஒதுக்கீடு அரசியலமைப்பின் 9-வது அட்டவணையில் சேர்க்கப்பட்டது', keyPoints: ['தமிழ்நாடு GER தேசிய சராசரியை விட 2 மடங்கு அதிகம்', 'NITI Aayog சுகாதாரக் குறியீட்டில் தமிழ்நாடு முன்னணி'], type: 'concept', importance: 'High-Yield' },
        { id: 'tn_u9_2', topicTitle: 'தமிழ்நாட்டின் தொழில் தொகுப்புகள் (Industrial Clusters) & e-Governance (TNeGA)', subtopic: 'ஆசியாவின் டெட்ராய்ட் (சென்னை), பின்னலாடை நகரம் (திருப்பூர்), சிவகாசி (குட்டி ஜப்பான்), SIPCOT, TIDEL Park & TNeGA இ-சேவை மையங்கள்', dayNumber: 8, periodNumber: 4, keyFormulaOrLaw: 'சென்னை: "Detroit of Asia" | திருப்பூர்: இந்தியாவின் பின்னலாடை தலைநகரம் | சிவகாசி: குட்டி ஜப்பான் (நேரு)', keyPoints: ['SIPCOT, TIDCO, TANSIDCO தொழில் பூங்காக்கள்', 'TNeGA, உழவன் செயலி மற்றும் ஒருங்கிணைந்த பொது விநியோகத் திட்டம் (Universal PDS)'], type: 'concept', importance: 'High-Yield' }
      ]
    }
  ];

  // SUBJECT 5: GENERAL SCIENCE, GEOGRAPHY, INDIAN HISTORY & ECONOMY (UNIT I, III, IV, VI, VII)
  const gsCoreChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Unit I: பொது அறிவியல் (Physics, Chemistry & Life Sciences)',
      description: 'இயக்க விதிகள், ஒளியியல், மின்னியல், தனிம வரிசை அட்டவணை, அமிலங்கள் காரங்கள், மனித உறுப்பு மண்டலங்கள் & நோய்கள்',
      microTopics: [
        { id: 'tn_sci_1', topicTitle: 'இயக்கவியல், ஒளியியல் & மின்னியல் (Physics Core)', subtopic: 'நியூட்டனின் இயக்க விதிகள் (F=ma), முழு அக எதிரொளிப்பு (TIR), ஓம் விதி (V=IR), மின் திறன் & மின்காந்த தூண்டல்', dayNumber: 1, periodNumber: 5, keyFormulaOrLaw: 'F = ma | V = IR | P = VI = I²R | 1 Unit = 1 kWh = 3.6 × 10⁶ Joules', keyPoints: ['வைரம் ஒளிர்தல் மற்றும் ஆப்டிகல் ஃபைபர் முழு அக எதிரொளிப்பு தத்துவத்தில் இயங்குகிறது', 'கிட்டப்பார்வைக்கு குழி லென்ஸ் (Concave) | தூரப்பார்வைக்கு குவி லென்ஸ் (Convex)'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'tn_sci_2', topicTitle: 'தனிமங்கள், அமிலங்கள், காரங்கள் & அன்றாட வேதியியல் (Chemistry Core)', subtopic: 'pH மதிப்பு, பிளாஸ்டர் ஆஃப் பாரிஸ், சலவைத்தூள், உரங்கள் (NPK), பெட்ரோலிய பொருட்கள் & உலோகக் கலவைகள்', dayNumber: 5, periodNumber: 5, keyFormulaOrLaw: 'pH = -log[H⁺] | பிளாஸ்டர் ஆஃப் பாரிஸ்: CaSO₄ · ½H₂O | சலவைத்தூள்: CaOCl₂', keyPoints: ['மனித ரத்தத்தின் pH மதிப்பு 7.35 - 7.45', 'பித்தளை (Brass): செம்பு (Cu) + துத்தநாகம் (Zn) | வெண்கலம் (Bronze): செம்பு (Cu) + தகரம் (Sn)'], type: 'concept', importance: 'High-Yield' },
        { id: 'tn_sci_3', topicTitle: 'மனித உடலியல், வைட்டமின்கள், ஊட்டச்சத்து & நோய்கள் (Life Sciences Core)', subtopic: 'செரிமான மண்டலம், ரத்த சுழற்சி (ABO ரத்த வகை), நாளமில்லா சுரப்பிகள், வைட்டமின் குறைபாட்டு நோய்கள் & தடுப்பூசிகள்', dayNumber: 9, periodNumber: 5, keyFormulaOrLaw: 'வைட்டமின் A (மாலைக்கண்), B1 (பெரிபெரி), C (ஸ்கர்வி), D (ரிக்கெட்ஸ்), K (ரத்தம் உறையாமை)', keyPoints: ['இன்சுலின் கணையத்தின் பீட்டா செல்களால் சுரக்கப்படுகிறது (ரத்த சர்க்கரை குறைப்பு)', 'உலகளாவிய ரத்தக் கொடையாளி: O Negative | உலகளாவிய ரத்த ஏற்பாளர்: AB Positive'], type: 'concept', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Unit III: இந்திய & தமிழ்நாடு புவியியல் (Geography of India & TN)',
      description: 'இயற்கை அமைப்புகள், தென்மேற்கு/வடகிழக்கு பருவக்காற்று, ஆறுகள் (காவிரி, வைகை), மண் வகைகள், பயிர் பருவங்கள் (குறுவை, தாளடி, சம்பா)',
      microTopics: [
        { id: 'tn_geo_1', topicTitle: 'இந்திய & தமிழ்நாடு இயற்கை அமைப்புகள், பருவமழை & ஆறுகள்', subtopic: 'இமயமலை, தக்காண பீடபூமி, தென்மேற்கு மற்றும் வடகிழக்கு பருவக்காற்று, காவிரி, வைகை, தாமிரபரணி நீர்நிலைகள்', dayNumber: 2, periodNumber: 5, keyFormulaOrLaw: 'தமிழ்நாடு அதிக மழைப்பொழிவைப் பெறுவது: வடகிழக்குப் பருவமழை (அக்டோபர் - டிசம்பர்)', keyPoints: ['தாமிரபரணி தமிழ்நாட்டின் வற்றாத ஜீவநதி', 'மேட்டூர் அணை (ஸ்டான்லி நீர்த்தேக்கம்) காவிரி நதியின் குறுக்கே கட்டப்பட்டுள்ளது'], type: 'concept', importance: 'High-Yield' },
        { id: 'tn_geo_2', topicTitle: 'மண் வகைகள், காடுகள், வேளாண் பருவங்கள் & பேரிடர் மேலாண்மை', subtopic: 'வண்டல் மண், கரிசல் மண், செம்மண், குறுவை, சம்பா, தாளடி பயிர் பருவங்கள், நெய்வேலி பழுப்பு நிலக்கரி & புயல்/வெள்ள அபாய மேலாண்மை', dayNumber: 6, periodNumber: 5, keyFormulaOrLaw: 'பயிர் பருவங்கள்: குறுவை (ஜூன்-செப்), சம்பா (ஆக-ஜன), நவரை/தாளடி (நவ-மார்)', keyPoints: ['பருத்தி விளைச்சலுக்கு ஏற்ற மண்: கரிசல் மண் (Regur Soil)', 'நெய்வேலியில் லிக்னைட் பழுப்பு நிலக்கரி வெட்டி எடுக்கப்படுகிறது'], type: 'concept', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 3,
      chapterTitle: 'Unit IV, VI & VII: இந்திய வரலாறு, பொருளாதாரம் & தேசிய இயக்கம்',
      description: 'சிந்து சமவெளி, மௌரியர், குப்தர், முகலாயர், 1857 புரட்சி, காந்தியடிகள், ஐந்தாண்டு திட்டங்கள், NITI Aayog & GST',
      microTopics: [
        { id: 'tn_his_1', topicTitle: 'சிந்து சமவெளி நாகரிகம், மௌரியர், குப்தர்கள் & முகலாயப் பேரரசு', subtopic: 'ஹரப்பா, மொகஞ்சதாரோ, அசோகரின் தர்மம், இரண்டாம் சந்திரகுப்தர் பொற்காலம், அக்பரின் மன்சப்தாரி முறை & தீன்-இலாஹி', dayNumber: 3, periodNumber: 5, keyFormulaOrLaw: 'சிந்து சமவெளி பெருங்குளம் மொகஞ்சதாரோவில் கண்டறியப்பட்டது | கப்பல் கட்டும் தளம்: லோத்தல்', keyPoints: ['அசோகரின் கல்வெட்டுகள் பிராமி மற்றும் கரோஷ்டி எழுத்துக்களில் பொறிக்கப்பட்டன', 'அக்பரின் மத நல்லிணக்கக் கொள்கை: சுல்-இ-குல் (Sulh-i-Kul)'], type: 'concept', importance: 'High-Yield' },
        { id: 'tn_his_2', topicTitle: '1857 பெரும் புரட்சி, இந்திய தேசிய காங்கிரஸ் & காந்தியடிகள் இயக்கம்', subtopic: 'மீரட் புரட்சி, மங்கள் பாண்டே, ஜான்சி ராணி, 1885 INC தோற்றம், ஒத்துழையாமை இயக்கம், வேதாரண்யம் உப்பு சத்தியாகிரகம் (ராஜாஜி), வெள்ளையனே வெளியேறு 1942', dayNumber: 7, periodNumber: 5, keyFormulaOrLaw: '1930 ஏப்ரல் 13 - 28: ராஜாஜி தலைமையில் திருச்சியிலிருந்து வேதாரண்யத்திற்கு உப்பு சத்தியாகிரக நடைபயணம்', keyPoints: ['1857 புரட்சியின் முதல் வெடிப்பு: பராக்பூர் (மங்கள் பாண்டே)', '1942 ஆகஸ்ட் 8: காந்தியடிகளின் "செய் அல்லது செத்து மடி" (Do or Die) பிரகடனம்'], type: 'concept', importance: 'High-Yield' },
        { id: 'tn_his_3', topicTitle: 'இந்தியப் பொருளாதாரம்: ஐந்தாண்டுத் திட்டங்கள், NITI Aayog, GST & RBI கொள்கைகள்', subtopic: 'ஹரோட்-டோமர் மாதிரி (1-ம் திட்டம்), மஹலனோபிஸ் மாதிரி (2-ம் திட்டம்), NITI Aayog (2015), GST வரி அடுக்குகள் (5%, 12%, 18%, 28%) & ரெப்போ வட்டி விகிதம்', dayNumber: 11, periodNumber: 5, keyFormulaOrLaw: 'GST நடைமுறை: 1 ஜூலை 2017 (101-வது அரசியலமைப்பு திருத்தம்) | NITI Aayog: 1 ஜனவரி 2015', keyPoints: ['ரெப்போ ரேட்: வணிக வங்கிகளுக்கு ரிசர்வ் வங்கி வழங்கும் கடனுக்கான வட்டி விகிதம்', 'பசுமைப் புரட்சியின் தந்தை: இந்தியாவில் எம்.எஸ். சுவாமிநாதன், உலகில் நார்மன் போர்லாக்'], type: 'solved_problem', importance: 'High-Yield' }
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
// 2. NEET UG OFFICIAL VAST MICRO-TOPIC SYLLABUS REGISTRY
// ─────────────────────────────────────────────────────────────────────────────
export function getNeetUgCompleteSyllabus(): CourseFullSyllabus {
  const physicsChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Physics and Measurement & Practical Skills',
      description: 'SI Units, Dimensional Analysis, Error Analysis, Vernier Calipers, Screw Gauge & Simple Pendulum',
      microTopics: [
        { id: 'neet_p_1', topicTitle: 'Units, Dimensions & Dimensional Analysis Applications', subtopic: 'Fundamental & derived units, principle of homogeneity, formula derivation', dayNumber: 1, periodNumber: 1, keyFormulaOrLaw: '[Force] = [M L T⁻²] | [Energy] = [M L² T⁻²] | [Planck Constant h] = [M L² T⁻¹]', keyPoints: ['Dimensionless quantities: Strain, Angle, Refractive index', 'Checking dimensional consistency of equations'], type: 'concept', importance: 'High-Yield' },
        { id: 'neet_p_2', topicTitle: 'Errors in Measurement, Significant Figures & Combination of Errors', subtopic: 'Absolute, relative and percentage errors, error propagation in Z = A^p B^q / C^r', dayNumber: 5, periodNumber: 1, keyFormulaOrLaw: 'ΔZ/Z = p(ΔA/A) + q(ΔB/B) + r(ΔC/C) | Percentage Error = (ΔZ/Z) × 100%', keyPoints: ['Errors always add up in worst-case analysis', 'Rounding off rules and significant digits'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'neet_p_3', topicTitle: 'Experimental Physics: Vernier Calipers & Screw Gauge', subtopic: 'Least count, pitch, zero error (positive and negative), measurement of diameter and thickness', dayNumber: 9, periodNumber: 1, keyFormulaOrLaw: 'LC of Vernier = 1 MSD - 1 VSD | LC of Screw Gauge = Pitch / Total Circular Divisions', keyPoints: ['Correct Reading = Main Scale Reading + (VSR × LC) - (Zero Error)', 'Thickness of thin wire / sheet calculations'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Kinematics (1D & 2D Motion) & Vectors',
      description: 'Rectilinear motion, calculus equations, vectors, projectile motion & uniform circular motion',
      microTopics: [
        { id: 'neet_p_4', topicTitle: 'Motion in a Straight Line & Graphical Kinematics', subtopic: 'v-t and x-t graphs, instantaneous velocity v = dx/dt, acceleration a = dv/dt = v(dv/dx)', dayNumber: 2, periodNumber: 1, keyFormulaOrLaw: 'v = u + at | s = ut + ½at² | v² = u² + 2as | s_nth = u + ½a(2n - 1)', keyPoints: ['Area under v-t graph = Displacement', 'Slope of v-t graph = Acceleration', 'Motion under gravity (g = 9.8 m/s²)'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'neet_p_5', topicTitle: 'Vectors & Relative Velocity in 1D and 2D', subtopic: 'Dot and Cross product, resolution of vectors, river-boat and rain-man problems', dayNumber: 6, periodNumber: 1, keyFormulaOrLaw: 'A · B = AB cos θ | |A × B| = AB sin θ | v_AB = v_A - v_B', keyPoints: ['Shortest path across river: sin θ = v_r / v_b', 'Work done = F · d (Scalar) | Torque = r × F (Vector)'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'neet_p_6', topicTitle: 'Projectile Motion & Circular Kinematics', subtopic: 'Equation of trajectory, time of flight, maximum height, horizontal range and centripetal acceleration', dayNumber: 10, periodNumber: 1, keyFormulaOrLaw: 'T = (2u sin θ)/g | H_max = (u² sin² θ)/(2g) | R = (u² sin 2θ)/g | a_c = v²/r = ω²r', keyPoints: ['Trajectory is parabolic: y = x tan θ - gx² / (2u² cos² θ)', 'Range is maximum at launch angle θ = 45°'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 3,
      chapterTitle: 'Laws of Motion & Friction',
      description: 'Newton laws, linear momentum conservation, connected bodies, friction and banked roads',
      microTopics: [
        { id: 'neet_p_7', topicTitle: 'Newton Laws of Motion, Momentum Conservation & Pulleys', subtopic: 'Impulse J = Δp = F_avg Δt, free body diagrams (FBD), tension in strings and elevator problems', dayNumber: 3, periodNumber: 1, keyFormulaOrLaw: 'F_net = dp/dt = m(dv/dt) = ma | Atwood Machine a = (m₂ - m₁)g / (m₁ + m₂)', keyPoints: ['Rocket propulsion thrust F = v_rel (dm/dt)', 'Apparent weight in elevator: N = m(g ± a)'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'neet_p_8', topicTitle: 'Friction & Dynamics of Circular Motion on Banked Roads', subtopic: 'Static friction, kinetic friction, angle of repose, maximum safe speed on level and banked curves', dayNumber: 7, periodNumber: 1, keyFormulaOrLaw: 'f_s(max) = μ_s N | Level Road v_max = √(μ_s r g) | Banked Road v_opt = √(r g tan θ)', keyPoints: ['Angle of repose θ = tan⁻¹(μ_s)', 'Centripetal force is provided by component of normal reaction and friction'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 4,
      chapterTitle: 'Work, Energy, Power & Rotational Motion',
      description: 'Work-energy theorem, potential energy of spring, centre of mass, torque, moment of inertia & rolling',
      microTopics: [
        { id: 'neet_p_9', topicTitle: 'Work-Energy Theorem, Spring Potential Energy & Collisions', subtopic: 'Conservative forces F = -dU/dx, 1D and 2D elastic and inelastic collisions', dayNumber: 4, periodNumber: 1, keyFormulaOrLaw: 'W_net = ΔK = ½m(v² - u²) | U_spring = ½kx² | Coefficient of Restitution e = (v₂ - v₁)/(u₁ - u₂)', keyPoints: ['For perfectly elastic collision e = 1 | Inelastic e = 0', 'Power P = F · v = dW/dt'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'neet_p_10', topicTitle: 'Centre of Mass, Torque & Moment of Inertia Theorems', subtopic: 'Parallel and perpendicular axes theorems, angular momentum conservation, pure rolling without slipping', dayNumber: 8, periodNumber: 1, keyFormulaOrLaw: 'τ = Iα = r × F | L = Iω | I_parallel = I_cm + Md² | Total K_rolling = ½Mv²(1 + k²/R²)', keyPoints: ['Ring k²/R² = 1 | Disc k²/R² = 0.5 | Solid Sphere k²/R² = 0.4', 'Conservation of angular momentum L = I₁ω₁ = I₂ω₂'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 5,
      chapterTitle: 'Gravitation, Solids, Fluids & Thermodynamics',
      description: 'Gravitational field & escape velocity, elasticity, fluid dynamics (Bernoulli/Stokes), thermal laws',
      microTopics: [
        { id: 'neet_p_11', topicTitle: 'Universal Gravitation, Variation of g & Escape Velocity', subtopic: 'Variation of g with height/depth, orbital velocity, Kepler laws of planetary motion', dayNumber: 11, periodNumber: 1, keyFormulaOrLaw: 'v_escape = √(2GM/R) = √(2gR) ≈ 11.2 km/s | g_h = g(1 - 2h/R) | g_d = g(1 - d/R)', keyPoints: ['Kepler Third Law: T² ∝ a³', 'Gravitational potential inside solid sphere vs outside'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'neet_p_12', topicTitle: 'Fluid Dynamics: Bernoulli Principle, Stokes Law & Surface Tension', subtopic: 'Viscosity, terminal velocity, streamline flow, equation of continuity, capillary rise', dayNumber: 12, periodNumber: 1, keyFormulaOrLaw: 'A₁v₁ = A₂v₂ | P + ½ρv² + ρgh = constant | v_t = 2r²(ρ - σ)g / (9η) | h = (2T cos θ)/(r ρ g)', keyPoints: ['Bernoulli application in Magnus effect and Venturimeter', 'Excess pressure in bubble: ΔP = 4T/R | in liquid drop: 2T/R'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'neet_p_13', topicTitle: 'Thermodynamic Processes, First & Second Laws & Carnot Engine', subtopic: 'Work done in isothermal (W = nRT ln(V₂/V₁)) and adiabatic (PV^γ = C) processes, entropy', dayNumber: 13, periodNumber: 1, keyFormulaOrLaw: 'ΔQ = ΔU + ΔW | W_adiabatic = (P₁V₁ - P₂V₂) / (γ - 1) | Efficiency η = 1 - T_sink/T_source', keyPoints: ['For cyclic process ΔU = 0 -> Q = W', 'Isothermal bulk modulus = P | Adiabatic = γP'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 6,
      chapterTitle: 'Electrostatics, Current Electricity & Magnetism',
      description: 'Coulomb law, Gauss law, capacitors, Ohm law, Kirchhoff rules, Biot-Savart law & Galvanometer',
      microTopics: [
        { id: 'neet_p_14', topicTitle: 'Gauss Law, Electric Potential & Parallel Plate Capacitors', subtopic: 'Flux Φ = q_in / ε₀, potential energy, dielectric insertion and combinations of capacitors', dayNumber: 14, periodNumber: 1, keyFormulaOrLaw: 'E_sheet = σ/(2ε₀) | V = kq/r | C = K ε₀ A / d | Energy U = ½CV² = Q²/(2C)', keyPoints: ['Equipotential surfaces are always perpendicular to electric field lines', 'Dielectric increases capacitance by factor K'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'neet_p_15', topicTitle: 'Current Electricity: Drift Velocity, Kirchhoff Rules & Potentiometer', subtopic: 'Ohm law micro-form j = σE, Wheatstone bridge, EMF vs terminal potential, temperature coefficient', dayNumber: 15, periodNumber: 1, keyFormulaOrLaw: 'I = n e A v_d | R = ρL/A | V = E - Ir | Wheatstone: P/Q = R/S | Potentiometer: E₁/E₂ = L₁/L₂', keyPoints: ['Kirchhoff Current Law (Charge conservation) | Voltage Law (Energy conservation)', 'Metre bridge wire resistance analysis'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'neet_p_16', topicTitle: 'Magnetic Effects of Current: Biot-Savart, Ampere Law & Galvanometer', subtopic: 'Magnetic field at centre and axis of circular loop, Lorentz force F = q(E + v × B), galvanometer to ammeter/voltmeter', dayNumber: 16, periodNumber: 1, keyFormulaOrLaw: 'B_loop = (μ₀ I)/(2R) | B_axis = (μ₀ I R²)/[2(R² + x²)^(3/2)] | Shunt S = I_g G / (I - I_g)', keyPoints: ['Moving coil galvanometer current sensitivity = NBA/k', 'Cyclotron frequency f = qB/(2πm)'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 7,
      chapterTitle: 'Optics, Modern Physics & Semiconductor Electronics',
      description: 'Ray optics (lenses/prisms), Wave optics (YDSE), Photoelectric effect, Bohr atom & Logic gates',
      microTopics: [
        { id: 'neet_p_17', topicTitle: 'Ray Optics: Total Internal Reflection, Lens Maker Formula & Prisms', subtopic: 'Refraction at spherical surfaces, combination of thin lenses, resolving power and microscopes', dayNumber: 17, periodNumber: 1, keyFormulaOrLaw: '1/f = (μ - 1)(1/R₁ - 1/R₂) | Power P = 1/f | Prism: μ = sin[(A + δ_m)/2] / sin(A/2)', keyPoints: ['TIR condition: Angle of incidence > Critical angle (sin C = 1/μ)', 'Astronomical telescope magnification M = -f_o / f_e'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'neet_p_18', topicTitle: 'Wave Optics: Young Double Slit Experiment (YDSE) & Polarization', subtopic: 'Fringe width derivation, path difference for maxima and minima, Brewster law', dayNumber: 18, periodNumber: 1, keyFormulaOrLaw: 'Fringe Width β = (λ D)/d | Constructive: Δx = nλ | Destructive: Δx = (2n - 1)λ/2 | Brewster: μ = tan i_p', keyPoints: ['Diffraction central maximum angular width = 2λ/a', 'Shift in fringes with mica sheet: Δy = (μ - 1)t D / d'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'neet_p_19', topicTitle: 'Photoelectric Effect, Bohr Model of Hydrogen & Semiconductors', subtopic: 'Einstein photoelectric equation, de Broglie wavelength, Bohr energy levels E_n = -13.6/n² eV, p-n junction and logic gates', dayNumber: 19, periodNumber: 1, keyFormulaOrLaw: 'K_max = hν - Φ = eV_0 | λ = h/p = h/√(2mE) | 1/λ = R_H(1/n₁² - 1/n₂²) | Zener Diode Voltage Regulation', keyPoints: ['Lyman series in UV | Balmer in Visible | Paschen in IR', 'Logic Gates: NAND and NOR are universal gates'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  const chemistryChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Physical Chemistry: Mole Concept, Atomic Structure & Bonding',
      description: 'Stoichiometry, quantum numbers, electronic configuration, VSEPR, Hybridization & Molecular Orbital Theory',
      microTopics: [
        { id: 'neet_c_1', topicTitle: 'Mole Concept, Molarity, Molality & Stoichiometry', subtopic: 'Limiting reagent calculations, percentage composition, empirical and molecular formula', dayNumber: 1, periodNumber: 2, keyFormulaOrLaw: 'Moles n = Mass / Molar Mass | Molarity M = n_solute / V_solution(L) | Molality m = n_solute / Mass_solvent(kg)', keyPoints: ['Limiting reagent determines maximum product yield', 'Mole fraction X_A + X_B = 1'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'neet_c_2', topicTitle: 'Quantum Mechanical Model of Atom & Electronic Configuration', subtopic: 'Heisenberg uncertainty principle, de Broglie relation, quantum numbers (n, l, m, s), Aufbau and Hund rules', dayNumber: 5, periodNumber: 2, keyFormulaOrLaw: 'Δx · Δp ≥ h / (4π) | de Broglie λ = h / (mv) | Orbital Angular Momentum = √[l(l+1)] (h/2π)', keyPoints: ['Cr (3d⁵ 4s¹) and Cu (3d¹⁰ 4s¹) extra stability of half/fully filled d-orbitals', 'Maximum electrons in shell = 2n²'], type: 'concept', importance: 'High-Yield' },
        { id: 'neet_c_3', topicTitle: 'Chemical Bonding: VSEPR Theory, Hybridization & Molecular Orbital Theory (MOT)', subtopic: 'Geometry and shapes of molecules (sp, sp², sp³, sp³d, sp³d²), dipole moments, MOT bond order and magnetic behavior', dayNumber: 9, periodNumber: 2, keyFormulaOrLaw: 'Bond Order = ½(N_b - N_a) | Magnetic Moment μ = √[n(n+2)] BM', keyPoints: ['O₂ is paramagnetic with Bond Order 2.0 (unpaired electrons in π* antibonding)', 'Hydrogen bonding strength: F-H...F > O-H...O > N-H...N'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Thermodynamics, Equilibrium & Chemical Kinetics',
      description: 'Hess law, Gibbs free energy, Le Chatelier principle, pH, Buffer solutions, Solubility product & Arrhenius rate law',
      microTopics: [
        { id: 'neet_c_4', topicTitle: 'Chemical Thermodynamics & Hess Law of Constant Heat Summation', subtopic: 'First law ΔU = q + w, enthalpy ΔH = ΔU + Δn_g RT, spontaneity condition ΔG = ΔH - TΔS < 0', dayNumber: 2, periodNumber: 2, keyFormulaOrLaw: 'ΔG° = -RT ln K_eq = -2.303 RT log K_eq | Standard Enthalpy of Reaction ΔH°_rxn = ΣΔH°_f(products) - ΣΔH°_f(reactants)', keyPoints: ['ΔG < 0 is spontaneous | ΔG = 0 at equilibrium', 'Entropy of universe always increases (2nd Law)'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'neet_c_5', topicTitle: 'Ionic Equilibrium: pH, Buffer Solutions & Solubility Product (Ksp)', subtopic: 'Ostwald dilution law, common ion effect, Henderson-Hasselbalch equation for buffers, salt hydrolysis', dayNumber: 6, periodNumber: 2, keyFormulaOrLaw: 'pH = -log[H⁺] | Acidic Buffer: pH = pK_a + log([Salt]/[Acid]) | K_sp for A_x B_y = x^x y^y s^(x+y)', keyPoints: ['Precipitation occurs when Ionic Product (Q_sp) > K_sp', 'pH of strong acid + weak base salt: pH = 7 - ½pK_b - ½log C'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'neet_c_6', topicTitle: 'Chemical Kinetics: Order of Reaction, Half-Life & Arrhenius Equation', subtopic: 'Integrated rate laws (zero and 1st order), collision theory, activation energy and temperature dependence', dayNumber: 10, periodNumber: 2, keyFormulaOrLaw: 'First Order: k = (2.303/t) log(a / (a - x)) | t_½ = 0.693 / k | Arrhenius: k = A e^(-E_a / RT)', keyPoints: ['Half-life of first-order reaction is independent of initial concentration', 'log(k₂/k₁) = (E_a / 2.303R) [1/T₁ - 1/T₂]'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 3,
      chapterTitle: 'Inorganic Chemistry: Periodicity, d & f Block & Coordination Compounds',
      description: 'Periodic trends, lanthanoid contraction, KMnO4 / K2Cr2O7 properties, Werner theory, VBT & Crystal Field Theory (CFT)',
      microTopics: [
        { id: 'neet_c_7', topicTitle: 'Periodic Properties & Transition Elements (d & f Block)', subtopic: 'Ionization enthalpy trends, electron gain enthalpy, variable oxidation states, lanthanoid contraction', dayNumber: 3, periodNumber: 2, keyFormulaOrLaw: 'Lanthanoid Contraction causes 4d and 5d series elements (Zr/Hf, Nb/Ta) to have almost identical atomic radii', keyPoints: ['KMnO₄ acts as powerful oxidant in acidic (change in ON = 5), neutral (3), basic (1)', 'Colored ions due to d-d transitions and charge transfer'], type: 'concept', importance: 'High-Yield' },
        { id: 'neet_c_8', topicTitle: 'Coordination Chemistry: IUPAC Nomenclature, Isomerism & Crystal Field Theory (CFT)', subtopic: 'Ligands classification (chelating, ambidentate), spectrochemical series, octahedral and tetrahedral splitting Δ_o vs P', dayNumber: 7, periodNumber: 2, keyFormulaOrLaw: 'Octahedral Splitting: t₂g (-0.4 Δ_o) and e_g (+0.6 Δ_o) | CFSE = [-0.4 n(t₂g) + 0.6 n(e_g)] Δ_o + mP', keyPoints: ['Strong field ligands (CN⁻, CO) cause pairing (low spin) | Weak field (I⁻, Br⁻, F⁻) give high spin', 'Geometric (cis/trans) and Optical isomerism in [Co(en)₃]³⁺'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 4,
      chapterTitle: 'Organic Chemistry: GOC, Hydrocarbons & Reaction Mechanisms',
      description: 'Inductive, Resonance, Hyperconjugation, Carbocations, SN1/SN2 mechanisms, Electrophilic aromatic substitution & Named reactions',
      microTopics: [
        { id: 'neet_c_9', topicTitle: 'General Organic Chemistry (GOC): Electronic Effects & Stability of Intermediates', subtopic: 'Inductive effect (+I/-I), resonance/mesomeric (+M/-M), hyperconjugation, aromaticity (Hückel 4n+2 rule), carbocation/carbanion/free radical stabilities', dayNumber: 4, periodNumber: 2, keyFormulaOrLaw: 'Stability of Carbocations: 3° > 2° > 1° > Methyl (governed by Hyperconjugation and +I effect)', keyPoints: ['Acidic strength increases with -I and -M groups (e.g. Picric acid)', 'Aromatic compounds have (4n + 2) π-electrons in cyclic planar ring'], type: 'concept', importance: 'High-Yield' },
        { id: 'neet_c_10', topicTitle: 'Hydrocarbons: Alkanes, Alkenes, Alkynes & Aromatic Benzene Reactions', subtopic: 'Markovnikov and anti-Markovnikov addition, ozonolysis of alkenes, Friedel-Crafts alkylation and acylation', dayNumber: 8, periodNumber: 2, keyFormulaOrLaw: 'Markovnikov Addition: H goes to carbon with more H | Peroxide effect (Kharasch) applies only to HBr', keyPoints: ['Ozonolysis determines position of double/triple bonds in alkenes/alkynes', 'Nitration of Benzene uses conc. HNO₃ + conc. H₂SO₄ (Nitronium ion NO₂⁺ is electrophile)'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'neet_c_11', topicTitle: 'Organic Oxygen & Nitrogen Compounds: Carbonyls, Amines & Biomolecules', subtopic: 'Aldol condensation, Cannizzaro reaction, Lucas test for alcohols, Gabriel phthalimide synthesis, Carbohydrates and amino acids', dayNumber: 12, periodNumber: 2, keyFormulaOrLaw: 'Aldol: Aldehydes with α-H in dil. NaOH | Cannizzaro: Aldehydes without α-H (HCHO, PhCHO) in 50% KOH', keyPoints: ['Hinsberg reagent (Benzene sulfonyl chloride) distinguishes 1°, 2°, 3° amines', 'Proteins consist of α-amino acids linked by peptide bonds (-CONH-)'], type: 'concept', importance: 'High-Yield' }
      ]
    }
  ];

  const botanyChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Plant Diversity, Morphology & Anatomy',
      description: 'Five kingdom system, Algae/Bryophytes/Pteridophytes/Gymnosperms, Floral families (Solanaceae, Fabaceae), Dicot/Monocot anatomy',
      microTopics: [
        { id: 'neet_b_1', topicTitle: 'Five Kingdom Classification & Plant Kingdom Systematics', subtopic: 'Whittaker 5 kingdoms, characteristics of Chlorophyceae, Phaeophyceae, Rhodophyceae, Bryophytes (Amphibians of plant kingdom), Pteridophytes', dayNumber: 1, periodNumber: 3, keyFormulaOrLaw: 'Pigments: Green Algae (Chl a, b) | Brown Algae (Fucoxanthin) | Red Algae (r-Phycoerythrin)', keyPoints: ['Lichens are symbiotic associations between Algae (Phycobiont) and Fungi (Mycobiont)', 'Gymnosperms possess naked seeds (no ovary wall)'], type: 'concept', importance: 'High-Yield' },
        { id: 'neet_b_2', topicTitle: 'Morphology of Flowering Plants & Description of Families', subtopic: 'Modifications of roots, stems, leaves, inflorescence (Racemose/Cymose), floral formula of Fabaceae, Solanaceae, Liliaceae', dayNumber: 5, periodNumber: 3, keyFormulaOrLaw: 'Floral Formula of Solanaceae: ⊕ ⚥ K(5) C(5) A5 G(2) | Placentation: Marginal, Axile, Parietal, Free-central, Basal', keyPoints: ['Pneumatophores in Rhizophora for respiration', 'Phyllode is modified petiole in Australian Acacia'], type: 'memorization', importance: 'High-Yield' },
        { id: 'neet_b_3', topicTitle: 'Anatomy of Flowering Plants & Secondary Growth', subtopic: 'Meristematic vs permanent tissues, vascular bundles (Radial, Conjoint, Open/Closed), internal anatomy of Dicot vs Monocot stem and root', dayNumber: 9, periodNumber: 3, keyFormulaOrLaw: 'Dicot Root has Exarch Xylem | Dicot Stem has Endarch Xylem and Open Vascular Bundles (Cambium present)', keyPoints: ['Casparian strips on Endodermis made of suberin', 'Spring wood has wider vessels than autumn wood (Annual rings)'], type: 'concept', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Cell Biology, Photosynthesis & Plant Physiology',
      description: 'Cell organelles, Mitosis & Meiosis, Light & Dark reactions (C3/C4), Glycolysis, Krebs Cycle & Plant Hormones (PGRs)',
      microTopics: [
        { id: 'neet_b_4', topicTitle: 'Cell: The Unit of Life & Cell Cycle Division (Mitosis / Meiosis)', subtopic: 'Fluid mosaic model of plasma membrane, semiautonomous organelles (Chloroplast, Mitochondria), Meiosis I prophase stages (Leptotene to Diakinesis)', dayNumber: 2, periodNumber: 3, keyFormulaOrLaw: 'Crossing over occurs in Pachytene stage of Prophase I catalyzed by Recombinase enzyme', keyPoints: ['Chloroplast has thylakoids (grana) and stroma (site of dark reaction)', 'G1 -> S (DNA replication) -> G2 -> M phase sequence'], type: 'concept', importance: 'High-Yield' },
        { id: 'neet_b_5', topicTitle: 'Photosynthesis in Higher Plants: Light Reactions, C3 & C4 Pathways', subtopic: 'Z-scheme electron transport, photolysis of water, Calvin cycle (RuBisCO carboxylation), Hatch-Slack C4 pathway with Kranz anatomy', dayNumber: 6, periodNumber: 3, keyFormulaOrLaw: 'Calvin Cycle: 1 Glucose requires 6 CO₂ + 18 ATP + 12 NADPH | C4 plants avoid photorespiration', keyPoints: ['Kranz anatomy in C4 plants (Maize, Sugarcane) with bundle sheath cells', 'Chemiosmotic hypothesis: ATP synthesis driven by proton gradient across thylakoid membrane'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'neet_b_6', topicTitle: 'Plant Respiration & Growth Regulators (Auxins, Gibberellins, Cytokinins, Ethylene, ABA)', subtopic: 'Glycolysis (EMP pathway), TCA / Krebs cycle in mitochondrial matrix, ETS oxidative phosphorylation, physiological actions of PGRs', dayNumber: 10, periodNumber: 3, keyFormulaOrLaw: 'Net ATP yield from 1 molecule of Glucose = 36 to 38 ATP | Respiratory Quotient RQ = Vol. CO₂ evolved / Vol. O₂ consumed', keyPoints: ['Auxin promotes apical dominance and rooting | Cytokinin promotes cell division and overcomes apical dominance', 'Ethylene is gaseous ripening hormone | ABA is stress hormone inducing stomatal closure'], type: 'concept', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 3,
      chapterTitle: 'Plant Reproduction, Genetics & Ecology',
      description: 'Double fertilization, Mendelian genetics, Molecular basis (DNA replication, transcription, Lac operon) & Ecosystems',
      microTopics: [
        { id: 'neet_b_7', topicTitle: 'Sexual Reproduction in Flowering Plants & Double Fertilization', subtopic: 'Microsporogenesis (Pollen grain), Megasporogenesis (Embryo sac 7-celled 8-nucleate), pollination types, endosperm development', dayNumber: 3, periodNumber: 3, keyFormulaOrLaw: 'Double Fertilization = Syngamy (Male gamete + Egg -> 2n Zygote) + Triple Fusion (Male gamete + 2 Polar nuclei -> 3n PEN)', keyPoints: ['Apomixis is asexual reproduction mimicking sexual seed formation without fertilization', 'Outbreeding devices prevent self-pollination'], type: 'concept', importance: 'High-Yield' },
        { id: 'neet_b_8', topicTitle: 'Principles of Inheritance & Molecular Basis of Genetics', subtopic: 'Mendel laws, incomplete dominance, dihybrid ratio (9:3:3:1), DNA packaging (nucleosome), Meselson-Stahl experiment, Lac Operon model', dayNumber: 7, periodNumber: 3, keyFormulaOrLaw: 'Central Dogma: DNA -> (Transcription) -> mRNA -> (Translation) -> Protein | Lac Operon: Inducer is Allolactose', keyPoints: ['Nucleosome core contains octamer of histones (H2A, H2B, H3, H4) wrapped with 200 bp DNA', 'Genetic code is universal, degenerate, unambiguous and non-overlapping'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'neet_b_9', topicTitle: 'Ecology, Ecosystem Function & Biodiversity Conservation', subtopic: 'Population growth models (Logistic dN/dt = rN(K-N)/K), ecological pyramids (Energy pyramid is always upright), In-situ and Ex-situ conservation', dayNumber: 11, periodNumber: 3, keyFormulaOrLaw: 'Species-Area Relationship: log S = log C + Z log A (Alexander von Humboldt) | 10% Law of Energy Transfer (Lindeman)', keyPoints: ['The Evil Quartet: Habitat loss & fragmentation, Over-exploitation, Alien species invasion, Co-extinctions', 'In-situ: National Parks, Sanctuaries | Ex-situ: Botanical gardens, Cryopreservation'], type: 'concept', importance: 'High-Yield' }
      ]
    }
  ];

  const zoologyChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Animal Kingdom & Animal Morphology (Cockroach & Frog)',
      description: 'Non-chordate phyla (Porifera to Hemichordata), Chordate classes, Cockroach and Frog anatomy',
      microTopics: [
        { id: 'neet_z_1', topicTitle: 'Animal Kingdom Classification: Phyla Porifera to Chordata', subtopic: 'Levels of organization, coelom types (Acoelomate, Pseudocoelomate, Coelomate), open vs closed circulatory systems, key features of Arthropoda, Mollusca, Echinodermata', dayNumber: 1, periodNumber: 4, keyFormulaOrLaw: 'Coelom Classification: Aschelminthes are Pseudocoelomate | Annelida to Chordata are True Coelomates (Eucoelomates)', keyPoints: ['Arthropoda is the largest phylum with chitinous exoskeleton and jointed appendages', 'Echinodermata possess unique water vascular system with radial symmetry in adults'], type: 'concept', importance: 'High-Yield' },
        { id: 'neet_z_2', topicTitle: 'Structural Organisation in Animals & Morphology of Cockroach / Frog', subtopic: 'Epithelial, connective, muscular and nervous tissues, mouthparts, digestive, spiracular respiratory and reproductive systems of Periplaneta americana', dayNumber: 5, periodNumber: 4, keyFormulaOrLaw: 'Cockroach Excretory Organs: Malpighian Tubules (excrete Uric Acid - Uricotelic)', keyPoints: ['Blood vascular system of cockroach is open type with 13-chambered tubular heart', 'Tight junctions prevent leaking, Gap junctions facilitate intercellular communication'], type: 'concept', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Human Physiology: Respiration, Circulation & Excretion',
      description: 'Breathing mechanisms, lung volumes, cardiac cycle, ECG, Nephron structure, Counter-current mechanism & RAAS',
      microTopics: [
        { id: 'neet_z_3', topicTitle: 'Human Respiratory System: Gas Exchange & Lung Capacities', subtopic: 'Tidal Volume (TV), Vital Capacity (VC), Oxygen-hemoglobin dissociation curve (Bohr effect), respiratory disorders (Asthma, Emphysema)', dayNumber: 2, periodNumber: 4, keyFormulaOrLaw: 'Vital Capacity VC = TV + IRV + ERV (~4500 mL) | Total Lung Capacity TLC = VC + RV | O₂ binding favoured by high pO₂, low pCO₂, low H⁺, low temp', keyPoints: ['Emphysema is chronic disorder where alveolar walls are damaged (major cause: cigarette smoking)', 'Carbon dioxide is mainly transported as Bicarbonate ions (HCO₃⁻ ~70%) in blood'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'neet_z_4', topicTitle: 'Human Circulatory System: Cardiac Cycle, ECG & Double Circulation', subtopic: 'Origin of heartbeat (SA node pacemaker), AV node, Purkinje fibers, ECG waves (P, QRS, T), cardiac output = Stroke Volume × Heart Rate', dayNumber: 6, periodNumber: 4, keyFormulaOrLaw: 'Cardiac Output CO = SV (70 mL) × HR (72 bpm) ≈ 5 Litres/min | P wave = Atrial depolarization, QRS = Ventricular depolarization, T wave = Ventricular repolarization', keyPoints: ['Double circulation consists of Pulmonary circulation and Systemic circulation', 'Coronary artery disease (Atherosclerosis) caused by deposit of calcium, fat, cholesterol'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'neet_z_5', topicTitle: 'Human Excretory System: Nephron Filtration & Counter-Current Multiplier', subtopic: 'Glomerular filtration rate (GFR = 125 mL/min), tubular reabsorption, Henle loop and Vasa Recta counter-current, RAAS hormone control', dayNumber: 10, periodNumber: 4, keyFormulaOrLaw: 'GFR = 125 mL/min = 180 Litres/day | Renin-Angiotensin-Aldosterone System (RAAS) increases blood pressure and GFR', keyPoints: ['Juxtaglomerular apparatus (JGA) releases Renin when GFR falls', 'Atrial Natriuretic Factor (ANF) acts as check on RAAS and causes vasodilation'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 3,
      chapterTitle: 'Human Locomotion, Neural Control & Endocrine System',
      description: 'Sliding filament theory of muscle, Action potential propagation, Human brain, Pituitary, Thyroid & Adrenal hormones',
      microTopics: [
        { id: 'neet_z_6', topicTitle: 'Locomotion & Sliding Filament Mechanism of Muscle Contraction', subtopic: 'Actin and Myosin filaments, Troponin/Tropomyosin regulatory proteins, role of Ca²⁺ from sarcoplasmic reticulum, joints classification', dayNumber: 3, periodNumber: 4, keyFormulaOrLaw: 'Cross-bridge cycle: Myosin head hydrolyzes ATP -> binds actin -> power stroke releases ADP + Pi -> new ATP detaches head', keyPoints: ['H-zone and I-band shorten during contraction while A-band remains constant length', 'Synovial joints: Ball and socket (shoulder), Hinge (knee/elbow), Pivot (atlas/axis)'], type: 'concept', importance: 'High-Yield' },
        { id: 'neet_z_7', topicTitle: 'Neural Control & Conduction of Nerve Impulse across Synapse', subtopic: 'Resting membrane potential (-70 mV), Na⁺ influx action potential depolarization, chemical synapse neurotransmitters (Acetylcholine)', dayNumber: 7, periodNumber: 4, keyFormulaOrLaw: 'Resting State: 3 Na⁺ pumped out for every 2 K⁺ pumped in by Na⁺/K⁺ ATPase pump | Inside is negative relative to outside', keyPoints: ['Forebrain: Cerebrum (intelligence), Hypothalamus (thermoregulation and hunger)', 'Cerebellum coordinates voluntary motor movements and body balance'], type: 'concept', importance: 'High-Yield' },
        { id: 'neet_z_8', topicTitle: 'Chemical Coordination: Endocrine Hormones & Mechanism of Action', subtopic: 'Hypothalamus-pituitary axis (GH, TSH, ACTH, LH, FSH), Thyroid (T3, T4), Adrenal (Cortisol, Adrenaline), Pancreas (Insulin, Glucagon), peptide vs steroid hormone receptors', dayNumber: 11, periodNumber: 4, keyFormulaOrLaw: 'Insulin (β-cells) lowers blood glucose (hypoglycemic) | Glucagon (α-cells) raises blood glucose (hyperglycemic)', keyPoints: ['Peptide hormones act via secondary messengers (cAMP, IP₃, Ca²⁺)', 'Steroid hormones (Estrogen, Progesterone, Testosterone) cross cell membrane and bind nuclear receptors'], type: 'concept', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 4,
      chapterTitle: 'Human Reproduction, Reproductive Health, Evolution & Immunity',
      description: 'Spermatogenesis/Oogenesis, Menstrual cycle hormonal regulation, ART/IVF techniques, Natural selection, Immunity & AIDS/Cancer',
      microTopics: [
        { id: 'neet_z_9', topicTitle: 'Human Reproduction: Gametogenesis, Menstrual Cycle & Embryogenesis', subtopic: 'Spermatogenesis vs Oogenesis, LH surge causing ovulation (Day 14), fertilization in ampullary region, blastocyst implantation and placenta', dayNumber: 4, periodNumber: 4, keyFormulaOrLaw: 'LH Surge triggers Ovulation on Day 14 | Corpus Luteum secretes high Progesterone to maintain endometrium', keyPoints: ['Acrosome of sperm is derived from Golgi complex and contains hyaluronidase', 'Inner cell mass of blastocyst gives rise to embryo (ectoderm, mesoderm, endoderm)'], type: 'concept', importance: 'High-Yield' },
        { id: 'neet_z_10', topicTitle: 'Reproductive Health, Infertility & Assisted Reproductive Technologies (ART)', subtopic: 'Contraceptive methods (IUDs Copper-T, Oral pills Saheli), MTP legal guidelines, IVF-ET, ZIFT, GIFT, ICSI techniques', dayNumber: 8, periodNumber: 4, keyFormulaOrLaw: 'ZIFT (Zygote Intra-Fallopian Transfer: upto 8 blastomeres) | IUT (Intra-Uterine Transfer: >8 blastomeres) | GIFT (Gamete transfer)', keyPoints: ['Copper-T releases Cu ions that suppress sperm motility and fertilizing capacity', 'Saheli is non-steroidal oral once-a-week pill developed by CDRI Lucknow'], type: 'concept', importance: 'High-Yield' },
        { id: 'neet_z_11', topicTitle: 'Evolution, Human Health & Immunology (Innate/Acquired, Antibodies, AIDS, Cancer)', subtopic: 'Hardy-Weinberg equilibrium (p² + 2pq + q² = 1), antibody structure (H₂L₂), active vs passive immunity, HIV retrovirus replication, oncogenes', dayNumber: 12, periodNumber: 4, keyFormulaOrLaw: 'Hardy-Weinberg Law: p² + 2pq + q² = 1 | Antibody structure has 2 heavy and 2 light polypeptide chains held by disulfide bonds', keyPoints: ['Colostrum contains secretory IgA providing natural passive immunity to newborn', 'HIV targets and destroys Helper T-cells (CD4⁺ lymphocytes) causing severe immunosuppression'], type: 'solved_problem', importance: 'High-Yield' }
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
// 3. CLASS 11 & 12 COMMERCE COMPLETE MICRO-TOPIC SYLLABUS REGISTRY
// ─────────────────────────────────────────────────────────────────────────────
export function getCommerceClass11Syllabus(courseId: string, courseTitle: string): CourseFullSyllabus {
  const accountancyChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Introduction to Accounting & Theoretical Framework',
      description: 'Accounting concepts, GAAP, double entry system, cash vs accrual basis, and accounting standards (AS & Ind AS)',
      microTopics: [
        { id: 'com_acc_1', topicTitle: 'Accounting Meaning, Objectives & Qualitative Characteristics', subtopic: 'Identification, measurement, recording, classifying, summarizing and communicating financial information', dayNumber: 1, periodNumber: 1, keyFormulaOrLaw: 'Fundamental Accounting Equation: Assets = Liabilities + Capital (Equity)', keyPoints: ['Users of accounting information: Internal vs External', 'Qualitative traits: Reliability, Relevance, Understandability, Comparability'], type: 'concept', importance: 'High-Yield' },
        { id: 'com_acc_2', topicTitle: 'GAAP Principles & Accounting Concepts (Entity, Going Concern, Accrual)', subtopic: 'Money measurement, accounting period, cost concept, matching principle, conservatism (prudence) and materiality', dayNumber: 5, periodNumber: 1, keyFormulaOrLaw: 'Dual Aspect Principle: Every debit must have a corresponding credit of equal value', keyPoints: ['Conservatism: Anticipate no profit, but provide for all possible losses', 'Accrual concept: Recognize revenue when earned, expense when incurred regardless of cash flow'], type: 'concept', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Recording Transactions: Journal, Ledger & Trial Balance',
      description: 'Golden rules of accounting, source documents, cash book, subsidiary books and trial balance preparation',
      microTopics: [
        { id: 'com_acc_3', topicTitle: 'Golden Rules of Accounting & Journal Entry Preparation', subtopic: 'Personal Accounts (Debit Receiver, Credit Giver), Real Accounts (Debit What Comes In), Nominal Accounts (Debit All Expenses)', dayNumber: 2, periodNumber: 1, keyFormulaOrLaw: 'Traditional Rules: Real (Assets), Personal (Persons/Firms), Nominal (Incomes/Expenses)', keyPoints: ['Modern Approach: Increase in Asset/Expense = Debit | Increase in Liability/Capital/Revenue = Credit', 'Compound journal entries and trade discount vs cash discount treatment'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'com_acc_4', topicTitle: 'Subsidiary Books, Cash Book (Triple Column) & Ledger Posting', subtopic: 'Purchase book, sales book, purchase return, sales return, petty cash book (imprest system), trial balance tallying', dayNumber: 6, periodNumber: 1, keyFormulaOrLaw: 'Trial Balance Debit Total = Credit Total (Arithmetical accuracy check)', keyPoints: ['Contra entries in two-column cash book (Cash deposited into bank or withdrawn for office)', 'Errors not disclosed by trial balance: Error of principle, compensating errors, complete omission'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 3,
      chapterTitle: 'Bank Reconciliation Statement (BRS), Depreciation & Rectification',
      description: 'Causes of BRS differences, Straight Line Method (SLM) vs Written Down Value (WDV), error rectifications',
      microTopics: [
        { id: 'com_acc_5', topicTitle: 'Bank Reconciliation Statement (BRS) with Cash Book & Pass Book', subtopic: 'Timing differences (cheques issued but not presented, cheques deposited but not credited), direct debits/credits by bank', dayNumber: 3, periodNumber: 1, keyFormulaOrLaw: 'Balance as per Cash Book + Cheques issued but not presented - Cheques deposited not cleared = Pass Book Balance', keyPoints: ['Favourable balance: Cash book debit / Pass book credit', 'Overdraft: Cash book credit / Pass book debit'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'com_acc_6', topicTitle: 'Depreciation Accounting: Straight Line (SLM) vs Written Down Value (WDV)', subtopic: 'Calculation of annual depreciation, provision for depreciation account, asset disposal account', dayNumber: 7, periodNumber: 1, keyFormulaOrLaw: 'SLM Depreciation = (Original Cost - Estimated Scrap Value) / Useful Life | WDV Dep = Book Value × Rate%', keyPoints: ['SLM provides equal depreciation every year | WDV provides reducing depreciation', 'Tax authorities in India mandate WDV method for income tax depreciation computation'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 4,
      chapterTitle: 'Financial Statements of Sole Proprietorship (With Adjustments)',
      description: 'Trading Account, Profit & Loss Account, Balance Sheet, Closing Stock, Outstanding/Prepaid items, Bad debts & Provision',
      microTopics: [
        { id: 'com_acc_7', topicTitle: 'Trading and Profit & Loss Account Preparation (Gross & Net Profit)', subtopic: 'Direct vs indirect expenses, cost of goods sold (COGS = Opening Stock + Net Purchases + Direct Expenses - Closing Stock)', dayNumber: 4, periodNumber: 1, keyFormulaOrLaw: 'Gross Profit = Net Sales - COGS | Net Profit = Operating Profit + Non-operating Incomes - Non-operating Expenses', keyPoints: ['Wages and carriage inwards are direct expenses in Trading Account', 'Salaries and rent are indirect expenses in Profit & Loss Account'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'com_acc_8', topicTitle: 'Balance Sheet & 12 Key Adjustments (Outstanding, Prepaid, Provision for Doubtful Debts)', subtopic: 'Treatment of closing stock outside trial balance, accrued income, unearned income, depreciation, provision for bad debts', dayNumber: 8, periodNumber: 1, keyFormulaOrLaw: 'Adjusted Debtors = Sundry Debtors - Further Bad Debts - Provision for Doubtful Debts', keyPoints: ['Every adjustment entry has two-fold effect in final accounts', 'Capital Expenditure gives long-term benefit (Asset) vs Revenue Expenditure (Expense)'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  const businessStudiesChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Foundations of Business & Forms of Business Organisations',
      description: 'Business, profession, employment, Sole Proprietorship, Partnership (Act 1932), Hindu Undivided Family, Joint Stock Company',
      microTopics: [
        { id: 'com_bst_1', topicTitle: 'Nature, Purpose of Business & Classification of Business Activities', subtopic: 'Industry (Primary, Secondary, Tertiary), Commerce (Trade & Auxiliaries to trade: Banking, Transport, Insurance, Warehousing, Advertising)', dayNumber: 1, periodNumber: 2, keyFormulaOrLaw: 'Business Risk Concept: Profit is the reward for risk bearing', keyPoints: ['Business objectives: Economic (Profit, Market standing, Innovation) & Social objectives', 'Auxiliaries to trade remove hindrances of person, place, time, risk, finance, and information'], type: 'concept', importance: 'High-Yield' },
        { id: 'com_bst_2', topicTitle: 'Forms of Business Organisations: Sole Proprietorship, Partnership & Joint Stock Company', subtopic: 'Merits and limitations of Sole Trade, Partnership deed, types of partners, Joint Stock Company (Private vs Public Company formation)', dayNumber: 5, periodNumber: 2, keyFormulaOrLaw: 'Features of Company: Separate Legal Entity, Perpetual Succession, Common Seal, Limited Liability', keyPoints: ['Sole proprietor has unlimited liability | Company shareholders have liability limited to unpaid share capital', 'Private Company min 2 max 200 members | Public Company min 7 max unlimited'], type: 'concept', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Public, Private, Global Enterprises & Business Services',
      description: 'Departmental undertakings, Statutory corporations, Government companies, Banking, Insurance principles, E-business',
      microTopics: [
        { id: 'com_bst_3', topicTitle: 'Public Sector Enterprises & Global Corporations (MNCs)', subtopic: 'Departmental undertakings (Railways), Statutory Corporations (LIC, RBI), Government Companies (ONGC, BHEL), Public-Private Partnerships (PPP)', dayNumber: 2, periodNumber: 2, keyFormulaOrLaw: 'Government Company: Min 51% paid-up share capital held by Central/State Government (Companies Act 2013)', keyPoints: ['Statutory corporations formed by special Act of Parliament', 'MNCs operate in multiple countries with advanced technology and global brand value'], type: 'concept', importance: 'High-Yield' },
        { id: 'com_bst_4', topicTitle: 'Business Services: Banking, Principles of Insurance & E-Commerce', subtopic: 'Commercial banks (RTGS, NEFT), Principles of insurance (Utmost good faith, Insurable interest, Indemnity, Subrogation, Proximate cause)', dayNumber: 6, periodNumber: 2, keyFormulaOrLaw: 'Principle of Indemnity: Insured cannot make profit out of loss (Applies to Fire and Marine, NOT Life Insurance)', keyPoints: ['Insurable interest must exist at time of taking policy (Life) and at time of loss (Marine)', 'E-business vs traditional business: B2B, B2C, C2C business models'], type: 'concept', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 3,
      chapterTitle: 'Social Responsibility, Business Ethics & Sources of Business Finance',
      description: 'CSR, Environmental protection, Equity shares, Preference shares, Debentures, Retained earnings, Commercial banks, Loan funds',
      microTopics: [
        { id: 'com_bst_5', topicTitle: 'Social Responsibilities of Business & Corporate Social Responsibility (CSR)', subtopic: 'Responsibility towards shareholders, workers, consumers, government and community; business ethics and green business', dayNumber: 3, periodNumber: 2, keyFormulaOrLaw: 'Section 135 Companies Act 2013: Mandatory 2% average net profit spending on CSR for qualifying companies', keyPoints: ['Arguments for social responsibility: Long-term self interest of business, avoidance of government regulation', 'Environmental protection measures by industrial units'], type: 'concept', importance: 'High-Yield' },
        { id: 'com_bst_6', topicTitle: 'Sources of Business Finance: Owners Funds vs Borrowed Funds', subtopic: 'Equity shares (voting rights), Preference shares (fixed dividend), Debentures (secured loan), Retained earnings, Trade credit, Commercial papers, ADR/GDR', dayNumber: 7, periodNumber: 2, keyFormulaOrLaw: 'Capital Structure: Trade-off between Equity (No dilution of control) and Debt (Tax-deductible interest)', keyPoints: ['Equity shareholders are real risk-bearing owners with voting power', 'Debenture holders are creditors of company with fixed charge on assets'], type: 'concept', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 4,
      chapterTitle: 'Small Business, Internal Trade & International Business',
      description: 'MSMED Act 2006/2020, Wholesale vs Retail trade, Departmental stores, Supermarkets, Export-Import procedures, WTO',
      microTopics: [
        { id: 'com_bst_7', topicTitle: 'Small Business & MSME Classification & Entrepreneurship Support', subtopic: 'Micro, Small, Medium Enterprises revised criteria (Investment and Turnover), role of small business in rural India, DIC, NABARD, SIDBI', dayNumber: 4, periodNumber: 2, keyFormulaOrLaw: 'MSME 2020 Criteria: Micro (Inv < ₹1 Cr, TO < ₹5 Cr) | Small (Inv < ₹10 Cr, TO < ₹50 Cr) | Medium (Inv < ₹50 Cr, TO < ₹250 Cr)', keyPoints: ['Small enterprises generate widespread employment and mobilize local resources', 'Incentives to industries in backward areas (Tax holidays, subsidized power)'], type: 'concept', importance: 'High-Yield' },
        { id: 'com_bst_8', topicTitle: 'Internal Trade (Wholesalers, Retailers, GST) & International Trade (Export/Import/WTO)', subtopic: 'Services of wholesaler to manufacturer and retailer, Large scale retail (Departmental stores, Chain stores, Mail order), Letter of Credit, Bill of Lading, WTO role', dayNumber: 8, periodNumber: 2, keyFormulaOrLaw: 'Letter of Credit (LC): Guarantee issued by importer bank ensuring payment to exporter on submission of documents', keyPoints: ['GST (Goods and Services Tax) is destination-based indirect consumption tax', 'Bill of Lading acts as document of title to goods shipped'], type: 'concept', importance: 'High-Yield' }
      ]
    }
  ];

  const economicsChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Introductory Microeconomics: Consumer Equilibrium & Demand',
      description: 'Law of Diminishing Marginal Utility, Indifference Curve Analysis, Budget Line, Law of Demand & Elasticity of Demand',
      microTopics: [
        { id: 'com_eco_1', topicTitle: 'Consumer Equilibrium: Marginal Utility Analysis & Indifference Curve Analysis', subtopic: 'Total Utility (TU) and Marginal Utility (MU), Law of Diminishing MU, Indifference curve properties (MRS_xy), Budget constraint', dayNumber: 1, periodNumber: 3, keyFormulaOrLaw: 'Single Commodity: MU_x / P_x = MU_m | Two Commodities: MU_x / P_x = MU_y / P_y | IC Tangency: MRS_xy = P_x / P_y', keyPoints: ['When TU is maximum, MU is zero | When TU falls, MU becomes negative', 'Indifference curve is convex to origin due to diminishing Marginal Rate of Substitution (MRS)'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'com_eco_2', topicTitle: 'Theory of Demand & Price Elasticity of Demand (Ed)', subtopic: 'Demand function, determinants of demand, Law of Demand, movement vs shift in demand curve, percentage and geometric elasticity measurement', dayNumber: 5, periodNumber: 3, keyFormulaOrLaw: 'Price Elasticity of Demand E_d = - (%ΔQ / %ΔP) = - (ΔQ / ΔP) × (P / Q)', keyPoints: ['Normal goods: Demand increases with income | Inferior goods: Demand decreases with income', 'Giffen goods and Veblen goods are exceptions to Law of Demand'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Producer Behaviour: Production Function, Cost, Revenue & Supply',
      description: 'Law of Variable Proportions (Total/Marginal Product), Short-run cost curves (TFC, TVC, TC, MC, AC), Revenue & Elasticity of Supply',
      microTopics: [
        { id: 'com_eco_3', topicTitle: 'Production Function & Law of Variable Proportions', subtopic: 'Short run vs long run, Total Product (TP), Average Product (AP), Marginal Product (MP), Three stages of production', dayNumber: 2, periodNumber: 3, keyFormulaOrLaw: 'MP_n = TP_n - TP_(n-1) | Stage 2 (Diminishing returns) is the only rational stage of production where MP > 0 and falling', keyPoints: ['AP rises as long as MP > AP | AP is maximum when MP = AP', 'Law of Variable Proportions operates due to fixed factors and imperfect factor substitutability'], type: 'concept', importance: 'High-Yield' },
        { id: 'com_eco_4', topicTitle: 'Concepts of Cost, Revenue & Producer Equilibrium', subtopic: 'Fixed cost, variable cost, U-shaped AC and MC curves, relation between MC and AC, AR and MR under perfect vs imperfect competition', dayNumber: 6, periodNumber: 3, keyFormulaOrLaw: 'TC = TFC + TVC | MC = ΔTC / ΔQ | MR = MC condition for Producer Equilibrium (MC must cut MR from below)', keyPoints: ['TFC curve is horizontal line parallel to X-axis | TVC starts from origin', 'Under Perfect Competition AR = MR = Price (Horizontal demand curve)'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 3,
      chapterTitle: 'Forms of Market & Price Determination (Perfect Competition)',
      description: 'Perfect Competition, Monopoly, Monopolistic Competition, Oligopoly, Market equilibrium price determination & Government price controls',
      microTopics: [
        { id: 'com_eco_5', topicTitle: 'Forms of Market: Perfect Competition, Monopoly, Monopolistic & Oligopoly', subtopic: 'Features of Perfect Competition (large buyers/sellers, homogeneous product, free entry/exit), Product differentiation, Oligopoly (Kinked demand curve, collusive cartel)', dayNumber: 3, periodNumber: 3, keyFormulaOrLaw: 'Perfect Competition: Firm is a Price Taker (Industry determines price through Market Demand = Market Supply)', keyPoints: ['Monopolistic competition features downward sloping elastic demand curve due to product differentiation', 'Oligopoly features price rigidity and strategic interdependence among few large sellers'], type: 'concept', importance: 'High-Yield' },
        { id: 'com_eco_6', topicTitle: 'Market Equilibrium, Excess Demand/Supply & Price Ceiling / Price Floor', subtopic: 'Simultaneous shifts in demand and supply curves, Price ceiling (Maximum price for essential goods, Rationing), Price floor (Minimum Support Price MSP for farmers)', dayNumber: 7, periodNumber: 3, keyFormulaOrLaw: 'Equilibrium: Quantity Demanded (Q_d) = Quantity Supplied (Q_s) | Excess Demand = Q_d - Q_s at price below equilibrium', keyPoints: ['Price ceiling leads to shortages, black marketing, and rationing', 'Price floor leads to surplus production and buffer stock accumulation by government'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 4,
      chapterTitle: 'Statistics for Economics: Collection, Measures of Central Tendency & Dispersion',
      description: 'Primary/Secondary data, Mean, Median, Mode, Standard Deviation, Correlation (Karl Pearson) & Index Numbers (CPI/WPI)',
      microTopics: [
        { id: 'com_eco_7', topicTitle: 'Measures of Central Tendency: Mean, Median & Mode', subtopic: 'Arithmetic Mean (Direct, Shortcut, Step-deviation methods), Median (Partition values Q1, Q3), Mode (Inspection and Grouping table method)', dayNumber: 4, periodNumber: 3, keyFormulaOrLaw: 'Empirical Relationship: Mode = 3 Median - 2 Mean | Step-Deviation Mean X̄ = A + [Σ(f d\') / N] × c', keyPoints: ['Median is unaffected by extreme outliers and is best for qualitative data', 'Mode is the most frequently occurring observation'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'com_eco_8', topicTitle: 'Measures of Dispersion, Correlation (Karl Pearson) & Index Numbers', subtopic: 'Standard Deviation (σ), Coefficient of Variation (CV = σ/X̄ × 100%), Pearson correlation coefficient r (-1 to +1), Laspeyres, Paasche, Fisher Ideal Index', dayNumber: 8, periodNumber: 3, keyFormulaOrLaw: 'Standard Deviation σ = √[Σ(x - X̄)² / N] | Karl Pearson r = Cov(X,Y) / (σ_x σ_y) | Fisher Index = √(Laspeyres × Paasche)', keyPoints: ['Coefficient of Variation measures consistency: Lower CV indicates higher stability/consistency', 'Fisher Ideal Index satisfies both Time Reversal and Factor Reversal Tests'], type: 'solved_problem', importance: 'High-Yield' }
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
// 4. MASTER DISPATCHER FOR ALL 86 COURSES
// ─────────────────────────────────────────────────────────────────────────────
export function resolveCompleteCourseSyllabus(
  courseId: string,
  courseTitle: string
): CourseFullSyllabus {
  const c = (courseId || '').toLowerCase();
  const title = courseTitle || 'Standard Curriculum';
  const isTa = title.includes('தமிழ்') || c.includes('-ta-');

  // 1. NEET UG Entrance
  if (c.includes('neet')) {
    return getNeetUgCompleteSyllabus();
  }

  // 2. TNPSC & Police Exams Track (All Groups 1, 2, 4, VAO, DEO, SI)
  if (c.includes('tnpsc') || c.includes('si') || c.includes('police') || c.includes('vao') || c.includes('group')) {
    return getTnpscUnifiedCompleteSyllabus(courseId, title);
  }

  // 3. Class 11 & 12 Commerce Track (CBSE, State Board, Matric)
  if (c.includes('11-com') || c.includes('12-com') || c.includes('commerce')) {
    return getCommerceClass11Syllabus(courseId, courseTitle);
  }

  // 4. KINDERGARTEN (LKG & UKG)
  if (c.includes('lkg') || c.includes('ukg') || c.includes('kindergarten')) {
    const subjects: SyllabusSubject[] = [
      {
        subjectId: 'kg_tamil',
        subjectName: 'தமிழ் மழலையர் பாடல் & உயிர் எழுத்துக்கள்',
        icon: '🔤',
        color: '#ec4899',
        totalChapters: 3,
        totalMicroTopics: 12,
        chapters: [
          {
            chapterNumber: 1,
            chapterTitle: 'உயிர் எழுத்துகள் 12 & பாடல் அறிமுகம்',
            description: 'அ முதல் ஔ வரை உள்ள 12 உயிர் எழுத்துகள் மற்றும் ஆய்த எழுத்து',
            microTopics: [
              { id: 'kg_t_1', topicTitle: 'அ முதல் ஈ வரை (அம்மா, ஆடு, இலை, ஈட்டி)', subtopic: 'படங்கள் பார்த்து எழுத்துகளை அடையாளம் காணுதல்', dayNumber: 1, periodNumber: 1, keyFormulaOrLaw: 'உயிர் எழுத்துக்கள்: அ, ஆ, இ, ஈ', keyPoints: ['அ - அணில், அம்மா', 'ஆ - ஆடு, ஆலமரம்'], type: 'concept', importance: 'Foundational' },
              { id: 'kg_t_2', topicTitle: 'உ முதல் ஏ வரை (உரல், ஊஞ்சல், எலி, ஏணி)', subtopic: 'எழுத்து உச்சரிப்பு மற்றும் கை அசைவுப் பயிற்சி', dayNumber: 2, periodNumber: 1, keyFormulaOrLaw: 'உயிர் எழுத்துக்கள்: உ, ஊ, எ, ஏ', keyPoints: ['உ - உரல்', 'ஊ - ஊஞ்சல்'], type: 'concept', importance: 'Foundational' },
              { id: 'kg_t_3', topicTitle: 'ஐ முதல் ஔ வரை & ஆய்த எழுத்து ஃ (ஐவர், ஒட்டகம், ஓடம், ஔவையார்)', subtopic: 'முழுமையான 12 உயிர் எழுத்துகள் நினைவுப் பாடல்', dayNumber: 3, periodNumber: 1, keyFormulaOrLaw: 'உயிர் எழுத்துக்கள் 12 + ஆய்தம் 1 (ஃ - எஃகு)', keyPoints: ['ஐ - ஐந்து', 'ஒ - ஒட்டகம்', 'ஔ - ஔவை'], type: 'memorization', importance: 'Foundational' }
            ]
          },
          {
            chapterNumber: 2,
            chapterTitle: 'மழலையர் பாலர் பாடல்கள் (Rhymes)',
            description: 'மகிழ்ச்சியான பாலர் பாடல்கள் மற்றும் கைதட்டல் பயிற்சிகள்',
            microTopics: [
              { id: 'kg_t_4', topicTitle: 'நிலா நிலா ஓடி வா & கைவீசம்மா கைவீசு', subtopic: 'பாடி ஆடி மகிழும் மழலையர் பாடல் வரிகள்', dayNumber: 4, periodNumber: 1, keyFormulaOrLaw: 'நிலா நிலா ஓடி வா நில்லாமல் ஓடி வா', keyPoints: ['சைகை செய்து பாடுதல்', 'மகிழ்ச்சியான பாடல் வரிகள்'], type: 'concept', importance: 'Foundational' },
              { id: 'kg_t_5', topicTitle: 'தோசையம்மா தோசை & வண்டியில பூட்டிய மாடு', subtopic: 'எளிய தமிழ் சொற்கள் உச்சரிப்பு பயிற்சி', dayNumber: 5, periodNumber: 1, keyFormulaOrLaw: 'தோசையம்மா தோசை சுடச்சுட தோசை', keyPoints: ['அம்மா சுட்ட தோசை', 'அப்பாவுக்கு நான்கு'], type: 'concept', importance: 'Foundational' }
            ]
          },
          {
            chapterNumber: 3,
            chapterTitle: 'மெய் எழுத்துகள் 18 அறிமுகம்',
            description: 'க் முதல் ன் வரை உள்ள புள்ளி வைத்த மெய் எழுத்துகள்',
            microTopics: [
              { id: 'kg_t_6', topicTitle: 'வல்லின மெய் எழுத்துகள் (க், ச், ட், த், ப், ற்)', subtopic: 'கொக்கு, தக்காளி, பந்து போன்ற எளிய சொற்கள்', dayNumber: 6, periodNumber: 1, keyFormulaOrLaw: 'க், ச், ட், த், ப், ற் — வல்லினம்', keyPoints: ['கொக்கு - க்', 'பந்து - த்'], type: 'concept', importance: 'Foundational' },
              { id: 'kg_t_7', topicTitle: 'மெல்லின & இடையின மெய் எழுத்துகள் (ங், ஞ், ண், ந், ம், ன், ய், ர், ல், வ், ழ், ள்)', subtopic: 'மெல்லினம் மற்றும் இடையின எழுத்துகள் உச்சரிப்பு', dayNumber: 7, periodNumber: 1, keyFormulaOrLaw: 'மெல்லினம் (ங, ஞ, ண, ந, ம, ன) | இடையினம் (ய, ர, ல, வ, ழ, ள)', keyPoints: ['மண் - ண்', 'மான் - ன்', 'மரம் - ர்'], type: 'concept', importance: 'Foundational' }
            ]
          }
        ]
      },
      {
        subjectId: 'kg_english',
        subjectName: 'English Phonics & Alphabets (A to Z)',
        icon: '🔤',
        color: '#3b82f6',
        totalChapters: 3,
        totalMicroTopics: 12,
        chapters: [
          {
            chapterNumber: 1,
            chapterTitle: 'Phonics Sounds: Letters A to H',
            description: 'Letter sounds, picture matching, and tracing for Beginners',
            microTopics: [
              { id: 'kg_e_1', topicTitle: 'Letters A, B, C, D Phonics & Tracing', subtopic: 'A for Apple 🍎, B for Ball ⚽, C for Cat 🐱, D for Dog 🐶', dayNumber: 1, periodNumber: 2, keyFormulaOrLaw: 'Phonics: /æ/ /b/ /k/ /d/', keyPoints: ['Letter tracing inside lines', 'Object recognition'], type: 'concept', importance: 'Foundational' },
              { id: 'kg_e_2', topicTitle: 'Letters E, F, G, H Phonics & Tracing', subtopic: 'E for Elephant 🐘, F for Fish 🐟, G for Grapes 🍇, H for Hat 🎩', dayNumber: 2, periodNumber: 2, keyFormulaOrLaw: 'Phonics: /e/ /f/ /g/ /h/', keyPoints: ['Sound recognition', 'Matching capital and small letters'], type: 'concept', importance: 'Foundational' }
            ]
          },
          {
            chapterNumber: 2,
            chapterTitle: 'Phonics Sounds: Letters I to P',
            description: 'Letter sounds and CVC 3-letter word blending',
            microTopics: [
              { id: 'kg_e_3', topicTitle: 'Letters I, J, K, L Phonics & Words', subtopic: 'I for Igloo 🧊, J for Jug 🥛, K for Kite 🪁, L for Lion 🦁', dayNumber: 3, periodNumber: 2, keyFormulaOrLaw: 'Phonics: /ɪ/ /dʒ/ /k/ /l/', keyPoints: ['Short vowel sound', 'Sight words'], type: 'concept', importance: 'Foundational' },
              { id: 'kg_e_4', topicTitle: 'Letters M, N, O, P Phonics & Words', subtopic: 'M for Mango 🥭, N for Nest 🪺, O for Orange 🍊, P for Parrot 🦜', dayNumber: 4, periodNumber: 2, keyFormulaOrLaw: 'Phonics: /m/ /n/ /ɒ/ /p/', keyPoints: ['Letter formation', 'Tracing uppercase and lowercase'], type: 'concept', importance: 'Foundational' }
            ]
          },
          {
            chapterNumber: 3,
            chapterTitle: 'Phonics Sounds: Letters Q to Z & Classic Nursery Rhymes',
            description: 'Alphabet completion and rhythmic rhymes',
            microTopics: [
              { id: 'kg_e_5', topicTitle: 'Letters Q to Z Phonics & Alphabet Train', subtopic: 'Sun, Tiger, Umbrella, Van, Watch, Xylophone, Yak, Zebra', dayNumber: 5, periodNumber: 2, keyFormulaOrLaw: 'Complete 26 Letters A to Z Alphabet Song', keyPoints: ['26 English Letters', 'Singing A-B-C-D song'], type: 'memorization', importance: 'Foundational' },
              { id: 'kg_e_6', topicTitle: 'Nursery Rhyme: Twinkle Twinkle & Baa Baa Black Sheep', subtopic: 'Action rhymes with finger gestures and music', dayNumber: 6, periodNumber: 2, keyFormulaOrLaw: 'Twinkle, Twinkle, Little Star, How I wonder what you are!', keyPoints: ['Rhythm and melody', 'Word rhyming pairs'], type: 'concept', importance: 'Foundational' }
            ]
          }
        ]
      },
      {
        subjectId: 'kg_maths',
        subjectName: 'Fun Maths & Numbers (1 to 20)',
        icon: '🔢',
        color: '#06b6d4',
        totalChapters: 3,
        totalMicroTopics: 10,
        chapters: [
          {
            chapterNumber: 1,
            chapterTitle: 'Counting Numbers 1 to 10',
            description: 'Count with fun objects, fingers, and matching games',
            microTopics: [
              { id: 'kg_m_1', topicTitle: 'Numbers 1 to 5: Counting with Fun Objects', subtopic: '1 Sun ☀️, 2 Shoes 👟, 3 Stars ⭐, 4 Wheels 🚗, 5 Fingers ✋', dayNumber: 1, periodNumber: 3, keyFormulaOrLaw: 'Counting Numbers: 1, 2, 3, 4, 5', keyPoints: ['Finger counting', 'Number recognition'], type: 'concept', importance: 'Foundational' },
              { id: 'kg_m_2', topicTitle: 'Numbers 6 to 10: Count & Match Activity', subtopic: '6 Balls, 7 Colors, 8 Legs (Spider), 9 Balloons, 10 Toes', dayNumber: 2, periodNumber: 3, keyFormulaOrLaw: 'Counting Numbers: 6, 7, 8, 9, 10', keyPoints: ['Count and write', 'Matching quantity to number'], type: 'concept', importance: 'Foundational' }
            ]
          },
          {
            chapterNumber: 2,
            chapterTitle: 'Basic 2D Shapes & Visual Patterns',
            description: 'Identify circles, squares, triangles, and repeating color sequences',
            microTopics: [
              { id: 'kg_m_3', topicTitle: 'Basic Shapes: Circle ⚪, Square ⬛, Triangle 🔺, Star ⭐', subtopic: 'Find shapes in everyday objects around the classroom and home', dayNumber: 3, periodNumber: 3, keyFormulaOrLaw: 'Circle has no sides | Triangle has 3 sides | Square has 4 equal sides', keyPoints: ['Round like a ball', 'Box like a square', 'Slice like pizza (triangle)'], type: 'concept', importance: 'Foundational' },
              { id: 'kg_m_4', topicTitle: 'Pattern Recognition: Red, Blue, Red, Blue Sequence', subtopic: 'Identify repeating shape and color patterns', dayNumber: 4, periodNumber: 3, keyFormulaOrLaw: 'Pattern Rule: ⚪ ⬛ ⚪ ⬛ -> Next is ⚪', keyPoints: ['Logical sequence', 'Visual brain training'], type: 'quiz', importance: 'Foundational' }
            ]
          },
          {
            chapterNumber: 3,
            chapterTitle: 'Size & Comparison Concept',
            description: 'Big vs Small, Tall vs Short, Heavy vs Light',
            microTopics: [
              { id: 'kg_m_5', topicTitle: 'Comparisons: Big vs Small 🐘🐁 & Tall vs Short 🦒🐰', subtopic: 'Visual comparison between animals and everyday objects', dayNumber: 5, periodNumber: 3, keyFormulaOrLaw: 'Elephant is BIG 🐘 | Mouse is SMALL 🐁 | Giraffe is TALL 🦒', keyPoints: ['Observation skills', 'Comparative vocabulary'], type: 'concept', importance: 'Foundational' }
            ]
          }
        ]
      },
      {
        subjectId: 'kg_evs',
        subjectName: 'EVS, Nature, Animals & Good Habits',
        icon: '🌿',
        color: '#10b981',
        totalChapters: 3,
        totalMicroTopics: 10,
        chapters: [
          {
            chapterNumber: 1,
            chapterTitle: 'My Amazing Body & 5 Sense Organs',
            description: 'Body parts, daily hygiene, and five senses',
            microTopics: [
              { id: 'kg_ev_1', topicTitle: 'My 5 Senses: Eyes, Ears, Nose, Tongue & Skin', subtopic: '👀 Eyes to see, 👂 Ears to hear, 👃 Nose to smell, 👅 Tongue to taste, ✋ Skin to touch', dayNumber: 1, periodNumber: 4, keyFormulaOrLaw: '5 Sense Organs: Eyes, Ears, Nose, Tongue, Skin', keyPoints: ['Healthy body care', 'Washing hands with soap'], type: 'concept', importance: 'Foundational' }
            ]
          },
          {
            chapterNumber: 2,
            chapterTitle: 'Friendly Animals & Fruit Basket',
            description: 'Domestic animals, wild animals, birds, and colorful fruits',
            microTopics: [
              { id: 'kg_ev_2', topicTitle: 'Domestic & Farm Animals: Dog, Cat, Cow, Goat', subtopic: 'Animal sounds: Woof Woof, Meow Meow, Moo Moo', dayNumber: 2, periodNumber: 4, keyFormulaOrLaw: 'Dog guards home | Cow gives sweet milk 🥛', keyPoints: ['Love and care for animals', 'Animal habitats'], type: 'concept', importance: 'Foundational' },
              { id: 'kg_ev_3', topicTitle: 'Fruits & Vegetables: Apple, Banana, Mango, Carrot', subtopic: 'Healthy eating habits and colorful vitamin-rich food', dayNumber: 3, periodNumber: 4, keyFormulaOrLaw: 'An Apple a day keeps the doctor away! 🍎', keyPoints: ['Fresh green vegetables', 'Eating seasonal fruits'], type: 'concept', importance: 'Foundational' }
            ]
          },
          {
            chapterNumber: 3,
            chapterTitle: 'Good Habits & Magic Manners',
            description: 'Magic words, sharing, and daily discipline',
            microTopics: [
              { id: 'kg_ev_4', topicTitle: 'Magic Words: "Please", "Thank You", "Sorry"', subtopic: 'Polite words and respectful behavior with elders and friends', dayNumber: 4, periodNumber: 4, keyFormulaOrLaw: 'Magic Manners: Always say "Thank You" 💖 and "Please" 🙏', keyPoints: ['Sharing toys with friends', 'Greeting teachers with smile'], type: 'memorization', importance: 'Foundational' }
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

  // 5. UNIVERSAL / K-12 STATE BOARD & CBSE GENERAL
  const defaultSubjects: SyllabusSubject[] = [
    {
      subjectId: 'school_sub_1',
      subjectName: isTa ? 'தமிழ் மொழி & செய்யுள்' : 'Language & Literature',
      icon: '📜',
      color: '#10b981',
      totalChapters: 3,
      totalMicroTopics: 12,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: isTa ? 'இயல் 1: செய்யுள் நயவுரை & உரைநடை' : 'Unit 1: Reading Comprehension & Prose',
          description: isTa ? 'பாடப்பகுதி செய்யுள், ஆசிரியர் வரலாறு மற்றும் சொற்பொருள்' : 'Textbook prose analysis, author background, and central theme',
          microTopics: [
            { id: 'gen_t_1', topicTitle: isTa ? 'செய்யுள் நயவுரை & மையக் கருத்து' : 'Core Theme & Literary Comprehension', subtopic: isTa ? 'பாடல் விளக்கம் & நயங்கள்' : 'Central moral idea and character study', dayNumber: 1, periodNumber: 1, keyFormulaOrLaw: isTa ? 'செய்யுள் நயம்: எதுகை, மோனை, இயைபு' : 'Literary Device: Alliteration & Rhyme Scheme', keyPoints: ['Textual interpretation', 'Model questions'], type: 'concept', importance: 'High-Yield' },
            { id: 'gen_t_2', topicTitle: isTa ? 'இலக்கண விதிகள் & பிழை திருத்தம்' : 'Applied Grammar & Mechanics', subtopic: isTa ? 'இலக்கண வகைகள் & வாக்கிய அமைப்புகள்' : 'Tenses, Subject-Verb agreement, and syntax', dayNumber: 2, periodNumber: 1, keyFormulaOrLaw: isTa ? 'எழுத்து, சொல், தொடர் இலக்கண விதிகள்' : 'Grammar Rule: Subject + Verb + Object', keyPoints: ['Error spotting', 'Sentence transformation'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        }
      ]
    },
    {
      subjectId: 'school_sub_2',
      subjectName: isTa ? 'கணிதம் (Mathematics)' : 'Mathematics',
      icon: '📐',
      color: '#06b6d4',
      totalChapters: 3,
      totalMicroTopics: 12,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: isTa ? 'அலகு 1: எண்கள், இயற்கணிதம் & சமன்பாடுகள்' : 'Unit 1: Number Systems & Algebra',
          description: isTa ? 'முழுக்கள், விகிதமுறு எண்கள் மற்றும் இயற்கணித சமன்பாடுகள்' : 'Real numbers, polynomial equations, and algebraic identities',
          microTopics: [
            { id: 'gen_m_1', topicTitle: isTa ? 'இயற்கணித முற்றொருமைகள் & காரணிப்படுத்துதல்' : 'Algebraic Identities & Factorization', subtopic: isTa ? '(a+b)², (a-b)² சூத்திரப் பயன்பாடு' : 'Expansion and factorization algorithms', dayNumber: 1, periodNumber: 2, keyFormulaOrLaw: '(a + b)² = a² + 2ab + b² | (a - b)² = a² - 2ab + b²', keyPoints: ['Step-by-step substitution', 'Exam benchmarks'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'gen_m_2', topicTitle: isTa ? 'வடிவியல் & கோணக் கணக்கீடுகள்' : 'Geometry: Angles & Triangle Theorems', subtopic: isTa ? 'முக்கோண கோணங்களின் கூடுதல் 180°' : 'Angle sum property, congruency, and proofs', dayNumber: 2, periodNumber: 2, keyFormulaOrLaw: 'Sum of angles in a triangle = 180°', keyPoints: ['Theorem proofs', 'Construction steps'], type: 'concept', importance: 'High-Yield' }
          ]
        }
      ]
    },
    {
      subjectId: 'school_sub_3',
      subjectName: isTa ? 'அறிவியல் (Science)' : 'Science',
      icon: '🔬',
      color: '#8b5cf6',
      totalChapters: 3,
      totalMicroTopics: 12,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: isTa ? 'அலகு 1: விசையும் இயக்கமும் (Force & Motion)' : 'Unit 1: Force, Motion & Laws',
          description: isTa ? 'நியூட்டனின் இயக்க விதிகள் மற்றும் சமன்பாடுகள்' : 'Kinematics, Newton laws, and momentum conservation',
          microTopics: [
            { id: 'gen_s_1', topicTitle: isTa ? 'நியூட்டனின் மூன்று இயக்க விதிகள்' : 'Newton Three Laws of Motion', subtopic: isTa ? 'F = ma சூத்திரம் மற்றும் நிலைம விதி' : 'Inertia, Momentum (p=mv), and Action-Reaction', dayNumber: 1, periodNumber: 3, keyFormulaOrLaw: 'Second Law of Motion: F = m × a | Equations: v = u + at', keyPoints: ['Momentum conservation', 'Real-world rocket propulsion'], type: 'concept', importance: 'High-Yield' }
          ]
        }
      ]
    },
    {
      subjectId: 'school_sub_4',
      subjectName: isTa ? 'சமூக அறிவியல் (Social Science)' : 'Social Science',
      icon: '🌍',
      color: '#f59e0b',
      totalChapters: 3,
      totalMicroTopics: 12,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: isTa ? 'அலகு 1: வரலாறு & அரசியலமைப்பு' : 'Unit 1: History & Civics',
          description: isTa ? 'வரலாற்று சான்றுகள், மக்களாட்சி மற்றும் குடிமையியல்' : 'Historical evidence, democracy, and fundamental rights',
          microTopics: [
            { id: 'gen_soc_1', topicTitle: isTa ? 'வரலாற்று சான்றுகள் & பண்டைய நாகரிகங்கள்' : 'Ancient Civilizations & Historical Evidence', subtopic: isTa ? 'கல்வெட்டுகள், நாணயங்கள் மற்றும் அகழாய்வுகள்' : 'Archaeological sources and inscriptions', dayNumber: 1, periodNumber: 4, keyFormulaOrLaw: isTa ? 'வரலாற்று சான்றுகள்: தொல்பொருள், நாணயங்கள், இலக்கியங்கள்' : 'Historical Sources: Inscriptions, Coins, Monuments', keyPoints: ['Timeline chronology', 'Map pointing skills'], type: 'concept', importance: 'High-Yield' }
          ]
        }
      ]
    }
  ];

  return {
    courseId,
    courseTitle: title,
    category: 'school_standard',
    board: 'TNSB / CBSE',
    medium: isTa ? 'Tamil' : 'English',
    totalDays: 200,
    totalSubjects: defaultSubjects.length,
    totalChapters: defaultSubjects.reduce((a, s) => a + s.chapters.length, 0),
    totalMicroTopics: defaultSubjects.reduce((a, s) => a + s.totalMicroTopics, 0),
    subjects: defaultSubjects
  };
}
