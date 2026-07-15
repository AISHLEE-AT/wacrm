"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useAuth } from "@/hooks/use-auth";
import { MapPin, Navigation, Car, Bike, Clock, Loader2, XCircle, LocateFixed } from "lucide-react";
import { LocationSearch } from "@/components/LocationSearch";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/Map"), { 
  ssr: false, 
  loading: () => <div className="h-full w-full bg-slate-100 dark:bg-neutral-800 animate-pulse flex items-center justify-center text-muted-foreground">Loading Map...</div> 
});

export default function TransoBooking() {
  const { user } = useAuth();
  
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeRide, setActiveRide] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [onlineDrivers, setOnlineDrivers] = useState<any[]>([]);
  
  const [pickupLat, setPickupLat] = useState<number | null>(null);
  const [pickupLng, setPickupLng] = useState<number | null>(null);
  const [dropoffLat, setDropoffLat] = useState<number | null>(null);
  const [dropoffLng, setDropoffLng] = useState<number | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  // Default to Chennai center if location fails
  const DEFAULT_LAT = 13.0827;
  const DEFAULT_LNG = 80.2707;

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchOnlineDrivers = async () => {
    try {
      const { data } = await supabase.from('drivers').select('*').eq('status', 'online');
      if (data) {
        setOnlineDrivers(data);
      }
    } catch (e) {
      console.error("Could not fetch online drivers", e);
    }
  };

  const handleGetLocation = () => {
    setGettingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPickupLat(position.coords.latitude);
          setPickupLng(position.coords.longitude);
          if (!pickup) setPickup("Current Location");
          setGettingLocation(false);
        },
        (error) => {
          console.warn("Geolocation failed or denied, using default location.");
          // Fallback to default without showing ugly error
          if (!pickupLat) setPickupLat(DEFAULT_LAT);
          if (!pickupLng) setPickupLng(DEFAULT_LNG);
          setGettingLocation(false);
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
      );
    } else {
      setGettingLocation(false);
      if (!pickupLat) setPickupLat(DEFAULT_LAT);
      if (!pickupLng) setPickupLng(DEFAULT_LNG);
    }
  };

  useEffect(() => {
    handleGetLocation();
    fetchOnlineDrivers();
    
    // Listen for driver status changes
    const driverChannel = supabase
      .channel('public:drivers')
      .on("postgres_changes", { event: "*", schema: "public", table: "drivers" }, () => {
        fetchOnlineDrivers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(driverChannel);
    };
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    fetchActiveRide();
    
    const channel = supabase
      .channel("public:rides")
      .on("postgres_changes", { event: "*", schema: "public", table: "rides", filter: `passenger_id=eq.${user.id}` }, (payload: any) => {
        if (payload.new && ["pending", "accepted", "en_route"].includes(payload.new.status)) {
          setActiveRide(payload.new);
        } else {
          setActiveRide(null);
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const fetchActiveRide = async () => {
    if (!user?.id) return;
    try {
      const { data } = await supabase
        .from("rides")
        .select("*")
        .eq("passenger_id", user.id)
        .in("status", ["pending", "accepted", "en_route"])
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
        
      if (data) setActiveRide(data);
    } catch (err) {
      // No active ride
    }
  };

  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c; // Distance in km
  }

  const handleBookRide = async (type: string) => {
    if (!pickup.trim() || !dropoff.trim()) {
      setError("Please enter both pickup and drop-off locations.");
      return;
    }
    if (!user?.id) {
      window.location.href = "/login";
      return;
    }
    setError(null);
    setLoading(true);
    
    try {
      const mockLat = pickupLat || DEFAULT_LAT; 
      const mockLng = pickupLng || DEFAULT_LNG;
      const dLat = dropoffLat || mockLat + 0.05;
      const dLng = dropoffLng || mockLng + 0.05;
      
      const distance = calculateDistance(mockLat, mockLng, dLat, dLng);
      // Base calculation: minimum 50, else 20 per km
      let baseRate = 20;
      if (type === 'bike') baseRate = 12; // Bike is cheaper
      
      const finalPrice = Math.max(50, Math.round(distance * baseRate));
      
      const { data, error: insertError } = await supabase
        .from("rides")
        .insert({
          passenger_id: user?.id,
          pickup_address: pickup,
          dropoff_address: dropoff,
          pickup_lat: mockLat,
          pickup_lng: mockLng,
          dropoff_lat: dLat,
          dropoff_lng: dLng,
          status: "pending",
          estimated_price: finalPrice,
          distance_km: parseFloat(distance.toFixed(2))
        })
        .select()
        .single();
        
      if (insertError) throw insertError;
      setActiveRide(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancelRide = async () => {
    if (!activeRide) return;
    try {
      await supabase.from("rides").update({ status: "cancelled" }).eq("id", activeRide.id);
      setActiveRide(null);
      setPickup("");
      setDropoff("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Generate markers array
  const mapMarkers = [];
  
  if (pickupLat && pickupLng) {
    mapMarkers.push({ position: [pickupLat, pickupLng] as [number, number], title: pickup || "Pickup" });
  }
  if (dropoffLat && dropoffLng) {
    mapMarkers.push({ position: [dropoffLat, dropoffLng] as [number, number], title: dropoff || "Drop-off" });
  }

  // Add fake driver markers if we don't have real locations, but since we fetch from DB, we'd use their last known lat/lng if we had it.
  // For now, let's simulate nearby drivers around the pickup location if they are online.
  onlineDrivers.forEach((driver, idx) => {
    const lat = (pickupLat || DEFAULT_LAT) + (Math.random() - 0.5) * 0.02;
    const lng = (pickupLng || DEFAULT_LNG) + (Math.random() - 0.5) * 0.02;
    mapMarkers.push({
      position: [lat, lng] as [number, number],
      title: `Driver ${idx + 1} (${driver.vehicle_type || 'Car'})`
    });
  });

  if (activeRide) {
    return (
      <div className="flex flex-col md:flex-row h-[calc(100vh-2rem)] w-full overflow-hidden bg-background rounded-xl border border-border shadow-sm">
        {/* LEFT PANEL - RIDE STATUS */}
        <div className="w-full md:w-[450px] flex flex-col bg-card/95 backdrop-blur-xl border-r border-border z-10 shadow-[4px_0_24px_rgba(0,0,0,0.05)]">
          <div className="p-6 md:p-8 overflow-y-auto">
            <div className="rounded-2xl border border-orange-200/50 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/10 p-6 shadow-sm mb-8 flex items-center gap-4">
              <Clock className="h-7 w-7 text-orange-600 dark:text-orange-400" />
              <h2 className="text-xl font-bold text-orange-800 dark:text-orange-300">
                {activeRide.status === "pending" ? "Looking for nearby drivers..." : "Driver is on the way!"}
              </h2>
            </div>
            
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm relative overflow-hidden mb-6">
              <div className="absolute top-0 right-0 p-4">
                <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-4 py-1.5 text-sm font-bold text-emerald-800 dark:text-emerald-300">
                  ₹{activeRide.estimated_price}
                </span>
              </div>
              
              <h3 className="text-lg font-bold mb-6 text-foreground">Ride Details</h3>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="mt-1 bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-full">
                    <MapPin className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Pickup</p>
                    <p className="text-foreground font-medium">{activeRide.pickup_address}</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="mt-1 bg-orange-100 dark:bg-orange-900/30 p-2 rounded-full">
                    <Navigation className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Drop-off</p>
                    <p className="text-foreground font-medium">{activeRide.dropoff_address}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleCancelRide}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 py-4 font-bold text-red-600 dark:text-red-400 transition-all hover:bg-red-100 dark:hover:bg-red-900/50"
            >
              <XCircle className="h-5 w-5" />
              Cancel Ride
            </button>
          </div>
        </div>
        
        {/* RIGHT PANEL - MAP */}
        <div className="flex-1 relative z-0 bg-slate-100 dark:bg-neutral-800">
          <Map 
            center={[activeRide.pickup_lat || DEFAULT_LAT, activeRide.pickup_lng || DEFAULT_LNG]}
            zoom={14}
            markers={[
              { position: [activeRide.pickup_lat, activeRide.pickup_lng], title: "Pickup Location" },
              { position: [activeRide.dropoff_lat, activeRide.dropoff_lng], title: "Destination" },
            ]}
          />
        </div>
      </div>
    );
  }

  const distanceVal = (pickupLat && dropoffLat) ? calculateDistance(pickupLat, pickupLng!, dropoffLat, dropoffLng!) : 0;
  const showVehicleSelection = pickup.length > 2 && dropoff.length > 2 && pickupLat && dropoffLat;

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-2rem)] w-full overflow-hidden bg-background rounded-xl border border-border shadow-sm">
      {/* LEFT PANEL - BOOKING CONTROLS */}
      <div className="w-full md:w-[450px] flex flex-col bg-card/95 backdrop-blur-xl border-r border-border z-10 shadow-[4px_0_24px_rgba(0,0,0,0.05)]">
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          
          {/* SEARCH MODE */}
          {!showVehicleSelection && (
            <div className="animate-in fade-in duration-300">
              <h1 className="text-3xl font-black tracking-tight text-foreground mb-8">Book a Ride</h1>
              
              <div className="relative space-y-6">
                <div className="absolute left-[11px] top-6 bottom-6 w-[2px] bg-border z-0" />
                
                <LocationSearch 
                  placeholder="Pickup Location"
                  value={pickup}
                  iconBorderColor="border-emerald-500"
                  userLat={pickupLat || DEFAULT_LAT}
                  userLng={pickupLng || DEFAULT_LNG}
                  onChange={(val, lat, lng) => {
                    setPickup(val);
                    if (lat && lng) {
                      setPickupLat(lat);
                      setPickupLng(lng);
                    }
                  }}
                />
                
                <LocationSearch 
                  placeholder="Where to?"
                  value={dropoff}
                  iconBorderColor="border-orange-500"
                  userLat={pickupLat || DEFAULT_LAT}
                  userLng={pickupLng || DEFAULT_LNG}
                  onChange={(val, lat, lng) => {
                    setDropoff(val);
                    if (lat && lng) {
                      setDropoffLat(lat);
                      setDropoffLng(lng);
                    }
                  }}
                />
              </div>
              
              <button 
                onClick={handleGetLocation} 
                disabled={gettingLocation}
                className="mt-8 flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors w-full justify-center bg-emerald-50 dark:bg-emerald-950/30 py-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/50"
              >
                {gettingLocation ? <Loader2 className="h-5 w-5 animate-spin" /> : <LocateFixed className="h-5 w-5" />}
                Use Current Location
              </button>
            </div>
          )}

          {/* VEHICLE SELECTION MODE */}
          {showVehicleSelection && (
            <div className="animate-in slide-in-from-bottom-8 fade-in duration-300 flex flex-col h-full">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-foreground">Choose a Ride</h2>
                <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-900/50">
                  {distanceVal.toFixed(1)} km
                </div>
              </div>
              
              <div className="space-y-4 flex-1">
                <button 
                  onClick={() => handleBookRide("bike")} 
                  disabled={loading}
                  className="w-full group flex items-center justify-between rounded-3xl border border-border bg-card p-5 transition-all hover:border-emerald-500 hover:shadow-lg focus:outline-none disabled:opacity-50 hover:bg-accent"
                >
                  <div className="flex items-center gap-5">
                    <div className="rounded-full bg-emerald-100/50 dark:bg-emerald-900/30 p-4 group-hover:bg-emerald-500 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all">
                      <Bike className="h-8 w-8 text-emerald-600 dark:text-emerald-400 group-hover:text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-xl text-foreground">TransO Bike</h3>
                      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">~{(distanceVal * 3).toFixed(0)} mins away</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <h3 className="font-black text-2xl text-foreground">₹{Math.max(50, Math.round(distanceVal * 12))}</h3>
                  </div>
                </button>

                <button 
                  onClick={() => handleBookRide("car")} 
                  disabled={loading}
                  className="w-full group flex items-center justify-between rounded-3xl border border-border bg-card p-5 transition-all hover:border-emerald-500 hover:shadow-lg focus:outline-none disabled:opacity-50 hover:bg-accent"
                >
                  <div className="flex items-center gap-5">
                    <div className="rounded-full bg-emerald-100/50 dark:bg-emerald-900/30 p-4 group-hover:bg-emerald-500 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all">
                      <Car className="h-8 w-8 text-emerald-600 dark:text-emerald-400 group-hover:text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-xl text-foreground">TransO Cab</h3>
                      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">~{(distanceVal * 4).toFixed(0)} mins away</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <h3 className="font-black text-2xl text-foreground">₹{Math.max(50, Math.round(distanceVal * 20))}</h3>
                  </div>
                </button>
              </div>
              
              {!user?.id && (
                <button 
                  onClick={() => window.location.href = "/login"}
                  className="mt-4 w-full bg-emerald-600 dark:bg-emerald-700 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors shadow-lg"
                >
                  Sign in to Book a Ride
                </button>
              )}
              
              <button 
                onClick={() => {
                  setDropoff("");
                }}
                className="mt-8 w-full text-center text-sm font-bold text-muted-foreground hover:text-foreground py-3 border border-border rounded-xl transition-colors hover:bg-slate-50 dark:hover:bg-neutral-800"
              >
                Back to Search
              </button>
              
              {loading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                  <div className="bg-card p-8 rounded-3xl shadow-2xl flex flex-col items-center border border-border animate-in zoom-in-95 duration-200">
                    <Loader2 className="h-12 w-12 animate-spin text-emerald-500 mb-6" />
                    <p className="font-black text-xl">Booking your ride...</p>
                    <p className="text-muted-foreground mt-2 text-sm font-medium">Finding the best driver nearby</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* RIGHT PANEL - MAP */}
      <div className="flex-1 relative z-0 bg-slate-100 dark:bg-neutral-800">
        <Map 
          center={[pickupLat || DEFAULT_LAT, pickupLng || DEFAULT_LNG]}
          zoom={14}
          markers={mapMarkers}
        />
        <div className="absolute top-6 right-6 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-md px-5 py-2.5 rounded-full shadow-lg border border-border flex items-center gap-3 z-10 text-sm font-bold text-foreground">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          {onlineDrivers.length} Drivers Nearby
        </div>
        
        {error && (
          <div className="absolute top-6 left-6 max-w-sm z-10 rounded-xl bg-red-500/95 backdrop-blur-md p-4 text-sm font-bold text-white shadow-xl border border-red-600">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
