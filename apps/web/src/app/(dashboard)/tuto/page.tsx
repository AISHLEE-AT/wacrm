'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  GraduationCap, Target, Calendar, Search, ChevronDown,
  CheckCircle2, Clock, ChevronRight, Play, BookOpen, Layers, Lock, Zap, FileText,
  Flame, Star, Compass, Sparkles, Heart, Award
} from 'lucide-react';

import { ALL_COURSES, DEFAULT_COURSE, CourseOption, SchoolBoard, FEATURED_JUNIOR_COURSES } from '@/data/coursesCatalog';
import { getReleasedDaySummariesForCourse, getCompletedDaysForCourse, DayPlanSummaryItem, getMaxUnlockedDay } from '@/data/curriculum/wholeYearDayPlanEngine';

// Modals & Sub-components
import { StudentOnboardingWebModal } from '@/components/teacho/StudentOnboardingWebModal';
import { TutOOnlineTestWebModal } from '@/components/teacho/TutOOnlineTestWebModal';
import { TutOTopicExplainerWebModal } from '@/components/teacho/TutOTopicExplainerWebModal';
import { TutODayCoursePlayerWebModal } from '@/components/teacho/TutODayCoursePlayerWebModal';
import { TutODailyPlannerCockpit } from '@/components/teacho/TutODailyPlannerCockpit';

export default function TutOWebPage() {
  // Global State
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'daily_mission' | 'curriculum_grid' | 'ambitions'>('daily_mission');
  const [userPhone, setUserPhone] = useState<string>('anonymous');
  
  // Course State
  const [selectedCourse, setSelectedCourse] = useState<CourseOption>(DEFAULT_COURSE);
  const [selectedBoard, setSelectedBoard] = useState<SchoolBoard>('TNSB');
  const [activeAmbitionId, setActiveAmbitionId] = useState<string>('jr-ias');

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
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);

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
        if (savedCourseId) {
          const matched = ALL_COURSES.find(c => c.id === savedCourseId);
          if (matched) course = matched;
          
          const savedBoard = window.localStorage.getItem(`tuto_selected_board_${savedCourseId}`);
          if (savedBoard) board = savedBoard as SchoolBoard;
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
    setIsCourseDropdownOpen(false);
    
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

  const currentAmbitionObj = FEATURED_JUNIOR_COURSES.find(c => c.id === activeAmbitionId) || FEATURED_JUNIOR_COURSES[0];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      
      {/* 1. Master Header Panel with Course Selector & Action Triggers */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 relative w-full md:w-auto">
          <div className="p-4 bg-indigo-100 text-indigo-600 rounded-2xl">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-black text-gray-900 cursor-pointer flex items-center gap-2" onClick={() => setIsCourseDropdownOpen(!isCourseDropdownOpen)}>
              {selectedCourse.title} <ChevronDown className="w-5 h-5 text-gray-400" />
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                Board: {selectedBoard}
              </span>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                <span>{currentAmbitionObj.icon || '🏛️'}</span>
                <span>Aim: {currentAmbitionObj.short}</span>
              </span>
            </div>
          </div>
          
          {/* Dropdown for Course Selection */}
          {isCourseDropdownOpen && (
            <div className="absolute top-16 left-0 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-3 bg-indigo-50 border-b border-indigo-100 text-xs font-bold text-indigo-900">
                Select Your School Grade or Exam Track:
              </div>
              <div className="max-h-96 overflow-y-auto">
                {ALL_COURSES.map(c => (
                  <button 
                    key={c.id} 
                    className="w-full text-left px-4 py-3 hover:bg-indigo-50 border-b border-gray-50 flex items-center gap-3 transition-colors"
                    onClick={() => handleSelectCourse(c)}
                  >
                    <BookOpen className="w-5 h-5 text-gray-400 shrink-0" />
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{c.title}</p>
                      <p className="text-xs text-gray-500">{c.target_exam || c.subtitle}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
          <button 
            onClick={() => {
              setExplainerDayNumber(1);
              setIsExplainerModalOpen(true);
            }}
            className="flex-1 md:flex-none px-4 py-3 bg-white hover:bg-indigo-50/80 text-indigo-700 border border-indigo-200 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all text-xs"
          >
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>Daily Explainer</span>
            <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full font-black uppercase">
              Notes
            </span>
          </button>

          <button 
            onClick={() => setIsOnlineTestModalOpen(true)}
            className="flex-1 md:flex-none px-5 py-3 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 hover:from-indigo-700 hover:to-violet-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-200 hover:scale-[1.02] active:scale-[0.98] transition-all text-xs"
          >
            <Zap className="w-4 h-4 fill-current text-amber-300" />
            <span>Online Test</span>
            <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-black uppercase">
              30K+ MCQs
            </span>
          </button>
        </div>
      </div>

      {/* 2. Primary LMS Navigation Tabs */}
      <div className="flex border-b border-gray-200 gap-2 overflow-x-auto pb-0.5">
        <button
          onClick={() => setActiveTab('daily_mission')}
          className={`px-5 py-3 font-extrabold text-sm rounded-t-2xl flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'daily_mission'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>📅 Today&apos;s Mission (10+1+1 Protocol)</span>
        </button>

        <button
          onClick={() => setActiveTab('curriculum_grid')}
          className={`px-5 py-3 font-extrabold text-sm rounded-t-2xl flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'curriculum_grid'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>📚 Curriculum Roadmap (300 Days)</span>
        </button>

        <button
          onClick={() => setActiveTab('ambitions')}
          className={`px-5 py-3 font-extrabold text-sm rounded-t-2xl flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'ambitions'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-100'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>⭐ Futuristic Ambition Tracks</span>
        </button>
      </div>

      {/* 3. TAB 1: Today's Mission (Daily Planner Cockpit) */}
      {activeTab === 'daily_mission' && (
        <TutODailyPlannerCockpit 
          course={selectedCourse}
          selectedBoard={selectedBoard}
          activeAmbitionId={activeAmbitionId}
          onSelectAmbition={handleSelectAmbition}
          dayNumber={playerDayNumber}
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

      {/* 4. TAB 2: Curriculum Grid (300-Day Whole Year Roadmap) */}
      {activeTab === 'curriculum_grid' && (
        <div className="space-y-4">
          <div className="flex justify-between items-end mb-2">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900">Whole Year Academic Roadmap</h2>
              <p className="text-gray-500 text-sm">300 progressive daily missions aligned with official syllabus.</p>
            </div>
            <div className="text-right">
              <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1.5 rounded-full">
                {completedDays.size} / {adminReleasedDays.length} Days Completed
              </span>
            </div>
          </div>

          {isLoadingDays ? (
            <div className="text-center py-24 text-indigo-600 font-bold flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span>Loading OCI Curriculum Roadmap...</span>
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
                    className={`border-2 rounded-3xl p-5 transition-all flex flex-col justify-between ${
                      isLocked
                        ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                        : isDone 
                        ? 'border-emerald-200 bg-emerald-50/40 cursor-pointer hover:scale-[1.01]' 
                        : 'border-indigo-100 bg-white hover:border-indigo-300 shadow-sm cursor-pointer hover:scale-[1.01]'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shadow-sm ${
                          isDone ? 'bg-emerald-200 text-emerald-800' : 'bg-indigo-100 text-indigo-700'
                        }`}>
                          D{day.dayNumber}
                        </div>
                        {isDone ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        ) : isLocked ? (
                          <Lock className="w-5 h-5 text-gray-400" />
                        ) : (
                          <div className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> ~45m
                          </div>
                        )}
                      </div>
                      
                      <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{day.title}</h3>
                      <p className="text-xs text-gray-500 font-medium line-clamp-2 mb-3">{day.description}</p>
                      {isLocked && (
                        <p className="text-xs text-orange-500 font-bold mb-2">🔒 Complete Day {day.dayNumber - 1} to unlock</p>
                      )}
                      
                      <div className="flex gap-2 mb-3">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                          {day.subjectLabel}
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-pink-50 text-pink-600 rounded">
                          {day.taskCount} Tasks
                        </span>
                      </div>
                    </div>

                    {/* Quick Action Footer: Topic Notes & Start Day */}
                    <div className="mt-2 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExplainerDayNumber(day.dayNumber);
                          setIsExplainerModalOpen(true);
                        }}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline py-1 px-2 rounded-lg hover:bg-indigo-50 transition-colors"
                        title="Read daily topic notes, flashcards & micro-quiz"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Topic Notes</span>
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
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-100'
                        }`}
                      >
                        <span>Start Day</span>
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

      {/* 5. TAB 3: Futuristic Ambition Hub */}
      {activeTab === 'ambitions' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">Futuristic Career Ambition Tracks</h2>
            <p className="text-gray-500 text-sm">
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
                  className={`rounded-3xl p-6 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-600/20'
                      : 'border-gray-200 bg-white hover:border-indigo-300 shadow-sm'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-4xl">{amb.icon || '⭐'}</span>
                      {isSelected ? (
                        <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active Track
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                          Click to Select
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-black text-gray-900 mb-1">
                      {amb.short}
                    </h3>
                    <p className="text-xs text-indigo-700 font-bold mb-2">
                      {amb.title}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-4">
                      {amb.subtitle}
                    </p>

                    <div className="space-y-1.5 mb-4">
                      <p className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Subjects Covered:</p>
                      {amb.subjects?.slice(0, 3).map((sub, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-gray-700">
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
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
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

      {/* 6. Modals */}
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
