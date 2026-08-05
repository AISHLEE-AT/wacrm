/// SuprO Daily News Model
/// Mirrors the `daily_news` Supabase table

class DailyNewsItem {
  final String id;
  final String module;      // agro | teacho | dealo | jobo | driveo | testo | general
  final String title;
  final String description;
  final String? imageUrl;
  final String sourceName;
  final String link;
  final String publishedDate;
  final String loadedDate;
  final String dataType;    // rss | govt_api | mandi | commodity_price
  final Map<String, dynamic>? extraData;

  DailyNewsItem({
    required this.id,
    required this.module,
    required this.title,
    required this.description,
    this.imageUrl,
    required this.sourceName,
    required this.link,
    required this.publishedDate,
    required this.loadedDate,
    this.dataType = 'rss',
    this.extraData,
  });

  factory DailyNewsItem.fromJson(Map<String, dynamic> json) {
    return DailyNewsItem(
      id: json['id'] ?? '',
      module: json['module'] ?? 'general',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      imageUrl: json['image_url'],
      sourceName: json['source_name'] ?? '',
      link: json['link'] ?? '',
      publishedDate: json['published_date'] ?? '',
      loadedDate: json['loaded_date'] ?? '',
      dataType: json['data_type'] ?? 'rss',
      extraData: json['extra_data'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'module': module,
      'title': title,
      'description': description,
      'image_url': imageUrl,
      'source_name': sourceName,
      'link': link,
      'published_date': publishedDate,
      'loaded_date': loadedDate,
      'data_type': dataType,
      'extra_data': extraData,
    };
  }

  /// Convenience: Create a government API news item from structured data
  factory DailyNewsItem.fromGovtData({
    required String module,
    required String title,
    required String description,
    required String sourceName,
    String dataType = 'govt_api',
    Map<String, dynamic>? extraData,
  }) {
    final today = DateTime.now();
    final dateStr = '${today.year}-${today.month.toString().padLeft(2, '0')}-${today.day.toString().padLeft(2, '0')}';
    return DailyNewsItem(
      id: '',
      module: module,
      title: title,
      description: description,
      sourceName: sourceName,
      link: '',
      publishedDate: dateStr,
      loadedDate: dateStr,
      dataType: dataType,
      extraData: extraData,
    );
  }
}

/// Module metadata: color, icon codepoint, label
class ModuleInfo {
  static const Map<String, Map<String, dynamic>> modules = {
    'agro':    {'label': 'AgrO',    'color': 0xFF10b981, 'icon': 0xe544}, // leaf
    'teacho':  {'label': 'TeachO',  'color': 0xFF6366f1, 'icon': 0xe80c}, // book-open
    'dealo':   {'label': 'DealO',   'color': 0xFFf59e0b, 'icon': 0xe8cc}, // shopping-bag
    'jobo':    {'label': 'JobO',    'color': 0xFF3b82f6, 'icon': 0xe838}, // briefcase
    'driveo':  {'label': 'DriveO',  'color': 0xFFef4444, 'icon': 0xe1d8}, // car
    'testo':   {'label': 'TestO',   'color': 0xFFec4899, 'icon': 0xe3f0}, // heart-pulse
    'general': {'label': 'General', 'color': 0xFF94a3b8, 'icon': 0xe8b2}, // newspaper
  };

  static int getColor(String module) =>
      modules[module]?['color'] as int? ?? 0xFF94a3b8;

  static String getLabel(String module) =>
      modules[module]?['label'] as String? ?? module;
}
