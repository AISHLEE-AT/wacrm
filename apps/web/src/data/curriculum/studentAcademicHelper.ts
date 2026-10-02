/**
 * TutO Student Academic Class Helper
 * Normalizes and resolves registered student class, course IDs, grade labels, and relevant subjects.
 */

export interface StudentAcademicInfo {
  rawClass: string;
  gradeNumber: number | null;
  gradeLabel: string;
  standardName: string;
  displayName: string;
  schoolCourseId: string;
  subjects: string[];
}

const DEFAULT_SUBJECTS_K10 = ['Mathematics', 'Science', 'Social Science', 'Tamil', 'English'];
const DEFAULT_SUBJECTS_HSC = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English', 'Accountancy', 'Commerce'];
const DEFAULT_SUBJECTS_PRIMARY = ['Mathematics', 'Environmental Studies', 'Tamil', 'English'];
const DEFAULT_SUBJECTS_KG = ['English Phonics', 'Number Magic', 'Tamil', 'Nature & EVS'];

export function parseAcademicClass(classIdentifier?: string | null): StudentAcademicInfo {
  const raw = (classIdentifier || '').trim();

  // 1. Kindergarten cases
  if (/lkg/i.test(raw)) {
    return {
      rawClass: raw || 'class_lkg',
      gradeNumber: null,
      gradeLabel: 'LKG',
      standardName: 'LKG (Lower KG)',
      displayName: 'LKG (Lower Kindergarten)',
      schoolCourseId: 'school-lkg',
      subjects: DEFAULT_SUBJECTS_KG,
    };
  }

  if (/ukg/i.test(raw)) {
    return {
      rawClass: raw || 'class_ukg',
      gradeNumber: null,
      gradeLabel: 'UKG',
      standardName: 'UKG (Upper KG)',
      displayName: 'UKG (Upper Kindergarten)',
      schoolCourseId: 'school-ukg',
      subjects: DEFAULT_SUBJECTS_KG,
    };
  }

  // 2. Standard numeric extraction (e.g. 'class_10', 'school-std-10', 'Class 10 Standard', '10')
  const numMatch = raw.match(/\b([1-9]|1[0-2])\b/) || raw.match(/std[_-]?(\d+)/i) || raw.match(/class[_-]?(\d+)/i);
  const num = numMatch ? parseInt(numMatch[1], 10) : null;

  if (num !== null && num >= 1 && num <= 12) {
    const suffix = num === 1 ? 'st' : num === 2 ? 'nd' : num === 3 ? 'rd' : 'th';
    const gradeLabel = `${num}${suffix} Std`;
    const standardName = `Class ${num} Standard`;
    let displayName = `Class ${num}th Standard`;
    if (num === 10) displayName = 'Class 10th (SSLC)';
    else if (num === 11) displayName = 'Class 11th (HSC +1)';
    else if (num === 12) displayName = 'Class 12th (HSC +2)';
    else if (num === 5) displayName = 'Class 5th Std (Primary)';

    const schoolCourseId = `school-std-${num}`;
    let subjects = DEFAULT_SUBJECTS_K10;
    if (num <= 4) subjects = DEFAULT_SUBJECTS_PRIMARY;
    else if (num >= 11) subjects = DEFAULT_SUBJECTS_HSC;

    return {
      rawClass: raw || `class_${num}`,
      gradeNumber: num,
      gradeLabel,
      standardName,
      displayName,
      schoolCourseId,
      subjects,
    };
  }

  // 3. College / Competitive fallbacks
  if (/college/i.test(raw)) {
    return {
      rawClass: raw,
      gradeNumber: null,
      gradeLabel: 'College',
      standardName: 'College Degree',
      displayName: 'College / Degree (UG/PG)',
      schoolCourseId: 'college-degree',
      subjects: ['Core Major', 'Allied Discipline', 'General Aptitude', 'Communication'],
    };
  }

  if (/competitive|tnpsc|upsc/i.test(raw)) {
    return {
      rawClass: raw,
      gradeNumber: null,
      gradeLabel: 'Govt Exam',
      standardName: 'Competitive Exams',
      displayName: 'Competitive / Govt Exams',
      schoolCourseId: 'tnpsc-group4',
      subjects: ['பொதுத்தமிழ்', 'Indian Polity', 'TN History & Culture', 'Aptitude & Mental Ability'],
    };
  }

  // 4. Default: Class 10th Standard if unspecified
  return {
    rawClass: raw || 'class_10',
    gradeNumber: 10,
    gradeLabel: '10th Std',
    standardName: 'Class 10 Standard',
    displayName: 'Class 10th (SSLC)',
    schoolCourseId: 'school-std-10',
    subjects: DEFAULT_SUBJECTS_K10,
  };
}

/**
 * Reads the registered class from browser localStorage if available.
 */
export function getRegisteredStudentClass(): StudentAcademicInfo {
  if (typeof window === 'undefined') {
    return parseAcademicClass('class_10');
  }

  try {
    const stored =
      window.localStorage.getItem('student-academic-class') ||
      window.localStorage.getItem('tuto_student_registered_class') ||
      window.localStorage.getItem('user-course-id') ||
      window.localStorage.getItem('tuto_active_course_id');

    return parseAcademicClass(stored);
  } catch (_) {
    return parseAcademicClass('class_10');
  }
}
