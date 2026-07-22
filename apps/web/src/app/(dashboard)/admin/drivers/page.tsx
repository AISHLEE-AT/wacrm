"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Check, X, Car, DollarSign, Wallet, Plus, ShieldCheck, UserCheck, Phone, MessageSquare, Trash2, Edit3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Driver {
  id: string;
  user_id?: string;
  status: string;
  is_verified: boolean;
  vehicle_type: string;
  vehicle_registration?: string;
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

const VEHICLE_CATEGORIES = [
  { id: 'bike', name: 'Bike / Scooty' },
  { id: 'auto', name: 'Auto Rickshaw' },
  { id: 'car', name: 'Car / Taxi / SUV' },
  { id: 'van', name: 'Van / Mini-Bus' },
  { id: 'bus', name: 'Bus / Travels' },
  { id: 'truck', name: 'Lorry / Truck' },
];

export default function DriversManagementPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  // New Driver Form State
  const [newDriver, setNewDriver] = useState({
    name: '',
    mobile_number: '',
    whatsapp_number: '',
    vehicle_type: 'bike',
    vehicle_registration: '',
    driving_license: '',
    upi_id: '',
  });

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/drivers?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
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

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriver.name || !newDriver.mobile_number || !newDriver.vehicle_registration) {
      alert("Name, Mobile Number, and Vehicle Registration are required.");
      return;
    }

    try {
      const res = await fetch("/api/admin/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDriver),
      });
      const data = await res.json();
      if (data.success) {
        setShowEnrollModal(false);
        setNewDriver({
          name: '', mobile_number: '', whatsapp_number: '', vehicle_type: 'bike', vehicle_registration: '', driving_license: '', upi_id: ''
        });
        fetchDrivers();
      } else {
        alert("Error enrolling driver: " + data.error);
      }
    } catch (err) {
      alert("Failed to enroll driver");
    }
  };

  const handleToggleVerification = async (driver: Driver) => {
    setProcessingId(driver.id + "-verify");
    try {
      const res = await fetch("/api/admin/drivers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driver_id: driver.id, is_verified: !driver.is_verified }),
      });
      const data = await res.json();
      if (data.success) fetchDrivers();
      else alert("Error: " + data.error);
    } catch (err) {
      alert("Failed to update verification status");
    } finally {
      setProcessingId(null);
    }
  };

  const handleClearCommission = async (driver: Driver) => {
    if (!confirm("Clear pending commission dues for this driver?")) return;
    setProcessingId(driver.id + "-comm");
    try {
      const res = await fetch("/api/admin/drivers/clear-commission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driver_id: driver.id }),
      });
      const data = await res.json();
      if (data.success) fetchDrivers();
    } catch (err) {
      alert("Failed to clear commission");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRemoveDriver = async (driverId: string) => {
    if (!confirm("Are you sure you want to remove this driver?")) return;
    try {
      const res = await fetch(`/api/admin/drivers?id=${driverId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) fetchDrivers();
    } catch (err) {
      alert("Failed to remove driver");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Car className="w-7 h-7 text-primary" /> Driver & Operator Management
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage user driver registrations, enrollments, document verifications, and commissions.
          </p>
        </div>

        <Button
          onClick={() => setShowEnrollModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md"
        >
          <Plus className="w-4 h-4" /> Enroll New Driver
        </Button>
      </div>

      {/* Admin Manual Enrollment Modal */}
      {showEnrollModal && (
        <div className="bg-card border border-border p-5 rounded-xl space-y-4 shadow-xl animate-fade-in">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-500" /> Enroll New Driver (Admin Direct)
            </h3>
            <button onClick={() => setShowEnrollModal(false)} className="text-xs text-muted-foreground hover:text-foreground">✕ Close</button>
          </div>

          <form onSubmit={handleEnrollSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Driver Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar"
                value={newDriver.name}
                onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Mobile Number *</label>
              <input
                type="text"
                required
                placeholder="e.g. +91 9876543210"
                value={newDriver.mobile_number}
                onChange={(e) => setNewDriver({ ...newDriver, mobile_number: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Vehicle Category *</label>
              <select
                value={newDriver.vehicle_type}
                onChange={(e) => setNewDriver({ ...newDriver, vehicle_type: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-semibold focus:outline-none focus:border-primary"
              >
                {VEHICLE_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Vehicle Reg Number *</label>
              <input
                type="text"
                required
                placeholder="e.g. TN-39-AB-1234"
                value={newDriver.vehicle_registration}
                onChange={(e) => setNewDriver({ ...newDriver, vehicle_registration: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Driving License No</label>
              <input
                type="text"
                placeholder="e.g. TN-2024-998877"
                value={newDriver.driving_license}
                onChange={(e) => setNewDriver({ ...newDriver, driving_license: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">UPI ID for Payment</label>
              <input
                type="text"
                placeholder="e.g. 9876543210@upi"
                value={newDriver.upi_id}
                onChange={(e) => setNewDriver({ ...newDriver, upi_id: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div className="md:col-span-2 pt-2">
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm">
                Complete Enrollment
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Drivers List */}
      {loading ? (
        <div className="text-center p-12 text-muted-foreground">Loading registered drivers...</div>
      ) : drivers.length === 0 ? (
        <div className="text-center p-12 text-muted-foreground">No drivers enrolled yet. Click "Enroll New Driver" to add one.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {drivers.map((driver) => {
            const displayName = driver.name || driver.profile?.full_name || 'Registered Driver';
            const displayPhone = driver.mobile_number || 'N/A';
            const displayVehicleNo = driver.vehicle_registration || 'N/A';
            const displayLicense = driver.driving_license || 'N/A';
            const displayUpi = driver.upi_id || 'N/A';

            return (
              <Card key={driver.id} className="bg-card border-border hover:border-primary/50 transition shadow-sm">
                <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-bold text-foreground">{displayName}</h3>
                      <Badge className={driver.is_verified ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30" : "bg-amber-500/15 text-amber-500 border-amber-500/30"}>
                        {driver.is_verified ? "Verified Partner" : "Pending Verification"}
                      </Badge>
                      <Badge variant="outline" className="text-xs uppercase">{driver.status || 'Offline'}</Badge>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-muted-foreground">
                      <div><strong className="text-foreground">Phone:</strong> {displayPhone}</div>
                      <div><strong className="text-foreground">Category:</strong> {driver.vehicle_type}</div>
                      <div><strong className="text-foreground">Reg No:</strong> {displayVehicleNo}</div>
                      <div><strong className="text-foreground">License:</strong> {displayLicense}</div>
                      <div><strong className="text-foreground">UPI ID:</strong> {displayUpi}</div>
                      <div><strong className="text-foreground">Joined:</strong> {format(new Date(driver.created_at || Date.now()), "MMM dd, yyyy")}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      size="sm"
                      onClick={() => handleToggleVerification(driver)}
                      disabled={processingId === driver.id + "-verify"}
                      className={driver.is_verified ? "bg-amber-600 hover:bg-amber-700 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"}
                    >
                      {driver.is_verified ? "Unverify" : "Verify Partner"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleClearCommission(driver)}
                      disabled={processingId === driver.id + "-comm"}
                    >
                      Clear Dues
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveDriver(driver.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
