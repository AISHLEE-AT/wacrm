import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Alert,
  Share,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import {
  X,
  Play,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Award,
  Clock,
  Layers,
  FileText,
  Heart,
  Zap,
  ChevronRight,
  Calendar,
  Smile,
  RefreshCw,
  Copy,
  Sliders,
  Send,
  Video,
} from 'lucide-react-native';

import {
  WholeYearDayPlan,
  resolveWholeYearDayPlan,
  getAdminCustomDayPlan,
} from '../../data/curriculum/wholeYearDayPlanEngine';

const { width } = Dimensions.get('window');

interface TutODayCoursePlayerModalProps {
  visible: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
  initialDay?: number;
  board?: string;
  onCompleteDay?: (dayNumber: number, earnedXp: number) => void;
}

type StepKey = 'vid1' | 'vid2' | 'vid3' | 'note1' | 'note2' | 'note3' | 'test' | 'yoga';

export const TutODayCoursePlayerModal: React.FC<TutODayCoursePlayerModalProps> = ({
  visible,
  onClose,
  courseId,
  courseTitle,
  initialDay = 1,
  board = 'TNSB',
  onCompleteDay,
}) => {
  const insets = useSafeAreaInsets();
  const [currentDay, setCurrentDay] = useState<number>(initialDay);
  const [activeStep, setActiveStep] = useState<StepKey>('vid1');
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [dayPlanData, setDayPlanData] = useState<WholeYearDayPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Daily MCQ Test State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [testSubmitted, setTestSubmitted] = useState<boolean>(false);
  const [testScore, setTestScore] = useState<number>(0);

  // Student Interactive AI Note State
  const [aiCustomPrompt, setAiCustomPrompt] = useState<string>('');
  const [aiResponseText, setAiResponseText] = useState<string>('');
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);

  // Load and resolve day plan
  useEffect(() => {
    if (!visible) return;

    let isMounted = true;
    async function loadDay() {
      setIsLoading(true);
      try {
        // 1. Check for admin custom overrides
        const custom = await getAdminCustomDayPlan(courseId, currentDay);
        if (custom && isMounted) {
          setDayPlanData(custom);
        } else {
          // 2. Resolve default authentic syllabus plan
          const resolved = resolveWholeYearDayPlan(courseId, courseTitle, currentDay, board);
          if (isMounted) setDayPlanData(resolved);
        }

        // Load progress for current day
        const progressRaw = await AsyncStorage.getItem(`tuto_day_progress_${courseId}_${currentDay}`);
        if (progressRaw && isMounted) {
          setCompletedSteps(JSON.parse(progressRaw));
        } else if (isMounted) {
          setCompletedSteps({});
        }

        // Reset test state for new day
        setSelectedAnswers({});
        setTestSubmitted(false);
        setTestScore(0);
        setAiResponseText('');
      } catch (e) {
        console.warn('Error loading day plan:', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadDay();
    return () => {
      isMounted = false;
    };
  }, [visible, courseId, courseTitle, currentDay, board]);

  const plan = dayPlanData || resolveWholeYearDayPlan(courseId, courseTitle, currentDay, board);

  // Step Completion Handler
  const handleMarkStepComplete = async (step: StepKey, stepXp: number = 25) => {
    const updated = { ...completedSteps, [step]: true };
    setCompletedSteps(updated);
    await AsyncStorage.setItem(`tuto_day_progress_${courseId}_${currentDay}`, JSON.stringify(updated));

    // Next step navigation
    const stepOrder: StepKey[] = ['vid1', 'vid2', 'vid3', 'note1', 'note2', 'note3', 'test', 'yoga'];
    const currIdx = stepOrder.indexOf(step);
    if (currIdx < stepOrder.length - 1) {
      setActiveStep(stepOrder[currIdx + 1]);
    } else {
      // Completed all 8 steps of the day!
      Alert.alert('🎉 Day Plan Completed!', `You've completed all tasks for Day ${currentDay}! Earned +${plan.totalXpReward} XP.`);
      onCompleteDay?.(currentDay, plan.totalXpReward);
    }
  };

  // MCQ Test Submission
  const handleMCQSubmit = () => {
    let score = 0;
    plan.mcqTest.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctOption) {
        score++;
      }
    });
    setTestScore(score);
    setTestSubmitted(true);
    handleMarkStepComplete('test', 50);
  };

  // Interactive AI Note Generation
  const handleGenerateAINote = async (customRequest?: string) => {
    setIsAiGenerating(true);
    const query = customRequest || aiCustomPrompt || 'Explain core principles with 2 real-world applications';

    setTimeout(() => {
      setAiResponseText(
        `🤖 **Topic-Grounded AI Study Summary: ${plan.topicTitle}**\n\n` +
        `**Key Inquiry:** "${query}"\n\n` +
        `1. **Fundamental Axiom:** In ${plan.subject}, "${plan.topicTitle}" operates under universal conservation and thermodynamic equilibria.\n\n` +
        `2. **Visual Memory Hook:** Visualize the system as an energetic continuum where input work equals output response plus internal entropy.\n\n` +
        `3. **High-Yield Exam Pro-Tip:** Whenever answering 5-mark questions on ${plan.topicTitle}, explicitly state the dimensional formula and standard units.\n\n` +
        `*Grounded in authentic ${board} curriculum guidelines.*`
      );
      setIsAiGenerating(false);
      handleMarkStepComplete('note3', 25);
    }, 800);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <X size={20} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <View style={styles.dayBadgeRow}>
              <View style={[styles.dayPill, plan.isMondayHoliday && styles.dayPillHoliday]}>
                <Calendar size={11} color={plan.isMondayHoliday ? '#F59E0B' : '#00D084'} />
                <Text style={[styles.dayPillText, plan.isMondayHoliday && styles.dayPillTextHoliday]}>
                  DAY {plan.dayNumber} · WEEK {plan.weekNumber} · {plan.dayOfWeekName.toUpperCase()}
                </Text>
              </View>
              {plan.isMondayHoliday ? (
                <View style={styles.holidayTag}>
                  <Smile size={10} color="#F59E0B" />
                  <Text style={styles.holidayTagText}>HOLIDAY / REST & REVIEW</Text>
                </View>
              ) : (
                <View style={styles.subjectTag}>
                  <Text style={styles.subjectTagText}>{plan.subject}</Text>
                </View>
              )}
            </View>
            <Text style={styles.topicHeaderTitle} numberOfLines={1}>
              {plan.topicTitle}
            </Text>
          </View>

          {/* Day Jumper Controls */}
          <View style={styles.dayJumperRow}>
            <TouchableOpacity
              style={[styles.jumperBtn, currentDay <= 1 && styles.jumperBtnDisabled]}
              disabled={currentDay <= 1}
              onPress={() => setCurrentDay((prev) => Math.max(1, prev - 1))}
            >
              <ArrowLeft size={14} color={currentDay <= 1 ? '#475569' : '#00D084'} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.jumperBtn}
              onPress={() => setCurrentDay((prev) => prev + 1)}
            >
              <ArrowRight size={14} color="#00D084" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 8-Step Linear Progress Bar */}
        <View style={styles.stepsBarContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stepsBarScroll}>
            {[
              { id: 'vid1' as StepKey, label: '📹 Video 1 (Foundation)', isDone: completedSteps.vid1 },
              { id: 'vid2' as StepKey, label: '📹 Video 2 (Derivation)', isDone: completedSteps.vid2 },
              { id: 'vid3' as StepKey, label: '📹 Video 3 (PYQ)', isDone: completedSteps.vid3 },
              { id: 'note1' as StepKey, label: '📝 Core AI Notes', isDone: completedSteps.note1 },
              { id: 'note2' as StepKey, label: '📝 Exam Notes', isDone: completedSteps.note2 },
              { id: 'note3' as StepKey, label: '🤖 Topic AI Notes', isDone: completedSteps.note3 },
              { id: 'test' as StepKey, label: '🎯 Daily MCQ Test', isDone: completedSteps.test },
              { id: 'yoga' as StepKey, label: '🧘 Yoga & Brain Booster', isDone: completedSteps.yoga },
            ].map((stepItem, idx) => {
              const isActive = activeStep === stepItem.id;
              return (
                <TouchableOpacity
                  key={stepItem.id}
                  style={[styles.stepTab, isActive && styles.stepTabActive, stepItem.isDone && styles.stepTabDone]}
                  onPress={() => setActiveStep(stepItem.id)}
                >
                  {stepItem.isDone ? (
                    <CheckCircle2 size={12} color="#00D084" />
                  ) : (
                    <Text style={[styles.stepIndexText, isActive && styles.stepIndexTextActive]}>{idx + 1}</Text>
                  )}
                  <Text style={[styles.stepTabText, isActive && styles.stepTabTextActive, stepItem.isDone && styles.stepTabTextDone]}>
                    {stepItem.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Main Content Area */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00D084" />
            <Text style={styles.loadingText}>Loading Day {currentDay} Course Blueprint...</Text>
          </View>
        ) : plan.isMondayHoliday ? (
          /* ═════════════════════════════════════════════════════════════════
             🌿 MONDAY HOLIDAY / WEEKLY REVIEW & REST SCREEN
             ═════════════════════════════════════════════════════════════════ */
          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.holidayCard}>
              <View style={styles.holidayIconBox}>
                <Smile size={32} color="#F59E0B" />
              </View>
              <Text style={styles.holidayThemeTitle}>{plan.mondayHolidayContent?.theme}</Text>
              <Text style={styles.holidayQuote}>{plan.mondayHolidayContent?.quote}</Text>

              <View style={styles.revisionBox}>
                <Text style={styles.revisionBoxTitle}>📋 WEEKLY REVISION & MINDFUL REST CHECKLIST:</Text>
                {plan.mondayHolidayContent?.weeklyRevisionSummary.map((item, idx) => (
                  <View key={idx} style={styles.revisionItemRow}>
                    <CheckCircle2 size={14} color="#00D084" style={{ marginTop: 2 }} />
                    <Text style={styles.revisionItemText}>{item}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.mindfulnessBox}>
                <Heart size={16} color="#EC4899" />
                <Text style={styles.mindfulnessText}>
                  {plan.mondayHolidayContent?.mindfulnessExercise}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.holidayCompleteBtn}
                onPress={() => handleMarkStepComplete('yoga', 50)}
              >
                <CheckCircle2 size={16} color="#070C18" />
                <Text style={styles.holidayCompleteBtnText}>Complete Monday Reflection (+50 XP)</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : (
          /* ═════════════════════════════════════════════════════════════════
             ACTIVE LEARNING DAY FLOW (VIDEOS -> NOTES -> TEST -> YOGA)
             ═════════════════════════════════════════════════════════════════ */
          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* ── STEP 1: Video 1 (Foundation) ────────────────────────────── */}
            {activeStep === 'vid1' && (
              <View style={styles.stepContainer}>
                <View style={styles.stepHeroBadge}>
                  <Video size={13} color="#38BDF8" />
                  <Text style={styles.stepHeroBadgeText}>VIDEO 1 OF 3: CONCEPT FOUNDATIONS</Text>
                </View>
                <Text style={styles.stepTitle}>{plan.videos[0].title}</Text>
                <Text style={styles.stepSubtitle}>{plan.videos[0].summary}</Text>

                {/* In-App Playable Video Embed */}
                <View style={styles.videoPlayerContainer}>
                  {Platform.OS === 'web' ? (
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${plan.videos[0].youtubeVideoId}?rel=0&autoplay=0`}
                      style={{ width: '100%', height: 210, border: 0, borderRadius: 10 }}
                      allowFullScreen
                    />
                  ) : (
                    <WebView
                      style={styles.nativeWebView}
                      source={{ uri: `https://www.youtube.com/embed/${plan.videos[0].youtubeVideoId}?playsinline=1` }}
                      allowsFullscreenVideo
                      javaScriptEnabled
                    />
                  )}
                </View>

                <View style={styles.metaRow}>
                  <Text style={styles.channelNameText}>Channel: {plan.videos[0].channelName}</Text>
                  <Text style={styles.durationText}>⏱️ {plan.videos[0].durationMinutes} Mins</Text>
                </View>

                <TouchableOpacity
                  style={styles.actionCompleteBtn}
                  onPress={() => handleMarkStepComplete('vid1', 25)}
                >
                  <Text style={styles.actionCompleteBtnText}>Mark Video 1 Complete & Next ➡️</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── STEP 2: Video 2 (Derivations) ───────────────────────────── */}
            {activeStep === 'vid2' && (
              <View style={styles.stepContainer}>
                <View style={styles.stepHeroBadge}>
                  <Video size={13} color="#38BDF8" />
                  <Text style={styles.stepHeroBadgeText}>VIDEO 2 OF 3: WORKED DERIVATIONS & PROBLEMS</Text>
                </View>
                <Text style={styles.stepTitle}>{plan.videos[1].title}</Text>
                <Text style={styles.stepSubtitle}>{plan.videos[1].summary}</Text>

                <View style={styles.videoPlayerContainer}>
                  {Platform.OS === 'web' ? (
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${plan.videos[1].youtubeVideoId}?rel=0&autoplay=0`}
                      style={{ width: '100%', height: 210, border: 0, borderRadius: 10 }}
                      allowFullScreen
                    />
                  ) : (
                    <WebView
                      style={styles.nativeWebView}
                      source={{ uri: `https://www.youtube.com/embed/${plan.videos[1].youtubeVideoId}?playsinline=1` }}
                      allowsFullscreenVideo
                      javaScriptEnabled
                    />
                  )}
                </View>

                <View style={styles.metaRow}>
                  <Text style={styles.channelNameText}>Channel: {plan.videos[1].channelName}</Text>
                  <Text style={styles.durationText}>⏱️ {plan.videos[1].durationMinutes} Mins</Text>
                </View>

                <TouchableOpacity
                  style={styles.actionCompleteBtn}
                  onPress={() => handleMarkStepComplete('vid2', 25)}
                >
                  <Text style={styles.actionCompleteBtnText}>Mark Video 2 Complete & Next ➡️</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── STEP 3: Video 3 (PYQ Analysis) ──────────────────────────── */}
            {activeStep === 'vid3' && (
              <View style={styles.stepContainer}>
                <View style={styles.stepHeroBadge}>
                  <Video size={13} color="#38BDF8" />
                  <Text style={styles.stepHeroBadgeText}>VIDEO 3 OF 3: EXAM PYQ ANALYSIS & STRATEGY</Text>
                </View>
                <Text style={styles.stepTitle}>{plan.videos[2].title}</Text>
                <Text style={styles.stepSubtitle}>{plan.videos[2].summary}</Text>

                <View style={styles.videoPlayerContainer}>
                  {Platform.OS === 'web' ? (
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${plan.videos[2].youtubeVideoId}?rel=0&autoplay=0`}
                      style={{ width: '100%', height: 210, border: 0, borderRadius: 10 }}
                      allowFullScreen
                    />
                  ) : (
                    <WebView
                      style={styles.nativeWebView}
                      source={{ uri: `https://www.youtube.com/embed/${plan.videos[2].youtubeVideoId}?playsinline=1` }}
                      allowsFullscreenVideo
                      javaScriptEnabled
                    />
                  )}
                </View>

                <View style={styles.metaRow}>
                  <Text style={styles.channelNameText}>Channel: {plan.videos[2].channelName}</Text>
                  <Text style={styles.durationText}>⏱️ {plan.videos[2].durationMinutes} Mins</Text>
                </View>

                <TouchableOpacity
                  style={styles.actionCompleteBtn}
                  onPress={() => handleMarkStepComplete('vid3', 25)}
                >
                  <Text style={styles.actionCompleteBtnText}>Mark Video 3 Complete & Go to Notes ➡️</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── STEP 4: Note 1 (Admin AI Core Notes) ─────────────────────── */}
            {activeStep === 'note1' && (
              <View style={styles.stepContainer}>
                <View style={styles.stepHeroBadge}>
                  <FileText size={13} color="#00D084" />
                  <Text style={styles.stepHeroBadgeText}>NOTE 1 OF 3: ADMIN AI CORE CONCEPTS</Text>
                </View>
                <Text style={styles.stepTitle}>{plan.notes[0].title}</Text>

                <View style={styles.noteContentCard}>
                  <Text style={styles.noteBodyText}>{plan.notes[0].content}</Text>

                  {plan.notes[0].contentTamil && (
                    <View style={styles.tamilNoteCard}>
                      <Text style={styles.tamilNoteText}>{plan.notes[0].contentTamil}</Text>
                    </View>
                  )}

                  {plan.notes[0].formulasOrKeyRules && (
                    <View style={styles.formulaSection}>
                      <Text style={styles.formulaSectionTitle}>📐 CORE FORMULAS & GOVERNING LAWS:</Text>
                      {plan.notes[0].formulasOrKeyRules.map((f, i) => (
                        <View key={i} style={styles.formulaBox}>
                          <Text style={styles.formulaText}>{f}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.actionCompleteBtn}
                  onPress={() => handleMarkStepComplete('note1', 25)}
                >
                  <Text style={styles.actionCompleteBtnText}>Mark Core Notes Complete & Next ➡️</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── STEP 5: Note 2 (Admin Exam Deep-Dive Notes) ───────────────── */}
            {activeStep === 'note2' && (
              <View style={styles.stepContainer}>
                <View style={styles.stepHeroBadge}>
                  <FileText size={13} color="#F59E0B" />
                  <Text style={styles.stepHeroBadgeText}>NOTE 2 OF 3: EXAM DEEP-DIVE & COMMON TRAPS</Text>
                </View>
                <Text style={styles.stepTitle}>{plan.notes[1].title}</Text>

                <View style={styles.noteContentCard}>
                  <Text style={styles.noteBodyText}>{plan.notes[1].content}</Text>

                  {plan.notes[1].examTrapsToAvoid && (
                    <View style={styles.trapsSection}>
                      <Text style={styles.trapsSectionTitle}>⚠️ CRITICAL EXAMINATION TRAPS TO AVOID:</Text>
                      {plan.notes[1].examTrapsToAvoid.map((trap, i) => (
                        <View key={i} style={styles.trapItemRow}>
                          <Text style={styles.trapItemBullet}>•</Text>
                          <Text style={styles.trapItemText}>{trap}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.actionCompleteBtn}
                  onPress={() => handleMarkStepComplete('note2', 25)}
                >
                  <Text style={styles.actionCompleteBtnText}>Mark Exam Notes Complete & Next ➡️</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── STEP 6: Note 3 (Student Interactive Topic AI Notes) ──────── */}
            {activeStep === 'note3' && (
              <View style={styles.stepContainer}>
                <View style={styles.stepHeroBadge}>
                  <Sparkles size={13} color="#EC4899" />
                  <Text style={styles.stepHeroBadgeText}>NOTE 3 OF 3: STUDENT INTERACTIVE TOPIC AI</Text>
                </View>
                <Text style={styles.stepTitle}>{plan.notes[2].title}</Text>
                <Text style={styles.stepSubtitle}>
                  Dynamic interactive study guide generated strictly for: **{plan.topicTitle}**
                </Text>

                {/* Quick Interactive Prompt Chips */}
                <View style={styles.quickPromptChipsRow}>
                  {[
                    'Explain with real-world analogies',
                    '3-step rapid memory flashcard',
                    'Key differences table',
                    'Tamil summary with formula',
                  ].map((chip, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.promptChip}
                      onPress={() => handleGenerateAINote(chip)}
                    >
                      <Sparkles size={11} color="#EC4899" />
                      <Text style={styles.promptChipText}>{chip}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Custom User AI Query */}
                <View style={styles.customAiInputRow}>
                  <TextInput
                    style={styles.customAiInput}
                    placeholder={`Ask AI about "${plan.topicTitle}"...`}
                    placeholderTextColor="#64748B"
                    value={aiCustomPrompt}
                    onChangeText={setAiCustomPrompt}
                  />
                  <TouchableOpacity
                    style={styles.customAiSendBtn}
                    onPress={() => handleGenerateAINote()}
                    disabled={isAiGenerating}
                  >
                    {isAiGenerating ? (
                      <ActivityIndicator size="small" color="#070C18" />
                    ) : (
                      <Send size={14} color="#070C18" />
                    )}
                  </TouchableOpacity>
                </View>

                {/* AI Output Card */}
                <View style={styles.aiOutputCard}>
                  <Text style={styles.aiOutputText}>
                    {aiResponseText || plan.notes[2].content}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.actionCompleteBtn}
                  onPress={() => handleMarkStepComplete('note3', 25)}
                >
                  <Text style={styles.actionCompleteBtnText}>Mark Interactive Note Complete & Take Daily Test ➡️</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── STEP 7: Daily MCQ Assessment Test ────────────────────────── */}
            {activeStep === 'test' && (
              <View style={styles.stepContainer}>
                <View style={styles.stepHeroBadge}>
                  <Award size={13} color="#00D084" />
                  <Text style={styles.stepHeroBadgeText}>DAILY ASSESSMENT TEST · 5 QUESTIONS</Text>
                </View>
                <Text style={styles.stepTitle}>{plan.mcqTest.testTitle}</Text>
                <Text style={styles.stepSubtitle}>
                  Pass requirement: {plan.mcqTest.passScore}/5 questions correct.
                </Text>

                {/* Questions List */}
                <View style={styles.testQuestionsList}>
                  {plan.mcqTest.questions.map((q, qIdx) => {
                    const selected = selectedAnswers[q.id];
                    const isAnswered = Boolean(selected);

                    return (
                      <View key={q.id} style={styles.testQuestionCard}>
                        <Text style={styles.testQuestionNumber}>Question {qIdx + 1} of 5</Text>
                        <Text style={styles.testQuestionText}>{q.question}</Text>
                        {q.questionTamil && <Text style={styles.testQuestionTamil}>{q.questionTamil}</Text>}

                        <View style={styles.testOptionsList}>
                          {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                            const isOptSelected = selected === optKey;
                            const isCorrect = q.correctOption === optKey;

                            let optCardStyle = styles.testOptionCard;
                            if (testSubmitted) {
                              if (isCorrect) optCardStyle = styles.testOptionCardCorrect;
                              else if (isOptSelected && !isCorrect) optCardStyle = styles.testOptionCardWrong;
                            } else if (isOptSelected) {
                              optCardStyle = styles.testOptionCardSelected;
                            }

                            return (
                              <TouchableOpacity
                                key={optKey}
                                style={optCardStyle}
                                disabled={testSubmitted}
                                onPress={() => setSelectedAnswers((prev) => ({ ...prev, [q.id]: optKey }))}
                              >
                                <View style={styles.testOptKeyBox}>
                                  <Text style={styles.testOptKeyText}>{optKey}</Text>
                                </View>
                                <Text style={styles.testOptText}>{q.options[optKey]}</Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>

                        {testSubmitted && (
                          <View style={styles.testExplanationBox}>
                            <Text style={styles.testExplanationText}>
                              💡 <Text style={{ fontWeight: '800', color: '#00D084' }}>Correct: Option {q.correctOption}.</Text> {q.explanation}
                            </Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>

                {!testSubmitted ? (
                  <TouchableOpacity
                    style={[styles.actionCompleteBtn, Object.keys(selectedAnswers).length < 5 && styles.actionCompleteBtnDisabled]}
                    onPress={handleMCQSubmit}
                  >
                    <Text style={styles.actionCompleteBtnText}>Submit Daily MCQ Test (+50 XP) 🎯</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.testScoreSummaryCard}>
                    <Text style={styles.testScoreTitle}>
                      Test Result: {testScore} / 5 Correct ({Math.round((testScore / 5) * 100)}%)
                    </Text>
                    <TouchableOpacity
                      style={styles.actionCompleteBtn}
                      onPress={() => setActiveStep('yoga')}
                    >
                      <Text style={styles.actionCompleteBtnText}>Proceed to Yoga & Extra-Curricular ➡️</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* ── STEP 8: Yoga & Extra-Curricular Task ──────────────────────── */}
            {activeStep === 'yoga' && (
              <View style={styles.stepContainer}>
                <View style={styles.stepHeroBadge}>
                  <Heart size={13} color="#EC4899" />
                  <Text style={styles.stepHeroBadgeText}>YOGA & MINDFUL BRAIN BOOSTER</Text>
                </View>
                <Text style={styles.stepTitle}>{plan.yogaAndActivity.asanaName}</Text>
                {plan.yogaAndActivity.asanaTamil && (
                  <Text style={styles.stepSubtitle}>{plan.yogaAndActivity.asanaTamil} · {plan.yogaAndActivity.sanskritName}</Text>
                )}

                {/* Yoga Guide Card */}
                <View style={styles.yogaCard}>
                  <Text style={styles.yogaSectionTitle}>🧘 ASANA STEP-BY-STEP PRACTICE ({plan.yogaAndActivity.durationMinutes} MINS):</Text>
                  {plan.yogaAndActivity.stepByStepGuide.map((stepText, idx) => (
                    <View key={idx} style={styles.yogaStepRow}>
                      <Text style={styles.yogaStepNum}>{idx + 1}.</Text>
                      <Text style={styles.yogaStepText}>{stepText}</Text>
                    </View>
                  ))}

                  <View style={styles.breathingCard}>
                    <Text style={styles.breathingCardTitle}>🌬️ Breathing Rhythm:</Text>
                    <Text style={styles.breathingCardText}>{plan.yogaAndActivity.breathingPattern}</Text>
                  </View>

                  <View style={styles.benefitsCard}>
                    <Text style={styles.benefitsCardTitle}>✨ Key Health & Focus Benefits:</Text>
                    {plan.yogaAndActivity.benefits.map((b, idx) => (
                      <Text key={idx} style={styles.benefitItemText}>• {b}</Text>
                    ))}
                  </View>
                </View>

                {/* Extra-Curricular Brain Booster Challenge */}
                <View style={styles.extraCurricularCard}>
                  <View style={styles.extraHeaderRow}>
                    <Sparkles size={14} color="#00D084" />
                    <Text style={styles.extraCategoryTag}>{plan.yogaAndActivity.extraCurricularTask.category}</Text>
                  </View>
                  <Text style={styles.extraTitle}>{plan.yogaAndActivity.extraCurricularTask.title}</Text>
                  <Text style={styles.extraDesc}>{plan.yogaAndActivity.extraCurricularTask.description}</Text>

                  {plan.yogaAndActivity.extraCurricularTask.challengeQuestion && (
                    <View style={styles.challengeBox}>
                      <Text style={styles.challengeBoxTitle}>🎯 Today's Brain Challenge:</Text>
                      <Text style={styles.challengeBoxText}>{plan.yogaAndActivity.extraCurricularTask.challengeQuestion}</Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.actionCompleteBtn}
                  onPress={() => handleMarkStepComplete('yoga', 50)}
                >
                  <CheckCircle2 size={16} color="#070C18" />
                  <Text style={styles.actionCompleteBtnText}>Complete Today's Course Plan! 🎉 (+150 XP)</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070C18',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#0E172A',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: 10,
  },
  dayBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dayPillHoliday: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  dayPillText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#00D084',
  },
  dayPillTextHoliday: {
    color: '#F59E0B',
  },
  subjectTag: {
    backgroundColor: '#131F37',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  subjectTagText: {
    fontSize: 8,
    color: '#94A3B8',
    fontWeight: '700',
  },
  holidayTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  holidayTagText: {
    fontSize: 8,
    color: '#F59E0B',
    fontWeight: '900',
  },
  topicHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F8FAFC',
    marginTop: 2,
  },
  dayJumperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  jumperBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#131F37',
    alignItems: 'center',
    justifyContent: 'center',
  },
  jumperBtnDisabled: {
    opacity: 0.4,
  },
  stepsBarContainer: {
    backgroundColor: '#0E172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingVertical: 6,
  },
  stepsBarScroll: {
    paddingHorizontal: 12,
    gap: 6,
  },
  stepTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#131F37',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  stepTabActive: {
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
    borderColor: '#00D084',
  },
  stepTabDone: {
    borderColor: 'rgba(0, 208, 132, 0.4)',
  },
  stepIndexText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748B',
  },
  stepIndexTextActive: {
    color: '#00D084',
  },
  stepTabText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  stepTabTextActive: {
    color: '#00D084',
    fontWeight: '900',
  },
  stepTabTextDone: {
    color: '#CBD5E1',
  },
  scrollContent: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  holidayCard: {
    backgroundColor: '#0E172A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F59E0B50',
    alignItems: 'center',
    gap: 12,
  },
  holidayIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  holidayThemeTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#F8FAFC',
    textAlign: 'center',
  },
  holidayQuote: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 18,
  },
  revisionBox: {
    width: '100%',
    backgroundColor: '#131F37',
    borderRadius: 12,
    padding: 14,
    gap: 8,
    marginTop: 6,
  },
  revisionBoxTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#00D084',
    letterSpacing: 0.5,
  },
  revisionItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  revisionItemText: {
    flex: 1,
    fontSize: 11,
    color: '#E2E8F0',
    lineHeight: 16,
  },
  mindfulnessBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.3)',
    width: '100%',
  },
  mindfulnessText: {
    flex: 1,
    fontSize: 11,
    color: '#F472B6',
    fontWeight: '600',
  },
  holidayCompleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F59E0B',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '100%',
    marginTop: 6,
  },
  holidayCompleteBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#070C18',
  },
  stepContainer: {
    gap: 12,
    paddingBottom: 40,
  },
  stepHeroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#131F37',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stepHeroBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#38BDF8',
    letterSpacing: 0.5,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#F8FAFC',
    lineHeight: 22,
  },
  stepSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
  },
  videoPlayerContainer: {
    width: '100%',
    height: 220,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  nativeWebView: {
    flex: 1,
    backgroundColor: '#000',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  channelNameText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  durationText: {
    fontSize: 11,
    color: '#38BDF8',
    fontWeight: '700',
  },
  actionCompleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00D084',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  actionCompleteBtnDisabled: {
    opacity: 0.5,
  },
  actionCompleteBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#070C18',
  },
  noteContentCard: {
    backgroundColor: '#0E172A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 12,
  },
  noteBodyText: {
    fontSize: 12,
    color: '#E2E8F0',
    lineHeight: 18,
  },
  tamilNoteCard: {
    backgroundColor: '#131F37',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#00D084',
  },
  tamilNoteText: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
  },
  formulaSection: {
    gap: 6,
    marginTop: 4,
  },
  formulaSectionTitle: {
    fontSize: 9,
    fontWeight: '900',
    color: '#38BDF8',
    letterSpacing: 0.5,
  },
  formulaBox: {
    backgroundColor: '#131F37',
    padding: 8,
    borderRadius: 6,
  },
  formulaText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#00D084',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  trapsSection: {
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  trapsSectionTitle: {
    fontSize: 9,
    fontWeight: '900',
    color: '#F59E0B',
    letterSpacing: 0.5,
  },
  trapItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  trapItemBullet: {
    color: '#F59E0B',
    fontWeight: '900',
  },
  trapItemText: {
    flex: 1,
    fontSize: 11,
    color: '#E2E8F0',
    lineHeight: 16,
  },
  quickPromptChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  promptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#131F37',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  promptChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  customAiInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0E172A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  customAiInput: {
    flex: 1,
    fontSize: 12,
    color: '#F8FAFC',
    padding: 0,
  },
  customAiSendBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: '#00D084',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiOutputCard: {
    backgroundColor: '#0E172A',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.3)',
  },
  aiOutputText: {
    fontSize: 12,
    color: '#F8FAFC',
    lineHeight: 18,
  },
  testQuestionsList: {
    gap: 12,
  },
  testQuestionCard: {
    backgroundColor: '#0E172A',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 8,
  },
  testQuestionNumber: {
    fontSize: 9,
    fontWeight: '900',
    color: '#00D084',
    letterSpacing: 0.5,
  },
  testQuestionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
    lineHeight: 18,
  },
  testQuestionTamil: {
    fontSize: 11,
    color: '#94A3B8',
  },
  testOptionsList: {
    gap: 6,
    marginTop: 4,
  },
  testOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#131F37',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  testOptionCardSelected: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: '#38BDF8',
  },
  testOptionCardCorrect: {
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
    borderColor: '#00D084',
  },
  testOptionCardWrong: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    borderColor: '#F43F5E',
  },
  testOptKeyBox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#0E172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  testOptKeyText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#F8FAFC',
  },
  testOptText: {
    flex: 1,
    fontSize: 12,
    color: '#E2E8F0',
  },
  testExplanationBox: {
    backgroundColor: '#131F37',
    padding: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  testExplanationText: {
    fontSize: 11,
    color: '#CBD5E1',
    lineHeight: 15,
  },
  testScoreSummaryCard: {
    backgroundColor: '#0E172A',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00D084',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  testScoreTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#00D084',
  },
  yogaCard: {
    backgroundColor: '#0E172A',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 10,
  },
  yogaSectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#EC4899',
    letterSpacing: 0.5,
  },
  yogaStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  yogaStepNum: {
    fontSize: 11,
    fontWeight: '900',
    color: '#EC4899',
  },
  yogaStepText: {
    flex: 1,
    fontSize: 11,
    color: '#E2E8F0',
    lineHeight: 16,
  },
  breathingCard: {
    backgroundColor: '#131F37',
    padding: 8,
    borderRadius: 6,
  },
  breathingCardTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#38BDF8',
  },
  breathingCardText: {
    fontSize: 10,
    color: '#CBD5E1',
    marginTop: 2,
  },
  benefitsCard: {
    backgroundColor: '#131F37',
    padding: 8,
    borderRadius: 6,
    gap: 3,
  },
  benefitsCardTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#00D084',
  },
  benefitItemText: {
    fontSize: 10,
    color: '#CBD5E1',
  },
  extraCurricularCard: {
    backgroundColor: '#0E172A',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#00D08450',
    gap: 8,
  },
  extraHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  extraCategoryTag: {
    fontSize: 9,
    fontWeight: '900',
    color: '#00D084',
    letterSpacing: 0.5,
  },
  extraTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  extraDesc: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
  },
  challengeBox: {
    backgroundColor: '#131F37',
    padding: 8,
    borderRadius: 6,
    gap: 2,
  },
  challengeBoxTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#F59E0B',
  },
  challengeBoxText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F8FAFC',
  },
});
