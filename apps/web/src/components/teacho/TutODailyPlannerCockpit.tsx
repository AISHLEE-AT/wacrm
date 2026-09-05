'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  Flame,
  Star,
  Compass,
  Send,
  Loader2,
  Key,
  ShieldCheck,
  Sun,
  Moon,
  GraduationCap,
  Calendar,
  X,
  Camera
} from 'lucide-react';
import { CourseOption, SchoolBoard, FEATURED_JUNIOR_COURSES } from '@/data/coursesCatalog';
import { generateUniqueTenClassesForDay } from '@/data/curriculum/curriculum365Engine';
import { TutOBookPageScannerModal } from './TutOBookPageScannerModal';

export interface DailyClassItem {
  id: number;
  type: 'academic' | 'homework' | 'ambition' | 'masterclass' | 'revision';
  title: string;
  subject: string;
  duration: string;
  xp: number;
  icon: string;
  microTopic?: string;
  tamilTitle?: string;
  videoUrl?: string;
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
  onChangeDayNumber?: (newDay: number) => void;
  onOpenExplainer: (dayNum: number, topicHint?: string) => void;
  onOpenTest: (category: string, subject: string) => void;
  onOpenCoursePlayer: (dayNum: number) => void;
  userPhone?: string;
}

export const AMBITION_FEATURE_TRACKS = [
  {
    id: 'jr-ias',
    title: 'IAS (Civil Servant)',
    short: 'JrIAS',
    roleTag: 'District Collector & Polity',
    desc: 'Indian Constitution, Public Policy & District Administration',
    icon: '🏛️'
  },
  {
    id: 'jr-ar',
    title: 'Auditor (Chartered Accountant)',
    short: 'JrAuditor',
    roleTag: 'CA & Corporate Finance',
    desc: 'Double-Entry Bookkeeping, Financial Statements, GST & Auditing Standards',
    icon: '📊'
  },
  {
    id: 'jr-dr',
    title: 'Doctor (Medical Sciences)',
    short: 'JrDoctor',
    roleTag: 'Clinical Biology & NEET',
    desc: 'Human Anatomy, Major Organ Systems, First Aid & Clinical Diagnostics',
    icon: '🩺'
  },
  {
    id: 'jr-er',
    title: 'Engineer (Robotics & AI)',
    short: 'JrEngineer',
    roleTag: 'Coding, AI & Robotics',
    desc: 'Algorithms, Circuit Analysis, Embedded Robotics & Applied Physics',
    icon: '💻'
  },
  {
    id: 'jr-ips',
    title: 'Police (Law & Forensics)',
    short: 'JrIPS',
    roleTag: 'Criminology & Public Safety',
    desc: 'Forensics, Cyber Crime Investigation, Law & Tactical Leadership',
    icon: '👮'
  },
  {
    id: 'jr-ceo',
    title: 'CEO (Entrepreneur)',
    short: 'JrCEO',
    roleTag: 'Startup & Business Leader',
    desc: 'Venture Creation, Unit Economics, Marketing & Pitch Decks',
    icon: '🚀'
  },
  {
    id: 'jr-scientist',
    title: 'Scientist (ISRO / Space)',
    short: 'JrScientist',
    roleTag: 'Space Tech & Deep Physics',
    desc: 'Rocket Propulsion, Satellite Systems & Planetary Science',
    icon: '🔬'
  },
  {
    id: 'jr-judge',
    title: 'Judge (Judiciary & Law)',
    short: 'JrJudge',
    roleTag: 'Justice & Legal Master',
    desc: 'Constitutional Rights, Courtroom Ethics & Landmark Case Analysis',
    icon: '⚖️'
  }
];

export const getInitialClassesForGrade = (courseId: string, ambitionId: string, dayNum: number = 1): DailyClassItem[] => {
  const plan = generateUniqueTenClassesForDay(courseId, ambitionId, dayNum);
  return plan.classes as DailyClassItem[];
};


export const getInitialClassesFor5thStd = (ambitionId: string): DailyClassItem[] => {
  return getInitialClassesForGrade('school-std-5', ambitionId);
};

export const TutODailyPlannerCockpit: React.FC<TutODailyPlannerCockpitProps> = ({
  course,
  selectedBoard,
  activeAmbitionId,
  onSelectAmbition,
  dayNumber,
  onChangeDayNumber,
  onOpenExplainer,
  onOpenTest,
  onOpenCoursePlayer,
  userPhone = 'anonymous'
}) => {
  const [activeDay, setActiveDay] = useState<number>(dayNumber);

  useEffect(() => {
    setActiveDay(dayNumber);
  }, [dayNumber]);

  const handleDayChange = (newDay: number) => {
    const clamped = Math.max(1, Math.min(365, newDay));
    setActiveDay(clamped);
    if (onChangeDayNumber) {
      onChangeDayNumber(clamped);
    }
  };

  const [isLoading, setIsLoading] = useState(false);
  const [classes, setClasses] = useState<DailyClassItem[]>(() => getInitialClassesForGrade(course.id, activeAmbitionId, dayNumber));
  const [yoga, setYoga] = useState<DailyYogaItem | null>(null);
  const [dailyTest, setDailyTest] = useState<DailyTestConfig | null>(null);
  
  // Progress State
  const [completedClasses, setCompletedClasses] = useState<number[]>([]);
  const [yogaCompleted, setYogaCompleted] = useState<boolean>(false);
  const [testCompleted, setTestCompleted] = useState<boolean>(false);
  const [dailyXp, setDailyXp] = useState<number>(0);
  const [streak, setStreak] = useState<number>(1);
  const [totalXp, setTotalXp] = useState<number>(0);

  // Active Stage Accordion (default open all)
  const [expandedStages, setExpandedStages] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true
  });

  // Modal Drawers
  const [isYogaDrawerOpen, setIsYogaDrawerOpen] = useState(false);
  const [isHomeworkDrawerOpen, setIsHomeworkDrawerOpen] = useState(false);
  const [isKeyDrawerOpen, setIsKeyDrawerOpen] = useState(false);
  const [isBookScannerOpen, setIsBookScannerOpen] = useState(false);

  // Homework Assistant State
  const [homeworkQuestion, setHomeworkQuestion] = useState('');
  const [isSolvingHomework, setIsSolvingHomework] = useState(false);
  const [homeworkSolution, setHomeworkSolution] = useState<any | null>(null);
  const [homeworkError, setHomeworkError] = useState<string | null>(null);
  const [geminiApiKey, setGeminiApiKey] = useState('');

  // Module 1: Day Mission Submission States
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmittingMission, setIsSubmittingMission] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'none' | 'submitted' | 'approved'>('none');
  const [studentNotes, setStudentNotes] = useState('');
  const [submissionSuccessMsg, setSubmissionSuccessMsg] = useState<string | null>(null);

  // Module 2: Active Teacher Alert
  const [activeAlert, setActiveAlert] = useState<any | null>(null);

  // Current Ambition
  const currentAmbition = AMBITION_FEATURE_TRACKS.find(c => c.id === activeAmbitionId) || AMBITION_FEATURE_TRACKS[0];

  const checkSubmissionStatus = (targetDay: number = activeDay) => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`tuto_sub_status_${course.id}_day_${targetDay}`);
      if (saved === 'submitted' || saved === 'approved') {
        setSubmissionStatus(saved as any);
      } else {
        setSubmissionStatus('none');
      }
    }
  };

  const fetchStudentAlerts = async () => {
    try {
      const cleanPhone = (userPhone || (typeof window !== 'undefined' && localStorage.getItem('user-phone')) || '').replace(/\D/g, '').slice(-10);
      if (!cleanPhone) return;
      const res = await fetch(`https://mysupro.duckdns.org/api/tuto/student/alerts?phone=${encodeURIComponent(cleanPhone)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.alerts && data.alerts.length > 0) {
          setActiveAlert(data.alerts[0]);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch student alerts:', err);
    }
  };

  const handleDismissAlert = async () => {
    if (!activeAlert) return;
    try {
      if (activeAlert.bonus_xp > 0) {
        setTotalXp(prev => prev + activeAlert.bonus_xp);
        setDailyXp(prev => prev + activeAlert.bonus_xp);
      }
      await fetch('https://mysupro.duckdns.org/api/tuto/student/alerts/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId: activeAlert.id })
      });
      setActiveAlert(null);
    } catch (err) {
      setActiveAlert(null);
    }
  };

  const handleSubmitDayMission = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingMission(true);
    try {
      const studentName = (typeof window !== 'undefined' && localStorage.getItem('user-name')) || 'SuprO Scholar';
      const cleanPhone = (userPhone || (typeof window !== 'undefined' && localStorage.getItem('user-phone')) || '').replace(/\D/g, '').slice(-10);

      const res = await fetch('https://mysupro.duckdns.org/api/tuto/submissions/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName,
          studentPhone: cleanPhone || '9876543210',
          academicClass: course.id,
          ambitionId: activeAmbitionId,
          courseId: course.id,
          dayNumber: activeDay,
          classesCompleted: completedClasses.length,
          totalClasses: 10,
          yogaCompleted,
          testScore: testCompleted ? 100 : 0,
          xpEarned: dailyXp,
          studentNotes: studentNotes.trim(),
          homeworkUrl: ''
        })
      });

      if (res.ok) {
        setSubmissionStatus('submitted');
        if (typeof window !== 'undefined') {
          localStorage.setItem(`tuto_sub_status_${course.id}_day_${activeDay}`, 'submitted');
        }
        setIsSubmitModalOpen(false);
        setSubmissionSuccessMsg(`🎉 Mission Day ${activeDay} successfully submitted to your Teacher/Guide for review!`);
        setTimeout(() => setSubmissionSuccessMsg(null), 7000);
      } else {
        alert('Could not submit mission. Please try again.');
      }
    } catch (err: any) {
      alert('Error submitting mission: ' + err.message);
    } finally {
      setIsSubmittingMission(false);
    }
  };

  const fetchPlanner = async (targetDay: number = activeDay) => {
    try {
      const res = await fetch(
        `https://mysupro.duckdns.org/api/tuto/planner/today?phone=${encodeURIComponent(userPhone)}&courseId=${encodeURIComponent(course.id)}&ambitionId=${encodeURIComponent(activeAmbitionId)}&dayNumber=${targetDay}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (data.classes && data.classes.length > 0) {
            setClasses(data.classes);
          }
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
      console.warn('Failed to fetch daily planner:', e);
    }
  };

  useEffect(() => {
    setClasses(getInitialClassesForGrade(course.id, activeAmbitionId, activeDay));
    fetchPlanner(activeDay);
    fetchStudentAlerts();
    checkSubmissionStatus(activeDay);
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('gemini-api-key') || '';
      setGeminiApiKey(savedKey);
    }
  }, [course.id, activeAmbitionId, activeDay, userPhone]);

  // Toggle class completion
  const handleToggleClass = async (classIndex: number, xp: number) => {
    const isDone = completedClasses.includes(classIndex);
    const newCompleted = !isDone;

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
          dayNumber: activeDay,
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
          dayNumber: activeDay,
          taskType: 'yoga',
          completed: newDone,
          xp: 50
        })
      });
    } catch (err) {
      console.warn('Failed to sync yoga completion:', err);
    }
  };

  // Homework Solver
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
        setHomeworkError(data.error || 'Failed to solve homework. Please check your Gemini API key in settings.');
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
    setIsKeyDrawerOpen(false);
  };

  // 4 Structured Pedagogical Stages for 10 Classes
  const stages = useMemo(() => [
    {
      id: 1,
      title: 'Stage 1: Morning Academic & Language Core',
      subtitle: 'Maths, Science, Languages & Social Science (Classes 1 to 4)',
      icon: '🌅',
      color: 'from-blue-500/20 to-indigo-500/10 text-blue-500 border-blue-500/30',
      classes: classes.filter(c => c.id >= 1 && c.id <= 4)
    },
    {
      id: 2,
      title: 'Stage 2: Holistic Knowledge & Penmanship',
      subtitle: 'GK, Handwriting Practice & Creative Skills (Classes 5 to 7)',
      icon: '🧠',
      color: 'from-amber-500/20 to-orange-500/10 text-amber-500 border-amber-500/30',
      classes: classes.filter(c => c.id >= 5 && c.id <= 7)
    },
    {
      id: 3,
      title: 'Stage 3: Futuristic Career Track',
      subtitle: `${currentAmbition.short} Career Foundation & Leadership (Class 8)`,
      icon: '🚀',
      color: 'from-purple-500/20 to-pink-500/10 text-purple-500 border-purple-500/30',
      classes: classes.filter(c => c.id === 8)
    },
    {
      id: 4,
      title: 'Stage 4: Evening Masterclass & Bedtime Revision',
      subtitle: '3D Simulation & 1-minute memory consolidation (Classes 9 to 10)',
      icon: '🌙',
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-500 border-emerald-500/30',
      classes: classes.filter(c => c.id >= 9 && c.id <= 10)
    }
  ], [classes, currentAmbition.short]);

  // Find next uncompleted class
  const nextClass = useMemo(() => {
    return classes.find(c => !completedClasses.includes(c.id)) || classes[0];
  }, [classes, completedClasses]);

  const toggleStage = (id: number) => {
    setExpandedStages(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const progressPercent = Math.round((completedClasses.length / 10) * 100);

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-muted-foreground">Preparing today&apos;s holistic 365-day study mission...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* MODULE 2: CELEBRATORY TEACHER/GUIDE ALERT BANNER */}
      {activeAlert && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/25 via-yellow-500/20 to-emerald-500/25 border-2 border-amber-400 shadow-2xl animate-in fade-in duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg shrink-0">
              🎉
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[10px] uppercase">
                  Teacher Verified & Alerted
                </span>
                <span className="text-xs text-amber-200 font-bold">
                  {activeAlert.teacher_name || 'Academic Guide'}
                </span>
              </div>
              <h3 className="text-base font-black text-white">{activeAlert.title}</h3>
              <p className="text-xs text-amber-100/90 leading-relaxed font-medium italic">
                &ldquo;{activeAlert.message}&rdquo;
              </p>
              {activeAlert.bonus_xp > 0 && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs mt-1">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  <span>+{activeAlert.bonus_xp} Bonus XP Awarded!</span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleDismissAlert}
            className="w-full md:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition shrink-0"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Celebrate & Claim XP 🎉</span>
          </button>
        </div>
      )}

      {/* SUBMISSION SUCCESS TOAST */}
      {submissionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{submissionSuccessMsg}</span>
          </div>
          <button onClick={() => setSubmissionSuccessMsg(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 365-DAY INTERACTIVE TIMELINE & NAVIGATION BAR */}
      <div className="p-4 rounded-3xl bg-slate-900/95 border border-indigo-500/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Previous Day Button */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
          <button
            type="button"
            onClick={() => handleDayChange(activeDay - 1)}
            disabled={activeDay <= 1}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-white/10 text-white text-xs font-bold flex items-center gap-1.5 transition border border-white/10 cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev Day</span>
          </button>

          {/* Current Day & Term Header (Mobile) */}
          <div className="flex items-center gap-2 md:hidden">
            <span className="px-3 py-1 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-200 text-xs font-black">
              Day {activeDay} / 365
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleDayChange(activeDay + 1)}
            disabled={activeDay >= 365}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-white/10 text-white text-xs font-bold flex items-center gap-1.5 transition border border-white/10 md:hidden cursor-pointer disabled:cursor-not-allowed"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Term & Day Indicator & Jump Pills */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="hidden md:inline-flex px-3 py-1.5 rounded-xl bg-indigo-600/30 border border-indigo-500/50 text-indigo-100 text-xs font-black items-center gap-1.5 shadow-sm">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              Day {activeDay} of 365
            </span>
            <span className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold uppercase border ${
              activeDay <= 120 
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' 
                : activeDay <= 240 
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' 
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}>
              {activeDay <= 120 ? 'Term 1: Foundations' : activeDay <= 240 ? 'Term 2: Applied & Lab' : 'Term 3: Advanced Revision'}
            </span>
          </div>

          {/* Quick Jump Buttons */}
          <div className="flex items-center gap-1">
            {[1, 50, 100, 180, 250, 365].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => handleDayChange(d)}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  activeDay === d
                    ? 'bg-amber-400 text-slate-950 shadow-md font-black ring-1 ring-amber-300'
                    : 'bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white'
                }`}
              >
                D{d}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Direct Day Jump Selector + Next Day Button (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <span className="font-semibold text-[11px]">Jump to:</span>
            <input
              type="number"
              min={1}
              max={365}
              value={activeDay}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) handleDayChange(val);
              }}
              className="w-16 px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-center text-white text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </div>

          <button
            type="button"
            onClick={() => handleDayChange(activeDay + 1)}
            disabled={activeDay >= 365}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-white/10 text-white text-xs font-bold flex items-center gap-1.5 transition border border-white/10 cursor-pointer disabled:cursor-not-allowed"
          >
            <span>Next Day</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MODULE 1: DAY MISSION COMPLETION & SUBMISSION TO TEACHER / GUIDE */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xl">
            {submissionStatus === 'approved' ? '🎖️' : submissionStatus === 'submitted' ? '⏳' : '🚀'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Day {activeDay} Daily Mission</span>
              {submissionStatus === 'approved' ? (
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-black uppercase">
                  Approved & Commended
                </span>
              ) : submissionStatus === 'submitted' ? (
                <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-black uppercase">
                  Submitted — Under Review
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[10px] font-black uppercase">
                  Ready to Submit
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {completedClasses.length}/10 Classes Done • Test: {testCompleted ? 'Passed (100%)' : 'Pending'} • Yoga: {yogaCompleted ? 'Done' : 'Pending'} • Today: +{dailyXp} XP
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className={`w-full md:w-auto px-5 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-lg transition ${
            submissionStatus === 'approved'
              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
              : submissionStatus === 'submitted'
              ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
              : 'bg-[#00D084] hover:bg-[#00B774] text-slate-950'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>
            {submissionStatus === 'approved'
              ? `View Day ${activeDay} Teacher Review`
              : submissionStatus === 'submitted'
              ? `Update Day ${activeDay} Submission`
              : `Submit Day ${activeDay} Mission to Teacher / Guide`}
          </span>
        </button>
      </div>
      
      {/* 1. HERO ACTIVE MISSION BANNER (365 DAYS UNIFIED) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900/90 via-slate-900/95 to-slate-950 border border-indigo-500/30 p-6 md:p-8 shadow-2xl text-white">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {streak} Day Streak
              </span>
              <span className="bg-indigo-400/20 text-indigo-300 border border-indigo-400/30 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-indigo-400 text-indigo-400" />
                {totalXp} XP Total
              </span>
              <span className="bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-xs px-3 py-1 rounded-full font-bold">
                Day {activeDay} of 365
              </span>
            </div>

            {nextClass && (
              <>
                <p className="text-xs uppercase tracking-wider text-indigo-300 font-bold">
                  Up Next · Class {nextClass.id} of 10 ({nextClass.subject})
                </p>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                  {nextClass.title}
                </h2>
              </>
            )}

            <p className="text-xs text-slate-300">
              Complete today&apos;s 10 classes, daily yoga session, and online mock test to stay ahead in your syllabus.
            </p>

            {/* Quick Ambition Track Switcher */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-bold text-indigo-200">
                Career Track:
              </span>
              {AMBITION_FEATURE_TRACKS.map((trk) => {
                const isAct = activeAmbitionId === trk.id;
                return (
                  <button
                    key={trk.id}
                    type="button"
                    onClick={() => onSelectAmbition(trk.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isAct
                        ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300/50'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                    }`}
                  >
                    <span>{trk.icon}</span>
                    <span>{trk.short}</span>
                    {isAct && (
                      <span className="text-[9px] uppercase bg-black/20 px-1 py-0.2 rounded font-black">
                        Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary CTA + Progress Ring */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 w-full lg:w-auto">
            {nextClass && (
              <button
                onClick={() => onOpenCoursePlayer(activeDay)}
                className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-2xl text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Resume Lesson ({nextClass.duration})</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            <div className="text-xs text-indigo-200 font-medium">
              Daily Progress: <strong>{completedClasses.length} / 10 Classes</strong> ({progressPercent}%)
            </div>
          </div>
        </div>

        {/* Action Pills Bar */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsBookScannerOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all hover:scale-105"
            >
              <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
              <span>📸 AI Textbook Scanner</span>
            </button>

            <button
              onClick={() => setIsYogaDrawerOpen(true)}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-white/10"
            >
              <span>🧘</span>
              <span>Daily Yoga {yogaCompleted ? '✓' : ''}</span>
            </button>

            <button
              onClick={() => onOpenTest(dailyTest?.category || course.id, dailyTest?.subject || 'ALL')}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-white/10"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>Daily CBT Test (10 Qs)</span>
            </button>

            <button
              onClick={() => setIsHomeworkDrawerOpen(true)}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-white/10"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-300" />
              <span>Homework Q&A Solver</span>
            </button>
          </div>

          <button
            onClick={() => setIsKeyDrawerOpen(true)}
            className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1 font-semibold"
          >
            <Key className="w-3 h-3 text-amber-400" />
            <span>{geminiApiKey ? 'Gemini AI Ready' : 'Configure Gemini Key'}</span>
          </button>
        </div>
      </div>

      {/* AI BOOK SCANNER PROMINENT HERO CARD */}
      <div className="bg-gradient-to-r from-amber-500/10 via-card to-amber-500/5 border border-amber-500/30 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 shadow-inner">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm md:text-base font-black text-foreground">
                School Homework: AI Textbook Scanner & Personal Tutor
              </h3>
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-500 text-[10px] font-black uppercase rounded-full">
                AI Guided
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Photograph or upload your school textbook page to get step-by-step reading guidance, notebook answers, and 5 interactive MCQs.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsBookScannerOpen(true)}
          className="w-full md:w-auto px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-105 shrink-0"
        >
          <Sparkles className="w-4 h-4 fill-slate-950" />
          <span>Open AI Textbook Scanner</span>
        </button>
      </div>

      {/* 2. THE 4 STAGED DAILY PEDAGOGICAL BLOCKS */}
      <div className="space-y-4">
        {stages.map((stg) => {
          const isExpanded = expandedStages[stg.id] ?? true;
          const stageCompletedCount = stg.classes.filter(c => completedClasses.includes(c.id)).length;
          const isStageFinished = stageCompletedCount === stg.classes.length && stg.classes.length > 0;

          return (
            <div
              key={stg.id}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isStageFinished
                  ? 'bg-card border-emerald-500/30'
                  : 'bg-card border-border/80 shadow-sm hover:border-border'
              }`}
            >
              {/* Stage Header */}
              <div
                onClick={() => toggleStage(stg.id)}
                className="p-4 md:p-5 flex items-center justify-between cursor-pointer select-none gap-3 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="text-2xl shrink-0">{stg.icon}</div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-foreground truncate">
                        {stg.title}
                      </h3>
                      {isStageFinished && (
                        <span className="bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                          Completed
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{stg.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                    {stageCompletedCount} / {stg.classes.length} Done
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Stage Classes Accordion Content */}
              {isExpanded && (
                <div>
                  {stg.id === 3 && (
                    <div className="p-4 bg-muted/30 border-t border-border/60">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <div>
                          <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span>Select Your Feature-Restricted Career Track:</span>
                          </h4>
                          <p className="text-[11px] text-muted-foreground">
                            Selecting a track tailors Class 8 tasks exclusively for this dream profession.
                          </p>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-primary/10 text-primary rounded-md shrink-0 w-fit">
                          Exclusive Track Selection
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {AMBITION_FEATURE_TRACKS.map((track) => {
                          const isSelected = activeAmbitionId === track.id;
                          return (
                            <button
                              key={track.id}
                              type="button"
                              onClick={() => onSelectAmbition(track.id)}
                              className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between gap-2 ${
                                isSelected
                                  ? 'bg-card border-primary ring-2 ring-primary/20 shadow-md'
                                  : 'bg-card/50 border-border/70 hover:bg-card hover:border-border'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-xl shrink-0">{track.icon}</span>
                                  <div className="min-w-0">
                                    <h5 className="text-xs font-bold text-foreground truncate">{track.title}</h5>
                                    <span className="text-[10px] text-muted-foreground">{track.roleTag}</span>
                                  </div>
                                </div>
                                {isSelected ? (
                                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-primary text-primary-foreground shrink-0">
                                    Active
                                  </span>
                                ) : (
                                  <span className="text-[9px] text-muted-foreground hover:text-foreground font-semibold shrink-0">
                                    Select
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">
                                {track.desc}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="p-4 pt-0 border-t border-border/60 divide-y divide-border/40">
                    {stg.classes.map((cls) => {
                      const isDone = completedClasses.includes(cls.id);
                      return (
                        <div
                          key={cls.id}
                          className={`py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                            isDone ? 'opacity-70' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <button
                              type="button"
                              onClick={() => handleToggleClass(cls.id, cls.xp)}
                              className="mt-0.5 shrink-0 text-muted-foreground hover:text-primary transition-colors"
                              title={isDone ? 'Mark Incomplete' : 'Mark Completed'}
                            >
                              {isDone ? (
                                <CheckCircle2 className="w-5 h-5 fill-emerald-500 text-background" />
                              ) : (
                                <Circle className="w-5 h-5 text-muted-foreground/60 hover:text-muted-foreground" />
                              )}
                            </button>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                <span className="text-xs">{cls.icon}</span>
                                <span className="text-[10px] uppercase font-black tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                  Class {cls.id} · {cls.subject}
                                </span>
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {cls.duration}
                                </span>
                                <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1">
                                  <Award className="w-3 h-3" /> +{cls.xp} XP
                                </span>
                              </div>
                              <h4 className={`text-sm font-semibold truncate ${isDone ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                {cls.title}
                              </h4>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 pl-8 sm:pl-0 shrink-0">
                            <button
                              onClick={() => onOpenExplainer(activeDay, cls.title)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold text-primary hover:bg-primary/10 border border-primary/20 transition-all flex items-center gap-1"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>Notes</span>
                            </button>
                            <button
                              onClick={() => onOpenCoursePlayer(activeDay)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-muted hover:bg-muted/80 text-foreground transition-all flex items-center gap-1"
                            >
                              <Play className="w-3.5 h-3.5" />
                              <span>Lesson</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 3. YOGA MODAL DRAWER */}
      {isYogaDrawerOpen && yoga && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-500 flex items-center justify-center text-2xl shrink-0">
                  🧘
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-pink-500 bg-pink-500/10 px-2 py-0.5 rounded">
                    10-Min Wellness Practice
                  </span>
                  <h3 className="text-lg font-black text-foreground mt-0.5">
                    {yoga.name} {yoga.tamil ? `(${yoga.tamil})` : ''}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setIsYogaDrawerOpen(false)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-muted-foreground">
              <div className="p-3 rounded-2xl bg-muted/50 border border-border/50 space-y-2">
                <p className="font-bold text-foreground">Step-by-Step Instructions:</p>
                <ol className="space-y-1.5 pl-4 list-decimal">
                  {yoga.steps.map((st, i) => (
                    <li key={i}>{st}</li>
                  ))}
                </ol>
                <p className="text-[11px] text-primary pt-1 border-t border-border/50">
                  💨 <strong>Breathing:</strong> {yoga.breathing}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-foreground">
                <p className="font-bold text-amber-500 flex items-center gap-1.5 text-xs mb-1">
                  <Brain className="w-4 h-4" /> Brain Booster of the Day:
                </p>
                <p className="text-xs leading-relaxed">{yoga.brainBooster}</p>
              </div>
            </div>

            <button
              onClick={() => {
                handleToggleYoga();
                setIsYogaDrawerOpen(false);
              }}
              className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                yogaCompleted
                  ? 'bg-emerald-600 text-white'
                  : 'bg-primary text-primary-foreground hover:opacity-90'
              }`}
            >
              {yogaCompleted ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Yoga Completed (+50 XP)</span>
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4" />
                  <span>Mark Yoga Done (+50 XP)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 4. HOMEWORK ASSISTANT MODAL DRAWER */}
      {isHomeworkDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                  Gemini AI Powered
                </span>
                <h3 className="text-lg font-black text-foreground mt-0.5">
                  School Homework Problem Solver
                </h3>
                <p className="text-xs text-muted-foreground">
                  Type any question from today&apos;s school homework for step-by-step guidance.
                </p>
              </div>
              <button
                onClick={() => setIsHomeworkDrawerOpen(false)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSolveHomework} className="space-y-3">
              <textarea
                rows={3}
                value={homeworkQuestion}
                onChange={(e) => setHomeworkQuestion(e.target.value)}
                placeholder="e.g. Find roots of 2x² - 5x + 3 = 0, or Explain Newton's Third Law with example..."
                className="w-full px-4 py-3 bg-muted/60 border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:border-primary"
              />
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setIsKeyDrawerOpen(true)}
                  className="text-xs text-primary underline"
                >
                  {geminiApiKey ? 'API Key Configured' : 'Add Gemini API Key'}
                </button>
                <button
                  type="submit"
                  disabled={isSolvingHomework || !homeworkQuestion.trim()}
                  className="px-5 py-2.5 bg-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground rounded-xl font-bold text-xs flex items-center gap-2"
                >
                  {isSolvingHomework ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Explain Step-by-Step</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {homeworkError && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-xl text-xs text-destructive">
                {homeworkError}
              </div>
            )}

            {homeworkSolution && (
              <div className="p-4 bg-muted/70 border border-border rounded-2xl space-y-3 text-xs">
                <h4 className="font-bold text-foreground text-sm">
                  {homeworkSolution.conceptTitle || 'Concept Breakdown'}
                </h4>
                {homeworkSolution.hint && (
                  <p className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl italic">
                    💡 <strong>Hint:</strong> {homeworkSolution.hint}
                  </p>
                )}
                {homeworkSolution.stepByStepSolution && (
                  <div className="space-y-1.5 pl-1 text-muted-foreground">
                    <p className="font-bold text-foreground">Solution Steps:</p>
                    {homeworkSolution.stepByStepSolution.map((st: string, idx: number) => (
                      <p key={idx} className="font-mono text-foreground/90">{st}</p>
                    ))}
                  </div>
                )}
                {homeworkSolution.finalAnswer && (
                  <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 rounded-xl font-bold">
                    ✅ Result: {homeworkSolution.finalAnswer}
                  </div>
                )}
                {homeworkSolution.tamilSummary && (
                  <p className="text-muted-foreground text-[11px] pt-1 border-t border-border">
                    🇮🇳 <strong>தமிழ்:</strong> {homeworkSolution.tamilSummary}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. GEMINI API KEY MODAL DRAWER */}
      {isKeyDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2.5">
                <Key className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black text-foreground">
                  Gemini API Key Settings
                </h3>
              </div>
              <button
                onClick={() => setIsKeyDrawerOpen(false)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Provide your personal Gemini API key to enable on-demand study notes, flashcards, and homework problem solving whenever a topic is not yet in the official syllabus cache.
            </p>

            <div className="space-y-2">
              <input
                type="password"
                placeholder="AIzaSy..."
                defaultValue={geminiApiKey}
                id="gemini-key-input"
                className="w-full px-4 py-3 bg-muted/60 border border-border rounded-2xl text-sm font-mono text-foreground focus:outline-none focus:border-primary"
              />
              <button
                onClick={() => {
                  const input = document.getElementById('gemini-key-input') as HTMLInputElement;
                  if (input) handleSaveApiKey(input.value);
                }}
                className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl text-xs transition-opacity hover:opacity-90"
              >
                Save API Key
              </button>
            </div>

            <p className="text-[11px] text-muted-foreground/80 text-center">
              Your API key is securely stored in your local browser storage and never exposed publicly.
            </p>
          </div>
        </div>
      )}

      {/* 6. AI TEXTBOOK SCANNER & TUTOR MODAL */}
      {isBookScannerOpen && (
        <TutOBookPageScannerModal
          isOpen={isBookScannerOpen}
          onClose={() => setIsBookScannerOpen(false)}
          defaultGrade={course.title.includes('5') ? 'Class 5' : 'Class 10'}
          defaultSubject="Mathematics"
          onXpEarned={(earned) => {
            setDailyXp(prev => prev + earned);
            setTotalXp(prev => prev + earned);
          }}
        />
      )}

      {/* 7. DAY MISSION SUBMISSION MODAL (MODULE 1) */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-[#0b1120] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 text-white">
            <div className="flex justify-between items-start">
              <div>
                <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-[#00D084] font-black text-[10px] uppercase">
                  Module 1 • Student Submission
                </span>
                <h3 className="text-lg font-black text-white mt-1">
                  Submit Day {activeDay} Mission to Teacher
                </h3>
                <p className="text-xs text-slate-400">
                  Your academic guide will evaluate your daily progress and award remarks & bonus XP.
                </p>
              </div>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mission Performance Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 bg-[#0E172A] border border-slate-800 rounded-2xl text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Classes</span>
                <span className="text-base font-black text-white">{completedClasses.length}/10</span>
              </div>
              <div className="p-3 bg-[#0E172A] border border-slate-800 rounded-2xl text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Mock Test</span>
                <span className={`text-base font-black ${testCompleted ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {testCompleted ? '100%' : 'Pending'}
                </span>
              </div>
              <div className="p-3 bg-[#0E172A] border border-slate-800 rounded-2xl text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Yoga Session</span>
                <span className={`text-base font-black ${yogaCompleted ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {yogaCompleted ? 'Done' : 'Pending'}
                </span>
              </div>
              <div className="p-3 bg-[#0E172A] border border-slate-800 rounded-2xl text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Day XP</span>
                <span className="text-base font-black text-amber-400">+{dailyXp} XP</span>
              </div>
            </div>

            {/* Reflection Notes */}
            <form onSubmit={handleSubmitDayMission} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  Student Reflection Notes & Doubts for Teacher:
                </label>
                <textarea
                  rows={4}
                  value={studentNotes}
                  onChange={(e) => setStudentNotes(e.target.value)}
                  placeholder="e.g. Mastered today's math factors and phonics! Practiced 10 mins of cursive writing. Please check my formula sheet..."
                  className="w-full bg-[#0E172A] border border-slate-800 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-[11px] text-indigo-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>
                  Submitted to Lead Academic Guide for verification. You will receive an instant notification in your Cockpit and WhatsApp once reviewed!
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingMission}
                  className="px-6 py-2.5 bg-[#00D084] hover:bg-[#00B774] disabled:opacity-50 text-slate-950 rounded-xl text-xs font-black shadow-lg flex items-center gap-2 transition"
                >
                  {isSubmittingMission ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>🚀 Submit Mission to Teacher</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
