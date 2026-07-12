import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Dimensions, ScrollView } from 'react-native';
import { useDriver } from '../../providers/driver';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../providers/auth';
import { LinearGradient } from 'expo-linear-gradient';
import { Wallet, Power, Navigation2, CheckCircle2 } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

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
          <View style={styles.statRow}>
            <Wallet color="#00A884" size={20} />
            <View style={styles.statInfo}>
              <Text style={styles.statLabel}>Wallet Balance</Text>
              <Text style={styles.statValue}>₹{walletBalance}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.statRow}>
            <View style={[styles.statusDot, { backgroundColor: status === 'online' ? '#00A884' : '#ff4444' }]} />
            <View style={styles.statInfo}>
              <Text style={styles.statLabel}>Status</Text>
              <Text style={styles.statValue}>{status.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.toggleContainer} 
          onPress={toggleStatus}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={status === 'online' ? ['#ff4444', '#cc0000'] : ['#00A884', '#007A5E']}
            style={styles.toggleButton}
          >
            <Power color="#fff" size={24} />
            <Text style={styles.toggleButtonText}>
              {status === 'online' ? 'GO OFFLINE' : 'GO ONLINE'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Pending Rides List */}
      {status === 'online' && pendingRides.length > 0 && (
        <View style={styles.ridesList}>
          <View style={styles.ridesHeader}>
            <Text style={styles.ridesTitle}>Available Rides</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pendingRides.length}</Text>
            </View>
          </View>
          
          <ScrollView style={styles.ridesScroll} showsVerticalScrollIndicator={false}>
            {pendingRides.map(ride => (
              <View key={ride.id} style={styles.rideCard}>
                <View style={styles.rideInfo}>
                  <View style={styles.rideLocationRow}>
                    <Navigation2 color="#00A884" size={16} />
                    <Text style={styles.rideAddress} numberOfLines={2}>
                      {ride.pickup_address}
                    </Text>
                  </View>
                  <Text style={styles.rideFare}>Est. Fare: ₹{ride.estimated_price}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.acceptButton} 
                  onPress={() => handleAcceptRide(ride.id)}
                  activeOpacity={0.8}
                >
                  <CheckCircle2 color="#fff" size={20} />
                  <Text style={styles.acceptButtonText}>Accept</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#ef4444', fontFamily: 'Outfit_500Medium' },
  map: { flex: 1 },
  mapPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e2e8f0' },
  overlay: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 15,
  },
  statsCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statInfo: {
    flexDirection: 'column',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'Outfit_500Medium',
  },
  statValue: {
    fontSize: 18,
    color: '#0f172a',
    fontFamily: 'Outfit_700Bold',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#e2e8f0',
  },
  toggleContainer: {
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  toggleButton: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  toggleButtonText: { 
    color: 'white', 
    fontSize: 16,
    fontFamily: 'Outfit_700Bold',
    letterSpacing: 1,
  },
  ridesList: {
    position: 'absolute',
    bottom: 95, 
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    padding: 20,
    maxHeight: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  ridesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  ridesTitle: { 
    fontSize: 20, 
    color: '#0f172a',
    fontFamily: 'Outfit_700Bold',
  },
  badge: {
    backgroundColor: '#00A884',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Outfit_700Bold',
  },
  ridesScroll: {
    flexGrow: 0,
  },
  rideCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  rideInfo: {
    flex: 1,
    marginRight: 15,
  },
  rideLocationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  rideAddress: { 
    fontSize: 14, 
    color: '#334155', 
    fontFamily: 'Outfit_500Medium',
    flexShrink: 1,
    lineHeight: 20,
  },
  rideFare: { 
    fontSize: 16, 
    color: '#00A884',
    fontFamily: 'Outfit_700Bold',
    marginLeft: 24,
  },
  acceptButton: {
    backgroundColor: '#00A884',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  acceptButtonText: { 
    color: 'white', 
    fontFamily: 'Outfit_600SemiBold',
  },
});
