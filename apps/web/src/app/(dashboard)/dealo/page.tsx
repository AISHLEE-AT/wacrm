'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { createClient } from '@/lib/supabase/client';
import { 
  ShoppingBag, Search, PlusCircle, Filter, MapPin, Phone, 
  MessageCircle, Tag, CheckCircle2, Share2, Sparkles, X, 
  ShieldCheck, Image as ImageIcon, Mic, Video, Camera, Navigation, Radius, Truck
} from 'lucide-react';
import { validateFullName, validateIndianPhone, validateUpiId } from '@/lib/validation';

const supabase = createClient();

const DEAL_CATEGORIES = [
  { id: 'all', name: 'அனைத்தும் (All)', icon: '🏪' },
  { id: 'electronics', name: 'மின்னணு & மொபைல் (Mobiles)', icon: '📱' },
  { id: 'vehicles', name: 'வாகனங்கள் (Vehicles)', icon: '🛵' },
  { id: 'agri', name: 'விவசாயப் பொருட்கள் (Agri)', icon: '🌾' },
  { id: 'household', name: 'வீட்டு உபயோகம் (Household)', icon: '🛋️' },
  { id: 'tools', name: 'இயந்திரங்கள் (Tools)', icon: '🛠️' },
  { id: 'services', name: 'சேவைகள் & வேலை (Services)', icon: '👨‍🔧' },
];

const RADIUS_OPTIONS = [
  { label: '5 km (Default)', value: 5 },
  { label: '10 km', value: 10 },
  { label: '20 km', value: 20 },
  { label: '50 km', value: 50 },
  { label: 'All Distance', value: 999 },
];

// Haversine distance formula in Km
function calculateDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

export default function DealOMarketplacePage() {
  const { user: currentUser, profile } = useAuth();

  const [activeTab, setActiveTab] = useState<'sell' | 'buy'>('sell');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pincodeFilter, setPincodeFilter] = useState<string>('');
  const [radiusKm, setRadiusKm] = useState<number>(5); // 5 km default radius!
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showPostModal, setShowPostModal] = useState<boolean>(false);
  const [postSubmitted, setPostSubmitted] = useState<boolean>(false);

  // Voice Recognition State
  const [isListeningTitle, setIsListeningTitle] = useState(false);
  const [isListeningDesc, setIsListeningDesc] = useState(false);

  // Post Deal Form State (with Tamil Title support)
  const [dealForm, setDealForm] = useState({
    type: 'sell' as 'sell' | 'buy',
    title: '',
    titleTamil: '',
    description: '',
    category: 'electronics',
    price: '',
    isNegotiable: true,
    imageUrl: '',
    pincode: '',
    locationName: 'Coimbatore, Tamil Nadu',
    lat: 11.0168,
    lng: 76.9558,
    name: profile?.full_name || '',
    phone: profile?.phone || currentUser?.phone || currentUser?.email?.split('@')[0] || '',
    upiId: '',
  });

  // Fetch Live Device GPS Coords
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserCoords(coords);
          setDealForm((prev) => ({ ...prev, lat: coords.lat, lng: coords.lng }));
        },
        (err) => console.warn('Geo position fetch:', err.message),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

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

  // Dynamic Category Auto-Selection based on User's Primary Goal / Role Point of View
  useEffect(() => {
    const userCategory = (profile as any)?.main_category || (currentUser as any)?.user_metadata?.category || '';
    if (userCategory) {
      const lowerCat = userCategory.toLowerCase();
      if (lowerCat.includes('farmer')) {
        setSelectedCategory('agri');
      } else if (lowerCat.includes('driver')) {
        setSelectedCategory('vehicles');
      } else if (lowerCat.includes('student') || lowerCat.includes('teacher') || lowerCat.includes('job')) {
        setSelectedCategory('services');
      } else if (lowerCat.includes('shopper') || lowerCat.includes('seller')) {
        setSelectedCategory('electronics');
      }
    }
  }, [profile, currentUser]);

  // Tamil Voice Recognition Trigger (குரல் தட்டச்சு)
  const startTamilSpeech = (field: 'title' | 'description') => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('தமிழ் குரல் தட்டச்சு பெற Chrome / Edge உலாவியைப் பயன்படுத்தவும். (Speech recognition requires Chrome/Edge).');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ta-IN'; // Tamil (India)
    recognition.interimResults = false;

    if (field === 'title') setIsListeningTitle(true);
    else setIsListeningDesc(true);

    recognition.onend = () => {
      setIsListeningTitle(false);
      setIsListeningDesc(false);
    };

    recognition.onerror = (err: any) => {
      console.error('Speech recognition error:', err);
      setIsListeningTitle(false);
      setIsListeningDesc(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (field === 'title') {
        setDealForm((prev) => ({
          ...prev,
          title: prev.title ? `${prev.title} (${transcript})` : transcript,
          titleTamil: transcript,
        }));
      } else {
        setDealForm((prev) => ({
          ...prev,
          description: prev.description ? `${prev.description} ${transcript}` : transcript,
        }));
      }
    };

    recognition.start();
  };

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

    if (!dealForm.title.trim() || dealForm.title.trim().length < 3) {
      alert('⚠️ Please enter a clear title in English or Tamil.');
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
        title_tamil: dealForm.titleTamil || dealForm.title,
        description: dealForm.description.trim(),
        category: dealForm.category,
        price: parseFloat(dealForm.price) || 0,
        is_negotiable: dealForm.isNegotiable,
        images: dealForm.imageUrl ? [dealForm.imageUrl] : [],
        pincode: dealForm.pincode || '641001',
        location_name: dealForm.locationName,
        lat: dealForm.lat || 11.0168,
        lng: dealForm.lng || 76.9558,
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

  // WhatsApp Contact Handlers
  const openWhatsAppDealChat = (deal: any) => {
    const cleanPhone = deal.phone.replace(/\D/g, '').slice(-10);
    const message = encodeURIComponent(
      `🛍️ *FAGO DealO P2P Trade Inquiry*\n\n` +
      `வணக்கம் *${deal.seller_name}*,\n` +
      `I am interested in your item on *FAGO DealO*:\n` +
      `📌 *${deal.title}*\n` +
      `💰 Price: ₹${deal.price} ${deal.is_negotiable ? '(Negotiable)' : ''}\n` +
      `📍 Location: ${deal.location_name} (${deal.pincode})\n\n` +
      `Is this item available? Let's talk!`
    );
    window.open(`https://wa.me/91${cleanPhone}?text=${message}`, '_blank');
  };

  const askForPhotosOnWhatsApp = (deal: any) => {
    const cleanPhone = deal.phone.replace(/\D/g, '').slice(-10);
    const msg = encodeURIComponent(
      `📸 *Request for Item Live Photos & Videos*\n\nHi ${deal.seller_name}, I saw *${deal.title}* on FAGO DealO.\nCould you please send me 2-3 live photos or a short video recording of the item?`
    );
    window.open(`https://wa.me/91${cleanPhone}?text=${msg}`, '_blank');
  };

  const requestVideoCallInspection = (deal: any) => {
    const cleanPhone = deal.phone.replace(/\D/g, '').slice(-10);
    const msg = encodeURIComponent(
      `📹 *WhatsApp Video Call Live Inspection*\n\nHi ${deal.seller_name}, can we have a quick WhatsApp Video Call to inspect *${deal.title}* live?`
    );
    window.open(`https://wa.me/91${cleanPhone}?text=${msg}`, '_blank');
  };

  const makePhoneCall = (deal: any) => {
    const cleanPhone = deal.phone.replace(/\D/g, '').slice(-10);
    window.open(`tel:+91${cleanPhone}`, '_self');
  };

  const shareDealOnWhatsApp = (deal: any) => {
    const text = encodeURIComponent(
      `🔥 *Local P2P Deal on FAGO DealO*:\n\n` +
      `*${deal.title}*\n` +
      `💰 Price: ₹${deal.price}\n` +
      `📍 Location: ${deal.location_name}\n` +
      `📞 Contact Seller: https://wa.me/91${deal.phone}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // Filter Deals by Search, Pincode, and Radius (5 km default)
  const filteredDeals = deals.filter((deal) => {
    const matchesSearch = deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          deal.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          deal.location_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPincode = !pincodeFilter || deal.pincode.includes(pincodeFilter);

    let matchesRadius = true;
    if (radiusKm !== 999 && userCoords && deal.lat && deal.lng) {
      const distance = calculateDistanceInKm(userCoords.lat, userCoords.lng, deal.lat, deal.lng);
      deal.distanceKm = distance;
      matchesRadius = distance <= radiusKm;
    } else if (userCoords && deal.lat && deal.lng) {
      deal.distanceKm = calculateDistanceInKm(userCoords.lat, userCoords.lng, deal.lat, deal.lng);
    }

    return matchesSearch && matchesPincode && matchesRadius;
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-cyan-950 text-white p-6 rounded-3xl border border-emerald-500/20 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
            <ShoppingBag className="w-4 h-4" />
            FAGO DealO • 5 km Radius Nearby P2P Marketplace (வியாபாரம்)
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
            Local Seller vs Buyer Hub <span className="text-sm font-normal text-emerald-400"> (தமிழ் குரல் தட்டச்சு)</span>
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
            Filter deals in your <strong>5 km radius</strong>. Type or speak in <strong>Tamil (குரல் தட்டச்சு)</strong>, request live photo/video inspections over WhatsApp, and pay 0-commission direct UPI!
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

      {/* Tabs & Distance Radius Filter Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 border-b border-border pb-4">
        {/* SELL vs BUY Tabs */}
        <div className="flex bg-muted/60 p-1.5 rounded-2xl border border-border w-full lg:w-auto">
          <button
            onClick={() => setActiveTab('sell')}
            className={`flex-1 lg:flex-initial px-6 py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'sell'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            🏷️ For Sale ({deals.length})
          </button>
          <button
            onClick={() => setActiveTab('buy')}
            className={`flex-1 lg:flex-initial px-6 py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'buy'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            🔍 Buyer Wants / Needs
          </button>
        </div>

        {/* 5 km Radius Selector */}
        <div className="flex items-center gap-2 bg-card border border-border px-3 py-1.5 rounded-2xl text-xs overflow-x-auto w-full lg:w-auto">
          <span className="font-bold text-emerald-400 flex items-center gap-1 whitespace-nowrap">
            <Navigation className="w-3.5 h-3.5" /> Radius:
          </span>
          {RADIUS_OPTIONS.map((r) => (
            <button
              key={r.value}
              onClick={() => setRadiusKm(r.value)}
              className={`px-3 py-1 rounded-xl font-bold transition whitespace-nowrap ${
                radiusKm === r.value
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'bg-muted/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Search & Pincode */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-48">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search / தேடுக..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-xs font-semibold focus:outline-none focus:border-primary"
            />
          </div>

          <div className="relative w-32">
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
          Searching nearby deals in {radiusKm === 999 ? 'all areas' : `${radiusKm} km radius`}...
        </div>
      ) : filteredDeals.length === 0 ? (
        <div className="bg-card border border-border rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto text-2xl font-bold">
            🏷️
          </div>
          <h3 className="text-lg font-bold text-foreground">No Deals Found in {radiusKm === 999 ? 'All Areas' : `${radiusKm} km Radius`}</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Try expanding your radius filter to 10 km or 20 km, or post a new deal!
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

                {/* Distance Badge */}
                {deal.distanceKm !== undefined && (
                  <div className="absolute bottom-3 left-3 bg-slate-950/90 text-emerald-400 font-bold text-[10px] px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
                    <Navigation className="w-3 h-3 text-emerald-400" />
                    {deal.distanceKm} km away
                  </div>
                )}

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
                  {deal.title_tamil && deal.title_tamil !== deal.title && (
                    <p className="text-xs font-semibold text-emerald-400 line-clamp-1 mt-0.5">
                      தமிழ்: {deal.title_tamil}
                    </p>
                  )}
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
                      <span>UPI: {deal.upi_id}</span>
                    </div>
                  )}
                </div>

                {/* Enhanced Contact Action Buttons */}
                <div className="space-y-2 pt-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => openWhatsAppDealChat(deal)}
                      className="py-2.5 px-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md transition"
                    >
                      <MessageCircle className="w-4 h-4 fill-white" />
                      Chat WhatsApp
                    </button>

                    <button
                      onClick={() => makePhoneCall(deal)}
                      className="py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md transition"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Call Seller
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => askForPhotosOnWhatsApp(deal)}
                      className="py-2 px-2.5 bg-card hover:bg-muted text-foreground font-semibold text-[11px] rounded-xl flex items-center justify-center gap-1 border border-border transition"
                    >
                      <Camera className="w-3.5 h-3.5 text-amber-400" />
                      Photos / Video
                    </button>

                    <button
                      onClick={() => requestVideoCallInspection(deal)}
                      className="py-2 px-2.5 bg-card hover:bg-muted text-foreground font-semibold text-[11px] rounded-xl flex items-center justify-center gap-1 border border-border transition"
                    >
                      <Video className="w-3.5 h-3.5 text-purple-400" />
                      Video Call
                    </button>
                  </div>

                  <a
                    href={`/rideo?pickup=${encodeURIComponent(deal.location_name)}&note=${encodeURIComponent(`Delivery for item: ${deal.title}`)}`}
                    className="w-full py-2 px-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md transition"
                  >
                    <Truck className="w-4 h-4 text-white" /> Book DriveO Delivery Vehicle
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Deal Modal with Tamil Voice Typing */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border max-w-xl w-full rounded-3xl p-6 space-y-6 shadow-2xl animate-fade-in my-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-xl font-black text-foreground flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-emerald-500" /> Post P2P Deal (தமிழ் குரல் தட்டச்சு)
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">List products for sale or post buyer requirements. Type or speak in Tamil.</p>
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
                <p className="text-xs text-muted-foreground">Your deal is now visible to buyers & sellers in your area.</p>
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

                {/* Title + Tamil Voice Typing Button */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Item Name (பொருள் பெயர் - Tamil / English) *
                    </label>
                    <button
                      type="button"
                      onClick={() => startTamilSpeech('title')}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
                        isListeningTitle
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5" />
                      {isListeningTitle ? 'பேசுங்கள்...' : '🎙️ குரல் தட்டச்சு (Voice)'}
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Enfield Bullet / ஆப்பிள் ஐபோன் 13 / 50 மூட்டை நெல்"
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
