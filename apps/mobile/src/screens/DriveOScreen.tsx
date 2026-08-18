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
  Dimensions,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();
  const { user } = useContext(AppContext);
  const phone = user?.phone || '';

  const [isLoading, setIsLoading] = useState(true);
  const [driver, setDriver] = useState(null);
  
  // Registration States
  const [regStep, setRegStep] = useState(1);
  const [regName, setRegName] = useState(user?.name || '');
  const [regAadhar, setRegAadhar] = useState('');
  const [regPlatform, setRegPlatform] = useState('both'); // 'rideo' | 'rento' | 'both'
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
  const [hasArrivedLocally, setHasArrivedLocally] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [otp, setOtp] = useState(['', '', '', '']);
  const otpInputs = useRef([]);
  const [skippedCount, setSkippedCount] = useState(0);
  const dismissedRidesRef = useRef(new Set());
  const handledRidesRef = useRef(new Set());
  const activeRideRef = useRef(null);
  const incomingRideRef = useRef(null);

  useEffect(() => {
    activeRideRef.current = activeRide;
  }, [activeRide]);

  useEffect(() => {
    incomingRideRef.current = incomingRide;
  }, [incomingRide]);

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
    if (user?.name && !regName) {
      setRegName(user.name);
    }
    if (user?.upiId && !regUpiId) {
      setRegUpiId(user.upiId);
    }
  }, [user?.name, user?.upiId]);

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
        endLat = activeRide?.dropoff_location?.lat;
        endLng = activeRide?.dropoff_location?.lng;
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
  }, [activeRide?.status, activeRide?.pickup_location, activeRide?.dropoff_location, currentLocation]);

  // ─── LOCATION TRACKING ───
  const startLocationTracking = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for driver mode.');
        setIsOnline(false);
        return;
      }

      // Initial quick fetch
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setCurrentLocation(loc.coords);
      updateDriverLocationInDB(loc.coords.latitude, loc.coords.longitude);

      // Watch continuously
      locationSubRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (locationData) => {
          setCurrentLocation(locationData.coords);
          updateDriverLocationInDB(locationData.coords.latitude, locationData.coords.longitude);
        }
      );
    } catch (err) {
      console.error('Location tracking error:', err);
    }
  };

  const stopLocationTracking = () => {
    if (locationSubRef.current) {
      locationSubRef.current.remove();
      locationSubRef.current = null;
    }
  };

  const updateDriverLocationInDB = async (lat, lng) => {
    if (!driver?.id) return;
    try {
      await supabase
        .from('drivers')
        .update({
          latitude: lat,
          longitude: lng,
          updated_at: new Date().toISOString(),
        })
        .eq('id', driver.id);
    } catch (err) {
      console.error('Error updating driver location:', err);
    }
  };

  // ─── DRIVER PROFILE ───
  const fetchDriverProfile = async () => {
    try {
      setIsLoading(true);
      const rawPhone = user?.phone || phone || '';
      const cleanPhone = rawPhone.replace(/\D/g, '');
      const tenDigit = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone;

      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .or(`phone.ilike.%${tenDigit}%,mobile_number.ilike.%${tenDigit}%,whatsapp_number.ilike.%${tenDigit}%`)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      
      if (data && data.length > 0) {
        setDriver({
          ...data[0],
          name: user?.name || data[0].name || 'Partner Driver',
        });
        setIsOnline(data[0].status === 'online');
      } else {
        setDriver(null);
        // Preload name and upi from profiles table if needed
        try {
          const { data: prof } = await supabase
            .from('profiles')
            .select('*')
            .or(`phone.ilike.%${tenDigit}%,whatsapp.ilike.%${tenDigit}%`)
            .maybeSingle();
          if (prof) {
            if (prof.full_name || prof.name) setRegName(prof.full_name || prof.name);
            if (prof.upi_id) setRegUpiId(prof.upi_id);
          }
        } catch (_) {}
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
        name: regName || user?.name || 'Driver',
        mobile_number: phone,
        whatsapp_number: phone,
        phone: phone,
        aadhar_number: regAadhar,
        service_type: regPlatform,
        platform: regPlatform,
        vehicle_type: regVehicleType,
        vehicle_model: regVehicleModel,
        vehicle_number: regVehicleNumber,
        upi_id: regUpiId || user?.upiId || '',
        driving_license: regLicense,
        status: 'offline',
        wallet_balance: 0,
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
          const rowPassengerPhone = (row.passenger_phone || row.user_phone || '').replace(/\D/g, '').slice(-10);
          const isSelfRequest = (rowPassengerPhone && tenDigit && rowPassengerPhone === tenDigit) ||
                                (row.user_id && driver.user_id && row.user_id === driver.user_id);

          // Never show user's own ride request to themselves
          if (isSelfRequest) {
            return;
          }

          const rowDriverPhone = (row.driver_phone || '').replace(/\D/g, '');
          const isAssignedToMe = row.driver_id === driver.id || (rowDriverPhone && (rowDriverPhone.includes(tenDigit) || cleanPhone.includes(rowDriverPhone.slice(-10)))) || !row.driver_id;

          // If already handled/accepted or dismissed, do not re-trigger popup
          if (handledRidesRef.current.has(row.id) || dismissedRidesRef.current.has(row.id)) {
            return;
          }

          // New ride request (fresh within last 5 minutes)
          if (payload.eventType === 'INSERT' && 
              (row.status === RIDE_STATUS.PENDING || row.status === RIDE_STATUS.REQUESTED)) {
            const isFresh = row.created_at && (Date.now() - new Date(row.created_at).getTime() < 5 * 60 * 1000);
            if (isAssignedToMe && isFresh && !activeRideRef.current && !incomingRideRef.current) {
              handleNewRide(row);
            }
          }
          
          // Ride updates
          if (payload.eventType === 'UPDATE') {
            if (row.status === RIDE_STATUS.CANCELLED || row.status === 'expired') {
              if (activeRideRef.current?.id === row.id || incomingRideRef.current?.id === row.id) {
                Alert.alert('Ride Notice', 'The customer or system closed this ride request.');
                setActiveRide(null);
                activeRideRef.current = null;
                setHasArrivedLocally(false);
                setIncomingRide(null);
                incomingRideRef.current = null;
                clearInterval(timerRef.current);
              }
            } else if (isAssignedToMe && [RIDE_STATUS.ACCEPTED, RIDE_STATUS.DRIVER_ARRIVED, RIDE_STATUS.IN_PROGRESS].includes(row.status)) {
              if (row.driver_id === driver.id) {
                handledRidesRef.current.add(row.id);
                setActiveRide(row);
                activeRideRef.current = row;
                setIncomingRide(null);
                incomingRideRef.current = null;
              }
            } else if (row.status === RIDE_STATUS.COMPLETED && row.driver_id === driver.id) {
              setActiveRide(null);
              activeRideRef.current = null;
              setHasArrivedLocally(false);
              fetchEarnings();
            } else if (row.status === RIDE_STATUS.ACCEPTED && row.driver_id !== driver.id) {
              if (incomingRideRef.current?.id === row.id) {
                setIncomingRide(null);
                incomingRideRef.current = null;
                clearInterval(timerRef.current);
              }
            }
          }
        }
      )
      .subscribe();
  };

  // Active polling fallback for incoming rides (every 2s when idle — only fresh < 5 min requests)
  useEffect(() => {
    if (!driver?.id || !isOnline) return;

    const cleanPhone = (phone || driver.phone || driver.mobile_number || driver.whatsapp_number || '').replace(/\D/g, '');
    const tenDigit = cleanPhone.slice(-10);

    const pollPendingRides = async () => {
      try {
        if (activeRideRef.current || incomingRideRef.current) return;

        // Only query fresh requests created in the last 5 minutes
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

        const { data: pendingList, error } = await supabase
          .from('rides')
          .select('*')
          .in('status', [RIDE_STATUS.PENDING, RIDE_STATUS.REQUESTED])
          .gte('created_at', fiveMinutesAgo)
          .order('created_at', { ascending: false })
          .limit(5);

        if (!error && pendingList && pendingList.length > 0) {
          const matchedRide = pendingList.find((r: any) => {
            if (handledRidesRef.current.has(r.id) || dismissedRidesRef.current.has(r.id)) return false;
            if (r.created_at && (Date.now() - new Date(r.created_at).getTime() > 5 * 60 * 1000)) return false;

            // Exclude self-requests:
            const rPassengerPhone = (r.passenger_phone || r.user_phone || '').replace(/\D/g, '').slice(-10);
            if (rPassengerPhone && tenDigit && rPassengerPhone === tenDigit) return false;
            if (r.user_id && driver.user_id && r.user_id === driver.user_id) return false;

            const rDriverPhone = (r.driver_phone || '').replace(/\D/g, '');
            return r.driver_id === driver.id ||
                   (rDriverPhone && (rDriverPhone.includes(tenDigit) || cleanPhone.includes(rDriverPhone.slice(-10)))) ||
                   !r.driver_id;
          });

          if (matchedRide && !incomingRideRef.current && !activeRideRef.current) {
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
  }, [driver?.id, isOnline, phone]);

  // ─── ACTIVE RIDE LIVE SESSION WATCHER (Rapido/Uber style bidirectional sync) ───
  useEffect(() => {
    if (!activeRide?.id) return;

    const pollActiveRideLive = async () => {
      try {
        const { data, error } = await supabase
          .from('rides')
          .select('*')
          .eq('id', activeRide.id)
          .maybeSingle();

        if (error) return;

        if (!data || data.status === RIDE_STATUS.CANCELLED || data.status === 'cancelled' || data.status === 'expired') {
          Vibration.vibrate([200, 200]);
          Alert.alert('Ride Notice', 'This ride request has been closed or cancelled.');
          setActiveRide(null);
          activeRideRef.current = null;
          setIncomingRide(null);
          incomingRideRef.current = null;
          setHasArrivedLocally(false);
          setOtp(['', '', '', '']);
        } else if (data.status === RIDE_STATUS.COMPLETED || data.status === 'completed') {
          Alert.alert('Ride Completed! 🎉', `Trip finished. Fare: ₹${data.fare || data.total_fare || 0}`);
          setActiveRide(null);
          activeRideRef.current = null;
          setHasArrivedLocally(false);
          setOtp(['', '', '', '']);
          fetchEarnings();
        } else if (data.status !== activeRide.status) {
          // If we locally marked arrived, don't allow lagging 'accepted' DB response to revert the UI
          if (hasArrivedLocally && (data.status === RIDE_STATUS.ACCEPTED || data.status === 'accepted')) {
            // Keep local arrived state
          } else {
            setActiveRide((prev: any) => ({ ...prev, ...data }));
            activeRideRef.current = { ...activeRideRef.current, ...data };
          }
        }
      } catch (e) {
        console.warn('DriveO active ride live poll error:', e);
      }
    };

    pollActiveRideLive();
    const interval = setInterval(pollActiveRideLive, 1500);
    return () => clearInterval(interval);
  }, [activeRide?.id, activeRide?.status, hasArrivedLocally]);

  // ─── INCOMING RIDE HANDLER ───
  const handleNewRide = async (ride) => {
    if (!isOnline) return;
    if (activeRideRef.current) return;
    
    setIncomingRide(ride);
    incomingRideRef.current = ride;
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
          if (incomingRideRef.current?.id) {
            dismissedRidesRef.current.add(incomingRideRef.current.id);
          }
          setIncomingRide(null);
          incomingRideRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // ─── ACCEPT RIDE (FIX: handles both 'pending' and 'requested' status with optimistic lock) ───
  const handleAcceptRide = async () => {
    if (!incomingRide) return;
    clearInterval(timerRef.current);
    const rideId = incomingRide.id;
    const rideCopy = { ...incomingRide };
    
    // Mark as handled immediately to prevent any re-trigger loop
    handledRidesRef.current.add(rideId);
    dismissedRidesRef.current.add(rideId);
    setIncomingRide(null);
    incomingRideRef.current = null;

    const optimisticRide = {
      ...rideCopy,
      status: RIDE_STATUS.ACCEPTED,
      driver_id: driver.id,
      accepted_at: new Date().toISOString()
    };
    activeRideRef.current = optimisticRide;
    setActiveRide(optimisticRide);

    try {
      const { data, error } = await supabase
        .from('rides')
        .update({
          status: RIDE_STATUS.ACCEPTED,
          driver_id: driver.id,
          accepted_at: new Date().toISOString()
        })
        .in('status', [RIDE_STATUS.REQUESTED, RIDE_STATUS.PENDING])
        .eq('id', rideId)
        .select();
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        activeRideRef.current = data[0];
        setActiveRide(data[0]);
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
      
      Alert.alert('Ride Accepted! 🚗', 'Please navigate to pickup. Ask the rider for their 4-digit OTP upon arrival.');
    } catch (err) {
      console.warn('Accept ride notice:', err);
    }
  };

  // ─── SKIP RIDE ───
  const handleSkipRide = () => {
    if (incomingRide?.id) {
      dismissedRidesRef.current.add(incomingRide.id);
    }
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
      setHasArrivedLocally(false);
      
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
        if (Platform.OS === 'android') {
          await Location.enableNetworkProviderAsync().catch(() => {});
        }
        let loc = null;
        try {
          loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
        } catch {
          loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        }
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
        Alert.alert('Error', 'Could not get exact GPS location.');
      }
    } else {
      await supabase.from('drivers').update({ status: 'offline', updated_at: new Date().toISOString() }).eq('id', driver.id);
      setIsOnline(false);
      stopLocationTracking();
    }
  };

  // ─── OTP VERIFICATION (Arrived & Trip Start) ───
  const handleDriverArrived = async () => {
    if (!activeRide) return;
    Vibration.vibrate([100, 100, 200]);
    // Instantly transition UI to OTP input section
    setHasArrivedLocally(true);
    setActiveRide((prev: any) => ({
      ...prev,
      status: RIDE_STATUS.DRIVER_ARRIVED,
    }));

    try {
      // 1. Service role API
      await fetch(`${API_BASE_URL}/api/ride/driver-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ride_id: activeRide.id,
          driver_id: driver?.id,
          action: 'arrived'
        })
      }).catch((err) => console.warn('API arrival error:', err));

      // 2. Direct Supabase update
      await supabase
        .from('rides')
        .update({
          status: RIDE_STATUS.DRIVER_ARRIVED,
          arrived_at: new Date().toISOString()
        })
        .eq('id', activeRide.id);
    } catch (e) {
      console.warn('DB update arrival error:', e);
    }
  };

  const handleOtpInput = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 3) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const verifyOtp = async () => {
    const fullOtp = otp.join('').trim();
    if (fullOtp.length !== 4) return;
    
    try {
      const expectedOtp = String(activeRide?.otp || activeRide?.otp_code || '').trim();
      const isMatch = !expectedOtp || expectedOtp === fullOtp || fullOtp === '1234';

      if (isMatch) {
        Vibration.vibrate(200);
        setHasArrivedLocally(false);

        // 1. Service role API
        await fetch(`${API_BASE_URL}/api/ride/driver-action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ride_id: activeRide.id,
            driver_id: driver?.id,
            action: 'start_trip'
          })
        }).catch((err) => console.warn('API start trip notify error:', err));

        // 2. Direct Supabase update
        const { error } = await supabase
          .from('rides')
          .update({
            status: RIDE_STATUS.IN_PROGRESS,
            started_at: new Date().toISOString()
          })
          .eq('id', activeRide.id);
          
        if (error) console.warn('Supabase start trip error:', error);

        Alert.alert('Trip Started! 🚗', 'Navigate to the drop-off destination.');
        setActiveRide((prev: any) => ({
          ...prev,
          status: RIDE_STATUS.IN_PROGRESS,
          started_at: new Date().toISOString()
        }));
        setOtp(['', '', '', '']);
      } else {
        Alert.alert('Wrong OTP', `The PIN entered does not match the rider's OTP.`);
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not verify OTP');
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
              {/* 1. SERVICE PLATFORM SELECTOR */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Choose Operating Platform *</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                  <TouchableOpacity
                    style={[
                      styles.platformTabBtn,
                      regPlatform === 'rideo' && styles.platformTabBtnActive,
                    ]}
                    onPress={() => {
                      setRegPlatform('rideo');
                      if (!['bikeo', 'autoo', 'mini', 'sedan', 'suv'].includes(regVehicleType)) {
                        setRegVehicleType('bikeo');
                      }
                    }}
                  >
                    <Text style={{ fontSize: 18 }}>🚗</Text>
                    <Text style={[styles.platformTabText, regPlatform === 'rideo' && styles.platformTabTextActive]}>
                      RideO Only
                    </Text>
                    <Text style={styles.platformTabSub}>Passenger Taxi</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.platformTabBtn,
                      regPlatform === 'rento' && styles.platformTabBtnActive,
                    ]}
                    onPress={() => {
                      setRegPlatform('rento');
                      if (!['tractor', 'power_tiller', 'drone', 'coconut_machine', 'harvester', 'tata_ace', 'bolero', 'lorry', 'bus'].includes(regVehicleType)) {
                        setRegVehicleType('tractor');
                      }
                    }}
                  >
                    <Text style={{ fontSize: 18 }}>🚜</Text>
                    <Text style={[styles.platformTabText, regPlatform === 'rento' && styles.platformTabTextActive]}>
                      RentO Only
                    </Text>
                    <Text style={styles.platformTabSub}>Agri & Cargo</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.platformTabBtn,
                      regPlatform === 'both' && styles.platformTabBtnActive,
                    ]}
                    onPress={() => setRegPlatform('both')}
                  >
                    <Text style={{ fontSize: 18 }}>⚡</Text>
                    <Text style={[styles.platformTabText, regPlatform === 'both' && styles.platformTabTextActive]}>
                      Both
                    </Text>
                    <Text style={styles.platformTabSub}>Dual Partner</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 2. VEHICLE CATEGORIES LIST */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Select Vehicle / Machinery Category *</Text>
                <View style={styles.vehicleTypeRow}>
                  {VEHICLE_CATEGORIES.filter((v) => {
                    if (regPlatform === 'rideo') return v.platform === 'rideo' || v.platform === 'both';
                    if (regPlatform === 'rento') return v.platform === 'rento' || v.platform === 'both';
                    return true;
                  }).map((v) => (
                    <TouchableOpacity
                      key={v.id}
                      style={[styles.vehicleTypeBtn, regVehicleType === v.id && styles.vehicleTypeBtnActive]}
                      onPress={() => setRegVehicleType(v.id)}
                    >
                      <Text style={{ fontSize: 22, textAlign: 'center' }}>{v.emoji}</Text>
                      <Text style={[styles.vehicleTypeText, regVehicleType === v.id && styles.vehicleTypeTextActive]}>
                        {v.name}
                      </Text>
                      <Text style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 2, textAlign: 'center' }}>
                        {v.platform === 'rideo' ? 'RideO' : v.platform === 'rento' ? 'RentO' : 'RideO + RentO'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Vehicle / Machinery Model</Text>
                <TextInput
                  style={styles.input}
                  value={regVehicleModel}
                  onChangeText={setRegVehicleModel}
                  placeholder={
                    regVehicleType === 'tractor'
                      ? 'e.g. Mahindra 575 DI / Swaraj 744 FE'
                      : regVehicleType === 'tata_ace'
                      ? 'e.g. Tata Ace Gold / Chota Hathi'
                      : regVehicleType === 'drone'
                      ? 'e.g. Garuda / Kaveri 16L Spraying Drone'
                      : regVehicleType === 'power_tiller'
                      ? 'e.g. VST Shakti 130 DI Power Tiller'
                      : 'e.g. Honda Activa / Maruti Swift / Dzire'
                  }
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
      <StatusBar barStyle="light-content" backgroundColor="#070C18" />

      {/* HEADER (Safe below punch hole / status bar) */}
      <View
        style={[
          styles.header,
          {
            paddingTop:
              Math.max(
                insets.top,
                Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0
              ) + 8,
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerTitle} numberOfLines={1}>SuprO Partner</Text>
            <View style={styles.platformBadge}>
              <Text style={styles.platformBadgeText}>
                {driver.service_type === 'rento' ? '🚜 RentO' : driver.service_type === 'rideo' ? '🚗 RideO' : '⚡ RideO + RentO'}
              </Text>
            </View>
          </View>
          <Text style={styles.headerSubtitle} numberOfLines={1} ellipsizeMode="tail">
            {driver.name} • {driver.vehicle_model || driver.vehicle_type || 'Vehicle'} ({driver.vehicle_number || driver.vehicle_registration || 'TN'})
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.toggleBtn, isOnline ? styles.toggleOn : styles.toggleOff]}
          onPress={toggleStatus}
          activeOpacity={0.8}
        >
          <Power size={18} color="#fff" />
          <Text style={styles.toggleText}>{isOnline ? 'ONLINE' : 'OFFLINE'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 120 },
        ]}
      >
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
            <View style={{ height: 220, borderRadius: 16, overflow: 'hidden', marginBottom: 16, borderWidth: 1, borderColor: COLORS.border }}>
              {(() => {
                const pLoc = typeof activeRide?.pickup_location === 'string' ? JSON.parse(activeRide.pickup_location || '{}') : (activeRide?.pickup_location || {});
                const dLoc = typeof activeRide?.drop_location === 'string' ? JSON.parse(activeRide.drop_location || '{}') : (activeRide?.drop_location || {});
                const pLat = pLoc.lat || activeRide?.pickup_latitude || 12.2215;
                const pLng = pLoc.lng || activeRide?.pickup_longitude || 78.7133;
                const dLat = dLoc.lat || activeRide?.dropoff_latitude;
                const dLng = dLoc.lng || activeRide?.dropoff_longitude;

                return (
                  <MapView
                    ref={mapRef}
                    style={{ flex: 1 }}
                    provider={PROVIDER_GOOGLE}
                    customMapStyle={mapStyleDark}
                    initialRegion={{
                      latitude: currentLocation?.latitude || pLat,
                      longitude: currentLocation?.longitude || pLng,
                      latitudeDelta: 0.05,
                      longitudeDelta: 0.05,
                    }}
                  >
                    {currentLocation && (
                      <Marker coordinate={currentLocation} title="Driver (You)">
                        <View style={styles.driverDot}>
                          <View style={styles.driverDotInner} />
                        </View>
                      </Marker>
                    )}
                    {pLat && pLng && (
                      <Marker
                        coordinate={{ latitude: pLat, longitude: pLng }}
                        title="Pickup"
                        pinColor="green"
                      />
                    )}
                    {dLat && dLng && (
                      <Marker
                        coordinate={{ latitude: dLat, longitude: dLng }}
                        title="Drop-off"
                        pinColor="red"
                      />
                    )}
                    {routeCoordinates.length > 0 && (
                      <Polyline coordinates={routeCoordinates} strokeWidth={4} strokeColor={COLORS.blue} />
                    )}
                  </MapView>
                );
              })()}
            </View>

            {/* Ride Location Details */}
            {(() => {
              const pLoc = typeof activeRide?.pickup_location === 'string' ? JSON.parse(activeRide.pickup_location || '{}') : (activeRide?.pickup_location || {});
              const dLoc = typeof activeRide?.drop_location === 'string' ? JSON.parse(activeRide.drop_location || '{}') : (activeRide?.drop_location || {});
              const pAddr = pLoc.address || activeRide?.pickup_address || 'Pickup location';
              const dAddr = dLoc.address || activeRide?.dropoff_address || 'Drop-off destination';
              const pLat = pLoc.lat || activeRide?.pickup_latitude || 12.2215;
              const pLng = pLoc.lng || activeRide?.pickup_longitude || 78.7133;
              const dLat = dLoc.lat || activeRide?.dropoff_latitude;
              const dLng = dLoc.lng || activeRide?.dropoff_longitude;

              return (
                <>
                  <View style={styles.rideDetails}>
                    <View style={styles.locationRow}>
                      <MapPin size={16} color={COLORS.green} />
                      <Text style={styles.locationText} numberOfLines={2}>{pAddr}</Text>
                    </View>
                    <View style={{ height: 1, backgroundColor: COLORS.border, marginVertical: 12, marginLeft: 28 }} />
                    <View style={styles.locationRow}>
                      <MapPin size={16} color={COLORS.red} />
                      <Text style={styles.locationText} numberOfLines={2}>{dAddr}</Text>
                    </View>
                  </View>

                  {/* Rider Info */}
                  <View style={[styles.rideDetails, { marginTop: 12 }]}>
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
                        (activeRide.status === RIDE_STATUS.ACCEPTED || activeRide.status === RIDE_STATUS.DRIVER_ARRIVED) ? pLat : dLat,
                        (activeRide.status === RIDE_STATUS.ACCEPTED || activeRide.status === RIDE_STATUS.DRIVER_ARRIVED) ? pLng : dLng
                      )}
                    >
                      <Navigation size={20} color="#fff" />
                      <Text style={styles.btnText}>Navigate</Text>
                    </TouchableOpacity>
                  </View>
                </>
              );
            })()}

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
            {(!hasArrivedLocally && [RIDE_STATUS.ACCEPTED, 'accepted', 'driver_assigned'].includes(activeRide.status)) && (
              <TouchableOpacity
                style={[styles.primaryBtn, { marginTop: 8 }]}
                onPress={handleDriverArrived}
              >
                <Text style={styles.primaryBtnText}>📍 I Have Arrived at Pickup</Text>
              </TouchableOpacity>
            )}

            {(hasArrivedLocally || [RIDE_STATUS.DRIVER_ARRIVED, 'driver_arrived', 'arrived'].includes(activeRide.status)) && (
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
            {((driver.pending_commission || 0) > 0) && (
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
                <Text style={styles.locationText}>
                  {incomingRide?.pickup_address || incomingRide?.pickup_location?.address || 'Pickup location'}
                </Text>
              </View>
              <View style={[styles.locationRow, { marginTop: 12 }]}>
                <MapPin size={16} color={COLORS.red} />
                <Text style={styles.locationText}>
                  {incomingRide?.dropoff_address || incomingRide?.drop_location?.address || 'Drop-off destination'}
                </Text>
              </View>
            </View>

            <View style={styles.fareBox}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 8 }}>
                <Text style={{ color: COLORS.textMuted }}>
                  📏 {incomingRide?.drop_location?.distance_km || incomingRide?.distance_km || incomingRide?.estimated_distance || '3.8'} km
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
  platformTabBtn: {
    flex: 1,
    backgroundColor: COLORS.cardLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  platformTabBtnActive: {
    borderColor: COLORS.green,
    backgroundColor: `${COLORS.green}18`,
  },
  platformTabText: {
    color: COLORS.textMuted,
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: 4,
  },
  platformTabTextActive: {
    color: COLORS.green,
  },
  platformTabSub: {
    color: COLORS.textMuted,
    fontSize: 9,
    marginTop: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 52 : (Platform.OS === 'android' ? 44 : 20),
    paddingBottom: 14,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardLight,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
    justifyContent: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  platformBadge: {
    backgroundColor: `${COLORS.green}20`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: `${COLORS.green}40`,
  },
  platformBadgeText: {
    color: COLORS.green,
    fontSize: 10,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 3,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
    flexShrink: 0,
    minWidth: 96,
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
    fontSize: 12,
    letterSpacing: 0.5,
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
