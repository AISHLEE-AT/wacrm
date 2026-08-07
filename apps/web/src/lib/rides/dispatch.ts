// src/lib/rides/dispatch.ts

/**
 * Generates a random 4 digit OTP for ride security
 */
export function generateRideOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

/**
 * Calculates Haversine distance between two coordinates in kilometers
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180)
}

/**
 * Basic pricing logic based on vehicle type and distance.
 * This can be expanded to fetch real rates from the `vehicles` table in Supabase.
 */
export function calculateEstimatedPrice(distanceKm: number, vehicleType: 'bike' | 'auto' | 'cab'): number {
  let baseFare = 0
  let perKm = 0
  
  switch(vehicleType) {
    case 'bike':
      baseFare = 20; perKm = 8; break;
    case 'auto':
      baseFare = 40; perKm = 15; break;
    case 'cab':
      baseFare = 80; perKm = 25; break;
    default:
      baseFare = 30; perKm = 12;
  }
  
  return Math.round(baseFare + (distanceKm * perKm))
}
