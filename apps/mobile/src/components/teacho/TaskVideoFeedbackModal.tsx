import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import {
  X,
  Video,
  CheckCircle2,
  HardDrive,
  UploadCloud,
  Sparkles,
  Camera,
  Star,
  RefreshCw,
  Link,
  ShieldCheck,
  Award,
  Play,
  Trash2,
  Lock,
  MessageCircle,
  Send,
  ExternalLink,
  Share2,
} from 'lucide-react-native';
import { colors, spacing, radius, fontSize } from '../../lib/theme';
import { AppContext } from '../../context/AppContext';
import { GoogleDriveService, GoogleDriveAccount } from '../../services/GoogleDriveService';

const COURSE_GUIDE_WHATSAPP = '916381029380';

interface TaskVideoFeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle?: string;
  dayNumber: number;
  topicTitle: string;
  onSubmitted?: (earnedXp: number) => void;
}

export const TaskVideoFeedbackModal: React.FC<TaskVideoFeedbackModalProps> = ({
  visible,
  onClose,
  courseId,
  courseTitle = 'Curriculum Mastery',
  dayNumber,
  topicTitle,
  onSubmitted,
}) => {
  const insets = useSafeAreaInsets();
  const { user } = useContext(AppContext) || {};

  // Google Drive state
  const [driveAccount, setDriveAccount] = useState<GoogleDriveAccount>({ isConnected: false });
  const [isLoadingAccount, setIsLoadingAccount] = useState(true);
  const [isConnectingDrive, setIsConnectingDrive] = useState(false);
  const [manualTokenInput, setManualTokenInput] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);

  // Video recording state
  const [recordedVideoUri, setRecordedVideoUri] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [videoFileSizeMb, setVideoFileSizeMb] = useState<string | null>(null);
  const [manualDriveLink, setManualDriveLink] = useState<string>('');

  // Feedback & rating state
  const [rating, setRating] = useState<number>(5);
  const [feedbackText, setFeedbackText] = useState<string>('');

  // Upload progress state
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadPercent, setUploadPercent] = useState<number>(0);
  const [uploadedDriveLink, setUploadedDriveLink] = useState<string | null>(null);

  // Send pre-populated WhatsApp message to Course Guide (6381029380)
  const handleSendToWhatsApp = async (directLink?: string) => {
    const gdriveUrl =
      directLink || uploadedDriveLink || manualDriveLink.trim() || 'https://drive.google.com';
    const studentName = user?.name || 'Student';
    const studentPhone = user?.phone || 'Not specified';

    const message =
      `🎓 *SuprO TutO — Daily Task Video Verification* 📹\n\n` +
      `👤 *Student Name:* ${studentName}\n` +
      `📱 *Student Mobile:* ${studentPhone}\n` +
      `📚 *Course:* ${courseTitle} (${courseId})\n` +
      `🗓️ *Day Plan:* Day ${dayNumber}\n` +
      `📖 *Topic / Tasks:* ${topicTitle}\n` +
      `⭐ *Self-Rating:* ${rating}/5 ${'⭐'.repeat(rating)}\n` +
      `📝 *Student Feedback:* "${feedbackText.trim() || 'Completed all 12 daily micro-learning tasks for today.'}"\n\n` +
      `🔗 *Google Drive Video Link:*\n${gdriveUrl}\n\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `Dear Course Guide, please review my Day ${dayNumber} video reflection and verify my task completion. Thank you! 🙏`;

    const encodedMsg = encodeURIComponent(message);
    const waUrl = `whatsapp://send?phone=${COURSE_GUIDE_WHATSAPP}&text=${encodedMsg}`;
    const webWaUrl = `https://wa.me/${COURSE_GUIDE_WHATSAPP}?text=${encodedMsg}`;

    try {
      const canOpen = await Linking.canOpenURL(waUrl);
      if (canOpen) {
        await Linking.openURL(waUrl);
      } else {
        await Linking.openURL(webWaUrl);
      }
    } catch (e) {
      await Linking.openURL(webWaUrl);
    }
  };

  // Load Drive status on open
  useEffect(() => {
    if (!visible) return;

    const checkStatus = async () => {
      setIsLoadingAccount(true);
      const status = await GoogleDriveService.getAccountStatus();
      setDriveAccount(status);
      setIsLoadingAccount(false);
    };

    checkStatus();
  }, [visible]);

  const handleDiscardVideo = () => {
    setRecordedVideoUri(null);
    setVideoDuration(null);
    setVideoFileSizeMb(null);
  };

  // Launch native camera recorder
  const handleLaunchCameraRecorder = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'SuprO needs camera permission to record your daily task presentation.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['videos'],
        allowsEditing: true,
        quality: 0.7,
        videoMaxDuration: 180, // 3 minutes max
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setRecordedVideoUri(asset.uri);
        if (asset.duration) {
          setVideoDuration(Math.round(asset.duration / 1000));
        }

        // Calculate file size
        const fileInfo = await FileSystem.getInfoAsync(asset.uri);
        if (fileInfo.exists && (fileInfo as any).size) {
          const mb = ((fileInfo as any).size / (1024 * 1024)).toFixed(2);
          setVideoFileSizeMb(mb);
        }
      }
    } catch (error) {
      console.warn('Camera launch error:', error);
      Alert.alert('Recording Error', 'Unable to launch phone camera recorder. Please try again.');
    }
  };

  // Connect Google Drive
  const handleConnectGoogleDrive = async () => {
    setIsConnectingDrive(true);
    try {
      // In production, initiate OAuth 2.0 Web Auth or accept provided mapping
      const defaultEmail = user?.email || (user?.phone ? `${user.phone.replace(/\D/g, '')}@gmail.com` : 'student@gmail.com');
      
      // Save local mock/OAuth token mapping
      await GoogleDriveService.saveCredentials({
        accessToken: `supro_drive_token_${Date.now()}`,
        refreshToken: `supro_refresh_${Date.now()}`,
        email: defaultEmail,
        userPhone: user?.phone,
      });

      const updated = await GoogleDriveService.getAccountStatus();
      setDriveAccount(updated);
      setShowTokenInput(false);
      Alert.alert('Google Drive Mapped! ☁️', `Your account (${defaultEmail}) is mapped to SuprO.`);
    } catch (err: any) {
      Alert.alert('Connection Failed', err.message || 'Could not map Google Drive');
    } finally {
      setIsConnectingDrive(false);
    }
  };

  // Submit and upload directly to Google Drive
  const handleUploadAndSubmit = async () => {
    if (!recordedVideoUri) {
      Alert.alert('Video Required', 'Please record your task video reflection before submitting.');
      return;
    }

    if (!driveAccount.isConnected) {
      Alert.alert(
        'Google Drive Required',
        'Please connect your Google Drive account so your video is safely stored in your cloud storage.',
        [{ text: 'Connect Now', onPress: handleConnectGoogleDrive }]
      );
      return;
    }

    setIsUploading(true);
    setUploadPercent(10);

    try {
      // 1. Upload video directly to Google Drive
      const uploadResult = await GoogleDriveService.uploadTaskVideo(
        recordedVideoUri,
        {
          courseId,
          courseTitle,
          dayNumber,
          topicTitle,
          userPhone: user?.phone,
          userName: user?.name,
          feedbackText: feedbackText.trim() || 'Task completed successfully',
        },
        (percent) => setUploadPercent(percent)
      );

      setUploadedDriveLink(uploadResult.webViewLink);

      // 2. Save submission into Supabase database
      if (user?.phone) {
        await GoogleDriveService.saveTaskSubmissionToSupabase({
          userPhone: user.phone,
          userName: user.name,
          courseId,
          courseTitle,
          dayNumber,
          topicTitle,
          feedbackText: feedbackText.trim(),
          videoDriveFileId: uploadResult.fileId,
          videoDriveLink: uploadResult.webViewLink,
          rating,
        });
      }

      // 3. Complete and grant bonus XP
      const earnedXp = 100;
      setUploadedDriveLink(uploadResult.webViewLink);
      onSubmitted?.(earnedXp);

      Alert.alert(
        '🎉 Video Saved to Google Drive!',
        `Your video is saved in your Google Drive ("📁 SuprO Daily Tasks") and recorded!\n\nSend it to your Course Guide (+91 6381029380) on WhatsApp for instant verification?`,
        [
          {
            text: '📲 Send on WhatsApp',
            onPress: () => {
              handleSendToWhatsApp(uploadResult.webViewLink);
              onClose();
            },
          },
          {
            text: 'Done',
            onPress: () => {
              setRecordedVideoUri(null);
              setFeedbackText('');
              onClose();
            },
          },
        ]
      );
    } catch (err: any) {
      console.warn('Upload error:', err);
      Alert.alert(
        'Upload Notice',
        `Video recorded locally! (Note: ${err.message || 'Google Drive sync queued'}).`,
        [
          {
            text: '📲 Send to Guide on WhatsApp',
            onPress: () => {
              handleSendToWhatsApp();
              onSubmitted?.(50);
              onClose();
            },
          },
          {
            text: 'Save & Close',
            onPress: () => {
              onSubmitted?.(50);
              onClose();
            },
          },
        ]
      );
    } finally {
      setIsUploading(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) + 16 }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.badgeRow}>
                <View style={styles.badge}>
                  <Sparkles size={12} color="#00D084" />
                  <Text style={styles.badgeText}>TASK {dayNumber}: VIDEO FEEDBACK & CRM</Text>
                </View>
                <View style={styles.xpBadge}>
                  <Award size={12} color="#F59E0B" />
                  <Text style={styles.xpBadgeText}>+100 Bonus XP</Text>
                </View>
              </View>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {topicTitle}
              </Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {courseTitle}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} disabled={isUploading}>
              <X size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* 1. Google Drive Account Mapping Card */}
            <View style={[styles.card, { borderColor: driveAccount.isConnected ? '#059669' : colors.border }]}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <HardDrive size={18} color={driveAccount.isConnected ? '#00D084' : '#38BDF8'} />
                  <Text style={styles.cardTitle}>Google Drive Cloud Storage</Text>
                </View>
              </View>

              {isLoadingAccount ? (
                <ActivityIndicator size="small" color="#00D084" style={{ marginVertical: 8 }} />
              ) : driveAccount.isConnected ? (
                <View style={styles.accountInfoBox}>
                  <Text style={styles.accountEmailText}>{driveAccount.email || 'Connected Account'}</Text>
                  <Text style={styles.accountSubText}>Target Folder: {(driveAccount as any).folderName || '📁 SuprO Daily Tasks'}</Text>
                </View>
              ) : (
                <View style={styles.connectPromptBox}>
                  <Text style={styles.connectPromptText}>
                    Connect your Google Drive so all your daily video task recordings auto-upload directly to your account.
                  </Text>
                  <TouchableOpacity
                    style={styles.connectDriveBtn}
                    onPress={handleConnectGoogleDrive}
                    disabled={isConnectingDrive}
                  >
                    {isConnectingDrive ? (
                      <ActivityIndicator size="small" color="#0F172A" />
                    ) : (
                      <>
                        <UploadCloud size={16} color="#0F172A" />
                        <Text style={styles.connectDriveBtnText}>Connect Google Drive Storage</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* 2. Phone Recorder & Video Capture Section */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <Video size={18} color="#F59E0B" />
                  <Text style={styles.cardTitle}>Task Video Recording</Text>
                </View>
                {recordedVideoUri && (
                  <View style={[styles.connectedPill, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
                    <CheckCircle2 size={12} color="#F59E0B" />
                    <Text style={[styles.connectedPillText, { color: '#F59E0B' }]}>Recorded</Text>
                  </View>
                )}
              </View>

              {recordedVideoUri ? (
                <View style={styles.previewBox}>
                  <View style={styles.previewInfoRow}>
                    <View style={styles.previewMeta}>
                      <Text style={styles.previewTitleText}>📹 Ready to Upload & Verify</Text>
                      <Text style={styles.previewSubText}>
                        Size: {videoFileSizeMb ? `${videoFileSizeMb} MB` : 'Optimized'} • Day {dayNumber} Presentation
                      </Text>
                    </View>
                    <TouchableOpacity style={styles.deleteVideoBtn} onPress={handleDiscardVideo} disabled={isUploading}>
                      <Trash2 size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.recordTriggerCard}
                  onPress={handleLaunchCameraRecorder}
                  disabled={isUploading}
                  activeOpacity={0.8}
                >
                  <View style={styles.recordIconCircle}>
                    <Camera size={24} color="#FFFFFF" />
                  </View>
                  <Text style={styles.recordTriggerTitle}>Record Daily Task Explanation</Text>
                  <Text style={styles.recordTriggerSubtitle}>
                    Explain in 1-2 minutes what you learned today in {topicTitle}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* 3. Written Daily Reflection & Star Rating */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Lesson Mastery & Rating</Text>
              <View style={styles.ratingRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    style={styles.starBtn}
                    disabled={isUploading}
                  >
                    <Star
                      size={26}
                      color={star <= rating ? '#F59E0B' : '#475569'}
                      fill={star <= rating ? '#F59E0B' : 'transparent'}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.cardTitle, { marginTop: 12 }]}>Daily Reflection / Instructor Feedback</Text>
              <TextInput
                style={styles.feedbackInput}
                placeholder="Share your key takeaway or any doubts for your mentor..."
                placeholderTextColor="#64748B"
                multiline
                numberOfLines={3}
                value={feedbackText}
                onChangeText={setFeedbackText}
                editable={!isUploading}
              />
            </View>

            {/* 4. WhatsApp Course Guide Direct Verification Card (6381029380) */}
            <View style={[styles.card, { borderColor: '#25D366', backgroundColor: '#071F15' }]}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <MessageCircle size={18} color="#25D366" />
                  <Text style={[styles.cardTitle, { color: '#25D366' }]}>
                    Course Guide WhatsApp CRM Verification
                  </Text>
                </View>
                <View style={[styles.connectedPill, { backgroundColor: 'rgba(37, 211, 102, 0.2)' }]}>
                  <Text style={[styles.connectedPillText, { color: '#25D366' }]}>+91 6381029380</Text>
                </View>
              </View>

              <Text style={{ fontSize: 11, color: '#A7F3D0', lineHeight: 16 }}>
                Auto-populate your Day {dayNumber} Google Drive video link, star rating, and reflection details to send directly to your Course Guide in 1 click!
              </Text>

              {/* Paste Direct GDrive Link if already uploaded */}
              <View style={{ marginTop: 8 }}>
                <Text style={{ fontSize: 10, fontWeight: '800', color: '#6EE7B7', marginBottom: 4 }}>
                  GOOGLE DRIVE VIDEO LINK:
                </Text>
                <TextInput
                  style={[styles.feedbackInput, { minHeight: 40, height: 42, color: '#FFFFFF', fontSize: 11 }]}
                  placeholder="https://drive.google.com/file/d/..."
                  placeholderTextColor="#065F46"
                  value={uploadedDriveLink || manualDriveLink}
                  onChangeText={setManualDriveLink}
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity
                style={styles.whatsAppBtn}
                onPress={() => handleSendToWhatsApp()}
                activeOpacity={0.85}
              >
                <MessageCircle size={18} color="#FFFFFF" />
                <Text style={styles.whatsAppBtnText}>
                  📲 Send Video to Course Guide on WhatsApp (6381029380)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Upload Progress Bar if active */}
            {isUploading && (
              <View style={styles.progressCard}>
                <View style={styles.progressLabelRow}>
                  <Text style={styles.progressLabelText}>Uploading to Google Drive...</Text>
                  <Text style={styles.progressPercentText}>{uploadPercent}%</Text>
                </View>
                <View style={styles.progressBarTrack}>
                  <View style={[styles.progressBarFill, { width: `${uploadPercent}%` }]} />
                </View>
              </View>
            )}
          </ScrollView>

          {/* Submit Action Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.submitBtn,
                (!recordedVideoUri && !manualDriveLink) && styles.submitBtnDisabled,
              ]}
              onPress={recordedVideoUri ? handleUploadAndSubmit : () => handleSendToWhatsApp()}
              disabled={isUploading || (!recordedVideoUri && !manualDriveLink)}
              activeOpacity={0.85}
            >
              {isUploading ? (
                <View style={styles.submittingRow}>
                  <ActivityIndicator size="small" color="#0F172A" />
                  <Text style={styles.submitBtnText}>Uploading to Google Drive...</Text>
                </View>
              ) : (
                <View style={styles.submittingRow}>
                  <UploadCloud size={18} color="#0F172A" />
                  <Text style={styles.submitBtnText}>Submit Video Feedback & Earn +100 XP</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    minHeight: '65%',
    borderWidth: 1,
    borderColor: '#334155',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 208, 132, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    color: '#00D084',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  xpBadgeText: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '700',
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    backgroundColor: '#1E293B',
    borderRadius: 16,
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    color: '#F1F5F9',
    fontSize: 13,
    fontWeight: '600',
  },
  connectedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  connectedPillText: {
    color: '#00D084',
    fontSize: 10,
    fontWeight: '700',
  },
  accountInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    padding: 10,
    borderRadius: 8,
  },
  accountEmailText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
  },
  accountDescText: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
  },
  reconnectBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#334155',
    borderRadius: 6,
  },
  reconnectBtnText: {
    color: '#94A3B8',
    fontSize: 11,
  },
  connectPrompt: {
    marginTop: 4,
  },
  connectDesc: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 10,
  },
  connectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#00D084',
    paddingVertical: 10,
    borderRadius: 8,
  },
  connectBtnText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '700',
  },
  timeLimitText: {
    color: '#64748B',
    fontSize: 11,
  },
  recordTriggerBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    borderStyle: 'dashed',
  },
  recordIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  recordTriggerTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  recordTriggerSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    textAlign: 'center',
  },
  videoRecordedBox: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#059669',
  },
  videoInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoRecordedTitle: {
    color: '#00D084',
    fontSize: 12,
    fontWeight: '700',
  },
  videoMetaText: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  retakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#1E293B',
    borderRadius: 6,
  },
  retakeBtnText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 8,
  },
  starBtn: {
    padding: 2,
  },
  feedbackInput: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 10,
    color: '#F8FAFC',
    fontSize: 12,
    borderWidth: 1,
    borderColor: '#334155',
    textAlignVertical: 'top',
    marginTop: 6,
    minHeight: 65,
  },
  progressCard: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#059669',
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabelText: {
    color: '#00D084',
    fontSize: 11,
    fontWeight: '600',
  },
  progressPercentText: {
    color: '#00D084',
    fontSize: 11,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#0F172A',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#00D084',
    borderRadius: 3,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  submitBtn: {
    backgroundColor: '#00D084',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.5,
    backgroundColor: '#475569',
  },
  submittingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitBtnText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
  whatsAppBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#25D366',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginTop: 10,
    shadowColor: '#25D366',
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  whatsAppBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  connectPromptBox: {
    marginTop: 4,
  },
  connectPromptText: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 10,
  },
  connectDriveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#00D084',
    paddingVertical: 10,
    borderRadius: 8,
  },
  connectDriveBtnText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '700',
  },
  accountInfoBox: {
    backgroundColor: '#0F172A',
    padding: 10,
    borderRadius: 8,
  },
  accountSubText: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
  },
  previewBox: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#059669',
  },
  previewInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewMeta: {
    flex: 1,
  },
  previewTitleText: {
    color: '#00D084',
    fontSize: 12,
    fontWeight: '700',
  },
  previewSubText: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  deleteVideoBtn: {
    padding: 6,
    backgroundColor: '#1E293B',
    borderRadius: 6,
  },
  recordTriggerCard: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    borderStyle: 'dashed',
  },
});
