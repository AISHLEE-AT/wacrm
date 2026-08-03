'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Share2, MapPin, BadgeCheck, Building2, Search, Plus, Loader2, RefreshCw, Package, TrendingUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface TradeListing {
  id: string;
  commodity: string;
  category: string;
  quantity_kg: number;
  price_per_kg: number;
  seller_name?: string;
  seller_phone?: string;
  district?: string;
  description?: string;
  verified: boolean;
  created_at: string;
}

const CATEGORIES = ['All', 'Grain', 'Spice', 'Vegetable', 'Oilseed', 'Fibre', 'Flower'];
const SEED_TRADE: Omit<TradeListing, 'id' | 'created_at'>[] = [
  { commodity: 'பொன்னி அரிசி (Ponni Rice)', category: 'Grain', quantity_kg: 10000, price_per_kg: 42, seller_name: 'Kaveri Delta Rice Mill', seller_phone: '9486335870', district: 'Thanjavur', description: 'Grade A Sona Masoori / Ponni wholesale', verified: true },
  { commodity: 'மஞ்சள் கிழங்கு (Turmeric Finger)', category: 'Spice', quantity_kg: 5000, price_per_kg: 140, seller_name: 'Erode Turmeric Traders', seller_phone: '9486335870', district: 'Erode', description: 'High curcumin content, first grade', verified: true },
  { commodity: 'தேங்காய் நார் (Coir Fibre)', category: 'Fibre', quantity_kg: 20000, price_per_kg: 28, seller_name: 'Pollachi Coir Exports', seller_phone: '9486335870', district: 'Coimbatore', description: 'Export quality dry coir fibre', verified: true },
  { commodity: 'கடலை எண்ணெய் (Groundnut Oil)', category: 'Oilseed', quantity_kg: 3000, price_per_kg: 185, seller_name: 'Salem Oil Mill', seller_phone: '9486335870', district: 'Salem', description: 'Cold pressed groundnut oil bulk', verified: false },
  { commodity: 'வெங்காயம் (Onion)', category: 'Vegetable', quantity_kg: 8000, price_per_kg: 22, seller_name: 'Dindigul Onion Farmers', seller_phone: '9486335870', district: 'Dindigul', description: 'Small onion & big onion both available', verified: true },
  { commodity: 'மல்லிகை (Jasmine Flower)', category: 'Flower', quantity_kg: 200, price_per_kg: 450, seller_name: 'Madurai Flower Market', seller_phone: '9486335870', district: 'Madurai', description: 'Fresh morning harvest, daily delivery', verified: true },
];

const CAT_COLORS: Record<string, string> = {
  Grain: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  Spice: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  Vegetable: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  Oilseed: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  Fibre: 'bg-brown-500/10 text-slate-300 border-slate-600',
  Flower: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
};

export default function TradeOPage() {
  const supabase = createClient();
  const [listings, setListings] = useState<TradeListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState('All');
  const [search, setSearch] = useState('');
  const [showPost, setShowPost] = useState(false);
  const [posting, setPosting] = useState(false);
  const [newListing, setNewListing] = useState({ commodity: '', category: 'Grain', quantity_kg: '', price_per_kg: '', seller_name: '', seller_phone: '', district: '', description: '' });

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('trade_listings').select('*').order('created_at', { ascending: false });
    if (data && data.length > 0) {
      setListings(data);
    } else {
      const { data: seeded } = await supabase.from('trade_listings').insert(SEED_TRADE).select();
      setListings(seeded || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = listings.filter(l => {
    const matchCat = selectedCat === 'All' || l.category === selectedCat;
    const matchSearch = !search || l.commodity.toLowerCase().includes(search.toLowerCase()) || l.district?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handlePost = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setPosting(true);
    await supabase.from('trade_listings').insert({
      ...newListing,
      quantity_kg: Number(newListing.quantity_kg) || 0,
      price_per_kg: Number(newListing.price_per_kg) || 0,
      verified: false,
    });
    setShowPost(false);
    setPosting(false);
    load();
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-cyan-950/80 via-slate-900 to-purple-950/80 border border-cyan-500/30 rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <span className="p-2.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-xl"><Share2 className="w-6 h-6" /></span>
          <div>
            <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-300 to-purple-300">TradeO • மொத்த வர்த்தகம்</h1>
            <p className="text-xs text-slate-400">B2B Commodity Hub — Live from Supabase, WhatsApp RFQ</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white"><RefreshCw className="h-4 w-4" /></button>
          <button onClick={() => setShowPost(true)} className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-bold text-xs flex items-center gap-1.5 hover:bg-cyan-400 transition">
            <Plus className="h-4 w-4" /> தயாரிப்பு பட்டியலிட
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Live Listings', value: listings.length, color: 'text-cyan-400' },
          { label: 'Verified Sellers', value: listings.filter(l => l.verified).length, color: 'text-emerald-400' },
          { label: 'Categories', value: new Set(listings.map(l => l.category)).size, color: 'text-amber-400' },
        ].map(s => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setSelectedCat(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${selectedCat === c ? 'bg-cyan-500 text-black' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" placeholder="Commodity, district தேடுக..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-cyan-400" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(item => (
            <div key={item.id} className="bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-5 space-y-3 transition flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${CAT_COLORS[item.category] || 'bg-slate-800 text-slate-400 border-slate-700'}`}>{item.category}</span>
                  {item.verified && <BadgeCheck className="w-5 h-5 text-emerald-400" />}
                </div>
                <h3 className="text-sm font-bold text-white">{item.commodity}</h3>
                {item.description && <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>}
                <div className="space-y-1 text-xs text-slate-400">
                  <p className="flex items-center gap-1.5"><Package className="h-3.5 w-3.5" />{(item.quantity_kg / 1000).toFixed(1)} Tons ({item.quantity_kg.toLocaleString()} kg)</p>
                  {item.district && <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{item.district}</p>}
                  {item.seller_name && <p className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-cyan-400" />{item.seller_name}</p>}
                </div>
              </div>
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">Wholesale Rate:</span>
                  <p className="text-lg font-black text-amber-300">₹{item.price_per_kg}<span className="text-xs font-normal text-slate-400">/kg</span></p>
                </div>
                <button onClick={() => {
                  const msg = `👋 TradeO RFQ: "${item.commodity}" (${item.quantity_kg.toLocaleString()} kg). Please send quote & delivery terms.`;
                  window.open(`https://wa.me/91${item.seller_phone || '9486335870'}?text=${encodeURIComponent(msg)}`, '_blank');
                }} className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition">
                  RFQ →
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-16 text-slate-500">
              <Share2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No trade listings found.</p>
            </div>
          )}
        </div>
      )}

      {/* Post Listing Modal */}
      {showPost && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-cyan-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">➕ New Trade Listing</h3>
              <button onClick={() => setShowPost(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handlePost} className="space-y-3">
              <input required placeholder="Commodity Name (e.g. Ponni Rice)" value={newListing.commodity} onChange={e => setNewListing(p => ({ ...p, commodity: e.target.value }))}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs" />
              <div className="grid grid-cols-2 gap-3">
                <select value={newListing.category} onChange={e => setNewListing(p => ({ ...p, category: e.target.value }))}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs">
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input placeholder="District" value={newListing.district} onChange={e => setNewListing(p => ({ ...p, district: e.target.value }))}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Quantity (kg)" value={newListing.quantity_kg} onChange={e => setNewListing(p => ({ ...p, quantity_kg: e.target.value }))}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs" />
                <input type="number" placeholder="Price/kg (₹)" value={newListing.price_per_kg} onChange={e => setNewListing(p => ({ ...p, price_per_kg: e.target.value }))}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs" />
              </div>
              <input placeholder="Seller Name" value={newListing.seller_name} onChange={e => setNewListing(p => ({ ...p, seller_name: e.target.value }))}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs" />
              <input placeholder="Seller Phone" value={newListing.seller_phone} onChange={e => setNewListing(p => ({ ...p, seller_phone: e.target.value }))}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs" />
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowPost(false)} className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">Cancel</button>
                <button type="submit" disabled={posting} className="flex-1 py-2.5 rounded-xl bg-cyan-500 text-black text-xs font-bold disabled:opacity-60">
                  {posting ? 'Publishing...' : 'Publish ✓'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
