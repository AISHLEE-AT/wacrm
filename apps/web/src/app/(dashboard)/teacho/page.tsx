// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { GraduationCap, PlayCircle, BookOpen, MessageSquare, CheckCircle2, HelpCircle, Award, FileText, ExternalLink, Sparkles } from 'lucide-react';

const DAILY_QUIZ = [
  {
    id: 1,
    question: 'TNPSC: ' + 'தமிழ்நாட்டின் முதல் பெண் முதலமைச்சர் யார்?',
    options: ['ஜெ. ஜெயலலிதா', 'ஜானகி இராமச்சந்திரன்', 'முத்துலட்சுமி ரெட்டி', 'சரோஜினி நாயுடு'],
    correct: 1,
    explanation: 'திருமதி ஜானகி இராமச்சந்திரன் அவர்கள் 1988-ஆம் ஆண்டு தமிழ்நாட்டின் முதல் பெண் முதலமைச்சராகப் பொறுப்பேற்றார்.'
  },
  {
    id: 2,
    question: 'TNPSC: ' + 'திருக்குறளில் மொத்தம் எத்தனை அதிகாரங்கள் உள்ளன?',
    options: ['108', '133', '150', '120'],
    correct: 1,
    explanation: 'திருக்குறளில் 133 அதிகாரங்கள் மற்றும் 1330 குறட்பாக்கள் உள்ளன.'
  },
  {
    id: 3,
    question: 'General Science: ' + 'ஒளிச்சேர்க்கைக்குத் தேவையான முதன்மை வாயு எது?',
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

const TEACHO_COURSES = [
  {
    id: 'tractor_depth',
    title: 'டிராக்டர் உழவு ஆழம் & ரோட்டவேட்டர் அமைத்தல்',
    subtitle: 'Tractor Rotavator & Disc Plough Depth Calibration Guide',
    icon: '🚜',
    category: 'Agri Machinery',
  },
  {
    id: 'drip_maint',
    title: 'சொட்டு நீர் பாசனம் & பம்ப் பராமரிப்பு',
    subtitle: 'Drip Irrigation Filter Cleaning & Submersible Motor Fixes',
    icon: '💧',
    category: 'Water Management',
  },
  {
    id: 'panchagavya',
    title: 'இயற்கை விவசாய பஞ்சகவ்விய & ஜீவாமிர்தம் தயாரிப்பு',
    subtitle: 'Organic Panchagavya & Natural Bio-Fertilizer Formulas',
    icon: '🍃',
    category: 'Organic Farming',
  },
  {
    id: 'commercial_permit',
    title: 'வணிக ஓட்டுநர் உரிமம் & பேட்ஜ் அனுமதி வழிகாட்டி',
    subtitle: 'Commercial Driving Permit Renewal & Road Safety Rules',
    icon: '🚛',
    category: 'Driver Skills',
  },
];

export default function TeachOWebDashboard() {
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [showResults, setShowResults] = useState(false);

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

  const handleInquireCourse = (title: string) => {
    const message = `🎓 *TEACHO ACADEMY INQUIRY*: Want to access video guide on ${title}`;
    window.open(`https://api.whatsapp.com/send?phone=916381029380&text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="flex flex-col space-y-6 max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-purple-950 border border-purple-500/30 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🎓</span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              TeachO & TestO - கல்வி, TNPSC & தினசரி பணிகள்
            </h1>
          </div>
          <p className="text-purple-300 text-sm max-w-2xl">
            TNPSC & போட்டித் தேர்வுகள், 1-நிமிட தினசரி வினாடி வினா, விவசாய நுட்பங்கள் மற்றும் Google Forms அடிப்படையிலான தினசரி பணிகள்!
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

      {/* 📝 Daily Tasks & Google Form Automated Work Hub */}
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

      {/* Courses List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-400" /> 📚 Video Guides & Skill Courses
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TEACHO_COURSES.map((course) => (
            <div
              key={course.id}
              className="p-5 rounded-2xl bg-card border border-border flex items-center justify-between gap-4 hover:border-purple-500/40 transition"
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">{course.icon}</span>
                <div>
                  <h3 className="text-sm font-bold text-foreground">{course.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{course.subtitle}</p>
                  <span className="inline-block mt-2 px-2.5 py-0.5 rounded-md bg-purple-500/15 text-purple-400 text-[10px] font-bold border border-purple-500/30">
                    {course.category}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleInquireCourse(course.title)}
                className="p-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition shrink-0"
                title="Watch Guide"
              >
                <PlayCircle className="w-6 h-6" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
