/**
 * TeachO Master Unified Curriculum Resolver
 * Dynamically resolves 100% authentic, chapter-by-chapter curriculum for all 96+ courses!
 */

import { TNPSC_TAMIL_SYLLABUS, TNPSC_POLITY_SYLLABUS, TNPSC_MATHS_SYLLABUS } from './tnpscCurriculum';
import { UPSC_POLITY_SYLLABUS, UPSC_HISTORY_SYLLABUS, UPSC_ECONOMY_SYLLABUS } from './upscCurriculum';
import {
  CLASS_10_MATHS,
  CLASS_10_SCIENCE,
  PRIMARY_MATHS_MODULES,
  PRIMARY_EVS_SCIENCE,
  PRIMARY_LANGUAGE_LIT,
  MIDDLE_MATHS,
  MIDDLE_SCIENCE,
  COLLEGE_CSE_MODULES,
  COLLEGE_COMMERCE_MODULES,
  KIDS_SKILLS_MODULES,
} from './schoolCurriculum';
import { PYTHON_AI_SYLLABUS, FULLSTACK_WEB_SYLLABUS } from './skillsCurriculum';
import { resolveMasterSequentialSyllabus } from './masterCurriculumRegistry';

export interface DailySubjectTask {
  id: string;
  title: string;
  subtitle?: string;
  subject: string;
  topic: string;
  subtopic?: string;
  rawSubject: string;
  rawTopic: string;
  durationMinutes: number;
  duration: string;
  taskType: 'video' | 'reading' | 'practice' | 'activity' | 'test' | 'revision';
  type: string;
  icon: string;
  activityPrompt?: string;
  completed?: boolean;
}

export interface DayPlan {
  dayNumber: number;
  day: number;
  blockNumber: number;
  phaseTitle: string;
  themeTitle: string;
  totalDurationMins: number;
  totalMinutes: number;
  tasks: DailySubjectTask[];
  dailyRevision: string;
  dailyTestSummary: {
    questionCount: number;
    testType: 'oral' | 'mcq' | 'hands-on';
    focusArea: string;
  };
}

/**
 * Resolves the exact DayPlan for any course and day number
 * Integrates directly with Master Sequential Curriculum Registry
 */
export function resolveMasterCurriculumPlan(
  courseOrTitle: any,
  categoryOrDay: any = 1,
  dayParam: number = 1,
  totalDaysParam: number = 200
): DayPlan {
  let courseId = '';
  let courseTitle = 'Foundation Course';
  let category = 'school_primary';
  let day = 1;
  let totalDays = 200;
  let phaseTitle = 'Phase 1: Foundation Building';

  if (typeof courseOrTitle === 'object' && courseOrTitle !== null) {
    courseId = courseOrTitle.id || '';
    courseTitle = courseOrTitle.title || courseOrTitle.short || 'Master Course';
    category = courseOrTitle.category || 'school_primary';
    day = typeof categoryOrDay === 'number' ? categoryOrDay : 1;
    totalDays = courseOrTitle.totalDays || 200;
    phaseTitle = courseOrTitle.phaseTitle || phaseTitle;
  } else {
    courseTitle = typeof courseOrTitle === 'string' ? courseOrTitle : 'Master Course';
    category = typeof categoryOrDay === 'string' ? categoryOrDay : 'school_primary';
    day = typeof dayParam === 'number' ? dayParam : 1;
    totalDays = typeof totalDaysParam === 'number' ? totalDaysParam : 200;
  }

  const safeDay = Math.max(1, Math.min(day, totalDays));
  const blockNum = Math.ceil(safeDay / 10);
  const isTamilMedium = courseTitle.includes('தமிழ்') || courseId.includes('-ta-') || courseId.includes('10-ta');

  // Build 4 to 5 authentic subject period tasks from master sequential curriculum
  const taskCount = isTamilMedium || courseId.includes('7') || courseId.includes('10') ? 5 : 4;
  const tasks: DailySubjectTask[] = [];

  const icons = ['📐', '🔬', '🌍', '📜', '📚', '🎯'];
  const taskTypes = ['practice', 'video', 'reading', 'reading', 'test'];

  for (let tNum = 1; tNum <= taskCount; tNum++) {
    const item = resolveMasterSequentialSyllabus(courseId, courseTitle, safeDay, tNum);
    tasks.push({
      id: `task_${safeDay}_${tNum}`,
      title: item.topicTitle,
      subtitle: item.subtopic ? `${item.chapterTitle} • ${item.subtopic}` : item.overview.substring(0, 70),
      subject: item.subject,
      topic: item.topicTitle,
      subtopic: item.subtopic,
      rawSubject: item.subject,
      rawTopic: item.topicTitle,
      durationMinutes: tNum === taskCount ? 15 : 20,
      duration: tNum === taskCount ? '15 Min' : '20 Min',
      taskType: taskTypes[(tNum - 1) % taskTypes.length],
      type: taskTypes[(tNum - 1) % taskTypes.length],
      icon: icons[(tNum - 1) % icons.length],
      activityPrompt: `Day ${safeDay} (Period ${tNum}): Master ${item.topicTitle} with standard textbook exercises.`
    });
  }

  let totalMins = 0;
  tasks.forEach(task => { totalMins += task.durationMinutes; });

  const themeTitle = tasks.length > 0 ? `Day ${safeDay}: ${tasks[0].subject} & ${tasks[1]?.subject || 'Core Concepts'}` : `Day ${safeDay} Comprehensive Routine`;

  return {
    dayNumber: safeDay,
    day: safeDay,
    blockNumber: blockNum,
    phaseTitle: `Phase ${Math.min(4, blockNum)}: Academic Mastery & Exam Readiness`,
    themeTitle,
    totalDurationMins: totalMins,
    totalMinutes: totalMins,
    tasks,
    dailyRevision: `Recap all ${tasks.length} subject periods covered on Day ${safeDay}.`,
    dailyTestSummary: { questionCount: 4, testType: 'mcq', focusArea: tasks[0]?.topic || 'Day Review' }
  };
}
