import 'dart:async';
import 'dart:convert';
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

  /// Get current high accuracy GPS location from hardware
  Future<model.Location> getCurrentLocation() async {
    bool serviceEnabled;
    LocationPermission permission;

    // Check if location services are enabled
    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      print('Location services are disabled.');
      return defaultLocation;
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        print('Location permissions are denied');
        return defaultLocation;
      }
    }
    
    if (permission == LocationPermission.deniedForever) {
      print('Location permissions are permanently denied');
      return defaultLocation;
    }

    try {
      // Use high accuracy GPS setting with reasonable 10s timeout
      Position position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 10),
        ),
      );
      return model.Location(latitude: position.latitude, longitude: position.longitude);
    } catch (e) {
      print('Error getting high-accuracy location: $e. Falling back to last known position.');
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
      distanceFilter: 5, // Update every 5 meters
    );

    return Geolocator.getPositionStream(locationSettings: locationSettings).map(
      (position) => model.Location(latitude: position.latitude, longitude: position.longitude),
    );
  }

  /// High Precision Native Android/iOS System Address Reverse-Geocoding ($0 API Cost & 100% Google Precision)
  Future<String> getAddressFromCoordinates(double lat, double lng) async {
    try {
      // 1. Primary: Native OS Geocoder (Uses Android Google Location Services & iOS CoreLocation - $0 Cost & 100% Accurate)
      List<Placemark> placemarks = await placemarkFromCoordinates(lat, lng);
      if (placemarks.isNotEmpty) {
        final place = placemarks.first;
        List<String> addressParts = [];
        if (place.name != null && place.name!.isNotEmpty && place.name != place.street) addressParts.add(place.name!);
        if (place.street != null && place.street!.isNotEmpty) addressParts.add(place.street!);
        if (place.subLocality != null && place.subLocality!.isNotEmpty) addressParts.add(place.subLocality!);
        if (place.locality != null && place.locality!.isNotEmpty) addressParts.add(place.locality!);
        if (place.postalCode != null && place.postalCode!.isNotEmpty) addressParts.add(place.postalCode!);
        
        if (addressParts.isNotEmpty) {
          return addressParts.join(', ');
        }
      }
    } catch (e) {
      print('Native Geocoder fallback: $e');
    }

    // 2. Secondary Fallback: Nominatim OpenStreetMap
    try {
      final url = Uri.parse('https://nominatim.openstreetmap.org/reverse?format=json&lat=$lat&lon=$lng');
      final response = await http.get(url, headers: {'User-Agent': 'WacrmRideApp/1.0'});
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data != null && data['display_name'] != null) {
          return data['display_name'].toString();
        }
      }
    } catch (_) {}

    return 'GPS Pin: ${lat.toStringAsFixed(4)}, ${lng.toStringAsFixed(4)}';
  }
}
