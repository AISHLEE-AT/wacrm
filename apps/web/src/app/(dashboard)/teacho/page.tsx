'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { BookOpen, GraduationCap, PlayCircle, FileText, CheckCircle, Search, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Course = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  level: string;
  icon: string;
  video_url: string;
  pdf_url: string;
  curriculum: string;
};

export default function TeachOPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  useEffect(() => {
    async function fetchCourses() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('lms_courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setCourses(data as Course[]);
      }
      setLoading(false);
    }
    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">🎓</span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              TeachO <span className="text-xs bg-indigo-500/20 text-indigo-300 font-normal px-2.5 py-0.5 rounded-full border border-indigo-500/30">கல்வி & திறன்கள்</span>
            </h1>
            <p className="text-sm text-slate-400">Learn anytime, anywhere. Local courses, global standards.</p>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search courses..."
            className="w-full sm:w-64 pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-slate-400 text-sm">Loading courses...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Courses List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" /> Featured Courses
            </h3>
            
            {courses.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/50 border border-slate-800 rounded-2xl">
                <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No courses available yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    onClick={() => setSelectedCourse(course)}
                    className={`cursor-pointer bg-slate-900/90 border transition-all rounded-2xl p-5 flex flex-col justify-between space-y-3 ${
                      selectedCourse?.id === course.id
                        ? 'border-indigo-500 ring-1 ring-indigo-500/50 bg-slate-900'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-3xl bg-slate-950 p-2 rounded-xl border border-slate-800">{course.icon || '📚'}</span>
                      <span className="text-xs font-semibold bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                        {course.category}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base leading-tight mb-1">{course.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2">{course.description}</p>
                    </div>
                    <div className="pt-2 border-t border-slate-800/50 flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" /> {course.level}</span>
                      <span className="flex items-center gap-1 text-indigo-400 font-medium">View Details →</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Course Details Pane */}
          <div className="space-y-4">
             <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Course Overview</h3>
             {selectedCourse ? (
               <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-xl sticky top-6">
                 <div>
                   <h2 className="text-xl font-bold text-white mb-2">{selectedCourse.title}</h2>
                   <p className="text-sm text-indigo-400 font-medium">{selectedCourse.subtitle}</p>
                 </div>
                 
                 <p className="text-sm text-slate-300 leading-relaxed">
                   {selectedCourse.description}
                 </p>

                 {selectedCourse.curriculum && (
                   <div className="space-y-2 bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
                     <h4 className="text-xs font-bold text-slate-400 uppercase">Curriculum Highlights</h4>
                     <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                       {selectedCourse.curriculum}
                     </p>
                   </div>
                 )}

                 <div className="grid grid-cols-2 gap-3 pt-2">
                   {selectedCourse.video_url && (
                     <a
                       href={selectedCourse.video_url}
                       target="_blank"
                       rel="noreferrer"
                       className="flex flex-col items-center justify-center gap-2 py-4 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-xl transition-colors"
                     >
                       <PlayCircle className="w-6 h-6 text-indigo-400" />
                       <span className="text-xs font-bold text-indigo-400">Watch Video</span>
                     </a>
                   )}
                   {selectedCourse.pdf_url && (
                     <a
                       href={selectedCourse.pdf_url}
                       target="_blank"
                       rel="noreferrer"
                       className="flex flex-col items-center justify-center gap-2 py-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl transition-colors"
                     >
                       <FileText className="w-6 h-6 text-emerald-400" />
                       <span className="text-xs font-bold text-emerald-400">Read Notes</span>
                     </a>
                   )}
                 </div>
                 
                 <button className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 mt-4">
                   <CheckCircle className="w-4 h-4" /> Enroll Now (Free)
                 </button>
               </div>
             ) : (
               <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center h-64 opacity-50">
                 <GraduationCap className="w-10 h-10 text-slate-500 mb-3" />
                 <p className="text-sm text-slate-400 font-medium">Select a course to view its details, watch lessons, and download materials.</p>
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
}
