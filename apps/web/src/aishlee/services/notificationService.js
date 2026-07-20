import { supabase } from '../lib/supabaseClient';

export const notificationService = {
  // Create a new notification for a user
  async createNotification(userId, title, message) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([
        {
          user_id: userId,
          title,
          message,
          is_read: false
        }
      ])
      .select();

    if (error) {
      console.error('Error creating notification:', error);
      // We do not throw to prevent blocking the main approval flow
      return null;
    }
    return data[0];
  },

  // Fetch all notifications for the current user
  async getUserNotifications(userId) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
    return data;
  },

  // Mark a notification as read
  async markAsRead(notificationId) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  // Mark all as read
  async markAllAsRead(userId) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Error marking all as read:', error);
    }
  }
};
