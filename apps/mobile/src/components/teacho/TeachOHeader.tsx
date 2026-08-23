import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown, Flame, Sparkles, BookOpen, ShieldCheck, ShoppingCart } from 'lucide-react-native';

interface TeachOHeaderProps {
  courseTitle: string;
  fullCourseName?: string;
  gradeBadge: string;
  gradeColor?: string;
  currentDay: number;
  totalDays: number;
  streak: number;
  xp: number;
  isPurchased?: boolean;
  price?: number;
  originalPrice?: number;
  onOpenCoursePicker: () => void;
  onOpenPurchase?: () => void;
  onOpenSyllabus?: () => void;
}

export const TeachOHeader: React.FC<TeachOHeaderProps> = ({
  courseTitle,
  fullCourseName,
  gradeBadge,
  gradeColor = '#06b6d4',
  currentDay,
  totalDays,
  streak,
  xp,
  isPurchased = false,
  price = 499,
  originalPrice = 2999,
  onOpenCoursePicker,
  onOpenPurchase,
  onOpenSyllabus,
}) => {
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0) + 8;

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

        {/* Gamified Streak & XP Pills + Syllabus Quick Link */}
        <View style={styles.statsRow}>
          {onOpenSyllabus && (
            <TouchableOpacity
              style={styles.syllabusQuickBtn}
              onPress={onOpenSyllabus}
              activeOpacity={0.8}
            >
              <BookOpen size={12} color="#06b6d4" />
              <Text style={styles.syllabusQuickText}>Syllabus</Text>
            </TouchableOpacity>
          )}

          <View style={styles.streakPill}>
            <Flame size={14} color="#f59e0b" fill="#f59e0b" />
            <Text style={styles.streakText}>{streak}d</Text>
          </View>

          <View style={styles.xpPill}>
            <Sparkles size={13} color="#a855f7" />
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

      {/* 💳 Top Course Purchase & Enrollment Information Bar */}
      <View style={styles.purchaseInfoBar}>
        <View style={styles.purchaseLeft}>
          <View style={styles.courseNameRow}>
            <Text style={styles.fullCourseName} numberOfLines={1}>
              {fullCourseName || courseTitle}
            </Text>
            {isPurchased ? (
              <View style={styles.purchasedBadge}>
                <ShieldCheck size={11} color="#10b981" />
                <Text style={styles.purchasedBadgeText}>ENROLLED</Text>
              </View>
            ) : (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>83% OFF</Text>
              </View>
            )}
          </View>

          <View style={styles.purchaseMetaRow}>
            {isPurchased ? (
              <Text style={styles.purchaseMetaText}>
                👑 Full {totalDays}-Day Access • All Lessons & AI Tutor Unlocked
              </Text>
            ) : (
              <View style={styles.pricingRow}>
                <Text style={styles.currentPrice}>₹{price}</Text>
                <Text style={styles.originalPrice}>₹{originalPrice}</Text>
                <Text style={styles.pricingSubText}>• Full {totalDays} Days Master Plan</Text>
              </View>
            )}
          </View>
        </View>

        {isPurchased ? (
          onOpenSyllabus && (
            <TouchableOpacity
              style={styles.syllabusBtn}
              onPress={onOpenSyllabus}
              activeOpacity={0.85}
            >
              <BookOpen size={13} color="#06b6d4" />
              <Text style={styles.syllabusBtnText}>View Syllabus</Text>
            </TouchableOpacity>
          )
        ) : (
          onOpenPurchase && (
            <TouchableOpacity
              style={styles.buyNowBtn}
              onPress={onOpenPurchase}
              activeOpacity={0.85}
            >
              <ShoppingCart size={13} color="#0B1120" />
              <Text style={styles.buyNowText}>Unlock (₹{price})</Text>
            </TouchableOpacity>
          )
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#0B1120',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 3,
    borderWidth: 1,
    borderColor: '#334155',
  },
  streakText: {
    color: '#f59e0b',
    fontSize: 11,
    fontWeight: '700',
  },
  xpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 3,
    borderWidth: 1,
    borderColor: '#334155',
  },
  xpText: {
    color: '#c084fc',
    fontSize: 11,
    fontWeight: '700',
  },
  courseSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#131e32',
    paddingHorizontal: 12,
    paddingVertical: 8,
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
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  gradeTagText: {
    fontSize: 10,
    fontWeight: '800',
  },
  courseTitleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#f1f5f9',
    flex: 1,
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#1e293b',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  switchText: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
  },
  purchaseInfoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    gap: 8,
  },
  purchaseLeft: {
    flex: 1,
  },
  courseNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  fullCourseName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
    flexShrink: 1,
  },
  purchasedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  purchasedBadgeText: {
    color: '#10b981',
    fontSize: 8,
    fontWeight: '900',
  },
  discountBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  discountText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '900',
  },
  purchaseMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  purchaseMetaText: {
    fontSize: 10,
    color: '#10b981',
    fontWeight: '600',
  },
  pricingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  currentPrice: {
    fontSize: 13,
    fontWeight: '900',
    color: '#fbbf24',
  },
  originalPrice: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
    textDecorationLine: 'line-through',
  },
  pricingSubText: {
    fontSize: 9,
    color: '#94a3b8',
    fontWeight: '500',
  },
  buyNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#fbbf24',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  buyNowText: {
    color: '#0B1120',
    fontSize: 11,
    fontWeight: '900',
  },
  syllabusQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  syllabusQuickText: {
    color: '#06b6d4',
    fontSize: 10,
    fontWeight: '800',
  },
  syllabusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.35)',
  },
  syllabusBtnText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '800',
  },
});
