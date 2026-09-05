import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../core/env.dart';

class OfflineSyncService {
  // Two separate point pools
  static const String _testoPointsKey = 'offline_testo_points';
  static const String _farmPointsKey = 'offline_farm_points';

  // --- Testo Points (Student Games) ---

  static Future<void> addOfflineTestoPoints(int points) async {
    final prefs = await SharedPreferences.getInstance();
    final current = prefs.getInt(_testoPointsKey) ?? 0;
    await prefs.setInt(_testoPointsKey, current + points);
  }

  static Future<int> getOfflineTestoPoints() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getInt(_testoPointsKey) ?? 0;
  }

  // --- Farm Points (Farmer Games) ---

  static Future<void> addOfflineFarmPoints(int points) async {
    final prefs = await SharedPreferences.getInstance();
    final current = prefs.getInt(_farmPointsKey) ?? 0;
    await prefs.setInt(_farmPointsKey, current + points);
  }

  static Future<int> getOfflineFarmPoints() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getInt(_farmPointsKey) ?? 0;
  }

  /// Returns total offline points across both pools (for display)
  static Future<int> getTotalOfflinePoints() async {
    final testo = await getOfflineTestoPoints();
    final farm = await getOfflineFarmPoints();
    return testo + farm;
  }

  /// Syncs both point pools to OCI Cloud.
  static Future<bool> syncPointsToServer(String userId) async {
    final prefs = await SharedPreferences.getInstance();
    final testoPoints = prefs.getInt(_testoPointsKey) ?? 0;
    final farmPoints = prefs.getInt(_farmPointsKey) ?? 0;

    if (testoPoints <= 0 && farmPoints <= 0) return true; // Nothing to sync

    try {
      final res = await http.post(
        Uri.parse('${AppEnv.apiUrl}/api/gameo/sync'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'user_id': userId,
          'testo_points': testoPoints,
          'farm_points': farmPoints,
        }),
      ).timeout(const Duration(seconds: 4));

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['success'] == true) {
          await prefs.setInt(_testoPointsKey, 0);
          await prefs.setInt(_farmPointsKey, 0);
          return true;
        }
      }
      return false;
    } catch (_) {
      return false;
    }
  }
}
