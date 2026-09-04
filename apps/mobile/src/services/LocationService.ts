import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import { ENV } from '../config/env';

const API_URL = ENV.API_URL;

let _trackingInterval: ReturnType<typeof setInterval> | null = null;

const sendLocationToServer = async (lat: number, lng: number) => {
  try {
    const phone = await SecureStore.getItemAsync('user-phone');
    if (!phone) return;

    await fetch(`${API_URL}/api/drivers/location`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, lat, lng, timestamp: new Date().toISOString() }),
    });
    console.log(`📍 Location sent: ${lat}, ${lng}`);
  } catch (err) {
    console.error('Failed to send location', err);
  }
};

export const LocationService = {
  requestPermissionsAndStart: async () => {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus !== 'granted') {
      console.log('Permission to access location was denied');
      return false;
    }

    // Foreground polling every 15 seconds
    _trackingInterval = setInterval(async () => {
      try {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        await sendLocationToServer(loc.coords.latitude, loc.coords.longitude);
      } catch (e) {
        console.error('Location poll error:', e);
      }
    }, 15000);

    return true;
  },

  stopTracking: async () => {
    if (_trackingInterval) {
      clearInterval(_trackingInterval);
      _trackingInterval = null;
    }
  },
};
