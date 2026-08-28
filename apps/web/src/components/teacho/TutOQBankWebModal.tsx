import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Search,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Layers,
  Award,
  BookOpen,
  Filter,
  Copy,
  ChevronDown,
  ChevronUp,
  FileCode,
  Tag,
  Hash,
  ArrowRight,
  Sliders,
  GraduationCap,
  ListFilter,
  Compass,
  Database,
  Cloud,
  Globe,
  Check,
  Loader2
} from 'lucide-react';

import {
  StructuredMCQ,
  MASTER_QBANK_STORE,
  SUBJECT_TAXONOMY_MAP,
  EXAM_CATEGORIES,
  QUESTION_FORMATS,
  ExamCategory,
  QuestionFormat,
  searchQuestions,
  querySupabaseQuestionBank,
  parseQuestionUID,
  parseRangeExpression,
  classifyAndFormatRawMCQs,
} from '@/lib/qbankTaxonomyEngine';

interface TutOQBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  course?: any;
  initialQuery?: string;
  initialSubject?: string;
}

export const TutOQBankWebModal: React.FC<TutOQBankModalProps> = ({
  isOpen,
  onClose,
  course,
  initialQuery = '',
  initialSubject = 'ALL',
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'taxonomist'>('search');
  const [inputVal, setInputVal] = useState<string>(initialQuery);
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubject);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');

  // Instant typing debounce (80ms) for 60 FPS smooth input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(inputVal);
    }, 80);
    return () => clearTimeout(handler);
  }, [inputVal]);

  // Sync initial query & subject when modal opens
  useEffect(() => {
    if (isOpen) {
      setInputVal(initialQuery || '');
      setSearchQuery(initialQuery || '');
      if (initialSubject) setSelectedSubject(initialSubject);
    }
  }, [isOpen, initialQuery, initialSubject]);

  // Category-Wise & Format-Wise Filters
  const [selectedExamCategory, setSelectedExamCategory] = useState<ExamCategory>('ALL');
  const [selectedFormat, setSelectedFormat] = useState<QuestionFormat | 'ALL'>('ALL');

  // Dedicated Range Filter States (e.g. 100 to 200)
  const [rangeStartInput, setRangeStartInput] = useState<string>('');
  const [rangeEndInput, setRangeEndInput] = useState<string>('');
  const [activeRangePreset, setActiveRangePreset] = useState<string>('ALL');

  // Live Cloud Database (200,000+ Questions in kindle_content_cache)
  const [isLoadingCloud, setIsLoadingCloud] = useState<boolean>(false);
  const [cloudLoadedQuestions, setCloudLoadedQuestions] = useState<StructuredMCQ[]>([]);

  // Interactive User Selection & Answer State
  const [userSelectedOptions, setUserSelectedOptions] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [expandedSolutions, setExpandedSolutions] = useState<Record<string, boolean>>({});

  // Taxonomist Studio State
  const [rawInputText, setRawInputText] = useState<string>('');
  const [classifiedJsonOutput, setClassifiedJsonOutput] = useState<string>('');

  // Live Cloud Fetch from 2 Lakh Dataset
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchLiveQuestions = async () => {
      setIsLoadingCloud(true);
      try {
        const rangeOpt = {
          rangeStart: rangeStartInput ? parseInt(rangeStartInput, 10) || undefined : undefined,
          rangeEnd: rangeEndInput ? parseInt(rangeEndInput, 10) || undefined : undefined,
          examCategory: selectedExamCategory,
          format: selectedFormat,
        };

        const results = await querySupabaseQuestionBank(
          searchQuery,
          selectedSubject,
          selectedDifficulty,
          rangeOpt
        );

        if (isMounted) {
          setCloudLoadedQuestions(results);
        }
      } catch (err) {
        console.warn('Live cloud QBank fetch error:', err);
      } finally {
        if (isMounted) setIsLoadingCloud(false);
      }
    };

    const timer = setTimeout(fetchLiveQuestions, 200);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isOpen, searchQuery, selectedSubject, selectedDifficulty, selectedExamCategory, selectedFormat, rangeStartInput, rangeEndInput]);

  // Handle Range Presets across 2 Lakh Questions
  const handleRangePreset = (preset: string) => {
    setActiveRangePreset(preset);
    if (preset === 'ALL') {
      setRangeStartInput('');
      setRangeEndInput('');
    } else if (preset === '100-200') {
      setRangeStartInput('100');
      setRangeEndInput('200');
    } else if (preset === '1-500') {
      setRangeStartInput('1');
      setRangeEndInput('500');
    } else if (preset === '1000-2000') {
      setRangeStartInput('1000');
      setRangeEndInput('2000');
    } else if (preset === '10k-11k') {
      setRangeStartInput('10000');
      setRangeEndInput('11000');
    } else if (preset === '50k-51k') {
      setRangeStartInput('50000');
      setRangeEndInput('51000');
    } else if (preset === '100k-101k') {
      setRangeStartInput('100000');
      setRangeEndInput('101000');
    } else if (preset === '150k-151k') {
      setRangeStartInput('150000');
      setRangeEndInput('151000');
    } else if (preset === '200k-201k') {
      setRangeStartInput('200000');
      setRangeEndInput('201000');
    }
  };

  // Unified Questions Pool (Local Master Store + Loaded Cloud Data) - Clean Objective MCQs
  const combinedPool = useMemo(() => {
    let pool: StructuredMCQ[] = MASTER_QBANK_STORE;
    if (cloudLoadedQuestions && cloudLoadedQuestions.length > 0) {
      const map = new Map<string, StructuredMCQ>();
      MASTER_QBANK_STORE.forEach((q) => map.set(q.question_uid, q));
      cloudLoadedQuestions.forEach((q) => map.set(q.question_uid, q));
      pool = Array.from(map.values());
    }
    // Filter out fill_in_the_blank questions and ensure clean objective MCQs
    return pool.filter(q => (q.question_format as string) !== 'fill_in_the_blank');
  }, [cloudLoadedQuestions]);

  // Synchronous, instant search across UID, Number, Range, Format, and Keywords
  const filteredQuestions = useMemo(() => {
    const rangeOpt = {
      rangeStart: rangeStartInput ? parseInt(rangeStartInput, 10) || undefined : undefined,
      rangeEnd: rangeEndInput ? parseInt(rangeEndInput, 10) || undefined : undefined,
      examCategory: selectedExamCategory,
      format: selectedFormat,
    };

    return searchQuestions(searchQuery, selectedSubject, selectedDifficulty, combinedPool, rangeOpt);
  }, [combinedPool, searchQuery, selectedSubject, selectedDifficulty, selectedExamCategory, selectedFormat, rangeStartInput, rangeEndInput]);

  const handleOptionPress = (questionUid: string, optKey: 'A' | 'B' | 'C' | 'D') => {
    setUserSelectedOptions((prev) => ({
      ...prev,
      [questionUid]: optKey,
    }));
    setExpandedSolutions((prev) => ({
      ...prev,
      [questionUid]: true,
    }));
  };

  const toggleSolution = (uid: string) => {
    setExpandedSolutions((prev) => ({
      ...prev,
      [uid]: !prev[uid],
    }));
  };

  const handleCopyUid = (uid: string) => {
    navigator.clipboard?.writeText(uid);
    alert(`Copied!\nQuestion UID copied: ${uid}`);
  };

  const handleRunClassifier = () => {
    if (!rawInputText.trim()) {
      alert('Input Required: Please paste raw question JSON or text.');
      return;
    }

    const res = classifyAndFormatRawMCQs(rawInputText);
    if (res.success) {
      setClassifiedJsonOutput(JSON.stringify(res.data, null, 2));
      alert(`Taxonomy Classified ✨\nSuccessfully generated ${res.count} structured question(s) with deterministic UIDs!`);
    } else {
      alert(`Classification Error: ${res.error || 'Failed to parse raw questions.'}`);
    }
  };

  const handleCopyClassifiedJson = () => {
    if (!classifiedJsonOutput) return;
    navigator.clipboard?.writeText(classifiedJsonOutput);
    alert('Copied!\nSupabase JSON copied to clipboard.');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 flex items-end justify-center z-50">
      <div className="w-full max-w-4xl bg-[#070C18] rounded-t-[20px] border-t border-[#1E293B] h-[95vh] flex flex-col pb-5">
        {/* Header */}
        <div className="flex flex-row items-start justify-between p-4 border-b border-[#1E293B] bg-[#0E172A] rounded-t-[20px]">
          <div className="flex-1 flex flex-col gap-1">
            <div className="flex flex-row items-center gap-1.5 flex-wrap">
              <div className="flex flex-row items-center gap-1 bg-[#00D084]/15 px-2 py-1 rounded-md">
                <Hash size={13} color="#00D084" />
                <span className="text-[9px] font-black text-[#00D084]">NUMBER & TAXONOMY QBANK</span>
              </div>
              <div className="flex flex-row items-center gap-1 bg-[#38BDF8]/15 px-1.5 py-1 rounded border border-[#38BDF8]/30">
                <Globe size={11} color="#38BDF8" />
                <span className="text-[8px] font-mono text-[#38BDF8] font-extrabold">2 LAKH+ OBJECTIVE MCQS MAPPED</span>
              </div>
            </div>
            <h2 className="text-base font-black text-slate-50 mt-0.5">Complete MCQ Question Bank</h2>
            <p className="text-[11px] text-slate-400">Objective MCQs · High-Yield Question Bank · Range Search · Instant Practice</p>
          </div>
          <button className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center cursor-pointer hover:bg-slate-700" onClick={onClose}>
            <X size={20} color="#94A3B8" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex flex-row bg-[#0E172A] px-4 py-2 gap-2 border-b border-[#1E293B]">
          <button
            className={`flex-1 flex flex-row items-center justify-center gap-1.5 py-2 rounded-lg cursor-pointer ${activeTab === 'search' ? 'bg-[#00D084]/15 border border-[#00D084]' : 'bg-[#131F37]'}`}
            onClick={() => setActiveTab('search')}
          >
            <Search size={14} color={activeTab === 'search' ? '#00D084' : '#94A3B8'} />
            <span className={`text-[11px] font-bold ${activeTab === 'search' ? 'text-[#00D084] font-black' : 'text-slate-400'}`}>
              Search & Practice ({filteredQuestions.length})
            </span>
          </button>

          <button
            className={`flex-1 flex flex-row items-center justify-center gap-1.5 py-2 rounded-lg cursor-pointer ${activeTab === 'taxonomist' ? 'bg-[#00D084]/15 border border-[#00D084]' : 'bg-[#131F37]'}`}
            onClick={() => setActiveTab('taxonomist')}
          >
            <FileCode size={14} color={activeTab === 'taxonomist' ? '#00D084' : '#94A3B8'} />
            <span className={`text-[11px] font-bold ${activeTab === 'taxonomist' ? 'text-[#00D084] font-black' : 'text-slate-400'}`}>
              Taxonomist Studio (JSON Generator)
            </span>
          </button>
        </div>

        {activeTab === 'search' ? (
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-4 pb-10 flex flex-col gap-4">
              {/* Header components for Search */}
              <div className="flex flex-col">
                {/* 1. Primary Word / Number Search Bar */}
                <div className="flex flex-row items-center gap-2 bg-[#0E172A] rounded-xl px-3 py-2.5 border border-[#1E293B] mb-2.5">
                  <Search size={16} color="#00D084" />
                  <input
                    className="flex-1 text-[13px] text-slate-50 bg-transparent outline-none placeholder:text-slate-500"
                    placeholder="Search by keyword (e.g. velocity, friction, cell), UID, or range..."
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                  />
                  {isLoadingCloud && (
                    <Loader2 size={16} color="#00D084" className="mr-1.5 animate-spin" />
                  )}
                  {inputVal.length > 0 && (
                    <button onClick={() => { setInputVal(''); setSearchQuery(''); }}>
                      <X size={16} color="#94A3B8" />
                    </button>
                  )}
                </div>

                {/* 2. TYPE-WISE: Question Format Selector */}
                <div className="flex flex-col gap-1.5 mb-2.5">
                  <div className="flex flex-row items-center justify-between">
                    <span className="text-[9px] font-black text-[#00D084] tracking-wide">📑 QUESTION FORMAT & TYPE SEARCH:</span>
                    {selectedFormat !== 'ALL' && (
                      <button onClick={() => setSelectedFormat('ALL')} className="text-[9px] font-extrabold text-rose-500 hover:opacity-80">
                        Reset Type
                      </button>
                    )}
                  </div>
                  <div className="flex flex-row gap-1.5 py-0.5 overflow-x-auto no-scrollbar pb-1">
                    {QUESTION_FORMATS.map((fmt) => {
                      const isSelected = selectedFormat === fmt.id;
                      return (
                        <button
                          key={fmt.id}
                          className={`flex flex-row items-center gap-1 px-2.5 py-1.5 rounded-lg border cursor-pointer whitespace-nowrap shrink-0 transition-colors ${isSelected ? 'bg-sky-400/20 border-sky-400' : 'bg-[#0E172A] border-[#1E293B] hover:bg-[#131F37]'}`}
                          onClick={() => setSelectedFormat(fmt.id)}
                        >
                          <span className="text-[11px]">{fmt.icon}</span>
                          <span className={`text-[10px] ${isSelected ? 'text-sky-400 font-black' : 'text-slate-400 font-bold'}`}>
                            {fmt.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. CATEGORY-WISE: Exam Category Selector */}
                <div className="flex flex-col gap-1.5 mb-2.5">
                  <div className="flex flex-row items-center justify-between">
                    <span className="text-[9px] font-black text-[#00D084] tracking-wide">🎓 EXAM CATEGORY SEARCH:</span>
                    {selectedExamCategory !== 'ALL' && (
                      <button onClick={() => setSelectedExamCategory('ALL')} className="text-[9px] font-extrabold text-rose-500 hover:opacity-80">
                        Reset Exam
                      </button>
                    )}
                  </div>
                  <div className="flex flex-row gap-1.5 py-0.5 overflow-x-auto no-scrollbar pb-1">
                    {EXAM_CATEGORIES.map((cat) => {
                      const isSelected = selectedExamCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          className={`flex flex-row items-center gap-1 px-2.5 py-1.5 rounded-lg border cursor-pointer whitespace-nowrap shrink-0 transition-colors ${isSelected ? 'bg-[#00D084]/20 border-[#00D084]' : 'bg-[#0E172A] border-[#1E293B] hover:bg-[#131F37]'}`}
                          onClick={() => setSelectedExamCategory(cat.id)}
                        >
                          <span className="text-[11px]">{cat.icon}</span>
                          <span className={`text-[11px] ${isSelected ? 'text-[#00D084] font-black' : 'text-slate-400 font-bold'}`}>
                            {cat.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. RANGE-WISE: Sequential Number Range Search */}
                <div className="flex flex-col gap-1.5 mb-2.5">
                  <div className="flex flex-row items-center justify-between">
                    <span className="text-[9px] font-black text-[#00D084] tracking-wide">🎯 QUESTION NUMBER & SEQUENCE RANGE:</span>
                    {(rangeStartInput || rangeEndInput || activeRangePreset !== 'ALL') && (
                      <button onClick={() => handleRangePreset('ALL')} className="text-[9px] font-extrabold text-rose-500 hover:opacity-80">
                        Clear Range
                      </button>
                    )}
                  </div>

                  <div className="flex flex-row items-center justify-between gap-2 mb-1.5">
                    <div className="flex-1 flex flex-row items-center gap-1.5 bg-[#0E172A] px-2.5 py-1.5 rounded-lg border border-[#1E293B]">
                      <span className="text-[10px] font-bold text-slate-400">From #</span>
                      <input
                        className="flex-1 text-xs font-extrabold text-[#00D084] bg-transparent outline-none placeholder:text-slate-500"
                        placeholder="100"
                        type="number"
                        value={rangeStartInput}
                        onChange={(e) => {
                          setRangeStartInput(e.target.value);
                          setActiveRangePreset('CUSTOM');
                        }}
                      />
                    </div>

                    <div className="px-1">
                      <span className="text-[10px] font-black text-slate-500">TO</span>
                    </div>

                    <div className="flex-1 flex flex-row items-center gap-1.5 bg-[#0E172A] px-2.5 py-1.5 rounded-lg border border-[#1E293B]">
                      <span className="text-[10px] font-bold text-slate-400">To #</span>
                      <input
                        className="flex-1 text-xs font-extrabold text-[#00D084] bg-transparent outline-none placeholder:text-slate-500"
                        placeholder="200"
                        type="number"
                        value={rangeEndInput}
                        onChange={(e) => {
                          setRangeEndInput(e.target.value);
                          setActiveRangePreset('CUSTOM');
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-row gap-1.5 py-0.5 overflow-x-auto no-scrollbar pb-1">
                    {[
                      { id: 'ALL', label: 'All Questions' },
                      { id: '100-200', label: '🎯 #100 to #200' },
                      { id: '1-500', label: '#1 to #500' },
                      { id: '1000-2000', label: '#1,000 to #2,000' },
                      { id: '10k-11k', label: '#10k to #11k' },
                      { id: '50k-51k', label: '#50k to #51k' },
                      { id: '100k-101k', label: '#100k to #101k' },
                      { id: '150k-151k', label: '#150k to #151k' },
                      { id: '200k-201k', label: '#200k to #201k' },
                    ].map((preset) => (
                      <button
                        key={preset.id}
                        className={`px-2 py-1 rounded-md border cursor-pointer whitespace-nowrap shrink-0 transition-colors ${activeRangePreset === preset.id ? 'bg-[#00D084]/20 border-[#00D084]' : 'bg-[#0E172A] border-[#1E293B] hover:bg-[#131F37]'}`}
                        onClick={() => handleRangePreset(preset.id)}
                      >
                        <span className={`text-[9px] ${activeRangePreset === preset.id ? 'text-[#00D084] font-black' : 'text-slate-400 font-bold'}`}>
                          {preset.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Subject Filter Pills */}
                <div className="flex flex-col gap-1.5 mb-2.5">
                  <span className="text-[9px] font-black text-[#00D084] tracking-wide">📚 SUBJECT DISCIPLINE SEARCH:</span>
                  <div className="flex flex-row gap-1.5 py-0.5 overflow-x-auto no-scrollbar pb-1">
                    <button
                      className={`flex flex-row items-center gap-1 px-3 py-1.5 rounded-lg border cursor-pointer whitespace-nowrap shrink-0 transition-colors ${selectedSubject === 'ALL' ? 'bg-[#00D084] border-[#00D084]' : 'bg-[#0E172A] border-[#1E293B] hover:bg-[#131F37]'}`}
                      onClick={() => setSelectedSubject('ALL')}
                    >
                      <span className={`text-[11px] ${selectedSubject === 'ALL' ? 'text-[#070C18] font-black' : 'text-slate-400 font-bold'}`}>
                        All Subjects
                      </span>
                    </button>

                    {Object.entries(SUBJECT_TAXONOMY_MAP).map(([code, subj]) => (
                      <button
                        key={code}
                        className={`flex flex-row items-center gap-1 px-3 py-1.5 rounded-lg border cursor-pointer whitespace-nowrap shrink-0 transition-colors ${selectedSubject === code ? 'bg-[#00D084] border-[#00D084]' : 'bg-[#0E172A] border-[#1E293B] hover:bg-[#131F37]'}`}
                        onClick={() => setSelectedSubject(code)}
                      >
                        <span className="text-[11px]">{subj.icon}</span>
                        <span className={`text-[11px] ${selectedSubject === code ? 'text-[#070C18] font-black' : 'text-slate-400 font-bold'}`}>
                          {code} ({subj.name})
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 6. Difficulty Filters */}
                <div className="flex flex-row items-center gap-2 mb-2.5 flex-wrap">
                  <span className="text-[11px] font-extrabold text-slate-400">Difficulty:</span>
                  {['ALL', 'Easy', 'Medium', 'Hard'].map((diff) => (
                    <button
                      key={diff}
                      className={`px-2 py-1 rounded-md border cursor-pointer transition-colors ${selectedDifficulty === diff ? 'bg-[#131F37] border-slate-400' : 'bg-[#0E172A] border-[#1E293B] hover:bg-[#131F37]'}`}
                      onClick={() => setSelectedDifficulty(diff)}
                    >
                      <span className={`text-[10px] ${selectedDifficulty === diff ? 'font-black' : 'font-bold'} ${
                        diff === 'Easy' ? (selectedDifficulty === diff ? 'text-emerald-500' : 'text-emerald-500/70') :
                        diff === 'Medium' ? (selectedDifficulty === diff ? 'text-amber-500' : 'text-amber-500/70') :
                        diff === 'Hard' ? (selectedDifficulty === diff ? 'text-rose-500' : 'text-rose-500/70') :
                        (selectedDifficulty === diff ? 'text-slate-200' : 'text-slate-400')
                      }`}>
                        {diff === 'ALL' ? 'All' : diff}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Result Summary Bar */}
                <div className="py-1 mb-2">
                  <span className="text-[11px] text-slate-400 font-semibold">
                    Showing <span className="text-[#00D084] font-black">{filteredQuestions.length}</span> Questions
                    {selectedFormat !== 'ALL' ? ` [${selectedFormat}]` : ''}
                    {selectedExamCategory !== 'ALL' ? ` in [${selectedExamCategory}]` : ''}
                    {(rangeStartInput && rangeEndInput) ? ` in range #${rangeStartInput} to #${rangeEndInput}` : ''}
                    {searchQuery ? ` matching "${searchQuery}"` : ''}
                  </span>
                </div>
              </div>

              {/* Lists */}
              {filteredQuestions.length === 0 ? (
                <div className="bg-[#0E172A] rounded-2xl p-6 flex flex-col items-center justify-center gap-2 border border-[#1E293B] mt-5">
                  <HelpCircle size={32} color="#64748B" />
                  <h3 className="text-[15px] font-extrabold text-slate-50">No Questions Found</h3>
                  <p className="text-xs text-slate-400 text-center">
                    No questions matched your search in the 2 Lakh+ database. Try adjusting your search query, type, or filters.
                  </p>
                  <button
                    className="bg-[#00D084] px-3.5 py-2 rounded-lg mt-1.5 cursor-pointer hover:bg-[#00D084]/90 transition-colors"
                    onClick={() => {
                      setInputVal('');
                      setSearchQuery('');
                      setSelectedSubject('ALL');
                      setSelectedDifficulty('ALL');
                      setSelectedExamCategory('ALL');
                      setSelectedFormat('ALL');
                      setRangeStartInput('');
                      setRangeEndInput('');
                      setActiveRangePreset('ALL');
                    }}
                  >
                    <span className="text-xs font-extrabold text-[#070C18]">Reset All Filters</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3.5">
                  {filteredQuestions.map((qItem, idx) => {
                    const selectedOpt = userSelectedOptions[qItem.question_uid];
                    const isAnswered = Boolean(selectedOpt);
                    const isCorrect = selectedOpt === qItem.correct_option;
                    const isSolExpanded = expandedSolutions[qItem.question_uid] !== false;

                    const formatObj = QUESTION_FORMATS.find(f => f.id === qItem.question_format);
                    const examObj = EXAM_CATEGORIES.find(e => e.id === qItem.exam_category);

                    return (
                      <div key={qItem.question_uid || idx} className="bg-[#0E172A] rounded-2xl p-4 border border-[#1E293B] flex flex-col gap-2">
                        {/* Top UID & Tag Row */}
                        <div className="flex flex-row items-center justify-between flex-wrap gap-1.5">
                          <button
                            className="flex flex-row items-center gap-1.5 bg-sky-400/15 px-2 py-1 rounded-md border border-sky-400/35 cursor-pointer hover:bg-sky-400/25 transition-colors"
                            onClick={() => handleCopyUid(qItem.question_uid)}
                          >
                            <span className="text-[10px] font-mono text-sky-400 font-extrabold">{qItem.question_uid}</span>
                            <Copy size={11} color="#38BDF8" />
                          </button>

                          <div className="flex flex-row items-center gap-1.5 flex-wrap">
                            {formatObj && formatObj.id !== 'ALL' && (
                              <div className="bg-[#131F37] px-1.5 py-1 rounded border border-sky-400/30">
                                <span className="text-[9px] text-sky-400 font-bold">{formatObj.icon} {formatObj.label}</span>
                              </div>
                            )}
                            {examObj && examObj.id !== 'ALL' && (
                              <div className="bg-[#131F37] px-1.5 py-1 rounded border border-amber-500/30">
                                <span className="text-[9px] text-amber-500 font-extrabold">{examObj.icon} {examObj.label}</span>
                              </div>
                            )}
                            <div
                              className={`px-1.5 py-1 rounded border ${
                                qItem.taxonomy.difficulty === 'Easy' ? 'bg-emerald-500/15 border-emerald-500' :
                                qItem.taxonomy.difficulty === 'Medium' ? 'bg-amber-500/15 border-amber-500' :
                                qItem.taxonomy.difficulty === 'Hard' ? 'bg-rose-500/15 border-rose-500' :
                                'bg-slate-500/15 border-slate-500'
                              }`}
                            >
                              <span
                                className={`text-[9px] font-extrabold ${
                                  qItem.taxonomy.difficulty === 'Easy' ? 'text-emerald-500' :
                                  qItem.taxonomy.difficulty === 'Medium' ? 'text-amber-500' :
                                  qItem.taxonomy.difficulty === 'Hard' ? 'text-rose-500' :
                                  'text-slate-400'
                                }`}
                              >
                                {qItem.taxonomy.difficulty}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Taxonomy Path Trail */}
                        <div className="bg-[#131F37] px-2.5 py-1.5 rounded-lg border border-[#1E293B] mt-0.5">
                          <span className="text-[10px] text-slate-300 font-semibold leading-relaxed">
                            {qItem.taxonomy.subject} ({qItem.taxonomy.subject_code}) &gt;{' '}
                            {qItem.taxonomy.domain} &gt; {qItem.taxonomy.topic} &gt;{' '}
                            {qItem.taxonomy.subtopic} &gt; {qItem.taxonomy.microtopic}
                          </span>
                        </div>

                        {/* Question Text */}
                        <div className="flex flex-col mt-1">
                          <p className="text-sm font-bold text-slate-50 leading-relaxed">{qItem.question_text}</p>
                          {qItem.question_text_ta ? (
                            <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{qItem.question_text_ta}</p>
                          ) : null}
                        </div>

                        {/* Options (A, B, C, D) */}
                        <div className="flex flex-col gap-2 mt-1.5">
                          {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                            const optText = qItem.options[optKey];
                            const optTextTa = qItem.options_ta?.[optKey];
                            if (!optText) return null;

                            const isUserChoice = selectedOpt === optKey;
                            const isCorrectChoice = optKey === qItem.correct_option;

                            let optClasses = "flex flex-row items-center gap-2.5 bg-[#131F37] px-3 py-2.5 rounded-xl border border-[#1E293B] cursor-pointer hover:bg-[#1E293B]/50 transition-colors text-left";
                            let textClasses = "text-[13px] font-semibold text-slate-100 leading-snug";
                            let badgeClasses = "w-[26px] h-[26px] rounded-full bg-[#0E172A] border border-slate-700 flex items-center justify-center shrink-0";
                            let badgeTextClasses = "text-[11px] font-black text-slate-400";

                            if (isAnswered) {
                              if (isCorrectChoice) {
                                optClasses = "flex flex-row items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer text-left border-[#00D084] bg-[#00D084]/15";
                                textClasses = "text-[13px] leading-snug text-[#00D084] font-extrabold";
                                badgeClasses = "w-[26px] h-[26px] rounded-full flex items-center justify-center shrink-0 bg-[#00D084] border border-[#00D084]";
                                badgeTextClasses = "text-[11px] font-black text-[#070C18]";
                              } else if (isUserChoice && !isCorrect) {
                                optClasses = "flex flex-row items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer text-left border-rose-500 bg-rose-500/15";
                                textClasses = "text-[13px] leading-snug text-rose-500 font-extrabold";
                                badgeClasses = "w-[26px] h-[26px] rounded-full flex items-center justify-center shrink-0 bg-rose-500 border border-rose-500";
                                badgeTextClasses = "text-[11px] font-black text-white";
                              }
                            }

                            return (
                              <button
                                key={optKey}
                                className={optClasses}
                                onClick={() => handleOptionPress(qItem.question_uid, optKey)}
                              >
                                <div className={badgeClasses}>
                                  <span className={badgeTextClasses}>{optKey}</span>
                                </div>
                                <div className="flex flex-col flex-1">
                                  <span className={textClasses}>{optText}</span>
                                  {optTextTa ? <span className="text-[11px] text-slate-400 mt-0.5">{optTextTa}</span> : null}
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {/* Explanation Toggle Header */}
                        <button
                          className="flex flex-row items-center justify-between bg-[#131F37] px-3 py-2 rounded-lg mt-1 border border-[#1E293B] cursor-pointer hover:bg-[#1E293B]/60 transition-colors"
                          onClick={() => toggleSolution(qItem.question_uid)}
                        >
                          <div className="flex flex-row items-center gap-1.5">
                            <Sparkles size={14} color="#00D084" />
                            <span className="text-[11px] font-extrabold text-[#00D084]">
                              {isAnswered
                                ? isCorrect
                                  ? 'Correct! Explanation & Governing Law'
                                  : 'Incorrect. Solution & Correct Rule'
                                : 'View Explanation & Solution'}
                            </span>
                          </div>
                          {isSolExpanded ? (
                            <ChevronUp size={16} color="#94A3B8" />
                          ) : (
                            <ChevronDown size={16} color="#94A3B8" />
                          )}
                        </button>

                        {/* Solution & Formulas Body */}
                        {isSolExpanded && (
                          <div className="bg-[#091020] rounded-xl p-3 mt-1 border-l-[3px] border-l-[#00D084] border border-[#1E293B] flex flex-col gap-2">
                            <div className="flex flex-row items-center gap-1.5 bg-[#00D084]/15 px-2.5 py-1.5 rounded-md border border-[#00D084]/30 self-start">
                              <CheckCircle2 size={13} color="#00D084" />
                              <span className="text-[11px] font-extrabold text-[#00D084]">
                                Correct Option: [{qItem.correct_option}] {qItem.options[qItem.correct_option]}
                              </span>
                            </div>

                            <p className="text-xs text-slate-200 leading-relaxed">{qItem.explanation}</p>
                            {qItem.explanation_ta ? (
                              <p className="text-[11px] text-slate-400 leading-relaxed">{qItem.explanation_ta}</p>
                            ) : null}

                            {qItem.formula_or_law ? (
                              <div className="bg-[#0E172A] rounded-md p-2 flex flex-col gap-1 border border-sky-400/25 mt-1">
                                <span className="text-[8px] font-black text-sky-400 tracking-wide">GOVERNING LAW / FORMULA:</span>
                                <span className="text-[11px] font-bold text-sky-400 font-mono">{qItem.formula_or_law}</span>
                              </div>
                            ) : null}
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
          /* ═════════════════════════════════════════════════════════════════
             🛠️ TAXONOMIST STUDIO (RAW QUESTION -> DETERMINISTIC SUPABASE JSON)
             ═════════════════════════════════════════════════════════════════ */
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="flex flex-col gap-3.5 p-4 pb-10">
              <div className="bg-[#0E172A] rounded-xl p-3.5 border border-[#1E293B] flex flex-col gap-1.5">
                <h3 className="text-sm font-extrabold text-slate-50">Taxonomy Classifier & UID Generator</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Paste raw MCQs to automatically construct standard deterministic UIDs and export formatted JSON for Supabase import.
                </p>
              </div>

              <div className="flex flex-col gap-1.5 mt-2">
                <span className="text-[10px] font-black text-[#00D084] tracking-wide">RAW QUESTIONS INPUT (JSON OR TEXT):</span>
                <textarea
                  className="bg-[#0E172A] rounded-xl border border-[#1E293B] p-2.5 text-slate-50 font-mono text-[11px] min-h-[140px] resize-none outline-none focus:border-[#00D084]"
                  placeholder={`[\n  {\n    "question": "The speed of light in vacuum is approximately:",\n    "options": ["3 x 10^8 m/s", "3 x 10^6 m/s", "9.8 m/s^2", "Zero"],\n    "subject": "Physics",\n    "subject_code": "PHY",\n    "domain": "Optics",\n    "domain_code": "OPT",\n    "difficulty": "Easy",\n    "question_format": "single_choice",\n    "correctAnswer": "A",\n    "explanation": "c = 3 x 10^8 m/s in vacuum."\n  }\n]`}
                  value={rawInputText}
                  onChange={(e) => setRawInputText(e.target.value)}
                />

                <button
                  className="flex flex-row items-center justify-center gap-1.5 bg-[#00D084] py-3 rounded-xl mt-1 cursor-pointer hover:bg-[#00D084]/90 transition-colors"
                  onClick={handleRunClassifier}
                >
                  <Sparkles size={16} color="#070C18" />
                  <span className="text-xs font-black text-[#070C18]">Classify & Generate Deterministic UIDs</span>
                </button>
              </div>

              {classifiedJsonOutput.length > 0 && (
                <div className="flex flex-col gap-1.5 mt-4">
                  <div className="flex flex-row items-center justify-between">
                    <span className="text-[10px] font-black text-[#00D084] tracking-wide">CLASSIFIED SUPABASE JSON OUTPUT:</span>
                    <button
                      className="flex flex-row items-center gap-1 bg-[#131F37] px-2 py-1 rounded-md cursor-pointer hover:bg-[#1E293B] transition-colors"
                      onClick={handleCopyClassifiedJson}
                    >
                      <Copy size={13} color="#00D084" />
                      <span className="text-[10px] font-extrabold text-[#00D084]">Copy JSON</span>
                    </button>
                  </div>
                  <textarea
                    className="bg-[#0E172A] rounded-xl border border-[#1E293B] p-2.5 text-sky-400 font-mono text-[10px] min-h-[180px] resize-none outline-none"
                    readOnly
                    value={classifiedJsonOutput}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
