// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { 
  Share2, 
  ShoppingBag, 
  MapPin, 
  Tag, 
  CheckCircle, 
  Sparkles, 
  Send,
  Building2,
  BadgeCheck
} from 'lucide-react';

const B2B_TRADE_ITEMS = [
  {
    id: 1,
    title: 'பொன்னி அரிசி மொத்த விற்பனை (Sona Masoori / Ponni Rice Wholesale)',
    quantity: '10 Tons (10,000 kg)',
    price: '₹42 / kg',
    location: 'Thanjavur, Tamil Nadu',
    seller: 'Kaveri Delta Rice Mill',
    verified: true,
    phone: '9486335870'
  },
  {
    id: 2,
    title: 'முதல் தரம் மஞ்சள் கிழங்கு (High Curcumin Turmeric Finger)',
    quantity: '5 Tons (5,000 kg)',
    price: '₹140 / kg',
    location: 'Erode, Tamil Nadu',
    seller: 'Erode Turmeric Traders',
    verified: true,
    phone: '9123596988'
  },
  {
    id: 3,
    title: 'தேங்காய் நார் & கொப்பரை (Coir Fibre & Dry Copra Bulk)',
    quantity: '20 Tons',
    price: '₹28 / kg',
    location: 'Pollachi, Coimbatore',
    seller: 'Pollachi Coir Exports',
    verified: true,
    phone: '9876543210'
  }
];

export default function TradeOPage() {
  const [tradeItems] = useState(B2B_TRADE_ITEMS);

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white p-4 md:p-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-cyan-950/80 via-slate-900 to-purple-950/80 border border-cyan-500/30 rounded-2xl p-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              <Share2 className="w-6 h-6" />
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-300 to-purple-300">
              TradeO • மொத்த வர்த்தகம் &amp; சந்தை (B2B Commodity Hub)
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-300">
            தமிழ்நாடு மொத்த விவசாய விளைபொருட்கள், அரிசி ஆலைகள், மளிகை &amp; மூலப்பொருட்கள் B2B சந்தை.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center gap-1.5">
            <BadgeCheck className="w-4 h-4" /> 100% Verified Wholesale Sellers
          </span>
        </div>
      </div>

      {/* Trade Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tradeItems.map(item => (
          <div
            key={item.id}
            className="bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-6 space-y-4 transition shadow-md flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 flex items-center gap-1 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/30">
                  <Building2 className="w-3.5 h-3.5" /> {item.seller}
                </span>
                <BadgeCheck className="w-5 h-5 text-emerald-400" />
              </div>

              <h3 className="text-base font-bold text-white leading-snug">{item.title}</h3>

              <div className="space-y-1 text-xs text-slate-300">
                <p><strong>Quantity Available:</strong> {item.quantity}</p>
                <p className="flex items-center gap-1.5 text-slate-400"><MapPin className="w-3.5 h-3.5 text-slate-500" /> {item.location}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Wholesale Rate:</span>
                <span className="text-lg font-black text-amber-300">{item.price}</span>
              </div>

              <button
                onClick={() => {
                  const text = `👋 Hello! I am interested in buying wholesale "${item.title}" (${item.quantity}) listed on FAGO TradeO. Please send terms and quotes.`;
                  window.open(`https://api.whatsapp.com/send?phone=91${item.phone}&text=${encodeURIComponent(text)}`, '_blank');
                }}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-black font-bold text-xs flex items-center gap-1 transition shadow"
              >
                Connect Supplier →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
