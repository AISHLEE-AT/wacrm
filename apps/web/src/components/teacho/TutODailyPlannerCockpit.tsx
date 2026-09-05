'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Circle,
  Play,
  Clock,
  Award,
  Zap,
  BookOpen,
  Heart,
  Brain,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Flame,
  Star,
  Compass,
  Send,
  Loader2,
  Key,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { CourseOption, SchoolBoard, FEATURED_JUNIOR_COURSES } from '@/data/coursesCatalog';

export interface DailyClassItem {
  id: number;
  type: 'academic' | 'homework' | 'ambition' | 'masterclass' | 'revision';
  title: string;
  subject: string;
  duration: string;
  xp: number;
  icon: string;
}

export interface DailyYogaItem {
  name: string;
  tamil?: string;
  sanskrit?: string;
  duration: string;
  benefits: string[];
  steps: string[];
  breathing: string;
  brainBooster: string;
}

export interface DailyTestConfig {
  testTitle: string;
  category: string;
  subject: string;
  questionCount: number;
  durationMinutes: number;
  passPercentage: number;
}

interface TutODailyPlannerCockpitProps {
  course: CourseOption;
  selectedBoard: SchoolBoard;
  activeAmbitionId: string;
  onSelectAmbition: (ambitionId: string) => void;
  dayNumber: number;
  onOpenExplainer: (dayNum: number, topicHint?: string) => void;
  onOpenTest: (category: string, subject: string) => void;
  onOpenCoursePlayer: (dayNum: number) => void;
  userPhone?: string;
}

export const TutODailyPlannerCockpit: React.FC<TutODailyPlannerCockpitProps> = ({
  course,
  selectedBoard,
  activeAmbitionId,
  onSelectAmbition,
  dayNumber,
  onOpenExplainer,
  onOpenTest,
  onOpenCoursePlayer,
  userPhone = 'anonymous'
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [classes, setClasses] = useState<DailyClassItem[]>([]);
  const [yoga, setYoga] = useState<DailyYogaItem | null>(null);
  const [dailyTest, setDailyTest] = useState<DailyTestConfig | null>(null);
  
  // Progress State
  const [completedClasses, setCompletedClasses] = useState<number[]>([]);
  const [yogaCompleted, setYogaCompleted] = useState<boolean>(false);
  const [testCompleted, setTestCompleted] = useState<boolean>(false);
  const [dailyXp, setDailyXp] = useState<number>(0);
  const [streak, setStreak] = useState<number>(1);
  const [totalXp, setTotalXp] = useState<number>(0);

  // Homework Assistant State
  const [homeworkQuestion, setHomeworkQuestion] = useState('');
  const [isSolvingHomework, setIsSolvingHomework] = useState(false);
  const [homeworkSolution, setHomeworkSolution] = useState<any | null>(null);
  const [homeworkError, setHomeworkError] = useState<string | null>(null);
  const [showHomeworkBox, setShowHomeworkBox] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);

  // Ambition info
  const currentAmbition = FEATURED_JUNIOR_COURSES.find(c => c.id === activeAmbitionId) || FEATURED_JUNIOR_COURSES[0];

  // Fetch today's planner from OCI
  const fetchPlanner = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `https://mysupro.duckdns.org/api/tuto/planner/today?phone=${encodeURIComponent(userPhone)}&courseId=${encodeURIComponent(course.id)}&ambitionId=${encodeURIComponent(activeAmbitionId)}&dayNumber=${dayNumber}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setClasses(data.classes || []);
          setYoga(data.yoga || null);
          setDailyTest(data.dailyTest || null);
          setCompletedClasses(data.progress?.completedClasses || []);
          setYogaCompleted(data.progress?.yogaCompleted || false);
          setTestCompleted(data.progress?.dailyTestCompleted || false);
          setDailyXp(data.progress?.dailyXpEarned || 0);
          setStreak(data.progress?.currentStreak || 1);
          setTotalXp(data.progress?.totalXp || 0);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch daily planner from OCI, using fallback:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanner();
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('gemini-api-key') || '';
      setGeminiApiKey(savedKey);
    }
  }, [course.id, activeAmbitionId, dayNumber, userPhone]);

  // Toggle class completion
  const handleToggleClass = async (classIndex: number, xp: number) => {
    const isDone = completedClasses.includes(classIndex);
    const newCompleted = !isDone;

    // Optimistic UI update
    setCompletedClasses(prev => newCompleted ? [...prev, classIndex] : prev.filter(c => c !== classIndex));
    setDailyXp(prev => newCompleted ? prev + xp : Math.max(0, prev - xp));
    setTotalXp(prev => newCompleted ? prev + xp : Math.max(0, prev - xp));

    try {
      await fetch('https://mysupro.duckdns.org/api/tuto/planner/task/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: userPhone,
          courseId: course.id,
          dayNumber,
          taskType: 'class',
          classIndex,
          completed: newCompleted,
          xp
        })
      });
    } catch (err) {
      console.warn('Failed to sync class toggle:', err);
    }
  };

  // Toggle yoga completion
  const handleToggleYoga = async () => {
    const newDone = !yogaCompleted;
    setYogaCompleted(newDone);
    setDailyXp(prev => newDone ? prev + 50 : Math.max(0, prev - 50));
    setTotalXp(prev => newDone ? prev + 50 : Math.max(0, prev - 50));

    try {
      await fetch('https://mysupro.duckdns.org/api/tuto/planner/task/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: userPhone,
          courseId: course.id,
          dayNumber,
          taskType: 'yoga',
          completed: newDone,
          xp: 50
        })
      });
    } catch (err) {
      console.warn('Failed to sync yoga completion:', err);
    }
  };

  // Solve homework question
  const handleSolveHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeworkQuestion.trim()) return;

    setIsSolvingHomework(true);
    setHomeworkError(null);
    setHomeworkSolution(null);

    try {
      const res = await fetch('https://mysupro.duckdns.org/api/tuto/homework/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: homeworkQuestion.trim(),
          grade: course.title,
          subject: 'School Homework',
          userApiKey: geminiApiKey.trim() || undefined
        })
      });

      const data = await res.json();
      if (data.success && data.solution) {
        setHomeworkSolution(data.solution);
      } else {
        setHomeworkError(data.error || 'Failed to solve homework question. Please verify your Gemini API key.');
      }
    } catch (err: any) {
      setHomeworkError(err.message || 'Error connecting to Homework Assistant');
    } finally {
      setIsSolvingHomework(false);
    }
  };

  const handleSaveApiKey = (key: string) => {
    setGeminiApiKey(key);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gemini-api-key', key.trim());
    }
    setShowKeyInput(false);
  };

  const progressPercent = Math.round(((completedClasses.length + (yogaCompleted ? 1 : 0) + (testCompleted ? 1 : 0)) / 12) * 100);

  return (
    <div className="space-y-6">
      
      {/* 1. Header Cockpit Ribbon */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 md:p-7 text-white shadow-xl border border-indigo-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {streak} Day Streak
              </span>
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-indigo-400 text-indigo-400" />
                {totalXp} XP Total
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs px-3 py-1 rounded-full font-bold">
                Day {dayNumber} of 300
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
              Today&apos;s Mission Cockpit
            </h2>
            <p className="text-indigo-200 text-sm mt-1">
              Holistic 10 Classes + 1 Yoga Session + 1 Daily Online Test.
            </p>
          </div>

          {/* Dual Ambition Selector Badge */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 flex items-center gap-4 w-full lg:w-auto">
            <div className="text-3xl">{currentAmbition.icon || '🏛️'}</div>
            <div className="flex-1">
              <p className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider">Futuristic Ambition</p>
              <div className="relative">
                <select
                  value={activeAmbitionId}
                  onChange={(e) => onSelectAmbition(e.target.value)}
                  className="bg-transparent text-white font-bold text-sm pr-6 cursor-pointer focus:outline-none appearance-none"
                >
                  {FEATURED_JUNIOR_COURSES.map(c => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                      {c.short}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-indigo-300 absolute right-0 top-0.5 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-2/3">
            <div className="flex justify-between text-xs font-bold text-indigo-200 mb-1.5">
              <span>Today&apos;s Protocol Completion</span>
              <span>{progressPercent}% Complete ({completedClasses.length}/10 Classes)</span>
            </div>
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-400 to-indigo-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHomeworkBox(!showHomeworkBox)}
              className="px-4 py-2 bg-indigo-600/50 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-indigo-400/30"
            >
              <HelpCircle className="w-4 h-4 text-amber-300" />
              <span>Homework AI Assistant</span>
            </button>

            <button
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-indigo-200 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
              title="Configure Gemini API Key"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{geminiApiKey ? 'API Key Set' : 'Add API Key'}</span>
            </button>
          </div>
        </div>

        {/* Gemini API Key Configuration Box */}
        {showKeyInput && (
          <div className="mt-4 p-4 bg-slate-800/90 rounded-xl border border-indigo-400/30 text-xs space-y-2">
            <p className="font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Custom Gemini API Key (For Instant AI Content & Homework Generation):
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="AIzaSy..."
                defaultValue={geminiApiKey}
                id="gemini-key-input"
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs focus:border-indigo-400 focus:outline-none"
              />
              <button
                onClick={() => {
                  const input = document.getElementById('gemini-key-input') as HTMLInputElement;
                  if (input) handleSaveApiKey(input.value);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold"
              >
                Save Key
              </button>
            </div>
            <p className="text-gray-400 text-[11px]">
              Keys are securely stored in your local browser storage and used for on-demand lesson fallback.
            </p>
          </div>
        )}
      </div>

      {/* 2. School Homework Assistant Interactive Widget */}
      {showHomeworkBox && (
        <div className="bg-white rounded-2xl p-5 border-2 border-indigo-100 shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                School Homework AI Problem Solver
              </h3>
              <p className="text-xs text-gray-500">
                Stuck on today&apos;s school homework? Type your question for step-by-step guidance.
              </p>
            </div>
            <span className="text-[10px] uppercase font-black px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded">
              Gemini Powered
            </span>
          </div>

          <form onSubmit={handleSolveHomework} className="space-y-3">
            <textarea
              rows={2}
              value={homeworkQuestion}
              onChange={(e) => setHomeworkQuestion(e.target.value)}
              placeholder="e.g. Find the roots of quadratic equation 2x² - 5x + 3 = 0, or Explain the function of stomata in photosynthesis..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:border-indigo-500 focus:outline-none"
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Step-by-step educational breakdown</span>
              <button
                type="submit"
                disabled={isSolvingHomework || !homeworkQuestion.trim()}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm"
              >
                {isSolvingHomework ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Problem...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Explain Homework Step-by-Step</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {homeworkError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              {homeworkError}
            </div>
          )}

          {homeworkSolution && (
            <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h4 className="font-bold text-indigo-900 text-sm">
                  {homeworkSolution.conceptTitle || 'Concept Breakdown'}
                </h4>
              </div>

              {homeworkSolution.hint && (
                <p className="p-2 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg italic">
                  💡 <strong>Guiding Hint:</strong> {homeworkSolution.hint}
                </p>
              )}

              {homeworkSolution.stepByStepSolution && (
                <div className="space-y-1.5 pl-1">
                  <p className="font-bold text-gray-700">Step-by-Step Solution:</p>
                  {homeworkSolution.stepByStepSolution.map((st: string, idx: number) => (
                    <p key={idx} className="text-gray-800 leading-relaxed font-mono">
                      {st}
                    </p>
                  ))}
                </div>
              )}

              {homeworkSolution.finalAnswer && (
                <div className="p-2.5 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg font-bold">
                  ✅ Final Result: {homeworkSolution.finalAnswer}
                </div>
              )}

              {homeworkSolution.tamilSummary && (
                <p className="text-gray-600 text-[11px] pt-1 border-t border-indigo-200/50">
                  🇮🇳 <strong>தமிழ் விளக்கம்:</strong> {homeworkSolution.tamilSummary}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. The 10 Daily Classes Grid */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-extrabold text-gray-900">
              10 Daily Structured Classes
            </h3>
            <p className="text-xs text-gray-500">
              Complete each class to earn XP and advance your syllabus mastery.
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            {completedClasses.length} / 10 Finished
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {classes.map((cls) => {
            const isDone = completedClasses.includes(cls.id);
            const isAmbition = cls.type === 'ambition';
            const isHomework = cls.type === 'homework';

            return (
              <div
                key={cls.id}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  isDone
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : isAmbition
                    ? 'bg-amber-50/30 border-amber-200/80 hover:border-amber-300'
                    : isHomework
                    ? 'bg-blue-50/30 border-blue-200/80 hover:border-blue-300'
                    : 'bg-white border-gray-200 hover:border-indigo-300'
                }`}
              >
                {/* Checkbox */}
                <button
                  type="button"
                  onClick={() => handleToggleClass(cls.id, cls.xp)}
                  className="mt-0.5 text-gray-400 hover:text-emerald-600 transition-colors"
                  title={isDone ? 'Mark Incomplete' : 'Mark Completed'}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 fill-emerald-500 text-white" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300 hover:text-gray-400" />
                  )}
                </button>

                {/* Class Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">{cls.icon}</span>
                    <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded tracking-wider ${
                      isAmbition
                        ? 'bg-amber-100 text-amber-800'
                        : isHomework
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      Class {cls.id} · {cls.subject}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold ml-auto flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {cls.duration}
                    </span>
                  </div>

                  <h4 className={`text-sm font-bold truncate ${isDone ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {cls.title}
                  </h4>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-gray-100">
                    <span className="text-[11px] font-bold text-amber-600 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" /> +{cls.xp} XP
                    </span>

                    <div className="flex gap-2">
                      <button
                        onClick={() => onOpenExplainer(dayNumber, cls.title)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 px-2 py-1 rounded hover:bg-indigo-50"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Study Notes</span>
                      </button>

                      <button
                        onClick={() => onOpenCoursePlayer(dayNumber)}
                        className="text-xs font-bold text-slate-700 hover:text-indigo-600 flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100"
                      >
                        <Play className="w-3 h-3" />
                        <span>Lesson</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Daily Yoga & Physical/Mental Wellness Class */}
      {yoga && (
        <div className={`rounded-3xl p-5 md:p-6 border-2 transition-all ${
          yogaCompleted
            ? 'bg-emerald-50/50 border-emerald-300'
            : 'bg-gradient-to-br from-emerald-50/70 via-teal-50/50 to-white border-emerald-200'
        }`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-emerald-200">
                🧘
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-black px-2 py-0.5 bg-emerald-200/60 text-emerald-900 rounded tracking-wider">
                    Daily Wellness Class
                  </span>
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {yoga.duration}
                  </span>
                </div>
                <h3 className="text-lg font-black text-gray-900 mt-0.5">
                  {yoga.name} {yoga.tamil && <span className="text-emerald-800 font-normal">· {yoga.tamil}</span>}
                </h3>
              </div>
            </div>

            <button
              onClick={handleToggleYoga}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm ${
                yogaCompleted
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
              }`}
            >
              {yogaCompleted ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Yoga Completed (+50 XP)</span>
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 text-emerald-600" />
                  <span>Mark Yoga Done (+50 XP)</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-700">
            {/* Step-by-Step Instructions */}
            <div className="bg-white/80 rounded-2xl p-4 border border-emerald-100 space-y-2">
              <h4 className="font-bold text-emerald-900 flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-emerald-600" /> Step-by-Step Posture Guide:
              </h4>
              <ul className="space-y-1.5 pl-1">
                {yoga.steps.map((st, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{st}</span>
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-emerald-800 pt-2 border-t border-emerald-100 font-medium">
                💨 <strong>Breathing:</strong> {yoga.breathing}
              </p>
            </div>

            {/* Benefits & Brain Booster */}
            <div className="space-y-3">
              <div className="bg-white/80 rounded-2xl p-4 border border-emerald-100 space-y-1.5">
                <h4 className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-emerald-600" /> Health & Exam Benefits:
                </h4>
                <ul className="space-y-1 pl-1">
                  {yoga.benefits.map((bf, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>{bf}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-r from-amber-100/60 to-amber-50 rounded-2xl p-4 border border-amber-200 text-amber-900">
                <h4 className="font-bold flex items-center gap-1.5 text-xs mb-1">
                  <Brain className="w-4 h-4 text-amber-600" /> Brain Booster of the Day:
                </h4>
                <p className="text-xs leading-relaxed">
                  {yoga.brainBooster}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Daily Online CBT Assessment Test Card */}
      {dailyTest && (
        <div className="bg-gradient-to-r from-indigo-900 via-violet-900 to-indigo-950 rounded-3xl p-5 md:p-6 text-white shadow-lg border border-indigo-400/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black px-2.5 py-0.5 bg-amber-400 text-slate-900 rounded-full">
                Daily Test Assessment
              </span>
              <span className="text-xs text-indigo-200 font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-300" /> {dailyTest.durationMinutes} Mins · 10 Questions
              </span>
            </div>
            <h3 className="text-xl font-black text-white">
              {dailyTest.testTitle}
            </h3>
            <p className="text-xs text-indigo-200">
              Drawn from OCI&apos;s 30,145 MCQs specifically matching today&apos;s syllabus topics.
            </p>
          </div>

          <button
            onClick={() => onOpenTest(dailyTest.category, dailyTest.subject)}
            className="w-full md:w-auto px-6 py-3.5 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black rounded-xl text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Zap className="w-5 h-5 fill-slate-950 text-slate-950" />
            <span>Launch Today&apos;s Online Test</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};
