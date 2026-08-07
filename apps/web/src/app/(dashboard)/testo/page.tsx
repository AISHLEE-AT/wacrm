'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { BookOpen, GraduationCap, PlayCircle, FileText, CheckCircle, Search, FileCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { createLMSClient } from '@/lib/supabase/lms-client';
import { useRouter } from 'next/navigation';

type CourseMeta = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  level: string;
  icon: string;
};

type TestMeta = {
  id: string;
  category: string;
  title_name: string;
  description_purpose: string;
};

type Video = {
  title: string;
  url: string;
};

type Module = {
  title: string;
  videos: Video[];
};

export default function LmsTestOPage() {
  const router = useRouter();
  
  // Data states
  const [courses, setCourses] = useState<CourseMeta[]>([]);
  const [tests, setTests] = useState<TestMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // UI states
  const [activeTab, setActiveTab] = useState<'courses' | 'tests'>('courses');
  
  // Course Viewer states
  const [selectedCourse, setSelectedCourse] = useState<CourseMeta | null>(null);
  const [curriculum, setCurriculum] = useState<Module[]>([]);
  const [courseLoading, setCourseLoading] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState('');
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({ 0: true });

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createLMSClient();
        
        // Fetch BOTH courses and tests in one go
        const { data, error } = await supabase
          .from('unified_master_data')
          .select('id, item_type, title_name, category, description_purpose')
          .in('item_type', ['COURSE', 'o_test'])
          .order('created_at', { ascending: false });

        if (error) {
          setErrorMsg(error.message);
        } else if (data) {
          const fetchedCourses: CourseMeta[] = [];
          const fetchedTests: TestMeta[] = [];
          
          data.forEach((item: any) => {
            if (item.item_type === 'COURSE') {
              fetchedCourses.push({
                id: item.id,
                title: item.title_name || 'Untitled Course',
                subtitle: item.category || 'General',
                description: item.description_purpose || 'No description provided.',
                category: item.category || 'General',
                level: 'All Levels',
                icon: '📚'
              });
            } else if (item.item_type === 'o_test') {
              fetchedTests.push({
                id: item.id,
                category: item.category || 'General',
                title_name: item.title_name || 'Untitled Test',
                description_purpose: item.description_purpose || 'No description provided.',
              });
            }
          });
          
          setCourses(fetchedCourses);
          setTests(fetchedTests);
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'An unexpected error occurred while fetching LMS data.');
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleSelectCourse = async (course: CourseMeta) => {
    setSelectedCourse(course);
    setCourseLoading(true);
    setCurriculum([]);
    setActiveVideoUrl('');
    setExpandedModules({ 0: true });

    const supabase = createLMSClient();
    const { data, error } = await supabase
      .from('unified_master_data')
      .select('additional_info')
      .eq('id', course.id)
      .single();

    if (!error && data) {
      let ai = data.additional_info || {};
      if (typeof ai === 'string') {
        try { ai = JSON.parse(ai); } catch (e) {}
      }
      
      if (ai.curriculum && Array.isArray(ai.curriculum)) {
        setCurriculum(ai.curriculum);
        if (ai.curriculum.length > 0 && ai.curriculum[0].videos?.length > 0) {
          handlePlayVideo(ai.curriculum[0].videos[0].url);
        } else if (ai.video_url) {
          handlePlayVideo(ai.video_url);
        }
      } else if (ai.video_url) {
        setCurriculum([{ title: 'General Module', videos: [{ title: 'Course Video', url: ai.video_url }] }]);
        handlePlayVideo(ai.video_url);
      }
    }
    setCourseLoading(false);
  };

  const handlePlayVideo = (url: string) => {
    if (!url) return;
    let finalUrl = url;
    if (url.includes('youtube.com/watch?v=')) {
      finalUrl = url.replace('watch?v=', 'embed/');
    } else if (url.includes('youtu.be/')) {
      const vidId = url.split('youtu.be/')[1];
      finalUrl = `https://www.youtube.com/embed/${vidId}`;
    }
    setActiveVideoUrl(finalUrl);
  };

  const toggleModule = (index: number) => {
    setExpandedModules(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const coursesByCategory = courses.reduce((acc, course) => {
    const cat = course.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(course);
    return acc;
  }, {} as Record<string, CourseMeta[]>);
  
  const testsByCategory = tests.reduce((acc, test) => {
    const cat = test.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(test);
    return acc;
  }, {} as Record<string, TestMeta[]>);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">🎓</span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              LMS TestO <span className="text-xs bg-indigo-500/20 text-indigo-300 font-normal px-2.5 py-0.5 rounded-full border border-indigo-500/30">பயிற்சி & தேர்வுகள்</span>
            </h1>
            <p className="text-sm text-slate-400">Your unified portal for Courses and Mock Exams.</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-slate-400 text-sm">Loading LMS content...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {errorMsg && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              <strong>Error loading content:</strong> {errorMsg}
            </div>
          )}

          {/* Tabs */}
          <div className="flex items-center gap-4 border-b border-slate-800">
            <button
              onClick={() => setActiveTab('courses')}
              className={`pb-3 px-2 text-sm font-semibold transition-colors border-b-2 ${
                activeTab === 'courses' 
                  ? 'border-indigo-500 text-indigo-400' 
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              Courses (பயிற்சி)
            </button>
            <button
              onClick={() => setActiveTab('tests')}
              className={`pb-3 px-2 text-sm font-semibold transition-colors border-b-2 ${
                activeTab === 'tests' 
                  ? 'border-indigo-500 text-indigo-400' 
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              Mock Tests (மாதிரி தேர்வு)
            </button>
          </div>

          {/* Content Area */}
          {activeTab === 'courses' && (
            <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Courses List */}
              <div className="w-full lg:w-1/2 space-y-6">
                {Object.keys(coursesByCategory).length === 0 ? (
                  <div className="p-8 text-center bg-slate-900/50 border border-slate-800 rounded-2xl">
                    <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">No courses available yet.</p>
                  </div>
                ) : (
                  Object.entries(coursesByCategory).map(([category, catCourses]) => (
                    <div key={category} className="space-y-4">
                      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-l-4 border-indigo-500 pl-3">
                        {category}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {catCourses.map((course) => (
                          <div
                            key={course.id}
                            onClick={() => handleSelectCourse(course)}
                            className={`cursor-pointer bg-slate-900/90 border transition-all rounded-2xl p-5 flex flex-col justify-between space-y-3 ${
                              selectedCourse?.id === course.id
                                ? 'border-indigo-500 ring-1 ring-indigo-500/50 bg-slate-950 shadow-lg shadow-indigo-500/10'
                                : 'border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div>
                              <h4 className="font-bold text-white text-base leading-tight mb-1">{course.title}</h4>
                              <p className="text-xs text-slate-400 line-clamp-2">{course.description}</p>
                            </div>
                            <div className="pt-2 border-t border-slate-800/50 flex items-center justify-between text-xs text-slate-500">
                              <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" /> {course.level}</span>
                              <span className="flex items-center gap-1 text-indigo-400 font-medium">Study Now →</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Interactive LMS Player */}
              <div className="w-full lg:w-1/2">
                {selectedCourse ? (
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl sticky top-6 flex flex-col max-h-[85vh]">
                    <div className="bg-black aspect-video relative border-b border-slate-800 flex-shrink-0">
                      {courseLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
                          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                        </div>
                      ) : activeVideoUrl ? (
                        <iframe
                          width="100%"
                          height="100%"
                          src={activeVideoUrl}
                          title="Course Video Player"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="border-0 absolute inset-0"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950">
                           <PlayCircle className="w-12 h-12 text-slate-700 mb-2" />
                           <span className="text-slate-500 text-sm">Select a lesson to start learning</span>
                        </div>
                      )}
                    </div>

                    <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
                      <div className="mb-6">
                        <h2 className="text-xl font-bold text-white mb-2">{selectedCourse.title}</h2>
                        <p className="text-sm text-slate-400 leading-relaxed">{selectedCourse.description}</p>
                      </div>
                      
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                         <FileText className="w-4 h-4 text-indigo-400" /> Course Curriculum
                      </h4>

                      {courseLoading ? (
                        <div className="h-20 flex items-center justify-center">
                           <span className="text-slate-500 text-sm animate-pulse">Loading modules...</span>
                        </div>
                      ) : curriculum.length === 0 ? (
                        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
                           <span className="text-slate-500 text-sm">No curriculum available for this course.</span>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {curriculum.map((mod, mIdx) => {
                            const isExpanded = !!expandedModules[mIdx];
                            return (
                              <div key={mIdx} className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                                <div 
                                  onClick={() => toggleModule(mIdx)}
                                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-900/50 transition-colors"
                                >
                                  <span className="font-semibold text-sm text-slate-200">Module {mIdx + 1}: {mod.title}</span>
                                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                                </div>
                                {isExpanded && (
                                  <div className="bg-slate-900/50 border-t border-slate-800 p-2">
                                    {(!mod.videos || mod.videos.length === 0) ? (
                                       <div className="p-3 text-xs text-slate-500 italic">No lessons in this module.</div>
                                    ) : (
                                      mod.videos.map((vid, vIdx) => (
                                        <div 
                                          key={vIdx}
                                          onClick={() => handlePlayVideo(vid.url)}
                                          className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-indigo-500/10 group transition-colors"
                                        >
                                          <PlayCircle className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300" />
                                          <span className="text-sm text-slate-300 group-hover:text-white flex-1">{vid.title}</span>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center h-[500px] opacity-50">
                    <GraduationCap className="w-10 h-10 text-slate-500 mb-3" />
                    <p className="text-sm text-slate-400 font-medium max-w-xs">Select a course from the list to view its interactive curriculum and player.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'tests' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {Object.keys(testsByCategory).length === 0 ? (
                <div className="text-center p-8 bg-slate-900/50 border border-slate-800 rounded-2xl text-slate-400">
                  <FileCheck className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                  No mock tests available right now. Check back later!
                </div>
              ) : (
                Object.entries(testsByCategory).map(([category, catTests]) => (
                  <div key={category} className="space-y-4">
                    <h2 className="text-lg font-bold text-slate-200 border-l-4 border-rose-500 pl-3">{category}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {catTests.map((t) => (
                        <div key={t.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                          <div>
                            <span className="text-xs font-semibold bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded border border-rose-500/20">
                              {t.category || 'Test'}
                            </span>
                            <h3 className="font-bold text-white text-base mt-2">{t.title_name}</h3>
                            <p className="text-sm text-slate-400 mt-1 line-clamp-2">{t.description_purpose}</p>
                          </div>
                          <button 
                            onClick={() => router.push(`/testo/${t.id}`)} 
                            className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold py-2.5 rounded-xl text-xs border border-rose-500/30 transition-colors"
                          >
                            Start Test Now
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
