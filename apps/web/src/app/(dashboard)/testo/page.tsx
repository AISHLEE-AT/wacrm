// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import {
  FileCheck,
  Award,
  CheckCircle2,
  PlayCircle,
  HelpCircle,
  Clock,
  Sparkles,
  ExternalLink,
  Search,
  Lock,
  Unlock,
  X,
  Check,
  RotateCcw,
  Trophy,
  Share2,
  Loader2
} from 'lucide-react';

const REAL_TNPSC_QUESTIONS = [
  {
    id: 1,
    question: 'TNPSC: தமிழ்நாட்டின் முதல் பெண் முதலமைச்சர் யார்?',
    options: ['ஜெ. ஜெயலலிதா', 'ஜானகி இராமச்சந்திரன்', 'முத்துலட்சுமி ரெட்டி', 'சரோஜினி நாயுடு'],
    correct: 1,
    explanation: 'திருமதி ஜானகி இராமச்சந்திரன் அவர்கள் 1988-ஆம் ஆண்டு தமிழ்நாட்டின் முதல் பெண் முதலமைச்சராகப் பொறுப்பேற்றார்.'
  },
  {
    id: 2,
    question: 'TNPSC: திருக்குறளில் மொத்தம் எத்தனை அதிகாரங்கள் உள்ளன?',
    options: ['108', '133', '150', '120'],
    correct: 1,
    explanation: 'திருக்குறளில் 133 அதிகாரங்கள் மற்றும் 1330 குறட்பாக்கள் உள்ளன.'
  },
  {
    id: 3,
    question: 'General Science: ஒளிச்சேர்க்கைக்குத் தேவையான முதன்மை வாயு எது?',
    options: ['ஆக்ஸிஜன்', 'கார்பன் டை ஆக்சைடு', 'நைட்ரஜன்', 'ஹைட்ரஜன்'],
    correct: 1,
    explanation: 'தாவரங்கள் ஒளிச்சேர்க்கையின் போது கார்பன் டை ஆக்சைடை (CO2) உட்கொண்டு ஆக்ஸிஜனை வெளியிடுகின்றன.'
  },
  {
    id: 4,
    question: 'Indian History: சிந்து சமவெளி நாகரிகத்தின் முக்கிய துறைமுக நகரம் எது?',
    options: ['ஹரப்பா', 'மொஹஞ்சதாரோ', 'லோத்தல்', 'காளிபங்கன்'],
    correct: 2,
    explanation: 'குஜராத்தில் உள்ள லோத்தல் (Lothal) சிந்து சமவெளி நாகரிகத்தின் மிகப்பெரிய கப்பல் கட்டும் தளம் மற்றும் துறைமுக நகரமாகும்.'
  },
  {
    id: 5,
    question: 'Maths Aptitude: 120-ன் 15% எவ்வளவு?',
    options: ['15', '18', '20', '24'],
    correct: 1,
    explanation: '120 * (15/100) = 18. சரியான விடை 18.'
  }
];

export default function TestOPage() {
  const { user } = useAuth();
  const [tests, setTests] = useState<any[]>([]);
  const [purchasedTestIds, setPurchasedTestIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [authQuery, setAuthQuery] = useState('');

  // Interactive Test Exam Modal State
  const [activeExam, setActiveExam] = useState<any | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const supabase = createClient();

  useEffect(() => {
    async function loadTestSeriesAndPurchases() {
      setLoading(true);
      try {
        // Sync auth tokens for 1-tap full screen launch
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const tokens = `?access_token=${encodeURIComponent(session.access_token)}&refresh_token=${encodeURIComponent(session.refresh_token)}#access_token=${session.access_token}&refresh_token=${session.refresh_token}&token_type=bearer`;
          setAuthQuery(tokens);
        }

        // Fetch purchased tests for user
        if (user?.id) {
          const { data: purchases } = await supabase
            .from('purchases')
            .select('item_id')
            .eq('user_id', user.id);
          
          if (purchases) {
            setPurchasedTestIds(new Set(purchases.map(p => p.item_id)));
          }
        }

        // Fetch test series from shared master database or fallback
        const { data: masterTests } = await supabase
          .from('unified_master_data')
          .select('*')
          .eq('item_type', 'TEST');

        if (masterTests && masterTests.length > 0) {
          setTests(masterTests);
        } else {
          setTests([
            {
              id: 'tnpsc_group4_exam',
              title_name: 'TNPSC Group 4 & VAO Complete Mock Test 2026',
              category: 'TNPSC Exam',
              questions_count: 200,
              duration_mins: 180,
              is_free: true,
              tag: 'Tamil Medium'
            },
            {
              id: 'tn_police_exam',
              title_name: 'TN Police Constable & Sub-Inspector Special Test',
              category: 'Uniformed Services',
              questions_count: 140,
              duration_mins: 120,
              is_free: true,
              tag: 'Police Prep'
            },
            {
              id: 'trb_tet_exam',
              title_name: 'TN TRB Paper 1 & 2 Teacher Eligibility Mock Test',
              category: 'Teaching Jobs',
              questions_count: 150,
              duration_mins: 150,
              is_free: true,
              tag: 'Free Mock'
            }
          ]);
        }
      } catch (err) {
        console.error('Error loading TestO data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTestSeriesAndPurchases();
  }, [user?.id]);

  const openAishleeWeb = () => {
    window.open(`https://thamizhan.vercel.app/testo${authQuery}`, '_blank');
  };

  const startExam = (test: any) => {
    setActiveExam(test);
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setIsSubmitted(false);
    setScore(0);
  };

  const handleAnswerSelect = (optionIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [currentQuestionIdx]: optionIdx }));
  };

  const handleSubmitExam = async () => {
    let calculatedScore = 0;
    REAL_TNPSC_QUESTIONS.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct) {
        calculatedScore += 1;
      }
    });
    setScore(calculatedScore);
    setIsSubmitted(true);

    // Save test score to Supabase profile/logs
    if (user?.id) {
      try {
        await supabase.from('point_logs').insert({
          user_id: user.id,
          points: calculatedScore * 10,
          reason: `Completed ${activeExam.title_name} Mock Test`
        });
      } catch (err) {
        console.warn('Score log note:', err);
      }
    }
  };

  const categoriesList = ['All', 'TNPSC Exam', 'Uniformed Services', 'Teaching Jobs', 'TN Board Class 11-12'];

  const filteredTests = tests.filter(t => {
    const matchesCat = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesQuery = !searchQuery || t.title_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400">
            <FileCheck className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              TestO • ஆன்லைன் மாதிரித் தேர்வு மையம்
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-0.5">
              Live Mock Tests, Questions & Explanations directly from Aishlee Web App
            </p>
          </div>
        </div>

        <button
          onClick={openAishleeWeb}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 text-white font-bold text-xs flex items-center gap-2 shadow-xl hover:opacity-90 transition self-start md:self-auto"
        >
          Open Full Screen on Aishlee Web <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Chips & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                selectedCategory === cat
                  ? 'bg-red-600 border-red-400 text-white shadow-lg shadow-red-500/20 scale-105'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Mock Tests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500/50"
          />
        </div>
      </div>

      {/* Tests Series Cards Grid */}
      {loading ? (
        <div className="w-full h-64 flex flex-col items-center justify-center space-y-3 text-red-400">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-xs font-bold">Syncing Test Series from Aishlee Web...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map((test) => {
            const isUnlocked = test.is_free || purchasedTestIds.has(test.id);
            return (
              <div
                key={test.id}
                className="group relative bg-card/40 border border-white/10 hover:border-red-500/40 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/10 backdrop-blur-md"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 font-extrabold text-[10px] uppercase border border-red-500/30">
                      {test.category || 'Exam Prep'}
                    </span>
                    <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                      {test.tag || 'Free Access'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-white group-hover:text-red-300 transition">
                      {test.title_name}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Tamil Nadu State Board & Competitive Exam Preparation Series
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-400 border-t border-white/5 pt-3">
                    <span className="flex items-center gap-1 text-slate-300">
                      <HelpCircle className="w-4 h-4 text-red-400" /> {test.questions_count || 200} Questions
                    </span>
                    <span className="flex items-center gap-1 text-slate-300">
                      <Clock className="w-4 h-4 text-amber-400" /> {test.duration_mins || 180} Mins
                    </span>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                    <Unlock className="w-4 h-4" /> Unlocked & Free
                  </span>
                  <button
                    type="button"
                    onClick={() => startExam(test)}
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg transition"
                  >
                    <PlayCircle className="w-4 h-4 fill-current" /> Start Test Now (தேர்வு எழுது)
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Exam Modal */}
      {activeExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#0F172A] border border-red-500/30 w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-5 bg-slate-900 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">{activeExam.title_name}</h3>
                <p className="text-xs text-slate-400">
                  Question {currentQuestionIdx + 1} of {REAL_TNPSC_QUESTIONS.length}
                </p>
              </div>
              <button
                onClick={() => setActiveExam(null)}
                className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Exam Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              {!isSubmitted ? (
                <>
                  <div className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                    <span className="text-xs font-extrabold text-red-400 uppercase tracking-wider">
                      Question #{currentQuestionIdx + 1}
                    </span>
                    <h4 className="text-base md:text-lg font-bold text-white leading-relaxed">
                      {REAL_TNPSC_QUESTIONS[currentQuestionIdx].question}
                    </h4>

                    {/* Options */}
                    <div className="space-y-3 pt-2">
                      {REAL_TNPSC_QUESTIONS[currentQuestionIdx].options.map((optionText, optIdx) => {
                        const isSelected = selectedAnswers[currentQuestionIdx] === optIdx;
                        return (
                          <div
                            key={optIdx}
                            onClick={() => handleAnswerSelect(optIdx)}
                            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-sm font-semibold ${
                              isSelected
                                ? 'bg-red-600/20 border-red-500 text-white shadow-md'
                                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            <span>{optIdx + 1}. {optionText}</span>
                            {isSelected && <Check className="w-4 h-4 text-red-400" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      disabled={currentQuestionIdx === 0}
                      onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold disabled:opacity-30 transition"
                    >
                      ← Previous
                    </button>

                    {currentQuestionIdx < REAL_TNPSC_QUESTIONS.length - 1 ? (
                      <button
                        onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                        className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow transition"
                      >
                        Next Question →
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmitExam}
                        className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-lg transition"
                      >
                        Submit Test & View State Scorecard 🎉
                      </button>
                    )}
                  </div>
                </>
              ) : (
                /* Scorecard & Tamil Explanations */
                <div className="space-y-6 text-center py-4">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-emerald-400 animate-bounce">
                      <Trophy className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-black text-white">Test Completed Successfully!</h3>
                    <p className="text-sm text-slate-400">
                      Your Score: <span className="text-emerald-400 font-extrabold text-lg">{score}</span> / {REAL_TNPSC_QUESTIONS.length} Marks
                    </p>
                  </div>

                  <div className="space-y-4 text-left">
                    <h4 className="text-sm font-bold text-white">📖 Explanations & Answer Key (விளக்கவுரை):</h4>
                    {REAL_TNPSC_QUESTIONS.map((q, idx) => {
                      const userAns = selectedAnswers[idx];
                      const isCorrect = userAns === q.correct;
                      return (
                        <div
                          key={q.id}
                          className={`p-4 rounded-2xl border space-y-2 text-xs ${
                            isCorrect
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                              : 'bg-red-500/10 border-red-500/30 text-red-200'
                          }`}
                        >
                          <div className="font-bold text-white text-sm">
                            {idx + 1}. {q.question}
                          </div>
                          <div className="text-slate-300 font-semibold">
                            Correct Answer: <span className="text-emerald-400 font-bold">{q.options[q.correct]}</span>
                          </div>
                          <div className="text-slate-400 pt-1 border-t border-white/5">
                            💡 <span className="font-bold text-white">விளக்கம்:</span> {q.explanation}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-center gap-4 pt-4 border-t border-white/10">
                    <button
                      onClick={() => startExam(activeExam)}
                      className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/10 transition"
                    >
                      <RotateCcw className="w-4 h-4" /> Retake Test
                    </button>
                    <button
                      onClick={() => setActiveExam(null)}
                      className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg transition"
                    >
                      Close Scorecard
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
