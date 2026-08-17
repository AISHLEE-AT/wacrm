'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Users,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  ShoppingBag,
  Clock,
  ShieldCheck,
  Check,
  X,
  Trash2,
  ExternalLink,
  MessageSquare,
  Search,
  Filter,
  DollarSign,
  Tag,
} from 'lucide-react';

interface Provider {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  pincode?: string | null;
  role: string | null;
  profile_complete: boolean;
  created_at: string;
}

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
  status: string;
  created_at: string;
}

const CATEGORY_NAMES: Record<string, { label: string; icon: string; color: string }> = {
  livestock: { label: 'Livestock / கால்நடை', icon: '🐄', color: 'text-amber-500' },
  cereals: { label: 'Grains & Crops / தானியம்', icon: '🌾', color: 'text-emerald-500' },
  farm_produce: { label: 'Farm Produce / உழவர் சந்தை', icon: '🥦', color: 'text-blue-500' },
  machinery_tools: { label: 'Tools & Agri / கருவிகள்', icon: '🚜', color: 'text-pink-500' },
  general_shop: { label: 'Local Shops / கடைகள்', icon: '🏪', color: 'text-purple-500' },
};

export default function ProvidersPage() {
  const searchParams = useSearchParams();
  const isEmbed = searchParams.get('embed') === 'true';

  const [activeTab, setActiveTab] = useState<'providers' | 'dealo'>('dealo');

  // Providers State
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [searchProvider, setSearchProvider] = useState('');

  // DealO Listings State
  const [listings, setListings] = useState<MarketListing[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [searchListing, setSearchListing] = useState('');
  const [selectedPincode, setSelectedPincode] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'sold'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const supabase = createClient();

  // Fetch Providers
  const fetchProviders = useCallback(async () => {
    setLoadingProviders(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, location, pincode, role, profile_complete, created_at')
        .order('created_at', { ascending: false });
      if (!error && data) setProviders(data);
    } catch (e) {
      console.error('Error fetching providers', e);
    } finally {
      setLoadingProviders(false);
    }
  }, [supabase]);

  // Fetch DealO Listings
  const fetchListings = useCallback(async () => {
    setLoadingListings(true);
    try {
      const { data, error } = await supabase
        .from('market_listings')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) setListings(data);
    } catch (e) {
      console.error('Error fetching listings', e);
    } finally {
      setLoadingListings(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchProviders();
    fetchListings();
  }, [fetchProviders, fetchListings]);

  // 1-Click Approve Listing
  const handleApproveListing = async (listing: MarketListing) => {
    setActionLoadingId(listing.id);
    try {
      const { error } = await supabase
        .from('market_listings')
        .update({ status: 'approved', updated_at: new Date().toISOString() })
        .eq('id', listing.id);

      if (!error) {
        setListings((prev) =>
          prev.map((l) => (l.id === listing.id ? { ...l, status: 'approved' } : l))
        );

        // Send Automated WhatsApp Alert to Seller
        const cleanPhone = listing.seller_whatsapp.replace(/\D/g, '').slice(-10);
        const text = encodeURIComponent(
          `🎉 *வணக்கம் ${listing.seller_name}!*\n\nஉங்களுடைய "${listing.title}" (விலை: ₹${listing.price} / ${listing.unit.replace('per_', '')}) SuprO DealO உள்ளூர் சந்தையில் *APPROVED & LIVE* செய்யப்பட்டது!\n\nபின்கோடு: ${listing.pincode}\nவாடிக்கையாளர்கள் உங்களை வாட்ஸ்அப் மற்றும் யுபிஐ மூலம் நேரடியாக தொடர்புகொள்வார்கள்.`
        );
        window.open(`https://wa.me/91${cleanPhone}?text=${text}`, '_blank');
      }
    } catch (e) {
      console.error('Approval error:', e);
    } finally {
      setActionLoadingId(null);
    }
  };

  // 1-Click Reject Listing
  const handleRejectListing = async (id: string) => {
    setActionLoadingId(id);
    try {
      const { error } = await supabase
        .from('market_listings')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', id);

      if (!error) {
        setListings((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status: 'rejected' } : l))
        );
      }
    } catch (e) {
      console.error('Reject error:', e);
    } finally {
      setActionLoadingId(null);
    }
  };

  // 1-Click Delete Listing
  const handleDeleteListing = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    setActionLoadingId(id);
    try {
      const { error } = await supabase.from('market_listings').delete().eq('id', id);
      if (!error) {
        setListings((prev) => prev.filter((l) => l.id !== id));
      }
    } catch (e) {
      console.error('Delete error:', e);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Unique Pincodes from listings
  const availablePincodes = useMemo(() => {
    const pins = Array.from(new Set(listings.map((l) => l.pincode).filter(Boolean)));
    return pins.sort();
  }, [listings]);

  // Filtered Listings
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      if (selectedPincode.trim().length > 0 && !item.pincode.startsWith(selectedPincode.trim()))
        return false;
      if (searchListing.trim().length > 0) {
        const q = searchListing.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesSeller = item.seller_name.toLowerCase().includes(q);
        const matchesPhone = item.seller_phone.includes(q);
        const matchesLoc = (item.location_name || '').toLowerCase().includes(q);
        const matchesPin = item.pincode.includes(q);
        if (!matchesTitle && !matchesSeller && !matchesPhone && !matchesLoc && !matchesPin)
          return false;
      }
      return true;
    });
  }, [listings, statusFilter, categoryFilter, selectedPincode, searchListing]);

  // Filtered Providers
  const filteredProviders = useMemo(() => {
    return providers.filter(
      (p) =>
        !searchProvider ||
        p.full_name?.toLowerCase().includes(searchProvider.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchProvider.toLowerCase()) ||
        p.phone?.includes(searchProvider) ||
        p.pincode?.includes(searchProvider)
    );
  }, [providers, searchProvider]);

  return (
    <div className="flex h-full flex-col p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            Service Providers & DealO Trading Hub
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pincode-wise approval of local farmer goods, cattle, cereals, and user provider accounts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              fetchProviders();
              fetchListings();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card text-sm text-foreground hover:bg-muted font-bold transition shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${(loadingProviders || loadingListings) ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-1">
        <button
          onClick={() => setActiveTab('dealo')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition-all ${
            activeTab === 'dealo'
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          DealO Goods & Trader Approvals
          {listings.filter((l) => l.status === 'pending').length > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-amber-500 text-slate-900 font-extrabold">
              {listings.filter((l) => l.status === 'pending').length} PENDING
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('providers')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition-all ${
            activeTab === 'providers'
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <Users className="w-4 h-4" />
          Registered Users & Providers ({providers.length})
        </button>
      </div>

      {/* ─── TAB 1: DEALO TRADER APPROVALS & PINCODE FILTER ─── */}
      {activeTab === 'dealo' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
              <p className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                Pending Verification
              </p>
              <p className="text-2xl font-black mt-1 text-amber-500">
                {listings.filter((l) => l.status === 'pending').length}
              </p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
              <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">
                Approved & Live
              </p>
              <p className="text-2xl font-black mt-1 text-emerald-500">
                {listings.filter((l) => l.status === 'approved').length}
              </p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Total Listings
              </p>
              <p className="text-2xl font-black mt-1 text-foreground">{listings.length}</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
              <p className="text-xs font-bold text-primary uppercase tracking-wider">
                Active Pincodes
              </p>
              <p className="text-2xl font-black mt-1 text-primary">{availablePincodes.length}</p>
            </div>
          </div>

          {/* Pincode & Category Search Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 bg-card border border-border p-4 rounded-2xl shadow-sm">
            {/* Text Search */}
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search goods, cow, grains, trader name, phone..."
                value={searchListing}
                onChange={(e) => setSearchListing(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm font-medium focus:outline-none focus:border-primary transition"
              />
            </div>

            {/* Pincode Filter */}
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <select
                value={selectedPincode}
                onChange={(e) => setSelectedPincode(e.target.value)}
                className="px-3 py-2.5 bg-background border border-border rounded-xl text-sm font-bold text-foreground focus:outline-none focus:border-primary"
              >
                <option value="">All Pincodes ({availablePincodes.length})</option>
                {availablePincodes.map((pin) => (
                  <option key={pin} value={pin}>
                    Pincode {pin}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2.5 bg-background border border-border rounded-xl text-sm font-bold text-foreground focus:outline-none focus:border-primary"
            >
              <option value="all">All Categories</option>
              <option value="livestock">🐄 Livestock (மாடு/ஆடு)</option>
              <option value="cereals">🌾 Grains & Crops (தானியங்கள்)</option>
              <option value="farm_produce">🥦 Farm Produce (உழவர் சந்தை)</option>
              <option value="machinery_tools">🚜 Tools & Machinery (கருவிகள்)</option>
              <option value="general_shop">🏪 Local Shops (கடைகள்)</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2.5 bg-background border border-border rounded-xl text-sm font-bold text-foreground focus:outline-none focus:border-primary"
            >
              <option value="all">All Statuses</option>
              <option value="pending">🟡 Pending Approvals</option>
              <option value="approved">🟢 Approved & Live</option>
              <option value="sold">⚪ Sold Out</option>
            </select>
          </div>

          {/* Quick Pincode Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-muted-foreground uppercase mr-1">Quick Hubs:</span>
            {['', '614904', '620001', '614601', '613001', '625001'].map((pin) => (
              <button
                key={pin || 'all'}
                onClick={() => setSelectedPincode(pin)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  selectedPincode === pin
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {pin ? `📍 ${pin}` : '🌟 All Tamil Nadu'}
              </button>
            ))}
          </div>

          {/* Listings Table / Cards */}
          {loadingListings ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground font-bold">
              <RefreshCw className="w-6 h-6 animate-spin mr-3 text-primary" />
              Loading DealO market listings & approvals...
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-2xl text-muted-foreground p-8 text-center">
              <ShoppingBag className="w-12 h-12 mb-3 opacity-30 text-primary" />
              <p className="text-lg font-black text-foreground">No Market Listings Found</p>
              <p className="text-sm mt-1">
                {selectedPincode || searchListing || statusFilter !== 'all'
                  ? 'No items match your active filters. Try resetting the Pincode or search term.'
                  : 'No trade goods or livestock registered yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-muted/50 border-b border-border text-xs font-black uppercase text-muted-foreground tracking-wider">
                  <tr>
                    <th className="p-4">Goods Item & Category</th>
                    <th className="p-4">Price Tag & Unit</th>
                    <th className="p-4">Trader Details & UPI</th>
                    <th className="p-4">Pincode & Location</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Approval Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredListings.map((item) => {
                    const catMeta = CATEGORY_NAMES[item.category] || {
                      label: item.category,
                      icon: '📦',
                      color: 'text-foreground',
                    };
                    const cleanPhone = item.seller_whatsapp.replace(/\D/g, '').slice(-10);

                    return (
                      <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                        {/* Goods Item */}
                        <td className="p-4">
                          <div className="flex items-start gap-3">
                            <span className="text-2xl mt-0.5">{catMeta.icon}</span>
                            <div>
                              <p className="font-extrabold text-foreground leading-snug">
                                {item.title}
                              </p>
                              <span className="inline-block mt-1 text-xs font-bold text-muted-foreground">
                                {catMeta.label}
                              </span>
                              {item.description && (
                                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="p-4">
                          <p className="text-base font-black text-primary">
                            ₹{item.price.toLocaleString('en-IN')}
                          </p>
                          <p className="text-xs text-muted-foreground font-semibold">
                            /{item.unit.replace('per_', '')} • Stock: {item.quantity || 1}
                          </p>
                        </td>

                        {/* Trader Contact */}
                        <td className="p-4">
                          <p className="font-bold text-foreground">{item.seller_name}</p>
                          <a
                            href={`https://wa.me/91${cleanPhone}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-500 hover:underline mt-0.5"
                          >
                            <MessageSquare className="w-3 h-3" />
                            +91 {cleanPhone}
                          </a>
                          {item.seller_upi && (
                            <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                              UPI: <span className="text-foreground">{item.seller_upi}</span>
                            </p>
                          )}
                        </td>

                        {/* Pincode & Location */}
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-primary/10 text-primary border border-primary/20">
                            <MapPin className="w-3 h-3" />
                            {item.pincode}
                          </span>
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.district || item.location_name || 'Tamil Nadu'}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="p-4">
                          {item.status === 'pending' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/10 text-amber-500 border border-amber-500/30">
                              <Clock className="w-3.5 h-3.5" />
                              PENDING
                            </span>
                          ) : item.status === 'approved' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              APPROVED LIVE
                            </span>
                          ) : item.status === 'sold' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-400 border border-slate-500/30">
                              <CheckCircle className="w-3.5 h-3.5" />
                              SOLD
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/30">
                              <XCircle className="w-3.5 h-3.5" />
                              REJECTED
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {item.status !== 'approved' && (
                              <button
                                onClick={() => handleApproveListing(item)}
                                disabled={actionLoadingId === item.id}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm transition"
                                title="Approve & Send WhatsApp Live Alert"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Approve
                              </button>
                            )}

                            {item.status === 'pending' && (
                              <button
                                onClick={() => handleRejectListing(item.id)}
                                disabled={actionLoadingId === item.id}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-sm transition"
                                title="Reject Listing"
                              >
                                <X className="w-3.5 h-3.5" />
                                Reject
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteListing(item.id)}
                              disabled={actionLoadingId === item.id}
                              className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition"
                              title="Delete Listing"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: REGISTERED PROVIDERS & USERS ─── */}
      {activeTab === 'providers' && (
        <div className="space-y-6">
          {/* Search */}
          <input
            type="text"
            placeholder="Search by name, email, phone or pincode..."
            value={searchProvider}
            onChange={(e) => setSearchProvider(e.target.value)}
            className="w-full max-w-md px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm font-medium focus:outline-none focus:border-primary transition shadow-sm"
          />

          {/* Table */}
          {loadingProviders ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              <RefreshCw className="w-6 h-6 animate-spin mr-3 text-primary" />
              Loading providers...
            </div>
          ) : filteredProviders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-2xl text-muted-foreground p-8 text-center">
              <Users className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-lg font-black text-foreground">No providers found</p>
              <p className="text-sm mt-1">
                {searchProvider ? 'Try a different search term.' : 'No users registered yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border text-xs font-black uppercase text-muted-foreground tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Contact</th>
                    <th className="px-4 py-3 text-left">Location & Pincode</th>
                    <th className="px-4 py-3 text-left">Role</th>
                    <th className="px-4 py-3 text-left">Profile Status</th>
                    <th className="px-4 py-3 text-left">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProviders.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-bold text-foreground">
                        {p.full_name || <span className="text-muted-foreground italic">Unnamed</span>}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground space-y-0.5">
                        {p.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3 h-3 text-blue-500" />
                            {p.email}
                          </div>
                        )}
                        {p.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-emerald-500" />
                            {p.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {p.pincode ? (
                          <span className="font-bold text-foreground">📍 {p.pincode} • </span>
                        ) : null}
                        {p.location || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                          {p.role || 'User'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {p.profile_complete ? (
                          <span className="flex items-center gap-1 text-emerald-500 text-xs font-bold">
                            <CheckCircle className="w-3.5 h-3.5" /> Complete
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                            <XCircle className="w-3.5 h-3.5" /> Incomplete
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {new Date(p.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
