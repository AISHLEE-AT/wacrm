import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Robust Local Offline Cache Service for SuprO Super App
/// Enables instant screen rendering and offline access in rural areas with patchy connectivity.
class OfflineCacheService {
  static const String _prefix = 'supro_cache_';
  static SharedPreferences? _prefs;

  static Future<SharedPreferences> _getPrefs() async {
    _prefs ??= await SharedPreferences.getInstance();
    return _prefs!;
  }

  /// Store data with timestamp and optional TTL in seconds
  static Future<void> set(String key, dynamic data, {int? ttlSeconds}) async {
    try {
      final prefs = await _getPrefs();
      final payload = {
        'timestamp': DateTime.now().millisecondsSinceEpoch,
        'ttl': ttlSeconds,
        'data': data,
      };
      await prefs.setString('$_prefix$key', jsonEncode(payload));
    } catch (e) {
      debugPrint('[OfflineCache] Error writing key $key: $e');
    }
  }

  /// Retrieve cached data if valid, returns null if missing or expired (unless ignoreExpiration is true)
  static Future<dynamic> get(String key, {bool ignoreExpiration = false}) async {
    try {
      final prefs = await _getPrefs();
      final raw = prefs.getString('$_prefix$key');
      if (raw == null) return null;

      final map = jsonDecode(raw) as Map<String, dynamic>;
      final timestamp = map['timestamp'] as int? ?? 0;
      final ttl = map['ttl'] as int?;

      if (!ignoreExpiration && ttl != null) {
        final ageSeconds = (DateTime.now().millisecondsSinceEpoch - timestamp) / 1000;
        if (ageSeconds > ttl) {
          return null; // Expired
        }
      }

      return map['data'];
    } catch (e) {
      debugPrint('[OfflineCache] Error reading key $key: $e');
      return null;
    }
  }

  /// High-Resilience Fetch Helper:
  /// 1. Tries to execute network [fetcher].
  /// 2. On success: caches the data and returns it.
  /// 3. On failure (Offline, Timeout): seamlessly falls back to cached data.
  static Future<T?> getOrFetch<T>({
    required String cacheKey,
    required Future<T> Function() fetcher,
    int? ttlSeconds,
  }) async {
    try {
      final liveData = await fetcher();
      if (liveData != null) {
        await set(cacheKey, liveData, ttlSeconds: ttlSeconds);
      }
      return liveData;
    } catch (networkError) {
      debugPrint('[OfflineCache] Network fetch failed for $cacheKey, loading cache fallback: $networkError');
      final cached = await get(cacheKey, ignoreExpiration: true);
      if (cached != null) {
        return cached as T;
      }
      rethrow;
    }
  }

  /// Remove single key
  static Future<void> remove(String key) async {
    final prefs = await _getPrefs();
    await prefs.remove('$_prefix$key');
  }

  /// Clear all cache entries
  static Future<void> clearAll() async {
    final prefs = await _getPrefs();
    final keys = prefs.getKeys().where((k) => k.startsWith(_prefix)).toList();
    for (final k in keys) {
      await prefs.remove(k);
    }
  }
}
