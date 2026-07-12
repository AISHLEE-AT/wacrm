import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from './auth';
import * as Location from 'expo-location';

type DriverState = {
  driverId: string | null;
  status: 'offline' | 'online' | 'busy';
  walletBalance: number;
  commissionRate: number;
  currentLat: number | null;
  currentLng: number | null;
  activeRide: any | null;
};

type DriverContextType = DriverState & {
  toggleStatus: () => Promise<void>;
  acceptRide: (rideId: string) => Promise<void>;
  completeRide: (rideId: string) => Promise<void>;
  loading: boolean;
};

const DriverContext = createContext<DriverContextType | null>(null);

export function DriverProvider({ children }: { children: React.ReactNode }) {
  const { session, accountRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<DriverState>({
    driverId: null,
    status: 'offline',
    walletBalance: 0,
    commissionRate: 5,
    currentLat: null,
    currentLng: null,
    activeRide: null,
  });

  const loadDriverProfile = async () => {
    if (!session?.user?.id) return;
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
        
      if (data) {
        setState(prev => ({
          ...prev,
          driverId: data.id,
          status: data.status,
          walletBalance: data.wallet_balance,
          commissionRate: data.commission_rate,
          currentLat: data.current_lat,
          currentLng: data.current_lng,
        }));
      }
    } catch (e) {
      console.log('Driver profile not found or error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDriverProfile();
  }, [session]);

  // Location Tracking Effect
  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;

    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10,
        },
        async (location) => {
          setState(prev => ({
            ...prev,
            currentLat: location.coords.latitude,
            currentLng: location.coords.longitude,
          }));

          if (state.driverId && state.status === 'online') {
            await supabase.from('drivers').update({
              current_lat: location.coords.latitude,
              current_lng: location.coords.longitude,
              last_location_update: new Date().toISOString(),
            }).eq('id', state.driverId);
          }
        }
      );
    };

    if (state.status === 'online' || state.status === 'busy') {
      startTracking();
    }

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [state.status, state.driverId]);

  const toggleStatus = async () => {
    if (!state.driverId) return;
    const newStatus = state.status === 'offline' ? 'online' : 'offline';
    const { error } = await supabase
      .from('drivers')
      .update({ status: newStatus })
      .eq('id', state.driverId);
    
    if (!error) {
      setState(prev => ({ ...prev, status: newStatus }));
    }
  };

  const acceptRide = async (rideId: string) => {
    if (!state.driverId) return;
    const { error } = await supabase
      .from('rides')
      .update({ status: 'en_route', driver_id: state.driverId })
      .eq('id', rideId)
      .eq('status', 'pending'); // Ensure it wasn't taken

    if (!error) {
      setState(prev => ({ ...prev, status: 'busy' }));
      await supabase.from('drivers').update({ status: 'busy' }).eq('id', state.driverId);
    }
  };

  const completeRide = async (rideId: string) => {
    if (!state.driverId) return;
    const { error } = await supabase
      .from('rides')
      .update({ status: 'completed' })
      .eq('id', rideId);

    if (!error) {
      setState(prev => ({ ...prev, status: 'online', activeRide: null }));
      await supabase.from('drivers').update({ status: 'online' }).eq('id', state.driverId);
      // Would also trigger wallet update here via RPC in a real app
    }
  };

  return (
    <DriverContext.Provider value={{ ...state, toggleStatus, acceptRide, completeRide, loading }}>
      {children}
    </DriverContext.Provider>
  );
}

export const useDriver = () => {
  const context = useContext(DriverContext);
  if (!context) throw new Error('useDriver must be used within DriverProvider');
  return context;
};
