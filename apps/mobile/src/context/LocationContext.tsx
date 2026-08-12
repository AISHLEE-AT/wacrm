// @ts-nocheck
import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import { AppContext } from './AppContext';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface LocationData {
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  district: string | null;
  state: string | null;
  pincode: string | null;
  country: string | null;
  street: string | null;
  fullAddress: string | null;
  locationString: string;
  isLoading: boolean;
  error: string | null;
}

interface LocationContextValue extends LocationData {
  refreshLocation: () => Promise<void>;
}

const DEFAULT_LOCATION: LocationData = {
  latitude: null,
  longitude: null,
  city: null,
  district: null,
  state: null,
  pincode: null,
  country: null,
  street: null,
  fullAddress: null,
  locationString: 'Detecting location...',
  isLoading: true,
  error: null,
};

export const LocationContext = createContext<LocationContextValue>({
  ...DEFAULT_LOCATION,
  refreshLocation: async () => {},
});

// ─── Helper: build display string from geocode parts ─────────────────────────
function buildLocationString(geo: Location.LocationGeocodedAddress): string {
  const parts: string[] = [];

  // City — expo returns this as 'city'
  if (geo.city) parts.push(geo.city);

  // District — expo returns this as 'subregion' (e.g. "Madurai", "Chennai")
  // Only add if different from city to avoid duplication
  if (geo.subregion && geo.subregion !== geo.city) parts.push(geo.subregion);

  // State — expo returns this as 'region'
  if (geo.region) parts.push(geo.region);

  // Country
  if (geo.country) parts.push(geo.country);

  return parts.length > 0 ? parts.join(', ') : 'Location unavailable';
}

// ─── Helper: build full address from geocode ─────────────────────────────────
function buildFullAddress(geo: Location.LocationGeocodedAddress): string {
  const parts: string[] = [];
  if (geo.name) parts.push(geo.name);
  if (geo.street) parts.push(geo.street);
  if (geo.city) parts.push(geo.city);
  if (geo.subregion && geo.subregion !== geo.city) parts.push(geo.subregion);
  if (geo.region) parts.push(geo.region);
  if (geo.postalCode) parts.push(geo.postalCode);
  if (geo.country) parts.push(geo.country);
  return parts.join(', ');
}

const PROFILE_UPDATE_URL = 'https://watscrm.vercel.app/api/profile/update';

// ─── Provider ────────────────────────────────────────────────────────────────
export const LocationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useContext(AppContext);
  const [locationData, setLocationData] = useState<LocationData>(DEFAULT_LOCATION);

  // ─── Core: detect current GPS + reverse geocode ───
  const detectLocation = useCallback(async (): Promise<LocationData> => {
    try {
      // Check permission first (don't request — that's done in onboarding)
      let { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        // Request permission if not already granted
        const permResult = await Location.requestForegroundPermissionsAsync();
        status = permResult.status;
      }
      if (status !== 'granted') {
        return {
          ...DEFAULT_LOCATION,
          isLoading: false,
          locationString: 'Location permission not granted',
          error: 'Permission denied',
        };
      }

      // Get current position
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = position.coords;

      // Reverse geocode
      const geocodeResults = await Location.reverseGeocodeAsync({ latitude, longitude });

      if (!geocodeResults || geocodeResults.length === 0) {
        return {
          latitude,
          longitude,
          city: null,
          district: null,
          state: null,
          pincode: null,
          country: null,
          street: null,
          fullAddress: null,
          locationString: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          isLoading: false,
          error: null,
        };
      }

      const geo = geocodeResults[0];

      const data: LocationData = {
        latitude,
        longitude,
        city: geo.city || null,
        district: geo.subregion || null,
        state: geo.region || null,
        pincode: geo.postalCode || null,
        country: geo.country || null,
        street: geo.street || null,
        fullAddress: buildFullAddress(geo),
        locationString: buildLocationString(geo),
        isLoading: false,
        error: null,
      };

      return data;
    } catch (err: any) {
      console.error('📍 Location detection error:', err);
      return {
        ...DEFAULT_LOCATION,
        isLoading: false,
        locationString: 'Could not detect location',
        error: err.message || 'Location detection failed',
      };
    }
  }, []);

  // ─── Save location to Supabase profile ───
  const saveLocationToProfile = useCallback(async (data: LocationData) => {
    try {
      const phone = await SecureStore.getItemAsync('user-phone');
      if (!phone) return;

      const payload: Record<string, any> = {
        phone,
        location: data.locationString,
      };

      // Include granular fields
      if (data.city) payload.city = data.city;
      if (data.district) payload.district = data.district;
      if (data.state) payload.state = data.state;
      if (data.pincode) payload.pincode = data.pincode;
      if (data.country) payload.country = data.country;
      if (data.latitude !== null) payload.latitude = data.latitude;
      if (data.longitude !== null) payload.longitude = data.longitude;

      await fetch(PROFILE_UPDATE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('📍 Location saved to profile:', data.locationString);
    } catch (err) {
      console.error('📍 Failed to save location to profile:', err);
    }
  }, []);

  // ─── Public refresh method ───
  const refreshLocation = useCallback(async () => {
    setLocationData(prev => ({ ...prev, isLoading: true, error: null }));
    const data = await detectLocation();
    setLocationData(data);

    // Auto-save to profile if we got a valid location
    if (data.latitude !== null && !data.error) {
      await saveLocationToProfile(data);
    }
  }, [detectLocation, saveLocationToProfile]);

  // ─── Auto-detect on every app launch (when user is logged in) ───
  useEffect(() => {
    if (user?.phone) {
      refreshLocation();
    }
  }, [user?.phone]);

  return (
    <LocationContext.Provider
      value={{
        ...locationData,
        refreshLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};
