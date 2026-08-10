'use client';
import React, { useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%'
};

// Default center (Coimbatore)
const defaultCenter = {
  lat: 11.0168,
  lng: 76.9558
};

interface MapProps {
  pickup: [number, number] | null;
  dropoff: [number, number] | null;
  setDropoff: (loc: [number, number]) => void;
  driverLocation?: [number, number] | null;
}

export default function GoogleRideMap({ pickup, dropoff, setDropoff, driverLocation }: MapProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  });

  const mapRef = useRef<google.maps.Map | null>(null);

  const center = pickup ? { lat: pickup[0], lng: pickup[1] } : defaultCenter;

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    if (pickup && dropoff) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend({ lat: pickup[0], lng: pickup[1] });
      bounds.extend({ lat: dropoff[0], lng: dropoff[1] });
      map.fitBounds(bounds);
    }
  }, [pickup, dropoff]);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  const onClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setDropoff([e.latLng.lat(), e.latLng.lng()]);
    }
  };

  // Whenever dropoff changes, if we have pickup, fit bounds
  React.useEffect(() => {
    if (mapRef.current && pickup && dropoff && window.google) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend({ lat: pickup[0], lng: pickup[1] });
      bounds.extend({ lat: dropoff[0], lng: dropoff[1] });
      mapRef.current.fitBounds(bounds, 50); // 50px padding
    } else if (mapRef.current && pickup && !dropoff) {
      mapRef.current.panTo({ lat: pickup[0], lng: pickup[1] });
      mapRef.current.setZoom(14);
    }
  }, [pickup, dropoff]);

  if (!isLoaded) {
    return (
      <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading Google Maps...</p>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={14}
      onLoad={onLoad}
      onUnmount={onUnmount}
      onClick={onClick}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
      }}
    >
      {pickup && (
        <Marker 
          position={{ lat: pickup[0], lng: pickup[1] }} 
          icon={{
            url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
          }}
        />
      )}
      {dropoff && (
        <Marker 
          position={{ lat: dropoff[0], lng: dropoff[1] }} 
          icon={{
            url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
          }}
        />
      )}
    </GoogleMap>
  );
}
