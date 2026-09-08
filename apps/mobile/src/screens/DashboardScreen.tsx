import React, { useEffect, useState, useContext, useMemo } from 'react';
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
import { LogOut, ArrowLeft, User, CreditCard, Settings, ShoppingBag } from 'lucide-react-native';
import { AppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { colors, spacing, radius } from '../lib/theme';

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

type ProfileTab = 'profile' | 'payments' | 'settings' | 'orders';

export default function DashboardScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const {
    user,
    isAdmin,
    geminiApiKey,
    themeMode,
    themeAccent,
    setThemeMode,
    setThemeAccent,
  } = useContext(AppContext);

  const [phone, setPhone] = useState<string | null>('');
  const [dbProfile, setDbProfile] = useState<any>(null);
  const [driverProfile, setDriverProfile] = useState<any>(null);
  const [isDriver, setIsDriver] = useState(false);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [activeTab, setActiveTab] = useState<ProfileTab>('profile');

  // Format phone for display
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

  // Load profile from Supabase with memoized fetch
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
              .then(() => {}, (err: any) => console.warn('Auto UPI DB update warning:', err));
          }

          setDbProfile(prof);

          // Realtime subscription for live profile updates
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

        // Fetch driver profile if user is driver
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
    };

    initProfile();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const handleProfileUpdate = (updatedProfile: any) => {
    setDbProfile((prev: any) => ({ ...prev, ...updatedProfile }));
  };

  const handleLogout = () => {
    Alert.alert('Sign Out / வெளியேறு', 'Are you sure you want to sign out from SuprO?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          await SecureStore.deleteItemAsync('sb-access-token');
          await SecureStore.deleteItemAsync('user-phone');
          await SecureStore.deleteItemAsync('user-role');
          await SecureStore.deleteItemAsync('gemini-api-key');
          navigation.replace('Login');
        },
      },
    ]);
  };

  // Loading State
  if (isLoadingProfile) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading Profile...</Text>
      </View>
    );
  }

  const userId = dbProfile?.id || user?.phone || '';

  const TABS = [
    { id: 'profile', label: 'Overview', icon: User, color: '#10b981' },
    { id: 'payments', label: 'UPI & QR', icon: CreditCard, color: '#f59e0b' },
    { id: 'settings', label: 'Settings', icon: Settings, color: '#38bdf8' },
    { id: 'orders', label: 'Activity', icon: ShoppingBag, color: '#a855f7' },
  ];

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
            ) + 12,
          paddingBottom: Math.max(insets.bottom, 16) + 120,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* ──── Top Header Row with Back to Modules Button ──── */}
      <View style={styles.topBarRow}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation?.canGoBack?.() ? navigation.goBack() : navigation?.replace?.('OnboardingModule')}
          activeOpacity={0.7}
        >
          <ArrowLeft size={18} color={colors.text} style={{ marginRight: 6 }} />
          <Text style={[styles.backBtnText, { color: colors.text }]}>Modules</Text>
        </TouchableOpacity>
        <Text style={[styles.screenTitle, { color: colors.text }]}>My Profile</Text>
        <View style={{ width: 75 }} />
      </View>

      {/* ──── 1. Profile Header (Avatar, Click to View Profile, Name, Role) ──── */}
      <ProfileHeader
        profile={dbProfile}
        userId={userId}
        isAdmin={isAdmin}
        isDriver={isDriver}
        phone={phone || ''}
        onProfileUpdate={handleProfileUpdate}
      />

      {/* ──── 2. High-Speed Segmented Tabs (Zero Lag) ──── */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const IconC = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabItem,
                isActive && [styles.tabItemActive, { borderColor: tab.color + '60', backgroundColor: tab.color + '15' }],
              ]}
              onPress={() => setActiveTab(tab.id as ProfileTab)}
              activeOpacity={0.75}
            >
              <IconC size={15} color={isActive ? tab.color : '#64748b'} style={{ marginRight: 5 }} />
              <Text style={[styles.tabItemText, { color: isActive ? tab.color : '#64748b' }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ──── 3. Fast Tab Content (Only renders active tab for 60 FPS performance) ──── */}
      {activeTab === 'profile' && (
        <View style={styles.tabContent}>
          <DigitalIdCard
            profile={dbProfile}
            isAdmin={isAdmin}
            phone={displayPhone}
          />
          <UserCategoryCard
            profile={dbProfile}
            phone={phone || ''}
            navigation={navigation}
            onProfileUpdate={handleProfileUpdate}
          />
          <WhatsAppWindowCard />
          {isDriver && (
            <DriverStatusCard
              driverProfile={driverProfile}
              fullName={dbProfile?.full_name || user?.name || 'Driver Partner'}
              navigation={navigation}
            />
          )}
        </View>
      )}

      {activeTab === 'payments' && (
        <View style={styles.tabContent}>
          <UpiQrCard
            upiId={dbProfile?.upi_id || ''}
            fullName={dbProfile?.full_name || user?.name || 'SuprO Partner'}
            phone={(phone || '').replace(/\D/g, '')}
          />
          <DriverStatusCard
            driverProfile={driverProfile}
            fullName={dbProfile?.full_name || user?.name || 'Driver Partner'}
            navigation={navigation}
          />
        </View>
      )}

      {activeTab === 'settings' && (
        <View style={styles.tabContent}>
          <ContactInfoCard
            profile={dbProfile}
            userId={userId}
            phone={phone || ''}
            onProfileUpdate={handleProfileUpdate}
          />
          <SecuritySection phone={phone || ''} />
          <AppearanceSection
            currentMode={themeMode}
            currentAccent={themeAccent}
            onModeChange={setThemeMode}
            onAccentChange={setThemeAccent}
          />
          <SupportCard />
        </View>
      )}

      {activeTab === 'orders' && (
        <View style={styles.tabContent}>
          <PurchaseOrderHistoryCard
            phone={phone || ''}
            userId={dbProfile?.id || user?.id}
            navigation={navigation}
          />
          <SetupChecklist
            profile={dbProfile}
            driverProfile={driverProfile}
            geminiApiKey={geminiApiKey}
            pushToken={pushToken}
          />
        </View>
      )}

      {/* ──── 4. Sign Out Button ──── */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <LogOut color={colors.destructive} size={18} style={{ marginRight: 8 }} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      {/* ──── 5. App Version Info ──── */}
      <View style={{ alignItems: 'center', marginTop: 20, marginBottom: 8 }}>
        <Text style={{ color: '#64748b', fontSize: 12, fontWeight: '700' }}>
          SuprO SuperApp • v3.2.1
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  topBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0c1322',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginVertical: 14,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
  },
  tabItemActive: {
    borderWidth: 1,
  },
  tabItemText: {
    fontSize: 11,
    fontWeight: '700',
  },
  tabContent: {
    gap: 14,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    marginTop: 20,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 15,
    fontWeight: '800',
  },
});
