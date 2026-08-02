// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { 
  Compass, 
  MapPin, 
  Calendar, 
  Users, 
  Car, 
  CheckCircle, 
  Sparkles,
  Send,
  Clock,
  ShieldCheck
} from 'lucide-react';

const PILGRIMAGE_PACKAGES = [
  {
    id: 'madurai-meenakshi',
    title: 'மதுரை மீனாட்சி அம்மன் & ராமேஸ்வரம் ஆன்மீகச் சுற்றுலா',
    destination: 'Madurai & Rameswaram',
    duration: '2 Days / 1 Night',
    price: '₹3,500 / person',
    highlights: ['மீனாட்சி அம்மன் கோவில் தரிசனம்', 'ராமேஸ்வரம் அக்னி தீர்த்தம்', 'பாம்பன் பாலம்'],
    vehicle: 'Swift Dzire / Innova AC',
    thumbnail: '🛕'
  },
  {
    id: 'thanjavur-big-temple',
    title: 'தஞ்சாவூர் பெரிய கோவில் & கும்பகோணம் நவகிரகச் சுற்றுலா',
    destination: 'Thanjavur & Kumbakonam',
    duration: '3 Days / 2 Nights',
    price: '₹5,200 / person',
    highlights: ['தஞ்சை பெரிய கோவில்', '9 நவகிரக ஸ்தலங்கள் தரிசனம்', 'சுவாமிமலை'],
    vehicle: 'Tempo Traveller / Innova AC',
    thumbnail: '🏛️'
  },
  {
    id: 'palani-murugan',
    title: 'பழனி தண்டாயுதபாணி சுவாமி கோவில் சிறப்புத் தரிசனம்',
    destination: 'Palani, Dindigul',
    duration: '1 Day Trip',
    price: '₹1,800 / person',
    highlights: ['பழனி மலைக்கோயில் வின்ச் / ரோப் கார்', 'இராஜ அலங்காரம் தரிசனம்'],
    vehicle: 'Sedan / SUV Cab',
    thumbnail: '🔱'
  }
];

export default function TourOPage() {
  const [packages] = useState(PILGRIMAGE_PACKAGES);

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white p-4 md:p-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-orange-950/80 via-slate-900 to-amber-950/80 border border-orange-500/30 rounded-2xl p-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-orange-500/20 text-orange-300 border border-orange-500/40">
              <Compass className="w-6 h-6" />
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-amber-300 to-yellow-200">
              TourO • ஆன்மீகம் &amp; ஆன்மீகச் சுற்றுலா (Pilgrimage &amp; Cab Packages)
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-300">
            தமிழ்நாடு ஆன்மீகக் கோவில் தரிசனம், நவகிரக ஸ்தலங்கள் மற்றும் சுற்றுலா கார் பேக்கேஜ் முன்பதிவு.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Verified Drivers &amp; AC Cabs
          </span>
        </div>
      </div>

      {/* Package Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map(pkg => (
          <div
            key={pkg.id}
            className="bg-slate-900 border border-slate-800 hover:border-orange-500/40 rounded-2xl p-6 space-y-4 transition shadow-md flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  {pkg.thumbnail}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-orange-500/15 text-orange-300 text-[10px] font-bold border border-orange-500/30">
                  {pkg.duration}
                </span>
              </div>

              <h3 className="text-base font-bold text-white leading-snug">{pkg.title}</h3>
              <p className="text-xs font-semibold text-orange-400 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {pkg.destination}</p>

              <div className="space-y-1 pt-2 border-t border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Highlights:</span>
                <ul className="text-xs text-slate-300 space-y-1">
                  {pkg.highlights.map((h, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> {h}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-base font-black text-amber-300 block">{pkg.price}</span>
                <span className="text-[10px] text-slate-400">{pkg.vehicle}</span>
              </div>

              <button
                onClick={() => {
                  const text = `👋 Hello! I want to book the TourO Package: "${pkg.title}" (${pkg.duration}). Please send details and driver availability.`;
                  window.open(`https://api.whatsapp.com/send?phone=919486335870&text=${encodeURIComponent(text)}`, '_blank');
                }}
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-black font-bold text-xs flex items-center gap-1 transition shadow"
              >
                Book Package →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
