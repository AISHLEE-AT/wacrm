import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '@wacrm/shared/config';

const LOCATION_TASK_NAME = 'background-location-task';

// Define the background task
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Location Tracking Error:', error);
    return;
  }
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    const latestLocation = locations[0];
    
    if (latestLocation) {
      await sendLocationToServer(latestLocation.coords.latitude, latestLocation.coords.longitude);
    }
  }
});

const sendLocationToServer = async (lat: number, lng: number) => {
  try {
    const phone = await SecureStore.getItemAsync('user-phone');
    if (!phone) return;

    // Send the background GPS ping to your Next.js API
    await fetch(`${API_URL}/api/driver/location`, {
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
    // 1. Request Foreground Permissions
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus !== 'granted') {
      console.log('Permission to access location was denied');
      return false;
    }

    // 2. Request Background Permissions (crucial for drivers)
    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== 'granted') {
      console.log('Permission to access background location was denied');
      // We can still do foreground tracking if we want, but background is preferred
    }

    // 3. Start Background Tracking
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 15000, // Ping every 15 seconds
      distanceInterval: 10, // Or every 10 meters
      deferredUpdatesInterval: 15000,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: 'SuprO is active',
        notificationBody: 'Your location is being tracked for rides.',
        notificationColor: '#10b981',
      },
    });

    return true;
  },

  stopTracking: async () => {
    const hasTask = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
    if (hasTask) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    }
  }
};
