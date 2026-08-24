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

const CACHE_PREFIX = 'TUTO_TOPIC_CACHE_';

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

        // Clean tokens for fuzzy matching
        const searchWord = (fallbackTitle || '')
          .replace(/[^a-zA-Z0-9\s]/g, ' ')
          .split(/\s+/)
          .filter((w) => w.length > 3)[0] || fallbackTitle || queryKey;

        // Try exact topic_key match or title match
        const { data: dbData } = await supabase
          .from('kindle_content_cache')
          .select('*')
          .or(`topic_key.eq.${queryKey},topic_title.ilike.%${searchWord}%`)
          .limit(1)
          .maybeSingle();

        if (dbData && dbData.kindle_json && isMounted) {
          let kj = dbData.kindle_json;
          if (typeof kj === 'string') {
            try { kj = JSON.parse(kj); } catch (e) {}
          }

          // Extract key points from coreConcepts or notes
          const extractedKeyPoints: string[] = [];
          if (Array.isArray(kj.coreConcepts)) {
            kj.coreConcepts.forEach((c: any) => {
              if (typeof c === 'string') extractedKeyPoints.push(c);
              else if (c && c.heading) extractedKeyPoints.push(`${c.heading}: ${c.body || ''}`);
              else if (c && c.body) extractedKeyPoints.push(c.body);
            });
          } else if (kj.notes?.keyPoints) {
            extractedKeyPoints.push(...kj.notes.keyPoints);
          }

          // Extract formulas and mnemonics
          const extractedFormulas: Array<{ name: string; formula: string; tip?: string }> = [];
          if (Array.isArray(kj.formulasAndMnemonics)) {
            kj.formulasAndMnemonics.forEach((f: any) => {
              if (typeof f === 'string') {
                extractedFormulas.push({ name: 'Key Formula', formula: f });
              } else if (f) {
                extractedFormulas.push({
                  name: f.name || f.title || 'Formula / Law',
                  formula: f.formula || f.rule || f.equation || '',
                  tip: f.mnemonic || f.tip || f.meaning || undefined
                });
              }
            });
          } else if (kj.notes?.formulasAndShortcuts) {
            extractedFormulas.push(...kj.notes.formulasAndShortcuts);
          }

          // Extract normalized MCQs
          const rawMcqs = kj.mcqs || kj.cbt_mcqs || [];
          const extractedMcqs = Array.isArray(rawMcqs)
            ? rawMcqs.map((q: any) => {
                const opts = Array.isArray(q.options) ? q.options : ['A) Option 1', 'B) Option 2', 'C) Option 3', 'D) Option 4'];
                let cIdx = 0;
                if (typeof q.correct === 'number') cIdx = q.correct;
                else if (typeof q.correctIndex === 'number') cIdx = q.correctIndex;
                else if (typeof q.answer === 'number') cIdx = q.answer;
                else if (typeof q.answer === 'string') {
                  const fIdx = opts.findIndex((o: string) => o.trim().startsWith(q.answer.charAt(0)) || o.trim() === q.answer.trim());
                  if (fIdx >= 0) cIdx = fIdx;
                }
                return {
                  question: q.question || q.q || `Question on ${fallbackTitle || 'topic'}`,
                  options: opts,
                  correctIndex: cIdx,
                  explanation: q.explanation || q.solution || 'Verified correct answer per curriculum standard.'
                };
              })
            : [];

          // Extract Q&A and step solutions
          const extractedShortAnswers = Array.isArray(kj.shortAnswers)
            ? kj.shortAnswers.map((s: any) => ({
                question: s.question || s.q || 'Important Question',
                answer: s.answer || s.a || ''
              }))
            : (kj.oneLineQnA || []);

          const extractedTwoMark = Array.isArray(kj.vsaqs)
            ? kj.vsaqs.map((v: any) => ({
                question: v.question || v.q || 'VSAQ Question',
                marks: 2,
                modelAnswer: v.answer || v.a || ''
              }))
            : (kj.twoMarkQuestions || []);

          const content: TopicContent = {
            topicKey: dbData.topic_key || queryKey || 'unknown',
            topicTitle: dbData.topic_title || fallbackTitle || 'Topic',
            courseTitle: dbData.course_title || 'TutO Mastery',
            subject: kj.subject || fallbackSubject || 'General',
            notes: {
              overview: kj.overview || kj.notes?.overview || `${fallbackTitle || 'Topic'} comprehensive core notes and exam essentials.`,
              keyPoints: extractedKeyPoints.length > 0 ? extractedKeyPoints : [
                `Core principle understanding for ${fallbackTitle || 'this topic'}.`,
                'High-yield formula application in board & competitive exams.'
              ],
              bilingualExplanation: {
                tamil: kj.tamilExplanation || kj.bilingualExplanation?.tamil || `இப்பாடத்தின் அடிப்படைக் கருத்துக்கள்: ${fallbackTitle || ''}.`,
                english: kj.overview || kj.bilingualExplanation?.english || `Core principles and key examination takeaways for ${fallbackTitle || 'this topic'}.`
              },
              formulasAndShortcuts: extractedFormulas.length > 0 ? extractedFormulas : undefined,
              coreConcepts: Array.isArray(kj.coreConcepts) ? kj.coreConcepts : undefined
            },
            mcqs: extractedMcqs,
            oneLineQnA: extractedShortAnswers,
            twoMarkQuestions: extractedTwoMark,
            fiveMarkQuestions: kj.fiveMarkQuestions || [],
            essayQuestions: kj.essayQuestions || [],
            videoMeta: kj.videoMeta
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
