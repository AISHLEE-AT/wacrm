import React, { useState, useEffect, useContext, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
  Alert,
  TextInput,
  Modal,
  Image,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Leaf,
  Tv,
  CalendarCheck,
  Sparkles,
  Share2,
  Play,
  CheckCircle2,
  Circle,
  ChevronRight,
  X,
  PhoneCall,
  Award,
  Clock,
  ShieldAlert,
  Wrench,
  Bot,
  Send,
  Droplets,
  FlaskConical,
  HelpCircle,
  Layers,
  Flame,
} from 'lucide-react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import { AppContext } from '../context/AppContext';
import { colors } from '../lib/theme';
import { ENV } from '../config/env';
import {
  AgriService,
  AgriMediaItem,
  AgriDailyTask,
  AgriCropGuide,
  AgriGovScheme,
  AGRI_AI_PRESETS,
} from '../services/AgriService';
import { geminiToolsService } from '../services/geminiToolsService';

const { width } = Dimensions.get('window');

type TabType = 'tv' | 'tasks' | 'crops' | 'ai_tools' | 'schemes';
type AIToolSubMode = 'doctor' | 'fertilizer' | 'irrigation' | 'general';

export default function AgrOScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { geminiApiKey, themeMode } = useContext(AppContext);

  const [activeTab, setActiveTab] = useState<TabType>('tv');

  // ─── Video & TvO state ───
  const [videos, setVideos] = useState<AgriMediaItem[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [videoCategoryFilter, setVideoCategoryFilter] = useState<string>('all');
  const [activeVideoModal, setActiveVideoModal] = useState<AgriMediaItem | null>(null);

  // ─── Daily Tasks state ───
  const [tasks, setTasks] = useState<AgriDailyTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  // ─── Crops state ───
  const [cropGuides, setCropGuides] = useState<AgriCropGuide[]>([]);
  const [cropFilter, setCropFilter] = useState<string>('all');
  const [selectedCropModal, setSelectedCropModal] = useState<AgriCropGuide | null>(null);

  // ─── AI Tools state ───
  const [aiToolMode, setAiToolMode] = useState<AIToolSubMode>('doctor');
  const [aiInputQuery, setAiInputQuery] = useState('');
  const [aiResponseText, setAiResponseText] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Interactive AI sub-inputs
  const [selectedSoilType, setSelectedSoilType] = useState('செம்மண்');
  const [selectedTargetCrop, setSelectedTargetCrop] = useState('நெல் (Paddy)');
  const [selectedLandArea, setSelectedLandArea] = useState('1 ஏக்கர்');

  // ─── Government Schemes state ───
  const [govSchemes, setGovSchemes] = useState<AgriGovScheme[]>([]);

  // ─── Load Initial Data ───
  useEffect(() => {
    // 1. Fetch Agri Videos
    AgriService.getAgriVideos().then((data) => {
      setVideos(data);
      setLoadingVideos(false);
    });

    // 2. Fetch Daily Tasks
    AgriService.getDailyTasks().then((data) => {
      setTasks(data);
      setLoadingTasks(false);
    });

    // 3. Load Crops & Schemes
    setCropGuides(AgriService.getCropGuides());
    setGovSchemes(AgriService.getGovSchemes());
  }, []);

  // ─── Task Completion Toggle ───
  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    const updated = await AgriService.toggleTaskCompletion(taskId, currentStatus);
    setTasks(updated);
  };

  // ─── Share Video / Content to WhatsApp ───
  const handleShareWhatsApp = (title: string, url: string) => {
    const msg = `🌾 *SuprO AgrO உழவர் வழிகாட்டி:* \n\n📌 *${title}*\n🔗 வீடியோ/விவரம்: ${url}\n\n📲 தமிழ்நாடு விவசாயிகள் பயன்பெற SuprO செயலியை பதிவிறக்கவும்: ${ENV.CRM_URL}/agro`;
    const shareUrl = `whatsapp://send?text=${encodeURIComponent(msg)}`;
    Linking.openURL(shareUrl).catch(() => {
      Linking.openURL(`https://wa.me/?text=${encodeURIComponent(msg)}`);
    });
  };

  // ─── Agri AI Engine Execution ───
  const handleRunAiTool = async (customQuery?: string) => {
    const queryToUse = (customQuery || aiInputQuery).trim();

    if (!queryToUse && aiToolMode !== 'fertilizer' && aiToolMode !== 'irrigation') {
      Alert.alert('குறிப்பு தேவை', 'தயவுசெய்து உங்கள் பயிர் பாதிப்பு அல்லது கேள்வியை உள்ளிடவும்.');
      return;
    }

    setIsAiLoading(true);
    setAiResponseText(null);

    let structuredPrompt = '';

    if (aiToolMode === 'doctor') {
      structuredPrompt = `You are a Senior Tamil Nadu Crop Doctor & Agricultural Scientist.
Farmer's Query: ${queryToUse}
Provide a detailed response in easy Tamil:
1. 🌾 பயிர் நோய் / பாதிப்பு அடையாளம்
2. 🔍 அறிகுறிகள் & காரணங்கள்
3. 🌿 இயற்கை & நாட்டு மருந்து முறைகள் (Panchagavya, Neem oil, Trichoderma, 5 leaf extract)
4. 🧪 பரிந்துரைக்கப்படும் மருந்துகள் & ஏக்கருக்கு அளவு (Fungicide/Pesticide dosage)
5. 🛡️ எதிர்கால தடுப்பு முறைகள்`;
    } else if (aiToolMode === 'fertilizer') {
      structuredPrompt = `You are a Tamil Nadu Soil Nutrient & Fertilizer Calculator.
Crop: ${selectedTargetCrop}, Soil Type: ${selectedSoilType}, Land Area: ${selectedLandArea}. User details: ${queryToUse || 'None'}.
Provide a precise fertilizer plan in Tamil:
1. 🧪 மண் பண்பு & தேவையான சத்துக்கள்
2. 🌿 இயற்கை உரம் (மண்புழு உரம், தொழு உரம், நுண்ணுயிர் பாசி அளவு)
3. ⚖️ NPK உர அட்டவணை (DAP, யூரியா, பொட்டாஷ், 19:19:19 பரிந்துரைக்கப்படும் கிலோ/ஏக்கர் மற்றும் இடும் நாட்கள்)
4. 🌟 மகசூல் அதிகரிக்க நுண் ஊட்டச்சத்துக்கள்`;
    } else if (aiToolMode === 'irrigation') {
      structuredPrompt = `You are a Tamil Nadu Smart Drip & Micro-Irrigation Expert.
Crop: ${selectedTargetCrop}, Soil: ${selectedSoilType}, Area: ${selectedLandArea}. Details: ${queryToUse || 'None'}.
Provide a smart irrigation schedule in Tamil:
1. 💧 பயிரின் தினசரி நீர் தேவை (லிட்டர்/நாள்)
2. ⏱️ சொட்டு நீர் இயக்கும் நேரம் (காலை / மாலை மணி அளவு)
3. 🌿 நீர் சேமிப்பு மற்றும் மூடாக்கு (Mulching) யுக்திகள்
4. 🛡️ வறட்சி மேலாண்மை வழிகாட்டல்`;
    } else {
      structuredPrompt = `You are a Tamil Nadu Agricultural Expert and Rural Farmer Mentor.
Farmer's Question: ${queryToUse}
Provide clear, actionable, encouraging advice in simple Tamil for rural farmers.`;
    }

    try {
      if (geminiApiKey) {
        const response = await geminiToolsService.executePrompt(
          structuredPrompt,
          geminiApiKey,
          'Tamil'
        );
        setAiResponseText(response.text || response.error || 'AI ஆலோசனை பெறப்பட்டது.');
      } else {
        // High quality offline fallback tailored to the selected mode
        setTimeout(() => {
          if (aiToolMode === 'doctor') {
            setAiResponseText(
              `🌾 **பயிர் மருத்துவர் அறிக்கை (Crop Diagnostic Advice):**\n\n` +
                `🔍 **பாதிப்பு வகை**: பயிர் இலைக்கருகல் / பூஞ்சை அல்லது பூச்சி தாக்குதல்.\n\n` +
                `🌿 **இயற்கை வைத்தியம் (Organic Remedy)**:\n` +
                `• 3% வேப்பெண்ணெய் கரைசல் (10 லிட்டர் நீருக்கு 300 மிலி + காதி சோப் 10 கிராம்) காலை/மாலை வேளையில் தெளிக்கவும்.\n` +
                `• சூடோமோனாஸ் (Pseudomonas) 10 கிராம்/லிட்டர் நீரில் கலந்து இலைவழியாக தெளிக்கவும்.\n` +
                `• பாசன நீரில் 100 லிட்டர் ஜீவாமிர்தம் கலந்து பாய்ச்சவும்.\n\n` +
                `🧪 **பரிந்துரைக்கப்படும் மருந்து (Chemical Remedy)**:\n` +
                `• மேன்கோசெப் 2 கிராம்/லிட்டர் அல்லது காப்பர் ஆக்ஸிகுளோரைடு 2.5 கிராம்/லிட்டர்.\n\n` +
                `🛡️ **தடுப்பு முறை**: வயலில் தேங்கும் அதிகப்படியான நீரை உடனே வடிக்கவும்.`
            );
          } else if (aiToolMode === 'fertilizer') {
            setAiResponseText(
              `🧪 **${selectedTargetCrop} - ${selectedSoilType} உரக் கணக்கீடு (${selectedLandArea}):**\n\n` +
                `🌿 **அடிப்படை உரம் (Basal Dressing)**:\n` +
                `• மக்கிய தொழு உரம் 5 டன் + வேப்பம் புண்ணாக்கு 100 கிலோ + அசோஸ்பைரில்லம் 2 கிலோ.\n` +
                `• DAP 50 கிலோ + பொட்டாஷ் 25 கிலோ கடைசி உழவின் போது இடவும்.\n\n` +
                `⚡ **மேலுரம் (Top Dressing - 30 & 60 நாட்கள்)**:\n` +
                `• 30ம் நாள்: யூரியா 25 கிலோ + ஜிங்க் சல்பேட் 10 கிலோ.\n` +
                `• 60ம் நாள்: பொட்டாஷ் 25 கிலோ + யூரியா 20 கிலோ.\n\n` +
                `🌟 **நுண் ஊட்டச்சத்து**: 19:19:19 நீரில் கரையும் உரம் (10 கிராம்/லிட்டர்) பூக்கும் பருவத்தில் இலைவழியாக தெளிக்கவும்.`
            );
          } else if (aiToolMode === 'irrigation') {
            setAiResponseText(
              `💧 **${selectedTargetCrop} ஸ்மார்ட் பாசன வழிகாட்டி (${selectedSoilType}):**\n\n` +
                `⏱️ **சொட்டு நீர் இயக்கும் நேரம்**:\n` +
                `• காலை 6:30 - 8:30 அல்லது மாலை 4:30 - 6:30 வரை.\n` +
                `• ஒரு செடிக்கு தினசரி 4 முதல் 8 லிட்டர் நீர் போதுமானது.\n\n` +
                `🌿 **நீர் சேமிப்பு யுக்தி**:\n` +
                `• தென்னை நார் கழிவு அல்லது காய்ந்த சருகுகள் கொண்டு வரப்புகளில் மூடாக்கு (Mulching) அமைக்கவும். இதனால் 40% நீர் ஆவியாதல் தடுக்கப்படும்.\n\n` +
                `☀️ **வெயில் காலம்**: பூக்கும் பருவத்தில் நிலத்தில் எப்போதும் 60% ஈரப்பதம் இருக்குமாறு பாசனம் செய்யவும்.`
            );
          } else {
            setAiResponseText(
              `💡 **விவசாய AI வழிகாட்டல்:**\n\n` +
                `தமிழ்நாட்டில் குறைந்த நீரில் அதிக வருமானம் தரும் பயிர்களான **டிராகன் ஃப்ரூட்**, **நாட்டு முருங்கை**, மற்றும் **பாரம்பரிய சிறுதானியங்கள்** சாகுபடி செய்வது சிறந்தது.\n` +
                `• அரசு மானியத்தில் 100% சொட்டு நீர் பாசனம் அமைக்க உழவன் செயலியில் பதிவு செய்யவும்.\n` +
                `• கூடுதல் தொழில்நுட்ப விவரங்களுக்கு எங்களின் வேளாண் டிவி வீடியோக்களை காணவும்.`
            );
          }
          setIsAiLoading(false);
        }, 800);
        return;
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'AI ஆலோசனை பெறுவதில் பிழை ஏற்பட்டது.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // ─── Filtered Videos ───
  const filteredVideos = useMemo(() => {
    if (videoCategoryFilter === 'all') return videos;
    return videos.filter((v) => v.category === videoCategoryFilter);
  }, [videos, videoCategoryFilter]);

  // ─── Filtered Crops ───
  const filteredCrops = useMemo(() => {
    if (cropFilter === 'all') return cropGuides;
    return cropGuides.filter((c) => c.category === cropFilter);
  }, [cropGuides, cropFilter]);

  // ─── Completed Tasks Count ───
  const completedTasksCount = tasks.filter((t) => t.isCompleted).length;
  const taskProgressPercent =
    tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* ─── Top Header (Safe above punch hole / status bar) ─── */}
      <View
        style={[
          styles.headerContainer,
          {
            backgroundColor: colors.card,
            borderBottomColor: colors.borderLight,
            paddingTop:
              Math.max(
                insets.top,
                Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0
              ) + 8,
          },
        ]}
      >
        <View style={styles.headerTopRow}>
          <View>
            <View style={styles.brandRow}>
              <Text style={[styles.brandTitle, { color: colors.text }]}>AgrO</Text>
              <View style={styles.hubBadge}>
                <Sparkles size={11} color="#10b981" />
                <Text style={styles.hubBadgeText}>உழவர் களம்</Text>
              </View>
            </View>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              தமிழ்நாடு வேளாண் வளர்ச்சி & உழவர் வழிகாட்டி
            </Text>
          </View>

          {/* Quick RentO Tractor Link */}
          <TouchableOpacity
            style={styles.rentoBtn}
            onPress={() => navigation.navigate('RentOScreen')}
            activeOpacity={0.8}
          >
            <Wrench size={13} color="#fff" />
            <Text style={styles.rentoBtnText}>டிராக்டர் வாடகை</Text>
          </TouchableOpacity>
        </View>

        {/* Live Season & Advisory Strip */}
        <View style={styles.seasonStrip}>
          <Text style={styles.seasonText}>
            ☀️ நடப்பு பருவம்: சம்பா / நவரை சாகுபடி • உழவர் உதவி எண்: 1800-180-1551
          </Text>
        </View>

        {/* ─── 5 Main Navigation Tabs ─── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
          <TouchableOpacity
            style={[styles.mainTab, activeTab === 'tv' && styles.mainTabActive]}
            onPress={() => setActiveTab('tv')}
            activeOpacity={0.75}
          >
            <Tv size={16} color={activeTab === 'tv' ? '#070C18' : '#10b981'} />
            <Text style={[styles.mainTabText, activeTab === 'tv' && styles.mainTabTextActive]}>
              வேளாண் டிவி
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.mainTab, activeTab === 'tasks' && styles.mainTabActive]}
            onPress={() => setActiveTab('tasks')}
            activeOpacity={0.75}
          >
            <CalendarCheck size={16} color={activeTab === 'tasks' ? '#070C18' : '#10b981'} />
            <Text style={[styles.mainTabText, activeTab === 'tasks' && styles.mainTabTextActive]}>
              தினசரி பணிகள் ({completedTasksCount}/{tasks.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.mainTab, activeTab === 'crops' && styles.mainTabActive]}
            onPress={() => setActiveTab('crops')}
            activeOpacity={0.75}
          >
            <Leaf size={16} color={activeTab === 'crops' ? '#070C18' : '#10b981'} />
            <Text style={[styles.mainTabText, activeTab === 'crops' && styles.mainTabTextActive]}>
              புதிய பயிர்கள்
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.mainTab, activeTab === 'ai_tools' && styles.mainTabActive]}
            onPress={() => setActiveTab('ai_tools')}
            activeOpacity={0.75}
          >
            <Bot size={16} color={activeTab === 'ai_tools' ? '#070C18' : '#10b981'} />
            <Text style={[styles.mainTabText, activeTab === 'ai_tools' && styles.mainTabTextActive]}>
              🤖 வேளாண் AI கருவிகள்
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.mainTab, activeTab === 'schemes' && styles.mainTabActive]}
            onPress={() => setActiveTab('schemes')}
            activeOpacity={0.75}
          >
            <Award size={16} color={activeTab === 'schemes' ? '#070C18' : '#10b981'} />
            <Text style={[styles.mainTabText, activeTab === 'schemes' && styles.mainTabTextActive]}>
              அரசு திட்டங்கள்
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* ─── TAB 1: வேளாண் டிவி & வீடியோக்கள் (Merged TvO & Admin Broadcasts) ─── */}
      {activeTab === 'tv' && (
        <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
          {/* Category Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            {[
              { id: 'all', label: 'அனைத்து வீடியோக்கள்' },
              { id: 'crop_guide', label: '🌱 பயிர் சாகுபடி' },
              { id: 'organic', label: '🌿 இயற்கை விவசாயம்' },
              { id: 'gov_scheme', label: '🏛️ அரசு மானியம்' },
              { id: 'machinery', label: '🚜 இயந்திரங்கள்' },
            ].map((f) => (
              <TouchableOpacity
                key={f.id}
                style={[
                  styles.filterChip,
                  { backgroundColor: colors.card, borderColor: colors.borderLight },
                  videoCategoryFilter === f.id && styles.filterChipActive,
                ]}
                onPress={() => setVideoCategoryFilter(f.id)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: colors.textSecondary },
                    videoCategoryFilter === f.id && styles.filterChipTextActive,
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {loadingVideos ? (
            <ActivityIndicator color="#10b981" size="large" style={{ marginTop: 40 }} />
          ) : (
            filteredVideos.map((video) => (
              <View
                key={video.id}
                style={[styles.videoCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
              >
                {/* Thumbnail Container with Play Overlay */}
                <TouchableOpacity
                  style={styles.thumbnailContainer}
                  activeOpacity={0.85}
                  onPress={() => {
                    if (video.videoId) {
                      setActiveVideoModal(video);
                    } else if (video.url) {
                      Linking.openURL(video.url);
                    }
                  }}
                >
                  <Image source={{ uri: video.thumbnail }} style={styles.thumbnailImage} />
                  <View style={styles.playOverlay}>
                    <View style={styles.playCircle}>
                      <Play size={22} color="#fff" fill="#fff" />
                    </View>
                  </View>
                  <View style={styles.durationBadge}>
                    <Text style={styles.durationText}>{video.duration || 'வீடியோ'}</Text>
                  </View>
                  {video.isFeatured && (
                    <View style={styles.featuredBadge}>
                      <Sparkles size={10} color="#fff" />
                      <Text style={styles.featuredBadgeText}>சிறப்பு ஒளிபரப்பு</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Video Info */}
                <View style={styles.videoInfo}>
                  <Text style={[styles.videoTitle, { color: colors.text }]} numberOfLines={2}>
                    {video.title}
                  </Text>
                  <Text style={[styles.videoDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                    {video.description}
                  </Text>

                  {/* Actions Row */}
                  <View style={styles.videoActionsRow}>
                    <Text style={[styles.videoAuthor, { color: colors.textMuted }]}>
                      {video.author} • {video.publishedAt}
                    </Text>

                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity
                        style={styles.shareIconBtn}
                        onPress={() => handleShareWhatsApp(video.title, video.url)}
                        activeOpacity={0.7}
                      >
                        <Share2 size={15} color="#25D366" />
                        <Text style={styles.shareIconText}>பகிர்</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.watchBtn}
                        onPress={() => {
                          if (video.videoId) {
                            setActiveVideoModal(video);
                          } else {
                            Linking.openURL(video.url);
                          }
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.watchBtnText}>காண்க ▶</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* ─── TAB 2: தினசரி உழவுப் பணிகள் & நாட்குறிப்பு ─── */}
      {activeTab === 'tasks' && (
        <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
          {/* Daily Progress Banner */}
          <View style={[styles.progressCard, { backgroundColor: colors.card, borderColor: '#10b981' }]}>
            <View style={styles.progressHeader}>
              <View>
                <Text style={styles.progressTitle}>இன்றைய உழவுப் பணிகள் முன்னேற்றம்</Text>
                <Text style={[styles.progressSubtitle, { color: colors.textSecondary }]}>
                  {completedTasksCount} / {tasks.length} பணிகள் முடிக்கப்பட்டது
                </Text>
              </View>
              <Text style={styles.progressPercent}>{taskProgressPercent}%</Text>
            </View>
            <View style={[styles.progressBarBg, { backgroundColor: colors.inputBg }]}>
              <View style={[styles.progressBarFill, { width: `${taskProgressPercent}%` }]} />
            </View>
          </View>

          {/* Tasks List */}
          {loadingTasks ? (
            <ActivityIndicator color="#10b981" size="large" style={{ marginTop: 40 }} />
          ) : (
            tasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={[
                  styles.taskCard,
                  { backgroundColor: colors.card, borderColor: colors.borderLight },
                  task.isCompleted && styles.taskCardCompleted,
                ]}
                onPress={() => handleToggleTask(task.id, !!task.isCompleted)}
                activeOpacity={0.8}
              >
                <View style={styles.taskLeftRow}>
                  <TouchableOpacity
                    onPress={() => handleToggleTask(task.id, !!task.isCompleted)}
                    style={styles.checkCircleBox}
                  >
                    {task.isCompleted ? (
                      <CheckCircle2 size={24} color="#10b981" />
                    ) : (
                      <Circle size={24} color={colors.textMuted} />
                    )}
                  </TouchableOpacity>

                  <View style={{ flex: 1 }}>
                    <View style={styles.taskTopMeta}>
                      <Text style={[styles.taskStageBadge, { backgroundColor: 'rgba(16,185,129,0.12)' }]}>
                        {task.stage}
                      </Text>
                      <View style={styles.timingRow}>
                        <Clock size={12} color={colors.textMuted} />
                        <Text style={[styles.taskTiming, { color: colors.textMuted }]}>
                          {task.timing}
                        </Text>
                      </View>
                    </View>

                    <Text
                      style={[
                        styles.taskTitle,
                        { color: colors.text },
                        task.isCompleted && styles.taskTitleCompleted,
                      ]}
                    >
                      {task.title}
                    </Text>
                    <Text style={[styles.taskDetails, { color: colors.textSecondary }]}>
                      {task.details}
                    </Text>

                    <View style={styles.tipsBox}>
                      <Sparkles size={13} color="#34d399" />
                      <Text style={styles.tipsText}>பரிந்துரை: {task.tips}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      {/* ─── TAB 3: புதிய பயிர்கள் & நவீன நடவு முறைகள் ─── */}
      {activeTab === 'crops' && (
        <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
          {/* Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            {[
              { id: 'all', label: 'அனைத்து பயிர்கள்' },
              { id: 'high_value', label: '⭐ அதிக லாபம்' },
              { id: 'cash_crop', label: '🌿 பணப்பயிர்' },
              { id: 'millets', label: '🌾 சிறுதானியங்கள்' },
              { id: 'traditional_paddy', label: '👑 பாரம்பரிய நெல்' },
            ].map((f) => (
              <TouchableOpacity
                key={f.id}
                style={[
                  styles.filterChip,
                  { backgroundColor: colors.card, borderColor: colors.borderLight },
                  cropFilter === f.id && styles.filterChipActive,
                ]}
                onPress={() => setCropFilter(f.id)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: colors.textSecondary },
                    cropFilter === f.id && styles.filterChipTextActive,
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {filteredCrops.map((crop) => (
            <TouchableOpacity
              key={crop.id}
              style={[styles.cropCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
              activeOpacity={0.85}
              onPress={() => setSelectedCropModal(crop)}
            >
              <View style={styles.cropCardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cropName, { color: colors.text }]}>{crop.name}</Text>
                  <Text style={[styles.cropSciName, { color: colors.textMuted }]}>
                    {crop.scientificName}
                  </Text>
                </View>
                <View style={[styles.cropTagBadge, { backgroundColor: crop.tagColor + '20' }]}>
                  <Text style={[styles.cropTagText, { color: crop.tagColor }]}>{crop.tag}</Text>
                </View>
              </View>

              {/* Crop Quick Metrics Grid */}
              <View style={[styles.metricsGrid, { backgroundColor: colors.inputBg }]}>
                <View style={styles.metricItem}>
                  <Text style={[styles.metricLabel, { color: colors.textMuted }]}>கால அளவு</Text>
                  <Text style={[styles.metricValue, { color: colors.text }]}>
                    {crop.durationMonths}
                  </Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={[styles.metricLabel, { color: colors.textMuted }]}>நீர் தேவை</Text>
                  <Text style={[styles.metricValue, { color: '#3b82f6' }]}>{crop.waterNeed}</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={[styles.metricLabel, { color: colors.textMuted }]}>ஏக்கர் லாபம்</Text>
                  <Text style={[styles.metricValue, { color: '#10b981' }]}>{crop.profitPerAcre}</Text>
                </View>
              </View>

              {/* Action Button */}
              <View style={styles.cropCardFooter}>
                <Text style={styles.cropDetailsHint}>முழு சாகுபடி முறை & வழிகாட்டி காண</Text>
                <View style={styles.cropArrowBtn}>
                  <Text style={styles.cropArrowText}>விவரம்</Text>
                  <ChevronRight size={15} color="#10b981" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* ─── TAB 4: வேளாண் AI கருவிகள் (Agri AI Tools Hub) ─── */}
      {activeTab === 'ai_tools' && (
        <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
          {/* Sub-mode Tool Selector Pills */}
          <View style={styles.aiToolPillsRow}>
            {[
              { id: 'doctor', label: '🩺 பயிர் மருத்துவர்', icon: ShieldAlert },
              { id: 'fertilizer', label: '🧪 மண் & உரக் கணக்கீடு', icon: FlaskConical },
              { id: 'irrigation', label: '💧 பாசன வழிகாட்டி', icon: Droplets },
              { id: 'general', label: '💬 AI அரட்டை', icon: Bot },
            ].map((tool) => {
              const IconComp = tool.icon;
              const isSelected = aiToolMode === tool.id;
              return (
                <TouchableOpacity
                  key={tool.id}
                  style={[
                    styles.aiToolPill,
                    { backgroundColor: colors.card, borderColor: colors.borderLight },
                    isSelected && styles.aiToolPillActive,
                  ]}
                  onPress={() => {
                    setAiToolMode(tool.id as AIToolSubMode);
                    setAiResponseText(null);
                  }}
                  activeOpacity={0.8}
                >
                  <IconComp size={14} color={isSelected ? '#070C18' : '#10b981'} />
                  <Text
                    style={[
                      styles.aiToolPillText,
                      { color: colors.textSecondary },
                      isSelected && styles.aiToolPillTextActive,
                    ]}
                  >
                    {tool.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* AI Interactive Card */}
          <View style={[styles.aiMainCard, { backgroundColor: colors.card, borderColor: '#10b981' }]}>
            {/* Header description for the selected tool */}
            <View style={styles.aiCardHeader}>
              <Bot size={22} color="#10b981" />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={[styles.aiCardTitle, { color: colors.text }]}>
                  {aiToolMode === 'doctor' && '🩺 AI பயிர் மருத்துவர் & நோய் கண்டறிதல்'}
                  {aiToolMode === 'fertilizer' && '🧪 மண் பரிசோதனை & உரத் திட்டமிடுதல்'}
                  {aiToolMode === 'irrigation' && '💧 ஸ்மார்ட் சொட்டு நீர் & பாசன கணக்கீடு'}
                  {aiToolMode === 'general' && '💬 விவசாய AI உடனடி வழிகாட்டி'}
                </Text>
                <Text style={[styles.aiCardSubtitle, { color: colors.textSecondary }]}>
                  {aiToolMode === 'doctor' && 'பயிர் பாதிப்பு, இலைப்புள்ளி, புழு தாக்குதலை குறிப்பிட்டு தீர்வு பெறுக'}
                  {aiToolMode === 'fertilizer' && 'மண் வகை மற்றும் பயிருக்கு உகந்த துல்லிய NPK உர அட்டவணை'}
                  {aiToolMode === 'irrigation' && 'குறைந்த நீரில் அதிக மகசூல் பெற தேவையான பாசன நேரம் & நீர் அளவு'}
                  {aiToolMode === 'general' && 'விவசாயம் தொடர்பான எந்த கேள்வியையும் தமிழில் கேட்கலாம்'}
                </Text>
              </View>
            </View>

            {/* If in Fertilizer or Irrigation mode: Show Quick Selectors */}
            {(aiToolMode === 'fertilizer' || aiToolMode === 'irrigation') && (
              <View style={[styles.smartSelectorsBox, { backgroundColor: colors.inputBg }]}>
                {/* Crop Selector */}
                <View style={styles.selectorGroup}>
                  <Text style={[styles.selectorLabel, { color: colors.textMuted }]}>பயிர்:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ gap: 6 }}>
                    {['நெல் (Paddy)', 'வாழை (Banana)', 'கரும்பு (Sugarcane)', 'தென்னை (Coconut)', 'முருங்கை (Moringa)', 'டிராகன் ஃப்ரூட்'].map((c) => (
                      <TouchableOpacity
                        key={c}
                        style={[
                          styles.selectorChip,
                          selectedTargetCrop === c && styles.selectorChipActive,
                        ]}
                        onPress={() => setSelectedTargetCrop(c)}
                      >
                        <Text
                          style={[
                            styles.selectorChipText,
                            selectedTargetCrop === c && styles.selectorChipTextActive,
                          ]}
                        >
                          {c}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Soil Selector */}
                <View style={styles.selectorGroup}>
                  <Text style={[styles.selectorLabel, { color: colors.textMuted }]}>மண் வகை:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ gap: 6 }}>
                    {['செம்மண்', 'கரிசல் மண்', 'வண்டல் மண்', 'மணல் பாங்கு'].map((s) => (
                      <TouchableOpacity
                        key={s}
                        style={[
                          styles.selectorChip,
                          selectedSoilType === s && styles.selectorChipActive,
                        ]}
                        onPress={() => setSelectedSoilType(s)}
                      >
                        <Text
                          style={[
                            styles.selectorChipText,
                            selectedSoilType === s && styles.selectorChipTextActive,
                          ]}
                        >
                          {s}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            )}

            {/* Text Input area */}
            <View style={[styles.doctorInputContainer, { backgroundColor: colors.inputBg, borderColor: colors.borderLight }]}>
              <TextInput
                style={[styles.doctorTextInput, { color: colors.text }]}
                placeholder={
                  aiToolMode === 'doctor'
                    ? 'எ.கா: நெல் இலை நுனியில் கருகல் நோய் உள்ளது என்ன மருந்து தெளிக்கலாம்?'
                    : aiToolMode === 'fertilizer'
                    ? 'கூடுதல் விவரங்கள் (எ.கா: நடவு செய்து 30 நாட்கள் ஆகிறது)'
                    : aiToolMode === 'irrigation'
                    ? 'பாசன முறை (எ.கா: சொட்டு நீர் குழாய் 16mm)'
                    : 'உங்கள் கேள்வியை இங்கு தட்டச்சு செய்யவும்...'
                }
                placeholderTextColor={colors.textMuted}
                value={aiInputQuery}
                onChangeText={setAiInputQuery}
                multiline
              />
              <TouchableOpacity
                style={[styles.doctorSendBtn, isAiLoading && { opacity: 0.5 }]}
                onPress={() => handleRunAiTool()}
                disabled={isAiLoading}
              >
                {isAiLoading ? (
                  <ActivityIndicator size="small" color="#070C18" />
                ) : (
                  <Send size={16} color="#070C18" />
                )}
              </TouchableOpacity>
            </View>

            {/* AI Result Box */}
            {aiResponseText && (
              <View style={styles.doctorResultBox}>
                <View style={styles.resultTopBar}>
                  <Sparkles size={14} color="#34d399" />
                  <Text style={styles.resultBadge}>AI வழிகாட்டி அறிக்கை</Text>
                </View>
                <Text style={styles.doctorResultText}>{aiResponseText}</Text>

                <TouchableOpacity
                  style={styles.shareReportBtn}
                  onPress={() =>
                    handleShareWhatsApp('விவசாய AI வழிகாட்டி அறிக்கை', aiResponseText)
                  }
                >
                  <Share2 size={13} color="#25D366" />
                  <Text style={styles.shareReportText}>வாட்ஸ்அப்பில் பகிரவும்</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Preset Prompts Section */}
          <Text style={[styles.presetHeading, { color: colors.text }]}>
            💡 அடிக்கடி கேட்கப்படும் உழவர் கேள்விகள்:
          </Text>
          <View style={styles.presetsGrid}>
            {AGRI_AI_PRESETS.map((preset) => (
              <TouchableOpacity
                key={preset.id}
                style={[styles.presetCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
                onPress={() => {
                  setAiInputQuery(preset.query);
                  handleRunAiTool(preset.query);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.presetHeader}>
                  <Sparkles size={14} color="#10b981" />
                  <Text style={[styles.presetTitle, { color: colors.text }]}>{preset.title}</Text>
                </View>
                <Text style={[styles.presetQuery, { color: colors.textSecondary }]} numberOfLines={2}>
                  {preset.query}
                </Text>
                <View style={styles.presetAction}>
                  <Text style={styles.presetActionText}>தீர்வு காண்க ▶</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {/* ─── TAB 5: தமிழ்நாடு அரசு வேளாண் நலத்திட்டங்கள் & மானியங்கள் ─── */}
      {activeTab === 'schemes' && (
        <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.sectionHeading, { color: colors.text }]}>
            🏛️ தமிழ்நாடு அரசு வேளாண் நலத்திட்டங்கள் & மானியங்கள்
          </Text>

          {govSchemes.map((scheme) => (
            <View
              key={scheme.id}
              style={[styles.schemeCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
            >
              <Text style={[styles.schemeTitle, { color: colors.text }]}>{scheme.tamilName}</Text>
              <View style={styles.subsidyBadge}>
                <Sparkles size={13} color="#10b981" />
                <Text style={styles.subsidyText}>{scheme.subsidy}</Text>
              </View>

              <Text style={[styles.schemeMeta, { color: colors.textSecondary }]}>
                🎯 தகுதி: {scheme.eligibility}
              </Text>

              <View style={styles.docsRequired}>
                <Text style={[styles.docsTitle, { color: colors.textMuted }]}>தேவையான ஆவணங்கள்:</Text>
                {scheme.requiredDocuments.map((doc, idx) => (
                  <Text key={idx} style={[styles.docItem, { color: colors.textSecondary }]}>
                    • {doc}
                  </Text>
                ))}
              </View>

              <View style={styles.schemeFooter}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <PhoneCall size={13} color="#10b981" />
                  <Text style={styles.helplineText}>{scheme.contactHelpline}</Text>
                </View>
                <TouchableOpacity
                  style={styles.portalBtn}
                  onPress={() => Linking.openURL(scheme.portalUrl)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.portalBtnText}>விண்ணப்பிக்க ↗</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* ─── Video Player Modal (In-App Player) ─── */}
      <Modal
        visible={!!activeVideoModal}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveVideoModal(null)}
      >
        <View style={styles.videoModalContainer}>
          <View style={[styles.videoModalContent, { backgroundColor: colors.card }]}>
            <View style={styles.videoModalHeader}>
              <Text style={[styles.videoModalTitle, { color: colors.text }]} numberOfLines={1}>
                {activeVideoModal?.title}
              </Text>
              <TouchableOpacity
                onPress={() => setActiveVideoModal(null)}
                style={styles.closeModalBtn}
              >
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {activeVideoModal?.videoId && (
              <View style={styles.videoPlayerBox}>
                <WebView
                  style={{ flex: 1 }}
                  javaScriptEnabled
                  domStorageEnabled
                  allowsFullscreenVideo
                  source={{
                    uri: `https://www.youtube.com/embed/${activeVideoModal.videoId}?autoplay=1&controls=1`,
                  }}
                />
              </View>
            )}

            <View style={styles.videoModalFooter}>
              <Text style={[styles.videoModalDesc, { color: colors.textSecondary }]}>
                {activeVideoModal?.description}
              </Text>
              <TouchableOpacity
                style={styles.whatsappShareModalBtn}
                onPress={() =>
                  handleShareWhatsApp(
                    activeVideoModal?.title || '',
                    activeVideoModal?.url || ''
                  )
                }
              >
                <Share2 size={16} color="#fff" />
                <Text style={styles.whatsappShareModalText}>விவசாயிகளுக்கு பகிரவும்</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ─── Crop Guide Details Modal ─── */}
      <Modal
        visible={!!selectedCropModal}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedCropModal(null)}
      >
        <View style={styles.videoModalContainer}>
          <View style={[styles.cropModalContent, { backgroundColor: colors.card }]}>
            <View style={styles.videoModalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cropModalTitle, { color: colors.text }]}>
                  {selectedCropModal?.name}
                </Text>
                <Text style={[styles.cropModalSci, { color: colors.textMuted }]}>
                  {selectedCropModal?.scientificName}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedCropModal(null)}
                style={styles.closeModalBtn}
              >
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 480 }} showsVerticalScrollIndicator={false}>
              {/* Highlights */}
              <View style={styles.cropModalSection}>
                <Text style={styles.modalSectionTitle}>🌟 முக்கிய சிறப்பம்சங்கள்</Text>
                {selectedCropModal?.highlights.map((h, i) => (
                  <Text key={i} style={[styles.modalBullet, { color: colors.textSecondary }]}>
                    • {h}
                  </Text>
                ))}
              </View>

              {/* Cultivation Steps */}
              <View style={styles.cropModalSection}>
                <Text style={styles.modalSectionTitle}>🌱 சாகுபடி படிகள்</Text>
                {selectedCropModal?.cultivationSteps.map((step, i) => (
                  <View key={i} style={styles.stepBox}>
                    <Text style={[styles.stepTitle, { color: colors.text }]}>{step.title}</Text>
                    <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                      {step.desc}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Pests & Remedies */}
              <View style={styles.cropModalSection}>
                <Text style={styles.modalSectionTitle}>🛡️ பூச்சி & நோய் இயற்கை தீர்வுகள்</Text>
                {selectedCropModal?.pestsAndRemedies.map((p, i) => (
                  <View
                    key={i}
                    style={[styles.pestCard, { backgroundColor: colors.inputBg }]}
                  >
                    <Text style={styles.pestName}>🐛 {p.pest}</Text>
                    <Text style={styles.remedyOrganic}>🌿 இயற்கை: {p.organicRemedy}</Text>
                    <Text style={styles.remedyChem}>🧪 பரிந்துரை: {p.chemicalRemedy}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: Platform.OS === 'android' ? 44 : 54,
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  hubBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  hubBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10b981',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  rentoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#10b981',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  rentoBtnText: {
    color: '#070C18',
    fontSize: 11,
    fontWeight: '800',
  },
  seasonStrip: {
    backgroundColor: 'rgba(16,185,129,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 10,
  },
  seasonText: {
    fontSize: 11,
    color: '#34d399',
    fontWeight: '600',
  },
  tabsScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  mainTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)',
  },
  mainTabActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  mainTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10b981',
  },
  mainTabTextActive: {
    color: '#070C18',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 130,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 14,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#070C18',
    fontWeight: '700',
  },

  // ─── Video Cards (TvO) ───
  videoCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  thumbnailContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
    backgroundColor: '#000',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  playCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(16,185,129,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 3,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  durationText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ec4899',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  featuredBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  videoInfo: {
    padding: 14,
  },
  videoTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
    lineHeight: 20,
  },
  videoDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 10,
  },
  videoActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 8,
  },
  videoAuthor: {
    fontSize: 11,
  },
  shareIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(37,211,102,0.1)',
  },
  shareIconText: {
    color: '#25D366',
    fontSize: 11,
    fontWeight: '700',
  },
  watchBtn: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  watchBtnText: {
    color: '#070C18',
    fontSize: 11,
    fontWeight: '800',
  },

  // ─── Daily Tasks ───
  progressCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#10b981',
  },
  progressSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  progressPercent: {
    fontSize: 20,
    fontWeight: '900',
    color: '#10b981',
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  taskCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  taskCardCompleted: {
    opacity: 0.7,
    borderColor: '#10b981',
  },
  taskLeftRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkCircleBox: {
    paddingTop: 2,
  },
  taskTopMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  taskStageBadge: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  timingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskTiming: {
    fontSize: 10,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
  },
  taskDetails: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 6,
  },
  tipsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16,185,129,0.08)',
    padding: 6,
    borderRadius: 6,
  },
  tipsText: {
    fontSize: 11,
    color: '#34d399',
    fontWeight: '600',
  },

  // ─── Crop Guides ───
  cropCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  cropCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cropName: {
    fontSize: 16,
    fontWeight: '800',
  },
  cropSciName: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 1,
  },
  cropTagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  cropTagText: {
    fontSize: 10,
    fontWeight: '800',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '800',
  },
  cropCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  cropDetailsHint: {
    fontSize: 11,
    color: '#10b981',
    fontWeight: '600',
  },
  cropArrowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  cropArrowText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10b981',
  },

  // ─── AI Tools Hub ───
  aiToolPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  aiToolPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  aiToolPillActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  aiToolPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  aiToolPillTextActive: {
    color: '#070C18',
  },
  aiMainCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    marginBottom: 18,
  },
  aiCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiCardTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  aiCardSubtitle: {
    fontSize: 11,
    marginTop: 1,
    lineHeight: 15,
  },
  smartSelectorsBox: {
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    gap: 8,
  },
  selectorGroup: {
    gap: 4,
  },
  selectorLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  selectorChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginRight: 6,
  },
  selectorChipActive: {
    backgroundColor: '#10b981',
  },
  selectorChipText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  selectorChipTextActive: {
    color: '#070C18',
    fontWeight: '800',
  },
  doctorInputContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    alignItems: 'flex-end',
    gap: 8,
  },
  doctorTextInput: {
    flex: 1,
    minHeight: 54,
    fontSize: 13,
    textAlignVertical: 'top',
  },
  doctorSendBtn: {
    backgroundColor: '#10b981',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorResultBox: {
    marginTop: 14,
    backgroundColor: 'rgba(16,185,129,0.08)',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
  },
  resultTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  resultBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#34d399',
  },
  doctorResultText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#e2e8f0',
  },
  shareReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: 10,
    backgroundColor: 'rgba(37,211,102,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  shareReportText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#25D366',
  },
  presetHeading: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
  },
  presetsGrid: {
    gap: 10,
  },
  presetCard: {
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
  },
  presetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  presetTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  presetQuery: {
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 6,
  },
  presetAction: {
    alignSelf: 'flex-end',
  },
  presetActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10b981',
  },

  // ─── Government Schemes ───
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
  },
  schemeCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  schemeTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
  },
  subsidyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16,185,129,0.12)',
    padding: 6,
    borderRadius: 6,
    marginBottom: 8,
  },
  subsidyText: {
    fontSize: 11,
    color: '#10b981',
    fontWeight: '700',
  },
  schemeMeta: {
    fontSize: 11,
    marginBottom: 6,
  },
  docsRequired: {
    marginBottom: 10,
  },
  docsTitle: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 2,
  },
  docItem: {
    fontSize: 11,
    lineHeight: 15,
  },
  schemeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 8,
  },
  helplineText: {
    fontSize: 11,
    color: '#10b981',
    fontWeight: '600',
  },
  portalBtn: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  portalBtnText: {
    color: '#070C18',
    fontSize: 11,
    fontWeight: '800',
  },

  // ─── Video & Crop Modals ───
  videoModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    padding: 16,
  },
  videoModalContent: {
    borderRadius: 18,
    overflow: 'hidden',
    maxHeight: '85%',
  },
  cropModalContent: {
    borderRadius: 18,
    padding: 18,
    maxHeight: '85%',
  },
  videoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  videoModalTitle: {
    fontSize: 15,
    fontWeight: '800',
    flex: 1,
    marginRight: 8,
  },
  closeModalBtn: {
    padding: 4,
  },
  videoPlayerBox: {
    height: 220,
    width: '100%',
    backgroundColor: '#000',
  },
  videoModalFooter: {
    padding: 14,
  },
  videoModalDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
  },
  whatsappShareModalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#25D366',
    padding: 12,
    borderRadius: 10,
  },
  whatsappShareModalText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  cropModalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  cropModalSci: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  cropModalSection: {
    marginBottom: 16,
  },
  modalSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#10b981',
    marginBottom: 6,
  },
  modalBullet: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 3,
  },
  stepBox: {
    marginBottom: 8,
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  stepDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  pestCard: {
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
  },
  pestName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#f87171',
    marginBottom: 2,
  },
  remedyOrganic: {
    fontSize: 11,
    color: '#34d399',
    marginBottom: 1,
  },
  remedyChem: {
    fontSize: 11,
    color: '#94a3b8',
  },
});
