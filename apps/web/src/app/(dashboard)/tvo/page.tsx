// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { Tv, Play, Radio, ExternalLink, Share2, Eye, Heart, Loader2, Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function TvOPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<any | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [categories, setCategories] = useState<string[]>(['All']);
  const [searchQuery, setSearchQuery] = useState('');
  const [authQuery, setAuthQuery] = useState('');

  const supabase = createClient();

  useEffect(() => {
    async function loadAishleeMediaFeeds() {
      setLoading(true);
      try {
        // 1. Sync active auth token for 1-tap full screen launch
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const tokens = `?access_token=${encodeURIComponent(session.access_token)}&refresh_token=${encodeURIComponent(session.refresh_token)}#access_token=${session.access_token}&refresh_token=${session.refresh_token}&token_type=bearer`;
          setAuthQuery(tokens);
        }

        // 2. Fetch REAL Aishlee Media Feeds directly from live Google Sheets CSV
        const feedUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR1J4fRnx1-sIDmRLvcs9aXSkiLPP_7Q90aGB6lu77VozgCSYeqwNguOw4RbZ5CshsfBEXO63gZlOMa/pub?gid=1358783801&single=true&output=csv";
        const res = await fetch(feedUrl + "&t=" + Date.now());
        const csvText = await res.text();

        // Simple CSV Parser
        const lines = csvText.split('\n').filter(line => line.trim());
        if (lines.length > 1) {
          const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
          const videoIdIdx = headers.indexOf('VideoID');
          const titleIdx = headers.indexOf('Title');
          const categoryIdx = headers.indexOf('Category');
          const thumbnailIdx = headers.indexOf('Thumbnail');

          const parsedVideos: any[] = [];
          const seenIds = new Set();

          for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
            const videoId = cols[videoIdIdx];
            const title = cols[titleIdx];
            const category = cols[categoryIdx] || 'General';
            const thumbnail = cols[thumbnailIdx];

            if (videoId && !seenIds.has(videoId)) {
              seenIds.add(videoId);
              parsedVideos.push({
                videoId,
                title: title || 'Aishlee Media Stream',
                category,
                thumbnail,
                videoUrl: `https://www.youtube.com/embed/${videoId}`
              });
            }
          }

          if (parsedVideos.length > 0) {
            setVideos(parsedVideos);
            setActiveVideo(parsedVideos[0]);
            const cats = ['All', ...Array.from(new Set(parsedVideos.map(v => v.category).filter(Boolean)))];
            setCategories(cats);
          }
        }
      } catch (err) {
        console.error('Failed to load live Aishlee YouTube feeds:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAishleeMediaFeeds();
  }, []);

  const openAishleeWeb = () => {
    window.open(`https://thamizhan.vercel.app/tvo${authQuery}`, '_blank');
  };

  const filteredVideos = videos.filter(v => {
    const matchesCat = activeCategory === 'All' || v.category === activeCategory;
    const matchesSearch = !searchQuery || v.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400">
            <Tv className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              TvO • Aishlee Live Media & YouTube Streams
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-0.5">
              Real-time trending Tamil media feeds, educational streams & curated video channels
            </p>
          </div>
        </div>

        <button
          onClick={openAishleeWeb}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center gap-2 shadow-xl hover:opacity-90 transition self-start md:self-auto"
        >
          Open Full Screen on Aishlee Web <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      {/* Category Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                activeCategory === cat
                  ? 'bg-red-600 border-red-400 text-white shadow-lg shadow-red-500/20 scale-105'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Aishlee Media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500/50"
          />
        </div>
      </div>

      {/* Main Video Player & Channels Grid */}
      {loading ? (
        <div className="w-full h-64 flex flex-col items-center justify-center space-y-3 text-red-400">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-xs font-bold">Syncing Real Aishlee Media Feeds...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Video Player */}
          {activeVideo && (
            <div className="lg:col-span-2 space-y-4">
              <div className="relative aspect-video w-full bg-black rounded-3xl overflow-hidden border border-red-500/30 shadow-2xl shadow-red-500/10">
                <iframe
                  src={activeVideo.videoUrl}
                  title={activeVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                <div className="absolute top-4 left-4 bg-red-600/90 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-md shadow">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" /> LIVE STREAM
                </div>
              </div>

              <div className="bg-card/40 border border-white/10 rounded-2xl p-5 space-y-3 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 font-bold text-xs border border-red-500/30">
                    {activeVideo.category}
                  </span>
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                    <Eye className="w-4 h-4" /> Live Aishlee Feed
                  </span>
                </div>
                <h2 className="text-xl font-black text-white">{activeVideo.title}</h2>

                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <button
                    onClick={() => window.open('https://www.youtube.com/@AishleeTechnology?sub_confirmation=1', '_blank')}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition"
                  >
                    <Heart className="w-4 h-4 fill-current" /> Subscribe Aishlee Technology
                  </button>
                  <button
                    onClick={() => {
                      const text = `📺 Watch ${activeVideo.title} on Aishlee TvO: https://watscrm.vercel.app/tvo`;
                      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                    }}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/10 transition"
                  >
                    <Share2 className="w-4 h-4" /> Share Video
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Real Channels Grid */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-red-400" /> Aishlee Live Media List ({filteredVideos.length})
            </h3>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {filteredVideos.map((ch) => (
                <div
                  key={ch.videoId}
                  onClick={() => setActiveVideo(ch)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                    activeVideo?.videoId === ch.videoId
                      ? 'bg-red-600/20 border-red-500/50 shadow-lg shadow-red-500/10'
                      : 'bg-card/40 border-white/10 hover:border-white/20 hover:bg-card/60'
                  }`}
                >
                  <div className="w-20 h-14 bg-slate-800 rounded-xl overflow-hidden shrink-0 relative border border-white/10">
                    <img
                      src={ch.thumbnail || `https://img.youtube.com/vi/${ch.videoId}/hqdefault.jpg`}
                      alt={ch.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Play className="w-4 h-4 text-white fill-current" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white line-clamp-2 leading-tight">{ch.title}</h4>
                    <span className="text-[10px] text-red-400 font-semibold mt-1 inline-block">{ch.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
