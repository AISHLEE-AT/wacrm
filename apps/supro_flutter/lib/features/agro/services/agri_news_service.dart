import 'package:http/http.dart' as http;
import 'package:xml/xml.dart';

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
        final response = await http.get(Uri.parse(feed['url']!));
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

    // Sort by parsing date roughly, or just mix them up
    // Since dates come in various formats, we'll leave them as they arrive from feeds
    return allNews;
  }
}
