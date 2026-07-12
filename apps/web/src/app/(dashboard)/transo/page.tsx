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
  
  const [pickupLng, setPickupLng] = useState<number | null>(null);
  const [dropoffLat, setDropoffLat] = useState<number | null>(null);
  const [dropoffLng, setDropoffLng] = useState<number | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleGetLocation = () => {
    setGettingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPickupLat(position.coords.latitude);
          setPickupLng(position.coords.longitude);
          setPickup((prev) => prev ? prev : "Current Location");
          setGettingLocation(false);
        },
        (error) => {
          console.error("High accuracy error", error);
          // Fallback to low accuracy
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              setPickupLat(pos.coords.latitude);
              setPickupLng(pos.coords.longitude);
              setPickup((prev) => prev ? prev : "Current Location");
              setGettingLocation(false);
            },
            (err) => {
              console.error("Low accuracy error", err);
              setGettingLocation(false);
              setError("Could not get your location automatically. Please type it below.");
            },
            { timeout: 10000, maximumAge: 60000 }
          );
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setGettingLocation(false);
    }
  };

  useEffect(() => {
    handleGetLocation();
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

  const handleBookRide = async (type: string) => {
    if (!pickup.trim() || !dropoff.trim()) {
      setError("Please enter both pickup and drop-off locations.");
      return;
    }
    setError(null);
    setLoading(true);
    
    try {
      const mockLat = pickupLat || 13.0827; 
      const mockLng = pickupLng || 80.2707;
      
      const { data, error: insertError } = await supabase
        .from("rides")
        .insert({
          passenger_id: user?.id,
          pickup_address: pickup,
          dropoff_address: dropoff,
          pickup_lat: pickupLat || mockLat,
          pickup_lng: pickupLng || mockLng,
          dropoff_lat: dropoffLat || mockLat + 0.05,
          dropoff_lng: dropoffLng || mockLng + 0.05,
          status: "pending",
          estimated_price: type === "bike" ? 50 : type === "car" ? 150 : 250
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

  if (activeRide) {
    return (
      <div className="mx-auto max-w-xl py-10 px-4">
        <div className="rounded-2xl border border-orange-100 bg-orange-50 p-6 shadow-sm mb-6 flex items-center gap-4">
          <Clock className="h-6 w-6 text-orange-600" />
          <h2 className="text-xl font-bold text-orange-800">
            {activeRide.status === "pending" ? "Looking for nearby drivers..." : "Driver is on the way!"}
          </h2>
        </div>
        
        <div className="mb-6 rounded-3xl overflow-hidden shadow-md h-64 border border-border z-0 relative">
          <Map 
            center={[activeRide.pickup_lat || 13.0827, activeRide.pickup_lng || 80.2707]}
            zoom={14}
            markers={[
              { position: [activeRide.pickup_lat || 13.0827, activeRide.pickup_lng || 80.2707], title: "Pickup Location" },
              { position: [activeRide.dropoff_lat || 13.1, activeRide.dropoff_lng || 80.3], title: "Destination" },
            ]}
          />
        </div>
        
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-800">
              ₹{activeRide.estimated_price}
            </span>
          </div>
          
          <h3 className="text-lg font-semibold mb-6">Ride Details</h3>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <MapPin className="h-6 w-6 text-emerald-500 mt-1" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pickup</p>
                <p className="text-foreground font-medium">{activeRide.pickup_address}</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Navigation className="h-6 w-6 text-orange-500 mt-1" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Drop-off</p>
                <p className="text-foreground font-medium">{activeRide.dropoff_address}</p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleCancelRide}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 py-3 font-semibold text-red-600 transition-colors hover:bg-red-100"
          >
            <XCircle className="h-5 w-5" />
            Cancel Ride
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl py-8 px-4">
      <div className="mb-8 rounded-3xl overflow-hidden shadow-md h-48 sm:h-64 border border-border z-0 relative">
        <Map 
          center={[pickupLat || 13.0827, pickupLng || 80.2707]}
          zoom={14}
          markers={
            pickupLat && pickupLng 
              ? [{ position: [pickupLat, pickupLng], title: "Your Location" }]
              : []
          }
        />
      </div>
      
      <div className="mb-8 rounded-2xl bg-gradient-to-br from-emerald-50 to-slate-50 p-8 shadow-sm border border-border">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Book a Ride</h1>
        <p className="text-muted-foreground mt-2">Where to?</p>
      </div>
      
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm mb-8">
        <div className="relative space-y-4">
          <div className="absolute left-[11px] top-6 bottom-6 w-[2px] bg-border z-0" />
          
          <LocationSearch 
            placeholder="Pickup Location"
            value={pickup}
            iconBorderColor="border-emerald-500"
            onChange={(val, lat, lng) => {
              setPickup(val);
              if (lat && lng) {
                setPickupLat(lat);
                setPickupLng(lng);
              }
            }}
          />
          
          <LocationSearch 
            placeholder="Destination"
            value={dropoff}
            iconBorderColor="border-orange-500"
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
          className="mt-4 flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          {gettingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
          Use my current location
        </button>
      </div>

      {pickup.length > 2 && dropoff.length > 2 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Choose a Vehicle</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <button 
              onClick={() => handleBookRide("bike")} 
              disabled={loading}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:border-emerald-500 hover:shadow-md focus:outline-none disabled:opacity-50"
            >
              <div className="rounded-xl bg-emerald-50 p-3">
                <Bike className="h-8 w-8 text-emerald-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-bold text-foreground">TransO Bike</h3>
                <p className="text-sm text-muted-foreground">Quick & affordable</p>
              </div>
              <span className="font-bold text-emerald-600">₹50</span>
            </button>

            <button 
              onClick={() => handleBookRide("car")} 
              disabled={loading}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:border-emerald-500 hover:shadow-md focus:outline-none disabled:opacity-50"
            >
              <div className="rounded-xl bg-emerald-50 p-3">
                <Car className="h-8 w-8 text-emerald-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-bold text-foreground">TransO Cab</h3>
                <p className="text-sm text-muted-foreground">Comfortable cars</p>
              </div>
              <span className="font-bold text-emerald-600">₹150</span>
            </button>
          </div>
          
          {loading && (
            <div className="mt-8 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
