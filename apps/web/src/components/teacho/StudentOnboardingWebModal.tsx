'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  GraduationCap,
  Sparkles,
  Award,
  BookOpen,
  Layers,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Target,
  User,
  School,
  Compass,
  Star,
  Check,
} from 'lucide-react';
import { createClient } from '../../lib/supabase/client';
import {
  ALL_COURSES,
  CourseOption,
  SchoolBoard,
  SCHOOL_BOARDS,
  FEATURED_JUNIOR_COURSES,
} from '../../data/coursesCatalog';
import { setEnrollmentDate } from '@/data/curriculum/wholeYearDayPlanEngine';

export interface StudentProfileData {
  fullName: string;
  academicClass: string;
  schoolBoard: SchoolBoard;
  areaOfInterest: string;
  enrolledCourseId: string;
}

interface StudentOnboardingWebModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (course: CourseOption, board: SchoolBoard, profile: StudentProfileData) => void;
  initialName?: string;
  userPhone?: string;
}

const ACADEMIC_CLASSES = [
  { id: 'class_1', label: 'Class 1st Std', gradeLevel: 'primary', category: 'school_k12' },
  { id: 'class_2', label: 'Class 2nd Std', gradeLevel: 'primary', category: 'school_k12' },
  { id: 'class_3', label: 'Class 3rd Std', gradeLevel: 'primary', category: 'school_k12' },
  { id: 'class_4', label: 'Class 4th Std', gradeLevel: 'primary', category: 'school_k12' },
  { id: 'class_5', label: 'Class 5th Std (Primary)', gradeLevel: 'primary', category: 'school_k12' },
  { id: 'class_6', label: 'Class 6th Std (Middle)', gradeLevel: 'middle', category: 'school_k12' },
  { id: 'class_7', label: 'Class 7th Std (Middle)', gradeLevel: 'middle', category: 'school_k12' },
  { id: 'class_8', label: 'Class 8th Std (Middle)', gradeLevel: 'middle', category: 'school_k12' },
  { id: 'class_9', label: 'Class 9th Std (High)', gradeLevel: 'high', category: 'school_k12' },
  { id: 'class_10', label: 'Class 10th (SSLC)', gradeLevel: 'high', category: 'school_k12' },
  { id: 'class_11', label: 'Class 11th (HSC +1)', gradeLevel: 'hsc', category: 'school_k12' },
  { id: 'class_12', label: 'Class 12th (HSC +2)', gradeLevel: 'hsc', category: 'school_k12' },
  { id: 'college_ug', label: 'College / Degree (UG/PG)', gradeLevel: 'college', category: 'college_degree' },
  { id: 'competitive', label: 'Competitive / Govt Exams', gradeLevel: 'exam', category: 'tnpsc' },
];

const CAREER_INTERESTS = [
  { id: 'civil_services', label: 'Civil Services / IAS / Administration', icon: '🏛️', color: '#F59E0B', recommendedCourseId: 'jr-ias' },
  { id: 'auditor_ca', label: 'Chartered Accountant & Auditor (CA / Finance)', icon: '📊', color: '#10B981', recommendedCourseId: 'jr-ar' },
  { id: 'medical_neet', label: 'Medical & Healthcare (NEET / Doctor)', icon: '🩺', color: '#EC4899', recommendedCourseId: 'jr-dr' },
  { id: 'engineering_ai', label: 'Engineering, Coding & AI (JEE / Tech)', icon: '💻', color: '#3B82F6', recommendedCourseId: 'jr-er' },
  { id: 'police_defense', label: 'Police, Armed Forces & Defense', icon: '👮', color: '#10B981', recommendedCourseId: 'jr-ips' },
  { id: 'business_banking', label: 'Business, Banking & Corporate CEO', icon: '🏦', color: '#06B6D4', recommendedCourseId: 'jr-ceo' },
  { id: 'science_research', label: 'Pure Science & Space Research (ISRO)', icon: '🔬', color: '#14B8A6', recommendedCourseId: 'jr-scientist' },
  { id: 'law_judiciary', label: 'Law, Justice & Judiciary (Judge / Advocate)', icon: '⚖️', color: '#8B5CF6', recommendedCourseId: 'jr-judge' },
];

export const StudentOnboardingWebModal: React.FC<StudentOnboardingWebModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  initialName = '',
  userPhone = '',
}) => {
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: Profile fields
  const [fullName, setFullName] = useState(initialName || 'SuprO Scholar');
  const [selectedClass, setSelectedClass] = useState('class_5');
  const [selectedBoard, setSelectedBoard] = useState<SchoolBoard>('TNSB');
  const [selectedInterest, setSelectedInterest] = useState('civil_services');


  // Step 2: Course Selection
  const [selectedCourseOption, setSelectedCourseOption] = useState<CourseOption | null>(null);
  const [coursePickType, setCoursePickType] = useState<'featured' | 'curriculum'>('featured');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialName) setFullName(initialName);
  }, [initialName]);

  // Find recommended featured course matching interest
  const recommendedFeaturedCourse = useMemo(() => {
    const interestObj = CAREER_INTERESTS.find((i) => i.id === selectedInterest);
    const targetCourseId = interestObj?.recommendedCourseId || 'jr-ias';
    return FEATURED_JUNIOR_COURSES.find((c: CourseOption) => c.id === targetCourseId) || FEATURED_JUNIOR_COURSES[0];
  }, [selectedInterest]);

  // Find class-matching curriculum courses
  const matchingClassCourses = useMemo(() => {
    if (selectedClass.includes('college')) {
      return ALL_COURSES.filter((c: CourseOption) => c.category === 'college_degree');
    }
    if (selectedClass.includes('competitive')) {
      return ALL_COURSES.filter((c: CourseOption) => ['tnpsc', 'banking_finance', 'ssc_railway', 'entrance'].includes(c.category));
    }
    const numMatch = selectedClass.replace(/\D/g, '');
    if (numMatch) {
      return ALL_COURSES.filter(
        (c: CourseOption) => c.category === 'school_k12' && (c.id.includes(numMatch) || c.title.includes(numMatch))
      );
    }
    return ALL_COURSES.filter((c: CourseOption) => c.category === 'school_k12');
  }, [selectedClass]);

  useEffect(() => {
    if (!selectedCourseOption) {
      if (coursePickType === 'featured') {
        setSelectedCourseOption(recommendedFeaturedCourse);
      } else if (matchingClassCourses.length > 0) {
        setSelectedCourseOption(matchingClassCourses[0]);
      }
    }
  }, [recommendedFeaturedCourse, matchingClassCourses, coursePickType]);

  const handleNextStep = () => {
    if (!fullName.trim()) {
      alert('Please enter your full name');
      return;
    }
    setStep(2);
    setSelectedCourseOption(recommendedFeaturedCourse);
  };

  const handleFinishOnboarding = async () => {
    const ambitionId = recommendedFeaturedCourse?.id || 'jr-ias';
    const numMatch = selectedClass.replace(/\D/g, '');
    let finalCourse = selectedCourseOption;
    if (!finalCourse && numMatch) {
      finalCourse = ALL_COURSES.find(c => c.id === `school-std-${numMatch}`) || ALL_COURSES.find(c => c.id === 'school-std-5');
    }
    if (!finalCourse) finalCourse = recommendedFeaturedCourse || ALL_COURSES[0];

    setIsSaving(true);

    try {
      localStorage.setItem('tuto_student_onboarding_completed', 'true');
      await setEnrollmentDate(finalCourse.id, new Date().toISOString());
      localStorage.setItem('tuto_active_course_id', finalCourse.id);
      localStorage.setItem('tuto_active_ambition_id', ambitionId);
      localStorage.setItem('tuto_student_registered_class', selectedClass);
      localStorage.setItem('tuto_student_registered_ambition', ambitionId);
      localStorage.setItem('tuto_student_registered_name', fullName.trim());
      localStorage.setItem(`tuto_selected_board_${finalCourse.id}`, selectedBoard);
      localStorage.setItem('user-name', fullName.trim());
      localStorage.setItem('student-academic-class', selectedClass);
      localStorage.setItem('student-area-interest', selectedInterest);

      const cleanPhone = (userPhone || localStorage.getItem('user-phone') || '').replace(/\D/g, '').slice(-10);
      try {
        fetch(`https://mysupro.duckdns.org/api/tuto/planner/today?phone=${encodeURIComponent(cleanPhone || 'anonymous')}&courseId=${encodeURIComponent(finalCourse.id)}&ambitionId=${encodeURIComponent(ambitionId)}&dayNumber=1`);
      } catch (_) {}

      // Save to Supabase
      const supabase = createClient();
      if (cleanPhone) {
        await supabase
          .from('profiles')
          .update({
            full_name: fullName.trim(),
            academic_class: selectedClass,
            school_board: selectedBoard,
            area_of_interest: selectedInterest,
            enrolled_course_id: finalCourse.id,
            updated_at: new Date().toISOString(),
          })
          .eq('phone', cleanPhone);
      }

      const profileData: StudentProfileData = {
        fullName: fullName.trim(),
        academicClass: selectedClass,
        schoolBoard: selectedBoard,
        areaOfInterest: selectedInterest,
        enrolledCourseId: finalCourse.id,
      };

      onComplete(finalCourse, selectedBoard, profileData);
      onClose();
    } catch (err) {
      console.warn('Error saving web student onboarding:', err);
      onComplete(finalCourse, selectedBoard, {
        fullName: fullName.trim(),
        academicClass: selectedClass,
        schoolBoard: selectedBoard,
        areaOfInterest: selectedInterest,
        enrolledCourseId: finalCourse.id,
      });
      onClose();
    } finally {

      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0b1120] border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-[#0E172A] border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase text-[#00D084] bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                Step {step} of 2
              </span>
              <span className="text-xs text-slate-400 font-semibold">TutO Academic Personalization</span>
            </div>
            <h3 className="text-base font-bold text-white">
              {step === 1 ? '🎓 Student & Career Profile' : '📚 Select Your Learning Track'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/60 rounded-xl transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scroll Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-800">
          {step === 1 ? (
            /* ─── STEP 1: IDENTITY, CLASS & CAREER INTEREST ─── */
            <div className="space-y-5">
              {/* 1. Student Name */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <User className="w-4 h-4 text-emerald-400" />
                  <span>Student Full Name</span>
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter student's name (e.g. Vignesh R)"
                  className="w-full bg-[#0E172A] border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              {/* 2. Current Class / Academic Level */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <School className="w-4 h-4 text-sky-400" />
                  <span>Current Class / Academic Level</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ACADEMIC_CLASSES.map((cls) => {
                    const isSelected = selectedClass === cls.id;
                    return (
                      <button
                        key={cls.id}
                        type="button"
                        onClick={() => setSelectedClass(cls.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                          isSelected
                            ? 'bg-sky-500/15 border border-sky-400 text-sky-400 font-extrabold shadow-sm'
                            : 'bg-[#0E172A] border border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {cls.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. School Board Curriculum */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>Educational Board & Standard</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  {SCHOOL_BOARDS.map((board: any) => {
                    const isSelected = selectedBoard === board.id;
                    return (
                      <button
                        key={board.id}
                        type="button"
                        onClick={() => setSelectedBoard(board.id)}
                        className={`p-3 rounded-xl text-left border transition ${
                          isSelected
                            ? 'bg-emerald-500/10 border-[#00D084] text-white shadow-md'
                            : 'bg-[#0E172A] border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${isSelected ? 'text-emerald-400' : 'text-slate-200'}`}>
                            {board.name}
                          </span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">{board.tagline}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Area of Interest / Dream Career Goal */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Target className="w-4 h-4 text-pink-400" />
                  <span>Dream Career Goal & Area of Interest</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  We will recommend customized daily leadership lessons and case studies matching this aspiration:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  {CAREER_INTERESTS.map((interest) => {
                    const isSelected = selectedInterest === interest.id;
                    return (
                      <button
                        key={interest.id}
                        type="button"
                        onClick={() => setSelectedInterest(interest.id)}
                        className={`p-3 rounded-xl text-left border flex flex-col gap-1 transition ${
                          isSelected
                            ? 'border-pink-500 bg-pink-500/10 text-white shadow-md'
                            : 'bg-[#0E172A] border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-xl">{interest.icon}</span>
                        <span
                          className={`text-[11px] font-bold leading-tight ${
                            isSelected ? 'text-pink-400 font-black' : 'text-slate-300'
                          }`}
                        >
                          {interest.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* ─── STEP 2: COURSE SELECTION ─── */
            <div className="space-y-4">
              {/* Type Switcher Tabs */}
              <div className="flex bg-[#0E172A] p-1 rounded-xl border border-slate-800 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCoursePickType('featured');
                    setSelectedCourseOption(recommendedFeaturedCourse);
                  }}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition ${
                    coursePickType === 'featured'
                      ? 'bg-[#00D084] text-[#070C18] font-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>⭐ Recommended Career Track</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCoursePickType('curriculum');
                    if (matchingClassCourses.length > 0) setSelectedCourseOption(matchingClassCourses[0]);
                  }}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition ${
                    coursePickType === 'curriculum'
                      ? 'bg-[#00D084] text-[#070C18] font-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>🏫 Class Curriculum Course</span>
                </button>
              </div>

              {/* Course Options */}
              {coursePickType === 'featured' ? (
                <div className="space-y-2.5">
                  <div className="p-3 bg-[#131F37] border border-slate-800 rounded-xl flex items-center gap-2 text-xs text-slate-300">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Curated 200-Day Leadership & Knowledge Track based on your interest:</span>
                  </div>

                  {FEATURED_JUNIOR_COURSES.map((course: CourseOption) => {
                    const isSelected = selectedCourseOption?.id === course.id;
                    return (
                      <div
                        key={course.id}
                        onClick={() => setSelectedCourseOption(course)}
                        className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition ${
                          isSelected
                            ? 'bg-emerald-500/10 border-[#00D084] shadow-md'
                            : 'bg-[#0E172A] border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{course.icon || '⭐'}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">{course.short}</span>
                              <span
                                className="px-2 py-0.5 rounded text-[10px] font-bold"
                                style={{ backgroundColor: course.badgeColor + '25', color: course.badgeColor }}
                              >
                                {course.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 line-clamp-1">{course.subtitle}</p>
                          </div>
                        </div>

                        {isSelected ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-600 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="p-3 bg-[#131F37] border border-slate-800 rounded-xl flex items-center gap-2 text-xs text-slate-300">
                    <School className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>
                      Textbook & Board Aligned Academic Curriculum for{' '}
                      {ACADEMIC_CLASSES.find((c) => c.id === selectedClass)?.label}:
                    </span>
                  </div>

                  {matchingClassCourses.map((course: CourseOption) => {
                    const isSelected = selectedCourseOption?.id === course.id;
                    return (
                      <div
                        key={course.id}
                        onClick={() => setSelectedCourseOption(course)}
                        className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition ${
                          isSelected
                            ? 'bg-emerald-500/10 border-[#00D084] shadow-md'
                            : 'bg-[#0E172A] border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                            <Layers className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">{course.title}</div>
                            <p className="text-[11px] text-slate-400 line-clamp-1">
                              {course.subtitle} • {course.medium}
                            </p>
                          </div>
                        </div>

                        {isSelected ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-600 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0E172A] border-t border-slate-800 flex items-center justify-between">
          {step === 2 ? (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
            >
              ← Back
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={step === 1 ? handleNextStep : handleFinishOnboarding}
            disabled={isSaving}
            className="px-6 py-2.5 bg-[#00D084] hover:bg-[#00B774] text-[#070C18] text-xs font-black rounded-xl shadow-lg flex items-center gap-2 transition"
          >
            {step === 1 ? (
              <>
                <span>Continue to Course Selection</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : isSaving ? (
              <span>Personalizing...</span>
            ) : (
              <span>🚀 Start 365-Day Academic Journey</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
