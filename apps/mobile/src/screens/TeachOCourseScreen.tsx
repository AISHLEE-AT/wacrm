import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Modal,
  ScrollView,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Sparkles,
  BookOpen,
  Download,
  CheckCircle2,
  Circle,
  X,
  Search,
  ShieldAlert,
} from 'lucide-react-native';
import { aishleeSupabase } from '../services/aishleeSupabase';
import {
  resolveCompleteCourseSyllabus,
  CourseFullSyllabus,
  SyllabusChapter,
  SyllabusMicroTopic
} from '../data/curriculum/courseSyllabusRegistry';
import { generateKindleBook } from '../lib/kindleContentEngine';
import {
  matchStoredContentForTopic,
} from '../lib/coursePlayerEngine';
import AdminCurriculumEditorModal from '../components/teacho/AdminCurriculumEditorModal';

function normalizeMobileCoursePayload(raw: any, topicTitle: string, courseTitle: string): any {
  if (!raw) return null;
  const overview = raw.notes?.overview || raw.overview || 'Comprehensive lesson module notes and core conceptual breakdown.';
  const coreConcepts = (raw.notes?.coreConcepts && Array.isArray(raw.notes.coreConcepts) && raw.notes.coreConcepts.length > 0)
    ? raw.notes.coreConcepts
    : (raw.coreConcepts || []);
  const keyPoints = (raw.notes?.keyPoints && Array.isArray(raw.notes.keyPoints) && raw.notes.keyPoints.length > 0)
    ? raw.notes.keyPoints
    : (raw.keyPoints || []);

  const tamilExplanation = raw.tamilExplanation || (raw.notes?.bilingualExplanation?.tamil ? {
    colloquialIntro: raw.notes.bilingualExplanation.tamil,
    everydayAnalogy: raw.notes.bilingualExplanation.tamil
  } : {
    colloquialIntro: 'பாடத்தின் அடிப்படைக் கருத்துக்களை எளிமையாகப் புரிந்து கொள்ளவும்.',
    everydayAnalogy: 'நடைமுறை வாழ்க்கையோடு ஒப்பிட்டுப் படிக்கும் போது நினைவில் எளிதாக நிற்கும்!'
  });

  const vsaqs = (raw.oneLineQnA && Array.isArray(raw.oneLineQnA) && raw.oneLineQnA.length > 0)
    ? raw.oneLineQnA
    : (raw.vsaqs || [
        { question: `What is the core definition of ${topicTitle}?`, answer: `Fundamental concept for ${courseTitle}.` },
        { question: `What is the primary exam takeaway?`, answer: 'Focus on root concepts, formulas, and verified steps.' }
      ]);

  const shortAnswers = (raw.twoMarkQuestions && Array.isArray(raw.twoMarkQuestions) && raw.twoMarkQuestions.length > 0)
    ? raw.twoMarkQuestions.map((q: any) => ({
        question: q.question,
        marks: `${q.marks || 2} Marks`,
        solutionSteps: q.keyPointsToInclude || [q.modelAnswer || ''],
        keyTips: 'Ensure exact definitions, step clarity, and diagram labeling.'
      }))
    : (raw.shortAnswers || []);

  const mcqs = (raw.mcqs && Array.isArray(raw.mcqs) && raw.mcqs.length > 0)
    ? raw.mcqs.map((m: any) => ({
        question: m.question,
        options: m.options || [],
        correct: typeof m.correctIndex === 'number' ? m.correctIndex : (typeof m.correct === 'number' ? m.correct : 0),
        explanation: m.explanation || 'Refer to verified syllabus rationale.'
      }))
    : (raw.practiceMCQs || []);

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
  const course = route.params?.course || {};
  const courseTitle = course.title_name || course.title || 'Master Course';
  const courseId = course.id || courseTitle.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  const courseCategory = course.category || '';

  // Dedicated Complete Syllabus for this course
  const fullSyllabus: CourseFullSyllabus = useMemo(() => {
    return resolveCompleteCourseSyllabus(courseId, courseTitle, courseCategory);
  }, [courseId, courseTitle, courseCategory]);

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});
  const [completedTopics, setCompletedTopics] = useState<Record<string, boolean>>({});
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Course Player Reader State
  const [playerBook, setPlayerBook] = useState<any | null>(null);
  const [playerTab, setPlayerTab] = useState<'theory' | 'tamil' | 'vsaq' | 'solutions' | 'mcq' | 'formulas'>('theory');
  const [playerTheme, setPlayerTheme] = useState<'dark' | 'sepia' | 'light'>('dark');
  const [, setPlayerLoading] = useState(false);
  const [playerSource, setPlayerSource] = useState<'cache' | 'ai' | 'fallback'>('cache');
  const [userMcqAnswers, setUserMcqAnswers] = useState<Record<number, number>>({});

  // Load completion states from AsyncStorage
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const stored = await AsyncStorage.getItem(`teacho_progress_${courseId}`);
        if (stored) {
          setCompletedTopics(JSON.parse(stored));
        }
      } catch (e) {
        console.warn('Failed to load course progress:', e);
      }
    };
    loadProgress();
  }, [courseId]);

  // Expand all chapters initially
  useEffect(() => {
    const initialExpanded: Record<string, boolean> = {};
    (fullSyllabus.subjects || []).forEach((subj, sIdx) => {
      (subj.chapters || []).forEach((_, cIdx) => {
        initialExpanded[`${sIdx}-${cIdx}`] = true;
      });
    });
    setExpandedChapters(initialExpanded);
  }, [fullSyllabus]);

  const toggleTopicCompleted = async (topicId: string) => {
    setCompletedTopics(prev => {
      const next = { ...prev, [topicId]: !prev[topicId] };
      AsyncStorage.setItem(`teacho_progress_${courseId}`, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const toggleChapterExpanded = (chapKey: string) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapKey]: !prev[chapKey]
    }));
  };

  const toggleExpandAll = () => {
    const areAllExpanded = Object.values(expandedChapters).every(Boolean);
    const newExpanded: Record<string, boolean> = {};
    (fullSyllabus.subjects || []).forEach((subj, sIdx) => {
      (subj.chapters || []).forEach((_, cIdx) => {
        newExpanded[`${sIdx}-${cIdx}`] = !areAllExpanded;
      });
    });
    setExpandedChapters(newExpanded);
  };

  // Filter subjects and topics based on selected subject and search query
  const filteredSubjects = useMemo(() => {
    let list = fullSyllabus.subjects || [];
    if (selectedSubjectId !== 'all') {
      list = list.filter(s => s.subjectId === selectedSubjectId);
    }
    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase().trim();
    return list.map(subj => {
      const matchingChapters = (subj.chapters || []).map(chap => {
        const matchingMicro = (chap.microTopics || []).filter(m => {
          const titleMatch = (m.topicTitle || m.title || '').toLowerCase().includes(q);
          const subMatch = (m.subtopic || '').toLowerCase().includes(q);
          const axiomMatch = (m.keyFormulaOrLaw || m.keyAxiom || '').toLowerCase().includes(q);
          const pointsMatch = (m.keyPoints || []).some(pt => pt.toLowerCase().includes(q));
          return titleMatch || subMatch || axiomMatch || pointsMatch;
        });

        const chapTitleMatch = (chap.chapterTitle || '').toLowerCase().includes(q);
        const chapDescMatch = (chap.description || '').toLowerCase().includes(q);

        if (chapTitleMatch || chapDescMatch) {
          return chap;
        }

        if (matchingMicro.length > 0) {
          return {
            ...chap,
            microTopics: matchingMicro
          };
        }
        return null;
      }).filter(Boolean) as SyllabusChapter[];

      return {
        ...subj,
        chapters: matchingChapters
      };
    }).filter(subj => subj.chapters.length > 0);
  }, [fullSyllabus, selectedSubjectId, searchQuery]);

  // Overall stats
  const totalMicroCount = useMemo(() => {
    return (fullSyllabus.subjects || []).reduce((acc, s) => {
      return acc + (s.chapters || []).reduce((cAcc, c) => cAcc + (c.microTopics?.length || 0), 0);
    }, 0);
  }, [fullSyllabus]);

  const completedCount = useMemo(() => {
    return Object.values(completedTopics).filter(Boolean).length;
  }, [completedTopics]);

  // Course Player Opener
  const openCoursePlayer = async (
    topic: string,
    initialTab: 'theory' | 'tamil' | 'vsaq' | 'solutions' | 'mcq' | 'formulas' = 'theory',
    dayNumber: number = 1,
    explicitTopicKey?: string
  ) => {
    const cleanTopic = topic || 'Core Fundamentals';
    setPlayerTab(initialTab);
    setUserMcqAnswers({});
    setPlayerLoading(true);

    const candidateKeys = [
      explicitTopicKey,
      `${courseId}_day_${dayNumber}_task_1`,
      `${courseId}_day_${dayNumber}`,
      `${courseTitle}_day_${dayNumber}`.toLowerCase().replace(/[^a-z0-9_]/g, '_')
    ].filter(Boolean) as string[];

    let loadedPayload: any = null;

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
      // fallback
    }

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
          // fallback
        }
      }
    }

    let finalBook: any = null;
    if (loadedPayload) {
      finalBook = normalizeMobileCoursePayload(loadedPayload, cleanTopic, courseTitle);
    } else {
      finalBook = generateKindleBook(cleanTopic, courseTitle, courseCategory);
      setPlayerSource('fallback');
    }

    try {
      const dbMatch = await matchStoredContentForTopic(cleanTopic, courseTitle, courseCategory);
      if (dbMatch.hasStoredMcqs && dbMatch.mcqs && dbMatch.mcqs.length > 0) {
        finalBook.mcqs = dbMatch.mcqs.map((m: any) => ({
          question: m.question,
          options: m.options,
          correct: m.correctIndex !== undefined ? m.correctIndex : m.correct,
          explanation: m.explanation
        }));
      }
      if (dbMatch.hasStoredNotes && dbMatch.theoryNotes) {
        finalBook.notes = {
          ...finalBook.notes,
          overview: dbMatch.theoryNotes
        };
      }
      if (dbMatch.tamilAnalogy) {
        finalBook.tamilExplanation = {
          ...finalBook.tamilExplanation,
          colloquialIntro: dbMatch.tamilAnalogy
        };
      }
    } catch (e) {
      // fallback
    }

    setPlayerBook(finalBook);
    setPlayerLoading(false);
  };

  const exportCoursePlayerPDF = async (book: any) => {
    if (!book) return;
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 24px; color: #1e293b; line-height: 1.6; }
            h1 { color: #0f766e; border-bottom: 2px solid #0f766e; padding-bottom: 8px; font-size: 22px; }
            h2 { color: #0284c7; font-size: 16px; margin-top: 20px; }
            .badge { background-color: #f0fdf4; color: #166534; padding: 4px 10px; border-radius: 12px; font-weight: bold; font-size: 12px; }
            .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 14px; }
          </style>
        </head>
        <body>
          <span class="badge">TeachO Verified Nano Syllabus</span>
          <h1>${book.topicTitle}</h1>
          <p><strong>Course:</strong> ${courseTitle} (${fullSyllabus.board || 'State Board'})</p>
          
          <div class="box">
            <h2>📖 Theory & Conceptual Overview</h2>
            <p>${book.overview || 'Comprehensive syllabus breakdown.'}</p>
          </div>

          <div class="box">
            <h2>🗣️ தமிழ் விளக்கம் & நடைமுறை உதாரணம்</h2>
            <p><strong>விளக்கம்:</strong> ${book.tamilExplanation?.colloquialIntro || 'பாடத்தின் அடிப்படைக் கருத்துக்கள்.'}</p>
            <p><strong>நடைமுறை உதாரணம்:</strong> ${book.tamilExplanation?.everydayAnalogy || 'நடைமுறை வாழ்க்கையோடு தொடர்பு.'}</p>
          </div>
        </body>
        </html>
      `;
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (e: any) {
      Alert.alert('PDF Export Error', e.message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#070d18" />

      {/* Top Navbar */}
      <View
        style={[
          styles.navbar,
          {
            paddingTop:
              Math.max(
                insets.top,
                Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0
              ) + 6,
          },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color="#ffffff" size={24} />
        </TouchableOpacity>
        <View style={styles.navTextContainer}>
          <View style={styles.boardBadgeRow}>
            <Text style={styles.boardBadgeText}>
              {fullSyllabus.board || 'TNSB / CBSE'} • {fullSyllabus.medium || 'Tamil'}
            </Text>
          </View>
          <Text style={styles.navTitle} numberOfLines={1}>
            {courseTitle}
          </Text>
        </View>

        {/* Admin Console Trigger */}
        <TouchableOpacity
          onPress={() => setIsAdminModalOpen(true)}
          style={styles.adminBtn}
          activeOpacity={0.8}
        >
          <ShieldAlert size={12} color="#ef4444" />
          <Text style={styles.adminBtnText}>Admin</Text>
        </TouchableOpacity>
      </View>

      {/* Course Hero & Nano Metrics Ribbon */}
      <View style={styles.heroSection}>
        <Text style={styles.heroCourseTitle}>{courseTitle}</Text>
        
        {/* Nano Mode Metrics Bar */}
        <View style={styles.metricsRibbon}>
          <View style={styles.metricItem}>
            <Text style={styles.metricNumber}>{fullSyllabus.totalSubjects || fullSyllabus.subjects.length}</Text>
            <Text style={styles.metricLabel}>Subjects</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricNumber}>{fullSyllabus.totalChapters || 12}</Text>
            <Text style={styles.metricLabel}>Chapters</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={[styles.metricNumber, { color: '#10b981' }]}>{totalMicroCount}</Text>
            <Text style={styles.metricLabel}>Nano Topics</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={[styles.metricNumber, { color: '#38bdf8' }]}>{fullSyllabus.totalDays || 200}</Text>
            <Text style={styles.metricLabel}>Days Plan</Text>
          </View>
        </View>

        {/* Progress Tracker Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTextRow}>
            <Text style={styles.progressStatusText}>
              Syllabus Completion: {completedCount} / {totalMicroCount} Nano Topics
            </Text>
            <Text style={styles.progressPercentText}>
              {totalMicroCount > 0 ? Math.round((completedCount / totalMicroCount) * 100) : 0}%
            </Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${totalMicroCount > 0 ? (completedCount / totalMicroCount) * 100 : 0}%` },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Subject Filter Pills Bar */}
      <View style={styles.subjectFilterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          <TouchableOpacity
            style={[styles.subjectPill, selectedSubjectId === 'all' && styles.subjectPillActive]}
            onPress={() => setSelectedSubjectId('all')}
          >
            <Text style={[styles.subjectPillText, selectedSubjectId === 'all' && styles.subjectPillTextActive]}>
              All Subjects ({totalMicroCount})
            </Text>
          </TouchableOpacity>

          {(fullSyllabus.subjects || []).map(subj => {
            const isActive = selectedSubjectId === subj.subjectId;
            const microCount = (subj.chapters || []).reduce((acc, c) => acc + (c.microTopics?.length || 0), 0);
            return (
              <TouchableOpacity
                key={subj.subjectId}
                style={[styles.subjectPill, isActive && styles.subjectPillActive]}
                onPress={() => setSelectedSubjectId(subj.subjectId)}
              >
                <Text style={styles.subjectPillIcon}>{subj.icon || '📚'}</Text>
                <Text style={[styles.subjectPillText, isActive && styles.subjectPillTextActive]}>
                  {subj.subjectName.split('(')[0].trim()} ({microCount})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Search & Collapse Control Row */}
      <View style={styles.searchAndActionRow}>
        <View style={styles.searchBox}>
          <Search size={15} color="#64748b" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search topics, axioms, formulas..."
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={15} color="#94a3b8" />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity style={styles.expandAllBtn} onPress={toggleExpandAll}>
          <Text style={styles.expandAllBtnText}>
            {Object.values(expandedChapters).every(Boolean) ? 'Collapse' : 'Expand All'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Dedicated Pure Nano-Mode Syllabus List */}
      <FlatList
        data={filteredSubjects}
        keyExtractor={(item) => item.subjectId}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: Math.max(insets.bottom, 24) + 60 }}
        renderItem={({ item: subj, index: sIdx }) => {
          return (
            <View style={styles.subjectCard}>
              {/* Subject Title Banner */}
              <View style={styles.subjectHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Text style={styles.subjectMainIcon}>{subj.icon || '📚'}</Text>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.subjectTitleText}>{subj.subjectName}</Text>
                    <Text style={styles.subjectSubText}>
                      {subj.chapters.length} Chapters • {subj.chapters.reduce((a, c) => a + (c.microTopics?.length || 0), 0)} Nano Topics
                    </Text>
                  </View>
                </View>
              </View>

              {/* Chapters & Nano-Topics Feed */}
              {subj.chapters.map((chap, cIdx) => {
                const chapKey = `${sIdx}-${cIdx}`;
                const isExpanded = expandedChapters[chapKey] !== false;
                const completedInChap = (chap.microTopics || []).filter(m => completedTopics[m.id]).length;
                const totalInChap = chap.microTopics?.length || 0;

                return (
                  <View key={chap.id || cIdx} style={styles.chapterCard}>
                    {/* Chapter Accordion Header */}
                    <TouchableOpacity
                      style={styles.chapterHeader}
                      onPress={() => toggleChapterExpanded(chapKey)}
                      activeOpacity={0.7}
                    >
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <View style={styles.chapterNumberRow}>
                          <View style={styles.chapterNumberBadge}>
                            <Text style={styles.chapterNumberText}>
                              CHAPTER {chap.chapterNumber || cIdx + 1}
                            </Text>
                          </View>
                          <Text style={styles.chapterProgressPill}>
                            {completedInChap}/{totalInChap} Done
                          </Text>
                        </View>
                        <Text style={styles.chapterTitle}>{chap.chapterTitle}</Text>
                        {chap.description ? (
                          <Text style={styles.chapterDesc} numberOfLines={2}>
                            {chap.description}
                          </Text>
                        ) : null}
                      </View>
                      <View style={styles.chevronBox}>
                        {isExpanded ? (
                          <ChevronUp color="#10b981" size={20} />
                        ) : (
                          <ChevronDown color="#94a3b8" size={20} />
                        )}
                      </View>
                    </TouchableOpacity>

                    {/* Nano Topics List */}
                    {isExpanded && (
                      <View style={styles.nanoTopicsContainer}>
                        {(chap.microTopics || []).map((micro: SyllabusMicroTopic, mIdx: number) => {
                          const isDone = !!completedTopics[micro.id];
                          const mTitle = micro.topicTitle || micro.title || `Nano Topic ${mIdx + 1}`;
                          const axiom = micro.keyFormulaOrLaw || micro.keyAxiom;
                          const points = micro.keyPoints || [];
                          const importance = micro.importance || 'High-Yield';

                          return (
                            <View
                              key={micro.id || mIdx}
                              style={[
                                styles.nanoTopicCard,
                                isDone && styles.nanoTopicCardDone
                              ]}
                            >
                              {/* Nano Topic Header Badge */}
                              <View style={styles.nanoTopicHeaderRow}>
                                <View style={styles.nanoDayBadge}>
                                  <Text style={styles.nanoDayText}>
                                    NANO TOPIC {mIdx + 1} • DAY {micro.dayNumber || cIdx + 1} • PERIOD {micro.periodNumber || 1}
                                  </Text>
                                </View>
                                <View
                                  style={[
                                    styles.importancePill,
                                    importance === 'High-Yield'
                                      ? styles.importanceHighYield
                                      : importance === 'Core Standard'
                                      ? styles.importanceCore
                                      : styles.importanceFoundational
                                  ]}
                                >
                                  <Text
                                    style={[
                                      styles.importanceText,
                                      importance === 'High-Yield'
                                        ? styles.importanceTextHighYield
                                        : importance === 'Core Standard'
                                        ? styles.importanceTextCore
                                        : styles.importanceTextFoundational
                                    ]}
                                  >
                                    {importance === 'High-Yield' ? '⚡ High-Yield' : importance}
                                  </Text>
                                </View>
                              </View>

                              {/* Topic Title */}
                              <Text style={[styles.nanoTitle, isDone && styles.nanoTitleDone]}>
                                {mTitle}
                              </Text>

                              {micro.subtopic ? (
                                <Text style={styles.nanoSubtopic}>
                                  📌 {micro.subtopic}
                                </Text>
                              ) : null}

                              {/* 💡 Governing Axiom / Formula / Law Box */}
                              {axiom ? (
                                <View style={styles.axiomContainer}>
                                  <View style={styles.axiomHeaderRow}>
                                    <Sparkles size={12} color="#06b6d4" />
                                    <Text style={styles.axiomHeaderText}>CORE AXIOM / FORMULA</Text>
                                  </View>
                                  <Text style={styles.axiomFormulaText}>{axiom}</Text>
                                </View>
                              ) : null}

                              {/* 📌 Key Micro-Concepts List */}
                              {points.length > 0 && (
                                <View style={styles.keyPointsContainer}>
                                  {points.map((pt, pIdx) => (
                                    <View key={pIdx} style={styles.pointRow}>
                                      <Text style={styles.pointBullet}>•</Text>
                                      <Text style={styles.pointText}>{pt}</Text>
                                    </View>
                                  ))}
                                </View>
                              )}

                              {/* Interactive Actions Row */}
                              <View style={styles.nanoActionsRow}>
                                <TouchableOpacity
                                  style={[
                                    styles.markDoneBtn,
                                    isDone && styles.markDoneBtnActive
                                  ]}
                                  onPress={() => toggleTopicCompleted(micro.id)}
                                >
                                  {isDone ? (
                                    <CheckCircle2 size={16} color="#10b981" />
                                  ) : (
                                    <Circle size={16} color="#64748b" />
                                  )}
                                  <Text style={[styles.markDoneText, isDone && styles.markDoneTextActive]}>
                                    {isDone ? 'Completed' : 'Mark Done'}
                                  </Text>
                                </TouchableOpacity>

                                <View style={styles.actionButtonsRight}>
                                  {/* 10-Q CBT Quiz Trigger */}
                                  <TouchableOpacity
                                    style={styles.cbtQuizBtn}
                                    onPress={() => {
                                      navigation.navigate('TestOExamScreen', {
                                        examConfig: {
                                          id: `cbt_${micro.id || mIdx}`,
                                          title: `${mTitle} (10-Q CBT)`,
                                          subject: subj.subjectName,
                                          totalQuestions: 10,
                                          durationMinutes: 15,
                                          totalMarks: 40,
                                          passPercentage: 40,
                                          topicFilter: mTitle,
                                          isOfficialMock: false
                                        }
                                      });
                                    }}
                                  >
                                    <Text style={styles.cbtQuizBtnText}>📝 10-Q CBT</Text>
                                  </TouchableOpacity>

                                  {/* Course Player Trigger */}
                                  <TouchableOpacity
                                    style={styles.studyPlayerBtn}
                                    onPress={() => openCoursePlayer(mTitle, 'theory', micro.dayNumber || cIdx + 1)}
                                  >
                                    <BookOpen size={13} color="#022c22" style={{ marginRight: 4 }} />
                                    <Text style={styles.studyPlayerBtnText}>Study Player</Text>
                                  </TouchableOpacity>
                                </View>
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No matching syllabus topics found.</Text>
          </View>
        }
      />

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
              </View>
              <Text style={{ fontSize: 15, fontWeight: 'bold', color: playerTheme === 'sepia' ? '#451a03' : playerTheme === 'light' ? '#0f172a' : '#ffffff' }} numberOfLines={1}>
                {playerBook?.topicTitle}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <TouchableOpacity
                onPress={() => setPlayerTheme(prev => prev === 'dark' ? 'sepia' : prev === 'sepia' ? 'light' : 'dark')}
                style={{ padding: 6, borderRadius: 6, backgroundColor: playerTheme === 'sepia' ? '#ede5cf' : playerTheme === 'light' ? '#e2e8f0' : '#1e293b' }}
              >
                <Text style={{ fontSize: 11, color: playerTheme === 'sepia' ? '#78350f' : playerTheme === 'light' ? '#0f172a' : '#e2e8f0' }}>
                  {playerTheme === 'dark' ? '🌙 Dark' : playerTheme === 'sepia' ? '☕ Sepia' : '☀️ Light'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => exportCoursePlayerPDF(playerBook)}
                style={{ padding: 6, borderRadius: 6, backgroundColor: '#10b981' }}
              >
                <Download size={15} color="#022c22" />
              </TouchableOpacity>

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
                  </View>
                ))}
              </View>
            )}

            {playerTab === 'tamil' && playerBook && (
              <View>
                <View style={{ backgroundColor: playerTheme === 'sepia' ? '#fef9c3' : playerTheme === 'light' ? '#fefce8' : '#42200630', padding: 14, borderRadius: 10, marginBottom: 14, borderWidth: 1, borderColor: '#facc15' }}>
                  <Text style={{ fontSize: 15, fontWeight: 'bold', color: playerTheme === 'sepia' ? '#854d0e' : playerTheme === 'light' ? '#a16207' : '#fbbf24', marginBottom: 6 }}>
                    {playerBook.tamilExplanation?.simpleTitle || 'பாடத்தின் அடிப்படைக் கருத்து'}
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
              </View>
            )}

            {playerTab === 'mcq' && playerBook && (
              <View>
                {(playerBook.mcqs || []).map((m: any, idx: number) => (
                  <View key={idx} style={{ marginBottom: 16, backgroundColor: '#0f172a', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#1e293b' }}>
                    <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#ffffff', marginBottom: 10 }}>
                      Q{idx + 1}. {m.question}
                    </Text>
                    {(m.options || []).map((opt: string, optIdx: number) => (
                      <TouchableOpacity
                        key={optIdx}
                        style={{
                          backgroundColor: userMcqAnswers[idx] === optIdx
                            ? (optIdx === m.correct ? '#065f46' : '#991b1b')
                            : '#1e293b',
                          padding: 10,
                          borderRadius: 8,
                          marginBottom: 6
                        }}
                        onPress={() => setUserMcqAnswers(prev => ({ ...prev, [idx]: optIdx }))}
                      >
                        <Text style={{ color: '#ffffff', fontSize: 12 }}>
                          {String.fromCharCode(65 + optIdx)}. {opt}
                        </Text>
                      </TouchableOpacity>
                    ))}
                    {userMcqAnswers[idx] !== undefined && m.explanation ? (
                      <Text style={{ color: '#94a3b8', fontSize: 11, marginTop: 6, fontStyle: 'italic' }}>
                        💡 Explanation: {m.explanation}
                      </Text>
                    ) : null}
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Admin Curriculum Management Modal */}
      <AdminCurriculumEditorModal
        visible={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        initialCourseId={courseId}
        initialCourseTitle={courseTitle}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070d18',
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#070d18',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backBtn: {
    padding: 6,
    marginRight: 8,
  },
  navTextContainer: {
    flex: 1,
  },
  boardBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  boardBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10b981',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  navTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  adminBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  adminBtnText: {
    color: '#ef4444',
    fontSize: 10,
    fontWeight: '800',
  },
  heroSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: '#0b1324',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  heroCourseTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 10,
  },
  metricsRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0f172a',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  metricLabel: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
    fontWeight: '600',
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#334155',
  },
  progressContainer: {
    marginTop: 10,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressStatusText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  progressPercentText: {
    fontSize: 11,
    color: '#10b981',
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 5,
    backgroundColor: '#1e293b',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  subjectFilterBar: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    backgroundColor: '#070d18',
  },
  subjectPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
  },
  subjectPillActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  subjectPillIcon: {
    fontSize: 13,
  },
  subjectPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#cbd5e1',
  },
  subjectPillTextActive: {
    color: '#022c22',
  },
  searchAndActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    height: 38,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 12,
    paddingVertical: 0,
  },
  expandAllBtn: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  expandAllBtnText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
  },
  subjectCard: {
    marginBottom: 20,
  },
  subjectHeader: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  subjectMainIcon: {
    fontSize: 22,
  },
  subjectTitleText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  subjectSubText: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  chapterCard: {
    backgroundColor: '#0b1324',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 12,
    overflow: 'hidden',
  },
  chapterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: '#0f172a',
  },
  chapterNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  chapterNumberBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#38bdf8',
  },
  chapterNumberText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#38bdf8',
    letterSpacing: 0.5,
  },
  chapterProgressPill: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
  },
  chapterTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  chapterDesc: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 3,
    lineHeight: 16,
  },
  chevronBox: {
    padding: 4,
  },
  nanoTopicsContainer: {
    padding: 10,
    backgroundColor: '#070d18',
  },
  nanoTopicCard: {
    backgroundColor: '#0b1324',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  nanoTopicCardDone: {
    borderColor: '#064e3b',
    backgroundColor: '#041d1830',
  },
  nanoTopicHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  nanoDayBadge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  nanoDayText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94a3b8',
  },
  importancePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  importanceHighYield: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  importanceCore: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: '#38bdf8',
  },
  importanceFoundational: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  importanceText: {
    fontSize: 9,
    fontWeight: '800',
  },
  importanceTextHighYield: {
    color: '#f59e0b',
  },
  importanceTextCore: {
    color: '#38bdf8',
  },
  importanceTextFoundational: {
    color: '#10b981',
  },
  nanoTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 4,
    lineHeight: 18,
  },
  nanoTitleDone: {
    color: '#94a3b8',
    textDecorationLine: 'line-through',
  },
  nanoSubtopic: {
    fontSize: 11,
    color: '#38bdf8',
    marginBottom: 8,
    fontWeight: '600',
  },
  axiomContainer: {
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: '#06b6d4',
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
  },
  axiomHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  axiomHeaderText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#06b6d4',
    letterSpacing: 0.5,
  },
  axiomFormulaText: {
    fontSize: 11,
    color: '#e0f2fe',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 16,
  },
  keyPointsContainer: {
    marginBottom: 10,
    paddingLeft: 4,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 3,
  },
  pointBullet: {
    fontSize: 12,
    color: '#10b981',
    marginRight: 6,
    lineHeight: 16,
  },
  pointText: {
    fontSize: 11,
    color: '#cbd5e1',
    flex: 1,
    lineHeight: 16,
  },
  nanoActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: 8,
    marginTop: 4,
  },
  markDoneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  markDoneBtnActive: {},
  markDoneText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  markDoneTextActive: {
    color: '#10b981',
  },
  actionButtonsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cbtQuizBtn: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  cbtQuizBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#f59e0b',
  },
  studyPlayerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
  },
  studyPlayerBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#022c22',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 13,
  },
});
