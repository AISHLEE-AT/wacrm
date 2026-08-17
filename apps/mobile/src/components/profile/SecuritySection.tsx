import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { KeyRound, Eye, EyeOff, ShieldCheck, Check, AlertTriangle } from 'lucide-react-native';
import { colors, spacing, radius, fontSize } from '../../lib/theme';
import { supabase } from '../../lib/supabase';

interface SecuritySectionProps {
  phone: string;
}

export const SecuritySection: React.FC<SecuritySectionProps> = ({ phone }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isValidPin = /^\d{4}$/.test(pin);
  const isMatch = isValidPin && pin === confirmPin;
  const canSubmit = isMatch && !loading;

  const handleUpdatePin = async () => {
    if (!canSubmit) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('https://watscrm.vercel.app/api/auth/pin/set', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, pin, confirmPin }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update PIN');
      }
      
      setSuccess('PIN successfully updated');
      setPin('');
      setConfirmPin('');
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating PIN');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOutAll = async () => {
    Alert.alert(
      'Sign Out All Devices',
      'Are you sure you want to sign out from all devices?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out All',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.auth.signOut({ scope: 'global' });
              if (error) throw error;
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to sign out all devices');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.header}>
          <KeyRound color={colors.amber} size={24} />
          <View style={styles.headerTextContainer}>
            <Text style={[styles.title, { color: colors.text }]}>Change Login PIN</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Update your 4-digit quick login PIN</Text>
          </View>
        </View>

        {error && (
          <View style={styles.errorCard}>
            <AlertTriangle color={colors.destructive} size={20} />
            <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
          </View>
        )}

        {success && (
          <View style={styles.successCard}>
            <ShieldCheck color={colors.emerald} size={20} />
            <Text style={[styles.successText, { color: colors.emerald }]}>{success}</Text>
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>New PIN</Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
            <KeyRound color={colors.textMuted} size={20} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={pin}
              onChangeText={(text) => setPin(text.replace(/[^0-9]/g, '').slice(0, 4))}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry={!showPin}
              placeholder="Enter 4-digit PIN"
              placeholderTextColor={colors.textMuted}
            />
            <TouchableOpacity onPress={() => setShowPin(!showPin)} style={styles.eyeIcon}>
              {showPin ? (
                <EyeOff color={colors.textSecondary} size={20} />
              ) : (
                <Eye color={colors.textSecondary} size={20} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Confirm New PIN</Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
            <KeyRound color={colors.textMuted} size={20} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={confirmPin}
              onChangeText={(text) => setConfirmPin(text.replace(/[^0-9]/g, '').slice(0, 4))}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry={!showConfirmPin}
              placeholder="Confirm 4-digit PIN"
              placeholderTextColor={colors.textMuted}
            />
            <TouchableOpacity onPress={() => setShowConfirmPin(!showConfirmPin)} style={styles.eyeIcon}>
              {showConfirmPin ? (
                <EyeOff color={colors.textSecondary} size={20} />
              ) : (
                <Eye color={colors.textSecondary} size={20} />
              )}
            </TouchableOpacity>
          </View>
          {confirmPin.length === 4 && (
            <View style={styles.matchIndicator}>
              {isMatch ? (
                <>
                  <Check color={colors.emerald} size={14} />
                  <Text style={[styles.matchTextSuccess, { color: colors.emerald }]}> ✓ PINs match</Text>
                </>
              ) : (
                <>
                  <AlertTriangle color={colors.destructive} size={14} />
                  <Text style={[styles.matchTextError, { color: colors.destructive }]}> ⚠ PINs don't match</Text>
                </>
              )}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled, { backgroundColor: colors.amber }]}
          onPress={handleUpdatePin}
          disabled={!canSubmit}
        >
          {loading ? (
            <ActivityIndicator color={colors.background} size="small" />
          ) : (
            <Text style={[styles.submitButtonText, { color: colors.background }]}>Update PIN</Text>
          )}
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <TouchableOpacity style={styles.signOutAllButton} onPress={handleSignOutAll}>
          <Text style={[styles.signOutAllText, { color: colors.destructive }]}>Sign out all devices</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  card: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerTextContainer: {
    marginLeft: spacing.md,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: fontSize.lg,
    letterSpacing: 4,
    height: '100%',
  },
  eyeIcon: {
    padding: spacing.xs,
  },
  matchIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  matchTextSuccess: {
    fontSize: fontSize.sm,
    marginLeft: 4,
  },
  matchTextError: {
    fontSize: fontSize.sm,
    marginLeft: 4,
  },
  submitButton: {
    borderRadius: radius.md,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    marginVertical: spacing.lg,
  },
  signOutAllButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  signOutAllText: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  errorText: {
    fontSize: fontSize.sm,
    marginLeft: spacing.sm,
    flex: 1,
  },
  successCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  successText: {
    fontSize: fontSize.sm,
    marginLeft: spacing.sm,
    flex: 1,
  },
});
