// @ts-nocheck
'use client';

import React from 'react';
import { GraduationCap, PlayCircle, BookOpen, MessageSquare, CheckCircle } from 'lucide-react';

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
              TeachO - விவசாய நுட்பங்கள் & திறன் பயிற்சி தளம்
            </h1>
          </div>
          <p className="text-purple-300 text-sm max-w-2xl">
            விவசாய இயந்திரங்கள் பராமரிப்பு, சொட்டு நீர் பாசனம், இயற்கை விவசாயம் மற்றும் வணிக ஓட்டுநர்களுக்கான திறன் பயிற்சிகள்.
          </p>
        </div>
      </div>

      {/* Courses List */}
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
  );
}
