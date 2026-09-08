'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { 
  Tractor, Truck, Clock, Mountain, Search, Phone, 
  MessageSquare, Calendar, ShieldCheck, MapPin, Check, ArrowRight 
} from 'lucide-react';

interface RentalItem {
  id: string;
  name: string;
  tamil_name?: string;
  tamilName?: string;
  rate: string;
  unit: string;
  desc?: string;
  description?: string;
  icon?: string;
  category: 'agri' | 'cargo' | 'hourly' | 'tour';
  specs?: string[];
  specifications?: string;
}

export default function RentOPage() {
  const [machines, setMachines] = useState<RentalItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/rento/machinery')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMachines(data);
        } else if (data && Array.isArray(data.machines)) {
          setMachines(data.machines);
        } else {
          setMachines([]);
        }
      })
      .catch(err => {
        console.error('RentO fetch error:', err);
        setMachines([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const [activeTab, setActiveTab] = useState<'all' | 'agri' | 'cargo' | 'hourly' | 'tour'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<RentalItem | null>(null);
  const [bookingLocation, setBookingLocation] = useState('');
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);

  const getSpecs = (item: RentalItem): string[] => {
    if (Array.isArray(item.specs) && item.specs.length > 0) return item.specs;
    if (typeof item.specifications === 'string' && item.specifications.trim()) {
      return item.specifications.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (typeof item.specs === 'string' && (item.specs as string).trim()) {
      return (item.specs as string).split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
  };

  const getIcon = (item: RentalItem): string => {
    if (item.icon && item.icon.length > 0 && !item.icon.includes('')) return item.icon;
    if (item.category === 'cargo') return '🚚';
    if (item.category === 'hourly') return '⏱️';
    if (item.category === 'tour') return '🏔️';
    return '🚜';
  };

  const filtered = machines.filter((m: any) => {
    const matchesTab = activeTab === 'all' || m.category === activeTab;
    const nameStr = (m.name || '').toLowerCase();
    const tamilStr = (m.tamil_name || m.tamilName || '').toLowerCase();
    const specStr = (typeof m.specifications === 'string' ? m.specifications : Array.isArray(m.specs) ? m.specs.join(' ') : '').toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = nameStr.includes(query) || tamilStr.includes(query) || specStr.includes(query);
    return matchesTab && matchesSearch;
  });

  const handleBookWhatsApp = (item: RentalItem) => {
    const displayName = item.name || 'Vehicle / Equipment';
    const displayTamil = item.tamil_name || item.tamilName || '';
    const displayCat = (item.category || 'agri').toUpperCase();
    const text = `🚜 *SuprO RentO Booking Inquiry* 🚜\n\n` +
      `*Vehicle / Machine:* ${displayName} ${displayTamil ? `(${displayTamil})` : ''}\n` +
      `*Category:* ${displayCat}\n` +
      `*Rate:* ${'₹' + (item.rate || '0')} (${item.unit || 'per day'})\n` +
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

      {/* ─── LOADING STATE ─── */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading rental equipment fleet...</p>
        </div>
      )}

      {/* ─── EMPTY STATE ─── */}
      {!loading && filtered.length === 0 && (
        <div className="bg-[#111827] border border-slate-800 rounded-3xl p-12 text-center max-w-md mx-auto space-y-3">
          <span className="text-4xl">🚜</span>
          <h3 className="text-lg font-bold text-white">No Equipment Found</h3>
          <p className="text-sm text-slate-400">Try adjusting your search query or selecting a different category tab.</p>
        </div>
      )}

      {/* ─── ITEMS GRID ─── */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => {
            const itemSpecs = getSpecs(item);
            const itemIcon = getIcon(item);
            const tamilName = item.tamil_name || item.tamilName || '';
            const desc = item.desc || item.description || '';

            return (
              <div
                key={item.id}
                className="bg-[#111827] border border-slate-800 hover:border-emerald-500/40 transition-all rounded-3xl p-5 flex flex-col justify-between space-y-4 shadow-xl"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-3xl p-3 bg-slate-900 rounded-2xl border border-slate-800">
                      {itemIcon}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-emerald-400">{'₹' + (item.rate || '0')}</div>
                      <div className="text-[11px] text-slate-400 font-medium">{item.unit || 'per day'}</div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h3 className="font-bold text-base text-white">{item.name}</h3>
                    {tamilName ? (
                      <p className="text-xs text-emerald-400 font-semibold mt-0.5">{tamilName}</p>
                    ) : null}
                    {desc ? (
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">{desc}</p>
                    ) : null}
                  </div>

                  {/* SPEC BADGES */}
                  {itemSpecs.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {itemSpecs.map((spec, sIdx) => (
                        <span key={sIdx} className="text-[11px] bg-slate-900 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-800">
                          ✓ {spec}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setSelectedItem(item)}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 font-bold text-black rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
                >
                  <MessageSquare className="w-4 h-4" /> Book on WhatsApp
                </button>
              </div>
            );
          })}
        </div>
      )}

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
              {(selectedItem.tamil_name || selectedItem.tamilName) && (
                <div className="text-xs text-emerald-400 font-semibold">{selectedItem.tamil_name || selectedItem.tamilName}</div>
              )}
              <div className="text-sm font-bold text-white mt-2">{'₹' + (selectedItem.rate || '0')} • {selectedItem.unit || 'per day'}</div>
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
