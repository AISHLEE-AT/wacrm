import React, { useState, useContext, useMemo, useEffect, useCallback } from 'react';
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
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Hash,
  Sliders,
  Globe,
  PenTool,
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
  ChevronRight,
  ChevronLeft,
  Video,
  FileText,
  Heart,
  Smile,
  Calendar,
  Send,
  Star,
  Zap,
  Target,
  Flame,
  Check,
} from 'lucide-react-native';
import { AppContext } from '../context/AppContext';
import { ALL_COURSES, CourseOption, SCHOOL_BOARDS, SchoolBoard } from '../data/coursesCatalog';
import {
  getOfficialGovernmentSyllabus,
  OfficialCourseSyllabus,
} from '../data/curriculum/officialGovernmentSyllabusRegistry';
import {
  WholeYearDayPlan,
  resolveWholeYearDayPlan,
  saveAdminCustomDayPlan,
  getAdminCustomDayPlan,
  getAdminReleasedDayNumbers,
  toggleAdminDayRelease,
  releaseBatchDays,
} from '../data/curriculum/wholeYearDayPlanEngine';
import { generateUniqueTenClassesForDay, DayClassItem, DayYogaPlan, DayTestPlan } from '../data/curriculum/curriculum365Engine';
import { AMBITION_FEATURE_TRACKS } from '../components/teacho/TutODailyPlannerMobileCockpit';
import { geminiToolsService } from '../services/geminiToolsService';
import {
  GoogleSheetsDayPlanService,
  GoogleSheetDayPlanItem,
  GoogleSheetConfig,
} from '../services/GoogleSheetsDayPlanService';
import {
  StructuredMCQ,
  MASTER_QBANK_STORE,
  searchQuestions,
  querySupabaseQuestionBank,
  QUESTION_FORMATS,
  EXAM_CATEGORIES,
} from '../lib/qbankTaxonomyEngine';

const { width } = Dimensions.get('window');

export default function TutOAdminScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { geminiApiKey, user } = useContext(AppContext);

  const [activeTab, setActiveTab] = useState<
    'submissions' | 'day_plan' | 'google_sheets' | 'syllabus' | 'qbank_mapper' | 'purchases' | 'telegram'
  >('day_plan');

  const [selectedCourse, setSelectedCourse] = useState<CourseOption>(ALL_COURSES[0]);
  const [selectedBoard, setSelectedBoard] = useState<SchoolBoard>('TNSB');
  const [dayNumber, setDayNumber] = useState(1);
  const [selectedAmbitionId, setSelectedAmbitionId] = useState<string>('jr-ias');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ─── 365-DAY OCI CLOUD STUDIO STATES ─────────────────────────────────────────
  const [adminClasses, setAdminClasses] = useState<DayClassItem[]>([]);
  const [adminYoga, setAdminYoga] = useState<DayYogaPlan | null>(null);
  const [adminDailyTest, setAdminDailyTest] = useState<DayTestPlan | null>(null);
  const [isCustomFromOci, setIsCustomFromOci] = useState(false);
  const [isLoadingDayPlan, setIsLoadingDayPlan] = useState(false);

  // Load 365-Day Plan for Course + Ambition + DayNumber
  const load365DayPlan = useCallback(async (courseId: string, ambitionId: string, dayNum: number) => {
    setIsLoadingDayPlan(true);
    try {
      const res = await fetch(
        `https://mysupro.duckdns.org/api/tuto/admin/day-plan/get?courseId=${encodeURIComponent(
          courseId
        )}&ambitionId=${encodeURIComponent(ambitionId)}&dayNumber=${dayNum}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.plan) {
          setAdminClasses(data.plan.classes || []);
          setAdminYoga(data.plan.yoga || null);
          setAdminDailyTest(data.plan.dailyTest || null);
          setIsCustomFromOci(Boolean(data.isCustomAdminPlan));
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to fetch from OCI admin endpoint, falling back to local:', e);
    } finally {
      setIsLoadingDayPlan(false);
    }

    // Local deterministic fallback
    const fallback = generateUniqueTenClassesForDay(courseId, ambitionId, dayNum);
    setAdminClasses(fallback.classes);
    setAdminYoga(fallback.yoga);
    setAdminDailyTest(fallback.dailyTest);
    setIsCustomFromOci(false);
  }, []);

  useEffect(() => {
    load365DayPlan(selectedCourse.id, selectedAmbitionId, dayNumber);
  }, [selectedCourse.id, selectedAmbitionId, dayNumber, load365DayPlan]);

  // Save 365-Day Plan to OCI Cloud
  const handleSaveToOciCloud = async () => {
    setIsSaving(true);
    try {
      const payload = {
        courseId: selectedCourse.id,
        courseTitle: selectedCourse.title,
        dayNumber,
        classes: adminClasses,
        yoga: adminYoga,
        dailyTest: adminDailyTest,
        topicTitle: adminClasses[0]?.title || `Day ${dayNumber} Curriculum Plan`,
        chapterTitle: `Term ${dayNumber <= 120 ? '1' : dayNumber <= 240 ? '2' : '3'} Progression`,
      };

      const res = await fetch('https://mysupro.duckdns.org/api/tuto/admin/day-plan/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsCustomFromOci(true);
        Alert.alert(
          'Published to OCI Cloud! ☁️',
          `Day ${dayNumber} (${selectedCourse.title}) custom plan is now stored in OCI PostgreSQL and immediately live for all students!`
        );
      } else {
        Alert.alert('Save Failed', data.error || 'Could not save day plan to OCI.');
      }
    } catch (e: any) {
      Alert.alert('Network Error', e.message || 'Failed to reach OCI cloud backend.');
    } finally {
      setIsSaving(false);
    }
  };

  // ─── MODULE 2: TEACHER EVALUATION STUDIO STATES ──────────────────────────────
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [subFilter, setSubFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [selectedSubId, setSelectedSubId] = useState<number | null>(null);
  const [teacherRemarks, setTeacherRemarks] = useState<Record<number, string>>({});
  const [bonusXpMap, setBonusXpMap] = useState<Record<number, number>>({});
  const [isAlerting, setIsAlerting] = useState<Record<number, boolean>>({});

  const fetchSubmissions = useCallback(async () => {
    setIsLoadingSubmissions(true);
    try {
      const res = await fetch('https://mysupro.duckdns.org/api/tuto/submissions/list');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.submissions)) {
          setSubmissions(data.submissions);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch submissions:', err);
    } finally {
      setIsLoadingSubmissions(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'submissions') {
      fetchSubmissions();
    }
  }, [activeTab, fetchSubmissions]);

  const handleReviewAndAlert = async (sub: any) => {
    const comments = (teacherRemarks[sub.id] || '🌟 Excellent dedication and consistent daily study! Keep aiming high.').trim();
    const xp = bonusXpMap[sub.id] || 100;

    setIsAlerting((prev) => ({ ...prev, [sub.id]: true }));
    try {
      const res = await fetch('https://mysupro.duckdns.org/api/tuto/submissions/review-and-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: sub.id,
          teacherName: user?.name || 'Lead Academic Guide',
          remarks: comments,
          rating: 5,
          bonusXp: xp,
          sendWhatsApp: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        Alert.alert(
          'Student Alerted! 🔔',
          `Commendation & +${xp} XP sent to ${sub.student_name} via In-App Alert and WhatsApp!`
        );
        // Mark locally approved
        setSubmissions((prev) =>
          prev.map((s) => (s.id === sub.id ? { ...s, status: 'approved', teacher_remarks: comments, rating: 5, bonus_xp: xp } : s))
        );
      } else {
        Alert.alert('Alert Error', data.error || 'Failed to dispatch alert.');
      }
    } catch (e: any) {
      Alert.alert('Network Error', e.message || 'Failed to contact review server.');
    } finally {
      setIsAlerting((prev) => ({ ...prev, [sub.id]: false }));
    }
  };

  // Google Sheet Manager States
  const [sheetUrl, setSheetUrl] = useState('');
  const [sheetTabName, setSheetTabName] = useState('Sheet1');
  const [isSyncingSheet, setIsSyncingSheet] = useState(false);
  const [sheetPlans, setSheetPlans] = useState<Record<string, GoogleSheetDayPlanItem>>({});
  const [sheetConfig, setSheetConfig] = useState<GoogleSheetConfig | null>(null);

  useEffect(() => {
    GoogleSheetsDayPlanService.getSavedConfig().then((cfg) => {
      if (cfg) {
        setSheetConfig(cfg);
        if (cfg.sheetUrl) setSheetUrl(cfg.sheetUrl);
        if (cfg.sheetName) setSheetTabName(cfg.sheetName);
      }
    });
    GoogleSheetsDayPlanService.getCachedDayPlans().then((plans) => {
      setSheetPlans(plans);
    });
  }, []);

  const handleSyncGoogleSheet = async () => {
    if (!sheetUrl.trim()) {
      Alert.alert('Missing Link', 'Please enter a valid Google Spreadsheet URL or Sheet ID.');
      return;
    }
    setIsSyncingSheet(true);
    const res = await GoogleSheetsDayPlanService.syncGoogleSheet(sheetUrl.trim(), sheetTabName.trim() || 'Sheet1');
    setIsSyncingSheet(false);
    if (res.success) {
      const plans = await GoogleSheetsDayPlanService.getCachedDayPlans();
      setSheetPlans(plans);
      const cfg = await GoogleSheetsDayPlanService.getSavedConfig();
      setSheetConfig(cfg);
      Alert.alert(
        'Google Sheet Synced! ⚡',
        `Successfully synchronized ${res.count} day plans across ${res.courses.length} courses!`
      );
    } else {
      Alert.alert('Sync Failed ❌', res.error || 'Failed to sync Google Sheet. Please check permissions.');
    }
  };

  // Filtered Submissions
  const filteredSubmissions = useMemo(() => {
    if (subFilter === 'pending') return submissions.filter((s) => s.status === 'submitted' || !s.status);
    if (subFilter === 'approved') return submissions.filter((s) => s.status === 'approved');
    return submissions;
  }, [submissions, subFilter]);

  const termText =
    dayNumber <= 120
      ? 'Term 1: Foundations'
      : dayNumber <= 240
      ? 'Term 2: Applied & Lab'
      : 'Term 3: Advanced Revision';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ─── 1. HEADER ─── */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <View style={styles.adminBadgeRow}>
            <View style={styles.adminBadge}>
              <ShieldCheck size={12} color="#00D084" />
              <Text style={styles.adminBadgeText}>TUTO ACADEMIC STUDIO</Text>
            </View>
            <View style={styles.keyBadge}>
              <Text style={styles.keyBadgeText}>OCI Cloud Connected</Text>
            </View>
          </View>
          <Text style={styles.headerTitle}>Curriculum & Teacher Evaluation Hub</Text>
        </View>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack?.()}>
          <ArrowLeft size={18} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {/* ─── 2. TAB SELECTOR BAR ─── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBarScroll}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'day_plan' && styles.tabBtnActive]}
          onPress={() => setActiveTab('day_plan')}
        >
          <Clock size={13} color={activeTab === 'day_plan' ? '#070C18' : '#38BDF8'} />
          <Text style={[styles.tabBtnText, activeTab === 'day_plan' && styles.tabBtnTextActive]}>
            365 Day Plans Studio
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'submissions' && styles.tabBtnActive]}
          onPress={() => {
            setActiveTab('submissions');
            fetchSubmissions();
          }}
        >
          <Award size={13} color={activeTab === 'submissions' ? '#070C18' : '#00D084'} />
          <Text style={[styles.tabBtnText, activeTab === 'submissions' && styles.tabBtnTextActive]}>
            Teacher Submissions ({submissions.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'google_sheets' && styles.tabBtnActive]}
          onPress={() => setActiveTab('google_sheets')}
        >
          <Layers size={13} color={activeTab === 'google_sheets' ? '#070C18' : '#FBBF24'} />
          <Text style={[styles.tabBtnText, activeTab === 'google_sheets' && styles.tabBtnTextActive]}>
            Google Sheet Sync
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ─── TAB 1: 365-DAY PLAN STUDIO ─── */}
      {activeTab === 'day_plan' && (
        <ScrollView style={styles.bodyScroll} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
          {/* Target Course Selector Bar */}
          <View style={styles.controlBox}>
            <Text style={styles.controlBoxLabel}>SELECT COURSE / GRADE:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingVertical: 4 }}>
              {ALL_COURSES.map((c) => {
                const isSelected = selectedCourse.id === c.id;
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.courseChip, isSelected && styles.courseChipActive]}
                    onPress={() => setSelectedCourse(c)}
                  >
                    <Text style={[styles.courseChipText, isSelected && styles.courseChipTextActive]}>
                      {c.short}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Career Ambition Track Selector */}
          <View style={styles.controlBox}>
            <Text style={styles.controlBoxLabel}>SELECT FUTURISTIC CAREER TRACK:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingVertical: 4 }}>
              {AMBITION_FEATURE_TRACKS.map((trk) => {
                const isAct = selectedAmbitionId === trk.id;
                return (
                  <TouchableOpacity
                    key={trk.id}
                    style={[styles.ambitionChip, isAct && styles.ambitionChipActive]}
                    onPress={() => setSelectedAmbitionId(trk.id)}
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

          {/* 365-Day Navigator Bar */}
          <View style={styles.dayNavBox}>
            <View style={styles.dayNavTopRow}>
              <TouchableOpacity
                onPress={() => setDayNumber((d) => Math.max(1, d - 1))}
                disabled={dayNumber <= 1}
                style={[styles.navStepBtn, dayNumber <= 1 && { opacity: 0.4 }]}
              >
                <ChevronLeft size={16} color="#FFFFFF" />
                <Text style={styles.navStepBtnText}>Prev Day</Text>
              </TouchableOpacity>

              <View style={{ alignItems: 'center', gap: 4 }}>
                <View style={styles.dayHeaderBadge}>
                  <Calendar size={13} color="#FBBF24" />
                  <Text style={styles.dayHeaderText}>Day {dayNumber} of 365</Text>
                </View>
                <Text style={styles.termHeaderText}>{termText}</Text>
              </View>

              <TouchableOpacity
                onPress={() => setDayNumber((d) => Math.min(365, d + 1))}
                disabled={dayNumber >= 365}
                style={[styles.navStepBtn, dayNumber >= 365 && { opacity: 0.4 }]}
              >
                <Text style={styles.navStepBtnText}>Next Day</Text>
                <ChevronRight size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Quick Day Jump Chips */}
            <View style={styles.quickJumpWrap}>
              {[1, 50, 100, 180, 250, 365].map((d) => (
                <TouchableOpacity
                  key={d}
                  onPress={() => setDayNumber(d)}
                  style={[styles.quickJumpPill, dayNumber === d && styles.quickJumpPillActive]}
                >
                  <Text style={[styles.quickJumpPillText, dayNumber === d && { color: '#0B1120' }]}>
                    D{d}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Status & Action Banner */}
          <View style={styles.statusBanner}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View
                  style={[
                    styles.cloudStatusDot,
                    isCustomFromOci ? { backgroundColor: '#00D084' } : { backgroundColor: '#38BDF8' },
                  ]}
                />
                <Text style={styles.cloudStatusText}>
                  {isCustomFromOci ? 'Cloud Customized & Published' : 'Standard 365 Curriculum Baseline'}
                </Text>
              </View>
              <Text style={styles.cloudStatusSub}>
                {selectedCourse.title} • Day {dayNumber}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleSaveToOciCloud}
              disabled={isSaving}
              style={styles.saveOciBtn}
              activeOpacity={0.8}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#0B1120" />
              ) : (
                <>
                  <Save size={14} color="#0B1120" />
                  <Text style={styles.saveOciBtnText}>Save & Publish</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* 10 Editable Classes */}
          {isLoadingDayPlan ? (
            <ActivityIndicator size="large" color="#00D084" style={{ marginVertical: 30 }} />
          ) : (
            <View style={styles.classesCardWrap}>
              <Text style={styles.sectionHeading}>📚 10 CLASSES SCHEDULE FOR DAY {dayNumber}:</Text>
              {adminClasses.map((cls, idx) => (
                <View key={cls.id || idx} style={styles.editClassCard}>
                  <View style={styles.editClassHeader}>
                    <Text style={styles.editClassNumber}>CLASS {cls.id}</Text>
                    <Text style={styles.editClassSubject}>{cls.subject}</Text>
                    <Text style={styles.editClassDuration}>⏱ {cls.duration}</Text>
                    <Text style={styles.editClassXp}>+{cls.xp} XP</Text>
                  </View>

                  <Text style={styles.inputTitleLabel}>Class Title:</Text>
                  <TextInput
                    style={styles.textInput}
                    value={cls.title}
                    onChangeText={(text) => {
                      setAdminClasses((prev) => {
                        const copy = [...prev];
                        copy[idx] = { ...copy[idx], title: text };
                        return copy;
                      });
                    }}
                  />

                  <Text style={styles.inputTitleLabel}>Micro-Topic / Lesson Breakdown:</Text>
                  <TextInput
                    style={[styles.textInput, { minHeight: 46 }]}
                    multiline
                    value={cls.microTopic || ''}
                    placeholder="Enter micro-topic breakdown..."
                    placeholderTextColor="#64748B"
                    onChangeText={(text) => {
                      setAdminClasses((prev) => {
                        const copy = [...prev];
                        copy[idx] = { ...copy[idx], microTopic: text };
                        return copy;
                      });
                    }}
                  />
                </View>
              ))}

              {/* Class 10 MCQs Editor */}
              {adminDailyTest && (
                <View style={styles.quizEditorCard}>
                  <View style={styles.quizEditorHeader}>
                    <Zap size={14} color="#FBBF24" />
                    <Text style={styles.quizEditorTitle}>
                      Class 10 Bedtime Mock Test ({adminDailyTest.questions.length} MCQs):
                    </Text>
                  </View>
                  {adminDailyTest.questions.map((q, qIdx) => (
                    <View key={q.id || qIdx} style={styles.mcqItemBox}>
                      <Text style={styles.mcqIndexLabel}>Question {qIdx + 1}:</Text>
                      <TextInput
                        style={styles.textInput}
                        value={q.question}
                        onChangeText={(txt) => {
                          setAdminDailyTest((prev) => {
                            if (!prev) return null;
                            const copy = [...prev.questions];
                            copy[qIdx] = { ...copy[qIdx], question: txt };
                            return { ...prev, questions: copy };
                          });
                        }}
                      />
                      <Text style={styles.mcqOptionsLabel}>Correct Answer: [{q.correctOption}]</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Daily Yoga Editor */}
              {adminYoga && (
                <View style={styles.yogaEditorCard}>
                  <View style={styles.yogaEditorHeader}>
                    <Heart size={14} color="#EC4899" />
                    <Text style={styles.yogaEditorTitle}>🧘 Day {dayNumber} Yoga & Wellness Routine:</Text>
                  </View>
                  <Text style={styles.inputTitleLabel}>Asana Name:</Text>
                  <TextInput
                    style={styles.textInput}
                    value={adminYoga.name}
                    onChangeText={(txt) => setAdminYoga((prev) => (prev ? { ...prev, name: txt } : null))}
                  />
                  <Text style={styles.inputTitleLabel}>Breathing Pattern:</Text>
                  <TextInput
                    style={styles.textInput}
                    value={adminYoga.breathing}
                    onChangeText={(txt) => setAdminYoga((prev) => (prev ? { ...prev, breathing: txt } : null))}
                  />
                </View>
              )}

              {/* Bottom Big Save Button */}
              <TouchableOpacity
                onPress={handleSaveToOciCloud}
                disabled={isSaving}
                style={styles.bigSaveBtn}
                activeOpacity={0.8}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#0B1120" />
                ) : (
                  <>
                    <Save size={16} color="#0B1120" />
                    <Text style={styles.bigSaveBtnText}>
                      Save & Publish Day {dayNumber} Plan to OCI Cloud 🚀
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

      {/* ─── TAB 2: MODULE 2 TEACHER SUBMISSIONS EVALUATION STUDIO ─── */}
      {activeTab === 'submissions' && (
        <ScrollView style={styles.bodyScroll} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
          {/* Header Card */}
          <View style={styles.subStudioBanner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.subStudioTitle}>Module 2 • Teacher Evaluation Studio</Text>
              <Text style={styles.subStudioSubtitle}>
                Review student day missions, award ratings & bonus XP, and trigger immediate WhatsApp alerts.
              </Text>
            </View>
            <TouchableOpacity onPress={fetchSubmissions} style={styles.refreshBtn}>
              <RefreshCw size={14} color="#00D084" />
            </TouchableOpacity>
          </View>

          {/* Filter Chips */}
          <View style={styles.filterRow}>
            {(['all', 'pending', 'approved'] as const).map((f) => (
              <TouchableOpacity
                key={f}
                onPress={() => setSubFilter(f)}
                style={[styles.filterChip, subFilter === f && styles.filterChipActive]}
              >
                <Text style={[styles.filterChipText, subFilter === f && styles.filterChipTextActive]}>
                  {f === 'all' ? `All (${submissions.length})` : f === 'pending' ? 'Pending Review' : 'Approved'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Submissions List */}
          {isLoadingSubmissions ? (
            <ActivityIndicator size="large" color="#00D084" style={{ marginVertical: 30 }} />
          ) : filteredSubmissions.length === 0 ? (
            <View style={styles.emptyCard}>
              <Award size={32} color="#64748B" />
              <Text style={styles.emptyTitle}>No Submissions Found</Text>
              <Text style={styles.emptySub}>No student missions match the current filter.</Text>
            </View>
          ) : (
            filteredSubmissions.map((sub) => {
              const isApproved = sub.status === 'approved';
              const isSendingAlert = isAlerting[sub.id] || false;
              const currentXp = bonusXpMap[sub.id] || 100;
              const remarks = teacherRemarks[sub.id] ?? (sub.teacher_remarks || '🌟 Excellent work! Keep aiming high.');

              return (
                <View key={sub.id} style={styles.submissionCard}>
                  {/* Card Header */}
                  <View style={styles.subCardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.studentNameText}>{sub.student_name || 'Scholar'}</Text>
                      <Text style={styles.studentPhoneText}>
                        📱 +91 {sub.student_phone} • {sub.academic_class} • {sub.ambition_id?.toUpperCase()}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.subStatusBadge,
                        isApproved
                          ? { backgroundColor: 'rgba(0, 208, 132, 0.2)' }
                          : { backgroundColor: 'rgba(251, 191, 36, 0.2)' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.subStatusText,
                          isApproved ? { color: '#00D084' } : { color: '#FBBF24' },
                        ]}
                      >
                        {isApproved ? 'Approved' : 'Pending Review'}
                      </Text>
                    </View>
                  </View>

                  {/* Metrics Row */}
                  <View style={styles.subMetricsRow}>
                    <View style={styles.subMetricBox}>
                      <Text style={styles.subMetricLabel}>DAY</Text>
                      <Text style={styles.subMetricVal}>Day {sub.day_number}</Text>
                    </View>
                    <View style={styles.subMetricBox}>
                      <Text style={styles.subMetricLabel}>CLASSES</Text>
                      <Text style={styles.subMetricVal}>{sub.classes_completed}/10</Text>
                    </View>
                    <View style={styles.subMetricBox}>
                      <Text style={styles.subMetricLabel}>TEST SCORE</Text>
                      <Text style={styles.subMetricVal}>{sub.test_score}%</Text>
                    </View>
                    <View style={styles.subMetricBox}>
                      <Text style={styles.subMetricLabel}>EARNED XP</Text>
                      <Text style={[styles.subMetricVal, { color: '#FBBF24' }]}>+{sub.xp_earned} XP</Text>
                    </View>
                  </View>

                  {/* Student Reflection Notes */}
                  {sub.student_notes ? (
                    <View style={styles.notesBox}>
                      <Text style={styles.notesBoxTitle}>Student Notes & Doubts:</Text>
                      <Text style={styles.notesBoxContent}>&ldquo;{sub.student_notes}&rdquo;</Text>
                    </View>
                  ) : null}

                  {/* Teacher Feedback Section */}
                  <View style={styles.feedbackSection}>
                    <Text style={styles.feedbackLabel}>Teacher Evaluation Remarks:</Text>
                    <TextInput
                      style={styles.feedbackInput}
                      value={remarks}
                      placeholder="Write feedback for student..."
                      placeholderTextColor="#64748B"
                      onChangeText={(txt) => setTeacherRemarks((prev) => ({ ...prev, [sub.id]: txt }))}
                    />

                    {/* Bonus XP Pills */}
                    <View style={styles.bonusXpRow}>
                      <Text style={styles.bonusXpLabel}>Award Bonus XP:</Text>
                      {[50, 100, 200].map((xp) => (
                        <TouchableOpacity
                          key={xp}
                          onPress={() => setBonusXpMap((prev) => ({ ...prev, [sub.id]: xp }))}
                          style={[styles.xpPillBtn, currentXp === xp && styles.xpPillBtnActive]}
                        >
                          <Text style={[styles.xpPillBtnText, currentXp === xp && { color: '#0B1120' }]}>
                            +{xp} XP
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Alert Action Button */}
                    <TouchableOpacity
                      onPress={() => handleReviewAndAlert(sub)}
                      disabled={isSendingAlert}
                      style={[styles.alertActionBtn, isApproved && { backgroundColor: '#1E293B' }]}
                      activeOpacity={0.8}
                    >
                      {isSendingAlert ? (
                        <ActivityIndicator size="small" color="#0B1120" />
                      ) : (
                        <>
                          <Send size={14} color={isApproved ? '#00D084' : '#0B1120'} />
                          <Text style={[styles.alertActionBtnText, isApproved && { color: '#00D084' }]}>
                            {isApproved ? '✓ Re-Alert Student (App & WhatsApp)' : '🔔 Alert Student (App & WhatsApp)'}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      {/* ─── TAB 3: GOOGLE SHEETS SYNC ─── */}
      {activeTab === 'google_sheets' && (
        <ScrollView style={styles.bodyScroll} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
          <View style={styles.sheetSyncCard}>
            <Text style={styles.sheetCardTitle}>📊 Google Sheets 365 Days Sync</Text>
            <Text style={styles.sheetCardSub}>
              Sync live spreadsheet day plans with topics, micro-topics, video IDs, and 5 MCQs.
            </Text>

            <Text style={styles.inputTitleLabel}>Google Spreadsheet URL or Sheet ID:</Text>
            <TextInput
              style={styles.textInput}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              placeholderTextColor="#64748B"
              value={sheetUrl}
              onChangeText={setSheetUrl}
            />

            <Text style={styles.inputTitleLabel}>Sheet Tab Name:</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Sheet1"
              placeholderTextColor="#64748B"
              value={sheetTabName}
              onChangeText={setSheetTabName}
            />

            <TouchableOpacity
              onPress={handleSyncGoogleSheet}
              disabled={isSyncingSheet}
              style={styles.syncBtn}
              activeOpacity={0.8}
            >
              {isSyncingSheet ? (
                <ActivityIndicator size="small" color="#0B1120" />
              ) : (
                <>
                  <Layers size={15} color="#0B1120" />
                  <Text style={styles.syncBtnText}>Synchronize Day Plans ⚡</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  adminBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  adminBadgeText: {
    color: '#00D084',
    fontSize: 9,
    fontWeight: '900',
  },
  keyBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  keyBadgeText: {
    color: '#38BDF8',
    fontSize: 9,
    fontWeight: '700',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  backBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  tabBarScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#0E172A',
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  tabBtnActive: {
    backgroundColor: '#00D084',
  },
  tabBtnText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  tabBtnTextActive: {
    color: '#070C18',
    fontWeight: '900',
  },
  bodyScroll: {
    flex: 1,
  },
  bodyContent: {
    padding: 14,
    gap: 12,
  },
  controlBox: {
    backgroundColor: '#0E172A',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  controlBoxLabel: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '800',
    marginBottom: 6,
  },
  courseChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  courseChipActive: {
    backgroundColor: '#00D084',
  },
  courseChipText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '700',
  },
  courseChipTextActive: {
    color: '#070C18',
    fontWeight: '900',
  },
  ambitionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  ambitionChipActive: {
    backgroundColor: '#F59E0B',
  },
  ambitionChipText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '700',
  },
  ambitionChipTextActive: {
    color: '#070C18',
    fontWeight: '900',
  },
  dayNavBox: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
  },
  dayNavTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navStepBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  navStepBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  dayHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dayHeaderText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  termHeaderText: {
    color: '#93C5FD',
    fontSize: 10,
    fontWeight: '700',
  },
  quickJumpWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  quickJumpPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  quickJumpPillActive: {
    backgroundColor: '#FBBF24',
  },
  quickJumpPillText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  statusBanner: {
    backgroundColor: '#1E1B4B',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  cloudStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cloudStatusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  cloudStatusSub: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2,
  },
  saveOciBtn: {
    backgroundColor: '#00D084',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  saveOciBtnText: {
    color: '#0B1120',
    fontSize: 11,
    fontWeight: '900',
  },
  classesCardWrap: {
    gap: 10,
  },
  sectionHeading: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '800',
    marginVertical: 4,
  },
  editClassCard: {
    backgroundColor: '#0E172A',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 4,
  },
  editClassHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  editClassNumber: {
    color: '#FBBF24',
    fontSize: 10,
    fontWeight: '900',
  },
  editClassSubject: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  editClassDuration: {
    color: '#64748B',
    fontSize: 10,
  },
  editClassXp: {
    color: '#00D084',
    fontSize: 10,
    fontWeight: '800',
  },
  inputTitleLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
  textInput: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  quizEditorCard: {
    backgroundColor: '#0E172A',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    gap: 8,
  },
  quizEditorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quizEditorTitle: {
    color: '#FBBF24',
    fontSize: 12,
    fontWeight: '800',
  },
  mcqItemBox: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 8,
    gap: 4,
  },
  mcqIndexLabel: {
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '700',
  },
  mcqOptionsLabel: {
    color: '#00D084',
    fontSize: 10,
    fontWeight: '800',
  },
  yogaEditorCard: {
    backgroundColor: '#0E172A',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.3)',
    gap: 4,
  },
  yogaEditorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  yogaEditorTitle: {
    color: '#EC4899',
    fontSize: 12,
    fontWeight: '800',
  },
  bigSaveBtn: {
    backgroundColor: '#00D084',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  bigSaveBtnText: {
    color: '#0B1120',
    fontSize: 13,
    fontWeight: '900',
  },
  // Submissions Tab
  subStudioBanner: {
    backgroundColor: '#1E1B4B',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#00D084',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subStudioTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  subStudioSubtitle: {
    color: '#CBD5E1',
    fontSize: 10,
    marginTop: 2,
    lineHeight: 14,
  },
  refreshBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#0E172A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterChipActive: {
    backgroundColor: '#00D084',
    borderColor: '#00D084',
  },
  filterChipText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: '#070C18',
    fontWeight: '900',
  },
  emptyCard: {
    backgroundColor: '#0E172A',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  emptySub: {
    color: '#64748B',
    fontSize: 11,
  },
  submissionCard: {
    backgroundColor: '#0E172A',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 10,
  },
  subCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  studentNameText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  studentPhoneText: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2,
  },
  subStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  subStatusText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  subMetricsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  subMetricBox: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 6,
    alignItems: 'center',
  },
  subMetricLabel: {
    color: '#64748B',
    fontSize: 8,
    fontWeight: '800',
  },
  subMetricVal: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    marginTop: 2,
  },
  notesBox: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 10,
  },
  notesBoxTitle: {
    color: '#FBBF24',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 2,
  },
  notesBoxContent: {
    color: '#CBD5E1',
    fontSize: 11,
    fontStyle: 'italic',
  },
  feedbackSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 10,
    gap: 8,
  },
  feedbackLabel: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '800',
  },
  feedbackInput: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 8,
    color: '#FFFFFF',
    fontSize: 11,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  bonusXpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bonusXpLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
  },
  xpPillBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  xpPillBtnActive: {
    backgroundColor: '#FBBF24',
  },
  xpPillBtnText: {
    color: '#FBBF24',
    fontSize: 10,
    fontWeight: '800',
  },
  alertActionBtn: {
    backgroundColor: '#00D084',
    borderRadius: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  alertActionBtnText: {
    color: '#0B1120',
    fontSize: 12,
    fontWeight: '900',
  },
  // Google Sheets Tab
  sheetSyncCard: {
    backgroundColor: '#0E172A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 8,
  },
  sheetCardTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  sheetCardSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginBottom: 8,
  },
  syncBtn: {
    backgroundColor: '#00D084',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  syncBtnText: {
    color: '#0B1120',
    fontSize: 12,
    fontWeight: '900',
  },
});
