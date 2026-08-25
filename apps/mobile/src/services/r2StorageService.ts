/**
 * ☁️ SuprO Mobile Cloudflare R2 Content Storage Service
 * 
 * High-performance, zero-latency content loader for:
 *   1. Micro-Topic 7-tier Kindle Player Content
 *   2. 2 Lakh+ QBank MCQs (by category or sequence range)
 *   3. 300-Day Whole Year Curriculum Plans
 * 
 * Features:
 *   - L1: Fast Memory Cache
 *   - L2: Persistent Offline AsyncStorage Cache
 *   - L3: Cloudflare R2 Global Edge CDN
 *   - L4: Supabase / Local Fallback
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Base API / R2 CDN URL
const R2_BASE_URL = 'https://thamizhan.vercel.app/api/content/r2';
const R2_PUBLIC_CDN = 'https://supro-content.r2.dev';

// In-Memory Cache
const memoryCache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 Hours

export class R2ContentService {
  /**
   * Fetch a Micro-Topic Course Player Node
   */
  static async getMicroTopicNode(topicKey: string): Promise<any | null> {
    const cacheKey = `r2_micro_${topicKey}`;
    
    // 1. Check L1 Memory
    const memHit = memoryCache.get(cacheKey);
    if (memHit && memHit.expiry > Date.now()) {
      return memHit.data;
    }

    // 2. Check L2 AsyncStorage
    try {
      const localStr = await AsyncStorage.getItem(cacheKey);
      if (localStr) {
        const parsed = JSON.parse(localStr);
        memoryCache.set(cacheKey, { data: parsed, expiry: Date.now() + CACHE_TTL_MS });
        return parsed;
      }
    } catch (e) {
      // Continue to network
    }

    // 3. Fetch from Cloudflare R2 via API
    try {
      const url = `${R2_BASE_URL}?type=micro_topic&topic=${encodeURIComponent(topicKey)}`;
      const res = await fetch(url, { method: 'GET' });
      if (res.ok) {
        const json = await res.json();
        // Save to L1 & L2
        memoryCache.set(cacheKey, { data: json, expiry: Date.now() + CACHE_TTL_MS });
        AsyncStorage.setItem(cacheKey, JSON.stringify(json)).catch(() => {});
        return json;
      }
    } catch (netErr) {
      console.warn(`[R2 Service] Network fetch failed for topic "${topicKey}":`, netErr);
    }

    return null;
  }

  /**
   * Fetch QBank MCQs for a Category from Cloudflare R2
   */
  static async getCategoryMCQs(category: string): Promise<any[] | null> {
    const cacheKey = `r2_qbank_cat_${category.toUpperCase()}`;

    // Check L1
    const memHit = memoryCache.get(cacheKey);
    if (memHit && memHit.expiry > Date.now()) {
      return memHit.data;
    }

    // Check L2
    try {
      const localStr = await AsyncStorage.getItem(cacheKey);
      if (localStr) {
        const parsed = JSON.parse(localStr);
        memoryCache.set(cacheKey, { data: parsed, expiry: Date.now() + CACHE_TTL_MS });
        return parsed;
      }
    } catch (e) {}

    // Fetch from R2
    try {
      const url = `${R2_BASE_URL}?type=qbank_category&category=${encodeURIComponent(category)}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        const list = Array.isArray(json) ? json : json.questions || [];
        if (list.length > 0) {
          memoryCache.set(cacheKey, { data: list, expiry: Date.now() + CACHE_TTL_MS });
          AsyncStorage.setItem(cacheKey, JSON.stringify(list)).catch(() => {});
          return list;
        }
      }
    } catch (e) {
      console.warn(`[R2 Service] Failed to fetch category "${category}" from R2:`, e);
    }

    return null;
  }

  /**
   * Fetch QBank MCQs by sequence block (e.g. 1_100, 101_200)
   */
  static async getSequenceBlockMCQs(blockName: string): Promise<any[] | null> {
    const cacheKey = `r2_qbank_block_${blockName}`;

    const memHit = memoryCache.get(cacheKey);
    if (memHit && memHit.expiry > Date.now()) {
      return memHit.data;
    }

    try {
      const url = `${R2_BASE_URL}?type=qbank_block&block=${encodeURIComponent(blockName)}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        const list = Array.isArray(json) ? json : json.questions || [];
        memoryCache.set(cacheKey, { data: list, expiry: Date.now() + CACHE_TTL_MS });
        AsyncStorage.setItem(cacheKey, JSON.stringify(list)).catch(() => {});
        return list;
      }
    } catch (e) {
      console.warn(`[R2 Service] Failed block fetch for "${blockName}":`, e);
    }

    return null;
  }
}
