'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef } from 'react';
import nextDynamic from 'next/dynamic';
import { 
  Navigation, MapPin, CheckCircle, AlertCircle, Star, Search, 
  Phone, MessageCircle, Clock, Shield, Award, RotateCcw, User 
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// Dynamically import Map so it only renders on client
const RideMap = nextDynamic(() => import('@/components/GoogleRideMap'), { ssr: false });

const supabase = createClient();

interface VehicleCategory {
  id: string;
  name: string;
  tamilName: string;
  icon: string;
  baseFare: number;
  perKm: number;
  capacity: string;
  desc: string;
}

const VEHICLE_CATEGORIES: VehicleCategory[] = [
  { id: 'bikeo', name: 'BikeO', tamilName: 'பைக்', icon: '🏍️', baseFare: 25, perKm: 7, capacity: '1 Person', desc: 'Fast & Affordable' },
  { id: 'autoo', name: 'AutoO', tamilName: 'ஆட்டோ', icon: '🛺', baseFare: 40, perKm: 12, capacity: '3 Persons', desc: 'Everyday Travel' },
  { id: 'minio', name: 'MiniO', tamilName: 'மினி கார்', icon: '🚗', baseFare: 80, perKm: 14, capacity: '4 Persons', desc: 'AC Hatchback' },
  { id: 'primeo', name: 'PrimeO', tamilName: 'பிரைம் கார்', icon: '🚙', baseFare: 120, perKm: 18, capacity: '4 Persons', desc: 'Top Rated Sedans' },
  { id: 'xlo', name: 'XL SUV', tamilName: 'எஸ்யூவி', icon: '🚐', baseFare: 160, perKm: 22, capacity: '6 Persons', desc: 'Spacious Family SUV' },
  { id: 'aceo', name: 'AceO', tamilName: 'டாடா ஏஸ்', icon: '🚚', baseFare: 200, perKm: 25, capacity: '750 kg', desc: 'Mini Goods / Mandi' },
  { id: 'trucko', name: 'TruckO', tamilName: 'லாரி', icon: '🚛', baseFare: 400, perKm: 45, capacity: '5 Tons', desc: 'Heavy Goods Transport' },
  { id: 'tractoro', name: 'TractorO', tamilName: 'டிராக்டர்', icon: '🚜', baseFare: 450, perKm: 50, capacity: 'Field Work', desc: 'Plowing & Agri Transport' },
  { id: 'harvestero', name: 'HarvesterO', tamilName: 'அறுவடை இயந்திரம்', icon: '🌾', baseFare: 800, perKm: 0, capacity: 'Farm', desc: 'Paddy & Crop Harvest' },
  { id: 'buso', name: 'BusO', tamilName: 'பஸ்', icon: '🚌', baseFare: 1200, perKm: 60, capacity: '40 Persons', desc: 'Group & Function Travel' },
  { id: 'ambulanceo', name: 'AmbulanceO', tamilName: 'ஆம்புலன்ஸ்', icon: '🚑', baseFare: 0, perKm: 0, capacity: 'Emergency', desc: 'Free 24/7 Emergency' },
];

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function RideOBookingPage() {
  const [pickup, setPickup] = useState<[number, number] | null>(null);
  const [dropoff, setDropoff] = useState<[number, number] | null>(null);
  const [pickupAddress, setPickupAddress] = useState('Locating your position...');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingLoc, setIsSearchingLoc] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<VehicleCategory>(VEHICLE_CATEGORIES[0]);
  const [distanceKm, setDistanceKm] = useState(3.5);
  const [estimatedFare, setEstimatedFare] = useState(50);

  // Ride State
  const [rideState, setRideState] = useState<'IDLE' | 'SEARCHING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED'>('IDLE');
  const [currentRide, setCurrentRide] = useState<any>(null);
  const [searchCountdown, setSearchCountdown] = useState(30);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingStars, setRatingStars] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Locate User on Mount
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setPickup([lat, lng]);
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=16`);
            const data = await res.json();
            if (data.display_name) {
              setPickupAddress(data.display_name.split(',').slice(0, 3).join(', ').trim());
            } else {
              setPickupAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
            }
          } catch {
            setPickupAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          }
        },
        () => {
          setPickup([10.7905, 78.7047]); // Default Thanjavur / Trichy
          setPickupAddress('Thanjavur, Tamil Nadu');
        },
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // 2. Fare Calculation
  useEffect(() => {
    if (pickup && dropoff) {
      const dist = Math.max(1.0, Number(getDistanceKm(pickup[0], pickup[1], dropoff[0], dropoff[1]).toFixed(1)));
      setDistanceKm(dist);
      let fare = selectedCategory.baseFare + Math.round(selectedCategory.perKm * dist);
      if (selectedCategory.id === 'ambulanceo') fare = 0;
      setEstimatedFare(fare);
    }
  }, [pickup, dropoff, selectedCategory]);

  // 3. Search Dropoff Location
  const handleSearchDropoff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearchingLoc(true);

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery + ', Tamil Nadu, India')}&format=json&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setDropoff([lat, lon]);
        setDropoffAddress(data[0].display_name.split(',').slice(0, 3).join(', ').trim());
      } else {
        alert('Could not locate that address. Please try another landmark or town.');
      }
    } catch {
      alert('Error searching for location.');
    } finally {
      setIsSearchingLoc(false);
    }
  };

  // 4. Book Ride
  const handleBookRide = async () => {
    if (!pickup || !dropoff) {
      alert('Please enter a destination first.');
      return;
    }

    setRideState('SEARCHING');
    setSearchCountdown(30);

    const otp = String(1000 + Math.floor(Math.random() * 9000));
    const { data: userAuth } = await supabase.auth.getUser();
    const passengerPhone = userAuth?.user?.phone || '9876543210';
    const passengerName = userAuth?.user?.user_metadata?.full_name || 'Passenger';

    try {
      const { data: rideRecord, error } = await supabase
        .from('rides')
        .insert({
          passenger_phone: passengerPhone,
          passenger_name: passengerName,
          pickup_location: {
            lat: pickup[0],
            lng: pickup[1],
            address: pickupAddress
          },
          drop_location: {
            lat: dropoff[0],
            lng: dropoff[1],
            address: dropoffAddress,
            distance_km: distanceKm
          },
          driver_phone: '916381029380',
          vehicle_category: selectedCategory.id,
          fare: estimatedFare,
          status: 'pending',
          otp: otp,
          payment_mode: 'upi',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentRide(rideRecord);

      // Start 1.5s active polling fallback
      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = setInterval(async () => {
        try {
          const { data } = await supabase.from('rides').select('*').eq('id', rideRecord.id).maybeSingle();
          if (data) handleRideUpdate(data);
        } catch (_) {}
      }, 1500);

      // Start Realtime channel
      supabase
        .channel(`ride-status-${rideRecord.id}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rides', filter: `id=eq.${rideRecord.id}` }, (payload) => {
          handleRideUpdate(payload.new);
        })
        .subscribe();

      // Start 300s (5:00 min) countdown with auto-expiry
      setSearchCountdown(300);
      if (countdownRef.current) clearInterval(countdownRef.current);
      countdownRef.current = setInterval(() => {
        setSearchCountdown((prev) => {
          if (prev <= 1) {
            if (countdownRef.current) clearInterval(countdownRef.current);
            if (pollingRef.current) clearInterval(pollingRef.current);
            supabase.from('rides').update({ status: 'expired' }).eq('id', rideRecord.id).then(() => {});
            alert('Ride Request Expired (5:00 mins)\n\nNo driver accepted your request within 5 minutes. Please try again.');
            setRideState('IDLE');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Webhook broadcast
      fetch('/api/rides/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ride_id: rideRecord.id,
          customer_name: passengerName,
          customer_phone: passengerPhone,
          pickup: pickupAddress,
          dropoff: dropoffAddress,
          fare: estimatedFare,
          vehicle: selectedCategory.name
        })
      }).catch(() => {});
    } catch (err: any) {
      alert(`Booking Failed: ${err.message}`);
      setRideState('IDLE');
    }
  };

  const handleRideUpdate = (ride: any) => {
    setCurrentRide(ride);
    if (ride.status === 'accepted' || ride.status === 'driver_arrived') {
      if (countdownRef.current) clearInterval(countdownRef.current);
      setRideState('ACCEPTED');
    } else if (ride.status === 'in_progress') {
      setRideState('IN_PROGRESS');
    } else if (ride.status === 'completed') {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      setRideState('COMPLETED');
      setShowRatingModal(true);
    } else if (ride.status === 'cancelled') {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      setRideState('IDLE');
      setCurrentRide(null);
      alert('Ride request was cancelled.');
    }
  };

  const handleCancelRequest = async () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (currentRide?.id) {
      await supabase.from('rides').update({ status: 'cancelled' }).eq('id', currentRide.id);
    }
    setRideState('IDLE');
    setCurrentRide(null);
  };

  const submitRating = async () => {
    setShowRatingModal(false);
    setRideState('IDLE');
    setCurrentRide(null);
    setDropoff(null);
    setDropoffAddress('');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-slate-100 flex flex-col">
      {/* ─── TOP BAR ─── */}
      <div className="border-b border-slate-800 bg-[#0A0F1E]/95 backdrop-blur px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">🚕</span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              RideO <span className="text-xs bg-emerald-500/20 text-emerald-400 font-normal px-2.5 py-0.5 rounded-full border border-emerald-500/30">Live Dispatch</span>
            </h1>
            <p className="text-xs text-slate-400">11 Vehicle Categories • Instant WhatsApp & Driver Connect</p>
          </div>
        </div>

        {/* Search destination input */}
        <form onSubmit={handleSearchDropoff} className="flex gap-2 w-full md:w-96">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Enter drop-off destination..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            disabled={isSearchingLoc}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 font-semibold text-black rounded-xl text-sm transition-all"
          >
            {isSearchingLoc ? 'Locating...' : 'Set Drop'}
          </button>
        </form>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* MAP VIEW */}
        <div className="lg:col-span-2 bg-slate-900/60 rounded-3xl border border-slate-800 p-2 overflow-hidden min-h-[420px] relative">
          <RideMap pickup={pickup} dropoff={dropoff} liveDriver={null} routeCoordinates={[]} />
          
          {/* Pickup & Dropoff Address Badge */}
          <div className="absolute top-6 left-6 right-6 md:right-auto md:w-96 bg-[#0A0F1E]/90 backdrop-blur-md p-4 rounded-2xl border border-slate-800 shadow-2xl space-y-2 pointer-events-none">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-slate-400">Pickup:</span>
              <span className="text-white font-medium truncate">{pickupAddress}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="text-slate-400">Drop-off:</span>
              <span className="text-white font-medium truncate">{dropoffAddress || 'Not selected yet'}</span>
            </div>
          </div>
        </div>

        {/* BOOKING & TRACKING CONTROL PANEL */}
        <div className="bg-[#111827] rounded-3xl border border-slate-800 p-6 flex flex-col justify-between">
          {rideState === 'IDLE' && (
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg text-white">Select Vehicle</h3>
                {dropoff && (
                  <span className="text-emerald-400 font-bold text-sm">{distanceKm} km • ₹{estimatedFare}</span>
                )}
              </div>

              {/* 11 CATEGORY GRID */}
              <div className="grid grid-cols-3 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
                {VEHICLE_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory.id === cat.id;
                  const fare = cat.id === 'ambulanceo' ? 0 : cat.baseFare + Math.round(cat.perKm * distanceKm);

                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat)}
                      className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                        isSelected
                          ? 'bg-emerald-500/15 border-emerald-500 text-white ring-1 ring-emerald-500'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <span className="text-2xl">{cat.icon}</span>
                      <div className="mt-2">
                        <div className="font-bold text-xs">{cat.name}</div>
                        <div className="text-[10px] text-emerald-400 font-semibold">{cat.id === 'ambulanceo' ? 'FREE' : `₹${fare}`}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* BOOK BUTTON */}
              <button
                onClick={handleBookRide}
                disabled={!dropoff}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 text-black font-bold rounded-2xl text-base transition-all shadow-lg shadow-emerald-500/20"
              >
                {!dropoff ? 'Search Destination Above' : `Book ${selectedCategory.name} • ₹${estimatedFare}`}
              </button>
            </div>
          )}

          {/* SEARCHING STATE */}
          {rideState === 'SEARCHING' && (
            <div className="flex flex-col items-center justify-center py-10 space-y-6 text-center">
              <div className="w-16 h-16 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin"></div>
              <div>
                <h3 className="text-xl font-bold text-white">Searching for Nearby {selectedCategory.name}...</h3>
                <p className="text-sm text-slate-400 mt-1">
                  Connecting with nearby drivers • <span className="text-emerald-400 font-mono font-bold">{Math.floor(searchCountdown / 60)}:{String(searchCountdown % 60).padStart(2, '0')}</span> remaining (5:00 auto-expiry)
                </p>
              </div>
              <button
                onClick={handleCancelRequest}
                className="px-6 py-2.5 border border-rose-500/50 text-rose-400 hover:bg-rose-500/10 font-semibold rounded-xl text-sm transition-all"
              >
                Cancel Request
              </button>
            </div>
          )}

          {/* ACCEPTED / IN PROGRESS STATE */}
          {(rideState === 'ACCEPTED' || rideState === 'IN_PROGRESS') && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold rounded-lg text-xs">
                  {rideState === 'IN_PROGRESS' ? 'TRIP IN PROGRESS' : 'DRIVER ON THE WAY'}
                </span>
                <span className="text-xl font-bold text-white">₹{currentRide?.fare || estimatedFare}</span>
              </div>

              {/* DRIVER BADGE & OTP */}
              <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-lg">
                    👨‍✈️
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{currentRide?.driver_name || 'Driver Partner'}</h4>
                    <p className="text-xs text-slate-400">{currentRide?.vehicle_model || selectedCategory.name} • TN-49-2026</p>
                  </div>
                </div>

                <div className="text-center bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-xl">
                  <div className="text-[10px] font-bold text-emerald-400">TRIP OTP</div>
                  <div className="text-xl font-extrabold text-white tracking-widest">{currentRide?.otp || '1234'}</div>
                </div>
              </div>

              {/* CALL & WHATSAPP ACTIONS */}
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`tel:${currentRide?.driver_phone || '916381029380'}`}
                  className="py-3 bg-slate-800 hover:bg-slate-700 font-bold text-white rounded-xl text-center flex items-center justify-center gap-2 text-sm transition-all"
                >
                  <Phone className="w-4 h-4 text-emerald-400" /> Call Driver
                </a>
                <a
                  href={`https://wa.me/${(currentRide?.driver_phone || '916381029380').replace(/\D/g, '')}?text=${encodeURIComponent('Hi, I am waiting at pickup: ' + pickupAddress)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-3 bg-[#25D366] hover:bg-[#20bd5a] font-bold text-white rounded-xl text-center flex items-center justify-center gap-2 text-sm transition-all"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RATING MODAL */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 max-w-md w-full text-center space-y-5">
            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto" />
            <h3 className="text-2xl font-bold text-white">Trip Completed!</h3>
            <p className="text-sm text-slate-400">Total Fare Paid: ₹{currentRide?.fare || estimatedFare}</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setRatingStars(s)}>
                  <Star className={`w-8 h-8 ${s <= ratingStars ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
                </button>
              ))}
            </div>
            <button
              onClick={submitRating}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 font-bold text-black rounded-xl text-sm transition-all"
            >
              Submit Rating
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
