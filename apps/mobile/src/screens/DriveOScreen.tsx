// @ts-nocheck
import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Animated,
  Vibration,
  Platform,
  ActivityIndicator,
  Alert,
  Dimensions
} from 'react-native';
import * as Location from 'expo-location';
import { supabase } from '../lib/supabase';
import { AppContext } from '../context/AppContext';
import {
  Power,
  MapPin,
  Navigation,
  Phone,
  MessageCircle,
  Car,
  CheckCircle,
  XCircle,
  IndianRupee,
  Wallet,
  Clock,
  Send,
  Star,
  Shield,
  User,
  RefreshCw,
  ArrowLeft,
  AlertTriangle
} from 'lucide-react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

import {
  COLORS,
  VEHICLE_CATEGORIES,
  RIDE_STATUS,
  API_BASE_URL,
  ADMIN_UPI,
  ADMIN_PHONE,
  getDistanceKm,
  calculateFare,
  generateRideOTP,
  openNativeNavigation as rideUtilsOpenNav,
  shareLocationWhatsApp,
  whatsappToPhone,
  callPhone,
  fetchOSRMRoute,
  payViaUPI,
  mapStyleDark,
  formatPhoneForWhatsApp
} from '../lib/rideUtils';

const { width, height } = Dimensions.get('window');

const formatCurrency = (amount) => {
  return `₹${Number(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
};

export default function DriveOScreen() {
  const { user } = useContext(AppContext);
  const phone = user?.phone || '';

  const [isLoading, setIsLoading] = useState(true);
  const [driver, setDriver] = useState(null);
  
  // Registration States
  const [regStep, setRegStep] = useState(1);
  const [regName, setRegName] = useState(user?.name || '');
  const [regAadhar, setRegAadhar] = useState('');
  const [regVehicleType, setRegVehicleType] = useState('bikeo');
  const [regVehicleModel, setRegVehicleModel] = useState('');
  const [regVehicleNumber, setRegVehicleNumber] = useState('');
  const [regUpiId, setRegUpiId] = useState('');
  const [regLicense, setRegLicense] = useState('');

  // Dashboard States
  const [isOnline, setIsOnline] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const locationSubRef = useRef(null);
  const channelRef = useRef(null);

  // Ride States
  const [incomingRide, setIncomingRide] = useState(null);
  const [activeRide, setActiveRide] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [otp, setOtp] = useState(['', '', '', '']);
  const otpInputs = useRef([]);
  const [skippedCount, setSkippedCount] = useState(0);

  // Earnings States
  const [earnings, setEarnings] = useState({
    todaySum: 0,
    todayTrips: 0,
    weekSum: 0
  });

  // Animation for countdown
  const countdownAnim = useRef(new Animated.Value(100)).current;
  const [timeLeft, setTimeLeft] = useState(15);
  const timerRef = useRef(null);
  const mapRef = useRef(null);

  // ─── LIFECYCLE HOOKS ───
  useEffect(() => {
    if (phone) {
      fetchDriverProfile();
    }
  }, [phone]);

  useEffect(() => {
    if (driver?.id) {
      fetchEarnings();
      fetchActiveRide();
      setupRealtimeSubscription();
    }
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      stopLocationTracking();
    };
  }, [driver?.id]);

  // ─── OSRM ROUTE FETCHING ───
  useEffect(() => {
    const fetchRoute = async () => {
      if (!activeRide) {
        setRouteCoordinates([]);
        return;
      }
      
      let startLat, startLng, endLat, endLng;
      
      if (activeRide.status === RIDE_STATUS.ACCEPTED || activeRide.status === RIDE_STATUS.DRIVER_ARRIVED) {
        startLat = currentLocation?.latitude || activeRide?.pickup_location?.lat;
        startLng = currentLocation?.longitude || activeRide?.pickup_location?.lng;
        endLat = activeRide?.pickup_location?.lat;
        endLng = activeRide?.pickup_location?.lng;
      } else if (activeRide.status === RIDE_STATUS.IN_PROGRESS) {
        startLat = currentLocation?.latitude || activeRide?.pickup_location?.lat;
        startLng = currentLocation?.longitude || activeRide?.pickup_location?.lng;
        endLat = activeRide?.drop_location?.lat;
        endLng = activeRide?.drop_location?.lng;
      } else {
        setRouteCoordinates([]);
        return;
      }
      
      if (startLat && startLng && endLat && endLng) {
        const coords = await fetchOSRMRoute(startLat, startLng, endLat, endLng);
        setRouteCoordinates(coords);
      }
    };
    
    fetchRoute();
  }, [activeRide?.status, activeRide?.pickup_latitude, activeRide?.dropoff_latitude, currentLocation]);

  // ─── MAP FIT TO MARKERS ───
  useEffect(() => {
    if (activeRide && mapRef.current) {
      const markers = [];
      if (currentLocation) {
        markers.push({ latitude: currentLocation.latitude, longitude: currentLocation.longitude });
      }
      if (activeRide?.pickup_location?.lat) {
        markers.push({ latitude: activeRide?.pickup_location?.lat, longitude: activeRide?.pickup_location?.lng });
      }
      if (activeRide?.drop_location?.lat) {
        markers.push({ latitude: activeRide?.drop_location?.lat, longitude: activeRide?.drop_location?.lng });
      }
      
      if (markers.length > 1) {
        setTimeout(() => {
          mapRef.current?.fitToCoordinates(markers, {
            edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
            animated: true
          });
        }, 500);
      }
    }
  }, [activeRide, currentLocation]);

  // ─── DRIVER PROFILE ───
  const fetchDriverProfile = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .or(`phone.eq.${phone},mobile_number.eq.${phone},whatsapp_number.eq.${phone}`)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      
      if (data && data.length > 0) {
        setDriver(data[0]);
        setIsOnline(data[0].status === 'online');
      } else {
        setDriver(null);
      }
    } catch (err) {
      console.error('Error fetching driver:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── DRIVER REGISTRATION ───
  const registerDriver = async () => {
    if (!regVehicleNumber || !regUpiId) {
      Alert.alert('Validation Error', 'Please fill Vehicle Number and UPI ID');
      return;
    }
    try {
      setIsLoading(true);
      const newDriver = {
        name: regName || 'Driver',
        mobile_number: phone,
        whatsapp_number: phone,
        phone: phone,
        aadhar_number: regAadhar,
        vehicle_type: regVehicleType,
        vehicle_model: regVehicleModel,
        vehicle_number: regVehicleNumber,
        upi_id: regUpiId,
        driving_license: regLicense,
        status: 'offline',
        wallet_balance: 0,
        pending_commission: 0,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('drivers')
        .insert([newDriver])
        .select()
        .single();

      if (error) throw error;
      setDriver(data);
    } catch (err) {
      console.error('Registration error:', err);
      Alert.alert('Error', 'Failed to register. ' + (err.message || ''));
    } finally {
      setIsLoading(false);
    }
  };

  // ─── EARNINGS FETCH ───
  const fetchEarnings = async () => {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);

      const { data, error } = await supabase
        .from('rides')
        .select('total_fare, driver_earnings, completed_at')
        .eq('driver_id', driver.id)
        .eq('status', RIDE_STATUS.COMPLETED)
        .gte('completed_at', weekStart.toISOString());

      if (error) throw error;

      let tSum = 0, tTrips = 0, wSum = 0;
      data?.forEach(ride => {
        const d = new Date(ride.completed_at);
        const earningsAmt = ride.driver_earnings || ride.total_fare || 0;
        wSum += earningsAmt;
        if (d >= todayStart) {
          tSum += earningsAmt;
          tTrips += 1;
        }
      });

      setEarnings({ todaySum: tSum, todayTrips: tTrips, weekSum: wSum });
    } catch (err) {
      console.error('Error fetching earnings:', err);
    }
  };

  // ─── ACTIVE RIDE FETCH ───
  const fetchActiveRide = async () => {
    try {
      const { data, error } = await supabase
        .from('rides')
        .select('*')
        .eq('driver_id', driver.id)
        .in('status', [RIDE_STATUS.ACCEPTED, RIDE_STATUS.DRIVER_ARRIVED, RIDE_STATUS.IN_PROGRESS])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setActiveRide(data || null);
    } catch (err) {
      console.error('Error fetching active ride:', err);
    }
  };

  // ─── ACTIVE RIDE & PENDING RIDE REALTIME + POLLING ───
  const setupRealtimeSubscription = () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }
    
    const cleanPhone = (phone || driver.phone || driver.mobile_number || driver.whatsapp_number || '').replace(/\D/g, '');
    const tenDigit = cleanPhone.slice(-10);

    channelRef.current = supabase
      .channel(`driver-rides-${driver.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rides' },
        (payload) => {
          const row = payload.new || {};
          const rowDriverPhone = (row.driver_phone || '').replace(/\D/g, '');
          const isAssignedToMe = row.driver_id === driver.id || (rowDriverPhone && (rowDriverPhone.includes(tenDigit) || cleanPhone.includes(rowDriverPhone.slice(-10)))) || !row.driver_id;

          // New ride request
          if (payload.eventType === 'INSERT' && 
              (row.status === RIDE_STATUS.PENDING || row.status === RIDE_STATUS.REQUESTED)) {
            if (isAssignedToMe) {
              handleNewRide(row);
            }
          }
          
          // Ride updates
          if (payload.eventType === 'UPDATE') {
            if (row.status === RIDE_STATUS.CANCELLED) {
              if (activeRide?.id === row.id || incomingRide?.id === row.id) {
                Alert.alert('Ride Cancelled', 'The customer cancelled the ride.');
                setActiveRide(null);
                setIncomingRide(null);
                clearInterval(timerRef.current);
              }
            } else if (isAssignedToMe && [RIDE_STATUS.ACCEPTED, RIDE_STATUS.DRIVER_ARRIVED, RIDE_STATUS.IN_PROGRESS].includes(row.status)) {
              setActiveRide(row);
              setIncomingRide(null);
            } else if (row.status === RIDE_STATUS.COMPLETED && row.driver_id === driver.id) {
              setActiveRide(null);
              fetchEarnings();
            } else if (row.status === RIDE_STATUS.ACCEPTED && row.driver_id !== driver.id) {
              if (incomingRide?.id === row.id) {
                setIncomingRide(null);
                clearInterval(timerRef.current);
              }
            }
          }
        }
      )
      .subscribe();
  };

  // Active polling fallback for incoming rides and active ride status (every 2s)
  useEffect(() => {
    if (!driver?.id || !isOnline || activeRide) return;

    const cleanPhone = (phone || driver.phone || driver.mobile_number || driver.whatsapp_number || '').replace(/\D/g, '');
    const tenDigit = cleanPhone.slice(-10);

    const pollPendingRides = async () => {
      try {
        if (incomingRide) return;

        const { data: pendingList, error } = await supabase
          .from('rides')
          .select('*')
          .in('status', [RIDE_STATUS.PENDING, RIDE_STATUS.REQUESTED])
          .order('created_at', { ascending: false })
          .limit(5);

        if (!error && pendingList && pendingList.length > 0) {
          const matchedRide = pendingList.find(r => {
            const rDriverPhone = (r.driver_phone || '').replace(/\D/g, '');
            return r.driver_id === driver.id ||
                   (rDriverPhone && (rDriverPhone.includes(tenDigit) || cleanPhone.includes(rDriverPhone.slice(-10)))) ||
                   !r.driver_id;
          });

          if (matchedRide && !incomingRide) {
            handleNewRide(matchedRide);
          }
        }
      } catch (e) {
        console.warn('DriveO pending ride poll error:', e);
      }
    };

    pollPendingRides();
    const interval = setInterval(pollPendingRides, 2000);
    return () => clearInterval(interval);
  }, [driver?.id, isOnline, activeRide, incomingRide, phone]);

  // ─── INCOMING RIDE HANDLER ───
  const handleNewRide = async (ride) => {
    if (!isOnline) return;
    if (activeRide) return;
    
    // Check vehicle type match (supports Truck, Ace, Bus, Tractor, Harvester & All-vehicle drivers)
    if (ride.vehicle_category && driver.vehicle_type) {
      const dType = driver.vehicle_type.toLowerCase();
      const rCat  = ride.vehicle_category.toLowerCase();
      const isUniversal = dType === 'all' || dType === 'all_vehicles' || dType === 'admin';
      const isMatch = dType === rCat || rCat.includes(dType) || dType.includes(rCat);
      if (!isUniversal && !isMatch) return;
    }

    // Check distance (max 10km)
    if (currentLocation && ride?.pickup_location?.lat && ride?.pickup_location?.lng) {
      const dist = getDistanceKm(currentLocation.latitude, currentLocation.longitude, ride?.pickup_location?.lat, ride?.pickup_location?.lng);
      if (dist > 100000) return; // Expanded for virtual drivers (statewide)
    }
    
    setIncomingRide(ride);
    Vibration.vibrate([500, 500, 500]);
    startCountdown();
  };

  // ─── COUNTDOWN TIMER ───
  const startCountdown = () => {
    setTimeLeft(15);
    countdownAnim.setValue(100);
    
    Animated.timing(countdownAnim, {
      toValue: 0,
      duration: 15000,
      useNativeDriver: false
    }).start();

    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIncomingRide(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // ─── ACCEPT RIDE (FIX: handles both 'pending' and 'requested' status) ───
  const handleAcceptRide = async () => {
    if (!incomingRide) return;
    clearInterval(timerRef.current);
    const rideId = incomingRide.id;
    setIncomingRide(null);
    
    try {
      const tripOtp = generateRideOTP();
      
      const { data, error } = await supabase
        .from('rides')
        .update({
          status: RIDE_STATUS.ACCEPTED,
          driver_id: driver.id,
          otp: tripOtp,
          accepted_at: new Date().toISOString()
        })
        .in('status', [RIDE_STATUS.REQUESTED, RIDE_STATUS.PENDING])
        .eq('id', rideId)
        .select();
        
      if (error) throw error;
      
      if (!data || data.length === 0) {
        throw new Error('Ride already accepted by another driver or cancelled.');
      }
      
      try {
        await fetch(`${API_BASE_URL}/api/ride/driver-action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ride_id: rideId, driver_id: driver.id, action: 'accepted' })
        });
      } catch (err) {
        console.warn('Failed to notify WhatsApp:', err);
      }
      
      Alert.alert('Ride Accepted!', `OTP for rider: ${tripOtp}`);
      fetchActiveRide();
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not accept ride');
    }
  };

  // ─── SKIP RIDE ───
  const handleSkipRide = () => {
    clearInterval(timerRef.current);
    setIncomingRide(null);
    setSkippedCount(prev => {
      const newCount = prev + 1;
      if (newCount % 5 === 0) {
        Alert.alert('Warning', 'You have skipped several rides. Low acceptance may affect your account.');
      }
      return newCount;
    });
  };

  // ─── CANCEL RIDE ───
  const handleCancelRide = () => {
    Alert.alert(
      'Cancel Ride',
      'Select a reason for cancellation',
      [
        { text: 'Customer not reachable', onPress: () => performCancel('Customer not reachable') },
        { text: 'Wrong pickup address', onPress: () => performCancel('Wrong pickup address') },
        { text: 'Vehicle issue', onPress: () => performCancel('Vehicle issue') },
        { text: 'Safety concern', onPress: () => performCancel('Safety concern') },
        { text: 'Other', onPress: () => performCancel('Other') },
        { text: 'Go Back', style: 'cancel' }
      ]
    );
  };

  const performCancel = async (reason) => {
    if (!activeRide) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/rides/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ride_id: activeRide.id, cancelled_by: 'driver', reason })
      });
      if (!res.ok) throw new Error('Failed to cancel ride');
      
      Alert.alert('Ride Cancelled', 'The ride has been cancelled.');
      setActiveRide(null);
      
      try {
        await fetch(`${API_BASE_URL}/api/ride/driver-action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ride_id: activeRide.id, driver_id: driver.id, action: 'cancelled' })
        });
      } catch (err) {
        console.warn('Failed to notify WhatsApp:', err);
      }
    } catch (err) {
      // Fallback: direct DB update
      await supabase.from('rides').update({ status: RIDE_STATUS.CANCELLED }).eq('id', activeRide.id);
      Alert.alert('Ride Cancelled');
      setActiveRide(null);
      
      try {
        await fetch(`${API_BASE_URL}/api/ride/driver-action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ride_id: activeRide.id, driver_id: driver.id, action: 'cancelled' })
        });
      } catch (err) {
        console.warn('Failed to notify WhatsApp:', err);
      }
    }
  };

  // ─── ONLINE/OFFLINE TOGGLE ───
  const toggleStatus = async () => {
    const newStatus = !isOnline;
    
    if (newStatus) {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Location permission is required to go online.');
        return;
      }
      
      try {
        const loc = await Location.getCurrentPositionAsync({});
        setCurrentLocation(loc.coords);
        
        await supabase.from('drivers').update({
          status: 'online',
          pickup_latitude: loc.coords.latitude,
          pickup_longitude: loc.coords.longitude,
          updated_at: new Date().toISOString()
        }).eq('id', driver.id);
        
        setIsOnline(true);
        startLocationTracking();
      } catch (err) {
        Alert.alert('Error', 'Could not get location.');
      }
    } else {
      await supabase.from('drivers').update({ status: 'offline', updated_at: new Date().toISOString() }).eq('id', driver.id);
      setIsOnline(false);
      stopLocationTracking();
    }
  };

  // ─── LOCATION TRACKING ───
  const startLocationTracking = async () => {
    stopLocationTracking();
    locationSubRef.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Balanced, timeInterval: 10000, distanceInterval: 10 },
      async (location) => {
        setCurrentLocation(location.coords);
        if (driver?.id) {
          await supabase.from('drivers').update({
            pickup_latitude: location.coords.latitude,
            pickup_longitude: location.coords.longitude,
            updated_at: new Date().toISOString()
          }).eq('id', driver.id);
        }
      }
    );
  };

  const stopLocationTracking = () => {
    if (locationSubRef.current) {
      locationSubRef.current.remove();
      locationSubRef.current = null;
    }
  };

  // ─── OTP VERIFICATION (FIX: removed dev bypass) ───
  const handleOtpInput = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 3) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const verifyOtp = async () => {
    const fullOtp = otp.join('');
    if (fullOtp.length !== 4) return;
    
    try {
      if (activeRide.otp === fullOtp) {
        const { error } = await supabase
          .from('rides')
          .update({ status: RIDE_STATUS.IN_PROGRESS, started_at: new Date().toISOString() })
          .eq('id', activeRide.id);
          
        if (error) throw error;
        Alert.alert('Trip Started!', 'Navigate to the dropoff location.');
        setActiveRide({ ...activeRide, status: RIDE_STATUS.IN_PROGRESS, started_at: new Date().toISOString() });
        setOtp(['', '', '', '']);
      } else {
        Alert.alert('Wrong OTP', 'Please ask the rider for the correct 4-digit PIN.');
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  // ─── COMPLETE TRIP ───
  const completeTrip = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/rides/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ride_id: activeRide.id })
      });
      
      if (!res.ok) throw new Error('API failed');
      
      const fare = activeRide.fare || activeRide.total_fare || 0;
      Alert.alert('Trip Completed! 🎉', `Earned ₹${fare}. Collect via UPI or Cash.`);
      setActiveRide(null);
      fetchEarnings();
    } catch (err) {
      // Fallback: direct DB update
      const { error } = await supabase
        .from('rides')
        .update({ status: RIDE_STATUS.COMPLETED, completed_at: new Date().toISOString() })
        .eq('id', activeRide.id);
        
      if (!error) {
        const fare = activeRide.fare || activeRide.total_fare || 0;
        Alert.alert('Trip Completed!', `Earned ₹${fare}`);
        setActiveRide(null);
        fetchEarnings();
      }
    }
  };

  // ─── SAFE NAVIGATION (FIX: guards undefined coordinates) ───
  const openNavigation = (lat, lng) => {
    if (!lat || !lng) {
      Alert.alert('Error', 'Location coordinates not available');
      return;
    }
    rideUtilsOpenNav(lat, lng);
  };

  // ─── WHATSAPP CHECK-IN ───
  const shareWhatsAppPin = () => {
    whatsappToPhone(ADMIN_PHONE, 'Active');
  };

  // ─── LOADING STATE ───
  if (isLoading && !driver) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.green} />
        <Text style={{ color: COLORS.textMuted, marginTop: 12 }}>Loading driver profile...</Text>
      </View>
    );
  }

  // ══════════════════════════════════════════════
  // ─── REGISTRATION SCREEN ───
  // ══════════════════════════════════════════════
  if (!driver) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.regContainer}>
          <Text style={styles.title}>🚗 Driver Registration</Text>
          <Text style={styles.subtitle}>Step {regStep} of 3</Text>

          {/* Step Progress Bar */}
          <View style={styles.progressBar}>
            {[1, 2, 3].map((step) => (
              <View key={step} style={[styles.progressStep, regStep >= step && styles.progressStepActive]} />
            ))}
          </View>

          {regStep === 1 && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  value={regName}
                  onChangeText={setRegName}
                  placeholder="e.g. Ramesh Kumar"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={[styles.input, { opacity: 0.6 }]}
                  value={phone}
                  editable={false}
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>WhatsApp Number</Text>
                <TextInput
                  style={[styles.input, { opacity: 0.6 }]}
                  value={phone}
                  editable={false}
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>

              <TouchableOpacity style={styles.primaryBtn} onPress={() => {
                if (!regName.trim()) { Alert.alert('Required', 'Please enter your full name'); return; }
                setRegStep(2);
              }}>
                <Text style={styles.primaryBtnText}>Next →</Text>
              </TouchableOpacity>
            </>
          )}

          {regStep === 2 && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Vehicle Type *</Text>
                <View style={styles.vehicleTypeRow}>
                  {VEHICLE_CATEGORIES.map((v) => (
                    <TouchableOpacity
                      key={v.id}
                      style={[styles.vehicleTypeBtn, regVehicleType === v.id && styles.vehicleTypeBtnActive]}
                      onPress={() => setRegVehicleType(v.id)}
                    >
                      <Text style={{ fontSize: 20, textAlign: 'center' }}>{v.emoji}</Text>
                      <Text style={[styles.vehicleTypeText, regVehicleType === v.id && styles.vehicleTypeTextActive]}>{v.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Vehicle Model</Text>
                <TextInput
                  style={styles.input}
                  value={regVehicleModel}
                  onChangeText={setRegVehicleModel}
                  placeholder="e.g. Honda Activa 125"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Vehicle Registration Number *</Text>
                <TextInput
                  style={styles.input}
                  value={regVehicleNumber}
                  onChangeText={setRegVehicleNumber}
                  placeholder="e.g. TN38AB1234"
                  placeholderTextColor={COLORS.textMuted}
                  autoCapitalize="characters"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Driving License Number</Text>
                <TextInput
                  style={styles.input}
                  value={regLicense}
                  onChangeText={setRegLicense}
                  placeholder="e.g. TN38 20230012345"
                  placeholderTextColor={COLORS.textMuted}
                  autoCapitalize="characters"
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity style={[styles.primaryBtn, { flex: 1, backgroundColor: COLORS.border }]} onPress={() => setRegStep(1)}>
                  <Text style={styles.primaryBtnText}>← Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.primaryBtn, { flex: 1 }]} onPress={() => {
                  if (!regVehicleNumber.trim()) { Alert.alert('Required', 'Vehicle registration number is required'); return; }
                  setRegStep(3);
                }}>
                  <Text style={styles.primaryBtnText}>Next →</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {regStep === 3 && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Aadhar Number</Text>
                <TextInput
                  style={styles.input}
                  value={regAadhar}
                  onChangeText={setRegAadhar}
                  placeholder="e.g. 1234 5678 9012"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>UPI ID (For earnings) *</Text>
                <TextInput
                  style={styles.input}
                  value={regUpiId}
                  onChangeText={setRegUpiId}
                  placeholder="e.g. ramesh@okicici"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>

              <View style={[styles.inputGroup, { backgroundColor: COLORS.cardLight, padding: 16, borderRadius: 12 }]}>
                <Text style={{ color: COLORS.yellow, fontWeight: 'bold', fontSize: 15, marginBottom: 8 }}>📄 Document Verification</Text>
                <Text style={{ color: COLORS.textSecondary, lineHeight: 22 }}>
                  Send clear photos of your Aadhar Card, RC Book, and Driving License to WhatsApp:
                </Text>
                <Text style={{ color: COLORS.green, fontWeight: 'bold', fontSize: 16, marginTop: 8 }}>
                  +91 {ADMIN_PHONE.replace('91', '').replace(/(\d{5})(\d{5})/, '$1 $2')}
                </Text>
                <Text style={{ color: COLORS.textMuted, fontSize: 13, marginTop: 8 }}>
                  Your account will be activated after document verification (usually within 24 hours).
                </Text>
              </View>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity style={[styles.primaryBtn, { flex: 1, backgroundColor: COLORS.border }]} onPress={() => setRegStep(2)}>
                  <Text style={styles.primaryBtnText}>← Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.primaryBtn, { flex: 1 }]} onPress={registerDriver}>
                  {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Register ✓</Text>}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    );
  }

  // ══════════════════════════════════════════════
  // ─── MAIN DRIVER DASHBOARD ───
  // ══════════════════════════════════════════════
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>SuprO Driver</Text>
          <Text style={styles.headerSubtitle}>{driver.name} • {driver.vehicle_number || driver.vehicle_registration}</Text>
        </View>
        <TouchableOpacity
          style={[styles.toggleBtn, isOnline ? styles.toggleOn : styles.toggleOff]}
          onPress={toggleStatus}
        >
          <Power size={22} color="#fff" />
          <Text style={styles.toggleText}>{isOnline ? 'ONLINE' : 'OFFLINE'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* STATUS INDICATOR */}
        <View style={styles.statusIndicator}>
          <View style={[styles.statusDot, isOnline ? { backgroundColor: COLORS.green } : { backgroundColor: COLORS.red }]} />
          <Text style={styles.statusText}>
            {isOnline ? 'You are Online — Accepting Rides' : 'You are Offline — Go online to get rides'}
          </Text>
        </View>

        {/* ──── ACTIVE RIDE PANEL ──── */}
        {activeRide && (
          <View style={styles.activeRideCard}>
            <View style={styles.activeRideHeader}>
              <Car size={24} color={COLORS.blue} />
              <Text style={styles.activeRideTitle}>
                {activeRide.status === RIDE_STATUS.ACCEPTED ? 'Go to Pickup' :
                 activeRide.status === RIDE_STATUS.DRIVER_ARRIVED ? 'Waiting for Rider' :
                 'Trip in Progress'}
              </Text>
            </View>

            {/* Map View */}
            <View style={{ height: 200, borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
              <MapView
                ref={mapRef}
                style={{ flex: 1 }}
                provider={PROVIDER_GOOGLE}
                customMapStyle={mapStyleDark}
                initialRegion={{
                  latitude: currentLocation?.latitude || activeRide?.pickup_location?.lat || 11.0,
                  longitude: currentLocation?.longitude || activeRide?.pickup_location?.lng || 78.0,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
              >
                {currentLocation && (
                  <Marker coordinate={currentLocation} title="You">
                    <View style={styles.driverDot}>
                      <View style={styles.driverDotInner} />
                    </View>
                  </Marker>
                )}
                {activeRide?.pickup_location?.lat && (
                  <Marker
                    coordinate={{ latitude: activeRide?.pickup_location?.lat, longitude: activeRide?.pickup_location?.lng }}
                    title="Pickup"
                    pinColor="green"
                  />
                )}
                {activeRide?.drop_location?.lat && activeRide?.drop_location?.lat !== 0 && (
                  <Marker
                    coordinate={{ latitude: activeRide?.drop_location?.lat, longitude: activeRide?.drop_location?.lng }}
                    title="Dropoff"
                    pinColor="red"
                  />
                )}
                {routeCoordinates.length > 0 && (
                  <Polyline coordinates={routeCoordinates} strokeWidth={4} strokeColor={COLORS.blue} />
                )}
              </MapView>
            </View>

            {/* Ride Location Details */}
            <View style={styles.rideDetails}>
              <View style={styles.locationRow}>
                <MapPin size={16} color={COLORS.green} />
                <Text style={styles.locationText} numberOfLines={2}>{activeRide?.pickup_location?.address || 'Pickup location'}</Text>
              </View>
              <View style={{ height: 1, backgroundColor: COLORS.border, marginVertical: 12, marginLeft: 28 }} />
              <View style={styles.locationRow}>
                <MapPin size={16} color={COLORS.red} />
                <Text style={styles.locationText} numberOfLines={2}>{activeRide?.drop_location?.address || 'Drop location not specified'}</Text>
              </View>
            </View>

            {/* Rider Info */}
            <View style={[styles.rideDetails, { marginTop: 0 }]}>
              <Text style={{ color: COLORS.text, fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>
                {activeRide.passenger_name || activeRide.customer_name || 'Rider'}
              </Text>
              <Text style={{ color: COLORS.textSecondary }}>
                {activeRide.passenger_phone || activeRide.customer_phone || 'No phone'}
              </Text>
              {activeRide.fare && (
                <Text style={{ color: COLORS.green, fontWeight: 'bold', fontSize: 18, marginTop: 8 }}>
                  Fare: ₹{activeRide.fare || activeRide.total_fare || 0}
                </Text>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => callPhone(activeRide.passenger_phone || activeRide.customer_phone)}>
                <Phone size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.iconBtn, { backgroundColor: COLORS.green }]} onPress={() => whatsappToPhone(activeRide.passenger_phone || activeRide.customer_phone)}>
                <MessageCircle size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconBtn, { flex: 1, backgroundColor: COLORS.blue, flexDirection: 'row', gap: 8 }]}
                onPress={() => openNavigation(
                  (activeRide.status === RIDE_STATUS.ACCEPTED || activeRide.status === RIDE_STATUS.DRIVER_ARRIVED)
                    ? activeRide?.pickup_location?.lat : activeRide?.drop_location?.lat,
                  (activeRide.status === RIDE_STATUS.ACCEPTED || activeRide.status === RIDE_STATUS.DRIVER_ARRIVED)
                    ? activeRide?.pickup_location?.lng : activeRide?.drop_location?.lng
                )}
              >
                <Navigation size={20} color="#fff" />
                <Text style={styles.btnText}>Navigate</Text>
              </TouchableOpacity>
            </View>

            {/* Share Location during trip */}
            {activeRide.status === RIDE_STATUS.IN_PROGRESS && currentLocation && (
              <TouchableOpacity
                style={[styles.outlineBtn, { borderColor: COLORS.green, marginBottom: 12 }]}
                onPress={() => shareLocationWhatsApp(currentLocation.latitude, currentLocation.longitude, 'Driver live location — SuprO')}
              >
                <Navigation size={16} color={COLORS.green} />
                <Text style={[styles.outlineBtnText, { color: COLORS.green }]}>Share Live Location</Text>
              </TouchableOpacity>
            )}

            {/* Status-specific Actions */}
            {activeRide.status === RIDE_STATUS.ACCEPTED && (
              <TouchableOpacity
                style={[styles.primaryBtn, { marginTop: 8 }]}
                onPress={async () => {
                  const { error } = await supabase.from('rides').update({ status: RIDE_STATUS.DRIVER_ARRIVED }).eq('id', activeRide.id);
                  if (!error) setActiveRide({ ...activeRide, status: RIDE_STATUS.DRIVER_ARRIVED });
                }}
              >
                <Text style={styles.primaryBtnText}>📍 I Have Arrived at Pickup</Text>
              </TouchableOpacity>
            )}

            {activeRide.status === RIDE_STATUS.DRIVER_ARRIVED && (
              <View style={styles.otpSection}>
                <Text style={styles.otpLabel}>Enter rider's 4-digit PIN to start trip</Text>
                <View style={styles.otpRow}>
                  {[0, 1, 2, 3].map((i) => (
                    <TextInput
                      key={i}
                      ref={(el) => (otpInputs.current[i] = el)}
                      style={styles.otpInput}
                      keyboardType="number-pad"
                      maxLength={1}
                      value={otp[i]}
                      onChangeText={(t) => handleOtpInput(t, i)}
                    />
                  ))}
                </View>
                <TouchableOpacity
                  style={[styles.primaryBtn, { marginTop: 16 }, otp.join('').length !== 4 && { opacity: 0.5 }]}
                  onPress={verifyOtp}
                  disabled={otp.join('').length !== 4}
                >
                  <Text style={styles.primaryBtnText}>✅ Verify OTP & Start Trip</Text>
                </TouchableOpacity>
              </View>
            )}

            {activeRide.status === RIDE_STATUS.IN_PROGRESS && (
              <View style={styles.progressSection}>
                <View style={styles.fareEst}>
                  <Text style={styles.fareEstLabel}>Estimated Fare</Text>
                  <Text style={styles.fareEstVal}>₹{activeRide.fare || activeRide.total_fare || 0}</Text>
                </View>
                {activeRide.started_at && (
                  <Text style={{ color: COLORS.textMuted, textAlign: 'center', marginTop: 8 }}>
                    Trip started at {new Date(activeRide.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                )}
                <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: '#dc2626', marginTop: 16 }]} onPress={completeTrip}>
                  <Text style={styles.primaryBtnText}>🏁 Complete Trip — ₹{activeRide.fare || activeRide.total_fare || 0}</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Cancel Ride */}
            {(activeRide.status === RIDE_STATUS.ACCEPTED || activeRide.status === RIDE_STATUS.DRIVER_ARRIVED) && (
              <TouchableOpacity style={[styles.outlineBtn, { borderColor: COLORS.red, marginTop: 12 }]} onPress={handleCancelRide}>
                <XCircle size={16} color={COLORS.red} />
                <Text style={[styles.outlineBtnText, { color: COLORS.red }]}>Cancel Ride</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ──── EARNINGS DASHBOARD ──── */}
        {!activeRide && (
          <>
            <View style={styles.dashboardGrid}>
              <View style={styles.statCard}>
                <IndianRupee size={24} color={COLORS.green} />
                <Text style={styles.statValue}>₹{earnings.todaySum}</Text>
                <Text style={styles.statLabel}>Today's Earnings</Text>
              </View>
              <View style={styles.statCard}>
                <Car size={24} color={COLORS.blue} />
                <Text style={styles.statValue}>{earnings.todayTrips}</Text>
                <Text style={styles.statLabel}>Today's Trips</Text>
              </View>
              <View style={styles.statCard}>
                <Wallet size={24} color={COLORS.yellow} />
                <Text style={styles.statValue}>₹{driver.wallet_balance || 0}</Text>
                <Text style={styles.statLabel}>Wallet Balance</Text>
              </View>
              <View style={styles.statCard}>
                <Clock size={24} color={COLORS.purple} />
                <Text style={styles.statValue}>₹{earnings.weekSum}</Text>
                <Text style={styles.statLabel}>Weekly Earnings</Text>
              </View>
            </View>

            {/* WhatsApp Check-in Card */}
            <View style={styles.card}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <MessageCircle size={20} color={COLORS.green} />
                <Text style={styles.cardTitle}>Check-in via WhatsApp</Text>
              </View>
              <Text style={styles.cardText}>Go online and get ride alerts on WhatsApp by sending "Active" to our bot.</Text>
              <TouchableOpacity style={styles.outlineBtn} onPress={shareWhatsAppPin}>
                <Send size={16} color={COLORS.green} />
                <Text style={styles.outlineBtnText}>Send "Active" on WhatsApp</Text>
              </TouchableOpacity>
            </View>

            {/* Subscription Dues */}
            {driver.pending_commission > 0 && (
              <View style={styles.card}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <Wallet size={20} color={COLORS.yellow} />
                  <Text style={styles.cardTitle}>Subscription Dues</Text>
                </View>
                <Text style={styles.cardText}>Pending Commission: ₹{driver.pending_commission}</Text>
                <Text style={styles.cardTextLight}>Pay your dues via UPI to continue accepting rides.</Text>
                <TouchableOpacity
                  style={[styles.outlineBtn, { borderColor: COLORS.yellow }]}
                  onPress={() => payViaUPI(driver.pending_commission, ADMIN_UPI, 'SuprO Driver Dues')}
                >
                  <IndianRupee size={16} color={COLORS.yellow} />
                  <Text style={[styles.outlineBtnText, { color: COLORS.yellow }]}>Pay Dues via UPI</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* ──── INCOMING RIDE REQUEST MODAL ──── */}
      <Modal visible={!!incomingRide} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🔔 NEW RIDE REQUEST!</Text>

            <View style={styles.modalDetails}>
              <Text style={{ color: COLORS.text, fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>
                {incomingRide?.passenger_name || incomingRide?.customer_name || 'Rider'}
              </Text>
              <Text style={{ color: COLORS.textSecondary, marginBottom: 12 }}>
                {incomingRide?.passenger_phone || incomingRide?.customer_phone || ''}
              </Text>
              <View style={styles.locationRow}>
                <MapPin size={16} color={COLORS.green} />
                <Text style={styles.locationText}>{incomingRide?.pickup_address || 'Pickup location'}</Text>
              </View>
              <View style={[styles.locationRow, { marginTop: 12 }]}>
                <MapPin size={16} color={COLORS.red} />
                <Text style={styles.locationText}>{incomingRide?.dropoff_address || 'Not specified'}</Text>
              </View>
            </View>

            <View style={styles.fareBox}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 8 }}>
                <Text style={{ color: COLORS.textMuted }}>
                  📏 {incomingRide?.estimated_distance || incomingRide?.distance_km || '—'} km
                </Text>
                <Text style={{ color: COLORS.textMuted }}>
                  💳 {incomingRide?.payment_mode || 'Cash/UPI'}
                </Text>
              </View>
              <Text style={styles.fareAmount}>₹{incomingRide?.fare || incomingRide?.total_fare || '—'}</Text>
              <Text style={styles.fareSub}>Estimated Fare</Text>
            </View>

            {/* Countdown Timer */}
            <View style={styles.timerContainer}>
              <Text style={styles.timerText}>⏱️ {timeLeft}s remaining</Text>
              <View style={styles.progressBg}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: countdownAnim.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.skipBtn} onPress={handleSkipRide}>
                <XCircle size={20} color={COLORS.red} />
                <Text style={styles.skipBtnText}>SKIP</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.acceptBtn} onPress={handleAcceptRide}>
                <CheckCircle size={20} color="#fff" />
                <Text style={styles.acceptBtnText}>ACCEPT</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ══════════════════════════════════════════════
// ─── STYLES ───
// ══════════════════════════════════════════════
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  regContainer: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textMuted,
    marginBottom: 24,
  },
  progressBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  progressStep: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
  },
  progressStepActive: {
    backgroundColor: COLORS.green,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: COLORS.textSecondary,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    backgroundColor: COLORS.cardLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 14,
    color: COLORS.text,
    fontSize: 16,
  },
  vehicleTypeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  vehicleTypeBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.cardLight,
    alignItems: 'center',
    minWidth: 70,
  },
  vehicleTypeBtnActive: {
    borderColor: COLORS.green,
    backgroundColor: `${COLORS.green}15`,
  },
  vehicleTypeText: {
    color: COLORS.textMuted,
    fontWeight: '500',
    fontSize: 12,
    marginTop: 4,
  },
  vehicleTypeTextActive: {
    color: COLORS.green,
  },
  primaryBtn: {
    backgroundColor: COLORS.green,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardLight,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginTop: 2,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    gap: 8,
  },
  toggleOn: {
    backgroundColor: COLORS.green,
  },
  toggleOff: {
    backgroundColor: COLORS.red,
  },
  toggleText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.cardLight,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  statusText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  dashboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: '47%',
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardLight,
  },
  statValue: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 12,
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.card,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardLight,
    marginBottom: 16,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  cardText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  cardTextLight: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.green,
    marginTop: 12,
    gap: 8,
  },
  outlineBtnText: {
    color: COLORS.green,
    fontSize: 14,
    fontWeight: '600',
  },
  activeRideCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.blue,
    padding: 20,
    marginBottom: 20,
  },
  activeRideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  activeRideTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  rideDetails: {
    backgroundColor: '#0f172a',
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  locationText: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  otpSection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.cardLight,
    paddingTop: 20,
  },
  otpLabel: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 15,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  otpInput: {
    width: 56,
    height: 64,
    backgroundColor: COLORS.cardLight,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 12,
    color: '#fff',
    fontSize: 28,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  progressSection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.cardLight,
    paddingTop: 16,
  },
  fareEst: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    padding: 16,
    borderRadius: 10,
  },
  fareEstLabel: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  fareEstVal: {
    color: COLORS.green,
    fontSize: 22,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    borderTopWidth: 2,
    borderTopColor: COLORS.green,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalDetails: {
    backgroundColor: '#0f172a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  fareBox: {
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardLight,
    marginBottom: 20,
  },
  fareAmount: {
    color: COLORS.green,
    fontSize: 36,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  fareSub: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  timerContainer: {
    marginBottom: 24,
  },
  timerText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
    fontSize: 16,
  },
  progressBg: {
    height: 8,
    backgroundColor: COLORS.cardLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.green,
    borderRadius: 4,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 16,
  },
  skipBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.red,
    gap: 8,
  },
  skipBtnText: {
    color: COLORS.red,
    fontWeight: 'bold',
    fontSize: 16,
  },
  acceptBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: COLORS.green,
    gap: 8,
  },
  acceptBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  driverDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverDotInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.blue,
    borderWidth: 2,
    borderColor: '#fff',
  },
});
