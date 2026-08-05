import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, 
  ScrollView, SafeAreaView, Alert, Dimensions, Modal 
} from 'react-native';
import { aishleeSupabase } from '../services/aishleeSupabase';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Clock, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react-native';

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

  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
      const { data, error } = await aishleeSupabase
        .from('unified_master_data')
        .select('*')
        .eq('id', testId)
        .single();
      
      if (error) throw error;
      
      let info = data.additional_info || data.metadata || {};
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

      if (qs.length > 0) {
        setQuestions(qs);
        // Initialize statuses
        const initialStatus: Record<number, string> = {};
        qs.forEach((_, i) => {
          initialStatus[i] = i === 0 ? 'NOT_ANSWERED' : 'NOT_VISITED';
        });
        setQStatus(initialStatus);
      } else {
        Alert.alert("Error", "No questions found for this exam.");
        navigation.goBack();
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to load exam data.");
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
    // Simple score calculation
    let score = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer || answers[idx] === q.answer) {
        score += 1;
      }
    });

    Alert.alert("Exam Submitted", `Your Score: ${score} / ${questions.length}`, [
      { text: "View Dashboard", onPress: () => navigation.goBack() }
    ]);
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
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.examTitle} numberOfLines={1}>{title}</Text>
          <Text style={styles.sectionTitle}>Section: General</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.timerContainer}>
            <Clock size={16} color="#fff" />
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          </View>
          <TouchableOpacity onPress={() => setIsPaletteVisible(true)} style={styles.menuBtn}>
            <Menu size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* QUESTION CONTENT */}
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={styles.questionHeader}>
          <Text style={styles.questionNumber}>Question {currentIdx + 1} of {questions.length}</Text>
        </View>
        
        <Text style={styles.questionText}>
          {currentQ?.question || currentQ?.q || 'Missing question text'}
        </Text>

        <View style={styles.optionsContainer}>
          {(currentQ?.options || []).map((opt: string, index: number) => {
            const isSelected = answers[currentIdx] === opt;
            return (
              <TouchableOpacity
                key={index}
                style={[styles.optionBtn, isSelected && styles.optionBtnSelected]}
                onPress={() => handleOptionSelect(opt)}
              >
                <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.optionText}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* FOOTER ACTIONS */}
      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <TouchableOpacity style={styles.actionBtnOutline} onPress={() => goToNext('REVIEW')}>
            <Text style={styles.actionBtnOutlineText}>Mark for Review</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtnOutline} onPress={clearResponse}>
            <Text style={styles.actionBtnOutlineText}>Clear</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.footerRow}>
          <TouchableOpacity style={styles.saveBtn} onPress={() => goToNext('SAVE')}>
            <Text style={styles.saveBtnText}>Save & Next</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitBtn} onPress={() => handleSubmit()}>
            <Text style={styles.submitBtnText}>Submit Test</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* QUESTION PALETTE MODAL */}
      <Modal visible={isPaletteVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.paletteContainer}>
            <View style={styles.paletteHeader}>
              <Text style={styles.paletteTitle}>Question Palette</Text>
              <TouchableOpacity onPress={() => setIsPaletteVisible(false)}>
                <X size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}><View style={[styles.legendBox, { backgroundColor: STATUS_COLORS.ANSWERED }]} /><Text style={styles.legendText}>Answered</Text></View>
              <View style={styles.legendItem}><View style={[styles.legendBox, { backgroundColor: STATUS_COLORS.NOT_ANSWERED }]} /><Text style={styles.legendText}>Not Answered</Text></View>
              <View style={styles.legendItem}><View style={[styles.legendBox, { backgroundColor: STATUS_COLORS.NOT_VISITED }]} /><Text style={styles.legendText}>Not Visited</Text></View>
              <View style={styles.legendItem}><View style={[styles.legendBox, { backgroundColor: STATUS_COLORS.REVIEW }]} /><Text style={styles.legendText}>Review</Text></View>
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
    backgroundColor: '#f3f4f6', // Light gray background common in exam UIs
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e1e24',
  },
  header: {
    backgroundColor: '#2563eb', // Blue theme for exam
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  examTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: '#bfdbfe',
    fontSize: 12,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 10,
  },
  timerText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  menuBtn: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  questionHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    paddingBottom: 8,
    marginBottom: 16,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  questionText: {
    fontSize: 18,
    lineHeight: 26,
    color: '#111827',
    marginBottom: 20,
  },
  optionsContainer: {
    marginTop: 10,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 1,
  },
  optionBtnSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#9ca3af',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioCircleSelected: {
    borderColor: '#2563eb',
  },
  radioInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#2563eb',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  footer: {
    backgroundColor: '#fff',
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  actionBtnOutline: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#6b7280',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  actionBtnOutlineText: {
    color: '#4b5563',
    fontWeight: '600',
    fontSize: 13,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  submitBtn: {
    flex: 1,
    backgroundColor: '#10b981',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  paletteContainer: {
    backgroundColor: '#1e1e24',
    height: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  paletteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  paletteTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 8,
  },
  legendBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    color: '#a1a1aa',
    fontSize: 12,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  gridBtn: {
    width: (width - 40) / 5 - 10,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    borderRadius: 8,
  },
  gridBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  }
});
