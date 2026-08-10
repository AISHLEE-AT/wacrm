'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, Suspense } from 'react';
import nextDynamic from 'next/dynamic';
import { Navigation, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// Dynamically import Map so it only renders on client
const RideMap = nextDynamic(() => import('@/components/GoogleRideMap'), { ssr: false });

const supabase = createClient();

// Haversine distance calculation (pickup → dropoff trip distance)
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// Get vehicle emoji based on type
function getVehicleEmoji(type: string): string {
  switch(type) {
    case 'bike': return '🏍️';
    case 'auto': return '🛺';
    case 'sedan': return '🚙';
    case 'suv': return '🚐';
    case 'mini': return '🚗';
    case 'cargo': return '🛻';
    default: return '🚕';
  }
}

function RideOBookingContent() {
  const [pickup, setPickup] = useState<[number, number] | null>(null);
  const [dropoff, setDropoff] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(true);

  // Peer-to-Peer State
  const [drivers, setDrivers] = useState<any[]>([]);
  const [searchingDrivers, setSearchingDrivers] = useState(false);
  const [activeRide, setActiveRide] = useState<any>(null);
  const [driverETA, setDriverETA] = useState<any>(null);
  const [liveDriverLocation, setLiveDriverLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if ((activeRide?.status === 'accepted' || activeRide?.status === 'driver_arrived' || activeRide?.status === 'in_progress') && activeRide.driver_id) {
       const fetchDriverLocation = async () => {
         // Attempt to fetch live lat/lng, falling back to pickup coords if driver tracking isn't fully set up
         const { data: driver } = await supabase.from('drivers').select('lat, lng, pickup_latitude, pickup_longitude').eq('id', activeRide.driver_id).maybeSingle();
         const driverLat = driver?.lat || driver?.pickup_latitude;
         const driverLng = driver?.lng || driver?.pickup_longitude;
         
         if (driverLat && driverLng) {
            setLiveDriverLocation([driverLat, driverLng]);
            if (activeRide.pickup_latitude) {
               const dist = getDistanceKm(driverLat, driverLng, activeRide.pickup_latitude, activeRide.pickup_longitude);
               const mins = Math.max(1, Math.ceil(dist * 3));
               setDriverETA({ distance: dist, mins: mins });
            }
         } else {
            setDriverETA({ distance: 2.5, mins: 8 });
         }
       };
       
       fetchDriverLocation();
       interval = setInterval(fetchDriverLocation, 5000);
    } else {
       setLiveDriverLocation(null);
    }
    
    return () => { if (interval) clearInterval(interval); };
  }, [activeRide?.status, activeRide?.driver_id]);

  const locateUser = () => {
    setLocating(true);
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPickup([pos.coords.latitude, pos.coords.longitude]);
          setLocating(false);
        },
        () => {
          setPickup([11.0168, 76.9558]); // Default Coimbatore
          setLocating(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      setPickup([11.0168, 76.9558]);
      setLocating(false);
    }
  };

  useEffect(() => { locateUser(); }, []);

  const searchDrivers = async () => {
    if (!pickup || !dropoff) return;
    setSearchingDrivers(true);
    try {
      const { data, error } = await supabase.rpc('get_nearby_drivers', {
        pickup_lat: pickup[0],
        pickup_lon: pickup[1],
        radius_km: 100
      });
      if (error) throw error;
      setDrivers(data || []);
      if (!data || data.length === 0) alert('No drivers found within 100km. Virtual drivers may appear shortly.');
    } catch (e: any) {
      alert(`Error searching drivers: ${e.message}`);
    } finally {
      setSearchingDrivers(false);
    }
  };

  const handleBookDriver = async (driver: any) => {
    if (!pickup || !dropoff) return;
    
    if (!driver.phone) {
      alert('This driver has no contact number. Please select another driver.');
      return;
    }
    
    setSearchingDrivers(true);
    
    try {
      // 1. Calculate actual trip distance (pickup → dropoff)
      const tripDistanceKm = getDistanceKm(pickup[0], pickup[1], dropoff[0], dropoff[1]);
      
      // 2. Reverse geocode for human-readable addresses (free Nominatim API)
      let pickupAddress = `${pickup[0].toFixed(4)}, ${pickup[1].toFixed(4)}`;
      let dropoffAddress = `${dropoff[0].toFixed(4)}, ${dropoff[1].toFixed(4)}`;
      try {
        const [pRes, dRes] = await Promise.all([
          fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pickup[0]}&lon=${pickup[1]}&format=json&zoom=16`),
          fetch(`https://nominatim.openstreetmap.org/reverse?lat=${dropoff[0]}&lon=${dropoff[1]}&format=json&zoom=16`),
        ]);
        const [pData, dData] = await Promise.all([pRes.json(), dRes.json()]);
        if (pData.display_name) pickupAddress = pData.display_name.split(',').slice(0, 3).join(',').trim();
        if (dData.display_name) dropoffAddress = dData.display_name.split(',').slice(0, 3).join(',').trim();
      } catch { /* Fallback to coordinates silently */ }
      
      // 3. Calculate estimated fare
      const baseFare = driver.vehicle_type === 'bike' ? 15 : driver.vehicle_type === 'auto' ? 30 : 50;
      const perKmRate = driver.vehicle_type === 'bike' ? 8 : driver.vehicle_type === 'auto' ? 14 : 16;
      const baseKm = driver.vehicle_type === 'bike' ? 1.5 : 2.0;
      const estimatedFare = Math.max(
        driver.vehicle_type === 'bike' ? 25 : driver.vehicle_type === 'auto' ? 45 : 89,
        Math.round(baseFare + Math.max(0, tripDistanceKm - baseKm) * perKmRate)
      );
      
      // 4. Generate 4-digit OTP
      const otp = String(1000 + Math.floor(Math.random() * 9000));
      
      // 5. Create ride record in Supabase for tracking
      const { data: userAuth } = await supabase.auth.getUser();
      const passengerPhone = userAuth?.user?.phone || localStorage.getItem('user_phone') || 'Unknown';
      
      const { data: rideRecord, error: rideError } = await supabase.from('rides').insert({
        customer_id: userAuth?.user?.id || null, // Allow null if not signed in (RLS permitting)
        passenger_phone: passengerPhone,
        driver_id: driver.id,
        pickup_latitude: pickup[0],
        pickup_longitude: pickup[1],
        pickup_address: pickupAddress,
        dropoff_latitude: dropoff[0],
        dropoff_longitude: dropoff[1],
        dropoff_address: dropoffAddress,
        vehicle_type: driver.vehicle_type,
        distance_km: parseFloat(tripDistanceKm.toFixed(2)),
        fare: estimatedFare,
        estimated_price: estimatedFare,
        status: 'pending',
        otp: otp,
        payment_mode: 'upi'
      }).select().single();
      
      if (rideError) {
        console.error('Ride record insert error:', rideError);
        alert(`Failed to save ride in database: ${rideError.message}. The ride request cannot proceed.`);
        setSearchingDrivers(false);
        return;
      }
      
      // 6. Setup Realtime listener for driver acceptance
      if (rideRecord) {
        setActiveRide(rideRecord);
        supabase
          .channel(`ride-updates-${rideRecord.id}`)
          .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'rides', filter: `id=eq.${rideRecord.id}` },
            (payload) => {
              const updated = payload.new;
              if (updated.status === 'declined') {
                 alert('The driver has declined the ride request. Please select another driver.');
                 setActiveRide(null);
                 setDriverETA(null);
              } else {
                 setActiveRide(updated);
              }
            }
          )
          .subscribe();
      }
      
      // 7. Dispatch booking request via backend Meta API
      const res = await fetch('/api/ride/request-driver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ride_id: rideRecord.id,
          driver_phone: driver.phone,
          pickup_address: pickupAddress,
          dropoff_address: dropoffAddress,
          distance_km: tripDistanceKm.toFixed(1),
          estimated_fare: estimatedFare,
          driver_name: driver.name,
          driver_rating: driver.rating || '4.5',
          vehicle_info: `${driver.vehicle_model || driver.vehicle_type} ${driver.vehicle_number ? `(${driver.vehicle_number})` : ''}`
        })
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to send WhatsApp request');
      }
      
      alert('Ride request successfully sent to the driver via WhatsApp!');
    } catch (err: any) {
      alert(`Booking error: ${err.message}`);
    } finally {
      setSearchingDrivers(false);
    }
  };

  const cancelRide = async () => {
    if (activeRide?.id) {
      await supabase.from('rides').update({ status: 'cancelled' }).eq('id', activeRide.id);
    }
    setActiveRide(null);
    setDrivers([]);
    setDropoff(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl p-2.5 bg-yellow-500/10 text-yellow-400 rounded-xl border border-yellow-500/20">🛺</span>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              RideO <span className="text-xs bg-yellow-500/20 text-yellow-300 font-normal px-2.5 py-0.5 rounded-full border border-yellow-500/30">பயணி & டாக்ஸி சவாரி</span>
            </h1>
            <p className="text-xs text-slate-400">Pin your Drop-off on the map → Find real nearby drivers → Book instantly</p>
          </div>
        </div>
        <button
          onClick={locateUser}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition border border-slate-700"
        >
          <Navigation className="w-4 h-4 text-emerald-400" /> Re-center
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-6 p-0 lg:p-6" style={{ minHeight: 'calc(100vh - 80px)' }}>

        {/* Map — full height on mobile, left 2 cols on desktop */}
        <div className="lg:col-span-2 relative" style={{ height: '55vh', minHeight: 320 }}>
          {locating ? (
            <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-800">
              <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">Finding your location...</p>
            </div>
          ) : (
            <div className="w-full h-full rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
              <RideMap pickup={pickup} dropoff={dropoff} setDropoff={setDropoff} driverLocation={liveDriverLocation} />
              {/* Map hint overlay */}
              {!dropoff && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-4 py-2 rounded-full shadow-lg backdrop-blur-sm border border-white/10 z-[999] whitespace-nowrap">
                  📍 Tap on the map to set your drop-off location
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-1 flex flex-col gap-4 p-4 lg:p-0">

          {/* Location Status */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-yellow-400" /> Your Journey
            </h3>
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center mt-1 shrink-0">
                <div className="w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-emerald-400/30" />
                <div className="w-0.5 h-6 bg-slate-700 my-1" />
                <div className={`w-3 h-3 rounded-full ${dropoff ? 'bg-red-400 ring-2 ring-red-400/30' : 'bg-slate-600'}`} />
              </div>
              <div className="flex-1 space-y-2">
                <div className="bg-slate-800 rounded-lg px-3 py-2">
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Pickup</p>
                  <p className="text-xs text-emerald-300 font-medium mt-0.5">
                    {pickup ? `📍 ${pickup[0].toFixed(4)}, ${pickup[1].toFixed(4)}` : 'Locating...'}
                  </p>
                </div>
                <div className={`rounded-lg px-3 py-2 border ${dropoff ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-dashed border-slate-700'}`}>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Drop-off</p>
                  <p className={`text-xs font-medium mt-0.5 ${dropoff ? 'text-red-300' : 'text-slate-600'}`}>
                    {dropoff ? `📍 ${dropoff[0].toFixed(4)}, ${dropoff[1].toFixed(4)}` : 'Tap map to set destination'}
                  </p>
                </div>
                {pickup && dropoff && (
                  <div className="bg-slate-800 rounded-lg px-3 py-2 mt-2 border border-yellow-500/20">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Trip Info</p>
                        <p className="text-xs text-yellow-300 font-medium mt-0.5">
                          📏 {getDistanceKm(pickup[0], pickup[1], dropoff[0], dropoff[1]).toFixed(1)} km
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Est. Fare</p>
                        <p className="text-sm text-emerald-400 font-bold mt-0.5">
                          ₹{Math.max(45, Math.round(30 + Math.max(0, getDistanceKm(pickup[0], pickup[1], dropoff[0], dropoff[1]) - 2) * 14))}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Active Ride Status */}
          {activeRide ? (
            <div className={`rounded-xl border-2 p-5 text-center space-y-3 ${
              activeRide.status === 'pending' ? 'border-orange-500 bg-orange-500/10' 
              : (activeRide.status === 'accepted' || activeRide.status === 'driver_arrived' || activeRide.status === 'in_progress') ? 'border-emerald-500 bg-emerald-500/10'
              : activeRide.status === 'cancelled' ? 'border-red-500 bg-red-500/10'
              : 'border-slate-600 bg-slate-800'
            }`}>
              <div className="text-2xl">
                {activeRide.status === 'pending' ? '⏳' 
                : activeRide.status === 'accepted' ? '👍' 
                : activeRide.status === 'driver_arrived' ? '📍' 
                : activeRide.status === 'in_progress' ? '🚗' 
                : activeRide.status === 'cancelled' ? '❌' 
                : '🏁'}
              </div>
              <h2 className={`text-base font-bold ${
                activeRide.status === 'pending' ? 'text-orange-400' 
                : activeRide.status === 'cancelled' ? 'text-red-400'
                : activeRide.status === 'completed' ? 'text-slate-300'
                : 'text-emerald-400'
              }`}>
                {activeRide.status === 'pending' ? 'Searching for Driver...' 
                : activeRide.status === 'accepted' ? 'Driver Assigned & On the way.' 
                : activeRide.status === 'driver_arrived' ? 'Driver has arrived at pickup!' 
                : activeRide.status === 'in_progress' ? 'Ride in Transit' 
                : activeRide.status === 'cancelled' ? 'Ride was cancelled.' 
                : `Ride Complete. Fare: ₹${activeRide.fare || activeRide.estimated_price}`}
              </h2>
              
              {activeRide.status === 'accepted' && (
                <div className="mt-2 text-sm text-emerald-300">
                  <p>Driver is en route to your location.</p>
                </div>
              )}

              {activeRide.status === 'driver_arrived' && (
                <div className="mt-2 bg-black/40 rounded-xl p-4 border border-emerald-500/30">
                  <p className="text-xs text-slate-400 mb-1">Share this OTP with your driver to start ride</p>
                  <div className="text-5xl font-black text-white tracking-[0.3em]">
                    {activeRide.otp}
                  </div>
                </div>
              )}

              {(activeRide.status === 'accepted' || activeRide.status === 'driver_arrived' || activeRide.status === 'in_progress') && driverETA && (
                <div className="mt-4 pt-3 border-t border-emerald-500/20 text-sm">
                  {activeRide.status === 'in_progress' ? (
                    <p className="text-emerald-400 font-bold flex justify-center items-center gap-2">
                      <span>🏁</span> Heading to destination...
                    </p>
                  ) : (
                    <>
                      <p className="text-emerald-400 font-bold flex justify-center items-center gap-2">
                        <span>📍</span> Driver is {driverETA.distance.toFixed(1)} km away
                      </p>
                      <p className="text-slate-300 text-xs mt-1">Est. arrival in {driverETA.mins} mins</p>
                    </>
                  )}
                </div>
              )}

              <button
                onClick={cancelRide}
                className="text-xs text-slate-500 hover:text-red-400 transition underline underline-offset-2 mt-2"
              >
                Cancel / Book Another Ride
              </button>
            </div>

          ) : drivers.length > 0 ? (
            /* Driver List */
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-300">🚗 Nearby Drivers ({drivers.length})</h3>
                <button onClick={() => setDrivers([])} className="text-xs text-red-400 hover:text-red-300 font-semibold">✕ Cancel</button>
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {drivers.map(driver => (
                  <div key={driver.id} className="bg-slate-800 border border-slate-700 p-3 rounded-xl flex items-center justify-between hover:border-yellow-500/50 transition">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {getVehicleEmoji(driver.vehicle_type)}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-white">{driver.name}</p>
                        <p className="text-xs text-slate-400">{driver.vehicle_model} • {driver.distance_km?.toFixed(1)}km away</p>
                      </div>
                    </div>
                    <button
                      disabled={searchingDrivers}
                      onClick={() => handleBookDriver(driver)}
                      className="bg-yellow-500 hover:bg-yellow-400 text-slate-950 px-4 py-1.5 rounded-lg text-xs font-bold transition active:scale-95 disabled:opacity-50"
                    >
                      {searchingDrivers ? '...' : 'Book'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

          ) : (
            /* Find Drivers Button */
            <div className="space-y-3">
              {!dropoff && (
                <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  First tap on the map above to set your drop-off location
                </div>
              )}
              <button
                disabled={!dropoff || searchingDrivers}
                onClick={searchDrivers}
                className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-slate-950 font-bold text-base rounded-xl shadow-lg shadow-yellow-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                {searchingDrivers ? (
                  <><div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" /> Searching...</>
                ) : (
                  <><MapPin className="w-5 h-5" /> Find Nearby Drivers</>
                )}
              </button>
              {dropoff && (
                <p className="text-center text-xs text-slate-500">Searches for active drivers within 100km of your pickup</p>
              )}
            </div>
          )}

          {/* Tip */}
          {!activeRide && drivers.length === 0 && (
            <div className="text-xs text-slate-600 text-center mt-2 space-y-1">
              <p>Connected to Aishlee SuprO network</p>
              <p>Zero commission • UPI direct payment to driver</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RideOPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="text-slate-400 text-sm animate-pulse">Loading RideO...</div>
      </div>
    }>
      <RideOBookingContent />
    </Suspense>
  );
}
