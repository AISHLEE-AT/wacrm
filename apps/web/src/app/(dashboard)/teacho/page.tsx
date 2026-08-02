// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Brain, 
  Clock, 
  Award, 
  Search, 
  ChevronRight, 
  Play, 
  CheckCircle, 
  FileText, 
  Sparkles,
  ArrowLeft,
  X,
  Lock,
  Volume2,
  Download,
  Share2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// Featured LMS Courses List across Tamil Nadu & India Competitive Exams & School Subjects
const FEATURED_COURSES = [
  {
    id: 'tnpsc-group1',
    title: 'TNPSC Group 1 & 2 Comprehensive Masterclass (தமிழ் / Eng)',
    category: 'TNPSC',
    level: 'Advanced',
    duration: '120 Hours',
    rating: 4.9,
    students: 14200,
    price: 'Free',
    thumbnail: '🏛️',
    color: 'from-amber-500 to-orange-600',
    description: 'Complete Tamil Nadu Public Service Commission Group 1 & 2 Prelims + Mains syllabus coverage including History, Polity, Economy, INM, and Tamil Society.',
    modules: [
      {
        title: 'Module 1: General Science & Physics (இயற்பியல்)',
        lessons: [
          { title: 'Nature of Universe & Big Bang Theory (பிரபஞ்சத்தின் தோற்றம்)', duration: '25 mins', completed: true },
          { title: 'Newton\'s Laws of Motion & Force (நியூட்டனின் இயக்க விதிகள்)', duration: '30 mins', completed: false },
          { title: 'Electricity, Magnetism & Ohm\'s Law (மின்சாரம் & காந்தவியல்)', duration: '40 mins', completed: false }
        ]
      },
      {
        title: 'Module 2: Indian National Movement & Tamil History',
        lessons: [
          { title: 'Early Uprisings in Tamil Nadu: Veerapandiya Kattabomman', duration: '35 mins', completed: false },
          { title: 'Justice Party & Self-Respect Movement (திராவிட இயக்கம்)', duration: '45 mins', completed: false }
        ]
      }
    ]
  },
  {
    id: 'stateboard-10th-science',
    title: 'Class 10 State Board Science (10-ஆம் வகுப்பு அறிவியல்)',
    category: 'TN State Board',
    level: 'School',
    duration: '85 Hours',
    rating: 4.8,
    students: 28900,
    price: 'Free',
    thumbnail: '🔬',
    color: 'from-emerald-500 to-teal-600',
    description: 'Complete Samacheer Kalvi Class 10 Science with animated diagrams, unit test solutions, and board exam model paper walkthroughs.',
    modules: [
      {
        title: 'Unit 1: Laws of Motion (இயக்க விதிகள்)',
        lessons: [
          { title: 'Inertia & Linear Momentum (நிலைமம் & உந்தம்)', duration: '20 mins', completed: true },
          { title: 'Newton\'s Second & Third Law Applications', duration: '25 mins', completed: false }
        ]
      },
      {
        title: 'Unit 2: Optics & Light (ஒளியியல்)',
        lessons: [
          { title: 'Refraction of Light & Convex/Concave Lenses', duration: '30 mins', completed: false },
          { title: 'Human Eye & Vision Defects (மயோபியா & ஹைபர்மெட்ரோபியா)', duration: '35 mins', completed: false }
        ]
      }
    ]
  },
  {
    id: 'upsc-general-studies',
    title: 'UPSC Civil Services Prelims General Studies (GS Paper I)',
    category: 'UPSC & Central',
    level: 'Advanced',
    duration: '180 Hours',
    rating: 4.9,
    students: 9800,
    price: 'Free',
    thumbnail: '🇮🇳',
    color: 'from-blue-500 to-indigo-600',
    description: 'Indian Polity, Constitution, Modern History, Geography, Environment, and Current Affairs targeted for IAS/IPS aspirants.',
    modules: [
      {
        title: 'Module 1: Indian Polity & Preamble',
        lessons: [
          { title: 'Making of the Constitution & Key Features', duration: '40 mins', completed: false },
          { title: 'Fundamental Rights (Articles 12-35)', duration: '50 mins', completed: false }
        ]
      }
    ]
  },
  {
    id: 'neet-jee-physics',
    title: 'NEET & JEE Physics Master Series (இயற்பியல் சூத்திரங்கள்)',
    category: 'NEET / JEE',
    level: 'Competitive',
    duration: '150 Hours',
    rating: 4.9,
    students: 18400,
    price: 'Free',
    thumbnail: '⚡',
    color: 'from-purple-500 to-pink-600',
    description: 'High-yield numerical problem solving, formula cheat sheets, and previous 10 years question paper walkthroughs for NEET/JEE entrance.',
    modules: [
      {
        title: 'Chapter 1: Kinematics & 2D Motion',
        lessons: [
          { title: 'Projectile Motion Shortcuts & Trajectory Formulae', duration: '45 mins', completed: false },
          { title: 'Relative Velocity in River-Boat & Rain Problems', duration: '40 mins', completed: false }
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
    students: 12500,
    price: 'Free',
    thumbnail: '👮',
    color: 'from-cyan-500 to-blue-600',
    description: 'Targeted preparation for TNUSRB Sub-Inspector & Constable written test, general knowledge, psychology, and physical test guide.',
    modules: [
      {
        title: 'Part A: General Knowledge & Tamil Eligibility',
        lessons: [
          { title: 'Tamil Grammar & Literature High Priority Topics', duration: '30 mins', completed: false },
          { title: 'Psychological Reasoning & Numerical Ability', duration: '35 mins', completed: false }
        ]
      }
    ]
  },
  {
    id: 'web-dev-careers',
    title: 'Full-Stack Web Development & AI Coding (மென்பொருள் வேலை)',
    category: 'Tech & Careers',
    level: 'Beginner to Pro',
    duration: '90 Hours',
    rating: 5.0,
    students: 31200,
    price: 'Free',
    thumbnail: '💻',
    color: 'from-emerald-400 to-cyan-500',
    description: 'Learn modern Web App development with React, Next.js, Tailwind CSS, Supabase DB, and AI tool integration.',
    modules: [
      {
        title: 'Module 1: Modern Web Standards',
        lessons: [
          { title: 'HTML5 Semantic Markup & Accessibility', duration: '20 mins', completed: true },
          { title: 'React Hooks & State Management Essentials', duration: '45 mins', completed: false }
        ]
      }
    ]
  }
];

const CATEGORIES = [
  'All Levels',
  'TN State Board',
  'CBSE',
  'TNPSC',
  'UPSC & Central',
  'Defense & Police',
  'NEET / JEE',
  'Tech & Careers'
];

export default function TeachOPage() {
  const [selectedCategory, setSelectedCategory] = useState('All Levels');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCourse, setActiveCourse] = useState<any>(null);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [dbCourses, setDbCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  // Fetch Supabase lms_courses database rows
  useEffect(() => {
    async function loadLmsCourses() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('lms_courses')
          .select('*');

        if (!error && data && data.length > 0) {
          setDbCourses(data);
        }
      } catch (err) {
        console.error('LMS Courses fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLmsCourses();
  }, []);

  const allCourses = [...FEATURED_COURSES, ...dbCourses.map(d => ({
    id: d.id,
    title: d.title || d.title_name || 'Course',
    category: d.category || 'General',
    level: d.level || 'All Levels',
    duration: d.duration || '20 Hours',
    rating: 4.8,
    students: d.enrolled_count || 1200,
    price: 'Free',
    thumbnail: '📚',
    color: 'from-purple-500 to-indigo-600',
    description: d.description || d.summary || 'Comprehensive course material.',
    modules: d.modules || [
      {
        title: 'Module 1: Fundamental Lessons',
        lessons: [
          { title: 'Introduction & Key Principles', duration: '20 mins', completed: false },
          { title: 'Core Concepts Walkthrough', duration: '30 mins', completed: false }
        ]
      }
    ]
  }))];

  const filteredCourses = allCourses.filter(course => {
    const matchesCategory = selectedCategory === 'All Levels' || course.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white p-4 md:p-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-500/30 rounded-2xl p-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40">
              <GraduationCap className="w-6 h-6" />
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300">
              TeachO • கல்வி பாடங்கள் &amp; LMS Engine
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-300">
            தமிழ்நாடு பள்ளி பாடங்கள், TNPSC, UPSC, காவலர் தேர்வு மற்றும் NEET/JEE போட்டித் தேர்வு பாடப்பிரிவுகள்.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> 100% Free LMS Access
          </span>
        </div>
      </div>

      {/* Course Reader View Modal */}
      {activeCourse && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/40 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border-b border-purple-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{activeCourse.thumbnail}</span>
                <div>
                  <h2 className="text-lg md:text-xl font-black text-white">{activeCourse.title}</h2>
                  <span className="text-xs text-purple-300">{activeCourse.category} • {activeCourse.duration}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveCourse(null);
                  setActiveLesson(null);
                }}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <p className="text-sm text-slate-300">{activeCourse.description}</p>

              {/* Lesson Active Player */}
              {activeLesson ? (
                <div className="bg-slate-950 border border-purple-500/30 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                      <Play className="w-4 h-4 text-purple-400" /> Active Lesson: {activeLesson.title}
                    </span>
                    <button
                      onClick={() => setActiveLesson(null)}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back to Curriculum
                    </button>
                  </div>

                  <div className="prose prose-invert max-w-none text-xs md:text-sm text-slate-200 space-y-3 leading-relaxed">
                    <h3 className="text-base font-bold text-white">Lesson Summary &amp; Key Study Notes</h3>
                    <p>
                      Welcome to this lesson on <strong>{activeLesson.title}</strong>. This unit provides essential theoretical foundations, Tamil translations, and high-yield formula walk-throughs designed for exam success.
                    </p>
                    <div className="p-4 bg-purple-950/40 border border-purple-500/30 rounded-xl space-y-2">
                      <strong className="text-purple-300 block text-xs uppercase tracking-wider">📌 Important Takeaways:</strong>
                      <ul className="list-disc list-inside space-y-1 text-slate-300">
                        <li>Understand the core principles and mathematical relationships.</li>
                        <li>Practice 5 previous year question paper patterns.</li>
                        <li>Review Tamil terms: இயற்பியல், இயக்கவியல், அலகுகள் மற்றும் அளவீடுகள்.</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <span className="text-xs text-slate-400">Duration: {activeLesson.duration}</span>
                    <button
                      onClick={() => alert('Quiz Completed! 100% Score added to your profile points.')}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs flex items-center gap-1.5 transition shadow"
                    >
                      <CheckCircle className="w-4 h-4" /> Mark Lesson Complete &amp; Take Quiz
                    </button>
                  </div>
                </div>
              ) : (
                /* Modules Breakdown */
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Course Modules &amp; Lessons</h3>
                  {activeCourse.modules.map((mod: any, mIdx: number) => (
                    <div key={mIdx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                      <h4 className="text-sm font-bold text-purple-300">{mod.title}</h4>
                      <div className="space-y-2">
                        {mod.lessons.map((les: any, lIdx: number) => (
                          <div
                            key={lIdx}
                            onClick={() => setActiveLesson(les)}
                            className="flex items-center justify-between p-3 rounded-lg bg-slate-900 hover:bg-purple-950/50 border border-slate-800 hover:border-purple-500/40 cursor-pointer transition"
                          >
                            <div className="flex items-center gap-3">
                              <span className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                                <FileText className="w-4 h-4" />
                              </span>
                              <div>
                                <span className="text-xs font-bold text-white block">{les.title}</span>
                                <span className="text-[10px] text-slate-400">{les.duration}</span>
                              </div>
                            </div>

                            <button className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1">
                              Start <Play className="w-3 h-3 fill-current" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-4">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search courses (e.g. TNPSC, Physics, 10th Science, UPSC...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs md:text-sm focus:outline-none focus:border-purple-500 transition"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 scrollbar-none">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            onClick={() => setActiveCourse(course)}
            className="bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-6 space-y-4 cursor-pointer transition-all hover:scale-[1.01] shadow-md hover:shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  {course.thumbnail}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-300 text-[10px] font-bold border border-purple-500/30">
                  {course.category}
                </span>
              </div>

              <h3 className="text-base font-bold text-white leading-snug line-clamp-2">
                {course.title}
              </h3>

              <p className="text-xs text-slate-400 line-clamp-2">
                {course.description}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3 text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-purple-400" /> {course.duration}
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-pink-400" /> {course.modules.length} Modules
                </span>
              </div>

              <button className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white font-bold text-xs flex items-center gap-1 border border-purple-500/30 transition">
                Enroll Free <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
