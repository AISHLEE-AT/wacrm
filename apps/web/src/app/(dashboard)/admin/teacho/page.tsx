'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen, Sparkles, Save, Upload, Download, Eye, CheckCircle2, 
  AlertCircle, ArrowLeft, RefreshCw, Layers, Video, FileText, 
  HelpCircle, Languages, Database, Search, ChevronRight
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

  async function loadLessonForDay(courseId: string, day: number) {
    setLoading(true);
    setSaveStatus('idle');
    try {
      const res = await fetch('/api/kindle-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          dayNumber: day,
          topicTitle: `${selectedCourse.title} Day ${day}`,
          courseTitle: selectedCourse.title,
          board: selectedCourse.board,
          standard: selectedCourse.title
        })
      });

      if (res.ok) {
        const data = await res.json();
        setIsVerifiedByAdmin(Boolean(data._meta?.isAdminVerified));
        
        setFormData({
          topicTitle: data.topicTitle || `${selectedCourse.title} Lesson ${day}`,
          category: data.category || selectedCourse.subjects?.[0]?.name || 'Core Subject',
          youtubeVideoId: data.videoMeta?.youtubeVideoId || '0TgLtF3PMOc',
          overview: data.overview || data.notes?.overview || '',
          coreConcepts: (data.coreConcepts || data.notes?.coreConcepts || [
            { heading: 'Core Principle', content: 'Detailed conceptual explanation.', example: 'Real-world model.' },
            { heading: 'Application & Methods', content: 'Practical problem solving techniques.', example: 'Standard example.' },
            { heading: 'Exam Shortcuts', content: 'Formulas and calculation tips.', example: 'Fast shortcut.' }
          ]),
          tamilExplanation: data.tamilExplanation || data.notes?.tamilExplanation || {
            simpleTitle: data.topicTitle || '',
            colloquialIntro: 'பாடத்தின் சுருக்கம் மற்றும் எளிய விளக்கம்.',
            everydayAnalogy: 'வாழ்வியல் ஒப்பீடு.',
            keyPointsTamil: ['முக்கிய குறிப்பு 1', 'முக்கிய குறிப்பு 2', 'முக்கிய குறிப்பு 3']
          },
          formulasAndMnemonics: data.formulasAndMnemonics || data.notes?.formulasAndMnemonics || [
            { name: 'Master Equation', formula: 'F = ma', mnemonic: 'Key invariant relationship.' }
          ],
          vsaqs: data.vsaqs || data.notes?.vsaqs || [
            { question: 'Define the core principle.', answer: 'Core textbook definition.', marks: 2 },
            { question: 'State the key formula.', answer: 'Standard mathematical formula.', marks: 2 }
          ],
          mcqs: data.mcqs || [
            { question: 'Which option correctly represents this concept?', options: ['Option A', 'Option B', 'Option C', 'Option D'], correctAnswer: 0, explanation: 'Option A is the verified correct definition.' },
            { question: 'What is the primary governing formula?', options: ['Formula A', 'Formula B', 'Formula C', 'Formula D'], correctAnswer: 0, explanation: 'Standard textbook formulation.' },
            { question: 'How is this applied in problem solving?', options: ['Method 1', 'Method 2', 'Method 3', 'Method 4'], correctAnswer: 0, explanation: 'Direct step-by-step evaluation.' },
            { question: 'In competitive examinations, this topic carries:', options: ['High weightage', 'Low weightage', 'Not included', 'Optional only'], correctAnswer: 0, explanation: 'Essential syllabus topic.' }
          ]
        });
      }
    } catch (e) {
      console.warn('Failed to load lesson for day:', e);
    } finally {
      setLoading(false);
    }
  }

  // 1-Click AI Auto-Draft with Gemini
  async function handleAiDraft() {
    setAiDrafting(true);
    setSaveStatus('idle');
    try {
      const res = await fetch('/api/kindle-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: selectedCourse.id,
          dayNumber,
          topicTitle: formData.topicTitle || `${selectedCourse.title} Day ${dayNumber}`,
          courseTitle: selectedCourse.title,
          board: selectedCourse.board,
          standard: selectedCourse.title,
          forceRefresh: true
        })
      });

      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({
          ...prev,
          topicTitle: data.topicTitle || prev.topicTitle,
          category: data.category || prev.category,
          overview: data.overview || prev.overview,
          coreConcepts: data.coreConcepts?.length ? data.coreConcepts : prev.coreConcepts,
          tamilExplanation: data.tamilExplanation || prev.tamilExplanation,
          formulasAndMnemonics: data.formulasAndMnemonics?.length ? data.formulasAndMnemonics : prev.formulasAndMnemonics,
          vsaqs: data.vsaqs?.length ? data.vsaqs : prev.vsaqs,
          mcqs: data.mcqs?.length ? data.mcqs : prev.mcqs
        }));
        setStatusMessage('AI draft generated successfully! Review and click Publish.');
      } else {
        setStatusMessage('AI draft failed. Please check Gemini API keys.');
      }
    } catch (e: any) {
      setStatusMessage(`Error: ${e.message}`);
    } finally {
      setAiDrafting(false);
    }
  }

  // Direct Save & Publish to Supabase LMS
  async function handlePublish() {
    setSaveStatus('saving');
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: selectedCourse.id,
          dayNumber,
          topicTitle: formData.topicTitle,
          courseTitle: selectedCourse.title,
          isAdminEdit: true,
          adminContent: payload
        })
      });

      if (res.ok) {
        setSaveStatus('saved');
        setIsVerifiedByAdmin(true);
        setStatusMessage(`Successfully published Day ${dayNumber} to Supabase LMS!`);
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
    <div className="flex h-full flex-col p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header & Nav */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin" className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Back to Admin
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-emerald-600" />
            TeachO Teacher Studio &amp; Curriculum CMS
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage, edit, AI-draft, and publish day-wise academic lessons across all 86 courses directly to Supabase LMS.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border">
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
              activeTab === 'editor' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm' : 'text-muted-foreground'
            }`}
          >
            Single Lesson Editor
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
              activeTab === 'bulk' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm' : 'text-muted-foreground'
            }`}
          >
            📊 Bulk CSV / JSON Importer
          </button>
        </div>
      </div>

      {activeTab === 'editor' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: 86 COURSES & DAY SELECTOR (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white dark:bg-slate-900 border rounded-xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  Select Course ({filteredCourses.length}/86)
                </h3>
              </div>

              {/* Search & Filter */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search 86 courses..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-sm border rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Category Pills */}
              <div className="flex gap-1 overflow-x-auto pb-1 text-xs">
                {['all', 'tnsb', 'cbse', 'matric', 'tnpsc', 'entrance', 'degree', 'skill'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-full whitespace-nowrap capitalize ${
                      selectedCategory === cat ? 'bg-emerald-600 text-white font-medium' : 'bg-slate-100 dark:bg-slate-800 text-muted-foreground'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Course List */}
              <div className="max-h-[380px] overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCourses.map(c => {
                  const isSelected = selectedCourse.id === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedCourse(c);
                        setDayNumber(1);
                      }}
                      className={`w-full text-left p-2.5 rounded-lg transition-all flex items-center justify-between gap-2 ${
                        isSelected 
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200' 
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold truncate">{c.title}</div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <span className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.2 rounded text-[10px]">{c.board}</span>
                          <span>{c.totalDays} Days</span>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-emerald-600' : 'text-slate-300'}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* DAY SELECTOR */}
            <div className="bg-white dark:bg-slate-900 border rounded-xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-600" />
                  Day Number ({dayNumber} / {selectedCourse.totalDays || 200})
                </h3>
                {isVerifiedByAdmin ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Admin Verified
                  </span>
                ) : (
                  <span className="text-[11px] bg-slate-100 dark:bg-slate-800 text-muted-foreground px-2 py-0.5 rounded-full">
                    Auto-Cached
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDayNumber(Math.max(1, dayNumber - 1))}
                  className="px-3 py-1.5 border rounded-lg hover:bg-slate-50 text-sm font-bold"
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  max={selectedCourse.totalDays || 360}
                  value={dayNumber}
                  onChange={e => setDayNumber(Math.max(1, parseInt(e.target.value || '1', 10)))}
                  className="flex-1 text-center py-1.5 border rounded-lg font-bold text-sm bg-slate-50 dark:bg-slate-800"
                />
                <button
                  onClick={() => setDayNumber(Math.min(selectedCourse.totalDays || 360, dayNumber + 1))}
                  className="px-3 py-1.5 border rounded-lg hover:bg-slate-50 text-sm font-bold"
                >
                  +
                </button>
              </div>

              {/* Quick Jump Days */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[1, 5, 10, 25, 50, 100, 150, 200].filter(d => d <= (selectedCourse.totalDays || 360)).map(d => (
                  <button
                    key={d}
                    onClick={() => setDayNumber(d)}
                    className={`px-2 py-0.5 text-xs rounded border ${
                      dayNumber === d ? 'bg-emerald-600 text-white font-bold border-emerald-600' : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800'
                    }`}
                  >
                    Day {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: RICH LESSON EDITOR (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white dark:bg-slate-900 border rounded-xl p-5 shadow-sm space-y-5">
              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
                <div>
                  <h2 className="text-lg font-bold">{selectedCourse.title}</h2>
                  <p className="text-xs text-muted-foreground">
                    Editing <span className="font-semibold text-emerald-600">Day {dayNumber}</span> &bull; Key: <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">{selectedCourse.id}_day_{dayNumber}</code>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAiDraft}
                    disabled={aiDrafting || loading}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90 shadow-sm disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${aiDrafting ? 'animate-spin' : ''}`} />
                    {aiDrafting ? 'Drafting with Gemini...' : '✨ AI Auto-Draft'}
                  </button>

                  <button
                    onClick={handlePublish}
                    disabled={saveStatus === 'saving' || loading}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {saveStatus === 'saving' ? 'Publishing...' : '💾 Publish to Supabase'}
                  </button>
                </div>
              </div>

              {statusMessage && (
                <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  saveStatus === 'saved' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                  saveStatus === 'error' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                  'bg-blue-50 text-blue-800 border border-blue-200'
                }`}>
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {statusMessage}
                </div>
              )}

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Topic Title</label>
                  <input
                    type="text"
                    value={formData.topicTitle}
                    onChange={e => setFormData({ ...formData, topicTitle: e.target.value })}
                    className="w-full p-2 text-sm border rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Subject / Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2 text-sm border rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">YouTube Video ID (or URL)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.youtubeVideoId}
                    onChange={e => setFormData({ ...formData, youtubeVideoId: e.target.value })}
                    className="flex-1 p-2 text-sm border rounded-lg bg-slate-50 dark:bg-slate-800 font-mono"
                    placeholder="e.g. 0TgLtF3PMOc"
                  />
                  <a
                    href={`https://www.youtube.com/watch?v=${formData.youtubeVideoId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-xs font-semibold rounded-lg flex items-center gap-1 hover:bg-slate-200"
                  >
                    <Video className="w-3.5 h-3.5 text-red-600" /> Watch
                  </a>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Academic Overview (120–180 Words)</label>
                <textarea
                  rows={4}
                  value={formData.overview}
                  onChange={e => setFormData({ ...formData, overview: e.target.value })}
                  className="w-full p-2.5 text-sm border rounded-lg bg-slate-50 dark:bg-slate-800 leading-relaxed"
                />
              </div>

              {/* 3 Core Concepts */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> 3 Core Conceptual Frameworks
                </h4>
                {formData.coreConcepts.map((concept, idx) => (
                  <div key={idx} className="p-3 border rounded-lg bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                    <input
                      type="text"
                      placeholder={`Concept ${idx + 1} Heading`}
                      value={concept.heading}
                      onChange={e => {
                        const updated = [...formData.coreConcepts];
                        updated[idx].heading = e.target.value;
                        setFormData({ ...formData, coreConcepts: updated });
                      }}
                      className="w-full p-1.5 text-xs font-bold border rounded bg-white dark:bg-slate-900"
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
                      className="w-full p-1.5 text-xs border rounded bg-white dark:bg-slate-900"
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
                      className="w-full p-1.5 text-xs border rounded bg-white dark:bg-slate-900 text-muted-foreground"
                    />
                  </div>
                ))}
              </div>

              {/* Tamil Explanation */}
              <div className="p-4 border rounded-lg bg-amber-50/40 dark:bg-amber-950/20 space-y-3">
                <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <Languages className="w-3.5 h-3.5" /> Tamil Colloquial Guidance (தமிழ் விளக்கம்)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-amber-900 dark:text-amber-300 mb-1">எளிய தலைப்பு</label>
                    <input
                      type="text"
                      value={formData.tamilExplanation.simpleTitle}
                      onChange={e => setFormData({
                        ...formData,
                        tamilExplanation: { ...formData.tamilExplanation, simpleTitle: e.target.value }
                      })}
                      className="w-full p-1.5 text-xs border rounded bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-amber-900 dark:text-amber-300 mb-1">வாழ்வியல் ஒப்பீடு (Everyday Analogy)</label>
                    <input
                      type="text"
                      value={formData.tamilExplanation.everydayAnalogy}
                      onChange={e => setFormData({
                        ...formData,
                        tamilExplanation: { ...formData.tamilExplanation, everydayAnalogy: e.target.value }
                      })}
                      className="w-full p-1.5 text-xs border rounded bg-white dark:bg-slate-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-amber-900 dark:text-amber-300 mb-1">தமிழ் உரை (Colloquial Intro)</label>
                  <textarea
                    rows={2}
                    value={formData.tamilExplanation.colloquialIntro}
                    onChange={e => setFormData({
                      ...formData,
                      tamilExplanation: { ...formData.tamilExplanation, colloquialIntro: e.target.value }
                    })}
                    className="w-full p-1.5 text-xs border rounded bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              {/* MCQs */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5" /> 4 High-Yield Daily MCQs
                </h4>
                {formData.mcqs.map((mcq, mIdx) => (
                  <div key={mIdx} className="p-3 border rounded-lg bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                    <input
                      type="text"
                      placeholder={`Question ${mIdx + 1}`}
                      value={mcq.question}
                      onChange={e => {
                        const updated = [...formData.mcqs];
                        updated[mIdx].question = e.target.value;
                        setFormData({ ...formData, mcqs: updated });
                      }}
                      className="w-full p-1.5 text-xs font-semibold border rounded bg-white dark:bg-slate-900"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      {mcq.options.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-1.5">
                          <input
                            type="radio"
                            name={`correct_${mIdx}`}
                            checked={mcq.correctAnswer === oIdx}
                            onChange={() => {
                              const updated = [...formData.mcqs];
                              updated[mIdx].correctAnswer = oIdx;
                              setFormData({ ...formData, mcqs: updated });
                            }}
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
                            className="flex-1 p-1 text-xs border rounded bg-white dark:bg-slate-900"
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
                      className="w-full p-1 text-xs border rounded bg-white dark:bg-slate-900 text-muted-foreground"
                    />
                  </div>
                ))}
              </div>

              {/* Bottom Publish Button */}
              <div className="pt-4 border-t flex justify-end">
                <button
                  onClick={handlePublish}
                  disabled={saveStatus === 'saving' || loading}
                  className="flex items-center gap-2 px-6 py-2.5 font-bold text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-md disabled:opacity-50"
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
        <div className="bg-white dark:bg-slate-900 border rounded-xl p-6 shadow-sm space-y-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-600" />
                Bulk CSV / JSON Curriculum Importer
              </h2>
              <p className="text-xs text-muted-foreground">
                Upload entire spreadsheets of 200 or 360-day syllabus lessons directly into Supabase LMS.
              </p>
            </div>
            <button
              onClick={handleDownloadSampleCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" /> Download Sample CSV
            </button>
          </div>

          {/* Upload Area */}
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center space-y-3 bg-slate-50/50 dark:bg-slate-800/30">
            <Upload className="w-10 h-10 text-slate-400 mx-auto" />
            <div>
              <label htmlFor="csv-upload" className="cursor-pointer font-bold text-sm text-emerald-600 hover:underline">
                Click to browse
              </label>{' '}
              <span className="text-sm text-muted-foreground">or drag and drop your .csv or .json file here</span>
            </div>
            <p className="text-xs text-slate-400">Supports UTF-8 CSV with course_id, day_number, topic_title, overview, formulas, mcqs</p>
            <input
              id="csv-upload"
              type="file"
              accept=".csv,.json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {bulkFile && (
            <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold">{bulkFile.name}</div>
                <div className="text-[11px] text-muted-foreground">
                  Parsed <span className="font-semibold text-emerald-600">{bulkRows.length} lesson rows</span> ready for import.
                </div>
              </div>
              <button
                onClick={handleExecuteBulkImport}
                disabled={bulkImporting || !bulkRows.length}
                className="px-5 py-2 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1.5"
              >
                {bulkImporting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                {bulkImporting ? `Importing (${bulkProgress}%)...` : 'Start Bulk Import'}
              </button>
            </div>
          )}

          {bulkImporting && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span>Importing to Supabase...</span>
                <span>{bulkProgress}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full transition-all duration-300" style={{ width: `${bulkProgress}%` }} />
              </div>
            </div>
          )}

          {bulkResult && (
            <div className="p-4 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              {bulkResult}
            </div>
          )}

          {/* Table Preview */}
          {bulkRows.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Preview Parsed Rows (First 5)</h3>
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="p-2">Course ID</th>
                      <th className="p-2">Day</th>
                      <th className="p-2">Subject</th>
                      <th className="p-2">Topic Title</th>
                      <th className="p-2">Formula</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {bulkRows.slice(0, 5).map((r, i) => (
                      <tr key={i}>
                        <td className="p-2 font-mono">{r.course_id || '-'}</td>
                        <td className="p-2 font-bold">{r.day_number || '-'}</td>
                        <td className="p-2">{r.subject || '-'}</td>
                        <td className="p-2 font-medium">{r.topic_title || '-'}</td>
                        <td className="p-2 font-mono text-muted-foreground">{r.formula || '-'}</td>
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
