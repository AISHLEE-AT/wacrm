import 'package:http/http.dart' as http;
import 'package:xml/xml.dart';
import '../../../core/offline_cache_service.dart';

class NewsItem {
  final String title;
  final String link;
  final String pubDate;
  final String description;
  final String? imageUrl;
  final String source;

  NewsItem({
    required this.title,
    required this.link,
    required this.pubDate,
    required this.description,
    this.imageUrl,
    required this.source,
  });

  Map<String, dynamic> toJson() => {
    'title': title,
    'link': link,
    'pubDate': pubDate,
    'description': description,
    'imageUrl': imageUrl,
    'source': source,
  };

  factory NewsItem.fromJson(Map<String, dynamic> json) => NewsItem(
    title: json['title'] as String? ?? 'No Title',
    link: json['link'] as String? ?? '',
    pubDate: json['pubDate'] as String? ?? '',
    description: json['description'] as String? ?? '',
    imageUrl: json['imageUrl'] as String?,
    source: json['source'] as String? ?? 'SuprO Agro',
  );
}

class AgriNewsService {
  static const List<Map<String, String>> feeds = [
    {
      'name': 'Dinamalar (Agriculture)',
      'url': 'https://www.dinamalar.com/rss_vivasayam.asp'
    },
    {
      'name': 'OneIndia Tamil',
      'url': 'https://tamil.oneindia.com/rss/tamil-news-fb.xml'
    }
  ];

  static Future<List<NewsItem>> fetchNews() async {
    List<NewsItem> allNews = [];

    for (var feed in feeds) {
      try {
        final response = await http.get(Uri.parse(feed['url']!)).timeout(const Duration(seconds: 8));
        if (response.statusCode == 200) {
          final document = XmlDocument.parse(response.body);
          final items = document.findAllElements('item');

          for (var item in items) {
            String title = item.findElements('title').firstOrNull?.innerText ?? 'No Title';
            String link = item.findElements('link').firstOrNull?.innerText ?? '';
            String pubDate = item.findElements('pubDate').firstOrNull?.innerText ?? '';
            String desc = item.findElements('description').firstOrNull?.innerText ?? '';
            
            // Extract image if available (some RSS feeds put it in enclosure or description)
            String? imageUrl;
            var enclosure = item.findElements('enclosure').firstOrNull;
            if (enclosure != null) {
              imageUrl = enclosure.getAttribute('url');
            } else if (desc.contains('<img')) {
              var regExp = RegExp(r'src="([^"]+)"');
              var match = regExp.firstMatch(desc);
              if (match != null) imageUrl = match.group(1);
            }

            // Clean up description HTML
            desc = desc.replaceAll(RegExp(r'<[^>]*>|&[^;]+;'), '').trim();

            allNews.add(NewsItem(
              title: title.trim(),
              link: link.trim(),
              pubDate: pubDate.trim(),
              description: desc.length > 100 ? '${desc.substring(0, 100)}...' : desc,
              imageUrl: imageUrl,
              source: feed['name']!,
            ));
          }
        }
      } catch (e) {
        print('Error fetching RSS ${feed['name']}: $e');
      }
    }

    if (allNews.isNotEmpty) {
      // Cache successful response for 4 hours
      await OfflineCacheService.set(
        'agri_news_feed',
        allNews.map((n) => n.toJson()).toList(),
        ttlSeconds: 14400,
      );
      return allNews;
    }

    // Fallback to offline cache if network failed or returned no items
    final cached = await OfflineCacheService.get('agri_news_feed', ignoreExpiration: true);
    if (cached != null && cached is List) {
      return cached
          .whereType<Map<String, dynamic>>()
          .map((m) => NewsItem.fromJson(m))
          .toList();
    }

    return allNews;
  }
}
