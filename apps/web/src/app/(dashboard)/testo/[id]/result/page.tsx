'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Download, CheckCircle2, XCircle, ArrowLeft, Trophy, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function TestResultPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(`test_result_${id}`);
    if (stored) {
      setResult(JSON.parse(stored));
    }
    setLoading(false);
  }, [id]);

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0f172a' // slate-950
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${result?.testName || 'Test'}_Result.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    }
    setIsDownloading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-slate-400 p-4">
        <AlertCircle className="w-12 h-12 text-rose-500" />
        <p>No result found for this test. You might not have completed it yet.</p>
        <button onClick={() => router.push('/testo')} className="text-rose-400 font-medium hover:underline">
          Go back to TestO
        </button>
      </div>
    );
  }

  const percentage = Math.round((result.score / result.total) * 100);
  let status = '';
  if (percentage >= 80) status = 'Excellent! 🌟';
  else if (percentage >= 60) status = 'Good Job! 👍';
  else if (percentage >= 40) status = 'Keep Practicing! 💪';
  else status = 'Needs Improvement 📚';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 pb-20">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Actions Header */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.push('/testo')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Tests
          </button>
          
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> {isDownloading ? 'Downloading...' : 'Download PDF Report'}
          </button>
        </div>

        {/* Report Container for PDF */}
        <div ref={reportRef} className="space-y-6 bg-slate-950">
          
          {/* Summary Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-8 text-center sm:text-left">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{result.testName}</h1>
              <p className="text-slate-400">Your Performance Report</p>
              <div className="mt-4 inline-flex items-center gap-2 bg-rose-500/10 text-rose-400 px-4 py-2 rounded-xl border border-rose-500/20 font-medium">
                <Trophy className="w-5 h-5" /> {status}
              </div>
            </div>
            
            {/* Circular Progress/Score */}
            <div className="relative w-40 h-40 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-slate-800" strokeWidth="10" />
                <circle 
                  cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-rose-500" strokeWidth="10"
                  strokeDasharray={`${(percentage / 100) * 283} 283`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-white">{percentage}%</span>
                <span className="text-xs font-medium text-slate-400">{result.score} / {result.total} Correct</span>
              </div>
            </div>
          </div>

          {/* Detailed Analysis */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4">Detailed Question Analysis</h2>
            
            <div className="space-y-8">
              {result.questions.map((q: any, idx: number) => {
                const userAnswer = result.answers[idx];
                const isCorrect = userAnswer === q.correctAnswer;
                const isSkipped = userAnswer === undefined || userAnswer === null;

                return (
                  <div key={idx} className={`p-5 rounded-xl border ${isCorrect ? 'border-emerald-500/30 bg-emerald-500/5' : isSkipped ? 'border-slate-700 bg-slate-800/30' : 'border-rose-500/30 bg-rose-500/5'}`}>
                    <div className="flex items-start gap-3">
                      {isCorrect ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-6 h-6 text-rose-500 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 space-y-4">
                        <p className="font-medium text-white text-lg">
                          <span className="text-slate-400 text-sm mr-2">Q{idx + 1}.</span>
                          {q.question}
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {q.options.map((opt: string, oIdx: number) => {
                            const isThisCorrect = oIdx === q.correctAnswer;
                            const isThisSelected = oIdx === userAnswer;
                            
                            let optClass = 'bg-slate-950 border-slate-800 text-slate-400';
                            if (isThisCorrect) {
                              optClass = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-medium';
                            } else if (isThisSelected && !isThisCorrect) {
                              optClass = 'bg-rose-500/20 border-rose-500 text-rose-300';
                            }

                            return (
                              <div key={oIdx} className={`p-3 rounded-lg border text-sm flex items-center justify-between ${optClass}`}>
                                <span>{opt}</span>
                                {isThisCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                {isThisSelected && !isThisCorrect && <XCircle className="w-4 h-4 text-rose-500" />}
                              </div>
                            );
                          })}
                        </div>
                        
                        {q.explanation && (
                          <div className="mt-4 p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                            <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Explanation</p>
                            <p className="text-sm text-indigo-100">{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
