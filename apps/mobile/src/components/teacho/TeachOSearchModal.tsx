import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Platform,
  StatusBar,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Search,
  X,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Layers,
  Bot,
  PlayCircle,
  Eye,
  EyeOff,
  Flame,
  Filter,
  GraduationCap,
} from 'lucide-react-native';
import {
  searchCurriculumContent,
  searchMcqQuestions,
  ContentSearchResult,
  McqSearchResult,
  POPULAR_KEYWORDS,
} from '../../services/teachoSearchService';

const { width, height } = Dimensions.get('window');

interface TeachOSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectContent: (item: ContentSearchResult) => void;
  onOpenTestO: (topicTitle: string, courseTitle?: string) => void;
  onAskAi: (topicTitle: string) => void;
}

export const TeachOSearchModal: React.FC<TeachOSearchModalProps> = ({
  visible,
  onClose,
  onSelectContent,
  onOpenTestO,
  onAskAi,
}) => {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'content' | 'mcq'>('content');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});

  const [contentResults, setContentResults] = useState<ContentSearchResult[]>([]);
  const [mcqResults, setMcqResults] = useState<McqSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setContentResults([]);
      // Load initial high-yield MCQs
      searchMcqQuestions('', selectedCategory).then(setMcqResults);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      // 1. Search content
      const cRes = searchCurriculumContent(query, selectedCategory);
      setContentResults(cRes);

      // 2. Search MCQs
      const mRes = await searchMcqQuestions(query, selectedCategory);
      setMcqResults(mRes);

      setIsSearching(false);
    }, 180);

    return () => clearTimeout(timer);
  }, [query, selectedCategory]);

  const toggleRevealAnswer = (id: string) => {
    setRevealedAnswers((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleKeywordTap = (kw: string) => {
    setQuery(kw);
  };

  const handleClear = () => {
    setQuery('');
    setContentResults([]);
    searchMcqQuestions('', selectedCategory).then(setMcqResults);
  };

  const categories = [
    { id: 'all', label: 'All Subjects' },
    { id: 'tamil', label: 'தமிழ் (Tamil)' },
    { id: 'maths', label: 'Maths' },
    { id: 'science', label: 'Science' },
    { id: 'polity', label: 'Polity & GK' },
    { id: 'school', label: 'School 1-12' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0) }]}>
        {/* Top Navigation Bar */}
        <View style={styles.header}>
          <View style={styles.searchBarWrapper}>
            <Search size={18} color="#06b6d4" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search concepts, chapters, formulas, or MCQs..."
              placeholderTextColor="#64748b"
              value={query}
              onChangeText={setQuery}
              autoFocus={true}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
                <X size={16} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Text style={styles.closeBtnText}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Selector: Content vs MCQs */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'content' && styles.tabItemActive]}
            onPress={() => setActiveTab('content')}
            activeOpacity={0.8}
          >
            <BookOpen size={16} color={activeTab === 'content' ? '#06b6d4' : '#64748b'} />
            <Text style={[styles.tabLabel, activeTab === 'content' && styles.tabLabelActive]}>
              Curriculum Content {contentResults.length > 0 ? `(${contentResults.length})` : ''}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'mcq' && styles.tabItemActive]}
            onPress={() => setActiveTab('mcq')}
            activeOpacity={0.8}
          >
            <HelpCircle size={16} color={activeTab === 'mcq' ? '#10b981' : '#64748b'} />
            <Text style={[styles.tabLabel, activeTab === 'mcq' && styles.tabLabelActive]}>
              Question Bank MCQs {mcqResults.length > 0 ? `(${mcqResults.length})` : ''}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filter Chips */}
        <View style={styles.filterRowWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {categories.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  onPress={() => setSelectedCategory(cat.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Search Results List */}
        <ScrollView
          style={styles.resultsScroll}
          contentContainerStyle={styles.resultsContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {isSearching && (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#06b6d4" />
              <Text style={styles.loadingText}>Searching curriculum and question bank database...</Text>
            </View>
          )}

          {/* Empty State / Popular Suggestions */}
          {!isSearching && query.trim().length === 0 && (
            <View style={styles.suggestionSection}>
              <View style={styles.suggestionHeader}>
                <Sparkles size={16} color="#f59e0b" />
                <Text style={styles.suggestionTitle}>Popular & High-Yield Search Topics</Text>
              </View>
              <View style={styles.keywordGrid}>
                {POPULAR_KEYWORDS.map((kw, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.keywordBadge}
                    onPress={() => handleKeywordTap(kw)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.keywordBadgeText}>{kw}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* TAB 1: CURRICULUM CONTENT RESULTS */}
          {activeTab === 'content' && (
            <View style={styles.listSection}>
              {!isSearching && query.trim().length > 0 && contentResults.length === 0 && (
                <View style={styles.noResultsBox}>
                  <BookOpen size={36} color="#475569" />
                  <Text style={styles.noResultsTitle}>No Curriculum Content Found</Text>
                  <Text style={styles.noResultsDesc}>
                    Try searching for another topic keyword, formula, or switch to Question Bank tab.
                  </Text>
                </View>
              )}

              {contentResults.map((item, idx) => (
                <View key={item.id || idx} style={styles.contentCard}>
                  {/* Card Header Badges */}
                  <View style={styles.cardBadgeRow}>
                    <View style={styles.subjectPill}>
                      <Text style={styles.subjectPillText}>{item.subject}</Text>
                    </View>
                    <Text style={styles.courseTag} numberOfLines={1}>
                      {item.courseTitle}
                    </Text>
                  </View>

                  {/* Chapter & Topic */}
                  <Text style={styles.contentChapterText} numberOfLines={1}>
                    {item.chapterTitle}
                  </Text>
                  <Text style={styles.contentTopicTitle}>{item.topicTitle}</Text>

                  {/* Axiom / Formula preview */}
                  {(item.keyAxiom || item.keyFormulaOrLaw || item.subtopic) && (
                    <View style={styles.axiomBox}>
                      <Text style={styles.axiomText} numberOfLines={2}>
                        {item.keyAxiom || item.keyFormulaOrLaw || item.subtopic}
                      </Text>
                    </View>
                  )}

                  {/* Actions Row */}
                  <View style={styles.contentActionRow}>
                    <TouchableOpacity
                      style={styles.openPlayerBtn}
                      onPress={() => {
                        onClose();
                        onSelectContent(item);
                      }}
                      activeOpacity={0.8}
                    >
                      <PlayCircle size={14} color="#0f172a" />
                      <Text style={styles.openPlayerBtnText}>Open Lesson</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.testBtn}
                      onPress={() => {
                        onClose();
                        onOpenTestO(item.topicTitle, item.courseTitle);
                      }}
                      activeOpacity={0.8}
                    >
                      <HelpCircle size={13} color="#10b981" />
                      <Text style={styles.testBtnText}>Test in TestO</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.aiBtn}
                      onPress={() => {
                        onClose();
                        onAskAi(item.topicTitle);
                      }}
                      activeOpacity={0.8}
                    >
                      <Bot size={13} color="#c084fc" />
                      <Text style={styles.aiBtnText}>AI Doubt</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* TAB 2: MCQ & QUESTION BANK RESULTS */}
          {activeTab === 'mcq' && (
            <View style={styles.listSection}>
              {!isSearching && query.trim().length > 0 && mcqResults.length === 0 && (
                <View style={styles.noResultsBox}>
                  <HelpCircle size={36} color="#475569" />
                  <Text style={styles.noResultsTitle}>No MCQs Matched</Text>
                  <Text style={styles.noResultsDesc}>
                    Try searching for related keywords like "Thermodynamics", "உயிர் எழுத்துக்கள்", or "Article 32".
                  </Text>
                </View>
              )}

              {mcqResults.map((mcq, qIdx) => {
                const isRevealed = Boolean(revealedAnswers[mcq.id]);
                return (
                  <View key={mcq.id || qIdx} style={styles.mcqCard}>
                    {/* Header */}
                    <View style={styles.mcqHeaderRow}>
                      <View style={styles.mcqSubjectPill}>
                        <Text style={styles.mcqSubjectText}>{mcq.subject}</Text>
                      </View>
                      {mcq.examTag && (
                        <View style={styles.examTagPill}>
                          <Text style={styles.examTagText}>{mcq.examTag}</Text>
                        </View>
                      )}
                    </View>

                    {/* Question Text */}
                    <Text style={styles.mcqQuestionText}>
                      <Text style={{ color: '#06b6d4', fontWeight: '800' }}>Q{qIdx + 1}: </Text>
                      {mcq.question}
                    </Text>

                    {/* Tamil translation if present */}
                    {mcq.question_ta && (
                      <Text style={styles.mcqQuestionTa}>{mcq.question_ta}</Text>
                    )}

                    {/* Options list */}
                    <View style={styles.mcqOptionsList}>
                      {mcq.options.map((opt, oIdx) => {
                        const isCorrect = isRevealed && (oIdx === mcq.correctIndex || opt === mcq.answer || opt.startsWith(mcq.answer));
                        return (
                          <View
                            key={oIdx}
                            style={[
                              styles.mcqOptionItem,
                              isCorrect && styles.mcqOptionItemCorrect,
                            ]}
                          >
                            <Text
                              style={[
                                styles.mcqOptionText,
                                isCorrect && styles.mcqOptionTextCorrect,
                              ]}
                            >
                              {opt}
                            </Text>
                            {isCorrect && (
                              <CheckCircle2 size={16} color="#10b981" />
                            )}
                          </View>
                        );
                      })}
                    </View>

                    {/* Reveal Answer Button */}
                    <TouchableOpacity
                      style={[styles.revealBtn, isRevealed && styles.revealBtnActive]}
                      onPress={() => toggleRevealAnswer(mcq.id)}
                      activeOpacity={0.7}
                    >
                      {isRevealed ? (
                        <EyeOff size={14} color="#10b981" />
                      ) : (
                        <Eye size={14} color="#94a3b8" />
                      )}
                      <Text style={[styles.revealBtnText, isRevealed && styles.revealBtnTextActive]}>
                        {isRevealed ? 'Hide Answer & Explanation' : 'Reveal Correct Answer & Steps'}
                      </Text>
                    </TouchableOpacity>

                    {/* Explanation Box */}
                    {isRevealed && (
                      <View style={styles.explanationBox}>
                        <Text style={styles.explanationTitle}>✓ Model Solution & Explanation:</Text>
                        <Text style={styles.explanationText}>{mcq.explanation}</Text>
                      </View>
                    )}

                    {/* Bottom Action */}
                    <View style={styles.mcqBottomRow}>
                      <TouchableOpacity
                        style={styles.mcqLaunchTestBtn}
                        onPress={() => {
                          onClose();
                          onOpenTestO(mcq.topicTitle, mcq.courseTitle);
                        }}
                        activeOpacity={0.8}
                      >
                        <HelpCircle size={13} color="#0f172a" />
                        <Text style={styles.mcqLaunchTestText}>Take Topic Test in TestO</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.mcqAskAiBtn}
                        onPress={() => {
                          onClose();
                          onAskAi(`Please explain this question: ${mcq.question}`);
                        }}
                        activeOpacity={0.8}
                      >
                        <Bot size={13} color="#c084fc" />
                        <Text style={styles.mcqAskAiText}>Explain via AI</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  searchBarWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131b2e',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#334155',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
  },
  closeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  closeBtnText: {
    color: '#06b6d4',
    fontSize: 15,
    fontWeight: '700',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#06b6d4',
    backgroundColor: 'rgba(6, 182, 212, 0.05)',
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  tabLabelActive: {
    color: '#f8fafc',
    fontWeight: '700',
  },
  filterRowWrapper: {
    backgroundColor: '#0c1222',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    paddingVertical: 8,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterChipActive: {
    backgroundColor: '#06b6d4',
    borderColor: '#06b6d4',
  },
  filterChipText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#090d16',
    fontWeight: '800',
  },
  resultsScroll: {
    flex: 1,
  },
  resultsContent: {
    padding: 16,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 13,
  },
  suggestionSection: {
    backgroundColor: '#131b2e',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 20,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  suggestionTitle: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '700',
  },
  keywordGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  keywordBadge: {
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.25)',
  },
  keywordBadgeText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '600',
  },
  listSection: {
    gap: 14,
  },
  noResultsBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  noResultsTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6,
  },
  noResultsDesc: {
    color: '#64748b',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  contentCard: {
    backgroundColor: '#131b2e',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 10,
  },
  cardBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subjectPill: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  subjectPillText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
  },
  courseTag: {
    color: '#94a3b8',
    fontSize: 11,
    maxWidth: '55%',
  },
  contentChapterText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
  contentTopicTitle: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  axiomBox: {
    backgroundColor: '#0c1222',
    padding: 10,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#06b6d4',
  },
  axiomText: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 17,
  },
  contentActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  openPlayerBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#06b6d4',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  openPlayerBtnText: {
    color: '#090d16',
    fontSize: 12,
    fontWeight: '800',
  },
  testBtn: {
    flex: 1.1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  testBtnText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '700',
  },
  aiBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  aiBtnText: {
    color: '#c084fc',
    fontSize: 12,
    fontWeight: '700',
  },
  mcqCard: {
    backgroundColor: '#131b2e',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 10,
  },
  mcqHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mcqSubjectPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  mcqSubjectText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '700',
  },
  examTagPill: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  examTagText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  mcqQuestionText: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  mcqQuestionTa: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  mcqOptionsList: {
    gap: 6,
    marginVertical: 4,
  },
  mcqOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0c1222',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  mcqOptionItemCorrect: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10b981',
  },
  mcqOptionText: {
    color: '#cbd5e1',
    fontSize: 13,
    flex: 1,
  },
  mcqOptionTextCorrect: {
    color: '#10b981',
    fontWeight: '700',
  },
  revealBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1e293b',
  },
  revealBtnActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  revealBtnText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  revealBtnTextActive: {
    color: '#10b981',
    fontWeight: '700',
  },
  explanationBox: {
    backgroundColor: '#0c1222',
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#10b981',
    gap: 4,
  },
  explanationTitle: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '800',
  },
  explanationText: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 17,
  },
  mcqBottomRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  mcqLaunchTestBtn: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  mcqLaunchTestText: {
    color: '#090d16',
    fontSize: 12,
    fontWeight: '800',
  },
  mcqAskAiBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  mcqAskAiText: {
    color: '#c084fc',
    fontSize: 12,
    fontWeight: '700',
  },
});
