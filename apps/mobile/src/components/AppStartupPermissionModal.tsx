// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  PermissionsAndroid,
  Linking,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import {
  Mic,
  MapPin,
  Camera as CameraIcon,
  FolderOpen,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Settings,
} from 'lucide-react-native';

const PERMISSIONS_STORAGE_KEY = '@supro_permissions_v2_status';

export interface PermissionStatusMap {
  audio: boolean;
  location: boolean;
  camera: boolean;
  media: boolean;
}

export default function AppStartupPermissionModal() {
  const [visible, setVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<PermissionStatusMap>({
    audio: false,
    location: false,
    camera: false,
    media: false,
  });

  useEffect(() => {
    checkAllPermissionsOnLaunch();
  }, []);

  const checkAllPermissionsOnLaunch = async () => {
    if (Platform.OS !== 'android') return;
    try {
      const stored = await AsyncStorage.getItem(PERMISSIONS_STORAGE_KEY);

      // Check live status
      const audioGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      );
      const locGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      const cameraGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );
      const mediaGranted =
        (await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
        )) ||
        (Platform.Version >= 33 &&
          (await PermissionsAndroid.check(
            'android.permission.READ_MEDIA_AUDIO' as any
          )));

      const currentMap = {
        audio: !!audioGranted,
        location: !!locGranted,
        camera: !!cameraGranted,
        media: !!mediaGranted,
      };
      setStatus(currentMap);

      const allGranted = currentMap.audio && currentMap.location && currentMap.camera;

      if (!allGranted && stored !== 'dismissed_permanent') {
        setVisible(true);
      }
    } catch (e) {
      console.warn('Error checking startup permissions:', e);
    }
  };

  const handleAllowAllOneClick = async () => {
    setIsLoading(true);
    if (Platform.OS === 'android') {
      try {
        const permissionsToRequest: any[] = [
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.MODIFY_AUDIO_SETTINGS,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
          PermissionsAndroid.PERMISSIONS.CAMERA,
        ];

        if (Platform.Version >= 33) {
          permissionsToRequest.push('android.permission.READ_MEDIA_AUDIO' as any);
          permissionsToRequest.push('android.permission.READ_MEDIA_IMAGES' as any);
          permissionsToRequest.push('android.permission.POST_NOTIFICATIONS' as any);
        } else {
          permissionsToRequest.push(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
          permissionsToRequest.push(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
        }

        const results = await PermissionsAndroid.requestMultiple(permissionsToRequest);

        // Also call Expo native handlers
        try {
          await Location.requestForegroundPermissionsAsync();
          await ImagePicker.requestCameraPermissionsAsync();
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        } catch (expoErr) {
          // Ignore
        }

        const isAudioGranted =
          results[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] ===
          PermissionsAndroid.RESULTS.GRANTED;
        const isLocGranted =
          results[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
          PermissionsAndroid.RESULTS.GRANTED;
        const isCameraGranted =
          results[PermissionsAndroid.PERMISSIONS.CAMERA] ===
          PermissionsAndroid.RESULTS.GRANTED;
        const isMediaGranted =
          results[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] ===
            PermissionsAndroid.RESULTS.GRANTED ||
          results['android.permission.READ_MEDIA_AUDIO'] ===
            PermissionsAndroid.RESULTS.GRANTED;

        const updatedMap = {
          audio: isAudioGranted,
          location: isLocGranted,
          camera: isCameraGranted,
          media: isMediaGranted,
        };
        setStatus(updatedMap);

        await AsyncStorage.setItem(PERMISSIONS_STORAGE_KEY, 'configured');

        if (isAudioGranted && isLocGranted && isCameraGranted) {
          setTimeout(() => {
            setVisible(false);
          }, 600);
        }
      } catch (err) {
        console.warn('Batch permission request error:', err);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
      setVisible(false);
    }
  };

  const handleOpenSettings = () => {
    Linking.openSettings();
  };

  const handleDismiss = async () => {
    await AsyncStorage.setItem(PERMISSIONS_STORAGE_KEY, 'dismissed_permanent');
    setVisible(false);
  };

  if (!visible) return null;

  const allApproved = status.audio && status.location && status.camera;

  const PERMISSION_ITEMS = [
    {
      id: 'audio',
      title: 'குரல் & மைக்ரோஃபோன் (Microphone)',
      desc: 'குரல் தேடல் (TeachO & TestO), குரல் AI பாட் (Kural Assistant)',
      icon: Mic,
      granted: status.audio,
      color: '#10b981',
    },
    {
      id: 'location',
      title: 'இருப்பிடம் (GPS Location)',
      desc: 'RideO, DriveO பயண வழிகாட்டல், AgrO வானிலை & உள்ளூர் சந்தை',
      icon: MapPin,
      granted: status.location,
      color: '#3b82f6',
    },
    {
      id: 'camera',
      title: 'கேமரா (Camera & Scanner)',
      desc: 'QR ஸ்கேன், பயிர் நோய் புகைப்படம் கண்டறிதல், ஆவணப் பதிவேற்றம்',
      icon: CameraIcon,
      granted: status.camera,
      color: '#f59e0b',
    },
    {
      id: 'media',
      title: 'மீடியா & ஆடியோ (Audio / Storage)',
      desc: 'கல்வி ஆடியோ கோப்புகள், பாடப் பதிவிறக்கங்கள் மற்றும் ஆவணங்கள்',
      icon: FolderOpen,
      granted: status.media,
      color: '#8b5cf6',
    },
  ];

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={handleDismiss}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header Badge */}
          <View style={styles.header}>
            <View style={styles.shieldIconWrap}>
              <ShieldCheck size={28} color="#10b981" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.modalTitle}>முழுமையான அனுமதி அமைப்பு</Text>
                <Sparkles size={16} color="#fbbf24" style={{ marginLeft: 6 }} />
              </View>
              <Text style={styles.modalSub}>
                1-Click One-Time App Permissions Setup
              </Text>
            </View>
          </View>

          <Text style={styles.infoBanner}>
            💡 செயலியில் குரல் தேடல், மைக், GPS, கேமரா சரியாக இயங்க அனைத்து அனுமதிகளையும் ஒரே கிளிக்கில் வழங்கவும்.
          </Text>

          {/* List of Permissions */}
          <ScrollView style={styles.permList} showsVerticalScrollIndicator={false}>
            {PERMISSION_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <View
                  key={item.id}
                  style={[
                    styles.permItem,
                    item.granted ? styles.permItemGranted : styles.permItemPending,
                  ]}
                >
                  <View
                    style={[
                      styles.itemIconWrap,
                      { backgroundColor: item.granted ? '#10b98120' : `${item.color}15` },
                    ]}
                  >
                    <Icon
                      size={20}
                      color={item.granted ? '#10b981' : item.color}
                    />
                  </View>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemDesc}>{item.desc}</Text>
                  </View>
                  <View style={styles.statusBadgeWrap}>
                    {item.granted ? (
                      <View style={styles.badgeGranted}>
                        <CheckCircle2 size={13} color="#10b981" style={{ marginRight: 4 }} />
                        <Text style={styles.badgeGrantedText}>அனுமதிக்கப்பட்டது</Text>
                      </View>
                    ) : (
                      <View style={styles.badgePending}>
                        <AlertCircle size={13} color="#f59e0b" style={{ marginRight: 4 }} />
                        <Text style={styles.badgePendingText}>தேவை</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionWrap}>
            <TouchableOpacity
              style={[styles.allowAllBtn, allApproved && styles.allowAllBtnSuccess]}
              onPress={handleAllowAllOneClick}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#0a0f1e" size="small" />
              ) : allApproved ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <CheckCircle2 size={18} color="#0a0f1e" style={{ marginRight: 6 }} />
                  <Text style={styles.allowAllBtnText}>அனைத்தும் தயார் • Continue</Text>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Sparkles size={18} color="#0a0f1e" style={{ marginRight: 6 }} />
                  <Text style={styles.allowAllBtnText}>
                    ஒரே கிளிக்கில் அனைத்தையும் அனுமதி (Allow All)
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.secondaryRow}>
              <TouchableOpacity style={styles.settingsBtn} onPress={handleOpenSettings}>
                <Settings size={14} color="#94a3b8" style={{ marginRight: 4 }} />
                <Text style={styles.settingsBtnText}>அமைப்புகள் (Settings)</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.skipBtn} onPress={handleDismiss}>
                <Text style={styles.skipBtnText}>பிறகு செய்கிறேன் (Skip)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 10, 25, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#0f172a',
    borderRadius: 24,
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    elevation: 20,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  shieldIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10b98120',
    borderWidth: 1,
    borderColor: '#10b98140',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modalSub: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  infoBanner: {
    fontSize: 12,
    color: '#cbd5e1',
    backgroundColor: '#1e293b80',
    padding: 10,
    borderRadius: 12,
    lineHeight: 18,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#10b981',
  },
  permList: {
    maxHeight: 280,
    marginBottom: 16,
  },
  permItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  permItemPending: {
    backgroundColor: '#111e33',
    borderColor: '#1e293b',
  },
  permItemGranted: {
    backgroundColor: '#10b9810d',
    borderColor: '#10b98140',
  },
  itemIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  itemDesc: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
    lineHeight: 15,
  },
  statusBadgeWrap: {
    alignItems: 'flex-end',
  },
  badgeGranted: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b98120',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeGrantedText: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: 'bold',
  },
  badgePending: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f59e0b20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgePendingText: {
    color: '#fbbf24',
    fontSize: 10,
    fontWeight: 'bold',
  },
  actionWrap: {
    marginTop: 4,
  },
  allowAllBtn: {
    backgroundColor: '#10b981',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  allowAllBtnSuccess: {
    backgroundColor: '#34d399',
  },
  allowAllBtnText: {
    color: '#0a0f1e',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  secondaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 4,
  },
  settingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  settingsBtnText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  skipBtn: {
    paddingVertical: 6,
  },
  skipBtnText: {
    color: '#64748b',
    fontSize: 11,
  },
});
