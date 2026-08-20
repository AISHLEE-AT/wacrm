import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bot, FileText, CheckSquare, Sparkles } from 'lucide-react-native';

interface TeachOQuickHubProps {
  onOpenAiTutor: () => void;
  onOpenTestO: () => void;
  onOpenNotes: () => void;
}

export const TeachOQuickHub: React.FC<TeachOQuickHubProps> = ({
  onOpenAiTutor,
  onOpenTestO,
  onOpenNotes,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Learning Tools & Exam Hub</Text>

      <View style={styles.gridRow}>
        {/* Card 1: AI Doubt Solver */}
        <TouchableOpacity
          style={[styles.hubCard, styles.aiCard]}
          onPress={onOpenAiTutor}
          activeOpacity={0.8}
        >
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(168, 85, 247, 0.2)' }]}>
            <Bot size={20} color="#c084fc" />
          </View>
          <Text style={styles.cardTitle}>AI Homework Tutor</Text>
          <Text style={styles.cardSub}>Ask doubts in Tamil & English</Text>
        </TouchableOpacity>

        {/* Card 2: TestO Mock Tests */}
        <TouchableOpacity
          style={[styles.hubCard, styles.testoCard]}
          onPress={onOpenTestO}
          activeOpacity={0.8}
        >
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
            <CheckSquare size={20} color="#fbbf24" />
          </View>
          <Text style={styles.cardTitle}>TestO Live Tests</Text>
          <Text style={styles.cardSub}>Chapter tests & instant score</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 12,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  hubCard: {
    flex: 1,
    backgroundColor: '#131e32',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  aiCard: {
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  testoCard: {
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 3,
  },
  cardSub: {
    fontSize: 10,
    color: '#94a3b8',
    lineHeight: 14,
  },
});
