import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../providers/auth';
import { supabase } from '../../../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, User, Car, ShieldCheck } from 'lucide-react-native';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

export default function LocalConnect() {
  const { session } = useAuth();
  
  const [role, setRole] = useState<'traveler' | 'transporter'>('traveler');
  const [vehicleType, setVehicleType] = useState('bike taxi');
  const [radius, setRadius] = useState(10);
  
  const [myLat, setMyLat] = useState<number | null>(null);
  const [myLng, setMyLng] = useState<number | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  
  const [isSharing, setIsSharing] = useState(false);
  const [myRequest, setMyRequest] = useState<any>(null);
  const [nearbyUsers, setNearbyUsers] = useState<any[]>([]);

  const handleGetLocation = async () => {
    setGettingLocation(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Allow location access to use Local Connect.');
        setGettingLocation(false);
        return;
      }
      
      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setMyLat(location.coords.latitude);
      setMyLng(location.coords.longitude);
    } catch (e) {
      console.log("Error fetching location", e);
      Alert.alert('Error', 'Could not fetch your location.');
    } finally {
      setGettingLocation(false);
    }
  };

  useEffect(() => {
    handleGetLocation();
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;
    
    const channel = supabase
      .channel('public:local_transport_requests_mobile')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'local_transport_requests' }, (payload: any) => {
        handleRealtimeUpdate(payload);
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id, myRequest, myLat, myLng, isSharing, role]);

  const handleRealtimeUpdate = (payload: any) => {
    if (myRequest && payload.new.id === myRequest.id) {
      setMyRequest(payload.new);
      return;
    }
    
    if (isSharing && myLat && myLng) {
      fetchNearbyUsers();
    }
  };

  const fetchNearbyUsers = async () => {
    if (!myLat || !myLng) return;
    
    const targetRole = role === 'traveler' ? 'transporter' : 'traveler';
    
    const { data, error } = await supabase.rpc('get_nearby_transports', {
      query_lat: myLat,
      query_lng: myLng,
      query_radius_m: radius * 1000, 
      query_role: targetRole
    });
    
    if (data) {
      setNearbyUsers(data);
    }
  };

  const handleShareLocation = async () => {
    if (!myLat || !myLng || !session?.user?.id) return;
    
    setIsSharing(true);
    
    const { data, error } = await supabase
      .from('local_transport_requests')
      .insert({
        user_id: session.user.id,
        role,
        vehicle_type: role === 'transporter' ? vehicleType : null,
        lat: myLat,
        lng: myLng,
        radius_m: radius * 1000,
        status: 'active'
      })
      .select()
      .single();
      
    if (data) {
      setMyRequest(data);
      fetchNearbyUsers();
    }
  };

  const handleAccept = async (targetId: string) => {
    if (!myRequest || !session?.user?.id) return;
    
    // Update target
    await supabase
      .from('local_transport_requests')
      .update({ status: 'matched', matched_with: session.user.id })
      .eq('id', targetId);
      
    // Update self
    const { data } = await supabase
      .from('local_transport_requests')
      .update({ status: 'matched', matched_with: myRequest.user_id })
      .eq('id', myRequest.id)
      .select()
      .single();
      
    if (data) setMyRequest(data);
  };
  
  const handleConfirm = async () => {
    if (!myRequest) return;
    
    const { data } = await supabase
      .from('local_transport_requests')
      .update({ status: 'completed' })
      .eq('id', myRequest.id)
      .select()
      .single();
      
    if (data) setMyRequest(data);
  };

  const stopSharing = () => {
    setIsSharing(false);
    setMyRequest(null);
    setNearbyUsers([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#E0F2EC', '#F5F7F9']} style={styles.header}>
        <Text style={styles.title}>Local Connect</Text>
        <Text style={styles.subtitle}>Find nearby transport</Text>
      </LinearGradient>
      
      <ScrollView contentContainerStyle={styles.content}>
        
        {!isSharing ? (
          <View style={styles.card}>
            <View style={styles.roleToggle}>
              <TouchableOpacity 
                style={[styles.roleBtn, role === 'traveler' && styles.roleBtnActiveTraveler]}
                onPress={() => setRole('traveler')}
              >
                <Text style={[styles.roleBtnText, role === 'traveler' && styles.roleBtnTextActive]}>Traveler</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.roleBtn, role === 'transporter' && styles.roleBtnActiveTransporter]}
                onPress={() => setRole('transporter')}
              >
                <Text style={[styles.roleBtnText, role === 'transporter' && styles.roleBtnTextActive]}>Transporter</Text>
              </TouchableOpacity>
            </View>

            {role === 'traveler' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Search Radius: {radius}km</Text>
                <View style={styles.vehicleToggle}>
                  {[1, 5, 10, 25, 50].map((r) => (
                    <TouchableOpacity
                      key={r}
                      style={[styles.vtBtn, radius === r && styles.vtBtnActive]}
                      onPress={() => setRadius(r)}
                    >
                      <Text style={[styles.vtBtnText, radius === r && styles.vtBtnTextActive]}>{r}km</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {role === 'transporter' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Vehicle Type</Text>
                <View style={styles.vehicleToggle}>
                  {['bike taxi', 'car', 'mini bus', 'bus taxi'].map((vt) => (
                    <TouchableOpacity
                      key={vt}
                      style={[styles.vtBtn, vehicleType === vt && styles.vtBtnActive]}
                      onPress={() => setVehicleType(vt)}
                    >
                      <Text style={[styles.vtBtnText, vehicleType === vt && styles.vtBtnTextActive]}>{vt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <TouchableOpacity 
              style={[styles.shareBtn, role === 'traveler' ? {backgroundColor: '#10b981'} : {backgroundColor: '#4f46e5'}, (!myLat || gettingLocation) && {opacity: 0.5}]}
              onPress={handleShareLocation}
              disabled={!myLat || gettingLocation}
            >
              {gettingLocation ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.shareBtnText}>Share Location & Find Matches</Text>
              )}
            </TouchableOpacity>
            
            {!myLat && !gettingLocation && (
              <TouchableOpacity style={styles.getLocationBtn} onPress={handleGetLocation}>
                <Text style={styles.getLocationText}>Retry Location Access</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.card}>
            <View style={[styles.statusBox, myRequest?.status === 'matched' ? {backgroundColor: '#fef3c7', borderColor: '#fde68a'} : myRequest?.status === 'completed' ? {backgroundColor: '#ecfdf5', borderColor: '#a7f3d0'} : {}]}>
              <Text style={styles.statusTitle}>Status</Text>
              <Text style={styles.statusText}>
                {myRequest?.status === 'active' && 'Sharing location and searching for matches...'}
                {myRequest?.status === 'matched' && 'You have a match! Please confirm to complete.'}
                {myRequest?.status === 'completed' && 'Ride confirmed successfully!'}
              </Text>
              
              {myRequest?.status === 'matched' && (
                <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
                  <Text style={styles.confirmBtnText}>Confirm Ride</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <TouchableOpacity style={styles.stopBtn} onPress={stopSharing}>
              <Text style={styles.stopBtnText}>Stop Sharing</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Map View */}
        <View style={styles.mapContainer}>
          {myLat && myLng ? (
            <MapView
              provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
              style={styles.map}
              initialRegion={{
                latitude: myLat,
                longitude: myLng,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
            >
              <Marker coordinate={{ latitude: myLat, longitude: myLng }} title="You" pinColor="#3b82f6" />
              {nearbyUsers.map(u => (
                <Marker 
                  key={u.id}
                  coordinate={{ latitude: u.lat, longitude: u.lng }}
                  title={u.role === 'traveler' ? 'Traveler' : `Transporter (${u.vehicle_type})`}
                  pinColor={u.role === 'traveler' ? '#10b981' : '#4f46e5'}
                />
              ))}
            </MapView>
          ) : (
            <View style={styles.mapPlaceholder}>
              <ActivityIndicator size="large" color="#94a3b8" />
            </View>
          )}
        </View>

        {isSharing && nearbyUsers.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Nearby Matches ({nearbyUsers.length})</Text>
            {nearbyUsers.map(user => (
              <View key={user.id} style={styles.matchItem}>
                <View style={styles.matchInfo}>
                  {user.role === 'traveler' ? <User color="#10b981" size={20} /> : <Car color="#4f46e5" size={20} />}
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.matchRole}>{user.role === 'traveler' ? 'Traveler' : `Transporter (${user.vehicle_type})`}</Text>
                    <Text style={styles.matchDistance}>Within {radius}km</Text>
                  </View>
                </View>
                
                {role === 'transporter' && user.status === 'active' && (
                  <TouchableOpacity style={styles.acceptBtnT} onPress={() => handleAccept(user.id)}>
                    <Text style={styles.acceptBtnText}>Accept</Text>
                  </TouchableOpacity>
                )}
                {role === 'traveler' && user.status === 'active' && (
                  <TouchableOpacity style={styles.acceptBtnP} onPress={() => handleAccept(user.id)}>
                    <Text style={styles.acceptBtnText}>Request</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}
        
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7F9' },
  header: { padding: 20, paddingTop: 40, paddingBottom: 30, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 4 },
  content: { padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, marginBottom: 20 },
  roleToggle: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 12, padding: 4, marginBottom: 20 },
  roleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  roleBtnActiveTraveler: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  roleBtnActiveTransporter: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  roleBtnText: { fontWeight: '600', color: '#64748b' },
  roleBtnTextActive: { color: '#0f172a' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#64748b', marginBottom: 8 },
  vehicleToggle: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  vtBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  vtBtnActive: { backgroundColor: '#eef2ff', borderColor: '#818cf8' },
  vtBtnText: { color: '#64748b', fontSize: 12, fontWeight: '600' },
  vtBtnTextActive: { color: '#4f46e5' },
  shareBtn: { padding: 16, borderRadius: 12, alignItems: 'center' },
  shareBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  getLocationBtn: { marginTop: 12, padding: 12, alignItems: 'center' },
  getLocationText: { color: '#64748b', fontWeight: '600' },
  statusBox: { padding: 16, borderRadius: 12, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 16 },
  statusTitle: { fontWeight: 'bold', marginBottom: 4 },
  statusText: { color: '#334155', fontSize: 14 },
  confirmBtn: { marginTop: 12, backgroundColor: '#10b981', padding: 12, borderRadius: 8, alignItems: 'center' },
  confirmBtnText: { color: '#fff', fontWeight: 'bold' },
  stopBtn: { padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center' },
  stopBtnText: { color: '#64748b', fontWeight: 'bold' },
  mapContainer: { height: 250, borderRadius: 16, overflow: 'hidden', marginBottom: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  map: { width: '100%', height: '100%' },
  mapPlaceholder: { width: '100%', height: '100%', backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  matchItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: '#f8fafc', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 8 },
  matchInfo: { flexDirection: 'row', alignItems: 'center' },
  matchRole: { fontWeight: 'bold', color: '#0f172a' },
  matchDistance: { fontSize: 12, color: '#64748b' },
  acceptBtnT: { backgroundColor: '#4f46e5', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  acceptBtnP: { backgroundColor: '#10b981', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  acceptBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 }
});
