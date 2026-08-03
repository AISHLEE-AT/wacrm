import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';

// Mock API function (in a real app, this calls your Next.js backend)
const fetchActiveDrivers = async () => {
  // Simulating an API delay
  return new Promise<any[]>((resolve) => {
    setTimeout(() => {
      resolve([
        { id: '1', lat: 37.78825, lng: -122.4324, title: 'Driver 1', description: 'Nearby' },
        { id: '2', lat: 37.78925, lng: -122.4344, title: 'Driver 2', description: 'Available' },
      ]);
    }, 1000);
  });
};

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    (async () => {
      // Ask for foreground permissions to show user's blip
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      // Get current location to center map
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);

      // Fetch nearby drivers from API
      const driversData = await fetchActiveDrivers();
      setDrivers(driversData);
    })();
  }, []);

  if (!location) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Locating you...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT} // Uses Apple Maps on iOS, Google Maps on Android
        style={styles.map}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {drivers.map((driver) => (
          <Marker
            key={driver.id}
            coordinate={{ latitude: driver.lat, longitude: driver.lng }}
            title={driver.title}
            description={driver.description}
            // In a real app, you can pass a custom car icon here
            pinColor="#3b82f6" 
          />
        ))}
      </MapView>
      
      {/* Overlay UI (e.g., search bar or status) */}
      <View style={styles.overlay}>
        <Text style={styles.overlayText}>Live Map - DriveO / RideO</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  center: {
    flex: 1,
    backgroundColor: '#0a0f1e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 16,
    fontSize: 16,
  },
  overlay: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  overlayText: {
    color: '#10b981',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  }
});
