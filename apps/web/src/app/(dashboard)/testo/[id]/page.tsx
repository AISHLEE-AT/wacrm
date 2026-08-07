'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import { Clock, CheckCircle2, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';

type Question = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

export default function TestTakingPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [testData, setTestData] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchTest() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('unified_master_data')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        setTestData(data);
        const parsedData = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
        const testQs = parsedData?.questions || [];
        setQuestions(testQs);
        setTimeLeft((parsedData?.durationMins || 30) * 60);
      }
      setLoading(false);
    }
    if (id) fetchTest();
  }, [id]);

  useEffect(() => {
    if (timeLeft <= 0 && !loading && questions.length > 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, loading, questions]);

  const handleSelectOption = (qIndex: number, optIndex: number) => {
    setAnswers(prev => ({ ...prev, [qIndex]: optIndex }));
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    let score = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) {
        score++;
      }
    });
    
    // Store result in localStorage
    const result = {
      score,
      total: questions.length,
      answers,
      questions,
      testName: testData?.title_name,
    };
    localStorage.setItem(`test_result_${id}`, JSON.stringify(result));
    
    router.replace(`/testo/${id}/result`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!testData || questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center flex-col gap-4 text-slate-400">
        <AlertCircle className="w-12 h-12 text-rose-500" />
        <p>Test not found or no questions available.</p>
        <button onClick={() => router.back()} className="text-rose-400 border border-rose-500/30 px-4 py-2 rounded-lg hover:bg-rose-500/10">Go Back</button>
      </div>
    );
  }

  const currentQ = questions[currentQIndex];
  const isLastQ = currentQIndex === questions.length - 1;
  const isFirstQ = currentQIndex === 0;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 p-4 sticky top-0 z-10 flex items-center justify-between">
        <div className="flex-1">
          <h1 className="font-bold text-lg text-white truncate">{testData.title_name}</h1>
          <p className="text-xs text-slate-400">Question {currentQIndex + 1} of {questions.length}</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
          <Clock className={`w-4 h-4 ${timeLeft < 300 ? 'text-red-400 animate-pulse' : 'text-rose-400'}`} />
          <span className={`font-mono font-bold ${timeLeft < 300 ? 'text-red-400' : 'text-white'}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 max-w-4xl mx-auto w-full">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-8">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-sm border border-rose-500/30">
                {currentQIndex + 1}
              </span>
              <h2 className="text-xl sm:text-2xl font-medium text-white leading-relaxed">
                {currentQ.question}
              </h2>
            </div>
          </div>

          <div className="space-y-3 pl-12">
            {currentQ.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectOption(currentQIndex, idx)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4 ${
                  answers[currentQIndex] === idx
                    ? 'bg-rose-500/20 border-rose-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  answers[currentQIndex] === idx ? 'border-rose-500' : 'border-slate-600'
                }`}>
                  {answers[currentQIndex] === idx && <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />}
                </div>
                <span>{opt}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => setCurrentQIndex(prev => prev - 1)}
            disabled={isFirstQ}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors font-medium"
          >
            <ChevronLeft className="w-5 h-5" /> Previous
          </button>
          
          {isLastQ ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold transition-colors shadow-lg shadow-rose-500/20"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Test'} <CheckCircle2 className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => setCurrentQIndex(prev => prev + 1)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 transition-colors font-medium"
            >
              Next <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
