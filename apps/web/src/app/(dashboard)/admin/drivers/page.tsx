"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Car, MapPin, Navigation, Signal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Driver {
  id: string;
  user_id: string;
  account_id: string;
  status: string;
  created_at: string;
  current_lat?: number;
  current_lng?: number;
  profile?: {
    full_name: string | null;
    email: string | null;
  };
  vehicle?: {
    name: string;
    type: string;
    base_fare: number;
  };
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/drivers");
      const data = await res.json();
      if (data.drivers) {
        setDrivers(data.drivers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading drivers...</div>;
  }

  return (
    <div className="flex h-full flex-col p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Car className="w-8 h-8 text-primary" />
          Active Drivers
        </h1>
        <p className="text-muted-foreground">
          View all registered drivers on the DrivO platform and their current status.
        </p>
      </div>

      {drivers.length === 0 ? (
        <Card className="border-dashed bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <Car className="w-12 h-12 mb-4 opacity-20" />
            <p>No active drivers found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {drivers.map((driver) => (
            <Card key={driver.id} className="overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold truncate">
                      {driver.profile?.full_name || "Unknown Driver"}
                    </h3>
                    <p className="text-sm text-muted-foreground">{driver.profile?.email || "N/A"}</p>
                  </div>
                  <Badge variant={
                    driver.status === 'online' ? "default" :
                    driver.status === 'busy' ? "destructive" : "secondary"
                  } className={driver.status === 'online' ? "bg-emerald-600" : ""}>
                    {driver.status}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4" />
                    <span>{driver.vehicle?.name || "No vehicle assigned"} <span className="uppercase text-xs opacity-70">({driver.vehicle?.type})</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {driver.current_lat && driver.current_lng 
                        ? `${driver.current_lat.toFixed(4)}, ${driver.current_lng.toFixed(4)}`
                        : "Location unknown"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Signal className="w-4 h-4" />
                    <span>Joined {format(new Date(driver.created_at), "MMM d, yyyy")}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
