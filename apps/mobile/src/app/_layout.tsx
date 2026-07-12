import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../providers/auth';
import { ThemeProvider } from '../providers/theme';
import Constants from 'expo-constants';
import * as Device from 'expo-device';

const isExpoGo = Constants.appOwnership === 'expo';

export default function RootLayout() {
  useEffect(() => {
    if (isExpoGo) return;
    try {
      const Notifications = require('expo-notifications');
      const subscription = Notifications.addNotificationResponseReceivedListener((response: any) => {
        console.log("Notification tapped", response);
      });
      return () => subscription.remove();
    } catch (e) {
      console.warn("Could not setup notification listener", e);
    }
  }, []);

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ title: 'Login' }} />
        <Stack.Screen name="(tabs)" options={{ title: 'Trado' }} />
      </Stack>
    </AuthProvider>
  );
}
