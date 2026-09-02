import React, { useState, useEffect, useMemo } from 'react';
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
  HardDrive,
  UploadCloud,
  ShieldCheck,
  Target,
  Lock,
} from 'lucide-react-native';

import {
  WholeYearDayPlan,
  resolveWholeYearDayPlan,
  getAdminCustomDayPlan,
  isDayUnlocked,
  toggleDayCompletion,
} from '../../data/curriculum/wholeYearDayPlanEngine';
import {
  GoogleSheetsDayPlanService,
  GoogleSheetDayPlanItem,
  DEFAULT_ICLE_GUIDANCE_VIDEO,
} from '../../services/GoogleSheetsDayPlanService';
import { ImmersiveVideoPlayer } from './ImmersiveVideoPlayer';
import { TaskVideoFeedbackModal } from './TaskVideoFeedbackModal';

const { width } = Dimensions.get('window');

interface TutODayCoursePlayerModalProps {
  visible: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
  initialDay?: number;
  dayNumber?: number;
  dayPlan?: any;
  board?: string;
  schoolBoard?: string;
  onCompleteDay?: (dayNumber: number, earnedXp?: number) => void;
}

export type StepKey =
  | 'guidance'
  | 'tamil'
  | 'english'
  | 'maths'
  | 'science'
  | 'social'
  | 'lifeskill'
  | 'homework'
  | 'yoga'
  | 'currentaffairs'
  | 'test'
  | 'drive_feedback';

export const TutODayCoursePlayerModal: React.FC<TutODayCoursePlayerModalProps> = ({
  visible,
  onClose,
  courseId,
  courseTitle,
  initialDay = 1,
  dayNumber,
  dayPlan,
  board = 'TNSB',
  schoolBoard,
  onCompleteDay,
}) => {
  const insets = useSafeAreaInsets();
  const activeBoard = schoolBoard || board;
  const [currentDay, setCurrentDay] = useState<number>(dayNumber || initialDay);
  const [activeStep, setActiveStep] = useState<StepKey>('guidance');
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [dayPlanData, setDayPlanData] = useState<WholeYearDayPlan | null>(null);
  const [sheetPlan, setSheetPlan] = useState<GoogleSheetDayPlanItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Daily MCQ Test State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [testSubmitted, setTestSubmitted] = useState<boolean>(false);
  const [testScore, setTestScore] = useState<number>(0);

  // Google Drive Task Video Recording State
  const [isVideoFeedbackOpen, setIsVideoFeedbackOpen] = useState<boolean>(false);

  const stepOrder: StepKey[] = [
    'guidance', 'tamil', 'english', 'maths', 'science', 'social',
    'lifeskill', 'homework', 'yoga', 'currentaffairs', 'test', 'drive_feedback',
  ];

  const isStepUnlocked = (stepKey: StepKey): boolean => {
    const idx = stepOrder.indexOf(stepKey);
    if (idx === 0) return true;
    return !!completedSteps[stepOrder[idx - 1]];
  };

  const getFirstIncompleteStep = (completed: Record<string, boolean>): StepKey => {
    for (const step of stepOrder) {
      if (!completed[step]) return step;
    }
    return stepOrder[stepOrder.length - 1];
  };

  // Load and resolve day plan
  useEffect(() => {
    if (!visible) return;

    let isMounted = true;
    async function loadDay() {
      setIsLoading(true);
      try {
        // 1. Check for Google Sheet synced day plans
        const sheet = await GoogleSheetsDayPlanService.getDayPlan(courseId, currentDay);
        if (isMounted) setSheetPlan(sheet);

        // 2. Check for admin custom overrides
        const custom = await getAdminCustomDayPlan(courseId, currentDay);
        if (custom && isMounted) {
          setDayPlanData(custom);
        } else {
          // 3. Resolve default authentic syllabus plan
          const resolved = resolveWholeYearDayPlan(courseId, courseTitle, currentDay, board);
          if (isMounted) setDayPlanData(resolved);
        }

        // Load progress for current day
        const progressRaw = await AsyncStorage.getItem(`tuto_day_progress_${courseId}_${currentDay}`);
        if (progressRaw && isMounted) {
          const parsed = JSON.parse(progressRaw);
          setCompletedSteps(parsed);
          setActiveStep(getFirstIncompleteStep(parsed));
        } else if (isMounted) {
          setCompletedSteps({});
          setActiveStep('guidance');
        }

        // Reset test state for new day
        setSelectedAnswers({});
        setTestSubmitted(false);
        setTestScore(0);
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

  // Fallback day plan data
  const plan = dayPlanData || resolveWholeYearDayPlan(courseId, courseTitle, currentDay, board);

  // Active micro-tasks (from Google Sheet or fallback)
  const guidanceVid = sheetPlan?.officialGuidanceVideo || {
    title: `Day ${currentDay}: Official Rule & Guidance — ICLE Technology`,
    youtubeVideoId: plan.videos[0]?.youtubeVideoId || DEFAULT_ICLE_GUIDANCE_VIDEO.youtubeVideoId,
    channelName: 'ICLE Technology Official',
    summary: 'Daily official guidelines, discipline rules, and micro-learning targets for all scholars.',
    durationMinutes: 10,
  };

  const tamilTask = sheetPlan?.tamilTask || {
    title: `Day ${currentDay} தமிழ்: ${plan.topicTamilTitle || plan.topicTitle}`,
    topic: plan.topicTamilTitle || plan.topicTitle,
    youtubeVideoId: plan.videos[0]?.youtubeVideoId || 'dQw4w9WgXcQ',
    channelName: 'SuprO Tamil Masterclass',
    summary: plan.notes[0]?.contentTamil || 'இன்றைய தமிழ் இலக்கணம், பாடல் கருத்து மற்றும் உரைநடை விளக்கம்.',
    durationMinutes: 15,
  };

  const englishTask = sheetPlan?.englishTask || {
    title: `Day ${currentDay} English: ${plan.topicTitle} & Grammar`,
    topic: `${plan.topicTitle} & Applied Grammar`,
    youtubeVideoId: plan.videos[1]?.youtubeVideoId || 'dQw4w9WgXcQ',
    channelName: 'SuprO English Academy',
    summary: 'Master core vocabulary, sentence structuring and English comprehension rules.',
    durationMinutes: 15,
  };

  const mathsTask = sheetPlan?.mathsTask || {
    title: `Day ${currentDay} Mathematics: Problem Solving & Formulas`,
    topic: `${plan.subject}: ${plan.chapterTitle}`,
    youtubeVideoId: plan.videos[1]?.youtubeVideoId || 'dQw4w9WgXcQ',
    channelName: 'SuprO Maths Lab',
    summary: plan.notes[0]?.formulasOrKeyRules?.[0] || 'Core theorem derivation and step-by-step problem workout.',
    durationMinutes: 20,
  };

  const scienceTask = sheetPlan?.scienceTask || {
    title: `Day ${currentDay} Science: Experimental Laws & Key Diagrams`,
    topic: plan.topicTitle,
    youtubeVideoId: plan.videos[2]?.youtubeVideoId || 'dQw4w9WgXcQ',
    channelName: 'SuprO Science Discovery',
    summary: plan.notes[1]?.content || 'Scientific observations, molecular principles, and physical derivations.',
    durationMinutes: 20,
  };

  const socialScienceTask = sheetPlan?.socialScienceTask || {
    title: `Day ${currentDay} Social Science & Civic Governance`,
    topic: 'Indian Constitution, History Timeline & World Geography',
    youtubeVideoId: plan.videos[0]?.youtubeVideoId || 'dQw4w9WgXcQ',
    channelName: 'SuprO Civics & History',
    summary: 'Historical context, constitutional rights, and geographic mapping.',
    durationMinutes: 15,
  };

  const lifeSkillTask = sheetPlan?.lifeSkillTask || {
    title: 'Daily Practical Wisdom & Ethical Leadership',
    description: 'Developing proactive focus, time blocking, emotional resilience, and integrity.',
    actionPrompt: 'Write down 2 actionable steps you will take today to practice proactive discipline.',
  };

  const homeworkTask = sheetPlan?.homeworkTask || {
    title: `Day ${currentDay} Self-Study Homework & Practice Questions`,
    description: 'Solve the textbook questions for today and write a short summary.',
    questions: [
      `1. Explain the fundamental concept of ${plan.topicTitle}.`,
      `2. Work out 2 practice problems related to ${plan.chapterTitle}.`,
      `3. Write 3 key vocabulary or formula takeaways from today's lectures.`,
    ],
  };

  const exerciseYoga = sheetPlan?.exercisePhysicVideo || {
    title: `Daily Physical Fitness & ${plan.yogaAndActivity.asanaName}`,
    youtubeVideoId: 'dQw4w9WgXcQ',
    asanaOrWorkout: plan.yogaAndActivity.asanaName,
    benefits: plan.yogaAndActivity.benefits,
    durationMinutes: 10,
  };

  const currentAffairs = sheetPlan?.currentAffairsGkVideo || {
    title: 'Daily Current Affairs & All-India General Knowledge',
    youtubeVideoId: 'dQw4w9WgXcQ',
    keyPoints: [
      'National & Tamil Nadu Key Governance Milestones',
      'Science, Space (ISRO) & Defense Breakthroughs',
      'Supreme Court Precedents & Civics Updates',
    ],
    durationMinutes: 10,
  };

  // Mark a specific step complete
  const handleMarkStepComplete = async (step: StepKey, xpEarned: number = 25) => {
    const updated = { ...completedSteps, [step]: true };
    setCompletedSteps(updated);
    try {
      await AsyncStorage.setItem(`tuto_day_progress_${courseId}_${currentDay}`, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save step progress:', e);
    }

    // Auto advance to next step
    const stepOrder: StepKey[] = [
      'guidance',
      'tamil',
      'english',
      'maths',
      'science',
      'social',
      'lifeskill',
      'homework',
      'yoga',
      'currentaffairs',
      'test',
      'drive_feedback',
    ];
    const currentIndex = stepOrder.indexOf(step);
    if (currentIndex < stepOrder.length - 1) {
      setActiveStep(stepOrder[currentIndex + 1]);
    }
  };

  // Submit Daily MCQ Assessment
  const handleTestOptionSelect = (qId: string, opt: 'A' | 'B' | 'C' | 'D') => {
    if (testSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: opt }));
  };

  const handleSubmitDailyTest = async () => {
    const questions = plan.mcqTest.questions;
    let score = 0;
    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctOption) {
        score++;
      }
    });

    setTestScore(score);
    setTestSubmitted(true);
    await handleMarkStepComplete('test', score * 20);

    Alert.alert(
      score >= 3 ? '🎉 Excellent Performance!' : '📚 Good Attempt!',
      `You scored ${score} / ${questions.length} on today's CBT assessment. +${score * 20} XP Earned!`,
      [{ text: 'Continue to Drive Video Feedback', onPress: () => setActiveStep('drive_feedback') }]
    );
  };

  // Finish whole day
  const handleCompleteWholeDay = async () => {
    const allComplete = stepOrder.every((s) => completedSteps[s]);
    if (!allComplete) {
      Alert.alert('Incomplete Day', 'Please complete all tasks in the day to proceed.');
      return;
    }

    await toggleDayCompletion(courseId, currentDay);
    if (onCompleteDay) {
      onCompleteDay(currentDay, 150);
    }
    Alert.alert('🌟 Day Complete!', `Congratulations on finishing Day ${currentDay} micro-learning targets!`);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={[styles.modalRoot, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        {/* ─── 1. TOP APP BAR ────────────────────────────────────────── */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.closeBtn} activeOpacity={0.8} onPress={onClose}>
            <X size={20} color="#CBD5E1" />
          </TouchableOpacity>

          <View style={styles.topBarCenter}>
            <View style={styles.dayBadgeRow}>
              <View style={styles.dayBadge}>
                <Text style={styles.dayBadgeText}>DAY {currentDay} OF 200</Text>
              </View>
              {sheetPlan && (
                <View style={styles.sheetBadge}>
                  <Sparkles size={9} color="#00D084" />
                  <Text style={styles.sheetBadgeText}>Google Sheet Live</Text>
                </View>
              )}
            </View>
            <Text style={styles.topBarCourseTitle} numberOfLines={1}>
              {courseTitle}
            </Text>
          </View>

          {/* Quick Actions: Drive Record & Day Jumpers */}
          <View style={styles.topBarRight}>
            <TouchableOpacity
              style={styles.driveRecordPill}
              activeOpacity={0.8}
              onPress={() => setIsVideoFeedbackOpen(true)}
            >
              <Video size={13} color="#38BDF8" />
              <Text style={styles.driveRecordPillText}>Record</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.jumperBtn, currentDay <= 1 && styles.jumperBtnDisabled]}
              disabled={currentDay <= 1}
              onPress={() => setCurrentDay((prev) => Math.max(1, prev - 1))}
            >
              <ArrowLeft size={13} color={currentDay <= 1 ? '#475569' : '#00D084'} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.jumperBtn} 
              onPress={async () => {
                const unlocked = await isDayUnlocked(courseId, currentDay + 1);
                if (unlocked) {
                  setCurrentDay((prev) => prev + 1);
                } else {
                  Alert.alert('Locked', `Complete Day ${currentDay} to unlock Day ${currentDay + 1}.`);
                }
              }}
            >
              <ArrowRight size={13} color="#00D084" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── 2. 12-STEP MULTI-SUBJECT MICRO-LEARNING BAR ───────────── */}
        <View style={styles.stepsBarContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stepsBarScroll}>
            {[
              { id: 'guidance' as StepKey, label: '🏛️ ICLE Guidance', isDone: completedSteps.guidance },
              { id: 'tamil' as StepKey, label: '📖 தமிழ் பாடம்', isDone: completedSteps.tamil },
              { id: 'english' as StepKey, label: '🔤 English Masterclass', isDone: completedSteps.english },
              { id: 'maths' as StepKey, label: '📐 Maths Lab', isDone: completedSteps.maths },
              { id: 'science' as StepKey, label: '🔬 Science Practical', isDone: completedSteps.science },
              { id: 'social' as StepKey, label: '🌍 Social Science', isDone: completedSteps.social },
              { id: 'lifeskill' as StepKey, label: '💡 Life Skills', isDone: completedSteps.lifeskill },
              { id: 'homework' as StepKey, label: '✍️ Daily Homework', isDone: completedSteps.homework },
              { id: 'yoga' as StepKey, label: '🧘 Fitness & Yoga', isDone: completedSteps.yoga },
              { id: 'currentaffairs' as StepKey, label: '📰 Current Affairs', isDone: completedSteps.currentaffairs },
              { id: 'test' as StepKey, label: '🎯 CBT Test', isDone: completedSteps.test },
              { id: 'drive_feedback' as StepKey, label: '📹 Drive Video Upload', isDone: completedSteps.drive_feedback },
            ].map((stepItem, idx) => {
              const isActive = activeStep === stepItem.id;
              const unlocked = isStepUnlocked(stepItem.id);

              return (
                <TouchableOpacity
                  key={stepItem.id}
                  style={[
                    styles.stepTab, 
                    isActive && styles.stepTabActive, 
                    stepItem.isDone && styles.stepTabDone,
                    !unlocked && { opacity: 0.5 }
                  ]}
                  disabled={!unlocked}
                  onPress={() => setActiveStep(stepItem.id)}
                >
                  {!unlocked ? (
                    <Lock size={12} color="#64748B" />
                  ) : stepItem.isDone ? (
                    <CheckCircle2 size={12} color="#00D084" />
                  ) : (
                    <Text style={[styles.stepIndexText, isActive && styles.stepIndexTextActive]}>{idx + 1}</Text>
                  )}
                  <Text
                    style={[
                      styles.stepTabText,
                      isActive && styles.stepTabTextActive,
                      stepItem.isDone && styles.stepTabTextDone,
                    ]}
                  >
                    {stepItem.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ─── 3. MAIN CONTENT AREA ──────────────────────────────────── */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00D084" />
            <Text style={styles.loadingText}>Loading Day {currentDay} Curriculum Deck...</Text>
          </View>
        ) : (
          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* ── STEP 1: Official Rule & Guidance Video (ICLE Technology) ── */}
            {activeStep === 'guidance' && (
              <View style={styles.stepSection}>
                <View style={styles.stepHeaderCard}>
                  <View style={styles.stepBadge}>
                    <ShieldCheck size={12} color="#00D084" />
                    <Text style={styles.stepBadgeText}>TASK 1: OFFICIAL RULE & GUIDANCE</Text>
                  </View>
                  <Text style={styles.stepHeading}>{guidanceVid.title}</Text>
                  <Text style={styles.stepSub}>{guidanceVid.summary}</Text>
                </View>

                <ImmersiveVideoPlayer
                  videoId={guidanceVid.youtubeVideoId}
                  title={guidanceVid.title}
                  channelName="ICLE Technology Official"
                  summary={guidanceVid.summary}
                  durationMinutes={guidanceVid.durationMinutes}
                  isCompleted={completedSteps.guidance}
                  onMarkComplete={() => handleMarkStepComplete('guidance', 30)}
                  xpReward={30}
                />
              </View>
            )}

            {/* ── STEP 2: Tamil Daily Concept & Video ── */}
            {activeStep === 'tamil' && (
              <View style={styles.stepSection}>
                <View style={styles.stepHeaderCard}>
                  <View style={styles.stepBadge}>
                    <BookOpen size={12} color="#EC4899" />
                    <Text style={[styles.stepBadgeText, { color: '#EC4899' }]}>TASK 2: தமிழ் பாடப் பிரிவு</Text>
                  </View>
                  <Text style={styles.stepHeading}>{tamilTask.title}</Text>
                  <Text style={styles.stepSub}>{tamilTask.summary}</Text>
                </View>

                <ImmersiveVideoPlayer
                  videoId={tamilTask.youtubeVideoId || 'dQw4w9WgXcQ'}
                  title={tamilTask.title}
                  channelName={tamilTask.channelName || 'SuprO Tamil Masterclass'}
                  summary={tamilTask.summary}
                  durationMinutes={tamilTask.durationMinutes || 15}
                  isCompleted={completedSteps.tamil}
                  onMarkComplete={() => handleMarkStepComplete('tamil', 25)}
                  xpReward={25}
                />
              </View>
            )}

            {/* ── STEP 3: English Masterclass ── */}
            {activeStep === 'english' && (
              <View style={styles.stepSection}>
                <View style={styles.stepHeaderCard}>
                  <View style={styles.stepBadge}>
                    <Sparkles size={12} color="#38BDF8" />
                    <Text style={[styles.stepBadgeText, { color: '#38BDF8' }]}>TASK 3: ENGLISH & GRAMMAR</Text>
                  </View>
                  <Text style={styles.stepHeading}>{englishTask.title}</Text>
                  <Text style={styles.stepSub}>{englishTask.summary}</Text>
                </View>

                <ImmersiveVideoPlayer
                  videoId={englishTask.youtubeVideoId || 'dQw4w9WgXcQ'}
                  title={englishTask.title}
                  channelName={englishTask.channelName || 'SuprO English Academy'}
                  summary={englishTask.summary}
                  durationMinutes={englishTask.durationMinutes || 15}
                  isCompleted={completedSteps.english}
                  onMarkComplete={() => handleMarkStepComplete('english', 25)}
                  xpReward={25}
                />
              </View>
            )}

            {/* ── STEP 4: Mathematics Lab ── */}
            {activeStep === 'maths' && (
              <View style={styles.stepSection}>
                <View style={styles.stepHeaderCard}>
                  <View style={styles.stepBadge}>
                    <Layers size={12} color="#F59E0B" />
                    <Text style={[styles.stepBadgeText, { color: '#F59E0B' }]}>TASK 4: MATHEMATICS & DERIVATIONS</Text>
                  </View>
                  <Text style={styles.stepHeading}>{mathsTask.title}</Text>
                  <Text style={styles.stepSub}>{mathsTask.summary}</Text>
                </View>

                <ImmersiveVideoPlayer
                  videoId={mathsTask.youtubeVideoId || 'dQw4w9WgXcQ'}
                  title={mathsTask.title}
                  channelName={mathsTask.channelName || 'SuprO Maths Lab'}
                  summary={mathsTask.summary}
                  durationMinutes={mathsTask.durationMinutes || 20}
                  isCompleted={completedSteps.maths}
                  onMarkComplete={() => handleMarkStepComplete('maths', 25)}
                  xpReward={25}
                />
              </View>
            )}

            {/* ── STEP 5: Science Practical & Concepts ── */}
            {activeStep === 'science' && (
              <View style={styles.stepSection}>
                <View style={styles.stepHeaderCard}>
                  <View style={styles.stepBadge}>
                    <Zap size={12} color="#10B981" />
                    <Text style={[styles.stepBadgeText, { color: '#10B981' }]}>TASK 5: SCIENCE CORE DISCOVERY</Text>
                  </View>
                  <Text style={styles.stepHeading}>{scienceTask.title}</Text>
                  <Text style={styles.stepSub}>{scienceTask.summary}</Text>
                </View>

                <ImmersiveVideoPlayer
                  videoId={scienceTask.youtubeVideoId || 'dQw4w9WgXcQ'}
                  title={scienceTask.title}
                  channelName={scienceTask.channelName || 'SuprO Science Discovery'}
                  summary={scienceTask.summary}
                  durationMinutes={scienceTask.durationMinutes || 20}
                  isCompleted={completedSteps.science}
                  onMarkComplete={() => handleMarkStepComplete('science', 25)}
                  xpReward={25}
                />
              </View>
            )}

            {/* ── STEP 6: Social Science & Civics ── */}
            {activeStep === 'social' && (
              <View style={styles.stepSection}>
                <View style={styles.stepHeaderCard}>
                  <View style={styles.stepBadge}>
                    <Target size={12} color="#8B5CF6" />
                    <Text style={[styles.stepBadgeText, { color: '#8B5CF6' }]}>TASK 6: SOCIAL SCIENCE & CIVICS</Text>
                  </View>
                  <Text style={styles.stepHeading}>{socialScienceTask.title}</Text>
                  <Text style={styles.stepSub}>{socialScienceTask.summary}</Text>
                </View>

                <ImmersiveVideoPlayer
                  videoId={socialScienceTask.youtubeVideoId || 'dQw4w9WgXcQ'}
                  title={socialScienceTask.title}
                  channelName={socialScienceTask.channelName || 'SuprO Civics & History'}
                  summary={socialScienceTask.summary}
                  durationMinutes={socialScienceTask.durationMinutes || 15}
                  isCompleted={completedSteps.social}
                  onMarkComplete={() => handleMarkStepComplete('social', 25)}
                  xpReward={25}
                />
              </View>
            )}

            {/* ── STEP 7: Life Skills & Practical Leadership ── */}
            {activeStep === 'lifeskill' && (
              <View style={styles.stepSection}>
                <View style={styles.stepHeaderCard}>
                  <View style={styles.stepBadge}>
                    <Sparkles size={12} color="#F59E0B" />
                    <Text style={[styles.stepBadgeText, { color: '#F59E0B' }]}>TASK 7: LIFE SKILLS & LEADERSHIP</Text>
                  </View>
                  <Text style={styles.stepHeading}>{lifeSkillTask.title}</Text>
                  <Text style={styles.stepSub}>{lifeSkillTask.description}</Text>
                </View>

                <View style={styles.cardContentBox}>
                  <Text style={styles.cardContentHeading}>💡 ACTION TAKEAWAY PROMPT:</Text>
                  <Text style={styles.cardContentBody}>
                    {lifeSkillTask.actionPrompt || 'Summarize how you applied this leadership principle today.'}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.actionCompleteBtn}
                  onPress={() => handleMarkStepComplete('lifeskill', 20)}
                >
                  <CheckCircle2 size={16} color="#070C18" />
                  <Text style={styles.actionCompleteBtnText}>Mark Life Skill Complete (+20 XP) ➡️</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── STEP 8: Daily Homework & Self-Study ── */}
            {activeStep === 'homework' && (
              <View style={styles.stepSection}>
                <View style={styles.stepHeaderCard}>
                  <View style={styles.stepBadge}>
                    <FileText size={12} color="#38BDF8" />
                    <Text style={[styles.stepBadgeText, { color: '#38BDF8' }]}>TASK 8: HOMEWORK & SELF-PRACTICE</Text>
                  </View>
                  <Text style={styles.stepHeading}>{homeworkTask.title}</Text>
                  <Text style={styles.stepSub}>{homeworkTask.description}</Text>
                </View>

                <View style={styles.cardContentBox}>
                  <Text style={styles.cardContentHeading}>✍️ PRACTICE QUESTIONS TO SOLVE IN NOTEBOOK:</Text>
                  {(homeworkTask.questions || []).map((q, idx) => (
                    <View key={idx} style={styles.questionBulletRow}>
                      <Text style={styles.bulletIndex}>{idx + 1}.</Text>
                      <Text style={styles.bulletText}>{q}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.actionCompleteBtn}
                  onPress={() => handleMarkStepComplete('homework', 25)}
                >
                  <CheckCircle2 size={16} color="#070C18" />
                  <Text style={styles.actionCompleteBtnText}>Mark Homework Complete (+25 XP) ➡️</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── STEP 9: Fitness, Exercise & Yoga Video ── */}
            {activeStep === 'yoga' && (
              <View style={styles.stepSection}>
                <View style={styles.stepHeaderCard}>
                  <View style={styles.stepBadge}>
                    <Heart size={12} color="#EC4899" />
                    <Text style={[styles.stepBadgeText, { color: '#EC4899' }]}>TASK 9: FITNESS, EXERCISE & YOGA</Text>
                  </View>
                  <Text style={styles.stepHeading}>{exerciseYoga.title}</Text>
                  <Text style={styles.stepSub}>Asana / Routine: {exerciseYoga.asanaOrWorkout}</Text>
                </View>

                <ImmersiveVideoPlayer
                  videoId={exerciseYoga.youtubeVideoId || 'dQw4w9WgXcQ'}
                  title={exerciseYoga.title}
                  channelName="SuprO Wellness & Fitness"
                  summary={`Key Asana: ${exerciseYoga.asanaOrWorkout}`}
                  durationMinutes={exerciseYoga.durationMinutes || 10}
                  isCompleted={completedSteps.yoga}
                  onMarkComplete={() => handleMarkStepComplete('yoga', 25)}
                  xpReward={25}
                />
              </View>
            )}

            {/* ── STEP 10: Current Affairs & GK Video ── */}
            {activeStep === 'currentaffairs' && (
              <View style={styles.stepSection}>
                <View style={styles.stepHeaderCard}>
                  <View style={styles.stepBadge}>
                    <Sparkles size={12} color="#00D084" />
                    <Text style={styles.stepBadgeText}>TASK 10: CURRENT AFFAIRS & GK (ALL USERS)</Text>
                  </View>
                  <Text style={styles.stepHeading}>{currentAffairs.title}</Text>
                  <Text style={styles.stepSub}>Common daily knowledge bulletin across all programs.</Text>
                </View>

                <ImmersiveVideoPlayer
                  videoId={currentAffairs.youtubeVideoId || 'dQw4w9WgXcQ'}
                  title={currentAffairs.title}
                  channelName="SuprO Current Affairs & GK"
                  summary="All-India national schemes, defense updates & civics knowledge."
                  durationMinutes={currentAffairs.durationMinutes || 10}
                  isCompleted={completedSteps.currentaffairs}
                  onMarkComplete={() => handleMarkStepComplete('currentaffairs', 25)}
                  xpReward={25}
                />
              </View>
            )}

            {/* ── STEP 11: 5-Minute Topic CBT Drill ── */}
            {activeStep === 'test' && (
              <View style={styles.stepSection}>
                <View style={styles.stepHeaderCard}>
                  <View style={styles.stepBadge}>
                    <Target size={12} color="#F59E0B" />
                    <Text style={[styles.stepBadgeText, { color: '#F59E0B' }]}>TASK 11: DAILY MCQ ASSESSMENT</Text>
                  </View>
                  <Text style={styles.stepHeading}>{plan.mcqTest.testTitle}</Text>
                  <Text style={styles.stepSub}>
                    {plan.mcqTest.questions.length} High-Yield Exam Questions • Instant Scoring
                  </Text>
                </View>

                {plan.mcqTest.questions.map((q, qIdx) => (
                  <View key={q.id} style={styles.mcqCard}>
                    <Text style={styles.mcqQuestionText}>
                      {qIdx + 1}. {q.question}
                    </Text>

                    {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                      const isSelected = selectedAnswers[q.id] === optKey;
                      const isCorrect = testSubmitted && q.correctOption === optKey;
                      const isWrong = testSubmitted && isSelected && !isCorrect;

                      return (
                        <TouchableOpacity
                          key={optKey}
                          style={[
                            styles.mcqOptionBtn,
                            isSelected && styles.mcqOptionBtnSelected,
                            isCorrect && styles.mcqOptionBtnCorrect,
                            isWrong && styles.mcqOptionBtnWrong,
                          ]}
                          activeOpacity={0.8}
                          onPress={() => handleTestOptionSelect(q.id, optKey)}
                          disabled={testSubmitted}
                        >
                          <Text style={styles.mcqOptionKey}>{optKey}</Text>
                          <Text style={styles.mcqOptionLabel}>{q.options[optKey]}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}

                {!testSubmitted ? (
                  <TouchableOpacity style={styles.actionCompleteBtn} onPress={handleSubmitDailyTest}>
                    <Award size={16} color="#070C18" />
                    <Text style={styles.actionCompleteBtnText}>Submit Assessment & Reveal Score</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.actionCompleteBtn}
                    onPress={() => setActiveStep('drive_feedback')}
                  >
                    <ArrowRight size={16} color="#070C18" />
                    <Text style={styles.actionCompleteBtnText}>Go to Drive Video Feedback ➡️</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* ── STEP 12: Google Drive Task Video Reflection ── */}
            {activeStep === 'drive_feedback' && (
              <View style={styles.stepSection}>
                <View style={styles.stepHeaderCard}>
                  <View style={styles.stepBadge}>
                    <HardDrive size={12} color="#38BDF8" />
                    <Text style={[styles.stepBadgeText, { color: '#38BDF8' }]}>TASK 12: DRIVE VIDEO RECORDING</Text>
                  </View>
                  <Text style={styles.stepHeading}>📹 Record & Upload Today's Video Reflection</Text>
                  <Text style={styles.stepSub}>
                    Record a 30-60 second video explaining what you learned today. Your video will be automatically
                    stored in your Google Drive and sent to your course guide on WhatsApp (6381029380).
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.actionCompleteBtn, { backgroundColor: '#38BDF8' }]}
                  onPress={() => setIsVideoFeedbackOpen(true)}
                >
                  <Video size={16} color="#070C18" />
                  <Text style={styles.actionCompleteBtnText}>Launch In-App Video Recorder & Drive Upload</Text>
                </TouchableOpacity>

                {/* Direct Course Guide WhatsApp CRM Verification Button */}
                <TouchableOpacity
                  style={[styles.actionCompleteBtn, { backgroundColor: '#25D366', marginTop: 10 }]}
                  onPress={() => setIsVideoFeedbackOpen(true)}
                >
                  <Send size={16} color="#FFFFFF" />
                  <Text style={[styles.actionCompleteBtnText, { color: '#FFFFFF' }]}>
                    📲 Send Video to Course Guide on WhatsApp (6381029380)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionCompleteBtn, { marginTop: 12 }]}
                  onPress={handleCompleteWholeDay}
                >
                  <CheckCircle2 size={16} color="#070C18" />
                  <Text style={styles.actionCompleteBtnText}>🎉 Complete Entire Day {currentDay} Deck (+150 XP)</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        )}

        {/* ─── 4. TASK VIDEO FEEDBACK MODAL (GOOGLE DRIVE) ───────────── */}
        <TaskVideoFeedbackModal
          visible={isVideoFeedbackOpen}
          onClose={() => setIsVideoFeedbackOpen(false)}
          courseId={courseId}
          courseTitle={courseTitle}
          dayNumber={currentDay}
          topicTitle={`Day ${currentDay} Curriculum Completion`}
          onSubmitted={async (earnedXp) => {
            await handleMarkStepComplete('drive_feedback', earnedXp);
          }}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    backgroundColor: '#070C18',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#0E172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  dayBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  dayBadge: {
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 208, 132, 0.3)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dayBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#00D084',
  },
  sheetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0, 208, 132, 0.1)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sheetBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#00D084',
  },
  topBarCourseTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  driveRecordPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: '#38BDF8',
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 6,
  },
  driveRecordPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38BDF8',
  },
  jumperBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  jumperBtnDisabled: {
    opacity: 0.4,
  },
  stepsBarContainer: {
    backgroundColor: '#0A1020',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingVertical: 8,
  },
  stepsBarScroll: {
    paddingHorizontal: 12,
    gap: 8,
  },
  stepTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#131F37',
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
    fontWeight: '800',
    color: '#94A3B8',
  },
  stepIndexTextActive: {
    color: '#00D084',
    fontWeight: '900',
  },
  stepTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  stepTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  stepTabTextDone: {
    color: '#00D084',
  },
  scrollContent: {
    flex: 1,
    padding: 14,
  },
  stepSection: {
    gap: 12,
    marginBottom: 40,
  },
  stepHeaderCard: {
    backgroundColor: '#0E172A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 14,
    gap: 6,
  },
  stepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  stepBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#00D084',
    letterSpacing: 0.5,
  },
  stepHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  stepSub: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
  },
  cardContentBox: {
    backgroundColor: '#0E172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 14,
    gap: 8,
  },
  cardContentHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00D084',
    letterSpacing: 0.5,
  },
  cardContentBody: {
    fontSize: 12,
    color: '#E2E8F0',
    lineHeight: 18,
  },
  questionBulletRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'flex-start',
  },
  bulletIndex: {
    fontSize: 12,
    fontWeight: '800',
    color: '#38BDF8',
  },
  bulletText: {
    fontSize: 12,
    color: '#E2E8F0',
    flex: 1,
    lineHeight: 18,
  },
  actionCompleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#00D084',
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: '#00D084',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  actionCompleteBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#070C18',
  },
  mcqCard: {
    backgroundColor: '#0E172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 12,
    gap: 8,
  },
  mcqQuestionText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 18,
  },
  mcqOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#131F37',
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 10,
    borderRadius: 8,
  },
  mcqOptionBtnSelected: {
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
    borderColor: '#00D084',
  },
  mcqOptionBtnCorrect: {
    backgroundColor: 'rgba(0, 208, 132, 0.25)',
    borderColor: '#00D084',
  },
  mcqOptionBtnWrong: {
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    borderColor: '#EF4444',
  },
  mcqOptionKey: {
    fontSize: 11,
    fontWeight: '900',
    color: '#00D084',
  },
  mcqOptionLabel: {
    fontSize: 11,
    color: '#E2E8F0',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '700',
  },
});
