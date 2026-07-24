// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { FileCheck, Award, CheckCircle2, PlayCircle, HelpCircle, Clock, Sparkles } from 'lucide-react';

const MOCK_EXAMS = [
  {
    id: 'tnpsc_group4',
    title: 'TNPSC Group 4 & VAO Mock Test 2026',
    questionsCount: 200,
    durationMinutes: 180,
    category: 'TNPSC Exam',
    tag: 'Tamil Medium',
  },
  {
    id: 'tn_police',
    title: 'TN Police Constable & Sub-Inspector Exam',
    questionsCount: 140,
    durationMinutes: 120,
    category: 'Uniformed Services',
    tag: 'Special Test',
  },
  {
    id: 'trb_tet',
    title: 'TN TRB Paper 1 & 2 Teacher Eligibility Test',
    questionsCount: 150,
    durationMinutes: 150,
    category: 'Teaching Jobs',
    tag: 'Free Mock',
  },
];

export default function TestOPage() {
  const [selectedExam, setSelectedExam] = useState(MOCK_EXAMS[0]);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
              <FileCheck className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-300 to-emerald-400">
              TestO • ஆன்லைன் மாதிரித் தேர்வு
            </h1>
          </div>
          <p className="text-slate-400 text-sm">
            TNPSC, TN Police, TRB &amp; தமிழ்நாடு அரசுத் தேர்வுகள் ஆன்லைன் மாதிரித் தேர்வு மையம்.
          </p>
        </div>
      </div>

      {/* Test Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {MOCK_EXAMS.map((exam) => (
          <div
            key={exam.id}
            onClick={() => setSelectedExam(exam)}
            className={`cursor-pointer p-6 rounded-2xl border transition-all ${
              selectedExam.id === exam.id
                ? 'bg-slate-900 border-amber-400/80 shadow-[0_0_20px_rgba(250,204,21,0.15)]'
                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded-full">
                {exam.category}
              </span>
              <span className="text-xs text-amber-300 font-medium">{exam.tag}</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{exam.title}</h3>
            <div className="flex items-center gap-4 text-slate-400 text-xs mt-4">
              <span className="flex items-center gap-1">
                <HelpCircle className="h-4 w-4 text-emerald-400" /> {exam.questionsCount} Questions
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-amber-400" /> {exam.durationMinutes} Mins
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Active Exam Launch Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Selected Online Exam</span>
            <h2 className="text-2xl font-bold text-white mt-1">{selectedExam.title}</h2>
          </div>
          <button
            onClick={() => alert(`Starting ${selectedExam.title}!`)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-amber-500 text-black font-extrabold rounded-xl hover:brightness-110 shadow-lg"
          >
            <PlayCircle className="h-5 w-5" /> Start Online Test Now (தேர்வு எழுது)
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300 text-sm">
          <div className="flex items-start gap-3 p-4 bg-slate-950/60 rounded-xl border border-slate-800">
            <Award className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white">Instant State Rank &amp; Scorecard</p>
              <p className="text-xs text-slate-400 mt-0.5">தேர்வு முடிந்ததும் உடனடி மதிப்பெண் மற்றும் மாநிலத் தரவரிசை பெறலாம்.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-slate-950/60 rounded-xl border border-slate-800">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white">Detailed Explanations in Tamil</p>
              <p className="text-xs text-slate-400 mt-0.5">ஒவ்வொரு கேள்விக்கும் தெளிவான தமிழ் விளக்கக் குறிப்புகள்.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
