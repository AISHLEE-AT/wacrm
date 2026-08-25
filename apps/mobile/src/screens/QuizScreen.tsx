import React, { useState, useEffect, useMemo, useRef, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Modal,
  Platform,
  StatusBar,
  Linking,
  Share,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ArrowLeft,
  Flame,
  Award,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Share2,
  RotateCcw,
  Languages,
  Send,
  BookOpen,
  ChevronRight,
  Zap,
  TrendingUp,
  Layers,
} from 'lucide-react-native';

import { AppContext } from '../context/AppContext';
import { colors } from '../lib/theme';
import {
  StructuredMCQ,
  MASTER_QBANK_STORE,
  EXAM_CATEGORIES,
  ExamCategory,
} from '../lib/qbankTaxonomyEngine';
import { supabase } from '../lib/supabase';

const { width } = Dimensions.get('window');

// Default fallback Telegram group link (can be updated by admin/env)
const TELEGRAM_GROUP_URL = 'https://t.me/supro_education';

export default function QuizScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const { user } = useContext(AppContext) || {};

  // ─── State Management ────────────────────────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState<ExamCategory>('ALL');
  const [language, setLanguage] = useState<'EN' | 'TA'>('EN');
  const [loading, setLoading] = useState<boolean>(true);
  const [questions, setQuestions] = useState<StructuredMCQ[]>([]);

  // Quiz Gameplay State
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});
  const [isAnswerRevealed, setIsAnswerRevealed] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(600); // 10 minutes default
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);

  // Gamification & Streaks
  const [streakCount, setStreakCount] = useState<number>(3);
  const [earnedXP, setEarnedXP] = useState<number>(0);
  const [todayCompleted, setTodayCompleted] = useState<boolean>(false);

  const timerRef = useRef<any>(null);

  // Load Saved Stats & Streak on mount
  useEffect(() => {
    async function loadStats() {
      try {
        const savedStreak = await AsyncStorage.getItem('supro_quiz_streak');
        if (savedStreak) setStreakCount(parseInt(savedStreak, 10));

        const lastQuizDate = await AsyncStorage.getItem('supro_quiz_last_date');
        const todayStr = new Date().toISOString().split('T')[0];
        if (lastQuizDate === todayStr) {
          setTodayCompleted(true);
        }
      } catch (e) {
        console.warn('Error loading quiz stats:', e);
      }
    }
    loadStats();
  }, []);

  // Fetch 10 Daily Questions based on Category
  const loadDailyQuestions = async (cat: ExamCategory) => {
    setLoading(true);
    try {
      // 1. Try fetching from Supabase table edu_question_bank
      let query = supabase.from('edu_question_bank').select('*').limit(10);
      if (cat !== 'ALL') {
        query = query.eq('exam_category', cat);
      }
      const { data, error } = await query;

      if (!error && data && data.length >= 5) {
        setQuestions(data as any);
      } else {
        // 2. Fallback to rich master local taxonomy store
        let filtered = MASTER_QBANK_STORE;
        if (cat !== 'ALL') {
          filtered = MASTER_QBANK_STORE.filter(
            (q) => q.exam_category === cat || q.taxonomy?.exam_category === cat
          );
        }
        if (filtered.length < 10) {
          filtered = MASTER_QBANK_STORE;
        }
        // Shuffle deterministic 10 for daily variety
        const shuffled = [...filtered].sort(() => 0.5 - Math.random()).slice(0, 10);
        setQuestions(shuffled);
      }
    } catch (err) {
      console.warn('Supabase fetch failed, using local store:', err);
      setQuestions(MASTER_QBANK_STORE.slice(0, 10));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDailyQuestions(selectedCategory);
  }, [selectedCategory]);

  // Quiz Timer
  useEffect(() => {
    if (quizStarted && !quizCompleted) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            finishQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quizStarted, quizCompleted]);

  // Start Quiz
  const startQuiz = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setIsAnswerRevealed(false);
    setTimeRemaining(600);
    setQuizCompleted(false);
    setQuizStarted(true);
  };

  // Handle Option Select
  const handleSelectOption = (optKey: 'A' | 'B' | 'C' | 'D') => {
    if (selectedAnswers[currentIndex]) return; // Already answered

    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: optKey,
    }));
    setIsAnswerRevealed(true);
  };

  // Navigate to Next Question
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsAnswerRevealed(!!selectedAnswers[currentIndex + 1]);
    } else {
      finishQuiz();
    }
  };

  // Finish Quiz & Compute Stats
  const finishQuiz = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setQuizCompleted(true);

    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct_option) {
        correctCount++;
      }
    });

    const xp = correctCount * 15 + 50; // 15 XP per correct + 50 completion bonus
    setEarnedXP(xp);

    try {
      const todayStr = new Date().toISOString().split('T')[0];
      await AsyncStorage.setItem('supro_quiz_last_date', todayStr);
      const newStreak = streakCount + 1;
      setStreakCount(newStreak);
      await AsyncStorage.setItem('supro_quiz_streak', newStreak.toString());
      setTodayCompleted(true);
    } catch (e) {
      console.warn('Failed to save quiz results:', e);
    }
  };

  // Score computation
  const scoreReport = useMemo(() => {
    let correct = 0;
    let wrong = 0;
    let unattempted = 0;

    questions.forEach((q, idx) => {
      const ans = selectedAnswers[idx];
      if (!ans) {
        unattempted++;
      } else if (ans === q.correct_option) {
        correct++;
      } else {
        wrong++;
      }
    });

    const percentage = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    return { correct, wrong, unattempted, percentage };
  }, [questions, selectedAnswers]);

  const currentQ = questions[currentIndex];

  // Helper: Open Telegram Group
  const openTelegramGroup = () => {
    Linking.openURL(TELEGRAM_GROUP_URL).catch(() => {
      Alert.alert('Telegram', 'Please open Telegram and join @supro_education');
    });
  };

  // Share score to Telegram / WhatsApp
  const shareScore = async () => {
    try {
      const msg =
        `🔥 I scored ${scoreReport.correct}/${questions.length} (${scoreReport.percentage}%) in SuprO Daily 10 Quiz Challenge!\n` +
        `⚡ Streak: ${streakCount} Days | Category: ${selectedCategory}\n\n` +
        `👉 Test your MCQ skills with 2,00,000+ bilingual questions & join our Telegram group: ${TELEGRAM_GROUP_URL}`;
      await Share.share({ message: msg });
    } catch (e) {
      console.warn('Share failed:', e);
    }
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0f1e" />

      {/* ─── Header Bar ──────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            if (quizStarted && !quizCompleted) {
              Alert.alert('Exit Quiz?', 'Are you sure you want to quit? Your progress will be saved.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Exit', onPress: () => setQuizStarted(false) },
              ]);
            } else {
              navigation.goBack();
            }
          }}
        >
          <ArrowLeft size={20} color="#f8fafc" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>🎯 Daily 10 Quiz Hub</Text>
          <Text style={styles.headerSub}>QBank Practice & Telegram Community</Text>
        </View>

        {/* Language Toggle Button */}
        <TouchableOpacity
          style={styles.langToggle}
          onPress={() => setLanguage((prev) => (prev === 'EN' ? 'TA' : 'EN'))}
        >
          <Languages size={15} color="#10b981" />
          <Text style={styles.langToggleText}>{language === 'EN' ? 'தமிழ்' : 'ENG'}</Text>
        </TouchableOpacity>
      </View>

      {/* ─── View 1: Lobby / Challenge Selection ──────────────────────────────── */}
      {!quizStarted && (
        <ScrollView contentContainerStyle={styles.lobbyContent} showsVerticalScrollIndicator={false}>
          {/* Top Streak & Stats Header */}
          <View style={styles.streakBanner}>
            <View style={styles.streakLeft}>
              <View style={styles.flameIconBox}>
                <Flame size={26} color="#f59e0b" fill="#f59e0b" />
              </View>
              <View>
                <Text style={styles.streakNumber}>{streakCount} Days Streak</Text>
                <Text style={styles.streakCaption}>
                  {todayCompleted ? "✅ Today's Challenge Completed!" : '🔥 Complete today to keep streak!'}
                </Text>
              </View>
            </View>
            <View style={styles.xpBadge}>
              <Sparkles size={14} color="#10b981" />
              <Text style={styles.xpText}>+150 XP</Text>
            </View>
          </View>

          {/* 📢 Telegram Group Official Community Banner */}
          <TouchableOpacity style={styles.telegramCard} onPress={openTelegramGroup} activeOpacity={0.88}>
            <View style={styles.telegramHeader}>
              <View style={styles.tgIconCircle}>
                <Send size={20} color="#ffffff" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={styles.tgBadgeRow}>
                  <Text style={styles.tgCardTitle}>Join Telegram Quiz Group</Text>
                  <View style={styles.liveTag}>
                    <Text style={styles.liveTagText}>DAILY LIVE</Text>
                  </View>
                </View>
                <Text style={styles.tgCardDesc}>
                  Daily 10 MCQs are auto-posted as Telegram Polls. Compete with 5,000+ students!
                </Text>
              </View>
            </View>
            <View style={styles.tgFooter}>
              <Text style={styles.tgActionText}>Tap to Open Group in Telegram App 🚀</Text>
              <ChevronRight size={16} color="#38bdf8" />
            </View>
          </TouchableOpacity>

          {/* Category Filter Horizontal Pills */}
          <Text style={styles.sectionHeading}>Select Exam Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {EXAM_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <Text style={styles.categoryPillIcon}>{cat.icon}</Text>
                  <Text style={[styles.categoryPillText, isSelected && styles.categoryPillTextActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Daily 10 Challenge Hero Card */}
          <View style={styles.challengeCard}>
            <View style={styles.challengeTop}>
              <View style={styles.challengeBadge}>
                <Zap size={13} color="#10b981" />
                <Text style={styles.challengeBadgeText}>TODAY'S SPECIAL</Text>
              </View>
              <Text style={styles.challengeDate}>
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
            </View>

            <Text style={styles.challengeTitle}>
              {selectedCategory === 'ALL' ? 'General Studies & Science' : selectedCategory} Daily 10 Quiz
            </Text>
            <Text style={styles.challengeSubtitle}>
              10 Curated MCQs • 10 Minutes • Bilingual (Tamil + English) • Instant Solution
            </Text>

            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <BookOpen size={16} color="#38bdf8" />
                <Text style={styles.statVal}>10 Questions</Text>
              </View>
              <View style={styles.statBox}>
                <Clock size={16} color="#f59e0b" />
                <Text style={styles.statVal}>10 Mins</Text>
              </View>
              <View style={styles.statBox}>
                <Award size={16} color="#a855f7" />
                <Text style={styles.statVal}>+150 XP</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.startQuizBtn}
              onPress={startQuiz}
              disabled={loading || questions.length === 0}
            >
              {loading ? (
                <ActivityIndicator color="#0a0f1e" />
              ) : (
                <>
                  <Text style={styles.startQuizBtnText}>🚀 Start Daily 10 Challenge</Text>
                  <ChevronRight size={18} color="#0a0f1e" />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Question Bank Quick Stats */}
          <View style={styles.qbankOverviewCard}>
            <View style={styles.qbankHeader}>
              <Layers size={18} color="#10b981" />
              <Text style={styles.qbankTitle}>2,00,000+ Master Question Bank</Text>
            </View>
            <Text style={styles.qbankDesc}>
              Every question in SuprO is indexed deterministically with subject taxonomy, formula mnemonics, and official government exam tags.
            </Text>
          </View>
        </ScrollView>
      )}

      {/* ─── View 2: Active Quiz Gameplay ────────────────────────────────────── */}
      {quizStarted && !quizCompleted && currentQ && (
        <View style={styles.quizPlayContainer}>
          {/* Progress Header & Timer */}
          <View style={styles.playHeader}>
            <View style={styles.qIndexBox}>
              <Text style={styles.qIndexCurrent}>Question {currentIndex + 1}</Text>
              <Text style={styles.qIndexTotal}> of {questions.length}</Text>
            </View>

            <View style={styles.timerBadge}>
              <Clock size={14} color="#f59e0b" />
              <Text style={styles.timerText}>{formatTimer(timeRemaining)}</Text>
            </View>
          </View>

          {/* Progress Indicator Bar */}
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${((currentIndex + 1) / questions.length) * 100}%` },
              ]}
            />
          </View>

          {/* Question Box */}
          <ScrollView style={styles.qScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.qCard}>
              <View style={styles.qTaxonomyRow}>
                <Text style={styles.qSubjectTag}>
                  {currentQ.taxonomy?.subject || currentQ.subject || 'General Studies'}
                </Text>
                <Text style={styles.qDifficultyTag}>
                  {currentQ.taxonomy?.difficulty || 'Medium'}
                </Text>
              </View>

              {/* Question Text in English & Tamil */}
              <Text style={styles.qTextMain}>
                {language === 'TA' && currentQ.question_text_ta
                  ? currentQ.question_text_ta
                  : currentQ.question_text}
              </Text>

              {language === 'EN' && currentQ.question_text_ta && (
                <Text style={styles.qTextTamilSub}>{currentQ.question_text_ta}</Text>
              )}
            </View>

            {/* MCQ Options A, B, C, D */}
            <View style={styles.optionsContainer}>
              {(['A', 'B', 'C', 'D'] as const).map((key) => {
                const isSelected = selectedAnswers[currentIndex] === key;
                const isCorrect = key === currentQ.correct_option;
                const optionEng = currentQ.options?.[key] || '';
                const optionTa = currentQ.options_ta?.[key];

                let optionStyle = styles.optionButton;
                let textStyle = styles.optionText;
                let badgeStyle = styles.optionLetterBadge;

                if (isAnswerRevealed) {
                  if (isCorrect) {
                    optionStyle = styles.optionButtonCorrect;
                    textStyle = styles.optionTextCorrect;
                    badgeStyle = styles.optionLetterBadgeCorrect;
                  } else if (isSelected && !isCorrect) {
                    optionStyle = styles.optionButtonWrong;
                    textStyle = styles.optionTextWrong;
                    badgeStyle = styles.optionLetterBadgeWrong;
                  }
                } else if (isSelected) {
                  optionStyle = styles.optionButtonSelected;
                  badgeStyle = styles.optionLetterBadgeSelected;
                }

                return (
                  <TouchableOpacity
                    key={key}
                    style={optionStyle}
                    onPress={() => handleSelectOption(key)}
                    activeOpacity={0.8}
                    disabled={isAnswerRevealed}
                  >
                    <View style={badgeStyle}>
                      <Text style={styles.optionLetterText}>{key}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={textStyle}>
                        {language === 'TA' && optionTa ? optionTa : optionEng}
                      </Text>
                      {language === 'EN' && optionTa && (
                        <Text style={styles.optionTamilSub}>{optionTa}</Text>
                      )}
                    </View>

                    {isAnswerRevealed && isCorrect && (
                      <CheckCircle2 size={18} color="#10b981" />
                    )}
                    {isAnswerRevealed && isSelected && !isCorrect && (
                      <XCircle size={18} color="#ef4444" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Explanation & Solution Card (Revealed on answer) */}
            {isAnswerRevealed && (
              <View style={styles.explanationCard}>
                <View style={styles.explanationHeader}>
                  <HelpCircle size={16} color="#10b981" />
                  <Text style={styles.explanationTitle}>Detailed Explanation & Law</Text>
                </View>
                <Text style={styles.explanationText}>
                  {language === 'TA' && currentQ.explanation_ta
                    ? currentQ.explanation_ta
                    : currentQ.explanation}
                </Text>
                {currentQ.formula_or_law && (
                  <View style={styles.formulaBox}>
                    <Text style={styles.formulaLabel}>Formula / Law:</Text>
                    <Text style={styles.formulaText}>{currentQ.formula_or_law}</Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          {/* Bottom Action Button */}
          <View style={styles.playBottomBar}>
            <TouchableOpacity
              style={[
                styles.nextButton,
                !selectedAnswers[currentIndex] && styles.nextButtonDisabled,
              ]}
              onPress={handleNext}
              disabled={!selectedAnswers[currentIndex]}
            >
              <Text style={styles.nextButtonText}>
                {currentIndex === questions.length - 1 ? '🏁 Submit & View Results' : 'Next Question ➡️'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ─── View 3: Score & Summary Modal ───────────────────────────────────── */}
      {quizCompleted && (
        <ScrollView contentContainerStyle={styles.resultContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.resultCard}>
            <View style={styles.trophyCircle}>
              <Award size={40} color="#10b981" />
            </View>
            <Text style={styles.resultHeadline}>Quiz Completed! 🎉</Text>
            <Text style={styles.resultSub}>You demonstrated great commitment today!</Text>

            {/* Score Ring / Big Numbers */}
            <View style={styles.scoreRow}>
              <View style={styles.scoreMetric}>
                <Text style={styles.metricVal}>{scoreReport.correct}</Text>
                <Text style={styles.metricLabel}>Correct</Text>
              </View>
              <View style={styles.scoreDivider} />
              <View style={styles.scoreMetric}>
                <Text style={[styles.metricVal, { color: '#ef4444' }]}>{scoreReport.wrong}</Text>
                <Text style={styles.metricLabel}>Wrong</Text>
              </View>
              <View style={styles.scoreDivider} />
              <View style={styles.scoreMetric}>
                <Text style={[styles.metricVal, { color: '#38bdf8' }]}>{scoreReport.percentage}%</Text>
                <Text style={styles.metricLabel}>Accuracy</Text>
              </View>
            </View>

            {/* XP & Rewards */}
            <View style={styles.rewardBox}>
              <View style={styles.rewardItem}>
                <Sparkles size={18} color="#10b981" />
                <Text style={styles.rewardText}>+{earnedXP} XP Earned</Text>
              </View>
              <View style={styles.rewardItem}>
                <Flame size={18} color="#f59e0b" />
                <Text style={styles.rewardText}>{streakCount} Days Streak</Text>
              </View>
            </View>

            {/* Share to WhatsApp / Telegram */}
            <TouchableOpacity style={styles.shareBtn} onPress={shareScore}>
              <Share2 size={18} color="#ffffff" />
              <Text style={styles.shareBtnText}>Share Score with Friends</Text>
            </TouchableOpacity>

            {/* Join Telegram Group Button */}
            <TouchableOpacity style={styles.tgGroupBtn} onPress={openTelegramGroup}>
              <Send size={18} color="#38bdf8" />
              <Text style={styles.tgGroupBtnText}>Join Telegram Daily Quiz Group</Text>
            </TouchableOpacity>

            {/* Retry Button */}
            <TouchableOpacity style={styles.retryBtn} onPress={startQuiz}>
              <RotateCcw size={16} color="#94a3b8" />
              <Text style={styles.retryBtnText}>Practice Again</Text>
            </TouchableOpacity>

            {/* Back to Hub */}
            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => setQuizStarted(false)}
            >
              <Text style={styles.doneBtnText}>Back to Quiz Hub</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

// ─── Stylesheet ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#f8fafc',
  },
  headerSub: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 1,
  },
  langToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064e3b',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#059669',
  },
  langToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10b981',
    marginLeft: 4,
  },
  lobbyContent: {
    padding: 16,
    paddingBottom: 40,
  },
  streakBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#111827',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 14,
  },
  streakLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flameIconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  streakNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
  },
  streakCaption: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  xpText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10b981',
    marginLeft: 4,
  },
  telegramCard: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#0284c7',
    padding: 14,
    marginBottom: 16,
  },
  telegramHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tgIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0284c7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tgBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tgCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f8fafc',
  },
  liveTag: {
    backgroundColor: '#0369a1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ffffff',
  },
  tgCardDesc: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 3,
    lineHeight: 15,
  },
  tgFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: 10,
    marginTop: 10,
  },
  tgActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#38bdf8',
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#cbd5e1',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginRight: 8,
  },
  categoryPillActive: {
    backgroundColor: '#064e3b',
    borderColor: '#10b981',
  },
  categoryPillIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
  },
  categoryPillTextActive: {
    color: '#10b981',
    fontWeight: '700',
  },
  challengeCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 16,
  },
  challengeTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  challengeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  challengeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10b981',
    marginLeft: 4,
  },
  challengeDate: {
    fontSize: 12,
    color: '#64748b',
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 4,
  },
  challengeSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 14,
    lineHeight: 17,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statVal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#cbd5e1',
    marginLeft: 6,
  },
  startQuizBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 12,
  },
  startQuizBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0a0f1e',
    marginRight: 6,
  },
  qbankOverviewCard: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  qbankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  qbankTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f8fafc',
    marginLeft: 8,
  },
  qbankDesc: {
    fontSize: 11,
    color: '#64748b',
    lineHeight: 16,
  },
  // Gameplay View Styles
  quizPlayContainer: {
    flex: 1,
  },
  playHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  qIndexBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  qIndexCurrent: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
  },
  qIndexTotal: {
    fontSize: 12,
    color: '#64748b',
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  timerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f59e0b',
    marginLeft: 5,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: '#1e293b',
    marginHorizontal: 16,
    borderRadius: 2,
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 2,
  },
  qScroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  qCard: {
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 14,
  },
  qTaxonomyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  qSubjectTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38bdf8',
    textTransform: 'uppercase',
  },
  qDifficultyTag: {
    fontSize: 10,
    color: '#94a3b8',
    backgroundColor: '#1e293b',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  qTextMain: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f8fafc',
    lineHeight: 22,
  },
  qTextTamilSub: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 8,
    lineHeight: 19,
  },
  optionsContainer: {
    marginBottom: 14,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 10,
  },
  optionButtonSelected: {
    borderColor: '#38bdf8',
    backgroundColor: '#0c4a6e',
  },
  optionButtonCorrect: {
    borderColor: '#10b981',
    backgroundColor: '#064e3b',
  },
  optionButtonWrong: {
    borderColor: '#ef4444',
    backgroundColor: '#450a0a',
  },
  optionLetterBadge: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  optionLetterBadgeSelected: {
    backgroundColor: '#38bdf8',
  },
  optionLetterBadgeCorrect: {
    backgroundColor: '#10b981',
  },
  optionLetterBadgeWrong: {
    backgroundColor: '#ef4444',
  },
  optionLetterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#f8fafc',
  },
  optionText: {
    fontSize: 14,
    color: '#e2e8f0',
    lineHeight: 19,
  },
  optionTextCorrect: {
    fontSize: 14,
    color: '#a7f3d0',
    fontWeight: '600',
  },
  optionTextWrong: {
    fontSize: 14,
    color: '#fecaca',
  },
  optionTamilSub: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  explanationCard: {
    backgroundColor: '#064e3b',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#059669',
    marginBottom: 20,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  explanationTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10b981',
    marginLeft: 6,
  },
  explanationText: {
    fontSize: 12,
    color: '#d1fae5',
    lineHeight: 18,
  },
  formulaBox: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(16, 185, 129, 0.2)',
  },
  formulaLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34d399',
  },
  formulaText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#ffffff',
    marginTop: 2,
  },
  playBottomBar: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    backgroundColor: '#0a0f1e',
  },
  nextButton: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#1e293b',
    opacity: 0.6,
  },
  nextButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0a0f1e',
  },
  // Result View Styles
  resultContainer: {
    padding: 20,
  },
  resultCard: {
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  trophyCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultHeadline: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
  },
  resultSub: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    marginBottom: 16,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: '#0f172a',
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 16,
  },
  scoreMetric: {
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 22,
    fontWeight: '800',
    color: '#10b981',
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  scoreDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#1e293b',
  },
  rewardBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 0.48,
    justifyContent: 'center',
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#f8fafc',
    marginLeft: 6,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  shareBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 8,
  },
  tgGroupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#0284c7',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  tgGroupBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#38bdf8',
    marginLeft: 8,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  retryBtnText: {
    fontSize: 13,
    color: '#94a3b8',
    marginLeft: 6,
  },
  doneBtn: {
    paddingVertical: 8,
  },
  doneBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10b981',
  },
});
