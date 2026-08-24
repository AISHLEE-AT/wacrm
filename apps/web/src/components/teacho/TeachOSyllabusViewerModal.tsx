'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  ShieldCheck,
  BookOpen,
  CheckCircle2,
  Lock,
  ChevronDown,
  ChevronUp,
  Play,
  FileText,
  Award,
  Sparkles,
  Layers,
  FileCheck,
  Clock,
  Target,
  Bot,
  Compass,
} from 'lucide-react';
import {
  getOfficialGovernmentSyllabus,
  OfficialCourseSyllabus,
  OfficialSubjectSyllabus,
  OfficialChapter,
  OfficialMicroTopic,
  OfficialNanoConcept,
} from '@/data/curriculum/officialGovernmentSyllabusRegistry';

interface TeachOSyllabusViewerModalProps {
  isOpen: boolean;
  courseId: string;
  courseTitle: string;
  board?: string;
  isPurchased?: boolean;
  onClose: () => void;
  onUnlockCourse?: () => void;
  onLaunchNanoPlayer?: (concept: OfficialNanoConcept, topic: OfficialMicroTopic, subject: string, tab?: 'lecture' | 'notes' | 'quiz' | 'tutor') => void;
}

export const TeachOSyllabusViewerModal: React.FC<TeachOSyllabusViewerModalProps> = ({
  isOpen,
  courseId,
  courseTitle,
  board,
  isPurchased = false,
  onClose,
  onUnlockCourse,
  onLaunchNanoPlayer,
}) => {
  const syllabus: OfficialCourseSyllabus = useMemo(() => {
    return getOfficialGovernmentSyllabus(courseId, board);
  }, [courseId, board]);

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({
    'ch_0_0': true,
    'ch_0_1': true,
  });
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

  const toggleChapter = (key: string) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleTopicNano = (key: string) => {
    setExpandedTopics((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const filteredSubjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return syllabus.subjects
      .filter((s) => selectedSubjectId === 'all' || s.subjectId === selectedSubjectId)
      .map((subj) => {
        if (!q) return subj;
        const matchingChapters = subj.chapters.filter((ch) => {
          const chMatch =
            (ch.chapterTitle || '').toLowerCase().includes(q) ||
            (ch.tamilTitle || '').toLowerCase().includes(q) ||
            (ch.description || '').toLowerCase().includes(q);
          const topicMatch = ch.topics.some((t) => {
            const tMatch =
              (t.title || '').toLowerCase().includes(q) ||
              (t.tamilTitle || '').toLowerCase().includes(q) ||
              (t.keyAxiomOrLaw || '').toLowerCase().includes(q) ||
              (t.keyFormula || '').toLowerCase().includes(q);
            const nanoMatch = (t.nanoConcepts || []).some(
              (n) =>
                (n.name || '').toLowerCase().includes(q) ||
                (n.tamilName || '').toLowerCase().includes(q) ||
                (n.description || '').toLowerCase().includes(q) ||
                (n.keyRuleOrFormula || '').toLowerCase().includes(q) ||
                (n.solvedExampleOrLaw || '').toLowerCase().includes(q)
            );
            return tMatch || nanoMatch;
          });
          return chMatch || topicMatch;
        });
        return {
          ...subj,
          chapters: matchingChapters,
        };
      })
      .filter((subj) => subj.chapters.length > 0);
  }, [syllabus, selectedSubjectId, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-200">
      <div className="bg-[#0b1120] border border-slate-800 rounded-3xl w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="p-5 md:p-6 bg-[#0E172A] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-extrabold text-[10px] uppercase border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> 100% Govt Notified Syllabus
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">
                  {syllabus.medium}
                </span>
              </div>
              <h3 className="text-base md:text-lg font-bold text-white mt-0.5">{syllabus.courseTitle}</h3>
              <p className="text-xs text-slate-400">{syllabus.boardOrAuthority}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scroll Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
          
          {/* Government Authority Card */}
          <div className="bg-[#0E172A] border border-slate-800 rounded-2xl p-4 md:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-wider">
                <FileCheck className="w-4 h-4" />
                <span>OFFICIAL NOTIFICATION & NORMS VERIFICATION</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                Verified Govt Norms
              </span>
            </div>
            <div className="text-sm font-bold text-white">📋 {syllabus.notificationRef}</div>
            {syllabus.gazetteOrder && (
              <div className="text-xs text-slate-400">🏛️ Gazette Order: {syllabus.gazetteOrder}</div>
            )}
            <div className="bg-[#131F37] border border-slate-800/80 rounded-xl p-3.5 space-y-1">
              <div className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                EXAM BLUEPRINT & WEIGHTAGE
              </div>
              <div className="text-xs font-medium text-slate-200">{syllabus.examPatternSummary}</div>
              <div className="text-[11px] text-slate-400">⚖️ Marking Scheme: {syllabus.markingScheme}</div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#0E172A] border border-slate-800 rounded-xl p-3 text-center">
              <div className="text-lg font-black text-white">{syllabus.totalSubjects}</div>
              <div className="text-[11px] text-slate-500">Subjects</div>
            </div>
            <div className="bg-[#0E172A] border border-slate-800 rounded-xl p-3 text-center">
              <div className="text-lg font-black text-white">{syllabus.totalChapters}</div>
              <div className="text-[11px] text-slate-500">Chapters</div>
            </div>
            <div className="bg-[#0E172A] border border-slate-800 rounded-xl p-3 text-center">
              <div className="text-lg font-black text-white">{syllabus.totalTopics}</div>
              <div className="text-[11px] text-slate-500">Micro Topics</div>
            </div>
            <div className="bg-[#0E172A] border border-slate-800 rounded-xl p-3 text-center">
              <div className="text-lg font-black text-emerald-400">{syllabus.totalNanoConcepts || 480}+</div>
              <div className="text-[11px] text-slate-500">Nano Concepts</div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Deep search concepts (e.g. Cartesian Product, Thales, அளபெடை, F=ma, Newton)..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#0E172A] border border-slate-800 rounded-2xl text-xs md:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Subject Filter Tabs */}
          <div className="flex border-b border-slate-800 overflow-x-auto scrollbar-none py-2 gap-2">
            <button
              onClick={() => setSelectedSubjectId('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
                selectedSubjectId === 'all'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-[#0E172A] text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              All Subjects ({syllabus.subjects.length})
            </button>
            {syllabus.subjects.map((s) => (
              <button
                key={s.subjectId}
                onClick={() => setSelectedSubjectId(s.subjectId)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
                  selectedSubjectId === s.subjectId
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'bg-[#0E172A] text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                <span>{s.icon} {s.subjectName}</span>
              </button>
            ))}
          </div>

          {/* Subjects and Chapters Accordion */}
          <div className="space-y-6">
            {filteredSubjects.map((subj, subjIdx) => (
              <div key={subj.subjectId} className="bg-[#0E172A] border border-slate-800 rounded-2xl p-4 md:p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{subj.icon}</span>
                    <div>
                      <h4 className="text-sm md:text-base font-bold text-white">{subj.subjectName}</h4>
                      {subj.tamilName && <p className="text-xs text-slate-400">{subj.tamilName}</p>}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-bold text-xs font-mono">
                    {subj.chapters.length} Chapters • {subj.totalNanoConcepts || 50}+ Nano Nodes
                  </span>
                </div>

                <div className="space-y-3">
                  {subj.chapters.map((chap, chIdx) => {
                    const chapterKey = `ch_${subjIdx}_${chIdx}`;
                    const isExpanded = expandedChapters[chapterKey] !== false;
                    const isUnlocked = isPurchased || chap.isFreePreview || chIdx === 0;

                    return (
                      <div
                        key={chIdx}
                        className={`rounded-xl border transition overflow-hidden ${
                          isUnlocked ? 'bg-[#131F37] border-slate-800' : 'bg-[#131F37]/60 border-amber-500/30'
                        }`}
                      >
                        <button
                          onClick={() => toggleChapter(chapterKey)}
                          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/40 transition"
                        >
                          <div className="flex-1 pr-4">
                            <div className="flex items-center gap-2 mb-1.5">
                              {chap.unitNumber && (
                                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                                  {chap.unitNumber}
                                </span>
                              )}
                              {chap.term && (
                                <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-bold text-[10px]">
                                  {chap.term}
                                </span>
                              )}
                              {isUnlocked ? (
                                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> {isPurchased ? 'Full Access' : 'Free Preview'}
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold text-[10px] flex items-center gap-1">
                                  <Lock className="w-3 h-3" /> Locked
                                </span>
                              )}
                            </div>
                            <h5 className="text-sm font-bold text-white">
                              Chapter {chap.chapterNumber}: {chap.chapterTitle}
                            </h5>
                            {chap.tamilTitle && <p className="text-xs text-slate-400 mt-0.5">{chap.tamilTitle}</p>}
                            {chap.description && (
                              <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">{chap.description}</p>
                            )}
                          </div>
                          <div className="text-slate-400">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="p-4 pt-0 border-t border-slate-800/80 space-y-4 mt-2">
                            {isUnlocked ? (
                              chap.topics.map((top, tIdx) => {
                                const topicKey = `top_${subjIdx}_${chIdx}_${tIdx}`;
                                const isTopicNanoExpanded = expandedTopics[topicKey] !== false;
                                const nanoList = top.nanoConcepts || [];

                                return (
                                  <div key={top.id || tIdx} className="bg-[#0E172A] border border-slate-800 rounded-xl p-4 space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex items-start gap-2.5">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                                        <div>
                                          <div className="flex items-center gap-2 mb-1">
                                            {top.topicCode && (
                                              <span className="px-2 py-0.5 rounded bg-sky-500/15 text-sky-400 font-mono font-bold text-[10px]">
                                                {top.topicCode}
                                              </span>
                                            )}
                                            {top.estimatedMinutes && (
                                              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {top.estimatedMinutes}m
                                              </span>
                                            )}
                                          </div>
                                          <div className="text-sm font-bold text-white">{top.title}</div>
                                          {top.tamilTitle && <div className="text-xs text-slate-400 mt-0.5">{top.tamilTitle}</div>}
                                        </div>
                                      </div>
                                      <span className="px-2 py-0.5 rounded bg-slate-800 text-sky-400 text-[10px] font-bold shrink-0">
                                        {top.importance}
                                      </span>
                                    </div>

                                    {(top.marksWeightage || top.questionArchetype) && (
                                      <div className="flex flex-wrap items-center gap-2">
                                        {top.marksWeightage && (
                                          <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-xs font-bold flex items-center gap-1">
                                            <Target className="w-3 h-3" /> {top.marksWeightage}
                                          </span>
                                        )}
                                        {top.questionArchetype && (
                                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs">
                                            📝 {top.questionArchetype}
                                          </span>
                                        )}
                                      </div>
                                    )}

                                    {(top.keyFormula || top.keyAxiomOrLaw) && (
                                      <div className="bg-[#131F37] border border-sky-500/30 rounded-lg p-2.5 text-xs">
                                        <span className="text-[9px] font-extrabold text-sky-400 block uppercase tracking-wider">
                                          GOVT NORMS KEY AXIOM / FORMULA:
                                        </span>
                                        <span className="text-slate-200 font-mono text-[11px] block mt-0.5">
                                          {top.keyFormula || top.keyAxiomOrLaw}
                                        </span>
                                      </div>
                                    )}

                                    {/* Nano-Granular Concept Nodes Section */}
                                    {nanoList.length > 0 && (
                                      <div className="bg-[#080D1A] border border-slate-800 rounded-xl overflow-hidden mt-2">
                                        <button
                                          onClick={() => toggleTopicNano(topicKey)}
                                          className="w-full p-2.5 px-3 bg-[#131F37] flex items-center justify-between text-left text-xs font-bold text-sky-400 hover:bg-slate-800 transition"
                                        >
                                          <span className="flex items-center gap-2">
                                            <Layers className="w-3.5 h-3.5 text-sky-400" />
                                            Nano-Granular Concepts ({nanoList.length} Nodes)
                                          </span>
                                          {isTopicNanoExpanded ? (
                                            <ChevronUp className="w-3.5 h-3.5" />
                                          ) : (
                                            <ChevronDown className="w-3.5 h-3.5" />
                                          )}
                                        </button>

                                        {isTopicNanoExpanded && (
                                          <div className="p-3 space-y-3">
                                            {nanoList.map((nano, nIdx) => (
                                              <div key={nano.id || nIdx} className="bg-[#0E172A] border border-slate-800/80 rounded-xl p-3 space-y-2">
                                                <div className="flex items-start justify-between gap-2">
                                                  <div>
                                                    <div className="flex items-center gap-2">
                                                      <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 font-mono font-bold text-[9px]">
                                                        {nano.conceptCode}
                                                      </span>
                                                      <span className="text-xs font-bold text-white">{nano.name}</span>
                                                    </div>
                                                    {nano.tamilName && (
                                                      <div className="text-[11px] text-slate-400 mt-0.5">{nano.tamilName}</div>
                                                    )}
                                                  </div>
                                                  {nano.questionType && (
                                                    <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-bold text-[10px]">
                                                      {nano.questionType}
                                                    </span>
                                                  )}
                                                </div>

                                                <p className="text-xs text-slate-400">{nano.description}</p>

                                                {nano.keyRuleOrFormula && (
                                                  <div className="bg-[#131F37] p-2 rounded-lg text-xs space-y-0.5">
                                                    <span className="text-[9px] font-bold text-emerald-400 uppercase">
                                                      EXACT RULE / FORMULA:
                                                    </span>
                                                    <div className="font-mono text-slate-200 text-[11px]">
                                                      {nano.keyRuleOrFormula}
                                                    </div>
                                                  </div>
                                                )}

                                                {nano.solvedExampleOrLaw && (
                                                  <div className="bg-[#131F37] p-2 rounded-lg text-xs space-y-0.5">
                                                    <span className="text-[9px] font-bold text-amber-400 uppercase">
                                                      MODEL APPLICATION / DERIVATION:
                                                    </span>
                                                    <div className="text-slate-300 text-[11px]">
                                                      {nano.solvedExampleOrLaw}
                                                    </div>
                                                  </div>
                                                )}

                                                {/* Direct Launch AI Nano Lesson button */}
                                                <button
                                                  onClick={() => onLaunchNanoPlayer && onLaunchNanoPlayer(nano, top, subj.subjectName, 'lecture')}
                                                  className="w-full py-1.5 bg-[#00D084] hover:bg-[#00B774] text-[#070C18] font-black text-xs rounded-lg flex items-center justify-center gap-1.5 shadow transition mt-2"
                                                >
                                                  <Sparkles className="w-3.5 h-3.5" />
                                                  <span>Launch AI Nano Lesson ({nano.conceptCode})</span>
                                                </button>

                                                {nano.pyqReferences && nano.pyqReferences.length > 0 && (
                                                  <div className="text-[10px] text-amber-400 font-medium">
                                                    🎯 Official PYQ: {nano.pyqReferences.join(' • ')}
                                                  </div>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    <div className="flex items-center gap-2 pt-1">
                                      {top.hasVideo && (
                                        <span className="px-2.5 py-1 rounded bg-slate-800 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                                          <Play className="w-3 h-3" /> Video Class
                                        </span>
                                      )}
                                      {top.hasNotes && (
                                        <span className="px-2.5 py-1 rounded bg-slate-800 text-sky-400 text-[10px] font-bold flex items-center gap-1">
                                          <FileText className="w-3 h-3" /> Notes Deck
                                        </span>
                                      )}
                                      {top.hasQuiz && (
                                        <span className="px-2.5 py-1 rounded bg-amber-500/15 text-amber-400 text-[10px] font-bold flex items-center gap-1">
                                          <Award className="w-3 h-3" /> Topic CBT Drill
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="bg-[#0E172A] rounded-xl p-6 text-center space-y-2">
                                <Lock className="w-6 h-6 text-amber-400 mx-auto" />
                                <div className="text-sm font-bold text-white">This Chapter is Locked in Free Preview</div>
                                <p className="text-xs text-slate-400 max-w-md mx-auto">
                                  Purchase this course or activate TutO Pass Pro to unlock all {chap.topicsCount} detailed micro-topics, nano-concept nodes, video lectures, and official tests.
                                </p>
                                <button
                                  onClick={onUnlockCourse}
                                  className="mt-3 px-5 py-2 bg-[#00D084] hover:bg-[#00B774] text-[#070C18] text-xs font-black rounded-xl shadow-lg transition"
                                >
                                  Unlock Complete Syllabus (₹199)
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Sticky Unlock Footer */}
        {!isPurchased && (
          <div className="p-4 md:p-5 bg-[#0E172A] border-t border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                FULL COURSE & NANO-GRANULAR SYLLABUS UNLOCK
              </div>
              <div className="text-base font-black text-emerald-400">₹199 / 1-Year Pass Pro</div>
            </div>
            <button
              onClick={onUnlockCourse}
              className="px-6 py-2.5 bg-[#00D084] hover:bg-[#00B774] text-[#070C18] text-xs font-black rounded-xl shadow-lg flex items-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4" /> Instant Unlock with UPI / QR
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
