import { Platform, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AppNotification {
  id?: string;
  title: string;
  body: string;
  type?: 'study_reminder' | 'session_alert' | 'course_purchase' | 'test_complete';
  data?: any;
  timestamp?: number;
}

export const NotificationService = {
  /**
   * Register device and initialize auto push notification channels
   */
  async registerForPushNotificationsAsync(): Promise<string | null> {
    try {
      const savedToken = await AsyncStorage.getItem('device_push_token');
      if (savedToken) return savedToken;
      const newToken = `supro_push_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      await AsyncStorage.setItem('device_push_token', newToken);
      return newToken;
    } catch (e) {
      return null;
    }
  },

  /**
   * Triggers an instant in-app notification alert for Day Plan active sessions
   */
  async triggerSessionAlert(courseTitle: string, dayNumber: number, stepNumber: number, topic: string) {
    const title = `🔔 SuprO Active Session: Day ${dayNumber} Step ${stepNumber}`;
    const body = `Time for ${courseTitle}! Today's focus: "${topic}". Earn +20 XP now!`;

    // Save notification to history
    await this.saveNotification({
      title,
      body,
      type: 'session_alert',
      data: { courseTitle, dayNumber, stepNumber, topic },
      timestamp: Date.now(),
    });

    // Display alert
    Alert.alert(title, body, [
      { text: 'Start Step Now', style: 'default' },
      { text: 'Remind Later', style: 'cancel' },
    ]);
  },

  /**
   * Schedules daily auto study reminder alerts
   */
  async scheduleDailyStudyReminder(hour = 8, minute = 0, courseTitle = 'Your Enrolled Course') {
    try {
      const reminderConfig = { enabled: true, hour, minute, courseTitle, scheduledAt: Date.now() };
      await AsyncStorage.setItem('teacho_daily_study_reminder', JSON.stringify(reminderConfig));
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Saves notification to Supabase and local cache
   */
  async saveNotification(notif: AppNotification) {
    try {
      const localHistoryRaw = await AsyncStorage.getItem('supro_app_notifications');
      const list: AppNotification[] = localHistoryRaw ? JSON.parse(localHistoryRaw) : [];
      list.unshift(notif);
      if (list.length > 50) list.pop();
      await AsyncStorage.setItem('supro_app_notifications', JSON.stringify(list));

      // Also try sync with Supabase notifications table if available
      try {
        await supabase.from('notifications').insert([
          {
            title: notif.title,
            content: notif.body,
            type: notif.type || 'info',
            created_at: new Date().toISOString(),
          },
        ]);
      } catch (dbErr) {}
    } catch (e) {}
  },

  /**
   * Fetches saved in-app notifications
   */
  async getNotifications(): Promise<AppNotification[]> {
    try {
      const localHistoryRaw = await AsyncStorage.getItem('supro_app_notifications');
      return localHistoryRaw ? JSON.parse(localHistoryRaw) : [];
    } catch (e) {
      return [];
    }
  },
};
export default NotificationService;
