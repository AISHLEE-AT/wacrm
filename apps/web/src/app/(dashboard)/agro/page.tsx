'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { Store, TrendingUp, Sprout, ShoppingCart, MapPin, Search } from 'lucide-react';

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
  const [search, setSearch] = useState('');

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

      {/* Live Mandi Ticker */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" /> Today's Live Mandi Market Prices (உழவர் சந்தை விலை)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {MANDI_RATES.map((item, idx) => (
            <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
              <p className="text-xs text-slate-400 font-medium">{item.crop}</p>
              <p className="text-sm font-bold text-white mt-1">{item.price}</p>
              <p className={`text-[10px] mt-0.5 ${item.trend === 'up' ? 'text-emerald-400' : item.trend === 'down' ? 'text-rose-400' : 'text-slate-400'}`}>
                {item.change}
              </p>
            </div>
          ))}
        </div>
      </div>

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
    </div>
  );
}
