'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { lmsSupabase } from '@/lib/lms-supabase';
import {
  BookOpen,
  Sparkles,
  Award,
  GraduationCap,
  Zap,
  Layers,
  FileCheck2,
  PlayCircle,
  CheckCircle2,
  ChevronRight,
  Search,
  Flame,
  Star,
  Briefcase,
  FileText,
  Network,
  MessageSquare,
  X,
  ExternalLink,
  Send,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Courses', icon: BookOpen },
  { id: 'entrance', label: 'NEET & JEE', icon: Zap },
  { id: 'govt', label: 'Govt & TNPSC', icon: Award },
  { id: 'skills', label: 'AI & Tech Skills', icon: Sparkles },
  { id: 'school', label: 'School (KG–12)', icon: GraduationCap },
  { id: 'college', label: 'College (UG/PG)', icon: BookOpen },
  { id: 'others', label: 'Others & General', icon: Layers },
  { id: 'tests', label: 'TestO Mock Tests', icon: FileCheck2 },
];

function getCourseCategory(c: any): 'entrance' | 'govt' | 'skills' | 'school' | 'college' | 'others' {
  const cat = (c.category || '').toLowerCase();
  const title = (c.title_name || '').toLowerCase();

  if (cat.includes('neet') || cat.includes('jee') || /\b(neet|jee|iit|cuet|gate)\b/i.test(title)) {
    return 'entrance';
  }
  if (cat.includes('tnpsc') || cat.includes('govt') || cat.includes('upsc') || /\b(tnpsc|upsc|civil services|group 1|group 2|group 4|group iv|ssc|chsl|cgl|rrb|ntpc|tnusrb|police|constable|si|forest guard|agniveer|cds|nda|tet|trb)\b/i.test(title)) {
    return 'govt';
  }
  if ((cat.includes('tech') || cat.includes('it training') || cat.includes('skill')) || /செயற்கை நுண்ணறிவு|பைதான்|ஜாவாஸ்கிரிப்ட்|தரவு அறிவியல்|கிளவுட்|சைபர்|சாப்ட்வேர்|மொபைல் ஆப்|கணினி|மார்க்கெட்டிங்/i.test(title) || /\b(python|javascript|data science|data analytics|cloud|aws|cyber security|mobile app|software testing|networking|digital marketing|web dev|coding|programming)\b/i.test(title)) {
    return 'skills';
  }
  if (cat.includes('grade') || cat.includes('school') || /\b(class 8|class 9|class 10|class 11|class 12|8th standard|9th standard|10th standard|11th standard|12th standard|lkg|ukg|samacheer|cbse|tn board)\b/i.test(title)) {
    return 'school';
  }
  if (cat.includes('ug') || cat.includes('college') || /\b(spoken english|engineering|computer architecture|degree|b\.tech|b\.sc|b\.com)\b/i.test(title)) {
    return 'college';
  }
  return 'others';
}

export default function TeachoWebPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Course Player Modal
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [activeCourseTab, setActiveCourseTab] = useState<'curriculum' | 'notes' | 'mindmap' | 'forum'>('curriculum');
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({ 0: true });

  // AI Tutor Modal
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiTitle, setAiTitle] = useState('');
  const [aiContent, setAiContent] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Career Hub Modal
  const [careerHubOpen, setCareerHubOpen] = useState(false);
  const [careerTab, setCareerTab] = useState<'jobs' | 'resume' | 'interview' | 'roadmaps'>('jobs');
  const [resumeName, setResumeName] = useState('');
  const [resumeRole, setResumeRole] = useState('');
  const [resumeSkills, setResumeSkills] = useState('');
  const [generatedResume, setGeneratedResume] = useState('');
  const [isGeneratingResume, setIsGeneratingResume] = useState(false);

  // Q&A Forum
  const [forumInput, setForumInput] = useState('');
  const [forumPosts, setForumPosts] = useState<any[]>([
    {
      author: 'Karthik R.',
      question: 'How do we solve chapter numerical problems in under 60 seconds for competitive exams?',
      answer: '🤖 AI Tutor: Focus on identifying the given parameters first, eliminate units, and apply core shortcut formulas.',
      time: '2 hours ago',
    },
    {
      author: 'Priya S.',
      question: 'Where can I find the verified Tamil Nadu State Board solution notes for Unit 2?',
      answer: '🤖 AI Tutor: You can open the "Notes & PDF" tab right here to download the verified PDF summary and formula sheets.',
      time: 'Yesterday',
    },
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: courseData } = await lmsSupabase
        .from('unified_master_data')
        .select('*')
        .eq('item_type', 'COURSE')
        .order('created_at', { ascending: false });

      if (courseData) setCourses(courseData);

      const { data: testData } = await lmsSupabase
        .from('unified_master_data')
        .select('*')
        .eq('item_type', 'o_test')
        .limit(100);

      if (testData) setTests(testData);
    } catch (e) {
      console.error('Error fetching EduVerse Web data:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    let items = courses;
    if (activeCategory === 'tests') {
      items = tests;
    } else if (activeCategory !== 'all') {
      items = courses.filter(c => getCourseCategory(c) === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        item =>
          (item.title_name && item.title_name.toLowerCase().includes(q)) ||
          (item.category && item.category.toLowerCase().includes(q)) ||
          (item.description_purpose && item.description_purpose.toLowerCase().includes(q))
      );
    }

    return items;
  }, [courses, tests, activeCategory, searchQuery]);

  const handleAskAi = async (promptType: 'explain_tamil' | 'quiz' | 'summary', topic: string) => {
    setAiModalOpen(true);
    setAiLoading(true);
    setAiContent('');

    if (promptType === 'explain_tamil') {
      setAiTitle(`எளிய விளக்கம்: ${topic}`);
    } else if (promptType === 'quiz') {
      setAiTitle(`5 Quick Practice MCQs: ${topic}`);
    } else {
      setAiTitle(`Summary & Notes: ${topic}`);
    }

    setAiContent(`AI Analysis for "${topic}":\n\n1. Foundational Core Principles: Deep breakdown of essential rules and properties.\n2. High-Yield Exam Formulas: Direct mathematical expressions & shortcut methods.\n3. 3 Key Takeaways & Exam Strategy: Memorization mnemonics and common trap avoidance.`);
    setAiLoading(false);
  };

  const handleGenerateResume = () => {
    if (!resumeName || !resumeRole || !resumeSkills) return;
    setIsGeneratingResume(true);
    setTimeout(() => {
      setGeneratedResume(`ATS RESUME DRAFT\n================\nName: ${resumeName}\nTarget Role: ${resumeRole}\n\nPROFESSIONAL SUMMARY\nAccomplished, result-oriented candidate with deep expertise in ${resumeSkills}. Proven background in full-cycle project implementation and problem solving.\n\nCORE SKILLS\n- ${resumeSkills}\n- Communication & Team Collaboration\n\nEDUCATION & CERTIFICATIONS\n- EduVerse AI Certified Professional`);
      setIsGeneratingResume(false);
    }, 600);
  };

  const handlePostForum = () => {
    if (!forumInput.trim()) return;
    const q = forumInput.trim();
    setForumInput('');
    setForumPosts(prev => [
      {
        author: 'You (Student)',
        question: q,
        answer: '🤖 AI Tutor: Great question! Focus on breaking down the problem into given parameters and applying fundamental equations.',
        time: 'Just now',
      },
      ...prev,
    ]);
  };

  let curriculum: any[] = [];
  if (selectedCourse) {
    try {
      let ai = selectedCourse.additional_info;
      if (typeof ai === 'string') ai = JSON.parse(ai);
      if (ai && ai.curriculum) curriculum = ai.curriculum;
    } catch {}
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-100 p-6">
      {/* Top Header Bar */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-white tracking-tight">TeachO & TestO</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-3 h-3" /> EduVerse AI
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            School (KG–12), Higher Education, Competitive Exams & Modern AI Skills
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            <span>5d Streak</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <Star className="w-4 h-4 text-emerald-500 fill-emerald-500" />
            <span>480 XP</span>
          </div>
          <button
            onClick={() => setCareerHubOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20"
          >
            <Briefcase className="w-4 h-4" />
            <span>Career Hub</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-6">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search courses, NEET/JEE units, TNPSC topics, CBSE syllabus, tests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#111827] border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                    : 'bg-[#111827] text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Course Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mb-4" />
            <p>Loading EduVerse Learning Hub...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>No courses or mock tests found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => {
              const isTest = item.item_type === 'o_test' || activeCategory === 'tests';
              const catKey = isTest ? 'tests' : getCourseCategory(item);
              const catLabel = isTest
                ? 'TESTO EXAM'
                : item.category ||
                  (catKey === 'entrance'
                    ? 'NEET / JEE'
                    : catKey === 'govt'
                    ? 'Govt & TNPSC'
                    : catKey === 'skills'
                    ? 'AI & Tech'
                    : catKey === 'school'
                    ? 'School (KG–12)'
                    : catKey === 'college'
                    ? 'College'
                    : 'Others');

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedCourse(item)}
                  className="group bg-[#111827] border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 cursor-pointer transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {catLabel}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {isTest ? '📝 25 MCQs' : '📚 Syllabus Ready'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition line-clamp-2 mb-2">
                      {item.title_name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                      {item.description_purpose || item.description || 'Comprehensive subject coverage with video lessons, digital notes & AI tutor.'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      {isTest ? 'Start Exam' : 'Start Learning'} <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {item.language || 'Tamil & English'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Course Detail Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  {selectedCourse.category || 'Masterclass Course'}
                </span>
                <h2 className="text-xl font-bold text-white mt-1">{selectedCourse.title_name}</h2>
              </div>
              <button
                onClick={() => setSelectedCourse(null)}
                className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-3 bg-[#0c1322] border-b border-slate-800/80 flex flex-wrap gap-2">
              <button
                onClick={() => handleAskAi('explain_tamil', selectedCourse.title_name)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition"
              >
                <Sparkles className="w-3.5 h-3.5" /> தமிழில் விளக்கம்
              </button>
              <button
                onClick={() => handleAskAi('quiz', selectedCourse.title_name)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-xl text-xs font-bold transition"
              >
                <FileCheck2 className="w-3.5 h-3.5" /> 5 Practice MCQs
              </button>
              <button
                onClick={() => handleAskAi('summary', selectedCourse.title_name)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition"
              >
                <FileText className="w-3.5 h-3.5" /> Summary Notes
              </button>
            </div>

            <div className="flex border-b border-slate-800 px-6 bg-[#111827]">
              {[
                { id: 'curriculum', label: 'Curriculum', icon: BookOpen },
                { id: 'notes', label: 'Notes & PDF', icon: FileText },
                { id: 'mindmap', label: 'Mind Map', icon: Network },
                { id: 'forum', label: 'Q&A Forum', icon: MessageSquare },
              ].map(t => {
                const Icon = t.icon;
                const active = activeCourseTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveCourseTab(t.id as any)}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-bold transition ${
                      active ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {activeCourseTab === 'curriculum' && (
                <div className="space-y-4">
                  {curriculum.length === 0 ? (
                    <p className="text-slate-500 text-center py-10">No modules uploaded yet.</p>
                  ) : (
                    curriculum.map((mod: any, mIdx: number) => {
                      const isExpanded = !!expandedModules[mIdx];
                      return (
                        <div key={mIdx} className="bg-[#0c1322] border border-slate-800 rounded-2xl overflow-hidden">
                          <button
                            onClick={() => setExpandedModules(prev => ({ ...prev, [mIdx]: !prev[mIdx] }))}
                            className="w-full flex justify-between items-center p-4 text-left hover:bg-slate-800/40 transition"
                          >
                            <div>
                              <span className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase">CHAPTER {mIdx + 1}</span>
                              <h4 className="text-sm font-bold text-white">{mod.title}</h4>
                            </div>
                            <span className="text-xs text-slate-500 font-bold">{isExpanded ? '▲' : '▼'}</span>
                          </button>
                          {isExpanded && (
                            <div className="p-4 border-t border-slate-800 space-y-2 bg-[#111827]/50">
                              {(mod.videos || []).map((v: any, vIdx: number) => (
                                <div key={vIdx} className="flex justify-between items-center p-3 rounded-xl bg-[#111827] border border-slate-800/60">
                                  <div className="flex items-center gap-3">
                                    <PlayCircle className="w-5 h-5 text-emerald-400" />
                                    <div>
                                      <p className="text-xs font-semibold text-white">{v.title}</p>
                                      <p className="text-[10px] text-slate-500">Video Lesson • Full HD</p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleAskAi('explain_tamil', v.title)}
                                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold"
                                  >
                                    AI
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {activeCourseTab === 'notes' && (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center">
                    <FileText className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                    <h4 className="text-sm font-bold text-white">Verified Study Notes & Formula PDFs</h4>
                    <p className="text-xs text-slate-400">High-yield revision notes and formulas for instant download.</p>
                  </div>
                  {curriculum.map((chap: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-[#0c1322] border border-slate-800 rounded-xl">
                      <div>
                        <p className="text-sm font-bold text-white">{chap.title}</p>
                        <p className="text-xs text-slate-500">PDF Document • Theory & Formulas</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAskAi('summary', chap.title)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg text-slate-300 transition"
                        >
                          Summary
                        </button>
                        <button
                          onClick={() => handleAskAi('explain_tamil', chap.title)}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-xs font-bold rounded-lg text-slate-950 transition"
                        >
                          Download Notes
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeCourseTab === 'mindmap' && (
                <div className="space-y-4">
                  <div className="p-4 bg-[#0c1322] border border-slate-800 rounded-2xl text-center">
                    <Network className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                    <h4 className="text-sm font-bold text-white">Visual Concept Hierarchy</h4>
                    <p className="text-xs text-slate-400">Accelerate retention through structured concept maps.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-[#0c1322] border border-slate-800 rounded-xl">
                      <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded">BRANCH 1</span>
                      <h5 className="text-xs font-bold text-white mt-2">Key Principles</h5>
                      <p className="text-xs text-slate-400 mt-1">Fundamental definitions, axioms, and structural foundations.</p>
                    </div>
                    <div className="p-4 bg-[#0c1322] border border-slate-800 rounded-xl">
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">BRANCH 2</span>
                      <h5 className="text-xs font-bold text-white mt-2">Formulas & Shortcuts</h5>
                      <p className="text-xs text-slate-400 mt-1">Standard derivations and fast-solving techniques.</p>
                    </div>
                    <div className="p-4 bg-[#0c1322] border border-slate-800 rounded-xl">
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">BRANCH 3</span>
                      <h5 className="text-xs font-bold text-white mt-2">Problem Patterns</h5>
                      <p className="text-xs text-slate-400 mt-1">Previous year questions (PYQs) and high-yield MCQ types.</p>
                    </div>
                    <div className="p-4 bg-[#0c1322] border border-slate-800 rounded-xl">
                      <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">BRANCH 4</span>
                      <h5 className="text-xs font-bold text-white mt-2">Self-Assessment</h5>
                      <p className="text-xs text-slate-400 mt-1">Chapter mock tests and speed accuracy checks.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeCourseTab === 'forum' && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {forumPosts.map((p, idx) => (
                      <div key={idx} className="p-4 bg-[#0c1322] border border-slate-800 rounded-xl">
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                          <span className="font-bold text-sky-400">{p.author}</span>
                          <span>{p.time}</span>
                        </div>
                        <p className="text-sm font-semibold text-white mb-2">{p.question}</p>
                        <div className="p-3 bg-[#111827] border border-slate-800 rounded-lg text-xs text-slate-300 leading-relaxed">
                          {p.answer}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Ask a doubt or concept question..."
                      value={forumInput}
                      onChange={e => setForumInput(e.target.value)}
                      className="flex-1 px-4 py-2.5 bg-[#0c1322] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={handlePostForum}
                      className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" /> Post
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Tutor Bottom Modal */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">{aiTitle}</h3>
              </div>
              <button onClick={() => setAiModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 text-sm text-slate-300 whitespace-pre-line leading-relaxed">
              {aiLoading ? (
                <div className="py-12 text-center text-slate-400">
                  <div className="inline-block animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mb-3" />
                  <p>Gemini AI is analyzing concept...</p>
                </div>
              ) : (
                aiContent
              )}
            </div>
          </div>
        </div>
      )}

      {/* Career Hub Modal */}
      {careerHubOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">Career & Placement Hub</h3>
                  <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
                    EduVerse AI
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Job Alerts, AI Resume Builder & Mock Interviews</p>
              </div>
              <button onClick={() => setCareerHubOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex border-b border-slate-800 px-6 bg-[#0c1322]">
              {[
                { id: 'jobs', label: 'Job Alerts', icon: Briefcase },
                { id: 'resume', label: 'AI Resume', icon: FileText },
                { id: 'interview', label: 'Interview Qs', icon: MessageSquare },
                { id: 'roadmaps', label: 'Roadmaps', icon: Network },
              ].map(t => {
                const Icon = t.icon;
                const active = careerTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setCareerTab(t.id as any)}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-bold transition ${
                      active ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {careerTab === 'jobs' && (
                <div className="space-y-3">
                  {[
                    { title: 'TNPSC Group 4 Recruitment 2026', org: 'Tamil Nadu Public Service Commission', type: 'Govt Job', vacancies: '6,244 Posts', url: 'https://www.tnpsc.gov.in' },
                    { title: 'SBI Junior Associate (Clerk) 2026', org: 'State Bank of India', type: 'Banking', vacancies: '8,773 Posts', url: 'https://sbi.co.in/careers' },
                    { title: 'Graduate Software Engineer', org: 'Zoho Corporation', type: 'IT Software', vacancies: 'Open Hiring', url: 'https://www.zoho.com/careers' },
                    { title: 'SSC CGL Combined Graduate Level', org: 'Staff Selection Commission', type: 'Central Govt', vacancies: '17,727 Posts', url: 'https://ssc.gov.in' },
                  ].map((job, idx) => (
                    <div key={idx} className="p-4 bg-[#0c1322] border border-slate-800 rounded-xl flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">{job.type}</span>
                        <h4 className="text-sm font-bold text-white mt-1">{job.title}</h4>
                        <p className="text-xs text-slate-400">{job.org} • {job.vacancies}</p>
                      </div>
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition"
                      >
                        Apply <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              )}

              {careerTab === 'resume' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-400">Full Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Anandha Kumar"
                        value={resumeName}
                        onChange={e => setResumeName(e.target.value)}
                        className="w-full mt-1 px-3 py-2 bg-[#0c1322] border border-slate-800 rounded-xl text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400">Target Role</label>
                      <input
                        type="text"
                        placeholder="e.g. Mobile Developer / TNPSC Officer"
                        value={resumeRole}
                        onChange={e => setResumeRole(e.target.value)}
                        className="w-full mt-1 px-3 py-2 bg-[#0c1322] border border-slate-800 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400">Key Skills</label>
                    <textarea
                      placeholder="e.g. React, Flutter, Python, SQL, Tamil Literature"
                      value={resumeSkills}
                      onChange={e => setResumeSkills(e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-[#0c1322] border border-slate-800 rounded-xl text-xs text-white h-20"
                    />
                  </div>
                  <button
                    onClick={handleGenerateResume}
                    disabled={isGeneratingResume}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Sparkles className="w-4 h-4" /> {isGeneratingResume ? 'Generating ATS Resume...' : 'Generate Tailored Resume'}
                  </button>
                  {generatedResume && (
                    <div className="p-4 bg-[#0c1322] border border-emerald-500/40 rounded-xl whitespace-pre-line text-xs text-slate-300 leading-relaxed font-mono">
                      {generatedResume}
                    </div>
                  )}
                </div>
              )}

              {careerTab === 'interview' && (
                <div className="space-y-3">
                  {[
                    { q: 'Tell me about yourself and your key strengths.', tip: 'Structure: Present (Skills) → Past (Achievements) → Future (Company goals).' },
                    { q: 'Explain separation of powers under Indian Constitution.', tip: 'Mention Articles 50 (DPSP), Executive, Legislature, and Judiciary.' },
                    { q: 'What is difference between State and Props in React / Flutter?', tip: 'Props are immutable inputs from parent; State is mutable component data.' },
                  ].map((item, idx) => (
                    <div key={idx} className="p-4 bg-[#0c1322] border border-slate-800 rounded-xl">
                      <p className="text-xs font-bold text-purple-400">Question {idx + 1}</p>
                      <p className="text-sm font-semibold text-white my-1">{item.q}</p>
                      <p className="text-xs text-emerald-400 bg-emerald-500/10 p-2 rounded border border-emerald-500/20 mt-2">💡 AI Tip: {item.tip}</p>
                    </div>
                  ))}
                </div>
              )}

              {careerTab === 'roadmaps' && (
                <div className="space-y-3">
                  {[
                    { title: 'Full Stack & Mobile App Developer (6 Months)', steps: ['1. JavaScript/TypeScript Basics', '2. React & Flutter UI', '3. Node.js & Supabase Backend', '4. Production Capstone Apps'] },
                    { title: 'TNPSC Group 1 & 2 Civil Officer (12 Months)', steps: ['1. Samacheer 6-12th Textbooks', '2. Indian Polity & TN Culture', '3. Current Affairs & Aptitude', '4. TestO Mock Exam Series'] },
                  ].map((rm, idx) => (
                    <div key={idx} className="p-4 bg-[#0c1322] border border-slate-800 rounded-xl">
                      <h4 className="text-sm font-bold text-white mb-2">{rm.title}</h4>
                      <div className="space-y-1">
                        {rm.steps.map((step, sIdx) => (
                          <p key={sIdx} className="text-xs text-slate-300 flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {step}
                          </p>
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
    </div>
  );
}
