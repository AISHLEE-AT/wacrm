import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  Zap,
  Award,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  ChevronRight,
  HelpCircle,
} from 'lucide-react-native';
import { TopicContent } from '../../lib/useTopicMastery';

interface TeachOMicroDrillProps {
  topic: TopicContent;
  onComplete: (earnedXp: number) => void;
  onReviewNotes: () => void;
}

export const TeachOMicroDrill: React.FC<TeachOMicroDrillProps> = ({
  topic,
  onComplete,
  onReviewNotes,
}) => {
  const mcqs = topic.mcqs && topic.mcqs.length > 0
    ? topic.mcqs.slice(0, 5)
    : [
        {
          question: `What is the key takeaway of ${topic.topicTitle}?`,
          options: [
            'Core fundamental principle and formula',
            'Arbitrary untested concept',
            'Irrelevant definition',
            'None of the above',
          ],
          correctIndex: 0,
          explanation: `The fundamental law establishes the primary governing relation for ${topic.topicTitle}.`,
        },
      ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQ = mcqs[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswerChecked) return;
    setSelectedOption(idx);
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null || isAnswerChecked) return;

    setIsAnswerChecked(true);
    const isCorrect = selectedOption === currentQ.correctIndex;

    if (isCorrect) {
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (currentIndex < mcqs.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerChecked(false);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    const totalXp = score * 15 + 20;
    const accuracy = Math.round((score / mcqs.length) * 100);

    return (
      <View style={styles.container}>
        <View style={styles.victoryCard}>
          <View style={styles.trophyCircle}>
            <Award size={48} color="#f59e0b" />
          </View>

          <Text style={styles.victoryTitle}>Mastery Achieved! 🎉</Text>
          <Text style={styles.victorySubtitle}>{topic.topicTitle}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{accuracy}%</Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={[styles.statVal, { color: '#f59e0b' }]}>+{totalXp}</Text>
              <Text style={styles.statLabel}>XP Earned</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={[styles.statVal, { color: '#10b981' }]}>
                {score}/{mcqs.length}
              </Text>
              <Text style={styles.statLabel}>Score</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => onComplete(totalXp)}
          >
            <CheckCircle2 size={20} color="#0f172a" />
            <Text style={styles.completeButtonText}>Claim Mastery & Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const isCorrect = selectedOption === currentQ.correctIndex;

  return (
    <View style={styles.container}>
      {/* Top Status Bar: Streak & Progress */}
      <View style={styles.topStatusRow}>
        <View style={styles.streakBadge}>
          <Zap size={14} color="#f59e0b" />
          <Text style={styles.streakText}>{streak} Streak 🔥</Text>
        </View>

        <Text style={styles.counterText}>
          Question {currentIndex + 1} of {mcqs.length}
        </Text>

        <TouchableOpacity onPress={onReviewNotes} style={styles.reviewButton}>
          <Text style={styles.reviewButtonText}>Review Notes</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${((currentIndex + 1) / mcqs.length) * 100}%` },
          ]}
        />
      </View>

      {/* Question Card */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.questionText}>{currentQ.question}</Text>

        {/* Options */}
        <View style={styles.optionsList}>
          {currentQ.options.map((opt, oIdx) => {
            const isSelected = selectedOption === oIdx;
            const isCorrectOption = oIdx === currentQ.correctIndex;

            let optionStyle = styles.optionNormal;
            let iconComponent = null;

            if (isAnswerChecked) {
              if (isCorrectOption) {
                optionStyle = styles.optionCorrect;
                iconComponent = <CheckCircle2 size={18} color="#10b981" />;
              } else if (isSelected) {
                optionStyle = styles.optionWrong;
                iconComponent = <XCircle size={18} color="#ef4444" />;
              }
            } else if (isSelected) {
              optionStyle = styles.optionSelected;
            }

            return (
              <TouchableOpacity
                key={oIdx}
                style={[styles.optionBase, optionStyle]}
                onPress={() => handleSelectOption(oIdx)}
                disabled={isAnswerChecked}
              >
                <View style={styles.optionLetterBadge}>
                  <Text style={styles.optionLetterText}>
                    {String.fromCharCode(65 + oIdx)}
                  </Text>
                </View>
                <Text style={styles.optionText}>{opt}</Text>
                {iconComponent}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Explanation Drawer */}
        {isAnswerChecked && (
          <View
            style={[
              styles.explanationBox,
              isCorrect ? styles.explanationCorrect : styles.explanationWrong,
            ]}
          >
            <View style={styles.explanationHeader}>
              <Sparkles size={16} color={isCorrect ? '#10b981' : '#f59e0b'} />
              <Text
                style={[
                  styles.explanationTitle,
                  { color: isCorrect ? '#10b981' : '#f59e0b' },
                ]}
              >
                {isCorrect ? 'Excellent! Correct Answer (+15 XP)' : 'Not quite right!'}
              </Text>
            </View>
            <Text style={styles.explanationBody}>{currentQ.explanation}</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        {!isAnswerChecked ? (
          <TouchableOpacity
            style={[
              styles.checkButton,
              selectedOption === null && styles.buttonDisabled,
            ]}
            onPress={handleCheckAnswer}
            disabled={selectedOption === null}
          >
            <Text style={styles.checkButtonText}>Check Answer</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.checkButton,
              isCorrect ? { backgroundColor: '#10b981' } : { backgroundColor: '#38bdf8' },
            ]}
            onPress={handleNext}
          >
            <Text style={styles.checkButtonText}>
              {currentIndex < mcqs.length - 1 ? 'Continue' : 'Finish Mastery'}
            </Text>
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
  topStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakText: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '800',
  },
  counterText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  reviewButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  reviewButtonText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '600',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#1e293b',
    borderRadius: 3,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 3,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
    lineHeight: 26,
    marginBottom: 20,
  },
  optionsList: {
    gap: 12,
  },
  optionBase: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  optionNormal: {
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
  },
  optionSelected: {
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderColor: '#38bdf8',
  },
  optionCorrect: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: '#10b981',
  },
  optionWrong: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: '#ef4444',
  },
  optionLetterBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionLetterText: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '700',
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: '#e2e8f0',
    lineHeight: 20,
  },
  explanationBox: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 16,
  },
  explanationCorrect: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  explanationWrong: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  explanationTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  explanationBody: {
    fontSize: 13,
    color: '#cbd5e1',
    lineHeight: 19,
  },
  bottomBar: {
    paddingTop: 12,
  },
  checkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 16,
  },
  checkButtonText: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '800',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  victoryCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  trophyCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 2,
    borderColor: '#f59e0b',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  victoryTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#f8fafc',
    marginBottom: 6,
  },
  victorySubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 28,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 36,
  },
  statBox: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 90,
  },
  statVal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#10b981',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 18,
    width: '100%',
    justifyContent: 'center',
  },
  completeButtonText: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '800',
  },
});

export default TeachOMicroDrill;
