'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Tractor, ShieldCheck, MapPin, Search, Send, CheckCircle2, Plus, RefreshCw, Loader2, Star, Phone } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { createClient } from '@/lib/supabase/client';

interface Equipment {
  id: string;
  title: string;
  category: string;
  description?: string;
  owner_name?: string;
  owner_phone?: string;
  district?: string;
  price_per_day: number;
  available: boolean;
  images?: string[];
  created_at: string;
}

const CATEGORIES = ['All', 'Tractor', 'Harvester', 'Drone', 'Irrigation', 'Attachment'];
const DISTRICTS = ['Thanjavur', 'Trichy', 'Madurai', 'Salem', 'Coimbatore', 'Dindigul', 'Erode', 'Tirunelveli'];
const EMOJI: Record<string, string> = { Tractor: '🚜', Harvester: '🌾', Drone: '🛸', Irrigation: '💧', Attachment: '⚙️', General: '🔧' };

// Seed data — inserted once when table is empty
const SEED_EQUIPMENT = [
  { title: 'Mahindra 575 DI Tractor (45 HP) + Rotavator', category: 'Tractor', description: 'Fully serviced tractor with rotavator attachment', owner_name: 'Murugan', owner_phone: '9486335870', district: 'Thanjavur', price_per_day: 2400, available: true },
  { title: 'Kubota Multi-Crop Paddy Harvester', category: 'Harvester', description: '75 HP harvester for paddy, wheat, maize', owner_name: 'Rajan', owner_phone: '9486335870', district: 'Trichy', price_per_day: 7200, available: true },
  { title: 'FAGO Agri Drone Sprayer (10L)', category: 'Drone', description: 'AI-powered solar drone, covers 10 acres/hr', owner_name: 'Karthik', owner_phone: '9486335870', district: 'Madurai', price_per_day: 1800, available: true },
  { title: '5HP Diesel Irrigation Pump', category: 'Irrigation', description: 'Heavy-duty diesel pump for borewells', owner_name: 'Senthil', owner_phone: '9486335870', district: 'Salem', price_per_day: 250, available: true },
  { title: 'Disc Harrow & Plough Attachment', category: 'Attachment', description: 'Universal attachment for all 35HP+ tractors', owner_name: 'Balu', owner_phone: '9486335870', district: 'Coimbatore', price_per_day: 350, available: true },
];

export default function RentOPage() {
  const { user, profile } = useAuth();
  const supabase = createClient();

  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selected, setSelected] = useState<Equipment | null>(null);
  const [hours, setHours] = useState('4');
  const [booked, setBooked] = useState(false);
  const [showPost, setShowPost] = useState(false);
  const [posting, setPosting] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', category: 'Tractor', district: 'Thanjavur', price_per_day: '', description: '', owner_phone: '' });

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('equipment_listings').select('*').eq('available', true).order('created_at', { ascending: false });
    if (data && data.length > 0) {
      setEquipment(data);
    } else {
      // Seed initial data
      const { data: seeded } = await supabase.from('equipment_listings').insert(SEED_EQUIPMENT).select();
      setEquipment(seeded || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = equipment.filter(e => {
    const matchCat = selectedCat === 'All' || e.category === selectedCat;
    const matchDist = selectedDistrict === 'All' || e.district === selectedDistrict;
    const matchSearch = !searchQuery || e.title.toLowerCase().includes(searchQuery.toLowerCase()) || e.district?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchDist && matchSearch;
  });

  const handlePost = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!newItem.title.trim()) return;
    setPosting(true);
    await supabase.from('equipment_listings').insert({
      ...newItem,
      price_per_day: Number(newItem.price_per_day) || 0,
      available: true,
    });
    setShowPost(false);
    setNewItem({ title: '', category: 'Tractor', district: 'Thanjavur', price_per_day: '', description: '', owner_phone: '' });
    setPosting(false);
    load();
  };

  const confirmBook = (m: Equipment) => {
    const name = profile?.full_name || 'Farmer';
    const msg = `🚜 *RentO வாடகை கோரிக்கை*\n\nகருவி: ${m.title}\nவிலை: ₹${m.price_per_day}/நாள்\nமாவட்டம்: ${m.district}\nதேவையான நேரம்: ${hours} மணி\nவாடிக்கையாளர்: ${name}\n\n0% Commission — நேரடி வாடகை.`;
    window.open(`https://wa.me/91${m.owner_phone || '9486335870'}?text=${encodeURIComponent(msg)}`, '_blank');
    setBooked(true);
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400"><Tractor className="h-7 w-7" /></div>
          <div>
            <h1 className="text-2xl font-black text-white">RentO • விவசாயக் கருவிகள் வாடகை</h1>
            <p className="text-xs text-slate-400 mt-0.5">0% Commission Direct Agri Equipment Rentals — Live from DB</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition">
            <RefreshCw className="h-4 w-4" />
          </button>
          <button onClick={() => setShowPost(true)} className="px-4 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs flex items-center gap-1.5 hover:bg-amber-400 transition">
            <Plus className="h-4 w-4" /> கருவி பதிவிட (List Equipment)
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setSelectedCat(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${selectedCat === c ? 'bg-amber-500 border-amber-400 text-black' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}>
              {c}
            </button>
          ))}
        </div>
        <select value={selectedDistrict} onChange={e => setSelectedDistrict(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white">
          <option value="All">All Districts</option>
          {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" placeholder="தேடுக (Search)..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500" />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-amber-400" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(m => (
            <div key={m.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-amber-500/40 transition flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{EMOJI[m.category] || '🔧'}</span>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">{m.category}</span>
                </div>
                <h3 className="text-sm font-bold text-white">{m.title}</h3>
                {m.description && <p className="text-xs text-slate-400 line-clamp-2">{m.description}</p>}
                <p className="text-xs text-slate-400 flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-emerald-400" />{m.district}</p>
                <div className="p-2.5 bg-slate-950/60 rounded-xl flex items-center justify-between">
                  <span className="text-xs text-slate-400">வாடகை:</span>
                  <span className="text-sm font-black text-emerald-400">₹{m.price_per_day}<span className="text-[10px] font-normal text-slate-400">/நாள்</span></span>
                </div>
              </div>
              <button onClick={() => { setSelected(m); setBooked(false); }}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs flex items-center justify-center gap-2 transition">
                <Send className="w-3.5 h-3.5" /> வாடகைக்கு பெறுக
              </button>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-16 text-slate-500">
              <Tractor className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">இந்த வகைக்கு எந்த கருவியும் இல்லை.</p>
            </div>
          )}
        </div>
      )}

      {/* Booking Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-amber-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">🚜 வாடகை பதிவு</h3>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="p-3 bg-slate-900/80 rounded-xl border border-white/10">
              <p className="text-xs font-bold text-amber-400">{selected.title}</p>
              <p className="text-xs text-emerald-400 mt-0.5">₹{selected.price_per_day}/நாள்</p>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">தேவையான நேரம் (Hours/Days):</label>
              <input type="number" value={hours} onChange={e => setHours(e.target.value)} min="1"
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500" />
            </div>
            {booked ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center text-xs text-emerald-400 font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> WhatsApp Request Sent!
              </div>
            ) : (
              <div className="space-y-2">
                <button onClick={() => confirmBook(selected)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-black text-xs flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" /> WhatsApp வழியாக பதிவு செய்
                </button>
                <a href={`upi://pay?pa=9486335870@hdfcbank&pn=SuprO%20RentO&am=100&cu=INR&tn=RentO%20Booking%20Deposit`}
                  className="w-full py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center justify-center gap-2 transition">
                  💳 Pay ₹100 Advance UPI Deposit
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Post Equipment Modal */}
      {showPost && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-amber-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">➕ கருவி பட்டியலிட</h3>
              <button onClick={() => setShowPost(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handlePost} className="space-y-3">
              <input required placeholder="Equipment Title" value={newItem.title} onChange={e => setNewItem(p => ({ ...p, title: e.target.value }))}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500" />
              <div className="grid grid-cols-2 gap-3">
                <select value={newItem.category} onChange={e => setNewItem(p => ({ ...p, category: e.target.value }))}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs">
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={newItem.district} onChange={e => setNewItem(p => ({ ...p, district: e.target.value }))}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs">
                  {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <input type="number" required placeholder="Price per day (₹)" value={newItem.price_per_day} onChange={e => setNewItem(p => ({ ...p, price_per_day: e.target.value }))}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500" />
              <input placeholder="Your Phone Number" value={newItem.owner_phone} onChange={e => setNewItem(p => ({ ...p, owner_phone: e.target.value }))}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500" />
              <textarea placeholder="Description (optional)" value={newItem.description} onChange={e => setNewItem(p => ({ ...p, description: e.target.value }))} rows={2}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500 resize-none" />
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowPost(false)} className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">Cancel</button>
                <button type="submit" disabled={posting} className="flex-1 py-2.5 rounded-xl bg-amber-500 text-black text-xs font-bold disabled:opacity-60">
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
