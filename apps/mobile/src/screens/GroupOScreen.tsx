import React, { useState, useContext, useEffect } from 'react';
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

const COURSE_GUIDE_WHATSAPP = '919486335870';
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

const PRESET_GROUPS: GroupData[] = [
  {
    id: 'grp-shg-01',
    name: 'தாமரை மகளிர் சுய உதவிக் குழு (Thamarai Women SHG)',
    category: 'WomenSHG',
    categoryLabel: 'மகளிர் சுய உதவிக் குழு (Mathi TNCDW)',
    tagline: 'மாதாந்திர சேமிப்பு, தையல் & சிறுதொழில் கூட்டமைப்பு',
    village: 'அலங்காநல்லூர் (Alanganallur)',
    district: 'மதுரை (Madurai)',
    regCode: 'TNCDW-MDU-2024-8842',
    bankName: 'Canara Bank (அலங்காநல்லூர்)',
    bankAccount: '*******8920',
    monthlySavingsPerMember: 500,
    totalMembersCount: 15,
    totalSavingsPool: 145000,
    activeLoanPool: 40000,
    meetingDay: 'Every Month 5th & 20th',
    customMetrics: {
      label1: 'உறுப்பினர்கள் (Members)', val1: '15',
      label2: 'சேமிப்பு நிதி (Savings)', val2: '₹1,45,000',
      label3: 'சுழல் உள் கடன் (Loans)', val3: '₹40,000',
    },
    members: [
      { id: 'm1', name: 'K. Meenakshi (மீனாட்சி)', role: 'President', phone: '+91 98421 11223', savingsPaid: true, savingsAmount: 500 },
      { id: 'm2', name: 'M. Anandhi (ஆனந்தி)', role: 'Secretary', phone: '+91 98422 22334', savingsPaid: true, savingsAmount: 500 },
      { id: 'm3', name: 'S. Lakshmi (லட்சுமி)', role: 'Treasurer', phone: '+91 98423 33445', savingsPaid: true, savingsAmount: 500, loanBalance: 16500 },
      { id: 'm4', name: 'P. Kavitha (கவிதா)', role: 'Member', phone: '+91 98424 44556', savingsPaid: true, savingsAmount: 500 },
      { id: 'm5', name: 'R. Revathi (ரேவதி)', role: 'Member', phone: '+91 98425 55667', savingsPaid: false, savingsAmount: 500 },
      { id: 'm6', name: 'T. Saranya (சரண்யா)', role: 'Member', phone: '+91 98426 66778', savingsPaid: true, savingsAmount: 500 },
    ],
  },
  {
    id: 'grp-fpo-02',
    name: 'பசுமை உழவர் உற்பத்தியாளர் சங்கம் (Pasumai Farmers FPO)',
    category: 'FarmerFPO',
    categoryLabel: 'உழவர் உற்பத்தியாளர் சங்கம் (Agri FPO)',
    tagline: 'இயற்கை உரம் கொள்முதல், கூட்டு நெல் சாகுபடி & நேரடி சந்தை',
    village: 'திருவையாறு (Thiruvaiyaru)',
    district: 'தஞ்சாவூர் (Thanjavur)',
    regCode: 'NABARD-TNJ-FPO-1049',
    bankName: 'SBI Agri Branch',
    bankAccount: '*******4410',
    monthlySavingsPerMember: 1000,
    totalMembersCount: 22,
    totalSavingsPool: 320000,
    activeLoanPool: 85000,
    meetingDay: 'Every Month 10th',
    customMetrics: {
      label1: 'விவசாயிகள் (Farmers)', val1: '22',
      label2: 'கூட்டு நிதி (Agri Pool)', val2: '₹3,20,000',
      label3: 'சாகுபடி பரப்பு (Acres)', val3: '140 Acres',
    },
    members: [
      { id: 'f1', name: 'V. Sundaram (சுந்தரம்)', role: 'President', phone: '+91 94431 10101', savingsPaid: true, savingsAmount: 1000 },
      { id: 'f2', name: 'P. Marimuthu (மாரிமுத்து)', role: 'Secretary', phone: '+91 94432 20202', savingsPaid: true, savingsAmount: 1000 },
      { id: 'f3', name: 'K. Durairaj (துரைராஜ்)', role: 'Treasurer', phone: '+91 94433 30303', savingsPaid: true, savingsAmount: 1000 },
    ],
  },
  {
    id: 'grp-sport-03',
    name: 'வீரத்தமிழன் கபடி & விளையாட்டு சங்கம் (Youth Sports Club)',
    category: 'SportsClub',
    categoryLabel: 'விளையாட்டு & இளைஞர் நல சங்கம்',
    tagline: 'மாவட்ட அளவிலான கபடி, கிரிக்கெட் & தடகள பயிற்சி மற்றும் நிதி',
    village: 'உசிலம்பட்டி (Usilampatti)',
    district: 'மதுரை (Madurai)',
    regCode: 'TN-SDAT-MDU-552',
    bankName: 'Indian Bank',
    bankAccount: '*******3319',
    monthlySavingsPerMember: 300,
    totalMembersCount: 18,
    totalSavingsPool: 54000,
    activeLoanPool: 12000,
    meetingDay: 'Every Sunday Evening',
    customMetrics: {
      label1: 'வீரர்கள் (Players)', val1: '18',
      label2: 'விளையாட்டு நிதி (Fund)', val2: '₹54,000',
      label3: 'வெற்றி (Matches Won)', val3: '9 Wins (28 Played)',
    },
    members: [
      { id: 's1', name: 'M. Manikandan (மணிகண்டன்)', role: 'Captain / President', phone: '+91 97891 00011', savingsPaid: true, savingsAmount: 300 },
      { id: 's2', name: 'K. Vignesh (விக்னேஷ்)', role: 'Secretary', phone: '+91 97892 00022', savingsPaid: true, savingsAmount: 300 },
      { id: 's3', name: 'R. Surya (சூர்யா)', role: 'Treasurer', phone: '+91 97893 00033', savingsPaid: true, savingsAmount: 300 },
    ],
  },
  {
    id: 'grp-biz-04',
    name: 'கொங்கு சிறுவணிகர் & வர்த்தக கூட்டமைப்பு (Merchant Network)',
    category: 'BusinessGroup',
    categoryLabel: 'வணிகர் & சிறுதொழில் கூட்டமைப்பு',
    tagline: 'மொத்த கொள்முதல், B2B வர்த்தக வட்டம் & பண்டிகை விற்பனை',
    village: 'பொள்ளாச்சி (Pollachi)',
    district: 'கோயம்புத்தூர் (Coimbatore)',
    regCode: 'TN-MSME-CBE-9801',
    bankName: 'HDFC Bank',
    bankAccount: '*******5521',
    monthlySavingsPerMember: 2000,
    totalMembersCount: 28,
    totalSavingsPool: 480000,
    activeLoanPool: 150000,
    meetingDay: 'Every Month 1st',
    customMetrics: {
      label1: 'வர்த்தகர்கள் (Merchants)', val1: '28',
      label2: 'வணிக நிதி (Trade Pool)', val2: '₹4,80,000',
      label3: 'B2B வர்த்தகம் (Monthly)', val3: '₹12 Lakhs/Mo',
    },
    members: [
      { id: 'b1', name: 'T. Murugan (முருகன்)', role: 'President', phone: '+91 98941 01010', savingsPaid: true, savingsAmount: 2000 },
      { id: 'b2', name: 'S. Rajendran (ராஜேந்திரன்)', role: 'Secretary', phone: '+91 98942 02020', savingsPaid: true, savingsAmount: 2000 },
    ],
  },
  {
    id: 'grp-rwa-05',
    name: 'அன்னை சத்யா நகர் கிராம குடியிருப்போர நலச் சங்கம் (Village RWA)',
    category: 'VillageRWA',
    categoryLabel: 'கிராம நலச் சங்கம் & குடியிருப்போர சங்கம்',
    tagline: 'குடிநீர், தெருவிளக்கு, தூய்மைப் பணி & ஊர் திருவிழா நிதி',
    village: 'ஆத்தூர் (Attur)',
    district: 'சேலம் (Salem)',
    regCode: 'TN-RWA-SLM-342',
    bankName: 'Indian Overseas Bank',
    bankAccount: '*******1109',
    monthlySavingsPerMember: 200,
    totalMembersCount: 240,
    totalSavingsPool: 78000,
    activeLoanPool: 5000,
    meetingDay: 'Every Month 15th',
    customMetrics: {
      label1: 'குடும்பங்கள் (Households)', val1: '240',
      label2: 'ஊர் நல நிதி (Ward Fund)', val2: '₹78,000',
      label3: 'நிறைவேறிய திட்டங்கள்', val3: '14 Civic Projects',
    },
    members: [
      { id: 'r1', name: 'P. Shanmugam (சண்முகம்)', role: 'President', phone: '+91 98432 02020', savingsPaid: true, savingsAmount: 200 },
      { id: 'r2', name: 'K. Balakrishnan (பாலகிருஷ்ணன்)', role: 'Secretary', phone: '+91 98433 03030', savingsPaid: true, savingsAmount: 200 },
    ],
  },
  {
    id: 'grp-study-06',
    name: 'பாரதி இளைஞர் & போட்டித் தேர்வு கல்வி வட்டம் (Youth Study Circle)',
    category: 'YouthStudy',
    categoryLabel: 'மாணவர் கல்வி & போட்டித் தேர்வு வட்டம்',
    tagline: 'TNPSC, NEET & பள்ளி பொதுத்தேர்வு கூட்டு படிப்பு மற்றும் புத்தக வங்கி',
    village: 'ஸ்ரீரங்கம் (Srirangam)',
    district: 'திருச்சிராப்பள்ளி (Trichy)',
    regCode: 'TN-EDU-TRY-882',
    bankName: 'Bank of Baroda',
    bankAccount: '*******7765',
    monthlySavingsPerMember: 100,
    totalMembersCount: 32,
    totalSavingsPool: 24000,
    activeLoanPool: 0,
    meetingDay: 'Every Saturday 5 PM',
    customMetrics: {
      label1: 'மாணவர்கள் (Students)', val1: '32',
      label2: 'புத்தக வங்கி நிதி', val2: '₹24,000',
      label3: 'மாதிரி தேர்வுகள் (Mock Tests)', val3: '36 Completed',
    },
    members: [
      { id: 'e1', name: 'Dr. S. Karthik (கார்த்திக்)', role: 'Convener', phone: '+91 97903 03030', savingsPaid: true, savingsAmount: 100 },
      { id: 'e2', name: 'M. Divya (திவ்யா)', role: 'Student Leader', phone: '+91 97904 04040', savingsPaid: true, savingsAmount: 100 },
    ],
  },
];

export default function GroupOScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user } = useContext(AppContext);

  const [selectedGroup, setSelectedGroup] = useState<GroupData>(PRESET_GROUPS[0]);
  const [activeTab, setActiveTab] = useState<'overview' | 'savings' | 'meetings' | 'videos' | 'schemes'>('overview');
  const [isGroupPickerOpen, setIsGroupPickerOpen] = useState(false);

  // Dynamic Leader vs Member status from Supabase
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

  useEffect(() => {
    const checkRole = async () => {
      setIsLoadingStatus(true);
      try {
        const phone = user?.phone || '9842111223';
        const status = await GroupRepository.getUserGroupStatus(phone);
        setUserStatus(status);
        if (status.group) {
          const mapped: GroupData = {
            id: status.group.id || 'grp-dynamic',
            name: status.group.name,
            category: status.group.category || 'WomenSHG',
            categoryLabel: status.group.category_label || 'மகளிர் சுய உதவிக் குழு',
            tagline: status.group.tagline || 'மாதாந்திர சேமிப்பு & கூட்டமைப்பு',
            village: status.group.village || 'அலங்காநல்லூர்',
            district: status.group.district || 'மதுரை',
            regCode: status.group.reg_code || 'TNCDW-2024',
            bankName: status.group.bank_name || 'Canara Bank',
            bankAccount: status.group.bank_account || '*******8920',
            monthlySavingsPerMember: status.group.monthly_savings_per_member || 500,
            totalMembersCount: 15,
            totalSavingsPool: status.group.total_savings_pool ?? 0,
            activeLoanPool: status.group.active_loan_pool ?? 0,
            meetingDay: status.group.meeting_schedule || 'Every Month 5th & 20th',
            members: status.members && status.members.length > 0 
              ? status.members.map((m: any) => ({
                  id: m.id,
                  name: m.name || m.full_name,
                  role: m.role || 'Member',
                  phone: m.phone,
                  savingsPaid: m.current_month_paid ?? false,
                  savingsAmount: m.savings_amount ?? 0,
                  loanBalance: m.active_loan_balance ?? 0,
                }))
              : PRESET_GROUPS[0].members,
          };
          setSelectedGroup(mapped);
        }
      } catch (err) {
        console.warn('Error checking user group role:', err);
      } finally {
        setIsLoadingStatus(false);
      }
    };
    checkRole();
  }, [user?.phone]);

  // 1-Click WhatsApp Group Call
  const handleLaunchWhatsAppGroupCall = () => {
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
                    leader_name: 'K. Meenakshi',
                    leader_phone: '9842111223',
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
                <Text style={styles.benefitItem}>• ✅ 1-Click WhatsApp verification to Guide (+91 9486335870).</Text>
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
              <Text style={styles.pickerTitle}>Select Group (குழு தேர்வு)</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setIsGroupPickerOpen(false)}>
                <X size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
              {PRESET_GROUPS.map((grp) => {
                const isSelected = grp.id === selectedGroup.id;
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
                      <Text style={styles.pickerGroupSub}>{grp.categoryLabel} • {grp.district}</Text>
                    </View>
                    {isSelected && <CheckCircle2 size={18} color="#00D084" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
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
      />

      <CreateGroupWizardModal
        visible={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onGroupCreated={(newGrp) => {
          setSelectedGroup({
            id: newGrp.id,
            name: newGrp.name,
            category: newGrp.category,
            categoryLabel: newGrp.category_label,
            tagline: newGrp.tagline || 'மாதாந்திர சேமிப்பு & கூட்டமைப்பு',
            village: newGrp.village,
            district: newGrp.district,
            regCode: newGrp.reg_code || 'TNCDW-2024',
            bankName: newGrp.bank_name || 'Canara Bank',
            bankAccount: newGrp.bank_account || '*******8920',
            monthlySavingsPerMember: newGrp.monthly_savings_per_member,
            totalMembersCount: 15,
            totalSavingsPool: 0,
            activeLoanPool: 0,
            meetingDay: 'Every Month 5th & 20th',
            members: PRESET_GROUPS[0].members,
          });
        }}
      />

      <GroupAdminConsoleModal
        visible={isGroupAdminModalOpen}
        onClose={() => setIsGroupAdminModalOpen(false)}
        group={selectedGroup}
        onGroupUpdated={() => {
          // Re-fetch or refresh group state
        }}
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
});
