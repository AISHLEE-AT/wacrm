import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert, Linking, Platform } from 'react-native';
import { Heart, Copy } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { colors, spacing, radius, fontSize } from '../../lib/theme';

export function SupportCard() {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const upiId = '6381029380@hdfcbank';

  const handleCopy = async () => {
    await Clipboard.setStringAsync(upiId);
    Alert.alert('Copied to Clipboard', `UPI ID: ${upiId}\nYou can paste it in Google Pay, PhonePe, or Paytm.`);
  };

  const handleContribute = async () => {
    const url = `upi://pay?pa=${upiId}&pn=Aishlee%20Technology&tn=SuprO%20Good%20Cause%20Contribution&cu=INR`;
    try {
      // Try opening directly
      await Linking.openURL(url);
    } catch (error) {
      // Fallback if no UPI app responds: Copy to clipboard and inform user
      await Clipboard.setStringAsync(upiId);
      Alert.alert(
        'UPI ID Copied to Clipboard',
        `UPI ID: ${upiId}\n\nPlease paste it in Google Pay, PhonePe, or Paytm to complete your contribution.`,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.bgGradients}>
        <View style={[styles.gradientBlob, { backgroundColor: 'rgba(244, 63, 94, 0.15)', top: -20, left: -20 }]} />
        <View style={[styles.gradientBlob, { backgroundColor: 'rgba(168, 85, 247, 0.15)', bottom: -20, right: -20 }]} />
        <View style={[styles.gradientBlob, { backgroundColor: 'rgba(6, 182, 212, 0.1)', top: 20, right: 20 }]} />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Heart size={24} color={colors.destructive} fill={colors.destructive} />
          </Animated.View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Community Support</Text>
          </View>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>Support SuprO Good Cause</Text>
        <Text style={styles.subtitle}>Empowering Farmers, Drivers, Tutors & Local Buyers with 0% Commission</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          SuprO is building a community-first ecosystem where local creators and providers keep 100% of their earnings. Your contribution helps us keep the platform free and accessible for everyone.
        </Text>

        <View style={[styles.upiContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
          <View style={styles.upiRow}>
            <View style={styles.upiBadge}>
              <Text style={[styles.upiBadgeText, { color: colors.amber }]}>Official UPI ID</Text>
            </View>
            <TouchableOpacity style={styles.copyButton} onPress={handleCopy}>
              <Text style={[styles.upiText, { color: colors.text }]}>{upiId}</Text>
              <Copy size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.contributeButton} onPress={handleContribute} activeOpacity={0.8}>
          <Text style={styles.contributeButtonText}>Contribute via UPI</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.md,
    marginBottom: spacing.xl,
    overflow: 'hidden',
    borderWidth: 1,
  },
  bgGradients: {
    ...(StyleSheet.absoluteFill as any),
    overflow: 'hidden',
  },
  gradientBlob: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  content: {
    padding: spacing.md,
    position: 'relative',
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  badge: {
    backgroundColor: 'rgba(244, 63, 94, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 50,
  },
  badgeText: {
    color: '#f43f5e',
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: '#f43f5e',
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: fontSize.sm,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  upiContainer: {
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  upiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  upiBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  upiBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  upiText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: 'bold',
    fontSize: fontSize.sm,
  },
  contributeButton: {
    backgroundColor: '#f43f5e',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  contributeButtonText: {
    color: '#ffffff',
    fontSize: fontSize.md,
    fontWeight: 'bold',
  },
});
