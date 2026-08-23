import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lmsSupabase as supabase } from './lms-supabase';

export interface TopicContent {
  topicKey: string;
  topicTitle: string;
  courseTitle?: string;
  subject?: string;
  notes?: {
    overview: string;
    keyPoints: string[];
    coreConcepts?: {
      heading: string;
      body: string;
      formulaOrExample?: string;
    }[];
    bilingualExplanation?: {
      tamil: string;
      english: string;
    };
    formulasAndShortcuts?: {
      name: string;
      formula: string;
      tip?: string;
    }[];
  };
  mcqs?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
  oneLineQnA?: {
    question: string;
    answer: string;
  }[];
  twoMarkQuestions?: {
    question: string;
    marks: number;
    modelAnswer: string;
  }[];
  fiveMarkQuestions?: {
    question: string;
    marks: number;
    stepByStepSolution: string[];
  }[];
  essayQuestions?: {
    question: string;
    marks: number;
    structuredOutline: string[];
    modelEssay: string;
  }[];
  videoMeta?: {
    youtubeVideoId: string;
    videoTitle: string;
    durationMinutes: number;
  };
}

const CACHE_PREFIX = 'TEACHO_TOPIC_CACHE_';

export function useTopicMastery(topicKey?: string, fallbackTitle?: string, fallbackSubject?: string) {
  const [data, setData] = useState<TopicContent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!topicKey && !fallbackTitle) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function loadTopic() {
      setLoading(true);
      setError(null);

      const cacheKey = `${CACHE_PREFIX}${topicKey || fallbackTitle}`;

      // 1. Try local AsyncStorage cache for instant 60fps load
      try {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached && isMounted) {
          const parsed = JSON.parse(cached);
          setData(parsed);
          setLoading(false);
        }
      } catch (e) {
        // Cache miss
      }

      // 2. Query Supabase kindle_content_cache
      try {
        let queryKey = topicKey;
        if (!queryKey && fallbackTitle) {
          queryKey = fallbackTitle.toLowerCase().replace(/[^a-z0-9_]/g, '_');
        }

        // Try exact topic_key match or title match
        const { data: dbData, error: dbError } = await supabase
          .from('kindle_content_cache')
          .select('*')
          .or(`topic_key.eq.${queryKey},topic_title.ilike.%${fallbackTitle || queryKey}%`)
          .limit(1)
          .maybeSingle();

        if (dbData && dbData.kindle_json && isMounted) {
          const content: TopicContent = {
            topicKey: dbData.topic_key || queryKey || 'unknown',
            topicTitle: dbData.topic_title || fallbackTitle || 'Topic',
            courseTitle: dbData.course_title || 'TeachO Mastery',
            subject: dbData.kindle_json.subject || fallbackSubject || 'General',
            notes: dbData.kindle_json.notes || {
              overview: dbData.kindle_json.notes?.overview || `${fallbackTitle || 'Topic'} comprehensive core notes and exam essentials.`,
              keyPoints: dbData.kindle_json.notes?.keyPoints || ['Core principle understanding', 'Standard examination formula application']
            },
            mcqs: dbData.kindle_json.mcqs || [],
            oneLineQnA: dbData.kindle_json.oneLineQnA || [],
            twoMarkQuestions: dbData.kindle_json.twoMarkQuestions || [],
            fiveMarkQuestions: dbData.kindle_json.fiveMarkQuestions || [],
            essayQuestions: dbData.kindle_json.essayQuestions || [],
            videoMeta: dbData.kindle_json.videoMeta
          };

          setData(content);
          setLoading(false);

          // Save to local cache
          AsyncStorage.setItem(cacheKey, JSON.stringify(content)).catch(() => {});
          return;
        }

        // 3. If not in kindle cache, construct clean smart fallback
        if (isMounted) {
          const fallbackContent: TopicContent = {
            topicKey: queryKey || 'topic_fallback',
            topicTitle: fallbackTitle || 'Core Concept',
            subject: fallbackSubject || 'General',
            notes: {
              overview: `Fundamental concepts, governing laws, derivations, and exam heuristics for ${fallbackTitle || 'this topic'}.`,
              keyPoints: [
                `Axiomatic rule and standard definitions for ${fallbackTitle || 'the concept'}.`,
                'High-yield problem solving and formula application in board and competitive exams.',
                'Follow structured step-by-step methods to avoid common pitfalls.'
              ],
              bilingualExplanation: {
                tamil: `இப்பாடத்தின் அடிப்படைக் கருத்துக்கள் மற்றும் தேர்வுக்கான முக்கிய குறிப்புகள்: ${fallbackTitle || ''}.`,
                english: `Core principles and key examination takeaways for ${fallbackTitle || 'this topic'}.`
              }
            },
            mcqs: [
              {
                question: `What is the primary governing principle of ${fallbackTitle || 'this concept'}?`,
                options: [
                  'Fundamental law and definition',
                  'Random assumption',
                  'Unverified rule',
                  'None of the above'
                ],
                correctIndex: 0,
                explanation: `The fundamental law establishes the primary governing relation for ${fallbackTitle || 'this concept'}.`
              }
            ]
          };

          setData(fallbackContent);
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    }

    loadTopic();

    return () => {
      isMounted = false;
    };
  }, [topicKey, fallbackTitle]);

  return { topicContent: data, loading, error };
}
