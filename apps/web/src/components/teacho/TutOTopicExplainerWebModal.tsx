'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  Sparkles,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Award,
  RotateCcw,
  Zap,
  HelpCircle,
  Moon,
  Layers,
  Check,
  Play
} from 'lucide-react';
import { CourseOption } from '@/data/coursesCatalog';

export interface StudyNoteSection {
  sectionTitle: string;
  content: string;
}

export interface FlashcardItem {
  front: string;
  back: string;
}

export interface PracticeQuizItem {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface MicroTopicPayload {
  topicTitle: string;
  subject?: string;
  overview?: string;
  tamilExplanation?: string;
  learningObjectives?: string[];
  studyNotes?: StudyNoteSection[];
  flashcards?: FlashcardItem[];
  practiceQuiz?: PracticeQuizItem[];
  bedtimeRecap?: string;
  formulasAndMnemonics?: string[];
  bookBackSolutions?: any[];
  solvedProblems?: any[];
  dayNumber?: number;
  courseId?: string;
}

interface TutOTopicExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  course?: CourseOption;
  initialDayNumber?: number;
  onOpenTest?: (category: string, subject: string) => void;
}

export const TutOTopicExplainerWebModal: React.FC<TutOTopicExplainerModalProps> = ({
  isOpen,
  onClose,
  course,
  initialDayNumber = 1,
  onOpenTest
}) => {
  const [currentDay, setCurrentDay] = useState<number>(initialDayNumber);
  const [activeTab, setActiveTab] = useState<'notes' | 'flashcards' | 'quiz' | 'recap'>('notes');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [content, setContent] = useState<MicroTopicPayload | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Flashcard Flip State
  const [activeCardIdx, setActiveCardIdx] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [topicCompleted, setTopicCompleted] = useState<boolean>(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);

  const handleGenerateWithAI = async () => {
    setIsGeneratingAI(true);
    setApiError(null);
    try {
      const apiKey = typeof window !== 'undefined' ? localStorage.getItem('gemini-api-key') || '' : '';
      const cId = course?.id || 'school-std-10';
      const topic = `${course?.title || 'Academic'} Day ${currentDay} Core Concepts`;

      const res = await fetch('https://mysupro.duckdns.org/api/tuto/ai/generate-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: cId,
          dayNumber: currentDay,
          topicTitle: topic,
          subject: 'Core Curriculum',
          userApiKey: apiKey || undefined
        })
      });

      const data = await res.json();
      if (data.success && data.content) {
        setContent(data.content);
      } else {
        setApiError(data.error || 'Failed to generate topic content. Please configure your Gemini API Key.');
      }
    } catch (e: any) {
      setApiError(e.message || 'Error connecting to AI generator');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Sync initialDayNumber when changed
  useEffect(() => {
    if (initialDayNumber) setCurrentDay(initialDayNumber);
  }, [initialDayNumber]);

  // Load Content for Current Day from OCI
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function fetchTopicContent() {
      setIsLoading(true);
      setApiError(null);
      setIsFlipped(false);
      setActiveCardIdx(0);
      setQuizAnswers({});

      try {
        const ociBase = 'https://mysupro.duckdns.org';
        const cId = course?.id || 'school-std-10';

        const res = await fetch(`${ociBase}/api/tuto/content?courseId=${encodeURIComponent(cId)}&dayNumber=${currentDay}`, {
          cache: 'no-store'
        });

        if (!res.ok) throw new Error(`Day ${currentDay} content not available yet.`);
        const data = await res.json();

        if (isMounted) {
          if (data.success && data.content) {
            setContent(data.content);
          } else {
            throw new Error('Invalid content format returned');
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setApiError(err.message || 'Unable to load topic content.');
          setContent(null);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchTopicContent();

    return () => {
      isMounted = false;
    };
  }, [isOpen, course, currentDay]);

  if (!isOpen) return null;

  const cards = content?.flashcards || [];
  const currentCard = cards[activeCardIdx];
  const quizItems = content?.practiceQuiz || [];
  const notes = content?.studyNotes || [];
  const objectives = content?.learningObjectives || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[94vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        
        {/* TOP NAVBAR */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-md">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  Day {currentDay}
                </span>
                <span className="text-xs text-slate-400">
                  {content?.subject || course?.title || 'Daily Explainer'}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-100 truncate max-w-md mt-0.5">
                {content?.topicTitle || `Day ${currentDay} Core Topic`}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Day Nav Buttons */}
            <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700">
              <button
                disabled={currentDay <= 1}
                onClick={() => setCurrentDay((prev) => Math.max(1, prev - 1))}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-mono text-xs font-bold text-slate-200">
                D{currentDay}
              </span>
              <button
                disabled={currentDay >= 300}
                onClick={() => setCurrentDay((prev) => Math.min(300, prev + 1))}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SUB-HEADER TABS */}
        <div className="px-6 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex gap-1">
            {[
              { id: 'notes', label: '📝 Study Notes & Concepts', count: notes.length },
              { id: 'flashcards', label: '🗂️ Interactive Flashcards', count: cards.length },
              { id: 'quiz', label: '💡 Micro Quiz Check', count: quizItems.length },
              { id: 'recap', label: '🌙 1-Min Exam Recap' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:bg-white/60'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {onOpenTest && (
            <button
              onClick={() => onOpenTest(course?.id || 'TNPSC', content?.subject || 'ALL')}
              className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0"
            >
              <Zap className="w-3.5 h-3.5 fill-current text-amber-300" />
              <span>Practice Test</span>
            </button>
          )}
        </div>

        {/* BODY WORKSPACE */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-slate-600">Retrieving Day {currentDay} Study Guide & Notes from OCI...</p>
            </div>
          ) : apiError ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">{apiError}</h3>
              <p className="text-xs text-slate-500">
                You can generate dynamic study notes, flashcards &amp; quiz for this day using Gemini AI.
              </p>
              <div className="pt-2 flex flex-wrap justify-center gap-2">
                <button
                  onClick={handleGenerateWithAI}
                  disabled={isGeneratingAI}
                  className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-200 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{isGeneratingAI ? 'Generating with Gemini AI...' : '✨ Generate with Gemini AI'}</span>
                </button>
                <button
                  onClick={() => setCurrentDay(1)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                >
                  Return to Day 1
                </button>
              </div>
            </div>
          ) : content ? (
            <div className="space-y-6">
              
              {/* TOPIC HERO BANNER */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50 via-slate-50 to-white border border-indigo-100/80">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-black tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                      {content.subject || 'Core Curriculum'}
                    </span>
                    <h1 className="text-lg md:text-xl font-black text-slate-900">
                      {content.topicTitle}
                    </h1>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold shrink-0 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>~5 Min Read</span>
                  </div>
                </div>

                {content.overview && (
                  <p className="text-xs md:text-sm text-slate-700 leading-relaxed mt-3 pt-3 border-t border-indigo-100/60 font-medium">
                    {content.overview}
                  </p>
                )}

                {/* Objectives Checklist */}
                {objectives.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-indigo-100/60 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Key Learning Objectives:
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {objectives.map((obj, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-700 bg-white/70 p-2.5 rounded-xl border border-indigo-100/50">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{obj}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ─── TAB 1: STUDY NOTES ───────────────────────────────────────── */}
              {activeTab === 'notes' && (
                <div className="space-y-5">
                  {notes.length > 0 ? (
                    notes.map((note, idx) => (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2.5"
                      >
                        <h3 className="font-bold text-sm md:text-base text-slate-900 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-black flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          {note.sectionTitle}
                        </h3>
                        <div className="text-xs md:text-sm text-slate-700 leading-relaxed pl-8 whitespace-pre-line">
                          {note.content}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                      Standard syllabus concept notes active for this day.
                    </div>
                  )}

                  {/* Formulas & Mnemonics */}
                  {content.formulasAndMnemonics && content.formulasAndMnemonics.length > 0 && (
                    <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-amber-900 flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-600" />
                        Formulas, Axioms & Memory Mnemonics:
                      </h4>
                      <ul className="list-disc list-inside text-xs text-amber-950 space-y-1">
                        {content.formulasAndMnemonics.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* ─── TAB 2: INTERACTIVE FLASHCARDS ───────────────────────────── */}
              {activeTab === 'flashcards' && (
                <div className="space-y-4 max-w-xl mx-auto py-4">
                  {cards.length > 0 && currentCard ? (
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                        <span>Tap Card to Flip</span>
                        <span>Card {activeCardIdx + 1} of {cards.length}</span>
                      </div>

                      {/* Flashcard 3D Card */}
                      <div
                        onClick={() => setIsFlipped(!isFlipped)}
                        className={`min-h-[220px] p-8 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between text-center select-none shadow-md ${
                          isFlipped
                            ? 'bg-gradient-to-tr from-emerald-50 to-teal-50 border-emerald-300 ring-2 ring-emerald-400/20'
                            : 'bg-gradient-to-tr from-slate-900 to-indigo-950 border-slate-800 text-white'
                        }`}
                      >
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {isFlipped ? '💡 Key Solution / Explanation' : '❓ Question / Concept'}
                        </div>

                        <div className={`text-base md:text-lg font-bold leading-relaxed my-auto ${
                          isFlipped ? 'text-emerald-950' : 'text-slate-100'
                        }`}>
                          {isFlipped ? currentCard.back : currentCard.front}
                        </div>

                        <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-center gap-1">
                          <RotateCcw className="w-3 h-3" />
                          <span>Tap to flip</span>
                        </div>
                      </div>

                      {/* Card Navigation */}
                      <div className="flex items-center justify-between mt-4">
                        <button
                          disabled={activeCardIdx === 0}
                          onClick={() => {
                            setActiveCardIdx((prev) => Math.max(0, prev - 1));
                            setIsFlipped(false);
                          }}
                          className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                        >
                          ◀ Previous Card
                        </button>

                        <button
                          disabled={activeCardIdx === cards.length - 1}
                          onClick={() => {
                            setActiveCardIdx((prev) => Math.min(cards.length - 1, prev + 1));
                            setIsFlipped(false);
                          }}
                          className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 disabled:opacity-40"
                        >
                          Next Card ▶
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-500 text-xs">
                      No flashcards generated for this topic yet.
                    </div>
                  )}
                </div>
              )}

              {/* ─── TAB 3: MICRO PRACTICE QUIZ ──────────────────────────────── */}
              {activeTab === 'quiz' && (
                <div className="space-y-6">
                  {quizItems.length > 0 ? (
                    quizItems.map((q, qIdx) => {
                      const selected = quizAnswers[qIdx];
                      const isAnswered = selected !== undefined;
                      const isCorrect = selected === q.correctIndex;

                      return (
                        <div
                          key={qIdx}
                          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-black flex items-center justify-center">
                              Q{qIdx + 1}
                            </span>
                            {isAnswered && (
                              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                                isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {isCorrect ? 'Correct!' : 'Incorrect'}
                              </span>
                            )}
                          </div>

                            <div className="font-bold text-sm text-slate-900">
                            {q.question}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                            {q.options.map((opt, optIdx) => {
                              const isChoice = selected === optIdx;
                              const isRightOption = q.correctIndex === optIdx;

                              let btnClass = 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50';
                              if (isAnswered) {
                                if (isRightOption) {
                                  btnClass = 'bg-emerald-100 border-emerald-400 text-emerald-950 font-bold';
                                } else if (isChoice && !isRightOption) {
                                  btnClass = 'bg-red-100 border-red-400 text-red-950';
                                }
                              }

                              return (
                                <button
                                  key={optIdx}
                                  onClick={() => {
                                    setQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
                                  }}
                                  className={`p-3 rounded-xl border text-left text-xs transition-all flex items-start gap-2 ${btnClass}`}
                                >
                                  <span className="font-bold shrink-0">{String.fromCharCode(65 + optIdx)})</span>
                                  <span>{opt}</span>
                                </button>
                              );
                            })}
                          </div>

                          {isAnswered && q.explanation && (
                            <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                              <strong>Rationale:</strong> {q.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 text-slate-500 text-xs">
                      No micro-quiz questions available for this topic.
                    </div>
                  )}
                </div>
              )}

              {/* ─── TAB 4: BEDTIME / EXAM RECAP ─────────────────────────────── */}
              {activeTab === 'recap' && (
                <div className="max-w-xl mx-auto py-6 space-y-4 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
                    <Moon className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">1-Minute Mindful Topic Recap</h3>
                    <p className="text-xs text-slate-500 mt-1">Review right before sleep or exam to lock in long-term memory</p>
                  </div>

                  <div className="p-6 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-950 text-white text-left text-sm leading-relaxed shadow-lg border border-slate-800">
                    <div className="font-bold text-amber-400 text-xs mb-2">📌 Key Takeaway Summary:</div>
                    {content.bedtimeRecap || content.overview || 'Review the core definition and formulas for today.'}
                  </div>
                </div>
              )}

            </div>
          ) : null}
        </div>

        {/* BOTTOM FOOTER NAVIGATION */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <button
            disabled={currentDay <= 1}
            onClick={() => setCurrentDay((prev) => Math.max(1, prev - 1))}
            className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" /> Day {currentDay - 1}
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setTopicCompleted(true)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                topicCompleted
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{topicCompleted ? 'Completed (+50 XP)' : 'Mark Understood'}</span>
            </button>

            <button
              disabled={currentDay >= 300}
              onClick={() => setCurrentDay((prev) => Math.min(300, prev + 1))}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-40"
            >
              <span>Day {currentDay + 1} Topic</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
