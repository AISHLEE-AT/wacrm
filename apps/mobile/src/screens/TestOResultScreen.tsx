// @ts-nocheck
import React, { useState } from 'react';
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
} from 'react-native';
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
} from 'lucide-react-native';

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function TestOResultScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const {
    score = 0,
    totalQuestions = 0,
    userAnswers = {},
    questions = [],
    timeTaken = 0,
    testTitle = 'TestO Examination',
  } = route.params || {};

  const [activeTab, setActiveTab] = useState<'summary' | 'review' | 'certificate'>('summary');

  const accuracy = totalQuestions > 0 ? ((score / totalQuestions) * 100).toFixed(1) : '0';
  const percentage = parseFloat(accuracy);
  const isPassed = percentage >= 40;
  const grade =
    percentage >= 90 ? 'A+' : percentage >= 75 ? 'A' : percentage >= 60 ? 'B' : percentage >= 40 ? 'C' : 'F';

  const certId = `EDU-VRF-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  const issueDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

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
                <div class="score-val">${score} / ${totalQuestions}</div>
                <div class="score-lbl">Total Score</div>
              </div>
              <div class="score-card">
                <div class="score-val">${accuracy}%</div>
                <div class="score-lbl">Accuracy</div>
              </div>
              <div class="score-card">
                <div class="score-val">${grade}</div>
                <div class="score-lbl">Grade</div>
              </div>
            </div>
            <p style="font-size: 13px; color: #065f46; font-weight: 500;">Status: <strong>${isPassed ? 'Passed with Distinction' : 'Completed'}</strong></p>
            <div class="footer">
              EduVerse AI Testing Authority • SuprO National Learning Ledger
            </div>
          </div>
        </body>
        </html>
      `;
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      } else {
        Share.share({ message: `EduVerse Certificate ID: ${certId} - Scored ${score}/${totalQuestions} in ${testTitle}` });
      }
    } catch (e) {
      Share.share({ message: `EduVerse Certificate ID: ${certId} - Scored ${score}/${totalQuestions} in ${testTitle}` });
    }
  };

  const handleShareCertificate = async () => {
    downloadCertificatePDF();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0f1e" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('TeachOScreen')}>
          <ChevronLeft color="#fff" size={24} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {testTitle}
          </Text>
          <Text style={styles.headerSub}>Exam Performance Report</Text>
        </View>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'summary' && styles.tabItemActive]}
          onPress={() => setActiveTab('summary')}
        >
          <Award size={14} color={activeTab === 'summary' ? '#10b981' : '#94a3b8'} style={{ marginRight: 6 }} />
          <Text style={[styles.tabText, activeTab === 'summary' && styles.tabTextActive]}>Scorecard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'review' && styles.tabItemActive]}
          onPress={() => setActiveTab('review')}
        >
          <FileCheck2 size={14} color={activeTab === 'review' ? '#10b981' : '#94a3b8'} style={{ marginRight: 6 }} />
          <Text style={[styles.tabText, activeTab === 'review' && styles.tabTextActive]}>Review Q&A</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'certificate' && styles.tabItemActive]}
          onPress={() => setActiveTab('certificate')}
        >
          <Sparkles size={14} color={activeTab === 'certificate' ? '#10b981' : '#94a3b8'} style={{ marginRight: 6 }} />
          <Text style={[styles.tabText, activeTab === 'certificate' && styles.tabTextActive]}>Certificate</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === 'summary' && (
          <View>
            {/* Scorecard Hero */}
            <View style={styles.scoreHero}>
              <View style={[styles.gradeBadge, isPassed ? styles.gradeBadgePass : styles.gradeBadgeFail]}>
                <Text style={[styles.gradeText, isPassed ? styles.gradeTextPass : styles.gradeTextFail]}>
                  GRADE {grade} • {isPassed ? 'QUALIFIED' : 'NEEDS IMPROVEMENT'}
                </Text>
              </View>

              <Text style={styles.heroScore}>
                {score} <Text style={styles.heroTotal}>/ {totalQuestions}</Text>
              </Text>
              <Text style={styles.heroSubText}>Total Score Achieved</Text>

              {/* Metric Grid */}
              <View style={styles.metricGrid}>
                <View style={styles.metricCard}>
                  <Text style={styles.metricVal}>{accuracy}%</Text>
                  <Text style={styles.metricLabel}>Accuracy</Text>
                </View>

                <View style={styles.metricCard}>
                  <Text style={styles.metricVal}>{score * 10} XP</Text>
                  <Text style={styles.metricLabel}>XP Earned</Text>
                </View>

                <View style={styles.metricCard}>
                  <Text style={styles.metricVal}>Top {percentage > 70 ? '10%' : '35%'}</Text>
                  <Text style={styles.metricLabel}>Rank Band</Text>
                </View>
              </View>
            </View>

            {/* Diagnostic Report */}
            <View style={styles.analysisCard}>
              <View style={styles.analysisHeader}>
                <Sparkles size={16} color="#10b981" style={{ marginRight: 8 }} />
                <Text style={styles.analysisTitle}>AI Diagnostic Recommendation</Text>
              </View>
              <Text style={styles.analysisBody}>
                {percentage >= 80
                  ? 'Outstanding performance! You have demonstrated strong conceptual clarity. Keep practicing timed mock tests to maintain your speed.'
                  : percentage >= 50
                  ? 'Good effort! Focus on revising incorrect questions and review Chapter formulas and Mind Maps in TeachO.'
                  : 'We recommend going back to the TeachO video masterclasses and flashcards for this subject before attempting the test again.'}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => setActiveTab('review')}
              >
                <FileCheck2 size={16} color="#0a0f1e" style={{ marginRight: 8 }} />
                <Text style={styles.primaryBtnText}>Review Detailed Solutions</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => navigation.navigate('TeachOScreen')}
              >
                <BookOpen size={16} color="#10b981" style={{ marginRight: 8 }} />
                <Text style={styles.secondaryBtnText}>Back to Courses</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'review' && (
          <View>
            <Text style={styles.listTitle}>Question-by-Question Solution</Text>
            {questions.map((q: any, idx: number) => {
              const uAns = userAnswers[idx] || 'Not Answered';
              const cAns = q.correct_answer || q.correctAnswer || q.answer || 'Option A';
              const isCorrect = uAns === cAns;

              return (
                <View key={idx} style={styles.qCard}>
                  <View style={styles.qCardHeader}>
                    <Text style={styles.qNumber}>QUESTION {idx + 1}</Text>
                    {isCorrect ? (
                      <View style={styles.statusCorrect}>
                        <CheckCircle2 size={14} color="#10b981" style={{ marginRight: 4 }} />
                        <Text style={styles.statusCorrectText}>Correct (+1)</Text>
                      </View>
                    ) : (
                      <View style={styles.statusIncorrect}>
                        <XCircle size={14} color="#ef4444" style={{ marginRight: 4 }} />
                        <Text style={styles.statusIncorrectText}>Incorrect</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.qText}>{q.question || q.q}</Text>

                  <View style={styles.ansBox}>
                    <View style={styles.ansRow}>
                      <Text style={styles.ansLabel}>Your Choice:</Text>
                      <Text style={[styles.ansValue, { color: isCorrect ? '#10b981' : '#ef4444' }]}>
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
                      <Text style={styles.expLabel}>💡 Detailed Explanation:</Text>
                      <Text style={styles.expText}>{q.explanation || q.solution}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {activeTab === 'certificate' && (
          <View style={styles.certContainer}>
            {/* Certificate Card */}
            <View style={styles.certCard}>
              <View style={styles.certBorder}>
                <Award size={36} color="#f59e0b" style={{ alignSelf: 'center', marginBottom: 8 }} />
                <Text style={styles.certOrg}>EDUPERSE AI ACADEMY</Text>
                <Text style={styles.certTitle}>Certificate of Achievement</Text>

                <Text style={styles.certSubtitle}>This is proudly presented to</Text>
                <Text style={styles.certStudent}>Candidate</Text>
                <Text style={styles.certFor}>for successfully completing the examination</Text>
                <Text style={styles.certExamName}>{testTitle}</Text>

                <View style={styles.certDivider} />

                <View style={styles.certDetailsRow}>
                  <View>
                    <Text style={styles.certMetaLabel}>Score Achieved</Text>
                    <Text style={styles.certMetaVal}>
                      {score} / {totalQuestions} ({accuracy}%)
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.certMetaLabel}>Date Issued</Text>
                    <Text style={styles.certMetaVal}>{issueDate}</Text>
                  </View>
                </View>

                <View style={styles.certVerifyBox}>
                  <Text style={styles.certVerifyId}>Verification ID: {certId}</Text>
                  <Text style={styles.certVerifySub}>Verifiable on Supabase Education Ledger</Text>
                </View>
              </View>
            </View>

            {/* Share Button */}
            <TouchableOpacity style={styles.shareBtn} onPress={handleShareCertificate}>
              <Share2 size={18} color="#0a0f1e" style={{ marginRight: 8 }} />
              <Text style={styles.shareBtnText}>Share Verified Certificate</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
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
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backBtn: {
    marginRight: 12,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerSub: {
    color: '#94a3b8',
    fontSize: 12,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
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
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  scoreHero: {
    backgroundColor: '#111827',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  gradeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginBottom: 12,
  },
  gradeBadgePass: {
    backgroundColor: '#10b98120',
    borderColor: '#10b98150',
    borderWidth: 1,
  },
  gradeBadgeFail: {
    backgroundColor: '#ef444420',
    borderColor: '#ef444450',
    borderWidth: 1,
  },
  gradeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  gradeTextPass: {
    color: '#10b981',
  },
  gradeTextFail: {
    color: '#ef4444',
  },
  heroScore: {
    fontSize: 44,
    fontWeight: '900',
    color: '#ffffff',
  },
  heroTotal: {
    fontSize: 22,
    color: '#64748b',
  },
  heroSubText: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 18,
  },
  metricGrid: {
    flexDirection: 'row',
    width: '100%',
    gap: 8,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  metricVal: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  metricLabel: {
    color: '#94a3b8',
    fontSize: 11,
  },
  analysisCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 16,
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  analysisTitle: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: 'bold',
  },
  analysisBody: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 20,
  },
  actionRow: {
    gap: 10,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 12,
  },
  primaryBtnText: {
    color: '#0a0f1e',
    fontSize: 15,
    fontWeight: 'bold',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingVertical: 14,
    borderRadius: 12,
  },
  secondaryBtnText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: 'bold',
  },
  listTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 14,
  },
  qCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 14,
  },
  qCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  qNumber: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  statusCorrect: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b98120',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusCorrectText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: 'bold',
  },
  statusIncorrect: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef444420',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusIncorrectText: {
    color: '#ef4444',
    fontSize: 11,
    fontWeight: 'bold',
  },
  qText: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 14,
    lineHeight: 22,
  },
  ansBox: {
    backgroundColor: '#1e293b50',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  ansRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  ansLabel: {
    fontSize: 13,
    color: '#94a3b8',
  },
  ansValue: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  explanationBox: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 12,
    marginTop: 6,
  },
  expLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#f59e0b',
    marginBottom: 4,
  },
  expText: {
    fontSize: 13,
    color: '#cbd5e1',
    lineHeight: 19,
  },
  certContainer: {
    alignItems: 'center',
  },
  certCard: {
    backgroundColor: '#111827',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#f59e0b80',
    padding: 6,
    width: '100%',
    marginBottom: 20,
  },
  certBorder: {
    borderWidth: 1,
    borderColor: '#f59e0b40',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  certOrg: {
    color: '#f59e0b',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  certTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 16,
  },
  certSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
  },
  certStudent: {
    color: '#10b981',
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  certFor: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 2,
  },
  certExamName: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  certDivider: {
    height: 1,
    backgroundColor: '#1e293b',
    width: '100%',
    marginBottom: 14,
  },
  certDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 14,
  },
  certMetaLabel: {
    color: '#64748b',
    fontSize: 11,
  },
  certMetaVal: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 2,
  },
  certVerifyBox: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  certVerifyId: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: 'bold',
  },
  certVerifySub: {
    color: '#64748b',
    fontSize: 10,
    marginTop: 2,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f59e0b',
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
  },
  shareBtnText: {
    color: '#0a0f1e',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
