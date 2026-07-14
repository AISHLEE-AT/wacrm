"use client";

import { useEffect, useState } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "0.75rem",
};

interface MapProps {
  center: [number, number];
  zoom?: number;
  markers?: Array<{
    position: [number, number];
    title: string;
  }>;
}

export default function Map({ center, zoom = 13, markers = [] }: MapProps) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    if (map) {
      map.panTo({ lat: center[0], lng: center[1] });
      map.setZoom(zoom);
    }
  }, [center, zoom, map]);

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={{ lat: center[0], lng: center[1] }}
      zoom={zoom}
      onLoad={(map) => setMap(map)}
      onUnmount={() => setMap(null)}
      options={{
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      }}
    >
      {markers.map((marker, idx) => (
        <Marker
          key={idx}
          position={{ lat: marker.position[0], lng: marker.position[1] }}
          title={marker.title}
        />
      ))}
    </GoogleMap>
  ) : (
    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-muted-foreground animate-pulse rounded-xl">
      Loading Google Maps...
    </div>
  );
}
