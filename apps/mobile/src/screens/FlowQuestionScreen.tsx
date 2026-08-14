import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  Dimensions,
  Linking,
  Alert,
  SafeAreaView,
  Platform,
} from 'react-native';
import {
  ArrowLeft,
  RotateCcw,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  Clock,
  Bell,
  CheckCircle,
  ExternalLink,
  BookOpen,
  Layers,
  Award,
  Compass,
  FileCheck,
} from 'lucide-react-native';
import { useFlowViewModel } from '../hooks/useFlowViewModel';
import { colors, radius, spacing, fontSize } from '../lib/theme';
import { flowAnalytics } from '../services/FlowAnalyticsService';

const { width } = Dimensions.get('window');

interface FlowQuestionScreenProps {
  navigation?: any;
  route?: any;
}

export default function FlowQuestionScreen({ navigation, route }: FlowQuestionScreenProps) {
  const initialNodeId = route?.params?.initialNodeId || 'root';

  const {
    currentNode,
    historyStack,
    breadcrumbs,
    isLoading,
    error,
    isNotified,
    isNotifying,
    canGoBack,
    selectOption,
    goBack,
    resetToRoot,
    jumpToBreadcrumb,
    submitNotifyMe,
  } = useFlowViewModel({
    initialNodeId,
    onExitFlow: () => {
      if (navigation?.canGoBack()) {
        navigation.goBack();
      } else {
        navigation?.replace('Dashboard');
      }
    },
  });

  // Animated Transitions between questions
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(20);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentNode?.id, fadeAnim, slideAnim]);

  // Handle Purchase URL opening
  const handlePurchaseAction = async (url?: string) => {
    if (!url) {
      Alert.alert('Notice', 'Test enrollment link is being prepared.');
      return;
    }

    flowAnalytics.logPurchaseInitiated(currentNode?.id || '', url);

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        // In-app fallback
        navigation?.navigate('ModuleView', {
          path: '/testo',
          moduleName: currentNode?.title || 'Test Series',
          url: url,
        });
      }
    } catch (err) {
      // Fallback
      navigation?.navigate('ModuleView', {
        path: '/testo',
        moduleName: currentNode?.title || 'Test Series',
        url: url,
      });
    }
  };

  // ─── Top Header & Breadcrumb Bar ──────────────────────────────────────────
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.topBar}>
        <View style={styles.leftActions}>
          <TouchableOpacity
            onPress={goBack}
            style={styles.navIconButton}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft color={colors.text} size={20} />
          </TouchableOpacity>

          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerSubtitle}>GUIDED LEARNING PATH</Text>
            <Text style={styles.headerTitle}>Curated Assessment</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={resetToRoot}
          style={styles.resetButton}
          activeOpacity={0.7}
        >
          <RotateCcw color="#34d399" size={14} style={{ marginRight: 5 }} />
          <Text style={styles.resetButtonText}>Start Over</Text>
        </TouchableOpacity>
      </View>

      {/* Dynamic Breadcrumbs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.breadcrumbScroll}
      >
        {breadcrumbs.map((crumb, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          return (
            <View key={crumb.nodeId + idx} style={styles.breadcrumbItemWrap}>
              <TouchableOpacity
                onPress={() => jumpToBreadcrumb(idx)}
                disabled={isLast}
                style={[
                  styles.breadcrumbBadge,
                  isLast ? styles.breadcrumbActiveBadge : styles.breadcrumbInactiveBadge,
                ]}
              >
                <Text
                  style={[
                    styles.breadcrumbText,
                    isLast && styles.breadcrumbActiveText,
                  ]}
                  numberOfLines={1}
                >
                  {crumb.label}
                </Text>
              </TouchableOpacity>
              {!isLast && (
                <ChevronRight color="#475569" size={14} style={{ marginHorizontal: 3 }} />
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );

  // ─── Render BRANCH Node ───────────────────────────────────────────────────
  const renderBranchNode = () => {
    return (
      <View style={styles.nodeBody}>
        <View style={styles.questionCard}>
          <View style={styles.questionIconBadge}>
            <Compass color="#10b981" size={20} />
          </View>
          <Text style={styles.questionHeading}>{currentNode?.question}</Text>
          <Text style={styles.questionSubhint}>
            Choose an option below to narrow down your test syllabus.
          </Text>
        </View>

        <View style={styles.optionsList}>
          {currentNode?.options?.map((opt, idx) => (
            <TouchableOpacity
              key={opt.nextId + idx}
              style={styles.optionCard}
              activeOpacity={0.75}
              onPress={() => selectOption(opt.nextId, opt.label)}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionIndicator}>
                  <Text style={styles.optionIndexText}>{idx + 1}</Text>
                </View>
                <Text style={styles.optionLabel}>{opt.label}</Text>
              </View>
              <ChevronRight color="#10b981" size={20} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // ─── Render LEAF_PURCHASE Node ────────────────────────────────────────────
  const renderPurchaseNode = () => {
    return (
      <View style={styles.nodeBody}>
        <View style={styles.purchaseCard}>
          <View style={styles.purchaseHeader}>
            <View style={styles.featuredBadge}>
              <Sparkles color="#fbbf24" size={14} style={{ marginRight: 4 }} />
              <Text style={styles.featuredBadgeText}>TEST READY • HIGH YIELD</Text>
            </View>
            <Text style={styles.purchaseTitle}>{currentNode?.title}</Text>
          </View>

          <Text style={styles.purchaseDescription}>
            {currentNode?.description ||
              'Complete chapter-wise practice tests, exam simulations, detailed Tamil/English explanations, and real-time performance analytics.'}
          </Text>

          <View style={styles.perksContainer}>
            <View style={styles.perkRow}>
              <CheckCircle color="#10b981" size={16} style={{ marginRight: 8 }} />
              <Text style={styles.perkText}>Real Exam Timer & Automated Grading</Text>
            </View>
            <View style={styles.perkRow}>
              <CheckCircle color="#10b981" size={16} style={{ marginRight: 8 }} />
              <Text style={styles.perkText}>Instant Tamil & English Explanations</Text>
            </View>
            <View style={styles.perkRow}>
              <CheckCircle color="#10b981" size={16} style={{ marginRight: 8 }} />
              <Text style={styles.perkText}>Rank & Percentile Analytics</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.purchaseCtaButton}
            activeOpacity={0.85}
            onPress={() => handlePurchaseAction(currentNode?.purchaseUrl)}
          >
            <ShoppingBag color="#000000" size={20} style={{ marginRight: 8 }} />
            <Text style={styles.purchaseCtaText}>Take Test / Purchase Now</Text>
            <ExternalLink color="#000000" size={16} style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ─── Render LEAF_COMING_SOON Node ─────────────────────────────────────────
  const renderComingSoonNode = () => {
    return (
      <View style={styles.nodeBody}>
        <View style={styles.comingSoonCard}>
          <View style={styles.comingSoonIconCircle}>
            <Clock color="#f59e0b" size={36} />
          </View>

          <View style={styles.comingSoonPill}>
            <Text style={styles.comingSoonPillText}>IN DEVELOPMENT</Text>
          </View>

          <Text style={styles.comingSoonTitle}>{currentNode?.title || 'Coming Soon'}</Text>
          <Text style={styles.comingSoonMessage}>
            {currentNode?.message ||
              'Our curriculum team is actively creating high-yield tests for this subject. Tap below to be the first to know when it launches.'}
          </Text>

          {isNotified ? (
            <View style={styles.notifiedFeedback}>
              <CheckCircle color="#10b981" size={20} style={{ marginRight: 8 }} />
              <Text style={styles.notifiedFeedbackText}>
                We'll notify you as soon as this test is available!
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.notifyButton}
              activeOpacity={0.8}
              onPress={submitNotifyMe}
              disabled={isNotifying}
            >
              {isNotifying ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <Bell color="#ffffff" size={18} style={{ marginRight: 8 }} />
                  <Text style={styles.notifyButtonText}>Notify Me When Ready</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.exploreOtherBtn}
            activeOpacity={0.7}
            onPress={resetToRoot}
          >
            <Text style={styles.exploreOtherText}>Explore Available Tests</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {renderHeader()}

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator color="#10b981" size="large" />
            <Text style={styles.loadingText}>Personalizing your study flow...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={resetToRoot}>
              <Text style={styles.retryButtonText}>Return to Start</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {currentNode?.type === 'BRANCH' && renderBranchNode()}
            {currentNode?.type === 'LEAF_PURCHASE' && renderPurchaseNode()}
            {currentNode?.type === 'LEAF_COMING_SOON' && renderComingSoonNode()}
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0f1e',
    paddingTop: Platform.OS === 'android' ? 35 : 0,
  },
  headerContainer: {
    backgroundColor: '#0d1526',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    paddingBottom: 10,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navIconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerTitleWrap: {
    justifyContent: 'center',
  },
  headerSubtitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#10b981',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  resetButtonText: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '700',
  },
  breadcrumbScroll: {
    paddingHorizontal: 16,
    paddingTop: 4,
    alignItems: 'center',
  },
  breadcrumbItemWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumbBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  breadcrumbActiveBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  breadcrumbInactiveBadge: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  breadcrumbText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  breadcrumbActiveText: {
    color: '#34d399',
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: '#0a0f1e',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  nodeBody: {
    gap: 16,
  },
  questionCard: {
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.25)',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  questionIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionHeading: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    lineHeight: 28,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  questionSubhint: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
  },
  optionsList: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#131d33',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  optionIndicator: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionIndexText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#10b981',
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f8fafc',
    flex: 1,
    lineHeight: 22,
  },
  purchaseCard: {
    backgroundColor: '#111c30',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1.5,
    borderColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  purchaseHeader: {
    marginBottom: 14,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  featuredBadgeText: {
    color: '#fbbf24',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  purchaseTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    lineHeight: 28,
  },
  purchaseDescription: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 22,
    marginBottom: 20,
  },
  perksContainer: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 16,
    padding: 16,
    gap: 10,
    marginBottom: 24,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  perkText: {
    fontSize: 13,
    color: '#e2e8f0',
    fontWeight: '600',
  },
  purchaseCtaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  purchaseCtaText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.2,
  },
  comingSoonCard: {
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  comingSoonIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  comingSoonPill: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
  },
  comingSoonPillText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#f59e0b',
    letterSpacing: 1,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
  },
  comingSoonMessage: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  notifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 12,
  },
  notifyButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  notifiedFeedback: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10b981',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    width: '100%',
  },
  notifiedFeedbackText: {
    color: '#34d399',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  exploreOtherBtn: {
    paddingVertical: 8,
  },
  exploreOtherText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  centerLoading: {
    marginTop: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 14,
    color: '#94a3b8',
    fontSize: 14,
  },
  errorCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ef4444',
    alignItems: 'center',
  },
  errorText: {
    color: '#f87171',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 14,
  },
  retryButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
