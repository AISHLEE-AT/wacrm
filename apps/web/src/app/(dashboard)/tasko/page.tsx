'use client';

import React from 'react';
import { Wrench, MapPin, Phone, Star, CheckCircle2 } from 'lucide-react';

const WORKERS = [
  { id: 1, name: 'P. Arumugam', skill: 'Electrician & Plumbing', rating: 4.9, location: 'City Center', status: 'Available', icon: '⚡' },
  { id: 2, name: 'K. Rajendran', skill: 'Carpenter & Furniture Repair', rating: 4.8, location: 'North Town', status: 'Available', icon: '🪚' },
  { id: 3, name: 'S. Loganathan', skill: 'AC & Refrigerator Mechanic', rating: 4.9, location: 'East Bypass', status: 'Available', icon: '❄️' },
];

export default function TaskoPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-6">
        <span className="text-2xl p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">🛠️</span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            TaskO & TradeO <span className="text-xs bg-cyan-500/20 text-cyan-300 font-normal px-2.5 py-0.5 rounded-full border border-cyan-500/30">உள்ளூர் சேவைப் பணியாளர்கள்</span>
          </h1>
          <p className="text-sm text-slate-400">Electricians, Plumbers, Mechanics & Skilled Service Technicians</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {WORKERS.map((w) => (
          <div key={w.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-3xl p-3 bg-slate-800 rounded-2xl">{w.icon}</span>
              <div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{w.status}</span>
                <h3 className="font-bold text-white text-base mt-1">{w.name}</h3>
                <p className="text-xs text-slate-400">{w.skill}</p>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" /> {w.location}</p>
                <div className="text-xs text-amber-400 mt-1">★ {w.rating}</div>
              </div>
            </div>

            <button onClick={() => alert(`Connecting with ${w.name}...`)} className="w-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-semibold py-2 rounded-xl text-xs border border-cyan-500/30 flex items-center justify-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> Call Technician
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
