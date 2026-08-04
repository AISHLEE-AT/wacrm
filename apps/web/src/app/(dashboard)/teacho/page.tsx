'use client';

import React, { useState } from 'react';
import { GraduationCap, BookOpen, Video, Award, Users, Search, CheckCircle } from 'lucide-react';

const COURSES = [
  {
    id: 1,
    title: '10th & 12th State Board Mathematics Mastery',
    tutor: 'Prof. K. Sundaram (M.Sc, M.Phil)',
    subject: 'Mathematics',
    students: '1,240 Enrolled',
    rating: 4.9,
    price: 'Free Access',
    type: 'Video Lessons & Notes',
    icon: '📐',
  },
  {
    id: 2,
    title: 'TNPSC Group 4 & Group 2 Complete Exam Coaching',
    tutor: 'Thamizhan IAS Academy',
    subject: 'Competitive Exam',
    students: '3,800 Enrolled',
    rating: 4.9,
    price: 'Free Access',
    type: 'Live & Recorded',
    icon: '🏛️',
  },
  {
    id: 3,
    title: 'Fluent Spoken English for Students & Jobseekers',
    tutor: 'Mrs. Anita Raj, B.Ed',
    subject: 'Language',
    students: '2,150 Enrolled',
    rating: 4.8,
    price: 'Free Access',
    type: 'Interactive Lessons',
    icon: '🗣️',
  },
  {
    id: 4,
    title: 'Basic Computer & Full-Stack Web Development',
    tutor: 'Aishlee Tech Learning Lab',
    subject: 'Computer Science',
    students: '980 Enrolled',
    rating: 4.9,
    price: 'Free Access',
    type: 'Coding Projects',
    icon: '💻',
  },
];

export default function TeachOPage() {
  const [search, setSearch] = useState('');

  const filtered = COURSES.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">🎓</span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              TeachO <span className="text-xs bg-blue-500/20 text-blue-300 font-normal px-2.5 py-0.5 rounded-full border border-blue-500/30">கல்வி & பாடங்கள்</span>
            </h1>
            <p className="text-sm text-slate-400">School Tuitions, Competitive Exam Prep & Vocational Skill Training</p>
          </div>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search subjects or courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Courses List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((course) => (
          <div
            key={course.id}
            className="bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 transition-all rounded-2xl p-5 flex flex-col justify-between space-y-4"
          >
            <div className="flex items-start gap-4">
              <div className="text-3xl p-3 bg-slate-800/80 rounded-2xl border border-slate-700/50 flex items-center justify-center">
                {course.icon}
              </div>
              <div className="flex-1">
                <span className="text-xs font-semibold bg-blue-500/20 text-blue-400 px-2.5 py-0.5 rounded-md border border-blue-500/30">
                  {course.subject}
                </span>
                <h3 className="font-semibold text-base text-white mt-1.5">{course.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{course.tutor}</p>
                <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3 text-slate-400" /> {course.students}</span>
                  <span className="text-amber-400">★ {course.rating}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                {course.price}
              </span>
              <button
                onClick={() => alert(`Enrolled in ${course.title}! Free lessons unlocked.`)}
                className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-semibold px-4 py-2 rounded-xl text-xs border border-blue-500/30 flex items-center gap-1.5 transition-all"
              >
                <BookOpen className="w-3.5 h-3.5" /> Start Learning
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
