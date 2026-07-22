'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Truck, Phone, MessageSquare, ShieldCheck, QrCode, Power, Send, CheckCircle, Clock, Zap, Crown, Award, ExternalLink } from 'lucide-react';
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

const VEHICLE_CATEGORIES = [
  { id: 'bike', name: 'Bike / Scooty', icon: '🛵' },
  { id: 'auto', name: 'Auto Rickshaw', icon: '🛺' },
  { id: 'car', name: 'Car / Taxi / SUV', icon: '🚗' },
  { id: 'van', name: 'Van / Mini-Bus', icon: '🚐' },
  { id: 'bus', name: 'Bus / Travels', icon: '🚌' },
  { id: 'truck', name: 'Lorry / Truck', icon: '🚛' },
];

const SUBSCRIPTION_PLANS = [
  { id: 'daily', name: 'Daily Pass', price: 29, duration: '1 Day', description: 'Unlimited RideO trip leads' },
  { id: 'weekly', name: 'Weekly Pass', price: 149, duration: '7 Days', description: 'Save 25% • Unlimited leads' },
  { id: 'monthly', name: 'Monthly Pro', price: 499, duration: '30 Days', description: 'Best Value • Priority leads' },
];

export default function DriveODashboard() {
  const { user: currentUser, profile } = useAuth();
  const [isOnline, setIsOnline] = useState(true);
  const [operatorCategory, setOperatorCategory] = useState<string>('truck');
  const [regNumber, setRegNumber] = useState<string>('TN-39-AB-1234');
  const [upiId, setUpiId] = useState<string>('916381029380@upi');
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>('monthly');
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Fetch real-time rides from Supabase matching vehicle category
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const { data } = await supabase
          .from('rides')
          .select('*')
          .in('status', ['requested', 'pending'])
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (data) setIncomingRequests(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchRequests();

    // Subscribe to real-time incoming rides
    const channel = supabase
      .channel('public:rides:driveo')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'rides' }, (payload) => {
        setIncomingRequests((prev) => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Commit Trip & Update Operator Status to BUSY
  const handleAcceptRide = async (ride: any) => {
    try {
      const { error } = await supabase
        .from('rides')
        .update({ status: 'accepted', driver_id: currentUser?.id })
        .eq('id', ride.id);

      if (!error) {
        setActiveOrder(ride);
        setIncomingRequests((prev) => prev.filter((r) => r.id !== ride.id));
        // Mark driver as BUSY in database so other riders see they are committed
        if (currentUser) {
          await supabase.from('drivers').update({ status: 'busy' }).eq('user_id', currentUser.id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteRide = async () => {
    if (!activeOrder) return;
    try {
      await supabase.from('rides').update({ status: 'completed' }).eq('id', activeOrder.id);
      setActiveOrder(null);
      if (currentUser) {
        await supabase.from('drivers').update({ status: 'online' }).eq('user_id', currentUser.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Zero Meta Cost: Driver Sends WhatsApp Message to CRM to Open 24-Hour Free Session Window!
  const getFreeActiveWhatsAppUrl = () => {
    const categoryObj = VEHICLE_CATEGORIES.find(c => c.id === operatorCategory) || VEHICLE_CATEGORIES[0];
    const text = `☀️ *GOOD MORNING FAGO CRM! I AM ACTIVE TODAY* ☀️\n\n` +
      `👤 *Operator Name:* ${profile?.full_name || 'Vehicle Partner'}\n` +
      `🚚 *Vehicle Category:* ${categoryObj.icon} ${categoryObj.name}\n` +
      `🔢 *Reg Number:* ${regNumber}\n` +
      `📍 *Status:* ONLINE & READY FOR TRIP REQUESTS!\n\n` +
      `👉 *Please send me customer ride/transport requests today!*`;

    return `https://api.whatsapp.com/send?phone=916381029380&text=${encodeURIComponent(text)}`;
  };

  const handleGoActiveWhatsApp = async () => {
    setIsOnline(true);
    try {
      if (currentUser) {
        await supabase.from('drivers').upsert({
          user_id: currentUser.id,
          name: profile?.full_name || 'Driver',
          mobile_number: profile?.phone || '916381029380',
          vehicle_type: operatorCategory,
          vehicle_number: regNumber,
          upi_id: upiId,
          status: 'online',
          updated_at: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error(err);
    }
    window.open(getFreeActiveWhatsAppUrl(), '_blank');
  };

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-foreground">
        <ShieldCheck className="w-12 h-12 text-primary mb-4" />
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p className="text-sm text-muted-foreground mt-1">Please sign in as a DriveO Operator.</p>
      </div>
    );
  }

  const selectedCategoryObj = VEHICLE_CATEGORIES.find((c) => c.id === operatorCategory) || VEHICLE_CATEGORIES[0];
  const selectedPlanObj = SUBSCRIPTION_PLANS.find(p => p.id === subscriptionPlan) || SUBSCRIPTION_PLANS[2];

  return (
    <div className="flex flex-col h-full space-y-6 max-w-6xl mx-auto p-4 sm:p-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Truck className="w-7 h-7 text-primary" />
            DriveO Operator & Driver Portal
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Trip Commitment Engine • Driver Subscription Management • Zero Meta Fee Architecture
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSubscriptionModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold text-xs hover:bg-amber-500/25 transition"
          >
            <Crown className="w-4 h-4" />
            {selectedPlanObj.name} (Active)
          </button>
          <button
            onClick={handleGoActiveWhatsApp}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs shadow-md transition"
          >
            <MessageSquare className="w-4 h-4" />
            Go Active via WhatsApp
          </button>
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-xs transition ${
              isOnline ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30' : 'bg-muted text-muted-foreground'
            }`}
          >
            <Power className="w-4 h-4" />
            {isOnline ? 'Operator Active' : 'Offline'}
          </button>
        </div>
      </div>

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <div className="bg-card border border-border p-5 rounded-xl space-y-4 shadow-lg animate-fade-in">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400" /> DriveO Operator Subscription Tiers
            </h3>
            <button onClick={() => setShowSubscriptionModal(false)} className="text-xs text-muted-foreground hover:text-foreground">✕ Close</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SUBSCRIPTION_PLANS.map((plan) => {
              const isSelected = subscriptionPlan === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => setSubscriptionPlan(plan.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between space-y-3 ${
                    isSelected ? 'border-amber-500 bg-amber-500/10 shadow-md' : 'border-border hover:bg-muted/40'
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{plan.name}</h4>
                    <p className="text-xs text-muted-foreground">{plan.description}</p>
                  </div>
                  <div className="flex items-baseline justify-between pt-2 border-t border-border">
                    <span className="text-xl font-bold text-amber-400">₹{plan.price}</span>
                    <span className="text-[10px] text-muted-foreground">/ {plan.duration}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Operator Settings & Profile */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-xl">
                {selectedCategoryObj.icon}
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">{profile?.full_name || 'Vehicle Operator'}</h3>
                <p className="text-xs text-muted-foreground">{selectedCategoryObj.name}</p>
              </div>
            </div>

            <div className="space-y-3 border-t border-border pt-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Operator Vehicle Category
                </label>
                <select
                  value={operatorCategory}
                  onChange={(e) => setOperatorCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-semibold focus:outline-none focus:border-primary transition"
                >
                  {VEHICLE_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Vehicle Reg Number
                </label>
                <input
                  type="text"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-semibold focus:outline-none focus:border-primary transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Operator UPI ID (Direct Settlement)
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-semibold focus:outline-none focus:border-primary transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Request Feed & Active Committed Trip */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Send className="w-5 h-5 text-primary" /> Live Trip Requests & Commitments
              </h2>
              <span className="text-xs px-2.5 py-1 rounded-full bg-primary/15 text-primary font-bold">
                {incomingRequests.length} Active Requests
              </span>
            </div>

            {/* Active Committed Order */}
            {activeOrder && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> TRIP COMMITTED & LOCKED
                  </span>
                  <span className="text-xs text-muted-foreground">ID: #{activeOrder.id.toString().slice(0, 8)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground block">Pickup GPS:</span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${activeOrder.pickup_latitude},${activeOrder.pickup_longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-bold hover:underline inline-flex items-center gap-1"
                    >
                      Open Maps GPS <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Dropoff:</span>
                    <strong className="text-foreground">{activeOrder.dropoff_address}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-emerald-500/20">
                  <span className="text-lg font-bold text-emerald-500">Committed Amount: ₹{activeOrder.fare}</span>
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${activeOrder.phone || '916381029380'}`}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center gap-1 hover:bg-blue-700 transition"
                    >
                      <Phone className="w-3.5 h-3.5" /> Call Customer
                    </a>
                    <button
                      onClick={() => setShowUpiModal(!showUpiModal)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 hover:bg-emerald-700 transition"
                    >
                      <QrCode className="w-3.5 h-3.5" /> Show UPI QR
                    </button>
                    <button
                      onClick={handleCompleteRide}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition"
                    >
                      Complete Trip
                    </button>
                  </div>
                </div>

                {showUpiModal && (
                  <div className="bg-background border border-border p-4 rounded-xl text-center space-y-2 mt-2">
                    <p className="text-xs font-bold text-muted-foreground">Customer Scans UPI to Pay Driver Directly</p>
                    <div className="p-3 bg-white rounded-lg inline-block shadow-inner">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                          `upi://pay?pa=${upiId}&pn=${encodeURIComponent(profile?.full_name || 'DriveO Partner')}&am=${activeOrder.fare}`
                        )}`}
                        alt="UPI Payment QR Code"
                        className="w-40 h-40 mx-auto"
                      />
                    </div>
                    <p className="text-xs text-foreground font-mono font-semibold">{upiId}</p>
                  </div>
                )}
              </div>
            )}

            {/* Broadcast Feed List */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {incomingRequests.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground text-xs">
                  No active requests. Waiting for customer requests in Tamil Nadu...
                </div>
              ) : (
                incomingRequests.map((req) => (
                  <div key={req.id} className="p-4 rounded-xl border border-border bg-background/50 hover:border-primary/50 transition space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary flex items-center gap-1">
                        📍 Trip Request #{req.id.toString().slice(0, 6)}
                      </span>
                      <span className="text-lg font-bold text-emerald-500">₹{req.fare}</span>
                    </div>

                    <div className="text-xs space-y-1 text-muted-foreground">
                      <p><strong className="text-foreground">Pickup:</strong> {req.pickup_address || 'Live GPS'}</p>
                      <p><strong className="text-foreground">Dropoff:</strong> {req.dropoff_address}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <a
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                          `Hi, I am DriveO Partner (${selectedCategoryObj.name} - ${regNumber}). I received your trip request for ₹${req.fare}. I am ready to accept!`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#25D366] font-bold flex items-center gap-1 hover:underline"
                      >
                        <MessageSquare className="w-4 h-4" /> Reply on WhatsApp
                      </a>
                      <button
                        onClick={() => handleAcceptRide(req)}
                        className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold text-xs transition"
                      >
                        Accept & Commit Trip
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
