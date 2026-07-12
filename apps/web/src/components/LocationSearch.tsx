"use client";

import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Loader2, X } from "lucide-react";

interface LocationOption {
  display_name: string;
  lat: string;
  lon: string;
}

interface LocationSearchProps {
  placeholder: string;
  value: string;
  onChange: (value: string, lat?: number, lng?: number) => void;
  iconBorderColor?: string;
}

export function LocationSearch({ placeholder, value, onChange, iconBorderColor = "border-emerald-500" }: LocationSearchProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<LocationOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const fetchLocations = async () => {
      if (!query || query === value || query.length < 3) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`, {
          headers: {
            "Accept-Language": "en-US,en;q=0.9"
          }
        });
        const data = await response.json();
        setResults(data);
        setShowDropdown(true);
      } catch (error) {
        console.error("Error fetching locations", error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchLocations, 500);
    return () => clearTimeout(debounceTimer);
  }, [query, value]);

  const handleSelect = (option: LocationOption) => {
    const shortName = option.display_name.split(",").slice(0, 3).join(", ");
    setQuery(shortName);
    onChange(shortName, parseFloat(option.lat), parseFloat(option.lon));
    setShowDropdown(false);
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
            placeholder={placeholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!showDropdown) setShowDropdown(true);
            }}
            onFocus={() => {
              if (results.length > 0) setShowDropdown(true);
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
          )}
        </div>
      )}
    </div>
  );
}
