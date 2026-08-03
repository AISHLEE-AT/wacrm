import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';

export const NotificationService = {
  registerForPushNotificationsAsync: async (): Promise<string | null> => {
    console.log("Push notifications are disabled in Expo Go SDK 53+. Returning dummy token.");
    return "dummy-expo-token-for-dev";
  },

  sendTestNotification: async (token: string) => {
    Alert.alert('Push Notifications', 'Expo Go SDK 53+ does not support Push Notifications natively. Use a Development Build to test this feature.');
  }
};
