/**
 * TeachO Master Course Syllabus Registry
 * Complete Authentic Real-World Micro-Granular Curricula for all 86 Courses:
 * - Foundational Stage: LKG, UKG, Class 1, Class 2 (Ages 3â€“8)
 * - Preparatory Stage: Class 3, Class 4, Class 5 (Ages 8â€“11)
 * - Middle Stage: Class 6, Class 7, Class 8 (Ages 11â€“14)
 * - Secondary Stage: Class 9, Class 10 (Ages 14â€“16)
 */
import { UPSC_OPTIONALS_REGISTRY } from './upscCurriculumData';
import { NEET_UG_OFFICIAL_SUBJECTS, JEE_MAIN_ADVANCED_OFFICIAL_SUBJECTS, TNPSC_UNIFIED_OFFICIAL_SUBJECTS } from './officialExhaustiveSyllabi';

export interface SyllabusMicroTopic {
  id: string;
  topicTitle?: string;
  title?: string;
  subtopic?: string;
  dayNumber?: number;
  periodNumber?: number;
  keyFormulaOrLaw?: string;
  keyAxiom?: string;
  keyPoints?: string[];
  type?: 'concept' | 'solved_problem' | 'memorization' | 'quiz' | string;
  importance?: 'High-Yield' | 'Core Standard' | 'Foundational' | string;
}

export interface SyllabusSubtopic {
  id?: string;
  title: string;
  microTopics?: Array<{ id: string; title: string; keyAxiom?: string } | SyllabusMicroTopic>;
}

export interface SyllabusChapter {
  chapterNumber?: number;
  chapterTitle: string;
  chapterTamilTitle?: string;
  tamilTitle?: string;
  title?: string;
  description?: string;
  subtopics?: SyllabusSubtopic[];
  microTopics?: SyllabusMicroTopic[];
}

export interface SyllabusSubject {
  subjectId: string;
  subjectName: string;
  icon?: string;
  color?: string;
  totalChapters?: number;
  totalMicroTopics?: number;
  chapters: SyllabusChapter[];
}

export interface CourseFullSyllabus {
  courseId: string;
  courseTitle: string;
  category: string;
  board: string;
  medium: string;
  totalDays: number;
  totalSubjects: number;
  totalChapters: number;
  totalMicroTopics: number;
  subjects: SyllabusSubject[];
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 1. FOUNDATIONAL STAGE: CLASS 1 & CLASS 2 (AGES 6â€“8)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function getFoundationalClass1to2Syllabus(courseId: string, courseTitle: string): CourseFullSyllabus {
  const isTa = courseTitle.includes('தமிழ்') || courseId.includes('-ta-');

  const subjects: SyllabusSubject[] = [
    {
      subjectId: 'fnd_tamil',
      subjectName: 'à®¤à®®à®¿à®´à¯ (Tamil â€” à®‰à®¯à®¿à®°à¯, à®®à¯†à®¯à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯ & à®®à®´à®²à¯ˆà®¯à®°à¯ à®ªà®¾à®Ÿà®²à¯)',
      icon: '🔤',
      color: '#ec4899',
      totalChapters: 4,
      totalMicroTopics: 12,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: 'à®‰à®¯à®¿à®°à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯ (12) & à®†à®¯à¯à®¤ à®Žà®´à¯à®¤à¯à®¤à¯ (à®ƒ)',
          description: 'à®… à®®à¯à®¤à®²à¯ à®” à®µà®°à¯ˆ à®‰à®³à¯à®³ 12 à®‰à®¯à®¿à®°à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯, à®†à®¯à¯à®¤ à®Žà®´à¯à®¤à¯à®¤à¯ à®ƒ, à®ªà®Ÿà®™à¯à®•à®³à¯ˆà®ªà¯ à®ªà®¾à®°à¯à®¤à¯à®¤à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯ˆ à®…à®Ÿà¯ˆà®¯à®¾à®³à®®à¯ à®•à®¾à®£à¯à®¤à®²à¯',
          subtopics: [
            {
              id: 'fnd_t_sub1',
              title: 'à®‰à®¯à®¿à®°à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯ à®‰à®šà¯à®šà®°à®¿à®ªà¯à®ªà¯ & à®ªà®Ÿà®•à¯à®•à®¤à¯ˆ',
              microTopics: [
                { id: 'fnd_t_1', title: 'à®•à¯à®±à®¿à®²à¯ à®®à®±à¯à®±à¯à®®à¯ à®¨à¯†à®Ÿà®¿à®²à¯ à®‰à®¯à®¿à®°à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯ (à®…, à®†, à®‡, à®ˆ...)', keyAxiom: 'à®‰à®¯à®¿à®°à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯ 12: à®•à¯à®±à®¿à®²à¯ 5 (à®…, à®‡, à®‰, à®Ž, à®’), à®¨à¯†à®Ÿà®¿à®²à¯ 7 (à®†, à®ˆ, à®Š, à®, à®, à®“, à®”)' },
                { id: 'fnd_t_2', title: 'à®†à®¯à¯à®¤ à®Žà®´à¯à®¤à¯à®¤à¯ (à®ƒ) â€” à®Žà®ƒà®•à¯, à®…à®ƒà®¤à¯ à®‰à®šà¯à®šà®°à®¿à®ªà¯à®ªà¯ & à®ªà®¯à®©à¯à®ªà®¾à®Ÿà¯', keyAxiom: 'à®†à®¯à¯à®¤ à®Žà®´à¯à®¤à¯à®¤à¯ à®šà¯Šà®²à¯à®²à®¿à®©à¯ à®‡à®Ÿà¯ˆà®¯à®¿à®²à¯ à®®à®Ÿà¯à®Ÿà¯à®®à¯‡ à®µà®°à¯à®®à¯ à®¤à®©à®¿à®¨à®¿à®²à¯ˆ à®Žà®´à¯à®¤à¯à®¤à¯' }
              ]
            }
          ],
          microTopics: [
            { id: 'fnd_t_1', topicTitle: 'à®•à¯à®±à®¿à®²à¯ à®®à®±à¯à®±à¯à®®à¯ à®¨à¯†à®Ÿà®¿à®²à¯ à®‰à®¯à®¿à®°à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯ (à®… à®®à¯à®¤à®²à¯ à®” à®µà®°à¯ˆ)', subtopic: 'à®ªà®Ÿà®™à¯à®•à®³à¯ˆ à®ªà®¾à®°à¯à®¤à¯à®¤à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯ˆ à®…à®±à®¿à®¤à®²à¯', dayNumber: 1, periodNumber: 1, keyFormulaOrLaw: 'à®‰à®¯à®¿à®°à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à¯à®•à®³à¯: à®…, à®†, à®‡, à®ˆ, à®‰, à®Š, à®Ž, à®, à®, à®’, à®“, à®” (à®®à¯Šà®¤à¯à®¤à®®à¯ 12)', keyPoints: ['à®… - à®…à®£à®¿à®²à¯, à®…à®®à¯à®®à®¾', 'à®† - à®†à®Ÿà¯, à®†à®²à®®à®°à®®à¯', 'à®‡ - à®‡à®²à¯ˆ, à®‡à®žà¯à®šà®¿', 'à®ˆ - à®ˆà®Ÿà¯à®Ÿà®¿, à®ˆà®šà®²à¯'], type: 'concept', importance: 'Foundational' }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: 'à®®à¯†à®¯à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯ (18) â€” à®µà®²à¯à®²à®¿à®©à®®à¯, à®®à¯†à®²à¯à®²à®¿à®©à®®à¯, à®‡à®Ÿà¯ˆà®¯à®¿à®©à®®à¯',
          description: 'à®•à¯ à®®à¯à®¤à®²à¯ à®©à¯ à®µà®°à¯ˆ à®‰à®³à¯à®³ 18 à®ªà¯à®³à¯à®³à®¿ à®µà¯ˆà®¤à¯à®¤ à®®à¯†à®¯à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯ à®®à®±à¯à®±à¯à®®à¯ 3 à®‡à®©à®ªà¯ à®ªà®¿à®°à®¿à®µà¯à®•à®³à¯',
          subtopics: [
            {
              id: 'fnd_t_sub2',
              title: 'à®®à¯†à®¯à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯ à®®à¯‚à®µà®¿à®©à®ªà¯ à®ªà®¿à®°à®¿à®µà¯à®•à®³à¯',
              microTopics: [
                { id: 'fnd_t_3', title: 'à®µà®²à¯à®²à®¿à®©à®®à¯ (à®•à®šà®Ÿà®¤à®ªà®± â€” à®•à¯, à®šà¯, à®Ÿà¯, à®¤à¯, à®ªà¯, à®±à¯) à®‰à®šà¯à®šà®°à®¿à®ªà¯à®ªà¯', keyAxiom: 'à®µà®²à¯à®²à®¿à®©à®®à¯ à®µà®©à¯à®®à¯ˆà®¯à®¾à®© à®“à®šà¯ˆà®¯à¯à®Ÿà¯ˆà®¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯' },
                { id: 'fnd_t_4', title: 'à®®à¯†à®²à¯à®²à®¿à®©à®®à¯ (à®™à®žà®£à®¨à®®à®©) & à®‡à®Ÿà¯ˆà®¯à®¿à®©à®®à¯ (à®¯à®°à®²à®µà®´à®³)', keyAxiom: 'à®®à¯†à®²à¯à®²à®¿à®©à®®à¯ à®®à¯†à®©à¯à®®à¯ˆà®¯à®¾à®© à®“à®šà¯ˆ; à®‡à®Ÿà¯ˆà®¯à®¿à®©à®®à¯ à®‡à®Ÿà¯ˆà®ªà¯à®ªà®Ÿà¯à®Ÿ à®“à®šà¯ˆ' }
              ]
            }
          ],
          microTopics: [
            { id: 'fnd_t_3', topicTitle: 'à®®à¯†à®¯à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯ 18 à®µà®•à¯ˆà®ªà¯à®ªà®¾à®Ÿà¯ (à®µà®²à¯à®²à®¿à®©à®®à¯, à®®à¯†à®²à¯à®²à®¿à®©à®®à¯, à®‡à®Ÿà¯ˆà®¯à®¿à®©à®®à¯)', subtopic: 'à®•à®šà®Ÿà®¤à®ªà®±, à®™à®žà®£à®¨à®®à®©, à®¯à®°à®²à®µà®´à®³ à®‰à®šà¯à®šà®°à®¿à®ªà¯à®ªà¯', dayNumber: 4, periodNumber: 1, keyFormulaOrLaw: 'à®µà®²à¯à®²à®¿à®©à®®à¯: à®•à¯ à®šà¯ à®Ÿà¯ à®¤à¯ à®ªà¯ à®±à¯ | à®®à¯†à®²à¯à®²à®¿à®©à®®à¯: à®™à¯ à®žà¯ à®£à¯ à®¨à¯ à®®à¯ à®©à¯ | à®‡à®Ÿà¯ˆà®¯à®¿à®©à®®à¯: à®¯à¯ à®°à¯ à®²à¯ à®µà¯ à®´à¯ à®³à¯', keyPoints: ['à®®à¯†à®¯à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯ à®ªà¯à®³à¯à®³à®¿ à®ªà¯†à®±à¯à®± à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯', 'à®®à¯Šà®¤à¯à®¤à®®à¯ 18 à®®à¯†à®¯à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯'], type: 'concept', importance: 'Foundational' }
          ]
        },
        {
          chapterNumber: 3,
          chapterTitle: 'à®‰à®¯à®¿à®°à¯à®®à¯†à®¯à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯ à®…à®±à®¿à®®à¯à®•à®®à¯ & à®šà¯Šà®²à¯ à®µà®¿à®³à¯ˆà®¯à®¾à®Ÿà¯à®Ÿà¯',
          description: 'à®‰à®¯à®¿à®°à¯ + à®®à¯†à®¯à¯ à®‡à®£à¯ˆà®¯à¯à®®à¯ à®‰à®¯à®¿à®°à¯à®®à¯†à®¯à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯ (216) & à®Žà®³à®¿à®¯ 2, 3 à®Žà®´à¯à®¤à¯à®¤à¯à®šà¯ à®šà¯Šà®±à¯à®•à®³à¯',
          subtopics: [
            {
              id: 'fnd_t_sub3',
              title: 'à®‰à®¯à®¿à®°à¯à®®à¯†à®¯à¯ à®‰à®°à¯à®µà®¾à®•à¯à®• à®µà®¾à®¯à¯à®ªà®¾à®Ÿà¯',
              microTopics: [
                { id: 'fnd_t_5', title: 'à®•à¯ + à®… = à®• à®µà®°à®¿à®šà¯ˆ à®®à¯à®¤à®²à¯ à®•à¯ + à®” = à®•à¯Œ à®µà®°à¯ˆ', keyAxiom: 'à®‰à®¯à®¿à®°à¯à®®à¯†à®¯à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯ à®®à¯Šà®¤à¯à®¤à®®à¯ 18 Ã— 12 = 216 à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯' }
              ]
            }
          ],
          microTopics: [
            { id: 'fnd_t_5', topicTitle: 'à®‰à®¯à®¿à®°à¯à®®à¯†à®¯à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯ à®…à®Ÿà¯à®Ÿà®µà®£à¯ˆ & à®Žà®³à®¿à®¯ à®šà¯Šà®±à¯à®•à®³à¯', subtopic: 'à®•à¯ + à®… = à®• à®µà®¾à®¯à¯à®ªà®¾à®Ÿà¯ à®®à®±à¯à®±à¯à®®à¯ à®ªà®Ÿà®šà¯à®šà¯Šà®±à¯à®•à®³à¯', dayNumber: 7, periodNumber: 1, keyFormulaOrLaw: 'à®‰à®¯à®¿à®°à¯ (12) + à®®à¯†à®¯à¯ (18) = à®‰à®¯à®¿à®°à¯à®®à¯†à®¯à¯ (216) | à®¤à®®à®¿à®´à¯ à®®à¯Šà®¤à¯à®¤ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯ = 247', keyPoints: ['à®•à®²à¯, à®•à®£à¯, à®ªà®²à¯, à®®à®°à®®à¯, à®ªà®Ÿà®®à¯ à®ªà¯‹à®©à¯à®± à®Žà®³à®¿à®¯ à®šà¯Šà®±à¯à®•à®³à¯ˆ à®Žà®´à¯à®¤à¯à®¤à®²à¯'], type: 'concept', importance: 'Foundational' }
          ]
        },
        {
          chapterNumber: 4,
          chapterTitle: 'à®”à®µà¯ˆà®¯à®¾à®°à¯ à®†à®¤à¯à®¤à®¿à®šà¯‚à®Ÿà®¿, à®¨à¯€à®¤à®¿à®ªà¯à®ªà®¾à®Ÿà®²à¯à®•à®³à¯ & à®•à®¤à¯ˆà®•à®³à¯',
          description: 'à®…à®±à®žà¯à®šà¯†à®¯ à®µà®¿à®°à¯à®®à¯à®ªà¯ à®®à¯à®¤à®²à¯ à®”à®µà®¿à®¯à®®à¯ à®ªà¯‡à®šà¯‡à®²à¯ à®µà®°à¯ˆ à®†à®¤à¯à®¤à®¿à®šà¯‚à®Ÿà®¿ à®µà®°à®¿à®•à®³à¯ à®®à®±à¯à®±à¯à®®à¯ à®¨à®±à¯à®ªà®£à¯à®ªà¯à®•à®³à¯',
          subtopics: [
            {
              id: 'fnd_t_sub4',
              title: 'à®†à®¤à¯à®¤à®¿à®šà¯‚à®Ÿà®¿ à®¨à®±à¯à®ªà®£à¯à®ªà¯à®•à®³à¯ & à®•à®¤à¯ˆà®•à®³à¯',
              microTopics: [
                { id: 'fnd_t_6', title: 'à®…à®±à®žà¯à®šà¯†à®¯ à®µà®¿à®°à¯à®®à¯à®ªà¯, à®†à®±à¯à®µà®¤à¯ à®šà®¿à®©à®®à¯, à®‡à®¯à®²à¯à®µà®¤à¯ à®•à®°à®µà¯‡à®²à¯ à®µà®¿à®³à®•à¯à®•à®®à¯', keyAxiom: 'à®†à®¤à¯à®¤à®¿à®šà¯‚à®Ÿà®¿ à®ªà®¾à®Ÿà®¿à®¯à®µà®°à¯ à®”à®µà¯ˆà®¯à®¾à®°à¯ â€” à®Žà®³à®¿à®¯ à®¨à®©à¯à®©à¯†à®±à®¿ à®¨à¯€à®¤à®¿ à®¨à¯‚à®²à¯' }
              ]
            }
          ],
          microTopics: [
            { id: 'fnd_t_6', topicTitle: 'à®”à®µà¯ˆà®¯à®¾à®°à¯ à®†à®¤à¯à®¤à®¿à®šà¯‚à®Ÿà®¿ (12 à®µà®°à®¿à®•à®³à¯ & à®¨à®¯à®µà¯à®°à¯ˆ)', subtopic: 'à®…à®±à®žà¯à®šà¯†à®¯ à®µà®¿à®°à¯à®®à¯à®ªà¯ â€” à®Žà®ªà¯à®ªà¯‹à®¤à¯à®®à¯ à®¨à®²à¯à®² à®šà¯†à®¯à®²à¯à®•à®³à¯ˆà®šà¯ à®šà¯†à®¯à¯', dayNumber: 10, periodNumber: 1, keyFormulaOrLaw: 'à®†à®¤à¯à®¤à®¿à®šà¯‚à®Ÿà®¿: "à®…à®±à®žà¯à®šà¯†à®¯ à®µà®¿à®°à¯à®®à¯à®ªà¯", "à®†à®±à¯à®µà®¤à¯ à®šà®¿à®©à®®à¯", "à®ˆà®¯à®¤à¯ à®µà®¿à®²à®•à¯à®•à¯‡à®²à¯"', keyPoints: ['à®”à®µà¯ˆà®¯à®¾à®°à¯ à®…à®°à¯à®³à®¿à®¯ à®¨à¯€à®¤à®¿ à®¨à¯†à®±à®¿à®®à¯à®±à¯ˆà®•à®³à¯ˆ à®…à®©à¯à®±à®¾à®Ÿ à®µà®¾à®´à¯à®µà®¿à®²à¯ à®•à®Ÿà¯ˆà®ªà¯à®ªà®¿à®Ÿà®¿à®¤à¯à®¤à®²à¯'], type: 'memorization', importance: 'High-Yield' }
          ]
        }
      ]
    },
    {
      subjectId: 'fnd_english',
      subjectName: 'English (Phonics, Sight Words & Foundational Literacy)',
      icon: '🔤',
      color: '#3b82f6',
      totalChapters: 4,
      totalMicroTopics: 12,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: 'Phonics Sounds (A to Z) & CVC Word Blends',
          description: 'Letter sounds, phoneme recognition, and 3-letter CVC word blending (-at, -en, -in, -og, -un)',
          subtopics: [
            {
              id: 'fnd_e_sub1',
              title: 'Phonics Sounds & CVC Blending',
              microTopics: [
                { id: 'fnd_e_1', title: 'Letter Sounds /a/ to /z/ & Phonics Rhymes', keyAxiom: '26 Letters representing 44 English Phoneme sounds' },
                { id: 'fnd_e_2', title: 'CVC 3-Letter Blending (Cat, Pen, Pin, Dog, Sun)', keyAxiom: 'Consonant + Vowel + Consonant word formation' }
              ]
            }
          ],
          microTopics: [
            { id: 'fnd_e_1', topicTitle: 'Letters A to Z Phonics & CVC Word Blends', subtopic: 'Bat, Cat, Mat, Hen, Pen, Tin, Pin, Pot, Dot, Sun, Run', dayNumber: 2, periodNumber: 2, keyFormulaOrLaw: 'Phonics: /b/ + /æ/ + /t/ = Bat | CVC Blending Pattern', keyPoints: ['Short vowel sounds (a, e, i, o, u)', 'Visual word cards and picture matching'], type: 'concept', importance: 'Foundational' }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: 'Sight Words, Action Verbs & Simple Sentences',
          description: 'High-frequency sight words (The, Is, In, On, Under, This, That) and action words (Run, Jump, Read)',
          subtopics: [
            {
              id: 'fnd_e_sub2',
              title: 'Sight Words & Sentence Building',
              microTopics: [
                { id: 'fnd_e_3', title: 'High-Frequency Sight Words (He, She, It, They, We)', keyAxiom: 'Recognize sight words by sight without sounding out' },
                { id: 'fnd_e_4', title: 'Action Words & Simple Subject + Verb Sentences', keyAxiom: 'Sentence structure: "This is a cat", "The dog can run"' }
              ]
            }
          ],
          microTopics: [
            { id: 'fnd_e_3', topicTitle: 'Sight Words Mastery & Simple Reading Sentences', subtopic: 'This is my bag, I can jump, The sun is hot', dayNumber: 5, periodNumber: 2, keyFormulaOrLaw: 'Sentence Rule: Start with Capital letter, End with Full Stop (.)', keyPoints: ['Top 20 Dolch sight words for early readers', 'Forming 3 to 4 word simple sentences'], type: 'concept', importance: 'Foundational' }
          ]
        },
        {
          chapterNumber: 3,
          chapterTitle: 'Classic Nursery Rhymes & Picture Story Reading',
          description: 'Twinkle Twinkle, Baa Baa Black Sheep, Jack and Jill, and Aesop moral fables',
          subtopics: [
            {
              id: 'fnd_e_sub3',
              title: 'Rhymes & Moral Picture Stories',
              microTopics: [
                { id: 'fnd_e_5', title: 'Classic English Rhymes with Actions', keyAxiom: 'Rhyming words: Star-Far, High-Sky, Sheep-Wool' },
                { id: 'fnd_e_6', title: 'Aesop Moral Stories (The Thirsty Crow, The Hare and Tortoise)', keyAxiom: 'Moral values: Hard work and patience bring success' }
              ]
            }
          ],
          microTopics: [
            { id: 'fnd_e_5', topicTitle: 'Nursery Rhymes, Rhythm & Story Comprehension', subtopic: 'The Thirsty Crow and The Tortoise & The Hare story reading', dayNumber: 8, periodNumber: 2, keyFormulaOrLaw: 'Rhyming Pair: Ring - Sing | King - Wing | Cat - Hat', keyPoints: ['Identifying main characters in a picture story', 'Reciting rhymes with correct intonation and actions'], type: 'memorization', importance: 'Foundational' }
          ]
        },
        {
          chapterNumber: 4,
          chapterTitle: 'Grammar Basics: Naming Words (Nouns) & Pronouns',
          description: 'Person, Place, Animal, Thing naming words, One & Many (Singular/Plural -s, -es), He/She/It',
          subtopics: [
            {
              id: 'fnd_e_sub4',
              title: 'Nouns & Singular/Plural Concepts',
              microTopics: [
                { id: 'fnd_e_7', title: 'Naming Words: Person, Place, Animal, Thing', keyAxiom: 'A Noun is the name of a person, place, animal, or object' },
                { id: 'fnd_e_8', title: 'Singular & Plural (Book -> Books, Box -> Boxes)', keyAxiom: 'Add -s or -es to change one into many' }
              ]
            }
          ],
          microTopics: [
            { id: 'fnd_e_7', topicTitle: 'Nouns (Naming Words) & Singular/Plural Concept', subtopic: 'Boy -> Boys, Apple -> Apples, Cat -> Cats', dayNumber: 11, periodNumber: 2, keyFormulaOrLaw: 'Noun Definition: Person / Place / Animal / Thing | Singular + s = Plural', keyPoints: ['Underlining nouns in simple sentences', 'Using He for boys, She for girls, It for things and animals'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        }
      ]
    },
    {
      subjectId: 'fnd_math',
      subjectName: isTa ? 'à®•à®£à®¿à®¤à®®à¯ (Mathematics Core & FLN)' : 'Mathematics & Number Sense (FLN)',
      icon: 'ðŸ”¢',
      color: '#06b6d4',
      totalChapters: 3,
      totalMicroTopics: 10,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: isTa ? 'à®Žà®£à¯à®•à®³à¯, à®‡à®Ÿà®®à®¤à®¿à®ªà¯à®ªà¯ & à®•à¯‚à®Ÿà¯à®Ÿà®²à¯/à®•à®´à®¿à®¤à¯à®¤à®²à¯' : 'Numbers (1â€“100), Place Value & Addition/Subtraction',
          description: isTa ? '2 à®®à®±à¯à®±à¯à®®à¯ 3 à®‡à®²à®•à¯à®• à®Žà®£à¯à®•à®³à¯, à®ªà®¤à¯à®¤à¯à®•à®³à¯/à®’à®©à¯à®±à¯à®•à®³à¯ à®‡à®Ÿà®®à®¤à®¿à®ªà¯à®ªà¯, à®•à¯‚à®Ÿà¯à®Ÿà®²à¯ à®•à®´à®¿à®¤à¯à®¤à®²à¯ à®•à®£à®•à¯à®•à¯à®•à®³à¯' : '2 & 3-digit numbers, Tens/Ones place value, Skip counting (2s, 5s, 10s), Word problems',
          subtopics: [
            {
              id: 'fnd_m_sub1',
              title: 'à®Žà®£à¯à®•à®³à¯ & à®‡à®Ÿà®®à®¤à®¿à®ªà¯à®ªà¯ à®…à®Ÿà®¿à®ªà¯à®ªà®Ÿà¯ˆ',
              microTopics: [
                { id: 'fnd_m_1', title: 'à®‡à®Ÿà®®à®¤à®¿à®ªà¯à®ªà¯ & 2 à®‡à®²à®•à¯à®• à®Žà®£à¯à®•à®³à¯ (Tens & Ones)', keyAxiom: '1 Ten = 10 Ones | 1 Hundred = 10 Tens' },
                { id: 'fnd_m_2', title: 'à®•à¯‚à®Ÿà¯à®Ÿà®²à¯ & à®•à®´à®¿à®¤à¯à®¤à®²à¯ à®Žà®³à®¿à®¯ à®•à®£à®•à¯à®•à¯à®•à®³à¯', keyAxiom: 'Addition combines (+) | Subtraction takes away (-)' }
              ]
            }
          ],
          microTopics: [
            { id: 'fnd_m_1', topicTitle: isTa ? 'à®‡à®Ÿà®®à®¤à®¿à®ªà¯à®ªà¯ & 2 à®‡à®²à®•à¯à®• à®Žà®£à¯à®•à®³à¯ (Tens & Ones)' : 'Place Value & 2-Digit Numbers (Tens & Ones)', subtopic: isTa ? 'à®®à®£à®¿à®•à®³à¯ à®šà®Ÿà¯à®Ÿà®®à¯ à®®à¯‚à®²à®®à¯ à®‡à®Ÿà®®à®¤à®¿à®ªà¯à®ªà¯ à®…à®±à®¿à®¤à®²à¯' : 'Abacus representation, tens and ones grouping', dayNumber: 3, periodNumber: 3, keyFormulaOrLaw: 'Place Value: 1 Ten = 10 Ones | 1 Hundred = 10 Tens', keyPoints: ['Grouping into bundles of tens', 'Expanded form: 47 = 40 + 7'], type: 'concept', importance: 'Foundational' },
            { id: 'fnd_m_2', topicTitle: isTa ? 'à®•à¯‚à®Ÿà¯à®Ÿà®²à¯ & à®•à®´à®¿à®¤à¯à®¤à®²à¯ à®Žà®³à®¿à®¯ à®•à®£à®•à¯à®•à¯à®•à®³à¯' : 'Addition & Subtraction Word Problems', subtopic: isTa ? 'à®¨à®Ÿà¯ˆà®®à¯à®±à¯ˆ à®µà®¾à®´à¯à®•à¯à®•à¯ˆ à®•à®£à®•à¯à®•à¯€à®Ÿà¯à®•à®³à¯' : 'Single and double-digit operations with carry-over and borrowing', dayNumber: 6, periodNumber: 3, keyFormulaOrLaw: 'Addition: Combine groups (+) | Subtraction: Take away (-)', keyPoints: ['Word problem keywords: Total, In all, Left, Difference', 'Checking subtraction using addition'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: isTa ? 'à®ªà¯†à®°à¯à®•à¯à®•à®²à¯ à®µà®¾à®¯à¯à®ªà¯à®ªà®¾à®Ÿà¯à®•à®³à¯ (1â€“10) & à®¨à®¾à®£à®¯à®™à¯à®•à®³à¯' : 'Multiplication Tables (1â€“10) & Indian Currency',
          description: isTa ? 'à®¤à¯Šà®Ÿà®°à¯ à®•à¯‚à®Ÿà¯à®Ÿà®²à¯‡ à®ªà¯†à®°à¯à®•à¯à®•à®²à¯, à®šà®®à®®à®¾à®•à®ªà¯ à®ªà®¿à®°à®¿à®¤à¯à®¤à®²à¯‡ à®µà®•à¯à®¤à¯à®¤à®²à¯, à®‡à®¨à¯à®¤à®¿à®¯ à®°à¯‚à®ªà®¾à®¯à¯ à®¨à¯‹à®Ÿà¯à®Ÿà¯à®•à®³à¯' : 'Multiplication as repeated addition, Division as sharing, Indian coins & notes',
          subtopics: [
            {
              id: 'fnd_m_sub2',
              title: 'à®ªà¯†à®°à¯à®•à¯à®•à®²à¯ à®µà®¾à®¯à¯à®ªà¯à®ªà®¾à®Ÿà¯ & à®¨à®¾à®£à®¯à®™à¯à®•à®³à¯',
              microTopics: [
                { id: 'fnd_m_3', title: 'à®ªà¯†à®°à¯à®•à¯à®•à®²à¯ à®µà®¾à®¯à¯à®ªà¯à®ªà®¾à®Ÿà¯à®•à®³à¯ (2, 3, 4, 5, 10)', keyAxiom: 'Multiplication is repeated addition: 3 Ã— 4 = 4 + 4 + 4 = 12' },
                { id: 'fnd_m_4', title: 'à®‡à®¨à¯à®¤à®¿à®¯ à®¨à®¾à®£à®¯à®™à¯à®•à®³à¯ & à®°à¯‚à®ªà®¾à®¯à¯ à®¨à¯‹à®Ÿà¯à®Ÿà¯à®•à®³à¯ (â‚¹1 à®®à¯à®¤à®²à¯ â‚¹100)', keyAxiom: '1 Rupee (â‚¹1) = 100 Paise' }
              ]
            }
          ],
          microTopics: [
            { id: 'fnd_m_3', topicTitle: isTa ? 'à®ªà¯†à®°à¯à®•à¯à®•à®²à¯ à®µà®¾à®¯à¯à®ªà¯à®ªà®¾à®Ÿà¯ & à®¤à¯Šà®Ÿà®°à¯ à®•à¯‚à®Ÿà¯à®Ÿà®²à¯' : 'Multiplication Tables & Repeated Addition', subtopic: isTa ? '2, 3, 5, 10 à®µà®¾à®¯à¯à®ªà¯à®ªà®¾à®Ÿà¯à®•à®³à¯ à®ªà®¯à®¿à®±à¯à®šà®¿' : 'Visual array grouping and tables 1 to 10', dayNumber: 9, periodNumber: 3, keyFormulaOrLaw: 'Multiplication: 3 Ã— 4 = 4 + 4 + 4 = 12', keyPoints: ['Order of multiplication does not change product (a Ã— b = b Ã— a)', 'Multiplying any number by 0 gives 0; by 1 gives same number'], type: 'memorization', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 3,
          chapterTitle: isTa ? 'à®µà®Ÿà®¿à®µà®¿à®¯à®²à¯ (2D Shapes), à®•à®¾à®²à®®à¯ & à®…à®³à®µà¯€à®Ÿà¯à®•à®³à¯' : 'Geometry (2D/3D Shapes), Time & Measurement',
          description: isTa ? 'à®µà®Ÿà¯à®Ÿà®®à¯, à®šà®¤à¯à®°à®®à¯, à®šà¯†à®µà¯à®µà®•à®®à¯, à®®à¯à®•à¯à®•à¯‹à®£à®®à¯, à®•à®Ÿà®¿à®•à®¾à®° à®¨à¯‡à®°à®®à¯ à®ªà®¾à®°à¯à®¤à¯à®¤à®²à¯, à®¨à¯€à®³à®®à¯ à®Žà®Ÿà¯ˆ à®…à®³à®µà¯à®•à®³à¯' : 'Circle, Square, Rectangle, Triangle, Clock time reading, Length/Weight',
          subtopics: [
            {
              id: 'fnd_m_sub3',
              title: 'à®µà®Ÿà®¿à®µà®™à¯à®•à®³à¯ & à®•à®Ÿà®¿à®•à®¾à®° à®¨à¯‡à®°à®®à¯',
              microTopics: [
                { id: 'fnd_m_5', title: '2D & 3D à®µà®Ÿà®¿à®µà®™à¯à®•à®³à®¿à®©à¯ à®ªà®•à¯à®•à®™à¯à®•à®³à¯ à®®à®±à¯à®±à¯à®®à¯ à®®à¯à®©à¯ˆà®•à®³à¯', keyAxiom: 'Square (4 equal sides), Rectangle (opposite sides equal), Triangle (3 sides)' }
              ]
            }
          ],
          microTopics: [
            { id: 'fnd_m_5', topicTitle: isTa ? 'à®µà®Ÿà®¿à®µà®™à¯à®•à®³à¯ (Shapes), à®•à®¾à®²à®®à¯ & à®…à®³à®µà¯€à®Ÿà¯à®•à®³à¯' : '2D Shapes, Clock Time & Measurement', subtopic: isTa ? 'à®šà®¤à¯à®°à®®à¯, à®šà¯†à®µà¯à®µà®•à®®à¯, à®®à¯à®•à¯à®•à¯‹à®£à®®à¯, à®µà®Ÿà¯à®Ÿà®®à¯' : 'Identifying shapes, Hour hand and Minute hand on clock', dayNumber: 12, periodNumber: 3, keyFormulaOrLaw: 'Clock: 1 Hour = 60 Minutes | 1 Day = 24 Hours', keyPoints: ['Short hand shows hours; long hand shows minutes', 'Square has 4 equal sides and 4 corners'], type: 'concept', importance: 'Foundational' }
          ]
        }
      ]
    },
    {
      subjectId: 'fnd_science',
      subjectName: isTa ? 'à®šà¯‚à®´à¯à®¨à®¿à®²à¯ˆà®¯à®¿à®¯à®²à¯ & à®…à®±à®¿à®µà®¿à®¯à®²à¯ (General Science & EVS)' : 'General Science & Environmental Studies',
      icon: 'ðŸŒ¿',
      color: '#10b981',
      totalChapters: 2,
      totalMicroTopics: 8,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: isTa ? 'à®®à®©à®¿à®¤ à®‰à®Ÿà®²à¯ à®‰à®±à¯à®ªà¯à®ªà¯à®•à®³à¯, à®à®®à¯à®ªà¯à®²à®©à¯à®•à®³à¯ & à®šà¯à®•à®¾à®¤à®¾à®°à®®à¯' : 'My Body Organs, 5 Senses & Daily Hygiene',
          description: isTa ? 'à®•à®£à¯, à®•à®¾à®¤à¯, à®®à¯‚à®•à¯à®•à¯, à®¨à®¾à®•à¯à®•à¯, à®¤à¯‹à®²à¯ à®®à®±à¯à®±à¯à®®à¯ à®†à®°à¯‹à®•à¯à®•à®¿à®¯ à®‰à®£à®µà¯à®•à®³à¯' : '5 senses, Internal organs (Heart, Lungs, Brain), Clean habits',
          subtopics: [
            {
              id: 'fnd_s_sub1',
              title: 'à®‰à®Ÿà®²à¯ à®‰à®±à¯à®ªà¯à®ªà¯à®•à®³à¯ & à®¨à®±à¯à®ªà®´à®•à¯à®•à®™à¯à®•à®³à¯',
              microTopics: [
                { id: 'fnd_s_1', title: 'à®à®®à¯à®ªà¯à®²à®©à¯à®•à®³à¯ à®®à®±à¯à®±à¯à®®à¯ à®…à®µà®±à¯à®±à®¿à®©à¯ à®ªà®£à®¿à®•à®³à¯', keyAxiom: 'Eyes see, Ears hear, Nose smells, Tongue tastes, Skin feels' }
              ]
            }
          ],
          microTopics: [
            { id: 'fnd_s_1', topicTitle: isTa ? 'à®à®®à¯à®ªà¯à®²à®©à¯à®•à®³à¯ & à®®à®©à®¿à®¤ à®‰à®Ÿà®²à¯ à®‰à®±à¯à®ªà¯à®ªà¯à®•à®³à®¿à®©à¯ à®ªà®£à®¿à®•à®³à¯' : '5 Sense Organs & Daily Healthy Habits', subtopic: isTa ? 'à®ªà®¾à®°à¯à®µà¯ˆ, à®•à¯‡à®Ÿà¯à®Ÿà®²à¯, à®¨à¯à®•à®°à¯à®¤à®²à¯, à®šà¯à®µà¯ˆ, à®¤à¯Šà®Ÿà¯à®¤à®²à¯' : 'Eyes, Ears, Nose, Tongue, Skin functions; Hand hygiene', dayNumber: 13, periodNumber: 4, keyFormulaOrLaw: '5 Sense Organs | Wash hands with soap for 20 seconds', keyPoints: ['Eat healthy green vegetables and fresh fruits', 'Drink clean boiled water daily'], type: 'concept', importance: 'Foundational' }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: isTa ? 'à®¤à®¾à®µà®°à®™à¯à®•à®³à¯, à®µà®¿à®²à®™à¯à®•à¯à®•à®³à¯ & à®ªà®°à¯à®µà®•à®¾à®²à®™à¯à®•à®³à¯' : 'Plants, Animals & Weather Seasons',
          description: isTa ? 'à®®à®°à®™à¯à®•à®³à¯, à®šà¯†à®Ÿà®¿à®•à®³à¯, à®µà¯€à®Ÿà¯à®Ÿà¯ à®®à®±à¯à®±à¯à®®à¯ à®•à®¾à®Ÿà¯à®Ÿà¯ à®µà®¿à®²à®™à¯à®•à¯à®•à®³à¯, à®•à¯‹à®Ÿà¯ˆ/à®®à®´à¯ˆ/à®•à¯à®³à®¿à®°à¯ à®ªà®°à¯à®µà®™à¯à®•à®³à¯' : 'Trees, Shrubs, Herbs, Animals, Weather and 4 seasons',
          subtopics: [
            {
              id: 'fnd_s_sub2',
              title: 'à®‡à®¯à®±à¯à®•à¯ˆ à®‰à®²à®•à®®à¯ & à®µà®¿à®²à®™à¯à®•à¯à®•à®³à¯',
              microTopics: [
                { id: 'fnd_s_2', title: 'à®¤à®¾à®µà®°à®™à¯à®•à®³à®¿à®©à¯ à®ªà®¾à®•à®™à¯à®•à®³à¯ (à®µà¯‡à®°à¯, à®¤à®£à¯à®Ÿà¯, à®‡à®²à¯ˆ, à®ªà¯‚, à®•à®¾à®¯à¯)', keyAxiom: 'Plants give food, oxygen, and shade to all living beings' }
              ]
            }
          ],
          microTopics: [
            { id: 'fnd_s_2', topicTitle: isTa ? 'à®¤à®¾à®µà®° à®ªà®¾à®•à®™à¯à®•à®³à¯ & à®µà¯€à®Ÿà¯à®Ÿà¯/à®•à®¾à®Ÿà¯à®Ÿà¯ à®µà®¿à®²à®™à¯à®•à¯à®•à®³à¯' : 'Plant Parts & Animal Habitats', subtopic: isTa ? 'à®µà¯‡à®°à¯, à®¤à®£à¯à®Ÿà¯, à®‡à®²à¯ˆ, à®ªà¯‚ à®®à®±à¯à®±à¯à®®à¯ à®µà®¿à®²à®™à¯à®•à¯ à®‰à®£à®µà¯à®•à®³à¯' : 'Root, Stem, Leaf, Flower; Herbivores and Carnivores', dayNumber: 15, periodNumber: 4, keyFormulaOrLaw: 'Photosynthesis: Leaves prepare food using sunlight and water', keyPoints: ['Domestic animals: Cow, Goat, Dog, Cat', 'Wild animals: Lion, Tiger, Elephant, Deer'], type: 'concept', importance: 'Foundational' }
          ]
        }
      ]
    }
  ];

  return {
    courseId,
    courseTitle,
    category: 'school_foundational',
    board: 'TNSB Samacheer Kalvi / CBSE',
    medium: isTa ? 'Tamil' : 'English',
    totalDays: 200,
    totalSubjects: subjects.length,
    totalChapters: subjects.reduce((a, s) => a + s.chapters.length, 0),
    totalMicroTopics: subjects.reduce((a, s) => a + (s.totalMicroTopics || s.chapters.reduce((acc, c) => acc + (c.microTopics?.length || 0), 0)), 0),
    subjects
  };
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 2. PREPARATORY STAGE: CLASS 3 TO CLASS 5 (AGES 8â€“11)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function getPreparatoryClass3to5Syllabus(courseId: string, courseTitle: string): CourseFullSyllabus {
  const isTa = courseTitle.includes('தமிழ்') || courseId.includes('-ta-');

  const subjects: SyllabusSubject[] = [
    {
      subjectId: 'prep_tamil',
      subjectName: 'à®¤à®®à®¿à®´à¯ (Tamil â€” à®šà¯†à®¯à¯à®¯à¯à®³à¯, à®‰à®°à¯ˆà®¨à®Ÿà¯ˆ, à®¤à¯à®£à¯ˆà®ªà¯à®ªà®¾à®Ÿà®®à¯ & à®•à®±à¯à®•à®£à¯à®Ÿà¯ à®‡à®²à®•à¯à®•à®£à®®à¯)',
      icon: '🔤',
      color: '#ec4899',
      totalChapters: 4,
      totalMicroTopics: 14,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: 'à®šà¯†à®¯à¯à®¯à¯à®³à¯ à®ªà¯‡à®´à¯ˆ (à®‡à®©à¯à®ªà®¤à¯à®¤à®®à®¿à®´à¯, à®®à¯‚à®¤à¯à®°à¯ˆ & à®¤à®¿à®°à¯à®•à¯à®•à¯à®±à®³à¯)',
          description: 'à®ªà®¾à®°à®¤à®¿à®¤à®¾à®šà®©à¯ à®‡à®©à¯à®ªà®¤à¯à®¤à®®à®¿à®´à¯, à®”à®µà¯ˆà®¯à®¾à®°à¯ à®®à¯‚à®¤à¯à®°à¯ˆ (à®…à®Ÿà¯à®Ÿà®¾à®²à¯à®®à¯ à®ªà®¾à®²à¯à®šà¯à®µà¯ˆà®¯à®¿à®²à¯ à®•à¯à®©à¯à®±à®¾à®¤à¯), à®¤à®¿à®°à¯à®•à¯à®•à¯à®±à®³à¯ à®…à®©à¯à®ªà¯à®Ÿà¯ˆà®®à¯ˆ & à®‡à®©à®¿à®¯à®µà¯ˆ à®•à¯‚à®±à®²à¯',
          subtopics: [
            {
              id: 'prep_t_sub1',
              title: 'à®ªà®¾à®°à®¤à®¿à®¤à®¾à®šà®©à¯ à®‡à®©à¯à®ªà®¤à¯à®¤à®®à®¿à®´à¯ & à®®à¯‚à®¤à¯à®°à¯ˆ',
              microTopics: [
                { id: 'prep_t_1', title: 'à®¤à®®à®¿à®´à¯à®•à¯à®•à¯à®®à¯ à®…à®®à¯à®¤à¯†à®©à¯à®±à¯ à®ªà¯‡à®°à¯ â€” à®ªà®¾à®°à®¤à®¿à®¤à®¾à®šà®©à¯ à®•à®µà®¿à®¤à¯ˆ à®¨à®¯à®®à¯', keyAxiom: 'à®¤à®®à®¿à®´à¯ˆ à®‰à®¯à®¿à®°à¯à®•à¯à®•à¯ à®¨à¯‡à®°à®¾à®•à®ªà¯ à®ªà¯‹à®±à¯à®±à®¿à®¯ à®ªà¯à®°à®Ÿà¯à®šà®¿à®•à¯ à®•à®µà®¿à®žà®°à¯ à®ªà®¾à®°à®¤à®¿à®¤à®¾à®šà®©à¯' },
                { id: 'prep_t_2', title: 'à®”à®µà¯ˆà®¯à®¾à®°à¯ à®®à¯‚à®¤à¯à®°à¯ˆ â€” à®¨à®²à¯à®²à¯‹à®°à¯ à®¨à®Ÿà¯à®ªà®¿à®©à¯ à®šà®¿à®±à®ªà¯à®ªà¯ & à®®à®©à®ªà¯à®ªà®¾à®Ÿà®ªà¯ à®ªà®•à¯à®¤à®¿', keyAxiom: '"à®…à®Ÿà¯à®Ÿà®¾à®²à¯à®®à¯ à®ªà®¾à®²à¯à®šà¯à®µà¯ˆà®¯à®¿à®²à¯ à®•à¯à®©à¯à®±à®¾à®¤à¯" â€” à®…à®±à®¿à®žà®°à¯à®•à®³à¯ à®µà®±à¯à®®à¯ˆà®¯à®¿à®²à¯à®®à¯ à®¨à®±à¯à®ªà®£à¯à®ªà¯ à®¤à®µà®±à®¾à®°à¯' }
              ]
            }
          ],
          microTopics: [
            { id: 'prep_t_1', topicTitle: 'à®ªà®¾à®°à®¤à®¿à®¤à®¾à®šà®©à¯ à®‡à®©à¯à®ªà®¤à¯à®¤à®®à®¿à®´à¯ & à®”à®µà¯ˆà®¯à®¾à®°à¯ à®®à¯‚à®¤à¯à®°à¯ˆ', subtopic: 'à®¤à®®à®¿à®´à¯à®•à¯à®•à¯à®®à¯ à®…à®®à¯à®¤à¯†à®©à¯à®±à¯ à®ªà¯‡à®°à¯ & à®…à®Ÿà¯à®Ÿà®¾à®²à¯à®®à¯ à®ªà®¾à®²à¯à®šà¯à®µà¯ˆà®¯à®¿à®²à¯ à®•à¯à®©à¯à®±à®¾à®¤à¯', dayNumber: 1, periodNumber: 1, keyFormulaOrLaw: 'à®ªà®¾à®°à®¤à®¿à®¤à®¾à®šà®©à¯: "à®¤à®®à®¿à®´à¯à®•à¯à®•à¯à®®à¯ à®…à®®à¯à®¤à¯†à®©à¯à®±à¯ à®ªà¯‡à®°à¯! à®…à®¨à¯à®¤à®¤à¯ à®¤à®®à®¿à®´à¯†à®©à¯à®ª à®ªà¯‡à®°à®¿à®©à¯à®ªà®¤à¯ à®¤à®®à®¿à®´à¯†à®™à¯à®•à®³à¯ à®‰à®¯à®¿à®°à¯à®•à¯à®•à¯ à®¨à¯‡à®°à¯!"', keyPoints: ['à®ªà®¾à®°à®¤à®¿à®¤à®¾à®šà®©à®¿à®©à¯ à®‡à®¯à®±à¯à®ªà¯†à®¯à®°à¯ à®šà¯à®ªà¯à®ªà¯à®°à®¤à¯à®¤à®¿à®©à®®à¯', 'à®®à¯‚à®¤à¯à®°à¯ˆ à®¨à¯€à®¤à®¿ à®¨à¯‚à®²à¯ à®†à®šà®¿à®°à®¿à®¯à®°à¯ à®”à®µà¯ˆà®¯à®¾à®°à¯'], type: 'memorization', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: 'à®‰à®°à¯ˆà®¨à®Ÿà¯ˆ à®‰à®²à®•à®®à¯ (à®¤à®®à®¿à®´à®°à®¿à®©à¯ à®µà¯€à®° à®µà®¿à®³à¯ˆà®¯à®¾à®Ÿà¯à®Ÿà¯à®•à®³à¯ & à®•à®²à¯à®µà®¿à®•à¯à®•à®£à¯ à®¤à®¿à®±à®¨à¯à®¤ à®•à®¾à®®à®°à®¾à®šà®°à¯)',
          description: 'à®à®±à¯à®¤à®´à¯à®µà¯à®¤à®²à¯ (à®œà®²à¯à®²à®¿à®•à¯à®•à®Ÿà¯à®Ÿà¯), à®šà®¿à®²à®®à¯à®ªà®¾à®Ÿà¯à®Ÿà®®à¯, à®•à®ªà®Ÿà®¿, à®•à®¾à®®à®°à®¾à®šà®°à®¿à®©à¯ à®•à®²à¯à®µà®¿à®ªà¯ à®ªà¯à®°à®Ÿà¯à®šà®¿ & à®‡à®²à®µà®š à®®à®¤à®¿à®¯ à®‰à®£à®µà¯à®¤à¯ à®¤à®¿à®Ÿà¯à®Ÿà®®à¯',
          subtopics: [
            {
              id: 'prep_t_sub2',
              title: 'à®¤à®®à®¿à®´à®°à¯ à®®à®°à®ªà¯ & à®µà®°à®²à®¾à®±à¯à®±à¯ à®†à®³à¯à®®à¯ˆà®•à®³à¯',
              microTopics: [
                { id: 'prep_t_3', title: 'à®¤à®®à®¿à®´à®°à®¿à®©à¯ à®µà¯€à®° à®µà®¿à®³à¯ˆà®¯à®¾à®Ÿà¯à®Ÿà¯à®•à®³à¯ (à®à®±à¯à®¤à®´à¯à®µà¯à®¤à®²à¯ & à®šà®¿à®²à®®à¯à®ªà®®à¯)', keyAxiom: 'à®à®±à¯à®¤à®´à¯à®µà¯à®¤à®²à¯ à®¤à®®à®¿à®´à®°à®¿à®©à¯ à®‡à®°à®£à¯à®Ÿà®¾à®¯à®¿à®°à®®à¯ à®†à®£à¯à®Ÿà¯ à®¤à¯Šà®©à¯à®®à¯ˆà®¯à®¾à®© à®®à¯à®²à¯à®²à¯ˆ à®¨à®¿à®² à®µà¯€à®° à®µà®¿à®³à¯ˆà®¯à®¾à®Ÿà¯à®Ÿà¯' },
                { id: 'prep_t_4', title: 'à®•à®¾à®®à®°à®¾à®šà®°à®¿à®©à¯ à®•à®²à¯à®µà®¿à®ªà¯ à®ªà®£à®¿à®•à®³à¯ â€” à®‡à®²à®µà®šà®•à¯ à®•à®²à¯à®µà®¿ & à®®à®¤à®¿à®¯ à®‰à®£à®µà¯', keyAxiom: 'à®ªà®Ÿà¯à®Ÿà®¿à®¤à¯Šà®Ÿà¯à®Ÿà®¿à®¯à¯†à®™à¯à®•à¯à®®à¯ à®ªà®³à¯à®³à®¿à®•à®³à¯ à®¤à®¿à®±à®¨à¯à®¤à¯ à®•à®²à¯à®µà®¿à®•à¯à®•à®£à¯ à®¤à®¿à®±à®¨à¯à®¤ à®ªà¯†à®°à¯à®¨à¯à®¤à®²à¯ˆà®µà®°à¯ à®•à®¾à®®à®°à®¾à®šà®°à¯' }
              ]
            }
          ],
          microTopics: [
            { id: 'prep_t_3', topicTitle: 'à®¤à®®à®¿à®´à®°à¯ à®µà¯€à®° à®µà®¿à®³à¯ˆà®¯à®¾à®Ÿà¯à®Ÿà¯à®•à®³à¯ & à®•à®¾à®®à®°à®¾à®šà®°à¯ à®•à®²à¯à®µà®¿à®¤à¯ à®¤à¯Šà®£à¯à®Ÿà¯', subtopic: 'à®à®±à¯à®¤à®´à¯à®µà¯à®¤à®²à¯, à®šà®¿à®²à®®à¯à®ªà®®à¯, à®•à®ªà®Ÿà®¿ à®®à®±à¯à®±à¯à®®à¯ à®®à®¤à®¿à®¯ à®‰à®£à®µà¯à®¤à¯ à®¤à®¿à®Ÿà¯à®Ÿà®®à¯', dayNumber: 4, periodNumber: 1, keyFormulaOrLaw: 'à®•à®¾à®®à®°à®¾à®šà®°à¯: à®•à®²à¯à®µà®¿à®•à¯à®•à®£à¯ à®¤à®¿à®±à®¨à¯à®¤ à®•à®¾à®®à®°à®¾à®šà®°à¯ | à®à®±à¯à®¤à®´à¯à®µà¯à®¤à®²à¯: à®®à¯à®²à¯à®²à¯ˆ à®¨à®¿à®²à®ªà¯ à®ªà®£à¯à®ªà®¾à®Ÿà¯à®Ÿà¯ à®…à®Ÿà¯ˆà®¯à®¾à®³à®®à¯', keyPoints: ['à®•à®¾à®®à®°à®¾à®šà®°à¯à®•à¯à®•à¯ à®ªà®¾à®°à®¤ à®°à®¤à¯à®©à®¾ à®µà®¿à®°à¯à®¤à¯ à®µà®´à®™à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿ à®†à®£à¯à®Ÿà¯ 1976', 'à®œà®²à¯à®²à®¿à®•à¯à®•à®Ÿà¯à®Ÿà¯ à®ªà®±à¯à®±à®¿à®¯ à®•à¯à®±à®¿à®ªà¯à®ªà¯à®•à®³à¯ à®•à®²à®¿à®¤à¯à®¤à¯Šà®•à¯ˆà®¯à®¿à®²à¯ à®‰à®³à¯à®³à®©'], type: 'concept', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 3,
          chapterTitle: 'à®µà®¿à®°à®¿à®µà®¾à®©à®®à¯ / à®¤à¯à®£à¯ˆà®ªà¯à®ªà®¾à®Ÿà®®à¯ (à®®à¯à®¯à®²à¯ à®šà¯Šà®©à¯à®© à®•à®¤à¯ˆ & à®¤à®²à¯ˆà®®à¯ˆà®ªà¯ à®ªà®£à¯à®ªà¯)',
          description: 'à®¨à¯€à®¤à®¿à®•à¯ à®•à®¤à¯ˆà®•à®³à¯, à®¨à®±à¯à®ªà®£à¯à®ªà¯à®•à®³à¯, à®¤à®²à¯ˆà®®à¯ˆà®¤à¯à®¤à¯à®µ à®•à¯à®£à®™à¯à®•à®³à¯, à®¨à®¾à®Ÿà¯à®Ÿà¯à®ªà¯à®ªà¯à®±à®•à¯ à®•à®¤à¯ˆà®•à®³à¯',
          subtopics: [
            {
              id: 'prep_t_sub3',
              title: 'à®¨à¯€à®¤à®¿à®•à¯ à®•à®¤à¯ˆà®•à®³à¯ & à®¨à®±à¯à®ªà®£à¯à®ªà¯ à®µà®³à®°à¯à®ªà¯à®ªà¯',
              microTopics: [
                { id: 'prep_t_5', title: 'à®®à¯à®¯à®²à®¿à®©à¯ à®ªà¯à®¤à¯à®¤à®¿à®•à¯à®•à¯‚à®°à¯à®®à¯ˆ à®•à®¤à¯ˆ & à®¤à®²à¯ˆà®®à¯ˆà®ªà¯ à®ªà®£à¯à®ªà¯ à®¤à®¤à¯à®¤à¯à®µà®®à¯', keyAxiom: 'à®‰à®Ÿà®²à¯ à®ªà®²à®¤à¯à®¤à¯ˆ à®µà®¿à®Ÿ à®…à®±à®¿à®µà¯ à®ªà®²à®®à¯‡ à®šà®¿à®±à®¨à¯à®¤à®¤à¯' }
              ]
            }
          ],
          microTopics: [
            { id: 'prep_t_5', topicTitle: 'à®¤à¯à®£à¯ˆà®ªà¯à®ªà®¾à®Ÿà®•à¯ à®•à®¤à¯ˆà®•à®³à¯ â€” à®šà®®à®¯à¯‹à®šà®¿à®¤ à®ªà¯à®¤à¯à®¤à®¿ & à®¤à®²à¯ˆà®®à¯ˆà®¤à¯à®¤à¯à®µà®®à¯', subtopic: 'à®®à¯à®¯à®²à¯ à®šà¯Šà®©à¯à®© à®•à®¤à¯ˆ à®®à®±à¯à®±à¯à®®à¯ à®¤à®²à¯ˆà®®à¯ˆà®ªà¯ à®ªà®£à¯à®ªà¯ à®ªà®Ÿà®¿à®ªà¯à®ªà®¿à®©à¯ˆà®•à®³à¯', dayNumber: 7, periodNumber: 1, keyFormulaOrLaw: 'à®¨à¯€à®¤à®¿: "à®…à®±à®¿à®µà¯‡ à®†à®±à¯à®±à®²à¯" â€” à®¤à¯à®©à¯à®ªà®®à¯ à®µà®°à¯à®®à¯ à®µà¯‡à®³à¯ˆà®¯à®¿à®²à¯ à®…à®±à®¿à®µà¯à®•à¯à®•à¯‚à®°à¯à®®à¯ˆà®¯à¯à®Ÿà®©à¯ à®šà¯†à®¯à®²à¯à®ªà®Ÿ à®µà¯‡à®£à¯à®Ÿà¯à®®à¯', keyPoints: ['à®•à®¤à¯ˆà®¯à®¿à®©à¯ à®®à¯ˆà®¯à®•à¯ à®•à®°à¯à®¤à¯à®¤à¯ˆ à®‰à®£à®°à¯à®¨à¯à®¤à¯ à®šà¯Šà®¨à¯à®¤ à®¨à®Ÿà¯ˆà®¯à®¿à®²à¯ à®µà®¿à®µà®°à®¿à®¤à¯à®¤à®²à¯'], type: 'concept', importance: 'Foundational' }
          ]
        },
        {
          chapterNumber: 4,
          chapterTitle: 'à®•à®±à¯à®•à®£à¯à®Ÿà¯ / à®‡à®²à®•à¯à®•à®£à®®à¯ (à®¤à®¿à®£à¯ˆ, à®ªà®¾à®²à¯, à®Žà®£à¯, à®‡à®Ÿà®®à¯ & à®•à®¾à®²à®™à¯à®•à®³à¯)',
          description: 'à®‰à®¯à®°à¯à®¤à®¿à®£à¯ˆ/à®…à®ƒà®±à®¿à®£à¯ˆ, à®à®®à¯à®ªà®¾à®²à¯ (à®†à®£à¯à®ªà®¾à®²à¯, à®ªà¯†à®£à¯à®ªà®¾à®²à¯, à®ªà®²à®°à¯à®ªà®¾à®²à¯, à®’à®©à¯à®±à®©à¯à®ªà®¾à®²à¯, à®ªà®²à®µà®¿à®©à¯à®ªà®¾à®²à¯), à®®à¯‚à®µà®¿à®Ÿà®®à¯, à®®à¯à®•à¯à®•à®¾à®²à®®à¯',
          subtopics: [
            {
              id: 'prep_t_sub4',
              title: 'à®¤à®®à®¿à®´à¯ à®‡à®²à®•à¯à®•à®£ à®…à®Ÿà®¿à®ªà¯à®ªà®Ÿà¯ˆà®•à®³à¯',
              microTopics: [
                { id: 'prep_t_6', title: 'à®¤à®¿à®£à¯ˆ (2) & à®à®®à¯à®ªà®¾à®²à¯ à®ªà®¾à®•à¯à®ªà®¾à®Ÿà¯', keyAxiom: 'à®¤à®¿à®£à¯ˆ: à®‰à®¯à®°à¯à®¤à®¿à®£à¯ˆ (à®®à®©à®¿à®¤à®°à¯/à®¤à¯‡à®µà®°à¯), à®…à®ƒà®±à®¿à®£à¯ˆ (à®µà®¿à®²à®™à¯à®•à¯/à®ªà¯Šà®°à¯à®Ÿà¯à®•à®³à¯) | à®ªà®¾à®²à¯: à®†à®£à¯, à®ªà¯†à®£à¯, à®ªà®²à®°à¯, à®’à®©à¯à®±à¯, à®ªà®²' },
                { id: 'prep_t_7', title: 'à®®à¯à®•à¯à®•à®¾à®²à®®à¯ (à®‡à®±à®¨à¯à®¤, à®¨à®¿à®•à®´à¯, à®Žà®¤à®¿à®°à¯à®•à®¾à®²à®®à¯) & à®®à®¯à®™à¯à®•à¯Šà®²à®¿à®•à®³à¯ (à®£, à®¨, à®© / à®², à®´, à®³)', keyAxiom: 'à®®à®¯à®™à¯à®•à¯Šà®²à®¿ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯ 8: à®£-à®¨-à®©, à®²-à®´-à®³, à®°-à®±' }
              ]
            }
          ],
          microTopics: [
            { id: 'prep_t_6', topicTitle: 'à®¤à®¿à®£à¯ˆ (2 à®µà®•à¯ˆ), à®ªà®¾à®²à¯ (5 à®µà®•à¯ˆ), à®‡à®Ÿà®®à¯ (3) & à®®à®¯à®™à¯à®•à¯Šà®²à®¿ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯', subtopic: 'à®‰à®¯à®°à¯à®¤à®¿à®£à¯ˆ/à®…à®ƒà®±à®¿à®£à¯ˆ à®®à®±à¯à®±à¯à®®à¯ à®£-à®¨-à®©, à®²-à®´-à®³ à®µà¯‡à®±à¯à®ªà®¾à®Ÿà¯à®•à®³à¯', dayNumber: 10, periodNumber: 1, keyFormulaOrLaw: 'à®¤à®¿à®£à¯ˆ: à®‰à®¯à®°à¯à®¤à®¿à®£à¯ˆ, à®…à®ƒà®±à®¿à®£à¯ˆ | à®ªà®¾à®²à¯: à®†à®£à¯à®ªà®¾à®²à¯, à®ªà¯†à®£à¯à®ªà®¾à®²à¯, à®ªà®²à®°à¯à®ªà®¾à®²à¯, à®’à®©à¯à®±à®©à¯à®ªà®¾à®²à¯, à®ªà®²à®µà®¿à®©à¯à®ªà®¾à®²à¯', keyPoints: ['à®®à®©à®¿à®¤à®°à¯à®•à®³à¯ à®‰à®¯à®°à¯à®¤à®¿à®£à¯ˆ; à®ªà®±à®µà¯ˆà®•à®³à¯, à®µà®¿à®²à®™à¯à®•à¯à®•à®³à¯, à®¤à®¾à®µà®°à®™à¯à®•à®³à¯ à®…à®ƒà®±à®¿à®£à¯ˆ', 'à®®à®´à¯ˆ (à®®à®¾à®°à®¿), à®®à®¾à®²à¯ˆ (à®…à®¨à¯à®¤à®¿à®ªà¯à®ªà¯Šà®´à¯à®¤à¯), à®®à®¾à®´à¯ˆ (à®‰à®²à¯‹à®•à®®à¯) à®ªà¯Šà®°à¯à®³à¯ à®µà¯‡à®±à¯à®ªà®¾à®Ÿà¯'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        }
      ]
    },
    {
      subjectId: 'prep_english',
      subjectName: 'English (Prose, Poetry, Supplementary Reader & Grammar)',
      icon: '🔤',
      color: '#3b82f6',
      totalChapters: 4,
      totalMicroTopics: 14,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: 'Unit 1: Prose (*The Magic Fish*) & Poem (*The Rainbow*)',
          description: 'Reading comprehension, Christina Rossetti\'s poem "The Rainbow", Vocabulary, Synonyms & Antonyms',
          subtopics: [
            {
              id: 'prep_e_sub1',
              title: 'Unit 1: Literature & Reading',
              microTopics: [
                { id: 'prep_e_1', title: 'Prose: The Magic Fish & Moral Comprehension', keyAxiom: 'Greed leads to downfall; contentment brings true happiness' },
                { id: 'prep_e_2', title: 'Poem: The Rainbow (Boats sail on rivers, but clouds sail across the sky)', keyAxiom: 'Nature\'s creations are far more beautiful than man-made ships' }
              ]
            }
          ],
          microTopics: [
            { id: 'prep_e_1', topicTitle: 'Prose: The Magic Fish & Poem: The Rainbow', subtopic: 'Comprehension, Rhyming Words & Synonyms', dayNumber: 2, periodNumber: 2, keyFormulaOrLaw: 'Christina Rossetti: "Boats sail on the rivers, and ships sail on the seas; but clouds that sail across the sky are prettier far than these."', keyPoints: ['Identify rhyming words (seas-trees, sky-die)', 'Theme: Nature\'s supreme beauty'], type: 'memorization', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: 'Unit 2: Prose (*Brave Indian Warriors*) & Poem (*Trees are Kind*)',
          description: 'Patriotism, Indian Army heroes, Nature conservation poem, Verb tenses and regular/irregular verbs',
          subtopics: [
            {
              id: 'prep_e_sub2',
              title: 'Unit 2: Bravery & Environment',
              microTopics: [
                { id: 'prep_e_3', title: 'Prose: Brave Indian Warriors & Param Vir Chakra Heroes', keyAxiom: 'Sacrifices of soldiers defending Indian borders' },
                { id: 'prep_e_4', title: 'Poem: Trees are the Kindest Things I Know', keyAxiom: 'Trees give fruit, wood, shade, and oxygen without asking anything in return' }
              ]
            }
          ],
          microTopics: [
            { id: 'prep_e_3', topicTitle: 'Prose: Brave Warriors & Poem: Trees are the Kindest Things', subtopic: 'Tenses (Simple Present, Past, Future) and Paragraph Writing', dayNumber: 5, periodNumber: 2, keyFormulaOrLaw: 'Tenses: Present (play), Past (played), Future (will play)', keyPoints: ['Param Vir Chakra is India\'s highest military gallantry award', 'Regular verbs take -ed; Irregular verbs change form (go -> went -> gone)'], type: 'concept', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 3,
          chapterTitle: 'Unit 3: Supplementary (*The Honest Woodcutter & Tenali Raman*)',
          description: 'Moral stories, witty intelligence of Tenali Raman, character analysis and dialogue delivery',
          subtopics: [
            {
              id: 'prep_e_sub3',
              title: 'Unit 3: Supplementary Stories',
              microTopics: [
                { id: 'prep_e_5', title: 'Story: The Honest Woodcutter (Golden Axe vs Iron Axe)', keyAxiom: 'Honesty is always rewarded by the goddess of water' },
                { id: 'prep_e_6', title: 'Story: Tenali Raman and the Thieves', keyAxiom: 'Witty thinking outsmarts criminals without violence' }
              ]
            }
          ],
          microTopics: [
            { id: 'prep_e_5', topicTitle: 'Supplementary: The Honest Woodcutter & Tenali Raman Wit', subtopic: 'Character Sketches, Dialogue Comprehension & Vocabulary', dayNumber: 8, periodNumber: 2, keyFormulaOrLaw: 'Moral: "Honesty is the Best Policy" | Tenali Raman: Court poet of Krishnadevaraya', keyPoints: ['Sequence the story events in correct chronological order', 'Direct speech quotation marks usage'], type: 'concept', importance: 'Foundational' }
          ]
        },
        {
          chapterNumber: 4,
          chapterTitle: 'Unit 4: Grammar Master (Parts of Speech, Prepositions & Punctuation)',
          description: 'Nouns, Pronouns, Adjectives (Degrees), Verbs, Adverbs, Prepositions (in, on, under, between), Conjunctions (and, but, or)',
          subtopics: [
            {
              id: 'prep_e_sub4',
              title: 'Unit 4: Functional Grammar',
              microTopics: [
                { id: 'prep_e_7', title: '8 Parts of Speech & Adjectives Degrees of Comparison', keyAxiom: 'Positive (tall), Comparative (taller), Superlative (tallest)' },
                { id: 'prep_e_8', title: 'Prepositions of Place/Time & Conjunctions (and, but, because)', keyAxiom: 'Prepositions show relationship between noun and other words' }
              ]
            }
          ],
          microTopics: [
            { id: 'prep_e_7', topicTitle: '8 Parts of Speech, Degrees of Comparison & Prepositions', subtopic: 'Good-Better-Best, Prepositions (in, on, at, under) & Conjunctions', dayNumber: 11, periodNumber: 2, keyFormulaOrLaw: 'Comparison: Tall -> Taller -> Tallest | Beautiful -> More Beautiful -> Most Beautiful', keyPoints: ['Use Comparative degree with "than" (A is taller than B)', 'Use Superlative degree with "the" (A is the tallest boy)'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        }
      ]
    },
    {
      subjectId: 'prep_math',
      subjectName: isTa ? 'à®•à®£à®¿à®¤à®®à¯ & à®…à®Ÿà®¿à®ªà¯à®ªà®Ÿà¯ˆ à®‡à®¯à®±à¯à®•à®£à®¿à®¤à®®à¯ (Mathematics Core)' : 'Mathematics & Computational Arithmetic',
      icon: 'ðŸ“',
      color: '#06b6d4',
      totalChapters: 3,
      totalMicroTopics: 12,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: isTa ? 'à®ªà¯†à®°à®¿à®¯ à®Žà®£à¯à®•à®³à¯, à®•à®¾à®°à®£à®¿ & à®®à®Ÿà®™à¯à®•à¯à®•à®³à¯ (HCF & LCM)' : 'Large Numbers, Factors, Multiples, HCF & LCM',
          description: isTa ? '5â€“6 à®‡à®²à®•à¯à®• à®Žà®£à¯à®•à®³à¯, à®ªà®•à®¾ à®Žà®£à¯à®•à®³à¯, à®®à¯€.à®šà®¿.à®® & à®®à¯€.à®ªà¯Š.à®µ, à®‰à®°à¯‹à®®à®¾à®©à®¿à®¯ à®Žà®£à¯à®•à®³à¯' : '5 to 6-digit operations, Prime & Composite numbers, HCF & LCM, Roman Numerals',
          subtopics: [
            {
              id: 'prep_m_sub1',
              title: 'à®Žà®£à¯à®•à®£à®¿à®¤à®®à¯ & HCF/LCM',
              microTopics: [
                { id: 'prep_m_1', title: 'à®ªà®•à®¾ à®Žà®£à¯à®•à®³à¯ & à®®à¯€à®ªà¯à®ªà¯†à®°à¯ à®ªà¯Šà®¤à¯ à®•à®¾à®°à®£à®¿ (HCF / LCM)', keyAxiom: 'Product of Two Numbers = HCF Ã— LCM' },
                { id: 'prep_m_2', title: 'à®ªà®¿à®©à¯à®©à®™à¯à®•à®³à¯ & à®¤à®šà®® à®Žà®£à¯à®•à®³à¯ à®•à¯‚à®Ÿà¯à®Ÿà®²à¯/à®•à®´à®¿à®¤à¯à®¤à®²à¯', keyAxiom: 'Like/Unlike fractions, Equivalent fractions' }
              ]
            }
          ],
          microTopics: [
            { id: 'prep_m_1', topicTitle: isTa ? 'à®ªà®•à®¾ à®Žà®£à¯à®•à®³à¯ & à®ªà®•à®¾ à®•à®¾à®°à®£à®¿à®ªà¯à®ªà®Ÿà¯à®¤à¯à®¤à¯à®¤à®²à¯ (HCF / LCM)' : 'Prime Factorization, HCF & LCM Fundamentals', subtopic: isTa ? 'à®®à¯€à®ªà¯à®ªà¯†à®°à¯ à®ªà¯Šà®¤à¯ à®•à®¾à®°à®£à®¿ à®®à®±à¯à®±à¯à®®à¯ à®®à¯€à®šà¯à®šà®¿à®±à¯ à®ªà¯Šà®¤à¯ à®®à®Ÿà®™à¯à®•à¯' : 'Factor tree method, division method, Product = HCF Ã— LCM formula', dayNumber: 3, periodNumber: 3, keyFormulaOrLaw: 'Product of Two Numbers = HCF Ã— LCM | Prime Numbers have exactly 2 factors (1 and itself)', keyPoints: ['2 is the only even prime number', 'Co-prime numbers have HCF = 1'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: isTa ? 'à®¨à¯‡à®°à¯à®µà¯€à®¤ à®®à¯à®±à¯ˆ, à®µà®¿à®´à¯à®•à¯à®•à®¾à®Ÿà¯, à®‡à®²à®¾à®ª à®¨à®Ÿà¯à®Ÿà®®à¯' : 'Unitary Method, Percentages, Profit & Loss',
          description: isTa ? 'à®’à®°à¯ à®ªà¯Šà®°à¯à®³à®¿à®©à¯ à®µà®¿à®²à¯ˆ à®•à¯Šà®£à¯à®Ÿà¯ à®ªà®² à®ªà¯Šà®°à¯à®Ÿà¯à®•à®³à®¿à®©à¯ à®µà®¿à®²à¯ˆ à®•à®¾à®£à¯à®¤à®²à¯, à®šà®¤à®µà¯€à®¤ à®•à®£à®•à¯à®•à¯€à®Ÿà¯à®•à®³à¯' : 'Unitary method problems, Percentage conversions, Profit = SP - CP, Loss = CP - SP',
          subtopics: [
            {
              id: 'prep_m_sub2',
              title: 'à®µà®¿à®¯à®¾à®ªà®¾à®°à®•à¯ à®•à®£à®¿à®¤à®®à¯',
              microTopics: [
                { id: 'prep_m_3', title: 'à®¨à¯‡à®°à¯à®µà¯€à®¤ à®®à¯à®±à¯ˆ & à®Žà®³à®¿à®¯ à®µà®¿à®´à¯à®•à¯à®•à®¾à®Ÿà¯ à®•à®£à®•à¯à®•à¯€à®Ÿà¯', keyAxiom: 'Unit Cost = Total Cost / Total Units | Profit = SP - CP' }
              ]
            }
          ],
          microTopics: [
            { id: 'prep_m_3', topicTitle: isTa ? 'à®¨à¯‡à®°à¯à®µà¯€à®¤ à®®à¯à®±à¯ˆ & à®Žà®³à®¿à®¯ à®µà®¿à®´à¯à®•à¯à®•à®¾à®Ÿà¯ à®•à®£à®•à¯à®•à¯€à®Ÿà¯' : 'Unitary Method & Basic Percentages', subtopic: isTa ? 'à®…à®Ÿà®•à¯à®• à®µà®¿à®²à¯ˆ, à®µà®¿à®±à¯à®± à®µà®¿à®²à¯ˆ à®®à®±à¯à®±à¯à®®à¯ à®‡à®²à®¾à®ª à®¨à®Ÿà¯à®Ÿà®®à¯' : 'Find cost of 1 unit -> Multiply by desired quantity; % = (Value/Total) Ã— 100', dayNumber: 6, periodNumber: 3, keyFormulaOrLaw: 'Unitary Rule: Unit Cost = Total Cost / Total Units | Profit = SP - CP (if SP > CP)', keyPoints: ['Profit% = (Profit / CP) Ã— 100', 'Discount = Marked Price - Selling Price'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 3,
          chapterTitle: isTa ? 'à®µà®Ÿà®¿à®µà®¿à®¯à®²à¯: à®•à¯‹à®£à®™à¯à®•à®³à¯ & à®ªà®°à®ªà¯à®ªà®³à®µà¯ / à®šà¯à®±à¯à®±à®³à®µà¯' : 'Geometry: Angles, Perimeter & Area',
          description: isTa ? 'à®šà¯†à®™à¯à®•à¯‹à®£à®®à¯, à®•à¯à®±à¯à®™à¯à®•à¯‹à®£à®®à¯, à®µà®¿à®°à®¿à®•à¯‹à®£à®®à¯, à®šà¯†à®µà¯à®µà®•à®®à¯/à®šà®¤à¯à®°à®®à¯ à®šà¯à®±à¯à®±à®³à®µà¯' : 'Acute, Right, Obtuse angles; Perimeter = Sum of all sides; Area of Rectangle = l Ã— w',
          subtopics: [
            {
              id: 'prep_m_sub3',
              title: 'à®µà®Ÿà®¿à®µà®¿à®¯à®²à¯ & à®…à®³à®µà®¿à®¯à®²à¯',
              microTopics: [
                { id: 'prep_m_4', title: 'à®•à¯‹à®£à®™à¯à®•à®³à®¿à®©à¯ à®µà®•à¯ˆà®•à®³à¯ & à®šà¯à®±à¯à®±à®³à®µà¯ à®ªà®°à®ªà¯à®ªà®³à®µà¯ à®šà¯‚à®¤à¯à®¤à®¿à®°à®™à¯à®•à®³à¯', keyAxiom: 'Rectangle: P = 2(l+w), A = lÃ—w | Square: P = 4a, A = aÂ²' }
              ]
            }
          ],
          microTopics: [
            { id: 'prep_m_4', topicTitle: isTa ? 'à®µà®Ÿà®¿à®µà®¿à®¯à®²à¯: à®•à¯‹à®£à®™à¯à®•à®³à¯ & à®ªà®°à®ªà¯à®ªà®³à®µà¯ / à®šà¯à®±à¯à®±à®³à®µà¯' : 'Geometry: Angles, Perimeter & Area', subtopic: isTa ? 'à®šà¯†à®™à¯à®•à¯‹à®£à®®à¯, à®•à¯à®±à¯à®™à¯à®•à¯‹à®£à®®à¯, à®µà®¿à®°à®¿à®•à¯‹à®£à®®à¯, à®šà¯†à®µà¯à®µà®•à®®à¯/à®šà®¤à¯à®°à®®à¯ à®šà¯à®±à¯à®±à®³à®µà¯' : 'Acute, Right, Obtuse angles; Perimeter = Sum of all sides; Area of Rectangle = l Ã— w', dayNumber: 9, periodNumber: 3, keyFormulaOrLaw: 'Rectangle: Perimeter = 2(l + w), Area = l Ã— w | Square: Perimeter = 4a, Area = aÂ²', keyPoints: ['Right angle = 90Â°, Straight angle = 180Â°', 'Sum of angles in a triangle = 180Â°'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        }
      ]
    },
    {
      subjectId: 'prep_science',
      subjectName: isTa ? 'à®ªà¯Šà®¤à¯ à®…à®±à®¿à®µà®¿à®¯à®²à¯ (General Science & Human Physiology)' : 'General Science & Human Organ Systems',
      icon: 'ðŸ”¬',
      color: '#10b981',
      totalChapters: 2,
      totalMicroTopics: 8,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: isTa ? 'à®®à®©à®¿à®¤ à®‰à®±à¯à®ªà¯à®ªà¯ à®®à®£à¯à®Ÿà®²à®™à¯à®•à®³à¯ & à®Šà®Ÿà¯à®Ÿà®šà¯à®šà®¤à¯à®¤à¯' : 'Human Organ Systems & Nutrition',
          description: isTa ? 'à®šà¯†à®°à®¿à®®à®¾à®© à®®à®£à¯à®Ÿà®²à®®à¯, à®šà¯à®µà®¾à®š à®®à®£à¯à®Ÿà®²à®®à¯, à®°à®¤à¯à®¤ à®“à®Ÿà¯à®Ÿ à®®à®£à¯à®Ÿà®²à®®à¯ & à®šà®°à®¿à®µà®¿à®•à®¿à®¤ à®‰à®£à®µà¯' : 'Digestive, Respiratory, Circulatory, Nervous systems; Balanced diet (Carbs, Proteins, Vitamins, Minerals)',
          subtopics: [
            {
              id: 'prep_s_sub1',
              title: 'à®‰à®±à¯à®ªà¯à®ªà¯ à®®à®£à¯à®Ÿà®²à®™à¯à®•à®³à¯ & à®•à¯à®±à¯ˆà®ªà®¾à®Ÿà¯à®Ÿà¯ à®¨à¯‹à®¯à¯à®•à®³à¯',
              microTopics: [
                { id: 'prep_s_1', title: 'à®šà¯†à®°à®¿à®®à®¾à®© & à®šà¯à®µà®¾à®š à®‰à®±à¯à®ªà¯à®ªà¯ à®®à®£à¯à®Ÿà®²à®™à¯à®•à®³à¯', keyAxiom: 'Respiration: Glucose + Oxygen -> Energy (ATP) + COâ‚‚ + Hâ‚‚O' },
                { id: 'prep_s_2', title: 'à®µà¯ˆà®Ÿà¯à®Ÿà®®à®¿à®©à¯à®•à®³à¯ A, B, C, D à®•à¯à®±à¯ˆà®ªà®¾à®Ÿà¯à®Ÿà¯ à®¨à¯‹à®¯à¯à®•à®³à¯', keyAxiom: 'Vit A (Night blindness), Vit C (Scurvy), Vit D (Rickets), Iron (Anemia)' }
              ]
            }
          ],
          microTopics: [
            { id: 'prep_s_1', topicTitle: isTa ? 'à®šà¯†à®°à®¿à®®à®¾à®© & à®šà¯à®µà®¾à®š à®‰à®±à¯à®ªà¯à®ªà¯ à®®à®£à¯à®Ÿà®²à®™à¯à®•à®³à¯' : 'Digestive & Respiratory System Anatomy', subtopic: isTa ? 'à®‰à®£à®µà¯à®•à¯à®•à¯à®´à®¾à®¯à¯, à®‡à®°à¯ˆà®ªà¯à®ªà¯ˆ, à®šà®¿à®±à¯à®•à¯à®Ÿà®²à¯, à®®à¯‚à®šà¯à®šà¯à®•à¯à®•à¯à®´à®¾à®¯à¯, à®¨à¯à®°à¯ˆà®¯à¯€à®°à®²à¯' : 'Alimentary canal stages, Enzyme digestion, Alveoli gas exchange (Oâ‚‚ in, COâ‚‚ out)', dayNumber: 12, periodNumber: 4, keyFormulaOrLaw: 'Respiration: Glucose + Oxygen -> Energy (ATP) + Carbon Dioxide + Water', keyPoints: ['Digestion begins in the mouth with salivary amylase', 'Villi in small intestine absorb digested nutrients into bloodstream'], type: 'concept', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: isTa ? 'à®µà®¿à®šà¯ˆ, à®†à®±à¯à®±à®²à¯, à®Žà®³à®¿à®¯ à®Žà®¨à¯à®¤à®¿à®°à®™à¯à®•à®³à¯ & à®šà¯à®±à¯à®±à¯à®šà¯à®šà¯‚à®´à®²à¯' : 'Forces, Simple Machines & Water Cycle',
          description: isTa ? 'à®¨à¯†à®®à¯à®ªà¯à®•à¯‹à®²à¯ (Lever), à®•à®ªà¯à®ªà®¿ (Pulley), à®¨à¯€à®°à¯ à®šà¯à®´à®±à¯à®šà®¿ à®®à®±à¯à®±à¯à®®à¯ à®šà¯‚à®°à®¿à®¯ à®•à¯à®Ÿà¯à®®à¯à®ªà®®à¯' : 'Mechanical advantage, 1st/2nd/3rd Class Levers, Water cycle, 8 Planets',
          subtopics: [
            {
              id: 'prep_s_sub2',
              title: 'à®‡à®¯à®±à¯à®ªà®¿à®¯à®²à¯ & à®šà¯à®±à¯à®±à¯à®šà¯à®šà¯‚à®´à®²à¯',
              microTopics: [
                { id: 'prep_s_3', title: 'à®¨à¯†à®®à¯à®ªà¯à®•à¯‹à®²à¯ (Levers) 3 à®µà®•à¯ˆà®•à®³à¯ & à®¤à®¤à¯à®¤à¯à®µà®®à¯', keyAxiom: 'Load Ã— Load Arm = Effort Ã— Effort Arm' }
              ]
            }
          ],
          microTopics: [
            { id: 'prep_s_3', topicTitle: isTa ? 'à®µà®¿à®šà¯ˆ à®µà®•à¯ˆà®•à®³à¯ & à®Žà®³à®¿à®¯ à®Žà®¨à¯à®¤à®¿à®°à®™à¯à®•à®³à¯ (Lever & Pulley)' : 'Forces & Simple Machines (Levers & Pulleys)', subtopic: isTa ? 'à®¨à¯†à®®à¯à®ªà¯à®•à¯‹à®²à¯ 3 à®µà®•à¯ˆà®•à®³à¯ à®®à®±à¯à®±à¯à®®à¯ à®¤à®¤à¯à®¤à¯à®µà®®à¯' : 'Mechanical advantage, 1st Class (Seesaw), 2nd Class (Wheelbarrow), 3rd Class (Tongs)', dayNumber: 14, periodNumber: 4, keyFormulaOrLaw: 'Work = Force Ã— Displacement | Lever Principle: Load Ã— Load Arm = Effort Ã— Effort Arm', keyPoints: ['Simple machines make work easier by changing force direction or magnitude', 'Friction opposes relative motion between surfaces'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        }
      ]
    },
    {
      subjectId: 'prep_social',
      subjectName: isTa ? 'à®šà®®à¯‚à®• à®…à®±à®¿à®µà®¿à®¯à®²à¯ & à®•à¯à®Ÿà®¿à®®à¯ˆà®¯à®¿à®¯à®²à¯ (Social Science & Civics)' : 'Social Science, History & Indian Polity Seed',
      icon: 'ðŸŒ',
      color: '#f59e0b',
      totalChapters: 2,
      totalMicroTopics: 8,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: isTa ? 'à®‡à®¨à¯à®¤à®¿à®¯ à®‡à®¯à®±à¯à®•à¯ˆ à®…à®®à¯ˆà®ªà¯à®ªà¯à®•à®³à¯, à®†à®±à¯à®•à®³à¯ & à®µà®°à¯ˆà®ªà®Ÿà®®à¯' : 'Physical Geography of India, Rivers & Maps',
          description: isTa ? 'à®‡à®®à®¯à®®à®²à¯ˆ, à®•à®™à¯à®•à¯ˆ à®šà®®à®µà¯†à®³à®¿, à®¤à®•à¯à®•à®¾à®£ à®ªà¯€à®Ÿà®ªà¯‚à®®à®¿, à®•à®¾à®µà®¿à®°à®¿, à®µà¯ˆà®•à¯ˆ à®†à®±à¯à®•à®³à¯' : 'Himalayas, Northern Plains, Peninsular Plateau, Coastal Plains, Indian Rivers & Continents',
          subtopics: [
            {
              id: 'prep_soc_sub1',
              title: 'à®‡à®¨à¯à®¤à®¿à®¯ à®¨à®¿à®²à®ªà¯à®ªà®°à®ªà¯à®ªà¯ & à®†à®±à¯à®•à®³à¯',
              microTopics: [
                { id: 'prep_soc_1', title: 'à®‡à®®à®¯à®®à®²à¯ˆ, à®¤à®•à¯à®•à®¾à®£ à®ªà¯€à®Ÿà®ªà¯‚à®®à®¿ & à®•à®¾à®µà®¿à®°à®¿ à®¨à®¤à®¿ à®…à®®à¯ˆà®ªà¯à®ªà¯', keyAxiom: 'Cauvery originates at Talakaveri (Karnataka) and flows through Tamil Nadu' }
              ]
            }
          ],
          microTopics: [
            { id: 'prep_soc_1', topicTitle: isTa ? 'à®‡à®¨à¯à®¤à®¿à®¯ à®‡à®¯à®±à¯à®•à¯ˆ à®…à®®à¯ˆà®ªà¯à®ªà¯à®•à®³à¯ & à®†à®±à¯à®•à®³à¯ (Cauvery, Vaigai)' : 'Physical Divisions of India & Major Rivers', subtopic: isTa ? 'à®‡à®®à®¯à®®à®²à¯ˆ, à®¤à®•à¯à®•à®¾à®£ à®ªà¯€à®Ÿà®ªà¯‚à®®à®¿, à®•à®¾à®µà®¿à®°à®¿, à®•à®™à¯à®•à¯ˆ' : 'Perennial Himalayan rivers (Ganga, Indus) vs Rain-fed Peninsular rivers (Cauvery, Godavari)', dayNumber: 15, periodNumber: 4, keyFormulaOrLaw: 'Physical Divisions: Himalayas (North) | Plains (Central) | Plateau (South) | Deserts (West)', keyPoints: ['Cauvery originates at Talakaveri (Karnataka) and flows through Tamil Nadu', 'Continents: Asia is largest; Australia is smallest'], type: 'concept', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: isTa ? 'à®ªà®£à¯à®Ÿà¯ˆà®¯ à®µà®°à®²à®¾à®±à¯, à®®à¯‚à®µà¯‡à®¨à¯à®¤à®°à¯ & à®‡à®¨à¯à®¤à®¿à®¯ à®…à®°à®šà®¿à®¯à®²à®®à¯ˆà®ªà¯à®ªà¯' : 'Ancient History, Sangam Kings & Indian Constitution',
          description: isTa ? 'à®šà®¿à®¨à¯à®¤à¯ à®šà®®à®µà¯†à®³à®¿ à®…à®±à®¿à®®à¯à®•à®®à¯, à®šà¯‡à®° à®šà¯‹à®´ à®ªà®¾à®£à¯à®Ÿà®¿à®¯à®°à¯, à®…à®°à®šà®¿à®¯à®²à®®à¯ˆà®ªà¯à®ªà¯ à®®à¯à®•à®ªà¯à®ªà¯à®°à¯ˆ' : 'Indus Valley Civilization intro, Sangam Age (Chera, Chola, Pandya), Indian Constitution & Preamble',
          subtopics: [
            {
              id: 'prep_soc_sub2',
              title: 'à®µà®°à®²à®¾à®±à¯ & à®…à®°à®šà®¿à®¯à®²à®®à¯ˆà®ªà¯à®ªà¯',
              microTopics: [
                { id: 'prep_soc_2', title: 'à®šà¯‡à®° à®šà¯‹à®´ à®ªà®¾à®£à¯à®Ÿà®¿à®¯à®°à¯ à®šà®¿à®©à¯à®©à®™à¯à®•à®³à¯ & à®‡à®¨à¯à®¤à®¿à®¯ à®…à®°à®šà®¿à®¯à®²à®®à¯ˆà®ªà¯à®ªà¯ à®®à¯à®•à®ªà¯à®ªà¯à®°à¯ˆ', keyAxiom: 'Chera (Bow), Chola (Tiger), Pandya (Fish) | Constitution Preamble: Justice, Liberty, Equality' }
              ]
            }
          ],
          microTopics: [
            { id: 'prep_soc_2', topicTitle: isTa ? 'à®šà¯‡à®°, à®šà¯‹à®´, à®ªà®¾à®£à¯à®Ÿà®¿à®¯à®°à¯ à®µà®°à®²à®¾à®±à¯ & à®‡à®¨à¯à®¤à®¿à®¯ à®®à¯à®•à®ªà¯à®ªà¯à®°à¯ˆ' : 'Sangam Dynasties & Indian Constitution Preamble', subtopic: isTa ? 'à®®à¯‚à®µà¯‡à®¨à¯à®¤à®°à¯ à®šà®¿à®©à¯à®©à®™à¯à®•à®³à¯ & à®…à®°à®šà®¿à®¯à®²à®®à¯ˆà®ªà¯à®ªà¯ à®…à®Ÿà®¿à®ªà¯à®ªà®Ÿà¯ˆ' : 'Emblems (Bow-Arrow, Tiger, Fish), Dr. Ambedkar role, Preamble values (Justice, Liberty, Equality)', dayNumber: 16, periodNumber: 4, keyFormulaOrLaw: 'Constitution Day: 26 November | Republic Day: 26 January 1950', keyPoints: ['Chola capital: Uraiyur / Thanjavur | Pandya capital: Madurai', 'Fundamental Duties enshrined in Indian Constitution'], type: 'concept', importance: 'High-Yield' }
          ]
        }
      ]
    }
  ];

  return {
    courseId,
    courseTitle,
    category: 'school_preparatory',
    board: 'TNSB Samacheer Kalvi / CBSE',
    medium: isTa ? 'Tamil' : 'English',
    totalDays: 200,
    totalSubjects: subjects.length,
    totalChapters: subjects.reduce((a, s) => a + s.chapters.length, 0),
    totalMicroTopics: subjects.reduce((a, s) => a + (s.totalMicroTopics || s.chapters.reduce((acc, c) => acc + (c.microTopics?.length || 0), 0)), 0),
    subjects
  };
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 3. MIDDLE STAGE: CLASS 6 TO CLASS 8 (AGES 11â€“14 â€” SAMACHEER KALVI 9 IYAL)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function getMiddleClass6to8Syllabus(courseId: string, courseTitle: string): CourseFullSyllabus {
  const isTa = courseTitle.includes('தமிழ்') || courseId.includes('-ta-');

  const subjects: SyllabusSubject[] = [
    {
      subjectId: 'mid_tamil',
      subjectName: 'à®¤à®®à®¿à®´à¯ (Tamil â€” à®šà®®à®šà¯à®šà¯€à®°à¯ à®•à®²à¯à®µà®¿ 9 à®‡à®¯à®²à¯à®•à®³à¯ à®®à¯à®´à¯à®ªà¯ à®ªà®¾à®Ÿà®¤à¯à®¤à®¿à®Ÿà¯à®Ÿà®®à¯)',
      icon: '🔤',
      color: '#ec4899',
      totalChapters: 3,
      totalMicroTopics: 17,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: 'à®¤à®®à®¿à®´à¯ à®¨à®¾à®©à¯‹ à®…à®²à®•à¯à®•à®³à¯: à®‰à®¯à®¿à®°à¯, à®®à¯†à®¯à¯, à®®à®¾à®¤à¯à®¤à®¿à®°à¯ˆ & à®†à®¯à¯à®¤à®®à¯ (Days 41â€“46)',
          description: '5 à®•à¯à®±à®¿à®²à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯, 7 à®¨à¯†à®Ÿà®¿à®²à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯, à®µà®²à¯à®²à®¿à®©à®®à¯ à®®à¯†à®²à¯à®²à®¿à®©à®®à¯ à®‡à®Ÿà¯ˆà®¯à®¿à®©à®®à¯, à®†à®¯à¯à®¤ à®Žà®´à¯à®¤à¯à®¤à¯ à®ƒ à®®à®±à¯à®±à¯à®®à¯ à®®à®¾à®¤à¯à®¤à®¿à®°à¯ˆ à®•à®¾à®² à®…à®³à®µà¯à®•à®³à¯',
          subtopics: [
            {
              id: 'mid_t_sub1',
              title: 'à®Žà®´à¯à®¤à¯à®¤à¯ à®‡à®²à®•à¯à®•à®£ à®¨à®¾à®©à¯‹ à®…à®²à®•à¯à®•à®³à¯',
              microTopics: [
                { id: 'mid_t_41', title: 'à®‰à®¯à®¿à®°à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯: 5 à®•à¯à®±à®¿à®²à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯ (1 à®®à®¾à®¤à¯à®¤à®¿à®°à¯ˆ) (Day 41)', keyAxiom: 'à®…, à®‡, à®‰, à®Ž, à®’ â€” à®•à¯à®±à¯à®•à®¿à®¯ à®“à®šà¯ˆà®¯à¯à®Ÿà¯ˆà®¯ 5 à®‰à®¯à®¿à®°à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯' },
                { id: 'mid_t_42', title: 'à®‰à®¯à®¿à®°à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯: 7 à®¨à¯†à®Ÿà®¿à®²à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯ (2 à®®à®¾à®¤à¯à®¤à®¿à®°à¯ˆ) (Day 42)', keyAxiom: 'à®†, à®ˆ, à®Š, à®, à®, à®“, à®” â€” à®¨à¯€à®£à¯à®Ÿ à®“à®šà¯ˆà®¯à¯à®Ÿà¯ˆà®¯ 7 à®‰à®¯à®¿à®°à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯' },
                { id: 'mid_t_43', title: 'à®µà®²à¯à®²à®¿à®© à®®à¯†à®¯à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯: à®•à®šà®Ÿà®¤à®ªà®± (Day 43)', keyAxiom: 'à®•à¯, à®šà¯, à®Ÿà¯, à®¤à¯, à®ªà¯, à®±à¯ â€” à®µà®©à¯à®®à¯ˆà®¯à®¾à®© à®“à®šà¯ˆà®¯à¯à®Ÿà¯ˆà®¯ 6 à®®à¯†à®¯à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯' },
                { id: 'mid_t_44', title: 'à®®à¯†à®²à¯à®²à®¿à®© à®®à¯†à®¯à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯: à®™à®žà®£à®¨à®®à®© (Day 44)', keyAxiom: 'à®™à¯, à®žà¯, à®£à¯, à®¨à¯, à®®à¯, à®©à¯ â€” à®®à¯†à®©à¯à®®à¯ˆà®¯à®¾à®© à®®à¯‚à®•à¯à®•à¯Šà®²à®¿à®¯à¯à®Ÿà¯ˆà®¯ 6 à®®à¯†à®¯à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯' },
                { id: 'mid_t_45', title: 'à®‡à®Ÿà¯ˆà®¯à®¿à®© à®®à¯†à®¯à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯: à®¯à®°à®²à®µà®´à®³ (Day 45)', keyAxiom: 'à®¯à¯, à®°à¯, à®²à¯, à®µà¯, à®´à¯, à®³à¯ â€” à®‡à®Ÿà¯ˆà®ªà¯à®ªà®Ÿà¯à®Ÿ à®“à®šà¯ˆà®¯à¯à®Ÿà¯ˆà®¯ 6 à®®à¯†à®¯à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯' },
                { id: 'mid_t_46', title: 'à®†à®¯à¯à®¤ à®Žà®´à¯à®¤à¯à®¤à¯ (à®ƒ) à®ªà®¯à®©à¯à®ªà®¾à®Ÿà¯à®Ÿà¯ à®µà®¿à®¤à®¿à®•à®³à¯ (Day 46)', keyAxiom: 'à®šà¯Šà®²à¯à®²à®¿à®©à¯ à®‡à®Ÿà¯ˆà®¯à®¿à®²à¯ à®®à®Ÿà¯à®Ÿà¯à®®à¯‡ à®µà®°à¯à®®à¯; à®Žà®ƒà®•à¯, à®…à®ƒà®¤à¯, à®‡à®ƒà®¤à¯' }
              ]
            }
          ],
          microTopics: [
            { id: 'mid_t_41', topicTitle: 'à®‰à®¯à®¿à®°à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯: 5 à®•à¯à®±à®¿à®²à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯ (Day 41)', subtopic: 'à®•à¯à®±à¯à®•à®¿à®¯ à®“à®šà¯ˆà®¯à¯à®Ÿà¯ˆà®¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯: à®…, à®‡, à®‰, à®Ž, à®’ (1 à®®à®¾à®¤à¯à®¤à®¿à®°à¯ˆ à®•à®¾à®² à®…à®³à®µà¯)', dayNumber: 41, periodNumber: 1, keyFormulaOrLaw: 'à®•à¯à®±à®¿à®²à¯ à®Žà®´à¯à®¤à¯à®¤à¯ à®®à®¾à®¤à¯à®¤à®¿à®°à¯ˆ = 1 à®®à®¾à®¤à¯à®¤à®¿à®°à¯ˆ (à®’à®°à¯ à®®à¯à®±à¯ˆ à®•à®£à¯ à®‡à®®à¯ˆà®•à¯à®•à¯à®®à¯ à®…à®²à¯à®²à®¤à¯ à®•à¯ˆ à®¨à¯Šà®Ÿà®¿à®•à¯à®•à¯à®®à¯ à®¨à¯‡à®°à®®à¯)', keyPoints: ['à®‰à®¯à®¿à®°à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à®¿à®²à¯ à®•à¯à®±à®¿à®²à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯ à®®à¯Šà®¤à¯à®¤à®®à¯ 5', 'à®•à¯à®±à®¿à®²à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯ à®šà¯Šà®²à¯à®²à®¿à®©à¯ à®®à¯à®¤à®²à®¿à®²à¯ à®‰à®¯à®¿à®°à®¾à®•à®µà¯à®®à¯, à®®à¯†à®¯à¯à®¯à¯à®Ÿà®©à¯ à®‡à®£à¯ˆà®¨à¯à®¤à¯ à®‰à®¯à®¿à®°à¯à®®à¯†à®¯à¯à®•à¯ à®•à¯à®±à®¿à®²à®¾à®•à®µà¯à®®à¯ à®µà®°à¯à®®à¯'], type: 'concept', importance: 'High-Yield' },
            { id: 'mid_t_42', topicTitle: 'à®‰à®¯à®¿à®°à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯: 7 à®¨à¯†à®Ÿà®¿à®²à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯ (Day 42)', subtopic: 'à®¨à¯€à®£à¯à®Ÿ à®“à®šà¯ˆà®¯à¯à®Ÿà¯ˆà®¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯: à®†, à®ˆ, à®Š, à®, à®, à®“, à®” (2 à®®à®¾à®¤à¯à®¤à®¿à®°à¯ˆ à®•à®¾à®² à®…à®³à®µà¯)', dayNumber: 42, periodNumber: 1, keyFormulaOrLaw: 'à®¨à¯†à®Ÿà®¿à®²à¯ à®Žà®´à¯à®¤à¯à®¤à¯ à®®à®¾à®¤à¯à®¤à®¿à®°à¯ˆ = 2 à®®à®¾à®¤à¯à®¤à®¿à®°à¯ˆ (à®‡à®°à®£à¯à®Ÿà¯ à®®à¯à®±à¯ˆ à®•à®£à¯ à®‡à®®à¯ˆà®•à¯à®•à¯à®®à¯ à®•à®¾à®² à®…à®³à®µà¯)', keyPoints: ['à® à®®à®±à¯à®±à¯à®®à¯ à®” à®†à®•à®¿à®¯ à®‡à®°à®£à¯à®Ÿà¯à®®à¯ à®¨à¯†à®Ÿà®¿à®²à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à®¾à®•à¯à®®à¯', 'à®¨à¯†à®Ÿà®¿à®²à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯ à®¤à®©à®¿à®¤à¯à®¤à¯à®®à¯ à®®à¯†à®¯à¯à®¯à¯‹à®Ÿà¯ à®‡à®£à¯ˆà®¨à¯à®¤à¯à®®à¯ 2 à®®à®¾à®¤à¯à®¤à®¿à®°à¯ˆ à®’à®²à®¿à®•à¯à®•à¯à®®à¯'], type: 'concept', importance: 'High-Yield' },
            { id: 'mid_t_43', topicTitle: 'à®µà®²à¯à®²à®¿à®© à®®à¯†à®¯à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯: à®•à®šà®Ÿà®¤à®ªà®± (Day 43)', subtopic: 'à®µà®©à¯à®®à¯ˆà®¯à®¾à®© à®“à®šà¯ˆà®¯à¯à®Ÿà¯ˆà®¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯: à®•à¯, à®šà¯, à®Ÿà¯, à®¤à¯, à®ªà¯, à®±à¯ (à®…à®°à¯ˆ à®®à®¾à®¤à¯à®¤à®¿à®°à¯ˆ)', dayNumber: 43, periodNumber: 1, keyFormulaOrLaw: 'à®µà®²à¯à®²à®¿à®©à®®à¯ = à®•à¯, à®šà¯, à®Ÿà¯, à®¤à¯, à®ªà¯, à®±à¯ | à®®à®¾à®¤à¯à®¤à®¿à®°à¯ˆ à®…à®³à®µà¯ = Â½ à®®à®¾à®¤à¯à®¤à®¿à®°à¯ˆ', keyPoints: ['à®®à®¾à®°à¯à®ªà¯ˆà®¤à¯ à®¤à®²à¯ˆà®®à¯ˆà®¯à®¾à®•à®•à¯ à®•à¯Šà®£à¯à®Ÿà¯ à®ªà®¿à®±à®•à¯à®•à¯à®®à¯ à®µà®©à¯à®®à¯ˆà®¯à®¾à®© à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯', 'à®šà¯Šà®²à¯à®²à®¿à®©à¯ à®‡à®±à¯à®¤à®¿à®¯à®¿à®²à¯ à®Ÿà¯, à®¤à¯, à®ªà¯ à®ªà¯‹à®©à¯à®± à®šà®¿à®² à®µà®²à¯à®²à®¿à®© à®®à¯†à®¯à¯à®•à®³à¯ à®µà®¾à®°à®¾'], type: 'concept', importance: 'High-Yield' },
            { id: 'mid_t_44', topicTitle: 'à®®à¯†à®²à¯à®²à®¿à®© à®®à¯†à®¯à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯: à®™à®žà®£à®¨à®®à®© (Day 44)', subtopic: 'à®®à¯†à®©à¯à®®à¯ˆà®¯à®¾à®© à®“à®šà¯ˆà®¯à¯à®Ÿà¯ˆà®¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯: à®™à¯, à®žà¯, à®£à¯, à®¨à¯, à®®à¯, à®©à¯ (à®…à®°à¯ˆ à®®à®¾à®¤à¯à®¤à®¿à®°à¯ˆ)', dayNumber: 44, periodNumber: 1, keyFormulaOrLaw: 'à®®à¯†à®²à¯à®²à®¿à®©à®®à¯ = à®™à¯, à®žà¯, à®£à¯, à®¨à¯, à®®à¯, à®©à¯ | à®®à®¾à®¤à¯à®¤à®¿à®°à¯ˆ à®…à®³à®µà¯ = Â½ à®®à®¾à®¤à¯à®¤à®¿à®°à¯ˆ', keyPoints: ['à®®à¯‚à®•à¯à®•à¯ˆà®¤à¯ à®¤à®²à¯ˆà®®à¯ˆà®¯à®¾à®•à®•à¯ à®•à¯Šà®£à¯à®Ÿà¯ à®ªà®¿à®±à®•à¯à®•à¯à®®à¯ à®®à¯†à®²à¯à®²à®¿à®¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯', 'à®µà®²à¯à®²à®¿à®© à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯à®•à¯à®•à¯ à®‡à®© à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à®¾à®• à®¨à®Ÿà¯à®ªà¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à®¾à®• à®…à®®à¯ˆà®•à®¿à®©à¯à®±à®© (à®™à¯-à®•à¯, à®žà¯-à®šà¯, à®£à¯-à®Ÿà¯, à®¨à¯-à®¤à¯, à®®à¯-à®ªà¯, à®©à¯-à®±à¯)'], type: 'concept', importance: 'High-Yield' },
            { id: 'mid_t_45', topicTitle: 'à®‡à®Ÿà¯ˆà®¯à®¿à®© à®®à¯†à®¯à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯: à®¯à®°à®²à®µà®´à®³ (Day 45)', subtopic: 'à®‡à®Ÿà¯ˆà®ªà¯à®ªà®Ÿà¯à®Ÿ à®“à®šà¯ˆà®¯à¯à®Ÿà¯ˆà®¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯: à®¯à¯, à®°à¯, à®²à¯, à®µà¯, à®´à¯, à®³à¯ (à®…à®°à¯ˆ à®®à®¾à®¤à¯à®¤à®¿à®°à¯ˆ)', dayNumber: 45, periodNumber: 1, keyFormulaOrLaw: 'à®‡à®Ÿà¯ˆà®¯à®¿à®©à®®à¯ = à®¯à¯, à®°à¯, à®²à¯, à®µà¯, à®´à¯, à®³à¯ | à®®à®¾à®¤à¯à®¤à®¿à®°à¯ˆ à®…à®³à®µà¯ = Â½ à®®à®¾à®¤à¯à®¤à®¿à®°à¯ˆ', keyPoints: ['à®•à®´à¯à®¤à¯à®¤à¯ˆà®¤à¯ à®¤à®²à¯ˆà®®à¯ˆà®¯à®¾à®•à®•à¯ à®•à¯Šà®£à¯à®Ÿà¯ à®µà®©à¯à®®à¯ˆà®•à¯à®•à¯à®®à¯ à®®à¯†à®©à¯à®®à¯ˆà®•à¯à®•à¯à®®à¯ à®‡à®Ÿà¯ˆà®ªà¯à®ªà®Ÿà¯à®Ÿà¯ à®ªà®¿à®±à®•à¯à®•à®¿à®©à¯à®±à®©', 'à®¤à®®à®¿à®´à¯ à®®à¯Šà®´à®¿à®•à¯à®•à¯‡ à®šà®¿à®±à®ªà¯à®ªà®¾à®© "à®´à¯" (à®šà®¿à®±à®ªà¯à®ªà¯ à®´à®•à®°à®®à¯) à®‡à®Ÿà¯ˆà®¯à®¿à®© à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à®¿à®²à¯ à®’à®©à¯à®±à®¾à®•à¯à®®à¯'], type: 'concept', importance: 'High-Yield' },
            { id: 'mid_t_46', topicTitle: 'à®†à®¯à¯à®¤ à®Žà®´à¯à®¤à¯à®¤à¯ (à®ƒ) à®ªà®¯à®©à¯à®ªà®¾à®Ÿà¯à®Ÿà¯ à®µà®¿à®¤à®¿à®•à®³à¯ (Day 46)', subtopic: 'à®®à¯à®ªà¯à®ªà¯à®³à¯à®³à®¿, à®®à¯à®ªà¯à®ªà®¾à®±à¯à®ªà¯à®³à¯à®³à®¿, à®¤à®©à®¿à®¨à®¿à®²à¯ˆ (à®…à®°à¯ˆ à®®à®¾à®¤à¯à®¤à®¿à®°à¯ˆ)', dayNumber: 46, periodNumber: 1, keyFormulaOrLaw: 'à®†à®¯à¯à®¤à®®à¯ = à®ƒ | à®®à®¾à®¤à¯à®¤à®¿à®°à¯ˆ = Â½ | à®µà®¿à®¤à®¿: à®¤à®©à®•à¯à®•à¯ à®®à¯à®©à¯ à®’à®°à¯ à®•à¯à®±à®¿à®²à¯ˆà®¯à¯à®®à¯ à®ªà®¿à®©à¯ à®’à®°à¯ à®µà®²à¯à®²à®¿à®© à®‰à®¯à®¿à®°à¯à®®à¯†à®¯à¯à®¯à¯ˆà®¯à¯à®®à¯ à®ªà¯†à®±à¯à®®à¯', keyPoints: ['à®šà¯Šà®²à¯à®²à®¿à®©à¯ à®®à¯à®¤à®²à®¿à®²à¯‹ à®‡à®±à¯à®¤à®¿à®¯à®¿à®²à¯‹ à®µà®°à®¾à®¤à¯; à®šà¯Šà®²à¯à®²à®¿à®©à¯ à®‡à®Ÿà¯ˆà®¯à®¿à®²à¯ à®®à®Ÿà¯à®Ÿà¯à®®à¯‡ à®µà®°à¯à®®à¯ (à®Ž.à®•à®¾: à®Žà®ƒà®•à¯, à®…à®ƒà®¤à¯, à®‡à®ƒà®¤à¯)', 'à®†à®¯à¯à®¤ à®Žà®´à¯à®¤à¯à®¤à¯ˆ à®®à¯à®¤à®©à¯à®®à¯ˆà®¯à®¾à®•à®•à¯ à®•à¯Šà®£à¯à®Ÿ à®šà¯Šà®²à¯ à®¤à®©à®¿à®¨à®¿à®²à¯ˆà®šà¯ à®šà¯Šà®²à¯ à®Žà®©à®ªà¯à®ªà®Ÿà¯à®®à¯'], type: 'concept', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: 'à®¤à®®à®¿à®´à¯ à®¨à®¾à®©à¯‹ à®…à®²à®•à¯à®•à®³à¯: à®¤à®¿à®£à¯ˆ, à®ªà®¾à®²à¯ & à®®à¯à®•à¯à®•à®¾à®²à®®à¯ (Days 47â€“51)',
          description: 'à®‰à®¯à®°à¯à®¤à®¿à®£à¯ˆ à®…à®ƒà®±à®¿à®£à¯ˆ, à®†à®£à¯à®ªà®¾à®²à¯ à®ªà¯†à®£à¯à®ªà®¾à®²à¯ à®ªà®²à®°à¯à®ªà®¾à®²à¯ à®’à®©à¯à®±à®©à¯à®ªà®¾à®²à¯ à®ªà®²à®µà®¿à®©à¯à®ªà®¾à®²à¯ à®®à®±à¯à®±à¯à®®à¯ à®‡à®±à®¨à¯à®¤, à®¨à®¿à®•à®´à¯à®•à®¾à®², à®Žà®¤à®¿à®°à¯à®•à®¾à®² à®‡à®Ÿà¯ˆà®¨à®¿à®²à¯ˆà®•à®³à¯',
          subtopics: [
            {
              id: 'mid_t_sub2',
              title: 'à®¤à®¿à®£à¯ˆ, à®ªà®¾à®²à¯, à®•à®¾à®² à®¨à®¾à®©à¯‹ à®…à®²à®•à¯à®•à®³à¯',
              microTopics: [
                { id: 'mid_t_47', title: 'à®¤à®¿à®£à¯ˆ à®ªà®¾à®•à¯à®ªà®¾à®Ÿà¯: à®‰à®¯à®°à¯à®¤à®¿à®£à¯ˆ vs à®…à®ƒà®±à®¿à®£à¯ˆ (Day 47)', keyAxiom: 'à®ªà®•à¯à®¤à¯à®¤à®±à®¿à®µà¯à®³à¯à®³ à®®à®•à¯à®•à®³à¯ à®‰à®¯à®°à¯à®¤à®¿à®£à¯ˆ; à®ªà®±à®µà¯ˆ, à®µà®¿à®²à®™à¯à®•à¯, à®¤à®¾à®µà®°à®™à¯à®•à®³à¯ à®…à®ƒà®±à®¿à®£à¯ˆ' },
                { id: 'mid_t_48', title: 'à®à®®à¯à®ªà®¾à®²à¯ à®ªà®¾à®•à¯à®ªà®¾à®Ÿà¯ (à®†à®£à¯, à®ªà¯†à®£à¯, à®ªà®²à®°à¯, à®’à®©à¯à®±à¯, à®ªà®²) (Day 48)', keyAxiom: 'à®‰à®¯à®°à¯à®¤à®¿à®£à¯ˆ 3 à®ªà®¾à®²à¯ (à®†à®£à¯, à®ªà¯†à®£à¯, à®ªà®²à®°à¯); à®…à®ƒà®±à®¿à®£à¯ˆ 2 à®ªà®¾à®²à¯ (à®’à®©à¯à®±à¯, à®ªà®²)' },
                { id: 'mid_t_49', title: 'à®®à¯à®•à¯à®•à®¾à®²à®®à¯: à®‡à®±à®¨à¯à®¤ à®•à®¾à®² à®‡à®Ÿà¯ˆà®¨à®¿à®²à¯ˆà®•à®³à¯ (à®¤à¯, à®Ÿà¯, à®±à¯, à®‡à®©à¯) (Day 49)', keyAxiom: 'à®šà¯†à®¯à¯à®¤à®¾à®©à¯ (à®¤à¯), à®‰à®£à¯à®Ÿà®¾à®©à¯ (à®Ÿà¯), à®•à®±à¯à®±à®¾à®©à¯ (à®±à¯), à®ªà®¾à®Ÿà®¿à®©à®¾à®©à¯ (à®‡à®©à¯)' },
                { id: 'mid_t_50', title: 'à®®à¯à®•à¯à®•à®¾à®²à®®à¯: à®¨à®¿à®•à®´à¯à®•à®¾à®² à®‡à®Ÿà¯ˆà®¨à®¿à®²à¯ˆà®•à®³à¯ (à®•à®¿à®±à¯, à®•à®¿à®©à¯à®±à¯, à®†à®¨à®¿à®©à¯à®±à¯) (Day 50)', keyAxiom: 'à®šà¯†à®¯à¯à®•à®¿à®±à®¾à®©à¯ (à®•à®¿à®±à¯), à®‰à®£à¯à®•à®¿à®©à¯à®±à®¾à®©à¯ (à®•à®¿à®©à¯à®±à¯), à®µà®¾à®°à®¾à®¨à®¿à®©à¯à®±à®¾à®©à¯ (à®†à®¨à®¿à®©à¯à®±à¯)' },
                { id: 'mid_t_51', title: 'à®®à¯à®•à¯à®•à®¾à®²à®®à¯: à®Žà®¤à®¿à®°à¯à®•à®¾à®² à®‡à®Ÿà¯ˆà®¨à®¿à®²à¯ˆà®•à®³à¯ (à®ªà¯, à®µà¯) (Day 51)', keyAxiom: 'à®ªà®Ÿà®¿à®ªà¯à®ªà®¾à®©à¯ (à®ªà¯), à®µà®°à¯à®µà®¾à®©à¯ (à®µà¯)' }
              ]
            }
          ],
          microTopics: [
            { id: 'mid_t_47', topicTitle: 'à®¤à®¿à®£à¯ˆ à®ªà®¾à®•à¯à®ªà®¾à®Ÿà¯: à®‰à®¯à®°à¯à®¤à®¿à®£à¯ˆ vs à®…à®ƒà®±à®¿à®£à¯ˆ (Day 47)', subtopic: 'à®’à®´à¯à®•à¯à®•à®®à¯ à®®à®±à¯à®±à¯à®®à¯ à®ªà®•à¯à®¤à¯à®¤à®±à®¿à®µà¯ à®…à®Ÿà®¿à®ªà¯à®ªà®Ÿà¯ˆà®¯à®¿à®²à¯ à®‡à®°à¯à®¤à®¿à®£à¯ˆ à®µà®•à¯ˆà®ªà¯à®ªà®¾à®Ÿà¯', dayNumber: 47, periodNumber: 1, keyFormulaOrLaw: 'à®¤à®¿à®£à¯ˆ 2: à®‰à®¯à®°à¯à®¤à®¿à®£à¯ˆ (à®®à®©à®¿à®¤à®°à¯à®•à®³à¯, à®¤à¯‡à®µà®°à¯à®•à®³à¯, à®¨à®°à®•à®°à¯) | à®…à®ƒà®±à®¿à®£à¯ˆ (à®…à®²à¯ + à®¤à®¿à®£à¯ˆ = à®‰à®¯à®¿à®°à®±à¯à®±à®µà¯ˆ, à®µà®¿à®²à®™à¯à®•à¯à®•à®³à¯, à®¤à®¾à®µà®°à®™à¯à®•à®³à¯)', keyPoints: ['à®•à®£à¯à®£à®©à¯, à®†à®šà®¿à®°à®¿à®¯à®°à¯, à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯ - à®‰à®¯à®°à¯à®¤à®¿à®£à¯ˆ', 'à®®à®°à®®à¯, à®¨à®¾à®¯à¯, à®•à®Ÿà®²à¯, à®®à¯‡à®•à®®à¯, à®¨à®¿à®²à®¾ - à®…à®ƒà®±à®¿à®£à¯ˆ'], type: 'concept', importance: 'High-Yield' },
            { id: 'mid_t_48', topicTitle: 'à®à®®à¯à®ªà®¾à®²à¯ à®ªà®¾à®•à¯à®ªà®¾à®Ÿà¯ (Day 48)', subtopic: 'à®ªà®¾à®²à¯ à®Žà®©à¯à®ªà®¤à¯ à®¤à®¿à®£à¯ˆà®¯à®¿à®©à¯ à®‰à®Ÿà¯à®ªà®¿à®°à®¿à®µà¯ (5 à®µà®•à¯ˆà®•à®³à¯)', dayNumber: 48, periodNumber: 1, keyFormulaOrLaw: 'à®‰à®¯à®°à¯à®¤à®¿à®£à¯ˆ: à®†à®£à¯à®ªà®¾à®²à¯ (à®…à®©à¯), à®ªà¯†à®£à¯à®ªà®¾à®²à¯ (à®…à®³à¯), à®ªà®²à®°à¯à®ªà®¾à®²à¯ (à®…à®°à¯) | à®…à®ƒà®±à®¿à®£à¯ˆ: à®’à®©à¯à®±à®©à¯à®ªà®¾à®²à¯ (à®¤à¯), à®ªà®²à®µà®¿à®©à¯à®ªà®¾à®²à¯ (à®…)', keyPoints: ['à®®à®¾à®£à®µà®©à¯ (à®†à®£à¯à®ªà®¾à®²à¯), à®®à®¾à®£à®µà®¿ (à®ªà¯†à®£à¯à®ªà®¾à®²à¯), à®®à®¾à®£à®µà®°à¯à®•à®³à¯ (à®ªà®²à®°à¯à®ªà®¾à®²à¯)', 'à®•à¯à®¤à®¿à®°à¯ˆ à®µà®¨à¯à®¤à®¤à¯ (à®’à®©à¯à®±à®©à¯à®ªà®¾à®²à¯), à®•à¯à®¤à®¿à®°à¯ˆà®•à®³à¯ à®µà®¨à¯à®¤à®© (à®ªà®²à®µà®¿à®©à¯à®ªà®¾à®²à¯)'], type: 'concept', importance: 'High-Yield' },
            { id: 'mid_t_49', topicTitle: 'à®®à¯à®•à¯à®•à®¾à®²à®®à¯: à®‡à®±à®¨à¯à®¤ à®•à®¾à®² à®‡à®Ÿà¯ˆà®¨à®¿à®²à¯ˆà®•à®³à¯ (Day 49)', subtopic: 'à®¨à®Ÿà®¨à¯à®¤à¯ à®®à¯à®Ÿà®¿à®¨à¯à®¤ à®šà¯†à®¯à®²à¯ˆà®•à¯ à®•à¯à®±à®¿à®•à¯à®•à¯à®®à¯ à®‡à®Ÿà¯ˆà®¨à®¿à®²à¯ˆà®•à®³à¯: à®¤à¯, à®Ÿà¯, à®±à¯, à®‡à®©à¯', dayNumber: 49, periodNumber: 1, keyFormulaOrLaw: 'à®‡à®±à®¨à¯à®¤ à®•à®¾à®² à®‡à®Ÿà¯ˆà®¨à®¿à®²à¯ˆà®•à®³à¯: à®¤à¯, à®Ÿà¯, à®±à¯, à®‡à®©à¯ (à®ªà®•à¯à®¤à®¿ + à®‡à®Ÿà¯ˆà®¨à®¿à®²à¯ˆ + à®µà®¿à®•à¯à®¤à®¿)', keyPoints: ['à®šà¯†à®¯à¯à®¤à®¾à®©à¯ = à®šà¯†à®¯à¯ + à®¤à¯ + à®†à®©à¯ (à®¤à¯ = à®‡à®±à®¨à¯à®¤ à®•à®¾à®² à®‡à®Ÿà¯ˆà®¨à®¿à®²à¯ˆ)', 'à®“à®Ÿà®¿à®©à®¾à®©à¯ = à®“à®Ÿà¯ + à®‡à®©à¯ + à®†à®©à¯ (à®‡à®©à¯ = à®‡à®±à®¨à¯à®¤ à®•à®¾à®² à®‡à®Ÿà¯ˆà®¨à®¿à®²à¯ˆ)'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'mid_t_50', topicTitle: 'à®®à¯à®•à¯à®•à®¾à®²à®®à¯: à®¨à®¿à®•à®´à¯à®•à®¾à®² à®‡à®Ÿà¯ˆà®¨à®¿à®²à¯ˆà®•à®³à¯ (Day 50)', subtopic: 'à®‡à®ªà¯à®ªà¯‹à®¤à¯ à®¨à®¿à®•à®´à¯à®®à¯ à®šà¯†à®¯à®²à¯ˆà®•à¯ à®•à¯à®±à®¿à®•à¯à®•à¯à®®à¯ à®‡à®Ÿà¯ˆà®¨à®¿à®²à¯ˆà®•à®³à¯: à®•à®¿à®±à¯, à®•à®¿à®©à¯à®±à¯, à®†à®¨à®¿à®©à¯à®±à¯', dayNumber: 50, periodNumber: 1, keyFormulaOrLaw: 'à®¨à®¿à®•à®´à¯à®•à®¾à®² à®‡à®Ÿà¯ˆà®¨à®¿à®²à¯ˆà®•à®³à¯: à®•à®¿à®±à¯, à®•à®¿à®©à¯à®±à¯, à®†à®¨à®¿à®©à¯à®±à¯', keyPoints: ['à®ªà®Ÿà®¿à®•à¯à®•à®¿à®±à®¾à®©à¯ = à®ªà®Ÿà®¿ + à®•à¯ + à®•à®¿à®±à¯ + à®†à®©à¯ (à®•à®¿à®±à¯ = à®¨à®¿à®•à®´à¯à®•à®¾à®² à®‡à®Ÿà¯ˆà®¨à®¿à®²à¯ˆ)', 'à®‰à®£à¯à®•à®¿à®©à¯à®±à®¾à®©à¯ = à®‰à®£à¯ + à®•à®¿à®©à¯à®±à¯ + à®†à®©à¯ (à®•à®¿à®©à¯à®±à¯ = à®¨à®¿à®•à®´à¯à®•à®¾à®² à®‡à®Ÿà¯ˆà®¨à®¿à®²à¯ˆ)'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'mid_t_51', topicTitle: 'à®®à¯à®•à¯à®•à®¾à®²à®®à¯: à®Žà®¤à®¿à®°à¯à®•à®¾à®² à®‡à®Ÿà¯ˆà®¨à®¿à®²à¯ˆà®•à®³à¯ (Day 51)', subtopic: 'à®‡à®©à®¿à®®à¯‡à®²à¯ à®¨à®Ÿà®•à¯à®•à®µà®¿à®°à¯à®•à¯à®•à¯à®®à¯ à®šà¯†à®¯à®²à¯ˆà®•à¯ à®•à¯à®±à®¿à®•à¯à®•à¯à®®à¯ à®‡à®Ÿà¯ˆà®¨à®¿à®²à¯ˆà®•à®³à¯: à®ªà¯, à®µà¯', dayNumber: 51, periodNumber: 1, keyFormulaOrLaw: 'à®Žà®¤à®¿à®°à¯à®•à®¾à®² à®‡à®Ÿà¯ˆà®¨à®¿à®²à¯ˆà®•à®³à¯: à®ªà¯, à®µà¯', keyPoints: ['à®•à®¾à®£à¯à®ªà®¾à®©à¯ = à®•à®¾à®£à¯ + à®ªà¯ + à®†à®©à¯ (à®ªà¯ = à®Žà®¤à®¿à®°à¯à®•à®¾à®² à®‡à®Ÿà¯ˆà®¨à®¿à®²à¯ˆ)', 'à®µà®°à¯à®µà®¾à®©à¯ = à®µà®¾(à®µà®°à¯) + à®µà¯ + à®†à®©à¯ (à®µà¯ = à®Žà®¤à®¿à®°à¯à®•à®¾à®² à®‡à®Ÿà¯ˆà®¨à®¿à®²à¯ˆ)'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 3,
          chapterTitle: 'à®¤à®®à®¿à®´à¯ à®¨à®¾à®©à¯‹ à®…à®²à®•à¯à®•à®³à¯: à®¤à¯Šà®•à¯ˆà®¨à®¿à®²à¯ˆà®¤à¯ à®¤à¯Šà®Ÿà®°à¯à®•à®³à¯ & à®ªà¯à®£à®°à¯à®šà¯à®šà®¿ (Days 52â€“57)',
          description: 'à®µà¯‡à®±à¯à®±à¯à®®à¯ˆà®¤à¯à®¤à¯Šà®•à¯ˆ, à®µà®¿à®©à¯ˆà®¤à¯à®¤à¯Šà®•à¯ˆ, à®ªà®£à¯à®ªà¯à®¤à¯à®¤à¯Šà®•à¯ˆ, à®‰à®µà®®à¯ˆà®¤à¯à®¤à¯Šà®•à¯ˆ, à®‰à®®à¯à®®à¯ˆà®¤à¯à®¤à¯Šà®•à¯ˆ à®®à®±à¯à®±à¯à®®à¯ à®µà®²à¯à®²à®¿à®©à®®à¯ à®®à®¿à®•à¯à®®à¯/à®®à®¿à®•à®¾ à®‡à®Ÿà®™à¯à®•à®³à¯',
          subtopics: [
            {
              id: 'mid_t_sub3',
              title: 'à®¤à¯Šà®•à¯ˆà®¨à®¿à®²à¯ˆ & à®ªà¯à®£à®°à¯à®šà¯à®šà®¿ à®¨à®¾à®©à¯‹ à®…à®²à®•à¯à®•à®³à¯',
              microTopics: [
                { id: 'mid_t_52', title: 'à®µà¯‡à®±à¯à®±à¯à®®à¯ˆà®¤à¯ à®¤à¯Šà®•à¯ˆ: à®, à®†à®²à¯, à®•à¯, à®‡à®©à¯, à®…à®¤à¯, à®•à®£à¯ à®®à®±à¯ˆà®¤à®²à¯ (Day 52)', keyAxiom: 'à®ªà®¾à®²à¯ à®•à¯à®Ÿà®¿à®¤à¯à®¤à®¾à®©à¯ = à®ªà®¾à®²à¯ˆà®•à¯ à®•à¯à®Ÿà®¿à®¤à¯à®¤à®¾à®©à¯ (2-à®†à®®à¯ à®µà¯‡à®±à¯à®±à¯à®®à¯ˆ à®‰à®°à¯à®ªà¯ à® à®®à®±à¯ˆà®¨à¯à®¤à®¤à¯)' },
                { id: 'mid_t_53', title: 'à®µà®¿à®©à¯ˆà®¤à¯à®¤à¯Šà®•à¯ˆ: à®®à¯à®•à¯à®•à®¾à®²à®®à¯à®®à¯ à®®à®±à¯ˆà®¨à¯à®¤à¯ à®µà®°à¯à®¤à®²à¯ (Day 53)', keyAxiom: 'à®Šà®±à¯à®•à®¾à®¯à¯ = à®Šà®±à®¿à®¯ à®•à®¾à®¯à¯, à®Šà®±à¯à®•à®¿à®©à¯à®± à®•à®¾à®¯à¯, à®Šà®±à¯à®®à¯ à®•à®¾à®¯à¯ (à®•à®¾à®²à®®à¯ à®•à®¾à®Ÿà¯à®Ÿà¯à®®à¯ à®‡à®Ÿà¯ˆà®¨à®¿à®²à¯ˆ à®®à®±à¯ˆà®¨à¯à®¤à®¤à¯)' },
                { id: 'mid_t_54', title: 'à®ªà®£à¯à®ªà¯à®¤à¯à®¤à¯Šà®•à¯ˆ: à®®à¯ˆ à®µà®¿à®•à¯à®¤à®¿à®¯à¯à®®à¯ à®†à®•à®¿à®¯, à®†à®© à®‰à®°à¯à®ªà¯à®•à®³à¯à®®à¯ à®®à®±à¯ˆà®¤à®²à¯ (Day 54)', keyAxiom: 'à®šà¯†à®¨à¯à®¤à®¾à®®à®°à¯ˆ = à®šà¯†à®®à¯à®®à¯ˆà®¯à®¾à®•à®¿à®¯ à®¤à®¾à®®à®°à¯ˆ | à®µà®Ÿà¯à®Ÿà®¤à¯à®¤à¯Šà®Ÿà¯à®Ÿà®¿ = à®µà®Ÿà¯à®Ÿà®®à®¾à®•à®¿à®¯ à®¤à¯Šà®Ÿà¯à®Ÿà®¿' },
                { id: 'mid_t_55', title: 'à®‰à®µà®®à¯ˆà®¤à¯à®¤à¯Šà®•à¯ˆ & à®‰à®®à¯à®®à¯ˆà®¤à¯à®¤à¯Šà®•à¯ˆ (Day 55)', keyAxiom: 'à®®à®²à®°à¯à®µà®¿à®´à®¿ (à®ªà¯‹à®² à®®à®±à¯ˆà®¨à¯à®¤à®¤à¯) | à®¤à®¾à®¯à¯ à®¤à®¨à¯à®¤à¯ˆ (à®¤à®¾à®¯à¯à®®à¯ à®¤à®¨à¯à®¤à¯ˆà®¯à¯à®®à¯ - à®‰à®®à¯ à®®à®±à¯ˆà®¨à¯à®¤à®¤à¯)' },
                { id: 'mid_t_56', title: 'à®µà®²à¯à®²à®¿à®©à®®à¯ à®®à®¿à®•à¯à®®à¯ à®‡à®Ÿà®™à¯à®•à®³à¯: à®…à®¨à¯à®¤, à®‡à®¨à¯à®¤ à®šà¯à®Ÿà¯à®Ÿà¯à®ªà¯à®ªà¯†à®¯à®°à¯à®•à®³à¯ à®ªà®¿à®©à¯ (Day 56)', keyAxiom: 'à®…à®¨à¯à®¤ + à®•à®¾à®Ÿà¯ = à®…à®¨à¯à®¤à®•à¯à®•à®¾à®Ÿà¯ | à®‡à®¨à¯à®¤ + à®ªà¯ˆà®¯à®©à¯ = à®‡à®¨à¯à®¤à®ªà¯à®ªà¯ˆà®¯à®©à¯' },
                { id: 'mid_t_57', title: 'à®µà®²à¯à®²à®¿à®©à®®à¯ à®®à®¿à®•à®¾ à®‡à®Ÿà®™à¯à®•à®³à¯: à®µà®¿à®©à¯ˆà®¤à¯à®¤à¯Šà®•à¯ˆ & à®…à®¤à¯, à®‡à®¤à¯ à®ªà®¿à®©à¯ (Day 57)', keyAxiom: 'à®•à¯à®Ÿà®¿ à®¤à®£à¯à®£à¯€à®°à¯ (à®µà®¿à®©à¯ˆà®¤à¯à®¤à¯Šà®•à¯ˆ à®®à®¿à®•à®¾à®¤à¯) | à®…à®¤à¯ à®šà¯†à®©à¯à®±à®¤à¯ (à®®à®¿à®•à®¾à®¤à¯)' }
              ]
            }
          ],
          microTopics: [
            { id: 'mid_t_52', topicTitle: 'à®µà¯‡à®±à¯à®±à¯à®®à¯ˆà®¤à¯ à®¤à¯Šà®•à¯ˆ (Day 52)', subtopic: 'à®µà¯‡à®±à¯à®±à¯à®®à¯ˆ à®‰à®°à¯à®ªà¯à®•à®³à¯ (à®, à®†à®²à¯, à®•à¯, à®‡à®©à¯, à®…à®¤à¯, à®•à®£à¯) à®šà¯Šà®²à¯à®²à®¿à®©à¯ à®¨à®Ÿà¯à®µà®¿à®²à¯ à®®à®±à¯ˆà®¨à¯à®¤à¯ à®µà®°à¯à®¤à®²à¯', dayNumber: 52, periodNumber: 1, keyFormulaOrLaw: 'à®µà¯‡à®±à¯à®±à¯à®®à¯ˆà®¤à¯ à®¤à¯Šà®•à¯ˆ: à®ªà¯†à®¯à®°à¯à®šà¯à®šà¯Šà®²à¯ + à®ªà¯†à®¯à®°à¯à®šà¯à®šà¯Šà®²à¯ (à®µà¯‡à®±à¯à®±à¯à®®à¯ˆ à®‰à®°à¯à®ªà¯ à®®à®±à¯ˆà®µà¯)', keyPoints: ['à®•à®°à¯à®®à¯à®ªà¯ à®¤à®¿à®©à¯à®±à®¾à®©à¯ = à®•à®°à¯à®®à¯à®ªà¯ˆà®¤à¯ à®¤à®¿à®©à¯à®±à®¾à®©à¯ (2-à®†à®®à¯ à®µà¯‡à®±à¯à®±à¯à®®à¯ˆà®¤à¯ à®¤à¯Šà®•à¯ˆ)', 'à®¤à®²à¯ˆ à®µà®£à®™à¯à®•à®¿à®©à®¾à®©à¯ = à®¤à®²à¯ˆà®¯à®¾à®²à¯ à®µà®£à®™à¯à®•à®¿à®©à®¾à®©à¯ (3-à®†à®®à¯ à®µà¯‡à®±à¯à®±à¯à®®à¯ˆà®¤à¯ à®¤à¯Šà®•à¯ˆ)'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'mid_t_53', topicTitle: 'à®µà®¿à®©à¯ˆà®¤à¯à®¤à¯Šà®•à¯ˆ: à®Šà®±à¯à®•à®¾à®¯à¯ (Day 53)', subtopic: 'à®µà®¿à®©à¯ˆà®ªà¯à®ªà®•à¯à®¤à®¿à®¯à¯à®®à¯ à®ªà¯†à®¯à®°à¯à®šà¯à®šà¯Šà®²à¯à®²à¯à®®à¯ à®‡à®£à¯ˆà®¨à¯à®¤à¯ à®®à¯à®•à¯à®•à®¾à®²à®®à¯à®®à¯ à®®à®±à¯ˆà®¨à¯à®¤à¯ à®¨à®¿à®©à¯à®±à¯ à®ªà¯Šà®°à¯à®³à¯ à®¤à®°à¯à®¤à®²à¯', dayNumber: 53, periodNumber: 1, keyFormulaOrLaw: 'à®µà®¿à®©à¯ˆà®¤à¯à®¤à¯Šà®•à¯ˆ = à®µà®¿à®©à¯ˆà®ªà¯à®ªà®•à¯à®¤à®¿ (à®à®µà®²à¯) + à®ªà¯†à®¯à®°à¯à®šà¯à®šà¯Šà®²à¯ (à®•à®¾à®²à®®à¯ à®•à®°à®¨à¯à®¤ à®ªà¯†à®¯à®°à¯†à®šà¯à®šà®®à¯)', keyPoints: ['à®Šà®±à¯à®•à®¾à®¯à¯ = à®Šà®±à®¿à®¯ à®•à®¾à®¯à¯, à®Šà®±à¯à®•à®¿à®©à¯à®± à®•à®¾à®¯à¯, à®Šà®±à¯à®®à¯ à®•à®¾à®¯à¯', 'à®šà¯à®Ÿà¯à®šà¯‹à®±à¯, à®…à®²à¯ˆà®•à®Ÿà®²à¯, à®ªà®¾à®¯à¯à®ªà¯à®²à®¿, à®µà®³à®°à¯à®ªà®¿à®±à¯ˆ à®†à®•à®¿à®¯à®µà¯ˆ à®µà®¿à®©à¯ˆà®¤à¯à®¤à¯Šà®•à¯ˆà®•à®³à¯'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'mid_t_54', topicTitle: 'à®ªà®£à¯à®ªà¯à®¤à¯à®¤à¯Šà®•à¯ˆ: à®šà¯†à®¨à¯à®¤à®¾à®®à®°à¯ˆ (Day 54)', subtopic: 'à®¨à®¿à®±à®®à¯, à®µà®Ÿà®¿à®µà®®à¯, à®šà¯à®µà¯ˆ, à®…à®³à®µà¯ à®†à®•à®¿à®¯ à®ªà®£à¯à®ªà¯à®•à®³à¯ˆ à®‰à®£à®°à¯à®¤à¯à®¤à®¿ "à®®à¯ˆ" à®µà®¿à®•à¯à®¤à®¿ à®®à®±à¯ˆà®¨à¯à®¤à¯ à®µà®°à¯à®¤à®²à¯', dayNumber: 54, periodNumber: 1, keyFormulaOrLaw: 'à®ªà®£à¯à®ªà¯à®¤à¯à®¤à¯Šà®•à¯ˆ = à®ªà®£à¯à®ªà¯à®ªà¯à®ªà¯†à®¯à®°à¯ + à®†à®•à®¿à®¯/à®†à®© à®‰à®°à¯à®ªà¯ à®®à®±à¯ˆà®µà¯', keyPoints: ['à®šà¯†à®¨à¯à®¤à®¾à®®à®°à¯ˆ = à®šà¯†à®®à¯à®®à¯ˆ + à®¤à®¾à®®à®°à¯ˆ (à®šà¯†à®®à¯à®®à¯ˆà®¯à®¾à®•à®¿à®¯ à®¤à®¾à®®à®°à¯ˆ)', 'à®µà¯†à®£à¯à®£à®¿à®²à®µà¯ = à®µà¯†à®£à¯à®®à¯ˆ + à®¨à®¿à®²à®µà¯ | à®•à®°à¯à®™à¯à®•à¯à®µà®³à¯ˆ = à®•à®°à¯à®®à¯ˆ + à®•à¯à®µà®³à¯ˆ'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'mid_t_55', topicTitle: 'à®‰à®µà®®à¯ˆà®¤à¯à®¤à¯Šà®•à¯ˆ & à®‰à®®à¯à®®à¯ˆà®¤à¯à®¤à¯Šà®•à¯ˆ (Day 55)', subtopic: 'à®‰à®µà®® à®‰à®°à¯à®ªà¯ (à®ªà¯‹à®², à®ªà¯‹à®©à¯à®±) à®®à®±à¯à®±à¯à®®à¯ à®Žà®£à¯à®£à¯à®®à¯à®®à¯ˆ (à®‰à®®à¯) à®®à®±à¯ˆà®¨à¯à®¤à¯ à®µà®°à¯à®¤à®²à¯', dayNumber: 55, periodNumber: 1, keyFormulaOrLaw: 'à®‰à®µà®®à¯ˆà®¤à¯à®¤à¯Šà®•à¯ˆ: à®‰à®µà®®à®¾à®©à®®à¯ + à®‰à®µà®®à¯‡à®¯à®®à¯ | à®‰à®®à¯à®®à¯ˆà®¤à¯à®¤à¯Šà®•à¯ˆ: à®Žà®£à¯à®£à®²à¯/à®…à®³à®µà¯ˆà®šà¯ à®šà¯Šà®±à¯à®•à®³à®¿à®²à¯ "à®‰à®®à¯" à®®à®±à¯ˆà®µà¯', keyPoints: ['à®®à®²à®°à¯à®µà®¿à®´à®¿ = à®®à®²à®°à¯ à®ªà¯‹à®©à¯à®± à®µà®¿à®´à®¿ (à®‰à®µà®®à¯ˆà®¤à¯à®¤à¯Šà®•à¯ˆ)', 'à®‡à®°à®µà¯à®ªà®•à®²à¯ = à®‡à®°à®µà¯à®®à¯ à®ªà®•à®²à¯à®®à¯ | à®…à®£à¯à®£à®©à¯ à®¤à®®à¯à®ªà®¿ = à®…à®£à¯à®£à®©à¯à®®à¯ à®¤à®®à¯à®ªà®¿à®¯à¯à®®à¯ (à®‰à®®à¯à®®à¯ˆà®¤à¯à®¤à¯Šà®•à¯ˆ)'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'mid_t_56', topicTitle: 'à®µà®²à¯à®²à®¿à®©à®®à¯ à®®à®¿à®•à¯à®®à¯ à®‡à®Ÿà®™à¯à®•à®³à¯ (Day 56)', subtopic: 'à®…, à®‡ à®šà¯à®Ÿà¯à®Ÿà¯†à®´à¯à®¤à¯à®¤à¯à®•à®³à®¿à®©à¯ à®ªà®¿à®©à¯à®©à¯à®®à¯, à®Ž à®µà®¿à®©à®¾à®µà¯†à®´à¯à®¤à¯à®¤à®¿à®©à¯ à®ªà®¿à®©à¯à®©à¯à®®à¯ à®µà®²à¯à®²à®¿à®©à®®à¯ à®®à®¿à®•à¯à®®à¯', dayNumber: 56, periodNumber: 1, keyFormulaOrLaw: 'à®µà®¿à®¤à®¿: à®…à®¨à¯à®¤, à®‡à®¨à¯à®¤, à®Žà®¨à¯à®¤ + à®µà®²à¯à®²à®¿à®© à®®à¯†à®¯à¯ (à®•à¯, à®šà¯, à®¤à¯, à®ªà¯) à®®à®¿à®•à¯à®®à¯', keyPoints: ['à®…à®¨à¯à®¤ + à®•à®¾à®Ÿà¯ = à®…à®¨à¯à®¤à®•à¯à®•à®¾à®Ÿà¯ | à®‡à®¨à¯à®¤ + à®šà®Ÿà¯à®Ÿà¯ˆ = à®‡à®¨à¯à®¤à®šà¯à®šà®Ÿà¯à®Ÿà¯ˆ', 'à®Žà®¨à¯à®¤ + à®ªà¯à®¤à¯à®¤à®•à®®à¯ = à®Žà®¨à¯à®¤à®ªà¯à®ªà¯à®¤à¯à®¤à®•à®®à¯'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'mid_t_57', topicTitle: 'à®µà®²à¯à®²à®¿à®©à®®à¯ à®®à®¿à®•à®¾ à®‡à®Ÿà®™à¯à®•à®³à¯ (Day 57)', subtopic: 'à®µà®¿à®©à¯ˆà®¤à¯à®¤à¯Šà®•à¯ˆà®¯à®¿à®²à¯à®®à¯, à®…à®¤à¯, à®‡à®¤à¯, à®Žà®¤à¯ à®šà¯à®Ÿà¯à®Ÿà¯à®ªà¯ à®ªà¯†à®¯à®°à¯à®•à®³à®¿à®©à¯ à®ªà®¿à®©à¯à®©à¯à®®à¯ à®µà®²à¯à®²à®¿à®©à®®à¯ à®®à®¿à®•à®¾à®¤à¯', dayNumber: 57, periodNumber: 1, keyFormulaOrLaw: 'à®µà®¿à®¤à®¿: à®µà®¿à®©à¯ˆà®¤à¯à®¤à¯Šà®•à¯ˆà®¯à®¿à®²à¯ à®µà®²à¯à®²à®¿à®©à®®à¯ à®®à®¿à®•à®¾à®¤à¯ | à®…à®¤à¯, à®‡à®¤à¯, à®Žà®¤à¯ à®ªà®¿à®©à¯ à®®à®¿à®•à®¾à®¤à¯', keyPoints: ['à®•à¯à®Ÿà®¿ à®¤à®£à¯à®£à¯€à®°à¯ (à®•à¯à®Ÿà®¿à®¤à¯à®¤à®£à¯à®£à¯€à®°à¯ à®¤à®µà®±à¯)', 'à®…à®¤à¯ à®ªà®±à®¨à¯à®¤à®¤à¯ (à®…à®¤à¯à®ªà¯à®ªà®±à®¨à¯à®¤à®¤à¯ à®¤à®µà®±à¯) | à®Žà®¤à¯ à®•à®£à¯à®Ÿà®¾à®¯à¯ (à®Žà®¤à¯à®•à¯à®•à®£à¯à®Ÿà®¾à®¯à¯ à®¤à®µà®±à¯)'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        }
      ]
    },
    {
      subjectId: 'mid_english',
      subjectName: 'English (Samacheer Kalvi Units 1 to 7 Full Curriculum)',
      icon: '🔤',
      color: '#3b82f6',
      totalChapters: 7,
      totalMicroTopics: 21,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: 'Unit 1: Prose (*Sea Turtles*), Poem (*The Crocodile*) & Supplementary (*Owlie*)',
          description: 'Marine ecology, Olive Ridley turtles conservation, Lewis Carroll poem, Subject & Predicate, Types of Sentences',
          subtopics: [
            {
              id: 'mid_e_sub1',
              title: 'Unit 1: Marine Life & Grammar',
              microTopics: [
                { id: 'mid_e_1', title: 'Prose: Sea Turtles (Olive Ridley nesting & conservation)', keyAxiom: 'Olive Ridleys nest along coastal beaches in Arribada mass nesting' },
                { id: 'mid_e_2', title: 'Poem: The Crocodile by Lewis Carroll & Rhyme Scheme', keyAxiom: 'How doth the little crocodile improve his shining tail' },
                { id: 'mid_e_3', title: 'Grammar: Subject & Predicate, 4 Types of Sentences', keyAxiom: 'Declarative (statement), Interrogative (?), Imperative (command), Exclamatory (!)' }
              ]
            }
          ],
          microTopics: [
            { id: 'mid_e_1', topicTitle: 'Unit 1: Sea Turtles, The Crocodile & 4 Sentence Types', subtopic: 'Subject + Predicate, Declarative, Interrogative, Imperative, Exclamatory', dayNumber: 2, periodNumber: 2, keyFormulaOrLaw: 'Sentence Types: Statement (.) | Question (?) | Command/Request | Exclamation (!)', keyPoints: ['Olive Ridley turtles travel thousands of kilometres to lay eggs', 'Lewis Carroll is author of Alice in Wonderland'], type: 'concept', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: 'Unit 2: Prose (*When the Trees Walked*) & Poem (*Trees*)',
          description: 'Ruskin Bond nature story, Grandfather\'s tree planting, Adjectives, Degrees of Comparison',
          subtopics: [
            {
              id: 'mid_e_sub2',
              title: 'Unit 2: Nature & Comparison',
              microTopics: [
                { id: 'mid_e_4', title: 'Prose: When the Trees Walked by Ruskin Bond', keyAxiom: 'Planting trees on rocky river island transforms environment' },
                { id: 'mid_e_5', title: 'Grammar: Adjectives & Degrees of Comparison', keyAxiom: 'Positive, Comparative (-er/more), Superlative (-est/most)' }
              ]
            }
          ],
          microTopics: [
            { id: 'mid_e_4', topicTitle: 'Unit 2: Ruskin Bond Trees & Degrees of Comparison', subtopic: 'Adjective degrees: Fast-Faster-Fastest, Interesting-More-Most', dayNumber: 5, periodNumber: 2, keyFormulaOrLaw: 'Comparison: as + adj + as (Positive) | adj-er + than (Comparative) | the + adj-est (Superlative)', keyPoints: ['Ruskin Bond lives in Mussoorie and writes about Indian flora and fauna'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 3,
          chapterTitle: 'Unit 3: Prose (*A Visitor from Distant Lands*) & Grammar (*Tenses*)',
          description: 'History of spices (Chilli, Pepper, Cardamom, Cinnamon) brought by Vasco da Gama & Columbus, Verb Tenses',
          subtopics: [
            {
              id: 'mid_e_sub3',
              title: 'Unit 3: Spices History & Tenses',
              microTopics: [
                { id: 'mid_e_6', title: 'Prose: Spices of India & Portuguese Traders', keyAxiom: 'Vasco da Gama reached Calicut (1498) seeking black gold (Pepper)' },
                { id: 'mid_e_7', title: 'Grammar: 12 Verb Tenses (Simple, Continuous, Perfect)', keyAxiom: 'Present Perfect: has/have + V3 | Past Continuous: was/were + V-ing' }
              ]
            }
          ],
          microTopics: [
            { id: 'mid_e_6', topicTitle: 'Unit 3: Spices of India & 12 English Verb Tenses', subtopic: 'Present, Past, Future, Continuous & Perfect Tenses with Timeline', dayNumber: 8, periodNumber: 2, keyFormulaOrLaw: 'Present Perfect: S + has/have + V3 | Past Perfect: S + had + V3 | Future: S + will + V1', keyPoints: ['Chilli was brought to India from South America by Portuguese explorers'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 4,
          chapterTitle: 'Unit 4: Prose (*Sports Stars*) & Supplementary (*Think to Win*)',
          description: 'Mithali Raj, P.V. Sindhu, Mary Kom achievements, Teamwork poem, Conjunctions & Prepositional Phrases',
          subtopics: [
            {
              id: 'mid_e_sub4',
              title: 'Unit 4: Sports Biographies & Prepositions',
              microTopics: [
                { id: 'mid_e_8', title: 'Biographies: Mithali Raj, P.V. Sindhu & Mary Kom', keyAxiom: 'Dedication, grit, and discipline overcome gender barriers in Indian sports' },
                { id: 'mid_e_9', title: 'Grammar: Prepositions of Position, Direction & Time', keyAxiom: 'Across, through, into, upon, beside, between, among' }
              ]
            }
          ],
          microTopics: [
            { id: 'mid_e_8', topicTitle: 'Unit 4: Sports Stars & Prepositions (in, on, into, between, among)', subtopic: 'Between (two entities) vs Among (more than two entities)', dayNumber: 11, periodNumber: 2, keyFormulaOrLaw: 'Rule: Between 2 people/items | Among > 2 people/items | Into shows motion', keyPoints: ['Mithali Raj is the highest run-scorer in Women\'s International Cricket'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        }
      ]
    },
    {
      subjectId: 'mid_math',
      subjectName: isTa ? 'à®•à®£à®¿à®¤à®®à¯ (Mathematics & Pre-Algebra)' : 'Mathematics, Pre-Algebra & Geometry',
      icon: 'ðŸ“',
      color: '#06b6d4',
      totalChapters: 3,
      totalMicroTopics: 18,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: isTa ? 'à®Žà®£à¯à®•à®£à®¿à®¤à®®à¯ & à®µà®°à®¿à®šà¯ˆ: BODMAS, HCF & LCM à®¨à®¾à®©à¯‹ à®¤à®²à¯ˆà®ªà¯à®ªà¯à®•à®³à¯' : 'Arithmetic & Operations: BODMAS, HCF & LCM Nano-Topics',
          description: isTa ? 'à®šà¯†à®¯à®²à¯à®ªà®¾à®Ÿà¯à®•à®³à®¿à®©à¯ à®µà®°à®¿à®šà¯ˆ BODMAS à®ªà®¿à®°à®¾à®•à¯à®•à¯†à®Ÿà¯à®Ÿà¯à®•à®³à¯, à®µà®•à¯à®¤à¯à®¤à®²à¯ à®ªà¯†à®°à¯à®•à¯à®•à®²à¯ à®®à¯à®©à¯à®©à¯à®°à®¿à®®à¯ˆ, à®ªà®•à®¾ à®•à®¾à®°à®£à®¿ à®®à®°à®®à¯, à®¯à¯‚à®•à¯à®³à®¿à®Ÿà¯ à®µà®´à®¿à®®à¯à®±à¯ˆ, à®®à¯€.à®ªà¯Š.à®µ à®®à®±à¯à®±à¯à®®à¯ à®®à¯€.à®šà®¿.à®® à®ªà®¯à®©à¯à®ªà®¾à®Ÿà¯à®Ÿà¯à®•à¯ à®•à®£à®•à¯à®•à¯à®•à®³à¯' : 'BODMAS bracket hierarchy, Division/Multiplication precedence, Prime factorization tree, Euclid long division, and Real-world HCF/LCM word problems',
          subtopics: [
            {
              id: 'mid_m_sub1',
              title: 'BODMAS & HCF/LCM Nano-Units',
              microTopics: [
                { id: 'mid_m_1', title: 'BODMAS: Brackets Hierarchy (), {}, [] (Day 1)', keyAxiom: 'Innermost () first, then {}, finally outer []' },
                { id: 'mid_m_2', title: 'BODMAS: Division & Multiplication Priority (Day 2)', keyAxiom: 'Ã· and Ã— have equal precedence; evaluate Left-to-Right' },
                { id: 'mid_m_3', title: 'BODMAS: Addition & Subtraction Priority (Day 3)', keyAxiom: '+ and - have equal precedence; evaluate Left-to-Right' },
                { id: 'mid_m_4', title: 'HCF: Prime Factorization Tree Method (Day 4)', keyAxiom: 'Product of lowest powers of common prime factors' },
                { id: 'mid_m_5', title: 'HCF: Euclid Division / Long Division Method (Day 5)', keyAxiom: 'a = bq + r until remainder r = 0' },
                { id: 'mid_m_6', title: 'LCM: Common Division Method (Day 6)', keyAxiom: 'Product of all prime divisors including remaining factors' },
                { id: 'mid_m_7', title: 'HCF Ã— LCM = Product of Two Numbers Identity (Day 7)', keyAxiom: 'Numberâ‚ Ã— Numberâ‚‚ = HCF(a,b) Ã— LCM(a,b)' },
                { id: 'mid_m_8', title: 'HCF & LCM Word Problems: Bells & Tiles (Day 8)', keyAxiom: 'HCF for largest tile size; LCM for simultaneous bell intervals' }
              ]
            }
          ],
          microTopics: [
            { id: 'mid_m_1', topicTitle: 'BODMAS: Brackets Hierarchy (), {}, [] (Day 1)', subtopic: 'Solving Innermost Round Brackets (), Curly Brackets {}, and Square Brackets []', dayNumber: 1, periodNumber: 1, keyFormulaOrLaw: 'BODMAS Order: () -> {} -> [] -> Orders -> Ã· -> Ã— -> + -> -', keyPoints: ['Always simplify expressions inside the innermost parentheses first', 'Nested brackets evaluate from inside out like peeling an onion'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'mid_m_2', topicTitle: 'BODMAS: Division & Multiplication Precedence (Day 2)', subtopic: 'Left-to-Right Rule for Equal Precedence Operations in 24 Ã· 4 Ã— 2 vs 24 Ã— 4 Ã· 2', dayNumber: 2, periodNumber: 1, keyFormulaOrLaw: 'Rule: Division and Multiplication have EQUAL priority; Evaluate Left-to-Right', keyPoints: ['In 24 Ã· 4 Ã— 2, do 24 Ã· 4 = 6 first, then 6 Ã— 2 = 12 (not 24 Ã· 8)', 'Never prioritize multiplication over division unless indicated by brackets'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'mid_m_3', topicTitle: 'BODMAS: Addition & Subtraction Precedence (Day 3)', subtopic: 'Left-to-Right Evaluation and Grouping Positive and Negative Terms', dayNumber: 3, periodNumber: 1, keyFormulaOrLaw: 'Rule: Addition and Subtraction have EQUAL priority; Evaluate Left-to-Right', keyPoints: ['Group all positive numbers together and all negative numbers together', 'Subtract the sum of negative terms from the sum of positive terms'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'mid_m_4', topicTitle: 'HCF: Prime Factorization Tree Method (Day 4)', subtopic: 'Breaking Numbers into Prime Factors and Taking Smallest Powers of Common Factors', dayNumber: 4, periodNumber: 1, keyFormulaOrLaw: 'HCF(a, b) = Product of smallest power of each common prime factor', keyPoints: ['For 24 (2Â³ Ã— 3) and 36 (2Â² Ã— 3Â²), HCF = 2Â² Ã— 3 = 12', 'HCF is always less than or equal to the smallest number'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'mid_m_5', topicTitle: 'HCF: Euclid Division / Long Division Method (Day 5)', subtopic: 'Successive Division Algorithm: Dividend = Divisor Ã— Quotient + Remainder', dayNumber: 5, periodNumber: 1, keyFormulaOrLaw: 'Euclid Algorithm: a = bq + r (0 â‰¤ r < b) | Last non-zero divisor is HCF', keyPoints: ['Efficient method for finding HCF of very large 3-digit and 4-digit numbers', 'When remainder becomes 0, the divisor at that stage is the exact HCF'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'mid_m_6', topicTitle: 'LCM: Common Division Method (Day 6)', subtopic: 'Simultaneous Division of Multiple Numbers by Common Prime Divisors', dayNumber: 6, periodNumber: 1, keyFormulaOrLaw: 'LCM(a, b) = Product of all prime divisors and undivided remainder quotients', keyPoints: ['LCM is the smallest positive number that is a multiple of all given numbers', 'LCM is always greater than or equal to the largest number'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'mid_m_7', topicTitle: 'HCF Ã— LCM = a Ã— b Core Identity (Day 7)', subtopic: 'Finding One Unknown Number or HCF/LCM Using the Product Relationship Formula', dayNumber: 7, periodNumber: 1, keyFormulaOrLaw: 'Numberâ‚ Ã— Numberâ‚‚ = HCF(a, b) Ã— LCM(a, b) | Numberâ‚‚ = (HCF Ã— LCM) / Numberâ‚', keyPoints: ['Applicable strictly to any two positive integers', 'Given HCF = 6, LCM = 36, Numberâ‚ = 12 -> Numberâ‚‚ = (6 Ã— 36)/12 = 18'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'mid_m_8', topicTitle: 'HCF & LCM Word Problems: Bells & Tiles (Day 8)', subtopic: 'Real-World Applications: Paving Floors with Minimum Square Tiles & Bell Intervals', dayNumber: 8, periodNumber: 1, keyFormulaOrLaw: 'Max Tile Side = HCF(Length, Breadth) | Next Toll Time = LCM(Intervalâ‚, Intervalâ‚‚)', keyPoints: ['Use HCF when dividing or partitioning into maximum equal sizes', 'Use LCM when synchronizing repeating cycles or periodic events'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: isTa ? 'à®ªà¯à®³à¯à®³à®¿à®¯à®¿à®¯à®²à¯ à®¨à®¾à®©à¯‹ à®¤à®²à¯ˆà®ªà¯à®ªà¯à®•à®³à¯: Mean, Median, Mode, Range & CI' : 'Statistics & Commercial Nano-Topics: Mean, Median, Mode & CI',
          description: isTa ? 'à®•à¯‚à®Ÿà¯à®Ÿà¯à®šà¯ à®šà®°à®¾à®šà®°à®¿ (Mean), à®’à®±à¯à®±à¯ˆà®ªà¯à®ªà®Ÿà¯ˆ/à®‡à®°à®Ÿà¯à®Ÿà¯ˆà®ªà¯à®ªà®Ÿà¯ˆ à®‡à®Ÿà¯ˆà®¨à®¿à®²à¯ˆ (Median), à®®à¯à®•à®Ÿà¯ (Mode), à®µà¯€à®šà¯à®šà¯ (Range), à®•à¯‚à®Ÿà¯à®Ÿà¯à®µà®Ÿà¯à®Ÿà®¿' : 'Arithmetic Mean calculation, ODD/EVEN Median rules, Mode peak detection, Range spread, and Compound Interest',
          subtopics: [
            {
              id: 'mid_m_sub2',
              title: 'à®ªà¯à®³à¯à®³à®¿à®¯à®¿à®¯à®²à¯ & à®µà®£à®¿à®•à®•à¯ à®•à®£à®¿à®¤à®®à¯',
              microTopics: [
                { id: 'mid_m_9', title: 'Arithmetic Mean: Ungrouped Raw Data Average (Day 9)', keyAxiom: 'Mean xÌ„ = (Î£x) / N' },
                { id: 'mid_m_10', title: 'Median: Finding Middle Term for ODD Dataset (Day 10)', keyAxiom: 'Median = [(n + 1)/2]áµ—Ê° term after sorting' },
                { id: 'mid_m_11', title: 'Median: Finding Middle Average for EVEN Dataset (Day 11)', keyAxiom: 'Median = Average of (n/2)áµ—Ê° and (n/2 + 1)áµ—Ê° terms' },
                { id: 'mid_m_12', title: 'Mode: Identifying Peak Frequency Values (Day 12)', keyAxiom: 'Mode = Most frequently occurring observation' },
                { id: 'mid_m_13', title: 'Range & Coefficient of Range (Day 13)', keyAxiom: 'Range = Largest - Smallest | Coefficient = (L-S)/(L+S)' },
                { id: 'mid_m_14', title: 'Empirical Formula: Mode â‰ˆ 3(Median) - 2(Mean) (Day 14)', keyAxiom: 'Mode = 3 Median - 2 Mean for moderately skewed distribution' }
              ]
            }
          ],
          microTopics: [
            { id: 'mid_m_9', topicTitle: 'Arithmetic Mean: Raw Data Average (Day 9)', subtopic: 'Calculation of Arithmetic Mean: Sum of Observations Divided by Total Count', dayNumber: 9, periodNumber: 1, keyFormulaOrLaw: 'Mean xÌ„ = (Î£ x) / N = (xâ‚ + xâ‚‚ + ... + xâ‚™) / n', keyPoints: ['Mean is the mathematical center balance of numerical data', 'If each observation is increased by k, the new mean increases by k'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'mid_m_10', topicTitle: 'Median: Middle Term for ODD Dataset (Day 10)', subtopic: 'Sorting in Ascending Order and Selecting Exact Center Position [(n+1)/2]áµ—Ê°', dayNumber: 10, periodNumber: 1, keyFormulaOrLaw: 'For Odd n: Median = Value of [(n + 1) / 2]áµ—Ê° term', keyPoints: ['Always arrange data in ascending or descending order first', 'For 7 items, Median is the 4th item; 50% values lie below and 50% above'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'mid_m_11', topicTitle: 'Median: Middle Average for EVEN Dataset (Day 11)', subtopic: 'Finding the Arithmetic Average of the Two Central Values for Even Count', dayNumber: 11, periodNumber: 1, keyFormulaOrLaw: 'For Even n: Median = Â½ [ (n/2)áµ—Ê° term + (n/2 + 1)áµ—Ê° term ]', keyPoints: ['For 8 items, Median is average of 4th and 5th items', 'Median is not affected by extreme outlier values unlike Mean'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'mid_m_12', topicTitle: 'Mode: Identifying Peak Frequency Values (Day 12)', subtopic: 'Finding the Most Frequently Occurring Observation; Unimodal and Bimodal Data', dayNumber: 12, periodNumber: 1, keyFormulaOrLaw: 'Mode = Observation with the highest frequency in the dataset', keyPoints: ['A dataset can have one mode (unimodal), two modes (bimodal), or no mode at all', 'Useful in manufacturing and business for identifying most popular shoe size or clothing item'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'mid_m_13', topicTitle: 'Range & Coefficient of Range (Day 13)', subtopic: 'Measuring Data Dispersion: Difference Between Maximum and Minimum Values', dayNumber: 13, periodNumber: 1, keyFormulaOrLaw: 'Range R = Largest (L) - Smallest (S) | Coefficient of Range = (L - S) / (L + S)', keyPoints: ['Simplest measure of data dispersion and variability', 'Range depends only on extreme values and ignores all intermediate numbers'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'mid_m_14', topicTitle: 'Empirical Relation: Mode, Median & Mean (Day 14)', subtopic: 'Karl Pearson Empirical Relationship Formula for Moderately Skewed Distributions', dayNumber: 14, periodNumber: 1, keyFormulaOrLaw: 'Mode â‰ˆ 3(Median) - 2(Mean) | Mean - Mode = 3(Mean - Median)', keyPoints: ['Allows calculating any one statistic if the other two are known', 'In a perfectly symmetrical normal distribution: Mean = Median = Mode'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 3,
          chapterTitle: isTa ? 'à®µà®Ÿà®¿à®µà®¿à®¯à®²à¯ & à®…à®³à®µà®¿à®¯à®²à¯ à®¨à®¾à®©à¯‹ à®¤à®²à¯ˆà®ªà¯à®ªà¯à®•à®³à¯: à®ªà®¿à®¤à®¾à®•à®°à®¸à¯ & à®µà®Ÿà¯à®Ÿà®®à¯' : 'Geometry & Mensuration Nano-Topics: Pythagoras & Circle',
          description: isTa ? 'à®ªà®¿à®¤à®¾à®•à®°à®¸à¯ à®¤à¯‡à®±à¯à®±à®®à¯, à®®à¯à®•à¯à®•à¯‹à®£ à®µà®¿à®•à®¿à®¤à®™à¯à®•à®³à¯, à®µà®Ÿà¯à®Ÿà®¤à¯à®¤à®¿à®©à¯ à®šà¯à®±à¯à®±à®³à®µà¯ 2Ï€r à®®à®±à¯à®±à¯à®®à¯ à®ªà®°à®ªà¯à®ªà®³à®µà¯ Ï€rÂ²' : 'Pythagorean theorem, Pythagorean triplets, Circle circumference (2Ï€r) and Circle area (Ï€rÂ²)',
          subtopics: [
            {
              id: 'mid_m_sub3',
              title: 'à®µà®Ÿà®¿à®µà®¿à®¯à®²à¯ & à®…à®³à®µà®¿à®¯à®²à¯',
              microTopics: [
                { id: 'mid_m_15', title: 'Pythagoras Theorem: Finding Hypotenuse (Day 15)', keyAxiom: 'cÂ² = aÂ² + bÂ² (Hypotenuse = âˆš(BaseÂ² + HeightÂ²))' },
                { id: 'mid_m_16', title: 'Pythagoras Triplets: 3-4-5, 5-12-13, 8-15-17 (Day 16)', keyAxiom: '(2m, mÂ² - 1, mÂ² + 1) generates right triangle integer sides' },
                { id: 'mid_m_17', title: 'Circle: Circumference Formula 2Ï€r (Day 17)', keyAxiom: 'Circumference = 2 Ã— (22/7) Ã— radius' },
                { id: 'mid_m_18', title: 'Circle: Area Formula Ï€rÂ² (Day 18)', keyAxiom: 'Area = (22/7) Ã— radiusÂ²' }
              ]
            }
          ],
          microTopics: [
            { id: 'mid_m_15', topicTitle: 'Pythagoras Theorem: Finding Hypotenuse (Day 15)', subtopic: 'Right-Angled Triangle Side Calculation: HypotenuseÂ² = BaseÂ² + AltitudeÂ²', dayNumber: 15, periodNumber: 1, keyFormulaOrLaw: 'Hypotenuse c = âˆš(aÂ² + bÂ²) | aÂ² + bÂ² = cÂ²', keyPoints: ['Strictly applies only to 90-degree right-angled triangles', 'The hypotenuse is always the longest side opposite the 90Â° right angle'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'mid_m_16', topicTitle: 'Pythagorean Triplets (3-4-5, 5-12-13, 8-15-17) (Day 16)', subtopic: 'Integer Side Combinations and Formula (2m, mÂ² - 1, mÂ² + 1)', dayNumber: 16, periodNumber: 1, keyFormulaOrLaw: 'Pythagorean Triplet: 2m, mÂ² - 1, mÂ² + 1 for any integer m > 1', keyPoints: ['Multiples of triplets also form right triangles (e.g. 6-8-10 is 2Ã— of 3-4-5)', 'Used in construction for verifying perfect 90-degree right-angle corners'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'mid_m_17', topicTitle: 'Circle: Circumference Formula 2Ï€r (Day 17)', subtopic: 'Boundary Distance of Circle, Diameter Relation (C = Ï€d) & Wheel Rotations', dayNumber: 17, periodNumber: 1, keyFormulaOrLaw: 'Circumference C = 2Ï€r = Ï€d (where Ï€ â‰ˆ 22/7 or 3.14159)', keyPoints: ['Circumference is the distance traveled by a wheel in one complete revolution', 'Ratio of Circumference to Diameter is constant Ï€ for all circles'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'mid_m_18', topicTitle: 'Circle: Area Formula Ï€rÂ² (Day 18)', subtopic: 'Calculating 2D Enclosed Surface Area of Circle and Semicircle (Â½Ï€rÂ²)', dayNumber: 18, periodNumber: 1, keyFormulaOrLaw: 'Circle Area A = Ï€rÂ² | Semicircle Area = Â½Ï€rÂ² | Quadrant Area = Â¼Ï€rÂ²', keyPoints: ['Area units are always square units (cmÂ², mÂ²)', 'Doubling the radius increases the circle area by 4 times (2Â² = 4)'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        }
      ]
    },
    {
      subjectId: 'mid_science',
      subjectName: isTa ? 'à®…à®±à®¿à®µà®¿à®¯à®²à¯ (Physics, Chemistry & Biology Core)' : 'Science (Physics, Chemistry & Biology Core)',
      icon: '⚡',
      color: '#10b981',
      totalChapters: 3,
      totalMicroTopics: 22,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: isTa ? 'à®‡à®¯à®±à¯à®ªà®¿à®¯à®²à¯ à®¨à®¾à®©à¯‹ à®…à®²à®•à¯à®•à®³à¯: à®‡à®¯à®•à¯à®•à®®à¯, à®µà®¿à®šà¯ˆ, à®…à®´à¯à®¤à¯à®¤à®®à¯ & à®’à®³à®¿' : 'Physics Nano-Units: Motion, Force, Pressure & Light',
          description: isTa ? 'à®µà¯‡à®•à®®à¯, à®®à¯à®Ÿà¯à®•à¯à®•à®®à¯, à®µà®¿à®šà¯ˆ F=ma, à®¨à®¿à®¯à¯‚à®Ÿà¯à®Ÿà®©à¯ à®µà®¿à®¤à®¿à®•à®³à¯ 1/2/3, à®“à®®à¯ à®µà®¿à®¤à®¿, à®®à®¿à®©à¯à®¤à®Ÿà¯ˆ à®¤à¯Šà®Ÿà®°à¯/à®ªà®•à¯à®• à®‡à®£à¯ˆà®ªà¯à®ªà¯, à®’à®³à®¿ à®Žà®¤à®¿à®°à¯Šà®²à®¿à®ªà¯à®ªà¯ à®®à®±à¯à®±à¯à®®à¯ à®µà®¿à®²à®•à®²à¯' : 'Speed, Acceleration, Force F=ma, Newton 1st/2nd/3rd Laws, Ohm\'s Law, Series/Parallel Resistors, Reflection and Refraction',
          subtopics: [
            {
              id: 'mid_s_sub1',
              title: 'à®‡à®¯à®±à¯à®ªà®¿à®¯à®²à¯ à®¨à®¾à®©à¯‹ à®…à®²à®•à¯à®•à®³à¯',
              microTopics: [
                { id: 'mid_p_19', title: 'Speed vs Velocity vs Acceleration (Day 19)', keyAxiom: 'Speed = Distance/Time | a = (v - u)/t (m/sÂ²)' },
                { id: 'mid_p_20', title: 'Fluid Pressure: P = F/A & Liquid Depth P = Ïgh (Day 20)', keyAxiom: 'Pressure in liquid increases linearly with depth' },
                { id: 'mid_p_21', title: 'Newton 1st Law: Inertia of Rest and Motion (Day 21)', keyAxiom: 'Objects resist change in velocity unless acted by net force' },
                { id: 'mid_p_22', title: 'Newton 2nd Law: F = ma & Momentum Impulse (Day 22)', keyAxiom: 'Force equals mass times acceleration (F = dp/dt)' },
                { id: 'mid_p_23', title: 'Newton 3rd Law: Action & Reaction Pairs (Day 23)', keyAxiom: 'For every action, equal and opposite reaction (Fâ‚â‚‚ = -Fâ‚‚â‚)' },
                { id: 'mid_p_24', title: 'Ohm\'s Law: Voltage, Current & Resistance V = IR (Day 24)', keyAxiom: 'Current is directly proportional to potential difference' },
                { id: 'mid_p_25', title: 'Resistors in Series: R_s = Râ‚ + Râ‚‚ + Râ‚ƒ (Day 25)', keyAxiom: 'Same current; Total resistance is sum of individual resistances' },
                { id: 'mid_p_26', title: 'Resistors in Parallel: 1/R_p = 1/Râ‚ + 1/Râ‚‚ (Day 26)', keyAxiom: 'Same voltage; Reciprocal sum gives inverse equivalent resistance' }
              ]
            }
          ],
          microTopics: [
            { id: 'mid_p_19', topicTitle: 'Speed, Velocity & Acceleration (Day 19)', subtopic: 'Scalar Speed, Vector Velocity and Rate of Change of Velocity Acceleration (a = Î”v/Î”t)', dayNumber: 19, periodNumber: 1, keyFormulaOrLaw: 'Speed = Distance / Time | Velocity = Displacement / Time | Acceleration a = (v - u) / t', keyPoints: ['Speed is scalar (no direction); Velocity is vector (magnitude and direction)', 'Deceleration / Retardation is negative acceleration when brakes are applied'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'mid_p_20', topicTitle: 'Fluid Pressure & Atmospheric Barometer (Day 20)', subtopic: 'Pressure P = F/A (1 Pa = 1 N/mÂ²), Hydrostatic Pressure (P = hÏg) & Mercury Column', dayNumber: 20, periodNumber: 1, keyFormulaOrLaw: 'Pressure P = Force / Area (Pa) | Liquid Hydrostatic Pressure P = h Ã— Ï Ã— g', keyPoints: ['Dams are built wider at the bottom because liquid pressure increases with depth', 'Standard atmospheric pressure at sea level is 760 mm Hg (1.013 Ã— 10âµ Pa)'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'mid_p_21', topicTitle: 'Newton\'s 1st Law: Inertia of Rest & Motion (Day 21)', subtopic: 'Galileo Concept of Inertia, Inertia of Rest, Motion, Direction and Mass as Measure of Inertia', dayNumber: 21, periodNumber: 1, keyFormulaOrLaw: 'Newton\'s First Law: Î£ F = 0 -> Velocity is Constant (Inertia)', keyPoints: ['Passengers lean backwards when bus starts suddenly due to inertia of rest', 'Heavier objects have greater inertia because inertia is directly proportional to mass'], type: 'concept', importance: 'High-Yield' },
            { id: 'mid_p_22', topicTitle: 'Newton\'s 2nd Law: Force Formula F = ma (Day 22)', subtopic: 'Momentum (p = mv), Rate of Change of Momentum and Impulse (J = F Ã— Î”t)', dayNumber: 22, periodNumber: 1, keyFormulaOrLaw: 'Force F = m Ã— a = (mv - mu) / t | Impulse J = Force Ã— Time = Î”p', keyPoints: ['Fielder pulls hands backward while catching ball to increase time, reducing impact force', '1 Newton is the force that produces an acceleration of 1 m/sÂ² on a 1 kg mass'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'mid_p_23', topicTitle: 'Newton\'s 3rd Law: Action & Reaction Pairs (Day 23)', subtopic: 'Simultaneous Force Pairs Acting on Different Bodies, Recoil of Gun and Rocket Propulsion', dayNumber: 23, periodNumber: 1, keyFormulaOrLaw: 'Force on A by B = - Force on B by A | Fâ‚â‚‚ = -Fâ‚‚â‚', keyPoints: ['Action and reaction never cancel each other because they act on two different bodies', 'Rocket moves upward as high-speed combustion exhaust gases push downward'], type: 'concept', importance: 'High-Yield' },
            { id: 'mid_p_24', topicTitle: 'Ohm\'s Law: Voltage, Current & Resistance V = IR (Day 24)', subtopic: 'Ohmic Conductors, V-I Linear Characteristic Graph and Resistance Concept', dayNumber: 24, periodNumber: 1, keyFormulaOrLaw: 'Potential Difference V = Current (I) Ã— Resistance (R) | R = V / I (Ohms Î©)', keyPoints: ['At constant temperature, current through metallic conductor is proportional to voltage', 'Slope of V-I graph represents electrical resistance of the conductor'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'mid_p_25', topicTitle: 'Resistors in Series: R_s = Râ‚ + Râ‚‚ + Râ‚ƒ (Day 25)', subtopic: 'Single Pathway Circuit, Same Current Through All Resistors & Voltage Division', dayNumber: 25, periodNumber: 1, keyFormulaOrLaw: 'Series Equivalent: R_s = Râ‚ + Râ‚‚ + Râ‚ƒ | Total Voltage V = Vâ‚ + Vâ‚‚ + Vâ‚ƒ', keyPoints: ['Equivalent series resistance is always greater than the largest individual resistor', 'If any one component in series breaks, the entire circuit stops working'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'mid_p_26', topicTitle: 'Resistors in Parallel: 1/R_p = 1/Râ‚ + 1/Râ‚‚ (Day 26)', subtopic: 'Multiple Current Branches, Same Voltage Across Resistors & Domestic Wiring', dayNumber: 26, periodNumber: 1, keyFormulaOrLaw: 'Parallel Equivalent: 1/R_p = 1/Râ‚ + 1/Râ‚‚ | Total Current I = Iâ‚ + Iâ‚‚', keyPoints: ['Equivalent parallel resistance is always smaller than the smallest individual resistor', 'Home appliances are connected in parallel so each operates independently at 220V'], type: 'solved_problem', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: isTa ? 'à®µà¯‡à®¤à®¿à®¯à®¿à®¯à®²à¯ à®¨à®¾à®©à¯‹ à®…à®²à®•à¯à®•à®³à¯: à®…à®®à®¿à®²à®™à¯à®•à®³à¯, à®•à®¾à®°à®™à¯à®•à®³à¯, pH & à®…à®£à¯ à®…à®®à¯ˆà®ªà¯à®ªà¯' : 'Chemistry Nano-Units: Acids, Bases, pH & Atomic Structure',
          description: isTa ? 'à®²à®¿à®Ÿà¯à®®à®¸à¯, à®¨à®Ÿà¯à®¨à®¿à®²à¯ˆà®¯à®¾à®•à¯à®•à®²à¯, pH à®…à®³à®µà¯€à®Ÿà¯ (0â€“14), à®ªà¯à®°à¯‹à®Ÿà¯à®Ÿà®¾à®©à¯, à®Žà®²à®•à¯à®Ÿà¯à®°à®¾à®©à¯, à®¨à®¿à®¯à¯‚à®Ÿà¯à®°à®¾à®©à¯, à®…à®£à¯ à®Žà®£à¯ Z à®®à®±à¯à®±à¯à®®à¯ à®¨à®¿à®±à¯ˆ à®Žà®£à¯ A' : 'Litmus indicators, Neutralization, pH scale (0 to 14), Subatomic particles, Atomic number Z and Mass number A',
          subtopics: [
            {
              id: 'mid_s_sub2',
              title: 'à®µà¯‡à®¤à®¿à®¯à®¿à®¯à®²à¯ à®¨à®¾à®©à¯‹ à®…à®²à®•à¯à®•à®³à¯',
              microTopics: [
                { id: 'mid_c_27', title: 'Acids & Bases: Litmus Indicators (Day 27)', keyAxiom: 'Acids turn blue litmus red; Bases turn red litmus blue' },
                { id: 'mid_c_28', title: 'Neutralization: Acid + Base -> Salt + Water (Day 28)', keyAxiom: 'HCl + NaOH -> NaCl + Hâ‚‚O + Heat energy' },
                { id: 'mid_c_29', title: 'pH Scale: 0 to 14 Acidity & Basicity Measure (Day 29)', keyAxiom: 'pH = -logâ‚â‚€[Hâº] | pH < 7 Acidic | pH = 7 Neutral | pH > 7 Basic' },
                { id: 'mid_c_30', title: 'Atomic Structure: Protons, Neutrons & Electrons (Day 30)', keyAxiom: 'Protons (+), Neutrons (0) in Nucleus; Electrons (-) in Shells' }
              ]
            }
          ],
          microTopics: [
            { id: 'mid_c_27', topicTitle: 'Acids & Bases: Litmus & Indicators (Day 27)', subtopic: 'Natural Indicators (Turmeric, China Rose, Red Cabbage) and Synthetic Indicators (Phenolphthalein)', dayNumber: 27, periodNumber: 1, keyFormulaOrLaw: 'Acids: Sour Taste, pH < 7, Blue Litmus -> Red | Bases: Bitter, Soapy, Red Litmus -> Blue', keyPoints: ['Phenolphthalein turns bright pink in basic solutions and remains colorless in acids', 'Methyl orange turns red in acidic solutions and yellow in basic solutions'], type: 'concept', importance: 'High-Yield' },
            { id: 'mid_c_28', topicTitle: 'Neutralization: Acid + Base -> Salt + Water (Day 28)', subtopic: 'Exothermic Neutralization Reaction, Salt Formation & Antacid Treatment', dayNumber: 28, periodNumber: 1, keyFormulaOrLaw: 'Neutralization: Acid + Base -> Salt + Water (e.g. HCl + NaOH -> NaCl + Hâ‚‚O)', keyPoints: ['Antacid tablets containing Magnesium Hydroxide Mg(OH)â‚‚ neutralize excess stomach acid', 'Bee sting is acidic (formic acid), treated by applying mild base like baking soda'], type: 'concept', importance: 'High-Yield' },
            { id: 'mid_c_29', topicTitle: 'pH Scale: 0 to 14 Acidity & Alkalinity (Day 29)', subtopic: 'Sorenson pH Scale, Hydrogen Ion Concentration & Universal Indicator Color Chart', dayNumber: 29, periodNumber: 1, keyFormulaOrLaw: 'pH = -logâ‚â‚€[Hâº] | Acidic: 0 to 6.9 | Neutral: 7.0 | Basic / Alkaline: 7.1 to 14', keyPoints: ['Human blood maintains strict homeostasis around pH 7.35 to 7.45', 'Acid rain occurs when atmospheric sulfur/nitrogen oxides drop rain pH below 5.6'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'mid_c_30', topicTitle: 'Atomic Structure: Protons, Neutrons & Electrons (Day 30)', subtopic: 'Bohr-Rutherford Planetary Model, Atomic Number Z, Mass Number A & Shell Filling', dayNumber: 30, periodNumber: 1, keyFormulaOrLaw: 'Atomic Number Z = Protons = Electrons | Mass Number A = Protons + Neutrons', keyPoints: ['Protons (+1 charge) and Neutrons (0 charge) form the heavy central Nucleus', 'Electrons (-1 charge) revolve in discrete energy shells following the 2nÂ² rule (K=2, L=8, M=18)'], type: 'concept', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 3,
          chapterTitle: isTa ? 'à®‰à®¯à®¿à®°à®¿à®¯à®²à¯ à®¨à®¾à®©à¯‹ à®…à®²à®•à¯à®•à®³à¯: à®’à®³à®¿à®šà¯à®šà¯‡à®°à¯à®•à¯à®•à¯ˆ, à®‡à®¤à®¯à®®à¯, à®¨à¯†à®ƒà®ªà¯à®°à®¾à®©à¯ & à®®à¯‚à®³à¯ˆ' : 'Biology Nano-Units: Photosynthesis, Heart, Nephron & Brain',
          description: isTa ? 'à®’à®³à®¿à®šà¯à®šà¯‡à®°à¯à®•à¯à®•à¯ˆ à®’à®³à®¿/à®‡à®°à¯à®³à¯ à®µà®¿à®©à¯ˆà®•à®³à¯, à®‡à®¤à®¯à®¤à¯à®¤à®¿à®©à¯ 4 à®…à®±à¯ˆà®•à®³à¯ & à®ªà¯‡à®¸à¯à®®à¯‡à®•à¯à®•à®°à¯, à®¨à¯†à®ƒà®ªà¯à®°à®¾à®©à¯ à®µà®Ÿà®¿à®•à®Ÿà¯à®Ÿà¯à®¤à®²à¯, à®®à¯‚à®³à¯ˆà®¯à®¿à®©à¯ à®ªà®•à¯à®¤à®¿à®•à®³à¯ à®®à®±à¯à®±à¯à®®à¯ à®¤à®¾à®µà®° à®¹à®¾à®°à¯à®®à¯‹à®©à¯à®•à®³à¯' : 'Light & Dark photosynthesis, Heart 4 chambers & SA node, Nephron ultrafiltration, Brain regions and Plant hormones',
          subtopics: [
            {
              id: 'mid_s_sub3',
              title: 'à®‰à®¯à®¿à®°à®¿à®¯à®²à¯ à®¨à®¾à®©à¯‹ à®…à®²à®•à¯à®•à®³à¯',
              microTopics: [
                { id: 'mid_b_31', title: 'Photosynthesis: Light Reaction in Thylakoids (Day 31)', keyAxiom: 'Photolysis: 2Hâ‚‚O + Light -> 4Hâº + 4eâ» + Oâ‚‚ + ATP + NADPH' },
                { id: 'mid_b_32', title: 'Photosynthesis: Dark Reaction Calvin Cycle (Day 32)', keyAxiom: 'RuBisCO fixes COâ‚‚ + ATP + NADPH into Glucose in Stroma' },
                { id: 'mid_b_33', title: 'Human Heart: SA Node Natural Pacemaker (Day 33)', keyAxiom: 'Sinoatrial node generates rhythmic 72 electrical impulses/min' },
                { id: 'mid_b_34', title: 'Human Heart: Double Circulation Flow (Day 34)', keyAxiom: 'Pulmonary circuit (Lungs) + Systemic circuit (Body organs)' },
                { id: 'mid_b_35', title: 'Nephron: Glomerular Ultrafiltration (Day 35)', keyAxiom: 'Bowman\'s capsule filters waste under high glomerular pressure' },
                { id: 'mid_b_36', title: 'Nephron: Selective Reabsorption in Henle Loop (Day 36)', keyAxiom: 'Reabsorbs 99% water, glucose and amino acids into capillaries' },
                { id: 'mid_b_37', title: 'Human Brain: Cerebrum & Cognitive Functions (Day 37)', keyAxiom: 'Cerebrum governs conscious thought, speech, sensory perception and memory' },
                { id: 'mid_b_38', title: 'Human Brain: Cerebellum & Body Equilibrium (Day 38)', keyAxiom: 'Cerebellum coordinates voluntary muscle movements and motor balance' },
                { id: 'mid_b_39', title: 'Plant Hormones: Auxin & Phototropism (Day 39)', keyAxiom: 'Auxin elongates cells on shaded side causing stem to bend towards sunlight' },
                { id: 'mid_b_40', title: 'Plant Hormones: Ethylene & Fruit Ripening (Day 40)', keyAxiom: 'Gaseous hormone converting complex fruit starches to simple sweet sugars' }
              ]
            }
          ],
          microTopics: [
            { id: 'mid_b_31', topicTitle: 'Photosynthesis: Light Reaction in Thylakoids (Day 31)', subtopic: 'Photolysis of Water, Chlorophyll Light Absorption, ATP and NADPH Energy Synthesis', dayNumber: 31, periodNumber: 1, keyFormulaOrLaw: 'Photolysis: 2Hâ‚‚O + Sunlight -> 4Hâº + 4eâ» + Oâ‚‚ (Oxygen Released) + ATP + NADPH', keyPoints: ['Occurs in the Thylakoid Grana membranes of Chloroplasts containing green chlorophyll', 'Solar energy is converted into chemical energy currencies ATP and NADPH'], type: 'concept', importance: 'High-Yield' },
            { id: 'mid_b_32', topicTitle: 'Photosynthesis: Dark Reaction Calvin Cycle (Day 32)', subtopic: 'Stroma Carbon Fixation, RuBisCO Enzyme and Glucose Câ‚†Hâ‚â‚‚Oâ‚† Synthesis', dayNumber: 32, periodNumber: 1, keyFormulaOrLaw: 'Calvin Cycle: 6COâ‚‚ + 18 ATP + 12 NADPH -> Câ‚†Hâ‚â‚‚Oâ‚† (Glucose) + 18 ADP + 12 NADPâº', keyPoints: ['Takes place in the fluid Stroma of Chloroplasts independent of direct light', 'RuBisCO is the most abundant enzyme on Earth responsible for fixing atmospheric COâ‚‚'], type: 'concept', importance: 'High-Yield' },
            { id: 'mid_b_33', topicTitle: 'Human Heart: SA Node Natural Pacemaker (Day 33)', subtopic: 'Sinoatrial Node Electrical Conduction, Atrial Depolarization & Cardiac Pulse', dayNumber: 33, periodNumber: 1, keyFormulaOrLaw: 'Cardiac Output = Stroke Volume (70 mL) Ã— Heart Rate (72 bpm) â‰ˆ 5.0 Litres/min', keyPoints: ['SA node located in the right atrium generates rhythmic electrical impulses spontaneously', 'Artificial electronic pacemakers are implanted when the natural SA node malfunctions'], type: 'concept', importance: 'High-Yield' },
            { id: 'mid_b_34', topicTitle: 'Human Heart: Double Circulation Flow (Day 34)', subtopic: 'Pulmonary Circulation (Deoxygenated to Lungs) vs Systemic Circulation (Oxygenated to Body)', dayNumber: 34, periodNumber: 1, keyFormulaOrLaw: 'Double Circuit: Heart -> Lungs -> Heart (Pulmonary) & Heart -> Body -> Heart (Systemic)', keyPoints: ['Prevents mixing of oxygen-rich and carbon dioxide-rich blood for maximum oxygen efficiency', 'Left ventricle has the thickest muscular myocardium wall to pump blood against systemic resistance'], type: 'concept', importance: 'High-Yield' },
            { id: 'mid_b_35', topicTitle: 'Nephron: Glomerular Ultrafiltration (Day 35)', subtopic: 'Afferent vs Efferent Arteriole Hydrostatic Pressure and Bowman\'s Capsule Filtration', dayNumber: 35, periodNumber: 1, keyFormulaOrLaw: 'Glomerular Filtration Rate (GFR) â‰ˆ 125 mL/min = 180 Litres/day of Primary Filtrate', keyPoints: ['High pressure in glomerulus capillaries forces water, urea, ions, and glucose into Bowman capsule', 'Blood cells and large plasma proteins (Albumin) are retained in bloodstream'], type: 'concept', importance: 'High-Yield' },
            { id: 'mid_b_36', topicTitle: 'Nephron: Selective Reabsorption in Henle Loop (Day 36)', subtopic: 'Proximal Convoluted Tubule (PCT), Loop of Henle Counter-Current and Urine Concentration', dayNumber: 36, periodNumber: 1, keyFormulaOrLaw: 'Urine Output = 180 L GFR - 178.5 L Reabsorbed = 1.5 Litres/day of Concentrated Urine', keyPoints: ['100% of vital glucose and amino acids are actively reabsorbed back into peritubular capillaries', 'Antidiuretic Hormone (ADH) controls water permeability in collecting ducts'], type: 'concept', importance: 'High-Yield' },
            { id: 'mid_b_37', topicTitle: 'Human Brain: Cerebrum & Cognitive Functions (Day 37)', subtopic: 'Cerebral Cortex, 4 Lobes (Frontal, Parietal, Occipital, Temporal) & Voluntary Control', dayNumber: 37, periodNumber: 1, keyFormulaOrLaw: 'Cerebrum = Largest Part (~80% of brain) | Seat of Logic, Memory, Emotion and Sensory Processing', keyPoints: ['Left hemisphere controls right side of body and governs logic/language skills', 'Right hemisphere controls left side of body and governs spatial awareness/creativity'], type: 'concept', importance: 'High-Yield' },
            { id: 'mid_b_38', topicTitle: 'Human Brain: Cerebellum & Body Equilibrium (Day 38)', subtopic: 'Hindbrain Motor Coordination, Muscular Posture, Precision Timing and Balance', dayNumber: 38, periodNumber: 1, keyFormulaOrLaw: 'Cerebellum = "Little Brain" | Coordinates Voluntary Muscular Precision & Posture Balance', keyPoints: ['Allows smooth coordinated movements like walking a tightrope, cycling, or playing piano', 'Alcohol consumption impairs cerebellum function causing loss of muscular coordination and slurred speech'], type: 'concept', importance: 'High-Yield' },
            { id: 'mid_b_39', topicTitle: 'Plant Hormones: Auxin & Phototropism (Day 39)', subtopic: 'Indole-3-Acetic Acid (IAA), Apical Dominance and Stem Bending Towards Light', dayNumber: 39, periodNumber: 1, keyFormulaOrLaw: 'Phototropism: Auxin migrates to shaded side -> Stimulates cell elongation -> Stem bends to light', keyPoints: ['Auxin is produced in the growing shoot tips (apical meristems)', 'Synthetic auxins (2,4-D) are used as selective weed killers in cereal farming'], type: 'concept', importance: 'High-Yield' },
            { id: 'mid_b_40', topicTitle: 'Plant Hormones: Ethylene & Fruit Ripening (Day 40)', subtopic: 'Gaseous Phytohormone (Câ‚‚Hâ‚„), Starch Breakdown, Aroma Development and Abscission', dayNumber: 40, periodNumber: 1, keyFormulaOrLaw: 'Ethylene: Converts starch to sugars | Breaks down chlorophyll | Softens fruit cell walls', keyPoints: ['Only known gaseous plant hormone in nature', 'Placing a ripe banana with raw fruits accelerates ripening of the other fruits'], type: 'concept', importance: 'High-Yield' }
          ]
        }
      ]
    },
    {
      subjectId: 'mid_social',
      subjectName: isTa ? 'à®šà®®à¯‚à®• à®…à®±à®¿à®µà®¿à®¯à®²à¯ (History, Geography, Civics & Economics)' : 'Social Science (History, Geography, Civics & Economics)',
      icon: 'ðŸ›ï¸',
      color: '#f59e0b',
      totalChapters: 3,
      totalMicroTopics: 14,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: isTa ? 'à®µà®°à®²à®¾à®±à¯ (à®šà®¿à®¨à¯à®¤à¯ à®šà®®à®µà¯†à®³à®¿, à®ªà®²à¯à®²à®µà®°à¯, à®šà¯‹à®´à®°à¯ & à®®à¯à®•à®²à®¾à®¯à®°à¯)' : 'History: Indus Valley, Pallavas, Cholas & Mughals',
          description: isTa ? 'à®¹à®°à®ªà¯à®ªà®¾ à®®à¯Šà®•à®žà¯à®šà®¤à®¾à®°à¯‹, à®®à®¾à®®à®²à¯à®²à®ªà¯à®°à®®à¯ à®ªà®²à¯à®²à®µà®°à¯, à®¤à®žà¯à®šà¯ˆ à®ªà¯†à®°à®¿à®¯ à®•à¯‹à®µà®¿à®²à¯ à®šà¯‹à®´à®°à¯, à®®à¯à®•à®²à®¾à®¯à®°à¯ à®†à®Ÿà¯à®šà®¿' : 'Harappa, Mohenjo-Daro, Pallava cave temples, Raja Raja Chola Brihadisvara, Mughals',
          subtopics: [
            {
              id: 'mid_soc_sub1',
              title: 'à®‡à®¨à¯à®¤à®¿à®¯ à®®à®±à¯à®±à¯à®®à¯ à®¤à®®à®¿à®´à¯à®¨à®¾à®Ÿà¯ à®µà®°à®²à®¾à®±à¯',
              microTopics: [
                { id: 'mid_soc_1', title: 'à®šà®¿à®¨à¯à®¤à¯ à®šà®®à®µà¯†à®³à®¿ à®¨à®¾à®•à®°à®¿à®•à®®à¯ & à®šà¯‹à®´à®°à¯ à®µà®°à®²à®¾à®±à¯à®±à¯à®ªà¯ à®ªà¯†à®°à¯à®®à¯ˆ', keyAxiom: 'Raja Raja Chola built Brihadisvara Temple Thanjavur (1010 AD)' }
              ]
            }
          ],
          microTopics: [
            { id: 'mid_soc_1', topicTitle: isTa ? 'à®šà®¿à®¨à¯à®¤à¯ à®šà®®à®µà¯†à®³à®¿, à®šà¯‹à®´à®°à¯ & à®®à¯à®•à®²à®¾à®¯à®ªà¯ à®ªà¯‡à®°à®°à®šà¯ à®µà®°à®²à®¾à®±à¯' : 'Indus Valley, Chola Empire & Mughal Administration', subtopic: isTa ? 'à®¹à®°à®ªà¯à®ªà®¾ à®¨à®•à®°à®®à¯ˆà®ªà¯à®ªà¯ & à®¤à®žà¯à®šà¯ˆ à®ªà¯†à®°à®¿à®¯ à®•à¯‹à®µà®¿à®²à¯' : 'Grid town planning, Great Bath, Raja Raja Chola naval expeditions, Akbar administration', dayNumber: 15, periodNumber: 4, keyFormulaOrLaw: 'Indus Valley: Discovered in 1921 | Brihadisvara Temple: 1010 AD by Raja Raja I', keyPoints: ['Bronze dancing girl and priest king found in Mohenjo-Daro', 'Uttaramerur inscription describes Chola Kudavolai election system'], type: 'concept', importance: 'High-Yield' }
          ]
        }
      ]
    }
  ];

  return {
    courseId,
    courseTitle,
    category: 'school_middle',
    board: 'TNSB Samacheer Kalvi / CBSE',
    medium: isTa ? 'Tamil' : 'English',
    totalDays: 200,
    totalSubjects: subjects.length,
    totalChapters: subjects.reduce((a, s) => a + s.chapters.length, 0),
    totalMicroTopics: subjects.reduce((a, s) => a + (s.totalMicroTopics || s.chapters.reduce((acc, c) => acc + (c.microTopics?.length || 0), 0)), 0),
    subjects
  };
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 4. SECONDARY STAGE: CLASS 9 & CLASS 10 (SSLC â€” 9 IYAL TAMIL & 7 UNITS ENGLISH)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function getSecondaryClass9to10Syllabus(courseId: string, courseTitle: string): any {
  const isTa = courseTitle.includes('தமிழ்') || courseId.includes('-ta-');

  const subjects = [
    {
      subjectId: 'sec_math',
      subjectName: 'Mathematics',
      icon: 'ðŸ“',
      color: '#06b6d4',
      totalChapters: 8,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: 'Relations and Functions',
          microTopics: [
            { id: 'm1_1', topicTitle: 'Ordered Pair Definition', subtopic: 'Relations', dayNumber: 1, periodNumber: 1, keyFormulaOrLaw: '(a,b) = (c,d) iff a=c, b=d', keyPoints: ['An ordered pair consists of two elements in a fixed order'], type: 'concept', importance: 'Foundational' },
            { id: 'm1_2', topicTitle: 'Cartesian Product AxB', subtopic: 'Relations', dayNumber: 1, periodNumber: 2, keyFormulaOrLaw: 'AxB = {(a,b) | a in A, b in B}', keyPoints: ['Set of all ordered pairs'], type: 'formula', importance: 'Core Standard' },
            { id: 'm1_3', topicTitle: 'Relation Definition', subtopic: 'Relations', dayNumber: 1, periodNumber: 3, keyFormulaOrLaw: 'R is subset of AxB', keyPoints: ['A relation links elements of A to B'], type: 'concept', importance: 'Foundational' },
            { id: 'm1_4', topicTitle: 'Arrow Diagram Representation', subtopic: 'Relations', dayNumber: 1, periodNumber: 4, keyFormulaOrLaw: 'Visual mapping', keyPoints: ['Visualizing relations using arrows'], type: 'concept', importance: 'Foundational' },
            { id: 'm1_5', topicTitle: 'Domain of a Relation', subtopic: 'Relations', dayNumber: 2, periodNumber: 1, keyFormulaOrLaw: 'Domain = {a | (a,b) in R}', keyPoints: ['Set of all first elements'], type: 'concept', importance: 'Core Standard' },
            { id: 'm1_6', topicTitle: 'Range of a Relation', subtopic: 'Relations', dayNumber: 2, periodNumber: 2, keyFormulaOrLaw: 'Range = {b | (a,b) in R}', keyPoints: ['Set of all second elements'], type: 'concept', importance: 'Core Standard' },
            { id: 'm1_7', topicTitle: 'Function Definition', subtopic: 'Functions', dayNumber: 2, periodNumber: 3, keyFormulaOrLaw: 'Each input has exactly one output', keyPoints: ['Special type of relation'], type: 'concept', importance: 'High-Yield' },
            { id: 'm1_8', topicTitle: 'Vertical Line Test', subtopic: 'Functions', dayNumber: 2, periodNumber: 4, keyFormulaOrLaw: 'Intersects at most once', keyPoints: ['Test to determine if graph is a function'], type: 'solved_problem', importance: 'Core Standard' },
            { id: 'm1_9', topicTitle: 'One-to-One Function', subtopic: 'Types of Functions', dayNumber: 3, periodNumber: 1, keyFormulaOrLaw: 'f(a)=f(b) implies a=b', keyPoints: ['Distinct inputs have distinct outputs'], type: 'concept', importance: 'High-Yield' },
            { id: 'm1_10', topicTitle: 'Onto Function', subtopic: 'Types of Functions', dayNumber: 3, periodNumber: 2, keyFormulaOrLaw: 'Range = Codomain', keyPoints: ['Every element in codomain is mapped'], type: 'concept', importance: 'High-Yield' },
            { id: 'm1_11', topicTitle: 'Composition of Functions', subtopic: 'Composition', dayNumber: 3, periodNumber: 3, keyFormulaOrLaw: '(fog)(x) = f(g(x))', keyPoints: ['Applying one function to the result of another'], type: 'formula', importance: 'High-Yield' },
            { id: 'm1_12', topicTitle: 'Inverse of a Function', subtopic: 'Inverse', dayNumber: 3, periodNumber: 4, keyFormulaOrLaw: 'f(f^-1(x)) = x', keyPoints: ['Reversing the mapping'], type: 'formula', importance: 'Core Standard' }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: 'Numbers and Sequences',
          microTopics: [
            { id: 'm2_1', topicTitle: 'Euclids Division Lemma', subtopic: 'Numbers', dayNumber: 4, periodNumber: 1, keyFormulaOrLaw: 'a = bq + r', keyPoints: ['Fundamental division rule'], type: 'formula', importance: 'High-Yield' },
            { id: 'm2_2', topicTitle: 'Fundamental Theorem of Arithmetic', subtopic: 'Numbers', dayNumber: 4, periodNumber: 2, keyFormulaOrLaw: 'Unique prime factorization', keyPoints: ['Every integer greater than 1 is prime or product of primes'], type: 'concept', importance: 'High-Yield' },
            { id: 'm2_3', topicTitle: 'Arithmetic Progression Definition', subtopic: 'Sequences', dayNumber: 4, periodNumber: 3, keyFormulaOrLaw: 'Common difference d', keyPoints: ['Sequence with constant difference'], type: 'concept', importance: 'Foundational' },
            { id: 'm2_4', topicTitle: 'Nth Term of AP', subtopic: 'Sequences', dayNumber: 4, periodNumber: 4, keyFormulaOrLaw: 'tn = a + (n-1)d', keyPoints: ['Finding specific term in AP'], type: 'formula', importance: 'High-Yield' },
            { id: 'm2_5', topicTitle: 'Sum of AP', subtopic: 'Sequences', dayNumber: 5, periodNumber: 1, keyFormulaOrLaw: 'Sn = n/2(2a + (n-1)d)', keyPoints: ['Summing terms in AP'], type: 'formula', importance: 'High-Yield' },
            { id: 'm2_6', topicTitle: 'Geometric Progression Definition', subtopic: 'Sequences', dayNumber: 5, periodNumber: 2, keyFormulaOrLaw: 'Common ratio r', keyPoints: ['Sequence with constant ratio'], type: 'concept', importance: 'Foundational' },
            { id: 'm2_7', topicTitle: 'Nth Term of GP', subtopic: 'Sequences', dayNumber: 5, periodNumber: 3, keyFormulaOrLaw: 'tn = a*r^(n-1)', keyPoints: ['Finding specific term in GP'], type: 'formula', importance: 'High-Yield' },
            { id: 'm2_8', topicTitle: 'Sum of GP', subtopic: 'Sequences', dayNumber: 5, periodNumber: 4, keyFormulaOrLaw: 'Sn = a(r^n - 1)/(r - 1)', keyPoints: ['Summing terms in GP'], type: 'formula', importance: 'High-Yield' },
            { id: 'm2_9', topicTitle: 'Sum of First N Natural Numbers', subtopic: 'Special Series', dayNumber: 6, periodNumber: 1, keyFormulaOrLaw: 'n(n+1)/2', keyPoints: ['Special series summation'], type: 'formula', importance: 'Core Standard' },
            { id: 'm2_10', topicTitle: 'Sum of Squares of First N Natural Numbers', subtopic: 'Special Series', dayNumber: 6, periodNumber: 2, keyFormulaOrLaw: 'n(n+1)(2n+1)/6', keyPoints: ['Special series summation'], type: 'formula', importance: 'Core Standard' },
            { id: 'm2_11', topicTitle: 'Sum of Cubes of First N Natural Numbers', subtopic: 'Special Series', dayNumber: 6, periodNumber: 3, keyFormulaOrLaw: '(n(n+1)/2)^2', keyPoints: ['Special series summation'], type: 'formula', importance: 'Core Standard' }
          ]
        },
        {
          chapterNumber: 3,
          chapterTitle: 'Algebra',
          microTopics: [
            { id: 'm3_1', topicTitle: 'Simultaneous Linear Equations', subtopic: 'Equations', dayNumber: 7, periodNumber: 1, keyFormulaOrLaw: 'ax+by=c', keyPoints: ['Solving two equations'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'm3_2', topicTitle: 'GCD of Polynomials', subtopic: 'Polynomials', dayNumber: 7, periodNumber: 2, keyFormulaOrLaw: 'Greatest Common Divisor', keyPoints: ['Finding GCD using division'], type: 'solved_problem', importance: 'Core Standard' },
            { id: 'm3_3', topicTitle: 'Rational Expressions', subtopic: 'Expressions', dayNumber: 7, periodNumber: 3, keyFormulaOrLaw: 'P(x)/Q(x)', keyPoints: ['Simplifying rational expressions'], type: 'concept', importance: 'Foundational' },
            { id: 'm3_4', topicTitle: 'Quadratic Equation Standard Form', subtopic: 'Quadratic', dayNumber: 7, periodNumber: 4, keyFormulaOrLaw: 'ax^2+bx+c=0', keyPoints: ['Standard representation'], type: 'formula', importance: 'Foundational' },
            { id: 'm3_5', topicTitle: 'Solving Quadratics by Factorization', subtopic: 'Quadratic', dayNumber: 8, periodNumber: 1, keyFormulaOrLaw: '(x-p)(x-q)=0', keyPoints: ['Factoring to find roots'], type: 'solved_problem', importance: 'Core Standard' },
            { id: 'm3_6', topicTitle: 'Quadratic Formula', subtopic: 'Quadratic', dayNumber: 8, periodNumber: 2, keyFormulaOrLaw: 'x = (-b Â± âˆš(b^2-4ac))/2a', keyPoints: ['Formula for roots'], type: 'formula', importance: 'High-Yield' },
            { id: 'm3_7', topicTitle: 'Nature of Roots Discriminant', subtopic: 'Quadratic', dayNumber: 8, periodNumber: 3, keyFormulaOrLaw: 'Î” = b^2-4ac', keyPoints: ['Determining root types'], type: 'concept', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 4,
          chapterTitle: 'Geometry',
          microTopics: [
            { id: 'm4_1', topicTitle: 'Similarity of Triangles', subtopic: 'Triangles', dayNumber: 9, periodNumber: 1, keyFormulaOrLaw: 'AAA Similarity', keyPoints: ['Corresponding angles equal'], type: 'concept', importance: 'Foundational' },
            { id: 'm4_2', topicTitle: 'Thales Theorem Definition', subtopic: 'Theorems', dayNumber: 9, periodNumber: 2, keyFormulaOrLaw: 'Basic Proportionality', keyPoints: ['Parallel line divides sides proportionally'], type: 'memorization', importance: 'High-Yield' },
            { id: 'm4_3', topicTitle: 'Angle Bisector Theorem', subtopic: 'Theorems', dayNumber: 9, periodNumber: 3, keyFormulaOrLaw: 'AB/AC = BD/DC', keyPoints: ['Bisector divides opposite side'], type: 'formula', importance: 'High-Yield' },
            { id: 'm4_4', topicTitle: 'Pythagoras Theorem', subtopic: 'Theorems', dayNumber: 9, periodNumber: 4, keyFormulaOrLaw: 'a^2 + b^2 = c^2', keyPoints: ['Right triangle side relationship'], type: 'formula', importance: 'High-Yield' },
            { id: 'm4_5', topicTitle: 'Circles Definition', subtopic: 'Circles', dayNumber: 10, periodNumber: 1, keyFormulaOrLaw: 'Radius and diameter', keyPoints: ['Basic circle components'], type: 'concept', importance: 'Foundational' },
            { id: 'm4_6', topicTitle: 'Tangents to a Circle', subtopic: 'Circles', dayNumber: 10, periodNumber: 2, keyFormulaOrLaw: 'Perpendicular to radius', keyPoints: ['Tangent properties'], type: 'concept', importance: 'Core Standard' }
          ]
        },
        {
          chapterNumber: 5,
          chapterTitle: 'Coordinate Geometry',
          microTopics: [
            { id: 'm5_1', topicTitle: 'Area of Triangle Formula', subtopic: 'Area', dayNumber: 11, periodNumber: 1, keyFormulaOrLaw: '0.5|x1(y2-y3)+x2(y3-y1)+x3(y1-y2)|', keyPoints: ['Calculating area using coordinates'], type: 'formula', importance: 'High-Yield' },
            { id: 'm5_2', topicTitle: 'Collinearity Condition', subtopic: 'Collinearity', dayNumber: 11, periodNumber: 2, keyFormulaOrLaw: 'Area = 0', keyPoints: ['Points on the same line'], type: 'concept', importance: 'Core Standard' },
            { id: 'm5_3', topicTitle: 'Slope of a Line', subtopic: 'Lines', dayNumber: 11, periodNumber: 3, keyFormulaOrLaw: 'm = (y2-y1)/(x2-x1)', keyPoints: ['Steepness of a line'], type: 'formula', importance: 'High-Yield' },
            { id: 'm5_4', topicTitle: 'Straight Line Equation', subtopic: 'Lines', dayNumber: 11, periodNumber: 4, keyFormulaOrLaw: 'y = mx + c', keyPoints: ['Slope-intercept form'], type: 'formula', importance: 'High-Yield' },
            { id: 'm5_5', topicTitle: 'Section Formula', subtopic: 'Coordinates', dayNumber: 12, periodNumber: 1, keyFormulaOrLaw: '[(mx2+nx1)/(m+n), (my2+ny1)/(m+n)]', keyPoints: ['Dividing a segment'], type: 'formula', importance: 'Core Standard' }
          ]
        },
        {
          chapterNumber: 6,
          chapterTitle: 'Trigonometry',
          microTopics: [
            { id: 'm6_1', topicTitle: 'Trigonometric Identities Definition', subtopic: 'Identities', dayNumber: 13, periodNumber: 1, keyFormulaOrLaw: 'sin^2(Î¸) + cos^2(Î¸) = 1', keyPoints: ['Basic identities'], type: 'formula', importance: 'High-Yield' },
            { id: 'm6_2', topicTitle: 'Heights and Distances', subtopic: 'Applications', dayNumber: 13, periodNumber: 2, keyFormulaOrLaw: 'tan(Î¸) = opposite/adjacent', keyPoints: ['Angle of elevation'], type: 'solved_problem', importance: 'High-Yield' },
            { id: 'm6_3', topicTitle: 'Trigonometric Ratios of Allied Angles', subtopic: 'Ratios', dayNumber: 13, periodNumber: 3, keyFormulaOrLaw: 'sin(90-Î¸) = cos(Î¸)', keyPoints: ['Complementary angles'], type: 'formula', importance: 'Core Standard' }
          ]
        },
        {
          chapterNumber: 7,
          chapterTitle: 'Mensuration',
          microTopics: [
            { id: 'm7_1', topicTitle: 'Surface Area of Cone', subtopic: 'Areas', dayNumber: 14, periodNumber: 1, keyFormulaOrLaw: 'Ï€rl', keyPoints: ['Curved surface area'], type: 'formula', importance: 'Core Standard' },
            { id: 'm7_2', topicTitle: 'Volume of Cone', subtopic: 'Volumes', dayNumber: 14, periodNumber: 2, keyFormulaOrLaw: '(1/3)Ï€r^2h', keyPoints: ['Cone capacity'], type: 'formula', importance: 'Core Standard' },
            { id: 'm7_3', topicTitle: 'Surface Area of Sphere', subtopic: 'Areas', dayNumber: 14, periodNumber: 3, keyFormulaOrLaw: '4Ï€r^2', keyPoints: ['Sphere surface'], type: 'formula', importance: 'High-Yield' },
            { id: 'm7_4', topicTitle: 'Volume of Sphere', subtopic: 'Volumes', dayNumber: 14, periodNumber: 4, keyFormulaOrLaw: '(4/3)Ï€r^3', keyPoints: ['Sphere capacity'], type: 'formula', importance: 'High-Yield' },
            { id: 'm7_5', topicTitle: 'Hemisphere Properties', subtopic: 'Solids', dayNumber: 15, periodNumber: 1, keyFormulaOrLaw: '2Ï€r^2', keyPoints: ['Half sphere properties'], type: 'formula', importance: 'Core Standard' },
            { id: 'm7_6', topicTitle: 'Volume of Frustum', subtopic: 'Volumes', dayNumber: 15, periodNumber: 2, keyFormulaOrLaw: '(1/3)Ï€h(r1^2 + r2^2 + r1r2)', keyPoints: ['Frustum capacity'], type: 'formula', importance: 'High-Yield' },
            { id: 'm7_7', topicTitle: 'Combined Solids Properties', subtopic: 'Solids', dayNumber: 15, periodNumber: 3, keyFormulaOrLaw: 'Additive volumes', keyPoints: ['Adding volumes of basic solids'], type: 'solved_problem', importance: 'Core Standard' }
          ]
        },
        {
          chapterNumber: 8,
          chapterTitle: 'Statistics and Probability',
          microTopics: [
            { id: 'm8_1', topicTitle: 'Mean for Grouped Data', subtopic: 'Statistics', dayNumber: 16, periodNumber: 1, keyFormulaOrLaw: 'Î£fx/Î£f', keyPoints: ['Average calculation'], type: 'formula', importance: 'Core Standard' },
            { id: 'm8_2', topicTitle: 'Median for Grouped Data', subtopic: 'Statistics', dayNumber: 16, periodNumber: 2, keyFormulaOrLaw: 'l + [(n/2 - cf)/f]*h', keyPoints: ['Middle value'], type: 'formula', importance: 'High-Yield' },
            { id: 'm8_3', topicTitle: 'Mode for Grouped Data', subtopic: 'Statistics', dayNumber: 16, periodNumber: 3, keyFormulaOrLaw: 'l + [(f1-f0)/(2f1-f0-f2)]*h', keyPoints: ['Most frequent value'], type: 'formula', importance: 'Core Standard' },
            { id: 'm8_4', topicTitle: 'Standard Deviation Definition', subtopic: 'Statistics', dayNumber: 16, periodNumber: 4, keyFormulaOrLaw: 'âˆš(Variance)', keyPoints: ['Measure of spread'], type: 'formula', importance: 'High-Yield' },
            { id: 'm8_5', topicTitle: 'Coefficient of Variation', subtopic: 'Statistics', dayNumber: 17, periodNumber: 1, keyFormulaOrLaw: '(SD/Mean)*100', keyPoints: ['Relative variability'], type: 'formula', importance: 'Core Standard' },
            { id: 'm8_6', topicTitle: 'Probability Definition', subtopic: 'Probability', dayNumber: 17, periodNumber: 2, keyFormulaOrLaw: 'Favorable/Total', keyPoints: ['Basic chance calculation'], type: 'concept', importance: 'Foundational' }
          ]
        }
      ]
    },
    {
      subjectId: 'sec_science',
      subjectName: 'Science',
      icon: 'ðŸ”¬',
      color: '#10b981',
      totalChapters: 23,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: 'Laws of Motion',
          microTopics: [
            { id: 's1_1', topicTitle: 'Newtons First Law', subtopic: 'Physics', dayNumber: 1, periodNumber: 1, keyFormulaOrLaw: 'Inertia', keyPoints: ['Object remains at rest'], type: 'memorization', importance: 'Foundational' }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: 'Optics',
          microTopics: [
            { id: 's2_1', topicTitle: 'Reflection of Light', subtopic: 'Physics', dayNumber: 2, periodNumber: 1, keyFormulaOrLaw: 'Angle of incidence equals reflection', keyPoints: ['Light bouncing back'], type: 'concept', importance: 'Foundational' }
          ]
        },
        {
          chapterNumber: 3,
          chapterTitle: 'Thermal Physics',
          microTopics: [
            { id: 's3_1', topicTitle: 'Heat Transfer Mechanisms', subtopic: 'Physics', dayNumber: 3, periodNumber: 1, keyFormulaOrLaw: 'Q = mcÎ”T', keyPoints: ['Conduction, Convection, Radiation'], type: 'concept', importance: 'Core Standard' }
          ]
        },
        {
          chapterNumber: 4,
          chapterTitle: 'Electricity',
          microTopics: [
            { id: 's4_1', topicTitle: 'Ohms Law', subtopic: 'Physics', dayNumber: 4, periodNumber: 1, keyFormulaOrLaw: 'V = IR', keyPoints: ['Voltage proportional to current'], type: 'formula', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 5,
          chapterTitle: 'Acoustics',
          microTopics: [
            { id: 's5_1', topicTitle: 'Sound Wave Properties', subtopic: 'Physics', dayNumber: 5, periodNumber: 1, keyFormulaOrLaw: 'v = fÎ»', keyPoints: ['Frequency and wavelength'], type: 'concept', importance: 'Core Standard' }
          ]
        },
        {
          chapterNumber: 6,
          chapterTitle: 'Nuclear Physics',
          microTopics: [
            { id: 's6_1', topicTitle: 'Radioactivity Definition', subtopic: 'Physics', dayNumber: 6, periodNumber: 1, keyFormulaOrLaw: 'E=mc^2', keyPoints: ['Decay of atomic nucleus'], type: 'concept', importance: 'Foundational' }
          ]
        },
        {
          chapterNumber: 7,
          chapterTitle: 'Atoms and Molecules',
          microTopics: [
            { id: 's7_1', topicTitle: 'Atomic Structure Basics', subtopic: 'Chemistry', dayNumber: 7, periodNumber: 1, keyFormulaOrLaw: 'Protons, Neutrons, Electrons', keyPoints: ['Components of an atom'], type: 'concept', importance: 'Foundational' }
          ]
        },
        {
          chapterNumber: 8,
          chapterTitle: 'Periodic Classification',
          microTopics: [
            { id: 's8_1', topicTitle: 'Modern Periodic Law', subtopic: 'Chemistry', dayNumber: 8, periodNumber: 1, keyFormulaOrLaw: 'Properties depend on atomic number', keyPoints: ['Arrangement of elements'], type: 'memorization', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 9,
          chapterTitle: 'Solutions',
          microTopics: [
            { id: 's9_1', topicTitle: 'Solute and Solvent', subtopic: 'Chemistry', dayNumber: 9, periodNumber: 1, keyFormulaOrLaw: 'Solution = Solute + Solvent', keyPoints: ['Components of a solution'], type: 'concept', importance: 'Foundational' }
          ]
        },
        {
          chapterNumber: 10,
          chapterTitle: 'Types of Chemical Reactions',
          microTopics: [
            { id: 's10_1', topicTitle: 'Combination Reaction', subtopic: 'Chemistry', dayNumber: 10, periodNumber: 1, keyFormulaOrLaw: 'A + B -> AB', keyPoints: ['Two substances combine'], type: 'concept', importance: 'Core Standard' }
          ]
        },
        {
          chapterNumber: 11,
          chapterTitle: 'Carbon Compounds',
          microTopics: [
            { id: 's11_1', topicTitle: 'Covalent Bonding in Carbon', subtopic: 'Chemistry', dayNumber: 11, periodNumber: 1, keyFormulaOrLaw: 'Sharing of electrons', keyPoints: ['Tetravalency of carbon'], type: 'concept', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 12,
          chapterTitle: 'Plant Anatomy & Physiology',
          microTopics: [
            { id: 's12_1', topicTitle: 'Tissue Systems in Plants', subtopic: 'Biology', dayNumber: 12, periodNumber: 1, keyFormulaOrLaw: 'Xylem and Phloem', keyPoints: ['Transport systems in plants'], type: 'concept', importance: 'Core Standard' }
          ]
        },
        {
          chapterNumber: 13,
          chapterTitle: 'Structural Organisation of Animals',
          microTopics: [
            { id: 's13_1', topicTitle: 'Animal Tissues Overview', subtopic: 'Biology', dayNumber: 13, periodNumber: 1, keyFormulaOrLaw: 'Epithelial, Connective', keyPoints: ['Types of animal tissues'], type: 'concept', importance: 'Foundational' }
          ]
        },
        {
          chapterNumber: 14,
          chapterTitle: 'Transportation & Circulation',
          microTopics: [
            { id: 's14_1', topicTitle: 'Human Heart Structure', subtopic: 'Biology', dayNumber: 14, periodNumber: 1, keyFormulaOrLaw: 'Four chambers', keyPoints: ['Pumping organ'], type: 'memorization', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 15,
          chapterTitle: 'Nervous System',
          microTopics: [
            { id: 's15_1', topicTitle: 'Neuron Structure', subtopic: 'Biology', dayNumber: 15, periodNumber: 1, keyFormulaOrLaw: 'Axon, Dendrite', keyPoints: ['Nerve cell components'], type: 'concept', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 16,
          chapterTitle: 'Plant & Animal Hormones',
          microTopics: [
            { id: 's16_1', topicTitle: 'Role of Auxin', subtopic: 'Biology', dayNumber: 16, periodNumber: 1, keyFormulaOrLaw: 'Growth promotion', keyPoints: ['Plant hormone'], type: 'concept', importance: 'Core Standard' }
          ]
        },
        {
          chapterNumber: 17,
          chapterTitle: 'Reproduction',
          microTopics: [
            { id: 's17_1', topicTitle: 'Asexual Reproduction Types', subtopic: 'Biology', dayNumber: 17, periodNumber: 1, keyFormulaOrLaw: 'Fission, Budding', keyPoints: ['Without gametes'], type: 'concept', importance: 'Foundational' }
          ]
        },
        {
          chapterNumber: 18,
          chapterTitle: 'Heredity',
          microTopics: [
            { id: 's18_1', topicTitle: 'Mendels Laws', subtopic: 'Biology', dayNumber: 18, periodNumber: 1, keyFormulaOrLaw: 'Segregation, Independent Assortment', keyPoints: ['Basic genetics laws'], type: 'memorization', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 19,
          chapterTitle: 'Origin & Evolution',
          microTopics: [
            { id: 's19_1', topicTitle: 'Theory of Natural Selection', subtopic: 'Biology', dayNumber: 19, periodNumber: 1, keyFormulaOrLaw: 'Survival of fittest', keyPoints: ['Darwins theory'], type: 'concept', importance: 'Core Standard' }
          ]
        },
        {
          chapterNumber: 20,
          chapterTitle: 'Breeding & Biotechnology',
          microTopics: [
            { id: 's20_1', topicTitle: 'Genetic Engineering Basics', subtopic: 'Biology', dayNumber: 20, periodNumber: 1, keyFormulaOrLaw: 'DNA manipulation', keyPoints: ['Altering genetic material'], type: 'concept', importance: 'Foundational' }
          ]
        },
        {
          chapterNumber: 21,
          chapterTitle: 'Health & Diseases',
          microTopics: [
            { id: 's21_1', topicTitle: 'Communicable Diseases Types', subtopic: 'Biology', dayNumber: 21, periodNumber: 1, keyFormulaOrLaw: 'Pathogens', keyPoints: ['Spread via agents'], type: 'concept', importance: 'Core Standard' }
          ]
        },
        {
          chapterNumber: 22,
          chapterTitle: 'Environmental Management',
          microTopics: [
            { id: 's22_1', topicTitle: 'Conservation of Resources', subtopic: 'Biology', dayNumber: 22, periodNumber: 1, keyFormulaOrLaw: 'Sustainable use', keyPoints: ['Protecting environment'], type: 'concept', importance: 'Foundational' }
          ]
        },
        {
          chapterNumber: 23,
          chapterTitle: 'Visual Communication',
          microTopics: [
            { id: 's23_1', topicTitle: 'Basics of Scratch', subtopic: 'Computer Science', dayNumber: 23, periodNumber: 1, keyFormulaOrLaw: 'Block coding', keyPoints: ['Introduction to programming'], type: 'concept', importance: 'Foundational' }
          ]
        }
      ]
    },
    {
      subjectId: 'sec_social',
      subjectName: 'Social Science',
      icon: 'ðŸŒ',
      color: '#f59e0b',
      totalChapters: 12,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: 'Outbreak of WWI',
          microTopics: [
            { id: 'so1_1', topicTitle: 'Causes of WWI', subtopic: 'History', dayNumber: 1, periodNumber: 1, keyFormulaOrLaw: 'Alliances and Militarism', keyPoints: ['Assassination of Archduke'], type: 'memorization', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: 'League of Nations',
          microTopics: [
            { id: 'so2_1', topicTitle: 'Formation of League', subtopic: 'History', dayNumber: 2, periodNumber: 1, keyFormulaOrLaw: 'Treaty of Versailles', keyPoints: ['Aim to prevent war'], type: 'concept', importance: 'Core Standard' }
          ]
        },
        {
          chapterNumber: 3,
          chapterTitle: 'WWII',
          microTopics: [
            { id: 'so3_1', topicTitle: 'Causes of WWII', subtopic: 'History', dayNumber: 3, periodNumber: 1, keyFormulaOrLaw: 'Failure of League', keyPoints: ['Rise of Fascism'], type: 'memorization', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 4,
          chapterTitle: 'UN',
          microTopics: [
            { id: 'so4_1', topicTitle: 'Establishment of UN', subtopic: 'History', dayNumber: 4, periodNumber: 1, keyFormulaOrLaw: 'San Francisco Conference', keyPoints: ['Successor to League'], type: 'concept', importance: 'Foundational' }
          ]
        },
        {
          chapterNumber: 5,
          chapterTitle: 'India Location & Relief',
          microTopics: [
            { id: 'so5_1', topicTitle: 'Himalayan Mountains', subtopic: 'Geography', dayNumber: 5, periodNumber: 1, keyFormulaOrLaw: 'Northern boundary', keyPoints: ['Physical feature of India'], type: 'concept', importance: 'Core Standard' }
          ]
        },
        {
          chapterNumber: 6,
          chapterTitle: 'Climate & Vegetation',
          microTopics: [
            { id: 'so6_1', topicTitle: 'Monsoon Mechanism', subtopic: 'Geography', dayNumber: 6, periodNumber: 1, keyFormulaOrLaw: 'Seasonal wind reversal', keyPoints: ['Indian climate driver'], type: 'concept', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 7,
          chapterTitle: 'Resources & Industries',
          microTopics: [
            { id: 'so7_1', topicTitle: 'Iron and Steel Industry', subtopic: 'Geography', dayNumber: 7, periodNumber: 1, keyFormulaOrLaw: 'Basic industry', keyPoints: ['Industrial backbone'], type: 'concept', importance: 'Core Standard' }
          ]
        },
        {
          chapterNumber: 8,
          chapterTitle: 'Indian Constitution',
          microTopics: [
            { id: 'so8_1', topicTitle: 'Preamble of Constitution', subtopic: 'Civics', dayNumber: 8, periodNumber: 1, keyFormulaOrLaw: 'Sovereign Socialist Secular', keyPoints: ['Introduction to Constitution'], type: 'memorization', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 9,
          chapterTitle: 'Central Government',
          microTopics: [
            { id: 'so9_1', topicTitle: 'Powers of the President', subtopic: 'Civics', dayNumber: 9, periodNumber: 1, keyFormulaOrLaw: 'Executive head', keyPoints: ['Nominal head of state'], type: 'concept', importance: 'Core Standard' }
          ]
        },
        {
          chapterNumber: 10,
          chapterTitle: 'State Government',
          microTopics: [
            { id: 'so10_1', topicTitle: 'Role of Chief Minister', subtopic: 'Civics', dayNumber: 10, periodNumber: 1, keyFormulaOrLaw: 'Head of state government', keyPoints: ['Real executive of state'], type: 'concept', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 11,
          chapterTitle: 'Gross Domestic Product',
          microTopics: [
            { id: 'so11_1', topicTitle: 'GDP Definition', subtopic: 'Economics', dayNumber: 11, periodNumber: 1, keyFormulaOrLaw: 'C + I + G + (X-M)', keyPoints: ['Total value of goods'], type: 'formula', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 12,
          chapterTitle: 'Government & Taxes',
          microTopics: [
            { id: 'so12_1', topicTitle: 'Direct vs Indirect Taxes', subtopic: 'Economics', dayNumber: 12, periodNumber: 1, keyFormulaOrLaw: 'Incidence of tax', keyPoints: ['Income tax vs GST'], type: 'concept', importance: 'Core Standard' }
          ]
        }
      ]
    },
    {
      subjectId: 'sec_tamil',
      subjectName: 'Tamil',
      icon: '🔤',
      color: '#ec4899',
      totalChapters: 9,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: 'Iyal 1',
          microTopics: [
            { id: 't1_1', topicTitle: 'Seyul Poem 1', subtopic: 'Poetry', dayNumber: 1, periodNumber: 1, keyFormulaOrLaw: 'Tamil literature', keyPoints: ['Poetic structure'], type: 'memorization', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: 'Iyal 2',
          microTopics: [
            { id: 't2_1', topicTitle: 'Urai Nadai Prose', subtopic: 'Prose', dayNumber: 2, periodNumber: 1, keyFormulaOrLaw: 'Tamil prose', keyPoints: ['Essay structure'], type: 'concept', importance: 'Core Standard' }
          ]
        },
        {
          chapterNumber: 3,
          chapterTitle: 'Iyal 3',
          microTopics: [
            { id: 't3_1', topicTitle: 'Grammar Section 3', subtopic: 'Grammar', dayNumber: 3, periodNumber: 1, keyFormulaOrLaw: 'Tamil grammar rules', keyPoints: ['Rules application'], type: 'formula', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 4,
          chapterTitle: 'Iyal 4',
          microTopics: [
            { id: 't4_1', topicTitle: 'Supplementary Reading 4', subtopic: 'Reading', dayNumber: 4, periodNumber: 1, keyFormulaOrLaw: 'Story analysis', keyPoints: ['Plot and theme'], type: 'concept', importance: 'Foundational' }
          ]
        },
        {
          chapterNumber: 5,
          chapterTitle: 'Iyal 5',
          microTopics: [
            { id: 't5_1', topicTitle: 'Seyul Poem 5', subtopic: 'Poetry', dayNumber: 5, periodNumber: 1, keyFormulaOrLaw: 'Tamil literature', keyPoints: ['Poetic structure'], type: 'memorization', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 6,
          chapterTitle: 'Iyal 6',
          microTopics: [
            { id: 't6_1', topicTitle: 'Urai Nadai Prose 6', subtopic: 'Prose', dayNumber: 6, periodNumber: 1, keyFormulaOrLaw: 'Tamil prose', keyPoints: ['Essay structure'], type: 'concept', importance: 'Core Standard' }
          ]
        },
        {
          chapterNumber: 7,
          chapterTitle: 'Iyal 7',
          microTopics: [
            { id: 't7_1', topicTitle: 'Grammar Section 7', subtopic: 'Grammar', dayNumber: 7, periodNumber: 1, keyFormulaOrLaw: 'Tamil grammar rules', keyPoints: ['Rules application'], type: 'formula', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 8,
          chapterTitle: 'Iyal 8',
          microTopics: [
            { id: 't8_1', topicTitle: 'Supplementary Reading 8', subtopic: 'Reading', dayNumber: 8, periodNumber: 1, keyFormulaOrLaw: 'Story analysis', keyPoints: ['Plot and theme'], type: 'concept', importance: 'Foundational' }
          ]
        },
        {
          chapterNumber: 9,
          chapterTitle: 'Iyal 9',
          microTopics: [
            { id: 't9_1', topicTitle: 'Comprehensive Revision', subtopic: 'Revision', dayNumber: 9, periodNumber: 1, keyFormulaOrLaw: 'All concepts', keyPoints: ['Final review'], type: 'concept', importance: 'High-Yield' }
          ]
        }
      ]
    },
    {
      subjectId: 'sec_english',
      subjectName: 'English',
      icon: '🔤',
      color: '#3b82f6',
      totalChapters: 7,
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: 'Unit 1',
          microTopics: [
            { id: 'e1_1', topicTitle: 'Prose Comprehension 1', subtopic: 'Prose', dayNumber: 1, periodNumber: 1, keyFormulaOrLaw: 'Reading skills', keyPoints: ['Passage analysis'], type: 'concept', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 2,
          chapterTitle: 'Unit 2',
          microTopics: [
            { id: 'e2_1', topicTitle: 'Poem Analysis 2', subtopic: 'Poem', dayNumber: 2, periodNumber: 1, keyFormulaOrLaw: 'Figures of speech', keyPoints: ['Poetic devices'], type: 'memorization', importance: 'Core Standard' }
          ]
        },
        {
          chapterNumber: 3,
          chapterTitle: 'Unit 3',
          microTopics: [
            { id: 'e3_1', topicTitle: 'Grammar Focus 3', subtopic: 'Grammar', dayNumber: 3, periodNumber: 1, keyFormulaOrLaw: 'Tenses and Voice', keyPoints: ['Active Passive Voice'], type: 'formula', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 4,
          chapterTitle: 'Unit 4',
          microTopics: [
            { id: 'e4_1', topicTitle: 'Supplementary Reading 4', subtopic: 'Reading', dayNumber: 4, periodNumber: 1, keyFormulaOrLaw: 'Story details', keyPoints: ['Character sketch'], type: 'concept', importance: 'Foundational' }
          ]
        },
        {
          chapterNumber: 5,
          chapterTitle: 'Unit 5',
          microTopics: [
            { id: 'e5_1', topicTitle: 'Prose Comprehension 5', subtopic: 'Prose', dayNumber: 5, periodNumber: 1, keyFormulaOrLaw: 'Reading skills', keyPoints: ['Passage analysis'], type: 'concept', importance: 'High-Yield' }
          ]
        },
        {
          chapterNumber: 6,
          chapterTitle: 'Unit 6',
          microTopics: [
            { id: 'e6_1', topicTitle: 'Poem Analysis 6', subtopic: 'Poem', dayNumber: 6, periodNumber: 1, keyFormulaOrLaw: 'Figures of speech', keyPoints: ['Poetic devices'], type: 'memorization', importance: 'Core Standard' }
          ]
        },
        {
          chapterNumber: 7,
          chapterTitle: 'Unit 7',
          microTopics: [
            { id: 'e7_1', topicTitle: 'Grammar Focus 7', subtopic: 'Grammar', dayNumber: 7, periodNumber: 1, keyFormulaOrLaw: 'Direct Indirect Speech', keyPoints: ['Reported speech rules'], type: 'formula', importance: 'High-Yield' }
          ]
        }
      ]
    }
  ];

  return {
    courseId,
    courseTitle,
    category: 'school_secondary',
    board: 'TNSB Samacheer Kalvi / CBSE',
    medium: isTa ? 'Tamil' : 'English',
    totalDays: 200,
    totalSubjects: subjects.length,
    totalChapters: subjects.reduce((a, s) => a + s.chapters.length, 0),
    totalMicroTopics: subjects.reduce((a, s) => a + (s.chapters.reduce((acc, c) => acc + (c.microTopics ? c.microTopics.length : 0), 0)), 0),
    subjects
  };
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 6. UPSC CIVIL SERVICES EXAMINATION (CSE â€” IAS / IPS / IFS / IRS) MASTER SYLLABUS
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function getUpscCivilServicesCompleteSyllabus(courseId?: string, courseTitle?: string): CourseFullSyllabus {
  // SUBJECT 1: GS PAPER I (History, Art & Culture, Geography & Indian Society)
  const gs1Chapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Indian Heritage, Visual & Performing Arts & Literature',
      description: 'Harappan art, Mauryan/Gupta architecture, Dravidian temple styles (Chola/Pallava), 8 Classical Dances, Hindustani & Carnatic Music',
      microTopics: [
        { id: 'upsc_gs1_1', topicTitle: 'Temple Architecture (Nagara, Dravida, Vesara) & Rock-Cut Caves', subtopic: 'Ajanta, Ellora, Elephanta caves; Brihadisvara Chola bronzes; Nagara shikhara vs Dravida vimana & gopuram', dayNumber: 1, periodNumber: 1, keyFormulaOrLaw: 'Dravidian Style Features: Garbhagriha, Vimana (Pyramidal tower), Mandapa, Gopuram (Monumental gateway)', keyPoints: ['Chola bronze Nataraja iconography and casting technique (Cire-perdue / lost wax)', 'Bhimbetka rock shelters (Paleolithic to Mesolithic continuity)'], type: 'concept', importance: 'High-Yield' },
        { id: 'upsc_gs1_2', topicTitle: 'Classical Performing Arts (8 Dances) & Indian Philosophical Schools', subtopic: 'Bharatanatyam, Kathakali, Kathak, Odissi, Sattriya; 6 Orthodox schools (Nyaya, Vaisheshika, Samkhya, Yoga, Mimamsa, Vedanta) & Heterodox (Buddhism/Jainism)', dayNumber: 5, periodNumber: 1, keyFormulaOrLaw: 'Natyashastra (Bharata Muni): 9 Rasas (Navarasa) & Abhinaya | Advaita Vedanta (Adi Shankara): Maya & Brahman', keyPoints: ['Sattriya dance introduced by Mahapurusha Sankaradeva in Assam', 'Buddhist councils, Tripitakas, and Mahayana vs Hinayana doctrines'], type: 'concept', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Ancient, Medieval & Modern Indian History (1757 to 1947)',
      description: 'Indus Valley Civilization, Mauryan administration, Delhi Sultanate, Mughals (Mansabdari), 1857 Revolt & Gandhian Freedom Movements',
      microTopics: [
        { id: 'upsc_gs1_3', topicTitle: 'Indus Valley Civilization, Mauryas & Mughal Administrative Systems', subtopic: 'IVC town planning & drainage, Ashokan Dhamma edicts, Akbar Mansabdari & Zabti revenue system, Shivaji Ashtapradhan', dayNumber: 2, periodNumber: 1, keyFormulaOrLaw: 'Mansabdari System: Zat (Personal rank) and Sawar (Number of cavalrymen maintained)', keyPoints: ['Ashoka 14 Major Rock Edicts (Prakrit and Greek/Aramaic scripts)', 'Chola Kudavolai system of local self-government (Uttiramerur inscription)'], type: 'concept', importance: 'High-Yield' },
        { id: 'upsc_gs1_4', topicTitle: 'Modern Freedom Struggle: Moderates, Extremists & Gandhian Mass Movements', subtopic: 'Drain of Wealth (Dadabhai Naoroji), Swadeshi 1905, Non-Cooperation 1920, Civil Disobedience 1930, Quit India 1942, INA Subhash Chandra Bose', dayNumber: 6, periodNumber: 1, keyFormulaOrLaw: 'Gandhi Core Philosophy: Satyagraha (Truth-force), Ahimsa (Non-violence), Sarvodaya (Uplift of all)', keyPoints: ['1857 Revolt was turning point: Company rule ended, Queen Victoria Proclamation 1858', 'Poona Pact 1932: Joint electorate with reserved seats for Depressed Classes'], type: 'concept', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 3,
      chapterTitle: 'World History, Post-Independence Consolidation & Indian Society',
      description: 'Industrial Revolution, French/Russian Revolutions, World Wars, Decolonization, State Reorganization, Caste & Globalization',
      microTopics: [
        { id: 'upsc_gs1_5', topicTitle: 'World Revolutions (American, French, Russian), World Wars & Cold War Era', subtopic: 'French Revolution (Liberty, Equality, Fraternity), Russian Revolution 1917 (Lenin/Bolsheviks), Treaty of Versailles, NATO vs Warsaw Pact', dayNumber: 3, periodNumber: 1, keyFormulaOrLaw: 'Declaration of Rights of Man (1789) | Cold War Truman Doctrine & Marshall Plan', keyPoints: ['Industrial Revolution transformed agrarian societies into industrial capitalism', 'Non-Aligned Movement (NAM 1961 Belgrade) spearheaded by Nehru, Nasser, Tito'], type: 'concept', importance: 'High-Yield' },
        { id: 'upsc_gs1_6', topicTitle: 'Salient Features of Indian Society, Women Empowerment & Globalization', subtopic: 'Caste dynamics, Joint family changes, Demographic dividend, Urbanization distress, Feminization of agriculture, Secularism in India', dayNumber: 7, periodNumber: 1, keyFormulaOrLaw: 'Indian Model of Secularism: "Sarva Dharma Sambhava" (Equal respect to all religions) vs Western strict separation', keyPoints: ['Demographic Dividend window: India median age ~28.7 years', 'Impact of globalization on regional identities and informal labor markets'], type: 'concept', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 4,
      chapterTitle: 'Physical Geography (Geomorphology, Climatology, Oceanography) & Resources',
      description: 'Plate Tectonics, Indian Monsoon Mechanism (El Nino/La Nina/IOD), Ocean Currents, Mineral distribution & Critical Minerals (Lithium/Rare Earths)',
      microTopics: [
        { id: 'upsc_gs1_7', topicTitle: 'Geomorphology & Climatology: Plate Tectonics & Indian Monsoon Dynamics', subtopic: 'Continental drift, subduction zones, tropical cyclones, Southwest & Northeast Monsoons, Madden-Julian Oscillation (MJO), Western Disturbances', dayNumber: 4, periodNumber: 1, keyFormulaOrLaw: 'Monsoon Drivers: Differential heating, ITCZ shift, Tibetan plateau heating, Tropical Easterly Jet, Somali Jet, El Nino/IOD', keyPoints: ['Plate boundary types: Convergent (Himalayas), Divergent (Mid-Atlantic Ridge), Transform (San Andreas)', 'El Nino weakens Indian monsoon; Positive IOD enhances Indian rainfall'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'upsc_gs1_8', topicTitle: 'Oceanography, Critical Mineral Distribution & Location of Industries', subtopic: 'Thermohaline circulation, Coral bleaching, Deep ocean resources, Lithium & Rare Earth Elements (REE) supply chains, Weber Industrial Location Theory', dayNumber: 8, periodNumber: 1, keyFormulaOrLaw: 'Weber Least Cost Theory: Location determined by Transportation Cost, Labor Cost, and Agglomeration Economies', keyPoints: ['Coral bleaching occurs due to thermal stress causing expulsion of Zooxanthellae algae', 'Critical minerals: Lithium, Cobalt, Nickel, Gallium vital for EV transition and clean energy'], type: 'concept', importance: 'High-Yield' }
      ]
    }
  ];

  // SUBJECT 2: GS PAPER II (Governance, Constitution, Polity, Social Justice & IR)
  const gs2Chapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Indian Constitution, Basic Structure Doctrine & Comparative Schemes',
      description: 'Evolution from 1773-1947 Acts, Preamble, Fundamental Rights (12-35), DPSPs, Basic Structure, Comparison with UK, USA, France',
      microTopics: [
        { id: 'upsc_gs2_1', topicTitle: 'Constitutional Philosophy, Basic Structure Doctrine & Major Amendments', subtopic: 'Kesavananda Bharati case 1973, 42nd/44th/86th/101st GST/103rd EWS/106th Nari Shakti Vandan Amendments, Judicial Review', dayNumber: 1, periodNumber: 2, keyFormulaOrLaw: 'Basic Structure Doctrine: Parliament amending power under Article 368 cannot alter the core identity of the Constitution', keyPoints: ['Article 21 expanded to include Right to Privacy (Puttaswamy 2017), Clean Environment, Education (21A)', 'Harmonious construction between Fundamental Rights and DPSPs (Minerva Mills 1980)'], type: 'concept', importance: 'High-Yield' },
        { id: 'upsc_gs2_2', topicTitle: 'Comparison of Indian Constitutional Scheme with UK, USA & France', subtopic: 'Parliamentary sovereignty vs Constitutional supremacy, US Strict Separation of Powers vs Indian Checks and Balances, French Laïcité secularism', dayNumber: 5, periodNumber: 2, keyFormulaOrLaw: 'UK: Unwritten Constitution & Parliamentary Sovereignty | USA: Presidential & Due Process | India: Procedure Established by Law (evolving to Due Process)', keyPoints: ['India combines British parliamentary model with American fundamental rights and judicial review', 'US states have separate constitutions and dual citizenship; India has single citizenship'], type: 'concept', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Federalism, Executive, Parliament & Judicial Institutions',
      description: 'Centre-State relations (7th Schedule), Governor role, Parliamentary Committees, Anti-Defection Law (10th Schedule), Collegium System',
      microTopics: [
        { id: 'upsc_gs2_3', topicTitle: 'Federal Dynamics, Governor Constitutional Dilemmas & Local Governance (73rd/74th)', subtopic: 'Fiscal federalism, GST Council, Article 356 abuse, Governor discretionary assent to state bills, 11th & 12th Schedules devolution', dayNumber: 2, periodNumber: 2, keyFormulaOrLaw: 'S.R. Bommai Case (1994): Proclamation under Article 356 is subject to judicial review and floor test is mandatory', keyPoints: ['Sarkaria & Punchhi Commissions recommendations on Governor appointment and tenure', '73rd & 74th Amendments: 3-tier Panchayati Raj and 33% (up to 50% in states) reservation for women'], type: 'concept', importance: 'High-Yield' },
        { id: 'upsc_gs2_4', topicTitle: 'Parliamentary Functioning, Anti-Defection (10th Schedule) & Judicial Appointments', subtopic: 'Decline of parliamentary sittings, Departmental Standing Committees, Speaker role in 10th Schedule, Collegium vs NJAC (99th Amendment struck down)', dayNumber: 6, periodNumber: 2, keyFormulaOrLaw: 'Kihoto Hollohan Case (1992): Speaker decision under 10th Schedule is subject to judicial review', keyPoints: ['Ordinance-making power (Article 123/213) cannot be used as substitute for legislative power (D.C. Wadhwa case)', 'Public Interest Litigation (PIL) and epistolary jurisdiction expanded access to justice'], type: 'concept', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 3,
      chapterTitle: 'Electoral Reforms (RPA 1950/51), Statutory Bodies & Social Justice',
      description: 'Section 8 RPA disqualification, Criminalization of politics, CAG, Election Commission, Health, Education NEP 2020, Poverty & Hunger',
      microTopics: [
        { id: 'upsc_gs2_5', topicTitle: 'Representation of People Act (RPA 1950 & 1951) & Electoral Transparency', subtopic: 'Section 8(4) struck down (Lily Thomas 2013), Electoral Bonds verdict 2024, Simultaneous Elections (One Nation One Election), Model Code of Conduct', dayNumber: 3, periodNumber: 2, keyFormulaOrLaw: 'Association for Democratic Reforms (ADR 2002): Mandatory disclosure of criminal antecedents, assets, and liabilities of candidates', keyPoints: ['Article 324 plenary superintendence of elections vested in Election Commission', 'Section 123 of RPA 1951: Corrupt practices and appeals to religion/caste'], type: 'concept', importance: 'High-Yield' },
        { id: 'upsc_gs2_6', topicTitle: 'Social Justice: Vulnerable Sections Welfare, Health, Education (NEP 2020) & Hunger', subtopic: 'SC/ST Prevention of Atrocities, Rights of PwD Act 2016, Ayushman Bharat, Universal Health Coverage, National Food Security Act (NFSA 2013), POSHAN Abhiyaan', dayNumber: 7, periodNumber: 2, keyFormulaOrLaw: 'NEP 2020 5+3+3+4 Curricular Structure | NFSA 2013: 5 kg foodgrains/person/month at subsidised prices to 67% population', keyPoints: ['Out-of-pocket healthcare expenditure pushes families into poverty', 'Stunting, wasting, and anemia reduction targets under POSHAN 2.0'], type: 'concept', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 4,
      chapterTitle: 'International Relations, Bilateral Diplomacy & Global Multilateral Bodies',
      description: 'Neighborhood First, Act East, Quad, BRICS, G20, I2U2, UN Security Council Reforms, WTO Appellate Body, IMF/World Bank',
      microTopics: [
        { id: 'upsc_gs2_7', topicTitle: 'India Neighborhood First Policy, Indo-Pacific Strategy & Strategic Groupings', subtopic: 'India-China border LAC management, India-US Major Defense Partner, Quad maritime security, I2U2, BRICS expansion, IMEEC economic corridor', dayNumber: 4, periodNumber: 2, keyFormulaOrLaw: 'SAGAR (Security and Growth for All in the Region) & "Vasudhaiva Kutumbakam" (One Earth, One Family, One Future)', keyPoints: ['Indo-Pacific as a free, open, inclusive, and rules-based international maritime domain', 'Cross-border connectivity: Kaladan Multi-Modal, India-Myanmar-Thailand Trilateral Highway'], type: 'concept', importance: 'High-Yield' },
        { id: 'upsc_gs2_8', topicTitle: 'Multilateral Institutions: United Nations (UNSC Reforms), WTO & Global Governance', subtopic: 'G4 grouping for permanent UNSC seat, WTO dispute settlement crisis, TRIPS waiver, IMF quotas and Special Drawing Rights (SDRs), FATF grey/black listing', dayNumber: 8, periodNumber: 2, keyFormulaOrLaw: 'UNSC Reform Criteria: Representation of developing nations, expanding permanent membership from P5 to include G4 (India, Brazil, Germany, Japan)', keyPoints: ['WTO Peace Clause protects India agricultural MSP public stockholding', 'FATF Recommendations 40+9 to combat money laundering and terror financing'], type: 'concept', importance: 'High-Yield' }
      ]
    }
  ];

  // SUBJECT 3: GS PAPER III (Technology, Economic Development, Environment & Internal Security)
  const gs3Chapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Indian Macroeconomics, Budgeting (FRBM) & Inclusive Growth',
      description: 'GDP calculation (GVA at basic prices), Fiscal Deficit, FRBM Act, Tax buoyancy, GST reforms, Monetary Policy MPC, Banking NPAs & IBC 2016',
      microTopics: [
        { id: 'upsc_gs3_1', topicTitle: 'Macroeconomic Aggregates, Fiscal Deficit, Budgeting & FRBM Architecture', subtopic: 'Nominal vs Real GDP, GVA, Fiscal Deficit = Total Expenditure - (Revenue Receipts + Non-debt Capital Receipts), FRBM targets (3% Fiscal Deficit)', dayNumber: 1, periodNumber: 3, keyFormulaOrLaw: 'Primary Deficit = Fiscal Deficit - Interest Payments | Monetary Policy Taylor Rule: Repo Rate adjustment for inflation targeting (4% Â± 2%)', keyPoints: ['Insolvency and Bankruptcy Code (IBC 2016) time-bound resolution of stressed corporate assets', 'Capital Expenditure (Capex) multiplier effect on infrastructure growth vs revenue expenditure'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'upsc_gs3_2', topicTitle: 'Inclusive Growth, Financial Inclusion (JAM Trinity) & Employment Landscape', subtopic: 'Jan Dhan-Aadhaar-Mobile (JAM), Direct Benefit Transfer (DBT), Gini coefficient, Periodic Labour Force Survey (PLFS), Gig and platform economy', dayNumber: 5, periodNumber: 3, keyFormulaOrLaw: 'Lorenz Curve & Gini Coefficient: G = A / (A + B) (0 = Perfect Equality, 1 = Perfect Inequality)', keyPoints: ['PM Jan Dhan Yojana achieved over 50 crore zero-balance bank accounts', 'Female Labour Force Participation Rate (FLFPR) constraints and care economy recognition'], type: 'concept', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Agriculture Economics, MSP, Cropping Patterns & Food Processing',
      description: 'Cropping systems (Kharif, Rabi, Zaid), Swaminathan C2 MSP formula, APMCs, e-NAM, Drip irrigation, Mega Food Parks, Land reforms',
      microTopics: [
        { id: 'upsc_gs3_3', topicTitle: 'Agricultural Cropping Patterns, Irrigation Systems & MSP Pricing Economics', subtopic: 'Micro-irrigation (Drip/Sprinkler under PMKSY), Direct Seeded Rice (DSR), MSP calculation (A2+FL vs Comprehensive C2 cost), Agri-credit', dayNumber: 2, periodNumber: 3, keyFormulaOrLaw: 'Swaminathan Commission Recommendation: MSP = Cost C2 + 50% profit margin', keyPoints: ['e-NAM (National Agriculture Market) creates unified pan-India electronic trading portal', 'PDS reforms: One Nation One Ration Card (ONORC) using Aadhaar biometric authentication'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'upsc_gs3_4', topicTitle: 'Food Processing Industries, Supply Chain Logistics & Land Records (SVAMITVA)', subtopic: 'Upstream and downstream linkages, Mega Food Parks Scheme, PMFME, Drone technology in agriculture, SVAMITVA drone mapping of rural land', dayNumber: 6, periodNumber: 3, keyFormulaOrLaw: 'Food Processing Value Addition: Raw Produce -> Processing -> Cold Chain -> Quality Testing -> Retail Export', keyPoints: ['Post-harvest losses in fruits and vegetables reduced through integrated cold chain infrastructure', 'Digital India Land Records Modernization Programme (DILRMP) ensures conclusive land titling'], type: 'concept', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 3,
      chapterTitle: 'Science & Technology: Space, AI, Biotechnology, Supercomputing & IPR',
      description: 'ISRO (Gaganyaan, Chandrayaan-3, Aditya-L1), 5G/6G, Artificial Intelligence, CRISPR-Cas9 gene editing, mRNA vaccines, Patents Act Section 3(d)',
      microTopics: [
        { id: 'upsc_gs3_5', topicTitle: 'Space Science: ISRO Launch Vehicles (LVM3, SSLV) & Deep Space Missions', subtopic: 'Chandrayaan-3 lunar south pole landing, Aditya-L1 Lagrange Point Halo orbit, Gaganyaan human spaceflight, NavIC satellite navigation', dayNumber: 3, periodNumber: 3, keyFormulaOrLaw: 'Orbital Mechanics: Escape Velocity v_e = âˆš(2GM/R) | Lagrange Points L1 to L5 gravitational equilibrium', keyPoints: ['Cryogenic upper stage (CE-20 engine) powers India heavy lift LVM3 rocket', 'IN-SPACe single-window agency facilitating private space tech startups in India'], type: 'concept', importance: 'High-Yield' },
        { id: 'upsc_gs3_6', topicTitle: 'Frontier Tech: AI, Quantum Computing, CRISPR-Cas9 Gene Editing & IPR Section 3(d)', subtopic: 'National Quantum Mission (QKD, Superconducting qubits), Generative AI ethics, CRISPR-Cas9 molecular scissors, Section 3(d) of Patents Act against evergreening', dayNumber: 7, periodNumber: 3, keyFormulaOrLaw: 'Section 3(d) Patents Act 1970: Mere discovery of a new form of known substance without enhanced therapeutic efficacy is not patentable', keyPoints: ['Novartis case upheld Section 3(d) to ensure affordable generic medicines for public health', 'CRISPR-Cas9 enables precise targeted genetic modification to cure sickle cell disease'], type: 'concept', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 4,
      chapterTitle: 'Environment, Climate Change (UNFCCC COP) & Internal Security',
      description: 'EIA 2020, Paris Agreement Net Zero 2070, Sendai Disaster Framework, Left Wing Extremism (LWE), Cyber Warfare (CERT-In), PMLA & Border Security',
      microTopics: [
        { id: 'upsc_gs3_7', topicTitle: 'Environmental Conservation, EIA, UNFCCC Climate Summits & Disaster Management', subtopic: 'EIA 4-stage process (Screening, Scoping, Public Consultation, Appraisal), Panchamrit Net Zero 2070 targets, Sendai Framework 2015-2030, NDRF response', dayNumber: 4, periodNumber: 3, keyFormulaOrLaw: 'Sendai Framework 4 Priorities: Understanding Risk -> Strengthening Governance -> Investing in Resilience -> Build Back Better', keyPoints: ['Panchamrit: 500 GW non-fossil energy, 50% renewable capacity, 1 billion tonne carbon reduction, Net Zero by 2070', 'Project Tiger 50 years: Conservation model in Core-Buffer protected areas'], type: 'concept', importance: 'High-Yield' },
        { id: 'upsc_gs3_8', topicTitle: 'Internal Security: Left Wing Extremism, Cyber Security, Money Laundering (PMLA) & Border Control', subtopic: 'SAMADHAN strategy against Naxalism, National Cyber Security Strategy, CERT-In guidelines, PMLA 2002 (Placement, Layering, Integration), CAPF mandates (BSF, CRPF, ITBP)', dayNumber: 8, periodNumber: 3, keyFormulaOrLaw: 'Money Laundering 3 Stages: Placement (Cash inject) -> Layering (Complex transactions) -> Integration (Clean assets)', keyPoints: ['Comprehensive Integrated Border Management System (CIBMS) with thermal imagers and radar sensors', 'Critical Information Infrastructure protected by NCIIPC under Section 70 of IT Act 2000'], type: 'concept', importance: 'High-Yield' }
      ]
    }
  ];

  // SUBJECT 4: GS PAPER IV (Ethics, Integrity, Aptitude & Administrative Case Studies)
  const gs4Chapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Ethics & Human Interface, Moral Thinkers & Human Values',
      description: 'Deontology (Kant), Utilitarianism (Bentham/Mill), Virtue Ethics (Aristotle), Lessons from Gandhi, Buddha, Kalam, Mandela, Thiruvalluvar',
      microTopics: [
        { id: 'upsc_gs4_1', topicTitle: 'Ethical Theories (Deontology, Consequentialism, Virtue Ethics) & Human Values', subtopic: 'Kant Categorical Imperative, Mill Utilitarian Greatest Happiness Principle, Aristotle Golden Mean, Essence & Determinants of Ethics in human conduct', dayNumber: 1, periodNumber: 4, keyFormulaOrLaw: 'Kant Categorical Imperative: Act only according to that maxim whereby you can at the same time will that it should become a universal law', keyPoints: ['Deontology focuses on duty and inherent rightness of action regardless of consequences', 'Utilitarianism evaluates action based on end results (Telos)'], type: 'concept', importance: 'High-Yield' },
        { id: 'upsc_gs4_2', topicTitle: 'Moral Thinkers: Indian (Kautilya, Thiruvalluvar, Gandhi, Ambedkar) & Western (Rawls, Socrates)', subtopic: 'Thirukkural on Kingly governance (Aran), Gandhi 7 Social Sins, Ambedkar Constitutional Morality, John Rawls Theory of Justice & "Veil of Ignorance"', dayNumber: 5, periodNumber: 4, keyFormulaOrLaw: 'John Rawls "Veil of Ignorance": Principles of justice designed when no one knows their social status, wealth, or natural abilities', keyPoints: ['Gandhi 7 Social Sins: Politics without Principles, Wealth without Work, Commerce without Morality, Science without Humanity', 'Thiruvalluvar: "A ruler who governs with righteousness will be revered as a God by his people"'], type: 'concept', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Attitude, Emotional Intelligence (EI) & Civil Service Foundational Values',
      description: 'CAB model of Attitude, Persuasion & Nudge Theory, Daniel Goleman 5 EI Components, Integrity, Impartiality, Non-partisanship, Compassion',
      microTopics: [
        { id: 'upsc_gs4_3', topicTitle: 'Attitude Structure (CAB Model), Persuasion Techniques & Emotional Intelligence (EI)', subtopic: 'Cognitive, Affective, Behavioral components of attitude; Nudge theory in public policy (Swachh Bharat); Daniel Goleman 5 EI dimensions in governance', dayNumber: 2, periodNumber: 4, keyFormulaOrLaw: 'Daniel Goleman 5 Dimensions of Emotional Intelligence: Self-Awareness, Self-Regulation, Internal Motivation, Empathy, Social Skills', keyPoints: ['High EI enables civil servants to resolve mob conflicts, manage administrative stress, and negotiate crises', 'Nudge theory uses positive reinforcement and indirect suggestions to influence behavior without mandates'], type: 'concept', importance: 'High-Yield' },
        { id: 'upsc_gs4_4', topicTitle: 'Foundational Values for Civil Services: Integrity, Impartiality, Objectivity & Compassion', subtopic: 'Absolute honesty, political neutrality, evidence-based decision making, empathy towards weaker sections (Gandhi Talisman)', dayNumber: 6, periodNumber: 4, keyFormulaOrLaw: 'Gandhi Talisman: "Recall the face of the poorest and the weakest man whom you may have seen, and ask yourself, if the step you contemplate is going to be of any use to him."', keyPoints: ['Integrity is non-negotiable consistency of actions, values, and principles even when unobserved', 'Impartiality ensures unbiased implementation of laws regardless of political regime in power'], type: 'concept', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 3,
      chapterTitle: 'Probity in Governance, Nolan Principles & Administrative Case Studies',
      description: 'Nolan Committee 7 Principles, RTI Act 2005 proactive disclosure, Citizen Charters (Sevottam Model), Whistleblowing, Conflict of Interest Case Studies',
      microTopics: [
        { id: 'upsc_gs4_5', topicTitle: 'Probity in Governance, Nolan Committee 7 Principles & RTI Transparency', subtopic: 'Nolan 7 Principles (Selflessness, Integrity, Objectivity, Accountability, Openness, Honesty, Leadership), Prevention of Corruption Act, CPGRAMS grievance redressal', dayNumber: 3, periodNumber: 4, keyFormulaOrLaw: 'Nolan Committee 7 Principles of Public Life: Selflessness, Integrity, Objectivity, Accountability, Openness, Honesty, Leadership', keyPoints: ['Sevottam Model 3 components: Citizen Charter implementation, Public Grievance Redressal, Service Delivery Capability', 'Whistleblowers Protection Act safeguards individuals exposing corrupt practices in public administration'], type: 'concept', importance: 'High-Yield' },
        { id: 'upsc_gs4_6', topicTitle: 'Case Studies: Resolution Framework for Ethical Dilemmas & Conflict of Interest', subtopic: 'Framework: Identify Stakeholders -> Ethical Dilemma -> Options Available with Merits/Demerits -> Course of Action based on Constitutional Morality', dayNumber: 7, periodNumber: 4, keyFormulaOrLaw: 'Ethical Decision Matrix: Legality + Constitutional Morality + Utilitarian Benefit + Empathy for Marginalized + Transparency', keyPoints: ['Balancing statutory duty against political pressure using documented official written instructions', 'Resolving environmental clearance dilemmas by incorporating sustainable mitigation and local tribal consent'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  // SUBJECT 5: CSAT (Civil Services Aptitude Test & Quantitative Reasoning)
  const csatChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Reading Comprehension & Critical Reasoning',
      description: 'Passages on ecology, governance, economics; Identifying Central Idea, Crucial Assumptions, Logical Inferences & Implications',
      microTopics: [
        { id: 'upsc_csat_1', topicTitle: 'Reading Comprehension: Assumptions, Logical Inferences & Authorial Tone', subtopic: 'Distinguishing directly stated facts from unstated underlying assumptions, invalid extreme options elimination technique', dayNumber: 1, periodNumber: 5, keyFormulaOrLaw: 'Assumption = Necessary unstated premise | Inference = Logical conclusion drawn from stated evidence', keyPoints: ['Eliminate extreme qualifiers: "Always", "Never", "Only", "All" unless explicitly validated by text', 'Focus on pivot keywords: "However", "Although", "Consequently", "Therefore"'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Basic Numeracy, Number Systems & Permutations / Probability',
      description: 'Divisibility rules, Remainder theorem, Unit digit, Factorials, P&C (nCr, nPr), Probability, Percentages & Speed-Distance-Time',
      microTopics: [
        { id: 'upsc_csat_2', topicTitle: 'Number Systems: Divisibility Rules, Unit Digits, Remainders & Factorials', subtopic: 'Cyclicity of powers (2, 3, 7, 8), Euler Remainder Theorem, trailing zeroes in n!, prime factorization & LCM-HCF word problems', dayNumber: 2, periodNumber: 5, keyFormulaOrLaw: 'Cyclicity of Unit Digit: Powers of 2, 3, 7, 8 repeat every 4th power | Trailing Zeroes = âŒŠn/5âŒ‹ + âŒŠn/25âŒ‹ + âŒŠn/125âŒ‹', keyPoints: ['Divisibility by 7, 11, 13 test using alternating 3-digit block sums', 'Remainder of polynomial expressions using Binomial theorem'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'upsc_csat_3', topicTitle: 'Permutations, Combinations (nCr, nPr), Probability & Set Theory Venn Diagrams', subtopic: 'Arrangement of letters/digits with constraints, selection of committee members, dice and coin probability, 2 and 3-set Venn diagrams', dayNumber: 3, periodNumber: 5, keyFormulaOrLaw: 'nCr = n! / [r!(n - r)!] | Probability P(E) = n(E) / n(S) | n(A âˆª B) = n(A) + n(B) - n(A âˆ© B)', keyPoints: ['Circular permutation of n distinct items = (n - 1)!', 'At least one probability: P(At least one) = 1 - P(None)'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 3,
      chapterTitle: 'Logical Reasoning, Puzzles, Clocks, Calendars & Data Interpretation',
      description: 'Syllogisms (Venn method), Linear/Circular seating arrangements, Blood relations, Direction test, Clock angle & Pie/Bar charts',
      microTopics: [
        { id: 'upsc_csat_4', topicTitle: 'Logical Deduction: Syllogisms, Seating Arrangements, Blood Relations & Dice', subtopic: 'All/Some/No statement truth values, complex multi-variable floor/seating puzzles, family tree notation, dice opposite faces', dayNumber: 4, periodNumber: 5, keyFormulaOrLaw: 'Clock Angle: Î¸ = |30H - (11/2)M| | Calendar Odd Days: Normal Year = 1 Odd Day, Leap Year = 2 Odd Days', keyPoints: ['Syllogism: If statement is "Some A are B", its converse "Some B are A" is definitively true', 'Blood relation problems solved by systematic generational family tree diagrams'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  const subjects: SyllabusSubject[] = [
    { subjectId: 'upsc_gs1', subjectName: 'UPSC GS Paper I: Heritage, History, Geography & Society (GS-1)', icon: 'ðŸ›ï¸', color: '#10b981', totalChapters: gs1Chapters.length, totalMicroTopics: gs1Chapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: gs1Chapters },
    { subjectId: 'upsc_gs2', subjectName: 'UPSC GS Paper II: Governance, Constitution, Polity, Social Justice & IR (GS-2)', icon: 'âš–ï¸', color: '#06b6d4', totalChapters: gs2Chapters.length, totalMicroTopics: gs2Chapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: gs2Chapters },
    { subjectId: 'upsc_gs3', subjectName: 'UPSC GS Paper III: Technology, Economy, Environment & Internal Security (GS-3)', icon: 'ðŸ“ˆ', color: '#f59e0b', totalChapters: gs3Chapters.length, totalMicroTopics: gs3Chapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: gs3Chapters },
    { subjectId: 'upsc_gs4', subjectName: 'UPSC GS Paper IV: Ethics, Integrity, Aptitude & Case Studies (GS-4)', icon: '💡', color: '#8b5cf6', totalChapters: gs4Chapters.length, totalMicroTopics: gs4Chapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: gs4Chapters },
    { subjectId: 'upsc_csat', subjectName: 'UPSC CSAT Paper II: Reading Comprehension & Quantitative Reasoning', icon: '🎯', color: '#ec4899', totalChapters: csatChapters.length, totalMicroTopics: csatChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: csatChapters }
  ];

  return {
    courseId: courseId || 'exam-upsc-ias',
    courseTitle: courseTitle || 'UPSC Civil Services (IAS / IPS / IFS / IRS) Prelims + Mains Master Blueprint',
    category: 'upsc_central',
    board: 'UPSC (National)',
    medium: 'English',
    totalDays: 360,
    totalSubjects: subjects.length,
    totalChapters: subjects.reduce((a, s) => a + (s.totalChapters || s.chapters.length), 0),
    totalMicroTopics: subjects.reduce((a, s) => a + (s.totalMicroTopics || s.chapters.reduce((acc, c) => acc + (c.microTopics?.length || 0), 0)), 0),
    subjects
  };
}

export function getUpscOptionalSubjectSyllabus(courseId: string, courseTitle?: string): CourseFullSyllabus {
  const opt = UPSC_OPTIONALS_REGISTRY[courseId];
  if (!opt) {
    return getUpscCivilServicesCompleteSyllabus(courseId, courseTitle);
  }

  const paper1Units = opt.units.filter(u => u.paper === 'Paper I');
  const paper2Units = opt.units.filter(u => u.paper === 'Paper II');

  const subjects: SyllabusSubject[] = [
    {
      subjectId: `${courseId}_p1`,
      subjectName: `${opt.shortTitle} â€” Paper I: Theory & Foundations`,
      icon: 'ðŸ›ï¸',
      color: opt.badgeColor || '#06b6d4',
      totalChapters: paper1Units.length,
      totalMicroTopics: paper1Units.reduce((a, u) => a + u.keyTopics.length, 0),
      chapters: paper1Units.map((u, idx) => ({
        chapterNumber: idx + 1,
        chapterTitle: `${u.unitTitle} (${u.section})`,
        description: `Thinkers & Foundational Literature: ${u.thinkersOrLaws.join(', ')}`,
        microTopics: u.keyTopics.map((kt, tIdx) => ({
          id: `${courseId}_p1_${idx + 1}_${tIdx + 1}`,
          topicTitle: kt,
          subtopic: u.thinkersOrLaws.join(' Â· '),
          dayNumber: (idx * 15) + (tIdx * 3) + 1,
          periodNumber: 1,
          keyFormulaOrLaw: `Core Thinkers: ${u.thinkersOrLaws.join(', ')}`,
          keyPoints: ['Core theoretical framework and critical debates', 'Mains analytical application and 250-word answer structuring'],
          type: 'concept',
          importance: 'High-Yield'
        }))
      }))
    },
    {
      subjectId: `${courseId}_p2`,
      subjectName: `${opt.shortTitle} â€” Paper II: Indian Context & Advanced Applications`,
      icon: 'âš–ï¸',
      color: '#10b981',
      totalChapters: paper2Units.length,
      totalMicroTopics: paper2Units.reduce((a, u) => a + u.keyTopics.length, 0),
      chapters: paper2Units.map((u, idx) => ({
        chapterNumber: idx + 1,
        chapterTitle: `${u.unitTitle} (${u.section})`,
        description: `Thinkers & Statutory Frameworks: ${u.thinkersOrLaws.join(', ')}`,
        microTopics: u.keyTopics.map((kt, tIdx) => ({
          id: `${courseId}_p2_${idx + 1}_${tIdx + 1}`,
          topicTitle: kt,
          subtopic: u.thinkersOrLaws.join(' Â· '),
          dayNumber: 180 + (idx * 15) + (tIdx * 3) + 1,
          periodNumber: 2,
          keyFormulaOrLaw: `Applied Principles: ${u.thinkersOrLaws.join(', ')}`,
          keyPoints: ['Empirical case studies and Indian administrative relevance', 'Contemporary trends, criticisms and policy synthesis'],
          type: 'solved_problem',
          importance: 'High-Yield'
        }))
      }))
    }
  ];

  return {
    courseId,
    courseTitle: courseTitle || opt.title,
    category: 'upsc_central',
    board: 'UPSC (National)',
    medium: 'English',
    totalDays: 360,
    totalSubjects: subjects.length,
    totalChapters: subjects.reduce((a, s) => a + (s.totalChapters || s.chapters.length), 0),
    totalMicroTopics: subjects.reduce((a, s) => a + (s.totalMicroTopics || s.chapters.reduce((acc, c) => acc + (c.microTopics?.length || 0), 0)), 0),
    subjects
  };
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 7. TNPSC UNIFIED MASTER SYLLABUS (GROUP 1, 2/2A, 4, VAO, DEO, SI)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function getTnpscUnifiedCompleteSyllabus(courseId?: string, courseTitle?: string): CourseFullSyllabus {
  return {
    courseId: courseId || 'exam-tnpsc-grp1',
    courseTitle: courseTitle || 'TNPSC Unified Complete Syllabus (Group 1, 2, 4 & VAO)',
    category: 'tnpsc',
    board: 'TNPSC',
    medium: courseTitle?.includes('English') ? 'English' : 'Tamil',
    totalDays: 300,
    totalSubjects: TNPSC_UNIFIED_OFFICIAL_SUBJECTS.length,
    totalChapters: TNPSC_UNIFIED_OFFICIAL_SUBJECTS.reduce((a, s) => a + s.totalChapters, 0),
    totalMicroTopics: TNPSC_UNIFIED_OFFICIAL_SUBJECTS.reduce((a, s) => a + s.totalMicroTopics, 0),
    subjects: TNPSC_UNIFIED_OFFICIAL_SUBJECTS
  };
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 8. NEET UG COMPLETE MICRO-TOPIC SYLLABUS REGISTRY (NTA / NMC VERBATIM)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function getNeetUgCompleteSyllabus(): CourseFullSyllabus {
  return {
    courseId: 'exam-neet-ug',
    courseTitle: 'NEET UG â€” National Medical Entrance Exam Preparation',
    category: 'entrance',
    board: 'NTA / NMC',
    medium: 'English',
    totalDays: 360,
    totalSubjects: NEET_UG_OFFICIAL_SUBJECTS.length,
    totalChapters: NEET_UG_OFFICIAL_SUBJECTS.reduce((a, s) => a + s.totalChapters, 0),
    totalMicroTopics: NEET_UG_OFFICIAL_SUBJECTS.reduce((a, s) => a + s.totalMicroTopics, 0),
    subjects: NEET_UG_OFFICIAL_SUBJECTS
  };
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 8B. JEE MAIN & ADVANCED COMPLETE MICRO-TOPIC SYLLABUS REGISTRY (NTA / IIT JEE)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function getJeeMainAdvancedCompleteSyllabus(courseId?: string, courseTitle?: string): CourseFullSyllabus {
  return {
    courseId: courseId || 'exam-jee-main',
    courseTitle: courseTitle || 'JEE Main & JEE Advanced Unified Entrance Preparation',
    category: 'entrance',
    board: 'NTA / IIT JEE',
    medium: 'English',
    totalDays: 360,
    totalSubjects: JEE_MAIN_ADVANCED_OFFICIAL_SUBJECTS.length,
    totalChapters: JEE_MAIN_ADVANCED_OFFICIAL_SUBJECTS.reduce((a, s) => a + s.totalChapters, 0),
    totalMicroTopics: JEE_MAIN_ADVANCED_OFFICIAL_SUBJECTS.reduce((a, s) => a + s.totalMicroTopics, 0),
    subjects: JEE_MAIN_ADVANCED_OFFICIAL_SUBJECTS
  };
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 9. CLASS 11 & 12 COMMERCE COMPLETE MICRO-TOPIC SYLLABUS REGISTRY
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function getCommerceClass11Syllabus(courseId: string, courseTitle: string): CourseFullSyllabus {
  const accountancyChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Introduction to Accounting & Theoretical Framework',
      description: 'Accounting concepts, GAAP, double entry system, cash vs accrual basis, and accounting standards',
      microTopics: [
        { id: 'com_acc_1', topicTitle: 'Accounting Meaning, Objectives & Fundamental Accounting Equation', subtopic: 'Assets = Liabilities + Capital (Equity), Users of accounting info', dayNumber: 1, periodNumber: 1, keyFormulaOrLaw: 'Assets = Liabilities + Capital (Equity) | Dual Aspect Principle', keyPoints: ['Conservatism: Anticipate no profit, provide for all possible losses', 'Accrual concept recognizes revenue when earned'], type: 'concept', importance: 'High-Yield' }
      ]
    }
  ];

  const businessStudiesChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Foundations of Business & Forms of Business Organisations',
      description: 'Sole Proprietorship, Partnership (Act 1932), Joint Stock Company, Business finance',
      microTopics: [
        { id: 'com_bst_1', topicTitle: 'Forms of Business Organisations & CSR Mandate', subtopic: 'Sole proprietorship, Partnership deed, Joint Stock Company, Section 135 CSR 2% rule', dayNumber: 1, periodNumber: 2, keyFormulaOrLaw: 'Features of Company: Separate Legal Entity, Perpetual Succession, Limited Liability', keyPoints: ['Sole proprietor has unlimited liability; Company shareholders have limited liability', 'Section 135 Companies Act 2013 mandates 2% CSR spending'], type: 'concept', importance: 'High-Yield' }
      ]
    }
  ];

  const economicsChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Introductory Microeconomics & Statistics for Economics',
      description: 'Law of Demand, Elasticity, Variable Proportions, Measures of Central Tendency (Mean, Median, Mode)',
      microTopics: [
        { id: 'com_eco_1', topicTitle: 'Consumer Equilibrium & Price Elasticity of Demand (Ed)', subtopic: 'Marginal utility, Indifference curve tangency MRS_xy = P_x / P_y, E_d formula', dayNumber: 1, periodNumber: 3, keyFormulaOrLaw: 'Price Elasticity of Demand E_d = - (Î”Q / Î”P) Ã— (P / Q) | Empirical: Mode = 3 Median - 2 Mean', keyPoints: ['Indifference curve is convex to origin due to diminishing MRS', 'Standard Deviation Ïƒ measures absolute dispersion'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  const subjects: SyllabusSubject[] = [
    { subjectId: 'cbse_acc', subjectName: 'Accountancy (Financial Accounting Part 1 & 2)', icon: '📊', color: '#10b981', totalChapters: accountancyChapters.length, totalMicroTopics: accountancyChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: accountancyChapters },
    { subjectId: 'cbse_bst', subjectName: 'Business Studies (Foundations & Finance)', icon: 'ðŸ’¼', color: '#06b6d4', totalChapters: businessStudiesChapters.length, totalMicroTopics: businessStudiesChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: businessStudiesChapters },
    { subjectId: 'cbse_eco', subjectName: 'Economics (Microeconomics & Statistics)', icon: 'ðŸ“ˆ', color: '#f59e0b', totalChapters: economicsChapters.length, totalMicroTopics: economicsChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: economicsChapters }
  ];

  return {
    courseId: courseId || 'cbse-11-com',
    courseTitle: courseTitle || 'Class 11 â€” Senior Secondary Commerce (NCERT / CBSE)',
    category: 'school_cbse',
    board: 'CBSE / NCERT / State Board',
    medium: 'English',
    totalDays: 200,
    totalSubjects: subjects.length,
    totalChapters: subjects.reduce((a, s) => a + (s.totalChapters || s.chapters.length), 0),
    totalMicroTopics: subjects.reduce((a, s) => a + (s.totalMicroTopics || s.chapters.reduce((acc, c) => acc + (c.microTopics?.length || 0), 0)), 0),
    subjects
  };
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 9B. HIGHER SECONDARY SCIENCE (+1 & +2 BIO-MATHS / COMPUTER SCIENCE)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function getHigherSecondaryScienceCompleteSyllabus(courseId: string, courseTitle: string): CourseFullSyllabus {
  const isTa = courseTitle.includes('தமிழ்') || courseId.includes('-ta-');

  const physicsChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: isTa ? 'à®¨à®¿à®²à¯ˆ à®®à®¿à®©à¯à®©à®¿à®¯à®²à¯ & à®®à®¿à®©à¯à®©à¯‹à®Ÿà¯à®Ÿà®µà®¿à®¯à®²à¯ (Electrostatics & Current Electricity)' : 'Electrostatics, Gauss Law & Current Electricity',
      description: isTa ? 'à®•à¯‚à®²à¯à®®à¯ à®µà®¿à®¤à®¿, à®•à®¾à®¸à¯ à®µà®¿à®¤à®¿, à®®à®¿à®©à¯à®¤à¯‡à®•à¯à®•à®¿, à®“à®®à¯ à®µà®¿à®¤à®¿, à®•à®¿à®°à¯à®•à¯à®•à®¾à®ƒà®ªà¯ à®µà®¿à®¤à®¿à®•à®³à¯ & à®µà¯€à®Ÿà¯à®¸à¯à®Ÿà¯‹à®©à¯ à®šà®®à®©à®šà¯à®šà¯à®±à¯à®±à¯' : 'Coulomb\'s Law, Gauss Law & applications, Capacitance & Dielectrics, Kirchhoff\'s Laws, Wheatstone Bridge & Potentiometer',
      microTopics: [
        { id: 'hsc_phy_1', topicTitle: isTa ? 'à®•à¯‚à®²à¯à®®à¯ à®µà®¿à®¤à®¿, à®•à®¾à®¸à¯ à®µà®¿à®¤à®¿ & à®®à®¿à®©à¯à®ªà¯à®²à®®à¯' : 'Coulomb Law, Electric Field & Gauss Theorem Applications', subtopic: isTa ? 'F = (1/4Ï€Îµâ‚€)(qâ‚qâ‚‚/rÂ²) à®®à®±à¯à®±à¯à®®à¯ à®•à®¾à®¸à¯ à®šà®®à®©à¯à®ªà®¾à®Ÿà¯à®•à®³à¯' : 'Electric dipole, Torque Ï„ = p Ã— E, Flux Î¦ = âˆ® EÂ·dA = q_enc / Îµâ‚€, Infinite line charge E = Î» / (2Ï€Îµâ‚€r)', dayNumber: 1, periodNumber: 1, keyFormulaOrLaw: 'Coulomb: F = (1/4Ï€Îµâ‚€)(qâ‚qâ‚‚/rÂ²) | Gauss: âˆ® EÂ·dA = q_in / Îµâ‚€ | Dipole Potential V = (1/4Ï€Îµâ‚€)(p cos Î¸ / rÂ²)', keyPoints: ['Electric field inside a hollow spherical conductor is zero (Electrostatic shielding)', 'Capacitance of parallel plate with dielectric: C = K Îµâ‚€ A / d'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'hsc_phy_2', topicTitle: isTa ? 'à®•à®¿à®°à¯à®•à¯à®•à®¾à®ƒà®ªà¯ à®µà®¿à®¤à®¿à®•à®³à¯, à®µà¯€à®Ÿà¯à®¸à¯à®Ÿà¯‹à®©à¯ à®ªà®¾à®²à®®à¯ & à®®à®¿à®©à¯à®©à®´à¯à®¤à¯à®¤à®®à®¾à®©à®¿' : 'Kirchhoff Laws, Wheatstone Bridge & Drift Velocity', subtopic: isTa ? 'à®®à®¿à®©à¯à®©à¯‹à®Ÿà¯à®Ÿ à®µà®¿à®¤à®¿ (KCL), à®®à®¿à®©à¯à®©à®´à¯à®¤à¯à®¤ à®µà®¿à®¤à®¿ (KVL) & P/Q = R/S' : 'Current density j = n e v_d, Kirchhoff Current & Voltage Laws, Wheatstone balanced condition P/Q = R/S, Internal resistance r = R(lâ‚/lâ‚‚ - 1)', dayNumber: 5, periodNumber: 1, keyFormulaOrLaw: 'Kirchhoff Loop: Î£ Î”V = 0 | Wheatstone: P/Q = R/S (Null deflection) | Drift Velocity v_d = eEÏ„ / m', keyPoints: ['KCL is based on conservation of charge; KVL is based on conservation of energy', 'Potentiometer draws no current at balance point, acting as an ideal voltmeter'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: isTa ? 'à®®à®¿à®©à¯à®•à®¾à®¨à¯à®¤à®µà®¿à®¯à®²à¯ & à®’à®³à®¿à®¯à®¿à®¯à®²à¯ (Magnetism, EMI, AC & Wave Optics)' : 'Magnetic Effects of Current, EMI, AC & Wave Optics',
      description: isTa ? 'à®ªà®¯à¯‹à®Ÿà¯-à®šà®¾à®µà®¾à®°à¯à®Ÿà¯ à®µà®¿à®¤à®¿, à®ƒà®ªà®¾à®°à®Ÿà¯‡ à®µà®¿à®¤à®¿, à®®à®¾à®±à¯à®¤à®¿à®šà¯ˆ à®®à®¿à®©à¯à®©à¯‹à®Ÿà¯à®Ÿà®®à¯ LCR à®šà¯à®±à¯à®±à¯, à®¹à¯ˆà®œà¯†à®©à¯à®¸à¯ à®¤à®¤à¯à®¤à¯à®µà®®à¯' : 'Biot-Savart Law, Ampere Circuital Law, Faraday & Lenz Laws, LCR Resonance, Huygens Principle, Young Double Slit Experiment',
      microTopics: [
        { id: 'hsc_phy_3', topicTitle: isTa ? 'à®ªà®¯à¯‹à®Ÿà¯-à®šà®¾à®µà®¾à®°à¯à®Ÿà¯ à®µà®¿à®¤à®¿, à®†à®®à¯à®ªà®¿à®¯à®°à¯ à®µà®¿à®¤à®¿ & à®²à®¾à®°à®©à¯à®¸à¯ à®µà®¿à®šà¯ˆ' : 'Biot-Savart Law, Ampere Circuital Law & Cyclotron Resonance', subtopic: isTa ? 'à®µà®Ÿà¯à®Ÿà®šà¯à®šà¯à®°à¯à®³à®¿à®©à¯ à®•à®¾à®¨à¯à®¤à®ªà¯à®ªà¯à®²à®®à¯ B = Î¼â‚€I/(2R) & F = q(v Ã— B)' : 'Magnetic field on circular coil axis B = Î¼â‚€ I RÂ² / [2(RÂ²+xÂ²)^(3/2)], Force on wire F = I(L Ã— B), Galvanometer to Ammeter/Voltmeter conversion', dayNumber: 9, periodNumber: 1, keyFormulaOrLaw: 'Biot-Savart: dB = (Î¼â‚€/4Ï€)(I dl sin Î¸ / rÂ²) | Lorentz Force F = q(E + v Ã— B) | Shunt Resistance S = I_g G / (I - I_g)', keyPoints: ['Parallel currents attract; antiparallel currents repel with force F/L = (Î¼â‚€ Iâ‚ Iâ‚‚) / (2Ï€d)', 'Converting Galvanometer to Ammeter requires low shunt resistance in parallel'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'hsc_phy_4', topicTitle: isTa ? 'à®®à®¿à®©à¯à®•à®¾à®¨à¯à®¤ à®¤à¯‚à®£à¯à®Ÿà®²à¯, LCR à®’à®¤à¯à®¤à®¤à®¿à®°à¯à®µà¯ & à®…à®²à¯ˆ à®’à®³à®¿à®¯à®¿à®¯à®²à¯ (YDSE)' : 'EMI (Faraday/Lenz), LCR Resonance & Young Double Slit (YDSE)', subtopic: isTa ? 'e = -dÎ¦/dt, à®’à®¤à¯à®¤à®¤à®¿à®°à¯à®µà¯ à®…à®¤à®¿à®°à¯à®µà¯†à®£à¯ f = 1/(2Ï€âˆšLC), à®ªà®Ÿà¯à®Ÿà¯ˆà®¯à®¿à®©à¯ à®…à®•à®²à®®à¯ Î² = Î»D/d' : 'Motional EMF e = Bvl, Quality factor Q = (1/R)âˆš(L/C), Wavefronts, Fringe width Î² = Î»D/d in interference, Brewster law Î¼ = tan i_p', dayNumber: 13, periodNumber: 1, keyFormulaOrLaw: 'Faraday Law: e = -N (dÎ¦/dt) | LCR Resonance: f_r = 1 / (2Ï€âˆšLC) | YDSE Fringe Width: Î² = Î» D / d', keyPoints: ['Lenz law is consistent with principle of conservation of energy', 'Diffraction central maximum angular width Î¸ = 2Î» / a'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  const chemistryChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: isTa ? 'à®•à®°à¯ˆà®šà®²à¯à®•à®³à¯, à®®à®¿à®©à¯à®µà¯‡à®¤à®¿à®¯à®¿à®¯à®²à¯ & à®µà¯‡à®¤à®¿à®µà®¿à®©à¯ˆ à®µà¯‡à®•à®µà®¿à®¯à®²à¯' : 'Solutions, Electrochemistry & Chemical Kinetics',
      description: isTa ? 'à®¹à¯†à®©à¯à®±à®¿ à®µà®¿à®¤à®¿, à®°à®µà¯à®²à¯à®Ÿà¯ à®µà®¿à®¤à®¿, à®¨à¯†à®°à¯à®©à¯à®¸à¯à®Ÿà¯ à®šà®®à®©à¯à®ªà®¾à®Ÿà¯, à®®à¯à®¤à®²à¯ à®µà®•à¯ˆ à®µà®¿à®©à¯ˆ à®šà®®à®©à¯à®ªà®¾à®Ÿà¯' : 'Raoult\'s Law, Colligative Properties (Van\'t Hoff factor), Nernst Equation, Kohlrausch Law, Integrated Rate Law for 1st Order Reactions',
      microTopics: [
        { id: 'hsc_ch_1', topicTitle: isTa ? 'à®°à®µà¯à®²à¯à®Ÿà¯ à®µà®¿à®¤à®¿, à®šà®µà¯à®µà¯‚à®Ÿà¯à®ªà®°à®µà®²à¯ à®…à®´à¯à®¤à¯à®¤à®®à¯ & à®µà®¾à®£à¯à®Ÿà¯ à®¹à®¾à®ƒà®ªà¯ à®•à®¾à®°à®£à®¿' : 'Raoult Law, Colligative Properties & Van\'t Hoff Factor (i)', subtopic: isTa ? 'Î”T_b = K_b m, Î”T_f = K_f m, Ï€ = iCRT à®šà®®à®©à¯à®ªà®¾à®Ÿà¯à®•à®³à¯' : 'Relative lowering of vapour pressure (pÂ°-p)/pÂ° = x_B, Elevation in boiling point, Depression in freezing point, Abnormal molar mass i = 1 + (n-1)Î±', dayNumber: 2, periodNumber: 2, keyFormulaOrLaw: 'Raoult Law: p_A = pÂ°_A x_A | Osmotic Pressure: Ï€ = i C R T | Van\'t Hoff: i = Normal Molar Mass / Abnormal Molar Mass', keyPoints: ['Colligative properties depend only on number of solute particles, not on their identity', 'For association of molecules, i < 1; for dissociation (electrolytes), i > 1'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'hsc_ch_2', topicTitle: isTa ? 'à®®à®¿à®©à¯à®µà¯‡à®¤à®¿à®¯à®¿à®¯à®²à¯: à®¨à¯†à®°à¯à®©à¯à®¸à¯à®Ÿà¯ à®šà®®à®©à¯à®ªà®¾à®Ÿà¯ & à®®à¯à®¤à®²à¯ à®µà®•à¯ˆ à®µà®¿à®©à¯ˆ à®šà®®à®©à¯à®ªà®¾à®Ÿà¯' : 'Nernst Equation, Kohlrausch Law & Integrated Rate Equations', subtopic: isTa ? 'E_cell = EÂ° - (0.0591/n)log Q, k = (2.303/t)log([Aâ‚€]/[A])' : 'Electrochemical cell EMF, Standard Hydrogen Electrode (SHE), Kohlrausch law of independent migration of ions, Half-life t_Â½ = 0.693 / k, Arrhenius equation', dayNumber: 6, periodNumber: 2, keyFormulaOrLaw: 'Nernst: E_cell = EÂ°_cell - (0.0591/n) log Q | First Order Rate: k = (2.303/t) log([A]â‚€/[A]) | t_Â½ = 0.693 / k', keyPoints: ['Gibbs Free Energy and EMF relation: Î”GÂ° = -n F EÂ°_cell', 'Half-life of first-order reaction is completely independent of initial reactant concentration'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: isTa ? 'à®…à®£à¯ˆà®µà¯à®šà¯ à®šà¯‡à®°à¯à®®à®™à¯à®•à®³à¯ & à®•à®°à®¿à®® à®µà¯‡à®¤à®¿à®¯à®¿à®¯à®²à¯ (à®†à®²à¯à®•à®¹à®¾à®²à¯à®•à®³à¯, à®†à®²à¯à®Ÿà®¿à®¹à¯ˆà®Ÿà¯à®•à®³à¯)' : 'Coordination Compounds & Organic Reaction Mechanisms',
      description: isTa ? 'à®µà¯†à®°à¯à®©à®°à¯ à®•à¯Šà®³à¯à®•à¯ˆ, à®ªà®Ÿà®¿à®•à®ªà¯à®ªà¯à®²à®•à¯ à®•à¯Šà®³à¯à®•à¯ˆ (CFT), SN1/SN2 à®µà®¿à®©à¯ˆà®•à®³à¯, à®†à®²à¯à®Ÿà®¾à®²à¯ à®•à¯à®±à¯à®•à¯à®•à®®à¯ & à®•à¯‡à®©à®¿à®šà®°à¯‹ à®µà®¿à®©à¯ˆ' : 'IUPAC naming of complexes, Crystal Field Splitting (Î”_o & Î”_t), SN1 vs SN2 kinetics, Aldol condensation, Cannizzaro reaction, Diazonium salts',
      microTopics: [
        { id: 'hsc_ch_3', topicTitle: isTa ? 'à®…à®£à¯ˆà®µà¯à®šà¯ à®šà¯‡à®°à¯à®®à®™à¯à®•à®³à¯: à®µà¯†à®°à¯à®©à®°à¯ à®•à¯Šà®³à¯à®•à¯ˆ & à®ªà®Ÿà®¿à®•à®ªà¯à®ªà¯à®²à®•à¯ à®•à¯Šà®³à¯à®•à¯ˆ (CFT)' : 'Coordination Chemistry: CFT Splitting & IUPAC Nomenclature', subtopic: isTa ? 'à®†à®•à¯à®Ÿà®¾à®¹à¯†à®Ÿà¯à®°à®²à¯ tâ‚‚g - e_g à®ªà®¿à®³à®ªà¯à®ªà¯, à®•à®¾à®¨à¯à®¤à®¤à¯à®¤à®©à¯à®®à¯ˆ, à®¸à¯à®ªà¯†à®•à¯à®Ÿà¯à®°à¯‹à®•à¯†à®®à®¿à®•à¯à®•à®²à¯ à®µà®°à®¿à®šà¯ˆ' : 'Primary & secondary valency, Crystal field splitting energy Î”_o, Strong vs weak field ligands, High-spin vs Low-spin configurations, Magnetic moment Î¼ = âˆš[n(n+2)] BM', dayNumber: 10, periodNumber: 2, keyFormulaOrLaw: 'Magnetic Moment: Î¼ = âˆš[n(n+2)] BM (Bohr Magnetons) | CFT Splitting: Octahedral Î”_o (tâ‚‚gÂ³ e_gÂ²)', keyPoints: ['Strong field ligands (CNâ», CO) cause electron pairing and large CFSE Î”_o', 'Chelate complexes are more stable than non-chelate complexes due to entropy increase'], type: 'concept', importance: 'High-Yield' },
        { id: 'hsc_ch_4', topicTitle: isTa ? 'à®•à®°à®¿à®® à®µà¯‡à®¤à®¿à®¯à®¿à®¯à®²à¯: SN1/SN2 à®µà®¿à®©à¯ˆà®•à®³à¯, à®†à®²à¯à®Ÿà®¾à®²à¯ à®•à¯à®±à¯à®•à¯à®•à®®à¯ & à®•à¯‡à®©à®¿à®šà®°à¯‹' : 'Organic Mechanisms: SN1/SN2, Aldol, Cannizzaro & Diazotization', subtopic: isTa ? 'à®•à®¾à®°à¯à®ªà¯‹à®•à¯‡à®·à®©à¯ à®‡à®Ÿà¯ˆà®¨à®¿à®²à¯ˆ, à®¤à®²à¯ˆà®•à¯€à®´à¯ à®…à®®à¯ˆà®ªà¯à®ªà¯, à®†à®²à¯à®ªà®¾-à®¹à¯ˆà®Ÿà¯à®°à®œà®©à¯ à®µà®¿à®©à¯ˆà®•à®³à¯' : 'Nucleophilic substitution kinetics (SN1 two-step vs SN2 concerted Walden inversion), Aldol condensation with Î±-H, Cannizzaro disproportionation without Î±-H, Sandmeyer reaction', dayNumber: 14, periodNumber: 2, keyFormulaOrLaw: 'SN2: Rate = k[R-X][Nuâ»] (Walden Inversion) | SN1: Rate = k[R-X] (Carbocation intermediate, Racemization)', keyPoints: ['Tertiary alkyl halides undergo SN1 due to carbocation stability (3Â° > 2Â° > 1Â°)', 'Aldehydes with no Î±-hydrogen (Formaldehyde, Benzaldehyde) undergo Cannizzaro reaction'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  const mathematicsChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: isTa ? 'à®…à®£à®¿à®•à®³à¯, à®…à®£à®¿à®•à¯à®•à¯‹à®µà¯ˆà®•à®³à¯ & à®µà®•à¯ˆ à®¨à¯à®£à¯à®•à®£à®¿à®¤à®®à¯' : 'Matrices, Determinants & Differential Calculus',
      description: isTa ? 'à®…à®£à®¿à®¯à®¿à®©à¯ à®¨à¯‡à®°à¯à®®à®¾à®±à¯ Aâ»Â¹ = (1/|A|)adj(A), à®¤à¯Šà®Ÿà®°à¯à®šà¯à®šà®¿ à®®à®±à¯à®±à¯à®®à¯ à®µà®•à¯ˆà®¯à®¿à®Ÿà¯à®¤à®²à¯, à®Žà®²à¯à®²à¯ˆà®•à®³à¯' : 'Matrix inversion, Cramer\'s Rule, Continuity & Differentiability, Chain rule, Maxima & Minima (Second derivative test)',
      microTopics: [
        { id: 'hsc_m_1', topicTitle: isTa ? 'à®…à®£à®¿à®•à®³à¯ & à®…à®£à®¿à®•à¯à®•à¯‹à®µà¯ˆà®•à®³à¯: à®¨à¯‡à®°à¯à®®à®¾à®±à¯ à®®à®±à¯à®±à¯à®®à¯ à®•à®¿à®°à®¾à®®à®°à®¿à®©à¯ à®µà®¿à®¤à®¿' : 'Matrices & Determinants: Inverse Aâ»Â¹ & System of Linear Equations', subtopic: isTa ? 'Aâ»Â¹ = (1/|A|) adj A à®®à®±à¯à®±à¯à®®à¯ AX = B à®¤à¯€à®°à¯à®µà¯ à®®à¯à®±à¯ˆ' : 'Properties of determinants, Adjoint of square matrix, Solution of non-homogeneous linear systems using matrix method and Cramer\'s rule', dayNumber: 3, periodNumber: 3, keyFormulaOrLaw: 'Matrix Inverse: Aâ»Â¹ = (1 / |A|) adj(A) | Product: A Â· adj(A) = |A| I_n | System: X = Aâ»Â¹ B', keyPoints: ['A square matrix A is invertible if and only if |A| â‰  0 (Non-singular matrix)', '|adj(A)| = |A|^(n-1) for a matrix of order n'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'hsc_m_2', topicTitle: isTa ? 'à®µà®•à¯ˆ à®¨à¯à®£à¯à®•à®£à®¿à®¤à®®à¯: à®ªà¯†à®°à¯à®®à®®à¯ à®®à®±à¯à®±à¯à®®à¯ à®šà®¿à®±à¯à®®à®®à¯ (Maxima & Minima)' : 'Calculus: Derivatives, Mean Value Theorems & Maxima/Minima', subtopic: isTa ? 'dy/dx = 0 à®ªà¯à®³à¯à®³à®¿à®•à®³à¯, dÂ²y/dxÂ² à®šà¯‹à®¤à®©à¯ˆ à®®à®±à¯à®±à¯à®®à¯ à®¤à¯Šà®Ÿà®°à¯ à®ªà¯†à®°à¯à®•à¯à®•à®®à¯' : 'Rolle\'s & Lagrange\'s Mean Value Theorems, Tangents & Normals slope m = dy/dx, Critical points, Second derivative test for local maxima/minima', dayNumber: 7, periodNumber: 3, keyFormulaOrLaw: 'Maxima Condition: f\'(x) = 0 and f\'\'(x) < 0 | Minima Condition: f\'(x) = 0 and f\'\'(x) > 0 | Chain Rule: d/dx[f(g(x))] = f\'(g(x)) Â· g\'(x)', keyPoints: ['If f\'\'(x) = 0 at critical point, use higher derivative test or first derivative sign test', 'Slope of normal to curve at (xâ‚, yâ‚) is -1 / (dy/dx)_(xâ‚,yâ‚)'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: isTa ? 'à®¤à¯Šà®•à¯ˆ à®¨à¯à®£à¯à®•à®£à®¿à®¤à®®à¯, à®¤à®¿à®šà¯ˆà®¯à®©à¯à®•à®³à¯ & à®¨à®¿à®•à®´à¯à®¤à®•à®µà¯' : 'Integral Calculus, Vectors, 3D Geometry & Probability',
      description: isTa ? 'à®ªà®•à¯à®¤à®¿à®ªà¯ à®ªà®¿à®©à¯à®©à®™à¯à®•à®³à¯ à®®à¯‚à®²à®®à¯ à®¤à¯Šà®•à¯ˆà®¯à®¿à®Ÿà®²à¯, à®ªà¯†à®°à¯à®©à¯‹à®²à®¿ à®šà¯‚à®¤à¯à®¤à®¿à®°à®®à¯, à®¤à®¿à®šà¯ˆà®¯à®©à¯ à®ªà¯†à®°à¯à®•à¯à®•à®²à¯, à®ªà¯‡à®¯à®¸à¯ à®¤à¯‡à®±à¯à®±à®®à¯' : 'Integration by parts âˆ«u dv = uv - âˆ«v du, Definite integral properties, Dot and Cross products, Shortest distance between skew lines, Bayes\' Theorem',
      microTopics: [
        { id: 'hsc_m_3', topicTitle: isTa ? 'à®¤à¯Šà®•à¯ˆ à®¨à¯à®£à¯à®•à®£à®¿à®¤à®®à¯: à®ªà®•à¯à®¤à®¿ à®¤à¯Šà®•à¯ˆà®¯à®¿à®Ÿà®²à¯ & à®•à¯à®±à®¿à®ªà¯à®ªà®¿à®Ÿà¯à®Ÿ à®¤à¯Šà®•à¯ˆà®¯à¯€à®Ÿà¯à®•à®³à¯' : 'Integral Calculus: Integration by Parts & Definite Properties', subtopic: isTa ? 'âˆ« u dv = uv - âˆ« v du à®®à®±à¯à®±à¯à®®à¯ âˆ«â‚€áµƒ f(x)dx = âˆ«â‚€áµƒ f(a-x)dx' : 'Integration by substitution, partial fractions, Integration by parts ILATE rule, Definite integrals king property âˆ«â‚€áµƒ f(x)dx = âˆ«â‚€áµƒ f(a-x)dx, Area under curve', dayNumber: 11, periodNumber: 3, keyFormulaOrLaw: 'By Parts: âˆ« u v dx = u âˆ«v dx - âˆ«[u\' (âˆ«v dx)] dx | King Property: âˆ«â‚€áµƒ f(x) dx = âˆ«â‚€áµƒ f(a - x) dx', keyPoints: ['ILATE priority for choosing u: Inverse, Logarithmic, Algebraic, Trigonometric, Exponential', 'Area between curve y = f(x) and x-axis from a to b = âˆ«â‚áµ‡ |f(x)| dx'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'hsc_m_4', topicTitle: isTa ? 'à®¤à®¿à®šà¯ˆà®¯à®©à¯à®•à®³à¯ (Vectors), à®®à¯à®ªà¯à®ªà®°à®¿à®®à®¾à®£ à®µà®Ÿà®¿à®µà®¿à®¯à®²à¯ & à®ªà¯‡à®¯à®¸à¯ à®¤à¯‡à®±à¯à®±à®®à¯' : 'Vectors, 3D Geometry (Skew Lines) & Bayes Theorem', subtopic: isTa ? 'a Â· b = |a||b|cos Î¸, a Ã— b, à®•à¯‹à®Ÿà¯à®•à®³à¯à®•à¯à®•à¯ à®‡à®Ÿà¯ˆà®ªà¯à®ªà®Ÿà¯à®Ÿ à®®à¯€à®šà¯à®šà®¿à®±à¯ à®¤à¯Šà®²à¯ˆà®µà¯, à®¨à®¿à®ªà®¨à¯à®¤à®©à¯ˆ à®¨à®¿à®•à®´à¯à®¤à®•à®µà¯' : 'Scalar triple product [a b c], Vector cross product, Shortest distance d = |(aâ‚‚-aâ‚)Â·(bâ‚Ã—bâ‚‚)| / |bâ‚Ã—bâ‚‚|, Conditional probability P(A|B), Bayes\' Theorem calculation', dayNumber: 15, periodNumber: 3, keyFormulaOrLaw: 'Dot Product: a Â· b = aâ‚bâ‚ + aâ‚‚bâ‚‚ + aâ‚ƒbâ‚ƒ | Cross Product: |a Ã— b| = |a||b| sin Î¸ | Bayes: P(A_i|B) = [P(A_i)P(B|A_i)] / Î£[P(A_j)P(B|A_j)]', keyPoints: ['Two non-zero vectors a and b are perpendicular if and only if a Â· b = 0', 'Shortest distance between two parallel lines r = aâ‚ + Î»b and r = aâ‚‚ + Î¼b is |b Ã— (aâ‚‚ - aâ‚)| / |b|'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  const generalTamilChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'à®‡à®¯à®²à¯ 1: à®®à¯Šà®´à®¿ & à®šà¯†à®¯à¯à®¯à¯à®³à¯ (à®¤à®©à¯à®©à¯‡à®°à¯ à®‡à®²à®¾à®¤ à®¤à®®à®¿à®´à¯ & à®¤à®®à®¿à®´à®¾à®¯à¯ à®Žà®´à¯à®¤à¯à®µà¯‹à®®à¯)',
      description: 'à®¤à®£à¯à®Ÿà®¿à®¯à®²à®™à¯à®•à®¾à®° à®‰à®°à¯ˆ à®®à¯‡à®±à¯à®•à¯‹à®³à¯ à®ªà®¾à®Ÿà®²à¯, à®ªà®¿à®´à¯ˆà®¯à®¿à®©à¯à®±à®¿à®¤à¯ à®¤à®®à®¿à®´à®¿à®²à¯ à®Žà®´à¯à®¤à¯à®®à¯ à®®à¯à®±à¯ˆà®•à®³à¯, à®Žà®´à¯à®¤à¯à®¤à¯à®šà¯ à®šà¯€à®°à¯à®¤à®¿à®°à¯à®¤à¯à®¤à®®à¯',
      subtopics: [
        {
          id: 'hsc_t_sub1',
          title: 'à®¤à®©à¯à®©à¯‡à®°à¯ à®‡à®²à®¾à®¤ à®¤à®®à®¿à®´à¯ & à®¤à®®à®¿à®´à¯ à®Žà®´à¯à®¤à¯à®¤à¯ à®®à¯à®±à¯ˆà®®à¯ˆ',
          microTopics: [
            { id: 'hsc_t_1', title: 'à®¤à®©à¯à®©à¯‡à®°à¯ à®‡à®²à®¾à®¤ à®¤à®®à®¿à®´à¯ (à®¤à®£à¯à®Ÿà®¿à®¯à®²à®™à¯à®•à®¾à®°à®®à¯) â€” à®šà¯†à®¨à¯à®¤à®®à®¿à®´à®¿à®©à¯ à®¤à®©à®¿à®šà¯à®šà®¿à®±à®ªà¯à®ªà¯', keyAxiom: 'à®“à®™à¯à®•à®²à®¿à®Ÿà¯ˆ à®µà®¨à¯à®¤à¯ à®‰à®¯à®°à¯à®¨à¯à®¤à¯‹à®°à¯ à®¤à¯Šà®´ à®µà®¿à®³à®™à¯à®•à®¿ à®à®™à¯à®•à¯Šà®²à®¿ à®¨à¯€à®°à¯ à®žà®¾à®²à®¤à¯à®¤à¯ à®‡à®°à¯à®³à®•à®±à¯à®±à¯à®®à¯ à®šà¯†à®¨à¯à®¤à®®à®¿à®´à¯' },
            { id: 'hsc_t_2', title: 'à®¤à®®à®¿à®´à®¾à®¯à¯ à®Žà®´à¯à®¤à¯à®µà¯‹à®®à¯ â€” à®µà®²à¯à®²à®¿à®©à®®à¯ à®®à®¿à®•à¯à®®à¯ à®‡à®Ÿà®™à¯à®•à®³à¯ & à®®à®¿à®•à®¾ à®‡à®Ÿà®™à¯à®•à®³à¯', keyAxiom: 'à®•à¯, à®šà¯, à®¤à¯, à®ªà¯ à®šà®¨à¯à®¤à®¿à®ªà¯à®ªà®¿à®´à¯ˆà®•à®³à¯ à®¨à¯€à®•à¯à®•à®¿ à®Žà®´à¯à®¤à¯à®¤à®²à¯' }
          ]
        }
      ],
      microTopics: [
        { id: 'hsc_t_1', topicTitle: 'à®¤à®©à¯à®©à¯‡à®°à¯ à®‡à®²à®¾à®¤ à®¤à®®à®¿à®´à¯ & à®µà®²à¯à®²à®¿à®©à®®à¯ à®®à®¿à®•à¯à®®à¯ / à®®à®¿à®•à®¾ à®‡à®Ÿà®™à¯à®•à®³à¯', subtopic: 'à®¤à®£à¯à®Ÿà®¿à®¯à®²à®™à¯à®•à®¾à®° à®¨à®¯à®®à¯ & à®šà®¨à¯à®¤à®¿à®ªà¯ à®ªà®¿à®´à¯ˆà®•à®³à¯ à®¨à¯€à®•à¯à®•à¯à®¤à®²à¯', dayNumber: 1, periodNumber: 1, keyFormulaOrLaw: 'à®¤à®£à¯à®Ÿà®¿à®¯à®²à®™à¯à®•à®¾à®°à®®à¯: à®“à®™à¯à®•à®²à®¿à®Ÿà¯ˆ à®µà®¨à¯à®¤à¯ à®‰à®¯à®°à¯à®¨à¯à®¤à¯‹à®°à¯ à®¤à¯Šà®´ à®µà®¿à®³à®™à¯à®•à®¿ | à®µà®²à¯à®²à®¿à®©à®®à¯: à®…à®¨à¯à®¤, à®‡à®¨à¯à®¤, à®Žà®¨à¯à®¤ à®ªà®¿à®©à¯ à®®à®¿à®•à¯à®®à¯', keyPoints: ['à®…à®£à®¿ à®‡à®²à®•à¯à®•à®£à®¤à¯à®¤à¯ˆ à®®à®Ÿà¯à®Ÿà¯à®®à¯‡ à®•à¯‚à®±à¯à®®à¯ à®¨à¯‚à®²à¯ à®¤à®£à¯à®Ÿà®¿à®¯à®²à®™à¯à®•à®¾à®°à®®à¯', 'à®µà®Ÿà®®à¯Šà®´à®¿à®¯à®¿à®²à¯ à®‰à®³à¯à®³ à®•à®¾à®µà®¿à®¯ à®¤à®°à¯à®šà®®à¯ à®¨à¯‚à®²à¯ˆà®¤à¯ à®¤à®´à¯à®µà®¿ à®Žà®´à¯à®¤à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯'], type: 'concept', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'à®‡à®¯à®²à¯ 2: à®‡à®¯à®±à¯à®•à¯ˆ & à®µà¯‡à®³à®¾à®£à¯à®®à¯ˆ (à®¤à®¿à®°à¯à®®à®²à¯ˆ à®®à¯à®°à¯à®•à®©à¯ à®ªà®³à¯à®³à¯ & à®à®™à¯à®•à¯à®±à¯à®¨à¯‚à®±à¯)',
      description: 'à®ªà¯†à®°à®¿à®¯à®µà®©à¯ à®•à®µà®¿à®°à®¾à®¯à®°à¯ à®¤à®¿à®°à¯à®®à®²à¯ˆ à®®à¯à®°à¯à®•à®©à¯ à®ªà®³à¯à®³à¯, à®ªà¯‡à®¯à®©à®¾à®°à¯ à®à®™à¯à®•à¯à®±à¯à®¨à¯‚à®±à¯, à®¨à®¾à®²à¯à®µà®•à¯ˆà®ªà¯ à®ªà¯Šà®°à¯à®¤à¯à®¤à®™à¯à®•à®³à¯ (à®¤à®¿à®£à¯ˆ, à®ªà®¾à®²à¯, à®Žà®£à¯, à®‡à®Ÿà®®à¯)',
      subtopics: [
        {
          id: 'hsc_t_sub2',
          title: 'à®ªà®³à¯à®³à¯ à®‡à®²à®•à¯à®•à®¿à®¯à®®à¯ & à®à®™à¯à®•à¯à®±à¯à®¨à¯‚à®±à¯',
          microTopics: [
            { id: 'hsc_t_3', title: 'à®¤à®¿à®°à¯à®®à®²à¯ˆ à®®à¯à®°à¯à®•à®©à¯ à®ªà®³à¯à®³à¯ (à®ªà¯†à®°à®¿à®¯à®µà®©à¯ à®•à®µà®¿à®°à®¾à®¯à®°à¯) â€” à®‰à®´à®µà¯à®šà¯ à®šà®¿à®±à®ªà¯à®ªà¯', keyAxiom: 'à®ªà®³à¯à®³à¯ à®Žà®©à¯à®ªà®¤à¯ 96 à®µà®•à¯ˆ à®šà®¿à®±à¯à®±à®¿à®²à®•à¯à®•à®¿à®¯à®™à¯à®•à®³à¯à®³à¯ à®’à®©à¯à®±à¯ (à®‰à®´à®¤à¯à®¤à®¿à®ªà¯ à®ªà®¾à®Ÿà¯à®Ÿà¯)' },
            { id: 'hsc_t_4', title: 'à®à®™à¯à®•à¯à®±à¯à®¨à¯‚à®±à¯ (à®®à¯à®²à¯à®²à¯ˆà®¤à¯à®¤à®¿à®£à¯ˆ â€” à®ªà¯‡à®¯à®©à®¾à®°à¯) & à®¨à®¾à®²à¯à®µà®•à¯ˆà®ªà¯ à®ªà¯Šà®°à¯à®¤à¯à®¤à®™à¯à®•à®³à¯', keyAxiom: 'à®à®™à¯à®•à¯à®±à¯à®¨à¯‚à®±à¯ 3 à®…à®Ÿà®¿ à®®à¯à®¤à®²à¯ 6 à®…à®Ÿà®¿ à®µà®°à¯ˆà®¯à®¿à®²à®¾à®© à®•à¯à®±à¯ˆà®¨à¯à®¤ à®…à®•à®µà®±à¯à®ªà®¾à®•à¯à®•à®³à¯ à®•à¯Šà®£à¯à®Ÿ à®¨à¯‚à®²à¯' }
          ]
        }
      ],
      microTopics: [
        { id: 'hsc_t_3', topicTitle: 'à®¤à®¿à®°à¯à®®à®²à¯ˆ à®®à¯à®°à¯à®•à®©à¯ à®ªà®³à¯à®³à¯ & à®¨à®¾à®²à¯à®µà®•à¯ˆà®ªà¯ à®ªà¯Šà®°à¯à®¤à¯à®¤à®™à¯à®•à®³à¯ à®‡à®²à®•à¯à®•à®£à®®à¯', subtopic: 'à®‰à®´à®µà¯ à®¨à®¾à®•à®°à®¿à®•à®®à¯ à®®à®±à¯à®±à¯à®®à¯ à®¤à®¿à®£à¯ˆ, à®ªà®¾à®²à¯, à®Žà®£à¯, à®‡à®Ÿà®ªà¯ à®ªà¯Šà®°à¯à®¤à¯à®¤à®™à¯à®•à®³à¯', dayNumber: 4, periodNumber: 1, keyFormulaOrLaw: 'à®ªà®³à¯à®³à¯ à®‡à®²à®•à¯à®•à®¿à®¯à®®à¯: à®‰à®´à®µà®°à¯ à®µà®¾à®´à¯à®•à¯à®•à¯ˆà®¯à¯ˆà®šà¯ à®šà®¿à®¤à¯à®¤à®°à®¿à®•à¯à®•à¯à®®à¯ à®‰à®³à®¤à¯à®¤à®¿à®ªà¯ à®ªà®¾à®Ÿà¯à®Ÿà¯ | à®à®™à¯à®•à¯à®±à¯à®¨à¯‚à®±à¯: 500 à®…à®•à®µà®±à¯à®ªà®¾à®•à¯à®•à®³à¯', keyPoints: ['à®à®™à¯à®•à¯à®±à¯à®¨à¯‚à®±à¯à®±à¯ˆà®¤à¯ à®¤à¯Šà®•à¯à®¤à¯à®¤à®µà®°à¯ à®ªà¯à®²à®¤à¯à®¤à¯à®±à¯ˆ à®®à¯à®±à¯à®±à®¿à®¯ à®•à¯‚à®Ÿà®²à¯‚à®°à¯ à®•à®¿à®´à®¾à®°à¯', 'à®¤à¯Šà®•à¯à®ªà¯à®ªà®¿à®¤à¯à®¤à®µà®°à¯ à®¯à®¾à®©à¯ˆà®•à®Ÿà¯à®šà¯‡à®¯à¯ à®®à®¾à®¨à¯à®¤à®°à®žà¯à®šà¯‡à®°à®²à¯ à®‡à®°à¯à®®à¯à®ªà¯Šà®±à¯ˆ'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  const generalEnglishChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Unit 1: Prose (*Two Gentlemen of Verona*) & Poem (*The Castle*)',
      description: 'A.J. Cronin inspirational story of Nicola and Jacopo, Edwin Muir allegorical poem "The Castle", Tenses & Modal Auxiliaries',
      subtopics: [
        {
          id: 'hsc_e_sub1',
          title: 'Unit 1: Selfless Devotion & Treachery',
          microTopics: [
            { id: 'hsc_e_1', title: 'Prose: Two Gentlemen of Verona by A.J. Cronin', keyAxiom: 'Nicola and Jacopo\'s sacrifice for their sister Lucia tuberculosis treatment' },
            { id: 'hsc_e_2', title: 'Poem: The Castle by Edwin Muir & The Warder\'s Betrayal', keyAxiom: 'Physical fortress fell not to weapons, but to greed of a wicked gatekeeper' }
          ]
        }
      ],
      microTopics: [
        { id: 'hsc_e_1', topicTitle: 'Unit 1: Two Gentlemen of Verona & The Castle (A.J. Cronin & Edwin Muir)', subtopic: 'Sacrifice, War devastation, Betrayal & Modal Auxiliaries (ought to, used to)', dayNumber: 2, periodNumber: 2, keyFormulaOrLaw: 'A.J. Cronin: "War produced suffering, but their selfless devotion gave promise of greater hope for human society."', keyPoints: ['Verona is a historical city in Italy where Romeo and Juliet lived', 'The Castle theme: Greed and betrayal undermine the strongest fortifications'], type: 'concept', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Unit 2: Prose (*A Nice Cup of Tea*) & Poem (*Our Casuarina Tree*)',
      description: 'George Orwell\'s 11 rules for preparing tea, Toru Dutt romantic poem "Our Casuarina Tree", Prepositions & Compound Words',
      subtopics: [
        {
          id: 'hsc_e_sub2',
          title: 'Unit 2: Cultural Rituals & Nostalgia',
          microTopics: [
            { id: 'hsc_e_3', title: 'Prose: A Nice Cup of Tea by George Orwell (11 Golden Rules)', keyAxiom: 'Indian/Ceylonese tea in a teapot without sugar gives pure flavour' },
            { id: 'hsc_e_4', title: 'Poem: Our Casuarina Tree by Toru Dutt (Keatsian imagery)', keyAxiom: 'Tree stands as a living memorial to poet\'s beloved departed siblings Abju and Aru' }
          ]
        }
      ],
      microTopics: [
        { id: 'hsc_e_3', topicTitle: 'Unit 2: George Orwell Cup of Tea & Toru Dutt Casuarina Tree', subtopic: '11 Rules of tea brewing, Casuarina nostalgia & Compound Word synthesis', dayNumber: 5, periodNumber: 2, keyFormulaOrLaw: 'Toru Dutt: "A creeper climbs, in whose embraces bound, No other tree could live..."', keyPoints: ['George Orwell was the pen name of Eric Arthur Blair (author of 1984 and Animal Farm)', 'Toru Dutt is known as the Keats of Indo-Anglian literature'], type: 'memorization', importance: 'High-Yield' }
      ]
    }
  ];

  const subjects: SyllabusSubject[] = [
    { subjectId: 'hsc_tamil', subjectName: 'à®ªà¯Šà®¤à¯à®¤à¯ à®¤à®®à®¿à®´à¯ (General Tamil â€” HSC 8 à®‡à®¯à®²à¯à®•à®³à¯)', icon: '🔤', color: '#ec4899', totalChapters: generalTamilChapters.length, totalMicroTopics: generalTamilChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: generalTamilChapters },
    { subjectId: 'hsc_english', subjectName: 'General English (HSC Units 1 to 6 Core)', icon: '🔤', color: '#3b82f6', totalChapters: generalEnglishChapters.length, totalMicroTopics: generalEnglishChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: generalEnglishChapters },
    { subjectId: 'hsc_physics', subjectName: isTa ? 'à®‡à®¯à®±à¯à®ªà®¿à®¯à®²à¯ (Physics Core â€” HSC / Board)' : 'Physics (Senior Secondary Core)', icon: '⚡', color: '#06b6d4', totalChapters: physicsChapters.length, totalMicroTopics: physicsChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: physicsChapters },
    { subjectId: 'hsc_chemistry', subjectName: isTa ? 'à®µà¯‡à®¤à®¿à®¯à®¿à®¯à®²à¯ (Chemistry Core â€” HSC / Board)' : 'Chemistry (Senior Secondary Core)', icon: 'ðŸ§ª', color: '#10b981', totalChapters: chemistryChapters.length, totalMicroTopics: chemistryChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: chemistryChapters },
    { subjectId: 'hsc_mathematics', subjectName: isTa ? 'à®•à®£à®¿à®¤à®®à¯ (Mathematics Core â€” HSC / Board)' : 'Mathematics (Senior Secondary Calculus & Vectors)', icon: 'ðŸ“', color: '#f59e0b', totalChapters: mathematicsChapters.length, totalMicroTopics: mathematicsChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: mathematicsChapters }
  ];

  return {
    courseId: courseId || 'tnsb-12-sci',
    courseTitle: courseTitle || 'Class 12 â€” Higher Secondary Science & Maths Master Program',
    category: 'school_hsc',
    board: 'TNSB / CBSE / ISC',
    medium: isTa ? 'Tamil' : 'English',
    totalDays: 200,
    totalSubjects: subjects.length,
    totalChapters: subjects.reduce((a, s) => a + s.chapters.length, 0),
    totalMicroTopics: subjects.reduce((a, s) => a + (s.totalMicroTopics || s.chapters.reduce((acc, c) => acc + (c.microTopics?.length || 0), 0)), 0),
    subjects
  };
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 9C. COLLEGE DEGREES & PROFESSIONAL TECH SKILLS (FULL-STACK, PYTHON, DSA, AI)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function getCollegeAndTechSkillsCompleteSyllabus(courseId: string, courseTitle: string): CourseFullSyllabus {
  const fullstackChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Frontend Engineering: React 19, TypeScript & Modern UI Architecture',
      description: 'React components, JSX, Custom Hooks (useState, useEffect, useMemo, useCallback), Context API, React Navigation & TailwindCSS',
      subtopics: [
        {
          id: 'tech_fs_sub1',
          title: 'React 19 Core & Hook Architecture',
          microTopics: [
            { id: 'tech_fs_1', title: 'React 19 Virtual DOM, Fiber Reconciliation & Custom Hooks', keyAxiom: 'Hooks must execute unconditionally at component top level' },
            { id: 'tech_fs_2', title: 'TypeScript Interfaces, Generics & Strict Null Typing', keyAxiom: 'Generics <T> allow reusable type-safe data pipelines' }
          ]
        }
      ],
      microTopics: [
        { id: 'tech_fs_1', topicTitle: 'Modern React Architecture: Virtual DOM, Hooks & State Management', subtopic: 'Functional components, Reconciliation algorithm, Custom Hooks creation, Context API vs Redux Toolkit', dayNumber: 1, periodNumber: 1, keyFormulaOrLaw: 'React Hook Rule: Only call hooks at the top level and from React function components', keyPoints: ['useCallback memoizes function references; useMemo memoizes computed values', 'Virtual DOM diffing uses fiber tree reconciliation algorithm'], type: 'concept', importance: 'High-Yield' },
        { id: 'tech_fs_2', topicTitle: 'TypeScript Mastery: Interfaces, Generics, Union Types & Strict Mode', subtopic: 'Type inference, Generics <T>, Utility types (Partial, Pick, Omit), Strict null checks, React.FC typing', dayNumber: 4, periodNumber: 1, keyFormulaOrLaw: 'Generic Function: function identity<T>(arg: T): T { return arg; }', keyPoints: ['Type narrowing using typeof, instanceof, and custom type predicates', 'Interfaces are open for declaration merging; type aliases are closed'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Backend Architecture: Node.js, Express, REST APIs & PostgreSQL',
      description: 'Event Loop, Non-blocking I/O, Express routing middleware, PostgreSQL schema design, Supabase Auth, Row Level Security (RLS) & JWT',
      subtopics: [
        {
          id: 'tech_fs_sub2',
          title: 'Backend API & Database Engineering',
          microTopics: [
            { id: 'tech_fs_3', title: 'RESTful API Design, Express Middleware & JWT Auth', keyAxiom: 'Stateless JWT authentication with bcrypt password hashing' },
            { id: 'tech_fs_4', title: 'PostgreSQL ACID Transactions, Indexing & Row Level Security (RLS)', keyAxiom: 'PostgreSQL RLS enforces row isolation at database engine layer' }
          ]
        }
      ],
      microTopics: [
        { id: 'tech_fs_3', topicTitle: 'RESTful API Design, Express Middleware & JWT Authentication', subtopic: 'HTTP Methods (GET, POST, PUT, DELETE), Status codes (200, 201, 400, 401, 403, 500), JWT token payload and verify', dayNumber: 7, periodNumber: 1, keyFormulaOrLaw: 'JWT Structure: Header.Payload.Signature | Middleware: (req, res, next) => { next(); }', keyPoints: ['Always hash user passwords using bcrypt with salt rounds >= 10', 'Express error handling middleware requires 4 parameters (err, req, res, next)'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'tech_fs_4', topicTitle: 'Database Modeling: PostgreSQL, ACID Transactions & Indexing Optimization', subtopic: 'Relational 3NF normalization, Foreign keys, B-Tree indexes, EXPLAIN ANALYZE query planning, Row Level Security (RLS)', dayNumber: 10, periodNumber: 1, keyFormulaOrLaw: 'ACID Properties: Atomicity, Consistency, Isolation, Durability | Indexing: CREATE INDEX ON table(column)', keyPoints: ['Indexes drastically speed up WHERE and JOIN clauses but add write overhead', 'PostgreSQL RLS policies restrict data access at the database engine level'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  const pythonAiChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Python 3.12 Programming, Data Structures & Object-Oriented Design',
      description: 'List comprehensions, Generators, Decorators, Dunder methods, Class inheritance, Polymorphism, Type hinting & Unit testing',
      subtopics: [
        {
          id: 'tech_py_sub1',
          title: 'Advanced Python Core & OOP',
          microTopics: [
            { id: 'tech_py_1', title: 'Decorators, Generators & Comprehensions Memory Efficiency', keyAxiom: 'Generators evaluate lazily on-demand with O(1) space' },
            { id: 'tech_py_2', title: 'OOP Design Patterns & Method Resolution Order (C3 MRO)', keyAxiom: 'Abstract base classes enforce strict interface contracts' }
          ]
        }
      ],
      microTopics: [
        { id: 'tech_py_1', topicTitle: 'Python Advanced Concepts: Decorators, Generators & Comprehensions', subtopic: 'Function closures, @decorator syntax, yield statement memory efficiency, List/Dict/Set comprehensions', dayNumber: 2, periodNumber: 2, keyFormulaOrLaw: 'Generator Expression: (x**2 for x in range(n)) | Decorator: def dec(func): def wrap(*a, **k): return func(*a, **k)', keyPoints: ['Generators produce items on the fly with O(1) memory footprint', 'Decorators modify function behavior without altering source code'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'tech_py_2', topicTitle: 'Object-Oriented Programming (OOP) in Python & Design Patterns', subtopic: 'Classes, __init__, Inheritance, Method Resolution Order (MRO), Encapsulation, Singleton & Factory design patterns', dayNumber: 5, periodNumber: 2, keyFormulaOrLaw: 'Python MRO: C3 Linearization algorithm for multiple inheritance resolution', keyPoints: ['Use @property decorator to define getter and setter methods cleanly', 'Abstract Base Classes (abc module) enforce interface contracts'], type: 'concept', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Data Science, Machine Learning (Scikit-Learn) & Generative AI',
      description: 'NumPy vectorized arrays, Pandas DataFrame wrangling, Linear/Logistic Regression, Decision Trees, Prompt Engineering & LLM APIs',
      subtopics: [
        {
          id: 'tech_py_sub2',
          title: 'Data Science & LLM Engineering',
          microTopics: [
            { id: 'tech_py_3', title: 'NumPy Broadcasting & Pandas Aggregations', keyAxiom: 'Vectorized NumPy executes at C-speed without interpreter overhead' },
            { id: 'tech_py_4', title: 'Scikit-Learn ML Pipelines & Prompt Engineering / RAG Architecture', keyAxiom: 'RAG grounds LLM outputs using vector embeddings & semantic retrieval' }
          ]
        }
      ],
      microTopics: [
        { id: 'tech_py_3', topicTitle: 'NumPy Vectorization, Pandas Data Wrangling & Feature Engineering', subtopic: 'Broadcasting rules, GroupBy aggregations, Handling missing data, MinMax/StandardScaler, One-Hot encoding', dayNumber: 8, periodNumber: 2, keyFormulaOrLaw: 'Z-Score Standardization: z = (x - Î¼) / Ïƒ | Broadcasting: Trailing dimensions must be equal or 1', keyPoints: ['Vectorized NumPy operations execute at C-speed without Python loop overhead', 'Pandas DataFrame merge operates similarly to SQL JOIN operations'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'tech_py_4', topicTitle: 'Machine Learning Algorithms & Large Language Model (LLM) Integration', subtopic: 'Supervised vs Unsupervised learning, Train/Test split, Confusion matrix metrics (Precision, Recall, F1), Prompt Engineering with Gemini/GPT APIs', dayNumber: 12, periodNumber: 2, keyFormulaOrLaw: 'F1-Score = 2 Ã— (Precision Ã— Recall) / (Precision + Recall) | Confusion Matrix: TP, TN, FP, FN', keyPoints: ['Overfitting occurs when model memorizes training noise; mitigate with Regularization (L1/L2)', 'Few-shot prompting provides input-output examples to guide LLM reasoning reliably'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  const dsaChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Data Structures: Arrays, Linked Lists, Stacks, Queues & Hash Tables',
      description: 'Time/Space Big-O complexity analysis, Two pointers, Sliding window, Singly/Doubly Linked List, Stack operations, Hash collision resolution',
      subtopics: [
        {
          id: 'tech_dsa_sub1',
          title: 'Linear Data Structures & Two-Pointers',
          microTopics: [
            { id: 'tech_dsa_1', title: 'Big-O Asymptotics, Two Pointers & Sliding Window Patterns', keyAxiom: 'Sliding window converts quadratic O(NÂ²) iterations into linear O(N)' },
            { id: 'tech_dsa_2', title: 'Monotonic Stacks & Floyd Cycle Finding Algorithm', keyAxiom: 'Floyd Tortoise and Hare detects cycles with O(1) auxiliary space' }
          ]
        }
      ],
      microTopics: [
        { id: 'tech_dsa_1', topicTitle: 'Asymptotic Analysis (Big-O) & Two-Pointer / Sliding Window Techniques', subtopic: 'O(1), O(log n), O(n), O(n log n), O(nÂ²) complexity, Invert array in-place, Two-Sum sorted, Maximum subarray sum (Kadane)', dayNumber: 3, periodNumber: 3, keyFormulaOrLaw: 'Kadane Algorithm: max_so_far = max(nums[i], max_so_far + nums[i]) | Two Pointer: Left=0, Right=n-1', keyPoints: ['Sliding window optimizes nested loops from O(nÂ²) to linear O(n) time', 'Hash table lookup, insertion, and deletion operate in average O(1) time'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'tech_dsa_2', topicTitle: 'Linked Lists, Stacks (Monotonic Stack) & Queue Implementations', subtopic: 'Reverse linked list in-place, Fast & Slow pointer cycle detection (Floyd), Monotonic stack next greater element, Queue using two stacks', dayNumber: 6, periodNumber: 3, keyFormulaOrLaw: 'Floyd Cycle Finding: slow moves 1 step, fast moves 2 steps; cycle exists if slow == fast', keyPoints: ['Reversing linked list requires 3 pointers (prev, curr, next)', 'Monotonic stack solves range query problems in O(n) single-pass'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Algorithms: Trees, Graphs (BFS/DFS), Dynamic Programming & Recursion',
      description: 'Binary Search Trees (BST), Tree traversals (Inorder, Preorder, Postorder), Graph adjacency list, Dijkstra shortest path, DP Memoization & Tabulation',
      subtopics: [
        {
          id: 'tech_dsa_sub2',
          title: 'Trees, Graphs & Dynamic Programming',
          microTopics: [
            { id: 'tech_dsa_3', title: 'BST Properties, Tree LCA & Graph BFS/DFS Traversals', keyAxiom: 'Inorder traversal of Binary Search Tree yields monotonically sorted sequence' },
            { id: 'tech_dsa_4', title: 'Dynamic Programming: 0/1 Knapsack, LCS & State Memoization', keyAxiom: 'Optimal substructure and overlapping subproblems define DP' }
          ]
        }
      ],
      microTopics: [
        { id: 'tech_dsa_3', topicTitle: 'Binary Trees, BST Operations & Graph Traversals (BFS / DFS)', subtopic: 'Inorder traversal of BST gives sorted order, Lowest Common Ancestor (LCA), Graph BFS (Queue) and DFS (Recursion/Stack), Topological Sort', dayNumber: 9, periodNumber: 3, keyFormulaOrLaw: 'BFS: Queue-based level-order traversal | DFS: Stack/Recursive deep-dive traversal | BST Property: Left < Root < Right', keyPoints: ['BFS finds shortest path in an unweighted graph', 'Topological sort is applicable only to Directed Acyclic Graphs (DAGs)'], type: 'solved_problem', importance: 'High-Yield' },
        { id: 'tech_dsa_4', topicTitle: 'Dynamic Programming (DP): 0/1 Knapsack, LCS & Coin Change', subtopic: 'Overlapping subproblems & optimal substructure, Top-down memoization vs Bottom-up tabulation, Longest Common Subsequence (LCS), Coin change', dayNumber: 13, periodNumber: 3, keyFormulaOrLaw: '0/1 Knapsack Recurrence: dp[i][w] = max(dp[i-1][w], val[i-1] + dp[i-1][w - wt[i-1]])', keyPoints: ['Identify DP state variables and base cases before constructing recurrence relation', 'Space optimization can often reduce 2D DP matrix to 1D array'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  const subjects: SyllabusSubject[] = [
    { subjectId: 'tech_fullstack', subjectName: 'Full-Stack Web & Mobile Architecture (React, Node, TypeScript)', icon: 'ðŸ’»', color: '#06b6d4', totalChapters: fullstackChapters.length, totalMicroTopics: fullstackChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: fullstackChapters },
    { subjectId: 'tech_python_ai', subjectName: 'Python 3.12, Data Science & Generative AI Engineering', icon: 'ðŸ', color: '#10b981', totalChapters: pythonAiChapters.length, totalMicroTopics: pythonAiChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: pythonAiChapters },
    { subjectId: 'tech_dsa', subjectName: 'Data Structures & Algorithms (LeetCode Master Patterns)', icon: '⚡', color: '#8b5cf6', totalChapters: dsaChapters.length, totalMicroTopics: dsaChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: dsaChapters }
  ];

  return {
    courseId: courseId || 'skills-fullstack-pro',
    courseTitle: courseTitle || 'Full-Stack Software Engineering, Python AI & DSA Master Track',
    category: 'skills',
    board: 'Industry Standard / University Degree',
    medium: 'English',
    totalDays: 200,
    totalSubjects: subjects.length,
    totalChapters: subjects.reduce((a, s) => a + s.chapters.length, 0),
    totalMicroTopics: subjects.reduce((a, s) => a + s.chapters.reduce((acc, c) => acc + (c.microTopics?.length || 0), 0), 0),
    subjects
  };
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 9D. TAMIL NADU POLICE & UNIFORMED SERVICES (TNUSRB SI & CONSTABLE)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function getTamilNaduPoliceCompleteSyllabus(courseId?: string, courseTitle?: string): CourseFullSyllabus {
  const tamilEligibilityChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'à®ªà®•à¯à®¤à®¿ à®…: à®¤à®®à®¿à®´à¯ à®‡à®²à®•à¯à®•à®£à®®à¯ (10à®†à®®à¯ à®µà®•à¯à®ªà¯à®ªà¯ à®¤à®°à®®à¯ â€” 100 à®µà®¿à®©à®¾à®•à¯à®•à®³à¯ à®¤à®•à¯à®¤à®¿)',
      description: 'à®ªà¯Šà®°à¯à®¤à¯à®¤à¯à®¤à®²à¯, à®ªà®¿à®°à®¿à®¤à¯à®¤à¯†à®´à¯à®¤à¯à®¤à®²à¯, à®Žà®¤à®¿à®°à¯à®šà¯à®šà¯Šà®²à¯, à®ªà®¿à®´à¯ˆ à®¤à®¿à®°à¯à®¤à¯à®¤à®®à¯ (à®šà®¨à¯à®¤à®¿à®ªà¯à®ªà®¿à®´à¯ˆ, à®’à®°à¯à®®à¯ˆ à®ªà®©à¯à®®à¯ˆ), à®µà¯‡à®°à¯à®šà¯à®šà¯Šà®²à¯, à®…à®•à®°à®µà®°à®¿à®šà¯ˆ',
      subtopics: [
        {
          id: 'pol_t_sub1',
          title: 'à®‡à®²à®•à¯à®•à®£ à®µà®¿à®¤à®¿à®•à®³à¯ & à®šà¯Šà®²à¯ à®µà®•à¯ˆ',
          microTopics: [
            { id: 'pol_t_1', title: 'à®ªà®¿à®°à®¿à®¤à¯à®¤à¯†à®´à¯à®¤à¯à®¤à®²à¯, à®šà¯‡à®°à¯à®¤à¯à®¤à¯†à®´à¯à®¤à¯à®¤à®²à¯ & à®Žà®¤à®¿à®°à¯à®šà¯à®šà¯Šà®²à¯ à®…à®±à®¿à®¤à®²à¯', keyAxiom: 'à®‰à®¯à®¿à®°à¯†à®´à¯à®¤à¯à®¤à¯ à®‰à®Ÿà®®à¯à®ªà®Ÿà¯à®®à¯†à®¯à¯ à®šà®¨à¯à®¤à®¿ à®µà®¿à®¤à®¿à®•à®³à¯' },
            { id: 'pol_t_2', title: 'à®šà®¨à¯à®¤à®¿à®ªà¯à®ªà®¿à®´à¯ˆ à®¨à¯€à®•à¯à®•à¯à®¤à®²à¯ & à®®à®°à®ªà¯à®ªà¯ à®ªà®¿à®´à¯ˆà®•à®³à¯', keyAxiom: 'à®…à®¨à¯à®¤, à®‡à®¨à¯à®¤, à®Žà®¨à¯à®¤ à®ªà®¿à®©à¯ à®µà®²à¯à®²à®¿à®©à®®à¯ à®®à®¿à®•à¯à®®à¯' }
          ]
        }
      ],
      microTopics: [
        { id: 'pol_t_1', topicTitle: 'à®ªà®¿à®°à®¿à®¤à¯à®¤à¯†à®´à¯à®¤à¯à®¤à®²à¯, à®Žà®¤à®¿à®°à¯à®šà¯à®šà¯Šà®²à¯, à®ªà®¿à®´à¯ˆ à®¤à®¿à®°à¯à®¤à¯à®¤à®®à¯ & à®…à®•à®°à®µà®°à®¿à®šà¯ˆ', subtopic: 'à®šà®¨à¯à®¤à®¿à®ªà¯à®ªà®¿à®´à¯ˆ (à®•à¯, à®šà¯, à®¤à¯, à®ªà¯) à®¨à¯€à®•à¯à®•à¯à®¤à®²à¯ à®®à®±à¯à®±à¯à®®à¯ à®µà¯‡à®°à¯à®šà¯à®šà¯Šà®²à¯à®²à®¿à®²à®¿à®°à¯à®¨à¯à®¤à¯ à®µà®¿à®©à¯ˆà®¯à¯†à®šà¯à®šà®®à¯ à®•à®¾à®£à¯à®¤à®²à¯', dayNumber: 1, periodNumber: 1, keyFormulaOrLaw: 'à®µà¯‡à®°à¯à®šà¯à®šà¯Šà®²à¯ -> à®¤à¯Šà®´à®¿à®±à¯à®ªà¯†à®¯à®°à¯ (à®¨à®Ÿ -> à®¨à®Ÿà®¤à¯à®¤à®²à¯) | à®ªà¯†à®¯à®°à¯†à®šà¯à®šà®®à¯ (à®¨à®Ÿà®¨à¯à®¤) | à®µà®¿à®©à¯ˆà®¯à¯†à®šà¯à®šà®®à¯ (à®¨à®Ÿà®¨à¯à®¤à¯)', keyPoints: ['à®¤à®®à®¿à®´à¯ à®¤à®•à¯à®¤à®¿à®¤à¯ à®¤à¯‡à®°à¯à®µà®¿à®²à¯ 40% à®•à¯à®±à¯ˆà®¨à¯à®¤à®ªà®Ÿà¯à®š à®®à®¤à®¿à®ªà¯à®ªà¯†à®£à¯ à®•à®Ÿà¯à®Ÿà®¾à®¯à®®à¯', 'à®…à®•à®°à®µà®°à®¿à®šà¯ˆà®ªà¯à®ªà®Ÿà¯à®¤à¯à®¤à¯à®¤à®²à¯: à®…, à®†, à®‡ à®µà®°à®¿à®šà¯ˆ à®®à®±à¯à®±à¯à®®à¯ à®•, à®•à®¾, à®•à®¿ à®µà®°à®¿à®šà¯ˆ'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'à®ªà®•à¯à®¤à®¿ à®† & à®‡: à®¤à®®à®¿à®´à¯ à®‡à®²à®•à¯à®•à®¿à®¯à®®à¯ à®®à®±à¯à®±à¯à®®à¯ à®¤à®®à®¿à®´à¯ à®…à®±à®¿à®žà®°à¯à®•à®³à¯',
      description: 'à®¤à®¿à®°à¯à®•à¯à®•à¯à®±à®³à¯, à®šà®¿à®²à®ªà¯à®ªà®¤à®¿à®•à®¾à®°à®®à¯, à®•à®®à¯à®ªà®°à®¾à®®à®¾à®¯à®£à®®à¯, à®ªà®¾à®°à®¤à®¿à®¯à®¾à®°à¯, à®ªà®¾à®°à®¤à®¿à®¤à®¾à®šà®©à¯, à®¤à®¨à¯à®¤à¯ˆ à®ªà¯†à®°à®¿à®¯à®¾à®°à¯, à®ªà¯‡à®°à®±à®¿à®žà®°à¯ à®…à®£à¯à®£à®¾',
      subtopics: [
        {
          id: 'pol_t_sub2',
          title: 'à®šà®™à¯à®• à®‡à®²à®•à¯à®•à®¿à®¯à®®à¯ & à®•à®µà®¿à®žà®°à¯à®•à®³à¯',
          microTopics: [
            { id: 'pol_t_3', title: 'à®¤à®¿à®°à¯à®•à¯à®•à¯à®±à®³à¯, à®Žà®Ÿà¯à®Ÿà¯à®¤à¯à®¤à¯Šà®•à¯ˆ, à®ªà®¤à¯à®¤à¯à®ªà¯à®ªà®¾à®Ÿà¯à®Ÿà¯ à®šà®¿à®±à®ªà¯à®ªà¯à®•à®³à¯', keyAxiom: 'à®¤à®¿à®°à¯à®•à¯à®•à¯à®±à®³à¯ à®…à®±à®¤à¯à®¤à¯à®ªà¯à®ªà®¾à®²à¯, à®ªà¯Šà®°à¯à®Ÿà¯à®ªà®¾à®²à¯, à®•à®¾à®®à®¤à¯à®¤à¯à®ªà¯à®ªà®¾à®²à¯ 133 à®…à®¤à®¿à®•à®¾à®°à®™à¯à®•à®³à¯' },
            { id: 'pol_t_4', title: 'à®ªà®¾à®°à®¤à®¿à®¯à®¾à®°à¯, à®ªà®¾à®°à®¤à®¿à®¤à®¾à®šà®©à¯, à®ªà¯†à®°à®¿à®¯à®¾à®°à¯, à®…à®£à¯à®£à®¾ à®¤à®®à®¿à®´à¯à®¤à¯à®¤à¯Šà®£à¯à®Ÿà¯', keyAxiom: 'à®ªà®¾à®°à®¤à®¿à®¯à®¾à®°à¯ à®ªà®¾à®Ÿà¯à®Ÿà¯à®•à¯à®•à¯Šà®°à¯ à®ªà¯à®²à®µà®©à¯ | à®ªà®¾à®°à®¤à®¿à®¤à®¾à®šà®©à¯ à®ªà¯à®°à®Ÿà¯à®šà®¿à®•à¯ à®•à®µà®¿à®žà®°à¯' }
          ]
        }
      ],
      microTopics: [
        { id: 'pol_t_3', topicTitle: 'à®¤à®¿à®°à¯à®•à¯à®•à¯à®±à®³à¯, à®•à®®à¯à®ªà®°à®¾à®®à®¾à®¯à®£à®®à¯, à®ªà®¾à®°à®¤à®¿à®¯à®¾à®°à¯ & à®¤à®¨à¯à®¤à¯ˆ à®ªà¯†à®°à®¿à®¯à®¾à®°à¯ à®¤à®®à®¿à®´à¯à®¤à¯à®¤à¯Šà®£à¯à®Ÿà¯', subtopic: 'à®¨à¯‚à®²à¯ à®†à®šà®¿à®°à®¿à®¯à®°à¯à®•à®³à¯, à®…à®Ÿà¯ˆà®®à¯Šà®´à®¿à®ªà¯ à®ªà¯†à®¯à®°à¯à®•à®³à¯ à®®à®±à¯à®±à¯à®®à¯ à®®à¯‡à®±à¯à®•à¯‹à®³à¯ à®µà®°à®¿à®•à®³à¯', dayNumber: 4, periodNumber: 1, keyFormulaOrLaw: 'à®ªà®¾à®°à®¤à®¿à®¯à®¾à®°à¯ à®‡à®¤à®´à¯à®•à®³à¯: à®‡à®¨à¯à®¤à®¿à®¯à®¾, à®µà®¿à®œà®¯à®¾ | à®ªà®¾à®°à®¤à®¿à®¤à®¾à®šà®©à¯: à®•à¯à®Ÿà¯à®®à¯à®ª à®µà®¿à®³à®•à¯à®•à¯, à®ªà®¾à®£à¯à®Ÿà®¿à®¯à®©à¯ à®ªà®°à®¿à®šà¯', keyPoints: ['à®¤à®¿à®°à¯à®•à¯à®•à¯à®±à®³à¯à®•à¯à®•à¯ à®‰à®°à¯ˆ à®Žà®´à¯à®¤à®¿à®¯ à®ªà®¤à®¿à®©à¯à®®à®°à®¿à®²à¯ à®šà®¿à®±à®¨à¯à®¤à®µà®°à¯ à®ªà®°à®¿à®®à¯‡à®²à®´à®•à®°à¯', 'à®¤à®¨à¯à®¤à¯ˆ à®ªà¯†à®°à®¿à®¯à®¾à®°à¯ à®¨à®Ÿà®¤à¯à®¤à®¿à®¯ à®‡à®¤à®´à¯à®•à®³à¯: à®•à¯à®Ÿà®¿à®¯à®°à®šà¯, à®µà®¿à®Ÿà¯à®¤à®²à¯ˆ'], type: 'concept', importance: 'High-Yield' }
      ]
    }
  ];

  const generalKnowledgeChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'à®ªà¯Šà®¤à¯ à®…à®±à®¿à®µà¯: à®µà®°à®²à®¾à®±à¯, à®ªà¯à®µà®¿à®¯à®¿à®¯à®²à¯ & à®‡à®¨à¯à®¤à®¿à®¯ à®…à®°à®šà®¿à®¯à®²à®®à¯ˆà®ªà¯à®ªà¯',
      description: 'à®šà®¿à®¨à¯à®¤à¯ à®šà®®à®µà¯†à®³à®¿, à®®à¯Œà®°à®¿à®¯à®°à¯, à®šà¯‹à®´à®°à¯, à®‡à®¨à¯à®¤à®¿à®¯ à®µà®¿à®Ÿà¯à®¤à®²à¯ˆ à®‡à®¯à®•à¯à®•à®®à¯, à®†à®±à¯à®•à®³à¯, à®ªà®°à¯à®µà®®à®´à¯ˆ, à®‡à®¨à¯à®¤à®¿à®¯ à®…à®°à®šà®¿à®¯à®²à®®à¯ˆà®ªà¯à®ªà¯ à®…à®Ÿà®¿à®ªà¯à®ªà®Ÿà¯ˆ à®‰à®°à®¿à®®à¯ˆà®•à®³à¯',
      subtopics: [
        {
          id: 'pol_gk_sub1',
          title: 'à®µà®°à®²à®¾à®±à¯ & à®…à®°à®šà®¿à®¯à®²à®®à¯ˆà®ªà¯à®ªà¯',
          microTopics: [
            { id: 'pol_gk_1', title: 'à®šà®¿à®¨à¯à®¤à¯ à®šà®®à®µà¯†à®³à®¿, à®šà¯‹à®´à®°à¯ à®ªà¯‡à®°à®°à®šà¯ & à®µà®¿à®Ÿà¯à®¤à®²à¯ˆà®ªà¯ à®ªà¯‹à®°à®¾à®Ÿà¯à®Ÿà®®à¯', keyAxiom: '1857 à®ªà¯†à®°à¯à®®à¯ à®ªà¯à®°à®Ÿà¯à®šà®¿ & 1947 à®‡à®¨à¯à®¤à®¿à®¯ à®µà®¿à®Ÿà¯à®¤à®²à¯ˆ' },
            { id: 'pol_gk_2', title: 'à®…à®Ÿà®¿à®ªà¯à®ªà®Ÿà¯ˆ à®‰à®°à®¿à®®à¯ˆà®•à®³à¯ (14â€“32), à®•à¯à®Ÿà®¿à®¯à®°à®šà¯à®¤à¯ à®¤à®²à¯ˆà®µà®°à¯, à®†à®³à¯à®¨à®°à¯', keyAxiom: 'à®šà®°à®¤à¯à®¤à¯ 32 à®…à®°à®šà®¿à®¯à®²à®®à¯ˆà®ªà¯à®ªà®¿à®©à¯ à®‡à®¤à®¯à®®à¯ à®®à®±à¯à®±à¯à®®à¯ à®†à®©à¯à®®à®¾' }
          ]
        }
      ],
      microTopics: [
        { id: 'pol_gk_1', topicTitle: 'à®‡à®¨à¯à®¤à®¿à®¯ à®µà®¿à®Ÿà¯à®¤à®²à¯ˆ à®‡à®¯à®•à¯à®•à®®à¯, à®¤à®®à®¿à®´à®• à®ªà®™à¯à®•à¯ & à®…à®°à®šà®¿à®¯à®²à®®à¯ˆà®ªà¯à®ªà¯ à®…à®Ÿà®¿à®ªà¯à®ªà®Ÿà¯ˆ à®‰à®°à®¿à®®à¯ˆà®•à®³à¯', subtopic: 'à®µà¯‡à®²à¯à®¨à®¾à®šà¯à®šà®¿à®¯à®¾à®°à¯, à®µ.à®‰.à®šà®¿, à®ªà®•à®¤à¯à®šà®¿à®™à¯, à®•à®¾à®¨à¯à®¤à®¿à®¯à®Ÿà®¿à®•à®³à¯ à®®à®±à¯à®±à¯à®®à¯ à®šà®°à®¤à¯à®¤à¯ 14â€“32', dayNumber: 2, periodNumber: 2, keyFormulaOrLaw: 'à®…à®°à®šà®¿à®¯à®²à®®à¯ˆà®ªà¯à®ªà¯ à®¨à®Ÿà¯ˆà®®à¯à®±à¯ˆ: 26 à®œà®©à®µà®°à®¿ 1950 | à®šà®Ÿà¯à®Ÿà®¤à¯à®¤à®¿à®©à¯ à®®à¯à®©à¯ à®…à®©à¯ˆà®µà®°à¯à®®à¯ à®šà®®à®®à¯: à®šà®°à®¤à¯à®¤à¯ 14', keyPoints: ['à®¤à®®à®¿à®´à¯à®¨à®¾à®Ÿà¯ à®•à®¾à®µà®²à¯ à®¤à¯à®±à¯ˆ à®šà®¿à®©à¯à®©à®®à¯: à®¸à¯à®°à¯€à®µà®¿à®²à¯à®²à®¿à®ªà¯à®¤à¯à®¤à¯‚à®°à¯ à®•à¯‹à®µà®¿à®²à¯ à®•à¯‹à®ªà¯à®°à®®à¯', 'à®•à®¾à®µà®²à¯à®¤à¯à®±à¯ˆ à®…à®®à¯ˆà®ªà¯à®ªà®¿à®©à¯ à®¤à®¨à¯à®¤à¯ˆ à®Žà®© à®…à®´à¯ˆà®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®ªà®µà®°à¯ à®•à®¾à®°à®©à¯à®µà®¾à®²à®¿à®¸à¯ à®ªà®¿à®°à®ªà¯'], type: 'concept', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'à®ªà¯Šà®¤à¯ à®…à®±à®¿à®µà®¿à®¯à®²à¯: à®…à®©à¯à®±à®¾à®Ÿ à®µà®¾à®´à¯à®µà®¿à®²à¯ à®‡à®¯à®±à¯à®ªà®¿à®¯à®²à¯, à®µà¯‡à®¤à®¿à®¯à®¿à®¯à®²à¯ & à®‰à®¯à®¿à®°à®¿à®¯à®²à¯',
      description: 'à®‡à®¯à®•à¯à®• à®µà®¿à®¤à®¿à®•à®³à¯, à®’à®³à®¿-à®’à®²à®¿, à®…à®®à®¿à®²à®™à¯à®•à®³à¯-à®•à®¾à®°à®™à¯à®•à®³à¯, à®¤à®©à®¿à®®à®™à¯à®•à®³à¯, à®®à®©à®¿à®¤ à®‰à®Ÿà®²à¯ à®‰à®±à¯à®ªà¯à®ªà¯ à®®à®£à¯à®Ÿà®²à®™à¯à®•à®³à¯, à®µà¯ˆà®Ÿà¯à®Ÿà®®à®¿à®©à¯ à®•à¯à®±à¯ˆà®ªà®¾à®Ÿà¯à®•à®³à¯',
      subtopics: [
        {
          id: 'pol_gk_sub2',
          title: 'à®ªà¯Šà®¤à¯ à®…à®±à®¿à®µà®¿à®¯à®²à¯ à®µà®¿à®¤à®¿à®•à®³à¯',
          microTopics: [
            { id: 'pol_gk_3', title: 'à®¨à®¿à®¯à¯‚à®Ÿà¯à®Ÿà®©à¯ 3 à®µà®¿à®¤à®¿à®•à®³à¯, à®²à¯†à®©à¯à®¸à¯, à®®à®¿à®©à¯à®©à¯‹à®Ÿà¯à®Ÿà®®à¯ & à®µà¯‡à®¤à®¿à®¯à®¿à®¯à®²à¯ à®•à®¾à®°à®™à¯à®•à®³à¯', keyAxiom: 'à®µà®¿à®šà¯ˆ F = ma | à®…à®®à®¿à®²à®™à¯à®•à®³à¯ à®¨à¯€à®² à®²à®¿à®Ÿà¯à®®à®¸à¯ˆ à®šà®¿à®µà®ªà¯à®ªà®¾à®• à®®à®¾à®±à¯à®±à¯à®®à¯' },
            { id: 'pol_gk_4', title: 'à®®à®©à®¿à®¤ à®šà¯†à®°à®¿à®®à®¾à®©à®®à¯, à®°à®¤à¯à®¤ à®“à®Ÿà¯à®Ÿà®®à¯ & à®µà¯ˆà®Ÿà¯à®Ÿà®®à®¿à®©à¯à®•à®³à¯ à®•à¯à®±à¯ˆà®ªà®¾à®Ÿà¯', keyAxiom: 'à®µà¯ˆà®Ÿà¯à®Ÿà®®à®¿à®©à¯ A (à®®à®¾à®²à¯ˆà®•à¯à®•à®£à¯), à®µà¯ˆà®Ÿà¯à®Ÿà®®à®¿à®©à¯ C (à®¸à¯à®•à®°à¯à®µà®¿)' }
          ]
        }
      ],
      microTopics: [
        { id: 'pol_gk_3', topicTitle: 'à®¨à®¿à®¯à¯‚à®Ÿà¯à®Ÿà®©à¯ à®µà®¿à®¤à®¿à®•à®³à¯ (F=ma), à®…à®®à®¿à®²à®™à¯à®•à®³à¯ à®•à®¾à®°à®™à¯à®•à®³à¯ & à®µà¯ˆà®Ÿà¯à®Ÿà®®à®¿à®©à¯à®•à®³à¯', subtopic: 'à®‡à®¯à®±à¯à®ªà®¿à®¯à®²à¯ à®…à®²à®•à¯à®•à®³à¯ (SI Units), à®¤à®©à®¿à®®à®™à¯à®•à®³à®¿à®©à¯ à®•à¯à®±à®¿à®¯à¯€à®Ÿà¯à®•à®³à¯, à®°à®¤à¯à®¤ à®µà®•à¯ˆà®•à®³à¯ (ABO)', dayNumber: 5, periodNumber: 2, keyFormulaOrLaw: 'F = ma | à®°à®¤à¯à®¤à®¤à¯à®¤à®¿à®©à¯ pH à®®à®¤à®¿à®ªà¯à®ªà¯ = 7.4 | à®…à®©à¯ˆà®µà®°à¯à®•à¯à®•à¯à®®à¯ à®°à®¤à¯à®¤à®®à¯ à®µà®´à®™à¯à®•à¯à®®à¯ à®ªà®¿à®°à®¿à®µà¯: O à®¨à¯†à®•à®Ÿà¯à®Ÿà®¿à®µà¯', keyPoints: ['à®®à®©à®¿à®¤ à®‰à®Ÿà®²à®¿à®©à¯ à®®à®¿à®•à®ªà¯à®ªà¯†à®°à®¿à®¯ à®‰à®±à¯à®ªà¯à®ªà¯ à®¤à¯‹à®²à¯; à®®à®¿à®•à®ªà¯à®ªà¯†à®°à®¿à®¯ à®šà¯à®°à®ªà¯à®ªà®¿ à®•à®²à¯à®²à¯€à®°à®²à¯', 'à®µà¯ˆà®Ÿà¯à®Ÿà®®à®¿à®©à¯ D à®šà¯‚à®°à®¿à®¯ à®’à®³à®¿à®¯à®¿à®©à¯ à®®à¯‚à®²à®®à¯ à®‰à®Ÿà®²à®¿à®²à¯ à®¤à®¯à®¾à®°à®¾à®•à®¿à®±à®¤à¯'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  const psychologyChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'à®‰à®³à®µà®¿à®¯à®²à¯: à®¤à®•à®µà®²à¯ à®¤à¯Šà®Ÿà®°à¯à®ªà¯à®¤à¯ à®¤à®¿à®±à®©à¯ & à®Žà®£à¯ à®•à®£à®¿à®¤ à®¨à¯à®£à¯à®£à®±à®¿à®µà¯',
      description: 'à®Žà®£à¯ à®¤à¯Šà®Ÿà®°à¯, à®µà®¿à®Ÿà¯à®ªà®Ÿà¯à®Ÿ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯, à®•à¯à®±à®¿à®¯à¯€à®Ÿà¯à®Ÿà¯ à®®à¯à®±à¯ˆ (Coding-Decoding), à®‡à®°à®¤à¯à®¤ à®‰à®±à®µà¯à®•à®³à¯, à®¤à®¿à®šà¯ˆ à®…à®±à®¿à®¤à®²à¯ à®šà¯‹à®¤à®©à¯ˆà®•à®³à¯',
      subtopics: [
        {
          id: 'pol_psy_sub1',
          title: 'à®Žà®£à¯ à®•à®£à®¿à®¤à®®à¯ & à®•à¯à®±à®¿à®¯à¯€à®Ÿà¯à®Ÿà¯ à®®à¯à®±à¯ˆ',
          microTopics: [
            { id: 'pol_psy_1', title: 'à®Žà®£à¯ à®¤à¯Šà®Ÿà®°à¯ & à®•à¯à®±à®¿à®¯à¯€à®Ÿà¯à®Ÿà¯ à®®à¯à®±à¯ˆ (Coding-Decoding)', keyAxiom: 'A=1 to Z=26 à®Žà®£à¯ à®®à®¤à®¿à®ªà¯à®ªà¯€à®Ÿà¯à®•à®³à¯' },
            { id: 'pol_psy_2', title: 'à®‡à®°à®¤à¯à®¤ à®‰à®±à®µà¯à®•à®³à¯ & à®¤à®¿à®šà¯ˆ à®…à®±à®¿à®¤à®²à¯ (à®µà®Ÿà®•à¯à®•à¯, à®•à®¿à®´à®•à¯à®•à¯, à®¤à¯†à®±à¯à®•à¯, à®®à¯‡à®±à¯à®•à¯)', keyAxiom: 'à®ªà®¿à®¤à®¾à®•à®°à®¸à¯ à®¤à¯‡à®±à¯à®±à®®à¯ à®µà®´à®¿ à®¤à¯‚à®°à®®à¯ à®•à®£à®•à¯à®•à®¿à®Ÿà¯à®¤à®²à¯' }
          ]
        }
      ],
      microTopics: [
        { id: 'pol_psy_1', topicTitle: 'à®Žà®£à¯ à®¤à¯Šà®Ÿà®°à¯, Coding-Decoding, à®‡à®°à®¤à¯à®¤ à®‰à®±à®µà¯à®•à®³à¯ & à®¤à®¿à®šà¯ˆ à®…à®±à®¿à®¤à®²à¯', subtopic: 'à®¤à®¿à®šà¯ˆ à®•à®£à®•à¯à®•à¯€à®Ÿà¯à®•à®³à¯, à®‰à®±à®µà¯à®®à¯à®±à¯ˆ à®µà®°à¯ˆà®ªà®Ÿà®®à¯ à®®à®±à¯à®±à¯à®®à¯ à®µà®¿à®Ÿà¯à®ªà®Ÿà¯à®Ÿ à®Žà®£à¯ à®•à®£à¯à®Ÿà®±à®¿à®¤à®²à¯', dayNumber: 3, periodNumber: 3, keyFormulaOrLaw: 'à®¤à®¿à®šà¯ˆ à®¤à¯‚à®°à®®à¯ = âˆš(à®µà®Ÿà®•à¯à®•à¯Â² + à®•à®¿à®´à®•à¯à®•à¯Â²) | à®•à¯à®±à®¿à®¯à¯€à®Ÿà¯à®Ÿà¯ à®®à¯à®±à¯ˆ: +1, -1, à®¤à®²à¯ˆà®•à¯€à®´à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯', keyPoints: ['à®‡à®°à®¤à¯à®¤ à®‰à®±à®µà¯à®•à®³à®¿à®²à¯ à®¤à®¨à¯à®¤à¯ˆ à®µà®´à®¿ vs à®¤à®¾à®¯à¯ à®µà®´à®¿ à®‰à®±à®µà¯à®®à¯à®±à¯ˆà®•à®³à¯ˆ à®¤à¯†à®³à®¿à®µà®¾à®• à®ªà®¿à®°à®¿à®•à¯à®•à®µà¯à®®à¯', 'à®•à®Ÿà®¿à®•à®¾à®° à®®à¯à®Ÿà¯à®•à®³à®¿à®©à¯ à®•à¯‹à®£à®®à¯: Î¸ = |30H - (11/2)M|'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'à®¤à®°à¯à®•à¯à®• à®ªà®•à¯à®ªà¯à®ªà®¾à®¯à¯à®µà¯ & à®µà®°à¯ˆà®ªà®Ÿà®¤à¯ à®¤à¯Šà®Ÿà®°à¯à®ªà¯ (Logical Reasoning)',
      description: 'à®µà¯†à®©à¯ à®µà®°à¯ˆà®ªà®Ÿà®™à¯à®•à®³à¯, à®ªà®•à®Ÿà¯ˆ à®•à®£à®•à¯à®•à¯à®•à®³à¯, à®•à®£à¯à®£à®¾à®Ÿà®¿ à®ªà®¿à®®à¯à®ªà®™à¯à®•à®³à¯, à®‡à®°à¯à®•à¯à®•à¯ˆ à®…à®®à¯ˆà®ªà¯à®ªà¯ à®®à¯à®±à¯ˆ, à®¨à¯‡à®°à®®à¯à®®à¯ à®µà¯‡à®²à¯ˆà®¯à¯à®®à¯',
      subtopics: [
        {
          id: 'pol_psy_sub2',
          title: 'à®¤à®°à¯à®•à¯à®• à®ªà®•à¯à®ªà¯à®ªà®¾à®¯à¯à®µà¯ & à®‰à®°à¯à®µà®™à¯à®•à®³à¯',
          microTopics: [
            { id: 'pol_psy_3', title: 'à®µà¯†à®©à¯ à®µà®°à¯ˆà®ªà®Ÿà®™à¯à®•à®³à¯ & à®ªà®•à®Ÿà¯ˆ à®Žà®¤à®¿à®°à¯à®ªà¯à®ªà®•à¯à®•à®™à¯à®•à®³à¯', keyAxiom: 'à®ªà®•à®Ÿà¯ˆà®¯à®¿à®©à¯ à®…à®Ÿà¯à®¤à¯à®¤à®Ÿà¯à®¤à¯à®¤ à®ªà®•à¯à®•à®™à¯à®•à®³à¯ à®Žà®¤à®¿à®°à¯ à®ªà®•à¯à®•à®®à®¾à®• à®…à®®à¯ˆà®¯à®¾à®¤à¯' },
            { id: 'pol_psy_4', title: 'à®•à®¾à®²à®®à¯à®®à¯ à®µà¯‡à®²à¯ˆà®¯à¯à®®à¯ (Men Ã— Days) & à®‡à®°à¯à®•à¯à®•à¯ˆ à®…à®®à¯ˆà®ªà¯à®ªà¯', keyAxiom: 'Mâ‚ Dâ‚ = Mâ‚‚ Dâ‚‚ à®šà¯‚à®¤à¯à®¤à®¿à®°à®®à¯' }
          ]
        }
      ],
      microTopics: [
        { id: 'pol_psy_3', topicTitle: 'à®µà¯†à®©à¯ à®µà®°à¯ˆà®ªà®Ÿà®®à¯, à®ªà®•à®Ÿà¯ˆ, à®•à®£à¯à®£à®¾à®Ÿà®¿ à®ªà®¿à®®à¯à®ªà®®à¯ & à®•à®¾à®²à®®à¯à®®à¯ à®µà¯‡à®²à¯ˆà®¯à¯à®®à¯', subtopic: 'Mâ‚Dâ‚ = Mâ‚‚Dâ‚‚ à®®à®±à¯à®±à¯à®®à¯ à®µà®Ÿà¯à®Ÿà®µà®Ÿà®¿à®µ à®‡à®°à¯à®•à¯à®•à¯ˆ à®…à®®à¯ˆà®ªà¯à®ªà¯ à®•à®£à®•à¯à®•à¯€à®Ÿà¯à®•à®³à¯', dayNumber: 6, periodNumber: 3, keyFormulaOrLaw: 'à®µà¯‡à®²à¯ˆ: 1 à®¨à®¾à®³à®¿à®²à¯ à®šà¯†à®¯à¯à®¤ à®µà¯‡à®²à¯ˆ = 1/N | à®ªà®•à®Ÿà¯ˆ à®µà®¿à®¤à®¿: à®ªà¯Šà®¤à¯à®µà®¾à®© à®Žà®£à¯ à®•à¯Šà®£à¯à®Ÿ à®‡à®°à¯ à®¨à®¿à®²à¯ˆà®•à®³à¯', keyPoints: ['à®µà¯†à®©à¯ à®µà®°à¯ˆà®ªà®Ÿà®¤à¯à®¤à®¿à®²à¯ à®ªà¯Šà®¤à¯à®µà®¾à®© à®ªà®•à¯à®¤à®¿ à®µà¯†à®Ÿà¯à®Ÿà¯à®ªà¯à®ªà®•à¯à®¤à®¿à®¯à¯ˆ à®•à¯à®±à®¿à®•à¯à®•à¯à®®à¯', 'à®•à®£à¯à®£à®¾à®Ÿà®¿ à®ªà®¿à®®à¯à®ªà®¤à¯à®¤à®¿à®²à¯ à®‡à®Ÿà®¤à¯-à®µà®²à®¤à¯ à®®à®Ÿà¯à®Ÿà¯à®®à¯‡ à®®à®¾à®±à¯à®®à¯; à®®à¯‡à®²à¯-à®•à¯€à®´à¯ à®®à®¾à®±à®¾à®¤à¯'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  const subjects: SyllabusSubject[] = [
    { subjectId: 'pol_tamil', subjectName: 'à®¤à®®à®¿à®´à¯ à®®à¯Šà®´à®¿à®¤à¯ à®¤à®•à¯à®¤à®¿à®¤à¯ à®¤à¯‡à®°à¯à®µà¯ (Tamil Eligibility â€” 100 Marks)', icon: '🔤', color: '#ec4899', totalChapters: tamilEligibilityChapters.length, totalMicroTopics: tamilEligibilityChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: tamilEligibilityChapters },
    { subjectId: 'pol_gk', subjectName: 'à®ªà¯Šà®¤à¯ à®…à®±à®¿à®µà¯ & à®…à®±à®¿à®µà®¿à®¯à®²à¯ (General Knowledge & Science Core)', icon: 'ðŸ›ï¸', color: '#06b6d4', totalChapters: generalKnowledgeChapters.length, totalMicroTopics: generalKnowledgeChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: generalKnowledgeChapters },
    { subjectId: 'pol_psy', subjectName: 'à®‰à®³à®µà®¿à®¯à®²à¯ & à®¤à®°à¯à®•à¯à®•à®•à¯ à®•à®¾à®°à®£à®µà®¿à®¯à®²à¯ (Psychology & Logical Analysis)', icon: 'ðŸ§ ', color: '#8b5cf6', totalChapters: psychologyChapters.length, totalMicroTopics: psychologyChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: psychologyChapters }
  ];

  return {
    courseId: courseId || 'exam-police-si',
    courseTitle: courseTitle || 'Tamil Nadu Police Sub-Inspector (SI) & Constable Master Program',
    category: 'police',
    board: 'TNUSRB',
    medium: 'Tamil / English',
    totalDays: 180,
    totalSubjects: subjects.length,
    totalChapters: subjects.reduce((a, s) => a + s.chapters.length, 0),
    totalMicroTopics: subjects.reduce((a, s) => a + s.chapters.reduce((acc, c) => acc + (c.microTopics?.length || 0), 0), 0),
    subjects
  };
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 9E. BANKING & INSURANCE EXAMS (IBPS PO/CLERK, SBI PO/CLERK, RBI ASSISTANT)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function getBankingAndInsuranceCompleteSyllabus(courseId?: string, courseTitle?: string): CourseFullSyllabus {
  const quantChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Speed Maths, Simplification, Number Series & Quadratic Equations',
      description: 'Vedic squaring, percentage-fraction equivalence, missing & wrong number series, factorization inequalities (x, y comparison)',
      subtopics: [
        {
          id: 'bank_q_sub1',
          title: 'Speed Calculations & Inequalities',
          microTopics: [
            { id: 'bank_q_1', title: 'Percentage Fractions (1/2 to 1/20) & BODMAS Approximation', keyAxiom: 'Fraction equivalents: 1/8=12.5%, 1/7=14.28%, 1/6=16.66%' },
            { id: 'bank_q_2', title: 'Quadratic Equation Sign Method (axÂ² + bx + c = 0)', keyAxiom: 'Constant negative in both equations gives No Relation (CND)' }
          ]
        }
      ],
      microTopics: [
        { id: 'bank_q_1', topicTitle: 'Speed Maths: Percentage-Fractions, Series & Quadratic Sign Method', subtopic: 'Approximations, Arithmetic/Geometric number series, Quadratic root comparison (x > y, x < y, CND)', dayNumber: 1, periodNumber: 1, keyFormulaOrLaw: 'Sign Rule: If constant term (c) is negative in both equations, answer is always x = y or CND', keyPoints: ['1/12 = 8.33%, 1/14 = 7.14%, 1/16 = 6.25%', 'Pattern identification in difference of differences'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Data Interpretation (DI) Master & Arithmetic Word Problems',
      description: 'Pie Charts, Bar Graphs, Caselet DI, Missing DI, Profit & Loss, Simple & Compound Interest, Time & Work, Speed-Distance',
      subtopics: [
        {
          id: 'bank_q_sub2',
          title: 'Data Interpretation & Arithmetic',
          microTopics: [
            { id: 'bank_q_3', title: 'Caselet DI & Double Pie Chart Analysis', keyAxiom: 'Venn-diagram based caselet variable isolation' },
            { id: 'bank_q_4', title: 'CI - SI Difference & Mixture Alligation Rule', keyAxiom: '2-Year Difference = P(R/100)Â² | Alligation: (c - m)/(m - d)' }
          ]
        }
      ],
      microTopics: [
        { id: 'bank_q_3', topicTitle: 'High-Level DI (Caselet, Pie, Radar) & Arithmetic Word Problems', subtopic: 'CI-SI difference formulas, Alligation rule, Relative speed (Train & Boats)', dayNumber: 4, periodNumber: 1, keyFormulaOrLaw: '2-Year CI-SI Diff: Dâ‚‚ = P(R/100)Â² | 3-Year Diff: Dâ‚ƒ = P(R/100)Â² Ã— (300+R)/100', keyPoints: ['Boat downstream = u + v; Upstream = u - v', 'Work equivalence: Total Work = LCM of individual days taken'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  const reasoningChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Puzzles & Seating Arrangements (Floor, Box, Circular, Parallel Rows)',
      description: 'Floor & Flat puzzles, 8-person circular facing inside/outside, Parallel row seating with blood relations, Box stack puzzles',
      subtopics: [
        {
          id: 'bank_r_sub1',
          title: 'Seating Arrangements & Puzzles',
          microTopics: [
            { id: 'bank_r_1', title: 'Floor-Flat & Box Stack Variable Puzzles', keyAxiom: 'Create 2 parallel possibilities table to eliminate invalid conditions' },
            { id: 'bank_r_2', title: 'Circular & Linear Seating facing Inward/Outward', keyAxiom: 'Fix definite position with maximum interconnecting clues' }
          ]
        }
      ],
      microTopics: [
        { id: 'bank_r_1', topicTitle: 'Mains-Level Puzzles (Floor-Flat, Year-Based, Uncertain Linear Row)', subtopic: 'Multi-variable seating arrangement with systematic thread/table method', dayNumber: 2, periodNumber: 2, keyFormulaOrLaw: 'Case Elimination: Draw Case A and Case B simultaneously to discard contradictions rapidly', keyPoints: ['Uncertain row: Start with elements having fixed directional limits', 'Floor-Flat: Note odd/even flat numbers explicitly'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Logical Deduction: Syllogisms ("Only a Few"), Inequalities & Machine Input',
      description: 'Reverse Syllogisms, "Only a few A are B", Coded Inequalities, Direction distance, Coded Blood Relations, Machine Input-Output',
      subtopics: [
        {
          id: 'bank_r_sub2',
          title: 'Logical Deduction & Machine Input',
          microTopics: [
            { id: 'bank_r_3', title: '"Only a few" Syllogisms (Some + Some Not)', keyAxiom: '"Only a few A are B" means Some A are B AND Some A are NOT B' },
            { id: 'bank_r_4', title: 'Machine Input-Output Step Shifting Logic', keyAxiom: 'Ascending/descending alphanumeric sorting patterns' }
          ]
        }
      ],
      microTopics: [
        { id: 'bank_r_3', topicTitle: 'Syllogisms ("Only a Few"), Coded Inequalities & Step-by-Step Input-Output', subtopic: 'Some + Some Not venn deductions, Coded blood relation tree', dayNumber: 5, periodNumber: 2, keyFormulaOrLaw: 'Rule: "Only A is B" = "All B are A" (and B cannot be anything else)', keyPoints: ['Either-Or condition requires same subjects/predicates with complementary pair', 'Input-output: trace alphabetical vowel/consonant count alongside number reversals'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  const englishChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Reading Comprehension, Error Spotting, Cloze Test & Para Jumbles',
      description: 'Banking/Economy editorial passages, Grammar rules (Subject-verb, Prepositions), Cloze test contextual word choice, Sentence rearrangement',
      subtopics: [
        {
          id: 'bank_e_sub1',
          title: 'Reading Comprehension & Grammar',
          microTopics: [
            { id: 'bank_e_1', title: 'Editorial Reading Comprehension & Tone Analysis', keyAxiom: 'Locate pivot words (However, Nonetheless, Despite) for main argument' },
            { id: 'bank_e_2', title: '120 Rules of English Grammar for Error Detection', keyAxiom: 'No sooner... than, Scarcely... when, Not only... but also' }
          ]
        }
      ],
      microTopics: [
        { id: 'bank_e_1', topicTitle: 'Reading Comprehension Tone, Cloze Test & Inversion Grammar Rules', subtopic: 'Inversion: "Hardly had I...", Subject-Verb Agreement with collective nouns', dayNumber: 3, periodNumber: 3, keyFormulaOrLaw: 'Rule: Scarcely/Hardly had + S + V3... WHEN | No Sooner had + S + V3... THAN', keyPoints: ['Para Jumbles: Look for mandatory noun-pronoun opening pairs', 'Cloze test: check positive vs negative connotation of surrounding sentences'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  const bankingAwarenessChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'RBI Monetary Policy, Banking Structure & Digital Payments',
      description: 'CRR, SLR, Repo, Reverse Repo, SDF, MSF, Basel III capital adequacy, NPA classification (SMA-0, 1, 2), SARFAESI Act, UPI, CBDC (e-Rupee)',
      subtopics: [
        {
          id: 'bank_ga_sub1',
          title: 'Banking & Financial Architecture',
          microTopics: [
            { id: 'bank_ga_1', title: 'RBI Monetary Policy Instruments & Liquidity Ratios', keyAxiom: 'CRR kept with RBI in cash; SLR kept in gold/govt securities' },
            { id: 'bank_ga_2', title: 'NPA Norms (90 days default), IBC 2016 & Digital UPI 2.0', keyAxiom: 'Substandard -> Doubtful -> Loss asset classification timeline' }
          ]
        }
      ],
      microTopics: [
        { id: 'bank_ga_1', topicTitle: 'RBI Policy Rates, Priority Sector Lending (PSL) & NPA Norms', subtopic: 'Repo rate, 40% PSL target for commercial banks, DICGC insurance limit (â‚¹5 Lakhs)', dayNumber: 6, periodNumber: 3, keyFormulaOrLaw: 'DICGC Deposit Insurance = â‚¹5,000,000 per depositor per bank | PSL Target = 40% of ANBC', keyPoints: ['Payment Banks cannot issue credit cards or advance loans (can accept deposits up to â‚¹2 Lakh)', 'Small Finance Banks have 75% PSL requirement'], type: 'concept', importance: 'High-Yield' }
      ]
    }
  ];

  const subjects: SyllabusSubject[] = [
    { subjectId: 'bank_quant', subjectName: 'Quantitative Aptitude & Advanced DI (Banking)', icon: 'ðŸ”¢', color: '#06b6d4', totalChapters: quantChapters.length, totalMicroTopics: quantChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: quantChapters },
    { subjectId: 'bank_reasoning', subjectName: 'Reasoning Ability & Complex Puzzles', icon: 'ðŸ§©', color: '#8b5cf6', totalChapters: reasoningChapters.length, totalMicroTopics: reasoningChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: reasoningChapters },
    { subjectId: 'bank_english', subjectName: 'English Language & Verbal Ability', icon: 'ðŸ“–', color: '#3b82f6', totalChapters: englishChapters.length, totalMicroTopics: englishChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: englishChapters },
    { subjectId: 'bank_ga', subjectName: 'Banking Awareness, Financial Systems & Current Affairs', icon: 'ðŸ›ï¸', color: '#10b981', totalChapters: bankingAwarenessChapters.length, totalMicroTopics: bankingAwarenessChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: bankingAwarenessChapters }
  ];

  return {
    courseId: courseId || 'exam-bank-po',
    courseTitle: courseTitle || 'Banking & Insurance (IBPS, SBI PO/Clerk, RBI Assistant) Master Blueprint',
    category: 'banking',
    board: 'IBPS / SBI / RBI',
    medium: 'English / Tamil',
    totalDays: 180,
    totalSubjects: subjects.length,
    totalChapters: subjects.reduce((a, s) => a + s.chapters.length, 0),
    totalMicroTopics: subjects.reduce((a, s) => a + s.chapters.reduce((acc, c) => acc + (c.microTopics?.length || 0), 0), 0),
    subjects
  };
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 9F. SSC & RAILWAY EXAMS (SSC CGL / CHSL / MTS & RRB NTPC / GROUP D)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function getSscAndRailwayCompleteSyllabus(courseId?: string, courseTitle?: string): CourseFullSyllabus {
  const quantChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Advance Mathematics: Geometry, Trigonometry, Mensuration & Algebra',
      description: 'Triangle centers (Centroid, Incenter, Circumcenter, Orthocenter), Circle tangent theorems, Trigonometric identities, 2D/3D surface area & volume',
      subtopics: [
        {
          id: 'ssc_q_sub1',
          title: 'Advance Geometry & Trigonometry',
          microTopics: [
            { id: 'ssc_q_1', title: 'Triangle Centers & Circle Tangent Theorems', keyAxiom: 'Inradius r = Area / Semi-perimeter | Circumradius R = abc / 4Î”' },
            { id: 'ssc_q_2', title: 'Trigonometry Maxima/Minima & Heights/Distances', keyAxiom: 'a sin Î¸ + b cos Î¸ has max value âˆš(aÂ² + bÂ²)' }
          ]
        }
      ],
      microTopics: [
        { id: 'ssc_q_1', topicTitle: 'Circle Theorems (Alternate Segment), Triangle Centers & Trigonometry Maxima', subtopic: 'Incenter angle = 90Â° + A/2, Circumcenter angle = 2A, Tangent PA Ã— PB = PTÂ²', dayNumber: 1, periodNumber: 1, keyFormulaOrLaw: 'Alternate Segment Theorem | Incenter: âˆ BIC = 90Â° + âˆ A/2 | Secant: PA Â· PB = PTÂ²', keyPoints: ['Centroid divides median in 2:1 ratio', 'Sum of interior angles of n-sided polygon = (n - 2) Ã— 180Â°'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Arithmetic & Commercial Maths (Percentage, Ratio, Time-Work, Speed-Distance)',
      description: 'Successive percentage changes, Dishonest shopkeeper profit, Compound interest installments, Relative speed, Train crossing platform',
      subtopics: [
        {
          id: 'ssc_q_sub2',
          title: 'Commercial Arithmetic',
          microTopics: [
            { id: 'ssc_q_3', title: 'Successive Percentage & Dishonest Shopkeeper', keyAxiom: 'Net Change = a + b + (ab/100)' },
            { id: 'ssc_q_4', title: 'Train Speed-Distance & Relative Motion', keyAxiom: 'Time to cross platform = (Train Length + Platform Length) / Speed' }
          ]
        }
      ],
      microTopics: [
        { id: 'ssc_q_3', topicTitle: 'Dishonest Dealer, CI Installments & Train Speed Problems', subtopic: 'Weight fraud % profit, Equal annual installment formula', dayNumber: 4, periodNumber: 1, keyFormulaOrLaw: 'Installment P = x/(1+r/100) + x/(1+r/100)Â² | Net % = a + b + ab/100', keyPoints: ['Speed conversion: 1 km/h = 5/18 m/s', 'Work formula: Mâ‚ Dâ‚ Hâ‚ / Wâ‚ = Mâ‚‚ Dâ‚‚ Hâ‚‚ / Wâ‚‚'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  const reasoningChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'General Intelligence & Reasoning (Verbal & Non-Verbal)',
      description: 'Analogies, Venn diagrams, Syllogisms, Paper folding/cutting, Cube & Dice, Embedded figures, Matrix, Mirror & Water images',
      subtopics: [
        {
          id: 'ssc_r_sub1',
          title: 'Reasoning & Non-Verbal Logic',
          microTopics: [
            { id: 'ssc_r_1', title: 'Analogies, Classification & Odd One Out', keyAxiom: 'Alphabet place values & prime number patterns' },
            { id: 'ssc_r_2', title: 'Cube Folding, Dice Opposite Faces & Mirror Images', keyAxiom: 'Opposite faces on an unfolded cube are separated by exactly 1 square' }
          ]
        }
      ],
      microTopics: [
        { id: 'ssc_r_1', topicTitle: 'Dice Opposite Faces, Figure Counting (Triangles/Squares) & Venn Logic', subtopic: 'Formula for counting triangles in symmetric grids, Dice rotation rules', dayNumber: 2, periodNumber: 2, keyFormulaOrLaw: 'Triangle Count in n-division grid: Total = n(n+1)/2 | Opposite faces on standard die sum to 7', keyPoints: ['Mirror reflection flips horizontal axis; Water reflection flips vertical axis', 'Statement-Conclusion: Do not assume information beyond stated premise'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  const englishChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'English Comprehension, Vocabulary, Idioms & Grammar Transformations',
      description: 'One Word Substitutions, Idioms & Phrases, Active/Passive Voice transformations, Direct/Indirect Speech, Cloze test',
      subtopics: [
        {
          id: 'ssc_e_sub1',
          title: 'English Grammar & Vocabulary',
          microTopics: [
            { id: 'ssc_e_1', title: 'One Word Substitution (OWS) & High-Frequency Idioms', keyAxiom: 'Root words (Phil-, Mis-, -cide, -cracy, -ology)' },
            { id: 'ssc_e_2', title: 'Voice & Narration Conversion Rules', keyAxiom: 'Never change tense in Active to Passive; Backshift tense in Direct to Indirect' }
          ]
        }
      ],
      microTopics: [
        { id: 'ssc_e_1', topicTitle: 'SSC High-Yield Idioms, One-Word Substitutions & Voice/Narration Rules', subtopic: 'Root words, Passive of interrogative/imperative sentences, Reporting verb rules', dayNumber: 3, periodNumber: 3, keyFormulaOrLaw: 'Passive Voice of Imperative: "Let + Object + be + V3" | "You are ordered/requested to + V1"', keyPoints: ['Uncountable nouns (Information, Furniture, Advice, Scenery) never take plural -s', 'Both... and is correct pair; Both... as well as is grammatically incorrect'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  const gsChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'General Awareness: History, Polity, Geography, Economy & NCERT Science',
      description: 'Mughal Empire, Freedom Movement, Constitutional Articles, Indian Rivers, National Parks, Classical Dances, NCERT Physics/Chemistry/Biology',
      subtopics: [
        {
          id: 'ssc_ga_sub1',
          title: 'General Knowledge & Science',
          microTopics: [
            { id: 'ssc_ga_1', title: 'Indian History & Constitutional Articles (1 to 51A)', keyAxiom: 'Fundamental Rights (12-35), DPSPs (36-51), Fundamental Duties 51A' },
            { id: 'ssc_ga_2', title: 'General Science NCERT (Physics, Chemistry, Biology)', keyAxiom: 'Units, Optics, Acids-Bases, Periodic Table, Cell organelles, Human diseases' }
          ]
        }
      ],
      microTopics: [
        { id: 'ssc_ga_1', topicTitle: 'Indian Polity Articles, Geography Rivers/Passes & NCERT Science Core', subtopic: 'Article 14â€“32, Major Mountain Passes (Zoji La, Nathu La), Human hormones', dayNumber: 5, periodNumber: 3, keyFormulaOrLaw: 'Article 51A: 11 Fundamental Duties added by 42nd Amendment 1976 (Swaran Singh Committee)', keyPoints: ['Tropic of Cancer passes through 8 Indian states (Gujarat to Mizoram)', 'Sound waves cannot travel through vacuum; light waves travel at 3 Ã— 10â¸ m/s'], type: 'concept', importance: 'High-Yield' }
      ]
    }
  ];

  const subjects: SyllabusSubject[] = [
    { subjectId: 'ssc_quant', subjectName: 'Quantitative Aptitude & Pure Advance Maths', icon: 'ðŸ“', color: '#06b6d4', totalChapters: quantChapters.length, totalMicroTopics: quantChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: quantChapters },
    { subjectId: 'ssc_reasoning', subjectName: 'General Intelligence & Reasoning (Verbal / Non-Verbal)', icon: 'ðŸ§©', color: '#8b5cf6', totalChapters: reasoningChapters.length, totalMicroTopics: reasoningChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: reasoningChapters },
    { subjectId: 'ssc_english', subjectName: 'English Language & Comprehension', icon: 'ðŸ“–', color: '#3b82f6', totalChapters: englishChapters.length, totalMicroTopics: englishChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: englishChapters },
    { subjectId: 'ssc_ga', subjectName: 'General Awareness & General Science Core', icon: 'ðŸ›ï¸', color: '#10b981', totalChapters: gsChapters.length, totalMicroTopics: gsChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: gsChapters }
  ];

  return {
    courseId: courseId || 'exam-ssc-cgl',
    courseTitle: courseTitle || 'SSC CGL, CHSL, MTS & Railway RRB NTPC Unified Master Program',
    category: 'ssc_railway',
    board: 'SSC / RRB',
    medium: 'English / Tamil',
    totalDays: 200,
    totalSubjects: subjects.length,
    totalChapters: subjects.reduce((a, s) => a + s.chapters.length, 0),
    totalMicroTopics: subjects.reduce((a, s) => a + s.chapters.reduce((acc, c) => acc + (c.microTopics?.length || 0), 0), 0),
    subjects
  };
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 9G. TEACHING RECRUITMENT & TET (TRB PG/BT, TNTET PAPER 1 & 2)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function getTrbAndTeacherExamsCompleteSyllabus(courseId?: string, courseTitle?: string): CourseFullSyllabus {
  const childDevChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Child Development & Learning Theories (à®•à¯à®´à®¨à¯à®¤à¯ˆ à®µà®³à®°à¯à®šà¯à®šà®¿ à®®à®±à¯à®±à¯à®®à¯ à®•à®±à¯à®±à®²à¯ à®•à¯‹à®Ÿà¯à®ªà®¾à®Ÿà¯à®•à®³à¯)',
      description: 'Jean Piaget 4 Cognitive Stages, Lev Vygotsky ZPD & Scaffolding, Kohlberg Moral Stages, Erikson Psychosocial Stages',
      subtopics: [
        {
          id: 'trb_cd_sub1',
          title: 'à®µà®³à®°à¯à®šà¯à®šà®¿ à®¨à®¿à®²à¯ˆà®•à®³à¯ & à®•à®±à¯à®±à®²à¯ à®•à¯‹à®Ÿà¯à®ªà®¾à®Ÿà¯à®•à®³à¯',
          microTopics: [
            { id: 'trb_cd_1', title: 'à®ªà®¿à®¯à®¾à®œà¯‡ (Piaget) à®…à®±à®¿à®¤à®¿à®±à®©à¯ à®µà®³à®°à¯à®šà¯à®šà®¿ 4 à®¨à®¿à®²à¯ˆà®•à®³à¯', keyAxiom: 'Sensorimotor (0-2), Preoperational (2-7), Concrete (7-11), Formal (11+)' },
            { id: 'trb_cd_2', title: 'à®µà¯ˆà®•à®¾à®Ÿà¯à®¸à¯à®•à®¿ (Vygotsky) ZPD & à®šà®¾à®°à®•à¯à®•à®Ÿà¯à®Ÿà¯ (Scaffolding)', keyAxiom: 'Zone of Proximal Development: Gap between actual and guided capability' }
          ]
        }
      ],
      microTopics: [
        { id: 'trb_cd_1', topicTitle: 'à®ªà®¿à®¯à®¾à®œà¯‡ 4 à®¨à®¿à®²à¯ˆà®•à®³à¯, à®µà¯ˆà®•à®¾à®Ÿà¯à®¸à¯à®•à®¿ ZPD & à®•à¯‹à®²à¯à®ªà®°à¯à®•à¯ à®’à®´à¯à®•à¯à®• à®µà®³à®°à¯à®šà¯à®šà®¿', subtopic: 'à®…à®±à®¿à®¤à®¿à®±à®©à¯ à®µà®³à®°à¯à®šà¯à®šà®¿ à®¨à®¿à®²à¯ˆà®•à®³à¯, à®šà®¾à®°à®•à¯à®•à®Ÿà¯à®Ÿà¯ (Scaffolding) à®®à®±à¯à®±à¯à®®à¯ à®®à®¾à®°à®²à¯ à®•à¯‹à®Ÿà¯à®ªà®¾à®Ÿà¯à®•à®³à¯', dayNumber: 1, periodNumber: 1, keyFormulaOrLaw: 'Piaget 4 Stages: Sensorimotor -> Pre-operational -> Concrete Operational -> Formal Operational | Vygotsky: ZPD & MKO', keyPoints: ['Assimilation (à®‰à®Ÿà¯à®•à®¿à®°à®•à®¿à®¤à¯à®¤à®²à¯) vs Accommodation (à®ªà¯Šà®°à¯à®¤à¯à®¤à¯à®¤à®²à¯)', 'Scaffolding concept proposed by Jerome Bruner in Vygotskian framework'], type: 'concept', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'à®¨à¯à®£à¯à®£à®±à®¿à®µà¯, à®†à®³à¯à®®à¯ˆ, à®šà®¿à®±à®ªà¯à®ªà¯ à®•à¯à®´à®¨à¯à®¤à¯ˆà®•à®³à¯à®•à¯à®•à®¾à®© à®•à®²à¯à®µà®¿ & RTE à®šà®Ÿà¯à®Ÿà®®à¯',
      description: 'Gardner Multiple Intelligences (8 à®µà®•à¯ˆà®•à®³à¯), Maslow Hierarchy of Needs, Inclusive Education, CWSN, RTE Act 2009 & NEP 2020',
      subtopics: [
        {
          id: 'trb_cd_sub2',
          title: 'à®¨à¯à®£à¯à®£à®±à®¿à®µà¯ & à®‰à®³à¯à®³à®Ÿà®•à¯à®•à®¿à®¯ à®•à®²à¯à®µà®¿',
          microTopics: [
            { id: 'trb_cd_3', title: 'à®¹à¯‹à®µà®°à¯à®Ÿà¯ à®•à®¾à®°à¯à®Ÿà¯à®©à®°à¯ 8 à®µà®•à¯ˆ à®ªà®²à¯à®µà®•à¯ˆ à®¨à¯à®£à¯à®£à®±à®¿à®µà¯', keyAxiom: 'Linguistic, Logical-Mathematical, Spatial, Bodily, Musical, Inter/Intra-personal, Naturalist' },
            { id: 'trb_cd_4', title: 'à®‰à®³à¯à®³à®Ÿà®•à¯à®•à®¿à®¯ à®•à®²à¯à®µà®¿ (Inclusive Education) & RTE à®šà®Ÿà¯à®Ÿà®®à¯ 2009', keyAxiom: 'Section 12(1)(c) mandates 25% admission for disadvantaged children in private schools' }
          ]
        }
      ],
      microTopics: [
        { id: 'trb_cd_3', topicTitle: 'à®•à®¾à®°à¯à®Ÿà¯à®©à®°à¯ 8 à®µà®•à¯ˆ à®¨à¯à®£à¯à®£à®±à®¿à®µà¯, à®®à®¾à®¸à¯à®²à¯‹ à®¤à¯‡à®µà¯ˆà®•à®³à¯ & RTE à®šà®Ÿà¯à®Ÿà®®à¯ 2009', subtopic: 'à®¹à¯‹à®µà®°à¯à®Ÿà¯ à®•à®¾à®°à¯à®Ÿà¯à®©à®°à¯ à®¤à®¤à¯à®¤à¯à®µà®®à¯, à®®à®¸à¯à®²à¯‹ à®ªà®Ÿà®¿à®¨à®¿à®²à¯ˆ à®¤à¯‡à®µà¯ˆà®•à®³à¯ à®®à®±à¯à®±à¯à®®à¯ à®‡à®²à®µà®š à®•à®Ÿà¯à®Ÿà®¾à®¯à®•à¯ à®•à®²à¯à®µà®¿', dayNumber: 3, periodNumber: 1, keyFormulaOrLaw: 'Maslow Hierarchy: Physiological -> Safety -> Love/Belonging -> Esteem -> Self-Actualization', keyPoints: ['RTE Act came into force on 1 April 2010 (Article 21A)', 'Pupil-Teacher Ratio (PTR) in primary school: 30:1; Upper primary: 35:1'], type: 'concept', importance: 'High-Yield' }
      ]
    }
  ];

  const pedagogyChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'à®®à¯Šà®´à®¿ à®•à®±à¯à®ªà®¿à®¤à¯à®¤à®²à¯ à®®à¯à®±à¯ˆà®•à®³à¯ & à®®à®¤à®¿à®ªà¯à®ªà¯€à®Ÿà¯à®Ÿà¯ à®‰à®¤à¯à®¤à®¿à®•à®³à¯ (Pedagogy & Assessment)',
      description: 'LSRW à®¤à®¿à®±à®©à¯à®•à®³à¯ (à®•à¯‡à®Ÿà¯à®Ÿà®²à¯, à®ªà¯‡à®šà¯à®¤à®²à¯, à®ªà®Ÿà®¿à®¤à¯à®¤à®²à¯, à®Žà®´à¯à®¤à¯à®¤à®²à¯), à®šà¯†à®¯à¯à®¯à¯à®³à¯/à®‰à®°à¯ˆà®¨à®Ÿà¯ˆ à®•à®±à¯à®ªà®¿à®¤à¯à®¤à®²à¯, à®¨à¯à®£à¯à®£à®¿à®²à¯ˆ à®•à®±à¯à®ªà®¿à®¤à¯à®¤à®²à¯ (Micro-teaching), CCE à®¤à¯Šà®Ÿà®°à¯ à®®à®¤à®¿à®ªà¯à®ªà¯€à®Ÿà¯',
      subtopics: [
        {
          id: 'trb_ped_sub1',
          title: 'à®•à®±à¯à®ªà®¿à®¤à¯à®¤à®²à¯ à®®à¯à®±à¯ˆà®•à®³à¯ & à®¨à¯à®£à¯à®£à®¿à®²à¯ˆ à®•à®±à¯à®ªà®¿à®¤à¯à®¤à®²à¯',
          microTopics: [
            { id: 'trb_ped_1', title: 'LSRW à®®à¯Šà®´à®¿à®¤à¯à®¤à®¿à®±à®©à¯à®•à®³à¯ & à®®à¯Šà®´à®¿ à®•à®±à¯à®ªà®¿à®•à¯à®•à¯à®®à¯ à®®à¯à®±à¯ˆà®•à®³à¯', keyAxiom: 'à®•à¯‡à®Ÿà¯à®Ÿà®²à¯ à®®à®±à¯à®±à¯à®®à¯ à®ªà®Ÿà®¿à®¤à¯à®¤à®²à¯ à®à®±à¯à®ªà¯à®¤à¯ à®¤à®¿à®±à®©à¯à®•à®³à¯; à®ªà¯‡à®šà¯à®¤à®²à¯ à®®à®±à¯à®±à¯à®®à¯ à®Žà®´à¯à®¤à¯à®¤à®²à¯ à®µà¯†à®³à®¿à®¯à¯€à®Ÿà¯à®Ÿà¯à®¤à¯ à®¤à®¿à®±à®©à¯à®•à®³à¯' },
            { id: 'trb_ped_2', title: 'à®¨à¯à®£à¯à®£à®¿à®²à¯ˆ à®•à®±à¯à®ªà®¿à®¤à¯à®¤à®²à¯ 6 à®ªà®Ÿà®¿à®•à®³à¯ (Micro-Teaching Cycle)', keyAxiom: 'Teach (6m) -> Feedback (6m) -> Re-plan (12m) -> Re-teach (6m) -> Re-feedback (6m) = 36 mins' }
          ]
        }
      ],
      microTopics: [
        { id: 'trb_ped_1', topicTitle: 'LSRW à®®à¯Šà®´à®¿à®¤à¯à®¤à®¿à®±à®©à¯à®•à®³à¯, à®¨à¯à®£à¯à®£à®¿à®²à¯ˆ à®•à®±à¯à®ªà®¿à®¤à¯à®¤à®²à¯ à®šà¯à®´à®±à¯à®šà®¿ (36 à®¨à®¿à®®à®¿à®Ÿà®™à¯à®•à®³à¯) & CCE', subtopic: 'à®•à®±à¯à®ªà®¿à®¤à¯à®¤à®²à¯ à®ªà®Ÿà®¿à®•à®³à¯, à®ªà®¿à®©à¯à®©à¯‚à®Ÿà¯à®Ÿà®®à¯ à®®à®±à¯à®±à¯à®®à¯ à®¤à¯Šà®Ÿà®°à¯ à®®à¯à®´à¯à®®à¯ˆà®¯à®¾à®© à®®à®¤à®¿à®ªà¯à®ªà¯€à®Ÿà¯ (CCE)', dayNumber: 2, periodNumber: 2, keyFormulaOrLaw: 'Micro-teaching Cycle: 36 Minutes (Plan -> Teach 6m -> Feedback 6m -> Re-plan 12m -> Re-teach 6m -> Re-feedback 6m)', keyPoints: ['Formative Assessment (à®•à®±à¯à®±à®²à¯à®•à¯à®•à®¾à®© à®®à®¤à®¿à®ªà¯à®ªà¯€à®Ÿà¯) vs Summative Assessment (à®•à®±à¯à®±à®²à®¿à®©à¯ à®®à®¤à®¿à®ªà¯à®ªà¯€à®Ÿà¯)', 'Micro-teaching was introduced by Dwight W. Allen at Stanford University (1963)'], type: 'concept', importance: 'High-Yield' }
      ]
    }
  ];

  const subjects: SyllabusSubject[] = [
    { subjectId: 'trb_child_dev', subjectName: 'à®•à¯à®´à®¨à¯à®¤à¯ˆ à®®à¯‡à®®à¯à®ªà®¾à®Ÿà¯à®®à¯ à®•à®±à¯à®±à®²à¯ à®‰à®³à®µà®¿à®¯à®²à¯à®®à¯ (Child Development & Pedagogy)', icon: 'ðŸ‘¶', color: '#ec4899', totalChapters: childDevChapters.length, totalMicroTopics: childDevChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: childDevChapters },
    { subjectId: 'trb_pedagogy', subjectName: 'à®•à®±à¯à®ªà®¿à®¤à¯à®¤à®²à¯ à®®à¯à®±à¯ˆà®•à®³à¯à®®à¯ à®®à®¤à®¿à®ªà¯à®ªà¯€à®Ÿà¯à®®à¯ (Teaching Methodology & CCE)', icon: '📚', color: '#06b6d4', totalChapters: pedagogyChapters.length, totalMicroTopics: pedagogyChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: pedagogyChapters }
  ];

  return {
    courseId: courseId || 'exam-trb-tet',
    courseTitle: courseTitle || 'Teachers Recruitment Board (TRB / TNTET Paper 1 & 2) Master Program',
    category: 'teaching',
    board: 'TRB Tamil Nadu',
    medium: 'Tamil / English',
    totalDays: 150,
    totalSubjects: subjects.length,
    totalChapters: subjects.reduce((a, s) => a + s.chapters.length, 0),
    totalMicroTopics: subjects.reduce((a, s) => a + s.chapters.reduce((acc, c) => acc + (c.microTopics?.length || 0), 0), 0),
    subjects
  };
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 9H. GATE & CORE ENGINEERING (COMPUTER SCIENCE / IT & CORE)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function getGateAndEngineeringCompleteSyllabus(courseId?: string, courseTitle?: string): CourseFullSyllabus {
  const engMathChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Engineering Mathematics & Discrete Mathematics',
      description: 'Linear Algebra (Eigenvalues/Eigenvectors, Cayley-Hamilton), Calculus (Limits, Maxima/Minima), Probability (Bayes Theorem), Propositional Logic & Graph Theory',
      subtopics: [
        {
          id: 'gate_m_sub1',
          title: 'Linear Algebra & Discrete Math',
          microTopics: [
            { id: 'gate_m_1', title: 'Eigenvalues, Eigenvectors & Cayley-Hamilton Theorem', keyAxiom: 'Sum of eigenvalues = Trace of matrix; Product of eigenvalues = Determinant' },
            { id: 'gate_m_2', title: 'Graph Theory (Handshaking Lemma, Planar Graphs E â‰¤ 3V - 6)', keyAxiom: 'Sum of degrees of all vertices = 2 Ã— Number of Edges' }
          ]
        }
      ],
      microTopics: [
        { id: 'gate_m_1', topicTitle: 'Eigenvalues, Cayley-Hamilton Theorem, Handshaking Lemma & Bayes Rule', subtopic: 'Matrix characteristic equation |A - Î»I| = 0, Planar graph Euler formula V - E + F = 2', dayNumber: 1, periodNumber: 1, keyFormulaOrLaw: 'Trace(A) = Î£ Î»_i | Det(A) = Î  Î»_i | Handshaking: Î£ deg(v) = 2|E| | Euler Formula: V - E + F = 2', keyPoints: ['Every square matrix satisfies its own characteristic equation (Cayley-Hamilton)', 'In a planar connected graph with V â‰¥ 3, number of edges E â‰¤ 3V - 6'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  const csCoreChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Operating Systems & Database Management Systems (DBMS)',
      description: 'CPU Scheduling, Semaphores & Mutex, Deadlock (Banker\'s Algorithm), Virtual Memory (Page replacement), SQL, B+ Trees, Normalization (BCNF/3NF), ACID & Conflict Serializability',
      subtopics: [
        {
          id: 'gate_cs_sub1',
          title: 'Operating Systems & DBMS Core',
          microTopics: [
            { id: 'gate_cs_1', title: 'Semaphores, Deadlock Banker Algorithm & Virtual Memory Paging', keyAxiom: 'Deadlock 4 conditions: Mutual exclusion, Hold & Wait, No preemption, Circular wait' },
            { id: 'gate_cs_2', title: 'Database Normalization (3NF vs BCNF) & Conflict Serializability', keyAxiom: 'Precedence graph cycle check for conflict serializability' }
          ]
        }
      ],
      microTopics: [
        { id: 'gate_cs_1', topicTitle: 'Banker Algorithm, Paging TLB Hit Ratio & BCNF Normalization', subtopic: 'Effective Memory Access Time EMAT = h(t_tlb + t_m) + (1-h)(t_tlb + 2t_m), Conflict Serializability graph', dayNumber: 2, periodNumber: 2, keyFormulaOrLaw: 'EMAT = h(t_TLB + t_m) + (1 - h)(t_TLB + 2t_m) | BCNF Condition: For every X -> Y, X must be a Super Key', keyPoints: ['Strict 2PL prevents cascading rollbacks and guarantees serializability', 'Page fault occurs when referenced page is not present in main memory frame'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: 'Computer Networks, Theory of Computation (TOC) & Compiler Design',
      description: 'TCP 3-Way Handshake, Flow control (Sliding Window, Go-Back-N, Selective Repeat), Subnetting CIDR, Regular Expressions, DFA/NFA minimization, Turing Machines, LL(1) / LR(1) Parsers',
      subtopics: [
        {
          id: 'gate_cs_sub2',
          title: 'Networks, TOC & Compilers',
          microTopics: [
            { id: 'gate_cs_3', title: 'Sliding Window Protocols (GBN vs SR) & Subnetting CIDR', keyAxiom: 'Efficiency Î· = N / (1 + 2a) where a = Propagation Time / Transmission Time' },
            { id: 'gate_cs_4', title: 'DFA Minimization (Myhill-Nerode) & LL(1) Parsing Table', keyAxiom: 'A grammar is LL(1) if FIRST and FOLLOW sets have no common intersection' }
          ]
        }
      ],
      microTopics: [
        { id: 'gate_cs_3', topicTitle: 'Sliding Window Efficiency (GBN / SR), DFA Minimization & LL(1) Parsing', subtopic: 'Go-Back-N window size N = 1 + 2a, Selective Repeat N = 2^(k-1), Pumping Lemma for regular languages', dayNumber: 3, periodNumber: 3, keyFormulaOrLaw: 'Sliding Window Efficiency Î· = N / (1 + 2a) | a = T_p / T_t | IPv4 Subnet Mask /26 = 255.255.255.192 (64 IPs)', keyPoints: ['Selective Repeat uses window size 2^(k-1) to avoid sequence number overlap', 'Halting problem of Turing Machine is undecidable'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  const subjects: SyllabusSubject[] = [
    { subjectId: 'gate_math', subjectName: 'Engineering Mathematics & Discrete Math', icon: 'ðŸ“', color: '#06b6d4', totalChapters: engMathChapters.length, totalMicroTopics: engMathChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: engMathChapters },
    { subjectId: 'gate_cs', subjectName: 'Computer Science Core (OS, DBMS, Networks, TOC & Compilers)', icon: 'ðŸ’»', color: '#8b5cf6', totalChapters: csCoreChapters.length, totalMicroTopics: csCoreChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: csCoreChapters }
  ];

  return {
    courseId: courseId || 'exam-gate-cs',
    courseTitle: courseTitle || 'GATE Computer Science & Information Technology Master Blueprint',
    category: 'gate_engineering',
    board: 'IIT / IISc GATE Committee',
    medium: 'English',
    totalDays: 240,
    totalSubjects: subjects.length,
    totalChapters: subjects.reduce((a, s) => a + s.chapters.length, 0),
    totalMicroTopics: subjects.reduce((a, s) => a + s.chapters.reduce((acc, c) => acc + (c.microTopics?.length || 0), 0), 0),
    subjects
  };
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 9I. KIDS SKILLS & FOUNDATIONAL CODING (SCRATCH, VEDIC MATHS, ROBOTICS)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function getKidsSkillsCompleteSyllabus(courseId: string, courseTitle: string): CourseFullSyllabus {
  const scratchChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Scratch 3.0 Visual Block Coding & Interactive Animation',
      description: 'Sprites, Backdrops, Motion blocks, Loops (Repeat, Forever), Events (When Green Flag Clicked), Sound & Scoring',
      subtopics: [
        {
          id: 'kid_sc_sub1',
          title: 'Sprites, Loops & Events',
          microTopics: [
            { id: 'kid_sc_1', title: 'Scratch Basics: Sprites, Motion, Costumes & Animation Loops', keyAxiom: 'When Green Flag Clicked -> Forever [Move 10 steps, If on edge, bounce]' },
            { id: 'kid_sc_2', title: 'Game Development: Score Variables & Collision Detection', keyAxiom: 'If <touching Player?> then [Change Score by 1, Play Sound, Hide]' }
          ]
        }
      ],
      microTopics: [
        { id: 'kid_sc_1', topicTitle: 'Scratch Basics: Sprites, Motion, Costumes & Animation Loops', subtopic: 'Moving 10 steps, Bounce on edge, Next costume for walking animation, Forever repeat blocks', dayNumber: 1, periodNumber: 1, keyFormulaOrLaw: 'Scratch Event: When Green Flag Clicked -> Forever [Move (10) steps, If on edge, bounce]', keyPoints: ['XY Coordinate plane in Scratch: Center is (0, 0), X is -240 to 240, Y is -180 to 180', 'Costume switching creates smooth animated movement'], type: 'concept', importance: 'Foundational' },
        { id: 'kid_sc_2', topicTitle: 'Game Development: Score Variables, Sensing & Collision Detection', subtopic: 'Create Score variable, Sensing touching mouse-pointer/color, If-Else conditional logic, Win/Lose backdrop switch', dayNumber: 4, periodNumber: 1, keyFormulaOrLaw: 'Game Logic: If <touching [Player]?> then [Change [Score] by (1), Play Sound, Hide]', keyPoints: ['Variables store changing values like Score, Lives, and Timer', 'Broadcasting messages coordinates actions between different sprites'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  const vedicMathsChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Vedic Maths: Rapid Mental Calculation Tricks & Speed Sutras',
      description: 'Ekadhikena Purvena (Squaring numbers ending in 5), Nikhilam multiplication base 10/100, Fast cross-addition and subtraction',
      subtopics: [
        {
          id: 'kid_vm_sub1',
          title: 'Speed Maths Sutras',
          microTopics: [
            { id: 'kid_vm_1', title: 'Squaring Numbers Ending in 5 & Fast Multiplication with 11', keyAxiom: '(n5)Â² = [n Ã— (n+1)] | 25' }
          ]
        }
      ],
      microTopics: [
        { id: 'kid_vm_1', topicTitle: 'Squaring Numbers Ending in 5 & Fast Multiplication with 11', subtopic: '35Â² = (3Ã—4)|25 = 1225, 45Ã—11 = 4|(4+5)|5 = 495, 2-second rapid mental math calculations', dayNumber: 2, periodNumber: 2, keyFormulaOrLaw: 'Vedic Sutra: (n5)Â² = [n Ã— (n + 1)] followed by 25 | Multiplication by 11: ab Ã— 11 = a | (a+b) | b', keyPoints: ['Ekadhikena Purvena means "By one more than the previous one"', 'Multiplication with 99, 999 using base deviation subtraction'], type: 'solved_problem', importance: 'High-Yield' }
      ]
    }
  ];

  const roboticsChapters: SyllabusChapter[] = [
    {
      chapterNumber: 1,
      chapterTitle: 'Robotics, Electronics & IoT Foundations (Arduino & Sensors)',
      description: 'Circuits, Breadboards, LEDs, Ultrasonic distance sensors, Motors, Arduino microcontroller coding',
      subtopics: [
        {
          id: 'kid_rob_sub1',
          title: 'Circuits & Sensors',
          microTopics: [
            { id: 'kid_rob_1', title: 'Arduino Microcontroller & Ultrasonic Obstacle Avoidance', keyAxiom: 'Distance = (Travel Time Ã— Speed of Sound) / 2' }
          ]
        }
      ],
      microTopics: [
        { id: 'kid_rob_1', topicTitle: 'Arduino Microcontroller, Breadboard Circuits & Ultrasonic Sensor', subtopic: 'Connecting LED resistors, Reading ultrasonic sensor pulse, Motor driver L298N', dayNumber: 3, periodNumber: 3, keyFormulaOrLaw: 'Ohm Law: V = IR | Ultrasonic: Distance = (Duration Ã— 0.034) / 2 cm', keyPoints: ['Anode is longer positive leg of LED; Cathode is shorter negative leg', 'Arduino void setup() runs once; void loop() runs repeatedly'], type: 'concept', importance: 'High-Yield' }
      ]
    }
  ];

  const subjects: SyllabusSubject[] = [
    { subjectId: 'kid_scratch', subjectName: 'Scratch 3.0 Block Coding & Game Studio', icon: 'ðŸ±', color: '#f59e0b', totalChapters: scratchChapters.length, totalMicroTopics: scratchChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: scratchChapters },
    { subjectId: 'kid_vedic', subjectName: 'Vedic Maths & Lightning Speed Calculations', icon: '⚡', color: '#06b6d4', totalChapters: vedicMathsChapters.length, totalMicroTopics: vedicMathsChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: vedicMathsChapters },
    { subjectId: 'kid_robotics', subjectName: 'Robotics, Electronics & Smart IoT Studio', icon: 'ðŸ¤–', color: '#10b981', totalChapters: roboticsChapters.length, totalMicroTopics: roboticsChapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0), chapters: roboticsChapters }
  ];

  return {
    courseId: courseId || 'kids-scratch-ai',
    courseTitle: courseTitle || 'Kids Coding Studio, Scratch, Robotics & Vedic Speed Maths',
    category: 'kids_skills',
    board: 'Foundational STEM',
    medium: 'English',
    totalDays: 100,
    totalSubjects: subjects.length,
    totalChapters: subjects.reduce((a, s) => a + s.chapters.length, 0),
    totalMicroTopics: subjects.reduce((a, s) => a + s.chapters.reduce((acc, c) => acc + (c.microTopics?.length || 0), 0), 0),
    subjects
  };
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 10. MASTER DISPATCHER FOR ALL 86 COURSES
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function resolveCompleteCourseSyllabus(
  courseId: string,
  courseTitle: string
): CourseFullSyllabus {
  const c = (courseId || '').toLowerCase();
  const title = courseTitle || 'Standard Curriculum';
  const isTa = title.includes('தமிழ்') || c.includes('-ta-');

  // 1. UPSC Mains Optionals Track (Top 10 Subjects)
  if (c.includes('exam-upsc-opt-') || c.includes('-opt-')) {
    return getUpscOptionalSubjectSyllabus(courseId, title);
  }

  // 2. JEE Main & JEE Advanced Entrance Track
  if (c.includes('jee')) {
    return getJeeMainAdvancedCompleteSyllabus(courseId, title);
  }

  // 3. UPSC Civil Services (IAS / IPS / IFS / IRS) Central Track
  if (c.includes('upsc') || c.includes('ias') || c.includes('central-services')) {
    return getUpscCivilServicesCompleteSyllabus(courseId, title);
  }

  // 4. NEET UG Entrance
  if (c.includes('neet')) {
    return getNeetUgCompleteSyllabus();
  }

  // 5. TNUSRB Tamil Nadu Police (SI & Constable) Track
  if (c.includes('police') || c.includes('tnusrb') || c.includes('si-') || c.includes('constable') || c.includes('sub-inspector')) {
    return getTamilNaduPoliceCompleteSyllabus(courseId, title);
  }

  // 6. TNPSC Exams Track (All Groups 1, 2, 4, VAO, DEO)
  if (c.includes('tnpsc') || c.includes('vao') || c.includes('group-1') || c.includes('group-2') || c.includes('group-4') || c.includes('grp1') || c.includes('grp2') || c.includes('grp4')) {
    return getTnpscUnifiedCompleteSyllabus(courseId, title);
  }

  // 7. Banking & Insurance Track (IBPS PO/Clerk, SBI PO/Clerk, RBI Assistant)
  if (c.includes('bank') || c.includes('ibps') || c.includes('sbi') || c.includes('rbi') || c.includes('po-') || c.includes('clerk')) {
    return getBankingAndInsuranceCompleteSyllabus(courseId, title);
  }

  // 8. SSC & Railway Exams Track (SSC CGL / CHSL / MTS & RRB NTPC / Group D)
  if (c.includes('ssc') || c.includes('cgl') || c.includes('chsl') || c.includes('mts') || c.includes('rrb') || c.includes('railway') || c.includes('ntpc')) {
    return getSscAndRailwayCompleteSyllabus(courseId, title);
  }

  // 9. TRB & Teaching Exams Track (TRB PG/BT, TNTET Paper 1 & 2)
  if (c.includes('trb') || c.includes('tet') || c.includes('tntet') || c.includes('teacher') || c.includes('bed') || c.includes('ugc-net')) {
    return getTrbAndTeacherExamsCompleteSyllabus(courseId, title);
  }

  // 10. GATE & Engineering Core Track
  if (c.includes('gate') || c.includes('engineering') || c.includes('btech')) {
    return getGateAndEngineeringCompleteSyllabus(courseId, title);
  }

  // 11. Kids Skills (Scratch, Vedic Maths, Robotics)
  if (c.includes('kids') || c.includes('scratch') || c.includes('vedic') || c.includes('robotics')) {
    return getKidsSkillsCompleteSyllabus(courseId, title);
  }

  // 12. Tech & College Degrees Track (Python, Full-Stack, Web, Mobile, DSA, AI/ML, BCA, B.Sc)
  if (c.includes('skill') || c.includes('python') || c.includes('react') || c.includes('fullstack') || c.includes('web') || c.includes('dsa') || c.includes('code') || c.includes('degree') || c.includes('college') || c.includes('bca')) {
    return getCollegeAndTechSkillsCompleteSyllabus(courseId, title);
  }

  // 13. Class 11 & 12 Commerce Track (CBSE, State Board, Matric)
  if (c.includes('11-com') || c.includes('12-com') || c.includes('commerce') || c.includes('accountancy')) {
    return getCommerceClass11Syllabus(courseId, title);
  }

  // 9. Class 11 & 12 Science Track (Higher Secondary Bio-Maths / Computer Science)
  if (c.includes('-11') || c.includes('-12') || c.includes('std-11') || c.includes('std-12') || c.includes('grade-11') || c.includes('grade-12') || c.includes('hsc') || c.includes('plus-one') || c.includes('plus-two')) {
    return getHigherSecondaryScienceCompleteSyllabus(courseId, title);
  }

  // 10. KINDERGARTEN (LKG & UKG)
  if (c.includes('lkg') || c.includes('ukg') || c.includes('kindergarten')) {
    const subjects: SyllabusSubject[] = [
      {
        subjectId: 'kg_tamil',
        subjectName: isTa ? 'à®¤à®®à®¿à®´à¯ à®®à®´à®²à¯ˆà®¯à®°à¯ à®ªà®¾à®Ÿà®²à¯ & à®‰à®¯à®¿à®°à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à¯à®•à®³à¯' : 'Tamil Rhymes & Vowels (Uyir Ezhuthukkal)',
        icon: '🔤',
        color: '#ec4899',
        totalChapters: 2,
        totalMicroTopics: 6,
        chapters: [
          {
            chapterNumber: 1,
            chapterTitle: 'à®‰à®¯à®¿à®°à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯ 12 & à®®à®´à®²à¯ˆà®¯à®°à¯ à®ªà®¾à®²à®°à¯ à®ªà®¾à®Ÿà®²à¯à®•à®³à¯',
            description: 'à®… à®®à¯à®¤à®²à¯ à®” à®µà®°à¯ˆ à®‰à®³à¯à®³ 12 à®‰à®¯à®¿à®°à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯ à®®à®±à¯à®±à¯à®®à¯ à®¨à®¿à®²à®¾ à®¨à®¿à®²à®¾ à®“à®Ÿà®¿ à®µà®¾ à®ªà®¾à®Ÿà®²à¯à®•à®³à¯',
            microTopics: [
              { id: 'kg_t_1', topicTitle: 'à®… à®®à¯à®¤à®²à¯ à®” à®µà®°à¯ˆ à®‰à®¯à®¿à®°à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯ (à®…à®®à¯à®®à®¾, à®†à®Ÿà¯, à®‡à®²à¯ˆ, à®ˆà®Ÿà¯à®Ÿà®¿)', subtopic: 'à®ªà®Ÿà®™à¯à®•à®³à¯ à®ªà®¾à®°à¯à®¤à¯à®¤à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à®³à¯ˆ à®…à®Ÿà¯ˆà®¯à®¾à®³à®®à¯ à®•à®¾à®£à¯à®¤à®²à¯', dayNumber: 1, periodNumber: 1, keyFormulaOrLaw: 'à®‰à®¯à®¿à®°à¯ à®Žà®´à¯à®¤à¯à®¤à¯à®•à¯à®•à®³à¯: à®…, à®†, à®‡, à®ˆ, à®‰, à®Š, à®Ž, à®, à®, à®’, à®“, à®”', keyPoints: ['à®… - à®…à®£à®¿à®²à¯, à®…à®®à¯à®®à®¾', 'à®† - à®†à®Ÿà¯, à®†à®²à®®à®°à®®à¯'], type: 'concept', importance: 'Foundational' }
            ]
          }
        ]
      },
      {
        subjectId: 'kg_english',
        subjectName: 'English Phonics & Alphabets (A to Z)',
        icon: '🔤',
        color: '#3b82f6',
        totalChapters: 2,
        totalMicroTopics: 6,
        chapters: [
          {
            chapterNumber: 1,
            chapterTitle: 'Phonics Sounds: Letters A to Z & Classic Nursery Rhymes',
            description: 'Letter sounds, picture matching, and CVC 3-letter word blending',
            microTopics: [
              { id: 'kg_e_1', topicTitle: 'Letters A to Z Phonics & Nursery Rhymes', subtopic: 'Apple, Ball, Cat, Dog, Elephant phonics sounds and Twinkle Twinkle rhyme', dayNumber: 1, periodNumber: 2, keyFormulaOrLaw: 'Phonics: /æ/ /b/ /k/ /d/ | 26 English Alphabets A to Z', keyPoints: ['Letter tracing inside lines', 'Object recognition'], type: 'concept', importance: 'Foundational' }
            ]
          }
        ]
      },
      {
        subjectId: 'kg_maths',
        subjectName: 'Fun Maths & Numbers (1 to 20)',
        icon: 'ðŸ”¢',
        color: '#06b6d4',
        totalChapters: 2,
        totalMicroTopics: 6,
        chapters: [
          {
            chapterNumber: 1,
            chapterTitle: 'Counting Numbers 1 to 20 & 2D Shapes',
            description: 'Count with fun objects, Circle, Square, Triangle, Big vs Small',
            microTopics: [
              { id: 'kg_m_1', topicTitle: 'Numbers 1 to 20: Counting, Shapes & Comparison', subtopic: '1 Sun, 2 Shoes, 3 Stars, Circle, Square, Big elephant vs small mouse', dayNumber: 1, periodNumber: 3, keyFormulaOrLaw: 'Counting 1 to 20 | Circle (Round) | Triangle (3 sides) | Square (4 sides)', keyPoints: ['Finger counting and pattern recognition', 'Big vs Small visual comparison'], type: 'concept', importance: 'Foundational' }
            ]
          }
        ]
      },
      {
        subjectId: 'kg_evs',
        subjectName: 'EVS, Nature, Animals & Good Habits',
        icon: 'ðŸŒ¿',
        color: '#10b981',
        totalChapters: 2,
        totalMicroTopics: 6,
        chapters: [
          {
            chapterNumber: 1,
            chapterTitle: 'My 5 Senses, Friendly Animals & Magic Manners',
            description: '5 senses (Eyes, Ears, Nose, Tongue, Skin), Domestic animals, Please/Thank You',
            microTopics: [
              { id: 'kg_ev_1', topicTitle: 'My 5 Senses, Animals & Magic Words ("Thank You", "Please")', subtopic: 'Eyes to see, Ears to hear, Nose to smell, Tongue to taste, Skin to touch', dayNumber: 1, periodNumber: 4, keyFormulaOrLaw: '5 Sense Organs | Magic Words: "Please" and "Thank You"', keyPoints: ['Domestic animals (Dog, Cat, Cow)', 'Daily hygiene and handwashing'], type: 'concept', importance: 'Foundational' }
            ]
          }
        ]
      }
    ];

    return {
      courseId,
      courseTitle: title,
      category: 'kindergarten',
      board: 'TNSB / CBSE / Matric',
      medium: isTa ? 'Tamil' : 'English',
      totalDays: 200,
      totalSubjects: subjects.length,
      totalChapters: subjects.reduce((a, s) => a + s.chapters.length, 0),
      totalMicroTopics: subjects.reduce((a, s) => a + (s.totalMicroTopics || s.chapters.reduce((acc, c) => acc + (c.microTopics?.length || 0), 0)), 0),
      subjects
    };
  }

  // 11. SECONDARY STAGE (Class 9 & Class 10 SSLC)
  if (c.includes('-10') || c.includes('-9') || c.includes('10th') || c.includes('9th') || c.includes('10_') || c.includes('9_') || c.includes('std-10') || c.includes('std-9') || c.includes('grade-10') || c.includes('grade-9') || c.includes('sslc')) {
    return getSecondaryClass9to10Syllabus(courseId, title);
  }

  // 12. MIDDLE STAGE (Class 6, 7, 8)
  if (c.includes('-6') || c.includes('-7') || c.includes('-8') || c.includes('6th') || c.includes('7th') || c.includes('8th') || c.includes('6_') || c.includes('7_') || c.includes('8_') || c.includes('std-6') || c.includes('std-7') || c.includes('std-8') || c.includes('grade-6') || c.includes('grade-7') || c.includes('grade-8') || c.includes('middle') || c.includes('class-6') || c.includes('class_6')) {
    return getMiddleClass6to8Syllabus(courseId, title);
  }

  // 13. TNPSC & GENERAL STUDIES SUB-TOPICS (Tamil, GK, Polity, History, Science)
  if (c.includes('à®ªà¯Šà®°à¯à®¤à¯à®¤à¯à®¤à®²à¯') || c.includes('à®‡à®²à®•à¯à®•à®£à®®à¯') || c.includes('à®µà¯‡à®°à¯à®šà¯à®šà¯Šà®²à¯') || c.includes('à®¤à®®à®¿à®´à¯') || c.includes('tamil') || c.includes('à®µà®°à®²à®¾à®±à¯') || c.includes('à®…à®°à®šà®¿à®¯à®²à¯') || c.includes('à®ªà¯à®µà®¿à®¯à®¿à®¯à®²à¯') || c.includes('à®ªà¯Šà®°à¯à®³à®¾à®¤à®¾à®°à®®à¯') || c.includes('gk') || c.includes('rrb') || c.includes('constitution') || c.includes('à®ªà¯†à®°à®¿à®¯à®¾à®°à¯') || c.includes('à®ªà®¾à®°à®¤à®¿à®¯à®¾à®°à¯') || c.includes('à®…à®£à¯à®£à®¾') || c.includes('à®•à®¾à®®à®°à®¾à®šà®°à¯') || c.includes('à®°à®¾à®œà®¾à®œà®¿') || c.includes('à®µà®¿à®°à¯à®¤à¯à®•à®³à¯')) {
    return getTnpscUnifiedCompleteSyllabus(courseId, title);
  }

  // 14. PREPARATORY STAGE (Class 3, 4, 5)
  if (c.includes('-3') || c.includes('-4') || c.includes('-5') || c.includes('3rd') || c.includes('4th') || c.includes('5th') || c.includes('std-3') || c.includes('std-4') || c.includes('std-5') || c.includes('grade-3') || c.includes('grade-4') || c.includes('grade-5')) {
    return getPreparatoryClass3to5Syllabus(courseId, title);
  }

  // 15. FOUNDATIONAL STAGE (Class 1 & Class 2)
  if (c.includes('-1') || c.includes('-2') || c.includes('1st') || c.includes('2nd') || c.includes('std-1') || c.includes('std-2') || c.includes('grade-1') || c.includes('grade-2')) {
    return getFoundationalClass1to2Syllabus(courseId, title);
  }

  // 16. DEFAULT FALLBACK
  return getTnpscUnifiedCompleteSyllabus(courseId, title);
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 11. AUGMENTED SYLLABUS RESOLVER (BUILT-IN + DYNAMIC ADMIN ADDITIONS)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function getAugmentedCourseSyllabus(
  courseId: string,
  courseTitle?: string
): CourseFullSyllabus {
  const base = resolveCompleteCourseSyllabus(courseId, courseTitle || '');
  
  if (typeof window === 'undefined') return base;
  
  try {
    const raw = localStorage.getItem(`teacho_custom_syllabus_${courseId}`);
    if (!raw) return base;
    const customItems: Array<{
      subjectName: string;
      subjectIcon?: string;
      subjectColor?: string;
      chapterNumber?: number;
      chapterTitle: string;
      chapterDescription?: string;
      microTopic: SyllabusMicroTopic;
    }> = JSON.parse(raw);

    if (!Array.isArray(customItems) || customItems.length === 0) return base;

    // Deep clone base subjects
    const subjects = base.subjects.map(s => ({
      ...s,
      chapters: s.chapters.map(c => ({
        ...c,
        microTopics: [...(c.microTopics || [])]
      }))
    }));

    for (const item of customItems) {
      let subj = subjects.find(s => 
        s.subjectName.toLowerCase().includes(item.subjectName.toLowerCase()) || 
        item.subjectName.toLowerCase().includes(s.subjectName.toLowerCase())
      );
      if (!subj) {
        subj = {
          subjectId: `custom_subj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          subjectName: item.subjectName,
          icon: item.subjectIcon || '📚',
          color: item.subjectColor || '#06b6d4',
          totalChapters: 1,
          totalMicroTopics: 1,
          chapters: []
        };
        subjects.push(subj);
      }

      let chap = subj.chapters.find(c => 
        c.chapterTitle.toLowerCase().includes(item.chapterTitle.toLowerCase()) || 
        item.chapterTitle.toLowerCase().includes(c.chapterTitle.toLowerCase())
      );
      if (!chap) {
        chap = {
          chapterNumber: item.chapterNumber || (subj.chapters.length + 1),
          chapterTitle: item.chapterTitle,
          description: item.chapterDescription || `Chapter covering ${item.chapterTitle}`,
          microTopics: []
        };
        subj.chapters.push(chap);
      }

      if (!chap.microTopics) chap.microTopics = [];
      const exists = chap.microTopics.some(t => t.id === item.microTopic.id || t.topicTitle === item.microTopic.topicTitle);
      if (!exists) {
        chap.microTopics.push(item.microTopic);
      }

      subj.totalChapters = subj.chapters.length;
      subj.totalMicroTopics = subj.chapters.reduce((acc, ch) => acc + (ch.microTopics?.length || 0), 0);
    }

    return {
      ...base,
      totalSubjects: subjects.length,
      totalChapters: subjects.reduce((acc, s) => acc + (s.totalChapters || s.chapters.length), 0),
      totalMicroTopics: subjects.reduce((acc, s) => acc + (s.totalMicroTopics || s.chapters.reduce((a, ch) => a + (ch.microTopics?.length || 0), 0)), 0),
      subjects
    };
  } catch (err) {
    console.warn('Could not augment custom syllabus:', err);
    return base;
  }
}
