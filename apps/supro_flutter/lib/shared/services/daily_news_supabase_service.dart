import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../../core/env.dart';
import '../models/daily_news_item.dart';

/// OCI Cloud Service for the daily news.
/// 100% OCI Backend (https://mysupro.duckdns.org/api/news)
class DailyNewsSupabaseService {
  // ─── READ ───────────────────────────────────────────────────────────────────

  /// Fetch latest news for a specific module
  static Future<List<DailyNewsItem>> fetchNewsForModule(String module) async {
    try {
      final res = await http.get(
        Uri.parse('${AppEnv.apiUrl}/api/news?module=$module'),
      ).timeout(const Duration(seconds: 4));

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body) as List;
        return data.map((e) => DailyNewsItem.fromJson(e)).toList();
      }
    } catch (_) {}
    return [];
  }

  /// Fetch ALL latest news — admin preview
  static Future<List<DailyNewsItem>> fetchAllTodayNews() async {
    try {
      final res = await http.get(
        Uri.parse('${AppEnv.apiUrl}/api/news'),
      ).timeout(const Duration(seconds: 4));

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body) as List;
        return data.map((e) => DailyNewsItem.fromJson(e)).toList();
      }
    } catch (_) {}
    return [];
  }

  // ─── WRITE (Admin only) ──────────────────────────────────────────────────────

  /// Bulk-insert a list of news items into OCI Backend
  static Future<bool> saveNewsItems(List<DailyNewsItem> items) async {
    try {
      final payload = items.map((e) => e.toJson()).toList();
      final res = await http.post(
        Uri.parse('${AppEnv.apiUrl}/api/news/bulk'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(payload),
      ).timeout(const Duration(seconds: 6));

      return res.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  /// Delete ALL of today's news (admin reset before re-loading)
  static Future<bool> deleteTodayNews() async {
    try {
      final res = await http.delete(
        Uri.parse('${AppEnv.apiUrl}/api/news/today'),
      ).timeout(const Duration(seconds: 4));

      return res.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  /// Delete today's news for a specific module only
  static Future<bool> deleteModuleNews(String module) async {
    try {
      final res = await http.delete(
        Uri.parse('${AppEnv.apiUrl}/api/news/today?module=$module'),
      ).timeout(const Duration(seconds: 4));

      return res.statusCode == 200;
    } catch (_) {
      return false;
    }
  }
}
