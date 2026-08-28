'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  GraduationCap,
  Award,
  BookOpen,
  Layers,
  Sparkles,
  Flame,
  Zap,
  Clock,
  HelpCircle,
  Play,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Search,
  Filter,
  ShieldCheck,
  Languages,
  X,
  Bot,
  Brain,
  Video,
  FileText,
  Calendar,
  AlertCircle,
  HardDrive,
  Target,
} from 'lucide-react';
import { ALL_COURSES, DEFAULT_COURSE, CourseOption, SchoolBoard, SCHOOL_BOARDS } from '../../../data/coursesCatalog';
import { TeachOCoursePickerModal } from '../../../components/teacho/TeachOCoursePickerModal';
import { TeachOSyllabusViewerModal } from '../../../components/teacho/TeachOSyllabusViewerModal';
import { TeachONanoPlayerModal } from '../../../components/teacho/TeachONanoPlayerModal';
import { TaskVideoFeedbackWebModal } from '../../../components/teacho/TaskVideoFeedbackWebModal';
import { StudentOnboardingWebModal } from '../../../components/teacho/StudentOnboardingWebModal';
import { resolveNanoDayPlan, NanoDayPlan } from '../../../data/curriculum/dayPlanNanoEngine';

type TutOMode = 'STUDY' | 'TESTS' | 'AI_TUTOR';
type TestCategoryTab = 'ALL' | 'FULL_MOCKS' | 'CHAPTER_TESTS' | 'PYQ' | 'CURRENT_AFFAIRS';

export default function TutOWebPage() {
  const [activeMode, setActiveMode] = useState<TutOMode>('STUDY');
  const [selectedCourse, setSelectedCourse] = useState<CourseOption>(ALL_COURSES[0] || DEFAULT_COURSE);
  const [selectedBoard, setSelectedBoard] = useState<SchoolBoard>('TNSB');
  const [isCoursePickerModalOpen, setIsCoursePickerModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [isVideoFeedbackModalOpen, setIsVideoFeedbackModalOpen] = useState(false);
  const [videoFeedbackTopic, setVideoFeedbackTopic] = useState('Daily Curriculum Task');
  const [currentDay, setCurrentDay] = useState(1);
  const [streak, setStreak] = useState(5);
  const [xp, setXp] = useState(180);
  const [activeTestTab, setActiveTestTab] = useState<TestCategoryTab>('ALL');
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const [isPassProModalOpen, setIsPassProModalOpen] = useState(false);
  const [isSyllabusModalOpen, setIsSyllabusModalOpen] = useState(false);
  const [isNanoPlayerOpen, setIsNanoPlayerOpen] = useState(false);
  const [activeNanoTask, setActiveNanoTask] = useState<any>(null);
  const [isPassProSubscribed, setIsPassProSubscribed] = useState(false);

  // Check first-time student onboarding on mount
  useEffect(() => {
    const onboardingDone = localStorage.getItem('tuto_student_onboarding_completed');
    if (!onboardingDone) {
      setIsOnboardingModalOpen(true);
    }
    const savedCourseId = localStorage.getItem('tuto_active_course_id');
    if (savedCourseId) {
      const found = ALL_COURSES.find((c: CourseOption) => c.id === savedCourseId);
      if (found) setSelectedCourse(found);
      const savedBoard = localStorage.getItem(`tuto_selected_board_${savedCourseId}`);
      if (savedBoard) setSelectedBoard(savedBoard as SchoolBoard);
    }
  }, []);

  // Active CBT Exam Modal
  const [activeExam, setActiveExam] = useState<any | null>(null);
  const [examQIndex, setExamQIndex] = useState(0);
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({});
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [lang, setLang] = useState<'EN' | 'TA'>('EN');

  const fullMocks = [
    {
      id: `mock_1_${selectedCourse.id}`,
      title: `${selectedCourse.title} All-India Grand Mock Test 1`,
      badge: 'LIVE NTA CBT',
      questionsCount: selectedCourse.id.includes('neet') ? 180 : 100,
      timeMins: 180,
      totalMarks: 300,
      attemptsCount: '48.2k Attended',
      isFree: true,
    },
    {
      id: `mock_2_${selectedCourse.id}`,
      title: `${selectedCourse.title} State-Ranker Mega Mock 2`,
      badge: 'PASS PRO',
      questionsCount: selectedCourse.id.includes('neet') ? 180 : 100,
      timeMins: 180,
      totalMarks: 300,
      attemptsCount: '32.1k Attended',
      isFree: false,
    },
  ];

  const chapterTests = [
    {
      id: `chap_1_${selectedCourse.id}`,
      title: `General Science & Core Concepts Chapter 1`,
      badge: 'MICRO DRILL',
      questionsCount: 10,
      timeMins: 10,
      totalMarks: 40,
      attemptsCount: '24.1k Attended',
      isFree: true,
    },
    {
      id: `chap_2_${selectedCourse.id}`,
      title: `Quantitative Aptitude & Reasoning Chapter 2`,
      badge: 'MICRO DRILL',
      questionsCount: 10,
      timeMins: 10,
      totalMarks: 40,
      attemptsCount: '18.9k Attended',
      isFree: false,
    },
  ];

  const pyqTests = [
    {
      id: `pyq_2024_${selectedCourse.id}`,
      title: `${selectedCourse.title} Official Question Paper (2024 Session)`,
      badge: 'OFFICIAL PYQ',
      questionsCount: 100,
      timeMins: 180,
      totalMarks: 300,
      attemptsCount: '62.8k Attended',
      isFree: true,
    },
  ];

  const currentAffairs = [
    {
      id: `ca_daily_${selectedCourse.id}`,
      title: 'Daily Current Affairs & Tamil Nadu Govt Schemes (நடப்பு நிகழ்வுகள்)',
      badge: 'DAILY GK',
      questionsCount: 15,
      timeMins: 10,
      totalMarks: 15,
      attemptsCount: '78.9k Today',
      isFree: true,
    },
  ];

  const sampleExamQuestions = [
    {
      question: "In thermodynamics, which law establishes that energy cannot be created or destroyed, only transformed?",
      questionTa: "வெப்ப இயக்கவியலில், ஆற்றலை உருவாக்கவோ அழிக்கவோ முடியாது, மாற்ற மட்டுமே முடியும் என்பதை எந்த விதி நிறுவுகிறது?",
      options: ["First Law of Thermodynamics", "Second Law of Thermodynamics", "Zeroth Law of Thermodynamics", "Third Law of Thermodynamics"],
      optionsTa: ["வெப்ப இயக்கவியலின் முதல் விதி", "இரண்டாம் விதி", "சுழி விதி", "மூன்றாம் விதி"],
      correct: 0,
      topic: "Thermodynamics & Energy Conservation",
      subject: "Physics"
    },
    {
      question: "Which Indian state possesses the longest mainland coastline?",
      questionTa: "இந்தியாவின் முக்கிய நிலப்பரப்பில் மிக நீண்ட கடற்கரையைக் கொண்டுள்ள மாநிலம் எது?",
      options: ["Tamil Nadu", "Gujarat", "Andhra Pradesh", "Maharashtra"],
      optionsTa: ["தமிழ்நாடு", "குஜராத்", "ஆந்திரப் பிரதேசம்", "மகாராஷ்டிரா"],
      correct: 1,
      topic: "Physical Geography of India",
      subject: "Social Science"
    },
    {
      question: "Solve: If 3x + 5 = 20, what is the value of 2x^2 + 3?",
      questionTa: "தீர்வு காண்க: 3x + 5 = 20 எனில், 2x^2 + 3 இன் மதிப்பு என்ன?",
      options: ["53", "47", "50", "25"],
      optionsTa: ["53", "47", "50", "25"],
      correct: 0,
      topic: "Algebraic Equations",
      subject: "Mathematics"
    }
  ];

  return (
    <div className="min-h-screen bg-[#070C18] text-[#F8FAFC] p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* ─── 1. TOP HEADER & BRANDING ─── */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#0E172A] border border-[#1E293B] rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#00D084]/15 border border-[#00D084] flex items-center justify-center text-[#00D084]">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-white">TutO</h1>
                <span className="text-[10px] font-black uppercase tracking-wider bg-[#00D084] text-[#070C18] px-2 py-0.5 rounded-full">
                  SUPER LMS
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] font-medium">
                Unified TeachO (Learn & Notes) + TestO (CBT Mocks & PYQ) Platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#131F37] border border-[#F59E0B]/30 px-3 py-1.5 rounded-xl">
              <Flame className="w-4 h-4 text-[#F59E0B]" />
              <span className="text-xs font-bold text-[#F59E0B]">{streak} Days Streak</span>
              <span className="text-[10px] font-bold text-[#94A3B8]">({xp} XP)</span>
            </div>

            <button
              onClick={() => setIsPassProModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-[#00D084] to-[#059669] text-[#070C18] text-xs font-black px-4 py-2 rounded-xl shadow-lg hover:brightness-110 transition"
            >
              <Award className="w-4 h-4" />
              <span>{isPassProSubscribed ? 'Pass Pro Active' : 'TutO Pass Pro ₹199'}</span>
            </button>
          </div>
        </div>

        {/* 2. ACTIVE COURSE SELECTOR */}
        <div className="space-y-3">
          <button
            onClick={() => setIsCoursePickerModalOpen(true)}
            className="w-full flex items-center justify-between bg-[#0E172A] border border-[#1E293B] hover:border-[#00D084]/50 rounded-2xl p-4 md:p-5 transition text-left shadow-lg group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#00D084]/15 border border-[#00D084]/30 flex items-center justify-center text-[#00D084] group-hover:scale-105 transition">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#00D084]">
                    Active Target Curriculum & Exam
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-bold">
                    {selectedCourse.medium}
                  </span>
                </div>
                <div className="text-base md:text-lg font-bold text-white mt-0.5">{selectedCourse.title}</div>
                <div className="text-xs text-slate-400">{selectedCourse.subtitle}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOnboardingModalOpen(true);
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-sky-400 bg-sky-500/15 border border-sky-500/30 hover:bg-sky-500/25 px-3 py-2 rounded-xl transition"
              >
                <Target className="w-3.5 h-3.5" />
                <span>Goals & Class</span>
              </button>

              <div className="flex items-center gap-2 text-xs font-bold text-[#00D084] bg-[#1E293B] border border-[#334155] px-3.5 py-2 rounded-xl group-hover:bg-[#00D084]/10 transition">
                <span>Change Program ({ALL_COURSES.length})</span>
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </button>

          {/* K-12 Multi-Board Curriculum Switcher */}
          {(selectedCourse.category === 'school_k12' || selectedCourse.supportedBoards) && (
            <div className="bg-[#0b1120] border border-[#1E293B] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-sm">
                  🏛️
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                    Curriculum & Examination Board
                  </div>
                  <div className="text-xs text-slate-400 font-medium">
                    Single unified course • Switch board anytime • Bilingual
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto">
                {SCHOOL_BOARDS.map((b: any) => {
                  const isCurrent = selectedBoard === b.id;
                  return (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBoard(b.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                        isCurrent
                          ? 'bg-[#00D084] text-[#070C18] shadow-md font-extrabold'
                          : 'bg-[#131F37] text-slate-300 border border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span>{b.short}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 3. PRIMARY MODE SWITCHER */}
        <div className="flex items-center bg-[#0E172A] border border-[#1E293B] rounded-xl p-1.5 gap-2">
          <button
            onClick={() => setActiveMode('STUDY')}
            className={`flex-1 py-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition ${
              activeMode === 'STUDY'
                ? 'bg-[#00D084] text-[#070C18] shadow-md'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>🎓 Study & 200-Day Plan</span>
          </button>

          <button
            onClick={() => setActiveMode('TESTS')}
            className={`flex-1 py-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition ${
              activeMode === 'TESTS'
                ? 'bg-[#00D084] text-[#070C18] shadow-md'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>📝 Mock Tests & PYQ Series</span>
          </button>

          <button
            onClick={() => setActiveMode('AI_TUTOR')}
            className={`flex-1 py-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition ${
              activeMode === 'AI_TUTOR'
                ? 'bg-[#00D084] text-[#070C18] shadow-md'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>🤖 AI Doubt Tutor</span>
          </button>
        </div>

        {/* ─── 4. MAIN CONTENT AREA ─── */}
        {activeMode === 'STUDY' ? (
          /* STUDY MODE */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* 🛡️ Official Government Syllabus Card */}
              <div className="bg-[#0E172A] border border-[#1E293B] hover:border-[#00D084]/40 rounded-2xl p-5 space-y-4 shadow-lg transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Verified Government Syllabus</h3>
                      <p className="text-xs text-emerald-400 font-bold">100% Authentic Govt Notified Guidelines</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono ${
                    isPassProSubscribed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {isPassProSubscribed ? '100% Unlocked' : 'Free Preview'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Full official syllabus breakdown, subject weightage, chapter blueprints, formulas & model questions matching government gazetted norms.
                </p>
                <button
                  onClick={() => setIsSyllabusModalOpen(true)}
                  className="w-full py-2.5 bg-[#131F37] hover:bg-[#1E293B] border border-slate-800 hover:border-[#00D084] text-emerald-400 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>View Official Government Syllabus</span>
                </button>
              </div>
              {/* Day Hero Banner */}
              <div className="bg-gradient-to-br from-[#0E172A] to-[#131F37] border border-[#1E293B] rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-[#00D084] bg-[#00D084]/15 px-3 py-1 rounded-full border border-[#00D084]/30">
                    Day {currentDay} of 200
                  </span>
                  <span className="text-xs text-[#94A3B8] font-bold">
                    Target: {selectedCourse.title}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white">
                  Today's Core Syllabus Mastery Routine
                </h2>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  Complete your 5 daily micro-learning tasks: Concept notes reading, curated YouTube faculty lecture, brain stimulation, formulas & 10-minute speed test.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => setActiveMode('TESTS')}
                    className="flex items-center gap-2 bg-[#F59E0B] text-[#070C18] text-xs font-black px-4 py-2.5 rounded-xl shadow hover:brightness-110 transition"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Launch Day {currentDay} Assessment</span>
                  </button>

                  <button
                    onClick={() => {
                      setVideoFeedbackTopic(`Day ${currentDay} Core Concept Mastery`);
                      setIsVideoFeedbackModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-black px-4 py-2.5 rounded-xl shadow transition"
                  >
                    <Video className="w-4 h-4" />
                    <span>📹 Record Video Feedback (Google Drive)</span>
                  </button>
                </div>
              </div>

              {/* 6 Daily Tasks */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00D084]" />
                  <span>Structured Daily Micro-Tasks</span>
                </h3>

                {[
                  { step: 1, title: 'Concept Theory & Tamil Translation', type: 'concept', duration: '10 Mins' },
                  { step: 2, title: 'Faculty YouTube Master Class Lecture', type: 'video', duration: '15 Mins' },
                  { step: 3, title: 'Kids Yoga / Cognitive Focus Exercise', type: 'activity', duration: '5 Mins' },
                  { step: 4, title: 'Formulas, Mnemonics & 1-Line Q&A', type: 'notes', duration: '10 Mins' },
                  { step: 5, title: '10-Minute Topic CBT Practice Drill', type: 'test', duration: '10 Mins' },
                  { step: 6, title: '📹 Task Video Reflection (Google Drive Cloud Storage)', type: 'video_feedback', duration: '5 Mins' },
                ].map((task) => (
                  <div
                    key={task.step}
                    className="bg-[#0E172A] border border-[#1E293B] rounded-xl p-4 flex items-center justify-between hover:border-[#00D084]/40 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-[#1E293B] text-xs font-bold flex items-center justify-center text-[#00D084]">
                        {task.step}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-white">{task.title}</div>
                        <div className="text-[10px] text-[#94A3B8]">{task.duration} • Micro-Learning</div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (task.type === 'test') {
                          setActiveExam(sampleExamQuestions);
                        } else if (task.type === 'video_feedback') {
                          setVideoFeedbackTopic(`Day ${currentDay} Task ${task.step}`);
                          setIsVideoFeedbackModalOpen(true);
                        } else {
                          alert(`Opening ${task.title}`);
                        }
                      }}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                        task.type === 'video_feedback'
                          ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 font-black'
                          : 'bg-[#1E293B] hover:bg-[#00D084] hover:text-[#070C18] text-[#00D084]'
                      }`}
                    >
                      {task.type === 'video_feedback' ? 'Record Video' : 'Start Task'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar Syllabus Notes */}
            <div className="space-y-6">
              <div className="bg-[#0E172A] border border-[#1E293B] rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-[#00D084]">
                  <BookOpen className="w-5 h-5" />
                  <h3 className="text-sm font-bold text-white">Curriculum & Study Materials</h3>
                </div>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  Access 100% textbook-aligned syllabus notes, 2-mark short answers, 5-mark step solutions, and 10-mark essays.
                </p>
                <div className="space-y-2">
                  <div className="p-3 bg-[#131F37] rounded-xl border border-[#1E293B] text-xs font-bold text-[#CBD5E1]">
                    📚 Tamil Samacheer / NCERT Aligned
                  </div>
                  <div className="p-3 bg-[#131F37] rounded-xl border border-[#1E293B] text-xs font-bold text-[#CBD5E1]">
                    📝 2-Mark & 5-Mark Solved Step Solutions
                  </div>
                  <div className="p-3 bg-[#131F37] rounded-xl border border-[#1E293B] text-xs font-bold text-[#CBD5E1]">
                    ⚡ Formulas, Mnemonics & Speed Shortcuts
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeMode === 'TESTS' ? (
          /* TEST MODE */
          <div className="space-y-6">
            {/* Pass Pro Hero */}
            <div className="bg-gradient-to-r from-[#0E172A] via-[#131F37] to-[#0E172A] border border-[#00D084]/40 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-[#00D084] text-[#070C18] px-2.5 py-0.5 rounded-full">
                    TUTO PASS PRO
                  </span>
                  <span className="text-sm font-bold text-[#00D084]">₹199 / 12 Months</span>
                </div>
                <h3 className="text-lg font-bold text-white">Unlock 48,000+ Bilingual CBT Mock Tests & PYQs</h3>
                <p className="text-xs text-[#94A3B8]">
                  Full NTA/TCS iON examination simulation with Embibe 4-quadrant accuracy diagnostic scorecard.
                </p>
              </div>

              <button
                onClick={() => setIsPassProModalOpen(true)}
                className="px-6 py-2.5 bg-[#00D084] hover:bg-[#00B774] text-[#070C18] text-xs font-black rounded-xl transition shadow-lg shrink-0"
              >
                {isPassProSubscribed ? 'Manage Subscription' : 'Activate Pass Pro'}
              </button>
            </div>

            {/* Test Categories Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {[
                { id: 'ALL', label: '🌟 All Tests' },
                { id: 'FULL_MOCKS', label: '🎯 Full Mocks' },
                { id: 'CHAPTER_TESTS', label: '📑 Chapter Tests' },
                { id: 'PYQ', label: '🏛️ Solved PYQs' },
                { id: 'CURRENT_AFFAIRS', label: '⚡ Daily CA' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTestTab(tab.id as TestCategoryTab)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                    activeTestTab === tab.id
                      ? 'bg-[#00D084]/15 border border-[#00D084] text-[#00D084]'
                      : 'bg-[#0E172A] border border-[#1E293B] text-[#94A3B8] hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Test Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...fullMocks, ...chapterTests, ...pyqTests, ...currentAffairs].map((test) => (
                <div
                  key={test.id}
                  className="bg-[#0E172A] border border-[#1E293B] rounded-2xl p-5 space-y-4 hover:border-[#00D084]/40 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold bg-[#1E293B] text-[#00D084] px-2 py-0.5 rounded">
                      {test.badge}
                    </span>
                    <span className="text-[10px] text-[#94A3B8] font-bold">{test.attemptsCount}</span>
                  </div>

                  <h4 className="text-sm font-bold text-white line-clamp-1">{test.title}</h4>

                  <div className="flex items-center gap-4 text-[11px] text-[#94A3B8] font-semibold">
                    <span className="flex items-center gap-1">
                      <HelpCircle className="w-3 h-3 text-[#00D084]" /> {test.questionsCount} Qs
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#38BDF8]" /> {test.timeMins} Mins
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="w-3 h-3 text-[#F59E0B]" /> {test.totalMarks} Marks
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#1E293B]">
                    <span className="text-[10px] font-bold text-[#00D084] bg-[#00D084]/10 px-2 py-0.5 rounded">
                      {test.isFree || isPassProSubscribed ? 'FREE ACCESS' : 'PASS PRO ONLY'}
                    </span>

                    <button
                      onClick={() => setActiveExam(sampleExamQuestions)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#00D084] hover:bg-[#00B774] text-[#070C18] text-xs font-bold rounded-xl shadow transition"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Start Test</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* AI TUTOR MODE */
          <div className="bg-[#0E172A] border border-[#1E293B] rounded-2xl p-8 text-center space-y-4 max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#00D084]/15 border border-[#00D084] mx-auto flex items-center justify-center text-[#00D084]">
              <Bot className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Aishlee AI Educational Brain</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Ask any question in Tamil or English! Get instant step-by-step mathematical solutions, historical context, physics formulas, and voice explanations.
            </p>
            <button
              onClick={() => alert('Launching AI Assistant...')}
              className="px-6 py-2.5 bg-[#00D084] text-[#070C18] text-xs font-black rounded-xl shadow hover:brightness-110 transition"
            >
              Ask AI Doubt Tutor Now
            </button>
          </div>
        )}

      </div>

      {/* ─── 5. LIVE CBT EXAM MODAL ─── */}
      {activeExam && (
        <div className="fixed inset-0 z-50 bg-[#070C18]/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0E172A] border border-[#334155] rounded-2xl max-w-3xl w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-4">
              <div>
                <h3 className="text-base font-bold text-white">NTA CBT Examination Runner</h3>
                <span className="text-xs text-[#00D084] font-bold">
                  Question {examQIndex + 1} of {activeExam.length}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setLang(lang === 'EN' ? 'TA' : 'EN')}
                  className="px-3 py-1 bg-[#1E293B] border border-[#334155] text-xs font-bold text-[#00D084] rounded-lg"
                >
                  {lang === 'EN' ? '文A தமிழ்' : '文A English'}
                </button>
                <button
                  onClick={() => {
                    setActiveExam(null);
                    setExamQIndex(0);
                    setExamAnswers({});
                    setExamSubmitted(false);
                  }}
                  className="p-1 text-[#94A3B8] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Question Card */}
            <div className="space-y-4">
              {/* Dynamic Topic Header */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#00D084] bg-[#00D084]/15 px-2 py-0.5 rounded-lg flex items-center gap-1 border border-[#00D084]/30">
                  <Layers className="w-3 h-3" />
                  <span>Topic: {activeExam[examQIndex]?.topic}</span>
                </span>
                <span className="text-[10px] font-bold text-[#38BDF8] bg-[#38BDF8]/15 px-2 py-0.5 rounded-lg border border-[#38BDF8]/30">
                  {activeExam[examQIndex]?.subject}
                </span>
              </div>

              <p className="text-sm font-semibold text-white leading-relaxed">
                {lang === 'TA' ? activeExam[examQIndex]?.questionTa : activeExam[examQIndex]?.question}
              </p>

              <div className="space-y-2">
                {(lang === 'TA' ? activeExam[examQIndex]?.optionsTa : activeExam[examQIndex]?.options).map(
                  (opt: string, oIdx: number) => {
                    const isSelected = examAnswers[examQIndex] === oIdx;
                    return (
                      <button
                        key={oIdx}
                        onClick={() => setExamAnswers({ ...examAnswers, [examQIndex]: oIdx })}
                        className={`w-full p-3 rounded-xl text-left text-xs font-semibold border flex items-center gap-3 transition ${
                          isSelected
                            ? 'bg-[#00D084]/15 border-[#00D084] text-[#00D084]'
                            : 'bg-[#131F37] border-[#1E293B] text-[#CBD5E1] hover:border-[#334155]'
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-lg text-[10px] font-bold flex items-center justify-center ${
                          isSelected ? 'bg-[#00D084] text-[#070C18]' : 'bg-[#1E293B] text-[#94A3B8]'
                        }`}>
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span>{opt}</span>
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Navigation Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-[#1E293B]">
              <button
                onClick={() => setExamQIndex(Math.max(0, examQIndex - 1))}
                disabled={examQIndex === 0}
                className="px-4 py-2 bg-[#1E293B] disabled:opacity-30 text-xs font-bold rounded-xl"
              >
                Previous
              </button>

              {examQIndex < activeExam.length - 1 ? (
                <button
                  onClick={() => setExamQIndex(examQIndex + 1)}
                  className="px-5 py-2 bg-[#00D084] text-[#070C18] text-xs font-bold rounded-xl hover:bg-[#00B774]"
                >
                  Save & Next
                </button>
              ) : (
                <button
                  onClick={() => {
                    alert('Exam Submitted! Score: 100% Accuracy (Perfect Attempt)');
                    setActiveExam(null);
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-[#00D084] to-[#059669] text-[#070C18] text-xs font-black rounded-xl shadow-lg"
                >
                  Submit Final Test
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── 6. PASS PRO MODAL ─── */}
      {isPassProModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#070C18]/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0E172A] border border-[#334155] rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#00D084]">
                <Award className="w-6 h-6" />
                <h3 className="text-base font-bold text-white">TutO Pass Pro Master Access</h3>
              </div>
              <button onClick={() => setIsPassProModalOpen(false)} className="text-[#94A3B8] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#131F37] border border-[#00D084] rounded-xl p-5 space-y-3">
              <span className="text-[9px] font-black uppercase tracking-wider bg-[#00D084] text-[#070C18] px-2 py-0.5 rounded">
                BEST VALUE
              </span>
              <div className="text-lg font-bold text-white">1-Year Super Pass</div>
              <div className="text-2xl font-black text-[#00D084]">₹199 / 12 Months</div>
              <div className="space-y-1.5 text-xs text-[#CBD5E1]">
                <div>• 48,000+ Bilingual Mock Tests & PYQs</div>
                <div>• 200-Day Study Schedules for All 96+ Courses</div>
                <div>• Full Video Master Classes & Notes</div>
                <div>• Embibe 4-Quadrant Diagnostic Scorecard</div>
              </div>
            </div>

            <button
              onClick={() => {
                setIsPassProSubscribed(true);
                setIsPassProModalOpen(false);
                alert('🎉 Pass Pro Activated Successfully!');
              }}
              className="w-full py-3 bg-[#00D084] hover:bg-[#00B774] text-[#070C18] text-xs font-black rounded-xl shadow-lg transition"
            >
              Instant Unlock with UPI / QR (₹199)
            </button>
          </div>
        </div>
      )}
    
      {/* TeachO Master Course Picker Modal */}
      <TeachOCoursePickerModal
        isOpen={isCoursePickerModalOpen}
        onClose={() => setIsCoursePickerModalOpen(false)}
        selectedCourseId={selectedCourse.id}
        onSelectCourse={(course: CourseOption) => {
          setSelectedCourse(course);
          setIsCoursePickerModalOpen(false);
        }}
      />
      {/* TeachO Official Government Syllabus Viewer Modal */}
      <TeachOSyllabusViewerModal
        isOpen={isSyllabusModalOpen}
        courseId={selectedCourse.id}
        courseTitle={selectedCourse.title}
        board={selectedBoard}
        isPurchased={isPassProSubscribed}
        onClose={() => setIsSyllabusModalOpen(false)}
        onLaunchNanoPlayer={(concept: any, topic: any, subj: string, tab?: any) => {
          setIsSyllabusModalOpen(false);
          setActiveNanoTask({
            topicTitle: concept.name || topic.title,
            tamilTopicTitle: concept.tamilName || topic.tamilTitle,
            subject: subj,
            conceptCode: concept.conceptCode || topic.topicCode,
            keyFormulaOrRule: concept.keyRuleOrFormula || topic.keyFormula,
            taskNumber: 1,
            initialTab: tab || 'lecture',
          });
          setIsNanoPlayerOpen(true);
        }}
        onUnlockCourse={() => {
          setIsSyllabusModalOpen(false);
          setIsPassProModalOpen(true);
        }}
      />

      {/* Google Drive Task Video Recording & Feedback Web Modal */}
      <TaskVideoFeedbackWebModal
        isOpen={isVideoFeedbackModalOpen}
        onClose={() => setIsVideoFeedbackModalOpen(false)}
        courseId={selectedCourse.id}
        courseTitle={selectedCourse.title}
        dayNumber={currentDay}
        topicTitle={videoFeedbackTopic}
        onSubmitted={(earnedXp: number) => {
          setXp((prev) => prev + earnedXp);
        }}
      />

      {/* First-Time Student Onboarding & Career Personalization Web Modal */}
      <StudentOnboardingWebModal
        isOpen={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
        onComplete={(course: CourseOption, board: SchoolBoard, profile: any) => {
          setSelectedCourse(course);
          setSelectedBoard(board);
        }}
      />
    </div>
  );
}