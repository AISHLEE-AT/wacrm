// @ts-nocheck
import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  Image,
  Linking,
  Share,
  Platform,
  Dimensions,
} from 'react-native';
import {
  Bot,
  FileText,
  Download,
  Share2,
  History as HistoryIcon,
  X,
  Settings,
  Search,
  FileSignature,
  Globe,
  Camera,
  Image as ImageIcon,
  Paperclip,
  Mic,
  Volume2,
  Trash2,
  CheckCircle,
  Copy,
  ExternalLink,
  Sparkles,
  Zap,
  HelpCircle,
  Key,
  RefreshCw,
} from 'lucide-react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import Markdown from 'react-native-markdown-display';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import ViewShot from 'react-native-view-shot';
import * as SecureStore from 'expo-secure-store';

import { AppContext } from '../context/AppContext';
import { colors } from '../lib/theme';
import { geminiToolsService, GEMINI_MODELS } from '../services/geminiToolsService';
import { historyService, HistoryItem } from '../services/historyService';
import { aishleeSupabase } from '../services/aishleeSupabase';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  {
    id: 'summarize',
    name: 'Summarize AI',
    tamil: 'சுருக்கம் AI',
    icon: FileText,
    tools: ['Text Summarizer', 'YouTube Summarizer', 'Webpage Summarizer'],
  },
  {
    id: 'agri',
    name: 'Agri & Rural',
    tamil: 'வேளாண்மை & கிராமம்',
    icon: Globe,
    tools: ['Crop Disease Analysis', 'Farming Insights'],
  },
  {
    id: 'govt',
    name: 'Govt & Citizen',
    tamil: 'அரசு & இ-சேவை',
    icon: FileSignature,
    tools: ['TN E-Sevai Chat', 'Legal Translator'],
  },
  {
    id: 'education',
    name: 'Education',
    tamil: 'கல்வி & தேர்வு',
    icon: Search,
    tools: ['Quiz Creator', 'Notes Maker'],
  },
  {
    id: 'work',
    name: 'Work & Content',
    tamil: 'வேலை & கடிதங்கள்',
    icon: Bot,
    tools: ['Email Crafter', 'Social Media Gen', 'Resume Improver'],
  },
  {
    id: 'viral',
    name: 'Viral & Social',
    tamil: 'வாட்ஸ்அப் ஸ்டேட்டஸ்',
    icon: Share2,
    tools: ['StatusO Quote Gen'],
  },
];

// Quick Tamil & English Voice Prompts
const VOICE_PRESETS = [
  {
    category: 'agri',
    tamil: 'தக்காளி இலை கருகுகிறது, என்ன மருந்து அடிக்கலாம்?',
    english: 'Tomato leaves are turning yellow with black spots. What medicine to spray?',
    tool: 'Crop Disease Analysis',
    icon: '🌾',
  },
  {
    category: 'govt',
    tamil: 'வருமான சான்றிதழ் பெற என்னென்ன ஆவணங்கள் தேவை?',
    english: 'What documents are required to apply for an Income Certificate in Tamil Nadu?',
    tool: 'TN E-Sevai Chat',
    icon: '🏛️',
  },
  {
    category: 'govt',
    tamil: 'கலைஞர் மகளிர் உரிமை தொகை ₹1000 தகுதி மற்றும் விண்ணப்பிப்பது எப்படி?',
    english: 'How to apply for Kalaignar Magalir Urimai Thogai Rs 1000 scheme?',
    tool: 'TN E-Sevai Chat',
    icon: '💰',
  },
  {
    category: 'education',
    tamil: '10-ஆம் வகுப்பு அறிவியல் பாடத்திற்கு 5 மாதிரி வினாடி வினா தயார் செய்',
    english: 'Create a 5-question science mock quiz for 10th standard',
    tool: 'Quiz Creator',
    icon: '🎓',
  },
  {
    category: 'work',
    tamil: 'மருத்துவ விடுப்புக்காக மேலாளருக்கு ஒரு முறையான கடிதம் எழுது',
    english: 'Draft a formal sick leave email to my manager for 2 days',
    tool: 'Email Crafter',
    icon: '✉️',
  },
  {
    category: 'agri',
    tamil: 'நெல் பயிரில் குருத்துப்பூச்சி தாக்குதலை கட்டுப்படுத்துவது எப்படி?',
    english: 'How to control stem borer pest in paddy crop organically?',
    tool: 'Farming Insights',
    icon: '🌾',
  },
];

// ─── DYNAMIC TOOL-SPECIFIC CONFIGURATIONS ───
const TOOL_CONFIGS: Record<string, {
  label_en: string;
  label_ta: string;
  placeholder_en: string;
  placeholder_ta: string;
  button_en: string;
  button_ta: string;
  result_title_en: string;
  result_title_ta: string;
  chips_en: string[];
  chips_ta: string[];
}> = {
  'Text Summarizer': {
    label_en: '📄 Paste Text, Paragraph, or Article to Summarize:',
    label_ta: '📄 சுருக்க வேண்டிய உரை அல்லது கட்டுரையை உள்ளிடவும்:',
    placeholder_en: 'Paste long news, research notes, or contract text here...',
    placeholder_ta: 'நீண்ட செய்திகள், குறிப்புகள் அல்லது ஆவண உரையை இங்கே ஒட்டவும்...',
    button_en: 'Generate Bullet-Point Summary',
    button_ta: 'முக்கிய குறிப்புகளாக சுருக்குக',
    result_title_en: 'Executive Summary & Key Takeaways',
    result_title_ta: 'முக்கிய சுருக்கக் குறிப்புகள்',
    chips_en: ['Summarize in 3 bullet points', 'Extract action items', 'Explain like I am 10'],
    chips_ta: ['3 முக்கிய குறிப்புகளாக சுருக்கு', 'செயல் திட்டங்களை பிரித்து கொடு', 'எளிய தமிழில் விளக்கு'],
  },
  'YouTube Summarizer': {
    label_en: '🎥 Enter YouTube Video Link or Topic:',
    label_ta: '🎥 யூடியூப் வீடியோ இணைப்பு (Link) அல்லது தலைப்பு:',
    placeholder_en: 'https://youtube.com/watch?v=... or Video title...',
    placeholder_ta: 'https://youtube.com/watch?v=... அல்லது வீடியோ தலைப்பு...',
    button_en: 'Summarize YouTube Video',
    button_ta: 'வீடியோவை சுருக்கி தருக',
    result_title_en: 'Video Breakdown & Timestamp Summary',
    result_title_ta: 'வீடியோ முழு சுருக்கம்',
    chips_en: ['Agriculture farming tech video', 'Budget 2026 economic highlights', 'TNPSC history lecture'],
    chips_ta: ['விவசாய தொழில்நுட்ப வீடியோ', 'பட்ஜெட் முக்கிய அம்சங்கள்', 'TNPSC வரலாறு பாடம்'],
  },
  'Webpage Summarizer': {
    label_en: '🌐 Enter Article / Webpage URL:',
    label_ta: '🌐 இணையதள பக்கம் அல்லது செய்தி முகவரி (URL):',
    placeholder_en: 'https://example.com/article...',
    placeholder_ta: 'https://example.com/article...',
    button_en: 'Extract & Summarize Webpage',
    button_ta: 'இணையப் பக்கத்தை சுருக்குக',
    result_title_en: 'Webpage Insights & Core Facts',
    result_title_ta: 'இணையதள செய்தி சுருக்கம்',
    chips_en: ['Tamil Nadu govt gazette link', 'Daily agri market report', 'Tech news article'],
    chips_ta: ['தமிழக அரசு செய்திக்குறிப்பு', 'தினசரி சந்தை விலை நிலவரம்', 'தொழில்நுட்ப செய்தி'],
  },
  'Crop Disease Analysis': {
    label_en: '🌾 Crop Name & Visible Disease Symptoms (Attach Photo):',
    label_ta: '🌾 பயிர் பெயர் & நோய் அறிகுறிகள் (புகைப்படம் இணைக்கவும்):',
    placeholder_en: 'e.g. Paddy stem borer, tomato leaf curling and yellow spots in Dindigul...',
    placeholder_ta: 'எ.கா: தக்காளி இலை சுருட்டல் மற்றும் இலைக்கருகல் நோய் அறிகுறிகள்...',
    button_en: 'Diagnose Crop Disease & Cure',
    button_ta: 'பயிர் நோய் கண்டறிந்து மருந்து பரிந்துரை',
    result_title_en: 'Crop Health Prescription & Organic Remedy',
    result_title_ta: 'பயிர் பாதுகாப்பு பரிந்துரை & மருந்து முறை',
    chips_en: ['Tomato yellow leaf curl virus', 'Paddy stem borer remedy', 'Banana root rot control'],
    chips_ta: ['தக்காளி இலை சுருட்டல் மருந்து', 'நெல் குருத்துப்பூச்சி கட்டுப்பாடு', 'வாழை வேர் அழுகல் தீர்வு'],
  },
  'Farming Insights': {
    label_en: '🌱 Farming Technique, Soil Type or Crop Guidance:',
    label_ta: '🌱 சாகுபடி முறை, மண் வகை அல்லது பயிர் ஆலோசனை:',
    placeholder_en: 'e.g. Drip irrigation organic yield tips for sugarcane in Erode...',
    placeholder_ta: 'எ.கா: சொட்டுநீர் பாசனத்தில் கரும்பு மகசூல் அதிகரிக்கும் வழிகள்...',
    button_en: 'Fetch High-Yield Agri Insights',
    button_ta: 'சாகுபடி ஆலோசனைகளைப் பெறுக',
    result_title_en: 'Agricultural Advisory & Best Practices',
    result_title_ta: 'விவசாய மகசூல் & மேலாண்மை வழிகாட்டி',
    chips_en: ['Organic fertilizer dosage', 'Soil testing benefits', 'Intercropping with coconut'],
    chips_ta: ['இயற்கை உரமிடும் அளவு', 'மண் பரிசோதனை முறைகள்', 'தென்னையில் ஊடுபயிர் சாகுபடி'],
  },
  'TN E-Sevai Chat': {
    label_en: '🏛️ Government Certificate / Scheme Inquiry:',
    label_ta: '🏛️ அரசு சான்றிதழ் / நலத்திட்ட விவரங்களை கேட்கவும்:',
    placeholder_en: 'e.g. Documents required for Patta Chitta transfer or Community Certificate...',
    placeholder_ta: 'எ.கா: பட்டா சிட்டா பெயர் மாற்றம் செய்ய தேவையான ஆவணங்கள் என்னென்ன?...',
    button_en: 'Get E-Sevai & Scheme Steps',
    button_ta: 'இ-சேவை விண்ணப்ப வழிமுறைகள் பெறுக',
    result_title_en: 'Government Service Application Guide',
    result_title_ta: 'அரசு சேவை விண்ணப்ப வழிகாட்டி',
    chips_en: ['Patta Chitta online apply', 'Income certificate documents', 'Kalaignar Magalir Urimai Thogai'],
    chips_ta: ['பட்டா பெயர் மாற்றம் முறை', 'வருமான சான்றிதழ் ஆவணங்கள்', 'கலைஞர் மகளிர் உரிமை தொகை ₹1000'],
  },
  'Legal Translator': {
    label_en: '⚖️ Legal Document / Land Agreement to Translate:',
    label_ta: '⚖️ மொழிபெயர்க்க வேண்டிய சட்ட / பத்திர ஆவணம்:',
    placeholder_en: 'e.g. Lease agreement or rental deed clauses in English/Tamil...',
    placeholder_ta: 'எ.கா: நில குத்தகை பத்திரம் அல்லது வாடகை ஒப்பந்த வாசகங்கள்...',
    button_en: 'Translate & Simplify Legal Terms',
    button_ta: 'சட்ட ஆவணத்தை மொழிபெயர்க்க',
    result_title_en: 'Certified Bilingual Legal Translation',
    result_title_ta: 'தெளிவான சட்ட மொழிபெயர்ப்பு & விளக்கம்',
    chips_en: ['Rental agreement deed', 'Land sale agreement clause', 'Power of attorney terms'],
    chips_ta: ['வாடகை ஒப்பந்த பத்திரம்', 'நில விற்பனை ஒப்பந்த வாசகம்', 'பொது அதிகார பத்திரம்'],
  },
  'Quiz Creator': {
    label_en: '🎓 Subject, Standard / Exam & Topic for Mock Quiz:',
    label_ta: '🎓 வினாடி வினாவுக்கான பாடம், வகுப்பு & தலைப்பு:',
    placeholder_en: 'e.g. 10th Standard Science Physics Electricity or TNPSC Group 4 History...',
    placeholder_ta: 'எ.கா: 10-ஆம் வகுப்பு அறிவியல் மின்சாரம் அல்லது TNPSC வரலாறு மாதிரி தேர்வு...',
    button_en: 'Generate Interactive Mock Quiz',
    button_ta: 'மாதிரி வினாடி வினா உருவாக்குக',
    result_title_en: 'Exam-Ready MCQs with Answer Key',
    result_title_ta: 'வினா விடை & விரிவான விளக்கங்கள்',
    chips_en: ['TNPSC Group 4 Tamil literature', '10th Maths algebra formulas', '12th Biology genetics'],
    chips_ta: ['TNPSC தமிழ் இலக்கியம்', '10-ஆம் வகுப்பு கணிதம் சூத்திரங்கள்', '12-ஆம் வகுப்பு உயிரியல் மரபியல்'],
  },
  'Notes Maker': {
    label_en: '📚 Topic or Lesson to Generate Revision Notes:',
    label_ta: '📚 திருப்புதல் குறிப்புகள் தேவைப்படும் பாடம் / தலைப்பு:',
    placeholder_en: 'e.g. Photosynthesis chapter with diagram notes & formulas...',
    placeholder_ta: 'எ.கா: ஒளிச்சேர்க்கை பாடம் சுருக்கக் குறிப்புகள் மற்றும் முக்கிய வினாக்கள்...',
    button_en: 'Generate Study Revision Notes',
    button_ta: 'படிப்பு குறிப்புகள் உருவாக்குக',
    result_title_en: 'Structured Study Material & Cheat-Sheet',
    result_title_ta: 'எளிதான படிப்பு குறிப்புகள் & நினைவூட்டல்',
    chips_en: ['Important formulas cheat sheet', '2-mark questions & answers', 'Flowchart study notes'],
    chips_ta: ['முக்கிய சூத்திரங்கள் அட்டவணை', '2 மதிப்பெண் வினா விடைகள்', 'கருத்து வரைபடக் குறிப்புகள்'],
  },
  'Email Crafter': {
    label_en: '✉️ Purpose & Recipient for Formal Email / Letter:',
    label_ta: '✉️ கடிதம் / மின்னஞ்சல் நோக்கம் மற்றும் பெறுநர் விவரம்:',
    placeholder_en: 'e.g. Formal leave letter to school principal for 3 days due to fever...',
    placeholder_ta: 'எ.கா: உடல்நலக்குறைவு காரணமாக 3 நாட்கள் விடுப்பு கோரி மேலாளருக்கு கடிதம்...',
    button_en: 'Draft Professional Letter / Email',
    button_ta: 'முறையான கடிதம் / மின்னஞ்சல் எழுதுக',
    result_title_en: 'Professional Email / Letter Draft',
    result_title_ta: 'முறையான கடித வரைவு',
    chips_en: ['Sick leave to manager for 2 days', 'Job application cover letter', 'Bank loan request letter'],
    chips_ta: ['2 நாள் மருத்துவ விடுப்பு கடிதம்', 'வேலை விண்ணப்ப முகப்புக் கடிதம்', 'வங்கி கடன் கோரிக்கை கடிதம்'],
  },
  'Social Media Gen': {
    label_en: '📢 Product, Business Offer or Campaign Details:',
    label_ta: '📢 விளம்பரம் செய்ய வேண்டிய தொழில், சலுகை அல்லது பொருள் விவரம்:',
    placeholder_en: 'e.g. 20% festive discount on organic cold-pressed sesame oil in Salem...',
    placeholder_ta: 'எ.கா: இயற்கை நல்லெண்ணெய் 20% பொங்கல் சலுகை வாட்ஸ்அப் விளம்பரம்...',
    button_en: 'Generate Viral Marketing Posts',
    button_ta: 'ஈர்க்கும் விளம்பரப் பதிவுகளை உருவாக்குக',
    result_title_en: 'Social Media & WhatsApp Ad Copy',
    result_title_ta: 'சமூக வலைதள விளம்பர வாசகங்கள்',
    chips_en: ['WhatsApp business offer broadcast', 'Instagram viral reel caption', 'Festival discount greeting'],
    chips_ta: ['வாட்ஸ்அப் தொழில் சலுகை செய்தி', 'இன்ஸ்டாகிராம் ரீல்ஸ் வாசகம்', 'பண்டிகை கால தள்ளுபடி பதிவு'],
  },
  'Resume Improver': {
    label_en: '💼 Career Role, Experience & Skill Details:',
    label_ta: '💼 உங்கள் தொழில் தகுதி, அனுபவம் & திறன்கள்:',
    placeholder_en: 'e.g. 3 years experience as Agri Tractor Driver & Mechanic in Trichy...',
    placeholder_ta: 'எ.கா: 3 வருட டிராக்டர் ஓட்டுநர் மற்றும் மெக்கானிக் அனுபவத்திற்கான பயோடேட்டா...',
    button_en: 'Create Professional Resume / Bio-Data',
    button_ta: 'தொழில்முறை பயோடேட்டா உருவாக்குக',
    result_title_en: 'Job-Winning Resume & Skills Highlight',
    result_title_ta: 'முழுமையான பயோடேட்டா & தகுதிப்பட்டியல்',
    chips_en: ['Driver & Transport Operator CV', 'Agri Sales Representative CV', 'Fresh Graduate Bio-Data'],
    chips_ta: ['ஓட்டுநர் பயோடேட்டா', 'விவசாய விற்பனை பிரதிநிதி CV', 'புதிய பட்டதாரி பயோடேட்டா'],
  },
  'StatusO Quote Gen': {
    label_en: '✨ Theme or Mood for Status Quote (Image & Text):',
    label_ta: '✨ ஸ்டேட்டஸ் தத்துவம் / வரிகள் தலைப்பு:',
    placeholder_en: 'e.g. Hard work, motivation, mother love, farmer pride...',
    placeholder_ta: 'எ.கா: உழைப்பு, தன்னம்பிக்கை, தாய் பாசம், விவசாய பெருமை...',
    button_en: 'Generate Visual Status Quote',
    button_ta: 'ஸ்டேட்டஸ் தத்துவம் & படம் உருவாக்குக',
    result_title_en: 'StatusO Card & Poetic Lines',
    result_title_ta: 'வாட்ஸ்அப் ஸ்டேட்டஸ் கார்டு & கவிதை வரிகள்',
    chips_en: ['Farmer pride & hard work', 'Morning positive energy', 'Friendship & loyalty'],
    chips_ta: ['விவசாய உழைப்பு பெருமை', 'காலை நேர தன்னம்பிக்கை', 'உண்மையான நட்பு தத்துவம்'],
  },
};

export default function AishleeToolsScreen({ navigation }: any) {
  const { geminiApiKey: contextKey, setGeminiApiKey, user, themeMode, themeVer } = useContext(AppContext);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [activeTool, setActiveTool] = useState(CATEGORIES[0].tools[0]);
  const [language, setLanguage] = useState<'Tamil' | 'English'>('Tamil');

  // Input ref for auto-focusing on voice trigger
  const inputRef = useRef<TextInput>(null);
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  // API Key State
  const [apiKey, setApiKey] = useState(contextKey || '');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [testingKey, setTestingKey] = useState(false);

  // Standard Inputs
  const [input, setInput] = useState('');

  // Quiz specific inputs
  const [quizNumQuestions, setQuizNumQuestions] = useState(5);
  const [quizDifficulty, setQuizDifficulty] = useState('Medium');

  // Media inputs
  const [attachment, setAttachment] = useState<{
    uri: string;
    base64: string;
    mimeType: string;
    name: string;
  } | null>(null);

  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  // Voice Assistant Modal (Kural AI)
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [voiceQuery, setVoiceQuery] = useState('');

  // Status Image Gen (StatusO)
  const viewShotRef = useRef<any>(null);

  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);

  useEffect(() => {
    if (contextKey && !apiKey) {
      setApiKey(contextKey);
    }
  }, [contextKey]);

  useEffect(() => {
    loadHistory();
  }, [showHistory]);

  const loadHistory = async () => {
    const items = await historyService.getHistory();
    setHistoryData(historyService.getGroupedHistory(items));
  };

  const resetInputs = () => {
    setInput('');
    setAttachment(null);
    setOutput('');
  };

  const handleSaveApiKey = async () => {
    try {
      await SecureStore.setItemAsync('gemini-api-key', apiKey.trim());
      if (setGeminiApiKey) {
        setGeminiApiKey(apiKey.trim());
      }
      Alert.alert('Saved', 'Gemini API Key saved successfully! 🎉');
      setShowSettingsModal(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to save API key.');
    }
  };

  const handleTestApiKey = async () => {
    if (!apiKey.trim()) {
      return Alert.alert('Notice', 'Please paste your Gemini API Key first.');
    }
    setTestingKey(true);
    const res = await geminiToolsService.testApiKey(apiKey.trim());
    setTestingKey(false);
    if (res.success) {
      Alert.alert('API Key Valid', res.message);
    } else {
      Alert.alert('API Key Error', res.message);
    }
  };

  const handlePickLiveCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      return Alert.alert('Permission Denied', 'Camera permission is required to capture photos.');
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.6,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setAttachment({
        uri: result.assets[0].uri,
        base64: result.assets[0].base64,
        mimeType: result.assets[0].mimeType || 'image/jpeg',
        name: 'Camera Photo Capture.jpg',
      });
    }
  };

  const handlePickGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.6,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setAttachment({
        uri: result.assets[0].uri,
        base64: result.assets[0].base64,
        mimeType: result.assets[0].mimeType || 'image/jpeg',
        name: result.assets[0].fileName || 'Selected Image.jpg',
      });
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/plain', 'application/msword'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const fileUri = result.assets[0].uri;
        const base64 = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        setAttachment({
          uri: fileUri,
          base64: base64,
          mimeType: result.assets[0].mimeType || 'application/pdf',
          name: result.assets[0].name,
        });
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to read document');
    }
  };

  const handleTriggerVoiceInput = () => {
    setIsVoiceActive(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleSelectVoicePreset = (preset: any, runImmediately: boolean = false) => {
    const targetTool = preset.tool;
    // Find category for this tool
    const cat = CATEGORIES.find((c) => c.tools.includes(targetTool)) || activeCategory;
    setActiveCategory(cat);
    setActiveTool(targetTool);
    const chosenPrompt = language === 'Tamil' ? preset.tamil : preset.english;
    setInput(chosenPrompt);
    setShowVoiceModal(false);
    setIsVoiceActive(false);

    if (runImmediately) {
      setTimeout(() => {
        handleGenerate(chosenPrompt, targetTool);
      }, 150);
    } else {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleApplyVoiceQuery = (runImmediately: boolean = false) => {
    if (!voiceQuery.trim()) {
      return Alert.alert(
        language === 'Tamil' ? 'குரல் உள்ளீடு' : 'Voice Input',
        language === 'Tamil'
          ? 'தயவுசெய்து உங்கள் கீபோர்டில் உள்ள மைக் 🎙️ ஐகானைப் பயன்படுத்தி பேசவும் அல்லது மேலே உள்ள வினாக்களைத் தொடவும்.'
          : 'Please speak using your keyboard microphone 🎙️ or tap one of the quick prompt cards above.'
      );
    }
    const query = voiceQuery.trim();
    setInput(query);
    setVoiceQuery('');
    setShowVoiceModal(false);

    if (runImmediately) {
      setTimeout(() => {
        handleGenerate(query);
      }, 150);
    } else {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleGenerate = async (customPrompt?: string, overrideTool?: string) => {
    const promptToUse = typeof customPrompt === 'string' ? customPrompt : input;
    const toolToUse = overrideTool || activeTool;

    if (!promptToUse.trim() && !attachment) {
      return Alert.alert(
        language === 'Tamil' ? 'உள்ளீடு தேவை' : 'Input Required',
        language === 'Tamil'
          ? 'தயவுசெய்து ஒரு உரை, கேள்வி அல்லது ஆவணத்தை உள்ளிடவும்.'
          : 'Please enter some text, a question, or attach a photo/document.'
      );
    }

    setLoading(true);
    setOutput('');
    setIsVoiceActive(false);

    try {
      let result: { text: string; error?: string } = { text: '', error: '' };
      const attachList = attachment ? [attachment] : [];
      const effectiveKey = apiKey || contextKey || '';

      if (toolToUse === 'Quiz Creator') {
        const quizRes = await geminiToolsService.generateAndSaveQuiz(
          promptToUse,
          quizNumQuestions,
          quizDifficulty,
          effectiveKey,
          language,
          attachList
        );

        if (quizRes.error) {
          result.error = quizRes.error;
        } else {
          // Success! We have the JSON data.
          if (user?.isAdmin) {
            const { error: dbErr } = await aishleeSupabase.from('unified_master_data').insert({
              item_type: 'o_test',
              title_name: 'AI Generated: ' + (promptToUse.substring(0, 30) || 'Quiz'),
              description_purpose: `A ${quizDifficulty} difficulty quiz generated by SuprO AI.`,
              additional_info: { questions: quizRes.data },
            });
            if (dbErr) console.warn('TestO cloud insert notice:', dbErr);
            Alert.alert('Success', 'Mock Exam generated and saved publicly to TestO!');
            result.text = `### 🎓 வினாடி வினா உருவாக்கப்பட்டது (Quiz Generated)!\n\n**${quizNumQuestions} கேள்விகள்** வெற்றிகரமாக உருவாக்கப்பட்டு சேமிக்கப்பட்டது.\n\nநீங்கள் இப்போது TestO தேர்வு பிரிவில் இதை எழுதலாம்.`;
          } else {
            result.text = `### 🎓 வினாடி வினா வெற்றிகரமாக உருவாக்கப்பட்டது!\n\n**${quizNumQuestions} கேள்விகள்** தயாராக உள்ளன. உடனடியாக விளையாட கீழே உள்ள பொத்தானைத் தொடவும்.`;

            await historyService.saveItem({
              tool: 'Quiz Creator Payload',
              query: promptToUse,
              result: JSON.stringify(quizRes.data),
              language,
            });

            Alert.alert(
              'Mock Exam Ready! 🎯',
              `${quizNumQuestions} ${quizDifficulty} questions generated. Would you like to start the test now?`,
              [
                {
                  text: 'Start Test Now (தேர்வை தொடங்கு)',
                  onPress: () =>
                    navigation.navigate('TestOExamScreen', {
                      testId: 'local',
                      title: 'My AI Quiz (' + (promptToUse.substring(0, 20) || 'AI Exam') + ')',
                      localQuestions: quizRes.data,
                    }),
                },
                { text: 'Later', style: 'cancel' },
              ]
            );
          }
        }
      } else {
        switch (toolToUse) {
          case 'StatusO Quote Gen':
            result = await geminiToolsService.statusQuoteGen(promptToUse, 'Viral Status', effectiveKey);
            break;
          case 'YouTube Summarizer':
            result = await geminiToolsService.summarizeYouTube(promptToUse, effectiveKey, language);
            break;
          case 'Webpage Summarizer':
            result = await geminiToolsService.summarizeWebpage(promptToUse, effectiveKey, language);
            break;
          case 'Text Summarizer':
            result = await geminiToolsService.summarizeText(promptToUse, effectiveKey, language, attachList);
            break;
          case 'Crop Disease Analysis':
            result = await geminiToolsService.analyzeCrop(promptToUse, effectiveKey, language, attachList);
            break;
          case 'Farming Insights':
            result = await geminiToolsService.farmingInsights(promptToUse, effectiveKey, language);
            break;
          case 'TN E-Sevai Chat':
            result = await geminiToolsService.eSevaiChat(promptToUse, effectiveKey, language);
            break;
          case 'Legal Translator':
            result = await geminiToolsService.legalTranslator(promptToUse, effectiveKey, language);
            break;
          case 'Notes Maker':
            result = await geminiToolsService.makeNotes(promptToUse, effectiveKey, language, attachList);
            break;
          case 'Email Crafter':
            result = await geminiToolsService.craftEmail(promptToUse, effectiveKey, language);
            break;
          case 'Social Media Gen':
            result = await geminiToolsService.socialMediaGen(promptToUse, effectiveKey, language);
            break;
          case 'Resume Improver':
            result = await geminiToolsService.improveResume(promptToUse, effectiveKey, language);
            break;
          default:
            result = await geminiToolsService.summarizeText(promptToUse, effectiveKey, language, attachList);
        }
      }

      if (result.error) {
        if (result.error.toLowerCase().includes('api key')) {
          Alert.alert(
            'Gemini API Key Required 🔑',
            result.error,
            [
              { text: 'Add API Key ⚙️', onPress: () => setShowSettingsModal(true) },
              { text: 'Get Free Key 🌐', onPress: () => Linking.openURL('https://aistudio.google.com/app/apikey') },
              { text: 'Cancel', style: 'cancel' }
            ]
          );
        } else {
          Alert.alert('AI Notice', result.error);
        }
      } else if (result.text) {
        setOutput(result.text);
        if (activeTool !== 'Quiz Creator') {
          await historyService.saveItem({
            tool: activeTool,
            query: input || (attachment ? `Attached: ${attachment.name}` : 'AI Query'),
            result: result.text,
            language,
          });
        }
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not complete AI generation.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!output) return;
    try {
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #1f2937; line-height: 1.6; }
              .header { border-bottom: 2px solid #10b981; padding-bottom: 16px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; }
              .logo { font-size: 24px; font-weight: bold; color: #10b981; }
              .sublogo { font-size: 13px; color: #64748b; }
              .title { font-size: 20px; font-weight: bold; margin-bottom: 16px; color: #0f172a; }
              .content { font-size: 14px; white-space: pre-wrap; background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; }
              .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <div class="logo">SuprO AI Hub</div>
                <div class="sublogo">Tool: ${activeTool} • Language: ${language}</div>
              </div>
              <div style="text-align: right; font-size: 12px; color: #64748b;">
                Date: ${new Date().toLocaleDateString('en-IN')}<br/>
                Time: ${new Date().toLocaleTimeString('en-IN')}
              </div>
            </div>
            <div class="title">${activeTool} Report</div>
            <div class="content">${output.replace(/\\n/g, '<br/>')}</div>
            <div class="footer">Generated securely via SuprO Tamil Nadu Mobile Platform</div>
          </body>
        </html>
      `;
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      } else {
        Alert.alert('Notice', 'PDF saved to ' + uri);
      }
    } catch (e: any) {
      Alert.alert('PDF Error', e.message);
    }
  };

  const shareViaWhatsApp = async () => {
    if (!output) return;
    const msg = `*SuprO AI Hub — ${activeTool}*\n\n${output}\n\n_Generated via SuprO App_`;
    const waUrl = 'whatsapp://send?text=' + encodeURIComponent(msg);

    try {
      const canOpen = await Linking.canOpenURL(waUrl);
      if (canOpen) {
        await Linking.openURL(waUrl);
      } else {
        await Share.share({ message: msg });
      }
    } catch (e) {
      await Clipboard.setStringAsync(output);
      Alert.alert('Copied', 'Text copied to clipboard! You can paste it anywhere.');
    }
  };

  const copyToClipboard = async () => {
    if (output) {
      await Clipboard.setStringAsync(output);
      Alert.alert('Copied! 📋', 'AI response copied to clipboard.');
    }
  };

  const shareWhatsAppStatus = async () => {
    try {
      if (viewShotRef.current) {
        const uri = await viewShotRef.current.capture();
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, { dialogTitle: 'Share StatusO Quote' });
        } else {
          Alert.alert('Notice', 'Image saved at ' + uri);
        }
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to capture status image.');
    }
  };

  const handleDeleteHistoryItem = async (id: string) => {
    await historyService.deleteItem(id);
    loadHistory();
  };

  const handleClearAllHistory = async () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all your AI search history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await historyService.clearHistory();
            loadHistory();
          },
        },
      ]
    );
  };

  const renderDynamicInput = () => {
    const isUrlTool = ['YouTube Summarizer', 'Webpage Summarizer'].includes(activeTool);
    const isCropTool = activeTool === 'Crop Disease Analysis';
    const isQuizTool = activeTool === 'Quiz Creator';
    const isStatusTool = activeTool === 'StatusO Quote Gen';

    const toolConfig = TOOL_CONFIGS[activeTool] || {
      label_en: `✍️ Describe your request for ${activeTool}:`,
      label_ta: `✍️ ${activeTool} தொடர்பான விவரத்தை உள்ளிடவும்:`,
      placeholder_en: `Type here or use voice for ${activeTool}...`,
      placeholder_ta: `இங்கே தட்டச்சு செய்யவும் அல்லது குரல் மூலம் பேசவும்...`,
      button_en: `Process with ${activeTool}`,
      button_ta: `${activeTool} மூலம் செயலாக்குக`,
      result_title_en: `${activeTool} Result`,
      result_title_ta: `${activeTool} AI பதில்`,
      chips_en: [],
      chips_ta: [],
    };

    const inputLabel = language === 'Tamil' ? toolConfig.label_ta : toolConfig.label_en;
    const inputPlaceholder = language === 'Tamil' ? toolConfig.placeholder_ta : toolConfig.placeholder_en;
    const submitBtnText = language === 'Tamil' ? toolConfig.button_ta : toolConfig.button_en;
    const chips = language === 'Tamil' ? toolConfig.chips_ta : toolConfig.chips_en;

    return (
      <View style={[styles.inputCard, { backgroundColor: colors.card, borderColor: isVoiceActive ? '#10b981' : colors.border }]}>
        {/* Dynamic Tool Label Header */}
        <View style={styles.inputHeaderRow}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>{inputLabel}</Text>

          {/* Quick Voice / Kural AI Launch Header Button */}
          <TouchableOpacity
            style={[styles.voiceLaunchBtn, { backgroundColor: colors.primaryLight, borderColor: colors.primaryBorder }]}
            onPress={() => setShowVoiceModal(true)}
          >
            <Mic size={15} color={colors.primary} />
            <Text style={[styles.voiceLaunchText, { color: colors.primary }]}>{language === 'Tamil' ? 'குரல் AI' : 'Voice AI'}</Text>
          </TouchableOpacity>
        </View>

        {/* Live Voice Dictation Active Banner */}
        {isVoiceActive && (
          <View style={[styles.voiceActiveBanner, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
              <View style={[styles.pulseMicDot, { backgroundColor: colors.primary }]}>
                <Mic size={14} color="#000" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 12 }}>
                  {language === 'Tamil' ? '🎙️ குரல் தட்டச்சு தயார் (பேசுங்கள்...)' : '🎙️ Voice Input Ready (Speak now...)'}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 10 }}>
                  {language === 'Tamil'
                    ? 'கீபோர்டு மைக் 🎙️ அல்லது கீழே உள்ள விரைவு வினாக்களைப் பயன்படுத்தவும்'
                    : 'Use keyboard mic 🎙️ or choose a 1-tap voice prompt'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.voicePresetsQuickBtn}
              onPress={() => setShowVoiceModal(true)}
            >
              <Sparkles size={12} color="#000" />
              <Text style={{ color: '#000', fontSize: 11, fontWeight: '700' }}>
                {language === 'Tamil' ? 'வினாக்கள்' : 'Prompts'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsVoiceActive(false)} style={{ padding: 4 }}>
              <X size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}

        {/* 1-Tap Quick Prompt Chips Specific to Active Tool */}
        {chips && chips.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.promptChipsScroll}
            contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
          >
            {chips.map((chip, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.promptChip, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
                onPress={() => {
                  setInput(chip);
                  setIsVoiceActive(false);
                }}
              >
                <Sparkles size={12} color={colors.primary} />
                <Text style={[styles.promptChipText, { color: colors.textSecondary }]}>{chip}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Media Attachments Action Bar */}
        <View style={styles.attachmentBar}>
          {/* Live Camera Button */}
          {(isCropTool || activeTool === 'Notes Maker' || isQuizTool || activeTool === 'Text Summarizer') && (
            <TouchableOpacity style={[styles.attachBtn, { backgroundColor: colors.inputBg }]} onPress={handlePickLiveCamera}>
              <Camera color="#10b981" size={16} />
              <Text style={[styles.attachText, { color: '#10b981' }]}>
                {language === 'Tamil' ? 'கேமரா' : 'Camera'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Gallery Image Button */}
          {(isCropTool || activeTool === 'Notes Maker' || isQuizTool || activeTool === 'Text Summarizer') && (
            <TouchableOpacity style={[styles.attachBtn, { backgroundColor: colors.inputBg }]} onPress={handlePickGallery}>
              <ImageIcon color="#38bdf8" size={16} />
              <Text style={[styles.attachText, { color: '#38bdf8' }]}>
                {language === 'Tamil' ? 'படம்' : 'Gallery'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Document / PDF Button */}
          {(activeTool === 'Notes Maker' || isQuizTool || activeTool === 'Text Summarizer' || activeTool === 'Legal Translator') && (
            <TouchableOpacity style={[styles.attachBtn, { backgroundColor: colors.inputBg }]} onPress={handlePickDocument}>
              <Paperclip color="#f59e0b" size={16} />
              <Text style={[styles.attachText, { color: '#f59e0b' }]}>
                {language === 'Tamil' ? 'PDF / ஆவணம்' : 'PDF / Doc'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Active Attachment Chip */}
        {attachment && (
          <View style={[styles.attachmentChip, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
              <FileText size={16} color={colors.primary} />
              <Text style={[styles.attachmentName, { color: colors.text }]} numberOfLines={1}>
                {attachment.name}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setAttachment(null)}>
              <X color="#ef4444" size={18} />
            </TouchableOpacity>
          </View>
        )}

        {/* Text Input Area with Specific Placeholder & Voice Ref */}
        <TextInput
          ref={inputRef}
          style={[styles.textInput, { backgroundColor: colors.inputBg, color: colors.text, borderColor: isVoiceActive ? colors.primary : colors.border }]}
          multiline={!isUrlTool}
          numberOfLines={isUrlTool ? 1 : 4}
          placeholder={inputPlaceholder}
          placeholderTextColor={colors.textMuted}
          value={input}
          onChangeText={setInput}
        />

        {/* Quiz Configurations (If Quiz Creator) */}
        {isQuizTool && (
          <View style={styles.quizConfig}>
            <Text style={[styles.configLabel, { color: colors.textSecondary }]}>
              {language === 'Tamil' ? 'கேள்விகளின் எண்ணிக்கை:' : 'Number of Questions:'}
            </Text>
            <View style={styles.configRow}>
              {[5, 10, 20].map((n) => (
                <TouchableOpacity
                  key={n}
                  style={[styles.configOption, { backgroundColor: colors.inputBg, borderColor: colors.border }, quizNumQuestions === n && styles.configOptionActive]}
                  onPress={() => setQuizNumQuestions(n)}
                >
                  <Text style={[styles.configOptionText, { color: colors.textSecondary }, quizNumQuestions === n && styles.configOptionTextActive]}>
                    {n} Qs
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.configLabel, { marginTop: 12, color: colors.textSecondary }]}>
              {language === 'Tamil' ? 'கடினத்தன்மை நிலை:' : 'Difficulty Level:'}
            </Text>
            <View style={styles.configRow}>
              {['Easy', 'Medium', 'Hard'].map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.configOption, { backgroundColor: colors.inputBg, borderColor: colors.border }, quizDifficulty === d && styles.configOptionActive]}
                  onPress={() => setQuizDifficulty(d)}
                >
                  <Text style={[styles.configOptionText, { color: colors.textSecondary }, quizDifficulty === d && styles.configOptionTextActive]}>
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Dual Action Buttons: Big Microphone Voice Assistant + Tool Specific Submit */}
        <View style={styles.actionButtonsRow}>
          {/* Prominent Voice Input Button - Opens Kural Voice Assistant */}
          <TouchableOpacity
            style={[styles.prominentVoiceBtn, isVoiceActive && styles.prominentVoiceBtnActive]}
            onPress={() => setShowVoiceModal(true)}
            onLongPress={handleTriggerVoiceInput}
            activeOpacity={0.8}
          >
            <Mic size={20} color={isVoiceActive ? '#000' : '#fff'} />
            <Text style={[styles.prominentVoiceText, isVoiceActive && { color: '#000' }]}>
              {isVoiceActive
                ? (language === 'Tamil' ? 'பேசவும்...' : 'Speaking...')
                : (language === 'Tamil' ? 'குரல்' : 'Voice')}
            </Text>
          </TouchableOpacity>

          {/* Primary Tool-Specific Generate Button */}
          <TouchableOpacity
            style={[styles.generateBtn, { flex: 1, backgroundColor: colors.primary }]}
            onPress={() => handleGenerate()}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Zap size={18} color="#000" />
                <Text style={styles.generateBtnText}>{submitBtnText}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ─── HEADER BAR ─── */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Bot color={colors.primary} size={28} />
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>SuprO AI Hub</Text>
            <Text style={[styles.headerSub, { color: colors.textSecondary }]}>Aishlee Multi-Tool Assistant</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          {/* Language Toggle */}
          <TouchableOpacity
            style={[styles.langToggle, { borderColor: colors.primary }]}
            onPress={() => setLanguage((l) => (l === 'Tamil' ? 'English' : 'Tamil'))}
          >
            <Text style={[styles.langText, { color: colors.primary }]}>{language === 'Tamil' ? 'தமிழ்' : 'Eng'}</Text>
          </TouchableOpacity>

          {/* AI Settings Button */}
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.card }]} onPress={() => setShowSettingsModal(true)}>
            <Settings color={colors.textSecondary} size={20} />
          </TouchableOpacity>

          {/* History Button */}
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.card }]} onPress={() => setShowHistory(true)}>
            <HistoryIcon color={colors.textSecondary} size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        {/* ─── CATEGORIES HORIZONTAL SCROLL ─── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory.id === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryTab,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  isActive && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
                onPress={() => {
                  setActiveCategory(cat);
                  setActiveTool(cat.tools[0]);
                  resetInputs();
                }}
              >
                <Icon color={isActive ? '#000' : colors.textSecondary} size={16} />
                <Text style={[
                  styles.categoryTabText,
                  { color: colors.textSecondary },
                  isActive && { color: '#000', fontWeight: 'bold' }
                ]}>
                  {language === 'Tamil' ? cat.tamil : cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ─── MICRO-TOOLS CHIPS ─── */}
        <View style={styles.toolsContainer}>
          {activeCategory.tools.map((tool) => (
            <TouchableOpacity
              key={tool}
              style={[
                styles.toolChip,
                { backgroundColor: colors.card, borderColor: colors.border },
                activeTool === tool && { borderColor: colors.primary, backgroundColor: colors.primaryLight }
              ]}
              onPress={() => {
                setActiveTool(tool);
                resetInputs();
              }}
            >
              <Text style={[
                styles.toolChipText,
                { color: colors.textSecondary },
                activeTool === tool && { color: colors.primary, fontWeight: 'bold' }
              ]}>
                {tool}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ─── DYNAMIC INPUT CARD ─── */}
        {renderDynamicInput()}

        {/* ─── AI OUTPUT AREA ─── */}
        {output ? (
          <View style={[styles.outputCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.outputHeader, { borderBottomColor: colors.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                <Sparkles size={18} color={colors.primary} />
                <Text style={[styles.outputTitle, { color: colors.text }]} numberOfLines={1}>
                  {language === 'Tamil'
                    ? (TOOL_CONFIGS[activeTool]?.result_title_ta || 'AI பதில்')
                    : (TOOL_CONFIGS[activeTool]?.result_title_en || 'AI Response')}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 14 }}>
                <TouchableOpacity onPress={shareViaWhatsApp} title="Share to WhatsApp">
                  <Share2 color="#22c55e" size={20} />
                </TouchableOpacity>
                <TouchableOpacity onPress={copyToClipboard} title="Copy">
                  <Copy color="#38bdf8" size={20} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleExportPDF} title="Download PDF">
                  <Download color="#f59e0b" size={20} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ marginTop: 14 }}>
              {activeTool === 'StatusO Quote Gen' ? (
                <View>
                  <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.95 }}>
                    <View style={styles.statusQuoteCard}>
                      <Text style={styles.statusQuoteText}>"{output}"</Text>
                      <View style={styles.statusQuoteFooter}>
                        <Bot color="#10b981" size={16} />
                        <Text style={styles.statusQuoteBrand}>SuprO AI Status • Tamil Nadu</Text>
                      </View>
                    </View>
                  </ViewShot>
                  <TouchableOpacity style={styles.shareStatusBtn} onPress={shareWhatsAppStatus}>
                    <Share2 color="#000" size={18} />
                    <Text style={styles.shareStatusBtnText}>Share to WhatsApp Status</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Markdown style={markdownStyles}>{output}</Markdown>
              )}
            </View>
          </View>
        ) : null}
      </ScrollView>

      {/* ─── VOICE ASSISTANT MODAL (KURAL AI) ─── */}
      <Modal visible={showVoiceModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.voiceModalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.voiceModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Mic size={22} color={colors.primary} />
                <Text style={[styles.voiceModalTitle, { color: colors.text }]}>
                  {language === 'Tamil' ? 'குரல் AI (Kural AI Assistant)' : 'Kural AI Voice Assistant'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowVoiceModal(false)}>
                <X color={colors.textSecondary} size={22} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.voiceModalSub, { color: colors.textSecondary }]}>
              {language === 'Tamil'
                ? 'நேரடியாகப் பேச அல்லது ஒரு வினாவைத் தேர்ந்தெடுத்து உடனடி பதில் பெறவும்:'
                : 'Speak directly or tap a quick voice prompt for instant AI response:'}
            </Text>

            {/* Direct Voice Dictation Trigger Action Button */}
            <TouchableOpacity
              style={[styles.voiceSpeakNowBtn, { backgroundColor: colors.primary }]}
              onPress={() => {
                setShowVoiceModal(false);
                handleTriggerVoiceInput();
              }}
            >
              <Mic size={20} color="#000" />
              <Text style={styles.voiceSpeakNowBtnText}>
                {language === 'Tamil'
                  ? '🎙️ இப்போது பேச தொடங்குங்கள் (Voice Dictation)'
                  : '🎙️ Start Speaking Now (Voice Dictation)'}
              </Text>
            </TouchableOpacity>

            {/* Quick Voice Prompt Cards with 1-Tap Execution */}
            <ScrollView style={{ maxHeight: 240, marginBottom: 12 }} showsVerticalScrollIndicator={false}>
              {VOICE_PRESETS.map((preset, idx) => (
                <View key={idx} style={[styles.voicePresetCard, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                  <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
                    <Text style={{ fontSize: 20 }}>{preset.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.voicePresetText, { color: colors.text }]}>
                        {language === 'Tamil' ? preset.tamil : preset.english}
                      </Text>
                      <Text style={[styles.voicePresetTool, { color: colors.primary }]}>{preset.tool}</Text>
                    </View>
                  </View>

                  {/* Dual Action Buttons on Each Preset: Run Immediately OR Insert in Box */}
                  <View style={styles.presetActionsRow}>
                    <TouchableOpacity
                      style={[styles.presetUseBtn, { borderColor: colors.border }]}
                      onPress={() => handleSelectVoicePreset(preset, false)}
                    >
                      <FileText size={13} color={colors.textSecondary} />
                      <Text style={[styles.presetUseBtnText, { color: colors.textSecondary }]}>
                        {language === 'Tamil' ? 'உள்ளீடு' : 'Use'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.presetRunBtn, { backgroundColor: colors.primary }]}
                      onPress={() => handleSelectVoicePreset(preset, true)}
                    >
                      <Zap size={13} color="#000" />
                      <Text style={styles.presetRunBtnText}>
                        {language === 'Tamil' ? 'இயக்கு ⚡' : 'Run ⚡'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Direct Voice Query Input */}
            <View style={[styles.voiceInputRow, { backgroundColor: colors.inputBg, borderColor: colors.border, gap: 6 }]}>
              <TextInput
                style={[styles.voiceTextInput, { color: colors.text }]}
                placeholder={language === 'Tamil' ? 'குரல் வழியே பேச அல்லது தட்டச்சு செய்ய...' : 'Speak via keyboard mic or type query...'}
                placeholderTextColor={colors.textMuted}
                value={voiceQuery}
                onChangeText={setVoiceQuery}
              />
              <TouchableOpacity
                style={[styles.presetUseBtn, { borderColor: colors.border, paddingVertical: 8, paddingHorizontal: 10 }]}
                onPress={() => handleApplyVoiceQuery(false)}
              >
                <FileText size={13} color={colors.textSecondary} />
                <Text style={[styles.presetUseBtnText, { color: colors.textSecondary }]}>
                  {language === 'Tamil' ? 'உள்ளீடு' : 'Use'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.voiceApplyBtn, { backgroundColor: colors.primary }]}
                onPress={() => handleApplyVoiceQuery(true)}
              >
                <Zap size={14} color="#000" />
                <Text style={styles.voiceApplyBtnText}>{language === 'Tamil' ? 'இயக்கு' : 'Run'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ─── AI SETTINGS & API KEY MODAL ─── */}
      <Modal visible={showSettingsModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.settingsModalContent}>
            <View style={styles.voiceModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Key size={20} color="#10b981" />
                <Text style={styles.voiceModalTitle}>AI Settings & API Key</Text>
              </View>
              <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
                <X color="#fff" size={22} />
              </TouchableOpacity>
            </View>

            <Text style={styles.settingsLabel}>Google Gemini API Key:</Text>
            <TextInput
              style={styles.apiKeyInput}
              placeholder="Paste your AI Studio API key (AIzaSy...)"
              placeholderTextColor="#64748b"
              value={apiKey}
              onChangeText={setApiKey}
              secureTextEntry={false}
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={styles.getKeyLink}
              onPress={() => Linking.openURL('https://aistudio.google.com/app/apikey')}
            >
              <ExternalLink size={14} color="#38bdf8" />
              <Text style={styles.getKeyLinkText}>Get a Free Gemini API Key from Google AI Studio</Text>
            </TouchableOpacity>

            <View style={styles.settingsBtnRow}>
              <TouchableOpacity
                style={styles.testKeyBtn}
                onPress={handleTestApiKey}
                disabled={testingKey}
              >
                {testingKey ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.testKeyBtnText}>Test Key 🧪</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveKeyBtn} onPress={handleSaveApiKey}>
                <Text style={styles.saveKeyBtnText}>Save Key</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ─── HISTORY MODAL ─── */}
      <Modal visible={showHistory} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.historyContainer}>
          <View style={styles.historyHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <HistoryIcon color="#10b981" size={22} />
              <Text style={styles.historyTitle}>AI Tool History</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              {historyData.length > 0 && (
                <TouchableOpacity onPress={handleClearAllHistory}>
                  <Text style={styles.clearAllText}>Clear All</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => setShowHistory(false)}>
                <X color="#fff" size={24} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={{ padding: 16 }}>
            {historyData.map((group, idx) => (
              <View key={idx} style={{ marginBottom: 20 }}>
                <Text style={styles.historyGroupTitle}>{group.title}</Text>
                {group.data.map((item: HistoryItem) => (
                  <View key={item.id} style={styles.historyCard}>
                    <TouchableOpacity
                      style={{ flex: 1 }}
                      onPress={() => {
                        setActiveTool(item.tool);
                        setInput(item.query);
                        setOutput(item.result);
                        setShowHistory(false);
                      }}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={styles.historyCardTool}>{item.tool}</Text>
                        <Text style={styles.historyCardDate}>
                          {new Date(item.timestamp).toLocaleDateString()}
                        </Text>
                      </View>
                      <Text style={styles.historyCardQuery} numberOfLines={2}>
                        {item.query}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteHistoryBtn}
                      onPress={() => handleDeleteHistoryItem(item.id)}
                    >
                      <Trash2 size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ))}

            {historyData.length === 0 && (
              <View style={{ alignItems: 'center', marginTop: 60 }}>
                <HistoryIcon size={48} color="#334155" />
                <Text style={{ color: '#64748b', marginTop: 12, fontSize: 14 }}>
                  No history found. Generate something with AI!
                </Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : 36,
    paddingBottom: 12,
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerTitle: {
    color: '#10b981',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSub: {
    color: '#94a3b8',
    fontSize: 11,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  langToggle: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  langText: {
    color: '#10b981',
    fontWeight: 'bold',
    fontSize: 12,
  },
  iconBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#1e293b',
  },
  categoryScroll: {
    paddingHorizontal: 14,
    marginTop: 12,
    maxHeight: 46,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 6,
    height: 38,
  },
  categoryTabActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  categoryTabText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryTabTextActive: {
    color: '#000',
    fontWeight: 'bold',
  },
  toolsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    marginTop: 12,
    gap: 8,
  },
  toolChip: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  toolChipActive: {
    borderColor: '#10b981',
    backgroundColor: '#10b98115',
  },
  toolChipText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  toolChipTextActive: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  inputCard: {
    backgroundColor: '#111827',
    marginHorizontal: 14,
    marginTop: 14,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  inputHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  inputLabel: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  voiceLaunchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#10b98115',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10b98140',
  },
  voiceLaunchText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: 'bold',
  },
  attachmentBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  attachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  attachText: {
    fontSize: 11,
    fontWeight: '600',
  },
  attachmentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#10b98140',
  },
  attachmentName: {
    color: '#fff',
    fontSize: 12,
  },
  textInput: {
    backgroundColor: '#0a0f1e',
    color: '#fff',
    padding: 12,
    borderRadius: 10,
    fontSize: 14,
    minHeight: 90,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  quizConfig: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#0a0f1e',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  configLabel: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 6,
  },
  configRow: {
    flexDirection: 'row',
    gap: 8,
  },
  configOption: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  configOptionActive: {
    borderColor: '#10b981',
    backgroundColor: '#10b98120',
  },
  configOptionText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  configOptionTextActive: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  promptChipsScroll: {
    marginBottom: 8,
  },
  promptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  promptChipText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '500',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  prominentVoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#34d399',
    elevation: 3,
  },
  prominentVoiceText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  generateBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  generateBtnText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  outputCard: {
    backgroundColor: '#111827',
    marginHorizontal: 14,
    marginTop: 14,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#10b98150',
  },
  outputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    paddingBottom: 10,
  },
  outputTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  statusQuoteCard: {
    backgroundColor: '#0a0f1e',
    padding: 24,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  statusQuoteText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 28,
  },
  statusQuoteFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    opacity: 0.8,
  },
  statusQuoteBrand: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '600',
  },
  shareStatusBtn: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 12,
    gap: 8,
  },
  shareStatusBtnText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: 16,
  },
  voiceModalContent: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  voiceModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  voiceModalTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  voiceModalSub: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 12,
  },
  voiceActiveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    gap: 8,
  },
  pulseMicDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voicePresetsQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  prominentVoiceBtnActive: {
    backgroundColor: '#10b981',
    borderColor: '#34d399',
  },
  voiceSpeakNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 14,
    elevation: 3,
  },
  voiceSpeakNowBtnText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  voicePresetCard: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
  },
  voicePresetText: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  voicePresetTool: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
  presetActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  presetUseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  presetUseBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  presetRunBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  presetRunBtnText: {
    color: '#000',
    fontSize: 11,
    fontWeight: 'bold',
  },
  voiceInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  voiceTextInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    fontSize: 13,
    borderWidth: 1,
  },
  voiceApplyBtn: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceApplyBtnText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 13,
  },
  settingsModalContent: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
  },
  settingsLabel: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  apiKeyInput: {
    backgroundColor: '#0a0f1e',
    color: '#fff',
    padding: 12,
    borderRadius: 10,
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  getKeyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 12,
  },
  getKeyLinkText: {
    color: '#38bdf8',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  settingsBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  testKeyBtn: {
    flex: 1,
    backgroundColor: '#1e293b',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  testKeyBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  saveKeyBtn: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveKeyBtnText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 13,
  },
  historyContainer: {
    flex: 1,
    backgroundColor: '#0a0f1e',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  historyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearAllText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: 'bold',
  },
  historyGroupTitle: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 10,
  },
  historyCardTool: {
    color: '#10b981',
    fontWeight: 'bold',
    fontSize: 13,
  },
  historyCardDate: {
    color: '#64748b',
    fontSize: 11,
  },
  historyCardQuery: {
    color: '#cbd5e1',
    fontSize: 12,
  },
  deleteHistoryBtn: {
    padding: 6,
  },
});

const markdownStyles: any = {
  body: { color: '#e2e8f0', fontSize: 14, lineHeight: 22 },
  heading1: { color: '#10b981', fontSize: 18, fontWeight: 'bold', marginTop: 14, marginBottom: 6 },
  heading2: { color: '#38bdf8', fontSize: 16, fontWeight: 'bold', marginTop: 12, marginBottom: 6 },
  heading3: { color: '#f59e0b', fontSize: 14, fontWeight: 'bold', marginTop: 10, marginBottom: 4 },
  bullet_list: { marginTop: 6, marginBottom: 6 },
  strong: { color: '#fff', fontWeight: 'bold' },
};
