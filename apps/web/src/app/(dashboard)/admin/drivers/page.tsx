"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Check, X, Car, DollarSign, Wallet, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Driver {
  id: string;
  user_id: string;
  status: string;
  is_verified: boolean;
  vehicle_type: string;
  vehicle_registration: string;
  wallet_balance: number;
  pending_commission: number;
  created_at: string;
  name?: string;
  mobile_number?: string;
  whatsapp_number?: string;
  driving_license?: string;
  upi_id?: string | null;
  profile?: {
    full_name: string | null;
    email: string | null;
  };
}

export default function DriversManagementPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/drivers?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
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

  const handleToggleVerification = async (driver: Driver) => {
    setProcessingId(driver.id + "-verify");
    try {
      const res = await fetch("/api/admin/drivers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driver_id: driver.id,
          is_verified: !driver.is_verified,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchDrivers();
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update verification status");
    } finally {
      setProcessingId(null);
    }
  };

  const handleClearCommission = async (driver: Driver) => {
    if (!confirm("Are you sure you want to clear the pending commission for this driver? This means they have paid their dues.")) return;
    
    setProcessingId(driver.id + "-comm");
    try {
      const res = await fetch("/api/admin/drivers/clear-commission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driver_id: driver.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchDrivers();
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to clear commission");
    } finally {
      setProcessingId(null);
    }
  };

  const handleAddFunds = async (driver: Driver) => {
    const amountStr = prompt(`Enter amount to add to ${driver.name || 'driver'}'s wallet:`);
    if (!amountStr) return;
    
    const amount = parseInt(amountStr);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid positive number");
      return;
    }
    
    setProcessingId(driver.id + "-funds");
    try {
      const res = await fetch("/api/admin/drivers/add-funds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driver_id: driver.id,
          amount: amount
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Successfully added ₹${amount} to wallet.`);
        fetchDrivers();
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to add funds");
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdateUpi = async (driver: Driver) => {
    const upi = prompt(`Enter UPI ID for ${driver.name || 'this driver'} (e.g. name@okhdfcbank):`, driver.upi_id || "");
    if (upi === null) return;
    
    setProcessingId(driver.id + "-upi");
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { error } = await supabase.from('drivers').update({ upi_id: upi.trim() }).eq('id', driver.id);
      if (error) throw error;
      alert("UPI ID updated successfully!");
      fetchDrivers();
    } catch (err: any) {
      console.error(err);
      alert("Failed to update UPI ID: " + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteDriver = async (driver: Driver) => {
    if (!confirm("Are you sure you want to completely remove this driver? This action cannot be undone.")) return;
    
    setProcessingId(driver.id + "-delete");
    try {
      const res = await fetch(`/api/admin/drivers?id=${driver.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        fetchDrivers();
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete driver");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading drivers...</div>;
  }

  return (
    <div className="flex h-full flex-col p-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Car className="w-8 h-8 text-primary" />
          Driver Management
        </h1>
        <p className="text-muted-foreground">
          Manage all registered drivers, verifications, and commissions.
        </p>
      </div>

      {drivers.length === 0 ? (
        <Card className="border-dashed bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <Car className="w-12 h-12 mb-4 opacity-20" />
            <p>No drivers found on the platform.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {drivers.map((driver) => (
            <Card key={driver.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 gap-6">
                
                {/* Driver Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold truncate">
                      {driver.name || driver.profile?.full_name || "Unknown Driver"}
                    </h3>
                    <Badge variant={driver.is_verified ? "default" : "secondary"} className={driver.is_verified ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                      {driver.is_verified ? "Verified" : "Unverified"}
                    </Badge>
                    <Badge variant="outline" className={driver.status === 'online' ? "text-emerald-500 border-emerald-500" : "text-muted-foreground"}>
                      {driver.status?.toUpperCase() || 'OFFLINE'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2 text-sm text-muted-foreground mt-3">
                    <div><span className="font-medium text-foreground">Email:</span> {driver.profile?.email || "N/A"}</div>
                    <div><span className="font-medium text-foreground">Phone:</span> {driver.mobile_number || "N/A"}</div>
                    <div><span className="font-medium text-foreground">WhatsApp:</span> {driver.whatsapp_number || "N/A"}</div>
                    <div><span className="font-medium text-foreground">License:</span> {driver.driving_license || "N/A"}</div>
                    <div><span className="font-medium text-foreground">Vehicle:</span> <span className="capitalize">{driver.vehicle_type || 'Car'}</span></div>
                    <div><span className="font-medium text-foreground">Reg No:</span> {driver.vehicle_registration?.toUpperCase() || 'N/A'}</div>
                    <div><span className="font-medium text-foreground">Joined:</span> {format(new Date(driver.created_at), "MMM d, yyyy")}</div>
                    <div className="col-span-full"><span className="font-medium text-foreground">UPI ID:</span> {driver.upi_id || <span className="text-red-500 font-bold">Not Set</span>}</div>
                  </div>
                </div>

                {/* Financials */}
                <div className="bg-slate-50 dark:bg-neutral-900 p-4 rounded-xl flex gap-6 shrink-0 border border-border">
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider flex items-center gap-1">
                      <Wallet className="w-3 h-3" /> Wallet
                    </span>
                    <span className="text-xl font-bold text-blue-500 dark:text-blue-400">₹{driver.wallet_balance || 0}</span>
                  </div>
                  <div className="w-px bg-border"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider flex items-center gap-1">
                      <DollarSign className="w-3 h-3" /> Owed
                    </span>
                    <span className={`text-xl font-bold ${driver.pending_commission > 0 ? "text-red-500" : "text-emerald-500"}`}>
                      ₹{driver.pending_commission || 0}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-row md:flex-col items-center gap-2 shrink-0 w-full md:w-auto">
                  <Button
                    variant={driver.is_verified ? "outline" : "default"}
                    className={!driver.is_verified ? "bg-emerald-600 hover:bg-emerald-700 text-white w-full" : "w-full"}
                    size="sm"
                    disabled={processingId === driver.id + "-verify"}
                    onClick={() => handleToggleVerification(driver)}
                  >
                    {driver.is_verified ? (
                      <><X className="w-4 h-4 mr-1" /> Revoke</>
                    ) : (
                      <><Check className="w-4 h-4 mr-1" /> Verify</>
                    )}
                  </Button>
                  
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full bg-blue-100 text-blue-700 hover:bg-blue-200"
                    disabled={processingId === driver.id + "-funds"}
                    onClick={() => handleAddFunds(driver)}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Funds
                  </Button>
                  
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full bg-orange-100 text-orange-700 hover:bg-orange-200"
                    disabled={processingId === driver.id + "-comm" || (driver.pending_commission || 0) <= 0}
                    onClick={() => handleClearCommission(driver)}
                  >
                    <DollarSign className="w-4 h-4 mr-1" /> Clear Dues
                  </Button>
                  
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full bg-purple-100 text-purple-700 hover:bg-purple-200 mt-2"
                    disabled={processingId === driver.id + "-upi"}
                    onClick={() => handleUpdateUpi(driver)}
                  >
                    <Check className="w-4 h-4 mr-1" /> Set UPI
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full mt-2"
                    disabled={processingId === driver.id + "-delete"}
                    onClick={() => handleDeleteDriver(driver)}
                  >
                    <X className="w-4 h-4 mr-1" /> Remove
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
