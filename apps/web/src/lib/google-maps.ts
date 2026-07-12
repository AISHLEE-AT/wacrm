/**
 * Google Maps API Wrapper
 * Provides functions to interact with Google Maps APIs (Distance Matrix, Geocoding)
 * for the Ride-Hailing module.
 */

// Define types for coordinates and distance matrix responses
export interface LocationCoordinate {
  lat: number;
  lng: number;
}

export interface RideEstimate {
  distanceText: string;
  distanceMeters: number;
  durationText: string;
  durationSeconds: number;
}

/**
 * Get distance and ETA between pickup and dropoff locations
 */
export async function getRideEstimate(
  pickup: LocationCoordinate,
  dropoff: LocationCoordinate
): Promise<RideEstimate | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    console.warn("GOOGLE_MAPS_API_KEY is not set. Returning mock data.");
    // Return mock data for development if API key is missing
    return {
      distanceText: "5.5 km",
      distanceMeters: 5500,
      durationText: "15 mins",
      durationSeconds: 900,
    };
  }

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/distancematrix/json");
    url.searchParams.append("origins", `${pickup.lat},${pickup.lng}`);
    url.searchParams.append("destinations", `${dropoff.lat},${dropoff.lng}`);
    url.searchParams.append("key", apiKey);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status === "OK" && data.rows[0].elements[0].status === "OK") {
      const element = data.rows[0].elements[0];
      return {
        distanceText: element.distance.text,
        distanceMeters: element.distance.value,
        durationText: element.duration.text,
        durationSeconds: element.duration.value,
      };
    }
    
    console.error("Google Maps API returned error status:", data);
    return null;
  } catch (error) {
    console.error("Failed to fetch distance from Google Maps:", error);
    return null;
  }
}

/**
 * Reverse geocode a lat/lng to a readable address
 */
export async function reverseGeocode(location: LocationCoordinate): Promise<string> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    console.warn("GOOGLE_MAPS_API_KEY is not set. Returning mock address.");
    return `Lat: ${location.lat}, Lng: ${location.lng}`;
  }

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
    url.searchParams.append("latlng", `${location.lat},${location.lng}`);
    url.searchParams.append("key", apiKey);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status === "OK" && data.results.length > 0) {
      return data.results[0].formatted_address;
    }
    
    return `Lat: ${location.lat}, Lng: ${location.lng}`;
  } catch (error) {
    console.error("Failed to reverse geocode:", error);
    return `Lat: ${location.lat}, Lng: ${location.lng}`;
  }
}

/**
 * Calculate the estimated price based on vehicle type and estimate
 */
export function calculatePrice(
  estimate: RideEstimate,
  vehicle: { baseFare: number; perKmRate: number; perMinuteRate: number }
): number {
  const distanceKm = estimate.distanceMeters / 1000;
  const durationMins = estimate.durationSeconds / 60;
  
  const price = vehicle.baseFare + 
               (distanceKm * vehicle.perKmRate) + 
               (durationMins * vehicle.perMinuteRate);
               
  // Round to nearest whole number
  return Math.round(price);
}
