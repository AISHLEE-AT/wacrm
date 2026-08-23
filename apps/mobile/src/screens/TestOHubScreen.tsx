import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  TextInput,
  Modal,
  Platform,
  PermissionsAndroid,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import { aishleeSupabase } from '../services/aishleeSupabase';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NativeSpeech from '../lib/NativeSpeech';
import VoiceSpeechBridge, { VoiceSpeechBridgeRef } from '../components/VoiceSpeechBridge';
import PaymentQRModal from '../components/PaymentQRModal';
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Search,
  Award,
  FileCheck2,
  Sparkles,
  ArrowRight,
  Clock,
  Mic,
  MicOff,
  X,
  Volume2,
  ShoppingCart,
  ShieldCheck,
  Flame,
  Zap,
  GraduationCap,
  Users,
  CheckCircle2,
  Layers,
  FileText,
  BookOpen,
  PlayCircle,
  Target,
  Compass,
} from 'lucide-react-native';
import { getCourseSyllabus, SyllabusUnit } from '../lib/courseCatalogMaster';
import { fetchTestOMcqsForTopic } from '../lib/coursePlayerEngine';

const EXAM_CATEGORIES = [
  { id: 'all', label: 'All Exams', icon: Layers },
  { id: 'neet_jee', label: 'NEET & JEE', icon: Zap },
  { id: 'tnpsc_govt', label: 'TNPSC & Govt', icon: Award },
  { id: 'ssc_bank', label: 'SSC & Banking', icon: FileCheck2 },
  { id: 'school', label: 'School 8–12', icon: GraduationCap },
  { id: 'tech', label: 'Tech & Coding', icon: Sparkles },
  { id: 'pyq', label: 'PYQ Papers', icon: BookOpen },
];

export const SYLLABUS_TEST_COURSES = [
  { id: 'class_12_tamil_nadu', label: 'Class 12 Board', subtitle: 'Maths, Physics, Chem, Bio, Commerce, Accounts, CS, Tamil, English', icon: GraduationCap, category: 'school' },
  { id: 'class_11_tamil_nadu', label: 'Class 11 Board', subtitle: 'State Board & CBSE Full Syllabus', icon: GraduationCap, category: 'school' },
  { id: 'class_10_tamil_nadu', label: 'Class 10 SSLC', subtitle: 'Tamil, English, Maths, Science, Social', icon: GraduationCap, category: 'school' },
  { id: 'class_9_tamil_nadu', label: 'Class 9th Standard', subtitle: 'All 5 Subjects Complete Samacheer', icon: GraduationCap, category: 'school' },
  { id: 'class_8_tamil_nadu', label: 'Class 8th Standard', subtitle: 'Middle School Samacheer Kalvi', icon: GraduationCap, category: 'school' },
  { id: 'neet_ug_2026', label: 'NEET UG 2026', subtitle: 'Physics, Chemistry, Botany, Zoology (720 Marks)', icon: Zap, category: 'neet_jee' },
  { id: 'jee_main_advanced_2026', label: 'JEE Main & Adv', subtitle: 'Physics, Chemistry, Mathematics (300 Marks)', icon: Zap, category: 'neet_jee' },
  { id: 'tnpsc_group_1_2_4', label: 'TNPSC Gr 1, 2, 4 & VAO', subtitle: 'General Tamil 100M, GK 75M, Aptitude 25M', icon: Award, category: 'tnpsc_govt' },
  { id: 'tn_police_si_constable', label: 'Police SI & Constable', subtitle: 'Tamil Eligibility, GK & Psychology 140M', icon: Award, category: 'tnpsc_govt' },
  { id: 'banking_ibps_sbi_po_clerk', label: 'Banking & Insurance', subtitle: 'IBPS/SBI PO & Clerk: Quant, Reasoning, English, GA', icon: FileCheck2, category: 'ssc_bank' },
  { id: 'ssc_cgl_chsl_rrb_railway', label: 'SSC & RRB Railway', subtitle: 'SSC CGL/CHSL & RRB NTPC: Advance Maths & GA', icon: FileCheck2, category: 'ssc_bank' },
  { id: 'trb_tntet_teachers_exam', label: 'TRB & TNTET Exams', subtitle: 'Pedagogy, Child Development & School Subjects', icon: BookOpen, category: 'tnpsc_govt' },
  { id: 'gate_engineering', label: 'GATE 2026 & B.Tech', subtitle: 'CS/IT: Linear Algebra, OS, DBMS, Networks, TOC', icon: Sparkles, category: 'tech' },
  { id: 'college_tech_skills', label: 'Degree Tech & AI', subtitle: 'React 19, TypeScript, Python 3.12 AI/ML, LeetCode DSA', icon: Sparkles, category: 'tech' },
];

export default function TestOHubScreen({ route }: any) {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isTestPassPurchased, setIsTestPassPurchased] = useState(false);
  const [searchQuery, setSearchQuery] = useState(route?.params?.searchQuery || route?.params?.topic || '');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceLang, setVoiceLang] = useState<'ta-IN' | 'en-IN'>('ta-IN');
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceStatus, setVoiceStatus] = useState('Tap Mic to speak');
  const voiceBridgeRef = useRef<VoiceSpeechBridgeRef>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  // ─── DUAL VIEW MODE: MOCK EXAMS vs SYLLABUS-WISE MICRO-TOPIC CBT ───
  const [testoViewMode, setTestoViewMode] = useState<'mock_tests' | 'syllabus_cbt'>(
    route?.params?.mode === 'syllabus' ? 'syllabus_cbt' : 'mock_tests'
  );
  const [selectedSyllabusCourseId, setSelectedSyllabusCourseId] = useState<string>(
    route?.params?.courseId || 'class_12_tamil_nadu'
  );
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});
  const [cbtLaunchingTopic, setCbtLaunchingTopic] = useState<string | null>(null);

  const activeSyllabusCourse = useMemo(() => {
    return SYLLABUS_TEST_COURSES.find(c => c.id === selectedSyllabusCourseId) || SYLLABUS_TEST_COURSES[0];
  }, [selectedSyllabusCourseId]);

  const activeSyllabusUnits: SyllabusUnit[] = useMemo(() => {
    return getCourseSyllabus(activeSyllabusCourse.id, activeSyllabusCourse.category);
  }, [activeSyllabusCourse]);

  const toggleChapter = (chapKey: string) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapKey]: prev[chapKey] === undefined ? false : !prev[chapKey]
    }));
  };

  const launchMicroTopicCbt = async (microTopicTitle: string, courseTitle: string) => {
    try {
      setCbtLaunchingTopic(microTopicTitle);
      const qs = await fetchTestOMcqsForTopic(microTopicTitle, courseTitle, 10);
      setCbtLaunchingTopic(null);
      navigation.navigate('TestOExamScreen', {
        testId: `micro_${microTopicTitle.toLowerCase().replace(/[^a-z0-9_]/g, '_')}`,
        title: `${microTopicTitle} • 10-Q CBT Test`,
        questionCount: qs.length || 10,
        markingScheme: '+4 / -1',
        localQuestions: qs
      });
    } catch (err: any) {
      setCbtLaunchingTopic(null);
      Alert.alert('CBT Launch', 'Unable to start CBT test: ' + err.message);
    }
  };

  const openCoursePlayerForMicroTopic = (
    microTopicTitle: string,
    courseTitle: string,
    courseId: string,
    category?: string
  ) => {
    navigation.navigate('TeachOCourseScreen', {
      course: {
        id: courseId,
        title_name: courseTitle,
        category: category || 'general'
      },
      activeTab: 'curriculum',
      initialMicroTopic: microTopicTitle
    });
  };

  // Handle incoming route params when navigated
  useEffect(() => {
    if (route?.params?.searchQuery) {
      setSearchQuery(route.params.searchQuery);
    } else if (route?.params?.topic) {
      setSearchQuery(route.params.topic);
    } else if (route?.params?.courseTitle) {
      setSearchQuery(route.params.courseTitle);
    }
    if (route?.params?.mode) {
      setTestoViewMode(route.params.mode === 'syllabus' ? 'syllabus_cbt' : 'mock_tests');
    }
    if (route?.params?.courseId) {
      setSelectedSyllabusCourseId(route.params.courseId);
    }
  }, [route?.params]);

  // ─── Pulse Animation for Voice Mic ───
  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 650,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 650,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening, pulseAnim]);

  // ─── Request Microphone Permission ───
  const requestMicPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission Required',
            message: 'SuprO TestO needs microphone access for exam voice search in Tamil and English.',
            buttonPositive: 'Grant Permission',
            buttonNegative: 'Cancel',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Mic permission error:', err);
        return false;
      }
    }
    return true;
  }, []);

  const startVoiceListening = useCallback(async (lang = voiceLang) => {
    const ok = await requestMicPermission();
    if (!ok) {
      setVoiceStatus('Microphone permission denied. Please grant in Settings.');
      Alert.alert('Microphone Required', 'Please enable microphone access in your phone Settings to use Voice Search.');
      return;
    }
    setVoiceTranscript('');
    setIsListening(true);
    setVoiceStatus(
      lang === 'ta-IN'
        ? 'தமிழில் பேசவும் (Listening in Tamil)...'
        : 'Speak now (Listening in English)...'
    );

    // 1. Try Native Android Speech Recognizer first
    try {
      const isAvail = await NativeSpeech.isAvailable();
      if (isAvail) {
        await NativeSpeech.startListening(lang, {
          onStart: () => {
            setIsListening(true);
            setVoiceStatus(lang === 'ta-IN' ? 'தமிழில் பேசவும்...' : 'Listening now...');
          },
          onResult: (text, isFinal) => {
            setVoiceTranscript(text);
            setVoiceStatus(`Recognized: "${text}"`);
            if (isFinal && text.trim().length > 0) {
              setTimeout(() => {
                setSearchQuery(text.trim());
                handleVoiceModalClose();
              }, 600);
            }
          },
          onEnd: () => {
            setIsListening(false);
          },
          onError: (err) => {
            setIsListening(false);
            setVoiceStatus(err);
          },
        });
        return;
      }
    } catch (e) {
      console.warn('NativeSpeech fallback to bridge in TestO:', e);
    }

    // Fallback: Voice Bridge
    voiceBridgeRef.current?.startListening(lang);
  }, [voiceLang, requestMicPermission]);

  const stopVoiceListening = useCallback(() => {
    setIsListening(false);
    setVoiceStatus('Voice search stopped. Tap Mic to speak.');
    NativeSpeech.stopListening().catch(() => {});
    voiceBridgeRef.current?.stopListening();
  }, []);

  const handleVoiceModalOpen = () => {
    setIsVoiceModalOpen(true);
    setVoiceTranscript('');
    setTimeout(() => {
      startVoiceListening(voiceLang);
    }, 400);
  };

  const handleVoiceModalClose = () => {
    stopVoiceListening();
    setIsVoiceModalOpen(false);
  };

  const handleLangSwitch = (lang: 'ta-IN' | 'en-IN') => {
    setVoiceLang(lang);
    if (isListening) {
      stopVoiceListening();
      setTimeout(() => {
        startVoiceListening(lang);
      }, 300);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const { data, error } = await aishleeSupabase
        .from('unified_master_data')
        .select('*')
        .eq('item_type', 'o_test')
        .limit(2000);

      if (error) throw error;

      const groups: Record<string, any[]> = {};

      (data || []).forEach(item => {
        let ai = item.additional_info;
        if (typeof ai === 'string') {
          try {
            ai = JSON.parse(ai);
          } catch (e) {}
        }

        if (ai && ai.questions && ai.questions.length > 0) {
          const title = item.title_name || '';
          let courseName = 'General Tests';
          let testName = title;

          if (title.includes(':')) {
            const parts = title.split(':');
            courseName = parts[0].trim();
            testName = parts.slice(1).join(':').trim();
          }

          item.displayTitle = testName;
          item.questionCount = ai.questions.length;

          if (!groups[courseName]) {
            groups[courseName] = [];
          }
          groups[courseName].push(item);
        }
      });

      const formattedSections = Object.keys(groups).map(key => ({
        title: key,
        data: groups[key],
      }));

      setSections(formattedSections);
    } catch (err) {
      console.error('Error fetching tests:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSections = useMemo(() => {
    let result = sections;

    if (selectedCategory !== 'all') {
      result = result
        .map(sec => {
          const secTitle = (sec.title || '').toLowerCase();
          const matchesCategory = (t: any) => {
            const title = ((t.displayTitle || '') + ' ' + (t.title_name || '')).toLowerCase();
            if (selectedCategory === 'neet_jee') {
              return title.includes('neet') || title.includes('jee') || secTitle.includes('neet') || secTitle.includes('jee');
            }
            if (selectedCategory === 'tnpsc_govt') {
              return title.includes('tnpsc') || title.includes('vao') || title.includes('upsc') || secTitle.includes('tnpsc') || secTitle.includes('govt');
            }
            if (selectedCategory === 'ssc_bank') {
              return title.includes('ssc') || title.includes('bank') || title.includes('rrb') || title.includes('ibps') || title.includes('sbi');
            }
            if (selectedCategory === 'school') {
              return title.includes('class') || title.includes('samacheer') || title.includes('cbse') || secTitle.includes('class');
            }
            if (selectedCategory === 'tech') {
              return title.includes('python') || title.includes('code') || title.includes('web') || title.includes('data') || title.includes('cyber');
            }
            if (selectedCategory === 'pyq') {
              return title.includes('pyq') || title.includes('previous') || title.includes('202') || title.includes('exam');
            }
            return true;
          };

          return {
            ...sec,
            data: sec.data.filter(matchesCategory),
          };
        })
        .filter(sec => sec.data.length > 0);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result
        .map(sec => ({
          ...sec,
          data: sec.data.filter(
            (t: any) =>
              (t.displayTitle && t.displayTitle.toLowerCase().includes(q)) ||
              (t.title_name && t.title_name.toLowerCase().includes(q)) ||
              (sec.title && sec.title.toLowerCase().includes(q))
          ),
        }))
        .filter(sec => sec.data.length > 0);
    }

    return result;
  }, [sections, selectedCategory, searchQuery]);

  const openCourseSyllabus = (courseName: string, category?: string) => {
    const cleanTitle = courseName || 'Academic Course Syllabus';
    const cleanId = cleanTitle.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    navigation.navigate('TeachOCourseScreen', {
      course: {
        id: cleanId,
        title_name: cleanTitle,
        category: category || selectedCategory || 'general'
      },
      activeTab: 'curriculum'
    });
  };

  const renderTestCard = ({ item }: { item: any }) => {
    const qCount = item.questionCount || 25;
    const maxMarks = qCount * 4;
    const isNeetJee = (item.title_name || '').toLowerCase().includes('neet') || (item.title_name || '').toLowerCase().includes('jee');
    const isGovt = (item.title_name || '').toLowerCase().includes('tnpsc') || (item.title_name || '').toLowerCase().includes('ssc');
    const markingScheme = isNeetJee ? '+4 / -1' : isGovt ? '+1.5 / -0' : '+1 / -0.25';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate('TestOExamScreen', {
            testId: item.id,
            title: item.displayTitle || item.title_name,
            questionCount: qCount,
            markingScheme,
          })
        }
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <View style={styles.cbtPill}>
                <Text style={styles.cbtPillText}>CBT MOCK</Text>
              </View>
              <View style={styles.markingPill}>
                <Text style={styles.markingPillText}>{markingScheme}</Text>
              </View>
            </View>
            <Text style={styles.cardTitle}>{item.displayTitle || item.title_name}</Text>
          </View>
          <View style={styles.badge}>
            <Award size={11} color="#10b981" style={{ marginRight: 4 }} />
            <Text style={styles.badgeText}>{qCount} Qs</Text>
          </View>
        </View>

        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description_purpose ||
            item.description ||
            'Timed examination with instant scorecard analytics, negative marking & verifiable certificate.'}
        </Text>

        <View style={styles.cardMetaRow}>
          <View style={styles.timeInfo}>
            <Clock size={11} color="#64748b" style={{ marginRight: 3 }} />
            <Text style={styles.timeText}>30 Mins</Text>
          </View>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.metaSubText}>{maxMarks} Marks</Text>
          <Text style={styles.metaDot}>•</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Users size={11} color="#64748b" style={{ marginRight: 3 }} />
            <Text style={styles.metaSubText}>3.8k attempts</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={styles.syllabusBtn}
            onPress={() => {
              const secCourseName = item.title_name?.includes(':')
                ? item.title_name.split(':')[0].trim()
                : (item.displayTitle || item.title_name || 'Course');
              openCourseSyllabus(secCourseName, item.category);
            }}
          >
            <BookOpen size={12} color="#10b981" style={{ marginRight: 4 }} />
            <Text style={styles.syllabusBtnText}>Syllabus ➔</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.startBtn}
            onPress={() =>
              navigation.navigate('TestOExamScreen', {
                testId: item.id,
                title: item.displayTitle || item.title_name,
                questionCount: qCount,
                markingScheme,
              })
            }
          >
            <FileCheck2 size={13} color="#0a0f1e" style={{ marginRight: 4 }} />
            <Text style={styles.startBtnText}>Start Test</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section: { title, data } }: any) => (
    <View style={styles.sectionHeader}>
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionCount}>{data.length} Tests Available</Text>
      </View>
      <TouchableOpacity
        style={styles.sectionSyllabusBadge}
        onPress={() => openCourseSyllabus(title)}
      >
        <BookOpen size={11} color="#38bdf8" style={{ marginRight: 4 }} />
        <Text style={styles.sectionSyllabusText}>View Syllabus ➔</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.safeArea, { paddingTop: insets.top }]}>
        <StatusBar barStyle="light-content" backgroundColor="#0a0f1e" />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>Loading TestO Exam Hub...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0f1e" />

      {/* Navigation Header */}
      <View
        style={[
          styles.navBar,
          {
            paddingTop:
              Math.max(
                insets.top,
                Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0
              ) + 8,
          },
        ]}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.navTitle}>Test<Text style={{ color: '#10b981' }}>O</Text></Text>
              <View style={styles.eduBadge}>
                <Sparkles size={10} color="#10b981" style={{ marginRight: 3 }} />
                <Text style={styles.eduBadgeText}>Exam Engine</Text>
              </View>
            </View>

            {/* Top TestO Purchase Status Pill */}
            {isTestPassPurchased ? (
              <View style={styles.topPassBadge}>
                <ShieldCheck size={11} color="#10b981" />
                <Text style={styles.topPassBadgeText}>PASS UNLOCKED</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.topPassUnlockBtn}
                onPress={() => setIsPaymentModalOpen(true)}
                activeOpacity={0.85}
              >
                <ShoppingCart size={11} color="#0B1120" />
                <Text style={styles.topPassUnlockText}>Pass ₹99</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.navSub}>National Standard Mock Tests & Assessments</Text>
        </View>
      </View>

      {/* Search Filter with Mic */}
      <View style={styles.searchBar}>
        <Search size={18} color="#94a3b8" style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Search tests, TNPSC, Banking, NEET, Coding..."
          placeholderTextColor="#64748b"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
        <TouchableOpacity
          style={styles.micBtn}
          onPress={handleVoiceModalOpen}
        >
          <Mic size={18} color="#10b981" />
        </TouchableOpacity>
      </View>

      {/* 🎯 TestO Dual Mode Switcher: Full Mock Exams vs Syllabus & Micro-Topic CBT */}
      <View style={styles.modeSwitcherContainer}>
        <TouchableOpacity
          style={[styles.modeBtn, testoViewMode === 'mock_tests' && styles.modeBtnActive]}
          onPress={() => setTestoViewMode('mock_tests')}
          activeOpacity={0.8}
        >
          <Layers size={13} color={testoViewMode === 'mock_tests' ? '#0a0f1e' : '#94a3b8'} style={{ marginRight: 6 }} />
          <Text style={[styles.modeBtnText, testoViewMode === 'mock_tests' && styles.modeBtnTextActive]}>
            Full Mock Exams & Tests
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeBtn, testoViewMode === 'syllabus_cbt' && styles.modeBtnActive]}
          onPress={() => setTestoViewMode('syllabus_cbt')}
          activeOpacity={0.8}
        >
          <Target size={13} color={testoViewMode === 'syllabus_cbt' ? '#0a0f1e' : '#94a3b8'} style={{ marginRight: 6 }} />
          <Text style={[styles.modeBtnText, testoViewMode === 'syllabus_cbt' && styles.modeBtnTextActive]}>
            Syllabus & Micro-Topic CBT
          </Text>
        </TouchableOpacity>
      </View>

      {/* ─── VIEW 1: SYLLABUS & MICRO-TOPIC CBT EXPLORER ─── */}
      {testoViewMode === 'syllabus_cbt' ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 120 }}
          showsVerticalScrollIndicator={true}
        >
          {/* Course Selector Horizontal Carousel */}
          <View style={{ marginBottom: 12 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
              {SYLLABUS_TEST_COURSES.map(courseItem => {
                const isSelected = selectedSyllabusCourseId === courseItem.id;
                const IconComp = courseItem.icon;
                return (
                  <TouchableOpacity
                    key={courseItem.id}
                    style={[styles.syllabusCourseCard, isSelected && styles.syllabusCourseCardActive]}
                    onPress={() => setSelectedSyllabusCourseId(courseItem.id)}
                    activeOpacity={0.8}
                  >
                    <IconComp size={14} color={isSelected ? '#0a0f1e' : '#10b981'} style={{ marginRight: 6 }} />
                    <Text style={[styles.syllabusCourseText, isSelected && styles.syllabusCourseTextActive]}>
                      {courseItem.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Course Header Banner */}
          <View style={styles.courseHeaderBanner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.courseHeaderTitle}>{activeSyllabusCourse.label}</Text>
              <Text style={styles.courseHeaderSubtitle}>{activeSyllabusCourse.subtitle}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <View style={styles.metaBadge}>
                  <Text style={styles.metaBadgeText}>{activeSyllabusUnits.length} Subject Units</Text>
                </View>
                <View style={[styles.metaBadge, { backgroundColor: '#38bdf820', borderColor: '#38bdf8' }]}>
                  <Text style={[styles.metaBadgeText, { color: '#38bdf8' }]}>10-Q CBT & Player Ready</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Units & Chapters & Micro-Topics List */}
          <View style={{ paddingHorizontal: 16 }}>
            {activeSyllabusUnits.map((unit, uIdx) => {
              const hasChapters = unit.chapters && unit.chapters.length > 0;
              return (
                <View key={unit.id || uIdx} style={{ marginBottom: 16 }}>
                  {/* Subject / Unit Header */}
                  <View style={styles.syllabusUnitHeader}>
                    <View style={{ flex: 1 }}>
                      {unit.subjectName ? (
                        <Text style={styles.subjectPill}>{unit.subjectName}</Text>
                      ) : null}
                      <Text style={styles.unitTitleText}>
                        {unit.unitNumber ? `UNIT ${unit.unitNumber}: ` : ''}{unit.title}
                      </Text>
                    </View>
                  </View>

                  {/* Chapters */}
                  {hasChapters && unit.chapters?.map((chap, cIdx) => {
                    const chapKey = `${selectedSyllabusCourseId}-${uIdx}-${cIdx}`;
                    const isExpanded = expandedChapters[chapKey] !== false; // open by default
                    const chapTitle = chap.chapterTitle || chap.title || `Chapter ${cIdx + 1}`;
                    const hasSubtopics = chap.subtopics && chap.subtopics.length > 0;
                    const hasDirectMicro = chap.microTopics && chap.microTopics.length > 0;

                    return (
                      <View key={chapKey} style={styles.syllabusChapCard}>
                        <TouchableOpacity
                          style={styles.chapHeaderRow}
                          onPress={() => toggleChapter(chapKey)}
                          activeOpacity={0.8}
                        >
                          <View style={{ flex: 1 }}>
                            <Text style={styles.chapNumText}>CHAPTER {chap.chapterNumber || cIdx + 1}</Text>
                            <Text style={styles.chapTitleText}>{chapTitle}</Text>
                            {chap.tamilTitle || chap.chapterTamilTitle ? (
                              <Text style={styles.chapTamilText}>{chap.tamilTitle || chap.chapterTamilTitle}</Text>
                            ) : null}
                          </View>
                          {isExpanded ? <ChevronUp size={18} color="#10b981" /> : <ChevronDown size={18} color="#94a3b8" />}
                        </TouchableOpacity>

                        {isExpanded && (
                          <View style={styles.chapBody}>
                            {hasSubtopics ? (
                              chap.subtopics?.map((sub, sIdx) => (
                                <View key={sub.id || sIdx} style={styles.subtopicSection}>
                                  <Text style={styles.subtopicTitleText}>{sub.title}</Text>
                                  {sub.microTopics?.map((micro, mIdx) => {
                                    const mTitle = micro.title || micro.topicTitle || `Topic ${mIdx + 1}`;
                                    const isLaunchingThis = cbtLaunchingTopic === mTitle;
                                    return (
                                      <View key={micro.id || mIdx} style={styles.microTopicCard}>
                                        <View style={{ flex: 1, marginRight: 8 }}>
                                          <Text style={styles.microTitleText}>{mTitle}</Text>
                                          {micro.keyAxiom || micro.keyFormulaOrLaw ? (
                                            <Text style={styles.microAxiomText}>
                                              {micro.keyAxiom || micro.keyFormulaOrLaw}
                                            </Text>
                                          ) : null}
                                        </View>
                                        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                                          <TouchableOpacity
                                            style={styles.microCbtBtn}
                                            onPress={() => launchMicroTopicCbt(mTitle, activeSyllabusCourse.label)}
                                            disabled={isLaunchingThis}
                                          >
                                            {isLaunchingThis ? (
                                              <ActivityIndicator size="small" color="#0a0f1e" />
                                            ) : (
                                              <>
                                                <FileCheck2 size={11} color="#0a0f1e" style={{ marginRight: 3 }} />
                                                <Text style={styles.microCbtBtnText}>10-Q CBT</Text>
                                              </>
                                            )}
                                          </TouchableOpacity>
                                          <TouchableOpacity
                                            style={styles.microPlayerBtn}
                                            onPress={() => openCoursePlayerForMicroTopic(mTitle, activeSyllabusCourse.label, activeSyllabusCourse.id, activeSyllabusCourse.category)}
                                          >
                                            <Text style={styles.microPlayerBtnText}>Player ➔</Text>
                                          </TouchableOpacity>
                                        </View>
                                      </View>
                                    );
                                  })}
                                </View>
                              ))
                            ) : hasDirectMicro ? (
                              chap.microTopics?.map((micro, mIdx) => {
                                const mTitle = micro.topicTitle || micro.title || `Topic ${mIdx + 1}`;
                                const isLaunchingThis = cbtLaunchingTopic === mTitle;
                                return (
                                  <View key={micro.id || mIdx} style={styles.microTopicCard}>
                                    <View style={{ flex: 1, marginRight: 8 }}>
                                      <Text style={styles.microTitleText}>{mTitle}</Text>
                                      {micro.keyFormulaOrLaw || micro.keyAxiom ? (
                                        <Text style={styles.microAxiomText}>
                                          {micro.keyFormulaOrLaw || micro.keyAxiom}
                                        </Text>
                                      ) : null}
                                    </View>
                                    <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                                      <TouchableOpacity
                                        style={styles.microCbtBtn}
                                        onPress={() => launchMicroTopicCbt(mTitle, activeSyllabusCourse.label)}
                                        disabled={isLaunchingThis}
                                      >
                                        {isLaunchingThis ? (
                                          <ActivityIndicator size="small" color="#0a0f1e" />
                                        ) : (
                                          <>
                                            <FileCheck2 size={11} color="#0a0f1e" style={{ marginRight: 3 }} />
                                            <Text style={styles.microCbtBtnText}>10-Q CBT</Text>
                                          </>
                                        )}
                                      </TouchableOpacity>
                                      <TouchableOpacity
                                        style={styles.microPlayerBtn}
                                        onPress={() => openCoursePlayerForMicroTopic(mTitle, activeSyllabusCourse.label, activeSyllabusCourse.id, activeSyllabusCourse.category)}
                                      >
                                        <Text style={styles.microPlayerBtnText}>Player ➔</Text>
                                      </TouchableOpacity>
                                    </View>
                                  </View>
                                );
                              })
                            ) : null}
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              );
            })}
          </View>
        </ScrollView>
      ) : (
        /* ─── VIEW 2: FULL MOCK EXAMS & PYQ TESTS ─── */
        <>
          {/* 🏷️ Horizontal Exam Category Filter Pills */}
          <View style={{ marginBottom: 12 }}>
            <SectionList
              horizontal
              showsHorizontalScrollIndicator={false}
              sections={[{ title: '', data: EXAM_CATEGORIES }]}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
              renderItem={({ item }) => {
                const isSelected = selectedCategory === item.id;
                const IconComp = item.icon;
                return (
                  <TouchableOpacity
                    style={[
                      styles.categoryPill,
                      isSelected && styles.categoryPillActive,
                    ]}
                    onPress={() => setSelectedCategory(item.id)}
                    activeOpacity={0.7}
                  >
                    <IconComp size={12} color={isSelected ? '#0a0f1e' : '#94a3b8'} style={{ marginRight: 4 }} />
                    <Text style={[styles.categoryPillText, isSelected && styles.categoryPillTextActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>

          {/* 🎓 Master Syllabus & Micro-Topic Player Navigation Hub */}
          <TouchableOpacity
            style={styles.topSyllabusBanner}
            onPress={() => {
              const catCourseMap: Record<string, string> = {
                neet_jee: 'NEET & JEE Complete Foundation',
                tnpsc_govt: 'TNPSC Group 1, 2 & 4 Master Syllabus',
                ssc_bank: 'Banking, SSC & Railway Master Course',
                school: 'Tamil Nadu Class 10 & 12 Complete Syllabus',
                tech: 'Full-Stack Web & AI Engineering',
                pyq: 'Previous Year Question Analysis Hub',
                all: 'Tamil Nadu School & Competitive Exams Master Hub'
              };
              openCourseSyllabus(catCourseMap[selectedCategory] || 'Academic Syllabus Master');
            }}
            activeOpacity={0.85}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View style={styles.syllabusBannerIconWrap}>
                <GraduationCap size={20} color="#10b981" />
              </View>
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={styles.syllabusBannerTitle}>
                  2026 Micro-Topic Syllabus & Course Player
                </Text>
                <Text style={styles.syllabusBannerSub}>
                  Subject ➔ Chapter ➔ Subtopic ➔ Micro-topic Player
                </Text>
              </View>
            </View>
            <ArrowRight size={18} color="#10b981" />
          </TouchableOpacity>

          {/* 🔥 All-India Free Daily Live Mock Test Banner */}
          <View style={styles.liveMockCard}>
            <View style={styles.liveMockHeader}>
              <View style={styles.liveTag}>
                <Flame size={12} color="#ef4444" />
                <Text style={styles.liveTagText}>TODAY'S ALL-INDIA LIVE MOCK</Text>
              </View>
              <Text style={styles.liveTimerText}>⏳ Ends in 04h 30m</Text>
            </View>
            <Text style={styles.liveMockTitle}>National Standard General Aptitude & Core Concepts (CBT)</Text>
            <View style={styles.liveMockDetails}>
              <Text style={styles.liveMockDetailText}>📝 30 Questions • ⏰ 30 Mins • 🏆 All India Live Ranking</Text>
            </View>
            <View style={styles.liveMockFooter}>
              <View style={styles.liveUsersRow}>
                <Users size={12} color="#10b981" />
                <Text style={styles.liveUsersText}>14,890 Students Registered</Text>
              </View>
              <TouchableOpacity
                style={styles.liveAttemptBtn}
                onPress={() => {
                  if (sections.length > 0 && sections[0].data.length > 0) {
                    const firstTest = sections[0].data[0];
                    navigation.navigate('TestOExamScreen', {
                      testId: firstTest.id,
                      title: 'All-India Live Free Mock Test 2026',
                      questionCount: 30,
                      markingScheme: '+4 / -1',
                    });
                  } else {
                    Alert.alert('Live Test', 'Loading live test server. Please tap on any test below.');
                  }
                }}
              >
                <Text style={styles.liveAttemptBtnText}>Take Free Test ⚡</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 💳 Test Series Pass Unlock Banner */}
          <TouchableOpacity
            style={styles.testoUnlockBanner}
            onPress={() => setIsPaymentModalOpen(true)}
            activeOpacity={0.85}
          >
            <View style={styles.testoUnlockIconBox}>
              <ShoppingCart size={16} color="#fbbf24" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={styles.testoUnlockTitle}>Unlock All Test Series (₹99)</Text>
                <View style={styles.testoUnlockPriceBadge}>
                  <Text style={styles.testoUnlockPriceText}>Instant Pass</Text>
                </View>
              </View>
              <Text style={styles.testoUnlockDesc}>
                1-Tap UPI / GPay unlock for all standard & chapter exams with certificate.
              </Text>
            </View>
          </TouchableOpacity>

          <SectionList
            sections={filteredSections}
            keyExtractor={item => item.id}
            renderItem={renderTestCard}
            renderSectionHeader={renderSectionHeader}
            contentContainerStyle={[
              styles.listContainer,
              { paddingBottom: Math.max(insets.bottom, 16) + 120 },
            ]}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <FileCheck2 size={44} color="#334155" style={{ marginBottom: 10 }} />
                <Text style={styles.emptyText}>No mock tests match your search.</Text>
              </View>
            }
          />
        </>
      )}

      {/* Voice Search Modal */}
      <Modal
        visible={isVoiceModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={handleVoiceModalClose}
      >
        <View style={styles.voiceModalOverlay}>
          <View style={styles.voiceModalContent}>
            <View style={styles.voiceModalTop}>
              <View>
                <Text style={styles.voiceModalTitle}>Exam Voice Search • குரல் தேடல்</Text>
                <Text style={styles.voiceModalSub}>Speak exam name, test topic or syllabus</Text>
              </View>
              <TouchableOpacity onPress={handleVoiceModalClose} style={styles.voiceCloseBtn}>
                <X size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {/* Language Switcher */}
            <View style={styles.voiceLangRow}>
              <TouchableOpacity
                style={[styles.voiceLangPill, voiceLang === 'ta-IN' && styles.voiceLangPillActive]}
                onPress={() => handleLangSwitch('ta-IN')}
              >
                <Text style={[styles.voiceLangText, voiceLang === 'ta-IN' && styles.voiceLangTextActive]}>
                  🇮🇳 தமிழ் (Tamil)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.voiceLangPill, voiceLang === 'en-IN' && styles.voiceLangPillActive]}
                onPress={() => handleLangSwitch('en-IN')}
              >
                <Text style={[styles.voiceLangText, voiceLang === 'en-IN' && styles.voiceLangTextActive]}>
                  🌐 English (Indian)
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.voiceAnimationBox}>
              <Animated.View
                style={[
                  styles.voiceWaveRing,
                  {
                    transform: [{ scale: pulseAnim }],
                    backgroundColor: isListening ? '#10b98130' : '#33415530',
                    borderColor: isListening ? '#10b981' : '#475569',
                  },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.voiceMicCenter,
                    { backgroundColor: isListening ? '#10b981' : '#1e293b' },
                  ]}
                  onPress={() => (isListening ? stopVoiceListening() : startVoiceListening())}
                >
                  {isListening ? <Mic size={32} color="#0a0f1e" /> : <MicOff size={32} color="#94a3b8" />}
                </TouchableOpacity>
              </Animated.View>

              {/* Real-time Spoken Transcript Box */}
              {voiceTranscript.trim().length > 0 && (
                <View style={styles.voiceTranscriptCard}>
                  <Volume2 size={16} color="#10b981" style={{ marginRight: 6 }} />
                  <Text style={styles.voiceTranscriptText}>"{voiceTranscript}"</Text>
                </View>
              )}

              <Text style={[styles.voiceStatusText, { color: isListening ? '#34d399' : '#94a3b8' }]}>
                {voiceStatus}
              </Text>
            </View>

            <Text style={styles.voiceQuickTitle}>Popular Exam Tests:</Text>
            <View style={styles.voiceSuggestionsWrap}>
              {[
                'TNPSC Group 4',
                'IBPS PO Mock Exam',
                'NEET Physics Test',
                'SBI Clerk Reasoning',
                'Class 10 Science Quiz',
                'Python Coding Test',
              ].map((query, qIdx) => (
                <TouchableOpacity
                  key={qIdx}
                  style={styles.voiceChip}
                  onPress={() => {
                    setSearchQuery(query);
                    handleVoiceModalClose();
                  }}
                >
                  <Sparkles size={12} color="#10b981" style={{ marginRight: 4 }} />
                  <Text style={styles.voiceChipText}>{query}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Embedded Native Speech-to-Text Bridge */}
            <VoiceSpeechBridge
              ref={voiceBridgeRef}
              onSpeechStart={() => {
                setIsListening(true);
                setVoiceStatus(voiceLang === 'ta-IN' ? 'தமிழில் பேசவும்...' : 'Listening now...');
              }}
              onSpeechResult={(transcript, isFinal) => {
                setVoiceTranscript(transcript);
                setVoiceStatus(`Recognized: "${transcript}"`);
                if (isFinal && transcript.trim().length > 0) {
                  setTimeout(() => {
                    setSearchQuery(transcript.trim());
                    handleVoiceModalClose();
                  }, 700);
                }
              }}
              onSpeechEnd={() => {
                setIsListening(false);
              }}
              onSpeechError={(err) => {
                setIsListening(false);
                setVoiceStatus(err === 'no-speech' ? 'No speech detected. Tap mic to retry.' : `Voice status: ${err}`);
              }}
            />
          </View>
        </View>
      </Modal>

      {/* 💳 Test Series UPI Unlock Modal */}
      <PaymentQRModal
        visible={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={() => {
          setIsPaymentModalOpen(false);
          Alert.alert('Unlocked! 🎉', 'All Test Series unlocked with instant scoring and certificate access.');
        }}
        title="TestO All-Access Exam Pass"
        amount={99}
        itemId="testo_all_access_pass"
        itemType="o_test"
        userId="student-user"
        userName="Student"
        userPhone="9486335870"
        upiId="9486335870@hdfcbank"
        payeeName="AISHLEE TECHNOLOGY"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  testoUnlockBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.35)',
    gap: 10,
  },
  testoUnlockIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  testoUnlockTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },
  testoUnlockPriceBadge: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  testoUnlockPriceText: {
    color: '#0a0f1e',
    fontSize: 9,
    fontWeight: '900',
  },
  testoUnlockDesc: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
    lineHeight: 13,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0f1e',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0f1e',
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 12,
    fontSize: 14,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backBtn: {
    padding: 4,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
  },
  eduBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b98120',
    borderColor: '#10b98150',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  eduBadgeText: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: 'bold',
  },
  navSub: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 12,
    borderColor: '#1e293b',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
    padding: 0,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    marginBottom: 12,
    marginTop: 10,
  },
  sectionTitle: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  sectionCount: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    marginRight: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b98120',
    borderColor: '#10b98150',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: 'bold',
  },
  cardDescription: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 14,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    color: '#64748b',
    fontSize: 12,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  startBtnText: {
    color: '#0a0f1e',
    fontWeight: 'bold',
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
  },
  micBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#10b98120',
  },
  voiceModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  voiceModalContent: {
    backgroundColor: '#111827',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  voiceModalTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  voiceModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  voiceModalSub: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  voiceCloseBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#1e293b',
  },
  voiceLangRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  voiceLangPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  voiceLangPillActive: {
    backgroundColor: '#10b98120',
    borderColor: '#10b981',
  },
  voiceLangText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  voiceLangTextActive: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  voiceAnimationBox: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  voiceWaveRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  voiceMicCenter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  voiceTranscriptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b98115',
    borderWidth: 1,
    borderColor: '#10b98140',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 10,
    maxWidth: '90%',
  },
  voiceTranscriptText: {
    color: '#34d399',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  voiceStatusText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
    textAlign: 'center',
  },
  voiceQuickTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginTop: 10,
  },
  voiceSuggestionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  voiceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  voiceChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#e2e8f0',
  },
  topPassBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  topPassBadgeText: {
    color: '#10b981',
    fontSize: 9,
    fontWeight: '900',
  },
  topPassUnlockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fbbf24',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  topPassUnlockText: {
    color: '#0B1120',
    fontSize: 10,
    fontWeight: '900',
  },
  cbtPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cbtPillText: {
    color: '#10b981',
    fontSize: 9,
    fontWeight: '800',
  },
  markingPill: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  markingPillText: {
    color: '#fbbf24',
    fontSize: 9,
    fontWeight: '800',
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 4,
  },
  metaDot: {
    color: '#475569',
    fontSize: 12,
  },
  metaSubText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '500',
  },
  freeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  freeBadgeText: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: '700',
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  categoryPillActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  categoryPillText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryPillTextActive: {
    color: '#0a0f1e',
    fontWeight: '800',
  },
  liveMockCard: {
    backgroundColor: '#181216',
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  liveMockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  liveTagText: {
    color: '#ef4444',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  liveTimerText: {
    color: '#fbbf24',
    fontSize: 11,
    fontWeight: '800',
  },
  liveMockTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 6,
  },
  liveMockDetails: {
    marginBottom: 10,
  },
  liveMockDetailText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '500',
  },
  liveMockFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#2d1c25',
  },
  liveUsersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liveUsersText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '700',
  },
  liveAttemptBtn: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  liveAttemptBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
  },
  syllabusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: '#10b981',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },
  syllabusBtnText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '700',
  },
  sectionSyllabusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: '#38bdf8',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  sectionSyllabusText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
  },
  topSyllabusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0f241d',
    borderWidth: 1,
    borderColor: '#10b98150',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 14,
  },
  syllabusBannerIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  syllabusBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  syllabusBannerSub: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  modeSwitcherContainer: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 9,
  },
  modeBtnActive: {
    backgroundColor: '#10b981',
  },
  modeBtnText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },
  modeBtnTextActive: {
    color: '#0a0f1e',
    fontWeight: '900',
  },
  syllabusCourseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  syllabusCourseCardActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  syllabusCourseText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },
  syllabusCourseTextActive: {
    color: '#0a0f1e',
    fontWeight: '900',
  },
  courseHeaderBanner: {
    backgroundColor: '#111827',
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  courseHeaderTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  courseHeaderSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 3,
  },
  metaBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  metaBadgeText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '700',
  },
  syllabusUnitHeader: {
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  subjectPill: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  unitTitleText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  syllabusChapCard: {
    backgroundColor: '#111827',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
    overflow: 'hidden',
  },
  chapHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  chapNumText: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: '800',
  },
  chapTitleText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  chapTamilText: {
    color: '#fbbf24',
    fontSize: 11,
    marginTop: 2,
  },
  chapBody: {
    padding: 10,
    backgroundColor: '#0b1120',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  subtopicSection: {
    marginBottom: 10,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#334155',
  },
  subtopicTitleText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  microTopicCard: {
    backgroundColor: '#111827',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  microTitleText: {
    color: '#f1f5f9',
    fontSize: 12,
    fontWeight: '600',
  },
  microAxiomText: {
    color: '#94a3b8',
    fontSize: 10,
    marginTop: 2,
  },
  microCbtBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  microCbtBtnText: {
    color: '#0a0f1e',
    fontSize: 11,
    fontWeight: '800',
  },
  microPlayerBtn: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: '#38bdf8',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  microPlayerBtnText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
  },
});

