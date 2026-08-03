'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Compass, MapPin, Calendar, CheckCircle, ShieldCheck, Send, Loader2, RefreshCw, Plus, Clock, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface TourPackage {
  id: string;
  title: string;
  destination: string;
  category: string;
  description?: string;
  price: number;
  duration_days: number;
  highlights?: string[];
  available: boolean;
  created_at: string;
}

const SEED_TOURS: Omit<TourPackage, 'id' | 'created_at'>[] = [
  { title: 'மதுரை மீனாட்சி & ராமேஸ்வரம் ஆன்மீகச் சுற்றுலா', destination: 'Madurai & Rameswaram', category: 'Pilgrimage', description: 'AC Innova cab, 2D/1N hotel stay included', price: 3500, duration_days: 2, highlights: ['மீனாட்சி அம்மன் கோவில்', 'ராமேஸ்வரம் தீர்த்தம்', 'பாம்பன் பாலம்'], available: true },
  { title: 'தஞ்சாவூர் பெரிய கோவில் & நவகிரக ஸ்தலங்கள்', destination: 'Thanjavur & Kumbakonam', category: 'Pilgrimage', description: 'Tempo Traveller, 3D/2N with breakfast', price: 5200, duration_days: 3, highlights: ['தஞ்சை பெரிய கோவில்', '9 நவகிரக ஸ்தலங்கள்', 'சுவாமிமலை'], available: true },
  { title: 'பழனி தண்டாயுதபாணி சிறப்பு தரிசனம்', destination: 'Palani, Dindigul', category: 'Pilgrimage', description: 'Sedan cab, ropeway ticket included', price: 1800, duration_days: 1, highlights: ['பழனி மலைக்கோயில்', 'ரோப் கார் சவாரி', 'இராஜ அலங்காரம்'], available: true },
  { title: 'Kodaikanal Hill Station Nature Tour', destination: 'Kodaikanal, Dindigul', category: 'Nature', description: 'SUV cab, full day guided trip', price: 2800, duration_days: 1, highlights: ['Coaker Walk', 'Bryant Park', 'Silver Cascade Falls'], available: true },
  { title: 'Mudumalai Wildlife Safari & Ooty', destination: 'Ooty & Mudumalai', category: 'Wildlife', description: '2D/1N, safari booking included', price: 4500, duration_days: 2, highlights: ['Mudumalai Safari', 'Botanical Garden', 'Nilgiri Train'], available: true },
];

const CATEGORY_COLORS: Record<string, string> = {
  Pilgrimage: 'text-orange-300 bg-orange-500/10 border-orange-500/30',
  Nature: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30',
  Wildlife: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
  Beach: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/30',
};

const THUMBNAILS: Record<string, string> = { Pilgrimage: '🛕', Nature: '🏔️', Wildlife: '🐘', Beach: '🏖️' };

export default function TourOPage() {
  const supabase = createClient();
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState('All');
  const [showPost, setShowPost] = useState(false);
  const [posting, setPosting] = useState(false);
  const [newPkg, setNewPkg] = useState({ title: '', destination: '', category: 'Pilgrimage', description: '', price: '', duration_days: '1', highlights: '' });

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('tour_packages').select('*').eq('available', true).order('created_at', { ascending: false });
    if (data && data.length > 0) {
      setPackages(data);
    } else {
      const { data: seeded } = await supabase.from('tour_packages').insert(SEED_TOURS).select();
      setPackages(seeded || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const categories = ['All', ...Array.from(new Set(packages.map(p => p.category)))];
  const filtered = selectedCat === 'All' ? packages : packages.filter(p => p.category === selectedCat);

  // Fetch Wikipedia summary for destination
  const [wikiInfo, setWikiInfo] = useState<Record<string, string>>({});
  const fetchWiki = async (destination: string) => {
    if (wikiInfo[destination]) return;
    try {
      const term = destination.split(',')[0].trim();
      const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(term)}`);
      const json = await res.json();
      if (json.extract) setWikiInfo(prev => ({ ...prev, [destination]: json.extract.slice(0, 200) + '…' }));
    } catch { /* ignore */ }
  };

  const handlePost = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setPosting(true);
    await supabase.from('tour_packages').insert({
      ...newPkg, price: Number(newPkg.price) || 0, duration_days: Number(newPkg.duration_days) || 1,
      highlights: newPkg.highlights.split(',').map(h => h.trim()).filter(Boolean), available: true,
    });
    setShowPost(false);
    setPosting(false);
    load();
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-orange-950/80 via-slate-900 to-amber-950/80 border border-orange-500/30 rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <span className="p-2.5 bg-orange-500/20 text-orange-300 border border-orange-500/40 rounded-xl"><Compass className="w-6 h-6" /></span>
          <div>
            <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-amber-300 to-yellow-200">TourO • ஆன்மீகம் & சுற்றுலா</h1>
            <p className="text-xs text-slate-400">Live tour packages — Wikipedia destination info + WhatsApp booking</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition"><RefreshCw className="h-4 w-4" /></button>
          <button onClick={() => setShowPost(true)} className="px-4 py-2 rounded-xl bg-orange-500 text-black font-bold text-xs flex items-center gap-1.5 hover:bg-orange-400 transition">
            <Plus className="h-4 w-4" /> Package பதிவிட
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
        {categories.map(c => (
          <button key={c} onClick={() => setSelectedCat(c)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${selectedCat === c ? 'bg-orange-500 text-black' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-orange-400" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(pkg => (
            <div key={pkg.id} onMouseEnter={() => fetchWiki(pkg.destination)}
              className="bg-slate-900 border border-slate-800 hover:border-orange-500/40 rounded-2xl p-5 space-y-4 transition flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{THUMBNAILS[pkg.category] || '🗺️'}</span>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${CATEGORY_COLORS[pkg.category] || 'text-slate-400 bg-slate-800 border-slate-700'}`}>{pkg.category}</span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1"><Clock className="h-3 w-3" />{pkg.duration_days} Day{pkg.duration_days > 1 ? 's' : ''}</span>
                  </div>
                </div>
                <h3 className="text-sm font-bold text-white leading-snug">{pkg.title}</h3>
                <p className="text-xs text-orange-400 flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{pkg.destination}</p>
                {wikiInfo[pkg.destination] && (
                  <p className="text-[10px] text-slate-400 bg-slate-800/60 rounded-lg p-2 leading-relaxed line-clamp-3">📖 {wikiInfo[pkg.destination]}</p>
                )}
                {pkg.highlights && pkg.highlights.length > 0 && (
                  <ul className="text-xs text-slate-300 space-y-1">
                    {pkg.highlights.slice(0, 3).map((h, i) => (
                      <li key={i} className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />{h}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-lg font-black text-amber-300">₹{pkg.price.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-400 block">/ person</span>
                </div>
                <button onClick={() => {
                  const msg = `👋 TourO Package Booking: "${pkg.title}" (${pkg.duration_days} days). Please confirm availability and driver details.`;
                  window.open(`https://wa.me/919486335870?text=${encodeURIComponent(msg)}`, '_blank');
                }} className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-bold text-xs transition">
                  Book Now →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Package Modal */}
      {showPost && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-orange-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">➕ New Tour Package</h3>
              <button onClick={() => setShowPost(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handlePost} className="space-y-3">
              <input required placeholder="Package Title" value={newPkg.title} onChange={e => setNewPkg(p => ({ ...p, title: e.target.value }))}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs" />
              <input required placeholder="Destination (e.g. Madurai, Tamil Nadu)" value={newPkg.destination} onChange={e => setNewPkg(p => ({ ...p, destination: e.target.value }))}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs" />
              <div className="grid grid-cols-2 gap-3">
                <select value={newPkg.category} onChange={e => setNewPkg(p => ({ ...p, category: e.target.value }))}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs">
                  {['Pilgrimage', 'Nature', 'Wildlife', 'Beach', 'Heritage'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input type="number" placeholder="Duration (days)" value={newPkg.duration_days} onChange={e => setNewPkg(p => ({ ...p, duration_days: e.target.value }))}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs" />
              </div>
              <input type="number" required placeholder="Price per person (₹)" value={newPkg.price} onChange={e => setNewPkg(p => ({ ...p, price: e.target.value }))}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs" />
              <input placeholder="Highlights (comma separated)" value={newPkg.highlights} onChange={e => setNewPkg(p => ({ ...p, highlights: e.target.value }))}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs" />
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowPost(false)} className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">Cancel</button>
                <button type="submit" disabled={posting} className="flex-1 py-2.5 rounded-xl bg-orange-500 text-black text-xs font-bold disabled:opacity-60">
                  {posting ? 'Publishing...' : 'Publish ✓'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
