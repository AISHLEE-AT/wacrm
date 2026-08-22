import React, { useEffect, useState, useContext, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { LocationService } from '../services/LocationService';
import { NotificationService } from '../services/NotificationService';
import { LogOut } from 'lucide-react-native';
import { AppContext } from '../context/AppContext';
import { LocationContext } from '../context/LocationContext';
import { supabase } from '../lib/supabase';
import { colors, spacing, radius, fontSize } from '../lib/theme';

// ─── Profile Section Components ───
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { ContactInfoCard } from '../components/profile/ContactInfoCard';
import { WhatsAppWindowCard } from '../components/profile/WhatsAppWindowCard';
import { UpiQrCard } from '../components/profile/UpiQrCard';
import { DigitalIdCard } from '../components/profile/DigitalIdCard';
import { DriverStatusCard } from '../components/profile/DriverStatusCard';
import { SecuritySection } from '../components/profile/SecuritySection';
import { AppearanceSection } from '../components/profile/AppearanceSection';
import { SetupChecklist } from '../components/profile/SetupChecklist';
import { UserCategoryCard } from '../components/profile/UserCategoryCard';
import { PurchaseOrderHistoryCard } from '../components/profile/PurchaseOrderHistoryCard';
import { SupportCard } from '../components/profile/SupportCard';

const endpoints = {
  updateProfile: 'https://watscrm.vercel.app/api/profile/update',
};

export default function DashboardScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const {
    user,
    userRole,
    isAdmin,
    geminiApiKey,
    updateGeminiKey,
    themeMode,
    themeAccent,
    themeVer,
    setThemeMode,
    setThemeAccent,
  } = useContext(AppContext);

  const [phone, setPhone] = useState<string | null>('');
  const [dbProfile, setDbProfile] = useState<any>(null);
  const [driverProfile, setDriverProfile] = useState<any>(null);
  const [isDriver, setIsDriver] = useState(false);
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
          const prof = { ...profileData[0] };
          if (!prof.upi_id || prof.upi_id.trim() === '') {
            const defaultUpi = `${cleanPhone}@upi`;
            prof.upi_id = defaultUpi;
            supabase
              .from('profiles')
              .update({ upi_id: defaultUpi })
              .eq('id', prof.id)
              .then(
                () => {},
                (err: any) => console.warn('Auto UPI DB update warning:', err)
              );
          }

          setDbProfile(prof);

          // Set up Realtime subscription for live profile updates
          channel = supabase
            .channel(`mobile:profiles:${prof.id}`)
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'profiles' },
              (payload: any) => {
                if (payload.new && payload.new.id === prof.id) {
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
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading Profile...</Text>
      </View>
    );
  }

  const userId = dbProfile?.id || user?.phone || '';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.contentContainer,
        {
          paddingTop:
            Math.max(
              insets.top,
              Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0
            ) + 16,
          paddingBottom: Math.max(insets.bottom, 16) + 120,
        },
      ]}
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

      {/* ──── 2.5 WhatsApp 24h Live Window & Alert Status Card ──── */}
      <WhatsAppWindowCard />

      {/* ──── 3. Setup Checklist ──── */}
      <SetupChecklist
        profile={dbProfile}
        driverProfile={driverProfile}
        geminiApiKey={geminiApiKey}
        pushToken={pushToken}
      />

      {/* ──── 3.5 User Type & Module Category Selection ──── */}
      <UserCategoryCard
        profile={dbProfile}
        phone={phone || ''}
        navigation={navigation}
        onProfileUpdate={handleProfileUpdate}
      />

      {/* ──── 4. Category-wise Purchase & Order History ──── */}
      <PurchaseOrderHistoryCard
        phone={phone || ''}
        userId={userId}
      />

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
        fullName={dbProfile?.full_name || user?.name || 'SuprO Partner'}
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

      {/* ──── 10. Support SuprO ──── */}
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

      {/* ──── 12. App Version Info ──── */}
      <View style={{ alignItems: 'center', marginTop: 24, marginBottom: 8 }}>
        <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: '700', letterSpacing: 0.5 }}>
          SuprO SuperApp • v3.2.1 Beta SuprO
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2, opacity: 0.7 }}>
          Build 4 • Tamil Nadu Ecosystem
        </Text>
      </View>

      {/* Bottom spacing */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.xl,
    paddingTop: 60,
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: fontSize.md,
    fontWeight: '600',
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
