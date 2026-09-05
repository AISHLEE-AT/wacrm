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
  X
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
  }
];

export const getInitialClassesFor5thStd = (ambitionId: string): DailyClassItem[] => {
  let ambitionClass7: DailyClassItem = {
    id: 7,
    type: 'ambition',
    title: 'JrIAS (Civil Servant): Indian Constitution, District Administration & Public Policy',
    subject: 'JrIAS (Civil Servant)',
    duration: '15 Min',
    xp: 30,
    icon: '🏛️'
  };
  let ambitionClass8: DailyClassItem = {
    id: 8,
    type: 'ambition',
    title: 'JrIAS (Civil Servant): District Collector Case Study & Citizen Welfare',
    subject: 'JrIAS (Civil Servant)',
    duration: '15 Min',
    xp: 30,
    icon: '🚀'
  };

  if (ambitionId === 'jr-ar' || ambitionId === 'auditor') {
    ambitionClass7 = {
      id: 7,
      type: 'ambition',
      title: 'JrAR (Auditor): Double-Entry Bookkeeping, Financial Statements & Balance Sheets',
      subject: 'JrAR (Auditor)',
      duration: '15 Min',
      xp: 30,
      icon: '📊'
    };
    ambitionClass8 = {
      id: 8,
      type: 'ambition',
      title: 'JrAR (Auditor): Auditing Standards, Fraud Forensics, GST & CA Foundation',
      subject: 'JrAR (Auditor)',
      duration: '15 Min',
      xp: 30,
      icon: '💼'
    };
  } else if (ambitionId === 'jr-dr' || ambitionId === 'doctor') {
    ambitionClass7 = {
      id: 7,
      type: 'ambition',
      title: 'JrDR (Doctor): Human Anatomy, Major Organ Systems & Clinical Diagnostics',
      subject: 'JrDR (Doctor)',
      duration: '15 Min',
      xp: 30,
      icon: '🩺'
    };
    ambitionClass8 = {
      id: 8,
      type: 'ambition',
      title: 'JrDR (Doctor): Emergency First Aid, Vital Signs (BP, Pulse) & NEET Bridge',
      subject: 'JrDR (Doctor)',
      duration: '15 Min',
      xp: 30,
      icon: '🫀'
    };
  }

  return [
    {
      id: 1,
      type: 'academic',
      title: '5th Std Mathematics: Factors, Multiples, Decimals & LCM/HCF (கணிதம்)',
      subject: 'Mathematics',
      duration: '20 Min',
      xp: 25,
      icon: '📐'
    },
    {
      id: 2,
      type: 'academic',
      title: '5th Std Science: States of Matter, Energy & Plant Life (அறிவியல்)',
      subject: 'Science',
      duration: '20 Min',
      xp: 25,
      icon: '🔬'
    },
    {
      id: 3,
      type: 'academic',
      title: '5th Std Social Science: Our Earth, Continents, Oceans & TN Heritage (சமூக அறிவியல்)',
      subject: 'Social Science',
      duration: '20 Min',
      xp: 25,
      icon: '🌍'
    },
    {
      id: 4,
      type: 'academic',
      title: '5th Std Languages: பருவம் 1 - தமிழின் இனிமை & English Grammar (Sentences & Conjunctions)',
      subject: 'Languages',
      duration: '20 Min',
      xp: 25,
      icon: '✍️'
    },
    {
      id: 5,
      type: 'homework',
      title: 'Class 5 Homework Assistant: Decimals, Science Sums & Book-Back Step-by-Step Solver',
      subject: 'Homework Assist',
      duration: '25 Min',
      xp: 35,
      icon: '📚'
    },
    {
      id: 6,
      type: 'homework',
      title: '5th Std Practice Workbook: Math LCM/HCF Worksheets & Grammar Drills',
      subject: 'Practice Sheet',
      duration: '20 Min',
      xp: 30,
      icon: '📝'
    },
    ambitionClass7,
    ambitionClass8,
    {
      id: 9,
      type: 'masterclass',
      title: '5th Std Visual Masterclass: 3D Animated Simulation of Solar System & States of Matter',
      subject: 'Video Masterclass',
      duration: '15 Min',
      xp: 25,
      icon: '🎥'
    },
    {
      id: 10,
      type: 'revision',
      title: '5th Std Bedtime Revision: Daily Formula Vault, Vocabulary Flashcards & 1-Min Recap',
      subject: 'Concept Notes',
      duration: '10 Min',
      xp: 20,
      icon: '🌙'
    }
  ];
};

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
  const [isLoading, setIsLoading] = useState(false);
  const [classes, setClasses] = useState<DailyClassItem[]>(() => getInitialClassesFor5thStd(activeAmbitionId));
  const [yoga, setYoga] = useState<DailyYogaItem | null>(null);
  const [dailyTest, setDailyTest] = useState<DailyTestConfig | null>(null);
  
  // Progress State
  const [completedClasses, setCompletedClasses] = useState<number[]>([]);
  const [yogaCompleted, setYogaCompleted] = useState<boolean>(false);
  const [testCompleted, setTestCompleted] = useState<boolean>(false);
  const [dailyXp, setDailyXp] = useState<number>(0);
  const [streak, setStreak] = useState<number>(1);
  const [totalXp, setTotalXp] = useState<number>(0);

  // Active Stage Accordion (default open all or first)
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

  // Homework Assistant State
  const [homeworkQuestion, setHomeworkQuestion] = useState('');
  const [isSolvingHomework, setIsSolvingHomework] = useState(false);
  const [homeworkSolution, setHomeworkSolution] = useState<any | null>(null);
  const [homeworkError, setHomeworkError] = useState<string | null>(null);
  const [geminiApiKey, setGeminiApiKey] = useState('');

  // Current Ambition
  const currentAmbition = AMBITION_FEATURE_TRACKS.find(c => c.id === activeAmbitionId) || AMBITION_FEATURE_TRACKS[0];

  const fetchPlanner = async () => {
    try {
      const res = await fetch(
        `https://mysupro.duckdns.org/api/tuto/planner/today?phone=${encodeURIComponent(userPhone)}&courseId=${encodeURIComponent(course.id)}&ambitionId=${encodeURIComponent(activeAmbitionId)}&dayNumber=${dayNumber}`
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
    setClasses(getInitialClassesFor5thStd(activeAmbitionId));
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

  // 4 Pedagogical Stages
  const stages = useMemo(() => [
    {
      id: 1,
      title: 'Stage 1: Morning Academic Core',
      subtitle: 'Core concept building & fundamentals (Classes 1 to 4)',
      icon: '🌅',
      color: 'from-blue-500/20 to-indigo-500/10 text-blue-500 border-blue-500/30',
      classes: classes.filter(c => c.id >= 1 && c.id <= 4)
    },
    {
      id: 2,
      title: 'Stage 2: Homework & Problem Solving',
      subtitle: 'Guided homework assistant & workbook practice (Classes 5 to 6)',
      icon: '🎒',
      color: 'from-amber-500/20 to-orange-500/10 text-amber-500 border-amber-500/30',
      classes: classes.filter(c => c.id >= 5 && c.id <= 6)
    },
    {
      id: 3,
      title: 'Stage 3: Futuristic Ambition Foundation',
      subtitle: `${currentAmbition.short} career leadership & applied case study (Classes 7 to 8)`,
      icon: '🚀',
      color: 'from-purple-500/20 to-pink-500/10 text-purple-500 border-purple-500/30',
      classes: classes.filter(c => c.id >= 7 && c.id <= 8)
    },
    {
      id: 4,
      title: 'Stage 4: Evening Masterclass & Revision',
      subtitle: 'Video visual simulation & 1-minute bedtime exam recap (Classes 9 to 10)',
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
        <p className="text-xs font-semibold text-muted-foreground">Preparing today&apos;s holistic study mission...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 1. HERO ACTIVE MISSION BANNER (Khan Academy / Duolingo Style) */}
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
                Day {dayNumber} of 300
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
                onClick={() => onOpenCoursePlayer(dayNumber)}
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
              <span>School Homework AI</span>
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
                            Selecting a track tailors Class 7 & Class 8 tasks exclusively for this dream profession.
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
                            onClick={() => onOpenExplainer(dayNumber, cls.title)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-primary hover:bg-primary/10 border border-primary/20 transition-all flex items-center gap-1"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Notes</span>
                          </button>
                          <button
                            onClick={() => onOpenCoursePlayer(dayNumber)}
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

      {/* 3. YOGA & WELLNESS MODAL DRAWER */}
      {isYogaDrawerOpen && yoga && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🧘</span>
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                    Daily Wellness Session
                  </span>
                  <h3 className="text-lg font-black text-foreground mt-0.5">
                    {yoga.name} {yoga.tamil && <span className="text-sm font-normal text-muted-foreground">· {yoga.tamil}</span>}
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

    </div>
  );
};
