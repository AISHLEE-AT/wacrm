'use client';

import React, { useState, useEffect } from 'react';
import { Newspaper, RefreshCw, Trash2, Send, Landmark, Rss, BarChart3, Filter } from 'lucide-react';
import { fetchAllTodayNews, DailyNewsItem, MODULE_META } from '@/lib/daily-news';

const MODULE_FILTERS = [
  { key: 'all',     label: 'All',       emoji: '📦' },
  { key: 'agro',    label: 'AgrO',      emoji: '🌾' },
  { key: 'teacho',  label: 'TeachO',    emoji: '📚' },
  { key: 'dealo',   label: 'DealO',     emoji: '🛒' },
  { key: 'jobo',    label: 'JobO',      emoji: '💼' },
  { key: 'driveo',  label: 'DriveO',    emoji: '🚗' },
  { key: 'testo',   label: 'TestO',     emoji: '🏥' },
  { key: 'general', label: 'General',   emoji: '📰' },
];

export default function AdminDailyNewsPage() {
  const [publishedItems, setPublishedItems] = useState<DailyNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState('all');

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  useEffect(() => {
    loadPublished();
  }, []);

  const loadPublished = async () => {
    setLoading(true);
    const items = await fetchAllTodayNews();
    setPublishedItems(items);
    setLoading(false);
  };

  const countByModule = (items: DailyNewsItem[]) => {
    const counts: Record<string, number> = {};
    items.forEach(i => { counts[i.module] = (counts[i.module] ?? 0) + 1; });
    return counts;
  };

  const counts = countByModule(publishedItems);
  const govtCount = publishedItems.filter(i => i.data_type !== 'rss').length;
  const rssCount = publishedItems.filter(i => i.data_type === 'rss').length;

  const displayItems = selectedModule === 'all'
    ? publishedItems
    : publishedItems.filter(i => i.module === selectedModule);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">📰</span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Daily News Manager</h1>
            <p className="text-sm text-slate-400">{dateStr} • Auto-loaded at 6:00 AM IST via Edge Function</p>
          </div>
        </div>
        <button
          onClick={loadPublished}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-semibold px-4 py-2 rounded-xl border border-blue-500/30 text-sm transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-blue-500/20 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{publishedItems.length}</p>
          <p className="text-xs text-slate-400 mt-1">Total Items</p>
        </div>
        <div className="bg-slate-900/90 border border-indigo-500/20 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-indigo-400">{govtCount}</p>
          <p className="text-xs text-slate-400 mt-1">🏛️ Govt API</p>
        </div>
        <div className="bg-slate-900/90 border border-emerald-500/20 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{rssCount}</p>
          <p className="text-xs text-slate-400 mt-1">📡 RSS News</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 flex gap-3">
        <Landmark className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-slate-300 space-y-1">
          <p className="font-semibold text-blue-300">Auto-trigger is active at 6:00 AM IST every day</p>
          <p className="text-slate-400 text-xs">Supabase Edge Function fetches: Dinamalar RSS (Agri/Education/Business/Jobs/Health), BBC Tamil, OneIndia Tamil, <strong>data.gov.in Mandi Prices</strong> (AgrO), <strong>Consumer Affairs commodity prices</strong> (DealO). All saved to <code className="text-blue-300 bg-slate-800 px-1 rounded">daily_news</code> table.</p>
        </div>
      </div>

      {/* Module Filter Chips */}
      {publishedItems.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {MODULE_FILTERS.map(f => {
            const count = f.key === 'all' ? publishedItems.length : (counts[f.key] ?? 0);
            const isActive = selectedModule === f.key;
            const meta = MODULE_META[f.key];
            return (
              <button
                key={f.key}
                onClick={() => setSelectedModule(f.key)}
                style={isActive && meta ? { borderColor: meta.color + '80', color: meta.color } : {}}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  isActive
                    ? 'bg-slate-800'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                {f.emoji} {f.label} {count > 0 && <span className="opacity-70">({count})</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* News List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400" />
        </div>
      ) : displayItems.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
          <Newspaper className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No news published today yet.</p>
          <p className="text-slate-600 text-sm mt-2">The Edge Function runs automatically at 6 AM IST, or check your Supabase Edge Function logs.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayItems.map((item) => {
            const isGovt = item.data_type !== 'rss';
            const meta = MODULE_META[item.module];
            return (
              <div
                key={item.id}
                className={`bg-slate-900/90 border rounded-xl p-4 flex gap-4 ${isGovt ? 'border-indigo-500/30' : 'border-slate-800'}`}
              >
                {/* Module badge */}
                <div
                  className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-lg"
                  style={{ backgroundColor: (meta?.color ?? '#94a3b8') + '20' }}
                >
                  {MODULE_META[item.module]?.emoji ?? '📰'}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded border"
                      style={{ color: meta?.color ?? '#94a3b8', backgroundColor: (meta?.color ?? '#94a3b8') + '20', borderColor: (meta?.color ?? '#94a3b8') + '40' }}
                    >
                      {meta?.label ?? item.module}
                    </span>
                    {isGovt ? (
                      <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/30">
                        🏛️ Govt API
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                        📡 RSS
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-white leading-snug line-clamp-2">{item.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{item.source_name}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
