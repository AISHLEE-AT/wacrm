'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import Link from 'next/link';
import { Store, TrendingUp, Sprout, Landmark, ExternalLink, Zap, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import MarketPriceBoard from '@/components/news/MarketPriceBoard';
import { useAuth } from '@/hooks/use-auth';

const SEEDS_PRODUCE = [
  { id: 1, name: 'ஹைப்ரிட் பொன்னி நெல் விதைகள் (CR-1009)', seller: 'தமிழ்நாடு விதை கழகம்', price: '₹65 / kg', category: 'Seeds', icon: '🌱' },
  { id: 2, name: 'இயற்கை மண்புழு உரம் 50kg (Organic Vermicompost)', seller: 'உழவன் ஆர்கானிக் பயோ', price: '₹380 / bag', category: 'Fertilizers', icon: '🪴' },
  { id: 3, name: 'பண்ணை பசுமை கொய்யா (500kg lot)', seller: 'கருப்பையா விவசாய பண்ணை', price: '₹32 / kg', category: 'Crop Sale', icon: '🥑' },
  { id: 4, name: 'வீரிய ஒட்டு நாட்டு பருத்தி விதை (Bt Cotton)', seller: 'தஞ்சை உழவர் உற்பத்தியாளர்', price: '₹950 / pkt', category: 'Seeds', icon: '🌾' },
  { id: 5, name: 'வேப்பம்பிண்ணாக்கு & இயற்கை பூச்சி விரட்டி', seller: 'காவேரி அக்ரோ டெக்', price: '₹420 / bag', category: 'Fertilizers', icon: '🌿' },
  { id: 6, name: 'நாட்டு நாட்டுக்கோழி குஞ்சுகள் (100 Nos Lot)', seller: 'அன்பு பண்ணை', price: '₹45 / piece', category: 'Livestock', icon: '🐣' },
];

export default function AgroPage() {
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl p-2.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">🌾</span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
              AgrO & Mandi <span className="text-xs bg-emerald-500/20 text-emerald-400 font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">உழவர் சந்தை</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Live Mandi Crop Prices, Organic Seeds, Fertilizers & Direct Farm Trade</p>
          </div>
        </div>

        <Link
          href="/dealo"
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-sm rounded-xl shadow-md transition self-start md:self-auto"
        >
          <ShoppingBag className="w-4 h-4" />
          DealO Trading Marketplace
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Live Mandi Market Price Board */}
      <MarketPriceBoard userDistrict={profile?.district || 'All'} />

      {/* Direct DealO CTA Card */}
      <div className="bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold text-xs rounded-full">
                🌾 LOCAL FARMER MARKETPLACE
              </span>
            </div>
            <h3 className="text-xl font-black text-white">Sell Cattle, Paddy Bags & Grains with 1-Click</h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              List sellable crops, livestock (cows & goats), and farm tools directly in your Pincode. Receive instant WhatsApp inquiries and direct UPI payments.
            </p>
          </div>

          <Link
            href="/dealo"
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-xl shadow-lg transition flex items-center gap-2 shrink-0"
          >
            <ShoppingBag className="w-4 h-4" />
            Explore & List on DealO
          </Link>
        </div>
      </div>

      {/* Seeds, Fertilizers & Farm Supplies */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
            Seeds, Organic Fertilizers & Farm Supplies
          </h3>
          <span className="text-xs text-emerald-500 font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Direct Farmer Sourced
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SEEDS_PRODUCE.map((prod) => (
            <div
              key={prod.id}
              className="bg-card border border-border hover:border-primary/50 rounded-2xl p-4 flex flex-col justify-between space-y-3 transition shadow-sm"
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl p-2 bg-muted rounded-xl">{prod.icon}</span>
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {prod.category}
                  </span>
                  <h4 className="font-bold text-foreground text-sm mt-1 leading-snug">{prod.name}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{prod.seller}</p>
                </div>
              </div>
              <div className="border-t border-border pt-3 flex items-center justify-between">
                <span className="text-base font-black text-primary">{prod.price}</span>
                <Link
                  href={`https://wa.me/919486335870?text=${encodeURIComponent(`வணக்கம், நான் SuprO AgrO-ல் "${prod.name}" (${prod.price}) வாங்க விரும்புகிறேன்.`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition shadow-sm"
                >
                  Buy Direct (வாட்ஸ்அப்)
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
