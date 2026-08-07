'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { createLMSClient } from '@/lib/supabase/lms-client';
import { GraduationCap, FileCheck, Plus, Pencil, Trash2, X, PlusCircle, FileText, FileSpreadsheet, Sparkles } from 'lucide-react';

type LMSItem = {
  id: string;
  item_type: 'COURSE' | 'o_test';
  title_name: string;
  category: string;
  description_purpose: string;
  additional_info: any;
};

export default function LMSAdminPage() {
  const [activeTab, setActiveTab] = useState<'COURSE' | 'o_test'>('COURSE');
  const [items, setItems] = useState<LMSItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LMSItem | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [googleFormLink, setGoogleFormLink] = useState('');
  const [testoLink, setTestoLink] = useState('');
  const [durationMins, setDurationMins] = useState(30);

  // Curriculum State for Courses
  const [curriculum, setCurriculum] = useState<any[]>([]);

  // Parsed Questions for Tests
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const fetchItems = async () => {
    setLoading(true);
    const supabase = createLMSClient();
    const { data, error } = await supabase
      .from('unified_master_data')
      .select('*')
      .eq('item_type', activeTab)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setItems(data as LMSItem[]);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    const supabase = createLMSClient();
    await supabase.from('unified_master_data').delete().eq('id', id);
    fetchItems();
  };

  const openModal = (item?: LMSItem) => {
    if (item) {
      setEditingItem(item);
      setTitle(item.title_name || '');
      setCategory(item.category || '');
      setDescription(item.description_purpose || '');
      
      let ai = item.additional_info || {};
      if (typeof ai === 'string') {
        try { ai = JSON.parse(ai); } catch (e) {}
      }

      setAiSummary(ai.ai_summary || '');
      setVideoUrl(ai.video_url || '');
      setPdfUrl(ai.pdf_url || '');
      setGoogleFormLink(ai.google_form_link || '');
      setTestoLink(ai.testo_link || '');
      setDurationMins(ai.durationMins || 30);
      setCurriculum(ai.curriculum || []);
      setQuestions(ai.questions || []);
    } else {
      setEditingItem(null);
      setTitle('');
      setCategory('');
      setDescription('');
      setAiSummary('');
      setVideoUrl('');
      setPdfUrl('');
      setGoogleFormLink('');
      setTestoLink('');
      setDurationMins(30);
      setCurriculum([]);
      setQuestions([]);
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const supabase = createLMSClient();
    const additionalInfo = {
      ai_summary: aiSummary,
      google_form_link: googleFormLink,
      ...(activeTab === 'COURSE' ? {
        video_url: videoUrl,
        pdf_url: pdfUrl,
        testo_link: testoLink,
        curriculum: curriculum
      } : {
        durationMins: durationMins,
        questionsCount: questions.length,
        questions: questions
      })
    };

    const payload = {
      item_type: activeTab,
      title_name: title,
      category: category,
      description_purpose: description,
      additional_info: additionalInfo
    };

    if (editingItem) {
      await supabase.from('unified_master_data').update(payload).eq('id', editingItem.id);
    } else {
      await supabase.from('unified_master_data').insert([payload]);
    }

    setIsModalOpen(false);
    fetchItems();
  };

  // CSV Parser for TestO
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split('\n');
      const parsedQuestions = [];
      
      // Skip header row
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Simple CSV parse (fails on quoted commas, but good for basic use cases)
        const columns = line.split(',');
        if (columns.length >= 6) {
          parsedQuestions.push({
            q: columns[0].trim(),
            options: [columns[1].trim(), columns[2].trim(), columns[3].trim(), columns[4].trim()],
            answer: columns[5].trim(),
            explanation: columns[6] ? columns[6].trim() : ''
          });
        }
      }
      setQuestions(parsedQuestions);
      alert(`Successfully parsed ${parsedQuestions.length} questions!`);
    };
    reader.readAsText(file);
  };

  const addModule = () => {
    setCurriculum([...curriculum, { title: 'New Module', videos: [] }]);
  };

  const addVideoToModule = (mIdx: number) => {
    const newCurr = [...curriculum];
    newCurr[mIdx].videos.push({ title: 'New Lesson', url: '' });
    setCurriculum(newCurr);
  };

  const updateModuleTitle = (mIdx: number, val: string) => {
    const newCurr = [...curriculum];
    newCurr[mIdx].title = val;
    setCurriculum(newCurr);
  };

  const updateVideo = (mIdx: number, vIdx: number, field: 'title' | 'url', val: string) => {
    const newCurr = [...curriculum];
    newCurr[mIdx].videos[vIdx][field] = val;
    setCurriculum(newCurr);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">LMS Admin Dashboard</h1>
          <p className="text-sm text-slate-400">Manage TeachO Courses & TestO Exams.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create New {activeTab === 'COURSE' ? 'Course' : 'Exam'}
        </button>
      </div>

      <div className="flex gap-4 border-b border-slate-800">
        <button 
          onClick={() => setActiveTab('COURSE')}
          className={`pb-3 px-2 font-medium border-b-2 flex items-center gap-2 ${activeTab === 'COURSE' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <GraduationCap className="w-4 h-4" /> TeachO Courses
        </button>
        <button 
          onClick={() => setActiveTab('o_test')}
          className={`pb-3 px-2 font-medium border-b-2 flex items-center gap-2 ${activeTab === 'o_test' ? 'border-rose-500 text-rose-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <FileCheck className="w-4 h-4" /> TestO Exams
        </button>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/50 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4 font-medium">Title</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-slate-500">No records found.</td>
                </tr>
              ) : (
                items.map(item => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 font-medium text-white">{item.title_name}</td>
                    <td className="p-4">
                      <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs">
                        {item.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="p-4 flex items-center justify-end gap-3">
                      <button onClick={() => openModal(item)} className="text-indigo-400 hover:text-indigo-300">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="text-rose-400 hover:text-rose-300">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE/EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-full flex flex-col shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b border-slate-800 bg-slate-950/50">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {editingItem ? 'Edit' : 'Create'} {activeTab === 'COURSE' ? 'TeachO Course' : 'TestO Exam'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-8 custom-scrollbar">
              
              {/* Basic Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">Basic Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-400">Title Name *</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" placeholder="E.g., Full Stack Next.js" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-400">Category *</label>
                    <input type="text" value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" placeholder="E.g., IT Skills" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-400">Description / Purpose</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
                </div>
              </div>

              {/* COURSE SPECIFIC */}
              {activeTab === 'COURSE' && (
                <>
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">Content Links & AI</h3>
                    
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-indigo-400 flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI Summary / Notes</label>
                      <textarea value={aiSummary} onChange={e => setAiSummary(e.target.value)} rows={2} className="w-full bg-indigo-950/20 border border-indigo-500/30 rounded-lg px-3 py-2 text-sm text-indigo-200 focus:outline-none focus:border-indigo-500 placeholder-indigo-700" placeholder="Add AI-generated summaries or key takeaways here..." />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-400">Single Video URL (Optional)</label>
                        <input type="text" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" placeholder="YouTube/Vimeo link" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-400">PDF Document URL</label>
                        <input type="text" value={pdfUrl} onChange={e => setPdfUrl(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" placeholder="https://..." />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-400">Link a TestO Exam (UUID)</label>
                        <input type="text" value={testoLink} onChange={e => setTestoLink(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" placeholder="Paste TestO ID here" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-400">External Google Form Link</label>
                        <input type="text" value={googleFormLink} onChange={e => setGoogleFormLink(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" placeholder="https://forms.gle/..." />
                      </div>
                    </div>
                  </div>

                  {/* Curriculum Builder */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Curriculum Builder</h3>
                      <button onClick={addModule} className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold flex items-center gap-1">
                        <PlusCircle className="w-3.5 h-3.5" /> Add Module
                      </button>
                    </div>

                    <div className="space-y-4">
                      {curriculum.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">No modules added yet.</p>
                      ) : (
                        curriculum.map((mod, mIdx) => (
                          <div key={mIdx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                            <div className="flex items-center justify-between gap-3">
                              <input 
                                type="text" 
                                value={mod.title} 
                                onChange={(e) => updateModuleTitle(mIdx, e.target.value)}
                                className="flex-1 bg-transparent border-b border-slate-700 px-1 py-1 text-sm font-bold text-white focus:outline-none focus:border-indigo-500" 
                                placeholder="Module Title" 
                              />
                              <button onClick={() => {
                                const newC = [...curriculum];
                                newC.splice(mIdx, 1);
                                setCurriculum(newC);
                              }} className="text-rose-500 hover:text-rose-400"><Trash2 className="w-4 h-4"/></button>
                            </div>
                            
                            <div className="pl-4 space-y-2 border-l-2 border-slate-800">
                              {mod.videos.map((vid: any, vIdx: number) => (
                                <div key={vIdx} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                                  <input 
                                    type="text" 
                                    value={vid.title} 
                                    onChange={(e) => updateVideo(mIdx, vIdx, 'title', e.target.value)}
                                    className="w-full sm:w-1/3 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white" 
                                    placeholder="Lesson Title" 
                                  />
                                  <input 
                                    type="text" 
                                    value={vid.url} 
                                    onChange={(e) => updateVideo(mIdx, vIdx, 'url', e.target.value)}
                                    className="flex-1 w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white" 
                                    placeholder="Video URL (YouTube/Vimeo)" 
                                  />
                                  <button onClick={() => {
                                    const newC = [...curriculum];
                                    newC[mIdx].videos.splice(vIdx, 1);
                                    setCurriculum(newC);
                                  }} className="text-slate-500 hover:text-rose-400 p-1"><X className="w-3.5 h-3.5"/></button>
                                </div>
                              ))}
                              <button onClick={() => addVideoToModule(mIdx)} className="text-slate-400 hover:text-white text-xs flex items-center gap-1 pt-1">
                                <Plus className="w-3 h-3" /> Add Lesson Video
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* TESTO SPECIFIC */}
              {activeTab === 'o_test' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-400">Duration (Minutes)</label>
                      <input type="number" value={durationMins} onChange={e => setDurationMins(parseInt(e.target.value) || 30)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-400">External Google Form Link (Optional Override)</label>
                      <input type="text" value={googleFormLink} onChange={e => setGoogleFormLink(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500" placeholder="https://forms.gle/..." />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">Native Questions Builder</h3>
                    
                    <div className="bg-slate-950 border border-slate-800 border-dashed rounded-xl p-6 text-center space-y-3">
                      <FileSpreadsheet className="w-8 h-8 text-rose-500 mx-auto" />
                      <div>
                        <p className="text-sm text-white font-medium">Upload CSV to Auto-Generate Exam</p>
                        <p className="text-xs text-slate-500 mt-1">Format: Question, Option1, Option2, Option3, Option4, Answer, Explanation</p>
                      </div>
                      <input 
                        type="file" 
                        accept=".csv" 
                        onChange={handleCSVUpload}
                        className="block w-full max-w-xs mx-auto text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-rose-500/10 file:text-rose-400 hover:file:bg-rose-500/20 cursor-pointer"
                      />
                    </div>
                    
                    {questions.length > 0 && (
                      <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-3 flex items-center justify-between">
                        <span className="text-sm text-rose-400 font-medium">{questions.length} Questions Ready</span>
                        <button onClick={() => setQuestions([])} className="text-rose-400 hover:text-rose-300 text-xs">Clear</button>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
            
            <div className="p-5 border-t border-slate-800 bg-slate-950/50 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white">Cancel</button>
              <button onClick={handleSave} className={`px-6 py-2 text-sm font-bold text-white rounded-lg ${activeTab === 'COURSE' ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-rose-600 hover:bg-rose-500'}`}>
                Save {activeTab === 'COURSE' ? 'Course' : 'Exam'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
