import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, 
  ScrollView, SafeAreaView, Alert, Dimensions, Modal, Platform, StatusBar,
  TextInput, PanResponder
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { aishleeSupabase } from '../services/aishleeSupabase';
import { useNavigation, useRoute } from '@react-navigation/native';
import { 
  Clock, Menu, X, ChevronLeft, ChevronRight, WifiOff, Bookmark, 
  Languages, Type, Edit3, Calculator, HelpCircle, AlertCircle, CheckCircle2,
  RotateCcw, Trash2
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// 5-State Status types per NTA / TCS iON standard
const STATUS_COLORS = {
  NOT_VISITED: '#64748b',       // Gray
  NOT_ANSWERED: '#ef4444',      // Red
  ANSWERED: '#10b981',          // Green
  REVIEW: '#8b5cf6',            // Violet
  ANSWERED_REVIEW: '#6366f1',   // Violet + Indigo
};

export default function TestOExamScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { testId, title, questionCount = 25, markingScheme = '+4 / -1' } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [qStatus, setQStatus] = useState<Record<number, string>>({});
  const [bookmarked, setBookmarked] = useState<Record<number, boolean>>({});
  const [timeSpent, setTimeSpent] = useState<Record<number, number>>({});
  
  // Section Navigation
  const [activeSection, setActiveSection] = useState(0);

  // Universal Tools State
  const [lang, setLang] = useState<'EN' | 'TA'>('EN');
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState<number>(1);
  const [isPaletteVisible, setIsPaletteVisible] = useState(false);
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [scratchLines, setScratchLines] = useState<{ x: number; y: number }[]>([]);
  const [calcInput, setCalcInput] = useState('');
  const [calcResult, setCalcResult] = useState('');

  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 mins default
  const [submitted, setSubmitted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const timerRef = useRef<any>(null);
  const qTimerRef = useRef<any>(null);

  useEffect(() => {
    fetchExamData();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (qTimerRef.current) clearInterval(qTimerRef.current);
    };
  }, []);

  // Global Countdown Timer
  useEffect(() => {
    if (!loading && !submitted) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleSubmit(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current!);
  }, [loading, submitted]);

  // Per-Question Time Spent Tracker
  useEffect(() => {
    if (!loading && !submitted) {
      qTimerRef.current = setInterval(() => {
        setTimeSpent((prev) => ({
          ...prev,
          [currentIdx]: (prev[currentIdx] || 0) + 1,
        }));
      }, 1000);
    }
    return () => clearInterval(qTimerRef.current!);
  }, [currentIdx, loading, submitted]);

  const fetchExamData = async () => {
    try {
      let info: any = {};
      
      if (route.params?.localQuestions) {
        info = { questions: route.params.localQuestions };
      } else {
        const { data, error } = await aishleeSupabase
          .from('unified_master_data')
          .select('*')
          .eq('id', testId)
          .single();
        
        if (error) throw error;
        info = data.additional_info || data.metadata || {};
      }
      
      if (typeof info === 'string') {
        try { info = JSON.parse(info); } catch(e) {}
      }

      let qs = [];
      if (Array.isArray(info)) {
        qs = info;
      } else if (info.questions && Array.isArray(info.questions)) {
        qs = info.questions;
      } else if (info.data && Array.isArray(info.data)) {
        qs = info.data;
      }

      if (qs.length === 0) {
        qs = [
          {
            question: "In thermodynamics, what law establishes that energy cannot be created or destroyed, only transformed?",
            question_ta: "வெப்ப இயக்கவியலில், ஆற்றலை உருவாக்கவோ அழிக்கவோ முடியாது, மாற்ற மட்டுமே முடியும் என்பதை எந்த விதி நிறுவுகிறது?",
            options: ["A) First Law of Thermodynamics", "B) Second Law of Thermodynamics", "C) Zeroth Law of Thermodynamics", "D) Third Law of Thermodynamics"],
            answer: "A) First Law of Thermodynamics",
            explanation: "The First Law of Thermodynamics is the law of conservation of energy.",
            section: "Physics / Core"
          },
          {
            question: "Which Indian state has the highest coastal length in the mainland?",
            question_ta: "இந்தியாவின் முக்கிய நிலப்பரப்பில் மிக நீண்ட கடற்கரையைக் கொண்டுள்ள மாநிலம் எது?",
            options: ["A) Tamil Nadu", "B) Gujarat", "C) Andhra Pradesh", "D) Maharashtra"],
            answer: "B) Gujarat",
            explanation: "Gujarat has the longest mainland coastline in India measuring approx 1,600 km.",
            section: "General Studies"
          },
          {
            question: "Solve: If 3x + 5 = 20, what is the value of 2x^2 + 3?",
            question_ta: "தீர்வு காண்க: 3x + 5 = 20 எனில், 2x^2 + 3 இன் மதிப்பு என்ன?",
            options: ["A) 53", "B) 47", "C) 50", "D) 25"],
            answer: "A) 53",
            explanation: "3x = 15 => x = 5. Then 2(5^2) + 3 = 2(25) + 3 = 50 + 3 = 53.",
            section: "Quantitative Aptitude"
          }
        ];
      }

      setQuestions(qs);
      if (testId) {
        AsyncStorage.setItem(`offline_test_${testId}`, JSON.stringify(qs)).catch(() => {});
      }

      const initialStatus: Record<number, string> = {};
      qs.forEach((_: any, i: number) => {
        initialStatus[i] = i === 0 ? 'NOT_ANSWERED' : 'NOT_VISITED';
      });
      setQStatus(initialStatus);
    } catch (err) {
      console.warn('[TestOExamScreen] Network fetch failed, checking offline cache...');
      try {
        const cached = await AsyncStorage.getItem(`offline_test_${testId}`);
        if (cached) {
          const cachedQs = JSON.parse(cached);
          if (Array.isArray(cachedQs) && cachedQs.length > 0) {
            setQuestions(cachedQs);
            const initialStatus: Record<number, string> = {};
            cachedQs.forEach((_: any, i: number) => {
              initialStatus[i] = i === 0 ? 'NOT_ANSWERED' : 'NOT_VISITED';
            });
            setQStatus(initialStatus);
            Alert.alert("Offline Mode", "Loaded exam questions from offline storage.");
            setLoading(false);
            return;
          }
        }
      } catch (cacheErr) {}

      Alert.alert("Error", "Failed to load exam data. Please check your internet connection.");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  // Divide into sections dynamically
  const sectionsList = useMemo(() => {
    const list = ['Section 1 (Core Concepts)', 'Section 2 (Applied Problem Solving)'];
    return list;
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (option: string) => {
    setAnswers({ ...answers, [currentIdx]: option });
  };

  const toggleBookmark = () => {
    setBookmarked((prev) => ({
      ...prev,
      [currentIdx]: !prev[currentIdx],
    }));
  };

  const goToNext = (statusUpdate: string) => {
    const isAnswered = !!answers[currentIdx];
    
    let newStatus = statusUpdate;
    if (statusUpdate === 'REVIEW') {
      newStatus = isAnswered ? 'ANSWERED_REVIEW' : 'REVIEW';
    } else if (statusUpdate === 'SAVE') {
      newStatus = isAnswered ? 'ANSWERED' : 'NOT_ANSWERED';
    }

    setQStatus(prev => ({ ...prev, [currentIdx]: newStatus }));

    if (currentIdx < questions.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      setQStatus(prev => ({
        ...prev,
        [nextIdx]: prev[nextIdx] === 'NOT_VISITED' ? 'NOT_ANSWERED' : prev[nextIdx]
      }));
    }
  };

  const goToPrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const jumpToQuestion = (idx: number) => {
    setCurrentIdx(idx);
    setIsPaletteVisible(false);
    setQStatus(prev => ({
      ...prev,
      [idx]: prev[idx] === 'NOT_VISITED' ? 'NOT_ANSWERED' : prev[idx]
    }));
  };

  const clearResponse = () => {
    const newAnswers = { ...answers };
    delete newAnswers[currentIdx];
    setAnswers(newAnswers);
    setQStatus(prev => ({ ...prev, [currentIdx]: 'NOT_ANSWERED' }));
  };

  // Calculator logic
  const handleCalcPress = (val: string) => {
    if (val === 'AC') {
      setCalcInput('');
      setCalcResult('');
    } else if (val === 'C') {
      setCalcInput(calcInput.slice(0, -1));
    } else if (val === '=') {
      try {
        // Safe basic arithmetic evaluator
        const sanitized = calcInput.replace(/[^0-9+\-*/.]/g, '');
        const res = Function(`'use strict'; return (${sanitized})`)();
        setCalcResult(String(res));
      } catch (e) {
        setCalcResult('Error');
      }
    } else {
      setCalcInput(calcInput + val);
    }
  };

  const handleSubmit = (autoSubmit = false) => {
    if (autoSubmit) {
      finishExam();
      return;
    }

    const answeredCount = Object.values(qStatus).filter(s => s === 'ANSWERED' || s === 'ANSWERED_REVIEW').length;
    const reviewCount = Object.values(qStatus).filter(s => s === 'REVIEW' || s === 'ANSWERED_REVIEW').length;
    const notAnsweredCount = questions.length - answeredCount;

    Alert.alert(
      "NTA Standard Exam Submission",
      `Exam Summary:\n• Total Questions: ${questions.length}\n• Answered: ${answeredCount}\n• Marked for Review: ${reviewCount}\n• Not Answered: ${notAnsweredCount}\n\nAre you sure you want to submit your final answers?`,
      [
        { text: "Continue Exam", style: "cancel" },
        { text: "Submit Final Test", style: "destructive", onPress: finishExam }
      ]
    );
  };

  const finishExam = () => {
    setSubmitted(true);
    if (timerRef.current) clearInterval(timerRef.current);
    if (qTimerRef.current) clearInterval(qTimerRef.current);
    
    let score = 0;
    let correctCount = 0;
    let incorrectCount = 0;

    questions.forEach((q, idx) => {
      const correct = q.correct_answer || q.correctAnswer || q.answer || 'Option A';
      if (answers[idx]) {
        if (answers[idx] === correct) {
          score += 4;
          correctCount += 1;
        } else {
          score -= 1;
          incorrectCount += 1;
        }
      }
    });

    navigation.replace('TestOResultScreen', {
      score: Math.max(0, score),
      correctCount,
      incorrectCount,
      totalQuestions: questions.length,
      userAnswers: answers,
      questions,
      timeTaken: 30 * 60 - timeLeft,
      timeSpent,
      markingScheme,
      testTitle: title || 'TestO Mock Examination',
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={{ color: '#ffffff', marginTop: 12, fontWeight: '700' }}>Initializing CBT Exam Engine...</Text>
      </View>
    );
  }

  const currentQ = questions[currentIdx];
  const questionTextDisplay = lang === 'TA' && currentQ?.question_ta ? currentQ.question_ta : (currentQ?.question || currentQ?.q || 'Question content loading...');

  // Counts for palette
  const answeredCount = Object.values(qStatus).filter(s => s === 'ANSWERED' || s === 'ANSWERED_REVIEW').length;
  const notAnsweredCount = Object.values(qStatus).filter(s => s === 'NOT_ANSWERED').length;
  const reviewCount = Object.values(qStatus).filter(s => s === 'REVIEW' || s === 'ANSWERED_REVIEW').length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0f1e" />

      {/* ─── 1. TOP EXAM HEADER ─── */}
      <View
        style={[
          styles.header,
          {
            paddingTop:
              Math.max(
                insets.top,
                Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0
              ) + 8,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            Alert.alert(
              'Exit Examination',
              'Your test session is active. Are you sure you want to pause or exit?',
              [
                { text: 'Resume Exam', style: 'cancel' },
                { text: 'Exit', style: 'destructive', onPress: () => navigation.navigate('TestOHubScreen') },
              ]
            );
          }}
        >
          <ChevronLeft size={22} color="#ffffff" />
        </TouchableOpacity>

        <View style={styles.headerLeft}>
          <Text style={styles.examTitle} numberOfLines={1}>
            {title || 'Mock Examination'}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.sectionTitle}>NTA CBT ENGINE</Text>
            <View style={styles.schemePill}>
              <Text style={styles.schemePillText}>{markingScheme}</Text>
            </View>
          </View>
        </View>

        <View style={styles.headerRight}>
          <View style={[styles.timerContainer, timeLeft < 300 && styles.timerUrgent]}>
            <Clock size={13} color={timeLeft < 300 ? '#ef4444' : '#10b981'} />
            <Text style={[styles.timerText, timeLeft < 300 && { color: '#ef4444' }]}>{formatTime(timeLeft)}</Text>
          </View>
          <TouchableOpacity onPress={() => setIsPaletteVisible(true)} style={styles.menuBtn}>
            <Menu size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── 2. SECTION SWITCHER TABS ─── */}
      <View style={styles.sectionTabBar}>
        {sectionsList.map((secName, sIdx) => {
          const isActive = activeSection === sIdx;
          return (
            <TouchableOpacity
              key={sIdx}
              style={[styles.sectionTabItem, isActive && styles.sectionTabItemActive]}
              onPress={() => setActiveSection(sIdx)}
            >
              <Text style={[styles.sectionTabText, isActive && styles.sectionTabTextActive]}>
                {secName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ─── 3. UNIVERSAL CBT TOOLING BAR ─── */}
      <View style={styles.toolingBar}>
        {/* Bilingual Language Switcher */}
        <TouchableOpacity
          style={[styles.toolBtn, lang === 'TA' && styles.toolBtnActive]}
          onPress={() => setLang(lang === 'EN' ? 'TA' : 'EN')}
        >
          <Languages size={13} color={lang === 'TA' ? '#10b981' : '#94a3b8'} />
          <Text style={[styles.toolBtnText, lang === 'TA' && styles.toolBtnTextActive]}>
            {lang === 'EN' ? 'தமிழ்' : 'English'}
          </Text>
        </TouchableOpacity>

        {/* Font Size Adjuster */}
        <TouchableOpacity
          style={styles.toolBtn}
          onPress={() => setFontSizeMultiplier(prev => (prev === 1.2 ? 0.9 : prev === 0.9 ? 1 : 1.2))}
        >
          <Type size={13} color="#94a3b8" />
          <Text style={styles.toolBtnText}>
            {fontSizeMultiplier === 1.2 ? 'A+' : fontSizeMultiplier === 0.9 ? 'A-' : 'A'}
          </Text>
        </TouchableOpacity>

        {/* Virtual Scratchpad / Rough Sheet */}
        <TouchableOpacity
          style={styles.toolBtn}
          onPress={() => setIsScratchpadOpen(true)}
        >
          <Edit3 size={13} color="#fbbf24" />
          <Text style={[styles.toolBtnText, { color: '#fbbf24' }]}>Rough Sheet</Text>
        </TouchableOpacity>

        {/* Virtual Calculator */}
        <TouchableOpacity
          style={styles.toolBtn}
          onPress={() => setIsCalcOpen(true)}
        >
          <Calculator size={13} color="#38bdf8" />
          <Text style={[styles.toolBtnText, { color: '#38bdf8' }]}>Calc</Text>
        </TouchableOpacity>

        {/* Bookmark Question */}
        <TouchableOpacity
          style={[styles.toolBtn, bookmarked[currentIdx] && styles.toolBtnActive]}
          onPress={toggleBookmark}
        >
          <Bookmark size={13} color={bookmarked[currentIdx] ? '#8b5cf6' : '#94a3b8'} />
        </TouchableOpacity>
      </View>

      {/* ─── 4. QUESTION CONTENT & OPTIONS ─── */}
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.questionNumber}>
                Q {currentIdx + 1} OF {questions.length}
              </Text>
              {bookmarked[currentIdx] && (
                <View style={styles.bookmarkTag}>
                  <Text style={styles.bookmarkTagText}>FLAGGED</Text>
                </View>
              )}
            </View>
            <View style={styles.marksBadge}>
              <Text style={styles.marksText}>{markingScheme}</Text>
            </View>
          </View>

          <Text style={[styles.questionText, { fontSize: 15 * fontSizeMultiplier, lineHeight: 22 * fontSizeMultiplier }]}>
            {questionTextDisplay}
          </Text>

          <View style={styles.optionsContainer}>
            {(currentQ?.options || []).map((opt: string, index: number) => {
              const isSelected = answers[currentIdx] === opt;
              const optionLetter = String.fromCharCode(65 + index);

              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.optionBtn, isSelected && styles.optionBtnSelected]}
                  activeOpacity={0.8}
                  onPress={() => handleOptionSelect(opt)}
                >
                  <View style={[styles.letterCircle, isSelected && styles.letterCircleSelected]}>
                    <Text style={[styles.letterText, isSelected && styles.letterTextSelected]}>
                      {optionLetter}
                    </Text>
                  </View>
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected, { fontSize: 14 * fontSizeMultiplier }]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* ─── 5. FOOTER ACTIONS ─── */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        <View style={styles.footerRow}>
          <TouchableOpacity
            style={styles.navArrowBtn}
            disabled={currentIdx === 0}
            onPress={goToPrev}
          >
            <ChevronLeft size={18} color={currentIdx === 0 ? '#475569' : '#ffffff'} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.reviewBtn}
            onPress={() => goToNext('REVIEW')}
          >
            <Text style={styles.reviewBtnText}>Mark Review</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.clearBtn} onPress={clearResponse}>
            <Text style={styles.clearBtnText}>Clear</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveBtn} onPress={() => goToNext('SAVE')}>
            <Text style={styles.saveBtnText}>Save & Next</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={() => handleSubmit()}>
          <Text style={styles.submitBtnText}>Submit Final Examination</Text>
        </TouchableOpacity>
      </View>

      {/* ─── 6. 5-STATE QUESTION PALETTE MODAL ─── */}
      <Modal visible={isPaletteVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.paletteContainer}>
            <View style={styles.paletteHeader}>
              <View>
                <Text style={styles.paletteTitle}>NTA Question Palette</Text>
                <Text style={styles.paletteSub}>Tap any number to jump to question</Text>
              </View>
              <TouchableOpacity onPress={() => setIsPaletteVisible(false)} style={styles.modalCloseBtn}>
                <X size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {/* 5-State Legend */}
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View style={[styles.legendBox, { backgroundColor: STATUS_COLORS.ANSWERED }]} />
                <Text style={styles.legendText}>Answered ({answeredCount})</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendBox, { backgroundColor: STATUS_COLORS.NOT_ANSWERED }]} />
                <Text style={styles.legendText}>Not Answered ({notAnsweredCount})</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendBox, { backgroundColor: STATUS_COLORS.REVIEW }]} />
                <Text style={styles.legendText}>Marked Review ({reviewCount})</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendBox, { backgroundColor: STATUS_COLORS.NOT_VISITED }]} />
                <Text style={styles.legendText}>Not Visited</Text>
              </View>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
              <View style={styles.gridContainer}>
                {questions.map((_, idx) => {
                  const status = qStatus[idx] || 'NOT_VISITED';
                  const bgColor = STATUS_COLORS[status as keyof typeof STATUS_COLORS] || '#64748b';
                  const isCurrent = idx === currentIdx;
                  const isAnsweredAndReview = status === 'ANSWERED_REVIEW';

                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.gridBtn,
                        { backgroundColor: bgColor },
                        isCurrent && styles.gridBtnCurrent,
                      ]}
                      onPress={() => jumpToQuestion(idx)}
                    >
                      <Text style={styles.gridBtnText}>{idx + 1}</Text>
                      {isAnsweredAndReview && <View style={styles.gridDotGreen} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ─── 7. VIRTUAL SCRATCHPAD / ROUGH SHEET MODAL ─── */}
      <Modal visible={isScratchpadOpen} animationType="fade" transparent={true}>
        <View style={styles.scratchpadOverlay}>
          <View style={styles.scratchpadCard}>
            <View style={styles.scratchpadHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Edit3 size={16} color="#fbbf24" />
                <Text style={styles.scratchpadTitle}>Virtual Rough Sheet</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <TouchableOpacity
                  style={styles.scratchClearBtn}
                  onPress={() => setScratchLines([])}
                >
                  <Trash2 size={14} color="#ef4444" />
                  <Text style={styles.scratchClearText}>Clear Sheet</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsScratchpadOpen(false)}>
                  <X size={20} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.scratchCanvasBox}>
              <TextInput
                multiline
                placeholder="Type your workings, rough calculation formulas, or step-by-step solutions here..."
                placeholderTextColor="#64748b"
                style={styles.scratchTextInput}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* ─── 8. VIRTUAL CALCULATOR MODAL ─── */}
      <Modal visible={isCalcOpen} animationType="fade" transparent={true}>
        <View style={styles.calcOverlay}>
          <View style={styles.calcCard}>
            <View style={styles.calcHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Calculator size={16} color="#38bdf8" />
                <Text style={styles.calcTitle}>Exam Calculator</Text>
              </View>
              <TouchableOpacity onPress={() => setIsCalcOpen(false)}>
                <X size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {/* Screen */}
            <View style={styles.calcScreen}>
              <Text style={styles.calcInputText}>{calcInput || '0'}</Text>
              {calcResult ? <Text style={styles.calcResultText}>= {calcResult}</Text> : null}
            </View>

            {/* Keypad */}
            <View style={styles.calcGrid}>
              {['AC', 'C', '%', '/', '7', '8', '9', '*', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '='].map((keyVal) => (
                <TouchableOpacity
                  key={keyVal}
                  style={[
                    styles.calcKey,
                    keyVal === '=' && styles.calcKeyEqual,
                    (keyVal === 'AC' || keyVal === 'C') && styles.calcKeyClear,
                  ]}
                  onPress={() => handleCalcPress(keyVal)}
                >
                  <Text
                    style={[
                      styles.calcKeyText,
                      keyVal === '=' && { color: '#0B1120', fontWeight: '900' },
                      (keyVal === 'AC' || keyVal === 'C') && { color: '#ef4444' },
                    ]}
                  >
                    {keyVal}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1e',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0f1e',
  },
  header: {
    backgroundColor: '#111827',
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backBtn: {
    padding: 6,
    marginRight: 6,
  },
  headerLeft: {
    flex: 1,
  },
  examTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  sectionTitle: {
    color: '#10b981',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  schemePill: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  schemePillText: {
    color: '#fbbf24',
    fontSize: 8,
    fontWeight: '900',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    gap: 4,
  },
  timerUrgent: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  timerText: {
    color: '#10b981',
    fontWeight: '800',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  menuBtn: {
    padding: 6,
    backgroundColor: '#1e293b',
    borderRadius: 8,
  },
  sectionTabBar: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    paddingHorizontal: 12,
  },
  sectionTabItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  sectionTabItemActive: {
    borderBottomColor: '#10b981',
  },
  sectionTabText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
  },
  sectionTabTextActive: {
    color: '#10b981',
    fontWeight: '800',
  },
  toolingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111827',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  toolBtnActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  toolBtnText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
  },
  toolBtnTextActive: {
    color: '#10b981',
  },
  content: {
    flex: 1,
    padding: 14,
  },
  questionCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionNumber: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bookmarkTag: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bookmarkTagText: {
    color: '#a78bfa',
    fontSize: 8,
    fontWeight: '900',
  },
  marksBadge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  marksText: {
    color: '#fbbf24',
    fontSize: 10,
    fontWeight: '800',
  },
  questionText: {
    color: '#f8fafc',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 10,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  optionBtnSelected: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: '#10b981',
  },
  letterCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  letterCircleSelected: {
    backgroundColor: '#10b981',
  },
  letterText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '800',
  },
  letterTextSelected: {
    color: '#0a0f1e',
    fontWeight: '900',
  },
  optionText: {
    flex: 1,
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#ffffff',
    fontWeight: '700',
  },
  footer: {
    backgroundColor: '#111827',
    paddingHorizontal: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  footerRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  navArrowBtn: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  reviewBtn: {
    flex: 1,
    backgroundColor: '#8b5cf615',
    borderWidth: 1,
    borderColor: '#8b5cf640',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  reviewBtnText: {
    color: '#a78bfa',
    fontSize: 11,
    fontWeight: '800',
  },
  clearBtn: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtnText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
  },
  saveBtn: {
    flex: 1.2,
    backgroundColor: '#10b981',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#0a0f1e',
    fontSize: 12,
    fontWeight: '900',
  },
  submitBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '900',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  paletteContainer: {
    backgroundColor: '#111827',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: height * 0.7,
  },
  paletteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paletteTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  paletteSub: {
    color: '#64748b',
    fontSize: 11,
  },
  modalCloseBtn: {
    padding: 6,
    backgroundColor: '#1e293b',
    borderRadius: 20,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
    backgroundColor: '#0f172a',
    padding: 10,
    borderRadius: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendBox: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  legendText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridBtn: {
    width: (width - 72) / 6,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  gridBtnCurrent: {
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  gridBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  gridDotGreen: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  scratchpadOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 16,
  },
  scratchpadCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    height: 380,
  },
  scratchpadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  scratchpadTitle: {
    color: '#fbbf24',
    fontSize: 14,
    fontWeight: '800',
  },
  scratchClearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  scratchClearText: {
    color: '#ef4444',
    fontSize: 10,
    fontWeight: '700',
  },
  scratchCanvasBox: {
    flex: 1,
    backgroundColor: '#0a0f1e',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  scratchTextInput: {
    flex: 1,
    color: '#e2e8f0',
    fontSize: 13,
    textAlignVertical: 'top',
  },
  calcOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  calcCard: {
    backgroundColor: '#111827',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
  },
  calcHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  calcTitle: {
    color: '#38bdf8',
    fontSize: 14,
    fontWeight: '800',
  },
  calcScreen: {
    backgroundColor: '#0a0f1e',
    borderRadius: 12,
    padding: 14,
    alignItems: 'flex-end',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  calcInputText: {
    color: '#94a3b8',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  calcResultText: {
    color: '#38bdf8',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  calcGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  calcKey: {
    width: (width - 100) / 4,
    height: 44,
    backgroundColor: '#1e293b',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calcKeyEqual: {
    backgroundColor: '#38bdf8',
  },
  calcKeyClear: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  calcKeyText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
