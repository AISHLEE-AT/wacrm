'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen, Zap, CheckCircle2, Lock, ChevronRight, Play,
  Sparkles, Target, Award, Clock, Flame, FileText, Brain,
  ChevronDown, ChevronUp, Loader2, RefreshCw
} from 'lucide-react';

import crashPlanData from '../../lib/dailyCoursePlans/tnpsc_group2_25day_crash_plan.json';

// ── Types ───────────────────────────────────────────────────────────
interface DayTask {
  taskType: string;
  subject: string;
  topic: string;
  topicTamil?: string;
  durationMinutes: number;
}

interface CrashPlanDay {
  dayNumber: number;
  blockNumber?: number;
  phaseTitle: string;
  themeTitle: string;
  totalDurationMins: number;
  tasks: DayTask[];
}

interface TopicContent {
  topicTitle: string;
  subject?: string;
  overview?: string;
  tamilExplanation?: any;
  learningObjectives?: string[];
  coreConcepts?: Array<{ heading: string; content: string; example?: string }>;
  studyNotes?: Array<{ sectionTitle: string; content: string }>;
  formulasAndMnemonics?: Array<{ name: string; formula: string; mnemonic?: string }> | string[];
  flashcards?: Array<{ front: string; back: string }>;
  mcqs?: Array<{ id: string; question: string; options: string[]; correctAnswer: number; explanation: string }>;
  vsaqs?: Array<{ question: string; answer: string; marks?: number }>;
  bedtimeRecap?: string;
}

// ── Component ───────────────────────────────────────────────────────
export const TNPSCGroup2StudyHub: React.FC<{
  onOpenTest: () => void;
  onOpenExplainer: (day: number) => void;
}> = ({ onOpenTest, onOpenExplainer }) => {
  const [crashPlan, setCrashPlan] = useState<CrashPlanDay[]>(crashPlanData as CrashPlanDay[]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [activeTopicKey, setActiveTopicKey] = useState<string | null>(null);
  const [topicContent, setTopicContent] = useState<TopicContent | null>(null);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [isGeneratingTest, setIsGeneratingTest] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());
  const [activeView, setActiveView] = useState<'plan' | 'study' | 'test'>('plan');

  // Test state
  const [testQuestions, setTestQuestions] = useState<any[]>([]);
  const [testAnswers, setTestAnswers] = useState<Record<number, string>>({});
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [testScore, setTestScore] = useState(0);

  // Load progress
  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = () => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('tnpsc_g2_completed_topics');
      if (saved) setCompletedTopics(new Set(JSON.parse(saved)));
    } catch {}
  };

  const saveProgress = useCallback((topics: Set<string>) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('tnpsc_g2_completed_topics', JSON.stringify([...topics]));
  }, []);

  const markTopicComplete = (topicKey: string) => {
    const next = new Set(completedTopics);
    next.add(topicKey);
    setCompletedTopics(next);
    saveProgress(next);
  };

  // ── AI Content Generation ─────────────────────────────────────────
  const generateContent = async (day: CrashPlanDay, task: DayTask) => {
    const key = `d${day.dayNumber}_${task.subject}`;
    setActiveTopicKey(key);
    setActiveView('study');
    setIsGeneratingContent(true);
    setContentError(null);
    setTopicContent(null);

    try {
      const res = await fetch('/api/tnpsc-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayNumber: day.dayNumber,
          topicTitle: task.topic,
          subject: task.subject,
          courseId: 'tnpsc-group2',
        }),
      });

      const data = await res.json();
      if (data.success && data.content) {
        setTopicContent(data.content);
      } else {
        setContentError(data.error || 'Failed to generate content. Please try again.');
      }
    } catch (err: any) {
      setContentError(err.message || 'Network error');
    } finally {
      setIsGeneratingContent(false);
    }
  };

  // ── AI Test Generation ─────────────────────────────────────────────
  const generateTest = async (topicTitle: string, subject: string, dayNumber: number) => {
    setActiveView('test');
    setIsGeneratingTest(true);
    setTestQuestions([]);
    setTestAnswers({});
    setTestSubmitted(false);
    setTestScore(0);

    try {
      // Pass notes context if available
      const notesContext = topicContent?.coreConcepts?.map(c => c.content).join('\n') || '';

      const res = await fetch('/api/tnpsc-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayNumber,
          topicTitle,
          subject,
          count: 10,
          notesContext,
        }),
      });

      const data = await res.json();
      if (data.success && data.questions?.length) {
        setTestQuestions(data.questions);
      }
    } catch {}
    setIsGeneratingTest(false);
  };

  const handleTestSubmit = () => {
    let score = 0;
    testQuestions.forEach((q: any, i: number) => {
      if (testAnswers[i] === q.correct_option) score++;
    });
    setTestScore(score);
    setTestSubmitted(true);
  };

  // ── Progress Stats ─────────────────────────────────────────────────
  const totalTopics = crashPlan.reduce((sum, d) => sum + d.tasks.filter(t => t.taskType !== 'quiz').length, 0);
  const doneTopics = completedTopics.size;
  const progressPct = totalTopics > 0 ? Math.round((doneTopics / totalTopics) * 100) : 0;

  const getPhaseColor = (phase: string) => {
    if (phase.includes('Foundation')) return 'emerald';
    if (phase.includes('Core Surge')) return 'sky';
    if (phase.includes('Total Coverage')) return 'amber';
    if (phase.includes('Grand Mock')) return 'red';
    return 'indigo';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground font-bold">Loading TNPSC Group 2 Study Plan...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── HERO BANNER ─────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-indigo-950/60 via-purple-950/40 to-slate-950/60 border border-indigo-500/30 rounded-3xl p-5 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] uppercase font-black tracking-wider px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                🏛️ TNPSC GROUP 2 & 2A
              </span>
              <span className="text-[10px] uppercase font-black tracking-wider px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                25-DAY CENTUM PLAN
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white">
              TNPSC Group 2 Centum Crash Course
            </h1>
            <p className="text-xs text-indigo-200/70 mt-1">
              Combined Civil Services (Prelims) — 200 Qs • 300 Marks • 3 Hours • AI-Powered Content & Tests
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Progress Ring */}
            <div className="relative w-16 h-16 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-700/50" />
                <circle
                  cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="2.5"
                  className="text-indigo-400"
                  strokeDasharray={`${progressPct * 0.94} 94`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-indigo-300">
                {progressPct}%
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-black text-white">{doneTopics}/{totalTopics}</div>
              <div className="text-[10px] text-indigo-300/60 font-bold uppercase">Topics Done</div>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
          <button
            onClick={() => setActiveView('plan')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeView === 'plan' ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/40' : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700/30'
            }`}
          >
            <Target className="w-3.5 h-3.5" /> 25-Day Plan
          </button>
          <button
            onClick={() => setActiveView('study')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeView === 'study' ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700/30'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Study Notes
          </button>
          <button
            onClick={() => setActiveView('test')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeView === 'test' ? 'bg-sky-500/30 text-sky-300 border border-sky-500/40' : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700/30'
            }`}
          >
            <Zap className="w-3.5 h-3.5" /> Online Test
          </button>
          <button
            onClick={onOpenTest}
            className="px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white border border-violet-500/30 hover:opacity-90 transition-all"
          >
            <Flame className="w-3.5 h-3.5" /> Full Mock CBT
          </button>
        </div>
      </div>

      {/* ── VIEW: 25-DAY PLAN ───────────────────────────────────── */}
      {activeView === 'plan' && (
        <div className="space-y-3">
          {crashPlan.map((day) => {
            const color = getPhaseColor(day.phaseTitle);
            const isExpanded = expandedDay === day.dayNumber;
            const dayTasks = day.tasks.filter(t => t.taskType !== 'quiz');
            const dayDone = dayTasks.every(t => completedTopics.has(`d${day.dayNumber}_${t.subject}`));

            return (
              <div key={day.dayNumber} className="bg-card border border-border/60 rounded-2xl overflow-hidden">
                {/* Day Header */}
                <button
                  onClick={() => setExpandedDay(isExpanded ? null : day.dayNumber)}
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                      dayDone
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : `bg-${color}-500/20 text-${color}-400`
                    }`}>
                      {dayDone ? <CheckCircle2 className="w-5 h-5" /> : `D${day.dayNumber}`}
                    </div>
                    <div className="text-left min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-black text-foreground">Day {day.dayNumber}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold bg-${color}-500/15 text-${color}-400 border border-${color}-500/25`}>
                          {day.phaseTitle}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium">
                          <Clock className="w-3 h-3 inline mr-0.5" />{day.totalDurationMins} min
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{day.themeTitle}</p>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
                </button>

                {/* Tasks */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-2">
                    {day.tasks.map((task, idx) => {
                      const topicKey = `d${day.dayNumber}_${task.subject}`;
                      const isDone = completedTopics.has(topicKey);
                      const isQuiz = task.taskType === 'quiz';

                      return (
                        <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                          isDone
                            ? 'bg-emerald-950/20 border-emerald-500/20'
                            : 'bg-muted/20 border-border/40 hover:border-primary/40'
                        }`}>
                          {/* Status */}
                          <button
                            onClick={() => isDone ? null : markTopicComplete(topicKey)}
                            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border ${
                              isDone
                                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                                : 'border-slate-600 hover:border-primary/60'
                            }`}
                          >
                            {isDone && <CheckCircle2 className="w-4 h-4" />}
                          </button>

                          {/* Task Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-primary/10 text-primary rounded">
                                {task.subject.slice(0, 30)}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {task.durationMinutes} min
                              </span>
                            </div>
                            <p className={`text-xs font-semibold mt-0.5 line-clamp-2 ${isDone ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                              {task.topic}
                            </p>
                            {task.topicTamil && (
                              <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{task.topicTamil}</p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {!isQuiz && (
                              <button
                                onClick={() => generateContent(day, task)}
                                className="px-2.5 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors border border-emerald-500/20"
                              >
                                <Sparkles className="w-3 h-3" /> Study
                              </button>
                            )}
                            <button
                              onClick={() => isQuiz ? onOpenTest() : generateTest(task.topic, task.subject, day.dayNumber)}
                              className="px-2.5 py-1.5 bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors border border-sky-500/20"
                            >
                              <Zap className="w-3 h-3" /> Test
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── VIEW: STUDY NOTES ───────────────────────────────────── */}
      {activeView === 'study' && (
        <div className="bg-card border border-border/60 rounded-3xl p-5 md:p-6">
          {isGeneratingContent ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="relative">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <Sparkles className="w-4 h-4 text-amber-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <p className="text-sm font-bold text-foreground">AI is generating detailed study notes...</p>
              <p className="text-xs text-muted-foreground">Using Gemini AI with TNPSC exam patterns</p>
            </div>
          ) : contentError ? (
            <div className="text-center py-16">
              <p className="text-sm text-red-400 font-bold mb-3">{contentError}</p>
              <button onClick={() => setActiveView('plan')} className="px-4 py-2 bg-primary/20 text-primary rounded-xl text-xs font-bold">
                ← Back to Plan
              </button>
            </div>
          ) : topicContent ? (
            <div className="space-y-6">
              {/* Topic Header */}
              <div>
                <button onClick={() => setActiveView('plan')} className="text-xs text-muted-foreground hover:text-primary font-bold mb-2 flex items-center gap-1">
                  ← Back to 25-Day Plan
                </button>
                <h2 className="text-lg md:text-xl font-black text-foreground">{topicContent.topicTitle}</h2>
                {topicContent.overview && <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{topicContent.overview}</p>}
              </div>

              {/* Tamil Explanation */}
              {topicContent.tamilExplanation && (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
                  <h3 className="text-sm font-black text-amber-400 mb-2">📝 தமிழ் விளக்கம்</h3>
                  {topicContent.tamilExplanation.colloquialIntro && (
                    <p className="text-sm text-amber-200/80">{topicContent.tamilExplanation.colloquialIntro}</p>
                  )}
                  {topicContent.tamilExplanation.keyPointsTamil?.map((pt: string, i: number) => (
                    <p key={i} className="text-xs text-amber-200/60 mt-1">• {pt}</p>
                  ))}
                </div>
              )}

              {/* Learning Objectives */}
              {topicContent.learningObjectives?.length && (
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
                  <h3 className="text-sm font-black text-primary mb-2">🎯 Learning Objectives</h3>
                  {topicContent.learningObjectives.map((obj, i) => (
                    <p key={i} className="text-xs text-muted-foreground mt-1">✅ {obj}</p>
                  ))}
                </div>
              )}

              {/* Core Concepts */}
              {topicContent.coreConcepts?.map((concept, i) => (
                <div key={i} className="bg-muted/20 border border-border/40 rounded-2xl p-4 space-y-2">
                  <h3 className="text-sm font-black text-foreground">{concept.heading}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{concept.content}</p>
                  {concept.example && (
                    <div className="bg-sky-500/5 border border-sky-500/15 rounded-xl p-3 mt-2">
                      <span className="text-[10px] font-bold text-sky-400 uppercase">Example:</span>
                      <p className="text-xs text-sky-200/70 mt-1">{concept.example}</p>
                    </div>
                  )}
                </div>
              ))}

              {/* Study Notes */}
              {topicContent.studyNotes?.map((note, i) => (
                <div key={i} className="space-y-1">
                  <h4 className="text-xs font-black text-foreground">{note.sectionTitle}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{note.content}</p>
                </div>
              ))}

              {/* Formulas & Mnemonics */}
              {topicContent.formulasAndMnemonics?.length && (
                <div className="bg-violet-500/5 border border-violet-500/20 rounded-2xl p-4">
                  <h3 className="text-sm font-black text-violet-400 mb-2">📐 Formulas & Mnemonics</h3>
                  {topicContent.formulasAndMnemonics.map((item: any, i: number) => (
                    <div key={i} className="mb-2">
                      {typeof item === 'string' ? (
                        <p className="text-xs text-violet-200/70">{item}</p>
                      ) : (
                        <>
                          <p className="text-xs font-bold text-violet-300">{item.name}: <span className="font-mono">{item.formula}</span></p>
                          {item.mnemonic && <p className="text-[11px] text-violet-200/50 italic">💡 {item.mnemonic}</p>}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Flashcards */}
              {topicContent.flashcards?.length && (
                <div>
                  <h3 className="text-sm font-black text-foreground mb-3">🃏 Flashcards ({topicContent.flashcards.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {topicContent.flashcards.map((card, i) => (
                      <FlashCard key={i} front={card.front} back={card.back} />
                    ))}
                  </div>
                </div>
              )}

              {/* Practice MCQs from Notes */}
              {topicContent.mcqs?.length && (
                <div>
                  <h3 className="text-sm font-black text-foreground mb-3">📝 Quick Practice Quiz ({topicContent.mcqs.length} Qs)</h3>
                  {topicContent.mcqs.map((q: any, i: number) => (
                    <InlineQuiz key={i} question={q} index={i} />
                  ))}
                </div>
              )}

              {/* VSAQs */}
              {topicContent.vsaqs?.length && (
                <div>
                  <h3 className="text-sm font-black text-foreground mb-3">✏️ Model Q&A</h3>
                  {topicContent.vsaqs.map((q: any, i: number) => (
                    <div key={i} className="mb-3 bg-muted/20 border border-border/30 rounded-xl p-3">
                      <p className="text-xs font-bold text-foreground">Q{i+1}: {q.question} <span className="text-primary">({q.marks || 2} marks)</span></p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{q.answer}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Bedtime Recap */}
              {topicContent.bedtimeRecap && (
                <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-2xl p-4">
                  <h3 className="text-sm font-black text-indigo-300 mb-2">🌙 Bedtime Recap — Quick Revision</h3>
                  <p className="text-xs text-indigo-200/60 leading-relaxed whitespace-pre-wrap">{topicContent.bedtimeRecap}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-2">
                {activeTopicKey && (
                  <button
                    onClick={() => markTopicComplete(activeTopicKey)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark Complete & Next Topic
                  </button>
                )}
                <button
                  onClick={() => generateTest(topicContent.topicTitle, topicContent.subject || '', 0)}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Zap className="w-3.5 h-3.5" /> Take Test on This Topic
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-bold">Click "Study" on any topic in the plan to load AI-generated study notes.</p>
            </div>
          )}
        </div>
      )}

      {/* ── VIEW: ONLINE TEST ───────────────────────────────────── */}
      {activeView === 'test' && (
        <div className="bg-card border border-border/60 rounded-3xl p-5 md:p-6">
          {isGeneratingTest ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-sky-400" />
              <p className="text-sm font-bold text-foreground">AI is generating your test paper...</p>
              <p className="text-xs text-muted-foreground">10 bilingual MCQs with detailed explanations</p>
            </div>
          ) : testQuestions.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <button onClick={() => setActiveView('plan')} className="text-xs text-muted-foreground hover:text-primary font-bold mb-1 flex items-center gap-1">
                    ← Back to Plan
                  </button>
                  <h2 className="text-lg font-black text-foreground">
                    {testSubmitted ? '📊 Test Results' : '📝 Online Test'}
                  </h2>
                </div>
                {testSubmitted && (
                  <div className={`text-2xl font-black ${testScore >= 7 ? 'text-emerald-400' : testScore >= 5 ? 'text-amber-400' : 'text-red-400'}`}>
                    {testScore}/{testQuestions.length}
                  </div>
                )}
              </div>

              {testQuestions.map((q: any, idx: number) => (
                <div key={idx} className={`bg-muted/20 border rounded-2xl p-4 space-y-3 ${
                  testSubmitted
                    ? testAnswers[idx] === q.correct_option
                      ? 'border-emerald-500/30'
                      : testAnswers[idx]
                      ? 'border-red-500/30'
                      : 'border-amber-500/30'
                    : 'border-border/40'
                }`}>
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded shrink-0">Q{idx + 1}</span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{q.question_text}</p>
                      {q.question_text_ta && <p className="text-xs text-muted-foreground mt-1">{q.question_text_ta}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {['A', 'B', 'C', 'D'].map(opt => {
                      const isSelected = testAnswers[idx] === opt;
                      const isCorrect = q.correct_option === opt;
                      let optClass = 'bg-card border-border/60 hover:border-primary/40 cursor-pointer';
                      
                      if (testSubmitted) {
                        if (isCorrect) optClass = 'bg-emerald-950/30 border-emerald-500/40';
                        else if (isSelected && !isCorrect) optClass = 'bg-red-950/30 border-red-500/40';
                        else optClass = 'bg-card border-border/40 opacity-60';
                      } else if (isSelected) {
                        optClass = 'bg-primary/10 border-primary/40';
                      }

                      return (
                        <button
                          key={opt}
                          onClick={() => !testSubmitted && setTestAnswers(prev => ({ ...prev, [idx]: opt }))}
                          className={`text-left px-3 py-2 rounded-xl border text-xs font-medium transition-all ${optClass}`}
                        >
                          <span className="font-bold text-primary">{opt}.</span>{' '}
                          {q.options?.[opt] || ''}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation after submit */}
                  {testSubmitted && (
                    <div className="bg-indigo-950/20 border border-indigo-500/15 rounded-xl p-3 mt-2">
                      <p className="text-xs font-bold text-indigo-300 mb-1">
                        {testAnswers[idx] === q.correct_option ? '✅ Correct!' : `❌ Correct Answer: ${q.correct_option}`}
                      </p>
                      <p className="text-xs text-indigo-200/60 leading-relaxed">{q.explanation}</p>
                      {q.explanation_ta && <p className="text-xs text-amber-200/50 mt-1 leading-relaxed">{q.explanation_ta}</p>}
                      {q.formula_or_law && <p className="text-[11px] text-violet-300/50 mt-1 font-mono">📐 {q.formula_or_law}</p>}
                    </div>
                  )}
                </div>
              ))}

              {/* Submit / Retake */}
              <div className="flex gap-2 pt-2">
                {!testSubmitted ? (
                  <button
                    onClick={handleTestSubmit}
                    disabled={Object.keys(testAnswers).length === 0}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 text-white rounded-xl font-bold text-sm flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    <Zap className="w-4 h-4" /> Submit Test
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => { setTestSubmitted(false); setTestAnswers({}); setTestScore(0); }}
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Retake
                    </button>
                    <button
                      onClick={() => setActiveView('plan')}
                      className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-xs font-bold"
                    >
                      ← Back to Plan
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <Zap className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-bold">Click "Test" on any topic to generate an AI-powered exam.</p>
              <button onClick={() => setActiveView('plan')} className="mt-3 px-4 py-2 bg-primary/20 text-primary rounded-xl text-xs font-bold">
                ← Go to Plan
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Sub-Components ────────────────────────────────────────────────────

const FlashCard: React.FC<{ front: string; back: string }> = ({ front, back }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  return (
    <button
      onClick={() => setIsFlipped(!isFlipped)}
      className={`w-full text-left p-3 rounded-xl border transition-all min-h-[80px] ${
        isFlipped
          ? 'bg-emerald-950/20 border-emerald-500/20'
          : 'bg-muted/20 border-border/40 hover:border-primary/30'
      }`}
    >
      <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">
        {isFlipped ? '✅ Answer' : '❓ Question'} — Tap to flip
      </p>
      <p className="text-xs font-semibold text-foreground">{isFlipped ? back : front}</p>
    </button>
  );
};

const InlineQuiz: React.FC<{ question: any; index: number }> = ({ question, index }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="mb-3 bg-muted/20 border border-border/30 rounded-xl p-3 space-y-2">
      <p className="text-xs font-bold text-foreground">Q{index + 1}: {question.question}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {question.options?.map((opt: string, i: number) => (
          <button
            key={i}
            onClick={() => { setSelected(i); setRevealed(true); }}
            className={`text-left px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-all ${
              revealed
                ? i === question.correctAnswer
                  ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                  : i === selected
                  ? 'bg-red-950/30 border-red-500/30 text-red-300'
                  : 'border-border/30 text-muted-foreground opacity-50'
                : selected === i
                ? 'bg-primary/10 border-primary/30'
                : 'border-border/30 text-muted-foreground hover:border-primary/20'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {revealed && (
        <p className="text-[11px] text-indigo-300/60 leading-relaxed bg-indigo-950/10 rounded-lg p-2">
          {selected === question.correctAnswer ? '✅ ' : '❌ '}{question.explanation}
        </p>
      )}
    </div>
  );
};
