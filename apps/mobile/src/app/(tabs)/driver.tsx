import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useDriver } from '../../providers/driver';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../providers/auth';

export default function DriverScreen() {
  const { 
    driverId, 
    status, 
    walletBalance, 
    currentLat, 
    currentLng, 
    toggleStatus, 
    acceptRide, 
    completeRide,
    loading 
  } = useDriver();
  
  const { session } = useAuth();
  const [pendingRides, setPendingRides] = useState<any[]>([]);

  useEffect(() => {
    if (!session?.user || !driverId || status !== 'online') return;

    // Fetch initial pending rides
    const fetchPendingRides = async () => {
      const { data } = await supabase
        .from('rides')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (data) setPendingRides(data);
    };

    fetchPendingRides();

    // Subscribe to realtime rides
    const channel = supabase
      .channel('public:rides')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rides' }, (payload) => {
        fetchPendingRides();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, driverId, status]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00A884" />
      </View>
    );
  }

  if (!driverId) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>You are not registered as a driver.</Text>
      </View>
    );
  }

  const handleAcceptRide = async (rideId: string) => {
    await acceptRide(rideId);
    Alert.alert('Ride Accepted', 'Please proceed to the pickup location.');
  };

  return (
    <View style={styles.container}>
      {/* Map View */}
      {currentLat && currentLng ? (
        <MapView
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={{
            latitude: currentLat,
            longitude: currentLng,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          showsUserLocation={true}
          followsUserLocation={true}
        >
          {pendingRides.map(ride => (
            <Marker
              key={ride.id}
              coordinate={{ latitude: ride.pickup_lat, longitude: ride.pickup_lng }}
              title="Passenger Pickup"
              description={`Fare: ₹${ride.estimated_price}`}
              pinColor="red"
            />
          ))}
        </MapView>
      ) : (
        <View style={styles.mapPlaceholder}>
          <Text style={{ color: '#666' }}>Waiting for location...</Text>
        </View>
      )}

      {/* Driver Controls Overlay */}
      <View style={styles.overlay}>
        <View style={styles.statsCard}>
          <Text style={styles.statsText}>Wallet: ₹{walletBalance}</Text>
          <Text style={styles.statsText}>Status: {status.toUpperCase()}</Text>
        </View>

        <TouchableOpacity 
          style={[styles.toggleButton, status === 'online' ? styles.btnOffline : styles.btnOnline]} 
          onPress={toggleStatus}
        >
          <Text style={styles.toggleButtonText}>
            {status === 'online' ? 'GO OFFLINE' : 'GO ONLINE'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Pending Rides List */}
      {status === 'online' && pendingRides.length > 0 && (
        <View style={styles.ridesList}>
          <Text style={styles.ridesTitle}>Available Rides</Text>
          {pendingRides.map(ride => (
            <View key={ride.id} style={styles.rideCard}>
              <View>
                <Text style={styles.rideAddress}>Pickup: {ride.pickup_address}</Text>
                <Text style={styles.rideFare}>Fare: ₹{ride.estimated_price}</Text>
              </View>
              <TouchableOpacity style={styles.acceptButton} onPress={() => handleAcceptRide(ride.id)}>
                <Text style={styles.acceptButtonText}>Accept</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#ff3333' },
  map: { flex: 1 },
  mapPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e0e0e0' },
  overlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statsCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    elevation: 5,
  },
  statsText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  toggleButton: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    elevation: 5,
  },
  btnOnline: { backgroundColor: '#00A884' },
  btnOffline: { backgroundColor: '#ff4444' },
  toggleButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  ridesList: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    maxHeight: '40%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    elevation: 10,
  },
  ridesTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  rideCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  rideAddress: { fontSize: 14, color: '#333', maxWidth: '70%' },
  rideFare: { fontSize: 14, fontWeight: 'bold', color: '#00A884', marginTop: 4 },
  acceptButton: {
    backgroundColor: '#00A884',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  acceptButtonText: { color: 'white', fontWeight: 'bold' },
});
