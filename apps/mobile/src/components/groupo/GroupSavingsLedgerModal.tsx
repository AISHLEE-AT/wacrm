import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  X,
  Wallet,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  QrCode,
  Sparkles,
  Plus,
  Share2,
  DollarSign,
  TrendingUp,
  Percent,
} from 'lucide-react-native';
import { colors } from '../../lib/theme';

export interface GroupMember {
  id: string;
  name: string;
  role: 'President' | 'Secretary' | 'Treasurer' | 'Captain' | 'Convener' | 'Animator' | 'Member' | string;
  phone: string;
  savingsPaid: boolean;
  savingsAmount: number;
  loanBalance?: number;
  monthlyEmi?: number;
}

export interface InternalLoanRecord {
  id: string;
  borrowerName: string;
  principalAmount: number;
  interestRateMonthly: number; // e.g. 1.5%
  disbursedDate: string;
  repaidAmount: number;
  status: 'Active' | 'Closed';
  purpose: string;
}

interface GroupSavingsLedgerModalProps {
  visible: boolean;
  onClose: () => void;
  groupName: string;
  groupType: string;
  members: GroupMember[];
  onUpdateMembers?: (updated: GroupMember[]) => void;
}

export const GroupSavingsLedgerModal: React.FC<GroupSavingsLedgerModalProps> = ({
  visible,
  onClose,
  groupName,
  groupType,
  members: initialMembers,
  onUpdateMembers,
}) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'savings' | 'loans' | 'summary'>('savings');
  const [members, setMembers] = useState<GroupMember[]>(initialMembers);
  const [monthlyTarget, setMonthlyTarget] = useState<number>(500);

  // Internal Loans State
  const [loans, setLoans] = useState<InternalLoanRecord[]>([
    {
      id: 'loan-1',
      borrowerName: 'S. Lakshmi (செல்வி லட்சுமி)',
      principalAmount: 25000,
      interestRateMonthly: 1.5,
      disbursedDate: '2026-07-15',
      repaidAmount: 8500,
      status: 'Active',
      purpose: 'Tailoring machine purchase (தையல் இயந்திரம்)',
    },
    {
      id: 'loan-2',
      borrowerName: 'M. Anandhi (மு. ஆனந்தி)',
      principalAmount: 15000,
      interestRateMonthly: 1.5,
      disbursedDate: '2026-08-01',
      repaidAmount: 3200,
      status: 'Active',
      purpose: 'Cattle feed & Dairy setup (கால்நடை தீவனம்)',
    },
  ]);

  // New Loan Form Modal State
  const [isAddingLoan, setIsAddingLoan] = useState(false);
  const [newBorrower, setNewBorrower] = useState('');
  const [newPrincipal, setNewPrincipal] = useState('20000');
  const [newPurpose, setNewPurpose] = useState('Micro-Enterprise business');

  // Toggle member paid status
  const handleTogglePayment = (memberId: string) => {
    const updated = members.map((m) => {
      if (m.id === memberId) {
        return { ...m, savingsPaid: !m.savingsPaid };
      }
      return m;
    });
    setMembers(updated);
    onUpdateMembers?.(updated);
  };

  // Mark all paid
  const handleMarkAllPaid = () => {
    const updated = members.map((m) => ({ ...m, savingsPaid: true }));
    setMembers(updated);
    onUpdateMembers?.(updated);
    Alert.alert('✅ All Paid', 'All members marked as paid for this month!');
  };

  // Add new internal loan
  const handleCreateLoan = () => {
    if (!newBorrower.trim() || !newPrincipal.trim()) {
      Alert.alert('Incomplete Details', 'Please enter borrower name and principal amount.');
      return;
    }

    const principal = parseFloat(newPrincipal) || 10000;
    const newRecord: InternalLoanRecord = {
      id: `loan-${Date.now()}`,
      borrowerName: newBorrower.trim(),
      principalAmount: principal,
      interestRateMonthly: 1.5,
      disbursedDate: new Date().toISOString().split('T')[0],
      repaidAmount: 0,
      status: 'Active',
      purpose: newPurpose.trim() || 'Internal SHG Loan',
    };

    setLoans([newRecord, ...loans]);
    setIsAddingLoan(false);
    setNewBorrower('');
    Alert.alert('🎉 Loan Disbursed', `₹${principal.toLocaleString('en-IN')} internal loan recorded for ${newRecord.borrowerName}.`);
  };

  // Calculate totals
  const totalCollected = members.filter((m) => m.savingsPaid).reduce((acc, m) => acc + (m.savingsAmount || monthlyTarget), 0);
  const totalExpected = members.length * monthlyTarget;
  const totalActiveLoans = loans.filter((l) => l.status === 'Active').reduce((acc, l) => acc + (l.principalAmount - l.repaidAmount), 0);
  const totalInterestEarned = loans.reduce((acc, l) => acc + (l.repaidAmount * (l.interestRateMonthly / 100)), 0);
  const bankPoolBalance = 145000 + totalCollected - 40000 + totalInterestEarned;

  const handleShareStatement = () => {
    const msg = `📊 *${groupName} — Monthly Financial Ledger* 💰\n\n` +
      `🗓️ *Month:* August 2026\n` +
      `👥 *Total Members:* ${members.length}\n` +
      `💵 *Monthly Savings Target:* ₹${monthlyTarget}/member\n` +
      `✅ *Collected:* ₹${totalCollected.toLocaleString('en-IN')} / ₹${totalExpected.toLocaleString('en-IN')}\n` +
      `🤝 *Active Internal Loans:* ₹${totalActiveLoans.toLocaleString('en-IN')}\n` +
      `🏦 *Current Bank Pool Balance:* ₹${bankPoolBalance.toLocaleString('en-IN')}\n\n` +
      `Verified by SuprO GroupO Digital Passbook Engine ✨`;

    Share.share({ message: msg });
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) + 12 }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.badgeRow}>
                <View style={styles.badge}>
                  <Wallet size={12} color="#EC4899" />
                  <Text style={styles.badgeText}>FINANCIAL LEDGER & PASSBOOK</Text>
                </View>
              </View>
              <Text style={styles.headerTitle} numberOfLines={1}>{groupName}</Text>
              <Text style={styles.headerSub}>மாதாந்திர சேமிப்பு & உள் கடன் கணக்கு ஏடு</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Tab Switcher */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'savings' && styles.tabBtnActive]}
              onPress={() => setActiveTab('savings')}
            >
              <Text style={[styles.tabBtnText, activeTab === 'savings' && styles.tabBtnTextActive]}>
                💰 Savings ({members.filter((m) => m.savingsPaid).length}/{members.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'loans' && styles.tabBtnActive]}
              onPress={() => setActiveTab('loans')}
            >
              <Text style={[styles.tabBtnText, activeTab === 'loans' && styles.tabBtnTextActive]}>
                🤝 Internal Loans ({loans.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'summary' && styles.tabBtnActive]}
              onPress={() => setActiveTab('summary')}
            >
              <Text style={[styles.tabBtnText, activeTab === 'summary' && styles.tabBtnTextActive]}>
                📊 Summary
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* ─── TAB 1: SAVINGS COLLECTION ─── */}
            {activeTab === 'savings' && (
              <View style={{ gap: 12 }}>
                {/* Metric Summary Card */}
                <View style={styles.statCard}>
                  <View style={styles.statRow}>
                    <View>
                      <Text style={styles.statLabel}>August 2026 Collection</Text>
                      <Text style={styles.statValue}>₹{totalCollected.toLocaleString('en-IN')}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.statLabel}>Expected (₹{monthlyTarget}/m)</Text>
                      <Text style={[styles.statValue, { color: '#94A3B8' }]}>
                        ₹{totalExpected.toLocaleString('en-IN')}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${Math.min(100, Math.round((totalCollected / (totalExpected || 1)) * 100))}%` },
                      ]}
                    />
                  </View>
                </View>

                {/* Fast Action Buttons */}
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.quickActionBtn} onPress={handleMarkAllPaid}>
                    <CheckCircle2 size={14} color="#00D084" />
                    <Text style={styles.quickActionText}>Mark All Paid</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.quickActionBtn} onPress={handleShareStatement}>
                    <Share2 size={14} color="#38BDF8" />
                    <Text style={styles.quickActionText}>Share Statement</Text>
                  </TouchableOpacity>
                </View>

                {/* Member Roster List */}
                <Text style={styles.sectionHeading}>Member Monthly Contributions</Text>
                {members.map((member) => (
                  <View key={member.id} style={styles.memberCard}>
                    <View style={styles.memberAvatar}>
                      <Text style={styles.avatarText}>{member.name.slice(0, 2).toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.memberName}>{member.name}</Text>
                        {member.role !== 'Member' && (
                          <Text style={styles.roleBadge}>{member.role}</Text>
                        )}
                      </View>
                      <Text style={styles.memberSub}>
                        Due: ₹{member.savingsAmount || monthlyTarget} • {member.phone}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.paymentPill,
                        member.savingsPaid ? styles.paymentPillPaid : styles.paymentPillPending,
                      ]}
                      onPress={() => handleTogglePayment(member.id)}
                    >
                      {member.savingsPaid ? (
                        <>
                          <CheckCircle2 size={12} color="#00D084" />
                          <Text style={styles.paidText}>Paid ₹{member.savingsAmount || monthlyTarget}</Text>
                        </>
                      ) : (
                        <>
                          <Clock size={12} color="#F59E0B" />
                          <Text style={styles.pendingText}>Pending</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* ─── TAB 2: INTERNAL LOANS LEDGER ─── */}
            {activeTab === 'loans' && (
              <View style={{ gap: 12 }}>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Total Active Loan Balance</Text>
                  <Text style={[styles.statValue, { color: '#F59E0B' }]}>
                    ₹{totalActiveLoans.toLocaleString('en-IN')}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
                    Interest Rate: 1.5% per month (₹1.50 per ₹100/mo) • Revolving Community Pool
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.addLoanTrigger}
                  onPress={() => setIsAddingLoan(true)}
                >
                  <Plus size={16} color="#EC4899" />
                  <Text style={styles.addLoanTriggerText}>+ Disburse New Internal Loan (புதிய உள் கடன்)</Text>
                </TouchableOpacity>

                <Text style={styles.sectionHeading}>Active Internal Loans</Text>
                {loans.map((loan) => (
                  <View key={loan.id} style={styles.loanCard}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={styles.loanBorrower}>{loan.borrowerName}</Text>
                      <View style={styles.loanBadge}>
                        <Text style={styles.loanBadgeText}>{loan.status}</Text>
                      </View>
                    </View>
                    <Text style={styles.loanPurpose}>{loan.purpose}</Text>
                    <View style={styles.loanDivider} />
                    <View style={styles.loanStatRow}>
                      <View>
                        <Text style={styles.loanStatKey}>Principal</Text>
                        <Text style={styles.loanStatVal}>₹{loan.principalAmount.toLocaleString('en-IN')}</Text>
                      </View>
                      <View>
                        <Text style={styles.loanStatKey}>Repaid</Text>
                        <Text style={[styles.loanStatVal, { color: '#00D084' }]}>₹{loan.repaidAmount.toLocaleString('en-IN')}</Text>
                      </View>
                      <View>
                        <Text style={styles.loanStatKey}>Balance</Text>
                        <Text style={[styles.loanStatVal, { color: '#EF4444' }]}>
                          ₹{(loan.principalAmount - loan.repaidAmount).toLocaleString('en-IN')}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* ─── TAB 3: FINANCIAL STATEMENT SUMMARY ─── */}
            {activeTab === 'summary' && (
              <View style={{ gap: 12 }}>
                <View style={[styles.statCard, { borderColor: '#00D084', backgroundColor: '#071F15' }]}>
                  <Text style={[styles.statLabel, { color: '#A7F3D0' }]}>Total Bank Account & Cash Pool</Text>
                  <Text style={[styles.statValue, { color: '#00D084', fontSize: 24 }]}>
                    ₹{bankPoolBalance.toLocaleString('en-IN')}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#6EE7B7', marginTop: 4 }}>
                    Bank: Canara Bank (A/C: *******8920) • IFSC: CNRB0001234
                  </Text>
                </View>

                <View style={styles.summaryBreakdownCard}>
                  <Text style={styles.breakdownTitle}>Financial Inflow & Outflow</Text>
                  <View style={styles.breakdownRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <ArrowDownLeft size={16} color="#00D084" />
                      <Text style={styles.breakdownLabel}>Monthly Savings Total</Text>
                    </View>
                    <Text style={[styles.breakdownVal, { color: '#00D084' }]}>+₹{totalCollected.toLocaleString('en-IN')}</Text>
                  </View>
                  <View style={styles.breakdownRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <ArrowDownLeft size={16} color="#00D084" />
                      <Text style={styles.breakdownLabel}>Loan Interest Earned</Text>
                    </View>
                    <Text style={[styles.breakdownVal, { color: '#00D084' }]}>+₹{totalInterestEarned.toLocaleString('en-IN')}</Text>
                  </View>
                  <View style={styles.breakdownRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <ArrowUpRight size={16} color="#EF4444" />
                      <Text style={styles.breakdownLabel}>Active Internal Loans</Text>
                    </View>
                    <Text style={[styles.breakdownVal, { color: '#EF4444' }]}>-₹{totalActiveLoans.toLocaleString('en-IN')}</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.exportBtn} onPress={handleShareStatement}>
                  <Share2 size={16} color="#0F172A" />
                  <Text style={styles.exportBtnText}>Share & Export Audit Statement</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          {/* Modal for adding internal loan */}
          {isAddingLoan && (
            <View style={styles.innerModalOverlay}>
              <View style={styles.innerModalContent}>
                <Text style={styles.innerModalTitle}>Disburse Internal Loan (உள் கடன்)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Borrower Member Name"
                  placeholderTextColor="#64748B"
                  value={newBorrower}
                  onChangeText={setNewBorrower}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Principal Amount (₹)"
                  placeholderTextColor="#64748B"
                  keyboardType="numeric"
                  value={newPrincipal}
                  onChangeText={setNewPrincipal}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Purpose / தொழில் நோக்கம்"
                  placeholderTextColor="#64748B"
                  value={newPurpose}
                  onChangeText={setNewPurpose}
                />
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsAddingLoan(false)}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveBtn} onPress={handleCreateLoan}>
                    <Text style={styles.saveBtnText}>Approve Loan</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    minHeight: '70%',
    borderWidth: 1,
    borderColor: '#334155',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    color: '#EC4899',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '800',
  },
  headerSub: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    backgroundColor: '#1E293B',
    borderRadius: 16,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  tabBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#1E293B',
  },
  tabBtnActive: {
    backgroundColor: '#EC4899',
  },
  tabBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  statCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  statValue: {
    color: '#00D084',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#0F172A',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#00D084',
    borderRadius: 3,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#1E293B',
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  quickActionText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '700',
  },
  sectionHeading: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 6,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '800',
  },
  memberName: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
  roleBadge: {
    color: '#EC4899',
    fontSize: 10,
    fontWeight: '700',
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  memberSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  paymentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  paymentPillPaid: {
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 208, 132, 0.3)',
  },
  paymentPillPending: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  paidText: {
    color: '#00D084',
    fontSize: 11,
    fontWeight: '700',
  },
  pendingText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '700',
  },
  addLoanTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#1E293B',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EC4899',
    borderStyle: 'dashed',
  },
  addLoanTriggerText: {
    color: '#EC4899',
    fontSize: 12,
    fontWeight: '700',
  },
  loanCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  loanBorrower: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '800',
  },
  loanBadge: {
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  loanBadgeText: {
    color: '#00D084',
    fontSize: 10,
    fontWeight: '800',
  },
  loanPurpose: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  loanDivider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 8,
  },
  loanStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  loanStatKey: {
    color: '#64748B',
    fontSize: 10,
  },
  loanStatVal: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 1,
  },
  summaryBreakdownCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  breakdownTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    color: '#94A3B8',
    fontSize: 12,
  },
  breakdownVal: {
    fontSize: 13,
    fontWeight: '800',
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00D084',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 4,
  },
  exportBtnText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
  },
  innerModalOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  innerModalContent: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    gap: 12,
    borderWidth: 1,
    borderColor: '#EC4899',
  },
  innerModalTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 10,
    color: '#F8FAFC',
    fontSize: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#334155',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#EC4899',
    borderRadius: 8,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
