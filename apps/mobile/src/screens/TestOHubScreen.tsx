import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  TextInput,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Search,
  Award,
  FileCheck2,
  Sparkles,
  Zap,
  GraduationCap,
  BookOpen,
  PlayCircle,
  Bot,
  MessageCircle,
  Clock,
  Layers,
  CheckCircle2,
  Calendar,
  Layers as LayersIcon,
} from 'lucide-react-native';
import { ALL_COURSES, CourseOption } from '../data/coursesCatalog';
import { resolveMasterCurriculumPlan } from '../data/curriculum';
import { getAugmentedCourseSyllabus } from '../data/curriculum/courseSyllabusRegistry';
import { fetchTestOMcqsForTopic } from '../lib/coursePlayerEngine';
import { TeachOCoursePickerSheet } from '../components/teacho/TeachOCoursePickerSheet';

export default function TestOHubScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();

  // Selected Course
  const [selectedCourse, setSelectedCourse] = useState<CourseOption>(ALL_COURSES[0]);
  const [isCoursePickerOpen, setIsCoursePickerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'day_plan' | 'syllabus'>('day_plan');
  const [searchQuery, setSearchQuery] = useState(route?.params?.searchQuery || route?.params?.topic || '');
  const [cbtLaunchingTopic, setCbtLaunchingTopic] = useState<string | null>(null);
  const [currentDay, setCurrentDay] = useState(1);
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});

  // 1. Load active enrolled course on mount
  useEffect(() => {
    (async () => {
      try {
        const savedId = await AsyncStorage.getItem('teacho_active_enrolled_course_id');
        if (savedId) {
          const found = ALL_COURSES.find((c) => c.id === savedId);
          if (found) setSelectedCourse(found);
        }
      } catch (e) {}
    })();
  }, []);

  // 2. Handle route params if passed from other screens
  useEffect(() => {
    if (route?.params?.courseTitle) {
      const found = ALL_COURSES.find(
        (c) => c.title.toLowerCase() === route.params.courseTitle.toLowerCase() || c.id === route.params.courseId
      );
      if (found) setSelectedCourse(found);
    }
    if (route?.params?.day) {
      setCurrentDay(route.params.day);
    }
    if (route?.params?.searchQuery) {
      setSearchQuery(route.params.searchQuery);
    }
  }, [route?.params]);

  // 3. Resolve Day Plan for active course
  const activeDayPlan = useMemo(() => {
    try {
      return resolveMasterCurriculumPlan(selectedCourse, currentDay);
    } catch (e) {
      return null;
    }
  }, [selectedCourse, currentDay]);

  // 4. Resolve Full Syllabus for active course
  const fullSyllabus = useMemo(() => {
    try {
      return getAugmentedCourseSyllabus(selectedCourse.id, selectedCourse.title);
    } catch (e) {
      return [];
    }
  }, [selectedCourse.id, selectedCourse.title]);

  // 5. Direct CBT Launch Handler
  const launchTopicTest = async (topicTitle: string, subjectTitle: string, stepNumber: number = 1) => {
    try {
      setCbtLaunchingTopic(topicTitle);
      const qs = await fetchTestOMcqsForTopic(topicTitle, selectedCourse.title, 10);
      setCbtLaunchingTopic(null);

      navigation.navigate('TestOExamScreen', {
        testId: `${selectedCourse.id}_${topicTitle.toLowerCase().replace(/[^a-z0-9_]/g, '_')}`,
        title: `${subjectTitle}: ${topicTitle}`,
        topicTitle,
        subject: subjectTitle,
        courseTitle: selectedCourse.title,
        day: currentDay,
        questionCount: qs.length || 10,
        markingScheme: '+4 / -1',
        localQuestions: qs,
      });
    } catch (err: any) {
      setCbtLaunchingTopic(null);
      Alert.alert('Start Test', 'Unable to load test: ' + err.message);
    }
  };

  // 6. Deep-Link to TeachO Study Notes
  const navigateToTeachONotes = (topicTitle: string, subjectTitle: string) => {
    navigation.navigate('TeachOScreen', {
      initialTopic: topicTitle,
      initialSubject: subjectTitle,
      courseId: selectedCourse.id,
      day: currentDay,
    });
  };

  // 7. Ask AI Doubt
  const handleAskAIDoubt = (topicTitle: string, subjectTitle: string) => {
    const prompt = `I am practicing TestO MCQs for "${subjectTitle}" - Topic: "${topicTitle}" (${selectedCourse.title}). Please explain key concepts, high-yield examination formulas, and common pitfall tricks in Tamil and English.`;
    try {
      navigation.navigate('AishleeToolsScreen', {
        initialPrompt: prompt,
        topic: topicTitle,
        subject: subjectTitle,
        tool: 'Notes Maker',
        autoRun: true,
      });
    } catch (e) {
      Alert.alert('AI Tutor 🤖', prompt);
    }
  };

  // 8. Contact Teacher on WhatsApp
  const handleContactTeacherWhatsApp = (topicTitle: string, subjectTitle: string) => {
    const adminPhone = '916381029380';
    const msg = `Hello Teacher / SuprO Admin,\n\nI am practicing TestO examination for *${selectedCourse.title}*.\n📌 Subject: *${subjectTitle}*\n📖 Topic: *${topicTitle}*\n\nPlease provide expert tips and clarification for questions in this topic.\n\nThank you!`;
    const webLink = `https://wa.me/${adminPhone}?text=${encodeURIComponent(msg)}`;
    Linking.openURL(webLink).catch(() => {});
  };

  const toggleSubjectExpand = (subjName: string) => {
    setExpandedSubjects((prev) => ({
      ...prev,
      [subjName]: !prev[subjName],
    }));
  };

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#080d1a" />

      {/* ─── TOP HEADER ─────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ChevronLeft size={22} color="#f8fafc" />
          </TouchableOpacity>

          <View>
            <View style={styles.brandRow}>
              <Award size={18} color="#f59e0b" />
              <Text style={styles.brandTitle}>TestO</Text>
              <View style={styles.cbtBadge}>
                <Text style={styles.cbtBadgeText}>Live CBT Engine</Text>
              </View>
            </View>
            <Text style={styles.brandSubtitle}>Syllabus-Aligned Online Assessment</Text>
          </View>
        </View>

        {/* Course Selector Dropdown Button */}
        <TouchableOpacity
          style={styles.courseSelectBtn}
          onPress={() => setIsCoursePickerOpen(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.courseSelectIcon}>{selectedCourse.icon || '🎒'}</Text>
          <View style={styles.courseSelectMeta}>
            <Text style={styles.courseSelectLabel}>Active Exam</Text>
            <Text style={styles.courseSelectName} numberOfLines={1}>
              {selectedCourse.short || selectedCourse.title}
            </Text>
          </View>
          <ChevronDown size={16} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      {/* ─── SEARCH & VIEW TOGGLE BAR ─────────────────────────────────────── */}
      <View style={styles.controlsBar}>
        {/* Search Input */}
        <View style={styles.searchBox}>
          <Search size={15} color="#64748b" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search syllabus topic, formula, or unit..."
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* View Mode Tabs (Day Plan vs Full Syllabus) */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'day_plan' && styles.tabBtnActive]}
            onPress={() => setActiveTab('day_plan')}
            activeOpacity={0.8}
          >
            <Calendar size={14} color={activeTab === 'day_plan' ? '#f59e0b' : '#64748b'} />
            <Text style={[styles.tabBtnText, activeTab === 'day_plan' && styles.tabBtnTextActive]}>
              Day Plan Tests
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'syllabus' && styles.tabBtnActive]}
            onPress={() => setActiveTab('syllabus')}
            activeOpacity={0.8}
          >
            <BookOpen size={14} color={activeTab === 'syllabus' ? '#f59e0b' : '#64748b'} />
            <Text style={[styles.tabBtnText, activeTab === 'syllabus' && styles.tabBtnTextActive]}>
              Syllabus Roadmap
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* VIEW 1: DAY PLAN TESTS */}
        {activeTab === 'day_plan' && (
          <View>
            {/* Day Plan Navigation Bar */}
            <View style={styles.dayNavCard}>
              <View>
                <Text style={styles.dayNavTitle}>
                  Day {currentDay} of {selectedCourse.totalDays || 200}
                </Text>
                <Text style={styles.dayNavSubtitle}>
                  {activeDayPlan?.themeTitle || selectedCourse.phaseTitle || 'Core Focus Lessons'}
                </Text>
              </View>

              <View style={styles.dayStepper}>
                <TouchableOpacity
                  style={[styles.stepArrow, currentDay <= 1 && styles.stepArrowDisabled]}
                  disabled={currentDay <= 1}
                  onPress={() => setCurrentDay((prev) => Math.max(1, prev - 1))}
                >
                  <ChevronLeft size={16} color={currentDay <= 1 ? '#475569' : '#ffffff'} />
                </TouchableOpacity>
                <Text style={styles.stepNumLabel}>Day {currentDay}</Text>
                <TouchableOpacity
                  style={[
                    styles.stepArrow,
                    currentDay >= (selectedCourse.totalDays || 200) && styles.stepArrowDisabled,
                  ]}
                  disabled={currentDay >= (selectedCourse.totalDays || 200)}
                  onPress={() =>
                    setCurrentDay((prev) => Math.min(selectedCourse.totalDays || 200, prev + 1))
                  }
                >
                  <ChevronRight
                    size={16}
                    color={currentDay >= (selectedCourse.totalDays || 200) ? '#475569' : '#ffffff'}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* List of Nano-Topics for Current Day */}
            <View style={styles.topicsSection}>
              <Text style={styles.sectionHeaderTitle}>Day {currentDay} Test Lineup (5–10 MCQs each)</Text>

              {activeDayPlan?.tasks && activeDayPlan.tasks.length > 0 ? (
                activeDayPlan.tasks.map((task, idx) => {
                  const isLaunching = cbtLaunchingTopic === task.topic;

                  return (
                    <View key={task.id || idx} style={styles.topicCard}>
                      <View style={styles.topicCardHeader}>
                        <View style={styles.stepIndexPill}>
                          <Text style={styles.stepIndexText}>Step {idx + 1}</Text>
                        </View>
                        <Text style={styles.subjectTag}>{task.subject || selectedCourse.title}</Text>
                        <Text style={styles.timerTag}>⏱ 10 Mins • +20 XP</Text>
                      </View>

                      <Text style={styles.topicTitleText}>{task.topic}</Text>

                      {/* Primary Actions: Start Test, TeachO Notes, AI Doubt, WhatsApp */}
                      <View style={styles.actionRow}>
                        <TouchableOpacity
                          style={styles.startTestBtn}
                          onPress={() => launchTopicTest(task.topic, task.subject || selectedCourse.title, idx + 1)}
                          disabled={isLaunching}
                          activeOpacity={0.8}
                        >
                          {isLaunching ? (
                            <ActivityIndicator size="small" color="#0a0f1e" />
                          ) : (
                            <>
                              <Zap size={14} color="#0a0f1e" fill="#0a0f1e" />
                              <Text style={styles.startTestBtnText}>Start Test</Text>
                            </>
                          )}
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.notesLinkBtn}
                          onPress={() => navigateToTeachONotes(task.topic, task.subject || selectedCourse.title)}
                          activeOpacity={0.8}
                        >
                          <BookOpen size={13} color="#38bdf8" />
                          <Text style={styles.notesLinkBtnText}>Study Notes</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.aiHelperBtn}
                          onPress={() => handleAskAIDoubt(task.topic, task.subject || selectedCourse.title)}
                          activeOpacity={0.8}
                        >
                          <Bot size={13} color="#c084fc" />
                          <Text style={styles.aiHelperBtnText}>Ask AI</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.waHelperBtn}
                          onPress={() => handleContactTeacherWhatsApp(task.topic, task.subject || selectedCourse.title)}
                          activeOpacity={0.8}
                        >
                          <MessageCircle size={13} color="#10b981" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              ) : (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>Loading Day {currentDay} Assessment Modules...</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* VIEW 2: FULL SYLLABUS ROADMAP */}
        {activeTab === 'syllabus' && (
          <View style={styles.syllabusSection}>
            <Text style={styles.sectionHeaderTitle}>
              Full Official Syllabus Lineup ({fullSyllabus.length} Subjects)
            </Text>

            {fullSyllabus.map((subj, sIdx) => {
              const isExpanded = expandedSubjects[subj.subjectName] !== false; // expanded by default
              const totalTopics = subj.chapters?.reduce((acc: number, c: any) => acc + (c.microTopics?.length || 0), 0) || 0;

              return (
                <View key={subj.subjectName || sIdx} style={styles.subjectCard}>
                  {/* Subject Accordion Header */}
                  <TouchableOpacity
                    style={styles.subjectHeaderRow}
                    onPress={() => toggleSubjectExpand(subj.subjectName)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.subjectHeaderLeft}>
                      <Text style={styles.subjectIconEmoji}>{subj.icon || '📖'}</Text>
                      <View>
                        <Text style={styles.subjectNameText}>{subj.subjectName}</Text>
                        <Text style={styles.subjectMetaText}>
                          {subj.chapters?.length || 0} Chapters • {totalTopics} Nano-Topic Tests
                        </Text>
                      </View>
                    </View>

                    <ChevronDown
                      size={18}
                      color="#94a3b8"
                      style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}
                    />
                  </TouchableOpacity>

                  {/* Chapters & Topics */}
                  {isExpanded && (
                    <View style={styles.chaptersList}>
                      {subj.chapters?.map((chap: any, cIdx: number) => (
                        <View key={chap.chapterTitle || cIdx} style={styles.chapterItem}>
                          <Text style={styles.chapterTitleText}>
                            Chapter {chap.chapterNumber || cIdx + 1}: {chap.chapterTitle}
                          </Text>

                          {/* Nano Topics inside Chapter */}
                          <View style={styles.nanoTopicsGrid}>
                            {chap.microTopics?.map((mt: any, tIdx: number) => {
                              const title = typeof mt === 'string' ? mt : mt.topicTitle || mt.title;
                              const isLaunching = cbtLaunchingTopic === title;

                              return (
                                <View key={tIdx} style={styles.nanoTopicCard}>
                                  <View style={styles.nanoTopicHeader}>
                                    <Text style={styles.nanoTopicTitle} numberOfLines={2}>
                                      {title}
                                    </Text>
                                  </View>

                                  <View style={styles.nanoActionRow}>
                                    <TouchableOpacity
                                      style={styles.miniStartBtn}
                                      onPress={() => launchTopicTest(title, subj.subjectName, tIdx + 1)}
                                      disabled={isLaunching}
                                      activeOpacity={0.8}
                                    >
                                      {isLaunching ? (
                                        <ActivityIndicator size="small" color="#0a0f1e" />
                                      ) : (
                                        <>
                                          <Zap size={11} color="#0a0f1e" fill="#0a0f1e" />
                                          <Text style={styles.miniStartBtnText}>Take Test</Text>
                                        </>
                                      )}
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                      style={styles.miniNotesBtn}
                                      onPress={() => navigateToTeachONotes(title, subj.subjectName)}
                                      activeOpacity={0.8}
                                    >
                                      <BookOpen size={11} color="#38bdf8" />
                                      <Text style={styles.miniNotesBtnText}>Notes</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                      style={styles.miniAiBtn}
                                      onPress={() => handleAskAIDoubt(title, subj.subjectName)}
                                      activeOpacity={0.8}
                                    >
                                      <Bot size={11} color="#c084fc" />
                                    </TouchableOpacity>
                                  </View>
                                </View>
                              );
                            })}
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* ─── COURSE PICKER SHEET (100+ MASTER PROGRAMS) ───────────────────── */}
      <TeachOCoursePickerSheet
        visible={isCoursePickerOpen}
        courses={ALL_COURSES}
        selectedCourseId={selectedCourse.id}
        onClose={() => setIsCoursePickerOpen(false)}
        onSelectCourse={(course) => {
          setSelectedCourse(course);
          setIsCoursePickerOpen(false);
          AsyncStorage.setItem('teacho_active_enrolled_course_id', course.id).catch(() => {});
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#080d1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0b1120',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
  },
  cbtBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  cbtBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#f59e0b',
  },
  brandSubtitle: {
    fontSize: 10,
    color: '#94a3b8',
  },
  courseSelectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#131e32',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    maxWidth: 150,
  },
  courseSelectIcon: {
    fontSize: 16,
  },
  courseSelectMeta: {
    flex: 1,
  },
  courseSelectLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#f59e0b',
    textTransform: 'uppercase',
  },
  courseSelectName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#f8fafc',
  },
  controlsBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#0b1120',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    gap: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131e32',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 38,
  },
  searchInput: {
    flex: 1,
    color: '#f8fafc',
    fontSize: 12,
    padding: 0,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#131e32',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  tabBtnActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: '#f59e0b',
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  tabBtnTextActive: {
    color: '#f59e0b',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  dayNavCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  dayNavTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#f8fafc',
  },
  dayNavSubtitle: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
    maxWidth: 180,
  },
  dayStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 3,
  },
  stepArrow: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepArrowDisabled: {
    backgroundColor: 'transparent',
  },
  stepNumLabel: {
    paddingHorizontal: 8,
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  topicsSection: {
    gap: 12,
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 4,
  },
  topicCard: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  topicCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepIndexPill: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  stepIndexText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38bdf8',
  },
  subjectTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10b981',
    flex: 1,
  },
  timerTag: {
    fontSize: 10,
    color: '#94a3b8',
  },
  topicTitleText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#f8fafc',
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
  },
  startTestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#f59e0b',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  startTestBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0a0f1e',
  },
  notesLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  notesLinkBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38bdf8',
  },
  aiHelperBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(192, 132, 252, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.3)',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  aiHelperBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#c084fc',
  },
  waHelperBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 14,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  syllabusSection: {
    gap: 14,
  },
  subjectCard: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 16,
    overflow: 'hidden',
  },
  subjectHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: '#111c30',
  },
  subjectHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  subjectIconEmoji: {
    fontSize: 22,
  },
  subjectNameText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#f8fafc',
  },
  subjectMetaText: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  chaptersList: {
    padding: 12,
    gap: 12,
  },
  chapterItem: {
    gap: 8,
  },
  chapterTitleText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#f59e0b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  nanoTopicsGrid: {
    gap: 8,
  },
  nanoTopicCard: {
    backgroundColor: '#131e32',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 12,
    padding: 10,
    gap: 8,
  },
  nanoTopicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nanoTopicTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#e2e8f0',
    lineHeight: 18,
    flex: 1,
  },
  nanoActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miniStartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f59e0b',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  miniStartBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0a0f1e',
  },
  miniNotesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  miniNotesBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#38bdf8',
  },
  miniAiBtn: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: 'rgba(192, 132, 252, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
