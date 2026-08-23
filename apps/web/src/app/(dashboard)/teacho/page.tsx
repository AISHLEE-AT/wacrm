'use client';

// TeachO 86-Course Master Tuition Platform v3.2.2
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Sparkles,
  Award,
  GraduationCap,
  Zap,
  Layers,
  FileCheck2,
  PlayCircle,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Search,
  Flame,
  Star,
  Briefcase,
  FileText,
  MessageSquare,
  X,
  ExternalLink,
  Send,
  Printer,
  Download,
  Share2,
  Tv,
  Users,
  Compass,
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  Check,
  RotateCcw,
  Calendar,
  AlertCircle,
  HelpCircle,
  Laptop,
  Bot,
  ShoppingCart,
} from 'lucide-react';
import { ALL_COURSES, DEFAULT_COURSE, CourseOption, CourseCategory } from '@/data/coursesCatalog';
import { resolveMasterCurriculumPlan } from '@/data/curriculum';
import { resolveCompleteCourseSyllabus, getAugmentedCourseSyllabus } from '@/data/curriculum/courseSyllabusRegistry';
import { TeachOCoursePickerModal } from '@/components/teacho/TeachOCoursePickerModal';
import { TeachOCoursePlayerModal } from '@/components/teacho/TeachOCoursePlayerModal';
import { PaymentQRModal } from '@/components/PaymentQRModal';
import TeachOWhatsAppService from '@/lib/TeachOWhatsAppService';

export default function TeachODashboard() {
  // Active Course & Enrolled List
  const [activeCourse, setActiveCourse] = useState<CourseOption>(DEFAULT_COURSE);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([
    'tnsb-en-1',
    'cbse-10',
    'tnpsc-grp4',
    'skill-python',
  ]);

  // Payment Modal State
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isCoursePurchased, setIsCoursePurchased] = useState(false);

  // Daily Progression State
  const [courseDay, setCourseDay] = useState(1);
  const [courseStreak, setCourseStreak] = useState(7);
  const [courseXP, setCourseXP] = useState(380);
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'routine' | 'syllabus' | 'ai_tutor' | 'reports' | 'catalog'>('routine');

  // Modals State
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [activePlayerTask, setActivePlayerTask] = useState<{
    topicTitle: string;
    subject: string;
    courseTitle: string;
    courseId: string;
    dayNumber: number;
    taskNumber?: number;
  } | null>(null);

  // AI Chat Assistant State
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; time: string }>>([
    {
      role: 'assistant',
      text: '👋 Hello! I am your 24/7 TeachO AI Personal Tutor. Ask me any doubt about today\'s lessons, textbook formulas, or exam prep in English அல்லது தமிழில் கேட்கலாம்!',
      time: '9:00 AM',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Catalog Explorer Filter & Search
  const [exploreCategory, setExploreCategory] = useState<CourseCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Full Syllabus Explorer State
  const [syllabusSearch, setSyllabusSearch] = useState('');
  const [selectedSyllabusSubject, setSelectedSyllabusSubject] = useState<string>('all');
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});

  // Gemini AI Custom Syllabus Synthesizer State
  const [isSynthesizeModalOpen, setIsSynthesizeModalOpen] = useState(false);
  const [synthTopicTitle, setSynthTopicTitle] = useState('');
  const [synthSubjectName, setSynthSubjectName] = useState('');
  const [synthChapterTitle, setSynthChapterTitle] = useState('');
  const [synthKeyFormula, setSynthKeyFormula] = useState('');
  const [synthLoading, setSynthLoading] = useState(false);
  const [synthSuccessMsg, setSynthSuccessMsg] = useState('');
  const [augmentationCounter, setAugmentationCounter] = useState(0);

  // Resolve Full Micro-Granular Syllabus for Active Course
  const fullSyllabus = useMemo(() => {
    try {
      return getAugmentedCourseSyllabus(activeCourse?.id || 'tnsb-en-1', activeCourse?.title || 'Class 1 English');
    } catch (err) {
      console.warn('Error resolving full syllabus:', err);
      return {
        courseId: activeCourse?.id || 'tnsb-en-1',
        courseTitle: activeCourse?.title || 'Master Course',
        category: 'school_primary',
        board: 'TNSB',
        medium: 'English',
        totalDays: 200,
        totalSubjects: 4,
        totalChapters: 16,
        totalMicroTopics: 64,
        subjects: [],
      };
    }
  }, [activeCourse?.id, activeCourse?.title, augmentationCounter]);

  const handleSynthesizeNewTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!synthTopicTitle.trim()) return;

    setSynthLoading(true);
    setSynthSuccessMsg('');

    try {
      const targetSubject = synthSubjectName.trim() || fullSyllabus.subjects[0]?.subjectName || 'General Studies';
      const targetChapter = synthChapterTitle.trim() || `Unit ${fullSyllabus.totalChapters + 1}: Core Applications`;
      
      const newMicroTopic = {
        id: `custom_${Date.now()}`,
        topicTitle: synthTopicTitle.trim(),
        subtopic: `Government 2026 Curriculum Standard: ${synthTopicTitle.trim()}`,
        dayNumber: Math.min(courseDay, activeCourse.totalDays),
        periodNumber: 1,
        keyFormulaOrLaw: synthKeyFormula.trim() || `Core Rule: ${synthTopicTitle.trim()}`,
        keyPoints: [
          `Verified standard formulation for ${synthTopicTitle.trim()}`,
          `High-yield numerical and theoretical exam application`,
          `Daily practice and active recall mnemonic`
        ],
        type: 'solved_problem',
        importance: 'High-Yield'
      };

      const storageKey = `teacho_custom_syllabus_${activeCourse.id}`;
      const existingRaw = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      
      existing.push({
        subjectName: targetSubject,
        chapterTitle: targetChapter,
        chapterNumber: 1,
        microTopic: newMicroTopic
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, JSON.stringify(existing));
      }
      setAugmentationCounter(prev => prev + 1);
      setSynthSuccessMsg(`✓ Successfully synthesized "${synthTopicTitle.trim()}" and added to syllabus!`);
      
      setTimeout(() => {
        setSynthTopicTitle('');
        setSynthKeyFormula('');
        setSynthLoading(false);
        setIsSynthesizeModalOpen(false);
      }, 1000);
    } catch (err: any) {
      console.error('Error synthesizing topic:', err);
      setSynthLoading(false);
    }
  };

  const toggleChapter = (chapterKey: string) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterKey]: !prev[chapterKey]
    }));
  };

  // Resolve Daily Routine for Active Course & Day
  const dailyCurriculum = useMemo(() => {
    try {
      return resolveMasterCurriculumPlan(activeCourse || DEFAULT_COURSE, courseDay || 1) || {
        dayNumber: 1,
        day: 1,
        blockNumber: 1,
        phaseTitle: 'Phase 1: Foundation Building',
        themeTitle: 'Day 1: Concept Foundations & Daily Practice',
        totalDurationMins: 80,
        totalMinutes: 80,
        tasks: [],
        dailyRevision: 'Daily revision session.',
        dailyTestSummary: { questionCount: 4, testType: 'mcq' as const, focusArea: 'Day 1 Concept Mastery' },
      };
    } catch (err) {
      console.warn('Error resolving daily curriculum plan:', err);
      return {
        dayNumber: 1,
        day: 1,
        blockNumber: 1,
        phaseTitle: 'Phase 1: Foundation Building',
        themeTitle: 'Day 1: Concept Foundations & Daily Practice',
        totalDurationMins: 80,
        totalMinutes: 80,
        tasks: [],
        dailyRevision: 'Daily revision session.',
        dailyTestSummary: { questionCount: 4, testType: 'mcq' as const, focusArea: 'Day 1 Concept Mastery' },
      };
    }
  }, [activeCourse, courseDay]);

  // Load Saved Progress from LocalStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedCourseId = localStorage.getItem('teacho_active_course_id');
      if (savedCourseId) {
        const found = ALL_COURSES.find(c => c.id === savedCourseId);
        if (found) setActiveCourse(found);
      }
      const savedDay = localStorage.getItem('teacho_course_day');
      if (savedDay) {
        const parsed = parseInt(savedDay, 10);
        if (!isNaN(parsed) && parsed > 0) setCourseDay(parsed);
      }
      const savedXP = localStorage.getItem('teacho_course_xp');
      if (savedXP) {
        const parsed = parseInt(savedXP, 10);
        if (!isNaN(parsed)) setCourseXP(parsed);
      }
    } catch (e) {}
  }, []);

  const handleSelectCourse = (course: CourseOption) => {
    setActiveCourse(course);
    if (!enrolledCourseIds.includes(course.id)) {
      setEnrolledCourseIds(prev => [...prev, course.id]);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('teacho_active_course_id', course.id);
    }
  };

  const handleTaskComplete = (taskId: string, xpEarned: number = 20) => {
    setCompletedTaskIds(prev => new Set(prev).add(taskId));
    setCourseXP(prev => {
      const updated = prev + xpEarned;
      if (typeof window !== 'undefined') {
        localStorage.setItem('teacho_course_xp', updated.toString());
      }
      return updated;
    });
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || aiLoading) return;
    const userText = chatInput.trim();
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      role: 'user' as const,
      text: userText,
      time: currentTime,
    };
    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');
    setAiLoading(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userText,
          type: 'teacho_tutor',
          courseContext: activeCourse.title,
          day: courseDay,
        }),
      });

      const data = await res.json();
      if (data.result) {
        setChatMessages(prev => [
          ...prev,
          {
            role: 'assistant' as const,
            text: data.result,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        setChatMessages(prev => [
          ...prev,
          {
            role: 'assistant' as const,
            text: `Explanation for "${userText}":\n\n${data.error || 'Please check your connection and ask again.'}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err: any) {
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant' as const,
          text: `⚠️ Network error: Could not reach TeachO AI Tutor. Please try again in a moment.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  // Filtered Catalog
  const filteredCatalog = useMemo(() => {
    let list = ALL_COURSES;
    if (exploreCategory !== 'all') {
      list = list.filter(c => c.category === exploreCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(c => {
        const text = `${c.title} ${c.short} ${c.subtitle} ${c.board} ${c.gradeLevel} ${c.medium}`.toLowerCase();
        return text.includes(q);
      });
    }
    return list;
  }, [exploreCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans pb-16">
      
      {/* ─── 1. TOP HEADER BANNER ───────────────────────────────────────────── */}
      <header className="border-b border-slate-800/80 bg-[#0c1322]/90 backdrop-blur-md sticky top-0 z-30 px-4 md:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base md:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                TeachO <span className="text-emerald-400 font-medium text-xs md:text-sm">1-on-1 AI Tuition</span>
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                {ALL_COURSES.length} Master Programs
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Tamil Nadu State Board, CBSE NCERT, Matriculation, TNPSC, UPSC & Degrees
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 md:gap-4">
          {/* Active Course Badge & Change Button */}
          <button
            onClick={() => setIsPickerOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#111827] border border-slate-800 hover:border-emerald-500/50 transition group text-left"
          >
            <span className="text-xl">{activeCourse.icon}</span>
            <div className="hidden md:block">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">
                Current Program
              </span>
              <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition line-clamp-1 max-w-[160px]">
                {activeCourse.short}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition ml-1" />
          </button>

          {/* Top Course Purchase & Pricing Info */}
          {isCoursePurchased ? (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full Access Unlocked</span>
            </div>
          ) : (
            <button
              onClick={() => setIsPaymentOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition transform active:scale-95"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Unlock (₹499)</span>
            </button>
          )}

          {/* Streak Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold">
            <Flame className="w-4 h-4 fill-orange-400" />
            <span>{courseStreak} Days</span>
          </div>

          {/* XP Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
            <Award className="w-4 h-4" />
            <span>{courseXP} XP</span>
          </div>
        </div>
      </header>

      {/* ─── 2. HERO COURSE STATUS CARD ─────────────────────────────────────── */}
      <section className="px-4 md:px-8 pt-6 pb-2">
        <div className="bg-gradient-to-br from-[#0e172a] via-[#0b1120] to-[#070b14] border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-[10px] uppercase border border-emerald-500/30">
                  {activeCourse.badge}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {activeCourse.medium} Medium • {activeCourse.totalDays} Total Days
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                <span>{activeCourse.icon}</span>
                <span>{activeCourse.title}</span>
              </h2>
              <p className="text-xs md:text-sm text-slate-400 max-w-2xl leading-relaxed">
                {activeCourse.subtitle} — {activeCourse.phaseTitle || 'Active Phase Progression'}
              </p>
            </div>

            {/* Quick Day Navigator Controls */}
            <div className="flex items-center gap-3 bg-[#111827] border border-slate-800 p-3 rounded-2xl">
              <button
                disabled={courseDay <= 1}
                onClick={() => setCourseDay(prev => Math.max(1, prev - 1))}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-bold text-white transition"
              >
                ← Day {courseDay - 1}
              </button>
              <div className="text-center px-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Target Day
                </span>
                <span className="text-base font-black text-emerald-400 font-mono">
                  DAY {courseDay}
                </span>
              </div>
              <button
                disabled={courseDay >= activeCourse.totalDays}
                onClick={() => setCourseDay(prev => Math.min(activeCourse.totalDays, prev + 1))}
                className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-xs font-bold text-slate-950 transition"
              >
                Day {courseDay + 1} →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. NAVIGATION TABS BAR ─────────────────────────────────────────── */}
      <section className="px-4 md:px-8 pt-4">
        <div className="flex border-b border-slate-800/80 gap-2 overflow-x-auto scrollbar-none">
          {[
            { id: 'routine', label: '📅 Today\'s Daily Routine', count: dailyCurriculum.tasks.length },
            { id: 'catalog', label: `🎒 ${ALL_COURSES.length}-Course Catalog`, count: ALL_COURSES.length },
            { id: 'syllabus', label: '📚 Full Syllabus & Phases' },
            { id: 'ai_tutor', label: '🤖 24/7 AI Doubt Tutor' },
            { id: 'reports', label: '📊 Parent Progress Report' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-xs md:text-sm font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                    activeTab === tab.id ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* ─── 4. TAB CONTENTS ────────────────────────────────────────────────── */}
      <main className="px-4 md:px-8 pt-6 flex-1">
        
        {/* ================= TAB 1: TODAY'S ROUTINE ================= */}
        {activeTab === 'routine' && (
          <div className="space-y-6">
            
            {/* 👑 Course Master Access / Unlock Banner */}
            {isCoursePurchased ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Premium Access Active</h4>
                    <p className="text-xs text-slate-300">All {activeCourse.totalDays} days, test series & AI tutor unlocked.</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-500 text-slate-950 rounded-lg text-xs font-black">UNLOCKED 🔓</span>
              </div>
            ) : (
              <div className="p-4 bg-gradient-to-r from-amber-500/15 via-[#0e172a] to-emerald-500/15 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shrink-0">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">Unlock Full {activeCourse.totalDays}-Day Master Program</h4>
                      <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-black text-[10px] rounded">₹499</span>
                    </div>
                    <p className="text-xs text-slate-400">1-Tap Instant UPI Pay with GPay/PhonePe or apply coupon code. Unlocks all lessons & mock exams.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPaymentOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-black rounded-xl transition shadow-md shrink-0 flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" /> Unlock Course (₹499)
                </button>
              </div>
            )}

            {/* 📲 WhatsApp CRM Daily Study Alert Sync Bar */}
            <div className="p-4 bg-[#0c1322] border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white">WhatsApp CRM Daily Study Sync</h4>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 font-bold text-[9px] rounded-full border border-emerald-500/30">
                      Auto-Notify Active
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Send Day {courseDay} 4-step syllabus breakdown, AI doubt solver link & TestO quiz directly to student WhatsApp.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  TeachOWhatsAppService.sendDayPlanAlert({
                    studentPhone: '9486335870',
                    studentName: 'Learner',
                    courseTitle: activeCourse.title,
                    courseId: activeCourse.id,
                    currentDay: courseDay,
                    totalDays: activeCourse.totalDays,
                    tasks: dailyCurriculum.tasks,
                    streak: courseStreak,
                    xp: courseXP,
                  });
                }}
                className="px-3.5 py-2 bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] text-xs font-bold rounded-xl transition shrink-0 flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Dispatch Day {courseDay} Alert
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base md:text-lg font-bold text-white">
                  Day {courseDay} Learning Schedule ({dailyCurriculum.tasks.length} Modules)
                </h3>
                <p className="text-xs text-slate-400">
                  Target Duration: ~{dailyCurriculum.totalMinutes} Minutes • Complete tasks to earn Daily XP
                </p>
              </div>

              <button
                onClick={() => setIsPickerOpen(true)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <Layers className="w-4 h-4 text-emerald-400" /> Switch Course
              </button>
            </div>

            {/* Daily Tasks Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dailyCurriculum.tasks.map((task, idx) => {
                const isDone = completedTaskIds.has(task.id);

                return (
                  <div
                    key={task.id}
                    className={`bg-[#0c1322] border rounded-3xl p-5 flex flex-col justify-between transition ${
                      isDone ? 'border-emerald-500/50 bg-emerald-950/10' : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {task.rawSubject || 'Core Subject'}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-500" /> {task.duration}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 text-[10px] font-bold">
                            +20 XP
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 mb-2">
                        <span className="text-2xl mt-0.5">{task.icon || '📖'}</span>
                        <div>
                          <h4 className="text-sm md:text-base font-bold text-white leading-snug">
                            {task.title}
                          </h4>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                            {task.subtitle || task.rawTopic || 'Core concepts, interactive video explanation, flashcard revision & MCQs.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                      {/* Contextual Deep-Links: AI Doubt & TestO */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            const prompt = `I am studying "${task.rawSubject || activeCourse.title}" - Topic: "${task.rawTopic || task.title}" (Day ${courseDay}, Module #${idx + 1} of course "${activeCourse.title}"). Please explain this topic step-by-step with key concepts, rules/formulas, practical examples, and 3 high-yield exam tips in Tamil & English.`;
                            setChatInput(prompt);
                            setActiveTab('ai_tutor');
                          }}
                          className="px-2.5 py-1.5 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
                          title="Ask AI Doubt for this topic"
                        >
                          <Bot className="w-3.5 h-3.5 text-purple-400" /> Ask AI Doubt
                        </button>

                        <Link
                          href={`/testo?search=${encodeURIComponent(task.rawTopic || task.rawSubject || task.title)}`}
                          className="px-2.5 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
                          title="Practice Test for this heading"
                        >
                          <Award className="w-3.5 h-3.5 text-amber-400" /> Test Heading
                        </Link>
                      </div>
                      
                      <button
                        onClick={() => {
                          setActivePlayerTask({
                            topicTitle: task.title,
                            subject: task.rawSubject || 'Core Subject',
                            courseTitle: activeCourse.title,
                            courseId: activeCourse.id,
                            dayNumber: courseDay,
                            taskNumber: idx + 1,
                          });
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          isDone
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                        }`}
                      >
                        <PlayCircle className="w-4 h-4" />
                        {isDone ? 'Review Lesson' : 'Start Lesson & Video'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 2: 86-COURSE CATALOG EXPLORER ================= */}
        {activeTab === 'catalog' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base md:text-lg font-bold text-white">
                  {ALL_COURSES.length} Master Programs Catalog
                </h3>
                <p className="text-xs text-slate-400">
                  Select any course to immediately load its authentic syllabus and day plan
                </p>
              </div>

              {/* Search */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={`Search ${ALL_COURSES.length} courses by name, board, grade...`}
                  className="w-full pl-9 pr-4 py-2 bg-[#111827] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            {/* 10 Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {[
                { id: 'all', label: `All ${ALL_COURSES.length} Programs` },
                { id: 'school_tnsb_en', label: `🎒 TNSB English (${ALL_COURSES.filter(c => c.category === 'school_tnsb_en').length})` },
                { id: 'school_tnsb_ta', label: `🎒 TNSB தமிழ் வழி (${ALL_COURSES.filter(c => c.category === 'school_tnsb_ta').length})` },
                { id: 'school_cbse', label: `🎒 CBSE NCERT (${ALL_COURSES.filter(c => c.category === 'school_cbse').length})` },
                { id: 'school_matric', label: `🎒 Matriculation (${ALL_COURSES.filter(c => c.category === 'school_matric').length})` },
                { id: 'tnpsc', label: `🏛️ TNPSC (${ALL_COURSES.filter(c => c.category === 'tnpsc').length})` },
                { id: 'upsc_central', label: `🇮🇳 UPSC / Central (${ALL_COURSES.filter(c => c.category === 'upsc_central').length})` },
                { id: 'entrance', label: `🩺 Entrance (${ALL_COURSES.filter(c => c.category === 'entrance').length})` },
                { id: 'college_degree', label: `🎓 College (${ALL_COURSES.filter(c => c.category === 'college_degree').length})` },
                { id: 'skills', label: `💻 Skills (${ALL_COURSES.filter(c => c.category === 'skills').length})` },
                { id: 'kids_skills', label: `⭐ Kids (${ALL_COURSES.filter(c => c.category === 'kids_skills').length})` },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setExploreCategory(cat.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    exploreCategory === cat.id
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'bg-[#111827] text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCatalog.map(course => {
                const isCurrentActive = course.id === activeCourse.id;

                return (
                  <div
                    key={course.id}
                    className={`bg-[#0c1322] border rounded-3xl p-5 flex flex-col justify-between transition ${
                      isCurrentActive ? 'border-emerald-500 shadow-lg shadow-emerald-500/10' : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {course.badge}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium font-mono">
                          {course.totalDays} Days • {course.medium}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 mb-2">
                        <span className="text-2xl">{course.icon}</span>
                        <div>
                          <h4 className="text-sm md:text-base font-bold text-white line-clamp-1">{course.title}</h4>
                          <p className="text-[11px] text-slate-400 line-clamp-1">{course.subtitle}</p>
                        </div>
                      </div>

                      {/* Subject Preview */}
                      {course.subjects && course.subjects.length > 0 && (
                        <div className="space-y-1 my-3">
                          {course.subjects.slice(0, 2).map((s, idx) => (
                            <div key={idx} className="text-[11px] text-slate-300 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                              <span className="line-clamp-1">{typeof s === 'string' ? s : s.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-mono">ID: {course.id}</span>
                      <button
                        onClick={() => handleSelectCourse(course)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          isCurrentActive
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-800 hover:bg-slate-700 text-emerald-400'
                        }`}
                      >
                        {isCurrentActive ? '✓ Active Course' : 'Switch & Start'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 3: FULL SYLLABUS & PHASES ================= */}
        {activeTab === 'syllabus' && (
          <div className="space-y-6">
            {/* Header Hero Banner */}
            <div className="bg-[#0c1322] border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-xl text-xs font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {activeCourse.badge}
                    </span>
                    <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1.5 shadow-sm">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      2026 Govt-Notified Syllabus
                    </span>
                    <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-slate-800/80 text-slate-300 border border-slate-700">
                      {fullSyllabus.board} • {fullSyllabus.medium} Medium
                    </span>
                    <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                      {activeCourse.totalDays} Days Structured Blueprint
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-white flex items-center gap-3">
                    <span className="text-3xl">{activeCourse.icon}</span>
                    <span>{activeCourse.title}</span>
                  </h3>
                  <p className="text-xs md:text-sm text-slate-400 max-w-3xl leading-relaxed">
                    Official authentic government-notified curriculum mapped to micro-granular topics. Each micro-topic includes theoretical foundations, textbook formulas/laws, key exam points, and direct masterclass video lessons.
                  </p>
                </div>

                {/* Key Metrics Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#111827] border border-slate-800/80 p-4 rounded-2xl shrink-0">
                  <div className="text-center px-2">
                    <span className="text-xs text-slate-400 block font-medium">Subjects</span>
                    <span className="text-lg md:text-xl font-black text-emerald-400">{fullSyllabus.totalSubjects}</span>
                  </div>
                  <div className="text-center px-2 border-l border-slate-800">
                    <span className="text-xs text-slate-400 block font-medium">Chapters</span>
                    <span className="text-lg md:text-xl font-black text-cyan-400">{fullSyllabus.totalChapters}</span>
                  </div>
                  <div className="text-center px-2 border-l border-slate-800">
                    <span className="text-xs text-slate-400 block font-medium">Micro-Topics</span>
                    <span className="text-lg md:text-xl font-black text-amber-400">{fullSyllabus.totalMicroTopics}</span>
                  </div>
                  <div className="text-center px-2 border-l border-slate-800">
                    <span className="text-xs text-slate-400 block font-medium">Duration</span>
                    <span className="text-lg md:text-xl font-black text-purple-400">{activeCourse.totalDays}d</span>
                  </div>
                </div>
              </div>

              {/* Controls Bar: Search, Subject Filters & AI Synthesizer */}
              <div className="pt-4 border-t border-slate-800/80 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
                {/* Subject Selector Tabs */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedSyllabusSubject('all')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      selectedSyllabusSubject === 'all'
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <span>All Subjects</span>
                    <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-slate-950/40">
                      {fullSyllabus.totalSubjects}
                    </span>
                  </button>

                  {fullSyllabus.subjects.map(s => {
                    const isSelected = selectedSyllabusSubject === s.subjectId;
                    return (
                      <button
                        key={s.subjectId}
                        onClick={() => setSelectedSyllabusSubject(s.subjectId)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                            : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <span>{s.icon}</span>
                        <span className="line-clamp-1 max-w-[180px]">{s.subjectName.split('(')[0]}</span>
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-slate-950/40">
                          {s.totalMicroTopics}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Micro-Topic Search Input */}
                <div className="relative min-w-[240px] md:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={syllabusSearch}
                    onChange={e => setSyllabusSearch(e.target.value)}
                    placeholder="Search micro-topics, formulas, acts..."
                    className="w-full bg-[#111827] border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  {syllabusSearch && (
                    <button
                      onClick={() => setSyllabusSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Subject-Wise Deep Micro-Granular Syllabus Tree */}
            <div className="space-y-6">
              {fullSyllabus.subjects
                .filter(s => selectedSyllabusSubject === 'all' || s.subjectId === selectedSyllabusSubject)
                .map(subject => {
                  const query = syllabusSearch.toLowerCase().trim();

                  // Filter chapters based on search query
                  const filteredChapters = subject.chapters
                    .map(chap => {
                      const matchedTopics = chap.microTopics.filter(t => {
                        if (!query) return true;
                        return (
                          t.topicTitle.toLowerCase().includes(query) ||
                          t.subtopic.toLowerCase().includes(query) ||
                          t.keyFormulaOrLaw.toLowerCase().includes(query) ||
                          t.keyPoints.some(kp => kp.toLowerCase().includes(query))
                        );
                      });
                      return { ...chap, microTopics: matchedTopics };
                    })
                    .filter(chap => chap.microTopics.length > 0);

                  if (filteredChapters.length === 0) return null;

                  return (
                    <div
                      key={subject.subjectId}
                      className="bg-[#0c1322] border border-slate-800 rounded-3xl p-6 space-y-5 shadow-lg"
                    >
                      {/* Subject Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl p-2.5 rounded-2xl bg-[#111827] border border-slate-800">
                            {subject.icon}
                          </span>
                          <div>
                            <h4 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
                              <span>{subject.subjectName}</span>
                            </h4>
                            <p className="text-xs text-slate-400">
                              {subject.totalChapters} Core Chapters • {subject.totalMicroTopics} Micro-Topics mapped to Daily Routine
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            {subject.totalMicroTopics} Topics
                          </span>
                        </div>
                      </div>

                      {/* Chapters Accordion / List */}
                      <div className="space-y-4">
                        {filteredChapters.map(chapter => {
                          const chapterKey = `${subject.subjectId}_ch_${chapter.chapterNumber}`;
                          const isExpanded = expandedChapters[chapterKey] !== false; // Default expanded

                          return (
                            <div
                              key={chapter.chapterNumber}
                              className="bg-[#111827] border border-slate-800/90 rounded-2xl overflow-hidden transition"
                            >
                              {/* Chapter Header Toggle */}
                              <button
                                onClick={() => toggleChapter(chapterKey)}
                                className="w-full p-4 flex items-center justify-between gap-4 text-left hover:bg-slate-800/30 transition"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                                      Unit {chapter.chapterNumber}
                                    </span>
                                    <h5 className="text-sm md:text-base font-bold text-white line-clamp-1">
                                      {chapter.chapterTitle}
                                    </h5>
                                  </div>
                                  <p className="text-xs text-slate-400 line-clamp-1">{chapter.description}</p>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="text-xs text-slate-400 hidden sm:inline">
                                    {chapter.microTopics.length} Micro-Topics
                                  </span>
                                  <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
                                    {isExpanded ? (
                                      <ChevronDown className="w-4 h-4" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4" />
                                    )}
                                  </div>
                                </div>
                              </button>

                              {/* Micro-Topics Grid */}
                              {isExpanded && (
                                <div className="p-4 pt-0 border-t border-slate-800/60 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                                  {chapter.microTopics.map(topic => (
                                    <div
                                      key={topic.id}
                                      className="p-4 rounded-2xl bg-[#0b101b] border border-slate-800/80 hover:border-emerald-500/50 hover:bg-[#0e1626] transition flex flex-col justify-between space-y-3 group shadow-md"
                                    >
                                      <div className="space-y-2.5">
                                        <div className="flex items-center justify-between gap-2">
                                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-800 text-emerald-400 border border-slate-700/80">
                                            Day {topic.dayNumber || 1} · Period {topic.periodNumber || 1}
                                          </span>
                                          <span
                                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                              topic.importance === 'High-Yield'
                                                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                                : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                                            }`}
                                          >
                                            ★ {topic.importance || 'Core Concept'}
                                          </span>
                                        </div>

                                        {/* Clean Head Title */}
                                        <h6 className="text-sm font-bold text-white group-hover:text-emerald-300 transition line-clamp-2 leading-snug">
                                          {topic.topicTitle || topic.title}
                                        </h6>
                                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{topic.subtopic}</p>

                                        {/* Formula / Governing Rule Badge */}
                                        {topic.keyFormulaOrLaw && (
                                          <div className="p-2.5 rounded-xl bg-[#131d2e] border border-slate-800 text-[11px] font-mono text-cyan-300">
                                            <span className="text-[9px] text-slate-400 block font-sans font-bold uppercase tracking-wider mb-0.5">
                                              📐 Core Formula / Law:
                                            </span>
                                            <span className="line-clamp-2">{topic.keyFormulaOrLaw}</span>
                                          </div>
                                        )}

                                        {/* Key Exam Points */}
                                        {topic.keyPoints && topic.keyPoints.length > 0 && (
                                          <div className="space-y-1 pt-1">
                                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                                              🎯 Key Highlights:
                                            </span>
                                            {topic.keyPoints.slice(0, 2).map((kp, idx) => (
                                              <div key={idx} className="text-[11px] text-slate-300 flex items-start gap-1.5 line-clamp-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                                                <span className="line-clamp-1">{kp}</span>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>

                                      {/* Interactive Start Lesson & CBT Actions */}
                                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                                        <Link
                                          href={`/testo?search=${encodeURIComponent(topic.topicTitle || topic.title || '')}`}
                                          className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[11px] font-bold transition flex items-center gap-1 shrink-0"
                                          title="10-Q CBT Practice Test for this micro-topic"
                                        >
                                          <Award className="w-3.5 h-3.5 text-amber-400" />
                                          <span>10-Q CBT</span>
                                        </Link>

                                        <button
                                          onClick={() =>
                                            setActivePlayerTask({
                                              topicTitle: topic.topicTitle || topic.title || 'Micro-Topic',
                                              subject: subject.subjectName,
                                              courseTitle: activeCourse.title,
                                              courseId: activeCourse.id,
                                              dayNumber: topic.dayNumber || 1,
                                              taskNumber: topic.periodNumber || 1,
                                            })
                                          }
                                          className="flex-1 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10"
                                        >
                                          <PlayCircle className="w-3.5 h-3.5" />
                                          <span>Player ➔</span>
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ================= TAB 4: 24/7 AI TUTOR ================= */}
        {activeTab === 'ai_tutor' && (
          <div className="bg-[#0c1322] border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col h-[650px]">
            <div className="pb-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">AI Homework & Doubt Tutor</h3>
                  <p className="text-xs text-slate-400">24/7 Step-by-step solutions for {activeCourse.short}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                Online & Ready
              </span>
            </div>

            {/* Chat Scroll Container */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-xl rounded-2xl p-4 text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-emerald-500 text-slate-950 font-medium'
                        : 'bg-[#111827] border border-slate-800 text-slate-200'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span className={`block text-[10px] mt-2 ${msg.role === 'user' ? 'text-slate-800' : 'text-slate-500'}`}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 text-xs text-emerald-400 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                    <span>AI Tutor is thinking and generating step-by-step guidance...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="pt-3 flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                placeholder="Ask any question, math doubt, or concept in English / தமிழில்..."
                className="flex-1 bg-[#111827] border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
              <button
                onClick={handleSendChat}
                disabled={!chatInput.trim() || aiLoading}
                className="px-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-40"
              >
                <Send className="w-4 h-4" /> Send
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 5: REPORTS & PARENT GUIDANCE ================= */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-amber-950/30 via-[#0c1322] to-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                    Parental Companion & Progress Advisory
                  </span>
                  <h3 className="text-lg font-bold text-white">Parent Guidance Report for {activeCourse.title}</h3>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed bg-[#111827]/80 border border-slate-800 p-4 rounded-2xl">
                📌 <strong>Recommendation:</strong> Ensure daily ~{dailyCurriculum.totalMinutes} minutes of focused study. Review the interactive flashcard scores and Sunday mock tests.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-[#0c1322] border border-slate-800">
                <span className="text-[11px] text-slate-400 uppercase font-bold">Current Day</span>
                <h4 className="text-2xl font-black text-emerald-400 font-mono mt-1">Day {courseDay} / {activeCourse.totalDays}</h4>
              </div>
              <div className="p-5 rounded-2xl bg-[#0c1322] border border-slate-800">
                <span className="text-[11px] text-slate-400 uppercase font-bold">Current Streak</span>
                <h4 className="text-2xl font-black text-orange-400 font-mono mt-1">{courseStreak} Days Active</h4>
              </div>
              <div className="p-5 rounded-2xl bg-[#0c1322] border border-slate-800">
                <span className="text-[11px] text-slate-400 uppercase font-bold">Total XP Earned</span>
                <h4 className="text-2xl font-black text-amber-400 font-mono mt-1">{courseXP} XP</h4>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ─── 5. MODALS: COURSE PICKER & COURSE PLAYER ───────────────────────── */}
      <TeachOCoursePickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        selectedCourseId={activeCourse.id}
        onSelectCourse={handleSelectCourse}
      />

      {activePlayerTask && (
        <TeachOCoursePlayerModal
          isOpen={true}
          onClose={() => setActivePlayerTask(null)}
          topicTitle={activePlayerTask.topicTitle}
          subject={activePlayerTask.subject}
          courseTitle={activePlayerTask.courseTitle}
          courseId={activePlayerTask.courseId}
          dayNumber={activePlayerTask.dayNumber}
          taskNumber={activePlayerTask.taskNumber}
          onComplete={(xp) => {
            const taskId = `${activePlayerTask.courseId}_day_${activePlayerTask.dayNumber}_task_${activePlayerTask.taskNumber || 1}`;
            handleTaskComplete(taskId, xp);
          }}
        />
      )}

      {/* ─── 6. MODAL: PAYMENT QR & UNLOCK MODAL ────────────────────────────── */}
      <PaymentQRModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onSuccess={() => setIsCoursePurchased(true)}
        title={`${activeCourse.title} (Full ${activeCourse.totalDays} Days)`}
        amount={499}
        itemId={activeCourse.id}
        itemType="course"
        userId="web-user"
        userName="Learner"
        userPhone="9486335870"
        upiId="9486335870@hdfcbank"
        payeeName="AISHLEE TECHNOLOGY"
      />

    </div>
  );
}
