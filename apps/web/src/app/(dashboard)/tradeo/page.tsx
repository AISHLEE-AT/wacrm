'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { Store, MapPin, Phone, Star, Building2, Search } from 'lucide-react';

const TRADERS = [
  { id: 1, name: 'Sri Balaji Hardware & Electricals', trader: 'V. Ramakrishnan', category: 'Hardware & Construction', location: 'Main Road, Madurai', status: 'Verified Wholesale', rating: 4.9, icon: '🏭' },
  { id: 2, name: 'Uzhavan Bio Agri Seeds & Pesticides', trader: 'K. Senthil', category: 'Agri Supplies & Seeds', location: 'Bypass Road', status: 'Verified Trader', rating: 4.8, icon: '🌾' },
  { id: 3, name: 'National Timber & Plywood Mart', trader: 'M. Ibrahim', category: 'Building Materials', location: 'Industrial Estate', status: 'Verified Wholesale', rating: 4.9, icon: '🪵' },
];

export default function TradeoPage() {
  const [search, setSearch] = useState('');

  const filtered = TRADERS.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">🏭</span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              TradeO <span className="text-xs bg-blue-500/20 text-blue-300 font-normal px-2.5 py-0.5 rounded-full border border-blue-500/30">உள்ளூர் வணிகர்கள்</span>
            </h1>
            <p className="text-sm text-slate-400">Wholesale Merchants, Raw Material Suppliers & B2B Trade Network</p>
          </div>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search traders or materials..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtered.map((t) => (
          <div key={t.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-3xl p-3 bg-slate-800 rounded-2xl">{t.icon}</span>
              <div>
                <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">{t.status}</span>
                <h3 className="font-bold text-white text-base mt-1">{t.name}</h3>
                <p className="text-xs text-slate-400">{t.trader}</p>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" /> {t.location}</p>
                <div className="text-xs text-amber-400 mt-1">★ {t.rating}</div>
              </div>
            </div>

            <button onClick={() => alert(`Contacting trader ${t.name}...`)} className="w-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-semibold py-2 rounded-xl text-xs border border-blue-500/30 flex items-center justify-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> Contact Trader
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
