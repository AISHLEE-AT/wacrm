/**
 * TeachO Master Unified Curriculum Resolver
 * Dynamically resolves 100% authentic, chapter-by-chapter curriculum for all 96+ courses!
 */

import { resolveMasterSequentialSyllabus } from './masterCurriculumRegistry';
import { getKindergartenDayPlan, getAllKindergartenDayPlans } from './kindergarten200DaysCurriculum';
import { getPrimaryDayPlan } from './primary200DaysCurriculum';
import { getMiddleDayPlan } from './middle200DaysCurriculum';
import { getSecondaryDayPlan } from './secondary200DaysCurriculum';
import { getExamDayPlan } from './entranceAndCompetitive200DaysCurriculum';

export { getKindergartenDayPlan, getAllKindergartenDayPlans } from './kindergarten200DaysCurriculum';
export { getPrimaryDayPlan } from './primary200DaysCurriculum';
export { getMiddleDayPlan } from './middle200DaysCurriculum';
export { getSecondaryDayPlan } from './secondary200DaysCurriculum';
export { getExamDayPlan } from './entranceAndCompetitive200DaysCurriculum';

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

  // 0. KINDERGARTEN (LKG & UKG) 200-DAY 6-TASK MULTI-ACTIVITY ROUTE
  const lowerTitle = courseTitle.toLowerCase();
  const lowerId = courseId.toLowerCase();
  if (
    lowerId.includes('kg') ||
    lowerId.includes('lkg') ||
    lowerId.includes('ukg') ||
    lowerTitle.includes('kindergarten') ||
    lowerTitle.includes('lkg') ||
    lowerTitle.includes('ukg') ||
    lowerTitle.includes('மழலையர்') ||
    category === 'kids_skills' ||
    category === 'kindergarten'
  ) {
    const kgPlan = getKindergartenDayPlan(safeDay);
    const kgTasks: DailySubjectTask[] = kgPlan.tasks.map((t, idx) => ({
      id: t.taskId,
      title: t.title,
      subtitle: t.description.substring(0, 80),
      subject: t.category,
      topic: t.title,
      subtopic: t.descriptionTa || t.description,
      rawSubject: t.category,
      rawTopic: t.title,
      aiPrompt: `Kindergarten Day ${safeDay} Task #${idx + 1}: ${t.title}. Guidance for parent/teacher: ${t.guidanceForParents}`,
      keyFormula: t.contentData.strokeOrLetter || t.contentData.yogaPoseName || t.contentData.sightWord || '',
      learningObjective: t.description,
      durationMinutes: t.durationMinutes,
      duration: t.durationLabel,
      taskType: t.type === 'video_core' || t.type === 'video_evs' ? 'video' : t.type === 'aerobic_dance' ? 'activity' : t.type === 'yoga' ? 'activity' : t.type === 'writing' ? 'practice' : 'reading',
      type: t.type,
      icon: t.type === 'video_core' ? '🎥' : t.type === 'video_evs' ? '🌿' : t.type === 'aerobic_dance' ? '💃' : t.type === 'yoga' ? '🧘' : t.type === 'writing' ? '✍️' : '📖',
      activityPrompt: t.guidanceForParents
    }));

    return {
      dayNumber: safeDay,
      day: safeDay,
      blockNumber: blockNum,
      phaseTitle: kgPlan.quarterLabel,
      themeTitle: kgPlan.theme,
      totalDurationMins: kgPlan.totalMinutes,
      totalMinutes: kgPlan.totalMinutes,
      tasks: kgTasks,
      dailyRevision: `Recap Day ${safeDay}: ${kgPlan.theme}`,
      dailyTestSummary: { questionCount: 5, testType: 'hands-on', focusArea: kgPlan.theme }
    };
  }

  // 1. SECONDARY STAGE (Classes 9 & 10 SSLC) 200-DAY BOARD MASTERY ROUTE
  if (
    lowerId.includes('10') ||
    lowerId.includes('sslc') ||
    lowerId.includes('secondary') ||
    lowerId.includes('-9') ||
    lowerTitle.includes('10th') ||
    lowerTitle.includes('9th') ||
    lowerTitle.includes('10-ஆம்') ||
    lowerTitle.includes('9-ஆம்') ||
    lowerTitle.includes('10_') ||
    lowerTitle.includes('sslc')
  ) {
    const secPlan = getSecondaryDayPlan(safeDay);
    const secTasks: DailySubjectTask[] = secPlan.tasks.map((t, idx) => ({
      id: t.taskId,
      title: t.title,
      subtitle: t.titleTa,
      subject: t.subject,
      topic: t.title,
      subtopic: t.keyFormulaOrLaw,
      rawSubject: t.subject,
      rawTopic: t.title,
      aiPrompt: `10th SSLC Day ${safeDay} Task #${idx + 1}: ${t.title}. Core formula: ${t.keyFormulaOrLaw}. Board takeaway: ${t.boardExamTakeaway}`,
      keyFormula: t.keyFormulaOrLaw,
      learningObjective: t.keyPoints.join(' • '),
      durationMinutes: t.durationMinutes,
      duration: t.durationLabel,
      taskType: idx === 2 ? 'practice' : idx === 3 ? 'video' : idx === 4 ? 'test' : 'reading',
      type: idx === 2 ? 'practice' : idx === 3 ? 'video' : idx === 4 ? 'test' : 'reading',
      icon: idx === 0 ? '📜' : idx === 1 ? '📚' : idx === 2 ? '📐' : idx === 3 ? '🔬' : '🏛️',
      activityPrompt: t.boardExamTakeaway
    }));

    return {
      dayNumber: safeDay,
      day: safeDay,
      blockNumber: blockNum,
      phaseTitle: secPlan.quarterLabel,
      themeTitle: secPlan.theme,
      totalDurationMins: secPlan.totalMinutes,
      totalMinutes: secPlan.totalMinutes,
      tasks: secTasks,
      dailyRevision: `Recap Day ${safeDay}: 10th SSLC Board Exam High-Yield Summary`,
      dailyTestSummary: { questionCount: 10, testType: 'mcq', focusArea: secPlan.theme }
    };
  }

  // 2. PRIMARY STAGE (Classes 1 to 5) 200-DAY 5-TASK ROUTE
  if (
    lowerId.includes('primary') ||
    lowerId.includes('-1') ||
    lowerId.includes('-2') ||
    lowerId.includes('-3') ||
    lowerId.includes('-4') ||
    lowerId.includes('-5') ||
    lowerId.includes('std-1') ||
    lowerId.includes('std-2') ||
    lowerId.includes('std-3') ||
    lowerId.includes('std-4') ||
    lowerId.includes('std-5') ||
    lowerTitle.includes('1st') ||
    lowerTitle.includes('2nd') ||
    lowerTitle.includes('3rd') ||
    lowerTitle.includes('4th') ||
    lowerTitle.includes('5th') ||
    lowerTitle.includes('1-ஆம்') ||
    lowerTitle.includes('2-ஆம்') ||
    lowerTitle.includes('3-ஆம்') ||
    lowerTitle.includes('4-ஆம்') ||
    lowerTitle.includes('5-ஆம்') ||
    lowerTitle.includes('வகுப்பு 1') ||
    lowerTitle.includes('வகுப்பு 2') ||
    lowerTitle.includes('வகுப்பு 3') ||
    lowerTitle.includes('வகுப்பு 4') ||
    lowerTitle.includes('வகுப்பு 5')
  ) {
    const priPlan = getPrimaryDayPlan(safeDay);
    const priTasks: DailySubjectTask[] = priPlan.tasks.map((t, idx) => ({
      id: t.taskId,
      title: t.title,
      subtitle: t.titleTa,
      subject: t.subject,
      topic: t.title,
      subtopic: t.keyAxiomOrRule,
      rawSubject: t.subject,
      rawTopic: t.title,
      aiPrompt: `Primary Day ${safeDay} Subject: ${t.subject} - Topic: ${t.title}. Rule: ${t.keyAxiomOrRule}`,
      keyFormula: t.keyAxiomOrRule,
      learningObjective: t.keyPoints.join(' • '),
      durationMinutes: t.durationMinutes,
      duration: t.durationLabel,
      taskType: idx === 2 ? 'practice' : idx === 3 ? 'video' : 'reading',
      type: idx === 2 ? 'practice' : idx === 3 ? 'video' : 'reading',
      icon: idx === 0 ? '📖' : idx === 1 ? '🔤' : idx === 2 ? '🔢' : idx === 3 ? '🌿' : '🌍',
      activityPrompt: t.homeworkExercise
    }));

    return {
      dayNumber: safeDay,
      day: safeDay,
      blockNumber: blockNum,
      phaseTitle: priPlan.quarterLabel,
      themeTitle: priPlan.theme,
      totalDurationMins: priPlan.totalMinutes,
      totalMinutes: priPlan.totalMinutes,
      tasks: priTasks,
      dailyRevision: `Recap Day ${safeDay}: Review all 5 primary subject exercises.`,
      dailyTestSummary: { questionCount: 5, testType: 'mcq', focusArea: priPlan.theme }
    };
  }

  // 3. MIDDLE STAGE (Classes 6 to 8) 200-DAY 5-TASK ROUTE
  if (
    lowerId.includes('-6') ||
    lowerId.includes('-7') ||
    lowerId.includes('-8') ||
    lowerId.includes('std-6') ||
    lowerId.includes('std-7') ||
    lowerId.includes('std-8') ||
    lowerTitle.includes('6th') ||
    lowerTitle.includes('7th') ||
    lowerTitle.includes('8th') ||
    lowerTitle.includes('6-ஆம்') ||
    lowerTitle.includes('7-ஆம்') ||
    lowerTitle.includes('8-ஆம்') ||
    lowerTitle.includes('வகுப்பு 6') ||
    lowerTitle.includes('வகுப்பு 7') ||
    lowerTitle.includes('வகுப்பு 8') ||
    lowerTitle.includes('middle')
  ) {
    const midPlan = getMiddleDayPlan(safeDay);
    const midTasks: DailySubjectTask[] = midPlan.tasks.map((t, idx) => ({
      id: t.taskId,
      title: t.title,
      subtitle: t.titleTa,
      subject: t.subject,
      topic: t.title,
      subtopic: t.keyAxiomOrLaw,
      rawSubject: t.subject,
      rawTopic: t.title,
      aiPrompt: `Middle School Day ${safeDay} Task #${idx + 1}: ${t.title}. Axiom/Law: ${t.keyAxiomOrLaw}`,
      keyFormula: t.keyAxiomOrLaw,
      learningObjective: t.keyPoints.join(' • '),
      durationMinutes: t.durationMinutes,
      duration: t.durationLabel,
      taskType: idx === 2 ? 'practice' : idx === 3 ? 'video' : idx === 4 ? 'test' : 'reading',
      type: idx === 2 ? 'practice' : idx === 3 ? 'video' : idx === 4 ? 'test' : 'reading',
      icon: idx === 0 ? '📜' : idx === 1 ? '📚' : idx === 2 ? '📐' : idx === 3 ? '🔬' : '🏛️',
      activityPrompt: `Solve textbook exercises for ${t.title}`
    }));

    return {
      dayNumber: safeDay,
      day: safeDay,
      blockNumber: blockNum,
      phaseTitle: midPlan.quarterLabel,
      themeTitle: midPlan.theme,
      totalDurationMins: midPlan.totalMinutes,
      totalMinutes: midPlan.totalMinutes,
      tasks: midTasks,
      dailyRevision: `Recap Day ${safeDay}: Complete Middle School 5-Subject Summary`,
      dailyTestSummary: { questionCount: 5, testType: 'mcq', focusArea: midPlan.theme }
    };
  }

  // 4. ENTRANCE & COMPETITIVE EXAMS (TNPSC / NEET / JEE / UPSC / Police) 200-DAY ROUTE
  if (
    lowerId.includes('tnpsc') ||
    lowerId.includes('neet') ||
    lowerId.includes('jee') ||
    lowerId.includes('upsc') ||
    lowerId.includes('police') ||
    lowerId.includes('bank') ||
    lowerId.includes('ssc') ||
    lowerTitle.includes('tnpsc') ||
    lowerTitle.includes('neet') ||
    lowerTitle.includes('jee') ||
    lowerTitle.includes('upsc') ||
    lowerTitle.includes('police')
  ) {
    const examCat = (lowerId.includes('neet') || lowerTitle.includes('neet'))
      ? 'NEET'
      : (lowerId.includes('jee') || lowerTitle.includes('jee'))
      ? 'JEE'
      : (lowerId.includes('upsc') || lowerTitle.includes('upsc'))
      ? 'UPSC'
      : 'TNPSC';

    const examPlan = getExamDayPlan(examCat, safeDay);
    const examTasks: DailySubjectTask[] = examPlan.tasks.map((t, idx) => ({
      id: t.taskId,
      title: t.title,
      subtitle: t.subject,
      subject: t.subject,
      topic: t.title,
      subtopic: t.keyAxiomOrFormula,
      rawSubject: t.subject,
      rawTopic: t.title,
      aiPrompt: `${examCat} Day ${safeDay} Task #${idx + 1}: ${t.title}. Formula: ${t.keyAxiomOrFormula}. Shortcut: ${t.shortcutEliminationTrick}`,
      keyFormula: t.keyAxiomOrFormula,
      learningObjective: `${t.pyqAnalysis} • ${t.shortcutEliminationTrick}`,
      durationMinutes: t.durationMinutes,
      duration: t.durationLabel,
      taskType: idx === 3 ? 'practice' : idx === 4 ? 'test' : 'reading',
      type: idx === 3 ? 'practice' : idx === 4 ? 'test' : 'reading',
      icon: idx === 0 ? '🧬' : idx === 1 ? '⚡' : idx === 2 ? '🧪' : idx === 3 ? '📐' : '⏱️',
      activityPrompt: t.shortcutEliminationTrick
    }));

    return {
      dayNumber: safeDay,
      day: safeDay,
      blockNumber: blockNum,
      phaseTitle: examPlan.quarterLabel,
      themeTitle: examPlan.theme,
      totalDurationMins: examPlan.totalMinutes,
      totalMinutes: examPlan.totalMinutes,
      tasks: examTasks,
      dailyRevision: `Recap Day ${safeDay}: ${examCat} 45-Second Shortcut & PYQ Drill`,
      dailyTestSummary: { questionCount: 10, testType: 'mcq', focusArea: examPlan.theme }
    };
  }

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
