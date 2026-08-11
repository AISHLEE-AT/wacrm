import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Linking,
  Platform,
} from 'react-native';
import { Truck, Clock, MessageCircle, CheckCircle } from 'lucide-react-native';
import { colors, spacing, radius, fontSize } from '../../lib/theme';

interface DriverStatusCardProps {
  driverProfile: any | null; // { is_verified, vehicle_number, vehicle_registration }
  fullName: string;
  navigation: any;
}

export const DriverStatusCard: React.FC<DriverStatusCardProps> = ({
  driverProfile,
  fullName,
  navigation,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (driverProfile && !driverProfile.is_verified) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.5,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [driverProfile, pulseAnim]);

  const handleWhatsAppVerification = () => {
    const vehicle = driverProfile?.vehicle_number || 'N/A';
    const message = `Hello Admin! I have registered as a DriveO Driver Partner (Name: ${fullName}, Vehicle: ${vehicle}). Please verify my driver account.`;
    const url = `https://api.whatsapp.com/send?phone=916381029380&text=${encodeURIComponent(
      message
    )}`;
    Linking.openURL(url).catch((err) =>
      console.error('An error occurred while opening WhatsApp', err)
    );
  };

  const renderContent = () => {
    if (!driverProfile) {
      return (
        <View style={styles.stateContainer}>
          <Text style={styles.descriptionText}>
            You are not registered as a DriveO vehicle operator yet.
          </Text>
          <TouchableOpacity
            style={styles.enrollButton}
            onPress={() => navigation.navigate('DriveOScreen')}
          >
            <Text style={styles.buttonText}>Enroll as Driver Partner</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!driverProfile.is_verified) {
      return (
        <View style={styles.stateContainer}>
          <View style={styles.amberBadge}>
            <Animated.View style={{ opacity: pulseAnim }}>
              <Clock color={colors.amber} size={16} />
            </Animated.View>
            <Text style={styles.amberBadgeText}>Pending Admin Verification</Text>
          </View>

          {driverProfile.vehicle_number && (
            <Text style={styles.vehicleNumber}>
              Vehicle: {driverProfile.vehicle_number}
            </Text>
          )}

          <Text style={styles.descriptionText}>
            Your documents are currently being verified by the administration.
            This process usually takes 24-48 hours.
          </Text>

          <TouchableOpacity
            style={styles.whatsappButton}
            onPress={handleWhatsAppVerification}
          >
            <MessageCircle color={colors.background} size={20} style={styles.buttonIcon} />
            <Text style={styles.whatsappButtonText}>
              Request Admin Verification via WhatsApp
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Verified
    return (
      <View style={styles.stateContainer}>
        <View style={styles.greenBadge}>
          <CheckCircle color={colors.emerald} size={16} />
          <Text style={styles.greenBadgeText}>Verified & Active Driver Partner</Text>
        </View>
        <TouchableOpacity
          style={styles.enrollButton}
          onPress={() => navigation.navigate('DriveOScreen')}
        >
          <Text style={styles.buttonText}>Open DriveO Portal</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Truck color={colors.emerald} size={18} />
        <Text style={styles.headerTitle}>DriveO Partner Registration Status</Text>
      </View>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontSize: fontSize.xs,
    fontWeight: 'bold',
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginLeft: spacing.sm,
  },
  stateContainer: {
    marginTop: spacing.sm,
  },
  descriptionText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  enrollButton: {
    backgroundColor: colors.emerald,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonText: {
    color: colors.background,
    fontSize: fontSize.md,
    fontWeight: 'bold',
  },
  amberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 9999,
    marginBottom: spacing.md,
    alignSelf: 'flex-start',
  },
  amberBadgeText: {
    color: colors.amber,
    fontSize: fontSize.sm,
    fontWeight: 'bold',
    marginLeft: spacing.sm,
  },
  vehicleNumber: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: colors.textMuted,
    fontSize: fontSize.md,
    marginBottom: spacing.md,
  },
  whatsappButton: {
    backgroundColor: colors.whatsapp,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.sm,
  },
  whatsappButtonText: {
    color: colors.background,
    fontSize: fontSize.sm,
    fontWeight: 'bold',
    marginLeft: spacing.sm,
  },
  buttonIcon: {
    marginRight: spacing.xs,
  },
  greenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 9999,
    marginBottom: spacing.md,
    alignSelf: 'flex-start',
  },
  greenBadgeText: {
    color: colors.emerald,
    fontSize: fontSize.sm,
    fontWeight: 'bold',
    marginLeft: spacing.sm,
  },
});
