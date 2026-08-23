import React, { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Linking,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ShieldCheck, Sparkles, ChevronRight, Unlock, Lock, ShoppingCart, BellRing } from 'lucide-react-native';
import { AppContext } from '../context/AppContext';

import { TeachOHeader } from '../components/teacho/TeachOHeader';
import { TeachOTodayHero } from '../components/teacho/TeachOTodayHero';
import { TeachORoutineSteps, RoutineTask } from '../components/teacho/TeachORoutineSteps';
import { TeachOQuickHub } from '../components/teacho/TeachOQuickHub';
import { TeachOCoursePickerSheet } from '../components/teacho/TeachOCoursePickerSheet';
import TeachOCoursePlayerModal from '../components/TeachOCoursePlayerModal';
import PaymentQRModal from '../components/PaymentQRModal';

import { ALL_COURSES, DEFAULT_COURSE, CourseOption } from '../data/coursesCatalog';
import { getDayPlanForCourse } from '../lib/dailyPlanResolver';
import { resolveMasterCurriculumPlan, DayPlan } from '../data/curriculum';
import { getCoursePlayerContent } from '../lib/coursePlayerEngine';
import TeachOWhatsAppService from '../services/TeachOWhatsAppService';
import purchaseService from '../services/purchaseService';
import NotificationService from '../services/NotificationService';

export default function TeachOScreen() {
  const navigation = useNavigation<any>();
  const { user, userRole, profile } = useContext(AppContext) || {};

  // Admin access validation: if user role is admin, phone is admin, or profile is admin
  const isAdmin = Boolean(
    user?.isAdmin ||
    userRole === 'admin' ||
    profile?.role === 'admin' ||
    (user?.phone && ['6381029380', '9876543210', '9486335870'].includes(user.phone.replace(/\D/g, '').slice(-10)))
  );

  // ─── Active Single-Course State ───────────────────────────────────────────
  const [selectedCourse, setSelectedCourse] = useState<CourseOption>(DEFAULT_COURSE);
  const [isCoursePickerOpen, setIsCoursePickerOpen] = useState(false);

  // ─── Purchase & Unlock State ──────────────────────────────────────────────
  const [isCoursePurchased, setIsCoursePurchased] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const isFullAccess = isAdmin || isCoursePurchased;

  // ─── Progress & Gamification State ────────────────────────────────────────
  const [currentDay, setCurrentDay] = useState(1);
  const [totalDays, setTotalDays] = useState(200);
  const [streak, setStreak] = useState(1);
  const [xp, setXp] = useState(50);
  const [completedTasksMap, setCompletedTasksMap] = useState<{ [dayKey: string]: number }>({});

  // ─── Day Plan & Player State ──────────────────────────────────────────────
  const [activeDayPlan, setActiveDayPlan] = useState<DayPlan | null>(() => {
    return resolveMasterCurriculumPlan(ALL_COURSES[0], 1);
  });
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [activePlayerTask, setActivePlayerTask] = useState<{
    topicTitle: string;
    subject: string;
    taskType: string;
    taskNumber?: number;
  } | null>(null);

  // Load user saved course, purchase status & progress on mount
  useEffect(() => {
    async function loadInitialProgress() {
      try {
        const savedCourseId = await AsyncStorage.getItem('teacho_active_enrolled_course_id');
        if (savedCourseId) {
          const matched = ALL_COURSES.find((c) => c.id === savedCourseId);
          if (matched) {
            setSelectedCourse(matched);
            setActiveDayPlan(resolveMasterCurriculumPlan(matched, matched.currentDayDefault || 1));
          }
        }

        const savedStreak = await AsyncStorage.getItem('teacho_user_streak');
        if (savedStreak) setStreak(parseInt(savedStreak, 10));

        const savedXp = await AsyncStorage.getItem('teacho_user_xp');
        if (savedXp) setXp(parseInt(savedXp, 10));

        const savedTasksProgress = await AsyncStorage.getItem('teacho_completed_tasks_map');
        if (savedTasksProgress) setCompletedTasksMap(JSON.parse(savedTasksProgress));

        // Check if course is already purchased
        const purchased = await purchaseService.isItemPurchased(user?.id, selectedCourse.id, 'course');
        setIsCoursePurchased(purchased);

        // Schedule auto daily study reminder
        NotificationService.scheduleDailyStudyReminder(8, 0, selectedCourse.title);
      } catch (e) {
        console.warn('Error loading TeachO saved progress:', e);
      }
    }
    loadInitialProgress();
  }, [selectedCourse.id, user?.id]);

  // Sync course specifics when selectedCourse changes
  useEffect(() => {
    setTotalDays(selectedCourse.totalDays || 200);
    const dayToUse = selectedCourse.currentDayDefault || 1;
    setCurrentDay(dayToUse);
    setActiveDayPlan(resolveMasterCurriculumPlan(selectedCourse, dayToUse));

    purchaseService.isItemPurchased(user?.id, selectedCourse.id, 'course').then(setIsCoursePurchased);
  }, [selectedCourse, user?.id]);

  // Fetch dynamic day plan for active course & day synchronously (0ms)
  useEffect(() => {
    try {
      const plan = resolveMasterCurriculumPlan(selectedCourse, currentDay);
      setActiveDayPlan(plan);
    } catch (e) {
      console.warn('Error loading day plan:', e);
    }
  }, [selectedCourse, currentDay]);

  // Pre-fetch content for all daily tasks in background (instant player opens)
  useEffect(() => {
    if (!activeDayPlan || !activeDayPlan.tasks || activeDayPlan.tasks.length === 0) return;
    activeDayPlan.tasks.forEach((task, idx) => {
      getCoursePlayerContent(
        task.topic,
        task.subject,
        selectedCourse.title,
        currentDay,
        selectedCourse.id,
        false,
        idx + 1
      ).catch(() => {});
    });
  }, [activeDayPlan, selectedCourse, currentDay]);

  // Number of completed tasks for the current day
  const currentDayKey = `${selectedCourse.id}_day_${currentDay}`;
  const completedTasksForCurrentDay = completedTasksMap[currentDayKey] ?? (currentDay === 1 ? 1 : 0);

  // Build clean 4-to-5 step routine tasks list from authentic syllabus
  const routineTasks: RoutineTask[] = useMemo(() => {
    if (activeDayPlan && activeDayPlan.tasks && activeDayPlan.tasks.length > 0) {
      return activeDayPlan.tasks.map((taskItem, index) => {
        let taskType: 'video' | 'notes' | 'quiz' | 'code' = 'notes';
        if (taskItem.taskType === 'video' || index === 1) taskType = 'video';
        else if (taskItem.taskType === 'practice' || taskItem.taskType === 'test' || index === 2) taskType = 'quiz';
        else if (taskItem.taskType === 'activity' || index === 3) taskType = 'code';

        let status: 'completed' | 'in_progress' | 'locked' = 'locked';
        if (index < completedTasksForCurrentDay) {
          status = 'completed';
        } else if (index === completedTasksForCurrentDay || isFullAccess) {
          status = 'in_progress';
        }

        return {
          id: `task-${index + 1}`,
          type: taskType,
          stepNumber: index + 1,
          duration: `${taskItem.durationMinutes || 20} Min`,
          title: (taskItem.topic || '').startsWith(taskItem.subject) ? taskItem.topic : `${taskItem.subject}: ${taskItem.topic}`,
          subtitle: `${taskItem.subject} • Day ${currentDay} Period ${index + 1}`,
          rawTopic: taskItem.topic,
          rawSubject: taskItem.subject,
          status,
          xp: 20,
          actionLabel: status === 'completed' ? 'Review' : (status === 'in_progress' || isFullAccess) ? (isFullAccess ? 'Open 🔓' : 'Start') : 'Locked',
        };
      });
    }

    return [];
  }, [activeDayPlan, completedTasksForCurrentDay, currentDay, isFullAccess]);

  // Find active task (in progress) for the Hero card
  const currentTask = useMemo(() => {
    return routineTasks.find((t) => t.status === 'in_progress') || routineTasks[0];
  }, [routineTasks]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleSelectCourse = async (course: CourseOption) => {
    setSelectedCourse(course);
    setIsCoursePickerOpen(false);
    try {
      await AsyncStorage.setItem('teacho_active_enrolled_course_id', course.id);
    } catch (e) {}
  };

  const handleTaskPress = (task: RoutineTask) => {
    if (task.status === 'locked' && !isFullAccess) {
      Alert.alert(
        'Step Locked 🔒',
        'Please complete the previous step to unlock this lesson or unlock Full Course Master Access!',
        [
          { text: 'Unlock Course Pass (₹499)', onPress: () => setIsPaymentModalOpen(true) },
          { text: 'OK', style: 'cancel' },
        ]
      );
      return;
    }

    setActivePlayerTask({
      topicTitle: task.rawTopic || task.title,
      subject: task.rawSubject || selectedCourse.title,
      taskType: task.type,
      taskNumber: task.stepNumber || 1,
    });
    setIsPlayerOpen(true);
  };

  const handlePrimaryHeroAction = () => {
    if (currentTask) {
      handleTaskPress(currentTask);
    }
  };

  const handleFinishLesson = async (earnedXp: number = 20) => {
    const nextCompleted = Math.min(routineTasks.length, completedTasksForCurrentDay + 1);
    const updatedMap = {
      ...completedTasksMap,
      [currentDayKey]: nextCompleted,
    };
    setCompletedTasksMap(updatedMap);

    const newXp = xp + earnedXp;
    setXp(newXp);

    try {
      await AsyncStorage.setItem('teacho_completed_tasks_map', JSON.stringify(updatedMap));
      await AsyncStorage.setItem('teacho_user_xp', newXp.toString());
    } catch (e) {}

    setIsPlayerOpen(false);
    
    // Auto push notification alert for completion & next step
    NotificationService.triggerSessionAlert(
      selectedCourse.title,
      currentDay,
      nextCompleted,
      routineTasks[nextCompleted - 1]?.title || 'Next Lesson'
    );
  };

  // ─── Contextual AI Helper & TestO Deep-Linking ───────────────────────────
  const navigateToAiTutor = (promptText: string, topic?: string, subject?: string) => {
    if (!navigation || typeof navigation.navigate !== 'function') {
      Alert.alert('AI Homework Tutor 🤖', promptText);
      return;
    }
    try {
      navigation.navigate('AishleeToolsScreen', {
        initialPrompt: promptText,
        topic: topic || selectedCourse.title,
        subject: subject || selectedCourse.title,
        tool: 'Notes Maker',
        autoRun: true,
      });
      return;
    } catch (e) {}

    try {
      navigation.navigate('AIBot', {
        initialPrompt: promptText,
        topic: topic || selectedCourse.title,
        subject: subject || selectedCourse.title,
      });
      return;
    } catch (e) {}
  };

  const navigateToTestO = (queryText: string, topic?: string) => {
    if (!navigation || typeof navigation.navigate !== 'function') {
      Alert.alert('TestO Live Tests 📝', `Tests for: ${queryText}`);
      return;
    }
    try {
      navigation.navigate('TestOHubScreen', {
        searchQuery: queryText,
        topic: topic || queryText,
        courseTitle: selectedCourse.title,
        day: currentDay,
      });
      return;
    } catch (e) {}

    try {
      navigation.navigate('TestOTab', {
        searchQuery: queryText,
        topic: topic || queryText,
      });
      return;
    } catch (e) {}
  };

  const handleAskAiForStep = (task: RoutineTask) => {
    const prompt = `I am studying "${task.rawSubject || selectedCourse.title}" - Topic: "${task.rawTopic || task.title}" (Day ${currentDay}, Step ${task.stepNumber || 1} of course "${selectedCourse.title}"). Please explain this topic step-by-step with key concepts, rules/formulas, practical examples, and 3 high-yield exam tips in Tamil & English.`;
    navigateToAiTutor(prompt, task.rawTopic || task.title, task.rawSubject || selectedCourse.title);
  };

  const handleTakeTestForStep = (task: RoutineTask) => {
    const topic = task.rawTopic || task.title;
    const subject = task.rawSubject || selectedCourse.title;
    try {
      navigation.navigate('TestOExamScreen', {
        testId: `${selectedCourse.id}_day${currentDay}_step${task.stepNumber || 1}`,
        title: `${subject}: ${topic}`,
        topicTitle: topic,
        subject: subject,
        courseTitle: selectedCourse.title,
        day: currentDay,
        questionCount: 10,
        markingScheme: '+4 / -1',
      });
    } catch (e) {
      navigateToTestO(topic, topic);
    }
  };

  const handleOpenAiTutor = () => {
    const prompt = `Explain today's Day ${currentDay} curriculum for "${selectedCourse.title}": Focus topic "${activeDayPlan?.themeTitle || selectedCourse.phaseTitle || 'Core Lessons'}". Please provide study notes, key formulas, and exam tips in Tamil & English.`;
    navigateToAiTutor(prompt, activeDayPlan?.themeTitle, selectedCourse.title);
  };

  const handleOpenTestO = () => {
    navigateToTestO(selectedCourse.title, activeDayPlan?.themeTitle);
  };

  // ─── WhatsApp CRM Daily Routine & Active Session Sync ─────────────────────
  const handleSendWhatsAppAlert = async () => {
    const studentPhone = user?.phone || profile?.phone || '9486335870';
    const studentName = user?.name || profile?.full_name || 'Learner';

    const result = await TeachOWhatsAppService.sendDayPlanAlert({
      studentPhone,
      studentName,
      course: selectedCourse,
      currentDay,
      totalDays,
      activeDayPlan,
      streak,
      xp,
    });

    if (result.success) {
      Alert.alert('WhatsApp CRM Alert Dispatched 📲', result.message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1120" />

      {/* 1. TOP HEADER & COURSE SWITCHER */}
      <TeachOHeader
        courseTitle={selectedCourse.short || selectedCourse.title}
        fullCourseName={selectedCourse.title}
        gradeBadge={selectedCourse.badge || 'Tuition'}
        gradeColor={selectedCourse.badgeColor || '#06b6d4'}
        currentDay={currentDay}
        totalDays={totalDays}
        streak={streak}
        xp={xp}
        isPurchased={isFullAccess}
        price={499}
        originalPrice={2999}
        onOpenCoursePicker={() => setIsCoursePickerOpen(true)}
        onOpenPurchase={() => setIsPaymentModalOpen(true)}
        onOpenSyllabus={() => navigation.navigate('TeachOCourseScreen', { course: selectedCourse })}
      />

      {/* 2. SCROLLABLE CLEAN MAIN FEED */}
      <ScrollView
        style={styles.feedScroll}
        contentContainerStyle={styles.feedContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 👑 ADMIN MASTER ACCESS OR PREMIUM UNLOCK BANNER */}
        {isFullAccess ? (
          <View style={styles.adminBannerCard}>
            <View style={styles.adminBannerHeader}>
              <View style={styles.adminBadgeRow}>
                <View style={styles.adminIconBox}>
                  <ShieldCheck size={16} color="#fbbf24" />
                </View>
                <Text style={styles.adminBadgeTitle}>
                  {isAdmin ? 'ADMIN MASTER ACCESS' : 'PREMIUM FULL ACCESS UNLOCKED'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.adminSyllabusTag}
                onPress={() => navigation.navigate('TeachOCourseScreen', { course: selectedCourse })}
                activeOpacity={0.8}
              >
                <Unlock size={12} color="#10b981" />
                <Text style={styles.adminTagText}>📖 Full Course Syllabus</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.adminBannerDesc}>
              Full learning access enabled. Jump to any day from Day 1 to Day {totalDays} or explore complete chapter-wise syllabus.
            </Text>

            {/* Quick Day Navigator Pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.adminDayScroll} contentContainerStyle={styles.adminDayScrollContent}>
              {[1, 2, 5, 10, 15, 20, 30, 50, 75, 100, 150, totalDays].filter((d, i, arr) => d <= totalDays && arr.indexOf(d) === i).map((d) => (
                <TouchableOpacity
                  key={`admin-day-${d}`}
                  style={[styles.adminDayPill, currentDay === d && styles.adminDayPillActive]}
                  onPress={() => setCurrentDay(d)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.adminDayPillText, currentDay === d && styles.adminDayPillTextActive]}>
                    Day {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.unlockPromoCard}
            onPress={() => setIsPaymentModalOpen(true)}
            activeOpacity={0.85}
          >
            <View style={styles.unlockPromoIconBox}>
              <ShoppingCart size={18} color="#fbbf24" />
            </View>
            <View style={styles.unlockPromoContent}>
              <View style={styles.unlockPromoTitleRow}>
                <Text style={styles.unlockPromoTitle}>Unlock Full {totalDays}-Day Master Access</Text>
                <View style={styles.priceTag}>
                  <Text style={styles.priceTagText}>₹499</Text>
                </View>
              </View>
              <Text style={styles.unlockPromoDesc}>
                Instant 1-Tap UPI Pay with GPay/PhonePe or use coupon code. Unlocks all {totalDays} days immediately!
              </Text>
            </View>
            <ChevronRight size={18} color="#fbbf24" />
          </TouchableOpacity>
        )}

        {/* HERO: Today's Mission & 1-Tap CTA */}
        <TeachOTodayHero
          currentDay={currentDay}
          totalDays={totalDays}
          themeTitle={activeDayPlan ? activeDayPlan.themeTitle : selectedCourse.phaseTitle}
          completedTasksCount={completedTasksForCurrentDay}
          totalTasksCount={routineTasks.length}
          currentTaskTitle={currentTask?.title}
          currentTaskDuration={currentTask?.duration}
          onPressPrimaryAction={handlePrimaryHeroAction}
          parentTip={selectedCourse.parentGuidance}
        />

        {/* 4-STEP SEQUENTIAL ROUTINE WITH 1-TAP AI & TEST DEEP-LINKS */}
        <TeachORoutineSteps
          currentDay={currentDay}
          totalDays={totalDays}
          tasks={routineTasks}
          onSelectDay={(day) => setCurrentDay(day)}
          onTaskPress={handleTaskPress}
          onAskAi={handleAskAiForStep}
          onTakeTest={handleTakeTestForStep}
        />

        {/* QUICK HUB: AI Doubt Tutor, TestO Tests & WhatsApp CRM Alerts */}
        <TeachOQuickHub
          onOpenAiTutor={handleOpenAiTutor}
          onOpenTestO={handleOpenTestO}
          onOpenNotes={() => navigation.navigate('TeachOCourseScreen', { course: selectedCourse })}
          onSendWhatsAppAlert={handleSendWhatsAppAlert}
          isWhatsAppAlertEnabled={true}
        />
      </ScrollView>

      {/* 3. COURSE PICKER BOTTOM SHEET */}
      <TeachOCoursePickerSheet
        visible={isCoursePickerOpen}
        courses={ALL_COURSES}
        selectedCourseId={selectedCourse.id}
        onClose={() => setIsCoursePickerOpen(false)}
        onSelectCourse={handleSelectCourse}
      />

      {/* 4. IN-APP VIDEO & ACADEMIC COURSE PLAYER MODAL */}
      <TeachOCoursePlayerModal
        visible={isPlayerOpen}
        topicTitle={activePlayerTask?.topicTitle || 'Micro-Topic Masterclass'}
        subject={activePlayerTask?.subject || selectedCourse.title}
        courseTitle={selectedCourse.title}
        dayNumber={currentDay}
        courseId={selectedCourse.id}
        taskNumber={activePlayerTask?.taskNumber}
        onClose={() => setIsPlayerOpen(false)}
        onCompleteTask={handleFinishLesson}
      />

      {/* 5. UPI PAYMENT & COURSE UNLOCK MODAL */}
      <PaymentQRModal
        visible={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={() => {
          setIsCoursePurchased(true);
        }}
        title={`${selectedCourse.title} (Full ${totalDays} Days)`}
        amount={499}
        itemId={selectedCourse.id}
        itemType="course"
        userId={user?.id || 'guest-user'}
        userName={user?.name || profile?.full_name || 'Learner'}
        userPhone={user?.phone || profile?.phone || '9486335870'}
        upiId="9486335870@hdfcbank"
        payeeName="AISHLEE TECHNOLOGY"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1120',
  },
  feedScroll: {
    flex: 1,
  },
  feedContent: {
    paddingBottom: 40,
  },
  adminBannerCard: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    backgroundColor: '#131c31',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.35)',
    gap: 8,
  },
  adminBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  adminBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  adminIconBox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminBadgeTitle: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  adminTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  adminSyllabusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(6, 182, 212, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.4)',
  },
  adminTagText: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: '700',
  },
  adminBannerDesc: {
    color: '#94a3b8',
    fontSize: 11,
    lineHeight: 16,
  },
  adminDayScroll: {
    marginTop: 4,
  },
  adminDayScrollContent: {
    gap: 6,
    paddingVertical: 2,
  },
  adminDayPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  adminDayPillActive: {
    backgroundColor: '#fbbf24',
    borderColor: '#fbbf24',
  },
  adminDayPillText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
  },
  adminDayPillTextActive: {
    color: '#0B1120',
    fontWeight: '900',
  },
  unlockPromoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131e32',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.4)',
    gap: 10,
  },
  unlockPromoIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockPromoContent: {
    flex: 1,
  },
  unlockPromoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  unlockPromoTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },
  priceTag: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  priceTagText: {
    color: '#0B1120',
    fontSize: 10,
    fontWeight: '900',
  },
  unlockPromoDesc: {
    fontSize: 10,
    color: '#94a3b8',
    lineHeight: 14,
  },
});
