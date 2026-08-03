'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  BookOpen, Timer, Trophy, CheckCircle2, XCircle,
  RefreshCw, Loader2, BarChart3, Star, Zap, Globe, Database
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';

// ─── Types ─────────────────────────────────────────────────────────
interface Question {
  id?: string;
  question: string;
  options: string[];
  answer_idx: number;
  explanation?: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  source?: 'db' | 'api';
}

interface ScoreRow {
  id: string;
  user_id: string;
  subject: string;
  score: number;
  total: number;
  taken_at: string;
  profiles?: { full_name: string; phone: string };
}

// ─── Tamil subject seed questions ──────────────────────────────────
const SEED_QUESTIONS: Omit<Question, 'id'>[] = [
  { question: 'தமிழ்நாட்டின் தலைநகரம் எது?', options: ['மதுரை', 'சென்னை', 'கோயம்புத்தூர்', 'திருச்சி'], answer_idx: 1, explanation: 'சென்னை தமிழ்நாட்டின் தலைநகரமும் மிகப்பெரிய நகரமும் ஆகும்.', subject: 'General Knowledge', difficulty: 'easy' },
  { question: 'இந்தியாவின் தேசிய பறவை எது?', options: ['கழுகு', 'மயில்', 'குயில்', 'கருடன்'], answer_idx: 1, explanation: 'மயில் இந்தியாவின் தேசிய பறவையாகும்.', subject: 'General Knowledge', difficulty: 'easy' },
  { question: 'நீர் எந்த வெப்பநிலையில் கொதிக்கும்?', options: ['80°C', '90°C', '100°C', '110°C'], answer_idx: 2, explanation: 'தரைமட்ட அழுத்தத்தில் நீர் 100°C வெப்பநிலையில் கொதிக்கும்.', subject: 'Science', difficulty: 'easy' },
  { question: 'ஒளியின் வேகம் எவ்வளவு?', options: ['2×10⁸ m/s', '3×10⁸ m/s', '4×10⁸ m/s', '1×10⁸ m/s'], answer_idx: 1, explanation: 'ஒளியின் வேகம் வெற்றிடத்தில் சுமார் 3×10⁸ m/s ஆகும்.', subject: 'Science', difficulty: 'medium' },
  { question: 'இந்தியாவில் எத்தனை மாநிலங்கள் உள்ளன?', options: ['25', '26', '28', '29'], answer_idx: 2, explanation: 'இந்தியாவில் 28 மாநிலங்களும் 8 யூனியன் பிரதேசங்களும் உள்ளன.', subject: 'General Knowledge', difficulty: 'medium' },
  { question: 'தமிழ் இலக்கியத்தின் முதல் காவியம் எது?', options: ['சிலப்பதிகாரம்', 'மணிமேகலை', 'கம்பராமாயணம்', 'திருக்குறள்'], answer_idx: 0, explanation: 'சிலப்பதிகாரம் தமிழ் இலக்கியத்தின் ஐம்பெருங்காப்பியங்களில் முதலாவது.', subject: 'Tamil', difficulty: 'medium' },
  { question: 'TNPSC Group 2 தேர்வை யார் நடத்துகிறார்கள்?', options: ['UPSC', 'TNPSC', 'SSC', 'IBPS'], answer_idx: 1, explanation: 'Tamil Nadu Public Service Commission (TNPSC) Group 2 தேர்வை நடத்துகிறது.', subject: 'TNPSC', difficulty: 'easy' },
  { question: 'பூமியின் மொத்த பரப்பளவு எவ்வளவு?', options: ['400 மில்லியன் km²', '510 மில்லியன் km²', '610 மில்லியன் km²', '300 மில்லியன் km²'], answer_idx: 1, explanation: 'பூமியின் மொத்த பரப்பளவு சுமார் 510 மில்லியன் km² ஆகும்.', subject: 'Science', difficulty: 'hard' },
  { question: 'இந்திய அரசியலமைப்பின் தந்தை யார்?', options: ['மகாத்மா காந்தி', 'ஜவஹர்லால் நேரு', 'B.R. அம்பேத்கர்', 'சர்தார் படேல்'], answer_idx: 2, explanation: 'Dr. B.R. அம்பேத்கர் இந்திய அரசியலமைப்பின் தந்தை என அழைக்கப்படுகிறார்.', subject: 'TNPSC', difficulty: 'easy' },
  { question: 'ஒரு ஏக்கர் என்பது எத்தனை சதுர அடி?', options: ['23,560', '43,560', '53,560', '33,560'], answer_idx: 1, explanation: 'ஒரு ஏக்கர் = 43,560 சதுர அடி அல்லது 4047 சதுர மீட்டர்.', subject: 'Agriculture', difficulty: 'medium' },
];

const SUBJECTS = ['All', 'General Knowledge', 'Science', 'Tamil', 'TNPSC', 'Agriculture'];
const DIFFICULTIES = ['All', 'easy', 'medium', 'hard'];
const DIFF_COLORS = { easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', medium: 'text-amber-400 bg-amber-500/10 border-amber-500/30', hard: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
const TIMER_SEC = 15; // seconds per question

// ─── Fetch from OpenTDB (free, no key) ─────────────────────────────
async function fetchOpenTDB(amount = 5, category = 9): Promise<Question[]> {
  try {
    const res = await fetch(`https://opentdb.com/api.php?amount=${amount}&type=multiple&category=${category}`);
    const json = await res.json();
    if (json.response_code !== 0) return [];
    return json.results.map((q: any) => {
      const wrong = q.incorrect_answers;
      const answerIdx = Math.floor(Math.random() * 4);
      const options = [...wrong];
      options.splice(answerIdx, 0, q.correct_answer);
      return {
        question: q.question.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&'),
        options: options.map((o: string) => o.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&')),
        answer_idx: answerIdx,
        explanation: `Correct answer: ${q.correct_answer}`,
        subject: 'English GK (OpenTDB)',
        difficulty: q.difficulty as 'easy' | 'medium' | 'hard',
        source: 'api' as const,
      };
    });
  } catch { return []; }
}

export default function TestOPage() {
  const { user, profile } = useAuth();
  const supabase = createClient();

  // ── State ───────────────────────────────────────────────────────
  const [tab, setTab] = useState<'browse' | 'test' | 'scores'>('browse');
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [apiQuestions, setApiQuestions] = useState<Question[]>([]);
  const [scores, setScores] = useState<ScoreRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [scoresLoading, setScoresLoading] = useState(false);
  const [subject, setSubject] = useState('All');
  const [difficulty, setDifficulty] = useState('All');

  // Test mode state
  const [testQuestions, setTestQuestions] = useState<Question[]>([]);
  const [testStarted, setTestStarted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [results, setResults] = useState<{ q: Question; chosen: number; correct: boolean }[]>([]);
  const [testDone, setTestDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_SEC);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [apiLoading, setApiLoading] = useState(false);

  // ── Load DB questions ───────────────────────────────────────────
  const loadQuestions = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('question_bank').select('*').order('created_at', { ascending: false });
    if (data && data.length > 0) {
      setAllQuestions(data as Question[]);
    } else {
      const { data: seeded } = await supabase.from('question_bank').insert(SEED_QUESTIONS).select();
      setAllQuestions((seeded || []) as Question[]);
    }
    setLoading(false);
  }, []);

  // ── Load leaderboard ────────────────────────────────────────────
  const loadScores = useCallback(async () => {
    setScoresLoading(true);
    const { data } = await supabase
      .from('test_scores')
      .select('*, profiles(full_name, phone)')
      .order('score', { ascending: false })
      .limit(20);
    setScores((data || []) as ScoreRow[]);
    setScoresLoading(false);
  }, []);

  useEffect(() => { loadQuestions(); }, [loadQuestions]);
  useEffect(() => { if (tab === 'scores') loadScores(); }, [tab, loadScores]);

  // ── Filtered questions ──────────────────────────────────────────
  const filtered = allQuestions.filter(q => {
    const matchSub = subject === 'All' || q.subject === subject;
    const matchDiff = difficulty === 'All' || q.difficulty === difficulty;
    return matchSub && matchDiff;
  });

  // ── Start test ──────────────────────────────────────────────────
  const startTest = async (useApi = false) => {
    let questions: Question[] = [];
    if (useApi) {
      setApiLoading(true);
      const api = await fetchOpenTDB(10);
      setApiQuestions(api);
      questions = api;
      setApiLoading(false);
    } else {
      const pool = filtered.length >= 10 ? filtered : allQuestions;
      questions = [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(10, pool.length));
    }
    if (!questions.length) return;
    setTestQuestions(questions);
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setAnswered(false);
    setResults([]);
    setTestDone(false);
    setTestStarted(true);
    setTimeLeft(TIMER_SEC);
  };

  // ── Timer ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!testStarted || answered || testDone) return;
    timerRef.current = setTimeout(() => {
      if (!answered) handleAnswer(-1); // auto-skip on timeout
    }, TIMER_SEC * 1000);
    const interval = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
    return () => { clearTimeout(timerRef.current!); clearInterval(interval); };
  }, [testStarted, currentIdx, answered, testDone]);

  const handleAnswer = (idx: number) => {
    if (answered) return;
    clearTimeout(timerRef.current!);
    setSelectedAnswer(idx);
    setAnswered(true);
    const q = testQuestions[currentIdx];
    setResults(prev => [...prev, { q, chosen: idx, correct: idx === q.answer_idx }]);
  };

  const handleNext = () => {
    if (currentIdx + 1 >= testQuestions.length) {
      finishTest();
    } else {
      setCurrentIdx(i => i + 1);
      setSelectedAnswer(null);
      setAnswered(false);
      setTimeLeft(TIMER_SEC);
    }
  };

  const finishTest = async () => {
    setTestDone(true);
    setTestStarted(false);
    const score = results.filter(r => r.correct).length + (results.length < testQuestions.length && results[results.length - 1]?.correct ? 0 : 0);
    const finalScore = results.filter(r => r.correct).length;
    // Save score to DB
    if (user?.id) {
      await supabase.from('test_scores').insert({
        user_id: user.id,
        subject: subject === 'All' ? 'Mixed' : subject,
        score: finalScore,
        total: testQuestions.length,
      });
    }
  };

  const resetTest = () => {
    setTestStarted(false);
    setTestDone(false);
    setResults([]);
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setAnswered(false);
  };

  // ── Score pct ───────────────────────────────────────────────────
  const scoreCount = results.filter(r => r.correct).length;
  const scorePct = testQuestions.length ? Math.round((scoreCount / testQuestions.length) * 100) : 0;
  const currentQ = testQuestions[currentIdx];
  const timerPct = (timeLeft / TIMER_SEC) * 100;

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-950/80 via-slate-900 to-pink-950/80 border border-purple-500/30 rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <span className="p-2.5 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-xl"><BookOpen className="w-6 h-6" /></span>
          <div>
            <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-rose-300">TestO • போட்டித் தேர்வு பயிற்சி</h1>
            <p className="text-xs text-slate-400">Tamil DB questions + OpenTDB live API + Supabase leaderboard</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Database className="h-3.5 w-3.5 text-purple-400" />{allQuestions.length} Questions
          <Globe className="h-3.5 w-3.5 text-cyan-400 ml-2" />OpenTDB API
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'browse', label: '📚 Questions', icon: BookOpen },
          { id: 'test',   label: '⚡ Start Test', icon: Zap },
          { id: 'scores', label: '🏆 Leaderboard', icon: Trophy },
        ].map(t => (
          <button key={t.id} onClick={() => { setTab(t.id as any); resetTest(); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${tab === t.id ? 'bg-purple-500 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Browse Tab ── */}
      {tab === 'browse' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map(s => (
              <button key={s} onClick={() => setSubject(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${subject === s ? 'bg-purple-500 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'}`}>{s}</button>
            ))}
            <span className="text-slate-600 mx-1">|</span>
            {DIFFICULTIES.map(d => (
              <button key={d} onClick={() => setDifficulty(d)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition capitalize ${difficulty === d ? 'bg-pink-500 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'}`}>{d}</button>
            ))}
          </div>
          {loading ? <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-purple-400" /></div> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((q, i) => (
                <div key={q.id || i} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">{q.subject}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${DIFF_COLORS[q.difficulty]}`}>{q.difficulty}</span>
                  </div>
                  <p className="text-sm font-bold text-white" dangerouslySetInnerHTML={{ __html: q.question }} />
                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map((opt, idx) => (
                      <div key={idx} className={`p-2 rounded-lg text-xs border ${idx === q.answer_idx ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
                        {String.fromCharCode(65 + idx)}. <span dangerouslySetInnerHTML={{ __html: opt }} />
                      </div>
                    ))}
                  </div>
                  {q.explanation && <p className="text-[10px] text-slate-400 italic border-t border-slate-800 pt-2">💡 {q.explanation}</p>}
                </div>
              ))}
              {filtered.length === 0 && <p className="text-slate-500 text-sm col-span-2 text-center py-10">No questions in this category.</p>}
            </div>
          )}
        </div>
      )}

      {/* ── Test Tab ── */}
      {tab === 'test' && (
        <div className="max-w-2xl mx-auto space-y-5">
          {!testStarted && !testDone && (
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-bold text-white">தேர்வு தொடங்கு (Start Test)</h2>
                <p className="text-xs text-slate-400">10 questions • {TIMER_SEC} seconds each • Score saved to leaderboard</p>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2 flex-wrap">
                    {SUBJECTS.map(s => (
                      <button key={s} onClick={() => setSubject(s)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${subject === s ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>{s}</button>
                    ))}
                  </div>
                  <button onClick={() => startTest(false)}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-sm flex items-center justify-center gap-2 hover:opacity-90 transition">
                    <Zap className="h-5 w-5" /> தமிழ் கேள்விகளுடன் தேர்வு (Tamil Questions)
                  </button>
                  <button onClick={() => startTest(true)} disabled={apiLoading}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-700 to-blue-700 text-white font-black text-sm flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-60">
                    {apiLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Globe className="h-5 w-5" />}
                    OpenTDB Live English GK Test
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Active question */}
          {testStarted && currentQ && (
            <div className="space-y-4">
              {/* Progress & Timer */}
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>கேள்வி {currentIdx + 1} / {testQuestions.length}</span>
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-amber-400" />
                  <span className={`font-black text-base ${timeLeft <= 5 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`}>{timeLeft}s</span>
                </div>
              </div>
              {/* Timer bar */}
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-1000 ${timeLeft > 10 ? 'bg-emerald-400' : timeLeft > 5 ? 'bg-amber-400' : 'bg-rose-400'}`} style={{ width: `${timerPct}%` }} />
              </div>
              {/* Score so far */}
              <div className="flex items-center gap-2 text-xs text-slate-400">
                {Array.from({ length: testQuestions.length }).map((_, i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full ${i < results.length ? (results[i].correct ? 'bg-emerald-400' : 'bg-rose-400') : 'bg-slate-800'}`} />
                ))}
              </div>
              {/* Question card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">{currentQ.subject}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${DIFF_COLORS[currentQ.difficulty]}`}>{currentQ.difficulty}</span>
                </div>
                <p className="text-base font-bold text-white leading-relaxed" dangerouslySetInnerHTML={{ __html: currentQ.question }} />
                <div className="grid grid-cols-1 gap-3">
                  {currentQ.options.map((opt, idx) => {
                    let cls = 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 cursor-pointer';
                    if (answered) {
                      if (idx === currentQ.answer_idx) cls = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
                      else if (idx === selectedAnswer) cls = 'bg-rose-500/20 border-rose-500 text-rose-300';
                      else cls = 'bg-slate-800 border-slate-700 text-slate-500';
                    } else if (selectedAnswer === idx) {
                      cls = 'bg-purple-500/20 border-purple-500 text-purple-300';
                    }
                    return (
                      <button key={idx} onClick={() => handleAnswer(idx)} disabled={answered}
                        className={`w-full p-3.5 rounded-xl border text-left text-sm transition flex items-center gap-3 ${cls}`}>
                        <span className="font-black text-lg">{String.fromCharCode(65 + idx)}</span>
                        <span dangerouslySetInnerHTML={{ __html: opt }} />
                        {answered && idx === currentQ.answer_idx && <CheckCircle2 className="h-4 w-4 ml-auto shrink-0 text-emerald-400" />}
                        {answered && idx === selectedAnswer && idx !== currentQ.answer_idx && <XCircle className="h-4 w-4 ml-auto shrink-0 text-rose-400" />}
                      </button>
                    );
                  })}
                </div>
                {answered && currentQ.explanation && (
                  <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-xs text-blue-300">
                    💡 {currentQ.explanation}
                  </div>
                )}
                {answered && (
                  <button onClick={handleNext} className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-sm transition">
                    {currentIdx + 1 < testQuestions.length ? 'அடுத்த கேள்வி →' : '🏁 முடிவுகள் காண'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Results screen */}
          {testDone && (
            <div className="space-y-5">
              <div className={`p-8 rounded-3xl text-center space-y-3 border ${scorePct >= 70 ? 'bg-emerald-950/60 border-emerald-500/40' : scorePct >= 40 ? 'bg-amber-950/60 border-amber-500/40' : 'bg-rose-950/60 border-rose-500/40'}`}>
                <p className="text-6xl font-black">{scorePct >= 70 ? '🏆' : scorePct >= 40 ? '👍' : '📖'}</p>
                <h2 className="text-3xl font-black text-white">{scoreCount} / {results.length}</h2>
                <p className={`text-lg font-bold ${scorePct >= 70 ? 'text-emerald-400' : scorePct >= 40 ? 'text-amber-400' : 'text-rose-400'}`}>{scorePct}%</p>
                <p className="text-sm text-slate-400">{scorePct >= 70 ? 'Excellent! மிகவும் நன்று!' : scorePct >= 40 ? 'Good effort! மேலும் பயிற்சி செய்!' : 'Keep practicing! முயற்சி செய்!'}</p>
                {user?.id && <p className="text-xs text-emerald-400">✓ Score saved to leaderboard</p>}
              </div>
              {/* Answer review */}
              <div className="space-y-3">
                {results.map((r, i) => (
                  <div key={i} className={`p-4 rounded-xl border text-xs space-y-2 ${r.correct ? 'bg-emerald-950/40 border-emerald-500/30' : 'bg-rose-950/40 border-rose-500/30'}`}>
                    <div className="flex items-center gap-2">
                      {r.correct ? <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /> : <XCircle className="h-4 w-4 text-rose-400 shrink-0" />}
                      <p className="font-bold text-white" dangerouslySetInnerHTML={{ __html: r.q.question }} />
                    </div>
                    {!r.correct && <p className="text-emerald-400">✓ சரியான விடை: <span dangerouslySetInnerHTML={{ __html: r.q.options[r.q.answer_idx] }} /></p>}
                    {r.q.explanation && <p className="text-slate-400 italic">💡 {r.q.explanation}</p>}
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={resetTest} className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-sm transition">மீண்டும் தேர்வு (Retry)</button>
                <button onClick={() => { setTab('scores'); resetTest(); }} className="flex-1 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-sm transition">🏆 Leaderboard</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Leaderboard Tab ── */}
      {tab === 'scores' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2"><Trophy className="h-5 w-5 text-amber-400" /> Top Scorers</h2>
            <button onClick={loadScores} className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white"><RefreshCw className="h-4 w-4" /></button>
          </div>
          {scoresLoading ? <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-amber-400" /></div> : (
            <div className="space-y-2">
              {scores.length === 0 && <p className="text-slate-500 text-sm text-center py-10">No scores yet. Be the first to play!</p>}
              {scores.map((s, i) => {
                const pct = Math.round((s.score / s.total) * 100);
                return (
                  <div key={s.id} className={`flex items-center gap-4 p-4 rounded-xl border ${i === 0 ? 'bg-amber-500/10 border-amber-500/30' : i === 1 ? 'bg-slate-500/10 border-slate-500/30' : i === 2 ? 'bg-orange-800/10 border-orange-700/30' : 'bg-slate-900 border-slate-800'}`}>
                    <span className="text-xl font-black text-slate-400 w-6 text-center">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{(s.profiles as any)?.full_name || 'Anonymous'}</p>
                      <p className="text-xs text-slate-400">{s.subject} • {new Date(s.taken_at).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-black text-white">{s.score}/{s.total}</p>
                      <p className={`text-xs font-bold ${pct >= 70 ? 'text-emerald-400' : pct >= 40 ? 'text-amber-400' : 'text-rose-400'}`}>{pct}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
