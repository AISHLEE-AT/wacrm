// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { Compass, MapPin, Calendar, Users, MessageSquare, ShieldCheck, Sun } from 'lucide-react';

const TOUR_PACKAGES = [
  {
    id: 'arupadaiveedu',
    title: 'அறுபடைவீடு ஆன்மீக பயணம் (Arupadaiveedu Murugan Circuit)',
    subtitle: 'Palani, Tiruchendur, Swamimalai, Thiruthani, Madurai',
    icon: '🕉️',
    baseRate: 12500,
    duration: '3 Days / 2 Nights',
    vehicle: 'Innova / Ertiga / Tempo Traveller',
  },
  {
    id: 'rameswaram',
    title: 'இராமேஸ்வரம் & கன்னியாகுமரி தரிசனம் (Rameswaram & Kanyakumari)',
    subtitle: 'Ramanathaswamy Temple, Dhanushkodi, Vivekananda Rock',
    icon: '🌊',
    baseRate: 14000,
    duration: '3 Days / 2 Nights',
    vehicle: 'AC SUV / Force Traveller',
  },
  {
    id: 'ooty_kodai',
    title: 'ஊட்டி & கொடைக்கானல் மலை சுற்றுலா (Ooty & Kodaikanal Hills)',
    subtitle: 'Botanical Garden, Pykara, Pillar Rocks, Coaker Walk',
    icon: '⛰️',
    baseRate: 16500,
    duration: '4 Days / 3 Nights',
    vehicle: 'Ghat Road Expert Driver + Force Traveller',
  },
  {
    id: 'tanjore_chola',
    title: 'தஞ்சை பெரிய கோவில் & சோழ மண்டலம் (Tanjore Big Temple Circuit)',
    subtitle: 'Brihadeeswarar Temple, Gangaikonda Cholapuram, Darasuram',
    icon: '🛕',
    baseRate: 8500,
    duration: '2 Days / 1 Night',
    vehicle: 'Sedan / SUV / Tempo',
  },
];

export default function TourOWebDashboard() {
  const [selectedPkgId, setSelectedPkgId] = useState('arupadaiveedu');
  const [passengers, setPassengers] = useState(4);
  const currentPkg = TOUR_PACKAGES.find((p) => p.id === selectedPkgId) || TOUR_PACKAGES[0];

  const handleBookTour = () => {
    const message =
      `🕉️ *TOURO TAMIL NADU TEMPLE & HILL TOUR BOOKING* 🕉️\n\n` +
      `🚩 *Selected Package*: ${currentPkg.title}\n` +
      `⏱️ *Duration*: ${currentPkg.duration}\n` +
      `🚘 *Vehicle Type*: ${currentPkg.vehicle}\n` +
      `👥 *Passengers*: ${passengers} Persons\n\n` +
      `💵 *Package Base Fare*: ₹${currentPkg.baseRate}\n\n` +
      `👉 Please confirm pickup date & driver assignment!`;

    window.open(`https://api.whatsapp.com/send?phone=916381029380&text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="flex flex-col space-y-6 max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-950 via-sky-900 to-sky-950 border border-sky-500/30 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🛕</span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              TourO - தமிழ்நாட்டின் ஆன்மீக & இயற்கை சுற்றுலா
            </h1>
          </div>
          <p className="text-sky-300 text-sm max-w-2xl">
            அறுபடைவீடு ஆன்மீக பயணம், இராமேஸ்வரம், ஊட்டி & கொடைக்கானல் சுற்றுலா வாகனங்கள் மற்றும் அனுபவமிக்க ஓட்டுநர்கள்.
          </p>
        </div>

        <button
          type="button"
          onClick={handleBookTour}
          className="px-5 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-black font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition shrink-0"
        >
          <MessageSquare className="w-4 h-4" /> Book Package via WhatsApp
        </button>
      </div>

      {/* Package List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TOUR_PACKAGES.map((pkg) => {
          const isSelected = pkg.id === selectedPkgId;
          return (
            <div
              key={pkg.id}
              onClick={() => setSelectedPkgId(pkg.id)}
              className={`p-5 rounded-2xl border transition cursor-pointer space-y-3 ${
                isSelected
                  ? 'bg-sky-500/15 border-sky-500 shadow-lg ring-1 ring-sky-500/50'
                  : 'bg-card border-border hover:border-sky-500/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl">{pkg.icon}</span>
                <span className="text-base font-black text-sky-400">₹{pkg.baseRate}</span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-foreground">{pkg.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{pkg.subtitle}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[11px] text-muted-foreground font-semibold">
                <span>⏱️ {pkg.duration}</span>
                <span>🚘 {pkg.vehicle}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
