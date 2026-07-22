'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { GoogleMap, useLoadScript, Marker, Polyline } from '@react-google-maps/api';
import { Navigation, ShieldAlert, Power, Compass, Car, Bike, Truck, MapPin, Search, ArrowRight, MessageSquare, Phone, CheckCircle, Users } from 'lucide-react';
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
  { id: 'bike', name: 'Bike / Scooty', icon: '🛵', baseFare: 30, perKm: 8 },
  { id: 'auto', name: 'Auto Rickshaw', icon: '🛺', baseFare: 40, perKm: 15 },
  { id: 'car', name: 'Car / Taxi / SUV', icon: '🚗', baseFare: 70, perKm: 20 },
  { id: 'van', name: 'Van / Mini-Bus', icon: '🚐', baseFare: 150, perKm: 35 },
  { id: 'bus', name: 'Bus / Travels', icon: '🚌', baseFare: 300, perKm: 50 },
  { id: 'truck', name: 'Lorry / Truck', icon: '🚛', baseFare: 500, perKm: 75 },
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

  // Fetch active drivers from Supabase matching category
  useEffect(() => {
    const fetchActiveDrivers = async () => {
      try {
        const { data } = await supabase
          .from('drivers')
          .select('*')
          .eq('status', 'online');
        
        if (data) {
          setActiveDrivers(data);
        } else {
          // Fallback demo drivers for Tamil Nadu transport network
          setActiveDrivers([
            { id: '1', name: 'Muthu Travels', phone: '916381029380', category: 'bus', vehicle_no: 'TN-39-B-8899', rating: 4.9 },
            { id: '2', name: 'Kumar Lorry Service', phone: '916381029380', category: 'truck', vehicle_no: 'TN-38-AX-5544', rating: 4.8 },
            { id: '3', name: 'Selvam Auto', phone: '916381029380', category: 'auto', vehicle_no: 'TN-37-Z-1234', rating: 4.7 },
            { id: '4', name: 'Vijay Bike Taxi', phone: '916381029380', category: 'bike', vehicle_no: 'TN-39-M-9988', rating: 5.0 },
          ]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchActiveDrivers();
  }, [selectedCategory]);

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

  // Generate Direct WhatsApp URL to a Specific Driver / Vehicle Owner (Zero Meta API Cost)
  const getDirectDriverWhatsAppUrl = (driverPhone: string, driverName: string) => {
    const customerName = profile?.full_name || currentUser?.email?.split('@')[0] || 'Customer';
    const customerPhone = profile?.phone || 'Contact via App';
    const locationMapUrl = currentLocation ? `https://maps.google.com/?q=${currentLocation.lat},${currentLocation.lng}` : 'Live Location';
    
    const text = `👋 *Hi ${driverName}! RIDEO TRANSPORT REQUEST* 🚨\n\n` +
      `👤 *Customer:* ${customerName}\n` +
      `📞 *Phone:* ${customerPhone}\n` +
      `🚚 *Vehicle Needed:* ${currentCategoryObj.icon} ${currentCategoryObj.name}\n` +
      `📍 *Pickup GPS:* ${locationMapUrl}\n` +
      `🎯 *Destination:* ${searchQuery || 'Destination'}\n` +
      `📏 *Distance:* ${distanceKm || 0} km\n\n` +
      `💵 *Offered Price:* ₹${totalOfferedFare}\n\n` +
      `👉 *Please confirm if you are available for this trip!*`;

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

  if (loadError) return <div className="p-8 text-center text-red-500">Error loading Google Maps.</div>;

  const filteredDrivers = activeDrivers.filter(d => !d.category || d.category === selectedCategory || selectedCategory === 'bike');

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
            Zero Meta API Cost • Direct WhatsApp Request to Vehicle Owners & Operators
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
        {/* Left Side */}
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
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fare & Direct Driver WhatsApp Links */}
          {distanceKm !== null && (
            <div className="bg-card border border-border rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between text-xs border-b border-border pb-2">
                <span className="text-muted-foreground">Distance: <strong className="text-foreground">{distanceKm} km</strong></span>
                <span className="text-muted-foreground">Base Fare: <strong className="text-emerald-500 font-bold">₹{baseAppFare}</strong></span>
              </div>

              {/* Offer Extra */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Add Extra Offer to Driver (+₹)
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
                <span className="text-sm font-semibold">Offered Rate:</span>
                <span className="text-xl font-bold text-emerald-500">₹{totalOfferedFare}</span>
              </div>

              {/* Nearby Operators List for Direct WhatsApp Contact */}
              <div className="space-y-2 pt-2 border-t border-border">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-primary" /> Send Direct WhatsApp Request to Operators (Zero Fee)
                </h4>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {filteredDrivers.map((driver) => (
                    <div key={driver.id} className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-background hover:bg-muted/30 transition text-xs">
                      <div>
                        <p className="font-bold text-foreground">{driver.name}</p>
                        <p className="text-[10px] text-muted-foreground">{driver.vehicle_no || 'Reg Vehicle'} • ⭐ {driver.rating || 4.8}</p>
                      </div>
                      <a
                        href={getDirectDriverWhatsAppUrl(driver.phone || '916381029380', driver.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold flex items-center gap-1 transition"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Request
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Live Map */}
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
