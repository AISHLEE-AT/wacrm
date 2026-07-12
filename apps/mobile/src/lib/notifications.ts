import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from '../../lib/supabase';
import messaging from '@react-native-firebase/messaging';

const isExpoGo = Constants.appOwnership === 'expo';

export async function registerForPushNotificationsAsync() {
  if (isExpoGo) {
    console.log('Push notifications are not supported in Expo Go. Please use a development build.');
    return null;
  }

  let token;

  if (Device.isDevice) {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log('Failed to get push token for push notification! User denied permission.');
        return;
      }

      // Get the FCM token
      token = await messaging().getToken();
      console.log('FCM Push Token:', token);

      // Save token to Supabase Auth user metadata
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Also ensure token is saved in drivers / profiles table if needed, but keeping in auth metadata is good too
        await supabase.auth.updateUser({
          data: { fcm_push_token: token }
        });
        
        // Let's also update profiles just in case
        await supabase
          .from('profiles')
          .update({ push_token: token })
          .eq('user_id', session.user.id);
      }
    } catch (e) {
      console.error('Push notification registration failed', e);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}
