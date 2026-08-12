// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Camera as CameraIcon, MapPin, Bell, CheckCircle, AlertCircle } from 'lucide-react-native';

export default function OnboardingPermissionsScreen({ navigation }: any) {
  const [cameraGranted, setCameraGranted] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const cameraStatus = await ImagePicker.getCameraPermissionsAsync();
    setCameraGranted(cameraStatus.status === 'granted');

    const locationStatus = await Location.getForegroundPermissionsAsync();
    setLocationGranted(locationStatus.status === 'granted');
  };

  const requestCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    setCameraGranted(status === 'granted');
    if (status !== 'granted') Alert.alert('Permission Denied', 'Camera access is required.');
  };

  const requestLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setLocationGranted(status === 'granted');
    if (status !== 'granted') Alert.alert('Permission Denied', 'Location access is required.');
  };

  const allGranted = cameraGranted && locationGranted;

  const handleContinue = () => {
    if (allGranted) {
      navigation.replace('OnboardingProfile');
    }
  };

  const PermissionCard = ({ title, desc, icon: Icon, granted, onRequest }: any) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Icon color="#34d399" size={24} />
        </View>
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardDesc}>{desc}</Text>
        </View>
      </View>
      {granted ? (
        <View style={styles.grantedBadge}>
          <CheckCircle color="#10b981" size={16} />
          <Text style={styles.grantedText}>Granted</Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.grantBtn} onPress={onRequest}>
          <Text style={styles.grantBtnText}>Grant</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Permissions</Text>
          <Text style={styles.subtitle}>Supro needs these permissions to function properly.</Text>
        </View>

        <PermissionCard 
          title="Camera" 
          desc="For scanning QR codes and uploading images." 
          icon={CameraIcon} 
          granted={cameraGranted} 
          onRequest={requestCamera} 
        />
        <PermissionCard 
          title="Location" 
          desc="For RideO, DriveO, and local services." 
          icon={MapPin} 
          granted={locationGranted} 
          onRequest={requestLocation} 
        />
      </ScrollView>

      <View style={styles.footer}>
        {!allGranted && (
          <View style={styles.warningContainer}>
            <AlertCircle color="#f59e0b" size={16} />
            <Text style={styles.warningText}>All permissions must be granted to continue.</Text>
          </View>
        )}
        <TouchableOpacity 
          style={[styles.primaryButton, !allGranted && styles.disabledButton]} 
          onPress={handleContinue}
          disabled={!allGranted}
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1e' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  header: { marginBottom: 30, marginTop: 40 },
  title: { fontSize: 32, fontWeight: '900', color: '#34d399', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#94a3b8' },
  card: { backgroundColor: '#111827', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(52,211,153,0.2)' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  iconContainer: { backgroundColor: 'rgba(52,211,153,0.1)', padding: 12, borderRadius: 12, marginRight: 16 },
  cardTextContainer: { flex: 1 },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  cardDesc: { color: '#94a3b8', fontSize: 12 },
  grantBtn: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: 'rgba(52,211,153,0.5)', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  grantBtnText: { color: '#34d399', fontWeight: 'bold' },
  grantedBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(16,185,129,0.1)', paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)' },
  grantedText: { color: '#10b981', fontWeight: 'bold', marginLeft: 8 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#0a0f1e', borderTopWidth: 1, borderTopColor: 'rgba(52,211,153,0.1)' },
  warningContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12, gap: 8 },
  warningText: { color: '#f59e0b', fontSize: 12 },
  primaryButton: { backgroundColor: '#10b981', padding: 16, borderRadius: 12, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  disabledButton: { opacity: 0.5 },
});
