import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  X,
  FileText,
  Sparkles,
  Zap,
  BookOpen,
  Award,
} from 'lucide-react-native';
import { useTopicMastery } from '../lib/useTopicMastery';
import { TeachOConceptDeck } from './teacho/TeachOConceptDeck';
import { TeachOMicroDrill } from './teacho/TeachOMicroDrill';
import { TeachOExamSheet } from './teacho/TeachOExamSheet';

interface TeachOCoursePlayerModalProps {
  visible: boolean;
  onClose: () => void;
  topicTitle: string;
  subject: string;
  courseTitle: string;
  dayNumber: number;
  courseId?: string;
  taskNumber?: number;
  onCompleteTask: (earnedXp: number) => void;
}

export const TeachOCoursePlayerModal: React.FC<TeachOCoursePlayerModalProps> = ({
  visible,
  onClose,
  topicTitle,
  subject,
  courseTitle,
  dayNumber,
  courseId,
  taskNumber,
  onCompleteTask,
}) => {
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState<'deck' | 'drill'>('deck');
  const [isExamSheetOpen, setIsExamSheetOpen] = useState(false);

  // Dynamic database query from Supabase with instant offline caching
  const { topicContent, loading } = useTopicMastery(
    undefined,
    topicTitle,
    subject
  );

  const handleCompleteMastery = (xp: number) => {
    onCompleteTask(xp);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
        <StatusBar barStyle="light-content" backgroundColor="#090d16" />

        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={22} color="#94a3b8" />
          </TouchableOpacity>

          <View style={styles.headerTitleCenter}>
            <Text style={styles.subjectBadge}>{subject || 'Core Subject'}</Text>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {topicTitle}
            </Text>
          </View>

          {/* Exam Model Solutions Drawer Button */}
          <TouchableOpacity
            style={styles.examAnswersBtn}
            onPress={() => setIsExamSheetOpen(true)}
          >
            <FileText size={18} color="#f59e0b" />
          </TouchableOpacity>
        </View>

        {/* Step Indicator */}
        <View style={styles.stepTabsRow}>
          <TouchableOpacity
            style={[
              styles.stepTab,
              currentStep === 'deck' && styles.stepTabActive,
            ]}
            onPress={() => setCurrentStep('deck')}
          >
            <BookOpen
              size={14}
              color={currentStep === 'deck' ? '#10b981' : '#64748b'}
            />
            <Text
              style={[
                styles.stepTabText,
                currentStep === 'deck' && styles.stepTabTextActive,
              ]}
            >
              1. Concept Deck
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.stepTab,
              currentStep === 'drill' && styles.stepTabActive,
            ]}
            onPress={() => setCurrentStep('drill')}
          >
            <Zap
              size={14}
              color={currentStep === 'drill' ? '#f59e0b' : '#64748b'}
            />
            <Text
              style={[
                styles.stepTabText,
                currentStep === 'drill' && styles.stepTabTextActive,
              ]}
            >
              2. Practice Drill
            </Text>
          </TouchableOpacity>
        </View>

        {/* Main Body */}
        {loading || !topicContent ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={styles.loaderText}>
              Loading 2026 Mastery Deck from Database...
            </Text>
          </View>
        ) : currentStep === 'deck' ? (
          <TeachOConceptDeck
            topic={topicContent}
            onProceedToQuiz={() => setCurrentStep('drill')}
          />
        ) : (
          <TeachOMicroDrill
            topic={topicContent}
            onComplete={handleCompleteMastery}
            onReviewNotes={() => setCurrentStep('deck')}
          />
        )}

        {/* Optional Slide-Up Exam Sheet */}
        {topicContent && (
          <TeachOExamSheet
            visible={isExamSheetOpen}
            onClose={() => setIsExamSheetOpen(false)}
            topic={topicContent}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#0f172a',
  },
  headerTitleCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  subjectBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38bdf8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#f8fafc',
    marginTop: 2,
  },
  examAnswersBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  stepTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
    backgroundColor: '#0f172a',
  },
  stepTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#020617',
  },
  stepTabActive: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  stepTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  stepTabTextActive: {
    color: '#f8fafc',
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loaderText: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 12,
  },
});
