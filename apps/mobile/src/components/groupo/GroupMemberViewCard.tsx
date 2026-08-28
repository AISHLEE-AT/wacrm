import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Share,
  Alert,
} from 'react-native';
import {
  Users,
  Wallet,
  BookOpen,
  Video,
  PhoneCall,
  MessageCircle,
  CheckCircle2,
  Clock,
  Building,
  TrendingUp,
  MapPin,
  Calendar,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Award,
} from 'lucide-react-native';
import { colors, radius, spacing } from '../../lib/theme';
import { DbGroup, DbMember } from '../../services/GroupRepository';

interface GroupMemberViewCardProps {
  group: DbGroup;
  member: DbMember;
  onOpenMeetingVideos?: () => void;
  onOpenResolutions?: () => void;
}

export const GroupMemberViewCard: React.FC<GroupMemberViewCardProps> = ({
  group,
  member,
  onOpenMeetingVideos,
  onOpenResolutions,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'passbook' | 'loans' | 'meetings'>('passbook');

  // Contact Leader via WhatsApp
  const handleContactLeaderWhatsApp = () => {
    const leaderPhone = group.leader_phone || '9486335870';
    const cleanLeaderPhone = (leaderPhone || '').replace(/[^0-9]/g, '').replace(/^91(?=\d{10}$)/, '');
    const msg = `வணக்கம் தலைவர் (${group.leader_name}) அவர்களே! நான் ${member.name} (${group.name} உறுப்பினர்).\n\nஎனது மாதாந்திர சேமிப்பு / கூட்ட விபரம் தொடர்பாக பேச விரும்புகிறேன்.`;
    const url = `whatsapp://send?phone=91${cleanLeaderPhone}&text=${encodeURIComponent(msg)}`;
    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://wa.me/91${cleanLeaderPhone}?text=${encodeURIComponent(msg)}`);
    });
  };

  // Direct Call to Leader
  const handleCallLeader = () => {
    const leaderPhone = group.leader_phone || '9486335870';
    Linking.openURL(`tel:${leaderPhone}`);
  };

  return (
    <View style={styles.container}>
      {/* ─── 1. LINKED GROUP HERO BANNER ─── */}
      <View style={styles.heroCard}>
        <View style={styles.linkedBadgeRow}>
          <View style={styles.linkedBadge}>
            <ShieldCheck size={13} color="#00D084" />
            <Text style={styles.linkedBadgeText}>LINKED GROUP MEMBER • உறுப்பினர்</Text>
          </View>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{member.role || 'Member'}</Text>
          </View>
        </View>

        <Text style={styles.groupTitle}>{group.name}</Text>
        <Text style={styles.groupCategory}>{group.category_label}</Text>
        <Text style={styles.locationText}>
          📍 {group.village}, {group.district} • Reg: {group.reg_code || 'TNCDW-2024'}
        </Text>

        {/* Leader Contact Bar */}
        <View style={styles.leaderBar}>
          <View style={{ flex: 1 }}>
            <Text style={styles.leaderLabel}>குழு தலைவர் (Group Leader):</Text>
            <Text style={styles.leaderName}>{group.leader_name || 'குழு தலைவர் (Leader)'}</Text>
          </View>
          <View style={styles.leaderActionsRow}>
            <TouchableOpacity style={styles.leaderCallBtn} onPress={handleCallLeader}>
              <PhoneCall size={14} color="#FFFFFF" />
              <Text style={styles.leaderCallText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.leaderWaBtn} onPress={handleContactLeaderWhatsApp}>
              <MessageCircle size={14} color="#FFFFFF" />
              <Text style={styles.leaderCallText}>WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ─── 2. SUB TABS ─── */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeSubTab === 'passbook' && styles.tabBtnActive]}
          onPress={() => setActiveSubTab('passbook')}
        >
          <Wallet size={14} color={activeSubTab === 'passbook' ? '#FFFFFF' : '#94A3B8'} />
          <Text style={[styles.tabBtnText, activeSubTab === 'passbook' && styles.tabBtnTextActive]}>
            எனது சேமிப்பு ஏடு
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeSubTab === 'loans' && styles.tabBtnActive]}
          onPress={() => setActiveSubTab('loans')}
        >
          <TrendingUp size={14} color={activeSubTab === 'loans' ? '#FFFFFF' : '#94A3B8'} />
          <Text style={[styles.tabBtnText, activeSubTab === 'loans' && styles.tabBtnTextActive]}>
            உள் கடன் & தவணை
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeSubTab === 'meetings' && styles.tabBtnActive]}
          onPress={() => setActiveSubTab('meetings')}
        >
          <BookOpen size={14} color={activeSubTab === 'meetings' ? '#FFFFFF' : '#94A3B8'} />
          <Text style={[styles.tabBtnText, activeSubTab === 'meetings' && styles.tabBtnTextActive]}>
            கூட்ட விவரம்
          </Text>
        </TouchableOpacity>
      </View>

      {/* ─── 3. TAB CONTENT ─── */}
      {activeSubTab === 'passbook' && (
        <View style={{ gap: 12 }}>
          {/* Monthly Status Card */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Wallet size={16} color="#EC4899" />
              <Text style={styles.cardTitle}>Current Month Savings (நடப்பு மாத சேமிப்பு)</Text>
            </View>

            <View style={styles.statusHighlightBox}>
              <View>
                <Text style={styles.amountLarge}>₹{member.savings_amount ?? 500}</Text>
                <Text style={styles.amountSub}>August 2026 Monthly Due</Text>
              </View>
              <View
                style={[
                  styles.statusPill,
                  member.current_month_paid ? styles.statusPillPaid : styles.statusPillPending,
                ]}
              >
                {member.current_month_paid ? (
                  <>
                    <CheckCircle2 size={14} color="#00D084" />
                    <Text style={[styles.statusPillText, { color: '#00D084' }]}>Paid & Verified</Text>
                  </>
                ) : (
                  <>
                    <Clock size={14} color="#F59E0B" />
                    <Text style={[styles.statusPillText, { color: '#F59E0B' }]}>Payment Due</Text>
                  </>
                )}
              </View>
            </View>

            <View style={styles.passbookStatsRow}>
              <View style={styles.passbookStatItem}>
                <Text style={styles.statLabel}>Total Group Pool</Text>
                <Text style={styles.statVal}>₹{(group.total_savings_pool ?? 0).toLocaleString('en-IN')}</Text>
              </View>
              <View style={styles.passbookStatItem}>
                <Text style={styles.statLabel}>Your Accumulated</Text>
                <Text style={[styles.statVal, { color: '#00D084' }]}>
                  ₹{(member.total_savings_accumulated ?? 0).toLocaleString('en-IN')}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {activeSubTab === 'loans' && (
        <View style={{ gap: 12 }}>
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <TrendingUp size={16} color="#F59E0B" />
              <Text style={styles.cardTitle}>Internal Loan Balance (உள் கடன் கணக்கு)</Text>
            </View>

            {member.active_loan_balance > 0 ? (
              <View style={{ gap: 10 }}>
                <View style={styles.loanBalanceCard}>
                  <Text style={styles.loanLabel}>Active Outstanding Loan:</Text>
                  <Text style={styles.loanAmountVal}>₹{member.active_loan_balance.toLocaleString('en-IN')}</Text>
                  <Text style={styles.loanRateText}>Interest Rate: 1.5% per month (குறைந்த வட்டி)</Text>
                </View>

                <View style={styles.emiRow}>
                  <Text style={styles.emiLabel}>Monthly EMI + Interest Due:</Text>
                  <Text style={styles.emiVal}>
                    ₹{Math.round(member.active_loan_balance * 0.015 + 1000).toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.noLoanBox}>
                <CheckCircle2 size={24} color="#00D084" />
                <Text style={styles.noLoanTitle}>No Active Loans</Text>
                <Text style={styles.noLoanSub}>
                  You have zero loan dues. You are eligible to apply for up to ₹25,000 internal loan in your next group meeting.
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {activeSubTab === 'meetings' && (
        <View style={{ gap: 12 }}>
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Calendar size={16} color="#38BDF8" />
              <Text style={styles.cardTitle}>Group Meeting Schedule (கூட்ட அட்டவணை)</Text>
            </View>

            <View style={styles.meetingItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.meetingTitle}>மாதாந்திர கலந்தாய்வு கூட்டம் (Regular Assembly)</Text>
                <Text style={styles.meetingSub}>Schedule: {group.meeting_schedule || 'Every Month 5th & 20th'}</Text>
                <Text style={styles.meetingVenue}>📍 {group.village} Panchayat Community Hall</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.videoLinkBtn} onPress={onOpenMeetingVideos}>
              <Video size={16} color="#EC4899" />
              <Text style={styles.videoLinkBtnText}>Watch Meeting Video Records on Google Drive 📹</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  heroCard: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 8,
  },
  linkedBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linkedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  linkedBadgeText: {
    color: '#00D084',
    fontSize: 9,
    fontWeight: '800',
  },
  roleBadge: {
    backgroundColor: 'rgba(236, 72, 153, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roleBadgeText: {
    color: '#EC4899',
    fontSize: 10,
    fontWeight: '800',
  },
  groupTitle: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '800',
    marginTop: 2,
  },
  groupCategory: {
    color: '#EC4899',
    fontSize: 11,
    fontWeight: '700',
  },
  locationText: {
    color: '#94A3B8',
    fontSize: 11,
  },
  leaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    marginTop: 6,
  },
  leaderLabel: {
    color: '#64748B',
    fontSize: 10,
  },
  leaderName: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 1,
  },
  leaderActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  leaderCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#38BDF8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  leaderWaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#25D366',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  leaderCallText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#1E293B',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  tabBtnActive: {
    backgroundColor: '#EC4899',
    borderColor: '#EC4899',
  },
  tabBtnText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 12,
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
  statusHighlightBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
  },
  amountLarge: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '800',
  },
  amountSub: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusPillPaid: {
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
  },
  statusPillPending: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  passbookStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 10,
  },
  passbookStatItem: {
    flex: 1,
  },
  statLabel: {
    color: '#64748B',
    fontSize: 10,
  },
  statVal: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  loanBalanceCard: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  loanLabel: {
    color: '#64748B',
    fontSize: 11,
  },
  loanAmountVal: {
    color: '#F59E0B',
    fontSize: 20,
    fontWeight: '800',
  },
  loanRateText: {
    color: '#A3E635',
    fontSize: 11,
    marginTop: 2,
  },
  emiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 10,
  },
  emiLabel: {
    color: '#94A3B8',
    fontSize: 11,
  },
  emiVal: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '800',
  },
  noLoanBox: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 6,
  },
  noLoanTitle: {
    color: '#00D084',
    fontSize: 14,
    fontWeight: '800',
  },
  noLoanSub: {
    color: '#94A3B8',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 12,
  },
  meetingItem: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 10,
  },
  meetingTitle: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
  },
  meetingSub: {
    color: '#EC4899',
    fontSize: 11,
    marginTop: 2,
  },
  meetingVenue: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  videoLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
    borderWidth: 1,
    borderColor: '#EC4899',
    paddingVertical: 10,
    borderRadius: 10,
  },
  videoLinkBtnText: {
    color: '#EC4899',
    fontSize: 11,
    fontWeight: '700',
  },
});
