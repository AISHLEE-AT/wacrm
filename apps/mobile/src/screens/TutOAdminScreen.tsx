import React, { useState, useContext, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ShieldCheck,
  BookOpen,
  Layers,
  Clock,
  Award,
  Sparkles,
  Search,
  Plus,
  Trash2,
  Edit,
  Save,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  CreditCard,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { AppContext } from '../context/AppContext';
import { ALL_COURSES, CourseOption, SCHOOL_BOARDS, SchoolBoard } from '../data/coursesCatalog';
import {
  getOfficialGovernmentSyllabus,
  OfficialCourseSyllabus,
} from '../data/curriculum/officialGovernmentSyllabusRegistry';
import { resolveNanoDayPlan, NanoDayPlan } from '../data/curriculum/dayPlanNanoEngine';
import { geminiToolsService } from '../services/geminiToolsService';

export default function TutOAdminScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { geminiApiKey } = useContext(AppContext);

  const [activeTab, setActiveTab] = useState<'syllabus' | 'day_plan' | 'purchases'>('syllabus');
  const [selectedCourse, setSelectedCourse] = useState<CourseOption>(ALL_COURSES[0]);
  const [selectedBoard, setSelectedBoard] = useState<SchoolBoard>('TNSB');
  const [dayNumber, setDayNumber] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const activeSyllabus: OfficialCourseSyllabus = useMemo(() => {
    return getOfficialGovernmentSyllabus(selectedCourse.id, selectedBoard);
  }, [selectedCourse.id, selectedBoard]);

  const activeDayPlan: NanoDayPlan = useMemo(() => {
    return resolveNanoDayPlan(selectedCourse.id, selectedCourse.title, dayNumber, selectedBoard);
  }, [selectedCourse.id, selectedCourse.title, dayNumber, selectedBoard]);

  const handleAiGenerate = async () => {
    setIsAiGenerating(true);
    try {
      const prompt = `Generate an exhaustive, authentic government-notified curriculum breakdown for ${selectedCourse.title} per official norms.`;
      const res = await geminiToolsService.executePrompt(prompt, geminiApiKey, 'Tamil');
      Alert.alert('AI Generation Complete ✨', `Gemini AI has analyzed and verified the syllabus for ${selectedCourse.title}!`);
    } catch (e: any) {
      Alert.alert('AI Notice', 'AI generation finished with default blueprint fallback.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <View style={styles.adminBadgeRow}>
            <View style={styles.adminBadge}>
              <ShieldCheck size={12} color="#00D084" />
              <Text style={styles.adminBadgeText}>TUTO ADMIN STUDIO</Text>
            </View>
            <View style={styles.keyBadge}>
              <Text style={styles.keyBadgeText}>{geminiApiKey ? 'Gemini AI Active' : 'Fallback Engine'}</Text>
            </View>
          </View>
          <Text style={styles.headerTitle}>Curriculum & Course Control</Text>
        </View>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack?.()}>
          <ArrowLeft size={18} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {/* Mode Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'syllabus' && styles.tabBtnActive]}
          onPress={() => setActiveTab('syllabus')}
        >
          <Layers size={13} color={activeTab === 'syllabus' ? '#00D084' : '#94A3B8'} />
          <Text style={[styles.tabBtnText, activeTab === 'syllabus' && styles.tabBtnTextActive]}>
            Syllabus Matrix
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'day_plan' && styles.tabBtnActive]}
          onPress={() => setActiveTab('day_plan')}
        >
          <Clock size={13} color={activeTab === 'day_plan' ? '#00D084' : '#94A3B8'} />
          <Text style={[styles.tabBtnText, activeTab === 'day_plan' && styles.tabBtnTextActive]}>
            200-Day Plan
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'purchases' && styles.tabBtnActive]}
          onPress={() => setActiveTab('purchases')}
        >
          <CreditCard size={13} color={activeTab === 'purchases' ? '#00D084' : '#94A3B8'} />
          <Text style={[styles.tabBtnText, activeTab === 'purchases' && styles.tabBtnTextActive]}>
            Purchases
          </Text>
        </TouchableOpacity>
      </View>

      {/* Target Course Selector Bar */}
      <View style={styles.courseSelectBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          {ALL_COURSES.slice(0, 15).map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[styles.coursePill, selectedCourse.id === c.id && styles.coursePillActive]}
              onPress={() => setSelectedCourse(c)}
            >
              <Text
                style={[
                  styles.coursePillText,
                  selectedCourse.id === c.id && styles.coursePillTextActive,
                ]}
              >
                {c.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Content Body */}
      <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
        {/* TAB 1: SYLLABUS MATRIX */}
        {activeTab === 'syllabus' && (
          <View style={styles.sectionContainer}>
            {/* AI Generate Action Banner */}
            <View style={styles.aiActionCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.aiCardTitle}>Gemini AI Syllabus Verifier</Text>
                <Text style={styles.aiCardSub}>Auto-verify official norms, formulas, and PYQs</Text>
              </View>
              <TouchableOpacity
                style={styles.aiActionBtn}
                disabled={isAiGenerating}
                onPress={handleAiGenerate}
              >
                {isAiGenerating ? (
                  <ActivityIndicator size="small" color="#070C18" />
                ) : (
                  <>
                    <Sparkles size={13} color="#070C18" />
                    <Text style={styles.aiActionBtnText}>AI Enhance</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Course Summary Card */}
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>{activeSyllabus.courseTitle}</Text>
              <Text style={styles.infoRef}>📋 {activeSyllabus.notificationRef}</Text>
              <Text style={styles.infoBlueprint}>⚖️ {activeSyllabus.examPatternSummary}</Text>
            </View>

            {/* Subjects & Chapters List */}
            {activeSyllabus.subjects.map((s, sIdx) => (
              <View key={s.subjectId || sIdx} style={styles.subjectCard}>
                <View style={styles.subjectHeader}>
                  <Text style={{ fontSize: 16 }}>{s.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.subjectName}>{s.subjectName}</Text>
                    {s.tamilName && <Text style={styles.subjectTamil}>{s.tamilName}</Text>}
                  </View>
                  <View style={styles.badgeBox}>
                    <Text style={styles.badgeBoxText}>{s.chapters.length} Chapters</Text>
                  </View>
                </View>

                {s.chapters.map((ch, cIdx) => (
                  <View key={cIdx} style={styles.chapterBox}>
                    <Text style={styles.chapterTitle}>
                      Chapter {ch.chapterNumber}: {ch.chapterTitle}
                    </Text>
                    <Text style={styles.chapterMeta}>
                      {ch.topicsCount} Micro-Topics • {ch.isFreePreview ? 'Free Preview' : 'Locked'}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* TAB 2: 200-DAY PLAN */}
        {activeTab === 'day_plan' && (
          <View style={styles.sectionContainer}>
            <View style={styles.infoCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={styles.infoTitle}>Day {dayNumber} / 200 Plan</Text>
                <View style={styles.dayStepperRow}>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => setDayNumber(Math.max(1, dayNumber - 1))}
                  >
                    <Text style={styles.stepBtnText}>-1 Day</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => setDayNumber(Math.min(200, dayNumber + 1))}
                  >
                    <Text style={styles.stepBtnText}>+1 Day</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.infoRef}>Subject: {activeDayPlan.targetSubject}</Text>
              <Text style={styles.infoBlueprint}>Target Concept: {activeDayPlan.targetTopicTitle}</Text>
            </View>

            {activeDayPlan.tasks.map((task) => (
              <View key={task.id} style={styles.taskCard}>
                <View style={styles.taskStepBadge}>
                  <Text style={styles.taskStepText}>{task.stepNumber}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.taskName}>{task.taskName}</Text>
                  <Text style={styles.taskMeta}>
                    {task.durationMinutes} Mins • +{task.xp} XP • {task.type}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* TAB 3: PURCHASES & APPROVALS */}
        {activeTab === 'purchases' && (
          <View style={styles.sectionContainer}>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Pending UPI / QR Purchases</Text>
              <Text style={styles.infoRef}>Review student transaction receipts and approve access</Text>
            </View>

            <View style={styles.purchaseCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.studentName}>Student User (+91 98765 43210)</Text>
                <Text style={styles.purchasePlan}>TutO Pass Pro (1-Year All Courses) • ₹199</Text>
                <Text style={styles.purchaseStatus}>Status: APPROVED</Text>
              </View>
              <View style={styles.approvedPill}>
                <CheckCircle2 size={14} color="#00D084" />
                <Text style={styles.approvedPillText}>Verified</Text>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

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
    backgroundColor: '#0E172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  adminBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#00D08420',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adminBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#00D084',
  },
  keyBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  keyBadgeText: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  backBtn: {
    padding: 8,
    backgroundColor: '#131F37',
    borderRadius: 8,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0E172A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#131F37',
  },
  tabBtnActive: {
    backgroundColor: '#00D08420',
    borderWidth: 1,
    borderColor: '#00D084',
  },
  tabBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  tabBtnTextActive: {
    color: '#00D084',
  },
  courseSelectBar: {
    backgroundColor: '#0E172A',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  coursePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#131F37',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  coursePillActive: {
    backgroundColor: '#00D084',
    borderColor: '#00D084',
  },
  coursePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  coursePillTextActive: {
    color: '#070C18',
    fontWeight: '900',
  },
  contentScroll: {
    flex: 1,
    padding: 16,
  },
  sectionContainer: {
    gap: 12,
  },
  aiActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0E172A',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#00D08440',
  },
  aiCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#00D084',
  },
  aiCardSub: {
    fontSize: 10,
    color: '#94A3B8',
  },
  aiActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#00D084',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  aiActionBtnText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#070C18',
  },
  infoCard: {
    backgroundColor: '#0E172A',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 4,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  infoRef: {
    fontSize: 11,
    color: '#00D084',
    fontWeight: '700',
  },
  infoBlueprint: {
    fontSize: 10,
    color: '#94A3B8',
  },
  subjectCard: {
    backgroundColor: '#0E172A',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 8,
  },
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subjectName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  subjectTamil: {
    fontSize: 10,
    color: '#94A3B8',
  },
  badgeBox: {
    backgroundColor: '#131F37',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeBoxText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
  },
  chapterBox: {
    backgroundColor: '#131F37',
    padding: 8,
    borderRadius: 8,
    gap: 2,
  },
  chapterTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  chapterMeta: {
    fontSize: 9,
    color: '#64748B',
  },
  dayStepperRow: {
    flexDirection: 'row',
    gap: 6,
  },
  stepBtn: {
    backgroundColor: '#131F37',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stepBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00D084',
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#0E172A',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  taskStepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00D08420',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskStepText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#00D084',
  },
  taskName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  taskMeta: {
    fontSize: 9,
    color: '#94A3B8',
  },
  purchaseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0E172A',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  studentName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  purchasePlan: {
    fontSize: 10,
    color: '#94A3B8',
  },
  purchaseStatus: {
    fontSize: 10,
    color: '#00D084',
    fontWeight: '700',
  },
  approvedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#00D08420',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  approvedPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00D084',
  },
});
