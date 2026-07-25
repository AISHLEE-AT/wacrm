// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { ExternalLink, RefreshCw, Zap, Wallet, CreditCard, ArrowUpRight, ArrowDownLeft, ShieldCheck, PlusCircle, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';

export default function MoneyOPage() {
  const { user, profile } = useAuth();
  const [authQuery, setAuthQuery] = useState('');
  const [points, setPoints] = useState(profile?.points || 250);

  const supabase = createClient();

  useEffect(() => {
    async function syncSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const tokens = `?access_token=${encodeURIComponent(session.access_token)}&refresh_token=${encodeURIComponent(session.refresh_token)}#access_token=${session.access_token}&refresh_token=${session.refresh_token}&token_type=bearer`;
          setAuthQuery(tokens);
        }
      } catch (err) {
        console.error('Session sync error:', err);
      }
    }
    syncSession();
  }, []);

  const openAishleeWeb = () => {
    window.open(`https://thamizhan.vercel.app/moneyo${authQuery}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400">
            <Zap className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              MoneyO • Aishlee Wallet & Financial Rewards
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-0.5">
              FAGO Reward Points, Cashback, Earnings & Instant UPI Payouts
            </p>
          </div>
        </div>

        <button
          onClick={openAishleeWeb}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs flex items-center gap-2 shadow-xl hover:opacity-90 transition self-start md:self-auto"
        >
          Open Full Screen on Aishlee Web <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      {/* Wallet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-amber-500/20 via-orange-600/10 to-transparent border border-amber-500/30 rounded-3xl p-6 relative overflow-hidden backdrop-blur-md shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300">FAGO REWARD BALANCE</span>
            <Wallet className="w-6 h-6 text-amber-400" />
          </div>
          <div className="space-y-1">
            <h2 className="text-4xl font-black text-white">{points} PTS</h2>
            <p className="text-xs text-amber-300 font-semibold">≈ ₹{points} INR Wallet Equivalent</p>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() => {
                const text = `Hello FAGO Support, I want to redeem my ${points} reward points via UPI on MoneyO! Mobile: +91 ${profile?.phone || 'USER'}`;
                window.open(`https://api.whatsapp.com/send?phone=916381029380&text=${encodeURIComponent(text)}`, '_blank');
              }}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-lg transition flex items-center gap-2"
            >
              <ArrowUpRight className="w-4 h-4" /> Redeem via UPI
            </button>
          </div>
        </div>

        {/* Cashback Status */}
        <div className="bg-card/40 border border-white/10 rounded-3xl p-6 flex flex-col justify-between backdrop-blur-md">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">RideO & RentO Cashback</span>
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-extrabold text-emerald-400">0% Commission Guaranteed</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Earn 100% direct income on RideO bookings & RentO machinery rentals with zero platform cuts.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5 text-xs text-emerald-300 font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Verified Driver & Farmer Partner Benefits
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card/40 border border-white/10 rounded-3xl p-6 space-y-4 backdrop-blur-md flex flex-col justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Quick Financial Actions</h3>
          <div className="space-y-2">
            <button
              onClick={openAishleeWeb}
              className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs flex items-center justify-between px-4 transition"
            >
              <span>View Full Savings Ledger</span>
              <ExternalLink className="w-4 h-4 text-amber-400" />
            </button>
            <button
              onClick={() => {
                const text = `Hey! Book local rides & rentals with 0% commission on FAGO Super App: https://watscrm.vercel.app`;
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
              }}
              className="w-full py-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center justify-between px-4 transition"
            >
              <span>Refer Friends & Earn 50 Points</span>
              <PlusCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
