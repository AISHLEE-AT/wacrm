"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useAuth } from "@/hooks/use-auth";
import { Clock, Loader2, LocateFixed, MapPin, Navigation, XCircle, Phone, Bike, Car, User } from "lucide-react";
import { LocationSearch } from "@/components/LocationSearch";
import dynamic from "next/dynamic";
import Link from "next/link";

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
  
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [completedRideId, setCompletedRideId] = useState<string | null>(null);
  const [completedRideData, setCompletedRideData] = useState<any>(null);
  
  const [pickupLat, setPickupLat] = useState<number | null>(null);
  const [pickupLng, setPickupLng] = useState<number | null>(null);
  const [dropoffLat, setDropoffLat] = useState<number | null>(null);
  const [dropoffLng, setDropoffLng] = useState<number | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [exactDistanceKm, setExactDistanceKm] = useState<number | null>(null);
  const [exactDurationMins, setExactDurationMins] = useState<number | null>(null);

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
          fetchActiveRide();
        } else if (payload.new?.status === 'cancelled' || payload.new?.status === 'completed') {
          if (payload.new?.status === 'completed') {
            setCompletedRideId(payload.new.id);
            // Fetch driver details for UPI QR code
            supabase.from('drivers').select('*').eq('id', payload.new.driver_id).single().then(({ data: driverInfo }) => {
              setCompletedRideData({
                price: payload.new.estimated_price,
                driverName: driverInfo?.name || 'Driver',
                upiId: driverInfo?.upi_id
              });
              setShowRatingModal(true);
            });
          }
          setActiveRide(null);
          setPickup("");
          setDropoff("");
          setPickupLat(null);
          setPickupLng(null);
          setDropoffLat(null);
          setDropoffLng(null);
          setDirections(null);
          setExactDistanceKm(null);
          setExactDurationMins(null);
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
        .select("*, driver:drivers(*)")
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

  async function submitRating(rating: number) {
    if (!completedRideId) return;
    try {
      await supabase.from("rides").update({ rider_rating: rating }).eq("id", completedRideId);
    } catch (e) {
      console.error(e);
    } finally {
      setShowRatingModal(false);
      setCompletedRideId(null);
      setCompletedRideData(null);
    }
  }

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

  // Calculate directions whenever pickup and dropoff are fully selected
  useEffect(() => {
    if (pickupLat && pickupLng && dropoffLat && dropoffLng && window.google) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: new window.google.maps.LatLng(pickupLat, pickupLng),
          destination: new window.google.maps.LatLng(dropoffLat, dropoffLng),
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK && result) {
            setDirections(result);
            const leg = result.routes[0].legs[0];
            setExactDistanceKm(leg.distance!.value / 1000);
            setExactDurationMins(Math.round(leg.duration!.value / 60));
          } else {
            console.error(`Directions request failed: ${status}`);
          }
        }
      );
    } else {
      setDirections(null);
      setExactDistanceKm(null);
      setExactDurationMins(null);
    }
  }, [pickupLat, pickupLng, dropoffLat, dropoffLng]);

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
      
      // Basic Surge Pricing Logic (1.5x during peak hours)
      const now = new Date();
      const hour = now.getHours();
      let surgeMultiplier = 1.0;
      if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20)) {
        surgeMultiplier = 1.5;
      }
      
      const finalPrice = Math.max(50, Math.round(distance * baseRate * surgeMultiplier));
      
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

  const uniqueDrivers = new globalThis.Map();
  onlineDrivers.forEach((driver) => {
    if (driver.user_id === user?.id) return;
    if (driver.lat && driver.lng) {
      // Deduplicate by user_id
      uniqueDrivers.set(driver.user_id, driver);
    }
  });

  uniqueDrivers.forEach((driver) => {
    let iconUrl = "https://cdn-icons-png.flaticon.com/512/3204/3204061.png"; // default car
    if (driver.vehicle_type?.toLowerCase() === 'bike') {
      iconUrl = "https://cdn-icons-png.flaticon.com/512/1987/1987625.png";
    } else if (driver.vehicle_type?.toLowerCase() === 'auto') {
      iconUrl = "https://cdn-icons-png.flaticon.com/512/4736/4736173.png";
    }

    mapMarkers.push({
      position: [driver.lat, driver.lng] as [number, number],
      title: `Driver (${driver.vehicle_type || 'Car'}) - Ph: ${driver.mobile_number || 'N/A'}`,
      icon: iconUrl
    });
  });

  if (activeRide) {
    return (
      <div className="flex flex-col md:flex-row h-[calc(100vh-2rem)] w-full overflow-hidden bg-background rounded-xl border border-border shadow-sm">
        {/* LEFT PANEL - RIDE STATUS */}
        <div className="w-full md:w-[450px] flex flex-col bg-card/95 backdrop-blur-xl border-r border-border z-10 shadow-[4px_0_24px_rgba(0,0,0,0.05)]">
          <div className="p-6 md:p-8 overflow-y-auto">
            <div className="flex justify-end mb-4">
              <Link href="/drivo" className="text-sm px-4 py-2 bg-emerald-50 text-emerald-700 font-bold rounded-full border border-emerald-200 hover:bg-emerald-100 transition-colors">Drive with us (Switch to DrivO)</Link>
            </div>
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
              
              {activeRide.status !== "pending" && (
                <div className="mt-6 flex items-center justify-between p-4 rounded-xl border border-border bg-slate-50 dark:bg-neutral-800/50">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                      <User className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-lg">{activeRide.driver?.name || 'Driver Assigned'}</p>
                      <p className="text-sm text-muted-foreground font-medium">{activeRide.driver?.vehicle_number || 'Vehicle Details'}</p>
                    </div>
                  </div>
                  <a href={`tel:${activeRide.driver?.mobile_number || ''}`} className="h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors shadow-sm">
                    <Phone className="h-5 w-5" />
                  </a>
                </div>
              )}
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

  // Use exact distance if available, otherwise fallback to Haversine
  const distanceVal = exactDistanceKm !== null ? exactDistanceKm : ((pickupLat && dropoffLat) ? calculateDistance(pickupLat, pickupLng!, dropoffLat, dropoffLng!) : 0);
  const showVehicleSelection = pickup.length > 2 && dropoff.length > 2 && pickupLat && dropoffLat;

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-2rem)] w-full overflow-hidden bg-background rounded-xl border border-border shadow-sm">
      {/* LEFT PANEL - BOOKING CONTROLS */}
      <div className="w-full md:w-[450px] flex flex-col bg-card/95 backdrop-blur-xl border-r border-border z-10 shadow-[4px_0_24px_rgba(0,0,0,0.05)]">
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          
          {/* SEARCH MODE */}
          {!showVehicleSelection && (
            <div className="animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-black tracking-tight text-foreground">Book a Ride</h1>
                <Link href="/drivo" className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-700 font-bold rounded-full border border-emerald-200 hover:bg-emerald-100 transition-colors">Drive with us (Switch to DrivO)</Link>
              </div>
              
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
              <div className="flex justify-end mb-4">
                <Link href="/drivo" className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-700 font-bold rounded-full border border-emerald-200 hover:bg-emerald-100 transition-colors">Drive with us (Switch to DrivO)</Link>
              </div>
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
                      <h3 className="font-bold text-xl text-foreground">RidO Bike</h3>
                      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">~{exactDurationMins ?? (distanceVal * 3).toFixed(0)} mins away</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <h3 className="font-black text-2xl text-foreground">₹{Math.max(30, Math.round(20 + distanceVal * 8))}</h3>
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
                      <h3 className="font-bold text-xl text-foreground">RidO Cab</h3>
                      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">~{exactDurationMins ?? (distanceVal * 4).toFixed(0)} mins away</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <h3 className="font-black text-2xl text-foreground">₹{Math.max(70, Math.round(50 + distanceVal * 20))}</h3>
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
          directions={directions}
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
      
      {showRatingModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card p-8 rounded-2xl flex flex-col items-center shadow-xl border border-border text-center max-w-sm w-full">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Payment & Rating</h2>
            
            {completedRideData?.upiId ? (
              <div className="mb-6 flex flex-col items-center">
                <p className="font-bold text-sm mb-2">Scan to pay driver directly:</p>
                <div className="bg-white p-2 rounded-xl mb-3 shadow-sm border">
                  {/* Using a simple QR code API for the web */}
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=${completedRideData.upiId}&pn=${encodeURIComponent(completedRideData.driverName)}&am=${completedRideData.price}`} 
                    alt="UPI QR Code" 
                    className="w-44 h-44"
                  />
                </div>
                <p className="text-xl font-bold text-emerald-600">Amount: ₹{completedRideData.price}</p>
                <div className="w-full h-px bg-border my-4" />
              </div>
            ) : (
              <div className="mb-6">
                <p className="text-lg font-bold">Please pay ₹{completedRideData?.price || 0} via Cash/UPI</p>
                <div className="w-full h-px bg-border my-4" />
              </div>
            )}
            
            <p className="text-sm font-bold text-muted-foreground mb-3">Rate your ride:</p>
            <div className="flex gap-2 mb-6">
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} onClick={() => submitRating(star)} className="p-3 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                  <Star className="h-10 w-10 text-yellow-400 fill-yellow-400" />
                </button>
              ))}
            </div>
            <button onClick={() => { setShowRatingModal(false); setCompletedRideData(null); }} className="text-muted-foreground font-bold hover:text-foreground transition-colors">Skip</button>
          </div>
        </div>
      )}
    </div>
  );
}
