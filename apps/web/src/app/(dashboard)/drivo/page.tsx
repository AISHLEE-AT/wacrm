"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useAuth } from "@/hooks/use-auth";
import { Power, Wallet, Navigation2, CheckCircle2, Loader2, Info, Clock } from "lucide-react";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/Map"), { 
  ssr: false, 
  loading: () => <div className="h-full w-full bg-slate-100 dark:bg-neutral-800 animate-pulse flex items-center justify-center text-muted-foreground">Loading Map...</div> 
});

export default function DrivoDashboard() {
  const { user } = useAuth();
  
  const [driver, setDriver] = useState<any>(null);
  const [pendingRides, setPendingRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [appStatus, setAppStatus] = useState<string | null>(null);
  const [currentLoc, setCurrentLoc] = useState<[number, number]>([13.0827, 80.2707]);
  
  const [regNo, setRegNo] = useState("");
  const [vehicleType, setVehicleType] = useState("bike");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (!user?.id) return;
    loadDriverData();
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCurrentLoc([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.error("Error getting location", err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, [user?.id]);

  async function loadDriverData() {
    try {
      const { data: driverData } = await supabase
        .from("drivers")
        .select("*")
        .eq("user_id", user?.id)
        .single();
      
      if (driverData) {
        setDriver(driverData);
        loadPendingRides();
        subscribeToRides();
      } else {
        const { data: appData } = await supabase
          .from("driver_applications")
          .select("*")
          .eq("user_id", user?.id)
          .single();
        if (appData) setAppStatus(appData.status);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function subscribeToRides() {
    const channel = supabase
      .channel("public:rides")
      .on("postgres_changes", { event: "*", schema: "public", table: "rides" }, () => {
        loadPendingRides();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }

  async function loadPendingRides() {
    const { data } = await supabase
      .from("rides")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    
    if (data) setPendingRides(data);
  }

  async function loadActiveRide() {
    if (!driver) return;
    const { data } = await supabase
      .from("rides")
      .select("*")
      .eq("driver_id", driver.id)
      .in("status", ["accepted", "en_route"])
      .single();
    if (data) {
      setPendingRides([data]); // Just hijack pendingRides state or create a separate one. Let's create a separate state actually.
    }
  }
  
  // Wait, I need a separate state for activeRide. I'll just re-write the whole state logic for rides.
  // Actually, let's just make acceptRide change a local state to show the active ride.
  const [activeRide, setActiveRide] = useState<any>(null);

  useEffect(() => {
    if (driver) {
      const fetchActive = async () => {
        const { data } = await supabase
          .from("rides")
          .select("*")
          .eq("driver_id", driver.id)
          .in("status", ["accepted", "en_route"])
          .single();
        if (data) setActiveRide(data);
      };
      fetchActive();
    }
  }, [driver]);

  async function acceptRide(rideId: string) {
    if (!driver) return;
    try {
      const { data: updatedRide, error: rideErr } = await supabase.from("rides").update({
        status: "accepted",
        driver_id: driver.id
      }).eq("id", rideId).select().single();
      
      if (rideErr) throw rideErr;
      
      await supabase.from("drivers").update({ status: "busy" }).eq("id", driver.id);
      setDriver({ ...driver, status: "busy" });
      setActiveRide(updatedRide);
      loadPendingRides();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function completeRide() {
    if (!driver || !activeRide) return;
    try {
      // 1. Mark ride completed
      await supabase.from("rides").update({ status: "completed" }).eq("id", activeRide.id);
      
      // 2. Add 30% commission
      const commission = (activeRide.estimated_price || 0) * 0.3;
      const newPending = (driver.pending_commission || 0) + commission;
      
      await supabase.from("drivers").update({ 
        status: "online", 
        pending_commission: newPending 
      }).eq("id", driver.id);
      
      setDriver({ ...driver, status: "online", pending_commission: newPending });
      setActiveRide(null);
      loadPendingRides();
    } catch (err: any) {
      setError(err.message);
    }
  }

  const submitApplication = async () => {
    if (!regNo.trim()) {
      setError("Enter vehicle registration number.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      // AUTO-APPROVE: Directly create the driver record instead of a pending application
      const { data: newDriver, error: driverErr } = await supabase
        .from("drivers")
        .insert({
          user_id: user?.id,
          status: "offline",
          wallet_balance: 0,
          pending_commission: 0,
          is_blocked: false,
          vehicle_type: vehicleType,
          vehicle_registration: regNo
        })
        .select()
        .single();
        
      if (driverErr) throw driverErr;
      
      setDriver(newDriver);
      setAppStatus("approved");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async () => {
    if (!driver) return;
    
    // Check if they owe commission
    if (driver.status === "offline" && driver.pending_commission > 0) {
      setError("You must pay your pending commission before you can go online.");
      return;
    }
    
    setError(null);
    const newStatus = driver.status === "online" ? "offline" : "online";
    await supabase.from("drivers").update({ status: newStatus }).eq("id", driver.id);
    setDriver({ ...driver, status: newStatus });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!driver) {
    if (appStatus === "pending") {
      return (
        <div className="mx-auto max-w-md py-12 px-4 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 mb-6">
            <Info className="h-8 w-8 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Application Pending</h2>
          <p className="text-muted-foreground">Your driver application is under review by the admin. Check back later.</p>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-lg py-8 px-4">
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 p-8 shadow-sm border border-orange-200">
          <h1 className="text-3xl font-bold tracking-tight text-orange-900">Become a DrivO</h1>
          <p className="text-orange-700 mt-2">Register your vehicle and start earning today.</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">Vehicle Type</label>
            <div className="flex gap-4">
              {["bike", "car", "cargo"].map(t => (
                <button 
                  key={t} 
                  onClick={() => setVehicleType(t)}
                  className={`flex-1 rounded-xl py-3 text-sm font-bold uppercase transition-colors ${
                    vehicleType === t 
                      ? "bg-orange-600 text-white shadow-md" 
                      : "bg-muted text-muted-foreground hover:bg-orange-50"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">Registration Number</label>
            <input 
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g. TN-01-AB-1234"
              value={regNo}
              onChange={(e) => setRegNo(e.target.value)}
            />
          </div>
          
          <button 
            onClick={submitApplication} 
            disabled={submitting}
            className="w-full flex items-center justify-center rounded-xl bg-orange-600 py-4 font-bold text-white transition-colors hover:bg-orange-700 disabled:opacity-70"
          >
            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit Application"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl py-8 px-4">
      {/* Driver Controls */}
      <div className="mb-8 rounded-3xl bg-card border border-border shadow-md overflow-hidden">
        <div className="flex items-center justify-between p-6 bg-gradient-to-br from-white to-slate-50 dark:from-neutral-900 dark:to-neutral-950">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-emerald-100 p-3">
              <Wallet className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Wallet Balance</p>
              <p className="text-2xl font-bold text-foreground">₹{driver.wallet_balance || 0}</p>
            </div>
          </div>
          <div className="h-12 w-px bg-border" />
          <div className="flex items-center gap-4">
            <div className={`h-4 w-4 rounded-full ${driver.status === 'online' ? 'bg-emerald-500' : 'bg-red-500'}`} />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <p className="text-lg font-bold text-foreground uppercase">{driver.status}</p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={toggleStatus}
          className={`w-full flex items-center justify-center gap-2 py-4 transition-colors ${
            driver.status === 'online' 
              ? "bg-red-50 text-red-600 hover:bg-red-100" 
              : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
          }`}
        >
          <Power className="h-5 w-5" />
          <span className="font-bold tracking-wide">
            {driver.status === 'online' ? 'GO OFFLINE' : 'GO ONLINE'}
          </span>
        </button>
      </div>

      {driver.status === "online" && (
        <div className="mb-8 rounded-3xl overflow-hidden shadow-md h-72 border border-border z-0">
          <Map 
            center={currentLoc}
            zoom={13}
            markers={[
              { position: currentLoc, title: "You are here" },
              ...pendingRides.map(r => ({
                position: [r.pickup_lat, r.pickup_lng] as [number, number],
                title: `Ride to ${r.dropoff_address || 'Destination'}`
              }))
            ]}
          />
        </div>
      )}

      {/* Active Ride OR Pending Rides */}
      {activeRide ? (
        <div className="rounded-2xl bg-card border border-border shadow-sm p-6 mb-8 border-orange-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-orange-700 flex items-center gap-2">
              <Clock className="h-5 w-5" /> Active Ride
            </h2>
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <MapPin className="h-6 w-6 text-emerald-500 mt-1" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pickup</p>
                <p className="text-lg font-bold">{activeRide.pickup_address}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <Navigation2 className="h-6 w-6 text-orange-500 mt-1" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Drop-off</p>
                <p className="text-lg font-bold">{activeRide.dropoff_address}</p>
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-between p-4 bg-slate-50 dark:bg-neutral-900 rounded-xl">
              <p className="text-lg font-semibold text-foreground">Estimated Fare</p>
              <p className="text-2xl font-bold text-emerald-600">₹{activeRide.estimated_price}</p>
            </div>
            
            <button 
              onClick={completeRide}
              className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-black dark:bg-white text-white dark:text-black py-4 font-bold transition-transform active:scale-95"
            >
              <CheckCircle2 className="h-6 w-6" />
              Complete Ride
            </button>
          </div>
        </div>
      ) : driver.status === "online" && pendingRides.length > 0 && (
        <div className="rounded-2xl bg-card border border-border shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">Available Rides</h2>
            <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-600">
              {pendingRides.length}
            </span>
          </div>
          
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {pendingRides.map(ride => (
              <div key={ride.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl border border-border bg-slate-50 dark:bg-neutral-900 gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-2 mb-2">
                    <Navigation2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                    <p className="text-sm font-medium text-foreground line-clamp-2">{ride.pickup_address}</p>
                  </div>
                  <p className="text-lg font-bold text-orange-600 sm:ml-7">Est. Fare: ₹{ride.estimated_price}</p>
                </div>
                <button 
                  onClick={() => acceptRide(ride.id)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 font-bold text-white transition-colors hover:bg-emerald-700"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  Accept
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {driver.status === "offline" && !activeRide && (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground flex flex-col items-center gap-2">
          {driver.pending_commission > 0 && (
            <div className="mb-4 text-red-600 font-bold bg-red-50 p-4 rounded-xl border border-red-200">
              You owe ₹{driver.pending_commission} in pending commissions. Please pay to admin to resume going online.
            </div>
          )}
          Go online to see available ride requests.
        </div>
      )}
      
      {driver.status === "online" && pendingRides.length === 0 && !activeRide && (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
          No ride requests available right now. We'll notify you when one comes in!
        </div>
      )}
    </div>
  );
}
