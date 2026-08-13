// @ts-nocheck
import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
  Linking,
  Animated,
  Easing,
  SafeAreaView,
  Platform,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import {
  MapPin,
  Navigation,
  Search,
  Clock,
  Shield,
  Phone,
  MessageSquare,
  Share2,
  AlertOctagon,
  Star,
  CheckCircle,
  X,
  ChevronRight,
  User,
  Truck,
  ArrowLeft,
  RefreshCw,
  Crosshair,
} from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { AppContext } from '../context/AppContext';
import {
  COLORS,
  VEHICLE_CATEGORIES,
  RIDE_STATUS,
  API_BASE_URL,
  ADMIN_UPI,
  getDistanceKm,
  calculateFare,
  generateRideOTP,
  openNativeNavigation,
  shareLocationWhatsApp,
  whatsappToPhone,
  callPhone,
  fetchOSRMRoute,
  payViaUPI,
  dispatchRideToDriverWhatsApp,
  mapStyleDark,
  formatPhoneForWhatsApp,
} from '../lib/rideUtils';

const { width, height } = Dimensions.get('window');

export default function RideOScreen({ navigation }) {
  const mapRef = useRef(null);
  const { user } = useContext(AppContext);

  // Core State
  const [rideState, setRideState] = useState('SELECT_PICKUP'); // IDLE, SELECT_DROPOFF, SHOW_DRIVERS, DRIVER_SELECTED, SEARCHING, ACCEPTED, IN_PROGRESS, COMPLETED
  
  // Location & Addresses
  const [location, setLocation] = useState(null);
  const [pickupAddress, setPickupAddress] = useState('Locating...');
  const [pickupQuery, setPickupQuery] = useState('');
  const [dropoffQuery, setDropoffQuery] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState(null);
  const [dropoffAddress, setDropoffAddress] = useState('');
  
  // Map Routing
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [driverRouteCoordinates, setDriverRouteCoordinates] = useState([]);
  const [isMapMoving, setIsMapMoving] = useState(false);
  
  // Data State
  const [nearbyDrivers, setNearbyDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [fareEstimate, setFareEstimate] = useState(null);
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [currentRide, setCurrentRide] = useState(null);
  const [driverInfo, setDriverInfo] = useState(null);
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Pin animation state
  const pinLiftAnim = useRef(new Animated.Value(0)).current;
  const pinShadowOpacity = useRef(new Animated.Value(0.3)).current;
  const pinShadowScale = useRef(new Animated.Value(1)).current;
  const pinPulseAnim = useRef(new Animated.Value(0)).current;
  
  // Rating State
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');

  // 1. Initial Setup: Get Location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location is required to book a ride.');
        return;
      }
      let currentLoc = await Location.getCurrentPositionAsync({});
      setLocation(currentLoc.coords);
      
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: currentLoc.coords.latitude,
          longitude: currentLoc.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
      
      reverseGeocode(currentLoc.coords.latitude, currentLoc.coords.longitude, setPickupAddress);
    })();
  }, []);

  // Pulse animation for SEARCHING state
  useEffect(() => {
    if (rideState === 'SEARCHING') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
        ])
      ).start();

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSearchTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setCountdown(60);
      pulseAnim.setValue(1);
    }
  }, [rideState]);

  // Pin ground pulse animation
  useEffect(() => {
    if (rideState === 'SELECT_PICKUP' || rideState === 'SELECT_DROPOFF') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pinPulseAnim, { toValue: 1, duration: 1500, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(pinPulseAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pinPulseAnim.setValue(0);
    }
  }, [rideState]);

  // Realtime Subscriptions
  useEffect(() => {
    let rideChannel = null;
    let driverChannel = null;

    if (currentRide?.id && (rideState === 'SEARCHING' || rideState === 'ACCEPTED' || rideState === 'IN_PROGRESS')) {
      rideChannel = supabase
        .channel(`ride-${currentRide.id}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'rides', filter: `id=eq.${currentRide.id}` },
          async (payload) => {
            const status = payload.new.status;
            if (status === 'accepted' && rideState === 'SEARCHING') {
              // Fetch latest driver info
              const { data: driverData } = await supabase
                .from('drivers')
                .select('*')
                .eq('id', payload.new.driver_id)
                .single();
              setDriverInfo(driverData);
              setCurrentRide(payload.new);
              setRideState('ACCEPTED');
            } else if (status === 'in_progress') {
              setCurrentRide(payload.new);
              setRideState('IN_PROGRESS');
            } else if (status === 'completed') {
              setCurrentRide(payload.new);
              setRideState('COMPLETED');
            } else if (status === 'cancelled') {
              Alert.alert('Ride Cancelled', 'The driver cancelled the ride.');
              resetToPickup();
            }
          }
        )
        .subscribe();
    }

    if (driverInfo?.id && (rideState === 'ACCEPTED' || rideState === 'IN_PROGRESS')) {
      driverChannel = supabase
        .channel(`driver-loc-${driverInfo.id}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'drivers', filter: `id=eq.${driverInfo.id}` },
          (payload) => {
            if (payload.new.latitude && payload.new.longitude) {
              setDriverInfo(prev => ({
                ...prev,
                latitude: payload.new.latitude,
                longitude: payload.new.longitude
              }));
            }
          }
        )
        .subscribe();
    }

    return () => {
      if (rideChannel) supabase.removeChannel(rideChannel);
      if (driverChannel) supabase.removeChannel(driverChannel);
    };
  }, [currentRide?.id, driverInfo?.id, rideState]);

  // Helpers
  const reverseGeocode = async (lat, lng, setter) => {
    try {
      let geocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (geocode && geocode.length > 0) {
        const g = geocode[0];
        // Build address preferring readable parts, skip Plus Codes (contain '+')
        const parts = [
          g.street && !g.street.includes('+') ? g.street : null,
          g.district || g.subregion || null,
          g.city || g.region || null,
        ].filter(Boolean);
        // Fallback: if street is a Plus Code, use name if it's not a Plus Code either
        if (parts.length === 0 && g.name && !g.name.includes('+')) {
          parts.push(g.name);
        }
        const address = parts.length > 0 ? parts.join(', ') : `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        setter(address);
      }
    } catch (e) {
      setter('Unknown location');
    }
  };

  const resetToPickup = () => {
    setRideState('SELECT_PICKUP');
    setDropoffLocation(null);
    setDropoffAddress('');
    setDropoffQuery('');
    setRouteCoordinates([]);
    setDriverRouteCoordinates([]);
    setSelectedDriver(null);
    setNearbyDrivers([]);
    setCurrentRide(null);
    setDriverInfo(null);
    setLoading(false);
  };

  const animatePinLift = () => {
    Animated.parallel([
      Animated.spring(pinLiftAnim, { toValue: -22, useNativeDriver: true, friction: 8, tension: 100 }),
      Animated.timing(pinShadowOpacity, { toValue: 0.12, duration: 200, useNativeDriver: true }),
      Animated.spring(pinShadowScale, { toValue: 1.4, useNativeDriver: true, friction: 8, tension: 100 }),
    ]).start();
  };

  const animatePinDrop = () => {
    Animated.parallel([
      Animated.spring(pinLiftAnim, { toValue: 0, useNativeDriver: true, friction: 6, tension: 120 }),
      Animated.timing(pinShadowOpacity, { toValue: 0.3, duration: 250, useNativeDriver: true }),
      Animated.spring(pinShadowScale, { toValue: 1, useNativeDriver: true, friction: 6, tension: 120 }),
    ]).start();
  };

  const handleMapRegionChangeComplete = async (region) => {
    setIsMapMoving(false);
    animatePinDrop();
    if (rideState === 'SELECT_PICKUP') {
      setLocation({ latitude: region.latitude, longitude: region.longitude });
      reverseGeocode(region.latitude, region.longitude, setPickupAddress);
    } else if (rideState === 'SELECT_DROPOFF') {
      setDropoffLocation({ latitude: region.latitude, longitude: region.longitude });
      reverseGeocode(region.latitude, region.longitude, setDropoffAddress);
    }
  };

  const useMyLocation = async () => {
    try {
      let currentLoc = await Location.getCurrentPositionAsync({});
      const coords = { latitude: currentLoc.coords.latitude, longitude: currentLoc.coords.longitude };
      if (rideState === 'SELECT_PICKUP') {
        setLocation(coords);
        reverseGeocode(coords.latitude, coords.longitude, setPickupAddress);
      } else if (rideState === 'SELECT_DROPOFF') {
        setDropoffLocation(coords);
        reverseGeocode(coords.latitude, coords.longitude, setDropoffAddress);
      }
      if (mapRef.current) {
        mapRef.current.animateToRegion({ ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 });
      }
    } catch (e) {
      Alert.alert('Location Error', 'Could not get your current location.');
    }
  };

  // Actions
  const handlePickupSubmit = async () => {
    if (!pickupQuery) return;
    setLoading(true);
    try {
      const geocoded = await Location.geocodeAsync(pickupQuery);
      if (geocoded && geocoded.length > 0) {
        const loc = { latitude: geocoded[0].latitude, longitude: geocoded[0].longitude };
        setLocation(loc);
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            ...loc,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      } else {
        Alert.alert('Location not found', 'Try another address.');
      }
    } catch (e) {
      Alert.alert('Error', 'Could not search location.');
    } finally {
      setLoading(false);
    }
  };

  const handleDropoffSubmit = async () => {
    if (!dropoffQuery) return;
    setLoading(true);
    try {
      const geocoded = await Location.geocodeAsync(dropoffQuery);
      if (geocoded && geocoded.length > 0) {
        const dropLoc = { latitude: geocoded[0].latitude, longitude: geocoded[0].longitude };
        setDropoffLocation(dropLoc);
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            ...dropLoc,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      } else {
        Alert.alert('Location not found', 'Try another address.');
      }
    } catch (e) {
      Alert.alert('Error', 'Could not search location.');
    } finally {
      setLoading(false);
    }
  };

  const confirmPickup = () => {
    setRideState('SELECT_DROPOFF');
    if (!dropoffLocation && location) {
      setDropoffLocation(location);
    }
  };

  const confirmDropoff = async () => {
    if (!location || !dropoffLocation) return;
    setLoading(true);
    try {
      const route = await fetchOSRMRoute(location.latitude, location.longitude, dropoffLocation.latitude, dropoffLocation.longitude);
      setRouteCoordinates(route);
      
      const distance = getDistanceKm(location.latitude, location.longitude, dropoffLocation.latitude, dropoffLocation.longitude);
      setFareEstimate({ distanceKm: distance.toFixed(1) });
      
      if (mapRef.current) {
        mapRef.current.fitToCoordinates([location, dropoffLocation], {
          edgePadding: { top: 100, right: 50, bottom: 400, left: 50 },
          animated: true
        });
      }
      setRideState('CONFIRM_TRIP');
    } catch (e) {
      Alert.alert('Route Error', 'Could not fetch route.');
    } finally {
      setLoading(false);
    }
  };

  const findNearbyDrivers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_nearby_drivers', {
        pickup_lat: location.latitude,
        pickup_lon: location.longitude,
        radius_km: 100000
      });
      
      if (!error && data) {
        // Map distance and fares for each driver
        const distanceKmSafe = fareEstimate?.distanceKm ? parseFloat(fareEstimate.distanceKm) : 5.0;
        const enrichedDrivers = data.map(d => {
          let lat = parseFloat(d.latitude);
          let lon = parseFloat(d.longitude);

          // Fallback if RPC doesn't return lat/lon (e.g. virtual drivers)
          if (isNaN(lat) || isNaN(lon)) {
            const jitterLat = (Math.random() - 0.5) * 0.015; // ~1.5km
            const jitterLon = (Math.random() - 0.5) * 0.015;
            lat = location.latitude + jitterLat;
            lon = location.longitude + jitterLon;
          }

          const distFromPickup = getDistanceKm(lat, lon, location.latitude, location.longitude);
          const fareObj = calculateFare(distanceKmSafe, d.vehicle_type?.toLowerCase() || 'bikeo');
          return {
            ...d,
            latitude: lat,
            longitude: lon,
            distanceFromPickup: distFromPickup,
            etaToPickup: Math.round(distFromPickup * 3), // rough 3 mins per km
            fareObj,
          };
        }).sort((a, b) => a.distanceFromPickup - b.distanceFromPickup);
        
        setNearbyDrivers(enrichedDrivers);
        setRideState('SHOW_DRIVERS');
        
        // Zoom to show pickup and nearby drivers
        if (mapRef.current && enrichedDrivers.length > 0) {
          const coords = [location, ...enrichedDrivers.map(d => ({ latitude: d.latitude, longitude: d.longitude }))];
          mapRef.current.fitToCoordinates(coords, {
            edgePadding: { top: 100, right: 50, bottom: 400, left: 50 },
            animated: true
          });
        }
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const selectDriver = async (driver) => {
    setSelectedDriver(driver);
    setFareEstimate(driver.fareObj);
    
    // Draw route from driver to pickup, and pickup to dropoff
    const dRoute = await fetchOSRMRoute(driver.latitude, driver.longitude, location.latitude, location.longitude);
    setDriverRouteCoordinates(dRoute);
    
    if (mapRef.current) {
      mapRef.current.fitToCoordinates([
        { latitude: driver.latitude, longitude: driver.longitude },
        location,
        dropoffLocation
      ], {
        edgePadding: { top: 100, right: 50, bottom: 400, left: 50 },
        animated: true
      });
    }
    setRideState('DRIVER_SELECTED');
  };

  const bookRide = async () => {
    if (!selectedDriver) return;
    setLoading(true);
    
    const otp = generateRideOTP();
    
    try {
      const { data: rideData, error } = await supabase.from('rides').insert({
        passenger_phone: user?.phone || 'unknown',
        passenger_name: user?.name || 'Rider',
        pickup_location: {
          lat: location.latitude,
          lng: location.longitude,
          address: pickupAddress
        },
        drop_location: {
          lat: dropoffLocation.latitude,
          lng: dropoffLocation.longitude,
          address: dropoffAddress
        },
        driver_id: selectedDriver.id,
        vehicle_category: selectedDriver.vehicle_type,
        fare: fareEstimate.total,
        distance_km: parseFloat(fareEstimate.distanceKm || '0'),
        status: 'pending',
        payment_mode: paymentMode,
        otp: otp
      }).select().single();

      if (error) throw error;
      
      setCurrentRide(rideData);
      
      // Send WhatsApp message to driver
      await dispatchRideToDriverWhatsApp({
        rideId: rideData.id,
        driverPhone: selectedDriver.phone,
        pickupAddress,
        dropoffAddress,
        distanceKm: fareEstimate.distanceKm,
        estimatedFare: fareEstimate.total,
        driverName: selectedDriver.name,
        driverRating: selectedDriver.rating,
        vehicleInfo: `${selectedDriver.vehicle_type} - ${selectedDriver.registration_number}`
      });
      
      setRideState('SEARCHING');
    } catch (e) {
      Alert.alert('Booking Failed', 'Could not request ride. ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchTimeout = async () => {
    // If not accepted in 60s
    if (currentRide) {
      await supabase.from('rides').update({ status: 'cancelled' }).eq('id', currentRide.id);
    }
    Alert.alert('No response', 'The driver did not accept in time.');
    setRideState('SHOW_DRIVERS');
  };

  const cancelRide = async () => {
    if (currentRide) {
      await supabase.from('rides').update({ status: 'cancelled' }).eq('id', currentRide.id);
    }
    setRideState('SHOW_DRIVERS');
    setCurrentRide(null);
    setDriverInfo(null);
    setSelectedDriver(null);
  };

  const submitRating = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/rides/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ride_id: currentRide?.id, rating, review })
      });
    } catch (e) {}
    resetToPickup();
  };

  // Get greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={true}
        initialRegion={{
          latitude: location?.latitude || 10.79,
          longitude: location?.longitude || 79.13,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onRegionChange={() => {
          if (rideState === 'SELECT_PICKUP' || rideState === 'SELECT_DROPOFF') {
            if (!isMapMoving) {
              setIsMapMoving(true);
              animatePinLift();
            }
          }
        }}
        onRegionChangeComplete={handleMapRegionChangeComplete}
      >
        {/* Pickup Marker */}
        {(rideState !== 'SELECT_PICKUP' && location) && (
          <Marker coordinate={location} anchor={{ x: 0.5, y: 1 }}>
            <View style={styles.dotMarkerContainer}>
              <View style={[styles.dotMarker, { backgroundColor: COLORS.green }]} />
            </View>
          </Marker>
        )}

        {/* Dropoff Marker */}
        {(rideState !== 'SELECT_DROPOFF' && rideState !== 'SELECT_PICKUP' && dropoffLocation) && (
          <Marker coordinate={dropoffLocation} anchor={{ x: 0.5, y: 1 }}>
            <View style={styles.dotMarkerContainer}>
              <View style={[styles.dotMarker, { backgroundColor: COLORS.red }]} />
            </View>
          </Marker>
        )}

        {/* Route Polyline (Pickup -> Dropoff) */}
        {routeCoordinates.length > 0 && (
          <Polyline coordinates={routeCoordinates} strokeColor={COLORS.blue} strokeWidth={4} />
        )}

        {/* Driver Route Polyline (Driver -> Pickup) */}
        {driverRouteCoordinates.length > 0 && (
          <Polyline coordinates={driverRouteCoordinates} strokeColor={COLORS.textMuted} strokeWidth={3} lineDashPattern={[5, 5]} />
        )}

        {/* All Nearby Drivers (SHOW_DRIVERS) */}
        {rideState === 'SHOW_DRIVERS' && nearbyDrivers.map(d => (
          <Marker key={d.id} coordinate={{ latitude: d.latitude, longitude: d.longitude }}>
            <View style={styles.driverMapIcon}>
              <Text style={{ fontSize: 18 }}>{d.vehicle_type?.toLowerCase() === 'bike' ? '🏍️' : '🚗'}</Text>
            </View>
          </Marker>
        ))}

        {/* Selected Driver Marker (DRIVER_SELECTED, SEARCHING) */}
        {(rideState === 'DRIVER_SELECTED' || rideState === 'SEARCHING') && selectedDriver && (
          <Marker coordinate={{ latitude: selectedDriver.latitude, longitude: selectedDriver.longitude }}>
            <View style={[styles.driverMapIcon, { borderColor: COLORS.green, borderWidth: 2 }]}>
              <Text style={{ fontSize: 18 }}>{selectedDriver.vehicle_type?.toLowerCase() === 'bike' ? '🏍️' : '🚗'}</Text>
            </View>
          </Marker>
        )}

        {/* Live Driver Tracking (ACCEPTED, IN_PROGRESS) */}
        {(rideState === 'ACCEPTED' || rideState === 'IN_PROGRESS') && driverInfo?.latitude && (
          <Marker coordinate={{ latitude: driverInfo.latitude, longitude: driverInfo.longitude }}>
            <View style={[styles.driverMapIcon, { backgroundColor: COLORS.green }]}>
              <Text style={{ fontSize: 18 }}>{driverInfo.vehicle_type?.toLowerCase() === 'bike' ? '🏍️' : '🚗'}</Text>
            </View>
          </Marker>
        )}
      </MapView>

      {/* Animated Center Pin for PICKUP & DROPOFF */}
      {(rideState === 'SELECT_PICKUP' || rideState === 'SELECT_DROPOFF') && (
        <View style={styles.centerPinContainer} pointerEvents="none">
          {/* Pulse ring on ground */}
          <Animated.View style={[
            styles.pinPulseRing,
            {
              backgroundColor: rideState === 'SELECT_PICKUP' ? COLORS.green : COLORS.red,
              opacity: pinPulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0] }),
              transform: [{ scale: pinPulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.5] }) }],
            }
          ]} />
          {/* Ground shadow ellipse */}
          <Animated.View style={[
            styles.pinGroundShadow,
            {
              opacity: pinShadowOpacity,
              transform: [{ scaleX: pinShadowScale }, { scaleY: Animated.multiply(pinShadowScale, 0.5) }],
            }
          ]} />
          {/* Pin body — lifts up */}
          <Animated.View style={[
            styles.pinBody,
            { transform: [{ translateY: pinLiftAnim }] }
          ]}>
            <View style={[
              styles.pinHead,
              { backgroundColor: rideState === 'SELECT_PICKUP' ? COLORS.green : COLORS.red }
            ]}>
              <View style={styles.pinDot} />
            </View>
            <View style={[
              styles.pinTail,
              { borderTopColor: rideState === 'SELECT_PICKUP' ? COLORS.green : COLORS.red }
            ]} />
          </Animated.View>
        </View>
      )}

      {/* Floating Live Address Card — shown during pin selection */}
      {(rideState === 'SELECT_PICKUP' || rideState === 'SELECT_DROPOFF') && (
        <View style={styles.floatingAddressCard} pointerEvents="none">
          <View style={[
            styles.floatingAddressDot,
            { backgroundColor: rideState === 'SELECT_PICKUP' ? COLORS.green : COLORS.red }
          ]} />
          <Text style={styles.floatingAddressText} numberOfLines={1}>
            {isMapMoving
              ? 'Searching...'
              : rideState === 'SELECT_PICKUP'
                ? pickupAddress
                : (dropoffAddress || 'Locating...')
            }
          </Text>
        </View>
      )}

      {/* GPS Location Button — shown during pin selection */}
      {(rideState === 'SELECT_PICKUP' || rideState === 'SELECT_DROPOFF') && (
        <TouchableOpacity style={styles.gpsButton} onPress={useMyLocation}>
          <Crosshair size={22} color={COLORS.text} />
        </TouchableOpacity>
      )}

      {/* Top Address Overlay — only show after IDLE (when route is set) */}
      {['SELECT_DROPOFF', 'SHOW_DRIVERS'].includes(rideState) && (
        <View style={styles.topOverlay}>
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => resetToPickup()}
          >
            <ArrowLeft color={COLORS.text} size={24} />
          </TouchableOpacity>
          <View style={styles.topAddressCard}>
            <View style={styles.addressRow}>
              <View style={[styles.addressDot, { backgroundColor: COLORS.green }]} />
              <Text style={styles.addressText} numberOfLines={1}>{pickupAddress}</Text>
            </View>
          </View>
        </View>
      )}

      {/* BOTTOM SHEETS */}
      
      {/* 1. SELECT_PICKUP SHEET */}
      {rideState === 'SELECT_PICKUP' && (
        <View style={styles.bottomSheet}>
          <View style={styles.idleTopRow}>
            <TouchableOpacity style={styles.backBtnSmall} onPress={() => navigation?.goBack()}>
              <ArrowLeft color={COLORS.text} size={22} />
            </TouchableOpacity>
            <Text style={styles.greetingText}>{greeting}, {user?.name || 'Rider'}!</Text>
          </View>
          <View style={styles.searchBox}>
            <Search color={COLORS.textMuted} size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search pickup location..."
              placeholderTextColor={COLORS.textMuted}
              value={pickupQuery}
              onChangeText={setPickupQuery}
              onSubmitEditing={handlePickupSubmit}
              returnKeyType="search"
            />
            {loading && <ActivityIndicator color={COLORS.green} size="small" />}
          </View>
          <TouchableOpacity style={styles.useLocationRow} onPress={useMyLocation}>
            <View style={styles.useLocationIcon}>
              <Crosshair size={18} color={COLORS.green} />
            </View>
            <Text style={styles.useLocationText}>Use my current location</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryBtn} onPress={confirmPickup}>
            <MapPin size={20} color="#000" />
            <Text style={[styles.primaryBtnText, { marginLeft: 8 }]}>Confirm Pickup</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 2. SELECT_DROPOFF SHEET */}
      {rideState === 'SELECT_DROPOFF' && (
        <View style={styles.bottomSheet}>
          <Text style={styles.sheetTitle}>Where to?</Text>
          <View style={styles.searchBox}>
            <Search color={COLORS.textMuted} size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search destination..."
              placeholderTextColor={COLORS.textMuted}
              value={dropoffQuery}
              onChangeText={setDropoffQuery}
              onSubmitEditing={handleDropoffSubmit}
              returnKeyType="search"
            />
            {loading && <ActivityIndicator color={COLORS.green} size="small" />}
          </View>
          <TouchableOpacity style={styles.useLocationRow} onPress={useMyLocation}>
            <View style={[styles.useLocationIcon, { backgroundColor: 'rgba(239,68,68,0.12)' }]}>
              <Crosshair size={18} color={COLORS.red} />
            </View>
            <Text style={styles.useLocationText}>Use my current location</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: COLORS.red }]} onPress={confirmDropoff}>
            <Navigation size={20} color="#fff" />
            <Text style={[styles.primaryBtnText, { marginLeft: 8, color: '#fff' }]}>Confirm Destination</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 2.5 CONFIRM TRIP SHEET */}
      {rideState === 'CONFIRM_TRIP' && (
        <View style={styles.bottomSheet}>
          <Text style={styles.sheetTitle}>Trip Details</Text>
          <View style={styles.tripInfoRow}>
            <View style={styles.tripInfoItem}>
              <Navigation color={COLORS.blue} size={20} />
              <Text style={styles.tripInfoText}>{fareEstimate?.distanceKm} km</Text>
            </View>
            <View style={styles.tripInfoItem}>
              <Clock color={COLORS.yellow} size={20} />
              <Text style={styles.tripInfoText}>{Math.round(parseFloat(fareEstimate?.distanceKm || 0) * 3)} mins</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.primaryBtn} onPress={findNearbyDrivers}>
            <Text style={styles.primaryBtnText}>Find Nearby Drivers</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 3. SHOW DRIVERS SHEET */}
      {rideState === 'SHOW_DRIVERS' && (
        <View style={styles.bottomSheetLarge}>
          <View style={styles.sheetHeaderRow}>
            <Text style={styles.sheetTitle}>Nearby Drivers</Text>
            <TouchableOpacity onPress={findNearbyDrivers}>
              <RefreshCw color={COLORS.green} size={20} />
            </TouchableOpacity>
          </View>
          
          {nearbyDrivers.length === 0 ? (
            <View style={styles.noDrivers}>
              <Text style={styles.noDriversText}>No drivers found nearby.</Text>
            </View>
          ) : (
            <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
              {nearbyDrivers.map(d => (
                <TouchableOpacity key={d.id} style={styles.driverCard} onPress={() => selectDriver(d)}>
                  <View style={styles.driverCardLeft}>
                    <Text style={styles.driverEmoji}>{d.vehicle_type?.toLowerCase() === 'bike' ? '🏍️' : '🚗'}</Text>
                    <View>
                      <Text style={styles.driverCardName}>{d.name}</Text>
                      <View style={styles.driverCardMeta}>
                        <Star size={12} color={COLORS.yellow} fill={COLORS.yellow} />
                        <Text style={styles.driverCardMetaText}>{d.rating || '4.5'} • {d.etaToPickup} min away</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.driverCardRight}>
                    <Text style={styles.driverCardFare}>₹{d.fareObj?.total}</Text>
                    <View style={styles.selectBtnMini}>
                      <Text style={styles.selectBtnMiniText}>Select</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}

      {/* 4. DRIVER SELECTED SHEET */}
      {rideState === 'DRIVER_SELECTED' && selectedDriver && (
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHeaderRow}>
            <TouchableOpacity onPress={() => setRideState('SHOW_DRIVERS')}>
              <ArrowLeft color={COLORS.text} size={24} />
            </TouchableOpacity>
            <Text style={styles.sheetTitle}>Confirm Booking</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <View style={styles.driverProfileBox}>
            <View style={styles.driverProfileLeft}>
              <User size={24} color={COLORS.textMuted} />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.driverProfileName}>{selectedDriver.name}</Text>
                <Text style={styles.driverProfileReg}>{selectedDriver.registration_number}</Text>
              </View>
            </View>
            <View style={styles.ratingPill}>
              <Star size={14} color="#000" fill="#000" />
              <Text style={styles.ratingPillText}>{selectedDriver.rating || '4.5'}</Text>
            </View>
          </View>
          
          <View style={styles.fareBreakdown}>
            <View style={styles.fareRow}><Text style={styles.fareLabel}>Base Fare</Text><Text style={styles.fareValue}>₹{fareEstimate?.base}</Text></View>
            <View style={styles.fareRow}><Text style={styles.fareLabel}>Distance ({fareEstimate?.distanceKm}km)</Text><Text style={styles.fareValue}>₹{fareEstimate?.distance}</Text></View>
            {fareEstimate?.surgeMultiplier > 1 && (
              <View style={styles.fareRow}><Text style={[styles.fareLabel, {color: COLORS.yellow}]}>{fareEstimate.surgeLabel}</Text><Text style={[styles.fareValue, {color: COLORS.yellow}]}>Applied</Text></View>
            )}
            <View style={styles.fareDivider} />
            <View style={styles.fareRow}><Text style={styles.fareTotalLabel}>Total Fare</Text><Text style={styles.fareTotalValue}>₹{fareEstimate?.total}</Text></View>
          </View>

          <View style={styles.paymentToggle}>
            <TouchableOpacity style={[styles.payModeBtn, paymentMode === 'CASH' && styles.payModeBtnActive]} onPress={() => setPaymentMode('CASH')}>
              <Text style={[styles.payModeText, paymentMode === 'CASH' && styles.payModeTextActive]}>Cash</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.payModeBtn, paymentMode === 'UPI' && styles.payModeBtnActive]} onPress={() => setPaymentMode('UPI')}>
              <Text style={[styles.payModeText, paymentMode === 'UPI' && styles.payModeTextActive]}>UPI</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={bookRide} disabled={loading}>
            {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.primaryBtnText}>Book & Send Request ₹{fareEstimate?.total}</Text>}
          </TouchableOpacity>
        </View>
      )}

      {/* 5. SEARCHING SHEET */}
      {rideState === 'SEARCHING' && (
        <View style={styles.bottomSheet}>
          <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }] }]}>
            <ActivityIndicator size="large" color={COLORS.green} />
          </Animated.View>
          <Text style={styles.searchingTitle}>Waiting for {selectedDriver?.name}...</Text>
          <Text style={styles.countdownText}>{countdown}s remaining</Text>
          <TouchableOpacity style={styles.cancelBtnOutline} onPress={cancelRide}>
            <Text style={styles.cancelBtnText}>Cancel Request</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 6. ACCEPTED SHEET */}
      {rideState === 'ACCEPTED' && (
        <View style={styles.bottomSheet}>
          <View style={styles.statusBanner}>
            <Text style={styles.statusBannerText}>Driver is on the way</Text>
          </View>
          
          <View style={styles.driverProfileBox}>
            <View style={styles.driverProfileLeft}>
              <User size={24} color={COLORS.textMuted} />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.driverProfileName}>{driverInfo?.name || selectedDriver?.name}</Text>
                <Text style={styles.driverProfileReg}>{driverInfo?.registration_number || selectedDriver?.registration_number}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.callCircle} onPress={() => callPhone(driverInfo?.phone || selectedDriver?.phone)}>
              <Phone size={20} color="#000" fill="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.otpContainer}>
            <Text style={styles.otpLabel}>OTP for this ride</Text>
            <Text style={styles.otpValue}>{currentRide?.otp}</Text>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => whatsappToPhone(driverInfo?.phone || selectedDriver?.phone)}>
              <MessageSquare size={20} color={COLORS.text} />
              <Text style={styles.actionBtnText}>WhatsApp</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => shareLocationWhatsApp(location.latitude, location.longitude, 'My pickup location for RideO')}>
              <Share2 size={20} color={COLORS.text} />
              <Text style={styles.actionBtnText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { borderColor: COLORS.red }]} onPress={() => { Linking.openURL('tel:112'); shareLocationWhatsApp(location.latitude, location.longitude, 'SOS EMERGENCY'); }}>
              <Shield size={20} color={COLORS.red} />
              <Text style={[styles.actionBtnText, { color: COLORS.red }]}>SOS</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 7. IN PROGRESS SHEET */}
      {rideState === 'IN_PROGRESS' && (
        <View style={styles.bottomSheet}>
          <View style={[styles.statusBanner, { backgroundColor: COLORS.blue }]}>
            <Text style={styles.statusBannerText}>Trip in Progress</Text>
          </View>
          <Text style={styles.inProgressAddress}>To: {dropoffAddress}</Text>
          
          <TouchableOpacity style={styles.primaryBtn} onPress={() => openNativeNavigation(dropoffLocation.latitude, dropoffLocation.longitude)}>
            <Navigation color="#000" size={20} />
            <Text style={[styles.primaryBtnText, { marginLeft: 8 }]}>Navigate</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.cancelBtnOutline, { borderColor: COLORS.red, marginTop: 12 }]} onPress={() => { Linking.openURL('tel:112'); shareLocationWhatsApp(location.latitude, location.longitude, 'SOS EMERGENCY'); }}>
            <Shield size={20} color={COLORS.red} />
            <Text style={[styles.cancelBtnText, { color: COLORS.red, marginLeft: 8 }]}>Emergency SOS</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 8. COMPLETED SHEET */}
      {rideState === 'COMPLETED' && (
        <View style={styles.bottomSheet}>
          <CheckCircle size={48} color={COLORS.green} style={{ alignSelf: 'center', marginBottom: 16 }} />
          <Text style={styles.sheetTitle}>Trip Completed</Text>
          <Text style={styles.fareTotalValueLarge}>₹{currentRide?.fare}</Text>
          
          <View style={styles.ratingBox}>
            <Text style={styles.ratingLabel}>Rate your driver</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map(s => (
                <TouchableOpacity key={s} onPress={() => setRating(s)}>
                  <Star size={32} color={s <= rating ? COLORS.yellow : COLORS.border} fill={s <= rating ? COLORS.yellow : 'transparent'} style={{ marginHorizontal: 4 }} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TextInput
            style={styles.reviewInput}
            placeholder="Leave a review (optional)"
            placeholderTextColor={COLORS.textMuted}
            value={review}
            onChangeText={setReview}
          />

          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.primaryBtn, { flex: 1, marginRight: 8, backgroundColor: COLORS.cardLight }]} onPress={submitRating}>
              <Text style={[styles.primaryBtnText, { color: COLORS.text }]}>Done</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.primaryBtn, { flex: 1, marginLeft: 8 }]} onPress={() => payViaUPI(currentRide?.fare, driverInfo?.upi_id || ADMIN_UPI, driverInfo?.name || 'Driver', currentRide?.id)}>
              <Text style={styles.primaryBtnText}>Pay via UPI</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: width,
    height: height,
  },
  centerPinContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -30,
    marginTop: -70,
    width: 60,
    height: 80,
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 2,
  },
  pinBody: {
    alignItems: 'center',
    position: 'absolute',
    bottom: 8,
  },
  pinHead: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
  },
  pinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#fff',
  },
  pinTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },
  pinGroundShadow: {
    position: 'absolute',
    bottom: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#000',
  },
  pinPulseRing: {
    position: 'absolute',
    bottom: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  floatingAddressCard: {
    position: 'absolute',
    top: '38%',
    left: 24,
    right: 24,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    zIndex: 3,
  },
  floatingAddressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  floatingAddressText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  gpsButton: {
    position: 'absolute',
    right: 16,
    bottom: 260,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
    zIndex: 5,
  },
  useLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 8,
    marginBottom: 4,
  },
  useLocationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  useLocationText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '500',
  },
  dotMarkerContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  driverMapIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  topOverlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  topAddressCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  addressText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  idleTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backBtnSmall: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.cardLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  pickupPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardLight,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pickupPillText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 48,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 10,
  },
  bottomSheetLarge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: height * 0.7,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 10,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  greetingText: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sheetTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
    marginLeft: 12,
  },
  tripInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  tripInfoItem: {
    alignItems: 'center',
  },
  tripInfoText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  primaryBtn: {
    backgroundColor: COLORS.green,
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  primaryBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noDrivers: {
    padding: 32,
    alignItems: 'center',
  },
  noDriversText: {
    color: COLORS.textMuted,
    fontSize: 16,
  },
  driverCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.cardLight,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  driverCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  driverCardName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  driverCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  driverCardMetaText: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginLeft: 4,
  },
  driverCardRight: {
    alignItems: 'flex-end',
  },
  driverCardFare: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  selectBtnMini: {
    backgroundColor: COLORS.green,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  selectBtnMiniText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  driverProfileBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.cardLight,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  driverProfileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverProfileName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  driverProfileReg: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginTop: 2,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.yellow,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingPillText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  fareBreakdown: {
    marginBottom: 20,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  fareLabel: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  fareValue: {
    color: COLORS.text,
    fontSize: 14,
  },
  fareDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  fareTotalLabel: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  fareTotalValue: {
    color: COLORS.green,
    fontSize: 18,
    fontWeight: 'bold',
  },
  paymentToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardLight,
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
  },
  payModeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  payModeBtnActive: {
    backgroundColor: COLORS.card,
  },
  payModeText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  payModeTextActive: {
    color: COLORS.text,
  },
  pulseCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.green,
  },
  searchingTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  countdownText: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  cancelBtnOutline: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  cancelBtnText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBanner: {
    backgroundColor: COLORS.green,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBannerText: {
    color: '#000',
    fontWeight: 'bold',
  },
  callCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.cardLight,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  otpLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  otpValue: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 8,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  actionBtnText: {
    color: COLORS.text,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  inProgressAddress: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  fareTotalValueLarge: {
    color: COLORS.text,
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
  },
  ratingBox: {
    alignItems: 'center',
    marginBottom: 20,
  },
  ratingLabel: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginBottom: 8,
  },
  starsRow: {
    flexDirection: 'row',
  },
  reviewInput: {
    backgroundColor: COLORS.cardLight,
    color: COLORS.text,
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    marginBottom: 20,
  },
});
