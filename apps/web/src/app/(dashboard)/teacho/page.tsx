'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  GraduationCap, BookOpen, Clock, Search, ChevronRight,
  Play, CheckCircle, FileText, Sparkles, X, ArrowLeft,
  Loader2, RefreshCw, Star, Users, BarChart3, Lock
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';

// ─── Types ─────────────────────────────────────────────────────────
interface Lesson {
  title: string;
  duration: string;
  youtube_id?: string;
  notes?: string;
}

interface Module {
  title: string;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  category: string;
  level: string;
  duration: string;
  rating: number;
  enrolled_count: number;
  price: string;
  thumbnail: string;
  color: string;
  description: string;
  modules: Module[];
  created_at?: string;
}

interface ProgressRow {
  course_id: string;
  lesson_idx: number;
  module_idx: number;
  completed: boolean;
}

// ─── Hardcoded courses with real YouTube lesson IDs ─────────────────
const COURSES: Course[] = [
  {
    id: 'tnpsc-group1',
    title: 'TNPSC Group 1 & 2 Comprehensive Masterclass',
    category: 'TNPSC',
    level: 'Advanced',
    duration: '120 Hours',
    rating: 4.9,
    enrolled_count: 14200,
    price: 'Free',
    thumbnail: '🏛️',
    color: 'from-amber-500 to-orange-600',
    description: 'Tamil Nadu Public Service Commission Group 1 & 2 complete syllabus — History, Polity, Economy, and Tamil Society.',
    modules: [
      {
        title: 'Module 1: General Science & Physics',
        lessons: [
          { title: 'பிரபஞ்சத்தின் தோற்றம் (Big Bang Theory)', duration: '25 mins', youtube_id: 'HdPzOWlLrbE', notes: 'பெரு வெடிப்பு கோட்பாடு: 13.8 பில்லியன் ஆண்டுகளுக்கு முன்பு பிரபஞ்சம் தோன்றியது.' },
          { title: "Newton's Laws of Motion (நியூட்டனின் விதிகள்)", duration: '30 mins', youtube_id: 'kKKM8Y-u7ds', notes: 'F = ma | விசை = நிறை × முடுக்கம்' },
        ]
      },
      {
        title: 'Module 2: Indian National Movement',
        lessons: [
          { title: 'Veerapandiya Kattabomman (வீரபாண்டிய கட்டபொம்மன்)', duration: '35 mins', youtube_id: 'DtlKbVRLCnY', notes: '1799-இல் பாளையகாரர்கள் போர். சர்க்கார் இந்திய வரலாற்றில் முக்கிய புரட்சியாளர்.' },
          { title: 'Justice Party & Self-Respect Movement', duration: '45 mins', youtube_id: 'BbGGXDJX5HI' },
        ]
      },
    ],
  },
  {
    id: 'stateboard-10th-science',
    title: 'Class 10 State Board Science (10-ஆம் வகுப்பு அறிவியல்)',
    category: 'TN State Board',
    level: 'School',
    duration: '85 Hours',
    rating: 4.8,
    enrolled_count: 28900,
    price: 'Free',
    thumbnail: '🔬',
    color: 'from-emerald-500 to-teal-600',
    description: 'Samacheer Kalvi Class 10 Science with animated diagrams, unit tests, and board exam walkthroughs.',
    modules: [
      {
        title: 'Unit 1: Laws of Motion',
        lessons: [
          { title: 'Inertia & Linear Momentum (நிலைமம்)', duration: '20 mins', youtube_id: 'CQYELiTtUs8' },
          { title: "Newton's Second & Third Law", duration: '25 mins', youtube_id: 'Mz4xzJ9K1Ak' },
        ]
      },
      {
        title: 'Unit 2: Optics & Light',
        lessons: [
          { title: 'Refraction & Lenses (ஒளி விலகல்)', duration: '30 mins', youtube_id: 'BthDL5H_Lss' },
          { title: 'Human Eye & Vision Defects', duration: '35 mins', youtube_id: 'AAMAvFsmMM0' },
        ]
      }
    ]
  },
  {
    id: 'neet-jee-physics',
    title: 'NEET & JEE Physics Master Series (இயற்பியல்)',
    category: 'NEET / JEE',
    level: 'Competitive',
    duration: '150 Hours',
    rating: 4.9,
    enrolled_count: 18400,
    price: 'Free',
    thumbnail: '⚡',
    color: 'from-purple-500 to-pink-600',
    description: 'High-yield numerical problem solving, formula sheets, and 10-year question paper walkthroughs.',
    modules: [
      {
        title: 'Chapter 1: Kinematics & 2D Motion',
        lessons: [
          { title: 'Projectile Motion Shortcuts', duration: '45 mins', youtube_id: 'bKEaK7Mu-zk' },
          { title: 'Relative Velocity Problems', duration: '40 mins', youtube_id: 'z3EpO0eMBZY' },
        ]
      }
    ]
  },
  {
    id: 'web-dev-careers',
    title: 'Full-Stack Web Development & AI Coding',
    category: 'Tech & Careers',
    level: 'Beginner to Pro',
    duration: '90 Hours',
    rating: 5.0,
    enrolled_count: 31200,
    price: 'Free',
    thumbnail: '💻',
    color: 'from-cyan-500 to-blue-600',
    description: 'React, Next.js, Supabase DB, AI tool integration — modern web app development from scratch.',
    modules: [
      {
        title: 'Module 1: Modern Web Standards',
        lessons: [
          { title: 'HTML5 Semantic Markup & Accessibility', duration: '20 mins', youtube_id: 'UB1O30fR-EE' },
          { title: 'React Hooks & State Management', duration: '45 mins', youtube_id: 'O6P86uwfdR0' },
        ]
      }
    ]
  },
  {
    id: 'police-constable-exam',
    title: 'TNUSRB Police Constable & SI Exam Prep (காவலர் தேர்வு)',
    category: 'Defense & Police',
    level: 'Intermediate',
    duration: '60 Hours',
    rating: 4.7,
    enrolled_count: 12500,
    price: 'Free',
    thumbnail: '👮',
    color: 'from-cyan-500 to-blue-600',
    description: 'TNUSRB Sub-Inspector & Constable written test, general knowledge, psychology, and physical test guide.',
    modules: [
      {
        title: 'Part A: General Knowledge & Tamil Eligibility',
        lessons: [
          { title: 'Tamil Grammar High Priority Topics', duration: '30 mins', youtube_id: 'XDNZ3iDNJEo' },
          { title: 'Psychological Reasoning & Numerical Ability', duration: '35 mins', youtube_id: 'pBaOgXtiCC8' },
        ]
      }
    ]
  },
];

const CATEGORIES = ['All', 'TN State Board', 'TNPSC', 'NEET / JEE', 'Defense & Police', 'Tech & Careers', 'UPSC'];
const LEVEL_COLORS: Record<string, string> = {
  School: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  Intermediate: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
  Advanced: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  Competitive: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
  'Beginner to Pro': 'bg-purple-500/10 text-purple-300 border-purple-500/30',
};

export default function TeachOPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [dbCourses, setDbCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<ProgressRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState('All');
  const [search, setSearch] = useState('');
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<{ lesson: Lesson; mIdx: number; lIdx: number } | null>(null);
  const [markingDone, setMarkingDone] = useState(false);

  // Load DB courses + user progress
  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('lms_courses').select('*').order('created_at', { ascending: false });
    if (data?.length) setDbCourses(data as Course[]);

    if (user?.id) {
      const { data: prog } = await supabase.from('course_progress').select('*').eq('user_id', user.id);
      setProgress(prog || []);
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  // Merge static + DB courses
  const allCourses = [...COURSES, ...dbCourses.filter(d => !COURSES.find(c => c.id === d.id))];
  const filtered = allCourses.filter(c => {
    const matchCat = selectedCat === 'All' || c.category === selectedCat;
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // Progress helpers
  const isLessonDone = (courseId: string, mIdx: number, lIdx: number) =>
    progress.some(p => p.course_id === courseId && p.module_idx === mIdx && p.lesson_idx === lIdx && p.completed);

  const courseProgress = (course: Course) => {
    const total = course.modules.reduce((s, m) => s + m.lessons.length, 0);
    const done = course.modules.reduce((s, m, mi) => s + m.lessons.filter((_, li) => isLessonDone(course.id, mi, li)).length, 0);
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
  };

  const markComplete = async (courseId: string, mIdx: number, lIdx: number) => {
    if (!user?.id) return;
    setMarkingDone(true);
    await supabase.from('course_progress').upsert({
      user_id: user.id, course_id: courseId, module_idx: mIdx, lesson_idx: lIdx, completed: true,
    }, { onConflict: 'user_id,course_id,module_idx,lesson_idx' });
    await load();
    setMarkingDone(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-500/30 rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <span className="p-2.5 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-xl"><GraduationCap className="w-6 h-6" /></span>
          <div>
            <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300">TeachO • கல்வி LMS Engine</h1>
            <p className="text-xs text-slate-400">Live Supabase course progress tracking + YouTube lessons + 100% Free</p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/30 px-3 py-1.5 rounded-full flex items-center gap-1">
            <Sparkles className="h-3 w-3" />{allCourses.length} Courses
          </span>
          <button onClick={load} className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white"><RefreshCw className="h-4 w-4" /></button>
        </div>
      </div>

      {/* Search + Category */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" placeholder="Search courses (TNPSC, Physics, 10th Science...)" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500" />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setSelectedCat(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${selectedCat === c ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'}`}>{c}</button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-purple-400" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(course => {
            const prog = courseProgress(course);
            return (
              <div key={course.id} onClick={() => setActiveCourse(course)}
                className="bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-5 space-y-4 cursor-pointer transition hover:scale-[1.01] flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{course.thumbnail || '📚'}</span>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${LEVEL_COLORS[course.level] || 'bg-slate-800 text-slate-400 border-slate-700'}`}>{course.level}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white line-clamp-2">{course.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{course.description}</p>
                  {/* Progress bar */}
                  {prog.done > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>{prog.done}/{prog.total} lessons done</span>
                        <span className="text-purple-400 font-bold">{prog.pct}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all" style={{ width: `${prog.pct}%` }} />
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-purple-400" />{course.duration}</span>
                    <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5 text-pink-400" />{(course.enrolled_count || 0).toLocaleString()}</span>
                    <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-amber-400" />{course.rating}</span>
                  </div>
                </div>
                <button className="w-full py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-purple-500/30 transition">
                  {prog.done > 0 ? 'Continue Learning' : 'Start Course'} <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Course Detail Modal */}
      {activeCourse && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/40 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border-b border-purple-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{activeCourse.thumbnail}</span>
                <div>
                  <h2 className="text-base font-black text-white">{activeCourse.title}</h2>
                  <p className="text-xs text-purple-300">{activeCourse.category} • {activeCourse.duration}</p>
                </div>
              </div>
              <button onClick={() => { setActiveCourse(null); setActiveLesson(null); }} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {activeLesson ? (
                /* Lesson Player */
                <div className="space-y-4">
                  <button onClick={() => setActiveLesson(null)} className="text-xs text-slate-400 hover:text-white flex items-center gap-1"><ArrowLeft className="h-4 w-4" />Back to curriculum</button>
                  <div className="w-full aspect-video bg-black rounded-xl overflow-hidden">
                    {activeLesson.lesson.youtube_id ? (
                      <iframe src={`https://www.youtube.com/embed/${activeLesson.lesson.youtube_id}?autoplay=1`}
                        className="w-full h-full" allowFullScreen allow="autoplay; encrypted-media" title={activeLesson.lesson.title} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-950">
                        <div className="text-center"><Play className="h-16 w-16 text-purple-500 opacity-40 mx-auto mb-2" /><p className="text-sm text-slate-400">{activeLesson.lesson.title}</p></div>
                      </div>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-white">{activeLesson.lesson.title}</h3>
                  {activeLesson.lesson.notes && (
                    <div className="p-4 bg-purple-950/40 border border-purple-500/30 rounded-xl text-xs text-slate-300 leading-relaxed">
                      <p className="font-bold text-purple-300 mb-2">📌 Study Notes:</p>
                      <p>{activeLesson.lesson.notes}</p>
                    </div>
                  )}
                  <button onClick={() => markComplete(activeCourse.id, activeLesson.mIdx, activeLesson.lIdx)} disabled={markingDone || isLessonDone(activeCourse.id, activeLesson.mIdx, activeLesson.lIdx)}
                    className={`w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition ${isLessonDone(activeCourse.id, activeLesson.mIdx, activeLesson.lIdx) ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 cursor-default' : 'bg-emerald-500 hover:bg-emerald-400 text-black'}`}>
                    {isLessonDone(activeCourse.id, activeLesson.mIdx, activeLesson.lIdx) ? <><CheckCircle className="h-5 w-5" /> Completed ✓</> : markingDone ? <Loader2 className="h-5 w-5 animate-spin" /> : <><CheckCircle className="h-5 w-5" /> Mark as Complete</>}
                  </button>
                </div>
              ) : (
                /* Curriculum view */
                <div className="space-y-4">
                  <p className="text-sm text-slate-300">{activeCourse.description}</p>
                  {/* Overall progress */}
                  {(() => { const p = courseProgress(activeCourse); return p.total > 0 && (
                    <div className="p-3 bg-slate-800 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-xs"><span className="text-slate-300 font-bold"><BarChart3 className="h-3.5 w-3.5 inline mr-1 text-purple-400" />Progress</span><span className="text-purple-400 font-black">{p.done}/{p.total} ({p.pct}%)</span></div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: `${p.pct}%` }} /></div>
                    </div>
                  ); })()}
                  {activeCourse.modules.map((mod, mIdx) => (
                    <div key={mIdx} className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                      <div className="p-3 bg-slate-900 border-b border-slate-800">
                        <h4 className="text-xs font-bold text-purple-300">{mod.title}</h4>
                      </div>
                      <div className="divide-y divide-slate-800">
                        {mod.lessons.map((les, lIdx) => {
                          const done = isLessonDone(activeCourse.id, mIdx, lIdx);
                          return (
                            <div key={lIdx} onClick={() => setActiveLesson({ lesson: les, mIdx, lIdx })}
                              className="flex items-center justify-between p-3 hover:bg-slate-900 cursor-pointer transition">
                              <div className="flex items-center gap-3">
                                <span className={`p-1.5 rounded-lg ${done ? 'bg-emerald-500/20 text-emerald-400' : 'bg-purple-500/10 text-purple-400'}`}>
                                  {done ? <CheckCircle className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                                </span>
                                <div>
                                  <p className="text-xs font-bold text-white">{les.title}</p>
                                  <p className="text-[10px] text-slate-400">{les.duration}</p>
                                </div>
                              </div>
                              <button className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] flex items-center gap-1 transition">
                                <Play className="h-3 w-3 fill-current" /> Start
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
          </div>
        </div>
      )}
    </div>
  );
}
