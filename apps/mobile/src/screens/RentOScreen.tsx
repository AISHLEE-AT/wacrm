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
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Linking,
  Platform
} from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import {
  Wrench,
  Truck,
  Car,
  Compass,
  MapPin,
  Navigation,
  Phone,
  MessageCircle,
  Share2,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  IndianRupee,
  Shield,
  ArrowLeft,
  Search,
  Star,
  Zap,
  Info
} from 'lucide-react-native';

import { supabase } from '../lib/supabase';
import { AppContext } from '../context/AppContext';
import { LocationContext } from '../context/LocationContext';
import {
  COLORS,
  API_BASE_URL,
  getDistanceKm,
  generateRideOTP,
  openNativeNavigation,
  shareLocationWhatsApp,
  whatsappToPhone,
  callPhone,
  fetchOSRMRoute,
  payViaUPI,
  mapStyleDark
} from '../lib/rideUtils';

const { width } = Dimensions.get('window');

// ─── RENTO CATEGORIES & VEHICLES / MACHINERY ───
const AGRI_EQUIPMENT = [
  { id: 'tractor_plow', name: 'Tractor (Plowing / Rotavator)', tamil: 'டிராக்டர் (ஏர் உழுதல்)', icon: '🚜', rate: 450, unit: 'per_hour', desc: 'Swaraj / Mahindra 45-50 HP' },
  { id: 'paddy_harvester', name: 'Paddy Harvester', tamil: 'நெல் அறுவடை இயந்திரம்', icon: '🌾', rate: 1800, unit: 'per_acre', desc: 'Track & Wheel Type Harvester' },
  { id: 'sugarcane_harvester', name: 'Sugarcane Harvester', tamil: 'கரும்பு அறுவடை', icon: '🎋', rate: 2400, unit: 'per_acre', desc: 'Heavy Duty Field Harvester' },
  { id: 'pesticide_drone', name: 'Pesticide Drone', tamil: 'மருந்து தெளிக்கும் ட்ரோன்', icon: '🛸', rate: 350, unit: 'per_acre', desc: 'Precision Agri Spraying' },
  { id: 'power_tiller', name: 'Power Tiller / Weeder', tamil: 'பவர் டில்லர்', icon: '⚙️', rate: 250, unit: 'per_hour', desc: 'Mini Tiller for Small Land' },
  { id: 'agri_trailer', name: 'Agri Goods Trailer', tamil: 'விவசாய டிரெய்லர்', icon: '🚛', rate: 300, unit: 'per_hour', desc: 'Crop Transport from Field' },
];

const CARGO_VEHICLES = [
  { id: 'tata_ace', name: 'Tata Ace (Chota Hathi)', tamil: 'டாடா ஏஸ்', icon: '🚚', base: 250, perKm: 18, capacity: '750 kg', desc: 'Ideal for Mandi Vegetables' },
  { id: 'bolero_maxi', name: 'Bolero Maxi Truck', tamil: 'போலிரோ மேக்ஸி', icon: '🛻', base: 400, perKm: 22, capacity: '1.5 Tons', desc: 'Heavy Farm Produce & Paddy' },
  { id: 'leyland_dost', name: 'Ashok Leyland Dost', tamil: 'அசோக் லேலேண்ட் தோஸ்ட்', icon: '🚛', base: 450, perKm: 24, capacity: '1.8 Tons', desc: 'Inter-district Cargo' },
  { id: 'eicher_medium', name: 'Eicher 10.90 Lorry', tamil: 'ஐச்சர் லாரி', icon: '🚛', base: 900, perKm: 38, capacity: '5 Tons', desc: 'Bulk Mandi & Sugarcane' },
  { id: 'tipper_10w', name: '10-Wheeler Tipper', tamil: '10 சக்கர டிப்பர்', icon: '🏗️', base: 1800, perKm: 65, capacity: '15 Tons', desc: 'Heavy Soil & Bulk Supply' },
];

const HOURLY_PACKAGES = [
  { id: 'pkg_2h20k', name: '2 Hrs / 20 KM', tamil: '2 மணி நேரம் / 20 கி.மீ', sedan: 499, suv: 799, auto: 299 },
  { id: 'pkg_4h40k', name: '4 Hrs / 40 KM', tamil: '4 மணி நேரம் / 40 கி.மீ', sedan: 899, suv: 1399, auto: 499 },
  { id: 'pkg_8h80k', name: '8 Hrs / 80 KM', tamil: '8 மணி நேரம் / 80 கி.மீ', sedan: 1699, suv: 2499, tempo: 3499 },
  { id: 'pkg_12h120k', name: '12 Hrs / 120 KM', tamil: '12 மணி நேரம் / 120 கி.மீ', sedan: 2399, suv: 3499, tempo: 4899 },
];

const TOUR_PACKAGES = [
  { id: 'tour_ooty', name: 'Ooty Hill Tour', tamil: 'ஊட்டி மலை சுற்றுலா', icon: '🏔️', rate: 4500, duration: '1 Day', desc: 'Pickup anywhere in TN' },
  { id: 'tour_kodai', name: 'Kodaikanal Tour', tamil: 'கொடைக்கானல் சுற்றுலா', icon: '🌲', rate: 4800, duration: '1 Day', desc: 'Sightseeing & Cab' },
  { id: 'tour_rameswaram', name: 'Rameswaram Temple Tour', tamil: 'ராமேஸ்வரம் ஆன்மீக பயணம்', icon: '🛕', rate: 5200, duration: '1 Day', desc: 'Temple & Dhanushkodi' },
  { id: 'tour_girivalam', name: 'Thiruvannamalai Girivalam', tamil: 'திருவண்ணாமலை கிரிவலம்', icon: '🕉️', rate: 3800, duration: '1 Day', desc: 'Direct Darshan & Cab' },
  { id: 'tour_madurai_tanjore', name: 'Madurai & Tanjore Heritage', tamil: 'மதுரை & தஞ்சை சுற்றுலா', icon: '🏰', rate: 4200, duration: '1 Day', desc: 'Big Temple & Meenakshi' },
];

const TN_MANDIS = [
  { name: 'Koyambedu Mandi, Chennai', lat: 13.0694, lng: 80.1948 },
  { name: 'Oddanchatram Vegetable Market', lat: 10.4851, lng: 77.7471 },
  { name: 'Salem Central Agri Mandi', lat: 11.6643, lng: 78.1460 },
  { name: 'Trichy Gandhi Market', lat: 10.8158, lng: 78.6974 },
  { name: 'Tirupur Cotton Market', lat: 11.1085, lng: 77.3411 },
  { name: 'Madurai Mattuthavani Market', lat: 9.9463, lng: 78.1565 }
];

export default function RentOScreen({ navigation }) {
  const mapRef = useRef(null);
  const { user } = useContext(AppContext);
  const { location: globalLoc } = useContext(LocationContext);

  // Active Category State: 'agri' | 'cargo' | 'package' | 'tour'
  const [activeTab, setActiveTab] = useState('agri');
  const [isTamil, setIsTamil] = useState(false);

  // Location States
  const [location, setLocation] = useState({ latitude: 11.9401, longitude: 79.8083 });
  const [pickupAddress, setPickupAddress] = useState('Naradapattu, Tamil Nadu');
  const [dropoffAddress, setDropoffAddress] = useState('Oddanchatram Market, Dindigul');
  const [dropoffLocation, setDropoffLocation] = useState({ latitude: 10.4851, longitude: 77.7471 });
  const [routeCoordinates, setRouteCoordinates] = useState([]);

  // Selection States
  const [selectedItem, setSelectedItem] = useState(AGRI_EQUIPMENT[0]);
  const [durationHours, setDurationHours] = useState('2');
  const [acresCount, setAcresCount] = useState('1');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('Today, 2:00 PM');

  // Fare & Booking State
  const [estimatedFare, setEstimatedFare] = useState(900);
  const [bookingState, setBookingState] = useState('IDLE'); // 'IDLE' | 'SEARCHING' | 'ACCEPTED' | 'IN_PROGRESS'
  const [activeBooking, setActiveBooking] = useState(null);
  const [tripOtp, setTripOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let loc = await Location.getCurrentPositionAsync({});
        if (loc?.coords) {
          const current = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
          setLocation(current);
        }
      }
    })();
  }, []);

  // Update Route and Fare on Selection Changes
  useEffect(() => {
    fetchRouteAndCalculateFare();
  }, [activeTab, selectedItem, durationHours, acresCount, location, dropoffLocation]);

  const fetchRouteAndCalculateFare = async () => {
    try {
      const dist = getDistanceKm(location.latitude, location.longitude, dropoffLocation.latitude, dropoffLocation.longitude);
      
      // Fetch OSRM Route (Zero Cost)
      const route = await fetchOSRMRoute(location.latitude, location.longitude, dropoffLocation.latitude, dropoffLocation.longitude);
      setRouteCoordinates(route);

      // Fare Calculation based on Active Tab
      let fare = 500;
      if (activeTab === 'agri') {
        if (selectedItem?.unit === 'per_acre') {
          fare = selectedItem.rate * (parseFloat(acresCount) || 1);
        } else {
          fare = selectedItem.rate * (parseFloat(durationHours) || 2);
        }
      } else if (activeTab === 'cargo') {
        const base = selectedItem.base || 300;
        const perKm = selectedItem.perKm || 20;
        fare = Math.round(base + (dist * perKm));
      } else if (activeTab === 'package') {
        fare = selectedItem.sedan || 999;
      } else if (activeTab === 'tour') {
        fare = selectedItem.rate || 4500;
      }

      setEstimatedFare(fare);
    } catch (e) {
      console.warn('Fare calculation error:', e);
    }
  };

  // ─── BOOKING DISPATCH ───
  const handleConfirmBooking = async () => {
    setIsLoading(true);
    const otp = generateRideOTP();
    setTripOtp(otp);

    try {
      const bookingCode = `RNT-${Math.floor(100000 + Math.random() * 900000)}`;

      // 1. Insert into Supabase
      const { data, error } = await supabase.from('rento_bookings').insert({
        booking_code: bookingCode,
        user_phone: user?.phone || '919344532738',
        user_name: user?.name || 'Tamil Nadu Farmer / Customer',
        service_category: activeTab,
        vehicle_type: selectedItem?.name || 'Tractor / Vehicle',
        pickup_address: pickupAddress,
        pickup_lat: location.latitude,
        pickup_lng: location.longitude,
        destination_address: dropoffAddress,
        destination_lat: dropoffLocation.latitude,
        destination_lng: dropoffLocation.longitude,
        booking_type: isScheduled ? 'scheduled' : 'instant',
        scheduled_time: isScheduled ? new Date().toISOString() : null,
        estimated_fare: estimatedFare,
        billing_unit: selectedItem?.unit || 'package',
        status: 'pending',
        otp: otp
      }).select().single();

      if (error) {
        console.warn('Supabase rento_bookings insert warning:', error);
      }

      // Also dispatch to rides table for real-time DriveO Driver App matching
      try {
        await supabase.from('rides').insert({
          passenger_phone: user?.phone || '919344532738',
          passenger_name: user?.name || 'Tamil Nadu Farmer / Customer',
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
          vehicle_category: selectedItem?.id || selectedItem?.name || 'tractor',
          fare: estimatedFare,
          status: 'pending',
          otp: otp
        });
      } catch (rErr) {
        console.warn('Rides table insert warning:', rErr);
      }

      // Set Mock Active Booking
      const testPhones = ['919344532738', '919123596988', '919486335870'];
      const assignedPhone = testPhones[Math.floor(Math.random() * testPhones.length)];

      

      const bookingObj = {
        id: data?.id || bookingCode,
        code: bookingCode,
        category: activeTab,
        item: selectedItem,
        fare: estimatedFare,
        otp: otp,
        driver: {
          name: 'RentO Partner',
          phone: assignedPhone,
          vehicle: selectedItem?.name || 'Tractor Swaraj 744',
          rating: '4.8'
        }
      };

      setActiveBooking(bookingObj);
      setBookingState('SEARCHING');

      // 2. Dispatch WhatsApp Notification to Drivers
      try {
        await fetch(`${API_BASE_URL}/api/rento/request`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            booking_code: bookingCode,
            user_phone: user?.phone || 'Unknown',
            user_name: user?.name || 'Customer',
            service_category: activeTab,
            vehicle_type: selectedItem?.name || 'Rental Vehicle',
            pickup_address: pickupAddress,
            destination_address: dropoffAddress,
            estimated_fare: estimatedFare,
            driver_phone: assignedPhone,
            pickup_lat: location.latitude,
            pickup_lon: location.longitude
          })
        });
      } catch (err) {
        console.warn('WhatsApp alert error:', err);
      }

      // Simulate Driver Acceptance after 3 seconds for smooth UX demo
      setTimeout(() => {
        setBookingState('ACCEPTED');
        setIsLoading(false);
      }, 3500);

    } catch (err) {
      Alert.alert('Booking Error', err.message || 'Could not process booking');
      setIsLoading(false);
    }
  };

  const handleCancelBooking = () => {
    setBookingState('IDLE');
    setActiveBooking(null);
  };

  return (
    <View style={styles.container}>
      {/* ─── HEADER ─── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>{isTamil ? 'ரென்ட்ஓ தமிழ்நாடுகள்' : 'RentO Tamil Nadu'}</Text>
          <Text style={styles.headerSub}>{isTamil ? 'வேளாண் இயந்திரங்கள் & வாடகை சேவை' : 'Agri Machinery, Cargo & Rental Hailing'}</Text>
        </View>

        {/* BILINGUAL TOGGLE & SOS BUTTONS */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <TouchableOpacity
            style={[styles.langChip, isTamil && styles.langChipActive]}
            onPress={() => setIsTamil(!isTamil)}
          >
            <Text style={[styles.langChipText, isTamil && { color: '#000' }]}>{isTamil ? 'English' : 'தமிழ்'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sosHeaderBtn}
            onPress={() => {
              Linking.openURL('tel:112');
              shareLocationWhatsApp(location.latitude, location.longitude, 'SOS EMERGENCY - RentO Field Location');
            }}
          >
            <Shield size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── MAP VIEW (Google Maps Provider) ─── */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          customMapStyle={mapStyleDark}
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.08,
            longitudeDelta: 0.08,
          }}
        >
          {/* Pickup Marker */}
          <Marker coordinate={location} title="Pickup / Farm Field">
            <View style={styles.pickupMarker}>
              <Text style={{ fontSize: 16 }}>🚜</Text>
            </View>
          </Marker>

          {/* Destination Marker */}
          <Marker coordinate={dropoffLocation} title="Market Mandi / Drop">
            <View style={styles.dropMarker}>
              <Text style={{ fontSize: 16 }}>🏬</Text>
            </View>
          </Marker>

          {/* OSRM Route Line */}
          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeWidth={4}
              strokeColor={COLORS.green}
            />
          )}
        </MapView>
      </View>

      {/* ─── BOTTOM CONTROLS & SELECTION PANEL ─── */}
      <ScrollView style={styles.sheetContainer} contentContainerStyle={{ paddingBottom: 40 }}>
        {bookingState === 'IDLE' && (
          <>
            {/* CATEGORY TABS SWITCHER */}
            <View style={styles.tabRow}>
              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'agri' && styles.tabBtnActive]}
                onPress={() => { setActiveTab('agri'); setSelectedItem(AGRI_EQUIPMENT[0]); }}
              >
                <Wrench size={16} color={activeTab === 'agri' ? '#000' : '#94a3b8'} />
                <Text style={[styles.tabText, activeTab === 'agri' && styles.tabTextActive]}>Agri</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'cargo' && styles.tabBtnActive]}
                onPress={() => { setActiveTab('cargo'); setSelectedItem(CARGO_VEHICLES[0]); }}
              >
                <Truck size={16} color={activeTab === 'cargo' ? '#000' : '#94a3b8'} />
                <Text style={[styles.tabText, activeTab === 'cargo' && styles.tabTextActive]}>Cargo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'package' && styles.tabBtnActive]}
                onPress={() => { setActiveTab('package'); setSelectedItem(HOURLY_PACKAGES[0]); }}
              >
                <Clock size={16} color={activeTab === 'package' ? '#000' : '#94a3b8'} />
                <Text style={[styles.tabText, activeTab === 'package' && styles.tabTextActive]}>Packages</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'tour' && styles.tabBtnActive]}
                onPress={() => { setActiveTab('tour'); setSelectedItem(TOUR_PACKAGES[0]); }}
              >
                <Compass size={16} color={activeTab === 'tour' ? '#000' : '#94a3b8'} />
                <Text style={[styles.tabText, activeTab === 'tour' && styles.tabTextActive]}>Tours</Text>
              </TouchableOpacity>
            </View>

            {/* LOCATION ADDRESS CARDS */}
            <View style={styles.locationCard}>
              <View style={styles.locationRow}>
                <MapPin size={18} color={COLORS.green} />
                <TextInput
                  style={styles.locationInput}
                  value={pickupAddress}
                  onChangeText={setPickupAddress}
                  placeholder={isTamil ? "வயல்வெளி / புறப்படும் இடம்" : "Pickup / Farm Field Address"}
                  placeholderTextColor="#64748b"
                />
              </View>
              <View style={styles.divider} />
              <View style={styles.locationRow}>
                <Navigation size={18} color={COLORS.yellow} />
                <TextInput
                  style={styles.locationInput}
                  value={dropoffAddress}
                  onChangeText={setDropoffAddress}
                  placeholder={isTamil ? "சந்தை / சேருமிடம்" : "Destination / Market Mandi Address"}
                  placeholderTextColor="#64748b"
                />
              </View>
            </View>

            {/* SUPRO SAFETY GUARANTEE BADGE */}
            <View style={styles.safetyGuaranteeCard}>
              <Shield size={16} color={COLORS.green} />
              <Text style={styles.safetyGuaranteeText}>
                {isTamil ? '🛡️ சுப்ரோ பாதுகாப்பு உத்தரவாதம்: சரிபார்க்கப்பட்ட ஓட்டுனர் & பயிர் பாதுகாப்பு' : '🛡️ SuprO Safety Guarantee: Verified Operator & Crop Protection'}
              </Text>
            </View>

            {/* TAMIL NADU MANDI PRESETS */}
            <Text style={styles.sectionHeader}>🏬 TN Major Mandis & Hubs:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
              {TN_MANDIS.map((mandi, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.presetChip}
                  onPress={() => {
                    setDropoffAddress(mandi.name);
                    setDropoffLocation({ latitude: mandi.lat, longitude: mandi.lng });
                  }}
                >
                  <Text style={styles.presetChipText}>{mandi.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* VEHICLE / MACHINERY CAROUSEL */}
            <Text style={styles.sectionHeader}>
              {activeTab === 'agri' && '🌾 Farm Machinery & Equipment:'}
              {activeTab === 'cargo' && '🚚 Market & Goods Transport Trucks:'}
              {activeTab === 'package' && '🚕 RedTaxi / Hourly Rental Packages:'}
              {activeTab === 'tour' && '🏔️ Tamil Nadu Tour & Pilgrimage Vehicles:'}
            </Text>

            {activeTab === 'agri' && (
              <View style={styles.gridList}>
                {AGRI_EQUIPMENT.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.itemCard, selectedItem?.id === item.id && styles.itemCardSelected]}
                    onPress={() => setSelectedItem(item)}
                  >
                    <Text style={styles.itemEmoji}>{item.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemTamil}>{item.tamil}</Text>
                      <Text style={styles.itemDesc}>{item.desc}</Text>
                    </View>
                    <Text style={styles.itemPrice}>₹{item.rate}/{item.unit === 'per_acre' ? 'acre' : 'hr'}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {activeTab === 'cargo' && (
              <View style={styles.gridList}>
                {CARGO_VEHICLES.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.itemCard, selectedItem?.id === item.id && styles.itemCardSelected]}
                    onPress={() => setSelectedItem(item)}
                  >
                    <Text style={styles.itemEmoji}>{item.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemTamil}>{item.tamil}</Text>
                      <Text style={styles.itemDesc}>Capacity: {item.capacity}</Text>
                    </View>
                    <Text style={styles.itemPrice}>Base ₹{item.base}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {activeTab === 'package' && (
              <View style={styles.gridList}>
                {HOURLY_PACKAGES.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.itemCard, selectedItem?.id === item.id && styles.itemCardSelected]}
                    onPress={() => setSelectedItem(item)}
                  >
                    <Text style={styles.itemEmoji}>🚕</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemTamil}>{item.tamil}</Text>
                    </View>
                    <Text style={styles.itemPrice}>From ₹{item.sedan}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {activeTab === 'tour' && (
              <View style={styles.gridList}>
                {TOUR_PACKAGES.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.itemCard, selectedItem?.id === item.id && styles.itemCardSelected]}
                    onPress={() => setSelectedItem(item)}
                  >
                    <Text style={styles.itemEmoji}>{item.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemTamil}>{item.tamil}</Text>
                      <Text style={styles.itemDesc}>{item.desc}</Text>
                    </View>
                    <Text style={styles.itemPrice}>₹{item.rate}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* FARE & CONFIRMATION BOX */}
            <View style={styles.confirmBox}>
              <View style={styles.fareRow}>
                <View>
                  <Text style={styles.fareLabel}>Est. Total Rental Fare</Text>
                  <Text style={styles.fareSubText}>Includes fuel, driver batta & machinery</Text>
                </View>
                <Text style={styles.fareValue}>₹{estimatedFare}</Text>
              </View>

              <TouchableOpacity
                style={styles.bookBtn}
                onPress={handleConfirmBooking}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <>
                    <Zap size={20} color="#000" />
                    <Text style={styles.bookBtnText}>Confirm RentO Booking</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* ─── ACTIVE BOOKING OVERLAY (SEARCHING & ACCEPTED) ─── */}
        {bookingState !== 'IDLE' && (
          <View style={styles.activeBookingCard}>
            {bookingState === 'SEARCHING' && (
              <View style={styles.searchingBox}>
                <ActivityIndicator size="large" color={COLORS.green} />
                <Text style={styles.searchingTitle}>Dispatching to Nearby Partners...</Text>
                <Text style={styles.searchingSub}>Sending WhatsApp alert to drivers in Tamil Nadu</Text>
              </View>
            )}

            {bookingState === 'ACCEPTED' && activeBooking && (
              <>
                <View style={styles.statusBadge}>
                  <CheckCircle size={20} color={COLORS.green} />
                  <Text style={styles.statusBadgeText}>Rental Confirmed & Partner Assigned</Text>
                </View>

                {/* OTP PIN CARD */}
                <View style={styles.otpCard}>
                  <Text style={styles.otpLabel}>Work / Start Trip PIN:</Text>
                  <Text style={styles.otpVal}>{activeBooking.otp}</Text>
                  <Text style={styles.otpSub}>Share this 4-digit PIN with operator to start work</Text>
                </View>

                {/* DRIVER INFO CARD */}
                <View style={styles.driverCard}>
                  <View style={styles.driverAvatar}>
                    <Text style={{ fontSize: 24 }}>🚜</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.driverName}>{activeBooking.driver.name}</Text>
                    <Text style={styles.driverVehicle}>{activeBooking.driver.vehicle}</Text>
                    <Text style={styles.driverRating}>⭐ {activeBooking.driver.rating} Rating • Verified Operator 🛡️</Text>
                  </View>
                  <TouchableOpacity style={styles.iconCallBtn} onPress={() => callPhone(activeBooking.driver.phone)}>
                    <Phone size={20} color="#fff" />
                  </TouchableOpacity>
                </View>

                {/* ACTION BUTTONS */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.actionOutlineBtn}
                    onPress={() => shareLocationWhatsApp(location.latitude, location.longitude, `Work field location for RentO booking ${activeBooking.code}`)}
                  >
                    <Share2 size={18} color={COLORS.green} />
                    <Text style={[styles.actionBtnText, { color: COLORS.green }]}>Share Field GPS</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionOutlineBtn}
                    onPress={() => openNativeNavigation(location.latitude, location.longitude, 'Work Field Location')}
                  >
                    <Navigation size={18} color={COLORS.blue} />
                    <Text style={[styles.actionBtnText, { color: COLORS.blue }]}>Navigate</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.upiBtn} onPress={() => payViaUPI(activeBooking.fare, '9486335870@hdfcbank', 'RentO Rental', activeBooking.code)}>
                  <IndianRupee size={18} color="#000" />
                  <Text style={styles.upiBtnText}>Pay ₹{activeBooking.fare} via UPI</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelBookingBtn} onPress={handleCancelBooking}>
                  <XCircle size={18} color={COLORS.red} />
                  <Text style={styles.cancelBookingText}>Cancel Rental Booking</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backBtn: {
    padding: 8,
    marginRight: 8,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
  },
  headerSub: {
    fontSize: 12,
    color: '#94a3b8',
  },
  mapContainer: {
    height: 220,
    width: '100%',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  pickupMarker: {
    backgroundColor: '#10b981',
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  dropMarker: {
    backgroundColor: '#f59e0b',
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  sheetContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 4,
  },
  tabBtnActive: {
    backgroundColor: '#10b981',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
  },
  tabTextActive: {
    color: '#000',
  },
  locationCard: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  locationInput: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    paddingVertical: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#1e293b',
    my: 8,
    marginVertical: 8,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#cbd5e1',
    marginTop: 8,
    marginBottom: 8,
  },
  presetScroll: {
    marginBottom: 12,
  },
  presetChip: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  presetChipText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '500',
  },
  gridList: {
    gap: 10,
    marginBottom: 16,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 12,
  },
  itemCardSelected: {
    borderColor: '#10b981',
    backgroundColor: '#10b98115',
  },
  itemEmoji: {
    fontSize: 28,
  },
  itemName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
  itemTamil: {
    fontSize: 12,
    color: '#10b981',
  },
  itemDesc: {
    fontSize: 11,
    color: '#94a3b8',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  confirmBox: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#10b981',
    marginTop: 8,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fareLabel: {
    fontSize: 14,
    color: '#94a3b8',
  },
  fareSubText: {
    fontSize: 11,
    color: '#64748b',
  },
  fareValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
  },
  bookBtn: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  bookBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeBookingCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#10b981',
    gap: 16,
    marginTop: 12,
  },
  searchingBox: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  searchingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchingSub: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#10b98120',
    padding: 10,
    borderRadius: 8,
  },
  statusBadgeText: {
    color: '#10b981',
    fontWeight: 'bold',
    fontSize: 13,
  },
  otpCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  otpLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  otpVal: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f59e0b',
    letterSpacing: 6,
    marginVertical: 4,
  },
  otpSub: {
    fontSize: 11,
    color: '#64748b',
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  driverAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#10b98130',
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
  driverVehicle: {
    fontSize: 12,
    color: '#94a3b8',
  },
  driverRating: {
    fontSize: 11,
    color: '#f59e0b',
  },
  iconCallBtn: {
    backgroundColor: '#10b981',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionOutlineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 6,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  upiBtn: {
    backgroundColor: '#f59e0b',
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  upiBtnText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  cancelBookingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  cancelBookingText: {
    color: '#ef4444',
    fontSize: 13,
  },
  langChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  langChipActive: {
    backgroundColor: '#10b981',
  },
  langChipText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#10b981',
  },
  sosHeaderBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#ef444420',
    borderWidth: 1,
    borderColor: '#ef444460',
  },
  safetyGuaranteeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#10b98115',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#10b98140',
    marginBottom: 12,
  },
  safetyGuaranteeText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
    flex: 1,
  },
});
