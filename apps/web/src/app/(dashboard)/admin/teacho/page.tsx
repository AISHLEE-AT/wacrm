'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen, Sparkles, Save, Upload, Download, Eye, CheckCircle2, 
  AlertCircle, ArrowLeft, RefreshCw, Layers, Video, FileText, 
  HelpCircle, Languages, Database, Search, ChevronRight, Check
} from 'lucide-react';
import { ALL_COURSES, CourseOption } from '@/data/coursesCatalog';

export default function TeachOAdminStudioPage() {
  const [activeTab, setActiveTab] = useState<'editor' | 'bulk'>('editor');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Selected course & day
  const [selectedCourse, setSelectedCourse] = useState<CourseOption>(ALL_COURSES[0]);
  const [dayNumber, setDayNumber] = useState<number>(1);
  
  // Lesson form state
  const [loading, setLoading] = useState(false);
  const [aiDrafting, setAiDrafting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [isVerifiedByAdmin, setIsVerifiedByAdmin] = useState(false);

  const [formData, setFormData] = useState({
    topicTitle: '',
    category: '',
    youtubeVideoId: '0TgLtF3PMOc',
    overview: '',
    coreConcepts: [
      { heading: '', content: '', example: '' },
      { heading: '', content: '', example: '' },
      { heading: '', content: '', example: '' }
    ],
    tamilExplanation: {
      simpleTitle: '',
      colloquialIntro: '',
      everydayAnalogy: '',
      keyPointsTamil: ['', '', '']
    },
    formulasAndMnemonics: [
      { name: 'Master Formula', formula: '', mnemonic: '' }
    ],
    vsaqs: [
      { question: '', answer: '', marks: 2 },
      { question: '', answer: '', marks: 2 }
    ],
    mcqs: [
      { question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' },
      { question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' },
      { question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' },
      { question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }
    ]
  });

  // Bulk importer state
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkRows, setBulkRows] = useState<any[]>([]);
  const [bulkImporting, setBulkImporting] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [bulkResult, setBulkResult] = useState<string | null>(null);

  // Load lesson on course/day change
  useEffect(() => {
    loadLessonForDay(selectedCourse.id, dayNumber);
  }, [selectedCourse, dayNumber]);

  function getUserGeminiKey(): string {
    if (typeof window === 'undefined') return '';
    return (
      localStorage.getItem('user_gemini_api_key') ||
      localStorage.getItem('gemini_api_key') ||
      ''
    ).trim();
  }

  async function loadLessonForDay(courseId: string, day: number) {
    setLoading(true);
    setSaveStatus('idle');
    const userKey = getUserGeminiKey();

    // Reset formData immediately to prevent any stale previous day content
    const courseSubjects = selectedCourse.subjects || [];
    const activeSub = courseSubjects[(day - 1) % (courseSubjects.length || 1)]?.name || 'Core Subject';

    setFormData({
      topicTitle: `${selectedCourse.title} - Day ${day}`,
      category: activeSub,
      youtubeVideoId: '0TgLtF3PMOc',
      overview: `Loading Day ${day} syllabus lesson for ${selectedCourse.title}...`,
      coreConcepts: [
        { heading: `Day ${day}: Core Theoretical Framework`, content: 'Loading conceptual foundations...', example: '' },
        { heading: `Day ${day}: Step-by-Step Problem Solving`, content: 'Loading analytical methods...', example: '' },
        { heading: `Day ${day}: High-Yield Exam Formulas`, content: 'Loading memory rules and formulas...', example: '' }
      ],
      tamilExplanation: {
        simpleTitle: `${selectedCourse.title} - நாள் ${day}`,
        colloquialIntro: `நாள் ${day} பாடக்குறிப்பு ஏற்றப்படுகிறது...`,
        everydayAnalogy: '',
        keyPointsTamil: ['', '', '']
      },
      formulasAndMnemonics: [
        { name: `Day ${day} Master Formula`, formula: '', mnemonic: '' }
      ],
      vsaqs: [
        { question: `Day ${day} Question 1`, answer: '', marks: 2 },
        { question: `Day ${day} Question 2`, answer: '', marks: 2 }
      ],
      mcqs: [
        { question: `Day ${day} Diagnostic Question 1`, options: ['', '', '', ''], correctAnswer: 0, explanation: '' },
        { question: `Day ${day} Diagnostic Question 2`, options: ['', '', '', ''], correctAnswer: 0, explanation: '' },
        { question: `Day ${day} Diagnostic Question 3`, options: ['', '', '', ''], correctAnswer: 0, explanation: '' },
        { question: `Day ${day} Diagnostic Question 4`, options: ['', '', '', ''], correctAnswer: 0, explanation: '' }
      ]
    });

    try {
      const res = await fetch('/api/kindle-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userKey ? { 'x-user-gemini-key': userKey } : {})
        },
        body: JSON.stringify({
          courseId,
          dayNumber: day,
          topicTitle: `${selectedCourse.title} Day ${day}`,
          courseTitle: selectedCourse.title,
          board: selectedCourse.board,
          standard: selectedCourse.title,
          userGeminiKey: userKey
        })
      });

      if (res.ok) {
        const data = await res.json();
        setIsVerifiedByAdmin(Boolean(data._meta?.isAdminVerified || data.is_admin_verified));
        
        // 1. Extract Core Concepts
        let loadedConcepts = data.coreConcepts || data.notes?.coreConcepts;
        if (!loadedConcepts?.length && (data.studyNotes?.length || data.notes?.studyNotes?.length)) {
          const notes = data.studyNotes || data.notes?.studyNotes;
          loadedConcepts = notes.map((sn: any) => ({
            heading: sn.sectionTitle || sn.heading || 'Core Concept',
            content: sn.content || sn.body || '',
            example: sn.example || sn.formulaOrExample || ''
          }));
        }
        if (!loadedConcepts?.length) {
          loadedConcepts = [
            { heading: '1. Theoretical Foundations & Scope', content: 'Detailed conceptual explanation and core principles.', example: 'Model scenario application.' },
            { heading: '2. Methodologies & Derivations', content: 'Standard analytical approach, laws, and equations.', example: 'Step-by-step problem breakdown.' },
            { heading: '3. Exam Shortcuts & High-Yield Tips', content: 'Key exam recall tips, common traps, and rapid calculation rules.', example: 'Board examination memory trigger.' }
          ];
        }

        // 2. Extract MCQs
        let loadedMcqs = data.mcqs || data.practiceQuiz;
        if (loadedMcqs?.length) {
          loadedMcqs = loadedMcqs.map((m: any, i: number) => ({
            question: m.question || `Question ${i + 1}`,
            options: Array.isArray(m.options) && m.options.length >= 2 ? m.options : ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: m.correctAnswer !== undefined ? m.correctAnswer : (m.correctIndex !== undefined ? m.correctIndex : 0),
            explanation: m.explanation || 'Verified curriculum standard answer.'
          }));
        } else {
          loadedMcqs = [
            { question: 'Which option represents the primary governing principle of this topic?', options: ['Option A: Fundamental Principle', 'Option B: Secondary Rule', 'Option C: Exceptions Only', 'Option D: None of the above'], correctAnswer: 0, explanation: 'Option A gives the verified core definition.' },
            { question: 'What is the standard formula or governing equation?', options: ['Standard Formula A', 'Variant Equation B', 'Empirical Rule C', 'Alternative Form D'], correctAnswer: 0, explanation: 'Standard textbook formulation.' },
            { question: 'In board and competitive examinations, this concept carries:', options: ['High weightage', 'Moderate weightage', 'Not included', 'Optional only'], correctAnswer: 0, explanation: 'Essential syllabus high-yield component.' },
            { question: 'What is the most common exam pitfall to avoid?', options: ['Calculation error', 'Formula confusion', 'Unit mismatch', 'All of the above'], correctAnswer: 3, explanation: 'Careful step-by-step verification prevents errors.' }
          ];
        }

        // 3. Extract VSAQs / Flashcards / 2-Mark questions
        let loadedVsaqs = data.vsaqs;
        if (!loadedVsaqs?.length && data.twoMarkQuestions?.length) {
          loadedVsaqs = data.twoMarkQuestions.map((tm: any) => ({
            question: tm.question || '2-Mark Question',
            answer: tm.modelAnswer || (tm.keyPointsToInclude ? tm.keyPointsToInclude.join(' ') : 'Model answer.'),
            marks: 2
          }));
        } else if (!loadedVsaqs?.length && data.flashcards?.length) {
          loadedVsaqs = data.flashcards.map((fc: any) => ({
            question: fc.front || 'Key Question',
            answer: fc.back || 'Model answer.',
            marks: 2
          }));
        } else if (!loadedVsaqs?.length && data.oneLineQnA?.length) {
          loadedVsaqs = data.oneLineQnA.map((ol: any) => ({
            question: ol.question || 'Key Question',
            answer: ol.answer || 'Model answer.',
            marks: 2
          }));
        }
        if (!loadedVsaqs?.length) {
          loadedVsaqs = [
            { question: 'Define the core principle of this lesson.', answer: 'Fundamental textbook definition and primary application.', marks: 2 },
            { question: 'State the key formula, theorem, or rule.', answer: 'Standard mathematical formula with defined units.', marks: 2 }
          ];
        }

        // 4. Extract Formulas & Mnemonics
        let loadedFormulas = data.formulasAndMnemonics;
        if (!loadedFormulas?.length && data.notes?.formulasAndShortcuts?.length) {
          loadedFormulas = data.notes.formulasAndShortcuts.map((f: any) => ({
            name: f.name || 'Key Formula',
            formula: f.formula || 'Master Equation',
            mnemonic: f.tip || f.mnemonic || 'Exam recall tip'
          }));
        }
        if (!loadedFormulas?.length) {
          loadedFormulas = [
            { name: `${data.topicTitle || 'Lesson'} Master Rule`, formula: 'Standard Method / Equation', mnemonic: 'Active Recall Memory Rule' }
          ];
        }

        // 5. Extract Tamil Explanation
        const rawTamil = data.tamilExplanation || data.notes?.tamilExplanation;
        let loadedTamil = rawTamil;
        if (!loadedTamil && data.notes?.bilingualExplanation?.tamil) {
          loadedTamil = {
            simpleTitle: data.topicTitle || `${selectedCourse.title} Day ${day}`,
            colloquialIntro: data.notes.bilingualExplanation.tamil,
            everydayAnalogy: 'எளிய வாழ்வியல் ஒப்பீடு.',
            keyPointsTamil: [data.notes.bilingualExplanation.tamil, 'முக்கிய கருத்துகள்', 'தேர்வுக்கான குறிப்புகள்']
          };
        }
        if (!loadedTamil) {
          loadedTamil = {
            simpleTitle: data.topicTitle || `${selectedCourse.title} Day ${day}`,
            colloquialIntro: 'பாடத்தின் சுருக்கம் மற்றும் எளிய தமிழ் விளக்கம்.',
            everydayAnalogy: 'வாழ்வியல் உதாரணம்.',
            keyPointsTamil: ['முக்கிய குறிப்பு 1', 'முக்கிய குறிப்பு 2', 'முக்கிய குறிப்பு 3']
          };
        }

        setFormData({
          topicTitle: data.topicTitle || `${selectedCourse.title} Day ${day}`,
          category: data.category || data.subject || selectedCourse.subjects?.[0]?.name || 'Core Subject',
          youtubeVideoId: data.videoId || data.videoMeta?.youtubeVideoId || '0TgLtF3PMOc',
          overview: data.overview || data.notes?.overview || (data.notes?.keyPoints ? data.notes.keyPoints.join(' ') : '') || '',
          coreConcepts: loadedConcepts,
          tamilExplanation: loadedTamil,
          formulasAndMnemonics: loadedFormulas,
          vsaqs: loadedVsaqs,
          mcqs: loadedMcqs
        });

        if (data._meta?.source === 'cache') {
          setStatusMessage(`✅ Loaded from Supabase LMS Database (${data._meta?.isAdminVerified ? 'Admin Verified' : 'Auto-Saved'})`);
        } else if (data._meta?.source === 'local-file-bundle') {
          setStatusMessage(`📦 Loaded from Offline Multi-Day Harvest Archive. Ready to edit or publish.`);
        } else if (data._meta?.source === 'jit-generated') {
          setStatusMessage(`✨ Generated live with Gemini (${data._meta?.keySource || 'Active Pool'}). Review and click Publish.`);
        }
      }
    } catch (e) {
      console.warn('Failed to load lesson for day:', e);
      setStatusMessage('Notice: Content ready for drafting or manual input.');
    } finally {
      setLoading(false);
    }
  }

  // 1-Click AI Auto-Draft with Gemini (using Profile API Key)
  async function handleAiDraft() {
    setAiDrafting(true);
    setSaveStatus('idle');
    const userKey = getUserGeminiKey();

    try {
      const res = await fetch('/api/kindle-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userKey ? { 'x-user-gemini-key': userKey } : {})
        },
        body: JSON.stringify({
          courseId: selectedCourse.id,
          dayNumber,
          topicTitle: formData.topicTitle || `${selectedCourse.title} Day ${dayNumber}`,
          courseTitle: selectedCourse.title,
          board: selectedCourse.board,
          standard: selectedCourse.title,
          userGeminiKey: userKey,
          forceRefresh: true
        })
      });

      if (res.ok) {
        const data = await res.json();
        
        let loadedConcepts = data.coreConcepts || data.notes?.coreConcepts;
        if (!loadedConcepts?.length && data.studyNotes?.length) {
          loadedConcepts = data.studyNotes.map((sn: any) => ({
            heading: sn.sectionTitle || 'Core Concept',
            content: sn.content || '',
            example: sn.example || ''
          }));
        }

        let loadedMcqs = data.mcqs || data.practiceQuiz;
        if (loadedMcqs?.length) {
          loadedMcqs = loadedMcqs.map((pq: any) => ({
            question: pq.question || '',
            options: pq.options || ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: pq.correctAnswer !== undefined ? pq.correctAnswer : (pq.correctIndex !== undefined ? pq.correctIndex : 0),
            explanation: pq.explanation || ''
          }));
        }

        setFormData(prev => ({
          ...prev,
          topicTitle: data.topicTitle || prev.topicTitle,
          category: data.category || data.subject || prev.category,
          overview: data.overview || data.notes?.overview || prev.overview,
          coreConcepts: loadedConcepts?.length ? loadedConcepts : prev.coreConcepts,
          tamilExplanation: data.tamilExplanation || data.notes?.tamilExplanation || prev.tamilExplanation,
          formulasAndMnemonics: data.formulasAndMnemonics?.length ? data.formulasAndMnemonics : prev.formulasAndMnemonics,
          vsaqs: data.vsaqs?.length ? data.vsaqs : prev.vsaqs,
          mcqs: loadedMcqs?.length ? loadedMcqs : prev.mcqs
        }));
        setStatusMessage('✨ AI draft generated successfully! Review below and click Publish to Supabase.');
      } else {
        const err = await res.json().catch(() => ({}));
        setStatusMessage(`AI draft notice: ${err.error || 'Please ensure your Gemini key in Profile is active.'}`);
      }
    } catch (e: any) {
      setStatusMessage(`Error: ${e.message}`);
    } finally {
      setAiDrafting(false);
    }
  }

  // AI Polish & Enhance Helper
  async function handleAiPolish() {
    if (!formData.overview && !formData.topicTitle) return;
    setAiDrafting(true);
    const userKey = getUserGeminiKey();

    try {
      const res = await fetch('/api/kindle-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userKey ? { 'x-user-gemini-key': userKey } : {})
        },
        body: JSON.stringify({
          courseId: selectedCourse.id,
          dayNumber,
          topicTitle: formData.topicTitle,
          courseTitle: selectedCourse.title,
          board: selectedCourse.board,
          standard: selectedCourse.title,
          userGeminiKey: userKey,
          forceRefresh: true
        })
      });

      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({
          ...prev,
          overview: data.overview || data.notes?.overview || prev.overview,
          coreConcepts: data.coreConcepts?.length ? data.coreConcepts : prev.coreConcepts,
          tamilExplanation: data.tamilExplanation || data.notes?.tamilExplanation || prev.tamilExplanation
        }));
        setStatusMessage('✨ Successfully polished academic content with Gemini AI!');
      }
    } catch (e: any) {
      setStatusMessage(`Polish error: ${e.message}`);
    } finally {
      setAiDrafting(false);
    }
  }

  // Direct Save & Publish to Supabase LMS
  async function handlePublish() {
    setSaveStatus('saving');
    const userKey = getUserGeminiKey();

    try {
      const payload = {
        ...formData,
        courseId: selectedCourse.id,
        courseTitle: selectedCourse.title,
        dayNumber,
        is_admin_verified: true,
        videoMeta: {
          youtubeVideoId: formData.youtubeVideoId,
          videoTitle: formData.topicTitle,
          channelName: 'TeachO 1-on-1 Tuition',
          duration: '15:00',
          keyTimestamps: [{ time: '0:00', label: 'Concept Overview' }]
        },
        notes: {
          overview: formData.overview,
          coreConcepts: formData.coreConcepts,
          tamilExplanation: formData.tamilExplanation,
          vsaqs: formData.vsaqs,
          formulasAndMnemonics: formData.formulasAndMnemonics
        }
      };

      const res = await fetch('/api/kindle-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userKey ? { 'x-user-gemini-key': userKey } : {})
        },
        body: JSON.stringify({
          courseId: selectedCourse.id,
          dayNumber,
          topicTitle: formData.topicTitle,
          courseTitle: selectedCourse.title,
          isAdminEdit: true,
          adminContent: payload,
          userGeminiKey: userKey
        })
      });

      if (res.ok) {
        setSaveStatus('saved');
        setIsVerifiedByAdmin(true);
        setStatusMessage(`🎉 Successfully published Day ${dayNumber} to Supabase LMS!`);
      } else {
        setSaveStatus('error');
        setStatusMessage('Failed to publish. Please check database permissions.');
      }
    } catch (e: any) {
      setSaveStatus('error');
      setStatusMessage(`Publish failed: ${e.message}`);
    }
  }

  // Bulk CSV file selection & parsing
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkFile(file);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (file.name.endsWith('.json')) {
        try {
          const parsed = JSON.parse(text);
          setBulkRows(Array.isArray(parsed) ? parsed : [parsed]);
        } catch (err) {
          alert('Invalid JSON file format.');
        }
      } else {
        // Simple CSV parser
        const lines = text.split(/\r?\n/).filter(Boolean);
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const rows = [];
        for (let i = 1; i < lines.length; i++) {
          const vals = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          if (vals.length >= 3) {
            const rowObj: any = {};
            headers.forEach((h, idx) => {
              rowObj[h] = vals[idx] || '';
            });
            rows.push(rowObj);
          }
        }
        setBulkRows(rows);
      }
    };
    reader.readAsText(file);
  }

  // Download Sample CSV template
  function handleDownloadSampleCsv() {
    const csvContent = `course_id,day_number,subject,topic_title,overview,formula,tamil_summary,mcq_q1,mcq_opt_a,mcq_opt_b,mcq_opt_c,mcq_opt_d,mcq_correct
exam-tnpsc-grp1,1,General Science,Mechanics & Laws of Motion,"Academic overview of Newton's laws and mechanics.",F=ma,"நியூட்டனின் இயக்க விதிகள் மற்றும் சமன்பாடுகள்.","What is Newton's second law?","F = ma","E = mc^2","V = IR","PV = nRT",0
exam-neet-ug,1,NEET Physics,Kinematics & Projectile Motion,"Standard derivations for projectile range and maximum height.",R = u^2 sin(2θ) / g,"எறிபொருளின் இயக்கம் மற்றும் சமன்பாடுகள்.","What is maximum range angle?","45 degrees","90 degrees","30 degrees","60 degrees",0`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'teacho_curriculum_sample_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Execute Bulk Import
  async function handleExecuteBulkImport() {
    if (!bulkRows.length) return;
    setBulkImporting(true);
    setBulkProgress(0);
    setBulkResult(null);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < bulkRows.length; i++) {
      const row = bulkRows[i];
      const courseId = row.course_id || selectedCourse.id;
      const day = parseInt(row.day_number || '1', 10);
      const topic = row.topic_title || `Lesson ${day}`;
      const subject = row.subject || 'Core Subject';

      const payload = {
        topicTitle: topic,
        courseTitle: row.course_title || selectedCourse.title,
        category: subject,
        dayNumber: day,
        is_admin_verified: true,
        overview: row.overview || `Detailed lesson on ${topic}.`,
        coreConcepts: [
          { heading: `1. Core Principles of ${topic}`, content: row.overview || 'Standard definition.', example: 'Real-world model.' },
          { heading: `2. Methodologies & Applications`, content: 'Step-by-step application.', example: 'Model problem.' },
          { heading: `3. Exam Formulas & Shortcuts`, content: 'Key exam tips.', example: row.formula || 'F = ma' }
        ],
        tamilExplanation: {
          simpleTitle: topic,
          colloquialIntro: row.tamil_summary || `இன்றைய பாடம்: ${topic}`,
          everydayAnalogy: 'எளிய வாழ்வியல் ஒப்பீடு.',
          keyPointsTamil: [row.tamil_summary || topic, 'முக்கிய சூத்திரங்கள்', 'தேர்வுக்கான குறுக்குவழிகள்']
        },
        formulasAndMnemonics: [
          { name: `${topic} Master Rule`, formula: row.formula || 'Master Equation', mnemonic: 'Key Takeaway' }
        ],
        mcqs: [
          {
            question: row.mcq_q1 || `What is the primary governing principle of ${topic}?`,
            options: [row.mcq_opt_a || 'Option A', row.mcq_opt_b || 'Option B', row.mcq_opt_c || 'Option C', row.mcq_opt_d || 'Option D'],
            correctAnswer: parseInt(row.mcq_correct || '0', 10),
            explanation: 'Verified curriculum answer.'
          }
        ]
      };

      try {
        const res = await fetch('/api/kindle-ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courseId,
            dayNumber: day,
            topicTitle: topic,
            isAdminEdit: true,
            adminContent: payload
          })
        });

        if (res.ok) successCount++;
        else failCount++;
      } catch (err) {
        failCount++;
      }

      setBulkProgress(Math.round(((i + 1) / bulkRows.length) * 100));
    }

    setBulkImporting(false);
    setBulkResult(`Bulk Import Complete! Successfully saved ${successCount} lessons (${failCount} errors).`);
  }

  const filteredCourses = ALL_COURSES.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || c.category.includes(selectedCategory);
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 p-4 md:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Header & Nav */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link href="/admin" className="text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Dashboard
            </Link>
          </div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            TeachO Teacher Studio &amp; Curriculum CMS
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage, edit, AI-draft, and publish day-wise academic lessons across all 86 courses directly to Supabase LMS.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-[#0c1322] p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'editor' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Single Lesson Editor
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'bulk' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            📊 Bulk CSV / JSON Importer
          </button>
        </div>
      </div>

      {activeTab === 'editor' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* ─── LEFT: 86 COURSES & DAY SELECTOR (4 Cols) ─────────────────── */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#0c1322] border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Select Course ({filteredCourses.length}/86)
                </h3>
              </div>

              {/* Search & Filter */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search 86 courses..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-700 bg-[#070b14] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-500"
                />
              </div>

              {/* Category Pills */}
              <div className="flex gap-1 overflow-x-auto pb-1 text-[11px] scrollbar-none">
                {['all', 'tnsb', 'cbse', 'matric', 'tnpsc', 'entrance', 'degree', 'skill'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-full whitespace-nowrap capitalize font-medium transition-all ${
                      selectedCategory === cat ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Course List */}
              <div className="max-h-[360px] overflow-y-auto space-y-1 pr-1 divide-y divide-slate-800/50 scrollbar-thin scrollbar-thumb-slate-700">
                {filteredCourses.map(c => {
                  const isSelected = selectedCourse.id === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedCourse(c);
                        setDayNumber(1);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between gap-2 ${
                        isSelected 
                          ? 'bg-emerald-500/15 border border-emerald-500/70 text-emerald-300 shadow-inner' 
                          : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold truncate text-white">{c.title}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span className="bg-slate-800 px-1.5 py-0.2 rounded text-[9px] text-slate-300">{c.board}</span>
                          <span>{c.totalDays} Days</span>
                        </div>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-600'}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* DAY SELECTOR */}
            <div className="bg-[#0c1322] border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-400" />
                  Day Number ({dayNumber} / {selectedCourse.totalDays || 200})
                </h3>
                {isVerifiedByAdmin ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Admin Verified
                  </span>
                ) : (
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-medium">
                    Auto-Cached
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDayNumber(Math.max(1, dayNumber - 1))}
                  className="px-3.5 py-1.5 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  max={selectedCourse.totalDays || 360}
                  value={dayNumber}
                  onChange={e => setDayNumber(Math.max(1, parseInt(e.target.value || '1', 10)))}
                  className="flex-1 text-center py-1.5 border border-slate-700 font-bold text-sm bg-[#070b14] text-white rounded-lg focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  onClick={() => setDayNumber(Math.min(selectedCourse.totalDays || 360, dayNumber + 1))}
                  className="px-3.5 py-1.5 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  +
                </button>
              </div>

              {/* Quick Jump Days */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[1, 2, 3, 4, 5, 10, 25, 50, 100, 200].filter(d => d <= (selectedCourse.totalDays || 360)).map(d => (
                  <button
                    key={d}
                    onClick={() => setDayNumber(d)}
                    className={`px-2 py-0.5 text-[11px] rounded-md border transition-all ${
                      dayNumber === d 
                        ? 'bg-emerald-600 text-white font-bold border-emerald-500 shadow-sm' 
                        : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                  >
                    Day {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ─── RIGHT: RICH LESSON EDITOR (8 Cols) ───────────────────────── */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-[#0c1322] border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-5">
              
              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-base md:text-lg font-black text-white">{selectedCourse.title}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-slate-400">
                      Editing <span className="font-bold text-emerald-400">Day {dayNumber}</span> &bull; Key: <code className="text-xs bg-[#070b14] border border-slate-800 px-1.5 py-0.5 rounded font-mono text-slate-300">{selectedCourse.id}_day_{dayNumber}</code>
                    </p>
                    {getUserGeminiKey() ? (
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        🔑 Profile Key Active
                      </span>
                    ) : (
                      <span className="text-[10px] bg-slate-800 text-slate-300 font-medium px-2 py-0.5 rounded-full flex items-center gap-1 border border-slate-700">
                        🌐 System Key Pool
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleAiPolish}
                    disabled={aiDrafting || loading || !formData.overview}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-sm disabled:opacity-50 transition-colors"
                    title="Optimize overview and concepts with AI"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    AI Polish
                  </button>

                  <button
                    onClick={handleAiDraft}
                    disabled={aiDrafting || loading}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90 shadow-md shadow-purple-600/20 disabled:opacity-50 transition-all"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${aiDrafting ? 'animate-spin' : ''}`} />
                    {aiDrafting ? 'Drafting with Gemini...' : '✨ AI Auto-Draft'}
                  </button>

                  <button
                    onClick={handlePublish}
                    disabled={saveStatus === 'saving' || loading}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {saveStatus === 'saving' ? 'Publishing...' : '💾 Publish to Supabase'}
                  </button>
                </div>
              </div>

              {/* Status Message Banner */}
              {statusMessage && (
                <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                  saveStatus === 'saved' ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40' :
                  saveStatus === 'error' ? 'bg-rose-950/60 text-rose-300 border-rose-500/40' :
                  'bg-blue-950/60 text-blue-300 border-blue-500/40'
                }`}>
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {statusMessage}
                </div>
              )}

              {/* Form Fields: Topic & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Topic Title
                  </label>
                  <input
                    type="text"
                    value={formData.topicTitle}
                    onChange={e => setFormData({ ...formData, topicTitle: e.target.value })}
                    className="w-full p-2.5 text-sm border border-slate-700 bg-[#070b14] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-500"
                    placeholder="e.g. Mechanics & Laws of Motion"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Subject / Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 text-sm border border-slate-700 bg-[#070b14] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-500"
                    placeholder="e.g. Physics / Polity"
                  />
                </div>
              </div>

              {/* YouTube Video ID */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  YouTube Video ID (or URL)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.youtubeVideoId}
                    onChange={e => setFormData({ ...formData, youtubeVideoId: e.target.value })}
                    className="flex-1 p-2.5 text-sm border border-slate-700 bg-[#070b14] text-white rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. 0TgLtF3PMOc"
                  />
                  <a
                    href={`https://www.youtube.com/watch?v=${formData.youtubeVideoId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors border border-slate-700"
                  >
                    <Video className="w-4 h-4 text-red-400" /> Watch
                  </a>
                </div>
              </div>

              {/* Academic Overview */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Academic Overview (120–180 Words)
                </label>
                <textarea
                  rows={4}
                  value={formData.overview}
                  onChange={e => setFormData({ ...formData, overview: e.target.value })}
                  className="w-full p-3 text-sm border border-slate-700 bg-[#070b14] text-white rounded-xl leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-500"
                  placeholder="Comprehensive high-yield overview of the lesson..."
                />
              </div>

              {/* 3 Core Concepts */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-400" /> 3 Core Conceptual Frameworks
                </h4>
                {formData.coreConcepts.map((concept, idx) => (
                  <div key={idx} className="p-4 border border-slate-800 rounded-xl bg-[#090e1a] space-y-2.5">
                    <input
                      type="text"
                      placeholder={`Concept ${idx + 1} Heading`}
                      value={concept.heading}
                      onChange={e => {
                        const updated = [...formData.coreConcepts];
                        updated[idx].heading = e.target.value;
                        setFormData({ ...formData, coreConcepts: updated });
                      }}
                      className="w-full p-2 text-xs font-bold border border-slate-700 rounded-lg bg-[#070b14] text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <textarea
                      rows={2}
                      placeholder={`Detailed theoretical explanation for Concept ${idx + 1}...`}
                      value={concept.content}
                      onChange={e => {
                        const updated = [...formData.coreConcepts];
                        updated[idx].content = e.target.value;
                        setFormData({ ...formData, coreConcepts: updated });
                      }}
                      className="w-full p-2 text-xs border border-slate-700 rounded-lg bg-[#070b14] text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed"
                    />
                    <input
                      type="text"
                      placeholder="Real-world model / worked example..."
                      value={concept.example}
                      onChange={e => {
                        const updated = [...formData.coreConcepts];
                        updated[idx].example = e.target.value;
                        setFormData({ ...formData, coreConcepts: updated });
                      }}
                      className="w-full p-2 text-xs border border-slate-700/60 rounded-lg bg-[#070b14] text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                ))}
              </div>

              {/* Tamil Explanation */}
              <div className="p-4 border border-amber-500/30 rounded-xl bg-amber-950/20 space-y-3">
                <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Languages className="w-4 h-4 text-amber-400" /> Tamil Colloquial Guidance (தமிழ் விளக்கம்)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-amber-300 mb-1">எளிய தலைப்பு</label>
                    <input
                      type="text"
                      value={formData.tamilExplanation.simpleTitle}
                      onChange={e => setFormData({
                        ...formData,
                        tamilExplanation: { ...formData.tamilExplanation, simpleTitle: e.target.value }
                      })}
                      className="w-full p-2 text-xs border border-amber-500/40 rounded-lg bg-[#070b14] text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-amber-300 mb-1">வாழ்வியல் ஒப்பீடு (Everyday Analogy)</label>
                    <input
                      type="text"
                      value={formData.tamilExplanation.everydayAnalogy}
                      onChange={e => setFormData({
                        ...formData,
                        tamilExplanation: { ...formData.tamilExplanation, everydayAnalogy: e.target.value }
                      })}
                      className="w-full p-2 text-xs border border-amber-500/40 rounded-lg bg-[#070b14] text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-amber-300 mb-1">தமிழ் உரை (Colloquial Intro)</label>
                  <textarea
                    rows={2}
                    value={formData.tamilExplanation.colloquialIntro}
                    onChange={e => setFormData({
                      ...formData,
                      tamilExplanation: { ...formData.tamilExplanation, colloquialIntro: e.target.value }
                    })}
                    className="w-full p-2 text-xs border border-amber-500/40 rounded-lg bg-[#070b14] text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 leading-relaxed"
                  />
                </div>
              </div>

              {/* MCQs */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-emerald-400" /> 4 High-Yield Daily MCQs
                </h4>
                {formData.mcqs.map((mcq, mIdx) => (
                  <div key={mIdx} className="p-4 border border-slate-800 rounded-xl bg-[#090e1a] space-y-3">
                    <input
                      type="text"
                      placeholder={`Question ${mIdx + 1}`}
                      value={mcq.question}
                      onChange={e => {
                        const updated = [...formData.mcqs];
                        updated[mIdx].question = e.target.value;
                        setFormData({ ...formData, mcqs: updated });
                      }}
                      className="w-full p-2 text-xs font-bold border border-slate-700 rounded-lg bg-[#070b14] text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {mcq.options.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-2 p-1.5 rounded-lg border border-slate-800 bg-[#070b14]">
                          <input
                            type="radio"
                            name={`correct_${mIdx}`}
                            checked={mcq.correctAnswer === oIdx}
                            onChange={() => {
                              const updated = [...formData.mcqs];
                              updated[mIdx].correctAnswer = oIdx;
                              setFormData({ ...formData, mcqs: updated });
                            }}
                            className="text-emerald-500 focus:ring-emerald-500 h-4 w-4 bg-slate-900 border-slate-700"
                          />
                          <input
                            type="text"
                            placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                            value={opt}
                            onChange={e => {
                              const updated = [...formData.mcqs];
                              updated[mIdx].options[oIdx] = e.target.value;
                              setFormData({ ...formData, mcqs: updated });
                            }}
                            className="flex-1 p-1 text-xs bg-transparent text-slate-200 focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Step-by-step reasoning explanation..."
                      value={mcq.explanation}
                      onChange={e => {
                        const updated = [...formData.mcqs];
                        updated[mIdx].explanation = e.target.value;
                        setFormData({ ...formData, mcqs: updated });
                      }}
                      className="w-full p-2 text-xs border border-slate-700/60 rounded-lg bg-[#070b14] text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                ))}
              </div>

              {/* Bottom Publish Button */}
              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={handlePublish}
                  disabled={saveStatus === 'saving' || loading}
                  className="flex items-center gap-2 px-6 py-2.5 font-bold text-xs rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 disabled:opacity-50 transition-all"
                >
                  <Save className="w-4 h-4" />
                  {saveStatus === 'saving' ? 'Publishing to Supabase...' : 'Save & Publish to Supabase Database'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* BULK CSV / JSON IMPORTER TAB */
        <div className="bg-[#0c1322] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base md:text-lg font-black text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-400" />
                Bulk CSV / JSON Curriculum Importer
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload entire spreadsheets of 200 or 360-day syllabus lessons directly into Supabase LMS.
              </p>
            </div>
            <button
              onClick={handleDownloadSampleCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" /> Download Sample CSV
            </button>
          </div>

          {/* Upload Area */}
          <div className="border-2 border-dashed border-slate-700 rounded-2xl p-8 text-center space-y-3 bg-[#070b14]/50">
            <Upload className="w-10 h-10 text-slate-500 mx-auto" />
            <div>
              <label htmlFor="csv-upload" className="cursor-pointer font-bold text-sm text-emerald-400 hover:underline">
                Click to browse
              </label>{' '}
              <span className="text-sm text-slate-300">or drag and drop your .csv or .json file here</span>
            </div>
            <p className="text-xs text-slate-500">Supports UTF-8 CSV with course_id, day_number, topic_title, overview, formulas, mcqs</p>
            <input
              id="csv-upload"
              type="file"
              accept=".csv,.json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {bulkFile && (
            <div className="p-4 border border-slate-800 rounded-xl bg-[#070b14] flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">{bulkFile.name}</div>
                <div className="text-[11px] text-slate-400">
                  Parsed <span className="font-bold text-emerald-400">{bulkRows.length} lesson rows</span> ready for import.
                </div>
              </div>
              <button
                onClick={handleExecuteBulkImport}
                disabled={bulkImporting || !bulkRows.length}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
              >
                {bulkImporting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                {bulkImporting ? `Importing (${bulkProgress}%)...` : 'Start Bulk Import'}
              </button>
            </div>
          )}

          {bulkImporting && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-300">
                <span>Importing to Supabase...</span>
                <span>{bulkProgress}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${bulkProgress}%` }} />
              </div>
            </div>
          )}

          {bulkResult && (
            <div className="p-4 rounded-xl bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              {bulkResult}
            </div>
          )}

          {/* Table Preview */}
          {bulkRows.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Preview Parsed Rows (First 5)</h3>
              <div className="overflow-x-auto border border-slate-800 rounded-xl bg-[#070b14]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0c1322] text-slate-300 border-b border-slate-800">
                    <tr>
                      <th className="p-2.5 font-bold">Course ID</th>
                      <th className="p-2.5 font-bold">Day</th>
                      <th className="p-2.5 font-bold">Subject</th>
                      <th className="p-2.5 font-bold">Topic Title</th>
                      <th className="p-2.5 font-bold">Formula</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {bulkRows.slice(0, 5).map((r, i) => (
                      <tr key={i} className="hover:bg-slate-800/30">
                        <td className="p-2.5 font-mono text-emerald-400">{r.course_id || '-'}</td>
                        <td className="p-2.5 font-bold text-white">{r.day_number || '-'}</td>
                        <td className="p-2.5">{r.subject || '-'}</td>
                        <td className="p-2.5 font-medium text-white">{r.topic_title || '-'}</td>
                        <td className="p-2.5 font-mono text-slate-400">{r.formula || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
