import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Sparkles,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Award,
  Layers,
  FileText,
  Heart,
  Zap,
  Send,
  Video,
  HardDrive,
  ShieldCheck,
  Target,
} from 'lucide-react';

import {
  WholeYearDayPlan,
  resolveWholeYearDayPlan,
  getAdminCustomDayPlan,
} from '@/data/curriculum/wholeYearDayPlanEngine';
import {
  GoogleSheetsDayPlanService,
  GoogleSheetDayPlanItem,
  DEFAULT_ICLE_GUIDANCE_VIDEO,
} from '@/services/GoogleSheetsDayPlanService';
import { getOfficialGovernmentSyllabus } from '@/data/curriculum/officialGovernmentSyllabusRegistry';

import { ImmersiveVideoPlayer } from './ImmersiveVideoPlayer';
import { TaskVideoFeedbackModal } from './TaskVideoFeedbackModal';

interface TutODayCoursePlayerWebModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayNumber: number;
  course: any;
  onDayComplete: (dayNumber: number, earnedXp?: number) => void;
}

export type StepKey =
  | 'guidance'
  | 'tamil'
  | 'english'
  | 'maths'
  | 'science'
  | 'social'
  | 'lifeskill'
  | 'homework'
  | 'yoga'
  | 'currentaffairs'
  | 'test'
  | 'drive_feedback';

export const TutODayCoursePlayerWebModal: React.FC<TutODayCoursePlayerWebModalProps> = ({
  isOpen,
  onClose,
  dayNumber,
  course,
  onDayComplete,
}) => {
  const courseId = course?.id || 'default-course';
  const courseTitle = course?.title || 'Course';
  const board = course?.board || 'TNSB';

  const [currentDay, setCurrentDay] = useState<number>(dayNumber || 1);
  const [activeStep, setActiveStep] = useState<StepKey>('guidance');
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [dayPlanData, setDayPlanData] = useState<WholeYearDayPlan | null>(null);
  const [sheetPlan, setSheetPlan] = useState<GoogleSheetDayPlanItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Daily MCQ Test State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [testSubmitted, setTestSubmitted] = useState<boolean>(false);
  const [testScore, setTestScore] = useState<number>(0);

  // Google Drive Task Video Recording State
  const [isVideoFeedbackOpen, setIsVideoFeedbackOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function loadDay() {
      setIsLoading(true);
      try {
        const sheet = await GoogleSheetsDayPlanService.getDayPlan(courseId, currentDay);
        if (isMounted) setSheetPlan(sheet);

        const custom = await getAdminCustomDayPlan(courseId, currentDay);
        if (custom && isMounted) {
          setDayPlanData(custom);
        } else {
          const resolved = resolveWholeYearDayPlan(courseId, courseTitle, currentDay, board);
          if (isMounted) setDayPlanData(resolved);
        }

        const progressRaw = localStorage.getItem(`tuto_day_progress_${courseId}_${currentDay}`);
        if (progressRaw && isMounted) {
          setCompletedSteps(JSON.parse(progressRaw));
        } else if (isMounted) {
          setCompletedSteps({});
        }

        setSelectedAnswers({});
        setTestSubmitted(false);
        setTestScore(0);
      } catch (e) {
        console.warn('Error loading day plan:', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadDay();

    return () => {
      isMounted = false;
    };
  }, [isOpen, courseId, courseTitle, currentDay, board]);

  const plan = dayPlanData || resolveWholeYearDayPlan(courseId, courseTitle, currentDay, board);

  const guidanceVid = sheetPlan?.officialGuidanceVideo || {
    title: `Day ${currentDay}: Official Rule & Guidance — ICLE Technology`,
    youtubeVideoId: plan.videos?.[0]?.youtubeVideoId || DEFAULT_ICLE_GUIDANCE_VIDEO.youtubeVideoId,
    channelName: 'ICLE Technology Official',
    summary: 'Daily official guidelines, discipline rules, and micro-learning targets for all scholars.',
    durationMinutes: 10,
  };

  const tamilTask = sheetPlan?.tamilTask || {
    title: `Day ${currentDay} தமிழ்: ${plan.topicTamilTitle || plan.topicTitle}`,
    topic: plan.topicTamilTitle || plan.topicTitle,
    youtubeVideoId: plan.videos?.[0]?.youtubeVideoId || 'dQw4w9WgXcQ',
    channelName: 'SuprO Tamil Masterclass',
    summary: plan.notes?.[0]?.contentTamil || 'இன்றைய தமிழ் இலக்கணம், பாடல் கருத்து மற்றும் உரைநடை விளக்கம்.',
    durationMinutes: 15,
  };

  const englishTask = sheetPlan?.englishTask || {
    title: `Day ${currentDay} English: ${plan.topicTitle} & Grammar`,
    topic: `${plan.topicTitle} & Applied Grammar`,
    youtubeVideoId: plan.videos?.[1]?.youtubeVideoId || 'dQw4w9WgXcQ',
    channelName: 'SuprO English Academy',
    summary: 'Master core vocabulary, sentence structuring and English comprehension rules.',
    durationMinutes: 15,
  };

  const mathsTask = sheetPlan?.mathsTask || {
    title: `Day ${currentDay} Mathematics: Problem Solving & Formulas`,
    topic: `${plan.subject}: ${plan.chapterTitle}`,
    youtubeVideoId: plan.videos?.[1]?.youtubeVideoId || 'dQw4w9WgXcQ',
    channelName: 'SuprO Maths Lab',
    summary: plan.notes?.[0]?.formulasOrKeyRules?.[0] || 'Core theorem derivation and step-by-step problem workout.',
    durationMinutes: 20,
  };

  const scienceTask = sheetPlan?.scienceTask || {
    title: `Day ${currentDay} Science: Experimental Laws & Key Diagrams`,
    topic: plan.topicTitle,
    youtubeVideoId: plan.videos?.[2]?.youtubeVideoId || 'dQw4w9WgXcQ',
    channelName: 'SuprO Science Discovery',
    summary: plan.notes?.[1]?.content || 'Scientific observations, molecular principles, and physical derivations.',
    durationMinutes: 20,
  };

  const socialScienceTask = sheetPlan?.socialScienceTask || {
    title: `Day ${currentDay} Social Science & Civic Governance`,
    topic: 'Indian Constitution, History Timeline & World Geography',
    youtubeVideoId: plan.videos?.[0]?.youtubeVideoId || 'dQw4w9WgXcQ',
    channelName: 'SuprO Civics & History',
    summary: 'Historical context, constitutional rights, and geographic mapping.',
    durationMinutes: 15,
  };

  const lifeSkillTask = sheetPlan?.lifeSkillTask || {
    title: 'Daily Practical Wisdom & Ethical Leadership',
    description: 'Developing proactive focus, time blocking, emotional resilience, and integrity.',
    actionPrompt: 'Write down 2 actionable steps you will take today to practice proactive discipline.',
  };

  const homeworkTask = sheetPlan?.homeworkTask || {
    title: `Day ${currentDay} Self-Study Homework & Practice Questions`,
    description: 'Solve the textbook questions for today and write a short summary.',
    questions: [
      `1. Explain the fundamental concept of ${plan.topicTitle}.`,
      `2. Work out 2 practice problems related to ${plan.chapterTitle}.`,
      `3. Write 3 key vocabulary or formula takeaways from today's lectures.`,
    ],
  };

  const exerciseYoga = sheetPlan?.exercisePhysicVideo || {
    title: `Daily Physical Fitness & ${plan?.yogaAndActivity?.asanaName || 'Yoga'}`,
    youtubeVideoId: 'dQw4w9WgXcQ',
    asanaOrWorkout: plan?.yogaAndActivity?.asanaName || 'Yoga Asana',
    benefits: plan?.yogaAndActivity?.benefits || [],
    durationMinutes: 10,
  };

  const currentAffairs = sheetPlan?.currentAffairsGkVideo || {
    title: 'Daily Current Affairs & All-India General Knowledge',
    youtubeVideoId: 'dQw4w9WgXcQ',
    keyPoints: [
      'National & Tamil Nadu Key Governance Milestones',
      'Science, Space (ISRO) & Defense Breakthroughs',
      'Supreme Court Precedents & Civics Updates',
    ],
    durationMinutes: 10,
  };

  const handleMarkStepComplete = async (step: StepKey, xpEarned: number = 25) => {
    const updated = { ...completedSteps, [step]: true };
    setCompletedSteps(updated);
    try {
      localStorage.setItem(`tuto_day_progress_${courseId}_${currentDay}`, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save step progress:', e);
    }

    const stepOrder: StepKey[] = [
      'guidance',
      'tamil',
      'english',
      'maths',
      'science',
      'social',
      'lifeskill',
      'homework',
      'yoga',
      'currentaffairs',
      'test',
      'drive_feedback',
    ];
    const currentIndex = stepOrder.indexOf(step);
    if (currentIndex < stepOrder.length - 1) {
      setActiveStep(stepOrder[currentIndex + 1]);
    }
  };

  const handleTestOptionSelect = (qId: string, opt: 'A' | 'B' | 'C' | 'D') => {
    if (testSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: opt }));
  };

  const handleSubmitDailyTest = async () => {
    const questions = plan?.mcqTest?.questions || [];
    let score = 0;
    questions.forEach((q: any) => {
      if (selectedAnswers[q.id] === q.correctOption) {
        score++;
      }
    });

    setTestScore(score);
    setTestSubmitted(true);
    await handleMarkStepComplete('test', score * 20);

    alert(
      score >= 3
        ? `🎉 Excellent Performance!\nYou scored ${score} / ${questions.length} on today's CBT assessment. +${score * 20} XP Earned!`
        : `📚 Good Attempt!\nYou scored ${score} / ${questions.length} on today's CBT assessment. +${score * 20} XP Earned!`
    );
    setActiveStep('drive_feedback');
  };

  const handleCompleteWholeDay = () => {
    if (onDayComplete) {
      onDayComplete(currentDay, 150);
    }
    alert(`🌟 Day Complete!\nCongratulations on finishing Day ${currentDay} micro-learning targets!`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8">
      <div className="w-full max-w-4xl h-full max-h-[90vh] bg-[#070C18] rounded-xl flex flex-col overflow-hidden shadow-2xl border border-slate-800">
        
        {/* 1. TOP APP BAR */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0E172A] border-b border-slate-800">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors"
          >
            <X size={18} className="text-slate-300" />
          </button>

          <div className="flex-1 flex flex-col items-center mx-4 overflow-hidden">
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-[#00D084]/15 border border-[#00D084]/30 px-2 py-0.5 rounded text-[#00D084] text-[10px] font-black uppercase">
                DAY {currentDay} OF 200
              </div>
              {sheetPlan && (
                <div className="flex items-center gap-1 bg-[#00D084]/10 px-1.5 py-0.5 rounded text-[#00D084] text-[9px] font-extrabold">
                  <Sparkles size={10} />
                  <span>Google Sheet Live</span>
                </div>
              )}
            </div>
            <h2 className="text-[12px] font-bold text-slate-400 truncate w-full text-center">
              {courseTitle}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsVideoFeedbackOpen(true)}
              className="flex items-center gap-1.5 bg-sky-400/10 border border-sky-400 px-2 py-1 rounded-md hover:bg-sky-400/20 transition-colors"
            >
              <Video size={12} className="text-sky-400" />
              <span className="text-[11px] font-extrabold text-sky-400">Record</span>
            </button>
            <button
              disabled={currentDay <= 1}
              onClick={() => setCurrentDay((prev) => Math.max(1, prev - 1))}
              className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
                currentDay <= 1 ? 'bg-slate-800/50 cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-700'
              }`}
            >
              <ArrowLeft size={14} className={currentDay <= 1 ? 'text-slate-600' : 'text-[#00D084]'} />
            </button>
            <button
              onClick={() => setCurrentDay((prev) => prev + 1)}
              className="w-7 h-7 rounded-md bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors"
            >
              <ArrowRight size={14} className="text-[#00D084]" />
            </button>
          </div>
        </div>

        {/* 2. 12-STEP MULTI-SUBJECT MICRO-LEARNING BAR */}
        <div className="bg-[#0A1020] border-b border-slate-800 py-2">
          <div className="flex overflow-x-auto px-4 gap-2 no-scrollbar pb-2">
            {[
              { id: 'guidance' as StepKey, label: '🏛️ ICLE Guidance', isDone: completedSteps.guidance },
              { id: 'tamil' as StepKey, label: '📖 தமிழ் பாடம்', isDone: completedSteps.tamil },
              { id: 'english' as StepKey, label: '🔤 English Masterclass', isDone: completedSteps.english },
              { id: 'maths' as StepKey, label: '📐 Maths Lab', isDone: completedSteps.maths },
              { id: 'science' as StepKey, label: '🔬 Science Practical', isDone: completedSteps.science },
              { id: 'social' as StepKey, label: '🌍 Social Science', isDone: completedSteps.social },
              { id: 'lifeskill' as StepKey, label: '💡 Life Skills', isDone: completedSteps.lifeskill },
              { id: 'homework' as StepKey, label: '✍️ Daily Homework', isDone: completedSteps.homework },
              { id: 'yoga' as StepKey, label: '🧘 Fitness & Yoga', isDone: completedSteps.yoga },
              { id: 'currentaffairs' as StepKey, label: '📰 Current Affairs', isDone: completedSteps.currentaffairs },
              { id: 'test' as StepKey, label: '🎯 CBT Test', isDone: completedSteps.test },
              { id: 'drive_feedback' as StepKey, label: '📹 Drive Video Upload', isDone: completedSteps.drive_feedback },
            ].map((stepItem, idx) => {
              const isActive = activeStep === stepItem.id;
              return (
                <button
                  key={stepItem.id}
                  onClick={() => setActiveStep(stepItem.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
                    isActive
                      ? 'bg-[#00D084]/15 border-[#00D084]'
                      : stepItem.isDone
                      ? 'bg-[#131F37] border-[#00D084]/40'
                      : 'bg-[#131F37] border-slate-800 hover:border-slate-600'
                  }`}
                >
                  {stepItem.isDone ? (
                    <CheckCircle2 size={14} className="text-[#00D084]" />
                  ) : (
                    <span className={`text-[11px] font-extrabold ${isActive ? 'text-[#00D084]' : 'text-slate-400'}`}>
                      {idx + 1}
                    </span>
                  )}
                  <span
                    className={`text-[12px] font-bold whitespace-nowrap ${
                      isActive ? 'text-white' : stepItem.isDone ? 'text-[#00D084]' : 'text-slate-400'
                    }`}
                  >
                    {stepItem.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. MAIN CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#070C18]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
              <div className="w-8 h-8 border-4 border-slate-700 border-t-[#00D084] rounded-full animate-spin"></div>
              <p className="text-sm font-bold">Loading Day {currentDay} Curriculum Deck...</p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6 pb-20">
              
              {/* STEP 1: Official Rule & Guidance Video */}
              {activeStep === 'guidance' && (
                <div className="space-y-4">
                  <div className="bg-[#0E172A] rounded-xl border border-slate-800 p-4 space-y-2">
                    <div className="flex items-center gap-1 text-[#00D084] mb-2">
                      <ShieldCheck size={14} />
                      <span className="text-[10px] font-black tracking-wide">TASK 1: OFFICIAL RULE & GUIDANCE</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-white">{guidanceVid.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{guidanceVid.summary}</p>
                  </div>
                  <ImmersiveVideoPlayer
                    videoId={guidanceVid.youtubeVideoId}
                    title={guidanceVid.title}
                    channelName="ICLE Technology Official"
                    summary={guidanceVid.summary}
                    durationMinutes={guidanceVid.durationMinutes}
                    isCompleted={completedSteps.guidance}
                    onMarkComplete={() => handleMarkStepComplete('guidance', 30)}
                    xpReward={30}
                  />
                </div>
              )}

              {/* STEP 2: Tamil */}
              {activeStep === 'tamil' && (
                <div className="space-y-4">
                  <div className="bg-[#0E172A] rounded-xl border border-slate-800 p-4 space-y-2">
                    <div className="flex items-center gap-1 text-pink-500 mb-2">
                      <BookOpen size={14} />
                      <span className="text-[10px] font-black tracking-wide">TASK 2: தமிழ் பாடப் பிரிவு</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-white">{tamilTask.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{tamilTask.summary}</p>
                  </div>
                  <ImmersiveVideoPlayer
                    videoId={tamilTask.youtubeVideoId}
                    title={tamilTask.title}
                    channelName={tamilTask.channelName}
                    summary={tamilTask.summary}
                    durationMinutes={tamilTask.durationMinutes}
                    isCompleted={completedSteps.tamil}
                    onMarkComplete={() => handleMarkStepComplete('tamil', 25)}
                    xpReward={25}
                  />
                </div>
              )}

              {/* STEP 3: English */}
              {activeStep === 'english' && (
                <div className="space-y-4">
                  <div className="bg-[#0E172A] rounded-xl border border-slate-800 p-4 space-y-2">
                    <div className="flex items-center gap-1 text-sky-400 mb-2">
                      <Sparkles size={14} />
                      <span className="text-[10px] font-black tracking-wide">TASK 3: ENGLISH & GRAMMAR</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-white">{englishTask.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{englishTask.summary}</p>
                  </div>
                  <ImmersiveVideoPlayer
                    videoId={englishTask.youtubeVideoId}
                    title={englishTask.title}
                    channelName={englishTask.channelName}
                    summary={englishTask.summary}
                    durationMinutes={englishTask.durationMinutes}
                    isCompleted={completedSteps.english}
                    onMarkComplete={() => handleMarkStepComplete('english', 25)}
                    xpReward={25}
                  />
                </div>
              )}

              {/* STEP 4: Mathematics */}
              {activeStep === 'maths' && (
                <div className="space-y-4">
                  <div className="bg-[#0E172A] rounded-xl border border-slate-800 p-4 space-y-2">
                    <div className="flex items-center gap-1 text-amber-500 mb-2">
                      <Layers size={14} />
                      <span className="text-[10px] font-black tracking-wide">TASK 4: MATHEMATICS & DERIVATIONS</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-white">{mathsTask.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{mathsTask.summary}</p>
                  </div>
                  <ImmersiveVideoPlayer
                    videoId={mathsTask.youtubeVideoId}
                    title={mathsTask.title}
                    channelName={mathsTask.channelName}
                    summary={mathsTask.summary}
                    durationMinutes={mathsTask.durationMinutes}
                    isCompleted={completedSteps.maths}
                    onMarkComplete={() => handleMarkStepComplete('maths', 25)}
                    xpReward={25}
                  />
                </div>
              )}

              {/* STEP 5: Science */}
              {activeStep === 'science' && (
                <div className="space-y-4">
                  <div className="bg-[#0E172A] rounded-xl border border-slate-800 p-4 space-y-2">
                    <div className="flex items-center gap-1 text-emerald-500 mb-2">
                      <Zap size={14} />
                      <span className="text-[10px] font-black tracking-wide">TASK 5: SCIENCE CORE DISCOVERY</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-white">{scienceTask.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{scienceTask.summary}</p>
                  </div>
                  <ImmersiveVideoPlayer
                    videoId={scienceTask.youtubeVideoId}
                    title={scienceTask.title}
                    channelName={scienceTask.channelName}
                    summary={scienceTask.summary}
                    durationMinutes={scienceTask.durationMinutes}
                    isCompleted={completedSteps.science}
                    onMarkComplete={() => handleMarkStepComplete('science', 25)}
                    xpReward={25}
                  />
                </div>
              )}

              {/* STEP 6: Social Science */}
              {activeStep === 'social' && (
                <div className="space-y-4">
                  <div className="bg-[#0E172A] rounded-xl border border-slate-800 p-4 space-y-2">
                    <div className="flex items-center gap-1 text-violet-500 mb-2">
                      <Target size={14} />
                      <span className="text-[10px] font-black tracking-wide">TASK 6: SOCIAL SCIENCE & CIVICS</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-white">{socialScienceTask.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{socialScienceTask.summary}</p>
                  </div>
                  <ImmersiveVideoPlayer
                    videoId={socialScienceTask.youtubeVideoId}
                    title={socialScienceTask.title}
                    channelName={socialScienceTask.channelName}
                    summary={socialScienceTask.summary}
                    durationMinutes={socialScienceTask.durationMinutes}
                    isCompleted={completedSteps.social}
                    onMarkComplete={() => handleMarkStepComplete('social', 25)}
                    xpReward={25}
                  />
                </div>
              )}

              {/* STEP 7: Life Skills */}
              {activeStep === 'lifeskill' && (
                <div className="space-y-4">
                  <div className="bg-[#0E172A] rounded-xl border border-slate-800 p-4 space-y-2">
                    <div className="flex items-center gap-1 text-amber-500 mb-2">
                      <Sparkles size={14} />
                      <span className="text-[10px] font-black tracking-wide">TASK 7: LIFE SKILLS & LEADERSHIP</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-white">{lifeSkillTask.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{lifeSkillTask.description}</p>
                  </div>
                  
                  <div className="bg-[#0E172A] rounded-xl border border-slate-800 p-4 space-y-2">
                    <h4 className="text-[12px] font-extrabold text-[#00D084] tracking-wide">💡 ACTION TAKEAWAY PROMPT:</h4>
                    <p className="text-sm text-slate-200 leading-relaxed">{lifeSkillTask.actionPrompt}</p>
                  </div>
                  
                  <button
                    onClick={() => handleMarkStepComplete('lifeskill', 20)}
                    className="w-full flex items-center justify-center gap-2 bg-[#00D084] text-[#070C18] py-3 rounded-xl font-black text-sm shadow-[0_4px_14px_rgba(0,208,132,0.3)] hover:bg-[#00E594] transition-colors"
                  >
                    <CheckCircle2 size={18} />
                    <span>Mark Life Skill Complete (+20 XP) ➡️</span>
                  </button>
                </div>
              )}

              {/* STEP 8: Homework */}
              {activeStep === 'homework' && (
                <div className="space-y-4">
                  <div className="bg-[#0E172A] rounded-xl border border-slate-800 p-4 space-y-2">
                    <div className="flex items-center gap-1 text-sky-400 mb-2">
                      <FileText size={14} />
                      <span className="text-[10px] font-black tracking-wide">TASK 8: HOMEWORK & SELF-PRACTICE</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-white">{homeworkTask.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{homeworkTask.description}</p>
                  </div>
                  
                  <div className="bg-[#0E172A] rounded-xl border border-slate-800 p-4 space-y-3">
                    <h4 className="text-[12px] font-extrabold text-sky-400 tracking-wide">✍️ PRACTICE QUESTIONS TO SOLVE IN NOTEBOOK:</h4>
                    <ul className="space-y-2">
                      {(homeworkTask.questions || []).map((q: string, idx: number) => {
                        const [num, ...rest] = q.split('.');
                        return (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-200">
                            <span className="text-sky-400 font-extrabold min-w-[20px]">{num}.</span>
                            <span className="leading-relaxed">{rest.join('.')}</span>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                  
                  <button
                    onClick={() => handleMarkStepComplete('homework', 25)}
                    className="w-full flex items-center justify-center gap-2 bg-[#00D084] text-[#070C18] py-3 rounded-xl font-black text-sm shadow-[0_4px_14px_rgba(0,208,132,0.3)] hover:bg-[#00E594] transition-colors"
                  >
                    <CheckCircle2 size={18} />
                    <span>Mark Homework Complete (+25 XP) ➡️</span>
                  </button>
                </div>
              )}

              {/* STEP 9: Yoga */}
              {activeStep === 'yoga' && (
                <div className="space-y-4">
                  <div className="bg-[#0E172A] rounded-xl border border-slate-800 p-4 space-y-2">
                    <div className="flex items-center gap-1 text-pink-500 mb-2">
                      <Heart size={14} />
                      <span className="text-[10px] font-black tracking-wide">TASK 9: FITNESS, EXERCISE & YOGA</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-white">{exerciseYoga.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">Asana / Routine: {exerciseYoga.asanaOrWorkout}</p>
                  </div>
                  <ImmersiveVideoPlayer
                    videoId={exerciseYoga.youtubeVideoId}
                    title={exerciseYoga.title}
                    channelName="SuprO Wellness & Fitness"
                    summary={`Key Asana: ${exerciseYoga.asanaOrWorkout}`}
                    durationMinutes={exerciseYoga.durationMinutes}
                    isCompleted={completedSteps.yoga}
                    onMarkComplete={() => handleMarkStepComplete('yoga', 25)}
                    xpReward={25}
                  />
                </div>
              )}

              {/* STEP 10: Current Affairs */}
              {activeStep === 'currentaffairs' && (
                <div className="space-y-4">
                  <div className="bg-[#0E172A] rounded-xl border border-slate-800 p-4 space-y-2">
                    <div className="flex items-center gap-1 text-[#00D084] mb-2">
                      <Sparkles size={14} />
                      <span className="text-[10px] font-black tracking-wide">TASK 10: CURRENT AFFAIRS & GK</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-white">{currentAffairs.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">Common daily knowledge bulletin across all programs.</p>
                  </div>
                  <ImmersiveVideoPlayer
                    videoId={currentAffairs.youtubeVideoId}
                    title={currentAffairs.title}
                    channelName="SuprO Current Affairs & GK"
                    summary="All-India national schemes, defense updates & civics knowledge."
                    durationMinutes={currentAffairs.durationMinutes}
                    isCompleted={completedSteps.currentaffairs}
                    onMarkComplete={() => handleMarkStepComplete('currentaffairs', 25)}
                    xpReward={25}
                  />
                </div>
              )}

              {/* STEP 11: Daily Test */}
              {activeStep === 'test' && (
                <div className="space-y-4">
                  <div className="bg-[#0E172A] rounded-xl border border-slate-800 p-4 space-y-2">
                    <div className="flex items-center gap-1 text-amber-500 mb-2">
                      <Target size={14} />
                      <span className="text-[10px] font-black tracking-wide">TASK 11: DAILY MCQ ASSESSMENT</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-white">{plan?.mcqTest?.testTitle || 'Daily Assessment'}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {plan?.mcqTest?.questions?.length || 0} High-Yield Exam Questions • Instant Scoring
                    </p>
                  </div>

                  {(plan?.mcqTest?.questions || []).map((q: any, qIdx: number) => (
                    <div key={q.id} className="bg-[#0E172A] rounded-xl border border-slate-800 p-4 space-y-3">
                      <p className="text-sm font-extrabold text-white leading-relaxed">
                        {qIdx + 1}. {q.question}
                      </p>
                      
                      <div className="space-y-2">
                        {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                          const isSelected = selectedAnswers[q.id] === optKey;
                          const isCorrect = testSubmitted && q.correctOption === optKey;
                          const isWrong = testSubmitted && isSelected && !isCorrect;

                          let btnClasses = "w-full flex items-center gap-3 bg-[#131F37] border border-slate-800 p-3 rounded-xl transition-colors text-left ";
                          if (isSelected && !testSubmitted) btnClasses += "bg-[#00D084]/15 border-[#00D084]";
                          if (isCorrect) btnClasses += "bg-[#00D084]/25 border-[#00D084]";
                          if (isWrong) btnClasses += "bg-red-500/25 border-red-500";
                          if (!isSelected && !isCorrect && !isWrong && !testSubmitted) btnClasses += "hover:border-slate-600";

                          return (
                            <button
                              key={optKey}
                              onClick={() => handleTestOptionSelect(q.id, optKey)}
                              disabled={testSubmitted}
                              className={btnClasses}
                            >
                              <span className="text-xs font-black text-[#00D084]">{optKey}</span>
                              <span className="text-xs text-slate-200">{q.options[optKey]}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {!testSubmitted ? (
                    <button
                      onClick={handleSubmitDailyTest}
                      className="w-full flex items-center justify-center gap-2 bg-[#00D084] text-[#070C18] py-3 rounded-xl font-black text-sm shadow-[0_4px_14px_rgba(0,208,132,0.3)] hover:bg-[#00E594] transition-colors"
                    >
                      <Award size={18} />
                      <span>Submit Assessment & Reveal Score</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveStep('drive_feedback')}
                      className="w-full flex items-center justify-center gap-2 bg-[#00D084] text-[#070C18] py-3 rounded-xl font-black text-sm shadow-[0_4px_14px_rgba(0,208,132,0.3)] hover:bg-[#00E594] transition-colors"
                    >
                      <ArrowRight size={18} />
                      <span>Go to Drive Video Feedback ➡️</span>
                    </button>
                  )}
                </div>
              )}

              {/* STEP 12: Drive Feedback */}
              {activeStep === 'drive_feedback' && (
                <div className="space-y-4">
                  <div className="bg-[#0E172A] rounded-xl border border-slate-800 p-4 space-y-2">
                    <div className="flex items-center gap-1 text-sky-400 mb-2">
                      <HardDrive size={14} />
                      <span className="text-[10px] font-black tracking-wide">TASK 12: DRIVE VIDEO RECORDING</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-white">📹 Record & Upload Today's Video Reflection</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Record a 30-60 second video explaining what you learned today. Your video will be automatically
                      stored in your Google Drive and sent to your course guide on WhatsApp (9486335870).
                    </p>
                  </div>

                  <button
                    onClick={() => setIsVideoFeedbackOpen(true)}
                    className="w-full flex items-center justify-center gap-2 bg-sky-400 text-[#070C18] py-3 rounded-xl font-black text-sm shadow-[0_4px_14px_rgba(56,189,248,0.3)] hover:bg-sky-300 transition-colors"
                  >
                    <Video size={18} />
                    <span>Launch In-App Video Recorder & Drive Upload</span>
                  </button>

                  <button
                    onClick={() => setIsVideoFeedbackOpen(true)}
                    className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-xl font-black text-sm shadow-[0_4px_14px_rgba(37,211,102,0.3)] hover:bg-[#20bd5a] transition-colors"
                  >
                    <Send size={18} />
                    <span>📲 Send Video to Course Guide on WhatsApp</span>
                  </button>

                  <button
                    onClick={handleCompleteWholeDay}
                    className="w-full flex items-center justify-center gap-2 bg-[#00D084] text-[#070C18] py-3 rounded-xl font-black text-sm shadow-[0_4px_14px_rgba(0,208,132,0.3)] hover:bg-[#00E594] transition-colors mt-6"
                  >
                    <CheckCircle2 size={18} />
                    <span>🎉 Complete Entire Day {currentDay} Deck (+150 XP)</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 4. TASK VIDEO FEEDBACK MODAL */}
        {isVideoFeedbackOpen && (
          <TaskVideoFeedbackModal
            isOpen={isVideoFeedbackOpen}
            onClose={() => setIsVideoFeedbackOpen(false)}
            courseId={courseId}
            courseTitle={courseTitle}
            dayNumber={currentDay}
            topicTitle={`Day ${currentDay} Curriculum Completion`}
            onSubmitted={async (earnedXp: number) => {
              await handleMarkStepComplete('drive_feedback', earnedXp);
            }}
          />
        )}
      </div>
    </div>
  );
};
