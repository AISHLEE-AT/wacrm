'use client';

import React, { useState, useMemo } from 'react';
import { X, Search, Check, Layers, ChevronRight } from 'lucide-react';
import { ALL_COURSES, CourseOption, CourseCategory } from '@/data/coursesCatalog';

interface TeachOCoursePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCourseId: string;
  onSelectCourse: (course: CourseOption) => void;
}

const CATEGORY_TABS: { id: CourseCategory; label: string; icon: string }[] = [
  { id: 'school_tnsb_en', label: 'TNSB English', icon: '🎒' },
  { id: 'school_tnsb_ta', label: 'TNSB தமிழ் வழி', icon: '🎒' },
  { id: 'school_cbse', label: 'CBSE NCERT', icon: '🎒' },
  { id: 'school_matric', label: 'Matriculation', icon: '🎒' },
  { id: 'tnpsc', label: 'TNPSC Exams', icon: '🏛️' },
  { id: 'upsc_central', label: 'UPSC / Central', icon: '🇮🇳' },
  { id: 'entrance', label: 'Entrance Exams', icon: '🩺' },
  { id: 'college_degree', label: 'College Degrees', icon: '🎓' },
  { id: 'skills', label: 'Tech & AI Skills', icon: '💻' },
  { id: 'kids_skills', label: 'Kids Skills', icon: '⭐' },
];

export const TeachOCoursePickerModal: React.FC<TeachOCoursePickerModalProps> = ({
  isOpen,
  onClose,
  selectedCourseId,
  onSelectCourse,
}) => {
  const [activeTab, setActiveTab] = useState<CourseCategory>('school_tnsb_en');
  const [searchQuery, setSearchQuery] = useState('');

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    CATEGORY_TABS.forEach(t => {
      counts[t.id] = ALL_COURSES.filter(c => c.category === t.id).length;
    });
    return counts;
  }, []);

  // Filtered courses
  const filteredCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return ALL_COURSES.filter(c => c.category === activeTab);
    }
    return ALL_COURSES.filter(c => {
      const matchText = `${c.title} ${c.short} ${c.subtitle} ${c.board} ${c.gradeLevel} ${c.medium}`.toLowerCase();
      return matchText.includes(q);
    });
  }, [activeTab, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-200">
      <div className="bg-[#0b1120] border border-slate-800 rounded-3xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Modal Header */}
        <div className="p-5 md:p-6 bg-[#111827] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base md:text-lg font-bold text-white">Select Academic Program</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-bold">
                  86 Master Programs
                </span>
              </div>
              <p className="text-xs text-slate-400">LKG to 12th Boards, Govt Exams, Degrees & Career Skills</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-800 bg-[#080d1a]">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by Class (e.g. 10th, 12th), Board, TNPSC, B.Tech, or Skill..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#111827] border border-slate-800 rounded-2xl text-xs md:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* 10 Category Tabs Bar */}
        <div className="flex border-b border-slate-800 bg-[#0c1322] overflow-x-auto scrollbar-none px-4 py-2 gap-2">
          {CATEGORY_TABS.map(tab => {
            const isActive = activeTab === tab.id && !searchQuery;
            const count = tabCounts[tab.id] || 0;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchQuery('');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-[#111827] text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                <span>{tab.icon} {tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                    isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Course Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {filteredCourses.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
              <p className="text-sm font-semibold text-slate-400">No matching programs found for "{searchQuery}".</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-3 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
              >
                Reset Search Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCourses.map(course => {
                const isSelected = course.id === selectedCourseId;

                return (
                  <div
                    key={course.id}
                    onClick={() => {
                      onSelectCourse(course);
                      onClose();
                    }}
                    className={`p-5 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500 shadow-lg shadow-emerald-500/10'
                        : 'bg-[#111827] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-[10px] uppercase">
                          {course.badge}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {course.totalDays} Days • {course.medium}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 mb-2">
                        <span className="text-2xl">{course.icon}</span>
                        <div>
                          <h4 className="text-sm font-bold text-white line-clamp-1">{course.title}</h4>
                          <p className="text-[11px] text-slate-400 line-clamp-1">{course.subtitle}</p>
                        </div>
                      </div>

                      {/* Subjects List Preview */}
                      {course.subjects && course.subjects.length > 0 && (
                        <div className="mt-3 space-y-1">
                          {course.subjects.slice(0, 2).map((s, sIdx) => (
                            <div key={sIdx} className="text-[11px] text-slate-300 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                              <span className="line-clamp-1">{typeof s === 'string' ? s : s.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-mono">ID: {course.id}</span>
                      {isSelected ? (
                        <span className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Selected
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold flex items-center gap-1">
                          Select Program <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
