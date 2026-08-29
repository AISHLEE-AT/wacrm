import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Users,
  Building,
  CheckCircle2,
  X,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  MapPin,
  Wallet,
  Calendar,
  ShieldCheck,
} from 'lucide-react-native';
import { AppContext } from '../../context/AppContext';
import { colors, radius, spacing } from '../../lib/theme';
import { GroupRepository, DbGroup } from '../../services/GroupRepository';

interface CreateGroupWizardModalProps {
  visible: boolean;
  onClose: () => void;
  onGroupCreated?: (group: DbGroup) => void;
}

interface NewMemberDraft {
  id: string;
  name: string;
  phone: string;
  role: string;
}

export const CreateGroupWizardModal: React.FC<CreateGroupWizardModalProps> = ({
  visible,
  onClose,
  onGroupCreated,
}) => {
  const insets = useSafeAreaInsets();
  const { user } = useContext(AppContext);

  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Basics
  const [groupCategory, setGroupCategory] = useState<'WomenSHG' | 'FarmerFPO' | 'SportsClub' | 'BusinessGroup' | 'VillageRWA' | 'YouthStudy'>('WomenSHG');
  const [categoryLabel, setCategoryLabel] = useState('மகளிர் சுய உதவிக் குழு (Mathi TNCDW)');
  const [groupName, setGroupName] = useState('');
  const [tagline, setTagline] = useState('');
  const [village, setVillage] = useState(user?.city || 'அலங்காநல்லூர் (Alanganallur)');
  const [district, setDistrict] = useState(user?.state || 'மதுரை (Madurai)');
  const [regCode, setRegCode] = useState('TNCDW-MDU-2024-8842');

  // Step 2: Financial
  const [bankName, setBankName] = useState('Canara Bank');
  const [bankAccount, setBankAccount] = useState('');
  const [ifscCode, setIfscCode] = useState('CNRB0001234');
  const [monthlySavings, setMonthlySavings] = useState('500');
  const [meetingSchedule, setMeetingSchedule] = useState('Every Month 5th & 20th');

  const handleSelectCategory = (cat: typeof groupCategory, label: string) => {
    setGroupCategory(cat);
    setCategoryLabel(label);
  };

  const handleSubmitGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Required', 'Please enter a Group Name.');
      setStep(1);
      return;
    }

    setIsSubmitting(true);
    try {
      const leaderPhone = user?.phone || '';
      const leaderName = user?.name || 'Group Leader (குழு தலைவர்)';

      if (!leaderPhone) {
        Alert.alert('Phone Required', 'உங்கள் கைபேசி எண் தேவை. Profile பகுதியில் உங்கள் எண்ணை சேர்க்கவும்.');
        setIsSubmitting(false);
        return;
      }

      const createdGroup = await GroupRepository.createGroupWithMembers({
        leaderPhone,
        leaderName,
        groupName: groupName.trim(),
        category: groupCategory,
        categoryLabel,
        tagline: tagline.trim() || 'மாதாந்திர சேமிப்பு & கூட்டமைப்பு',
        village: village.trim(),
        district: district.trim(),
        regCode: regCode.trim(),
        bankName: bankName.trim(),
        bankAccount: bankAccount.trim(),
        monthlySavings: parseFloat(monthlySavings) || 500,
        members: [],
      });

      Alert.alert(
        '🎉 Group Successfully Created!',
        `"${createdGroup.name}" is now live!\n\nYou can now add members to your group from the Admin Console inside the UI.`,
        [
          {
            text: 'Open Group Dashboard',
            onPress: () => {
              onGroupCreated?.(createdGroup);
              onClose();
            },
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Registration Notice', err.message || 'Group created locally with active offline sync.');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheetContainer, { paddingBottom: Math.max(insets.bottom, 16) + 12 }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <View style={styles.badge}>
                <Sparkles size={12} color="#EC4899" />
                <Text style={styles.badgeText}>GROUP REGISTRATION WIZARD</Text>
              </View>
              <Text style={styles.title}>புதிய குழு பதிவு (Create Group)</Text>
              <Text style={styles.subText}>Step {step} of 2 • {step === 1 ? 'அடிப்படை விவரங்கள்' : 'வங்கி & சேமிப்பு'}</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Step Progress Bar */}
          <View style={styles.progressRow}>
            <View style={[styles.progressDot, step >= 1 && styles.progressDotActive]} />
            <View style={[styles.progressLine, { width: 64 }, step >= 2 && styles.progressLineActive]} />
            <View style={[styles.progressDot, step >= 2 && styles.progressDotActive]} />
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* ──── STEP 1: GROUP BASICS ──── */}
            {step === 1 && (
              <View style={{ gap: 12 }}>
                <Text style={styles.sectionLabel}>குழு வகை தேர்வு (Select Category):</Text>
                <View style={styles.categoryGrid}>
                  <TouchableOpacity
                    style={[styles.catCard, groupCategory === 'WomenSHG' && styles.catCardActive]}
                    onPress={() => handleSelectCategory('WomenSHG', 'மகளிர் சுய உதவிக் குழு (Mathi TNCDW)')}
                  >
                    <Text style={styles.catCardTitle}>👩‍🦰 மகளிர் குழு</Text>
                    <Text style={styles.catCardSub}>Women SHG (Mathi)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.catCard, groupCategory === 'FarmerFPO' && styles.catCardActive]}
                    onPress={() => handleSelectCategory('FarmerFPO', 'உழவர் உற்பத்தியாளர் சங்கம் (Agri FPO)')}
                  >
                    <Text style={styles.catCardTitle}>🌾 உழவர் சங்கம்</Text>
                    <Text style={styles.catCardSub}>Farmer FPO / Agri</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.catCard, groupCategory === 'SportsClub' && styles.catCardActive]}
                    onPress={() => handleSelectCategory('SportsClub', 'விளையாட்டு & இளைஞர் நல சங்கம்')}
                  >
                    <Text style={styles.catCardTitle}>🏆 விளையாட்டு</Text>
                    <Text style={styles.catCardSub}>Sports Club & Team</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.catCard, groupCategory === 'BusinessGroup' && styles.catCardActive]}
                    onPress={() => handleSelectCategory('BusinessGroup', 'வணிகர் & சிறுதொழில் கூட்டமைப்பு')}
                  >
                    <Text style={styles.catCardTitle}>🛍️ வணிகர் சங்கம்</Text>
                    <Text style={styles.catCardSub}>Merchant Network</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.catCard, groupCategory === 'VillageRWA' && styles.catCardActive]}
                    onPress={() => handleSelectCategory('VillageRWA', 'கிராம நலச் சங்கம் & குடியிருப்போர சங்கம்')}
                  >
                    <Text style={styles.catCardTitle}>🏘️ கிராம நலச் சங்கம்</Text>
                    <Text style={styles.catCardSub}>Village RWA / Civic</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.catCard, groupCategory === 'YouthStudy' && styles.catCardActive]}
                    onPress={() => handleSelectCategory('YouthStudy', 'மாணவர் கல்வி & போட்டித் தேர்வு வட்டம்')}
                  >
                    <Text style={styles.catCardTitle}>🎓 கல்வி வட்டம்</Text>
                    <Text style={styles.catCardSub}>Youth Study Circle</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.inputBox}>
                  <Text style={styles.inputLabel}>குழுவின் பெயர் (Group Name) *:</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="எ.கா: தாமரை மகளிர் சுய உதவிக் குழு"
                    placeholderTextColor="#64748B"
                    value={groupName}
                    onChangeText={setGroupName}
                  />
                </View>

                <View style={styles.inputBox}>
                  <Text style={styles.inputLabel}>குழுவின் நோக்கம் / தொழில் (Tagline):</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="எ.கா: மாதாந்திர சேமிப்பு, தையல் & சிறுதொழில்"
                    placeholderTextColor="#64748B"
                    value={tagline}
                    onChangeText={setTagline}
                  />
                </View>

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={[styles.inputBox, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>கிராமம் / ஊர் (Village):</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="அலங்காநல்லூர்"
                      placeholderTextColor="#64748B"
                      value={village}
                      onChangeText={setVillage}
                    />
                  </View>
                  <View style={[styles.inputBox, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>மாவட்டம் (District):</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="மதுரை"
                      placeholderTextColor="#64748B"
                      value={district}
                      onChangeText={setDistrict}
                    />
                  </View>
                </View>

                <View style={styles.inputBox}>
                  <Text style={styles.inputLabel}>அரசு பதிவு எண் (Govt Registration Code):</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="TNCDW-MDU-2024-8842"
                    placeholderTextColor="#64748B"
                    value={regCode}
                    onChangeText={setRegCode}
                  />
                </View>
              </View>
            )}

            {/* ──── STEP 2: BANKING & SAVINGS ──── */}
            {step === 2 && (
              <View style={{ gap: 12 }}>
                <View style={styles.inputBox}>
                  <Text style={styles.inputLabel}>வங்கி பெயர் (Bank Name) *:</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Canara Bank / SBI / Indian Bank"
                    placeholderTextColor="#64748B"
                    value={bankName}
                    onChangeText={setBankName}
                  />
                </View>

                <View style={styles.inputBox}>
                  <Text style={styles.inputLabel}>வங்கி கணக்கு எண் (Bank Account No):</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="123456789012"
                    placeholderTextColor="#64748B"
                    value={bankAccount}
                    onChangeText={setBankAccount}
                  />
                </View>

                <View style={styles.inputBox}>
                  <Text style={styles.inputLabel}>மாதாந்திர சேமிப்பு தொகை (Monthly Savings / Member) ₹:</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="500"
                    placeholderTextColor="#64748B"
                    keyboardType="numeric"
                    value={monthlySavings}
                    onChangeText={setMonthlySavings}
                  />
                </View>

                <View style={styles.inputBox}>
                  <Text style={styles.inputLabel}>கூட்டம் நடைபெறும் நாட்கள் (Meeting Schedule):</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Every Month 5th & 20th"
                    placeholderTextColor="#64748B"
                    value={meetingSchedule}
                    onChangeText={setMeetingSchedule}
                  />
                </View>
              </View>
            )}
          </ScrollView>

          {/* Navigation Footer Buttons */}
          <View style={styles.footerRow}>
            {step > 1 ? (
              <TouchableOpacity style={styles.prevBtn} onPress={() => setStep((s) => (s - 1) as any)}>
                <ArrowLeft size={16} color="#F8FAFC" />
                <Text style={styles.prevBtnText}>Back</Text>
              </TouchableOpacity>
            ) : <View style={{ flex: 1 }} />}

            {step < 2 ? (
              <TouchableOpacity
                style={styles.nextBtn}
                onPress={() => {
                  if (step === 1 && !groupName.trim()) {
                    Alert.alert('Required', 'Please enter a Group Name to continue.');
                    return;
                  }
                  setStep((s) => (s + 1) as any);
                }}
              >
                <Text style={styles.nextBtnText}>Next Step ➡️</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]}
                onPress={handleSubmitGroup}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#0F172A" />
                ) : (
                  <>
                    <CheckCircle2 size={16} color="#0F172A" />
                    <Text style={styles.submitBtnText}>Create Group 🚀</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  badge: {
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
  badgeText: {
    color: '#EC4899',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
  },
  subText: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    backgroundColor: '#1E293B',
    borderRadius: 16,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#334155',
  },
  progressDotActive: {
    backgroundColor: '#EC4899',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: '#334155',
  },
  progressLineActive: {
    backgroundColor: '#EC4899',
  },
  scrollBody: {
    maxHeight: 440,
  },
  sectionLabel: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catCard: {
    width: '48%',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  catCardActive: {
    borderColor: '#EC4899',
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
  },
  catCardTitle: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '700',
  },
  catCardSub: {
    color: '#94A3B8',
    fontSize: 9,
    marginTop: 2,
  },
  inputBox: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 4,
  },
  inputLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  input: {
    color: '#F8FAFC',
    fontSize: 13,
    paddingVertical: 2,
  },
  addMemberBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  addMemberBtnText: {
    color: '#00D084',
    fontSize: 11,
    fontWeight: '700',
  },
  infoCallout: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    color: '#93C5FD',
    fontSize: 11,
    lineHeight: 16,
  },
  memberCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 6,
  },
  memberCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberIndex: {
    color: '#EC4899',
    fontSize: 11,
    fontWeight: '800',
  },
  inputMiniLabel: {
    color: '#94A3B8',
    fontSize: 10,
    marginBottom: 2,
  },
  miniInput: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 6,
    color: '#F8FAFC',
    fontSize: 11,
  },
  roleChipsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  roleChip: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  roleChipActive: {
    borderColor: '#EC4899',
    backgroundColor: '#EC4899',
  },
  roleChipText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
  },
  roleChipTextActive: {
    color: '#FFFFFF',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingTop: 12,
  },
  prevBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1E293B',
    borderRadius: 12,
  },
  prevBtnText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
  },
  nextBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EC4899',
    paddingVertical: 12,
    borderRadius: 12,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  submitBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#00D084',
    paddingVertical: 12,
    borderRadius: 12,
  },
  submitBtnText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
  },
});
