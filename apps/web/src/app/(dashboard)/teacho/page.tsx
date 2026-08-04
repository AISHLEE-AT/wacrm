'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { GraduationCap, PlayCircle, Zap, Search, BookOpen, Award, CheckCircle2, Plus } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', name: 'All Levels' },
  { id: 'tn_board', name: 'TN State Board' },
  { id: 'cbse', name: 'CBSE' },
  { id: 'tnpsc', name: 'TNPSC' },
  { id: 'upsc', name: 'UPSC & Central' },
  { id: 'police', name: 'Defense & Police' },
  { id: 'neet_jee', name: 'NEET / JEE' },
  { id: 'tech', name: 'Tech & Careers' },
];

const COURSES = [
  {
    id: 1,
    title: 'TNPSC GROUP 1 PRELIMS',
    subtitle: 'COMPLETE COURSE',
    category: 'tnpsc',
    badge: 'BESTSELLER',
    tag: 'FREE',
    lessons: '180+ One-Liner Lessons',
    icon: '🏛️',
  },
  {
    id: 2,
    title: 'TNPSC GROUP 2 & 2A PRELIMS',
    subtitle: 'COMPLETE COURSE',
    category: 'tnpsc',
    badge: 'BESTSELLER',
    tag: 'FREE',
    lessons: '220+ Chapterwise Notes',
    icon: '📜',
  },
  {
    id: 3,
    title: '12TH STANDARD BIOLOGY (TN BOARD)',
    subtitle: 'FULL SYLLABUS FACTSHEETS',
    category: 'tn_board',
    badge: 'BESTSELLER',
    tag: 'FREE',
    lessons: '14 Modules & Diagrams',
    icon: '🧬',
  },
  {
    id: 4,
    title: 'TN POLICE SI & CONSTABLE EXAM 2026',
    subtitle: 'GENERAL KNOWLEDGE & GK FACTBOOK',
    category: 'police',
    badge: 'POPULAR',
    tag: 'FREE',
    lessons: '95 Practice Quizzes',
    icon: '🛡️',
  },
  {
    id: 5,
    title: 'NEET & JEE PHYSICS & CHEMISTRY ONE-LINERS',
    subtitle: 'FORMULA FACT SHEETS & PYQs',
    category: 'neet_jee',
    badge: 'HOT',
    tag: 'FREE',
    lessons: '3,000+ Formula Cards',
    icon: '⚛️',
  },
  {
    id: 6,
    title: 'FULL-STACK WEB DEVELOPMENT & AI PROMPTING',
    subtitle: 'PRACTICAL CAREER BOOTCAMP',
    category: 'tech',
    badge: 'NEW',
    tag: 'FREE',
    lessons: '40 Hands-on Projects',
    icon: '💻',
  },
];

export default function TeachOPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');

  const filteredCourses = COURSES.filter((c) => {
    const matchesCat = activeCategory === 'all' || c.category === activeCategory;
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
                          c.subtitle.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-xs font-semibold text-cyan-400">
            <GraduationCap className="w-4 h-4" /> Thamizhan AI LMS & Career Academy
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Thamizhan AI LMS & Career Academy
          </h1>
          <p className="text-sm sm:text-base text-slate-300">
            Master TNPSC, Samacheer Kalvi, NEET/JEE & Police Exams with AI-powered One-Liners (ஒரு வரி விடைகள்), 1-Mark Facts, and instant Mock Tests.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => alert('Resuming last lesson: TNPSC Group 2 Prelims Unit 8...')}
              className="bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-cyan-400/20 transition-all"
            >
              <PlayCircle className="w-4 h-4" /> Resume Last Lesson
            </button>
            <button
              onClick={() => alert('Opening Quick Practice Test...')}
              className="bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 font-semibold px-5 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-all"
            >
              <Zap className="w-4 h-4 text-cyan-400" /> Quick Practice Test
            </button>
          </div>
        </div>
      </div>

      {/* Search & Category Pills */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 scrollbar-none">
            <span className="text-xs font-semibold text-slate-400 mr-2 whitespace-nowrap">Categories:</span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-400/20'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search courses, TNPSC topics, Samacheer books..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Courses Header & Grid */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" /> Top Rated Courses
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg text-slate-300 font-medium">Approvals</span>
            <button onClick={() => alert('Creating New Course...')} className="bg-amber-400 text-slate-950 font-bold px-3 py-1 rounded-lg text-xs flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Create New
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 transition-all rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xl relative group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded border border-rose-500/30">
                      INCOMPLETE
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                      {course.tag}
                    </span>
                    <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                      {course.badge}
                    </span>
                  </div>
                  <span className="text-2xl">{course.icon}</span>
                </div>

                <h3 className="font-extrabold text-lg text-cyan-300 tracking-tight leading-snug">
                  {course.title}
                </h3>
                <p className="text-xs font-semibold text-slate-400 tracking-wider mt-1">
                  {course.subtitle}
                </p>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-3">
                  <BookOpen className="w-3.5 h-3.5 text-cyan-400" /> {course.lessons}
                </p>
              </div>

              <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between">
                <button
                  onClick={() => alert(`Opening course: ${course.title}`)}
                  className="w-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-bold py-2 rounded-xl text-xs border border-cyan-500/30 flex items-center justify-center gap-1.5 transition-all"
                >
                  <PlayCircle className="w-4 h-4 text-cyan-400" /> Start Course
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
