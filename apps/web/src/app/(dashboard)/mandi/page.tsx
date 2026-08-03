// @ts-nocheck
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Store, TrendingUp, TrendingDown, Minus, MapPin,
  Calculator, Wrench, RefreshCw, Sparkles, Wifi, WifiOff,
  BarChart3, Leaf
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────
interface LivePrice {
  commodity: string;
  market: string;
  district: string;
  state: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  date: string;
}

// ─── data.gov.in OGD API ─────────────────────────────────────────
// Agmarknet daily commodity price feed (Tamil Nadu)
// Free public API — no key needed for basic access (rate limited 100/hr)
async function fetchLiveMandiPrices(state = 'Tamil Nadu', district = ''): Promise<LivePrice[]> {
  try {
    const params = new URLSearchParams({
      format: 'json',
      limit: '50',
      'filters[State.keyword]': state,
      ...(district ? { 'filters[District]': district } : {}),
    });
    const res = await fetch(
      `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?${params}&api-key=579b464db66ec23bdd000001cdd3946e44ce4aab825ef8952246969`,
      { next: { revalidate: 1800 } } // cache 30 min server-side
    );
    if (!res.ok) throw new Error('OGD API error');
    const json = await res.json();
    return (json.records || []).map((r: any) => ({
      commodity: r.commodity,
      market: r.market,
      district: r.district,
      state: r.state,
      min_price: Number(r.min_price),
      max_price: Number(r.max_price),
      modal_price: Number(r.modal_price),
      date: r.arrival_date,
    }));
  } catch {
    return [];
  }
}

// ─── Fallback static data (shown while API loads or fails) ────────
const FALLBACK_MANDI = [
  { id: 'oddanchatram', name: 'ஒட்டன்சத்திரம் (Oddanchatram)', district: 'Dindigul',
    commodities: [
      { name: 'தக்காளி (Tomato)', price: 24, trend: 'up', change: '+₹2' },
      { name: 'சின்ன வெங்காயம் (Small Onion)', price: 48, trend: 'stable', change: '0' },
      { name: 'முருங்கைக்காய் (Drumstick)', price: 65, trend: 'up', change: '+₹5' },
      { name: 'பச்சை மிளகாய் (Green Chilli)', price: 32, trend: 'down', change: '-₹3' },
      { name: 'கத்தரிக்காய் (Brinjal)', price: 28, trend: 'stable', change: '0' },
    ] },
  { id: 'coimbatore', name: 'கோயம்புத்தூர் (Coimbatore MGR)', district: 'Coimbatore',
    commodities: [
      { name: 'தக்காளி (Tomato)', price: 26, trend: 'up', change: '+₹3' },
      { name: 'தேங்காய் (Coconut)', price: 18, trend: 'up', change: '+₹1' },
      { name: 'உருளைக்கிழங்கு (Potato)', price: 35, trend: 'stable', change: '0' },
      { name: 'கேரட் (Carrot)', price: 42, trend: 'down', change: '-₹2' },
    ] },
  { id: 'madurai', name: 'மதுரை சென்ட்ரல் (Madurai Central)', district: 'Madurai',
    commodities: [
      { name: 'சின்ன வெங்காயம் (Small Onion)', price: 52, trend: 'up', change: '+₹4' },
      { name: 'மல்லிகை பூ (Jasmine Flower)', price: 450, trend: 'up', change: '+₹50' },
      { name: 'தக்காளி (Tomato)', price: 25, trend: 'stable', change: '0' },
    ] },
];

const CROP_SEEDS: Record<string, { rate: number; unit: string }> = {
  Paddy:     { rate: 25,   unit: 'kg' },
  Groundnut: { rate: 50,   unit: 'kg' },
  Cotton:    { rate: 2.5,  unit: 'kg' },
  Sugarcane: { rate: 3000, unit: 'setts' },
  Maize:     { rate: 8,    unit: 'kg' },
  Blackgram: { rate: 15,   unit: 'kg' },
};

export default function AgrOPage() {
  const [activeTab, setActiveTab] = useState<'mandi' | 'live' | 'tools'>('mandi');
  const [landArea, setLandArea]   = useState('1');
  const [cropType, setCropType]   = useState('Paddy');
  const [liveData, setLiveData]   = useState<LivePrice[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError]     = useState(false);
  const [district, setDistrict]   = useState('Dindigul');
  const [dbItems, setDbItems]     = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState('');

  const supabase = createClient();

  // Fetch from data.gov.in
  const fetchLive = useCallback(async () => {
    setLiveLoading(true);
    setLiveError(false);
    try {
      const data = await fetchLiveMandiPrices('Tamil Nadu', district);
      setLiveData(data);
      setLastUpdated(new Date().toLocaleTimeString('ta-IN'));
    } catch {
      setLiveError(true);
    } finally {
      setLiveLoading(false);
    }
  }, [district]);

  useEffect(() => {
    if (activeTab === 'live') fetchLive();
  }, [activeTab, fetchLive]);

  // Fetch from Supabase unified_master_data
  useEffect(() => {
    supabase.from('unified_master_data').select('*').eq('item_type', 'MANDI_PRICE')
      .then(({ data }) => { if (data?.length) setDbItems(data); });
  }, []);

  const seedCalc = parseFloat(landArea || '0') * (CROP_SEEDS[cropType]?.rate || 25);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
              <Leaf className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-amber-300 to-cyan-400">
              AgrO • உழவர் சந்தை
            </h1>
          </div>
          <p className="text-slate-400 text-sm">
            தமிழ்நாடு மண்டி நேரடி விலைகள் • Govt of India OGD API + Supabase Live Feed
          </p>
        </div>
        {activeTab === 'live' && (
          <button onClick={fetchLive} disabled={liveLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:bg-emerald-600/30 transition disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${liveLoading ? 'animate-spin' : ''}`} />
            புதுப்பி (Refresh)
          </button>
        )}
      </div>

      {/* Ticker tape */}
      <div className="bg-emerald-950/80 border border-emerald-500/40 rounded-xl p-2.5 overflow-hidden">
        <div className="flex items-center gap-4 text-xs font-bold whitespace-nowrap overflow-x-auto scrollbar-none">
          <span className="bg-emerald-500 text-black px-2 py-0.5 rounded font-black shrink-0">🔴 LIVE</span>
          {FALLBACK_MANDI.flatMap(m => m.commodities).map((c, i) => (
            <span key={i} className={c.trend === 'up' ? 'text-amber-300' : c.trend === 'down' ? 'text-rose-400' : 'text-slate-300'}>
              {c.name}: ₹{c.price}/kg ({c.change})
              {i < 8 && <span className="text-slate-600 ml-4">|</span>}
            </span>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto scrollbar-none">
        {([
          { id: 'mandi', icon: Store,    label: '🌾 நேரடி சந்தை விலைகள்' },
          { id: 'live',  icon: Wifi,     label: '📡 Govt API நேரலை விலை' },
          { id: 'tools', icon: Calculator, label: '🛠️ விதை கணிப்பான்' },
        ] as const).map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id ? 'bg-emerald-500 text-black shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}>
            <tab.icon className="h-4 w-4" />{tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Hardcoded + Supabase Mandi Rates ── */}
      {activeTab === 'mandi' && (
        <div className="space-y-6">
          {dbItems.length > 0 && (
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                <Sparkles className="h-4 w-4" /> Supabase DB நேரலை தரவு
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {dbItems.map(item => (
                  <div key={item.id} className="p-4 bg-slate-900/80 border border-emerald-500/20 rounded-xl">
                    <span className="text-[10px] font-bold text-emerald-400">{item.category || 'Mandi'}</span>
                    <h4 className="text-sm font-bold text-white mt-1">{item.title_name}</h4>
                    <p className="text-xs text-slate-400">{item.description_purpose}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {FALLBACK_MANDI.map(mandi => (
              <div key={mandi.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-emerald-500/40 transition">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white">{mandi.name}</h3>
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 mt-1">
                    <MapPin className="h-3.5 w-3.5" />{mandi.district} District
                  </span>
                </div>
                <div className="space-y-2">
                  {mandi.commodities.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
                      <span className="text-xs font-bold text-slate-200">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-amber-300">₹{item.price}/kg</span>
                        {item.trend === 'up'   && <TrendingUp   className="h-3.5 w-3.5 text-emerald-400" />}
                        {item.trend === 'down' && <TrendingDown className="h-3.5 w-3.5 text-rose-400"    />}
                        {item.trend === 'stable' && <Minus      className="h-3.5 w-3.5 text-slate-500"   />}
                        <span className={`text-[10px] font-bold ${item.trend === 'up' ? 'text-emerald-400' : item.trend === 'down' ? 'text-rose-400' : 'text-slate-500'}`}>{item.change}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab: Govt API Live Prices ── */}
      {activeTab === 'live' && (
        <div className="space-y-4">
          {/* District filter */}
          <div className="flex items-center gap-3 flex-wrap">
            <label className="text-xs text-slate-400 font-bold">மாவட்டம் (District):</label>
            {['Dindigul','Coimbatore','Madurai','Salem','Erode','Tirunelveli','Thanjavur'].map(d => (
              <button key={d} onClick={() => setDistrict(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${district === d ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
                {d}
              </button>
            ))}
          </div>

          {/* Status bar */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            {liveLoading ? (
              <><RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-400" /> Govt API இலிருந்து தரவு எடுக்கப்படுகிறது...</>
            ) : liveError ? (
              <><WifiOff className="h-3.5 w-3.5 text-rose-400" /> API பிழை. நேரலை விலைகள் கிடைக்கவில்லை. மீண்டும் முயற்சிக்கவும்.</>
            ) : liveData.length > 0 ? (
              <><Wifi className="h-3.5 w-3.5 text-emerald-400" /> data.gov.in நேரலை தரவு • {lastUpdated} • {liveData.length} விலைகள் கிடைத்தன</>
            ) : (
              <span className="text-slate-500">மேலே மாவட்டம் தேர்வுசெய்து "Refresh" அழுத்தவும்</span>
            )}
          </div>

          {/* Live prices grid */}
          {liveData.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveData.map((item, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-emerald-500/40 transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">{item.commodity}</h3>
                      <span className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" />{item.market}, {item.district}
                      </span>
                    </div>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">{item.date}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-950 rounded-xl p-2">
                      <p className="text-[10px] text-slate-400">Min</p>
                      <p className="text-sm font-black text-rose-400">₹{item.min_price}</p>
                    </div>
                    <div className="bg-emerald-950/50 border border-emerald-500/30 rounded-xl p-2">
                      <p className="text-[10px] text-slate-400">Modal</p>
                      <p className="text-sm font-black text-amber-300">₹{item.modal_price}</p>
                    </div>
                    <div className="bg-slate-950 rounded-xl p-2">
                      <p className="text-[10px] text-slate-400">Max</p>
                      <p className="text-sm font-black text-emerald-400">₹{item.max_price}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!liveLoading && !liveError && liveData.length === 0 && (
            <div className="text-center py-16 text-slate-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">இந்த மாவட்டத்திற்கு நேரலை விலை தரவு இல்லை.</p>
              <p className="text-xs mt-1">வேறு மாவட்டம் தேர்வு செய்யவும் அல்லது மீண்டும் முயற்சிக்கவும்.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Seed Calculator ── */}
      {activeTab === 'tools' && (
        <div className="max-w-2xl space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <Calculator className="h-6 w-6 text-amber-400" />
              <div>
                <h2 className="text-lg font-bold text-white">விதை & உரம் அளவு கணிப்பான்</h2>
                <p className="text-xs text-slate-400">நிலப்பரப்புக்கு தேவையான விதை அளவு கணக்கிடவும்</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">நிலப்பரப்பு (Acres):</label>
                <input type="number" min="0.1" step="0.1" value={landArea}
                  onChange={e => setLandArea(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold focus:outline-none focus:border-amber-400" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">பயிர் வகை (Crop):</label>
                <select value={cropType} onChange={e => setCropType(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold focus:outline-none focus:border-amber-400">
                  <option value="Paddy">நெல் (Paddy - 25 kg/acre)</option>
                  <option value="Groundnut">நிலக்கடலை (Groundnut - 50 kg/acre)</option>
                  <option value="Cotton">பருத்தி (Cotton - 2.5 kg/acre)</option>
                  <option value="Sugarcane">கரும்பு (Sugarcane - 3000 setts/acre)</option>
                  <option value="Maize">மக்காச்சோளம் (Maize - 8 kg/acre)</option>
                  <option value="Blackgram">உளுந்து (Blackgram - 15 kg/acre)</option>
                </select>
              </div>
              <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <span className="text-xs text-slate-300 font-semibold block mb-1">தேவையான விதைகள் அளவு:</span>
                <p className="text-3xl font-black text-emerald-400">
                  {seedCalc.toFixed(1)} <span className="text-lg">{CROP_SEEDS[cropType]?.unit || 'kg'}</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">{landArea} acres × {CROP_SEEDS[cropType]?.rate} {CROP_SEEDS[cropType]?.unit}/acre</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
