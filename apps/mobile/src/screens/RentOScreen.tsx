// @ts-nocheck
import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
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
  Platform,
  Animated,
  Easing,
} from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, Polyline } from 'react-native-maps';
import {
  Wrench,
  Truck,
  Car,
  Compass,
  MapPin,
  Navigation,
  Phone,
  MessageSquare,
  MessageCircle,
  Share2,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  X,
  IndianRupee,
  Shield,
  ArrowLeft,
  Search,
  Star,
  Zap,
  Info,
  RefreshCw,
  Crosshair,
  Plus,
  Minus,
  Check,
  ChevronRight,
  User,
  AlertTriangle,
} from 'lucide-react-native';

import { supabase } from '../lib/supabase';
import { AppContext } from '../context/AppContext';
import { LocationContext } from '../context/LocationContext';
import {
  COLORS,
  API_BASE_URL,
  ADMIN_UPI,
  getDistanceKm,
  generateRideOTP,
  openNativeNavigation,
  shareLocationWhatsApp,
  whatsappToPhone,
  callPhone,
  fetchOSRMRoute,
  payViaUPI,
  formatPhoneForWhatsApp,
  dispatchRideToDriverWhatsApp,
  mapStyleDark,
} from '../lib/rideUtils';

const { width, height } = Dimensions.get('window');

// ─── RENTO CATEGORIES & VEHICLES / MACHINERY CATALOG ───
const AGRI_EQUIPMENT = [
  {
    id: 'tractor_plow',
    name: 'Tractor (Plowing / Rotavator)',
    tamil: 'டிராக்டர் (ஏர் உழுதல் / ரோட்டவேட்டர்)',
    icon: '🚜',
    rate: 450,
    unit: 'per_hour',
    desc: 'Mahindra / Swaraj 45-50 HP with rotavator',
    quickCounts: [1, 2, 4, 8],
    minCount: 1,
  },
  {
    id: 'paddy_harvester',
    name: 'Paddy Harvester (Track / Wheel)',
    tamil: 'நெல் அறுவடை இயந்திரம்',
    icon: '🌾',
    rate: 1800,
    unit: 'per_acre',
    desc: 'Rubber Track & Wheel Type Harvester',
    quickCounts: [1, 2, 3, 5],
    minCount: 1,
  },
  {
    id: 'sugarcane_harvester',
    name: 'Sugarcane Harvester',
    tamil: 'கரும்பு அறுவடை இயந்திரம்',
    icon: '🎋',
    rate: 2400,
    unit: 'per_acre',
    desc: 'Heavy Duty Field Sugarcane Harvester',
    quickCounts: [1, 2, 4, 8],
    minCount: 1,
  },
  {
    id: 'pesticide_drone',
    name: 'Agri Drone Sprayer',
    tamil: 'மருந்து தெளிக்கும் ட்ரோன்',
    icon: '🛸',
    rate: 350,
    unit: 'per_acre',
    desc: 'DGCA Certified 10L/16L Precision Spraying',
    quickCounts: [1, 2, 5, 10],
    minCount: 1,
  },
  {
    id: 'power_tiller',
    name: 'Power Tiller / Weeder',
    tamil: 'பவர் டில்லர் / களை எடுப்பான்',
    icon: '⚙️',
    rate: 250,
    unit: 'per_hour',
    desc: 'Compact Tiller for Vegetables & Small Fields',
    quickCounts: [2, 4, 6, 8],
    minCount: 1,
  },
  {
    id: 'agri_trailer',
    name: 'Agri Goods Trailer & Tipper',
    tamil: 'விவசாய டிரெய்லர் & டிப்பர்',
    icon: '🚛',
    rate: 300,
    unit: 'per_hour',
    desc: 'Crop & Produce Transport from Field to Yard',
    quickCounts: [2, 4, 6, 8],
    minCount: 1,
  },
  {
    id: 'coconut_climber',
    name: 'Coconut Tree Harvesting Machine',
    tamil: 'தென்னை மரம் ஏறும் இயந்திரம்',
    icon: '🌴',
    rate: 150,
    unit: 'per_hour',
    desc: 'Safety Harness & Mechanical Climber Tool',
    quickCounts: [2, 4, 6, 8],
    minCount: 1,
  },
];

const CARGO_VEHICLES = [
  {
    id: 'tata_ace',
    name: 'Tata Ace (Chota Hathi)',
    tamil: 'டாடா ஏஸ் (சோட்டா ஹாத்தி)',
    icon: '🚚',
    base: 250,
    perKm: 18,
    capacity: '750 kg',
    desc: 'Ideal for Mandi Vegetables & Small Loads',
  },
  {
    id: 'bolero_maxi',
    name: 'Bolero Maxi Truck',
    tamil: 'போலிரோ மேக்ஸி டிரக்',
    icon: '🛻',
    base: 400,
    perKm: 22,
    capacity: '1.5 Tons',
    desc: 'Heavy Farm Produce, Paddy Bags & Grains',
  },
  {
    id: 'leyland_dost',
    name: 'Ashok Leyland Dost',
    tamil: 'அசோக் லேலேண்ட் தோஸ்ட்',
    icon: '🚛',
    base: 450,
    perKm: 24,
    capacity: '1.8 Tons',
    desc: 'Inter-district Cargo & Commercial Goods',
  },
  {
    id: 'eicher_medium',
    name: 'Eicher 10.90 Lorry',
    tamil: 'ஐச்சர் 10.90 லாரி',
    icon: '🚛',
    base: 900,
    perKm: 38,
    capacity: '5 Tons',
    desc: 'Bulk Mandi Crops, Banana & Sugarcane',
  },
  {
    id: 'tipper_10w',
    name: '10-Wheeler Heavy Tipper',
    tamil: '10 சக்கர டிப்பர் லாரி',
    icon: '🏗️',
    base: 1800,
    perKm: 65,
    capacity: '15 Tons',
    desc: 'Bulk Soil, Manure, Gravel & Heavy Freight',
  },
  {
    id: 'mini_auto_cargo',
    name: '3-Wheeler Cargo Auto',
    tamil: '3-சக்கர லோடு ஆட்டோ',
    icon: '🛺',
    base: 160,
    perKm: 14,
    capacity: '400 kg',
    desc: 'Quick Local Village & Market Delivery',
  },
];

const HOURLY_PACKAGES = [
  {
    id: 'pkg_2h20k',
    name: '2 Hrs / 20 KM',
    tamil: '2 மணி நேரம் / 20 கி.மீ',
    auto: 299,
    sedan: 499,
    suv: 799,
    tempo: 1299,
    desc: 'Short Town Errands & Hospital Visits',
  },
  {
    id: 'pkg_4h40k',
    name: '4 Hrs / 40 KM',
    tamil: '4 மணி நேரம் / 40 கி.மீ',
    auto: 499,
    sedan: 899,
    suv: 1399,
    tempo: 2199,
    desc: 'Shopping & Multiple Mandi / Bank Stops',
  },
  {
    id: 'pkg_8h80k',
    name: '8 Hrs / 80 KM (Full Day)',
    tamil: '8 மணி நேரம் / 80 கி.மீ (முழு நாள்)',
    auto: 899,
    sedan: 1699,
    suv: 2499,
    tempo: 3499,
    desc: 'Full Day Business, Family & District Travel',
  },
  {
    id: 'pkg_12h120k',
    name: '12 Hrs / 120 KM',
    tamil: '12 மணி நேரம் / 120 கி.மீ',
    auto: 1299,
    sedan: 2399,
    suv: 3499,
    tempo: 4899,
    desc: 'Outstation Day Trip & Extended Booking',
  },
];

const TOUR_PACKAGES = [
  {
    id: 'tour_ooty',
    name: 'Ooty Queen of Hills Tour',
    tamil: 'ஊட்டி மலை சுற்றுலா',
    icon: '🏔️',
    rate: 4500,
    duration: '1 Day Full Package',
    desc: 'Botanical Garden, Lake, Tea Factory & Dodabetta',
  },
  {
    id: 'tour_kodai',
    name: 'Kodaikanal Princess of Hills',
    tamil: 'கொடைக்கானல் சுற்றுலா',
    icon: '🌲',
    rate: 4800,
    duration: '1 Day Full Package',
    desc: 'Coakers Walk, Pillar Rocks, Lake & Pine Forest',
  },
  {
    id: 'tour_rameswaram',
    name: 'Rameswaram Temple & Dhanushkodi',
    tamil: 'ராமேஸ்வரம் ஆன்மீக பயணம்',
    icon: '🛕',
    rate: 5200,
    duration: '1 Day Darshan & Sightseeing',
    desc: 'Ramanathaswamy Temple, Pamban Bridge & Ghost Town',
  },
  {
    id: 'tour_girivalam',
    name: 'Thiruvannamalai Girivalam',
    tamil: 'திருவண்ணாமலை கிரிவலம் & கோவில்',
    icon: '🕉️',
    rate: 3800,
    duration: '1 Day Direct Trip',
    desc: 'Arunachaleswarar Temple Darshan & Full Girivalam',
  },
  {
    id: 'tour_madurai_tanjore',
    name: 'Madurai & Tanjore Heritage Tour',
    tamil: 'மதுரை & தஞ்சை பாரம்பரிய சுற்றுலா',
    icon: '🏰',
    rate: 4200,
    duration: '1 Day Heritage Circuit',
    desc: 'Meenakshi Amman Temple, Brihadeeswarar Temple',
  },
  {
    id: 'tour_palani',
    name: 'Palani Murugan Temple Darshan',
    tamil: 'பழனி முருகன் கோவில் தரிசனம்',
    icon: '🛕',
    rate: 3600,
    duration: '1 Day Temple Tour',
    desc: 'Direct Hilltop Darshan & Nearby Sightseeing',
  },
];

const TN_MANDIS = [
  { name: 'Koyambedu Mandi, Chennai', lat: 13.0694, lng: 80.1948, tag: 'Vegetables & Fruits' },
  { name: 'Oddanchatram Vegetable Market', lat: 10.4851, lng: 77.7471, tag: 'Wholesale Mandi' },
  { name: 'Salem Central Agri Mandi', lat: 11.6643, lng: 78.1460, tag: 'Mangoes & Grains' },
  { name: 'Trichy Gandhi Market', lat: 10.8158, lng: 78.6974, tag: 'Central Delta Hub' },
  { name: 'Tirupur Cotton Market', lat: 11.1085, lng: 77.3411, tag: 'Cotton & Textiles' },
  { name: 'Madurai Mattuthavani Market', lat: 9.9463, lng: 78.1565, tag: 'Flowers & Vegetables' },
  { name: 'Pollachi Coconut & Coir Hub', lat: 10.6582, lng: 77.0098, tag: 'Coconut Mandi' },
  { name: 'Theni Banana & Cardamom Mandi', lat: 10.0104, lng: 77.4768, tag: 'Produce Mandi' },
];

export default function RentOScreen({ navigation }) {
  const mapRef = useRef(null);
  const { user } = useContext(AppContext);
  const { location: globalLoc } = useContext(LocationContext);

  // Active Category State: 'agri' | 'cargo' | 'package' | 'tour'
  const [activeTab, setActiveTab] = useState('agri');
  const [isTamil, setIsTamil] = useState(false);

  // Location States (Default: User's live local field location)
  const [location, setLocation] = useState({ latitude: 11.9401, longitude: 79.8083 });
  const [pickupAddress, setPickupAddress] = useState('Naradapattu, Tamil Nadu');
  const [pickupQuery, setPickupQuery] = useState('');
  const [isSearchingPickup, setIsSearchingPickup] = useState(false);

  const [dropoffLocation, setDropoffLocation] = useState({ latitude: 11.9700, longitude: 79.8200 });
  const [dropoffAddress, setDropoffAddress] = useState('Local Mandi / Market');
  const [dropoffQuery, setDropoffQuery] = useState('');
  const [isSearchingDropoff, setIsSearchingDropoff] = useState(false);

  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [distanceKm, setDistanceKm] = useState(0);

  // Selection States
  const [selectedItem, setSelectedItem] = useState(AGRI_EQUIPMENT[0]);
  const [packageTier, setPackageTier] = useState('sedan'); // 'auto' | 'sedan' | 'suv' | 'tempo'
  const [quantityCount, setQuantityCount] = useState(1); // Acres or Hours count

  // Scheduling State
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledSlot, setScheduledSlot] = useState('Today (2:00 PM)');

  // Fare & Payment States
  const [estimatedFare, setEstimatedFare] = useState(450);
  const [paymentMode, setPaymentMode] = useState('UPI'); // 'UPI' | 'CASH'

  // Booking Lifecycle State: 'IDLE' | 'SEARCHING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED'
  const [bookingState, setBookingState] = useState('IDLE');
  const [activeBooking, setActiveBooking] = useState(null);
  const [tripOtp, setTripOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(45);

  // Rating & Review State
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');

  // Nearby Operators State
  const [nearbyOperators, setNearbyOperators] = useState([]);

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [isOptionsExpanded, setIsOptionsExpanded] = useState(false);

  // 1. Initial Setup: Get Real Location and center Map
  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          if (loc?.coords) {
            const current = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
            setLocation(current);
            reverseGeocode(current.latitude, current.longitude, setPickupAddress);

            if (mapRef.current) {
              mapRef.current.animateToRegion({
                ...current,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }, 800);
            }
          }
        }
      } catch (err) {
        console.warn('Location initialization error:', err);
      }
    })();
  }, []);

  // 2. Generate Nearby Regional Operators around Location
  useEffect(() => {
    if (!location?.latitude || !location?.longitude) return;

    const baseLat = location.latitude;
    const baseLng = location.longitude;

    const myPhoneClean = (user?.phone || '').replace(/\D/g, '').slice(-10);

    const operators = [
      {
        id: 'op1',
        name: 'Murugan Agri Services',
        phone: '9344532738',
        vehicle: 'Mahindra 575 DI (Plowing & Rotavator)',
        category: 'agri',
        icon: '🚜',
        rating: '4.9',
        trips: '340+ Jobs',
        latitude: baseLat + 0.007,
        longitude: baseLng + 0.006,
        distance: '1.2 km away',
      },
      {
        id: 'op2',
        name: 'Selvam Cargo Transport',
        phone: '9123596988',
        vehicle: 'Tata Ace Chota Hathi (TN 45 BB 8291)',
        category: 'cargo',
        icon: '🚚',
        rating: '4.85',
        trips: '520+ Mandi Trips',
        latitude: baseLat - 0.008,
        longitude: baseLng - 0.007,
        distance: '1.8 km away',
      },
      {
        id: 'op3',
        name: 'Kaveri Drone Tech',
        phone: '9486335870',
        vehicle: 'Precision 16L Agri Spraying Drone',
        category: 'agri',
        icon: '🛸',
        rating: '4.95',
        trips: '180+ Acres',
        latitude: baseLat + 0.012,
        longitude: baseLng - 0.009,
        distance: '2.4 km away',
      },
      {
        id: 'op4',
        name: 'Tamil Nadu Tour & Taxi',
        phone: '916381029380',
        vehicle: 'Toyota Innova Crysta / Ertiga (AC)',
        category: 'tour',
        icon: '🚕',
        rating: '4.92',
        trips: '890+ Tours',
        latitude: baseLat - 0.006,
        longitude: baseLng + 0.011,
        distance: '2.1 km away',
      },
    ].filter(op => {
      const opPhoneClean = op.phone.replace(/\D/g, '').slice(-10);
      return !myPhoneClean || opPhoneClean !== myPhoneClean;
    });

    setNearbyOperators(operators);
  }, [location?.latitude, location?.longitude, user?.phone]);

  // 3. Update Route & Calculate Fare when tab, item, quantity or coordinates change
  useEffect(() => {
    fetchRouteAndCalculateFare();
  }, [activeTab, selectedItem, packageTier, quantityCount, location, dropoffLocation]);

  // Pulse animation during SEARCHING state (5-minute auto-expiry)
  useEffect(() => {
    let timer = null;
    if (bookingState === 'SEARCHING') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.25, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        ])
      ).start();

      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleBookingTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setCountdown(300); // 5 minutes = 300s
      pulseAnim.setValue(1);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [bookingState]);

  // Realtime Supabase Booking listener
  useEffect(() => {
    let bookingChannel = null;
    let pollInterval = null;

    if (activeBooking?.id && (bookingState === 'SEARCHING' || bookingState === 'ACCEPTED' || bookingState === 'IN_PROGRESS')) {
      // 1. Supabase Postgres Realtime Subscription
      bookingChannel = supabase
        .channel(`rento-booking-${activeBooking.id}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'rides', filter: `id=eq.${activeBooking.id}` },
          (payload) => {
            const status = payload.new?.status;
            if (status === 'accepted' || status === 'driver_arrived') {
              setBookingState('ACCEPTED');
            } else if (status === 'in_progress') {
              setBookingState('IN_PROGRESS');
            } else if (status === 'completed') {
              setBookingState('COMPLETED');
            } else if (status === 'cancelled') {
              Alert.alert('Booking Notice', 'The operator was unable to accept this booking.');
              setBookingState('IDLE');
              setActiveBooking(null);
            }
          }
        )
        .subscribe();

      // 2. Active 2-second Polling Fallback
      pollInterval = setInterval(async () => {
        try {
          const { data: latestRide } = await supabase
            .from('rides')
            .select('*')
            .eq('id', activeBooking.id)
            .maybeSingle();

          if (latestRide?.status) {
            if (latestRide.status === 'accepted' && bookingState !== 'ACCEPTED') {
              setBookingState('ACCEPTED');
            } else if (latestRide.status === 'in_progress' && bookingState !== 'IN_PROGRESS') {
              setBookingState('IN_PROGRESS');
            } else if (latestRide.status === 'completed' && bookingState !== 'COMPLETED') {
              setBookingState('COMPLETED');
            }
          }
        } catch (err) {
          // ignore polling warning
        }
      }, 2000);
    }

    return () => {
      if (bookingChannel) supabase.removeChannel(bookingChannel);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [activeBooking?.id, bookingState]);

  // ─── HELPER FUNCTIONS ───

  const reverseGeocode = async (lat, lng, setter) => {
    try {
      const geocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (geocode && geocode.length > 0) {
        const g = geocode[0];
        const parts = [
          g.street && !g.street.includes('+') ? g.street : null,
          g.district || g.subregion || null,
          g.city || g.region || null,
        ].filter(Boolean);

        if (parts.length === 0 && g.name && !g.name.includes('+')) {
          parts.push(g.name);
        }
        const formatted = parts.length > 0 ? parts.join(', ') : `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        setter(formatted);
      }
    } catch (e) {
      setter(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  };

  const fitMapToBounds = (loc1, loc2) => {
    if (mapRef.current && loc1 && loc2) {
      mapRef.current.fitToCoordinates([loc1, loc2], {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  };

  const fetchRouteAndCalculateFare = async () => {
    try {
      if (activeTab === 'agri') {
        // Agri machinery operates at the farmer's live field location (no cross-state route)
        setRouteCoordinates([]);
        setDistanceKm(0);
        const rate = selectedItem?.rate || 450;
        const count = Math.max(1, quantityCount || 1);
        setEstimatedFare(Math.round(rate * count));
        return;
      }

      // For Cargo / Tour / Packages, calculate route between pickup and destination
      const dist = getDistanceKm(location.latitude, location.longitude, dropoffLocation.latitude, dropoffLocation.longitude);
      setDistanceKm(dist);

      // Fetch OSRM Route
      const route = await fetchOSRMRoute(location.latitude, location.longitude, dropoffLocation.latitude, dropoffLocation.longitude);
      setRouteCoordinates(route);

      // Fare Calculation based on Active Tab
      let fare = 500;
      const count = Math.max(1, quantityCount || 1);

      if (activeTab === 'cargo') {
        const base = selectedItem?.base || 300;
        const perKm = selectedItem?.perKm || 20;
        fare = Math.round(base + (dist * perKm));
      } else if (activeTab === 'package') {
        fare = selectedItem?.[packageTier] || selectedItem?.sedan || 999;
      } else if (activeTab === 'tour') {
        fare = selectedItem?.rate || 4500;
      }

      setEstimatedFare(fare);
    } catch (e) {
      console.warn('Route/Fare calculation error:', e);
    }
  };

  const handleUseCurrentLocation = async () => {
    try {
      setIsLoading(true);
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const current = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setLocation(current);
      await reverseGeocode(current.latitude, current.longitude, setPickupAddress);

      if (mapRef.current) {
        mapRef.current.animateToRegion({
          ...current,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        }, 600);
      }
    } catch (err) {
      Alert.alert('GPS Error', 'Could not fetch current GPS location. Please check permissions.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchPickup = async () => {
    if (!pickupQuery.trim()) return;
    setIsSearchingPickup(true);
    try {
      const results = await Location.geocodeAsync(pickupQuery.trim());
      if (results && results.length > 0) {
        const newLoc = { latitude: results[0].latitude, longitude: results[0].longitude };
        setLocation(newLoc);
        setPickupAddress(pickupQuery.trim());
        setPickupQuery('');
        fitMapToBounds(newLoc, dropoffLocation);
      } else {
        Alert.alert('Location not found', 'Could not locate address in Tamil Nadu. Try typing a nearby town or village.');
      }
    } catch (e) {
      Alert.alert('Search Error', 'Could not search location.');
    } finally {
      setIsSearchingPickup(false);
    }
  };

  const handleSearchDropoff = async () => {
    if (!dropoffQuery.trim()) return;
    setIsSearchingDropoff(true);
    try {
      const results = await Location.geocodeAsync(dropoffQuery.trim());
      if (results && results.length > 0) {
        const newLoc = { latitude: results[0].latitude, longitude: results[0].longitude };
        setDropoffLocation(newLoc);
        setDropoffAddress(dropoffQuery.trim());
        setDropoffQuery('');
        fitMapToBounds(location, newLoc);
      } else {
        Alert.alert('Mandi not found', 'Could not locate destination. Try searching for a major town or mandi name.');
      }
    } catch (e) {
      Alert.alert('Search Error', 'Could not search destination.');
    } finally {
      setIsSearchingDropoff(false);
    }
  };

  const handleSelectMandi = (mandi) => {
    const mandiLoc = { latitude: mandi.lat, longitude: mandi.lng };
    setDropoffAddress(mandi.name);
    setDropoffLocation(mandiLoc);
    fitMapToBounds(location, mandiLoc);
  };

  const handleMapPress = (e) => {
    if (!e?.nativeEvent?.coordinate) return;
    const { latitude, longitude } = e.nativeEvent.coordinate;
    const coords = { latitude, longitude };

    // Update Dropoff location by map tap
    setDropoffLocation(coords);
    reverseGeocode(latitude, longitude, setDropoffAddress);
    fitMapToBounds(location, coords);
  };

  // ─── BOOKING DISPATCH & LIFECYCLE ───

  const handleConfirmBooking = async () => {
    setIsLoading(true);
    const otp = generateRideOTP();
    setTripOtp(otp);

    try {
      const bookingCode = `RNT-${Math.floor(100000 + Math.random() * 900000)}`;

      // 1. Insert into Supabase rento_bookings table
      let insertedId = null;
      try {
        const { data: rentoData } = await supabase.from('rento_bookings').insert({
          booking_code: bookingCode,
          user_phone: user?.phone || '919344532738',
          user_name: user?.name || 'Tamil Nadu Farmer / Customer',
          service_category: activeTab,
          vehicle_type: selectedItem?.name || 'Agri Equipment',
          pickup_address: pickupAddress,
          pickup_lat: location.latitude,
          pickup_lng: location.longitude,
          destination_address: dropoffAddress,
          destination_lat: dropoffLocation.latitude,
          destination_lng: dropoffLocation.longitude,
          booking_type: isScheduled ? 'scheduled' : 'instant',
          scheduled_time: isScheduled ? scheduledSlot : null,
          estimated_fare: estimatedFare,
          billing_unit: selectedItem?.unit || 'package',
          payment_mode: paymentMode,
          status: 'pending',
          otp: otp,
        }).select().single();

        if (rentoData?.id) {
          insertedId = rentoData.id;
        }
      } catch (rInsertErr) {
        console.warn('Supabase rento_bookings insert warning:', rInsertErr);
      }

      // 2. Insert into rides table for DriveO Driver matching
      let rideRecordId = insertedId;
      try {
        const { data: rideData } = await supabase.from('rides').insert({
          passenger_phone: user?.phone || '919344532738',
          passenger_name: user?.name || 'Tamil Nadu Farmer / Customer',
          pickup_location: {
            lat: location.latitude,
            lng: location.longitude,
            address: pickupAddress,
          },
          drop_location: {
            lat: dropoffLocation.latitude,
            lng: dropoffLocation.longitude,
            address: dropoffAddress,
            distance_km: distanceKm.toFixed(1),
          },
          vehicle_category: selectedItem?.id || activeTab,
          fare: estimatedFare,
          total_fare: estimatedFare,
          status: 'pending',
          payment_mode: paymentMode,
          otp: otp,
        }).select().single();

        if (rideData?.id) {
          rideRecordId = rideData.id;
        }
      } catch (rideErr) {
        console.warn('Supabase rides insert warning:', rideErr);
      }

      // 0. Query real registered operators from Supabase drivers table
      let assignedDriver = null;
      try {
        const { data: realDrivers } = await supabase
          .from('drivers')
          .select('*')
          .or(`service_type.eq.rento,service_type.eq.both,vehicle_type.eq.${selectedItem?.id || 'tractor'}`)
          .limit(5);

        if (realDrivers && realDrivers.length > 0) {
          assignedDriver = realDrivers[0];
        }
      } catch (dErr) {
        console.warn('Real driver lookup warning:', dErr);
      }

      // 3. Select matching partner
      const matchedPartner = assignedDriver 
        ? {
            name: assignedDriver.name || 'SuprO Verified Operator',
            phone: assignedDriver.phone || assignedDriver.mobile_number || assignedDriver.whatsapp_number,
            vehicle: assignedDriver.vehicle_model || selectedItem?.name || 'Tractor / Equipment',
            rating: '4.95',
            trips: 'Verified Partner',
          }
        : (nearbyOperators.find(op => op.category === activeTab) || nearbyOperators[0]);

      const assignedPhone = matchedPartner?.phone || '919344532738';

      const bookingObj = {
        id: rideRecordId || bookingCode,
        code: bookingCode,
        category: activeTab,
        item: selectedItem,
        quantity: quantityCount,
        fare: estimatedFare,
        otp: otp,
        paymentMode: paymentMode,
        driver: {
          name: matchedPartner?.name || 'SuprO Verified Operator',
          phone: assignedPhone,
          vehicle: matchedPartner?.vehicle || selectedItem?.name || 'Tractor / Equipment',
          rating: matchedPartner?.rating || '4.9',
          trips: matchedPartner?.trips || '300+ Jobs',
        },
      };

      setActiveBooking(bookingObj);
      setBookingState('SEARCHING');
      setIsLoading(false);

      // 4. Dispatch WhatsApp Notification to Drivers & Admin
      try {
        await dispatchRideToDriverWhatsApp({
          rideId: rideRecordId || bookingCode,
          driverPhone: assignedPhone,
          passengerName: user?.name || 'Farmer / Customer',
          passengerPhone: user?.phone || '919486335870',
          pickupAddress,
          dropoffAddress,
          pickupLat: location.latitude,
          pickupLng: location.longitude,
          dropoffLat: dropoffLocation.latitude,
          dropoffLng: dropoffLocation.longitude,
          distanceKm: distanceKm.toFixed(1),
          estimatedFare: estimatedFare,
          driverName: matchedPartner?.name || 'Operator Partner',
          driverRating: matchedPartner?.rating || '4.9',
          vehicleInfo: `${selectedItem?.name} (${isScheduled ? scheduledSlot : 'Instant'})`,
          serviceType: 'rento',
        });
      } catch (waErr) {
        console.warn('WhatsApp alert error:', waErr);
      }

    } catch (err) {
      Alert.alert('Booking Error', err.message || 'Could not process RentO booking');
      setIsLoading(false);
    }
  };

  const handleBookingTimeout = async () => {
    if (activeBooking?.id) {
      try {
        await supabase.from('rides').update({ status: 'expired' }).eq('id', activeBooking.id);
        await supabase.from('rento_bookings').update({ status: 'expired' }).eq('id', activeBooking.id);
      } catch (e) {}
    }
    Alert.alert(
      isTamil ? 'முன்பதிவு காலாவதியானது' : 'Request Expired',
      isTamil
        ? '5 நிமிடங்களுக்குள் ஓட்டுனர் ஏற்கவில்லை. நீங்கள் மீண்டும் முயற்சி செய்யலாம் அல்லது அருகிலுள்ள ஓட்டுனரை நேரடியாக அழைக்கலாம்.'
        : 'No operator accepted this request within 5 minutes. You can retry or contact nearby operators directly.'
    );
    setBookingState('IDLE');
    setActiveBooking(null);
  };

  const handleCancelBooking = async () => {
    Alert.alert(
      isTamil ? 'முன்பதிவை ரத்து செய்' : 'Cancel Booking',
      isTamil ? 'இந்த வாடகை முன்பதிவை ரத்து செய்ய விரும்புகிறீர்களா?' : 'Are you sure you want to cancel this RentO booking?',
      [
        { text: isTamil ? 'இல்லை' : 'No', style: 'cancel' },
        {
          text: isTamil ? 'ஆம், ரத்து செய்' : 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            if (activeBooking?.id) {
              try {
                await supabase.from('rides').update({ status: 'cancelled' }).eq('id', activeBooking.id);
              } catch (e) {}
            }
            setBookingState('IDLE');
            setActiveBooking(null);
          },
        },
      ]
    );
  };

  const handleSubmitRating = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/rides/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ride_id: activeBooking?.id,
          rating,
          review,
        }),
      });
    } catch (e) {}
    setBookingState('IDLE');
    setActiveBooking(null);
    setRating(5);
    setReview('');
  };

  return (
    <View style={styles.container}>
      {/* ─── HEADER BAR ─── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>{isTamil ? 'ரென்ட்ஓ தமிழ்நாடு' : 'RentO Tamil Nadu'}</Text>
          <Text style={styles.headerSub}>
            {isTamil ? 'வேளாண் இயந்திரங்கள் & வாடகை சேவை' : 'Agri Machinery, Cargo & Rental Hailing'}
          </Text>
        </View>

        {/* BILINGUAL TOGGLE & SOS BUTTONS */}
        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={[styles.langChip, isTamil && styles.langChipActive]}
            onPress={() => setIsTamil(!isTamil)}
          >
            <Text style={[styles.langChipText, isTamil && { color: '#000' }]}>
              {isTamil ? 'English' : 'தமிழ்'}
            </Text>
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

      {/* ─── INTERACTIVE FULLSCREEN MAP CONTAINER ─── */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={true}
          showsScale={true}
          customMapStyle={mapStyleDark}
          style={styles.map}
          initialRegion={{
            latitude: location?.latitude || 11.9401,
            longitude: location?.longitude || 79.8083,
            latitudeDelta: 0.08,
            longitudeDelta: 0.08,
          }}
          onPress={handleMapPress}
        >
          {/* Pickup Marker (Farm Field) */}
          <Marker
            coordinate={location}
            title={isTamil ? 'புறப்படும் இடம் / வயல்வெளி' : 'Pickup / Farm Field'}
            description={pickupAddress}
            anchor={{ x: 0.5, y: 1 }}
          >
            <View style={styles.pickupMarker}>
              <Text style={{ fontSize: 18 }}>{activeTab === 'agri' ? '🚜' : '📍'}</Text>
            </View>
          </Marker>

          {/* Dropoff / Mandi Marker (Shown for Cargo & Tour only) */}
          {activeTab !== 'agri' && (
            <Marker
              coordinate={dropoffLocation}
              title={isTamil ? 'சேருமிடம் / சந்தை' : 'Destination / Mandi Hub'}
              description={dropoffAddress}
              anchor={{ x: 0.5, y: 1 }}
            >
              <View style={styles.dropMarker}>
                <Text style={{ fontSize: 18 }}>🏬</Text>
              </View>
            </Marker>
          )}

          {/* Nearby Live Rental Operator Markers */}
          {nearbyOperators.map((op) => (
            <Marker
              key={op.id}
              coordinate={{ latitude: op.latitude, longitude: op.longitude }}
              title={op.name}
              description={`${op.vehicle} • ${op.rating} ⭐`}
            >
              <View style={styles.operatorMapPin}>
                <Text style={{ fontSize: 16 }}>{op.icon}</Text>
              </View>
            </Marker>
          ))}

          {/* OSRM Route Polyline (Shown for Cargo & Tour only) */}
          {activeTab !== 'agri' && routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeWidth={4}
              strokeColor={COLORS.green}
            />
          )}
        </MapView>

        {/* FLOATING TOP CATEGORY TABS */}
        <View style={styles.tabRowFloating} pointerEvents="box-none">
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'agri' && styles.tabBtnActive]}
            onPress={() => {
              setActiveTab('agri');
              setSelectedItem(AGRI_EQUIPMENT[0]);
              setQuantityCount(1);
            }}
          >
            <Wrench size={14} color={activeTab === 'agri' ? '#000' : '#94a3b8'} />
            <Text style={[styles.tabText, activeTab === 'agri' && styles.tabTextActive]}>
              {isTamil ? 'விவசாயம்' : 'Agri'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'cargo' && styles.tabBtnActive]}
            onPress={() => {
              setActiveTab('cargo');
              setSelectedItem(CARGO_VEHICLES[0]);
            }}
          >
            <Truck size={14} color={activeTab === 'cargo' ? '#000' : '#94a3b8'} />
            <Text style={[styles.tabText, activeTab === 'cargo' && styles.tabTextActive]}>
              {isTamil ? 'சரக்கு' : 'Cargo'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'package' && styles.tabBtnActive]}
            onPress={() => {
              setActiveTab('package');
              setSelectedItem(HOURLY_PACKAGES[0]);
            }}
          >
            <Clock size={14} color={activeTab === 'package' ? '#000' : '#94a3b8'} />
            <Text style={[styles.tabText, activeTab === 'package' && styles.tabTextActive]}>
              {isTamil ? 'மணி நேரம்' : 'Packages'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'tour' && styles.tabBtnActive]}
            onPress={() => {
              setActiveTab('tour');
              setSelectedItem(TOUR_PACKAGES[0]);
            }}
          >
            <Compass size={14} color={activeTab === 'tour' ? '#000' : '#94a3b8'} />
            <Text style={[styles.tabText, activeTab === 'tour' && styles.tabTextActive]}>
              {isTamil ? 'சுற்றுலா' : 'Tours'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* FLOATING MAP STATUS & GPS */}
        <View style={styles.mapFloatingBar} pointerEvents="box-none">
          <View style={styles.routePill}>
            <MapPin size={14} color={COLORS.green} />
            <Text style={styles.routePillText} numberOfLines={1}>
              {activeTab === 'agri'
                ? (isTamil ? 'நேரடி வயல்வெளி சேவை' : 'Direct Field Service')
                : (distanceKm > 0 ? `${distanceKm.toFixed(1)} km` : 'Local Mandi')}
            </Text>
          </View>

          <TouchableOpacity style={styles.gpsBtn} onPress={handleUseCurrentLocation}>
            <Crosshair size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── 1. COMPACT FLOATING BOTTOM BAR (~20% screen height) ─── */}
      {bookingState === 'IDLE' && !isOptionsExpanded && (
        <View style={styles.compactBottomBar}>
          <View style={styles.compactSelectionRow}>
            <TouchableOpacity
              style={styles.selectedItemPill}
              onPress={() => setIsOptionsExpanded(true)}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 20, marginRight: 6 }}>{selectedItem?.icon || '🚜'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.selectedItemName} numberOfLines={1}>
                  {isTamil ? selectedItem?.tamil : selectedItem?.name}
                </Text>
                <Text style={styles.selectedItemSub}>
                  ₹{selectedItem?.rate || selectedItem?.base}/{selectedItem?.unit === 'per_acre' ? 'acre' : 'hr'}
                </Text>
              </View>
              <Text style={styles.changeOptionsText}>{isTamil ? 'மாற்று ▾' : 'Options ▾'}</Text>
            </TouchableOpacity>

            {/* Quick Stepper for Agri */}
            {activeTab === 'agri' && selectedItem && (
              <View style={styles.compactStepper}>
                <TouchableOpacity
                  style={styles.miniStepBtn}
                  onPress={() => setQuantityCount(Math.max(1, quantityCount - 1))}
                >
                  <Minus size={14} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.miniStepVal}>
                  {quantityCount} {selectedItem.unit === 'per_acre' ? 'Ac' : 'Hr'}
                </Text>
                <TouchableOpacity
                  style={styles.miniStepBtn}
                  onPress={() => setQuantityCount(quantityCount + 1)}
                >
                  <Plus size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* 1-Tap Booking CTA */}
          <TouchableOpacity
            style={styles.compactBookBtn}
            onPress={handleConfirmBooking}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#000" size="small" />
            ) : (
              <>
                <Zap size={18} color="#000" />
                <Text style={styles.compactBookBtnText}>
                  {isTamil ? `முன்பதிவை உறுதி செய் • ₹${estimatedFare}` : `Confirm RentO Booking • ₹${estimatedFare}`}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* ─── 2. EXPANDABLE OPTIONS OVERLAY SHEET ─── */}
      {(bookingState !== 'IDLE' || isOptionsExpanded) && (
        <ScrollView
          style={[styles.sheetContainerOverlay, isOptionsExpanded && { maxHeight: '70%' }]}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {isOptionsExpanded && bookingState === 'IDLE' && (
            <TouchableOpacity
              style={styles.collapseBar}
              onPress={() => setIsOptionsExpanded(false)}
            >
              <View style={styles.collapseHandle} />
              <Text style={styles.collapseText}>{isTamil ? 'வரைபடத்தைக் காண்பி ▴' : 'Collapse & Show Full Map ▴'}</Text>
            </TouchableOpacity>
          )}

          {bookingState === 'IDLE' && (
            <>

            {/* 2. LOCATION & ADDRESS SEARCH CARDS */}
            <View style={styles.locationCard}>
              {/* Pickup Row */}
              <View style={styles.locationRow}>
                <MapPin size={20} color={COLORS.green} />
                <View style={{ flex: 1 }}>
                  <TextInput
                    style={styles.locationInput}
                    value={pickupQuery ? pickupQuery : pickupAddress}
                    onChangeText={setPickupQuery}
                    onSubmitEditing={handleSearchPickup}
                    placeholder={isTamil ? 'வயல்வெளி / புறப்படும் இடம் தேடு...' : 'Search Pickup / Farm Field Address...'}
                    placeholderTextColor="#64748b"
                    returnKeyType="search"
                  />
                </View>
                {pickupQuery.length > 0 ? (
                  <TouchableOpacity style={styles.searchSubmitBtn} onPress={handleSearchPickup}>
                    {isSearchingPickup ? (
                      <ActivityIndicator size="small" color="#000" />
                    ) : (
                      <Search size={16} color="#000" />
                    )}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.gpsSmallBtn} onPress={handleUseCurrentLocation}>
                    <Crosshair size={16} color={COLORS.green} />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.divider} />

              {/* Destination Row */}
              <View style={styles.locationRow}>
                <Navigation size={20} color={COLORS.yellow} />
                <View style={{ flex: 1 }}>
                  <TextInput
                    style={styles.locationInput}
                    value={dropoffQuery ? dropoffQuery : dropoffAddress}
                    onChangeText={setDropoffQuery}
                    onSubmitEditing={handleSearchDropoff}
                    placeholder={isTamil ? 'சந்தை / சேருமிடம் தேடு...' : 'Search Destination / Market Mandi Address...'}
                    placeholderTextColor="#64748b"
                    returnKeyType="search"
                  />
                </View>
                {dropoffQuery.length > 0 && (
                  <TouchableOpacity style={styles.searchSubmitBtn} onPress={handleSearchDropoff}>
                    {isSearchingDropoff ? (
                      <ActivityIndicator size="small" color="#000" />
                    ) : (
                      <Search size={16} color="#000" />
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* 3. SUPRO SAFETY GUARANTEE BADGE */}
            <View style={styles.safetyGuaranteeCard}>
              <Shield size={18} color={COLORS.green} />
              <Text style={styles.safetyGuaranteeText}>
                {isTamil
                  ? '🛡️ சுப்ரோ பாதுகாப்பு: சரிபார்க்கப்பட்ட ஓட்டுனர் & 100% பயிர் பாதுகாப்பு உத்தரவாதம்'
                  : '🛡️ SuprO Safety Guarantee: Verified Operator & 100% Crop Protection'}
              </Text>
            </View>

            {/* 4. TAMIL NADU MANDI & HUB PRESETS */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeader}>
                {isTamil ? '🏬 தமிழ்நாட்டின் முக்கிய சந்தைகள் & மையங்கள்:' : '🏬 TN Major Mandis & Hubs:'}
              </Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
              {TN_MANDIS.map((mandi, idx) => {
                const isSelected = dropoffAddress === mandi.name;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.presetChip, isSelected && styles.presetChipActive]}
                    onPress={() => handleSelectMandi(mandi)}
                  >
                    <Text style={[styles.presetChipText, isSelected && styles.presetChipTextActive]}>
                      {mandi.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* 5. DYNAMIC QUANTITY STEPPER (For Agri Machinery) */}
            {activeTab === 'agri' && selectedItem && (
              <View style={styles.stepperContainer}>
                <View style={styles.stepperHeader}>
                  <Text style={styles.stepperTitle}>
                    {selectedItem.unit === 'per_acre'
                      ? (isTamil ? '🌾 நிலத்தின் அளவு (ஏக்கர்):' : '🌾 Land Area (Acres):')
                      : (isTamil ? '⏱️ பயன்பாட்டு நேரம் (மணி நேரம்):' : '⏱️ Work Duration (Hours):')}
                  </Text>
                  <Text style={styles.stepperRateBadge}>
                    ₹{selectedItem.rate}/{selectedItem.unit === 'per_acre' ? 'acre' : 'hr'}
                  </Text>
                </View>

                {/* Counter Buttons */}
                <View style={styles.stepperControlRow}>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => setQuantityCount(Math.max(1, quantityCount - 1))}
                  >
                    <Minus size={20} color="#fff" />
                  </TouchableOpacity>

                  <View style={styles.stepValueBox}>
                    <Text style={styles.stepValueText}>
                      {quantityCount} {selectedItem.unit === 'per_acre' ? (isTamil ? 'ஏக்கர்' : 'Acres') : (isTamil ? 'மணி நேரம்' : 'Hours')}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => setQuantityCount(quantityCount + 1)}
                  >
                    <Plus size={20} color="#fff" />
                  </TouchableOpacity>
                </View>

                {/* Quick Selection Chips */}
                <View style={styles.quickChipsRow}>
                  {selectedItem.quickCounts?.map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={[styles.quickChip, quantityCount === c && styles.quickChipActive]}
                      onPress={() => setQuantityCount(c)}
                    >
                      <Text style={[styles.quickChipText, quantityCount === c && styles.quickChipTextActive]}>
                        {c} {selectedItem.unit === 'per_acre' ? 'Acre' : 'Hr'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* 5b. PACKAGE TIER SELECTOR (For Hourly Rental) */}
            {activeTab === 'package' && (
              <View style={styles.tierSelectorRow}>
                {[
                  { id: 'auto', name: 'AutoO', icon: '🛺' },
                  { id: 'sedan', name: 'Sedan', icon: '🚙' },
                  { id: 'suv', name: 'SUV 6-Seater', icon: '🚐' },
                  { id: 'tempo', name: 'Tempo 12S', icon: '🚌' },
                ].map((tier) => (
                  <TouchableOpacity
                    key={tier.id}
                    style={[styles.tierBtn, packageTier === tier.id && styles.tierBtnActive]}
                    onPress={() => setPackageTier(tier.id)}
                  >
                    <Text style={{ fontSize: 20 }}>{tier.icon}</Text>
                    <Text style={[styles.tierText, packageTier === tier.id && styles.tierTextActive]}>
                      {tier.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* 6. VEHICLE / MACHINERY CAROUSEL & LIST */}
            <Text style={styles.sectionHeader}>
              {activeTab === 'agri' && (isTamil ? '🌾 வேளாண் இயந்திரங்கள் & கருவிகள்:' : '🌾 Farm Machinery & Equipment:')}
              {activeTab === 'cargo' && (isTamil ? '🚚 சந்தை சரக்கு லாரிகள் & வாகனங்கள்:' : '🚚 Market & Goods Transport Trucks:')}
              {activeTab === 'package' && (isTamil ? '🚕 மணி நேர வாடகை திட்டங்கள்:' : '🚕 Hourly Rental Packages:')}
              {activeTab === 'tour' && (isTamil ? '🏔️ தமிழ்நாடு சுற்றுலா & ஆன்மீக பயணம்:' : '🏔️ Tamil Nadu Tour & Pilgrimage Packages:')}
            </Text>

            {/* Agri Machinery List */}
            {activeTab === 'agri' && (
              <View style={styles.gridList}>
                {AGRI_EQUIPMENT.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.itemCard, selectedItem?.id === item.id && styles.itemCardSelected]}
                    onPress={() => {
                      setSelectedItem(item);
                      setQuantityCount(item.minCount || 1);
                    }}
                  >
                    <Text style={styles.itemEmoji}>{item.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>{isTamil ? item.tamil : item.name}</Text>
                      <Text style={styles.itemSubName}>{isTamil ? item.name : item.tamil}</Text>
                      <Text style={styles.itemDesc}>{item.desc}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.itemPrice}>₹{item.rate}</Text>
                      <Text style={styles.itemUnit}>/{item.unit === 'per_acre' ? 'acre' : 'hr'}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Cargo Vehicles List */}
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
                      <Text style={styles.itemName}>{isTamil ? item.tamil : item.name}</Text>
                      <Text style={styles.itemSubName}>{isTamil ? item.name : item.tamil}</Text>
                      <Text style={styles.itemDesc}>📦 Capacity: {item.capacity} • {item.desc}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.itemPrice}>₹{item.base}</Text>
                      <Text style={styles.itemUnit}>+ ₹{item.perKm}/km</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Hourly Packages List */}
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
                      <Text style={styles.itemName}>{isTamil ? item.tamil : item.name}</Text>
                      <Text style={styles.itemDesc}>{item.desc}</Text>
                    </View>
                    <Text style={styles.itemPrice}>₹{item[packageTier] || item.sedan}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Tour Packages List */}
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
                      <Text style={styles.itemName}>{isTamil ? item.tamil : item.name}</Text>
                      <Text style={styles.itemSubName}>{item.duration}</Text>
                      <Text style={styles.itemDesc}>{item.desc}</Text>
                    </View>
                    <Text style={styles.itemPrice}>₹{item.rate}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* 7. SCHEDULE OR INSTANT BOOKING SWITCHER */}
            <View style={styles.scheduleBox}>
              <View style={styles.scheduleToggleRow}>
                <TouchableOpacity
                  style={[styles.scheduleToggleBtn, !isScheduled && styles.scheduleToggleBtnActive]}
                  onPress={() => setIsScheduled(false)}
                >
                  <Zap size={16} color={!isScheduled ? '#000' : '#94a3b8'} />
                  <Text style={[styles.scheduleToggleText, !isScheduled && styles.scheduleToggleTextActive]}>
                    {isTamil ? '⚡ உடனடி முன்பதிவு' : '⚡ Book for Now'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.scheduleToggleBtn, isScheduled && styles.scheduleToggleBtnActive]}
                  onPress={() => setIsScheduled(true)}
                >
                  <Calendar size={16} color={isScheduled ? '#000' : '#94a3b8'} />
                  <Text style={[styles.scheduleToggleText, isScheduled && styles.scheduleToggleTextActive]}>
                    {isTamil ? '📅 தேதி முன்பதிவு' : '📅 Schedule'}
                  </Text>
                </TouchableOpacity>
              </View>

              {isScheduled && (
                <View style={styles.slotChipsRow}>
                  {['Today (2:00 PM)', 'Tomorrow (6:00 AM)', 'Tomorrow (2:00 PM)', 'Next Day Morning'].map((slot) => (
                    <TouchableOpacity
                      key={slot}
                      style={[styles.slotChip, scheduledSlot === slot && styles.slotChipActive]}
                      onPress={() => setScheduledSlot(slot)}
                    >
                      <Text style={[styles.slotChipText, scheduledSlot === slot && styles.slotChipTextActive]}>
                        {slot}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* 8. PAYMENT METHOD TOGGLE */}
            <View style={styles.paymentMethodRow}>
              <TouchableOpacity
                style={[styles.payModeBtn, paymentMode === 'UPI' && styles.payModeBtnActive]}
                onPress={() => setPaymentMode('UPI')}
              >
                <Text style={[styles.payModeText, paymentMode === 'UPI' && styles.payModeTextActive]}>
                  ⚡ UPI (GPay / PhonePe)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.payModeBtn, paymentMode === 'CASH' && styles.payModeBtnActive]}
                onPress={() => setPaymentMode('CASH')}
              >
                <Text style={[styles.payModeText, paymentMode === 'CASH' && styles.payModeTextActive]}>
                  💵 {isTamil ? 'நேரடி பணம் (Cash)' : 'Cash to Operator'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* 9. FARE BREAKDOWN & CONFIRMATION BOX */}
            <View style={styles.confirmBox}>
              <View style={styles.fareRow}>
                <View>
                  <Text style={styles.fareLabel}>
                    {isTamil ? 'மதிப்பிடப்பட்ட மொத்த வாடகை கட்டணம்' : 'Est. Total Rental Fare'}
                  </Text>
                  <Text style={styles.fareSubText}>
                    {isTamil ? 'எரிபொருள், ஓட்டுனர் கட்டணம் & இயந்திரம் அடங்கும்' : 'Includes fuel, verified operator & machinery'}
                  </Text>
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
                    <Text style={styles.bookBtnText}>
                      {isTamil ? `முன்பதிவை உறுதி செய் • ₹${estimatedFare}` : `Confirm RentO Booking • ₹${estimatedFare}`}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* ─── ACTIVE BOOKING OVERLAY (SEARCHING, ACCEPTED, IN_PROGRESS, COMPLETED) ─── */}
        {bookingState !== 'IDLE' && (
          <View style={styles.activeBookingCard}>
            {/* 1. SEARCHING STATE */}
            {bookingState === 'SEARCHING' && activeBooking && (
              <View style={styles.searchingBox}>
                <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }] }]}>
                  <ActivityIndicator size="large" color={COLORS.green} />
                </Animated.View>
                <Text style={styles.searchingTitle}>
                  {isTamil ? 'அருகிலுள்ள ஓட்டுனர்களுக்கு தகவல் அனுப்பப்படுகிறது...' : 'Dispatching to Operator in TN...'}
                </Text>
                <Text style={styles.searchingSub}>
                  {isTamil
                    ? `WhatsApp & DriveO வழியாக தகவல் அனுப்பப்படுகிறது (${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, '0')} மீதம் • 5 நிமிடங்களில் தானாக காலாவதியாகும்)`
                    : `Alert dispatched to operator (${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, '0')} remaining • Auto-expires in 5 mins)`}
                </Text>

                {/* 1-Tap Direct WhatsApp Alert to Operator */}
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    backgroundColor: '#25D366',
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    borderRadius: 10,
                    width: '100%',
                    marginTop: 6,
                  }}
                  onPress={() =>
                    whatsappToPhone(
                      activeBooking.driver.phone,
                      `🚜 *New SuprO RentO Booking #${activeBooking.code}*\n\n` +
                      `👤 Customer: ${user?.name || 'Farmer'}\n` +
                      `🌾 Machinery: ${activeBooking.item?.name || 'Agri Equipment'}\n` +
                      `📍 Field Location: https://maps.google.com/?q=${location.latitude},${location.longitude}\n` +
                      `💰 Fare: ₹${activeBooking.fare}\n\n` +
                      `Please check your DriveO page in SuprO app to accept this booking.`
                    )
                  }
                >
                  <MessageSquare size={18} color="#fff" />
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>
                    {isTamil ? 'ஓட்டுனருக்கு WhatsApp தகவல் அனுப்புக' : 'Alert Operator on WhatsApp'}
                  </Text>
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', gap: 10, width: '100%', marginTop: 4 }}>
                  <TouchableOpacity
                    style={[styles.cancelSearchingBtn, { flex: 1 }]}
                    onPress={handleCancelBooking}
                  >
                    <Text style={styles.cancelSearchingText}>{isTamil ? 'ரத்து செய்' : 'Cancel Request'}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.cancelSearchingBtn,
                      { flex: 1, borderColor: COLORS.green, backgroundColor: `${COLORS.green}15` },
                    ]}
                    onPress={() => {
                      setCountdown(45);
                      handleConfirmBooking();
                    }}
                  >
                    <Text style={[styles.cancelSearchingText, { color: COLORS.green }]}>
                      {isTamil ? 'மீண்டும் தேடு' : 'Retry Dispatch'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* 2. ACCEPTED / IN_PROGRESS STATE */}
            {(bookingState === 'ACCEPTED' || bookingState === 'IN_PROGRESS') && activeBooking && (
              <>
                <View style={[styles.statusBadge, bookingState === 'IN_PROGRESS' && { backgroundColor: '#3b82f620' }]}>
                  <CheckCircle size={20} color={bookingState === 'IN_PROGRESS' ? COLORS.blue : COLORS.green} />
                  <Text style={[styles.statusBadgeText, bookingState === 'IN_PROGRESS' && { color: COLORS.blue }]}>
                    {bookingState === 'IN_PROGRESS'
                      ? (isTamil ? 'பணி / பயணம் நடப்பில் உள்ளது' : 'Machinery Work / Trip in Progress')
                      : (isTamil ? 'முன்பதிவு ஏற்கப்பட்டது & ஓட்டுனர் ஒதுக்கப்பட்டார்' : 'Rental Confirmed & Partner Assigned')}
                  </Text>
                </View>

                {/* OTP PIN CARD */}
                <View style={styles.otpCard}>
                  <Text style={styles.otpLabel}>
                    {isTamil ? 'பணியைத் தொடங்க 4-இலக்க பின் (OTP):' : 'Work / Start Trip PIN (OTP):'}
                  </Text>
                  <Text style={styles.otpVal}>{activeBooking.otp}</Text>
                  <Text style={styles.otpSub}>
                    {isTamil ? 'இயந்திரப் பணியைத் தொடங்க இந்த பின்னை ஓட்டுனரிடம் தெரிவிக்கவும்' : 'Share this 4-digit PIN with operator to start work'}
                  </Text>
                </View>

                {/* DRIVER / OPERATOR PROFILE CARD */}
                <View style={styles.driverCard}>
                  <View style={styles.driverAvatar}>
                    <Text style={{ fontSize: 24 }}>🚜</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.driverName}>{activeBooking.driver.name}</Text>
                    <Text style={styles.driverVehicle}>{activeBooking.driver.vehicle}</Text>
                    <Text style={styles.driverRating}>
                      ⭐ {activeBooking.driver.rating} Rating • 🛡️ {isTamil ? 'சரிபார்க்கப்பட்ட ஓட்டுனர்' : 'SuprO Verified'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.iconCallBtn}
                    onPress={() => callPhone(activeBooking.driver.phone)}
                  >
                    <Phone size={20} color="#000" />
                  </TouchableOpacity>
                </View>

                {/* ACTION BUTTONS (Share GPS, WhatsApp, Turn-by-Turn Navigate) */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.actionOutlineBtn}
                    onPress={() =>
                      shareLocationWhatsApp(
                        location.latitude,
                        location.longitude,
                        `Farm / Field GPS location for RentO booking #${activeBooking.code}`
                      )
                    }
                  >
                    <Share2 size={18} color={COLORS.green} />
                    <Text style={[styles.actionBtnText, { color: COLORS.green }]}>
                      {isTamil ? 'GPS பகிர்க' : 'Share Field GPS'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionOutlineBtn}
                    onPress={() =>
                      whatsappToPhone(
                        activeBooking.driver.phone,
                        `Hello, regarding RentO Booking #${activeBooking.code}. My field location: https://maps.google.com/?q=${location.latitude},${location.longitude}`
                      )
                    }
                  >
                    <MessageSquare size={18} color={COLORS.blue} />
                    <Text style={[styles.actionBtnText, { color: COLORS.blue }]}>WhatsApp</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionOutlineBtn}
                    onPress={() =>
                      openNativeNavigation(
                        bookingState === 'IN_PROGRESS' ? dropoffLocation.latitude : location.latitude,
                        bookingState === 'IN_PROGRESS' ? dropoffLocation.longitude : location.longitude,
                        'Field Location'
                      )
                    }
                  >
                    <Navigation size={18} color={COLORS.yellow} />
                    <Text style={[styles.actionBtnText, { color: COLORS.yellow }]}>
                      {isTamil ? 'திசைக்காட்டி' : 'Navigate'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* UPI PAYMENT BUTTON */}
                <TouchableOpacity
                  style={styles.upiBtn}
                  onPress={() =>
                    payViaUPI(
                      activeBooking.fare,
                      ADMIN_UPI,
                      'SuprO RentO',
                      activeBooking.code
                    )
                  }
                >
                  <IndianRupee size={18} color="#000" />
                  <Text style={styles.upiBtnText}>
                    {isTamil ? `UPI வழியாக ₹${activeBooking.fare} செலுத்தவும்` : `Pay ₹${activeBooking.fare} via UPI`}
                  </Text>
                </TouchableOpacity>

                {/* CANCEL BOOKING BUTTON */}
                <TouchableOpacity style={styles.cancelBookingBtn} onPress={handleCancelBooking}>
                  <XCircle size={18} color={COLORS.red} />
                  <Text style={styles.cancelBookingText}>
                    {isTamil ? 'வாடகை முன்பதிவை ரத்து செய்' : 'Cancel Rental Booking'}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* 3. COMPLETED STATE */}
            {bookingState === 'COMPLETED' && activeBooking && (
              <View style={styles.completedBox}>
                <CheckCircle size={48} color={COLORS.green} style={{ alignSelf: 'center', marginBottom: 12 }} />
                <Text style={styles.completedTitle}>
                  {isTamil ? 'பணி வெற்றிகரமாக முடிந்தது!' : 'Machinery Work Completed!'}
                </Text>
                <Text style={styles.completedFare}>₹{activeBooking.fare}</Text>

                {/* RATING STARS */}
                <View style={styles.ratingBox}>
                  <Text style={styles.ratingLabel}>
                    {isTamil ? 'ஓட்டுனருக்கு மதிப்பீடு வழங்கவும்:' : 'Rate your Operator / Driver:'}
                  </Text>
                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <TouchableOpacity key={s} onPress={() => setRating(s)}>
                        <Star
                          size={32}
                          color={s <= rating ? COLORS.yellow : '#475569'}
                          fill={s <= rating ? COLORS.yellow : 'transparent'}
                          style={{ marginHorizontal: 4 }}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TextInput
                  style={styles.reviewInput}
                  placeholder={isTamil ? 'கருத்துக்களைப் பகிரவும் (விருப்பத்தேர்வு)...' : 'Leave a review / feedback (optional)...'}
                  placeholderTextColor="#64748b"
                  value={review}
                  onChangeText={setReview}
                />

                <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                  <TouchableOpacity
                    style={[styles.primaryBtnDone, { flex: 1 }]}
                    onPress={handleSubmitRating}
                  >
                    <Text style={styles.primaryBtnDoneText}>{isTamil ? 'முடிந்தது' : 'Done'}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.upiBtn, { flex: 1.2 }]}
                    onPress={() =>
                      payViaUPI(
                        activeBooking.fare,
                        ADMIN_UPI,
                        'SuprO RentO',
                        activeBooking.code
                      )
                    }
                  >
                    <IndianRupee size={18} color="#000" />
                    <Text style={styles.upiBtnText}>Pay ₹{activeBooking.fare}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
      )}
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
    paddingTop: Platform.OS === 'ios' ? 52 : 38,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: 'rgba(17, 24, 39, 0.92)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 15,
  },
  backBtn: {
    padding: 6,
    marginRight: 8,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
  },
  headerSub: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 1,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    fontSize: 11,
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
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0a0f1e',
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
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
  },
  dropMarker: {
    backgroundColor: '#f59e0b',
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
  },
  operatorMapPin: {
    backgroundColor: '#1e293b',
    padding: 5,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#10b981',
    elevation: 4,
  },
  tabRowFloating: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 98 : 88,
    left: 12,
    right: 12,
    zIndex: 12,
    flexDirection: 'row',
    backgroundColor: 'rgba(17, 24, 39, 0.94)',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  mapFloatingBar: {
    position: 'absolute',
    bottom: 128,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  routePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(17, 24, 39, 0.92)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  routePillText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  gpsBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
  },
  compactBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(17, 24, 39, 0.96)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    zIndex: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  compactSelectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  selectedItemPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  selectedItemName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  selectedItemSub: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '600',
  },
  changeOptionsText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  compactStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  miniStepBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniStepVal: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 8,
  },
  compactBookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    borderRadius: 12,
    height: 44,
    shadowColor: '#10b981',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    gap: 6,
  },
  compactBookBtnText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sheetContainerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(10, 15, 30, 0.98)',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 14,
    paddingTop: 8,
    zIndex: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  collapseBar: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 4,
  },
  collapseHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#475569',
    marginBottom: 6,
  },
  collapseText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sheetContainer: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
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
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
  tabTextActive: {
    color: '#000',
    fontWeight: 'bold',
  },
  locationCard: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 10,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  locationInput: {
    color: '#fff',
    fontSize: 14,
    paddingVertical: 4,
  },
  searchSubmitBtn: {
    backgroundColor: '#10b981',
    padding: 6,
    borderRadius: 8,
  },
  gpsSmallBtn: {
    padding: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#1e293b',
    marginVertical: 8,
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
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#cbd5e1',
    marginTop: 6,
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
  presetChipActive: {
    backgroundColor: '#10b98125',
    borderColor: '#10b981',
  },
  presetChipText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
  },
  presetChipTextActive: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  stepperContainer: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 12,
  },
  stepperHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  stepperTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#cbd5e1',
  },
  stepperRateBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#10b981',
    backgroundColor: '#10b98115',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  stepperControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 10,
  },
  stepBtn: {
    backgroundColor: '#1e293b',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  stepValueBox: {
    backgroundColor: '#0a0f1e',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#10b981',
    minWidth: 140,
    alignItems: 'center',
  },
  stepValueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quickChipsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  quickChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  quickChipActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  quickChipText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  quickChipTextActive: {
    color: '#000',
    fontWeight: 'bold',
  },
  tierSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tierBtn: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 4,
  },
  tierBtnActive: {
    backgroundColor: '#10b98115',
    borderColor: '#10b981',
  },
  tierText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  tierTextActive: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  gridList: {
    gap: 10,
    marginBottom: 14,
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
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  itemSubName: {
    fontSize: 11,
    color: '#10b981',
    marginTop: 1,
  },
  itemDesc: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  itemUnit: {
    fontSize: 10,
    color: '#94a3b8',
  },
  scheduleBox: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 12,
  },
  scheduleToggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  scheduleToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1e293b',
    gap: 6,
  },
  scheduleToggleBtnActive: {
    backgroundColor: '#10b981',
  },
  scheduleToggleText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  scheduleToggleTextActive: {
    color: '#000',
    fontWeight: 'bold',
  },
  slotChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  slotChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  slotChipActive: {
    backgroundColor: '#10b98120',
    borderColor: '#10b981',
  },
  slotChipText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  slotChipTextActive: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  paymentMethodRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  payModeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
  },
  payModeBtnActive: {
    backgroundColor: '#10b98115',
    borderColor: '#10b981',
  },
  payModeText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  payModeTextActive: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  confirmBox: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#10b981',
    marginTop: 4,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  fareLabel: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
  },
  fareSubText: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
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
    fontSize: 15,
    fontWeight: 'bold',
  },
  activeBookingCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#10b981',
    gap: 14,
    marginTop: 6,
  },
  searchingBox: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  pulseCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10b98120',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchingTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  searchingSub: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
  cancelSearchingBtn: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  cancelSearchingText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: 'bold',
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
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  driverVehicle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 1,
  },
  driverRating: {
    fontSize: 11,
    color: '#f59e0b',
    marginTop: 2,
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
    gap: 8,
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
    fontSize: 12,
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
    paddingVertical: 6,
  },
  cancelBookingText: {
    color: '#ef4444',
    fontSize: 12,
  },
  completedBox: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  completedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  completedFare: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10b981',
    marginVertical: 8,
  },
  ratingBox: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 12,
  },
  ratingLabel: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 8,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  reviewInput: {
    width: '100%',
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 12,
    color: '#fff',
    fontSize: 13,
    marginBottom: 14,
  },
  primaryBtnDone: {
    backgroundColor: '#1e293b',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  primaryBtnDoneText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
