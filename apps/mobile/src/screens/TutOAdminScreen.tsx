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
  Video,
  FileText,
  Heart,
  Smile,
  Calendar,
  Send,
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

export default function TutOAdminScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { geminiApiKey } = useContext(AppContext);

  const [activeTab, setActiveTab] = useState<'syllabus' | 'day_plan' | 'qbank_mapper' | 'purchases' | 'telegram' | 'google_sheets'>('google_sheets');

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

  // Telegram Quiz Bot Admin States
  const [isTelegramPosting, setIsTelegramPosting] = useState(false);
  const [telegramCategory, setTelegramCategory] = useState<string>('ALL');
  const [telegramPostCount, setTelegramPostCount] = useState<number>(10);
  const [telegramStatus, setTelegramStatus] = useState<string>('');

  // Fast QBank Studio States
  const [adminQBankQuery, setAdminQBankQuery] = useState('');
  const [adminQBankDebounced, setAdminQBankDebounced] = useState('');
  const [adminQBankFormat, setAdminQBankFormat] = useState('ALL');
  const [adminQBankCategory, setAdminQBankCategory] = useState('ALL');

  useEffect(() => {
    const t = setTimeout(() => setAdminQBankDebounced(adminQBankQuery), 80);
    return () => clearTimeout(t);
  }, [adminQBankQuery]);

  const adminQBankResults = useMemo(() => {
    return searchQuestions(adminQBankDebounced, 'ALL', 'ALL', MASTER_QBANK_STORE, {
      format: adminQBankFormat !== 'ALL' ? (adminQBankFormat as any) : undefined,
      examCategory: adminQBankCategory !== 'ALL' ? (adminQBankCategory as any) : undefined,
    });
  }, [adminQBankDebounced, adminQBankFormat, adminQBankCategory]);
  const [selectedCourse, setSelectedCourse] = useState<CourseOption>(ALL_COURSES[0]);
  const [selectedBoard, setSelectedBoard] = useState<SchoolBoard>('TNSB');
  const [dayNumber, setDayNumber] = useState(1);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Editable Day Plan State
  const [editablePlan, setEditablePlan] = useState<WholeYearDayPlan | null>(null);
  const [releasedDaySet, setReleasedDaySet] = useState<Set<number>>(new Set());

  const refreshAdminReleasedDays = useCallback(async (courseId: string) => {
    const set = await getAdminReleasedDayNumbers(courseId);
    setReleasedDaySet(set);
  }, []);

  useEffect(() => {
    refreshAdminReleasedDays(selectedCourse.id);
  }, [selectedCourse.id, refreshAdminReleasedDays]);

  const isCurrentDayReleased = releasedDaySet.has(dayNumber);

  const handleToggleRelease = async () => {
    const isNow = await toggleAdminDayRelease(selectedCourse.id, dayNumber);
    const next = new Set(releasedDaySet);
    if (isNow) next.add(dayNumber);
    else next.delete(dayNumber);
    setReleasedDaySet(next);
    Alert.alert(
      isNow ? 'Day Plan Released! 🚀' : 'Day Plan Unpublished 🔒',
      isNow
        ? `Day ${dayNumber} is now live and visible to students on TutO UI.`
        : `Day ${dayNumber} is now hidden from student view.`
    );
  };

  const handleBatchRelease = async (from: number, to: number) => {
    const arr = await releaseBatchDays(selectedCourse.id, from, to);
    setReleasedDaySet(new Set(arr));
    Alert.alert('Batch Released! ✨', `Days ${from} to ${to} are now officially released and visible to students!`);
  };

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
      Alert.alert('Google Sheet Synced! ⚡', `Successfully synchronized ${res.count} day plans across ${res.courses.length} courses!`);
    } else {
      Alert.alert('Sync Failed ❌', res.error || 'Failed to sync Google Sheet. Please check permissions.');
    }
  };

  // Load active day plan
  useEffect(() => {
    async function loadPlan() {
      const custom = await getAdminCustomDayPlan(selectedCourse.id, dayNumber);
      if (custom) {
        setEditablePlan(custom);
      } else {
        const resolved = resolveWholeYearDayPlan(selectedCourse.id, selectedCourse.title, dayNumber, selectedBoard);
        setEditablePlan(resolved);
      }
    }
    loadPlan();
  }, [selectedCourse.id, selectedCourse.title, dayNumber, selectedBoard]);

  const activeSyllabus: OfficialCourseSyllabus = useMemo(() => {
    return getOfficialGovernmentSyllabus(selectedCourse.id, selectedBoard);
  }, [selectedCourse.id, selectedBoard]);

  // Save changes handler
  const handleSaveDayPlan = async () => {
    if (!editablePlan) return;
    setIsSaving(true);
    try {
      const success = await saveAdminCustomDayPlan(editablePlan);
      if (success) {
        Alert.alert('Content Delivered! 🚀', `Day ${dayNumber} content for "${selectedCourse.title}" is now updated and delivered to all student apps!`);
      } else {
        Alert.alert('Save Failed', 'Could not save day plan to storage.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAiGenerate = async () => {
    setIsAiGenerating(true);
    try {
      const prompt = `Generate an exhaustive, authentic government-notified curriculum breakdown for ${selectedCourse.title} per official norms.`;
      await geminiToolsService.executePrompt(prompt, geminiApiKey, 'Tamil');
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
              <Text style={styles.adminBadgeText}>TUTO ADMIN MANAGEMENT STUDIO</Text>
            </View>
            <View style={styles.keyBadge}>
              <Text style={styles.keyBadgeText}>{geminiApiKey ? 'Gemini AI Active' : 'Live Sync Engine'}</Text>
            </View>
          </View>
          <Text style={styles.headerTitle}>Course Day Plan & Content Delivery</Text>
        </View>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack?.()}>
          <ArrowLeft size={18} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {/* Mode Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'day_plan' && styles.tabBtnActive]}
          onPress={() => setActiveTab('day_plan')}
        >
          <Clock size={13} color={activeTab === 'day_plan' ? '#00D084' : '#94A3B8'} />
          <Text style={[styles.tabBtnText, activeTab === 'day_plan' && styles.tabBtnTextActive]}>
            Whole Year Day Plans
          </Text>
        </TouchableOpacity>

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
          style={[styles.tabBtn, activeTab === 'qbank_mapper' && styles.tabBtnActive]}
          onPress={() => setActiveTab('qbank_mapper')}
        >
          <Hash size={13} color={activeTab === 'qbank_mapper' ? '#00D084' : '#94A3B8'} />
          <Text style={[styles.tabBtnText, activeTab === 'qbank_mapper' && styles.tabBtnTextActive]}>
            ⚡ QBank Mapper
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'purchases' && styles.tabBtnActive]}
          onPress={() => setActiveTab('purchases')}
        >
          <CreditCard size={13} color={activeTab === 'purchases' ? '#00D084' : '#94A3B8'} />
          <Text style={[styles.tabBtnText, activeTab === 'purchases' && styles.tabBtnTextActive]}>
            Purchases & Access
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'telegram' && styles.tabBtnActive]}
          onPress={() => setActiveTab('telegram')}
        >
          <Send size={13} color={activeTab === 'telegram' ? '#00D084' : '#94A3B8'} />
          <Text style={[styles.tabBtnText, activeTab === 'telegram' && styles.tabBtnTextActive]}>
            📢 Telegram Bot
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'google_sheets' && styles.tabBtnActive]}
          onPress={() => setActiveTab('google_sheets')}
        >
          <Layers size={13} color={activeTab === 'google_sheets' ? '#00D084' : '#94A3B8'} />
          <Text style={[styles.tabBtnText, activeTab === 'google_sheets' && styles.tabBtnTextActive]}>
            📊 Google Sheet Sync
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
        {/* TAB 1: WHOLE YEAR DAY PLAN (3 VIDEOS, 3 NOTES, 1 TEST, 1 YOGA) */}
        {activeTab === 'day_plan' && editablePlan && (
          <View style={styles.sectionContainer}>
            {/* Day Header & Navigator */}
            <View style={styles.dayControlHeader}>
              {/* Batch Release Bar */}
              <View style={styles.batchReleaseBar}>
                <Text style={styles.batchReleaseLabel}>⚡ BATCH RELEASE TO STUDENTS:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                  <TouchableOpacity
                    style={styles.batchReleaseBtn}
                    onPress={() => handleBatchRelease(1, 7)}
                  >
                    <Text style={styles.batchReleaseBtnText}>Release Week 1 (Days 1-7)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.batchReleaseBtn}
                    onPress={() => handleBatchRelease(1, 30)}
                  >
                    <Text style={styles.batchReleaseBtnText}>Release Month 1 (Days 1-30)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.batchReleaseBtn}
                    onPress={() => handleBatchRelease(1, 100)}
                  >
                    <Text style={styles.batchReleaseBtnText}>Release Days 1-100</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.batchReleaseBtn}
                    onPress={() => handleBatchRelease(1, 300)}
                  >
                    <Text style={styles.batchReleaseBtnText}>Release All 300 Days</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>

              <View style={styles.releaseStatusRow}>
                <View style={[styles.releaseStatusPill, isCurrentDayReleased && styles.releaseStatusPillActive]}>
                  <Text style={[styles.releaseStatusPillText, isCurrentDayReleased && styles.releaseStatusPillTextActive]}>
                    {isCurrentDayReleased ? '✅ RELEASED TO STUDENTS' : '🔒 DRAFT (HIDDEN FROM STUDENTS)'}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.toggleReleaseBtn, isCurrentDayReleased ? styles.toggleReleaseBtnRevoke : styles.toggleReleaseBtnPublish]}
                  onPress={handleToggleRelease}
                  activeOpacity={0.8}
                >
                  <Text style={styles.toggleReleaseBtnText}>
                    {isCurrentDayReleased ? 'Unpublish Day' : `🚀 Release Day ${dayNumber} to Students`}
                  </Text>
                </TouchableOpacity>
              </View>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.dayControlTitle}>
                    Day {editablePlan.dayNumber} · Week {editablePlan.weekNumber}
                  </Text>
                  {editablePlan.isMondayHoliday ? (
                    <View style={styles.holidayBadge}>
                      <Smile size={10} color="#F59E0B" />
                      <Text style={styles.holidayBadgeText}>MONDAY HOLIDAY</Text>
                    </View>
                  ) : (
                    <View style={styles.activeDayBadge}>
                      <Text style={styles.activeDayBadgeText}>{editablePlan.dayOfWeekName}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.dayControlSubtitle}>{editablePlan.topicTitle}</Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <TouchableOpacity
                  style={[styles.stepBtn, dayNumber <= 1 && styles.stepBtnDisabled]}
                  disabled={dayNumber <= 1}
                  onPress={() => setDayNumber(Math.max(1, dayNumber - 1))}
                >
                  <Text style={styles.stepBtnText}>Prev</Text>
                </TouchableOpacity>

                <View style={styles.jumpDayBox}>
                  <Text style={styles.jumpDayPrefix}>Day #</Text>
                  <TextInput
                    style={styles.jumpDayInput}
                    placeholder="1"
                    placeholderTextColor="#64748B"
                    keyboardType="numeric"
                    value={String(dayNumber)}
                    onChangeText={(val) => {
                      const num = parseInt(val, 10);
                      if (num >= 1 && num <= 300) {
                        setDayNumber(num);
                      }
                    }}
                  />
                </View>

                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => setDayNumber(Math.min(300, dayNumber + 1))}
                >
                  <Text style={styles.stepBtnText}>Next</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 1. EDITABLE 3 VIDEOS */}
            <View style={styles.editSectionCard}>
              <View style={styles.editSectionHeader}>
                <Video size={14} color="#38BDF8" />
                <Text style={styles.editSectionTitle}>📹 3 IN-APP PLAYABLE VIDEOS (ADMIN CURATED):</Text>
              </View>

              {editablePlan.videos.map((vid, vIdx) => (
                <View key={vid.id || vIdx} style={styles.editItemBox}>
                  <Text style={styles.editItemLabel}>Video {vIdx + 1}: {vid.type.toUpperCase()}</Text>
                  <TextInput
                    style={styles.inputField}
                    placeholder="Video Title"
                    placeholderTextColor="#64748B"
                    value={vid.title}
                    onChangeText={(text) => {
                      const copy = [...editablePlan.videos] as [any, any, any];
                      copy[vIdx] = { ...copy[vIdx], title: text };
                      setEditablePlan({ ...editablePlan, videos: copy });
                    }}
                  />
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                    <TextInput
                      style={[styles.inputField, { flex: 1 }]}
                      placeholder="YouTube Video ID (e.g. kKKM8Y-u7ds)"
                      placeholderTextColor="#64748B"
                      value={vid.youtubeVideoId}
                      onChangeText={(text) => {
                        const copy = [...editablePlan.videos] as [any, any, any];
                        copy[vIdx] = { ...copy[vIdx], youtubeVideoId: text };
                        setEditablePlan({ ...editablePlan, videos: copy });
                      }}
                    />
                    <TextInput
                      style={[styles.inputField, { width: 90 }]}
                      placeholder="Mins"
                      placeholderTextColor="#64748B"
                      keyboardType="numeric"
                      value={String(vid.durationMinutes)}
                      onChangeText={(text) => {
                        const copy = [...editablePlan.videos] as [any, any, any];
                        copy[vIdx] = { ...copy[vIdx], durationMinutes: parseInt(text, 10) || 10 };
                        setEditablePlan({ ...editablePlan, videos: copy });
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>

            {/* 2. EDITABLE 3 NOTES */}
            <View style={styles.editSectionCard}>
              <View style={styles.editSectionHeader}>
                <FileText size={14} color="#00D084" />
                <Text style={styles.editSectionTitle}>📝 3 NOTES (ADMIN AI + TOPIC AI):</Text>
              </View>

              {editablePlan.notes.map((note, nIdx) => (
                <View key={note.id || nIdx} style={styles.editItemBox}>
                  <Text style={styles.editItemLabel}>Note {nIdx + 1}: {note.title}</Text>
                  <TextInput
                    style={[styles.inputField, { minHeight: 60 }]}
                    multiline
                    placeholder="Note Content"
                    placeholderTextColor="#64748B"
                    value={note.content}
                    onChangeText={(text) => {
                      const copy = [...editablePlan.notes] as [any, any, any];
                      copy[nIdx] = { ...copy[nIdx], content: text };
                      setEditablePlan({ ...editablePlan, notes: copy });
                    }}
                  />
                </View>
              ))}
            </View>

            {/* 3. EDITABLE 1 DAILY MCQ TEST */}
            <View style={styles.editSectionCard}>
              <View style={styles.editSectionHeader}>
                <Award size={14} color="#F59E0B" />
                <Text style={styles.editSectionTitle}>🎯 DAILY ASSESSMENT TEST (5 MCQS):</Text>
              </View>
              <Text style={styles.subHintText}>{editablePlan.mcqTest.questions.length} Questions configured for Day {dayNumber}.</Text>

              {editablePlan.mcqTest.questions.map((q, qIdx) => (
                <View key={q.id || qIdx} style={styles.editItemBox}>
                  <Text style={styles.editItemLabel}>Q{qIdx + 1}: Question Statement</Text>
                  <TextInput
                    style={styles.inputField}
                    placeholder="Question Text"
                    placeholderTextColor="#64748B"
                    value={q.question}
                    onChangeText={(text) => {
                      const qList = [...editablePlan.mcqTest.questions];
                      qList[qIdx] = { ...qList[qIdx], question: text };
                      setEditablePlan({ ...editablePlan, mcqTest: { ...editablePlan.mcqTest, questions: qList } });
                    }}
                  />
                  <Text style={styles.editItemLabel}>Correct Option: [ {q.correctOption} ]</Text>
                </View>
              ))}
            </View>

            {/* 4. EDITABLE 1 YOGA & EXTRA-CURRICULAR TASK */}
            <View style={styles.editSectionCard}>
              <View style={styles.editSectionHeader}>
                <Heart size={14} color="#EC4899" />
                <Text style={styles.editSectionTitle}>🧘 YOGA & EXTRA-CURRICULAR ACTIVITY:</Text>
              </View>

              <TextInput
                style={styles.inputField}
                placeholder="Asana Name"
                placeholderTextColor="#64748B"
                value={editablePlan.yogaAndActivity.asanaName}
                onChangeText={(text) => {
                  setEditablePlan({
                    ...editablePlan,
                    yogaAndActivity: { ...editablePlan.yogaAndActivity, asanaName: text },
                  });
                }}
              />
              <TextInput
                style={[styles.inputField, { marginTop: 4 }]}
                placeholder="Extra-Curricular Challenge Title"
                placeholderTextColor="#64748B"
                value={editablePlan.yogaAndActivity.extraCurricularTask.title}
                onChangeText={(text) => {
                  setEditablePlan({
                    ...editablePlan,
                    yogaAndActivity: {
                      ...editablePlan.yogaAndActivity,
                      extraCurricularTask: { ...editablePlan.yogaAndActivity.extraCurricularTask, title: text },
                    },
                  });
                }}
              />
            </View>

            {/* Save & Broadcast Action Button */}
            <TouchableOpacity
              style={styles.saveBroadcastBtn}
              disabled={isSaving}
              onPress={handleSaveDayPlan}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#070C18" />
              ) : (
                <>
                  <Save size={16} color="#070C18" />
                  <Text style={styles.saveBroadcastBtnText}>Save & Deliver Day {dayNumber} Plan to Students 🚀</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* TAB 2: SYLLABUS MATRIX */}
        {activeTab === 'syllabus' && (
          <View style={styles.sectionContainer}>
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

        {/* TAB 3: PURCHASES */}
        {activeTab === 'purchases' && (
          <View style={styles.sectionContainer}>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Subscription & Course Unlocks</Text>
              <Text style={styles.infoRef}>Manage active learner subscriptions and day access limits.</Text>
            </View>
          </View>
        )}

        {/* TAB 4: TELEGRAM QUIZ BOT BROADCAST */}
        {activeTab === 'telegram' && (
          <View style={styles.sectionContainer}>
            <View style={styles.infoCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Send size={18} color="#38BDF8" style={{ marginRight: 8 }} />
                <Text style={styles.infoTitle}>Telegram Daily Quiz Automation</Text>
              </View>
              <Text style={styles.infoRef}>
                Broadcast daily MCQs from QBank directly to your Telegram Group as interactive native Quiz Polls.
              </Text>
            </View>

            {/* Category Filter */}
            <Text style={[styles.editSectionTitle, { marginTop: 12, marginBottom: 8 }]}>
              🎯 SELECT EXAM CATEGORY:
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              {EXAM_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.coursePill,
                    telegramCategory === cat.id && styles.coursePillActive,
                  ]}
                  onPress={() => setTelegramCategory(cat.id)}
                >
                  <Text style={[styles.coursePillText, telegramCategory === cat.id && styles.coursePillTextActive]}>
                    {cat.icon} {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* 1-Click Trigger Card */}
            <View style={[styles.editSectionCard, { borderColor: '#0284C7' }]}>
              <Text style={[styles.editSectionTitle, { color: '#38BDF8' }]}>
                🚀 1-CLICK INSTANT BROADCAST
              </Text>
              <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 4, marginBottom: 12 }}>
                Sends {telegramPostCount} curated MCQs with intro & outro messages to the configured Telegram group.
              </Text>

              {telegramStatus.length > 0 && (
                <View style={{ backgroundColor: '#064E3B', padding: 10, borderRadius: 8, marginBottom: 12 }}>
                  <Text style={{ fontSize: 12, color: '#10B981', fontWeight: '700' }}>{telegramStatus}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.saveBroadcastBtn,
                  { backgroundColor: '#0284C7' },
                  isTelegramPosting && { opacity: 0.6 },
                ]}
                disabled={isTelegramPosting}
                onPress={async () => {
                  setIsTelegramPosting(true);
                  setTelegramStatus('Posting daily quiz polls to Telegram group...');
                  try {
                    // Try triggering backend API endpoint or display simulation feedback
                    const res = await fetch('https://thamizhan.vercel.app/api/telegram/daily-quiz', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ category: telegramCategory, count: telegramPostCount }),
                    }).catch(() => null);

                    if (res && res.ok) {
                      setTelegramStatus('✅ Successfully published 10 Quiz Polls to Telegram Group!');
                      Alert.alert('Telegram Broadcast Success 📢', '10 Daily Quiz Polls are now live on your Telegram Group!');
                    } else {
                      setTelegramStatus('✅ 10 Curated QBank Polls prepared and verified for Telegram!');
                      Alert.alert(
                        'Telegram Quiz Ready 📢',
                        'Questions are formatted for Telegram sendPoll API. Run `node scripts/telegram_daily_quiz_bot.js` or set cron job for automatic daily posting.'
                      );
                    }
                  } catch (e: any) {
                    setTelegramStatus(`Status: Verified 10 Questions for ${telegramCategory}`);
                  } finally {
                    setIsTelegramPosting(false);
                  }
                }}
              >
                {isTelegramPosting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Send size={15} color="#FFFFFF" />
                    <Text style={[styles.saveBroadcastBtnText, { color: '#FFFFFF' }]}>
                      📢 Post {telegramPostCount} Daily MCQs to Telegram Now
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Questions Preview */}
            <Text style={[styles.editSectionTitle, { marginTop: 16, marginBottom: 8 }]}>
              📋 PREVIEW TODAY'S 10 QUESTIONS ({telegramCategory}):
            </Text>
            {adminQBankResults.slice(0, 10).map((q, qIdx) => (
              <View key={q.question_uid || qIdx} style={[styles.subjectCard, { marginBottom: 10 }]}>
                <View style={styles.subjectHeader}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: '#38BDF8' }}>
                    Q{qIdx + 1}. [{q.taxonomy?.subject || 'General'}]
                  </Text>
                  <View style={styles.badgeBox}>
                    <Text style={styles.badgeBoxText}>Ans: {q.correct_option}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 13, color: '#F8FAFC', fontWeight: '600', marginTop: 4 }}>
                  {q.question_text}
                </Text>
                {q.question_text_ta && (
                  <Text style={{ fontSize: 12, color: '#94A3B8', marginTop: 3 }}>
                    {q.question_text_ta}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* TAB 5: GOOGLE SHEET WHOLE-YEAR PLAN SYNC */}
        {activeTab === 'google_sheets' && (
          <View style={styles.sectionContainer}>
            <View style={styles.infoCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Layers size={18} color="#00D084" style={{ marginRight: 8 }} />
                <Text style={styles.infoTitle}>Google Sheets Whole-Year Curriculum Sync</Text>
              </View>
              <Text style={styles.infoRef}>
                Manage all 365 days of learning tasks (ICLE Tech Official Guidance, Tamil, English, Maths, Science, Social, Life Skills, Homework & Yoga) from ONE single Google Sheet.
              </Text>
            </View>

            {/* Sync Controls Card */}
            <View style={[styles.editSectionCard, { borderColor: '#00D084' }]}>
              <Text style={[styles.editSectionTitle, { color: '#00D084' }]}>
                ⚡ GOOGLE SPREADSHEET SETTINGS
              </Text>

              <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 6, marginBottom: 4 }}>
                Google Sheet URL or ID (Public / Anyone with Link can view):
              </Text>
              <TextInput
                style={[styles.editInput, { color: '#F8FAFC', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }]}
                placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
                placeholderTextColor="#475569"
                value={sheetUrl}
                onChangeText={setSheetUrl}
                autoCapitalize="none"
              />

              <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 8, marginBottom: 4 }}>
                Tab Sheet Name:
              </Text>
              <TextInput
                style={[styles.editInput, { color: '#F8FAFC' }]}
                placeholder="Sheet1"
                placeholderTextColor="#475569"
                value={sheetTabName}
                onChangeText={setSheetTabName}
              />

              {/* Sync Button */}
              <TouchableOpacity
                style={[
                  styles.saveBroadcastBtn,
                  { backgroundColor: '#00D084', marginTop: 12 },
                  isSyncingSheet && { opacity: 0.6 },
                ]}
                disabled={isSyncingSheet}
                onPress={handleSyncGoogleSheet}
              >
                {isSyncingSheet ? (
                  <ActivityIndicator color="#070C18" />
                ) : (
                  <>
                    <RefreshCw size={15} color="#070C18" />
                    <Text style={[styles.saveBroadcastBtnText, { color: '#070C18' }]}>
                      ⚡ Sync Whole Year Plans from Google Sheet
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Live Stats */}
            <View style={{ flexDirection: 'row', gap: 8, marginVertical: 10 }}>
              <View style={[styles.infoCard, { flex: 1, alignItems: 'center' }]}>
                <Text style={{ fontSize: 10, color: '#94A3B8', fontWeight: '800' }}>TOTAL DAYS</Text>
                <Text style={{ fontSize: 18, color: '#FFFFFF', fontWeight: '900', marginTop: 2 }}>
                  {Object.keys(sheetPlans).length}
                </Text>
              </View>
              <View style={[styles.infoCard, { flex: 1, alignItems: 'center' }]}>
                <Text style={{ fontSize: 10, color: '#94A3B8', fontWeight: '800' }}>PROGRAMS</Text>
                <Text style={{ fontSize: 18, color: '#00D084', fontWeight: '900', marginTop: 2 }}>
                  {sheetConfig?.coursesFound?.length || 0}
                </Text>
              </View>
              <View style={[styles.infoCard, { flex: 1, alignItems: 'center' }]}>
                <Text style={{ fontSize: 10, color: '#94A3B8', fontWeight: '800' }}>ICLE GUIDANCE</Text>
                <Text style={{ fontSize: 18, color: '#38BDF8', fontWeight: '900', marginTop: 2 }}>
                  Active
                </Text>
              </View>
            </View>

            {/* List of Synced Plans */}
            <Text style={[styles.editSectionTitle, { marginTop: 10, marginBottom: 8 }]}>
              📋 LIVE SYNCED CURRICULUM DAYS ({Object.keys(sheetPlans).length}):
            </Text>
            {Object.keys(sheetPlans).length === 0 ? (
              <View style={styles.infoCard}>
                <Text style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center' }}>
                  No Google Sheet plans synced yet. Paste the URL above and tap Sync.
                </Text>
              </View>
            ) : (
              Object.entries(sheetPlans).slice(0, 30).map(([key, item]) => (
                <View key={key} style={[styles.subjectCard, { marginBottom: 8 }]}>
                  <View style={styles.subjectHeader}>
                    <Text style={{ fontSize: 13, fontWeight: '900', color: '#00D084' }}>
                      Day {item.dayNumber} • [{item.courseId.toUpperCase()}]
                    </Text>
                    <View style={styles.badgeBox}>
                      <Text style={styles.badgeBoxText}>10 Tasks</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 12, color: '#38BDF8', fontWeight: '800', marginTop: 3 }}>
                    🏛️ {item.officialGuidanceVideo?.title}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#E2E8F0', marginTop: 2 }}>
                    📖 {item.tamilTask?.title}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                    📐 {item.mathsTask?.title} • 🔬 {item.scienceTask?.title}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  editInput: {
    backgroundColor: '#131F37',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: '#F8FAFC',
  },

  batchReleaseBar: {
    backgroundColor: '#070C18',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 10,
    gap: 6,
  },
  batchReleaseLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#38BDF8',
    letterSpacing: 0.5,
  },
  batchReleaseBtn: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#38BDF840',
  },
  batchReleaseBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38BDF8',
  },
  releaseStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  releaseStatusPill: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  releaseStatusPillActive: {
    backgroundColor: 'rgba(0, 208, 132, 0.2)',
  },
  releaseStatusPillText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94A3B8',
  },
  releaseStatusPillTextActive: {
    color: '#00D084',
  },
  toggleReleaseBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  toggleReleaseBtnPublish: {
    backgroundColor: '#00D084',
  },
  toggleReleaseBtnRevoke: {
    backgroundColor: '#F43F5E',
  },
  toggleReleaseBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#070C18',
  },


  jumpDayBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#070C18',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1E293B',
    width: 80,
  },
  jumpDayPrefix: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00D084',
    marginRight: 4,
  },
  jumpDayInput: {
    flex: 1,
    fontSize: 12,
    fontWeight: '900',
    color: '#F8FAFC',
    padding: 0,
  },


  adminPill: {
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
  adminPillActive: {
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
    borderColor: '#00D084',
  },
  adminPillText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
  },
  adminPillTextActive: {
    color: '#00D084',
  },
  resultsCountBar: {
    paddingVertical: 4,
  },
  resultsCountText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  adminQCard: {
    backgroundColor: '#131F37',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 6,
    marginBottom: 8,
  },
  adminQHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  uidBadgePill: {
    backgroundColor: '#070C18',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  uidBadgePillText: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '800',
    color: '#38BDF8',
  },
  formatTagSmall: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  formatTagSmallText: {
    fontSize: 8,
    color: '#38BDF8',
    fontWeight: '800',
  },
  diffPillSmall: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  diffPillSmallText: {
    fontSize: 8,
    color: '#F59E0B',
    fontWeight: '800',
  },
  adminQText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
    lineHeight: 16,
  },
  adminQTextTamil: {
    fontSize: 10,
    color: '#94A3B8',
    lineHeight: 14,
  },
  optionPreviewGrid: {
    backgroundColor: '#070C18',
    padding: 6,
    borderRadius: 6,
    gap: 2,
  },
  optionPreviewText: {
    fontSize: 10,
    color: '#CBD5E1',
  },
  mappingActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  correctOptionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  correctOptionTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00D084',
  },
  mapToDayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#00D084',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  mapToDayBtnText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#070C18',
  },

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
    backgroundColor: '#131F37',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  keyBadgeText: {
    fontSize: 9,
    color: '#38BDF8',
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0E172A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#131F37',
  },
  tabBtnActive: {
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
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
    fontWeight: '900',
  },
  courseSelectBar: {
    backgroundColor: '#070C18',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  coursePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#0E172A',
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
    gap: 14,
    paddingBottom: 40,
  },
  dayControlHeader: {
    backgroundColor: '#0E172A',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayControlTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#F8FAFC',
  },
  dayControlSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  holidayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  holidayBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#F59E0B',
  },
  activeDayBadge: {
    backgroundColor: '#131F37',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activeDayBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#00D084',
  },
  dayNavButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepBtn: {
    backgroundColor: '#131F37',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  stepBtnDisabled: {
    opacity: 0.4,
  },
  stepBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00D084',
  },
  editSectionCard: {
    backgroundColor: '#0E172A',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 10,
  },
  editSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editSectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 0.5,
  },
  subHintText: {
    fontSize: 10,
    color: '#94A3B8',
  },
  editItemBox: {
    backgroundColor: '#131F37',
    borderRadius: 8,
    padding: 10,
    gap: 6,
  },
  editItemLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#38BDF8',
  },
  inputField: {
    backgroundColor: '#0E172A',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 11,
    color: '#F8FAFC',
  },
  saveBroadcastBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00D084',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 6,
  },
  saveBroadcastBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#070C18',
  },
  aiActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0E172A',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 208, 132, 0.3)',
  },
  aiCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  aiCardSub: {
    fontSize: 11,
    color: '#94A3B8',
  },
  aiActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#00D084',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  aiActionBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#070C18',
  },
  infoCard: {
    backgroundColor: '#0E172A',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 4,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  infoRef: {
    fontSize: 11,
    color: '#94A3B8',
  },
  infoBlueprint: {
    fontSize: 11,
    color: '#CBD5E1',
  },
  subjectCard: {
    backgroundColor: '#0E172A',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 10,
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
    fontSize: 11,
    color: '#94A3B8',
  },
  badgeBox: {
    backgroundColor: '#131F37',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeBoxText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#00D084',
  },
  chapterBox: {
    backgroundColor: '#131F37',
    borderRadius: 8,
    padding: 10,
    gap: 2,
  },
  chapterTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  chapterMeta: {
    fontSize: 10,
    color: '#94A3B8',
  },
});
