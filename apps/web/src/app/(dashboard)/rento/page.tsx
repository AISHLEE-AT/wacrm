'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { Tractor, Wrench, Phone, MapPin, Search, Calendar, ShieldCheck } from 'lucide-react';

const MACHINES = [
  {
    id: 1,
    name: 'Mahindra 575 DI Tractor (45 HP)',
    owner: 'Murugan Agri Rentals',
    location: 'Melur, Madurai',
    rate: '₹500 / Hour',
    attachments: 'Plough, Cultivator included',
    available: 'Available Now',
    icon: '🚜',
  },
  {
    id: 2,
    name: 'Kubota Paddy Combined Harvester',
    owner: 'Sri Crop Services',
    location: 'Vadipatti',
    rate: '₹1,800 / Hour',
    attachments: 'Wet & Dry Paddy Harvester',
    available: 'Available Tomorrow',
    icon: '🌾',
  },
  {
    id: 3,
    name: 'Rotavator & Disc Harrow Unit',
    owner: 'Kamaraj Farm Tools',
    location: 'Usilampatti',
    rate: '₹400 / Hour',
    attachments: 'Deep Soil Tillage',
    available: 'Available Now',
    icon: '⚙️',
  },
  {
    id: 4,
    name: 'Heavy Agricultural Water Pump Set (10 HP)',
    owner: 'Green Field Equipment',
    location: 'Thirumangalam',
    rate: '₹350 / Day',
    attachments: 'Diesel Driven 4-inch Hose',
    available: 'Available Now',
    icon: '💧',
  },
];

export default function RentOPage() {
  const [search, setSearch] = useState('');

  const filtered = MACHINES.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl p-2.5 bg-orange-500/10 text-orange-400 rounded-xl border border-orange-500/20">🚜</span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              RentO <span className="text-xs bg-orange-500/20 text-orange-300 font-normal px-2.5 py-0.5 rounded-full border border-orange-500/30">விவசாய கருவிகள் வாடகை</span>
            </h1>
            <p className="text-sm text-slate-400">Tractors, Harvesters, Tillage Machines & Agri Tools on Hourly Rental</p>
          </div>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tractors, equipment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900/90 border border-slate-800 hover:border-orange-500/40 transition-all rounded-2xl p-5 flex flex-col justify-between space-y-4"
          >
            <div className="flex items-start gap-4">
              <div className="text-3xl p-3 bg-slate-800/80 rounded-2xl border border-slate-700/50 flex items-center justify-center">
                {item.icon}
              </div>
              <div className="flex-1">
                <span className="text-xs font-semibold bg-orange-500/20 text-orange-400 px-2.5 py-0.5 rounded-md border border-orange-500/30">
                  {item.available}
                </span>
                <h3 className="font-semibold text-base text-white mt-1.5">{item.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{item.owner}</p>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-slate-500" /> {item.location}
                </p>
                <p className="text-xs text-slate-400 mt-1 font-medium bg-slate-950 p-2 rounded-lg border border-slate-800">
                  Includes: {item.attachments}
                </p>
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between">
              <span className="text-base font-bold text-orange-400">{item.rate}</span>
              <button
                onClick={() => alert(`Contacting ${item.owner} for ${item.name}...`)}
                className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 font-semibold px-4 py-2 rounded-xl text-xs border border-orange-500/30 flex items-center gap-1.5 transition-all"
              >
                <Phone className="w-3.5 h-3.5" /> Book Machine
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
