// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { Tv, Play, Radio, Volume2, Sparkles } from 'lucide-react';

const CHANNELS = [
  {
    id: 'agri_news',
    title: 'தமிழ்நாடு உழவர் சந்தை & பசுமைத் தகவல் நேரலை',
    category: 'Agri & Mandi Live',
    viewerCount: '14.2K Live Viewers',
    videoUrl: 'https://www.youtube.com/embed/live_stream?channel=agri_tn',
  },
  {
    id: 'rideo_tips',
    title: 'RideO ஓட்டுநர் பாதுகாப்பு & அதிக வருமான வழிகாட்டி',
    category: 'Driver Partner Guide',
    viewerCount: '8.9K Viewers',
    videoUrl: 'https://www.youtube.com/embed/live_stream?channel=rideo_tn',
  },
  {
    id: 'tn_gov_jobs',
    title: 'TNPSC & அரசு வேலைவாய்ப்பு நேரடி வழிகாட்டுதல்',
    category: 'Education & Career',
    viewerCount: '22.5K Viewers',
    videoUrl: 'https://www.youtube.com/embed/live_stream?channel=tnpsc_live',
  },
];

export default function TvOPage() {
  const [activeChannel, setActiveChannel] = useState(CHANNELS[0]);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400">
              <Tv className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">
              TvO • தமிழ் நேரலை டிவி & வழிகாட்டி
            </h1>
          </div>
          <p className="text-slate-400 text-sm">
            விவசாயம், காய்கறி விலை, ஓட்டுநர் வழிகாட்டி மற்றும் கல்வி நேரலை நிகழ்ச்சிகள்.
          </p>
        </div>
      </div>

      {/* Main Video Stream Player */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="aspect-video w-full bg-black flex items-center justify-center relative">
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-purple-600/30 border border-purple-500/50 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Radio className="h-8 w-8 text-purple-300" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{activeChannel.title}</h3>
            <p className="text-purple-400 text-sm font-medium">{activeChannel.category} • {activeChannel.viewerCount}</p>
          </div>
        </div>
        <div className="p-6 bg-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-slate-800">
          <div>
            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-bold rounded-full uppercase">
              LIVE BROADCAST
            </span>
            <h2 className="text-xl font-bold text-white mt-2">{activeChannel.title}</h2>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all">
            <Volume2 className="h-5 w-5" /> Live Audio Stream
          </button>
        </div>
      </div>

      {/* Channels List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {CHANNELS.map((ch) => (
          <div
            key={ch.id}
            onClick={() => setActiveChannel(ch)}
            className={`cursor-pointer p-5 rounded-2xl border transition-all ${
              activeChannel.id === ch.id
                ? 'bg-slate-900 border-purple-500/80 shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="text-xs font-bold text-purple-400">{ch.category}</span>
            <h4 className="text-base font-bold text-white mt-1 mb-2">{ch.title}</h4>
            <span className="text-xs text-slate-400">{ch.viewerCount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
