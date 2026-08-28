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
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Plus,
  Share2,
  Sparkles,
  BookOpen,
  Calendar,
  MapPin,
  Vote,
  Printer,
} from 'lucide-react-native';
import { GroupMember } from './GroupSavingsLedgerModal';
import { GroupAiAssistantModal } from './GroupAiAssistantModal';
import { GroupAiService } from '../../services/GroupAiService';

export interface MeetingResolution {
  id: string;
  resolutionNumber: number;
  title: string;
  description: string;
  proposer: string;
  passedVotes: number;
  totalVotes: number;
  status: 'Passed' | 'Proposed' | 'Under Review';
}

interface GroupMeetingNotesModalProps {
  visible: boolean;
  onClose: () => void;
  groupName: string;
  meetingNumber?: number;
  members: GroupMember[];
}

export const GroupMeetingNotesModal: React.FC<GroupMeetingNotesModalProps> = ({
  visible,
  onClose,
  groupName,
  meetingNumber = 24,
  members: initialMembers,
}) => {
  const insets = useSafeAreaInsets();
  const [meetingDate, setMeetingDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [meetingVenue, setMeetingVenue] = useState<string>('Panchayat Community Hall / கிராம பஞ்சாயத்து அரங்கம்');
  const [agenda, setAgenda] = useState<string>(
    '1. Monthly savings collection & audit\n2. Internal loan application review\n3. Bank linkage subsidy scheme\n4. Festival stall planning'
  );
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Attendance state: memberId -> 'Present' | 'Absent' | 'Leave'
  const [attendance, setAttendance] = useState<Record<string, 'Present' | 'Absent' | 'Leave'>>(() => {
    const map: Record<string, 'Present' | 'Absent' | 'Leave'> = {};
    initialMembers.forEach((m) => {
      map[m.id] = 'Present';
    });
    return map;
  });

  // Resolutions state
  const [resolutions, setResolutions] = useState<MeetingResolution[]>([
    {
      id: 'res-1',
      resolutionNumber: 1,
      title: 'Internal Loan Sanction for S. Lakshmi (உள் கடன் ஒப்புதல்)',
      description: 'Approved internal micro-loan of ₹25,000 at 1.5% monthly interest for purchase of tailoring machine. Repayment over 10 equal installments.',
      proposer: 'K. Meenakshi (President)',
      passedVotes: initialMembers.length,
      totalVotes: initialMembers.length,
      status: 'Passed',
    },
    {
      id: 'res-2',
      resolutionNumber: 2,
      title: 'Canara Bank SHG Direct Linkage Loan (வங்கி நேரடி கடன் விண்ணப்பம்)',
      description: 'Authorized President and Secretary to submit application for ₹5,00,000 subsidized bank loan under TNCDW Mahalir Thittam.',
      proposer: 'M. Anandhi (Secretary)',
      passedVotes: initialMembers.length - 1,
      totalVotes: initialMembers.length,
      status: 'Passed',
    },
  ]);

  // New Resolution Form Modal
  const [isAddingRes, setIsAddingRes] = useState(false);
  const [newResTitle, setNewResTitle] = useState('');
  const [newResDesc, setNewResDesc] = useState('');
  const [newResProposer, setNewResProposer] = useState(initialMembers[0]?.name || 'Leader');

  const toggleAttendance = (memberId: string) => {
    setAttendance((prev) => {
      const curr = prev[memberId] || 'Present';
      const next = curr === 'Present' ? 'Absent' : curr === 'Absent' ? 'Leave' : 'Present';
      return { ...prev, [memberId]: next };
    });
  };

  const handleAddResolution = () => {
    if (!newResTitle.trim() || !newResDesc.trim()) {
      Alert.alert('Incomplete Resolution', 'Please fill in resolution title and description.');
      return;
    }

    const newRes: MeetingResolution = {
      id: `res-${Date.now()}`,
      resolutionNumber: resolutions.length + 1,
      title: newResTitle.trim(),
      description: newResDesc.trim(),
      proposer: newResProposer.trim(),
      passedVotes: initialMembers.length,
      totalVotes: initialMembers.length,
      status: 'Passed',
    };

    setResolutions([...resolutions, newRes]);
    setIsAddingRes(false);
    setNewResTitle('');
    setNewResDesc('');
    Alert.alert('✅ Resolution Added', `Resolution #${newRes.resolutionNumber} logged into Group Resolution Book.`);
  };

  const presentCount = Object.values(attendance).filter((v) => v === 'Present').length;
  const quorumPercent = Math.round((presentCount / (initialMembers.length || 1)) * 100);

  const handleShareMinutes = () => {
    const resSummary = resolutions
      .map((r) => `📌 *Resolution #${r.resolutionNumber}:* ${r.title}\n_${r.description}_\n(Votes: ${r.passedVotes}/${r.totalVotes} - ${r.status})\n`)
      .join('\n');

    const msg = `📖 *${groupName} — Meeting Minutes #${meetingNumber}* 📝\n\n` +
      `📅 *Date:* ${meetingDate}\n` +
      `📍 *Venue:* ${meetingVenue}\n` +
      `👥 *Attendance:* ${presentCount}/${initialMembers.length} Present (${quorumPercent}% Quorum)\n\n` +
      `📋 *Agenda:*\n${agenda}\n\n` +
      `📜 *Key Resolutions Passed (தீர்மானங்கள்):*\n${resSummary}\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `Recorded & Verified in SuprO GroupO Digital Resolution Register ✨`;

    Share.share({ message: msg });
  };

  const handleExportMinutesPdf = async () => {
    setIsExportingPdf(true);
    try {
      const resSummary = resolutions
        .map(
          (r) =>
            `### தீர்மானம் எண் ${r.resolutionNumber}: ${r.title}\n\n${r.description}\n\n**வாக்கு விவரம்:** ${r.passedVotes}/${r.totalVotes} ஆதரவு (${r.status}) • முன்மொழிந்தவர்: ${r.proposer}`
        )
        .join('\n\n');

      const fullContent = `
## கூட்ட நிகழ்வு விவரம் (Meeting Proceedings)
- **கூட்ட எண் (Meeting No):** #${meetingNumber}
- **நடைபெற்ற இடம் (Venue):** ${meetingVenue}
- **வருகை விவரம் (Attendance):** ${presentCount} / ${initialMembers.length} (${quorumPercent}% Quorum)

## கூட்ட நிகழ்ச்சி நிரல் (Meeting Agenda)
${agenda}

## நிறைவேற்றப்பட்ட தீர்மானங்கள் (Approved Resolutions)
${resSummary}
`;

      await GroupAiService.generateAndShareGroupPdf({
        title: `${groupName} — Meeting #${meetingNumber} Minutes`,
        docType: 'MeetingMinutes',
        groupName,
        date: meetingDate,
        content: fullContent,
        members: initialMembers.map((m) => m.name),
      });
    } catch (err: any) {
      Alert.alert('PDF Export Error', err.message || 'Could not export minutes PDF.');
    } finally {
      setIsExportingPdf(false);
    }
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
                  <BookOpen size={12} color="#38BDF8" />
                  <Text style={styles.badgeText}>MEETING MINUTES & RESOLUTIONS</Text>
                </View>
              </View>
              <Text style={styles.headerTitle} numberOfLines={1}>{groupName}</Text>
              <Text style={styles.headerSub}>கூட்ட குறிப்புகள் & தீர்மான புத்தகம் (Meeting #{meetingNumber})</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* 1. Meeting Overview Card */}
            <View style={styles.card}>
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Calendar size={14} color="#38BDF8" />
                  <Text style={styles.metaText}>{meetingDate}</Text>
                </View>
                <View style={[styles.metaItem, { flex: 1, justifyContent: 'flex-end' }]}>
                  <MapPin size={14} color="#00D084" />
                  <Text style={styles.metaText} numberOfLines={1}>{meetingVenue}</Text>
                </View>
              </View>

              <View style={styles.quorumCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.quorumLabel}>Member Attendance Quorum</Text>
                  <Text style={styles.quorumValue}>
                    {presentCount} / {initialMembers.length} Present ({quorumPercent}%)
                  </Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${quorumPercent}%` }]} />
                </View>
              </View>
            </View>

            {/* 2. Attendance Register (வருகைப் பதிவு) */}
            <Text style={styles.sectionHeading}>Member Attendance Register (வருகைப் பதிவு)</Text>
            <View style={styles.attendanceGrid}>
              {initialMembers.map((m) => {
                const status = attendance[m.id] || 'Present';
                return (
                  <TouchableOpacity
                    key={m.id}
                    style={[
                      styles.attendanceChip,
                      status === 'Present' && styles.attendanceChipPresent,
                      status === 'Absent' && styles.attendanceChipAbsent,
                      status === 'Leave' && styles.attendanceChipLeave,
                    ]}
                    onPress={() => toggleAttendance(m.id)}
                    activeOpacity={0.7}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      {status === 'Present' && <CheckCircle2 size={12} color="#00D084" />}
                      {status === 'Absent' && <XCircle size={12} color="#EF4444" />}
                      {status === 'Leave' && <Clock size={12} color="#F59E0B" />}
                      <Text style={styles.chipName} numberOfLines={1}>{m.name.split(' ')[0]}</Text>
                    </View>
                    <Text style={[styles.chipStatus, {
                      color: status === 'Present' ? '#00D084' : status === 'Absent' ? '#EF4444' : '#F59E0B'
                    }]}>
                      {status}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 3. Meeting Agenda */}
            <View style={styles.card}>
              <Text style={styles.cardHeading}>Meeting Agenda & Notes (நிகழ்ச்சி நிரல்)</Text>
              <TextInput
                style={styles.agendaInput}
                multiline
                numberOfLines={3}
                value={agenda}
                onChangeText={setAgenda}
                placeholder="Enter meeting agenda items..."
                placeholderTextColor="#64748B"
              />
            </View>

            {/* 4. Resolutions Book (தீர்மானங்கள்) */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
              <Text style={styles.sectionHeading}>Official Resolutions Passed (தீர்மானங்கள்)</Text>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <TouchableOpacity
                  style={[styles.addResBtn, { backgroundColor: 'rgba(236, 72, 153, 0.15)', borderColor: '#EC4899' }]}
                  onPress={() => setIsAiModalOpen(true)}
                >
                  <Sparkles size={13} color="#EC4899" />
                  <Text style={[styles.addResBtnText, { color: '#EC4899' }]}>AI Drafter</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.addResBtn}
                  onPress={() => setIsAddingRes(true)}
                >
                  <Plus size={14} color="#38BDF8" />
                  <Text style={styles.addResBtnText}>+ Add</Text>
                </TouchableOpacity>
              </View>
            </View>

            {resolutions.map((res) => (
              <View key={res.id} style={styles.resolutionCard}>
                <View style={styles.resHeaderRow}>
                  <View style={styles.resBadge}>
                    <Text style={styles.resBadgeText}>RESOLVED #{res.resolutionNumber}</Text>
                  </View>
                  <View style={styles.passedPill}>
                    <Vote size={11} color="#00D084" />
                    <Text style={styles.passedPillText}>{res.passedVotes}/{res.totalVotes} Votes</Text>
                  </View>
                </View>
                <Text style={styles.resTitle}>{res.title}</Text>
                <Text style={styles.resDesc}>{res.description}</Text>
                <View style={styles.resFooterRow}>
                  <Text style={styles.resProposer}>Proposed by: {res.proposer}</Text>
                  <Text style={styles.resStatus}>{res.status}</Text>
                </View>
              </View>
            ))}

            {/* Action Bar: PDF Export & Share Minutes */}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
              <TouchableOpacity
                style={[styles.shareBtn, { flex: 1, backgroundColor: '#EC4899' }]}
                onPress={handleExportMinutesPdf}
                disabled={isExportingPdf}
              >
                <Printer size={16} color="#FFFFFF" />
                <Text style={[styles.shareBtnText, { color: '#FFFFFF' }]}>Export PDF 📄</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.shareBtn, { flex: 1.2 }]} onPress={handleShareMinutes}>
                <Share2 size={16} color="#0F172A" />
                <Text style={styles.shareBtnText}>WhatsApp Minutes 📲</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* New Resolution Modal Sheet */}
          {isAddingRes && (
            <View style={styles.innerModalOverlay}>
              <View style={styles.innerModalContent}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.innerModalTitle}>Log Group Resolution (புதிய தீர்மானம்)</Text>
                  <TouchableOpacity
                    style={[styles.addResBtn, { backgroundColor: 'rgba(236, 72, 153, 0.15)', borderColor: '#EC4899', paddingVertical: 4 }]}
                    onPress={() => {
                      setIsAddingRes(false);
                      setIsAiModalOpen(true);
                    }}
                  >
                    <Sparkles size={12} color="#EC4899" />
                    <Text style={[styles.addResBtnText, { color: '#EC4899', fontSize: 10 }]}>AI Voice Draft</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Resolution Title / தீர்மான தலைப்பு"
                  placeholderTextColor="#64748B"
                  value={newResTitle}
                  onChangeText={setNewResTitle}
                />
                <TextInput
                  style={[styles.input, { minHeight: 70, textAlignVertical: 'top' }]}
                  placeholder="Resolution Details / முழு விவரங்கள்"
                  placeholderTextColor="#64748B"
                  multiline
                  value={newResDesc}
                  onChangeText={setNewResDesc}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Proposed by Member Name"
                  placeholderTextColor="#64748B"
                  value={newResProposer}
                  onChangeText={setNewResProposer}
                />
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsAddingRes(false)}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveBtn} onPress={handleAddResolution}>
                    <Text style={styles.saveBtnText}>Save Resolution</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Embedded AI Assistant Modal */}
          <GroupAiAssistantModal
            visible={isAiModalOpen}
            onClose={() => setIsAiModalOpen(false)}
            groupName={groupName}
            onApplyResolution={(aiText) => {
              const lines = aiText.split('\n').filter(Boolean);
              const title = lines[0]?.replace(/^[#*]+\s*/, '').slice(0, 60) || 'AI Drafted Resolution';
              const newRes: MeetingResolution = {
                id: `res-ai-${Date.now()}`,
                resolutionNumber: resolutions.length + 1,
                title,
                description: aiText,
                proposer: 'AI Assistant & President',
                passedVotes: initialMembers.length,
                totalVotes: initialMembers.length,
                status: 'Passed',
              };
              setResolutions([...resolutions, newRes]);
            }}
          />
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
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    color: '#38BDF8',
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
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 12,
    gap: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
  },
  quorumCard: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 10,
    gap: 6,
  },
  quorumLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  quorumValue: {
    color: '#00D084',
    fontSize: 11,
    fontWeight: '800',
  },
  progressBarBg: {
    height: 5,
    backgroundColor: '#1E293B',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#00D084',
    borderRadius: 3,
  },
  sectionHeading: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  attendanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  attendanceChip: {
    width: '31%',
    backgroundColor: '#1E293B',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  attendanceChipPresent: {
    borderColor: 'rgba(0, 208, 132, 0.4)',
    backgroundColor: 'rgba(0, 208, 132, 0.1)',
  },
  attendanceChipAbsent: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  attendanceChipLeave: {
    borderColor: 'rgba(245, 158, 11, 0.4)',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  chipName: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '700',
  },
  chipStatus: {
    fontSize: 9,
    fontWeight: '800',
    marginTop: 2,
  },
  cardHeading: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
  agendaInput: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 10,
    color: '#F8FAFC',
    fontSize: 12,
    borderWidth: 1,
    borderColor: '#334155',
    lineHeight: 18,
  },
  addResBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#1E293B',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  addResBtnText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
  },
  resolutionCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 10,
    gap: 6,
  },
  resHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  resBadgeText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '800',
  },
  passedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  passedPillText: {
    color: '#00D084',
    fontSize: 10,
    fontWeight: '800',
  },
  resTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
  resDesc: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 16,
  },
  resFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 6,
  },
  resProposer: {
    color: '#64748B',
    fontSize: 10,
  },
  resStatus: {
    color: '#00D084',
    fontSize: 10,
    fontWeight: '800',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00D084',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 20,
  },
  shareBtnText: {
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
    borderColor: '#38BDF8',
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
    backgroundColor: '#38BDF8',
    borderRadius: 8,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '800',
  },
});
