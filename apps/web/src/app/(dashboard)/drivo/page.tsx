"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useAuth } from "@/hooks/use-auth";
import { Power, Wallet, Navigation2, CheckCircle2, Loader2, Info, Clock, MapPin, Car, Bike } from "lucide-react";
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
    return (
      <div className="flex h-[calc(100vh-2rem)] w-full items-center justify-center bg-slate-50 dark:bg-neutral-900 p-4 lg:p-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-black tracking-tight text-orange-500 mb-6">Become a DrivO</h1>
            <p className="text-xl text-muted-foreground font-medium mb-10">Partner with us & earn on your own schedule with zero hassle.</p>
            <div className="space-y-6">
              <div className="flex gap-5 items-center p-6 bg-orange-50 dark:bg-orange-950/30 rounded-3xl border border-orange-100 dark:border-orange-900/50">
                <Car className="w-10 h-10 text-orange-500" />
                <div>
                  <h3 className="font-bold text-lg text-foreground">Flexible Hours</h3>
                  <p className="text-sm text-muted-foreground">Drive when you want, earn what you need.</p>
                </div>
              </div>
              <div className="flex gap-5 items-center p-6 bg-emerald-50 dark:bg-emerald-950/30 rounded-3xl border border-emerald-100 dark:border-emerald-900/50">
                <Wallet className="w-10 h-10 text-emerald-500" />
                <div>
                  <h3 className="font-bold text-lg text-foreground">Instant Payouts</h3>
                  <p className="text-sm text-muted-foreground">Get paid directly to your digital wallet.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-[2.5rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-border">
            <h2 className="text-3xl font-bold mb-8 text-foreground">Register your vehicle</h2>
            
            {error && (
              <div className="mb-8 rounded-2xl bg-red-50 p-5 text-sm font-bold text-red-600 flex items-center gap-3 border border-red-100">
                <Info className="h-5 w-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
            
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wider">Vehicle Type</label>
                <div className="grid grid-cols-2 gap-4">
                  {["bike", "car"].map(t => (
                    <button 
                      key={t} 
                      onClick={() => setVehicleType(t)}
                      className={`rounded-2xl py-5 text-sm font-bold uppercase transition-all flex flex-col items-center gap-3 border-2 hover:shadow-md ${
                        vehicleType === t 
                          ? "border-orange-500 bg-orange-50 dark:bg-orange-950/30 text-orange-600" 
                          : "border-border bg-background text-muted-foreground hover:border-orange-200"
                      }`}
                    >
                      {t === "bike" ? <Bike className="h-8 w-8" /> : <Car className="h-8 w-8" />}
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wider">Registration Number</label>
                <input 
                  className="w-full rounded-2xl border-2 border-border bg-slate-50 dark:bg-neutral-900 px-5 py-4 text-foreground font-bold focus:outline-none focus:border-orange-500 focus:bg-background transition-colors uppercase placeholder:normal-case placeholder:font-medium placeholder:text-muted-foreground"
                  placeholder="e.g. TN-01-AB-1234"
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value)}
                />
              </div>
              
              <button 
                onClick={submitApplication} 
                disabled={submitting}
                className="mt-4 w-full flex items-center justify-center rounded-2xl bg-orange-500 py-5 font-bold text-lg text-white transition-all hover:bg-orange-600 hover:shadow-[0_8px_20px_rgba(249,115,22,0.4)] active:scale-95 disabled:opacity-70 disabled:hover:shadow-none"
              >
                {submitting ? <Loader2 className="h-6 w-6 animate-spin" /> : "Start Driving Today"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] w-full overflow-hidden bg-background rounded-xl border border-border shadow-sm">
      {/* HEADER BAR */}
      <div className="flex items-center justify-between p-6 bg-card border-b border-border z-10 shrink-0">
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-black text-foreground hidden sm:block">DrivO Dashboard</h1>
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-neutral-900 px-5 py-2.5 rounded-full border border-border">
            <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/40 p-2">
              <Wallet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Wallet Balance</p>
              <p className="text-xl font-bold text-foreground">₹{driver.wallet_balance || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 mr-4">
            <div className={`relative flex h-3 w-3`}>
              {driver.status === 'online' && <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></div>}
              <div className={`relative inline-flex rounded-full h-3 w-3 ${driver.status === 'online' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
            </div>
            <p className="text-sm font-bold text-foreground uppercase tracking-wider">{driver.status}</p>
          </div>
          
          <button 
            onClick={toggleStatus}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold transition-all shadow-sm ${
              driver.status === 'online' 
                ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 dark:bg-red-950/30 dark:border-red-900/50" 
                : "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/50"
            }`}
          >
            <Power className="h-4 w-4" />
            {driver.status === 'online' ? 'GO OFFLINE' : 'GO ONLINE'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* LEFT PANEL - RIDES */}
        <div className="w-full md:w-[450px] lg:w-[500px] flex flex-col bg-card/95 backdrop-blur-xl border-r border-border z-10 shadow-[4px_0_24px_rgba(0,0,0,0.05)] h-full">
          <div className="p-6 md:p-8 overflow-y-auto flex-1">
            {driver.status === "offline" && !activeRide && (
              <div className="rounded-3xl border border-dashed border-border p-10 text-center flex flex-col items-center justify-center h-full gap-4">
                <div className="bg-slate-100 dark:bg-neutral-800 p-6 rounded-full mb-2">
                  <Power className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground">You are offline</h3>
                <p className="text-muted-foreground">Go online to receive new ride requests.</p>
                {driver.pending_commission > 0 && (
                  <div className="mt-6 w-full text-red-600 font-bold bg-red-50 dark:bg-red-950/30 p-5 rounded-2xl border border-red-200 dark:border-red-900/50">
                    You owe ₹{driver.pending_commission} in pending commissions. Please pay to admin to resume going online.
                  </div>
                )}
              </div>
            )}
            
            {/* ACTIVE RIDE */}
            {activeRide && (
              <div className="rounded-3xl bg-card border border-orange-200 dark:border-orange-900/50 shadow-lg p-1 mb-8">
                <div className="bg-orange-50 dark:bg-orange-950/20 rounded-[1.4rem] p-6">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-500 text-white p-2 rounded-xl">
                        <Clock className="h-5 w-5" />
                      </div>
                      <h2 className="text-2xl font-black text-orange-700 dark:text-orange-400">Active Ride</h2>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-6 bg-card rounded-2xl p-6 shadow-sm border border-border">
                    <div className="flex items-start gap-4">
                      <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2.5 rounded-full shrink-0">
                        <MapPin className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Pickup</p>
                        <p className="text-lg font-bold text-foreground">{activeRide.pickup_address}</p>
                      </div>
                    </div>
                    
                    <div className="h-px w-full bg-border" />
                    
                    <div className="flex items-start gap-4">
                      <div className="bg-orange-100 dark:bg-orange-900/30 p-2.5 rounded-full shrink-0">
                        <Navigation2 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Drop-off</p>
                        <p className="text-lg font-bold text-foreground">{activeRide.dropoff_address}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between p-5 bg-slate-50 dark:bg-neutral-900 rounded-xl border border-border">
                      <p className="text-lg font-bold text-foreground">Estimated Fare</p>
                      <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">₹{activeRide.estimated_price}</p>
                    </div>
                    
                    <button 
                      onClick={completeRide}
                      className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-foreground text-background py-5 font-bold text-lg transition-transform active:scale-95 shadow-md"
                    >
                      <CheckCircle2 className="h-6 w-6" />
                      Complete Ride
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* PENDING RIDES */}
            {driver.status === "online" && !activeRide && (
              <>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-foreground">Incoming Requests</h2>
                  <span className="rounded-full bg-orange-100 dark:bg-orange-900/40 px-4 py-1.5 text-sm font-bold text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900/50">
                    {pendingRides.length} Available
                  </span>
                </div>
                
                {pendingRides.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground flex flex-col items-center gap-4 mt-12">
                    <div className="bg-slate-100 dark:bg-neutral-800 p-6 rounded-full">
                      <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
                    </div>
                    <div>
                      <p className="font-bold text-lg text-foreground mb-1">Searching for rides...</p>
                      <p className="text-sm">We'll notify you when a request matches your area.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {pendingRides.map(ride => (
                      <div key={ride.id} className="flex flex-col p-6 rounded-3xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow gap-5">
                        <div className="flex items-start gap-4">
                          <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2.5 rounded-full shrink-0">
                            <Navigation2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Pickup</p>
                            <p className="text-base font-bold text-foreground truncate">{ride.pickup_address}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between bg-slate-50 dark:bg-neutral-900 p-4 rounded-2xl border border-border">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Est. Fare</p>
                            <p className="text-2xl font-black text-orange-600 dark:text-orange-400">₹{ride.estimated_price}</p>
                          </div>
                          <button 
                            onClick={() => acceptRide(ride.id)}
                            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-bold text-white transition-colors hover:bg-emerald-600 shadow-lg shadow-emerald-500/30"
                          >
                            <CheckCircle2 className="h-5 w-5" />
                            Accept
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* RIGHT PANEL - MAP */}
        <div className="flex-1 relative z-0 bg-slate-100 dark:bg-neutral-800">
          {(driver.status === "online" || activeRide) ? (
            <Map 
              center={currentLoc}
              zoom={13}
              markers={[
                { position: currentLoc, title: "You are here" },
                ...(activeRide ? [{
                  position: [activeRide.pickup_lat, activeRide.pickup_lng] as [number, number],
                  title: "Pickup Location"
                }, {
                  position: [activeRide.dropoff_lat, activeRide.dropoff_lng] as [number, number],
                  title: "Destination"
                }] : pendingRides.map(r => ({
                  position: [r.pickup_lat, r.pickup_lng] as [number, number],
                  title: `Ride to ${r.dropoff_address || 'Destination'}`
                })))
              ]}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-200/50 dark:bg-neutral-900/50 backdrop-blur-sm">
              <div className="bg-white/80 dark:bg-black/80 px-8 py-4 rounded-full font-bold text-muted-foreground backdrop-blur-md shadow-sm border border-border">
                Map offline
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
