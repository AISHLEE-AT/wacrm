/**
 * TeachO Master Course Syllabus Registry
 * Provides deep, subject-wise, chapter-wise, and micro-granular syllabus trees for all 86 courses!
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

/**
 * Resolves the full micro-granular syllabus tree for any course
 */
export function resolveCompleteCourseSyllabus(
  courseId: string,
  courseTitle: string
): CourseFullSyllabus {
  const c = (courseId || '').toLowerCase();
  const title = courseTitle || 'Standard Curriculum';
  const isTa = title.includes('தமிழ்') || c.includes('-ta-');

  // ── 1. TNPSC COURSES (Group 1, Group 2/2A, Group 4, VAO, SI, DEO) ──
  if (c.includes('tnpsc') || c.includes('si') || c.includes('police')) {
    const subjects: SyllabusSubject[] = [
      {
        subjectId: 'tnpsc_tamil',
        subjectName: 'பொதுத்தமிழ் & தமிழ் அறிஞர்கள் (100 வினாக்கள் / 150 மதிப்பெண்)',
        icon: '📜',
        color: '#10b981',
        totalChapters: 4,
        totalMicroTopics: 18,
        chapters: [
          {
            chapterNumber: 1,
            chapterTitle: 'பகுதி அ: தமிழ் இலக்கணம் & புணர்ச்சி விதிகள்',
            description: 'எழுத்து, சொல், பொருள், யாப்பு, அணி மற்றும் பிழை திருத்தம்',
            microTopics: [
              { id: 'tn_t_1', topicTitle: 'முதல் & சார்பெழுத்துகள் (10 வகைகள்)', subtopic: 'உயிர்மெய், ஆய்தம், உயிரளபெடை, ஒற்றளபெடை, குற்றியலுகரம்', dayNumber: 1, periodNumber: 1, keyFormulaOrLaw: 'முதல் எழுத்துகள் 30 | சார்பெழுத்துகள் 10 வகை', keyPoints: ['உயிர் 12 + மெய் 18 = 30', 'குற்றியலுகரம் 6 வகை', 'ஆய்த குறுக்கம்'], type: 'concept', importance: 'High-Yield' },
              { id: 'tn_t_2', topicTitle: 'வேற்றுமை உருபுகள் (1 முதல் 8 வரை) & சொல்லுருபுகள்', subtopic: 'ஐ, ஆல், கு, இன், அது, கண் வேற்றுமைத் தொடர்கள்', dayNumber: 6, periodNumber: 1, keyFormulaOrLaw: '2-ம் வேற்றுமை: ஐ | 3-ம் வேற்றுமை: ஆல், ஆண் | 4-ம்: கு', keyPoints: ['முதல் வேற்றுமை எழுவாய்', '8-ம் வேற்றுமை விளி', 'உடன் தொக்க தொகை'], type: 'concept', importance: 'High-Yield' },
              { id: 'tn_t_3', topicTitle: 'வலிமிகும் இடங்கள் & வலிமிகா இடங்கள் விதிகள்', subtopic: 'நிலைமொழி, வருமொழி சந்தி விதிகள் & பிழையற்ற தமிழ் வாக்கியங்கள்', dayNumber: 11, periodNumber: 1, keyFormulaOrLaw: 'அ, இ சுட்டெழுத்துகளின் பின் வலிமிகும் | வினைத்தொகையில் மிகாது', keyPoints: ['அந்தப் பையன்', 'குடிநீர் (வினைத்தொகை)', 'இரண்டாம் வேற்றுமை விரி'], type: 'solved_problem', importance: 'High-Yield' },
              { id: 'tn_t_4', topicTitle: 'ஓரெழுத்து ஒருமொழி (42 சொற்கள்) & வேர்ச்சொல் மாற்றம்', subtopic: 'நன்னூல் 42 ஓரெழுத்து ஒருமொழிகள் & வினையாலணையும் பெயர்', dayNumber: 16, periodNumber: 1, keyFormulaOrLaw: 'நெடில் 40 + குறில் 2 (நொ, து) = 42 சொற்கள்', keyPoints: ['ஆ-பசு, மா-பெரிய, கோ-அரசன்', 'படித்தான் வேர்ச்சொல்: படி'], type: 'memorization', importance: 'High-Yield' },
              { id: 'tn_t_5', topicTitle: 'இலக்கணக் குறிப்பறிதல் — பண்பு, உவமை, உம்மை & வினைத்தொகை', subtopic: 'சொற்றொடர் இலக்கண வகைப்பாடு & தேர்வுக் குறிப்புகள்', dayNumber: 21, periodNumber: 1, keyFormulaOrLaw: 'மை விகுதி: பண்புத்தொகை | உம் மறைதல்: உம்மைத்தொகை', keyPoints: ['செந்தாமரை - பண்பு', 'காய் கனி - உம்மை', 'ஊறுகாய் - வினைத்தொகை'], type: 'quiz', importance: 'High-Yield' }
            ]
          },
          {
            chapterNumber: 2,
            chapterTitle: 'பகுதி ஆ: திருக்குறள் — அறத்துப்பால் & பொருட்பால் (25 அதிகாரங்கள்)',
            description: 'அகர முதல எழுத்தெல்லாம் முதல் 25 அதிகாரங்களின் முழுமையான உரை & நயவுரை',
            microTopics: [
              { id: 'tn_t_6', topicTitle: 'கடவுள் வாழ்த்து & வான்சிறப்பு (அதிகாரம் 1 & 2)', subtopic: 'அகர முதல எழுத்தெல்லாம் & துப்பார்க்குத் துப்பாய குறட்பாக்கள்', dayNumber: 2, periodNumber: 1, keyFormulaOrLaw: 'அகர முதல எழுத்தெல்லாம் ஆதி பகவன் முதற்றே உலகு', keyPoints: ['பரிமேலழகர் உரை சிறப்பு', 'வான்சிறப்பு: துப்பார்க்குத் துப்பாய'], type: 'concept', importance: 'High-Yield' },
              { id: 'tn_t_7', topicTitle: 'நீத்தார் பெருமை & அறன் வலியுறுத்தல் (அதிகாரம் 3 & 4)', subtopic: 'ஒழுக்கத்து நீத்தார் பெருமை & மனத்துக்கண் மாசிலன் ஆதல்', dayNumber: 7, periodNumber: 1, keyFormulaOrLaw: 'செயற்கரிய செய்வார் பெரியர் சிறியர் செய்கலா தார்', keyPoints: ['ஐந்தவித்தான் ஆற்றல்', 'மனத்துக்கண் மாசிலன் ஆதல் அனைத்தறன்'], type: 'concept', importance: 'High-Yield' },
              { id: 'tn_t_8', topicTitle: 'இல்வாழ்க்கை & அன்புடைமை (அதிகாரம் 5 & 8)', subtopic: 'அன்பும் அறனும் உடைத்தாயின் & அன்பிலார் எல்லாம் தமக்குரியர்', dayNumber: 12, periodNumber: 1, keyFormulaOrLaw: 'அன்பின் வழியது உயிர்நிலை அஃதிலார்க்கு என்புதோல் போர்த்த உடம்பு', keyPoints: ['ஈன்ற பொழுதின் பெரிதுவக்கும்', 'அன்போடு இயைந்த வழக்கு'], type: 'memorization', importance: 'High-Yield' },
              { id: 'tn_t_9', topicTitle: 'கல்வி, கல்லாமை & அறிவுடைமை (அதிகாரம் 40, 41, 43)', subtopic: 'கற்க கசடறக் கற்பவை & அறிவற்றங் காக்கும் கருவி', dayNumber: 17, periodNumber: 1, keyFormulaOrLaw: 'கற்க கசடறக் கற்பவை கற்றபின் நிற்க அதற்குத் தக', keyPoints: ['தொட்டனைத் தூறும் மணற்கேணி', 'எப்பொருள் யார்யார்வாய்க் கேட்பினும்'], type: 'concept', importance: 'High-Yield' },
              { id: 'tn_t_10', topicTitle: 'காலம் அறிதல் & வலி அறிதல் (அதிகாரம் 48 & 49)', subtopic: 'பகல்வெல்லும் கூகையைக் காக்கை & பீலிபெய் சாகாடும் அச்சிறும்', dayNumber: 22, periodNumber: 1, keyFormulaOrLaw: 'பகல்வெல்லும் கூகையைக் காக்கை இகல்வெல்லும் வேந்தர்க்கு வேண்டும் பொழுது', keyPoints: ['ஞாலம் கருதினுங் கைகூடும்', 'பீலிபெய் சாகாடு'], type: 'solved_problem', importance: 'High-Yield' }
            ]
          },
          {
            chapterNumber: 3,
            chapterTitle: 'பகுதி ஆ: சங்க இலக்கியம் & காப்பியங்கள்',
            description: 'எட்டுத்தொகை, பத்துப்பாட்டு, ஐம்பெருங்காப்பியங்கள் & பக்தி இலக்கியம்',
            microTopics: [
              { id: 'tn_t_11', topicTitle: 'எட்டுத்தொகை நூல்கள் (நற்றிணை, குறுந்தொகை, புறநானூறு)', subtopic: 'அகநானூறு, கலித்தொகை, பதிற்றுப்பத்து ஆசிரியர்கள் & மேற்கோள்கள்', dayNumber: 3, periodNumber: 1, keyFormulaOrLaw: 'நற்றிணை நல்ல குறுந்தொகை ஐங்குறுநூறு ஒத்த பதிற்றுப்பத்து ஓங்கு பரிபாடல்', keyPoints: ['யாதும் ஊரே யாவரும் கேளிர்', 'உண்டி கொடுத்தோர் உயிர் கொடுத்தோரே'], type: 'concept', importance: 'High-Yield' },
              { id: 'tn_t_12', topicTitle: 'பத்துப்பாட்டு நூல்கள் (முல்லைப்பாட்டு, மதுரைக்காஞ்சி)', subtopic: 'நெடுநல்வாடை, பட்டினப்பாலை, திருமுருகாற்றுப்படை சிறப்பு வரிகள்', dayNumber: 8, periodNumber: 1, keyFormulaOrLaw: 'முருகு பொருநாறு பாணிரண்டு முல்லை பெருகு வளமதுரைக் காஞ்சி', keyPoints: ['முல்லைப்பாட்டு நப்பூதனார் (103 அடிகள்)', 'மதுரைக்காஞ்சி மாங்குடி மருதனார்'], type: 'concept', importance: 'High-Yield' },
              { id: 'tn_t_13', topicTitle: 'சிலப்பதிகாரம் & மணிமேகலை (இரட்டைக் காப்பியங்கள்)', subtopic: 'இளங்கோவடிகள் & சீத்தலைச் சாத்தனார் காப்பியக் கட்டமைப்பு', dayNumber: 13, periodNumber: 1, keyFormulaOrLaw: 'அரசியல் பிழைத்தோர்க்கு அறங்கூற்றாவதூஉம் உரைசால் பத்தினியை உயர்ந்தோர் ஏத்தலும்', keyPoints: ['புகார், மதுரை, வஞ்சிக் காண்டங்கள் 30 காதைகள்', 'அமுதசுரபி சிறப்புகள்'], type: 'concept', importance: 'High-Yield' },
              { id: 'tn_t_14', topicTitle: 'பக்தி இலக்கியம் (தேவாரம், திருவாசகம், திவ்யப்பிரபந்தம்)', subtopic: 'நாயன்மார்கள், ஆழ்வார்கள், மாணிக்கவாசகர் பக்திப் பாடல்கள்', dayNumber: 18, periodNumber: 1, keyFormulaOrLaw: 'திருவாசகத்திற்கு உருகார் ஒரு வாசகத்திற்கும் உருகார்', keyPoints: ['அப்பர், சம்பந்தர், சுந்தரர் தேவாரம்', 'நம்மாழ்வார் திருவாய்மொழி'], type: 'memorization', importance: 'Core Standard' }
            ]
          },
          {
            chapterNumber: 4,
            chapterTitle: 'பகுதி இ: தமிழ் அறிஞர்களும் தமிழ்த் தொண்டும்',
            description: 'மகாகவி பாரதியார் முதல் தற்கால உரைநடை வரை',
            microTopics: [
              { id: 'tn_t_15', topicTitle: 'மகாகவி பாரதியார் & பாவேந்தர் பாரதிதாசன்', subtopic: 'சுதேசமித்திரன், இந்தியா இதழ்கள் & புரட்சிக் கவிதைகள்', dayNumber: 4, periodNumber: 1, keyFormulaOrLaw: 'பாட்டுக்கொரு புலவன் பாரதி | எங்கள் வாழ்வும் எங்கள் வளமும் மங்காத தமிழென்று சங்கே முழங்கு', keyPoints: ['பாஞ்சாலி சபதம், கண்ணன் பாட்டு', 'குடும்ப விளக்கு, பாண்டியன் பரிசு'], type: 'concept', importance: 'High-Yield' },
              { id: 'tn_t_16', topicTitle: 'நாமக்கல் கவிஞர், கவிமணி & கண்ணதாசன்', subtopic: 'காந்தியக் கவிஞர், ஆசிய ஜோதி & அர்த்தமுள்ள இந்துமதம்', dayNumber: 9, periodNumber: 1, keyFormulaOrLaw: 'கத்தியின்றி ரத்தமின்றி யுத்தமொன்று வருகுது', keyPoints: ['கத்தி இன்றி ரத்தம் இன்றி', 'தோட்டத்தில் மேயுது வெள்ளைப் பசு'], type: 'concept', importance: 'Core Standard' },
              { id: 'tn_t_17', topicTitle: 'உ.வே.சாமிநாதையர், பரிதிமாற்கலைஞர் தமிழ்த் தொண்டு', subtopic: 'தமிழ்த்தாத்தா ஓலைச்சுவடிப் பதிப்பு & திராவிட சாஸ்திரி பட்டம்', dayNumber: 14, periodNumber: 1, keyFormulaOrLaw: 'என் சரித்திரம் — உ.வே.சா தன் வரலாறு', keyPoints: ['சீவகசிந்தாமணி முதல் பதிப்பு 1887', 'உயர்தனிச் செம்மொழி பிரகடனம்'], type: 'concept', importance: 'High-Yield' },
              { id: 'tn_t_18', topicTitle: 'தந்தை பெரியார், பேரறிஞர் அண்ணா & காமராசர் சாதனைகள்', subtopic: 'சுயமரியாதை இயக்கம், எழுத்துச் சீர்திருத்தம் & கல்விப் புரட்சி', dayNumber: 19, periodNumber: 1, keyFormulaOrLaw: 'மத்திய அரசு 1978-ல் பெரியார் எழுத்துச் சீர்திருத்தத்தை ஏற்றுக்கொண்டது', keyPoints: ['குடியரசு இதழ் 1925', 'மதிய உணவு திட்டம்'], type: 'concept', importance: 'High-Yield' }
            ]
          }
        ]
      },
      {
        subjectId: 'tnpsc_polity',
        subjectName: 'இந்திய அரசியலமைப்பு & சட்டங்கள் (Indian Polity & Constitution)',
        icon: '⚖️',
        color: '#06b6d4',
        totalChapters: 4,
        totalMicroTopics: 18,
        chapters: [
          {
            chapterNumber: 1,
            chapterTitle: 'அரசியலமைப்பு உருவாக்கம், முகப்புரை & குடியுரிமை',
            description: 'அரசியல் நிர்ணய சபை, முகப்புரை தத்துவங்கள் மற்றும் குடியுரிமை சட்டம் 1955',
            microTopics: [
              { id: 'pol_1', topicTitle: 'அரசியல் நிர்ணய சபை & வரைவுக்குழு (1946–1949)', subtopic: 'டாக்டர் பி.ஆர். அம்பேத்கர் தலைமை & 2 ஆண்டுகள் 11 மாதங்கள் 18 நாட்கள் வரலாறு', dayNumber: 1, periodNumber: 2, keyFormulaOrLaw: 'முதல் கூட்டம்: 9 டிசம்பர் 1946 | நடைமுறை: 26 ஜனவரி 1950', keyPoints: ['நிரந்தர தலைவர்: டாக்டர் ராஜேந்திர பிரசாத்', 'வரைவுக்குழு தலைவர்: டாக்டர் அம்பேத்கர்'], type: 'concept', importance: 'High-Yield' },
              { id: 'pol_2', topicTitle: 'அரசியலமைப்பின் முகப்புரை & சிறப்பியல்புகள் (Preamble)', subtopic: 'சமதர்ம, மதச்சார்பற்ற, ஜனநாயக, குடியரசு & 42-வது அரசியலமைப்பு திருத்தம் 1976', dayNumber: 6, periodNumber: 2, keyFormulaOrLaw: 'Sovereign, Socialist, Secular, Democratic, Republic (42nd Amendment)', keyPoints: ['கேசவானந்த பாரதி வழக்கு 1973', 'முகப்புரை அரசியலமைப்பின் திறவுகோல்'], type: 'concept', importance: 'High-Yield' },
              { id: 'pol_3', topicTitle: 'பகுதி 1 & 2: இந்திய ஒன்றியம் மற்றும் குடியுரிமை (Articles 1–11)', subtopic: 'மாநிலங்கள் மறுசீரமைப்பு சட்டம் 1956 & குடியுரிமை சட்டம் 1955', dayNumber: 11, periodNumber: 2, keyFormulaOrLaw: 'பிரிவு 1: இந்தியா மாநிலங்களின் ஒன்றியம் | குடியுரிமை பெறும் 5 வழிகள்', keyPoints: ['பிறப்பு, வம்சாவளி, பதிவு, இயல்புரிமை, நிலப்பரப்பு இணைவு', 'குடியுரிமை இழக்கும் 3 வழிகள்'], type: 'concept', importance: 'High-Yield' }
            ]
          },
          {
            chapterNumber: 2,
            chapterTitle: 'பகுதி 3: அடிப்படை உரிமைகள் (Articles 12–35) & 5 நீதிப்பேராணைகள்',
            description: 'சமத்துவம், சுதந்திரம், மத உரிமை மற்றும் பிரிவு 32 நீதிப்பேராணைகள்',
            microTopics: [
              { id: 'pol_4', topicTitle: 'சமத்துவ உரிமை (Articles 14–18)', subtopic: 'சட்டத்தின் முன் சமம், பாகுபாடு தடை, தீண்டாமை ஒழிப்பு (Art 17), பட்டங்கள் ஒழிப்பு', dayNumber: 2, periodNumber: 2, keyFormulaOrLaw: 'Article 14: Equality before Law | Article 17: Abolition of Untouchability', keyPoints: ['Art 15: 5 காரணங்களால் பாகுபாடு கூடாது', 'Art 16: பொது வேலைவாய்ப்பில் சம வாய்ப்பு'], type: 'concept', importance: 'High-Yield' },
              { id: 'pol_5', topicTitle: 'சுதந்திர உரிமை & வாழ்வுரிமை (Articles 19–22)', subtopic: '6 அடிப்படை சுதந்திரங்கள் & பிரிவு 21 வாழ்வுரிமை மேனகா காந்தி வழக்கு', dayNumber: 7, periodNumber: 2, keyFormulaOrLaw: 'Article 19(1): 6 Freedoms | Article 21: Protection of Life & Personal Liberty', keyPoints: ['பேச்சு, கூட்டம், சங்கம், இயக்கம், வசிப்பிடம், தொழில்', 'Art 21A: கல்வி உரிமை (86-வது திருத்தம் 2002)'], type: 'concept', importance: 'High-Yield' },
              { id: 'pol_6', topicTitle: 'சுரண்டலுக்கு எதிரான உரிமை & மத சுதந்திரம் (Articles 23–28)', subtopic: 'மனித கடத்தல் தடை, குழந்தைத் தொழிலாளர் ஒழிப்பு (Art 24) & மத உரிமை', dayNumber: 12, periodNumber: 2, keyFormulaOrLaw: 'Article 24: Prohibition of Child Labour in Factories (Below 14 years)', keyPoints: ['Art 23: கொத்தடிமை முறை ஒழிப்பு', 'Art 25: மதத்தைப் பரப்பும் உரிமை'], type: 'concept', importance: 'High-Yield' },
              { id: 'pol_7', topicTitle: 'அரசியலமைப்பு தீர்வு காணும் உரிமை & 5 நீதிப்பேராணைகள் (Article 32 & 226)', subtopic: 'ஆட்கொணர்வு, கட்டளையிடும், தடையுறுத்தும், ஆவணக்கேட்பு, தகுதிமுறை வினவும் நீதிப்பேராணைகள்', dayNumber: 17, periodNumber: 2, keyFormulaOrLaw: 'Article 32: Constitutional Remedies — "Heart and Soul of the Constitution" (Dr. Ambedkar)', keyPoints: ['Habeas Corpus (ஆட்கொணர்வு)', 'Mandamus (கட்டளையுறுத்தும்)', 'Prohibition (தடையுறுத்தும்)', 'Certiorari (ஆவணக்கேட்பு)', 'Quo Warranto (தகுதிமுறை வினவும்)'], type: 'solved_problem', importance: 'High-Yield' }
            ]
          },
          {
            chapterNumber: 3,
            chapterTitle: 'பகுதி 4 & 4A: அரசு வழிகாட்டு நெறிமுறைகள் (DPSP) & அடிப்படைக் கடமைகள்',
            description: 'சமதர்ம, காந்திய, தாராளவாத கோட்பாடுகள் மற்றும் 11 அடிப்படைக் கடமைகள்',
            microTopics: [
              { id: 'pol_8', topicTitle: 'அரசு வழிகாட்டு நெறிமுறைகள் — DPSP (Articles 36–51)', subtopic: 'அயர்லாந்து ஆதாரம், கிராம பஞ்சாயத்து (Art 40) & பொது சிவில் சட்டம் (Art 44)', dayNumber: 3, periodNumber: 2, keyFormulaOrLaw: 'Art 40: Village Panchayats | Art 44: Uniform Civil Code | Art 45: Early Childhood Care', keyPoints: ['நீதிமன்றத்தால் கட்டாயப்படுத்த முடியாது', 'நல அரசு (Welfare State) இலக்கு'], type: 'concept', importance: 'High-Yield' },
              { id: 'pol_9', topicTitle: 'பகுதி 4A: அடிப்படைக் கடமைகள் (Article 51A — 11 கடமைகள்)', subtopic: 'ஸ்வரண் சிங் கமிட்டி, ரஷ்யா ஆதாரம் & 86-வது திருத்தம் குழந்தைக் கல்வி', dayNumber: 8, periodNumber: 2, keyFormulaOrLaw: 'Article 51A: 11 Fundamental Duties (Added by 42nd & 86th Amendments)', keyPoints: ['10 கடமைகள் 1976-ல் சேர்க்கப்பட்டன', '11-வது கடமை 2002-ல் சேர்க்கப்பட்டது (6-14 வயது கல்வி)'], type: 'memorization', importance: 'High-Yield' }
            ]
          },
          {
            chapterNumber: 4,
            chapterTitle: 'மத்திய & மாநில அரசுகளின் நிர்வாகம், நாடாளுமன்றம் & உள்ளாட்சி',
            description: 'குடியரசுத் தலைவர், பிரதமர், நாடாளுமன்றம், உச்ச நீதிமன்றம் மற்றும் பஞ்சாயத்து ராஜ்',
            microTopics: [
              { id: 'pol_10', topicTitle: 'இந்தியக் குடியரசுத் தலைவர் & துணைத் தலைவர் (Articles 52–73)', subtopic: 'தேர்தல் முறை, மன்னிப்பளிக்கும் அதிகாரம் (Art 72), அவசரநிலை அதிகாரங்கள் (352, 356, 360)', dayNumber: 4, periodNumber: 2, keyFormulaOrLaw: 'Art 52: President of India | Art 61: Impeachment | Art 72: Pardoning Power', keyPoints: ['நாட்டின் முதல் குடிமகன்', 'முப்படைகளின் தலைமை தளபதி', 'மாநிலங்களவை பதவிவழி தலைவர்: துணைத் தலைவர்'], type: 'concept', importance: 'High-Yield' },
              { id: 'pol_11', topicTitle: 'இந்திய நாடாளுமன்றம்: மக்களவை & மாநிலங்களவை (Articles 79–122)', subtopic: 'சபாநாயகர், நிதி மசோதா (Art 110), பட்ஜெட் (Art 112) & கூட்டுக் கூட்டம் (Art 108)', dayNumber: 9, periodNumber: 2, keyFormulaOrLaw: 'Article 110: Money Bill (Speaker Certification Final)', keyPoints: ['மக்களவை அதிகபட்சம் 550', 'மாநிலங்களவை அதிகபட்சம் 250 (12 நியமனம்)'], type: 'concept', importance: 'High-Yield' },
              { id: 'pol_12', topicTitle: 'இந்திய உச்ச நீதிமன்றம் & உயர் நீதிமன்றங்கள் (Articles 124–147 & 214–231)', subtopic: 'கொலீஜியம் முறை, நீதி மறுஆய்வு (Judicial Review) & அசல்/மேல்முறையீட்டு வரம்பு', dayNumber: 14, periodNumber: 2, keyFormulaOrLaw: 'Art 124: Supreme Court Establishment | Art 129: Court of Record', keyPoints: ['1 தலைமை நீதிபதி + 33 நீதிபதிகள்', 'ஓய்வு வயது: உச்ச நீதிமன்றம் 65, உயர் நீதிமன்றம் 62'], type: 'concept', importance: 'High-Yield' },
              { id: 'pol_13', topicTitle: 'பஞ்சாயத்து ராஜ் & நகராட்சிகள் (73-வது & 74-வது சட்டத்திருத்தங்கள் 1992)', subtopic: 'பல்வந்த் ராய் மேத்தா கமிட்டி (3 அடுக்கு முறை) & பகுதி 9, 9A, அட்டவணை 11, 12', dayNumber: 19, periodNumber: 2, keyFormulaOrLaw: '73rd Amendment: 11th Schedule (29 Subjects) | 74th Amendment: 12th Schedule (18 Subjects)', keyPoints: ['கிராம சபை அடிப்படை அலகு', 'பெண்களுக்கு 33% இடஒதுக்கீடு (தமிழகத்தில் 50%)'], type: 'solved_problem', importance: 'High-Yield' }
            ]
          }
        ]
      },
      {
        subjectId: 'tnpsc_aptitude',
        subjectName: 'கணிதம் & திறனறிவு (Aptitude & Mental Ability 25/25 Target)',
        icon: '🔢',
        color: '#f59e0b',
        totalChapters: 3,
        totalMicroTopics: 15,
        chapters: [
          {
            chapterNumber: 1,
            chapterTitle: 'சுருக்குதல் (BODMAS), HCF & LCM',
            description: 'எண்கணித அடிப்படை, இயற்கணித முற்றொருமைகள் & மீ.சி.ம / மீ.பொ.வ',
            microTopics: [
              { id: 'apt_1', topicTitle: 'சுருக்குதல் (Simplification) — BODMAS & முற்றொருமைகள்', subtopic: 'a²+b², a³+b³, பின்னங்கள், தசம எண்கள் மற்றும் வர்க்கமூலம் காணுதல்', dayNumber: 1, periodNumber: 3, keyFormulaOrLaw: 'BODMAS Rule: Brackets -> Orders -> Division -> Multiplication -> Addition -> Subtraction', keyPoints: ['(a+b)² = a² + 2ab + b²', '(a-b)² = a² - 2ab + b²', 'a² - b² = (a+b)(a-b)'], type: 'solved_problem', importance: 'High-Yield' },
              { id: 'apt_2', topicTitle: 'மீப்பெரு பொது காரணி — மீ.பொ.வ (HCF)', subtopic: 'பகா காரணி முறை, தொடர் வகுத்தல் முறை மற்றும் பின்னங்களின் HCF', dayNumber: 6, periodNumber: 3, keyFormulaOrLaw: 'பின்னங்களின் HCF = தொகுதிகளின் HCF / பகுதிகளின் LCM', keyPoints: ['இரு எண்களின் பொது வகுத்தி', 'பகா எண்களின் HCF = 1'], type: 'solved_problem', importance: 'High-Yield' },
              { id: 'apt_3', topicTitle: 'மீச்சிறு பொது மடங்கு — மீ.சி.ம (LCM)', subtopic: 'மணிகள் ஒலிக்கும் வினாக்கள் & தொடர் சுழற்சி கணக்கீடுகள்', dayNumber: 11, periodNumber: 3, keyFormulaOrLaw: 'இரு எண்களின் பெருக்கற்பலன் = HCF × LCM (a × b = HCF × LCM)', keyPoints: ['பின்னங்களின் LCM = தொகுதிகளின் LCM / பகுதிகளின் HCF', 'மீதமுள்ள வினாக்கள்'], type: 'solved_problem', importance: 'High-Yield' }
            ]
          },
          {
            chapterNumber: 2,
            chapterTitle: 'விழுக்காடு, இலாப நட்டம் & தனிவட்டி / கூட்டுவட்டி',
            description: 'சதவீத கணக்கீடுகள், தள்ளுபடி மற்றும் 2/3 ஆண்டுகள் CI-SI வித்தியாசம்',
            microTopics: [
              { id: 'apt_4', topicTitle: 'விழுக்காடு (Percentage) — அடிப்படை மற்றும் தேர்வு வினாக்கள்', subtopic: 'பின்னத்தை சதவீதமாக மாற்றுதல், விலை ஏற்ற/இறக்க சதவீத சமன்பாடுகள்', dayNumber: 2, periodNumber: 3, keyFormulaOrLaw: 'விலை r% அதிகரித்தால் செலவு மாறாமல் இருக்க நுகர்வு குறைப்பு = [r / (100 + r)] × 100%', keyPoints: ['மக்கள்தொகை வளர்ச்சி A = P(1 + r/100)ⁿ', 'தேர்வு மதிப்பெண் சதவீதங்கள்'], type: 'solved_problem', importance: 'High-Yield' },
              { id: 'apt_5', topicTitle: 'இலாப நட்டம் & தள்ளுபடி (Profit, Loss & Discount)', subtopic: 'அடக்க விலை, விற்ற விலை, இலாப சதவீதம் & தொடர் தள்ளுபடி', dayNumber: 7, periodNumber: 3, keyFormulaOrLaw: 'Profit% = (Profit / CP) × 100 | Loss% = (Loss / CP) × 100', keyPoints: ['தொடர் தள்ளுபடி சூத்திரம்: a + b - (ab/100)', 'குறித்த விலை வினாக்கள்'], type: 'solved_problem', importance: 'High-Yield' },
              { id: 'apt_6', topicTitle: 'தனிவட்டி (Simple Interest — SI)', subtopic: 'SI = PNR / 100, அசல், காலம் (N) மற்றும் வட்டி வீதம் (R) காணுதல்', dayNumber: 12, periodNumber: 3, keyFormulaOrLaw: 'SI = (P × N × R) / 100 | Total Amount A = P + SI', keyPoints: ['தொகை n மடங்காகும் காலம்: N = (n - 1) × 100 / R', 'நாட்கள் வட்டி கணக்குகள்'], type: 'solved_problem', importance: 'High-Yield' },
              { id: 'apt_7', topicTitle: 'கூட்டுவட்டி (Compound Interest — CI) & CI - SI வித்தியாசம்', subtopic: 'A = P(1 + R/100)ⁿ, அரை ஆண்டு மற்றும் 2, 3 ஆண்டுகள் வித்தியாசம்', dayNumber: 17, periodNumber: 3, keyFormulaOrLaw: '2 ஆண்டுகள் CI - SI வித்தியாசம் D = P(R / 100)² | 3 ஆண்டுகள்: D = P(R/100)² (3 + R/100)', keyPoints: ['வட்டி காலாண்டு முறை: R/4, 4N', 'அரை ஆண்டு முறை: R/2, 2N'], type: 'solved_problem', importance: 'High-Yield' }
            ]
          },
          {
            chapterNumber: 3,
            chapterTitle: 'விகிதம், நேரம், வேலை & அளவியல் (Mensuration 2D/3D)',
            description: 'A:B:C விகிதம், குழாய்கள் கணக்குகள், பரப்பளவு மற்றும் கனஅளவு',
            microTopics: [
              { id: 'apt_8', topicTitle: 'விகிதம் மற்றும் விகிதாச்சாரம் (Ratio & Proportion)', subtopic: 'A:B, B:C கொடுக்கப்பட்டால் A:B:C காணும் குறுக்குவழி & நாணயங்கள் வினாக்கள்', dayNumber: 3, periodNumber: 3, keyFormulaOrLaw: 'Product of Extremes = Product of Means (ad = bc)', keyPoints: ['A:B:C குறுக்குவழி தலைகீழ் N முறை', 'நாணயங்களின் மதிப்பு வினாக்கள்'], type: 'solved_problem', importance: 'High-Yield' },
              { id: 'apt_9', topicTitle: 'நேரம் மற்றும் வேலை (Time & Work) & குழாய்கள் கணக்குகள்', subtopic: 'A & B சேர்ந்து செய்யும் வேலை, திறமை விகிதம் மற்றும் தொட்டி கணக்குகள்', dayNumber: 8, periodNumber: 3, keyFormulaOrLaw: 'A and B together = (x × y) / (x + y) days | Chain Rule: (M1 × D1 × H1)/W1 = (M2 × D2 × H2)/W2', keyPoints: ['வேலை = திறன் × நாட்கள்', 'கசிவு உள்ள தொட்டி கணக்குகள்'], type: 'solved_problem', importance: 'High-Yield' },
              { id: 'apt_10', topicTitle: 'நேரம், வேகம் மற்றும் தூரம் (Speed, Time & Distance)', subtopic: 'இரயில்கள் கடக்கும் நேரம், படகுகள் & சராசரி வேகம்', dayNumber: 13, periodNumber: 3, keyFormulaOrLaw: 'Distance = Speed × Time | km/h to m/s: Multiply by 5/18', keyPoints: ['சராசரி வேகம் = 2xy / (x + y)', 'எதிர் திசையில் ரயில்கள்: S1 + S2'], type: 'solved_problem', importance: 'High-Yield' },
              { id: 'apt_11', topicTitle: 'பரப்பளவு மற்றும் சுற்றளவு (2D Mensuration)', subtopic: 'செவ்வகம், சதுரம், முக்கோணம், வட்டம் & வட்டக்கோணப் பகுதி', dayNumber: 18, periodNumber: 3, keyFormulaOrLaw: 'சமபக்க முக்கோண பரப்பு = (√3 / 4)a² | வட்டப் பரப்பு = πr² | வட்ட சுற்றளவு = 2πr', keyPoints: ['செவ்வகம் 2(l+b), lb', 'நாற்கரம் பரப்பு = 1/2 × d × (h1+h2)'], type: 'solved_problem', importance: 'High-Yield' },
              { id: 'apt_12', topicTitle: 'கனஅளவு மற்றும் புறப்பரப்பு (3D Mensuration)', subtopic: 'உருளை (Cylinder), கூம்பு (Cone), கோளம் (Sphere) & அரைக்கோளம்', dayNumber: 23, periodNumber: 3, keyFormulaOrLaw: 'உருளை கனஅளவு = πr²h | கூம்பு கனஅளவு = 1/3 πr²h | கோள கனஅளவு = 4/3 πr³', keyPoints: ['கூம்பு சாயுயரம் l = √(h² + r²)', 'அரைக்கோள வளைபரப்பு = 2πr²'], type: 'solved_problem', importance: 'High-Yield' }
            ]
          }
        ]
      },
      {
        subjectId: 'tnpsc_unit8_9',
        subjectName: 'தமிழ்நாடு வரலாறு, பண்பாடு & வளர்ச்சி நிர்வாகம் (Unit 8 & 9)',
        icon: '🏛️',
        color: '#8b5cf6',
        totalChapters: 3,
        totalMicroTopics: 12,
        chapters: [
          {
            chapterNumber: 1,
            chapterTitle: 'பண்டைய தமிழக வரலாறு & தொல்லியல் அகழாய்வுகள்',
            description: 'கீழடி, ஆதிச்சநல்லூர், கொடுமணல் மற்றும் சங்க கால ஆட்சி முறை',
            microTopics: [
              { id: 'u8_1', topicTitle: 'தொல்லியல் அகழாய்வுகள்: கீழடி, ஆதிச்சநல்லூர், கொடுமணல், பொருந்தல்', subtopic: 'வைகை நதிக்கரை நாகரிகம், தமிழ்-பிராமி எழுத்துக்கள் & சங்க கால நகரமைப்பு', dayNumber: 1, periodNumber: 4, keyFormulaOrLaw: 'கீழடி அகழாய்வு காலம்: கிமு 6-ம் நூற்றாண்டு (கிமு 580 - வைகை நாகரிகம்)', keyPoints: ['ஆதிச்சநல்லூர் முதுமக்கள் தாழிகள்', 'கொடுமணல் ரோமானிய நாணயங்கள்', 'பொருந்தல் நெல்மணிகள் சான்று'], type: 'concept', importance: 'High-Yield' },
              { id: 'u8_2', topicTitle: 'சங்க கால அரசியல் & மூவேந்தர் (சேர, சோழ, பாண்டியர்)', subtopic: 'சங்க இலக்கிய புறத்திணைகள், குறுநில மன்னர்கள் (கடையேழு வள்ளல்கள்)', dayNumber: 6, periodNumber: 4, keyFormulaOrLaw: 'சேரர் - வில் அம்பு (வஞ்சி) | சோழர் - புலி (உறையூர்) | பாண்டியர் - மீன் (மதுரை)', keyPoints: ['கடையேழு வள்ளல்கள்: பேகன், பாரி, காரி, ஆய், அதியமான், நள்ளி, ஓரி', 'வெண்ணிப் போர் - கரிகாலன்'], type: 'concept', importance: 'High-Yield' },
              { id: 'u8_3', topicTitle: 'சோழர்களின் உள்ளாட்சி நிர்வாகம் & உத்தரமேரூர் கல்வெட்டு', subtopic: 'குடவோலை தேர்தல் முறை, வாரியங்கள் மற்றும் கிராம சுயாட்சி', dayNumber: 11, periodNumber: 4, keyFormulaOrLaw: 'உத்தரமேரூர் கல்வெட்டு (முதலாம் பராந்தக சோழன் - கி.பி 919 & 921)', keyPoints: ['குடவோலை தேர்தல் தகுதிகள்', 'ஏரி வாரியம், தோட்ட வாரியம், பொன் வாரியம்'], type: 'concept', importance: 'High-Yield' }
            ]
          },
          {
            chapterNumber: 2,
            chapterTitle: 'தமிழ்நாட்டின் சமூக சீர்திருத்த இயக்கங்கள் & திராவிட இயக்கம்',
            description: 'நீதிக்கட்சி, தந்தை பெரியார், சுயமரியாதை இயக்கம் & பேரறிஞர் அண்ணா',
            microTopics: [
              { id: 'u8_4', topicTitle: 'நீதிக்கட்சி (Justice Party 1916) சாதனைகள் & வகுப்புவாரி அரசாணை', subtopic: 'தியாகராய செட்டியார், டி.எம்.நாயர், 1921 முதல் வகுப்புவாரி பிரதிநிதித்துவம் (Communal GO)', dayNumber: 2, periodNumber: 4, keyFormulaOrLaw: '1921 Communal GO | 1926 இந்து சமய அறநிலையச் சட்டம் | 1921 பெண்களுக்கு வாக்குரிமை', keyPoints: ['ஆந்திரா பல்கலைக்கழகம் 1926, அண்ணாமலை 1929', 'தேவதாசி முறை ஒழிப்பு சட்டம்'], type: 'concept', importance: 'High-Yield' },
              { id: 'u8_5', topicTitle: 'தந்தை பெரியார் — சுயமரியாதை இயக்கம் & வைக்கம் போராட்டம் (1924)', subtopic: '1925 செங்கல்பட்டு மாநாடு, குடியரசு இதழ், பெண் விடுதலை & மூடநம்பிக்கை ஒழிப்பு', dayNumber: 7, periodNumber: 4, keyFormulaOrLaw: 'வைக்கம் வீரர் (1924) | யுனெஸ்கோ விருது (1970 - தெற்காசியாவின் சாக்ரட்டீஸ்)', keyPoints: ['சுயமரியாதை திருமண சட்டம்', '1938 சென்னை பெண்கள் மாநாட்டில் பெரியார் பட்டம்'], type: 'concept', importance: 'High-Yield' },
              { id: 'u8_6', topicTitle: 'பேரறிஞர் அண்ணா & பெருந்தலைவர் காமராசர் சாதனைகள்', subtopic: '1967 சுயமரியாதை திருமண சட்டம், தமிழ்நாடு பெயர் மாற்றம் (1969), மதிய உணவு திட்டம்', dayNumber: 12, periodNumber: 4, keyFormulaOrLaw: '14 ஜனவரி 1969: மதராஸ் மாநிலம் "தமிழ்நாடு" என பெயர் மாற்றம் செய்யப்பட்டது', keyPoints: ['இருமொழிக் கொள்கை (தமிழ் + ஆங்கிலம்)', 'காமராசர் இலவச சீருடை & தொடக்கக் கல்வி புரட்சி'], type: 'concept', importance: 'High-Yield' }
            ]
          },
          {
            chapterNumber: 3,
            chapterTitle: 'தமிழ்நாட்டின் வளர்ச்சி நிர்வாகம் & மனிதவள மேம்பாடு (Unit 9)',
            description: 'மனிதவள மேம்பாட்டு குறியீடுகள் (HDI), நலத்திட்டங்கள், மின்னாளுமை & தொழில் வளர்ச்சி',
            microTopics: [
              { id: 'u9_1', topicTitle: 'தமிழ்நாட்டின் மனிதவள மேம்பாட்டுக் குறியீடுகள் (HDI Rankings)', subtopic: 'கல்வி அறிவு வீதம், தாய்-சேய் இறப்பு விகிதம் (MMR, IMR) மற்றும் சுகாதார மாதிரி', dayNumber: 3, periodNumber: 4, keyFormulaOrLaw: 'தமிழ்நாடு உயர் கல்வி சேர்க்கை விகிதம் (GER) ~51% (தேசிய சராசரியை விட இரண்டு மடங்கு)', keyPoints: ['NITI Aayog சுகாதார குறியீட்டில் முன்னணி', 'மகப்பேறு உதவித்திட்டங்கள் (முத்துலட்சுமி ரெட்டி திட்டம்)'], type: 'concept', importance: 'High-Yield' },
              { id: 'u9_2', topicTitle: 'தமிழ்நாடு மின்னாளுமை முகமை (TNeGA) & அரசு நலத்திட்டங்கள்', subtopic: 'இ-சேவை மையங்கள், முதலமைச்சரின் விரிவான மருத்துவக் காப்பீடு, புதுமைப் பெண் திட்டம்', dayNumber: 8, periodNumber: 4, keyFormulaOrLaw: 'TNeGA: e-Governance Portal | புதுமைப் பெண் திட்டம் (மூவலூர் ராமாமிர்தம் உயர்கல்வி உறுதி)', keyPoints: ['நான் முதல்வன் திட்டம்', 'இல்லம் தேடிக் கல்வி & மக்களைத் தேடி மருத்துவம்'], type: 'concept', importance: 'High-Yield' },
              { id: 'u9_3', topicTitle: 'தமிழ்நாட்டின் தொழில் தொகுப்புகள் & பொருளாதார வளர்ச்சி', subtopic: 'வாகன உற்பத்தி தலைநகரம் (Detroit of Asia), ஜவுளி, தோல் மற்றும் IT பூங்காக்கள்', dayNumber: 13, periodNumber: 4, keyFormulaOrLaw: 'சென்னை: "ஆசியாவின் டெட்ராய்ட்" | திருப்பூர்: பின்னலாடை நகரம் | சிவகாசி: குட்டி ஜப்பான்', keyPoints: ['SIPCOT மற்றும் TIDEL Park', 'தமிழ்நாடு பொருளாதார இலக்கு: $1 Trillion Economy'], type: 'concept', importance: 'High-Yield' }
            ]
          }
        ]
      }
    ];

    return {
      courseId,
      courseTitle: title,
      category: 'tnpsc',
      board: 'TNPSC / TNUSRB',
      medium: isTa ? 'Tamil' : 'Bilingual',
      totalDays: 360,
      totalSubjects: subjects.length,
      totalChapters: subjects.reduce((a, s) => a + s.chapters.length, 0),
      totalMicroTopics: subjects.reduce((a, s) => a + s.totalMicroTopics, 0),
      subjects
    };
  }

  // ── 2. KINDERGARTEN COURSES (LKG & UKG) ──
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

  // ── 3. UNIVERSAL / K-12 STATE BOARD & CBSE COURSES ──
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
