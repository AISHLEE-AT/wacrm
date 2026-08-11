'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Newspaper, RefreshCw, Landmark, Rss, Download, CheckCircle2, AlertCircle, Clock, Zap } from 'lucide-react';
import { fetchAllTodayNews, DailyNewsItem, MODULE_META } from '@/lib/daily-news';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';

const MODULE_FILTERS = [
  { key: 'all',     emoji: '📦', label: 'All' },
  { key: 'agro',    emoji: '🌾', label: 'AgrO' },
  { key: 'teacho',  emoji: '📚', label: 'TeachO' },
  { key: 'dealo',   emoji: '🛒', label: 'DealO' },
  { key: 'jobo',    emoji: '💼', label: 'JobO' },
  { key: 'driveo',  emoji: '🚗', label: 'DriveO' },
  { key: 'testo',   emoji: '🏥', label: 'TestO' },
  { key: 'general', emoji: '📰', label: 'General' },
];

export default function AdminDailyNewsPage() {
  const [items, setItems] = useState<DailyNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingNow, setLoadingNow] = useState(false);
  const [loadResult, setLoadResult] = useState<{ saved: number; total: number; log: string[]; message?: string } | null>(null);
  const [selectedModule, setSelectedModule] = useState('all');

  const [generatingAi, setGeneratingAi] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [publishLoading, setPublishLoading] = useState(false);

  const { profile } = useAuth();
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await fetchAllTodayNews();
    setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // ── Load News Now button ────────────────────────────────────────────────
  const handleLoadNow = async () => {
    setLoadingNow(true);
    setLoadResult(null);
    try {
      const res = await fetch('/api/load-daily-news');
      const json = await res.json();
      setLoadResult(json);
      await refresh();   // reload table after save
    } catch (e) {
      setLoadResult({ saved: 0, total: 0, log: [`❌ Error: ${e}`] });
    }
    setLoadingNow(false);
  };

  const govtCount = items.filter(i => i.data_type !== 'rss').length;
  const rssCount  = items.filter(i => i.data_type === 'rss').length;
  const moduleCounts: Record<string, number> = {};
  items.forEach(i => { moduleCounts[i.module] = (moduleCounts[i.module] ?? 0) + 1; });

  const display = selectedModule === 'all'
    ? items
    : items.filter(i => i.module === selectedModule);

  const handleGenerateSummary = async () => {
    setGeneratingAi(true);
    try {
      const mandiItems = items.filter(i => i.data_type === 'mandi');
      if (mandiItems.length === 0) {
        alert('No mandi prices available to summarize.');
        setGeneratingAi(false);
        return;
      }
      
      const promptData = mandiItems.map(i => `${i.extra_data?.commodity} in ${i.extra_data?.district}: ₹${i.extra_data?.modal_price}`).join(', ');
      
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Today's market data: ${promptData}`,
          type: 'market_summary',
          apiKey: profile?.gemini_api_key
        })
      });
      const data = await res.json();
      if (data.result) setAiSummary(data.result);
      else alert(data.error || 'Failed to generate');
    } catch (e) {
      alert('Error generating summary');
    }
    setGeneratingAi(false);
  };

  const handlePublishSummary = async () => {
    if (!aiSummary) return;
    setPublishLoading(true);
    const supabase = createClient();
    const todayStr = new Date().toISOString().split('T')[0];
    const { error } = await supabase.from('daily_news').insert({
      module: 'agro',
      title: '🤖 AI Market Insights for Today',
      description: aiSummary,
      source_name: 'SuprO AI Analysis',
      published_date: todayStr,
      loaded_date: todayStr,
      data_type: 'ai_summary'
    });
    setPublishLoading(false);
    if (!error) {
      alert('Published successfully!');
      setAiSummary('');
      refresh();
    } else {
      alert('Failed to publish: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">📰</span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Daily News Manager</h1>
            <p className="text-sm text-slate-400">{dateStr} — Curate news for all SuprO modules</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl border border-slate-700 text-sm font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleLoadNow}
            disabled={loadingNow}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-60 shadow-lg shadow-blue-900/30"
          >
            {loadingNow
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Loading…</>
              : <><Zap className="w-4 h-4" /> Load News Now</>
            }
          </button>
        </div>
      </div>

      {/* Load result banner */}
      {loadResult && (
        <div className={`rounded-2xl border p-4 space-y-2 ${
          loadResult.saved > 0 ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-amber-500/5 border-amber-500/20'
        }`}>
          <div className="flex items-center gap-2">
            {loadResult.saved > 0
              ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              : <AlertCircle className="w-5 h-5 text-amber-400" />
            }
            <span className={`font-bold ${loadResult.saved > 0 ? 'text-emerald-300' : 'text-amber-300'}`}>
              {loadResult.saved > 0
                ? `✅ Loaded & saved ${loadResult.saved} news items to Supabase`
                : `ℹ️ ${loadResult.message ?? 'Already loaded today — refreshing display'}`
              }
            </span>
          </div>
          {loadResult.log?.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 mt-2">
              {loadResult.log.map((line, i) => (
                <span key={i} className="text-xs text-slate-400 bg-slate-900 px-2 py-1 rounded">{line}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-blue-500/20 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{loading ? '…' : items.length}</p>
          <p className="text-xs text-slate-400 mt-1">Total Items</p>
        </div>
        <div className="bg-slate-900/90 border border-indigo-500/20 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-indigo-400">{loading ? '…' : govtCount}</p>
          <p className="text-xs text-slate-400 mt-1">🏛️ Govt API</p>
        </div>
        <div className="bg-slate-900/90 border border-emerald-500/20 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{loading ? '…' : rssCount}</p>
          <p className="text-xs text-slate-400 mt-1">📡 RSS Feeds</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 flex gap-3">
        <Clock className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="text-sm space-y-1">
          <p className="font-semibold text-blue-300">Auto-trigger: 6:00 AM IST daily via Supabase Edge Function</p>
          <p className="text-slate-400 text-xs">
            Manual override: Click <strong>"Load News Now"</strong> above anytime — it fetches fresh data from
            <strong className="text-blue-300"> 9 Tamil RSS feeds</strong> (Dinamalar, BBC Tamil, OneIndia) +
            <strong className="text-indigo-300"> data.gov.in Mandi Prices</strong> (AgrO) +
            <strong className="text-indigo-300"> Consumer Affairs prices</strong> (DealO) and saves to Supabase.
            All module apps (Flutter, Web, Mobile) read from Supabase — no direct API calls from users.
          </p>
        </div>
      </div>

      {/* Module Filter Chips */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {MODULE_FILTERS.map(f => {
            const count = f.key === 'all' ? items.length : (moduleCounts[f.key] ?? 0);
            const isActive = selectedModule === f.key;
            const meta = MODULE_META[f.key];
            return (
              <button
                key={f.key}
                onClick={() => setSelectedModule(f.key)}
                style={isActive && meta ? { borderColor: meta.color + '60', color: meta.color, backgroundColor: meta.color + '15' } : {}}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  isActive ? '' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                {f.emoji} {f.label} {count > 0 && <span className="opacity-60">({count})</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* AI Summary Tool (Only for Agro) */}
      {selectedModule === 'agro' && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-emerald-400 flex items-center gap-2">
              <Zap className="w-5 h-5" /> Generate AI Market Insights (AgrO)
            </h3>
            <button
              onClick={handleGenerateSummary}
              disabled={generatingAi}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50 flex items-center gap-2"
            >
              {generatingAi ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Generate Summary'}
            </button>
          </div>
          
          {aiSummary && (
            <div className="space-y-3">
              <textarea
                value={aiSummary}
                onChange={e => setAiSummary(e.target.value)}
                className="w-full bg-slate-900 border border-emerald-500/30 rounded-xl p-3 text-sm text-slate-200 h-32 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handlePublishSummary}
                disabled={publishLoading}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50 w-full"
              >
                {publishLoading ? 'Publishing...' : 'Publish Insight to All Users'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* News list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400" />
        </div>
      ) : display.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <Newspaper className="w-12 h-12 text-slate-600 mx-auto" />
          <div>
            <p className="text-slate-300 font-semibold">No news loaded yet for today</p>
            <p className="text-slate-500 text-sm mt-1">Click <strong className="text-blue-400">Load News Now</strong> to fetch fresh news from all sources right now.</p>
          </div>
          <button
            onClick={handleLoadNow}
            disabled={loadingNow}
            className="mx-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl text-sm font-bold transition-colors"
          >
            <Zap className="w-4 h-4" /> Load News Now
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {display.map(item => {
            const isGovt = item.data_type !== 'rss';
            const meta = MODULE_META[item.module];
            return (
              <div key={item.id} className={`bg-slate-900/90 border rounded-xl p-4 flex gap-4 ${isGovt ? 'border-indigo-500/30' : 'border-slate-800'}`}>
                <div
                  className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-lg"
                  style={{ backgroundColor: (meta?.color ?? '#94a3b8') + '20' }}
                >
                  {meta?.emoji ?? '📰'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded border"
                      style={{ color: meta?.color, backgroundColor: (meta?.color ?? '#94a3b8') + '20', borderColor: (meta?.color ?? '#94a3b8') + '40' }}
                    >
                      {meta?.label ?? item.module}
                    </span>
                    {isGovt
                      ? <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/30">🏛️ Govt API</span>
                      : <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded flex items-center gap-1"><Rss className="w-2.5 h-2.5" /> RSS</span>
                    }
                  </div>
                  <p className="text-sm font-semibold text-white leading-snug line-clamp-2">{item.title}</p>
                  {item.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{item.description}</p>}
                  <p className="text-[10px] text-slate-600 mt-1">{item.source_name} · {item.loaded_date}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
