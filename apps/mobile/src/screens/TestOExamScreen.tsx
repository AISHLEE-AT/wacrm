import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, 
  ScrollView, SafeAreaView, Alert, Dimensions, Modal, Platform, StatusBar,
  TextInput
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { 
  Clock, Menu, X, ChevronLeft, ChevronRight, Bookmark, 
  Languages, Type, Edit3, Calculator, Award, CheckCircle2,
  Trash2, Layers, BookOpen, Sparkles, Target, Flame
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  generateBilingualQuestionsForTopic,
  getExamMarkingScheme,
  calculateTestODiagnosticReport,
} from '../lib/testoQuestionEngine';
import { fetchTestOMcqsForTopic } from '../lib/coursePlayerEngine';
import { lmsSupabase as aishleeSupabase } from '../lib/lms-supabase';

const { width, height } = Dimensions.get('window');

// 5-State Status types per NTA / TCS iON standard
const STATUS_COLORS = {
  NOT_VISITED: '#475569',       // Slate Gray
  NOT_ANSWERED: '#EF4444',      // Red
  ANSWERED: '#00D084',          // Emerald Green
  REVIEW: '#8B5CF6',            // Violet
  ANSWERED_REVIEW: '#6366F1',   // Indigo
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
  const [scratchLines, setScratchLines] = useState<string>('');
  const [calcInput, setCalcInput] = useState('');
  const [calcResult, setCalcResult] = useState('');

  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 mins default
  const [submitted, setSubmitted] = useState(false);

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
      
      if (route.params?.initialQuestions && Array.isArray(route.params.initialQuestions) && route.params.initialQuestions.length > 0) {
        info = { questions: route.params.initialQuestions };
      } else if (route.params?.localQuestions && Array.isArray(route.params.localQuestions) && route.params.localQuestions.length > 0) {
        info = { questions: route.params.localQuestions };
      } else if (route.params?.topicTitle || title) {
        try {
          const dynamicQs = await fetchTestOMcqsForTopic(
            route.params?.topicTitle || title,
            route.params?.courseTitle || 'Academic Course',
            questionCount || 10
          );
          if (dynamicQs && dynamicQs.length > 0) {
            info = { questions: dynamicQs };
          }
        } catch (fetchErr) {
          console.warn('Error fetching dynamic topic MCQs:', fetchErr);
        }
      }

      if (!info.questions && testId) {
        try {
          const { data, error } = await aishleeSupabase
            .from('unified_master_data')
            .select('*')
            .eq('id', testId)
            .single();
          
          if (!error && data) {
            info = data.additional_info || data.metadata || {};
          }
        } catch (e) {}
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
            section: "Physics / Core Concepts",
            section_ta: "இயற்பியல் / அடிப்படைக் கருத்துக்கள்",
            topic: "Thermodynamics & Heat Transfer",
            topic_ta: "வெப்ப இயக்கவியல் மற்றும் வெப்ப பரிமாற்றம்",
            subject: "Physics",
            subject_ta: "இயற்பியல்",
            difficulty: "easy"
          },
          {
            question: "Which Indian state has the highest coastal length in the mainland?",
            question_ta: "இந்தியாவின் முக்கிய நிலப்பரப்பில் மிக நீண்ட கடற்கரையைக் கொண்டுள்ள மாநிலம் எது?",
            options: ["A) Tamil Nadu", "B) Gujarat", "C) Andhra Pradesh", "D) Maharashtra"],
            answer: "B) Gujarat",
            explanation: "Gujarat has the longest mainland coastline in India measuring approx 1,600 km.",
            section: "Geography of India",
            section_ta: "இந்தியப் புவியியல்",
            topic: "Physical Geography & Coastal Features",
            topic_ta: "இயற்கைப் புவியியல் மற்றும் கடற்கரை அமைப்புகள்",
            subject: "Social Science",
            subject_ta: "சமூக அறிவியல்",
            difficulty: "moderate"
          },
          {
            question: "Solve: If 3x + 5 = 20, what is the value of 2x^2 + 3?",
            question_ta: "தீர்வு காண்க: 3x + 5 = 20 எனில், 2x^2 + 3 இன் மதிப்பு என்ன?",
            options: ["A) 53", "B) 47", "C) 50", "D) 25"],
            answer: "A) 53",
            explanation: "3x = 15 => x = 5. Then 2(5^2) + 3 = 2(25) + 3 = 50 + 3 = 53.",
            section: "Quantitative Aptitude",
            section_ta: "கணிதத் திறன்",
            topic: "Linear & Quadratic Equations",
            topic_ta: "நேரியல் மற்றும் இருபடிச் சமன்பாடுகள்",
            subject: "Mathematics",
            subject_ta: "கணிதம்",
            difficulty: "moderate"
          }
        ];
      }

      // Ensure every question has topic, subject, and difficulty populated
      const defaultTopic = route.params?.topicTitle || title || 'Core Concept';
      const defaultSubject = route.params?.subject || 'General Studies';
      
      const normalizedQs = qs.map((q: any, idx: number) => {
        return {
          ...q,
          questionNumber: idx + 1,
          topic: q.topic || q.topicTitleEn || q.topicTitle || defaultTopic,
          topic_ta: q.topic_ta || q.topicTitleTa || q.topic || defaultTopic,
          subject: q.subject || q.subjectNameEn || defaultSubject,
          subject_ta: q.subject_ta || q.subjectNameTa || q.subject || defaultSubject,
          section: q.section || q.sectionNameEn || 'Section 1 (Core Concepts)',
          section_ta: q.section_ta || q.sectionNameTa || 'பிரிவு 1 (அடிப்படைக் கருத்துக்கள்)',
          difficulty: q.difficulty || (idx % 3 === 0 ? 'easy' : idx % 3 === 1 ? 'moderate' : 'hard'),
        };
      });

      setQuestions(normalizedQs);
      if (testId) {
        AsyncStorage.setItem(`offline_test_${testId}`, JSON.stringify(normalizedQs)).catch(() => {});
      }

      const initialStatus: Record<number, string> = {};
      normalizedQs.forEach((_: any, i: number) => {
        initialStatus[i] = i === 0 ? 'NOT_ANSWERED' : 'NOT_VISITED';
      });
      setQStatus(initialStatus);
    } catch (err) {
      console.warn('[TestOExamScreen] Network fetch failed, checking offline cache...');
    } finally {
      setLoading(false);
    }
  };

  // Group questions by Topic for the Question Palette Drawer
  const groupedQuestionsByTopic = useMemo(() => {
    const map: Record<string, { topic: string; topicTa: string; subject: string; indices: number[] }> = {};
    questions.forEach((q, idx) => {
      const t = q.topic || q.topicTitleEn || 'Core Concepts';
      const tTa = q.topic_ta || q.topicTitleTa || t;
      const s = q.subject || 'General';
      if (!map[t]) {
        map[t] = { topic: t, topicTa: tTa, subject: s, indices: [] };
      }
      map[t].indices.push(idx);
    });
    return Object.values(map);
  }, [questions]);

  // Section List extraction
  const sectionsList = useMemo(() => {
    const list = new Set<string>();
    questions.forEach(q => {
      list.add(lang === 'TA' ? (q.section_ta || q.section || 'பிரிவு 1') : (q.section || 'Section 1'));
    });
    return Array.from(list);
  }, [questions, lang]);

  const currentQ = questions[currentIdx] || null;

  const questionTextDisplay = useMemo(() => {
    if (!currentQ) return '';
    if (lang === 'TA') {
      return currentQ.question_ta || currentQ.contentTa || currentQ.question || currentQ.contentEn || '';
    }
    return currentQ.question || currentQ.contentEn || currentQ.question_ta || '';
  }, [currentQ, lang]);

  const toggleBookmark = () => {
    setBookmarked(prev => ({ ...prev, [currentIdx]: !prev[currentIdx] }));
  };

  const handleOptionSelect = (opt: string) => {
    setAnswers(prev => ({ ...prev, [currentIdx]: opt }));
    setQStatus(prev => ({
      ...prev,
      [currentIdx]: prev[currentIdx] === 'REVIEW' || prev[currentIdx] === 'ANSWERED_REVIEW' ? 'ANSWERED_REVIEW' : 'ANSWERED'
    }));
  };

  const goToNext = (actionType: 'SAVE' | 'REVIEW') => {
    const isAnswered = !!answers[currentIdx];
    let newStatus = qStatus[currentIdx];

    if (actionType === 'REVIEW') {
      newStatus = isAnswered ? 'ANSWERED_REVIEW' : 'REVIEW';
    } else {
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

    const scheme = getExamMarkingScheme(route.params?.courseId || route.params?.examCategory || 'tnpsc_group4');
    const diagReport = calculateTestODiagnosticReport(
      questions.map((q, idx) => ({
        id: q.id || `q_${idx}`,
        questionNumber: idx + 1,
        sectionId: q.sectionId || 'sec_1',
        sectionNameEn: q.section || 'Core Subject',
        sectionNameTa: q.section_ta || 'முதன்மைப் பாடம்',
        topicTitleEn: q.topic || title || 'General Concept',
        topicTitleTa: q.topic_ta || title || 'பொதுக் கருத்து',
        questionType: q.questionType || 'single_choice',
        difficulty: q.difficulty || 'moderate',
        contentEn: q.question || q.contentEn || '',
        contentTa: q.question_ta || q.contentTa || '',
        options: Array.isArray(q.options)
          ? q.options.map((opt: any, oIdx: number) => ({
              id: typeof opt === 'string' ? opt.substring(0, 1) : opt.id || String.fromCharCode(65 + oIdx),
              textEn: typeof opt === 'string' ? opt : opt.textEn || '',
              textTa: typeof opt === 'string' ? opt : opt.textTa || opt.textEn || ''
            }))
          : [],
        correctAnswer: q.answer || (q.options ? q.options[0] : 'A'),
        solutionEn: q.explanation || 'Detailed pedagogical explanation per official answer key.',
        solutionTa: q.explanation_ta || q.explanation || 'பாடத்திட்ட அடிப்படையிலான அதிகாரப்பூர்வ விரிவான விளக்கம்.'
      })),
      answers,
      timeSpent,
      scheme
    );

    navigation.navigate('TestOResultScreen', {
      report: diagReport,
      testTitle: title || 'Mock Exam',
      courseTitle: route.params?.courseTitle || 'Target Exam',
    });
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const answeredCount = Object.values(qStatus).filter(s => s === 'ANSWERED' || s === 'ANSWERED_REVIEW').length;
  const reviewCount = Object.values(qStatus).filter(s => s === 'REVIEW' || s === 'ANSWERED_REVIEW').length;
  const notAnsweredCount = questions.length - answeredCount;

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#070C18" />
        <ActivityIndicator size="large" color="#00D084" />
        <Text style={styles.loadingText}>Loading Bilingual Question Engine...</Text>
        <Text style={styles.loadingSubtext}>Fetching high-yield MCQs, formulas & syllabus mapping</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#070C18" />

      {/* ─── 1. TOP HEADER ─── */}
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
                { text: 'Exit', style: 'destructive', onPress: () => navigation.navigate('TutOHubScreen') },
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
            <Clock size={13} color={timeLeft < 300 ? '#EF4444' : '#00D084'} />
            <Text style={[styles.timerText, timeLeft < 300 && { color: '#EF4444' }]}>{formatTime(timeLeft)}</Text>
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
          <Languages size={13} color={lang === 'TA' ? '#00D084' : '#94A3B8'} />
          <Text style={[styles.toolBtnText, lang === 'TA' && styles.toolBtnTextActive]}>
            {lang === 'EN' ? '文A தமிழ்' : '文A English'}
          </Text>
        </TouchableOpacity>

        {/* Font Size Adjuster */}
        <TouchableOpacity
          style={styles.toolBtn}
          onPress={() => setFontSizeMultiplier(prev => (prev === 1.2 ? 0.9 : prev === 0.9 ? 1 : 1.2))}
        >
          <Type size={13} color="#94A3B8" />
          <Text style={styles.toolBtnText}>
            {fontSizeMultiplier === 1.2 ? 'A+' : fontSizeMultiplier === 0.9 ? 'A-' : 'A'}
          </Text>
        </TouchableOpacity>

        {/* Virtual Scratchpad / Rough Sheet */}
        <TouchableOpacity
          style={styles.toolBtn}
          onPress={() => setIsScratchpadOpen(true)}
        >
          <Edit3 size={13} color="#F59E0B" />
          <Text style={[styles.toolBtnText, { color: '#F59E0B' }]}>Rough Sheet</Text>
        </TouchableOpacity>

        {/* Virtual Calculator */}
        <TouchableOpacity
          style={styles.toolBtn}
          onPress={() => setIsCalcOpen(true)}
        >
          <Calculator size={13} color="#38BDF8" />
          <Text style={[styles.toolBtnText, { color: '#38BDF8' }]}>Calc</Text>
        </TouchableOpacity>

        {/* Bookmark Question */}
        <TouchableOpacity
          style={[styles.toolBtn, bookmarked[currentIdx] && styles.toolBtnActive]}
          onPress={toggleBookmark}
        >
          <Bookmark size={13} color={bookmarked[currentIdx] ? '#8B5CF6' : '#94A3B8'} />
        </TouchableOpacity>
      </View>

      {/* ─── 4. QUESTION CONTENT & TOPIC HEADER ─── */}
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.questionCard}>
          {/* Dynamic Question Number & Status Top Row */}
          <View style={styles.questionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.questionNumber}>
                QUESTION {currentIdx + 1} OF {questions.length}
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

          {/* DYNAMIC TOPIC-WISE CONTEXT BAR (Updates live per Question Number) */}
          <View style={styles.topicContextBar}>
            <View style={styles.topicContextLeft}>
              <View style={styles.topicPill}>
                <Layers size={12} color="#00D084" />
                <Text style={styles.topicPillText} numberOfLines={1}>
                  {lang === 'TA'
                    ? (currentQ?.topic_ta || currentQ?.topicTitleTa || currentQ?.topic || 'பாடத் தலைப்பு')
                    : (currentQ?.topic || currentQ?.topicTitleEn || 'Topic')}
                </Text>
              </View>
              <View style={styles.subjectPill}>
                <BookOpen size={11} color="#38BDF8" />
                <Text style={styles.subjectPillText} numberOfLines={1}>
                  {lang === 'TA'
                    ? (currentQ?.subject_ta || currentQ?.subjectNameTa || currentQ?.subject || 'பாடம்')
                    : (currentQ?.subject || currentQ?.subjectNameEn || 'Subject')}
                </Text>
              </View>
            </View>
            <View style={styles.difficultyPill}>
              <Text style={styles.difficultyPillText}>
                {String(currentQ?.difficulty || 'MODERATE').toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Question Text */}
          <Text style={[styles.questionText, { fontSize: 15 * fontSizeMultiplier, lineHeight: 22 * fontSizeMultiplier }]}>
            {questionTextDisplay}
          </Text>

          {/* Options */}
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

      {/* ─── 6. TOPIC-GROUPED 5-STATE QUESTION PALETTE MODAL ─── */}
      <Modal visible={isPaletteVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.paletteContainer}>
            <View style={styles.paletteHeader}>
              <View>
                <Text style={styles.paletteTitle}>NTA Question Palette (Topic-Wise)</Text>
                <Text style={styles.paletteSub}>Tap any question number to jump directly</Text>
              </View>
              <TouchableOpacity onPress={() => setIsPaletteVisible(false)} style={styles.modalCloseBtn}>
                <X size={20} color="#94A3B8" />
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

            {/* Topic-Grouped Palette List */}
            <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
              {groupedQuestionsByTopic.map((group, gIdx) => (
                <View key={gIdx} style={styles.paletteTopicGroup}>
                  <View style={styles.paletteTopicHeader}>
                    <View style={styles.paletteTopicLeft}>
                      <Layers size={13} color="#00D084" />
                      <Text style={styles.paletteTopicTitle} numberOfLines={1}>
                        {lang === 'TA' ? `பிரிவு ${gIdx + 1}: ${group.topicTa || group.topic}` : `Topic ${gIdx + 1}: ${group.topic}`}
                      </Text>
                    </View>
                    <Text style={styles.paletteTopicCount}>({group.indices.length} Qs)</Text>
                  </View>

                  <View style={styles.gridContainer}>
                    {group.indices.map((idx) => {
                      const status = qStatus[idx] || 'NOT_VISITED';
                      const bgColor = STATUS_COLORS[status as keyof typeof STATUS_COLORS] || '#475569';
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
                </View>
              ))}
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
                <Edit3 size={16} color="#F59E0B" />
                <Text style={styles.scratchpadTitle}>Virtual Rough Sheet</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <TouchableOpacity
                  style={styles.scratchClearBtn}
                  onPress={() => setScratchLines('')}
                >
                  <Trash2 size={14} color="#EF4444" />
                  <Text style={styles.scratchClearText}>Clear Sheet</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsScratchpadOpen(false)}>
                  <X size={20} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.scratchCanvasBox}>
              <TextInput
                multiline
                placeholder="Type your workings, rough calculation formulas, or step-by-step solutions here..."
                placeholderTextColor="#64748B"
                value={scratchLines}
                onChangeText={setScratchLines}
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
                <Calculator size={16} color="#38BDF8" />
                <Text style={styles.calcTitle}>Exam Calculator</Text>
              </View>
              <TouchableOpacity onPress={() => setIsCalcOpen(false)}>
                <X size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <View style={styles.calcScreen}>
              <Text style={styles.calcInputText}>{calcInput || '0'}</Text>
              {calcResult ? <Text style={styles.calcResultText}>= {calcResult}</Text> : null}
            </View>

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
                      keyVal === '=' && { color: '#070C18', fontWeight: '900' },
                      (keyVal === 'AC' || keyVal === 'C') && { color: '#EF4444' },
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
    backgroundColor: '#070C18',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#070C18',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    padding: 24,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
    marginTop: 10,
  },
  loadingSubtext: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0E172A',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLeft: {
    flex: 1,
    marginHorizontal: 10,
  },
  examTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#00D084',
    letterSpacing: 0.5,
  },
  schemePill: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  schemePillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#F59E0B',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#131F37',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  timerUrgent: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  timerText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#00D084',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  menuBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTabBar: {
    flexDirection: 'row',
    backgroundColor: '#0E172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingHorizontal: 8,
  },
  sectionTabItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  sectionTabItemActive: {
    borderBottomColor: '#00D084',
  },
  sectionTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  sectionTabTextActive: {
    color: '#00D084',
    fontWeight: '800',
  },
  toolingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0B1120',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  toolBtnActive: {
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
    borderWidth: 1,
    borderColor: '#00D084',
  },
  toolBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  toolBtnTextActive: {
    color: '#00D084',
  },
  content: {
    flex: 1,
    padding: 14,
  },
  questionCard: {
    backgroundColor: '#0E172A',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 12,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionNumber: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  bookmarkTag: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  bookmarkTagText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#ffffff',
  },
  marksBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  marksText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F59E0B',
  },
  topicContextBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#131F37',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  topicContextLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  topicPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 208, 132, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
    flexShrink: 1,
  },
  topicPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00D084',
  },
  subjectPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  subjectPillText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#38BDF8',
  },
  difficultyPill: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 5,
    paddingVertical: 2.5,
    borderRadius: 4,
  },
  difficultyPillText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#CBD5E1',
    letterSpacing: 0.5,
  },
  questionText: {
    color: '#F8FAFC',
    fontWeight: '600',
  },
  optionsContainer: {
    gap: 8,
    marginTop: 4,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131F37',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 10,
  },
  optionBtnSelected: {
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
    borderColor: '#00D084',
  },
  letterCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterCircleSelected: {
    backgroundColor: '#00D084',
  },
  letterText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
  },
  letterTextSelected: {
    color: '#070C18',
  },
  optionText: {
    flex: 1,
    color: '#CBD5E1',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
  footer: {
    backgroundColor: '#0E172A',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingHorizontal: 12,
    paddingTop: 8,
    gap: 8,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navArrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewBtn: {
    flex: 1,
    backgroundColor: '#1E293B',
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  reviewBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  clearBtn: {
    flex: 1,
    backgroundColor: '#1E293B',
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  saveBtn: {
    flex: 1.3,
    backgroundColor: '#00D084',
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#070C18',
  },
  submitBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#EF4444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  paletteContainer: {
    backgroundColor: '#0E172A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: '#334155',
  },
  paletteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paletteTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  paletteSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  modalCloseBtn: {
    padding: 4,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    backgroundColor: '#131F37',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendBox: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 10,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  paletteTopicGroup: {
    marginBottom: 14,
    backgroundColor: '#131F37',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  paletteTopicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  paletteTopicLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 6,
  },
  paletteTopicTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00D084',
  },
  paletteTopicCount: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  gridBtnCurrent: {
    borderWidth: 2,
    borderColor: '#F8FAFC',
  },
  gridBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },
  gridDotGreen: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00D084',
  },
  scratchpadOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    padding: 16,
  },
  scratchpadCard: {
    backgroundColor: '#0E172A',
    borderRadius: 14,
    padding: 14,
    height: height * 0.65,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  scratchpadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  scratchpadTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  scratchClearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  scratchClearText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EF4444',
  },
  scratchCanvasBox: {
    flex: 1,
    backgroundColor: '#131F37',
    borderRadius: 10,
    padding: 10,
  },
  scratchTextInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 13,
    textAlignVertical: 'top',
  },
  calcOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  calcCard: {
    width: Math.min(width - 40, 320),
    backgroundColor: '#0E172A',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  calcHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  calcTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  calcScreen: {
    backgroundColor: '#131F37',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    alignItems: 'flex-end',
  },
  calcInputText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  calcResultText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00D084',
    marginTop: 2,
  },
  calcGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'space-between',
  },
  calcKey: {
    width: '22%',
    height: 40,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calcKeyEqual: {
    backgroundColor: '#00D084',
  },
  calcKeyClear: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  calcKeyText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
  },
});
