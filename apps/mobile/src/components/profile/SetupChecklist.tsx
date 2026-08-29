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

import { Alert, TouchableOpacity } from 'react-native';

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
    { id: 'api_key', label: 'Gemini API Key', isComplete: !!(geminiApiKey || profile?.gemini_api_key) },
    { id: 'push', label: 'Push Notifications', isComplete: !!pushToken },
    { id: 'upi', label: 'UPI ID Configured', isComplete: !!profile?.upi_id },
    { id: 'gdrive', label: 'Google Drive Storage Mapped', isComplete: !!(profile?.google_drive_connected || profile?.google_account_email) },
    { id: 'driver', label: 'Driver Profile', isComplete: !!driverProfile },
  ];

  const completedCount = checks.filter(c => c.isComplete).length;
  const progressPercent = Math.round((completedCount / checks.length) * 100);

  const handleSetupPress = (id: string) => {
    switch (id) {
      case 'gdrive':
        Alert.alert('Google Drive Setup', 'To map your Google Drive, go to the GroupO or TeachO module and tap on the Video Recording section. You will find a button to map your Google account.');
        break;
      case 'api_key':
        Alert.alert('Gemini API Setup', 'To configure your AI Assistant, go to the AI Hub tab at the bottom and enter your API key.');
        break;
      case 'driver':
        Alert.alert('Driver Profile', 'Switch your user category to Driver Partner and go to the DriveO module to complete your vehicle registration.');
        break;
      case 'upi':
        Alert.alert('UPI ID', 'You can update your UPI ID in the Account Settings page.');
        break;
      case 'name':
      case 'location':
        Alert.alert('Profile Setup', 'Please update your details in the main settings.');
        break;
      case 'push':
        Alert.alert('Push Notifications', 'Please enable Push Notifications in your phone settings for SuprO.');
        break;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Setup Checklist</Text>
        <Text style={[styles.progressText, { color: colors.primary }]}>{progressPercent}%</Text>
      </View>
      
      <View style={[styles.progressContainer, { backgroundColor: colors.inputBg }]}>
        <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
      </View>

      <View style={styles.list}>
        {checks.map((check) => (
          <TouchableOpacity 
            key={check.id} 
            style={styles.item}
            onPress={() => handleSetupPress(check.id)}
            disabled={check.isComplete}
            activeOpacity={0.7}
          >
            <View style={styles.itemLeft}>
              {check.isComplete ? (
                <CheckCircle2 size={20} color={colors.primary} />
              ) : (
                <XCircle size={20} color={colors.textSecondary} />
              )}
              <Text style={[styles.itemLabel, check.isComplete && styles.itemLabelComplete, { color: colors.textSecondary }, { color: colors.text }]}>
                {check.label}
              </Text>
            </View>
            {!check.isComplete && (
              <Text style={[styles.setupAction, { color: colors.primary }]}>Set up →</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.xl,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  progressText: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  progressContainer: {
    height: 6,
    borderRadius: 3,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
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
    fontSize: fontSize.md,
  },
  itemLabelComplete: {
  },
  setupAction: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
});
