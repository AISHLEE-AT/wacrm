/**
 * Kindle AI Content Engine — Client-Side Async Wrapper
 * 
 * Calls the /api/kindle-ai server endpoint to generate unique, AI-powered
 * Kindle study content for each micro-topic. Falls back to the existing
 * keyword-based engine on failure.
 */

import { KindleTopicBook, generateKindleBook } from './kindleContentEngine';

// ── In-memory client-side cache to prevent re-fetches within session ───
const sessionCache = new Map<string, KindleTopicBook>();

export interface KindleAIOptions {
  topicTitle: string;
  courseTitle: string;
  board?: string;
  standard?: string;
  category?: string;
  /** Timeout in ms before falling back to keyword engine (default: 12000) */
  timeoutMs?: number;
}

export interface KindleAIResult {
  book: KindleTopicBook;
  source: 'ai' | 'cache' | 'session-cache' | 'fallback';
  model?: string;
  latencyMs?: number;
}

/**
 * Generate unique Kindle content using Gemini AI.
 * Falls back to the existing keyword-based engine on any failure.
 */
export async function generateKindleBookAI(options: KindleAIOptions): Promise<KindleAIResult> {
  const {
    topicTitle,
    courseTitle,
    board = 'General',
    standard = '',
    category = '',
    timeoutMs = 12000,
  } = options;

  // Check session cache first (instant, no network)
  const sessionKey = `${topicTitle}::${courseTitle}`.toLowerCase();
  const cached = sessionCache.get(sessionKey);
  if (cached) {
    return { book: cached, source: 'session-cache', latencyMs: 0 };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch('/api/kindle-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topicTitle, courseTitle, board, standard }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      if (errorData.fallback) {
        // Server told us to fallback
        throw new Error(errorData.error || 'Server indicated fallback');
      }
      throw new Error(`HTTP ${res.status}: ${errorData.error || 'Unknown error'}`);
    }

    const data = await res.json();
    const meta = data._meta || {};
    
    // Strip _meta from the book data
    const { _meta, ...bookData } = data;
    
    // Ensure required fields exist
    const book: KindleTopicBook = {
      topicTitle: bookData.topicTitle || topicTitle,
      courseTitle: bookData.courseTitle || courseTitle,
      category: bookData.category || category || 'Academic',
      readingTime: bookData.readingTime || '6 min read',
      overview: bookData.overview || '',
      coreConcepts: bookData.coreConcepts || [],
      tamilExplanation: bookData.tamilExplanation || {
        simpleTitle: topicTitle,
        colloquialIntro: '',
        everydayAnalogy: '',
        keyPointsTamil: [],
      },
      vsaqs: bookData.vsaqs || [],
      shortAnswers: bookData.shortAnswers || [],
      mcqs: bookData.mcqs || [],
      formulasAndMnemonics: bookData.formulasAndMnemonics || [],
    };

    // Store in session cache
    sessionCache.set(sessionKey, book);

    return {
      book,
      source: meta.source === 'cache' ? 'cache' : 'ai',
      model: meta.model,
      latencyMs: meta.latencyMs,
    };

  } catch (err: any) {
    console.warn('[KindleAI] AI generation failed, falling back to keyword engine:', err.message);
    
    // Fallback to existing keyword-based engine
    const fallbackBook = generateKindleBook(topicTitle, courseTitle, category);
    return {
      book: fallbackBook,
      source: 'fallback',
      latencyMs: 0,
    };
  }
}

/**
 * Clear the session cache (useful when switching courses)
 */
export function clearKindleSessionCache(): void {
  sessionCache.clear();
}
