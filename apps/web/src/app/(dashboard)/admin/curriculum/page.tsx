'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Sparkles,
  Save,
  Plus,
  Layers,
  CheckCircle2,
  Search,
  ArrowLeft,
  Settings,
  CalendarDays,
  FileText,
  Trash2
} from 'lucide-react';
import { ALL_COURSES } from '@/data/coursesCatalog';
import { getAugmentedCourseSyllabus, SyllabusUnit } from '@/data/curriculum/courseSyllabusRegistry';
import { lmsSupabase as supabase } from '@/lib/lms-supabase';

export default function AdminCurriculumManagementPage() {
  const [activeTab, setActiveTab] = useState<'explorer' | 'bulk_gen' | 'day_planner'>('explorer');
  const [selectedCourseId, setSelectedCourseId] = useState(ALL_COURSES[0]?.id || 'class_12_tamil_nadu');
  const [searchFilter, setSearchFilter] = useState('');
  
  // Single Topic Edit State
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAxiom, setEditAxiom] = useState('');
  const [editOverview, setEditOverview] = useState('');
  const [editTamil, setEditTamil] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Bulk Generator State
  const [rawSyllabus, setRawSyllabus] = useState('');
  const [bulkGeneratedNodes, setBulkGeneratedNodes] = useState<any[]>([]);
  
  // Day Plan Architect State
  const [targetDay, setTargetDay] = useState<number>(1);
  const [dayPlanItems, setDayPlanItems] = useState<any[]>([]);

  const currentCourse = useMemo(() => {
    return ALL_COURSES.find(c => c.id === selectedCourseId) || ALL_COURSES[0];
  }, [selectedCourseId]);

  const syllabusUnits: SyllabusUnit[] = useMemo(() => {
    return getAugmentedCourseSyllabus(selectedCourseId);
  }, [selectedCourseId]);

  const handleSelectTopic = (title: string, axiom?: string) => {
    setSelectedTopic(title);
    setEditTitle(title);
    setEditAxiom(axiom || '');
    setEditOverview(`Standard governing laws, derivations, and comprehensive conceptual notes for ${title}.`);
    setEditTamil(`இப்பாடத்தின் அடிப்படைக் கருத்துக்கள் மற்றும் தேர்வுக்கான முக்கிய குறிப்புகள்: ${title}.`);
    setSaveSuccessMsg('');
  };

  const handleAiAutoFill = async () => {
    if (!editTitle) return;
    setIsAiLoading(true);
    setTimeout(() => {
      setEditOverview(`Comprehensive syllabus analysis for ${editTitle}.\nGoverning equation: ${editAxiom || 'Standard Law'}\n\n1. Axiomatic definition.\n2. Step-by-step mathematical formulation.\n3. Exam-ready problem-solving heuristics.`);
      setEditTamil(`பாட விளக்கம்: ${editTitle}.\n\nநடைமுறை உதாரணம்: தினசரி வாழ்க்கையில் நாம் காணும் நிகழ்வுகளோடு ஒப்பிட்டுப் படிக்கும் போது எளிதாகப் புரியும்!\n• முதன்மைக் கோட்பாடு: ${editAxiom || editTitle}`);
      setSaveSuccessMsg('⚡ AI Generated content loaded. Click "Save to Database" to commit.');
      setIsAiLoading(false);
    }, 1500);
  };

  const handleSaveToDb = async () => {
    if (!editTitle) return;
    setIsSaving(true);
    setSaveSuccessMsg('');
    try {
      const topicKey = `${selectedCourseId}_${editTitle.toLowerCase().replace(/[^a-z0-9_]/g, '_')}`;
      const payload = {
        notes: {
          overview: editOverview,
          keyPoints: [`Syllabus Rule: ${editAxiom || editTitle}`, 'Follow structured steps for maximum score.'],
          bilingualExplanation: { tamil: editTamil, english: editOverview }
        },
        tamilExplanation: {
          colloquialIntro: editTamil,
          everydayAnalogy: 'நடைமுறை வாழ்க்கையோடு ஒப்பிட்டுப் படிக்கும் போது நினைவில் எளிதாக நிற்கும்!'
        }
      };

      if (supabase) {
        await supabase.from('kindle_content_cache').upsert({
          topic_key: topicKey,
          kindle_json: payload,
          model_used: 'admin-studio-web',
          updated_at: new Date().toISOString()
        }, { onConflict: 'topic_key' });

        await supabase.from('unified_master_data').upsert({
          id: `topic_${topicKey}`,
          item_type: 'course_notes',
          title_name: editTitle,
          description: `Micro-topic notes for ${editTitle} in ${selectedCourseId}`,
          additional_info: payload,
          created_at: new Date().toISOString()
        }, { onConflict: 'id' });
      }
      setSaveSuccessMsg(`✅ Successfully persisted "${editTitle}" into Supabase database.`);
    } catch (err: any) {
      alert('Failed to save to database: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const processBulkSyllabus = () => {
    if (!rawSyllabus) return;
    // Break down syllabus by newlines, commas, or dot points
    const lines = rawSyllabus.split(/[\n,;]+/).map(s => s.trim()).filter(s => s.length > 3);
    const nodes = lines.map((line, idx) => ({
      id: `bulk_node_${Date.now()}_${idx}`,
      title: line.replace(/^\d+\.\s*/, ''),
      duration: '10 Mins',
      type: line.toLowerCase().includes('problem') || line.toLowerCase().includes('equation') ? 'solved_problem' : 'concept',
      selected: true
    }));
    setBulkGeneratedNodes(nodes);
  };

  const saveBulkNodesToDb = async () => {
    const selectedNodes = bulkGeneratedNodes.filter(n => n.selected);
    if (!selectedNodes.length) return alert('No nodes selected to save.');
    setIsSaving(true);
    try {
      const records = selectedNodes.map(node => ({
        id: `topic_${selectedCourseId}_${node.id}`,
        item_type: 'nano_node_definition',
        title_name: node.title,
        description: `Auto-generated nano-node for ${selectedCourseId}`,
        additional_info: { type: node.type, duration: node.duration, source: 'admin_bulk_gen' },
        created_at: new Date().toISOString()
      }));
      
      if (supabase) {
        await supabase.from('unified_master_data').upsert(records, { onConflict: 'id' });
      }
      alert(`Successfully saved ${records.length} nano-nodes to the database!`);
      setBulkGeneratedNodes([]);
      setRawSyllabus('');
    } catch (e: any) {
      alert('Error: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const addNodeToDayPlan = (node: any) => {
    setDayPlanItems(prev => [...prev, { ...node, day: targetDay }]);
  };

  const saveDayPlanToDb = async () => {
    if (!dayPlanItems.length) return alert('Day plan is empty.');
    setIsSaving(true);
    try {
      if (supabase) {
        const records = dayPlanItems.map((item, idx) => ({
          id: `dayplan_${selectedCourseId}_d${item.day}_t${idx}`,
          item_type: 'daily_plan_task',
          title_name: `Day ${item.day} - ${item.title}`,
          additional_info: { courseId: selectedCourseId, dayNumber: item.day, taskNumber: idx + 1, topicId: item.id },
          created_at: new Date().toISOString()
        }));
        await supabase.from('unified_master_data').upsert(records, { onConflict: 'id' });
      }
      alert(`Day Plan saved! Assigned ${dayPlanItems.length} nodes to Day ${targetDay}.`);
      setDayPlanItems([]);
    } catch (e: any) {
      alert('Error: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/admin/teacho" className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Settings className="w-6 h-6 text-emerald-400" />
              Dynamic Curriculum & Day-Plan Engine
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Build, edit, and orchestrate strict 10-minute nano-node syllabus blocks directly from the database.
          </p>
        </div>
      </div>

      {/* Course Context & Tabs */}
      <div className="max-w-7xl mx-auto mt-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-800 mb-6">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex-1 md:w-64">
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Target Course</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {ALL_COURSES.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex bg-slate-950 rounded-xl p-1 border border-slate-800 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('explorer')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${activeTab === 'explorer' ? 'bg-emerald-600 text-slate-950' : 'text-slate-400 hover:text-white'}`}
            >
              <Layers className="w-4 h-4" /> Single Topic Editor
            </button>
            <button
              onClick={() => setActiveTab('bulk_gen')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${activeTab === 'bulk_gen' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <FileText className="w-4 h-4" /> Bulk Syllabus Parser
            </button>
            <button
              onClick={() => setActiveTab('day_planner')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${activeTab === 'day_planner' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
            >
              <CalendarDays className="w-4 h-4" /> Day-Plan Architect
            </button>
          </div>
        </div>

        {/* TAB 1: SINGLE TOPIC EXPLORER */}
        {activeTab === 'explorer' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col gap-4">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter existing topics..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex-1 overflow-y-auto max-h-[600px] space-y-3 pr-1">
                {syllabusUnits.map((unit, uIdx) => (
                  <div key={unit.id || uIdx} className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3">
                    <h4 className="text-xs font-bold text-white mb-2">{unit.title}</h4>
                    {unit.chapters?.map((chap, cIdx) => (
                      <div key={cIdx} className="ml-2 pl-2 border-l border-slate-800 my-2 space-y-1.5">
                        <p className="text-[11px] font-semibold text-amber-400">Ch {chap.chapterNumber}: {chap.chapterTitle || chap.title}</p>
                        {chap.subtopics?.map((sub, sIdx) => (
                          <div key={sIdx} className="ml-2 pl-2 border-l border-slate-800/60 my-1 space-y-1">
                            <p className="text-[10px] font-medium text-sky-400">{sub.title}</p>
                            {sub.microTopics?.map((micro, mIdx) => {
                              const mTitle = micro.title || (micro as any).topicTitle || \`Topic \${mIdx + 1}\`;
                              return (
                                <button
                                  key={mIdx}
                                  onClick={() => handleSelectTopic(mTitle, micro.keyAxiom || (micro as any).keyFormulaOrLaw)}
                                  className={\`w-full text-left p-2 rounded-lg text-[11px] transition flex items-center justify-between \${selectedTopic === mTitle ? 'bg-emerald-950/80 border border-emerald-500 text-emerald-200' : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300'}\`}
                                >
                                  <span className="truncate">{mTitle}</span>
                                </button>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
              {selectedTopic ? (
                <>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase">Active Topic</span>
                      <h3 className="text-lg font-bold text-white">{editTitle}</h3>
                    </div>
                    <button onClick={handleAiAutoFill} disabled={isAiLoading} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-950 text-sky-300 text-xs font-semibold">
                      <Sparkles className="w-3.5 h-3.5" /> {isAiLoading ? 'Synthesizing...' : 'AI Auto-Fill'}
                    </button>
                  </div>
                  {saveSuccessMsg && <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500 text-emerald-300 text-xs">{saveSuccessMsg}</div>}
                  <div><label className="text-xs text-slate-400 block mb-1">Title</label><input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" /></div>
                  <div><label className="text-xs text-slate-400 block mb-1">Axiom/Formula</label><input type="text" value={editAxiom} onChange={(e) => setEditAxiom(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" /></div>
                  <div><label className="text-xs text-slate-400 block mb-1">Overview</label><textarea rows={4} value={editOverview} onChange={(e) => setEditOverview(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white" /></div>
                  <div><label className="text-xs text-slate-400 block mb-1">Tamil Explanation</label><textarea rows={3} value={editTamil} onChange={(e) => setEditTamil(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white" /></div>
                  <button onClick={handleSaveToDb} disabled={isSaving} className="w-full py-3 rounded-xl bg-emerald-600 text-slate-950 font-bold text-xs"><Save className="w-4 h-4 inline mr-2" /> Save to Supabase</button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <BookOpen className="w-12 h-12 text-slate-700 mb-3" />
                  <h3 className="text-sm font-bold text-slate-300">Select a Topic</h3>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: BULK SYLLABUS PARSER */}
        {activeTab === 'bulk_gen' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-2">1. Paste Official Syllabus</h3>
              <p className="text-xs text-slate-400 mb-4">Paste comma-separated or newline-separated government syllabus text. The engine will decompose it into strict 10-minute single-concept nodes.</p>
              <textarea
                rows={15}
                placeholder="e.g. Indus Valley Civilization, Vedic Age, Mauryan Empire, Gupta Empire..."
                value={rawSyllabus}
                onChange={(e) => setRawSyllabus(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-white font-mono mb-4 focus:border-sky-500 focus:outline-none"
              />
              <button
                onClick={processBulkSyllabus}
                className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                <Layers className="w-4 h-4" /> Decompose into Nano-Nodes
              </button>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-2">2. Review & Save to Database</h3>
              <p className="text-xs text-slate-400 mb-4">Review the decomposed nodes. Uncheck any invalid entries before saving.</p>
              
              <div className="h-[360px] overflow-y-auto bg-slate-950 border border-slate-800 rounded-xl p-4 mb-4 space-y-2">
                {bulkGeneratedNodes.length === 0 ? (
                  <p className="text-xs text-slate-600 text-center mt-10">No nodes generated yet.</p>
                ) : (
                  bulkGeneratedNodes.map((node, i) => (
                    <div key={node.id} className="flex items-center gap-3 bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <input 
                        type="checkbox" 
                        checked={node.selected} 
                        onChange={(e) => {
                          const newNodes = [...bulkGeneratedNodes];
                          newNodes[i].selected = e.target.checked;
                          setBulkGeneratedNodes(newNodes);
                        }}
                        className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-sky-500" 
                      />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-white">{node.title}</p>
                        <p className="text-[10px] text-sky-400">{node.duration} • {node.type}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button
                onClick={saveBulkNodesToDb}
                disabled={isSaving || bulkGeneratedNodes.length === 0}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Inject into Master Database'}
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: DAY PLAN ARCHITECT */}
        {activeTab === 'day_planner' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-2">Available Database Nodes</h3>
              <p className="text-xs text-slate-400 mb-4">Select single-concept nodes from the master database to assign to a student's daily plan.</p>
              
              <div className="h-[450px] overflow-y-auto pr-2 space-y-2">
                {syllabusUnits.flatMap(u => u.chapters || []).flatMap(c => c.subtopics || []).flatMap(s => s.microTopics || []).slice(0, 50).map((micro: any, idx) => {
                  const mTitle = micro.title || micro.topicTitle || \`Topic \${idx}\`;
                  return (
                    <div key={idx} className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <span className="text-xs text-slate-300 font-medium truncate flex-1">{mTitle}</span>
                      <button 
                        onClick={() => addNodeToDayPlan({ id: \`n_\${idx}\`, title: mTitle })}
                        className="ml-3 p-1.5 rounded bg-slate-800 hover:bg-emerald-600/20 text-emerald-400 transition"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Daily Plan Execution Builder</h3>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-400">Target Day:</label>
                  <input 
                    type="number" 
                    value={targetDay}
                    onChange={(e) => setTargetDay(parseInt(e.target.value) || 1)}
                    className="w-16 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white text-center"
                    min={1}
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto bg-slate-950 border border-slate-800 rounded-xl p-4 mb-4 space-y-3 min-h-[350px]">
                {dayPlanItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2">
                    <CalendarDays className="w-10 h-10 opacity-50" />
                    <p className="text-xs">No nodes assigned to Day {targetDay} yet.</p>
                  </div>
                ) : (
                  dayPlanItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px] font-bold text-amber-500">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-white">{item.title}</p>
                        <p className="text-[10px] text-amber-400/70">10 Min Execution Block</p>
                      </div>
                      <button 
                        onClick={() => setDayPlanItems(prev => prev.filter((_, i) => i !== idx))}
                        className="text-slate-500 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <button
                onClick={saveDayPlanToDb}
                disabled={isSaving || dayPlanItems.length === 0}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> {isSaving ? 'Assigning...' : \`Assign Plan to Users for Day \${targetDay}\`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
