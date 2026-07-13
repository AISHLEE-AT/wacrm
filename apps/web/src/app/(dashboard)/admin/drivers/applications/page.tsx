"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Check, X, Clock, Car, ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DriverApplication {
  id: string;
  user_id: string;
  account_id: string;
  vehicle_type: string;
  registration_number: string;
  status: string;
  created_at: string;
  profile?: {
    full_name: string | null;
    email: string | null;
    account_id: string | null;
  };
}

export default function DriverApplicationsPage() {
  const [applications, setApplications] = useState<DriverApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/driver-applications");
      const data = await res.json();
      if (data.applications) {
        setApplications(data.applications);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleUpdateStatus = async (app: DriverApplication, newStatus: string) => {
    setProcessingId(app.id);
    try {
      const res = await fetch("/api/admin/driver-applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: app.id,
          status: newStatus,
          accountId: app.profile?.account_id, // fixed
          userId: app.user_id,
          vehicleType: app.vehicle_type,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchApplications();
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading applications...</div>;
  }

  return (
    <div className="flex h-full flex-col p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Car className="w-8 h-8 text-primary" />
          Driver Applications
        </h1>
        <p className="text-muted-foreground">
          Review and approve drivers who want to join the DrivO platform.
        </p>
      </div>

      {applications.length === 0 ? (
        <Card className="border-dashed bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <ShieldAlert className="w-12 h-12 mb-4 opacity-20" />
            <p>No driver applications found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {applications.map((app) => (
            <Card key={app.id} className="overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold truncate">
                      {app.profile?.full_name || "Unknown Driver"}
                    </h3>
                    <Badge variant={
                      app.status === 'approved' ? "default" :
                      app.status === 'rejected' ? "destructive" : "secondary"
                    }>
                      {app.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground flex flex-col sm:flex-row gap-2 sm:gap-4">
                    <span><span className="font-medium">Email:</span> {app.profile?.email || "N/A"}</span>
                    <span><span className="font-medium">Vehicle:</span> <span className="capitalize">{app.vehicle_type}</span></span>
                    <span><span className="font-medium">Reg No:</span> {app.registration_number.toUpperCase()}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Applied on {format(new Date(app.created_at), "MMM d, yyyy h:mm a")}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {app.status === 'pending' && (
                    <>
                      <Button
                        variant="default"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        size="sm"
                        disabled={processingId === app.id}
                        onClick={() => handleUpdateStatus(app, 'approved')}
                      >
                        {processingId === app.id ? "Processing..." : <><Check className="w-4 h-4 mr-1" /> Approve</>}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={processingId === app.id}
                        onClick={() => handleUpdateStatus(app, 'rejected')}
                      >
                        <X className="w-4 h-4 mr-1" /> Reject
                      </Button>
                    </>
                  )}
                  {app.status === 'approved' && (
                    <Button variant="outline" size="sm" disabled>
                      Approved
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
