import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
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
} from 'lucide-react-native';

export default function TestOHubScreen({ route }: any) {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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

  // Handle incoming route params when navigated
  useEffect(() => {
    if (route?.params?.searchQuery) {
      setSearchQuery(route.params.searchQuery);
    } else if (route?.params?.topic) {
      setSearchQuery(route.params.topic);
    } else if (route?.params?.courseTitle) {
      setSearchQuery(route.params.courseTitle);
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
    if (!searchQuery.trim()) return sections;
    const q = searchQuery.toLowerCase();

    return sections
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
  }, [sections, searchQuery]);

  const renderTestCard = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate('TestOExamScreen', {
            testId: item.id,
            title: item.displayTitle || item.title_name,
          })
        }
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.displayTitle || item.title_name}</Text>
          <View style={styles.badge}>
            <Award size={11} color="#10b981" style={{ marginRight: 4 }} />
            <Text style={styles.badgeText}>{item.questionCount || 0} Qs</Text>
          </View>
        </View>

        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description_purpose ||
            item.description ||
            'Timed examination with instant scorecard analytics & verifiable certificate.'}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.timeInfo}>
            <Clock size={12} color="#64748b" style={{ marginRight: 4 }} />
            <Text style={styles.timeText}>15–30 Mins</Text>
          </View>

          <TouchableOpacity
            style={styles.startBtn}
            onPress={() =>
              navigation.navigate('TestOExamScreen', {
                testId: item.id,
                title: item.displayTitle || item.title_name,
              })
            }
          >
            <FileCheck2 size={14} color="#0a0f1e" style={{ marginRight: 6 }} />
            <Text style={styles.startBtnText}>Start Exam</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section: { title, data } }: any) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionCount}>{data.length} Tests</Text>
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

      {/* Navigation Header (Positioned cleanly below status bar / punch hole camera) */}
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
});

