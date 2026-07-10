import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../providers/auth';
import { ThemeProvider } from '../providers/theme';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

export default function RootLayout() {
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log("Notification tapped", response);
    });
    return () => subscription.remove();
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
