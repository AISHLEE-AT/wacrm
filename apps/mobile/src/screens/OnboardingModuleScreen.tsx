// @ts-nocheck
import React, { useState, useContext, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  StatusBar,
  Platform,
} from 'react-native';
import {
  Car,
  Truck,
  Store,
  GraduationCap,
  Wrench,
  Users,
  Compass,
  Search,
  Sparkles,
  ArrowRight,
  ChevronRight,
  MapPin,
  Zap,
  Activity,
  Award,
} from 'lucide-react-native';
import { AppContext } from '../context/AppContext';
import { LocationContext } from '../context/LocationContext';
import { colors } from '../lib/theme';

export default function OnboardingModuleScreen({ navigation }: any) {
  const { user, updateUserProfile } = useContext(AppContext);
  const locationCtx = useContext(LocationContext);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const userName = user?.name ? user.name.split(' ')[0] : 'Partner';
  const activeLocation = locationCtx?.district || locationCtx?.city || user?.city || 'Tamil Nadu';

  const handleSelect = async (categoryId: string, directRoute?: string) => {
    setLoadingId(categoryId);
    try {
      if (updateUserProfile) {
        await updateUserProfile({ category: categoryId });
      }
      if (directRoute) {
        navigation.replace(directRoute);
      } else {
        navigation.replace('Dashboard');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to switch module');
      setLoadingId(null);
    }
  };

  const QUICK_INTENTS = [
    { label: '⚡ Instant Ride', catId: 'Traveller', color: '#34d399' },
    { label: '🚜 Farm Machinery', catId: 'Farmer', color: '#fbbf24' },
    { label: '📚 Mock Tests', catId: 'Student', color: '#818cf8' },
    { label: '🏪 Local Bazaar', catId: 'Shopper', color: '#f472b6' },
    { label: '👥 SHG Sangam', catId: 'Group', color: '#c084fc' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#070b14" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ─── 1. AMBIENT TELEMETRY & GREETING HEADER ─── */}
        <View style={styles.header}>
          <View style={styles.telemetryRow}>
            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>SUPRO NEURAL HUB</Text>
            </View>

            <View style={styles.locationPill}>
              <MapPin size={12} color="#94a3b8" style={{ marginRight: 4 }} />
              <Text style={styles.locationText} numberOfLines={1}>{activeLocation}</Text>
            </View>
          </View>

          <Text style={styles.greetingTitle}>
            வணக்கம், <Text style={styles.greetingHighlight}>{userName}</Text>
          </Text>
          <Text style={styles.greetingSubtitle}>
            What do you need to do right now? Pick your mission or search below.
          </Text>
        </View>

        {/* ─── 2. AI SMART INTENT BAR & CHIPS ─── */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Search size={18} color="#64748b" style={{ marginRight: 10 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search ride, tractor, mock test, cattle..."
              placeholderTextColor="#64748b"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <View style={styles.aiBadge}>
              <Sparkles size={13} color="#34d399" />
              <Text style={styles.aiBadgeText}>AI Intent</Text>
            </View>
          </View>

          {/* 1-Tap Quick Action Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            {QUICK_INTENTS.map((chip) => (
              <TouchableOpacity
                key={chip.label}
                style={[styles.chip, { borderColor: chip.color + '40' }]}
                onPress={() => handleSelect(chip.catId)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, { color: chip.color }]}>{chip.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ─── 3. HIGH-TECH BENTO GRID ARCHITECTURE ─── */}
        <View style={styles.bentoContainer}>

          {/* BENTO 1 (HERO FULL-WIDTH): MOBILITY & COMMUTE HUB */}
          <View style={[styles.bentoCard, styles.heroCard]}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardHeaderLeft}>
                <View style={[styles.iconBox, { backgroundColor: '#34d39920' }]}>
                  <Car size={22} color="#34d399" />
                </View>
                <View>
                  <Text style={styles.heroCardTag}>MOBILITY & LOGISTICS</Text>
                  <Text style={styles.heroCardTitle}>RideO & DriveO Transit</Text>
                </View>
              </View>
              <View style={styles.liveBadge}>
                <Activity size={12} color="#34d399" style={{ marginRight: 4 }} />
                <Text style={styles.liveBadgeText}>12+ Drivers Online</Text>
              </View>
            </View>

            <Text style={styles.heroCardDesc}>
              Instant village autos, outstation cabs, goods transport, or drive and earn daily.
            </Text>

            <View style={styles.heroDualActions}>
              <TouchableOpacity
                style={[styles.heroBtn, styles.heroBtnPassenger]}
                onPress={() => handleSelect('Traveller')}
                disabled={loadingId !== null}
                activeOpacity={0.8}
              >
                {loadingId === 'Traveller' ? (
                  <ActivityIndicator size="small" color="#0a0f1e" />
                ) : (
                  <>
                    <Car size={16} color="#0a0f1e" style={{ marginRight: 6 }} />
                    <Text style={styles.heroBtnTextPassenger}>Book a Ride</Text>
                    <ArrowRight size={14} color="#0a0f1e" style={{ marginLeft: 4 }} />
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.heroBtn, styles.heroBtnDriver]}
                onPress={() => handleSelect('Driver')}
                disabled={loadingId !== null}
                activeOpacity={0.8}
              >
                {loadingId === 'Driver' ? (
                  <ActivityIndicator size="small" color="#38bdf8" />
                ) : (
                  <>
                    <Truck size={16} color="#38bdf8" style={{ marginRight: 6 }} />
                    <Text style={styles.heroBtnTextDriver}>Start Driving</Text>
                    <ChevronRight size={14} color="#38bdf8" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* BENTO 2 & 3: DUAL TILES (FARMING & EDUCATION) */}
          <View style={styles.bentoRow}>
            {/* AgrO & RentO */}
            <TouchableOpacity
              style={[styles.bentoCard, styles.halfCard, { borderColor: '#fbbf2435' }]}
              onPress={() => handleSelect('Farmer')}
              disabled={loadingId !== null}
              activeOpacity={0.75}
            >
              <View style={styles.tileTop}>
                <View style={[styles.iconBox, { backgroundColor: '#fbbf2420' }]}>
                  <Wrench size={20} color="#fbbf24" />
                </View>
                <View style={[styles.miniBadge, { backgroundColor: '#fbbf2415' }]}>
                  <Text style={[styles.miniBadgeText, { color: '#fbbf24' }]}>Mandi Live</Text>
                </View>
              </View>
              <Text style={[styles.cardTitle, { color: '#fbbf24' }]}>AgrO & RentO</Text>
              <Text style={styles.cardSubTitle}>Farmer & Equipment</Text>
              <Text style={styles.cardDesc}>Tractors, Harvesters, Soil advice & Mandi rates</Text>
              {loadingId === 'Farmer' ? (
                <ActivityIndicator color="#fbbf24" style={{ marginTop: 10 }} />
              ) : (
                <View style={styles.cardActionLink}>
                  <Text style={[styles.actionLinkText, { color: '#fbbf24' }]}>Open Farm Hub</Text>
                  <ChevronRight size={14} color="#fbbf24" />
                </View>
              )}
            </TouchableOpacity>

            {/* TutO & TestO */}
            <TouchableOpacity
              style={[styles.bentoCard, styles.halfCard, { borderColor: '#818cf835' }]}
              onPress={() => handleSelect('Student')}
              disabled={loadingId !== null}
              activeOpacity={0.75}
            >
              <View style={styles.tileTop}>
                <View style={[styles.iconBox, { backgroundColor: '#818cf820' }]}>
                  <GraduationCap size={20} color="#818cf8" />
                </View>
                <View style={[styles.miniBadge, { backgroundColor: '#818cf815' }]}>
                  <Text style={[styles.miniBadgeText, { color: '#818cf8' }]}>TNPSC/NEET</Text>
                </View>
              </View>
              <Text style={[styles.cardTitle, { color: '#818cf8' }]}>TutO Studio</Text>
              <Text style={styles.cardSubTitle}>Education & Exams</Text>
              <Text style={styles.cardDesc}>Tamil syllabus, Video classes, Daily mock test</Text>
              {loadingId === 'Student' ? (
                <ActivityIndicator color="#818cf8" style={{ marginTop: 10 }} />
              ) : (
                <View style={styles.cardActionLink}>
                  <Text style={[styles.actionLinkText, { color: '#818cf8' }]}>Start Learning</Text>
                  <ChevronRight size={14} color="#818cf8" />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* BENTO 4 & 5: DUAL TILES (COMMERCE & COMMUNITY) */}
          <View style={styles.bentoRow}>
            {/* DealO */}
            <TouchableOpacity
              style={[styles.bentoCard, styles.halfCard, { borderColor: '#f472b635' }]}
              onPress={() => handleSelect('Shopper')}
              disabled={loadingId !== null}
              activeOpacity={0.75}
            >
              <View style={styles.tileTop}>
                <View style={[styles.iconBox, { backgroundColor: '#f472b620' }]}>
                  <Store size={20} color="#f472b6" />
                </View>
                <View style={[styles.miniBadge, { backgroundColor: '#f472b615' }]}>
                  <Text style={[styles.miniBadgeText, { color: '#f472b6' }]}>Cattle/Crops</Text>
                </View>
              </View>
              <Text style={[styles.cardTitle, { color: '#f472b6' }]}>DealO Bazaar</Text>
              <Text style={styles.cardSubTitle}>Local Trading</Text>
              <Text style={styles.cardDesc}>Buy & sell local produce, livestock, and goods</Text>
              {loadingId === 'Shopper' ? (
                <ActivityIndicator color="#f472b6" style={{ marginTop: 10 }} />
              ) : (
                <View style={styles.cardActionLink}>
                  <Text style={[styles.actionLinkText, { color: '#f472b6' }]}>Browse Market</Text>
                  <ChevronRight size={14} color="#f472b6" />
                </View>
              )}
            </TouchableOpacity>

            {/* GroupO */}
            <TouchableOpacity
              style={[styles.bentoCard, styles.halfCard, { borderColor: '#c084fc35' }]}
              onPress={() => handleSelect('Group')}
              disabled={loadingId !== null}
              activeOpacity={0.75}
            >
              <View style={styles.tileTop}>
                <View style={[styles.iconBox, { backgroundColor: '#c084fc20' }]}>
                  <Users size={20} color="#c084fc" />
                </View>
                <View style={[styles.miniBadge, { backgroundColor: '#c084fc15' }]}>
                  <Text style={[styles.miniBadgeText, { color: '#c084fc' }]}>SHG Sangam</Text>
                </View>
              </View>
              <Text style={[styles.cardTitle, { color: '#c084fc' }]}>GroupO</Text>
              <Text style={styles.cardSubTitle}>Self-Help Groups</Text>
              <Text style={styles.cardDesc}>Women micro-finance, savings, meetings & schemes</Text>
              {loadingId === 'Group' ? (
                <ActivityIndicator color="#c084fc" style={{ marginTop: 10 }} />
              ) : (
                <View style={styles.cardActionLink}>
                  <Text style={[styles.actionLinkText, { color: '#c084fc' }]}>Enter Sangam</Text>
                  <ChevronRight size={14} color="#c084fc" />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* BENTO 6 (COMPACT WIDE): TOURO PILGRIMAGE & TOURISM */}
          <TouchableOpacity
            style={[styles.bentoCard, styles.tourCard, { borderColor: '#22d3ee35' }]}
            onPress={() => handleSelect('Tourist')}
            disabled={loadingId !== null}
            activeOpacity={0.75}
          >
            <View style={styles.tourLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#22d3ee20', marginRight: 12 }]}>
                <Compass size={22} color="#22d3ee" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                  <Text style={[styles.cardTitle, { color: '#22d3ee', marginRight: 8 }]}>TourO Guide</Text>
                  <View style={[styles.miniBadge, { backgroundColor: '#22d3ee15' }]}>
                    <Text style={[styles.miniBadgeText, { color: '#22d3ee' }]}>Girivalam & Heritage</Text>
                  </View>
                </View>
                <Text style={styles.cardDesc}>Temple darshan, local stays, and verified tourist navigation</Text>
              </View>
            </View>

            {loadingId === 'Tourist' ? (
              <ActivityIndicator color="#22d3ee" />
            ) : (
              <View style={[styles.arrowCircle, { backgroundColor: '#22d3ee20' }]}>
                <ChevronRight size={18} color="#22d3ee" />
              </View>
            )}
          </TouchableOpacity>

        </View>

        {/* ─── 4. BOTTOM QUICK LAUNCH BAR ─── */}
        <View style={styles.footerNote}>
          <Text style={styles.footerNoteText}>
            💡 You can switch modules anytime from the bottom navigation or profile settings.
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
    paddingHorizontal: 18,
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
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.25)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34d399',
    marginRight: 6,
  },
  statusText: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
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
    fontSize: 28,
    fontWeight: '900',
    color: '#f8fafc',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  greetingHighlight: {
    color: '#38bdf8',
  },
  greetingSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
  },

  /* Search & Quick Action Section */
  searchSection: {
    marginBottom: 22,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    color: '#f8fafc',
    fontSize: 13,
    paddingVertical: 0,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  aiBadgeText: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  chipsScroll: {
    flexDirection: 'row',
  },
  chip: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },

  /* Bento Grid */
  bentoContainer: {
    gap: 14,
  },
  bentoCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },

  /* Hero Card (RideO & DriveO) */
  heroCard: {
    borderColor: 'rgba(52, 211, 153, 0.35)',
    backgroundColor: '#0c1626',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  heroCardTag: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  heroCardTitle: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '800',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  liveBadgeText: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '700',
  },
  heroCardDesc: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
  },
  heroDualActions: {
    flexDirection: 'row',
    gap: 10,
  },
  heroBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 14,
  },
  heroBtnPassenger: {
    backgroundColor: '#34d399',
  },
  heroBtnDriver: {
    backgroundColor: '#111e33',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  heroBtnTextPassenger: {
    color: '#0a0f1e',
    fontSize: 13,
    fontWeight: '800',
  },
  heroBtnTextDriver: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: '800',
  },

  /* 2-Column Bento Rows */
  bentoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfCard: {
    flex: 1,
    padding: 14,
  },
  tileTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  miniBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  miniBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  cardSubTitle: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardDesc: {
    color: '#64748b',
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 10,
  },
  cardActionLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
  },
  actionLinkText: {
    fontSize: 11,
    fontWeight: '700',
    marginRight: 2,
  },

  /* TourO Card */
  tourCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  tourLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  /* Footer */
  footerNote: {
    marginTop: 20,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  footerNoteText: {
    color: '#64748b',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
});
