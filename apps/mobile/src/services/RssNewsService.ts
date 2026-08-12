import { XMLParser } from 'fast-xml-parser';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  imageUrl?: string;
  source: string;
}

export class RssNewsService {
  private static readonly feeds = [
    {
      name: 'Dinamalar (Agriculture)',
      url: 'https://www.dinamalar.com/rss_vivasayam.asp'
    },
    {
      name: 'OneIndia Tamil',
      url: 'https://tamil.oneindia.com/rss/tamil-news-fb.xml'
    }
  ];

  static async fetchNews(): Promise<NewsItem[]> {
    let allNews: NewsItem[] = [];
    
    // Attempt to load from cache first for offline resilience
    try {
      const cached = await AsyncStorage.getItem('@rss_news_cache');
      if (cached) {
        const parsedCache = JSON.parse(cached);
        if (parsedCache.length > 0) {
          allNews = parsedCache; // We'll return this later if fetch fails, or return it immediately for instant load
        }
      }
    } catch (e) {
      console.warn("Error reading RSS cache", e);
    }

    let fetchedNews: NewsItem[] = [];
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_"
    });

    for (const feed of this.feeds) {
      try {
        const response = await fetch(feed.url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const xmlText = await response.text();
        const result = parser.parse(xmlText);
        
        const channel = result?.rss?.channel;
        if (channel && channel.item) {
          const items = Array.isArray(channel.item) ? channel.item : [channel.item];
          
          for (const item of items) {
            let desc = item.description || '';
            let imageUrl: string | undefined = undefined;

            // Extract image from enclosure if present
            if (item.enclosure && item.enclosure['@_url']) {
              imageUrl = item.enclosure['@_url'];
            } else if (desc.includes('<img')) {
              // Extract from HTML description
              const match = desc.match(/src="([^"]+)"/);
              if (match) {
                imageUrl = match[1];
              }
            }

            // Clean up description HTML
            desc = desc.replace(/<[^>]*>?/gm, '').replace(/&[^;]+;/gm, '').trim();

            fetchedNews.push({
              title: (item.title || 'No Title').trim(),
              link: (item.link || '').trim(),
              pubDate: (item.pubDate || '').trim(),
              description: desc.length > 100 ? `${desc.substring(0, 100)}...` : desc,
              imageUrl,
              source: feed.name,
            });
          }
        }
      } catch (error) {
        console.error(`Error fetching RSS ${feed.name}:`, error);
      }
    }

    if (fetchedNews.length > 0) {
      try {
        await AsyncStorage.setItem('@rss_news_cache', JSON.stringify(fetchedNews));
      } catch (e) {
        console.warn("Error saving RSS cache", e);
      }
      return fetchedNews;
    }

    return allNews; // Return cached news if network fetch failed completely
  }
}
