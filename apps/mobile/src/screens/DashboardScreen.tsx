import React, { useEffect, useState, useContext, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { LocationService } from '../services/LocationService';
import { NotificationService } from '../services/NotificationService';
import { MapPin, Bell, LogOut, LayoutGrid } from 'lucide-react-native';
import { AppContext } from '../context/AppContext';
import { LocationContext } from '../context/LocationContext';
import { supabase } from '../lib/supabase';
import { colors, spacing, radius, fontSize } from '../lib/theme';

// ─── Profile Section Components ───
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { ContactInfoCard } from '../components/profile/ContactInfoCard';
import { UpiQrCard } from '../components/profile/UpiQrCard';
import { DigitalIdCard } from '../components/profile/DigitalIdCard';
import { DriverStatusCard } from '../components/profile/DriverStatusCard';
import { SecuritySection } from '../components/profile/SecuritySection';
import { AppearanceSection } from '../components/profile/AppearanceSection';
import { SetupChecklist } from '../components/profile/SetupChecklist';
import { SupportCard } from '../components/profile/SupportCard';

const endpoints = {
  updateProfile: 'https://watscrm.vercel.app/api/profile/update',
};

export default function DashboardScreen({ navigation }: any) {
  const {
    user,
    userRole,
    isAdmin,
    geminiApiKey,
    updateGeminiKey,
    themeMode,
    themeAccent,
    setThemeMode,
    setThemeAccent,
  } = useContext(AppContext);

  const [phone, setPhone] = useState<string | null>('');
  const [dbProfile, setDbProfile] = useState<any>(null);
  const [driverProfile, setDriverProfile] = useState<any>(null);
  const [isDriver, setIsDriver] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // ─── Format phone for display ───
  const formatCleanPhone = (raw?: string) => {
    if (!raw) return '';
    let clean = raw;
    if (clean.includes('@')) clean = clean.split('@')[0];
    clean = clean.replace(/\D/g, '');
    if (clean.startsWith('91') && clean.length === 12) clean = clean.substring(2);
    if (clean.length === 10) return `+91 ${clean.substring(0, 5)} ${clean.substring(5)}`;
    return raw;
  };

  const displayPhone = formatCleanPhone(phone || '');

  // ─── Load profile from Supabase + Realtime subscription ───
  useEffect(() => {
    let channel: any = null;

    const initProfile = async () => {
      const savedPhone = await SecureStore.getItemAsync('user-phone');
      setPhone(savedPhone);

      if (!savedPhone) {
        setIsLoadingProfile(false);
        return;
      }

      const cleanPhone = savedPhone.replace(/\D/g, '').slice(-10);

      try {
        // Fetch full profile from Supabase
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .or(`phone.ilike.%${cleanPhone}%,email.ilike.%${cleanPhone}%`)
          .order('created_at', { ascending: false })
          .limit(1);

        if (profileData && profileData.length > 0) {
          setDbProfile(profileData[0]);

          // Set up Realtime subscription for live profile updates
          channel = supabase
            .channel(`mobile:profiles:${profileData[0].id}`)
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'profiles' },
              (payload: any) => {
                if (payload.new && payload.new.id === profileData[0].id) {
                  setDbProfile((prev: any) => ({ ...prev, ...payload.new }));
                }
              }
            )
            .subscribe();
        }

        // Fetch driver profile
        const { data: driverData } = await supabase
          .from('drivers')
          .select('*')
          .or(`phone.ilike.%${cleanPhone}%,mobile_number.ilike.%${cleanPhone}%,whatsapp_number.ilike.%${cleanPhone}%`)
          .order('created_at', { ascending: false })
          .limit(1);

        if (driverData && driverData.length > 0) {
          setDriverProfile(driverData[0]);
          setIsDriver(true);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setIsLoadingProfile(false);
      }

      // Initialize push notifications
      const token = await NotificationService.registerForPushNotificationsAsync();
      if (token) {
        setPushToken(token);
        fetch(endpoints.updateProfile, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: savedPhone, pushToken: token }),
        }).catch(console.error);
      }
    };

    initProfile();

    return () => {
      if (channel) channel.unsubscribe();
    };
  }, []);

  // ─── Callback: refresh profile after update ───
  const handleProfileUpdate = useCallback((updatedProfile: any) => {
    if (updatedProfile) {
      setDbProfile((prev: any) => ({ ...prev, ...updatedProfile }));
    }
  }, []);

  // ─── GPS Tracking ───
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

  // ─── Push Notification Test ───
  const handleTestNotification = async () => {
    if (pushToken) {
      await NotificationService.sendTestNotification(pushToken);
      Alert.alert('Sent!', 'Check your notification center.');
    } else {
      Alert.alert('No Token', 'Push notifications are not configured properly on this device.');
    }
  };

  // ─── Logout ───
  const handleLogout = async () => {
    await LocationService.stopTracking();
    await SecureStore.deleteItemAsync('sb-access-token');
    await SecureStore.deleteItemAsync('user-phone');
    await SecureStore.deleteItemAsync('user-role');
    await SecureStore.deleteItemAsync('gemini-api-key');
    navigation.replace('Login');
  };

  // ─── Loading State ───
  if (isLoadingProfile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Loading Profile...</Text>
      </View>
    );
  }

  const userId = dbProfile?.id || user?.phone || '';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* ──── 1. Profile Header (Avatar, Name, Role) ──── */}
      <ProfileHeader
        profile={dbProfile}
        userId={userId}
        isAdmin={isAdmin}
        isDriver={isDriver}
        phone={phone || ''}
        onProfileUpdate={handleProfileUpdate}
      />

      {/* ──── 2. Contact & Info Card (Phone, Location, UPI, Gemini Key) ──── */}
      <ContactInfoCard
        profile={dbProfile}
        userId={userId}
        phone={phone || ''}
        onProfileUpdate={handleProfileUpdate}
      />

      {/* ──── 3. Setup Checklist ──── */}
      <SetupChecklist
        profile={dbProfile}
        driverProfile={driverProfile}
        geminiApiKey={geminiApiKey}
        pushToken={pushToken}
      />

      {/* ──── 3.5 App Navigation Settings ──── */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>App Navigation</Text>

        <TouchableOpacity
          style={[styles.deviceButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('CategoryScreen')}
          activeOpacity={0.8}
        >
          <LayoutGrid color="#fff" size={20} style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>Open Full Module Grid (Setup)</Text>
        </TouchableOpacity>
      </View>

      {/* ──── 4. Device Settings (GPS + Push Notifications) ──── */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Device Settings</Text>

        <TouchableOpacity
          style={[styles.deviceButton, styles.trackButton, isTracking && styles.trackButtonActive]}
          onPress={toggleTracking}
          activeOpacity={0.8}
        >
          <MapPin color="#fff" size={20} style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>
            {isTracking ? 'Stop GPS Tracking' : 'Start Background GPS Tracking'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.deviceButton, styles.notifyButton]}
          onPress={handleTestNotification}
          activeOpacity={0.8}
        >
          <Bell color="#fff" size={20} style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>Test Push Notification</Text>
        </TouchableOpacity>
      </View>

      {/* ──── 5. Security (PIN Change) ──── */}
      <SecuritySection phone={phone || ''} />

      {/* ──── 6. Appearance (Theme) ──── */}
      <AppearanceSection
        currentMode={themeMode}
        currentAccent={themeAccent}
        onModeChange={setThemeMode}
        onAccentChange={setThemeAccent}
      />

      {/* ──── 7. UPI QR Code ──── */}
      <UpiQrCard
        upiId={dbProfile?.upi_id || ''}
        fullName={dbProfile?.full_name || user?.name || 'FAGO Partner'}
        phone={(phone || '').replace(/\D/g, '')}
      />

      {/* ──── 8. Digital ID ──── */}
      <DigitalIdCard
        profile={dbProfile}
        isAdmin={isAdmin}
        phone={displayPhone}
      />

      {/* ──── 9. Driver Status ──── */}
      <DriverStatusCard
        driverProfile={driverProfile}
        fullName={dbProfile?.full_name || user?.name || 'Driver Partner'}
        navigation={navigation}
      />

      {/* ──── 10. Support FAGO ──── */}
      <SupportCard />

      {/* ──── 11. Sign Out ──── */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <LogOut color={colors.destructive} size={20} style={{ marginRight: 8 }} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      {/* Bottom spacing */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.xl,
    paddingTop: 60,
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    fontWeight: '600',
  },

  // ─── Device Settings Section ───
  sectionContainer: {
    marginBottom: spacing.xxxl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  deviceButton: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  trackButton: {
    backgroundColor: colors.accent,
  },
  trackButtonActive: {
    backgroundColor: colors.amber,
  },
  notifyButton: {
    backgroundColor: colors.purple,
  },
  buttonText: {
    color: '#fff',
    fontSize: fontSize.md + 1,
    fontWeight: 'bold',
  },

  // ─── Sign Out ───
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: colors.destructiveLight,
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.destructiveBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  logoutText: {
    color: colors.destructive,
    fontSize: fontSize.md + 1,
    fontWeight: 'bold',
  },
});
