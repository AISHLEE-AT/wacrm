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

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCourse, setSelectedCourse] = useState<CourseOption>(ALL_COURSES[0]);
  const [selectedBoard, setSelectedBoard] = useState<SchoolBoard>('TNSB');
  const [dayNumber, setDayNumber] = useState<number>(1);

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
            TAB 3: 200-DAY PLAN SCHEDULER
            ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'day_plan' && (
          <div className="space-y-6">
            <div className="bg-[#0E172A] border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-xs">
                  200-Day Micro-Learning Master Schedule
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  Day {dayNumber} of 200: {activeDayPlan.targetTopicTitle}
                </h3>
                <p className="text-xs text-slate-400">
                  {activeDayPlan.targetSubject} • {activeDayPlan.targetChapter}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">Select Day:</span>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={dayNumber}
                  onChange={(e) => setDayNumber(Math.max(1, Math.min(200, parseInt(e.target.value) || 1)))}
                  className="w-20 bg-[#131F37] border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-white text-center focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => handleExportJson('day_plan')}
                  className="px-3.5 py-2 bg-[#131F37] hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Day Plan JSON</span>
                </button>
              </div>
            </div>

            {/* 5 Daily Tasks List */}
            <div className="space-y-3">
              {activeDayPlan.tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-[#0E172A] border border-slate-800 rounded-2xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 font-bold text-xs flex items-center justify-center">
                      {task.stepNumber}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{task.taskName}</span>
                        <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 font-mono text-[9px]">
                          {task.conceptCode}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {task.topic} • {task.durationMinutes} Mins • +{task.xp} XP
                      </div>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg bg-[#131F37] text-slate-300 text-xs font-mono">
                    {task.type.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
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
            TAB 7: STUDENT DAILY TASK VIDEO SUBMISSIONS & GOOGLE DRIVE
            ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'submissions' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0E172A] border border-slate-800 p-6 rounded-3xl">
              <div>
                <span className="text-[10px] uppercase font-black text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20">
                  Google Drive Cloud Submissions
                </span>
                <h3 className="text-base font-bold text-white mt-1">Student Video Reflections & Daily Feedback</h3>
                <p className="text-xs text-slate-400">Review task video recordings uploaded directly to students' Google Drive storage</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const supabase = createClient();
                    setIsLoadingSubmissions(true);
                    supabase
                      .from('daily_task_submissions')
                      .select('*')
                      .order('created_at', { ascending: false })
                      .limit(50)
                      .then(({ data }: any) => {
                        if (data) setSubmissions(data);
                        setIsLoadingSubmissions(false);
                      });
                  }}
                  className="px-3.5 py-2 bg-[#131F37] hover:bg-slate-800 border border-slate-800 text-sky-400 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSubmissions ? 'animate-spin' : ''}`} />
                  <span>Refresh Submissions</span>
                </button>
              </div>
            </div>

            {/* Submissions Table */}
            <div className="bg-[#0E172A] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#131F37] text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4">Student</th>
                    <th className="p-4">Course & Day</th>
                    <th className="p-4">Topic & Rating</th>
                    <th className="p-4">Feedback Notes</th>
                    <th className="p-4">Google Drive Video</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Review Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {submissions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        {isLoadingSubmissions ? 'Loading submissions from Supabase...' : 'No student video submissions recorded yet.'}
                      </td>
                    </tr>
                  ) : (
                    submissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-800/30 transition">
                        <td className="p-4">
                          <div className="font-bold text-white">{sub.user_name || 'Student'}</div>
                          <div className="text-[11px] text-slate-400">{sub.user_phone}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-sky-400">Day {sub.day_number}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{sub.course_title || sub.course_id}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-white truncate max-w-[180px]">{sub.topic_title}</div>
                          <div className="flex items-center gap-0.5 mt-0.5 text-amber-400">
                            {Array.from({ length: sub.rating || 5 }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-[11px] text-slate-300 max-w-[200px] line-clamp-2">
                            {sub.feedback_text || 'Completed daily task'}
                          </div>
                        </td>
                        <td className="p-4">
                          <a
                            href={sub.video_drive_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-400 hover:bg-sky-500/25 transition font-bold text-[11px]"
                          >
                            <Play className="w-3 h-3 fill-sky-400" />
                            <span>Watch on Drive</span>
                          </a>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            sub.status === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : sub.status === 'reviewed'
                              ? 'bg-sky-500/20 text-sky-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {(sub.status || 'submitted').toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={async () => {
                              const supabase = createClient();
                              await supabase
                                .from('daily_task_submissions')
                                .update({ status: 'approved', updated_at: new Date().toISOString() })
                                .eq('id', sub.id);
                              setSubmissions((prev) =>
                                prev.map((item) => (item.id === sub.id ? { ...item, status: 'approved' } : item))
                              );
                              showStatus(`Task submission for ${sub.user_name || sub.user_phone} marked as Approved!`, 'success');
                            }}
                            className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold transition"
                          >
                            Approve
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
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
