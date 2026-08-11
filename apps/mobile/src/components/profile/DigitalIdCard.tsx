import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { CheckCircle, Copy } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { colors, spacing, radius, fontSize } from '../../lib/theme';

interface DigitalIdCardProps {
  profile: any;
  isAdmin: boolean;
  phone: string;
}

export const DigitalIdCard: React.FC<DigitalIdCardProps> = ({ profile, isAdmin, phone }) => {
  const idHash = profile?.digital_id_hash || `FAGO-TN-${phone.replace(/\D/g, '')}`;
  const qrData = `https://watscrm.vercel.app/profile?id=${idHash}`;
  const fullName = profile?.full_name || 'User Name';
  const role = isAdmin ? 'Admin' : (profile?.role || 'Member');

  const handleCopyId = async () => {
    await Clipboard.setStringAsync(idHash);
    Alert.alert('Copied!', 'Digital ID copied to clipboard');
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>FAGO DIGITAL ID</Text>
          <Text style={styles.subtitle}>Official Tamil Nadu Pass</Text>
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

        <TouchableOpacity style={styles.copyButton} onPress={handleCopyId}>
          <Copy color={colors.text} size={16} />
          <Text style={styles.copyText}>Copy ID</Text>
        </TouchableOpacity>
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
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    gap: spacing.xs,
  },
  copyText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});
