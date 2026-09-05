'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  GraduationCap, Target, Calendar, Search, ChevronDown,
  CheckCircle2, Clock, ChevronRight, Play, BookOpen, Layers, Lock, Zap, FileText,
  Flame, Star, Compass, Sparkles, Heart, Award, Filter, X
} from 'lucide-react';

import { ALL_COURSES, DEFAULT_COURSE, CourseOption, SchoolBoard, FEATURED_JUNIOR_COURSES } from '@/data/coursesCatalog';
import { getReleasedDaySummariesForCourse, getCompletedDaysForCourse, DayPlanSummaryItem, getMaxUnlockedDay } from '@/data/curriculum/wholeYearDayPlanEngine';

// Modals & Sub-components
import { StudentOnboardingWebModal } from '@/components/teacho/StudentOnboardingWebModal';
import { TutOOnlineTestWebModal } from '@/components/teacho/TutOOnlineTestWebModal';
import { TutOTopicExplainerWebModal } from '@/components/teacho/TutOTopicExplainerWebModal';
import { TutODayCoursePlayerWebModal } from '@/components/teacho/TutODayCoursePlayerWebModal';
import { TutODailyPlannerCockpit } from '@/components/teacho/TutODailyPlannerCockpit';

export type LearnerStream = 'school' | 'entrance' | 'career' | 'college';

export default function TutOWebPage() {
  // Global State
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'daily_mission' | 'curriculum_grid' | 'ambitions'>('daily_mission');
  const [activeStream, setActiveStream] = useState<LearnerStream>('school');
  const [userPhone, setUserPhone] = useState<string>('anonymous');
  
  // Course State
  const [selectedCourse, setSelectedCourse] = useState<CourseOption>(DEFAULT_COURSE);
  const [selectedBoard, setSelectedBoard] = useState<SchoolBoard>('TNSB');
  const [activeAmbitionId, setActiveAmbitionId] = useState<string>('jr-ias');
  const [isCoursePickerOpen, setIsCoursePickerOpen] = useState(false);
  const [courseSearchQuery, setCourseSearchQuery] = useState('');

  // Days Engine State
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());
  const [maxUnlockedDay, setMaxUnlockedDay] = useState<number>(1);
  const [adminReleasedDays, setAdminReleasedDays] = useState<DayPlanSummaryItem[]>([]);
  const [isLoadingDays, setIsLoadingDays] = useState(true);

  // Modal State
  const [isOnlineTestModalOpen, setIsOnlineTestModalOpen] = useState(false);
  const [isExplainerModalOpen, setIsExplainerModalOpen] = useState(false);
  const [explainerDayNumber, setExplainerDayNumber] = useState(1);
  const [isCoursePlayerOpen, setIsCoursePlayerOpen] = useState(false);
  const [playerDayNumber, setPlayerDayNumber] = useState(1);

  const refreshReleasedDays = useCallback(async (courseId: string, courseTitle: string, board: SchoolBoard, doneSet: Set<number>) => {
    setIsLoadingDays(true);
    try {
      const list = await getReleasedDaySummariesForCourse(courseId, courseTitle, board, doneSet);
      setAdminReleasedDays(list);
    } catch (e) {
      console.warn(e);
    } finally {
      setIsLoadingDays(false);
    }
  }, []);

  useEffect(() => {
    const loadSavedState = async () => {
      let course = DEFAULT_COURSE;
      let board: SchoolBoard = 'TNSB';
      let ambition = 'jr-ias';
      let phone = 'anonymous';
      
      if (typeof window !== 'undefined') {
        const onboardingDone = window.localStorage.getItem('tuto_student_onboarding_completed');
        if (!onboardingDone) setIsOnboardingModalOpen(true);

        const savedCourseId = window.localStorage.getItem('tuto_active_course_id');
        if (savedCourseId && savedCourseId !== 'school-std-10') {
          const matched = ALL_COURSES.find(c => c.id === savedCourseId);
          if (matched) course = matched;
          
          const savedBoard = window.localStorage.getItem(`tuto_selected_board_${savedCourseId}`);
          if (savedBoard) board = savedBoard as SchoolBoard;
        } else {
          const std5 = ALL_COURSES.find(c => c.id === 'school-std-5');
          if (std5) course = std5;
        }

        const savedAmbition = window.localStorage.getItem('tuto_active_ambition_id');
        if (savedAmbition) ambition = savedAmbition;


        const savedPhone = window.localStorage.getItem('user_phone') || window.localStorage.getItem('supro_phone') || window.localStorage.getItem('tuto_phone');
        if (savedPhone) phone = savedPhone;
      }

      setSelectedCourse(course);
      setSelectedBoard(board);
      setActiveAmbitionId(ambition);
      setUserPhone(phone);

      // Deduce stream from course
      if (course.category.includes('school')) setActiveStream('school');
      else if (course.category.includes('entrance')) setActiveStream('entrance');
      else if (course.category.includes('tnpsc') || course.category.includes('upsc') || course.category.includes('banking') || course.category.includes('ssc')) setActiveStream('career');
      else if (course.category.includes('college')) setActiveStream('college');

      const doneSet = await getCompletedDaysForCourse(course.id);
      setCompletedDays(doneSet);
      const maxDay = await getMaxUnlockedDay(course.id);
      setMaxUnlockedDay(maxDay);
      await refreshReleasedDays(course.id, course.title, board, doneSet);
    };
    
    loadSavedState();
  }, [refreshReleasedDays]);

  const handleSelectCourse = async (course: CourseOption) => {
    setSelectedCourse(course);
    setIsCoursePickerOpen(false);
    
    let board: SchoolBoard = 'TNSB';
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('tuto_active_course_id', course.id);
      const savedBoard = window.localStorage.getItem(`tuto_selected_board_${course.id}`);
      if (savedBoard) board = savedBoard as SchoolBoard;
    }
    
    setSelectedBoard(board);
    const doneSet = await getCompletedDaysForCourse(course.id);
    setCompletedDays(doneSet);
    const maxDay = await getMaxUnlockedDay(course.id);
    setMaxUnlockedDay(maxDay);
    await refreshReleasedDays(course.id, course.title, board, doneSet);
  };

  const handleSelectAmbition = (ambitionId: string) => {
    setActiveAmbitionId(ambitionId);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('tuto_active_ambition_id', ambitionId);
    }
  };

  const handleOpenDay = (dayNum: number) => {
    setPlayerDayNumber(dayNum);
    setIsCoursePlayerOpen(true);
  };

  // Filter courses for modal picker
  const filteredCourses = useMemo(() => {
    return ALL_COURSES.filter(c => {
      const matchQuery = courseSearchQuery.trim() === '' ||
        c.title.toLowerCase().includes(courseSearchQuery.toLowerCase()) ||
        c.subtitle.toLowerCase().includes(courseSearchQuery.toLowerCase());
      
      if (!matchQuery) return false;

      if (activeStream === 'school') return c.category.includes('school') || c.category.includes('featured_junior');
      if (activeStream === 'entrance') return c.category.includes('entrance');
      if (activeStream === 'career') return c.category.includes('tnpsc') || c.category.includes('upsc') || c.category.includes('banking') || c.category.includes('ssc');
      if (activeStream === 'college') return c.category.includes('college') || c.category.includes('skills');
      return true;
    });
  }, [activeStream, courseSearchQuery]);

  const currentAmbitionObj = FEATURED_JUNIOR_COURSES.find(c => c.id === activeAmbitionId) || FEATURED_JUNIOR_COURSES[0];

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-5 md:p-8 space-y-6 pb-44 md:pb-40 text-foreground">
      
      {/* 1. TOP APP BAR (Sleek, Clean, Theme-Aware) */}
      <div className="bg-card border border-border/80 rounded-3xl p-4 md:p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        
        {/* Left: Active Course & Stream Badge */}
        <div className="flex items-center gap-3.5 w-full md:w-auto">
          <div className="p-3 bg-primary/10 text-primary rounded-2xl shrink-0">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                {selectedCourse.category.replace(/_/g, ' ')}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                Board: {selectedBoard}
              </span>
            </div>
            <h1 className="text-lg md:text-xl font-black text-foreground truncate mt-0.5">
              {selectedCourse.title}
            </h1>
          </div>
        </div>

        {/* Right: Actions & Switchers */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
          <button
            onClick={() => setIsCoursePickerOpen(true)}
            className="px-3.5 py-2.5 bg-muted hover:bg-muted/80 text-foreground rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            <span>Change Course</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>

          <button 
            onClick={() => {
              setExplainerDayNumber(1);
              setIsExplainerModalOpen(true);
            }}
            className="px-3.5 py-2.5 bg-card hover:bg-muted text-foreground border border-border rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5 text-primary" />
            <span>Daily Explainer</span>
          </button>

          <button 
            onClick={() => setIsOnlineTestModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 hover:opacity-90 text-white rounded-2xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all"
          >
            <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
            <span>Online Test</span>
            <span className="bg-white/20 text-white text-[9px] px-1.5 py-0.2 rounded-full font-black uppercase">
              30K
            </span>
          </button>
        </div>
      </div>

      {/* 2. 4-PERSONA LEARNER STREAM SELECTOR BAR */}
      <div className="bg-muted/40 p-1.5 rounded-2xl border border-border/60 flex items-center gap-1 overflow-x-auto">
        {[
          { id: 'school', label: '🎒 School (1st to 12th)', desc: 'Samacheer Kalvi & CBSE' },
          { id: 'entrance', label: '🎯 NEET & JEE Entrances', desc: 'Medical & Engineering' },
          { id: 'career', label: '🏛️ TNPSC & Govt Career', desc: 'Group 1/2/4 & UPSC' },
          { id: 'college', label: '🎓 College & Skills', desc: 'Degree & Tech Programs' },
        ].map((st) => (
          <button
            key={st.id}
            onClick={() => {
              setActiveStream(st.id as LearnerStream);
              // Auto pick first course of stream if current does not match
              const match = ALL_COURSES.find(c => {
                if (st.id === 'school') return c.category.includes('school');
                if (st.id === 'entrance') return c.category.includes('entrance');
                if (st.id === 'career') return c.category.includes('tnpsc') || c.category.includes('upsc');
                if (st.id === 'college') return c.category.includes('college');
                return false;
              });
              if (match) handleSelectCourse(match);
            }}
            className={`flex-1 min-w-[140px] px-4 py-2 rounded-xl text-xs font-bold transition-all text-center ${
              activeStream === st.id
                ? 'bg-card text-primary shadow-sm border border-border/80'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="truncate">{st.label}</div>
          </button>
        ))}
      </div>

      {/* 3. PRIMARY VIEW MODE TABS */}
      <div className="flex border-b border-border/80 gap-3 overflow-x-auto pb-0.5">
        <button
          onClick={() => setActiveTab('daily_mission')}
          className={`pb-3 font-extrabold text-sm flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'daily_mission'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>📅 Today&apos;s Mission (Daily Cockpit)</span>
        </button>

        <button
          onClick={() => setActiveTab('curriculum_grid')}
          className={`pb-3 font-extrabold text-sm flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'curriculum_grid'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>📚 Curriculum Roadmap (300 Days)</span>
        </button>

        <button
          onClick={() => setActiveTab('ambitions')}
          className={`pb-3 font-extrabold text-sm flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'ambitions'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>⭐ Futuristic Ambitions</span>
          <span className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/30 rounded-full font-bold">
            {currentAmbitionObj.short}
          </span>
        </button>
      </div>

      {/* 4. TAB 1: Today's Mission (Daily Planner Cockpit) */}
      {activeTab === 'daily_mission' && (
        <TutODailyPlannerCockpit 
          course={selectedCourse}
          selectedBoard={selectedBoard}
          activeAmbitionId={activeAmbitionId}
          onSelectAmbition={handleSelectAmbition}
          dayNumber={playerDayNumber}
          onChangeDayNumber={(newDay) => setPlayerDayNumber(newDay)}
          onOpenExplainer={(day, topic) => {
            setExplainerDayNumber(day);
            setIsExplainerModalOpen(true);
          }}
          onOpenTest={(category, subject) => {
            setIsOnlineTestModalOpen(true);
          }}
          onOpenCoursePlayer={(day) => {
            setPlayerDayNumber(day);
            setIsCoursePlayerOpen(true);
          }}
          userPhone={userPhone}
        />
      )}

      {/* 5. TAB 2: 365-Day Curriculum Roadmap Grid */}
      {activeTab === 'curriculum_grid' && (
        <div className="space-y-4">
          <div className="flex justify-between items-end mb-2">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-foreground">Whole Year Academic Roadmap</h2>
              <p className="text-muted-foreground text-xs">365 progressive daily missions aligned with official syllabus.</p>
            </div>
            <div className="text-right">
              <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full border border-primary/20">
                {completedDays.size} / {adminReleasedDays.length} Days Completed
              </span>
            </div>
          </div>

          {isLoadingDays ? (
            <div className="text-center py-24 text-primary font-bold flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-muted-foreground">Loading OCI Curriculum Roadmap...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {adminReleasedDays.map((day) => {
                const isDone = completedDays.has(day.dayNumber);
                const isLocked = day.dayNumber > maxUnlockedDay;
                return (
                  <div 
                    key={day.dayNumber}
                    onClick={() => !isLocked && handleOpenDay(day.dayNumber)}
                    className={`rounded-3xl p-5 border transition-all flex flex-col justify-between ${
                      isLocked
                        ? 'border-border/60 bg-muted/40 opacity-60 cursor-not-allowed'
                        : isDone 
                        ? 'border-emerald-500/30 bg-card hover:border-emerald-500/50 cursor-pointer shadow-sm' 
                        : 'border-border bg-card hover:border-primary/50 shadow-sm cursor-pointer'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm ${
                          isDone ? 'bg-emerald-500/20 text-emerald-500' : 'bg-primary/10 text-primary'
                        }`}>
                          D{day.dayNumber}
                        </div>
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : isLocked ? (
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <div className="px-2 py-0.5 bg-muted text-muted-foreground rounded-lg text-[11px] font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3" /> ~45m
                          </div>
                        )}
                      </div>
                      
                      <h3 className="font-bold text-foreground mb-1 line-clamp-1 text-sm">{day.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{day.description}</p>
                      {isLocked && (
                        <p className="text-[11px] text-amber-500 font-bold mb-2">🔒 Complete Day {day.dayNumber - 1} to unlock</p>
                      )}
                      
                      <div className="flex gap-2 mb-3">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-muted text-muted-foreground rounded">
                          {day.subjectLabel}
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-primary/10 text-primary rounded">
                          {day.taskCount} Tasks
                        </span>
                      </div>
                    </div>

                    {/* Quick Action Footer: Topic Notes & Start Day */}
                    <div className="mt-2 pt-3 border-t border-border flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExplainerDayNumber(day.dayNumber);
                          setIsExplainerModalOpen(true);
                        }}
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1 px-2 py-1 rounded"
                        title="Read daily topic notes & micro-quiz"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Notes</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isLocked) handleOpenDay(day.dayNumber);
                        }}
                        disabled={isLocked}
                        className={`text-xs font-bold flex items-center gap-1 py-1 px-2.5 rounded-xl transition-colors ${
                          isLocked 
                            ? 'text-muted-foreground/60 cursor-not-allowed' 
                            : 'text-foreground hover:bg-muted'
                        }`}
                      >
                        <span>Start</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 6. TAB 3: Futuristic Ambition Tracks Hub */}
      {activeTab === 'ambitions' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-foreground">Futuristic Career Ambition Tracks</h2>
            <p className="text-muted-foreground text-xs">
              Early foundational reasoning, governance, robotics, medicine, and deep science alongside your school curriculum.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURED_JUNIOR_COURSES.map((amb) => {
              const isSelected = amb.id === activeAmbitionId;
              return (
                <div
                  key={amb.id}
                  onClick={() => handleSelectAmbition(amb.id)}
                  className={`rounded-3xl p-6 border-2 transition-all cursor-pointer flex flex-col justify-between bg-card ${
                    isSelected
                      ? 'border-primary shadow-lg ring-2 ring-primary/20'
                      : 'border-border hover:border-border/80'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-4xl">{amb.icon || '⭐'}</span>
                      {isSelected ? (
                        <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active Aim
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                          Select
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-black text-foreground mb-1">
                      {amb.short}
                    </h3>
                    <p className="text-xs text-primary font-bold mb-2">
                      {amb.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
                      {amb.subtitle}
                    </p>

                    <div className="space-y-1.5 mb-4">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Key Foundation Units:</p>
                      {amb.subjects?.slice(0, 3).map((sub, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-foreground/80">
                          <span>{sub.icon}</span>
                          <span className="truncate">{sub.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectAmbition(amb.id);
                      setActiveTab('daily_mission');
                    }}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground hover:bg-muted/80'
                    }`}
                  >
                    <span>{isSelected ? 'Open in Daily Planner' : 'Set as My Ambition'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. COURSE SELECTION MODAL (Comprehensive & Clean) */}
      {isCoursePickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-foreground">Select Course or Exam Track</h3>
                <p className="text-xs text-muted-foreground">Pick from School standards, Competitive exams, or College degrees.</p>
              </div>
              <button
                onClick={() => setIsCoursePickerOpen(false)}
                className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
              <input
                type="text"
                value={courseSearchQuery}
                onChange={(e) => setCourseSearchQuery(e.target.value)}
                placeholder="Search by class, exam or subject (e.g. 10th, NEET, TNPSC, Physics)..."
                className="w-full pl-9 pr-4 py-2.5 bg-muted/60 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            {/* Courses List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredCourses.map((c) => (
                <div
                  key={c.id}
                  onClick={() => handleSelectCourse(c)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    c.id === selectedCourse.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border/60 bg-muted/20 hover:border-border hover:bg-muted/50'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold text-foreground truncate">{c.title}</span>
                      <span className="text-[10px] px-2 py-0.2 bg-muted text-muted-foreground rounded uppercase font-bold">
                        {c.board}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{c.subtitle}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 8. Modals */}
      {isOnboardingModalOpen && (
        <StudentOnboardingWebModal 
          isOpen={isOnboardingModalOpen}
          onClose={() => setIsOnboardingModalOpen(false)}
          onComplete={(course, board, profile) => {
            setSelectedCourse(course);
            setSelectedBoard(board);
            if (profile.areaOfInterest) {
              const matched = FEATURED_JUNIOR_COURSES.find(c => c.id.includes(profile.areaOfInterest));
              if (matched) handleSelectAmbition(matched.id);
            }
            setIsOnboardingModalOpen(false);
          }}
        />
      )}

      {isOnlineTestModalOpen && (
        <TutOOnlineTestWebModal 
          isOpen={isOnlineTestModalOpen}
          onClose={() => setIsOnlineTestModalOpen(false)}
          course={selectedCourse}
        />
      )}

      {isExplainerModalOpen && (
        <TutOTopicExplainerWebModal 
          isOpen={isExplainerModalOpen}
          onClose={() => setIsExplainerModalOpen(false)}
          course={selectedCourse}
          initialDayNumber={explainerDayNumber}
          onOpenTest={(category, subject) => {
            setIsExplainerModalOpen(false);
            setIsOnlineTestModalOpen(true);
          }}
        />
      )}

      {isCoursePlayerOpen && (
        <TutODayCoursePlayerWebModal 
          isOpen={isCoursePlayerOpen}
          onClose={() => setIsCoursePlayerOpen(false)}
          dayNumber={playerDayNumber}
          course={selectedCourse}
          onDayComplete={async (d) => {
            const newDoneSet = new Set([...completedDays, d]);
            setCompletedDays(newDoneSet);
            await refreshReleasedDays(selectedCourse.id, selectedCourse.title, selectedBoard, newDoneSet);
            const maxDay = await getMaxUnlockedDay(selectedCourse.id);
            setMaxUnlockedDay(maxDay);
          }}
        />
      )}
    </div>
  );
}
