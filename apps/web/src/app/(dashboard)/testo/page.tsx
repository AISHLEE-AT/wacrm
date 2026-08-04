'use client';

import React, { useState } from 'react';
import { FileCheck, Award, Clock, CheckCircle2 } from 'lucide-react';

const TESTS = [
  { id: 1, title: 'TNPSC Group 4 General Tamil Full Model Test 2026', questions: '100 Qs', time: '90 Mins', attempts: '12,400 Students' },
  { id: 2, title: 'TN Police Constable (PC) GK & Mathematics Practice Test', questions: '80 Qs', time: '60 Mins', attempts: '8,900 Students' },
  { id: 3, title: 'State Board 10th Maths Chapterwise Quiz Series', questions: '25 Qs', time: '30 Mins', attempts: '4,500 Students' },
];

export default function TestoPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-6">
        <span className="text-2xl p-2.5 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">📝</span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            TestO <span className="text-xs bg-rose-500/20 text-rose-300 font-normal px-2.5 py-0.5 rounded-full border border-rose-500/30">மாதிரி தேர்வுகள்</span>
          </h1>
          <p className="text-sm text-slate-400">Online Mock Exams, TNPSC Tests, School Quizzes & Leaderboards</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TESTS.map((t) => (
          <div key={t.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs font-semibold bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded border border-rose-500/30">
                Free Mock Test
              </span>
              <h3 className="font-bold text-white text-base mt-2">{t.title}</h3>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                <span>{t.questions}</span> • <span>{t.time}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{t.attempts} attempted</p>
            </div>

            <button onClick={() => alert(`Starting ${t.title}`)} className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold py-2.5 rounded-xl text-xs border border-rose-500/30">
              Start Test Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
