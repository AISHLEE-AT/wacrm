import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  Alert,
  Modal,
  Platform,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { UserCircle, Camera, Pencil, Eye, X, CheckCircle2, ShieldCheck, Phone } from 'lucide-react-native';
import { decode } from 'base64-arraybuffer';

import { supabase } from '../../lib/supabase';
import { colors, spacing, radius, fontSize } from '../../lib/theme';
import { ENV } from '../../config/env';

const { width } = Dimensions.get('window');

interface ProfileHeaderProps {
  profile: any;
  userId: string;
  isAdmin: boolean;
  isDriver: boolean;
  phone: string;
  onProfileUpdate: (updatedProfile: any) => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  userId,
  isAdmin,
  isDriver,
  phone,
  onProfileUpdate,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState(profile?.full_name || '');
  const [isSavingName, setIsSavingName] = useState(false);
  const [showViewProfileModal, setShowViewProfileModal] = useState(false);

  const handlePickAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0].base64) {
        setIsUploading(true);

        const filePath = `${userId}/avatar.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, decode(result.assets[0].base64), {
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        const avatar_url = publicUrlData.publicUrl;

        const response = await fetch(`${ENV.CRM_URL}/api/profile/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, phone, avatar_url }),
        });

        if (!response.ok) {
          throw new Error('Failed to update profile avatar');
        }

        const data = await response.json();
        onProfileUpdate(data.profile || data);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveName = async () => {
    if (!editNameValue.trim()) return;
    try {
      setIsSavingName(true);
      const response = await fetch(`${ENV.CRM_URL}/api/profile/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, phone, full_name: editNameValue.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to update name');
      }

      const data = await response.json();
      onProfileUpdate(data.profile || data);
      setIsEditingName(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update name');
    } finally {
      setIsSavingName(false);
    }
  };

  const roleText = isAdmin ? '👑 Admin / Owner' : isDriver ? '🚖 Driver Partner' : '👤 SuprO Member';
  const roleColor = isAdmin ? '#fbbf24' : isDriver ? '#38bdf8' : '#34d399';

  return (
    <View style={styles.container}>
      {/* Avatar with click to View Profile modal */}
      <TouchableOpacity 
        style={[styles.avatarContainer, { borderColor: roleColor }]} 
        onPress={() => setShowViewProfileModal(true)} 
        activeOpacity={0.8}
      >
        {profile?.avatar_url ? (
          <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <UserCircle size={44} color={roleColor} />
          </View>
        )}
        <View style={[styles.cameraOverlay, { backgroundColor: '#0f172a', borderColor: '#1e293b' }]}>
          <Eye size={12} color="#f8fafc" />
        </View>
        {isUploading && (
          <View style={styles.uploadingOverlay}>
            <ActivityIndicator size="small" color="#fff" />
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        {isEditingName ? (
          <View style={styles.editNameContainer}>
            <TextInput
              style={[styles.nameInput, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
              value={editNameValue}
              onChangeText={setEditNameValue}
              placeholder="Enter name"
              placeholderTextColor={colors.textMuted}
              autoFocus
            />
            <View style={styles.editActions}>
              <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={handleSaveName} disabled={isSavingName}>
                {isSavingName ? (
                  <ActivityIndicator size="small" color={colors.background} />
                ) : (
                  <Text style={[styles.saveButtonText, { color: colors.background }]}>Save</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={[styles.cancelButton, { backgroundColor: colors.border }]} onPress={() => setIsEditingName(false)} disabled={isSavingName}>
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.nameContainer}>
            <Text style={[styles.nameText, { color: colors.text }]}>{profile?.full_name || 'SuprO Partner'}</Text>
            <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.border }]} onPress={() => {
              setEditNameValue(profile?.full_name || '');
              setIsEditingName(true);
            }}>
              <Pencil size={13} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}
        
        {!isEditingName && (
          <View style={styles.roleRow}>
            <Text style={[styles.roleText, { color: roleColor }]}>{roleText}</Text>
            <TouchableOpacity 
              style={[styles.viewProfileChip, { borderColor: roleColor + '50' }]} 
              onPress={() => setShowViewProfileModal(true)}
              activeOpacity={0.7}
            >
              <Eye size={12} color={roleColor} style={{ marginRight: 4 }} />
              <Text style={[styles.viewProfileChipText, { color: roleColor }]}>View Profile</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ─── INNOVATIVE TACTILE "VIEW PROFILE" AVATAR MODAL ─── */}
      <Modal
        visible={showViewProfileModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowViewProfileModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { borderColor: roleColor + '40', borderBottomColor: roleColor }]}>
            {/* Close Button */}
            <TouchableOpacity 
              style={styles.closeBtn} 
              onPress={() => setShowViewProfileModal(false)}
              activeOpacity={0.7}
            >
              <X size={18} color="#94a3b8" />
            </TouchableOpacity>

            {/* Glowing Avatar Frame */}
            <View style={[styles.modalAvatarRing, { borderColor: roleColor, shadowColor: roleColor }]}>
              {profile?.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={styles.modalAvatarImg} />
              ) : (
                <View style={[styles.modalAvatarPlaceholder, { backgroundColor: roleColor + '15' }]}>
                  <UserCircle size={80} color={roleColor} />
                </View>
              )}
              <View style={[styles.verifiedBadge, { backgroundColor: roleColor }]}>
                <CheckCircle2 size={16} color="#070b14" />
              </View>
            </View>

            {/* User Details */}
            <Text style={styles.modalUserName}>{profile?.full_name || 'SuprO Partner'}</Text>
            <View style={[styles.modalRolePill, { backgroundColor: roleColor + '18', borderColor: roleColor + '40' }]}>
              <Text style={[styles.modalRoleText, { color: roleColor }]}>{roleText}</Text>
            </View>

            <View style={styles.modalMetaRow}>
              <Phone size={13} color="#94a3b8" style={{ marginRight: 6 }} />
              <Text style={styles.modalMetaText}>+91 {phone || 'Not linked'}</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.modalActionGrid}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnPhoto, { backgroundColor: roleColor }]}
                onPress={() => {
                  setShowViewProfileModal(false);
                  setTimeout(handlePickAvatar, 300);
                }}
                activeOpacity={0.8}
              >
                <Camera size={16} color="#070b14" style={{ marginRight: 6 }} />
                <Text style={styles.modalBtnPhotoText}>Change Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalBtnDismiss}
                onPress={() => setShowViewProfileModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalBtnDismissText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 12,
  },
  avatarContainer: {
    position: 'relative',
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2.5,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 38,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 38,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: 12,
    padding: 5,
    borderWidth: 1.5,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  nameText: {
    fontSize: 22,
    fontWeight: '800',
  },
  editButton: {
    padding: 6,
    borderRadius: 8,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  viewProfileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  viewProfileChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  editNameContainer: {
    gap: 8,
  },
  nameInput: {
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    borderWidth: 1,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  saveButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontWeight: '700',
    fontSize: 13,
  },
  cancelButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontWeight: '600',
    fontSize: 13,
  },

  /* Innovative Tactile View Profile Modal */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 10, 20, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: width - 48,
    maxWidth: 340,
    backgroundColor: '#0c1322',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderBottomWidth: 4,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalAvatarRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    padding: 4,
    position: 'relative',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 16,
  },
  modalAvatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 56,
  },
  modalAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#0c1322',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalUserName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#f8fafc',
    letterSpacing: -0.3,
    marginBottom: 6,
    textAlign: 'center',
  },
  modalRolePill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 10,
  },
  modalRoleText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  modalMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalMetaText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  modalActionGrid: {
    width: '100%',
    gap: 10,
  },
  modalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
  },
  modalBtnPhoto: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  modalBtnPhotoText: {
    color: '#070b14',
    fontSize: 14,
    fontWeight: '800',
  },
  modalBtnDismiss: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#1e293b',
  },
  modalBtnDismissText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700',
  },
});
