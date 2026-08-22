'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { lmsSupabase } from '@/lib/lms-supabase';
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
  Search,
  Timer,
  RotateCcw,
  BookOpen,
  Share2,
  X,
  Mic,
  MicOff,
  Printer,
  ShieldAlert,
  ShoppingCart,
} from 'lucide-react';
import { PaymentQRModal } from '@/components/PaymentQRModal';

const CATEGORIES = [
  { id: 'all', label: 'All Mock Tests', icon: FileCheck2 },
  { id: 'entrance', label: 'NEET & JEE', icon: Zap },
  { id: 'govt', label: 'Govt & TNPSC', icon: Award },
  { id: 'school', label: 'School (Class 8–12)', icon: GraduationCap },
  { id: 'skills', label: 'Tech & Programming', icon: Sparkles },
  { id: 'college', label: 'College & Degree', icon: BookOpen },
  { id: 'others', label: 'Others', icon: Layers },
];

function getTestCategory(t: any): string {
  const cat = (t.category || '').toLowerCase();
  const title = (t.title_name || t.title || '').toLowerCase();
  const desc = (t.description || t.description_purpose || '').toLowerCase();
  const combined = `${cat} ${title} ${desc}`;

  if (
    combined.includes('neet') ||
    combined.includes('jee') ||
    combined.includes('iit') ||
    combined.includes('cuet') ||
    combined.includes('gate') ||
    /physics - class 1[12]|chemistry - class 1[12]|biology - class 1[12]|mathematics - (class 1[12]|advanced)|physics - advanced|chemistry - advanced/i.test(combined)
  ) {
    return 'entrance';
  }
  if (
    combined.includes('tnpsc') ||
    combined.includes('upsc') ||
    combined.includes('ssc') ||
    combined.includes('cgl') ||
    combined.includes('chsl') ||
    combined.includes('cpo') ||
    combined.includes('rrb') ||
    combined.includes('ntpc') ||
    combined.includes('police') ||
    combined.includes('constable') ||
    combined.includes('vao') ||
    combined.includes('si') ||
    combined.includes('prelims') ||
    combined.includes('mains') ||
    combined.includes('csat') ||
    combined.includes('polity') ||
    combined.includes('history') ||
    combined.includes('geography') ||
    combined.includes('economy') ||
    combined.includes('ethics') ||
    combined.includes('current affairs') ||
    combined.includes('aptitude') ||
    combined.includes('indus valley') ||
    combined.includes('general intelligence') ||
    combined.includes('general knowledge') ||
    combined.includes('elementary mathematics')
  ) {
    return 'govt';
  }
  if (
    combined.includes('grade') ||
    combined.includes('school') ||
    combined.includes('10th') ||
    combined.includes('12th') ||
    combined.includes('kindergarten') ||
    combined.includes('lkg') ||
    combined.includes('ukg') ||
    combined.includes('samacheer') ||
    combined.includes('cbse') ||
    combined.includes('matric') ||
    /class [1-9]|class 1[0-2]|8th|9th|10th|11th|12th|std/i.test(combined) ||
    cat.includes('academic')
  ) {
    return 'school';
  }
  if (
    combined.includes('tech') ||
    combined.includes('programming') ||
    combined.includes('python') ||
    combined.includes('javascript') ||
    combined.includes('data') ||
    combined.includes('cloud') ||
    combined.includes('aws') ||
    combined.includes('cyber') ||
    combined.includes('software') ||
    combined.includes('mobile app') ||
    combined.includes('ai')
  ) {
    return 'skills';
  }
  if (
    combined.includes('ug') ||
    combined.includes('college') ||
    combined.includes('degree') ||
    combined.includes('engineering') ||
    combined.includes('bcom') ||
    combined.includes('bba') ||
    combined.includes('bca') ||
    combined.includes('bsc') ||
    combined.includes('btech') ||
    combined.includes('commerce') ||
    combined.includes('spoken english')
  ) {
    return 'college';
  }
  return 'others';
}

function getTestBadge(t: any): { label: string; color: string } {
  const cat = getTestCategory(t);
  const title = (t.title_name || t.title || '').toLowerCase();
  
  if (title.includes('tnpsc')) return { label: 'TNPSC EXAM', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
  if (title.includes('upsc') || title.includes('prelims') || title.includes('mains') || title.includes('csat')) return { label: 'UPSC IAS', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
  if (title.includes('neet')) return { label: 'NEET UG', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' };
  if (title.includes('jee')) return { label: 'JEE MAIN', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
  if (title.includes('10th')) return { label: 'CLASS 10 SSLC', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' };
  if (title.includes('12th')) return { label: 'CLASS 12 HSC', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' };
  if (title.includes('ssc')) return { label: 'SSC CGL/CPO', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' };
  if (title.includes('kindergarten') || title.includes('lkg') || title.includes('ukg')) return { label: 'EARLY YEARS', color: 'bg-pink-500/10 text-pink-400 border-pink-500/30' };
  if (cat === 'skills') return { label: 'TECH & SKILL', color: 'bg-violet-500/10 text-violet-400 border-violet-500/30' };
  if (cat === 'college') return { label: 'DEGREE & UG', color: 'bg-orange-500/10 text-orange-400 border-orange-500/30' };
  return { label: 'MOCK EXAM', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' };
}

export default function TestoWebPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  // Read URL search params on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('search') || params.get('topic') || params.get('q');
      if (q) {
        setSearchQuery(q);
      }
    }
  }, []);

  // Live Exam State
  const [activeTest, setActiveTest] = useState<any | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins
  const [isExamCompleted, setIsExamCompleted] = useState(false);

  // Dynamic Real Question Pool from Database
  const mockQuestions = useMemo(() => {
    if (!activeTest) return [];
    
    let ai = activeTest.additional_info;
    if (typeof ai === 'string') {
      try { ai = JSON.parse(ai); } catch(e) {}
    }

    let qs: any[] = [];
    if (Array.isArray(ai)) {
      qs = ai;
    } else if (ai?.questions && Array.isArray(ai.questions)) {
      qs = ai.questions;
    } else if (ai?.data && Array.isArray(ai.data)) {
      qs = ai.data;
    }

    if (qs.length > 0) {
      return qs.map((q: any) => {
        const options: string[] = Array.isArray(q.options) ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'];
        const correctText = q.correct_answer || q.correctAnswer || q.answer;
        let correctIdx = 0;
        if (typeof correctText === 'string') {
          const found = options.findIndex((o: string) => o.trim().toLowerCase() === correctText.trim().toLowerCase());
          if (found !== -1) correctIdx = found;
        } else if (typeof correctText === 'number') {
          correctIdx = correctText;
        }

        return {
          question: q.question || q.q || 'Question',
          options,
          correct: correctIdx,
          explanation: q.explanation || 'Refer to textbook and syllabus definitions.',
        };
      });
    }

    const t = activeTest.title_name || 'Subject';
    return [
      {
        question: `In ${t}, what is the foundational governing principle or standard equation?`,
        options: ['A) Direct Linear Proportionality Law', 'B) Conservation of Energy & Momentum', 'C) Standard Inverse Quadratic Formulation', 'D) Equilibrium Thermodynamic Boundary'],
        correct: 1,
        explanation: 'Fundamental conservation theorems govern state transformations and balance equations across standard curricula.',
      },
      {
        question: 'Which technique is recommended for maximum accuracy in competitive timed examinations?',
        options: ['A) Blind Guessing All Options', 'B) Dimensional Verification & Elimination of Traps', 'C) Skipping All Problem Statements', 'D) Random Option Marking'],
        correct: 1,
        explanation: 'Eliminating impossible units and verifying boundary values cuts answering time by over 50%.',
      },
      {
        question: 'What is the primary prerequisite concept required before attempting advanced numericals?',
        options: ['A) Core Axioms & SI Unit Consistency', 'B) Complex Multi-Variable Integrals only', 'C) External Calculator Usage', 'D) Non-standard Assumptions'],
        correct: 0,
        explanation: 'Unit consistency and foundational definitions are critical before advancing to multi-step problem solving.',
      },
      {
        question: 'When analyzing graphical data in this domain, what does the area under the curve represent?',
        options: ['A) Cumulative Accumulation or Work Done', 'B) Zero Physical Meaning', 'C) Random Variance', 'D) Instantaneous Derivative'],
        correct: 0,
        explanation: 'The integral (area under curve) provides the total accumulated physical quantity.',
      },
      {
        question: 'What is the key takeaway for achieving top percentile in this module?',
        options: ['A) Daily Rapid PYQ Problem Drills & Mock Tests', 'B) Passive Reading Without Practice', 'C) Memorizing Without Derivations', 'D) Ignoring Diagnostic Feedback'],
        correct: 0,
        explanation: 'Consistent timed problem drills and reviewing diagnostic error logs maximize performance retention.',
      },
    ];
  }, [activeTest]);

  useEffect(() => {
    fetchTests();
  }, []);

  // Timer Hook
  useEffect(() => {
    if (!activeTest || isExamCompleted) return;
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
  }, [activeTest, isExamCompleted]);

  const [displayLimit, setDisplayLimit] = useState(36);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const { data } = await lmsSupabase
        .from('unified_master_data')
        .select('*')
        .eq('item_type', 'o_test')
        .limit(1000);

      if (data && data.length > 0) {
        // Sort tests: prioritize tests with pre-parsed questions in additional_info
        const sorted = [...data].sort((a, b) => {
          const aHasQ = a.additional_info && (
            (typeof a.additional_info === 'string' && a.additional_info.includes('"questions"')) ||
            (typeof a.additional_info === 'object' && a.additional_info?.questions?.length > 0)
          );
          const bHasQ = b.additional_info && (
            (typeof b.additional_info === 'string' && b.additional_info.includes('"questions"')) ||
            (typeof b.additional_info === 'object' && b.additional_info?.questions?.length > 0)
          );
          if (aHasQ && !bHasQ) return -1;
          if (!aHasQ && bHasQ) return 1;
          return 0;
        });
        setTests(sorted);
      } else {
        // Fallback to Courses with test capability
        const { data: courses } = await lmsSupabase
          .from('unified_master_data')
          .select('*')
          .eq('item_type', 'COURSE')
          .limit(100);
        if (courses) setTests(courses);
      }
    } catch (e) {
      console.error('Error fetching TestO Web tests:', e);
    } finally {
      setLoading(false);
    }
  };

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: tests.length };
    tests.forEach(t => {
      const cat = getTestCategory(t);
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [tests]);

  const filteredTests = useMemo(() => {
    let items = tests;
    if (activeCategory !== 'all') {
      items = tests.filter(t => getTestCategory(t) === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        t =>
          (t.title_name && t.title_name.toLowerCase().includes(q)) ||
          (t.category && t.category.toLowerCase().includes(q)) ||
          (t.description && t.description.toLowerCase().includes(q))
      );
    }
    return items;
  }, [tests, activeCategory, searchQuery]);

  const visibleTests = useMemo(() => {
    return filteredTests.slice(0, displayLimit);
  }, [filteredTests, displayLimit]);

  const handleStartExam = (test: any) => {
    setActiveTest(test);
    setCurrentQIndex(0);
    setUserAnswers({});
    setTimeLeft(900);
    setIsExamCompleted(false);
  };

  const handleSelectOption = (optIndex: number) => {
    setUserAnswers(prev => ({ ...prev, [currentQIndex]: optIndex }));
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const calculatedScore = useMemo(() => {
    if (!mockQuestions.length) return { score: 0, total: 0, accuracy: 0, correct: 0, wrong: 0 };
    let correct = 0;
    let wrong = 0;
    mockQuestions.forEach((q, idx) => {
      const ans = userAnswers[idx];
      if (ans !== undefined) {
        if (ans === q.correct) correct++;
        else wrong++;
      }
    });
    const total = mockQuestions.length;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { score: correct * 4 - wrong * 1, total: total * 4, accuracy, correct, wrong };
  }, [mockQuestions, userAnswers]);

  // Anti-cheat Focus/Tab blur listener
  const [blurCount, setBlurCount] = useState(0);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (!activeTest || isExamCompleted) return;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setBlurCount(prev => prev + 1);
        alert('⚠️ Anti-Cheat Warning: Tab switching is monitored during live mock exams. Please remain on the examination screen.');
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [activeTest, isExamCompleted]);

  const startVoiceSearch = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice speech recognition is supported in Google Chrome, Microsoft Edge, and modern browsers.');
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.interimResults = false;
      setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setSearchQuery(transcript);
        }
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const printScorecard = () => {
    if (typeof window === 'undefined' || !activeTest) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Scorecard - ${activeTest.title_name}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0f172a; text-align: center; }
          .cert-box { border: 4px double #8b5cf6; padding: 40px; border-radius: 20px; background: #faf5ff; }
          .badge { display: inline-block; background: #8b5cf6; color: #ffffff; font-weight: bold; font-size: 12px; padding: 6px 14px; border-radius: 20px; text-transform: uppercase; margin-bottom: 12px; }
          h1 { color: #581c87; margin: 10px 0; font-size: 26px; }
          .score-grid { display: flex; justify-content: center; gap: 20px; margin: 30px 0; }
          .score-card { background: #ffffff; border: 1px solid #e9d5ff; padding: 16px 24px; border-radius: 12px; min-width: 120px; }
          .score-val { font-size: 24px; font-weight: 900; color: #7c3aed; }
          .score-lbl { font-size: 11px; color: #6b7280; text-transform: uppercase; font-weight: bold; }
          .footer { margin-top: 30px; font-size: 11px; color: #9ca3af; }
        </style>
      </head>
      <body>
        <div class="cert-box">
          <span class="badge">Official TestO Examination Scorecard</span>
          <h1>${activeTest.title_name}</h1>
          <p style="color: #6b7280; font-size: 13px;">Date: ${new Date().toLocaleDateString()} • SuprO National Testing Engine</p>
          <div class="score-grid">
            <div class="score-card">
              <div class="score-val">${calculatedScore.score} / ${calculatedScore.total}</div>
              <div class="score-lbl">Total Score</div>
            </div>
            <div class="score-card">
              <div class="score-val">${calculatedScore.accuracy}%</div>
              <div class="score-lbl">Accuracy</div>
            </div>
            <div class="score-card">
              <div class="score-val">${calculatedScore.correct}</div>
              <div class="score-lbl">Correct (+4)</div>
            </div>
            <div class="score-card">
              <div class="score-val">${calculatedScore.wrong}</div>
              <div class="score-lbl">Wrong (-1)</div>
            </div>
          </div>
          <p style="font-size: 13px; color: #4b5563;">Performance Status: <strong>${calculatedScore.accuracy >= 70 ? 'Distinction Qualified' : 'Eligible for Retest'}</strong></p>
          <div class="footer">
            Verified by EduVerse AI Examination Authority • SuprO Platform
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-100 p-6">
      {/* Top Header Bar */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-white tracking-tight">TestO Exam & Mock Test Hub</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
              <Sparkles className="w-3 h-3" /> Live Testing Engine
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-Time Timed Mock Exams, Negative Marking & Instant Diagnostic Scorecards
          </p>
        </div>

        {/* Top TestO Purchase Status Badge */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs font-bold text-purple-300">
            <Award className="w-4 h-4 text-purple-400" />
            <span>500+ Official Tests Active</span>
          </div>
          <button
            onClick={() => setIsPaymentOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition transform active:scale-95"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>All-Access Pass (₹99)</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-6">
        {/* Search with Voice */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search mock exams, NEET practice tests, TNPSC question sets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-3 bg-[#111827] border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
          />
          <button
            type="button"
            onClick={startVoiceSearch}
            title="Voice Search"
            className={`absolute right-3.5 top-2.5 p-2 rounded-xl transition ${
              isListening
                ? 'bg-red-500/20 text-red-400 animate-pulse border border-red-500/40'
                : 'text-slate-400 hover:text-purple-400 hover:bg-slate-800'
            }`}
          >
            <Mic className="w-4 h-4" />
          </button>
        </div>

        {/* 💳 Test Series Pass Unlock Banner */}
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-900/40 via-[#111827] to-amber-950/30 border border-purple-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold shrink-0">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">TestO All-Access Exam Pass</h4>
                <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-black text-[10px] rounded">₹99</span>
              </div>
              <p className="text-xs text-slate-400">
                Unlock all national standard mock exams, timed chapter tests, and verifiable certificates via 1-Tap UPI Pay.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsPaymentOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white text-xs font-bold rounded-xl transition shadow-md shrink-0 flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" /> Unlock Exam Pass (₹99)
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            const count = categoryCounts[cat.id] || 0;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setDisplayLimit(36);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                    : 'bg-[#111827] text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-purple-700 text-purple-100' : 'bg-slate-800 text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Total Count Header */}
        <div className="flex items-center justify-between mb-4 text-xs font-bold text-slate-400">
          <span>Showing {visibleTests.length} of {filteredTests.length} mock tests</span>
          {searchQuery && (
            <span className="text-purple-400">Filtered by &quot;{searchQuery}&quot;</span>
          )}
        </div>

        {/* Test Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mb-4" />
            <p>Loading TestO Mock Examinations from database...</p>
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            <FileCheck2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>No tests found in this category.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleTests.map(test => {
                const badge = getTestBadge(test);
                let ai = test.additional_info;
                if (typeof ai === 'string') {
                  try { ai = JSON.parse(ai); } catch(e) {}
                }
                const qCount = Array.isArray(ai) ? ai.length : (ai?.questions?.length || 30);

                return (
                  <div
                    key={test.id}
                    className="bg-[#111827] border border-slate-800 hover:border-purple-500/50 rounded-2xl p-5 flex flex-col justify-between transition shadow-md hover:shadow-purple-500/10"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3 gap-2">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border truncate ${badge.color}`}>
                          {badge.label}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1 font-mono shrink-0">
                          <Clock className="w-3.5 h-3.5 text-slate-500" /> {qCount} Qs • 15 Mins
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mb-2 line-clamp-2 leading-snug">{test.title_name || test.title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                        {test.description || test.description_purpose || 'Comprehensive timed mock test series with instant score analysis & solutions.'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleStartExam(test)}
                      className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-purple-600/20 active:scale-95"
                    >
                      <FileCheck2 className="w-4 h-4" /> Start Mock Test
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Load More Button */}
            {visibleTests.length < filteredTests.length && (
              <div className="mt-10 text-center">
                <button
                  onClick={() => setDisplayLimit(prev => prev + 36)}
                  className="px-6 py-3 bg-[#111827] hover:bg-slate-800 border border-slate-700 hover:border-purple-500 text-white font-bold rounded-2xl text-xs transition shadow-lg inline-flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Load More Tests ({filteredTests.length - visibleTests.length} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Live Exam Modal */}
      {activeTest && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Exam Header */}
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-[#0c1322]">
              <div>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                  TestO Live Exam Mode
                </span>
                <h3 className="text-sm font-bold text-white line-clamp-1">{activeTest.title_name}</h3>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400 font-mono font-bold text-xs">
                  <Timer className="w-4 h-4" />
                  <span>{formatTimer(timeLeft)}</span>
                </div>
                <button
                  onClick={() => setActiveTest(null)}
                  className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Exam Body */}
            {!isExamCompleted ? (
              <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4 text-xs font-bold text-slate-400">
                    <span>Question {currentQIndex + 1} of {mockQuestions.length}</span>
                    <span className="text-purple-400 font-mono">Marking: +4 / -1</span>
                  </div>

                  <h4 className="text-base font-bold text-white mb-6 leading-relaxed">
                    {mockQuestions[currentQIndex]?.question}
                  </h4>

                  <div className="space-y-3">
                    {mockQuestions[currentQIndex]?.options.map((opt: string, optIdx: number) => {
                      const isSelected = userAnswers[currentQIndex] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectOption(optIdx)}
                          className={`w-full p-4 rounded-xl text-left text-xs font-semibold transition border ${
                            isSelected
                              ? 'bg-purple-600/20 border-purple-500 text-purple-200'
                              : 'bg-[#0c1322] border-slate-800 text-slate-300 hover:bg-slate-800/40'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Exam Stepper Footer */}
                <div className="flex justify-between items-center pt-6 border-t border-slate-800 mt-6">
                  <button
                    disabled={currentQIndex === 0}
                    onClick={() => setCurrentQIndex(prev => prev - 1)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <div className="flex gap-1.5">
                    {mockQuestions.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        onClick={() => setCurrentQIndex(dotIdx)}
                        className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center transition ${
                          currentQIndex === dotIdx
                            ? 'bg-purple-600 text-white'
                            : userAnswers[dotIdx] !== undefined
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {dotIdx + 1}
                      </button>
                    ))}
                  </div>

                  {currentQIndex < mockQuestions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQIndex(prev => prev + 1)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition"
                    >
                      Next Question
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsExamCompleted(true)}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition"
                    >
                      Submit Exam
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Scorecard & Solution Review */
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="text-center p-6 bg-[#0c1322] border border-slate-800 rounded-2xl">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded">
                    OFFICIAL SCORECARD
                  </span>
                  <h3 className="text-3xl font-black text-white mt-2">
                    {calculatedScore.score} / {calculatedScore.total}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Accuracy: {calculatedScore.accuracy}% • Completed in {formatTimer(900 - timeLeft)}</p>

                  <div className="grid grid-cols-2 gap-4 mt-6 max-w-sm mx-auto">
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center">
                      <p className="text-xs text-emerald-400 font-bold">Correct</p>
                      <p className="text-lg font-black text-white">{calculatedScore.correct}</p>
                    </div>
                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-center">
                      <p className="text-xs text-rose-400 font-bold">Incorrect</p>
                      <p className="text-lg font-black text-white">{calculatedScore.wrong}</p>
                    </div>
                  </div>
                </div>

                {/* Question-by-Question Solution Review */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white">Diagnostic Question Review</h4>
                  {mockQuestions.map((q, qIdx) => {
                    const userAns = userAnswers[qIdx];
                    const isCorrect = userAns === q.correct;
                    return (
                      <div key={qIdx} className="p-4 bg-[#0c1322] border border-slate-800 rounded-xl space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-400">Q{qIdx + 1}</span>
                          {userAns === undefined ? (
                            <span className="text-slate-500">Unanswered</span>
                          ) : isCorrect ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+4)
                            </span>
                          ) : (
                            <span className="text-rose-400 font-bold flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" /> Incorrect (-1)
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-white">{q.question}</p>
                        <div className="p-2.5 bg-[#111827] rounded-lg text-xs text-slate-400">
                          <p className="font-bold text-emerald-400">Correct Answer: {q.options[q.correct]}</p>
                          <p className="mt-1 text-slate-300">💡 Solution: {q.explanation}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={printScorecard}
                    className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-500/20"
                  >
                    <Printer className="w-4 h-4" /> Print Certificate (PDF)
                  </button>
                  <button
                    onClick={() => handleStartExam(activeTest)}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <RotateCcw className="w-4 h-4" /> Retake Test
                  </button>
                  <button
                    onClick={() => setActiveTest(null)}
                    className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition"
                  >
                    Back to Test Hub
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 💳 Test Series UPI Unlock Modal */}
      <PaymentQRModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onSuccess={() => {
          setIsPaymentOpen(false);
          alert('🎉 All Test Series unlocked with instant scoring and certificate access!');
        }}
        title="TestO All-Access Exam Pass"
        amount={99}
        itemId="testo_all_access_pass"
        itemType="o_test"
        userId="web-student"
        userName="Student"
        userPhone="9486335870"
        upiId="9486335870@hdfcbank"
        payeeName="AISHLEE TECHNOLOGY"
      />
    </div>
  );
}

