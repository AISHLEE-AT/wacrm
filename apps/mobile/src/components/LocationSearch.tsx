import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Text, TouchableOpacity, ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import { MapPin, X } from 'lucide-react-native';

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

export function LocationSearch({ placeholder, value, onChange, iconBorderColor = '#10B981' }: LocationSearchProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<LocationOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    setQuery(value);
  }, [value]);

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
        console.log("Error fetching locations", error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchLocations, 500);
    return () => clearTimeout(debounceTimer);
  }, [query, value]);

  const handleSelect = (option: LocationOption) => {
    const shortName = option.display_name.split(',').slice(0, 3).join(', ');
    setQuery(shortName);
    onChange(shortName, parseFloat(option.lat), parseFloat(option.lon));
    setShowDropdown(false);
  };

  const handleClear = () => {
    setQuery("");
    onChange("");
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <View style={[styles.iconDot, { borderColor: iconBorderColor }]} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            if (!showDropdown) setShowDropdown(true);
          }}
          onFocus={() => {
            if (results.length > 0) setShowDropdown(true);
          }}
        />
        {query ? (
          <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
            <X size={16} color="#9ca3af" />
          </TouchableOpacity>
        ) : null}
      </View>

      {showDropdown && (results.length > 0 || loading) && (
        <View style={styles.dropdown}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#10b981" />
              <Text style={styles.loadingText}>Searching...</Text>
            </View>
          ) : (
            <FlatList
              data={results}
              keyExtractor={(item, index) => `${item.lat}-${item.lon}-${index}`}
              keyboardShouldPersistTaps="handled"
              style={{ maxHeight: 200 }}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.option} onPress={() => handleSelect(item)}>
                  <MapPin size={18} color="#10b981" style={styles.optionIcon} />
                  <Text style={styles.optionText} numberOfLines={2}>
                    {item.display_name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 10,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    position: 'relative',
  },
  iconDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    marginLeft: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#111827',
  },
  clearButton: {
    padding: 10,
    position: 'absolute',
    right: 4,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 36,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    zIndex: 999,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingText: {
    marginLeft: 8,
    color: '#6b7280',
    fontSize: 14,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  optionIcon: {
    marginTop: 2,
    marginRight: 10,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
});
