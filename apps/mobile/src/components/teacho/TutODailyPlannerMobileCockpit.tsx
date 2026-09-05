import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Sparkles,
  CheckCircle2,
  Circle,
  Play,
  Clock,
  Award,
  Zap,
  BookOpen,
  Heart,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Flame,
  Star,
  Send,
  Calendar,
  X,
  Target,
  ShieldCheck,
  Check,
} from 'lucide-react-native';

import { CourseOption, SchoolBoard } from '../../data/coursesCatalog';
import { generateUniqueTenClassesForDay, DayClassItem, DayYogaPlan, DayTestPlan } from '../../data/curriculum/curriculum365Engine';

const { width } = Dimensions.get('window');

export const AMBITION_FEATURE_TRACKS = [
  {
    id: 'jr-ias',
    title: 'IAS (Civil Servant)',
    short: 'JrIAS',
    roleTag: 'District Collector & Polity',
    desc: 'Indian Constitution, Public Policy & District Administration',
    icon: '🏛️',
  },
  {
    id: 'jr-ar',
    title: 'Auditor (Chartered Accountant)',
    short: 'JrAuditor',
    roleTag: 'CA & Corporate Finance',
    desc: 'Double-Entry Bookkeeping, Financial Statements, GST & Auditing Standards',
    icon: '📊',
  },
  {
    id: 'jr-dr',
    title: 'Doctor (Medical Sciences)',
    short: 'JrDoctor',
    roleTag: 'Clinical Biology & NEET',
    desc: 'Human Anatomy, Major Organ Systems, First Aid & Clinical Diagnostics',
    icon: '🩺',
  },
  {
    id: 'jr-er',
    title: 'Engineer (Robotics & AI)',
    short: 'JrEngineer',
    roleTag: 'Coding, AI & Robotics',
    desc: 'Algorithms, Circuit Analysis, Embedded Robotics & Applied Physics',
    icon: '💻',
  },
  {
    id: 'jr-ips',
    title: 'Police (Law & Forensics)',
    short: 'JrIPS',
    roleTag: 'Criminology & Public Safety',
    desc: 'Forensics, Cyber Crime Investigation, Law & Tactical Leadership',
    icon: '👮',
  },
  {
    id: 'jr-ceo',
    title: 'CEO (Entrepreneur)',
    short: 'JrCEO',
    roleTag: 'Startup & Business Leader',
    desc: 'Venture Creation, Unit Economics, Marketing & Pitch Decks',
    icon: '🚀',
  },
  {
    id: 'jr-scientist',
    title: 'Scientist (ISRO / Space)',
    short: 'JrScientist',
    roleTag: 'Space Tech & Deep Physics',
    desc: 'Rocket Propulsion, Satellite Systems & Planetary Science',
    icon: '🔬',
  },
  {
    id: 'jr-judge',
    title: 'Judge (Judiciary & Law)',
    short: 'JrJudge',
    roleTag: 'Justice & Legal Master',
    desc: 'Constitutional Rights, Courtroom Ethics & Landmark Case Analysis',
    icon: '⚖️',
  },
];

interface TutODailyPlannerMobileCockpitProps {
  course: CourseOption;
  selectedBoard: SchoolBoard;
  activeAmbitionId: string;
  onSelectAmbition: (ambitionId: string) => void;
  dayNumber: number;
  onChangeDayNumber?: (newDay: number) => void;
  onOpenCoursePlayer: (dayNum: number) => void;
  onOpenTest?: (category: string, subject: string) => void;
  onOpenExplainer?: (dayNum: number, topicHint?: string) => void;
  userPhone?: string;
}

export const TutODailyPlannerMobileCockpit: React.FC<TutODailyPlannerMobileCockpitProps> = ({
  course,
  selectedBoard,
  activeAmbitionId,
  onSelectAmbition,
  dayNumber,
  onChangeDayNumber,
  onOpenCoursePlayer,
  onOpenTest,
  onOpenExplainer,
  userPhone = 'anonymous',
}) => {
  const [activeDay, setActiveDay] = useState<number>(dayNumber);

  useEffect(() => {
    setActiveDay(dayNumber);
  }, [dayNumber]);

  const handleDayChange = (newDay: number) => {
    const clamped = Math.max(1, Math.min(365, newDay));
    setActiveDay(clamped);
    if (onChangeDayNumber) {
      onChangeDayNumber(clamped);
    }
  };

  const [classes, setClasses] = useState<DayClassItem[]>(() =>
    generateUniqueTenClassesForDay(course.id, activeAmbitionId, dayNumber).classes
  );
  const [yoga, setYoga] = useState<DayYogaPlan | null>(() =>
    generateUniqueTenClassesForDay(course.id, activeAmbitionId, dayNumber).yoga
  );
  const [dailyTest, setDailyTest] = useState<DayTestPlan | null>(() =>
    generateUniqueTenClassesForDay(course.id, activeAmbitionId, dayNumber).dailyTest
  );

  // Progress State
  const [completedClasses, setCompletedClasses] = useState<number[]>([]);
  const [yogaCompleted, setYogaCompleted] = useState<boolean>(false);
  const [testCompleted, setTestCompleted] = useState<boolean>(false);
  const [dailyXp, setDailyXp] = useState<number>(0);
  const [streak, setStreak] = useState<number>(1);
  const [totalXp, setTotalXp] = useState<number>(0);

  // Accordion State for 4 Stages
  const [expandedStages, setExpandedStages] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
  });

  // Modal Drawers
  const [isYogaModalOpen, setIsYogaModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmittingMission, setIsSubmittingMission] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'none' | 'submitted' | 'approved'>('none');
  const [studentNotes, setStudentNotes] = useState('');
  const [submissionSuccessMsg, setSubmissionSuccessMsg] = useState<string | null>(null);

  // Module 2: Active Teacher Alert
  const [activeAlert, setActiveAlert] = useState<any | null>(null);

  // Current Ambition
  const currentAmbition =
    AMBITION_FEATURE_TRACKS.find((c) => c.id === activeAmbitionId) || AMBITION_FEATURE_TRACKS[0];

  const checkSubmissionStatus = async (targetDay: number = activeDay) => {
    try {
      const saved = await AsyncStorage.getItem(`tuto_sub_status_${course.id}_day_${targetDay}`);
      if (saved === 'submitted' || saved === 'approved') {
        setSubmissionStatus(saved as any);
      } else {
        setSubmissionStatus('none');
      }
    } catch (e) {}
  };

  const fetchStudentAlerts = async () => {
    try {
      const storedPhone = await AsyncStorage.getItem('user-phone');
      const cleanPhone = (userPhone || storedPhone || '').replace(/\D/g, '').slice(-10);
      if (!cleanPhone) return;
      const res = await fetch(
        `https://mysupro.duckdns.org/api/tuto/student/alerts?phone=${encodeURIComponent(cleanPhone)}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.alerts && data.alerts.length > 0) {
          setActiveAlert(data.alerts[0]);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch student alerts:', err);
    }
  };

  const handleDismissAlert = async () => {
    if (!activeAlert) return;
    try {
      if (activeAlert.bonus_xp > 0) {
        setTotalXp((prev) => prev + activeAlert.bonus_xp);
        setDailyXp((prev) => prev + activeAlert.bonus_xp);
      }
      await fetch('https://mysupro.duckdns.org/api/tuto/student/alerts/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId: activeAlert.id }),
      });
      setActiveAlert(null);
    } catch (err) {
      setActiveAlert(null);
    }
  };

  const handleSubmitDayMission = async () => {
    setIsSubmittingMission(true);
    try {
      const storedName = await AsyncStorage.getItem('user-name');
      const storedPhone = await AsyncStorage.getItem('user-phone');
      const studentName = storedName || 'SuprO Scholar';
      const cleanPhone = (userPhone || storedPhone || '').replace(/\D/g, '').slice(-10);

      const res = await fetch('https://mysupro.duckdns.org/api/tuto/submissions/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName,
          studentPhone: cleanPhone || '9876543210',
          academicClass: course.id,
          ambitionId: activeAmbitionId,
          courseId: course.id,
          dayNumber: activeDay,
          classesCompleted: completedClasses.length,
          totalClasses: 10,
          yogaCompleted,
          testScore: testCompleted ? 100 : 0,
          xpEarned: dailyXp,
          studentNotes: studentNotes.trim(),
          homeworkUrl: '',
        }),
      });

      if (res.ok) {
        setSubmissionStatus('submitted');
        await AsyncStorage.setItem(`tuto_sub_status_${course.id}_day_${activeDay}`, 'submitted');
        setIsSubmitModalOpen(false);
        setSubmissionSuccessMsg(`🎉 Mission Day ${activeDay} successfully submitted to Teacher for review!`);
        setTimeout(() => setSubmissionSuccessMsg(null), 6000);
      } else {
        alert('Could not submit mission. Please try again.');
      }
    } catch (err: any) {
      alert('Error submitting mission: ' + (err.message || 'Network error'));
    } finally {
      setIsSubmittingMission(false);
    }
  };

  const fetchPlanner = async (targetDay: number = activeDay) => {
    try {
      const res = await fetch(
        `https://mysupro.duckdns.org/api/tuto/planner/today?phone=${encodeURIComponent(
          userPhone
        )}&courseId=${encodeURIComponent(course.id)}&ambitionId=${encodeURIComponent(
          activeAmbitionId
        )}&dayNumber=${targetDay}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (data.classes && data.classes.length > 0) {
            setClasses(data.classes);
          }
          if (data.yoga) setYoga(data.yoga);
          if (data.dailyTest) setDailyTest(data.dailyTest);
          setCompletedClasses(data.progress?.completedClasses || []);
          setYogaCompleted(data.progress?.yogaCompleted || false);
          setTestCompleted(data.progress?.dailyTestCompleted || false);
          setDailyXp(data.progress?.dailyXpEarned || 0);
          setStreak(data.progress?.currentStreak || 1);
          setTotalXp(data.progress?.totalXp || 0);
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to fetch remote daily planner, using deterministic baseline:', e);
    }

    // Fallback: Deterministic local generation
    const baseline = generateUniqueTenClassesForDay(course.id, activeAmbitionId, targetDay);
    setClasses(baseline.classes);
    setYoga(baseline.yoga);
    setDailyTest(baseline.dailyTest);
  };

  useEffect(() => {
    const baseline = generateUniqueTenClassesForDay(course.id, activeAmbitionId, activeDay);
    setClasses(baseline.classes);
    setYoga(baseline.yoga);
    setDailyTest(baseline.dailyTest);
    fetchPlanner(activeDay);
    fetchStudentAlerts();
    checkSubmissionStatus(activeDay);
  }, [course.id, activeAmbitionId, activeDay, userPhone]);

  // Toggle class completion
  const handleToggleClass = async (classIndex: number, xp: number) => {
    const isDone = completedClasses.includes(classIndex);
    const newCompleted = !isDone;

    setCompletedClasses((prev) => (newCompleted ? [...prev, classIndex] : prev.filter((c) => c !== classIndex)));
    setDailyXp((prev) => (newCompleted ? prev + xp : Math.max(0, prev - xp)));
    setTotalXp((prev) => (newCompleted ? prev + xp : Math.max(0, prev - xp)));

    try {
      await fetch('https://mysupro.duckdns.org/api/tuto/planner/task/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: userPhone,
          courseId: course.id,
          dayNumber: activeDay,
          taskType: 'class',
          classIndex,
          completed: newCompleted,
          xp,
        }),
      });
    } catch (err) {}
  };

  // Toggle yoga completion
  const handleToggleYoga = async () => {
    const newDone = !yogaCompleted;
    setYogaCompleted(newDone);
    setDailyXp((prev) => (newDone ? prev + 50 : Math.max(0, prev - 50)));
    setTotalXp((prev) => (newDone ? prev + 50 : Math.max(0, prev - 50)));

    try {
      await fetch('https://mysupro.duckdns.org/api/tuto/planner/task/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: userPhone,
          courseId: course.id,
          dayNumber: activeDay,
          taskType: 'yoga',
          completed: newDone,
          xp: 50,
        }),
      });
    } catch (err) {}
  };

  // 4 Structured Pedagogical Stages for 10 Classes
  const stages = useMemo(
    () => [
      {
        id: 1,
        title: 'Stage 1: Morning Academic & Language Core',
        subtitle: 'Maths, Science, Languages & Social Science (Classes 1 to 4)',
        icon: '🌅',
        color: '#3B82F6',
        classes: classes.filter((c) => c.id >= 1 && c.id <= 4),
      },
      {
        id: 2,
        title: 'Stage 2: Daily Skill, Penmanship & GK',
        subtitle: 'Milestone GK, Handwriting Laboratory & Life Skills (Classes 5 to 7)',
        icon: '✍️',
        color: '#10B981',
        classes: classes.filter((c) => c.id >= 5 && c.id <= 7),
      },
      {
        id: 3,
        title: `Stage 3: Futuristic Ambition & Visual Media`,
        subtitle: `${currentAmbition.short} Career Track & Video Masterclass (Classes 8 & 9)`,
        icon: '🚀',
        color: '#8B5CF6',
        classes: classes.filter((c) => c.id >= 8 && c.id <= 9),
      },
      {
        id: 4,
        title: 'Stage 4: Evening Assessment & Daily Mock',
        subtitle: '5 Concept-Aligned Bedtime Questions (Class 10)',
        icon: '🌙',
        color: '#F59E0B',
        classes: classes.filter((c) => c.id === 10),
      },
    ],
    [classes, currentAmbition]
  );

  const toggleStage = (stageId: number) => {
    setExpandedStages((prev) => ({ ...prev, [stageId]: !prev[stageId] }));
  };

  const nextClass = classes.find((c) => !completedClasses.includes(c.id)) || classes[0];
  const progressPercent = Math.min(100, Math.round((completedClasses.length / 10) * 100));

  const termText =
    activeDay <= 120
      ? 'Term 1: Foundations'
      : activeDay <= 240
      ? 'Term 2: Applied & Lab'
      : 'Term 3: Advanced Revision';

  return (
    <View style={styles.container}>
      {/* ─── 0. 365-DAY TIMELINE & NAVIGATION BAR ─── */}
      <View style={styles.navBar}>
        <View style={styles.navTopRow}>
          <TouchableOpacity
            onPress={() => handleDayChange(activeDay - 1)}
            disabled={activeDay <= 1}
            style={[styles.navBtn, activeDay <= 1 && styles.navBtnDisabled]}
            activeOpacity={0.7}
          >
            <ChevronLeft size={16} color={activeDay <= 1 ? '#64748B' : '#FFFFFF'} />
            <Text style={[styles.navBtnText, activeDay <= 1 && { color: '#64748B' }]}>Prev</Text>
          </TouchableOpacity>

          <View style={styles.navCenterBox}>
            <View style={styles.dayBadge}>
              <Calendar size={12} color="#FBBF24" />
              <Text style={styles.dayBadgeText}>Day {activeDay} of 365</Text>
            </View>
            <View style={styles.termBadge}>
              <Text style={styles.termBadgeText}>{termText}</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => handleDayChange(activeDay + 1)}
            disabled={activeDay >= 365}
            style={[styles.navBtn, activeDay >= 365 && styles.navBtnDisabled]}
            activeOpacity={0.7}
          >
            <Text style={[styles.navBtnText, activeDay >= 365 && { color: '#64748B' }]}>Next</Text>
            <ChevronRight size={16} color={activeDay >= 365 ? '#64748B' : '#FFFFFF'} />
          </TouchableOpacity>
        </View>

        {/* Quick Jump Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.jumpRow}>
          <Text style={styles.jumpLabel}>Quick Jump:</Text>
          {[1, 50, 100, 180, 250, 365].map((d) => (
            <TouchableOpacity
              key={d}
              onPress={() => handleDayChange(d)}
              style={[styles.jumpChip, activeDay === d && styles.jumpChipActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.jumpChipText, activeDay === d && styles.jumpChipTextActive]}>D{d}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ─── CELEBRATORY TEACHER ALERT BANNER ─── */}
      {activeAlert && (
        <View style={styles.alertCard}>
          <View style={styles.alertHeader}>
            <Text style={styles.alertEmoji}>🎉</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>Teacher Review & Commendation!</Text>
              <Text style={styles.alertSubtitle}>
                Guide {activeAlert.teacher_name} reviewed Day {activeAlert.day_number}
              </Text>
            </View>
            <View style={styles.alertBonusBadge}>
              <Text style={styles.alertBonusText}>+{activeAlert.bonus_xp} XP</Text>
            </View>
          </View>
          {activeAlert.comments ? (
            <Text style={styles.alertRemarks}>&ldquo;{activeAlert.comments}&rdquo;</Text>
          ) : null}
          <TouchableOpacity onPress={handleDismissAlert} style={styles.alertClaimBtn} activeOpacity={0.8}>
            <CheckCircle2 size={16} color="#0B1120" />
            <Text style={styles.alertClaimBtnText}>Celebrate & Claim XP 🎉</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ─── SUCCESS TOAST ─── */}
      {submissionSuccessMsg && (
        <View style={styles.successToast}>
          <CheckCircle2 size={16} color="#00D084" />
          <Text style={styles.successToastText}>{submissionSuccessMsg}</Text>
        </View>
      )}

      {/* ─── MODULE 1: DAY MISSION SUBMISSION CARD ─── */}
      <View style={styles.missionCard}>
        <View style={styles.missionLeft}>
          <View style={styles.missionIconBox}>
            <Text style={{ fontSize: 20 }}>
              {submissionStatus === 'approved' ? '🎖️' : submissionStatus === 'submitted' ? '⏳' : '🚀'}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.missionTitle}>Day {activeDay} Mission</Text>
              <View
                style={[
                  styles.missionBadge,
                  submissionStatus === 'approved'
                    ? { backgroundColor: 'rgba(0, 208, 132, 0.2)' }
                    : submissionStatus === 'submitted'
                    ? { backgroundColor: 'rgba(251, 191, 36, 0.2)' }
                    : { backgroundColor: 'rgba(99, 102, 241, 0.2)' },
                ]}
              >
                <Text
                  style={[
                    styles.missionBadgeText,
                    submissionStatus === 'approved'
                      ? { color: '#00D084' }
                      : submissionStatus === 'submitted'
                      ? { color: '#FBBF24' }
                      : { color: '#818CF8' },
                  ]}
                >
                  {submissionStatus === 'approved'
                    ? 'Approved'
                    : submissionStatus === 'submitted'
                    ? 'Under Review'
                    : 'Ready to Submit'}
                </Text>
              </View>
            </View>
            <Text style={styles.missionMeta}>
              {completedClasses.length}/10 Classes • Yoga: {yogaCompleted ? 'Done' : 'Pending'} • +{dailyXp} XP
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => setIsSubmitModalOpen(true)}
          style={[
            styles.submitBtn,
            submissionStatus === 'approved'
              ? styles.submitBtnApproved
              : submissionStatus === 'submitted'
              ? styles.submitBtnPending
              : styles.submitBtnReady,
          ]}
          activeOpacity={0.8}
        >
          <Send size={14} color={submissionStatus === 'none' ? '#0B1120' : '#FFFFFF'} />
          <Text
            style={[
              styles.submitBtnText,
              submissionStatus === 'none' ? { color: '#0B1120' } : { color: '#FFFFFF' },
            ]}
          >
            {submissionStatus === 'approved'
              ? `Day ${activeDay} Review`
              : submissionStatus === 'submitted'
              ? `Update Day ${activeDay}`
              : `Submit to Teacher`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ─── 1. HERO ACTIVE MISSION BANNER ─── */}
      <View style={styles.heroBanner}>
        <View style={styles.heroStatsRow}>
          <View style={styles.streakBadge}>
            <Flame size={12} color="#F59E0B" />
            <Text style={styles.streakText}>{streak} Day Streak</Text>
          </View>
          <View style={styles.xpBadge}>
            <Star size={12} color="#818CF8" />
            <Text style={styles.xpText}>{totalXp} XP Total</Text>
          </View>
          <View style={styles.dayPill}>
            <Text style={styles.dayPillText}>Day {activeDay} of 365</Text>
          </View>
        </View>

        {nextClass && (
          <View style={styles.heroClassSection}>
            <Text style={styles.upNextText}>
              UP NEXT · CLASS {nextClass.id} OF 10 ({nextClass.subject.toUpperCase()})
            </Text>
            <Text style={styles.heroClassTitle}>{nextClass.title}</Text>
          </View>
        )}

        {/* Ambition Track Switcher */}
        <View style={styles.ambitionSwitcher}>
          <Text style={styles.ambitionLabel}>CAREER TRACK:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ambitionRow}>
            {AMBITION_FEATURE_TRACKS.map((trk) => {
              const isAct = activeAmbitionId === trk.id;
              return (
                <TouchableOpacity
                  key={trk.id}
                  onPress={() => onSelectAmbition(trk.id)}
                  style={[styles.ambitionChip, isAct && styles.ambitionChipActive]}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 13 }}>{trk.icon}</Text>
                  <Text style={[styles.ambitionChipText, isAct && styles.ambitionChipTextActive]}>
                    {trk.short}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Primary Action Button */}
        <View style={styles.heroActionRow}>
          <TouchableOpacity
            onPress={() => onOpenCoursePlayer(activeDay)}
            style={styles.heroPlayBtn}
            activeOpacity={0.8}
          >
            <Play size={16} color="#0B1120" />
            <Text style={styles.heroPlayBtnText}>
              Resume Lesson ({nextClass ? nextClass.duration : '15m'})
            </Text>
            <ChevronRight size={16} color="#0B1120" />
          </TouchableOpacity>
          <Text style={styles.progressSummary}>
            Progress: {completedClasses.length}/10 Classes ({progressPercent}%)
          </Text>
        </View>
      </View>

      {/* ─── QUICK TOOLS ROW ─── */}
      <View style={styles.toolsRow}>
        <TouchableOpacity
          onPress={() => setIsYogaModalOpen(true)}
          style={styles.toolBtn}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 16 }}>🧘</Text>
          <Text style={styles.toolBtnText}>Daily Yoga {yogaCompleted ? '✓' : ''}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onOpenTest && onOpenTest(dailyTest?.category || course.id, dailyTest?.subject || 'ALL')}
          style={styles.toolBtn}
          activeOpacity={0.7}
        >
          <Zap size={14} color="#FBBF24" />
          <Text style={styles.toolBtnText}>Daily CBT Test (10 Qs)</Text>
        </TouchableOpacity>
      </View>

      {/* ─── 4 PEDAGOGICAL STAGES ─── */}
      <View style={styles.stagesContainer}>
        {stages.map((stg) => {
          const isExp = expandedStages[stg.id] ?? true;
          const stageCompleted = stg.classes.filter((c) => completedClasses.includes(c.id)).length;
          return (
            <View key={stg.id} style={styles.stageCard}>
              <TouchableOpacity
                onPress={() => toggleStage(stg.id)}
                style={styles.stageHeader}
                activeOpacity={0.7}
              >
                <View style={styles.stageHeaderLeft}>
                  <Text style={{ fontSize: 18 }}>{stg.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.stageTitle}>{stg.title}</Text>
                    <Text style={styles.stageSubtitle}>{stg.subtitle}</Text>
                  </View>
                </View>
                <View style={styles.stageHeaderRight}>
                  <Text style={styles.stageProgressText}>
                    {stageCompleted}/{stg.classes.length}
                  </Text>
                  {isExp ? <ChevronUp size={16} color="#94A3B8" /> : <ChevronDown size={16} color="#94A3B8" />}
                </View>
              </TouchableOpacity>

              {isExp && (
                <View style={styles.stageBody}>
                  {stg.classes.map((cls) => {
                    const isDone = completedClasses.includes(cls.id);
                    return (
                      <View
                        key={cls.id}
                        style={[styles.classItem, isDone && styles.classItemDone]}
                      >
                        <TouchableOpacity
                          onPress={() => handleToggleClass(cls.id, cls.xp)}
                          style={styles.classCheckbox}
                          activeOpacity={0.7}
                        >
                          {isDone ? (
                            <CheckCircle2 size={20} color="#00D084" />
                          ) : (
                            <Circle size={20} color="#475569" />
                          )}
                        </TouchableOpacity>

                        <View style={{ flex: 1 }}>
                          <View style={styles.classMetaRow}>
                            <Text style={styles.classNumberBadge}>CLASS {cls.id}</Text>
                            <Text style={styles.classSubject}>{cls.subject}</Text>
                            <Text style={styles.classDuration}>⏱ {cls.duration}</Text>
                            <Text style={styles.classXp}>+{cls.xp} XP</Text>
                          </View>
                          <Text style={[styles.classTitle, isDone && styles.classTitleDone]}>
                            {cls.title}
                          </Text>
                          {cls.microTopic ? (
                            <Text style={styles.classMicroTopic}>{cls.microTopic}</Text>
                          ) : null}
                        </View>

                        <View style={styles.classActions}>
                          {onOpenExplainer && (
                            <TouchableOpacity
                              onPress={() => onOpenExplainer(activeDay, cls.title)}
                              style={styles.classActionBtn}
                              activeOpacity={0.7}
                            >
                              <BookOpen size={12} color="#38BDF8" />
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity
                            onPress={() => onOpenCoursePlayer(activeDay)}
                            style={[styles.classActionBtn, { backgroundColor: '#1E293B' }]}
                            activeOpacity={0.7}
                          >
                            <Play size={12} color="#00D084" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* ─── YOGA MODAL ─── */}
      {yoga && (
        <Modal visible={isYogaModalOpen} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalBadge}>DAY {activeDay} WELLNESS</Text>
                  <Text style={styles.modalTitle}>{yoga.name}</Text>
                  <Text style={styles.modalSanskrit}>{yoga.sanskrit}</Text>
                </View>
                <TouchableOpacity onPress={() => setIsYogaModalOpen(false)} style={styles.modalCloseBtn}>
                  <X size={18} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
                <View style={styles.yogaSection}>
                  <Text style={styles.yogaSectionTitle}>🌿 Key Benefits:</Text>
                  {yoga.benefits.map((b, i) => (
                    <Text key={i} style={styles.yogaBulletText}>• {b}</Text>
                  ))}
                </View>

                <View style={styles.yogaSection}>
                  <Text style={styles.yogaSectionTitle}>🧘 Step-by-Step Instructions:</Text>
                  {yoga.steps.map((s, i) => (
                    <Text key={i} style={styles.yogaStepText}>{i + 1}. {s}</Text>
                  ))}
                </View>

                <View style={styles.yogaSection}>
                  <Text style={styles.yogaSectionTitle}>💨 Breathing Pattern:</Text>
                  <Text style={styles.yogaBodyText}>{yoga.breathing}</Text>
                </View>

                <View style={styles.yogaSection}>
                  <Text style={styles.yogaSectionTitle}>⚡ Brain Booster Fact:</Text>
                  <Text style={styles.yogaBodyText}>{yoga.brainBooster}</Text>
                </View>
              </ScrollView>

              <TouchableOpacity
                onPress={() => {
                  handleToggleYoga();
                  setIsYogaModalOpen(false);
                }}
                style={styles.yogaCompleteBtn}
                activeOpacity={0.8}
              >
                <CheckCircle2 size={18} color="#0B1120" />
                <Text style={styles.yogaCompleteBtnText}>
                  {yogaCompleted ? 'Completed (50 XP Awarded)' : 'Mark Yoga Completed (+50 XP)'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* ─── MODULE 1: DAY MISSION SUBMISSION MODAL ─── */}
      <Modal visible={isSubmitModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalBadge}>MODULE 1 • STUDENT SUBMISSION</Text>
                <Text style={styles.modalTitle}>Submit Day {activeDay} Mission</Text>
                <Text style={styles.modalSubtitle}>
                  Your guide will review your classes, test score & reflection notes.
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsSubmitModalOpen(false)} style={styles.modalCloseBtn}>
                <X size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {/* Performance Summary */}
            <View style={styles.submitMetricsGrid}>
              <View style={styles.submitMetricBox}>
                <Text style={styles.submitMetricLabel}>CLASSES</Text>
                <Text style={styles.submitMetricVal}>{completedClasses.length}/10</Text>
              </View>
              <View style={styles.submitMetricBox}>
                <Text style={styles.submitMetricLabel}>TEST SCORE</Text>
                <Text style={styles.submitMetricVal}>{testCompleted ? '100%' : 'Pending'}</Text>
              </View>
              <View style={styles.submitMetricBox}>
                <Text style={styles.submitMetricLabel}>YOGA</Text>
                <Text style={styles.submitMetricVal}>{yogaCompleted ? 'Done' : 'Pending'}</Text>
              </View>
              <View style={styles.submitMetricBox}>
                <Text style={styles.submitMetricLabel}>EARNED XP</Text>
                <Text style={[styles.submitMetricVal, { color: '#FBBF24' }]}>+{dailyXp} XP</Text>
              </View>
            </View>

            {/* Reflection Notes */}
            <View style={{ marginTop: 14 }}>
              <Text style={styles.notesLabel}>Student Reflection & Doubts for Teacher:</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Write what you learned today or questions you have for your guide..."
                placeholderTextColor="#64748B"
                multiline
                numberOfLines={3}
                value={studentNotes}
                onChangeText={setStudentNotes}
              />
            </View>

            <TouchableOpacity
              onPress={handleSubmitDayMission}
              disabled={isSubmittingMission}
              style={styles.submitConfirmBtn}
              activeOpacity={0.8}
            >
              {isSubmittingMission ? (
                <ActivityIndicator color="#0B1120" size="small" />
              ) : (
                <>
                  <Send size={16} color="#0B1120" />
                  <Text style={styles.submitConfirmBtnText}>
                    Send Day {activeDay} Mission to Teacher
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingBottom: 24,
  },
  // Timeline Navigation Bar
  navBar: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
  },
  navTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  navBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  navCenterBox: {
    alignItems: 'center',
    gap: 4,
  },
  dayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
  },
  dayBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  termBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  termBadgeText: {
    color: '#93C5FD',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  jumpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  jumpLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
  },
  jumpChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  jumpChipActive: {
    backgroundColor: '#FBBF24',
  },
  jumpChipText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
  },
  jumpChipTextActive: {
    color: '#0B1120',
    fontWeight: '900',
  },
  // Teacher Alert Card
  alertCard: {
    backgroundColor: '#1E1B4B',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F59E0B',
    gap: 8,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertEmoji: {
    fontSize: 22,
  },
  alertTitle: {
    color: '#FDE68A',
    fontSize: 13,
    fontWeight: '800',
  },
  alertSubtitle: {
    color: '#CBD5E1',
    fontSize: 11,
  },
  alertBonusBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  alertBonusText: {
    color: '#FBBF24',
    fontSize: 11,
    fontWeight: '900',
  },
  alertRemarks: {
    color: '#FFFFFF',
    fontSize: 12,
    fontStyle: 'italic',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 10,
    borderRadius: 10,
  },
  alertClaimBtn: {
    backgroundColor: '#FBBF24',
    borderRadius: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  alertClaimBtnText: {
    color: '#0B1120',
    fontSize: 12,
    fontWeight: '800',
  },
  // Success Toast
  successToast: {
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
    borderRadius: 14,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 208, 132, 0.3)',
  },
  successToastText: {
    color: '#00D084',
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },
  // Module 1 Mission Card
  missionCard: {
    backgroundColor: '#0E172A',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  missionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  missionIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  missionTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  missionBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  missionBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  missionMeta: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  submitBtnReady: {
    backgroundColor: '#00D084',
  },
  submitBtnPending: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.4)',
  },
  submitBtnApproved: {
    backgroundColor: 'rgba(0, 208, 132, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(0, 208, 132, 0.4)',
  },
  submitBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  // Hero Banner
  heroBanner: {
    backgroundColor: '#1E1B4B',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
    gap: 10,
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  streakText: {
    color: '#FBBF24',
    fontSize: 10,
    fontWeight: '800',
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  xpText: {
    color: '#A5B4FC',
    fontSize: 10,
    fontWeight: '800',
  },
  dayPill: {
    backgroundColor: 'rgba(0, 208, 132, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  dayPillText: {
    color: '#00D084',
    fontSize: 10,
    fontWeight: '800',
  },
  heroClassSection: {
    marginTop: 2,
  },
  upNextText: {
    color: '#A5B4FC',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroClassTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  ambitionSwitcher: {
    marginTop: 2,
  },
  ambitionLabel: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '800',
    marginBottom: 4,
  },
  ambitionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ambitionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  ambitionChipActive: {
    backgroundColor: '#FBBF24',
  },
  ambitionChipText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  ambitionChipTextActive: {
    color: '#0B1120',
    fontWeight: '900',
  },
  heroActionRow: {
    marginTop: 6,
    gap: 6,
  },
  heroPlayBtn: {
    backgroundColor: '#00D084',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  heroPlayBtnText: {
    color: '#0B1120',
    fontSize: 13,
    fontWeight: '900',
  },
  progressSummary: {
    color: '#CBD5E1',
    fontSize: 10,
    textAlign: 'center',
  },
  // Quick Tools Row
  toolsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toolBtn: {
    flex: 1,
    backgroundColor: '#0E172A',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  toolBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  // Stages & Classes
  stagesContainer: {
    gap: 12,
  },
  stageCard: {
    backgroundColor: '#0E172A',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  stageHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  stageTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  stageSubtitle: {
    color: '#94A3B8',
    fontSize: 10,
  },
  stageHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stageProgressText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
  },
  stageBody: {
    padding: 10,
    gap: 8,
  },
  classItem: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  classItemDone: {
    opacity: 0.7,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
  },
  classCheckbox: {
    padding: 2,
  },
  classMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  classNumberBadge: {
    color: '#FBBF24',
    fontSize: 9,
    fontWeight: '900',
  },
  classSubject: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  classDuration: {
    color: '#64748B',
    fontSize: 9,
  },
  classXp: {
    color: '#00D084',
    fontSize: 9,
    fontWeight: '800',
  },
  classTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  classTitleDone: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  classMicroTopic: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2,
  },
  classActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  classActionBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Modal Common
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: '#0F172A',
    borderRadius: 22,
    padding: 16,
    width: width - 32,
    maxWidth: 480,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  modalBadge: {
    color: '#00D084',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    marginTop: 2,
  },
  modalSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  modalSanskrit: {
    color: '#A5B4FC',
    fontSize: 11,
    fontStyle: 'italic',
  },
  modalCloseBtn: {
    padding: 4,
  },
  yogaSection: {
    marginBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 10,
    borderRadius: 10,
  },
  yogaSectionTitle: {
    color: '#FBBF24',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
  },
  yogaBulletText: {
    color: '#CBD5E1',
    fontSize: 11,
    lineHeight: 16,
  },
  yogaStepText: {
    color: '#CBD5E1',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 2,
  },
  yogaBodyText: {
    color: '#CBD5E1',
    fontSize: 11,
    lineHeight: 16,
  },
  yogaCompleteBtn: {
    backgroundColor: '#00D084',
    borderRadius: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
  },
  yogaCompleteBtnText: {
    color: '#0B1120',
    fontSize: 12,
    fontWeight: '900',
  },
  submitMetricsGrid: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  submitMetricBox: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
  },
  submitMetricLabel: {
    color: '#94A3B8',
    fontSize: 8,
    fontWeight: '800',
  },
  submitMetricVal: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 2,
  },
  notesLabel: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  notesInput: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 10,
    color: '#FFFFFF',
    fontSize: 11,
    minHeight: 70,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  submitConfirmBtn: {
    backgroundColor: '#00D084',
    borderRadius: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
  },
  submitConfirmBtnText: {
    color: '#0B1120',
    fontSize: 12,
    fontWeight: '900',
  },
});
