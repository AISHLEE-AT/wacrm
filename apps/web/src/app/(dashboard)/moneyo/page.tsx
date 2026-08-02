// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { 
  Zap, 
  Wallet, 
  TrendingUp, 
  Calculator, 
  Send, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2,
  DollarSign,
  PieChart,
  Coins
} from 'lucide-react';

export default function MoneyOPage() {
  const [principal, setPrincipal] = useState('10000');
  const [interestRate, setInterestRate] = useState('12'); // 12% per annum
  const [tenureMonths, setTenureMonths] = useState('6');
  const [calculationType, setCalculationType] = useState('simple'); // 'simple' | 'compound'

  const principalNum = parseFloat(principal) || 0;
  const rateNum = parseFloat(interestRate) || 0;
  const monthsNum = parseFloat(tenureMonths) || 0;

  // Calculation Math
  const interestAmount = calculationType === 'simple'
    ? (principalNum * rateNum * (monthsNum / 12)) / 100
    : principalNum * (Math.pow(1 + (rateNum / 100) / 12, monthsNum)) - principalNum;

  const totalAmount = principalNum + interestAmount;
  const monthlyEmi = monthsNum > 0 ? totalAmount / monthsNum : 0;

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white p-4 md:p-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-amber-950/80 via-slate-900 to-orange-950/80 border border-amber-500/30 rounded-2xl p-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <Coins className="w-6 h-6" />
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-300 to-yellow-200">
              MoneyO • கடன் கணிப்பான் &amp; சேமிப்பு (Micro-Finance Engine)
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-300">
            நுண்கடன் வட்டி கணிப்பான், சேமிப்பு குறிக்கோள், தினசரி வரவு செலவு கணக்கு மற்றும் வாட்ஸ்அப் பணப்பரிமாற்றம்.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold text-xs flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> 0% Hidden Fee Guaranteed
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">மொத்தக் கடன் (Principal)</span>
            <Wallet className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white">₹{principalNum.toLocaleString('en-IN')}</p>
          <span className="text-[10px] text-slate-500">அசல் தொகை</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">வட்டித் தொகை (Interest)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">₹{Math.round(interestAmount).toLocaleString('en-IN')}</p>
          <span className="text-[10px] text-slate-500">{rateNum}% வட்டி விகிதம் ({monthsNum} மாதங்கள்)</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">மொத்த திருப்பிச்செலுத்தல்</span>
            <DollarSign className="w-4 h-4 text-orange-400" />
          </div>
          <p className="text-2xl font-black text-orange-400">₹{Math.round(totalAmount).toLocaleString('en-IN')}</p>
          <span className="text-[10px] text-slate-500">அசல் + வட்டி</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">மாதத் தவணை (Monthly EMI)</span>
            <PieChart className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-cyan-400">₹{Math.round(monthlyEmi).toLocaleString('en-IN')}</p>
          <span className="text-[10px] text-slate-500">மாதத்திற்கு</span>
        </div>
      </div>

      {/* Main Grid: Calculator & WhatsApp Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Calculator Form */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <Calculator className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">வட்டி &amp; தவணைக் கணிப்பான் (EMI Calculator)</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">கடன் அசல் தொகை (Principal Amount - ₹):</label>
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">ஆண்டு வட்டி (%) Rate:</label>
                <input
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">கால அளவு (மாதங்கள் - Months):</label>
                <input
                  type="number"
                  value={tenureMonths}
                  onChange={(e) => setTenureMonths(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">வட்டி கணக்கீட்டு முறை (Calculation Method):</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCalculationType('simple')}
                  className={`p-3 rounded-xl border text-xs font-bold transition ${
                    calculationType === 'simple'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  தனிவட்டி (Simple Interest)
                </button>
                <button
                  type="button"
                  onClick={() => setCalculationType('compound')}
                  className={`p-3 rounded-xl border text-xs font-bold transition ${
                    calculationType === 'compound'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  கூட்டுவட்டி (Compound Interest)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right WhatsApp Repayment Generator */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <Send className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">வாட்ஸ்அப் வசூல் நினைவூட்டல் (WhatsApp Payment Link)</h2>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            உங்கள் வாடிக்கையாளர் அல்லது கடன் வாங்கியவருக்கு மாத தவணை தொகையை வாட்ஸ்அப்பில் 1-கிளிக்கில் நினைவூட்டல் அனுப்பலாம்.
          </p>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Generated Message Preview:</span>
            <p className="text-slate-300 font-mono leading-relaxed">
              👋 வணக்கம்! உங்கள் FAGO MoneyO மாதத் தவணை தொகை ₹{Math.round(monthlyEmi).toLocaleString('en-IN')} (மாதம் {tenureMonths}). தயவுசெய்து UPI மூலம் செலுத்துங்கள். 🔒 FAGO MoneyO
            </p>
          </div>

          <button
            onClick={() => {
              const text = `👋 வணக்கம்! உங்கள் FAGO MoneyO மாதத் தவணை தொகை ₹${Math.round(monthlyEmi).toLocaleString('en-IN')} (மாதம் ${tenureMonths}). தயவுசெய்து UPI மூலம் செலுத்துங்கள்.\n\n🔒 FAGO MoneyO`;
              window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
            }}
            className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs flex items-center justify-center gap-2 transition shadow-lg"
          >
            <Send className="w-4 h-4" /> Send Repayment Reminder via WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
