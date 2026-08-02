// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { 
  CheckSquare, 
  Wrench, 
  MapPin, 
  Clock, 
  DollarSign, 
  Plus, 
  Search, 
  CheckCircle, 
  Briefcase,
  Sparkles
} from 'lucide-react';

const INITIAL_TASKS = [
  {
    id: 1,
    title: 'டிராக்டர் என்ஜின் ஆயில் & ஃபில்டர் மாற்றுதல் (Tractor Service)',
    category: 'Handyman & Mechanic',
    location: 'Oddanchatram, Dindigul',
    pay: '₹800',
    time: 'Today, 2:00 PM',
    status: 'Open',
    postedBy: 'Farmer Murugan',
    phone: '9486335870'
  },
  {
    id: 2,
    title: 'விளைபொருட்கள் பேக்கிங் & லாரி லோடிங் (Lorry Loading Assistance)',
    category: 'Daily Gig Work',
    location: 'Koyambedu Wholesale Market, Chennai',
    pay: '₹1,200 / day',
    time: 'Tomorrow, 6:00 AM',
    status: 'Open',
    postedBy: 'Trader Senthil',
    phone: '9123596988'
  },
  {
    id: 3,
    title: 'TN State Board Science Online Tutor (ஆசான் பணி)',
    category: 'Tutoring & Teaching',
    location: 'Remote / Online',
    pay: '₹500 / hr',
    time: 'Flexible',
    status: 'Open',
    postedBy: 'TeachO Hub',
    phone: '9876543210'
  }
];

export default function TaskOPage() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPay, setNewPay] = useState('');
  const [newLocation, setNewLocation] = useState('');

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newTask = {
      id: Date.now(),
      title: newTitle,
      category: 'General Task',
      location: newLocation || 'Tamil Nadu',
      pay: newPay ? `₹${newPay}` : '₹500',
      time: 'Just Now',
      status: 'Open',
      postedBy: 'Verified User',
      phone: '9486335870'
    };
    setTasks([newTask, ...tasks]);
    setNewTitle('');
    setNewPay('');
    setNewLocation('');
    setShowNewTaskModal(false);
  };

  const filteredTasks = tasks.filter(t => 
    !searchQuery || 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white p-4 md:p-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/30 rounded-2xl p-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <CheckSquare className="w-6 h-6" />
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300">
              TaskO • பணிகள் &amp; வேலைவாய்ப்பு (Gig Job Board)
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-300">
            உள்ளூர் வேலைகள், கைவினைப் பணிகள், லோடிங் &amp; அன்லோடிங் மற்றும் பகுதிநேர வேலைவாய்ப்புகள்.
          </p>
        </div>

        <button
          onClick={() => setShowNewTaskModal(true)}
          className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs flex items-center gap-2 transition shadow-lg shrink-0"
        >
          <Plus className="w-4 h-4" /> புதிய பணி பதிவிட (Post Task)
        </button>
      </div>

      {/* New Task Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h2 className="text-lg font-bold text-white">புதிய பணி பதிவிட (Post New Task)</h2>
            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">பணியின் தலைப்பு (Task Title):</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tractor Repair, Goods Loading"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">ஊதியம் (Pay - ₹):</label>
                  <input
                    type="number"
                    placeholder="800"
                    value={newPay}
                    onChange={e => setNewPay(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">இடம் (Location):</label>
                  <input
                    type="text"
                    placeholder="Madurai, Salem"
                    value={newLocation}
                    onChange={e => setNewLocation(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-black text-xs font-extrabold"
                >
                  Publish Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          placeholder="Search jobs by title or location (e.g. Tractor, Loading, Chennai)..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs md:text-sm focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map(task => (
          <div
            key={task.id}
            className="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-6 space-y-4 transition shadow-md flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  {task.category}
                </span>
                <span className="text-base font-black text-emerald-400">{task.pay}</span>
              </div>

              <h3 className="text-base font-bold text-white leading-snug">{task.title}</h3>

              <div className="space-y-1 text-xs text-slate-400">
                <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-500" /> {task.location}</p>
                <p className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-500" /> {task.time}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">By: {task.postedBy}</span>
              <button
                onClick={() => {
                  const text = `👋 Hello! I am interested in your task posted on FAGO TaskO: "${task.title}". Is it still available?`;
                  window.open(`https://api.whatsapp.com/send?phone=91${task.phone}&text=${encodeURIComponent(text)}`, '_blank');
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs flex items-center gap-1 transition shadow"
              >
                Apply via WhatsApp →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
