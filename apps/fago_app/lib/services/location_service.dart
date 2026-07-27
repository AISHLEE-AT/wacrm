import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import 'package:http/http.dart' as http;
import '../models/ride_request.dart' as model;

class LocationService {
  static final LocationService _instance = LocationService._internal();
  factory LocationService() => _instance;
  LocationService._internal();

  /// Default fallback location (Chennai)
  static const model.Location defaultLocation = model.Location(latitude: 13.0827, longitude: 80.2707);

  /// Helper to sanitize raw address lines and eliminate generic junk like "Unnamed Road,"
  static String cleanAddressString(String rawAddress) {
    if (rawAddress.isEmpty) return 'GPS Location Active';
    
    String cleaned = rawAddress;
    // Strip leading "Unnamed Road," or "Unnamed Road "
    cleaned = cleaned.replaceAll(RegExp(r'^Unnamed Road,\s*', caseSensitive: false), '');
    cleaned = cleaned.replaceAll(RegExp(r'^Unnamed Road\s*', caseSensitive: false), '');
    cleaned = cleaned.replaceAll(RegExp(r'Unnamed Road,\s*', caseSensitive: false), '');
    
    // Strip generic placeholders
    cleaned = cleaned.trim();
    if (cleaned.endsWith(',')) {
      cleaned = cleaned.substring(0, cleaned.length - 1).trim();
    }
    
    return cleaned.isNotEmpty ? cleaned : 'GPS Location Active';
  }

  /// Get current high accuracy GPS location from hardware
  Future<model.Location> getCurrentLocation() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      debugPrint('Location services are disabled.');
      return defaultLocation;
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        debugPrint('Location permissions are denied');
        return defaultLocation;
      }
    }
    
    if (permission == LocationPermission.deniedForever) {
      debugPrint('Location permissions are permanently denied');
      return defaultLocation;
    }

    try {
      Position position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 10),
        ),
      );
      return model.Location(latitude: position.latitude, longitude: position.longitude);
    } catch (e) {
      debugPrint('Error getting high-accuracy location: $e.');
      try {
        Position? lastKnown = await Geolocator.getLastKnownPosition();
        if (lastKnown != null) {
          return model.Location(latitude: lastKnown.latitude, longitude: lastKnown.longitude);
        }
      } catch (_) {}
      return defaultLocation;
    }
  }

  /// Listen to live location updates stream (High precision)
  Stream<model.Location> getPositionStream() {
    const locationSettings = LocationSettings(
      accuracy: LocationAccuracy.high,
      distanceFilter: 5,
    );

    return Geolocator.getPositionStream(locationSettings: locationSettings).map(
      (position) => model.Location(latitude: position.latitude, longitude: position.longitude),
    );
  }

  /// High Precision Native Address Reverse-Geocoding (Clean place names, no Unnamed Road)
  Future<String> getAddressFromCoordinates(double lat, double lng) async {
    try {
      List<Placemark> placemarks = await placemarkFromCoordinates(lat, lng);
      if (placemarks.isNotEmpty) {
        final place = placemarks.first;
        List<String> addressParts = [];
        if (place.name != null && place.name!.isNotEmpty && place.name != place.street && !place.name!.toLowerCase().contains('unnamed')) {
          addressParts.add(place.name!);
        }
        if (place.street != null && place.street!.isNotEmpty && !place.street!.toLowerCase().contains('unnamed')) {
          addressParts.add(place.street!);
        }
        if (place.subLocality != null && place.subLocality!.isNotEmpty) addressParts.add(place.subLocality!);
        if (place.locality != null && place.locality!.isNotEmpty) addressParts.add(place.locality!);
        if (place.postalCode != null && place.postalCode!.isNotEmpty) addressParts.add(place.postalCode!);
        
        if (addressParts.isNotEmpty) {
          return cleanAddressString(addressParts.join(', '));
        }
      }
    } catch (e) {
      debugPrint('Native Geocoder fallback: $e');
    }

    // 2. Secondary Fallback: Nominatim OpenStreetMap
    try {
      final url = Uri.parse('https://nominatim.openstreetmap.org/reverse?format=json&lat=$lat&lon=$lng');
      final response = await http.get(url, headers: {'User-Agent': 'WacrmRideApp/1.0'});
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data != null && data['display_name'] != null) {
          return cleanAddressString(data['display_name'].toString());
        }
      }
    } catch (_) {}

    return 'GPS Location (${lat.toStringAsFixed(4)}, ${lng.toStringAsFixed(4)})';
  }

  /// High Precision Native Pincode & Address Reverse-Geocoding
  Future<Map<String, String>> getPincodeAndAddressFromCoordinates(double lat, double lng) async {
    String pincode = '';
    String address = '';

    try {
      List<Placemark> placemarks = await placemarkFromCoordinates(lat, lng);
      if (placemarks.isNotEmpty) {
        final place = placemarks.first;
        if (place.postalCode != null && place.postalCode!.isNotEmpty) {
          pincode = place.postalCode!;
        }
        List<String> addressParts = [];
        if (place.subLocality != null && place.subLocality!.isNotEmpty) {
          addressParts.add(place.subLocality!);
        } else if (place.street != null && place.street!.isNotEmpty && place.street != place.name && !place.street!.toLowerCase().contains('unnamed')) {
          addressParts.add(place.street!);
        }
        if (place.locality != null && place.locality!.isNotEmpty) {
          addressParts.add(place.locality!);
        }
        if (place.administrativeArea != null && place.administrativeArea!.isNotEmpty) {
          addressParts.add(place.administrativeArea!);
        }

        if (addressParts.isNotEmpty) {
          address = cleanAddressString(addressParts.join(', '));
        }
      }
    } catch (e) {
      debugPrint('Pincode Geocoder error: $e');
    }

    if (address.isEmpty) {
      address = await getAddressFromCoordinates(lat, lng);
    }

    return {
      'pincode': pincode.isNotEmpty ? pincode : '641001',
      'address': address,
    };
  }

  /// Forward Geocode query string to Location lat/lng
  Future<model.Location?> searchAddressCoordinates(String query) async {
    try {
      List<Location> locations = await locationFromAddress(query);
      if (locations.isNotEmpty) {
        final loc = locations.first;
        return model.Location(latitude: loc.latitude, longitude: loc.longitude);
      }
    } catch (e) {
      debugPrint('Error forward geocoding query: $e');
    }
    return null;
  }
}
