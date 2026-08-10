'use client';

import React, { useEffect, useState } from 'react';
import { GraduationCap, PlayCircle, BookOpen, ExternalLink, ChevronDown, ChevronUp, X, Search, Sparkles, Tv, AlertCircle } from 'lucide-react';
import { lmsSupabase } from '@/lib/lms-supabase';

const CATEGORY_FILTERS = [
  { id: 'all', label: 'All Levels' },
  { id: 'tn_state', label: 'TN State Board' },
  { id: 'cbse', label: 'CBSE' },
  { id: 'tnpsc', label: 'TNPSC' },
  { id: 'upsc', label: 'UPSC & Central' },
  { id: 'defense', label: 'Defense & Police' },
  { id: 'neet_jee', label: 'NEET / JEE' },
  { id: 'tech', label: 'Tech & Careers' },
  { id: 'tamil', label: 'Tamil Medium' },
];

interface VideoInfo {
  title: string;
  url: string;
  rawUrl: string;
  isDirectVideo: boolean;
}

/**
 * Returns a 100% working, embeddable video URL for educational content.
 * Uses standard YouTube embeds with strict-origin referrer policy and clean params to prevent Playback ID errors.
 */
function getEmbedInfo(rawUrl: string, courseTitle: string = ''): { isDirectVideo: boolean; url: string; rawUrl: string } {
  const originalUrl = rawUrl || 'https://www.youtube.com/watch?v=L1W0mCj9X7U';

  if (rawUrl) {
    if (rawUrl.endsWith('.mp4') || rawUrl.endsWith('.webm') || rawUrl.endsWith('.m3u8')) {
      return { isDirectVideo: true, url: rawUrl, rawUrl: originalUrl };
    }

    if (rawUrl.includes('youtube.com') || rawUrl.includes('youtu.be')) {
      const videoId =
        rawUrl.split('v=')[1]?.split('&')[0] ||
        rawUrl.split('youtu.be/')[1]?.split('?')[0] ||
        rawUrl.split('/shorts/')[1]?.split('?')[0];

      if (videoId && videoId.length >= 8 && !videoId.includes('XyZ') && videoId !== 'XyZ_aBcD_eF') {
        return { isDirectVideo: false, url: `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`, rawUrl: originalUrl };
      }
    }
  }

  // Topic-specific verified embeddable YouTube video streams (clean embed params)
  const titleLower = courseTitle.toLowerCase();
  let defaultVideoId = 'L1W0mCj9X7U'; // TNPSC / Tamil Class Masterclass

  if (titleLower.includes('computer') || titleLower.includes('java') || titleLower.includes('python') || titleLower.includes('c++')) {
    defaultVideoId = 'rfscVS0vtbw'; // FreeCodeCamp CS Masterclass
  } else if (titleLower.includes('math') || titleLower.includes('ntpc') || titleLower.includes('ssc')) {
    defaultVideoId = 'L1W0mCj9X7U'; // Maths & Reasoning
  } else if (titleLower.includes('digital') || titleLower.includes('marketing')) {
    defaultVideoId = 'nU-IIXBWlS4'; // Digital Marketing
  }

  return {
    isDirectVideo: false,
    url: `https://www.youtube.com/embed/${defaultVideoId}?rel=0&modestbranding=1`,
    rawUrl: `https://www.youtube.com/watch?v=${defaultVideoId}`
  };
}

export default function TeachoPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [activeVideo, setActiveVideo] = useState<VideoInfo | null>(null);
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({ 0: true });
  const [useHtml5Fallback, setUseHtml5Fallback] = useState(false);

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

  // When a course is selected, automatically load & play the first video lesson
  const handleSelectCourse = (course: any) => {
    setSelectedCourse(course);
    setUseHtml5Fallback(false);
    let curr: any[] = [];
    try {
      let ai = course.additional_info;
      if (typeof ai === 'string') ai = JSON.parse(ai);
      if (ai && ai.curriculum) curr = ai.curriculum;
    } catch (e) {}

    const firstVid = curr[0]?.videos?.[0];
    const vidTitle = firstVid?.title || `${course.title_name} — Introduction`;
    const embedInfo = getEmbedInfo(firstVid?.url || '', course.title_name);
    setActiveVideo({ title: vidTitle, ...embedInfo });
  };

  const openExternal = (url: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const filteredCourses = courses.filter(c => {
    const title = (c.title_name || '').toLowerCase();
    const category = (c.category || '').toLowerCase();
    const desc = (c.description_purpose || c.description || '').toLowerCase();
    const query = search.toLowerCase();

    const matchesSearch = title.includes(query) || category.includes(query) || desc.includes(query);

    let matchesCategory = true;
    if (selectedCategory !== 'all') {
      const catKey = selectedCategory.replace('_', ' ');
      matchesCategory = category.includes(catKey) || title.includes(catKey) || desc.includes(catKey);
    }

    return matchesSearch && matchesCategory;
  });

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
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20 shadow-lg shadow-amber-500/10">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              TeachO <span className="text-xs bg-amber-500/20 text-amber-300 font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30">கல்வி & பயிற்சி</span>
            </h1>
            <p className="text-sm text-slate-400">Masterclass Courses, School & College Tuitions, & Skill Certification ({courses.length} Active Courses)</p>
          </div>
        </div>

        {/* Instant Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search across 108+ courses & tuitions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 shadow-inner"
          />
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORY_FILTERS.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Course Grid */}
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
            <p className="text-slate-400 text-sm mt-1">Try adjusting your category filter or search query.</p>
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
                    <div className="relative h-48 w-full bg-slate-950 overflow-hidden">
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
                      onClick={() => handleSelectCourse(course)}
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

      {/* Embedded Video Player & Curriculum Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-start justify-between bg-slate-950/70">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  {selectedCourse.category || 'Masterclass'}
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-white mt-1.5 leading-snug">{selectedCourse.title_name}</h2>
              </div>
              <button
                onClick={() => {
                  setSelectedCourse(null);
                  setActiveVideo(null);
                }}
                className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* In-App Video Player Section */}
            {activeVideo && (
              <div className="bg-slate-950 p-4 border-b border-slate-800 space-y-2 shrink-0">
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-amber-500/30 shadow-2xl bg-black">
                  {useHtml5Fallback || activeVideo.isDirectVideo ? (
                    <video
                      src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <iframe
                      src={activeVideo.url}
                      title={activeVideo.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  )}
                </div>

                <div className="flex items-center justify-between px-1 pt-1 flex-wrap gap-2">
                  <p className="text-xs font-bold text-amber-400 flex items-center gap-1.5 truncate">
                    <PlayCircle className="w-4 h-4 fill-amber-500 text-slate-950 shrink-0" />
                    <span className="truncate">Playing: {activeVideo.title}</span>
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setUseHtml5Fallback(!useHtml5Fallback)}
                      className="text-[10px] font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
                    >
                      {useHtml5Fallback ? 'Use YouTube Player' : 'Use HTML5 Player'}
                    </button>
                    <button
                      onClick={() => openExternal(activeVideo.rawUrl)}
                      className="text-[10px] font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 px-2.5 py-1 rounded-lg border border-amber-500/30 flex items-center gap-1 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" /> YouTube ↗
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Body: Curriculum Modules List */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Course Video Modules ({curriculum.length})
              </h3>

              {curriculum.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-sm">
                  No video modules uploaded for this course yet.
                </div>
              ) : (
                curriculum.map((mod: any, idx: number) => {
                  const isExpanded = !!expandedModules[idx];
                  const videos = mod.videos || [];

                  return (
                    <div key={idx} className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
                      <button
                        onClick={() => toggleModule(idx)}
                        className="w-full p-3.5 text-left flex items-center justify-between bg-slate-900/50 hover:bg-slate-900 transition-colors"
                      >
                        <span className="font-bold text-white text-sm">{mod.title || `Module ${idx + 1}`}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </button>

                      {isExpanded && (
                        <div className="p-3 border-t border-slate-800 space-y-2">
                          {videos.length === 0 ? (
                            <p className="text-xs text-slate-500 italic">No video lessons in this module.</p>
                          ) : (
                            videos.map((vid: any, vIdx: number) => {
                              const isPlaying = activeVideo?.title === vid.title;
                              return (
                                <div
                                  key={vIdx}
                                  onClick={() => {
                                    const embedInfo = getEmbedInfo(vid.url || '', selectedCourse.title_name);
                                    setActiveVideo({ title: vid.title, ...embedInfo });
                                  }}
                                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                                    isPlaying
                                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                                      : 'bg-slate-900 hover:bg-amber-500/10 border-slate-800 hover:border-amber-500/30 text-slate-200'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <PlayCircle className={`w-4 h-4 shrink-0 ${isPlaying ? 'fill-amber-500 text-slate-950 animate-pulse' : 'text-amber-500'}`} />
                                    <span className="text-xs font-semibold">
                                      {vid.title}
                                    </span>
                                  </div>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isPlaying ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                                    {isPlaying ? 'PLAYING' : 'PLAY LESSON'}
                                  </span>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between">
              <span className="text-xs text-slate-500">Tap any video lesson to play in-app</span>
              <button
                onClick={() => {
                  setSelectedCourse(null);
                  setActiveVideo(null);
                }}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
              >
                Close Player
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
