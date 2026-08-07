// @ts-nocheck
import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';

export default function TestOResultScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { score, totalQuestions, userAnswers, questions } = route.params;

  const accuracy = totalQuestions > 0 ? ((score / totalQuestions) * 100).toFixed(1) : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('TestOHubScreen')}>
          <ChevronLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Exam Results</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreText}>Score: {score} / {totalQuestions}</Text>
          <Text style={styles.accuracyText}>Accuracy: {accuracy}%</Text>
        </View>

        <Text style={styles.listTitle}>Detailed Review</Text>
        {questions.map((q: any, idx: number) => {
          const uAns = userAnswers[idx] || 'Not Answered';
          const cAns = q.correct_answer || q.correctAnswer || q.answer;
          const isCorrect = uAns === cAns;

          return (
            <View key={idx} style={styles.qCard}>
              <Text style={styles.qText}>Q{idx + 1}. {q.question || q.q}</Text>
              
              <View style={styles.ansRow}>
                <Text style={styles.ansLabel}>Your Answer: </Text>
                <Text style={[styles.ansValue, { color: isCorrect ? '#10b981' : '#ef4444' }]}>{uAns}</Text>
              </View>
              
              <View style={styles.ansRow}>
                <Text style={styles.ansLabel}>Correct Answer: </Text>
                <Text style={[styles.ansValue, { color: '#10b981' }]}>{cAns}</Text>
              </View>

              {q.explanation && (
                <View style={styles.explanationBox}>
                  <Text style={styles.expLabel}>Explanation: </Text>
                  <Text style={styles.expText}>{q.explanation}</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  backBtn: {
    marginRight: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  scoreCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 2,
  },
  scoreText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  accuracyText: {
    fontSize: 18,
    color: '#4b5563',
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  qCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 1,
  },
  qText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  ansRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  ansLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
  },
  ansValue: {
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
  },
  explanationBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
  },
  expLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  expText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
});
