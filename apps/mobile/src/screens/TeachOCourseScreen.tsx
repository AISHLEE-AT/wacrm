import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  StatusBar,
  Modal,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Share,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import {
  PlayCircle,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Sparkles,
  FileText,
  FileCheck2,
  CheckCircle2,
  X,
  BookOpen,
  Network,
  MessageSquare,
  Download,
  Share2,
  Send,
  Lightbulb,
  Check,
  Zap,
} from 'lucide-react-native';
import { aishleeSupabase } from '../services/aishleeSupabase';
import { geminiToolsService } from '../services/geminiToolsService';
import { getCourseSyllabus, SyllabusUnit } from '../lib/courseCatalogMaster';
import { generateKindleBook } from '../lib/kindleContentEngine';

function normalizeMobileCoursePayload(raw: any, topicTitle: string, courseTitle: string): any {
  if (!raw) return null;
  const overview = raw.notes?.overview || raw.overview || 'Comprehensive lesson module notes and core conceptual breakdown.';
  const coreConcepts = (raw.notes?.coreConcepts && Array.isArray(raw.notes.coreConcepts) && raw.notes.coreConcepts.length > 0)
    ? raw.notes.coreConcepts
    : (raw.coreConcepts || []);
  const keyPoints = (raw.notes?.keyPoints && Array.isArray(raw.notes.keyPoints) && raw.notes.keyPoints.length > 0)
    ? raw.notes.keyPoints
    : (raw.keyPoints || []);

  // Tamil Explanation & Analogies
  const tamilExplanation = raw.tamilExplanation || (raw.notes?.bilingualExplanation?.tamil ? {
    colloquialIntro: raw.notes.bilingualExplanation.tamil,
    everydayAnalogy: raw.notes.bilingualExplanation.tamil
  } : {
    colloquialIntro: 'பாடத்தின் அடிப்படைக் கருத்துக்களை எளிமையாகப் புரிந்து கொள்ளவும்.',
    everydayAnalogy: 'நடைமுறை வாழ்க்கையோடு ஒப்பிட்டுப் படிக்கும் போது நினைவில் எளிதாக நிற்கும்!'
  });

  // VSAQs (1-mark Q&A / Flashcards)
  const vsaqs = (raw.oneLineQnA && Array.isArray(raw.oneLineQnA) && raw.oneLineQnA.length > 0)
    ? raw.oneLineQnA
    : (raw.vsaqs || [
        { question: `What is the core definition of ${topicTitle}?`, answer: `Fundamental concept for ${courseTitle}.` },
        { question: `What is the primary exam takeaway?`, answer: 'Focus on root concepts, formulas, and verified steps.' }
      ]);

  // Short Answers (2 & 5 marks)
  const shortAnswers = (raw.twoMarkQuestions && Array.isArray(raw.twoMarkQuestions) && raw.twoMarkQuestions.length > 0)
    ? raw.twoMarkQuestions.map((q: any) => ({
        question: q.question,
        marks: `${q.marks || 2} Marks`,
        solutionSteps: q.keyPointsToInclude || [q.modelAnswer || ''],
        keyTips: 'Ensure exact definitions, step clarity, and diagram labeling.'
      }))
    : (raw.shortAnswers || []);

  // 30 MCQs / CBT Questions
  const mcqs = (raw.mcqs && Array.isArray(raw.mcqs) && raw.mcqs.length > 0)
    ? raw.mcqs.map((m: any) => ({
        question: m.question,
        options: m.options || [],
        correct: typeof m.correctIndex === 'number' ? m.correctIndex : (typeof m.correct === 'number' ? m.correct : 0),
        explanation: m.explanation || 'Refer to verified syllabus rationale.'
      }))
    : (raw.practiceMCQs || []);

  // Formulas & Shortcuts
  const formulasAndMnemonics = (raw.notes?.formulasAndShortcuts && Array.isArray(raw.notes.formulasAndShortcuts) && raw.notes.formulasAndShortcuts.length > 0)
    ? raw.notes.formulasAndShortcuts.map((f: any) => ({
        formula: f.formula || f.name,
        meaning: f.name || 'Governing Rule',
        mnemonic: f.tip || f.mnemonic || ''
      }))
    : (raw.formulasAndMnemonics || []);

  return {
    topicTitle: raw.topicTitle || topicTitle,
    courseTitle: raw.courseTitle || courseTitle,
    readingTime: '8 min read',
    overview,
    coreConcepts,
    keyPoints,
    tamilExplanation,
    vsaqs,
    shortAnswers,
    mcqs,
    formulasAndMnemonics
  };
}

export default function TeachOCourseScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { course } = route.params;

  // Dedicated Course Syllabus with Master Resolver Fallback
  const courseUnits: SyllabusUnit[] = (course.metadata?.syllabus && Array.isArray(course.metadata.syllabus) && course.metadata.syllabus.length > 0)
    ? course.metadata.syllabus
    : getCourseSyllabus(course.id || course.title_name, course.category);

  const [activeCourseTab, setActiveCourseTab] = useState<'curriculum' | 'notes' | 'mindmap' | 'forum'>('curriculum');
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({});

  // AI Tutor Modal
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [aiPromptTitle, setAiPromptTitle] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Q&A Forum State
  const [forumQuestion, setForumQuestion] = useState('');
  const [forumPosts, setForumPosts] = useState<any[]>([
    {
      id: '1',
      author: 'Karthik R.',
      question: 'How do we solve chapter problems in under 60 seconds for competitive exams?',
      answer: '🤖 AI Tutor: Focus on identifying the given values first, eliminate options using unit consistency, and memorize the 10 core shortcut formulas.',
      time: '2 hours ago',
    },
    {
      id: '2',
      author: 'Priya S.',
      question: 'Where can I find the official Tamil Nadu State Board solution notes for Unit 2?',
      answer: '🤖 AI Tutor: You can open the "Notes & PDF" tab right here to download the verified PDF summary and formula sheets.',
      time: 'Yesterday',
    },
  ]);
  const [isAskingForum, setIsAskingForum] = useState(false);

  // Course Player Reader State (Formerly Kindle)
  const [playerBook, setPlayerBook] = useState<any | null>(null);
  const [playerTab, setPlayerTab] = useState<'theory' | 'tamil' | 'vsaq' | 'solutions' | 'mcq' | 'formulas'>('theory');
  const [playerTheme, setPlayerTheme] = useState<'dark' | 'sepia' | 'light'>('dark');
  const [playerLoading, setPlayerLoading] = useState(false);
  const [playerSource, setPlayerSource] = useState<'cache' | 'ai' | 'fallback'>('cache');
  const [userMcqAnswers, setUserMcqAnswers] = useState<Record<number, number>>({});
  const [revealedVsaq, setRevealedVsaq] = useState<Record<number, boolean>>({});

  const generateCoursePlayerFallback = (topic: string, courseTitle: string) => {
    const cleanTopic = topic || 'Core Fundamentals';
    const cleanCourse = courseTitle || 'Masterclass Course';
    return generateKindleBook(cleanTopic, cleanCourse, course?.category || '');
  };

  const openCoursePlayer = async (
    topic: string,
    initialTab: 'theory' | 'tamil' | 'vsaq' | 'solutions' | 'mcq' | 'formulas' = 'theory',
    dayNumber: number = 1,
    explicitTopicKey?: string
  ) => {
    const cleanTopic = topic || 'Core Fundamentals';
    setPlayerTab(initialTab);
    setUserMcqAnswers({});
    setRevealedVsaq({});
    setPlayerLoading(true);

    const courseId = course.id || course.title_name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const candidateKeys = [
      explicitTopicKey,
      `${courseId}_day_${dayNumber}_task_1`,
      `${courseId}_day_${dayNumber}`,
      `${course.title_name}_day_${dayNumber}`.toLowerCase().replace(/[^a-z0-9_]/g, '_')
    ].filter(Boolean) as string[];

    let loadedPayload: any = null;

    // 1. Check Supabase LMS DB (kindle_content_cache)
    try {
      for (const key of candidateKeys) {
        const { data, error } = await aishleeSupabase
          .from('kindle_content_cache')
          .select('kindle_json, model_used')
          .eq('topic_key', key)
          .limit(1);

        if (!error && data && data.length > 0 && data[0].kindle_json) {
          loadedPayload = data[0].kindle_json;
          setPlayerSource('cache');
          break;
        }
      }
    } catch (e) {
      // Non-blocking fallback
    }

    // 2. Check Cloudflare R2 Primary DB (CDN Edge Direct)
    if (!loadedPayload && courseId) {
      const r2Urls = [
        `https://pub-672098863d97ed3208c7c47a8091e5dd.r2.dev/course_json/batch_curriculum/${courseId}/${courseId}_day_${dayNumber}_task_1.json`,
        `https://pub-672098863d97ed3208c7c47a8091e5dd.r2.dev/course_json/batch_curriculum/${courseId}/${courseId}_day_${dayNumber}.json`
      ];

      for (const r2Url of r2Urls) {
        try {
          const res = await fetch(r2Url);
          if (res.ok) {
            const r2Json = await res.json();
            if (r2Json && (r2Json.notes || r2Json.overview || r2Json.mcqs)) {
              loadedPayload = r2Json;
              setPlayerSource('cache');
              break;
            }
          }
        } catch (r2Err) {
          // Non-blocking fallback
        }
      }
    }

    if (loadedPayload) {
      const normalized = normalizeMobileCoursePayload(loadedPayload, cleanTopic, course.title_name);
      setPlayerBook(normalized);
    } else {
      const fallbackBook = generateCoursePlayerFallback(cleanTopic, course.title_name);
      setPlayerBook(fallbackBook);
      setPlayerSource('fallback');
    }
    setPlayerLoading(false);
  };

  const exportCoursePlayerPDF = async (book: any) => {
    try {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 24px; color: #0f172a; line-height: 1.6; }
            .header { border-bottom: 3px solid #10b981; padding-bottom: 12px; margin-bottom: 20px; }
            .badge { display: inline-block; background: #ecfdf5; color: #059669; font-weight: bold; font-size: 11px; padding: 4px 10px; border-radius: 6px; border: 1px solid #10b981; text-transform: uppercase; margin-bottom: 6px; }
            h1 { font-size: 24px; margin: 0 0 6px 0; color: #047857; }
            h2 { font-size: 16px; margin: 0 0 4px 0; color: #64748b; font-weight: normal; }
            .section-title { font-size: 16px; font-weight: bold; color: #0f172a; border-left: 4px solid #10b981; padding-left: 10px; margin: 24px 0 12px 0; text-transform: uppercase; }
            .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 12px; }
            .tamil-card { background: #fefce8; border: 1px solid #fef08a; border-radius: 8px; padding: 14px; margin-bottom: 12px; }
            .card-title { font-weight: bold; color: #0f172a; margin-bottom: 6px; font-size: 13px; }
            .tamil-text { font-size: 13px; color: #713f12; line-height: 1.6; }
            .vsaq-q { font-weight: bold; color: #1e293b; font-size: 13px; }
            .vsaq-a { color: #059669; font-size: 12px; margin-top: 4px; }
            .mcq-opt { margin-left: 16px; color: #475569; font-size: 12px; margin-top: 3px; }
            .mcq-correct { font-weight: bold; color: #059669; }
            .footer { text-align: center; margin-top: 40px; border-top: 1px solid #cbd5e1; padding-top: 16px; font-size: 11px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="badge">Interactive Course Player • SuprO TeachO</div>
            <h1>${book.topicTitle}</h1>
            <h2>${book.courseTitle} • ${book.readingTime || '6 min read'}</h2>
          </div>

          <div class="section-title">1. Theoretical Overview & Foundations</div>
          <div class="card">
            <p style="font-size: 13px; color: #334155; margin: 0;">${book.overview}</p>
          </div>

          ${book.coreConcepts?.map((c: any) => `
            <div class="card">
              <div class="card-title">${c.heading}</div>
              <p style="font-size: 12px; color: #475569; margin: 0 0 6px 0;">${c.content}</p>
              ${c.example ? `<p style="font-size: 11px; color: #059669; margin: 0; font-style: italic;"><strong>Example:</strong> ${c.example}</p>` : ''}
            </div>
          `).join('')}

          <div class="section-title">2. தமிழில் எளிய விளக்கம் (Tamil Explanation)</div>
          <div class="tamil-card">
            <div class="card-title" style="color: #854d0e;">${book.tamilExplanation?.simpleTitle || 'முழு விளக்கம்'}</div>
            <p class="tamil-text">${book.tamilExplanation?.colloquialIntro || ''}</p>
            ${book.tamilExplanation?.everydayAnalogy ? `<p class="tamil-text" style="font-style: italic;"><strong>நடைமுறை உதாரணம்:</strong> ${book.tamilExplanation?.everydayAnalogy}</p>` : ''}
            ${book.tamilExplanation?.keyPointsTamil?.map((pt: string) => `<p class="tamil-text" style="margin: 3px 0;">• ${pt}</p>`).join('')}
          </div>

          <div class="section-title">3. Flashcard VSAQs (1-Mark Questions)</div>
          ${book.vsaqs?.map((v: any, i: number) => `
            <div class="card">
              <div class="vsaq-q">Q${i+1}: ${v.question}</div>
              <div class="vsaq-a">Ans: ${v.answer}</div>
            </div>
          `).join('')}

          <div class="section-title">4. Step-by-Step Solutions (2 & 5 Marks)</div>
          ${book.shortAnswers?.map((sa: any, i: number) => `
            <div class="card">
              <div class="card-title">${sa.question} <span style="color: #059669;">(${sa.marks})</span></div>
              ${sa.solutionSteps?.map((step: string, sIdx: number) => `<p style="font-size: 12px; color: #334155; margin: 3px 0;"><strong>Step ${sIdx+1}:</strong> ${step}</p>`).join('')}
              ${sa.keyTips ? `<p style="font-size: 11px; color: #d97706; margin-top: 6px;"><strong>💡 Examiner Tip:</strong> ${sa.keyTips}</p>` : ''}
            </div>
          `).join('')}

          <div class="section-title">5. High-Yield Practice MCQs</div>
          ${book.mcqs?.map((m: any, i: number) => `
            <div class="card">
              <div class="vsaq-q">Q${i+1}: ${m.question}</div>
              ${m.options?.map((opt: string, optIdx: number) => `
                <div class="mcq-opt ${optIdx === m.correct ? 'mcq-correct' : ''}">
                  ${opt} ${optIdx === m.correct ? '✓ (Correct)' : ''}
                </div>
              `).join('')}
              <p style="font-size: 11px; color: #64748b; margin-top: 6px; font-style: italic;"><strong>Explanation:</strong> ${m.explanation}</p>
            </div>
          `).join('')}

          <div class="section-title">6. Formula Cheat Sheet & Mnemonics</div>
          ${book.formulasAndMnemonics?.map((f: any) => `
            <div class="card">
              <div class="card-title" style="font-family: monospace; color: #0284c7;">${f.formula}</div>
              <p style="font-size: 12px; color: #475569; margin: 2px 0;">${f.meaning}</p>
              ${f.mnemonic ? `<p style="font-size: 11px; color: #d97706; margin: 2px 0;"><strong>🧠 Mnemonic:</strong> ${f.mnemonic}</p>` : ''}
            </div>
          `).join('')}

          <div class="footer">
            Generated via SuprO TeachO Course Player • High-Yield Interactive Study Series
          </div>
        </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (e: any) {
      Alert.alert('PDF Export', 'Unable to export PDF: ' + e.message);
    }
  };

  const toggleModule = (moduleKey: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleKey]: prev[moduleKey] === undefined ? false : !prev[moduleKey],
    }));
  };

  const toggleLessonComplete = (lessonId: string) => {
    setCompletedLessons((prev) => ({
      ...prev,
      [lessonId]: !prev[lessonId],
    }));
  };

  const openVideo = (url: string) => {
    if (url) {
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'Unable to open lesson stream.');
      });
    }
  };

  const handleAskAi = async (promptType: string, customText?: string) => {
    let title = '';
    let prompt = '';

    if (promptType === 'explain_tamil') {
      title = 'தமிழில் எளிய விளக்கம் (Tamil AI Tutor)';
      prompt = `Explain the foundational core concepts of the academic syllabus course "${course.title_name}" in clear, engaging, conversational Tamil. Use bullet points and simple real-world analogies.`;
    } else if (promptType === 'practice_mcqs') {
      title = '5 High-Yield Examination MCQs';
      prompt = `Generate 5 high-yield multiple-choice questions with 4 options (A, B, C, D) and detailed explanations for "${course.title_name}". Include correct answer keys.`;
    } else if (promptType === 'summary_notes') {
      title = 'Complete Chapter Summary & Formula Sheet';
      prompt = `Provide a comprehensive revision summary with all key formulas, governing equations, and shortcuts for "${course.title_name}".`;
    } else {
      title = 'AI Tutor Explanation';
      prompt = customText || `Explain the core principles of "${course.title_name}".`;
    }

    setAiPromptTitle(title);
    setAiResponse('');
    setAiLoading(true);
    setAiModalVisible(true);

    try {
      const res = await geminiToolsService.executePrompt(prompt);
      setAiResponse(res?.text || 'No response received. Please try again.');
    } catch (err: any) {
      setAiResponse(`Unable to fetch response: ${err.message || 'Network error'}`);
    } finally {
      setAiLoading(false);
    }
  };

  const handlePostForumQuestion = async () => {
    if (!forumQuestion.trim()) return;

    const userQ = forumQuestion;
    setForumQuestion('');
    setIsAskingForum(true);

    const newPostId = Date.now().toString();
    const newPost = {
      id: newPostId,
      author: 'You',
      question: userQ,
      answer: '🤖 AI Tutor is typing response...',
      time: 'Just now',
    };

    setForumPosts((prev) => [newPost, ...prev]);

    try {
      const res = await geminiToolsService.executePrompt(
        `Answer this student question about "${course.title_name}": "${userQ}". Provide a concise, clear academic explanation in 2-3 sentences.`
      );

      setForumPosts((prev) =>
        prev.map((p) =>
          p.id === newPostId
            ? { ...p, answer: `🤖 AI Tutor: ${res?.text || 'Focus on understanding core definitions and formulas.'}` }
            : p
        )
      );
    } catch (err) {
      setForumPosts((prev) => [
        {
          id: Date.now().toString(),
          author: 'You',
          question: userQ,
          answer: '🤖 AI Tutor: Identify key formula components, check unit consistency, and eliminate invalid options.',
          time: 'Just now',
        },
        ...prev,
      ]);
    } finally {
      setIsAskingForum(false);
    }
  };

  const renderCurriculum = () => (
    <FlatList
      data={courseUnits}
      keyExtractor={(item, index) => item.id || index.toString()}
      contentContainerStyle={[styles.listContainer, { paddingBottom: Math.max(insets.bottom, 24) + 60 }]}
      renderItem={({ item: unit, index: uIdx }) => {
        return (
          <View key={unit.id || uIdx} style={{ marginBottom: 16 }}>
            <View style={{ backgroundColor: '#111827', padding: 12, borderRadius: 14, borderWidth: 1, borderColor: '#1e293b', marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                  <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#10b981', backgroundColor: '#10b98120', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 6 }}>
                    {unit.subjectName}
                  </Text>
                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#94a3b8' }}>{unit.unitNumber}</Text>
                </View>
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#ffffff' }}>{unit.title}</Text>
              </View>
              <TouchableOpacity
                style={{ backgroundColor: '#10b981', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}
                onPress={() => openCoursePlayer(unit.title, 'theory', (unit as any).dayNumber || uIdx + 1, (unit as any).topicKey)}
              >
                <Text style={{ color: '#022c22', fontSize: 10, fontWeight: 'bold' }}>📱 Course Player</Text>
              </TouchableOpacity>
            </View>

            {(unit.chapters || []).map((chap: any, cIdx: number) => {
              const chapKey = `${uIdx}-${cIdx}`;
              const isExpanded = expandedModules[chapKey] !== false;

              return (
                <View key={chap.id || cIdx} style={[styles.moduleCard, { marginBottom: 10 }]}>
                  <TouchableOpacity
                    style={styles.moduleHeader}
                    onPress={() => toggleModule(chapKey)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.moduleIndex}>CHAPTER {cIdx + 1}</Text>
                      <Text style={styles.moduleTitle}>{chap.title}</Text>
                      {chap.tamilTitle ? (
                        <Text style={{ fontSize: 11, color: '#f59e0b', marginTop: 2 }}>{chap.tamilTitle}</Text>
                      ) : null}
                    </View>
                    {isExpanded ? <ChevronUp color="#10b981" size={20} /> : <ChevronDown color="#94a3b8" size={20} />}
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.videosContainer}>
                      {/* Video Lecture Link */}
                      <View style={styles.lessonRow}>
                        <TouchableOpacity style={styles.lessonContent} onPress={() => openVideo(chap.videoUrl || chap.url || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')}>
                          <PlayCircle size={20} color="#10b981" style={{ marginRight: 10 }} />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.videoTitle}>Watch Full HD Lecture</Text>
                            <Text style={styles.lessonMeta}>Official Video Stream • YouTube</Text>
                          </View>
                        </TouchableOpacity>

                        <View style={{ flexDirection: 'row', gap: 6 }}>
                          <TouchableOpacity
                            style={[styles.aiHelpPill, { backgroundColor: '#10b98120' }]}
                            onPress={() => openCoursePlayer(chap.title, 'theory')}
                          >
                            <Text style={[styles.aiHelpText, { color: '#10b981' }]}>Player</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.aiHelpPill, { backgroundColor: '#38bdf820' }]}
                            onPress={() => openCoursePlayer(chap.title, 'mcq')}
                          >
                            <Text style={[styles.aiHelpText, { color: '#38bdf8' }]}>5 MCQs</Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Subtopics & Micro-Topics Tree */}
                      {chap.subtopics?.map((sub: any, sIdx: number) => (
                        <View key={sub.id || sIdx} style={{ marginTop: 8, paddingLeft: 8, borderLeftWidth: 2, borderLeftColor: '#334155' }}>
                          <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#93c5fd', marginBottom: 4 }}>
                            {sub.title}
                          </Text>

                          {sub.microTopics?.map((micro: any, mIdx: number) => {
                            const lessonKey = `${chapKey}-${sIdx}-${mIdx}`;
                            const isDone = !!completedLessons[lessonKey];

                            return (
                              <View key={micro.id || mIdx} style={{ backgroundColor: '#0f172a', padding: 8, borderRadius: 8, marginBottom: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <TouchableOpacity
                                  style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                                  onPress={() => toggleLessonComplete(lessonKey)}
                                >
                                  <CheckCircle2 size={16} color={isDone ? '#10b981' : '#475569'} style={{ marginRight: 8 }} />
                                  <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 12, color: isDone ? '#64748b' : '#e2e8f0', textDecorationLine: isDone ? 'line-through' : 'none' }}>
                                      {micro.title}
                                    </Text>
                                    {micro.keyAxiom ? (
                                      <Text style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{micro.keyAxiom}</Text>
                                    ) : null}
                                  </View>
                                </TouchableOpacity>

                                <TouchableOpacity
                                  style={{ backgroundColor: '#10b98115', borderColor: '#10b981', borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginLeft: 6 }}
                                  onPress={() => openCoursePlayer(micro.title, 'theory')}
                                >
                                  <Text style={{ fontSize: 10, color: '#10b981', fontWeight: 'bold' }}>Player ➔</Text>
                                </TouchableOpacity>
                              </View>
                            );
                          })}
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        );
      }}
      ListEmptyComponent={
        <View style={{ padding: 40, alignItems: 'center' }}>
          <Text style={{ color: '#94a3b8', fontSize: 14 }}>No curriculum modules uploaded for this course yet.</Text>
        </View>
      }
    />
  );

  const renderNotesAndPDFs = () => (
    <ScrollView style={styles.tabContentContainer} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) + 60 }}>
      <View style={styles.notesCard}>
        <View style={styles.notesCardHeader}>
          <FileText size={20} color="#10b981" />
          <Text style={styles.notesCardTitle}>Verified Syllabus Summary Notes</Text>
        </View>
        <Text style={styles.notesCardDesc}>
          Download high-yield summary notes, derivations, and formulas for {course.title_name}.
        </Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity
            style={styles.notesDownloadBtn}
            onPress={() => handleAskAi('summary_notes')}
          >
            <Sparkles size={14} color="#0a0f1e" style={{ marginRight: 6 }} />
            <Text style={styles.notesDownloadText}>Generate AI Notes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.notesDownloadBtn, { backgroundColor: '#38bdf8' }]}
            onPress={() => openCoursePlayer(course.title_name, 'theory')}
          >
            <BookOpen size={14} color="#0a0f1e" style={{ marginRight: 6 }} />
            <Text style={styles.notesDownloadText}>Open Course Player</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderMindMaps = () => (
    <ScrollView style={styles.tabContentContainer} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) + 60 }}>
      <View style={styles.notesCard}>
        <View style={styles.notesCardHeader}>
          <Network size={20} color="#38bdf8" />
          <Text style={styles.notesCardTitle}>Visual Mind Map & Concept Hierarchy</Text>
        </View>
        <Text style={styles.notesCardDesc}>
          Interactive hierarchical concept tree connecting all units and micro-topics.
        </Text>

        <View style={{ marginTop: 12 }}>
          {courseUnits.map((unit, uIdx) => (
            <View key={uIdx} style={{ marginBottom: 12, paddingLeft: 8, borderLeftWidth: 2, borderLeftColor: '#38bdf8' }}>
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#38bdf8' }}>{unit.unitNumber}: {unit.title}</Text>
              {(unit.chapters || []).map((ch, cIdx) => (
                <TouchableOpacity
                  key={cIdx}
                  style={{ marginTop: 4, padding: 8, backgroundColor: '#1e293b', borderRadius: 6 }}
                  onPress={() => openCoursePlayer(ch.title, 'theory')}
                >
                  <Text style={{ fontSize: 12, color: '#e2e8f0' }}>➔ Chapter {cIdx+1}: {ch.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderForum = () => (
    <View style={{ flex: 1, padding: 16 }}>
      {/* Ask Question Bar */}
      <View style={styles.forumInputContainer}>
        <TextInput
          style={styles.forumInput}
          placeholder="Ask a question about this course..."
          placeholderTextColor="#64748b"
          value={forumQuestion}
          onChangeText={setForumQuestion}
        />
        <TouchableOpacity
          style={[styles.forumSendBtn, !forumQuestion.trim() && { opacity: 0.5 }]}
          onPress={handlePostForumQuestion}
          disabled={!forumQuestion.trim() || isAskingForum}
        >
          {isAskingForum ? <ActivityIndicator size="small" color="#0a0f1e" /> : <Send size={16} color="#0a0f1e" />}
        </TouchableOpacity>
      </View>

      {/* Forum Posts List */}
      <FlatList
        data={forumPosts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) + 60 }}
        renderItem={({ item }) => (
          <View style={styles.forumCard}>
            <View style={styles.forumHeader}>
              <Text style={styles.forumAuthor}>{item.author}</Text>
              <Text style={styles.forumTime}>{item.time}</Text>
            </View>
            <Text style={styles.forumQuestion}>{item.question}</Text>
            <View style={styles.forumAnswerBox}>
              <Text style={styles.forumAnswerText}>{item.answer}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0f1e" />

      {/* Top Navbar (Safe below punch hole / status bar) */}
      <View
        style={[
          styles.navbar,
          {
            paddingTop:
              Math.max(
                insets.top,
                Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0
              ) + 8,
          },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color="#ffffff" size={24} />
        </TouchableOpacity>
        <View style={styles.navTextContainer}>
          <Text style={styles.navCategory}>{course.category || 'Masterclass Course'}</Text>
          <Text style={styles.navTitle} numberOfLines={1}>
            {course.title_name}
          </Text>
        </View>
      </View>

      {/* Course Header Bar */}
      <View style={styles.courseHeader}>
        <Text style={styles.courseTitle}>{course.title_name}</Text>
        <Text style={styles.courseSubtitle}>
          {courseUnits.reduce((acc, u) => acc + (u.chapters?.length || 0), 0)} Chapters • {courseUnits.length} Units • Verified Syllabus
        </Text>

        {/* Quick AI Action Pills */}
        <View style={styles.aiActionBar}>
          <TouchableOpacity
            style={styles.aiActionPill}
            onPress={() => handleAskAi('explain_tamil', course.title_name)}
          >
            <Sparkles size={13} color="#10b981" style={{ marginRight: 5 }} />
            <Text style={styles.aiActionText}>தமிழில் விளக்கம்</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.aiActionPill}
            onPress={() => handleAskAi('practice_mcqs', course.title_name)}
          >
            <FileCheck2 size={13} color="#38bdf8" style={{ marginRight: 5 }} />
            <Text style={styles.aiActionText}>5 Practice MCQs</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.aiActionPill}
            onPress={() => handleAskAi('summary_notes', course.title_name)}
          >
            <BookOpen size={13} color="#f59e0b" style={{ marginRight: 5 }} />
            <Text style={styles.aiActionText}>Summary Notes</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sub Tabs Navigation */}
      <View style={styles.subTabBar}>
        <TouchableOpacity
          style={[styles.subTabBtn, activeCourseTab === 'curriculum' && styles.subTabBtnActive]}
          onPress={() => setActiveCourseTab('curriculum')}
        >
          <BookOpen size={13} color={activeCourseTab === 'curriculum' ? '#0a0f1e' : '#94a3b8'} style={{ marginRight: 4 }} />
          <Text style={[styles.subTabText, activeCourseTab === 'curriculum' && styles.subTabTextActive]}>Curriculum</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subTabBtn, activeCourseTab === 'notes' && styles.subTabBtnActive]}
          onPress={() => setActiveCourseTab('notes')}
        >
          <FileText size={13} color={activeCourseTab === 'notes' ? '#0a0f1e' : '#94a3b8'} style={{ marginRight: 4 }} />
          <Text style={[styles.subTabText, activeCourseTab === 'notes' && styles.subTabTextActive]}>Notes & PDF</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subTabBtn, activeCourseTab === 'mindmap' && styles.subTabBtnActive]}
          onPress={() => setActiveCourseTab('mindmap')}
        >
          <Network size={13} color={activeCourseTab === 'mindmap' ? '#0a0f1e' : '#94a3b8'} style={{ marginRight: 4 }} />
          <Text style={[styles.subTabText, activeCourseTab === 'mindmap' && styles.subTabTextActive]}>Mind Map</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subTabBtn, activeCourseTab === 'forum' && styles.subTabBtnActive]}
          onPress={() => setActiveCourseTab('forum')}
        >
          <MessageSquare size={13} color={activeCourseTab === 'forum' ? '#0a0f1e' : '#94a3b8'} style={{ marginRight: 4 }} />
          <Text style={[styles.subTabText, activeCourseTab === 'forum' && styles.subTabTextActive]}>Q&A Forum</Text>
        </TouchableOpacity>
      </View>

      {/* Active Tab Body */}
      {activeCourseTab === 'curriculum' && renderCurriculum()}
      {activeCourseTab === 'notes' && renderNotesAndPDFs()}
      {activeCourseTab === 'mindmap' && renderMindMaps()}
      {activeCourseTab === 'forum' && renderForum()}

      {/* 📱 Interactive Course Player Modal */}
      <Modal
        visible={!!playerBook}
        animationType="slide"
        transparent={false}
        statusBarTranslucent={true}
        onRequestClose={() => setPlayerBook(null)}
      >
        <View style={{
          flex: 1,
          backgroundColor: playerTheme === 'sepia' ? '#fcf8ed' : playerTheme === 'light' ? '#ffffff' : '#0a0f1e',
          paddingTop: Platform.OS === 'android' ? Math.max(insets.top, StatusBar.currentHeight || 0) + 4 : insets.top,
        }}>
          <StatusBar
            barStyle={playerTheme === 'light' || playerTheme === 'sepia' ? 'dark-content' : 'light-content'}
            backgroundColor={playerTheme === 'sepia' ? '#f4eedb' : playerTheme === 'light' ? '#f8fafc' : '#0f172a'}
            translucent={true}
          />
          
          {/* Player Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: playerTheme === 'sepia' ? '#e7dfc6' : playerTheme === 'light' ? '#e2e8f0' : '#1e293b',
            backgroundColor: playerTheme === 'sepia' ? '#f4eedb' : playerTheme === 'light' ? '#f8fafc' : '#0f172a'
          }}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#10b981', textTransform: 'uppercase' }}>📱 COURSE PLAYER</Text>
                <Text style={{ fontSize: 10, color: '#94a3b8' }}>• {playerBook?.readingTime || '6 min read'}</Text>
                <Text style={{ fontSize: 10, color: playerSource === 'cache' ? '#38bdf8' : '#a855f7', fontWeight: 'bold' }}>
                  • {playerSource === 'cache' ? '⚡ Cached' : '🤖 AI Generated'}
                </Text>
              </View>
              <Text style={{ fontSize: 15, fontWeight: 'bold', color: playerTheme === 'sepia' ? '#451a03' : playerTheme === 'light' ? '#0f172a' : '#ffffff' }} numberOfLines={1}>
                {playerBook?.topicTitle}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {/* Theme Toggle */}
              <TouchableOpacity
                onPress={() => setPlayerTheme(prev => prev === 'dark' ? 'sepia' : prev === 'sepia' ? 'light' : 'dark')}
                style={{ padding: 6, borderRadius: 6, backgroundColor: playerTheme === 'sepia' ? '#ede5cf' : playerTheme === 'light' ? '#e2e8f0' : '#1e293b' }}
              >
                <Text style={{ fontSize: 11, color: playerTheme === 'sepia' ? '#78350f' : playerTheme === 'light' ? '#0f172a' : '#e2e8f0' }}>
                  {playerTheme === 'dark' ? '🌙 Dark' : playerTheme === 'sepia' ? '☕ Sepia' : '☀️ Light'}
                </Text>
              </TouchableOpacity>

              {/* Export PDF */}
              <TouchableOpacity
                onPress={() => exportCoursePlayerPDF(playerBook)}
                style={{ padding: 6, borderRadius: 6, backgroundColor: '#10b981' }}
              >
                <Download size={15} color="#022c22" />
              </TouchableOpacity>

              {/* Close */}
              <TouchableOpacity onPress={() => setPlayerBook(null)} style={{ padding: 6 }}>
                <X size={22} color={playerTheme === 'light' || playerTheme === 'sepia' ? '#475569' : '#ffffff'} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Player Sub-Tabs */}
          <View style={{
            flexDirection: 'row',
            backgroundColor: playerTheme === 'sepia' ? '#ede5cf' : playerTheme === 'light' ? '#f1f5f9' : '#111827',
            paddingHorizontal: 8,
            borderBottomWidth: 1,
            borderBottomColor: playerTheme === 'sepia' ? '#e7dfc6' : playerTheme === 'light' ? '#e2e8f0' : '#1e293b'
          }}>
            {[
              { id: 'theory', label: '📖 Theory' },
              { id: 'tamil', label: '🗣️ தமிழ்' },
              { id: 'vsaq', label: '⚡ VSAQ' },
              { id: 'solutions', label: '📝 Solutions' },
              { id: 'mcq', label: '❓ MCQs' },
              { id: 'formulas', label: '📐 Formulas' }
            ].map(tab => {
              const active = playerTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 10,
                    borderBottomWidth: 2,
                    borderBottomColor: active ? '#10b981' : 'transparent',
                    alignItems: 'center'
                  }}
                  onPress={() => setPlayerTab(tab.id as any)}
                >
                  <Text style={{
                    fontSize: 11,
                    fontWeight: active ? 'bold' : 'normal',
                    color: active ? (playerTheme === 'light' || playerTheme === 'sepia' ? '#047857' : '#10b981') : (playerTheme === 'light' || playerTheme === 'sepia' ? '#64748b' : '#94a3b8')
                  }}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Player Body */}
          <ScrollView
            style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}
            contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) + 80 }}
            showsVerticalScrollIndicator={true}
          >
            {/* 1. Theory & Core Concepts */}
            {playerTab === 'theory' && playerBook && (
              <View>
                <View style={{ backgroundColor: playerTheme === 'sepia' ? '#f4eedb' : playerTheme === 'light' ? '#f8fafc' : '#111827', padding: 14, borderRadius: 10, marginBottom: 14, borderWidth: 1, borderColor: playerTheme === 'sepia' ? '#e7dfc6' : playerTheme === 'light' ? '#e2e8f0' : '#1e293b' }}>
                  <Text style={{ fontSize: 13, color: playerTheme === 'sepia' ? '#451a03' : playerTheme === 'light' ? '#1e293b' : '#cbd5e1', lineHeight: 20 }}>
                    {playerBook.overview}
                  </Text>
                </View>

                {playerBook.coreConcepts?.map((concept: any, idx: number) => (
                  <View
                    key={idx}
                    style={{
                      marginBottom: 12,
                      padding: 14,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: playerTheme === 'sepia' ? '#e7dfc6' : playerTheme === 'light' ? '#e2e8f0' : '#1e293b',
                      backgroundColor: playerTheme === 'sepia' ? '#f4eedb' : playerTheme === 'light' ? '#f8fafc' : '#0f172a'
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: playerTheme === 'sepia' ? '#78350f' : playerTheme === 'light' ? '#0f172a' : '#38bdf8', marginBottom: 6 }}>
                      {concept.heading}
                    </Text>
                    <Text style={{ fontSize: 13, color: playerTheme === 'sepia' ? '#451a03' : playerTheme === 'light' ? '#334155' : '#cbd5e1', lineHeight: 20, marginBottom: 8 }}>
                      {concept.content}
                    </Text>
                    {concept.example ? (
                      <View style={{ backgroundColor: playerTheme === 'sepia' ? '#ede5cf' : playerTheme === 'light' ? '#ecfdf5' : '#064e3b30', padding: 10, borderRadius: 8 }}>
                        <Text style={{ fontSize: 11, color: playerTheme === 'sepia' ? '#92400e' : playerTheme === 'light' ? '#065f46' : '#34d399', fontWeight: 'bold' }}>
                          💡 Real-World Example:
                        </Text>
                        <Text style={{ fontSize: 12, color: playerTheme === 'sepia' ? '#78350f' : playerTheme === 'light' ? '#047857' : '#a7f3d0', marginTop: 2 }}>
                          {concept.example}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                ))}
              </View>
            )}

            {/* 2. Tamil Explanation */}
            {playerTab === 'tamil' && playerBook && (
              <View>
                <View style={{ backgroundColor: playerTheme === 'sepia' ? '#fef9c3' : playerTheme === 'light' ? '#fefce8' : '#42200630', padding: 14, borderRadius: 10, marginBottom: 14, borderWidth: 1, borderColor: '#facc15' }}>
                  <Text style={{ fontSize: 15, fontWeight: 'bold', color: playerTheme === 'sepia' ? '#854d0e' : playerTheme === 'light' ? '#a16207' : '#fbbf24', marginBottom: 6 }}>
                    {playerBook.tamilExplanation?.simpleTitle}
                  </Text>
                  <Text style={{ fontSize: 13, color: playerTheme === 'sepia' ? '#713f12' : playerTheme === 'light' ? '#854d0e' : '#fde68a', lineHeight: 21 }}>
                    {playerBook.tamilExplanation?.colloquialIntro}
                  </Text>
                </View>

                {playerBook.tamilExplanation?.everydayAnalogy ? (
                  <View style={{
                    marginBottom: 12,
                    padding: 14,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: playerTheme === 'sepia' ? '#e7dfc6' : playerTheme === 'light' ? '#e2e8f0' : '#1e293b',
                    backgroundColor: playerTheme === 'sepia' ? '#f4eedb' : playerTheme === 'light' ? '#f8fafc' : '#0f172a'
                  }}>
                    <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#10b981', marginBottom: 4 }}>
                      🏡 நடைமுறை உதாரணம் (Everyday Analogy)
                    </Text>
                    <Text style={{ fontSize: 13, color: playerTheme === 'sepia' ? '#451a03' : playerTheme === 'light' ? '#334155' : '#cbd5e1', lineHeight: 20 }}>
                      {playerBook.tamilExplanation?.everydayAnalogy}
                    </Text>
                  </View>
                ) : null}

                <View style={{
                  padding: 14,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: playerTheme === 'sepia' ? '#e7dfc6' : playerTheme === 'light' ? '#e2e8f0' : '#1e293b',
                  backgroundColor: playerTheme === 'sepia' ? '#f4eedb' : playerTheme === 'light' ? '#f8fafc' : '#0f172a'
                }}>
                  <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#38bdf8', marginBottom: 8 }}>
                    📌 தேர்வுக்கான முக்கிய குறிப்புகள் (Exam Points)
                  </Text>
                  {playerBook.tamilExplanation?.keyPointsTamil?.map((pt: string, i: number) => (
                    <Text key={i} style={{ fontSize: 12, color: playerTheme === 'sepia' ? '#451a03' : playerTheme === 'light' ? '#334155' : '#cbd5e1', lineHeight: 19, marginBottom: 4 }}>
                      • {pt}
                    </Text>
                  ))}
                </View>
              </View>
            )}

            {/* 3. VSAQ Flashcards */}
            {playerTab === 'vsaq' && playerBook && (
              <View>
                <Text style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>
                  💡 Tap any card to reveal the exact 1-mark exam answer.
                </Text>
                {playerBook.vsaqs?.map((v: any, i: number) => {
                  const isRevealed = !!revealedVsaq[i];
                  return (
                    <TouchableOpacity
                      key={i}
                      style={{
                        marginBottom: 10,
                        padding: 14,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: playerTheme === 'sepia' ? '#e7dfc6' : playerTheme === 'light' ? '#e2e8f0' : '#1e293b',
                        backgroundColor: playerTheme === 'sepia' ? '#f4eedb' : playerTheme === 'light' ? '#f8fafc' : '#0f172a'
                      }}
                      onPress={() => setRevealedVsaq(prev => ({ ...prev, [i]: !prev[i] }))}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Text style={{ fontSize: 13, fontWeight: 'bold', color: playerTheme === 'sepia' ? '#78350f' : playerTheme === 'light' ? '#0f172a' : '#ffffff', flex: 1 }}>
                          Q{i+1}: {v.question}
                        </Text>
                        <Text style={{ fontSize: 10, color: '#10b981', fontWeight: 'bold', marginLeft: 8 }}>1 Mark</Text>
                      </View>

                      {isRevealed ? (
                        <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: playerTheme === 'sepia' ? '#ede5cf' : playerTheme === 'light' ? '#e2e8f0' : '#1e293b' }}>
                          <Text style={{ fontSize: 12, color: '#10b981', fontWeight: 'bold', marginBottom: 2 }}>Answer:</Text>
                          <Text style={{ fontSize: 12, color: playerTheme === 'sepia' ? '#451a03' : playerTheme === 'light' ? '#334155' : '#cbd5e1', lineHeight: 18 }}>
                            {v.answer}
                          </Text>
                        </View>
                      ) : (
                        <Text style={{ fontSize: 11, color: '#94a3b8', marginTop: 6, fontStyle: 'italic' }}>
                          👉 Tap to reveal answer
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* 4. Step-by-Step Solutions */}
            {playerTab === 'solutions' && playerBook && (
              <View>
                {playerBook.shortAnswers?.map((sa: any, i: number) => (
                  <View
                    key={i}
                    style={{
                      marginBottom: 14,
                      padding: 14,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: playerTheme === 'sepia' ? '#e7dfc6' : playerTheme === 'light' ? '#e2e8f0' : '#1e293b',
                      backgroundColor: playerTheme === 'sepia' ? '#f4eedb' : playerTheme === 'light' ? '#f8fafc' : '#0f172a'
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text style={{ fontSize: 13, fontWeight: 'bold', color: playerTheme === 'sepia' ? '#78350f' : playerTheme === 'light' ? '#0f172a' : '#38bdf8', flex: 1 }}>
                        {sa.question}
                      </Text>
                      <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#10b981', backgroundColor: '#10b98120', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, height: 20 }}>
                        {sa.marks}
                      </Text>
                    </View>

                    {sa.solutionSteps?.map((step: string, sIdx: number) => (
                      <View key={sIdx} style={{ flexDirection: 'row', marginBottom: 4 }}>
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#10b981', marginRight: 6 }}>Step {sIdx+1}:</Text>
                        <Text style={{ fontSize: 12, color: playerTheme === 'sepia' ? '#451a03' : playerTheme === 'light' ? '#334155' : '#cbd5e1', flex: 1, lineHeight: 18 }}>
                          {step}
                        </Text>
                      </View>
                    ))}

                    {sa.keyTips ? (
                      <View style={{ marginTop: 8, backgroundColor: playerTheme === 'sepia' ? '#fef3c7' : playerTheme === 'light' ? '#fffbeb' : '#78350f20', padding: 8, borderRadius: 6 }}>
                        <Text style={{ fontSize: 11, color: '#f59e0b', fontWeight: 'bold' }}>💡 Examiner Scoring Tip:</Text>
                        <Text style={{ fontSize: 11, color: playerTheme === 'sepia' ? '#92400e' : playerTheme === 'light' ? '#b45309' : '#fde68a', marginTop: 2 }}>
                          {sa.keyTips}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                ))}
              </View>
            )}

            {/* 5. Interactive Quiz MCQs */}
            {playerTab === 'mcq' && playerBook && (
              <View>
                <Text style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>
                  🎯 Test your knowledge with these exam questions.
                </Text>
                {playerBook.mcqs?.map((mcq: any, qIdx: number) => {
                  const selected = userMcqAnswers[qIdx];
                  const isAnswered = selected !== undefined;
                  const isCorrect = selected === mcq.correct;

                  return (
                    <View
                      key={qIdx}
                      style={{
                        marginBottom: 16,
                        padding: 14,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: playerTheme === 'sepia' ? '#e7dfc6' : playerTheme === 'light' ? '#e2e8f0' : '#1e293b',
                        backgroundColor: playerTheme === 'sepia' ? '#f4eedb' : playerTheme === 'light' ? '#f8fafc' : '#0f172a'
                      }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: 'bold', color: playerTheme === 'sepia' ? '#78350f' : playerTheme === 'light' ? '#0f172a' : '#ffffff', marginBottom: 10 }}>
                        Q{qIdx+1}: {mcq.question}
                      </Text>

                      {mcq.options?.map((opt: string, optIdx: number) => {
                        let bg = playerTheme === 'sepia' ? '#ede5cf' : playerTheme === 'light' ? '#f1f5f9' : '#1e293b';
                        let textCol = playerTheme === 'sepia' ? '#451a03' : playerTheme === 'light' ? '#334155' : '#cbd5e1';
                        let borderCol = 'transparent';

                        if (isAnswered) {
                          if (optIdx === mcq.correct) {
                            bg = '#065f46';
                            textCol = '#ffffff';
                            borderCol = '#10b981';
                          } else if (selected === optIdx) {
                            bg = '#991b1b';
                            textCol = '#ffffff';
                            borderCol = '#ef4444';
                          }
                        }

                        return (
                          <TouchableOpacity
                            key={optIdx}
                            style={{
                              backgroundColor: bg,
                              borderColor: borderCol,
                              borderWidth: 1,
                              padding: 10,
                              borderRadius: 8,
                              marginBottom: 6,
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}
                            onPress={() => setUserMcqAnswers(prev => ({ ...prev, [qIdx]: optIdx }))}
                            disabled={isAnswered}
                          >
                            <Text style={{ fontSize: 12, color: textCol, flex: 1 }}>{opt}</Text>
                            {isAnswered && optIdx === mcq.correct ? (
                              <Check size={14} color="#10b981" />
                            ) : null}
                          </TouchableOpacity>
                        );
                      })}

                      {isAnswered ? (
                        <View style={{ marginTop: 8, padding: 8, borderRadius: 6, backgroundColor: isCorrect ? '#064e3b20' : '#7f1d1d20' }}>
                          <Text style={{ fontSize: 11, fontWeight: 'bold', color: isCorrect ? '#10b981' : '#ef4444' }}>
                            {isCorrect ? '✅ Correct Answer!' : '❌ Incorrect'}
                          </Text>
                          <Text style={{ fontSize: 11, color: playerTheme === 'sepia' ? '#451a03' : playerTheme === 'light' ? '#334155' : '#cbd5e1', marginTop: 2 }}>
                            {mcq.explanation}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            )}

            {/* 6. Formulas & Mnemonics */}
            {playerTab === 'formulas' && playerBook && (
              <View>
                {playerBook.formulasAndMnemonics?.map((f: any, i: number) => (
                  <View
                    key={i}
                    style={{
                      marginBottom: 10,
                      padding: 14,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: playerTheme === 'sepia' ? '#e7dfc6' : playerTheme === 'light' ? '#e2e8f0' : '#1e293b',
                      backgroundColor: playerTheme === 'sepia' ? '#f4eedb' : playerTheme === 'light' ? '#f8fafc' : '#0f172a'
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#10b981', fontFamily: 'monospace', marginBottom: 4 }}>
                      {f.formula}
                    </Text>
                    <Text style={{ fontSize: 12, color: playerTheme === 'sepia' ? '#451a03' : playerTheme === 'light' ? '#334155' : '#cbd5e1', marginBottom: 6 }}>
                      {f.meaning}
                    </Text>
                    {f.mnemonic ? (
                      <View style={{ backgroundColor: playerTheme === 'sepia' ? '#ede5cf' : playerTheme === 'light' ? '#fef3c7' : '#78350f20', padding: 8, borderRadius: 6 }}>
                        <Text style={{ fontSize: 11, color: '#f59e0b', fontWeight: 'bold' }}>🧠 Memory Trick (Mnemonic):</Text>
                        <Text style={{ fontSize: 11, color: playerTheme === 'sepia' ? '#92400e' : playerTheme === 'light' ? '#b45309' : '#fde68a', marginTop: 2 }}>
                          {f.mnemonic}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* AI Tutor Chat Modal */}
      <Modal
        visible={aiModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAiModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 20) + 16 }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Sparkles color="#10b981" size={18} style={{ marginRight: 8 }} />
                <Text style={styles.modalTitle} numberOfLines={1}>{aiPromptTitle}</Text>
              </View>
              <TouchableOpacity onPress={() => setAiModalVisible(false)}>
                <X color="#94a3b8" size={20} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {aiLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#10b981" />
                  <Text style={styles.loadingText}>Generating academic explanation with Gemini AI...</Text>
                </View>
              ) : (
                <Text style={styles.responseText}>{aiResponse}</Text>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setAiModalVisible(false)}
              >
                <Text style={styles.closeBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1e',
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backBtn: {
    marginRight: 12,
    padding: 4,
  },
  navTextContainer: {
    flex: 1,
  },
  navCategory: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#10b981',
    textTransform: 'uppercase',
  },
  navTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  courseHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    backgroundColor: '#0f172a',
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  courseSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 12,
  },
  aiActionBar: {
    flexDirection: 'row',
    gap: 8,
  },
  aiActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  aiActionText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#e2e8f0',
  },
  subTabBar: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  subTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  subTabBtnActive: {
    borderBottomColor: '#10b981',
  },
  subTabText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: 'bold',
  },
  subTabTextActive: {
    color: '#10b981',
  },
  listContainer: {
    padding: 16,
  },
  moduleCard: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    overflow: 'hidden',
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: '#131d31',
  },
  moduleIndex: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 2,
  },
  moduleTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  videosContainer: {
    padding: 12,
    backgroundColor: '#0a0f1e',
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  lessonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  videoTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  lessonMeta: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  aiHelpPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  aiHelpText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  tabContentContainer: {
    flex: 1,
    padding: 16,
  },
  notesCard: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 16,
  },
  notesCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  notesCardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  notesCardDesc: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 18,
    marginBottom: 14,
  },
  notesDownloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  notesDownloadText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0a0f1e',
  },
  forumInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  forumInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 13,
    paddingVertical: 8,
  },
  forumSendBtn: {
    backgroundColor: '#10b981',
    padding: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  forumCard: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  forumHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  forumAuthor: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#38bdf8',
  },
  forumTime: {
    fontSize: 10,
    color: '#64748b',
  },
  forumQuestion: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  forumAnswerBox: {
    backgroundColor: '#1e293b',
    padding: 10,
    borderRadius: 8,
  },
  forumAnswerText: {
    fontSize: 12,
    color: '#cbd5e1',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingBottom: 24,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
    maxWidth: '85%',
  },
  modalBody: {
    padding: 16,
  },
  loadingContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
  responseText: {
    fontSize: 13,
    color: '#cbd5e1',
    lineHeight: 22,
  },
  modalFooter: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  closeBtn: {
    backgroundColor: '#1e293b',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});
