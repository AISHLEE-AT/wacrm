'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Award,
  Sparkles,
  HelpCircle,
  Play,
  Check,
  Zap,
  BookOpen,
  Filter,
  BarChart3,
  ListOrdered
} from 'lucide-react';
import { CourseOption } from '@/data/coursesCatalog';

export interface TestQuestion {
  id: string;
  question_uid: string;
  sequence_number: number;
  subject: string;
  subject_code: string;
  domain?: string;
  topic?: string;
  subtopic?: string;
  microtopic?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  exam_category: string;
  question_format?: string;
  question_text: string;
  question_text_ta?: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  options_ta?: {
    A?: string;
    B?: string;
    C?: string;
    D?: string;
  };
  correct_option: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  explanation_ta?: string;
  formula_or_law?: string;
}

interface TutOOnlineTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  course?: CourseOption;
}

type TestPhase = 'config' | 'loading' | 'active' | 'review';

export const TutOOnlineTestWebModal: React.FC<TutOOnlineTestModalProps> = ({
  isOpen,
  onClose,
  course
}) => {
  // Test Configuration State
  const [testPhase, setTestPhase] = useState<TestPhase>('config');
  const [selectedCategory, setSelectedCategory] = useState<string>('TNPSC');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<string>('ALL');

  // Active Test State
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(600); // 10 mins default
  const [initialTimeSeconds, setInitialTimeSeconds] = useState<number>(600);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Review / Filter State
  const [reviewFilter, setReviewFilter] = useState<'all' | 'correct' | 'wrong' | 'skipped' | 'marked'>('all');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Derive initial exam category from selected course
  useEffect(() => {
    if (course) {
      const cId = course.id.toLowerCase();
      if (cId.includes('tnpsc')) setSelectedCategory('TNPSC');
      else if (cId.includes('neet') || cId.includes('jee')) setSelectedCategory('NEET');
      else if (cId.includes('10')) setSelectedCategory('10th');
      else if (cId.includes('12')) setSelectedCategory('12th');
      else setSelectedCategory('TNPSC');
    }
  }, [course]);

  // Handle countdown timer during active test
  useEffect(() => {
    if (testPhase === 'active') {
      timerRef.current = setInterval(() => {
        setTimeLeftSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleFinishTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [testPhase]);

  // Start the Online Test by fetching curated questions from OCI
  const handleStartTest = async () => {
    setTestPhase('loading');
    setApiError(null);
    try {
      const isBrowser = typeof window !== 'undefined';
      const ociBase = isBrowser ? '' : 'https://mysupro.duckdns.org';
      const params = new URLSearchParams();
      params.set('category', selectedCategory);
      params.set('subject', selectedSubject);
      params.set('count', String(questionCount));
      if (difficulty !== 'ALL') params.set('difficulty', difficulty);
      if (course?.id) params.set('courseId', course.id);

      const res = await fetch(`${ociBase}/api/tuto/test/generate?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to generate test questions');
      const data = await res.json();

      if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        // Format options safely
        const formatted: TestQuestion[] = data.questions.map((q: any) => {
          let opts = typeof q.options === 'string' ? JSON.parse(q.options) : (q.options || {});
          let optsTa = typeof q.options_ta === 'string' ? JSON.parse(q.options_ta) : q.options_ta;

          return {
            id: q.id || q.question_uid,
            question_uid: q.question_uid,
            sequence_number: q.sequence_number,
            subject: q.subject || 'General Knowledge',
            subject_code: q.subject_code || 'GEN',
            domain: q.domain,
            topic: q.topic,
            subtopic: q.subtopic,
            microtopic: q.microtopic,
            difficulty: q.difficulty || 'Medium',
            exam_category: q.exam_category || 'General',
            question_format: q.question_format,
            question_text: q.question_text || '',
            question_text_ta: q.question_text_ta,
            options: {
              A: opts.A || opts[0] || 'Option A',
              B: opts.B || opts[1] || 'Option B',
              C: opts.C || opts[2] || 'Option C',
              D: opts.D || opts[3] || 'Option D',
            },
            options_ta: optsTa,
            correct_option: (q.correct_option || 'A').toUpperCase() as any,
            explanation: q.explanation || 'Curriculum verified solution.',
            explanation_ta: q.explanation_ta,
            formula_or_law: q.formula_or_law
          };
        });

        setQuestions(formatted);
        setSelectedAnswers({});
        setMarkedForReview(new Set());
        setCurrentIdx(0);

        // 1 minute per question allocation
        const totalSecs = formatted.length * 60;
        setTimeLeftSeconds(totalSecs);
        setInitialTimeSeconds(totalSecs);
        setTestPhase('active');
      } else {
        throw new Error('No questions available matching the selected criteria.');
      }
    } catch (err: any) {
      setApiError(err.message || 'Unable to connect to question bank.');
      setTestPhase('config');
    }
  };

  // Submit test and compute scores
  const handleFinishTest = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsSubmitting(true);
    setTestPhase('review');

    // Calculate score
    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    questions.forEach((q, idx) => {
      const userAns = selectedAnswers[idx];
      if (!userAns) {
        skipped++;
      } else if (userAns === q.correct_option) {
        correct++;
      } else {
        wrong++;
      }
    });

    const timeSpent = initialTimeSeconds - timeLeftSeconds;
    const accuracy = questions.length > 0 ? (correct / questions.length) * 100 : 0;

    // Post to OCI test submission endpoint in background
    try {
      const isBrowser = typeof window !== 'undefined';
      const ociBase = isBrowser ? '' : 'https://mysupro.duckdns.org';
      await fetch(`${ociBase}/api/tuto/test/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_phone: 'student_web',
          user_name: 'Student',
          test_title: `${selectedCategory} Online Test`,
          category: selectedCategory,
          subject: selectedSubject,
          total_questions: questions.length,
          correct_count: correct,
          wrong_count: wrong,
          skipped_count: skipped,
          score: correct,
          accuracy_percentage: accuracy.toFixed(1),
          time_spent_seconds: timeSpent,
          answers_summary: selectedAnswers
        })
      });
    } catch (e) {
      // Non-blocking
    } finally {
      setIsSubmitting(false);
    }
  };

  // Option selection
  const handleSelectOption = (optionKey: 'A' | 'B' | 'C' | 'D') => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIdx]: optionKey
    }));
  };

  // Toggle Marked for Review
  const toggleMarkReview = (idx: number) => {
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  // Format time remaining MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Results calculation
  const scoreResults = useMemo(() => {
    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    questions.forEach((q, idx) => {
      const userAns = selectedAnswers[idx];
      if (!userAns) skipped++;
      else if (userAns === q.correct_option) correct++;
      else wrong++;
    });

    const total = questions.length || 1;
    const percentage = Math.round((correct / total) * 100);
    const timeSpent = Math.max(0, initialTimeSeconds - timeLeftSeconds);

    let badge = '🏆 Outstanding Performance!';
    let badgeColor = 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (percentage < 40) {
      badge = '📚 Needs Improvement - Keep Practicing!';
      badgeColor = 'text-amber-600 bg-amber-50 border-amber-200';
    } else if (percentage < 70) {
      badge = '🎖️ Good Attempt - Focus on Weak Areas';
      badgeColor = 'text-blue-600 bg-blue-50 border-blue-200';
    }

    return {
      correct,
      wrong,
      skipped,
      total: questions.length,
      percentage,
      timeSpent,
      badge,
      badgeColor,
      xpEarned: correct * 10
    };
  }, [questions, selectedAnswers, initialTimeSeconds, timeLeftSeconds]);

  // Filtered questions for review screen
  const filteredReviewQuestions = useMemo(() => {
    return questions
      .map((q, idx) => ({ q, idx, userAns: selectedAnswers[idx], isMarked: markedForReview.has(idx) }))
      .filter(({ q, idx, userAns, isMarked }) => {
        if (reviewFilter === 'all') return true;
        if (reviewFilter === 'correct') return userAns === q.correct_option;
        if (reviewFilter === 'wrong') return userAns && userAns !== q.correct_option;
        if (reviewFilter === 'skipped') return !userAns;
        if (reviewFilter === 'marked') return isMarked;
        return true;
      });
  }, [questions, selectedAnswers, markedForReview, reviewFilter]);

  if (!isOpen) return null;

  const currentQ = questions[currentIdx];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[96vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        
        {/* TOP HEADER */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-md">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                TutO CBT Online Test
                <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                  OCI 30K+ QBank
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {testPhase === 'config' && 'Configure and launch your authentic live practice examination'}
                {testPhase === 'active' && `Exam in Progress · ${selectedCategory} (${selectedSubject})`}
                {testPhase === 'review' && 'Test Scorecard, Diagnostic Report & Detailed Solutions'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {testPhase === 'active' && (
              <div className={`px-4 py-1.5 rounded-xl font-mono text-sm font-bold flex items-center gap-2 border ${
                timeLeftSeconds < 120 ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse' : 'bg-slate-800 text-amber-300 border-slate-700'
              }`}>
                <Clock className="w-4 h-4" />
                {formatTime(timeLeftSeconds)}
              </div>
            )}

            <button
              onClick={() => {
                if (testPhase === 'active') {
                  if (confirm('Are you sure you want to exit? Your active test progress will be lost.')) {
                    onClose();
                  }
                } else {
                  onClose();
                }
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* BODY CONTENT DEPENDING ON PHASE */}

        {/* ─── PHASE 1: CONFIGURATION & LAUNCHER ───────────────────────────────── */}
        {testPhase === 'config' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {apiError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            {/* Exam / Target Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                1. Select Target Exam Category
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { id: 'TNPSC', label: 'TNPSC & State Exams', icon: '🏛️', desc: 'Group 1, 2, 4, VAO, SI' },
                  { id: 'NEET', label: 'NEET / JEE Entrance', icon: '🩺', desc: 'Physics, Chemistry, Bio' },
                  { id: '10th', label: '10th Standard SSLC', icon: '🎓', desc: 'Samacheer & CBSE' },
                  { id: '12th', label: '12th Standard Board', icon: '📖', desc: 'Higher Secondary Core' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      selectedCategory === cat.id
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-2 ring-indigo-600/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xl mb-1">{cat.icon}</div>
                    <div className="font-bold text-sm text-slate-900">{cat.label}</div>
                    <div className="text-[11px] text-slate-500">{cat.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Test Mode & Question Count */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                2. Select Test Mode & Question Count
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { count: 10, time: 10, title: '⚡ Rapid Assessment', desc: '10 High-Yield Questions' },
                  { count: 20, time: 20, title: '🎯 Sectional Practice', desc: '20 Comprehensive Questions' },
                  { count: 50, time: 45, title: '🏆 Grand Mock Test', desc: '50 Mixed Exam Questions' },
                ].map((mode) => (
                  <button
                    key={mode.count}
                    onClick={() => setQuestionCount(mode.count)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      questionCount === mode.count
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-2 ring-indigo-600/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-slate-900">{mode.title}</div>
                    <div className="text-xs text-slate-500 mt-1">{mode.desc}</div>
                    <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-indigo-600">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{mode.time} Minutes Limit</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Subject Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                3. Subject Filter (Optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'ALL', label: 'All Subjects (முழுப் பாடம்)' },
                  { id: 'TAM', label: 'General Tamil (பொதுத்தமிழ் & திருக்குறள்)' },
                  { id: 'POL', label: 'Indian Polity (இந்திய ஆட்சியியல்)' },
                  { id: 'PHY', label: 'Physics (இயற்பியல்)' },
                  { id: 'CHE', label: 'Chemistry (வேதியியல்)' },
                  { id: 'BIO', label: 'Biology (உயிரியல்)' },
                  { id: 'MAT', label: 'Maths & Aptitude (கணிதம் & திறனறிவு)' },
                  { id: 'ECO', label: 'Economy (பொருளாதாரம்)' },
                ].map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubject(sub.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                      selectedSubject === sub.id
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Test Instructions Banner */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                <HelpCircle className="w-4 h-4 text-indigo-600" /> Test Guidelines & Marking Rules:
              </div>
              <div>• Each question carries <strong>1 Mark</strong>. No penalty for wrong answers.</div>
              <div>• You can navigate back and forth and <strong>Mark for Review</strong> questions before final submission.</div>
              <div>• Instant detailed explanations and answer keys are displayed immediately upon submission.</div>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <button
                onClick={handleStartTest}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-black text-base rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 fill-current" />
                Start Live Online Test Now ({questionCount} Questions)
              </button>
            </div>
          </div>
        )}

        {/* ─── PHASE 1.5: LOADING ─────────────────────────────────────────────── */}
        {testPhase === 'loading' && (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Curating Authentic Test Questions...</h3>
              <p className="text-xs text-slate-500 mt-1">Sampling 30,145 indexed questions from OCI PostgreSQL database</p>
            </div>
          </div>
        )}

        {/* ─── PHASE 2: ACTIVE CBT TEST INTERFACE ─────────────────────────────── */}
        {testPhase === 'active' && currentQ && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left Main Question Workspace */}
            <div className="flex-1 flex flex-col overflow-y-auto p-6 space-y-6">
              
              {/* Question Meta Row */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-black text-sm flex items-center justify-center">
                    #{currentIdx + 1}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                    {currentQ.subject}
                  </span>
                  {currentQ.topic && (
                    <span className="text-xs text-slate-500 font-medium hidden md:inline truncate max-w-xs">
                      {currentQ.topic}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                    +1.00 Mark
                  </span>
                  <button
                    onClick={() => toggleMarkReview(currentIdx)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                      markedForReview.has(currentIdx)
                        ? 'bg-amber-500 text-white border-amber-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    {markedForReview.has(currentIdx) ? 'Marked' : 'Mark for Review'}
                  </button>
                </div>
              </div>

              {/* Question Text (Bilingual) */}
              <div className="space-y-3">
                <div className="text-base md:text-lg font-bold text-slate-900 leading-relaxed">
                  {currentQ.question_text}
                </div>

                {currentQ.question_text_ta && (
                  <div className="text-sm md:text-base font-medium text-indigo-950 bg-indigo-50/40 p-3.5 rounded-xl border border-indigo-100/60 leading-relaxed">
                    {currentQ.question_text_ta}
                  </div>
                )}
              </div>

              {/* Options Grid */}
              <div className="space-y-3 pt-2">
                {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                  const optTextEn = currentQ.options[optKey] || '';
                  const optTextTa = currentQ.options_ta?.[optKey];
                  const isSelected = selectedAnswers[currentIdx] === optKey;

                  return (
                    <button
                      key={optKey}
                      onClick={() => handleSelectOption(optKey)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/60 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {optKey}
                      </span>

                      <div className="flex-1 space-y-1">
                        <div className="text-sm font-semibold text-slate-800 leading-snug">
                          {optTextEn}
                        </div>
                        {optTextTa && (
                          <div className="text-xs font-medium text-slate-600 leading-snug">
                            {optTextTa}
                          </div>
                        )}
                      </div>

                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 self-center" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Bottom Navigation Toolbar */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between mt-auto">
                <button
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl font-bold text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                {selectedAnswers[currentIdx] && (
                  <button
                    onClick={() => {
                      const next = { ...selectedAnswers };
                      delete next[currentIdx];
                      setSelectedAnswers(next);
                    }}
                    className="text-xs text-slate-400 hover:text-red-500 font-semibold underline"
                  >
                    Clear Response
                  </button>
                )}

                {currentIdx < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    Save & Next <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleFinishTest}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <Check className="w-4 h-4" /> Complete & Submit Test
                  </button>
                )}
              </div>
            </div>

            {/* Right Question Navigator Palette */}
            <div className="w-full md:w-72 bg-slate-50 border-t md:border-t-0 md:border-l border-slate-200 p-5 flex flex-col justify-between">
              <div>
                <div className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-between">
                  <span>Question Palette</span>
                  <span className="text-[11px] font-black text-indigo-600">
                    {Object.keys(selectedAnswers).length} / {questions.length} Solved
                  </span>
                </div>

                {/* Numbers Grid */}
                <div className="grid grid-cols-5 gap-2 max-h-56 md:max-h-72 overflow-y-auto pr-1">
                  {questions.map((_, i) => {
                    const isAnswered = selectedAnswers[i] !== undefined;
                    const isMarked = markedForReview.has(i);
                    const isCurrent = currentIdx === i;

                    let btnClass = 'bg-white border-slate-200 text-slate-700';
                    if (isAnswered && isMarked) {
                      btnClass = 'bg-purple-500 border-purple-600 text-white';
                    } else if (isAnswered) {
                      btnClass = 'bg-emerald-500 border-emerald-600 text-white shadow-sm';
                    } else if (isMarked) {
                      btnClass = 'bg-amber-400 border-amber-500 text-slate-900 font-bold';
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentIdx(i)}
                        className={`w-full aspect-square rounded-lg font-bold text-xs border flex items-center justify-center transition-all ${btnClass} ${
                          isCurrent ? 'ring-2 ring-indigo-600 ring-offset-1 scale-105' : 'hover:opacity-90'
                        }`}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    <span>Answered ({Object.keys(selectedAnswers).length})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-white border border-slate-300"></span>
                    <span>Skipped ({questions.length - Object.keys(selectedAnswers).length})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                    <span>Marked ({markedForReview.size})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                    <span>Ans + Marked</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-200">
                <button
                  onClick={handleFinishTest}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  Submit Final Test
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── PHASE 3: SCORECARD & IN-DEPTH REVIEW ─────────────────────────── */}
        {testPhase === 'review' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Scorecard Hero Banner */}
            <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-slate-800">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-6 h-6 text-amber-400" />
                    <span className="text-xs uppercase font-bold tracking-wider text-indigo-300">
                      Performance Summary
                    </span>
                  </div>
                  <h3 className="text-2xl font-black">{scoreResults.badge}</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Completed in {Math.floor(scoreResults.timeSpent / 60)}m {scoreResults.timeSpent % 60}s · {selectedCategory} Practice
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10">
                  <div className="text-center pr-4 border-r border-white/10">
                    <div className="text-2xl font-black text-amber-300">
                      {scoreResults.correct} / {scoreResults.total}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-300">Score ({scoreResults.percentage}%)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-emerald-400">
                      +{scoreResults.xpEarned}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-300">XP Points</div>
                  </div>
                </div>
              </div>

              {/* Metrics bar */}
              <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-white/10 text-center">
                <div className="bg-white/5 p-2 rounded-xl">
                  <div className="text-base font-bold text-emerald-400">{scoreResults.correct}</div>
                  <div className="text-[10px] text-slate-300">Correct</div>
                </div>
                <div className="bg-white/5 p-2 rounded-xl">
                  <div className="text-base font-bold text-red-400">{scoreResults.wrong}</div>
                  <div className="text-[10px] text-slate-300">Wrong</div>
                </div>
                <div className="bg-white/5 p-2 rounded-xl">
                  <div className="text-base font-bold text-slate-300">{scoreResults.skipped}</div>
                  <div className="text-[10px] text-slate-300">Skipped</div>
                </div>
                <div className="bg-white/5 p-2 rounded-xl">
                  <div className="text-base font-bold text-amber-400">{scoreResults.percentage}%</div>
                  <div className="text-[10px] text-slate-300">Accuracy</div>
                </div>
              </div>
            </div>

            {/* Solution Filter Tabs */}
            <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-2 overflow-x-auto">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                <Filter className="w-4 h-4" /> Filter Questions:
              </div>
              <div className="flex gap-1">
                {[
                  { id: 'all', label: `All (${questions.length})` },
                  { id: 'correct', label: `✅ Correct (${scoreResults.correct})` },
                  { id: 'wrong', label: `❌ Wrong (${scoreResults.wrong})` },
                  { id: 'skipped', label: `⚪ Skipped (${scoreResults.skipped})` },
                  { id: 'marked', label: `🔖 Marked (${markedForReview.size})` },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setReviewFilter(f.id as any)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                      reviewFilter === f.id
                        ? 'bg-white text-indigo-700 shadow-sm'
                        : 'text-slate-600 hover:bg-white/60'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Solutions List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {filteredReviewQuestions.map(({ q, idx, userAns, isMarked }) => {
                const isCorrect = userAns === q.correct_option;
                const isSkipped = !userAns;

                return (
                  <div
                    key={q.id || idx}
                    className={`p-5 rounded-2xl border-2 transition-all ${
                      isCorrect
                        ? 'bg-emerald-50/30 border-emerald-200'
                        : isSkipped
                        ? 'bg-slate-50 border-slate-200'
                        : 'bg-red-50/30 border-red-200'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/60">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-700">{q.subject}</span>
                        {q.topic && <span className="text-xs text-slate-500">• {q.topic}</span>}
                      </div>

                      <div className="flex items-center gap-2">
                        {isCorrect ? (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> +1.00 Correct
                          </span>
                        ) : isSkipped ? (
                          <span className="text-xs font-bold text-slate-600 bg-slate-200 px-2.5 py-0.5 rounded-full">
                            Skipped
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Incorrect
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Question Text */}
                    <div className="font-bold text-slate-900 text-sm md:text-base mb-1">
                      {q.question_text}
                    </div>
                    {q.question_text_ta && (
                      <div className="text-xs md:text-sm text-indigo-950 font-medium mb-4 bg-indigo-50/50 p-2.5 rounded-lg">
                        {q.question_text_ta}
                      </div>
                    )}

                    {/* Options Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 my-3">
                      {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                        const optText = q.options[optKey] || '';
                        const isCorrectKey = q.correct_option === optKey;
                        const isUserChoice = userAns === optKey;

                        let optClass = 'bg-white border-slate-200 text-slate-700';
                        if (isCorrectKey) {
                          optClass = 'bg-emerald-100/60 border-emerald-400 text-emerald-950 font-bold';
                        } else if (isUserChoice && !isCorrectKey) {
                          optClass = 'bg-red-100/60 border-red-300 text-red-950';
                        }

                        return (
                          <div
                            key={optKey}
                            className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${optClass}`}
                          >
                            <span className="font-bold shrink-0">{optKey})</span>
                            <span className="flex-1">{optText}</span>
                            {isCorrectKey && <span className="text-[10px] text-emerald-700 font-bold bg-emerald-200/60 px-1.5 py-0.5 rounded">Correct Answer</span>}
                            {isUserChoice && !isCorrectKey && <span className="text-[10px] text-red-700 font-bold bg-red-200/60 px-1.5 py-0.5 rounded">Your Choice</span>}
                          </div>
                        );
                      })}
                    </div>

                    {/* Detailed Explanation */}
                    <div className="mt-4 p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950 space-y-1.5">
                      <div className="font-bold text-indigo-900 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        Comprehensive Solution & Official Rationale / விளக்கம்:
                      </div>
                      <div className="leading-relaxed">{q.explanation}</div>
                      {q.explanation_ta && (
                        <div className="leading-relaxed text-indigo-900 font-medium pt-1 border-t border-indigo-100">
                          {q.explanation_ta}
                        </div>
                      )}
                      {q.formula_or_law && (
                        <div className="mt-2 font-mono text-[11px] bg-white p-2 rounded-lg border border-indigo-100 text-indigo-700">
                          <strong>Governing Formula / Law:</strong> {q.formula_or_law}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Review Footer Toolbar */}
            <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => {
                  setTestPhase('config');
                  setSelectedAnswers({});
                  setQuestions([]);
                }}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm"
              >
                <RotateCcw className="w-4 h-4" /> Start New Test / புதிய தேர்வு
              </button>

              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-sm"
              >
                Done & Return to Curriculum
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
