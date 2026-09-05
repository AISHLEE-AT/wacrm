/**
 * TutO Day Plan Nano Engine
 * Deterministically maps any course's authentic government-notified nano syllabus
 * into a structured Day 1 to Day 200 daily learning schedule.
 */

import {
  getOfficialGovernmentSyllabus,
  OfficialCourseSyllabus,
  OfficialSubjectSyllabus,
  OfficialChapter,
  OfficialMicroTopic,
  OfficialNanoConcept,
} from './officialGovernmentSyllabusRegistry';

export interface NanoRoutineTask {
  id: string;
  stepNumber: number;
  taskName: string;
  topic: string;
  tamilTopic?: string;
  subject: string;
  chapterTitle: string;
  unitNumber?: string | number;
  durationMinutes: number;
  xp: number;
  type: 'briefing' | 'video' | 'notes' | 'quiz' | 'ai_tutor';
  status: 'locked' | 'in_progress' | 'completed';
  conceptCode?: string;
  nanoConcept?: OfficialNanoConcept;
  microTopic?: OfficialMicroTopic;
}

export interface NanoDayPlan {
  courseId: string;
  courseTitle: string;
  dayNumber: number;
  totalDays: number;
  targetSubject: string;
  targetChapter: string;
  targetTopicTitle: string;
  targetTamilTopic?: string;
  conceptCode?: string;
  keyRuleOrFormula?: string;
  importance: 'High-Yield' | 'Core Standard' | 'Foundational';
  tasks: NanoRoutineTask[];
  activeNanoConcept?: OfficialNanoConcept;
  activeMicroTopic?: OfficialMicroTopic;
}

export function resolveNanoDayPlan(
  courseId: string,
  courseTitle: string,
  dayNumber: number = 1,
  board?: string
): NanoDayPlan {
  const safeDay = Math.max(1, dayNumber);
  const syllabus: OfficialCourseSyllabus = getOfficialGovernmentSyllabus(courseId, board);

  // Flatten all micro-topics & nano-concepts across all subjects in order
  interface FlatConceptItem {
    subject: OfficialSubjectSyllabus;
    chapter: OfficialChapter;
    microTopic: OfficialMicroTopic;
    nanoConcept?: OfficialNanoConcept;
  }

  const flattenedItems: FlatConceptItem[] = [];

  for (const subj of syllabus.subjects || []) {
    for (const chap of subj.chapters || []) {
      for (const top of chap.topics || []) {
        if (top.nanoConcepts && top.nanoConcepts.length > 0) {
          for (const nano of top.nanoConcepts) {
            flattenedItems.push({
              subject: subj,
              chapter: chap,
              microTopic: top,
              nanoConcept: nano,
            });
          }
        } else {
          flattenedItems.push({
            subject: subj,
            chapter: chap,
            microTopic: top,
          });
        }
      }
    }
  }

  const totalItems = flattenedItems.length;
  const totalDays = 365;

  // Pick the scheduled item for safeDay using circular index
  const activeItemIndex = totalItems > 0 ? (safeDay - 1) % totalItems : 0;
  const activeItem = flattenedItems[activeItemIndex] || {
    subject: { subjectName: 'Core Subject', subjectId: 'core', icon: '📚', color: '#10b981', totalChapters: 1, totalTopics: 1, chapters: [] },
    chapter: { chapterNumber: 1, chapterTitle: 'Foundations', topicsCount: 1, isFreePreview: true, topics: [] },
    microTopic: { id: 'top_1', title: 'Core Topic', importance: 'High-Yield' as const, hasVideo: true, hasNotes: true, hasQuiz: true },
  };

  const subjName = activeItem.subject.subjectName;
  const chapTitle = activeItem.chapter.chapterTitle;
  const topTitle = activeItem.microTopic.title;
  const tamilTitle = activeItem.nanoConcept?.tamilName || activeItem.microTopic.tamilTitle;
  const conceptCode = activeItem.nanoConcept?.conceptCode || activeItem.microTopic.topicCode || `DAY-${safeDay}`;
  const formula = activeItem.nanoConcept?.keyRuleOrFormula || activeItem.microTopic.keyFormula || activeItem.microTopic.keyAxiomOrLaw;

  // Build 5-step daily routine
  const tasks: NanoRoutineTask[] = [
    {
      id: `task_${safeDay}_1`,
      stepNumber: 1,
      taskName: `Step 1: Nano Concept Briefing (${conceptCode})`,
      topic: activeItem.nanoConcept?.name || topTitle,
      tamilTopic: tamilTitle,
      subject: subjName,
      chapterTitle: chapTitle,
      unitNumber: activeItem.chapter.unitNumber,
      durationMinutes: 8,
      xp: 40,
      type: 'briefing',
      status: 'in_progress',
      conceptCode,
      nanoConcept: activeItem.nanoConcept,
      microTopic: activeItem.microTopic,
    },
    {
      id: `task_${safeDay}_2`,
      stepNumber: 2,
      taskName: `Step 2: AI Interactive Voice & Video Lecture`,
      topic: activeItem.nanoConcept?.name || topTitle,
      tamilTopic: tamilTitle,
      subject: subjName,
      chapterTitle: chapTitle,
      unitNumber: activeItem.chapter.unitNumber,
      durationMinutes: 12,
      xp: 60,
      type: 'video',
      status: 'in_progress',
      conceptCode,
      nanoConcept: activeItem.nanoConcept,
      microTopic: activeItem.microTopic,
    },
    {
      id: `task_${safeDay}_3`,
      stepNumber: 3,
      taskName: `Step 3: Deep Study Notes & Model Solutions`,
      topic: activeItem.nanoConcept?.name || topTitle,
      tamilTopic: tamilTitle,
      subject: subjName,
      chapterTitle: chapTitle,
      unitNumber: activeItem.chapter.unitNumber,
      durationMinutes: 10,
      xp: 50,
      type: 'notes',
      status: 'in_progress',
      conceptCode,
      nanoConcept: activeItem.nanoConcept,
      microTopic: activeItem.microTopic,
    },
    {
      id: `task_${safeDay}_4`,
      stepNumber: 4,
      taskName: `Step 4: Nano CBT Micro-Drill (5 Qs)`,
      topic: activeItem.nanoConcept?.name || topTitle,
      tamilTopic: tamilTitle,
      subject: subjName,
      chapterTitle: chapTitle,
      unitNumber: activeItem.chapter.unitNumber,
      durationMinutes: 10,
      xp: 75,
      type: 'quiz',
      status: 'in_progress',
      conceptCode,
      nanoConcept: activeItem.nanoConcept,
      microTopic: activeItem.microTopic,
    },
    {
      id: `task_${safeDay}_5`,
      stepNumber: 5,
      taskName: `Step 5: Socratic AI Tutor Revision & Doubt Solver`,
      topic: activeItem.nanoConcept?.name || topTitle,
      tamilTopic: tamilTitle,
      subject: subjName,
      chapterTitle: chapTitle,
      unitNumber: activeItem.chapter.unitNumber,
      durationMinutes: 8,
      xp: 50,
      type: 'ai_tutor',
      status: 'in_progress',
      conceptCode,
      nanoConcept: activeItem.nanoConcept,
      microTopic: activeItem.microTopic,
    },
  ];

  return {
    courseId,
    courseTitle: syllabus.courseTitle || courseTitle,
    dayNumber: safeDay,
    totalDays,
    targetSubject: subjName,
    targetChapter: chapTitle,
    targetTopicTitle: activeItem.nanoConcept?.name || topTitle,
    targetTamilTopic: tamilTitle,
    conceptCode,
    keyRuleOrFormula: formula,
    importance: activeItem.microTopic.importance as any,
    tasks,
    activeNanoConcept: activeItem.nanoConcept,
    activeMicroTopic: activeItem.microTopic,
  };
}
