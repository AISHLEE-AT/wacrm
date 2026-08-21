'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen, Sparkles, Save, Upload, Download, Eye, CheckCircle2, 
  AlertCircle, ArrowLeft, RefreshCw, Layers, Video, FileText, 
  HelpCircle, Languages, Database, Search, ChevronRight, Check,
  Share2, MessageCircle
} from 'lucide-react';
import { ALL_COURSES, CourseOption } from '@/data/coursesCatalog';

export default function TeachOAdminStudioPage() {
  const [activeTab, setActiveTab] = useState<'editor' | 'bulk'>('editor');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Selected course, day & active section/period
  const [selectedCourse, setSelectedCourse] = useState<CourseOption>(ALL_COURSES[0]);
  const [dayNumber, setDayNumber] = useState<number>(1);
  const [activeSection, setActiveSection] = useState<number>(1);
  
  // Lesson form state
  const [loading, setLoading] = useState(false);
  const [aiDrafting, setAiDrafting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [isVerifiedByAdmin, setIsVerifiedByAdmin] = useState(false);
  const [isDbLoaded, setIsDbLoaded] = useState(false);

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

  // Compute all sections / periods available for this course
  const courseSubjects = selectedCourse.subjects || [];
  const isTamilCourse = selectedCourse.medium === 'Tamil' || selectedCourse.id.includes('-ta-');

  const daySections = courseSubjects.length > 0
    ? courseSubjects.map((s, idx) => ({
        taskNumber: idx + 1,
        title: s.name,
        icon: s.icon || '📖',
        color: s.color || '#3b82f6',
        currentChapter: s.currentChapter || ''
      }))
    : (selectedCourse.id.includes('jee') ? [
        { taskNumber: 1, title: 'Mathematics', icon: '📐', color: '#06b6d4', currentChapter: 'Coordinate Geometry & Calculus' },
        { taskNumber: 2, title: 'Physics', icon: '⚡', color: '#ec4899', currentChapter: 'Mechanics & Electromagnetism' },
        { taskNumber: 3, title: 'Chemistry', icon: '🧪', color: '#8b5cf6', currentChapter: 'Organic & Inorganic Chemistry' },
        { taskNumber: 4, title: 'Daily Problem Sprint', icon: '🏆', color: '#f59e0b', currentChapter: '10-Question High-Yield Drills' }
      ] : selectedCourse.id.includes('neet') ? [
        { taskNumber: 1, title: 'Botany & Plant Physiology', icon: '🌿', color: '#10b981', currentChapter: 'Cell Biology & Plant Physiology' },
        { taskNumber: 2, title: 'Zoology & Human Physiology', icon: '🧬', color: '#3b82f6', currentChapter: 'Human Physiology & Genetics' },
        { taskNumber: 3, title: 'Physics', icon: '⚡', color: '#ec4899', currentChapter: 'Optics & Thermodynamics' },
        { taskNumber: 4, title: 'Chemistry', icon: '🧪', color: '#8b5cf6', currentChapter: 'Organic & Physical Chemistry' }
      ] : selectedCourse.id.includes('tnpsc') ? [
        { taskNumber: 1, title: isTamilCourse ? 'பொதுத்தமிழ் & செய்யுள்' : 'General English', icon: '📜', color: '#ec4899', currentChapter: 'இலக்கணம் & இலக்கியம்' },
        { taskNumber: 2, title: 'இந்திய அரசியலமைப்பு (Polity)', icon: '🏛️', color: '#3b82f6', currentChapter: 'அரசியலமைப்பு & உரிமைகள்' },
        { taskNumber: 3, title: 'வரலாறு & பண்பாடு', icon: '🏺', color: '#f59e0b', currentChapter: 'தமிழக வரலாறு & பண்பாடு' },
        { taskNumber: 4, title: 'பொது அறிவியல் & பொருளாதாரம்', icon: '🔬', color: '#10b981', currentChapter: 'பொருளாதாரம் & அறிவியல்' },
        { taskNumber: 5, title: 'திறனறிவும் மனக்கணக்கும் (Aptitude)', icon: '📐', color: '#06b6d4', currentChapter: 'சுருக்குதல் & தனிவட்டி' }
      ] : [
        { taskNumber: 1, title: isTamilCourse ? 'தமிழ் மொழி & செய்யுள்' : 'Primary Language', icon: '📜', color: '#ec4899', currentChapter: 'செய்யுள் & உரைநடை' },
        { taskNumber: 2, title: isTamilCourse ? 'கணிதம்' : 'Mathematics', icon: '📐', color: '#06b6d4', currentChapter: 'எண்கள் & இயற்கணிதம்' },
        { taskNumber: 3, title: isTamilCourse ? 'அறிவியல்' : 'Science & EVS', icon: '🔬', color: '#10b981', currentChapter: 'இயற்பியல் & உயிரியல்' },
        { taskNumber: 4, title: isTamilCourse ? 'சமூக அறிவியல்' : 'Social Science', icon: '🌍', color: '#f59e0b', currentChapter: 'வரலாறு & புவியியல்' },
        { taskNumber: 5, title: 'English & Grammar', icon: '📖', color: '#8b5cf6', currentChapter: 'Prose & Vocabulary' },
        { taskNumber: 6, title: isTamilCourse ? 'மாதிரித் தேர்வு & வினாடி வினா' : 'Assessment Quiz', icon: '📝', color: '#ef4444', currentChapter: 'Daily Assessment' }
      ]);

  // Load lesson on course/day/section change
  useEffect(() => {
    loadLessonForDay(selectedCourse.id, dayNumber, activeSection);
  }, [selectedCourse, dayNumber, activeSection]);

  function getUserGeminiKey(): string {
    if (typeof window === 'undefined') return '';
    return (
      localStorage.getItem('user_gemini_api_key') ||
      localStorage.getItem('gemini_api_key') ||
      ''
    ).trim();
  }

  async function loadLessonForDay(courseId: string, day: number, sectionNum: number = 1) {
    setLoading(true);
    setSaveStatus('idle');
    const userKey = getUserGeminiKey();

    const curSection = daySections.find(s => s.taskNumber === sectionNum) || daySections[0];
    const activeSub = curSection?.title || 'Core Subject';

    // Reset formData immediately to prevent any stale previous day/section content
    setFormData({
      topicTitle: `${selectedCourse.title} - Day ${day}: ${activeSub}`,
      category: activeSub,
      youtubeVideoId: '0TgLtF3PMOc',
      overview: `Loading Day ${day} section (${activeSub}) for ${selectedCourse.title}...`,
      coreConcepts: [
        { heading: `Day ${day} (${activeSub}): Core Theoretical Framework`, content: 'Loading conceptual foundations...', example: '' },
        { heading: `Day ${day} (${activeSub}): Step-by-Step Problem Solving`, content: 'Loading analytical methods...', example: '' },
        { heading: `Day ${day} (${activeSub}): High-Yield Exam Formulas`, content: 'Loading memory rules and formulas...', example: '' }
      ],
      tamilExplanation: {
        simpleTitle: `${selectedCourse.title} - நாள் ${day} (${activeSub})`,
        colloquialIntro: `நாள் ${day}, பிரிவு ${sectionNum} (${activeSub}) பாடக்குறிப்பு ஏற்றப்படுகிறது...`,
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
          taskNumber: sectionNum,
          sectionNumber: sectionNum,
          topicTitle: `${selectedCourse.title} Day ${day} ${activeSub}`,
          courseTitle: selectedCourse.title,
          board: selectedCourse.board,
          standard: selectedCourse.title,
          userGeminiKey: userKey
        })
      });

      if (res.ok) {
        const data = await res.json();
        const isDb = Boolean(data._meta?.isVerifiedInDb || data._meta?.source === 'cache' || data._meta?.isAdminVerified);
        setIsDbLoaded(isDb);
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
            { heading: `1. Core Principles: ${activeSub}`, content: `Detailed theoretical explanation and principles of ${activeSub} for Day ${day}.`, example: 'Standard textbook model.' },
            { heading: `2. Problem Solving & Analysis`, content: 'Standard analytical approach, derivations, and methodology.', example: 'Worked example problem.' },
            { heading: `3. Exam Formulas & Shortcuts`, content: 'Key exam recall tips, shortcuts, and memory triggers.', example: 'Formula derivation.' }
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
            { question: `Which option represents the primary governing principle of this ${activeSub} lesson?`, options: ['Option A: Fundamental Principle', 'Option B: Secondary Rule', 'Option C: Exceptions Only', 'Option D: None of the above'], correctAnswer: 0, explanation: 'Option A gives the verified core definition.' },
            { question: 'What is the standard formula or governing equation?', options: ['Standard Formula A', 'Variant Equation B', 'Empirical Rule C', 'Alternative Form D'], correctAnswer: 0, explanation: 'Standard textbook formulation.' },
            { question: 'In board and competitive examinations, this concept carries:', options: ['High weightage', 'Moderate weightage', 'Not included', 'Optional only'], correctAnswer: 0, explanation: 'Essential syllabus high-yield component.' },
            { question: 'What is the most common exam pitfall to avoid?', options: ['Calculation error', 'Formula confusion', 'Unit mismatch', 'All of the above'], correctAnswer: 3, explanation: 'Careful step-by-step verification prevents errors.' }
          ];
        }

        // 3. Extract VSAQs
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
            { question: `Define the core principle of this ${activeSub} lesson.`, answer: 'Fundamental textbook definition and primary application.', marks: 2 },
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
            { name: `${data.topicTitle || activeSub} Master Rule`, formula: 'Standard Method / Equation', mnemonic: 'Active Recall Memory Rule' }
          ];
        }

        // 5. Extract Tamil Explanation
        const rawTamil = data.tamilExplanation || data.notes?.tamilExplanation;
        let loadedTamil = rawTamil;
        if (!loadedTamil && data.notes?.bilingualExplanation?.tamil) {
          loadedTamil = {
            simpleTitle: data.topicTitle || `${selectedCourse.title} Day ${day} (${activeSub})`,
            colloquialIntro: data.notes.bilingualExplanation.tamil,
            everydayAnalogy: 'எளிய வாழ்வியல் ஒப்பீடு.',
            keyPointsTamil: [data.notes.bilingualExplanation.tamil, 'முக்கிய கருத்துகள்', 'தேர்வுக்கான குறிப்புகள்']
          };
        }
        if (!loadedTamil) {
          loadedTamil = {
            simpleTitle: data.topicTitle || `${selectedCourse.title} Day ${day} (${activeSub})`,
            colloquialIntro: `நாள் ${day}: ${activeSub} பாடத்தின் சுருக்கம் மற்றும் எளிய தமிழ் விளக்கம்.`,
            everydayAnalogy: 'வாழ்வியல் உதாரணம்.',
            keyPointsTamil: ['முக்கிய குறிப்பு 1', 'முக்கிய குறிப்பு 2', 'முக்கிய குறிப்பு 3']
          };
        }

        setFormData({
          topicTitle: data.topicTitle || `${selectedCourse.title} Day ${day} - ${activeSub}`,
          category: data.category || activeSub,
          youtubeVideoId: data.videoId || data.videoMeta?.youtubeVideoId || '0TgLtF3PMOc',
          overview: data.overview || data.notes?.overview || (data.notes?.keyPoints ? data.notes.keyPoints.join(' ') : '') || '',
          coreConcepts: loadedConcepts,
          tamilExplanation: loadedTamil,
          formulasAndMnemonics: loadedFormulas,
          vsaqs: loadedVsaqs,
          mcqs: loadedMcqs
        });

        if (isDb) {
          setStatusMessage(`✅ Loaded Day ${day} Section ${sectionNum} (${activeSub}) from Supabase LMS.`);
        } else {
          setStatusMessage(`✨ Generated Day ${day} Section ${sectionNum} (${activeSub}) with Curriculum Engine.`);
        }
      }
    } catch (e) {
      console.warn('Failed to load lesson for day:', e);
      setStatusMessage('Notice: Content ready for drafting or manual input.');
    } finally {
      setLoading(false);
    }
  }

  // AI Auto-Draft Full Lesson
  async function handleAiDraft() {
    setAiDrafting(true);
    setStatusMessage('Drafting full lesson with Gemini AI...');
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
          taskNumber: activeSection,
          sectionNumber: activeSection,
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
        loadLessonForDay(selectedCourse.id, dayNumber, activeSection);
        setStatusMessage(`✨ Successfully generated AI curriculum draft for Section ${activeSection}!`);
      } else {
        setStatusMessage('AI draft notice: Please check your Gemini API key in Profile.');
      }
    } catch (e: any) {
      setStatusMessage(`Draft error: ${e.message}`);
    } finally {
      setAiDrafting(false);
    }
  }

  // AI Polish
  async function handleAiPolish() {
    setAiDrafting(true);
    setStatusMessage('Polishing lesson concepts with Gemini AI...');
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
          taskNumber: activeSection,
          sectionNumber: activeSection,
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
        taskNumber: activeSection,
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
          taskNumber: activeSection,
          sectionNumber: activeSection,
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
        setIsDbLoaded(true);
        setStatusMessage(`🎉 Successfully published Day ${dayNumber} Section ${activeSection} to Supabase LMS!`);
      } else {
        setSaveStatus('error');
        setStatusMessage('Failed to publish. Please check database permissions.');
      }
    } catch (e: any) {
      setSaveStatus('error');
      setStatusMessage(`Publish failed: ${e.message}`);
    }
  }

  // WhatsApp Share Helper
  function handleShareWhatsApp() {
    const curSecTitle = daySections.find(s => s.taskNumber === activeSection)?.title || 'Core';
    const text = encodeURIComponent(
      `📚 TeachO Daily Lesson Module\n` +
      `🎓 Course: ${selectedCourse.title}\n` +
      `📅 Day: ${dayNumber} | Section ${activeSection}: ${curSecTitle}\n` +
      `📖 Topic: ${formData.topicTitle}\n` +
      `📝 Overview: ${formData.overview.substring(0, 150)}...\n\n` +
      `🚀 Open on TeachO: https://watscrm.vercel.app/admin/teacho`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }

  // WhatsApp Admin Request Link
  function handleContactAdminWhatsApp() {
    const curSecTitle = daySections.find(s => s.taskNumber === activeSection)?.title || 'Core';
    const text = encodeURIComponent(
      `Hello TeachO Admin, please review and verify the lesson:\n` +
      `• Course: ${selectedCourse.title}\n` +
      `• Day: ${dayNumber} | Section ${activeSection} (${curSecTitle})\n` +
      `• Topic: ${formData.topicTitle}\n\n` +
      `Please prioritize publishing this content to Supabase LMS.`
    );
    window.open(`https://wa.me/919944900000?text=${text}`, '_blank');
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
    const csvContent = `course_id,day_number,task_number,subject,topic_title,overview,formula,tamil_summary,mcq_q1,mcq_opt_a,mcq_opt_b,mcq_opt_c,mcq_opt_d,mcq_correct
tnsb-ta-7,10,1,தமிழ்,இயல் 1: கவிதைப்பேழை எங்கள் தமிழ்,"நாமக்கல் கவிஞர் வெ. இராமலிங்கனாரின் பாடல் நயங்கள்.",நூல் குறிப்பு,"தமிழ் மொழியின் அருள்நெறி பண்புகள்.","நாமக்கல் கவிஞர் எவ்வாறு அழைக்கப்படுகிறார்?","காந்தியக் கவிஞர்","புரட்சிக் கவிஞர்","மக்கள் கவிஞர்","தேசியக் கவிஞர்",0
tnsb-ta-7,10,2,கணிதம்,அலகு 1: எண்கள் மற்றும் முழுக்கள்,"முழுக்களின் கூட்டல் மற்றும் கழித்தல் விதிகள்.",a+b=c,"முழுக்களின் எளிய பயன்பாடுகள்.","(-5) + (-3) இன் மதிப்பு என்ன?","-8","8","-2","2",0
exam-jee-main,10,1,Mathematics,Coordinate Geometry: Straight Lines,"Perpendicular distance from a point to a line.",d=|ax1+by1+c|/sqrt(a^2+b^2),"நேர்க்கோட்டின் சமன்பாடுகள்.","What is distance from origin to 3x+4y=5?","1","5","0","2",0`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'teacho_curriculum_multisection_template.csv');
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
      const task = parseInt(row.task_number || '1', 10);
      const topic = row.topic_title || `Lesson ${day}`;
      const subject = row.subject || 'Core Subject';

      const payload = {
        topicTitle: topic,
        courseTitle: row.course_title || selectedCourse.title,
        category: subject,
        dayNumber: day,
        taskNumber: task,
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
            taskNumber: task,
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

  const currentSectionInfo = daySections.find(s => s.taskNumber === activeSection) || daySections[0];
  const sectionKey = activeSection > 1 ? `${selectedCourse.id}_day_${dayNumber}_task_${activeSection}` : `${selectedCourse.id}_day_${dayNumber}`;

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
            Manage, edit, AI-draft, and publish day-wise academic lessons &amp; multi-subject periods across all 86 courses directly to Supabase LMS.
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
            Single Lesson &amp; Section Editor
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
              <div className="max-h-[340px] overflow-y-auto space-y-1 pr-1 divide-y divide-slate-800/50 scrollbar-thin scrollbar-thumb-slate-700">
                {filteredCourses.map(c => {
                  const isSelected = selectedCourse.id === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedCourse(c);
                        setDayNumber(1);
                        setActiveSection(1);
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
                {isDbLoaded ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> In Supabase DB
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full">
                    <Sparkles className="w-3 h-3" /> AI Draft Mode
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

            {/* WHATSAPP & SUPPORT CONNECT CARD */}
            <div className="bg-[#0c1322] border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                WhatsApp Connect &amp; Share
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Share this day&apos;s lesson with students on WhatsApp or request immediate content verification from the admin team.
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleShareWhatsApp}
                  className="w-full py-2 px-3 text-xs font-bold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" /> Share Lesson on WhatsApp
                </button>
                <button
                  onClick={handleContactAdminWhatsApp}
                  className="w-full py-2 px-3 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp Request to Admin
                </button>
              </div>
            </div>

          </div>

          {/* ─── RIGHT: RICH LESSON & MULTI-SECTION EDITOR (8 Cols) ─────────── */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-[#0c1322] border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-5">
              
              {/* Day Sections / Periods Header Tabs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    Day {dayNumber} Sections &amp; Subject Periods ({daySections.length}):
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Selected: <strong className="text-emerald-400">Section {activeSection} ({currentSectionInfo.title})</strong>
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {daySections.map((sec) => {
                    const isActive = activeSection === sec.taskNumber;
                    return (
                      <button
                        key={sec.taskNumber}
                        onClick={() => setActiveSection(sec.taskNumber)}
                        className={`p-2.5 rounded-xl text-left border transition-all flex items-center gap-2.5 ${
                          isActive
                            ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
                            : 'bg-[#070b14] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-lg">{sec.icon}</span>
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-bold truncate text-white">
                            P{sec.taskNumber}: {sec.title}
                          </div>
                          {sec.currentChapter && (
                            <div className="text-[9px] text-slate-500 truncate mt-0.5">
                              {sec.currentChapter}
                            </div>
                          )}
                        </div>
                        {isActive && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-b border-slate-800 py-4">
                <div>
                  <h2 className="text-base md:text-lg font-black text-white">{selectedCourse.title}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-slate-400">
                      Editing <span className="font-bold text-emerald-400">Day {dayNumber} · Section {activeSection}</span> &bull; Key: <code className="text-xs bg-[#070b14] border border-slate-800 px-1.5 py-0.5 rounded font-mono text-slate-300">{sectionKey}</code>
                    </p>
                    {isDbLoaded ? (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Supabase DB
                      </span>
                    ) : (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> AI Draft
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
                    Section Heading / Topic Title
                  </label>
                  <input
                    type="text"
                    value={formData.topicTitle}
                    onChange={e => setFormData({ ...formData, topicTitle: e.target.value })}
                    className="w-full p-2.5 text-sm border border-slate-700 bg-[#070b14] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-500"
                    placeholder="e.g. தமிழ்: இயல் 1 செய்யுள் & உரைநடை"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Subject / Period Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 text-sm border border-slate-700 bg-[#070b14] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-500"
                    placeholder="e.g. தமிழ் மொழி / Mathematics"
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
                  placeholder="Comprehensive high-yield overview of the section lesson..."
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
                  <label className="block text-[11px] font-bold text-amber-300 mb-1">எளிய தமிழ் அறிமுகம் (2–3 வாக்கியங்கள்)</label>
                  <textarea
                    rows={2}
                    value={formData.tamilExplanation.colloquialIntro}
                    onChange={e => setFormData({
                      ...formData,
                      tamilExplanation: { ...formData.tamilExplanation, colloquialIntro: e.target.value }
                    })}
                    className="w-full p-2 text-xs border border-amber-500/40 rounded-lg bg-[#070b14] text-white focus:outline-none focus:ring-1 focus:ring-amber-500 leading-relaxed"
                  />
                </div>
              </div>

              {/* Master Formula & Mnemonics */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-400" /> Formulas &amp; Mnemonics
                </h4>
                {formData.formulasAndMnemonics.map((form, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 border border-slate-800 rounded-xl bg-[#090e1a]">
                    <input
                      type="text"
                      placeholder="Rule / Formula Name"
                      value={form.name}
                      onChange={e => {
                        const updated = [...formData.formulasAndMnemonics];
                        updated[idx].name = e.target.value;
                        setFormData({ ...formData, formulasAndMnemonics: updated });
                      }}
                      className="p-2 text-xs font-bold border border-slate-700 rounded-lg bg-[#070b14] text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <input
                      type="text"
                      placeholder="Exact Formula (e.g. F = ma)"
                      value={form.formula}
                      onChange={e => {
                        const updated = [...formData.formulasAndMnemonics];
                        updated[idx].formula = e.target.value;
                        setFormData({ ...formData, formulasAndMnemonics: updated });
                      }}
                      className="p-2 text-xs font-mono border border-slate-700 rounded-lg bg-[#070b14] text-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <input
                      type="text"
                      placeholder="Exam Memory Shortcut"
                      value={form.mnemonic}
                      onChange={e => {
                        const updated = [...formData.formulasAndMnemonics];
                        updated[idx].mnemonic = e.target.value;
                        setFormData({ ...formData, formulasAndMnemonics: updated });
                      }}
                      className="p-2 text-xs border border-slate-700 rounded-lg bg-[#070b14] text-purple-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                ))}
              </div>

              {/* 2-Mark VSAQs */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-blue-400" /> High-Yield 2-Mark Short Questions (VSAQs)
                </h4>
                {formData.vsaqs.map((vsaq, idx) => (
                  <div key={idx} className="p-3 border border-slate-800 rounded-xl bg-[#090e1a] space-y-2">
                    <input
                      type="text"
                      placeholder={`2-Mark Question ${idx + 1}`}
                      value={vsaq.question}
                      onChange={e => {
                        const updated = [...formData.vsaqs];
                        updated[idx].question = e.target.value;
                        setFormData({ ...formData, vsaqs: updated });
                      }}
                      className="w-full p-2 text-xs font-bold border border-slate-700 rounded-lg bg-[#070b14] text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <input
                      type="text"
                      placeholder="Precise textbook model answer..."
                      value={vsaq.answer}
                      onChange={e => {
                        const updated = [...formData.vsaqs];
                        updated[idx].answer = e.target.value;
                        setFormData({ ...formData, vsaqs: updated });
                      }}
                      className="w-full p-2 text-xs border border-slate-700 rounded-lg bg-[#070b14] text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                ))}
              </div>

              {/* 4 Daily MCQs */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 4 Daily High-Yield Practice MCQs
                </h4>
                {formData.mcqs.map((mcq, idx) => (
                  <div key={idx} className="p-4 border border-slate-800 rounded-xl bg-[#090e1a] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400">Diagnostic Question {idx + 1}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-400">Correct Option:</span>
                        <select
                          value={mcq.correctAnswer}
                          onChange={e => {
                            const updated = [...formData.mcqs];
                            updated[idx].correctAnswer = parseInt(e.target.value, 10);
                            setFormData({ ...formData, mcqs: updated });
                          }}
                          className="p-1 text-xs border border-slate-700 rounded-lg bg-[#070b14] text-emerald-400 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          <option value={0}>A</option>
                          <option value={1}>B</option>
                          <option value={2}>C</option>
                          <option value={3}>D</option>
                        </select>
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="Question text..."
                      value={mcq.question}
                      onChange={e => {
                        const updated = [...formData.mcqs];
                        updated[idx].question = e.target.value;
                        setFormData({ ...formData, mcqs: updated });
                      }}
                      className="w-full p-2 text-xs font-bold border border-slate-700 rounded-lg bg-[#070b14] text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {['A', 'B', 'C', 'D'].map((optLetter, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-1.5">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            mcq.correctAnswer === optIdx ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {optLetter}
                          </span>
                          <input
                            type="text"
                            placeholder={`Option ${optLetter}...`}
                            value={mcq.options[optIdx] || ''}
                            onChange={e => {
                              const updated = [...formData.mcqs];
                              const newOpts = [...updated[idx].options];
                              newOpts[optIdx] = e.target.value;
                              updated[idx].options = newOpts;
                              setFormData({ ...formData, mcqs: updated });
                            }}
                            className={`flex-1 p-2 text-xs border rounded-lg bg-[#070b14] text-white focus:outline-none focus:ring-1 ${
                              mcq.correctAnswer === optIdx ? 'border-emerald-500/70' : 'border-slate-700'
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Step-by-step verified explanation for why this option is correct..."
                      value={mcq.explanation}
                      onChange={e => {
                        const updated = [...formData.mcqs];
                        updated[idx].explanation = e.target.value;
                        setFormData({ ...formData, mcqs: updated });
                      }}
                      className="w-full p-2 text-xs border border-slate-700/80 rounded-lg bg-[#070b14] text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                ))}
              </div>

              {/* Bottom Sticky Action Bar */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <div className="text-xs text-slate-400">
                  Ready to publish <span className="font-bold text-white">Day {dayNumber} · Section {activeSection}</span> to Supabase LMS
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleShareWhatsApp}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Share on WhatsApp
                  </button>
                  <button
                    onClick={handlePublish}
                    disabled={saveStatus === 'saving' || loading}
                    className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    {saveStatus === 'saving' ? 'Publishing...' : 'Publish to Supabase LMS'}
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      ) : (
        /* ─── BULK CSV / JSON IMPORTER TAB ──────────────────────────────── */
        <div className="bg-[#0c1322] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <h2 className="text-lg font-black text-white">Bulk Curriculum CSV / JSON Importer</h2>
              <p className="text-xs text-slate-400 mt-1">
                Upload day-wise or multi-section syllabus files to batch-publish hundreds of lessons directly to Supabase LMS.
              </p>
            </div>
            <button
              onClick={handleDownloadSampleCsv}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl transition-colors shrink-0"
            >
              <Download className="w-4 h-4 text-emerald-400" /> Download Sample CSV Template
            </button>
          </div>

          <div className="p-8 border-2 border-dashed border-slate-700 rounded-2xl bg-[#090e1a] text-center space-y-3">
            <Upload className="w-10 h-10 text-emerald-400 mx-auto" />
            <div>
              <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all">
                Select CSV or JSON File
                <input
                  type="file"
                  accept=".csv,.json"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-slate-400 mt-2">Supports multi-day curriculum files exported from Excel, Sheets, or harvested JSONs.</p>
            </div>
            {bulkFile && (
              <div className="inline-block p-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-emerald-300">
                📄 Loaded: {bulkFile.name} ({bulkRows.length} rows parsed)
              </div>
            )}
          </div>

          {bulkRows.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Preview ({bulkRows.length} Lessons to Import):</span>
                <button
                  onClick={handleExecuteBulkImport}
                  disabled={bulkImporting}
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {bulkImporting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  {bulkImporting ? `Importing (${bulkProgress}%)...` : `🚀 Start Bulk Import (${bulkRows.length} Lessons)`}
                </button>
              </div>

              {bulkImporting && (
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${bulkProgress}%` }}
                  />
                </div>
              )}

              {bulkResult && (
                <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {bulkResult}
                </div>
              )}

              <div className="max-h-60 overflow-y-auto border border-slate-800 rounded-xl divide-y divide-slate-800/60 bg-[#070b14] text-xs">
                {bulkRows.slice(0, 20).map((row, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-slate-300">
                    <span className="font-mono text-emerald-400">{row.course_id || selectedCourse.id}</span>
                    <span className="font-bold">Day {row.day_number || '1'} (Section {row.task_number || '1'})</span>
                    <span className="truncate max-w-xs">{row.topic_title || row.title}</span>
                    <span className="text-slate-400">{row.subject || 'Core'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
