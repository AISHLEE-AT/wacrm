'use client';

import React from 'react';
import { Compass, MapPin, Calendar, Phone, Star } from 'lucide-react';

const TOURS = [
  {
    id: 1,
    title: 'Madurai Meenakshi Amman Temple & Heritage Circuit',
    duration: '1 Day Tour',
    price: '₹750 / Person',
    rating: 4.9,
    highlights: 'Special Darshan, Heritage Guide, AC Transport',
    icon: '🛕',
  },
  {
    id: 2,
    title: 'Rameswaram & Dhanushkodi Pilgrimage Yatra',
    duration: '2 Days / 1 Night',
    price: '₹2,499 / Person',
    rating: 4.8,
    highlights: 'Agni Tirtham, Pamban Bridge, Hotel Stay included',
    icon: '🌊',
  },
  {
    id: 3,
    title: 'Kodaikanal Hill Station Retreat & Lake Tour',
    duration: '3 Days / 2 Nights',
    price: '₹4,999 / Person',
    rating: 4.9,
    highlights: 'Pillar Rocks, Coakers Walk, Sightseeing Cab',
    icon: '🏔️',
  },
];

export default function TouroPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-6">
        <span className="text-2xl p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">🛕</span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            TourO <span className="text-xs bg-purple-500/20 text-purple-300 font-normal px-2.5 py-0.5 rounded-full border border-purple-500/30">ஆன்மீகம் & சுற்றுலா</span>
          </h1>
          <p className="text-sm text-slate-400">Temple Tours, Pilgrimage Packages & Hill Station Travel Services</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TOURS.map((tour) => (
          <div key={tour.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="text-4xl mb-3">{tour.icon}</div>
              <span className="text-xs font-semibold bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded border border-purple-500/30">
                {tour.duration}
              </span>
              <h3 className="font-bold text-white text-base mt-2">{tour.title}</h3>
              <p className="text-xs text-slate-400 mt-1">{tour.highlights}</p>
              <div className="text-xs text-amber-400 mt-2">★ {tour.rating} (Verified Reviews)</div>
            </div>

            <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
              <span className="text-base font-bold text-purple-400">{tour.price}</span>
              <button onClick={() => alert(`Booking ${tour.title}`)} className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-semibold px-4 py-2 rounded-xl text-xs border border-purple-500/30">
                Book Package
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
