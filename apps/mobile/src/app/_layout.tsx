import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../providers/auth';
import { DriverProvider } from '../providers/driver';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { useFonts, Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';

import messaging from '@react-native-firebase/messaging';

const isExpoGo = Constants.appOwnership === 'expo';

// Register background handler
if (!isExpoGo) {
  try {
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Message handled in the background!', remoteMessage);
    });
  } catch(e) {
    console.warn("Could not setup background messaging", e);
  }
}

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
      const unsubscribe = messaging().onMessage(async remoteMessage => {
        console.log('A new FCM message arrived in foreground!', JSON.stringify(remoteMessage));
      });
      return unsubscribe;
    } catch (e) {
      console.warn("Could not setup foreground messaging", e);
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
