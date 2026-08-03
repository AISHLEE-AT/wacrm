'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Tv, Radio, Play, Plus, Loader2, RefreshCw, Globe } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Channel {
  id: string;
  name: string;
  youtube_channel_id?: string;
  youtube_live_url?: string;
  category: string;
  is_live: boolean;
  thumbnail_url?: string;
  language: string;
}

const CATEGORIES = ['All', 'News', 'Education', 'Agriculture', 'Devotional', 'Tech', 'Entertainment'];

const SEED_CHANNELS: Omit<Channel, 'id'>[] = [
  { name: 'TNPSC Exam Live Classes', youtube_live_url: 'https://www.youtube.com/embed/live_stream?channel=UCmmBnJkzHPhQH2qMHKE3Cxw', youtube_channel_id: 'UCmmBnJkzHPhQH2qMHKE3Cxw', category: 'Education', is_live: true, language: 'Tamil', thumbnail_url: '' },
  { name: 'Thanthi TV News', youtube_live_url: 'https://www.youtube.com/embed/live_stream?channel=UCCdEX-_JVsA_wMfEGa5HLOQ', youtube_channel_id: 'UCCdEX-_JVsA_wMfEGa5HLOQ', category: 'News', is_live: true, language: 'Tamil', thumbnail_url: '' },
  { name: 'Puthiya Thalaimurai', youtube_live_url: 'https://www.youtube.com/embed/live_stream?channel=UCG4HKUYdhsAMVM0TA5rXa8Q', youtube_channel_id: 'UCG4HKUYdhsAMVM0TA5rXa8Q', category: 'News', is_live: true, language: 'Tamil', thumbnail_url: '' },
  { name: 'Tamil Agri Mandi News', youtube_live_url: 'https://www.youtube.com/embed/live_stream?channel=UCvJJ3G0GnCCUmtxaRr3sHtA', youtube_channel_id: 'UCvJJ3G0GnCCUmtxaRr3sHtA', category: 'Agriculture', is_live: false, language: 'Tamil', thumbnail_url: '' },
  { name: 'Vijay TV Live', youtube_live_url: 'https://www.youtube.com/embed/live_stream?channel=UCBgrBAtGaIpCq3HlfGMmOmg', youtube_channel_id: 'UCBgrBAtGaIpCq3HlfGMmOmg', category: 'Entertainment', is_live: true, language: 'Tamil', thumbnail_url: '' },
  { name: 'Arputham Aarogyam (Devotional)', youtube_live_url: 'https://www.youtube.com/embed/live_stream?channel=UCArputham', youtube_channel_id: '', category: 'Devotional', is_live: false, language: 'Tamil', thumbnail_url: '' },
];

const CAT_EMOJIS: Record<string, string> = { News: '📰', Education: '📚', Agriculture: '🌾', Devotional: '🙏', Tech: '💻', Entertainment: '🎭', All: '📺' };
const CAT_COLORS: Record<string, string> = {
  News: 'bg-red-500/20 border-red-500 text-white',
  Education: 'bg-blue-500/20 border-blue-500 text-white',
  Agriculture: 'bg-emerald-500/20 border-emerald-500 text-white',
  Devotional: 'bg-orange-500/20 border-orange-500 text-white',
  Tech: 'bg-purple-500/20 border-purple-500 text-white',
  Entertainment: 'bg-pink-500/20 border-pink-500 text-white',
};

export default function TvOPage() {
  const supabase = createClient();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState('All');
  const [active, setActive] = useState<Channel | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newCh, setNewCh] = useState({ name: '', youtube_live_url: '', category: 'News', language: 'Tamil' });

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('tv_channels').select('*').order('is_live', { ascending: false });
    if (data && data.length > 0) {
      setChannels(data);
      setActive(data[0]);
    } else {
      const { data: seeded } = await supabase.from('tv_channels').insert(SEED_CHANNELS).select();
      if (seeded?.length) { setChannels(seeded); setActive(seeded[0]); }
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = selectedCat === 'All' ? channels : channels.filter(c => c.category === selectedCat);

  // Build proper embed URL
  const getEmbedUrl = (ch: Channel) => {
    if (!ch.youtube_live_url) return null;
    // If it's already an embed URL use it; else build from channel ID
    if (ch.youtube_live_url.includes('/embed/')) return ch.youtube_live_url + '?autoplay=1&mute=1';
    if (ch.youtube_channel_id) return `https://www.youtube.com/embed/live_stream?channel=${ch.youtube_channel_id}&autoplay=1&mute=1`;
    return null;
  };

  const handleAdd = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setAdding(true);
    await supabase.from('tv_channels').insert({ ...newCh, is_live: false });
    setShowAdd(false);
    setAdding(false);
    load();
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-red-950/80 via-slate-900 to-purple-950/80 border border-red-500/30 rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <span className="p-2.5 bg-red-500/20 text-red-300 border border-red-500/40 rounded-xl"><Tv className="w-6 h-6" /></span>
          <div>
            <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-300 via-pink-300 to-purple-300">TvO • தமிழ் டிவி & நேரலை</h1>
            <p className="text-xs text-slate-400">Dynamic channels from DB — Education, News, Agri, Devotional live streams</p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-[10px] font-bold text-red-400 border border-red-500/30 bg-red-500/10 px-2 py-1 rounded-full flex items-center gap-1 animate-pulse">
            <Radio className="h-3 w-3" />{channels.filter(c => c.is_live).length} LIVE
          </span>
          <button onClick={load} className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white"><RefreshCw className="h-4 w-4" /></button>
          <button onClick={() => setShowAdd(true)} className="px-4 py-2 rounded-xl bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 hover:bg-red-400 transition">
            <Plus className="h-4 w-4" /> Channel சேர்
          </button>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setSelectedCat(c)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1 ${selectedCat === c ? 'bg-red-500 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
            {CAT_EMOJIS[c]} {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-red-400" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Player */}
          <div className="lg:col-span-8 space-y-4">
            {active && (
              <>
                <div className="w-full aspect-video bg-black border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                  {getEmbedUrl(active) ? (
                    <iframe
                      src={getEmbedUrl(active)!}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={active.name}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-slate-950">
                      <Play className="h-16 w-16 text-red-500 opacity-50" />
                      <p className="text-sm text-slate-400">{active.name}</p>
                      <p className="text-xs text-slate-600">Live stream URL not configured</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-white">{active.name}</h2>
                    <p className="text-xs text-slate-400">{active.category} • {active.language}</p>
                  </div>
                  {active.is_live && (
                    <span className="text-[10px] font-bold text-red-400 border border-red-500/30 bg-red-500/10 px-2.5 py-1 rounded-full flex items-center gap-1 animate-pulse">
                      <Radio className="h-3 w-3" /> LIVE
                    </span>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Channel List */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">சேனல்கள் ({filtered.length})</h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filtered.map(ch => (
                <div key={ch.id} onClick={() => setActive(ch)}
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-center gap-3 ${active?.id === ch.id ? CAT_COLORS[ch.category] || 'bg-red-500/20 border-red-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'}`}>
                  <span className="text-2xl shrink-0">{CAT_EMOJIS[ch.category] || '📺'}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate">{ch.name}</p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      {ch.is_live && <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block animate-pulse" />}
                      {ch.category}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Channel Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-red-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">➕ Add TV Channel</h3>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleAdd} className="space-y-3">
              <input required placeholder="Channel Name" value={newCh.name} onChange={e => setNewCh(p => ({ ...p, name: e.target.value }))}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs" />
              <input placeholder="YouTube Live Embed URL" value={newCh.youtube_live_url} onChange={e => setNewCh(p => ({ ...p, youtube_live_url: e.target.value }))}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs" />
              <div className="grid grid-cols-2 gap-3">
                <select value={newCh.category} onChange={e => setNewCh(p => ({ ...p, category: e.target.value }))}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs">
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={newCh.language} onChange={e => setNewCh(p => ({ ...p, language: e.target.value }))}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs">
                  {['Tamil', 'English', 'Hindi'].map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">Cancel</button>
                <button type="submit" disabled={adding} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-xs font-bold disabled:opacity-60">
                  {adding ? 'Adding...' : 'Add Channel ✓'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
