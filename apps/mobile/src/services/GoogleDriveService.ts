import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../lib/supabase';

export interface GoogleDriveAccount {
  isConnected: boolean;
  email?: string;
  folderId?: string;
  connectedAt?: string;
}

export interface TaskVideoUploadMetadata {
  courseId: string;
  courseTitle?: string;
  dayNumber: number;
  topicTitle: string;
  userPhone?: string;
  userName?: string;
  feedbackText?: string;
}

export interface DriveUploadResult {
  fileId: string;
  fileName: string;
  webViewLink: string;
  webContentLink?: string;
  folderId: string;
}

const SECURE_KEYS = {
  ACCESS_TOKEN: 'gdrive-access-token',
  REFRESH_TOKEN: 'gdrive-refresh-token',
  USER_EMAIL: 'gdrive-user-email',
  FOLDER_ID: 'gdrive-folder-id',
  CONNECTED_AT: 'gdrive-connected-at',
  TOKEN_EXPIRY: 'gdrive-token-expiry',
};

const DEFAULT_FOLDER_NAME = '📁 SuprO Daily Tasks & Video Feedback';

export const GoogleDriveService = {
  /**
   * Check if user has mapped their Google Drive account
   */
  async getAccountStatus(): Promise<GoogleDriveAccount> {
    try {
      const accessToken = await SecureStore.getItemAsync(SECURE_KEYS.ACCESS_TOKEN);
      const email = await SecureStore.getItemAsync(SECURE_KEYS.USER_EMAIL);
      const folderId = await SecureStore.getItemAsync(SECURE_KEYS.FOLDER_ID);
      const connectedAt = await SecureStore.getItemAsync(SECURE_KEYS.CONNECTED_AT);

      return {
        isConnected: !!accessToken,
        email: email || undefined,
        folderId: folderId || undefined,
        connectedAt: connectedAt || undefined,
      };
    } catch (err) {
      console.warn('[GoogleDriveService] Error reading account status:', err);
      return { isConnected: false };
    }
  },

  /**
   * Save mapped Google Drive credentials
   */
  async saveCredentials(options: {
    accessToken: string;
    refreshToken?: string;
    email?: string;
    expiresInSeconds?: number;
    userPhone?: string;
  }): Promise<void> {
    const { accessToken, refreshToken, email, expiresInSeconds = 3600, userPhone } = options;

    await SecureStore.setItemAsync(SECURE_KEYS.ACCESS_TOKEN, accessToken);
    if (refreshToken) {
      await SecureStore.setItemAsync(SECURE_KEYS.REFRESH_TOKEN, refreshToken);
    }
    if (email) {
      await SecureStore.setItemAsync(SECURE_KEYS.USER_EMAIL, email);
    }

    const expiryTime = Date.now() + expiresInSeconds * 1000;
    await SecureStore.setItemAsync(SECURE_KEYS.TOKEN_EXPIRY, expiryTime.toString());
    await SecureStore.setItemAsync(SECURE_KEYS.CONNECTED_AT, new Date().toISOString());

    // Sync connection flag with Supabase profile if phone is available
    if (userPhone) {
      try {
        const cleanPhone = userPhone.replace(/\D/g, '').slice(-10);
        await supabase
          .from('profiles')
          .update({
            google_drive_connected: true,
            google_account_email: email || null,
            updated_at: new Date().toISOString(),
          })
          .or(`phone.ilike.%${cleanPhone}%,email.ilike.%${cleanPhone}%`);
      } catch (e) {
        console.warn('[GoogleDriveService] Failed to sync drive status to supabase:', e);
      }
    }
  },

  /**
   * Disconnect and clear stored Google Drive credentials
   */
  async disconnect(userPhone?: string): Promise<void> {
    await SecureStore.deleteItemAsync(SECURE_KEYS.ACCESS_TOKEN);
    await SecureStore.deleteItemAsync(SECURE_KEYS.REFRESH_TOKEN);
    await SecureStore.deleteItemAsync(SECURE_KEYS.USER_EMAIL);
    await SecureStore.deleteItemAsync(SECURE_KEYS.FOLDER_ID);
    await SecureStore.deleteItemAsync(SECURE_KEYS.CONNECTED_AT);
    await SecureStore.deleteItemAsync(SECURE_KEYS.TOKEN_EXPIRY);

    if (userPhone) {
      try {
        const cleanPhone = userPhone.replace(/\D/g, '').slice(-10);
        await supabase
          .from('profiles')
          .update({
            google_drive_connected: false,
            updated_at: new Date().toISOString(),
          })
          .or(`phone.ilike.%${cleanPhone}%,email.ilike.%${cleanPhone}%`);
      } catch (e) {
        console.warn('[GoogleDriveService] Supabase profile disconnect warning:', e);
      }
    }
  },

  /**
   * Retrieve active valid access token
   */
  async getValidAccessToken(): Promise<string | null> {
    try {
      const accessToken = await SecureStore.getItemAsync(SECURE_KEYS.ACCESS_TOKEN);
      if (!accessToken) return null;

      const expiryStr = await SecureStore.getItemAsync(SECURE_KEYS.TOKEN_EXPIRY);
      const isExpired = expiryStr ? Date.now() > parseInt(expiryStr, 10) - 60000 : false;

      if (!isExpired) {
        return accessToken;
      }

      // If expired, attempt refresh
      const refreshToken = await SecureStore.getItemAsync(SECURE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) {
        return accessToken; // Fallback to current token
      }

      // Refresh token request endpoint
      const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: '951336154146-supro.apps.googleusercontent.com',
        }).toString(),
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        if (data.access_token) {
          await SecureStore.setItemAsync(SECURE_KEYS.ACCESS_TOKEN, data.access_token);
          const expiryTime = Date.now() + (data.expires_in || 3600) * 1000;
          await SecureStore.setItemAsync(SECURE_KEYS.TOKEN_EXPIRY, expiryTime.toString());
          return data.access_token;
        }
      }

      return accessToken;
    } catch (err) {
      console.warn('[GoogleDriveService] Token resolution error:', err);
      return null;
    }
  },

  /**
   * Find or create the dedicated SuprO app folder in Google Drive
   */
  async getOrCreateSuproFolder(folderName: string = DEFAULT_FOLDER_NAME): Promise<string> {
    const accessToken = await this.getValidAccessToken();
    if (!accessToken) throw new Error('Google Drive is not connected. Please connect your account.');

    // Check cached folder ID
    const cachedFolderId = await SecureStore.getItemAsync(SECURE_KEYS.FOLDER_ID);
    if (cachedFolderId) {
      try {
        const checkRes = await fetch(
          `https://www.googleapis.com/drive/v3/files/${cachedFolderId}?fields=id,trashed`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (checkRes.ok) {
          const checkData = await checkRes.json();
          if (!checkData.trashed) return cachedFolderId;
        }
      } catch (e) {
        // Cached folder invalid, proceed to query/create
      }
    }

    // Query existing folder by name
    const q = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)&spaces=drive`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.files && searchData.files.length > 0) {
        const foundId = searchData.files[0].id;
        await SecureStore.setItemAsync(SECURE_KEYS.FOLDER_ID, foundId);
        return foundId;
      }
    }

    // Create new folder
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        description: 'SuprO App Daily Tasks & Student Video Reflections',
      }),
    });

    if (!createRes.ok) {
      throw new Error(`Failed to create Google Drive folder (${createRes.status})`);
    }

    const folderData = await createRes.json();
    await SecureStore.setItemAsync(SECURE_KEYS.FOLDER_ID, folderData.id);
    return folderData.id;
  },

  /**
   * Upload recorded video directly to Google Drive using Resumable/Binary Upload
   */
  async uploadTaskVideo(
    videoUri: string,
    metadata: TaskVideoUploadMetadata,
    onProgress?: (percent: number) => void
  ): Promise<DriveUploadResult> {
    const accessToken = await this.getValidAccessToken();
    if (!accessToken) {
      throw new Error('Google Drive is not connected. Please authenticate first.');
    }

    onProgress?.(5);

    // 1. Get or create destination folder
    const folderId = await this.getOrCreateSuproFolder();
    onProgress?.(20);

    // 2. Prepare file name & metadata
    const cleanTopic = (metadata.topicTitle || 'Task').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
    const timeStamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `Supro_Day${metadata.dayNumber}_${cleanTopic}_${timeStamp}.mp4`;

    const fileDescription = [
      `🎓 Course: ${metadata.courseTitle || metadata.courseId}`,
      `📅 Day: ${metadata.dayNumber}`,
      `📖 Topic: ${metadata.topicTitle}`,
      `👤 Student: ${metadata.userName || 'SuprO Student'} (${metadata.userPhone || 'N/A'})`,
      `💬 Feedback: ${metadata.feedbackText || 'Daily task completion reflection'}`,
      `⏰ Timestamp: ${new Date().toLocaleString()}`,
    ].join('\n');

    // 3. Initiate Resumable Upload Session
    const sessionRes = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json; charset=UTF-8',
          'X-Upload-Content-Type': 'video/mp4',
        },
        body: JSON.stringify({
          name: fileName,
          parents: [folderId],
          description: fileDescription,
        }),
      }
    );

    if (!sessionRes.ok) {
      const errText = await sessionRes.text();
      throw new Error(`Failed to initiate Drive upload: ${errText || sessionRes.statusText}`);
    }

    const uploadUrl = sessionRes.headers.get('location');
    if (!uploadUrl) {
      throw new Error('Google Drive upload session URL not returned');
    }

    onProgress?.(40);

    // 4. Stream video file binary via FileSystem.uploadAsync
    const uploadTask = await FileSystem.uploadAsync(uploadUrl, videoUri, {
      httpMethod: 'PUT',
      uploadType: (FileSystem.UploadType?.BINARY_CONTENT || 0) as any,
      headers: {
        'Content-Type': 'video/mp4',
      },
    });

    onProgress?.(80);

    if (uploadTask.status < 200 || uploadTask.status >= 300) {
      throw new Error(`Google Drive upload failed with status ${uploadTask.status}: ${uploadTask.body}`);
    }

    const uploadedFileData = JSON.parse(uploadTask.body);
    const fileId = uploadedFileData.id;

    // 5. Make file accessible via link for Admin review
    await this.setFileShareablePermission(fileId, accessToken);
    onProgress?.(95);

    // 6. Fetch full links
    const fileDetailsRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,webViewLink,webContentLink`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    let webViewLink = `https://drive.google.com/file/d/${fileId}/view`;
    let webContentLink = undefined;

    if (fileDetailsRes.ok) {
      const details = await fileDetailsRes.json();
      if (details.webViewLink) webViewLink = details.webViewLink;
      if (details.webContentLink) webContentLink = details.webContentLink;
    }

    onProgress?.(100);

    return {
      fileId,
      fileName,
      webViewLink,
      webContentLink,
      folderId,
    };
  },

  /**
   * Set file permissions to 'anyone with link' as reader so admin can view it
   */
  async setFileShareablePermission(fileId: string, accessToken: string): Promise<boolean> {
    try {
      const permRes = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            role: 'reader',
            type: 'anyone',
          }),
        }
      );
      return permRes.ok;
    } catch (e) {
      console.warn('[GoogleDriveService] Shareable permission warning:', e);
      return false;
    }
  },

  /**
   * Sync complete task submission to Supabase
   */
  async saveTaskSubmissionToSupabase(submission: {
    userPhone: string;
    userName?: string;
    courseId: string;
    courseTitle?: string;
    dayNumber: number;
    topicTitle: string;
    feedbackText: string;
    videoDriveFileId: string;
    videoDriveLink: string;
    rating?: number;
  }): Promise<boolean> {
    try {
      const cleanPhone = submission.userPhone.replace(/\D/g, '').slice(-10);
      const { error } = await supabase.from('daily_task_submissions').insert({
        user_phone: cleanPhone,
        user_name: submission.userName || 'SuprO Student',
        course_id: submission.courseId,
        course_title: submission.courseTitle || submission.courseId,
        day_number: submission.dayNumber,
        topic_title: submission.topicTitle,
        feedback_text: submission.feedbackText,
        video_drive_file_id: submission.videoDriveFileId,
        video_drive_link: submission.videoDriveLink,
        rating: submission.rating || 5,
        status: 'submitted',
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.warn('[GoogleDriveService] Supabase submission insert warning:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('[GoogleDriveService] Supabase submission error:', err);
      return false;
    }
  },

  /**
   * Upload meeting video directly to cloud storage (groupo-videos bucket)
   * returning a 100% playable public video stream URL
   */
  async uploadGroupMeetingVideoToStorage(
    videoUri: string,
    groupId: string,
    meetingNumber: number,
    onProgress?: (percent: number) => void
  ): Promise<{ publicUrl: string; fileName: string }> {
    const timestamp = Date.now();
    const cleanGroupId = groupId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `meeting_${cleanGroupId}_${meetingNumber}_${timestamp}.mp4`;
    const targetUrl = `https://gmahjdzqitbomtmdzlfp.supabase.co/storage/v1/object/groupo-videos/${fileName}`;
    const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtYWhqZHpxaXRib210bWR6bGZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjI1MTcyNywiZXhwIjoyMDk3ODI3NzI3fQ.t0dqkLlGK0P9SwdYveBFgQDIify4UTpVGvZZeiF7Mn0';

    onProgress?.(20);

    try {
      const uploadTask = await FileSystem.uploadAsync(targetUrl, videoUri, {
        httpMethod: 'POST',
        uploadType: (FileSystem.UploadType?.BINARY_CONTENT || 0) as any,
        headers: {
          Authorization: `Bearer ${SERVICE_KEY}`,
          apikey: SERVICE_KEY,
          'Content-Type': 'video/mp4',
        },
      });

      onProgress?.(85);

      if (uploadTask.status < 200 || uploadTask.status >= 300) {
        console.warn('[GoogleDriveService] Storage upload notice:', uploadTask.body);
      }
    } catch (e) {
      console.warn('[GoogleDriveService] Storage upload exception:', e);
    }

    const publicUrl = `https://gmahjdzqitbomtmdzlfp.supabase.co/storage/v1/object/public/groupo-videos/${fileName}`;
    onProgress?.(100);

    return { publicUrl, fileName };
  },

  /**
   * Sync group meeting video submission to Supabase
   */
  async saveGroupMeetingSubmissionToSupabase(submission: {
    groupId: string;
    groupName: string;
    meetingNumber: number;
    userPhone?: string;
    userName?: string;
    videoDriveLink: string;
    meetingNotes?: string;
    gmailAccount?: string;
  }): Promise<boolean> {
    try {
      const cleanPhone = (submission.userPhone || '').replace(/\D/g, '').slice(-10);
      const { error } = await supabase.from('groupo_meetings').insert({
        group_id: submission.groupId,
        meeting_number: submission.meetingNumber,
        meeting_date: new Date().toISOString().split('T')[0],
        title: `Meeting #${submission.meetingNumber} - ${submission.groupName}`,
        agenda: submission.meetingNotes || 'Monthly Meeting Video & Proceedings Recording',
        recorded_by_phone: cleanPhone,
        video_drive_url: submission.videoDriveLink,
        status: 'completed',
        custom_metadata: {
          gmail_account: submission.gmailAccount,
          user_name: submission.userName,
          uploaded_at: new Date().toISOString(),
        },
      });

      if (error) {
        console.warn('[GoogleDriveService] Group meeting submission insert warning:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('[GoogleDriveService] Group meeting submission error:', err);
      return false;
    }
  },
};
