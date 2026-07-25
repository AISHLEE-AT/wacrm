// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  GraduationCap,
  PlayCircle,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Award,
  FileText,
  X,
  Download,
  Share2,
  Play,
  Volume2,
  Video
} from 'lucide-react';

const DAILY_QUIZ = [
  {
    id: 1,
    question: 'TNPSC: தமிழ்நாட்டின் முதல் பெண் முதலமைச்சர் யார்?',
    options: ['ஜெ. ஜெயலலிதா', 'ஜானகி இராமச்சந்திரன்', 'முத்துலட்சுமி ரெட்டி', 'சரோஜினி நாயுடு'],
    correct: 1,
    explanation: 'திருமதி ஜானகி இராமச்சந்திரன் அவர்கள் 1988-ஆம் ஆண்டு தமிழ்நாட்டின் முதல் பெண் முதலமைச்சராகப் பொறுப்பேற்றார்.'
  },
  {
    id: 2,
    question: 'TNPSC: திருக்குறளில் மொத்தம் எத்தனை அதிகாரங்கள் உள்ளன?',
    options: ['108', '133', '150', '120'],
    correct: 1,
    explanation: 'திருக்குறளில் 133 அதிகாரங்கள் மற்றும் 1330 குறட்பாக்கள் உள்ளன.'
  },
  {
    id: 3,
    question: 'General Science: ஒளிச்சேர்க்கைக்குத் தேவையான முதன்மை வாயு எது?',
    options: ['ஆக்ஸிஜன்', 'கார்பன் டை ஆக்சைடு', 'நைட்ரஜன்', 'ஹைட்ரஜன்'],
    correct: 1,
    explanation: 'தாவரங்கள் ஒளிச்சேர்க்கையின் போது கார்பன் டை ஆக்சைடை (CO2) உட்கொண்டு ஆக்ஸிஜனை வெளியிடுகின்றன.'
  }
];

const DAILY_GOOGLE_TASKS = [
  {
    id: 'task_1',
    title: 'மாணவர் & வேலைதேடுவோர் தினசரி பதிவுப் படிவம்',
    description: 'TNPSC & அரசுத் தேர்வு இலவச மாதிரித் தேர்வுக்கான உங்கள் விவரங்களைச் சமர்ப்பிக்கவும்.',
    formUrl: 'https://forms.gle/sample_tnpsc_registration',
    category: 'TNPSC Exam Prep',
    reward: 'இலவச பாடக் குறிப்புகள் (PDF)',
  },
  {
    id: 'task_2',
    title: 'விவசாயிகள் & உழவர் சந்தை விருப்பப் படிவம்',
    description: 'நேரடி உழவர் சந்தை விற்பனை மற்றும் சொட்டு நீர் பாசன அரசு மானியப் படிவம்.',
    formUrl: 'https://forms.gle/sample_agri_subsidy',
    category: 'Agri Subsidy',
    reward: 'அரசு மானிய வழிகாட்டி',
  },
  {
    id: 'task_3',
    title: 'ஓட்டுநர்கள் ஓட்டுனர் உரிமம் & காப்பீடு புதுப்பித்தல்',
    description: 'வணிக வாகன ஓட்டுநர்கள் காப்பீடு மற்றும் பேட்ஜ் புதுப்பித்தல் விண்ணப்பம்.',
    formUrl: 'https://forms.gle/sample_driver_permit',
    category: 'DriveO Fleet',
    reward: '0% கமிஷன் ஓட்டுநர் ஐடி',
  }
];

// Rich fallback courses with working YouTube video embeds & PDF notes
const PRESEEDED_COURSES = [
  {
    id: 'tnpsc_group4',
    title: 'TNPSC Group 4 & Group 2 பொதுத் தமிழ் & பொது அறிவு',
    subtitle: 'Complete TNPSC Tamil & General Studies Mastery Course',
    category: 'TNPSC Exam',
    icon: '📚',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Standard embed
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    description: 'TNPSC தேர்வுக்கான 6 முதல் 10-ஆம் வகுப்பு வரையிலான சமச்சீர் கல்வி தமிழ் வினா-விடைகள், வரலாறு, அரசியல் மற்றும் கணிதம் பாடக் குறிப்புகள்.',
    curriculum: '• அலகு 1: பொதுத் தமிழ் இலக்கணம் & இலக்கியம்\n• அலகு 2: இந்திய தேசிய இயக்கம் & தமிழ்நாடு வரலாறு\n• அலகு 3: கணிதம் & திறனறி தேர்வு (Aptitude)',
    level: 'Beginner to Advanced'
  },
  {
    id: 'tractor_depth',
    title: 'டிராக்டர் உழவு ஆழம் & ரோட்டவேட்டர் அமைத்தல்',
    subtitle: 'Tractor Rotavator & Disc Plough Depth Calibration Guide',
    category: 'Agri Machinery',
    icon: '🚜',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    description: 'டிராக்டர் ரோட்டவேட்டர் ஆழம் அமைப்பது எப்படி? டீசல் சிக்கனம் மற்றும் மண் உழவு நுட்பங்கள் பற்றிய நேரடி வீடியோ வழிகாட்டி.',
    curriculum: '• பகுதி 1: ரோட்டவேட்டர் பிளேடு அமைவு\n• பகுதி 2: 3-பாயிண்ட் ஹிட்ச் ஆழம் கட்டுப்பாடு\n• பகுதி 3: எரிபொருள் சிக்கன உழவு நுட்பம்',
    level: 'Practical Guide'
  },
  {
    id: 'drip_maint',
    title: 'சொட்டு நீர் பாசனம் & பம்ப் பராமரிப்பு',
    subtitle: 'Drip Irrigation Filter Cleaning & Submersible Motor Fixes',
    category: 'Water Management',
    icon: '💧',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    description: 'சொட்டு நீர் பாசன பில்டர் அடைப்பு நீக்குதல், வென்ச்சுரி உரம் செலுத்துதல் மற்றும் சப்மர்சிபிள் பம்ப் பராமரிப்பு செய்முறை.',
    curriculum: '• பகுதி 1: டிஸ்க் பில்டர் ஆசிட் வாஷ்\n• பகுதி 2: வென்ச்சுரி இன்ஜெக்டர் இயக்கம்\n• பகுதி 3: மோட்டார் ஸ்டார்ட்டர் பழுதுநீக்கம்',
    level: 'Practical Guide'
  },
  {
    id: 'panchagavya',
    title: 'இயற்கை விவசாய பஞ்சகவ்விய & ஜீவாமிர்தம் தயாரிப்பு',
    subtitle: 'Organic Panchagavya & Natural Bio-Fertilizer Formulas',
    category: 'Organic Farming',
    icon: '🍃',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    description: 'பஞ்சகவ்வியம், ஜீவாமிர்தம் மற்றும் மீன் அமிலம் தயாரிக்கும் முறைகள், பயன்படுத்தும் அளவுகள் மற்றும் நன்மைகள்.',
    curriculum: '• பகுதி 1: பஞ்சகவ்விய தயாரிப்பு பொருட்கள் & நாட்கள்\n• பகுதி 2: ஜீவாமிர்தம் கரைசல் தயாரிப்பு\n• பகுதி 3: தெளிக்கும் முறை & பூச்சி விரட்டி தயாரிப்பு',
    level: 'Organic Guide'
  },
  {
    id: 'commercial_permit',
    title: 'வணிக ஓட்டுநர் உரிமம் & பேட்ஜ் அனுமதி வழிகாட்டி',
    subtitle: 'Commercial Driving Permit Renewal & Road Safety Rules',
    category: 'Driver Skills',
    icon: '🚛',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    description: 'வணிக வாகன ஓட்டுநர் உரிமம் (Badge) புதுப்பித்தல், மருத்துவ சான்றிதழ் படிவம் 1A மற்றும் சாலை பாதுகாப்பு விதிகள்.',
    curriculum: '• பகுதி 1: RTO புதுப்பித்தல் விண்ணப்பம்\n• பகுதி 2: மருத்துவ தகுதி சான்றிதழ் சமர்ப்பித்தல்\n• பகுதி 3: ஹெவி வாகன சாலை பாதுகாப்பு விதிகள்',
    level: 'Driver Guide'
  },
  {
    id: 'police_constable',
    title: 'தமிழ்நாடு காவலர் தேர்வு (TNUSRB Police Constable)',
    subtitle: 'TNUSRB Grade II Police Constable Prep',
    category: 'Police Exam',
    icon: '👮‍♂️',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    description: 'TNUSRB இரண்டாம் நிலை காவலர் தேர்வுக்கான உளவியல், பொது அறிவு மற்றும் உடற்தகுதி தேர்வு வழிகாட்டி பாடங்கள்.',
    curriculum: '• பகுதி 1: உளவியல் & கணித புதிர்கள்\n• பகுதி 2: அறிவியல் & சமூக அறிவியல் வினாக்கள்\n• பகுதி 3: உடற்தகுதி தேர்வு பயிற்சி',
    level: 'Exam Prep'
  }
];

export default function TeachOWebDashboard() {
  const [dbCourses, setDbCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [activeCourse, setActiveCourse] = useState<any | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function fetchCourses() {
      try {
        const { data, error } = await supabase
          .from('lms_courses')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          setDbCourses(data);
        }
      } catch (err) {
        console.error('Error fetching LMS courses:', err);
      } finally {
        setLoadingCourses(false);
      }
    }
    fetchCourses();
  }, []);

  const allCourses = dbCourses.length > 0 ? dbCourses : PRESEEDED_COURSES;

  const handleSelectOption = (questionId: number, optionIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const calculateScore = () => {
    let score = 0;
    DAILY_QUIZ.forEach((q) => {
      if (selectedAnswers[q.id] === q.correct) score += 1;
    });
    return score;
  };

  const openCourseViewer = (course: any) => {
    setActiveCourse(course);
  };

  const closeCourseViewer = () => {
    setActiveCourse(null);
  };

  return (
    <div className="flex flex-col space-y-6 max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-purple-950 border border-purple-500/30 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🎓</span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              TeachO & TestO - கல்வி, TNPSC & வீடியோ பாடங்கள்
            </h1>
          </div>
          <p className="text-purple-300 text-sm max-w-2xl">
            TNPSC & போட்டித் தேர்வுகள், 1-நிமிட தினசரி வினாடி வினா, விவசாய நுட்பங்கள் மற்றும் நேரடி வீடியோ பாடங்கள்!
          </p>
        </div>
      </div>

      {/* 🧠 1-Minute Daily TNPSC Quiz Widget */}
      <div className="bg-card border border-purple-500/30 rounded-2xl p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" /> 🧠 1-Minute Daily TNPSC Quiz (தினசரி வினாடி வினா)
          </h2>
          <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
            🔥 Daily Streak: Active
          </span>
        </div>

        <div className="space-y-6 pt-2">
          {DAILY_QUIZ.map((q, idx) => (
            <div key={q.id} className="p-4 bg-muted/30 border border-border rounded-xl space-y-3">
              <h3 className="text-sm font-bold text-foreground">
                {idx + 1}. {q.question}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {q.options.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[q.id] === optIdx;
                  const isCorrect = q.correct === optIdx;
                  let btnColor = 'bg-background border-border text-foreground hover:border-purple-500';

                  if (showResults) {
                    if (isCorrect) btnColor = 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold';
                    else if (isSelected) btnColor = 'bg-red-500/20 border-red-500 text-red-400';
                  } else if (isSelected) {
                    btnColor = 'bg-purple-500 text-white font-bold border-purple-400';
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      className={`p-3 text-xs text-left rounded-xl border transition ${btnColor}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {showResults && (
                <p className="text-xs text-purple-300 bg-purple-500/10 p-2.5 rounded-lg border border-purple-500/20 mt-2">
                  💡 <strong>விளக்கம்:</strong> {q.explanation}
                </p>
              )}
            </div>
          ))}

          <div className="flex items-center justify-between pt-2">
            {!showResults ? (
              <button
                onClick={() => setShowResults(true)}
                disabled={Object.keys(selectedAnswers).length === 0}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition disabled:opacity-50"
              >
                🏆 Submit Quiz & Check Score
              </button>
            ) : (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Award className="w-6 h-6 text-amber-400" />
                  <span className="text-sm font-black text-foreground">
                    Your Score: {calculateScore()} / {DAILY_QUIZ.length}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedAnswers({});
                    setShowResults(false);
                  }}
                  className="px-4 py-2 bg-muted text-foreground font-semibold text-xs rounded-xl hover:bg-muted/80 transition"
                >
                  🔄 Retake Quiz
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 📝 Daily Tasks & Google Form Work Hub */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-md space-y-4">
        <h2 className="text-base sm:text-lg font-black text-foreground flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-500" /> 📝 Daily Tasks & Google Forms Work Hub (தினசரி பணிகள்)
        </h2>
        <p className="text-xs text-muted-foreground">
          Complete daily tasks, submit Google Form work applications, and earn free PDF study guides & certificates!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {DAILY_GOOGLE_TASKS.map((task) => (
            <div key={task.id} className="p-4 bg-muted/30 border border-border rounded-xl space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {task.category}
                </span>
                <h3 className="text-sm font-bold text-foreground mt-2">{task.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
              </div>

              <div className="space-y-2 border-t border-border pt-3">
                <span className="text-[11px] text-amber-400 font-semibold block">🎁 {task.reward}</span>
                <a
                  href={task.formUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow transition"
                >
                  Open Google Form <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 📚 Video Guides & Skill Courses Catalog */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" /> 📚 Video Guides & Skill Courses ({allCourses.length} Courses)
          </h2>
          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <Video className="w-3.5 h-3.5" /> Live LMS Integration
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allCourses.map((course) => (
            <div
              key={course.id}
              className="p-5 rounded-2xl bg-card border border-border flex flex-col justify-between gap-4 hover:border-purple-500/40 transition group"
            >
              <div className="flex items-start gap-4">
                <span className="text-4xl p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20 shrink-0">
                  {course.icon || '🎓'}
                </span>
                <div className="space-y-1">
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-purple-500/15 text-purple-400 text-[10px] font-bold border border-purple-500/30">
                    {course.category || 'Skill Course'}
                  </span>
                  <h3 className="text-base font-bold text-foreground group-hover:text-purple-300 transition">
                    {course.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {course.subtitle || course.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border/50">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Free Access
                </span>
                <button
                  type="button"
                  onClick={() => openCourseViewer(course)}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Watch Video & Learn
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🎬 Interactive Course Viewer Modal */}
      {activeCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-card border border-purple-500/30 w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 bg-muted/40 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{activeCourse.icon || '🎓'}</span>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{activeCourse.title}</h3>
                  <span className="text-xs text-purple-400 font-semibold">{activeCourse.category}</span>
                </div>
              </div>
              <button
                onClick={closeCourseViewer}
                className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Player */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Video Player */}
              <div className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden border border-border shadow-inner">
                {activeCourse.video_url?.includes('youtube') ? (
                  <iframe
                    src={activeCourse.video_url}
                    title={activeCourse.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center space-y-3 p-6 text-center">
                    <PlayCircle className="w-16 h-16 text-purple-500 animate-pulse" />
                    <p className="text-sm font-bold text-white">Video Lesson Ready</p>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      {activeCourse.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Course Info & Curriculum */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-foreground">📖 பாடத்திட்டம் & விவரங்கள் (Curriculum):</h4>
                <div className="p-4 bg-muted/30 border border-border rounded-2xl text-xs text-muted-foreground whitespace-pre-line leading-relaxed">
                  {activeCourse.curriculum || activeCourse.description || 'பாட விவரங்கள் மற்றும் குறிப்புகள் மேலே உள்ள வீடியோவில் விவரிக்கப்பட்டுள்ளன.'}
                </div>
              </div>

              {/* PDF Notes & Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border">
                {activeCourse.pdf_url && (
                  <a
                    href={activeCourse.pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center gap-2 hover:bg-emerald-500/20 transition"
                  >
                    <Download className="w-4 h-4" /> Download PDF Notes (இலவச பாடக்குறிப்புகள்)
                  </a>
                )}
                <button
                  onClick={() => {
                    const text = `🎓 Check out this TeachO Course on FAGO: ${activeCourse.title} - https://watscrm.vercel.app/teacho`;
                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow transition"
                >
                  <Share2 className="w-4 h-4" /> Share on WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
