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
  Lock,
  Send,
  Zap,
  Target,
} from 'lucide-react-native';

import { AppContext } from '../context/AppContext';
import { TeachOCoursePickerSheet } from '../components/teacho/TeachOCoursePickerSheet';
import { TutOQBankModal } from '../components/teacho/TutOQBankModal';
import { TutODayCoursePlayerModal } from '../components/teacho/TutODayCoursePlayerModal';
import { StudentOnboardingModal, StudentProfileData } from '../components/teacho/StudentOnboardingModal';
import {
  getReleasedDaySummariesForCourse,
  getCompletedDaysForCourse,
  toggleDayCompletion,
  DayPlanSummaryItem,
} from '../data/curriculum/wholeYearDayPlanEngine';

import { ALL_COURSES, DEFAULT_COURSE, CourseOption, SchoolBoard, FEATURED_JUNIOR_COURSES } from '../data/coursesCatalog';

const { width } = Dimensions.get('window');

export default function TutOHubScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user, isAdmin: ctxIsAdmin } = useContext(AppContext) || {};
  const isAdmin = Boolean(
    ctxIsAdmin ||
    user?.isAdmin ||
    (user?.role && user.role.toLowerCase() === 'admin') ||
    (user?.phone && ['9486335870'].includes(user.phone.replace(/\D/g, '').slice(-10)))
  );

  // ─── 0. Student Onboarding & Career Profiling State ──────────────────────────
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);

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

  // ─── 5. Admin-Released Days Pool ─────────────────────────────────────────
  const [adminReleasedDays, setAdminReleasedDays] = useState<DayPlanSummaryItem[]>([]);
  const [isLoadingDays, setIsLoadingDays] = useState<boolean>(true);

  // ─── 6. Day Filter & Navigation State ────────────────────────────────────
  const [selectedWeek, setSelectedWeek] = useState<number | 'ALL' | 'HOLIDAYS'>('ALL');
  const [daySearchQuery, setDaySearchQuery] = useState<string>('');

  // Load released day plans from admin store
  const refreshReleasedDays = useCallback(async (courseId: string, courseTitle: string, board: SchoolBoard, doneSet: Set<number>) => {
    setIsLoadingDays(true);
    try {
      const list = await getReleasedDaySummariesForCourse(courseId, courseTitle, board, doneSet);
      setAdminReleasedDays(list);
    } catch (e) {
      console.warn('Failed to load released days:', e);
    } finally {
      setIsLoadingDays(false);
    }
  }, []);

  // Load saved course, board, and completion status on mount
  useEffect(() => {
    async function loadSavedState() {
      try {
        const savedCourseId = await AsyncStorage.getItem('tuto_active_course_id');
        let course = DEFAULT_COURSE;
        let board: SchoolBoard = 'TNSB';
        if (savedCourseId) {
          const savedBoard = await AsyncStorage.getItem(`tuto_selected_board_${savedCourseId}`);
          if (savedBoard) board = savedBoard as SchoolBoard;
          const matched = ALL_COURSES.find((c) => c.id === savedCourseId);
          if (matched) course = matched;
        }
        setSelectedCourse(course);
        setSelectedBoard(board);

        const doneSet = await getCompletedDaysForCourse(course.id);
        setCompletedDays(doneSet);
        await refreshReleasedDays(course.id, course.title, board, doneSet);

        // Check if first-time student onboarding has been completed
        const onboardingDone = await AsyncStorage.getItem('tuto_student_onboarding_completed');
        if (!onboardingDone) {
          setIsOnboardingModalOpen(true);
        }
      } catch (e) {
        console.warn('Failed to load saved course state:', e);
      }
    }
    loadSavedState();
  }, [refreshReleasedDays]);

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
      await refreshReleasedDays(course.id, course.title, courseBoard, doneSet);
    } catch (err) {
      console.warn('Error applying selected course:', err);
      setSelectedCourse(course);
      setIsCoursePickerOpen(false);
    }
  }, [refreshReleasedDays]);

  // Toggle completion for a day
  const handleToggleDone = async (dayNum: number) => {
    const isDone = await toggleDayCompletion(selectedCourse.id, dayNum);
    const next = new Set(completedDays);
    if (isDone) next.add(dayNum);
    else next.delete(dayNum);
    setCompletedDays(next);
    await refreshReleasedDays(selectedCourse.id, selectedCourse.title, selectedBoard, next);
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

  // Filter ONLY the Admin-Released days based on week selection and search query
  const filteredDays = useMemo(() => {
    const q = daySearchQuery.trim().toLowerCase();
    const isSingleNum = /^\d+$/.test(q);
    const searchNum = isSingleNum ? parseInt(q, 10) : null;

    return adminReleasedDays.filter((d) => {
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
  }, [adminReleasedDays, selectedWeek, daySearchQuery]);

  // Total completion statistics for released days
  const releasedTotal = adminReleasedDays.length;
  const completedCount = adminReleasedDays.filter(d => completedDays.has(d.dayNumber)).length;
  const progressPercent = releasedTotal > 0 ? Math.min(100, Math.round((completedCount / releasedTotal) * 100)) : 0;

  // Extract available weeks among released days
  const availableWeeks = useMemo(() => {
    const wSet = new Set<number>();
    adminReleasedDays.forEach(d => wSet.add(d.weekNumber));
    return Array.from(wSet).sort((a, b) => a - b);
  }, [adminReleasedDays]);

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
                  <Text style={styles.enrolledBadgeText}>ADMIN RELEASED</Text>
                </View>
              </View>
              <Text style={styles.brandSubtitle}>Curated Day Plans Deck</Text>
            </View>
          </View>

          {/* Header Quick Buttons (Admin Only) */}
          {isAdmin && (
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
          )}
        </View>

        {/* ─── 2. ACTIVE PURCHASED COURSE CARD & SWITCH BUTTON ─── */}
        <View style={styles.activeCourseCard}>
          <View style={styles.activeCourseHeader}>
            <View style={styles.courseIconBox}>
              <Layers size={16} color="#00D084" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.activeCourseLabel}>ENROLLED COURSE</Text>
              <Text style={styles.activeCourseTitle} numberOfLines={1}>
                {selectedCourse.title}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {/* Button to update Student Profile & Career Goals */}
              <TouchableOpacity
                style={styles.careerProfilePill}
                activeOpacity={0.8}
                onPress={() => setIsOnboardingModalOpen(true)}
              >
                <Target size={11} color="#38BDF8" />
                <Text style={styles.careerProfilePillText}>Goals & Class</Text>
              </TouchableOpacity>

              {/* CHANGE / SWITCH COURSE */}
              <TouchableOpacity
                style={styles.changeCourseBtn}
                activeOpacity={0.8}
                onPress={() => setIsCoursePickerOpen(true)}
              >
                <Text style={styles.changeCourseBtnText}>Change</Text>
                <ArrowRight size={11} color="#070C18" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Progress Bar & Stats */}
          <View style={styles.progressSection}>
            <View style={styles.progressInfoRow}>
              <Text style={styles.progressInfoText}>
                <Text style={{ color: '#00D084', fontWeight: '900' }}>{completedCount}</Text> of {releasedTotal} Released Days Completed
              </Text>
              <Text style={styles.progressPercentText}>{progressPercent}% Done</Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${Math.max(2, progressPercent)}%` }]} />
            </View>
          </View>
        </View>
      </View>

      {/* ─── 3. VIRTUALIZED ADMIN-RELEASED DAY PLANS ONLY ─── */}
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
            {/* ─── 2.3 DAILY 10 QUIZ & TELEGRAM CHALLENGE BANNER ─── */}
            <TouchableOpacity
              style={styles.dailyQuizBanner}
              activeOpacity={0.88}
              onPress={() => navigation.navigate('QuizScreen')}
            >
              <View style={styles.dailyQuizBannerLeft}>
                <View style={styles.dailyQuizIconCircle}>
                  <Zap size={22} color="#070C18" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={styles.dailyQuizBadgeRow}>
                    <Text style={styles.dailyQuizBadgeText}>🎯 DAILY 10 QUIZ CHALLENGE</Text>
                    <View style={styles.quizLivePill}>
                      <Text style={styles.quizLivePillText}>LIVE NOW</Text>
                    </View>
                  </View>
                  <Text style={styles.dailyQuizTitle}>Test Today's 10 High-Yield MCQs</Text>
                  <Text style={styles.dailyQuizSubtitle}>
                    Bilingual (Tamil + English) • Telegram Quiz Group Sync • +150 XP
                  </Text>
                </View>
              </View>
              <View style={styles.dailyQuizArrowWrap}>
                <ArrowRight size={16} color="#00D084" />
              </View>
            </TouchableOpacity>

            {/* ─── 2.5 FEATURED JUNIOR LEADERSHIP & CAREER TRACKS ─── */}
            <View style={styles.featuredSection}>
              <View style={styles.featuredHeaderRow}>
                <View style={styles.featuredTitleWrap}>
                  <Sparkles size={15} color="#F59E0B" />
                  <Text style={styles.featuredSectionTitle}>⭐ FEATURED JUNIOR CAREERS</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setIsCoursePickerOpen(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.viewAllFeaturedText}>View All 10 Tracks →</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.featuredSectionSub}>
                Civil Services, Medicine, Engineering, Law, Police, Defense & Governance
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.featuredScrollContent}
              >
                {FEATURED_JUNIOR_COURSES.map((jr) => {
                  const isCurrent = selectedCourse.id === jr.id;
                  return (
                    <TouchableOpacity
                      key={jr.id}
                      style={[
                        styles.featuredCard,
                        isCurrent && styles.featuredCardActive,
                        { borderColor: isCurrent ? '#00D084' : (jr.badgeColor + '50') },
                      ]}
                      onPress={() => handleSelectCourse(jr)}
                      activeOpacity={0.8}
                    >
                      {/* Top Tag & Icon */}
                      <View style={styles.featuredCardTop}>
                        <Text style={styles.featuredEmoji}>{jr.icon || '⭐'}</Text>
                        <View
                          style={[
                            styles.featuredTagPill,
                            { backgroundColor: jr.badgeColor + '20', borderColor: jr.badgeColor + '60' },
                          ]}
                        >
                          <Text style={[styles.featuredTagText, { color: jr.badgeColor }]}>
                            {jr.badge}
                          </Text>
                        </View>
                      </View>

                      {/* Title & Sub */}
                      <Text style={styles.featuredCardTitle} numberOfLines={1}>
                        {jr.short}
                      </Text>
                      <Text style={styles.featuredCardSub} numberOfLines={2}>
                        {jr.subtitle}
                      </Text>

                      {/* Action CTA */}
                      <View style={styles.featuredCtaRow}>
                        {isCurrent ? (
                          <View style={styles.activeTrackBadge}>
                            <CheckCircle2 size={11} color="#00D084" />
                            <Text style={styles.activeTrackText}>ENROLLED</Text>
                          </View>
                        ) : (
                          <View
                            style={[
                              styles.enrollTrackBtn,
                              { backgroundColor: jr.badgeColor + '20', borderColor: jr.badgeColor + '50' },
                            ]}
                          >
                            <Text style={[styles.enrollTrackBtnText, { color: jr.badgeColor }]}>
                              Learn Track →
                            </Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Quick Day Search & Jump Bar */}
            <View style={styles.searchBarContainer}>
              <Search size={16} color="#00D084" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search released days (e.g. 1, 5, topic name)..."
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

            {/* Week Filter Stepper Bar (Only for Released Weeks) */}
            {availableWeeks.length > 1 && (
              <View style={styles.weekSelectorSection}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.weekBar}>
                  <TouchableOpacity
                    style={[styles.weekPill, selectedWeek === 'ALL' && styles.weekPillActive]}
                    onPress={() => setSelectedWeek('ALL')}
                  >
                    <Text style={[styles.weekPillText, selectedWeek === 'ALL' && styles.weekPillTextActive]}>
                      All Released ({releasedTotal})
                    </Text>
                  </TouchableOpacity>

                  {availableWeeks.map((wk) => (
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
            )}

            {/* Results Count Bar */}
            <View style={styles.resultsCountBar}>
              <Text style={styles.resultsCountText}>
                Showing <Text style={{ color: '#00D084', fontWeight: '900' }}>{filteredDays.length}</Text> Admin-Released Day Plans
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Lock size={32} color="#64748B" />
            <Text style={styles.emptyTitle}>Admin Content In Preparation</Text>
            <Text style={styles.emptySubtitle}>
              The course instructor is currently finalizing lessons for this curriculum. Released day plans will appear here automatically.
            </Text>
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

                {/* 2. Secondary Action: Practice Topic QBank MCQs (Admin Only) */}
                {isAdmin && !dayItem.isMondayHoliday && (
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
        dayPlan={undefined}
        dayNumber={playerDayNumber}
        courseId={selectedCourse.id}
        courseTitle={selectedCourse.title}
        schoolBoard={selectedBoard}
        onClose={() => setIsCoursePlayerOpen(false)}
        onCompleteDay={async (completedDay) => {
          await handleToggleDone(completedDay);
        }}
      />

      {/* ─── 7. FIRST-TIME STUDENT ONBOARDING & CAREER GOAL MODAL ─── */}
      <StudentOnboardingModal
        visible={isOnboardingModalOpen}
        initialName={user?.name || user?.full_name || ''}
        userPhone={user?.phone || ''}
        onClose={() => setIsOnboardingModalOpen(false)}
        onComplete={(course, board, profile) => {
          setSelectedCourse(course);
          setSelectedBoard(board);
          AsyncStorage.setItem('tuto_active_course_id', course.id).catch(() => {});
          AsyncStorage.setItem(`tuto_selected_board_${course.id}`, board).catch(() => {});
          getCompletedDaysForCourse(course.id).then((doneSet) => {
            setCompletedDays(doneSet);
            refreshReleasedDays(course.id, course.title, board, doneSet);
          });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  featuredSection: {
    marginBottom: 14,
    marginTop: 4,
  },
  featuredHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
    paddingHorizontal: 2,
  },
  featuredTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featuredSectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 0.5,
  },
  viewAllFeaturedText: {
    fontSize: 11,
    color: '#38BDF8',
    fontWeight: '700',
  },
  featuredSectionSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  featuredScrollContent: {
    gap: 10,
    paddingRight: 10,
  },
  featuredCard: {
    width: 220,
    backgroundColor: '#0E172A',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    justifyContent: 'space-between',
  },
  featuredCardActive: {
    backgroundColor: '#081A24',
    borderColor: '#00D084',
  },
  featuredCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  featuredEmoji: {
    fontSize: 20,
  },
  featuredTagPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
  },
  featuredTagText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  featuredCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  featuredCardSub: {
    fontSize: 10,
    color: '#94A3B8',
    lineHeight: 14,
    marginBottom: 10,
  },
  featuredCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  activeTrackBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 208, 132, 0.3)',
  },
  activeTrackText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#00D084',
  },
  enrollTrackBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  enrollTrackBtnText: {
    fontSize: 10,
    fontWeight: '800',
  },

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
  careerProfilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 6,
  },
  careerProfilePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38BDF8',
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
  emptyCard: {
    backgroundColor: '#0E172A',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
    marginTop: 20,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
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
  dailyQuizBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#00D08450',
    marginBottom: 16,
  },
  dailyQuizBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dailyQuizIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#00D084',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dailyQuizBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  dailyQuizBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#00D084',
    letterSpacing: 0.5,
  },
  quizLivePill: {
    backgroundColor: 'rgba(0, 208, 132, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  quizLivePillText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#00D084',
  },
  dailyQuizTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  dailyQuizSubtitle: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
    lineHeight: 14,
  },
  dailyQuizArrowWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
