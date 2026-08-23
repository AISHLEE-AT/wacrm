'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  Sparkles,
  Bot,
  PlayCircle,
  Eye,
  EyeOff,
  Flame,
  ArrowRight,
} from 'lucide-react';
import {
  searchCurriculumContent,
  searchMcqQuestions,
  ContentSearchResult,
  McqSearchResult,
  POPULAR_KEYWORDS,
} from '@/lib/teachoSearchService';

interface TeachOSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectContent: (item: ContentSearchResult) => void;
  onOpenTestO: (topicTitle: string, courseTitle?: string) => void;
  onAskAi: (topicTitle: string) => void;
}

export const TeachOSearchModal: React.FC<TeachOSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectContent,
  onOpenTestO,
  onAskAi,
}) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'content' | 'mcq'>('content');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});

  const [contentResults, setContentResults] = useState<ContentSearchResult[]>([]);
  const [mcqResults, setMcqResults] = useState<McqSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setContentResults([]);
      searchMcqQuestions('', selectedCategory).then(setMcqResults);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      const cRes = searchCurriculumContent(query, selectedCategory);
      setContentResults(cRes);

      const mRes = await searchMcqQuestions(query, selectedCategory);
      setMcqResults(mRes);

      setIsSearching(false);
    }, 180);

    return () => clearTimeout(timer);
  }, [query, selectedCategory]);

  if (!isOpen) return null;

  const toggleRevealAnswer = (id: string) => {
    setRevealedAnswers((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const categories = [
    { id: 'all', label: 'All Subjects' },
    { id: 'tamil', label: 'தமிழ் (Tamil)' },
    { id: 'maths', label: 'Maths' },
    { id: 'science', label: 'Science' },
    { id: 'polity', label: 'Polity & GK' },
    { id: 'school', label: 'School 1-12' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Search Box */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-[#0B1120]">
          <div className="relative flex-1 flex items-center">
            <Search className="absolute left-3 w-5 h-5 text-cyan-400" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search concepts, chapters, formulas, or MCQs across all 96+ syllabi..."
              className="w-full pl-10 pr-10 py-3 bg-[#131b2e] border border-slate-700 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-[#0c1222]">
          <button
            onClick={() => setActiveTab('content')}
            className={"flex-1 py-3 px-4 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-all " + (
              activeTab === 'content'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            )}
          >
            <BookOpen className="w-4 h-4" />
            <span>Curriculum & Lessons {contentResults.length > 0 ? "(" + contentResults.length + ")" : ""}</span>
          </button>
          <button
            onClick={() => setActiveTab('mcq')}
            className={"flex-1 py-3 px-4 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-all " + (
              activeTab === 'mcq'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            )}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Question Bank & MCQs {mcqResults.length > 0 ? "(" + mcqResults.length + ")" : ""}</span>
          </button>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 p-3 overflow-x-auto border-b border-slate-800 bg-[#090d16] text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={"px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all " + (
                selectedCategory === cat.id
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Scrollable Results Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#090d16]">
          {isSearching && (
            <div className="flex items-center justify-center py-10 gap-3 text-cyan-400">
              <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">Searching curriculum and question bank database...</span>
            </div>
          )}

          {/* Popular Search Suggestions */}
          {!isSearching && !query.trim() && (
            <div className="p-4 rounded-xl bg-[#131b2e] border border-slate-800">
              <div className="flex items-center gap-2 mb-3 text-amber-400 font-semibold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Popular Academic & Exam Keywords</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {POPULAR_KEYWORDS.map((kw, i) => (
                  <button
                    key={i}
                    onClick={() => setQuery(kw)}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 text-xs font-medium transition-all"
                  >
                    {kw}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 1: CURRICULUM CONTENT */}
          {activeTab === 'content' && !isSearching && (
            <div className="space-y-3">
              {query.trim() && contentResults.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No curriculum content found matching "{query}"</p>
                </div>
              )}

              {contentResults.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-4 rounded-xl bg-[#131b2e] border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 text-xs font-bold">
                      {item.subject}
                    </span>
                    <span className="text-xs text-slate-400 truncate max-w-xs">{item.courseTitle}</span>
                  </div>

                  <div>
                    <h4 className="text-xs font-medium text-slate-400">{item.chapterTitle}</h4>
                    <h3 className="text-base font-bold text-white mt-0.5">{item.topicTitle}</h3>
                  </div>

                  {(item.keyAxiom || item.keyFormulaOrLaw || item.subtopic) && (
                    <div className="p-2.5 rounded-lg bg-[#0c1222] border-l-2 border-cyan-400 text-xs text-slate-300">
                      {item.keyAxiom || item.keyFormulaOrLaw || item.subtopic}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        onClose();
                        onSelectContent(item);
                      }}
                      className="flex-1 py-2 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>Open Lesson</span>
                    </button>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenTestO(item.topicTitle, item.courseTitle);
                      }}
                      className="flex-1 py-2 px-3 rounded-lg bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500/30 text-emerald-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Test in TestO</span>
                    </button>
                    <button
                      onClick={() => {
                        onClose();
                        onAskAi(item.topicTitle);
                      }}
                      className="py-2 px-3 rounded-lg bg-purple-500/20 border border-purple-500/30 hover:bg-purple-500/30 text-purple-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span>AI Doubt</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: QUESTION BANK MCQS */}
          {activeTab === 'mcq' && !isSearching && (
            <div className="space-y-3">
              {query.trim() && mcqResults.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <HelpCircle className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No MCQs found matching "{query}"</p>
                </div>
              )}

              {mcqResults.map((mcq, qIdx) => {
                const isRevealed = Boolean(revealedAnswers[mcq.id]);
                return (
                  <div
                    key={mcq.id || qIdx}
                    className="p-4 rounded-xl bg-[#131b2e] border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                        {mcq.subject}
                      </span>
                      {mcq.examTag && (
                        <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-300 rounded">
                          {mcq.examTag}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-white">
                        <span className="text-cyan-400 font-bold mr-1.5">Q{qIdx + 1}:</span>
                        {mcq.question}
                      </h4>
                      {mcq.question_ta && (
                        <p className="text-xs text-slate-400 italic">{mcq.question_ta}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      {mcq.options.map((opt, oIdx) => {
                        const isCorrect =
                          isRevealed &&
                          (oIdx === mcq.correctIndex || opt === mcq.answer || opt.startsWith(mcq.answer));
                        return (
                          <div
                            key={oIdx}
                            className={"p-2.5 rounded-lg border flex items-center justify-between transition-all " + (
                              isCorrect
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                                : 'bg-[#0c1222] border-slate-800 text-slate-300'
                            )}
                          >
                            <span>{opt}</span>
                            {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                          </div>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => toggleRevealAnswer(mcq.id)}
                      className={"w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all " + (
                        isRevealed
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      )}
                    >
                      {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{isRevealed ? 'Hide Answer & Explanation' : 'Reveal Correct Answer & Steps'}</span>
                    </button>

                    {isRevealed && (
                      <div className="p-3 rounded-lg bg-[#0c1222] border-l-2 border-emerald-400 space-y-1">
                        <div className="text-xs font-bold text-emerald-400">✓ Model Solution & Concept:</div>
                        <p className="text-xs text-slate-300 leading-relaxed">{mcq.explanation}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => {
                          onClose();
                          onOpenTestO(mcq.topicTitle, mcq.courseTitle);
                        }}
                        className="flex-1 py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Launch CBT Exam on this Topic</span>
                      </button>
                      <button
                        onClick={() => {
                          onClose();
                          onAskAi("Please explain this question: " + mcq.question);
                        }}
                        className="py-2 px-3 rounded-lg bg-purple-500/20 border border-purple-500/30 hover:bg-purple-500/30 text-purple-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Bot className="w-3.5 h-3.5" />
                        <span>AI Tutor</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
