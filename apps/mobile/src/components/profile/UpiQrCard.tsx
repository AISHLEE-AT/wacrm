import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { QrCode, BadgeCheck } from 'lucide-react-native';
import { colors, spacing, radius, fontSize } from '../../lib/theme';

interface UpiQrCardProps {
  upiId: string;
  fullName: string;
  phone: string;
}

export const UpiQrCard: React.FC<UpiQrCardProps> = ({ upiId, fullName, phone }) => {
  const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);
  const actualUpiId = upiId || (cleanPhone ? `${cleanPhone}@upi` : '');
  const qrData = `upi://pay?pa=${actualUpiId}&pn=${encodeURIComponent(fullName)}`;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.primary }]}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <QrCode color={colors.primary} size={24} />
          <Text style={[styles.title, { color: colors.text }]}>Merchant & Driver UPI QR</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: colors.emerald }]}>
          <BadgeCheck color={colors.text} size={14} />
          <Text style={[styles.badgeText, { color: colors.text }]}>Verified P2P Pay</Text>
        </View>
      </View>
      
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        0-commission instant payment directly to your bank account.
      </Text>

      <View style={styles.qrContainerRow}>
        <View style={styles.qrWrapper}>
          <QRCode value={qrData} size={140} backgroundColor="#FFFFFF" />
          {actualUpiId ? (
            <Text style={[styles.upiIdBadge, { color: colors.primary }]}>{actualUpiId}</Text>
          ) : null}
        </View>
        <View style={styles.rightInfo}>
          <Text style={[styles.instantText, { color: colors.text }]}>📲 Instant Scan & Pay</Text>
          <Text style={[styles.subText, { color: colors.textMuted }]}>
            Accept payments from any UPI app including PhonePe, Google Pay, and Paytm directly to your verified account.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginVertical: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.md,
    gap: 4,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: 'bold',
  },
  description: {
    fontSize: fontSize.sm,
    marginBottom: spacing.lg,
  },
  qrContainerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  qrWrapper: {
    backgroundColor: '#FFF',
    padding: spacing.sm,
    borderRadius: radius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  rightInfo: {
    flex: 1,
  },
  instantText: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  subText: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  upiIdBadge: {
    marginTop: 6,
    fontSize: fontSize.xs,
    fontWeight: '700',
    textAlign: 'center',
  },
});
