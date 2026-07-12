import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../providers/auth';
import { supabase } from '../../../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Navigation, Car, Bike, Package, Clock, CheckCircle2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function TransoBooking() {
  const { session } = useAuth();
  
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeRide, setActiveRide] = useState<any>(null);
  
  // Fetch active ride on load
  useEffect(() => {
    if (!session?.user?.id) return;
    fetchActiveRide();
    
    // Subscribe to ride updates
    const channel = supabase
      .channel('public:rides')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rides', filter: `passenger_id=eq.${session.user.id}` }, (payload: any) => {
        if (payload.new && ['pending', 'accepted', 'en_route'].includes(payload.new.status)) {
          setActiveRide(payload.new);
        } else {
          setActiveRide(null);
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);

  const fetchActiveRide = async () => {
    if (!session?.user?.id) return;
    try {
      const { data, error } = await supabase
        .from('rides')
        .select('*')
        .eq('passenger_id', session.user.id)
        .in('status', ['pending', 'accepted', 'en_route'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (data) setActiveRide(data);
    } catch (err) {
      console.log("No active ride found");
    }
  };

  const handleBookRide = async (type: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (!pickup.trim() || !dropoff.trim()) {
      Alert.alert('Missing Details', 'Please enter both pickup and drop-off locations.');
      return;
    }
    
    setLoading(true);
    try {
      // Mock coordinates since we don't have Maps API yet
      const mockLat = 13.0827; 
      const mockLng = 80.2707;
      
      const { data, error } = await supabase
        .from('rides')
        .insert({
          passenger_id: session?.user?.id,
          pickup_address: pickup,
          dropoff_address: dropoff,
          pickup_lat: mockLat,
          pickup_lng: mockLng,
          dropoff_lat: mockLat + 0.05,
          dropoff_lng: mockLng + 0.05,
          status: 'pending',
          estimated_price: type === 'bike' ? 50 : type === 'car' ? 150 : 250
        })
        .select()
        .single();
        
      if (error) throw error;
      setActiveRide(data);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      Alert.alert('Booking Failed', error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancelRide = async () => {
    if (!activeRide) return;
    try {
      await supabase.from('rides').update({ status: 'cancelled' }).eq('id', activeRide.id);
      setActiveRide(null);
      setPickup('');
      setDropoff('');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  if (activeRide) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.activeRideContainer}>
          <View style={styles.statusBadge}>
            <Clock color="#E65100" size={20} style={{ marginRight: 8 }} />
            <Text style={styles.statusText}>
              {activeRide.status === 'pending' ? 'Looking for nearby drivers...' : 'Driver is on the way!'}
            </Text>
          </View>
          
          <View style={styles.rideDetailsCard}>
            <View style={styles.locationRow}>
              <MapPin color="#00A884" size={20} />
              <Text style={styles.locationText}>{activeRide.pickup_address}</Text>
            </View>
            <View style={styles.dashLine} />
            <View style={styles.locationRow}>
              <Navigation color="#E65100" size={20} />
              <Text style={styles.locationText}>{activeRide.dropoff_address}</Text>
            </View>
            
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Estimated Fare:</Text>
              <Text style={styles.priceValue}>₹{activeRide.estimated_price}</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelRide}>
            <Text style={styles.cancelBtnText}>Cancel Ride</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#E0F2EC', '#F5F7F9']} style={styles.header}>
        <Text style={styles.title}>Book a Ride</Text>
        <Text style={styles.subtitle}>Where to?</Text>
      </LinearGradient>
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.inputContainer}>
          <View style={styles.iconCol}>
            <View style={styles.dot} />
            <View style={styles.line} />
            <View style={[styles.dot, { backgroundColor: '#E65100' }]} />
          </View>
          <View style={styles.inputCol}>
            <TextInput
              style={styles.input}
              placeholder="Pickup Location"
              value={pickup}
              onChangeText={setPickup}
            />
            <View style={styles.divider} />
            <TextInput
              style={styles.input}
              placeholder="Destination"
              value={dropoff}
              onChangeText={setDropoff}
            />
          </View>
        </View>
        
        {pickup.length > 2 && dropoff.length > 2 && (
          <View style={styles.vehiclesContainer}>
            <Text style={styles.sectionTitle}>Choose a Vehicle</Text>
            
            <TouchableOpacity style={styles.vehicleCard} onPress={() => handleBookRide('bike')} disabled={loading}>
              <Bike color="#00A884" size={32} />
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleName}>TransO Bike</Text>
                <Text style={styles.vehicleDesc}>Quick & affordable</Text>
              </View>
              <Text style={styles.price}>₹50</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.vehicleCard} onPress={() => handleBookRide('car')} disabled={loading}>
              <Car color="#00A884" size={32} />
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleName}>TransO Cab</Text>
                <Text style={styles.vehicleDesc}>Comfortable cars</Text>
              </View>
              <Text style={styles.price}>₹150</Text>
            </TouchableOpacity>
            
            {loading && <ActivityIndicator size="large" color="#00A884" style={{ marginTop: 20 }} />}
          </View>
        )}
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
  inputContainer: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  iconCol: { width: 24, alignItems: 'center', justifyContent: 'center', paddingVertical: 10 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#00A884' },
  line: { width: 2, flex: 1, backgroundColor: '#E4E6E9', marginVertical: 4 },
  inputCol: { flex: 1, marginLeft: 12 },
  input: { paddingVertical: 12, fontSize: 16, color: '#111' },
  divider: { height: 1, backgroundColor: '#E4E6E9' },
  vehiclesContainer: { marginTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#111' },
  vehicleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E4E6E9' },
  vehicleInfo: { flex: 1, marginLeft: 16 },
  vehicleName: { fontSize: 16, fontWeight: 'bold', color: '#111' },
  vehicleDesc: { fontSize: 13, color: '#666', marginTop: 2 },
  price: { fontSize: 18, fontWeight: 'bold', color: '#00A884' },
  activeRideContainer: { flex: 1, padding: 20, justifyContent: 'center' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF3E0', padding: 16, borderRadius: 12, marginBottom: 20 },
  statusText: { fontSize: 16, fontWeight: 'bold', color: '#E65100' },
  rideDetailsCard: { backgroundColor: '#fff', padding: 20, borderRadius: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05 },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locationText: { fontSize: 16, marginLeft: 12, color: '#111', flex: 1 },
  dashLine: { width: 2, height: 20, backgroundColor: '#E4E6E9', marginLeft: 9, marginVertical: 4 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#E4E6E9' },
  priceLabel: { fontSize: 16, color: '#666' },
  priceValue: { fontSize: 18, fontWeight: 'bold', color: '#00A884' },
  cancelBtn: { marginTop: 30, backgroundColor: '#FEE2E2', padding: 16, borderRadius: 12, alignItems: 'center' },
  cancelBtnText: { color: '#EF4444', fontWeight: 'bold', fontSize: 16 }
});
