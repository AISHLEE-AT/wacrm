// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { Wrench, Calculator, Zap, Sparkles, Compass, ShieldCheck } from 'lucide-react';

export default function ToolsOPage() {
  const [landArea, setLandArea] = useState('1');
  const [cropType, setCropType] = useState('Paddy');
  const [calculatedSeed, setCalculatedSeed] = useState(25); // kg

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
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <Wrench className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400">
              ToolsO • தமிழ் வணிகக் கருவிகள் &amp; கணிப்பான்
            </h1>
          </div>
          <p className="text-slate-400 text-sm">
            விவசாய விதை/உரம் கணக்கிடுவான், 0% கமிஷன் சேமிப்புக் கணிப்பான் &amp; AI கருவிகள்.
          </p>
        </div>
      </div>

      {/* Grid of Tools */}
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
              <p className="text-xs text-slate-400">RideO &amp; DealO மூலம் நீங்கள் சேமிக்கும் இடைத்தரகர் கமிஷன் தொகை.</p>
            </div>
          </div>

          <div className="p-5 bg-amber-950/30 border border-amber-500/30 rounded-2xl space-y-3">
            <div className="flex justify-between items-center text-sm text-slate-300">
              <span>மாதாந்திர சராசரி சவாரி/விற்பனை:</span>
              <span className="font-bold text-white">₹15,000</span>
            </div>
            <div className="flex justify-between items-center text-sm text-slate-300">
              <span>இதர செயலிகளின் கமிஷன் (25-30%):</span>
              <span className="font-bold text-red-400">-₹4,500</span>
            </div>
            <div className="border-t border-amber-500/20 pt-2 flex justify-between items-center text-base font-extrabold text-amber-300">
              <span>FAGO 0% கமிஷன் மூலம் உங்கள் சேமிப்பு:</span>
              <span className="text-xl text-emerald-400">+₹4,500/மாதம்</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
