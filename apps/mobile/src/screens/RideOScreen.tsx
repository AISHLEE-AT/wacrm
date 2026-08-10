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
  SafeAreaView,
  KeyboardAvoidingView,
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
  CreditCard,
  Banknote,
  MoreHorizontal,
  ChevronRight,
  Menu,
} from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { AppContext } from '../context/AppContext';

const { width, height } = Dimensions.get('window');

const API_BASE_URL = 'https://watscrm.vercel.app';
const ADMIN_UPI = '9486335870@hdfcbank';
const COLORS = {
  bg: '#0a0f1e',
  card: '#111827',
  cardLight: '#1e293b',
  green: '#10b981',
  red: '#ef4444',
  text: '#ffffff',
  textMuted: '#94a3b8',
  border: '#334155',
  overlay: 'rgba(0,0,0,0.6)',
};

const SERVICE_TYPES = ['Daily', 'Rental', 'Outstation', 'Cargo'];

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

export default function RideOScreen({ navigation }) {
  const mapRef = useRef(null);
  const { user } = useContext(AppContext);

  // States
  const [activeTab, setActiveTab] = useState('Daily');
  const [location, setLocation] = useState(null);
  const [pickupAddress, setPickupAddress] = useState('Fetching location...');
  const [dropoffQuery, setDropoffQuery] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState(null);
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [nearbyDrivers, setNearbyDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  
  // Categories and Fares
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [fareEstimate, setFareEstimate] = useState(null);
  const [paymentMode, setPaymentMode] = useState('UPI'); // 'UPI' | 'CASH'
  const [rentalPackages, setRentalPackages] = useState([]);
  
  // Ride State Machine: 'IDLE' | 'SEARCHING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED'
  const [rideState, setRideState] = useState('IDLE');
  const [currentRide, setCurrentRide] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Rating State
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');

  // Initial Location & Data Fetch
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Allow location access to book a ride.');
        return;
      }

      let currentLoc = await Location.getCurrentPositionAsync({});
      setLocation(currentLoc.coords);
      
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: currentLoc.coords.latitude,
          longitude: currentLoc.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }

      // Reverse geocode pickup
      let geocode = await Location.reverseGeocodeAsync({
        latitude: currentLoc.coords.latitude,
        longitude: currentLoc.coords.longitude,
      });
      if (geocode && geocode.length > 0) {
        setPickupAddress(`${geocode[0].name || ''}, ${geocode[0].street || ''}, ${geocode[0].city || ''}`.replace(/^, |, $/g, ''));
      }

      fetchCategories();
      fetchNearbyDrivers(currentLoc.coords.latitude, currentLoc.coords.longitude);
    })();
  }, []);

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/rides/categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
        if (data.categories?.length > 0) setSelectedCategory(data.categories[0].id);
      } else {
        // Fallback mock data
        setCategories([
          { id: 'bike', name: 'BikeO', icon: '🏍', minFare: 25 },
          { id: 'auto', name: 'AutoO', icon: '🛺', minFare: 45 },
          { id: 'mini', name: 'Mini', icon: '🚕', minFare: 89 },
          { id: 'sedan', name: 'Sedan', icon: '🚘', minFare: 129 },
          { id: 'suv', name: 'SUV', icon: '🚙', minFare: 199 },
          { id: 'cargo', name: 'Cargo', icon: '📦', minFare: 99 },
        ]);
        setSelectedCategory('bike');
      }
    } catch (e) {
      console.log('Error fetching categories', e);
    }
  };

  // Fetch Nearby Drivers via Supabase RPC
  const fetchNearbyDrivers = async (lat, lng) => {
    try {
      const { data, error } = await supabase.rpc('get_nearby_drivers', {
        pickup_lat: lat,
        pickup_lon: lng,
        radius_km: 5,
      });
      if (!error && data) {
        setNearbyDrivers(data);
      }
    } catch (e) {
      console.log('Error fetching drivers', e);
    }
  };

  // Fetch Fare Estimate
  const fetchFareEstimate = async (dropLat, dropLng) => {
    if (!location || !selectedCategory) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/rides/estimate?pickup_lat=${location.latitude}&pickup_lng=${location.longitude}&dropoff_lat=${dropLat}&dropoff_lng=${dropLng}&category=${selectedCategory}`);
      let estimatedData;
      if (res.ok) {
        estimatedData = await res.json();
        setFareEstimate(estimatedData);
      } else {
        // Mock estimate
        const distKm = getDistance(location.latitude, location.longitude, dropLat, dropLng);
        const base = selectedCategory === 'bike' ? 15 : selectedCategory === 'auto' ? 30 : 50;
        const pKm = selectedCategory === 'bike' ? 8 : selectedCategory === 'auto' ? 14 : 16;
        const totalFare = Math.max(
          selectedCategory === 'bike' ? 25 : selectedCategory === 'auto' ? 45 : 89,
          Math.round(base + Math.max(0, distKm - 1.5) * pKm)
        );

        estimatedData = {
          baseFare: base,
          distanceFare: Math.round(Math.max(0, distKm - 1.5) * pKm),
          timeFare: 0,
          platformFee: 0,
          total: totalFare,
          distanceText: `${distKm.toFixed(1)} km`,
          durationText: 'N/A'
        };
        setFareEstimate(estimatedData);
      }
      
      // OSRM route fetch
      try {
        const osrmRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${location.longitude},${location.latitude};${dropLng},${dropLat}?overview=full&geometries=geojson`);
        if (osrmRes.ok) {
          const osrmData = await osrmRes.json();
          if (osrmData.routes && osrmData.routes.length > 0) {
            const coords = osrmData.routes[0].geometry.coordinates.map(coord => ({
              latitude: coord[1],
              longitude: coord[0]
            }));
            setRouteCoordinates(coords);
          } else {
            setRouteCoordinates([
              { latitude: location.latitude, longitude: location.longitude },
              { latitude: dropLat, longitude: dropLng }
            ]);
          }
        } else {
          setRouteCoordinates([
            { latitude: location.latitude, longitude: location.longitude },
            { latitude: dropLat, longitude: dropLng }
          ]);
        }
      } catch (osrmError) {
        setRouteCoordinates([
          { latitude: location.latitude, longitude: location.longitude },
          { latitude: dropLat, longitude: dropLng }
        ]);
      }
    } catch (e) {
      console.log('Estimate error', e);
    } finally {
      setLoading(false);
    }
  };

  // Handle Dropoff Search
  const handleDropoffSearch = async () => {
    if (!dropoffQuery) return;
    try {
      const geocoded = await Location.geocodeAsync(dropoffQuery);
      if (geocoded && geocoded.length > 0) {
        const { latitude, longitude } = geocoded[0];
        setDropoffLocation({ latitude, longitude });
        setDropoffAddress(dropoffQuery);
        fetchFareEstimate(latitude, longitude);
        
        if (mapRef.current && location) {
          mapRef.current.fitToCoordinates(
            [
              { latitude: location.latitude, longitude: location.longitude },
              { latitude, longitude }
            ],
            { edgePadding: { top: 100, right: 50, bottom: 400, left: 50 }, animated: true }
          );
        }
      } else {
        Alert.alert('Location not found', 'Try a different search term.');
      }
    } catch (e) {
      Alert.alert('Search Error', 'Could not find location.');
    }
  };

  // Subscribe to Ride Updates
  useEffect(() => {
    if (currentRide && currentRide.id) {
      const channel = supabase
        .channel(`ride-${currentRide.id}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'rides', filter: `id=eq.${currentRide.id}` },
          (payload) => {
            console.log('Ride update:', payload.new);
            const status = payload.new.status;
            if (status === 'accepted') {
              (async () => {
                const { data: driverData } = await supabase.from('drivers').select('*').eq('id', payload.new.driver_id).single();
                setCurrentRide(prev => ({ ...prev, ...payload.new, driverInfo: driverData }));
                setRideState('ACCEPTED');
              })();
            } else if (status === 'in_progress') {
              setCurrentRide(prev => ({ ...prev, ...payload.new }));
              setRideState('IN_PROGRESS');
            } else if (status === 'completed') {
              setCurrentRide(prev => ({ ...prev, ...payload.new }));
              setRideState('COMPLETED');
            } else if (status === 'cancelled') {
              setRideState('IDLE');
              Alert.alert('Ride Cancelled', 'The ride was cancelled.');
            }
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [currentRide?.id]);

  // Book Ride
  const handleBookRide = async () => {
    if (!location || !dropoffLocation) {
      Alert.alert('Error', 'Please enter a destination.');
      return;
    }
    
    setLoading(true);
    try {
      const payload = {
        pickup_lat: location.latitude,
        pickup_lng: location.longitude,
        dropoff_lat: dropoffLocation.latitude,
        dropoff_lng: dropoffLocation.longitude,
        pickup_address: pickupAddress,
        dropoff_address: dropoffAddress,
        category: selectedCategory,
        fare: fareEstimate?.total || 50,
        payment_mode: paymentMode.toLowerCase(),
        passenger_phone: user?.phone || ''
      };

      if (selectedDriver) {
        payload.driver_id = selectedDriver.id;
      }

      const res = await fetch(`${API_BASE_URL}/api/rides/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const responseData = await res.json();
      
      if (!res.ok) {
        throw new Error(responseData.error || 'Failed to request ride');
      }

      setRideState('SEARCHING');
      setCurrentRide(responseData.ride || responseData);
      setLoading(false);
      
    } catch (e) {
      console.error(e);
      Alert.alert('Booking Error', 'Could not request ride. ' + e.message);
      setLoading(false);
    }
  };

  const confirmCancel = async (reason) => {
    try {
      await fetch(`${API_BASE_URL}/api/rides/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ride_id: currentRide?.id, cancelled_by: 'passenger', reason })
      });
      setRideState('IDLE');
      setCurrentRide(null);
    } catch (e) {
      console.log('Error cancelling', e);
      setRideState('IDLE');
      setCurrentRide(null);
    }
  };

  const handleCancelRide = () => {
    if (rideState === 'SEARCHING' || rideState === 'ACCEPTED') {
      Alert.alert('Cancel Ride', 'Why are you cancelling?', [
        { text: 'Changed my plans', onPress: () => confirmCancel('Changed my plans') },
        { text: 'Driver too far away', onPress: () => confirmCancel('Driver too far away') },
        { text: 'Found another ride', onPress: () => confirmCancel('Found another ride') },
        { text: 'Other', onPress: () => confirmCancel('Other') },
        { text: 'Back', style: 'cancel' }
      ]);
    } else {
      setRideState('IDLE');
      setCurrentRide(null);
    }
  };

  const openSOS = () => {
    Linking.openURL('tel:112');
    const message = `EMERGENCY SOS! My live location: https://maps.google.com/?q=${location?.latitude},${location?.longitude}`;
    Linking.openURL(`whatsapp://send?text=${encodeURIComponent(message)}`);
  };

  const shareTrip = () => {
    const message = `Track my ride! https://maps.google.com/?q=${location?.latitude},${location?.longitude}`;
    Linking.openURL(`whatsapp://send?text=${encodeURIComponent(message)}`);
  };

  const payViaUPI = () => {
    const upiId = currentRide?.driverInfo?.upi_id || currentRide?.driver?.upi_id;
    const name = currentRide?.driverInfo?.name || currentRide?.driver?.name || 'Driver';
    if (!upiId) return;
    const url = `upi://pay?pa=${upiId}&pn=${name}&am=${currentRide?.fare}&cu=INR`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'No UPI app found on your phone.');
    });
  };

  const submitRating = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/rides/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ride_id: currentRide?.id, rating, review })
      });
    } catch (e) {
      console.log('Rating error', e);
    }
    setRideState('IDLE');
    setCurrentRide(null);
    setDropoffLocation(null);
    setDropoffQuery('');
    setRouteCoordinates([]);
    setFareEstimate(null);
    setReview('');
    Alert.alert('Thank You', 'Your rating has been submitted.');
  };

  // UI Renderers
  const renderTopTabs = () => (
    <View style={styles.tabsContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
        {SERVICE_TYPES.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputWrapper}>
        <View style={styles.searchDot} />
        <Text style={styles.searchAddressText} numberOfLines={1}>{pickupAddress}</Text>
      </View>
      <View style={styles.searchDivider} />
      <View style={styles.searchInputWrapper}>
        <View style={[styles.searchDot, { backgroundColor: COLORS.red }]} />
        <TextInput
          style={styles.searchInput}
          placeholder="Where to?"
          placeholderTextColor={COLORS.textMuted}
          value={dropoffQuery}
          onChangeText={setDropoffQuery}
          onSubmitEditing={handleDropoffSearch}
          returnKeyType="search"
        />
        {dropoffQuery.length > 0 && (
          <TouchableOpacity onPress={() => setDropoffQuery('')} style={{ padding: 4 }}>
            <X color={COLORS.textMuted} size={16} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderCategoryCarousel = () => (
    <View style={styles.carouselContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id || cat.name}
            style={[styles.categoryCard, selectedCategory === (cat.id || cat.name) && styles.categoryCardSelected]}
            onPress={() => {
              setSelectedCategory(cat.id || cat.name);
              if (dropoffLocation) fetchFareEstimate(dropoffLocation.latitude, dropoffLocation.longitude);
            }}
          >
            <Text style={styles.categoryIcon}>{cat.icon}</Text>
            <Text style={styles.categoryName}>{cat.name}</Text>
            <Text style={styles.categoryFare}>₹{cat.minFare || '--'}</Text>
            <Text style={styles.categoryTime}>3 min</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderFareCard = () => {
    if (!fareEstimate) return null;
    return (
      <View style={styles.fareCard}>
        <View style={styles.fareRow}>
          <Text style={styles.fareLabel}>Distance ({fareEstimate.distanceText})</Text>
          <Text style={styles.fareValue}>₹{fareEstimate.distanceFare}</Text>
        </View>
        <View style={styles.fareRow}>
          <Text style={styles.fareLabel}>Time ({fareEstimate.durationText})</Text>
          <Text style={styles.fareValue}>₹{fareEstimate.timeFare}</Text>
        </View>
        <View style={styles.fareRow}>
          <Text style={styles.fareLabel}>Base Fare</Text>
          <Text style={styles.fareValue}>₹{fareEstimate.baseFare}</Text>
        </View>
        <View style={styles.fareDivider} />
        <View style={styles.fareRow}>
          <Text style={styles.fareLabelBold}>Total Fare</Text>
          <Text style={styles.fareValueBold}>₹{Math.round(fareEstimate.total)}</Text>
        </View>

        <View style={styles.paymentModeContainer}>
          <TouchableOpacity 
            style={[styles.paymentBtn, paymentMode === 'CASH' && styles.paymentBtnActive]}
            onPress={() => setPaymentMode('CASH')}
          >
            <Banknote size={18} color={paymentMode === 'CASH' ? COLORS.bg : COLORS.green} />
            <Text style={[styles.paymentBtnText, paymentMode === 'CASH' && styles.paymentBtnTextActive]}>Cash</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.paymentBtn, paymentMode === 'UPI' && styles.paymentBtnActive]}
            onPress={() => setPaymentMode('UPI')}
          >
            <CreditCard size={18} color={paymentMode === 'UPI' ? COLORS.bg : COLORS.green} />
            <Text style={[styles.paymentBtnText, paymentMode === 'UPI' && styles.paymentBtnTextActive]}>UPI QR</Text>
          </TouchableOpacity>
        </View>

        {/* DRIVER SELECTION */}
        <View style={{ marginTop: 16 }}>
          <Text style={{ color: COLORS.textMuted, marginBottom: 8, fontWeight: 'bold' }}>Select a Driver (Optional):</Text>
          {nearbyDrivers.filter(d => (d.vehicle_type || '').toLowerCase() === (selectedCategory || '').toLowerCase() || selectedCategory === 'auto' && (d.vehicle_type || '').toLowerCase() === 'autoo' || selectedCategory === 'bike' && (d.vehicle_type || '').toLowerCase() === 'bikeo').length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {nearbyDrivers
                .filter(d => (d.vehicle_type || '').toLowerCase() === (selectedCategory || '').toLowerCase() || selectedCategory === 'auto' && (d.vehicle_type || '').toLowerCase() === 'autoo' || selectedCategory === 'bike' && (d.vehicle_type || '').toLowerCase() === 'bikeo' || true)
                .map(d => (
                <TouchableOpacity 
                  key={d.id} 
                  style={[
                    styles.driverSelectCard, 
                    selectedDriver?.id === d.id && styles.driverSelectCardActive
                  ]}
                  onPress={() => setSelectedDriver(d)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={styles.driverAvatar}>
                      <Text style={{ fontSize: 20 }}>{d.vehicle_type?.toLowerCase() === 'bike' ? '🏍' : '🛺'}</Text>
                    </View>
                    <View style={{ marginLeft: 12 }}>
                      <Text style={styles.driverNameText}>{d.name}</Text>
                      <Text style={styles.driverDetailText}>{d.vehicle_model || d.vehicle_type} ({d.rating || '4.5'}★)</Text>
                      <Text style={styles.driverDetailText}>{d.distance_km ? `${d.distance_km.toFixed(1)} km away` : 'Nearby'}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <Text style={{ color: COLORS.textMuted, fontSize: 13, fontStyle: 'italic' }}>Auto-assign will find the nearest driver...</Text>
          )}
          {nearbyDrivers.length > 0 && !nearbyDrivers.find(d => (d.vehicle_type || '').toLowerCase() === (selectedCategory || '').toLowerCase()) && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginTop: 8}}>
              {nearbyDrivers.map(d => (
                <TouchableOpacity 
                  key={d.id} 
                  style={[styles.driverSelectCard, selectedDriver?.id === d.id && styles.driverSelectCardActive]}
                  onPress={() => setSelectedDriver(d)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={styles.driverAvatar}>
                      <Text style={{ fontSize: 20 }}>{d.vehicle_type?.toLowerCase() === 'bike' ? '🏍' : '🛺'}</Text>
                    </View>
                    <View style={{ marginLeft: 12 }}>
                      <Text style={styles.driverNameText}>{d.name}</Text>
                      <Text style={styles.driverDetailText}>{d.vehicle_model || d.vehicle_type} ({d.rating || '4.5'}★)</Text>
                      <Text style={styles.driverDetailText}>{d.distance_km ? `${d.distance_km.toFixed(1)} km away` : 'Nearby'}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        <TouchableOpacity 
          style={styles.bookBtn} 
          onPress={handleBookRide} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.bg} />
          ) : (
            <Text style={styles.bookBtnText}>Book {selectedCategory} • ₹{Math.round(fareEstimate?.total || 0)}</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderSearching = () => (
    <View style={styles.sheetContent}>
      <ActivityIndicator size="large" color={COLORS.green} style={{ marginBottom: 16 }} />
      <Text style={styles.sheetTitle}>Looking for drivers...</Text>
      <Text style={styles.sheetSubtitle}>Contacting nearby {selectedCategory} partners</Text>
      <TouchableOpacity style={styles.cancelBtnOutline} onPress={handleCancelRide}>
        <Text style={styles.cancelBtnText}>Cancel Search</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAccepted = () => (
    <View style={styles.sheetContent}>
      <View style={styles.driverHeader}>
        <View style={styles.driverInfo}>
          <Text style={styles.driverName}>{currentRide?.driverInfo?.name || currentRide?.driver?.name}</Text>
          <Text style={styles.driverVehicle}>{currentRide?.driverInfo?.vehicle_model || currentRide?.driver?.vehicle}</Text>
          <View style={styles.ratingBadge}>
            <Star size={12} color={COLORS.bg} fill={COLORS.bg} />
            <Text style={styles.ratingText}>{currentRide?.driverInfo?.rating || currentRide?.driver?.rating || '4.5'}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.callCircle} onPress={() => Linking.openURL(`tel:${currentRide?.driverInfo?.phone || currentRide?.driver?.phone}`)}>
          <Phone size={20} color={COLORS.bg} fill={COLORS.bg} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.otpBox}>
        <Text style={styles.otpLabel}>Share OTP with driver to start</Text>
        <Text style={styles.otpValue}>{currentRide?.otp}</Text>
      </View>
      
      <View style={styles.driverActionsRow}>
        <TouchableOpacity style={styles.actionBtnDark} onPress={shareTrip}>
          <Share2 size={18} color={COLORS.text} />
          <Text style={styles.actionBtnTextDark}>Share Trip</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtnDark} onPress={openSOS}>
          <Shield size={18} color={COLORS.red} />
          <Text style={styles.actionBtnTextDark}>SOS</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.paymentUpiBtn} onPress={payViaUPI}>
        <Text style={styles.paymentUpiBtnText}>Pay ₹{currentRide?.fare} via UPI</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelBtnOutline} onPress={handleCancelRide}>
        <Text style={styles.cancelBtnText}>Cancel Ride</Text>
      </TouchableOpacity>
    </View>
  );

  const renderInProgress = () => (
    <View style={styles.sheetContent}>
      <View style={styles.driverHeader}>
        <View style={styles.driverInfo}>
          <Text style={styles.driverName}>{currentRide?.driverInfo?.name || currentRide?.driver?.name}</Text>
          <Text style={styles.driverVehicle}>{currentRide?.driverInfo?.vehicle_model || currentRide?.driver?.vehicle}</Text>
          <View style={styles.ratingBadge}>
            <Star size={12} color={COLORS.bg} fill={COLORS.bg} />
            <Text style={styles.ratingText}>{currentRide?.driverInfo?.rating || currentRide?.driver?.rating || '4.5'}</Text>
          </View>
        </View>
      </View>
      
      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        <Text style={{ color: COLORS.green, fontSize: 18, fontWeight: 'bold' }}>Trip in Progress</Text>
        <Animated.View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.green, marginTop: 8 }} />
      </View>
      
      <View style={{ width: '100%', marginBottom: 20 }}>
        <Text style={{ color: COLORS.text, fontSize: 14 }}>From: {currentRide?.pickup_location || pickupAddress}</Text>
        <Text style={{ color: COLORS.text, fontSize: 14, marginTop: 4 }}>To: {currentRide?.drop_location || dropoffAddress}</Text>
      </View>

      <View style={styles.driverActionsRow}>
        <TouchableOpacity style={styles.actionBtnDark} onPress={shareTrip}>
          <Share2 size={18} color={COLORS.text} />
          <Text style={styles.actionBtnTextDark}>Share Trip</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtnDark} onPress={openSOS}>
          <Shield size={18} color={COLORS.red} />
          <Text style={styles.actionBtnTextDark}>SOS</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.paymentUpiBtn} onPress={payViaUPI}>
        <Text style={styles.paymentUpiBtnText}>Pay ₹{currentRide?.fare || fareEstimate?.total} via UPI</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCompleted = () => (
    <View style={styles.sheetContent}>
      <View style={styles.successCircle}>
        <CheckCircle size={40} color={COLORS.green} />
      </View>
      <Text style={styles.sheetTitle}>Trip Completed!</Text>
      <Text style={styles.fareAmountLarge}>₹{currentRide?.fare}</Text>
      
      <View style={styles.ratingContainer}>
        <Text style={styles.ratingLabel}>How was your ride?</Text>
        <View style={styles.starsRow}>
          {[1,2,3,4,5].map(s => (
            <TouchableOpacity key={s} onPress={() => setRating(s)} style={{ padding: 8 }}>
              <Star size={32} color={s <= rating ? '#eab308' : COLORS.border} fill={s <= rating ? '#eab308' : 'transparent'} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <TextInput
        style={{ backgroundColor: COLORS.cardLight, color: COLORS.text, width: '100%', padding: 12, borderRadius: 8, marginBottom: 16 }}
        placeholder="Leave a review..."
        placeholderTextColor={COLORS.textMuted}
        value={review}
        onChangeText={setReview}
      />
      
      <TouchableOpacity style={styles.bookBtn} onPress={submitRating}>
        <Text style={styles.bookBtnText}>Submit & Close</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={true}
        customMapStyle={mapStyleDark}
      >
        {location && !dropoffLocation && (
          <Marker coordinate={location}>
            <View style={styles.pickupMarker}>
              <View style={styles.pickupMarkerInner} />
            </View>
          </Marker>
        )}
        
        {dropoffLocation && (
          <Marker coordinate={dropoffLocation}>
            <View style={styles.dropoffMarker}>
              <MapPin color="#fff" size={16} />
            </View>
          </Marker>
        )}

        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor={COLORS.green}
            strokeWidth={4}
          />
        )}
      </MapView>

      <SafeAreaView style={styles.topOverlay} pointerEvents="box-none">
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuBtn} onPress={() => navigation?.openDrawer?.()}>
            <Menu color={COLORS.text} size={24} />
          </TouchableOpacity>
          {renderTopTabs()}
        </View>
        {rideState === 'IDLE' && renderSearchBar()}
      </SafeAreaView>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.bottomSheetContainer} pointerEvents="box-none">
        <View style={styles.bottomSheet}>
          <View style={styles.dragHandle} />
          {rideState === 'IDLE' && (
            <ScrollView showsVerticalScrollIndicator={false}>
              {renderCategoryCarousel()}
              {renderFareCard()}
            </ScrollView>
          )}
          {rideState === 'SEARCHING' && renderSearching()}
          {rideState === 'ACCEPTED' && renderAccepted()}
          {rideState === 'IN_PROGRESS' && renderInProgress()}
          {rideState === 'COMPLETED' && renderCompleted()}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const mapStyleDark = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
  { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
  { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] }
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  menuBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  tabsContainer: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 22,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  tabsScroll: {
    paddingHorizontal: 4,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    marginRight: 4,
  },
  tabActive: {
    backgroundColor: COLORS.cardLight,
  },
  tabText: {
    color: COLORS.textMuted,
    fontWeight: '600',
    fontSize: 14,
  },
  tabTextActive: {
    color: COLORS.text,
  },
  searchContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
  },
  searchDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.green,
    marginRight: 12,
  },
  searchAddressText: {
    color: COLORS.text,
    fontSize: 15,
    flex: 1,
  },
  searchDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
    marginLeft: 20,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    height: '100%',
  },
  bottomSheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
    minHeight: 300,
    maxHeight: height * 0.7,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginVertical: 12,
  },
  carouselContainer: {
    marginVertical: 12,
  },
  categoryCard: {
    width: 100,
    height: 120,
    backgroundColor: COLORS.cardLight,
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  categoryCardSelected: {
    borderColor: COLORS.green,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  driverSelectCard: {
    backgroundColor: COLORS.cardLight,
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    minWidth: 200,
  },
  driverSelectCardActive: {
    borderColor: COLORS.green,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  driverAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverNameText: {
    color: COLORS.text,
    fontWeight: 'bold',
    fontSize: 15,
  },
  driverDetailText: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  categoryName: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 4,
  },
  categoryFare: {
    color: COLORS.text,
    fontSize: 13,
  },
  categoryTime: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 4,
  },
  fareCard: {
    padding: 20,
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
  fareLabelBold: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  fareValueBold: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  paymentModeContainer: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 20,
    gap: 12,
  },
  paymentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  paymentBtnActive: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.green,
  },
  paymentBtnText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  paymentBtnTextActive: {
    color: COLORS.bg,
  },
  bookBtn: {
    backgroundColor: COLORS.green,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  bookBtnText: {
    color: COLORS.bg,
    fontWeight: 'bold',
    fontSize: 16,
  },
  sheetContent: {
    padding: 24,
    alignItems: 'center',
  },
  sheetTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sheetSubtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginBottom: 24,
  },
  cancelBtnOutline: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.red,
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
  },
  cancelBtnText: {
    color: COLORS.red,
    fontWeight: '600',
  },
  driverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
    backgroundColor: COLORS.cardLight,
    padding: 16,
    borderRadius: 16,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  driverVehicle: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginBottom: 8,
  },
  ratingBadge: {
    backgroundColor: COLORS.green,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  ratingText: {
    color: COLORS.bg,
    fontWeight: 'bold',
    fontSize: 12,
  },
  callCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBox: {
    backgroundColor: COLORS.cardLight,
    padding: 20,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.green,
  },
  otpLabel: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginBottom: 8,
  },
  otpValue: {
    color: COLORS.green,
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 8,
  },
  driverActionsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 16,
  },
  actionBtnDark: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cardLight,
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionBtnTextDark: {
    color: COLORS.text,
    fontWeight: '600',
  },
  paymentUpiBtn: {
    backgroundColor: COLORS.green,
    padding: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  paymentUpiBtnText: {
    color: COLORS.bg,
    fontWeight: 'bold',
    fontSize: 16,
  },
  pickupMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickupMarkerInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.green,
  },
  dropoffMarker: {
    backgroundColor: COLORS.red,
    padding: 8,
    borderRadius: 20,
  },
  successCircle: {
    marginBottom: 16,
  },
  fareAmountLarge: {
    color: COLORS.text,
    fontSize: 36,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  ratingLabel: {
    color: COLORS.textMuted,
    fontSize: 16,
    marginBottom: 12,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
  }
});
