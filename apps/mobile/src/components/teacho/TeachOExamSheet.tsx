import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import {
  X,
  FileText,
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { TopicContent } from '../../lib/useTopicMastery';

interface TeachOExamSheetProps {
  visible: boolean;
  onClose: () => void;
  topic: TopicContent;
}

export const TeachOExamSheet: React.FC<TeachOExamSheetProps> = ({
  visible,
  onClose,
  topic,
}) => {
  const [activeTab, setActiveTab] = useState<'2m' | '5m' | 'essay'>('2m');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const twoMarks = topic.twoMarkQuestions || [
    {
      question: `Define ${topic.topicTitle} and state its significance.`,
      marks: 2,
      modelAnswer: `Fundamental principle governing standard syllabus applications with exact formal definition.`,
    },
  ];

  const fiveMarks = topic.fiveMarkQuestions || [
    {
      question: `Explain the detailed derivation and real-world mechanism of ${topic.topicTitle}.`,
      marks: 5,
      stepByStepSolution: [
        'Step 1: State governing axiomatic principles and boundary conditions.',
        'Step 2: Formulate mathematical equations and relations.',
        'Step 3: Conclude with practical engineering / examination applications.',
      ],
    },
  ];

  const essays = topic.essayQuestions || [
    {
      question: `Comprehensive Essay & Case Analysis on ${topic.topicTitle}.`,
      marks: 10,
      structuredOutline: ['1. Introduction', '2. Governing Principles', '3. Case Applications', '4. Conclusion'],
      modelEssay: `Structured academic overview presenting detailed insights and key takeaways for ${topic.topicTitle}.`,
    },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={styles.headerTitleRow}>
              <Award size={20} color="#f59e0b" />
              <Text style={styles.sheetTitle}>Exam Model Solutions</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Subtitle */}
          <Text style={styles.sheetSubtitle}>{topic.topicTitle}</Text>

          {/* Tab Selector */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === '2m' && styles.tabBtnActive]}
              onPress={() => {
                setActiveTab('2m');
                setExpandedIndex(0);
              }}
            >
              <Text style={[styles.tabBtnText, activeTab === '2m' && styles.tabBtnTextActive]}>
                2-Mark Short ({twoMarks.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === '5m' && styles.tabBtnActive]}
              onPress={() => {
                setActiveTab('5m');
                setExpandedIndex(0);
              }}
            >
              <Text style={[styles.tabBtnText, activeTab === '5m' && styles.tabBtnTextActive]}>
                5-Mark Derivations ({fiveMarks.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'essay' && styles.tabBtnActive]}
              onPress={() => {
                setActiveTab('essay');
                setExpandedIndex(0);
              }}
            >
              <Text style={[styles.tabBtnText, activeTab === 'essay' && styles.tabBtnTextActive]}>
                Essay ({essays.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content List */}
          <ScrollView style={styles.sheetScroll} showsVerticalScrollIndicator={false}>
            {activeTab === '2m' &&
              twoMarks.map((item, idx) => (
                <View key={idx} style={styles.qaCard}>
                  <Text style={styles.qText}>Q{idx + 1}: {item.question}</Text>
                  <View style={styles.ansBox}>
                    <Text style={styles.ansLabel}>MODEL ANSWER (2 MARKS):</Text>
                    <Text style={styles.ansText}>{item.modelAnswer}</Text>
                  </View>
                </View>
              ))}

            {activeTab === '5m' &&
              fiveMarks.map((item, idx) => (
                <View key={idx} style={styles.qaCard}>
                  <Text style={styles.qText}>Q{idx + 1}: {item.question}</Text>
                  <View style={styles.ansBox}>
                    <Text style={styles.ansLabel}>STEP-BY-STEP SOLUTION (5 MARKS):</Text>
                    {item.stepByStepSolution.map((step, sIdx) => (
                      <View key={sIdx} style={styles.stepRow}>
                        <CheckCircle2 size={14} color="#38bdf8" style={{ marginTop: 3 }} />
                        <Text style={styles.stepText}>{step}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}

            {activeTab === 'essay' &&
              essays.map((item, idx) => (
                <View key={idx} style={styles.qaCard}>
                  <Text style={styles.qText}>Q{idx + 1}: {item.question}</Text>
                  <View style={styles.ansBox}>
                    <Text style={styles.ansLabel}>STRUCTURED OUTLINE:</Text>
                    <Text style={styles.outlineText}>{item.structuredOutline.join('  •  ')}</Text>

                    <Text style={[styles.ansLabel, { marginTop: 14 }]}>MODEL ESSAY (10 MARKS):</Text>
                    <Text style={styles.ansText}>{item.modelEssay}</Text>
                  </View>
                </View>
              ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f8fafc',
  },
  closeBtn: {
    padding: 4,
  },
  sheetSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
    marginBottom: 16,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#020617',
    padding: 4,
    borderRadius: 14,
    marginBottom: 16,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: '#1e293b',
  },
  tabBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  tabBtnTextActive: {
    color: '#38bdf8',
  },
  sheetScroll: {
    marginBottom: 10,
  },
  qaCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  qText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 12,
    lineHeight: 20,
  },
  ansBox: {
    backgroundColor: '#0f172a',
    padding: 14,
    borderRadius: 12,
  },
  ansLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38bdf8',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  ansText: {
    fontSize: 13,
    color: '#cbd5e1',
    lineHeight: 20,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    color: '#e2e8f0',
    lineHeight: 19,
  },
  outlineText: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '600',
    marginBottom: 6,
  },
});

export default TeachOExamSheet;

