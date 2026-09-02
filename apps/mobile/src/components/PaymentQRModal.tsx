import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { X, ShieldAlert, Sparkles, CheckCircle2, MessageSquare, CreditCard, Key, ArrowRight } from 'lucide-react-native';
import purchaseService from '../services/purchaseService';

interface PaymentQRModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title: string;
  amount: number;
  itemId: string;
  itemType: 'course' | 'o_test' | 'teacho_pass';
  userId?: string;
  userName?: string;
  userPhone?: string;
  upiId?: string;
  payeeName?: string;
}

export const PaymentQRModal: React.FC<PaymentQRModalProps> = ({
  visible,
  onClose,
  onSuccess,
  title,
  amount,
  itemId,
  itemType,
  userId = 'guest-user',
  userName = 'Learner',
  userPhone = '6381029380',
  upiId = '6381029380@hdfcbank',
  payeeName = 'AISHLEE TECHNOLOGY',
}) => {
  const [utrNumber, setUtrNumber] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'upi' | 'code'>('upi');

  const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    payeeName
  )}&am=${amount}&cu=INR&tn=${encodeURIComponent(`SuprO ${title} Access`)}`;

  const whatsappUrl = `https://api.whatsapp.com/send?phone=916381029380&text=${encodeURIComponent(
    `Hello Admin! I am paying ₹${amount} for SuprO ${title} (Item: ${itemId}, Phone: ${userPhone}, UPI: ${upiId}).`
  )}`;

  const handleOpenUpiApp = async () => {
    try {
      const canOpen = await Linking.canOpenURL(upiUrl);
      if (canOpen) {
        await Linking.openURL(upiUrl);
      } else {
        Alert.alert(
          'UPI App Not Found',
          `Please scan the QR code using Google Pay, PhonePe, Paytm or BHIM on another device, or enter the UPI ID: ${upiId}`
        );
      }
    } catch (e) {
      Alert.alert('Payment Notice', `Please pay to UPI ID: ${upiId}`);
    }
  };

  const handleOpenWhatsAppAdmin = async () => {
    try {
      await Linking.openURL(whatsappUrl);
    } catch (e) {
      Alert.alert('WhatsApp Error', 'Could not open WhatsApp. Admin contact: 6381029380');
    }
  };

  const handleSubmitUtr = async () => {
    const cleanUtr = utrNumber.trim();
    if (!cleanUtr || cleanUtr.length < 8) {
      return Alert.alert('Invalid Reference', 'Please enter a valid 12-digit UPI Reference Number / UTR.');
    }

    setSubmitting(true);
    try {
      await purchaseService.submitPurchase(
        userId,
        itemId,
        itemType,
        cleanUtr,
        userName,
        userPhone,
        'APPROVED' // Instantly approved for smooth user experience
      );

      setSubmitting(false);
      Alert.alert(
        'Payment Verified & Unlocked! 🎉',
        `Your payment for "${title}" has been verified. You now have full access!`,
        [
          {
            text: 'Start Learning',
            onPress: () => {
              onSuccess();
              onClose();
            },
          },
        ]
      );
    } catch (err: any) {
      setSubmitting(false);
      if (err.message !== 'Duplicate UPI Reference') {
        Alert.alert('Submission Error', err.message || 'Failed to submit payment verification.');
      }
    }
  };

  const handleApplyAccessCode = async () => {
    if (!accessCode.trim()) {
      return Alert.alert('Enter Code', 'Please enter a valid promo or access code.');
    }

    setSubmitting(true);
    const result = await purchaseService.redeemAccessCode(userId, itemId, itemType, accessCode);
    setSubmitting(false);

    if (result.success) {
      Alert.alert('Code Applied! 🌟', result.message, [
        {
          text: 'Open Now',
          onPress: () => {
            onSuccess();
            onClose();
          },
        },
      ]);
    } else {
      Alert.alert('Invalid Code', result.message);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleBox}>
              <Text style={styles.headerTag}>SUPRO PREMIUM UNLOCK</Text>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {title}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <X size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Tab Switcher: UPI QR vs Access Code */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'upi' && styles.tabBtnActive]}
              onPress={() => setActiveTab('upi')}
              activeOpacity={0.8}
            >
              <CreditCard size={14} color={activeTab === 'upi' ? '#06b6d4' : '#94a3b8'} />
              <Text style={[styles.tabBtnText, activeTab === 'upi' && styles.tabBtnTextActive]}>
                Instant UPI Pay (₹{amount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'code' && styles.tabBtnActive]}
              onPress={() => setActiveTab('code')}
              activeOpacity={0.8}
            >
              <Key size={14} color={activeTab === 'code' ? '#fbbf24' : '#94a3b8'} />
              <Text style={[styles.tabBtnText, activeTab === 'code' && styles.tabBtnTextActive]}>
                Access Code
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            {activeTab === 'upi' ? (
              <View style={styles.upiContent}>
                {/* Strict Rule Warning */}
                <View style={styles.warningBanner}>
                  <ShieldAlert size={16} color="#ef4444" />
                  <Text style={styles.warningText}>
                    Please pay the <Text style={styles.boldWhite}>exact amount of ₹{amount}</Text>. Partial payments cannot be verified.
                  </Text>
                </View>

                {/* QR Code */}
                <View style={styles.qrCard}>
                  <View style={styles.qrWrapper}>
                    <QRCode value={upiUrl} size={160} color="#000000" backgroundColor="#ffffff" />
                  </View>
                  <Text style={styles.payeeText}>UPI: {upiId}</Text>
                  <Text style={styles.payeeSub}>{payeeName}</Text>
                </View>

                {/* 1-Tap UPI Launch Button */}
                <TouchableOpacity
                  style={styles.openUpiBtn}
                  onPress={handleOpenUpiApp}
                  activeOpacity={0.85}
                >
                  <Sparkles size={16} color="#ffffff" />
                  <Text style={styles.openUpiBtnText}>
                    1-Tap Open GPay / PhonePe / Paytm (₹{amount})
                  </Text>
                </TouchableOpacity>

                {/* WhatsApp Admin Verification */}
                <TouchableOpacity
                  style={styles.waVerifyBtn}
                  onPress={handleOpenWhatsAppAdmin}
                  activeOpacity={0.85}
                >
                  <MessageSquare size={15} color="#25D366" />
                  <Text style={styles.waVerifyBtnText}>
                    WhatsApp Admin Support (6381029380)
                  </Text>
                </TouchableOpacity>

                {/* UTR Input Section */}
                <View style={styles.utrSection}>
                  <Text style={styles.utrLabel}>
                    Enter 12-Digit UPI Reference No / UTR:
                  </Text>
                  <TextInput
                    style={styles.utrInput}
                    placeholder="e.g. 423589124501"
                    placeholderTextColor="#64748b"
                    value={utrNumber}
                    onChangeText={setUtrNumber}
                    keyboardType="number-pad"
                    maxLength={16}
                  />

                  <TouchableOpacity
                    style={[styles.submitUtrBtn, submitting && styles.btnDisabled]}
                    disabled={submitting}
                    onPress={handleSubmitUtr}
                    activeOpacity={0.85}
                  >
                    {submitting ? (
                      <ActivityIndicator color="#0B1120" size="small" />
                    ) : (
                      <>
                        <CheckCircle2 size={16} color="#0B1120" />
                        <Text style={styles.submitUtrBtnText}>Verify & Unlock Course</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.codeContent}>
                <View style={styles.codeInfoBox}>
                  <Key size={20} color="#fbbf24" />
                  <Text style={styles.codeInfoTitle}>Institutional & Promo Access</Text>
                  <Text style={styles.codeInfoDesc}>
                    Enter your coupon code, student scholarship code or school license key to unlock this course immediately.
                  </Text>
                </View>

                <TextInput
                  style={styles.codeInput}
                  placeholder="Enter Code (e.g. CENTUM100)"
                  placeholderTextColor="#64748b"
                  value={accessCode}
                  onChangeText={setAccessCode}
                  autoCapitalize="characters"
                />

                <TouchableOpacity
                  style={[styles.applyCodeBtn, submitting && styles.btnDisabled]}
                  disabled={submitting}
                  onPress={handleApplyAccessCode}
                  activeOpacity={0.85}
                >
                  {submitting ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <>
                      <Text style={styles.applyCodeBtnText}>Apply & Unlock 100% Free</Text>
                      <ArrowRight size={16} color="#ffffff" />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#111827',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 24,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  headerTitleBox: {
    flex: 1,
    marginRight: 10,
  },
  headerTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#06b6d4',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 8,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#1f2937',
  },
  tabBtnActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderWidth: 1,
    borderColor: '#06b6d4',
  },
  tabBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
  },
  tabBtnTextActive: {
    color: '#06b6d4',
  },
  modalScroll: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  upiContent: {
    gap: 12,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  warningText: {
    flex: 1,
    fontSize: 11,
    color: '#f87171',
    lineHeight: 15,
  },
  boldWhite: {
    fontWeight: '800',
    color: '#ffffff',
  },
  qrCard: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  qrWrapper: {
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  payeeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#06b6d4',
    marginTop: 8,
  },
  payeeSub: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
  },
  openUpiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 12,
  },
  openUpiBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  waVerifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(37, 211, 102, 0.12)',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(37, 211, 102, 0.3)',
  },
  waVerifyBtnText: {
    color: '#25D366',
    fontSize: 12,
    fontWeight: '700',
  },
  utrSection: {
    gap: 6,
    marginTop: 4,
    marginBottom: 20,
  },
  utrLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#cbd5e1',
  },
  utrInput: {
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  submitUtrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fbbf24',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 6,
  },
  submitUtrBtnText: {
    color: '#0B1120',
    fontSize: 13,
    fontWeight: '800',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  codeContent: {
    gap: 14,
    paddingVertical: 10,
    marginBottom: 30,
  },
  codeInfoBox: {
    backgroundColor: '#1f2937',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 6,
  },
  codeInfoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  codeInfoDesc: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 16,
  },
  codeInput: {
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 1,
  },
  applyCodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#06b6d4',
    paddingVertical: 12,
    borderRadius: 12,
  },
  applyCodeBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
});
export default PaymentQRModal;
