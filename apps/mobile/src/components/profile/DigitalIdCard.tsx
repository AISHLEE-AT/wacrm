import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Share } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { CheckCircle, Copy, Share2 } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { colors, spacing, radius, fontSize } from '../../lib/theme';

interface DigitalIdCardProps {
  profile: any;
  isAdmin: boolean;
  phone: string;
}

export const DigitalIdCard: React.FC<DigitalIdCardProps> = ({ profile, isAdmin, phone }) => {
  const idHash = profile?.digital_id_hash || `SUPRO-${phone.replace(/\D/g, '')}`;
  const userId = profile?.id || idHash;
  const qrData = `https://watscrm.vercel.app/profile?id=${userId}`;
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
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>SuprO DIGITAL ID</Text>
          <Text style={styles.subtitle}>SuprO Ecosystem Pass</Text>
        </View>
        <View style={styles.badge}>
          <CheckCircle color={colors.text} size={14} />
          <Text style={styles.badgeText}>VERIFIED</Text>
        </View>
      </View>

      <View style={styles.centerContainer}>
        <View style={styles.qrWrapper}>
          <QRCode value={qrData} size={180} backgroundColor="#FFFFFF" />
        </View>
        <Text style={styles.userName}>{fullName}</Text>
        <Text style={styles.role}>{role}</Text>
        <Text style={styles.phone}>{phone}</Text>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCopyId}>
            <Copy color={colors.text} size={16} />
            <Text style={styles.actionText}>Copy ID</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.shareButton]} onPress={handleShare}>
            <Share2 color={colors.text} size={16} />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: radius.xxl,
    padding: spacing.xl,
    marginVertical: spacing.md,
    shadowColor: colors.primary,
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
    color: colors.primary,
    fontSize: fontSize.xl,
    fontWeight: 'bold',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  badge: {
    backgroundColor: colors.emerald,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.xl,
    gap: 4,
  },
  badgeText: {
    color: colors.text,
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
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  role: {
    color: colors.primary,
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  phone: {
    color: colors.textSecondary,
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
    backgroundColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    gap: spacing.xs,
    flex: 1,
    justifyContent: 'center',
  },
  shareButton: {
    backgroundColor: colors.primary,
  },
  actionText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});
