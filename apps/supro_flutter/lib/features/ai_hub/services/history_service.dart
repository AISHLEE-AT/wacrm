import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class HistoryItem {
  final String id;
  final String tool;
  final String query;
  final String result;
  final int timestamp;
  final String language;

  HistoryItem({
    required this.id,
    required this.tool,
    required this.query,
    required this.result,
    required this.timestamp,
    required this.language,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'tool': tool,
    'query': query,
    'result': result,
    'timestamp': timestamp,
    'language': language,
  };

  factory HistoryItem.fromJson(Map<String, dynamic> json) => HistoryItem(
    id: json['id'] ?? '',
    tool: json['tool'] ?? '',
    query: json['query'] ?? '',
    result: json['result'] ?? '',
    timestamp: json['timestamp'] ?? 0,
    language: json['language'] ?? 'Tamil',
  );
}

class HistoryGroup {
  final String title;
  final List<HistoryItem> data;
  HistoryGroup({required this.title, required this.data});
}

const String _historyKey = 'ai_tools_history';

class HistoryService {
  Future<void> saveItem({
    required String tool,
    required String query,
    required String result,
    required String language,
  }) async {
    try {
      final existing = await getHistory();
      final newItem = HistoryItem(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        tool: tool,
        query: query,
        result: result,
        timestamp: DateTime.now().millisecondsSinceEpoch,
        language: language,
      );
      final updated = [newItem, ...existing];
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_historyKey, jsonEncode(updated.map((e) => e.toJson()).toList()));
    } catch (e) {
      // ignore
    }
  }

  Future<List<HistoryItem>> getHistory() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final data = prefs.getString(_historyKey);
      if (data == null) return [];
      final list = jsonDecode(data) as List;
      return list.map((e) => HistoryItem.fromJson(e)).toList();
    } catch (e) {
      return [];
    }
  }

  Future<void> clearHistory() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_historyKey);
    } catch (e) {
      // ignore
    }
  }

  Future<void> deleteItem(String id) async {
    try {
      final existing = await getHistory();
      final updated = existing.where((i) => i.id != id).toList();
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_historyKey, jsonEncode(updated.map((e) => e.toJson()).toList()));
    } catch (e) {
      // ignore
    }
  }

  List<HistoryGroup> getGroupedHistory(List<HistoryItem> items) {
    final now = DateTime.now().millisecondsSinceEpoch;
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const twoWeeks = 14 * 24 * 60 * 60 * 1000;

    final thisWeek = <HistoryItem>[];
    final lastWeek = <HistoryItem>[];
    final older = <HistoryItem>[];

    for (final item in items) {
      final diff = now - item.timestamp;
      if (diff < oneWeek) {
        thisWeek.add(item);
      } else if (diff < twoWeeks) {
        lastWeek.add(item);
      } else {
        older.add(item);
      }
    }

    return [
      if (thisWeek.isNotEmpty) HistoryGroup(title: 'This Week', data: thisWeek),
      if (lastWeek.isNotEmpty) HistoryGroup(title: 'Last Week', data: lastWeek),
      if (older.isNotEmpty) HistoryGroup(title: 'Older', data: older),
    ];
  }
}
