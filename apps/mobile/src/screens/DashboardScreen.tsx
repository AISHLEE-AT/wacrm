import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { LocationService } from '../services/LocationService';
import { MapPin } from 'lucide-react-native';

export default function DashboardScreen({ navigation }: any) {
  const [phone, setPhone] = useState<string | null>('');
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync('user-phone').then(setPhone);
  }, []);

  const toggleTracking = async () => {
    if (isTracking) {
      await LocationService.stopTracking();
      setIsTracking(false);
      Alert.alert('Tracking Stopped', 'GPS background tracking paused.');
    } else {
      const started = await LocationService.requestPermissionsAndStart();
      if (started) {
        setIsTracking(true);
        Alert.alert('Tracking Started', 'Your location is now updating in the background.');
      }
    }
  };

  const handleLogout = async () => {
    await LocationService.stopTracking();
    await SecureStore.deleteItemAsync('sb-access-token');
    await SecureStore.deleteItemAsync('user-phone');
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to SuprO!</Text>
      <Text style={styles.subtitle}>Logged in as +91 {phone}</Text>
      
      <View style={styles.card}>
        <Text style={styles.text}>Your React Native app is now perfectly linked to the Next.js API.</Text>
      </View>

      <TouchableOpacity 
        style={[styles.trackButton, isTracking ? styles.trackButtonActive : null]} 
        onPress={toggleTracking}
      >
        <MapPin color="#fff" size={20} style={{ marginRight: 8 }} />
        <Text style={styles.buttonText}>
          {isTracking ? "Stop GPS Tracking" : "Start Background GPS Tracking"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1e', justifyContent: 'center', padding: 20, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#10b981', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#94a3b8', marginBottom: 40 },
  card: { backgroundColor: '#1e293b', padding: 20, borderRadius: 12, marginBottom: 40 },
  text: { color: '#fff', textAlign: 'center', fontSize: 16, lineHeight: 24 },
  trackButton: { flexDirection: 'row', backgroundColor: '#3b82f6', padding: 16, borderRadius: 8, width: '100%', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  trackButtonActive: { backgroundColor: '#eab308' },
  logoutButton: { backgroundColor: '#ef4444', padding: 16, borderRadius: 8, width: '100%', alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
