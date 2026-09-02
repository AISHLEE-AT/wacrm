import React, { useState, useContext, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Linking,
  Share,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Users,
  Wallet,
  BookOpen,
  Video,
  MessageCircle,
  PhoneCall,
  Send,
  Sparkles,
  ChevronDown,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  Plus,
  Share2,
  HardDrive,
  ShieldCheck,
  ShieldAlert,
  Building,
  Award,
  Layers,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  MapPin,
  Calendar,
  X,
  Printer,
  Search,
  RefreshCw,
} from 'lucide-react-native';
import { AppContext } from '../context/AppContext';
import { colors, spacing, radius, fontSize } from '../lib/theme';
import { GroupSavingsLedgerModal, GroupMember } from '../components/groupo/GroupSavingsLedgerModal';
import { GroupMeetingNotesModal } from '../components/groupo/GroupMeetingNotesModal';
import { GroupMeetingVideoModal } from '../components/groupo/GroupMeetingVideoModal';
import { GroupAiAssistantModal } from '../components/groupo/GroupAiAssistantModal';
import { CreateGroupWizardModal } from '../components/groupo/CreateGroupWizardModal';
import { GroupMemberViewCard } from '../components/groupo/GroupMemberViewCard';
import { GroupAdminConsoleModal } from '../components/groupo/GroupAdminConsoleModal';
import { GroupRepository, UserGroupStatus, DbGroup, DbMember } from '../services/GroupRepository';
import { ADMIN_PHONES } from '../context/AppContext';

const COURSE_GUIDE_WHATSAPP = '916381029380';
const TELEGRAM_COMMUNITY_URL = 'https://t.me/supro_education';

interface GroupData {
  id: string;
  name: string;
  category: 'WomenSHG' | 'FarmerFPO' | 'SportsClub' | 'BusinessGroup' | 'VillageRWA' | 'YouthStudy';
  categoryLabel: string;
  tagline: string;
  village: string;
  district: string;
  regCode: string;
  bankName: string;
  bankAccount: string;
  monthlySavingsPerMember: number;
  totalMembersCount: number;
  totalSavingsPool: number;
  activeLoanPool: number;
  meetingDay: string;
  members: GroupMember[];
  customMetrics?: { label1: string; val1: string; label2: string; val2: string; label3: string; val3: string };
}

// Helper to map DB Group and its members into active GroupData format
const mapDbGroupToGroupData = async (g: DbGroup): Promise<GroupData> => {
  let members: GroupMember[] = [];
  try {
    const rawMembers = await GroupRepository.fetchMembers(g.id);
    if (rawMembers && rawMembers.length > 0) {
      members = rawMembers.map((m) => ({
        id: m.id,
        name: m.name,
        role: m.role || 'Member',
        phone: m.phone,
        savingsPaid: m.current_month_paid ?? false,
        savingsAmount: m.savings_amount ?? (g.monthly_savings_per_member || 500),
        loanBalance: m.active_loan_balance ?? 0,
      }));
    }
  } catch (e) {}

  if (members.length === 0) {
    members = [
      {
        id: `m-ldr-${g.id}`,
        name: g.leader_name || 'Group Leader',
        role: 'President',
        phone: g.leader_phone,
        savingsPaid: true,
        savingsAmount: g.monthly_savings_per_member || 500,
        loanBalance: 0,
      },
    ];
  }

  return {
    id: g.id,
    name: g.name,
    category: g.category || 'WomenSHG',
    categoryLabel: g.category_label || 'மகளிர் சுய உதவிக் குழு',
    tagline: g.tagline || 'மாதாந்திர சேமிப்பு & கூட்டமைப்பு',
    village: g.village || 'தமிழ்நாடு',
    district: g.district || 'சென்னை',
    regCode: g.reg_code || 'TN-GROUPO-2026',
    bankName: g.bank_name || 'Canara Bank',
    bankAccount: g.bank_account || '*******8920',
    monthlySavingsPerMember: g.monthly_savings_per_member || 500,
    totalMembersCount: members.length,
    totalSavingsPool: (g as any).total_savings_pool ?? (g as any).totalSavingsPool ?? 0,
    activeLoanPool: (g as any).active_loan_pool ?? (g as any).activeLoanPool ?? 0,
    meetingDay: (g as any).meeting_schedule || 'Every Month 5th & 20th',
    members,
    customMetrics: {
      label1: 'உறுப்பினர்கள் (Members)', val1: `${members.length}`,
      label2: 'சேமிப்பு நிதி (Savings)', val2: `₹${((g as any).total_savings_pool ?? 0).toLocaleString('en-IN')}`,
      label3: 'சுழல் கடன் (Loans)', val3: `₹${((g as any).active_loan_pool ?? 0).toLocaleString('en-IN')}`,
    },
  };
};

export default function GroupOScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user } = useContext(AppContext);

  // User's own associated groups & System-wide groups (for admin)
  const [userGroups, setUserGroups] = useState<GroupData[]>([]);
  const [allSystemGroups, setAllSystemGroups] = useState<GroupData[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<GroupData | null>(null);

  // Group Switcher Modal state
  const [isGroupPickerOpen, setIsGroupPickerOpen] = useState(false);
  const [adminPickerTab, setAdminPickerTab] = useState<'my_groups' | 'all_system_groups'>('my_groups');
  const [pickerSearch, setPickerSearch] = useState('');

  // Active Tab & Status state
  const [activeTab, setActiveTab] = useState<'overview' | 'savings' | 'meetings' | 'videos' | 'schemes'>('overview');
  const [userStatus, setUserStatus] = useState<UserGroupStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);

  // Modals state
  const [isSavingsModalOpen, setIsSavingsModalOpen] = useState(false);
  const [isMeetingNotesModalOpen, setIsMeetingNotesModalOpen] = useState(false);
  const [isMeetingVideoModalOpen, setIsMeetingVideoModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isGroupAdminModalOpen, setIsGroupAdminModalOpen] = useState(false);

  const cleanPhone = (user?.phone || '').replace(/\D/g, '');
  const isUserAdmin =
    user?.isAdmin ||
    ADMIN_PHONES.some((ap: string) => cleanPhone.includes(ap) || ap.includes(cleanPhone));

  // Load user groups and system groups from Supabase
  const loadGroupsData = useCallback(async () => {
    setIsLoadingStatus(true);
    try {
      const rawPhone = user?.phone || '';

      // 1. Fetch user's own groups where they are Leader or Member
      const dbUserGroups = await GroupRepository.getUserGroups(rawPhone);
      const mappedUserList: GroupData[] = [];
      for (const g of dbUserGroups) {
        const mapped = await mapDbGroupToGroupData(g);
        mappedUserList.push(mapped);
      }
      setUserGroups(mappedUserList);

      // 2. If Super Admin, also fetch system-wide directory
      let mappedAllList: GroupData[] = [];
      if (isUserAdmin) {
        const dbAllGroups = await GroupRepository.fetchAllGroupsForAdmin();
        for (const g of dbAllGroups) {
          const mapped = await mapDbGroupToGroupData(g);
          mappedAllList.push(mapped);
        }
        setAllSystemGroups(mappedAllList);
      }

      // 3. Set Active Selected Group
      if (mappedUserList.length > 0) {
        setSelectedGroup(mappedUserList[0]);
      } else if (isUserAdmin && mappedAllList.length > 0) {
        setSelectedGroup(mappedAllList[0]);
      } else {
        setSelectedGroup(null);
      }

      // 4. Also fetch user status role
      if (rawPhone) {
        const status = await GroupRepository.getUserGroupStatus(rawPhone);
        setUserStatus(status);
      }
    } catch (err) {
      console.warn('Error loading GroupO groups:', err);
    } finally {
      setIsLoadingStatus(false);
    }
  }, [user?.phone, isUserAdmin]);

  useEffect(() => {
    loadGroupsData();
  }, [loadGroupsData]);

  // Handle dynamic group creation
  const handleGroupCreated = async (newGrp: DbGroup) => {
    const mapped = await mapDbGroupToGroupData(newGrp);
    setUserGroups((prev) => [mapped, ...prev]);
    if (isUserAdmin) {
      setAllSystemGroups((prev) => [mapped, ...prev]);
    }
    setSelectedGroup(mapped);
    setIsCreateGroupOpen(false);

    // Also fetch the user status so they have leader permissions immediately
    const status = await GroupRepository.getUserGroupStatus(user?.phone || '');
    setUserStatus(status);
  };

  // 1-Click WhatsApp Group Call
  const handleLaunchWhatsAppGroupCall = () => {
    if (!selectedGroup) return;
    const msg = `📞 *${selectedGroup.name} — Monthly Group Meeting Calling* 👥\n\n` +
      `வணக்கம் உறுப்பினர்களே! நமது குழுவின் மாதாந்திர கலந்தாய்வு கூட்டம் இப்போது தொடங்குகிறது.\n\n` +
      `📅 *Meeting:* August 2026 Regular Assembly\n` +
      `📍 *Location / Call:* SuprO Group Live Call\n\n` +
      `Please join the group call or check your WhatsApp window for video conference updates! 🙏`;

    const url = `whatsapp://send?phone=${COURSE_GUIDE_WHATSAPP}&text=${encodeURIComponent(msg)}`;
    const webUrl = `https://wa.me/${COURSE_GUIDE_WHATSAPP}?text=${encodeURIComponent(msg)}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) Linking.openURL(url);
        else Linking.openURL(webUrl);
      })
      .catch(() => Linking.openURL(webUrl));
  };

  // 1-Click Telegram Community Channel
  const handleOpenTelegram = () => {
    Linking.openURL(TELEGRAM_COMMUNITY_URL).catch(() => {
      Alert.alert('Telegram', 'Opening SuprO Community Channel...');
    });
  };

  // Filter groups for picker modal
  const activePickerList = isUserAdmin && adminPickerTab === 'all_system_groups' ? allSystemGroups : userGroups;
  const filteredPickerGroups = activePickerList.filter((g) => {
    if (!pickerSearch.trim()) return true;
    const q = pickerSearch.toLowerCase();
    return (
      g.name.toLowerCase().includes(q) ||
      g.village.toLowerCase().includes(q) ||
      g.district.toLowerCase().includes(q) ||
      g.categoryLabel.toLowerCase().includes(q)
    );
  });

  // ─── 0. LOADING STATE ───
  if (isLoadingStatus) {
    return (
      <View style={[styles.screenContainer, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#EC4899" />
        <Text style={{ color: '#94A3B8', marginTop: 12, fontSize: 13, fontWeight: '700' }}>
          குழு விவரங்கள் ஏற்றப்படுகிறது (Loading GroupO)...
        </Text>
      </View>
    );
  }

  // ─── 0. EMPTY STATE (NEW USERS WITH NO GROUPS) ───
  if (!selectedGroup) {
    return (
      <View style={[styles.screenContainer, { backgroundColor: colors.background }]}>
        {/* Top App Bar with back */}
        <View
          style={[
            styles.topBar,
            {
              paddingTop:
                Math.max(insets.top, Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0) + 8,
            },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <ArrowLeft size={20} color="#F8FAFC" />
            </TouchableOpacity>
            <View>
              <View style={styles.groupBadge}>
                <Users size={12} color="#EC4899" />
                <Text style={styles.groupBadgeText}>GROUPO • சங்கம் & குழுக்கள்</Text>
              </View>
              <Text style={{ color: '#F8FAFC', fontSize: 16, fontWeight: '800' }}>
                குழு மேலாண்மை மையம்
              </Text>
            </View>
          </View>
        </View>

        {/* Empty State Body */}
        <ScrollView
          style={styles.mainScroll}
          contentContainerStyle={[styles.mainScrollContent, { paddingBottom: Math.max(insets.bottom, 16) + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.emptyHeroCard}>
            <View style={styles.emptyIconCircle}>
              <Users size={32} color="#EC4899" />
            </View>
            <Text style={styles.emptyHeroTitle}>குழு மேலாண்மைக்கு வருக!</Text>
            <Text style={styles.emptyHeroSubTitle}>Welcome to SuprO GroupO Suite</Text>
            <Text style={styles.emptyHeroDesc}>
              உங்கள் மகளிர் சுய உதவிக் குழு (SHG), உழவர் உற்பத்தியாளர் சங்கம் (FPO), விளையாட்டு சங்கம் அல்லது வணிகர் சங்கத்தை பதிவு செய்து நிதி, கூட்ட குறிப்புகள், மாதாந்திர பாஸ்புக் மற்றும் வங்கி உதவிகளை எளிதில் நிர்வகியுங்கள்.
            </Text>

            {/* Action Buttons */}
            <View style={{ gap: 10, width: '100%', marginTop: 14 }}>
              <TouchableOpacity
                style={styles.createGroupMainBtn}
                onPress={() => setIsCreateGroupOpen(true)}
                activeOpacity={0.85}
              >
                <Plus size={18} color="#FFFFFF" />
                <Text style={styles.createGroupMainBtnText}>
                  + புதிய குழு / சங்கம் பதிவு செய்க (Create Group)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.joinGroupBtn}
                onPress={() => {
                  Alert.alert(
                    '🤝 குழுவில் இணைதல் (Join Group)',
                    'உங்கள் குழு தலைவர் (Leader) அல்லது நிர்வாகியிடம் உங்கள் கைபேசி எண்ணை (+91 ' + (user?.phone || '...') + ') சேர்க்குமாறு கூறவும்.\n\nஅவர்கள் சேர்த்தவுடன், உங்கள் குழு பாஸ்புக் மற்றும் விவரங்கள் தானாகவே இங்கு காண்பிக்கப்படும்!',
                    [{ text: 'சரி (OK)' }]
                  );
                }}
                activeOpacity={0.85}
              >
                <Users size={16} color="#38BDF8" />
                <Text style={styles.joinGroupBtnText}>
                  🤝 ஏற்கனவே உள்ள குழுவில் இணைக (Join Existing)
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 4 Feature Highlight Cards */}
          <Text style={{ fontSize: 13, fontWeight: '800', color: '#F1F5F9', marginTop: 18, marginBottom: 8 }}>
            GROUPO முக்கிய சிறப்பம்சங்கள் (Features):
          </Text>

          <View style={styles.featureGrid}>
            <View style={styles.featureCard}>
              <View style={[styles.featureIconCircle, { backgroundColor: 'rgba(236, 72, 153, 0.15)' }]}>
                <Wallet size={18} color="#EC4899" />
              </View>
              <Text style={styles.featureCardTitle}>மாதாந்திர சேமிப்பு & பாஸ்புக்</Text>
              <Text style={styles.featureCardDesc}>
                உறுப்பினர்களின் சேமிப்புத் தொகை மற்றும் கடன் நிலுவை கணக்குகள் 100% வெளிப்படையானது.
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View style={[styles.featureIconCircle, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
                <BookOpen size={18} color="#38BDF8" />
              </View>
              <Text style={styles.featureCardTitle}>கூட்ட குறிப்பு & தீர்மானங்கள்</Text>
              <Text style={styles.featureCardDesc}>
                மாதாந்திர கூட்ட தீர்மானங்கள், வருகைப் பதிவு மற்றும் வரவு-செலவு டிஜிட்டல் ஆவணம்.
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View style={[styles.featureIconCircle, { backgroundColor: 'rgba(0, 208, 132, 0.15)' }]}>
                <Video size={18} color="#00D084" />
              </View>
              <Text style={styles.featureCardTitle}>கூட்ட வீடியோ & Drive பதிவு</Text>
              <Text style={styles.featureCardDesc}>
                BDO மற்றும் வங்கி அலுவலர் சரிபார்ப்பிற்கு நேரடி வீடியோ பதிவு மற்றும் கூகுள் டிரைவ் சேமிப்பு.
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View style={[styles.featureIconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                <Sparkles size={18} color="#F59E0B" />
              </View>
              <Text style={styles.featureCardTitle}>Group AI Suite & வங்கி கடிதங்கள்</Text>
              <Text style={styles.featureCardDesc}>
                வங்கி கடன் விண்ணப்ப கடிதம், தீர்மானம் மற்றும் தொழில் திட்ட அறிக்கை 1-கிளிக்கில் தயார்.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Create Group Wizard Modal */}
        <CreateGroupWizardModal
          visible={isCreateGroupOpen}
          onClose={() => setIsCreateGroupOpen(false)}
          onGroupCreated={handleGroupCreated}
        />
      </View>
    );
  }

  return (
    <View style={[styles.screenContainer, { backgroundColor: colors.background }]}>
      {/* ─── 1. TOP APP BAR ─── */}
      <View
        style={[
          styles.topBar,
          {
            paddingTop:
              Math.max(insets.top, Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0) + 8,
          },
        ]}
      >
        <View style={styles.topBarLeft}>
          <View style={styles.groupBadge}>
            <Users size={14} color="#EC4899" />
            <Text style={styles.groupBadgeText}>GROUPO • சங்கம் & குழுக்கள்</Text>
          </View>
          <TouchableOpacity
            style={styles.groupSelectorTrigger}
            onPress={() => setIsGroupPickerOpen(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.groupSelectorTitle} numberOfLines={1}>
              {selectedGroup.name}
            </Text>
            <ChevronDown size={18} color="#EC4899" />
          </TouchableOpacity>
          <Text style={styles.groupLocationSub} numberOfLines={1}>
            📍 {selectedGroup.village}, {selectedGroup.district} • {selectedGroup.regCode}
          </Text>
        </View>

        {/* Quick Communication Actions */}
        <View style={styles.topBarRight}>
          {isUserAdmin && (
            <TouchableOpacity
              style={[styles.whatsAppCallBtn, { backgroundColor: '#EF4444' }]}
              onPress={() => setIsGroupAdminModalOpen(true)}
              activeOpacity={0.8}
            >
              <ShieldAlert size={16} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.whatsAppCallBtn, { backgroundColor: 'rgba(236, 72, 153, 0.2)', borderWidth: 1, borderColor: '#EC4899' }]}
            onPress={() => setIsAiModalOpen(true)}
            activeOpacity={0.8}
          >
            <Sparkles size={16} color="#EC4899" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.whatsAppCallBtn}
            onPress={handleLaunchWhatsAppGroupCall}
            activeOpacity={0.8}
          >
            <PhoneCall size={16} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.telegramBtn}
            onPress={handleOpenTelegram}
            activeOpacity={0.8}
          >
            <Send size={15} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── 2. TAB NAVIGATOR ─── */}
      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScrollContent}>
          <TouchableOpacity
            style={[styles.navTab, activeTab === 'overview' && styles.navTabActive]}
            onPress={() => setActiveTab('overview')}
          >
            <Users size={13} color={activeTab === 'overview' ? '#FFFFFF' : '#94A3B8'} />
            <Text style={[styles.navTabText, activeTab === 'overview' && styles.navTabTextActive]}>
              கண்ணோட்டம்
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navTab, activeTab === 'savings' && styles.navTabActive]}
            onPress={() => setActiveTab('savings')}
          >
            <Wallet size={13} color={activeTab === 'savings' ? '#FFFFFF' : '#94A3B8'} />
            <Text style={[styles.navTabText, activeTab === 'savings' && styles.navTabTextActive]}>
              சேமிப்பு & கணக்கு
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navTab, activeTab === 'meetings' && styles.navTabActive]}
            onPress={() => setActiveTab('meetings')}
          >
            <BookOpen size={13} color={activeTab === 'meetings' ? '#FFFFFF' : '#94A3B8'} />
            <Text style={[styles.navTabText, activeTab === 'meetings' && styles.navTabTextActive]}>
              தீர்மானங்கள்
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navTab, activeTab === 'videos' && styles.navTabActive]}
            onPress={() => setActiveTab('videos')}
          >
            <Video size={13} color={activeTab === 'videos' ? '#FFFFFF' : '#94A3B8'} />
            <Text style={[styles.navTabText, activeTab === 'videos' && styles.navTabTextActive]}>
              வீடியோ பதிவு & டிரைவ்
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navTab, activeTab === 'schemes' && styles.navTabActive]}
            onPress={() => setActiveTab('schemes')}
          >
            <Building size={13} color={activeTab === 'schemes' ? '#FFFFFF' : '#94A3B8'} />
            <Text style={[styles.navTabText, activeTab === 'schemes' && styles.navTabTextActive]}>
              அரசு திட்டங்கள் & சந்தை
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* ─── 3. MAIN CONTENT BODY ─── */}
      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={[styles.mainScrollContent, { paddingBottom: Math.max(insets.bottom, 16) + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ──── TAB 1: OVERVIEW & MEMBERS ──── */}
        {activeTab === 'overview' && (
          <View style={{ gap: 14 }}>
            {/* If Logged-in User is a Linked Member (Non-Leader) */}
            {userStatus && !userStatus.isLeader && userStatus.isMember && userStatus.memberRecord ? (
              <GroupMemberViewCard
                group={
                  (userStatus.group as any) || {
                    id: selectedGroup.id,
                    name: selectedGroup.name,
                    category_label: selectedGroup.categoryLabel,
                    village: selectedGroup.village,
                    district: selectedGroup.district,
                    reg_code: selectedGroup.regCode,
                    leader_name: selectedGroup.members.find(m => m.role === 'President')?.name || selectedGroup.members[0]?.name || '',
                    leader_phone: selectedGroup.members.find(m => m.role === 'President')?.phone || selectedGroup.members[0]?.phone || '',
                    total_savings_pool: selectedGroup.totalSavingsPool,
                    active_loan_pool: selectedGroup.activeLoanPool,
                  }
                }
                member={userStatus.memberRecord}
                onOpenMeetingVideos={() => setIsMeetingVideoModalOpen(true)}
                onOpenResolutions={() => setIsMeetingNotesModalOpen(true)}
              />
            ) : (
              <>
                {/* Group Hero Card (Leader View) */}
                <View style={styles.heroCard}>
                  <View style={styles.heroHeader}>
                    <View style={styles.heroIconBox}>
                      <Users size={24} color="#EC4899" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.heroTitle}>{selectedGroup.name}</Text>
                        <TouchableOpacity
                          style={styles.createGroupMiniBtn}
                          onPress={() => setIsCreateGroupOpen(true)}
                        >
                          <Plus size={12} color="#00D084" />
                          <Text style={styles.createGroupMiniBtnText}>New Group</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.heroCategory}>{selectedGroup.categoryLabel}</Text>
                    </View>
                  </View>
                  <Text style={styles.heroTagline}>{selectedGroup.tagline}</Text>

                  {/* Metric Grid */}
                  <View style={styles.heroMetricsGrid}>
                    <View style={styles.heroMetricItem}>
                      <Text style={styles.heroMetricVal}>
                        {selectedGroup.customMetrics?.val1 || selectedGroup.totalMembersCount}
                      </Text>
                      <Text style={styles.heroMetricLabel}>
                        {selectedGroup.customMetrics?.label1 || 'உறுப்பினர்கள் (Members)'}
                      </Text>
                    </View>
                    <View style={styles.heroMetricItem}>
                      <Text style={[styles.heroMetricVal, { color: '#00D084' }]}>
                        {selectedGroup.customMetrics?.val2 || `₹${selectedGroup.totalSavingsPool.toLocaleString('en-IN')}`}
                      </Text>
                      <Text style={styles.heroMetricLabel}>
                        {selectedGroup.customMetrics?.label2 || 'சேமிப்பு நிதி (Savings Pool)'}
                      </Text>
                    </View>
                    <View style={styles.heroMetricItem}>
                      <Text style={[styles.heroMetricVal, { color: '#F59E0B' }]}>
                        {selectedGroup.customMetrics?.val3 || `₹${selectedGroup.activeLoanPool.toLocaleString('en-IN')}`}
                      </Text>
                      <Text style={styles.heroMetricLabel}>
                        {selectedGroup.customMetrics?.label3 || 'உள் கடன் (Active Loans)'}
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            )}

            {/* Quick Action Shortcuts */}
            <View style={styles.quickShortcutsRow}>
              <TouchableOpacity
                style={[styles.shortcutBtn, { backgroundColor: '#1E293B', borderColor: '#EC4899' }]}
                onPress={() => setIsSavingsModalOpen(true)}
              >
                <Wallet size={18} color="#EC4899" />
                <Text style={styles.shortcutBtnTitle}>மாதாந்திர சேமிப்பு</Text>
                <Text style={styles.shortcutBtnSub}>Monthly Passbook</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.shortcutBtn, { backgroundColor: '#1E293B', borderColor: '#38BDF8' }]}
                onPress={() => setIsMeetingNotesModalOpen(true)}
              >
                <BookOpen size={18} color="#38BDF8" />
                <Text style={styles.shortcutBtnTitle}>கூட்ட குறிப்பு</Text>
                <Text style={styles.shortcutBtnSub}>Resolutions & Notes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.shortcutBtn, { backgroundColor: '#1E293B', borderColor: '#00D084' }]}
                onPress={() => setIsMeetingVideoModalOpen(true)}
              >
                <Video size={18} color="#00D084" />
                <Text style={styles.shortcutBtnTitle}>கூட்ட வீடியோ</Text>
                <Text style={styles.shortcutBtnSub}>Drive Video Record</Text>
              </TouchableOpacity>
            </View>

            {/* AI Assistant Banner Card */}
            <TouchableOpacity
              style={styles.aiBannerCard}
              onPress={() => setIsAiModalOpen(true)}
              activeOpacity={0.85}
            >
              <View style={styles.aiBannerIconBox}>
                <Sparkles size={20} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.aiBannerTitle}>Group AI & PDF Suite</Text>
                  <View style={styles.aiBannerBadgeBox}>
                    <Text style={styles.aiBannerBadge}>VOICE & GEMINI</Text>
                  </View>
                </View>
                <Text style={styles.aiBannerSub} numberOfLines={2}>
                  குரல் வழி தீர்மானங்கள், வங்கி கடன் விண்ணப்ப கடிதம் & தொழில் திட்ட அறிக்கை PDF தயாரிப்பு
                </Text>
              </View>
              <ChevronRight size={18} color="#EC4899" />
            </TouchableOpacity>

            {/* Bank Linkage Information */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Building size={16} color="#38BDF8" />
                <Text style={styles.cardTitle}>வங்கி இணைப்பு கணக்கு (Bank Linkage)</Text>
              </View>
              <View style={styles.bankInfoRow}>
                <View>
                  <Text style={styles.bankNameText}>{selectedGroup.bankName}</Text>
                  <Text style={styles.bankAccText}>A/C: {selectedGroup.bankAccount} • IFSC: Verified</Text>
                </View>
                <View style={styles.verifiedBadge}>
                  <CheckCircle2 size={12} color="#00D084" />
                  <Text style={styles.verifiedBadgeText}>Linked</Text>
                </View>
              </View>
            </View>

            {/* Member Directory */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Users size={16} color="#EC4899" />
                <Text style={styles.cardTitle}>குழு நிர்வாகிகள் & உறுப்பினர்கள் (Roster)</Text>
              </View>
              {selectedGroup.members.map((member) => (
                <View key={member.id} style={styles.memberListItem}>
                  <View style={styles.memberAvatarCircle}>
                    <Text style={styles.memberAvatarText}>{member.name.slice(0, 2).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.memberListName}>{member.name}</Text>
                    <Text style={styles.memberListSub}>{member.phone}</Text>
                  </View>
                  <View style={[styles.roleTag, member.role === 'President' && { backgroundColor: 'rgba(236, 72, 153, 0.2)' }]}>
                    <Text style={[styles.roleTagText, member.role === 'President' && { color: '#EC4899' }]}>
                      {member.role}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ──── TAB 2: SAVINGS & ACCOUNTING LEDGER ──── */}
        {activeTab === 'savings' && (
          <View style={{ gap: 14 }}>
            <View style={[styles.heroCard, { borderColor: '#EC4899' }]}>
              <Text style={styles.heroCategory}>மாதாந்திர சேமிப்பு & வரவு-செலவு கணக்கு</Text>
              <Text style={[styles.heroMetricVal, { color: '#00D084', fontSize: 28, marginVertical: 6 }]}>
                ₹{selectedGroup.totalSavingsPool.toLocaleString('en-IN')}
              </Text>
              <Text style={{ fontSize: 12, color: '#A7F3D0' }}>
                மாதாந்திர சேமிப்பு நிர்ணயம்: ₹{selectedGroup.monthlySavingsPerMember} / நபர்
              </Text>
            </View>

            <TouchableOpacity
              style={styles.primaryActionCardBtn}
              onPress={() => setIsSavingsModalOpen(true)}
            >
              <Wallet size={20} color="#0F172A" />
              <Text style={styles.primaryActionCardBtnText}>Open Monthly Savings Passbook & Loan Ledger ➡️</Text>
            </TouchableOpacity>

            {/* Quick overview of collections */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Current Month Collection Status</Text>
              <Text style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
                August 2026: {selectedGroup.members.filter((m) => m.savingsPaid).length} of {selectedGroup.members.length} members paid.
              </Text>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.round(
                        (selectedGroup.members.filter((m) => m.savingsPaid).length /
                          (selectedGroup.members.length || 1)) *
                          100
                      )}%`,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        )}

        {/* ──── TAB 3: RESOLUTIONS & MEETING MINUTES ──── */}
        {activeTab === 'meetings' && (
          <View style={{ gap: 14 }}>
            <View style={[styles.heroCard, { borderColor: '#38BDF8' }]}>
              <Text style={styles.heroCategory}>தீர்மான புத்தகம் & கூட்ட குறிப்புகள்</Text>
              <Text style={[styles.heroTitle, { fontSize: 18, marginTop: 4 }]}>Meeting Resolution Register</Text>
              <Text style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
                Schedule: {selectedGroup.meetingDay} • Digital Quorum & Vote Verification
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.primaryActionCardBtn, { backgroundColor: '#38BDF8' }]}
              onPress={() => setIsMeetingNotesModalOpen(true)}
            >
              <BookOpen size={20} color="#0F172A" />
              <Text style={styles.primaryActionCardBtnText}>Open Meeting Minutes & Resolutions Book ➡️</Text>
            </TouchableOpacity>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Recent Approved Resolutions</Text>
              <View style={styles.resSnippetItem}>
                <Text style={styles.resSnippetTitle}>1. Internal Tailoring Machine Loan for S. Lakshmi</Text>
                <Text style={styles.resSnippetDesc}>Approved ₹25,000 internal loan at 1.5% interest rate. Passed with 100% quorum.</Text>
              </View>
              <View style={styles.resSnippetItem}>
                <Text style={styles.resSnippetTitle}>2. TNCDW Bank Direct Linkage Loan Application</Text>
                <Text style={styles.resSnippetDesc}>Submitted ₹5 Lakhs subsidized bank loan application through Canara Bank.</Text>
              </View>
            </View>
          </View>
        )}

        {/* ──── TAB 4: MEETING VIDEO & GOOGLE DRIVE PROOF ──── */}
        {activeTab === 'videos' && (
          <View style={{ gap: 14 }}>
            <View style={[styles.heroCard, { borderColor: '#00D084' }]}>
              <Text style={styles.heroCategory}>கூட்ட வீடியோ பதிவு & கூகுள் டிரைவ் மேகம்</Text>
              <Text style={[styles.heroTitle, { fontSize: 18, marginTop: 4 }]}>Google Drive Meeting Video Records</Text>
              <Text style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
                Folder: 📁 SuprO GroupO - {selectedGroup.name}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.primaryActionCardBtn, { backgroundColor: '#00D084' }]}
              onPress={() => setIsMeetingVideoModalOpen(true)}
            >
              <Video size={20} color="#0F172A" />
              <Text style={styles.primaryActionCardBtnText}>Record Meeting Video & Upload to Drive 📹</Text>
            </TouchableOpacity>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Why Video Proof is Essential for SHGs & FPOs?</Text>
              <View style={{ gap: 8, marginTop: 8 }}>
                <Text style={styles.benefitItem}>• ✅ Official proof of member attendance and quorum.</Text>
                <Text style={styles.benefitItem}>• ✅ Direct video submission to BDO, Village Animator & Bank.</Text>
                <Text style={styles.benefitItem}>• ✅ Never lose records — permanently backed up on personal Google Drive.</Text>
                <Text style={styles.benefitItem}>• ✅ 1-Click WhatsApp verification to Guide (+91 6381029380).</Text>
              </View>
            </View>
          </View>
        )}

        {/* ──── TAB 5: GOVT SCHEMES & SUPRO MARKET LINKAGE ──── */}
        {activeTab === 'schemes' && (
          <View style={{ gap: 14 }}>
            <View style={[styles.heroCard, { borderColor: '#F59E0B' }]}>
              <Text style={styles.heroCategory}>அரசு மானிய திட்டங்கள் & சந்தை வாய்ப்புகள்</Text>
              <Text style={[styles.heroTitle, { fontSize: 18, marginTop: 4 }]}>Tamil Nadu Schemes & SuprO Marketplace</Text>
              <Text style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
                TNCDW Mathi, Vazhndhu Kattuvom, FPO Subsidies & DealO Direct Selling
              </Text>
            </View>

            {/* Schemes Cards */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>தமிழ்நாடு அரசு சிறப்பு திட்டங்கள் (Government Schemes)</Text>
              
              <View style={styles.schemeItemCard}>
                <View style={styles.schemeHeaderRow}>
                  <Text style={styles.schemeTitle}>மகளிர் திட்டம் - நேரடி கடன் (Mathi Linkage)</Text>
                  <Text style={styles.schemeSubsidyBadge}>₹5 - ₹20 Lakhs</Text>
                </View>
                <Text style={styles.schemeDesc}>
                  TNCDW subsidized credit linkage through public sector banks with low interest rates for women SHGs.
                </Text>
              </View>

              <View style={styles.schemeItemCard}>
                <View style={styles.schemeHeaderRow}>
                  <Text style={styles.schemeTitle}>வாழ்ந்து காட்டுவோம் திட்டம் (Vazhndhu Kattuvom)</Text>
                  <Text style={styles.schemeSubsidyBadge}>35% மானியம்</Text>
                </View>
                <Text style={styles.schemeDesc}>
                  Rural enterprise fund, matching grant for collective processing units, millets & cattle rearing.
                </Text>
              </View>

              <View style={styles.schemeItemCard}>
                <View style={styles.schemeHeaderRow}>
                  <Text style={styles.schemeTitle}>PM-FME & NABARD FPO உழவர் மானியம்</Text>
                  <Text style={styles.schemeSubsidyBadge}>₹10 Lakhs</Text>
                </View>
                <Text style={styles.schemeDesc}>
                  Seed capital grant & infrastructure subsidies for agricultural marketing and machinery joint pooling.
                </Text>
              </View>
            </View>

            {/* SuprO DealO Direct Market Linkage */}
            <View style={[styles.card, { borderColor: '#EC4899', backgroundColor: '#1A0C18' }]}>
              <View style={styles.cardHeaderRow}>
                <ShoppingBag size={18} color="#EC4899" />
                <Text style={[styles.cardTitle, { color: '#EC4899' }]}>SuprO Market Linkage (சந்தை வாய்ப்பு)</Text>
              </View>
              <Text style={{ fontSize: 12, color: '#FBCFE8', lineHeight: 18 }}>
                Sell your SHG / FPO manufactured products (Pickles, Masala, Millets, Handloom Sarees, Pottery) directly to thousands of SuprO buyers without middlemen!
              </Text>
              <TouchableOpacity
                style={[styles.primaryActionCardBtn, { backgroundColor: '#EC4899', marginTop: 10 }]}
                onPress={() => navigation.navigate('DealOScreen')}
              >
                <ShoppingBag size={16} color="#FFFFFF" />
                <Text style={[styles.primaryActionCardBtnText, { color: '#FFFFFF' }]}>
                  List Group Products on SuprO DealO 🛍️
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ─── 4. GROUP SWITCHER MODAL ─── */}
      <Modal visible={isGroupPickerOpen} transparent animationType="slide" onRequestClose={() => setIsGroupPickerOpen(false)}>
        <View style={styles.pickerBackdrop}>
          <View style={[styles.pickerContainer, { paddingBottom: Math.max(insets.bottom, 16) + 16 }]}>
            <View style={styles.pickerHeader}>
              <View>
                <Text style={styles.pickerTitle}>Select Group (குழு தேர்வு)</Text>
                <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                  {isUserAdmin ? 'System Admin Group Directory' : 'உங்கள் சங்கங்கள் & குழுக்கள்'}
                </Text>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setIsGroupPickerOpen(false)}>
                <X size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {/* If Admin: Tabs for My Groups vs All System Groups */}
            {isUserAdmin && (
              <View style={styles.adminPickerTabRow}>
                <TouchableOpacity
                  style={[styles.adminPickerTab, adminPickerTab === 'my_groups' && styles.adminPickerTabActive]}
                  onPress={() => setAdminPickerTab('my_groups')}
                >
                  <Text style={[styles.adminPickerTabText, adminPickerTab === 'my_groups' && styles.adminPickerTabTextActive]}>
                    📌 எனது குழுக்கள் ({userGroups.length})
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.adminPickerTab, adminPickerTab === 'all_system_groups' && styles.adminPickerTabActive]}
                  onPress={() => setAdminPickerTab('all_system_groups')}
                >
                  <Text style={[styles.adminPickerTabText, adminPickerTab === 'all_system_groups' && styles.adminPickerTabTextActive]}>
                    🌐 அனைத்து குழுக்கள் ({allSystemGroups.length})
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Search Input for fast lookup */}
            {(isUserAdmin || userGroups.length > 3) && (
              <View style={styles.pickerSearchBox}>
                <Search size={16} color="#64748B" />
                <TextInput
                  style={styles.pickerSearchInput}
                  placeholder="தேடு (Search name, village, reg code...)"
                  placeholderTextColor="#64748B"
                  value={pickerSearch}
                  onChangeText={setPickerSearch}
                  autoCapitalize="none"
                />
                {pickerSearch.length > 0 && (
                  <TouchableOpacity onPress={() => setPickerSearch('')}>
                    <X size={16} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>
            )}

            <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
              {filteredPickerGroups.length === 0 ? (
                <View style={{ padding: 24, alignItems: 'center' }}>
                  <Text style={{ color: '#94A3B8', fontSize: 12 }}>குழுக்கள் எதுவும் இல்லை (No groups found)</Text>
                </View>
              ) : (
                filteredPickerGroups.map((grp) => {
                  const isSelected = selectedGroup && grp.id === selectedGroup.id;
                  return (
                    <TouchableOpacity
                      key={grp.id}
                      style={[styles.pickerGroupItem, isSelected && styles.pickerGroupItemSelected]}
                      onPress={() => {
                        setSelectedGroup(grp);
                        setIsGroupPickerOpen(false);
                      }}
                    >
                      <View style={styles.pickerIconCircle}>
                        <Users size={18} color="#EC4899" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.pickerGroupName}>{grp.name}</Text>
                        <Text style={styles.pickerGroupSub}>
                          {grp.categoryLabel} • {grp.district} • {grp.village}
                        </Text>
                        <Text style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>
                          சேமிப்பு: ₹{(grp.totalSavingsPool ?? 0).toLocaleString('en-IN')} • {grp.totalMembersCount} உறுப்பினர்கள்
                        </Text>
                      </View>
                      {isSelected && <CheckCircle2 size={18} color="#00D084" />}
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>

            {/* Add New Group Action */}
            <TouchableOpacity
              style={styles.pickerAddGroupBtn}
              onPress={() => {
                setIsGroupPickerOpen(false);
                setIsCreateGroupOpen(true);
              }}
              activeOpacity={0.85}
            >
              <Plus size={16} color="#FFFFFF" />
              <Text style={styles.pickerAddGroupBtnText}>
                + புதிய குழு சேர்க்க (Register New Group)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─── 5. SUB-MODALS ─── */}
      <GroupSavingsLedgerModal
        visible={isSavingsModalOpen}
        onClose={() => setIsSavingsModalOpen(false)}
        groupName={selectedGroup.name}
        groupType={selectedGroup.categoryLabel}
        members={selectedGroup.members}
      />

      <GroupMeetingNotesModal
        visible={isMeetingNotesModalOpen}
        onClose={() => setIsMeetingNotesModalOpen(false)}
        groupName={selectedGroup.name}
        members={selectedGroup.members}
      />

      <GroupMeetingVideoModal
        visible={isMeetingVideoModalOpen}
        onClose={() => setIsMeetingVideoModalOpen(false)}
        groupName={selectedGroup.name}
        groupId={selectedGroup.id}
        meetingNumber={24}
      />

      <GroupAiAssistantModal
        visible={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        groupName={selectedGroup.name}
        groupType={selectedGroup.categoryLabel}
        regCode={selectedGroup.regCode}
        village={selectedGroup.village}
        district={selectedGroup.district}
        totalSavingsPool={selectedGroup.totalSavingsPool}
        activeLoanPool={selectedGroup.activeLoanPool}
        memberCount={selectedGroup.totalMembersCount}
        monthlySavings={selectedGroup.monthlySavingsPerMember}
        leaderName={selectedGroup.members.find(m => m.role === 'President')?.name}
      />

      <CreateGroupWizardModal
        visible={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onGroupCreated={handleGroupCreated}
      />

      <GroupAdminConsoleModal
        visible={isGroupAdminModalOpen}
        onClose={() => setIsGroupAdminModalOpen(false)}
        group={selectedGroup}
        onGroupUpdated={loadGroupsData}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
  },
  topBar: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBarLeft: {
    flex: 1,
    marginRight: 10,
  },
  groupBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  groupBadgeText: {
    color: '#EC4899',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  groupSelectorTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  groupSelectorTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
    maxWidth: '85%',
  },
  groupLocationSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  whatsAppCallBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#25D366',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#25D366',
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  telegramBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#229ED9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  tabScrollContent: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
  },
  navTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#1E293B',
  },
  navTabActive: {
    backgroundColor: '#EC4899',
  },
  navTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  navTabTextActive: {
    color: '#FFFFFF',
  },
  mainScroll: {
    flex: 1,
  },
  mainScrollContent: {
    padding: 16,
  },
  heroCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 10,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
    marginRight: 6,
  },
  createGroupMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  createGroupMiniBtnText: {
    color: '#00D084',
    fontSize: 10,
    fontWeight: '800',
  },
  heroCategory: {
    color: '#EC4899',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1,
  },
  heroTagline: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 17,
  },
  heroMetricsGrid: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 10,
    marginTop: 4,
    justifyContent: 'space-between',
  },
  heroMetricItem: {
    alignItems: 'center',
    flex: 1,
  },
  heroMetricVal: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '800',
  },
  heroMetricLabel: {
    color: '#64748B',
    fontSize: 9,
    marginTop: 2,
    textAlign: 'center',
  },
  quickShortcutsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  shortcutBtn: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
  shortcutBtnTitle: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
  },
  shortcutBtnSub: {
    color: '#64748B',
    fontSize: 9,
  },
  aiBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1B4B',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EC4899',
    gap: 12,
  },
  aiBannerIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EC4899',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiBannerTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '800',
  },
  aiBannerBadgeBox: {
    backgroundColor: 'rgba(236, 72, 153, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  aiBannerBadge: {
    color: '#F472B6',
    fontSize: 8,
    fontWeight: '800',
  },
  aiBannerSub: {
    color: '#C7D2FE',
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 10,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
  bankInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: 10,
    borderRadius: 10,
  },
  bankNameText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
  },
  bankAccText: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  verifiedBadgeText: {
    color: '#00D084',
    fontSize: 10,
    fontWeight: '700',
  },
  memberListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingVertical: 8,
  },
  memberAvatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '800',
  },
  memberListName: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
  },
  memberListSub: {
    color: '#64748B',
    fontSize: 10,
  },
  roleTag: {
    backgroundColor: '#334155',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleTagText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
  },
  primaryActionCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EC4899',
    paddingVertical: 13,
    borderRadius: 12,
    shadowColor: '#EC4899',
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryActionCardBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#0F172A',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#00D084',
    borderRadius: 3,
  },
  resSnippetItem: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  resSnippetTitle: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
  },
  resSnippetDesc: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 16,
  },
  benefitItem: {
    color: '#F8FAFC',
    fontSize: 12,
    lineHeight: 18,
  },
  schemeItemCard: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  schemeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  schemeTitle: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  schemeSubsidyBadge: {
    color: '#00D084',
    fontSize: 10,
    fontWeight: '800',
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  schemeDesc: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 16,
  },
  pickerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  pickerTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 6,
    backgroundColor: '#1E293B',
    borderRadius: 16,
  },
  pickerGroupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  pickerGroupItemSelected: {
    borderColor: '#EC4899',
    backgroundColor: 'rgba(236, 72, 153, 0.12)',
  },
  pickerIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(236, 72, 153, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerGroupName: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
  pickerGroupSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  backBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#1E293B',
  },
  emptyHeroCard: {
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.3)',
  },
  emptyHeroTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#F8FAFC',
    textAlign: 'center',
  },
  emptyHeroSubTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EC4899',
    marginTop: 2,
    textAlign: 'center',
  },
  emptyHeroDesc: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 8,
  },
  createGroupMainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EC4899',
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#EC4899',
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  createGroupMainBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  joinGroupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  joinGroupBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#38BDF8',
  },
  featureGrid: {
    gap: 10,
  },
  featureCard: {
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  featureIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  featureCardDesc: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
    marginTop: 4,
  },
  adminPickerTabRow: {
    flexDirection: 'row',
    backgroundColor: '#0B1120',
    borderRadius: 10,
    padding: 4,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  adminPickerTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  adminPickerTabActive: {
    backgroundColor: '#1E293B',
  },
  adminPickerTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  adminPickerTabTextActive: {
    color: '#EC4899',
  },
  pickerSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B1120',
    borderRadius: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 10,
    height: 40,
    gap: 8,
  },
  pickerSearchInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 12,
  },
  pickerAddGroupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  pickerAddGroupBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
