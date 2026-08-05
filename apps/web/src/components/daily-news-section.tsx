'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Newspaper, Landmark, ExternalLink, RefreshCw } from 'lucide-react';
import { fetchDailyNewsForModule, DailyNewsItem } from '@/lib/daily-news';

interface Props {
  module: string;
  accentColor?: string; // e.g. '#6366f1'
}

export function DailyNewsSection({ module, accentColor = '#10b981' }: Props) {
  const [items, setItems] = useState<DailyNewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchDailyNewsForModule(module);
    setItems(data);
    setLoading(false);
  }, [module]);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <div className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: accentColor }} />
    </div>
  );

  if (items.length === 0) return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center">
      <Newspaper className="w-10 h-10 text-slate-600 mx-auto mb-3" />
      <p className="text-slate-500 text-sm">No news yet for today.</p>
      <p className="text-slate-600 text-xs mt-1">Admin loads fresh news at 6 AM daily.</p>
      <button
        onClick={load}
        className="mt-3 text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 mx-auto transition-colors"
      >
        <RefreshCw className="w-3 h-3" /> Retry
      </button>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((item) => {
        const isGovt = item.data_type !== 'rss';
        return (
          <a
            key={item.id}
            href={item.link || '#'}
            target={item.link ? '_blank' : '_self'}
            rel="noopener noreferrer"
            className={`bg-slate-900/90 border rounded-2xl overflow-hidden flex flex-col hover:opacity-90 transition-opacity group ${isGovt ? 'border-indigo-500/30' : 'border-slate-800'}`}
          >
            {item.image_url && item.data_type === 'rss' && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.image_url} alt={item.title} className="w-full h-32 object-cover" />
            )}
            {isGovt && (
              <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border-b border-indigo-500/20">
                <Landmark className="w-3 h-3 text-indigo-400" />
                <span className="text-xs text-indigo-400 font-bold">🏛️ data.gov.in — Government Data</span>
              </div>
            )}
            <div className="p-4 flex flex-col gap-2 flex-1">
              <div className="flex items-center justify-between">
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded"
                  style={{ color: accentColor, backgroundColor: accentColor + '20' }}
                >
                  {isGovt ? '🏛️ Govt' : '📡 ' + item.source_name}
                </span>
                {item.link && <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-slate-400 transition-colors" />}
              </div>
              <h4 className="font-bold text-white text-sm leading-snug line-clamp-2">{item.title}</h4>
              {item.description && (
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{item.description}</p>
              )}
              <p className="text-[10px] text-slate-600 mt-auto">{item.published_date?.slice(0, 10)}</p>
            </div>
          </a>
        );
      })}
    </div>
  );
}
