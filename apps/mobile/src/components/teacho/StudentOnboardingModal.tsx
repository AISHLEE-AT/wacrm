import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
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
  X,
} from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import {
  ALL_COURSES,
  CourseOption,
  SchoolBoard,
  SCHOOL_BOARDS,
  FEATURED_JUNIOR_COURSES,
} from '../../data/coursesCatalog';
import { setEnrollmentDate } from '../../data/curriculum/wholeYearDayPlanEngine';

const { width, height } = Dimensions.get('window');

export interface StudentProfileData {
  fullName: string;
  academicClass: string;
  schoolBoard: SchoolBoard;
  areaOfInterest: string;
  enrolledCourseId: string;
}

interface StudentOnboardingModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: (course: CourseOption, board: SchoolBoard, profile: StudentProfileData) => void;
  initialName?: string;
  userPhone?: string;
}

const ACADEMIC_CLASSES = [
  { id: 'class_lkg', label: '🧸 LKG (Lower KG)', gradeLevel: 'primary', category: 'school_k12' },
  { id: 'class_ukg', label: '🎨 UKG (Upper KG)', gradeLevel: 'primary', category: 'school_k12' },
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
  { id: 'jr-ias', label: '🏛️ JrIAS (Civil Servant)', roleTag: 'District Collector & Polity', desc: 'Indian Constitution, Public Policy & District Administration', color: '#F59E0B', recommendedCourseId: 'jr-ias' },
  { id: 'jr-ar', label: '📊 JrAR (Auditor / CA)', roleTag: 'CA & Corporate Finance', desc: 'Double-Entry Bookkeeping, Financial Statements, GST & Auditing Standards', color: '#10B981', recommendedCourseId: 'jr-ar' },
  { id: 'jr-dr', label: '🩺 JrDR (Doctor / NEET)', roleTag: 'Clinical Biology & NEET', desc: 'Human Anatomy, Major Organ Systems, First Aid & Clinical Diagnostics', color: '#EC4899', recommendedCourseId: 'jr-dr' },
  { id: 'jr-er', label: '💻 JrER (Engineer / Tech)', roleTag: 'Coding, AI & Robotics', desc: 'Algorithms, Circuit Analysis, Embedded Robotics & Applied Physics', color: '#3B82F6', recommendedCourseId: 'jr-er' },
  { id: 'jr-ips', label: '👮 JrIPS (Police & Law)', roleTag: 'Criminology & Public Safety', desc: 'Forensics, Cyber Crime Investigation, Law & Tactical Leadership', color: '#06B6D4', recommendedCourseId: 'jr-ips' },
  { id: 'jr-ceo', label: '🚀 JrCEO (Entrepreneur)', roleTag: 'Startup & Business Leader', desc: 'Venture Creation, Unit Economics, Marketing & Pitch Decks', color: '#8B5CF6', recommendedCourseId: 'jr-ceo' },
  { id: 'jr-scientist', label: '🔬 JrScientist (ISRO)', roleTag: 'Space Tech & Deep Physics', desc: 'Rocket Propulsion, Satellite Systems & Planetary Science', color: '#14B8A6', recommendedCourseId: 'jr-scientist' },
  { id: 'jr-judge', label: '⚖️ JrJudge (Judiciary)', roleTag: 'Justice & Legal Master', desc: 'Constitutional Rights, Courtroom Ethics & Landmark Case Analysis', color: '#F97316', recommendedCourseId: 'jr-judge' },
];

export const StudentOnboardingModal: React.FC<StudentOnboardingModalProps> = ({
  visible,
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
  const [selectedInterest, setSelectedInterest] = useState('jr-ias');

  // Step 2: Course Selection
  const [selectedCourseOption, setSelectedCourseOption] = useState<CourseOption | null>(null);
  const [coursePickType, setCoursePickType] = useState<'featured' | 'curriculum'>('featured');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize name from props
  useEffect(() => {
    if (initialName) setFullName(initialName);
  }, [initialName]);

  // Find recommended featured course matching interest
  const recommendedFeaturedCourse = React.useMemo(() => {
    const interestObj = CAREER_INTERESTS.find((i) => i.id === selectedInterest);
    const targetCourseId = interestObj?.recommendedCourseId || 'jr-ias';
    return FEATURED_JUNIOR_COURSES.find((c) => c.id === targetCourseId) || FEATURED_JUNIOR_COURSES[0];
  }, [selectedInterest]);

  // Find class-matching curriculum courses
  const matchingClassCourses = React.useMemo(() => {
    if (selectedClass === 'class_lkg') {
      return ALL_COURSES.filter((c) => c.id === 'school-lkg');
    }
    if (selectedClass === 'class_ukg') {
      return ALL_COURSES.filter((c) => c.id === 'school-ukg');
    }
    if (selectedClass.includes('college')) {
      return ALL_COURSES.filter((c) => c.category === 'college_degree');
    }
    if (selectedClass.includes('competitive')) {
      return ALL_COURSES.filter((c) => ['tnpsc', 'banking_finance', 'ssc_railway', 'entrance'].includes(c.category));
    }
    // K-12 matching
    const numMatch = selectedClass.replace(/\D/g, '');
    if (numMatch) {
      return ALL_COURSES.filter(
        (c) => c.category === 'school_k12' && (c.id.includes(numMatch) || c.title.includes(numMatch))
      );
    }
    return ALL_COURSES.filter((c) => c.category === 'school_k12');
  }, [selectedClass]);

  // Auto-select course on step change
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
    // Default to recommended course on transition
    setSelectedCourseOption(recommendedFeaturedCourse);
  };

  const handleFinishOnboarding = async () => {
    const finalCourse = selectedCourseOption || recommendedFeaturedCourse || ALL_COURSES[0];
    setIsSaving(true);

    try {
      // 1. Save local completion flags
      await AsyncStorage.setItem('tuto_student_onboarding_completed', 'true');
      await setEnrollmentDate(finalCourse.id, new Date().toISOString());
      await AsyncStorage.setItem('tuto_active_course_id', finalCourse.id);
      await AsyncStorage.setItem('tuto_active_ambition_id', selectedInterest);
      await AsyncStorage.setItem('user-course-id', finalCourse.id);
      await AsyncStorage.setItem('user-board', selectedBoard);
      await AsyncStorage.setItem('user-name', fullName.trim());
      await AsyncStorage.setItem('student-academic-class', selectedClass);
      await AsyncStorage.setItem('student-area-interest', selectedInterest);

      // 2. Sync to Supabase profile if phone is available
      if (userPhone) {
        const cleanPhone = userPhone.replace(/\D/g, '').slice(-10);
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
    } catch (e) {
      console.warn('Error saving student onboarding:', e);
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

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <View style={styles.badgeRow}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>STEP {step} OF 2</Text>
                </View>
                <Text style={styles.welcomeSubText}>TutO Academic Personalization</Text>
              </View>
              <Text style={styles.headerTitle}>
                {step === 1 ? '🎓 Student & Career Profile' : '📚 Select Your Learning Track'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <X size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Scrollable Form Body */}
          <ScrollView
            style={styles.bodyScroll}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
          >
            {step === 1 ? (
              /* ─── STEP 1: IDENTITY, CLASS & CAREER INTEREST ─── */
              <View style={{ gap: 18 }}>
                {/* 1. Student Name */}
                <View style={styles.fieldSection}>
                  <View style={styles.fieldLabelRow}>
                    <User size={14} color="#00D084" />
                    <Text style={styles.fieldLabel}>Student Full Name</Text>
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter student's name (e.g. Vignesh R)"
                    placeholderTextColor="#64748B"
                    value={fullName}
                    onChangeText={setFullName}
                  />
                </View>

                {/* 2. Current Class / Academic Level */}
                <View style={styles.fieldSection}>
                  <View style={styles.fieldLabelRow}>
                    <School size={14} color="#38BDF8" />
                    <Text style={styles.fieldLabel}>Current Class / Academic Level</Text>
                  </View>
                  <View style={styles.chipGrid}>
                    {ACADEMIC_CLASSES.map((cls) => {
                      const isSelected = selectedClass === cls.id;
                      return (
                        <TouchableOpacity
                          key={cls.id}
                          style={[styles.classChip, isSelected && styles.classChipActive]}
                          onPress={() => setSelectedClass(cls.id)}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.classChipText, isSelected && styles.classChipTextActive]}>
                            {cls.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* 3. School Board Curriculum */}
                <View style={styles.fieldSection}>
                  <View style={styles.fieldLabelRow}>
                    <BookOpen size={14} color="#F59E0B" />
                    <Text style={styles.fieldLabel}>Educational Board & Standard</Text>
                  </View>
                  <View style={{ gap: 8 }}>
                    {SCHOOL_BOARDS.map((board) => {
                      const isSelected = selectedBoard === board.id;
                      return (
                        <TouchableOpacity
                          key={board.id}
                          style={[styles.boardCard, isSelected && styles.boardCardActive]}
                          onPress={() => setSelectedBoard(board.id)}
                          activeOpacity={0.8}
                        >
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.boardName, isSelected && { color: '#00D084' }]}>
                              {board.name}
                            </Text>
                            <Text style={styles.boardTagline}>{board.tagline}</Text>
                          </View>
                          {isSelected && <CheckCircle2 size={18} color="#00D084" />}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* 4. Area of Interest / Dream Career Goal */}
                <View style={styles.fieldSection}>
                  <View style={styles.fieldLabelRow}>
                    <Target size={14} color="#EC4899" />
                    <Text style={styles.fieldLabel}>Dream Career Goal & Area of Interest</Text>
                  </View>
                  <Text style={styles.fieldHelper}>
                    We will recommend customized daily leadership lessons and case studies matching this aspiration:
                  </Text>
                  <View style={styles.interestGrid}>
                    {CAREER_INTERESTS.map((interest) => {
                      const isSelected = selectedInterest === interest.id;
                      return (
                        <TouchableOpacity
                          key={interest.id}
                          style={[
                            styles.interestCard,
                            isSelected && { borderColor: interest.color, backgroundColor: interest.color + '15' },
                          ]}
                          onPress={() => setSelectedInterest(interest.id)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.interestEmoji}>{interest.icon}</Text>
                          <Text
                            style={[
                              styles.interestLabel,
                              isSelected && { color: interest.color, fontWeight: '800' },
                            ]}
                            numberOfLines={2}
                          >
                            {interest.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </View>
            ) : (
              /* ─── STEP 2: COURSE SELECTION (FEATURED vs CLASS CURRICULUM) ─── */
              <View style={{ gap: 18 }}>
                {/* Course Type Switcher Tabs */}
                <View style={styles.typeSwitcher}>
                  <TouchableOpacity
                    style={[styles.typeTab, coursePickType === 'featured' && styles.typeTabActive]}
                    onPress={() => {
                      setCoursePickType('featured');
                      setSelectedCourseOption(recommendedFeaturedCourse);
                    }}
                    activeOpacity={0.8}
                  >
                    <Sparkles size={14} color={coursePickType === 'featured' ? '#070C18' : '#F59E0B'} />
                    <Text style={[styles.typeTabText, coursePickType === 'featured' && styles.typeTabTextActive]}>
                      ⭐ Recommended Career Track
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.typeTab, coursePickType === 'curriculum' && styles.typeTabActive]}
                    onPress={() => {
                      setCoursePickType('curriculum');
                      if (matchingClassCourses.length > 0) setSelectedCourseOption(matchingClassCourses[0]);
                    }}
                    activeOpacity={0.8}
                  >
                    <BookOpen size={14} color={coursePickType === 'curriculum' ? '#070C18' : '#38BDF8'} />
                    <Text style={[styles.typeTabText, coursePickType === 'curriculum' && styles.typeTabTextActive]}>
                      🏫 Class Curriculum Course
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Option List based on selected pick type */}
                {coursePickType === 'featured' ? (
                  <View style={{ gap: 10 }}>
                    <View style={styles.recommendationBanner}>
                      <Sparkles size={16} color="#F59E0B" />
                      <Text style={styles.recommendationText}>
                        Curated 200-Day Leadership & Knowledge Track based on your interest:
                      </Text>
                    </View>

                    {FEATURED_JUNIOR_COURSES.map((course) => {
                      const isSelected = selectedCourseOption?.id === course.id;
                      return (
                        <TouchableOpacity
                          key={course.id}
                          style={[styles.courseSelectCard, isSelected && styles.courseSelectCardActive]}
                          onPress={() => setSelectedCourseOption(course)}
                          activeOpacity={0.8}
                        >
                          <View style={styles.courseSelectHeader}>
                            <Text style={styles.courseEmoji}>{course.icon || '⭐'}</Text>
                            <View style={{ flex: 1 }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Text style={styles.courseSelectTitle}>{course.short}</Text>
                                <View style={[styles.miniBadge, { backgroundColor: course.badgeColor + '25' }]}>
                                  <Text style={[styles.miniBadgeText, { color: course.badgeColor }]}>
                                    {course.badge}
                                  </Text>
                                </View>
                              </View>
                              <Text style={styles.courseSelectSub} numberOfLines={2}>
                                {course.subtitle}
                              </Text>
                            </View>
                            {isSelected ? (
                              <CheckCircle2 size={20} color="#00D084" />
                            ) : (
                              <View style={styles.radioUnchecked} />
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ) : (
                  <View style={{ gap: 10 }}>
                    <View style={styles.recommendationBanner}>
                      <School size={16} color="#38BDF8" />
                      <Text style={styles.recommendationText}>
                        Textbook & Board Aligned Academic Curriculum for {ACADEMIC_CLASSES.find((c) => c.id === selectedClass)?.label}:
                      </Text>
                    </View>

                    {matchingClassCourses.map((course) => {
                      const isSelected = selectedCourseOption?.id === course.id;
                      return (
                        <TouchableOpacity
                          key={course.id}
                          style={[styles.courseSelectCard, isSelected && styles.courseSelectCardActive]}
                          onPress={() => setSelectedCourseOption(course)}
                          activeOpacity={0.8}
                        >
                          <View style={styles.courseSelectHeader}>
                            <View style={styles.curriculumIconBox}>
                              <Layers size={16} color="#00D084" />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.courseSelectTitle}>{course.title}</Text>
                              <Text style={styles.courseSelectSub} numberOfLines={1}>
                                {course.subtitle} • {course.medium}
                              </Text>
                            </View>
                            {isSelected ? (
                              <CheckCircle2 size={20} color="#00D084" />
                            ) : (
                              <View style={styles.radioUnchecked} />
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          {/* Bottom Action Footer */}
          <View style={styles.footer}>
            {step === 2 && (
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => setStep(1)}
                activeOpacity={0.7}
              >
                <Text style={styles.backBtnText}>← Back</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.primaryBtn, isSaving && { opacity: 0.7 }]}
              onPress={step === 1 ? handleNextStep : handleFinishOnboarding}
              activeOpacity={0.85}
              disabled={isSaving}
            >
              <Text style={styles.primaryBtnText}>
                {step === 1 ? 'Continue to Course Selection →' : isSaving ? 'Personalizing...' : '🚀 Start 200-Day TutO Deck'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#0B1120',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: '#1E293B',
    maxHeight: height * 0.92,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  stepBadge: {
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 208, 132, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  stepBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#00D084',
    letterSpacing: 0.5,
  },
  welcomeSubText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyScroll: {
    flex: 1,
  },
  bodyContent: {
    padding: 20,
    paddingBottom: 40,
  },
  fieldSection: {
    gap: 8,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  fieldHelper: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
  },
  textInput: {
    backgroundColor: '#0E172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  classChip: {
    backgroundColor: '#0E172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  classChipActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: '#38BDF8',
  },
  classChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  classChipTextActive: {
    color: '#38BDF8',
    fontWeight: '900',
  },
  boardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0E172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
  },
  boardCardActive: {
    borderColor: '#00D084',
    backgroundColor: 'rgba(0, 208, 132, 0.08)',
  },
  boardName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  boardTagline: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  interestGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestCard: {
    width: (width - 40 - 8) / 2,
    backgroundColor: '#0E172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 12,
    padding: 10,
    gap: 6,
  },
  interestEmoji: {
    fontSize: 18,
  },
  interestLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#CBD5E1',
    lineHeight: 15,
  },
  typeSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#0E172A',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 6,
  },
  typeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  typeTabActive: {
    backgroundColor: '#00D084',
  },
  typeTabText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
  },
  typeTabTextActive: {
    color: '#070C18',
    fontWeight: '900',
  },
  recommendationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#131F37',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  recommendationText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  courseSelectCard: {
    backgroundColor: '#0E172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 14,
    padding: 12,
  },
  courseSelectCardActive: {
    borderColor: '#00D084',
    backgroundColor: 'rgba(0, 208, 132, 0.08)',
  },
  courseSelectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  courseEmoji: {
    fontSize: 22,
  },
  curriculumIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseSelectTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  courseSelectSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  miniBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  miniBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  radioUnchecked: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#475569',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    backgroundColor: '#0B1120',
  },
  backBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#1E293B',
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#CBD5E1',
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#00D084',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00D084',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#070C18',
  },
});
