'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  Copy,
  X,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  BookOpen,
  HelpCircle,
  Sparkles,
  Moon,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Award,
  Video,
  FileText,
  ClipboardList,
  Calculator,
  Image as ImageIcon,
  HardDrive,
} from 'lucide-react';
import { loadCoursePlayerContent, CoursePlayerContent } from '@/lib/coursePlayerEngine';
import { resolveAuthenticEducationalVideo } from '@/data/curriculum/educationalVideoRegistry';
import { getStepAiPrompt } from '@/data/curriculum';
import { TaskVideoFeedbackWebModal } from './TaskVideoFeedbackWebModal';

interface TeachOCoursePlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicTitle: string;
  subject: string;
  courseTitle: string;
  courseId: string;
  dayNumber: number;
  taskNumber?: number;
  onComplete?: (xp: number) => void;
}

export const TeachOCoursePlayerModal: React.FC<TeachOCoursePlayerModalProps> = ({
  isOpen,
  onClose,
  topicTitle,
  subject,
  courseTitle,
  courseId,
  dayNumber,
  taskNumber,
  onComplete,
}) => {
  const [content, setContent] = useState<CoursePlayerContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'notes' | 'flashcards' | 'quiz' | 'bookback' | 'solved' | 'diagrams' | 'recap'>('notes');
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [isVideoFeedbackOpen, setIsVideoFeedbackOpen] = useState(false);

  
  
  const handleCopyAiPrompt = () => {
    const prompt = getStepAiPrompt(courseId || courseTitle, dayNumber, taskNumber || 1);
    if (prompt && navigator.clipboard) {
      navigator.clipboard.writeText(prompt);
      alert('AI Generation Prompt copied to clipboard! 📋');
    }
  };

  const handleContactAdminWhatsApp = () => {
    const adminPhone = '919486335870';
    const msg = `🎓 *SuprO TutO — Course Guide Support & Verification*\n\n👤 *Student:* Enrolled Scholar\n📚 *Course:* *${courseTitle || 'Tuition Course'}* (Day ${dayNumber || 1})\n📌 *Subject:* *${subject || 'Core Subject'}*\n📖 *Topic / Task:* *${topicTitle || 'Lesson'}*\n\nPlease provide guidance and verify my daily learning task submission.\n\nThank you! 🙏`;
    const webLink = `https://wa.me/${adminPhone}?text=${encodeURIComponent(msg)}`;
    window.open(webLink, '_blank');
  };

  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    setLoading(true);
    setCurrentFlashcardIndex(0);
    setIsCardFlipped(false);
    setSelectedAnswers({});
    setIsCompleted(false);

    loadCoursePlayerContent(topicTitle, subject, courseTitle, dayNumber, courseId, taskNumber)
      .then(res => {
        if (mounted) {
          setContent(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isOpen, topicTitle, subject, courseTitle, dayNumber, courseId, taskNumber]);

  if (!isOpen) return null;

  const rawVideoId = content?.videoMeta?.youtubeVideoId;
  const isVideoValid = rawVideoId && rawVideoId !== '0TgLtF3PMOc' && rawVideoId !== 'xqgCwgvInDU' && rawVideoId !== '2p8x9K4jW7Q' && rawVideoId !== 'LgCg_1yP6_M';
  const registryVideo = !isVideoValid ? resolveAuthenticEducationalVideo(courseId || courseTitle, subject, topicTitle) : null;
  const videoId = isVideoValid ? rawVideoId : (registryVideo?.youtubeVideoId || 'EpdTHQ0s6oM');
  const videoTitle = content?.videoMeta?.videoTitle || registryVideo?.videoTitle || topicTitle;

  const handlePlayPause = () => {
    if (!iframeRef.current?.contentWindow) return;
    const action = isPlaying ? 'pauseVideo' : 'playVideo';
    iframeRef.current.contentWindow.postMessage(
      JSON.stringify({ event: 'command', func: action, args: [] }),
      '*'
    );
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    if (!iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(
      JSON.stringify({ event: 'command', func: 'seekTo', args: [0, true] }),
      '*'
    );
    iframeRef.current.contentWindow.postMessage(
      JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
      '*'
    );
    setIsPlaying(true);
  };

  const handleSelectAnswer = (qIndex: number, optionIndex: number) => {
    if (selectedAnswers[qIndex] !== undefined) return;
    setSelectedAnswers(prev => ({ ...prev, [qIndex]: optionIndex }));
  };

  const handleClaimCompletion = () => {
    setIsCompleted(true);
    if (onComplete) onComplete(content?.xpReward || 20);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 md:p-6 animate-in fade-in duration-200">
      <div className="bg-[#0b1120] border border-slate-800 rounded-3xl w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Top Header Bar */}
        <div className="px-6 py-4 bg-[#111827] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono">
              DAY {dayNumber}
            </span>
            <div>
              <h3 className="text-sm md:text-base font-bold text-white line-clamp-1">{topicTitle}</h3>
              <p className="text-[11px] text-slate-400 font-medium">{subject} • {courseTitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
              <Award className="w-3.5 h-3.5" /> +20 XP
            </span>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Layout Grid (Video on Top, Tabs below or Side-by-Side on Desktop) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Column: Video & Media Controls */}
          <div className="w-full md:w-5/12 bg-black border-r border-slate-800 flex flex-col">
            <div className="relative aspect-video w-full bg-slate-950">
              <iframe
                ref={iframeRef}
                src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1&rel=0&modestbranding=1`}
                title={videoTitle}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            {/* Video Control Bar */}
            <div className="p-4 bg-[#0d1527] border-t border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePlayPause}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
                <button
                  onClick={handleRestart}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Replay
                </button>
              </div>

              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                <Video className="w-3.5 h-3.5 text-emerald-400" /> HD Masterclass
              </span>
            </div>

            {/* Quick Overview in Video Panel */}
            <div className="p-4 overflow-y-auto flex-1 text-xs text-slate-300 space-y-3 bg-[#080d1a]">
              <div className="p-3 bg-[#111827] border border-slate-800 rounded-2xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                  Video Anchor & Topic Focus
                </span>
                <p className="font-semibold text-white">{videoTitle}</p>
                <p className="text-slate-400 mt-1 text-[11px] leading-relaxed">
                  {content?.notes?.overview || 'Master key concepts with interactive step-by-step notes and exam-oriented drills.'}
                </p>
              </div>

              {content?.notes?.keyPoints && content.notes.keyPoints.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Key Highlights
                  </span>
                  {content.notes.keyPoints.slice(0, 3).map((kp, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-300">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{kp}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Interactive Kindle Tabs */}
          <div className="w-full md:w-7/12 flex flex-col bg-[#0b1120] overflow-hidden">
            
            {/* Interactive Module Tabs */}
            <div className="flex border-b border-slate-800 px-4 bg-[#111827] overflow-x-auto scrollbar-none">
              {[
                { id: 'notes', label: 'Study Notes', icon: BookOpen },
                { id: 'flashcards', label: 'Flashcards', icon: Sparkles },
                { id: 'quiz', label: 'Practice Quiz', icon: HelpCircle },
                { id: 'bookback', label: 'Book-Back Q&A', icon: ClipboardList },
                { id: 'solved', label: 'Solved Problems', icon: Calculator },
                { id: 'diagrams', label: 'Diagrams', icon: ImageIcon },
                { id: 'recap', label: 'Bedtime Recap', icon: Moon },
              ].map(t => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={`px-4 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
                      activeTab === t.id
                        ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                        : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-5">
              
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center space-y-3 py-16 text-center">
                  <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                  <p className="text-xs text-slate-400 font-medium">
                    Loading authentic curriculum content from Supabase...
                  </p>
                </div>
              ) : (
                <>
                  {/* TAB 1: STUDY NOTES */}

                      {/* 💬 WhatsApp Topic Notes Support */}
                      <div className="p-4 rounded-2xl bg-[#111827] border border-emerald-500/30 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <MessageCircle className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white">Need Additional Notes or Doubt Clarification?</h4>
                            <p className="text-[11px] text-slate-400">Chat directly with our academic desk on WhatsApp with this prefilled topic.</p>
                          </div>
                        </div>
                        <button
                          onClick={handleContactAdminWhatsApp}
                          className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Chat with Mentor on WhatsApp
                        </button>
                      </div>
  
                  {activeTab === 'notes' && (
                    <div className="space-y-4">
                      {/* Overview Block */}
                      {(content?.notes?.overview || (content as any)?.overview) && (
                        <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 text-xs leading-relaxed text-slate-200 space-y-1">
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                            Lesson Concept Overview
                          </span>
                          <p>{content?.notes?.overview || (content as any)?.overview}</p>
                        </div>
                      )}

                      {/* 🌟 Colloquial Tamil & Real-World Everyday Analogy */}
                      {((content as any)?.tamilExplanation || content?.notes?.bilingualExplanation?.tamil) && (
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#131f24] to-[#0f172a] border border-amber-500/30 text-xs leading-relaxed space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] uppercase tracking-wider">
                              🌟 எளிய தமிழ் விளக்கம் & நடைமுறை உதாரணம்
                            </span>
                          </div>
                          {(content as any)?.tamilExplanation?.colloquialIntro && (
                            <p className="text-amber-100 font-medium leading-relaxed">
                              {(content as any).tamilExplanation.colloquialIntro}
                            </p>
                          )}
                          {(content as any)?.tamilExplanation?.everydayAnalogy && (
                            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-amber-200">
                              <span className="font-bold text-[11px] block mb-1">💡 நிஜ வாழ்க்கை உதாரணம் (Everyday Analogy):</span>
                              {(content as any).tamilExplanation.everydayAnalogy}
                            </div>
                          )}
                          {content?.notes?.bilingualExplanation?.tamil && !(content as any)?.tamilExplanation && (
                            <p className="text-slate-200">{content.notes.bilingualExplanation.tamil}</p>
                          )}
                        </div>
                      )}

                      {/* Core Concept Breakdown Sections */}
                      {content?.notes?.coreConcepts && content.notes.coreConcepts.map((sec, sIdx) => {
                        const bodyText = sec.body || (sec as any).content || content?.notes?.overview || '';
                        const exampleText = sec.formulaOrExample || (sec as any).example || '';
                        return (
                          <div key={sIdx} className="p-4 rounded-2xl bg-[#111827] border border-slate-800 space-y-2">
                            <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-400" />
                              {sec.heading}
                            </h4>
                            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{bodyText}</p>
                            {exampleText && (
                              <div className="mt-2 p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-emerald-300 font-mono text-[11px]">
                                💡 {exampleText}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Formulas & Shortcuts */}
                      {content?.notes?.formulasAndShortcuts && content.notes.formulasAndShortcuts.length > 0 && (
                        <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 space-y-2">
                          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                            Key Formulas & Fast Shortcuts
                          </h4>
                          <div className="space-y-2">
                            {content.notes.formulasAndShortcuts.map((f, fIdx) => (
                              <div key={fIdx} className="p-2.5 rounded-xl bg-[#080d1a] border border-slate-800 flex flex-col gap-1">
                                <span className="text-xs font-bold text-white">{f.name}</span>
                                <span className="font-mono text-emerald-400 text-xs">{f.formula}</span>
                                {(f.tip || (f as any).mnemonic) && <span className="text-[10px] text-slate-400">💡 {f.tip || (f as any).mnemonic}</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: FLASHCARDS */}
                  {activeTab === 'flashcards' && (
                    <div className="h-full flex flex-col items-center justify-center space-y-6 py-6">
                      {content?.oneLineQnA && content.oneLineQnA.length > 0 ? (
                        <>
                          <div
                            onClick={() => setIsCardFlipped(!isCardFlipped)}
                            className="w-full max-w-md min-h-[220px] p-8 rounded-3xl bg-gradient-to-br from-[#111827] via-[#0f172a] to-[#080d1a] border border-emerald-500/40 shadow-xl flex flex-col justify-between cursor-pointer transition transform hover:scale-[1.02] text-center"
                          >
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                              {isCardFlipped ? 'Answer & Explanation' : 'Concept Question'} (Card {currentFlashcardIndex + 1}/{content.oneLineQnA.length})
                            </span>

                            <div className="my-auto py-4">
                              <p className="text-base md:text-lg font-bold text-white leading-relaxed">
                                {isCardFlipped
                                  ? content.oneLineQnA[currentFlashcardIndex].answer
                                  : content.oneLineQnA[currentFlashcardIndex].question}
                              </p>
                            </div>

                            <span className="text-[10px] text-slate-500">
                              👆 Click anywhere on card to {isCardFlipped ? 'show question' : 'flip answer'}
                            </span>
                          </div>

                          {/* Navigation Buttons */}
                          <div className="flex items-center gap-4">
                            <button
                              disabled={currentFlashcardIndex === 0}
                              onClick={() => {
                                setCurrentFlashcardIndex(prev => prev - 1);
                                setIsCardFlipped(false);
                              }}
                              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-bold text-white flex items-center gap-1 transition"
                            >
                              <ChevronLeft className="w-4 h-4" /> Prev
                            </button>
                            <button
                              disabled={currentFlashcardIndex >= content.oneLineQnA.length - 1}
                              onClick={() => {
                                setCurrentFlashcardIndex(prev => prev + 1);
                                setIsCardFlipped(false);
                              }}
                              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-xs font-bold text-slate-950 flex items-center gap-1 transition"
                            >
                              Next <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="p-8 text-center text-xs text-slate-400">
                          Interactive flashcards are auto-generating for this module.
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: PRACTICE QUIZ (DPQ) */}
                  {activeTab === 'quiz' && (
                    <div className="space-y-6">
                      {content?.mcqs && content.mcqs.length > 0 ? (
                        content.mcqs.map((q, qIdx) => {
                          const selected = selectedAnswers[qIdx];
                          const isAnswered = selected !== undefined;
                          const isCorrect = isAnswered && selected === q.correctIndex;

                          return (
                            <div key={qIdx} className="p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-3">
                              <div className="flex items-start gap-2">
                                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold text-xs">
                                  Q{qIdx + 1}
                                </span>
                                <h4 className="text-xs md:text-sm font-bold text-white leading-relaxed">
                                  {q.question}
                                </h4>
                              </div>

                              {/* Options */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                                {q.options.map((opt, optIdx) => {
                                  let btnStyle = 'bg-[#080d1a] border-slate-800 text-slate-300 hover:border-slate-700';

                                  if (isAnswered) {
                                    if (optIdx === q.correctIndex) {
                                      btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
                                    } else if (selected === optIdx) {
                                      btnStyle = 'bg-red-500/20 border-red-500 text-red-300';
                                    } else {
                                      btnStyle = 'bg-[#080d1a] border-slate-800 text-slate-500 opacity-60';
                                    }
                                  }

                                  return (
                                    <button
                                      key={optIdx}
                                      disabled={isAnswered}
                                      onClick={() => handleSelectAnswer(qIdx, optIdx)}
                                      className={`p-3 rounded-xl border text-left text-xs transition flex items-center justify-between ${btnStyle}`}
                                    >
                                      <span>{opt}</span>
                                      {isAnswered && optIdx === q.correctIndex && (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                                      )}
                                      {isAnswered && selected === optIdx && optIdx !== q.correctIndex && (
                                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0 ml-2" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Explanation Accordion on Answer */}
                              {isAnswered && (
                                <div className="mt-3 p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] leading-relaxed text-slate-300 space-y-1">
                                  <span className={`font-bold block ${isCorrect ? 'text-emerald-400' : 'text-amber-400'}`}>
                                    {isCorrect ? '✓ Correct! Step-by-Step Reason:' : '💡 Solution Breakdown:'}
                                  </span>
                                  <p>{q.explanation}</p>
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-8 text-center text-xs text-slate-400">
                          Quiz problems are compiling for this topic.
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 4: BOOK-BACK Q&A (குறுவினாக்கள் & நெடுவினாக்கள்) */}
                  {activeTab === 'bookback' && (
                    <div className="space-y-5">
                      {/* 2-Mark Short Answers */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                          <ClipboardList className="w-4 h-4" /> 2-Mark Short Answers (குறுவினாக்கள்)
                        </h4>
                        {(content as any)?.bookBackSolutions?.twoMarkShortAnswers?.length > 0 ? (
                          (content as any).bookBackSolutions.twoMarkShortAnswers.map((qa: any, idx: number) => (
                            <div key={idx} className="p-4 rounded-2xl bg-[#111827] border border-slate-800 space-y-2">
                              <div className="flex items-start gap-2">
                                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold text-[10px]">
                                  {qa.marks} Marks
                                </span>
                                <p className="text-xs font-bold text-white leading-relaxed">{qa.question}</p>
                              </div>
                              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-300 leading-relaxed whitespace-pre-line">
                                <span className="text-[10px] font-bold text-emerald-400 block mb-1">📝 Model Answer:</span>
                                {qa.modelAnswer}
                              </div>
                              {qa.keyPoints && (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {qa.keyPoints.map((kp: string, kIdx: number) => (
                                    <span key={kIdx} className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300">
                                      🔑 {kp}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 text-xs text-slate-400">
                            {content?.twoMarkQuestions?.map((q: any, idx: number) => (
                              <div key={idx} className="mb-4 last:mb-0">
                                <p className="font-bold text-white mb-1">{q.question}</p>
                                <p className="text-emerald-300 whitespace-pre-line">{q.modelAnswer}</p>
                              </div>
                            )) || 'Book-back questions will be generated for this topic.'}
                          </div>
                        )}
                      </div>

                      {/* 5-Mark Essay Answers */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                          <FileText className="w-4 h-4" /> 5-Mark Essay Answers (நெடுவினாக்கள் / விரிவான விடை)
                        </h4>
                        {(content as any)?.bookBackSolutions?.fiveMarkEssayAnswers?.length > 0 ? (
                          (content as any).bookBackSolutions.fiveMarkEssayAnswers.map((qa: any, idx: number) => (
                            <div key={idx} className="p-4 rounded-2xl bg-[#111827] border border-slate-800 space-y-3">
                              <div className="flex items-start gap-2">
                                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold text-[10px]">
                                  {qa.marks} Marks
                                </span>
                                <p className="text-xs font-bold text-white leading-relaxed">{qa.question}</p>
                              </div>
                              {qa.structuredOutline && (
                                <div className="flex flex-wrap gap-1.5">
                                  {qa.structuredOutline.map((point: string, pIdx: number) => (
                                    <span key={pIdx} className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] text-purple-300">
                                      {pIdx + 1}. {point}
                                    </span>
                                  ))}
                                </div>
                              )}
                              <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                                <span className="text-[10px] font-bold text-purple-400 block mb-1">📖 Model Essay Answer:</span>
                                {qa.modelAnswer}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 text-xs text-slate-400">
                            {content?.fiveMarkQuestions?.map((q: any, idx: number) => (
                              <div key={idx} className="mb-4 last:mb-0">
                                <p className="font-bold text-white mb-1">{q.question}</p>
                                {q.stepByStepSolution?.map((step: string, sIdx: number) => (
                                  <p key={sIdx} className="text-emerald-300 ml-2">• {step}</p>
                                ))}
                              </div>
                            )) || 'Essay answers will be generated for this topic.'}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 5: STEP-BY-STEP SOLVED PROBLEMS */}
                  {activeTab === 'solved' && (
                    <div className="space-y-5">
                      <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                        <Calculator className="w-4 h-4" /> Step-by-Step Solved Problems (படிப்படியான தீர்வு)
                      </h4>
                      {(content as any)?.solvedProblems?.length > 0 ? (
                        (content as any).solvedProblems.map((prob: any, idx: number) => (
                          <div key={idx} className="p-4 rounded-2xl bg-[#111827] border border-slate-800 space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2">
                                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-bold text-[10px] whitespace-nowrap">
                                  Problem {idx + 1}
                                </span>
                                <p className="text-xs font-bold text-white leading-relaxed">{prob.problemStatement}</p>
                              </div>
                              {prob.difficulty && (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                                  prob.difficulty === 'Challenge' ? 'bg-red-500/20 text-red-400' :
                                  prob.difficulty === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                                  'bg-emerald-500/20 text-emerald-400'
                                }`}>
                                  {prob.difficulty}
                                </span>
                              )}
                            </div>
                            <div className="space-y-2">
                              {prob.steps?.map((step: string, sIdx: number) => (
                                <div key={sIdx} className="flex items-start gap-2 p-2 rounded-xl bg-[#080d1a] border border-slate-800">
                                  <span className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-[10px] font-bold text-cyan-400 shrink-0">
                                    {sIdx + 1}
                                  </span>
                                  <p className="text-xs text-slate-300 leading-relaxed">{step}</p>
                                </div>
                              ))}
                            </div>
                            <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs">
                              <span className="text-[10px] font-bold text-cyan-400 block mb-1">✅ Answer:</span>
                              <p className="text-white font-medium">{prob.answer}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 text-xs text-slate-400 text-center">
                          Solved problem sets will be populated for this topic upon content enrichment.
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 6: DIAGRAMS & VISUAL MEMORIZATION MNEMONICS */}
                  {activeTab === 'diagrams' && (
                    <div className="space-y-5">
                      <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" /> Diagrams & Visual Memorization (வரைபடங்கள் & நினைவு உத்திகள்)
                      </h4>
                      {(content as any)?.diagramsAndVisuals ? (
                        <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-4">
                          <h5 className="text-sm font-bold text-white">{(content as any).diagramsAndVisuals.diagramTitle}</h5>
                          <p className="text-xs text-slate-300 leading-relaxed">{(content as any).diagramsAndVisuals.diagramDescription}</p>
                          
                          {/* Key Labels as Visual Cards */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {(content as any).diagramsAndVisuals.keyLabels?.map((label: string, lIdx: number) => (
                              <div key={lIdx} className="p-3 rounded-xl bg-gradient-to-r from-rose-950/30 to-[#080d1a] border border-rose-500/20 text-xs text-white font-medium">
                                {label}
                              </div>
                            ))}
                          </div>

                          {/* Mnemonic Trick */}
                          {(content as any).diagramsAndVisuals.mnemonicTrick && (
                            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/20 text-xs">
                              <span className="text-[10px] font-bold text-amber-400 block mb-1">🧠 Memory Trick (நினைவு உத்தி):</span>
                              <p className="text-amber-200 leading-relaxed">{(content as any).diagramsAndVisuals.mnemonicTrick}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 text-xs text-slate-400 text-center space-y-2">
                          <ImageIcon className="w-8 h-8 mx-auto text-slate-600" />
                          <p>Diagram and visual memorization aids will be generated for this topic.</p>
                        </div>
                      )}

                      {/* AI Doubt Solver Prompt */}
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 to-[#111827] border border-indigo-500/30 space-y-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-indigo-400" />
                          <span className="text-xs font-bold text-indigo-400">Live AI Doubt Solver</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          🤖 Ask TeachO AI: &quot;இதை எனக்கு இன்னும் எளிமையாக விளக்கு&quot; (Explain this even simpler to me)
                        </p>
                        <p className="text-[10px] text-slate-500">
                          The Gemini AI chat integration is active in TeachO Studio for real-time doubt resolution.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* TAB 7: BEDTIME RECAP */}
                  {activeTab === 'recap' && (
                    <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-[#111827] to-[#080d1a] border border-indigo-500/30 shadow-xl space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                          <Moon className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                            Daily Parent & Student 1-Minute Summary
                          </span>
                          <h4 className="text-base font-bold text-white">Day {dayNumber} Bedtime Recap</h4>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#080d1a]/80 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-3">
                        <p>
                          📌 <strong>What We Mastered Today:</strong> {topicTitle} ({subject})
                        </p>
                        <p>
                          {content?.notes?.overview || 'Completed core foundation notes, interactive flashcard drills, and concept practice questions.'}
                        </p>
                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                          <span>Target Time: ~20 Minutes</span>
                          <span className="text-emerald-400 font-bold">100% Curriculum Aligned</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Bottom Complete & Claim XP Footer */}
            <div className="p-4 bg-[#111827] border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Day {dayNumber} Interactive Study Complete</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsVideoFeedbackOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 border border-sky-500/30 font-bold text-xs flex items-center gap-1.5 transition shadow-lg"
                >
                  <Video className="w-4 h-4" />
                  <span>Record Video Feedback</span>
                </button>

                <a
                  href={`/testo?courseId=${courseId || ''}&topic=${encodeURIComponent(topicTitle)}&subject=${encodeURIComponent(subject)}&day=${dayNumber}`}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-amber-500/20"
                >
                  <Award className="w-4 h-4" />
                  <span>Take Test in TestO</span>
                </a>

                <button
                  onClick={handleClaimCompletion}
                  disabled={isCompleted}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
                >
                  <Award className="w-4 h-4" />
                  {isCompleted ? '✓ Completed!' : 'Mark Completed (+20 XP)'}
                </button>
              </div>
            </div>

            {/* Google Drive Task Video Recording & Feedback Modal */}
            <TaskVideoFeedbackWebModal
              isOpen={isVideoFeedbackOpen}
              onClose={() => setIsVideoFeedbackOpen(false)}
              courseId={courseId}
              courseTitle={courseTitle}
              dayNumber={dayNumber}
              topicTitle={topicTitle}
              onSubmitted={(earnedXp) => {
                onComplete?.(earnedXp);
              }}
            />

          </div>
        </div>

      </div>
    </div>
  );
};
