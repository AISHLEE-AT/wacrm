// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { Tv, Play, Radio, Volume2, Sparkles, ExternalLink, Share2, Eye, ShieldCheck, Heart } from 'lucide-react';

const CHANNELS = [
  {
    id: 'agri_news',
    title: 'தமிழ்நாடு உழவர் சந்தை & பசுமைத் தகவல் நேரலை',
    subtitle: 'Agri & Mandi Daily Prices & Farming Tech Live',
    category: 'Agri Live',
    viewerCount: '14.2K Live Viewers',
    icon: '🌾',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'தினசரி உழவர் சந்தை காய்கறி விலை நிலவரம், இயற்கை விவசாய நுட்பங்கள் மற்றும் வானிலை அறிக்கை.',
  },
  {
    id: 'rideo_tips',
    title: 'RideO ஓட்டுநர் பாதுகாப்பு & அதிக வருமான வழிகாட்டி',
    subtitle: 'Driver Safety & Earnings Optimization Stream',
    category: 'Driver Partner Guide',
    viewerCount: '8.9K Viewers',
    icon: '🚖',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'RideO ஓட்டுநர்கள் மாதம் ₹40,000+ ஈட்டுவது எப்படி? சாலை பாதுகாப்பு மற்றும் வாடிக்கையாளர் சேவை.',
  },
  {
    id: 'tn_gov_jobs',
    title: 'TNPSC & அரசு வேலைவாய்ப்பு நேரடி வழிகாட்டுதல்',
    subtitle: 'TN Government Exams & Career Preparation Live',
    category: 'Education & Career',
    viewerCount: '22.5K Viewers',
    icon: '📚',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'TNPSC குரூப் 4, குரூப் 2 தேர்வுக்கான இலவச பாடக் குறிப்புகள் மற்றும் நேரடி சந்தேகத் தீர்வு வகுப்புகள்.',
  },
];

export default function TvOPage() {
  const [activeChannel, setActiveChannel] = useState(CHANNELS[0]);

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-2xl text-purple-400">
            <Tv className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              TvO • Aishlee Live TV & Streaming
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-0.5">
              Live Channels, Agri Mandi Updates, Driver Guides & Educational Streams
            </p>
          </div>
        </div>

        <a
          href="https://thamizhan.vercel.app/tvo"
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center gap-2 shadow-xl hover:opacity-90 transition self-start md:self-auto"
        >
          Open Full Screen on Aishlee Web <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Main Video Player Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Player */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative aspect-video w-full bg-black rounded-3xl overflow-hidden border border-purple-500/30 shadow-2xl shadow-purple-500/10">
            <iframe
              src={activeChannel.videoUrl}
              title={activeChannel.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <div className="absolute top-4 left-4 bg-red-600/90 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-md shadow">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" /> LIVE NOW
            </div>
          </div>

          <div className="bg-card/40 border border-white/10 rounded-2xl p-5 space-y-3 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 font-bold text-xs border border-purple-500/30">
                {activeChannel.category}
              </span>
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <Eye className="w-4 h-4" /> {activeChannel.viewerCount}
              </span>
            </div>
            <h2 className="text-xl font-black text-white">{activeChannel.title}</h2>
            <p className="text-xs text-slate-400 leading-relaxed">{activeChannel.description}</p>

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <button className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 font-bold text-xs flex items-center gap-1.5 hover:bg-red-500/20 transition">
                <Heart className="w-4 h-4 fill-current" /> Subscribe Channel
              </button>
              <button
                onClick={() => {
                  const text = `📺 Watch TvO Live Stream on FAGO: ${activeChannel.title} - https://watscrm.vercel.app/tvo`;
                  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow transition"
              >
                <Share2 className="w-4 h-4" /> Share Stream
              </button>
            </div>
          </div>
        </div>

        {/* Channels List */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-purple-400" /> Featured Live Channels
          </h3>

          <div className="space-y-3">
            {CHANNELS.map((ch) => (
              <div
                key={ch.id}
                onClick={() => setActiveChannel(ch)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${
                  activeChannel.id === ch.id
                    ? 'bg-purple-600/20 border-purple-500/50 shadow-lg shadow-purple-500/10'
                    : 'bg-card/40 border-white/10 hover:border-white/20 hover:bg-card/60'
                }`}
              >
                <span className="text-3xl">{ch.icon}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">{ch.title}</h4>
                  <p className="text-xs text-slate-400 truncate">{ch.subtitle}</p>
                  <span className="text-[10px] text-emerald-400 font-semibold">{ch.viewerCount}</span>
                </div>
                {activeChannel.id === ch.id && (
                  <Play className="w-4 h-4 text-purple-400 fill-current shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
