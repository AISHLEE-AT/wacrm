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
import { ShieldCheck, Sparkles, ChevronRight, Unlock } from 'lucide-react-native';
import { AppContext } from '../context/AppContext';

import { TeachOHeader } from '../components/teacho/TeachOHeader';
import { TeachOTodayHero } from '../components/teacho/TeachOTodayHero';
import { TeachORoutineSteps, RoutineTask } from '../components/teacho/TeachORoutineSteps';
import { TeachOQuickHub } from '../components/teacho/TeachOQuickHub';
import { TeachOCoursePickerSheet } from '../components/teacho/TeachOCoursePickerSheet';
import TeachOCoursePlayerModal from '../components/TeachOCoursePlayerModal';

import { ALL_COURSES, DEFAULT_COURSE, CourseOption } from '../data/coursesCatalog';
import { getDayPlanForCourse, DayPlan } from '../lib/dailyPlanResolver';
import { getCoursePlayerContent } from '../lib/coursePlayerEngine';

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

  // ─── Progress & Gamification State ────────────────────────────────────────
  const [currentDay, setCurrentDay] = useState(1);
  const [totalDays, setTotalDays] = useState(200);
  const [streak, setStreak] = useState(1);
  const [xp, setXp] = useState(50);
  const [completedTasksMap, setCompletedTasksMap] = useState<{ [dayKey: string]: number }>({});

  // ─── Day Plan & Player State ──────────────────────────────────────────────
  const [activeDayPlan, setActiveDayPlan] = useState<DayPlan | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [activePlayerTask, setActivePlayerTask] = useState<{
    topicTitle: string;
    subject: string;
    taskType: string;
    taskNumber?: number;
  } | null>(null);

  // Load user saved course and progress on initial mount
  useEffect(() => {
    async function loadInitialProgress() {
      try {
        const savedCourseId = await AsyncStorage.getItem('teacho_active_enrolled_course_id');
        if (savedCourseId) {
          const matched = ALL_COURSES.find((c) => c.id === savedCourseId);
          if (matched) setSelectedCourse(matched);
        }

        const savedStreak = await AsyncStorage.getItem('teacho_user_streak');
        if (savedStreak) setStreak(parseInt(savedStreak, 10));

        const savedXp = await AsyncStorage.getItem('teacho_user_xp');
        if (savedXp) setXp(parseInt(savedXp, 10));

        const savedTasksProgress = await AsyncStorage.getItem('teacho_completed_tasks_map');
        if (savedTasksProgress) setCompletedTasksMap(JSON.parse(savedTasksProgress));
      } catch (e) {
        console.warn('Error loading TeachO saved progress:', e);
      }
    }
    loadInitialProgress();
  }, []);

  // Sync course specifics when selectedCourse changes
  useEffect(() => {
    setTotalDays(selectedCourse.totalDays || 200);
    setCurrentDay(selectedCourse.currentDayDefault || 1);
  }, [selectedCourse]);

  // Fetch dynamic day plan for active course & day
  useEffect(() => {
    let isMounted = true;
    async function fetchPlan() {
      try {
        const plan = await getDayPlanForCourse(selectedCourse as any, selectedCourse.category, currentDay);
        if (isMounted && plan) {
          setActiveDayPlan(plan);
        }
      } catch (e) {
        console.warn('Error loading day plan:', e);
      }
    }
    fetchPlan();
    return () => {
      isMounted = false;
    };
  }, [selectedCourse, currentDay]);

  // Pre-fetch content for all daily tasks in background (instant player opens)
  useEffect(() => {
    if (!activeDayPlan || !activeDayPlan.tasks || activeDayPlan.tasks.length === 0) return;
    // Fire-and-forget: pre-warm content cache for all tasks of the current day
    activeDayPlan.tasks.forEach((task) => {
      getCoursePlayerContent(
        task.topic,
        task.subject,
        selectedCourse.title,
        currentDay,
        false // don't trigger AI generation, just check cache/DB
      ).catch(() => {});
    });
  }, [activeDayPlan, selectedCourse, currentDay]);

  // Number of completed tasks for the current day
  const currentDayKey = `${selectedCourse.id}_day_${currentDay}`;
  const completedTasksForCurrentDay = completedTasksMap[currentDayKey] ?? (currentDay === 1 ? 1 : 0);

  // Build clean 4-step routine tasks list
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
        } else if (index === completedTasksForCurrentDay || isAdmin) {
          status = 'in_progress';
        }

        return {
          id: `task-${index}`,
          type: taskType,
          duration: `${taskItem.durationMinutes || 12} Min`,
          title: `${taskItem.subject}: ${taskItem.topic}`,
          subtitle: `${taskItem.subject} lesson for Day ${currentDay}`,
          rawTopic: taskItem.topic,
          rawSubject: taskItem.subject,
          status,
          xp: 20,
          actionLabel: status === 'completed' ? 'Review' : (status === 'in_progress' || isAdmin) ? (isAdmin ? 'Open 🔓' : 'Start') : 'Locked',
        };
      });
    }

    // Fallback standard 4 subjects
    const fallbackSubjects = [
      { sub: 'Mathematics', title: 'Number Magic & Counting (1 to 20)', dur: '15 Min', type: 'notes' as const },
      { sub: 'Science & EVS', title: 'My Amazing Body & Five Senses', dur: '12 Min', type: 'video' as const },
      { sub: 'Tamil Literature', title: 'உயிர் எழுத்துகள் & ஆத்திசூடி பாடல்', dur: '10 Min', type: 'notes' as const },
      { sub: 'Creative Lab', title: 'Hands-on Activity & Bedtime Recap', dur: '10 Min', type: 'quiz' as const },
    ];

    return fallbackSubjects.map((item, index) => {
      let status: 'completed' | 'in_progress' | 'locked' = 'locked';
      if (index < completedTasksForCurrentDay) {
        status = 'completed';
      } else if (index === completedTasksForCurrentDay || isAdmin) {
        status = 'in_progress';
      }

      return {
        id: `fb-task-${index}`,
        type: item.type,
        duration: item.dur,
        title: `${item.sub}: ${item.title}`,
        subtitle: `${item.sub} Day ${currentDay} lesson`,
        rawTopic: item.title,
        rawSubject: item.sub,
        status,
        xp: 20,
        actionLabel: status === 'completed' ? 'Review' : (status === 'in_progress' || isAdmin) ? (isAdmin ? 'Open 🔓' : 'Start') : 'Locked',
      };
    });
  }, [activeDayPlan, completedTasksForCurrentDay, currentDay, isAdmin]);

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
    if (task.status === 'locked' && !isAdmin) {
      Alert.alert(
        'Step Locked 🔒',
        'Please complete the previous step to unlock this lesson and earn bonus XP!'
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
    Alert.alert(
      'Lesson Completed! 🌟',
      `Awesome work! You earned +${earnedXp} XP. Step ${nextCompleted} of ${routineTasks.length} is ready!`
    );
  };

  const handleOpenAiTutor = () => {
    if (navigation && typeof navigation.navigate === 'function') {
      try {
        navigation.navigate('AIHubScreen');
        return;
      } catch (e) {}
    }
    Alert.alert('AI Homework Tutor 🤖', 'Ask any doubt in Tamil or English for instant step-by-step guidance.');
  };

  const handleOpenTestO = () => {
    if (navigation && typeof navigation.navigate === 'function') {
      try {
        navigation.navigate('TestOScreen');
        return;
      } catch (e) {}
    }
    Alert.alert('TestO Mock Tests 📝', 'Chapter mock tests and daily practice quizzes are active for your course.');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1120" />

      {/* 1. TOP HEADER & COURSE SWITCHER */}
      <TeachOHeader
        courseTitle={selectedCourse.short || selectedCourse.title}
        gradeBadge={selectedCourse.badge || 'Tuition'}
        gradeColor={selectedCourse.badgeColor || '#06b6d4'}
        currentDay={currentDay}
        totalDays={totalDays}
        streak={streak}
        xp={xp}
        onOpenCoursePicker={() => setIsCoursePickerOpen(true)}
      />

      {/* 2. SCROLLABLE CLEAN MAIN FEED */}
      <ScrollView
        style={styles.feedScroll}
        contentContainerStyle={styles.feedContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 👑 ADMIN MASTER ACCESS BANNER */}
        {isAdmin && (
          <View style={styles.adminBannerCard}>
            <View style={styles.adminBannerHeader}>
              <View style={styles.adminBadgeRow}>
                <View style={styles.adminIconBox}>
                  <ShieldCheck size={16} color="#fbbf24" />
                </View>
                <Text style={styles.adminBadgeTitle}>ADMIN MASTER ACCESS</Text>
              </View>
              <View style={styles.adminTag}>
                <Unlock size={12} color="#10b981" />
                <Text style={styles.adminTagText}>All {totalDays} Days Unlocked</Text>
              </View>
            </View>

            <Text style={styles.adminBannerDesc}>
              Full administrative privileges enabled. You can jump to any day and open every lesson without progression locks.
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

        {/* 4-STEP SEQUENTIAL ROUTINE */}
        <TeachORoutineSteps
          currentDay={currentDay}
          totalDays={totalDays}
          tasks={routineTasks}
          onSelectDay={(day) => setCurrentDay(day)}
          onTaskPress={handleTaskPress}
        />

        {/* QUICK HUB: AI Doubt Tutor & TestO Tests */}
        <TeachOQuickHub
          onOpenAiTutor={handleOpenAiTutor}
          onOpenTestO={handleOpenTestO}
          onOpenNotes={() => Alert.alert('Study Notes 📚', 'Chapter summary notes and formula sheets are available inside each lesson!')}
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
});
