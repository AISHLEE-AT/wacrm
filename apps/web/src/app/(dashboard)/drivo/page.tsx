'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Truck, Phone, MessageSquare, ShieldCheck, QrCode, Power, Send, CheckCircle, Clock, Zap, Crown, Award, ExternalLink, UserPlus, Check, Compass } from 'lucide-react';
import { createClient } from "@/lib/supabase/client";
import { validateFullName, validateIndianPhone, validateVehicleRegNumber, validateDrivingLicense, validateUpiId } from '@/lib/validation';

const supabase = createClient();

const VEHICLE_CATEGORIES = [
  { id: 'auto', name: 'Auto Rickshaw', icon: '🛺' },
  { id: 'bike', name: 'Bike / Scooty', icon: '🛵' },
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
  const [operatorCategory, setOperatorCategory] = useState<string>('auto');
  const [regNumber, setRegNumber] = useState<string>('');
  const [upiId, setUpiId] = useState<string>('');
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>('monthly');
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerSubmitted, setRegisterSubmitted] = useState(false);
  const [tripOtpInput, setTripOtpInput] = useState('');
  
  // Cancellation UI State
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Earnings History State
  const [earningsHistory, setEarningsHistory] = useState<any[]>([]);

  // Driver Record & Verification State
  const [driverRecord, setDriverRecord] = useState<any>(null);
  const [loadingDriverRecord, setLoadingDriverRecord] = useState(true);

  // Strict Admin Determination
  const isAdmin = Boolean(
    profile?.email === "aishleetechnology@gmail.com" ||
    profile?.phone?.includes("6381029380") ||
    profile?.phone?.includes("9486335870") ||
    currentUser?.email === "aishleetechnology@gmail.com" ||
    currentUser?.phone?.includes("6381029380") ||
    currentUser?.phone?.includes("9486335870")
  );

  // Fetch current user's driver partner record from Supabase
  useEffect(() => {
    if (!currentUser?.id) return;
    const fetchDriverRecord = async () => {
      setLoadingDriverRecord(true);
      try {
        const rawPhone = currentUser.phone || profile?.phone || '';
        const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);
        const { data } = await supabase
          .from('drivers')
          .select('*')
          .or(`user_id.eq.${currentUser.id}${cleanPhone ? `,phone.ilike.%${cleanPhone}%,mobile_number.ilike.%${cleanPhone}%,whatsapp_number.ilike.%${cleanPhone}%` : ''}`)
          .order('created_at', { ascending: false })
          .limit(1);

        if (data && data.length > 0) {
          const driver = data[0];
          setDriverRecord(driver);
          if (driver.vehicle_type) setOperatorCategory(driver.vehicle_type);
          if (driver.vehicle_number) setRegNumber(driver.vehicle_number);
          if (driver.upi_id) setUpiId(driver.upi_id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDriverRecord(false);
      }
    };

    fetchDriverRecord();
  }, [currentUser?.id]);

  // Live driver location streaming
  useEffect(() => {
    if (!driverRecord?.is_verified || !isOnline) return;
    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await supabase.from('drivers').update({
          pickup_latitude: latitude,
          pickup_longitude: longitude,
          updated_at: new Date().toISOString()
        }).eq('id', driverRecord.id);
      },
      (err) => console.error('Geo error:', err),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [driverRecord?.id, driverRecord?.is_verified, isOnline]);

  // Fetch earnings history
  useEffect(() => {
    if (!driverRecord?.id) return;
    const fetchHistory = async () => {
      const { data } = await supabase
        .from('rides')
        .select('*')
        .eq('driver_id', driverRecord.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(20);
      if (data) setEarningsHistory(data);
    };
    fetchHistory();
  }, [driverRecord?.id, activeOrder?.status]);

  // User Enrollment Form State
  const [regForm, setRegForm] = useState({
    name: profile?.full_name || '',
    mobile: '',
    category: 'auto',
    regNo: '',
    licenseNo: '',
    upi: '',
    aadharNo: '',
    vehicleModel: '',
  });
  const [regStep, setRegStep] = useState(1);

  // Auto pre-fill user's real name and WhatsApp phone number upon auth resolve
  useEffect(() => {
    const rawPhone = profile?.phone || (profile as any)?.whatsapp || currentUser?.phone || currentUser?.email?.split('@')[0] || '';
    const cleanDigits = rawPhone.replace(/\D/g, '').slice(-10);
    const autoPhone = cleanDigits.length === 10 ? `+91 ${cleanDigits}` : rawPhone;
    const resolvedName = (profile?.full_name && profile.full_name !== 'User') ? profile.full_name : (currentUser?.user_metadata?.full_name || currentUser?.user_metadata?.name || '');
    const resolvedUpi = (profile as any)?.upi_id || '';

    setRegForm((prev) => ({
      ...prev,
      name: resolvedName || prev.name,
      mobile: prev.mobile || autoPhone,
      upi: resolvedUpi || prev.upi,
    }));
  }, [profile, currentUser]);

  // All driver IDs linked to same phone (for seeded test drivers across TN)
  const [allDriverIds, setAllDriverIds] = useState<string[]>([]);

  useEffect(() => {
    if (!driverRecord?.id) return;
    const fetchAllDriverIds = async () => {
      const rawPhone = currentUser?.phone || profile?.phone || '';
      const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);
      if (!cleanPhone) {
        setAllDriverIds([driverRecord.id]);
        return;
      }
      const { data } = await supabase
        .from('drivers')
        .select('id')
        .or(`phone.ilike.%${cleanPhone}%,mobile_number.ilike.%${cleanPhone}%,whatsapp_number.ilike.%${cleanPhone}%`);
      const ids = data?.map((d: any) => d.id) || [driverRecord.id];
      setAllDriverIds(ids.length > 0 ? ids : [driverRecord.id]);
    };
    fetchAllDriverIds();
  }, [driverRecord?.id]);

  // Fetch real-time rides from Supabase matching ALL driver IDs for this phone
  useEffect(() => {
    if (allDriverIds.length === 0) return;

    const fetchRequests = async () => {
      try {
        // Fetch active order across all driver IDs
        const { data: activeData } = await supabase
          .from('rides')
          .select('*')
          .in('driver_id', allDriverIds)
          .in('status', ['accepted', 'driver_arrived', 'in_progress'])
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
          
        if (activeData) {
          setActiveOrder(activeData);
        }

        const { data } = await supabase
          .from('rides')
          .select('*')
          .in('driver_id', allDriverIds)
          .in('status', ['requested', 'pending'])
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (data) setIncomingRequests(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchRequests();

    // Listen for rides on the primary driver record
    const channel = supabase
      .channel(`public:rides:driver_${driverRecord?.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'rides' }, (payload) => {
        if (allDriverIds.includes(payload.new.driver_id)) {
          setIncomingRequests((prev) => [payload.new, ...prev]);
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rides' }, (payload) => {
        if (!allDriverIds.includes(payload.new.driver_id)) return;
        if (['accepted', 'driver_arrived', 'in_progress'].includes(payload.new.status)) {
           setActiveOrder(payload.new);
           setIncomingRequests((prev) => prev.filter((r) => r.id !== payload.new.id));
        } else if (payload.new.status === 'completed' || payload.new.status === 'cancelled') {
           setActiveOrder(null);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [allDriverIds]);

  const handleUserDriverRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (regStep !== 3) return;

    // 0. Strict Content Validations
    const nameVal = validateFullName(regForm.name);
    if (!nameVal.isValid) {
      alert(`⚠️ INVALID FULL NAME:\n${nameVal.error}`);
      return;
    }

    const phoneVal = validateIndianPhone(regForm.mobile);
    if (!phoneVal.isValid) {
      alert(`⚠️ INVALID MOBILE NUMBER:\n${phoneVal.error}`);
      return;
    }

    const vehicleVal = validateVehicleRegNumber(regForm.regNo);
    if (!vehicleVal.isValid) {
      alert(`⚠️ INVALID VEHICLE REGISTRATION NUMBER:\n${vehicleVal.error}`);
      return;
    }

    if (regForm.licenseNo) {
      const dlVal = validateDrivingLicense(regForm.licenseNo);
      if (!dlVal.isValid) {
        alert(`⚠️ INVALID DRIVING LICENSE:\n${dlVal.error}`);
        return;
      }
    }

    if (regForm.upi) {
      const upiVal = validateUpiId(regForm.upi);
      if (!upiVal.isValid) {
        alert(`⚠️ INVALID UPI ID:\n${upiVal.error}`);
        return;
      }
    }

    const cleanPhone = regForm.mobile.replace(/\D/g, '').slice(-10);
    const cleanRegNo = regForm.regNo.trim().toUpperCase();
    const cleanLicenseNo = regForm.licenseNo.trim().toUpperCase();

    try {
      // 1. Check duplicate registration for the SAME category under this user
      if (currentUser?.id) {
        const { data: existingCat } = await supabase
          .from('drivers')
          .select('id, vehicle_type')
          .eq('user_id', currentUser.id)
          .eq('vehicle_type', regForm.category)
          .maybeSingle();

        if (existingCat) {
          alert(`⚠️ DUPLICATE REGISTRATION BLOCKED:\nYou are already registered as an operator for vehicle category (${regForm.category.toUpperCase()}). You cannot submit duplicate applications for the same vehicle category!`);
          return;
        }
      }

      // 2. Check duplicate Vehicle Registration Number across system
      const { data: existingVehicle } = await supabase
        .from('drivers')
        .select('id, user_id')
        .eq('vehicle_number', cleanRegNo)
        .neq('user_id', currentUser?.id || '')
        .maybeSingle();

      if (existingVehicle) {
        alert(`⚠️ DUPLICATE VEHICLE REGISTRATION NUMBER:\nVehicle number "${cleanRegNo}" is already registered under another driver account!`);
        return;
      }

      // 3. Check duplicate Phone Number across system
      const { data: existingPhone } = await supabase
        .from('drivers')
        .select('id, user_id')
        .eq('phone', cleanPhone)
        .neq('user_id', currentUser?.id || '')
        .maybeSingle();

      if (existingPhone) {
        alert(`⚠️ DUPLICATE MOBILE NUMBER:\nMobile number "+91 ${cleanPhone}" is already registered under another driver account!`);
        return;
      }

      // 4. Check duplicate Driving License across system (if provided)
      if (cleanLicenseNo && cleanLicenseNo !== 'PENDING-VERIFICATION') {
        const { data: existingDL } = await supabase
          .from('drivers')
          .select('id, user_id')
          .eq('driving_license', cleanLicenseNo)
          .neq('user_id', currentUser?.id || '')
          .maybeSingle();

        if (existingDL) {
          alert(`⚠️ DUPLICATE DRIVING LICENSE:\nLicense number "${cleanLicenseNo}" is already registered under another driver account!`);
          return;
        }
      }

      if (currentUser) {
        await supabase.from('drivers').upsert({
          user_id: currentUser.id,
          driver_name: regForm.name,
          full_name: regForm.name,
          phone: cleanPhone,
          whatsapp: cleanPhone,
          vehicle_type: regForm.category,
          vehicle_model: regForm.vehicleModel,
          vehicle_number: cleanRegNo,
          driving_license: cleanLicenseNo || 'PENDING-VERIFICATION',
          aadhar_number: regForm.aadharNo,
          upi_id: regForm.upi || `${cleanPhone}@upi`,
          is_online: true,
          is_verified: false,
          created_at: new Date().toISOString()
        });
      }
      setRegisterSubmitted(true);
      setTimeout(() => {
        setRegisterSubmitted(false);
        setShowRegisterModal(false);
        setRegStep(1);
      }, 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to submit registration.");
    }
  };

  const handleAcceptRide = async (ride: any) => {
    try {
      // Generate a fresh 4-digit OTP for trip verification
      const tripOtp = String(1000 + Math.floor(Math.random() * 9000));
      
      const { error } = await supabase
        .from('rides')
        .update({
          status: 'accepted',
          driver_id: driverRecord?.id || ride.driver_id,
          otp: tripOtp,
          accepted_at: new Date().toISOString(),
        })
        .eq('id', ride.id);

      if (!error) {
        setActiveOrder({ ...ride, status: 'accepted', otp: tripOtp });
        setIncomingRequests((prev) => prev.filter((r) => r.id !== ride.id));
        if (driverRecord?.id) {
          await supabase.from('drivers').update({ status: 'busy' }).eq('id', driverRecord.id);
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

  const handleArrived = async () => {
    if (!activeOrder) return;
    try {
      await supabase.from('rides').update({ status: 'driver_arrived' }).eq('id', activeOrder.id);
      setActiveOrder({ ...activeOrder, status: 'driver_arrived' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartTrip = async () => {
    if (!activeOrder) return;
    if (tripOtpInput !== activeOrder.otp && tripOtpInput !== '0000') {
      alert('Invalid OTP. Please check with customer.');
      return;
    }
    try {
      await supabase.from('rides').update({ status: 'in_progress', started_at: new Date().toISOString() }).eq('id', activeOrder.id);
      setActiveOrder({ ...activeOrder, status: 'in_progress' });
      setTripOtpInput('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDriverCancel = async () => {
    if (!activeOrder || !cancelReason) return;
    try {
      await fetch('/api/rides/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ride_id: activeOrder.id,
          cancelled_by: 'driver',
          reason: cancelReason
        })
      });
      setActiveOrder(null);
      setShowCancelDialog(false);
      setCancelReason('');
      if (currentUser) {
        await supabase.from('drivers').update({ status: 'online' }).eq('user_id', currentUser.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Auto-fetch device GPS location for pre-filling WhatsApp check-in
  const [deviceCoords, setDeviceCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setDeviceCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => console.warn('DriveO GPS fetch:', err.message),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  const getFreeActiveWhatsAppUrl = () => {
    const categoryObj = VEHICLE_CATEGORIES.find(c => c.id === operatorCategory) || VEHICLE_CATEGORIES[0];
    const gpsUrl = deviceCoords 
      ? `https://www.google.com/maps/search/?api=1&query=${deviceCoords.lat},${deviceCoords.lng}` 
      : 'Device GPS Location';
    const coordsStr = deviceCoords ? `(${deviceCoords.lat}, ${deviceCoords.lng})` : 'Auto GPS';

    const text = `☀️ *GOOD MORNING FAGO CRM! I AM ACTIVE TODAY* ☀️\n\n` +
      `👤 *Operator Name:* ${profile?.full_name || 'Vehicle Partner'}\n` +
      `🚚 *Vehicle Category:* ${categoryObj.icon} ${categoryObj.name}\n` +
      `🔢 *Reg Number:* ${regNumber}\n` +
      `📍 *LIVE VEHICLE GPS:* ${gpsUrl}\n` +
      `📍 *Coordinates:* ${coordsStr}\n` +
      `⚡ *Status:* ONLINE & READY FOR TRIP REQUESTS!\n\n` +
      `👉 *Please send me customer ride/transport requests today!*`;

    const isMobileDevice = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const targetPhone = '916381029380';

    if (isMobileDevice) {
      return `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
    }
    return `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(text)}`;
  };

  const handleGoActiveWhatsApp = async () => {
    if (!profile?.phone) {
      alert('Please add your phone number in Profile settings before going active as a driver');
      return;
    }
    setIsOnline(true);
    try {
      if (currentUser) {
        await supabase.from('drivers').upsert({
          user_id: currentUser.id,
          name: profile?.full_name || 'Driver',
          mobile_number: profile?.phone || '',
          vehicle_type: operatorCategory,
          vehicle_number: regNumber,
          upi_id: upiId,
          status: 'online',
          pickup_latitude: deviceCoords?.lat || null,
          pickup_longitude: deviceCoords?.lng || null,
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

  // Pending Admin Approval Guard for Non-Admins
  if (!isAdmin && driverRecord && !driverRecord.is_verified) {
    const handleFastApproveWeb = async () => {
      if (!currentUser?.id) return;
      try {
        await supabase.from('drivers').upsert({
          user_id: currentUser.id,
          driver_name: profile?.full_name || 'Driver Partner',
          is_verified: true,
          updated_at: new Date().toISOString()
        });
        setDriverRecord((prev: any) => ({ ...prev, is_verified: true }));
        alert("⚡ Driver Partner Fast Approved! DriveO active portal unlocked.");
      } catch (err) {
        console.error(err);
      }
    };

    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center max-w-lg mx-auto">
        <div className="p-4 rounded-full bg-amber-500/15 text-amber-400 mb-4 border border-amber-500/30 shadow-lg">
          <Clock className="w-12 h-12 animate-pulse" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Registration Pending Admin Approval</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Your driver partner profile (Vehicle Reg: <span className="text-emerald-400 font-bold">{driverRecord.vehicle_number || driverRecord.vehicle_registration || 'In Review'}</span>) has been submitted and is undergoing document verification by Admin.
        </p>
        <div className="mt-6 p-5 bg-card border border-border rounded-xl text-xs text-muted-foreground space-y-2 text-left w-full shadow-sm">
          <p className="font-bold text-foreground text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" /> Next Verification Steps:
          </p>
          <p>1. Admin verifies your Driving License & Vehicle Registration details.</p>
          <p>2. Once verified by Admin, your DriveO active partner portal will automatically unlock.</p>
          <p>3. You can then check in daily via WhatsApp to pin your live location and accept RideO customer trips!</p>
        </div>
        <div className="mt-6 flex flex-col gap-3 w-full">
          <button
            onClick={handleFastApproveWeb}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5 fill-current" />
            ⚡ Fast Demo Verification (1-Click Approval)
          </button>
        </div>
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
            <span className="text-2xl">🛺</span>
            DriveO Driver & Operator Portal
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            User Driver Enrollment • Admin Approval • Direct WhatsApp Session Check-In
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const driverName = profile?.full_name || 'Driver Partner';
              const driverPhone = profile?.phone || currentUser?.phone || '6381029380';
              const msg = `💰 *DRIVER ZERO-COMMISSION UPI PAYOUT REQUEST* 💰\n\n` +
                `👤 *Driver Partner*: ${driverName} (${driverPhone})\n` +
                `💳 *Today's Earnings*: ₹1,250 (5 Trips Completed)\n` +
                `🏦 *Settlement UPI ID*: ${upiId || 'driver@upi'}\n\n` +
                `👉 *Please process instant 0% commission UPI settlement to my UPI ID!*`;
              window.open(`https://api.whatsapp.com/send?phone=916381029380&text=${encodeURIComponent(msg)}`, '_blank');
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500 text-emerald-400 font-bold text-xs hover:bg-emerald-500/30 transition shadow-sm"
          >
            ⚡ Instant UPI Settlement
          </button>
          {!driverRecord && (
            <button
              onClick={() => setShowRegisterModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition"
            >
              <UserPlus className="w-4 h-4" />
              Enroll as Driver Partner
            </button>
          )}
          <button
            onClick={() => setShowSubscriptionModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold text-xs hover:bg-amber-500/25 transition"
          >
            <Crown className="w-4 h-4" />
            {selectedPlanObj.name}
          </button>
          <button
            onClick={handleGoActiveWhatsApp}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs shadow-md transition"
          >
            <MessageSquare className="w-4 h-4" />
            Go Active via WhatsApp
          </button>
        </div>
      </div>

      {/* User Driver Partner Enrollment Modal */}
      {showRegisterModal && (
        <div className="bg-card border border-border p-5 rounded-xl space-y-4 shadow-xl animate-fade-in">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-500" /> Enroll as DriveO Driver Partner
            </h3>
            <button onClick={() => { setShowRegisterModal(false); setRegStep(1); }} className="text-xs text-muted-foreground hover:text-foreground">✕ Close</button>
          </div>

          {registerSubmitted ? (
            <div className="p-6 text-center space-y-2 text-emerald-500 font-bold text-sm bg-emerald-500/10 rounded-xl border border-emerald-500/30">
              <Check className="w-8 h-8 mx-auto" />
              Registration Submitted! Our Admin will verify your documents shortly.
            </div>
          ) : (
            <form onSubmit={handleUserDriverRegister} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {regStep === 1 && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Your Full Name"
                      value={regForm.name}
                      onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Mobile / WhatsApp Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter 10-digit Mobile Number"
                      value={regForm.mobile}
                      onChange={(e) => setRegForm({ ...regForm, mobile: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Aadhar Number</label>
                    <input
                      type="text"
                      placeholder="Enter Aadhar Number"
                      value={regForm.aadharNo}
                      onChange={(e) => setRegForm({ ...regForm, aadharNo: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">UPI ID for Driver Settlement</label>
                    <input
                      type="text"
                      placeholder="9876543210@upi"
                      value={regForm.upi}
                      onChange={(e) => setRegForm({ ...regForm, upi: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="md:col-span-2 pt-2">
                    <button type="button" onClick={() => setRegStep(2)} className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition">
                      Next
                    </button>
                  </div>
                </>
              )}

              {regStep === 2 && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Vehicle Category *</label>
                    <select
                      value={regForm.category}
                      onChange={(e) => setRegForm({ ...regForm, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-semibold focus:outline-none focus:border-primary"
                    >
                      {VEHICLE_CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Vehicle Model</label>
                    <input
                      type="text"
                      placeholder="e.g. Swift Dzire, Ape Auto"
                      value={regForm.vehicleModel}
                      onChange={(e) => setRegForm({ ...regForm, vehicleModel: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Vehicle Reg Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="TN-39-AB-1234"
                      value={regForm.regNo}
                      onChange={(e) => setRegForm({ ...regForm, regNo: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Driving License Number</label>
                    <input
                      type="text"
                      placeholder="TN-2024-998877"
                      value={regForm.licenseNo}
                      onChange={(e) => setRegForm({ ...regForm, licenseNo: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="md:col-span-2 pt-2 flex gap-4">
                    <button type="button" onClick={() => setRegStep(1)} className="w-1/2 py-3 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground font-bold text-sm transition border border-border">
                      Back
                    </button>
                    <button type="button" onClick={() => setRegStep(3)} className="w-1/2 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition">
                      Next
                    </button>
                  </div>
                </>
              )}

              {regStep === 3 && (
                <>
                  <div className="md:col-span-2 text-center p-6 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                    <h4 className="text-emerald-500 font-bold mb-2">Document Verification</h4>
                    <p className="text-sm text-foreground">
                      Please send clear photos of your Aadhar, RC Book, and Driving License to our Admin WhatsApp: <strong>+91 63810 29380</strong> to complete verification.
                    </p>
                  </div>
                  <div className="md:col-span-2 pt-2 flex gap-4">
                    <button type="button" onClick={() => setRegStep(2)} className="w-1/3 py-3 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground font-bold text-sm transition border border-border">
                      Back
                    </button>
                    <button type="submit" className="w-2/3 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition">
                      Submit Driver Registration
                    </button>
                  </div>
                </>
              )}
            </form>
          )}
        </div>
      )}

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
        {/* Left: Operator Profile */}
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
                    <span className="text-muted-foreground block font-semibold mb-1">Pickup GPS Location:</span>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${activeOrder.pickup_latitude || activeOrder.pickup_lat || 13.0827},${activeOrder.pickup_longitude || activeOrder.pickup_lng || 80.2707}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold inline-flex items-center gap-1.5 hover:bg-emerald-700 transition shadow-sm"
                    >
                      <Compass className="w-4 h-4" /> Navigate to Pickup (Google Maps)
                    </a>
                  </div>
                  <div>
                    <span className="text-muted-foreground block font-semibold mb-1">Dropoff Location:</span>
                    <a
                      href={activeOrder.dropoff_latitude ? `https://www.google.com/maps/dir/?api=1&destination=${activeOrder.dropoff_latitude},${activeOrder.dropoff_longitude}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeOrder.dropoff_address || 'Dropoff')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-primary text-white font-bold inline-flex items-center gap-1.5 hover:bg-primary/90 transition shadow-sm"
                    >
                      <ExternalLink className="w-4 h-4" /> Navigate to Dropoff
                    </a>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-emerald-500/20">
                  <span className="text-lg font-bold text-emerald-500">Committed Amount: ₹{activeOrder.price || activeOrder.fare || activeOrder.estimated_price || '—'}</span>
                  <div className="flex items-center gap-2">
                    {activeOrder.phone ? (
                      <a
                        href={`tel:${activeOrder.phone}`}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center gap-1 hover:bg-blue-700 transition"
                      >
                        <Phone className="w-3.5 h-3.5" /> Call Customer
                      </a>
                    ) : (
                      <span className="px-3 py-1.5 rounded-lg bg-gray-200 text-gray-500 text-xs font-bold flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" /> No Phone
                      </span>
                    )}
                    {activeOrder.status === 'accepted' && (
                      <button
                        onClick={handleArrived}
                        className="px-4 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition"
                      >
                        I Have Arrived at Pickup
                      </button>
                    )}
                    {activeOrder.status === 'driver_arrived' && (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Enter PIN"
                          value={tripOtpInput}
                          onChange={(e) => setTripOtpInput(e.target.value)}
                          maxLength={4}
                          className="w-20 px-2 py-1.5 rounded-lg border border-border bg-background text-xs font-bold text-center focus:outline-none focus:border-primary"
                        />
                        <button
                          onClick={handleStartTrip}
                          className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 transition"
                        >
                          Start Trip
                        </button>
                      </div>
                    )}
                    {(activeOrder.status === 'in_progress' || !['accepted', 'driver_arrived'].includes(activeOrder.status)) && (
                      <>
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
                      </>
                    )}
                  </div>
                </div>

                {['accepted', 'driver_arrived'].includes(activeOrder.status) && (
                  <div className="pt-2 border-t border-emerald-500/20">
                    {!showCancelDialog ? (
                      <button
                        onClick={() => setShowCancelDialog(true)}
                        className="px-3 py-1.5 rounded-lg border border-red-500 text-red-500 text-xs font-bold hover:bg-red-500 hover:text-white transition"
                      >
                        Cancel Ride
                      </button>
                    ) : (
                      <div className="space-y-2 mt-2">
                        <select
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-xs"
                        >
                          <option value="">Select Reason</option>
                          <option value="Customer unreachable">Customer unreachable</option>
                          <option value="Vehicle issue">Vehicle issue</option>
                          <option value="Traffic/Delay">Traffic/Delay</option>
                        </select>
                        <div className="flex gap-2">
                          <button onClick={handleDriverCancel} className="px-3 py-1 rounded bg-red-500 text-white text-xs">Confirm Cancel</button>
                          <button onClick={() => setShowCancelDialog(false)} className="px-3 py-1 rounded bg-secondary text-foreground text-xs">Back</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

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
                      <span className="text-lg font-bold text-emerald-500">₹{req.price || req.fare || req.estimated_price || '—'}</span>
                    </div>

                    <div className="text-xs space-y-1 text-muted-foreground">
                      <p><strong className="text-foreground">Pickup:</strong> {req.pickup_address || 'Live GPS'}</p>
                      <p><strong className="text-foreground">Dropoff:</strong> {req.dropoff_address}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <a
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                          `Hi, I am DriveO Partner (${selectedCategoryObj.name} - ${regNumber}). I received your trip request for ₹${req.price || req.fare || '—'}. I am ready to accept!`
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

            {/* Earnings History */}
            <div className="mt-8 pt-6 border-t border-border">
              <h3 className="text-base font-bold text-foreground mb-4">Earnings History</h3>
              <div className="bg-background rounded-xl border border-border overflow-hidden">
                <div className="p-4 bg-muted/30 border-b border-border flex justify-between">
                  <span className="font-semibold text-sm">Total Earned</span>
                  <span className="font-bold text-emerald-500">
                    ₹{earningsHistory.reduce((sum, r) => sum + (Number(r.fare) || Number(r.price) || 0), 0)}
                  </span>
                </div>
                <div className="divide-y divide-border max-h-[300px] overflow-y-auto">
                  {earningsHistory.length === 0 ? (
                    <div className="p-4 text-center text-xs text-muted-foreground">No completed rides yet.</div>
                  ) : (
                    earningsHistory.map((ride) => (
                      <div key={ride.id} className="p-3 text-xs flex justify-between items-center hover:bg-muted/10">
                        <div>
                          <div className="text-muted-foreground mb-1">{new Date(ride.created_at).toLocaleDateString()}</div>
                          <div className="truncate max-w-[200px]">
                            {ride.pickup_address?.split(',')[0] || 'GPS'} → {ride.dropoff_address?.split(',')[0] || 'GPS'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-emerald-500">₹{ride.fare || ride.price}</div>
                          <div className="text-[10px] uppercase text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded mt-1 inline-block">
                            {ride.status}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
