import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, Linking } from 'react-native';
import { Smartphone, MapPin, CreditCard, Sparkles, Check, X, ExternalLink } from 'lucide-react-native';
import { colors, spacing, radius, fontSize } from '../../lib/theme';

interface ContactInfoCardProps {
  profile: any;
  userId: string;
  phone: string;
  onProfileUpdate: (updatedProfile: any) => void;
}

export const ContactInfoCard: React.FC<ContactInfoCardProps> = ({ profile, userId, phone, onProfileUpdate }) => {
  const [editingField, setEditingField] = useState<'location' | 'upi_id' | 'gemini_api_key' | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const formatPhone = (phoneStr: string) => {
    const digits = (phoneStr || '').replace(/\D/g, '');
    if (digits.length === 10) {
      return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
    }
    return phoneStr || 'Not provided';
  };

  const handleEdit = (field: 'location' | 'upi_id' | 'gemini_api_key', currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue || '');
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handleSave = async () => {
    if (!editingField) return;

    setIsSaving(true);
    try {
      const payload: any = { userId, phone };
      payload[editingField] = editValue;

      const response = await fetch('https://watscrm.vercel.app/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      const updatedProfile = { ...profile, [editingField]: editValue };
      onProfileUpdate(updatedProfile);
      
      setEditingField(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to save changes. Please try again.');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const openGeminiLink = () => {
    Linking.openURL('https://aistudio.google.com/app/apikey');
  };

  return (
    <View style={styles.card}>
      {/* Row 1: WhatsApp Phone */}
      <View style={styles.row}>
        <View style={styles.leftContent}>
          <View style={styles.iconContainer}>
            <Smartphone size={20} color={colors.primary} />
          </View>
          <View style={styles.contentContainer}>
            <Text style={styles.label}>WhatsApp Phone</Text>
            <Text style={styles.value}>{formatPhone(phone)}</Text>
          </View>
        </View>
      </View>

      {/* Row 2: Location */}
      <View style={styles.row}>
        <View style={styles.leftContent}>
          <View style={styles.iconContainer}>
            <MapPin size={20} color={colors.primary} />
          </View>
          <View style={styles.contentContainer}>
            <Text style={styles.label}>Location</Text>
            {editingField === 'location' ? (
              <TextInput
                style={styles.input}
                value={editValue}
                onChangeText={setEditValue}
                placeholder="e.g. Tamil Nadu, India"
                placeholderTextColor={colors.textMuted}
                autoFocus
              />
            ) : (
              <Text style={styles.value}>{profile?.location || 'Tamil Nadu, India'}</Text>
            )}
          </View>
        </View>
        <View style={styles.actionContainer}>
          {editingField === 'location' ? (
            isSaving ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <View style={styles.editActions}>
                <TouchableOpacity onPress={handleSave} style={styles.actionBtn}>
                  <Check size={20} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCancel} style={styles.actionBtn}>
                  <X size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            )
          ) : (
            <TouchableOpacity onPress={() => handleEdit('location', profile?.location || 'Tamil Nadu, India')}>
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Row 3: UPI ID */}
      <View style={styles.row}>
        <View style={styles.leftContent}>
          <View style={styles.iconContainer}>
            <CreditCard size={20} color={colors.primary} />
          </View>
          <View style={styles.contentContainer}>
            <Text style={styles.label}>UPI ID (For Driver/Ride Settlements)</Text>
            {editingField === 'upi_id' ? (
              <TextInput
                style={styles.input}
                value={editValue}
                onChangeText={setEditValue}
                placeholder="e.g. 9876543210@upi"
                placeholderTextColor={colors.textMuted}
                autoFocus
              />
            ) : (
              <Text style={styles.value}>{profile?.upi_id || 'Not provided'}</Text>
            )}
          </View>
        </View>
        <View style={styles.actionContainer}>
          {editingField === 'upi_id' ? (
            isSaving ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <View style={styles.editActions}>
                <TouchableOpacity onPress={handleSave} style={styles.actionBtn}>
                  <Check size={20} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCancel} style={styles.actionBtn}>
                  <X size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            )
          ) : (
            <TouchableOpacity onPress={() => handleEdit('upi_id', profile?.upi_id || '')}>
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Row 4: Gemini API Key */}
      <View style={[styles.row, styles.lastRow]}>
        <View style={styles.leftContent}>
          <View style={styles.iconContainer}>
            <Sparkles size={20} color={colors.primary} />
          </View>
          <View style={styles.contentContainer}>
            <Text style={styles.label}>GEMINI API KEY (AI FEATURES)</Text>
            {editingField === 'gemini_api_key' ? (
              <View>
                <TextInput
                  style={styles.input}
                  value={editValue}
                  onChangeText={setEditValue}
                  placeholder="AIzaSy..."
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry
                  autoFocus
                />
                <TouchableOpacity style={styles.linkContainer} onPress={openGeminiLink}>
                  <ExternalLink size={14} color={colors.accent} />
                  <Text style={styles.linkText}>Get API Key</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.value}>
                {profile?.gemini_api_key ? '••••••••••••••••' : 'Not provided'}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.actionContainer}>
          {editingField === 'gemini_api_key' ? (
            isSaving ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <View style={styles.editActions}>
                <TouchableOpacity onPress={handleSave} style={styles.actionBtn}>
                  <Check size={20} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCancel} style={styles.actionBtn}>
                  <X size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            )
          ) : (
            <TouchableOpacity onPress={() => handleEdit('gemini_api_key', profile?.gemini_api_key || '')}>
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lastRow: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  contentContainer: {
    flex: 1,
  },
  label: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  input: {
    backgroundColor: colors.inputBg,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
  },
  actionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 40,
  },
  editBtnText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: 'bold',
  },
  editActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    padding: spacing.sm,
    marginLeft: spacing.xs,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  linkText: {
    color: colors.accent,
    fontSize: fontSize.xs,
    marginLeft: spacing.xs,
  }
});
