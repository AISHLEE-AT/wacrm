'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '@/aishlee/context/AppProvider';
import { GoogleMap, useLoadScript, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { MapPin, Navigation, Package, CheckCircle, Clock, ShieldAlert, Power } from 'lucide-react';
import { supabase } from '@/aishlee/lib/supabaseClient';

const libraries: any = ['places'];
const mapContainerStyle = { width: '100%', height: '100%', borderRadius: '12px' };
const defaultCenter = { lat: 11.1271, lng: 78.6569 }; // TN Center

export default function RideODashboard() {
  const { currentUser } = useApp();
  const [isOnline, setIsOnline] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(defaultCenter);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [activeDelivery, setActiveDelivery] = useState<any>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  // Cost Optimization: Debounced Location Updates (every 60s max)
  const UPDATE_INTERVAL = 60000;

  const updateLocationOnServer = async (lat: number, lng: number) => {
    if (!currentUser) return;
    try {
      await supabase.from('profiles').update({
        latitude: lat,
        longitude: lng,
        updated_at: new Date().toISOString()
      }).eq('id', currentUser.id);
    } catch (e) {
      console.error('Failed to update location', e);
    }
  };

  const handlePositionSuccess = useCallback((position: GeolocationPosition) => {
    const { latitude, longitude } = position.coords;
    setCurrentLocation({ lat: latitude, lng: longitude });

    const now = Date.now();
    // Cost-cutting: Only update backend every 60 seconds unless active delivery is very close
    if (now - lastUpdateRef.current > UPDATE_INTERVAL) {
      updateLocationOnServer(latitude, longitude);
      lastUpdateRef.current = now;
    }
  }, [currentUser]);

  useEffect(() => {
    if (isOnline) {
      if (navigator.geolocation) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          handlePositionSuccess,
          (err) => console.error(err),
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );
      }
    } else {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    }
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [isOnline, handlePositionSuccess]);

  const toggleOnline = () => {
    setIsOnline(!isOnline);
  };

  if (!currentUser || (currentUser.role !== 'Rider' && currentUser.role !== 'Admin' && currentUser.role !== 'Super Admin')) {
    return (
      <div className="fade-in" style={{ padding: '40px', textAlign: 'center', color: 'white' }}>
        <ShieldAlert size={48} style={{ margin: '0 auto', color: 'var(--tech-cyan)' }} />
        <h2>Access Denied</h2>
        <p>This module is optimized and restricted to Rider accounts.</p>
      </div>
    );
  }

  if (loadError) return <div>Error loading maps</div>;

  return (
    <div className="fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="gradient-text-teal" style={{ fontSize: '28px', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Navigation size={28} /> RideO Dashboard
          </h1>
          <p className="text-muted" style={{ margin: '4px 0 0 0' }}>Cost-Optimized Delivery Partner Portal</p>
        </div>
        
        <button 
          onClick={toggleOnline}
          className="btn-primary" 
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            background: isOnline ? 'var(--tech-cyan)' : '#374151', 
            color: isOnline ? 'black' : 'white',
            padding: '12px 24px', borderRadius: '30px'
          }}
        >
          <Power size={20} />
          {isOnline ? 'Go Offline' : 'Go Online'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {/* Map View */}
        <div className="glass-panel" style={{ height: '500px', padding: '12px', position: 'relative' }}>
          {isOnline ? (
            isLoaded ? (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                zoom={14}
                center={currentLocation}
                options={{
                  disableDefaultUI: true,
                  zoomControl: true,
                  styles: [ { elementType: "geometry", stylers: [{ color: "#242f3e" }] }, { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] }, { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] } ]
                }}
              >
                <Marker 
                  position={currentLocation} 
                  icon={{
                    path: 'M29.395,0H17.636c-3.117,0-5.643,2.526-5.643,5.643v9.76c0,3.117,2.526,5.643,5.643,5.643h11.759 c3.117,0,5.643-2.526,5.643-5.643v-9.76C35.038,2.526,32.512,0,29.395,0z M34.05,14.127H12.982v-2.775h21.068V14.127z',
                    fillColor: '#00F0FF',
                    fillOpacity: 1,
                    scale: 1,
                  }} 
                />
              </GoogleMap>
            ) : <div style={{ color: 'white' }}>Loading map...</div>
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', borderRadius: '12px' }}>
              <Power size={48} color="var(--cool-gray)" />
              <p style={{ color: 'var(--cool-gray)', marginTop: '16px' }}>You are currently offline</p>
            </div>
          )}
        </div>

        {/* Active Deliveries */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h2 style={{ color: 'white', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={20} color="var(--tech-cyan)" /> 
              Active Tasks
            </h2>
            {deliveries.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--cool-gray)', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                {isOnline ? 'Waiting for new orders...' : 'Go online to receive orders'}
              </div>
            ) : (
              <div>
                {/* Map deliveries here */}
              </div>
            )}
          </div>

          <div className="glass-panel" style={{ padding: '24px', background: 'rgba(234, 179, 8, 0.1)' }}>
            <h3 style={{ color: 'var(--tech-gold)', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={18} /> Cost Optimization Active
            </h3>
            <p style={{ color: 'var(--cool-gray)', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>
              Location polling is debounced to 1 minute to conserve battery and minimize API costs.
              Static maps will be utilized in customer-facing order history.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
