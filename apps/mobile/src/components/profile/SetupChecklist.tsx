import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle2, XCircle } from 'lucide-react-native';
import { colors, spacing, radius, fontSize } from '../../lib/theme';
import { LocationContext } from '../../context/LocationContext';

interface SetupChecklistProps {
  profile: any;
  driverProfile: any | null;
  geminiApiKey: string;
  pushToken: string | null;
}

export function SetupChecklist({
  profile,
  driverProfile,
  geminiApiKey,
  pushToken
}: SetupChecklistProps) {
  const locationCtx = useContext(LocationContext);
  const checks = [
    { id: 'account', label: 'Account Created', isComplete: true },
    { id: 'name', label: 'Full Name Set', isComplete: !!(profile?.full_name && profile.full_name.trim() !== '') },
    { id: 'location', label: 'Location Set', isComplete: !!(profile?.location || (locationCtx.latitude !== null && !locationCtx.error)) },
    { id: 'api_key', label: 'Gemini API Key', isComplete: !!geminiApiKey },
    { id: 'push', label: 'Push Notifications', isComplete: !!pushToken },
    { id: 'upi', label: 'UPI ID Configured', isComplete: !!profile?.upi_id },
    { id: 'driver', label: 'Driver Profile', isComplete: !!driverProfile },
  ];

  const completedCount = checks.filter(c => c.isComplete).length;
  const progressPercent = Math.round((completedCount / checks.length) * 100);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Setup Checklist</Text>
        <Text style={styles.progressText}>{progressPercent}%</Text>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
      </View>

      <View style={styles.list}>
        {checks.map((check) => (
          <View key={check.id} style={styles.item}>
            <View style={styles.itemLeft}>
              {check.isComplete ? (
                <CheckCircle2 size={20} color={colors.primary} />
              ) : (
                <XCircle size={20} color={colors.textSecondary} />
              )}
              <Text style={[styles.itemLabel, check.isComplete && styles.itemLabelComplete]}>
                {check.label}
              </Text>
            </View>
            {!check.isComplete && (
              <Text style={styles.setupAction}>Set up →</Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.lg,
    color: colors.text,
    fontWeight: '600',
  },
  progressText: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '600',
  },
  progressContainer: {
    height: 6,
    backgroundColor: colors.inputBg,
    borderRadius: 3,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  list: {
    gap: spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemLabel: {
    marginLeft: spacing.sm,
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  itemLabelComplete: {
    color: colors.text,
  },
  setupAction: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
});
