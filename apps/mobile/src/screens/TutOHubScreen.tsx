import React, { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Modal,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  BookOpen,
  Award,
  Flame,
  CheckCircle2,
  Lock,
  Unlock,
  ChevronRight,
  Sparkles,
  Zap,
  Clock,
  HelpCircle,
  Play,
  RotateCcw,
  Search,
  Filter,
  Layers,
  GraduationCap,
  Calendar,
  Compass,
  FileText,
  Star,
  ShieldCheck,
  ChevronDown,
  X,
  Target,
  Bot,
  Brain,
  Video,
  Activity,
} from 'lucide-react-native';

import { AppContext } from '../context/AppContext';
import { TeachOHeader } from '../components/teacho/TeachOHeader';
import { TeachOTodayHero } from '../components/teacho/TeachOTodayHero';
import { TeachORoutineSteps, RoutineTask } from '../components/teacho/TeachORoutineSteps';
import { TeachOCoursePickerSheet } from '../components/teacho/TeachOCoursePickerSheet';
import { TeachOSearchModal } from '../components/teacho/TeachOSearchModal';
import { TeachOSyllabusViewerModal } from '../components/teacho/TeachOSyllabusViewerModal';
import { TeachONanoPlayerModal } from '../components/TeachONanoPlayerModal';
import PaymentQRModal from '../components/PaymentQRModal';

import { ALL_COURSES, DEFAULT_COURSE, CourseOption, SchoolBoard, SCHOOL_BOARDS } from '../data/coursesCatalog';
import { resolveNanoDayPlan, NanoDayPlan } from '../data/curriculum/dayPlanNanoEngine';
import { getCoursePlayerContent } from '../lib/coursePlayerEngine';
import purchaseService from '../services/purchaseService';
import NotificationService from '../services/NotificationService';
import { generateBilingualQuestionsForTopic, calculateTestODiagnosticReport } from '../lib/testoQuestionEngine';

const { width } = Dimensions.get('window');

type TutOMode = 'STUDY' | 'TESTS' | 'AI_TUTOR';
type TestCategoryTab = 'ALL' | 'FULL_MOCKS' | 'CHAPTER_TESTS' | 'PYQ' | 'CURRENT_AFFAIRS' | 'DAY_PLAN';

export default function TutOHubScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { user, userRole, profile } = useContext(AppContext) || {};

  const isAdmin = Boolean(
    user?.isAdmin ||
    userRole === 'admin' ||
    profile?.role === 'admin' ||
    (user?.phone && ['6381029380', '9876543210', '9486335870'].includes(user.phone.replace(/\D/g, '').slice(-10)))
  );

  // ─── Primary TutO Mode ───────────────────────────────────────────────────
  const [activeMode, setActiveMode] = useState<TutOMode>('STUDY');

  // ─── Active Course State ─────────────────────────────────────────────────
  const [selectedCourse, setSelectedCourse] = useState<CourseOption>(DEFAULT_COURSE);
  const [selectedBoard, setSelectedBoard] = useState<SchoolBoard>('TNSB');
  const [isCoursePickerOpen, setIsCoursePickerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSyllabusModalOpen, setIsSyllabusModalOpen] = useState(false);

  // ─── Purchase & Pass Pro State ───────────────────────────────────────────
  const [isCoursePurchased, setIsCoursePurchased] = useState(false);
  const [isPassProSubscribed, setIsPassProSubscribed] = useState(false);
  const [isPassProModalOpen, setIsPassProModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const isFullAccess = isAdmin || isCoursePurchased || isPassProSubscribed;

  // ─── Gamification & Streak State ─────────────────────────────────────────
  const [currentDay, setCurrentDay] = useState(1);
  const [totalDays, setTotalDays] = useState(200);
  const [streak, setStreak] = useState(5);
  const [xp, setXp] = useState(180);
  const [completedTasksMap, setCompletedTasksMap] = useState<{ [dayKey: string]: number }>({});

  // ─── Learn Mode / Day Plan State ─────────────────────────────────────────
  const [activeDayPlan, setActiveDayPlan] = useState<NanoDayPlan | null>(() => {
    return resolveNanoDayPlan(ALL_COURSES[0].id, ALL_COURSES[0].title, 1, 'TNSB');
  });
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [activeNanoTask, setActiveNanoTask] = useState<any>(null);
  const [isNanoPlayerOpen, setIsNanoPlayerOpen] = useState(false);
  const [activePlayerTask, setActivePlayerTask] = useState<{
    topicTitle: string;
    subject: string;
    taskType: string;
    taskNumber?: number;
  } | null>(null);

  // ─── Test Mode State ─────────────────────────────────────────────────────
  const [activeTestTab, setActiveTestTab] = useState<TestCategoryTab>('ALL');

  useEffect(() => {
    async function loadSavedState() {
      try {
        const savedCourseId = await AsyncStorage.getItem('tuto_active_course_id');
        if (savedCourseId) {
          const savedBoard = await AsyncStorage.getItem(`tuto_selected_board_${savedCourseId}`);
          if (savedBoard) setSelectedBoard(savedBoard as SchoolBoard);
          const matched = ALL_COURSES.find((c) => c.id === savedCourseId);
          if (matched) {
            setSelectedCourse(matched);
            setActiveDayPlan(resolveNanoDayPlan(matched.id, matched.title, matched.currentDayDefault || 1, selectedBoard));
          }
        }

        const savedStreak = await AsyncStorage.getItem('tuto_user_streak');
        if (savedStreak) setStreak(parseInt(savedStreak, 10));

        const savedXp = await AsyncStorage.getItem('tuto_user_xp');
        if (savedXp) setXp(parseInt(savedXp, 10));

        const savedTasks = await AsyncStorage.getItem('tuto_completed_tasks_map');
        if (savedTasks) setCompletedTasksMap(JSON.parse(savedTasks));

        const passPro = await AsyncStorage.getItem('tuto_pass_pro_active');
        if (passPro === 'true') setIsPassProSubscribed(true);

        const purchased = await purchaseService.isItemPurchased(user?.id, selectedCourse.id, 'course');
        setIsCoursePurchased(purchased);

        NotificationService.scheduleDailyStudyReminder(8, 0, selectedCourse.title);
      } catch (e) {}
    }
    loadSavedState();
  }, [selectedCourse.id, user?.id]);

  useEffect(() => {
    setTotalDays(selectedCourse.totalDays || 200);
    const dayToUse = selectedCourse.currentDayDefault || 1;
    setCurrentDay(dayToUse);
    setActiveDayPlan(resolveNanoDayPlan(selectedCourse.id, selectedCourse.title, dayToUse, selectedBoard));
  }, [selectedCourse]);

  useEffect(() => {
    try {
      const plan = resolveNanoDayPlan(selectedCourse.id, selectedCourse.title, currentDay, selectedBoard);
    setActiveDayPlan(plan);
    } catch (e) {}
  }, [selectedCourse, currentDay]);

    const handleBoardSelect = useCallback(async (board: SchoolBoard) => {
    setSelectedBoard(board);
    await AsyncStorage.setItem(`tuto_selected_board_${selectedCourse.id}`, board);
  }, [selectedCourse.id]);

  const handleSelectCourse = useCallback((course: CourseOption) => {
    if (!course) return;
    try {
      setSelectedCourse(course);
        const courseBoard = (await AsyncStorage.getItem(`tuto_selected_board_${course.id}`)) as SchoolBoard || 'TNSB';
        setSelectedBoard(courseBoard);
      setIsCoursePickerOpen(false);
      const dayToUse = course.currentDayDefault || 1;
      setCurrentDay(dayToUse);
      setTotalDays(course.totalDays || 200);
      const plan = resolveNanoDayPlan(course.id, course.title, dayToUse, selectedBoard);
    if (plan) setActiveDayPlan(plan);
      AsyncStorage.setItem('tuto_active_course_id', course.id).catch(() => {});
    } catch (err) {
      console.warn('Error applying selected course:', err);
      setSelectedCourse(course);
      setIsCoursePickerOpen(false);
    }
  }, []);

  const handleDaySelect = useCallback((day: number) => {
    setCurrentDay(day);
  }, []);

  const handleTaskPress = useCallback(
    (task: any, index: number) => {
      setActiveNanoTask({
        topicTitle: task.topic || task.title,
        tamilTopicTitle: task.tamilTopic,
        subject: task.subject || task.subtitle,
        conceptCode: task.conceptCode || task.id,
        keyFormulaOrRule: task.nanoConcept?.keyRuleOrFormula || task.keyFormula,
        taskNumber: index + 1,
        initialTab: task.type === 'quiz' ? 'quiz' : task.type === 'notes' ? 'notes' : task.type === 'ai_tutor' ? 'tutor' : 'lecture',
      });
      setIsNanoPlayerOpen(true);
    },
    []
  );

  // Two-Way Bridge: Launch CBT test directly from topic
  const launchTopicCbtTest = useCallback(
    (topicTitle: string, subjectTitle: string) => {
      navigation.navigate('TestOExamScreen', {
        testId: `topic_${selectedCourse.id}_${topicTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        title: `${topicTitle} - Topic Assessment`,
        courseTitle: selectedCourse.title,
        courseId: selectedCourse.id,
        topicTitle: topicTitle,
        subject: subjectTitle,
        questionCount: 10,
        markingScheme: selectedCourse.id.includes('neet') ? '+4 / -1' : '+1 / -0.33',
      });
    },
    [navigation, selectedCourse]
  );

  // AI Tutor Bridge: Launch customized 1-on-1 AI Master Tutor session for topic
  const handleLaunchAiTutor = useCallback(
    (customTopic?: string, customSubject?: string) => {
      const topicToUse = customTopic || activeDayPlan?.tasks?.[0]?.topic || selectedCourse.title;
      const subjectToUse = customSubject || activeDayPlan?.tasks?.[0]?.subject || 'Core Concepts';

      const prompt = `You are my dedicated 1-on-1 AI Master Tutor for ${selectedCourse.title}.\n` +
        `Curriculum: Day ${currentDay} of ${totalDays}-Day Mastery Plan\n` +
        `Subject: ${subjectToUse}\n` +
        `Topic: "${topicToUse}"\n\n` +
        `Please provide an interactive, structured lesson:\n` +
        `1. 🎯 1-Minute Micro-Concept & Axiom (சூத்திரம் / விதி)\n` +
        `2. 🌍 Everyday Tamil & English Real-World Analogy (நடைமுறை உதாரணம்)\n` +
        `3. 📝 3 Key Exam Heuristics & High-Yield Points\n` +
        `4. ⚡ 3 Practice Quiz Questions with Step-by-Step Solutions.\n\n` +
        `Explain in clear bilingual Tamil & English.`;

      navigation.navigate('AishleeToolsScreen', {
        aiPrompt: prompt,
        initialPrompt: prompt,
        tool: 'Notes Maker',
        autoRun: true,
        topicTitle: topicToUse,
        courseTitle: selectedCourse.title,
      });
    },
    [navigation, selectedCourse, currentDay, totalDays, activeDayPlan]
  );

  // Test Mode Item Generator for Active Course
  const courseTestSeries = useMemo(() => {
    const isStateGovt = selectedCourse.id.includes('tnpsc') || selectedCourse.id.includes('tnusrb') || selectedCourse.id.includes('trb');
    const isEntrance = selectedCourse.id.includes('neet') || selectedCourse.id.includes('jee') || selectedCourse.id.includes('gate');
    const isSchool = selectedCourse.id.includes('grade') || selectedCourse.id.includes('samacheer') || selectedCourse.id.includes('cbse');
    const isKindergarten = selectedCourse.id.includes('lkg') || selectedCourse.id.includes('ukg') || selectedCourse.id.includes('kindergarten');

    const fullMocks = [
      {
        id: `mock_1_${selectedCourse.id}`,
        title: `${selectedCourse.title} All-India Grand Mock Test 1`,
        badge: 'LIVE NTA CBT',
        questionsCount: isEntrance ? 180 : isStateGovt ? 200 : 50,
        timeMins: isEntrance ? 200 : 180,
        totalMarks: isEntrance ? 720 : 300,
        attemptsCount: '48.2k Attended',
        isFree: true,
        type: 'FULL_MOCKS',
      },
      {
        id: `mock_2_${selectedCourse.id}`,
        title: `${selectedCourse.title} State-Ranker Mega Mock 2`,
        badge: 'PASS PRO',
        questionsCount: isEntrance ? 180 : isStateGovt ? 200 : 50,
        timeMins: isEntrance ? 200 : 180,
        totalMarks: isEntrance ? 720 : 300,
        attemptsCount: '32.1k Attended',
        isFree: false,
        type: 'FULL_MOCKS',
      },
    ];

    const chapterTests = (activeDayPlan?.tasks || []).map((t, idx) => ({
      id: `chap_${selectedCourse.id}_${idx}`,
      title: `${t.subject}: ${t.topic}`,
      badge: 'MICRO DRILL',
      questionsCount: 10,
      timeMins: 10,
      totalMarks: 40,
      attemptsCount: '19.4k Attended',
      isFree: idx === 0 || isFullAccess,
      type: 'CHAPTER_TESTS',
      topicTitle: t.topic,
      subject: t.subject,
    }));

    const pyqTests = [
      {
        id: `pyq_2024_${selectedCourse.id}`,
        title: `${selectedCourse.title} Official Question Paper (2024 Session)`,
        badge: 'OFFICIAL PYQ',
        questionsCount: isStateGovt ? 200 : 100,
        timeMins: 180,
        totalMarks: 300,
        attemptsCount: '62.8k Attended',
        isFree: true,
        type: 'PYQ',
      },
      {
        id: `pyq_2023_${selectedCourse.id}`,
        title: `${selectedCourse.title} Official Question Paper (2023 Session)`,
        badge: 'OFFICIAL PYQ',
        questionsCount: isStateGovt ? 200 : 100,
        timeMins: 180,
        totalMarks: 300,
        attemptsCount: '54.1k Attended',
        isFree: false,
        type: 'PYQ',
      },
    ];

    const currentAffairsTests = [
      {
        id: `ca_daily_${selectedCourse.id}`,
        title: 'Daily Current Affairs & Tamil Nadu Govt Schemes (நடப்பு நிகழ்வுகள்)',
        badge: 'DAILY GK',
        questionsCount: 15,
        timeMins: 10,
        totalMarks: 15,
        attemptsCount: '78.9k Today',
        isFree: true,
        type: 'CURRENT_AFFAIRS',
      },
    ];

    return { fullMocks, chapterTests, pyqTests, currentAffairsTests };
  }, [selectedCourse, activeDayPlan, isFullAccess]);

  const filteredTests = useMemo(() => {
    const { fullMocks, chapterTests, pyqTests, currentAffairsTests } = courseTestSeries;
    if (activeTestTab === 'FULL_MOCKS') return fullMocks;
    if (activeTestTab === 'CHAPTER_TESTS') return chapterTests;
    if (activeTestTab === 'PYQ') return pyqTests;
    if (activeTestTab === 'CURRENT_AFFAIRS') return currentAffairsTests;
    if (activeTestTab === 'DAY_PLAN') return chapterTests;
    return [...fullMocks, ...chapterTests.slice(0, 3), ...pyqTests.slice(0, 1), ...currentAffairsTests];
  }, [activeTestTab, courseTestSeries]);

  const currentDayKey = `${selectedCourse.id}_day_${currentDay}`;
  const completedTasksForCurrentDay = completedTasksMap[currentDayKey] ?? (currentDay === 1 ? 1 : 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#070C18" />

      {/* ─── 1. TOP HEADER & BRANDING ─── */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0) + 8 }]}>
        <View style={styles.headerTopRow}>
          <View style={styles.brandContainer}>
            <View style={styles.brandLogoBox}>
              <GraduationCap size={20} color="#00D084" />
            </View>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.brandTitle}>TutO</Text>
                <View style={styles.proBadge}>
                  <Text style={styles.proBadgeText}>SUPER LMS</Text>
                </View>
              </View>
              <Text style={styles.brandSubtitle}>TeachO + TestO Unified Platform</Text>
            </View>
          </View>

          <View style={styles.headerRightActions}>
            <TouchableOpacity
              style={styles.streakBadge}
              onPress={() => Alert.alert('TutO Study Streak', `🔥 ${streak} Days Active Streak!\nKeep studying daily to maintain your momentum & bonus XP.`)}
            >
              <Flame size={13} color="#F59E0B" />
              <Text style={styles.streakText}>{streak}d</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.passBtn, isPassProSubscribed && styles.passBtnActive]}
              onPress={() => setIsPassProModalOpen(true)}
            >
              <Award size={13} color={isPassProSubscribed ? '#00D084' : '#F59E0B'} />
              <Text style={[styles.passBtnText, isPassProSubscribed && { color: '#00D084' }]}>
                {isPassProSubscribed ? 'Pass Pro Active' : 'Pass Pro ₹199'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

                {/* Course / Exam Selector Chip */}
        <TouchableOpacity
          style={styles.courseSelectorChip}
          activeOpacity={0.85}
          onPress={() => setIsCoursePickerOpen(true)}
        >
          <View style={styles.courseSelectorLeft}>
            <View style={styles.courseIconBox}>
              <Layers size={14} color="#00D084" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.courseSelectorLabel}>TARGET CURRICULUM & EXAM</Text>
              <Text style={styles.courseSelectorTitle} numberOfLines={1}>
                {selectedCourse.title}
              </Text>
            </View>
          </View>
          <View style={styles.changeCoursePill}>
            <Text style={styles.changeCourseText}>Change</Text>
            <ChevronDown size={12} color="#00D084" />
          </View>
        </TouchableOpacity>

        {/* K-12 Multi-Board Curriculum Switcher */}
        {(selectedCourse.category === 'school_k12' || selectedCourse.supportedBoards) && (
          <View style={styles.boardSelectorContainer}>
            <View style={styles.boardHeaderRow}>
              <Text style={styles.boardHeaderLabel}>SELECT BOARD / SYLLABUS</Text>
              <View style={styles.mediumPillBadge}>
                <Text style={styles.mediumPillText}>Bilingual (தமிழ் & EN)</Text>
              </View>
            </View>
            <View style={styles.boardRow}>
              {SCHOOL_BOARDS.map((b) => {
                const isCurrent = selectedBoard === b.id;
                return (
                  <TouchableOpacity
                    key={b.id}
                    style={[styles.boardOptionPill, isCurrent && styles.boardOptionPillActive]}
                    onPress={() => handleBoardSelect(b.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.boardOptionText, isCurrent && styles.boardOptionTextActive]}>
                      {b.short}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* ─── 2. PRIMARY MODE SWITCHER TABS ─── */}
        <View style={styles.modeSwitcherBar}>
          <TouchableOpacity
            style={[styles.modeTab, activeMode === 'STUDY' && styles.modeTabActive]}
            onPress={() => setActiveMode('STUDY')}
          >
            <BookOpen size={14} color={activeMode === 'STUDY' ? '#00D084' : '#94A3B8'} />
            <Text style={[styles.modeTabText, activeMode === 'STUDY' && styles.modeTabTextActive]}>
              🎓 Study & Day Plan
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeTab, activeMode === 'TESTS' && styles.modeTabActive]}
            onPress={() => setActiveMode('TESTS')}
          >
            <Award size={14} color={activeMode === 'TESTS' ? '#00D084' : '#94A3B8'} />
            <Text style={[styles.modeTabText, activeMode === 'TESTS' && styles.modeTabTextActive]}>
              📝 Mock Tests & PYQ
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeTab, activeMode === 'AI_TUTOR' && styles.modeTabActive]}
            onPress={() => handleLaunchAiTutor()}
          >
            <Bot size={14} color={activeMode === 'AI_TUTOR' ? '#00D084' : '#94A3B8'} />
            <Text style={[styles.modeTabText, activeMode === 'AI_TUTOR' && styles.modeTabTextActive]}>
              🤖 AI Tutor
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── 3. MAIN CONTENT SCROLLER ─── */}
      <ScrollView
        style={styles.contentScroll}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) + 60 }}
        showsVerticalScrollIndicator={false}
      >
        {activeMode === 'STUDY' ? (
          /* ═══════════════════════════════════════════════════════════════════
             🎓 MODE 1: STUDY & DAY PLAN (TeachO Power Engine)
             ═══════════════════════════════════════════════════════════════════ */
          <View style={styles.studyModeContainer}>
            {/* Day Hero & Timeline Stepper */}
            <TeachOTodayHero
              courseTitle={selectedCourse.title}
              currentDay={currentDay}
              totalDays={totalDays}
              streak={streak}
              onDaySelect={handleDaySelect}
              onTakeFullCourse={() => navigation.navigate('TeachOCourseScreen', { course: selectedCourse })}
            />

            {/* Quick 2-Way Test Launcher Banner */}
            <TouchableOpacity
              style={styles.quickTestBanner}
              activeOpacity={0.85}
              onPress={() => setActiveMode('TESTS')}
            >
              <View style={styles.quickTestLeft}>
                <View style={styles.quickTestIconBox}>
                  <Zap size={18} color="#F59E0B" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.quickTestTitle}>Day {currentDay} Topic Assessment Ready!</Text>
                  <Text style={styles.quickTestSub}>
                    Test your knowledge with 10 instant CBT MCQs + detailed solutions
                  </Text>
                </View>
              </View>
              <View style={styles.quickTestBtn}>
                <Text style={styles.quickTestBtnText}>Test Now</Text>
                <ChevronRight size={14} color="#070C18" />
              </View>
            </TouchableOpacity>

            {/* Daily 5 Micro-Tasks Routine */}
            <TeachORoutineSteps
              tasks={(activeDayPlan?.tasks || []).map((t, i) => ({
                id: `task_${currentDay}_${i + 1}`,
                title: t.taskName || t.topic || `Task ${i + 1}`,
                subtitle: t.subject,
                rawTopic: t.topic,
                rawSubject: t.subject,
                duration: `${t.durationMinutes || 10}m`,
                type: (i === 1 ? 'video' : i === 4 ? 'quiz' : 'notes') as any,
                xp: t.xp || 50,
                actionLabel: i < completedTasksForCurrentDay ? 'Review' : 'Start',
                status: (i < completedTasksForCurrentDay ? 'completed' : i === completedTasksForCurrentDay ? 'in_progress' : isFullAccess ? 'in_progress' : 'locked') as any,
                stepNumber: i + 1,
              }))}
              currentDay={currentDay}
              totalDays={totalDays}
              onSelectDay={handleDaySelect}
              onTaskPress={(task) => handleTaskPress(task, task.stepNumber ? task.stepNumber - 1 : 0)}
              onAskAi={(task) => handleLaunchAiTutor(task.rawTopic || task.title, task.rawSubject || task.subtitle)}
              onTakeTest={(task) => launchTopicCbtTest(task.rawTopic || task.title, task.rawSubject || task.subtitle || 'Core Subject')}
            />

                        {/* 🛡️ Official Government Syllabus & Curriculum Card */}
            <View style={styles.syllabusCard}>
              <View style={styles.syllabusHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                  <ShieldCheck size={18} color="#00D084" />
                  <View>
                    <Text style={styles.syllabusTitle}>Verified Government Syllabus</Text>
                    <Text style={styles.syllabusSubBadge}>100% Authentic Govt Notified Norms</Text>
                  </View>
                </View>
                <View style={styles.syllabusAccessTag}>
                  <Text style={[styles.syllabusAccessTagText, { color: isFullAccess ? '#00D084' : '#F59E0B' }]}>
                    {isFullAccess ? 'Unlocked' : 'Free Preview'}
                  </Text>
                </View>
              </View>
              <Text style={styles.syllabusDesc}>
                Official Subject Blueprints, Chapter weightage, Tamil & English Key Notes, formulas & Exam Pattern.
              </Text>
              <TouchableOpacity
                style={styles.openCurriculumBtn}
                onPress={() => setIsSyllabusModalOpen(true)}
                activeOpacity={0.8}
              >
                <BookOpen size={14} color="#00D084" />
                <Text style={styles.openCurriculumBtnText}>View Official Government Syllabus</Text>
                <ChevronRight size={14} color="#00D084" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* ═══════════════════════════════════════════════════════════════════
             📝 MODE 2: MOCK TESTS & PYQ (TestO NTA CBT Engine)
             ═══════════════════════════════════════════════════════════════════ */
          <View style={styles.testModeContainer}>
            {/* Pass Pro Hero Banner */}
            <View style={styles.passProHero}>
              <View style={styles.passProHeroContent}>
                <View style={styles.passProHeaderRow}>
                  <View style={styles.passProTag}>
                    <Award size={12} color="#070C18" />
                    <Text style={styles.passProTagText}>TUTO PASS PRO</Text>
                  </View>
                  <Text style={styles.passProPrice}>₹199 / Year</Text>
                </View>
                <Text style={styles.passProTitle}>Unlock 48,000+ Bilingual Mock Tests & PYQs</Text>
                <Text style={styles.passProSub}>
                  Full NTA/TCS iON CBT simulation, Embibe 4-quadrant diagnostic report & state-rank leaderboards.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.passProActionBtn}
                onPress={() => setIsPassProModalOpen(true)}
              >
                <Text style={styles.passProActionBtnText}>
                  {isPassProSubscribed ? 'Manage Pass Pro' : 'Activate Pass Pro'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Test Categories Sub-Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.testSubTabBar}>
              {[
                { id: 'ALL', label: '🌟 All Tests' },
                { id: 'FULL_MOCKS', label: '🎯 Full Mocks' },
                { id: 'CHAPTER_TESTS', label: '📑 Chapter Tests' },
                { id: 'PYQ', label: '🏛️ Solved PYQs' },
                { id: 'CURRENT_AFFAIRS', label: '⚡ Daily CA' },
                { id: 'DAY_PLAN', label: `📅 Day ${currentDay} Tests` },
              ].map((tab) => {
                const isActive = activeTestTab === tab.id;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    style={[styles.testSubTabItem, isActive && styles.testSubTabItemActive]}
                    onPress={() => setActiveTestTab(tab.id as TestCategoryTab)}
                  >
                    <Text style={[styles.testSubTabText, isActive && styles.testSubTabTextActive]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Test Cards List */}
            <View style={styles.testCardList}>
              {filteredTests.map((testItem) => (
                <View key={testItem.id} style={styles.testCard}>
                  <View style={styles.testCardTop}>
                    <View style={styles.testBadge}>
                      <Text style={styles.testBadgeText}>{testItem.badge}</Text>
                    </View>
                    <Text style={styles.attemptsText}>{testItem.attemptsCount}</Text>
                  </View>

                  <Text style={styles.testTitle}>{testItem.title}</Text>

                  <View style={styles.testMetaRow}>
                    <View style={styles.metaItem}>
                      <HelpCircle size={12} color="#94A3B8" />
                      <Text style={styles.metaText}>{testItem.questionsCount} Qs</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Clock size={12} color="#94A3B8" />
                      <Text style={styles.metaText}>{testItem.timeMins} Mins</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Award size={12} color="#94A3B8" />
                      <Text style={styles.metaText}>{testItem.totalMarks} Marks</Text>
                    </View>
                  </View>

                  <View style={styles.testCardFooter}>
                    <View style={styles.freePill}>
                      <Text style={styles.freePillText}>
                        {testItem.isFree || isFullAccess ? 'FREE ACCESS' : 'PASS PRO ONLY'}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.startTestBtn}
                      onPress={() => {
                        if (!testItem.isFree && !isFullAccess) {
                          setIsPassProModalOpen(true);
                          return;
                        }
                        navigation.navigate('TestOExamScreen', {
                          testId: testItem.id,
                          title: testItem.title,
                          courseTitle: selectedCourse.title,
                          courseId: selectedCourse.id,
                          topicTitle: testItem.topicTitle,
                          subject: testItem.subject,
                          questionCount: testItem.questionsCount,
                          markingScheme: selectedCourse.id.includes('neet') ? '+4 / -1' : '+1 / -0.33',
                        });
                      }}
                    >
                      <Play size={12} color="#070C18" fill="#070C18" />
                      <Text style={styles.startTestBtnText}>Start Test</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* ─── MODALS ─── */}
      {/* 1. Universal Course Picker Modal */}
      <TeachOCoursePickerSheet
        visible={isCoursePickerOpen}
        courses={ALL_COURSES}
        selectedCourse={selectedCourse}
        selectedCourseId={selectedCourse?.id}
        onSelect={handleSelectCourse}
        onSelectCourse={handleSelectCourse}
        onClose={() => setIsCoursePickerOpen(false)}
      />

      {/* 2. Course Task & Notes Player Modal */}
      {activePlayerTask && (
        <TeachOCoursePlayerModal
          visible={isPlayerOpen}
          onClose={() => setIsPlayerOpen(false)}
          topicTitle={activePlayerTask.topicTitle}
          subject={activePlayerTask.subject}
          courseTitle={selectedCourse.title}
          dayNumber={currentDay}
          taskNumber={activePlayerTask.taskNumber}
          courseId={selectedCourse.id}
          onCompleteTask={() => {
            const dayKey = `${selectedCourse.id}_day_${currentDay}`;
            const nextCompleted = Math.max(completedTasksForCurrentDay, (activePlayerTask.taskNumber || 1));
            const newMap = { ...completedTasksMap, [dayKey]: nextCompleted };
            setCompletedTasksMap(newMap);
            AsyncStorage.setItem('tuto_completed_tasks_map', JSON.stringify(newMap)).catch(() => {});
            setIsPlayerOpen(false);
          }}
        />
      )}

      {/* 3. Pass Pro Subscription Modal */}
      <Modal visible={isPassProModalOpen} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.passProModalContainer}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Award size={20} color="#00D084" />
                <Text style={styles.modalTitle}>TutO Pass Pro Master Access</Text>
              </View>
              <TouchableOpacity onPress={() => setIsPassProModalOpen(false)}>
                <X size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
              <View style={styles.planCard}>
                <View style={styles.planTag}>
                  <Text style={styles.planTagText}>BEST VALUE FOR ALL EXAMS</Text>
                </View>
                <Text style={styles.planName}>TutO Super Pass (1 Year)</Text>
                <Text style={styles.planPrice}>₹199 / 12 Months</Text>
                <Text style={styles.planFeature}>• 48,000+ NTA/TCS iON Bilingual Mock Tests</Text>
                <Text style={styles.planFeature}>• 200-Day Study Schedules for All 96+ Courses</Text>
                <Text style={styles.planFeature}>• 2018–2024 Solved Official PYQs with Video Solutions</Text>
                <Text style={styles.planFeature}>• Embibe 4-Quadrant Diagnostic Accuracy Matrix</Text>
              </View>

              <TouchableOpacity
                style={styles.activatePassBtn}
                onPress={async () => {
                  await AsyncStorage.setItem('tuto_pass_pro_active', 'true');
                  setIsPassProSubscribed(true);
                  setIsPassProModalOpen(false);
                  Alert.alert('🎉 Pass Pro Activated!', 'You now have unlimited master access to all 96+ courses, video lectures, and 48,000+ mock tests across Tamil Nadu & National exams.');
                }}
              >
                <Text style={styles.activatePassBtnText}>Instant Unlock with UPI / QR (₹199)</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
          {/* TeachO Official Government Syllabus Modal */}
      <TeachOSyllabusViewerModal
        visible={isSyllabusModalOpen}
        courseId={selectedCourse.id}
        courseTitle={selectedCourse.title}
        board={selectedBoard}
        isPurchased={isFullAccess}
        onClose={() => setIsSyllabusModalOpen(false)}
        onLaunchNanoPlayer={(concept, topic, subj, tab) => {
          setIsSyllabusModalOpen(false);
          setActiveNanoTask({
            topicTitle: concept.name || topic.title,
            tamilTopicTitle: concept.tamilName || topic.tamilTitle,
            subject: subj,
            conceptCode: concept.conceptCode || topic.topicCode,
            keyFormulaOrRule: concept.keyRuleOrFormula || topic.keyFormula,
            taskNumber: 1,
            initialTab: tab || 'lecture',
          });
          setIsNanoPlayerOpen(true);
        }}
        onUnlockCourse={() => {
          setIsSyllabusModalOpen(false);
          setIsPaymentModalOpen(true);
        }}
        onLaunchTopicVideo={(topic, subj) => {
          setIsSyllabusModalOpen(false);
          setActivePlayerTask({
            topicTitle: topic.title,
            subject: subj,
            taskType: 'video',
          });
          setIsPlayerOpen(true);
        }}
        onLaunchTopicNotes={(topic, subj) => {
          setIsSyllabusModalOpen(false);
          setActivePlayerTask({
            topicTitle: topic.title,
            subject: subj,
            taskType: 'notes',
          });
          setIsPlayerOpen(true);
        }}
        onLaunchTopicQuiz={(topic, subj) => {
          setIsSyllabusModalOpen(false);
          launchTopicCbtTest(topic.title, subj);
        }}
      />
          {/* TutO AI-Powered Nano Content Player Modal */}
      {activeNanoTask && (
        <TeachONanoPlayerModal
          visible={isNanoPlayerOpen}
          onClose={() => setIsNanoPlayerOpen(false)}
          courseId={selectedCourse.id}
          courseTitle={selectedCourse.title}
          subject={activeNanoTask.subject}
          topicTitle={activeNanoTask.topicTitle}
          tamilTopicTitle={activeNanoTask.tamilTopicTitle}
          conceptCode={activeNanoTask.conceptCode}
          keyFormulaOrRule={activeNanoTask.keyFormulaOrRule}
          dayNumber={currentDay}
          stepNumber={activeNanoTask.taskNumber || 1}
          initialTab={activeNanoTask.initialTab || 'lecture'}
          onCompleteTask={(xp) => {
            setCompletedTasksForCurrentDay(prev => Math.min(5, prev + 1));
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070C18',
  },
  header: {
    backgroundColor: '#0E172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 12,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandLogoBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
    borderWidth: 1,
    borderColor: '#00D084',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 0.5,
  },
  proBadge: {
    backgroundColor: '#00D084',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  proBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#070C18',
  },
  brandSubtitle: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 8,
  },
  streakText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F59E0B',
  },
  passBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1E293B',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  passBtnActive: {
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
    borderColor: '#00D084',
  },
  passBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F59E0B',
  },
  courseSelectorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#131F37',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  courseSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  courseIconBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseSelectorLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#00D084',
    letterSpacing: 0.5,
  },
  courseSelectorTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  boardSelectorContainer: {
    backgroundColor: '#0c1322',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 8,
  },
  boardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  boardHeaderLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#00D084',
    letterSpacing: 0.5,
  },
  mediumPillBadge: {
    backgroundColor: '#00D08418',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#00D08450',
  },
  mediumPillText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#00D084',
  },
  boardRow: {
    flexDirection: 'row',
    gap: 6,
  },
  boardOptionPill: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 4,
    backgroundColor: '#131d31',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boardOptionPillActive: {
    backgroundColor: '#00D08420',
    borderColor: '#00D084',
  },
  boardOptionText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
    textAlign: 'center',
  },
  boardOptionTextActive: {
    color: '#00D084',
    fontWeight: '800',
  },
  changeCoursePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  changeCourseText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00D084',
  },
  modeSwitcherBar: {
    flexDirection: 'row',
    backgroundColor: '#131F37',
    borderRadius: 10,
    padding: 3,
    gap: 4,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 7,
    borderRadius: 8,
  },
  modeTabActive: {
    backgroundColor: '#0E172A',
    borderWidth: 1,
    borderColor: '#00D084',
  },
  modeTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  modeTabTextActive: {
    color: '#00D084',
    fontWeight: '800',
  },
  contentScroll: {
    flex: 1,
  },
  studyModeContainer: {
    paddingTop: 10,
    gap: 14,
  },
  quickTestBanner: {
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#131F37',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  quickTestLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  quickTestIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickTestTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  quickTestSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  quickTestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  quickTestBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#070C18',
  },
  adminFloatingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#00D084',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-end',
    marginBottom: 6,
    shadowColor: '#00D084',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  adminFloatingPillText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#070C18',
  },
  syllabusCard: {
    marginHorizontal: 16,
    backgroundColor: '#0E172A',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 8,
  },
  syllabusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  syllabusTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  viewAllLink: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00D084',
  },
  syllabusSubBadge: {
    fontSize: 10,
    color: '#00D084',
    fontWeight: '700',
    marginTop: 1,
  },
  syllabusAccessTag: {
    backgroundColor: '#131F37',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  syllabusAccessTagText: {
    fontSize: 10,
    fontWeight: '800',
  },
  syllabusDesc: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
  },
  openCurriculumBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#131F37',
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginTop: 4,
  },
  openCurriculumBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00D084',
  },
  testModeContainer: {
    padding: 16,
    gap: 14,
  },
  passProHero: {
    backgroundColor: '#0E172A',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#00D084',
    gap: 12,
  },
  passProHeroContent: {
    gap: 6,
  },
  passProHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  passProTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#00D084',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  passProTagText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#070C18',
  },
  passProPrice: {
    fontSize: 14,
    fontWeight: '900',
    color: '#00D084',
  },
  passProTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  passProSub: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
  },
  passProActionBtn: {
    backgroundColor: '#00D084',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  passProActionBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#070C18',
  },
  testSubTabBar: {
    flexDirection: 'row',
  },
  testSubTabItem: {
    backgroundColor: '#0E172A',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginRight: 8,
  },
  testSubTabItemActive: {
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
    borderColor: '#00D084',
  },
  testSubTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  testSubTabTextActive: {
    color: '#00D084',
    fontWeight: '800',
  },
  testCardList: {
    gap: 12,
  },
  testCard: {
    backgroundColor: '#0E172A',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 10,
  },
  testCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  testBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  testBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#00D084',
  },
  attemptsText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  testTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
    lineHeight: 18,
  },
  testMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
  },
  testCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  freePill: {
    backgroundColor: 'rgba(0, 208, 132, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  freePillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#00D084',
  },
  startTestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#00D084',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  startTestBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#070C18',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  passProModalContainer: {
    backgroundColor: '#0E172A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  planCard: {
    backgroundColor: '#131F37',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#00D084',
    gap: 6,
    marginBottom: 14,
  },
  planTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#00D084',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  planTagText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#070C18',
  },
  planName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  planPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: '#00D084',
  },
  planFeature: {
    fontSize: 11,
    color: '#CBD5E1',
    fontWeight: '500',
  },
  activatePassBtn: {
    backgroundColor: '#00D084',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  activatePassBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#070C18',
  },
});
