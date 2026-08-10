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
  Linking,
  Platform,
  ActivityIndicator,
  Alert
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
  Send
} from 'lucide-react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Audio } from 'expo-av';

// Haversine formula to calculate distance in km
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const formatCurrency = (amount) => {
  return `₹${Number(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
};

const mapStyleDark = [
  { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
];

export default function DriveOScreen() {
  const { user } = useContext(AppContext);
  const phone = user?.phone || '';

  const [isLoading, setIsLoading] = useState(true);
  const [driver, setDriver] = useState(null);
  
  // Registration States
  const [regStep, setRegStep] = useState(1);
  const [regName, setRegName] = useState(user?.name || '');
  const [regAadhar, setRegAadhar] = useState('');
  const [regVehicleType, setRegVehicleType] = useState('Bike');
  const [regVehicleModel, setRegVehicleModel] = useState('');
  const [regVehicleNumber, setRegVehicleNumber] = useState('');
  const [regUpiId, setRegUpiId] = useState('');
  const [regLicense, setRegLicense] = useState('');

  // Dashboard States
  const [isOnline, setIsOnline] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const locationSubRef = useRef(null);

  // Ride States
  const [incomingRide, setIncomingRide] = useState(null);
  const [activeRide, setActiveRide] = useState(null);
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
      supabase.removeAllChannels();
      stopLocationTracking();
    };
  }, [driver?.id]);

  useEffect(() => {
    if (activeRide && mapRef.current) {
      const markers = [];
      if (currentLocation) {
        markers.push({ latitude: currentLocation.latitude, longitude: currentLocation.longitude });
      }
      if (activeRide.pickup_latitude) {
        markers.push({ latitude: activeRide.pickup_latitude, longitude: activeRide.pickup_longitude });
      }
      if (activeRide.dropoff_latitude) {
        markers.push({ latitude: activeRide.dropoff_latitude, longitude: activeRide.dropoff_longitude });
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

  const fetchDriverProfile = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .or(`mobile_number.eq.${phone},whatsapp_number.eq.${phone},phone.ilike.%${phone.slice(-10)}%`)
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

  const registerDriver = async () => {
    if (!regVehicleNumber || !regUpiId) {
      Alert.alert('Validation Error', 'Please fill all required fields');
      return;
    }
    try {
      setIsLoading(true);
      const newDriver = {
        name: regName || 'Driver',
        mobile_number: phone,
        whatsapp_number: phone,
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
      Alert.alert('Error', 'Failed to register as driver.');
    } finally {
      setIsLoading(false);
    }
  };

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
        .eq('status', 'completed')
        .gte('completed_at', weekStart.toISOString());

      if (error) throw error;

      let tSum = 0;
      let tTrips = 0;
      let wSum = 0;

      data.forEach(ride => {
        const d = new Date(ride.completed_at);
        const earningsAmt = ride.driver_earnings || ride.total_fare || 0;
        wSum += earningsAmt;
        if (d >= todayStart) {
          tSum += earningsAmt;
          tTrips += 1;
        }
      });

      setEarnings({
        todaySum: tSum,
        todayTrips: tTrips,
        weekSum: wSum
      });
    } catch (err) {
      console.error('Error fetching earnings:', err);
    }
  };

  const fetchActiveRide = async () => {
    try {
      const { data, error } = await supabase
        .from('rides')
        .select('*')
        .eq('driver_id', driver.id)
        .in('status', ['accepted', 'driver_arrived', 'in_progress'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setActiveRide(data);
      } else {
        setActiveRide(null);
      }
    } catch (err) {
      console.error('Error fetching active ride:', err);
    }
  };

  const setupRealtimeSubscription = () => {
    supabase
      .channel('driver-rides')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'rides',
          filter: `driver_id=eq.${driver.id}`
        },
        (payload) => {
          if (payload.new.status === 'pending' || payload.new.status === 'requested') {
            handleNewRide(payload.new);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rides',
          filter: `driver_id=eq.${driver.id}`
        },
        (payload) => {
          if (payload.new.status === 'cancelled') {
            if (activeRide?.id === payload.new.id || incomingRide?.id === payload.new.id) {
              Alert.alert('Ride Cancelled', 'The customer cancelled the ride.');
              setActiveRide(null);
              setIncomingRide(null);
            }
          } else if (['accepted', 'driver_arrived', 'in_progress'].includes(payload.new.status)) {
            setActiveRide(payload.new);
            setIncomingRide(null);
          } else if (payload.new.status === 'completed') {
            setActiveRide(null);
            fetchEarnings();
          }
        }
      )
      .subscribe();
  };

  const handleNewRide = async (ride) => {
    if (!isOnline) return;
    if (activeRide) return; // Don't show if already on a ride
    if (ride.vehicle_type && ride.vehicle_type.toLowerCase() !== driver.vehicle_type?.toLowerCase() && ride.vehicle_type !== 'Any') return;

    if (currentLocation && ride.pickup_latitude && ride.pickup_longitude) {
      const dist = getDistance(currentLocation.latitude, currentLocation.longitude, ride.pickup_latitude, ride.pickup_longitude);
      if (dist > 10) return; // Skip rides more than 10km away
    }
    
    setIncomingRide(ride);

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' },
        { shouldPlay: true, volume: 1.0 }
      );
      setTimeout(() => sound.unloadAsync(), 5000);
    } catch(e) { console.log('Audio error', e); }

    Vibration.vibrate([1000, 500, 1000]);
    startCountdown();
  };

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

  const handleAcceptRide = async () => {
    if (!incomingRide) return;
    clearInterval(timerRef.current);
    const rideId = incomingRide.id;
    setIncomingRide(null);
    
    try {
      const tripOtp = String(1000 + Math.floor(Math.random() * 9000));
      
      const { error } = await supabase
        .from('rides')
        .update({
          status: 'accepted',
          otp: tripOtp
        })
        .eq('id', rideId);
        
      if (error) throw error;
      
      Alert.alert('Success', 'Ride accepted!');
      fetchActiveRide(); // Fallback in case realtime misses it
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const handleSkipRide = () => {
    clearInterval(timerRef.current);
    setIncomingRide(null);
    setSkippedCount(prev => {
      const newCount = prev + 1;
      if (newCount % 5 === 0) {
        Alert.alert('Warning', 'You have skipped several rides. A low acceptance rate may affect your account.');
      }
      return newCount;
    });
  };

  const handleCancelRide = () => {
    Alert.alert(
      'Cancel Ride',
      'Please select a reason for cancellation',
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
      const res = await fetch('https://watscrm.vercel.app/api/rides/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ride_id: activeRide.id, cancelled_by: 'driver', reason })
      });
      if (!res.ok) throw new Error('Failed to cancel ride');
      
      Alert.alert('Ride Cancelled', 'The ride has been cancelled successfully.');
      setActiveRide(null);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const toggleStatus = async () => {
    const newStatus = !isOnline;
    
    if (newStatus) {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Location permission is required to go online.');
        return;
      }
      
      try {
        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation(location.coords);
        
        await supabase.from('drivers').update({
          status: 'online',
          pickup_latitude: location.coords.latitude,
          pickup_longitude: location.coords.longitude
        }).eq('id', driver.id);
        
        setIsOnline(true);
        startLocationTracking();
      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'Could not get location.');
      }
    } else {
      await supabase.from('drivers').update({ status: 'offline' }).eq('id', driver.id);
      setIsOnline(false);
      stopLocationTracking();
    }
  };

  const startLocationTracking = async () => {
    stopLocationTracking();
    locationSubRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 30000,
        distanceInterval: 50,
      },
      async (location) => {
        setCurrentLocation(location.coords);
        if (driver?.id && isOnline) {
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

  const handleOtpInput = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 3) {
      otpInputs.current[index + 1].focus();
    }
  };

  const verifyOtp = async () => {
    const fullOtp = otp.join('');
    if (fullOtp.length !== 4) return;
    
    try {
      // Direct update for now, or use API route
      if (activeRide.otp === fullOtp || (__DEV__ && fullOtp === '0000')) {
        const { error } = await supabase
          .from('rides')
          .update({ status: 'in_progress', started_at: new Date().toISOString() })
          .eq('id', activeRide.id);
          
        if (error) throw error;
        Alert.alert('Success', 'Trip started!');
        setActiveRide({...activeRide, status: 'in_progress'});
        setOtp(['', '', '', '']);
      } else {
        Alert.alert('Invalid OTP', 'Please check the OTP with customer.');
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const completeTrip = async () => {
    try {
      const res = await fetch('https://watscrm.vercel.app/api/rides/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ride_id: activeRide.id })
      });
      if (!res.ok) throw new Error('Failed to complete trip');
      
      Alert.alert('Trip Completed', `Collect ₹${activeRide.total_fare || 0} via UPI or Cash.`);
      setActiveRide(null);
      fetchEarnings();
    } catch (err) {
      Alert.alert('Error', err.message);
      
      // Fallback direct update
      const { error } = await supabase
        .from('rides')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', activeRide.id);
        
      if (!error) {
        setActiveRide(null);
        fetchEarnings();
      }
    }
  };

  const openNavigation = (lat, lng) => {
    const url = Platform.OS === 'ios'
      ? `http://maps.apple.com/?daddr=${lat},${lng}`
      : `google.navigation:q=${lat},${lng}`;
    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
    });
  };

  const shareWhatsAppPin = () => {
    const msg = encodeURIComponent("Active");
    Linking.openURL(`whatsapp://send?phone=+916381029380&text=${msg}`);
  };

  if (isLoading && !driver) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  // REGISTRATION SCREEN
  if (!driver) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.regContainer}>
          <Text style={styles.title}>Driver Registration</Text>
          <Text style={styles.subtitle}>Step {regStep} of 3</Text>

          {regStep === 1 && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={regName}
                  onChangeText={setRegName}
                  placeholder="e.g. Ramesh Kumar"
                  placeholderTextColor="#64748b"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Aadhar Number</Text>
                <TextInput
                  style={styles.input}
                  value={regAadhar}
                  onChangeText={setRegAadhar}
                  placeholder="e.g. 1234 5678 9012"
                  placeholderTextColor="#64748b"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>UPI ID (For earnings)</Text>
                <TextInput
                  style={styles.input}
                  value={regUpiId}
                  onChangeText={setRegUpiId}
                  placeholder="e.g. ramesh@okicici"
                  placeholderTextColor="#64748b"
                />
              </View>

              <TouchableOpacity style={styles.primaryBtn} onPress={() => setRegStep(2)}>
                <Text style={styles.primaryBtnText}>Next</Text>
              </TouchableOpacity>
            </>
          )}

          {regStep === 2 && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Vehicle Type</Text>
                <View style={styles.vehicleTypeRow}>
                  {['Bike', 'Auto', 'Cab-Mini', 'Cargo'].map(v => (
                    <TouchableOpacity
                      key={v}
                      style={[styles.vehicleTypeBtn, regVehicleType === v && styles.vehicleTypeBtnActive]}
                      onPress={() => setRegVehicleType(v)}
                    >
                      <Text style={[styles.vehicleTypeText, regVehicleType === v && styles.vehicleTypeTextActive]}>{v}</Text>
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
                  placeholder="e.g. Honda Activa"
                  placeholderTextColor="#64748b"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Vehicle Number</Text>
                <TextInput
                  style={styles.input}
                  value={regVehicleNumber}
                  onChangeText={setRegVehicleNumber}
                  placeholder="e.g. TN38AB1234"
                  placeholderTextColor="#64748b"
                  autoCapitalize="characters"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Driving License</Text>
                <TextInput
                  style={styles.input}
                  value={regLicense}
                  onChangeText={setRegLicense}
                  placeholder="e.g. TN38 123456789"
                  placeholderTextColor="#64748b"
                  autoCapitalize="characters"
                />
              </View>

              <View style={{flexDirection: 'row', gap: 12}}>
                <TouchableOpacity style={[styles.primaryBtn, {flex: 1, backgroundColor: '#334155'}]} onPress={() => setRegStep(1)}>
                  <Text style={styles.primaryBtnText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.primaryBtn, {flex: 1}]} onPress={() => setRegStep(3)}>
                  <Text style={styles.primaryBtnText}>Next</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {regStep === 3 && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Documents Upload</Text>
                <Text style={{color: '#cbd5e1', marginBottom: 12, lineHeight: 22}}>
                  Please send clear photos of your Aadhar Card, RC Book, and Driving License to our WhatsApp number: +91 63810 29380.
                </Text>
                <Text style={{color: '#94a3b8', fontSize: 13, lineHeight: 18}}>
                  Your account will be activated after document verification.
                </Text>
              </View>

              <View style={{flexDirection: 'row', gap: 12}}>
                <TouchableOpacity style={[styles.primaryBtn, {flex: 1, backgroundColor: '#334155'}]} onPress={() => setRegStep(2)}>
                  <Text style={styles.primaryBtnText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.primaryBtn, {flex: 1}]} onPress={registerDriver}>
                  <Text style={styles.primaryBtnText}>Register</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    );
  }

  // MAIN DASHBOARD
  return (
    <View style={styles.container}>
      {/* HEADER & TOGGLE */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>SuprO Driver</Text>
          <Text style={styles.headerSubtitle}>{driver.vehicle_number} • {driver.vehicle_type}</Text>
        </View>
        <TouchableOpacity
          style={[styles.toggleBtn, isOnline ? styles.toggleOn : styles.toggleOff]}
          onPress={toggleStatus}
        >
          <Power size={24} color="#fff" />
          <Text style={styles.toggleText}>{isOnline ? 'ONLINE' : 'OFFLINE'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* OFFLINE / ONLINE STATUS TEXT */}
        <View style={styles.statusIndicator}>
          <View style={[styles.statusDot, isOnline ? {backgroundColor: '#10b981'} : {backgroundColor: '#ef4444'}]} />
          <Text style={styles.statusText}>
            {isOnline ? 'You are Online — Accepting Rides' : 'You are Offline — Go online to get rides'}
          </Text>
        </View>

        {/* ACTIVE RIDE PANEL */}
        {activeRide && (
          <View style={styles.activeRideCard}>
            <View style={styles.activeRideHeader}>
              <Car size={24} color="#3b82f6" />
              <Text style={styles.activeRideTitle}>
                {activeRide.status === 'accepted' || activeRide.status === 'driver_arrived' ? 'Pickup Customer' : 'Trip in Progress'}
              </Text>
            </View>

            {/* MapView for Active Ride */}
            <View style={{ height: 200, borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
              <MapView
                ref={mapRef}
                style={{ flex: 1 }}
                provider={PROVIDER_GOOGLE}
                customMapStyle={mapStyleDark}
                initialRegion={{
                  latitude: currentLocation?.latitude || activeRide.pickup_latitude,
                  longitude: currentLocation?.longitude || activeRide.pickup_longitude,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
              >
                {currentLocation && (
                  <Marker coordinate={currentLocation} title="You">
                    <View style={styles.driverDot} />
                  </Marker>
                )}
                {activeRide.pickup_latitude && (
                  <Marker coordinate={{ latitude: activeRide.pickup_latitude, longitude: activeRide.pickup_longitude }} title="Pickup" pinColor="green" />
                )}
                {activeRide.dropoff_latitude && (
                  <Marker coordinate={{ latitude: activeRide.dropoff_latitude, longitude: activeRide.dropoff_longitude }} title="Dropoff" pinColor="red" />
                )}
              </MapView>
            </View>

            <View style={styles.rideDetails}>
              <View style={styles.locationRow}>
                <View style={styles.dotLine} />
                <MapPin size={16} color="#10b981" />
                <Text style={styles.locationText} numberOfLines={2}>{activeRide.pickup_address}</Text>
              </View>
              <View style={[styles.locationRow, {marginTop: 16}]}>
                <MapPin size={16} color="#ef4444" />
                <Text style={styles.locationText} numberOfLines={2}>{activeRide.dropoff_address || 'Drop location not specified'}</Text>
              </View>
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => Linking.openURL(`tel:${activeRide.customer_phone || ''}`)}>
                <Phone size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.iconBtn, {backgroundColor: '#10b981'}]} onPress={() => Linking.openURL(`whatsapp://send?phone=91${activeRide.customer_phone || ''}`)}>
                <MessageCircle size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.iconBtn, {flex: 1, backgroundColor: '#3b82f6', flexDirection: 'row', gap: 8}]} 
                onPress={() => openNavigation(
                  (activeRide.status === 'accepted' || activeRide.status === 'driver_arrived') ? activeRide.pickup_latitude : activeRide.dropoff_latitude,
                  (activeRide.status === 'accepted' || activeRide.status === 'driver_arrived') ? activeRide.pickup_longitude : activeRide.dropoff_longitude
                )}
              >
                <Navigation size={20} color="#fff" />
                <Text style={styles.btnText}>Navigate</Text>
              </TouchableOpacity>
            </View>

            {activeRide.status === 'accepted' ? (
              <View style={styles.progressSection}>
                <TouchableOpacity 
                  style={[styles.primaryBtn, {marginTop: 16}]} 
                  onPress={async () => {
                    const { error } = await supabase
                      .from('rides')
                      .update({ status: 'driver_arrived' })
                      .eq('id', activeRide.id);
                    if (!error) {
                      setActiveRide({ ...activeRide, status: 'driver_arrived' });
                    }
                  }}
                >
                  <Text style={styles.primaryBtnText}>I Have Arrived at Pickup</Text>
                </TouchableOpacity>
              </View>
            ) : activeRide.status === 'driver_arrived' ? (
              <View style={styles.otpSection}>
                <Text style={styles.otpLabel}>Enter 4-digit PIN to start trip</Text>
                <View style={styles.otpRow}>
                  {[0,1,2,3].map((i) => (
                    <TextInput
                      key={i}
                      ref={el => otpInputs.current[i] = el}
                      style={styles.otpInput}
                      keyboardType="number-pad"
                      maxLength={1}
                      value={otp[i]}
                      onChangeText={(t) => handleOtpInput(t, i)}
                    />
                  ))}
                </View>
                <TouchableOpacity 
                  style={[styles.primaryBtn, {marginTop: 16}]} 
                  onPress={verifyOtp}
                  disabled={otp.join('').length !== 4}
                >
                  <Text style={styles.primaryBtnText}>Start Trip</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.progressSection}>
                <View style={styles.fareEst}>
                  <Text style={styles.fareEstLabel}>Est. Fare</Text>
                  <Text style={styles.fareEstVal}>{formatCurrency(activeRide.total_fare)}</Text>
                </View>
                <TouchableOpacity style={[styles.primaryBtn, {backgroundColor: '#ef4444', marginTop: 16}]} onPress={completeTrip}>
                  <Text style={styles.primaryBtnText}>🏁 Complete Trip</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Cancel Ride Button */}
            {(activeRide.status === 'accepted' || activeRide.status === 'driver_arrived') && (
              <TouchableOpacity 
                style={[styles.outlineBtn, {borderColor: '#ef4444', marginTop: 16}]} 
                onPress={handleCancelRide}
              >
                <Text style={[styles.outlineBtnText, {color: '#ef4444'}]}>Cancel Ride</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* EARNINGS DASHBOARD */}
        {!activeRide && (
          <View style={styles.dashboardGrid}>
            <View style={styles.statCard}>
              <IndianRupee size={24} color="#10b981" />
              <Text style={styles.statValue}>{formatCurrency(earnings.todaySum)}</Text>
              <Text style={styles.statLabel}>Today's Earnings</Text>
            </View>
            <View style={styles.statCard}>
              <Car size={24} color="#3b82f6" />
              <Text style={styles.statValue}>{earnings.todayTrips}</Text>
              <Text style={styles.statLabel}>Today's Trips</Text>
            </View>
            <View style={styles.statCard}>
              <Wallet size={24} color="#f59e0b" />
              <Text style={styles.statValue}>{formatCurrency(driver.wallet_balance || 0)}</Text>
              <Text style={styles.statLabel}>Wallet Balance</Text>
            </View>
            <View style={styles.statCard}>
              <Clock size={24} color="#8b5cf6" />
              <Text style={styles.statValue}>{formatCurrency(earnings.weekSum)}</Text>
              <Text style={styles.statLabel}>This Week</Text>
            </View>
          </View>
        )}

        {/* QUICK WHATSAPP PIN */}
        <View style={styles.card}>
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12}}>
            <MessageCircle size={20} color="#10b981" />
            <Text style={styles.cardTitle}>WhatsApp Integration</Text>
          </View>
          <Text style={styles.cardText}>You can also go online and get ride alerts on WhatsApp by sending "Active" to our bot.</Text>
          <TouchableOpacity style={styles.outlineBtn} onPress={shareWhatsAppPin}>
            <Send size={16} color="#10b981" />
            <Text style={styles.outlineBtnText}>Send "Active" on WhatsApp</Text>
          </TouchableOpacity>
        </View>

        {/* SUBSCRIPTION */}
        <View style={styles.card}>
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12}}>
            <CheckCircle size={20} color="#3b82f6" />
            <Text style={styles.cardTitle}>Subscription</Text>
          </View>
          <Text style={styles.cardText}>Pending Commission: {formatCurrency(driver.pending_commission || 0)}</Text>
          <Text style={styles.cardTextLight}>Pay your dues via UPI to continue accepting rides without interruption.</Text>
          <TouchableOpacity 
            style={[styles.outlineBtn, {borderColor: '#3b82f6', marginTop: 12}]} 
            onPress={() => {
              const upiLink = `upi://pay?pa=9486335870@hdfcbank&pn=SuprO&am=${driver.pending_commission || 100}&cu=INR&tn=SuprO+Driver+Subscription`;
              Linking.openURL(upiLink).catch(() => Alert.alert('Error', 'No UPI app found'));
            }}
          >
            <Text style={[styles.outlineBtnText, {color: '#3b82f6'}]}>Pay Dues via UPI</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* INCOMING RIDE MODAL */}
      <Modal visible={!!incomingRide} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🔔 NEW RIDE REQUEST!</Text>
            
            <View style={styles.modalDetails}>
              <View style={styles.locationRow}>
                <MapPin size={16} color="#10b981" />
                <Text style={styles.locationText}>{incomingRide?.pickup_address}</Text>
              </View>
              <View style={[styles.locationRow, {marginTop: 12}]}>
                <MapPin size={16} color="#ef4444" />
                <Text style={styles.locationText}>{incomingRide?.dropoff_address || 'Not specified'}</Text>
              </View>
            </View>

            <View style={styles.fareBox}>
              <Text style={styles.fareLabel}>Est. Earnings</Text>
              <Text style={styles.fareAmount}>{formatCurrency(incomingRide?.total_fare)}</Text>
              <Text style={styles.fareSub}>(Fare {formatCurrency(incomingRide?.total_fare)} - Platform Fee ₹0)</Text>
            </View>

            <View style={styles.timerContainer}>
              <Text style={styles.timerText}>⏱️ {timeLeft}s remaining</Text>
              <View style={styles.progressBg}>
                <Animated.View style={[
                  styles.progressFill, 
                  { width: countdownAnim.interpolate({inputRange: [0, 100], outputRange: ['0%', '100%']}) }
                ]} />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.skipBtn} onPress={handleSkipRide}>
                <XCircle size={20} color="#ef4444" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1e',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#0a0f1e',
    justifyContent: 'center',
    alignItems: 'center'
  },
  regContainer: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#cbd5e1',
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500'
  },
  input: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 14,
    color: '#fff',
    fontSize: 16,
  },
  vehicleTypeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  vehicleTypeBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#1e293b',
  },
  vehicleTypeBtnActive: {
    borderColor: '#10b981',
    backgroundColor: '#10b98120',
  },
  vehicleTypeText: {
    color: '#94a3b8',
    fontWeight: '500',
  },
  vehicleTypeTextActive: {
    color: '#10b981',
  },
  primaryBtn: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
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
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#94a3b8',
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
    backgroundColor: '#10b981',
  },
  toggleOff: {
    backgroundColor: '#ef4444',
  },
  toggleText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  scrollContent: {
    padding: 16,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  statusText: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '500',
  },
  dashboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#111827',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  statValue: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 12,
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#111827',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 16,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  cardText: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  cardTextLight: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 18,
  },
  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10b981',
    marginTop: 16,
    gap: 8,
  },
  outlineBtnText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '600',
  },
  activeRideCard: {
    backgroundColor: '#111827',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3b82f6',
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
    borderRadius: 8,
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
  },
  dotLine: {
    position: 'absolute',
    left: 7,
    top: 20,
    bottom: -20,
    width: 2,
    backgroundColor: '#334155',
    zIndex: -1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  otpSection: {
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: 16,
  },
  otpLabel: {
    color: '#cbd5e1',
    textAlign: 'center',
    marginBottom: 12,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  otpInput: {
    width: 50,
    height: 60,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    color: '#fff',
    fontSize: 24,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  progressSection: {
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: 16,
  },
  fareEst: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    padding: 16,
    borderRadius: 8,
  },
  fareEstLabel: {
    color: '#94a3b8',
    fontSize: 14,
  },
  fareEstVal: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#111827',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
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
    backgroundColor: '#0a0f1e',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 20,
  },
  fareLabel: {
    color: '#94a3b8',
    fontSize: 14,
  },
  fareAmount: {
    color: '#10b981',
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  fareSub: {
    color: '#64748b',
    fontSize: 12,
  },
  timerContainer: {
    marginBottom: 24,
  },
  timerText: {
    color: '#cbd5e1',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
  },
  progressBg: {
    height: 8,
    backgroundColor: '#1e293b',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
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
    borderWidth: 1,
    borderColor: '#ef4444',
    gap: 8,
  },
  skipBtnText: {
    color: '#ef4444',
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
    backgroundColor: '#10b981',
    gap: 8,
  },
  acceptBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  driverDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#3b82f6',
    borderWidth: 2,
    borderColor: '#fff',
  },
});
