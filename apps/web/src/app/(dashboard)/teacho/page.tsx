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
  Mic,
  MicOff,
  Printer,
  Download,
  Share2,
  BookMarked,
  Sun,
  Moon,
  Coffee,
  Check,
  HelpCircle,
  Tv,
} from 'lucide-react';
import { generateKindleBook, KindleTopicBook } from '@/lib/kindleContentEngine';
import { getCourseSyllabus, SyllabusUnit } from '@/lib/courseCatalogMaster';

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
  const [isListening, setIsListening] = useState(false);

  const startVoiceSearch = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice speech recognition is supported in Google Chrome, Microsoft Edge, and modern browsers.');
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.interimResults = false;
      setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setSearchQuery(transcript);
        }
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const printStudyNotes = (title: string, content: string) => {
    if (typeof window === 'undefined') return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title} - EduVerse Study Notes</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #0f172a; line-height: 1.6; }
          .header { border-bottom: 3px solid #10b981; padding-bottom: 12px; margin-bottom: 24px; }
          .badge { display: inline-block; background: #ecfdf5; color: #059669; font-weight: bold; font-size: 11px; padding: 4px 10px; border-radius: 6px; border: 1px solid #10b981; text-transform: uppercase; margin-bottom: 8px; }
          h1 { color: #0f172a; margin: 0; font-size: 22px; }
          .meta { color: #64748b; font-size: 12px; margin-top: 4px; }
          .content { white-space: pre-wrap; font-size: 14px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 10px; margin-top: 20px; }
          .footer { margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 10px; font-size: 11px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <span class="badge">SuprO TeachO LMS • Verified Document</span>
          <h1>${title}</h1>
          <div class="meta">Generated on ${new Date().toLocaleDateString()} • SuprO Digital Platform</div>
        </div>
        <div class="content">${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
        <div class="footer">
          EduVerse AI Learning Hub • For Student Revision & Academic Use Only
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

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

  // Kindle Book Reader State
  const [kindleBook, setKindleBook] = useState<KindleTopicBook | null>(null);
  const [kindleTab, setKindleTab] = useState<'theory' | 'tamil' | 'vsaq' | 'solutions' | 'mcq' | 'formulas'>('theory');
  const [kindleTheme, setKindleTheme] = useState<'dark' | 'sepia' | 'light'>('dark');
  const [kindleFontSize, setKindleFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [userMcqAnswers, setUserMcqAnswers] = useState<Record<number, number>>({});
  const [revealedVsaq, setRevealedVsaq] = useState<Record<number, boolean>>({});

  const openKindleBook = (
    topic: string,
    initialTab: 'theory' | 'tamil' | 'vsaq' | 'solutions' | 'mcq' | 'formulas' = 'theory'
  ) => {
    const courseTitle = selectedCourse?.title_name || 'Masterclass Course';
    const cat = selectedCourse?.category || '';
    const book = generateKindleBook(topic, courseTitle, cat);
    setKindleBook(book);
    setKindleTab(initialTab);
    setUserMcqAnswers({});
    setRevealedVsaq({});
  };

  const printKindleBook = (book: KindleTopicBook) => {
    if (typeof window === 'undefined') return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${book.topicTitle} - EduVerse Kindle Book Chapter</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0f172a; line-height: 1.6; max-width: 800px; margin: 0 auto; }
          .header { border-bottom: 3px solid #10b981; padding-bottom: 12px; margin-bottom: 24px; }
          .badge { display: inline-block; background: #ecfdf5; color: #059669; font-weight: bold; font-size: 11px; padding: 4px 10px; border-radius: 6px; border: 1px solid #10b981; text-transform: uppercase; margin-bottom: 8px; }
          h1 { color: #0f172a; margin: 0; font-size: 24px; }
          .meta { color: #64748b; font-size: 12px; margin-top: 4px; }
          .section { margin-top: 28px; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0; }
          .sec-title { font-size: 16px; font-weight: bold; color: #047857; margin-bottom: 12px; border-left: 4px solid #10b981; padding-left: 8px; }
          .card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 10px; margin-bottom: 12px; }
          .mcq-q { font-weight: bold; margin-bottom: 8px; font-size: 14px; }
          .ans-key { color: #059669; font-weight: bold; margin-top: 6px; font-size: 13px; }
          .tamil-box { background: #fefce8; border: 1px solid #fef08a; padding: 16px; border-radius: 10px; }
          .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 11px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <span class="badge">EduVerse AI Kindle Book Edition</span>
          <h1>${book.topicTitle}</h1>
          <div class="meta">Course: ${book.courseTitle} • Published by SuprO TeachO Engine</div>
        </div>

        <div class="section">
          <div class="sec-title">📖 Section 1: Overview & Theoretical Foundations</div>
          <p style="font-size: 14px; margin-bottom: 16px;">${book.overview}</p>
          ${book.coreConcepts.map(c => `
            <div class="card">
              <h4 style="margin: 0 0 6px 0; color: #0f172a; font-size: 14px;">${c.heading}</h4>
              <p style="margin: 0; font-size: 13px; color: #334155;">${c.content}</p>
              ${c.example ? `<p style="color: #0369a1; font-style: italic; margin-top: 8px; font-size: 12px;">💡 ${c.example}</p>` : ''}
            </div>
          `).join('')}
        </div>

        <div class="section">
          <div class="sec-title">🗣️ Section 2: தமிழில் எளிய விளக்கம் (Tamil Conceptual Summary)</div>
          <div class="tamil-box">
            <h4 style="margin: 0 0 8px 0; color: #854d0e; font-size: 15px;">${book.tamilExplanation.simpleTitle}</h4>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #713f12;">${book.tamilExplanation.colloquialIntro}</p>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #713f12;"><strong>நடைமுறை உதாரணம்:</strong> ${book.tamilExplanation.everydayAnalogy}</p>
            <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #713f12;">${book.tamilExplanation.keyPointsTamil.map(p => `<li>${p}</li>`).join('')}</ul>
          </div>
        </div>

        <div class="section">
          <div class="sec-title">⚡ Section 3: 1-Line Quick Recall Flashcards (VSAQ)</div>
          ${book.vsaqs.map((v, i) => `
            <div class="card">
              <p style="margin: 0 0 4px 0;"><strong>Q${i + 1}: ${v.question}</strong></p>
              <p class="ans-key" style="margin: 0;">✓ Answer: ${v.answer}</p>
            </div>
          `).join('')}
        </div>

        <div class="section">
          <div class="sec-title">📝 Section 4: 2-Mark & 5-Mark Examination Questions with Step Solutions</div>
          ${book.shortAnswers.map((sa, i) => `
            <div class="card">
              <p style="margin: 0 0 6px 0;"><strong>Q${i + 1} [${sa.marks}]: ${sa.question}</strong></p>
              <ol style="margin: 0 0 8px 0; padding-left: 20px; font-size: 13px;">${sa.solutionSteps.map(s => `<li>${s}</li>`).join('')}</ol>
              <p style="color: #d97706; font-size: 12px; margin: 0;"><strong>💡 Examiner Scoring Tip:</strong> ${sa.keyTips}</p>
            </div>
          `).join('')}
        </div>

        <div class="section">
          <div class="sec-title">🎯 Section 5: 5 Practice Multiple Choice Questions (MCQs)</div>
          ${book.mcqs.map((m, i) => `
            <div class="card">
              <p class="mcq-q">Q${i + 1}: ${m.question}</p>
              <ul style="margin: 0 0 8px 0; padding-left: 20px; font-size: 13px;">${m.options.map((opt, oIdx) => `<li style="${oIdx === m.correct ? 'font-weight: bold; color: #059669;' : ''}">${opt}</li>`).join('')}</ul>
              <p class="ans-key" style="margin: 0;">💡 Explanation: ${m.explanation}</p>
            </div>
          `).join('')}
        </div>

        <div class="section">
          <div class="sec-title">📐 Section 6: Key Formulas & Memory Mnemonics</div>
          ${book.formulasAndMnemonics.map(f => `
            <div class="card">
              <p style="font-family: monospace; font-size: 14px; font-weight: bold; color: #047857; margin: 0 0 4px 0;">${f.formula}</p>
              <p style="margin: 0 0 4px 0; font-size: 13px;">${f.meaning}</p>
              ${f.mnemonic ? `<p style="color: #7c3aed; font-size: 12px; margin: 0;">🧠 Memory Mnemonic: ${f.mnemonic}</p>` : ''}
            </div>
          `).join('')}
        </div>

        <div class="footer">
          Generated via SuprO TeachO LMS Kindle Engine • Verified Academic Content
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  const handleAskAi = async (promptType: 'explain_tamil' | 'quiz' | 'summary', topic: string) => {
    if (promptType === 'explain_tamil') {
      openKindleBook(topic, 'tamil');
    } else if (promptType === 'quiz') {
      openKindleBook(topic, 'mcq');
    } else {
      openKindleBook(topic, 'theory');
    }
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
    
    // Intelligent AI Tutor response based on question keywords
    let aiResponse = '🤖 AI Tutor: Great question! Focus on breaking down the problem into given parameters, check the fundamental SI units, and apply standard formulas.';
    if (/tamil|தமிழ்|விளக்கம்/i.test(q)) {
      aiResponse = '🤖 AI Tutor: மிகச் சிறந்த கேள்வி! நீங்கள் கேட்ட தலைப்பின் முழு எளிய விளக்கக் குறிப்புகளைப் பெற மேலேயுள்ள "தமிழில் விளக்கம்" பொத்தானைத் தட்டவும்.';
    } else if (/formula|சூத்திரம்|equation|equation/i.test(q)) {
      aiResponse = '🤖 AI Tutor: For formulas in this unit, refer to Section 6 of the Kindle Book module for memory mnemonics and SI unit rules.';
    } else if (/exam|marks|score|tnpsc|neet/i.test(q)) {
      aiResponse = '🤖 AI Tutor: For high exam scores, practice the 5 MCQs and 2-mark step solutions in the Kindle Book tab to master the scoring rubrics.';
    }

    setForumPosts(prev => [
      {
        author: 'You (Student)',
        question: q,
        answer: aiResponse,
        time: 'Just now',
      },
      ...prev,
    ]);
  };

  const [activeVideo, setActiveVideo] = useState<{ title: string; videoUrl?: string; youtubeId?: string } | null>(null);

  const courseUnits: SyllabusUnit[] = useMemo(() => {
    if (!selectedCourse) return [];
    return getCourseSyllabus(selectedCourse.title_name, selectedCourse.category);
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedCourse) {
      setActiveVideo({
        title: selectedCourse.title_name,
        youtubeId: 'dQw4w9WgXcQ',
      });
    }
  }, [selectedCourse]);

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
        {/* Search Bar with Voice Recognition */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search courses, NEET/JEE units, TNPSC topics, CBSE syllabus, tests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-3 bg-[#111827] border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
          <button
            type="button"
            onClick={startVoiceSearch}
            title="Voice Search"
            className={`absolute right-3.5 top-2.5 p-2 rounded-xl transition ${
              isListening
                ? 'bg-red-500/20 text-red-400 animate-pulse border border-red-500/40'
                : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'
            }`}
          >
            <Mic className="w-4 h-4" />
          </button>
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
                <div className="space-y-6">
                  {/* 📺 Embedded In-App YouTube Video Lecture Player */}
                  <div className="rounded-2xl overflow-hidden border border-slate-800 bg-[#070b14] shadow-xl">
                    <div className="p-3 bg-[#0c1322] border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tv className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-white">In-App Video Lecture Player</span>
                        <span className="text-[10px] text-slate-400">• {activeVideo?.title || selectedCourse.title_name}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30">
                        Full HD Streaming
                      </span>
                    </div>
                    <div className="relative aspect-video w-full bg-black">
                      <iframe
                        src={`https://www.youtube.com/embed/${activeVideo?.youtubeId || 'dQw4w9WgXcQ'}?autoplay=0&rel=0`}
                        title={activeVideo?.title || selectedCourse.title_name}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="w-full h-full border-0"
                      />
                    </div>
                  </div>

                  {/* 5-Level Syllabus Units & Chapters */}
                  <div className="space-y-4">
                    {courseUnits.map((unit, uIdx) => (
                      <div key={unit.id || uIdx} className="bg-[#0c1322] border border-slate-800 rounded-2xl overflow-hidden">
                        <div className="p-4 bg-[#111827] border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                                {unit.subjectName}
                              </span>
                              <span className="text-xs font-bold text-slate-300">{unit.unitNumber}</span>
                            </div>
                            <h4 className="text-sm font-bold text-white mt-1">{unit.title}</h4>
                          </div>
                          <button
                            onClick={() => openKindleBook(unit.title, 'theory')}
                            className="self-start md:self-auto px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition shadow-md shadow-emerald-500/10"
                          >
                            📖 Unit Kindle Book
                          </button>
                        </div>

                        <div className="p-4 space-y-3">
                          {unit.chapters.map((chap, cIdx) => (
                            <div key={chap.id || cIdx} className="p-3.5 bg-[#111827]/80 rounded-xl border border-slate-800/80 space-y-3">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                <div className="flex items-start gap-3">
                                  <button
                                    onClick={() => setActiveVideo({ title: chap.title, youtubeId: chap.youtubeId || 'dQw4w9WgXcQ' })}
                                    className="mt-0.5 p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg transition"
                                    title="Watch Video Lecture"
                                  >
                                    <PlayCircle className="w-4 h-4" />
                                  </button>
                                  <div>
                                    <p className="text-xs font-bold text-white">{chap.title}</p>
                                    {chap.tamilTitle && <p className="text-[11px] text-amber-400/90 font-medium mt-0.5">{chap.tamilTitle}</p>}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <button
                                    onClick={() => openKindleBook(chap.title, 'theory')}
                                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-bold transition"
                                  >
                                    📖 Theory
                                  </button>
                                  <button
                                    onClick={() => openKindleBook(chap.title, 'tamil')}
                                    className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] font-bold transition"
                                  >
                                    தமிழ்
                                  </button>
                                  <button
                                    onClick={() => openKindleBook(chap.title, 'mcq')}
                                    className="px-2.5 py-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-lg text-[10px] font-bold transition"
                                  >
                                    5 MCQs
                                  </button>
                                </div>
                              </div>

                              {/* Micro-topics list */}
                              {chap.subtopics && chap.subtopics.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-slate-800/60 pl-2 space-y-2">
                                  {chap.subtopics.map(st => (
                                    <div key={st.id} className="space-y-1.5">
                                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Subtopic: {st.title}</span>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                                        {st.microTopics.map(mt => (
                                          <div
                                            key={mt.id}
                                            onClick={() => openKindleBook(mt.title, 'theory')}
                                            className="p-2.5 rounded-lg bg-[#0c1322] border border-slate-800/80 hover:border-emerald-500/40 cursor-pointer transition flex justify-between items-center group"
                                          >
                                            <div className="flex-1 pr-2">
                                              <p className="text-[11px] font-medium text-slate-300 group-hover:text-emerald-400 line-clamp-1">
                                                • {mt.title}
                                              </p>
                                              <p className="text-[9px] text-slate-500 line-clamp-1 mt-0.5">{mt.keyAxiom}</p>
                                            </div>
                                            {mt.pyqFrequency && (
                                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 whitespace-nowrap">
                                                {mt.pyqFrequency} PYQ
                                              </span>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeCourseTab === 'notes' && (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center">
                    <FileText className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                    <h4 className="text-sm font-bold text-white">Verified Kindle Chapter Notes & Formula PDFs</h4>
                    <p className="text-xs text-slate-400">High-yield revision notes, Tamil explanations and formulas for instant download.</p>
                  </div>
                  {courseUnits.map((unit, uIdx) => (
                    <div key={uIdx} className="space-y-2">
                      <span className="text-xs font-bold text-emerald-400">{unit.subjectName} — {unit.unitNumber}</span>
                      {unit.chapters.map((chap, cIdx) => (
                        <div key={cIdx} className="flex justify-between items-center p-4 bg-[#0c1322] border border-slate-800 rounded-xl">
                          <div>
                            <p className="text-sm font-bold text-white">{chap.title}</p>
                            <p className="text-xs text-slate-500">Kindle Book Chapter • Complete Notes & Solutions</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => openKindleBook(chap.title, 'theory')}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg text-slate-300 transition"
                            >
                              Kindle Book
                            </button>
                            <button
                              onClick={() => openKindleBook(chap.title, 'tamil')}
                              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-xs font-bold rounded-lg text-slate-950 transition"
                            >
                              தமிழில் குறிப்புகள்
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {activeCourseTab === 'mindmap' && (
                <div className="space-y-4">
                  <div className="p-4 bg-[#0c1322] border border-slate-800 rounded-2xl text-center">
                    <Network className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                    <h4 className="text-sm font-bold text-white">Visual Concept Hierarchy & Fast Access</h4>
                    <p className="text-xs text-slate-400">Click any branch below to open the Kindle Book chapter player.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {courseUnits.map((unit, idx) => (
                      <div
                        key={idx}
                        onClick={() => openKindleBook(unit.title, 'theory')}
                        className="p-4 bg-[#0c1322] border border-slate-800 hover:border-emerald-500/40 rounded-xl cursor-pointer transition"
                      >
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">{unit.subjectName}</span>
                        <h5 className="text-xs font-bold text-white mt-2">{unit.title}</h5>
                        <p className="text-xs text-slate-400 mt-1">{unit.chapters.length} Verified Chapters • Microtopic Flashcards & MCQs</p>
                      </div>
                    ))}
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
                      placeholder="Ask a doubt or concept question (e.g. explain formula in Tamil)..."
                      value={forumInput}
                      onChange={e => setForumInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handlePostForum()}
                      className="flex-1 px-4 py-2.5 bg-[#0c1322] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={handlePostForum}
                      className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" /> Post Question
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 📖 Kindle-Style Micro-Topic Interactive Book Player Modal */}
      {kindleBook && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6">
          <div
            className={`w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl transition-colors duration-300 border ${
              kindleTheme === 'sepia'
                ? 'bg-[#fcf8ed] text-[#451a03] border-[#e7dfc6]'
                : kindleTheme === 'light'
                ? 'bg-[#ffffff] text-[#0f172a] border-slate-200'
                : 'bg-[#0a0f1e] text-slate-100 border-slate-800'
            }`}
          >
            {/* Kindle Header */}
            <div
              className={`p-4 md:p-5 flex justify-between items-center border-b ${
                kindleTheme === 'sepia'
                  ? 'bg-[#f4eedb] border-[#e7dfc6]'
                  : kindleTheme === 'light'
                  ? 'bg-[#f8fafc] border-slate-200'
                  : 'bg-[#111827] border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                  <BookMarked className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                      Kindle Book Edition
                    </span>
                    <span className="text-[11px] opacity-70">⏱️ {kindleBook.readingTime}</span>
                  </div>
                  <h3 className="text-base font-bold truncate max-w-md mt-0.5">{kindleBook.topicTitle}</h3>
                </div>
              </div>

              {/* Kindle Reader Tools */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Theme Switcher */}
                <div className="flex bg-black/10 dark:bg-white/10 p-1 rounded-xl gap-1">
                  <button
                    onClick={() => setKindleTheme('dark')}
                    className={`p-1.5 rounded-lg transition ${kindleTheme === 'dark' ? 'bg-emerald-500 text-slate-950 font-bold' : 'opacity-60 hover:opacity-100'}`}
                    title="Dark Mode"
                  >
                    <Moon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setKindleTheme('sepia')}
                    className={`p-1.5 rounded-lg transition ${kindleTheme === 'sepia' ? 'bg-amber-600 text-white font-bold' : 'opacity-60 hover:opacity-100'}`}
                    title="Kindle Sepia"
                  >
                    <Coffee className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setKindleTheme('light')}
                    className={`p-1.5 rounded-lg transition ${kindleTheme === 'light' ? 'bg-slate-200 text-slate-900 font-bold' : 'opacity-60 hover:opacity-100'}`}
                    title="Light Mode"
                  >
                    <Sun className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Font Size */}
                <div className="flex bg-black/10 dark:bg-white/10 p-1 rounded-xl text-xs font-bold gap-1">
                  <button
                    onClick={() => setKindleFontSize(prev => (prev === 'xl' ? 'lg' : prev === 'lg' ? 'base' : 'sm'))}
                    className="px-2 py-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
                    title="Decrease Font Size"
                  >
                    A-
                  </button>
                  <button
                    onClick={() => setKindleFontSize(prev => (prev === 'sm' ? 'base' : prev === 'base' ? 'lg' : 'xl'))}
                    className="px-2 py-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
                    title="Increase Font Size"
                  >
                    A+
                  </button>
                </div>

                {/* One-Tap PDF Export */}
                <button
                  type="button"
                  onClick={() => printKindleBook(kindleBook)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-md"
                  title="Print / Save Kindle Book as PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Save PDF</span>
                </button>

                {/* Close */}
                <button
                  onClick={() => setKindleBook(null)}
                  className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 opacity-70 hover:opacity-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Kindle Navigation Sub-Tabs */}
            <div
              className={`flex overflow-x-auto px-4 py-2 border-b gap-1.5 text-xs font-bold ${
                kindleTheme === 'sepia'
                  ? 'bg-[#f4eedb]/80 border-[#e7dfc6]'
                  : kindleTheme === 'light'
                  ? 'bg-[#f1f5f9] border-slate-200'
                  : 'bg-[#0c1322] border-slate-800'
              }`}
            >
              {[
                { id: 'theory', label: '📖 Concept Theory', icon: BookOpen },
                { id: 'tamil', label: '🗣️ தமிழில் விளக்கம்', icon: Sparkles },
                { id: 'vsaq', label: '⚡ 1-Line Q&A (VSAQ)', icon: CheckCircle2 },
                { id: 'solutions', label: '📝 2-Mark & 5-Mark', icon: FileText },
                { id: 'mcq', label: '🎯 5 Practice MCQs', icon: FileCheck2 },
                { id: 'formulas', label: '📐 Formula Sheet', icon: Network },
              ].map(tab => {
                const active = kindleTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setKindleTab(tab.id as any)}
                    className={`whitespace-nowrap px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
                      active
                        ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                        : 'opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Kindle Reader Main Body */}
            <div
              className={`p-6 overflow-y-auto flex-1 leading-relaxed ${
                kindleFontSize === 'sm'
                  ? 'text-xs'
                  : kindleFontSize === 'lg'
                  ? 'text-base'
                  : kindleFontSize === 'xl'
                  ? 'text-lg'
                  : 'text-sm'
              }`}
            >
              {/* TAB 1: Concept Theory */}
              {kindleTab === 'theory' && (
                <div className="space-y-6 max-w-3xl mx-auto">
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">CHAPTER OVERVIEW</span>
                    <p className="mt-1 font-medium">{kindleBook.overview}</p>
                  </div>

                  <div className="space-y-4">
                    {kindleBook.coreConcepts.map((concept, idx) => (
                      <div
                        key={idx}
                        className={`p-5 rounded-2xl border ${
                          kindleTheme === 'sepia'
                            ? 'bg-[#f4eedb] border-[#e7dfc6]'
                            : kindleTheme === 'light'
                            ? 'bg-slate-50 border-slate-200'
                            : 'bg-[#111827] border-slate-800'
                        }`}
                      >
                        <h4 className="font-bold text-base mb-2 text-emerald-500">{concept.heading}</h4>
                        <p className="leading-relaxed opacity-90">{concept.content}</p>
                        {concept.example && (
                          <div className="mt-3 p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-600 dark:text-sky-400 font-medium">
                            💡 {concept.example}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: Tamil Explanation */}
              {kindleTab === 'tamil' && (
                <div className="space-y-6 max-w-3xl mx-auto">
                  <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">எளிய தமிழ் விளக்கம்</span>
                    <h3 className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-1">
                      {kindleBook.tamilExplanation.simpleTitle}
                    </h3>
                    <p className="mt-3 leading-relaxed text-sm opacity-95">
                      {kindleBook.tamilExplanation.colloquialIntro}
                    </p>
                  </div>

                  <div
                    className={`p-5 rounded-2xl border ${
                      kindleTheme === 'sepia'
                        ? 'bg-[#f4eedb] border-[#e7dfc6]'
                        : kindleTheme === 'light'
                        ? 'bg-slate-50 border-slate-200'
                        : 'bg-[#111827] border-slate-800'
                    }`}
                  >
                    <h4 className="font-bold text-emerald-500 mb-2">நடைமுறை உதாரணம் (Real-Life Analogy)</h4>
                    <p className="opacity-90 leading-relaxed">{kindleBook.tamilExplanation.everydayAnalogy}</p>
                  </div>

                  <div
                    className={`p-5 rounded-2xl border ${
                      kindleTheme === 'sepia'
                        ? 'bg-[#f4eedb] border-[#e7dfc6]'
                        : kindleTheme === 'light'
                        ? 'bg-slate-50 border-slate-200'
                        : 'bg-[#111827] border-slate-800'
                    }`}
                  >
                    <h4 className="font-bold text-emerald-500 mb-3">முக்கிய நினைவூட்டல்கள் (Key Revision Points)</h4>
                    <ul className="space-y-2">
                      {kindleBook.tamilExplanation.keyPointsTamil.map((pt, i) => (
                        <li key={i} className="flex items-start gap-2 opacity-90">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB 3: 1-Line Recall VSAQs */}
              {kindleTab === 'vsaq' && (
                <div className="space-y-4 max-w-3xl mx-auto">
                  <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-center">
                    <h4 className="font-bold text-sky-500 text-sm">⚡ 1-Line Fast Recall Flashcards</h4>
                    <p className="text-xs opacity-75 mt-0.5">Click "Reveal Answer" on any question to verify your memory.</p>
                  </div>

                  {kindleBook.vsaqs.map((v, i) => {
                    const isRevealed = !!revealedVsaq[i];
                    return (
                      <div
                        key={i}
                        className={`p-4 rounded-2xl border ${
                          kindleTheme === 'sepia'
                            ? 'bg-[#f4eedb] border-[#e7dfc6]'
                            : kindleTheme === 'light'
                            ? 'bg-slate-50 border-slate-200'
                            : 'bg-[#111827] border-slate-800'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-3">
                          <p className="font-bold">
                            <span className="text-emerald-500 mr-2">Q{i + 1}:</span> {v.question}
                          </p>
                          <button
                            onClick={() => setRevealedVsaq(prev => ({ ...prev, [i]: !prev[i] }))}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 text-xs font-bold whitespace-nowrap"
                          >
                            {isRevealed ? 'Hide' : 'Reveal Answer'}
                          </button>
                        </div>
                        {isRevealed && (
                          <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            ✓ {v.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 4: 2-Mark & 5-Mark Question Solutions */}
              {kindleTab === 'solutions' && (
                <div className="space-y-6 max-w-3xl mx-auto">
                  <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-center">
                    <h4 className="font-bold text-purple-500 text-sm">📝 Examination Descriptive Solutions & Marking Scheme</h4>
                    <p className="text-xs opacity-75 mt-0.5">Standard step-by-step scoring rubrics used by examiners.</p>
                  </div>

                  {kindleBook.shortAnswers.map((sa, i) => (
                    <div
                      key={i}
                      className={`p-5 rounded-2xl border space-y-3 ${
                        kindleTheme === 'sepia'
                          ? 'bg-[#f4eedb] border-[#e7dfc6]'
                          : kindleTheme === 'light'
                          ? 'bg-slate-50 border-slate-200'
                          : 'bg-[#111827] border-slate-800'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-base">
                          <span className="text-purple-500 mr-2">Q{i + 1}:</span> {sa.question}
                        </h4>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-500 border border-purple-500/30 whitespace-nowrap">
                          {sa.marks}
                        </span>
                      </div>

                      <div className="space-y-1.5 pl-2 border-l-2 border-emerald-500">
                        {sa.solutionSteps.map((step, sIdx) => (
                          <p key={sIdx} className="text-xs opacity-90 leading-relaxed">
                            {step}
                          </p>
                        ))}
                      </div>

                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-600 dark:text-amber-400 font-medium">
                        {sa.keyTips}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 5: 5 Interactive Practice MCQs */}
              {kindleTab === 'mcq' && (
                <div className="space-y-6 max-w-3xl mx-auto">
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-emerald-500 text-sm">🎯 5 Micro-Topic Practice MCQs</h4>
                      <p className="text-xs opacity-75">Click any option to test your understanding with instant feedback.</p>
                    </div>
                    {Object.keys(userMcqAnswers).length > 0 && (
                      <button
                        onClick={() => setUserMcqAnswers({})}
                        className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
                      >
                        Reset Quiz
                      </button>
                    )}
                  </div>

                  {kindleBook.mcqs.map((mcq, qIdx) => {
                    const selectedOpt = userMcqAnswers[qIdx];
                    const isAttempted = selectedOpt !== undefined;
                    const isCorrect = isAttempted && selectedOpt === mcq.correct;

                    return (
                      <div
                        key={qIdx}
                        className={`p-5 rounded-2xl border space-y-3 ${
                          kindleTheme === 'sepia'
                            ? 'bg-[#f4eedb] border-[#e7dfc6]'
                            : kindleTheme === 'light'
                            ? 'bg-slate-50 border-slate-200'
                            : 'bg-[#111827] border-slate-800'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <p className="font-bold text-sm">
                            <span className="text-emerald-500 mr-2">Q{qIdx + 1}:</span> {mcq.question}
                          </p>
                          {isAttempted && (
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                isCorrect
                                  ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/40'
                                  : 'bg-rose-500/20 text-rose-500 border border-rose-500/40'
                              }`}
                            >
                              {isCorrect ? '✓ Correct (+4)' : '✗ Incorrect (-1)'}
                            </span>
                          )}
                        </div>

                        <div className="space-y-2 pt-1">
                          {mcq.options.map((opt, oIdx) => {
                            let optStyle = 'border-slate-800 hover:border-slate-600';
                            if (isAttempted) {
                              if (oIdx === mcq.correct) {
                                optStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-500 font-bold';
                              } else if (selectedOpt === oIdx) {
                                optStyle = 'bg-rose-500/20 border-rose-500 text-rose-500 font-bold';
                              } else {
                                optStyle = 'opacity-40 border-transparent';
                              }
                            }

                            return (
                              <button
                                key={oIdx}
                                onClick={() => setUserMcqAnswers(prev => ({ ...prev, [qIdx]: oIdx }))}
                                className={`w-full text-left p-3 rounded-xl border text-xs transition ${optStyle}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>

                        {isAttempted && (
                          <div className="mt-3 p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-600 dark:text-sky-400">
                            <strong>💡 Explanation:</strong> {mcq.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 6: Key Formulas & Mnemonics */}
              {kindleTab === 'formulas' && (
                <div className="space-y-4 max-w-3xl mx-auto">
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                    <h4 className="font-bold text-emerald-500 text-sm">📐 High-Yield Formula Sheet & Memory Mnemonics</h4>
                    <p className="text-xs opacity-75 mt-0.5">Quick reference table for problem-solving speed.</p>
                  </div>

                  {kindleBook.formulasAndMnemonics.map((f, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-2xl border ${
                        kindleTheme === 'sepia'
                          ? 'bg-[#f4eedb] border-[#e7dfc6]'
                          : kindleTheme === 'light'
                          ? 'bg-slate-50 border-slate-200'
                          : 'bg-[#111827] border-slate-800'
                      }`}
                    >
                      <div className="p-3 rounded-xl bg-emerald-500/10 font-mono text-emerald-500 font-bold text-sm text-center">
                        {f.formula}
                      </div>
                      <p className="text-xs font-semibold mt-2 opacity-90">{f.meaning}</p>
                      {f.mnemonic && (
                        <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-1">
                          🧠 <strong>Mnemonic:</strong> {f.mnemonic}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Kindle Footer Actions */}
            <div
              className={`p-4 flex justify-between items-center border-t text-xs ${
                kindleTheme === 'sepia'
                  ? 'bg-[#f4eedb] border-[#e7dfc6]'
                  : kindleTheme === 'light'
                  ? 'bg-[#f8fafc] border-slate-200'
                  : 'bg-[#111827] border-slate-800'
              }`}
            >
              <span className="opacity-70 font-medium">EduVerse AI Kindle Learning Engine</span>
              <button
                type="button"
                onClick={() => printKindleBook(kindleBook)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition shadow-md"
              >
                <Printer className="w-4 h-4" /> Export Complete Chapter PDF
              </button>
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
