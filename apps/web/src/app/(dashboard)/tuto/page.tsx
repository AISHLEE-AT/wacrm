'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  GraduationCap, Target, Calendar, Search, ChevronDown,
  CheckCircle2, Clock, ChevronRight, Play, BookOpen, Layers, Lock, Zap, FileText
} from 'lucide-react';

import { ALL_COURSES, DEFAULT_COURSE, CourseOption, SchoolBoard } from '@/data/coursesCatalog';
import { getReleasedDaySummariesForCourse, getCompletedDaysForCourse, DayPlanSummaryItem, getMaxUnlockedDay } from '@/data/curriculum/wholeYearDayPlanEngine';

// Modals
import { StudentOnboardingWebModal } from '@/components/teacho/StudentOnboardingWebModal';
import { TutOOnlineTestWebModal } from '@/components/teacho/TutOOnlineTestWebModal';
import { TutOTopicExplainerWebModal } from '@/components/teacho/TutOTopicExplainerWebModal';
import { TutODayCoursePlayerWebModal } from '@/components/teacho/TutODayCoursePlayerWebModal';

export default function TutOWebPage() {
  // Global State
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  
  // Course State
  const [selectedCourse, setSelectedCourse] = useState<CourseOption>(DEFAULT_COURSE);
  const [selectedBoard, setSelectedBoard] = useState<SchoolBoard>('TNSB');

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
      }

      setSelectedCourse(course);
      setSelectedBoard(board);

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

  const handleOpenDay = (dayNum: number) => {
    setPlayerDayNumber(dayNum);
    setIsCoursePlayerOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      
      {/* Header Panel */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 relative w-full md:w-auto">
          <div className="p-4 bg-indigo-100 text-indigo-600 rounded-2xl">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-black text-gray-900 cursor-pointer flex items-center gap-2" onClick={() => setIsCourseDropdownOpen(!isCourseDropdownOpen)}>
              {selectedCourse.title} <ChevronDown className="w-5 h-5 text-gray-400" />
            </h1>
            <p className="text-sm font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full inline-block mt-1">
              Board: {selectedBoard}
            </p>
          </div>
          
          {/* Dropdown for Course Selection */}
          {isCourseDropdownOpen && (
            <div className="absolute top-16 left-0 w-72 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                {ALL_COURSES.map(c => (
                  <button 
                    key={c.id} 
                    className="w-full text-left px-4 py-3 hover:bg-indigo-50 border-b border-gray-50 flex items-center gap-3"
                    onClick={() => handleSelectCourse(c)}
                  >
                    <BookOpen className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-bold text-gray-800">{c.title}</p>
                      <p className="text-xs text-gray-500">{c.target_exam}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <button 
            onClick={() => {
              setExplainerDayNumber(1);
              setIsExplainerModalOpen(true);
            }}
            className="flex-1 md:flex-none px-4 py-3 bg-white hover:bg-indigo-50/80 text-indigo-700 border border-indigo-200 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm hover:shadow hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <span>Daily Explainer</span>
            <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
              Notes
            </span>
          </button>

          <button 
            onClick={() => setIsOnlineTestModalOpen(true)}
            className="flex-1 md:flex-none px-6 py-3 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl font-bold flex items-center justify-center gap-2.5 shadow-md shadow-indigo-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Zap className="w-5 h-5 fill-current text-amber-300" />
            <span>Online Test</span>
            <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
              30K+ MCQs
            </span>
          </button>
        </div>
      </div>

      {/* Curriculum Grid */}
      <div>
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">Study Plan</h2>
            <p className="text-gray-500 font-medium">Daily interactive missions for your syllabus.</p>
          </div>
          <div className="text-right">
            <span className="bg-indigo-100 text-indigo-800 text-sm font-bold px-3 py-1 rounded-full">
              {completedDays.size} / {adminReleasedDays.length} Days Completed
            </span>
          </div>
        </div>

        {isLoadingDays ? (
          <div className="text-center py-20 text-indigo-500 font-bold">Generating AI Curriculum...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {adminReleasedDays.map((day) => {
              const isDone = completedDays.has(day.dayNumber);
              const isLocked = day.dayNumber > maxUnlockedDay;
              return (
                <div 
                  key={day.dayNumber}
                  onClick={() => !isLocked && handleOpenDay(day.dayNumber)}
                  className={`border-2 rounded-2xl p-4 transition-transform flex flex-col justify-between ${
                    isLocked
                      ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                      : isDone 
                      ? 'border-green-200 bg-green-50/50 cursor-pointer hover:scale-[1.02]' 
                      : 'border-indigo-100 bg-white hover:border-indigo-300 shadow-sm cursor-pointer hover:scale-[1.02]'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${isDone ? 'bg-green-200 text-green-700' : 'bg-indigo-100 text-indigo-700'}`}>
                        D{day.dayNumber}
                      </div>
                      {isDone ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      ) : isLocked ? (
                        <Lock className="w-5 h-5 text-gray-400" />
                      ) : (
                        <div className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" /> ~45m
                        </div>
                      )}
                    </div>
                    
                    <h3 className="font-bold text-gray-900 mb-1">{day.title}</h3>
                    <p className="text-xs text-gray-500 font-medium line-clamp-2 mb-3">{day.description}</p>
                    {isLocked && (
                      <p className="text-xs text-orange-500 font-bold mb-2">🔒 Complete Day {day.dayNumber - 1} to unlock</p>
                    )}
                    
                    <div className="flex gap-2 mb-3">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-slate-100 text-slate-600 rounded">
                        {day.subjectLabel}
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-pink-50 text-pink-600 rounded">
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
                      className={`text-xs font-bold flex items-center gap-1 py-1 px-2 rounded-lg transition-colors ${
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

      {/* Modals */}
      {isOnboardingModalOpen && (
        <StudentOnboardingWebModal 
          isOpen={isOnboardingModalOpen}
          onClose={() => setIsOnboardingModalOpen(false)}
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
