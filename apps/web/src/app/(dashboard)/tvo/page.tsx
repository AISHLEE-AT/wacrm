'use client';

import React from 'react';
import { Tv, Radio, Play } from 'lucide-react';

const CHANNELS = [
  { id: 1, name: 'Thamizhan News Live', type: 'News & Current Affairs', status: 'LIVE', icon: '📺' },
  { id: 2, name: 'Uzhavan Agri TV', type: 'Agriculture & Farming Tips', status: 'LIVE', icon: '🌱' },
  { id: 3, name: 'Bhakthi Tamil Channel', type: 'Devotional Songs & Temple Live', status: 'LIVE', icon: '🪔' },
];

export default function TvoPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-6">
        <span className="text-2xl p-2.5 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20">📺</span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            TvO <span className="text-xs bg-red-500/20 text-red-300 font-normal px-2.5 py-0.5 rounded-full border border-red-500/30">தமிழ் டிவி & நேரலை</span>
          </h1>
          <p className="text-sm text-slate-400">Live Tamil Regional News, Agriculture Streams & Devotional Channels</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {CHANNELS.map((ch) => (
          <div key={ch.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-3xl">{ch.icon}</span>
              <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded animate-pulse">
                ● {ch.status}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-white text-base">{ch.name}</h3>
              <p className="text-xs text-slate-400 mt-1">{ch.type}</p>
            </div>
            <button onClick={() => alert(`Streaming ${ch.name}...`)} className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold py-2 rounded-xl text-xs border border-red-500/30 flex items-center justify-center gap-1.5">
              <Play className="w-3.5 h-3.5 fill-red-400" /> Watch Channel
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
