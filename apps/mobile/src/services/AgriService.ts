import * as SecureStore from 'expo-secure-store';
import { supabase } from '../lib/supabase';

export interface AgriMediaItem {
  id: string;
  title: string;
  description: string;
  source: 'youtube' | 'facebook' | 'web' | 'live';
  videoId?: string;
  url: string;
  thumbnail: string;
  duration?: string;
  category: 'crop_guide' | 'organic' | 'machinery' | 'gov_scheme' | 'market_trends';
  author: string;
  publishedAt: string;
  isFeatured?: boolean;
}

export interface AgriDailyTask {
  id: string;
  title: string;
  category: 'sowing' | 'irrigation' | 'fertilizer' | 'pest_control' | 'harvest';
  stage: string;
  timing: string;
  details: string;
  tips: string;
  isCompleted?: boolean;
}

export interface AgriCropGuide {
  id: string;
  name: string;
  scientificName: string;
  category: 'high_value' | 'cash_crop' | 'millets' | 'horticulture' | 'traditional_paddy';
  tag: string;
  tagColor: string;
  season: string;
  durationMonths: string;
  soilType: string;
  spacing: string;
  waterNeed: 'குறைந்த நீர்' | 'மிதமான நீர்' | 'அதிக நீர்';
  investmentPerAcre: string;
  expectedIncomePerAcre: string;
  profitPerAcre: string;
  highlights: string[];
  cultivationSteps: { title: string; desc: string }[];
  pestsAndRemedies: { pest: string; organicRemedy: string; chemicalRemedy: string }[];
}

export interface AgriGovScheme {
  id: string;
  name: string;
  tamilName: string;
  subsidy: string;
  eligibility: string;
  requiredDocuments: string[];
  applicationPortal: string;
  portalUrl: string;
  contactHelpline: string;
}

const STORAGE_KEY_TASKS = 'agro-daily-tasks-state-v1';

// ─── Preloaded Tamil Nadu Agri Videos & Admin Broadcasts ───
export const INITIAL_AGRI_VIDEOS: AgriMediaItem[] = [
  {
    id: 'vid-1',
    title: 'டிராகன் ஃப்ரூட் சாகுபடி: ஏக்கருக்கு ₹8 லட்சம் லாபம் எடுப்பது எப்படி?',
    description: 'தமிழ்நாட்டில் குறைந்த நீரில் அதிக வருமானம் தரும் நவீன டிராகன் பழ சாகுபடி முழு வழிகாட்டி.',
    source: 'youtube',
    videoId: '07FG8UfsWag',
    url: 'https://www.youtube.com/watch?v=07FG8UfsWag',
    thumbnail: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80',
    duration: '12:45',
    category: 'crop_guide',
    author: 'SuprO உழவர் டிவி',
    publishedAt: 'இன்று',
    isFeatured: true,
  },
  {
    id: 'vid-2',
    title: 'இயற்கை பூச்சி விரட்டி & பஞ்சகாவ்யா தயாரிக்கும் எளிய முறை',
    description: 'செலவில்லாமல் பயிர்களை பாதுகாக்கும் நாட்டு பசு சாணம் & மூலிகை பூச்சி விரட்டி செய்முறை விளக்கம்.',
    source: 'youtube',
    videoId: 'M7lc1UVf-VE',
    url: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
    thumbnail: 'https://images.unsplash.com/photo-1592417817098-8f3d69106886?w=600&auto=format&fit=crop&q=80',
    duration: '08:20',
    category: 'organic',
    author: 'வேளாண் வளர்ச்சி குழுமம்',
    publishedAt: 'நேற்று',
    isFeatured: true,
  },
  {
    id: 'vid-3',
    title: 'கலைஞர் அனைத்து கிராம ஒருங்கிணைந்த வேளாண் வளர்ச்சி திட்டம் - 100% மானியம்',
    description: 'தமிழக அரசு வழங்கும் ஆழ்துளை கிணறு, வரப்பு பயிர் & மின் மோட்டார் மானியம் பெறும் எளிய முறை.',
    source: 'youtube',
    videoId: 'fJ9rUzIMcZQ',
    url: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
    thumbnail: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&auto=format&fit=crop&q=80',
    duration: '15:10',
    category: 'gov_scheme',
    author: 'உழவன் நலன்',
    publishedAt: '2 நாட்களுக்கு முன்',
  },
  {
    id: 'vid-4',
    title: 'சொட்டு நீர் பாசனம் அமைத்தல்: 100% அரசு மானிய பதிவு விவரம்',
    description: 'பிரதம மந்திரி கிரிஷி சிஞ்சாயி யோஜனா (PMKSY) மூலம் சிறு/குறு விவசாயிகளுக்கு 100% மானியத்தில் சொட்டு நீர்.',
    source: 'youtube',
    videoId: 'ysz5S6PUM-U',
    url: 'https://www.youtube.com/watch?v=ysz5S6PUM-U',
    thumbnail: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=600&auto=format&fit=crop&q=80',
    duration: '10:30',
    category: 'machinery',
    author: 'வேளாண் பொறியியல் பிரிவு',
    publishedAt: '3 நாட்களுக்கு முன்',
  },
  {
    id: 'vid-5',
    title: 'தமிழ்நாடு உழவர் சந்தை நேரடி விலை நிலவரம் & விற்பனை யுக்திகள்',
    description: 'இடைத்தரகர் இல்லாமல் விளைபொருட்களுக்கு அதிக விலை பெறும் உழவர் சந்தை வழிகாட்டல்.',
    source: 'facebook',
    url: 'https://facebook.com',
    thumbnail: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
    duration: 'நேரலை',
    category: 'market_trends',
    author: 'தமிழ்நாடு உழவர் சங்கம்',
    publishedAt: 'நேற்று',
  },
];

// ─── Preloaded Tamil Nadu Daily Farm Tasks ───
export const INITIAL_DAILY_TASKS: AgriDailyTask[] = [
  {
    id: 'task-1',
    title: 'விதை நேர்த்தி & நாற்று நடும் முன் தயாரிப்பு',
    category: 'sowing',
    stage: 'ஆரம்ப நிலை (0-15 நாட்கள்)',
    timing: 'காலை 6:00 - 8:30',
    details: 'சூடோமோனாஸ் (Pseudomonas) அல்லது பஞ்சகாவ்யா கரைசலில் விதைகளை 30 நிமிடம் ஊற வைத்து விதைக்கவும்.',
    tips: 'விதைகள் மூலம் பரவும் பூஞ்சை நோய்களை 90% தடுக்கும்.',
  },
  {
    id: 'task-2',
    title: 'சொட்டு நீர் பாசனம் & நுண் ஊட்டச்சத்து வழங்கல்',
    category: 'irrigation',
    stage: 'வளர்ச்சி நிலை (15-45 நாட்கள்)',
    timing: 'காலை 7:00 - 9:00 / மாலை 4:30 - 6:00',
    details: 'சொட்டு நீர் குழாய்களில் அடைப்பு உள்ளதா என சரிபார்த்து, நீரில் கரையும் உரம் (19:19:19) செலுத்தவும்.',
    tips: 'வெயில் நேரத்தில் பாசனம் செய்வதை தவிர்க்கவும்.',
  },
  {
    id: 'task-3',
    title: 'இயற்கை பூச்சி விரட்டி & இலைவழி தெளிப்பு',
    category: 'pest_control',
    stage: 'பூக்கும் நிலை (45-75 நாட்கள்)',
    timing: 'மாலை 4:30 - 6:30',
    details: '3% வேப்பெண்ணெய் கரைசல் (10 லிட்டர் நீருக்கு 300 மிலி) அல்லது இஞ்சி-பூண்டு-பச்சை மிளகாய் கரைசல் தெளிக்கவும்.',
    tips: 'இலைகளின் அடியில் நன்கு படும்படி தெளிக்க வேண்டும்.',
  },
  {
    id: 'task-4',
    title: 'களை எடுத்தல் & வரப்பு பயிர் பராமரிப்பு',
    category: 'fertilizer',
    stage: 'வளர்ச்சி நிலை',
    timing: 'காலை வேளை',
    details: 'பயிர்களின் இடையே உள்ள களைகளை அகற்றி, தட்டைப்பயிறு அல்லது ஆமணக்கு வரப்பு பயிர்களை கவனிக்கவும்.',
    tips: 'களை செடிகள் உரச் சத்தை வீணடிப்பதை தடுக்கும்.',
  },
  {
    id: 'task-5',
    title: 'கதிர் முதிர்ச்சி & அறுவடை திட்டமிடல்',
    category: 'harvest',
    stage: 'அறுவடை நிலை (80-120 நாட்கள்)',
    timing: 'முழு நாள்',
    details: 'பயிர்களில் 80-85% தானியங்கள் பொன்னிறமாக மாறியவுடன் RentO செயலி மூலம் அறுவடை இயந்திரம் பதிவு செய்யவும்.',
    tips: 'ஈரப்பதம் 14% குறைவாக இருக்கும்போது அறுவடை செய்யவும்.',
  },
];

// ─── Preloaded High-Profit Crop Guides ───
export const AGRI_CROP_GUIDES: AgriCropGuide[] = [
  {
    id: 'crop-dragon-fruit',
    name: 'டிராகன் ஃப்ரூட் (Dragon Fruit)',
    scientificName: 'Hylocereus undatus',
    category: 'high_value',
    tag: '⭐ அதிக லாபம்',
    tagColor: '#ec4899',
    season: 'ஆண்டு முழுவதும் (ஜூன் - அக்டோபர் நடவு சிறந்தது)',
    durationMonths: '25 ஆண்டுகள் பலன் (15 மாதத்தில் முதல் அறுவடை)',
    soilType: 'மணல் கலந்த செம்மண் / வடிகால் வசதியுள்ள மண்',
    spacing: '10 அடி x 10 அடி (ஒரு தூணுக்கு 4 செடிகள்)',
    waterNeed: 'குறைந்த நீர்',
    investmentPerAcre: '₹3,00,000 - ₹4,00,000 (ஒரு முறை முதலீடு)',
    expectedIncomePerAcre: '₹8,00,000 - ₹12,00,000 / ஆண்டு',
    profitPerAcre: '₹6,00,000 - ₹8,00,000 நிகர லாபம்',
    highlights: [
      'குறைந்த நீரில் வறண்ட நிலத்திலும் வளரும்',
      'ஒரு முறை நட்டால் 20-25 ஆண்டுகள் வரை தொடர் வருமானம்',
      'உள்நாட்டு மற்றும் வெளிநாட்டு சந்தையில் கிலோ ₹100 - ₹180 வரை விலை',
      'பூச்சி மற்றும் நோய் தாக்குதல் மிகக் குறைவு',
    ],
    cultivationSteps: [
      { title: '1. நிலம் தயாரித்தல்', desc: 'சிமெண்ட் தூண்கள் (8 அடி உயரம்) நட்டு மேல் பகுதியில் டயர் அல்லது வளையம் பொருத்த வேண்டும்.' },
      { title: '2. நடவு முறை', desc: 'ஒவ்வொரு தூணின் நான்கு பக்கமும் நன்கு வேர் பிடித்த 4 செடிகளை நட வேண்டும்.' },
      { title: '3. உர மேலாண்மை', desc: 'ஆண்டுக்கு 2 முறை மண்புழு உரம், வேப்பம் பிண்ணாக்கு மற்றும் நுண்ணூட்ட சத்து இடவும்.' },
      { title: '4. அறுவடை', desc: 'மே முதல் அக்டோபர் வரை மாதம் 2-3 முறை பழங்களை அறுவடை செய்யலாம்.' },
    ],
    pestsAndRemedies: [
      { pest: 'எறும்பு மற்றும் மாவுப்பூச்சி', organicRemedy: 'வேப்பெண்ணெய் கரைசல் (5 மி.லி/லிட்டர்) தெளிக்கவும்.', chemicalRemedy: 'இமிடாக்ளோபிரிட் 0.5 மி.லி/லிட்டர்.' },
      { pest: 'தண்டு அழுகல் நோய்', organicRemedy: 'சூடோமோனாஸ் 10 கிராம்/லிட்டர் வேர்ப்பகுதியில் ஊற்றவும்.', chemicalRemedy: 'காப்பர் ஆக்ஸிகுளோரைடு 2 கிராம்/லிட்டர்.' },
    ],
  },
  {
    id: 'crop-moringa',
    name: 'நாட்டு முருங்கை (ODC Moringa)',
    scientificName: 'Moringa oleifera',
    category: 'cash_crop',
    tag: '⚡ 6 மாதத்தில் வருமானம்',
    tagColor: '#10b981',
    season: 'ஜூலை - ஆகஸ்ட் / நவம்பர் - டிசம்பர்',
    durationMonths: '5-6 மாதத்தில் முதல் காய் அறுவடை',
    soilType: 'செம்மண், கரிசல் மண்',
    spacing: '10 அடி x 8 அடி (ஏக்கருக்கு 550 செடிகள்)',
    waterNeed: 'குறைந்த நீர்',
    investmentPerAcre: '₹35,000 - ₹50,000',
    expectedIncomePerAcre: '₹2,50,000 - ₹3,50,000 / ஆண்டு',
    profitPerAcre: '₹2,00,000+ நிகர லாபம்',
    highlights: [
      '6வது மாதத்தில் இருந்து தொடர்ந்து 2 ஆண்டுகள் காய் காய்க்கும்',
      'முருங்கை இலை பொடிக்கு வெளிநாட்டு ஏற்றுமதி தேவை அதிகம்',
      'வறட்சியை தாங்கி செழித்து வளரும்',
    ],
    cultivationSteps: [
      { title: '1. விதைப்பு', desc: 'குழிகள் 1x1x1 அடி எடுத்து மக்கிய தொழு உரம் இட்டு விதைகளை நடவும்.' },
      { title: '2. கிளை வெட்டுதல்', desc: 'செடி 3 அடி உயரம் வளரும்போது நுனியை கிள்ளி பக்கவாட்டு கிளைகளை பெருக்க வேண்டும்.' },
      { title: '3. காய் அறுவடை', desc: 'ஒரு மரத்தில் ஆண்டுக்கு 200 - 300 தரமான காய்கள் கிடைக்கும்.' },
    ],
    pestsAndRemedies: [
      { pest: 'கம்பளிப்பூச்சி & புழு', organicRemedy: 'வேப்பங்கொட்டை சாறு 5% தெளிக்கவும்.', chemicalRemedy: 'டைமீத்தோயேட் 2 மி.லி/லிட்டர்.' },
    ],
  },
  {
    id: 'crop-millets',
    name: 'பாரம்பரிய சிறுதானியங்கள் (Millets - கேழ்வரகு, தினை, குதிரைவாலி)',
    scientificName: 'Eleusine coracana / Setaria italica',
    category: 'millets',
    tag: '🌾 ஆரோக்கியம் & மதிப்புக்கூட்டல்',
    tagColor: '#f59e0b',
    season: 'ஆடி பட்டம் / கார்த்திகை பட்டம்',
    durationMonths: '80 - 100 நாட்கள்',
    soilType: 'அனைத்து வகை மண் (வடிகால் வசதி அவசியம்)',
    spacing: '1 அடி x 6 அங்குலம்',
    waterNeed: 'குறைந்த நீர்',
    investmentPerAcre: '₹15,000 - ₹20,000',
    expectedIncomePerAcre: '₹55,000 - ₹75,000',
    profitPerAcre: '₹40,000 - ₹55,000 (குறைந்த உழைப்பு)',
    highlights: [
      'பூச்சி மருந்து தேவையில்லாத இயற்கை பயிர்',
      'அரசு கொள்முதல் மற்றும் ரேஷன் விநியோகத்தில் முன்னுரிமை',
      'மதிப்புக்கூட்டி மாவு/நூடுல்ஸ் செய்தால் 3 மடங்கு கூடுதல் லாபம்',
    ],
    cultivationSteps: [
      { title: '1. விதைப்பு', desc: 'ஏக்கருக்கு 4 கிலோ விதை போதுமானது. வரிசை நடவு சிறந்தது.' },
      { title: '2. உரமிடுதல்', desc: 'தொழு உரம் + அசோஸ்பைரில்லம் விதை நேர்த்தி.' },
      { title: '3. அறுவடை', desc: '90 நாட்களில் கதிர் முற்றி அறுவடைக்கு தயாராகும்.' },
    ],
    pestsAndRemedies: [
      { pest: 'பறவை தொல்லை', organicRemedy: 'பிரதிபலிக்கும் ரிப்பன் மற்றும் சத்தம் எழுப்பும் சாதனங்கள் அமைக்கவும்.', chemicalRemedy: 'ரசாயனம் தேவையில்லை.' },
    ],
  },
  {
    id: 'crop-organic-paddy',
    name: 'பாரம்பரிய இயற்கை நெல் (மாப்பிள்ளை சம்பா / கருப்பு கவுனி)',
    scientificName: 'Oryza sativa (Traditional)',
    category: 'traditional_paddy',
    tag: '👑 அதிக சந்தை மதிப்பு',
    tagColor: '#8b5cf6',
    season: 'சம்பா பருவம் (ஆகஸ்ட் - செப்டம்பர் விதைப்பு)',
    durationMonths: '140 - 150 நாட்கள்',
    soilType: 'களிமண், வண்டல் மண்',
    spacing: 'ஒற்றை நாற்று நடவு (SRI Method - 25x25 செ.மீ)',
    waterNeed: 'மிதமான நீர்',
    investmentPerAcre: '₹25,000 - ₹30,000',
    expectedIncomePerAcre: '₹80,000 - ₹1,20,000',
    profitPerAcre: '₹55,00,0 - ₹85,000',
    highlights: [
      'மருத்துவ குணம் கொண்ட பாரம்பரிய அரிசி கிலோ ₹120 - ₹180 வரை நேரடி விற்பனை',
      'இயற்கை சீற்றங்களை தாங்கி நிற்கும் திடமான தண்டு அமைப்பு',
      'வைக்கோல் அதிக ஊட்டச்சத்து நிறைந்தது, மாடுகளுக்கு மிகச் சிறந்தது',
    ],
    cultivationSteps: [
      { title: '1. நாற்றங்கால்', desc: '14-18 நாள் இளம் நாற்றுகளை ஒற்றை நாற்றாக நடவு செய்யவும்.' },
      { title: '2. இயற்கை ஊட்டச்சத்து', desc: 'ஜீவாமிர்தம் பாசன நீரில் கலந்து 15 நாட்களுக்கு ஒரு முறை பாய்ச்சவும்.' },
      { title: '3. அறுவடை', desc: 'தானியங்கள் முதிர்ந்ததும் அறுவடை இயந்திரம் மூலம் அறுத்து உலர்த்தவும்.' },
    ],
    pestsAndRemedies: [
      { pest: 'இலை சுருட்டு புழு', organicRemedy: 'வேப்ப எண்ணெய் + காதி சோப் கரைசல் தெளிக்கவும்.', chemicalRemedy: 'குளோரன்ட்ரானிலிப்ரோல்.' },
    ],
  },
];

// ─── Tamil Nadu Government Agri Schemes ───
export const AGRI_GOV_SCHEMES: AgriGovScheme[] = [
  {
    id: 'scheme-kalaignar',
    name: 'Kalaignar All Village Integrated Agri Scheme',
    tamilName: 'கலைஞர் அனைத்து கிராம ஒருங்கிணைந்த வேளாண் வளர்ச்சித் திட்டம்',
    subsidy: '100% இலவச ஆழ்துளை கிணறு, மின் மோட்டார் & தார்ப்பாய் மானியம்',
    eligibility: 'தமிழகத்தின் அனைத்து கிராம பஞ்சாயத்து சிறு/குறு விவசாயிகள்',
    requiredDocuments: ['ஆதார் அட்டை', 'பட்டா/சிட்டா நகல்', 'வங்கி கணக்கு புத்தகம்', 'சிறு/குறு விவசாயி சான்றிதழ்'],
    applicationPortal: 'உழவன் செயலி (Uzhavan App) / வட்டார வேளாண் விரிவாக்க மையம்',
    portalUrl: 'https://www.tnagrisnet.tn.gov.in',
    contactHelpline: '1800-180-1551 (உழவர் உதவி எண்)',
  },
  {
    id: 'scheme-drip',
    name: 'PMKSY Micro Irrigation Scheme',
    tamilName: 'பிரதம மந்திரி நுண்ணீர் பாசன திட்டம் (சொட்டு நீர் / தெளிப்பு நீர்)',
    subsidy: 'சிறு, குறு விவசாயிகளுக்கு 100% மானியம்; இதர விவசாயிகளுக்கு 75% மானியம்',
    eligibility: 'பாசன வசதியுள்ள சொந்த நிலம் கொண்ட அனைத்து விவசாயிகள்',
    requiredDocuments: ['நில ஆவணங்கள் (FMB, அடங்கல்)', 'ஆதார் அட்டை', 'மண் & நீர் பரிசோதனை அறிக்கை', 'புகைப்படம்'],
    applicationPortal: 'horticulture.tn.gov.in / தோட்டக்கலைத் துறை',
    portalUrl: 'https://tnhorticulture.tn.gov.in',
    contactHelpline: '044-28524455',
  },
  {
    id: 'scheme-pmkisan',
    name: 'PM-KISAN Samman Nidhi',
    tamilName: 'பி.எம் கிசான் உழவர் கௌரவ நிதி (ஆண்டுக்கு ₹6,000)',
    subsidy: 'ஆண்டுதோறும் 3 தவணைகளில் ₹2,000 வீதம் நேரடி வங்கி வரவு',
    eligibility: 'சாகுபடி செய்யக்கூடிய நிலம் வைத்துள்ள உழவர் குடும்பங்கள்',
    requiredDocuments: ['ஆதார் அட்டை', 'நில பட்டா நகல்', 'ஆதார் இணைக்கப்பட்ட வங்கிக் கணக்கு'],
    applicationPortal: 'pmkisan.gov.in / இ-சேவை மையம்',
    portalUrl: 'https://pmkisan.gov.in',
    contactHelpline: '155261 / 011-24300606',
  },
  {
    id: 'scheme-crop-insurance',
    name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    tamilName: 'பயிர் காப்பீட்டுத் திட்டம் (இயற்கை சீற்ற இழப்பீடு)',
    subsidy: 'விவசாயி பிரீமியம் வெறும் 1.5% முதல் 2% மட்டுமே; மீதமுள்ளதை அரசே செலுத்தும்',
    eligibility: 'அறிவிக்கப்பட்ட பயிர்களை சாகுபடி செய்யும் அனைத்து விவசாயிகள்',
    requiredDocuments: ['முன்மொழிவு படிவம்', 'அடங்கல் / விதைப்பு சான்று', 'பட்டா/சிட்டா', 'வங்கிக் கணக்கு'],
    applicationPortal: 'இ-சேவை மையம் / தொடக்க வேளாண் கூட்டுறவு சங்கம்',
    portalUrl: 'https://pmfby.gov.in',
    contactHelpline: '1800-200-5142',
  },
];

// ─── Agri AI Prompt Presets for Farmers ───
export const AGRI_AI_PRESETS = [
  {
    id: 'preset-dragon-profit',
    title: 'டிராகன் ஃப்ரூட் லாபம்',
    query: '1 ஏக்கர் டிராகன் ஃப்ரூட் சாகுபடியில் முதல் 3 ஆண்டுகள் ஆகும் செலவு மற்றும் நிகர லாபம் என்ன?',
    icon: 'Sparkles',
  },
  {
    id: 'preset-organic-pest',
    title: 'இயற்கை பூச்சி விரட்டி',
    query: 'செலவில்லாமல் பயிர்களில் வரும் இலை சுருட்டு புழு மற்றும் மாவுப்பூச்சியை கட்டுப்படுத்த 5 இலை கரைசல் தயாரிக்கும் முறை என்ன?',
    icon: 'Leaf',
  },
  {
    id: 'preset-paddy-yellowing',
    title: 'நெல் இலை மஞ்சள் நிறம்',
    query: 'நெல் பயிரில் இலைகள் நுனியில் இருந்து மஞ்சள் நிறமாக மாறுகிறது. இது துங்ரோ நோயா அல்லது துத்தநாக குறைபாடா? என்ன மருந்து தெளிக்க வேண்டும்?',
    icon: 'ShieldAlert',
  },
  {
    id: 'preset-coconut-yield',
    title: 'தென்னை காய் திரட்சி',
    query: 'தென்னை மரத்தில் குரும்பை உதிர்வதை தடுத்து, தேங்காய் பெரிய அளவில் திரட்சியாக காய்ப்பதற்கு கொடுக்க வேண்டிய நுண்ணூட்ட உரம் என்ன?',
    icon: 'Droplets',
  },
  {
    id: 'preset-kalaignar-scheme',
    title: 'ஆழ்துளை கிணறு மானியம்',
    query: 'கலைஞர் அனைத்து கிராம ஒருங்கிணைந்த வேளாண் வளர்ச்சி திட்டத்தில் இலவச ஆழ்துளை கிணறு மற்றும் மின் இணைப்பு பெற தேவையான தகுதிகள் என்ன?',
    icon: 'Award',
  },
];

export const AgriService = {
  /**
   * Fetch all agri videos (from Supabase unified_master_data if available, with offline fallback)
   */
  async getAgriVideos(): Promise<AgriMediaItem[]> {
    try {
      const { data, error } = await supabase
        .from('unified_master_data')
        .select('*')
        .eq('item_type', 'AGRI_MEDIA')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return INITIAL_AGRI_VIDEOS;
      }

      const dynamicList: AgriMediaItem[] = data.map((item: any) => ({
        id: item.id,
        title: item.title_name || '',
        description: item.description_purpose || '',
        source: item.additional_info?.source || 'youtube',
        videoId: item.additional_info?.videoId,
        url: item.links_data || item.additional_info?.url || '',
        thumbnail: item.additional_info?.thumbnail || 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80',
        duration: item.additional_info?.duration || '10:00',
        category: item.category || 'crop_guide',
        author: item.additional_info?.author || 'SuprO Admin',
        publishedAt: 'சமீபத்தியது',
        isFeatured: item.additional_info?.isFeatured || false,
      }));

      return [...dynamicList, ...INITIAL_AGRI_VIDEOS];
    } catch (e) {
      return INITIAL_AGRI_VIDEOS;
    }
  },

  /**
   * Load saved daily tasks completion state
   */
  async getDailyTasks(): Promise<AgriDailyTask[]> {
    try {
      const raw = await SecureStore.getItemAsync(STORAGE_KEY_TASKS);
      if (!raw) return INITIAL_DAILY_TASKS;
      const savedMap = JSON.parse(raw); // { [id]: boolean }
      return INITIAL_DAILY_TASKS.map(t => ({
        ...t,
        isCompleted: !!savedMap[t.id],
      }));
    } catch (e) {
      return INITIAL_DAILY_TASKS;
    }
  },

  /**
   * Toggle task completion and persist in SecureStore
   */
  async toggleTaskCompletion(taskId: string, currentStatus: boolean): Promise<AgriDailyTask[]> {
    try {
      const raw = await SecureStore.getItemAsync(STORAGE_KEY_TASKS);
      const savedMap = raw ? JSON.parse(raw) : {};
      savedMap[taskId] = !currentStatus;
      await SecureStore.setItemAsync(STORAGE_KEY_TASKS, JSON.stringify(savedMap));
      return this.getDailyTasks();
    } catch (e) {
      return INITIAL_DAILY_TASKS;
    }
  },

  /**
   * Get all crop guides
   */
  getCropGuides(): AgriCropGuide[] {
    return AGRI_CROP_GUIDES;
  },

  /**
   * Get all Tamil Nadu government schemes
   */
  getGovSchemes(): AgriGovScheme[] {
    return AGRI_GOV_SCHEMES;
  },

  /**
   * Get Agri AI Prompt Presets
   */
  getAIPresets() {
    return AGRI_AI_PRESETS;
  },
};
