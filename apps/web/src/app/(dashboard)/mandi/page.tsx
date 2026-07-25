// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Store, ShoppingBag, Truck, TrendingUp, TrendingDown, Minus, MapPin, Calculator, Wrench, Zap, CheckCircle2, ShieldCheck, ArrowUpRight, BarChart3, LineChart, Sparkles } from 'lucide-react';
import Link from 'next/link';

const MANDI_DATA = [
  {
    id: 'oddanchatram',
    name: 'ஒட்டன்சத்திரம் காய்கறி சந்தை (Oddanchatram Wholesale Mandi)',
    district: 'Dindigul',
    commodities: [
      { name: 'தக்காளி (Tomato)', price: '₹24 / kg', trend: 'up', change: '+₹2' },
      { name: 'சின்ன வெங்காயம் (Small Onion)', price: '₹48 / kg', trend: 'stable', change: '0' },
      { name: 'முருங்கைக்காய் (Drumstick)', price: '₹65 / kg', trend: 'up', change: '+₹5' },
      { name: 'பச்சை மிளகாய் (Green Chilli)', price: '₹32 / kg', trend: 'down', change: '-₹3' },
      { name: 'கத்தரிக்காய் (Brinjal)', price: '₹28 / kg', trend: 'stable', change: '0' },
    ],
  },
  {
    id: 'coimbatore',
    name: 'கோயம்புத்தூர் எம்.ஜி.ஆர் சந்தை (Coimbatore MGR Market)',
    district: 'Coimbatore',
    commodities: [
      { name: 'தக்காளி (Tomato)', price: '₹26 / kg', trend: 'up', change: '+₹3' },
      { name: 'தேங்காய் (Coconut)', price: '₹18 / nut', trend: 'up', change: '+₹1' },
      { name: 'உருளைக்கிழங்கு (Potato)', price: '₹35 / kg', trend: 'stable', change: '0' },
      { name: 'கேரட் (Carrot)', price: '₹42 / kg', trend: 'down', change: '-₹2' },
    ],
  },
  {
    id: 'madurai',
    name: 'மதுரை பரவை & சென்ட்ரல் சந்தை (Madurai Central Market)',
    district: 'Madurai',
    commodities: [
      { name: 'சின்ன வெங்காயம் (Small Onion)', price: '₹52 / kg', trend: 'up', change: '+₹4' },
      { name: 'மல்லிகை பூ (Jasmine Flower)', price: '₹450 / kg', trend: 'up', change: '+₹50' },
      { name: 'தக்காளி (Tomato)', price: '₹25 / kg', trend: 'stable', change: '0' },
    ],
  },
];

export default function AgrOPage() {
  const [activeTab, setActiveTab] = useState('mandi'); // 'mandi' | 'tools' | 'analytics'
  const [landArea, setLandArea] = useState('1');
  const [cropType, setCropType] = useState('Paddy');
  const [calculatedSeed, setCalculatedSeed] = useState(25);
  const [dbMasterItems, setDbMasterItems] = useState<any[]>([]);

  const supabase = createClient();

  useEffect(() => {
    async function fetchMasterData() {
      try {
        const { data, error } = await supabase
          .from('unified_master_data')
          .select('*')
          .eq('item_type', 'MANDI_PRICE');

        if (!error && data && data.length > 0) {
          setDbMasterItems(data);
        }
      } catch (e) {
        console.error('Mandi fetch error:', e);
      }
    }
    fetchMasterData();
  }, []);

  const calculateSeedRequirements = (acres, crop) => {
    const acresNum = parseFloat(acres) || 0;
    let ratePerAcre = 25;
    if (crop === 'Groundnut') ratePerAcre = 50;
    if (crop === 'Cotton') ratePerAcre = 2.5;
    if (crop === 'Sugarcane') ratePerAcre = 3000;
    setCalculatedSeed(acresNum * ratePerAcre);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
              <Store className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-amber-300 to-cyan-400">
              AgrO • உழவர் சந்தை, விதைகள் &amp; கருவிகள்
            </h1>
          </div>
          <p className="text-slate-400 text-sm">
            தமிழ்நாடு நேரடி உழவர் சந்தை தினசரி காய்கறி விலைகள், விதை &amp; உரம் கணிப்பான் மற்றும் விவசாயக் கருவிகள்.
          </p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('mandi')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'mandi'
              ? 'bg-emerald-500 text-black shadow-lg'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Store className="h-4 w-4" /> 🌾 நேரடி சந்தை விலைகள் (Mandi Rates)
        </button>
        <button
          onClick={() => setActiveTab('tools')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'tools'
              ? 'bg-amber-400 text-black shadow-lg'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Wrench className="h-4 w-4" /> 🛠️ ToolsO விவசாயக் கருவிகள் &amp; கணிப்பான்
        </button>
      </div>

      {/* Live Supabase Mandi Data Feed */}
      {dbMasterItems.length > 0 && (
        <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
            <Sparkles className="h-4 w-4" /> 🌟 நேரடி Supabase தரவுத்தள சந்தை நிலவரம் (Live DB Feed)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dbMasterItems.map((item) => (
              <div key={item.id} className="p-4 bg-slate-900/80 border border-emerald-500/20 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  {item.category || 'Mandi Price'}
                </span>
                <h4 className="text-sm font-bold text-white mt-1">{item.title_name}</h4>
                <p className="text-xs text-slate-300">{item.description_purpose}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mandi Rates View */}
      {activeTab === 'mandi' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MANDI_DATA.map((mandi) => (
            <div
              key={mandi.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-emerald-500/40 transition"
            >
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">{mandi.name}</h3>
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 mt-1">
                    <MapPin className="h-3.5 w-3.5" /> {mandi.district} District
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {mandi.commodities.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800/80"
                  >
                    <span className="text-xs font-bold text-slate-200">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-amber-300">{item.price}</span>
                      {item.trend === 'up' && <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />}
                      {item.trend === 'down' && <TrendingDown className="h-3.5 w-3.5 text-rose-400" />}
                      {item.trend === 'stable' && <Minus className="h-3.5 w-3.5 text-slate-500" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Seed Calculator & Tools View */}
      {activeTab === 'tools' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 max-w-2xl">
          <div className="flex items-center gap-3">
            <Calculator className="h-6 w-6 text-amber-400" />
            <div>
              <h2 className="text-lg font-bold text-white">விதை &amp; உரம் அளவு கணிப்பான் (Seed Calculator)</h2>
              <p className="text-xs text-slate-400">உங்கள் நிலத்தின் பரப்பளவுக்கு தேவையான விதைகள் கணக்கிடவும்</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">நிலப்பரப்பு (Acres / ஏக்கர்):</label>
              <input
                type="number"
                value={landArea}
                onChange={(e) => {
                  setLandArea(e.target.value);
                  calculateSeedRequirements(e.target.value, cropType);
                }}
                className="w-full h-12 px-4 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">பயிர் வகை (Crop Category):</label>
              <select
                value={cropType}
                onChange={(e) => {
                  setCropType(e.target.value);
                  calculateSeedRequirements(landArea, e.target.value);
                }}
                className="w-full h-12 px-4 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold focus:outline-none focus:border-amber-400"
              >
                <option value="Paddy">நெல் (Paddy - 25 kg/acre)</option>
                <option value="Groundnut">நிலக்கடலை (Groundnut - 50 kg/acre)</option>
                <option value="Cotton">பருத்தி (Cotton - 2.5 kg/acre)</option>
                <option value="Sugarcane">கரும்பு (Sugarcane - 3000 setts/acre)</option>
              </select>
            </div>

            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-1">
              <span className="text-xs text-slate-300 font-semibold">தேவையான விதைகள் அளவு (Estimated Seed Required):</span>
              <p className="text-2xl font-black text-emerald-400">
                {calculatedSeed} {cropType === 'Sugarcane' ? 'setts' : 'kg'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
