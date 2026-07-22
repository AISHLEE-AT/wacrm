'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { GoogleMap, useLoadScript, Marker, Polyline } from '@react-google-maps/api';
import { Navigation, ShieldAlert, Power, Compass, Car, Bike, Truck, MapPin, Search, ArrowRight, Zap, MessageSquare, Phone, Plus, CheckCircle } from 'lucide-react';
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
const libraries: any = ['places'];
const mapContainerStyle = { width: '100%', height: '100%', borderRadius: '12px' };
const defaultCenter = { lat: 13.0827, lng: 80.2707 }; // Chennai fallback

// Zero Google API Cost: Haversine Distance Formula
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 10) / 10;
}

// 6 Vehicle Transport Modes for Tamil Nadu & Beyond
const VEHICLE_CATEGORIES = [
  { id: 'bike', name: 'Bike / Scooty', icon: '🛵', baseFare: 30, perKm: 8, description: 'Short & quick travel' },
  { id: 'auto', name: 'Auto Rickshaw', icon: '🛺', baseFare: 40, perKm: 15, description: 'Local 3-wheeler commute' },
  { id: 'car', name: 'Car / Taxi / SUV', icon: '🚗', baseFare: 70, perKm: 20, description: 'Comfortable family ride' },
  { id: 'van', name: 'Van / Mini-Bus', icon: '🚐', baseFare: 150, perKm: 35, description: 'Group & outstation travel' },
  { id: 'bus', name: 'Bus / Travels', icon: '🚌', baseFare: 300, perKm: 50, description: 'Intercity Tamil Nadu transport' },
  { id: 'truck', name: 'Lorry / Truck', icon: '🚛', baseFare: 500, perKm: 75, description: 'Goods, heavy cargo & logistics' },
];

export default function RideODashboard() {
  const { user: currentUser, profile } = useAuth();
  const [isOnline, setIsOnline] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [destinationLocation, setDestinationLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('bike');
  const [extraTip, setExtraTip] = useState<number>(0);
  const [customTipInput, setCustomTipInput] = useState<string>('');
  const [isBooking, setIsBooking] = useState(false);
  const [activeRide, setActiveRide] = useState<any>(null);
  const [broadcastSent, setBroadcastSent] = useState(false);

  const mapRef = useRef<google.maps.Map | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  // Hardware Device GPS Fetch (Zero API Cost)
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCurrentLocation(coords);
        if (mapRef.current) mapRef.current.panTo(coords);
      },
      (err) => {
        console.warn('Geolocation fallback:', err.message);
        setCurrentLocation(defaultCenter);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCurrentLocation(coords);
      },
      (err) => console.warn(err),
      { enableHighAccuracy: true, maximumAge: 5000 }
    );

    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  // Distance calculation (Client-Side Math)
  useEffect(() => {
    if (currentLocation && destinationLocation) {
      const dist = calculateHaversineDistance(
        currentLocation.lat, currentLocation.lng,
        destinationLocation.lat, destinationLocation.lng
      );
      setDistanceKm(dist);
    } else {
      setDistanceKm(null);
    }
  }, [currentLocation, destinationLocation]);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const handleCenterOnUser = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.panTo(currentLocation);
      mapRef.current.setZoom(15);
    }
  };

  const handleDestinationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !currentLocation) return;

    const offsetLat = currentLocation.lat + (searchQuery.length % 5 + 2) * 0.015;
    const offsetLng = currentLocation.lng + (searchQuery.length % 7 + 3) * 0.015;
    const newDest = { lat: offsetLat, lng: offsetLng };
    
    setDestinationLocation(newDest);
    if (mapRef.current) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(currentLocation);
      bounds.extend(newDest);
      mapRef.current.fitBounds(bounds);
    }
  };

  const currentCategoryObj = VEHICLE_CATEGORIES.find(c => c.id === selectedCategory) || VEHICLE_CATEGORIES[0];
  const baseAppFare = distanceKm !== null ? Math.round(currentCategoryObj.baseFare + distanceKm * currentCategoryObj.perKm) : 0;
  const totalOfferedFare = baseAppFare + extraTip;

  // Generate WhatsApp Operator Broadcast Link
  const getWhatsAppBroadcastUrl = () => {
    const customerName = profile?.full_name || currentUser?.email?.split('@')[0] || 'Customer';
    const customerPhone = profile?.phone || 'Contact via App';
    const locationMapUrl = currentLocation ? `https://maps.google.com/?q=${currentLocation.lat},${currentLocation.lng}` : 'Live Location';
    
    const text = `🚨 *RIDEO TRANSPORT & LOGISTICS REQUEST* 🚨\n\n` +
      `👤 *Customer:* ${customerName}\n` +
      `📞 *Phone:* ${customerPhone}\n` +
      `🚚 *Vehicle Needed:* ${currentCategoryObj.icon} ${currentCategoryObj.name}\n` +
      `📍 *Pickup GPS:* ${locationMapUrl}\n` +
      `🎯 *Destination:* ${searchQuery || 'Destination'}\n` +
      `📏 *Distance:* ${distanceKm || 0} km\n\n` +
      `💵 *App Fare:* ₹${baseAppFare}\n` +
      `➕ *Extra Offer/Tip:* ₹${extraTip}\n` +
      `💰 *TOTAL OFFERED PRICE:* ₹${totalOfferedFare}\n\n` +
      `👉 *Operators Please Reply or Call Customer to Commit Order!*`;

    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  };

  const handleBroadcastRequest = async () => {
    if (!currentLocation || !destinationLocation || !currentUser) return;
    setIsBooking(true);
    try {
      const { data, error } = await supabase.from('rides').insert({
        rider_id: currentUser.id,
        pickup_latitude: currentLocation.lat,
        pickup_longitude: currentLocation.lng,
        pickup_address: 'Live Device Location',
        dropoff_latitude: destinationLocation.lat,
        dropoff_longitude: destinationLocation.lng,
        dropoff_address: searchQuery || 'Destination',
        status: 'requested',
        fare: totalOfferedFare
      }).select().single();

      if (!error && data) {
        setActiveRide(data);
        setBroadcastSent(true);
        // Launch WhatsApp Broadcast
        window.open(getWhatsAppBroadcastUrl(), '_blank');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsBooking(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-foreground">
        <ShieldAlert className="w-12 h-12 text-primary mb-4" />
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p className="text-sm text-muted-foreground mt-1">Please sign in to access RideO.</p>
      </div>
    );
  }

  if (loadError) return <div className="p-8 text-center text-red-500">Error loading Google Maps.</div>;

  return (
    <div className="flex flex-col h-full space-y-6 max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Navigation className="w-7 h-7 text-primary" />
            RideO Transport & Logistics Network
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Tamil Nadu All-Vehicle Mode (Bike, Auto, Car, Van, Bus, Lorry) • Device GPS • WhatsApp Operator Broadcast
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCenterOnUser}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-xs font-semibold hover:bg-muted transition"
          >
            <Compass className="w-4 h-4 text-primary animate-pulse" />
            My Location
          </button>
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-xs transition ${
              isOnline ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30' : 'bg-muted text-muted-foreground'
            }`}
          >
            <Power className="w-4 h-4" />
            {isOnline ? 'GPS Active' : 'GPS Offline'}
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[500px]">
        {/* Left Control Panel */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {/* Destination Form */}
          <form onSubmit={handleDestinationSubmit} className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
              <div className="flex-1 truncate text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Source:</span> Device GPS Location
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
              <input
                type="text"
                placeholder="Destination (e.g. Madurai, Coimbatore, Hosur)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:border-primary transition"
              />
              <button
                type="submit"
                className="p-2.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition shrink-0"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* 6 Vehicle Category Selector */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Transport Category</h3>
            <div className="grid grid-cols-3 gap-2">
              {VEHICLE_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition ${
                      isSelected
                        ? 'border-primary bg-primary/15 text-primary font-bold shadow-sm'
                        : 'border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <span className="text-2xl mb-1">{cat.icon}</span>
                    <span className="text-xs text-center leading-tight">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fare Guidelines & Extra Offer Adder */}
          {distanceKm !== null && (
            <div className="bg-card border border-border rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between text-xs border-b border-border pb-2">
                <span className="text-muted-foreground">Distance: <strong className="text-foreground">{distanceKm} km</strong></span>
                <span className="text-muted-foreground">App Fare: <strong className="text-emerald-500 font-bold">₹{baseAppFare}</strong></span>
              </div>

              {/* Offer Extra to Driver / Operator */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Offer Extra to Operators (Incentivize Pickup)
                </label>
                <div className="flex items-center gap-2">
                  {[0, 20, 50, 100].map((tip) => (
                    <button
                      key={tip}
                      type="button"
                      onClick={() => { setExtraTip(tip); setCustomTipInput(''); }}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                        extraTip === tip && !customTipInput
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : 'border-border text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {tip === 0 ? 'No Tip' : `+₹${tip}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Total Offered Fare */}
              <div className="flex items-center justify-between bg-muted/40 p-3 rounded-xl border border-border">
                <span className="text-sm font-semibold">Total Price Offered:</span>
                <span className="text-xl font-bold text-emerald-500">₹{totalOfferedFare}</span>
              </div>

              {/* WhatsApp Broadcast Trigger Button */}
              <button
                onClick={handleBroadcastRequest}
                disabled={isBooking}
                className="w-full py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg disabled:opacity-50"
              >
                <MessageSquare className="w-5 h-5" />
                Broadcast Request on WhatsApp
              </button>
            </div>
          )}

          {/* Active Broadcast State */}
          {activeRide && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> Request Broadcasted
                </span>
                <span className="text-xs text-muted-foreground">Status: {activeRide.status}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Operators of <strong className="text-foreground">{currentCategoryObj.name}</strong> are reviewing your broadcast. They will call you or confirm via WhatsApp.
              </p>
              <a
                href={getWhatsAppBroadcastUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#25D366] hover:underline"
              >
                <MessageSquare className="w-4 h-4" /> Re-open WhatsApp Broadcast Payload
              </a>
            </div>
          )}
        </div>

        {/* Right Live Interactive Map */}
        <div className="lg:col-span-7 bg-card border border-border rounded-xl overflow-hidden relative min-h-[400px]">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={currentLocation || defaultCenter}
              zoom={14}
              onLoad={onMapLoad}
              options={{ disableDefaultUI: false, zoomControl: true, streetViewControl: false, mapTypeControl: false }}
            >
              {currentLocation && (
                <Marker
                  position={currentLocation}
                  title="My Live Location"
                  icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: '#10B981',
                    fillOpacity: 1,
                    strokeColor: '#FFFFFF',
                    strokeWeight: 3,
                  }}
                />
              )}

              {destinationLocation && (
                <Marker
                  position={destinationLocation}
                  title="Destination"
                  icon={{
                    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                    scale: 6,
                    fillColor: '#EF4444',
                    fillOpacity: 1,
                    strokeColor: '#FFFFFF',
                    strokeWeight: 2,
                  }}
                />
              )}

              {currentLocation && destinationLocation && (
                <Polyline
                  path={[currentLocation, destinationLocation]}
                  options={{ strokeColor: '#3B82F6', strokeOpacity: 0.8, strokeWeight: 5 }}
                />
              )}
            </GoogleMap>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">Loading Google Maps...</div>
          )}
        </div>
      </div>
    </div>
  );
}
