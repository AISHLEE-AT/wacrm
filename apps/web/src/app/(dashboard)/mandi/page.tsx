// @ts-nocheck
'use client';

import React, { useState } from 'react';
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

      {/* TAB 1: Mandi Live Prices */}
      {activeTab === 'mandi' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MANDI_DATA.map((mandi) => (
              <div key={mandi.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs text-emerald-400 font-bold uppercase">{mandi.district} District</span>
                    <h3 className="text-lg font-bold text-white mt-1">{mandi.name}</h3>
                  </div>
                  <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                    <MapPin className="h-5 w-5" />
                  </span>
                </div>
                <div className="space-y-2 border-t border-slate-800 pt-4">
                  {mandi.commodities.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0">
                      <span className="text-slate-300 text-sm font-medium">{item.name}</span>
                      <div className="text-right">
                        <span className="text-emerald-400 font-extrabold text-sm block">{item.price}</span>
                        <span className="text-[10px] text-slate-400">{item.change} today</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Integrated ToolsO Tools & Calculators */}
      {activeTab === 'tools' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Tool 1: Agri Seed & Fertilizer Calculator */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <Calculator className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">உழவர் விதை &amp; உரம் கணிப்பான்</h3>
                <p className="text-xs text-slate-400">நிலப் பரப்பளவிற்குத் தேவையான விதை அளவைக் கணக்கிடுங்கள்.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">நிலப் பரப்பளவு (ஏக்கர்)</label>
                <input
                  type="number"
                  value={landArea}
                  onChange={(e) => {
                    setLandArea(e.target.value);
                    calculateSeedRequirements(e.target.value, cropType);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-amber-400 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">பயிர் வகை</label>
                <select
                  value={cropType}
                  onChange={(e) => {
                    setCropType(e.target.value);
                    calculateSeedRequirements(landArea, e.target.value);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-amber-400 outline-none"
                >
                  <option value="Paddy">நெல் (Paddy)</option>
                  <option value="Groundnut">நிலக்கடலை (Groundnut)</option>
                  <option value="Cotton">பருத்தி (Cotton)</option>
                  <option value="Sugarcane">கரும்பு (Sugarcane)</option>
                </select>
              </div>

              <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl">
                <span className="text-xs text-emerald-400 font-bold block uppercase">தேவையான தோராய அளவு</span>
                <span className="text-2xl font-black text-white mt-1 block">
                  {calculatedSeed} {cropType === 'Sugarcane' ? 'கரணைகள்' : 'கி.கி (Kg)'}
                </span>
              </div>
            </div>
          </div>

          {/* Tool 2: 0% Commission Savings Calculator */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">0% கமிஷன் சேமிப்புக் கணிப்பான்</h3>
                <p className="text-xs text-slate-400">AgrO நேரடி உழவர் சந்தை மூலம் நீங்கள் சேமிக்கும் தொகை.</p>
              </div>
            </div>

            <div className="p-5 bg-amber-950/30 border border-amber-500/30 rounded-2xl space-y-3">
              <div className="flex justify-between items-center text-sm text-slate-300">
                <span>மாதாந்திர உழவர் சந்தை விற்பனை:</span>
                <span className="font-bold text-white">₹25,000</span>
              </div>
              <div className="flex justify-between items-center text-sm text-slate-300">
                <span>இடைத்தரகர் கமிஷன் (15-20%):</span>
                <span className="font-bold text-red-400">-₹4,000</span>
              </div>
              <div className="border-t border-amber-500/20 pt-2 flex justify-between items-center text-base font-extrabold text-amber-300">
                <span>AgrO 0% கமிஷன் மூலம் உங்கள் நிகர லாபம்:</span>
                <span className="text-xl text-emerald-400">+₹4,000/மாதம்</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
