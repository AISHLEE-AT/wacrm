'use client'
import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icons in Leaflet with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
})

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapProps {
  pickup: [number, number] | null
  dropoff: [number, number] | null
  setDropoff: (loc: [number, number]) => void
}

function LocationMarker({ pickup, dropoff, setDropoff }: MapProps) {
  const map = useMap()
  
  useEffect(() => {
    if (pickup) {
      map.flyTo(pickup, 14)
    }
  }, [pickup, map])

  useMapEvents({
    click(e) {
      setDropoff([e.latlng.lat, e.latlng.lng])
    },
  })

  return (
    <>
      {pickup && <Marker position={pickup} />}
      {dropoff && <Marker position={dropoff} icon={redIcon} />}
    </>
  )
}

export default function RideMap({ pickup, dropoff, setDropoff }: MapProps) {
  // Default to somewhere central if no pickup yet
  const center: [number, number] = pickup || [11.0168, 76.9558] // Default Coimbatore

  return (
    <MapContainer 
      center={center} 
      zoom={13} 
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
      />
      <LocationMarker pickup={pickup} dropoff={dropoff} setDropoff={setDropoff} />
    </MapContainer>
  )
}
