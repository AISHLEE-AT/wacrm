// @ts-nocheck
import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { User, CreditCard, Camera, MapPin, Navigation, RefreshCw } from 'lucide-react-native';
import { AppContext } from '../context/AppContext';
import { LocationContext } from '../context/LocationContext';

export default function OnboardingProfileScreen({ navigation }: any) {
  const { user, signIn } = useContext(AppContext);
  const locationCtx = useContext(LocationContext);
  const [fullName, setFullName] = useState(user?.name || '');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setFullName(user.name);
    }
  }, [user]);

  const handleAvatarPress = () => {
    Alert.alert('Coming Soon', 'Avatar upload coming soon');
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Full Name is required');
      return;
    }
    if (upiId && !upiId.includes('@')) {
      Alert.alert('Error', 'Please enter a valid UPI ID');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('https://watscrm.vercel.app/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: user?.phone,
          full_name: fullName,
          upi_id: upiId,
          location: locationCtx.locationString !== 'Detecting location...' ? locationCtx.locationString : undefined,
          city: locationCtx.city || undefined,
          district: locationCtx.district || undefined,
          state: locationCtx.state || undefined,
          pincode: locationCtx.pincode || undefined,
          country: locationCtx.country || undefined,
          latitude: locationCtx.latitude || undefined,
          longitude: locationCtx.longitude || undefined,
        })
      });
      
      if (!res.ok) {
        throw new Error('Failed to update profile');
      }

      // Update AppContext user name
      if (user) {
        signIn({ ...user, name: fullName });
      }

      navigation.replace('OnboardingModule');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Profile Setup</Text>
          <Text style={styles.subtitle}>Tell us a bit about yourself.</Text>
        </View>

        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarCircle} onPress={handleAvatarPress}>
            <Text style={styles.avatarText}>{fullName ? fullName.charAt(0).toUpperCase() : '?'}</Text>
            <View style={styles.cameraIconBadge}>
              <Camera color="#fff" size={14} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>FULL NAME *</Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputLeftIcon}>
              <User color="#34d399" size={20} />
            </View>
            <TextInput
              style={[styles.input, { paddingLeft: 50 }]}
              placeholder="Enter your full name"
              placeholderTextColor="#475569"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <Text style={[styles.label, { marginTop: 20 }]}>YOUR LOCATION</Text>
          <View style={styles.locationRow}>
            <View style={styles.locationIconBox}>
              <MapPin color="#34d399" size={20} />
            </View>
            <View style={{ flex: 1 }}>
              {locationCtx.isLoading ? (
                <View style={styles.locationLoadingRow}>
                  <ActivityIndicator size="small" color="#34d399" />
                  <Text style={styles.locationLoadingText}>Detecting your location...</Text>
                </View>
              ) : (
                <Text style={styles.locationValue}>
                  {locationCtx.locationString || 'Location not available'}
                </Text>
              )}
              {locationCtx.city && !locationCtx.isLoading && (
                <Text style={styles.locationSubText}>
                  {[locationCtx.city, locationCtx.district, locationCtx.pincode].filter(Boolean).join(' · ')}
                </Text>
              )}
            </View>
            {!locationCtx.isLoading && (
              <TouchableOpacity onPress={locationCtx.refreshLocation} style={styles.refreshBtn}>
                <RefreshCw color="#3b82f6" size={16} />
              </TouchableOpacity>
            )}
          </View>

          <Text style={[styles.label, { marginTop: 20 }]}>UPI ID (OPTIONAL)</Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputLeftIcon}>
              <CreditCard color="#34d399" size={20} />
            </View>
            <TextInput
              style={[styles.input, { paddingLeft: 50 }]}
              placeholder="e.g. name@bank"
              placeholderTextColor="#475569"
              value={upiId}
              onChangeText={setUpiId}
              autoCapitalize="none"
            />
          </View>
        </View>

      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.primaryButton, (!fullName.trim() || loading) && styles.disabledButton]} 
          onPress={handleSave}
          disabled={!fullName.trim() || loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Save & Continue</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1e' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  header: { marginBottom: 30, marginTop: 40 },
  title: { fontSize: 32, fontWeight: '900', color: '#34d399', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#94a3b8' },
  avatarSection: { alignItems: 'center', marginBottom: 40 },
  avatarCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#111827', borderWidth: 2, borderColor: '#34d399', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  avatarText: { color: '#34d399', fontSize: 36, fontWeight: 'bold' },
  cameraIconBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#10b981', width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#0a0f1e' },
  formContainer: { backgroundColor: '#111827', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: 'rgba(52,211,153,0.2)' },
  label: { color: '#94a3b8', fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginBottom: 8 },
  inputContainer: { position: 'relative', justifyContent: 'center' },
  inputLeftIcon: { position: 'absolute', left: 16, zIndex: 1 },
  input: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: 'rgba(52,211,153,0.3)', borderRadius: 12, color: '#fff', padding: 16, fontSize: 16 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#0a0f1e', borderTopWidth: 1, borderTopColor: 'rgba(52,211,153,0.1)' },
  primaryButton: { backgroundColor: '#10b981', padding: 16, borderRadius: 12, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  disabledButton: { opacity: 0.5 },
  locationRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a', borderWidth: 1, borderColor: 'rgba(52,211,153,0.3)', borderRadius: 12, padding: 14 },
  locationIconBox: { marginRight: 12 },
  locationValue: { color: '#e2e8f0', fontSize: 15, fontWeight: '600' },
  locationSubText: { color: '#64748b', fontSize: 11, marginTop: 2 },
  locationLoadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  locationLoadingText: { color: '#94a3b8', fontSize: 14 },
  refreshBtn: { padding: 8, marginLeft: 8, backgroundColor: 'rgba(59,130,246,0.1)', borderRadius: 8 },
});
