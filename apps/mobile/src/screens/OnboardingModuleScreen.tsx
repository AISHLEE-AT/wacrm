// @ts-nocheck
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform,
  Dimensions,
} from 'react-native';
import {
  Car,
  Truck,
  Store,
  GraduationCap,
  Wrench,
  Users,
  Compass,
  Sparkles,
  ChevronRight,
  MapPin,
  Shield,
  UserCircle,
} from 'lucide-react-native';
import { AppContext } from '../context/AppContext';
import { LocationContext } from '../context/LocationContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function OnboardingModuleScreen({ navigation }: any) {
  const { user, updateUserProfile } = useContext(AppContext);
  const locationCtx = useContext(LocationContext);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const userName = user?.name ? user.name.split(' ')[0] : 'Partner';
  const activeLocation = locationCtx?.district || locationCtx?.city || user?.city || 'Tamil Nadu';

  const MODULES = [
    {
      id: 'RideO',
      catId: 'Traveller',
      title: 'RideO',
      subtitle: 'Auto & Cab Booking',
      tamilSubtitle: 'பயண முன்பதிவு',
      icon: Car,
      color: '#10b981',
      badge: '12+ Active Drivers',
      route: 'RideOScreen',
    },
    {
      id: 'DriveO',
      catId: 'Driver',
      title: 'DriveO',
      subtitle: 'Driver & Goods Transit',
      tamilSubtitle: 'ஓட்டுநர் வருவாய்',
      icon: Truck,
      color: '#0284c7',
      badge: 'Earn Daily',
      route: 'DriveOScreen',
    },
    {
      id: 'AgrO',
      catId: 'Farmer',
      title: 'AgrO & RentO',
      subtitle: 'Tractor Hire & Mandi',
      tamilSubtitle: 'விவசாயம் & வாடகை',
      icon: Wrench,
      color: '#f59e0b',
      badge: 'Live Mandi',
      route: 'AgrOScreen',
    },
    {
      id: 'TutO',
      catId: 'Student',
      title: 'TutO Studio',
      subtitle: 'Classes & Mock Tests',
      tamilSubtitle: 'கல்வி & தேர்வுகள்',
      icon: GraduationCap,
      color: '#818cf8',
      badge: 'TNPSC / NEET',
      route: 'TutOHubScreen',
    },
    {
      id: 'DealO',
      catId: 'Shopper',
      title: 'DealO Bazaar',
      subtitle: 'Local Trade & Crops',
      tamilSubtitle: 'கிராமத்து சந்தை',
      icon: Store,
      color: '#ec4899',
      badge: 'Buy & Sell',
      route: 'DealOScreen',
    },
    {
      id: 'GroupO',
      catId: 'Group',
      title: 'GroupO',
      subtitle: 'Women SHG & Sangam',
      tamilSubtitle: 'சுயஉதவி குழுக்கள்',
      icon: Users,
      color: '#a855f7',
      badge: 'Micro-Finance',
      route: 'GroupOScreen',
    },
    {
      id: 'TourO',
      catId: 'Tourist',
      title: 'TourO Guide',
      subtitle: 'Girivalam & Pilgrimage',
      tamilSubtitle: 'ஆன்மீக சுற்றுலா',
      icon: Compass,
      color: '#06b6d4',
      badge: 'Temple Stays',
      route: 'ModuleView',
      params: { path: '/touro', moduleName: 'TourO Guide' },
    },
    {
      id: 'AIBot',
      catId: 'Traveller',
      title: 'SuprO AI Hub',
      subtitle: 'Voice Assistant & Tools',
      tamilSubtitle: 'குரல் AI உதவியாளர்',
      icon: Sparkles,
      color: '#14b8a6',
      badge: 'Smart Tools',
      route: 'AishleeToolsScreen',
    },
  ];

  const handleSelect = async (mod: any) => {
    setLoadingId(mod.id);
    try {
      if (updateUserProfile) {
        updateUserProfile({ category: mod.catId }).catch(() => {});
      }
      if (mod.params) {
        navigation.navigate(mod.route, mod.params);
      } else {
        navigation.navigate(mod.route);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to open module');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#070b14" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── 1. MINIMAL AMBIENT HEADER ─── */}
        <View style={styles.header}>
          <View style={styles.telemetryRow}>
            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>SUPRO ACTIVE HUB</Text>
            </View>

            <TouchableOpacity
              style={styles.profileBtn}
              onPress={() => navigation?.navigate?.('Dashboard', { screen: 'DashboardTab' })}
              activeOpacity={0.75}
            >
              <UserCircle size={14} color="#38bdf8" style={{ marginRight: 4 }} />
              <Text style={styles.profileBtnText}>View Profile</Text>
            </TouchableOpacity>

            <View style={styles.locationPill}>
              <MapPin size={12} color="#94a3b8" style={{ marginRight: 4 }} />
              <Text style={styles.locationText} numberOfLines={1}>{activeLocation}</Text>
            </View>
          </View>

          <Text style={styles.greetingTitle}>
            வணக்கம், <Text style={styles.greetingHighlight}>{userName}</Text>
          </Text>
          <Text style={styles.greetingSubtitle}>
            எந்த சேவையைத் தொடங்க விரும்புகிறீர்கள்? Pick your module to continue.
          </Text>
        </View>

        {/* ─── 2. INNOVATIVE TACTILE MODULE GRID ─── */}
        <View style={styles.gridContainer}>
          {MODULES.map((mod) => {
            const IconComp = mod.icon;
            const isLoading = loadingId === mod.id;
            return (
              <TouchableOpacity
                key={mod.id}
                style={[
                  styles.tactileCard,
                  {
                    borderColor: mod.color + '40',
                    borderBottomColor: mod.color,
                  },
                ]}
                onPress={() => handleSelect(mod)}
                disabled={loadingId !== null}
                activeOpacity={0.75}
              >
                {/* Top Row: Icon + Badge */}
                <View style={styles.cardTopRow}>
                  <View style={[styles.iconBox, { backgroundColor: mod.color + '20', borderColor: mod.color + '45' }]}>
                    <IconComp size={22} color={mod.color} />
                  </View>
                  <View style={[styles.badgeBox, { backgroundColor: mod.color + '15' }]}>
                    <Text style={[styles.badgeText, { color: mod.color }]} numberOfLines={1}>
                      {mod.badge}
                    </Text>
                  </View>
                </View>

                {/* Module Details */}
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{mod.title}</Text>
                  <Text style={styles.cardSubtitle} numberOfLines={1}>{mod.subtitle}</Text>
                  <Text style={[styles.cardTamilSubtitle, { color: mod.color }]} numberOfLines={1}>
                    {mod.tamilSubtitle}
                  </Text>
                </View>

                {/* Bottom Tactile Action Link */}
                <View style={styles.cardFooter}>
                  {isLoading ? (
                    <ActivityIndicator size="small" color={mod.color} />
                  ) : (
                    <>
                      <Text style={[styles.cardActionText, { color: mod.color }]}>தொடங்கு</Text>
                      <View style={[styles.arrowBox, { backgroundColor: mod.color + '20' }]}>
                        <ChevronRight size={13} color={mod.color} />
                      </View>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ─── 3. SUBTLE FOOTER TIP ─── */}
        <View style={styles.footerTip}>
          <Shield size={14} color="#64748b" style={{ marginRight: 6 }} />
          <Text style={styles.footerTipText}>
            Click back anytime to return here and switch modules.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070b14',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 44 : 54,
    paddingBottom: 40,
  },

  /* Header */
  header: {
    marginBottom: 20,
  },
  telemetryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  statusText: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  profileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  profileBtnText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  locationText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
    maxWidth: 130,
  },
  greetingTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#f8fafc',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  greetingHighlight: {
    color: '#38bdf8',
  },
  greetingSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
  },

  /* Tactile Module Grid */
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },
  tactileCard: {
    width: CARD_WIDTH,
    backgroundColor: '#0c1322',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1.5,
    borderBottomWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
    justifyContent: 'space-between',
    minHeight: 168,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeBox: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    maxWidth: CARD_WIDTH - 64,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  cardContent: {
    marginTop: 10,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: -0.2,
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  cardTamilSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  cardActionText: {
    fontSize: 12,
    fontWeight: '800',
  },
  arrowBox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Footer Tip */
  footerTip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#0a0f1d',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  footerTipText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
});
