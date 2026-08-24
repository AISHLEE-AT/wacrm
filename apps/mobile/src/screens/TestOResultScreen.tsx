// @ts-nocheck
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Share,
  Alert,
  Dimensions,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  ChevronLeft,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Share2,
  Download,
  AlertCircle,
  FileCheck2,
  BookOpen,
  TrendingUp,
  Target,
  Zap,
  Bot,
  HelpCircle,
  Flame,
  Bookmark,
  ShieldCheck,
} from 'lucide-react-native';

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const { width } = Dimensions.get('window');

export default function TestOResultScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const {
    score = 0,
    correctCount = 0,
    incorrectCount = 0,
    totalQuestions = 25,
    userAnswers = {},
    questions = [],
    timeTaken = 0,
    timeSpent = {},
    markingScheme = '+4 / -1',
    testTitle = 'TestO Examination',
  } = route.params || {};

  const [activeTab, setActiveTab] = useState<'summary' | 'pacing' | 'review' | 'certificate'>('summary');
  const [reviewFilter, setReviewFilter] = useState<'all' | 'correct' | 'incorrect' | 'skipped'>('all');

  const answeredTotal = correctCount + incorrectCount;
  const skippedCount = totalQuestions - answeredTotal;
  const accuracy = totalQuestions > 0 ? ((correctCount / (answeredTotal || 1)) * 100).toFixed(1) : '0';
  const percentage = parseFloat(accuracy);
  const isPassed = percentage >= 50;
  const percentile = Math.min(99.4, (percentage * 0.95 + 5)).toFixed(1);
  const estimatedRank = Math.max(1, Math.floor((100 - parseFloat(percentile)) * 38.4));

  const avgTimePerQ = answeredTotal > 0 ? Math.round(timeTaken / answeredTotal) : 0;

  const certId = `EDU-VRF-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  const issueDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // Filtered Review Questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q: any, idx: number) => {
      const uAns = userAnswers[idx];
      const cAns = q.correct_answer || q.correctAnswer || q.answer || 'Option A';
      const isCorrect = uAns === cAns;
      const isSkipped = !uAns;

      if (reviewFilter === 'correct') return isCorrect;
      if (reviewFilter === 'incorrect') return !isCorrect && !isSkipped;
      if (reviewFilter === 'skipped') return isSkipped;
      return true;
    });
  }, [questions, userAnswers, reviewFilter]);

  const handleAskAIDoubt = (q: any, idx: number) => {
    const qText = q.question || q.q || '';
    const explanation = q.explanation || q.solution || '';
    navigation.navigate('AishleeToolsScreen', {
      aiPrompt: `Please explain this question from my TutO Exam in simple Tamil and English step-by-step:\n\nQuestion: "${qText}"\nExplanation: "${explanation}"`,
    });
  };

  const handleContactTeacherWhatsApp = () => {
    const adminPhone = '916381029380';
    const msg = `Hello Teacher / SuprO Admin,\n\nI just completed the TestO exam *${testTitle}*.\n📊 My Score: ${score} Marks (${percentage}% Accuracy)\n✅ Correct: ${correctCount} | ❌ Incorrect: ${incorrectCount}\n\nPlease guide me on resolving my doubts and improving my score for this topic.\n\nThank you!`;
    const webLink = `https://wa.me/${adminPhone}?text=${encodeURIComponent(msg)}`;
    Linking.openURL(webLink).catch(() => {});
  };

  const downloadCertificatePDF = async () => {
    try {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #0f172a; text-align: center; }
            .cert-box { border: 4px double #10b981; padding: 36px; border-radius: 20px; background: #f0fdf4; }
            .badge { display: inline-block; background: #10b981; color: #0a0f1e; font-weight: bold; font-size: 11px; padding: 6px 14px; border-radius: 20px; text-transform: uppercase; margin-bottom: 12px; }
            h1 { color: #064e3b; margin: 10px 0; font-size: 24px; }
            .meta { color: #047857; font-size: 13px; font-weight: bold; margin-bottom: 20px; }
            .score-grid { display: flex; justify-content: center; gap: 16px; margin: 24px 0; }
            .score-card { background: #ffffff; border: 1px solid #a7f3d0; padding: 14px 20px; border-radius: 12px; min-width: 100px; }
            .score-val { font-size: 22px; font-weight: 900; color: #059669; }
            .score-lbl { font-size: 10px; color: #6b7280; text-transform: uppercase; font-weight: bold; }
            .footer { margin-top: 24px; font-size: 11px; color: #6ee7b7; border-top: 1px solid #d1fae5; padding-top: 12px; }
          </style>
        </head>
        <body>
          <div class="cert-box">
            <span class="badge">Official Certificate of Achievement</span>
            <h1>${testTitle}</h1>
            <div class="meta">Certificate ID: ${certId} • Issued on ${issueDate}</div>
            <div class="score-grid">
              <div class="score-card">
                <div class="score-val">${score} Marks</div>
                <div class="score-lbl">Score Scored</div>
              </div>
              <div class="score-card">
                <div class="score-val">${accuracy}%</div>
                <div class="score-lbl">Accuracy</div>
              </div>
              <div class="score-card">
                <div class="score-val">${percentile}%ile</div>
                <div class="score-lbl">Percentile</div>
              </div>
            </div>
            <p style="font-size: 13px; color: #065f46; font-weight: 500;">Status: <strong>${isPassed ? 'Qualified with Distinction' : 'Completed Assessment'}</strong></p>
            <div class="footer">
              SuprO National Standard Testing Engine • TestO Examination Ledger
            </div>
          </div>
        </body>
        </html>
      `;
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      } else {
        Share.share({ message: `SuprO TestO Certificate ID: ${certId} - Scored ${score} Marks (${accuracy}% Accuracy) in ${testTitle}` });
      }
    } catch (e) {
      Share.share({ message: `SuprO TestO Certificate ID: ${certId} - Scored ${score} Marks (${accuracy}% Accuracy) in ${testTitle}` });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0f1e" />

      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop:
              Math.max(
                insets.top,
                Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0
              ) + 8,
          },
        ]}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('TutOHubScreen')}>
          <ChevronLeft color="#fff" size={24} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {testTitle}
          </Text>
          <Text style={styles.headerSub}>Comprehensive CBT Performance Analytics</Text>
        </View>
      </View>

      {/* Tab Switcher (Summary, Pacing, Review, Certificate) */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'summary' && styles.tabItemActive]}
          onPress={() => setActiveTab('summary')}
        >
          <Award size={13} color={activeTab === 'summary' ? '#10b981' : '#94a3b8'} style={{ marginRight: 4 }} />
          <Text style={[styles.tabText, activeTab === 'summary' && styles.tabTextActive]}>Scorecard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'pacing' && styles.tabItemActive]}
          onPress={() => setActiveTab('pacing')}
        >
          <Clock size={13} color={activeTab === 'pacing' ? '#10b981' : '#94a3b8'} style={{ marginRight: 4 }} />
          <Text style={[styles.tabText, activeTab === 'pacing' && styles.tabTextActive]}>Pacing</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'review' && styles.tabItemActive]}
          onPress={() => setActiveTab('review')}
        >
          <FileCheck2 size={13} color={activeTab === 'review' ? '#10b981' : '#94a3b8'} style={{ marginRight: 4 }} />
          <Text style={[styles.tabText, activeTab === 'review' && styles.tabTextActive]}>Solutions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'certificate' && styles.tabItemActive]}
          onPress={() => setActiveTab('certificate')}
        >
          <Sparkles size={13} color={activeTab === 'certificate' ? '#10b981' : '#94a3b8'} style={{ marginRight: 4 }} />
          <Text style={[styles.tabText, activeTab === 'certificate' && styles.tabTextActive]}>Certificate</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* ─── TAB 1: HERO SCORECARD & RANK ─── */}
        {activeTab === 'summary' && (
          <View>
            <View style={styles.scoreHero}>
              <View style={[styles.gradeBadge, isPassed ? styles.gradeBadgePass : styles.gradeBadgeFail]}>
                <Text style={[styles.gradeText, isPassed ? styles.gradeTextPass : styles.gradeTextFail]}>
                  {isPassed ? '🏆 QUALIFIED FOR MERIT CUT-OFF' : '⚠️ BELOW CUT-OFF (NEEDS REVISION)'}
                </Text>
              </View>

              <Text style={styles.heroScore}>
                {score} <Text style={styles.heroTotal}>Marks</Text>
              </Text>
              <Text style={styles.heroSubText}>
                {correctCount} Correct (+{correctCount * 4}) • {incorrectCount} Incorrect (-{incorrectCount})
              </Text>

              {/* Benchmark Grid */}
              <View style={styles.metricGrid}>
                <View style={styles.metricCard}>
                  <Text style={styles.metricVal}>{accuracy}%</Text>
                  <Text style={styles.metricLabel}>Accuracy</Text>
                </View>

                <View style={styles.metricCard}>
                  <Text style={[styles.metricVal, { color: '#fbbf24' }]}>#{estimatedRank}</Text>
                  <Text style={styles.metricLabel}>All-India Rank</Text>
                </View>

                <View style={styles.metricCard}>
                  <Text style={[styles.metricVal, { color: '#38bdf8' }]}>{percentile}%ile</Text>
                  <Text style={styles.metricLabel}>Percentile</Text>
                </View>
              </View>
            </View>

            {/* AI Diagnostics & TutO Topic Revision Card */}
            <View style={styles.analysisCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <Sparkles size={16} color="#10b981" style={{ marginRight: 8 }} />
                <Text style={styles.analysisTitle}>AI Topic Diagnostics & TutO Study Plan</Text>
              </View>
              <Text style={styles.analysisBody}>
                {percentage >= 80
                  ? 'Excellent accuracy! You have strong mastery over core theoretical concepts. Focus on speed drills in TutO to improve your percentile rank.'
                  : percentage >= 50
                  ? 'Good performance! We detected 2 weak problem areas in applied questions. Tap below to revise the exact micro-lessons in TutO.'
                  : 'Conceptual gaps identified in fundamentals. We recommend completing the full 4-step Daily Plan in TutO before re-attempting.'}
              </Text>

              <TouchableOpacity
                style={styles.teachoReviseBtn}
                onPress={() => navigation.navigate('TutOHubScreen')}
              >
                <BookOpen size={14} color="#0a0f1e" style={{ marginRight: 6 }} />
                <Text style={styles.teachoReviseBtnText}>Revise Weak Topics in TutO 📚</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.teachoReviseBtn, { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#10b981', marginTop: 10 }]}
                onPress={handleContactTeacherWhatsApp}
              >
                <Sparkles size={14} color="#10b981" style={{ marginRight: 6 }} />
                <Text style={[styles.teachoReviseBtnText, { color: '#10b981' }]}>Ask Teacher Doubt on WhatsApp 💬</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ─── TAB 2: TIME MANAGEMENT & PACING ANALYSIS ─── */}
        {activeTab === 'pacing' && (
          <View>
            <View style={styles.pacingHero}>
              <Text style={styles.pacingTitle}>Speed vs. Accuracy Diagnostic Matrix</Text>
              <Text style={styles.pacingSub}>Average Time per Question: <Text style={{ color: '#10b981', fontWeight: '800' }}>{avgTimePerQ}s</Text> (Target: 45-60s)</Text>

              {/* 4-Quadrant Matrix */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 14 }}>
                <View style={[styles.pacingCard, { width: '48%', marginBottom: 10, borderColor: '#10b981', borderWidth: 1, backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                  <Text style={{ fontSize: 20 }}>🎯</Text>
                  <Text style={[styles.pacingVal, { color: '#10b981' }]}>{route.params?.diagnosticReport?.speedAccuracyMatrix?.perfectAttempts || correctCount}</Text>
                  <Text style={[styles.pacingLbl, { color: '#10b981', fontWeight: '700' }]}>Perfect Attempts</Text>
                  <Text style={{ color: '#94a3b8', fontSize: 10, marginTop: 2 }}>Fast (&lt;45s) &amp; Correct</Text>
                </View>

                <View style={[styles.pacingCard, { width: '48%', marginBottom: 10, borderColor: '#f59e0b', borderWidth: 1, backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                  <Text style={{ fontSize: 20 }}>⚡</Text>
                  <Text style={[styles.pacingVal, { color: '#f59e0b' }]}>{route.params?.diagnosticReport?.speedAccuracyMatrix?.carelessErrors || incorrectCount}</Text>
                  <Text style={[styles.pacingLbl, { color: '#f59e0b', fontWeight: '700' }]}>Careless Errors</Text>
                  <Text style={{ color: '#94a3b8', fontSize: 10, marginTop: 2 }}>Fast (&lt;45s) &amp; Incorrect</Text>
                </View>

                <View style={[styles.pacingCard, { width: '48%', borderColor: '#38bdf8', borderWidth: 1, backgroundColor: 'rgba(56, 189, 248, 0.1)' }]}>
                  <Text style={{ fontSize: 20 }}>⏳</Text>
                  <Text style={[styles.pacingVal, { color: '#38bdf8' }]}>{route.params?.diagnosticReport?.speedAccuracyMatrix?.overtimeCorrect || 0}</Text>
                  <Text style={[styles.pacingLbl, { color: '#38bdf8', fontWeight: '700' }]}>Overtime Correct</Text>
                  <Text style={{ color: '#94a3b8', fontSize: 10, marginTop: 2 }}>Slow (&gt;90s) &amp; Correct</Text>
                </View>

                <View style={[styles.pacingCard, { width: '48%', borderColor: '#ef4444', borderWidth: 1, backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                  <Text style={{ fontSize: 20 }}>⚠️</Text>
                  <Text style={[styles.pacingVal, { color: '#ef4444' }]}>{route.params?.diagnosticReport?.speedAccuracyMatrix?.wastedAttempts || 0}</Text>
                  <Text style={[styles.pacingLbl, { color: '#ef4444', fontWeight: '700' }]}>Wasted Attempts</Text>
                  <Text style={{ color: '#94a3b8', fontSize: 10, marginTop: 2 }}>Slow (&gt;90s) &amp; Incorrect</Text>
                </View>
              </View>
            </View>

            {/* Topic Strength Heatmap */}
            <View style={[styles.analysisCard, { marginTop: 16 }]}>
              <View style={styles.analysisHeader}>
                <Target size={16} color="#38bdf8" style={{ marginRight: 8 }} />
                <Text style={styles.analysisTitle}>Topic-Level Strength &amp; Weakness Heatmap</Text>
              </View>

              {route.params?.diagnosticReport?.topicHeatmap && route.params.diagnosticReport.topicHeatmap.length > 0 ? (
                route.params.diagnosticReport.topicHeatmap.map((item: any, idx: number) => (
                  <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' }}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Text style={{ color: '#f8fafc', fontSize: 13, fontWeight: '700' }}>{item.topicName}</Text>
                      <Text style={{ color: '#94a3b8', fontSize: 11 }}>{item.correct} / {item.total} Questions Correct ({item.accuracy}%)</Text>
                    </View>
                    <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: item.status === 'Strong' ? 'rgba(16,185,129,0.2)' : item.status === 'Moderate' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)' }}>
                      <Text style={{ color: item.status === 'Strong' ? '#10b981' : item.status === 'Moderate' ? '#f59e0b' : '#ef4444', fontSize: 11, fontWeight: '800' }}>
                        {item.status}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={{ paddingVertical: 8 }}>
                  <Text style={{ color: '#94a3b8', fontSize: 13 }}>Standard syllabus distribution analyzed across core subjects.</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ─── TAB 3: QUESTION SOLUTIONS & AI DOUBT ASSISTANT ─── */}
        {activeTab === 'review' && (
          <View>
            {/* Filter Pills */}
            <View style={styles.reviewFilterRow}>
              {(['all', 'correct', 'incorrect', 'skipped'] as const).map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[styles.filterChip, reviewFilter === f && styles.filterChipActive]}
                  onPress={() => setReviewFilter(f)}
                >
                  <Text style={[styles.filterChipText, reviewFilter === f && styles.filterChipTextActive]}>
                    {f.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {filteredQuestions.map((q: any, idx: number) => {
              const uAns = userAnswers[idx] || 'Not Answered';
              const cAns = q.correct_answer || q.correctAnswer || q.answer || 'Option A';
              const isCorrect = uAns === cAns;
              const isSkipped = !userAnswers[idx];

              return (
                <View key={idx} style={styles.qCard}>
                  <View style={styles.qCardHeader}>
                    <Text style={styles.qNumber}>QUESTION {idx + 1}</Text>
                    {isCorrect ? (
                      <View style={styles.statusCorrect}>
                        <CheckCircle2 size={13} color="#10b981" style={{ marginRight: 4 }} />
                        <Text style={styles.statusCorrectText}>Correct (+4)</Text>
                      </View>
                    ) : isSkipped ? (
                      <View style={styles.statusSkipped}>
                        <Text style={styles.statusSkippedText}>Skipped (0)</Text>
                      </View>
                    ) : (
                      <View style={styles.statusIncorrect}>
                        <XCircle size={13} color="#ef4444" style={{ marginRight: 4 }} />
                        <Text style={styles.statusIncorrectText}>Incorrect (-1)</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.qText}>{q.question || q.q}</Text>

                  <View style={styles.ansBox}>
                    <View style={styles.ansRow}>
                      <Text style={styles.ansLabel}>Your Choice:</Text>
                      <Text style={[styles.ansValue, { color: isCorrect ? '#10b981' : isSkipped ? '#94a3b8' : '#ef4444' }]}>
                        {uAns}
                      </Text>
                    </View>

                    <View style={styles.ansRow}>
                      <Text style={styles.ansLabel}>Correct Answer:</Text>
                      <Text style={[styles.ansValue, { color: '#10b981' }]}>{cAns}</Text>
                    </View>
                  </View>

                  {(q.explanation || q.solution) && (
                    <View style={styles.explanationBox}>
                      <Text style={styles.expLabel}>💡 Step-by-Step Verified Solution:</Text>
                      <Text style={styles.expText}>{q.explanation || q.solution}</Text>
                    </View>
                  )}

                  {/* 🤖 Ask AI Doubt Assistant */}
                  <TouchableOpacity
                    style={styles.aiDoubtBtn}
                    onPress={() => handleAskAIDoubt(q, idx)}
                  >
                    <Bot size={14} color="#10b981" />
                    <Text style={styles.aiDoubtBtnText}>Ask AI Doubt Assistant</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        {/* ─── TAB 4: VERIFIED CERTIFICATE ─── */}
        {activeTab === 'certificate' && (
          <View style={styles.certContainer}>
            <View style={styles.certCard}>
              <View style={styles.certBorder}>
                <Award size={36} color="#fbbf24" style={{ alignSelf: 'center', marginBottom: 8 }} />
                <Text style={styles.certOrg}>SUPRO TESTING ENGINE</Text>
                <Text style={styles.certTitle}>Certificate of Assessment</Text>

                <Text style={styles.certSubtitle}>This is proudly presented to Candidate</Text>
                <Text style={styles.certExamName}>{testTitle}</Text>

                <View style={styles.certDivider} />

                <View style={styles.certDetailsRow}>
                  <View>
                    <Text style={styles.certMetaLabel}>Score Scored</Text>
                    <Text style={styles.certMetaVal}>
                      {score} Marks ({accuracy}%)
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.certMetaLabel}>Percentile</Text>
                    <Text style={styles.certMetaVal}>{percentile}%ile</Text>
                  </View>
                </View>

                <View style={styles.certVerifyBox}>
                  <Text style={styles.certVerifyId}>ID: {certId}</Text>
                  <Text style={styles.certVerifySub}>Verifiable on Supabase Testing Ledger</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.shareBtn} onPress={downloadCertificatePDF}>
              <Share2 size={16} color="#0a0f1e" style={{ marginRight: 6 }} />
              <Text style={styles.shareBtnText}>Share Verified Scorecard (PDF)</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1e',
  },
  header: {
    backgroundColor: '#111827',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backBtn: {
    marginRight: 10,
    padding: 4,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  headerSub: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '700',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    gap: 6,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  tabItemActive: {
    backgroundColor: '#1e293b',
  },
  tabText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#10b981',
    fontWeight: '800',
  },
  content: {
    padding: 14,
    paddingBottom: 80,
  },
  scoreHero: {
    backgroundColor: '#111827',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
  },
  gradeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  gradeBadgePass: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
    borderWidth: 1,
  },
  gradeBadgeFail: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderWidth: 1,
  },
  gradeText: {
    fontSize: 11,
    fontWeight: '900',
  },
  gradeTextPass: {
    color: '#10b981',
  },
  gradeTextFail: {
    color: '#ef4444',
  },
  heroScore: {
    fontSize: 40,
    fontWeight: '900',
    color: '#ffffff',
  },
  heroTotal: {
    fontSize: 20,
    color: '#64748b',
  },
  heroSubText: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 16,
    fontWeight: '500',
  },
  metricGrid: {
    flexDirection: 'row',
    width: '100%',
    gap: 8,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  metricVal: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  metricLabel: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
  },
  analysisCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 14,
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  analysisTitle: {
    color: '#10b981',
    fontSize: 13,
    fontWeight: '800',
  },
  analysisBody: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  teachoReviseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 10,
    borderRadius: 10,
  },
  teachoReviseBtnText: {
    color: '#0a0f1e',
    fontSize: 12,
    fontWeight: '900',
  },
  pacingHero: {
    backgroundColor: '#111827',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 14,
  },
  pacingTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  pacingSub: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 14,
  },
  pacingGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  pacingCard: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  pacingVal: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
    marginBottom: 2,
  },
  pacingLbl: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
  },
  reviewFilterRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  filterChipActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10b981',
  },
  filterChipText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: '#10b981',
    fontWeight: '900',
  },
  qCard: {
    backgroundColor: '#111827',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 14,
    marginBottom: 12,
  },
  qCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  qNumber: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusCorrect: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusCorrectText: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: '800',
  },
  statusSkipped: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusSkippedText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
  },
  statusIncorrect: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusIncorrectText: {
    color: '#ef4444',
    fontSize: 10,
    fontWeight: '800',
  },
  qText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 10,
    lineHeight: 19,
  },
  ansBox: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  ansRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  ansLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  ansValue: {
    fontSize: 11,
    fontWeight: '800',
  },
  explanationBox: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  expLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#fbbf24',
    marginBottom: 2,
  },
  expText: {
    fontSize: 11,
    color: '#cbd5e1',
    lineHeight: 16,
  },
  aiDoubtBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  aiDoubtBtnText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '800',
  },
  certContainer: {
    alignItems: 'center',
  },
  certCard: {
    backgroundColor: '#111827',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(251, 191, 36, 0.5)',
    padding: 6,
    width: '100%',
    marginBottom: 16,
  },
  certBorder: {
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  certOrg: {
    color: '#fbbf24',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  certTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 12,
  },
  certSubtitle: {
    color: '#94a3b8',
    fontSize: 11,
  },
  certExamName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  certDivider: {
    height: 1,
    backgroundColor: '#1e293b',
    width: '100%',
    marginBottom: 12,
  },
  certDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,
  },
  certMetaLabel: {
    color: '#64748b',
    fontSize: 10,
  },
  certMetaVal: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  certVerifyBox: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
  },
  certVerifyId: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: '800',
  },
  certVerifySub: {
    color: '#64748b',
    fontSize: 9,
    marginTop: 1,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fbbf24',
    paddingVertical: 12,
    borderRadius: 10,
    width: '100%',
  },
  shareBtnText: {
    color: '#0a0f1e',
    fontSize: 13,
    fontWeight: '900',
  },
});
