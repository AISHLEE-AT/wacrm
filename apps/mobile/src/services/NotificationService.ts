import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';

// Configure how notifications behave when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const NotificationService = {
  registerForPushNotificationsAsync: async (): Promise<string | null> => {
    let token = null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#10b981',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        Alert.alert('Permission Denied', 'Failed to get push token for push notification!');
        return null;
      }
      
      // Get the token that uniquely identifies this device
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: "supro-mobile-dev" // In a real Expo project, this would be auto-filled or in app.json
      })).data;
      
      console.log('Expo Push Token:', token);
    } else {
      Alert.alert('Simulators Unsupported', 'Must use physical device for Push Notifications');
    }

    return token;
  },

  sendTestNotification: async (token: string) => {
    // We send a direct request to Expo's push API for testing the bridge
    const message = {
      to: token,
      sound: 'default',
      title: 'Supra WACRM Alert 🚀',
      body: 'Your Expo Push Notifications are working perfectly!',
      data: { someData: 'goes here' },
    };

    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
  }
};
