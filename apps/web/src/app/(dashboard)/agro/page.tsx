'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Tv,
  CalendarCheck,
  Leaf,
  Bot,
  Award,
  Sparkles,
  Tractor,
  Play,
  Share2,
  CheckCircle2,
  Circle,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Droplets,
  FlaskConical,
  PhoneCall,
  Send,
  Loader2,
  X,
  Wrench,
  Clock,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { createClient } from '@/lib/supabase/client';

type TabType = 'tv' | 'tasks' | 'crops' | 'ai_tools' | 'schemes';
type AIToolSubMode = 'doctor' | 'fertilizer' | 'irrigation' | 'general';

interface VideoItem {
  id: string;
  title: string;
  description: string;
  source: 'youtube' | 'facebook' | 'web';
  videoId?: string;
  url: string;
  thumbnail: string;
  duration?: string;
  category: string;
  author: string;
  publishedAt: string;
  isFeatured?: boolean;
}

const PRELOADED_VIDEOS: VideoItem[] = [
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
];

const PRELOADED_TASKS = [
  {
    id: 'task-1',
    title: 'விதை நேர்த்தி & நாற்று நடும் முன் தயாரிப்பு',
    category: 'sowing',
    stage: 'ஆரம்ப நிலை (0-15 நாட்கள்)',
    timing: 'காலை 6:00 - 8:30',
    details: 'சூடோமோனாஸ் அல்லது பஞ்சகாவ்யா கரைசலில் விதைகளை 30 நிமிடம் ஊற வைத்து விதைக்கவும்.',
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
    details: 'பயிர்களில் 80-85% தானியங்கள் பொன்னிறமாக மாறியவுடன் RentO மூலம் அறுவடை இயந்திரம் பதிவு செய்யவும்.',
    tips: 'ஈரப்பதம் 14% குறைவாக இருக்கும்போது அறுவடை செய்யவும்.',
  },
];

const PRELOADED_CROPS = [
  {
    id: 'crop-dragon',
    name: 'டிராகன் ஃப்ரூட் (Dragon Fruit)',
    scientificName: 'Hylocereus undatus',
    tag: '⭐ அதிக லாபம்',
    tagColor: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    duration: '25 ஆண்டுகள் பலன்',
    water: 'குறைந்த நீர்',
    profit: '₹6,00,000 - ₹8,00,000 / ஏக்கர்',
    highlights: [
      'குறைந்த நீரில் வறண்ட நிலத்திலும் வளரும்',
      'ஒரு முறை நட்டால் 20-25 ஆண்டுகள் வரை தொடர் வருமானம்',
      'கிலோ ₹100 - ₹180 வரை நேரடி விற்பனை விலை',
    ],
  },
  {
    id: 'crop-moringa',
    name: 'நாட்டு முருங்கை (ODC Moringa)',
    scientificName: 'Moringa oleifera',
    tag: '⚡ 6 மாதத்தில் வருமானம்',
    tagColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    duration: '6 மாதத்தில் அறுவடை',
    water: 'குறைந்த நீர்',
    profit: '₹2,00,000+ / ஆண்டு',
    highlights: [
      '6வது மாதத்தில் இருந்து தொடர்ந்து 2 ஆண்டுகள் காய் காய்க்கும்',
      'முருங்கை இலை பொடிக்கு வெளிநாட்டு ஏற்றுமதி தேவை அதிகம்',
      'வறட்சியை தாங்கி செழித்து வளரும்',
    ],
  },
  {
    id: 'crop-millets',
    name: 'பாரம்பரிய சிறுதானியங்கள் (Millets)',
    scientificName: 'Eleusine coracana / Setaria italica',
    tag: '🌾 குறைந்த உழைப்பு',
    tagColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    duration: '80 - 100 நாட்கள்',
    water: 'குறைந்த நீர்',
    profit: '₹40,000 - ₹55,000 / ஏக்கர்',
    highlights: [
      'பூச்சி மருந்து தேவையில்லாத இயற்கை பயிர்',
      'அரசு கொள்முதல் மற்றும் ரேஷன் விநியோகத்தில் முன்னுரிமை',
      'மதிப்புக்கூட்டி விற்பனை செய்தால் 3 மடங்கு கூடுதல் லாபம்',
    ],
  },
  {
    id: 'crop-organic-paddy',
    name: 'பாரம்பரிய இயற்கை நெல் (மாப்பிள்ளை சம்பா / கவுனி)',
    scientificName: 'Oryza sativa (Traditional)',
    tag: '👑 அதிக சந்தை மதிப்பு',
    tagColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    duration: '140 - 150 நாட்கள்',
    water: 'மிதமான நீர்',
    profit: '₹55,000 - ₹85,000 / ஏக்கர்',
    highlights: [
      'மருத்துவ குணம் கொண்ட பாரம்பரிய அரிசி கிலோ ₹120 - ₹180 வரை நேரடி விற்பனை',
      'இயற்கை சீற்றங்களை தாங்கி நிற்கும் திடமான தண்டு அமைப்பு',
    ],
  },
];

const PRELOADED_SCHEMES = [
  {
    id: 'scheme-kalaignar',
    title: 'கலைஞர் அனைத்து கிராம ஒருங்கிணைந்த வேளாண் வளர்ச்சித் திட்டம்',
    subsidy: '100% இலவச ஆழ்துளை கிணறு, மின் மோட்டார் & தார்ப்பாய் மானியம்',
    eligibility: 'தமிழகத்தின் அனைத்து கிராம பஞ்சாயத்து சிறு/குறு விவசாயிகள்',
    helpline: '1800-180-1551 (உழவர் உதவி எண்)',
    portalUrl: 'https://www.tnagrisnet.tn.gov.in',
  },
  {
    id: 'scheme-drip',
    title: 'பிரதம மந்திரி நுண்ணீர் பாசன திட்டம் (PMKSY சொட்டு நீர்)',
    subsidy: 'சிறு, குறு விவசாயிகளுக்கு 100% மானியம்; மற்றவர்களுக்கு 75% மானியம்',
    eligibility: 'பாசன வசதியுள்ள சொந்த நிலம் கொண்ட அனைத்து விவசாயிகள்',
    helpline: '044-28524455 (தோட்டக்கலைத் துறை)',
    portalUrl: 'https://tnhorticulture.tn.gov.in',
  },
  {
    id: 'scheme-pmkisan',
    title: 'பி.எம் கிசான் உழவர் கௌரவ நிதி (ஆண்டுக்கு ₹6,000)',
    subsidy: 'ஆண்டுதோறும் 3 தவணைகளில் ₹2,000 வீதம் நேரடி வங்கி வரவு',
    eligibility: 'சாகுபடி செய்யக்கூடிய நிலம் வைத்துள்ள உழவர் குடும்பங்கள்',
    helpline: '155261 (PM-KISAN உதவி மையம்)',
    portalUrl: 'https://pmkisan.gov.in',
  },
];

const AI_PRESETS = [
  { title: 'டிராகன் ஃப்ரூட் லாபம்', query: '1 ஏக்கர் டிராகன் ஃப்ரூட் சாகுபடியில் முதல் 3 ஆண்டுகள் ஆகும் செலவு மற்றும் நிகர லாபம் என்ன?' },
  { title: 'இயற்கை பூச்சி விரட்டி', query: 'செலவில்லாமல் பயிர்களில் வரும் இலை சுருட்டு புழுவை கட்டுப்படுத்த 5 இலை கரைசல் தயாரிக்கும் முறை என்ன?' },
  { title: 'நெல் இலை மஞ்சள் நிறம்', query: 'நெல் பயிரில் இலைகள் நுனியில் இருந்து மஞ்சள் நிறமாக மாறுகிறது. என்ன மருந்து தெளிக்க வேண்டும்?' },
  { title: 'தென்னை காய் திரட்சி', query: 'தென்னை மரத்தில் குரும்பை உதிர்வதை தடுத்து தேங்காய் பெரிய அளவில் காய்ப்பதற்கு கொடுக்க வேண்டிய உரம் என்ன?' },
  { title: 'ஆழ்துளை கிணறு மானியம்', query: 'கலைஞர் திட்டத்தில் இலவச ஆழ்துளை கிணறு மற்றும் மின் இணைப்பு பெற தேவையான தகுதிகள் என்ன?' },
];

export default function AgroPage() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('tv');

  // Video State
  const [videos, setVideos] = useState<VideoItem[]>(PRELOADED_VIDEOS);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  // Tasks State
  const [tasks, setTasks] = useState<any[]>(PRELOADED_TASKS);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

  // AI Tools State
  const [aiToolMode, setAiToolMode] = useState<AIToolSubMode>('doctor');
  const [aiQuery, setAiQuery] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState('நெல் (Paddy)');
  const [selectedSoil, setSelectedSoil] = useState('செம்மண்');

  // Load dynamically from Supabase
  useEffect(() => {
    const fetchAgriMedia = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('unified_master_data')
          .select('*')
          .eq('item_type', 'AGRI_MEDIA')
          .order('created_at', { ascending: false });

        if (data && data.length > 0) {
          const dynamicVideos: VideoItem[] = data.map((d: any) => ({
            id: d.id,
            title: d.title_name,
            description: d.description_purpose || '',
            source: d.additional_info?.source || 'youtube',
            videoId: d.additional_info?.videoId,
            url: d.links_data || d.additional_info?.url || '',
            thumbnail: d.additional_info?.thumbnail || 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600',
            duration: d.additional_info?.duration || '10:00',
            category: d.category || 'crop_guide',
            author: d.additional_info?.author || 'SuprO Admin',
            publishedAt: 'சமீபத்தியது',
            isFeatured: d.additional_info?.isFeatured || false,
          }));
          setVideos([...dynamicVideos, ...PRELOADED_VIDEOS]);
        }
      } catch (e) {}
    };

    fetchAgriMedia();

    // Load saved tasks
    const saved = localStorage.getItem('supro-web-agri-tasks');
    if (saved) {
      try {
        setCompletedTasks(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const handleToggleTask = (taskId: string) => {
    setCompletedTasks((prev) => {
      const next = { ...prev, [taskId]: !prev[taskId] };
      localStorage.setItem('supro-web-agri-tasks', JSON.stringify(next));
      return next;
    });
  };

  const handleShareWhatsApp = (title: string, content: string) => {
    const msg = `🌾 *SuprO AgrO உழவர் வழிகாட்டி:* \n\n📌 *${title}*\n${content}\n\n📲 SuprO தளத்தை திறக்க: https://watscrm.vercel.app/agro`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleRunAi = async (customText?: string) => {
    const q = (customText || aiQuery).trim();
    if (!q && aiToolMode !== 'fertilizer' && aiToolMode !== 'irrigation') return;

    setIsAiLoading(true);
    setAiResult(null);

    // Call Cloud AI API
    try {
      const prompt = `Role: Senior Tamil Nadu Agricultural Expert and Crop Doctor.
Mode: ${aiToolMode}. Crop: ${selectedCrop}, Soil: ${selectedSoil}.
Question / Details: ${q || 'Standard recommendations'}.
Instructions: Respond in clear, respectful, practical Tamil with actionable points, organic solutions (Panchagavya, Neem oil), fertilizer dosage, and prevention tips.`;

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, language: 'Tamil' }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiResult(data.text || data.response || 'AI ஆலோசனை பெறப்பட்டது.');
      } else {
        throw new Error('Fallback to local');
      }
    } catch (e) {
      setTimeout(() => {
        if (aiToolMode === 'doctor') {
          setAiResult(
            `🌾 **பயிர் மருத்துவர் அறிக்கை (Crop Diagnostic Advice):**\n\n` +
              `🔍 **பாதிப்பு வகை**: பயிர் இலைக்கருகல் / பூஞ்சை அல்லது பூச்சி தாக்குதல்.\n\n` +
              `🌿 **இயற்கை வைத்தியம் (Organic Remedy)**:\n` +
              `• 3% வேப்பெண்ணெய் கரைசல் (10 லிட்டர் நீருக்கு 300 மிலி + காதி சோப் 10 கிராம்) தெளிக்கவும்.\n` +
              `• சூடோமோனாஸ் (Pseudomonas) 10 கிராம்/லிட்டர் நீரில் கலந்து இலைவழியாக தெளிக்கவும்.\n` +
              `• பாசன நீரில் 100 லிட்டர் ஜீவாமிர்தம் கலந்து பாய்ச்சவும்.\n\n` +
              `🧪 **பரிந்துரைக்கப்படும் மருந்து (Chemical Remedy)**:\n` +
              `• மேன்கோசெப் 2 கிராம்/லிட்டர் அல்லது காப்பர் ஆக்ஸிகுளோரைடு 2.5 கிராம்/லிட்டர்.\n\n` +
              `🛡️ **தடுப்பு முறை**: வயலில் தேங்கும் அதிகப்படியான நீரை உடனே வடிக்கவும்.`
          );
        } else if (aiToolMode === 'fertilizer') {
          setAiResult(
            `🧪 **${selectedCrop} - ${selectedSoil} உரக் கணக்கீடு (ஏக்கருக்கு):**\n\n` +
              `🌿 **அடிப்படை உரம்**: மக்கிய தொழு உரம் 5 டன் + வேப்பம் புண்ணாக்கு 100 கிலோ + DAP 50 கிலோ + பொட்டாஷ் 25 கிலோ.\n\n` +
              `⚡ **மேலுரம் (30 & 60 நாட்கள்)**: 30ம் நாள் யூரியா 25 கிலோ + ஜிங்க் சல்பேட் 10 கிலோ; 60ம் நாள் பொட்டாஷ் 25 கிலோ.\n\n` +
              `🌟 **நுண் ஊட்டச்சத்து**: 19:19:19 நீரில் கரையும் உரம் பூக்கும் பருவத்தில் இலைவழியாக தெளிக்கவும்.`
          );
        } else if (aiToolMode === 'irrigation') {
          setAiResult(
            `💧 **${selectedCrop} ஸ்மார்ட் சொட்டு நீர் பாசன வழிகாட்டி (${selectedSoil}):**\n\n` +
              `⏱️ **இயக்கும் நேரம்**: காலை 6:30 - 8:30 அல்லது மாலை 4:30 - 6:30 (ஒரு செடிக்கு தினசரி 4-8 லிட்டர் நீர்).\n\n` +
              `🌿 **நீர் சேமிப்பு**: தென்னை நார் கழிவு அல்லது சருகுகள் கொண்டு வரப்புகளில் மூடாக்கு (Mulching) அமைக்கவும்.`
          );
        } else {
          setAiResult(
            `💡 **விவசாய AI வழிகாட்டல்:**\n\n` +
              `தமிழ்நாட்டில் குறைந்த நீரில் அதிக வருமானம் தரும் **டிராகன் ஃப்ரூட்**, **நாட்டு முருங்கை**, மற்றும் **சிறுதானியங்கள்** சாகுபடி செய்வது சிறந்தது.`
          );
        }
        setIsAiLoading(false);
      }, 700);
      return;
    } finally {
      setIsAiLoading(false);
    }
  };

  const completedCount = Object.values(completedTasks).filter(Boolean).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-24">
      {/* ─── Top Banner Header ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 shadow-sm">
            🌾
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
                AgrO <span className="text-xs bg-emerald-500/20 text-emerald-400 font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">உழவர் களம்</span>
              </h1>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              தமிழ்நாடு வேளாண் வளர்ச்சி, உழவர் தொலைக்காட்சி, தினசரி பணிகள் & AI பயிர் மருத்துவர்
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <Link
            href="/rento"
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-xs rounded-xl border border-emerald-500/30 transition shadow-sm"
          >
            <Tractor className="w-4 h-4" />
            டிராக்டர் வாடகை (RentO)
          </Link>

          <Link
            href="/dealo"
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl shadow-md transition"
          >
            விவசாய சந்தை (DealO)
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* ─── Season & Advisory Strip ─── */}
      <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-emerald-300 font-medium">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>☀️ நடப்பு பருவம்: சம்பா / நவரை சாகுபடி • உழவர் உதவி எண்: 1800-180-1551</span>
        </div>
        <span className="text-muted-foreground">0% தரகு • நேரடி விவசாய வளர்ச்சி</span>
      </div>

      {/* ─── 5 Main Navigation Tabs ─── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border/80 scrollbar-none">
        {[
          { id: 'tv', label: '📺 வேளாண் டிவி & வீடியோக்கள்', icon: Tv },
          { id: 'tasks', label: `📅 தினசரி பணிகள் (${completedCount}/${tasks.length})`, icon: CalendarCheck },
          { id: 'crops', label: '🌱 புதிய பயிர்கள்', icon: Leaf },
          { id: 'ai_tools', label: '🤖 வேளாண் AI கருவிகள்', icon: Bot },
          { id: 'schemes', label: '🏛️ அரசு நலத்திட்டங்கள்', icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'bg-card text-muted-foreground hover:text-foreground hover:bg-muted border border-border'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ─── TAB 1: வேளாண் டிவி & வீடியோக்கள் (Merged TvO) ─── */}
      {activeTab === 'tv' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div
                key={video.id}
                className="bg-card border border-border hover:border-emerald-500/40 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition flex flex-col justify-between group"
              >
                {/* Thumbnail Container */}
                <div
                  className="relative aspect-video bg-black cursor-pointer overflow-hidden"
                  onClick={() => setSelectedVideo(video)}
                >
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/90 text-slate-950 flex items-center justify-center pl-1 shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition">
                      <Play className="w-5 h-5 fill-current" />
                    </div>
                  </div>
                  <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    {video.duration || 'வீடியோ'}
                  </span>
                  {video.isFeatured && (
                    <span className="absolute top-2 left-2 bg-pink-500 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow">
                      <Sparkles className="w-3 h-3" /> சிறப்பு ஒளிபரப்பு
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-extrabold text-foreground text-base leading-snug line-clamp-2">
                      {video.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{video.description}</p>
                  </div>

                  <div className="border-t border-border pt-3 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">{video.author} • {video.publishedAt}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleShareWhatsApp(video.title, video.url)}
                        className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold transition flex items-center gap-1"
                        title="Share on WhatsApp"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setSelectedVideo(video)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold transition shadow-sm flex items-center gap-1"
                      >
                        காண்க ▶
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 2: தினசரி உழவுப் பணிகள் & நாட்குறிப்பு ─── */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          {/* Progress Banner */}
          <div className="bg-card border border-emerald-500/40 rounded-3xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-extrabold text-emerald-400 text-base">இன்றைய உழவுப் பணிகள் முன்னேற்றம்</h3>
                <p className="text-xs text-muted-foreground">{completedCount} / {tasks.length} பணிகள் முடிக்கப்பட்டது</p>
              </div>
              <span className="text-2xl font-black text-emerald-400">{progressPercent}%</span>
            </div>
            <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          {/* Task Items */}
          <div className="space-y-3">
            {tasks.map((task) => {
              const isDone = !!completedTasks[task.id];
              return (
                <div
                  key={task.id}
                  onClick={() => handleToggleTask(task.id)}
                  className={`bg-card border rounded-2xl p-4 flex items-start gap-4 cursor-pointer transition shadow-sm ${
                    isDone ? 'border-emerald-500/40 opacity-70 bg-emerald-950/10' : 'border-border hover:border-emerald-500/30'
                  }`}
                >
                  <button className="mt-1 shrink-0">
                    {isDone ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <Circle className="w-6 h-6 text-muted-foreground" />
                    )}
                  </button>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {task.stage}
                      </span>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {task.timing}
                      </span>
                    </div>

                    <h4 className={`text-sm font-bold text-foreground ${isDone ? 'line-through' : ''}`}>
                      {task.title}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{task.details}</p>

                    <div className="mt-2 bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-2 text-[11px] text-emerald-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                      <span>பரிந்துரை: {task.tips}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── TAB 3: புதிய பயிர்கள் & நவீன நடவு முறைகள் ─── */}
      {activeTab === 'crops' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PRELOADED_CROPS.map((crop) => (
            <div
              key={crop.id}
              className="bg-card border border-border hover:border-emerald-500/40 rounded-3xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-black text-foreground">{crop.name}</h3>
                    <p className="text-xs text-muted-foreground italic">{crop.scientificName}</p>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${crop.tagColor}`}>
                    {crop.tag}
                  </span>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 bg-muted/50 rounded-2xl p-3 my-4 text-center">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">கால அளவு</span>
                    <span className="text-xs font-bold text-foreground">{crop.duration}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">நீர் தேவை</span>
                    <span className="text-xs font-bold text-sky-400">{crop.water}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">ஏக்கர் லாபம்</span>
                    <span className="text-xs font-bold text-emerald-400">{crop.profit}</span>
                  </div>
                </div>

                {/* Highlights */}
                <div className="space-y-1.5">
                  {crop.highlights.map((h, i) => (
                    <p key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span className="text-emerald-400 font-bold">•</span> {h}
                    </p>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-4 flex items-center justify-between">
                <button
                  onClick={() => {
                    setActiveTab('ai_tools');
                    setSelectedCrop(crop.name);
                    handleRunAi(`1 ஏக்கர் ${crop.name} சாகுபடி முறை, செலவு மற்றும் லாபம் என்ன?`);
                  }}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  AI வழிகாட்டி ஆலோசனை <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── TAB 4: வேளாண் AI கருவிகள் (Agri AI Tools Hub) ─── */}
      {activeTab === 'ai_tools' && (
        <div className="space-y-6">
          {/* Sub-mode selector pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: 'doctor', label: '🩺 AI பயிர் மருத்துவர்', icon: ShieldAlert },
              { id: 'fertilizer', label: '🧪 மண் & உரக் கணக்கீடு', icon: FlaskConical },
              { id: 'irrigation', label: '💧 பாசன வழிகாட்டி', icon: Droplets },
              { id: 'general', label: '💬 AI உழவர் அரட்டை', icon: Bot },
            ].map((m) => {
              const Icon = m.icon;
              const isSelected = aiToolMode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setAiToolMode(m.id as AIToolSubMode);
                    setAiResult(null);
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {m.label}
                </button>
              );
            })}
          </div>

          {/* Interactive AI Box */}
          <div className="bg-card border border-emerald-500/40 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <Bot className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <h3 className="font-extrabold text-foreground text-base">
                  {aiToolMode === 'doctor' && '🩺 AI பயிர் மருத்துவர் & நோய் கண்டறிதல்'}
                  {aiToolMode === 'fertilizer' && '🧪 மண் பரிசோதனை & உரத் திட்டமிடுதல்'}
                  {aiToolMode === 'irrigation' && '💧 ஸ்மார்ட் சொட்டு நீர் & பாசன கணக்கீடு'}
                  {aiToolMode === 'general' && '💬 விவசாய AI உடனடி வழிகாட்டி'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {aiToolMode === 'doctor' && 'பயிர் பாதிப்பு, இலைப்புள்ளி, புழு தாக்குதலை குறிப்பிட்டு தீர்வு பெறுக'}
                  {aiToolMode === 'fertilizer' && 'மண் வகை மற்றும் பயிருக்கு உகந்த துல்லிய NPK உர அட்டவணை'}
                  {aiToolMode === 'irrigation' && 'குறைந்த நீரில் அதிக மகசூல் பெற தேவையான பாசன நேரம் & நீர் அளவு'}
                  {aiToolMode === 'general' && 'விவசாயம் தொடர்பான எந்த கேள்வியையும் தமிழில் கேட்கலாம்'}
                </p>
              </div>
            </div>

            {/* Selectors for Fertilizer & Irrigation */}
            {(aiToolMode === 'fertilizer' || aiToolMode === 'irrigation') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-muted/40 p-3 rounded-2xl">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">பயிர்</label>
                  <select
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value)}
                    className="w-full mt-1 bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:border-emerald-500"
                  >
                    {['நெல் (Paddy)', 'வாழை (Banana)', 'கரும்பு (Sugarcane)', 'தென்னை (Coconut)', 'முருங்கை (Moringa)', 'டிராகன் ஃப்ரூட்'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">மண் வகை</label>
                  <select
                    value={selectedSoil}
                    onChange={(e) => setSelectedSoil(e.target.value)}
                    className="w-full mt-1 bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:border-emerald-500"
                  >
                    {['செம்மண்', 'கரிசல் மண்', 'வண்டல் மண்', 'மணல் பாங்கு'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Input & Action */}
            <div className="flex gap-2">
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRunAi()}
                placeholder={
                  aiToolMode === 'doctor'
                    ? 'எ.கா: நெல் இலை நுனியில் கருகல் நோய் உள்ளது என்ன மருந்து தெளிக்கலாம்?'
                    : 'கூடுதல் விவரங்களை உள்ளிடவும்...'
                }
                className="flex-1 bg-background border border-border rounded-2xl px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={() => handleRunAi()}
                disabled={isAiLoading}
                className="px-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-2xl transition shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>கேட்க</span>
              </button>
            </div>

            {/* Result Box */}
            {aiResult && (
              <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-4 text-xs leading-relaxed space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                  <span className="font-extrabold text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> AI அறிக்கை
                  </span>
                  <button
                    onClick={() => handleShareWhatsApp('விவசாய AI அறிக்கை', aiResult)}
                    className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                  >
                    <Share2 className="w-3.5 h-3.5" /> வாட்ஸ்அப்பில் பகிர்
                  </button>
                </div>
                <div className="whitespace-pre-line text-slate-200">{aiResult}</div>
              </div>
            )}
          </div>

          {/* Quick Preset Prompts */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              💡 அடிக்கடி கேட்கப்படும் உழவர் கேள்விகள்:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {AI_PRESETS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setAiQuery(p.query);
                    handleRunAi(p.query);
                  }}
                  className="bg-card border border-border hover:border-emerald-500/40 rounded-2xl p-3 text-left transition flex flex-col justify-between space-y-2 group shadow-sm"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground group-hover:text-emerald-400">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{p.title}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">{p.query}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 5: தமிழ்நாடு அரசு வேளாண் நலத்திட்டங்கள் ─── */}
      {activeTab === 'schemes' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
            🏛️ தமிழ்நாடு அரசு வேளாண் நலத்திட்டங்கள் & மானியங்கள்
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PRELOADED_SCHEMES.map((scheme) => (
              <div
                key={scheme.id}
                className="bg-card border border-border hover:border-emerald-500/40 rounded-3xl p-5 flex flex-col justify-between space-y-4 shadow-sm"
              >
                <div className="space-y-2">
                  <h4 className="font-extrabold text-foreground text-sm leading-snug">{scheme.title}</h4>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5 text-xs font-bold text-emerald-300">
                    🎁 {scheme.subsidy}
                  </div>
                  <p className="text-xs text-muted-foreground">🎯 தகுதி: {scheme.eligibility}</p>
                </div>

                <div className="border-t border-border pt-3 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                    <PhoneCall className="w-3.5 h-3.5" /> {scheme.helpline}
                  </span>
                  <Link
                    href={scheme.portalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl transition flex items-center gap-1"
                  >
                    விண்ணப்பிக்க ↗
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Video Modal Player ─── */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl space-y-4">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-sm text-foreground line-clamp-1">{selectedVideo.title}</h3>
              <button onClick={() => setSelectedVideo(null)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedVideo.videoId && (
              <div className="aspect-video w-full bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1`}
                  title={selectedVideo.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            <div className="p-4 flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground line-clamp-2">{selectedVideo.description}</p>
              <button
                onClick={() => handleShareWhatsApp(selectedVideo.title, selectedVideo.url)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shrink-0"
              >
                <Share2 className="w-3.5 h-3.5" /> பகிரவும்
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
