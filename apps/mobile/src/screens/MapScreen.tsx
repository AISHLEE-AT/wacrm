import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, TouchableOpacity, TextInput, Linking, Keyboard } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { MapPin, Search, Navigation, MessageCircle } from 'lucide-react-native';

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [pickup, setPickup] = useState<{ lat: number, lng: number, name: string } | null>(null);
  const [dropoff, setDropoff] = useState<{ lat: number, lng: number, name: string } | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const mapRef = useRef<MapView>(null);
  const WABA_NUMBER = '916381029380'; // Default central CRM bot number

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      // Get current location
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);

      // Reverse geocode to get street name for free!
      try {
        const geocode = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude
        });
        
        let name = 'Current Location';
        if (geocode.length > 0) {
          const g = geocode[0];
          name = `${g.name || g.street || ''}, ${g.city || g.subregion || ''}`.replace(/^, /, '').trim();
        }
        
        setPickup({
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
          name: name || 'Current Location'
        });
      } catch (e) {
        setPickup({ lat: loc.coords.latitude, lng: loc.coords.longitude, name: 'Current Location' });
      }
    })();
  }, []);

  const handleSearchDropoff = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    Keyboard.dismiss();
    
    try {
      // Cost-free geocoding using native OS services instead of Google API!
      const results = await Location.geocodeAsync(searchQuery);
      if (results.length > 0) {
        const { latitude, longitude } = results[0];
        
        // Reverse geocode to get a formatted clean name
        const reverse = await Location.reverseGeocodeAsync({ latitude, longitude });
        let cleanName = searchQuery;
        if (reverse.length > 0) {
          const r = reverse[0];
          cleanName = `${r.name || r.street || ''}, ${r.city || ''}`.replace(/^, /, '').trim() || searchQuery;
        }

        setDropoff({ lat: latitude, lng: longitude, name: cleanName });
        setSearchQuery(cleanName);
        
        // Center map to show both pickup and dropoff
        if (pickup) {
          mapRef.current?.fitToCoordinates([
            { latitude: pickup.lat, longitude: pickup.lng },
            { latitude, longitude }
          ], {
            edgePadding: { top: 100, right: 50, bottom: 400, left: 50 },
            animated: true,
          });
        }
      } else {
        alert("Could not find that location. Try a different search.");
      }
    } catch (e) {
      alert("Error searching location.");
    } finally {
      setIsSearching(false);
    }
  };

  const requestRide = () => {
    if (!pickup || !dropoff) {
      alert("Please select a drop-off location first.");
      return;
    }
    
    const message = `🚖 *Ride Request (RideO)*\n\n🟢 *Pickup:* ${pickup.name}\n📍 https://maps.google.com/?q=${pickup.lat},${pickup.lng}\n\n🔴 *Drop-off:* ${dropoff.name}\n📍 https://maps.google.com/?q=${dropoff.lat},${dropoff.lng}`;
    
    const url = `whatsapp://send?phone=${WABA_NUMBER}&text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://wa.me/${WABA_NUMBER}?text=${encodeURIComponent(message)}`);
    });
  };

  if (!location || !pickup) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Fetching your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        <Marker
          coordinate={{ latitude: pickup.lat, longitude: pickup.lng }}
          title="Pickup"
          description={pickup.name}
          pinColor="#10b981"
        />
        
        {dropoff && (
          <Marker
            coordinate={{ latitude: dropoff.lat, longitude: dropoff.lng }}
            title="Drop-off"
            description={dropoff.name}
            pinColor="#ef4444"
          />
        )}
      </MapView>
      
      {/* Search Bar Overlay */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Search color="#94a3b8" size={20} style={{ marginLeft: 12 }} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Where to? (e.g. Marina Beach)"
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchDropoff}
            returnKeyType="search"
          />
          {isSearching && <ActivityIndicator color="#10b981" style={{ marginRight: 12 }} />}
        </View>
      </View>

      {/* Recenter Button */}
      <TouchableOpacity 
        style={styles.recenterBtn}
        onPress={() => {
          mapRef.current?.animateToRegion({
            latitude: pickup.lat,
            longitude: pickup.lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }}
      >
        <Navigation color="#1e293b" size={24} />
      </TouchableOpacity>

      {/* Bottom Sheet UI */}
      <View style={styles.bottomSheet}>
        <Text style={styles.sheetTitle}>RideO Booking</Text>
        
        <View style={styles.locationRow}>
          <View style={styles.dotLine}>
            <View style={[styles.dot, { backgroundColor: '#10b981' }]} />
            <View style={styles.line} />
            <View style={[styles.dot, { backgroundColor: '#ef4444' }]} />
          </View>
          
          <View style={styles.locationTexts}>
            <View style={styles.locBox}>
              <Text style={styles.locLabel}>PICKUP</Text>
              <Text style={styles.locText} numberOfLines={1}>{pickup.name}</Text>
            </View>
            <View style={[styles.locBox, { marginTop: 16 }]}>
              <Text style={styles.locLabel}>DROP-OFF</Text>
              <Text style={styles.locText} numberOfLines={1}>
                {dropoff ? dropoff.name : 'Search destination above'}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.requestBtn, !dropoff && styles.disabledBtn]} 
          onPress={requestRide}
          disabled={!dropoff}
        >
          <MessageCircle color="#fff" size={24} />
          <Text style={styles.requestBtnText}>Request Ride via WhatsApp</Text>
        </TouchableOpacity>
        <Text style={styles.disclaimer}>Connected to Aishlee CRM network</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1e' },
  map: { width: '100%', height: '100%' },
  center: { flex: 1, backgroundColor: '#0a0f1e', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#94a3b8', marginTop: 16, fontSize: 16 },
  
  searchContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    padding: 16,
    fontSize: 16,
  },
  
  recenterBtn: {
    position: 'absolute',
    right: 20,
    bottom: 280, // Above bottom sheet
    backgroundColor: '#fff',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#111827',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 20,
    borderTopWidth: 1,
    borderColor: '#334155',
  },
  sheetTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  locationRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  dotLine: {
    alignItems: 'center',
    marginRight: 16,
    marginTop: 6,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  line: {
    width: 2,
    height: 40,
    backgroundColor: '#334155',
    marginVertical: 4,
  },
  locationTexts: {
    flex: 1,
  },
  locBox: {
    justifyContent: 'center',
  },
  locLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  locText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 4,
  },
  requestBtn: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  disabledBtn: {
    backgroundColor: '#0f172a',
    borderColor: '#334155',
    borderWidth: 1,
  },
  requestBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disclaimer: {
    color: '#64748b',
    textAlign: 'center',
    fontSize: 12,
    marginTop: 16,
  }
});
