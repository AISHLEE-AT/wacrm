import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown, Flame, Sparkles, BookOpen } from 'lucide-react-native';

interface TeachOHeaderProps {
  courseTitle: string;
  gradeBadge: string;
  gradeColor?: string;
  currentDay: number;
  totalDays: number;
  streak: number;
  xp: number;
  onOpenCoursePicker: () => void;
}

export const TeachOHeader: React.FC<TeachOHeaderProps> = ({
  courseTitle,
  gradeBadge,
  gradeColor = '#06b6d4',
  currentDay,
  totalDays,
  streak,
  xp,
  onOpenCoursePicker,
}) => {
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0) + 10;

  return (
    <View style={[styles.headerContainer, { paddingTop: topPadding }]}>
      {/* Top Branding Row */}
      <View style={styles.topRow}>
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <BookOpen size={20} color="#06b6d4" />
          </View>
          <View>
            <Text style={styles.brandTitle}>Teach<Text style={{ color: '#06b6d4' }}>O</Text></Text>
            <Text style={styles.brandSubtitle}>Daily AI Tuition & Career Engine</Text>
          </View>
        </View>

        {/* Gamified Streak & XP Pills */}
        <View style={styles.statsRow}>
          <View style={styles.streakPill}>
            <Flame size={15} color="#f59e0b" fill="#f59e0b" />
            <Text style={styles.streakText}>{streak}d</Text>
          </View>

          <View style={styles.xpPill}>
            <Sparkles size={14} color="#a855f7" />
            <Text style={styles.xpText}>{xp} XP</Text>
          </View>
        </View>
      </View>

      {/* Course Switcher Card */}
      <TouchableOpacity
        style={styles.courseSwitcher}
        onPress={onOpenCoursePicker}
        activeOpacity={0.7}
      >
        <View style={styles.courseLeft}>
          <View style={[styles.gradeTag, { backgroundColor: `${gradeColor}25` }]}>
            <Text style={[styles.gradeTagText, { color: gradeColor }]}>{gradeBadge}</Text>
          </View>
          <Text style={styles.courseTitleText} numberOfLines={1}>
            {courseTitle}
          </Text>
        </View>
        <View style={styles.switchButton}>
          <Text style={styles.switchText}>Change</Text>
          <ChevronDown size={14} color="#94a3b8" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#0B1120',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  streakText: {
    color: '#f59e0b',
    fontSize: 12,
    fontWeight: '700',
  },
  xpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  xpText: {
    color: '#c084fc',
    fontSize: 12,
    fontWeight: '700',
  },
  courseSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#131e32',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  courseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  gradeTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  gradeTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  courseTitleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#f1f5f9',
    flex: 1,
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  switchText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
});
