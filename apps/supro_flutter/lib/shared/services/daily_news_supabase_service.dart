import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/daily_news_item.dart';

/// Supabase CRUD service for the daily_news table.
/// Admin writes once; all users read throughout the day.
class DailyNewsSupabaseService {
  static final _client = Supabase.instance.client;

  // ─── READ ───────────────────────────────────────────────────────────────────

  /// Fetch latest news for a specific module — last 1 day (not today-only)
  static Future<List<DailyNewsItem>> fetchNewsForModule(String module) async {
    try {
      final yesterday = _yesterdayString();
      final data = await _client
          .from('daily_news')
          .select()
          .eq('module', module)
          .gte('loaded_date', yesterday)       // ← last 1 day tolerance
          .order('loaded_date', ascending: false)
          .order('created_at', ascending: true)
          .limit(30);

      return (data as List).map((e) => DailyNewsItem.fromJson(e)).toList();
    } catch (e) {
      print('DailyNewsService fetchNewsForModule error: $e');
      return [];
    }
  }

  /// Fetch ALL latest news (last 1 day) — admin preview
  static Future<List<DailyNewsItem>> fetchAllTodayNews() async {
    try {
      final yesterday = _yesterdayString();
      final data = await _client
          .from('daily_news')
          .select()
          .gte('loaded_date', yesterday)
          .order('loaded_date', ascending: false)
          .order('module', ascending: true);

      return (data as List).map((e) => DailyNewsItem.fromJson(e)).toList();
    } catch (e) {
      print('DailyNewsService fetchAllTodayNews error: $e');
      return [];
    }
  }

  // ─── WRITE (Admin only) ──────────────────────────────────────────────────────

  /// Bulk-insert a list of news items into Supabase
  static Future<bool> saveNewsItems(List<DailyNewsItem> items) async {
    try {
      final payload = items.map((e) => e.toJson()).toList();
      await _client.from('daily_news').insert(payload);
      return true;
    } catch (e) {
      print('DailyNewsService saveNewsItems error: $e');
      return false;
    }
  }

  /// Delete ALL of today's news (admin reset before re-loading)
  static Future<bool> deleteTodayNews() async {
    try {
      final today = _todayString();
      await _client.from('daily_news').delete().eq('loaded_date', today);
      return true;
    } catch (e) {
      print('DailyNewsService deleteTodayNews error: $e');
      return false;
    }
  }

  /// Delete today's news for a specific module only
  static Future<bool> deleteModuleNews(String module) async {
    try {
      final today = _todayString();
      await _client
          .from('daily_news')
          .delete()
          .eq('module', module)
          .eq('loaded_date', today);
      return true;
    } catch (e) {
      print('DailyNewsService deleteModuleNews error: $e');
      return false;
    }
  }

  // ─── HELPERS ─────────────────────────────────────────────────────────────────

  static String _todayString() {
    final now = DateTime.now();
    return '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
  }

  static String _yesterdayString() {
    final yesterday = DateTime.now().subtract(const Duration(days: 1));
    return '${yesterday.year}-${yesterday.month.toString().padLeft(2, '0')}-${yesterday.day.toString().padLeft(2, '0')}';
  }
}
