// @ts-nocheck
// src/lib/rideUtils.ts — Shared ride utilities for RideO & DriveO
import { Platform, Linking, Alert } from 'react-native';

// ─── RIDE STATUS CONSTANTS (aligned with web app & Supabase) ───
export const RIDE_STATUS = {
  PENDING: 'pending',
  REQUESTED: 'requested',
  ACCEPTED: 'accepted',
  DRIVER_ARRIVED: 'driver_arrived',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// ─── APP CONFIGURATION ───
export const API_BASE_URL = 'https://mysupro.duckdns.org';
export const ADMIN_UPI = '6381029380@hdfcbank';
export const ADMIN_PHONE = '916381029380';
export const ADMIN_PHONES = ['6381029380'];

// ─── THEME COLORS ───
export const COLORS = {
  bg: '#0a0f1e',
  card: '#111827',
  cardLight: '#1e293b',
  cardHighlight: '#1a2744',
  green: '#10b981',
  greenDark: '#059669',
  red: '#ef4444',
  yellow: '#f59e0b',
  blue: '#3b82f6',
  purple: '#8b5cf6',
  text: '#ffffff',
  textMuted: '#94a3b8',
  textSecondary: '#cbd5e1',
  border: '#334155',
  overlay: 'rgba(0,0,0,0.7)',
  accent: '#10b981',
};

// ─── VEHICLE CATEGORIES (with pricing from web app) ───
export const VEHICLE_CATEGORIES = [
  // ─── RideO Passenger Hailing ───
  { id: 'bikeo', name: 'BikeO', platform: 'rideo', icon: '🏍️', emoji: '🏍️', base: 20, perKm: 8, perMin: 1, seats: 1, description: 'Quick bike taxi' },
  { id: 'autoo', name: 'AutoO', platform: 'rideo', icon: '🛺', emoji: '🛺', base: 40, perKm: 15, perMin: 1.5, seats: 3, description: 'Auto rickshaw' },
  { id: 'mini', name: 'Mini (Hatchback)', platform: 'rideo', icon: '🚗', emoji: '🚗', base: 80, perKm: 25, perMin: 2, seats: 4, description: 'Compact car' },
  { id: 'sedan', name: 'Prime Sedan', platform: 'rideo', icon: '🚙', emoji: '🚙', base: 120, perKm: 30, perMin: 2.5, seats: 4, description: 'Comfortable sedan' },
  { id: 'suv', name: 'Prime SUV / XL', platform: 'both', icon: '🚐', emoji: '🚐', base: 150, perKm: 35, perMin: 3, seats: 6, description: 'Spacious SUV & Tour Taxi' },

  // ─── RentO Agri Machinery & Cargo Rentals ───
  { id: 'tractor', name: 'Agri Tractor', platform: 'rento', icon: '🚜', emoji: '🚜', base: 450, perKm: 30, perMin: 6, seats: 1, description: 'Plowing & Rotavator' },
  { id: 'power_tiller', name: 'Power Tiller', platform: 'rento', icon: '⚙️', emoji: '⚙️', base: 350, perKm: 25, perMin: 5, seats: 1, description: 'Small Fields Tiller & Weeder' },
  { id: 'drone', name: 'Agri Spraying Drone', platform: 'rento', icon: '🛸', emoji: '🛸', base: 500, perKm: 35, perMin: 8, seats: 1, description: 'Precision 16L Spraying Drone' },
  { id: 'coconut_machine', name: 'Coconut Climber', platform: 'rento', icon: '🌴', emoji: '🌴', base: 150, perKm: 20, perMin: 3, seats: 1, description: 'Mechanical Harvesting Machine' },
  { id: 'harvester', name: 'Paddy Harvester', platform: 'rento', icon: '🌾', emoji: '🌾', base: 1800, perKm: 50, perMin: 15, seats: 1, description: 'Paddy & Crop Harvester' },
  { id: 'tata_ace', name: 'Tata Ace (Chota Hathi)', platform: 'rento', icon: '🚚', emoji: '🚚', base: 250, perKm: 18, perMin: 4, seats: 2, description: 'Mini Truck / Cargo Mandi' },
  { id: 'bolero', name: 'Bolero Maxi Truck', platform: 'rento', icon: '🛻', emoji: '🛻', base: 400, perKm: 22, perMin: 5, seats: 2, description: 'Medium Mandi Pickup' },
  { id: 'lorry', name: 'Heavy Lorry / Eicher', platform: 'rento', icon: '🚛', emoji: '🚛', base: 900, perKm: 38, perMin: 8, seats: 3, description: 'Heavy Goods Lorry' },
  { id: 'bus', name: 'Tour Tempo / Bus', platform: 'both', icon: '🚌', emoji: '🚌', base: 1200, perKm: 42, perMin: 10, seats: 20, description: 'Group Tour & Rentals' },
];

// ─── HAVERSINE DISTANCE (km) ───
export function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
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
}

// ─── LOCAL FARE CALCULATION WITH SURGE PRICING ───
export function calculateFare(distanceKm, categoryId) {
  const cat = VEHICLE_CATEGORIES.find((c) => c.id === categoryId) || VEHICLE_CATEGORIES[1];
  const estimatedMins = Math.round(distanceKm * 2.5);

  let baseFare = cat.base;
  let distanceFare = distanceKm * cat.perKm;
  let timeFare = estimatedMins * cat.perMin;
  let subtotal = baseFare + distanceFare + timeFare;

  // Surge pricing (matching web app logic)
  let surgeMultiplier = 1.0;
  let surgeLabel = '';
  const hour = new Date().getHours();
  if (hour >= 8 && hour <= 10) {
    surgeMultiplier = 1.3;
    surgeLabel = 'Morning Rush 1.3×';
  } else if (hour >= 17 && hour <= 20) {
    surgeMultiplier = 1.5;
    surgeLabel = 'Evening Rush 1.5×';
  } else if (hour >= 22 || hour < 6) {
    surgeMultiplier = 1.2;
    surgeLabel = 'Night 1.2×';
  }

  subtotal *= surgeMultiplier;
  const platformFee = Math.max(Math.round(subtotal * 0.05), 5);
  const total = Math.round(subtotal + platformFee);

  return {
    category: cat,
    base: Math.round(baseFare),
    distance: Math.round(distanceFare),
    time: Math.round(timeFare),
    surgeMultiplier,
    surgeLabel,
    platformFee,
    total,
    distanceKm: parseFloat(distanceKm.toFixed(1)),
    estimatedMins,
    etaMinutes: Math.round(distanceKm * 3),
  };
}

// ─── GENERATE 4-DIGIT OTP (matching web app dispatch.ts) ───
export function generateRideOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// ─── OPEN NATIVE GOOGLE MAPS FOR NAVIGATION (FREE — deep link) ───
export function openNativeNavigation(lat, lng, label = 'Destination') {
  if (!lat || !lng) {
    Alert.alert('Navigation Error', 'Location coordinates not available');
    return;
  }
  const url =
    Platform.OS === 'ios'
      ? `http://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`
      : `google.navigation:q=${lat},${lng}`;

  Linking.canOpenURL(url)
    .then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        // Fallback to Google Maps web
        Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
      }
    })
    .catch(() => {
      Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
    });
}

// ─── SHARE LOCATION VIA WHATSAPP (FREE — just URL text) ───
export function shareLocationWhatsApp(lat, lng, message = '') {
  const mapLink = `https://maps.google.com/?q=${lat},${lng}`;
  const fullMessage = message ? `${message}\n📍 ${mapLink}` : `📍 My Location: ${mapLink}`;
  Linking.openURL(`whatsapp://send?text=${encodeURIComponent(fullMessage)}`).catch(() => {
    Alert.alert('WhatsApp not available', 'Please install WhatsApp to share location.');
  });
}

// 💬 WHATSAPP TO SPECIFIC PHONE (FREE 👉 deep link) 💬
export function whatsappToPhone(phone, message = '') {
  let cleanPhone = phone?.replace(/\D/g, '') || '';
  // If exactly 10 digits, it's an Indian mobile without country code.
  const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const url = message
    ? `whatsapp://send?phone=${waPhone}&text=${encodeURIComponent(message)}`
    : `whatsapp://send?phone=${waPhone}`;

  Linking.canOpenURL(url).then(supported => {
    if (supported) {
      Linking.openURL(url);
    } else {
      Alert.alert('WhatsApp Not Installed', 'Please install WhatsApp to send messages.');
    }
  });
}

// ─── CALL PHONE (FREE — native dialer) ───
export function callPhone(phone) {
  const cleanPhone = phone?.replace(/\D/g, '') || '';
  Linking.openURL(`tel:${cleanPhone}`);
}

// ─── FETCH ROUTE FROM OSRM (FREE open source routing) ───
export async function fetchOSRMRoute(pickupLat, pickupLng, dropoffLat, dropoffLng) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${pickupLng},${pickupLat};${dropoffLng},${dropoffLat}?geometries=geojson&overview=full`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.routes && data.routes[0]) {
      return data.routes[0].geometry.coordinates.map(([lng, lat]) => ({
        latitude: lat,
        longitude: lng,
      }));
    }
    return [];
  } catch (e) {
    console.warn('OSRM route fetch failed:', e);
    return [];
  }
}

// ─── FORMAT PHONE FOR WHATSAPP ───
export function formatPhoneForWhatsApp(phone) {
  const clean = phone?.replace(/\D/g, '') || '';
  return clean.length === 10 ? `91${clean}` : clean;
}

// ─── PAY VIA UPI (FREE — deep link to UPI apps) ───
export function payViaUPI(amount, upiId, name = 'SuprO Ride', rideId = '') {
  const id = upiId || ADMIN_UPI;
  const url = `upi://pay?pa=${id}&pn=${encodeURIComponent(name)}&am=${amount}&tn=${encodeURIComponent(`RideO Payment ${rideId}`)}&cu=INR`;
  Linking.openURL(url).catch(() => {
    Alert.alert('UPI App not found', 'Please install any UPI payment app (GPay, PhonePe, Paytm).');
  });
}

// ─── SEND RIDE REQUEST TO DRIVER VIA WHATSAPP CRM API ───
export async function dispatchRideToDriverWhatsApp(rideDetails: any) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/ride/request-driver`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ride_id: rideDetails.rideId,
        driver_phone: rideDetails.driverPhone,
        passenger_name: rideDetails.passengerName,
        passenger_phone: rideDetails.passengerPhone,
        pickup_address: rideDetails.pickupAddress,
        dropoff_address: rideDetails.dropoffAddress,
        pickup_lat: rideDetails.pickupLat,
        pickup_lng: rideDetails.pickupLng,
        dropoff_lat: rideDetails.dropoffLat,
        dropoff_lng: rideDetails.dropoffLng,
        distance_km: rideDetails.distanceKm,
        estimated_fare: rideDetails.estimatedFare,
        driver_name: rideDetails.driverName,
        driver_rating: rideDetails.driverRating || '4.9',
        vehicle_info: rideDetails.vehicleInfo || 'Standard Cab',
        service_type: rideDetails.serviceType || 'rideo',
      }),
    });
    return res.ok;
  } catch (e) {
    console.warn('WhatsApp dispatch failed:', e);
    return false;
  }
}

// ─── DARK MAP STYLE FOR GOOGLE MAPS (Uber-style dark) ───
export const mapStyleDark = [
  { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#263c3f' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6b9a76' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1f2835' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f3d19c' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f3948' }] },
  { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
  { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#17263c' }] },
];
