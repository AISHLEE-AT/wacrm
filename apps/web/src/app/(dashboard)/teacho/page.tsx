'use client';

import React, { useEffect, useState } from 'react';
import { GraduationCap, PlayCircle, BookOpen, ExternalLink, ChevronDown, ChevronUp, X, Sparkles, Search } from 'lucide-react';
import { lmsSupabase } from '@/lib/lms-supabase';
import AishleeEmbed from '@/components/aishlee-embed';

export default function TeachoPage() {
  const [activeTab, setActiveTab] = useState<'native' | 'embed'>('native');
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({ 0: true });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const { data, error } = await lmsSupabase
        .from('unified_master_data')
        .select('*')
        .eq('item_type', 'COURSE')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (err) {
      console.error('[TeachO] Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (index: number) => {
    setExpandedModules(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const openVideo = (url: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const filteredCourses = courses.filter(c =>
    (c.title_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.category || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.description_purpose || c.description || '').toLowerCase().includes(search.toLowerCase())
  );

  // Parse curriculum from selected course
  let curriculum: any[] = [];
  if (selectedCourse) {
    try {
      let ai = selectedCourse.additional_info;
      if (typeof ai === 'string') ai = JSON.parse(ai);
      if (ai && ai.curriculum) {
        curriculum = ai.curriculum;
      }
    } catch (e) {
      console.error('[TeachO] Error parsing curriculum:', e);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              TeachO <span className="text-xs bg-amber-500/20 text-amber-300 font-semibold px-2.5 py-0.5 rounded-full border border-amber-500/30">கல்வி & பயிற்சி</span>
            </h1>
            <p className="text-sm text-slate-400">Masterclass Courses, Competitive Exams, School & College Tuitions ({courses.length} Courses)</p>
          </div>
        </div>

        {/* Search & Tab Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {activeTab === 'native' && (
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search 108+ courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-64 pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              onClick={() => setActiveTab('native')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'native'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Masterclasses ({courses.length})
            </button>
            <button
              onClick={() => setActiveTab('embed')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'embed'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Aishlee Frame
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {activeTab === 'embed' ? (
        <AishleeEmbed
          path="/teacho"
          moduleName="TeachO Module"
          accentColor="#f59e0b"
          icon="🎓"
        />
      ) : (
        <div className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
              <p className="text-sm text-slate-400">Loading masterclass courses...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto">
              <GraduationCap className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-white font-bold text-lg">No Courses Found</h3>
              <p className="text-slate-400 text-sm mt-1">Try adjusting your search query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => {
                let metadata = course.metadata || {};
                if (typeof metadata === 'string') {
                  try { metadata = JSON.parse(metadata); } catch (e) {}
                }
                const thumbnailUrl = metadata.thumbnail_url || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=600';

                return (
                  <div
                    key={course.id}
                    className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-2xl overflow-hidden flex flex-col justify-between transition-all group shadow-xl"
                  >
                    <div>
                      <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={thumbnailUrl}
                          alt={course.title_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3 bg-amber-500 backdrop-blur-md text-slate-950 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-md">
                          {course.category || 'Masterclass'}
                        </div>
                      </div>

                      <div className="p-5 space-y-2">
                        <h3 className="text-base font-bold text-white leading-snug group-hover:text-amber-400 transition-colors line-clamp-2">
                          {course.title_name}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {course.description_purpose || course.description || 'Learn and excel with TeachO masterclasses.'}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 pt-0 border-t border-slate-800/50 mt-4">
                      <button
                        onClick={() => setSelectedCourse(course)}
                        className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
                      >
                        <PlayCircle className="w-4 h-4 fill-slate-950" />
                        Watch & View Curriculum
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Curriculum Modal Drawer */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-950/50">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  {selectedCourse.category || 'Masterclass'}
                </span>
                <h2 className="text-xl font-bold text-white mt-2">{selectedCourse.title_name}</h2>
                <p className="text-xs text-amber-400 font-semibold mt-1">{curriculum.length} Modules Available</p>
              </div>
              <button
                onClick={() => setSelectedCourse(null)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Curriculum List */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {curriculum.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  No curriculum video modules uploaded for this course yet.
                </div>
              ) : (
                curriculum.map((mod: any, idx: number) => {
                  const isExpanded = !!expandedModules[idx];
                  const videos = mod.videos || [];

                  return (
                    <div key={idx} className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
                      <button
                        onClick={() => toggleModule(idx)}
                        className="w-full p-4 text-left flex items-center justify-between bg-slate-900/50 hover:bg-slate-900 transition-colors"
                      >
                        <span className="font-bold text-white text-sm">{mod.title || `Module ${idx + 1}`}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </button>

                      {isExpanded && (
                        <div className="p-4 border-t border-slate-800 space-y-2">
                          {videos.length === 0 ? (
                            <p className="text-xs text-slate-500 italic">No video lessons in this module.</p>
                          ) : (
                            videos.map((vid: any, vIdx: number) => (
                              <div
                                key={vIdx}
                                onClick={() => openVideo(vid.url)}
                                className="flex items-center justify-between p-3 rounded-xl bg-slate-900 hover:bg-amber-500/10 border border-slate-800 hover:border-amber-500/30 cursor-pointer transition-all group"
                              >
                                <div className="flex items-center gap-3">
                                  <PlayCircle className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                                  <span className="text-xs font-semibold text-slate-200 group-hover:text-amber-300">
                                    {vid.title}
                                  </span>
                                </div>
                                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400" />
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/50 text-right">
              <button
                onClick={() => setSelectedCourse(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
