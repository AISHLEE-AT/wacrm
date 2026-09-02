'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { 
  Tractor, Truck, Clock, Mountain, Search, Phone, 
  MessageSquare, Calendar, ShieldCheck, MapPin, Check, ArrowRight 
} from 'lucide-react';

interface RentalItem {
  id: string;
  name: string;
  tamilName: string;
  rate: string;
  unit: string;
  desc: string;
  icon: string;
  category: 'agri' | 'cargo' | 'hourly' | 'tour';
  specs: string[];
}

const RENTAL_ITEMS: RentalItem[] = [
  // ─── AGRI EQUIPMENT ───
  { id: 'tractor_plow', name: 'Mahindra / Swaraj 50 HP Tractor', tamilName: 'டிராக்டர் (ஏர் உழுதல்)', rate: '₹450', unit: 'per hour', desc: 'Rotavator & Cultivator attachment included for deep field tillage.', icon: '🚜', category: 'agri', specs: ['50 HP Engine', 'Rotavator / Cultivator', 'Available with Driver'] },
  { id: 'paddy_harvester', name: 'Kubota Track Paddy Harvester', tamilName: 'நெல் அறுவடை இயந்திரம்', rate: '₹1,800', unit: 'per acre', desc: 'Wet & dry field rubber track harvester with zero grain wastage.', icon: '🌾', category: 'agri', specs: ['Rubber Track Type', 'High Speed Threshing', 'Full Acre Coverage'] },
  { id: 'sugarcane_harvester', name: 'Heavy Duty Sugarcane Harvester', tamilName: 'கரும்பு அறுவடை', rate: '₹2,400', unit: 'per acre', desc: 'High tonnage sugarcane crop cutter and field cleaner.', icon: '🎋', category: 'agri', specs: ['Auto-loading Chute', 'High Capacity Cutter', 'Fuel Included'] },
  { id: 'pesticide_drone', name: 'Agri Drone Sprayer (16 Litre)', tamilName: 'மருந்து தெளிக்கும் ட்ரோன்', rate: '₹350', unit: 'per acre', desc: 'GPS-guided precision pesticide & liquid fertilizer spraying in 8 minutes.', icon: '🛸', category: 'agri', specs: ['16L Tank', '8 Mins / Acre', 'Certified Pilot Operator'] },
  { id: 'power_tiller', name: 'Mini Power Tiller & Weeder', tamilName: 'பவர் டில்லர்', rate: '₹250', unit: 'per hour', desc: 'Ideal for vegetable beds, orchards, and small land weed management.', icon: '⚙️', category: 'agri', specs: ['7 HP Diesel', 'Compact & Agile', 'Easy Self-Operation'] },
  { id: 'agri_trailer', name: 'High-Capacity Agri Goods Trailer', tamilName: 'விவசாய டிரெய்லர்', rate: '₹300', unit: 'per hour', desc: 'Tractor trailer for transporting paddy bags, straw bales, and vegetables.', icon: '🚛', category: 'agri', specs: ['3 Tons Payload', 'Hydraulic Tipping', 'All-Terrain Wheels'] },

  // ─── CARGO & TRUCKS ───
  { id: 'tata_ace', name: 'Tata Ace Gold (Chota Hathi)', tamilName: 'டாடா ஏஸ்', rate: '₹250 + ₹18/km', unit: '750 kg', desc: 'Perfect for local market supply, vegetable transport, and shifting.', icon: '🚚', category: 'cargo', specs: ['750 kg Payload', 'Intra-City Delivery', 'Tarpaulin Cover'] },
  { id: 'bolero_maxi', name: 'Mahindra Bolero Maxi Truck Plus', tamilName: 'போலிரோ மேக்ஸி', rate: '₹400 + ₹22/km', unit: '1.5 Tons', desc: 'Heavy payload pickup truck for farm produce, grains, and construction.', icon: '🛻', category: 'cargo', specs: ['1.5 Ton Payload', 'Heavy-Duty Suspension', 'Rural Roads Ready'] },
  { id: 'leyland_dost', name: 'Ashok Leyland Dost Strong', tamilName: 'அசோக் லேலேண்ட் தோஸ்ட்', rate: '₹450 + ₹24/km', unit: '1.8 Tons', desc: 'Inter-district commercial cargo transport with high reliability.', icon: '🚛', category: 'cargo', specs: ['1.8 Ton Payload', 'Long Body Cargo', 'GPS Tracking'] },
  { id: 'eicher_lorry', name: 'Eicher Pro 10.90 Lorry', tamilName: 'ஐச்சர் லாரி', rate: '₹900 + ₹38/km', unit: '5 Tons', desc: 'Medium commercial freight lorry for bulk Mandi crops and sugarcane.', icon: '🚛', category: 'cargo', specs: ['5 Ton Payload', 'Covered Container Body', 'Permit All TN'] },
  { id: 'tipper_10w', name: '10-Wheeler Heavy Tipper', tamilName: '10 சக்கர டிப்பர்', rate: '₹1,800 + ₹65/km', unit: '15 Tons', desc: 'Bulk soil, sand, blue metal, and heavy agricultural field leveling.', icon: '🏗️', category: 'cargo', specs: ['15 Ton Payload', 'Heavy Hydraulic Lift', 'Industrial Grade'] },

  // ─── HOURLY PACKAGES ───
  { id: 'pkg_2h20k', name: '2 Hours / 20 KM Package', tamilName: '2 மணி நேரம் / 20 கி.மீ', rate: '₹499 Sedan', unit: '₹799 SUV', desc: 'City hospital visits, business meetings, and local family errands.', icon: '⏱️', category: 'hourly', specs: ['AC Sedan / SUV', 'Fuel & Chauffeur Included', 'Flexible Extensions'] },
  { id: 'pkg_4h40k', name: '4 Hours / 40 KM Package', tamilName: '4 மணி நேரம் / 40 கி.மீ', rate: '₹899 Sedan', unit: '₹1,399 SUV', desc: 'Half-day shopping, wedding attendance, and city tours.', icon: '⏱️', category: 'hourly', specs: ['Dedicated Driver', 'Multiple Stops Allowed', 'Clean Sanitized Cars'] },
  { id: 'pkg_8h80k', name: '8 Hours / 80 KM Full Day', tamilName: '8 மணி நேரம் / 80 கி.மீ', rate: '₹1,699 Sedan', unit: '₹2,499 SUV', desc: 'Full-day corporate meetings, temple visits, and outstation trips.', icon: '⏱️', category: 'hourly', specs: ['Full 8hr Availability', 'Inter-City Support', 'Top Rated Chauffeur'] },
  { id: 'pkg_12h120k', name: '12 Hours / 120 KM Extended', tamilName: '12 மணி நேரம் / 120 கி.மீ', rate: '₹2,399 Sedan', unit: '₹3,499 SUV', desc: 'Long-distance round trips, temple trails, and day-long events.', icon: '⏱️', category: 'hourly', specs: ['12hr Full Duty', 'Zero Surge Guarantee', 'Doorstep Pickup'] },

  // ─── TOUR PACKAGES ───
  { id: 'tour_ooty', name: 'Ooty Queen of Hills Tour', tamilName: 'ஊட்டி மலை சுற்றுலா', rate: '₹4,500 / Day', unit: 'All Inclusive', desc: 'Tea Gardens, Doddabetta, Ooty Lake, Pykara Falls & Botanical Gardens.', icon: '🏔️', category: 'tour', specs: ['Hill Certified Driver', 'Sightseeing Route', 'Toll & Parking Covered'] },
  { id: 'tour_kodai', name: 'Kodaikanal Princess of Hills', tamilName: 'கொடைக்கானல் சுற்றுலா', rate: '₹4,800 / Day', unit: 'All Inclusive', desc: 'Pillar Rocks, Coakers Walk, Bryant Park & Berijam Lake tour.', icon: '🌲', category: 'tour', specs: ['Scenic Route Navigation', 'Full Day Cab', 'Pickup Anywhere in TN'] },
  { id: 'tour_rameswaram', name: 'Rameswaram & Dhanushkodi Yatra', tamilName: 'ராமேஸ்வரம் ஆன்மீக பயணம்', rate: '₹5,200 / Day', unit: 'All Inclusive', desc: 'Ramanathaswamy Temple, Pamban Bridge & Dhanushkodi Beach Darshan.', icon: '🛕', category: 'tour', specs: ['Temple Timings Sync', 'Special Pooja Assistance', 'Beach Ride'] },
  { id: 'tour_girivalam', name: 'Thiruvannamalai Girivalam Package', tamilName: 'திருவண்ணாமலை கிரிவலம்', rate: '₹3,800 / Day', unit: 'Special Darshan', desc: 'Full Moon Pournami Girivalam darshan and Annamalaiyar Temple visit.', icon: '🕉️', category: 'tour', specs: ['Direct Girivalam Drop', '24/7 Waiting Chauffeur', 'Comfort AC Cab'] },
  { id: 'tour_madurai_tanjore', name: 'Madurai & Thanjavur Heritage Tour', tamilName: 'மதுரை & தஞ்சை சுற்றுலா', rate: '₹4,200 / Day', unit: 'Heritage Tour', desc: 'Meenakshi Amman Temple, Thirumalai Nayakkar Palace & Brihadeeswarar Big Temple.', icon: '🏰', category: 'tour', specs: ['UNESCO Heritage Sites', 'Historical Guide Support', 'Family Sedan / SUV'] },
];

export default function RentOPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'agri' | 'cargo' | 'hourly' | 'tour'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<RentalItem | null>(null);
  const [bookingLocation, setBookingLocation] = useState('');
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);

  const filtered = RENTAL_ITEMS.filter((m) => {
    const matchesTab = activeTab === 'all' || m.category === activeTab;
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tamilName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleBookWhatsApp = (item: RentalItem) => {
    const text = `🚜 *SuprO RentO Booking Inquiry* 🚜\n\n` +
      `*Vehicle / Machine:* ${item.name} (${item.tamilName})\n` +
      `*Category:* ${item.category.toUpperCase()}\n` +
      `*Rate:* ${item.rate} (${item.unit})\n` +
      `*Required Date:* ${bookingDate}\n` +
      `*Location:* ${bookingLocation || 'Thanjavur / Tamil Nadu'}\n\n` +
      `Hi, I would like to book this via SuprO RentO. Please confirm operator availability!`;

    window.open(`https://wa.me/916381029380?text=${encodeURIComponent(text)}`, '_blank');
    setSelectedItem(null);
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-slate-100 p-4 sm:p-6 space-y-6">
      {/* ─── HEADER ─── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">🚜</span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              RentO <span className="text-xs bg-emerald-500/20 text-emerald-400 font-normal px-2.5 py-0.5 rounded-full border border-emerald-500/30">வாடகை சந்தை</span>
            </h1>
            <p className="text-sm text-slate-400">Tractors, Harvesters, Commercial Trucks, Hourly Cabs & Hill Tours</p>
          </div>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search equipment, cargo, packages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* ─── CATEGORY FILTER TABS ─── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/60">
        {[
          { id: 'all', label: '🌟 All Fleet' },
          { id: 'agri', label: '🚜 Agri Equipment' },
          { id: 'cargo', label: '🚚 Cargo & Trucks' },
          { id: 'hourly', label: '⏱️ Hourly Rental' },
          { id: 'tour', label: '🏔️ Tour Packages' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── ITEMS GRID ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-[#111827] border border-slate-800 hover:border-emerald-500/40 transition-all rounded-3xl p-5 flex flex-col justify-between space-y-4 shadow-xl"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="text-3xl p-3 bg-slate-900 rounded-2xl border border-slate-800">
                  {item.icon}
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-emerald-400">{item.rate}</div>
                  <div className="text-[11px] text-slate-400 font-medium">{item.unit}</div>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-bold text-base text-white">{item.name}</h3>
                <p className="text-xs text-emerald-400 font-semibold mt-0.5">{item.tamilName}</p>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">{item.desc}</p>
              </div>

              {/* SPEC BADGES */}
              <div className="flex flex-wrap gap-1.5 mt-4">
                {item.specs.map((spec, sIdx) => (
                  <span key={sIdx} className="text-[11px] bg-slate-900 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-800">
                    ✓ {spec}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedItem(item)}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 font-bold text-black rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
            >
              <MessageSquare className="w-4 h-4" /> Book on WhatsApp
            </button>
          </div>
        ))}
      </div>

      {/* ─── BOOKING MODAL ─── */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-white">Confirm Booking Request</h3>
              <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div className="font-bold text-white text-base">{selectedItem.name}</div>
              <div className="text-xs text-emerald-400 font-semibold">{selectedItem.tamilName}</div>
              <div className="text-sm font-bold text-white mt-2">{selectedItem.rate} • {selectedItem.unit}</div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Your Location / Farm Address</label>
                <input
                  type="text"
                  placeholder="e.g. Thanjavur Mandi, Melur, Salem"
                  value={bookingLocation}
                  onChange={(e) => setBookingLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Preferred Date</label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              onClick={() => handleBookWhatsApp(selectedItem)}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 font-bold text-black rounded-xl text-sm transition-all flex items-center justify-center gap-2"
            >
              Send Request to WhatsApp Dispatch
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
