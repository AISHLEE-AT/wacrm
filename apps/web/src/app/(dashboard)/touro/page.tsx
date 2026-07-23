// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { Compass, MapPin, Calendar, Users, MessageSquare, ShieldCheck, Sun, Sparkles, Star } from 'lucide-react';

const AUSPICIOUS_DAYS = [
  { day: 'அமாவாசை (Amavasai)', date: 'July 24, 2026', significance: 'இராமேஸ்வரம் & சதுரகிரி பித்ரு தர்பணம்', icon: '🌑' },
  { day: 'கிருத்திகை (Kiruthigai)', date: 'July 28, 2026', significance: 'பழனி & திருச்செந்தூர் முருகன் சிறப்பு தரிசனம்', icon: '🔱' },
  { day: 'பிரதோஷம் (Pradosham)', date: 'August 02, 2026', significance: 'தஞ்சை பெரிய கோவில் & திருவண்ணாமலை சிவன் அபிஷேகம்', icon: '🛕' },
  { day: 'சதுர்த்தி (Chaturthi)', date: 'August 06, 2026', significance: 'பிள்ளையார்பட்டி விநாயகர் சிறப்பு வழிபாடு', icon: '🐘' },
];

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
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border border-amber-500/30 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🛕</span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              TourO - ஆன்மீக பயணம் & சுற்றுலா வாகனங்கள்
            </h1>
          </div>
          <p className="text-amber-300 text-sm max-w-2xl">
            தமிழ்நாட்டின் புகழ்பெற்ற கோவில்கள், அறுபடை வீடுகள் மற்றும் மலைவாசஸ்தலங்களுக்கு குடும்பத்துடன் பாதுகாப்பான ஆன்மீகச் சுற்றுலா.
          </p>
        </div>
      </div>

      {/* 🗓️ Auspicious Temple Days Calendar */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-md space-y-4">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <Calendar className="w-5 h-5 text-amber-400" /> 🗓️ Auspicious Temple Days Calendar (சிறப்பு ஆன்மீக நாட்கள்)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {AUSPICIOUS_DAYS.map((item, idx) => (
            <div key={idx} className="p-4 bg-muted/40 border border-border rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {item.date}
                </span>
              </div>
              <h3 className="font-bold text-sm text-foreground mt-1">{item.day}</h3>
              <p className="text-xs text-muted-foreground">{item.significance}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-400" /> Select Tour Package
          </h2>

          <div className="grid grid-cols-1 gap-3">
            {TOUR_PACKAGES.map((pkg) => {
              const isSelected = pkg.id === selectedPkgId;
              return (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPkgId(pkg.id)}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-4 ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 shadow-md'
                      : 'bg-card border-border hover:border-amber-500/30'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{pkg.icon}</span>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">{pkg.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{pkg.subtitle}</p>
                      <span className="inline-block mt-2 px-2.5 py-0.5 rounded-md bg-amber-500/15 text-amber-400 text-[10px] font-bold border border-amber-500/30">
                        {pkg.duration}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-base font-black text-amber-400 block">
                      ₹{pkg.baseRate}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      Base Fare
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Booking Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg space-y-5">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
              <span>🚩</span> Tour Booking Summary
            </h3>

            <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
              <span className="text-xs font-semibold text-muted-foreground block">Number of Passengers:</span>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setPassengers(Math.max(1, passengers - 1))}
                  className="w-10 h-10 rounded-lg bg-background border border-border text-foreground font-bold hover:bg-muted transition text-lg"
                >
                  -
                </button>
                <span className="text-xl font-black text-amber-400">{passengers} Persons</span>
                <button
                  type="button"
                  onClick={() => setPassengers(passengers + 1)}
                  className="w-10 h-10 rounded-lg bg-background border border-border text-foreground font-bold hover:bg-muted transition text-lg"
                >
                  +
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground font-semibold block">Total Package Base Fare:</span>
                <span className="text-2xl font-black text-amber-400">₹{currentPkg.baseRate}</span>
              </div>
              <span className="text-[10px] text-amber-300 font-bold bg-amber-500/20 px-2.5 py-1 rounded-md">
                Verified Drivers
              </span>
            </div>

            <button
              type="button"
              onClick={handleBookTour}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl transition"
            >
              <MessageSquare className="w-5 h-5 fill-slate-950" />
              Book Tour via WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
