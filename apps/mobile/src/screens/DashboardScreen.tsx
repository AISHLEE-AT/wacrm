import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, ScrollView, ActivityIndicator, Linking } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { LocationService } from '../services/LocationService';
import { NotificationService } from '../services/NotificationService';
import { MapPin, Bell, LogOut, KeyRound, Save } from 'lucide-react-native';
import { AppContext } from '../context/AppContext';

const endpoints = {
  updateProfile: 'https://watscrm.vercel.app/api/profile/update',
};

export default function DashboardScreen({ navigation }: any) {
  const { userRole, geminiApiKey, updateGeminiKey } = useContext(AppContext);
  const [phone, setPhone] = useState<string | null>('');
  const [isTracking, setIsTracking] = useState(false);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [tempApiKey, setTempApiKey] = useState(geminiApiKey || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setTempApiKey(geminiApiKey || '');
  }, [geminiApiKey]);

  useEffect(() => {
    SecureStore.getItemAsync('user-phone').then(async (p) => {
      setPhone(p);
      if (p) {
        // Initialize notifications and get token on load
        const token = await NotificationService.registerForPushNotificationsAsync();
        if (token) {
          setPushToken(token);
          // Save the token to our Next.js backend
          fetch(endpoints.updateProfile, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: p, pushToken: token })
          }).catch(console.error);
        }
      }
    });
  }, []);

  const handleSaveApiKey = async () => {
    if (!phone) return;
    setIsSaving(true);
    try {
      const cleanKey = tempApiKey.trim();
      // 1. Save locally via context
      await updateGeminiKey(cleanKey);
      
      // 2. Sync to Supabase Backend
      const res = await fetch(endpoints.updateProfile, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, gemini_api_key: cleanKey })
      });
      
      if (!res.ok) throw new Error('Failed to sync to web');
      
      Alert.alert('Success', 'Gemini API Key saved and synced successfully!');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not save API key');
    } finally {
      setIsSaving(false);
    }
  };

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

  const handleTestNotification = async () => {
    if (pushToken) {
      await NotificationService.sendTestNotification(pushToken);
      Alert.alert('Sent!', 'Check your notification center.');
    } else {
      Alert.alert('No Token', 'Push notifications are not configured properly on this device.');
    }
  };

  const handleLogout = async () => {
    await LocationService.stopTracking();
    await SecureStore.deleteItemAsync('sb-access-token');
    await SecureStore.deleteItemAsync('user-phone');
    await SecureStore.deleteItemAsync('user-role');
    await SecureStore.deleteItemAsync('gemini-api-key');
    navigation.replace('Login');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingBottom: 60, paddingTop: 60 }}>
      <Text style={styles.title}>Your Profile</Text>
      <Text style={styles.subtitle}>+91 {phone} • Role: {userRole}</Text>
      
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.sectionTitle}>AI Helper Configuration</Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://aistudio.google.com/app/apikey')}>
            <Text style={styles.linkText}>Get API Key</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.cardDesc}>Enter your Gemini API key to power the AI Assistant in the Inbox tab. It will sync securely across your devices.</Text>
        
        <View style={styles.inputContainer}>
          <KeyRound color="#94a3b8" size={20} style={{ marginLeft: 12 }} />
          <TextInput 
            style={styles.input}
            placeholder="AIzaSy..."
            placeholderTextColor="#475569"
            secureTextEntry={true}
            value={tempApiKey}
            onChangeText={setTempApiKey}
          />
        </View>
        
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveApiKey} disabled={isSaving}>
          {isSaving ? <ActivityIndicator color="#fff" size="small" /> : <Save color="#fff" size={18} style={{ marginRight: 8 }} />}
          <Text style={styles.buttonText}>{isSaving ? 'Saving...' : 'Save API Key'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Device Settings</Text>

      <TouchableOpacity 
        style={[styles.trackButton, isTracking ? styles.trackButtonActive : null]} 
        onPress={toggleTracking}
      >
        <MapPin color="#fff" size={20} style={{ marginRight: 8 }} />
        <Text style={styles.buttonText}>
          {isTracking ? "Stop GPS Tracking" : "Start Background GPS Tracking"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.notifyButton} 
        onPress={handleTestNotification}
      >
        <Bell color="#fff" size={20} style={{ marginRight: 8 }} />
        <Text style={styles.buttonText}>Test Push Notification</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <LogOut color="#ef4444" size={20} style={{ marginRight: 8 }} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1e' },
  title: { fontSize: 28, fontWeight: '900', color: '#10b981', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#94a3b8', marginBottom: 32, fontWeight: 'bold' },
  sectionTitle: { fontSize: 16, color: '#fff', fontWeight: 'bold', marginBottom: 12 },
  card: { backgroundColor: '#111827', padding: 20, borderRadius: 16, marginBottom: 32, borderWidth: 1, borderColor: 'rgba(52, 211, 153, 0.2)' },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  linkText: { color: '#3b82f6', fontSize: 13, fontWeight: 'bold' },
  cardDesc: { color: '#94a3b8', fontSize: 13, marginBottom: 16, lineHeight: 20 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a', borderRadius: 12, borderWidth: 1, borderColor: '#334155', marginBottom: 16 },
  input: { flex: 1, color: '#fff', padding: 12, fontSize: 14 },
  saveButton: { flexDirection: 'row', backgroundColor: '#10b981', padding: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  trackButton: { flexDirection: 'row', backgroundColor: '#3b82f6', padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  trackButtonActive: { backgroundColor: '#eab308' },
  notifyButton: { flexDirection: 'row', backgroundColor: '#8b5cf6', padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  logoutButton: { flexDirection: 'row', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)', alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  logoutText: { color: '#ef4444', fontSize: 15, fontWeight: 'bold' }
});
