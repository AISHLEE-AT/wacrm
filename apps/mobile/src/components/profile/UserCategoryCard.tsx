import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  Car,
  GraduationCap,
  ShoppingBag,
  Wrench,
  Shield,
  Wallet,
  Compass,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  ArrowRight,
  UserCheck,
  Users,
} from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
import { AppContext, ADMIN_PHONES } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import { colors, spacing, radius, fontSize } from '../../lib/theme';

export interface UserCategoryItem {
  key: string;
  label: string;
  badge: string;
  desc: string;
  moduleName: string;
  screenName: string;
  path: string;
  icon: any;
  color: string;
  bg: string;
}

export const USER_CATEGORIES: UserCategoryItem[] = [
  {
    key: 'Driver',
    label: 'Driver Partner',
    badge: '🚖 DriveO',
    desc: 'Instant ride requests, live GPS tracking & fleet earnings',
    moduleName: 'DriveO',
    screenName: 'DriveOScreen',
    path: '/drivo',
    icon: Car,
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.15)',
  },
  {
    key: 'Group',
    label: 'Self-Help & Community Groups',
    badge: '👥 GroupO / சங்கம்',
    desc: 'தமிழ்நாடு மகளிர் சுய உதவிக் குழு, உழவர் உற்பத்தியாளர், விளையாட்டு & தொழில் குழுக்கள்',
    moduleName: 'GroupO',
    screenName: 'GroupOScreen',
    path: '/groupo',
    icon: Users,
    color: '#ec4899',
    bg: 'rgba(236, 72, 153, 0.15)',
  },
  {
    key: 'Farmer',
    label: 'Farmer / Agri Expert',
    badge: '🌾 AgrO',
    desc: 'தமிழ்நாடு உழவர் உலகம், வேளாண் டிவி, தினசரி பணிகள் & சந்தை',
    moduleName: 'AgrO',
    screenName: 'AgrOScreen',
    path: '/agro',
    icon: Wrench,
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.15)',
  },
  {
    key: 'Student',
    label: 'Student / Candidate',
    badge: '🎓 TeachO & TestO',
    desc: 'TNPSC, banking exams, live mock tests & masterclass courses',
    moduleName: 'TeachO',
    screenName: 'TeachOScreen',
    path: '/teacho',
    icon: GraduationCap,
    color: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.15)',
  },
  {
    key: 'Teacher',
    label: 'Teacher / Tutor',
    badge: '👨‍🏫 TeachO Academy',
    desc: 'Course publisher, student mentoring & live class management',
    moduleName: 'TeachO',
    screenName: 'TeachOScreen',
    path: '/teacho',
    icon: GraduationCap,
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.15)',
  },
  {
    key: 'Traveller',
    label: 'Traveller / Passenger',
    badge: '🧳 RideO',
    desc: '0% fee cab, auto & bike bookings, outstation and tours',
    moduleName: 'RideO',
    screenName: 'RideOScreen',
    path: '/rideo',
    icon: Compass,
    color: '#00D084',
    bg: 'rgba(0, 208, 132, 0.15)',
  },
  {
    key: 'Shopper',
    label: 'Merchant / Shopper',
    badge: '🛍️ DealO',
    desc: 'Local marketplace offers, wholesale deals & direct orders',
    moduleName: 'DealO',
    screenName: 'DealOScreen',
    path: '/dealo',
    icon: ShoppingBag,
    color: '#ec4899',
    bg: 'rgba(236, 72, 153, 0.15)',
  },
  {
    key: 'Financier',
    label: 'Financier / Lender',
    badge: '💰 MoneyO',
    desc: 'Direct P2P payments, 0-interest micro credit & community pool',
    moduleName: 'MoneyO',
    screenName: 'ModuleView',
    path: '/moneyo',
    icon: Wallet,
    color: '#14b8a6',
    bg: 'rgba(20, 184, 166, 0.15)',
  },
  {
    key: 'Admin',
    label: 'Admin / Ecosystem Master',
    badge: '👑 Admin CRM',
    desc: 'Super-app control panel, fleet overview & ecosystem operations',
    moduleName: 'Admin CRM',
    screenName: 'ModuleView',
    path: '/admin',
    icon: Shield,
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.15)',
  },
];

interface UserCategoryCardProps {
  profile: any;
  phone: string;
  navigation: any;
  onProfileUpdate?: (updated: any) => void;
}

export function UserCategoryCard({
  profile,
  phone,
  navigation,
  onProfileUpdate,
}: UserCategoryCardProps) {
  const { user, updateUserProfile } = useContext(AppContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const cleanPhone = (phone || user?.phone || '').replace(/\D/g, '').slice(-10);
  const isSuperAdmin =
    user?.isAdmin ||
    (cleanPhone && ADMIN_PHONES.includes(cleanPhone)) ||
    user?.role === 'admin';

  // Filter out Admin category from regular users
  const visibleCategories = USER_CATEGORIES.filter((c) => {
    if (c.key === 'Admin' && !isSuperAdmin) return false;
    return true;
  });

  // Determine current active category (if regular user has Admin set, fallback to Traveller)
  let activeKey = profile?.main_category || user?.category || 'Traveller';
  if (activeKey.toLowerCase() === 'admin' && !isSuperAdmin) {
    activeKey = 'Traveller';
  }

  const currentCategory =
    visibleCategories.find(
      (c) =>
        c.key.toLowerCase() === activeKey.toLowerCase() ||
        (activeKey.toLowerCase() === 'partner' && c.key === 'Group')
    ) || visibleCategories[0];

  const CurrentIcon = currentCategory.icon;

  const handleSelectCategory = async (cat: UserCategoryItem) => {
    if (cat.key === 'Admin' && !isSuperAdmin) {
      Alert.alert('Access Restricted', 'Admin console is restricted to system administrators.');
      return;
    }

    if (cat.key === currentCategory.key) {
      setModalVisible(false);
      return;
    }

    setIsUpdating(true);
    try {
      const newRole = isSuperAdmin ? 'admin' : cat.key.toLowerCase();

      // 1. Update AppContext (updates user state, pinnedModules, defaultModule, and SecureStore)
      if (updateUserProfile) {
        await updateUserProfile({
          category: cat.key,
          role: newRole,
          defaultModule: cat.path,
        });
      }

      // 2. Update Supabase profiles table
      if (cleanPhone) {
        await supabase
          .from('profiles')
          .update({
            main_category: cat.key,
            role: newRole,
            default_module: cat.path,
            updated_at: new Date().toISOString(),
          })
          .or(`phone.ilike.%${cleanPhone}%,whatsapp.ilike.%${cleanPhone}%`);
      }

      // 3. Update backend profile API
      fetch('https://watscrm.vercel.app/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone || user?.phone,
          main_category: cat.key,
          category: cat.key,
          role: newRole,
          default_module: cat.path,
        }),
      }).catch((e) => console.warn('Profile category update API warning:', e));

      // 4. Notify parent callback
      if (onProfileUpdate) {
        onProfileUpdate({
          ...profile,
          main_category: cat.key,
          role: newRole,
        });
      }

      setModalVisible(false);
      Alert.alert(
        'User Type Updated ⚡',
        `App reconfigured for ${cat.label}!\nPrimary Module: ${cat.moduleName}`
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update user category');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLaunchModule = () => {
    if (currentCategory.key === 'Admin' && !isSuperAdmin) {
      Alert.alert('Access Restricted', 'Admin console is restricted to system administrators.');
      return;
    }
    if (currentCategory.screenName === 'ModuleView') {
      navigation.navigate('ModuleView', {
        path: currentCategory.path,
        moduleName: currentCategory.moduleName,
      });
    } else {
      navigation.navigate(currentCategory.screenName);
    }
  };

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <View style={styles.titleRow}>
          <UserCheck size={18} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>User Type & Module</Text>
        </View>
        <View style={[styles.activePill, { backgroundColor: currentCategory.bg, borderColor: currentCategory.color + '40' }]}>
          <Sparkles size={11} color={currentCategory.color} />
          <Text style={[styles.activePillText, { color: currentCategory.color }]}>
            {currentCategory.key}
          </Text>
        </View>
      </View>

      {/* Main Active Card */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.cardHeaderRow}>
          <View style={[styles.iconBox, { backgroundColor: currentCategory.bg }]}>
            <CurrentIcon size={24} color={currentCategory.color} />
          </View>
          <View style={styles.headerTextGroup}>
            <Text style={[styles.categoryTitle, { color: colors.text }]}>
              {currentCategory.label}
            </Text>
            <Text style={[styles.categoryDesc, { color: colors.textSecondary }]}>
              {currentCategory.desc}
            </Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

        {/* Action Row: Dropdown Trigger & Quick Launch */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.dropdownButton, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.75}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <Text style={[styles.dropdownButtonText, { color: colors.text }]}>
                  Change Type
                </Text>
                <ChevronDown size={16} color={colors.textSecondary} />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.launchButton, { backgroundColor: currentCategory.color }]}
            onPress={handleLaunchModule}
            activeOpacity={0.8}
          >
            <Text style={styles.launchButtonText}>Launch {currentCategory.moduleName}</Text>
            <ArrowRight size={15} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── Category Selection Modal Dropdown ─── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Select User Type</Text>
                <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
                  Choose your role to configure your primary module
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[styles.closeBtn, { backgroundColor: colors.inputBg }]}
              >
                <Text style={[styles.closeBtnText, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
            >
              {visibleCategories.map((cat) => {
                const IconComponent = cat.icon;
                const isSelected =
                  cat.key.toLowerCase() === currentCategory.key.toLowerCase();

                return (
                  <TouchableOpacity
                    key={cat.key}
                    style={[
                      styles.categoryOption,
                      { backgroundColor: colors.inputBg, borderColor: colors.borderLight },
                      isSelected && {
                        borderColor: cat.color,
                        borderWidth: 1.5,
                        backgroundColor: cat.bg,
                      },
                    ]}
                    onPress={() => handleSelectCategory(cat)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.optionIconBox, { backgroundColor: cat.bg }]}>
                      <IconComponent size={20} color={cat.color} />
                    </View>

                    <View style={styles.optionDetails}>
                      <View style={styles.optionTitleRow}>
                        <Text style={[styles.optionLabel, { color: colors.text }]}>
                          {cat.label}
                        </Text>
                        <Text style={[styles.optionBadge, { color: cat.color }]}>
                          {cat.badge}
                        </Text>
                      </View>
                      <Text
                        style={[styles.optionDesc, { color: colors.textMuted }]}
                        numberOfLines={2}
                      >
                        {cat.desc}
                      </Text>
                    </View>

                    {isSelected && (
                      <View style={styles.checkWrapper}>
                        <CheckCircle2 size={20} color={cat.color} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: spacing.xxxl || 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md || 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: fontSize.lg || 18,
    fontWeight: 'bold',
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  activePillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  card: {
    borderRadius: radius.lg || 16,
    padding: spacing.lg || 16,
    borderWidth: 1,
    gap: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextGroup: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: fontSize.md + 1 || 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  categoryDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    marginVertical: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  dropdownButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: radius.md || 10,
    borderWidth: 1,
  },
  dropdownButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  launchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: radius.md || 10,
    gap: 6,
  },
  launchButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '82%',
    borderTopWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  modalSub: {
    fontSize: 12,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalScroll: {
    maxHeight: 460,
  },
  modalScrollContent: {
    gap: 10,
    paddingBottom: 24,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  optionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionDetails: {
    flex: 1,
  },
  optionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  optionBadge: {
    fontSize: 11,
    fontWeight: '700',
  },
  optionDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  checkWrapper: {
    marginLeft: 4,
  },
});
