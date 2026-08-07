'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { createLMSClient } from '@/lib/supabase/lms-client';
import { useRouter } from 'next/navigation';
import { FileCheck, Clock, ListChecks } from 'lucide-react';

type Test = {
  id: string;
  category: string;
  title_name: string;
  description_purpose: string;
  data: any; // e.g., { questionsCount, durationMins, ... }
};

export default function TestoPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchTests() {
      const supabase = createLMSClient();
      // OPTIMIZATION: Only fetch lightweight metadata (exclude additional_info which contains massive question banks)
      const { data, error } = await supabase
        .from('unified_master_data')
        .select('id, category, title_name, description_purpose')
        .eq('item_type', 'o_test')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setTests(data as Test[]);
      }
      setLoading(false);
    }
    fetchTests();
  }, []);

  const testsByCategory = tests.reduce((acc, test) => {
    const cat = test.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(test);
    return acc;
  }, {} as Record<string, Test[]>);

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

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
        </div>
      ) : Object.keys(testsByCategory).length === 0 ? (
        <div className="text-center p-8 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400">
          No tests available right now. Check back later!
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(testsByCategory).map(([category, catTests]) => (
            <div key={category} className="space-y-4">
              <h2 className="text-xl font-bold text-slate-200 border-l-4 border-rose-500 pl-3">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {catTests.map((t) => {
                  return (
                    <div key={t.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                      <div>
                        <span className="text-xs font-semibold bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded border border-rose-500/30">
                          {t.category || 'Test'}
                        </span>
                        <h3 className="font-bold text-white text-base mt-2">{t.title_name}</h3>
                        <p className="text-sm text-slate-400 mt-1 line-clamp-2">{t.description_purpose}</p>
                      </div>

                      <button 
                        onClick={() => router.push(`/testo/${t.id}`)} 
                        className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold py-2.5 rounded-xl text-xs border border-rose-500/30 transition-colors"
                      >
                        Start Test Now
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
