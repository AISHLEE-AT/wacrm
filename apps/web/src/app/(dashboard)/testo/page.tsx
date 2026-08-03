'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  BookOpen, Timer, Trophy, CheckCircle2, XCircle, Lock, Loader2,
  BarChart3, Star, Zap, ArrowRight, Upload, RefreshCw, Award,
  Crown, Medal, Clock, FileText, Users, ChevronRight, ShieldCheck,
  AlertCircle, X, Download, QrCode
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ─────────────────────────────────────────────────────────
interface TestPaper {
  id: string;
  title: string;
  subject: string;
  topic: string;
  description?: string;
  price: number;
  duration_minutes: number;
  total_questions: number;
  thumbnail_emoji: string;
  form_id?: string;
}

interface Question {
  id: string;
  question_no: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation?: string;
  marks: number;
}

interface ResultItem {
  question_no: number;
  question_text: string;
  option_a: string; option_b: string; option_c: string; option_d: string;
  correct_answer: string;
  user_answer: string | null;
  is_correct: boolean;
  explanation?: string;
  marks: number;
  marks_obtained: number;
}

type ScreenMode = 'browse' | 'payment' | 'pending' | 'test' | 'results' | 'leaderboard';

const UPI_ID = '9486335870@hdfcbank';
const UPI_NAME = 'Aishlee Technology';
const TEST_PRICE = 22;

// ─── Certificate Component ─────────────────────────────────────────
function Certificate({ name, topic, subject, score, total, percentage, rank, date }: any) {
  const passed = percentage >= 60;
  const certRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    if (!certRef.current) return;
    import('html2canvas').then(({ default: html2canvas }) => {
      html2canvas(certRef.current!, { scale: 2, backgroundColor: '#0a0f1e' }).then(canvas => {
        const link = document.createElement('a');
        link.download = `SuprO_TestO_Certificate_${name?.replace(/\s+/g, '_')}.png`;
        link.href = canvas.toDataURL();
        link.click();
      });
    }).catch(() => alert('Download ready! Take a screenshot of the certificate.'));
  };

  if (!passed) return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center space-y-2">
      <XCircle className="w-12 h-12 text-red-400 mx-auto" />
      <p className="text-red-400 font-bold">Score ≥ 60% required for certificate</p>
      <p className="text-gray-400 text-sm">You scored {percentage}%. Keep practicing!</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div ref={certRef} className="relative bg-gradient-to-br from-[#0d1a2e] via-[#0a1525] to-[#071020] border-4 border-double border-amber-400/60 rounded-3xl p-8 text-center overflow-hidden">
        {/* Corner decorations */}
        <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-400/60 rounded-tl-lg" />
        <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-400/60 rounded-tr-lg" />
        <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-400/60 rounded-bl-lg" />
        <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-400/60 rounded-br-lg" />
        {/* Glow */}
        <div className="absolute inset-0 bg-amber-400/3 pointer-events-none" />

        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/40">
            <Award className="w-10 h-10 text-white" />
          </div>
        </div>

        <p className="text-amber-400/80 text-xs font-bold tracking-[0.3em] uppercase mb-1">SuprO TestO — Official Certificate</p>
        <p className="text-gray-400 text-xs mb-6">This certifies that</p>

        <h2 className="text-3xl font-black text-white tracking-wider mb-2">{name}</h2>
        <p className="text-gray-400 text-sm mb-6">has successfully completed</p>

        <div className="bg-amber-400/10 border border-amber-400/30 rounded-xl px-6 py-3 inline-block mb-4">
          <p className="text-amber-300 font-bold text-base">{subject}</p>
          <p className="text-amber-400/70 text-xs">{topic}</p>
        </div>

        <div className="flex justify-center gap-6 mb-6">
          <div className="text-center">
            <p className="text-3xl font-black text-emerald-400">{score}/{total}</p>
            <p className="text-gray-500 text-xs uppercase tracking-wider">Score</p>
          </div>
          <div className="w-px bg-amber-400/20" />
          <div className="text-center">
            <p className="text-3xl font-black text-amber-400">{percentage}%</p>
            <p className="text-gray-500 text-xs uppercase tracking-wider">Accuracy</p>
          </div>
          <div className="w-px bg-amber-400/20" />
          <div className="text-center">
            <p className="text-3xl font-black text-purple-400">#{rank}</p>
            <p className="text-gray-500 text-xs uppercase tracking-wider">Rank</p>
          </div>
        </div>

        <p className="text-gray-500 text-xs">{new Date(date || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <p className="text-amber-400/50 text-xs mt-1 font-mono">Powered by SuprO • aishlee.tech</p>
      </div>
      <button onClick={handleDownload}
        className="w-full py-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-400 font-bold rounded-xl flex items-center justify-center gap-2 transition">
        <Download className="w-4 h-4" /> Download Certificate
      </button>
    </div>
  );
}

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

// ─── Main Page ──────────────────────────────────────────────────────
function TestoPageContent() {
  const { user, profile } = useAuth();
  const searchParams = useSearchParams();

  const embedPhone = searchParams.get('phone');
  const embedName = searchParams.get('name');

  const phone = embedPhone || (profile as any)?.phone || (profile as any)?.whatsapp ||
    user?.phone?.replace(/^\+91/, '') ||
    user?.email?.replace('user_', '').replace('@wacrm.local', '') || '';
  const userName = embedName || profile?.full_name || `User ${phone.slice(-4)}`;

  const [screen, setScreen] = useState<ScreenMode>('browse');
  const [papers, setPapers] = useState<TestPaper[]>([]);
  const [grouped, setGrouped] = useState<Record<string, TestPaper[]>>({});
  const [activeSubject, setActiveSubject] = useState<string>('All');
  const [loadingPapers, setLoadingPapers] = useState(true);

  // Payment flow
  const [selectedPaper, setSelectedPaper] = useState<TestPaper | null>(null);
  const [utr, setUtr] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [purchaseId, setPurchaseId] = useState<string | null>(null);
  const [pollInterval, setPollIntervalRef] = useState<any>(null);

  // Per-paper status cache: paper_id -> 'none' | 'pending' | 'verified' | 'completed'
  const [paperStatus, setPaperStatus] = useState<Record<string, string>>({});

  // Test state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [testStartTime, setTestStartTime] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submittingTest, setSubmittingTest] = useState(false);
  const timerRef = useRef<any>(null);

  // Results
  const [results, setResults] = useState<ResultItem[]>([]);
  const [resultSummary, setResultSummary] = useState<any>(null);

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loadingLB, setLoadingLB] = useState(false);

  // ── Load papers + statuses ─────────────────────────────────────
  useEffect(() => {
    fetch('/api/testo/papers')
      .then(r => r.json())
      .then(data => {
        setPapers(data.papers || []);
        setGrouped(data.grouped || {});
        setLoadingPapers(false);
      })
      .catch(() => setLoadingPapers(false));
  }, []);

  useEffect(() => {
    if (!phone || !papers.length) return;
    // Check status for each paper
    papers.forEach(p => {
      fetch(`/api/testo/status?phone=${phone}&paper_id=${p.id}`)
        .then(r => r.json())
        .then(data => {
          const st = data.completed_attempt ? 'completed' : (data.status || 'none');
          setPaperStatus(prev => ({ ...prev, [p.id]: st }));
        })
        .catch(() => {});
    });
  }, [phone, papers]);

  // ── Subject tabs ───────────────────────────────────────────────
  const subjects = ['All', ...Object.keys(grouped)];
  const filteredPapers = activeSubject === 'All' ? papers : (grouped[activeSubject] || []);

  // ── Buy test ───────────────────────────────────────────────────
  const openPayment = (paper: TestPaper) => {
    setSelectedPaper(paper);
    setUtr('');
    setScreenshotFile(null);
    setScreenshotPreview(null);
    setPurchaseId(null);
    setScreen('payment');
  };

  const handleScreenshot = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScreenshotFile(file);
    const reader = new FileReader();
    reader.onload = ev => setScreenshotPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const submitPayment = async () => {
    if (!utr.trim() || !selectedPaper || !phone) return;
    setSubmittingPayment(true);
    try {
      const res = await fetch('/api/testo/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paper_id: selectedPaper.id,
          phone,
          utr: utr.trim(),
          screenshot_url: screenshotPreview || null,
          user_id: user?.id,
          user_name: userName,
        }),
      });
      const data = await res.json();
      if (!res.ok && !data.purchase_id) throw new Error(data.error);
      setPurchaseId(data.purchase_id || null);
      setScreen('pending');
      startPolling(selectedPaper.id);
    } catch (err: any) {
      alert(err.message || 'Failed to submit payment');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const startPolling = (paperId: string) => {
    const iv = setInterval(async () => {
      try {
        const res = await fetch(`/api/testo/status?phone=${phone}&paper_id=${paperId}`);
        const data = await res.json();
        if (data.status === 'verified') {
          clearInterval(iv);
          setPaperStatus(prev => ({ ...prev, [paperId]: 'verified' }));
          setScreen('browse');
          alert('✅ Payment verified! Click "Start Test" to begin.');
        }
      } catch {}
    }, 10000); // poll every 10s
    setPollIntervalRef(iv);
  };

  useEffect(() => () => { if (pollInterval) clearInterval(pollInterval); }, [pollInterval]);

  // ── Start test ─────────────────────────────────────────────────
  const startTest = async (paper: TestPaper) => {
    setSelectedPaper(paper);
    setAnswers({});
    setCurrentQ(0);

    // Load questions (via admin route or direct Supabase)
    // We fetch questions without answers for security; answers are on server
    const res = await fetch(`/api/testo/questions?paper_id=${paper.id}`);
    const data = await res.json();
    if (data.questions?.length) {
      setQuestions(data.questions);
      setTestStartTime(Date.now());
      setTimeLeft(paper.duration_minutes * 60);
      setScreen('test');
    } else {
      alert('Could not load test questions. Please try again.');
    }
  };

  // ── Timer ─────────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== 'test') { if (timerRef.current) clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); submitTest(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [screen]);

  const fmtTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // ── Submit test ───────────────────────────────────────────────
  const submitTest = useCallback(async () => {
    if (submittingTest || !selectedPaper) return;
    setSubmittingTest(true);
    clearInterval(timerRef.current);
    try {
      const timeTaken = Math.floor((Date.now() - testStartTime) / 1000);
      const res = await fetch('/api/testo/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paper_id: selectedPaper.id,
          phone,
          user_id: user?.id,
          user_name: userName,
          answers,
          time_taken_seconds: timeTaken,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResults(data.results || []);
      setResultSummary(data);
      setPaperStatus(prev => ({ ...prev, [selectedPaper.id]: 'completed' }));
      setScreen('results');
    } catch (err: any) {
      alert(err.message || 'Failed to submit test');
    } finally {
      setSubmittingTest(false);
    }
  }, [answers, selectedPaper, phone, user, userName, testStartTime, submittingTest]);

  // ── Load leaderboard ──────────────────────────────────────────
  const loadLeaderboard = async (paper: TestPaper) => {
    setSelectedPaper(paper);
    setLoadingLB(true);
    setScreen('leaderboard');
    const res = await fetch(`/api/testo/leaderboard?paper_id=${paper.id}`);
    const data = await res.json();
    setLeaderboard(data.leaderboard || []);
    setLoadingLB(false);
  };

  const statusBadge = (paperId: string) => {
    const st = paperStatus[paperId] || 'none';
    if (st === 'completed') return { label: '✅ Completed', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    if (st === 'verified') return { label: '🟢 Unlocked', color: 'text-green-400 bg-green-500/10 border-green-500/30' };
    if (st === 'pending') return { label: '⏳ Pending', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    return { label: '🔒 ₹22', color: 'text-gray-400 bg-gray-500/10 border-gray-500/30' };
  };

  // ═══════════════════════════════════════════════════════════════
  // ── RENDER ───────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════

  // ── BROWSE ────────────────────────────────────────────────────
  if (screen === 'browse') return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-violet-900/40 via-purple-900/20 to-indigo-900/30 border border-violet-500/30 rounded-3xl p-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-violet-500/20 border border-violet-500/30">
                <BookOpen className="w-5 h-5 text-violet-400" />
              </div>
              <span className="text-violet-400 text-xs font-bold uppercase tracking-widest">SuprO TestO</span>
            </div>
            <h1 className="text-2xl font-black text-white mb-1">Exam Ready Platform</h1>
            <p className="text-gray-400 text-sm">Topic-wise tests • ₹22/test • Instant certificate</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-4xl font-black text-violet-400">₹22</p>
            <p className="text-gray-500 text-xs">per test</p>
          </div>
        </div>
        <div className="relative z-10 flex gap-3 mt-4 flex-wrap">
          {['9th Maths', 'SSC CGL', 'TNPSC', '10th Science'].map(tag => (
            <span key={tag} className="px-3 py-1 rounded-full text-xs font-bold text-violet-300 bg-violet-500/10 border border-violet-500/20">{tag}</span>
          ))}
        </div>
      </div>

      {/* Subject Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {subjects.map(subj => (
          <button key={subj} onClick={() => setActiveSubject(subj)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all border ${
              activeSubject === subj
                ? 'bg-violet-500 text-white border-violet-500 shadow-lg shadow-violet-500/30'
                : 'bg-[#111c35] text-gray-400 border-violet-500/20 hover:border-violet-500/40 hover:text-violet-300'
            }`}>
            {subj}
          </button>
        ))}
      </div>

      {/* Test Cards */}
      {loadingPapers ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        </div>
      ) : filteredPapers.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No tests available yet.</p>
          <p className="text-xs mt-1">Admin is uploading tests. Check back soon!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredPapers.map(paper => {
            const badge = statusBadge(paper.id);
            const st = paperStatus[paper.id] || 'none';
            return (
              <motion.div key={paper.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-[#0d1526]/80 border border-violet-500/20 rounded-2xl p-5 space-y-4 hover:border-violet-500/40 transition-all group">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-2xl">
                      {paper.thumbnail_emoji || '📝'}
                    </div>
                    <div>
                      <p className="text-violet-400 text-xs font-bold uppercase tracking-wider">{paper.subject}</p>
                      <h3 className="text-white font-bold text-sm leading-tight">{paper.topic}</h3>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${badge.color}`}>{badge.label}</span>
                </div>

                <div className="flex gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" />{paper.total_questions}Q</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{paper.duration_minutes}min</span>
                  <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5 text-amber-400" />Certificate</span>
                </div>

                {paper.description && <p className="text-gray-500 text-xs">{paper.description}</p>}

                <div className="flex gap-2">
                  {st === 'completed' ? (
                    <>
                      <button onClick={() => loadLeaderboard(paper)}
                        className="flex-1 py-2.5 text-sm font-bold rounded-xl border border-violet-500/30 text-violet-400 hover:bg-violet-500/10 transition flex items-center justify-center gap-1.5">
                        <Trophy className="w-4 h-4" /> Leaderboard
                      </button>
                    </>
                  ) : st === 'verified' ? (
                    <>
                      <button onClick={() => startTest(paper)}
                        className="flex-1 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20">
                        <Zap className="w-4 h-4" /> Start Test
                      </button>
                      <button onClick={() => loadLeaderboard(paper)}
                        className="py-2.5 px-3 text-sm font-bold rounded-xl border border-violet-500/30 text-violet-400 hover:bg-violet-500/10 transition">
                        <Trophy className="w-4 h-4" />
                      </button>
                    </>
                  ) : st === 'pending' ? (
                    <div className="flex-1 py-2.5 text-sm font-bold rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center gap-1.5">
                      <Loader2 className="w-4 h-4 animate-spin" /> Verifying Payment...
                    </div>
                  ) : (
                    <>
                      <button onClick={() => openPayment(paper)}
                        className="flex-1 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white transition flex items-center justify-center gap-1.5 shadow-lg shadow-violet-500/20">
                        <Lock className="w-4 h-4" /> Buy Test — ₹{paper.price || TEST_PRICE}
                      </button>
                      <button onClick={() => loadLeaderboard(paper)}
                        className="py-2.5 px-3 text-sm font-bold rounded-xl border border-violet-500/30 text-violet-400 hover:bg-violet-500/10 transition">
                        <Trophy className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ── PAYMENT ────────────────────────────────────────────────────
  if (screen === 'payment' && selectedPaper) return (
    <div className="max-w-md mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => setScreen('browse')} className="p-2 rounded-xl bg-[#111c35] text-gray-400 hover:text-white transition">
          <X className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-white">Buy Test Access</h2>
          <p className="text-gray-400 text-xs">{selectedPaper.topic}</p>
        </div>
      </div>

      {/* Amount */}
      <div className="bg-violet-500/10 border border-violet-500/30 rounded-2xl p-5 text-center">
        <p className="text-gray-400 text-sm mb-1">Pay via UPI</p>
        <p className="text-5xl font-black text-white mb-1">₹{selectedPaper.price || TEST_PRICE}</p>
        <p className="text-violet-400 font-mono font-bold text-sm">{UPI_ID}</p>
        <p className="text-gray-500 text-xs mt-1">{UPI_NAME}</p>
      </div>

      {/* QR Code */}
      <div className="bg-[#0d1526] border border-violet-500/20 rounded-2xl p-5 flex flex-col items-center gap-3">
        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Scan & Pay with PhonePe / GPay / Paytm</p>
        <div className="bg-white p-4 rounded-2xl shadow-lg">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(UPI_NAME)}&am=${selectedPaper.price || TEST_PRICE}&tn=${encodeURIComponent('SuprO TestO - ' + selectedPaper.topic)}&cu=INR`}
            alt="UPI QR"
            className="w-44 h-44 object-contain"
          />
        </div>
        <a href={`upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${selectedPaper.price || TEST_PRICE}&tn=${encodeURIComponent('SuprO TestO')}&cu=INR`}
          className="w-full py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl text-center text-sm transition">
          📲 Open UPI App Directly
        </a>
      </div>

      {/* Steps */}
      <div className="bg-[#0d1526] border border-violet-500/20 rounded-2xl p-5 space-y-3">
        <p className="text-white font-bold text-sm">After Payment:</p>
        {['Pay ₹22 to the UPI ID above', 'Note the Transaction ID / UTR', 'Enter UTR below and upload screenshot', 'Auto-verified in ~15 minutes'].map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400 text-xs font-bold shrink-0">{i + 1}</div>
            <p className="text-gray-400 text-sm">{step}</p>
          </div>
        ))}
      </div>

      {/* UTR Input */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Transaction ID / UTR Number *</label>
          <input type="text" value={utr} onChange={e => setUtr(e.target.value.toUpperCase())}
            placeholder="e.g. 402912345678 or UTR..."
            className="w-full bg-[#111c35] border border-violet-500/30 rounded-xl text-white px-4 py-3 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/40 transition font-mono text-sm placeholder:text-gray-600" />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Payment Screenshot *</label>
          <label className={`w-full border-2 border-dashed rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer transition ${screenshotPreview ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-violet-500/30 hover:border-violet-500/50 bg-[#111c35]'}`}>
            <input type="file" accept="image/*" className="hidden" onChange={handleScreenshot} />
            {screenshotPreview ? (
              <img src={screenshotPreview} alt="Screenshot" className="w-full max-h-40 object-contain rounded-lg" />
            ) : (
              <>
                <Upload className="w-8 h-8 text-violet-400" />
                <p className="text-gray-400 text-sm">Tap to upload screenshot</p>
                <p className="text-gray-600 text-xs">JPG, PNG accepted</p>
              </>
            )}
          </label>
        </div>

        <button onClick={submitPayment} disabled={!utr.trim() || submittingPayment || !screenshotFile}
          className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-violet-500/20">
          {submittingPayment ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
          Submit for Verification
        </button>
      </div>
    </div>
  );

  // ── PENDING (waiting for verify) ───────────────────────────────
  if (screen === 'pending') return (
    <div className="max-w-md mx-auto text-center space-y-6 py-10">
      <div className="w-24 h-24 rounded-full bg-amber-500/10 border-4 border-amber-500/30 flex items-center justify-center mx-auto animate-pulse">
        <Clock className="w-12 h-12 text-amber-400" />
      </div>
      <div>
        <h2 className="text-2xl font-black text-white mb-2">Payment Submitted!</h2>
        <p className="text-gray-400 text-sm">UTR: <span className="font-mono text-amber-400">{utr}</span></p>
        <p className="text-gray-400 text-sm mt-2">Auto-verifying every 10 seconds...</p>
      </div>
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 space-y-2 text-left">
        <p className="text-amber-400 font-bold text-sm">⏳ Verification in progress</p>
        <p className="text-gray-400 text-xs">Our system scans HDFC bank SMS/email every 5 minutes. Usually verified in 5–15 min during business hours.</p>
      </div>
      <div className="flex gap-3">
        <button onClick={() => setScreen('browse')} className="flex-1 py-3 border border-violet-500/30 text-violet-400 rounded-xl font-bold text-sm hover:bg-violet-500/10 transition">
          Browse More Tests
        </button>
        <button onClick={() => {
          fetch(`/api/testo/status?phone=${phone}&paper_id=${selectedPaper?.id}`)
            .then(r => r.json()).then(d => { if (d.status === 'verified') { setPaperStatus(prev => ({ ...prev, [selectedPaper!.id]: 'verified' })); setScreen('browse'); alert('✅ Verified!'); } else alert(`Status: ${d.status}. Please wait...`); });
        }} className="flex-1 py-3 bg-violet-500/20 border border-violet-500/30 text-violet-300 rounded-xl font-bold text-sm hover:bg-violet-500/30 transition flex items-center justify-center gap-1.5">
          <RefreshCw className="w-4 h-4" /> Check Now
        </button>
      </div>
    </div>
  );

  // ── TEST ───────────────────────────────────────────────────────
  if (screen === 'test' && selectedPaper) {
    const q = questions[currentQ];
    const opts = [
      { key: 'A', text: q?.option_a },
      { key: 'B', text: q?.option_b },
      { key: 'C', text: q?.option_c },
      { key: 'D', text: q?.option_d },
    ];
    const answered = Object.keys(answers).length;
    const pct = Math.round((answered / questions.length) * 100);
    const urgent = timeLeft < 120;

    return (
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between bg-[#0d1526] border border-violet-500/20 rounded-2xl px-5 py-3">
          <div>
            <p className="text-xs text-gray-500">{selectedPaper.topic}</p>
            <p className="text-white font-bold text-sm">Q {currentQ + 1} / {questions.length}</p>
          </div>
          <div className={`flex items-center gap-2 font-mono text-xl font-black ${urgent ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
            <Timer className="w-5 h-5" />
            {fmtTime(timeLeft)}
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">{answered}/{questions.length} answered</p>
            <p className="text-violet-400 font-bold text-sm">{pct}%</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-[#111c35] rounded-full overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full"
            animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} transition={{ duration: 0.3 }} />
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="bg-[#0d1526] border border-violet-500/20 rounded-2xl p-6 space-y-5">
            <p className="text-white font-medium text-base leading-relaxed">
              <span className="text-violet-400 font-black mr-2">Q{q?.question_no}.</span>
              {q?.question_text}
            </p>
            <div className="space-y-3">
              {opts.map(opt => {
                const selected = answers[q?.id] === opt.key;
                return (
                  <button key={opt.key} onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt.key }))}
                    className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all font-medium text-sm flex items-center gap-3 ${
                      selected
                        ? 'bg-violet-500/20 border-violet-500 text-white shadow-md shadow-violet-500/20'
                        : 'bg-[#111c35] border-violet-500/20 text-gray-300 hover:border-violet-500/40 hover:text-white'
                    }`}>
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shrink-0 ${
                      selected ? 'bg-violet-500 text-white' : 'bg-[#1a2540] text-gray-400'
                    }`}>{opt.key}</span>
                    {opt.text}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Nav */}
        <div className="flex gap-3">
          <button onClick={() => setCurrentQ(q => Math.max(0, q - 1))} disabled={currentQ === 0}
            className="flex-1 py-3 border border-violet-500/20 text-gray-400 rounded-xl font-bold text-sm hover:text-white transition disabled:opacity-30">
            ← Previous
          </button>
          {currentQ < questions.length - 1 ? (
            <button onClick={() => setCurrentQ(q => Math.min(questions.length - 1, q + 1))}
              className="flex-1 py-3 bg-violet-500/20 border border-violet-500/30 text-violet-300 rounded-xl font-bold text-sm hover:bg-violet-500/30 transition flex items-center justify-center gap-1.5">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={submitTest} disabled={submittingTest}
              className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-bold text-sm transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 disabled:opacity-50">
              {submittingTest ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ShieldCheck className="w-4 h-4" /> Submit Test</>}
            </button>
          )}
        </div>

        {/* Question jump grid */}
        <div className="bg-[#0d1526] border border-violet-500/10 rounded-2xl p-4">
          <p className="text-xs text-gray-500 mb-3 font-bold uppercase tracking-wider">Jump to Question</p>
          <div className="flex flex-wrap gap-2">
            {questions.map((qu, i) => (
              <button key={qu.id} onClick={() => setCurrentQ(i)}
                className={`w-9 h-9 rounded-lg text-xs font-bold transition ${
                  i === currentQ ? 'bg-violet-500 text-white' :
                  answers[qu.id] ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400' :
                  'bg-[#111c35] text-gray-500 border border-violet-500/10 hover:border-violet-500/30'
                }`}>
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── RESULTS ────────────────────────────────────────────────────
  if (screen === 'results' && resultSummary) {
    const { score, total_marks, percentage, passed, rank, certificate_eligible, attempt_id } = resultSummary;
    const correct = results.filter(r => r.is_correct).length;
    const wrong = results.filter(r => !r.is_correct && r.user_answer).length;
    const skipped = results.filter(r => !r.user_answer).length;

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Score card */}
        <div className={`relative rounded-3xl p-8 text-center overflow-hidden ${
          passed ? 'bg-gradient-to-br from-emerald-900/40 via-green-900/20 to-teal-900/30 border border-emerald-500/30'
                 : 'bg-gradient-to-br from-red-900/30 via-rose-900/20 to-orange-900/20 border border-red-500/30'
        }`}>
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            {[...Array(12)].map((_, i) => <Star key={i} className="absolute text-white" style={{ left: `${(i * 8 + 4)}%`, top: `${(i * 17) % 80 + 5}%`, width: '12px' }} />)}
          </div>
          <div className="relative z-10">
            <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-4 ${passed ? 'bg-emerald-500/20 border-4 border-emerald-500/50' : 'bg-red-500/20 border-4 border-red-500/50'}`}>
              {passed ? <Trophy className="w-12 h-12 text-emerald-400" /> : <XCircle className="w-12 h-12 text-red-400" />}
            </div>
            <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${passed ? 'text-emerald-400' : 'text-red-400'}`}>
              {passed ? '🎉 Congratulations!' : '😔 Better luck next time'}
            </p>
            <p className="text-6xl font-black text-white mb-1">{percentage}%</p>
            <p className="text-gray-400 text-sm">{score} / {total_marks} marks</p>
            <div className="flex justify-center gap-6 mt-5">
              <div><p className="text-2xl font-black text-emerald-400">{correct}</p><p className="text-gray-500 text-xs">Correct</p></div>
              <div><p className="text-2xl font-black text-red-400">{wrong}</p><p className="text-gray-500 text-xs">Wrong</p></div>
              <div><p className="text-2xl font-black text-gray-400">{skipped}</p><p className="text-gray-500 text-xs">Skipped</p></div>
              <div><p className="text-2xl font-black text-purple-400">#{rank}</p><p className="text-gray-500 text-xs">Your Rank</p></div>
            </div>
          </div>
        </div>

        {/* Certificate */}
        {certificate_eligible && selectedPaper && (
          <Certificate
            name={userName}
            topic={selectedPaper.topic}
            subject={selectedPaper.subject}
            score={score}
            total={total_marks}
            percentage={percentage}
            rank={rank}
            date={new Date().toISOString()}
          />
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={() => selectedPaper && loadLeaderboard(selectedPaper)}
            className="flex-1 py-3 border border-violet-500/30 text-violet-400 rounded-xl font-bold text-sm hover:bg-violet-500/10 transition flex items-center justify-center gap-2">
            <Trophy className="w-4 h-4" /> Leaderboard
          </button>
          <button onClick={() => setScreen('browse')}
            className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-purple-700 text-white rounded-xl font-bold text-sm hover:opacity-90 transition flex items-center justify-center gap-2">
            <BookOpen className="w-4 h-4" /> More Tests
          </button>
        </div>

        {/* Full Q&A breakdown */}
        <div className="space-y-4">
          <h3 className="font-black text-white text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-violet-400" /> Full Answer Review
          </h3>
          {results.map((r, i) => (
            <div key={i} className={`rounded-2xl border p-5 space-y-3 ${r.is_correct ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
              <div className="flex items-start justify-between gap-3">
                <p className="text-white text-sm font-medium flex-1">
                  <span className="text-gray-500 font-bold mr-1.5">Q{r.question_no}.</span>{r.question_text}
                </p>
                <span className={`shrink-0 text-xs font-bold px-2 py-1 rounded-full ${r.is_correct ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
                  {r.marks_obtained}/{r.marks}m
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {(['A', 'B', 'C', 'D'] as const).map(key => {
                  const optText = r[`option_${key.toLowerCase()}` as keyof ResultItem] as string;
                  const isCorrect = key === r.correct_answer;
                  const isUserWrong = key === r.user_answer && !isCorrect;
                  return (
                    <div key={key} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                      isCorrect ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300' :
                      isUserWrong ? 'bg-red-500/20 border border-red-500/40 text-red-300' :
                      'bg-[#111c35] border border-transparent text-gray-400'
                    }`}>
                      <span className="font-black shrink-0">{key}.</span>
                      <span className="truncate">{optText}</span>
                      {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 ml-auto shrink-0 text-emerald-400" />}
                      {isUserWrong && <XCircle className="w-3.5 h-3.5 ml-auto shrink-0 text-red-400" />}
                    </div>
                  );
                })}
              </div>

              {r.explanation && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-2.5">
                  <p className="text-blue-300 text-xs"><span className="font-bold">💡 Explanation: </span>{r.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── LEADERBOARD ────────────────────────────────────────────────
  if (screen === 'leaderboard' && selectedPaper) return (
    <div className="max-w-md mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => setScreen('browse')} className="p-2 rounded-xl bg-[#111c35] text-gray-400 hover:text-white transition">
          <X className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-400" /> Leaderboard</h2>
          <p className="text-gray-400 text-xs">{selectedPaper.topic}</p>
        </div>
      </div>

      {loadingLB ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-violet-500" /></div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No attempts yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((entry, i) => {
            const medals = ['🥇', '🥈', '🥉'];
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-4 rounded-2xl p-4 border ${
                  i === 0 ? 'bg-amber-500/10 border-amber-500/30' :
                  i === 1 ? 'bg-gray-500/10 border-gray-400/30' :
                  i === 2 ? 'bg-orange-500/10 border-orange-500/30' :
                  'bg-[#0d1526] border-violet-500/10'
                }`}>
                <span className="text-2xl w-8 text-center">{medals[i] || `#${i + 1}`}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm truncate">{entry.name}</p>
                  <p className="text-gray-500 text-xs">{entry.phone_masked}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-white font-black">{entry.score}/{entry.total_marks}</p>
                  <p className="text-violet-400 text-xs font-bold">{entry.percentage}%</p>
                  {entry.time_taken_seconds && <p className="text-gray-600 text-xs">{fmtTime(entry.time_taken_seconds)}</p>}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );

  return null;
}

export default function TestoPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    }>
      <TestoPageContent />
    </Suspense>
  );
}
