/**
 * TeachO Master Unified Curriculum Resolver
 * Dynamically resolves 100% authentic, chapter-by-chapter curriculum for all 96+ courses!
 */

import { resolveMasterSequentialSyllabus } from './masterCurriculumRegistry';

export function cleanUnicodeString(val: any): string {
  if (typeof val !== 'string') return '';
  return val
    .replace(/[\uFFFD\u0080-\u009F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface DailySubjectTask {
  id: string;
  title: string;
  subtitle?: string;
  subject: string;
  topic: string;
  subtopic?: string;
  rawSubject: string;
  rawTopic: string;
  aiPrompt?: string;
  keyFormula?: string;
  learningObjective?: string;
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
  const isTamilMedium = (courseTitle || '').includes('தமிழ்') || (courseId || '').includes('-ta-') || (courseId || '').includes('10-ta');

  // Build 4 to 5 authentic subject period tasks from master sequential curriculum
  const taskCount = isTamilMedium || courseId.includes('7') || courseId.includes('10') ? 5 : 4;
  const tasks: DailySubjectTask[] = [];

  const icons = ['📐', '🔬', '🌍', '📜', '📚', '🎯'];
  const taskTypes: Array<DailySubjectTask['taskType']> = ['practice', 'video', 'reading', 'reading', 'test'];

  for (let tNum = 1; tNum <= taskCount; tNum++) {
    const item = resolveMasterSequentialSyllabus(courseId, courseTitle, safeDay, tNum);
    const subName = cleanUnicodeString(item.subject);
    const topTitle = cleanUnicodeString(item.topicTitle);
    const chapTitle = cleanUnicodeString(item.chapterTitle);
    const subTop = cleanUnicodeString(item.subtopic);
    const ovView = cleanUnicodeString(item.overview);

    tasks.push({
      id: `task_${safeDay}_${tNum}`,
      title: topTitle,
      subtitle: subTop ? `${chapTitle} • ${subTop}` : ovView.substring(0, 70),
      subject: subName,
      topic: topTitle,
      subtopic: subTop,
      rawSubject: subName,
      rawTopic: topTitle,
      aiPrompt: cleanUnicodeString((item as any).aiPrompt || ''),
      keyFormula: cleanUnicodeString((item as any).formula || (item as any).formulaOrLaw || ''),
      learningObjective: ovView,
      durationMinutes: tNum === taskCount ? 15 : 20,
      duration: tNum === taskCount ? '15 Min' : '20 Min',
      taskType: taskTypes[(tNum - 1) % taskTypes.length],
      type: taskTypes[(tNum - 1) % taskTypes.length],
      icon: icons[(tNum - 1) % icons.length],
      activityPrompt: `Day ${safeDay} (Period ${tNum}): Master ${topTitle} with standard textbook exercises.`
    });
  }

  let totalMins = 0;
  tasks.forEach(task => { totalMins += task.durationMinutes; });

  // Generate high-impact, unique day milestone heading
  const uniqueDailyTopics = tasks.map(t => {
    const raw = t.subtopic || t.topic || '';
    return cleanUnicodeString(raw)
      .replace(/\s*\(Day\s+\d+.*?\)/i, '')
      .replace(/^[A-Za-z0-9\s&—\-()]*(?:Core|SSLC|Tuition|Foundation|Special):\s*/i, '')
      .trim();
  }).filter(Boolean);

  const themeTopicSnippet = uniqueDailyTopics.slice(0, 2).join(' • ');
  const themeTitle = themeTopicSnippet 
    ? `Day ${safeDay}: ${themeTopicSnippet}`
    : `Day ${safeDay}: ${tasks[0]?.subject || 'Academic Core'} & Daily Practice`;

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

/**
 * Convenience helper to extract the precise, unique AI Prompt for any course, day, and step
 */
export function getStepAiPrompt(courseOrId: any, day: number = 1, stepNumber: number = 1): string {
  const plan = resolveMasterCurriculumPlan(courseOrId, day);
  const task = plan.tasks.find(t => t.id === `task_${day}_${stepNumber}`) || plan.tasks[stepNumber - 1];
  return task?.aiPrompt || '';
}

/**
 * Returns all step prompts for a given course and day
 */
export function getAllCourseStepPrompts(courseOrId: any, day: number = 1): Array<{ step: number; subject: string; topic: string; aiPrompt: string }> {
  const plan = resolveMasterCurriculumPlan(courseOrId, day);
  return plan.tasks.map((t, idx) => ({
    step: idx + 1,
    subject: t.subject,
    topic: t.topic,
    aiPrompt: t.aiPrompt || ''
  }));
}
