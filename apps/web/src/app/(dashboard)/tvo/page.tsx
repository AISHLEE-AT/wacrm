// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { 
  Tv, 
  Play, 
  Video, 
  Sparkles, 
  ShieldCheck,
  CheckCircle,
  Radio
} from 'lucide-react';

const CHANNELS = [
  {
    id: 'tnpsc-live',
    title: 'TNPSC Group 1 & 2 நேரலை பாடங்கள் (Live Exam Masterclass)',
    category: 'Education & Exams',
    views: '14.2K Watching',
    videoUrl: 'https://www.youtube.com/embed/live_stream?channel=TNPSC',
    thumbnail: '📺'
  },
  {
    id: 'mandi-daily-news',
    title: 'தமிழ்நாடு உழவர் சந்தை தினசரி காய்கறி விலை நிலவரம் (Mandi News)',
    category: 'Agriculture & Market',
    views: '28.5K Views',
    videoUrl: 'https://www.youtube.com/embed/live_stream?channel=Mandi',
    thumbnail: '🌾'
  },
  {
    id: 'tech-career-stream',
    title: 'Web App Development & AI Coding Full Guide in Tamil',
    category: 'Tech & Career',
    views: '9.8K Views',
    videoUrl: 'https://www.youtube.com/embed/live_stream?channel=Tech',
    thumbnail: '💻'
  }
];

export default function TvOPage() {
  const [activeChannel, setActiveChannel] = useState(CHANNELS[0]);

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white p-4 md:p-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-red-950/80 via-slate-900 to-purple-950/80 border border-red-500/30 rounded-2xl p-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-red-500/20 text-red-300 border border-red-500/40">
              <Tv className="w-6 h-6" />
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-300 via-pink-300 to-purple-300">
              TvO • தமிழ் டிவி &amp; நேரலை (Educational &amp; Agri Live Video Portal)
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-300">
            போட்டித் தேர்வு நேரலை வகுப்புகள், உழவர் சந்தை விலை நிலவர செய்திகள் மற்றும் தொழில்நுட்ப வீடியோக்கள்.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 font-bold text-xs flex items-center gap-1.5 animate-pulse">
            <Radio className="w-4 h-4" /> 24/7 Live Streaming
          </span>
        </div>
      </div>

      {/* Main Grid: Player & Channel List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Player */}
        <div className="lg:col-span-8 space-y-4">
          <div className="w-full aspect-video bg-black border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative flex items-center justify-center">
            <div className="p-8 text-center space-y-3">
              <span className="text-6xl">{activeChannel.thumbnail}</span>
              <h2 className="text-xl font-bold text-white">{activeChannel.title}</h2>
              <p className="text-xs text-red-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
                <Radio className="w-4 h-4 text-red-500 animate-pulse" /> {activeChannel.views}
              </p>
            </div>
          </div>
        </div>

        {/* Channel List */}
        <div className="lg:col-span-4 space-y-4 bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Channels Directory</h3>
          <div className="space-y-2">
            {CHANNELS.map(chan => {
              const isSelected = activeChannel.id === chan.id;
              return (
                <div
                  key={chan.id}
                  onClick={() => setActiveChannel(chan)}
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-center gap-3 ${
                    isSelected
                      ? 'bg-red-500/20 border-red-500 text-white font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-2xl">{chan.thumbnail}</span>
                  <div>
                    <span className="text-xs font-bold block">{chan.title}</span>
                    <span className="text-[10px] text-slate-400">{chan.category}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
