import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, 
  ScrollView, SafeAreaView, Alert, Dimensions, Modal, Platform, StatusBar
} from 'react-native';
import { aishleeSupabase } from '../services/aishleeSupabase';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Clock, Menu, X, ChevronLeft, ChevronRight, WifiOff } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// Status types: 'NOT_VISITED' | 'NOT_ANSWERED' | 'ANSWERED' | 'REVIEW' | 'ANSWERED_REVIEW'
const STATUS_COLORS = {
  NOT_VISITED: '#d1d5db', // Gray
  NOT_ANSWERED: '#ef4444', // Red
  ANSWERED: '#22c55e', // Green
  REVIEW: '#a855f7', // Purple
  ANSWERED_REVIEW: '#8b5cf6', // Indigo
};

export default function TestOExamScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { testId, title } = route.params;

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [qStatus, setQStatus] = useState<Record<number, string>>({});
  
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 mins default
  const [isPaletteVisible, setIsPaletteVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const timerRef = useRef<any>(null);

  useEffect(() => {
    fetchExamData();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!loading && !submitted) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleSubmit(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current!);
  }, [loading, submitted]);

  const fetchExamData = async () => {
    try {
      let info: any = {};
      
      if (route.params.localQuestions) {
        // If passing raw JSON from AI Hub local history
        info = { questions: route.params.localQuestions };
      } else {
        const { data, error } = await aishleeSupabase
          .from('unified_master_data')
          .select('*')
          .eq('id', testId)
          .single();
        
        if (error) throw error;
        info = data.additional_info || data.metadata || {};
      }
      
      if (typeof info === 'string') {
        try { info = JSON.parse(info); } catch(e) {}
      }
      if (typeof info === 'string') {
        try { info = JSON.parse(info); } catch(e) {}
      }

      let qs = [];
      if (Array.isArray(info)) {
        qs = info;
      } else if (info.questions && Array.isArray(info.questions)) {
        qs = info.questions;
      } else if (info.data && Array.isArray(info.data)) {
        qs = info.data;
      }

      if (qs.length === 0) {
        qs = [
          {
            question: "This test doesn't have any questions configured in the database yet. (Mock Q1)",
            options: ["Option A", "Option B", "Option C", "Option D"],
            answer: "Option A"
          },
          {
            question: "Sample Question 2 for testing UI.",
            options: ["True", "False"],
            answer: "True"
          }
        ];
      }

      setQuestions(qs);
      // Cache for offline usage
      if (testId) {
        AsyncStorage.setItem(`offline_test_${testId}`, JSON.stringify(qs)).catch(() => {});
      }

      // Initialize statuses
      const initialStatus: Record<number, string> = {};
      qs.forEach((_: any, i: number) => {
        initialStatus[i] = i === 0 ? 'NOT_ANSWERED' : 'NOT_VISITED';
      });
      setQStatus(initialStatus);
    } catch (err) {
      console.warn('[TestOExamScreen] Network fetch failed, checking offline cache...');
      try {
        const cached = await AsyncStorage.getItem(`offline_test_${testId}`);
        if (cached) {
          const cachedQs = JSON.parse(cached);
          if (Array.isArray(cachedQs) && cachedQs.length > 0) {
            setQuestions(cachedQs);
            const initialStatus: Record<number, string> = {};
            cachedQs.forEach((_: any, i: number) => {
              initialStatus[i] = i === 0 ? 'NOT_ANSWERED' : 'NOT_VISITED';
            });
            setQStatus(initialStatus);
            Alert.alert("Offline Mode", "Loaded exam questions from offline storage.");
            setLoading(false);
            return;
          }
        }
      } catch (cacheErr) {}

      Alert.alert("Error", "Failed to load exam data. Please check your internet connection.");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (option: string) => {
    setAnswers({ ...answers, [currentIdx]: option });
  };

  const goToNext = (statusUpdate: string) => {
    const isAnswered = !!answers[currentIdx];
    
    // Determine the actual status to save
    let newStatus = statusUpdate;
    if (statusUpdate === 'REVIEW') {
      newStatus = isAnswered ? 'ANSWERED_REVIEW' : 'REVIEW';
    } else if (statusUpdate === 'SAVE') {
      newStatus = isAnswered ? 'ANSWERED' : 'NOT_ANSWERED';
    }

    setQStatus(prev => ({ ...prev, [currentIdx]: newStatus }));

    if (currentIdx < questions.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      // Mark next as visited if it was NOT_VISITED
      setQStatus(prev => ({
        ...prev,
        [nextIdx]: prev[nextIdx] === 'NOT_VISITED' ? 'NOT_ANSWERED' : prev[nextIdx]
      }));
    }
  };

  const jumpToQuestion = (idx: number) => {
    setCurrentIdx(idx);
    setIsPaletteVisible(false);
    setQStatus(prev => ({
      ...prev,
      [idx]: prev[idx] === 'NOT_VISITED' ? 'NOT_ANSWERED' : prev[idx]
    }));
  };

  const clearResponse = () => {
    const newAnswers = { ...answers };
    delete newAnswers[currentIdx];
    setAnswers(newAnswers);
  };

  const handleSubmit = (autoSubmit = false) => {
    if (autoSubmit) {
      finishExam();
      return;
    }

    const answeredCount = Object.keys(answers).length;
    Alert.alert(
      "Submit Exam",
      `You have answered ${answeredCount} out of ${questions.length} questions. Are you sure you want to submit?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Submit", style: "destructive", onPress: finishExam }
      ]
    );
  };

  const finishExam = () => {
    setSubmitted(true);
    if (timerRef.current) clearInterval(timerRef.current);
    let score = 0;
    questions.forEach((q, idx) => {
      const correct = q.correct_answer || q.correctAnswer || q.answer || 'Option A';
      if (answers[idx] === correct) {
        score += 1;
      }
    });
    setFinalScore(score);
    navigation.replace('TestOResultScreen', {
      score,
      totalQuestions: questions.length,
      userAnswers: answers,
      questions,
      timeTaken: 30 * 60 - timeLeft,
      testTitle: title || 'TestO Mock Examination',
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ color: '#fff', marginTop: 10 }}>Loading Exam Environment...</Text>
      </View>
    );
  }

  const currentQ = questions[currentIdx];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0f1e" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            Alert.alert(
              'Exit Examination',
              'Are you sure you want to exit? Your current test progress will be lost.',
              [
                { text: 'Continue Test', style: 'cancel' },
                { text: 'Exit Test', style: 'destructive', onPress: () => navigation.goBack() },
              ]
            );
          }}
        >
          <ChevronLeft size={24} color="#ffffff" />
        </TouchableOpacity>

        <View style={styles.headerLeft}>
          <Text style={styles.examTitle} numberOfLines={1}>
            {title || 'Mock Examination'}
          </Text>
          <Text style={styles.sectionTitle}>EduVerse AI Test Engine</Text>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.timerContainer}>
            <Clock size={14} color="#10b981" />
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          </View>
          <TouchableOpacity onPress={() => setIsPaletteVisible(true)} style={styles.menuBtn}>
            <Menu size={22} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* QUESTION CONTENT */}
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 30 }}>
        <View style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <Text style={styles.questionNumber}>
              QUESTION {currentIdx + 1} OF {questions.length}
            </Text>
            <View style={styles.marksBadge}>
              <Text style={styles.marksText}>+1 Mark</Text>
            </View>
          </View>

          <Text style={styles.questionText}>
            {currentQ?.question || currentQ?.q || 'Question content loading...'}
          </Text>

          <View style={styles.optionsContainer}>
            {(currentQ?.options || []).map((opt: string, index: number) => {
              const isSelected = answers[currentIdx] === opt;
              const optionLetter = String.fromCharCode(65 + index);

              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.optionBtn, isSelected && styles.optionBtnSelected]}
                  activeOpacity={0.8}
                  onPress={() => handleOptionSelect(opt)}
                >
                  <View style={[styles.letterCircle, isSelected && styles.letterCircleSelected]}>
                    <Text style={[styles.letterText, isSelected && styles.letterTextSelected]}>
                      {optionLetter}
                    </Text>
                  </View>
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* FOOTER ACTIONS */}
      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <TouchableOpacity
            style={styles.reviewBtn}
            onPress={() => goToNext('REVIEW')}
          >
            <Text style={styles.reviewBtnText}>Mark Review</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.clearBtn} onPress={clearResponse}>
            <Text style={styles.clearBtnText}>Clear</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveBtn} onPress={() => goToNext('SAVE')}>
            <Text style={styles.saveBtnText}>Save & Next</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={() => handleSubmit()}>
          <Text style={styles.submitBtnText}>Submit Examination</Text>
        </TouchableOpacity>
      </View>

      {/* QUESTION PALETTE MODAL */}
      <Modal visible={isPaletteVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.paletteContainer}>
            <View style={styles.paletteHeader}>
              <Text style={styles.paletteTitle}>Question Palette</Text>
              <TouchableOpacity onPress={() => setIsPaletteVisible(false)}>
                <X size={22} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View style={[styles.legendBox, { backgroundColor: STATUS_COLORS.ANSWERED }]} />
                <Text style={styles.legendText}>Answered</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendBox, { backgroundColor: STATUS_COLORS.NOT_ANSWERED }]} />
                <Text style={styles.legendText}>Not Answered</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendBox, { backgroundColor: STATUS_COLORS.NOT_VISITED }]} />
                <Text style={styles.legendText}>Not Visited</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendBox, { backgroundColor: STATUS_COLORS.REVIEW }]} />
                <Text style={styles.legendText}>Review</Text>
              </View>
            </View>

            <ScrollView>
              <View style={styles.gridContainer}>
                {questions.map((_, idx) => {
                  const status = qStatus[idx] || 'NOT_VISITED';
                  const bgColor = STATUS_COLORS[status as keyof typeof STATUS_COLORS];
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.gridBtn, { backgroundColor: bgColor }]}
                      onPress={() => jumpToQuestion(idx)}
                    >
                      <Text style={styles.gridBtnText}>{idx + 1}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1e',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0f1e',
  },
  header: {
    backgroundColor: '#111827',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backBtn: {
    padding: 4,
    marginRight: 8,
  },
  headerLeft: {
    flex: 1,
  },
  examTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b98120',
    borderColor: '#10b98150',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginRight: 10,
  },
  timerText: {
    color: '#10b981',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 5,
  },
  menuBtn: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  questionCard: {
    backgroundColor: '#111827',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 18,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    paddingBottom: 10,
    marginBottom: 14,
  },
  questionNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#10b981',
    letterSpacing: 0.5,
  },
  marksBadge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  marksText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  questionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 20,
  },
  optionsContainer: {
    gap: 10,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  optionBtnSelected: {
    borderColor: '#10b981',
    backgroundColor: '#10b98115',
  },
  letterCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  letterCircleSelected: {
    backgroundColor: '#10b981',
  },
  letterText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: 'bold',
  },
  letterTextSelected: {
    color: '#0a0f1e',
  },
  optionText: {
    fontSize: 14,
    color: '#cbd5e1',
    flex: 1,
    lineHeight: 20,
  },
  optionTextSelected: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  footer: {
    backgroundColor: '#111827',
    padding: 14,
    borderTopWidth: 1,
    borderColor: '#1e293b',
  },
  footerRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  reviewBtn: {
    flex: 1,
    backgroundColor: '#a855f720',
    borderColor: '#a855f750',
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  reviewBtnText: {
    color: '#c084fc',
    fontWeight: 'bold',
    fontSize: 12,
  },
  clearBtn: {
    flex: 1,
    backgroundColor: '#1e293b',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  clearBtnText: {
    color: '#94a3b8',
    fontWeight: '600',
    fontSize: 12,
  },
  saveBtn: {
    flex: 1.2,
    backgroundColor: '#10b981',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#0a0f1e',
    fontWeight: 'bold',
    fontSize: 12,
  },
  submitBtn: {
    backgroundColor: '#f59e0b',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#0a0f1e',
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  paletteContainer: {
    backgroundColor: '#111827',
    maxHeight: '75%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  paletteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  paletteTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 8,
  },
  legendBox: {
    width: 14,
    height: 14,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    color: '#94a3b8',
    fontSize: 11,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridBtn: {
    width: (width - 64) / 5,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  gridBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
