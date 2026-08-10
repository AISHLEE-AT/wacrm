'use client';

import React, { useEffect, useState } from 'react';
import { FileCheck, Sparkles, HelpCircle, ArrowRight, X } from 'lucide-react';
import { lmsSupabase } from '@/lib/lms-supabase';
import AishleeEmbed from '@/components/aishlee-embed';

export default function TestoPage() {
  const [activeTab, setActiveTab] = useState<'native' | 'embed'>('native');
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTest, setActiveTest] = useState<any | null>(null);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const { data, error } = await lmsSupabase
        .from('unified_master_data')
        .select('*')
        .eq('item_type', 'o_test')
        .limit(2000);

      if (error) throw error;

      const groups: Record<string, any[]> = {};

      (data || []).forEach((item) => {
        let ai = item.additional_info;
        if (typeof ai === 'string') {
          try { ai = JSON.parse(ai); } catch (e) {}
        }

        if (ai && ai.questions && ai.questions.length > 0) {
          const title = item.title_name || '';
          let courseName = 'General Mock Tests';
          let testName = title;

          if (title.includes(':')) {
            const parts = title.split(':');
            courseName = parts[0].trim();
            testName = parts.slice(1).join(':').trim();
          }

          item.displayTitle = testName;
          item.questions = ai.questions;
          item.questionCount = ai.questions.length;

          if (!groups[courseName]) {
            groups[courseName] = [];
          }
          groups[courseName].push(item);
        }
      });

      const formattedSections = Object.keys(groups).map((key) => ({
        title: key,
        data: groups[key],
      }));

      setSections(formattedSections);
    } catch (err) {
      console.error('[TestO] Error fetching tests:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20">
            <FileCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              TestO <span className="text-xs bg-purple-500/20 text-purple-300 font-semibold px-2.5 py-0.5 rounded-full border border-purple-500/30">பயிற்சி & தேர்வு</span>
            </h1>
            <p className="text-sm text-slate-400">Mock Exams, Online Quizzes, & Competitive Exam Practice</p>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl self-start md:self-auto">
          <button
            onClick={() => setActiveTab('native')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'native'
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Native Tests & Quizzes
          </button>
          <button
            onClick={() => setActiveTab('embed')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'embed'
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Aishlee Web App
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'embed' ? (
        <AishleeEmbed
          path="/testo"
          moduleName="TestO Platform"
          accentColor="#8b5cf6"
          icon="📝"
        />
      ) : (
        <div className="space-y-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
              <p className="text-sm text-slate-400">Loading mock tests & exams...</p>
            </div>
          ) : sections.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto">
              <FileCheck className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-white font-bold text-lg">No Tests Found</h3>
              <p className="text-slate-400 text-sm mt-1">Check back soon for new mock exams.</p>
            </div>
          ) : (
            sections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    {section.title}
                  </h3>
                  <span className="text-xs font-semibold text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                    {section.data.length} Tests
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {section.data.map((item: any) => (
                    <div
                      key={item.id}
                      className="bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all group"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                            {item.questionCount} Questions
                          </span>
                        </div>
                        <h4 className="font-bold text-white text-base group-hover:text-purple-300 transition-colors">
                          {item.displayTitle || item.title_name}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {item.description_purpose || item.description || 'Practice questions and evaluate your skills.'}
                        </p>
                      </div>

                      <button
                        onClick={() => setActiveTest(item)}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
                      >
                        Start Mock Test
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Test Preview Modal */}
      {activeTest && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-950/50">
              <div>
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                  {activeTest.questionCount} Questions
                </span>
                <h2 className="text-xl font-bold text-white mt-2">{activeTest.displayTitle || activeTest.title_name}</h2>
              </div>
              <button
                onClick={() => setActiveTest(null)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <p className="text-xs text-slate-400">Previewing questions in this exam:</p>
              {activeTest.questions.slice(0, 5).map((q: any, qIdx: number) => (
                <div key={qIdx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <p className="text-xs font-bold text-purple-300">Q{qIdx + 1}: {q.question || q.text || 'Question'}</p>
                  {q.options && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {q.options.map((opt: string, oIdx: number) => (
                        <div key={oIdx} className="text-[11px] text-slate-400 bg-slate-900 p-2 rounded-lg border border-slate-800">
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {activeTest.questions.length > 5 && (
                <p className="text-center text-xs text-slate-500 italic">+ {activeTest.questions.length - 5} more questions in full exam mode</p>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between">
              <button
                onClick={() => setActiveTest(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert('Starting exam...');
                  setActiveTest(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition-colors"
              >
                Begin Full Exam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
