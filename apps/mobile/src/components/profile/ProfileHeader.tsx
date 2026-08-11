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
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { UserCircle, Camera, Pencil } from 'lucide-react-native';
import { decode } from 'base64-arraybuffer';

import { supabase } from '../../lib/supabase';
import { colors, spacing, radius, fontSize } from '../../lib/theme';

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

        const response = await fetch('https://watscrm.vercel.app/api/profile/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, phone, avatar_url }),
        });

        if (!response.ok) {
          throw new Error('Failed to update profile avatar');
        }

        const data = await response.json();
        onProfileUpdate(data);
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
      const response = await fetch('https://watscrm.vercel.app/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, phone, full_name: editNameValue.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to update name');
      }

      const data = await response.json();
      onProfileUpdate(data);
      setIsEditingName(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update name');
    } finally {
      setIsSavingName(false);
    }
  };

  const roleText = isAdmin ? 'Admin / Owner' : isDriver ? 'Driver Partner' : 'User';

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.avatarContainer} 
        onPress={handlePickAvatar} 
        disabled={isUploading}
      >
        {profile?.avatar_url ? (
          <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <UserCircle size={40} color={colors.primary} />
          </View>
        )}
        <View style={styles.cameraOverlay}>
          <Camera size={12} color={colors.text} />
        </View>
        {isUploading && (
          <View style={styles.uploadingOverlay}>
            <ActivityIndicator size="small" color={colors.text} />
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        {isEditingName ? (
          <View style={styles.editNameContainer}>
            <TextInput
              style={styles.nameInput}
              value={editNameValue}
              onChangeText={setEditNameValue}
              placeholder="Enter name"
              placeholderTextColor={colors.textMuted}
              autoFocus
            />
            <View style={styles.editActions}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveName} disabled={isSavingName}>
                {isSavingName ? (
                  <ActivityIndicator size="small" color={colors.background} />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setIsEditingName(false)} disabled={isSavingName}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.nameContainer}>
            <Text style={styles.nameText}>{profile?.full_name || 'User'}</Text>
            <TouchableOpacity style={styles.editButton} onPress={() => {
              setEditNameValue(profile?.full_name || '');
              setIsEditingName(true);
            }}>
              <Pencil size={14} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}
        
        {!isEditingName && (
          <Text style={styles.roleText}>{roleText}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg || 16,
    paddingVertical: spacing.md || 12,
  },
  avatarContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    backgroundColor: 'rgba(16, 185, 129, 0.1)', // fallback if theme doesn't have primary/10
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 4,
    borderWidth: 2,
    borderColor: colors.background,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 40,
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
    gap: spacing.sm || 8,
    marginBottom: 4,
  },
  nameText: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: colors.border,
    padding: 6,
    borderRadius: radius.md || 8,
  },
  roleText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  editNameContainer: {
    gap: spacing.sm || 8,
  },
  nameInput: {
    backgroundColor: colors.inputBg,
    color: colors.text,
    borderRadius: radius.md || 8,
    padding: spacing.md || 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  editActions: {
    flexDirection: 'row',
    gap: spacing.sm || 8,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm || 8,
    paddingHorizontal: spacing.md || 12,
    borderRadius: radius.md || 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: colors.background,
    fontWeight: '600',
    fontSize: 14,
  },
  cancelButton: {
    backgroundColor: colors.border,
    paddingVertical: spacing.sm || 8,
    paddingHorizontal: spacing.md || 12,
    borderRadius: radius.md || 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
});
