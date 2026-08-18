import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  TextInput,
  ScrollView,
  SafeAreaView,
  StatusBar,
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
import {
  PlayCircle,
  BookOpen,
  GraduationCap,
  Search,
  Award,
  Sparkles,
  CheckCircle2,
  Clock,
  Flame,
  ChevronRight,
  Star,
  FileCheck2,
  Zap,
  Layers,
  Briefcase,
  Mic,
  MicOff,
  X,
  Volume2,
} from 'lucide-react-native';

const CATEGORIES = [
  { id: 'all', label: 'All Courses', icon: BookOpen },
  { id: 'entrance', label: 'NEET & JEE', icon: Zap },
  { id: 'govt', label: 'Govt & TNPSC', icon: Award },
  { id: 'skills', label: 'AI & Tech Skills', icon: Sparkles },
  { id: 'school', label: 'School (KG–12)', icon: GraduationCap },
  { id: 'college', label: 'College (UG/PG)', icon: BookOpen },
  { id: 'others', label: 'Others & General', icon: Layers },
  { id: 'tests', label: 'TestO Mock Tests', icon: FileCheck2 },
];

export function getCourseCategory(c: any): 'entrance' | 'govt' | 'skills' | 'school' | 'college' | 'others' {
  const cat = (c.category || '').toLowerCase();
  const title = (c.title_name || '').toLowerCase();

  if (
    cat.includes('neet') ||
    cat.includes('jee') ||
    /\b(neet|jee|iit|cuet|gate)\b/i.test(title)
  ) {
    return 'entrance';
  }

  if (
    cat.includes('tnpsc') ||
    cat.includes('govt') ||
    cat.includes('upsc') ||
    /\b(tnpsc|upsc|civil services|group 1|group 2|group 4|group iv|ssc|chsl|cgl|rrb|ntpc|tnusrb|police|constable|si|forest guard|agniveer|cds|nda|tet|trb)\b/i.test(title)
  ) {
    return 'govt';
  }

  if (
    (cat.includes('tech') || cat.includes('it training') || cat.includes('skill')) ||
    /செயற்கை நுண்ணறிவு|பைதான்|ஜாவாஸ்கிரிப்ட்|தரவு அறிவியல்|கிளவுட்|சைபர்|சாப்ட்வேர்|மொபைல் ஆப்|கணினி|மார்க்கெட்டிங்/i.test(title) ||
    /\b(python|javascript|data science|data analytics|cloud|aws|cyber security|mobile app|software testing|networking|digital marketing|web dev|coding|programming)\b/i.test(title)
  ) {
    return 'skills';
  }

  if (
    cat.includes('grade') ||
    cat.includes('school') ||
    /\b(class 8|class 9|class 10|class 11|class 12|8th standard|9th standard|10th standard|11th standard|12th standard|lkg|ukg|samacheer|cbse|tn board)\b/i.test(title)
  ) {
    return 'school';
  }

  if (
    cat.includes('ug') ||
    cat.includes('college') ||
    /\b(spoken english|engineering|computer architecture|degree|b\.tech|b\.sc|b\.com)\b/i.test(title)
  ) {
    return 'college';
  }

  return 'others';
}

export default function TeachOScreen() {
  const [courses, setCourses] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [streakDays] = useState(5);
  const [xpPoints] = useState(480);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceLang, setVoiceLang] = useState<'ta-IN' | 'en-IN'>('ta-IN');
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceStatus, setVoiceStatus] = useState('Tap Mic to speak');
  const voiceBridgeRef = useRef<VoiceSpeechBridgeRef>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

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
            message: 'SuprO TeachO needs microphone access for voice search in Tamil and English.',
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
      console.warn('NativeSpeech fallback to bridge:', e);
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
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // 1. Fetch Courses
      const { data: courseData, error: courseError } = await aishleeSupabase
        .from('unified_master_data')
        .select('*')
        .eq('item_type', 'COURSE')
        .order('created_at', { ascending: false });

      if (courseError) throw courseError;
      setCourses(courseData || []);

      // 2. Fetch Tests
      const { data: testData, error: testError } = await aishleeSupabase
        .from('unified_master_data')
        .select('*')
        .eq('item_type', 'o_test')
        .limit(100);

      if (!testError && testData) {
        setTests(testData);
      }
    } catch (err) {
      console.error('Error fetching EduVerse data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    let items = courses;
    if (activeCategory === 'tests') {
      items = tests;
    } else if (activeCategory !== 'all') {
      items = courses.filter(c => getCourseCategory(c) === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        item =>
          (item.title_name && item.title_name.toLowerCase().includes(q)) ||
          (item.category && item.category.toLowerCase().includes(q)) ||
          (item.description_purpose && item.description_purpose.toLowerCase().includes(q))
      );
    }

    return items;
  }, [courses, tests, activeCategory, searchQuery]);

  const renderListHeader = () => {
    const recentCourse = courses[0];
    return (
      <View style={styles.scrollHeader}>
        {/* Continue Learning Widget */}
        {recentCourse && activeCategory === 'all' && !searchQuery && (
          <TouchableOpacity
            style={styles.continueCard}
            onPress={() => navigation.navigate('TeachOCourseScreen', { course: recentCourse })}
          >
            <View style={styles.continueHeader}>
              <View style={styles.continueBadge}>
                <Clock size={12} color="#38bdf8" style={{ marginRight: 4 }} />
                <Text style={styles.continueBadgeText}>CONTINUE LEARNING</Text>
              </View>
              <Text style={styles.continueProgressText}>65% Complete</Text>
            </View>

            <Text style={styles.continueTitle} numberOfLines={1}>
              {recentCourse.title_name}
            </Text>

            {/* Progress Bar */}
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '65%' }]} />
            </View>

            <View style={styles.continueFooter}>
              <Text style={styles.continueLessonText}>Next: Chapter 4 • Interactive Practice</Text>
              <View style={styles.resumeBtn}>
                <Text style={styles.resumeBtnText}>Resume</Text>
                <ChevronRight size={14} color="#10b981" />
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Today's Daily 3 Tasks */}
        {activeCategory === 'all' && !searchQuery && (
          <View style={styles.dailyTasksCard}>
            <View style={styles.dailyTasksHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <CheckCircle2 size={16} color="#10b981" style={{ marginRight: 6 }} />
                <Text style={styles.dailyTasksTitle}>Today's Learning Tasks</Text>
              </View>
              <Text style={styles.dailyTasksPoints}>+50 XP</Text>
            </View>

            <View style={styles.taskItem}>
              <View style={[styles.taskCheck, styles.taskCheckDone]}>
                <Text style={styles.checkMark}>✓</Text>
              </View>
              <Text style={[styles.taskLabel, styles.taskLabelDone]}>
                Watch 1 Masterclass Video Lesson
              </Text>
            </View>

            <View style={styles.taskItem}>
              <View style={styles.taskCheck} />
              <Text style={styles.taskLabel}>Review Chapter Mind Map & Formula Notes</Text>
            </View>

            <View style={styles.taskItem}>
              <View style={styles.taskCheck} />
              <Text style={styles.taskLabel}>Attempt 5 Daily Practice Questions</Text>
            </View>
          </View>
        )}

        {/* Career & Placement Quick Launcher */}
        {activeCategory === 'all' && !searchQuery && (
          <TouchableOpacity
            style={styles.careerBanner}
            onPress={() => navigation.navigate('CareerHubScreen')}
          >
            <View style={styles.careerBannerLeft}>
              <View style={styles.careerIconBox}>
                <Briefcase size={18} color="#10b981" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.careerBannerTitle}>Career & Placement Hub</Text>
                  <Sparkles size={12} color="#10b981" style={{ marginLeft: 4 }} />
                </View>
                <Text style={styles.careerBannerSub}>Job Alerts • AI Resume Builder • Mock Interviews</Text>
              </View>
            </View>
            <ChevronRight size={16} color="#10b981" />
          </TouchableOpacity>
        )}

        {/* Section Heading */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {activeCategory === 'tests' ? '📝 TestO Online Mock Exams' : '📚 Masterclass Courses'}
          </Text>
          <Text style={styles.sectionCount}>{filteredItems.length} Available</Text>
        </View>
      </View>
    );
  };

  const renderItem = ({ item }: { item: any }) => {
    const isTestItem = item.item_type === 'o_test' || activeCategory === 'tests';

    let metadata = item.metadata || item.additional_info || {};
    if (typeof metadata === 'string') {
      try {
        metadata = JSON.parse(metadata);
      } catch (e) {}
    }

    const thumbnailUrl =
      metadata.thumbnail_url ||
      'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=400';

    const questionCount =
      metadata.questions?.length || metadata.questionCount || (isTestItem ? 25 : 0);

    const categoryKey = isTestItem ? 'tests' : getCourseCategory(item);
    const categoryLabel = isTestItem
      ? 'TESTO EXAM'
      : item.category ||
        (categoryKey === 'entrance'
          ? 'NEET / JEE'
          : categoryKey === 'govt'
          ? 'Govt & TNPSC'
          : categoryKey === 'skills'
          ? 'AI & Tech'
          : categoryKey === 'school'
          ? 'School (KG–12)'
          : categoryKey === 'college'
          ? 'College'
          : 'Others');

    return (
      <View style={styles.card}>
        {!isTestItem && <Image source={{ uri: thumbnailUrl }} style={styles.thumbnail} />}

        <View style={styles.cardContent}>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, isTestItem && styles.testBadge]}>
              <Text style={[styles.badgeText, isTestItem && styles.testBadgeText]}>
                {categoryLabel}
              </Text>
            </View>

            {questionCount > 0 && (
              <View style={styles.metaPill}>
                <Award size={12} color="#10b981" style={{ marginRight: 4 }} />
                <Text style={styles.metaPillText}>{questionCount} MCQs</Text>
              </View>
            )}
          </View>

          <Text style={styles.cardTitle}>{item.title_name}</Text>
          <Text style={styles.cardDescription} numberOfLines={2}>
            {item.description_purpose ||
              item.description ||
              (isTestItem
                ? 'Timed interactive examination with instant accuracy analytics & scorecard.'
                : 'Comprehensive subject coverage with video lessons, digital notes & AI tutor.')}
          </Text>

          <View style={styles.cardFooter}>
            {isTestItem ? (
              <TouchableOpacity
                style={styles.testBtn}
                onPress={() => {
                  navigation.navigate('TestOExamScreen', {
                    testId: item.id,
                    title: item.title_name,
                  });
                }}
              >
                <FileCheck2 size={16} color="#0a0f1e" style={{ marginRight: 6 }} />
                <Text style={styles.testBtnText}>Start Exam</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.watchBtn}
                onPress={() => {
                  navigation.navigate('TeachOCourseScreen', { course: item });
                }}
              >
                <PlayCircle size={16} color="#0a0f1e" style={{ marginRight: 6 }} />
                <Text style={styles.watchBtnText}>Start Learning</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.safeArea, { paddingTop: insets.top }]}>
        <StatusBar barStyle="light-content" backgroundColor="#0a0f1e" />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>Loading EduVerse Learning Hub...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0f1e" />

      {/* FIXED TOP HEADER & SEARCH (Positioned cleanly below status bar / camera notch) */}
      <View
        style={[
          styles.headerContainer,
          {
            paddingTop:
              Math.max(
                insets.top,
                Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0
              ) + 8,
          },
        ]}
      >
        {/* Top Title & Gamification Bar */}
        <View style={styles.topBar}>
          <View>
            <View style={styles.badgeRow}>
              <Text style={styles.mainTitle}>TeachO</Text>
              <View style={styles.eduVerseBadge}>
                <Sparkles size={11} color="#10b981" style={{ marginRight: 4 }} />
                <Text style={styles.eduVerseText}>EduVerse AI</Text>
              </View>
            </View>
            <Text style={styles.subTitle}>School, Higher Ed, Competitive & Skills</Text>
          </View>

          {/* Streak & XP Badges */}
          <View style={styles.statsRow}>
            <View style={styles.statPill}>
              <Flame size={14} color="#f97316" />
              <Text style={styles.statText}>{streakDays}d</Text>
            </View>
            <View style={[styles.statPill, { backgroundColor: '#10b98120', borderColor: '#10b98150' }]}>
              <Star size={14} color="#10b981" />
              <Text style={[styles.statText, { color: '#10b981' }]}>{xpPoints} XP</Text>
            </View>
          </View>
        </View>

        {/* Search Bar with Mic Voice Button */}
        <View style={styles.searchBar}>
          <Search size={18} color="#94a3b8" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search subjects, lessons, TNPSC, NEET, AI..."
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
          <TouchableOpacity
            style={styles.micBtn}
            onPress={handleVoiceModalOpen}
          >
            <Mic size={18} color="#10b981" />
          </TouchableOpacity>
        </View>

        {/* Category Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map(cat => {
            const IconComponent = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                onPress={() => setActiveCategory(cat.id)}
              >
                <IconComponent
                  size={14}
                  color={isActive ? '#0a0f1e' : '#94a3b8'}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* SCROLLABLE COURSES & TASKS LIST */}
      <FlatList
        data={filteredItems}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderListHeader}
        contentContainerStyle={[
          styles.listContainer,
          { paddingBottom: Math.max(insets.bottom, 16) + 120 },
        ]}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <BookOpen size={48} color="#334155" style={{ marginBottom: 12 }} />
            <Text style={styles.emptyTitle}>No matching courses or tests found</Text>
            <Text style={styles.emptySub}>Try searching with different keywords</Text>
          </View>
        }
      />

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
                <Text style={styles.voiceModalTitle}>Voice Search • குரல் தேடல்</Text>
                <Text style={styles.voiceModalSub}>Speak course, exam or topic name</Text>
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

            <Text style={styles.voiceQuickTitle}>Quick Voice Suggestions:</Text>
            <View style={styles.voiceSuggestionsWrap}>
              {[
                'NEET UG Physics',
                'TNPSC பொதுத்தமிழ்',
                'JEE Main Maths',
                '10th Science',
                'Python Programming',
                'Banking Aptitude',
                'Full Stack React',
                'Generative AI',
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
    </View>
  );
}

const styles = StyleSheet.create({
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
  listContainer: {
    paddingBottom: 90,
  },
  scrollHeader: {
    paddingHorizontal: 16,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  eduVerseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b98120',
    borderColor: '#10b98150',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  eduVerseText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: 'bold',
  },
  subTitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9731620',
    borderColor: '#f9731650',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
  },
  statText: {
    color: '#f97316',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
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
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
    padding: 0,
  },
  categoryScroll: {
    paddingBottom: 14,
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderColor: '#1e293b',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryPillActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  categoryText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#0a0f1e',
    fontWeight: 'bold',
  },
  continueCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 14,
  },
  continueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  continueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  continueBadgeText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  continueProgressText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: 'bold',
  },
  continueTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#1e293b',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10b981',
  },
  continueFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  continueLessonText: {
    color: '#94a3b8',
    fontSize: 12,
    flex: 1,
  },
  resumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resumeBtnText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 2,
  },
  dailyTasksCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 16,
  },
  dailyTasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dailyTasksTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  dailyTasksPoints: {
    color: '#f59e0b',
    fontSize: 12,
    fontWeight: 'bold',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskCheck: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#475569',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskCheckDone: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  checkMark: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  taskLabel: {
    color: '#cbd5e1',
    fontSize: 13,
  },
  taskLabelDone: {
    color: '#64748b',
    textDecorationLine: 'line-through',
  },
  careerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111827',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#10b98140',
    padding: 14,
    marginBottom: 16,
  },
  careerBannerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  careerIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#10b98120',
    justifyContent: 'center',
    alignItems: 'center',
  },
  careerBannerTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  careerBannerSub: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  sectionCount: {
    color: '#64748b',
    fontSize: 12,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: 170,
    backgroundColor: '#1e293b',
  },
  cardContent: {
    padding: 16,
  },
  badge: {
    backgroundColor: '#10b98120',
    borderColor: '#10b98150',
    borderWidth: 1,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  badgeText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: 'bold',
  },
  testBadge: {
    backgroundColor: '#f59e0b20',
    borderColor: '#f59e0b50',
  },
  testBadgeText: {
    color: '#f59e0b',
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 8,
    marginBottom: 8,
  },
  metaPillText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 16,
    lineHeight: 19,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  watchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  watchBtnText: {
    color: '#0a0f1e',
    fontWeight: 'bold',
    fontSize: 13,
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f59e0b',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  testBtnText: {
    color: '#0a0f1e',
    fontWeight: 'bold',
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  emptySub: {
    color: '#64748b',
    fontSize: 13,
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
});

