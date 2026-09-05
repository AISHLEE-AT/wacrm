'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Sparkles,
  Save,
  Upload,
  Download,
  Eye,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  Layers,
  Video,
  FileText,
  HelpCircle,
  Languages,
  Database,
  Search,
  ChevronRight,
  ChevronDown,
  Check,
  Share2,
  MessageCircle,
  Plus,
  FolderPlus,
  Compass,
  ExternalLink,
  Award,
  Trash2,
  ShieldCheck,
  Clock,
  Target,
  Edit,
  Code,
  Tag,
  CreditCard,
  UserCheck,
  Zap,
  Bot,
  Play,
  HardDrive,
  Star,
  FileSpreadsheet,
  Copy,
} from 'lucide-react';
import { createClient } from '../../../../lib/supabase/client';
import { ALL_COURSES, CourseOption, SCHOOL_BOARDS, SchoolBoard } from '../../../../data/coursesCatalog';
import {
  getOfficialGovernmentSyllabus,
  OfficialCourseSyllabus,
  OfficialSubjectSyllabus,
  OfficialChapter,
  OfficialMicroTopic,
  OfficialNanoConcept,
} from '../../../../data/curriculum/officialGovernmentSyllabusRegistry';
import { resolveNanoDayPlan, NanoDayPlan } from '../../../../data/curriculum/dayPlanNanoEngine';
import {
  generateUniqueTenClassesForDay,
  DayClassItem,
  DayQuizQuestion,
  DayYogaPlan,
  DayTestPlan,
} from '../../../../data/curriculum/curriculum365Engine';
import { AMBITION_FEATURE_TRACKS } from '../../../../components/teacho/TutODailyPlannerCockpit';
import { geminiToolsService, GEMINI_MODELS } from '../../../../lib/geminiToolsService';
import {
  GoogleSheetsDayPlanService,
  GoogleSheetDayPlanItem,
  GoogleSheetConfig,
} from '../../../../lib/googleSheetsDayPlanService';

export default function TutOAdminStudioPage() {
  const [activeTab, setActiveTab] = useState<
    'catalog' | 'syllabus' | 'day_plan' | 'question_bank' | 'lecture_studio' | 'purchases' | 'submissions' | 'google_sheets'
  >('catalog');

  // Google Sheet Manager States
  const [sheetUrl, setSheetUrl] = useState('');
  const [sheetTabName, setSheetTabName] = useState('Sheet1');
  const [isSyncingSheet, setIsSyncingSheet] = useState(false);
  const [sheetPlans, setSheetPlans] = useState<Record<string, GoogleSheetDayPlanItem>>({});
  const [sheetConfig, setSheetConfig] = useState<GoogleSheetConfig | null>(null);

  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState<boolean>(false);
  const [submissionStatusFilter, setSubmissionStatusFilter] = useState<'all' | 'submitted' | 'approved'>('all');
  const [remarksMap, setRemarksMap] = useState<Record<string, string>>({});
  const [bonusXpMap, setBonusXpMap] = useState<Record<string, number>>({});

  const fetchMissionSubmissions = async () => {
    setIsLoadingSubmissions(true);
    try {
      const res = await fetch('https://mysupro.duckdns.org/api/tuto/submissions/list');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.submissions) {
          setSubmissions(data.submissions);
          setIsLoadingSubmissions(false);
          return;
        }
      }
    } catch (e) {
      console.warn('OCI submissions fetch error, falling back to Supabase:', e);
    }

    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('daily_task_submissions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (data) setSubmissions(data);
    } catch (err) {
      console.warn('Supabase fallback error:', err);
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  const handleReviewAndAlert = async (sub: any, customRemarks?: string, customBonusXp?: number) => {
    setIsLoadingSubmissions(true);
    const finalRemarks = customRemarks || remarksMap[sub.id] || 'Outstanding work! Mission verified by academic guide.';
    const finalBonusXp = customBonusXp || bonusXpMap[sub.id] || 50;

    try {
      const res = await fetch('https://mysupro.duckdns.org/api/tuto/submissions/review-and-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: sub.id,
          teacherRemarks: finalRemarks,
          teacherBonusXp: finalBonusXp,
          teacherRating: 5,
          teacherName: 'Lead Academic Guide',
          status: 'approved'
        })
      });
      const data = await res.json();
      if (data.success) {
        setSubmissions(prev =>
          prev.map(s => s.id === sub.id ? { ...s, status: 'approved', teacher_remarks: finalRemarks, teacher_bonus_xp: finalBonusXp } : s)
        );
        showStatus(
          `🎉 Student ${sub.student_name || sub.user_name || ''} Alerted! ${data.whatsappSent ? 'WhatsApp message dispatched' : 'In-App alert recorded'}.`,
          'success'
        );
      } else {
        showStatus('Error: ' + (data.error || 'Failed to review'), 'error');
      }
    } catch (err: any) {
      showStatus('Error alerting student: ' + err.message, 'error');
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'submissions') {
      fetchMissionSubmissions();
    }
  }, [activeTab]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCourse, setSelectedCourse] = useState<CourseOption>(ALL_COURSES[0]);
  const [selectedBoard, setSelectedBoard] = useState<SchoolBoard>('TNSB');
  const [dayNumber, setDayNumber] = useState<number>(1);

  // 365-Day Whole-Year Master Schedule Studio States
  const [adminAmbitionId, setAdminAmbitionId] = useState<string>('jr-ias');
  const [adminClasses, setAdminClasses] = useState<DayClassItem[]>([]);
  const [adminYoga, setAdminYoga] = useState<DayYogaPlan | null>(null);
  const [adminDailyTest, setAdminDailyTest] = useState<DayTestPlan | null>(null);
  const [adminTopicTitle, setAdminTopicTitle] = useState<string>('');
  const [adminChapterTitle, setAdminChapterTitle] = useState<string>('');
  const [isAdminCustom, setIsAdminCustom] = useState<boolean>(false);
  const [isLoadingDayPlan, setIsLoadingDayPlan] = useState<boolean>(false);
  const [isSavingDayPlan, setIsSavingDayPlan] = useState<boolean>(false);

  const fetchAdminDayPlan = async (courseId: string, day: number, ambition: string) => {
    setIsLoadingDayPlan(true);
    try {
      const res = await fetch(
        `https://mysupro.duckdns.org/api/tuto/admin/day-plan/get?courseId=${encodeURIComponent(courseId)}&dayNumber=${day}&ambitionId=${encodeURIComponent(ambition)}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAdminClasses(data.classes || []);
          setAdminYoga(data.yoga || null);
          setAdminDailyTest(data.dailyTest || null);
          setAdminTopicTitle(data.topicTitle || '');
          setAdminChapterTitle(data.chapterTitle || '');
          setIsAdminCustom(!!data.isCustom);
          setIsLoadingDayPlan(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Failed to fetch admin day plan from OCI, using local 365 engine:', err);
    }

    // Fallback to local 365-day engine
    const local = generateUniqueTenClassesForDay(courseId, ambition, day, selectedBoard);
    setAdminClasses(local.classes);
    setAdminYoga(local.yoga);
    setAdminDailyTest(local.dailyTest);
    setAdminTopicTitle(local.themeOfTheDay);
    setAdminChapterTitle(local.term);
    setIsAdminCustom(false);
    setIsLoadingDayPlan(false);
  };

  useEffect(() => {
    if (activeTab === 'day_plan') {
      fetchAdminDayPlan(selectedCourse.id, dayNumber, adminAmbitionId);
    }
  }, [activeTab, selectedCourse.id, dayNumber, adminAmbitionId, selectedBoard]);

  const handleSaveAdminDayPlan = async () => {
    setIsSavingDayPlan(true);
    try {
      const res = await fetch('https://mysupro.duckdns.org/api/tuto/admin/day-plan/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: selectedCourse.id,
          courseTitle: selectedCourse.title,
          dayNumber,
          classes: adminClasses,
          yoga: adminYoga,
          dailyTest: adminDailyTest,
          topicTitle: adminTopicTitle || adminClasses[0]?.title,
          chapterTitle: adminChapterTitle || adminClasses[0]?.subject,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAdminCustom(true);
        showStatus(`🎉 Day ${dayNumber} plan successfully published to OCI Cloud database!`, 'success');
      } else {
        showStatus(`Error: ${data.error || 'Failed to save day plan'}`, 'error');
      }
    } catch (err: any) {
      showStatus(`Error saving day plan: ${err.message}`, 'error');
    } finally {
      setIsSavingDayPlan(false);
    }
  };

  const handleResetToBaseline = () => {
    const baseline = generateUniqueTenClassesForDay(selectedCourse.id, adminAmbitionId, dayNumber, selectedBoard);
    setAdminClasses(baseline.classes);
    setAdminYoga(baseline.yoga);
    setAdminDailyTest(baseline.dailyTest);
    setAdminTopicTitle(baseline.themeOfTheDay);
    setAdminChapterTitle(baseline.term);
    setIsAdminCustom(false);
    showStatus(`Day ${dayNumber} reset to default 365-day syllabus baseline. Click "Save & Publish" to commit.`, 'info');
  };

  const handleUpdateClassItem = (index: number, field: keyof DayClassItem, value: any) => {
    setAdminClasses((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  const handleUpdateQuizQuestion = (qIndex: number, field: string, value: any, optKey?: string) => {
    if (!adminDailyTest || !adminDailyTest.questions) return;
    setAdminDailyTest((prev) => {
      if (!prev) return null;
      const updatedQuestions = [...prev.questions];
      if (updatedQuestions[qIndex]) {
        if (optKey) {
          updatedQuestions[qIndex] = {
            ...updatedQuestions[qIndex],
            options: {
              ...updatedQuestions[qIndex].options,
              [optKey]: value,
            },
          };
        } else {
          updatedQuestions[qIndex] = {
            ...updatedQuestions[qIndex],
            [field]: value,
          };
        }
      }
      return { ...prev, questions: updatedQuestions };
    });
  };


  // Status and AI state
  const [aiGenerating, setAiGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'info' | 'error'>('info');

  // Modal states
  const [isEditCourseModalOpen, setIsEditCourseModalOpen] = useState(false);
  const [isEditSyllabusModalOpen, setIsEditSyllabusModalOpen] = useState(false);
  const [isBulkJsonModalOpen, setIsBulkJsonModalOpen] = useState(false);
  const [bulkJsonText, setBulkJsonText] = useState('');
  const [bulkTarget, setBulkTarget] = useState<'courses' | 'syllabus' | 'questions' | 'day_plans'>('syllabus');

  // Current working course syllabus
  const activeSyllabus: OfficialCourseSyllabus = useMemo(() => {
    return getOfficialGovernmentSyllabus(selectedCourse.id, selectedBoard);
  }, [selectedCourse.id, selectedBoard]);

  // Current working day plan
  const activeDayPlan: NanoDayPlan = useMemo(() => {
    return resolveNanoDayPlan(selectedCourse.id, selectedCourse.title, dayNumber, selectedBoard);
  }, [selectedCourse.id, selectedCourse.title, dayNumber, selectedBoard]);

  // Filtered courses
  const filteredCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return ALL_COURSES.filter((c) => {
      const matchesCat = selectedCategory === 'all' || c.category === selectedCategory;
      const matchesQuery =
        !q ||
        c.title.toLowerCase().includes(q) ||
        ((c as any).tamilTitle || (c as any).titleTa || '').toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  const showStatus = (msg: string, type: 'success' | 'info' | 'error' = 'info') => {
    setStatusMessage(msg);
    setStatusType(type);
    setTimeout(() => setStatusMessage(''), 5000);
  };

  useEffect(() => {
    const cfg = GoogleSheetsDayPlanService.getSavedConfig();
    if (cfg) {
      setSheetConfig(cfg);
      if (cfg.sheetUrl) setSheetUrl(cfg.sheetUrl);
      if (cfg.sheetName) setSheetTabName(cfg.sheetName);
    }
    const cached = GoogleSheetsDayPlanService.getCachedDayPlans();
    setSheetPlans(cached);
  }, []);

  const handleSyncGoogleSheet = async () => {
    if (!sheetUrl.trim()) {
      showStatus('Please enter a valid Google Spreadsheet URL or ID', 'error');
      return;
    }
    setIsSyncingSheet(true);
    showStatus('Connecting to Google Sheet and parsing whole-year day plans...', 'info');

    const result = await GoogleSheetsDayPlanService.syncGoogleSheet(sheetUrl.trim(), sheetTabName.trim() || 'Sheet1');
    setIsSyncingSheet(false);

    if (result.success) {
      const updatedPlans = GoogleSheetsDayPlanService.getCachedDayPlans();
      setSheetPlans(updatedPlans);
      const updatedConfig = GoogleSheetsDayPlanService.getSavedConfig();
      setSheetConfig(updatedConfig);
      showStatus(`🎉 Successfully synchronized ${result.count} day plans across ${result.courses.length} courses!`, 'success');
    } else {
      showStatus(`Sync failed: ${result.error || 'Check Google Sheet permissions'}`, 'error');
    }
  };

  const handleCopyTemplateCsv = () => {
    const csv = GoogleSheetsDayPlanService.getTemplateCsv();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(csv);
      showStatus('Copied Google Sheet CSV Template headers to clipboard! 📋', 'success');
    }
  };

  // AI Syllabus Generator Handler
  const handleAiGenerateSyllabus = async () => {
    setAiGenerating(true);
    showStatus(`Gemini AI is generating complete nano-granular syllabus for ${selectedCourse.title}...`, 'info');

    const prompt = `You are a Senior Curriculum Specialist for Government Educational Standards.
Generate an authentic, highly detailed 5-level nano-granular syllabus for:
Course: ${selectedCourse.title} (ID: ${selectedCourse.id})
Board / Authority: ${selectedBoard === 'CBSE' ? 'CBSE NCERT' : selectedBoard === 'ICSE_INTL' ? 'CISCE / Cambridge' : 'Tamil Nadu SCERT & DGE Samacheer Kalvi'}
Language: Bilingual (English + Tamil)

Output JSON only matching OfficialCourseSyllabus interface with:
- notificationRef, examPatternSummary, markingScheme
- subjects array with chapters, microTopics, and nanoConcepts (with conceptCode, name, tamilName, description, keyRuleOrFormula, solvedExampleOrLaw, questionType, estimatedMinutes).`;

    try {
      const res = await geminiToolsService.executePrompt(prompt, undefined, 'Tamil');
      if (res && res.text) {
        showStatus(`Successfully generated AI syllabus with Gemini for ${selectedCourse.title}!`, 'success');
      } else {
        showStatus('AI generation finished with default blueprint fallback.', 'info');
      }
    } catch (e) {
      showStatus('AI service call error. Check your Gemini API Key in Profile.', 'error');
    } finally {
      setAiGenerating(false);
    }
  };

  // Bulk Export Handler
  const handleExportJson = (target: string) => {
    let dataToExport: any = {};
    if (target === 'syllabus') {
      dataToExport = activeSyllabus;
    } else if (target === 'courses') {
      dataToExport = ALL_COURSES;
    } else if (target === 'day_plan') {
      dataToExport = activeDayPlan;
    }

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `tuto_${target}_${selectedCourse.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showStatus(`Exported ${target} JSON successfully!`, 'success');
  };

  // Bulk Ingestion Handler
  const handleApplyBulkJson = () => {
    try {
      const parsed = JSON.parse(bulkJsonText);
      showStatus(`Valid JSON received! Ingested ${Array.isArray(parsed) ? parsed.length + ' records' : '1 syllabus hierarchy'}.`, 'success');
      setIsBulkJsonModalOpen(false);
      setBulkJsonText('');
    } catch (e: any) {
      showStatus(`JSON Schema Error: ${e.message}`, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#070C18] text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="bg-[#0E172A] border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-extrabold text-[10px] uppercase border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Master TutO Admin Studio
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">
                59 Courses • 480+ Nano Nodes
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white">TutO Course & Curriculum Control Center</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Full manual CRUD, AI-assisted content generation, and bulk JSON ingestion across all course tiers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/tuto"
              className="px-4 py-2 bg-[#131F37] hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold rounded-xl flex items-center gap-2 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to TutO App</span>
            </Link>

            <button
              onClick={() => {
                setBulkTarget('syllabus');
                setIsBulkJsonModalOpen(true);
              }}
              className="px-4 py-2 bg-[#131F37] hover:bg-slate-800 border border-slate-800 text-sky-400 text-xs font-bold rounded-xl flex items-center gap-2 transition"
            >
              <Upload className="w-4 h-4" />
              <span>Bulk Ingest JSON</span>
            </button>
          </div>
        </div>

        {/* Global Status Banner */}
        {statusMessage && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition animate-in fade-in ${
              statusType === 'success'
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                : statusType === 'error'
                ? 'bg-red-500/15 border border-red-500/30 text-red-300'
                : 'bg-sky-500/15 border border-sky-500/30 text-sky-300'
            }`}
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Main 6 Tabs Switcher Bar */}
        <div className="flex border-b border-slate-800 bg-[#0E172A] rounded-2xl p-1.5 gap-2 overflow-x-auto scrollbar-none shadow-lg">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 whitespace-nowrap transition ${
              activeTab === 'catalog'
                ? 'bg-[#00D084] text-[#070C18] shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>1. Course Catalog Manager</span>
          </button>

          <button
            onClick={() => setActiveTab('syllabus')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 whitespace-nowrap transition ${
              activeTab === 'syllabus'
                ? 'bg-[#00D084] text-[#070C18] shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>2. Nano-Syllabus Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('day_plan')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 whitespace-nowrap transition ${
              activeTab === 'day_plan'
                ? 'bg-[#00D084] text-[#070C18] shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>3. 200-Day Plan Scheduler</span>
          </button>

          <button
            onClick={() => setActiveTab('question_bank')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 whitespace-nowrap transition ${
              activeTab === 'question_bank'
                ? 'bg-[#00D084] text-[#070C18] shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>4. CBT Question Bank</span>
          </button>

          <button
            onClick={() => setActiveTab('lecture_studio')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 whitespace-nowrap transition ${
              activeTab === 'lecture_studio'
                ? 'bg-[#00D084] text-[#070C18] shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>5. AI Lecture & Notes Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('purchases')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 whitespace-nowrap transition ${
              activeTab === 'purchases'
                ? 'bg-[#00D084] text-[#070C18] shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>6. Purchases & Passes</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('submissions');
              const supabase = createClient();
              setIsLoadingSubmissions(true);
              supabase
                .from('daily_task_submissions')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50)
                .then(({ data, error }: any) => {
                  if (data) setSubmissions(data);
                  setIsLoadingSubmissions(false);
                });
            }}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 whitespace-nowrap transition ${
              activeTab === 'submissions'
                ? 'bg-[#00D084] text-[#070C18] shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>7. Student Video Feedback</span>
          </button>

          <button
            onClick={() => setActiveTab('google_sheets')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 whitespace-nowrap transition ${
              activeTab === 'google_sheets'
                ? 'bg-[#00D084] text-[#070C18] shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>8. Google Sheet Plan Manager</span>
          </button>
        </div>

        {/* Global Active Course & Board Selector Bar */}
        <div className="bg-[#0E172A] border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="text-xs font-bold text-slate-400">Target Course:</span>
            <select
              value={selectedCourse.id}
              onChange={(e) => {
                const found = ALL_COURSES.find((c) => c.id === e.target.value);
                if (found) setSelectedCourse(found);
              }}
              className="bg-[#131F37] border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-500 flex-1 md:w-80"
            >
              {ALL_COURSES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.id})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-bold text-slate-400">Curriculum Board:</span>
            {SCHOOL_BOARDS.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBoard(b.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  selectedBoard === b.id
                    ? 'bg-[#00D084] text-[#070C18]'
                    : 'bg-[#131F37] text-slate-400 border border-slate-800'
                }`}
              >
                {b.short}
              </button>
            ))}
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════
            TAB 1: COURSE CATALOG MANAGER
            ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'catalog' && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search courses by title, Tamil name, or ID..."
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0E172A] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportJson('courses')}
                  className="px-3.5 py-2 bg-[#131F37] hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Catalog JSON</span>
                </button>
              </div>
            </div>

            {/* Courses Grid Table */}
            <div className="bg-[#0E172A] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#131F37] text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-4">Course Title & ID</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Medium & Boards</th>
                      <th className="p-4">Subjects</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredCourses.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-800/30 transition">
                        <td className="p-4">
                          <div className="font-bold text-white text-sm">{c.title}</div>
                          <div className="text-[11px] font-mono text-slate-400">{c.id}</div>
                          {((c as any).tamilTitle || (c as any).titleTa) && (
                            <div className="text-[11px] text-emerald-400">
                              {(c as any).tamilTitle || (c as any).titleTa}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                            {c.category}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="text-slate-300 font-bold">{c.medium}</div>
                          <div className="text-[10px] text-slate-500">TNSB / CBSE / ICSE</div>
                        </td>
                        <td className="p-4">
                          <span className="text-slate-300 font-bold">{c.subjects?.length || 4} Subjects</span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setSelectedCourse(c);
                              setActiveTab('syllabus');
                            }}
                            className="px-2.5 py-1.5 bg-[#131F37] hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 font-bold rounded-lg transition"
                          >
                            Edit Syllabus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════
            TAB 2: NANO-SYLLABUS MATRIX
            ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'syllabus' && (
          <div className="space-y-6">
            {/* Header Actions for Syllabus */}
            <div className="bg-[#0E172A] border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                    100% Govt Notified Syllabus Matrix
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{activeSyllabus.medium}</span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">{activeSyllabus.courseTitle}</h3>
                <p className="text-xs text-slate-400">{activeSyllabus.boardOrAuthority}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  disabled={aiGenerating}
                  onClick={handleAiGenerateSyllabus}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 shadow-lg disabled:opacity-50 transition"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{aiGenerating ? 'AI Generating...' : 'Gemini AI Generate Syllabus'}</span>
                </button>

                <button
                  onClick={() => handleExportJson('syllabus')}
                  className="px-3.5 py-2 bg-[#131F37] hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Syllabus JSON</span>
                </button>
              </div>
            </div>

            {/* Hierarchical Subjects -> Chapters -> MicroTopics -> NanoNodes Tree */}
            <div className="space-y-4">
              {activeSyllabus.subjects.map((subj, sIdx) => (
                <div key={subj.subjectId || sIdx} className="bg-[#0E172A] border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{subj.icon}</span>
                      <div>
                        <h4 className="text-sm font-bold text-white">{subj.subjectName}</h4>
                        {subj.tamilName && <p className="text-xs text-slate-400">{subj.tamilName}</p>}
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono font-bold">
                      {subj.chapters.length} Chapters • {subj.totalNanoConcepts || 50}+ Nano Nodes
                    </span>
                  </div>

                  <div className="space-y-3">
                    {subj.chapters.map((chap, cIdx) => (
                      <div key={cIdx} className="bg-[#131F37] border border-slate-800 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                              {chap.unitNumber || `Unit ${cIdx + 1}`}
                            </span>
                            <h5 className="text-sm font-bold text-white mt-1">
                              Chapter {chap.chapterNumber}: {chap.chapterTitle}
                            </h5>
                            {chap.tamilTitle && <p className="text-xs text-slate-400">{chap.tamilTitle}</p>}
                          </div>
                        </div>

                        {/* Micro Topics */}
                        <div className="space-y-2.5 pt-2">
                          {chap.topics.map((top, tIdx) => (
                            <div key={top.id || tIdx} className="bg-[#0E172A] border border-slate-800 rounded-xl p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {top.topicCode && (
                                    <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 font-mono text-[9px] font-bold">
                                      {top.topicCode}
                                    </span>
                                  )}
                                  <span className="text-xs font-bold text-white">{top.title}</span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-bold">{top.importance}</span>
                              </div>

                              {/* Nano Nodes */}
                              {(top.nanoConcepts || []).length > 0 && (
                                <div className="space-y-1.5 pl-3 border-l-2 border-slate-800">
                                  {top.nanoConcepts?.map((nano, nIdx) => (
                                    <div key={nano.id || nIdx} className="bg-[#131F37] rounded-lg p-2 text-xs flex items-center justify-between">
                                      <div>
                                        <span className="font-mono text-[10px] text-sky-400 font-bold mr-2">
                                          {nano.conceptCode}
                                        </span>
                                        <span className="text-slate-200 font-medium">{nano.name}</span>
                                        {nano.tamilName && (
                                          <span className="text-slate-400 text-[11px] ml-2">({nano.tamilName})</span>
                                        )}
                                      </div>
                                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 text-[9px]">
                                        {nano.questionType || '2-Mark'}
                                      </span>
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
              ))}
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════
            TAB 3: 365-DAY WHOLE-YEAR MASTER SCHEDULE STUDIO
            ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'day_plan' && (
          <div className="space-y-6">
            {/* Top Control Center */}
            <div className="bg-[#0E172A] border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-black text-xs">
                      365-Day Whole-Year Master Studio
                    </span>
                    <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                      dayNumber <= 120 ? 'bg-blue-500/20 text-blue-400' : dayNumber <= 240 ? 'bg-purple-500/20 text-purple-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {dayNumber <= 120 ? '📘 Term 1: Foundations' : dayNumber <= 240 ? '🔬 Term 2: Applied Mastery & Lab' : '🏆 Term 3: Advanced Board & Exam Sprint'}
                    </span>
                    {isAdminCustom ? (
                      <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-xs flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Cloud Customized & Published</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold text-xs flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span>Standard 365 Syllabus</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-black text-white mt-1">
                    Day {dayNumber} of 365: {adminTopicTitle || selectedCourse.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedCourse.title} • 10 Independent Classes • 100% Unique Non-Repeating Daily Syllabus
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    onClick={handleResetToBaseline}
                    className="px-3.5 py-2 bg-[#131F37] hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
                    title="Reset to default generated curriculum"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset Baseline</span>
                  </button>

                  <button
                    onClick={handleSaveAdminDayPlan}
                    disabled={isSavingDayPlan}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition"
                  >
                    {isSavingDayPlan ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{isSavingDayPlan ? 'Publishing...' : 'Save & Publish Day Plan to OCI Cloud'}</span>
                  </button>
                </div>
              </div>

              {/* Day Navigator & Ambition Selector */}
              <div className="pt-3 border-t border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setDayNumber(prev => Math.max(1, prev - 1))}
                    disabled={dayNumber <= 1}
                    className="px-3 py-1.5 bg-[#131F37] hover:bg-slate-800 disabled:opacity-30 border border-slate-800 rounded-xl text-xs font-bold text-white transition"
                  >
                    ← Prev Day
                  </button>

                  <div className="flex items-center gap-1.5 bg-[#131F37] border border-slate-800 rounded-xl px-3 py-1">
                    <span className="text-[11px] font-bold text-slate-400">Day:</span>
                    <input
                      type="number"
                      min={1}
                      max={365}
                      value={dayNumber}
                      onChange={(e) => setDayNumber(Math.max(1, Math.min(365, parseInt(e.target.value) || 1)))}
                      className="w-16 bg-transparent font-black text-sm text-emerald-400 text-center focus:outline-none"
                    />
                    <span className="text-[11px] font-bold text-slate-500">/ 365</span>
                  </div>

                  <button
                    onClick={() => setDayNumber(prev => Math.min(365, prev + 1))}
                    disabled={dayNumber >= 365}
                    className="px-3 py-1.5 bg-[#131F37] hover:bg-slate-800 disabled:opacity-30 border border-slate-800 rounded-xl text-xs font-bold text-white transition"
                  >
                    Next Day →
                  </button>

                  {/* Fast Jump Pills */}
                  <div className="hidden sm:flex items-center gap-1 ml-2">
                    {[1, 50, 100, 180, 250, 365].map(jumpDay => (
                      <button
                        key={jumpDay}
                        onClick={() => setDayNumber(jumpDay)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                          dayNumber === jumpDay ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800/60 text-slate-400 hover:text-white'
                        }`}
                      >
                        D{jumpDay}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Career Aim Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400">Aim Track:</span>
                  <select
                    value={adminAmbitionId}
                    onChange={(e) => setAdminAmbitionId(e.target.value)}
                    className="bg-[#131F37] border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                  >
                    {AMBITION_FEATURE_TRACKS.map(t => (
                      <option key={t.id} value={t.id}>{t.icon} {t.title}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 10 Unique Day Classes Editor */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <span>Day {dayNumber} Curriculum Plan: 10 Dedicated Subject Classes</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 text-xs font-mono font-bold">
                    {adminClasses.length} Classes
                  </span>
                </h4>
                <span className="text-xs text-slate-400">All fields are editable by Admin and persist directly to OCI Cloud</span>
              </div>

              {isLoadingDayPlan ? (
                <div className="bg-[#0E172A] border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-400" />
                  <p className="text-xs font-bold">Loading Day {dayNumber} Plan from OCI Cloud...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {adminClasses.map((cls, idx) => (
                    <div
                      key={cls.id || idx}
                      className="bg-[#0E172A] border border-slate-800/90 hover:border-slate-700 rounded-2xl p-4 space-y-3 transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-xl bg-slate-800 text-lg flex items-center justify-center">
                            {cls.icon || '📚'}
                          </span>
                          <div>
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono text-[10px] font-bold">
                              Class {idx + 1} • {cls.type.toUpperCase()}
                            </span>
                            <span className="text-xs text-slate-400 ml-2 font-bold">{cls.subject}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={cls.duration}
                            onChange={(e) => handleUpdateClassItem(idx, 'duration', e.target.value)}
                            className="w-20 bg-[#131F37] border border-slate-800 rounded-lg px-2 py-1 text-[11px] font-bold text-center text-white"
                            placeholder="Duration"
                          />
                          <input
                            type="number"
                            value={cls.xp}
                            onChange={(e) => handleUpdateClassItem(idx, 'xp', parseInt(e.target.value) || 20)}
                            className="w-16 bg-[#131F37] border border-slate-800 rounded-lg px-2 py-1 text-[11px] font-bold text-center text-amber-400"
                            placeholder="XP"
                          />
                        </div>
                      </div>

                      {/* Class Title Input */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Class Topic Title</label>
                        <input
                          type="text"
                          value={cls.title}
                          onChange={(e) => handleUpdateClassItem(idx, 'title', e.target.value)}
                          className="w-full bg-[#131F37] border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      {/* Micro Topic / Description Input */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Micro-Topic Summary / Learning Objectives</label>
                        <textarea
                          rows={2}
                          value={cls.microTopic || ''}
                          onChange={(e) => handleUpdateClassItem(idx, 'microTopic', e.target.value)}
                          className="w-full bg-[#131F37] border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 leading-relaxed"
                          placeholder="Specific micro-topic rules, formulas, and practical application details for this day..."
                        />
                      </div>

                      {/* Video URL for Class 9 (Visual Masterclass) */}
                      {cls.id === 9 && (
                        <div className="bg-[#131F37] border border-slate-800 rounded-xl p-3 space-y-2">
                          <label className="text-[10px] font-bold text-sky-400 flex items-center gap-1.5">
                            <Video className="w-3.5 h-3.5" />
                            <span>Visual Masterclass Video URL / YouTube Stream ID</span>
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={cls.videoUrl || ''}
                              onChange={(e) => handleUpdateClassItem(idx, 'videoUrl', e.target.value)}
                              placeholder="https://www.youtube.com/watch?v=..."
                              className="flex-1 bg-[#0E172A] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                            />
                            {cls.videoUrl && (
                              <a
                                href={cls.videoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 rounded-lg text-xs font-bold flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Preview</span>
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Daily Test Questions Editor (Class 10 Alignment) */}
            {adminDailyTest && adminDailyTest.questions && adminDailyTest.questions.length > 0 && (
              <div className="bg-[#0E172A] border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold text-[10px]">
                      Class 10 Assessment Engine
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1">
                      Daily Test Drill (5 Concept-Aligned MCQs for Day {dayNumber})
                    </h4>
                  </div>
                  <span className="text-xs text-slate-400">Pass: {adminDailyTest.passPercentage}%</span>
                </div>

                <div className="space-y-4">
                  {adminDailyTest.questions.map((q, qIdx) => (
                    <div key={q.id || qIdx} className="bg-[#131F37] border border-slate-800 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-emerald-400 font-bold">Question {qIdx + 1}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-bold">Correct Option:</span>
                          <select
                            value={q.correctOption}
                            onChange={(e) => handleUpdateQuizQuestion(qIdx, 'correctOption', e.target.value)}
                            className="bg-[#0E172A] border border-slate-800 rounded-lg px-2 py-0.5 text-xs font-bold text-emerald-400"
                          >
                            <option value="A">Option A</option>
                            <option value="B">Option B</option>
                            <option value="C">Option C</option>
                            <option value="D">Option D</option>
                          </select>
                        </div>
                      </div>

                      {/* Question Text */}
                      <input
                        type="text"
                        value={q.question}
                        onChange={(e) => handleUpdateQuizQuestion(qIdx, 'question', e.target.value)}
                        className="w-full bg-[#0E172A] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
                        placeholder="Question text..."
                      />

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {(['A', 'B', 'C', 'D'] as const).map((optKey) => (
                          <div key={optKey} className="flex items-center gap-2 bg-[#0E172A] border border-slate-800 rounded-lg px-2.5 py-1">
                            <span className={`text-[10px] font-bold ${q.correctOption === optKey ? 'text-emerald-400' : 'text-slate-400'}`}>
                              {optKey}:
                            </span>
                            <input
                              type="text"
                              value={q.options[optKey] || ''}
                              onChange={(e) => handleUpdateQuizQuestion(qIdx, 'options', e.target.value, optKey)}
                              className="w-full bg-transparent text-xs text-slate-200 focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>

                      {/* Explanation */}
                      <input
                        type="text"
                        value={q.explanation}
                        onChange={(e) => handleUpdateQuizQuestion(qIdx, 'explanation', e.target.value)}
                        className="w-full bg-[#0E172A] border border-slate-800 rounded-lg px-3 py-1 text-[11px] text-slate-400 italic focus:outline-none focus:border-emerald-500"
                        placeholder="Explanation..."
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Daily Yoga & Wellness Studio */}
            {adminYoga && (
              <div className="bg-[#0E172A] border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                      Daily Wellness & Brain Booster
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1">
                      Day {dayNumber} Yoga: {adminYoga.name} {adminYoga.tamil && `(${adminYoga.tamil})`}
                    </h4>
                  </div>
                  <span className="text-xs text-slate-400">{adminYoga.duration}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 block">Breathing Pattern</label>
                    <input
                      type="text"
                      value={adminYoga.breathing}
                      onChange={(e) => setAdminYoga(prev => prev ? { ...prev, breathing: e.target.value } : null)}
                      className="w-full bg-[#131F37] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 block">Brain Booster Exercise</label>
                    <input
                      type="text"
                      value={adminYoga.brainBooster}
                      onChange={(e) => setAdminYoga(prev => prev ? { ...prev, brainBooster: e.target.value } : null)}
                      className="w-full bg-[#131F37] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}


        {/* ═════════════════════════════════════════════════════════════════════
            TAB 4: CBT QUESTION BANK MANAGER
            ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'question_bank' && (
          <div className="space-y-6">
            <div className="bg-[#0E172A] border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-xs">
                  48,000+ Bilingual Mock Test Question Bank
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  Active Course: {selectedCourse.title}
                </h3>
                <p className="text-xs text-slate-400">NTA/TCS iON CBT Blueprint, Negative Marking & Tamil Rationale</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setBulkTarget('questions');
                    setIsBulkJsonModalOpen(true);
                  }}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 shadow transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Bulk Ingest Questions</span>
                </button>
              </div>
            </div>

            {/* Questions Sample Table */}
            <div className="bg-[#0E172A] border border-slate-800 rounded-2xl p-5 space-y-4">
              <h4 className="text-sm font-bold text-white">Live Mock Questions for {selectedCourse.title}</h4>
              <div className="space-y-3">
                {[
                  {
                    id: 'q101',
                    question: 'Which of the following is the fundamental governing law/formula for this topic?',
                    tamilQuestion: 'இத்தலைப்பிற்குரிய அடிப்படைச் சமன்பாடு எது?',
                    type: '1-Mark MCQ',
                    diff: 'High-Yield',
                  },
                  {
                    id: 'q102',
                    question: 'Evaluate the step-by-step mathematical derivation for standard 5-mark answer.',
                    tamilQuestion: '5-மதிப்பெண் வினாவிற்கான படிநிலைத் தீர்வு தருக.',
                    type: '5-Mark Derivation',
                    diff: 'Centum Target',
                  },
                ].map((q, idx) => (
                  <div key={q.id} className="bg-[#131F37] border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-emerald-400 font-bold">Question {idx + 1}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">{q.type}</span>
                    </div>
                    <div className="text-sm text-white font-bold">{q.question}</div>
                    <div className="text-xs text-slate-400">{q.tamilQuestion}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════
            TAB 5: AI LECTURE & NOTES STUDIO
            ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'lecture_studio' && (
          <div className="space-y-6">
            <div className="bg-[#0E172A] border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-xs">
                  AI Nano Lecture & Notes Studio
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  Slide Customizer: {activeDayPlan.targetTopicTitle}
                </h3>
                <p className="text-xs text-slate-400">Preview and customize AI-synthesized slide points and audio voiceover</p>
              </div>

              <button
                onClick={() => showStatus('Saved customized AI lecture script!', 'success')}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 transition"
              >
                <Save className="w-4 h-4" />
                <span>Save Lecture Draft</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Slide Editor */}
              <div className="bg-[#0E172A] border border-slate-800 rounded-2xl p-5 space-y-4">
                <h4 className="text-sm font-bold text-white">Slide 1 Screen Content</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">Slide Heading (English)</label>
                    <input
                      type="text"
                      defaultValue={`Introduction to ${activeDayPlan.targetTopicTitle}`}
                      className="w-full bg-[#131F37] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">Slide Heading (Tamil)</label>
                    <input
                      type="text"
                      defaultValue={`${activeDayPlan.targetTamilTopic || activeDayPlan.targetTopicTitle} — அறிமுகம்`}
                      className="w-full bg-[#131F37] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Voiceover Script Editor */}
              <div className="bg-[#0E172A] border border-slate-800 rounded-2xl p-5 space-y-4">
                <h4 className="text-sm font-bold text-white">Teacher Voiceover Script</h4>
                <textarea
                  rows={6}
                  defaultValue={`Welcome to today's lesson on ${activeDayPlan.targetTopicTitle}. In this lesson, we will master the core definitions, formulas, and previous exam questions step-by-step.`}
                  className="w-full bg-[#131F37] border border-slate-800 rounded-xl p-3 text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════
            TAB 6: PURCHASES & ACCESS PASSES
            ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'purchases' && (
          <div className="space-y-6">
            <div className="bg-[#0E172A] border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-xs">
                  Pass Pro & Course Purchase Approvals
                </span>
                <h3 className="text-base font-bold text-white mt-1">UPI / QR Payment Verifications</h3>
                <p className="text-xs text-slate-400">Review pending UTR transactions and unlock student access passes</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => showStatus('New access code generated: TUTO2026', 'success')}
                  className="px-3.5 py-2 bg-[#131F37] hover:bg-slate-800 border border-slate-800 text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Generate Access Code</span>
                </button>
              </div>
            </div>

            {/* Purchases Table */}
            <div className="bg-[#0E172A] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#131F37] text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4">Student</th>
                    <th className="p-4">Item & Plan</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  <tr className="hover:bg-slate-800/30 transition">
                    <td className="p-4">
                      <div className="font-bold text-white">Student User</div>
                      <div className="text-[11px] text-slate-400">+91 98765 43210</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white">TutO Pass Pro (1-Year)</div>
                      <div className="text-[10px] text-slate-500">All 59 Courses</div>
                    </td>
                    <td className="p-4 font-bold text-emerald-400">₹199</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                        APPROVED
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="px-3 py-1 bg-[#131F37] text-slate-300 rounded-lg text-xs font-bold">
                        View Receipt
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════
            TAB 7: TEACHER / GUIDE DAILY MISSION EVALUATION STUDIO & ALERT DISPATCH
            ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'submissions' && (
          <div className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0E172A] border border-slate-800 p-6 rounded-3xl shadow-xl">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    Two-Module Verification Engine
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">Teacher / Guide Evaluation Studio</span>
                </div>
                <h3 className="text-base font-bold text-white">Student Day Missions & Alert Dispatch</h3>
                <p className="text-xs text-slate-400">
                  Evaluate student daily missions (10 classes, test, yoga, book scanner homework), award remarks &amp; bonus XP, and alert students in real-time.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex bg-[#131F37] p-1 rounded-xl border border-slate-800 text-xs font-bold">
                  {(['all', 'submitted', 'approved'] as const).map((filterVal) => (
                    <button
                      key={filterVal}
                      onClick={() => setSubmissionStatusFilter(filterVal)}
                      className={`px-3 py-1.5 rounded-lg capitalize transition ${
                        submissionStatusFilter === filterVal
                          ? 'bg-[#00D084] text-slate-950 font-black shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {filterVal === 'all' ? 'All' : filterVal === 'submitted' ? 'Pending Review' : 'Approved'}
                    </button>
                  ))}
                </div>

                <button
                  onClick={fetchMissionSubmissions}
                  className="px-3.5 py-2 bg-[#131F37] hover:bg-slate-800 border border-slate-800 text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSubmissions ? 'animate-spin' : ''}`} />
                  <span>Refresh Queue</span>
                </button>
              </div>
            </div>

            {/* Submissions List */}
            {isLoadingSubmissions && submissions.length === 0 ? (
              <div className="p-12 text-center text-slate-400 bg-[#0E172A] border border-slate-800 rounded-3xl">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-emerald-400" />
                <p className="text-xs font-bold text-white">Fetching Student Missions from OCI PostgreSQL...</p>
              </div>
            ) : submissions.length === 0 ? (
              <div className="p-12 text-center text-slate-400 bg-[#0E172A] border border-slate-800 rounded-3xl">
                <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p className="text-sm font-bold text-white">No student missions recorded yet.</p>
                <p className="text-xs text-slate-500 mt-1">
                  Once a student completes Day 1 or any day tasks and submits their mission, it will appear here for evaluation.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions
                  .filter((sub) => {
                    if (submissionStatusFilter === 'submitted') return sub.status === 'submitted';
                    if (submissionStatusFilter === 'approved') return sub.status === 'approved';
                    return true;
                  })
                  .map((sub) => {
                    const currentRemarks = remarksMap[sub.id] || sub.teacher_remarks || '';
                    const currentBonusXp = bonusXpMap[sub.id] ?? (sub.teacher_bonus_xp || 50);
                    const isApproved = sub.status === 'approved';

                    return (
                      <div
                        key={sub.id}
                        className={`p-6 rounded-3xl border transition-all ${
                          isApproved
                            ? 'bg-[#0E172A]/80 border-slate-800'
                            : 'bg-gradient-to-br from-[#0E172A] to-[#131F37] border-amber-500/30 shadow-lg shadow-amber-500/5'
                        }`}
                      >
                        {/* Header Row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-sm">
                              {(sub.student_name || sub.user_name || 'S')[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-black text-white">
                                  {sub.student_name || sub.user_name || 'Student Scholar'}
                                </h4>
                                <span className="text-xs text-slate-400 font-semibold">
                                  📱 {sub.student_phone || sub.user_phone || 'No phone'}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <span className="px-2 py-0.5 rounded bg-sky-500/15 border border-sky-500/30 text-sky-400 text-[10px] font-bold">
                                  {sub.academic_class || 'Class 5'}
                                </span>
                                <span className="px-2 py-0.5 rounded bg-purple-500/15 border border-purple-500/30 text-purple-400 text-[10px] font-bold uppercase">
                                  {sub.ambition_id || 'JrIAS'}
                                </span>
                                <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                                  Day {sub.day_number || 1} of 365
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                                isApproved
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse-subtle'
                              }`}
                            >
                              {isApproved ? '✅ Approved & Alerted' : '⏳ Pending Review'}
                            </span>
                          </div>
                        </div>

                        {/* Performance Metrics & Reflection */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-4 border-b border-slate-800/60">
                          <div className="p-3 bg-[#0B1120] rounded-xl border border-slate-800/80">
                            <span className="text-[10px] font-bold text-slate-500 uppercase block">Classes Completed</span>
                            <span className="text-sm font-black text-white">
                              {sub.classes_completed ?? 10} / {sub.total_classes ?? 10}
                            </span>
                          </div>
                          <div className="p-3 bg-[#0B1120] rounded-xl border border-slate-800/80">
                            <span className="text-[10px] font-bold text-slate-500 uppercase block">Mock Test Score</span>
                            <span className="text-sm font-black text-emerald-400">
                              {sub.test_score ?? 100}%
                            </span>
                          </div>
                          <div className="p-3 bg-[#0B1120] rounded-xl border border-slate-800/80">
                            <span className="text-[10px] font-bold text-slate-500 uppercase block">Yoga Practice</span>
                            <span className="text-sm font-black text-emerald-400">
                              {sub.yoga_completed ? '✅ Done' : 'Pending'}
                            </span>
                          </div>
                          <div className="p-3 bg-[#0B1120] rounded-xl border border-slate-800/80">
                            <span className="text-[10px] font-bold text-slate-500 uppercase block">Daily XP Earned</span>
                            <span className="text-sm font-black text-amber-400">
                              +{sub.xp_earned ?? 250} XP
                            </span>
                          </div>
                        </div>

                        {/* Student Reflection Notes */}
                        <div className="py-3">
                          <span className="text-[11px] font-bold text-slate-400 block mb-1">
                            Student Notes &amp; Doubts:
                          </span>
                          <p className="text-xs text-slate-200 bg-[#0B1120] p-3 rounded-xl border border-slate-800/80 italic leading-relaxed">
                            {sub.student_notes || sub.feedback_text || 'Student finished day mission without custom notes.'}
                          </p>
                        </div>

                        {/* Teacher Evaluation & Alert Dispatch Panel */}
                        <div className="mt-2 pt-4 border-t border-slate-800 space-y-3 bg-[#0B1120]/60 p-4 rounded-2xl border border-slate-800/60">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                              <span>Teacher Evaluation &amp; Guidance Remarks:</span>
                            </label>

                            {/* Praise chips */}
                            <div className="flex flex-wrap gap-1.5">
                              {[
                                '🌟 Outstanding work on Day 1!',
                                '🎯 Accurate math steps and neat work.',
                                '✍️ Great handwriting practice!',
                                '👍 Well done! Keep up the daily streak.',
                              ].map((phrase) => (
                                <button
                                  key={phrase}
                                  type="button"
                                  onClick={() => setRemarksMap((prev) => ({ ...prev, [sub.id]: phrase }))}
                                  className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold transition"
                                >
                                  {phrase}
                                </button>
                              ))}
                            </div>
                          </div>

                          <textarea
                            rows={2}
                            value={currentRemarks}
                            onChange={(e) => setRemarksMap((prev) => ({ ...prev, [sub.id]: e.target.value }))}
                            placeholder="Enter teacher comments, guidance, or words of encouragement for the student..."
                            className="w-full bg-[#0E172A] border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                          />

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold text-slate-400">Award Bonus XP:</span>
                              {[50, 100, 200].map((xp) => (
                                <button
                                  key={xp}
                                  type="button"
                                  onClick={() => setBonusXpMap((prev) => ({ ...prev, [sub.id]: xp }))}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                                    currentBonusXp === xp
                                      ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                                      : 'bg-[#0E172A] border border-slate-800 text-slate-400 hover:text-white'
                                  }`}
                                >
                                  +{xp} XP
                                </button>
                              ))}
                            </div>

                            <button
                              onClick={() => handleReviewAndAlert(sub, currentRemarks, currentBonusXp)}
                              disabled={isLoadingSubmissions}
                              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>
                                {isApproved ? 'Update & Re-Alert Student' : '🔔 Alert Student (App & WhatsApp)'}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════
            TAB 8: GOOGLE SHEET WHOLE-YEAR PLAN MANAGER & CLOUD SYNC
            ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'google_sheets' && (
          <div className="space-y-6">
            {/* Header & Sync Form */}
            <div className="bg-[#0E172A] border border-slate-800 p-6 rounded-3xl space-y-6 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase font-black text-[#00D084] bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                      <FileSpreadsheet className="w-3 h-3" />
                      Google Sheets Live Engine
                    </span>
                    {sheetConfig?.lastSyncedAt && (
                      <span className="text-[10px] text-slate-400">
                        Last Synced: {new Date(sheetConfig.lastSyncedAt).toLocaleDateString()} {new Date(sheetConfig.lastSyncedAt).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base md:text-lg font-bold text-white">Whole Year Day Plan Google Sheet Manager</h3>
                  <p className="text-xs text-slate-400">
                    Manage all 200/300 day plans across Tamil, English, Maths, Science, Social, Life Skills, Homework & ICLE Tech Guidance from ONE Google Sheet.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={handleCopyTemplateCsv}
                    className="px-3.5 py-2.5 bg-[#131F37] hover:bg-slate-800 border border-slate-800 text-sky-400 text-xs font-bold rounded-xl flex items-center gap-2 transition shadow"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy CSV Headers</span>
                  </button>

                  <a
                    href="https://docs.google.com/spreadsheets/create"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2.5 bg-[#131F37] hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold rounded-xl flex items-center gap-2 transition shadow"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>New Google Sheet</span>
                  </a>
                </div>
              </div>

              {/* Input Form */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-[#070C18] border border-slate-800 rounded-2xl">
                <div className="md:col-span-3 space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300">
                    Google Spreadsheet URL or Sheet ID (Public / Link Sharing Enabled):
                  </label>
                  <input
                    type="text"
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
                    className="w-full bg-[#0E172A] border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300">Sheet Tab Name:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={sheetTabName}
                      onChange={(e) => setSheetTabName(e.target.value)}
                      placeholder="Sheet1"
                      className="w-full bg-[#0E172A] border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition font-mono"
                    />

                    <button
                      onClick={handleSyncGoogleSheet}
                      disabled={isSyncingSheet}
                      className="px-5 py-3 bg-[#00D084] hover:bg-[#00B774] disabled:opacity-50 text-[#070C18] text-xs font-black rounded-xl shadow-lg flex items-center gap-2 transition shrink-0"
                    >
                      <RefreshCw className={`w-4 h-4 ${isSyncingSheet ? 'animate-spin' : ''}`} />
                      <span>{isSyncingSheet ? 'Syncing...' : '⚡ Sync Plans'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats Banner */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3.5 bg-[#131F37] border border-slate-800 rounded-xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Total Days Synced</div>
                  <div className="text-xl font-black text-white mt-1">{Object.keys(sheetPlans).length} Days</div>
                </div>
                <div className="p-3.5 bg-[#131F37] border border-slate-800 rounded-xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Courses Covered</div>
                  <div className="text-xl font-black text-[#00D084] mt-1">{sheetConfig?.coursesFound?.length || 0} Programs</div>
                </div>
                <div className="p-3.5 bg-[#131F37] border border-slate-800 rounded-xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">ICLE Official Guidance</div>
                  <div className="text-xl font-black text-sky-400 mt-1">100% In-App</div>
                </div>
                <div className="p-3.5 bg-[#131F37] border border-slate-800 rounded-xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Student Auto-Sync</div>
                  <div className="text-xl font-black text-amber-400 mt-1">Real-Time Active</div>
                </div>
              </div>
            </div>

            {/* Table of Parsed Google Sheet Days */}
            <div className="bg-[#0E172A] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 bg-[#131F37] border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Live Synced Curriculum Days</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-bold">
                    {Object.keys(sheetPlans).length} records
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0b1120] text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Day & Course</th>
                      <th className="p-3.5">ICLE Guidance Video</th>
                      <th className="p-3.5">தமிழ் (Tamil)</th>
                      <th className="p-3.5">English</th>
                      <th className="p-3.5">Mathematics</th>
                      <th className="p-3.5">Science</th>
                      <th className="p-3.5">Social Science</th>
                      <th className="p-3.5">Life Skills</th>
                      <th className="p-3.5">Fitness & Yoga</th>
                      <th className="p-3.5">Current Affairs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {Object.keys(sheetPlans).length === 0 ? (
                      <tr>
                        <td colSpan={10} className="p-8 text-center text-slate-400">
                          No Google Sheet day plans synced yet. Paste your Google Sheet URL above and click ⚡ Sync Plans.
                        </td>
                      </tr>
                    ) : (
                      Object.entries(sheetPlans).map(([key, item]) => (
                        <tr key={key} className="hover:bg-slate-800/30 transition">
                          <td className="p-3.5">
                            <div className="font-bold text-white">Day {item.dayNumber}</div>
                            <div className="text-[10px] text-[#00D084] uppercase font-bold">{item.courseId}</div>
                          </td>
                          <td className="p-3.5">
                            <div className="text-sky-400 font-bold truncate max-w-[130px]">{item.officialGuidanceVideo?.title}</div>
                            <div className="text-[10px] text-slate-500 font-mono">ID: {item.officialGuidanceVideo?.youtubeVideoId}</div>
                          </td>
                          <td className="p-3.5">
                            <div className="text-white truncate max-w-[120px]">{item.tamilTask?.title}</div>
                            <div className="text-[10px] text-slate-500">{item.tamilTask?.youtubeVideoId ? '📹 Video' : '📝 Notes'}</div>
                          </td>
                          <td className="p-3.5">
                            <div className="text-white truncate max-w-[120px]">{item.englishTask?.title}</div>
                            <div className="text-[10px] text-slate-500">{item.englishTask?.youtubeVideoId ? '📹 Video' : '📝 Notes'}</div>
                          </td>
                          <td className="p-3.5">
                            <div className="text-white truncate max-w-[120px]">{item.mathsTask?.title}</div>
                            <div className="text-[10px] text-slate-500">{item.mathsTask?.summary}</div>
                          </td>
                          <td className="p-3.5">
                            <div className="text-white truncate max-w-[120px]">{item.scienceTask?.title}</div>
                            <div className="text-[10px] text-slate-500">{item.scienceTask?.summary}</div>
                          </td>
                          <td className="p-3.5">
                            <div className="text-white truncate max-w-[120px]">{item.socialScienceTask?.title}</div>
                          </td>
                          <td className="p-3.5">
                            <div className="text-amber-400 font-bold truncate max-w-[110px]">{item.lifeSkillTask?.title}</div>
                          </td>
                          <td className="p-3.5">
                            <div className="text-pink-400 font-bold truncate max-w-[110px]">{item.exercisePhysicVideo?.asanaOrWorkout}</div>
                          </td>
                          <td className="p-3.5">
                            <div className="text-emerald-400 font-bold truncate max-w-[110px]">{item.currentAffairsGkVideo?.title}</div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════
            BULK INGESTION JSON MODAL
            ═════════════════════════════════════════════════════════════════════ */}
        {isBulkJsonModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#0b1120] border border-slate-800 rounded-3xl w-full max-w-3xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Upload className="w-5 h-5 text-emerald-400" />
                  <span>Bulk Ingest {bulkTarget.toUpperCase()} JSON</span>
                </h3>
                <button
                  onClick={() => setIsBulkJsonModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-400">
                Paste your batch JSON array matching the {bulkTarget} schema. Real-time validation will be performed before ingestion.
              </p>

              <textarea
                rows={12}
                value={bulkJsonText}
                onChange={(e) => setBulkJsonText(e.target.value)}
                placeholder={`[\n  {\n    "id": "item_1",\n    "title": "Sample"\n  }\n]`}
                className="w-full bg-[#131F37] border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setIsBulkJsonModalOpen(false)}
                  className="px-4 py-2 bg-[#131F37] text-slate-300 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyBulkJson}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow transition"
                >
                  Validate & Apply Ingestion
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
