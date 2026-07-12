import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../providers/auth';
import { DriverProvider } from '../providers/driver';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { useFonts, Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';

const isExpoGo = Constants.appOwnership === 'expo';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

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

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <DriverProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ title: 'Login' }} />
          <Stack.Screen name="(tabs)" options={{ title: 'Trado' }} />
        </Stack>
      </DriverProvider>
    </AuthProvider>
  );
}
