"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Search, MapPin, Loader2, X } from "lucide-react";
import { useLoadScript } from "@react-google-maps/api";

const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = ["places"];

interface LocationOption {
  display_name: string;
  place_id: string;
  lat?: number;
  lng?: number;
}

interface LocationSearchProps {
  placeholder: string;
  value: string;
  onChange: (value: string, lat?: number, lng?: number) => void;
  iconBorderColor?: string;
  userLat?: number | null;
  userLng?: number | null;
}

export function LocationSearch({ 
  placeholder, 
  value, 
  onChange, 
  iconBorderColor = "border-emerald-500",
  userLat,
  userLng
}: LocationSearchProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<LocationOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);

  useEffect(() => {
    if (isLoaded && !autocompleteService.current) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
      // We need a dummy element for PlacesService to get details (lat/lng)
      placesService.current = new window.google.maps.places.PlacesService(document.createElement('div'));
    }
  }, [isLoaded]);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNearbyPlaces = () => {
    if (!isLoaded || !placesService.current || !userLat || !userLng) return;
    
    setLoading(true);
    
    const request = {
      location: new window.google.maps.LatLng(userLat, userLng),
      radius: 10000, // 10km
      type: 'point_of_interest'
    };

    placesService.current.nearbySearch(request, (results, status) => {
      setLoading(false);
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        const topResults = results.slice(0, 5).map(place => ({
          display_name: place.name || "",
          place_id: place.place_id || "",
          lat: place.geometry?.location?.lat(),
          lng: place.geometry?.location?.lng()
        }));
        setResults(topResults);
      }
    });
  };

  useEffect(() => {
    const fetchLocations = async () => {
      if (!isLoaded || !autocompleteService.current) return;

      if (!query || query === value || query.length < 2) {
        if (!query && userLat && userLng) {
          // If empty, show nearby popular places
          fetchNearbyPlaces();
        } else {
          setResults([]);
        }
        return;
      }

      setLoading(true);
      
      const request: google.maps.places.AutocompletionRequest = {
        input: query,
        componentRestrictions: { country: 'in' }, // Assuming India as per TransO references
      };

      // Bias towards user location if available
      if (userLat && userLng) {
        request.location = new window.google.maps.LatLng(userLat, userLng);
        request.radius = 50000; // 50km radius
      }

      autocompleteService.current.getPlacePredictions(request, (predictions, status) => {
        setLoading(false);
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          const parsedResults = predictions.map(p => ({
            display_name: p.description,
            place_id: p.place_id
          }));
          setResults(parsedResults);
          setShowDropdown(true);
        } else {
          setResults([]);
        }
      });
    };

    const debounceTimer = setTimeout(fetchLocations, 400);
    return () => clearTimeout(debounceTimer);
  }, [query, value, isLoaded, userLat, userLng]);

  const handleSelect = (option: LocationOption) => {
    const shortName = option.display_name.split(",").slice(0, 2).join(", ");
    setQuery(shortName);
    setShowDropdown(false);
    
    // If we already have lat/lng from nearbySearch, just use it
    if (option.lat && option.lng) {
      onChange(shortName, option.lat, option.lng);
      return;
    }

    // Otherwise fetch details via place_id
    if (placesService.current) {
      placesService.current.getDetails({ placeId: option.place_id }, (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
          onChange(shortName, place.geometry.location.lat(), place.geometry.location.lng());
        }
      });
    } else {
      onChange(shortName);
    }
  };

  const handleClear = () => {
    setQuery("");
    onChange("");
  };

  return (
    <div className="relative w-full z-20" ref={wrapperRef}>
      <div className="relative flex items-center gap-4">
        <div className={`z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-card border-[3px] ${iconBorderColor}`} />
        <div className="relative flex-1">
          <input
            className={`w-full rounded-xl border border-input bg-background py-3 pl-4 pr-10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500`}
            placeholder={loadError ? "Error loading Google Maps" : placeholder}
            value={query}
            disabled={!isLoaded || !!loadError}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!showDropdown) setShowDropdown(true);
            }}
            onFocus={() => {
              if (query === "" && userLat && userLng) fetchNearbyPlaces();
              setShowDropdown(true);
            }}
          />
          {query && (
            <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {showDropdown && (results.length > 0 || loading) && (
        <div className="absolute top-full left-10 right-0 mt-2 rounded-xl border border-border bg-card shadow-lg max-h-60 overflow-y-auto z-50">
          {loading ? (
            <div className="p-4 flex items-center justify-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span>Searching...</span>
            </div>
          ) : (
            <>
              {query === "" && results.length > 0 && (
                <div className="px-4 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider bg-slate-50 dark:bg-neutral-900 border-b border-border">
                  Nearby Places
                </div>
              )}
              <ul className="py-2">
                {results.map((result, idx) => (
                  <li
                    key={idx}
                    onClick={() => handleSelect(result)}
                    className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-neutral-800 cursor-pointer flex items-start gap-3 border-b border-border last:border-0 transition-colors"
                  >
                    <MapPin className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-foreground line-clamp-2">{result.display_name}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
