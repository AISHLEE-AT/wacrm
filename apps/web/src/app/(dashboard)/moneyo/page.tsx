'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Coins, TrendingUp, Calculator, Send, Wallet, PieChart,
  DollarSign, RefreshCw, Loader2, ArrowUpRight, CheckCircle2,
  Globe, BarChart3, Sparkles, Copy
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────
interface ExchangeRate { [currency: string]: number }

// ─── UPI ID ────────────────────────────────────────────────────────
const UPI_ID = '9486335870@hdfcbank';

// ─── Currency codes ─────────────────────────────────────────────────
const CURRENCIES = ['USD', 'EUR', 'GBP', 'AED', 'SGD', 'CAD', 'AUD', 'JPY', 'MYR', 'SAR'];

// ─── Free ExchangeRate API (no key needed up to 1500/month) ─────────
const EXCHANGE_API = 'https://api.exchangerate-api.com/v4/latest/INR';

export default function MoneyOPage() {
  // ── EMI Calculator state ─────────────────────────────────────────
  const [principal, setPrincipal] = useState('10000');
  const [rate, setRate]           = useState('12');
  const [months, setMonths]       = useState('6');
  const [calcType, setCalcType]   = useState<'simple' | 'compound'>('simple');
  const [customerPhone, setCustomerPhone] = useState('');
  const [copied, setCopied]       = useState(false);
  const [waSent, setWaSent]       = useState(false);

  // ── UPI Payment Link Generator ───────────────────────────────────
  const [upiAmount, setUpiAmount] = useState('');
  const [upiNote, setUpiNote]     = useState('SuprO Service Payment');
  const [upiLink, setUpiLink]     = useState('');
  const [upiSubmitting, setUpiSubmitting] = useState(false);
  const [userPhone, setUserPhone] = useState('');
  const [upiTxnId, setUpiTxnId]  = useState('');
  const [upiSubmitted, setUpiSubmitted] = useState(false);

  // ── Currency Converter ───────────────────────────────────────────
  const [rates, setRates]       = useState<ExchangeRate>({});
  const [ratesLoading, setRatesLoading] = useState(true);
  const [fromCurr, setFromCurr] = useState('USD');
  const [toCurr, setToCurr]     = useState('INR');
  const [amount, setAmount]     = useState('100');
  const [rateErr, setRateErr]   = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  // ── Savings Goal ─────────────────────────────────────────────────
  const [goalName, setGoalName]     = useState('வீடு (House)');
  const [goalTarget, setGoalTarget] = useState('500000');
  const [goalSaved, setGoalSaved]   = useState('125000');

  // ─── EMI Calculations ─────────────────────────────────────────────
  const p = parseFloat(principal) || 0;
  const r = parseFloat(rate) || 0;
  const m = parseFloat(months) || 1;

  const interest = calcType === 'simple'
    ? (p * r * (m / 12)) / 100
    : p * (Math.pow(1 + (r / 100) / 12, m) - 1);

  const total   = p + interest;
  const emi     = total / m;
  const scorePct = p > 0 ? Math.round((interest / p) * 100) : 0;

  const waEmiMsg = `💰 *SuprO MoneyO — EMI Reminder*\n\nவணக்கம்!\nMonthly EMI: *₹${Math.round(emi).toLocaleString('en-IN')}*\nOutstanding: *₹${Math.round(total).toLocaleString('en-IN')}*\nகடன் காலம்: ${m} மாதங்கள் @ ${r}%\n\n💳 UPI: ${UPI_ID}\n\nSuprO — for Local Needs`;

  const copyEmiMsg = () => {
    navigator.clipboard.writeText(waEmiMsg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendEmiWA = () => {
    const phone = customerPhone.replace(/\D/g, '').slice(-10);
    window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(waEmiMsg)}`, '_blank');
    setWaSent(true);
  };

  // ─── UPI Link Generator ───────────────────────────────────────────
  const generateUpiLink = () => {
    const amt = parseFloat(upiAmount) || 0;
    if (!amt) return;
    const link = `upi://pay?pa=${UPI_ID}&pn=SuprO&am=${amt}&cu=INR&tn=${encodeURIComponent(upiNote)}`;
    setUpiLink(link);
  };

  const submitUtrVerification = async () => {
    if (!upiTxnId || !userPhone || !upiAmount) return;
    setUpiSubmitting(true);
    try {
      await fetch('/api/payments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ utr: upiTxnId, amount: parseFloat(upiAmount), phone: userPhone, service: 'moneyo' }),
      });
      setUpiSubmitted(true);
    } catch { /* non-fatal */ }
    setUpiSubmitting(false);
  };

  // ─── Exchange Rate Fetch ───────────────────────────────────────────
  const fetchRates = useCallback(async () => {
    setRatesLoading(true);
    setRateErr('');
    try {
      const res = await fetch(EXCHANGE_API);
      const json = await res.json();
      if (json.rates) {
        setRates(json.rates);
        setLastUpdated(new Date().toLocaleTimeString('en-IN'));
      }
    } catch {
      setRateErr('Could not fetch live rates. Showing cached data.');
      setRates({ USD: 0.01196, EUR: 0.01099, GBP: 0.00946, AED: 0.04393, SGD: 0.01606, CAD: 0.01643, AUD: 0.01862, JPY: 1.8553, MYR: 0.0554, SAR: 0.04486 });
    }
    setRatesLoading(false);
  }, []);

  useEffect(() => { fetchRates(); }, [fetchRates]);

  const convertedAmount = () => {
    const amt = parseFloat(amount) || 0;
    if (fromCurr === 'INR' && rates[toCurr]) return (amt * rates[toCurr]).toFixed(4);
    if (toCurr === 'INR' && rates[fromCurr]) return (amt / rates[fromCurr]).toFixed(2);
    if (rates[fromCurr] && rates[toCurr]) return (amt / rates[fromCurr] * rates[toCurr]).toFixed(4);
    return '—';
  };

  // ─── Savings Goal Progress ─────────────────────────────────────────
  const goalPct = parseFloat(goalTarget) > 0 ? Math.min(100, Math.round((parseFloat(goalSaved) / parseFloat(goalTarget)) * 100)) : 0;
  const goalRemaining = (parseFloat(goalTarget) || 0) - (parseFloat(goalSaved) || 0);

  const ALL_CURRENCIES = ['INR', ...CURRENCIES];

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-amber-950/80 via-slate-900 to-orange-950/80 border border-amber-500/30 rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <span className="p-2.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-xl"><Coins className="w-6 h-6" /></span>
          <div>
            <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-300 to-yellow-200">MoneyO • கடன் & நிதி கட்டுப்பாட்டு மையம்</h1>
            <p className="text-xs text-slate-400">EMI Calculator • UPI Pay Link • Live Currency Converter • Savings Goal</p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-full flex items-center gap-1">
          <Sparkles className="h-3 w-3" />0% Hidden Fee
        </span>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'அசல் (Principal)', value: `₹${p.toLocaleString('en-IN')}`, color: 'text-white', icon: <Wallet className="h-4 w-4 text-amber-400" /> },
          { label: 'வட்டி (Interest)', value: `₹${Math.round(interest).toLocaleString('en-IN')}`, color: 'text-emerald-400', icon: <TrendingUp className="h-4 w-4 text-emerald-400" /> },
          { label: 'மொத்தம் (Total)', value: `₹${Math.round(total).toLocaleString('en-IN')}`, color: 'text-orange-400', icon: <DollarSign className="h-4 w-4 text-orange-400" /> },
          { label: 'மாத EMI', value: `₹${Math.round(emi).toLocaleString('en-IN')}`, color: 'text-cyan-400', icon: <PieChart className="h-4 w-4 text-cyan-400" /> },
        ].map((s, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
            <div className="flex items-center justify-between">{s.icon}<span className="text-[10px] text-slate-400">{s.label}</span></div>
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── EMI Calculator ─────────────────────────────────────────── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2"><Calculator className="h-5 w-5 text-amber-400" /> EMI / வட்டி கணிப்பான்</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">அசல் தொகை (₹)</label>
              <input type="number" value={principal} onChange={e => setPrincipal(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-400" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">வட்டி விகிதம் (% /yr)</label>
                <input type="number" value={rate} onChange={e => setRate(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-400" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">கால அளவு (மாதங்கள்)</label>
                <input type="number" value={months} onChange={e => setMonths(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-400" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(['simple', 'compound'] as const).map(t => (
                <button key={t} onClick={() => setCalcType(t)}
                  className={`p-3 rounded-xl border text-xs font-bold transition capitalize ${calcType === t ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'}`}>
                  {t === 'simple' ? 'தனிவட்டி (Simple)' : 'கூட்டுவட்டி (Compound)'}
                </button>
              ))}
            </div>
          </div>
          {/* WhatsApp EMI Reminder */}
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-300">📲 WhatsApp EMI Reminder</h3>
            <input placeholder="Customer Phone (10 digits)" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400" />
            <div className="flex gap-2">
              <button onClick={copyEmiMsg} className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${copied ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-300 hover:text-white'}`}>
                <Copy className="h-3.5 w-3.5" />{copied ? 'Copied!' : 'Copy Message'}
              </button>
              <button onClick={sendEmiWA} disabled={!customerPhone}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-black disabled:opacity-40 transition">
                <Send className="h-3.5 w-3.5" />{waSent ? 'Sent ✓' : 'Send WhatsApp'}
              </button>
            </div>
          </div>
        </div>

        {/* ── UPI Pay Link Generator ──────────────────────────────────── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2"><Wallet className="h-5 w-5 text-emerald-400" /> UPI Payment Link Generator</h2>
          <div className="p-3 bg-slate-950 rounded-xl border border-emerald-500/20 text-xs">
            <p className="text-slate-400">UPI ID: <span className="font-black text-emerald-400">{UPI_ID}</span></p>
          </div>
          <div className="space-y-3">
            <input type="number" placeholder="Amount (₹)" value={upiAmount} onChange={e => setUpiAmount(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-400" />
            <input placeholder="Payment note (e.g. RentO Booking)" value={upiNote} onChange={e => setUpiNote(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-400" />
            <button onClick={generateUpiLink} className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs flex items-center justify-center gap-2 transition">
              <ArrowUpRight className="h-4 w-4" /> Generate UPI Pay Link
            </button>
            {upiLink && (
              <div className="space-y-2">
                <a href={upiLink} className="block w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs flex items-center justify-center gap-2 transition">
                  💳 Open UPI App & Pay ₹{upiAmount}
                </a>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-700 text-[10px] text-slate-400 break-all">{upiLink}</div>
              </div>
            )}
          </div>
          {/* UTR Verification */}
          {upiLink && !upiSubmitted && (
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <p className="text-xs font-bold text-slate-300">📩 Paid? Submit UTR for auto-verification:</p>
              <input placeholder="Your Phone (10 digits)" value={userPhone} onChange={e => setUserPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs" />
              <input placeholder="UTR / Transaction ID" value={upiTxnId} onChange={e => setUpiTxnId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs" />
              <button onClick={submitUtrVerification} disabled={upiSubmitting || !upiTxnId || !userPhone}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-40 transition">
                {upiSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Submit UTR for Auto-Verification
              </button>
            </div>
          )}
          {upiSubmitted && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center text-xs text-emerald-400 font-bold flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> UTR submitted! WhatsApp confirmation within 5 mins.
            </div>
          )}
        </div>
      </div>

      {/* Bottom grid — Currency Converter + Savings Goal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Live Currency Converter ─────────────────────────────────── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2"><Globe className="h-5 w-5 text-cyan-400" /> Live Currency Converter</h2>
            <div className="flex items-center gap-2">
              {lastUpdated && <span className="text-[10px] text-slate-500">Updated {lastUpdated}</span>}
              <button onClick={fetchRates} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"><RefreshCw className={`h-3.5 w-3.5 ${ratesLoading ? 'animate-spin' : ''}`} /></button>
            </div>
          </div>
          {rateErr && <p className="text-xs text-amber-400">{rateErr}</p>}
          <div className="space-y-3">
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-400" />
            <div className="grid grid-cols-2 gap-3">
              <select value={fromCurr} onChange={e => setFromCurr(e.target.value)}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs">
                {ALL_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={toCurr} onChange={e => setToCurr(e.target.value)}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs">
                {ALL_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="p-4 bg-gradient-to-r from-cyan-950/60 to-blue-950/60 border border-cyan-500/30 rounded-xl text-center">
              {ratesLoading ? <Loader2 className="h-6 w-6 animate-spin text-cyan-400 mx-auto" /> : (
                <>
                  <p className="text-3xl font-black text-cyan-300">{convertedAmount()}</p>
                  <p className="text-xs text-slate-400 mt-1">{amount} {fromCurr} = {convertedAmount()} {toCurr}</p>
                </>
              )}
            </div>
          </div>
          {/* Quick rates table */}
          <div className="grid grid-cols-3 gap-2">
            {['USD', 'EUR', 'GBP', 'AED', 'SGD', 'MYR'].map(cur => (
              <div key={cur} className="bg-slate-950 rounded-xl p-2 text-center border border-slate-800">
                <p className="text-[10px] text-slate-400">{cur}/INR</p>
                <p className="text-xs font-black text-white">{rates[cur] ? (1 / rates[cur]).toFixed(2) : '—'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Savings Goal Tracker ──────────────────────────────────────── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2"><BarChart3 className="h-5 w-5 text-amber-400" /> சேமிப்பு குறிக்கோள் (Savings Goal)</h2>
          <div className="space-y-3">
            <input placeholder="Goal Name (e.g. வீடு, கார்)" value={goalName} onChange={e => setGoalName(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">இலக்கு தொகை (₹)</label>
                <input type="number" value={goalTarget} onChange={e => setGoalTarget(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">சேமித்தது (₹)</label>
                <input type="number" value={goalSaved} onChange={e => setGoalSaved(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400" />
              </div>
            </div>
          </div>
          {/* Radial-style progress display */}
          <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">{goalName}</h3>
              <span className={`text-lg font-black ${goalPct >= 100 ? 'text-emerald-400' : goalPct >= 50 ? 'text-amber-400' : 'text-orange-400'}`}>{goalPct}%</span>
            </div>
            <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${goalPct >= 100 ? 'bg-emerald-500' : goalPct >= 50 ? 'bg-amber-500' : 'bg-orange-500'}`} style={{ width: `${goalPct}%` }} />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-900 rounded-xl p-2 border border-slate-800">
                <p className="text-slate-400">Saved</p>
                <p className="font-black text-emerald-400">₹{(parseFloat(goalSaved) || 0).toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-slate-900 rounded-xl p-2 border border-slate-800">
                <p className="text-slate-400">Target</p>
                <p className="font-black text-white">₹{(parseFloat(goalTarget) || 0).toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-slate-900 rounded-xl p-2 border border-slate-800">
                <p className="text-slate-400">Remaining</p>
                <p className={`font-black ${goalRemaining <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {goalRemaining <= 0 ? '🎉 Done!' : `₹${goalRemaining.toLocaleString('en-IN')}`}
                </p>
              </div>
            </div>
          </div>
          {goalPct >= 100 && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center text-xs text-emerald-400 font-bold">
              🎉 குறிக்கோளை அடைந்துவிட்டீர்கள்! Goal achieved!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
