import React, { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  GraduationCap,
  Layers,
  ChevronDown,
  ChevronUp,
  Search,
  X,
  ShieldCheck,
  BookOpen,
  Hash,
  Sparkles,
  Award,
  Play,
  Calendar,
  Video,
  FileText,
  Heart,
  Smile,
  CheckCircle2,
} from 'lucide-react-native';

import { AppContext } from '../context/AppContext';
import { TeachOCoursePickerSheet } from '../components/teacho/TeachOCoursePickerSheet';
import { TutOQBankModal } from '../components/teacho/TutOQBankModal';
import { TutODayCoursePlayerModal } from '../components/teacho/TutODayCoursePlayerModal';
import { resolveWholeYearDayPlan, WholeYearDayPlan } from '../data/curriculum/wholeYearDayPlanEngine';

import { ALL_COURSES, DEFAULT_COURSE, CourseOption, SchoolBoard, SCHOOL_BOARDS } from '../data/coursesCatalog';
import {
  getOfficialGovernmentSyllabus,
  OfficialCourseSyllabus,
} from '../data/curriculum/officialGovernmentSyllabusRegistry';

const { width } = Dimensions.get('window');

export default function TutOHubScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useContext(AppContext) || {};

  // ─── Active Course & Board State ──────────────────────────────────────────
  const [selectedCourse, setSelectedCourse] = useState<CourseOption>(DEFAULT_COURSE);
  const [selectedBoard, setSelectedBoard] = useState<SchoolBoard>('TNSB');
  const [isCoursePickerOpen, setIsCoursePickerOpen] = useState(false);

  // ─── QBank Number Search Modal State ─────────────────────────────────────
  const [isQBankModalOpen, setIsQBankModalOpen] = useState(false);
  const [qBankInitialQuery, setQBankInitialQuery] = useState('');
  const [qBankInitialSubject, setQBankInitialSubject] = useState('ALL');

  // ─── Whole Year Day Plan & Course Player State ─────────────────────────────
  const [isCoursePlayerOpen, setIsCoursePlayerOpen] = useState(false);
  const [playerDayNumber, setPlayerDayNumber] = useState(1);

  // ─── Syllabus Navigation & Filter State ──────────────────────────────────
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({
    '0_0': true,
    '0_1': true,
  });

  // Load saved course & board on mount
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
          }
        }
      } catch (e) {
        console.warn('Failed to load saved course state:', e);
      }
    }
    loadSavedState();
  }, []);

  // Board selector handler
  const handleBoardSelect = useCallback(async (board: SchoolBoard) => {
    setSelectedBoard(board);
    await AsyncStorage.setItem(`tuto_selected_board_${selectedCourse.id}`, board);
  }, [selectedCourse.id]);

  // Course selector handler
  const handleSelectCourse = useCallback(async (course: CourseOption) => {
    if (!course) return;
    try {
      setSelectedCourse(course);
      const courseBoard = ((await AsyncStorage.getItem(`tuto_selected_board_${course.id}`)) as SchoolBoard) || 'TNSB';
      setSelectedBoard(courseBoard);
      setIsCoursePickerOpen(false);
      setSelectedSubjectId('ALL');
      setSearchQuery('');
      setExpandedChapters({ '0_0': true, '0_1': true });
      AsyncStorage.setItem('tuto_active_course_id', course.id).catch(() => {});
    } catch (err) {
      console.warn('Error applying selected course:', err);
      setSelectedCourse(course);
      setIsCoursePickerOpen(false);
    }
  }, []);

  // Resolve official syllabus for active course & board
  // Active Whole Year Day Plan
  const activeDayPlan: WholeYearDayPlan = useMemo(() => {
    return resolveWholeYearDayPlan(selectedCourse.id, selectedCourse.title, playerDayNumber, selectedBoard);
  }, [selectedCourse.id, selectedCourse.title, playerDayNumber, selectedBoard]);

  const syllabus: OfficialCourseSyllabus = useMemo(() => {
    return getOfficialGovernmentSyllabus(selectedCourse.id, selectedBoard);
  }, [selectedCourse.id, selectedBoard]);

  // Deep Search filter across subjects, chapters, topics, and nano concepts
  const filteredSubjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const baseSubjects = selectedSubjectId === 'ALL'
      ? syllabus.subjects
      : syllabus.subjects.filter((s) => s.subjectId === selectedSubjectId);

    if (!q) return baseSubjects;

    return baseSubjects
      .map((subj) => {
        const matchingChapters = subj.chapters.filter((ch) => {
          const chMatch =
            (ch.chapterTitle || '').toLowerCase().includes(q) ||
            (ch.tamilTitle || '').toLowerCase().includes(q) ||
            (ch.description || '').toLowerCase().includes(q);

          const topicMatch = ch.topics.some((t) => {
            const tMatch =
              (t.title || '').toLowerCase().includes(q) ||
              (t.tamilTitle || '').toLowerCase().includes(q) ||
              (t.keyAxiomOrLaw || '').toLowerCase().includes(q) ||
              (t.keyFormula || '').toLowerCase().includes(q);

            const nanoMatch = (t.nanoConcepts || []).some(
              (n) =>
                (n.name || '').toLowerCase().includes(q) ||
                (n.tamilName || '').toLowerCase().includes(q) ||
                (n.description || '').toLowerCase().includes(q) ||
                (n.keyRuleOrFormula || '').toLowerCase().includes(q) ||
                (n.solvedExampleOrLaw || '').toLowerCase().includes(q)
            );
            return tMatch || nanoMatch;
          });

          return chMatch || topicMatch;
        });

        return {
          ...subj,
          chapters: matchingChapters,
        };
      })
      .filter((subj) => subj.chapters.length > 0);
  }, [syllabus, selectedSubjectId, searchQuery]);

  const toggleChapter = (key: string) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const expandAllChapters = () => {
    const next: Record<string, boolean> = {};
    syllabus.subjects.forEach((s, sIdx) => {
      s.chapters.forEach((_, cIdx) => {
        next[`${sIdx}_${cIdx}`] = true;
      });
    });
    setExpandedChapters(next);
  };

  const collapseAllChapters = () => {
    setExpandedChapters({});
  };

  const handleOpenQBankWithQuery = (q: string, subjCode?: string) => {
    setQBankInitialQuery(q);
    if (subjCode) setQBankInitialSubject(subjCode);
    setIsQBankModalOpen(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#070C18" />

      {/* ─── 1. TOP HEADER & COURSE CHANGE OPTIONS ─── */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0) + 8 }]}>
        {/* Top Brand Bar */}
        <View style={styles.headerTopRow}>
          <View style={styles.brandContainer}>
            <View style={styles.brandLogoBox}>
              <GraduationCap size={20} color="#00D084" />
            </View>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.brandTitle}>TutO</Text>
                <View style={styles.proBadge}>
                  <Text style={styles.proBadgeText}>OFFICIAL SYLLABUS</Text>
                </View>
              </View>
              <Text style={styles.brandSubtitle}>Government Notified Curriculum</Text>
            </View>
          </View>

          {/* Quick MCQ QBank (Number Search) Header Button */}
          <TouchableOpacity
            style={styles.qbankHeaderBtn}
            onPress={() => handleOpenQBankWithQuery('')}
            activeOpacity={0.8}
          >
            <Hash size={13} color="#070C18" />
            <Text style={styles.qbankHeaderBtnText}>QBank Search</Text>
          </TouchableOpacity>
        </View>

        {/* Course / Exam Selector Chip with Change Option */}
        <TouchableOpacity
          style={styles.courseSelectorChip}
          activeOpacity={0.85}
          onPress={() => setIsCoursePickerOpen(true)}
        >
          <View style={styles.courseSelectorLeft}>
            <View style={styles.courseIconBox}>
              <Layers size={15} color="#00D084" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.courseSelectorLabel}>TARGET CURRICULUM & EXAM</Text>
              <Text style={styles.courseSelectorTitle} numberOfLines={1}>
                {selectedCourse.title}
              </Text>
            </View>
          </View>
          <View style={styles.changeCoursePill}>
            <Text style={styles.changeCourseText}>Change Course</Text>
            <ChevronDown size={13} color="#00D084" />
          </View>
        </TouchableOpacity>

        {/* QBank Number Search Quick Banner */}
        <TouchableOpacity
          style={styles.qbankQuickBanner}
          activeOpacity={0.85}
          onPress={() => handleOpenQBankWithQuery('')}
        >
          <View style={styles.qbankIconBox}>
            <Hash size={16} color="#38BDF8" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.qbankBannerTitle}>MCQ QBank (Number & UID Search)</Text>
              <View style={styles.schemaMiniBadge}>
                <Text style={styles.schemaMiniText}>[SUB]-[DOM]-#SEQ</Text>
              </View>
            </View>
            <Text style={styles.qbankBannerSub}>
              Search by question number (#0001, 12) or exact UID to practice instantly
            </Text>
          </View>
          <View style={styles.qbankActionArrow}>
            <Search size={14} color="#00D084" />
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
      </View>

      {/* ─── 2. MAIN SYLLABUS EXPLORER CONTENT ─── */}
      <ScrollView
        style={styles.contentScroll}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) + 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.syllabusMainContainer}>
          {/* Government Gazette & Authority Blueprint Card */}
          <View style={styles.syllabusHeroCard}>
            <View style={styles.syllabusHeroHeader}>
              <View style={styles.govVerifiedBadge}>
                <ShieldCheck size={13} color="#00D084" />
                <Text style={styles.govVerifiedBadgeText}>100% GOVT NOTIFIED SYLLABUS</Text>
              </View>
              <Text style={styles.syllabusMediumText}>{syllabus.medium}</Text>
            </View>

            <Text style={styles.syllabusHeroTitle}>{syllabus.courseTitle}</Text>
            <Text style={styles.syllabusAuthorityText}>🏛️ {syllabus.boardOrAuthority}</Text>
            <Text style={styles.syllabusNotificationRef}>📋 {syllabus.notificationRef}</Text>

            {syllabus.gazetteOrder ? (
              <Text style={styles.gazetteOrderText}>📜 Gazette Order: {syllabus.gazetteOrder}</Text>
            ) : null}

            <View style={styles.blueprintBox}>
              <Text style={styles.blueprintLabel}>EXAM BLUEPRINT & WEIGHTAGE</Text>
              <Text style={styles.syllabusBlueprint}>{syllabus.examPatternSummary}</Text>
              {syllabus.markingScheme ? (
                <Text style={styles.markingSchemeText}>⚖️ Marking Scheme: {syllabus.markingScheme}</Text>
              ) : null}
            </View>

            {/* Granular Stats Counter Row */}
            <View style={styles.syllabusStatsRow}>
              <View style={styles.statPill}>
                <Text style={styles.statVal}>{syllabus.totalSubjects}</Text>
                <Text style={styles.statLbl}>Subjects</Text>
              </View>
              <View style={styles.statPill}>
                <Text style={styles.statVal}>{syllabus.totalChapters}</Text>
                <Text style={styles.statLbl}>Chapters</Text>
              </View>
              <View style={styles.statPill}>
                <Text style={styles.statVal}>{syllabus.totalTopics}</Text>
                <Text style={styles.statLbl}>Topics</Text>
              </View>
              <View style={styles.statPill}>
                <Text style={styles.statVal}>{syllabus.totalNanoConcepts || syllabus.totalTopics * 2}</Text>
                <Text style={styles.statLbl}>Nano Nodes</Text>
              </View>
            </View>
          </View>

          
          {/* ─── 🌟 WHOLE YEAR DAY PLAN & COURSE PLAYER CARD ─── */}
          <View style={styles.dayPlanHeroCard}>
            <View style={styles.dayPlanTopHeader}>
              <View style={{ flex: 1 }}>
                <View style={styles.dayPlanBadgeRow}>
                  <View style={[styles.dayPlanPill, activeDayPlan.isMondayHoliday && styles.dayPlanPillHoliday]}>
                    <Calendar size={11} color={activeDayPlan.isMondayHoliday ? '#F59E0B' : '#00D084'} />
                    <Text style={[styles.dayPlanPillText, activeDayPlan.isMondayHoliday && styles.dayPlanPillTextHoliday]}>
                      DAY {activeDayPlan.dayNumber} · WEEK {activeDayPlan.weekNumber} · {activeDayPlan.dayOfWeekName.toUpperCase()}
                    </Text>
                  </View>
                  {activeDayPlan.isMondayHoliday ? (
                    <View style={styles.holidayBadge}>
                      <Smile size={10} color="#F59E0B" />
                      <Text style={styles.holidayBadgeText}>MONDAY HOLIDAY / REVIEW</Text>
                    </View>
                  ) : (
                    <View style={styles.activeDayTag}>
                      <Text style={styles.activeDayTagText}>300-DAY WHOLE YEAR PLAN</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.dayPlanTopicTitle}>{activeDayPlan.topicTitle}</Text>
                {activeDayPlan.topicTamilTitle && (
                  <Text style={styles.dayPlanTopicTamil}>{activeDayPlan.topicTamilTitle}</Text>
                )}
              </View>

              {/* Day Nav Quick Steppers */}
              <View style={styles.dayStepperRow}>
                <TouchableOpacity
                  style={[styles.dayStepBtn, playerDayNumber <= 1 && styles.dayStepBtnDisabled]}
                  disabled={playerDayNumber <= 1}
                  onPress={() => setPlayerDayNumber((prev) => Math.max(1, prev - 1))}
                >
                  <Text style={styles.dayStepBtnText}>-1 Day</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.dayStepBtn}
                  onPress={() => setPlayerDayNumber((prev) => Math.min(300, prev + 1))}
                >
                  <Text style={styles.dayStepBtnText}>+1 Day</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Day Plan 4-Pillar Overview Badges */}
            <View style={styles.dayPillarsRow}>
              <View style={styles.pillarItem}>
                <Video size={12} color="#38BDF8" />
                <Text style={styles.pillarItemText}>3 In-App Videos</Text>
              </View>
              <View style={styles.pillarItem}>
                <FileText size={12} color="#00D084" />
                <Text style={styles.pillarItemText}>3 Notes (AI + Exam)</Text>
              </View>
              <View style={styles.pillarItem}>
                <Award size={12} color="#F59E0B" />
                <Text style={styles.pillarItemText}>1 MCQ Test (5 Qs)</Text>
              </View>
              <View style={styles.pillarItem}>
                <Heart size={12} color="#EC4899" />
                <Text style={styles.pillarItemText}>1 Yoga & Task</Text>
              </View>
            </View>

            {/* Quick Day Jumper Chips (Day 1 to Day 300) */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayChipsRow}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 30, 60, 90, 150, 200, 300].map((d) => {
                const isSelected = playerDayNumber === d;
                const isMon = (d - 1) % 7 === 0;
                return (
                  <TouchableOpacity
                    key={d}
                    style={[styles.daySelectChip, isSelected && styles.daySelectChipActive, isMon && styles.daySelectChipMon]}
                    onPress={() => setPlayerDayNumber(d)}
                  >
                    <Text style={[styles.daySelectChipText, isSelected && styles.daySelectChipTextActive]}>
                      Day {d} {isMon ? '🌿' : ''}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Big Launch Course Player Button */}
            <TouchableOpacity
              style={styles.launchPlayerBtn}
              activeOpacity={0.85}
              onPress={() => setIsCoursePlayerOpen(true)}
            >
              <Play size={15} color="#070C18" fill="#070C18" />
              <Text style={styles.launchPlayerBtnText}>
                {activeDayPlan.isMondayHoliday
                  ? 'Open Monday Review & Mindful Rest Day 🌿'
                  : `Start Day ${activeDayPlan.dayNumber} Course Player (3 Videos · 3 Notes · Test · Yoga) ▶️`}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Live Search Input */}
          <View style={styles.searchBarContainer}>
            <Search size={16} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search question #, UID, subjects, chapters, formulas..."
              placeholderTextColor="#64748B"
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={16} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Quick Ask / Jump to QBank Search for typed Query */}
          {searchQuery.trim().length > 0 && (
            <TouchableOpacity
              style={styles.searchQBankTriggerBtn}
              activeOpacity={0.8}
              onPress={() => handleOpenQBankWithQuery(searchQuery, selectedSubjectId !== 'ALL' ? selectedSubjectId : undefined)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                <Hash size={14} color="#00D084" />
                <Text style={styles.searchQBankTriggerText} numberOfLines={1}>
                  Search "{searchQuery}" in 2 Lakh+ QBank →
                </Text>
              </View>
              <View style={styles.jumpBadge}>
                <Text style={styles.jumpBadgeText}>OPEN QBANK</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Subject Filter Bar */}
          <View style={styles.subjectFilterSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subjectFilterBar}>
              <TouchableOpacity
                style={[styles.subjPill, selectedSubjectId === 'ALL' && styles.subjPillActive]}
                onPress={() => setSelectedSubjectId('ALL')}
              >
                <Text style={[styles.subjPillText, selectedSubjectId === 'ALL' && styles.subjPillTextActive]}>
                  All Subjects ({syllabus.subjects.length})
                </Text>
              </TouchableOpacity>
              {syllabus.subjects.map((s) => (
                <TouchableOpacity
                  key={s.subjectId}
                  style={[styles.subjPill, selectedSubjectId === s.subjectId && styles.subjPillActive]}
                  onPress={() => setSelectedSubjectId(s.subjectId)}
                >
                  <Text style={{ fontSize: 12 }}>{s.icon || '📖'}</Text>
                  <Text style={[styles.subjPillText, selectedSubjectId === s.subjectId && styles.subjPillTextActive]}>
                    {s.subjectName}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Expand / Collapse All Controls */}
          <View style={styles.accordionControlRow}>
            <Text style={styles.syllabusSectionTitle}>
              {selectedSubjectId === 'ALL' ? 'Complete Syllabus Outline' : `${syllabus.subjects.find(s => s.subjectId === selectedSubjectId)?.subjectName || 'Subject'} Outline`}
            </Text>
            <View style={styles.accordionBtnGroup}>
              <TouchableOpacity onPress={expandAllChapters} style={styles.accordionSmallBtn}>
                <Text style={styles.accordionSmallBtnText}>Expand All</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={collapseAllChapters} style={styles.accordionSmallBtn}>
                <Text style={styles.accordionSmallBtnText}>Collapse All</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Filtered Subjects Tree */}
          {filteredSubjects.length === 0 ? (
            <View style={styles.emptyResultsCard}>
              <BookOpen size={28} color="#64748B" />
              <Text style={styles.emptyTitle}>No matching topics found</Text>
              <Text style={styles.emptySubtitle}>Try changing your search keywords or select "All Subjects".</Text>
              <TouchableOpacity style={styles.clearSearchBtn} onPress={() => { setSearchQuery(''); setSelectedSubjectId('ALL'); }}>
                <Text style={styles.clearSearchBtnText}>Reset Filter</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredSubjects.map((subj, sIdx) => (
              <View key={subj.subjectId || sIdx} style={styles.subjectTreeCard}>
                <View style={styles.subjectTreeHeader}>
                  <Text style={{ fontSize: 20 }}>{subj.icon || '📚'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.subjectTreeTitle}>{subj.subjectName}</Text>
                    {subj.tamilName && <Text style={styles.subjectTreeTamil}>{subj.tamilName}</Text>}
                  </View>
                  <View style={styles.subjectCountBadge}>
                    <Text style={styles.subjectCountBadgeText}>
                      {subj.chapters.length} Chapters
                    </Text>
                  </View>
                </View>

                {subj.chapters.map((ch, cIdx) => {
                  const chapterKey = `${sIdx}_${cIdx}`;
                  const isExpanded = expandedChapters[chapterKey] !== false;

                  return (
                    <View key={cIdx} style={styles.chapterTreeBox}>
                      <TouchableOpacity
                        style={styles.chapterTreeHeader}
                        onPress={() => toggleChapter(chapterKey)}
                        activeOpacity={0.7}
                      >
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <View style={styles.unitTag}>
                              <Text style={styles.unitTagText}>{ch.unitNumber || `Unit ${cIdx + 1}`}</Text>
                            </View>
                            <Text style={styles.chapterNumberText}>Chapter {ch.chapterNumber}</Text>
                          </View>
                          <Text style={styles.chapterTreeTitle}>{ch.chapterTitle}</Text>
                          {ch.tamilTitle && <Text style={styles.chapterTreeTamil}>{ch.tamilTitle}</Text>}
                        </View>
                        {isExpanded ? <ChevronUp size={18} color="#00D084" /> : <ChevronDown size={18} color="#94A3B8" />}
                      </TouchableOpacity>

                      {isExpanded && (
                        <View style={styles.topicsTreeList}>
                          {ch.topics.map((top, tIdx) => (
                            <View key={top.id || tIdx} style={styles.topicTreeCard}>
                              <View style={styles.topicTreeHeader}>
                                {top.topicCode && (
                                  <View style={styles.topicCodeBadge}>
                                    <Text style={styles.topicCodeText}>{top.topicCode}</Text>
                                  </View>
                                )}
                                <Text style={styles.topicTreeTitle}>{top.title}</Text>
                              </View>
                              {top.tamilTitle && <Text style={styles.topicTreeTamil}>{top.tamilTitle}</Text>}

                              {top.keyAxiomOrLaw ? (
                                <View style={styles.axiomBox}>
                                  <Text style={styles.axiomLabel}>KEY AXIOM / CORE LAW:</Text>
                                  <Text style={styles.axiomText}>{top.keyAxiomOrLaw}</Text>
                                </View>
                              ) : null}

                              {/* Topic Quick Action Buttons: QBank & Course Player */}
                              <View style={styles.topicActionRow}>
                                <TouchableOpacity
                                  style={styles.topicQBankPill}
                                  activeOpacity={0.7}
                                  onPress={() => handleOpenQBankWithQuery(top.title, subj.subjectCode || 'ALL')}
                                >
                                  <Hash size={11} color="#00D084" />
                                  <Text style={styles.topicQBankPillText}>Practice Topic MCQs</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={styles.topicPlayerPill}
                                  activeOpacity={0.7}
                                  onPress={() => setIsCoursePlayerOpen(true)}
                                >
                                  <Play size={10} color="#38BDF8" fill="#38BDF8" />
                                  <Text style={styles.topicPlayerPillText}>Day Plan Player</Text>
                                </TouchableOpacity>
                              </View>

                              {/* Nano Concepts Breakdown */}
                              {(top.nanoConcepts || []).map((nano, nIdx) => (
                                <View key={nano.id || nIdx} style={styles.nanoTreeCard}>
                                  <View style={styles.nanoTreeHeader}>
                                    <View style={{ flex: 1 }}>
                                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        <Text style={styles.nanoCodeText}>{nano.conceptCode}</Text>
                                        <View style={styles.qTypePill}>
                                          <Text style={styles.qTypePillText}>{nano.questionType || '2-Mark'}</Text>
                                        </View>
                                      </View>
                                      <Text style={styles.nanoNameText}>{nano.name}</Text>
                                      {nano.tamilName && <Text style={styles.nanoTamilText}>{nano.tamilName}</Text>}
                                    </View>
                                  </View>

                                  {nano.description ? (
                                    <Text style={styles.nanoDescText}>{nano.description}</Text>
                                  ) : null}

                                  {nano.keyRuleOrFormula ? (
                                    <View style={styles.nanoFormulaBox}>
                                      <Text style={styles.nanoFormulaLabel}>KEY RULE / FORMULA:</Text>
                                      <Text style={styles.nanoFormulaText}>{nano.keyRuleOrFormula}</Text>
                                    </View>
                                  ) : null}

                                  {nano.solvedExampleOrLaw ? (
                                    <View style={styles.solvedExampleBox}>
                                      <Text style={styles.solvedExampleLabel}>APPLICATION / EXAMPLE:</Text>
                                      <Text style={styles.solvedExampleText}>{nano.solvedExampleOrLaw}</Text>
                                    </View>
                                  ) : null}
                                </View>
                              ))}
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* ─── 3. UNIVERSAL COURSE PICKER MODAL (KEPT & ACTIVE) ─── */}
      <TeachOCoursePickerSheet
        visible={isCoursePickerOpen}
        courses={ALL_COURSES}
        selectedCourse={selectedCourse}
        selectedCourseId={selectedCourse?.id}
        onSelect={handleSelectCourse}
        onSelectCourse={handleSelectCourse}
        onClose={() => setIsCoursePickerOpen(false)}
      />

      {/* ─── 4. DETERMINISTIC MCQ QBANK & NUMBER SEARCH MODAL ─── */}
      <TutODayCoursePlayerModal
        visible={isCoursePlayerOpen}
        onClose={() => setIsCoursePlayerOpen(false)}
        courseId={selectedCourse.id}
        courseTitle={selectedCourse.title}
        initialDay={playerDayNumber}
        board={selectedBoard}
      />

      <TutOQBankModal
        visible={isQBankModalOpen}
        onClose={() => setIsQBankModalOpen(false)}
        initialQuery={qBankInitialQuery}
        initialSubjectCode={qBankInitialSubject}
      />
    </View>
  );
}

const styles = StyleSheet.create({

  searchQBankTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0E172A',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00D08480',
    marginTop: 4,
    marginBottom: 8,
  },
  searchQBankTriggerText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#00D084',
  },
  jumpBadge: {
    backgroundColor: 'rgba(0, 208, 132, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  jumpBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#00D084',
  },
  topicActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  topicQBankPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 208, 132, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#00D08440',
  },
  topicQBankPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00D084',
  },
  topicPlayerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#38BDF840',
  },
  topicPlayerPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38BDF8',
  },


  dayPlanHeroCard: {
    backgroundColor: '#0E172A',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#00D08450',
    gap: 10,
    marginBottom: 12,
  },
  dayPlanTopHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  dayPlanBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  dayPlanPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dayPlanPillHoliday: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  dayPlanPillText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#00D084',
  },
  dayPlanPillTextHoliday: {
    color: '#F59E0B',
  },
  activeDayTag: {
    backgroundColor: '#131F37',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activeDayTagText: {
    fontSize: 8,
    color: '#38BDF8',
    fontWeight: '800',
  },
  holidayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  holidayBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#F59E0B',
  },
  dayPlanTopicTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F8FAFC',
    marginTop: 3,
  },
  dayPlanTopicTamil: {
    fontSize: 11,
    color: '#94A3B8',
  },
  dayStepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dayStepBtn: {
    backgroundColor: '#131F37',
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  dayStepBtnDisabled: {
    opacity: 0.4,
  },
  dayStepBtnText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#00D084',
  },
  dayPillarsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pillarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#131F37',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pillarItemText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  dayChipsRow: {
    gap: 6,
    paddingVertical: 2,
  },
  daySelectChip: {
    backgroundColor: '#131F37',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  daySelectChipActive: {
    backgroundColor: 'rgba(0, 208, 132, 0.2)',
    borderColor: '#00D084',
  },
  daySelectChipMon: {
    borderColor: '#F59E0B50',
  },
  daySelectChipText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
  },
  daySelectChipTextActive: {
    color: '#00D084',
  },
  launchPlayerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00D084',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 2,
  },
  launchPlayerBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#070C18',
  },

  container: {
    flex: 1,
    backgroundColor: '#070C18',
  },
  header: {
    backgroundColor: '#0E172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
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
    paddingHorizontal: 6,
    paddingVertical: 2,
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
  qbankHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#00D084',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  qbankHeaderBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#070C18',
  },
  qbankQuickBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#131F37',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  qbankIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qbankBannerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  schemaMiniBadge: {
    backgroundColor: '#0E172A',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  schemaMiniText: {
    fontSize: 8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#38BDF8',
    fontWeight: '700',
  },
  qbankBannerSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  qbankActionArrow: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#0E172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseSelectorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#131F37',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
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
    width: 30,
    height: 30,
    borderRadius: 8,
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
    fontSize: 13,
    fontWeight: '800',
    color: '#F8FAFC',
    marginTop: 1,
  },
  changeCoursePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00D084',
  },
  changeCourseText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00D084',
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
  contentScroll: {
    flex: 1,
  },
  syllabusMainContainer: {
    padding: 16,
    gap: 14,
  },
  syllabusHeroCard: {
    backgroundColor: '#0E172A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 8,
  },
  syllabusHeroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  govVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#00D08420',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  govVerifiedBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#00D084',
  },
  syllabusMediumText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  syllabusHeroTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  syllabusAuthorityText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  syllabusNotificationRef: {
    fontSize: 11,
    color: '#00D084',
    fontWeight: '700',
  },
  gazetteOrderText: {
    fontSize: 11,
    color: '#38BDF8',
    fontWeight: '600',
  },
  blueprintBox: {
    backgroundColor: '#131F37',
    borderRadius: 10,
    padding: 10,
    gap: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#00D084',
  },
  blueprintLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#00D084',
    letterSpacing: 0.5,
  },
  syllabusBlueprint: {
    fontSize: 11,
    color: '#CBD5E1',
    lineHeight: 16,
  },
  markingSchemeText: {
    fontSize: 10,
    color: '#F59E0B',
    fontWeight: '700',
    marginTop: 2,
  },
  syllabusStatsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  statPill: {
    flex: 1,
    backgroundColor: '#131F37',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#00D084',
  },
  statLbl: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0E172A',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#F8FAFC',
    padding: 0,
  },
  subjectFilterSection: {
    gap: 6,
  },
  subjectFilterBar: {
    gap: 6,
    paddingVertical: 2,
  },
  subjPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#0E172A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  subjPillActive: {
    backgroundColor: '#00D084',
    borderColor: '#00D084',
  },
  subjPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  subjPillTextActive: {
    color: '#070C18',
    fontWeight: '900',
  },
  accordionControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginTop: 2,
  },
  syllabusSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  accordionBtnGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  accordionSmallBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#131F37',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  accordionSmallBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  emptyResultsCard: {
    backgroundColor: '#0E172A',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
  clearSearchBtn: {
    backgroundColor: '#00D084',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 6,
  },
  clearSearchBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#070C18',
  },
  subjectTreeCard: {
    backgroundColor: '#0E172A',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 10,
  },
  subjectTreeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  subjectTreeTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  subjectTreeTamil: {
    fontSize: 11,
    color: '#94A3B8',
  },
  subjectCountBadge: {
    backgroundColor: '#131F37',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  subjectCountBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00D084',
  },
  chapterTreeBox: {
    backgroundColor: '#131F37',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  chapterTreeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  unitTag: {
    backgroundColor: '#00D08420',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  unitTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#00D084',
  },
  chapterNumberText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  chapterTreeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F8FAFC',
    marginTop: 2,
  },
  chapterTreeTamil: {
    fontSize: 11,
    color: '#94A3B8',
  },
  topicsTreeList: {
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  topicTreeCard: {
    backgroundColor: '#0E172A',
    borderRadius: 10,
    padding: 10,
    gap: 6,
  },
  topicTreeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topicCodeBadge: {
    backgroundColor: '#38BDF820',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  topicCodeText: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#38BDF8',
    fontWeight: '800',
  },
  topicTreeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
    flex: 1,
  },
  topicTreeTamil: {
    fontSize: 10,
    color: '#94A3B8',
  },
  axiomBox: {
    backgroundColor: '#131F37',
    borderRadius: 6,
    padding: 6,
    gap: 2,
    borderLeftWidth: 2,
    borderLeftColor: '#F59E0B',
  },
  axiomLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#F59E0B',
  },
  axiomText: {
    fontSize: 10,
    color: '#CBD5E1',
    lineHeight: 14,
  },
  nanoTreeCard: {
    backgroundColor: '#131F37',
    borderRadius: 8,
    padding: 8,
    gap: 4,
    borderLeftWidth: 2,
    borderLeftColor: '#00D084',
  },
  nanoTreeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nanoCodeText: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#38BDF8',
    fontWeight: '800',
  },
  qTypePill: {
    backgroundColor: '#0E172A',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  qTypePillText: {
    fontSize: 8,
    color: '#F59E0B',
    fontWeight: '700',
  },
  nanoNameText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E2E8F0',
    marginTop: 2,
  },
  nanoTamilText: {
    fontSize: 10,
    color: '#94A3B8',
  },
  nanoDescText: {
    fontSize: 10,
    color: '#CBD5E1',
    lineHeight: 14,
  },
  nanoFormulaBox: {
    backgroundColor: '#0E172A',
    borderRadius: 6,
    padding: 6,
    gap: 2,
    marginTop: 2,
  },
  nanoFormulaLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#38BDF8',
  },
  nanoFormulaText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F8FAFC',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  solvedExampleBox: {
    backgroundColor: '#0E172A',
    borderRadius: 6,
    padding: 6,
    gap: 2,
    marginTop: 2,
  },
  solvedExampleLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#10B981',
  },
  solvedExampleText: {
    fontSize: 10,
    color: '#CBD5E1',
    lineHeight: 14,
  },
});
