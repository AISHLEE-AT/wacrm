// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileCheck, 
  Clock, 
  Award, 
  Search, 
  ChevronRight, 
  Play, 
  CheckCircle, 
  XCircle,
  HelpCircle,
  BarChart3,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  X
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// Featured Mock Tests List across Tamil Nadu & India Entrance Exams
const MOCK_TESTS = [
  {
    id: 'tnpsc-group1-mock',
    title: 'TNPSC Group 1 Full Length Mock Exam 2026',
    category: 'TNPSC',
    totalQuestions: 10,
    durationMins: 15,
    difficulty: 'High',
    description: 'Comprehensive test covering General Science, Tamil History, Polity, Geography, and Aptitude.',
    questions: [
      {
        id: 1,
        question: 'பெரு வெடிப்பு கோட்பாடு (Big Bang Theory) எதனைக் விளக்குகிறது?',
        options: [
          'சூரிய குடும்பத்தின் தோற்றம்',
          'பிரபஞ்சத்தின் தோற்றம் (Origin of Universe)',
          'நட்சத்திரங்களின் மரணம்',
          'பூமியின் ஈர்ப்பு விசை'
        ],
        correct: 1,
        explanation: 'பெரு வெடிப்பு கோட்பாடு சுமார் 13.8 பில்லியன் ஆண்டுகளுக்கு முன்பு பிரபஞ்சம் தோன்றி விரிவடைந்ததை விளக்குகிறது.'
      },
      {
        id: 2,
        question: 'நியூட்டனின் இரண்டாம் இயக்க விதியின் சமன்பாடு எது?',
        options: ['E = mc²', 'F = ma', 'V = IR', 'P = VI'],
        correct: 1,
        explanation: 'விசை = நிறை × முடுக்கம் (Force = Mass × Acceleration).'
      },
      {
        id: 3,
        question: 'வேலூர் புரட்சி நடந்த ஆண்டு எது?',
        options: ['1806', '1857', '1799', '1947'],
        correct: 0,
        explanation: '1806 ஜூலை 10 அன்று வேலூர் சிப்பாய் புரட்சி நடைபெற்றது.'
      }
    ]
  },
  {
    id: 'police-constable-mock',
    title: 'TNUSRB காவலர் & சார்பு ஆய்வாளர் மாதிரித் தேர்வு (Police Mock)',
    category: 'Police & Defense',
    totalQuestions: 8,
    durationMins: 10,
    difficulty: 'Medium',
    description: 'Targeted mock test for Tamil Eligibility, General Knowledge, and Mental Ability.',
    questions: [
      {
        id: 1,
        question: 'SI அலகுகளில் மின்சாரத்தின் (Electric Current) அலகு என்ன?',
        options: ['வோல்ட் (Volt)', 'ஆம்பியர் (Ampere)', 'ஓம் (Ohm)', 'ஜூல் (Joule)'],
        correct: 1,
        explanation: 'மின்னோட்டத்தின் SI அலகு ஆம்பியர் (A) ஆகும்.'
      },
      {
        id: 2,
        question: 'திராவிட மொழிகளின் ஒப்பிலக்கணம் நூலை எழுதியவர் யார்?',
        options: ['ஜி.யு.போப்', 'கால்டுவெல் (Caldwell)', 'வீரமாமுனிவர்', 'பாரதியார்'],
        correct: 1,
        explanation: 'ராபர்ட் கால்டுவெல் 1856-இல் திராவிட மொழிகளின் ஒப்பிலக்கணம் நூலை எழுதினார்.'
      }
    ]
  },
  {
    id: 'neet-physics-mock',
    title: 'NEET & JEE Physics Formula Speed Test',
    category: 'NEET / JEE',
    totalQuestions: 10,
    durationMins: 12,
    difficulty: 'Hard',
    description: 'High-speed problem solving for Kinematics, Dynamics, Electricity, and Optics.',
    questions: [
      {
        id: 1,
        question: 'What is the speed of light in vacuum?',
        options: ['3 x 10⁸ m/s', '3 x 10⁶ m/s', '9.8 m/s²', '343 m/s'],
        correct: 0,
        explanation: 'The speed of light in a vacuum is approximately 3 x 10⁸ meters per second.'
      }
    ]
  }
];

export default function TestOPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTest, setActiveTest] = useState<any>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isTestSubmitted, setIsTestSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // Timer Countdown Engine
  useEffect(() => {
    if (!activeTest || isTestSubmitted || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsTestSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeTest, isTestSubmitted, timeLeft]);

  const startTest = (test: any) => {
    setActiveTest(test);
    setCurrentQIndex(0);
    setSelectedAnswers({});
    setIsTestSubmitted(false);
    setTimeLeft(test.durationMins * 60);
  };

  const handleSelectOption = (optIdx: number) => {
    if (isTestSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQIndex]: optIdx
    }));
  };

  const calculateScore = () => {
    if (!activeTest) return { score: 0, total: 0, correctCount: 0, percentage: 0 };
    let correctCount = 0;
    activeTest.questions.forEach((q: any, idx: number) => {
      if (selectedAnswers[idx] === q.correct) {
        correctCount += 1;
      }
    });
    const total = activeTest.questions.length;
    const percentage = Math.round((correctCount / total) * 100);
    return { score: correctCount, total, correctCount, percentage };
  };

  const scoreResult = calculateScore();

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white p-4 md:p-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-red-950/80 via-slate-900 to-amber-950/80 border border-red-500/30 rounded-2xl p-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40">
              <FileCheck className="w-6 h-6" />
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-300 to-cyan-300">
              TestO • ஆன்லைன் மாதிரித் தேர்வுகள் (Mock Test Hub)
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-300">
            TNPSC, காவலர் தேர்வு, NEET/JEE மற்றும் பள்ளி பொதுத்தேர்வு மாதிரி தேர்வுகள்.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> Live Instant Evaluation &amp; Explanation
          </span>
        </div>
      </div>

      {/* Full Test Series Runner Modal */}
      {activeTest && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/40 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Test Header */}
            <div className="p-5 bg-gradient-to-r from-red-900/60 to-slate-900 border-b border-red-500/30 flex items-center justify-between">
              <div>
                <h2 className="text-base md:text-lg font-black text-white">{activeTest.title}</h2>
                <span className="text-xs text-red-300">Question {currentQIndex + 1} of {activeTest.questions.length}</span>
              </div>

              <div className="flex items-center gap-4">
                {!isTestSubmitted && (
                  <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-amber-500/40 text-amber-400 font-mono font-bold text-sm flex items-center gap-1.5">
                    <Clock className="w-4 h-4 animate-spin" /> {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </span>
                )}
                <button
                  onClick={() => setActiveTest(null)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Test Content / Results */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {isTestSubmitted ? (
                /* Test Results Summary */
                <div className="space-y-6 text-center">
                  <div className="p-6 bg-slate-950 border border-emerald-500/30 rounded-2xl space-y-3">
                    <Award className="w-12 h-12 text-amber-400 mx-auto animate-bounce" />
                    <h3 className="text-2xl font-black text-white">Exam Completed!</h3>
                    <p className="text-3xl font-black text-emerald-400">
                      {scoreResult.score} / {scoreResult.total} ({scoreResult.percentage}%)
                    </p>
                    <p className="text-xs text-slate-400">Great job! Review question explanations below to improve your score.</p>
                  </div>

                  {/* Detailed Question Explanations */}
                  <div className="space-y-4 text-left">
                    <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Answer Key &amp; Solutions Walkthrough</h4>
                    {activeTest.questions.map((q: any, idx: number) => {
                      const userAns = selectedAnswers[idx];
                      const isCorrect = userAns === q.correct;

                      return (
                        <div key={idx} className={`p-4 rounded-xl border space-y-2 ${isCorrect ? 'bg-emerald-950/30 border-emerald-500/40' : 'bg-red-950/30 border-red-500/40'}`}>
                          <div className="flex items-start justify-between">
                            <h5 className="text-xs md:text-sm font-bold text-white">Q{idx + 1}. {q.question}</h5>
                            {isCorrect ? (
                              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Correct</span>
                            ) : (
                              <span className="text-xs font-bold text-red-400 flex items-center gap-1"><XCircle className="w-4 h-4" /> Incorrect</span>
                            )}
                          </div>

                          <div className="text-xs space-y-1 text-slate-300">
                            <p><strong>Your Answer:</strong> {userAns !== undefined ? q.options[userAns] : 'Not Answered'}</p>
                            <p className="text-emerald-400"><strong>Correct Answer:</strong> {q.options[q.correct]}</p>
                            <p className="text-slate-400 text-[11px] bg-slate-950 p-2 rounded border border-slate-800 mt-2 font-mono">
                              💡 <strong>Explanation:</strong> {q.explanation}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => startTest(activeTest)}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 text-white font-bold text-sm flex items-center gap-2 mx-auto shadow-lg transition hover:scale-105"
                  >
                    <RotateCcw className="w-4 h-4" /> Re-Take Test
                  </button>
                </div>
              ) : (
                /* Question Runner */
                <div className="space-y-6">
                  {/* Current Question */}
                  <div className="space-y-4">
                    <h3 className="text-base md:text-lg font-bold text-white leading-relaxed">
                      Q{currentQIndex + 1}. {activeTest.questions[currentQIndex].question}
                    </h3>

                    {/* Options List */}
                    <div className="space-y-2.5">
                      {activeTest.questions[currentQIndex].options.map((opt: string, optIdx: number) => {
                        const isSelected = selectedAnswers[currentQIndex] === optIdx;

                        return (
                          <div
                            key={optIdx}
                            onClick={() => handleSelectOption(optIdx)}
                            className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between text-xs md:text-sm ${
                              isSelected
                                ? 'bg-red-500/20 border-red-500 text-white font-bold'
                                : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                            {isSelected && <div className="w-3 h-3 rounded-full bg-red-500" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Navigation Controls */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <button
                      disabled={currentQIndex === 0}
                      onClick={() => setCurrentQIndex(prev => prev - 1)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition disabled:opacity-40"
                    >
                      ← Previous
                    </button>

                    {currentQIndex < activeTest.questions.length - 1 ? (
                      <button
                        onClick={() => setCurrentQIndex(prev => prev + 1)}
                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition"
                      >
                        Next Question →
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsTestSubmitted(true)}
                        className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs transition shadow-lg"
                      >
                        Submit Test
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Test Series Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_TESTS.map((test) => (
          <div
            key={test.id}
            className="bg-slate-900 border border-slate-800 hover:border-red-500/50 rounded-2xl p-6 space-y-4 transition-all shadow-md hover:shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-red-500/15 text-red-400 text-[10px] font-bold border border-red-500/30">
                  {test.category}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> {test.durationMins} Mins
                </span>
              </div>

              <h3 className="text-base font-bold text-white leading-snug">
                {test.title}
              </h3>

              <p className="text-xs text-slate-400">
                {test.description}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-300 font-semibold">{test.totalQuestions} Questions</span>
              <button
                onClick={() => startTest(test)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition hover:scale-105"
              >
                Start Exam <Play className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
