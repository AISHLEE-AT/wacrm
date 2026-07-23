'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { createClient } from '@/lib/supabase/client';
import { 
  ShoppingBag, Search, PlusCircle, Filter, MapPin, Phone, 
  MessageCircle, Tag, CheckCircle2, Share2, Sparkles, X, 
  DollarSign, ArrowUpRight, ShieldCheck, Image as ImageIcon
} from 'lucide-react';
import { validateFullName, validateIndianPhone, validateUpiId } from '@/lib/validation';

const supabase = createClient();

const DEAL_CATEGORIES = [
  { id: 'all', name: 'All Categories', icon: '🏪' },
  { id: 'electronics', name: 'Electronics & Mobiles', icon: '📱' },
  { id: 'vehicles', name: 'Bikes & Vehicles', icon: '🛵' },
  { id: 'agri', name: 'Agri Produce & Seeds', icon: '🌾' },
  { id: 'household', name: 'Furniture & Appliances', icon: '🛋️' },
  { id: 'tools', name: 'Tools & Machinery', icon: '🛠️' },
  { id: 'services', name: 'Local Services & Gigs', icon: '👨‍🔧' },
];

export default function DealOMarketplacePage() {
  const { user: currentUser, profile } = useAuth();

  const [activeTab, setActiveTab] = useState<'sell' | 'buy'>('sell');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pincodeFilter, setPincodeFilter] = useState<string>('');
  
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showPostModal, setShowPostModal] = useState<boolean>(false);
  const [postSubmitted, setPostSubmitted] = useState<boolean>(false);

  // Post Deal Form State
  const [dealForm, setDealForm] = useState({
    type: 'sell' as 'sell' | 'buy',
    title: '',
    description: '',
    category: 'electronics',
    price: '',
    isNegotiable: true,
    imageUrl: '',
    pincode: '',
    locationName: 'Coimbatore, Tamil Nadu',
    name: profile?.full_name || '',
    phone: profile?.phone || currentUser?.phone || currentUser?.email?.split('@')[0] || '',
    upiId: '',
  });

  // Auto pre-fill name and phone upon auth resolve
  useEffect(() => {
    const rawPhone = profile?.phone || currentUser?.phone || currentUser?.email?.split('@')[0] || '';
    const cleanDigits = rawPhone.replace(/\D/g, '').slice(-10);
    const formattedPhone = cleanDigits.length === 10 ? cleanDigits : rawPhone;

    setDealForm((prev) => ({
      ...prev,
      name: profile?.full_name || prev.name,
      phone: prev.phone || formattedPhone,
    }));
  }, [profile?.full_name, profile?.phone, currentUser?.phone, currentUser?.email]);

  // Fetch Deals from Supabase
  const fetchDeals = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('local_deals')
        .select('*')
        .eq('deal_type', activeTab)
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;
      if (!error && data) {
        setDeals(data);
      }
    } catch (err) {
      console.error('Fetch deals error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, [activeTab, selectedCategory]);

  // Handle Submit New Deal / Requirement
  const handlePostDeal = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!dealForm.title.trim() || dealForm.title.trim().length < 3) {
      alert('⚠️ Please enter a clear title (at least 3 characters).');
      return;
    }

    const nameVal = validateFullName(dealForm.name);
    if (!nameVal.isValid) {
      alert(`⚠️ INVALID NAME:\n${nameVal.error}`);
      return;
    }

    const phoneVal = validateIndianPhone(dealForm.phone);
    if (!phoneVal.isValid) {
      alert(`⚠️ INVALID MOBILE NUMBER:\n${phoneVal.error}`);
      return;
    }

    if (dealForm.upiId) {
      const upiVal = validateUpiId(dealForm.upiId);
      if (!upiVal.isValid) {
        alert(`⚠️ INVALID UPI ID:\n${upiVal.error}`);
        return;
      }
    }

    const cleanPhone = dealForm.phone.replace(/\D/g, '').slice(-10);

    try {
      const payload = {
        user_id: currentUser?.id || null,
        deal_type: dealForm.type,
        title: dealForm.title.trim(),
        description: dealForm.description.trim(),
        category: dealForm.category,
        price: parseFloat(dealForm.price) || 0,
        is_negotiable: dealForm.isNegotiable,
        images: dealForm.imageUrl ? [dealForm.imageUrl] : [],
        pincode: dealForm.pincode || '641001',
        location_name: dealForm.locationName,
        seller_name: dealForm.name.trim(),
        phone: cleanPhone,
        upi_id: dealForm.upiId || `${cleanPhone}@upi`,
        status: 'active',
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.from('local_deals').insert(payload);
      if (error) {
        console.error('Insert deal error:', error);
      }

      setPostSubmitted(true);
      setTimeout(() => {
        setPostSubmitted(false);
        setShowPostModal(false);
        fetchDeals();
      }, 2000);
    } catch (err) {
      console.error(err);
      alert('Failed to post listing.');
    }
  };

  // Open Direct WhatsApp Chat with Pre-Filled Deal Details
  const openWhatsAppDealChat = (deal: any) => {
    const cleanPhone = deal.phone.replace(/\D/g, '').slice(-10);
    const dealTypeLabel = deal.deal_type === 'sell' ? 'Buying Enquiry' : 'Requirement Response';
    
    const message = encodeURIComponent(
      `🛍️ *FAGO DealO P2P Trade Inquiry*\n\n` +
      `Hello *${deal.seller_name}*,\n` +
      `I saw your ${deal.deal_type === 'sell' ? 'listing for sale' : 'buyer requirement'} on *FAGO DealO*:\n` +
      `📌 *${deal.title}*\n` +
      `💰 Price: ₹${deal.price} ${deal.is_negotiable ? '(Negotiable)' : ''}\n` +
      `📍 Location: ${deal.location_name} (${deal.pincode})\n\n` +
      `Is this item/requirement still active? Let's connect!`
    );

    window.open(`https://wa.me/91${cleanPhone}?text=${message}`, '_blank');
  };

  // Share Deal via WhatsApp
  const shareDealOnWhatsApp = (deal: any) => {
    const text = encodeURIComponent(
      `🔥 *Local P2P Deal on FAGO DealO*:\n\n` +
      `*${deal.title}*\n` +
      `💰 Price: ₹${deal.price}\n` +
      `📍 Location: ${deal.location_name}\n` +
      `📞 Contact Seller directly on WhatsApp: https://wa.me/91${deal.phone}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const filteredDeals = deals.filter((deal) => {
    const matchesSearch = deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          deal.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          deal.location_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPincode = !pincodeFilter || deal.pincode.includes(pincodeFilter);
    return matchesSearch && matchesPincode;
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-cyan-950 text-white p-6 rounded-3xl border border-emerald-500/20 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
            <ShoppingBag className="w-4 h-4" />
            FAGO DealO • 0-Commission Direct P2P Marketplace
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Local Seller vs Buyer Direct Hub
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
            List items for sale or post your buyer needs. Connect 1-click on WhatsApp & receive instant direct UPI payments with ZERO middleman fees!
          </p>
        </div>

        <button
          onClick={() => setShowPostModal(true)}
          className="relative z-10 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black px-5 py-3.5 rounded-2xl shadow-xl hover:scale-105 transition active:scale-95"
        >
          <PlusCircle className="w-5 h-5" />
          Post Item / Requirement
        </button>
      </div>

      {/* Tabs: SELL vs BUY */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex bg-muted/60 p-1.5 rounded-2xl border border-border w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('sell')}
            className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'sell'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            🏷️ For Sale ({deals.length})
          </button>
          <button
            onClick={() => setActiveTab('buy')}
            className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'buy'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            🔍 Buyer Wants / Needs
          </button>
        </div>

        {/* Search & Pincode Filter */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search deals, products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-xs font-semibold focus:outline-none focus:border-primary"
            />
          </div>

          <div className="relative w-36">
            <MapPin className="w-4 h-4 absolute left-3 top-3 text-emerald-500" />
            <input
              type="text"
              placeholder="Pincode"
              value={pincodeFilter}
              onChange={(e) => setPincodeFilter(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-card border border-border rounded-xl text-xs font-semibold focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {DEAL_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition flex items-center gap-1.5 ${
              selectedCategory === cat.id
                ? 'bg-primary/20 text-primary border-primary shadow-sm'
                : 'bg-card text-muted-foreground border-border hover:bg-muted/50'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Deals Grid */}
      {loading ? (
        <div className="p-12 text-center text-muted-foreground font-semibold">
          Loading local deals...
        </div>
      ) : filteredDeals.length === 0 ? (
        <div className="bg-card border border-border rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto text-2xl font-bold">
            🏷️
          </div>
          <h3 className="text-lg font-bold text-foreground">No Local Deals Found</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Be the first to post a product for sale or request a buyer requirement in your area!
          </p>
          <button
            onClick={() => setShowPostModal(true)}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition"
          >
            ➕ Post New Listing
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDeals.map((deal) => (
            <div
              key={deal.id}
              className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition flex flex-col justify-between group"
            >
              {/* Product Image / Placeholder */}
              <div className="relative h-48 bg-muted/40 overflow-hidden flex items-center justify-center">
                {deal.images && deal.images.length > 0 ? (
                  <img
                    src={deal.images[0]}
                    alt={deal.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ImageIcon className="w-10 h-10 stroke-[1.5]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">No Photo Uploaded</span>
                  </div>
                )}

                {/* Price Tag Badge */}
                <div className="absolute top-3 left-3 bg-emerald-500 text-slate-950 font-black text-sm px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                  ₹{deal.price}
                  {deal.is_negotiable && <span className="text-[10px] opacity-80 font-normal">(Negotiable)</span>}
                </div>

                {/* Type Badge */}
                <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md text-white font-bold text-[10px] px-2.5 py-1 rounded-full border border-white/10 uppercase tracking-wider">
                  {deal.deal_type === 'sell' ? '🏷️ For Sale' : '🔍 Buyer Want'}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base text-foreground group-hover:text-emerald-400 transition line-clamp-1">
                    {deal.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {deal.description || 'No detailed description provided.'}
                  </p>
                </div>

                <div className="space-y-2 border-t border-border pt-3">
                  {/* Location & Seller */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-semibold text-foreground">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                      {deal.location_name} ({deal.pincode})
                    </span>
                    <span className="font-mono text-[10px]">Seller: {deal.seller_name}</span>
                  </div>

                  {/* UPI Badge */}
                  {deal.upi_id && (
                    <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg text-[11px] font-mono text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Direct UPI: {deal.upi_id}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => openWhatsAppDealChat(deal)}
                    className="py-2.5 px-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md transition"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    Chat WhatsApp
                  </button>

                  <button
                    onClick={() => shareDealOnWhatsApp(deal)}
                    className="py-2.5 px-3 bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-border transition"
                  >
                    <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                    Share Deal
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Deal Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border max-w-xl w-full rounded-3xl p-6 space-y-6 shadow-2xl animate-fade-in my-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-xl font-black text-foreground flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-emerald-500" /> Post P2P Deal or Requirement
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">List products for direct sale or post what you need to buy.</p>
              </div>
              <button
                onClick={() => setShowPostModal(false)}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {postSubmitted ? (
              <div className="p-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h3 className="text-lg font-bold text-foreground">Listing Published Successfully!</h3>
                <p className="text-xs text-muted-foreground">Your deal is now visible to nearby buyers & sellers.</p>
              </div>
            ) : (
              <form onSubmit={handlePostDeal} className="space-y-4">
                {/* Deal Type Switcher */}
                <div className="flex bg-muted p-1 rounded-xl border border-border">
                  <button
                    type="button"
                    onClick={() => setDealForm({ ...dealForm, type: 'sell' })}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                      dealForm.type === 'sell' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-muted-foreground'
                    }`}
                  >
                    🏷️ I Want to SELL an Item
                  </button>
                  <button
                    type="button"
                    onClick={() => setDealForm({ ...dealForm, type: 'buy' })}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                      dealForm.type === 'buy' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-muted-foreground'
                    }`}
                  >
                    🔍 I Want to BUY an Item / Service
                  </button>
                </div>

                {/* Title */}
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                    Title / Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. iPhone 13 128GB / Royal Enfield Bullet / 50 Bags Paddy"
                    value={dealForm.title}
                    onChange={(e) => setDealForm({ ...dealForm, title: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-xs font-medium focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Category & Price */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Category *</label>
                    <select
                      value={dealForm.category}
                      onChange={(e) => setDealForm({ ...dealForm, category: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-xs font-semibold focus:outline-none focus:border-primary"
                    >
                      {DEAL_CATEGORIES.filter(c => c.id !== 'all').map((c) => (
                        <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Price / Target Budget (₹) *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 5000"
                      value={dealForm.price}
                      onChange={(e) => setDealForm({ ...dealForm, price: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-xs font-bold focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Photo URL */}
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Photo Image URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={dealForm.imageUrl}
                    onChange={(e) => setDealForm({ ...dealForm, imageUrl: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-xs focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Location Pincode & City */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Location Pincode *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 641001"
                      value={dealForm.pincode}
                      onChange={(e) => setDealForm({ ...dealForm, pincode: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-xs font-semibold focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">City / Town Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Coimbatore, Tamil Nadu"
                      value={dealForm.locationName}
                      onChange={(e) => setDealForm({ ...dealForm, locationName: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Name, Phone & UPI */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      value={dealForm.name}
                      onChange={(e) => setDealForm({ ...dealForm, name: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-xs focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">WhatsApp Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="10-digit Phone"
                      value={dealForm.phone}
                      onChange={(e) => setDealForm({ ...dealForm, phone: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-xs focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">UPI ID for Direct Pay</label>
                    <input
                      type="text"
                      placeholder="e.g. phone@upi"
                      value={dealForm.upiId}
                      onChange={(e) => setDealForm({ ...dealForm, upiId: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm rounded-xl shadow-xl transition"
                  >
                    🚀 Publish Deal on FAGO Marketplace
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
