// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { Tractor, Truck, Droplet, Zap, Wheat, MapPin, MessageSquare, Phone, Compass, ArrowRight, ShieldCheck, UserCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

const RENTO_CATEGORIES = [
  {
    id: 'tractor',
    title: 'உழவு டிராக்டர் (Tractor Ploughing)',
    subtitle: 'Kubota, Mahindra, John Deere Rotavator & Disc Plough',
    icon: '🚜',
    baseRate: 700,
    unit: 'Hour',
    popular: true,
  },
  {
    id: 'harvester',
    title: 'அறுவடை இயந்திரம் (Combine Harvester)',
    subtitle: 'Paddy, Sugarcane & Maize Automated Harvester',
    icon: '🌾',
    baseRate: 1800,
    unit: 'Hour',
    popular: true,
  },
  {
    id: 'minivan',
    title: 'சரக்கு வாகனம் (Mini-Van / Market Load)',
    subtitle: 'Tata Ace, Bolero Pickup to Uzhavar Shandhai & Mandis',
    icon: '🛺',
    baseRate: 500,
    unit: 'Trip',
    popular: true,
  },
  {
    id: 'powertiller',
    title: 'பவர் டில்லர் (Power Tiller & Sprayer)',
    subtitle: 'Small Farm Tilling & Motorized Pesticide Sprayer',
    icon: '⚡',
    baseRate: 400,
    unit: 'Day',
    popular: false,
  },
  {
    id: 'watertanker',
    title: 'தண்ணீர் டேங்கர் (Water Tanker)',
    subtitle: '5,000L / 10,000L Irrigation & Domestic Water Tanker',
    icon: '💧',
    baseRate: 800,
    unit: 'Load',
    popular: false,
  },
];

export default function RentODashboard() {
  const { user, profile } = useAuth();
  const [selectedCatId, setSelectedCatId] = useState('tractor');
  const [unitsCount, setUnitsCount] = useState(2);
  const [withOperator, setWithOperator] = useState(true); // Machine Operator Option
  const [farmerName, setFarmerName] = useState('');
  const [farmerPhone, setFarmerPhone] = useState('');
  const [villageAddress, setVillageAddress] = useState('Locating farm GPS...');
  const [farmCoords, setFarmCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (profile?.full_name) setFarmerName(profile.full_name);
    if (profile?.whatsapp || profile?.phone) setFarmerPhone(profile.whatsapp || profile.phone || '');
  }, [profile]);

  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setFarmCoords(coords);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`);
        const data = await res.json();
        if (data && data.display_name) {
          setVillageAddress(data.display_name);
        } else {
          setVillageAddress(`GPS Farm: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
        }
      } catch (err) {
        setVillageAddress(`GPS Farm: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
      }
    });
  }, []);

  const currentCatObj = RENTO_CATEGORIES.find((c) => c.id === selectedCatId) || RENTO_CATEGORIES[0];
  const operatorFee = withOperator ? 150 * unitsCount : 0;
  const totalRentAmount = (currentCatObj.baseRate * unitsCount) + operatorFee;

  const handleBookViaWhatsApp = () => {
    const name = farmerName || 'Local Farmer';
    const phone = farmerPhone || 'Not provided';
    const gpsUrl = farmCoords ? `https://www.google.com/maps/search/?api=1&query=${farmCoords.lat},${farmCoords.lng}` : '';
    
    const message =
      `🌾 *RENTO AGRICULTURAL & HEAVY MACHINERY BOOKING* 🌾\n\n` +
      `👤 *Farmer / Customer*: ${name}\n` +
      `📞 *Contact Phone*: ${phone}\n` +
      `🚜 *Machinery Category*: ${currentCatObj.title}\n` +
      `⏱️ *Requirement*: ${unitsCount} ${currentCatObj.unit}(s)\n` +
      `👨‍🌾 *Operator Mode*: ${withOperator ? 'With Operator Included (இயந்திர ஓட்டுநருடன்)' : 'Self-Driven (சுய பயன்பாடு)'}\n` +
      `📌 *Village / Farm Location*: ${villageAddress}\n` +
      `📍 *Live Farm GPS*: ${gpsUrl}\n\n` +
      `💵 *Estimated Total Rent*: ₹${totalRentAmount} (Base: ₹${currentCatObj.baseRate}/${currentCatObj.unit}${withOperator ? ' + ₹150 Operator Fee' : ''})\n\n` +
      `👉 Please confirm equipment availability & arrival time with machine operator!`;

    const formattedPhone = '916381029380';
    const isMobileDevice = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const waUrl = isMobileDevice
      ? `whatsapp://send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`
      : `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;

    window.open(waUrl, '_blank');
  };

  return (
    <div className="flex flex-col space-y-6 max-w-6xl mx-auto p-4 sm:p-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border border-emerald-500/30 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🚜</span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              RentO - விவசாய இயந்திரங்கள் வாடகை (Agri Equipment Rental)
            </h1>
          </div>
          <p className="text-emerald-300 text-sm max-w-2xl">
            டிராக்டர், அறுவடை இயந்திரம், பவர் டில்லர் மற்றும் தண்ணீர் டேங்கர் இயந்திரங்களை அருகிலுள்ள நிலத்து உரிமையாளர்களிடம் வாடகைக்கு எடுக்கலாம் ($0 Commission P2P Booking).
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl text-emerald-400 font-bold text-xs shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>0% Commission Direct Pay</span>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Equipment Categories */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Tractor className="w-5 h-5 text-emerald-500" /> 🚜 Select Agri Equipment Category
          </h2>

          <div className="grid grid-cols-1 gap-3">
            {RENTO_CATEGORIES.map((cat) => {
              const isSelected = cat.id === selectedCatId;
              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCatId(cat.id)}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-4 ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500 shadow-md'
                      : 'bg-card border-border hover:border-emerald-500/30'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{cat.icon}</span>
                    <div>
                      <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                        {cat.title}
                        {cat.popular && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                            POPULAR
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{cat.subtitle}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-base font-black text-emerald-400 block">
                      ₹{cat.baseRate}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      per {cat.unit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Calculator & WhatsApp Booking Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg space-y-5">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
              <span>🌾</span> Booking & Fare Calculator
            </h3>

            {/* Requirement Counter */}
            <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
              <span className="text-xs font-semibold text-muted-foreground block">
                Requirement in {currentCatObj.unit}s ({currentCatObj.unit} கணக்கீடு):
              </span>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setUnitsCount(Math.max(1, unitsCount - 1))}
                  className="w-10 h-10 rounded-lg bg-background border border-border text-foreground font-bold hover:bg-muted transition text-lg"
                >
                  -
                </button>
                <span className="text-xl font-black text-emerald-400">
                  {unitsCount} {currentCatObj.unit}(s)
                </span>
                <button
                  type="button"
                  onClick={() => setUnitsCount(unitsCount + 1)}
                  className="w-10 h-10 rounded-lg bg-background border border-border text-foreground font-bold hover:bg-muted transition text-lg"
                >
                  +
                </button>
              </div>
            </div>

            {/* Operator Included Option Toggle */}
            <div className="p-4 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground flex items-center gap-1">
                  <UserCheck className="w-4 h-4 text-emerald-400" /> Operator Included (இயந்திர ஓட்டுநர்)
                </span>
                <span className="text-[10px] text-muted-foreground block">Includes skilled operator (+ ₹150/unit)</span>
              </div>
              <input
                type="checkbox"
                checked={withOperator}
                onChange={(e) => setWithOperator(e.target.checked)}
                className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
              />
            </div>

            {/* Farmer Details Input */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">Your Name *</label>
                <input
                  type="text"
                  placeholder="Farmer / Customer Name"
                  value={farmerName}
                  onChange={(e) => setFarmerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">WhatsApp Mobile *</label>
                <input
                  type="text"
                  placeholder="+919876543210"
                  value={farmerPhone}
                  onChange={(e) => setFarmerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">Farm / Village Address *</label>
                <input
                  type="text"
                  value={villageAddress}
                  onChange={(e) => setVillageAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Estimated Total Rent */}
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground font-semibold block">Total Estimated Rent:</span>
                <span className="text-2xl font-black text-emerald-400">₹{totalRentAmount}</span>
              </div>
              <span className="text-[10px] text-emerald-300 font-bold bg-emerald-500/20 px-2.5 py-1 rounded-md">
                $0 Booking Fee
              </span>
            </div>

            {/* WhatsApp Booking Action */}
            <button
              type="button"
              onClick={handleBookViaWhatsApp}
              className="w-full py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl transition"
            >
              <MessageSquare className="w-5 h-5 fill-white" />
              Book Equipment via WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
