'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { createClient } from '@/lib/supabase/client';
import {
  ShoppingBag,
  Search,
  MapPin,
  Phone,
  MessageSquare,
  CreditCard,
  Plus,
  CheckCircle2,
  Clock,
  Navigation,
  X,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Check,
  Layers,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface MarketListing {
  id: string;
  user_id?: string;
  seller_name: string;
  seller_phone: string;
  seller_whatsapp: string;
  seller_upi?: string;
  title: string;
  category: string;
  price: number;
  unit: string;
  quantity?: number;
  description?: string;
  image_url?: string;
  pincode: string;
  district?: string;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  status: string;
  created_at: string;
}

const CATEGORIES = [
  { id: 'all', label: 'All Items', labelTa: 'அனைத்தும்', icon: '🌟', color: 'border-emerald-500/40 text-emerald-400' },
  { id: 'livestock', label: 'Livestock', labelTa: 'கால்நடைகள் (மாடு/ஆடு)', icon: '🐄', color: 'border-amber-500/40 text-amber-400' },
  { id: 'cereals', label: 'Grains & Crops', labelTa: 'தானியங்கள் (நெல்/கம்பு)', icon: '🌾', color: 'border-emerald-500/40 text-emerald-400' },
  { id: 'farm_produce', label: 'Farm Produce', labelTa: 'உழவர் சந்தை (காய்கறி/தேங்காய்)', icon: '🥦', color: 'border-blue-500/40 text-blue-400' },
  { id: 'machinery_tools', label: 'Tools & Agri', labelTa: 'விவசாய கருவிகள் (கொழு/மோட்டார்)', icon: '🚜', color: 'border-pink-500/40 text-pink-400' },
  { id: 'general_shop', label: 'Local Shops', labelTa: 'உள்ளூர் கடைகள் (உரம்/தீவனம்)', icon: '🏪', color: 'border-purple-500/40 text-purple-400' },
];

const POPULAR_PINCODES = [
  { pincode: '', label: 'All TN' },
  { pincode: '614904', label: '614904 Pattukkottai' },
  { pincode: '620001', label: '620001 Trichy' },
  { pincode: '614601', label: '614601 Pudukkottai' },
  { pincode: '613001', label: '613001 Thanjavur' },
  { pincode: '625001', label: '625001 Madurai' },
];

const UNIT_OPTIONS = [
  { id: 'per_head', label: 'Per Head (எண்ணிக்கை)' },
  { id: 'per_bag', label: 'Per Bag (மூட்டை)' },
  { id: 'per_kg', label: 'Per Kg (கிலோ)' },
  { id: 'per_item', label: 'Per Item (பொருள்)' },
  { id: 'per_ton', label: 'Per Ton (டன்)' },
  { id: 'per_acre', label: 'Per Acre (ஏக்கர்)' },
];

export default function DealoPage() {
  const { user, profile } = useAuth();
  const supabase = createClient();

  const [listings, setListings] = useState<MarketListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPincode, setSelectedPincode] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState<'market' | 'my_listings'>('market');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('livestock');
  const [formPrice, setFormPrice] = useState('');
  const [formUnit, setFormUnit] = useState('per_head');
  const [formQuantity, setFormQuantity] = useState('1');
  const [formDescription, setFormDescription] = useState('');
  const [formPincode, setFormPincode] = useState(profile?.pincode || '614904');
  const [formLocation, setFormLocation] = useState(profile?.location || 'Pattukkottai, Thanjavur');
  const [formUpi, setFormUpi] = useState(profile?.upi_id || (profile?.phone ? `${profile.phone.replace(/\D/g, '').slice(-10)}@upi` : ''));

  // Fetch Listings
  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('http://152.67.7.216:8080/api/dealo/listings');
      const data = res.ok ? await res.json() : null;
      const error = res.ok ? null : new Error('Failed to fetch listings');

      if (!error && data) {
        setListings(data);
      }
    } catch (e) {
      console.error('Error fetching market listings:', e);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchListings();

    // Subscribe to realtime changes
    const interval = setInterval(() => fetchListings(), 10000);
    return () => clearInterval(interval);
    };
  }, [fetchListings, supabase]);

  // Submit Listing
  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formPrice.trim() || !formPincode.trim()) {
      alert('Please fill Title, Price, and Pincode.');
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanPhone = profile?.phone?.replace(/\D/g, '').slice(-10) || user?.phone?.replace(/\D/g, '').slice(-10) || '6381029380';
      const cleanUpi = formUpi.trim() || `${cleanPhone}@upi`;
      const autoApprove = profile?.role === 'admin';

      const newListing = {
        user_id: user?.id || null,
        seller_name: profile?.full_name || 'Local Trader / உழவர்',
        seller_phone: cleanPhone,
        seller_whatsapp: cleanPhone,
        seller_upi: cleanUpi,
        title: formTitle.trim(),
        category: formCategory,
        price: Number(formPrice),
        unit: formUnit,
        quantity: Number(formQuantity) || 1,
        description: formDescription.trim(),
        pincode: formPincode.replace(/\D/g, '').slice(0, 6),
        district: formLocation.split(',')[1]?.trim() || 'Thanjavur',
        location_name: formLocation.trim(),
        status: autoApprove ? 'approved' : 'pending',
      };

      const res = await fetch('http://152.67.7.216:8080/api/dealo/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newListing)
      });
      const data = res.ok ? await res.json() : null;
      const error = res.ok ? null : new Error('Failed to create listing');

      if (error) {
        alert(error.message);
      } else {
        alert(
          autoApprove
            ? '🎉 Your listing is live in the marketplace!'
            : '🎉 Your goods listing has been submitted for Pincode Admin verification and will go live shortly.'
        );
        setModalOpen(false);
        setFormTitle('');
        setFormPrice('');
        setFormDescription('');
        fetchListings();
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to submit listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mark Sold
  const handleMarkSold = async (id: string) => {
    try {
      await fetch('http://152.67.7.216:8080/api/dealo/listings/' + id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'sold' })
      });
      setListings((prev) => prev.map((item) => (item.id === id ? { ...item, status: 'sold' } : item)));
    } catch (e) {}
  };

  // Direct 1-Tap Trade Actions
  const handleWhatsApp = (item: MarketListing) => {
    const cleanPhone = item.seller_whatsapp.replace(/\D/g, '').slice(-10);
    const text = encodeURIComponent(
      `வணக்கம் ${item.seller_name}! 👋\n\nநான் SuprO DealO Web Portal-ல் உங்களுடைய "${item.title}" (விலை: ₹${item.price} / ${item.unit.replace('per_', '')}) பார்த்தேன்.\n\nநேரில் பார்த்து வாங்க விரும்புகிறேன். விவரங்களை கூறவும்.`
    );
    window.open(`https://wa.me/91${cleanPhone}?text=${text}`, '_blank');
  };

  const handleUpiPay = (item: MarketListing) => {
    const upi = item.seller_upi || `${item.seller_phone.replace(/\D/g, '').slice(-10)}@upi`;
    const name = encodeURIComponent(item.seller_name);
    const note = encodeURIComponent(`SuprO DealO: ${item.title.substring(0, 30)}`);
    const upiUrl = `upi://pay?pa=${upi}&pn=${name}&am=${item.price}&cu=INR&tn=${note}`;
    window.location.href = upiUrl;
  };

  // Filtered Listings
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      if (activeTab === 'my_listings') {
        const userCleanPhone = profile?.phone?.replace(/\D/g, '').slice(-10);
        const itemCleanPhone = item.seller_phone?.replace(/\D/g, '').slice(-10);
        const isMyItem = item.user_id === user?.id || (userCleanPhone && itemCleanPhone === userCleanPhone);
        if (!isMyItem) return false;
      } else {
        if (item.status !== 'approved' && item.user_id !== user?.id) {
          return false;
        }
      }

      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (selectedPincode.trim().length > 0 && !item.pincode.startsWith(selectedPincode.trim())) return false;

      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = (item.description || '').toLowerCase().includes(q);
        const matchesLoc = (item.location_name || '').toLowerCase().includes(q);
        const matchesSeller = item.seller_name.toLowerCase().includes(q);
        const matchesPin = item.pincode.includes(q);
        if (!matchesTitle && !matchesDesc && !matchesLoc && !matchesSeller && !matchesPin) return false;
      }

      return true;
    });
  }, [listings, activeTab, selectedCategory, selectedPincode, searchQuery, user, profile]);

  const userCleanPhone = profile?.phone?.replace(/\D/g, '').slice(-10);
  const myListingsCount = listings.filter((item) => {
    const itemClean = item.seller_phone?.replace(/\D/g, '').slice(-10);
    return item.user_id === user?.id || (userCleanPhone && itemClean === userCleanPhone);
  }).length;

  return (
    <div className="flex h-full flex-col p-6 space-y-6 max-w-7xl mx-auto">
      {/* ─── HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
              <ShoppingBag className="w-8 h-8 text-primary" />
              DealO • உள்ளூர் சந்தை
            </h1>
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-3 h-3" /> LOCAL TRADE
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Buy & Sell Livestock, Ponni Paddy, Grains, Farm Produce, Agri Tools & Local Shop Goods directly via WhatsApp & UPI.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-sm rounded-xl shadow-md transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          List Sellable Goods / விற்பனை செய்
        </button>
      </div>

      {/* ─── SEARCH & PINCODE FILTER BAR ─── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 bg-card border border-border p-4 rounded-2xl shadow-sm">
        {/* Text Search */}
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search goods, cattle, grains, trader name or 6-digit Pincode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm font-medium focus:outline-none focus:border-primary transition"
          />
        </div>

        {/* Pincode Dropdown */}
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary shrink-0" />
          <select
            value={selectedPincode}
            onChange={(e) => setSelectedPincode(e.target.value)}
            className="px-3 py-2.5 bg-background border border-border rounded-xl text-sm font-bold text-foreground focus:outline-none focus:border-primary"
          >
            {POPULAR_PINCODES.map((pin) => (
              <option key={pin.label} value={pin.pincode}>
                {pin.label}
              </option>
            ))}
          </select>
        </div>

        {/* View Tab Toggle */}
        <div className="flex items-center gap-1 bg-muted p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('market')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition ${
              activeTab === 'market' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            🏪 Live Market ({listings.filter((l) => l.status === 'approved').length})
          </button>
          <button
            onClick={() => setActiveTab('my_listings')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition ${
              activeTab === 'my_listings' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            📦 My Listings ({myListingsCount})
          </button>
        </div>
      </div>

      {/* ─── CATEGORY FILTER CAROUSEL ─── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-black shrink-0 transition-all ${
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary shadow-md'
                  : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-border/80'
              }`}
            >
              <span className="text-base">{cat.icon}</span>
              <span>{cat.label}</span>
              <span className="text-[10px] opacity-75 font-normal">({cat.labelTa.split(' ')[0]})</span>
            </button>
          );
        })}
      </div>

      {/* ─── GOODS FEED GRID ─── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground font-bold">
          <RefreshCw className="w-8 h-8 animate-spin text-primary mb-3" />
          Loading local goods & livestock marketplace...
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-3xl p-8 text-center">
          <ShoppingBag className="w-14 h-14 mb-3 text-primary/40" />
          <p className="text-xl font-black text-foreground">No Listings Found</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            {searchQuery || selectedPincode
              ? `No items found matching your filters. Try resetting your search.`
              : 'Be the first local farmer or trader to list goods in your area!'}
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="mt-5 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-black shadow-md"
          >
            + 1-Click List My Goods
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((item) => {
            const cleanPhone = item.seller_whatsapp.replace(/\D/g, '').slice(-10);

            return (
              <div
                key={item.id}
                className="flex flex-col justify-between bg-card border border-border hover:border-primary/50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div>
                  {/* Top Bar: Pincode & Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-primary/10 text-primary border border-primary/20">
                      <MapPin className="w-3 h-3" />
                      {item.pincode} • {item.district || item.location_name || 'Tamil Nadu'}
                    </span>

                    {item.status === 'pending' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/30">
                        <Clock className="w-3 h-3" /> PENDING
                      </span>
                    ) : item.status === 'sold' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-slate-500/10 text-slate-400 border border-slate-500/30">
                        <CheckCircle2 className="w-3 h-3" /> SOLD OUT
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                        <ShieldCheck className="w-3 h-3" /> VERIFIED LIVE
                      </span>
                    )}
                  </div>

                  {/* Title & Price */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-extrabold text-foreground text-base leading-snug line-clamp-2">
                      {item.title}
                    </h3>
                    <div className="text-right shrink-0">
                      <p className="text-xl font-black text-primary">₹{item.price.toLocaleString('en-IN')}</p>
                      <p className="text-[11px] text-muted-foreground font-semibold">
                        /{item.unit.replace('per_', '')}
                      </p>
                    </div>
                  </div>

                  {/* Trader Info */}
                  <p className="text-xs font-semibold text-muted-foreground">
                    👤 {item.seller_name} • {item.quantity ? `📦 Stock: ${item.quantity} units` : 'In Stock'}
                  </p>

                  {/* Description */}
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  {/* UPI tag */}
                  {item.seller_upi && (
                    <p className="text-[11px] text-muted-foreground font-mono mt-2">
                      UPI ID: <span className="text-foreground font-bold">{item.seller_upi}</span>
                    </p>
                  )}
                </div>

                {/* 1-Tap Trading Action Buttons */}
                <div className="mt-5 pt-4 border-t border-border/60 flex items-center gap-2">
                  <button
                    onClick={() => handleWhatsApp(item)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-xs rounded-xl shadow-sm transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    வாட்ஸ்அப்
                  </button>

                  <button
                    onClick={() => handleUpiPay(item)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#0052cc] hover:bg-[#0047b3] text-white font-black text-xs rounded-xl shadow-sm transition"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    UPI Pay
                  </button>

                  <a
                    href={`tel:+91${cleanPhone}`}
                    className="p-2.5 rounded-xl border border-border bg-background hover:bg-muted text-primary transition"
                    title="Call Trader"
                  >
                    <Phone className="w-4 h-4" />
                  </a>

                  {item.latitude && item.longitude && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-xl border border-border bg-background hover:bg-muted text-primary transition"
                      title="Navigate"
                    >
                      <Navigation className="w-4 h-4" />
                    </a>
                  )}
                </div>

                {/* Mark Sold for My Listings */}
                {activeTab === 'my_listings' && item.status !== 'sold' && (
                  <button
                    onClick={() => handleMarkSold(item.id)}
                    className="mt-2 w-full py-1.5 rounded-lg border border-border/80 border-dashed text-emerald-500 hover:bg-emerald-500/10 text-xs font-bold transition flex items-center justify-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Mark as Sold / விற்றுவிட்டது
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── 1-CLICK LIST SELLABLE GOODS MODAL ─── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <div>
                <h2 className="text-xl font-black text-foreground">விற்பனைக்கு பதிவு செய்</h2>
                <p className="text-xs text-muted-foreground">List Cow, Goat, Cereals & Goods with 1-Click</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-1 text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Category / வகை</label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setFormCategory(c.id)}
                      className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                        formCategory === c.id
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-border text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <span>{c.icon}</span>
                      <span className="truncate">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Item / Livestock Title (பொருள் பெயர்) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. நாட்டு காங்கேயம் கறவை பசு / பொன்னி நெல் மூட்டை"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-semibold focus:outline-none focus:border-primary"
                />
              </div>

              {/* Price & Quantity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Price (விலை ₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="45000"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-semibold focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Quantity (அளவு)</label>
                  <input
                    type="number"
                    placeholder="1 or 20"
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-semibold focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Price Unit */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Price Unit (விலை முறை)</label>
                <div className="grid grid-cols-3 gap-2">
                  {UNIT_OPTIONS.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setFormUnit(u.id)}
                      className={`p-2 rounded-xl border text-xs font-bold truncate transition ${
                        formUnit === u.id
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-border text-muted-foreground'
                      }`}
                    >
                      {u.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pincode & Location */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">6-Digit Pincode *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="614904"
                    value={formPincode}
                    onChange={(e) => setFormPincode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-semibold focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Village / Town</label>
                  <input
                    type="text"
                    placeholder="Pattukkottai, Thanjavur"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-semibold focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* UPI ID */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Trader UPI ID (நேரடி கட்டணம்)</label>
                <input
                  type="text"
                  placeholder="e.g. 6381029380@upi"
                  value={formUpi}
                  onChange={(e) => setFormUpi(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-semibold focus:outline-none focus:border-primary"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Description (விவரங்கள்)</label>
                <textarea
                  rows={2}
                  placeholder="நாட்டு இனம், பால் அளவு, தரம் போன்ற விவரங்களை குறிப்பிடவும்..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-semibold focus:outline-none focus:border-primary"
                />
              </div>

              {/* Profile banner */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-xs text-emerald-400">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Linked Phone: +91 {profile?.phone || '6381029380'} • Auto-receives direct WhatsApp inquiries.</span>
              </div>

              {/* Submit */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border bg-background hover:bg-muted text-sm font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-black shadow-md transition"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Listing / பதிவிடு'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
