import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Share } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { CheckCircle, Copy, Share2 } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { colors, spacing, radius, fontSize } from '../../lib/theme';
import { ENV } from '../../config/env';

interface DigitalIdCardProps {
  profile: any;
  isAdmin: boolean;
  phone: string;
}

export const DigitalIdCard: React.FC<DigitalIdCardProps> = ({ profile, isAdmin, phone }) => {
  const idHash = profile?.digital_id_hash || `SUPRO-${phone.replace(/\D/g, '')}`;
  const userId = profile?.id || idHash;
  const qrData = `${ENV.CRM_URL}/profile?id=${userId}`;
  const fullName = profile?.full_name || 'User Name';
  const role = isAdmin ? 'Admin' : (profile?.role || 'Member');

  const handleCopyId = async () => {
    await Clipboard.setStringAsync(userId);
    Alert.alert('Copied!', 'Digital ID copied to clipboard');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out my SuprO Digital ID: ${qrData}`,
        title: 'SuprO Digital ID'
      });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.primary, shadowColor: colors.primary }]}>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.title, { color: colors.primary }]}>SuprO DIGITAL ID</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>SuprO Ecosystem Pass</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: colors.emerald }]}>
          <CheckCircle color={colors.text} size={14} />
          <Text style={[styles.badgeText, { color: colors.text }]}>VERIFIED</Text>
        </View>
      </View>

      <View style={styles.centerContainer}>
        <View style={styles.qrWrapper}>
          <QRCode value={qrData} size={180} backgroundColor="#FFFFFF" />
        </View>
        <Text style={[styles.userName, { color: colors.text }]}>{fullName}</Text>
        <Text style={[styles.role, { color: colors.primary }]}>{role}</Text>
        <Text style={[styles.phone, { color: colors.textSecondary }]}>{phone}</Text>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.border }]} onPress={handleCopyId}>
            <Copy color={colors.text} size={16} />
            <Text style={[styles.actionText, { color: colors.text }]}>Copy ID</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.shareButton, { backgroundColor: colors.border }, { backgroundColor: colors.primary }]} onPress={handleShare}>
            <Share2 color={colors.text} size={16} />
            <Text style={[styles.actionText, { color: colors.text }]}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.xxl,
    padding: spacing.xl,
    marginVertical: spacing.md,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: fontSize.xs,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.xl,
    gap: 4,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: 'bold',
  },
  centerContainer: {
    alignItems: 'center',
  },
  qrWrapper: {
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
  },
  userName: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  role: {
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  phone: {
    fontSize: fontSize.sm,
    marginBottom: spacing.lg,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    gap: spacing.xs,
    flex: 1,
    justifyContent: 'center',
  },
  shareButton: {
  },
  actionText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});
