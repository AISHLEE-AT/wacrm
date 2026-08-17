import * as SecureStore from 'expo-secure-store';
import { XMLParser } from 'fast-xml-parser';

export interface AishleeVideoInfo {
  videoId: string;
  title: string;
  published: string;
}

const AISHLEE_CHANNEL_ID = 'UC0K47n1iAXa_aAKhGZzdhDQ';
const RSS_FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${AISHLEE_CHANNEL_ID}`;
const DAILY_VIDEO_KEY = 'aishlee-daily-video-date';
const CACHED_VIDEO_ID_KEY = 'aishlee-cached-video-id';

// Reliable fallback video ID from @aishleetechnology if offline
const FALLBACK_VIDEO: AishleeVideoInfo = {
  videoId: '07FG8UfsWag',
  title: 'SuprO Daily Inspiration',
  published: new Date().toISOString(),
};

export const aishleeChannelService = {
  /**
   * Fetches the latest updated video from @aishleetechnology YouTube channel.
   * Uses fast-xml-parser on the official YouTube RSS feed.
   */
  async getLatestVideo(): Promise<AishleeVideoInfo> {
    try {
      const response = await fetch(RSS_FEED_URL, {
        headers: {
          'Accept': 'application/xml, text/xml, */*',
          'User-Agent': 'SuprOMobileApp/3.0',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const xmlText = await response.text();
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
      });
      const parsedData = parser.parse(xmlText);

      const feed = parsedData?.feed;
      const entries = feed?.entry;

      if (!entries) {
        throw new Error('No entries found in RSS feed');
      }

      // Handle both single entry object or array of entries
      const latestEntry = Array.isArray(entries) ? entries[0] : entries;
      const videoId =
        latestEntry['yt:videoId'] ||
        (typeof latestEntry.id === 'string' && latestEntry.id.replace('yt:video:', '')) ||
        FALLBACK_VIDEO.videoId;

      const title = latestEntry.title || FALLBACK_VIDEO.title;
      const published = latestEntry.published || FALLBACK_VIDEO.published;

      const videoInfo: AishleeVideoInfo = {
        videoId: String(videoId).trim(),
        title: typeof title === 'string' ? title : String(title?.['#text'] || FALLBACK_VIDEO.title),
        published: typeof published === 'string' ? published : String(published?.['#text'] || ''),
      };

      // Cache the latest video ID
      await SecureStore.setItemAsync(CACHED_VIDEO_ID_KEY, videoInfo.videoId).catch(() => {});

      return videoInfo;
    } catch (error) {
      console.warn('Could not fetch latest YouTube RSS feed, falling back to cache:', error);
      const cachedId = await SecureStore.getItemAsync(CACHED_VIDEO_ID_KEY).catch(() => null);
      return {
        videoId: cachedId || FALLBACK_VIDEO.videoId,
        title: FALLBACK_VIDEO.title,
        published: FALLBACK_VIDEO.published,
      };
    }
  },

  /**
   * Checks if today's daily video has already been watched.
   * Returns true if today's date matches the saved date.
   */
  async isDailyVideoWatchedToday(): Promise<boolean> {
    try {
      const savedDate = await SecureStore.getItemAsync(DAILY_VIDEO_KEY);
      const todayDate = new Date().toISOString().split('T')[0];
      return savedDate === todayDate;
    } catch (e) {
      return false;
    }
  },

  /**
   * Marks today's video as watched by storing today's YYYY-MM-DD in SecureStore.
   */
  async markDailyVideoWatched(): Promise<void> {
    try {
      const todayDate = new Date().toISOString().split('T')[0];
      await SecureStore.setItemAsync(DAILY_VIDEO_KEY, todayDate);
    } catch (e) {
      console.warn('Failed to save daily video date:', e);
    }
  },
};
