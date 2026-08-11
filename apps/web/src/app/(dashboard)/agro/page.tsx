'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { Store, TrendingUp, Sprout, Landmark, Newspaper, ExternalLink, Zap, Bot, Loader2 } from 'lucide-react';
import { fetchDailyNewsForModule, DailyNewsItem, saveAiSummary } from '@/lib/daily-news';
import MarketPriceBoard from '@/components/news/MarketPriceBoard';
import { useAuth } from '@/hooks/use-auth';

const MANDI_RATES = [
  { crop: 'Paddy (Ponni)', price: '₹2,150 / Quintal', change: '+₹40', trend: 'up' },
  { crop: 'Tomato (Local)', price: '₹28 / kg', change: '-₹3', trend: 'down' },
  { crop: 'Onion (Small)', price: '₹45 / kg', change: '+₹2', trend: 'up' },
  { crop: 'Coconut (Large)', price: '₹14 / piece', change: 'Stable', trend: 'stable' },
  { crop: 'Cotton (MCU-5)', price: '₹7,400 / Quintal', change: '+₹110', trend: 'up' },
];

const SEEDS_PRODUCE = [
  { id: 1, name: 'Hybrid Paddy Seeds (CR-1009)', seller: 'Tamil Nadu Seed Corp', price: '₹65 / kg', category: 'Seeds', icon: '🌱' },
  { id: 2, name: 'Bio-Organic Vermicompost 50kg', seller: 'Uzhavan Organic Bio Tech', price: '₹380 / bag', category: 'Fertilizers', icon: '🪴' },
  { id: 3, name: 'Fresh Farm Guava (500kg lot)', seller: 'Farmer Karuppiah', price: '₹32 / kg', category: 'Crop Sale', icon: '🥑' },
];

export default function AgroPage() {
  const [newsItems, setNewsItems] = useState<DailyNewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const { profile } = useAuth(); // Import useAuth to get user's district
  const [isGenerating, setIsGenerating] = useState(false);

  const generateWeeklyNews = async () => {
    setIsGenerating(true);
    try {
      // 1. Fetch raw mandi data
      const res = await fetch('/api/load-daily-news');
      if (!res.ok) throw new Error('Failed to load mandi data');
      
      const allNews = await fetchDailyNewsForModule('agro');
      const mandiData = allNews.filter(n => n.data_type === 'mandi').slice(0, 50); // limit for prompt size
      
      const promptData = mandiData.map(n => n.description).join('\n');
      
      const aiRes = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Recent Tamil Nadu Govt Mandi Data:\n${promptData}`,
          type: 'weekly_agro_news',
        })
      });
      
      if (!aiRes.ok) throw new Error('Failed to generate AI relay');
      const { result } = await aiRes.json();
      
      // Save it as weekly_ai_news
      await saveAiSummary('agro', 'Weekly AI Agro & Market News Relay', result);
      
      // Reload news
      const updatedNews = await fetchDailyNewsForModule('agro');
      setNewsItems(updatedNews.filter(item => item.data_type !== 'mandi'));
    } catch (e) {
      console.error(e);
      alert('Failed to generate weekly news relay. Please ensure you have your Gemini API Key set in your profile.');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    fetchDailyNewsForModule('agro').then(items => {
      // Filter out mandi data from the news feed, as it's now handled by MarketPriceBoard
      setNewsItems(items.filter(item => item.data_type !== 'mandi'));
      setLoadingNews(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-6">
        <span className="text-2xl p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">🌾</span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            AgrO & Mandi <span className="text-xs bg-emerald-500/20 text-emerald-300 font-normal px-2.5 py-0.5 rounded-full border border-emerald-500/30">உழவர் சந்தை & விதைகள்</span>
          </h1>
          <p className="text-sm text-slate-400">Live Mandi Crop Prices, Organic Seeds, Fertilizers & Direct Farmer Trade</p>
        </div>
      </div>

      {/* Live Mandi Market Price Board */}
      <MarketPriceBoard userDistrict={profile?.district || 'All'} />

      {/* Seeds & Market Listings */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Seeds, Fertilizers & Crop Listings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SEEDS_PRODUCE.map((prod) => (
            <div key={prod.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 bg-slate-800 rounded-xl">{prod.icon}</span>
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{prod.category}</span>
                  <h4 className="font-bold text-white text-sm mt-1">{prod.name}</h4>
                  <p className="text-xs text-slate-400">{prod.seller}</p>
                </div>
              </div>
              <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
                <span className="text-sm font-bold text-emerald-400">{prod.price}</span>
                <button onClick={() => alert(`Inquiring about ${prod.name}`)} className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold px-3 py-1.5 rounded-lg text-xs border border-emerald-500/30">
                  Buy Direct
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── TODAY'S NEWS & WEEKLY RELAY ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Newspaper className="w-4 h-4" /> Weekly News Relay & Insights
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-full">Updated 6 AM daily</span>
            {profile?.role === 'admin' && (
              <button 
                onClick={generateWeeklyNews}
                disabled={isGenerating}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors"
              >
                {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Bot className="w-3 h-3" />}
                Generate Weekly AI Relay
              </button>
            )}
          </div>
        </div>

        {loadingNews ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400" />
          </div>
        ) : newsItems.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center">
            <Newspaper className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No news loaded for today yet.</p>
            <p className="text-slate-600 text-xs mt-1">Admin loads fresh news every morning at 6 AM.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {newsItems.map((item) => {
              const isGovt = item.data_type !== 'rss' && item.data_type !== 'ai_summary';
              const isAiSummary = item.data_type === 'ai_summary';
              
              return (
                <a
                  key={item.id}
                  href={item.link || '#'}
                  target={item.link ? '_blank' : '_self'}
                  rel="noopener noreferrer"
                  className={`bg-slate-900/90 border rounded-2xl overflow-hidden flex flex-col transition-colors group ${
                    isAiSummary || item.data_type === 'weekly_ai_news' ? 'border-purple-500/50 hover:border-purple-400' :
                    isGovt ? 'border-emerald-500/30 hover:border-emerald-500/50' : 'border-slate-800 hover:border-slate-600'
                  }`}
                >
                  {item.image_url && item.data_type === 'rss' && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image_url} alt={item.title} className="w-full h-36 object-cover" />
                  )}
                  
                  {(isAiSummary || item.data_type === 'weekly_ai_news') && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border-b border-purple-500/20">
                      <Zap className="w-3 h-3 text-purple-400" />
                      <span className="text-xs text-purple-400 font-bold">🤖 SuprO AI {item.data_type === 'weekly_ai_news' ? 'Weekly Relay' : 'Analysis'}</span>
                    </div>
                  )}

                  {isGovt && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border-b border-emerald-500/20">
                      <Landmark className="w-3 h-3 text-emerald-400" />
                      <span className="text-xs text-emerald-400 font-bold">🏛️ data.gov.in — Government Data</span>
                    </div>
                  )}
                  
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        (isAiSummary || item.data_type === 'weekly_ai_news') ? 'text-purple-400 bg-purple-500/10 border-purple-500/20' :
                        isGovt ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                      }`}>
                        {(isAiSummary || item.data_type === 'weekly_ai_news') ? '🤖 AI Insight' : isGovt ? '🏛️ Govt' : item.source_name}
                      </span>
                      {item.link && <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-emerald-400 transition-colors" />}
                    </div>
                    <h4 className="font-bold text-white text-sm leading-snug line-clamp-2">{item.title}</h4>
                    {item.description && (
                      <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{item.description}</p>
                    )}
                    <p className="text-[10px] text-slate-600 mt-auto">{item.source_name}</p>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
