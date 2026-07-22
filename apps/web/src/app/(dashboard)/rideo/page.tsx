'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { GoogleMap, useLoadScript, Marker, Polyline } from '@react-google-maps/api';
import { Navigation, ShieldAlert, Power, Compass, Car, Bike, Truck, MapPin, Search, ArrowRight, Zap, DollarSign } from 'lucide-react';
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
const libraries: any = ['places'];
const mapContainerStyle = { width: '100%', height: '100%', borderRadius: '12px' };
const defaultCenter = { lat: 13.0827, lng: 80.2707 }; // Chennai fallback

// Cost-Cutting Haversine Distance Formula (Zero Google Matrix API Cost)
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

// Rapido/Uber Pricing Tiers
const RIDE_TIERS = [
  { id: 'bike', name: 'RideO Bike', icon: Bike, baseFare: 30, perKm: 8, etaMultiplier: 3, description: 'Fastest for single rider' },
  { id: 'auto', name: 'RideO Auto', icon: Compass, baseFare: 40, perKm: 15, etaMultiplier: 4, description: 'Comfortable 3-wheeler' },
  { id: 'sedan', name: 'RideO Prime Sedan', icon: Car, baseFare: 70, perKm: 20, etaMultiplier: 4, description: 'AC car for up to 4' },
  { id: 'cargo', name: 'RideO Express Cargo', icon: Truck, baseFare: 120, perKm: 28, etaMultiplier: 5, description: 'Goods & deliveries' },
];

export default function RideODashboard() {
  const { user: currentUser } = useAuth();
  const [isOnline, setIsOnline] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [destinationLocation, setDestinationLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [selectedTier, setSelectedTier] = useState<string>('bike');
  const [isBooking, setIsBooking] = useState(false);
  const [activeRide, setActiveRide] = useState<any>(null);

  const mapRef = useRef<google.maps.Map | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  // Debounced backend location update (every 60s max)
  const UPDATE_INTERVAL = 60000;
  const updateLocationOnServer = async (lat: number, lng: number) => {
    if (!currentUser) return;
    try {
      await supabase.from('profiles').update({
        latitude: lat,
        longitude: lng,
        updated_at: new Date().toISOString()
      }).eq('id', currentUser.id);
    } catch (e) {
      console.error('Failed to update location', e);
    }
  };

  // Immediate Live GPS Fetch on Load (Device Location - Zero API Cost)
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;

    // Get current position immediately
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCurrentLocation(coords);
        if (mapRef.current) {
          mapRef.current.panTo(coords);
        }
      },
      (err) => {
        console.warn('Geolocation warning, using default:', err.message);
        setCurrentLocation(defaultCenter);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    // Watch live location updates
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCurrentLocation(coords);
        const now = Date.now();
        if (now - lastUpdateRef.current > UPDATE_INTERVAL) {
          updateLocationOnServer(coords.lat, coords.lng);
          lastUpdateRef.current = now;
        }
      },
      (err) => console.warn(err),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [currentUser]);

  // Recalculate distance when destination changes
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

  // Simple Geocoding / Destination Pin Generator (Cost-Optimized)
  const handleDestinationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !currentLocation) return;

    // Generate a destination offset based on query for demo/cost-cutting (or geocoder)
    // Offset ~ 3-8 km in a deterministic way without calling expensive APIs
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

  const handleBookRide = async () => {
    if (!currentLocation || !destinationLocation || !currentUser) return;
    setIsBooking(true);
    try {
      const tier = RIDE_TIERS.find(t => t.id === selectedTier) || RIDE_TIERS[0];
      const fare = Math.round(tier.baseFare + (distanceKm || 5) * tier.perKm);

      const { data, error } = await supabase.from('rides').insert({
        rider_id: currentUser.id,
        pickup_latitude: currentLocation.lat,
        pickup_longitude: currentLocation.lng,
        pickup_address: 'Current Live Location',
        dropoff_latitude: destinationLocation.lat,
        dropoff_longitude: destinationLocation.lng,
        dropoff_address: searchQuery || 'Destination',
        status: 'requested',
        fare: fare
      }).select().single();

      if (!error && data) {
        setActiveRide(data);
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

  if (loadError) return <div className="p-8 text-center text-red-500">Error loading Google Maps. Check API Key.</div>;

  const mapCenter = currentLocation || defaultCenter;

  return (
    <div className="flex flex-col h-full space-y-6 max-w-6xl mx-auto p-4 sm:p-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Navigation className="w-7 h-7 text-primary" />
            RideO Mobility & Delivery
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Live GPS Tracking • Minimum API Cost Architecture (Haversine Pricing)
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

      {/* Main Grid: Search & Options + Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[500px]">
        {/* Left Side: Destination Search & Rapido/Uber Pricing Tiers */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {/* Destination Input */}
          <form onSubmit={handleDestinationSubmit} className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
              <div className="flex-1 truncate text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Source:</span> Current GPS Location
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
              <input
                type="text"
                placeholder="Where to? (e.g. Airport, Central Station)"
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

          {/* Distance & Fare Calculation Tiers (Zero API Cost) */}
          {distanceKm !== null && (
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border pb-2">
                <span>Calculated Distance: <strong className="text-foreground">{distanceKm} km</strong></span>
                <span>Est. Duration: <strong className="text-foreground">{Math.round(distanceKm * 3 + 5)} mins</strong></span>
              </div>

              <div className="space-y-2">
                {RIDE_TIERS.map((tier) => {
                  const fare = Math.round(tier.baseFare + distanceKm * tier.perKm);
                  const isSelected = selectedTier === tier.id;
                  const Icon = tier.icon;

                  return (
                    <div
                      key={tier.id}
                      onClick={() => setSelectedTier(tier.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                        isSelected
                          ? 'border-primary bg-primary/10 shadow-sm'
                          : 'border-border hover:bg-muted/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-lg ${isSelected ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{tier.name}</p>
                          <p className="text-xs text-muted-foreground">{tier.description}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-base font-bold text-emerald-500">₹{fare}</p>
                        <p className="text-[10px] text-muted-foreground">₹{tier.perKm}/km</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Book Button */}
              <button
                onClick={handleBookRide}
                disabled={isBooking}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition shadow-md disabled:opacity-50"
              >
                {isBooking ? (
                  'Confirming Booking...'
                ) : (
                  <>
                    Confirm RideO Request <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Active Ride Card */}
          {activeRide && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Ride Active</span>
                <span className="text-xs text-muted-foreground">Status: {activeRide.status}</span>
              </div>
              <p className="text-sm font-semibold text-foreground">Destination: {activeRide.dropoff_address}</p>
              <p className="text-lg font-bold text-emerald-500">Fare: ₹{activeRide.fare}</p>
            </div>
          )}
        </div>

        {/* Right Side: Live Interactive Map */}
        <div className="lg:col-span-7 bg-card border border-border rounded-xl overflow-hidden relative min-h-[400px]">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={mapCenter}
              zoom={14}
              onLoad={onMapLoad}
              options={{
                disableDefaultUI: false,
                zoomControl: true,
                streetViewControl: false,
                mapTypeControl: false,
              }}
            >
              {/* User Live GPS Marker */}
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

              {/* Destination Marker */}
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

              {/* Route Line (Cost-cutting Polyline) */}
              {currentLocation && destinationLocation && (
                <Polyline
                  path={[currentLocation, destinationLocation]}
                  options={{
                    strokeColor: '#3B82F6',
                    strokeOpacity: 0.8,
                    strokeWeight: 5,
                  }}
                />
              )}
            </GoogleMap>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Loading Google Maps...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
