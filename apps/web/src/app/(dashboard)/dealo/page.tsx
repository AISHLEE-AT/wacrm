'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { Tag, Search, ShoppingBag, Percent, MapPin, Store, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';

const DEALS_CATEGORIES = [
  { id: 'all', name: 'All Deals' },
  { id: 'grocery', name: 'Supermarket & Grocery' },
  { id: 'fashion', name: 'Fashion & Clothing' },
  { id: 'electronics', name: 'Mobiles & Gadgets' },
  { id: 'dining', name: 'Restaurants & Food' },
  { id: 'services', name: 'Local Services' },
];

const FEATURED_DEALS = [
  {
    id: 1,
    title: '50% OFF Organic Vegetables & Fruits',
    store: 'Green Valley Fresh Market',
    location: 'Main Bazaar, City Center',
    category: 'grocery',
    discount: '50% OFF',
    code: 'SUPRO50',
    validTill: 'Today 9:00 PM',
    rating: 4.8,
    image: '🛒',
    verified: true,
  },
  {
    id: 2,
    title: 'Flat ₹500 Cashback on Smartphone Repairs',
    store: 'Aishlee Mobile Care & Accessories',
    location: 'Tech Hub, North Avenue',
    category: 'electronics',
    discount: '₹500 OFF',
    code: 'REPAIR500',
    validTill: '3 days left',
    rating: 4.9,
    image: '📱',
    verified: true,
  },
  {
    id: 3,
    title: 'Buy 1 Get 1 Free Traditional Meals & Sweets',
    store: 'Annapoorna Mess & Catering',
    location: 'Station Road',
    category: 'dining',
    discount: 'BOGO',
    code: 'BOGOFOOD',
    validTill: '2 days left',
    rating: 4.7,
    image: '🍲',
    verified: true,
  },
  {
    id: 4,
    title: '30% Discount on Festival Wear Collection',
    store: 'Sri Lakshmi Silks & Readymades',
    location: 'Silk Bazaar Street',
    category: 'fashion',
    discount: '30% OFF',
    code: 'SILK30',
    validTill: 'This Weekend',
    rating: 4.9,
    image: '👗',
    verified: true,
  },
];

export default function DealoPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [claimedCode, setClaimedCode] = useState<string | null>(null);

  const filteredDeals = FEATURED_DEALS.filter((deal) => {
    const matchesCategory = activeCategory === 'all' || deal.category === activeCategory;
    const matchesSearch = deal.title.toLowerCase().includes(search.toLowerCase()) ||
                          deal.store.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">🛍️</span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                DealO <span className="text-xs bg-emerald-500/20 text-emerald-300 font-normal px-2.5 py-0.5 rounded-full border border-emerald-500/30">வியாபாரம் & சலுகைகள்</span>
              </h1>
              <p className="text-sm text-slate-400">Exclusive Local Store Discounts, Offers & Verified Merchant Coupons</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search stores or offers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {DEALS_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Deals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {filteredDeals.map((deal) => (
          <div
            key={deal.id}
            className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition-all rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <div className="text-3xl p-3 bg-slate-800/80 rounded-2xl border border-slate-700/50 flex items-center justify-center">
                  {deal.image}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/30">
                      {deal.discount}
                    </span>
                    {deal.verified && (
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Verified Merchant
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-base text-white mt-1">{deal.title}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                    <Store className="w-3 h-3 text-slate-500" /> {deal.store}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-500" /> {deal.location}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                Valid: <span className="text-slate-300 font-medium">{deal.validTill}</span>
              </div>

              <button
                onClick={() => setClaimedCode(deal.code)}
                className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold px-4 py-2 rounded-xl text-xs border border-emerald-500/30 flex items-center gap-1.5 transition-all"
              >
                <Tag className="w-3.5 h-3.5" />
                {claimedCode === deal.code ? `CODE: ${deal.code}` : 'Claim Offer'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
