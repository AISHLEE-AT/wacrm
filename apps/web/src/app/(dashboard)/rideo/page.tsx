'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { GoogleMap, useLoadScript, Marker, Polyline } from '@react-google-maps/api';
import { Navigation, ShieldAlert, Power, Compass, Car, Bike, Truck, MapPin, Search, ArrowRight, MessageSquare, Phone, CheckCircle, Users, Clock, AlertCircle } from 'lucide-react';
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

// 6 Vehicle Transport Modes for Tamil Nadu & Beyond with Dynamic Search Radii
const VEHICLE_CATEGORIES = [
  { id: 'bike', name: 'Bike / Scooty', icon: '🛵', baseFare: 30, perKm: 8, radiusKm: 3 },
  { id: 'auto', name: 'Auto Rickshaw', icon: '🛺', baseFare: 40, perKm: 15, radiusKm: 3 },
  { id: 'car', name: 'Car / Taxi / SUV', icon: '🚗', baseFare: 70, perKm: 20, radiusKm: 5 },
  { id: 'van', name: 'Van / Mini-Bus', icon: '🚐', baseFare: 150, perKm: 35, radiusKm: 10 },
  { id: 'truck', name: 'Lorry / Truck', icon: '🚛', baseFare: 500, perKm: 75, radiusKm: 20 },
  { id: 'bus', name: 'Bus / Travels', icon: '🚌', baseFare: 300, perKm: 50, radiusKm: 50 },
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
  const [activeDrivers, setActiveDrivers] = useState<any[]>([]);

  const mapRef = useRef<google.maps.Map | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  // Hardware Device GPS Fetch (Zero API Cost)
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;

    const handleCoords = (pos: GeolocationPosition) => {
      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setCurrentLocation(coords);
      if (mapRef.current) {
        mapRef.current.panTo(coords);
        mapRef.current.setZoom(15);
      }
    };

    // Fast high accuracy attempt
    navigator.geolocation.getCurrentPosition(
      handleCoords,
      (err) => {
        console.warn('Geolocation fallback to coarse mode:', err.message);
        // Coarse fallback for quick mobile GPS lock
        navigator.geolocation.getCurrentPosition(
          handleCoords,
          () => setCurrentLocation(defaultCenter),
          { enableHighAccuracy: false, timeout: 5000 }
        );
      },
      { enableHighAccuracy: true, timeout: 4000, maximumAge: 0 }
    );

    watchIdRef.current = navigator.geolocation.watchPosition(
      handleCoords,
      (err) => console.warn(err),
      { enableHighAccuracy: true, maximumAge: 5000 }
    );

    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  // Fetch drivers from Supabase with status (Free vs Busy)
  useEffect(() => {
    const fetchActiveDrivers = async () => {
      try {
        const { data } = await supabase
          .from('drivers')
          .select('*');
        
        if (data && data.length > 0) {
          setActiveDrivers(data);
        } else {
          // Demo Tamil Nadu Transport Operators with Free / Busy status
          setActiveDrivers([
            { id: '1', name: 'Muthu Travels', phone: '916381029380', category: 'bus', vehicle_no: 'TN-39-B-8899', rating: 4.9, status: 'online' },
            { id: '2', name: 'Kumar Lorry Service', phone: '916381029380', category: 'truck', vehicle_no: 'TN-38-AX-5544', rating: 4.8, status: 'online' },
            { id: '3', name: 'Selvam Auto', phone: '916381029380', category: 'auto', vehicle_no: 'TN-37-Z-1234', rating: 4.7, status: 'busy', committed_to: 'Chennai -> Trichy Trip' },
            { id: '4', name: 'Vijay Bike Taxi', phone: '916381029380', category: 'bike', vehicle_no: 'TN-39-M-9988', rating: 5.0, status: 'online' },
          ]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchActiveDrivers();

    // Subscribe to driver status changes (Free vs Committed Busy)
    const channel = supabase
      .channel('public:drivers:status')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drivers' }, (payload) => {
        fetchActiveDrivers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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

  // Fully Automated WhatsApp Message Payload (Pickup GPS + Dropoff + 1-Click Device Navigation + Offered Fare)
  const getAutomatedDriverWhatsAppUrl = (driverPhone: string, driverName: string) => {
    const customerName = profile?.full_name || currentUser?.email?.split('@')[0] || 'Customer';
    const customerPhone = profile?.phone || 'Contact via App';
    const pickupGpsUrl = currentLocation 
      ? `https://www.google.com/maps/search/?api=1&query=${currentLocation.lat},${currentLocation.lng}` 
      : 'Device GPS Location';
    const dropoffGpsUrl = destinationLocation 
      ? `https://www.google.com/maps/search/?api=1&query=${destinationLocation.lat},${destinationLocation.lng}` 
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`;

    const turnByTurnNavUrl = (currentLocation && destinationLocation)
      ? `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.lat},${currentLocation.lng}&destination=${destinationLocation.lat},${destinationLocation.lng}&travelmode=driving`
      : pickupGpsUrl;

    const text = `🚨 *RIDEO TRIP & LOGISTICS BOOKING* 🚨\n\n` +
      `👋 *Hello ${driverName},*\n\n` +
      `👤 *Customer:* ${customerName}\n` +
      `📞 *Customer Call:* tel:${customerPhone}\n\n` +
      `📌 *LIVE PICKUP GPS:* ${pickupGpsUrl}\n` +
      `🎯 *DROPOFF GPS:* ${dropoffGpsUrl}\n` +
      `🧭 *1-CLICK DEVICE MAP NAVIGATION:* ${turnByTurnNavUrl}\n\n` +
      `📏 *TRIP DISTANCE:* ${distanceKm || 0} km\n` +
      `🚚 *VEHICLE NEEDED:* ${currentCategoryObj.icon} ${currentCategoryObj.name}\n\n` +
      `💵 *COMMITTED OFFERED AMOUNT:* ₹${totalOfferedFare}\n\n` +
      `👉 *Please tap the navigation link above or call customer to confirm this trip!*`;

    return `https://api.whatsapp.com/send?phone=${driverPhone.replace(/\D/g, '')}&text=${encodeURIComponent(text)}`;
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

  const maxRadiusKm = currentCategoryObj.radiusKm || 5;

  const filteredDrivers = activeDrivers.filter((d) => {
    // 1. Vehicle category matching
    const cat = d.vehicle_type || d.category;
    const categoryMatches = !cat || cat === selectedCategory;
    if (!categoryMatches) return false;

    // 2. Haversine distance radius filtering if coordinates exist
    const driverLat = d.pickup_latitude || d.lat;
    const driverLng = d.pickup_longitude || d.lng;
    if (currentLocation && driverLat && driverLng) {
      const dist = calculateHaversineDistance(
        currentLocation.lat,
        currentLocation.lng,
        Number(driverLat),
        Number(driverLng)
      );
      return dist <= maxRadiusKm;
    }

    return true;
  });

  return (
    <div className="flex flex-col h-full space-y-6 max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Navigation className="w-7 h-7 text-primary" />
            RideO Transport Network
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Real-Time Driver Status (Free vs Committed) • Auto WhatsApp Trip Payload • Zero API Cost
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

      {/* Main Grid */}
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

          {/* 6 Category Selector */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Vehicle Category</h3>
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
                    <span className="text-[10px] opacity-80 mt-1 font-mono">📍 {cat.radiusKm} km radius</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Distance, Fare & Live Driver List */}
          {distanceKm !== null && (
            <div className="bg-card border border-border rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between text-xs border-b border-border pb-2">
                <span className="text-muted-foreground">Distance: <strong className="text-foreground">{distanceKm} km</strong></span>
                <span className="text-muted-foreground">App Fare: <strong className="text-emerald-500 font-bold">₹{baseAppFare}</strong></span>
              </div>

              {/* Offer Extra */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Add Extra Offer Amount (+₹)
                </label>
                <div className="flex items-center gap-2">
                  {[0, 20, 50, 100].map((tip) => (
                    <button
                      key={tip}
                      type="button"
                      onClick={() => setExtraTip(tip)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                        extraTip === tip
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : 'border-border text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {tip === 0 ? 'Standard' : `+₹${tip}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Total Offered Fare */}
              <div className="flex items-center justify-between bg-muted/40 p-3 rounded-xl border border-border">
                <span className="text-sm font-semibold">Total Offered Rate:</span>
                <span className="text-xl font-bold text-emerald-500">₹{totalOfferedFare}</span>
              </div>

              {/* Live Driver List with Status (FREE vs COMMITTED BUSY) */}
              <div className="space-y-2 pt-2 border-t border-border">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-primary" /> Active Transport Operators</span>
                  <span className="text-[10px] text-muted-foreground">Auto-Fills GPS & Dropoff</span>
                </h4>

                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {filteredDrivers.map((driver) => {
                    const isBusy = driver.status === 'busy';
                    return (
                      <div key={driver.id} className="p-3 rounded-lg border border-border bg-background space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-foreground flex items-center gap-1.5">
                              {driver.name}
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                isBusy ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30' : 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                              }`}>
                                {isBusy ? 'Busy / Committed' : 'Free / Available'}
                              </span>
                            </p>
                            <p className="text-[10px] text-muted-foreground">{driver.vehicle_no || 'Reg Vehicle'} • ⭐ {driver.rating || 4.8}</p>
                          </div>

                          {!isBusy ? (
                            <a
                              href={getAutomatedDriverWhatsAppUrl(driver.phone || '916381029380', driver.name)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold flex items-center gap-1 transition shrink-0"
                            >
                              <MessageSquare className="w-3.5 h-3.5" /> Book via WhatsApp
                            </a>
                          ) : (
                            <span className="text-[11px] text-amber-500 font-semibold flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> On Active Trip
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
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
