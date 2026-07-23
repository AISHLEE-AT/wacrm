// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { ShoppingBag, Truck, TrendingUp, TrendingDown, Minus, MapPin, MessageSquare, ShieldCheck } from 'lucide-react';

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
      { name: 'வாழை இலை (Plantain Leaf)', price: '₹3.50 / piece', trend: 'stable', change: '0' },
    ],
  },
  {
    id: 'trichy',
    name: 'திருச்சி காந்தி மார்க்கெட் (Trichy Gandhi Market)',
    district: 'Tiruchirappalli',
    commodities: [
      { name: 'நெல் (Paddy - Ponni)', price: '₹1,420 / 60kg bag', trend: 'up', change: '+₹30' },
      { name: 'வாழைப்பழம் (Poovan Banana)', price: '₹350 / comb', trend: 'stable', change: '0' },
      { name: 'வெங்காயம் (Big Onion)', price: '₹30 / kg', trend: 'down', change: '-₹2' },
    ],
  },
];

export default function MandiWebDashboard() {
  const [selectedMandiId, setSelectedMandiId] = useState('oddanchatram');
  const currentMandi = MANDI_DATA.find((m) => m.id === selectedMandiId) || MANDI_DATA[0];

  const handleBookMandiTransport = () => {
    const message =
      `🚛 *UZHAVAR SANDHAI & MANDI TRANSPORT BOOKING* 🚛\n\n` +
      `📌 *Target Mandi Market*: ${currentMandi.name}\n` +
      `📦 *Requirement*: Agricultural Goods Transport (Tata Ace / Bolero Pickup)\n` +
      `📍 *Farm Pickup*: Dispatch nearest empty mini-van to my farm location.\n\n` +
      `👉 Please confirm pickup time & estimated freight fare!`;

    window.open(`https://api.whatsapp.com/send?phone=916381029380&text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="flex flex-col space-y-6 max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 border border-emerald-500/30 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🥬</span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              உழவர் சந்தை & காய்கறி விலை (Mandi Tracker)
            </h1>
          </div>
          <p className="text-emerald-300 text-sm max-w-2xl">
            தமிழ்நாட்டின் முன்னணி காய்கறி மற்றும் விவசாய விளைபொருட்கள் சந்தைகளின் அன்றாட மொத்த விலை விவரங்கள் ($0 API Cost Direct Transport Booking).
          </p>
        </div>

        <button
          type="button"
          onClick={handleBookMandiTransport}
          className="px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition shrink-0"
        >
          <Truck className="w-4 h-4" /> Book Produce Transport to Mandi
        </button>
      </div>

      {/* Mandi Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {MANDI_DATA.map((m) => {
          const isSelected = m.id === selectedMandiId;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelectedMandiId(m.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                isSelected
                  ? 'bg-emerald-500 text-black border-emerald-400 shadow-md'
                  : 'bg-card border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {m.district}: {m.id.toUpperCase()}
            </button>
          );
        })}
      </div>

      {/* Selected Mandi Prices Grid */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-md space-y-4">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-500" /> {currentMandi.name}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentMandi.commodities.map((item, idx) => {
            const isUp = item.trend === 'up';
            return (
              <div
                key={idx}
                className="p-4 rounded-xl bg-muted/40 border border-border flex items-center justify-between"
              >
                <div>
                  <h3 className="text-sm font-bold text-foreground">{item.name}</h3>
                  <span className="text-xs text-emerald-400 font-black block mt-0.5">{item.price}</span>
                </div>

                <div className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 ${
                  isUp ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-muted text-muted-foreground'
                }`}>
                  {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                  {item.change}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
