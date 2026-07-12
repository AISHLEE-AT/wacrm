import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, LocateFixed, MapPin, Car, Bike, User, ShieldCheck } from "lucide-react";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/Map"), { 
  ssr: false, 
  loading: () => <div className="h-full w-full bg-slate-100 dark:bg-neutral-800 animate-pulse flex items-center justify-center text-muted-foreground">Loading Map...</div> 
});

export default function LocalConnect() {
  const { user } = useAuth();
  
  const [role, setRole] = useState<"traveler" | "transporter">("traveler");
  const [vehicleType, setVehicleType] = useState("bike taxi");
  const [radius, setRadius] = useState(10); // in km
  
  const [myLat, setMyLat] = useState<number | null>(null);
  const [myLng, setMyLng] = useState<number | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  
  const [isSharing, setIsSharing] = useState(false);
  const [myRequest, setMyRequest] = useState<any>(null);
  const [nearbyUsers, setNearbyUsers] = useState<any[]>([]);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleGetLocation = () => {
    setGettingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setMyLat(pos.coords.latitude);
          setMyLng(pos.coords.longitude);
          setGettingLocation(false);
        },
        (err) => {
          console.log(err);
          setGettingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
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
    
    const channel = supabase
      .channel("public:local_transport_requests")
      .on("postgres_changes", { event: "*", schema: "public", table: "local_transport_requests" }, (payload: any) => {
        handleRealtimeUpdate(payload);
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, myRequest, myLat, myLng, isSharing, role]);

  const handleRealtimeUpdate = (payload: any) => {
    if (myRequest && payload.new.id === myRequest.id) {
      setMyRequest(payload.new);
      return;
    }
    
    if (isSharing && myLat && myLng) {
      fetchNearbyUsers();
    }
  };

  const fetchNearbyUsers = async () => {
    if (!myLat || !myLng) return;
    
    const targetRole = role === "traveler" ? "transporter" : "traveler";
    
    const { data, error } = await supabase.rpc("get_nearby_transports", {
      query_lat: myLat,
      query_lng: myLng,
      query_radius_m: radius * 1000, 
      query_role: targetRole
    });
    
    if (data) {
      setNearbyUsers(data);
    }
  };

  const handleShareLocation = async () => {
    if (!myLat || !myLng || !user?.id) return;
    
    setIsSharing(true);
    
    const { data, error } = await supabase
      .from("local_transport_requests")
      .insert({
        user_id: user.id,
        role,
        vehicle_type: role === "transporter" ? vehicleType : null,
        lat: myLat,
        lng: myLng,
        radius_m: radius * 1000,
        status: "active"
      })
      .select()
      .single();
      
    if (data) {
      setMyRequest(data);
      fetchNearbyUsers();
    }
  };

  const handleAccept = async (targetId: string) => {
    if (!myRequest) return;
    
    // Update target
    await supabase
      .from("local_transport_requests")
      .update({ status: "matched", matched_with: user?.id })
      .eq("id", targetId);
      
    // Update self
    const { data } = await supabase
      .from("local_transport_requests")
      .update({ status: "matched", matched_with: myRequest.user_id })
      .eq("id", myRequest.id)
      .select()
      .single();
      
    if (data) setMyRequest(data);
  };
  
  const handleConfirm = async () => {
    if (!myRequest) return;
    
    const { data } = await supabase
      .from("local_transport_requests")
      .update({ status: "completed" })
      .eq("id", myRequest.id)
      .select()
      .single();
      
    if (data) setMyRequest(data);
  };

  const mapMarkers = nearbyUsers.map(u => ({
    position: [u.lat, u.lng] as [number, number],
    title: u.role === "traveler" ? "Traveler" : `Transporter (${u.vehicle_type})`
  }));
  
  if (myLat && myLng) {
    mapMarkers.push({ position: [myLat, myLng], title: "You" });
  }

  return (
    <div className="mx-auto max-w-4xl py-8 px-4 flex flex-col md:flex-row gap-8">
      {/* Sidebar Controls */}
      <div className="w-full md:w-1/3 flex flex-col gap-6">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-bold mb-6">Local Connect</h1>
          
          {!isSharing ? (
            <>
              <div className="flex gap-2 mb-6 p-1 bg-slate-100 dark:bg-neutral-800 rounded-xl">
                <button
                  onClick={() => setRole("traveler")}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${role === "traveler" ? "bg-white dark:bg-neutral-700 shadow-sm text-emerald-600" : "text-muted-foreground"}`}
                >
                  Traveler
                </button>
                <button
                  onClick={() => setRole("transporter")}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${role === "transporter" ? "bg-white dark:bg-neutral-700 shadow-sm text-indigo-600" : "text-muted-foreground"}`}
                >
                  Transporter
                </button>
              </div>

              {role === "traveler" && (
                <div className="mb-6 space-y-4">
                  <div>
                    <label className="text-sm font-bold text-muted-foreground mb-2 block">Search Radius ({radius}km)</label>
                    <input 
                      type="range" 
                      min="1" max="50" 
                      value={radius} 
                      onChange={(e) => setRadius(parseInt(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>
                </div>
              )}

              {role === "transporter" && (
                <div className="mb-6 space-y-4">
                  <div>
                    <label className="text-sm font-bold text-muted-foreground mb-2 block">Vehicle Type</label>
                    <select 
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="bike taxi">Bike Taxi</option>
                      <option value="car">Car</option>
                      <option value="mini bus">Mini Bus</option>
                      <option value="bus taxi">Bus Taxi</option>
                    </select>
                  </div>
                </div>
              )}

              <button 
                onClick={handleShareLocation}
                disabled={!myLat || !myLng}
                className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-md ${role === "traveler" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-indigo-600 hover:bg-indigo-700"} disabled:opacity-50`}
              >
                {!myLat ? "Getting Location..." : "Share Location & Find Matches"}
              </button>
            </>
          ) : (
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border ${myRequest?.status === 'matched' ? 'bg-amber-50 border-amber-200' : myRequest?.status === 'completed' ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                <h3 className="font-bold mb-2">Status</h3>
                <p className="text-sm font-medium">
                  {myRequest?.status === "active" && "Sharing location and searching for matches..."}
                  {myRequest?.status === "matched" && "You have a match! Please confirm to complete."}
                  {myRequest?.status === "completed" && "Ride confirmed successfully!"}
                </p>
                
                {myRequest?.status === "matched" && (
                  <button 
                    onClick={handleConfirm}
                    className="mt-4 w-full py-2 bg-emerald-600 text-white rounded-lg font-bold"
                  >
                    Confirm Ride
                  </button>
                )}
              </div>
              
              <button 
                onClick={() => {
                  setIsSharing(false);
                  setMyRequest(null);
                  setNearbyUsers([]);
                }}
                className="w-full py-3 rounded-xl border border-border font-bold text-muted-foreground hover:bg-slate-50 dark:hover:bg-neutral-800"
              >
                Stop Sharing
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Map and Results */}
      <div className="w-full md:w-2/3 flex flex-col gap-6">
        <div className="h-64 sm:h-96 rounded-3xl overflow-hidden shadow-md border border-border z-0">
          <Map 
            center={myLat && myLng ? [myLat, myLng] : [13.0827, 80.2707]}
            zoom={13}
            markers={mapMarkers}
          />
        </div>
        
        {isSharing && nearbyUsers.length > 0 && (
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">Nearby Matches ({nearbyUsers.length})</h2>
            <div className="space-y-4 max-h-60 overflow-y-auto">
              {nearbyUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-neutral-900 rounded-xl border border-border">
                  <div className="flex items-center gap-3">
                    {user.role === "traveler" ? <User className="text-emerald-600" /> : <Car className="text-indigo-600" />}
                    <div>
                      <p className="font-bold">{user.role === "traveler" ? "Traveler" : `Transporter (${user.vehicle_type})`}</p>
                      <p className="text-xs text-muted-foreground">Within {radius}km</p>
                    </div>
                  </div>
                  
                  {role === "transporter" && user.status === "active" && (
                    <button 
                      onClick={() => handleAccept(user.id)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm"
                    >
                      Accept
                    </button>
                  )}
                  {role === "traveler" && user.status === "active" && (
                    <button 
                      onClick={() => handleAccept(user.id)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold text-sm"
                    >
                      Request Ride
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
