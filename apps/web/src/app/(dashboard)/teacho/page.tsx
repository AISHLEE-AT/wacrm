// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  GraduationCap,
  PlayCircle,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Award,
  FileText,
  X,
  Download,
  Share2,
  Play,
  Plus,
  Star,
  Loader2
} from 'lucide-react';

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

// Fallback Aishlee catalog if database is being populated
const FALLBACK_COURSES = [
  {
    id: 'computer_ops',
    title: 'கணினி செயல்பாடுகள் & அலுவலக தொகுப்பு - மேம்பட்ட பயிற்சி',
    subtitle: 'COMPUTER OPERATIONS & OFFICE SUITE - ADVANCED',
    category: 'Tech & Careers',
    icon: '💻',
    rating: '4.8 ★★★★★ (1,245 ratings)',
    author: 'By Aishlee Expert',
    lessons_count: '9 Lessons',
    price: '₹799',
    original_price: '₹1,598',
    is_bestseller: true,
    is_free: false,
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    description: 'கணினி இயக்க முறைமை, MS Office, தமிழ் தட்டச்சு மற்றும் இணைய பயன்பாடுகள் பற்றிய முழுமையான தொடக்கநிலை பாடங்கள்.',
    curriculum: '• 1. Introduction to Computer & Windows OS\n• 2. MS Word & Tamil Typing Mastery\n• 3. MS Excel Data Analysis & Formatting',
    level: 'Advanced'
  },
  {
    id: 'tn_11_maths',
    title: '11th Standard Mathematics (TN Board)',
    subtitle: '11TH STANDARD MATHEMATICS (TN BOARD)',
    category: 'TN State Board',
    icon: '📐',
    rating: '4.9 ★★★★★ (2,100 ratings)',
    author: 'By Aishlee Math Faculty',
    lessons_count: '12 Lessons',
    price: 'Free',
    original_price: '',
    is_bestseller: true,
    is_free: true,
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    description: 'Tamil Nadu State Board 11th Mathematics complete chapter-wise video lessons and study guides.',
    curriculum: '• Chapter 1: Sets, Relations and Functions\n• Chapter 2: Basic Algebra\n• Chapter 3: Trigonometry',
    level: 'High School'
  },
  {
    id: 'tn_11_bio',
    title: '11th Standard Biology (TN Board)',
    subtitle: '11TH STANDARD BIOLOGY (TN BOARD)',
    category: 'TN State Board',
    icon: '🧬',
    rating: '4.8 ★★★★★ (1,850 ratings)',
    author: 'By Aishlee Biology Expert',
    lessons_count: '14 Lessons',
    price: 'Free',
    original_price: '',
    is_bestseller: false,
    is_free: true,
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    description: 'Tamil Nadu State Board 11th Biology (Botany & Zoology) comprehensive concepts & diagram guides.',
    curriculum: '• Unit 1: Diversity of Living World\n• Unit 2: Plant Morphology and Taxonomy\n• Unit 3: Cell Biology and Genetics',
    level: 'High School'
  },
  {
    id: 'tnpsc_group4',
    title: 'TNPSC Group 4 & Group 2 பொதுத் தமிழ் & பொது அறிவு',
    subtitle: 'Complete TNPSC Tamil & General Studies Mastery Course',
    category: 'TNPSC',
    icon: '📚',
    rating: '4.9 ★★★★★ (3,400 ratings)',
    author: 'By Aishlee TNPSC Academy',
    lessons_count: '15 Lessons',
    price: 'Free',
    original_price: '',
    is_bestseller: true,
    is_free: true,
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    description: 'TNPSC தேர்வுக்கான 6 முதல் 10-ஆம் வகுப்பு வரையிலான சமச்சீர் கல்வி தமிழ் வினா-விடைகள், வரலாறு, அரசியல் மற்றும் கணிதம் பாடக் குறிப்புகள்.',
    curriculum: '• அலகு 1: பொதுத் தமிழ் இலக்கணம் & இலக்கியம்\n• அலகு 2: இந்திய தேசிய இயக்கம் & தமிழ்நாடு வரலாறு\n• அலகு 3: கணிதம் & திறனறி தேர்வு (Aptitude)',
    level: 'Beginner to Advanced'
  }
];

export default function TeachOWebDashboard() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All Levels');
  const [activeCourse, setActiveCourse] = useState<any | null>(null);
  const [authQuery, setAuthQuery] = useState('');

  const supabase = createClient();

  useEffect(() => {
    async function loadAishleeCoursesAndSession() {
      setLoading(true);
      try {
        // Fetch active auth tokens for seamless 1-tap navigation to Aishlee Web
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const tokens = `?access_token=${encodeURIComponent(session.access_token)}&refresh_token=${encodeURIComponent(session.refresh_token)}#access_token=${session.access_token}&refresh_token=${session.refresh_token}&token_type=bearer`;
          setAuthQuery(tokens);
        }

        // Dynamically query live courses directly from Aishlee database
        const { data, error } = await supabase
          .from('lms_courses')
          .select('*')
          .order('created_at', { ascending: false });

        if (data && data.length > 0) {
          setCourses(data);
        } else {
          // Fallback query if table name is 'courses'
          const { data: altData } = await supabase.from('courses').select('*');
          if (altData && altData.length > 0) {
            setCourses(altData);
          } else {
            setCourses(FALLBACK_COURSES);
          }
        }
      } catch (err) {
        console.error('Error fetching live Aishlee courses:', err);
        setCourses(FALLBACK_COURSES);
      } finally {
        setLoading(false);
      }
    }
    loadAishleeCoursesAndSession();
  }, []);

  const openAishleeWeb = (path: string = '/teacho') => {
    const targetUrl = `https://thamizhan.vercel.app${path}${authQuery}`;
    window.open(targetUrl, '_blank');
  };

  const filteredCourses = selectedCategory === 'All Levels'
    ? courses
    : courses.filter(c => c.category === selectedCategory || c.category?.includes(selectedCategory));

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white p-4 md:p-8 space-y-8">
      {/* Header & Direct External Link */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-2xl text-purple-400">
            <GraduationCap className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              TeachO • Aishlee Technology LMS
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-0.5">
              Live Connected LMS Courses directly from Aishlee Web App
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => openAishleeWeb('/teacho/approvals')}
            className="px-4 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 font-bold text-xs flex items-center gap-2 hover:bg-purple-500/20 transition"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Approvals
          </button>
          <button
            onClick={() => openAishleeWeb('/teacho/create')}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition"
          >
            <Plus className="w-4 h-4" /> Create New
          </button>
          <button
            onClick={() => openAishleeWeb('/teacho')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-xs flex items-center gap-2 shadow-xl hover:opacity-90 transition"
          >
            Open Full Screen on Aishlee Web <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              selectedCategory === cat
                ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-500/20 scale-105'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Header Info */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" /> Live Courses ({filteredCourses.length})
        </h2>
        {loading && (
          <div className="flex items-center gap-2 text-xs text-purple-400">
            <Loader2 className="w-4 h-4 animate-spin" /> Syncing with Aishlee Web...
          </div>
        )}
      </div>

      {/* Dynamic Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="group relative bg-card/40 border border-white/10 hover:border-purple-500/40 rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 backdrop-blur-md"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-extrabold tracking-wider uppercase">
                    COMPLETE
                  </span>
                  {course.price === 'Free' || course.is_free ? (
                    <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] font-extrabold tracking-wider uppercase">
                      FREE
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-extrabold tracking-wider uppercase">
                      BESTSELLER
                    </span>
                  )}
                </div>
                <span className="text-xs text-purple-300 font-bold bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
                  {course.category || 'General'}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{course.icon || '📚'}</span>
                  <div>
                    <h3 className="text-base font-extrabold text-white group-hover:text-purple-300 transition line-clamp-1">
                      {course.subtitle || course.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium line-clamp-1">
                      {course.title}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed pt-1">
                  {course.description}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 border-t border-white/5 pt-3">
                <span className="flex items-center gap-1 font-semibold text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-current" /> {course.rating || '4.8 ★★★★★'}
                </span>
                <span className="font-semibold text-slate-300">{course.lessons_count || '10 Lessons'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/10">
              <div>
                <span className="text-lg font-black text-white">{course.price || 'Free'}</span>
                {course.original_price && (
                  <span className="text-xs text-slate-500 line-through ml-2 font-semibold">
                    {course.original_price}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setActiveCourse(course)}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Go to Course
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Course Viewer Modal */}
      {activeCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0F172A] border border-purple-500/30 w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 bg-slate-900 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{activeCourse.icon || '📚'}</span>
                <div>
                  <h3 className="text-base font-bold text-white">{activeCourse.title}</h3>
                  <span className="text-xs text-purple-400 font-semibold">{activeCourse.subtitle || activeCourse.category}</span>
                </div>
              </div>
              <button
                onClick={() => setActiveCourse(null)}
                className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden border border-white/10 shadow-inner">
                <iframe
                  src={activeCourse.video_url || 'https://www.youtube.com/embed/dQw4w9WgXcQ'}
                  title={activeCourse.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white">📖 பாடத்திட்டம் (Curriculum):</h4>
                <div className="p-4 bg-slate-900 border border-white/10 rounded-2xl text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                  {activeCourse.curriculum || activeCourse.description}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                {activeCourse.pdf_url && (
                  <a
                    href={activeCourse.pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center gap-2 hover:bg-emerald-500/20 transition"
                  >
                    <Download className="w-4 h-4" /> Download PDF Notes
                  </a>
                )}
                <button
                  onClick={() => {
                    const text = `🎓 Check out this TeachO Course on FAGO: ${activeCourse.title} - https://watscrm.vercel.app/teacho`;
                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow transition"
                >
                  <Share2 className="w-4 h-4" /> Share on WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
