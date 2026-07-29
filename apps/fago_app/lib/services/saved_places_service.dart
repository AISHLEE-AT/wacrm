import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class SavedPlace {
  final String id;
  final String name; // e.g. "Home", "Work", "Uzhavar Mandi"
  final String address;
  final double latitude;
  final double longitude;
  final String tag; // "home", "work", "custom"
  final DateTime createdAt;

  SavedPlace({
    required this.id,
    required this.name,
    required this.address,
    required this.latitude,
    required this.longitude,
    this.tag = 'custom',
    DateTime? createdAt,
  }) : createdAt = createdAt ?? DateTime.now();

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'address': address,
        'latitude': latitude,
        'longitude': longitude,
        'tag': tag,
        'created_at': createdAt.toIso8601String(),
      };

  factory SavedPlace.fromJson(Map<String, dynamic> json) => SavedPlace(
        id: json['id'] ?? DateTime.now().millisecondsSinceEpoch.toString(),
        name: json['name'] ?? 'Saved Place',
        address: json['address'] ?? '',
        latitude: (json['latitude'] as num).toDouble(),
        longitude: (json['longitude'] as num).toDouble(),
        tag: json['tag'] ?? 'custom',
        createdAt: json['created_at'] != null
            ? DateTime.parse(json['created_at'])
            : DateTime.now(),
      );
}

class SavedPlacesService {
  static final SavedPlacesService _instance = SavedPlacesService._internal();
  factory SavedPlacesService() => _instance;
  SavedPlacesService._internal();

  static const String _storageKey = 'fago_saved_places_v1';

  /// Save or Update a Location Place
  Future<bool> savePlace(SavedPlace place) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final places = await getSavedPlaces();
      
      // Upsert: Remove existing place with same ID or same tag if home/work
      places.removeWhere((p) => p.id == place.id || (place.tag != 'custom' && p.tag == place.tag));
      places.insert(0, place);

      final jsonList = places.map((p) => p.toJson()).toList();
      await prefs.setString(_storageKey, jsonEncode(jsonList));

      // Backup to Supabase if logged in
      final user = Supabase.instance.client.auth.currentUser;
      if (user != null) {
        try {
          await Supabase.instance.client.from('saved_places').upsert({
            'user_id': user.id,
            'name': place.name,
            'address': place.address,
            'latitude': place.latitude,
            'longitude': place.longitude,
            'tag': place.tag,
            'updated_at': DateTime.now().toIso8601String(),
          }, onConflict: 'user_id,tag');
        } catch (e) {
          debugPrint('Supabase saved_places sync notice: $e');
        }
      }

      return true;
    } catch (e) {
      debugPrint('Save place error: $e');
      return false;
    }
  }

  /// Autoload all Saved Places from persistent storage
  Future<List<SavedPlace>> getSavedPlaces() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final String? jsonString = prefs.getString(_storageKey);
      if (jsonString != null && jsonString.isNotEmpty) {
        final List<dynamic> decoded = jsonDecode(jsonString);
        return decoded.map((item) => SavedPlace.fromJson(item)).toList();
      }
    } catch (e) {
      debugPrint('Autoload saved places error: $e');
    }
    return [];
  }

  /// Get Home Place
  Future<SavedPlace?> getHomePlace() async {
    final places = await getSavedPlaces();
    try {
      return places.firstWhere((p) => p.tag == 'home' || p.name.toLowerCase() == 'home');
    } catch (_) {
      return null;
    }
  }

  /// Get Work Place
  Future<SavedPlace?> getWorkPlace() async {
    final places = await getSavedPlaces();
    try {
      return places.firstWhere((p) => p.tag == 'work' || p.name.toLowerCase() == 'work');
    } catch (_) {
      return null;
    }
  }

  /// Delete a saved place
  Future<bool> deletePlace(String id) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final places = await getSavedPlaces();
      places.removeWhere((p) => p.id == id);
      final jsonList = places.map((p) => p.toJson()).toList();
      await prefs.setString(_storageKey, jsonEncode(jsonList));
      return true;
    } catch (e) {
      debugPrint('Delete place error: $e');
      return false;
    }
  }
}
