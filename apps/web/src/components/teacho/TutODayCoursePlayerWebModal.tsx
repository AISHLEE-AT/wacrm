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
  Lock,
  Camera,
  GraduationCap
} from 'lucide-react';

import {
  WholeYearDayPlan,
  resolveWholeYearDayPlan,
  getAdminCustomDayPlan,
  isDayUnlocked,
  toggleDayCompletion,
} from '@/data/curriculum/wholeYearDayPlanEngine';
import {
  GoogleSheetsDayPlanService,
  GoogleSheetDayPlanItem,
} from '@/services/GoogleSheetsDayPlanService';

import { ImmersiveVideoWebPlayer } from './ImmersiveVideoWebPlayer';
import { TaskVideoFeedbackModal } from './TaskVideoFeedbackModal';
import { TutOBookPageScannerModal } from './TutOBookPageScannerModal';

interface TutODayCoursePlayerWebModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayNumber: number;
  course: any;
  onDayComplete: (dayNumber: number, earnedXp?: number) => void;
}

export type StepKey =
  | 'maths'
  | 'science'
  | 'languages'
  | 'social'
  | 'currentaffairs'
  | 'penmanship'
  | 'extracurricular'
  | 'ambition'
  | 'masterclass'
  | 'revision'
  | 'yoga'
  | 'homework'
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
  const [activeStep, setActiveStep] = useState<StepKey>('maths');
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [dayPlanData, setDayPlanData] = useState<WholeYearDayPlan | null>(null);
  const [sheetPlan, setSheetPlan] = useState<GoogleSheetDayPlanItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Daily MCQ Test State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [testSubmitted, setTestSubmitted] = useState<boolean>(false);
  const [testScore, setTestScore] = useState<number>(0);

  // Modals State
  const [isVideoFeedbackOpen, setIsVideoFeedbackOpen] = useState<boolean>(false);
  const [isBookScannerOpen, setIsBookScannerOpen] = useState<boolean>(false);

  const stepOrder: StepKey[] = [
    'maths',
    'science',
    'languages',
    'social',
    'currentaffairs',
    'penmanship',
    'extracurricular',
    'ambition',
    'masterclass',
    'revision',
    'yoga',
    'homework',
    'test',
    'drive_feedback',
  ];

  const isStepUnlocked = (stepKey: StepKey): boolean => {
    const idx = stepOrder.indexOf(stepKey);
    if (idx === 0) return true;
    return !!completedSteps[stepOrder[idx - 1]];
  };

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
          const parsed = JSON.parse(progressRaw);
          setCompletedSteps(parsed);
          const firstIncomplete = stepOrder.find(s => !parsed[s]) || 'maths';
          setActiveStep(firstIncomplete as StepKey);
        } else if (isMounted) {
          setCompletedSteps({});
          setActiveStep('maths');
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

  // 10 Subject Tasks Aligned with 365 Days
  const mathsTask = sheetPlan?.mathsTask || {
    title: `Day ${currentDay} Mathematics Core: ${plan.subject}: ${plan.chapterTitle}`,
    topic: `${plan.subject}: Problem Solving & Derivations`,
    youtubeVideoId: plan.videos?.[1]?.youtubeVideoId || 'dQw4w9WgXcQ',
    channelName: 'SuprO Maths Lab',
    summary: plan.notes?.[0]?.formulasOrKeyRules?.[0] || 'Core theorem derivation, mental math drills, and step-by-step problem workout.',
    durationMinutes: 15,
  };

  const scienceTask = sheetPlan?.scienceTask || {
    title: `Day ${currentDay} Science Core: ${plan.topicTitle}`,
    topic: plan.topicTitle,
    youtubeVideoId: plan.videos?.[2]?.youtubeVideoId || 'dQw4w9WgXcQ',
    channelName: 'SuprO Science Discovery',
    summary: plan.notes?.[1]?.content || 'Scientific observations, natural laws, experiments, and labeled diagrams.',
    durationMinutes: 15,
  };

  const languagesTask = sheetPlan?.tamilTask || {
    title: `Day ${currentDay} Languages: தமிழ் & English Mastery`,
    topic: plan.topicTamilTitle || plan.topicTitle,
    youtubeVideoId: plan.videos?.[0]?.youtubeVideoId || 'dQw4w9WgXcQ',
    channelName: 'SuprO Languages Academy',
    summary: plan.notes?.[0]?.contentTamil || 'பருவம் 1 தமிழ் செய்யுள்/உரைநடை விளக்கம் & Applied English Grammar drills.',
    durationMinutes: 15,
  };

  const socialScienceTask = sheetPlan?.socialScienceTask || {
    title: `Day ${currentDay} Social Science Awareness: Civics, Heritage & Geography`,
    topic: 'Indian Constitution, Tamil Nadu History & World Geography',
    youtubeVideoId: plan.videos?.[0]?.youtubeVideoId || 'dQw4w9WgXcQ',
    channelName: 'SuprO Civics & History',
    summary: 'Constitutional awareness, civic duties, regional geography, and historical timelines.',
    durationMinutes: 15,
  };

  const currentAffairs = sheetPlan?.currentAffairsGkVideo || {
    title: `Day ${currentDay} General Knowledge (GK) & Current Affairs Bulletin`,
    youtubeVideoId: 'dQw4w9WgXcQ',
    channelName: 'SuprO General Knowledge & Current Affairs',
    keyPoints: [
      'National & Tamil Nadu Governance Milestones',
      'Science, Space (ISRO) & Defense Breakthroughs',
      'Environmental Conservation & Global Events',
    ],
    durationMinutes: 10,
  };

  const penmanshipTask = {
    title: `Day ${currentDay} Handwriting & Penmanship Practice`,
    description: 'Neat handwriting and cursive penmanship daily 10-minute focused practice in notebook.',
    prompt: 'Write 5 lines of cursive English and 5 lines of neat Tamil calligraphy in your practice notebook.',
    durationMinutes: 10,
  };

  const extracurricularTask = sheetPlan?.lifeSkillTask || {
    title: `Day ${currentDay} Extracurricular & Creative Skills`,
    description: 'Developing logical reasoning puzzles, creative expression, and ethical leadership.',
    actionPrompt: 'Solve today\'s lateral thinking puzzle or draw the key concept diagram neatly in your creative journal.',
    durationMinutes: 10,
  };

  const ambitionTrackTask = {
    title: `Day ${currentDay} Futuristic Career Track: Foundation & Real-World Case Study`,
    topic: 'IAS District Governance / CA Auditor Finance / Clinical Doctor Anatomy',
    youtubeVideoId: plan.videos?.[0]?.youtubeVideoId || 'dQw4w9WgXcQ',
    channelName: 'SuprO Career Foundation',
    summary: 'Early foundational concepts preparing young scholars for civil services, medicine, chartered accountancy, and engineering.',
    durationMinutes: 15,
  };

  const masterclassTask = {
    title: `Day ${currentDay} Visual Explainer Video Masterclass`,
    youtubeVideoId: plan.videos?.[0]?.youtubeVideoId || 'dQw4w9WgXcQ',
    channelName: 'SuprO Visual Masterclasses',
    summary: '3D simulation and visual concept demonstration connecting textbook theory with real-world phenomenon.',
    durationMinutes: 15,
  };

  const bedtimeRevisionTask = {
    title: `Day ${currentDay} Bedtime Revision & Flashcards Vault`,
    summary: 'Review key formulas, vocabulary flashcards, and 1-minute daily recap before sleep to cement long-term memory.',
    keyPoints: plan.notes?.[0]?.formulasOrKeyRules || [
      'Formula 1: Review definitions and unit measures',
      'Rule 2: Practice step-by-step problem verification',
      'Takeaway 3: Active recall before bedtime improves test retention by 40%'
    ],
    durationMinutes: 10,
  };

  const exerciseYoga = sheetPlan?.exercisePhysicVideo || {
    title: `Day ${currentDay} Daily Yoga & Wellness Practice: ${plan?.yogaAndActivity?.asanaName || 'Vrikshasana & Pranayama'}`,
    youtubeVideoId: 'dQw4w9WgXcQ',
    asanaOrWorkout: plan?.yogaAndActivity?.asanaName || 'Yoga & Mindfulness',
    benefits: plan?.yogaAndActivity?.benefits || ['Improves spine posture', 'Boosts memory retention', 'Relieves mental fatigue'],
    durationMinutes: 10,
  };

  const homeworkTask = sheetPlan?.homeworkTask || {
    title: `Day ${currentDay} School Homework & Book-Back Practice`,
    description: 'Solve the textbook questions for today. Use the AI Textbook Scanner if you need step-by-step guidance!',
    questions: [
      `1. Explain the fundamental concept of ${plan.topicTitle}.`,
      `2. Work out 2 practice problems related to ${plan.chapterTitle}.`,
      `3. Write 3 key vocabulary or formula takeaways from today's lectures.`,
    ],
  };

  const handleMarkStepComplete = async (step: StepKey, xpEarned: number = 25) => {
    const updated = { ...completedSteps, [step]: true };
    setCompletedSteps(updated);
    try {
      localStorage.setItem(`tuto_day_progress_${courseId}_${currentDay}`, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save step progress:', e);
    }

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

    const xpEarned = score * 20;
    handleMarkStepComplete('test', xpEarned);

    const isAllDone = stepOrder.every((s) => s === 'test' || completedSteps[s]);
    if (isAllDone) {
      await toggleDayCompletion(courseId, currentDay, true);
      onDayComplete(currentDay, xpEarned + 100);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 md:p-6">
      <div className="w-full max-w-4xl h-full max-h-[92vh] bg-[#070C18] rounded-3xl flex flex-col overflow-hidden shadow-2xl border border-slate-800">
        
        {/* 1. TOP APP BAR */}
        <div className="flex items-center justify-between px-4 md:px-6 py-3.5 bg-[#0E172A] border-b border-slate-800">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors"
          >
            <X size={16} className="text-slate-300" />
          </button>

          <div className="flex-1 flex flex-col items-center mx-4 overflow-hidden">
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-[#00D084]/15 border border-[#00D084]/30 px-2.5 py-0.5 rounded-full text-[#00D084] text-[10px] font-black uppercase tracking-wider">
                DAY {currentDay} OF 365
              </div>
              {sheetPlan && (
                <div className="flex items-center gap-1 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full text-amber-400 text-[9px] font-extrabold">
                  <Sparkles size={10} />
                  <span>Google Sheet Live</span>
                </div>
              )}
            </div>
            <h2 className="text-xs md:text-sm font-bold text-slate-300 truncate w-full text-center">
              {courseTitle}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBookScannerOpen(true)}
              className="hidden sm:flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-xl hover:bg-amber-500/20 transition-colors"
              title="Scan school textbook page with AI"
            >
              <Camera size={13} className="text-amber-400" />
              <span className="text-[11px] font-black text-amber-400">Scan Book</span>
            </button>
            <button
              onClick={() => setIsVideoFeedbackOpen(true)}
              className="flex items-center gap-1.5 bg-sky-400/10 border border-sky-400/30 px-2.5 py-1 rounded-xl hover:bg-sky-400/20 transition-colors"
            >
              <Video size={13} className="text-sky-400" />
              <span className="text-[11px] font-black text-sky-400">Record</span>
            </button>
            <button
              disabled={currentDay <= 1}
              onClick={() => setCurrentDay((prev) => Math.max(1, prev - 1))}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                currentDay <= 1 ? 'bg-slate-800/50 cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-700'
              }`}
            >
              <ArrowLeft size={14} className={currentDay <= 1 ? 'text-slate-600' : 'text-[#00D084]'} />
            </button>
            <button
              disabled={currentDay >= 365}
              onClick={async () => {
                const nextDay = currentDay + 1;
                const unlocked = await isDayUnlocked(courseId, nextDay);
                if (unlocked) {
                  setCurrentDay(nextDay);
                } else {
                  alert(`🔒 Complete all tasks of Day ${currentDay} first to unlock Day ${nextDay}`);
                }
              }}
              className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors"
            >
              <ArrowRight size={14} className="text-[#00D084]" />
            </button>
          </div>
        </div>

        {/* 2. UNIFIED 10-CLASS + HOLISTIC STEPS BAR */}
        <div className="bg-[#0A1020] border-b border-slate-800 py-2">
          <div className="flex overflow-x-auto px-4 gap-2 no-scrollbar pb-1">
            {[
              { id: 'maths' as StepKey, label: '📐 Class 1: Maths Core', isDone: completedSteps.maths },
              { id: 'science' as StepKey, label: '🔬 Class 2: Science Core', isDone: completedSteps.science },
              { id: 'languages' as StepKey, label: '📖 Class 3: Languages', isDone: completedSteps.languages },
              { id: 'social' as StepKey, label: '🌍 Class 4: Social Science', isDone: completedSteps.social },
              { id: 'currentaffairs' as StepKey, label: '📰 Class 5: GK & Current Affairs', isDone: completedSteps.currentaffairs },
              { id: 'penmanship' as StepKey, label: '✍️ Class 6: Handwriting', isDone: completedSteps.penmanship },
              { id: 'extracurricular' as StepKey, label: '🎨 Class 7: Extracurricular', isDone: completedSteps.extracurricular },
              { id: 'ambition' as StepKey, label: '🏛️ Class 8: Career Track', isDone: completedSteps.ambition },
              { id: 'masterclass' as StepKey, label: '🎥 Class 9: Visual Masterclass', isDone: completedSteps.masterclass },
              { id: 'revision' as StepKey, label: '🌙 Class 10: Bedtime Revision', isDone: completedSteps.revision },
              { id: 'yoga' as StepKey, label: '🧘 Daily Yoga (10m)', isDone: completedSteps.yoga },
              { id: 'homework' as StepKey, label: '🎒 School Homework & AI', isDone: completedSteps.homework },
              { id: 'test' as StepKey, label: '🎯 CBT Quiz Drill', isDone: completedSteps.test },
              { id: 'drive_feedback' as StepKey, label: '📹 Drive Video Upload', isDone: completedSteps.drive_feedback },
            ].map((stepItem, idx) => {
              const isActive = activeStep === stepItem.id;
              return (
                <button
                  key={stepItem.id}
                  onClick={() => isStepUnlocked(stepItem.id) && setActiveStep(stepItem.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors ${
                    !isStepUnlocked(stepItem.id)
                      ? 'bg-[#131F37] border-slate-800 opacity-40 cursor-not-allowed'
                      : isActive
                      ? 'bg-[#00D084]/15 border-[#00D084]'
                      : stepItem.isDone
                      ? 'bg-[#131F37] border-[#00D084]/40'
                      : 'bg-[#131F37] border-slate-800 hover:border-slate-600'
                  }`}
                >
                  {stepItem.isDone ? (
                    <CheckCircle2 size={13} className="text-[#00D084]" />
                  ) : !isStepUnlocked(stepItem.id) ? (
                    <Lock size={12} className="text-slate-600" />
                  ) : (
                    <span className={`text-[10px] font-black ${isActive ? 'text-[#00D084]' : 'text-slate-400'}`}>
                      {idx + 1}
                    </span>
                  )}
                  <span
                    className={`text-[11px] font-bold whitespace-nowrap ${
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
              <p className="text-sm font-bold">Loading Day {currentDay} of 365 Curriculum...</p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6 pb-20">
              
              {/* CLASS 1: Mathematics Core */}
              {activeStep === 'maths' && (
                <div className="space-y-4">
                  <div className="bg-[#0E172A] rounded-2xl border border-slate-800 p-4 space-y-2">
                    <div className="flex items-center gap-1 text-amber-500 mb-2">
                      <Layers size={14} />
                      <span className="text-[10px] font-black tracking-wide">CLASS 1 · MATHEMATICS CORE (15 MIN)</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-white">{mathsTask.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{mathsTask.summary}</p>
                  </div>
                  <ImmersiveVideoWebPlayer
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

              {/* CLASS 2: Science Core */}
              {activeStep === 'science' && (
                <div className="space-y-4">
                  <div className="bg-[#0E172A] rounded-2xl border border-slate-800 p-4 space-y-2">
                    <div className="flex items-center gap-1 text-emerald-500 mb-2">
                      <Zap size={14} />
                      <span className="text-[10px] font-black tracking-wide">CLASS 2 · SCIENCE CORE (15 MIN)</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-white">{scienceTask.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{scienceTask.summary}</p>
                  </div>
                  <ImmersiveVideoWebPlayer
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

              {/* CLASS 3: Languages */}
              {activeStep === 'languages' && (
                <div className="space-y-4">
                  <div className="bg-[#0E172A] rounded-2xl border border-slate-800 p-4 space-y-2">
                    <div className="flex items-center gap-1 text-pink-500 mb-2">
                      <BookOpen size={14} />
                      <span className="text-[10px] font-black tracking-wide">CLASS 3 · LANGUAGES — தமிழ் & ENGLISH (15 MIN)</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-white">{languagesTask.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{languagesTask.summary}</p>
                  </div>
                  <ImmersiveVideoWebPlayer
                    videoId={languagesTask.youtubeVideoId}
                    title={languagesTask.title}
                    channelName={languagesTask.channelName}
                    summary={languagesTask.summary}
                    durationMinutes={languagesTask.durationMinutes}
                    isCompleted={completedSteps.languages}
                    onMarkComplete={() => handleMarkStepComplete('languages', 25)}
                    xpReward={25}
                  />
                </div>
              )}

              {/* CLASS 4: Social Science Awareness */}
              {activeStep === 'social' && (
                <div className="space-y-4">
                  <div className="bg-[#0E172A] rounded-2xl border border-slate-800 p-4 space-y-2">
                    <div className="flex items-center gap-1 text-violet-500 mb-2">
                      <Target size={14} />
                      <span className="text-[10px] font-black tracking-wide">CLASS 4 · SOCIAL SCIENCE AWARENESS (15 MIN)</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-white">{socialScienceTask.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{socialScienceTask.summary}</p>
                  </div>
                  <ImmersiveVideoWebPlayer
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

              {/* CLASS 5: GK & Current Affairs */}
              {activeStep === 'currentaffairs' && (
                <div className="space-y-4">
                  <div className="bg-[#0E172A] rounded-2xl border border-slate-800 p-4 space-y-2">
                    <div className="flex items-center gap-1 text-[#00D084] mb-2">
                      <Sparkles size={14} />
                      <span className="text-[10px] font-black tracking-wide">CLASS 5 · GENERAL KNOWLEDGE & CURRENT AFFAIRS (10 MIN)</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-white">{currentAffairs.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">India and Tamil Nadu governance, scientific milestones, and global events.</p>
                  </div>
                  <ImmersiveVideoWebPlayer
                    videoId={currentAffairs.youtubeVideoId}
                    title={currentAffairs.title}
                    channelName={currentAffairs.channelName}
                    summary="All-India national schemes, defense updates & civics knowledge."
                    durationMinutes={currentAffairs.durationMinutes}
                    isCompleted={completedSteps.currentaffairs}
                    onMarkComplete={() => handleMarkStepComplete('currentaffairs', 20)}
                    xpReward={20}
                  />
                </div>
              )}

              {/* CLASS 6: Handwriting & Penmanship */}
              {activeStep === 'penmanship' && (
                <div className="space-y-4">
                  <div className="bg-[#0E172A] rounded-2xl border border-slate-800 p-4 space-y-2">
                    <div className="flex items-center gap-1 text-cyan-400 mb-2">
                      <FileText size={14} />
                      <span className="text-[10px] font-black tracking-wide">CLASS 6 · HANDWRITING & PENMANSHIP PRACTICE (10 MIN)</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-white">{penmanshipTask.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{penmanshipTask.description}</p>
                  </div>
                  
                  <div className="bg-[#0E172A] rounded-2xl border border-slate-800 p-4 space-y-2">
                    <h4 className="text-[12px] font-extrabold text-cyan-400 tracking-wide">✍️ DAILY PENMANSHIP TARGET:</h4>
                    <p className="text-sm text-slate-200 leading-relaxed">{penmanshipTask.prompt}</p>
                  </div>
                  
                  <button
                    onClick={() => handleMarkStepComplete('penmanship', 20)}
                    className="w-full flex items-center justify-center gap-2 bg-[#00D084] text-[#070C18] py-3 rounded-2xl font-black text-sm shadow-lg hover:bg-[#00E594] transition-colors"
                  >
                    <CheckCircle2 size={18} />
                    <span>Complete Handwriting Practice (+20 XP) ➡️</span>
                  </button>
                </div>
              )}

              {/* CLASS 7: Extracurricular & Creative Skills */}
              {activeStep === 'extracurricular' && (
                <div className="space-y-4">
                  <div className="bg-[#0E172A] rounded-2xl border border-slate-800 p-4 space-y-2">
                    <div className="flex items-center gap-1 text-purple-400 mb-2">
                      <Sparkles size={14} />
                      <span className="text-[10px] font-black tracking-wide">CLASS 7 · EXTRACURRICULAR & CREATIVE SKILLS (10 MIN)</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-white">{extracurricularTask.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{extracurricularTask.description}</p>
                  </div>
                  
                  <div className="bg-[#0E172A] rounded-2xl border border-slate-800 p-4 space-y-2">
                    <h4 className="text-[12px] font-extrabold text-purple-400 tracking-wide">🎨 CREATIVE & ETHICAL PROMPT:</h4>
                    <p className="text-sm text-slate-200 leading-relaxed">{extracurricularTask.actionPrompt}</p>
                  </div>
                  
                  <button
                    onClick={() => handleMarkStepComplete('extracurricular', 20)}
                    className="w-full flex items-center justify-center gap-2 bg-[#00D084] text-[#070C18] py-3 rounded-2xl font-black text-sm shadow-lg hover:bg-[#00E594] transition-colors"
                  >
                    <CheckCircle2 size={18} />
                    <span>Mark Extracurricular Complete (+20 XP) ➡️</span>
                  </button>
                </div>
              )}

              {/* CLASS 8: Futuristic Career Track */}
              {activeStep === 'ambition' && (
                <div className="space-y-4">
                  <div className="bg-[#0E172A] rounded-2xl border border-slate-800 p-4 space-y-2">
                    <div className="flex items-center gap-1 text-amber-400 mb-2">
                      <GraduationCap size={14} />
                      <span className="text-[10px] font-black tracking-wide">CLASS 8 · FUTURISTIC CAREER TRACK (15 MIN)</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-white">{ambitionTrackTask.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{ambitionTrackTask.summary}</p>
                  </div>
                  <ImmersiveVideoWebPlayer
                    videoId={ambitionTrackTask.youtubeVideoId}
                    title={ambitionTrackTask.title}
                    channelName={ambitionTrackTask.channelName}
                    summary={ambitionTrackTask.summary}
                    durationMinutes={ambitionTrackTask.durationMinutes}
                    isCompleted={completedSteps.ambition}
                    onMarkComplete={() => handleMarkStepComplete('ambition', 30)}
                    xpReward={30}
                  />
                </div>
              )}

              {/* CLASS 9: Visual Explainer Video Masterclass */}
              {activeStep === 'masterclass' && (
                <div className="space-y-4">
                  <div className="bg-[#0E172A] rounded-2xl border border-slate-800 p-4 space-y-2">
                    <div className="flex items-center gap-1 text-teal-400 mb-2">
                      <Video size={14} />
                      <span className="text-[10px] font-black tracking-wide">CLASS 9 · VISUAL MASTERCLASS SIMULATION (15 MIN)</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-white">{masterclassTask.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{masterclassTask.summary}</p>
                  </div>
                  <ImmersiveVideoWebPlayer
                    videoId={masterclassTask.youtubeVideoId}
                    title={masterclassTask.title}
                    channelName={masterclassTask.channelName}
                    summary={masterclassTask.summary}
                    durationMinutes={masterclassTask.durationMinutes}
                    isCompleted={completedSteps.masterclass}
                    onMarkComplete={() => handleMarkStepComplete('masterclass', 25)}
                    xpReward={25}
                  />
                </div>
              )}

              {/* CLASS 10: Bedtime Revision */}
              {activeStep === 'revision' && (
                <div className="space-y-4">
                  <div className="bg-[#0E172A] rounded-2xl border border-slate-800 p-4 space-y-2">
                    <div className="flex items-center gap-1 text-emerald-400 mb-2">
                      <CheckCircle2 size={14} />
                      <span className="text-[10px] font-black tracking-wide">CLASS 10 · BEDTIME REVISION & MEMORY RECAP (10 MIN)</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-white">{bedtimeRevisionTask.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{bedtimeRevisionTask.summary}</p>
                  </div>

                  <div className="bg-[#0E172A] rounded-2xl border border-slate-800 p-4 space-y-3">
                    <h4 className="text-[12px] font-extrabold text-emerald-400 tracking-wide">🌙 DAILY FORMULA & CONCEPT VAULT:</h4>
                    <ul className="space-y-2">
                      {bedtimeRevisionTask.keyPoints.map((pt: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-200">
                          <span className="text-emerald-400 font-extrabold min-w-[20px]">✓</span>
                          <span className="leading-relaxed">{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => handleMarkStepComplete('revision', 20)}
                    className="w-full flex items-center justify-center gap-2 bg-[#00D084] text-[#070C18] py-3 rounded-2xl font-black text-sm shadow-lg hover:bg-[#00E594] transition-colors"
                  >
                    <CheckCircle2 size={18} />
                    <span>Mark Bedtime Revision Complete (+20 XP) ➡️</span>
                  </button>
                </div>
              )}

              {/* HOLISTIC: Yoga */}
              {activeStep === 'yoga' && (
                <div className="space-y-4">
                  <div className="bg-[#0E172A] rounded-2xl border border-slate-800 p-4 space-y-2">
                    <div className="flex items-center gap-1 text-pink-500 mb-2">
                      <Heart size={14} />
                      <span className="text-[10px] font-black tracking-wide">DAILY HOLISTIC · FITNESS & YOGA (10 MIN)</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-white">{exerciseYoga.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">Asana / Routine: {exerciseYoga.asanaOrWorkout}</p>
                  </div>
                  <ImmersiveVideoWebPlayer
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

              {/* SCHOOL HOMEWORK & AI SCANNER */}
              {activeStep === 'homework' && (
                <div className="space-y-4">
                  <div className="bg-[#0E172A] rounded-2xl border border-slate-800 p-4 space-y-2">
                    <div className="flex items-center gap-1 text-sky-400 mb-2">
                      <FileText size={14} />
                      <span className="text-[10px] font-black tracking-wide">SCHOOL HOMEWORK & AI TEXTBOOK TUTOR</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-white">{homeworkTask.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{homeworkTask.description}</p>
                  </div>

                  {/* AI Book Page Scanner Launch Card */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                        <Camera size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white">Need Help With Your School Textbook Page?</h4>
                        <p className="text-xs text-slate-300">
                          Photograph your school book page for step-by-step reading guidance, answers, and 5-MCQ drill.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsBookScannerOpen(true)}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs rounded-xl shadow-md hover:scale-105 transition-all shrink-0 flex items-center gap-1.5"
                    >
                      <Sparkles size={14} />
                      <span>Open AI Book Scanner</span>
                    </button>
                  </div>
                  
                  <div className="bg-[#0E172A] rounded-2xl border border-slate-800 p-4 space-y-3">
                    <h4 className="text-[12px] font-extrabold text-sky-400 tracking-wide">✍️ PRACTICE QUESTIONS TO SOLVE IN NOTEBOOK:</h4>
                    <ul className="space-y-2">
                      {(homeworkTask.questions || []).map((q: string, idx: number) => {
                        const [num, ...rest] = q.split('.');
                        return (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-200">
                            <span className="text-sky-400 font-extrabold min-w-[20px]">{num}.</span>
                            <span className="leading-relaxed">{rest.join('.')}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  
                  <button
                    onClick={() => handleMarkStepComplete('homework', 25)}
                    className="w-full flex items-center justify-center gap-2 bg-[#00D084] text-[#070C18] py-3 rounded-2xl font-black text-sm shadow-lg hover:bg-[#00E594] transition-colors"
                  >
                    <CheckCircle2 size={18} />
                    <span>Mark Homework Complete (+25 XP) ➡️</span>
                  </button>
                </div>
              )}

              {/* DAILY CBT TEST */}
              {activeStep === 'test' && (
                <div className="space-y-4">
                  <div className="bg-[#0E172A] rounded-2xl border border-slate-800 p-4 space-y-2">
                    <div className="flex items-center gap-1 text-amber-500 mb-2">
                      <Target size={14} />
                      <span className="text-[10px] font-black tracking-wide">DAILY CBT TEST DRILL</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-white">{plan?.mcqTest?.testTitle || 'Daily Assessment'}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {plan?.mcqTest?.questions?.length || 0} High-Yield Exam Questions • Instant Scoring
                    </p>
                  </div>

                  {(plan?.mcqTest?.questions || []).map((q: any, qIdx: number) => (
                    <div key={q.id} className="bg-[#0E172A] rounded-2xl border border-slate-800 p-4 space-y-3">
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
                      className="w-full flex items-center justify-center gap-2 bg-[#00D084] text-[#070C18] py-3 rounded-2xl font-black text-sm shadow-lg hover:bg-[#00E594] transition-colors"
                    >
                      <Award size={18} />
                      <span>Submit Assessment & Reveal Score</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveStep('drive_feedback')}
                      className="w-full flex items-center justify-center gap-2 bg-[#00D084] text-[#070C18] py-3 rounded-2xl font-black text-sm shadow-lg hover:bg-[#00E594] transition-colors"
                    >
                      <ArrowRight size={18} />
                      <span>Go to Drive Video Feedback ➡️</span>
                    </button>
                  )}
                </div>
              )}

              {/* DRIVE VIDEO FEEDBACK */}
              {activeStep === 'drive_feedback' && (
                <div className="space-y-4">
                  <div className="bg-[#0E172A] rounded-2xl border border-slate-800 p-4 space-y-2">
                    <div className="flex items-center gap-1 text-sky-400 mb-2">
                      <HardDrive size={14} />
                      <span className="text-[10px] font-black tracking-wide">DRIVE VIDEO RECORDING & REFLECTION</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-white">Daily Video Learning Reflection</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Record a 1-minute video explaining what you learned today, upload directly to Google Drive for teacher verification.
                    </p>
                  </div>

                  <button
                    onClick={() => setIsVideoFeedbackOpen(true)}
                    className="w-full py-4 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
                  >
                    <Video size={18} />
                    <span>Open Camera & Record Daily Video Feedback</span>
                  </button>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Sub-Modals */}
        {isVideoFeedbackOpen && (
          <TaskVideoFeedbackModal
            isOpen={isVideoFeedbackOpen}
            onClose={() => setIsVideoFeedbackOpen(false)}
            courseId={courseId}
            courseTitle={courseTitle}
            dayNumber={currentDay}
            stepId={activeStep}
            stepTitle={`Day ${currentDay} Learning Reflection`}
            onVideoSubmitted={() => {
              handleMarkStepComplete('drive_feedback', 50);
              setIsVideoFeedbackOpen(false);
            }}
          />
        )}

        {isBookScannerOpen && (
          <TutOBookPageScannerModal
            isOpen={isBookScannerOpen}
            onClose={() => setIsBookScannerOpen(false)}
            defaultGrade={courseTitle.includes('5') ? 'Class 5' : 'Class 10'}
            defaultSubject="Mathematics"
          />
        )}

      </div>
    </div>
  );
};
