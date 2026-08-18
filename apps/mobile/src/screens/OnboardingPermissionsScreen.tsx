// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform, PermissionsAndroid } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Camera as CameraIcon, MapPin, Mic, FolderOpen, CheckCircle, AlertCircle, Sparkles } from 'lucide-react-native';

export default function OnboardingPermissionsScreen({ navigation }: any) {
  const [audioGranted, setAudioGranted] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);
  const [cameraGranted, setCameraGranted] = useState(false);
  const [mediaGranted, setMediaGranted] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    if (Platform.OS === 'android') {
      const mic = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
      setAudioGranted(mic);

      const loc = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      setLocationGranted(loc);

      const cam = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
      setCameraGranted(cam);

      const storage = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
      setMediaGranted(storage);
    } else {
      const cameraStatus = await ImagePicker.getCameraPermissionsAsync();
      setCameraGranted(cameraStatus.status === 'granted');

      const locationStatus = await Location.getForegroundPermissionsAsync();
      setLocationGranted(locationStatus.status === 'granted');
      setAudioGranted(true);
      setMediaGranted(true);
    }
  };

  const handleGrantAll = async () => {
    if (Platform.OS === 'android') {
      try {
        const permissions = [
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.MODIFY_AUDIO_SETTINGS,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
          PermissionsAndroid.PERMISSIONS.CAMERA,
        ];
        if (Platform.Version >= 33) {
          permissions.push('android.permission.READ_MEDIA_AUDIO' as any);
          permissions.push('android.permission.READ_MEDIA_IMAGES' as any);
        } else {
          permissions.push(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
        }

        await PermissionsAndroid.requestMultiple(permissions);
        await checkPermissions();
      } catch (e) {
        console.warn('Grant all error:', e);
      }
    } else {
      await ImagePicker.requestCameraPermissionsAsync();
      await Location.requestForegroundPermissionsAsync();
      await checkPermissions();
    }
  };

  const requestAudio = async () => {
    if (Platform.OS === 'android') {
      const res = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
      setAudioGranted(res === PermissionsAndroid.RESULTS.GRANTED);
    }
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

  const allGranted = audioGranted && cameraGranted && locationGranted;

  const handleContinue = () => {
    navigation.replace('OnboardingProfile');
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
          <Text style={styles.grantedText}>Granted • அனுமதிக்கப்பட்டது</Text>
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
          <Text style={styles.title}>அனுமதிகள் அமைப்பு</Text>
          <Text style={styles.subtitle}>SuprO செயலியின் அனைத்து சிறப்பம்சங்களும் தடையின்றி இயங்க அனுமதி வழங்கவும்.</Text>
        </View>

        <PermissionCard 
          title="குரல் & மைக்ரோஃபோன் (Microphone)" 
          desc="குரல் வழி தேடல் (TeachO & TestO), குரல் AI உதவியாளர்." 
          icon={Mic} 
          granted={audioGranted} 
          onRequest={requestAudio} 
        />
        <PermissionCard 
          title="இருப்பிடம் (Location GPS)" 
          desc="RideO, DriveO பயண வழிகாட்டல் மற்றும் AgrO உள்ளூர் சேவை." 
          icon={MapPin} 
          granted={locationGranted} 
          onRequest={requestLocation} 
        />
        <PermissionCard 
          title="கேமரா (Camera)" 
          desc="QR குறியீடு ஸ்கேன் மற்றும் பயிர் நோய் படம் பதிவேற்றம்." 
          icon={CameraIcon} 
          granted={cameraGranted} 
          onRequest={requestCamera} 
        />
        <PermissionCard 
          title="மீடியா & ஆடியோ (Audio / Storage)" 
          desc="பாட ஆடியோ மற்றும் ஆவணப் பதிவிறக்கங்கள்." 
          icon={FolderOpen} 
          granted={mediaGranted} 
          onRequest={handleGrantAll} 
        />

        {/* 1-Click Allow All */}
        {!allGranted && (
          <TouchableOpacity style={styles.allowAllBatchBtn} onPress={handleGrantAll}>
            <Sparkles size={18} color="#0a0f1e" style={{ marginRight: 6 }} />
            <Text style={styles.allowAllBatchBtnText}>ஒரே கிளிக்கில் அனைத்தையும் அனுமதி (1-Click Allow All)</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={handleContinue}
        >
          <Text style={styles.primaryButtonText}>தொடரவும் • Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1e' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  header: { marginBottom: 24, marginTop: 30 },
  title: { fontSize: 26, fontWeight: '900', color: '#34d399', marginBottom: 8 },
  subtitle: { fontSize: 13, color: '#94a3b8', lineHeight: 18 },
  card: { backgroundColor: '#111827', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(52,211,153,0.2)' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconContainer: { backgroundColor: 'rgba(52,211,153,0.1)', padding: 10, borderRadius: 12, marginRight: 14 },
  cardTextContainer: { flex: 1 },
  cardTitle: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginBottom: 3 },
  cardDesc: { color: '#94a3b8', fontSize: 12, lineHeight: 16 },
  grantBtn: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: 'rgba(52,211,153,0.5)', paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  grantBtnText: { color: '#34d399', fontWeight: 'bold', fontSize: 13 },
  grantedBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(16,185,129,0.1)', paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)' },
  grantedText: { color: '#10b981', fontWeight: 'bold', marginLeft: 6, fontSize: 12 },
  allowAllBatchBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#34d399', paddingVertical: 14, borderRadius: 12, marginTop: 8, marginBottom: 16 },
  allowAllBatchBtnText: { color: '#0a0f1e', fontWeight: '900', fontSize: 13 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#0a0f1e', borderTopWidth: 1, borderTopColor: 'rgba(52,211,153,0.1)' },
  primaryButton: { backgroundColor: '#10b981', padding: 15, borderRadius: 12, alignItems: 'center' },
  primaryButtonText: { color: '#0a0f1e', fontSize: 15, fontWeight: 'bold' },
});
