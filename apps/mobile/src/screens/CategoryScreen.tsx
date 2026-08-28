import React, { useContext, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
  Platform,
  StatusBar,
} from 'react-native';
import {
  Car,
  GraduationCap,
  MonitorPlay,
  Wallet,
  MapPin,
  ShoppingBag,
  Compass,
  Wrench,
  Shield,
  Award,
  Gamepad2,
  Search,
  X,
  Sparkles,
  ChevronRight,
  Pin,
  TrendingUp,
  Zap,
  Layers,
  Users,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { AppContext, ADMIN_PHONES } from '../context/AppContext';
import { colors } from '../lib/theme';

const { width } = Dimensions.get('window');

interface CategoryItem {
  id: string;
  title: string;
  desc: string;
  categoryGroup: 'mobility' | 'agri' | 'education' | 'finance' | 'admin';
  tag: string;
  tagColor: string;
  icon: any;
  iconName: string;
  color: string;
  bg: string;
  path: string;
  adminOnly?: boolean;
  featured?: boolean;
}

const CATEGORIES: CategoryItem[] = [

  {
    id: 'groupo',
    title: 'GroupO',
    desc: 'SHG & Village Ecosystem Management',
    categoryGroup: 'finance',
    tag: '👥 Self-Help',
    tagColor: '#8b5cf6',
    icon: Users,
    iconName: 'Users',
    color: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.15)',
    path: '/groupo',
    featured: true,
  },

  {
    id: 'rideo',
    title: 'RideO',
    desc: 'Instant Cabs, Autos & Bikes',
    categoryGroup: 'mobility',
    tag: '⚡ 0% Fee',
    tagColor: '#10b981',
    icon: Car,
    iconName: 'Car',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.15)',
    path: '/rideo',
    featured: true,
  },
  {
    id: 'driveo',
    title: 'DriveO',
    desc: 'Driver Partner & Earnings Hub',
    categoryGroup: 'mobility',
    tag: '🚗 Driver',
    tagColor: '#3b82f6',
    icon: MapPin,
    iconName: 'MapPin',
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.15)',
    path: '/drivo',
  },
  {
    id: 'agro',
    title: 'AgrO',
    desc: 'தமிழ்நாடு உழவர் உலகம் & வேளாண் டிவி',
    categoryGroup: 'agri',
    tag: '🌾 உழவர் களம்',
    tagColor: '#10b981',
    icon: Wrench,
    iconName: 'Wrench',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.15)',
    path: '/agro',
    featured: true,
  },
  {
    id: 'rento',
    title: 'RentO',
    desc: 'Tractors, Harvesters & Cargo',
    categoryGroup: 'agri',
    tag: '🚜 Equipment',
    tagColor: '#84cc16',
    icon: Wrench,
    iconName: 'Wrench',
    color: '#84cc16',
    bg: 'rgba(132, 204, 22, 0.15)',
    path: '/rento',
  },
  {
    id: 'dealo',
    title: 'DealO',
    desc: 'Hyperlocal Stores & Marketplace',
    categoryGroup: 'agri',
    tag: '🛍️ Offers',
    tagColor: '#f97316',
    icon: ShoppingBag,
    iconName: 'ShoppingBag',
    color: '#f97316',
    bg: 'rgba(249, 115, 22, 0.15)',
    path: '/dealo',
  },
  {
    id: 'tuto',
    title: 'TutO',
    desc: 'Unified LMS: TeachO + TestO All-in-One',
    categoryGroup: 'education',
    tag: '🎓 Super LMS',
    tagColor: '#00D084',
    icon: GraduationCap,
    iconName: 'GraduationCap',
    color: '#00D084',
    bg: 'rgba(0, 208, 132, 0.15)',
    path: '/tuto',
    featured: true,
  },
  {
    id: 'quiz',
    title: 'Daily Quiz',
    desc: 'Daily 10 MCQs & Telegram Quiz Hub',
    categoryGroup: 'education',
    tag: '🎯 Daily 10',
    tagColor: '#10b981',
    icon: Zap,
    iconName: 'Zap',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.15)',
    path: '/quiz',
    featured: true,
  },
  {
    id: 'touro',
    title: 'TourO',
    desc: 'Temple Trails & Village Tours',
    categoryGroup: 'mobility',
    tag: '🛕 Pilgrimage',
    tagColor: '#06b6d4',
    icon: Compass,
    iconName: 'Compass',
    color: '#06b6d4',
    bg: 'rgba(6, 182, 212, 0.15)',
    path: '/touro',
  },
  {
    id: 'moneyo',
    title: 'MoneyO',
    desc: 'Micro Credit & Direct P2P Pay',
    categoryGroup: 'finance',
    tag: '💰 0-Interest',
    tagColor: '#14b8a6',
    icon: Wallet,
    iconName: 'Wallet',
    color: '#14b8a6',
    bg: 'rgba(20, 184, 166, 0.15)',
    path: '/moneyo',
  },
  {
    id: 'admin',
    title: 'Admin CRM',
    desc: 'Ecosystem & Fleet Control',
    categoryGroup: 'admin',
    tag: '🛡️ Master',
    tagColor: '#ef4444',
    icon: Shield,
    iconName: 'Shield',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.15)',
    path: '/admin',
    adminOnly: true,
  },
];

const FILTER_GROUPS = [
  { id: 'all', label: 'All Apps', icon: Layers },
  { id: 'mobility', label: '🚗 Mobility', icon: Car },
  { id: 'agri', label: '🌾 Rural & Farm', icon: Wrench },
  { id: 'education', label: '🎓 Learn & Media', icon: GraduationCap },
  { id: 'finance', label: '💰 Finance & Play', icon: Wallet },
];

export default function CategoryScreen() {
  const navigation = useNavigation<any>();
  const { user, addRecentModule, userRole, isAdmin, pinnedModules, togglePinnedModule, themeMode, themeVer } = useContext(AppContext);

  const [setupMode, setSetupMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState<string>('all');

  const cleanPhone = (user?.phone || '').replace(/\D/g, '').slice(-10);
  const isSuperAdmin =
    isAdmin ||
    user?.isAdmin ||
    (cleanPhone && ADMIN_PHONES.includes(cleanPhone)) ||
    userRole === 'admin';

  // Handle module navigation
  const handleSelect = (cat: CategoryItem) => {
    if (cat.adminOnly && !isSuperAdmin) {
      return;
    }
    if (setupMode) {
      togglePinnedModule(cat.id);
      return;
    }
    addRecentModule({
      id: cat.id,
      name: cat.id,
      path: cat.path,
      label: cat.title,
      iconName: cat.iconName || 'Map',
    });

        if (cat.path === '/groupo') {
      navigation.navigate('GroupOScreen');
    } else if (cat.path === '/tuto') {
      navigation.navigate('TutOHubScreen');
    } else if (cat.path === '/quiz') {
      navigation.navigate('QuizScreen');
    } else if (cat.path === '/drivo') {
      navigation.navigate('DriveOScreen');
    } else if (cat.path === '/rideo') {
      navigation.navigate('RideOScreen');
    } else if (cat.path === '/agro' || cat.path === '/tvo') {
      navigation.navigate('AgrOScreen');
    } else if (cat.path === '/rento') {
      navigation.navigate('RentOScreen');
    } else if (cat.path === '/dealo') {
      navigation.navigate('DealOScreen');
    } else {
      navigation.navigate('ModuleView', {
        path: cat.path,
        moduleName: cat.title,
      });
    }
  };

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return CATEGORIES.filter((c) => {
      if (c.adminOnly && !isSuperAdmin) return false;
      if (activeGroup !== 'all' && c.categoryGroup !== activeGroup) return false;
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        return (
          c.title.toLowerCase().includes(q) ||
          c.desc.toLowerCase().includes(q) ||
          c.tag.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [isSuperAdmin, activeGroup, searchQuery]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* ─── Top Header & Search ─── */}
      <View style={[styles.headerContainer, { backgroundColor: colors.card, borderBottomColor: colors.borderLight }]}>
        <View style={styles.headerTopRow}>
          <View>
            <View style={styles.brandRow}>
              <Text style={[styles.brandTitle, { color: colors.text }]}>SuprO</Text>
              <View style={styles.hubBadge}>
                <Sparkles size={11} color="#00D084" />
                <Text style={styles.hubBadgeText}>ECOSYSTEM</Text>
              </View>
            </View>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {setupMode
                ? 'Tap up to 2 apps to pin in bottom navigation'
                : '12 Connected Super-App Services'}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setSetupMode(!setupMode)}
            style={[styles.pinToggleBtn, setupMode && styles.pinToggleBtnActive]}
            activeOpacity={0.8}
          >
            <Pin size={14} color={setupMode ? '#070C18' : '#00D084'} />
            <Text style={[styles.pinToggleText, setupMode && { color: '#070C18' }]}>
              {setupMode ? 'Done' : 'Pin Tabs'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchBarWrapper, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <Search size={18} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search rides, tractors, mandi, exams, tv..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {FILTER_GROUPS.map((group) => {
            const isActive = activeGroup === group.id;
            return (
              <TouchableOpacity
                key={group.id}
                style={[styles.filterChip, { backgroundColor: colors.card, borderColor: colors.borderLight }, isActive && styles.filterChipActive]}
                onPress={() => setActiveGroup(group.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterChipText, { color: colors.textSecondary }, isActive && styles.filterChipTextActive]}>
                  {group.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ─── Main Content Grid ─── */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Featured Spotlight Banner (Shown when no search query) */}
        {!searchQuery && activeGroup === 'all' && (
          <TouchableOpacity
            style={[styles.spotlightCard, { backgroundColor: colors.card }]}
            activeOpacity={0.85}
            onPress={() => handleSelect(CATEGORIES[0])}
          >
            <View style={styles.spotlightGlow} />
            <View style={styles.spotlightContent}>
              <View style={styles.spotlightHeader}>
                <View style={styles.spotlightBadge}>
                  <Zap size={12} color="#00D084" />
                  <Text style={styles.spotlightBadgeText}>POPULAR SPOTLIGHT</Text>
                </View>
                <Text style={styles.spotlightCommission}>0% Commission</Text>
              </View>

              <Text style={[styles.spotlightTitle, { color: colors.text }]}>RideO & Mandi Direct Connect</Text>
              <Text style={[styles.spotlightDesc, { color: colors.textSecondary }]}>
                Instant ride booking, driver payouts, and crop mandi prices at your fingertips.
              </Text>

              <View style={styles.spotlightActionRow}>
                <Text style={styles.spotlightActionText}>Explore Now</Text>
                <ChevronRight size={16} color="#00D084" />
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Bento Grid */}
        <View style={styles.bentoGrid}>
          {filteredCategories.map((cat) => {
            const Icon = cat.icon;
            const isPinned = pinnedModules?.includes(cat.id);

            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.bentoCard,
                  { backgroundColor: colors.card, borderColor: cat.color + '30' },
                  setupMode &&
                    isPinned && {
                      borderColor: '#00D084',
                      borderWidth: 2,
                      backgroundColor: 'rgba(0, 208, 132, 0.12)',
                    },
                ]}
                activeOpacity={0.75}
                onPress={() => handleSelect(cat)}
              >
                {/* Card Top Row: Icon + Tag */}
                <View style={styles.cardTopRow}>
                  <View style={[styles.iconBox, { backgroundColor: cat.bg }]}>
                    <Icon color={cat.color} size={24} />
                  </View>
                  <View style={[styles.cardTag, { backgroundColor: cat.color + '1A' }]}>
                    <Text style={[styles.cardTagText, { color: cat.color }]}>{cat.tag}</Text>
                  </View>
                </View>

                {/* Card Title & Desc */}
                <Text style={[styles.cardTitle, { color: colors.text }]}>{cat.title}</Text>
                <Text style={[styles.cardDesc, { color: colors.textMuted }]} numberOfLines={2}>
                  {cat.desc}
                </Text>

                {/* Pinned Badge in setup mode */}
                {setupMode && (
                  <View style={[styles.pinIndicator, { borderTopColor: colors.borderLight }]}>
                    <Pin
                      size={12}
                      color={isPinned ? '#00D084' : colors.textMuted}
                      fill={isPinned ? '#00D084' : 'transparent'}
                    />
                    <Text
                      style={[
                        styles.pinIndicatorText,
                        { color: isPinned ? '#00D084' : colors.textMuted },
                      ]}
                    >
                      {isPinned ? 'Pinned' : 'Tap to Pin'}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {filteredCategories.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>No modules match "{searchQuery}"</Text>
            <Text style={[styles.emptySub, { color: colors.textMuted }]}>Try searching for cab, tractor, crop, or exams.</Text>
          </View>
        )}

        {/* Footer info */}
        <View style={styles.footer}>
          <Text style={[styles.footerBrand, { color: colors.textMuted }]}>SuprO Super Ecosystem</Text>
          <Text style={[styles.footerText, { color: colors.border }]}>Powered by Aishlee Technology • 0% Platform Fee</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: Platform.OS === 'android' ? 44 : 54,
    paddingHorizontal: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  hubBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 208, 132, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  hubBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00D084',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  pinToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 208, 132, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 208, 132, 0.3)',
    gap: 6,
  },
  pinToggleBtnActive: {
    backgroundColor: '#00D084',
    borderColor: '#00D084',
  },
  pinToggleText: {
    color: '#00D084',
    fontWeight: '700',
    fontSize: 12,
  },
  // Search bar
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  // Filter chips
  filterScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipActive: {
    backgroundColor: '#00D084',
    borderColor: '#00D084',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#070C18',
    fontWeight: '700',
  },
  // Scroll content
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  // Spotlight banner
  spotlightCard: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 208, 132, 0.3)',
    overflow: 'hidden',
  },
  spotlightGlow: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
  },
  spotlightContent: {
    position: 'relative',
    zIndex: 2,
  },
  spotlightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  spotlightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  spotlightBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00D084',
  },
  spotlightCommission: {
    fontSize: 11,
    color: '#6EE7B7',
    fontWeight: '600',
  },
  spotlightTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  spotlightDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 12,
  },
  spotlightActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  spotlightActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00D084',
  },
  // Bento Grid
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  bentoCard: {
    width: (width - 44) / 2,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    marginBottom: 4,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTag: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  cardTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    lineHeight: 16,
    height: 32,
  },
  pinIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  pinIndicatorText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptySub: {
    fontSize: 12,
    marginTop: 4,
  },
  footer: {
    marginTop: 28,
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerBrand: {
    fontSize: 12,
    fontWeight: '700',
  },
  footerText: {
    fontSize: 11,
    marginTop: 2,
  },
});

