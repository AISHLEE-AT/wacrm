import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import {
  BookOpen,
  Sparkles,
  Layers,
  ChevronRight,
  ChevronLeft,
  Languages,
  Award,
  Zap,
  CheckCircle2,
} from 'lucide-react-native';
import { TopicContent } from '../../lib/useTopicMastery';

const { width } = Dimensions.get('window');

interface TeachOConceptDeckProps {
  topic: TopicContent;
  onProceedToQuiz: () => void;
}

export const TeachOConceptDeck: React.FC<TeachOConceptDeckProps> = ({
  topic,
  onProceedToQuiz,
}) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [lang, setLang] = useState<'en' | 'ta'>('en');

  const cards = [
    {
      type: 'axiom',
      tag: 'Step 1 of 3 • Core Definition & Axiom',
      title: topic.topicTitle,
      body: topic.notes?.overview || 'Fundamental principles and foundational definitions for this topic.',
      formula: topic.notes?.formulasAndShortcuts?.[0]?.formula || null,
      tip: topic.notes?.formulasAndShortcuts?.[0]?.tip || null,
    },
    {
      type: 'analogy',
      tag: 'Step 2 of 3 • Real-World Application',
      title: lang === 'ta' ? 'நடைமுறை விளக்கம் & உதாரணம்' : 'Practical Context & Bilingual Breakdown',
      body:
        lang === 'ta'
          ? topic.notes?.bilingualExplanation?.tamil || 'இப்பாடத்தின் முக்கிய கருத்துக்கள் அன்றாட வாழ்க்கையோடு தொடர்புடையவை.'
          : topic.notes?.bilingualExplanation?.english || 'Conceptual breakdown demonstrating how this principle applies to real systems.',
      highlight: topic.notes?.keyPoints?.[0] || 'Understand the core underlying relationship.',
    },
    {
      type: 'exam',
      tag: 'Step 3 of 3 • Exam Essentials & High-Yield Points',
      title: 'Top Key Points & Pitfalls',
      points: topic.notes?.keyPoints || [
        'Pay close attention to standard formulas.',
        'Review edge cases and sign conventions.',
        'Double-check units in final step.',
      ],
    },
  ];

  const current = cards[currentCardIndex];

  return (
    <View style={styles.container}>
      {/* Top Card Progress Indicator */}
      <View style={styles.progressBarRow}>
        {cards.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.progressBarSegment,
              idx <= currentCardIndex && styles.progressBarActive,
              idx === currentCardIndex && styles.progressBarCurrent,
            ]}
          />
        ))}
      </View>

      {/* Card Body */}
      <View style={styles.cardWrapper}>
        <ScrollView
          style={styles.cardScroll}
          contentContainerStyle={styles.cardContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Card Tag & Language Switcher */}
          <View style={styles.cardHeaderRow}>
            <View style={styles.tagBadge}>
              <Sparkles size={12} color="#10b981" />
              <Text style={styles.tagText}>{current.tag}</Text>
            </View>

            {current.type === 'analogy' && (
              <TouchableOpacity
                style={styles.langButton}
                onPress={() => setLang(lang === 'en' ? 'ta' : 'en')}
              >
                <Languages size={14} color="#38bdf8" />
                <Text style={styles.langButtonText}>
                  {lang === 'en' ? 'தமிழ்' : 'English'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Title */}
          <Text style={styles.cardTitle}>{current.title}</Text>

          {/* Body Content */}
          {current.body && <Text style={styles.cardBody}>{current.body}</Text>}

          {/* Formula Callout */}
          {current.formula && (
            <View style={styles.formulaBox}>
              <Text style={styles.formulaLabel}>GOVERNING LAW / EQUATION</Text>
              <Text style={styles.formulaText}>{current.formula}</Text>
              {current.tip && <Text style={styles.formulaTip}>💡 {current.tip}</Text>}
            </View>
          )}

          {/* Highlight Callout */}
          {current.highlight && (
            <View style={styles.highlightBox}>
              <Zap size={16} color="#fbbf24" style={{ marginTop: 2 }} />
              <Text style={styles.highlightText}>{current.highlight}</Text>
            </View>
          )}

          {/* Bullet Points */}
          {current.points && (
            <View style={styles.pointsList}>
              {current.points.map((pt, pIdx) => (
                <View key={pIdx} style={styles.pointRow}>
                  <CheckCircle2 size={16} color="#10b981" style={{ marginTop: 2 }} />
                  <Text style={styles.pointText}>{pt}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomNavRow}>
        {currentCardIndex > 0 ? (
          <TouchableOpacity
            style={styles.prevButton}
            onPress={() => setCurrentCardIndex(prev => prev - 1)}
          >
            <ChevronLeft size={18} color="#94a3b8" />
            <Text style={styles.prevButtonText}>Previous</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 80 }} />
        )}

        {currentCardIndex < cards.length - 1 ? (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => setCurrentCardIndex(prev => prev + 1)}
          >
            <Text style={styles.nextButtonText}>Next Concept</Text>
            <ChevronRight size={18} color="#0f172a" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.quizStartButton}
            onPress={onProceedToQuiz}
          >
            <Zap size={18} color="#0f172a" />
            <Text style={styles.quizStartButtonText}>Start Practice Drill</Text>
            <ChevronRight size={18} color="#0f172a" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  progressBarRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  progressBarSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1e293b',
  },
  progressBarActive: {
    backgroundColor: '#059669',
  },
  progressBarCurrent: {
    backgroundColor: '#10b981',
  },
  cardWrapper: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1e293b',
    overflow: 'hidden',
  },
  cardScroll: {
    flex: 1,
  },
  cardContent: {
    padding: 20,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  tagText: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  langButtonText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 14,
    lineHeight: 28,
  },
  cardBody: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 22,
    marginBottom: 16,
  },
  formulaBox: {
    backgroundColor: '#020617',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginVertical: 12,
  },
  formulaLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38bdf8',
    letterSpacing: 1,
    marginBottom: 6,
  },
  formulaText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f1f5f9',
    fontFamily: 'monospace',
    lineHeight: 22,
  },
  formulaTip: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 8,
    fontStyle: 'italic',
  },
  highlightBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(251, 191, 36, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: '#fbbf24',
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
  },
  highlightText: {
    flex: 1,
    fontSize: 13,
    color: '#fef3c7',
    lineHeight: 18,
    fontWeight: '600',
  },
  pointsList: {
    gap: 12,
    marginTop: 6,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#1e293b',
    padding: 12,
    borderRadius: 12,
  },
  pointText: {
    flex: 1,
    fontSize: 13,
    color: '#e2e8f0',
    lineHeight: 19,
  },
  bottomNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
  },
  prevButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  prevButtonText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  nextButtonText: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '800',
  },
  quizStartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f59e0b',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 14,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  quizStartButtonText: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '800',
  },
});
