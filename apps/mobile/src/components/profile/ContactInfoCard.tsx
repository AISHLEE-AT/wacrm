import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, Linking } from 'react-native';
import { Smartphone, MapPin, CreditCard, Sparkles, Check, X, ExternalLink, Navigation } from 'lucide-react-native';
import { colors, spacing, radius, fontSize } from '../../lib/theme';
import { LocationContext } from '../../context/LocationContext';

import { AppContext } from '../../context/AppContext';

interface ContactInfoCardProps {
  profile: any;
  userId: string;
  phone: string;
  onProfileUpdate: (updatedProfile: any) => void;
}

export const ContactInfoCard: React.FC<ContactInfoCardProps> = ({ profile, userId, phone, onProfileUpdate }) => {
  const locationCtx = useContext(LocationContext);
  const appContext = useContext(AppContext);
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

      // Update in AppContext immediately for realtime UI sync
      if (editingField === 'upi_id') {
        appContext?.updateUserProfile?.({ upiId: editValue.trim() });
      } else if (editingField === 'location') {
        appContext?.updateUserProfile?.({ location: editValue.trim() });
      }

      fetch('https://watscrm.vercel.app/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }).catch(e => console.warn('Profile API update warning:', e));
      
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
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      {/* Row 1: WhatsApp Phone */}
      <View style={[styles.row, { borderBottomColor: colors.border }]}>
        <View style={styles.leftContent}>
          <View style={styles.iconContainer}>
            <Smartphone size={20} color={colors.primary} />
          </View>
          <View style={styles.contentContainer}>
            <Text style={[styles.label, { color: colors.textMuted }]}>WhatsApp Phone</Text>
            <Text style={[styles.value, { color: colors.text }]}>{formatPhone(phone)}</Text>
          </View>
        </View>
      </View>

      {/* Row 2: Location */}
      <View style={[styles.row, { borderBottomColor: colors.border }]}>
        <View style={styles.leftContent}>
          <View style={styles.iconContainer}>
            <MapPin size={20} color={colors.primary} />
          </View>
          <View style={styles.contentContainer}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Location</Text>
            {editingField === 'location' ? (
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                value={editValue}
                onChangeText={setEditValue}
                placeholder="e.g. Chennai, Tamil Nadu, India"
                placeholderTextColor={colors.textMuted}
                autoFocus
              />
            ) : (
              <View>
                <Text style={[styles.value, { color: colors.text }]}>
                  {locationCtx.isLoading
                    ? 'Detecting...'
                    : profile?.location || locationCtx.locationString || 'Tap Detect to set location'}
                </Text>
                {locationCtx.city && !locationCtx.isLoading && (
                  <Text style={[styles.locationDetail, { color: colors.textMuted }]}>
                    {[locationCtx.city, locationCtx.district, locationCtx.pincode].filter(Boolean).join(' · ')}
                  </Text>
                )}
              </View>
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
            <View style={styles.editActions}>
              {locationCtx.isLoading ? (
                <ActivityIndicator size="small" color={colors.accent} />
              ) : (
                <TouchableOpacity onPress={locationCtx.refreshLocation} style={[styles.detectBtn, { backgroundColor: colors.accentLight }]}>
                  <Navigation size={14} color={colors.accent} />
                  <Text style={[styles.detectBtnText, { color: colors.accent }]}>Detect</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => handleEdit('location', profile?.location || locationCtx.locationString || '')}>
                <Text style={[styles.editBtnText, { color: colors.primary }]}>Edit</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Row 3: UPI ID */}
      <View style={[styles.row, { borderBottomColor: colors.border }]}>
        <View style={styles.leftContent}>
          <View style={styles.iconContainer}>
            <CreditCard size={20} color={colors.primary} />
          </View>
          <View style={styles.contentContainer}>
            <Text style={[styles.label, { color: colors.textMuted }]}>UPI ID (For Driver/Ride Settlements)</Text>
            {editingField === 'upi_id' ? (
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                value={editValue}
                onChangeText={setEditValue}
                placeholder="e.g. 9876543210@upi"
                placeholderTextColor={colors.textMuted}
                autoFocus
              />
            ) : (
              <Text style={[styles.value, { color: colors.text }]}>
                {profile?.upi_id || ((phone || '').replace(/\D/g, '').slice(-10) ? `${(phone || '').replace(/\D/g, '').slice(-10)}@upi` : 'Not provided')}
              </Text>
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
            <TouchableOpacity onPress={() => handleEdit('upi_id', profile?.upi_id || ((phone || '').replace(/\D/g, '').slice(-10) ? `${(phone || '').replace(/\D/g, '').slice(-10)}@upi` : ''))}>
              <Text style={[styles.editBtnText, { color: colors.primary }]}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Row 4: Gemini API Key */}
      <View style={[styles.row, styles.lastRow, { borderBottomColor: colors.border }]}>
        <View style={styles.leftContent}>
          <View style={styles.iconContainer}>
            <Sparkles size={20} color={colors.primary} />
          </View>
          <View style={styles.contentContainer}>
            <Text style={[styles.label, { color: colors.textMuted }]}>GEMINI API KEY (AI FEATURES)</Text>
            {editingField === 'gemini_api_key' ? (
              <View>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                  value={editValue}
                  onChangeText={setEditValue}
                  placeholder="AIzaSy..."
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry
                  autoFocus
                />
                <TouchableOpacity style={styles.linkContainer} onPress={openGeminiLink}>
                  <ExternalLink size={14} color={colors.accent} />
                  <Text style={[styles.linkText, { color: colors.accent }]}>Get API Key</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={[styles.value, { color: colors.text }]}>
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
              <Text style={[styles.editBtnText, { color: colors.primary }]}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
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
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: fontSize.md,
  },
  input: {
    borderWidth: 1,
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
    fontSize: fontSize.xs,
    marginLeft: spacing.xs,
  },
  detectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    marginRight: spacing.sm,
  },
  detectBtnText: {
    fontSize: fontSize.xs,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  locationDetail: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
});
