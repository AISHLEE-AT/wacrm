import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Play, CheckCircle2, Award, HeartHandshake, ArrowRight } from 'lucide-react-native';

interface TeachOTodayHeroProps {
  currentDay: number;
  totalDays: number;
  themeTitle: string;
  completedTasksCount: number;
  totalTasksCount: number;
  currentTaskTitle?: string;
  currentTaskDuration?: string;
  onPressPrimaryAction: () => void;
  parentTip?: string;
}

export const TeachOTodayHero: React.FC<TeachOTodayHeroProps> = ({
  currentDay,
  totalDays,
  themeTitle,
  completedTasksCount,
  totalTasksCount,
  currentTaskTitle,
  currentTaskDuration = '15 Min',
  onPressPrimaryAction,
  parentTip,
}) => {
  const isAllDone = totalTasksCount > 0 && completedTasksCount >= totalTasksCount;
  const progressPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  return (
    <View style={styles.heroCard}>
      {/* Background Subtle Accent */}
      <View style={styles.topBadgeRow}>
        <View style={styles.dayPill}>
          <Text style={styles.dayPillText}>DAY {currentDay} OF {totalDays}</Text>
        </View>
        <View style={styles.progressPercentPill}>
          <Text style={styles.progressPercentText}>{progressPercent}% Done</Text>
        </View>
      </View>

      {/* Main Focus Theme */}
      <Text style={styles.themeTitle} numberOfLines={2}>
        {themeTitle || "Today's Structured Tuition Routine"}
      </Text>

      {/* Modern Slim Progress Track */}
      <View style={styles.progressTrackWrapper}>
        <View style={styles.progressTrackBg}>
          <View style={[styles.progressTrackFill, { width: `${Math.max(progressPercent, 4)}%` }]} />
        </View>
        <Text style={styles.stepProgressText}>
          {completedTasksCount} of {totalTasksCount} lessons completed
        </Text>
      </View>

      {/* Primary Action Button */}
      <TouchableOpacity
        style={[styles.primaryActionBtn, isAllDone && styles.primaryActionBtnDone]}
        onPress={onPressPrimaryAction}
        activeOpacity={0.85}
      >
        <View style={styles.btnIconCircle}>
          {isAllDone ? (
            <CheckCircle2 size={20} color="#10b981" />
          ) : (
            <Play size={18} color="#0B1120" fill="#0B1120" />
          )}
        </View>

        <View style={styles.btnTextContainer}>
          <Text style={styles.btnMainText} numberOfLines={1}>
            {isAllDone
              ? 'Review Day ' + currentDay + ' Lessons'
              : currentTaskTitle
              ? 'Continue: ' + currentTaskTitle
              : "Start Today's Routine"}
          </Text>
          {!isAllDone && (
            <Text style={styles.btnSubText}>
              ⏱ {currentTaskDuration} • Next Micro-Lesson
            </Text>
          )}
        </View>

        <ArrowRight size={18} color="#0B1120" />
      </TouchableOpacity>

      {/* Optional Parent Encouragement Note */}
      {parentTip && (
        <View style={styles.parentTipContainer}>
          <HeartHandshake size={14} color="#38bdf8" />
          <Text style={styles.parentTipText} numberOfLines={1}>
            {parentTip}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: '#131e32',
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  topBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dayPill: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  dayPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#38bdf8',
    letterSpacing: 0.5,
  },
  progressPercentPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  progressPercentText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34d399',
  },
  themeTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: 24,
    marginBottom: 12,
  },
  progressTrackWrapper: {
    marginBottom: 14,
  },
  progressTrackBg: {
    height: 6,
    backgroundColor: '#1e293b',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressTrackFill: {
    height: '100%',
    backgroundColor: '#06b6d4',
    borderRadius: 3,
  },
  stepProgressText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
  primaryActionBtn: {
    backgroundColor: '#06b6d4',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    gap: 10,
  },
  primaryActionBtnDone: {
    backgroundColor: '#10b981',
  },
  btnIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnTextContainer: {
    flex: 1,
  },
  btnMainText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0B1120',
  },
  btnSubText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(11, 17, 32, 0.75)',
  },
  parentTipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  parentTipText: {
    fontSize: 11,
    color: '#94a3b8',
    flex: 1,
    fontStyle: 'italic',
  },
});
