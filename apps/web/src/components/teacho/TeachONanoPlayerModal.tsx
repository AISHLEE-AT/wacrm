'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  FileText,
  Award,
  Sparkles,
  Zap,
  Bot,
  Key,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Send,
  HelpCircle,
  Clock,
  Target,
} from 'lucide-react';
import { geminiNanoPlayerEngine, GeneratedNanoLesson } from '@/lib/geminiNanoPlayerEngine';

interface TeachONanoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
  subject: string;
  topicTitle: string;
  tamilTopicTitle?: string;
  conceptCode?: string;
  keyFormulaOrRule?: string;
  dayNumber?: number;
  stepNumber?: number;
  initialTab?: 'lecture' | 'notes' | 'quiz' | 'tutor';
  onCompleteTask?: (earnedXp: number) => void;
}

export const TeachONanoPlayerModal: React.FC<TeachONanoPlayerModalProps> = ({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  subject,
  topicTitle,
  tamilTopicTitle,
  conceptCode,
  keyFormulaOrRule,
  dayNumber = 1,
  stepNumber = 1,
  initialTab = 'lecture',
  onCompleteTask,
}) => {
  const [activeTab, setActiveTab] = useState<'lecture' | 'notes' | 'quiz' | 'tutor'>(initialTab);
  const [loading, setLoading] = useState(true);
  const [lessonContent, setLessonContent] = useState<GeneratedNanoLesson | null>(null);

  // Lecture slide stepper
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);

  // Socratic Chat state
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);

  useEffect(() => {
    if (isOpen && topicTitle) {
      loadContent();
    }
  }, [isOpen, topicTitle, subject, courseId]);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const loadContent = async () => {
    setLoading(true);
    try {
      const data = await geminiNanoPlayerEngine.getOrGenerateNanoContent(
        courseId,
        subject,
        topicTitle,
        tamilTopicTitle,
        conceptCode,
        keyFormulaOrRule
      );
      setLessonContent(data);
      setCurrentSlideIndex(0);
      setSelectedAnswers({});
      setIsQuizSubmitted(false);
      setChatMessages([
        {
          sender: 'ai',
          text: `வணக்கம்! I am your TutO Socratic AI Tutor for ${topicTitle} (${subject}). Ask me anything about this concept, formulas, or how to solve 2/5-mark exam questions!`,
        },
      ]);
    } catch (e) {
      console.warn('Failed to load nano content:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || isSendingChat) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    const updatedHistory = [...chatMessages, { sender: 'user' as const, text: userMsg }];
    setChatMessages(updatedHistory);
    setIsSendingChat(true);

    try {
      const aiReply = await geminiNanoPlayerEngine.askSocraticTutor(
        userMsg,
        topicTitle,
        subject,
        courseTitle,
        undefined,
        updatedHistory
      );
      setChatMessages([...updatedHistory, { sender: 'ai' as const, text: aiReply }]);
    } catch (e) {
      setChatMessages([
        ...updatedHistory,
        {
          sender: 'ai' as const,
          text: `Great question! In ${topicTitle}, make sure to remember the core formula: ${keyFormulaOrRule || 'standard rule'}.`,
        },
      ]);
    } finally {
      setIsSendingChat(false);
    }
  };

  const handleSelectQuizOption = (questionIndex: number, optionIndex: number) => {
    if (isQuizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const calculateQuizScore = () => {
    if (!lessonContent?.quizQuestions) return 0;
    let score = 0;
    lessonContent.quizQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        score++;
      }
    });
    return score;
  };

  const handleCompleteAndEarn = () => {
    const earnedXp = 50 + (isQuizSubmitted ? calculateQuizScore() * 15 : 25);
    if (onCompleteTask) {
      onCompleteTask(earnedXp);
    }
    alert(`Task Completed! 🎉\nYou mastered ${conceptCode || topicTitle} and earned +${earnedXp} XP!`);
    onClose();
  };

  if (!isOpen) return null;

  const slides = lessonContent?.lectureSlides || [];
  const currentSlide = slides[currentSlideIndex];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-200">
      <div className="bg-[#0b1120] border border-slate-800 rounded-3xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="p-4 md:p-5 bg-[#0E172A] border-b border-slate-800 flex items-center justify-between">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-1.5">
              {conceptCode && (
                <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-mono font-bold text-[10px]">
                  {conceptCode}
                </span>
              )}
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-bold text-[10px]">
                {subject}
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Gemini AI Active
              </span>
            </div>
            <h3 className="text-base md:text-lg font-bold text-white">{topicTitle}</h3>
            {tamilTopicTitle && <p className="text-xs text-slate-400">{tamilTopicTitle}</p>}
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-slate-800 bg-[#0E172A] p-1.5 gap-2">
          <button
            onClick={() => setActiveTab('lecture')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
              activeTab === 'lecture'
                ? 'bg-[#00D084] text-[#070C18] shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>AI Interactive Lecture</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
              activeTab === 'notes'
                ? 'bg-[#00D084] text-[#070C18] shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Deep Study Notes</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
              activeTab === 'quiz'
                ? 'bg-[#00D084] text-[#070C18] shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>CBT Quiz</span>
          </button>

          <button
            onClick={() => setActiveTab('tutor')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
              activeTab === 'tutor'
                ? 'bg-[#00D084] text-[#070C18] shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Socratic AI Tutor</span>
          </button>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-3">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-sm font-bold text-white">Generating AI Nano Lesson with Gemini Engine...</div>
            <div className="text-xs text-slate-400">Synthesizing Tamil explanations, formulas & exam questions</div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            
            {/* TAB 1: AI LECTURE */}
            {activeTab === 'lecture' && (
              <div className="space-y-4">
                <div className="bg-[#0E172A] border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs">
                      Slide {currentSlideIndex + 1} of {slides.length || 1}
                    </span>
                    <span className="text-xs font-bold text-slate-400">{subject}</span>
                  </div>

                  <h4 className="text-lg font-bold text-white">{currentSlide?.heading || topicTitle}</h4>
                  {currentSlide?.tamilHeading && (
                    <p className="text-sm text-slate-400">{currentSlide?.tamilHeading}</p>
                  )}

                  <div className="space-y-2 pt-2">
                    {(currentSlide?.points || []).map((pt, pIdx) => (
                      <div key={pIdx} className="flex items-start gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 mt-2 shrink-0" />
                        <span className="text-sm text-slate-200">{pt}</span>
                      </div>
                    ))}
                  </div>

                  {(currentSlide?.formulaOrRule || keyFormulaOrRule) && (
                    <div className="bg-[#131F37] border border-sky-500/30 rounded-xl p-3 text-xs space-y-1 mt-4">
                      <span className="text-[10px] font-extrabold text-sky-400 uppercase tracking-wider">
                        GOVT NORMS KEY FORMULA / RULE:
                      </span>
                      <div className="text-sm font-mono text-white font-bold">
                        {currentSlide?.formulaOrRule || keyFormulaOrRule}
                      </div>
                    </div>
                  )}
                </div>

                {/* Voiceover Speech Simulation */}
                <div className="bg-[#0E172A] border border-slate-800 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                      <Bot className="w-4 h-4" /> AI Teacher Voiceover Script
                    </div>
                    <button
                      onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                      className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition"
                    >
                      {isPlayingAudio ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      <span>{isPlayingAudio ? 'Pause' : 'Play Voice'}</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 italic leading-relaxed">
                    "{currentSlide?.audioScript || lessonContent?.summary}"
                  </p>
                </div>

                {/* Slide Stepper Controls */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    disabled={currentSlideIndex === 0}
                    onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                    className="px-4 py-2 bg-[#0E172A] border border-slate-800 rounded-xl text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-40 transition flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>

                  <span className="text-xs font-mono font-bold text-slate-400">
                    {currentSlideIndex + 1} / {slides.length || 1}
                  </span>

                  <button
                    disabled={currentSlideIndex >= slides.length - 1}
                    onClick={() => setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1))}
                    className="px-4 py-2 bg-[#0E172A] border border-slate-800 rounded-xl text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-40 transition flex items-center gap-1"
                  >
                    Next Slide <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: DEEP STUDY NOTES */}
            {activeTab === 'notes' && (
              <div className="space-y-5">
                <div className="bg-[#0E172A] border border-slate-800 rounded-2xl p-5 space-y-2">
                  <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    BILINGUAL CONCEPT OVERVIEW
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed">{lessonContent?.summary}</p>
                  {lessonContent?.tamilSummary && (
                    <p className="text-xs text-slate-400 leading-relaxed">{lessonContent?.tamilSummary}</p>
                  )}
                </div>

                {lessonContent?.keyFormulas && lessonContent.keyFormulas.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-bold text-white">📐 Key Axioms & Mathematical Formulas</h5>
                    {lessonContent.keyFormulas.map((f, i) => (
                      <div key={i} className="bg-[#131F37] border border-sky-500/30 rounded-xl p-3 font-mono text-sm text-sky-300">
                        {f}
                      </div>
                    ))}
                  </div>
                )}

                {lessonContent?.modelQuestions && lessonContent.modelQuestions.length > 0 && (
                  <div className="space-y-3">
                    <h5 className="text-sm font-bold text-white">🎯 Official Blueprint Model Questions & Answers</h5>
                    {lessonContent.modelQuestions.map((mq, i) => (
                      <div key={i} className="bg-[#0E172A] border border-slate-800 rounded-2xl p-4 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-xs">
                            {mq.type}
                          </span>
                          <span className="text-xs font-bold text-amber-400">{mq.marks} Marks</span>
                        </div>
                        <div className="text-sm font-bold text-white">Q: {mq.question}</div>
                        {mq.tamilQuestion && (
                          <div className="text-xs text-slate-400">வினா: {mq.tamilQuestion}</div>
                        )}
                        <div className="bg-[#131F37] rounded-xl p-3 text-xs space-y-1">
                          <div className="text-[10px] font-bold text-sky-400 uppercase">
                            Model Step-by-Step Answer:
                          </div>
                          <div className="text-slate-200 whitespace-pre-line leading-relaxed">
                            {mq.stepByStepAnswer}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: CBT QUIZ */}
            {activeTab === 'quiz' && (
              <div className="space-y-4">
                <div className="bg-[#0E172A] border border-slate-800 rounded-2xl p-4">
                  <h4 className="text-sm font-bold text-white">Nano Concept Mastery Quiz</h4>
                  <p className="text-xs text-slate-400">
                    Answer all {lessonContent?.quizQuestions?.length || 0} questions to test your retention.
                  </p>
                </div>

                {(lessonContent?.quizQuestions || []).map((q, qIdx) => {
                  const selectedOpt = selectedAnswers[qIdx];
                  const isCorrect = selectedOpt === q.correctIndex;

                  return (
                    <div key={q.id || qIdx} className="bg-[#0E172A] border border-slate-800 rounded-2xl p-5 space-y-3">
                      <div className="text-xs font-bold text-emerald-400">Question {qIdx + 1}</div>
                      <div className="text-sm font-bold text-white">{q.question}</div>
                      {q.tamilQuestion && <div className="text-xs text-slate-400">{q.tamilQuestion}</div>}

                      <div className="space-y-2 pt-1">
                        {q.options.map((opt, oIdx) => {
                          const isChosen = selectedOpt === oIdx;
                          let btnClass = 'bg-[#131F37] border-slate-800 text-slate-200';

                          if (isQuizSubmitted) {
                            if (oIdx === q.correctIndex) {
                              btnClass = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
                            } else if (isChosen && !isCorrect) {
                              btnClass = 'bg-red-500/20 border-red-500 text-red-300 font-bold';
                            }
                          } else if (isChosen) {
                            btnClass = 'bg-emerald-500/15 border-emerald-500 text-emerald-400 font-bold';
                          }

                          return (
                            <button
                              key={oIdx}
                              disabled={isQuizSubmitted}
                              onClick={() => handleSelectQuizOption(qIdx, oIdx)}
                              className={`w-full p-3 rounded-xl border text-left text-xs transition flex items-center gap-3 ${btnClass}`}
                            >
                              <span className="w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-400 shrink-0">
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {isQuizSubmitted && (
                        <div className="bg-[#131F37] rounded-xl p-3 text-xs space-y-1">
                          <div className="font-bold text-amber-400">
                            {isCorrect ? '✅ Correct Answer!' : '❌ Explanation & Rationale:'}
                          </div>
                          <div className="text-slate-300">{q.explanation}</div>
                          {q.tamilExplanation && (
                            <div className="text-slate-400 text-[11px]">{q.tamilExplanation}</div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {!isQuizSubmitted ? (
                  <button
                    onClick={() => setIsQuizSubmitted(true)}
                    className="w-full py-3 bg-[#00D084] hover:bg-[#00B774] text-[#070C18] text-xs font-black rounded-xl shadow-lg transition"
                  >
                    Submit & Check Score
                  </button>
                ) : (
                  <div className="bg-[#0E172A] border border-emerald-500/40 rounded-2xl p-5 text-center space-y-1">
                    <div className="text-lg font-black text-emerald-400">
                      Score: {calculateQuizScore()} / {lessonContent?.quizQuestions?.length || 0}
                    </div>
                    <p className="text-xs text-slate-400">
                      {calculateQuizScore() === lessonContent?.quizQuestions?.length
                        ? '🌟 Outstanding! 100% Concept Mastery!'
                        : 'Great effort! Review the explanations to achieve Centum.'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: SOCRATIC AI TUTOR */}
            {activeTab === 'tutor' && (
              <div className="h-full flex flex-col space-y-4">
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 max-h-[380px]">
                  {chatMessages.map((msg, mIdx) => (
                    <div
                      key={mIdx}
                      className={`flex gap-3 max-w-[85%] rounded-2xl p-3.5 text-xs ${
                        msg.sender === 'user'
                          ? 'ml-auto bg-emerald-500/20 border border-emerald-500/30 text-emerald-200'
                          : 'bg-[#0E172A] border border-slate-800 text-slate-200'
                      }`}
                    >
                      {msg.sender === 'ai' && <Bot className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                      <div className="leading-relaxed whitespace-pre-line">{msg.text}</div>
                    </div>
                  ))}
                  {isSendingChat && (
                    <div className="flex items-center gap-2 bg-[#0E172A] border border-slate-800 rounded-2xl p-3 text-xs text-slate-400">
                      <div className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                      <span>TutO AI is thinking...</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-800">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                    placeholder="Ask any doubt about this concept in Tamil or English..."
                    className="flex-1 bg-[#0E172A] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                  />
                  <button
                    disabled={!chatInput.trim() || isSendingChat}
                    onClick={handleSendChat}
                    className="px-4 bg-[#00D084] hover:bg-[#00B774] text-[#070C18] font-bold rounded-xl transition disabled:opacity-40"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Sticky Complete Footer */}
        <div className="p-4 bg-[#0E172A] border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Day {dayNumber} • Step {stepNumber}
          </div>
          <button
            onClick={handleCompleteAndEarn}
            className="px-6 py-2.5 bg-[#00D084] hover:bg-[#00B774] text-[#070C18] text-xs font-black rounded-xl shadow-lg flex items-center gap-2 transition"
          >
            <CheckCircle2 className="w-4 h-4" /> Complete Task & Earn XP
          </button>
        </div>

      </div>
    </div>
  );
};
