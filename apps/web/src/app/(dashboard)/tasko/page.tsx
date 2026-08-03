'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CheckSquare, MapPin, Clock, Plus, Search, Loader2, RefreshCw, Briefcase, DollarSign, Phone } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';

interface Task {
  id: string;
  title: string;
  category: string;
  description?: string;
  budget: number;
  location?: string;
  phone?: string;
  status: string;
  created_at: string;
}

const CATEGORIES = ['All', 'Handyman', 'Loading & Transport', 'Farming', 'Teaching', 'Cleaning', 'Delivery', 'General'];
const SEED_TASKS: Omit<Task, 'id' | 'created_at'>[] = [
  { title: 'டிராக்டர் என்ஜின் ஆயில் & ஃபில்டர் மாற்றுதல்', category: 'Handyman', description: 'Mahindra 575 full service needed today', budget: 800, location: 'Oddanchatram, Dindigul', phone: '9486335870', status: 'open' },
  { title: 'விளைபொருட்கள் லாரி லோடிங் உதவியாளர்', category: 'Loading & Transport', description: 'Vegetable loading at Koyambedu market', budget: 1200, location: 'Koyambedu, Chennai', phone: '9486335870', status: 'open' },
  { title: 'TN State Board Science Online Tutor (10th)', category: 'Teaching', description: 'Flexible timing, online via WhatsApp video', budget: 500, location: 'Remote / Online', phone: '9486335870', status: 'open' },
  { title: 'வீட்டு தோட்ட பராமரிப்பு (Garden Maintenance)', category: 'Farming', description: 'Weekly garden care for residential bungalow', budget: 600, location: 'Coimbatore', phone: '9486335870', status: 'open' },
];

const CAT_COLORS: Record<string, string> = {
  'Handyman': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  'Loading & Transport': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  'Farming': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  'Teaching': 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  'Cleaning': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  'Delivery': 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  'General': 'bg-slate-500/10 text-slate-400 border-slate-500/30',
};

export default function TaskOPage() {
  const { user, profile } = useAuth();
  const supabase = createClient();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPost, setShowPost] = useState(false);
  const [posting, setPosting] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', category: 'General', description: '', budget: '', location: '', phone: '' });

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('local_tasks').select('*').eq('status', 'open').order('created_at', { ascending: false });
    if (data && data.length > 0) {
      setTasks(data);
    } else {
      const { data: seeded } = await supabase.from('local_tasks').insert(SEED_TASKS).select();
      setTasks(seeded || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = tasks.filter(t => {
    const matchCat = selectedCat === 'All' || t.category === selectedCat;
    const matchSearch = !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.location?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handlePost = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!newTask.title.trim()) return;
    setPosting(true);
    await supabase.from('local_tasks').insert({
      ...newTask,
      budget: Number(newTask.budget) || 0,
      status: 'open',
      posted_by: user?.id,
    });
    setShowPost(false);
    setNewTask({ title: '', category: 'General', description: '', budget: '', location: '', phone: '' });
    setPosting(false);
    load();
  };

  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const hrs = Math.floor(diff / 3600000);
    if (hrs < 1) return 'Just now';
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/30 rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <span className="p-2.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl"><CheckSquare className="w-6 h-6" /></span>
          <div>
            <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300">TaskO • பணிகள் & வேலைவாய்ப்பு</h1>
            <p className="text-xs text-slate-400">Live gig jobs — persisted to Supabase, apply via WhatsApp</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white"><RefreshCw className="h-4 w-4" /></button>
          <button onClick={() => setShowPost(true)} className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-400 transition">
            <Plus className="h-4 w-4" /> பணி பதிவிட (Post Task)
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setSelectedCat(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${selectedCat === c ? 'bg-emerald-500 text-black' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" placeholder="தேடுக (Search tasks, location)..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500" />
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5 text-emerald-400" />{tasks.length} open tasks</span>
        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-emerald-400" />Tamil Nadu</span>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-emerald-400" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(task => (
            <div key={task.id} className="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-5 space-y-3 transition flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${CAT_COLORS[task.category] || CAT_COLORS['General']}`}>{task.category}</span>
                  <span className="text-base font-black text-emerald-400">₹{task.budget.toLocaleString()}</span>
                </div>
                <h3 className="text-sm font-bold text-white leading-snug">{task.title}</h3>
                {task.description && <p className="text-xs text-slate-400 line-clamp-2">{task.description}</p>}
                <div className="space-y-1 text-xs text-slate-400">
                  {task.location && <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-slate-500" />{task.location}</p>}
                  <p className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-slate-500" />{timeAgo(task.created_at)}</p>
                </div>
              </div>
              <button onClick={() => {
                const msg = `👋 நான் TaskO-ல் பதிவிடப்பட்ட "${task.title}" பணிக்கு விண்ணப்பிக்கிறேன். இது இன்னும் available-ஆ?`;
                window.open(`https://wa.me/91${task.phone || '9486335870'}?text=${encodeURIComponent(msg)}`, '_blank');
              }} className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-2 transition">
                <Phone className="h-3.5 w-3.5" /> WhatsApp வழியாக விண்ணப்பிக்க
              </button>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-16 text-slate-500">
              <CheckSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">இந்த வகைக்கு எந்த பணியும் இல்லை.</p>
            </div>
          )}
        </div>
      )}

      {/* Post Task Modal */}
      {showPost && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-emerald-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">➕ புதிய பணி பதிவிட</h3>
              <button onClick={() => setShowPost(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handlePost} className="space-y-3">
              <input required placeholder="Task Title" value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs" />
              <select value={newTask.category} onChange={e => setNewTask(p => ({ ...p, category: e.target.value }))}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs">
                {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Budget (₹)" value={newTask.budget} onChange={e => setNewTask(p => ({ ...p, budget: e.target.value }))}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs" />
                <input placeholder="Location" value={newTask.location} onChange={e => setNewTask(p => ({ ...p, location: e.target.value }))}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs" />
              </div>
              <input placeholder="Contact Phone" value={newTask.phone} onChange={e => setNewTask(p => ({ ...p, phone: e.target.value }))}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs" />
              <textarea placeholder="Description (optional)" value={newTask.description} onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))} rows={2}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs resize-none" />
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowPost(false)} className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">Cancel</button>
                <button type="submit" disabled={posting} className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-black text-xs font-bold disabled:opacity-60">
                  {posting ? 'Posting...' : 'Publish ✓'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
