'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  FileCheck2,
  Sparkles,
  Award,
  GraduationCap,
  Zap,
  Layers,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronDown,
  Search,
  Timer,
  RotateCcw,
  BookOpen,
  Share2,
  X,
  Bot,
  MessageCircle,
  Calendar,
  Layers as LayersIcon,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { ALL_COURSES, CourseOption } from '@/data/coursesCatalog';
import { resolveMasterCurriculumPlan } from '@/data/curriculum';
import { getAugmentedCourseSyllabus } from '@/data/curriculum/courseSyllabusRegistry';
import { TeachOCoursePickerModal } from '@/components/teacho/TeachOCoursePickerModal';
import { lmsSupabase } from '@/lib/lms-supabase';

export default function TestoWebPage() {
  // Active Course & Picker
  const [activeCourse, setActiveCourse] = useState<CourseOption>(ALL_COURSES[0]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'day_plan' | 'syllabus'>('day_plan');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentDay, setCurrentDay] = useState(1);
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});

  // Live CBT Exam State
  const [activeTestTopic, setActiveTestTopic] = useState<{ topicTitle: string; subjectTitle: string } | null>(null);
  const [examQuestions, setExamQuestions] = useState<any[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 mins default
  const [isExamCompleted, setIsExamCompleted] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // 1. Read URL search params & storage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const courseId = params.get('courseId');
      const topic = params.get('topic');
      const subject = params.get('subject');
      const day = params.get('day');

      if (courseId) {
        const found = ALL_COURSES.find(c => c.id === courseId);
        if (found) setActiveCourse(found);
      } else {
        const saved = localStorage.getItem('teacho_active_course_id');
        if (saved) {
          const found = ALL_COURSES.find(c => c.id === saved);
          if (found) setActiveCourse(found);
        }
      }

      if (day) {
        const parsed = parseInt(day, 10);
        if (!isNaN(parsed) && parsed > 0) setCurrentDay(parsed);
      }

      if (topic) {
        launchCbtForTopic(topic, subject || activeCourse.title);
      }
    }
  }, []);

  // 2. Day Plan
  const activeDayPlan = useMemo(() => {
    try {
      return resolveMasterCurriculumPlan(activeCourse, currentDay);
    } catch (e) {
      return null;
    }
  }, [activeCourse, currentDay]);

  // 3. Full Syllabus
  const fullSyllabus = useMemo(() => {
    try {
      return getAugmentedCourseSyllabus(activeCourse.id, activeCourse.title);
    } catch (e) {
      return [];
    }
  }, [activeCourse.id, activeCourse.title]);

  // 4. Timer
  useEffect(() => {
    if (!activeTestTopic || isExamCompleted) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsExamCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTestTopic, isExamCompleted]);

  // 5. CBT Test Launch Handler
  const launchCbtForTopic = async (topicTitle: string, subjectTitle: string) => {
    setActiveTestTopic({ topicTitle, subjectTitle });
    setCurrentQIndex(0);
    setUserAnswers({});
    setTimeLeft(600);
    setIsExamCompleted(false);
    setLoadingQuestions(true);

    try {
      // Query Supabase for authentic questions
      const { data } = await lmsSupabase
        .from('kindle_content_cache')
        .select('content_json')
        .ilike('topic_title', `%${topicTitle}%`)
        .limit(1);

      let qs: any[] = [];
      if (data && data.length > 0 && data[0].content_json) {
        const parsed = typeof data[0].content_json === 'string' ? JSON.parse(data[0].content_json) : data[0].content_json;
        if (Array.isArray(parsed.mcqs) && parsed.mcqs.length > 0) {
          qs = parsed.mcqs.map((m: any) => ({
            question: m.question || 'Question',
            options: m.options || ['Option A', 'Option B', 'Option C', 'Option D'],
            correct: typeof m.correctAnswer === 'number' ? m.correctAnswer : 0,
            explanation: m.explanation || 'Refer to syllabus and standard textbook rules.',
          }));
        }
      }

      if (qs.length === 0) {
        qs = [
          {
            question: `In "${topicTitle}", what is the foundational governing principle or definition?`,
            options: [
              `A) Standard Primary Formulation for ${topicTitle}`,
              'B) Arbitrary Secondary Approximation',
              'C) Inverted Boundary Value',
              'D) Null Variance State',
            ],
            correct: 0,
            explanation: `Standard syllabus theorem defines ${topicTitle} according to core curriculum rules.`,
          },
          {
            question: `Which formula or rule is standard for problem solving in "${topicTitle}"?`,
            options: [
              'A) Unrelated Empirical Constant',
              `B) Verified Canonical Relationship for ${subjectTitle}`,
              'C) Random Linear Deviation',
              'D) Non-deterministic Parameter',
            ],
            correct: 1,
            explanation: 'Direct standard equation application ensures precise mathematical solutions.',
          },
          {
            question: `What is the most frequent high-yield exam pitfall in "${topicTitle}"?`,
            options: [
              'A) Ignoring sign conventions and standard units',
              'B) Writing step-by-step solutions',
              'C) Double-checking calculation bounds',
              'D) Following textbook definitions',
            ],
            correct: 0,
            explanation: 'Unit conversion and sign traps are the most common cause of negative marks.',
          },
          {
            question: `How is the principle of "${topicTitle}" applied in practical systems?`,
            options: [
              `A) Core real-world implementation in ${subjectTitle} frameworks`,
              'B) It has zero practical applicability',
              'C) Purely theoretical without models',
              'D) Only in non-physical simulations',
            ],
            correct: 0,
            explanation: 'Modern curricula emphasize real-world practical analogies and system modeling.',
          },
          {
            question: `To secure maximum score (Centum) in this section, what should a student prioritize?`,
            options: [
              'A) Speed drills, clear diagrams, and standard formula derivations',
              'B) Passive textbook skimming',
              'C) Leaving calculations unverified',
              'D) Ignoring model answer structures',
            ],
            correct: 0,
            explanation: 'Structured model answers and timed mock practice ensure 100% examination marks.',
          },
        ];
      }

      setExamQuestions(qs);
    } catch (e) {
      console.warn('Error loading questions:', e);
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Score Calculation
  const scoreStats = useMemo(() => {
    let correct = 0;
    let incorrect = 0;
    examQuestions.forEach((q, idx) => {
      const userAns = userAnswers[idx];
      if (userAns !== undefined) {
        if (userAns === q.correct) correct++;
        else incorrect++;
      }
    });
    const total = examQuestions.length;
    const answered = correct + incorrect;
    const accuracy = total > 0 ? Math.round((correct / (answered || 1)) * 100) : 0;
    const score = correct * 4 - incorrect * 1;
    const maxScore = total * 4;

    return { correct, incorrect, answered, total, accuracy, score, maxScore };
  }, [examQuestions, userAnswers]);

  // WhatsApp Teacher Contact
  const handleContactTeacherWhatsApp = () => {
    const adminPhone = '916381029380';
    const topic = activeTestTopic?.topicTitle || activeCourse.title;
    const msg = `Hello Teacher / SuprO Admin,\n\nI am practicing TestO examination for *${activeCourse.title}*.\n📌 Topic: *${topic}*\n📊 My Score: ${scoreStats.score} / ${scoreStats.maxScore} (${scoreStats.accuracy}% Accuracy)\n\nPlease provide expert tips and clarification for questions in this topic.\n\nThank you!`;
    const webLink = `https://wa.me/${adminPhone}?text=${encodeURIComponent(msg)}`;
    window.open(webLink, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#060a12] text-slate-100 font-sans pb-24">
      {/* ─── 1. TOP HEADER ───────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-[#090e1a]/95 backdrop-blur-md border-b border-slate-800 px-4 md:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/teacho"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1 text-xs font-bold"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">TeachO Notes</span>
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                <Award className="w-5 h-5 text-amber-400" />
                <span>TestO</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-[10px] font-bold">
                Online CBT Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Syllabus-Aligned Live Assessments & Nano-Node CBT Tests
            </p>
          </div>
        </div>

        {/* Active Course Badge & Change Button */}
        <button
          onClick={() => setIsPickerOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#111827] border border-slate-800 hover:border-amber-500/50 transition group text-left"
        >
          <span className="text-xl">{activeCourse.icon}</span>
          <div className="hidden md:block">
            <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
              Active Exam
            </span>
            <span className="text-xs font-bold text-white group-hover:text-amber-300 transition line-clamp-1 max-w-[160px]">
              {activeCourse.short}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition ml-1" />
        </button>
      </header>

      {/* ─── 2. LIVE CBT MODAL IF ACTIVE ─────────────────────────────────── */}
      {activeTestTopic && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-200">
          <div className="bg-[#0b1120] border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Top Bar */}
            <div className="p-4 md:p-5 bg-[#111827] border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  {activeTestTopic.subjectTitle} • Live Assessment
                </span>
                <h3 className="text-base md:text-lg font-black text-white">{activeTestTopic.topicTitle}</h3>
              </div>

              <div className="flex items-center gap-3">
                {!isExamCompleted && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                  </div>
                )}
                <button
                  onClick={() => setActiveTestTopic(null)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Loading vs Ongoing vs Completed */}
            <div className="flex-1 overflow-y-auto p-5 md:p-6">
              {loadingQuestions ? (
                <div className="py-20 text-center space-y-3">
                  <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-400">Loading authentic examination questions...</p>
                </div>
              ) : isExamCompleted ? (
                /* EXAM RESULT SCORECARD */
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-[#111827] via-[#0f172a] to-[#0b1120] border border-slate-800 text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                      <Award className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-white">Test Completed! 🎉</h4>
                      <p className="text-xs text-slate-400 mt-1">{activeTestTopic.topicTitle}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-2">
                      <div className="p-3.5 rounded-2xl bg-[#090d16] border border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Score</span>
                        <h5 className="text-xl font-black text-amber-400 mt-0.5">{scoreStats.score} / {scoreStats.maxScore}</h5>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-[#090d16] border border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Accuracy</span>
                        <h5 className="text-xl font-black text-emerald-400 mt-0.5">{scoreStats.accuracy}%</h5>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-[#090d16] border border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Correct</span>
                        <h5 className="text-xl font-black text-cyan-400 mt-0.5">{scoreStats.correct} / {scoreStats.total}</h5>
                      </div>
                    </div>

                    {/* Action Bar: TeachO Notes, WhatsApp Mentor, Retry */}
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                      <Link
                        href={`/teacho?courseId=${activeCourse.id}&topic=${encodeURIComponent(activeTestTopic.topicTitle)}`}
                        className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition"
                      >
                        <BookOpen className="w-4 h-4" />
                        Review Study Notes in TeachO
                      </Link>

                      <button
                        onClick={handleContactTeacherWhatsApp}
                        className="py-2.5 px-5 rounded-xl bg-[#1e293b] hover:bg-slate-700 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center gap-2 transition"
                      >
                        <MessageCircle className="w-4 h-4 text-emerald-400" />
                        Ask Teacher on WhatsApp
                      </button>

                      <button
                        onClick={() => launchCbtForTopic(activeTestTopic.topicTitle, activeTestTopic.subjectTitle)}
                        className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-2 transition"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Retake Test
                      </button>
                    </div>
                  </div>

                  {/* Question-by-Question Review */}
                  <div className="space-y-4">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Detailed Answer Key & Explanations</h5>
                    {examQuestions.map((q, idx) => {
                      const userAns = userAnswers[idx];
                      const isCorrect = userAns === q.correct;
                      return (
                        <div key={idx} className="p-4 rounded-2xl bg-[#090d16] border border-slate-800 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Question {idx + 1}</span>
                            {userAns !== undefined ? (
                              isCorrect ? (
                                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+4)
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1">
                                  <XCircle className="w-3.5 h-3.5" /> Incorrect (-1)
                                </span>
                              )
                            ) : (
                              <span className="text-[10px] font-bold text-slate-500">Skipped</span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-white">{q.question}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                            {q.options.map((opt: string, oIdx: number) => (
                              <div
                                key={oIdx}
                                className={`p-2.5 rounded-xl border ${
                                  oIdx === q.correct
                                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold'
                                    : oIdx === userAns
                                    ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                                    : 'bg-[#111827] border-slate-800 text-slate-400'
                                }`}
                              >
                                {opt}
                              </div>
                            ))}
                          </div>
                          <div className="p-3 rounded-xl bg-[#111827] border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                            <span className="font-bold text-amber-400">Explanation: </span>
                            {q.explanation}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* ONGOING CBT QUESTION VIEW */
                examQuestions[currentQIndex] && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Question {currentQIndex + 1} of {examQuestions.length}</span>
                      <span>Topic: {activeTestTopic.topicTitle}</span>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#090d16] border border-slate-800">
                      <h4 className="text-sm md:text-base font-bold text-white leading-relaxed">
                        {examQuestions[currentQIndex].question}
                      </h4>
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                      {examQuestions[currentQIndex].options.map((opt: string, optIdx: number) => {
                        const isSelected = userAnswers[currentQIndex] === optIdx;
                        return (
                          <button
                            key={optIdx}
                            onClick={() => setUserAnswers(prev => ({ ...prev, [currentQIndex]: optIdx }))}
                            className={`w-full p-4 rounded-2xl border text-left text-xs md:text-sm font-medium transition flex items-center justify-between ${
                              isSelected
                                ? 'bg-amber-500/15 border-amber-500 text-white font-bold'
                                : 'bg-[#111827] border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <span>{opt}</span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                      <button
                        onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentQIndex === 0}
                        className="py-2.5 px-4 rounded-xl bg-slate-800 text-slate-300 disabled:opacity-40 text-xs font-bold"
                      >
                        Previous
                      </button>

                      {currentQIndex < examQuestions.length - 1 ? (
                        <button
                          onClick={() => setCurrentQIndex(prev => prev + 1)}
                          className="py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
                        >
                          Next Question
                        </button>
                      ) : (
                        <button
                          onClick={() => setIsExamCompleted(true)}
                          className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-500/20"
                        >
                          Submit Test
                        </button>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── 3. SEARCH & VIEW TOGGLE ──────────────────────────────────────── */}
      <section className="px-4 md:px-8 pt-6 pb-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search topic, formula, or unit in syllabus..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#111827] border border-slate-800 rounded-2xl text-xs md:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div className="flex items-center gap-2 bg-[#111827] p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('day_plan')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'day_plan' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Day Plan Tests</span>
            </button>
            <button
              onClick={() => setActiveTab('syllabus')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'syllabus' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Syllabus Roadmap</span>
            </button>
          </div>
        </div>
      </section>

      {/* ─── 4. MAIN ASSESSMENT VIEW ─────────────────────────────────────── */}
      <main className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
        {activeTab === 'day_plan' ? (
          <div className="space-y-6">
            {/* Day Stepper Card */}
            <div className="p-5 rounded-3xl bg-[#0b1120] border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  Course Timeline: {activeCourse.totalDays} Total Days
                </span>
                <h3 className="text-base md:text-lg font-black text-white mt-0.5">
                  Day {currentDay}: {activeDayPlan?.themeTitle || activeCourse.phaseTitle || 'Core Focus Modules'}
                </h3>
              </div>

              <div className="flex items-center gap-2 bg-[#111827] p-1 rounded-2xl border border-slate-800">
                <button
                  disabled={currentDay <= 1}
                  onClick={() => setCurrentDay(prev => Math.max(1, prev - 1))}
                  className="p-2 rounded-xl text-slate-400 hover:text-white disabled:opacity-40 transition"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </button>
                <span className="px-3 text-xs font-mono font-bold text-white">Day {currentDay}</span>
                <button
                  disabled={currentDay >= activeCourse.totalDays}
                  onClick={() => setCurrentDay(prev => Math.min(activeCourse.totalDays, prev + 1))}
                  className="p-2 rounded-xl text-slate-400 hover:text-white disabled:opacity-40 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List of Nano-Topics for Current Day */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeDayPlan?.tasks && activeDayPlan.tasks.length > 0 ? (
                activeDayPlan.tasks.map((task, idx) => (
                  <div
                    key={task.id || idx}
                    className="p-5 rounded-3xl bg-[#0b1120] border border-slate-800 hover:border-amber-500/40 transition space-y-4 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-slate-800 text-amber-400 font-mono text-[10px] font-bold">
                        Module #{idx + 1}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">⏱ 10 Mins • +20 XP</span>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                        {task.subject || activeCourse.title}
                      </span>
                      <h4 className="text-sm md:text-base font-bold text-white group-hover:text-amber-300 transition mt-0.5">
                        {task.topic}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                      <button
                        onClick={() => launchCbtForTopic(task.topic, task.subject || activeCourse.title)}
                        className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition transform active:scale-95 shadow-md shadow-amber-500/10"
                      >
                        <Zap className="w-3.5 h-3.5 fill-slate-950" />
                        <span>Start Test</span>
                      </button>

                      <Link
                        href={`/teacho?courseId=${activeCourse.id}&topic=${encodeURIComponent(task.topic)}`}
                        className="py-2 px-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 font-bold text-xs flex items-center gap-1 transition"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Notes</span>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 p-12 text-center text-xs text-slate-500">
                  Loading Day {currentDay} Assessment Lineup...
                </div>
              )}
            </div>
          </div>
        ) : (
          /* SYLLABUS ACCORDION ROADMAP */
          <div className="space-y-4">
            {fullSyllabus.map((subj, sIdx) => {
              const isExpanded = expandedSubjects[subj.subjectName] !== false;
              const totalTopics = subj.chapters?.reduce((acc: number, c: any) => acc + (c.microTopics?.length || 0), 0) || 0;

              return (
                <div key={sIdx} className="bg-[#0b1120] border border-slate-800 rounded-3xl overflow-hidden">
                  <button
                    onClick={() => setExpandedSubjects(prev => ({ ...prev, [subj.subjectName]: !isExpanded }))}
                    className="w-full p-5 bg-[#111827] flex items-center justify-between text-left hover:bg-slate-800/60 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{subj.icon || '📖'}</span>
                      <div>
                        <h4 className="text-sm md:text-base font-bold text-white">{subj.subjectName}</h4>
                        <p className="text-xs text-slate-400">{subj.chapters?.length || 0} Chapters • {totalTopics} Nano-Topic Tests</p>
                      </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {isExpanded && (
                    <div className="p-5 space-y-4">
                      {subj.chapters?.map((chap: any, cIdx: number) => (
                        <div key={cIdx} className="p-4 rounded-2xl bg-[#090d16] border border-slate-800/80 space-y-3">
                          <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                            Chapter {chap.chapterNumber || cIdx + 1}: {chap.chapterTitle}
                          </h5>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                            {chap.microTopics?.map((mt: any, tIdx: number) => {
                              const title = typeof mt === 'string' ? mt : mt.topicTitle || mt.title;
                              return (
                                <div
                                  key={tIdx}
                                  className="p-3 rounded-xl bg-[#111827] border border-slate-800 flex items-center justify-between gap-2 hover:border-amber-500/40 transition group"
                                >
                                  <span className="text-xs text-slate-200 font-medium line-clamp-1 flex-1 group-hover:text-white">
                                    {title}
                                  </span>

                                  <button
                                    onClick={() => launchCbtForTopic(title, subj.subjectName)}
                                    className="py-1 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 transition flex-shrink-0"
                                  >
                                    <Zap className="w-3 h-3 fill-slate-950" />
                                    <span>Test</span>
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ─── 5. COURSE PICKER MODAL (100+ MASTER PROGRAMS) ─────────────────── */}
      <TeachOCoursePickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        selectedCourseId={activeCourse.id}
        onSelectCourse={course => {
          setActiveCourse(course);
          setIsPickerOpen(false);
          if (typeof window !== 'undefined') {
            localStorage.setItem('teacho_active_course_id', course.id);
          }
        }}
      />
    </div>
  );
}
