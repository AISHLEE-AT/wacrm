import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class CacheService {
  final SharedPreferences _prefs;

  CacheService(this._prefs);

  Future<void> setCache(String key, dynamic data) async {
    final String jsonString = jsonEncode(data);
    await _prefs.setString(key, jsonString);
  }

  dynamic getCache(String key) {
    final String? jsonString = _prefs.getString(key);
    if (jsonString != null) {
      return jsonDecode(jsonString);
    }
    return null;
  }

  Future<void> clearCache(String key) async {
    await _prefs.remove(key);
  }
}
