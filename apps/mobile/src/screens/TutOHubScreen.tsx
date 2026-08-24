import React, { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
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
  Search,
  X,
  ShieldCheck,
  Hash,
  Sparkles,
  Play,
  Calendar,
  Video,
  FileText,
  Heart,
  Smile,
  CheckCircle2,
  Clock,
  ArrowRight,
  Flame,
  Award,
} from 'lucide-react-native';

import { AppContext } from '../context/AppContext';
import { TeachOCoursePickerSheet } from '../components/teacho/TeachOCoursePickerSheet';
import { TutOQBankModal } from '../components/teacho/TutOQBankModal';
import { TutODayCoursePlayerModal } from '../components/teacho/TutODayCoursePlayerModal';
import {
  getAllDaySummariesForCourse,
  getCompletedDaysForCourse,
  toggleDayCompletion,
  DayPlanSummaryItem,
} from '../data/curriculum/wholeYearDayPlanEngine';

import { ALL_COURSES, DEFAULT_COURSE, CourseOption, SchoolBoard } from '../data/coursesCatalog';

const { width } = Dimensions.get('window');

export default function TutOHubScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user } = useContext(AppContext) || {};

  // ─── 1. Active Course & Board State ──────────────────────────────────────────
  const [selectedCourse, setSelectedCourse] = useState<CourseOption>(DEFAULT_COURSE);
  const [selectedBoard, setSelectedBoard] = useState<SchoolBoard>('TNSB');
  const [isCoursePickerOpen, setIsCoursePickerOpen] = useState(false);

  // ─── 2. QBank Number Search Modal State ─────────────────────────────────────
  const [isQBankModalOpen, setIsQBankModalOpen] = useState(false);
  const [qBankInitialQuery, setQBankInitialQuery] = useState('');
  const [qBankInitialSubject, setQBankInitialSubject] = useState('ALL');

  // ─── 3. Whole Year Day Plan & Course Player State ─────────────────────────────
  const [isCoursePlayerOpen, setIsCoursePlayerOpen] = useState(false);
  const [playerDayNumber, setPlayerDayNumber] = useState(1);

  // ─── 4. Completed Days Set State ──────────────────────────────────────────
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());

  // ─── 5. Day Filter & Navigation State ────────────────────────────────────
  const [selectedWeek, setSelectedWeek] = useState<number | 'ALL' | 'HOLIDAYS'>('ALL');
  const [daySearchQuery, setDaySearchQuery] = useState<string>('');

  // Load saved course, board, and completion status on mount
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
        const doneSet = await getCompletedDaysForCourse(savedCourseId || DEFAULT_COURSE.id);
        setCompletedDays(doneSet);
      } catch (e) {
        console.warn('Failed to load saved course state:', e);
      }
    }
    loadSavedState();
  }, []);

  // Course selector handler
  const handleSelectCourse = useCallback(async (course: CourseOption) => {
    if (!course) return;
    try {
      setSelectedCourse(course);
      const courseBoard = ((await AsyncStorage.getItem(`tuto_selected_board_${course.id}`)) as SchoolBoard) || 'TNSB';
      setSelectedBoard(courseBoard);
      setIsCoursePickerOpen(false);
      setSelectedWeek('ALL');
      setDaySearchQuery('');
      AsyncStorage.setItem('tuto_active_course_id', course.id).catch(() => {});
      const doneSet = await getCompletedDaysForCourse(course.id);
      setCompletedDays(doneSet);
    } catch (err) {
      console.warn('Error applying selected course:', err);
      setSelectedCourse(course);
      setIsCoursePickerOpen(false);
    }
  }, []);

  // Toggle completion for a day
  const handleToggleDone = async (dayNum: number) => {
    const isDone = await toggleDayCompletion(selectedCourse.id, dayNum);
    setCompletedDays((prev) => {
      const next = new Set(prev);
      if (isDone) next.add(dayNum);
      else next.delete(dayNum);
      return next;
    });
  };

  // Launch course player for a specific day
  const handleOpenDayPlayer = (dayNum: number) => {
    setPlayerDayNumber(dayNum);
    setIsCoursePlayerOpen(true);
  };

  // Launch QBank modal with query
  const handleOpenQBankWithQuery = (q: string, subjCode?: string) => {
    setQBankInitialQuery(q);
    if (subjCode) setQBankInitialSubject(subjCode);
    setIsQBankModalOpen(true);
  };

  // Generate light 300-day summaries for the active course
  const allDaysList: DayPlanSummaryItem[] = useMemo(() => {
    return getAllDaySummariesForCourse(
      selectedCourse.id,
      selectedCourse.title,
      300,
      selectedBoard,
      completedDays
    );
  }, [selectedCourse.id, selectedCourse.title, selectedBoard, completedDays]);

  // Filter days based on week selection and search query
  const filteredDays = useMemo(() => {
    const q = daySearchQuery.trim().toLowerCase();
    const isSingleNum = /^\d+$/.test(q);
    const searchNum = isSingleNum ? parseInt(q, 10) : null;

    return allDaysList.filter((d) => {
      // Week filter
      if (selectedWeek === 'HOLIDAYS') {
        if (!d.isMondayHoliday) return false;
      } else if (typeof selectedWeek === 'number') {
        if (d.weekNumber !== selectedWeek) return false;
      }

      // Search filter
      if (q) {
        if (isSingleNum && searchNum !== null) {
          return d.dayNumber === searchNum;
        }
        const matchText = `${d.dayNumber} ${d.topicTitle} ${d.topicTamilTitle || ''} ${d.subject} ${d.chapterTitle}`.toLowerCase();
        return matchText.includes(q);
      }

      return true;
    });
  }, [allDaysList, selectedWeek, daySearchQuery]);

  // Total completion statistics
  const completedCount = completedDays.size;
  const progressPercent = Math.min(100, Math.round((completedCount / 300) * 100));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#070C18" />

      {/* ─── 1. CLEAN TOP BRAND BAR ─── */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0) + 8 }]}>
        <View style={styles.headerTopRow}>
          <View style={styles.brandContainer}>
            <View style={styles.brandLogoBox}>
              <GraduationCap size={20} color="#00D084" />
            </View>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.brandTitle}>TutO</Text>
                <View style={styles.enrolledBadge}>
                  <Text style={styles.enrolledBadgeText}>ACTIVE COURSE</Text>
                </View>
              </View>
              <Text style={styles.brandSubtitle}>300-Day Whole Year Learning Deck</Text>
            </View>
          </View>

          {/* Header Quick Buttons */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <TouchableOpacity
              style={styles.qbankHeaderBtn}
              onPress={() => handleOpenQBankWithQuery('')}
              activeOpacity={0.8}
            >
              <Hash size={13} color="#070C18" />
              <Text style={styles.qbankHeaderBtnText}>2L+ QBank</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.adminStudioBtn}
              onPress={() => navigation?.navigate?.('TutOAdminScreen')}
              activeOpacity={0.8}
            >
              <ShieldCheck size={13} color="#38BDF8" />
              <Text style={styles.adminStudioBtnText}>Admin Studio</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── 2. ACTIVE PURCHASED COURSE CARD & SWITCH BUTTON ─── */}
        <View style={styles.activeCourseCard}>
          <View style={styles.activeCourseHeader}>
            <View style={styles.courseIconBox}>
              <Layers size={16} color="#00D084" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.activeCourseLabel}>ENROLLED COURSE BLUEPRINT</Text>
              <Text style={styles.activeCourseTitle} numberOfLines={1}>
                {selectedCourse.title}
              </Text>
            </View>

            {/* ONLY ONE OPTION: CHANGE / SWITCH COURSE */}
            <TouchableOpacity
              style={styles.changeCourseBtn}
              activeOpacity={0.8}
              onPress={() => setIsCoursePickerOpen(true)}
            >
              <Text style={styles.changeCourseBtnText}>Change Course</Text>
              <ArrowRight size={12} color="#070C18" />
            </TouchableOpacity>
          </View>

          {/* Progress Bar & Stats */}
          <View style={styles.progressSection}>
            <View style={styles.progressInfoRow}>
              <Text style={styles.progressInfoText}>
                Day <Text style={{ color: '#00D084', fontWeight: '900' }}>{completedCount}</Text> of 300 Completed
              </Text>
              <Text style={styles.progressPercentText}>{progressPercent}% Progress</Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${Math.max(2, progressPercent)}%` }]} />
            </View>
          </View>
        </View>
      </View>

      {/* ─── 3. VIRTUALIZED ADMIN-RELEASED DAY PLANS FEED ─── */}
      <FlatList
        data={filteredDays}
        keyExtractor={(item) => `day_${item.dayNumber}`}
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={Platform.OS === 'android'}
        contentContainerStyle={styles.dayListContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Quick Day Search & Jump Bar */}
            <View style={styles.searchBarContainer}>
              <Search size={16} color="#00D084" />
              <TextInput
                style={styles.searchInput}
                placeholder="Jump to Day # (e.g. 100) or topic name..."
                placeholderTextColor="#64748B"
                value={daySearchQuery}
                onChangeText={setDaySearchQuery}
                clearButtonMode="while-editing"
              />
              {daySearchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setDaySearchQuery('')}>
                  <X size={16} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>

            {/* Week Filter Stepper Bar */}
            <View style={styles.weekSelectorSection}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.weekBar}>
                <TouchableOpacity
                  style={[styles.weekPill, selectedWeek === 'ALL' && styles.weekPillActive]}
                  onPress={() => setSelectedWeek('ALL')}
                >
                  <Text style={[styles.weekPillText, selectedWeek === 'ALL' && styles.weekPillTextActive]}>
                    All 300 Days
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.weekPill, selectedWeek === 'HOLIDAYS' && styles.weekPillHolidayActive]}
                  onPress={() => setSelectedWeek('HOLIDAYS')}
                >
                  <Text style={[styles.weekPillText, selectedWeek === 'HOLIDAYS' && { color: '#00D084', fontWeight: '900' }]}>
                    🌿 43 Monday Holidays
                  </Text>
                </TouchableOpacity>

                {Array.from({ length: 43 }, (_, i) => i + 1).map((wk) => (
                  <TouchableOpacity
                    key={wk}
                    style={[styles.weekPill, selectedWeek === wk && styles.weekPillActive]}
                    onPress={() => setSelectedWeek(wk)}
                  >
                    <Text style={[styles.weekPillText, selectedWeek === wk && styles.weekPillTextActive]}>
                      Week {wk}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Results Count Bar */}
            <View style={styles.resultsCountBar}>
              <Text style={styles.resultsCountText}>
                Showing <Text style={{ color: '#00D084', fontWeight: '900' }}>{filteredDays.length}</Text> Admin-Released Day Plans
                {selectedWeek === 'HOLIDAYS' ? ' (Monday Mindful Holidays)' : typeof selectedWeek === 'number' ? ` (Week ${selectedWeek})` : ''}
              </Text>
            </View>
          </View>
        }
        renderItem={({ item: dayItem }) => {
          const isDone = completedDays.has(dayItem.dayNumber);

          return (
            <View
              key={dayItem.dayNumber}
              style={[
                styles.dayCard,
                dayItem.isMondayHoliday && styles.dayCardHoliday,
                isDone && styles.dayCardDone,
              ]}
            >
              {/* Day Header Row */}
              <View style={styles.dayCardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View
                    style={[
                      styles.dayNumberBadge,
                      dayItem.isMondayHoliday && styles.dayNumberBadgeHoliday,
                      isDone && styles.dayNumberBadgeDone,
                    ]}
                  >
                    <Text style={styles.dayNumberBadgeText}>DAY {dayItem.dayNumber}</Text>
                  </View>

                  <View>
                    <Text style={styles.dayWeekText}>
                      Week {dayItem.weekNumber} · {dayItem.dayOfWeekName}
                    </Text>
                    <Text style={styles.daySubjectText}>{dayItem.subject}</Text>
                  </View>
                </View>

                {/* Status Badges */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  {dayItem.isMondayHoliday ? (
                    <View style={styles.holidayPill}>
                      <Text style={styles.holidayPillText}>🌿 MONDAY HOLIDAY</Text>
                    </View>
                  ) : (
                    <View style={styles.xpPill}>
                      <Flame size={11} color="#F59E0B" />
                      <Text style={styles.xpPillText}>+{dayItem.totalXpReward} XP</Text>
                    </View>
                  )}

                  {/* Mark as Done Toggle Button */}
                  <TouchableOpacity
                    style={[styles.doneCheckBtn, isDone && styles.doneCheckBtnActive]}
                    onPress={() => handleToggleDone(dayItem.dayNumber)}
                    activeOpacity={0.7}
                  >
                    <CheckCircle2 size={16} color={isDone ? '#00D084' : '#64748B'} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Day Topic Title */}
              <Text style={styles.dayTopicTitle}>{dayItem.topicTitle}</Text>
              {dayItem.topicTamilTitle && (
                <Text style={styles.dayTopicTamil}>{dayItem.topicTamilTitle}</Text>
              )}

              {/* 4 Content Pillars Preview */}
              <View style={styles.pillarsRow}>
                <View style={styles.pillarPill}>
                  <Video size={11} color="#38BDF8" />
                  <Text style={styles.pillarPillText}>3 Videos</Text>
                </View>

                <View style={styles.pillarPill}>
                  <FileText size={11} color="#A78BFA" />
                  <Text style={styles.pillarPillText}>3 Notes</Text>
                </View>

                <View style={styles.pillarPill}>
                  <Award size={11} color="#10B981" />
                  <Text style={styles.pillarPillText}>5 MCQs Test</Text>
                </View>

                <View style={styles.pillarPill}>
                  <Smile size={11} color="#F43F5E" />
                  <Text style={styles.pillarPillText}>Yoga & Task</Text>
                </View>
              </View>

              {/* Action Buttons Row */}
              <View style={styles.dayActionRow}>
                {/* 1. Main Action: Start Day Course Player */}
                <TouchableOpacity
                  style={[styles.startPlayerBtn, dayItem.isMondayHoliday && styles.startPlayerBtnHoliday]}
                  activeOpacity={0.85}
                  onPress={() => handleOpenDayPlayer(dayItem.dayNumber)}
                >
                  <Play size={13} color="#070C18" fill="#070C18" />
                  <Text style={styles.startPlayerBtnText}>
                    {dayItem.isMondayHoliday
                      ? `Open Monday Review (Day ${dayItem.dayNumber}) 🌿`
                      : `Start Day ${dayItem.dayNumber} Player ▶️`}
                  </Text>
                </TouchableOpacity>

                {/* 2. Secondary Action: Practice Topic QBank MCQs */}
                {!dayItem.isMondayHoliday && (
                  <TouchableOpacity
                    style={styles.topicQBankBtn}
                    activeOpacity={0.8}
                    onPress={() => handleOpenQBankWithQuery(dayItem.topicTitle, dayItem.subjectCode)}
                  >
                    <Hash size={12} color="#00D084" />
                    <Text style={styles.topicQBankBtnText}>Topic QBank</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
      />

      {/* ─── 4. UNIVERSAL COURSE PICKER & PURCHASE SHEET (SINGLE CHANGE OPTION) ─── */}
      <TeachOCoursePickerSheet
        visible={isCoursePickerOpen}
        courses={ALL_COURSES}
        selectedCourse={selectedCourse}
        selectedCourseId={selectedCourse?.id}
        onSelect={handleSelectCourse}
        onSelectCourse={handleSelectCourse}
        onClose={() => setIsCoursePickerOpen(false)}
      />

      {/* ─── 5. DETERMINISTIC MCQ QBANK & NUMBER SEARCH MODAL ─── */}
      <TutOQBankModal
        visible={isQBankModalOpen}
        onClose={() => setIsQBankModalOpen(false)}
        initialQuery={qBankInitialQuery}
        initialSubjectCode={qBankInitialSubject}
      />

      {/* ─── 6. 300-DAY INTERACTIVE COURSE PLAYER MODAL ─── */}
      <TutODayCoursePlayerModal
        visible={isCoursePlayerOpen}
        dayPlan={allDaysList.find((d) => d.dayNumber === playerDayNumber) ? undefined : undefined}
        dayNumber={playerDayNumber}
        courseId={selectedCourse.id}
        courseTitle={selectedCourse.title}
        schoolBoard={selectedBoard}
        onClose={() => setIsCoursePlayerOpen(false)}
        onCompleteDay={async (completedDay) => {
          await handleToggleDone(completedDay);
        }}
      />
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
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandLogoBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#00D08450',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: -0.5,
  },
  enrolledBadge: {
    backgroundColor: 'rgba(0, 208, 132, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  enrolledBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#00D084',
  },
  brandSubtitle: {
    fontSize: 11,
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
    borderRadius: 6,
  },
  qbankHeaderBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#070C18',
  },
  adminStudioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#131F37',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#38BDF840',
  },
  adminStudioBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38BDF8',
  },
  activeCourseCard: {
    backgroundColor: '#131F37',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 10,
  },
  activeCourseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  courseIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#00D08440',
  },
  activeCourseLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#00D084',
    letterSpacing: 0.5,
  },
  activeCourseTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#F8FAFC',
  },
  changeCourseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#00D084',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  changeCourseBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#070C18',
  },
  progressSection: {
    gap: 4,
  },
  progressInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressInfoText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  progressPercentText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#00D084',
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#070C18',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00D084',
  },
  dayListContent: {
    padding: 14,
    paddingBottom: 40,
    gap: 12,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0E172A',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    height: 40,
    marginBottom: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#F8FAFC',
  },
  weekSelectorSection: {
    marginBottom: 10,
  },
  weekBar: {
    gap: 6,
  },
  weekPill: {
    backgroundColor: '#0E172A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  weekPillActive: {
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
    borderColor: '#00D084',
  },
  weekPillHolidayActive: {
    backgroundColor: 'rgba(0, 208, 132, 0.25)',
    borderColor: '#00D084',
  },
  weekPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  weekPillTextActive: {
    color: '#00D084',
    fontWeight: '900',
  },
  resultsCountBar: {
    paddingVertical: 4,
    marginBottom: 4,
  },
  resultsCountText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  dayCard: {
    backgroundColor: '#0E172A',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 8,
  },
  dayCardHoliday: {
    borderColor: 'rgba(0, 208, 132, 0.4)',
    backgroundColor: '#09151F',
  },
  dayCardDone: {
    borderColor: 'rgba(0, 208, 132, 0.6)',
  },
  dayCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayNumberBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#38BDF850',
  },
  dayNumberBadgeHoliday: {
    backgroundColor: 'rgba(0, 208, 132, 0.2)',
    borderColor: '#00D084',
  },
  dayNumberBadgeDone: {
    backgroundColor: 'rgba(0, 208, 132, 0.25)',
    borderColor: '#00D084',
  },
  dayNumberBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#F8FAFC',
  },
  dayWeekText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  daySubjectText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00D084',
  },
  holidayPill: {
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  holidayPillText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#00D084',
  },
  xpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#131F37',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  xpPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#F59E0B',
  },
  doneCheckBtn: {
    padding: 2,
  },
  doneCheckBtnActive: {
    opacity: 1,
  },
  dayTopicTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F8FAFC',
    lineHeight: 19,
  },
  dayTopicTamil: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
  },
  pillarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    marginTop: 2,
  },
  pillarPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#131F37',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 5,
  },
  pillarPillText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  dayActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  startPlayerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#00D084',
    paddingVertical: 9,
    borderRadius: 8,
  },
  startPlayerBtnHoliday: {
    backgroundColor: '#00D084',
  },
  startPlayerBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#070C18',
  },
  topicQBankBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#131F37',
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00D08440',
  },
  topicQBankBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00D084',
  },
});
