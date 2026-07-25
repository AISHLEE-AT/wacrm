// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { Tractor, ShieldCheck, MapPin, Calendar, Clock, Phone, Send, CheckCircle2, Search } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface Machinery {
  id: string;
  name: string;
  category: string;
  rate: string;
  unit: string;
  location: string;
  hp: string;
  image: string;
  providerPhone: string;
}

export default function RentOPage() {
  const { user, profile } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMachine, setSelectedMachine] = useState<Machinery | null>(null);
  const [district, setDistrict] = useState('Thanjavur (தஞ்சாவூர்)');
  const [hours, setHours] = useState('4');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const machineryList: Machinery[] = [
    {
      id: 'm1',
      name: 'Mahindra 575 DI Tractor (45 HP) + Rotavator',
      category: 'Tractor',
      rate: '₹600',
      unit: 'மணி நேரம் (per hour)',
      location: 'Thanjavur (தஞ்சாவூர்)',
      hp: '45 HP',
      image: '🚜',
      providerPhone: '916381029380'
    },
    {
      id: 'm2',
      name: 'Kubota Multi-Crop Paddy Harvester Machine',
      category: 'Harvester',
      rate: '₹1,800',
      unit: 'மணி நேரம் (per hour)',
      location: 'Trichy (திருச்சி)',
      hp: '75 HP',
      image: '🌾',
      providerPhone: '916381029380'
    },
    {
      id: 'm3',
      name: 'FAGO Agri Drone Sprayer (10 Litre Capacity)',
      category: 'Drone',
      rate: '₹450',
      unit: 'ஏக்கர் (per acre)',
      location: 'Madurai (மதுரை)',
      hp: 'AI Solar Drone',
      image: '🛸',
      providerPhone: '916381029380'
    },
    {
      id: 'm4',
      name: '5HP Heavy Duty Diesel Water Irrigation Pump',
      category: 'Irrigation',
      rate: '₹250',
      unit: 'நாள் (per day)',
      location: 'Salem (சேலம்)',
      hp: '5 HP Diesel',
      image: '💧',
      providerPhone: '916381029380'
    },
    {
      id: 'm5',
      name: 'Shaktiman Heavy Duty Disc Harrow & Plough Attachment',
      category: 'Attachment',
      rate: '₹350',
      unit: 'மணி நேரம் (per hour)',
      location: 'Coimbatore (கோயம்புத்தூர்)',
      hp: 'Universal Attachment',
      image: '🗡️',
      providerPhone: '916381029380'
    }
  ];

  const filteredMachinery = machineryList.filter(m => {
    const matchesCat = selectedCategory === 'All' || m.category === selectedCategory;
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleBookNow = (machine: Machinery) => {
    setSelectedMachine(machine);
    setBookingSuccess(false);
  };

  const confirmBooking = () => {
    if (!selectedMachine) return;
    const userPhone = profile?.phone || user?.phone || user?.email?.split('@')[0] || '';
    const userName = profile?.full_name || 'Farmer';
    
    const msg = `🚜 *FAGO RentO வாடகை பதிவு கோரிக்கை*\n\n` +
      `கருவி: ${selectedMachine.name}\n` +
      `வாடகை வீதம்: ${selectedMachine.rate} / ${selectedMachine.unit}\n` +
      `மாவட்டம்: ${district}\n` +
      `தேவையான காலம்: ${hours} மணி நேரம்/நாட்கள்\n` +
      `வாடிக்கையாளர்: ${userName} (${userPhone})\n\n` +
      `0% கமிஷன் நேரடியாக வாடகைக்கு எடுக்க உறுதிப்படுத்தவும்.`;

    const waUrl = `https://wa.me/916381029380?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
    setBookingSuccess(true);
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white p-4 md:p-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400">
            <Tractor className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              RentO • விவசாயக் கருவிகள் வாடகை மையம்
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-0.5">
              0% Commission Direct Agricultural Equipment & Tractor Rentals in Tamil Nadu
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/30 flex items-center gap-1.5 self-start md:self-auto">
          <ShieldCheck className="w-4 h-4" /> 100% Verified Equipment Owners
        </span>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {['All', 'Tractor', 'Harvester', 'Drone', 'Irrigation', 'Attachment'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                selectedCategory === cat
                  ? 'bg-amber-500 border-amber-400 text-black shadow-lg shadow-amber-500/20'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="தேடுக... (Search location or machine)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Machinery Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMachinery.map((m) => (
          <div key={m.id} className="bg-card/40 border border-white/10 rounded-3xl p-5 space-y-4 hover:border-amber-500/40 transition backdrop-blur-md flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl">{m.image}</span>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
                  {m.hp}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white line-clamp-1">{m.name}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {m.location}
                </p>
              </div>

              <div className="p-3 bg-slate-900/60 border border-white/5 rounded-2xl flex items-center justify-between">
                <span className="text-xs text-slate-400">வாடகை வீதம்:</span>
                <span className="text-sm font-black text-emerald-400">{m.rate} <span className="text-[10px] font-normal text-slate-400">/ {m.unit}</span></span>
              </div>
            </div>

            <button
              onClick={() => handleBookNow(m)}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg transition"
            >
              <Send className="w-3.5 h-3.5" /> வாடகைக்கு பெறுக (Book Now)
            </button>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {selectedMachine && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-amber-500/40 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                🚜 வாடகை பதிவு (Machine Rental)
              </h3>
              <button onClick={() => setSelectedMachine(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-2xl border border-white/10 space-y-1">
              <p className="text-xs font-bold text-amber-400">{selectedMachine.name}</p>
              <p className="text-xs text-emerald-400 font-bold">{selectedMachine.rate} / {selectedMachine.unit}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-bold">மாவட்டம் (District)</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500"
                >
                  {['Thanjavur (தஞ்சாவூர்)', 'Trichy (திருச்சி)', 'Madurai (மதுரை)', 'Salem (சேலம்)', 'Coimbatore (கோயம்புத்தூர்)', 'Tiruvarur (திருவாரூர்)'].map(d => (
                    <option key={d} value={d} className="bg-slate-900 text-white">{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">தேவையான நேரம்/நாட்கள் (Duration)</label>
                <input
                  type="number"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500"
                  placeholder="e.g. 4"
                />
              </div>
            </div>

            {bookingSuccess ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center text-xs text-emerald-400 font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> WhatsApp வாடகை செய்தி அனுப்பப்பட்டது!
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={confirmBooking}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-black text-xs flex items-center justify-center gap-2 shadow-xl hover:opacity-90 transition"
                >
                  <Send className="w-4 h-4" /> 1-Click WhatsApp வாடகை பதிவு
                </button>
                <a
                  href={`upi://pay?pa=9486335870@hdfcbank&pn=FAGO%20RentO&am=100&cu=INR&tn=RentO%20Booking%20Deposit`}
                  className="w-full py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  💳 PAY ₹100 ADVANCE DEPOSIT VIA UPI
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
