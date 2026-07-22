// @ts-nocheck
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { GoogleMap, useLoadScript, Marker, Polyline } from '@react-google-maps/api';
import { Navigation, ShieldAlert, Power, Compass, Car, Bike, Truck, MapPin, Search, ArrowRight, MessageSquare, Phone, CheckCircle, Users, Clock, AlertCircle, Sparkles, Loader2, Edit3, ArrowUpDown, History, Bookmark } from 'lucide-react';
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

const PRESET_FAVORITE_PLACES = [
  { label: '🏠 Home', query: 'Chennai' },
  { label: '🏢 Office', query: 'TIDEL Park, OMR, Chennai' },
  { label: '🚉 Station', query: 'Chennai Central Railway Station' },
  { label: '✈️ Airport', query: 'Chennai International Airport' },
  { label: '🚌 Bus Stand', query: 'Koyambedu Bus Terminus, Chennai' },
  { label: '🏥 Hospital', query: 'Apollo Hospital, Greams Road, Chennai' },
];

export default function RideODashboard() {
  const { user: currentUser, profile } = useAuth();
  const [isOnline, setIsOnline] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [pickupAddress, setPickupAddress] = useState<string>('Locating live GPS coordinates...');
  
  // Source Search & Autocomplete
  const [sourceSearchQuery, setSourceSearchQuery] = useState('');
  const [sourceSuggestions, setSourceSuggestions] = useState<any[]>([]);
  const [isSearchingSource, setIsSearchingSource] = useState<boolean>(false);
  const [isManualSourceMode, setIsManualSourceMode] = useState<boolean>(false);

  // Destination Search & Autocomplete
  const [destinationLocation, setDestinationLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState<boolean>(false);

  const [recentTrips, setRecentTrips] = useState<any[]>([]);
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

  // Load Recent Trips from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('fago_recent_trips');
      if (saved) setRecentTrips(JSON.parse(saved));
    } catch (e) {}
  }, []);

  const saveTripToRecent = (pickup: string, dropoff: string, destCoords: google.maps.LatLngLiteral) => {
    try {
      const newTrip = { pickup, dropoff, destCoords, timestamp: Date.now() };
      const updated = [newTrip, ...recentTrips.filter(r => r.dropoff !== dropoff)].slice(0, 5);
      setRecentTrips(updated);
      localStorage.setItem('fago_recent_trips', JSON.stringify(updated));
    } catch (e) {}
  };

  // Hardware Device GPS Fetch (Zero API Cost)
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;

    const handleCoords = (pos: GeolocationPosition) => {
      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      if (!isManualSourceMode) {
        setCurrentLocation(coords);
        if (mapRef.current) {
          mapRef.current.panTo(coords);
          mapRef.current.setZoom(15);
        }
      }
    };

    navigator.geolocation.getCurrentPosition(
      handleCoords,
      (err) => {
        console.warn('Geolocation high accuracy fallback:', err.message);
        navigator.geolocation.getCurrentPosition(
          handleCoords,
          () => {
            if (!currentLocation) setCurrentLocation(defaultCenter);
          },
          { enableHighAccuracy: false, timeout: 10000 }
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );

    watchIdRef.current = navigator.geolocation.watchPosition(
      handleCoords,
      (err) => console.warn(err),
      { enableHighAccuracy: true, maximumAge: 3000 }
    );

    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [isManualSourceMode]);

  // Auto Reverse-Geocode Pickup Location Address
  useEffect(() => {
    if (!currentLocation || isManualSourceMode) return;
    const fetchAddress = async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${currentLocation.lat}&lon=${currentLocation.lng}`);
        const data = await res.json();
        if (data && data.display_name) {
          setPickupAddress(data.display_name);
        } else {
          setPickupAddress(`GPS: ${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`);
        }
      } catch (err) {
        setPickupAddress(`GPS: ${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`);
      }
    };
    fetchAddress();
  }, [currentLocation, isManualSourceMode]);

  // Source Places Search Suggestions Autocomplete
  useEffect(() => {
    if (!sourceSearchQuery.trim() || sourceSearchQuery.length < 3) {
      setSourceSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingSource(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(sourceSearchQuery)}&countrycodes=in&limit=5`);
        const data = await res.json();
        if (data) setSourceSuggestions(data);
      } catch (err) {
        console.warn('Source search suggestion error:', err);
      } finally {
        setIsSearchingSource(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [sourceSearchQuery]);

  // Destination Places Search Suggestions Autocomplete
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setSearchSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingSuggestions(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=in&limit=5`);
        const data = await res.json();
        if (data) setSearchSuggestions(data);
      } catch (err) {
        console.warn('Search suggestion error:', err);
      } finally {
        setIsSearchingSuggestions(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectSourceSuggestion = (place: any) => {
    const newSource = { lat: parseFloat(place.lat), lng: parseFloat(place.lon) };
    setCurrentLocation(newSource);
    setPickupAddress(place.display_name);
    setSourceSearchQuery(place.display_name);
    setSourceSuggestions([]);
    setIsManualSourceMode(true);

    if (mapRef.current) {
      if (destinationLocation) {
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(newSource);
        bounds.extend(destinationLocation);
        mapRef.current.fitBounds(bounds);
      } else {
        mapRef.current.panTo(newSource);
        mapRef.current.setZoom(15);
      }
    }
  };

  const handleSelectSuggestion = (place: any) => {
    const newDest = { lat: parseFloat(place.lat), lng: parseFloat(place.lon) };
    setDestinationLocation(newDest);
    setSearchQuery(place.display_name);
    setSearchSuggestions([]);
    saveTripToRecent(pickupAddress, place.display_name, newDest);

    if (mapRef.current && currentLocation) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(currentLocation);
      bounds.extend(newDest);
      mapRef.current.fitBounds(bounds);
    }
  };

  const handlePresetSelect = async (presetQuery: string) => {
    setSearchQuery(presetQuery);
    try {
      setIsSearchingSuggestions(true);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(presetQuery)}&countrycodes=in&limit=1`);
      const data = await res.json();
      if (data && data[0]) {
        handleSelectSuggestion(data[0]);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setIsSearchingSuggestions(false);
    }
  };

  const handleSwapLocations = () => {
    if (currentLocation && destinationLocation) {
      const temp = currentLocation;
      setCurrentLocation(destinationLocation);
      setDestinationLocation(temp);

      const tempAddr = pickupAddress;
      setPickupAddress(searchQuery || `GPS: ${temp.lat.toFixed(4)}, ${temp.lng.toFixed(4)}`);
      setSearchQuery(tempAddr);
    }
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const clickDest = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      setDestinationLocation(clickDest);
      const label = `Pinned Location (${clickDest.lat.toFixed(4)}, ${clickDest.lng.toFixed(4)})`;
      setSearchQuery(label);
      saveTripToRecent(pickupAddress, label, clickDest);

      if (mapRef.current && currentLocation) {
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(currentLocation);
        bounds.extend(clickDest);
        mapRef.current.fitBounds(bounds);
      }
    }
  };

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

    const channel = supabase
      .channel('public:drivers:status')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drivers' }, () => {
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
    setIsManualSourceMode(false);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCurrentLocation(coords);
        if (mapRef.current) {
          mapRef.current.panTo(coords);
          mapRef.current.setZoom(15);
        }
      });
    }
  };

  const currentCategoryObj = VEHICLE_CATEGORIES.find(c => c.id === selectedCategory) || VEHICLE_CATEGORIES[0];
  const baseAppFare = distanceKm !== null ? Math.round(currentCategoryObj.baseFare + distanceKm * currentCategoryObj.perKm) : 0;
  const totalOfferedFare = baseAppFare + extraTip;

  // Fully Automated WhatsApp Message Payload (Pickup GPS + Dropoff + 1-Click Device Navigation + Offered Fare)
  const getAutomatedDriverWhatsAppUrl = (driverPhone: string, driverName: string) => {
    const customerName = profile?.full_name || currentUser?.email?.split('@')[0] || 'Customer';
    const customerPhone = profile?.phone || currentUser?.phone || 'Not provided';
    const pickupGpsUrl = `https://www.google.com/maps/search/?api=1&query=${currentLocation?.lat || 13.0827},${currentLocation?.lng || 80.2707}`;
    const dropoffAddress = searchQuery || 'Tamil Nadu Destination';
    const navUrl = destinationLocation
      ? `https://www.google.com/maps/dir/?api=1&origin=${currentLocation?.lat},${currentLocation?.lng}&destination=${destinationLocation.lat},${destinationLocation.lng}&travelmode=driving`
      : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dropoffAddress)}`;

    const text = 
      `🚨 RIDEO TRIP & LOGISTICS BOOKING 🚨\n\n` +
      `👋 Hello ${driverName},\n\n` +
      `👤 Customer: ${customerName}\n` +
      `📞 Customer Call: tel:${customerPhone}\n\n` +
      `📌 PICKUP PLACE: ${pickupAddress}\n` +
      `📍 LIVE PICKUP GPS: ${pickupGpsUrl}\n` +
      `🎯 DROPOFF LOCATION: ${dropoffAddress}\n` +
      `🧭 1-CLICK DEVICE MAP NAVIGATION: ${navUrl}\n\n` +
      `📏 TRIP DISTANCE: ${distanceKm || 0} km\n` +
      `🚚 VEHICLE NEEDED: ${currentCategoryObj.icon} ${currentCategoryObj.name}\n` +
      `💵 COMMITTED OFFERED AMOUNT: ₹${totalOfferedFare}\n\n` +
      `👉 Please tap the navigation link above or call customer to confirm this trip!`;

    const cleanNumber = driverPhone.replace(/\D/g, '');
    const formattedPhone = cleanNumber.startsWith('91') ? cleanNumber : '91' + cleanNumber;
    const isMobileDevice = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobileDevice) {
      return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
    }
    return `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(text)}`;
  };

  // Filter Drivers by Selected Category & Dynamic Radius
  const filteredDrivers = activeDrivers.filter(driver => {
    const matchesCategory = (driver.vehicle_type || driver.category || 'bike').toLowerCase() === selectedCategory;
    if (!currentLocation) return matchesCategory;

    const driverLat = driver.pickup_latitude || defaultCenter.lat;
    const driverLng = driver.pickup_longitude || defaultCenter.lng;
    const distFromUser = calculateHaversineDistance(
      currentLocation.lat, currentLocation.lng,
      driverLat, driverLng
    );
    return matchesCategory && distFromUser <= currentCategoryObj.radiusKm;
  });

  return (
    <div className="flex flex-col space-y-4 h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border rounded-xl p-4 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Navigation className="w-5 h-5 text-primary" /> RideO Transport & Logistics Hub
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-bold border border-emerald-500/30">
              India (₹ INR)
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Quick Favorite Places • 1-Click Swap Locations • Live Device Navigation
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCenterOnUser}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-xs font-semibold hover:bg-muted transition"
          >
            <Compass className="w-4 h-4 text-primary animate-pulse" />
            Reset to Device Live GPS
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
          {/* Source & Destination Search Form */}
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-3 relative z-30">
            {/* Source Pickup Input */}
            <div className="space-y-1 relative">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Pickup Location
                </label>
                <button
                  type="button"
                  onClick={() => setIsManualSourceMode(!isManualSourceMode)}
                  className="text-[10px] text-primary font-bold hover:underline flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" /> {isManualSourceMode ? 'Switch to Live GPS' : 'Type / Search Place'}
                </button>
              </div>

              {!isManualSourceMode ? (
                <div className="p-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-xs font-medium text-emerald-400 truncate">
                  {pickupAddress}
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Type Pickup Place (e.g. Chennai Central, Salem Stand)"
                    value={sourceSearchQuery}
                    onChange={(e) => setSourceSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-emerald-500/50 bg-background text-sm text-foreground focus:outline-none focus:border-emerald-500 transition"
                  />
                  {isSearchingSource && <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-2.5 text-emerald-500" />}

                  {sourceSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50 divide-y divide-border">
                      {sourceSuggestions.map((place, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectSourceSuggestion(place)}
                          className="w-full p-3 text-left hover:bg-emerald-500/10 transition flex items-start gap-2.5 text-xs"
                        >
                          <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-foreground font-medium truncate">{place.display_name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 1-Click Swap Locations Button */}
            <div className="flex justify-center -my-1">
              <button
                type="button"
                onClick={handleSwapLocations}
                className="p-1.5 rounded-full bg-card border border-border text-muted-foreground hover:text-primary hover:border-primary transition shadow-sm flex items-center gap-1 text-[10px] font-bold px-3"
              >
                <ArrowUpDown className="w-3 h-3" /> Swap Pickup & Dropoff
              </button>
            </div>

            {/* Destination Dropoff Input */}
            <div className="space-y-1 relative">
              <label className="text-[10px] font-bold text-red-500 uppercase tracking-wider flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" /> Dropoff Location
              </label>

              <div className="relative">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type Destination Place (e.g. Marina Beach, Trichy, Hosur)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:border-primary transition"
                  />
                  {isSearchingSuggestions && <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />}
                </div>

                {searchSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50 divide-y divide-border">
                    {searchSuggestions.map((place, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectSuggestion(place)}
                        className="w-full p-3 text-left hover:bg-primary/10 transition flex items-start gap-2.5 text-xs"
                      >
                        <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-foreground font-medium truncate">{place.display_name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 1-Click Favorite Quick Preset Places */}
            <div className="pt-2 border-t border-border space-y-1.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Bookmark className="w-3 h-3 text-amber-500" /> Quick Preset Places:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_FAVORITE_PLACES.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handlePresetSelect(preset.query)}
                    className="px-2.5 py-1 rounded-full bg-muted/60 hover:bg-primary/20 text-foreground hover:text-primary border border-border text-[11px] font-semibold transition"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Trips History (1-Click Re-Book) */}
            {recentTrips.length > 0 && (
              <div className="pt-2 border-t border-border space-y-1.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <History className="w-3 h-3 text-blue-500" /> Recent Searches:
                </span>
                <div className="space-y-1">
                  {recentTrips.map((trip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSearchQuery(trip.dropoff);
                        if (trip.destCoords) {
                          setDestinationLocation(trip.destCoords);
                        }
                      }}
                      className="w-full p-2 rounded-lg bg-background hover:bg-muted border border-border/60 text-left text-xs truncate flex items-center justify-between transition"
                    >
                      <span className="truncate font-medium text-foreground">🎯 {trip.dropoff}</span>
                      <span className="text-[10px] text-primary font-bold shrink-0 ml-2">Re-Book</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 6 Category Selector */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Vehicle Category</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-bold">
                {currentCategoryObj.radiusKm} km Search Radius
              </span>
            </div>
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
                    <span className="text-[10px] opacity-80 mt-1 font-mono">📍 {cat.radiusKm} km</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Distance, Fare Breakdown Card */}
          {distanceKm !== null && (
            <div className="bg-card border border-border rounded-xl p-4 space-y-3 shadow-sm">
              <div className="grid grid-cols-2 gap-2 text-xs border-b border-border pb-2">
                <div>
                  <span className="text-muted-foreground block">Calculated Distance:</span>
                  <strong className="text-foreground text-sm font-bold">📏 {distanceKm} km</strong>
                </div>
                <div>
                  <span className="text-muted-foreground block">Est. Travel Time:</span>
                  <strong className="text-foreground text-sm font-bold">⏱️ ~{Math.round(distanceKm * 2.5) + 3} mins</strong>
                </div>
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
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition ${
                        extraTip === tip
                          ? 'border-emerald-500 bg-emerald-500/15 text-emerald-500'
                          : 'border-border text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      +{tip === 0 ? '0' : `₹${tip}`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-foreground block">Total Offered Fare:</span>
                  <span className="text-[10px] text-muted-foreground">App Fare: ₹{baseAppFare} + Tip: ₹{extraTip}</span>
                </div>
                <span className="text-2xl font-black text-emerald-500">₹{totalOfferedFare}</span>
              </div>
            </div>
          )}

          {/* Live Operators Stream */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-3 flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-primary" /> Active Transport Operators ({filteredDrivers.length})
              </h3>
              <span className="text-[10px] text-muted-foreground font-mono">Radius: {currentCategoryObj.radiusKm}km</span>
            </div>

            <div className="space-y-2 overflow-y-auto flex-1 pr-1 max-h-[250px]">
              {filteredDrivers.length === 0 ? (
                <div className="text-center p-6 text-muted-foreground text-xs">
                  No active {currentCategoryObj.name} operators within {currentCategoryObj.radiusKm} km radius.
                </div>
              ) : (
                filteredDrivers.map((driver) => {
                  const isBusy = driver.status === 'busy';
                  const driverLat = driver.pickup_latitude || defaultCenter.lat;
                  const driverLng = driver.pickup_longitude || defaultCenter.lng;
                  const distFromUser = currentLocation ? calculateHaversineDistance(currentLocation.lat, currentLocation.lng, driverLat, driverLng) : 0;
                  const estEtaMins = Math.round(distFromUser * 2) + 2;

                  return (
                    <div
                      key={driver.id}
                      className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                        isBusy ? 'bg-amber-500/5 border-amber-500/30' : 'bg-background border-border hover:border-primary/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-foreground">{driver.name || driver.vehicle_name}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isBusy ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {isBusy ? 'BUSY / COMMITTED' : 'FREE / AVAILABLE'}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                          {driver.vehicle_no || driver.vehicle_registration || 'Reg Vehicle'} • ⭐ {driver.rating || '4.8'} • 📍 {distFromUser} km ({estEtaMins} mins away)
                        </p>
                      </div>

                      {!isBusy ? (
                        <a
                          href={getAutomatedDriverWhatsAppUrl(driver.phone || driver.whatsapp_number || '916381029380', driver.name || 'Driver')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-[#25D366] text-white text-xs font-bold flex items-center gap-1 hover:bg-[#20bd5a] transition shadow-sm shrink-0"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> Book via WhatsApp
                        </a>
                      ) : (
                        <span className="text-[10px] text-amber-400 font-bold px-2.5 py-1 bg-amber-500/10 rounded-lg shrink-0">
                          {driver.committed_to || 'On Trip'}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Interactive Google Map Screen */}
        <div className="lg:col-span-7 h-full min-h-[400px] bg-card border border-border rounded-xl p-2 relative shadow-inner overflow-hidden">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={currentLocation || defaultCenter}
              zoom={13}
              onLoad={onMapLoad}
              onClick={handleMapClick}
              options={{
                disableDefaultUI: false,
                zoomControl: true,
                styles: [
                  { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
                  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
                  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
                ],
              }}
            >
              {/* Pickup User Marker */}
              {currentLocation && (
                <Marker
                  position={currentLocation}
                  title={`Pickup: ${pickupAddress}`}
                  icon={{
                    url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
                  }}
                />
              )}

              {/* Destination Marker */}
              {destinationLocation && (
                <Marker
                  position={destinationLocation}
                  title="Selected Dropoff Destination"
                  icon={{
                    url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                  }}
                />
              )}

              {/* Active Drivers Markers on Map */}
              {filteredDrivers.map((driver) => {
                const isBusy = driver.status === 'busy';
                const lat = driver.pickup_latitude || (currentLocation ? currentLocation.lat + (Math.random() - 0.5) * 0.03 : defaultCenter.lat);
                const lng = driver.pickup_longitude || (currentLocation ? currentLocation.lng + (Math.random() - 0.5) * 0.03 : defaultCenter.lng);

                return (
                  <Marker
                    key={driver.id}
                    position={{ lat, lng }}
                    title={`${driver.name} (${isBusy ? 'Busy' : 'Available'})`}
                    icon={{
                      url: isBusy
                        ? 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
                        : 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                    }}
                  />
                );
              })}

              {/* Connecting Polyline Route */}
              {currentLocation && destinationLocation && (
                <Polyline
                  path={[currentLocation, destinationLocation]}
                  options={{
                    strokeColor: '#10B981',
                    strokeOpacity: 0.9,
                    strokeWeight: 4,
                  }}
                />
              )}
            </GoogleMap>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-card text-muted-foreground text-sm space-y-2">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span>Loading Interactive Transport Map...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
