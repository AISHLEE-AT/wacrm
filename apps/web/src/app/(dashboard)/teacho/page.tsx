// @ts-nocheck
'use client';

import React, { useState } from 'react';
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
  Check
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

const PRESEEDED_COURSES = [
  {
    id: 'computer_ops',
    title: 'கணினி செயல்பாடுகள் & அலுவலக தொகுப்பு - மேம்பட்ட பயிற்சி',
    subtitle: 'COMPUTER OPERATIONS & OFFICE SUITE - ADVANCED',
    category: 'Tech & Careers',
    icon: '💻',
    rating: '4.8 ★★★★★ (1,245 ratings)',
    author: 'By Aishlee Expert',
    lessonsCount: '9 Lessons',
    price: '₹799',
    originalPrice: '₹1,598',
    isBestseller: true,
    isFree: false,
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
    lessonsCount: '12 Lessons',
    price: 'Free',
    originalPrice: '',
    isBestseller: true,
    isFree: true,
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
    lessonsCount: '14 Lessons',
    price: 'Free',
    originalPrice: '',
    isBestseller: false,
    isFree: true,
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
    lessonsCount: '15 Lessons',
    price: 'Free',
    originalPrice: '',
    isBestseller: true,
    isFree: true,
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    description: 'TNPSC தேர்வுக்கான 6 முதல் 10-ஆம் வகுப்பு வரையிலான சமச்சீர் கல்வி தமிழ் வினா-விடைகள், வரலாறு, அரசியல் மற்றும் கணிதம் பாடக் குறிப்புகள்.',
    curriculum: '• அலகு 1: பொதுத் தமிழ் இலக்கணம் & இலக்கியம்\n• அலகு 2: இந்திய தேசிய இயக்கம் & தமிழ்நாடு வரலாறு\n• அலகு 3: கணிதம் & திறனறி தேர்வு (Aptitude)',
    level: 'Beginner to Advanced'
  },
  {
    id: 'tractor_depth',
    title: 'டிராக்டர் உழவு ஆழம் & ரோட்டவேட்டர் அமைத்தல்',
    subtitle: 'Tractor Rotavator & Disc Plough Depth Calibration Guide',
    category: 'Tech & Careers',
    icon: '🚜',
    rating: '4.7 ★★★★★ (920 ratings)',
    author: 'By Aishlee Agri Engineer',
    lessonsCount: '8 Lessons',
    price: 'Free',
    originalPrice: '',
    isBestseller: false,
    isFree: true,
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    description: 'டிராக்டர் ரோட்டவேட்டர் ஆழம் அமைப்பது எப்படி? டீசல் சிக்கனம் மற்றும் மண் உழவு நுட்பங்கள் பற்றிய நேரடி வீடியோ வழிகாட்டி.',
    curriculum: '• பகுதி 1: ரோட்டவேட்டர் பிளேடு அமைவு\n• பகுதி 2: 3-பாயிண்ட் ஹிட்ச் ஆழம் கட்டுப்பாடு\n• பகுதி 3: எரிபொருள் சிக்கன உழவு நுட்பம்',
    level: 'Practical Guide'
  },
  {
    id: 'drip_maint',
    title: 'சொட்டு நீர் பாசனம் & பம்ப் பராமரிப்பு',
    subtitle: 'Drip Irrigation Filter Cleaning & Submersible Motor Fixes',
    category: 'Tech & Careers',
    icon: '💧',
    rating: '4.9 ★★★★★ (1,150 ratings)',
    author: 'By Aishlee Irrigation Tech',
    lessonsCount: '10 Lessons',
    price: 'Free',
    originalPrice: '',
    isBestseller: true,
    isFree: true,
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    description: 'சொட்டு நீர் பாசன பில்டர் அடைப்பு நீக்குதல், வென்ச்சுரி உரம் செலுத்துதல் மற்றும் சப்மர்சிபிள் பம்ப் பராமரிப்பு செய்முறை.',
    curriculum: '• பகுதி 1: டிஸ்க் பில்டர் ஆசிட் வாஷ்\n• பகுதி 2: வென்ச்சுரி இன்ஜெக்டர் இயக்கம்\n• பகுதி 3: மோட்டார் ஸ்டார்ட்டர் பழுதுநீக்கம்',
    level: 'Practical Guide'
  }
];

export default function TeachOWebDashboard() {
  const [selectedCategory, setSelectedCategory] = useState('All Levels');
  const [activeCourse, setActiveCourse] = useState<any | null>(null);

  const filteredCourses = selectedCategory === 'All Levels'
    ? PRESEEDED_COURSES
    : PRESEEDED_COURSES.filter(c => c.category === selectedCategory);

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
              Explore Top-Rated Courses, School Books & Exam Preparation Guides
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 font-bold text-xs flex items-center gap-2 hover:bg-purple-500/20 transition">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Approvals
          </button>
          <button className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition">
            <Plus className="w-4 h-4" /> Create New
          </button>
          <a
            href="https://thamizhan.vercel.app/teacho"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-xs flex items-center gap-2 shadow-xl hover:opacity-90 transition"
          >
            Open Full Screen on Aishlee Web <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Category Filter Bar (Matching thamizhan.vercel.app) */}
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

      {/* Top Rated Courses Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" /> Top Rated Courses ({filteredCourses.length})
        </h2>
      </div>

      {/* Course Cards Grid (Exact thamizhan.vercel.app styling) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="group relative bg-card/40 border border-white/10 hover:border-purple-500/40 rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 backdrop-blur-md"
          >
            <div className="space-y-4">
              {/* Badges */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-extrabold tracking-wider uppercase">
                    COMPLETE
                  </span>
                  {course.isFree ? (
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
                  {course.category}
                </span>
              </div>

              {/* Title & Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{course.icon}</span>
                  <div>
                    <h3 className="text-base font-extrabold text-white group-hover:text-purple-300 transition line-clamp-1">
                      {course.subtitle}
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

              {/* Metadata */}
              <div className="flex items-center justify-between text-xs text-slate-400 border-t border-white/5 pt-3">
                <span className="flex items-center gap-1 font-semibold text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-current" /> {course.rating}
                </span>
                <span className="font-semibold text-slate-300">{course.lessonsCount}</span>
              </div>
            </div>

            {/* Price & CTA Button */}
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/10">
              <div>
                <span className="text-lg font-black text-white">{course.price}</span>
                {course.originalPrice && (
                  <span className="text-xs text-slate-500 line-through ml-2 font-semibold">
                    {course.originalPrice}
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
                <span className="text-3xl">{activeCourse.icon}</span>
                <div>
                  <h3 className="text-base font-bold text-white">{activeCourse.title}</h3>
                  <span className="text-xs text-purple-400 font-semibold">{activeCourse.subtitle}</span>
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
                  src={activeCourse.video_url}
                  title={activeCourse.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white">📖 பாடத்திட்டம் (Curriculum):</h4>
                <div className="p-4 bg-slate-900 border border-white/10 rounded-2xl text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                  {activeCourse.curriculum}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <a
                  href={activeCourse.pdf_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center gap-2 hover:bg-emerald-500/20 transition"
                >
                  <Download className="w-4 h-4" /> Download PDF Notes
                </a>
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
