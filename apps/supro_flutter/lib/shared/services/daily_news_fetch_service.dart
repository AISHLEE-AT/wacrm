import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/daily_news_item.dart';

// ─────────────────────────────────────────────────────────────────────────────
// SuprO Daily News Fetch Service
//
// Fetches from two sources:
//   1. RSS Feeds (Tamil Nadu news, FREE, no key required)
//   2. data.gov.in Government API (structured factual data)
//
// GOVERNMENT API DATASETS FETCHED:
//  ┌─────────────┬───────────────────────────────────────────────────────────┐
//  │  Module     │  data.gov.in Dataset                                      │
//  ├─────────────┼───────────────────────────────────────────────────────────┤
//  │  AgrO       │  Mandi / APM market prices (resource 9ef84268...)         │
//  │  AgrO       │  State-wise rainfall (resource 1f5d3db6...)               │
//  │  DealO      │  Consumer Affairs daily retail commodity prices           │
//  │             │  (resource 65f3dc88... Dept. of Consumer Affairs)         │
//  │  TestO      │  NPPA drug ceiling prices (resource a24ba4be...)          │
//  │  DriveO     │  Road accident black spots TN (resource fe3df86c...)      │
//  └─────────────┴───────────────────────────────────────────────────────────┘
//
// RSS FEEDS FETCHED:
//  ┌─────────────┬───────────────────────────────────────────────────────────┐
//  │  Module     │  RSS Feed                                                 │
//  ├─────────────┼───────────────────────────────────────────────────────────┤
//  │  AgrO       │  Dinamalar Vivasayam (Agriculture)                        │
//  │  TeachO     │  Dinamalar Kalvi (Education)                              │
//  │  DealO      │  Dinamalar Vanikam (Business/Commerce)                    │
//  │  JobO       │  Dinamalar Thozil (Employment)                            │
//  │  DriveO     │  OneIndia Tamil (Transport filtered)                      │
//  │  TestO      │  Dinamalar Health                                         │
//  │  General    │  BBC Tamil, Dinamalar Main, OneIndia Tamil                │
//  └─────────────┴───────────────────────────────────────────────────────────┘
// ─────────────────────────────────────────────────────────────────────────────

class DailyNewsFetchService {
  static const String _govApiKey =
      '579b464db66ec23bdd0000010e0f365c1ff840af51b6b8944d54f72b';

  // ─── RSS FEED CONFIG ───────────────────────────────────────────────────────
  static const List<Map<String, String>> _rssFeeds = [
    // AgrO — Agriculture
    {
      'module': 'agro',
      'name': 'Dinamalar Vivasayam',
      'url': 'https://www.dinamalar.com/rss_vivasayam.asp',
    },
    // TeachO — Education
    {
      'module': 'teacho',
      'name': 'Dinamalar Kalvi',
      'url': 'https://www.dinamalar.com/rss_kalvi.asp',
    },
    // DealO — Business/Commerce
    {
      'module': 'dealo',
      'name': 'Dinamalar Vanikam',
      'url': 'https://www.dinamalar.com/rss_vanikam.asp',
    },
    // JobO — Employment
    {
      'module': 'jobo',
      'name': 'Dinamalar Thozil',
      'url': 'https://www.dinamalar.com/rss_thozil.asp',
    },
    // TestO — Health
    {
      'module': 'testo',
      'name': 'Dinamalar Health',
      'url': 'https://www.dinamalar.com/rss_health.asp',
    },
    // General — Main Tamil news
    {
      'module': 'general',
      'name': 'Dinamalar Main',
      'url': 'https://www.dinamalar.com/rss.asp',
    },
    {
      'module': 'general',
      'name': 'BBC Tamil',
      'url': 'https://feeds.bbci.co.uk/tamil/rss.xml',
    },
    {
      'module': 'general',
      'name': 'OneIndia Tamil',
      'url': 'https://tamil.oneindia.com/rss/tamil-news-fb.xml',
    },
    // DriveO — Transport (general feed, transport-tagged manually)
    {
      'module': 'driveo',
      'name': 'OneIndia Transport',
      'url': 'https://tamil.oneindia.com/rss/auto-news.xml',
    },
  ];

  // ─── MAIN FETCH (All modules) ──────────────────────────────────────────────

  /// Fetches ALL news from RSS + Government API.
  /// Returns a flat list tagged by module.
  static Future<List<DailyNewsItem>> fetchAll({
    void Function(String status)? onStatus,
  }) async {
    final List<DailyNewsItem> allItems = [];

    // 1. RSS Feeds
    onStatus?.call('Fetching Tamil Nadu RSS feeds...');
    final rssItems = await _fetchAllRss();
    allItems.addAll(rssItems);
    onStatus?.call('✅ RSS: ${rssItems.length} items fetched');

    // 2. Government API — Mandi Prices (AgrO)
    onStatus?.call('Fetching Mandi prices from data.gov.in...');
    final mandiItems = await _fetchMandiPrices();
    allItems.addAll(mandiItems);
    onStatus?.call('✅ Mandi: ${mandiItems.length} items fetched');

    // 3. Government API — Daily Commodity Retail Prices (DealO)
    onStatus?.call('Fetching retail commodity prices from data.gov.in...');
    final commodityItems = await _fetchCommodityPrices();
    allItems.addAll(commodityItems);
    onStatus?.call('✅ Commodity Prices: ${commodityItems.length} items fetched');

    return allItems;
  }

  /// Fetch only RSS items for a specific module (used for targeted refresh)
  static Future<List<DailyNewsItem>> fetchForModule(String module) async {
    final feeds =
        _rssFeeds.where((f) => f['module'] == module).toList();
    return await _fetchRssFeeds(feeds);
  }

  // ─── RSS PARSER ────────────────────────────────────────────────────────────

  static Future<List<DailyNewsItem>> _fetchAllRss() async {
    return await _fetchRssFeeds(_rssFeeds);
  }

  static Future<List<DailyNewsItem>> _fetchRssFeeds(
      List<Map<String, String>> feeds) async {
    final List<DailyNewsItem> results = [];
    final today = _todayString();

    for (final feed in feeds) {
      try {
        final response = await http
            .get(Uri.parse(feed['url']!))
            .timeout(const Duration(seconds: 12));

        if (response.statusCode != 200) continue;

        // Simple XML parsing without the xml package
        final body = response.body;
        final itemMatches =
            RegExp(r'<item>(.*?)</item>', dotAll: true).allMatches(body);

        for (final match in itemMatches) {
          final itemXml = match.group(1) ?? '';

          final title = _extractXmlTag(itemXml, 'title');
          final link = _extractXmlTag(itemXml, 'link');
          final pubDate = _extractXmlTag(itemXml, 'pubDate');
          String desc = _extractXmlTag(itemXml, 'description');

          // Extract image from enclosure or description
          String? imageUrl;
          final enclosureMatch =
              RegExp(r'<enclosure[^>]+url="([^"]+)"').firstMatch(itemXml);
          if (enclosureMatch != null) {
            imageUrl = enclosureMatch.group(1);
          } else {
            final imgMatch =
                RegExp(r'src="([^"]+\.(jpg|jpeg|png|webp))"', caseSensitive: false)
                    .firstMatch(desc);
            if (imgMatch != null) imageUrl = imgMatch.group(1);
          }

          // Clean description HTML
          desc = desc.replaceAll(RegExp(r'<[^>]*>|&[^;]+;'), '').trim();
          if (desc.length > 200) desc = '${desc.substring(0, 200)}...';

          if (title.isNotEmpty) {
            results.add(DailyNewsItem(
              id: '',
              module: feed['module']!,
              title: title.trim(),
              description: desc,
              imageUrl: imageUrl,
              sourceName: feed['name']!,
              link: link.trim(),
              publishedDate: pubDate.trim(),
              loadedDate: today,
              dataType: 'rss',
            ));
          }
        }
      } catch (e) {
        print('RSS fetch error [${feed['name']}]: $e');
      }
    }

    return results;
  }

  // ─── GOVERNMENT API: MANDI PRICES (AgrO) ──────────────────────────────────

  /// data.gov.in — Agmarknet daily Mandi prices
  /// Dataset: https://data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070
  static Future<List<DailyNewsItem>> _fetchMandiPrices() async {
    try {
      final url = Uri.parse(
        'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070'
        '?api-key=$_govApiKey&format=json&filters[state]=Tamil+Nadu&limit=20',
      );
      final response =
          await http.get(url).timeout(const Duration(seconds: 15));

      if (response.statusCode != 200) return [];

      final data = json.decode(response.body);
      final records = data['records'] as List? ?? [];
      final today = _todayString();
      final List<DailyNewsItem> items = [];

      for (final r in records) {
        final commodity = r['commodity'] ?? '';
        final market = r['market'] ?? '';
        final district = r['district'] ?? '';
        final modal = r['modal_price'] ?? '0';
        final min = r['min_price'] ?? '0';
        final max = r['max_price'] ?? '0';
        final arrivalDate = r['arrival_date'] ?? today;

        items.add(DailyNewsItem(
          id: '',
          module: 'agro',
          title: '🌾 $commodity – ₹$modal/Qtl @ $market',
          description:
              '$commodity ($district) | Min: ₹$min | Max: ₹$max | Modal: ₹$modal per Quintal | Arrival: $arrivalDate',
          sourceName: 'data.gov.in — Agmarknet',
          link:
              'https://agmarknet.gov.in',
          publishedDate: today,
          loadedDate: today,
          dataType: 'mandi',
          extraData: {
            'commodity': commodity,
            'market': market,
            'district': district,
            'modal_price': modal,
            'min_price': min,
            'max_price': max,
            'arrival_date': arrivalDate,
          },
        ));
      }

      return items;
    } catch (e) {
      print('Mandi API fetch error: $e');
      return [];
    }
  }

  // ─── GOVERNMENT API: DAILY COMMODITY RETAIL PRICES (DealO) ───────────────

  /// data.gov.in — Department of Consumer Affairs
  /// Daily retail prices of essential commodities (vegetables, pulses, grains)
  /// Dataset: https://data.gov.in/resource/65f3dc88-4d95-4f9c-9e6d-2a47d1a25b7e
  static Future<List<DailyNewsItem>> _fetchCommodityPrices() async {
    try {
      final url = Uri.parse(
        'https://api.data.gov.in/resource/65f3dc88-4d95-4f9c-9e6d-2a47d1a25b7e'
        '?api-key=$_govApiKey&format=json&limit=15',
      );
      final response =
          await http.get(url).timeout(const Duration(seconds: 15));

      if (response.statusCode != 200) return [];

      final data = json.decode(response.body);
      final records = data['records'] as List? ?? [];
      final today = _todayString();
      final List<DailyNewsItem> items = [];

      for (final r in records) {
        final commodity = r['commodity'] ?? r['Commodity'] ?? '';
        final retailPrice = r['retail_price'] ?? r['RetailPrice'] ?? '';
        final centre = r['centre'] ?? r['Centre'] ?? 'India';

        if (commodity.isEmpty) continue;

        items.add(DailyNewsItem(
          id: '',
          module: 'dealo',
          title: '🛒 $commodity – ₹$retailPrice/Kg',
          description:
              'Today\'s government retail price for $commodity is ₹$retailPrice per Kg at $centre. Source: Dept. of Consumer Affairs.',
          sourceName: 'data.gov.in — Consumer Affairs',
          link: 'https://fcainfoweb.nic.in/pmws',
          publishedDate: today,
          loadedDate: today,
          dataType: 'commodity_price',
          extraData: {
            'commodity': commodity,
            'retail_price': retailPrice,
            'centre': centre,
          },
        ));
      }

      return items;
    } catch (e) {
      print('Commodity price fetch error: $e');
      return [];
    }
  }

  // ─── HELPER ───────────────────────────────────────────────────────────────

  static String _todayString() {
    final now = DateTime.now();
    return '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
  }

  static String _extractXmlTag(String xml, String tag) {
    final match =
        RegExp('<$tag>(?:<![\\[CDATA[)?(.*?)(?:]>)?</$tag>', dotAll: true)
            .firstMatch(xml);
    if (match != null) return match.group(1) ?? '';
    // Also try CDATA
    final cdataMatch =
        RegExp('<$tag><!\\[CDATA\\[(.*?)\\]\\]></$tag>', dotAll: true)
            .firstMatch(xml);
    return cdataMatch?.group(1) ?? '';
  }
}
