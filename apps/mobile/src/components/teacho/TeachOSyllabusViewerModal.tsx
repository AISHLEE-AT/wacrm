import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import {
  X,
  Search,
  ShieldCheck,
  BookOpen,
  CheckCircle2,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
  Play,
  FileText,
  Award,
  Sparkles,
  Layers,
  GraduationCap,
  FileCheck,
  Bot,
  Brain,
  Clock,
  Compass,
  Tag,
  Target,
  FileCode,
} from 'lucide-react-native';
import {
  getOfficialGovernmentSyllabus,
  OfficialCourseSyllabus,
  OfficialSubjectSyllabus,
  OfficialChapter,
  OfficialMicroTopic,
  OfficialNanoConcept,
} from '../../data/curriculum/officialGovernmentSyllabusRegistry';

interface TeachOSyllabusViewerModalProps {
  visible: boolean;
  courseId: string;
  courseTitle: string;
  board?: string;
  isPurchased?: boolean;
  onClose: () => void;
  onUnlockCourse?: () => void;
  onLaunchTopicVideo?: (topic: OfficialMicroTopic, subject: string) => void;
  onLaunchTopicNotes?: (topic: OfficialMicroTopic, subject: string) => void;
  onLaunchTopicQuiz?: (topic: OfficialMicroTopic, subject: string) => void;
  onAskAiConcept?: (concept: OfficialNanoConcept, topic: OfficialMicroTopic, subject: string) => void;
  onLaunchNanoPlayer?: (concept: OfficialNanoConcept, topic: OfficialMicroTopic, subject: string, tab?: 'lecture' | 'notes' | 'quiz' | 'tutor') => void;
}

export const TeachOSyllabusViewerModal: React.FC<TeachOSyllabusViewerModalProps> = ({
  visible,
  courseId,
  courseTitle,
  board,
  isPurchased = false,
  onClose,
  onUnlockCourse,
  onLaunchTopicVideo,
  onLaunchTopicNotes,
  onLaunchTopicQuiz,
  onAskAiConcept,
  onLaunchNanoPlayer,
}) => {
  const syllabus: OfficialCourseSyllabus = useMemo(() => {
    return getOfficialGovernmentSyllabus(courseId, board);
  }, [courseId, board]);

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({
    'ch_0_0': true,
    'ch_0_1': true,
  });
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

  const toggleChapter = (key: string) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleTopicNano = (key: string) => {
    setExpandedTopics((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Deep Search across Subjects, Chapters, Micro-topics, and Nano-concepts
  const filteredSubjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return syllabus.subjects
      .filter((s) => selectedSubjectId === 'all' || s.subjectId === selectedSubjectId)
      .map((subj) => {
        if (!q) return subj;
        const matchingChapters = subj.chapters.filter((ch) => {
          const chMatch =
            (ch.chapterTitle || '').toLowerCase().includes(q) ||
            (ch.tamilTitle || '').toLowerCase().includes(q) ||
            (ch.description || '').toLowerCase().includes(q);
          const topicMatch = ch.topics.some((t) => {
            const tMatch =
              (t.title || '').toLowerCase().includes(q) ||
              (t.tamilTitle || '').toLowerCase().includes(q) ||
              (t.keyAxiomOrLaw || '').toLowerCase().includes(q) ||
              (t.keyFormula || '').toLowerCase().includes(q);
            const nanoMatch = (t.nanoConcepts || []).some(
              (n) =>
                (n.name || '').toLowerCase().includes(q) ||
                (n.tamilName || '').toLowerCase().includes(q) ||
                (n.description || '').toLowerCase().includes(q) ||
                (n.keyRuleOrFormula || '').toLowerCase().includes(q) ||
                (n.solvedExampleOrLaw || '').toLowerCase().includes(q)
            );
            return tMatch || nanoMatch;
          });
          return chMatch || topicMatch;
        });
        return {
          ...subj,
          chapters: matchingChapters,
        };
      })
      .filter((subj) => subj.chapters.length > 0);
  }, [syllabus, selectedSubjectId, searchQuery]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.badgeRow}>
                <View style={styles.verifiedBadge}>
                  <ShieldCheck size={13} color="#00D084" />
                  <Text style={styles.verifiedBadgeText}>100% Govt Notified Syllabus</Text>
                </View>
                <View style={styles.mediumBadge}>
                  <Text style={styles.mediumBadgeText}>{syllabus.medium}</Text>
                </View>
              </View>
              <Text style={styles.title} numberOfLines={1}>
                {syllabus.courseTitle}
              </Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                {syllabus.boardOrAuthority}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Government Gazette & Authority Card */}
            <View style={styles.authorityCard}>
              <View style={styles.authorityHeader}>
                <FileCheck size={16} color="#00D084" />
                <Text style={styles.authorityTitle}>OFFICIAL NOTIFICATION & NORMS VERIFICATION</Text>
              </View>
              <Text style={styles.authorityRefText}>📋 {syllabus.notificationRef}</Text>
              {syllabus.gazetteOrder && (
                <Text style={styles.authorityOrderText}>🏛️ Gazette Order: {syllabus.gazetteOrder}</Text>
              )}
              <View style={styles.patternBox}>
                <Text style={styles.patternLabel}>EXAM BLUEPRINT & WEIGHTAGE</Text>
                <Text style={styles.patternSummary}>{syllabus.examPatternSummary}</Text>
                <Text style={styles.markingSchemeText}>⚖️ Marking Scheme: {syllabus.markingScheme}</Text>
              </View>
            </View>

            {/* Granular Stats Counter Bar */}
            <View style={styles.statsBar}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{syllabus.totalSubjects}</Text>
                <Text style={styles.statLabel}>Subjects</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{syllabus.totalChapters}</Text>
                <Text style={styles.statLabel}>Chapters</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{syllabus.totalTopics}</Text>
                <Text style={styles.statLabel}>Micro Topics</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: '#00D084' }]}>
                  {syllabus.totalNanoConcepts || 480}+
                </Text>
                <Text style={styles.statLabel}>Nano Concepts</Text>
              </View>
            </View>

            {/* Nano-Level Search Bar */}
            <View style={styles.searchBox}>
              <Search size={16} color="#64748b" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Deep search concepts (e.g. Cartesian Product, Thales, அளபெடை, F=ma)..."
                placeholderTextColor="#64748b"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <X size={16} color="#94a3b8" />
                </TouchableOpacity>
              )}
            </View>

            {/* Subject Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subjectTabsRow}>
              <TouchableOpacity
                style={[styles.subjectTab, selectedSubjectId === 'all' && styles.subjectTabActive]}
                onPress={() => setSelectedSubjectId('all')}
              >
                <Text style={[styles.subjectTabText, selectedSubjectId === 'all' && styles.subjectTabTextActive]}>
                  All Subjects ({syllabus.subjects.length})
                </Text>
              </TouchableOpacity>
              {syllabus.subjects.map((s) => (
                <TouchableOpacity
                  key={s.subjectId}
                  style={[styles.subjectTab, selectedSubjectId === s.subjectId && styles.subjectTabActive]}
                  onPress={() => setSelectedSubjectId(s.subjectId)}
                >
                  <Text style={[styles.subjectTabText, selectedSubjectId === s.subjectId && styles.subjectTabTextActive]}>
                    {s.icon} {s.subjectName}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Syllabus Hierarchy Content */}
            <View style={styles.subjectsContainer}>
              {filteredSubjects.map((subj, subjIdx) => (
                <View key={subj.subjectId} style={styles.subjectBlock}>
                  {/* Subject Title Header */}
                  <View style={styles.subjectHeader}>
                    <View style={styles.subjectIconBox}>
                      <Text style={{ fontSize: 16 }}>{subj.icon}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.subjectTitleText}>{subj.subjectName}</Text>
                      {subj.tamilName && <Text style={styles.subjectTamilSub}>{subj.tamilName}</Text>}
                    </View>
                    <View style={styles.subjectChaptersBadge}>
                      <Text style={styles.subjectChaptersBadgeText}>
                        {subj.chapters.length} Chapters • {subj.totalNanoConcepts || 50}+ Nano Nodes
                      </Text>
                    </View>
                  </View>

                  {/* Chapters List */}
                  <View style={styles.chaptersList}>
                    {subj.chapters.map((chap, chIdx) => {
                      const chapterKey = `ch_${subjIdx}_${chIdx}`;
                      const isExpanded = expandedChapters[chapterKey] !== false;
                      const isUnlocked = isPurchased || chap.isFreePreview || chIdx === 0;

                      return (
                        <View
                          key={chIdx}
                          style={[
                            styles.chapterCard,
                            isUnlocked ? styles.chapterCardUnlocked : styles.chapterCardLocked,
                          ]}
                        >
                          {/* Chapter Header Accordion Toggle */}
                          <TouchableOpacity
                            style={styles.chapterHeader}
                            onPress={() => toggleChapter(chapterKey)}
                            activeOpacity={0.7}
                          >
                            <View style={{ flex: 1 }}>
                              <View style={styles.chapterMetaRow}>
                                {chap.unitNumber && (
                                  <Text style={styles.unitNumberBadge}>{chap.unitNumber}</Text>
                                )}
                                {chap.term && <Text style={styles.termBadge}>{chap.term}</Text>}
                                {isUnlocked ? (
                                  <View style={styles.freePreviewBadge}>
                                    <CheckCircle2 size={11} color="#00D084" />
                                    <Text style={styles.freePreviewText}>
                                      {isPurchased ? 'Full Access' : 'Free Preview'}
                                    </Text>
                                  </View>
                                ) : (
                                  <View style={styles.lockedBadge}>
                                    <Lock size={11} color="#F59E0B" />
                                    <Text style={styles.lockedText}>Locked</Text>
                                  </View>
                                )}
                              </View>
                              <Text style={styles.chapterTitleText}>
                                Chapter {chap.chapterNumber}: {chap.chapterTitle}
                              </Text>
                              {chap.tamilTitle && (
                                <Text style={styles.chapterTamilTitleText}>{chap.tamilTitle}</Text>
                              )}
                              {chap.description && (
                                <Text style={styles.chapterDescText} numberOfLines={2}>
                                  {chap.description}
                                </Text>
                              )}
                            </View>
                            <View style={styles.accordionIconBox}>
                              {isExpanded ? (
                                <ChevronUp size={18} color="#94a3b8" />
                              ) : (
                                <ChevronDown size={18} color="#94a3b8" />
                              )}
                            </View>
                          </TouchableOpacity>

                          {/* Expanded Topics List */}
                          {isExpanded && (
                            <View style={styles.topicsContainer}>
                              {isUnlocked ? (
                                chap.topics.map((top, tIdx) => {
                                  const topicKey = `top_${subjIdx}_${chIdx}_${tIdx}`;
                                  const isTopicNanoExpanded = expandedTopics[topicKey] !== false;
                                  const nanoList = top.nanoConcepts || [];

                                  return (
                                    <View key={top.id || tIdx} style={styles.topicItem}>
                                      {/* Topic Main Header */}
                                      <View style={styles.topicHeaderRow}>
                                        <View style={styles.topicBullet} />
                                        <View style={{ flex: 1 }}>
                                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                            {top.topicCode && (
                                              <View style={styles.topicCodeBadge}>
                                                <Text style={styles.topicCodeBadgeText}>{top.topicCode}</Text>
                                              </View>
                                            )}
                                            {top.estimatedMinutes && (
                                              <View style={styles.timeBadge}>
                                                <Clock size={10} color="#94a3b8" />
                                                <Text style={styles.timeBadgeText}>{top.estimatedMinutes}m</Text>
                                              </View>
                                            )}
                                          </View>
                                          <Text style={styles.topicTitleText}>{top.title}</Text>
                                          {top.tamilTitle && (
                                            <Text style={styles.topicTamilText}>{top.tamilTitle}</Text>
                                          )}
                                        </View>
                                        <View style={styles.importanceTag}>
                                          <Text style={styles.importanceTagText}>{top.importance}</Text>
                                        </View>
                                      </View>

                                      {/* Marks & Question Archetype Info */}
                                      {(top.marksWeightage || top.questionArchetype) && (
                                        <View style={styles.archetypeRow}>
                                          {top.marksWeightage && (
                                            <View style={styles.weightageTag}>
                                              <Target size={11} color="#00D084" />
                                              <Text style={styles.weightageTagText}>{top.marksWeightage}</Text>
                                            </View>
                                          )}
                                          {top.questionArchetype && (
                                            <View style={styles.questionArchetypeTag}>
                                              <Text style={styles.questionArchetypeText}>📝 {top.questionArchetype}</Text>
                                            </View>
                                          )}
                                        </View>
                                      )}

                                      {/* Key Axiom or Formula Callout */}
                                      {(top.keyAxiomOrLaw || top.keyFormula) && (
                                        <View style={styles.formulaBox}>
                                          <Text style={styles.formulaLabel}>GOVT NORMS KEY AXIOM / FORMULA:</Text>
                                          <Text style={styles.formulaContent}>
                                            {top.keyFormula || top.keyAxiomOrLaw}
                                          </Text>
                                        </View>
                                      )}

                                      {/* Nano-Granular Concept Nodes Section */}
                                      {nanoList.length > 0 && (
                                        <View style={styles.nanoContainer}>
                                          <TouchableOpacity
                                            style={styles.nanoHeaderToggle}
                                            onPress={() => toggleTopicNano(topicKey)}
                                            activeOpacity={0.7}
                                          >
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                              <Layers size={13} color="#38BDF8" />
                                              <Text style={styles.nanoHeaderToggleText}>
                                                Nano-Granular Concepts ({nanoList.length} Nodes)
                                              </Text>
                                            </View>
                                            {isTopicNanoExpanded ? (
                                              <ChevronUp size={14} color="#38BDF8" />
                                            ) : (
                                              <ChevronDown size={14} color="#38BDF8" />
                                            )}
                                          </TouchableOpacity>

                                          {isTopicNanoExpanded && (
                                            <View style={styles.nanoList}>
                                              {nanoList.map((nano, nIdx) => (
                                                <View key={nano.id || nIdx} style={styles.nanoCard}>
                                                  <View style={styles.nanoCardHeader}>
                                                    <View style={styles.nanoCodeBox}>
                                                      <Text style={styles.nanoCodeText}>{nano.conceptCode}</Text>
                                                    </View>
                                                    <View style={{ flex: 1 }}>
                                                      <Text style={styles.nanoNameText}>{nano.name}</Text>
                                                      {nano.tamilName && (
                                                        <Text style={styles.nanoTamilSub}>{nano.tamilName}</Text>
                                                      )}
                                                    </View>
                                                    {nano.questionType && (
                                                      <View style={styles.questionTypePill}>
                                                        <Text style={styles.questionTypePillText}>
                                                          {nano.questionType}
                                                        </Text>
                                                      </View>
                                                    )}
                                                  </View>

                                                  <Text style={styles.nanoDescText}>{nano.description}</Text>

                                                  {nano.keyRuleOrFormula && (
                                                    <View style={styles.nanoRuleBox}>
                                                      <Text style={styles.nanoRuleLabel}>EXACT RULE / FORMULA:</Text>
                                                      <Text style={styles.nanoRuleContent}>{nano.keyRuleOrFormula}</Text>
                                                    </View>
                                                  )}

                                                  {nano.solvedExampleOrLaw && (
                                                    <View style={styles.nanoExampleBox}>
                                                      <Text style={styles.nanoExampleLabel}>MODEL APPLICATION / DERIVATION:</Text>
                                                      <Text style={styles.nanoExampleContent}>{nano.solvedExampleOrLaw}</Text>
                                                    </View>
                                                  )}

                                                  {nano.pyqReferences && nano.pyqReferences.length > 0 && (
                                                    <View style={styles.pyqRow}>
                                                      <Text style={styles.pyqLabel}>🎯 Official PYQ:</Text>
                                                      <Text style={styles.pyqText}>{nano.pyqReferences.join(' • ')}</Text>
                                                    </View>
                                                  )}

                                                  {/* Launch AI Nano Player button */}
                                                  <TouchableOpacity
                                                    style={styles.launchAiNanoPlayerBtn}
                                                    onPress={() => onLaunchNanoPlayer && onLaunchNanoPlayer(nano, top, subj.subjectName, 'lecture')}
                                                    activeOpacity={0.8}
                                                  >
                                                    <Sparkles size={12} color="#070C18" />
                                                    <Text style={styles.launchAiNanoPlayerBtnText}>
                                                      Launch AI Nano Lesson ({nano.conceptCode})
                                                    </Text>
                                                  </TouchableOpacity>

                                                  {/* Ask AI for this specific nano node */}
                                                  <TouchableOpacity
                                                    style={styles.askAiNanoBtn}
                                                    onPress={() => onAskAiConcept && onAskAiConcept(nano, top, subj.subjectName)}
                                                    activeOpacity={0.8}
                                                  >
                                                    <Bot size={12} color="#00D084" />
                                                    <Text style={styles.askAiNanoBtnText}>
                                                      Ask AI Tutor about {nano.conceptCode}
                                                    </Text>
                                                  </TouchableOpacity>
                                                </View>
                                              ))}
                                            </View>
                                          )}
                                        </View>
                                      )}

                                      {/* Interactive Action Buttons */}
                                      <View style={styles.topicActionsRow}>
                                        {top.hasVideo && (
                                          <TouchableOpacity
                                            style={styles.actionPill}
                                            onPress={() => onLaunchTopicVideo && onLaunchTopicVideo(top, subj.subjectName)}
                                          >
                                            <Play size={12} color="#00D084" />
                                            <Text style={styles.actionPillText}>Video Class</Text>
                                          </TouchableOpacity>
                                        )}
                                        {top.hasNotes && (
                                          <TouchableOpacity
                                            style={styles.actionPill}
                                            onPress={() => onLaunchTopicNotes && onLaunchTopicNotes(top, subj.subjectName)}
                                          >
                                            <FileText size={12} color="#38bdf8" />
                                            <Text style={styles.actionPillText}>Notes Deck</Text>
                                          </TouchableOpacity>
                                        )}
                                        {top.hasQuiz && (
                                          <TouchableOpacity
                                            style={[styles.actionPill, styles.actionPillQuiz]}
                                            onPress={() => onLaunchTopicQuiz && onLaunchTopicQuiz(top, subj.subjectName)}
                                          >
                                            <Award size={12} color="#f59e0b" />
                                            <Text style={[styles.actionPillText, { color: '#f59e0b' }]}>
                                              Topic Test
                                            </Text>
                                          </TouchableOpacity>
                                        )}
                                      </View>
                                    </View>
                                  );
                                })
                              ) : (
                                <View style={styles.lockedChapterNotice}>
                                  <Lock size={24} color="#F59E0B" />
                                  <Text style={styles.lockedNoticeTitle}>
                                    This Chapter is Locked in Free Preview
                                  </Text>
                                  <Text style={styles.lockedNoticeSub}>
                                    Purchase this course or activate TutO Pass Pro to unlock all {chap.topicsCount} micro-topics, nano-concept nodes, video lectures, and official tests.
                                  </Text>
                                  <TouchableOpacity
                                    style={styles.unlockChapterBtn}
                                    onPress={onUnlockCourse}
                                    activeOpacity={0.8}
                                  >
                                    <Sparkles size={14} color="#070C18" />
                                    <Text style={styles.unlockChapterBtnText}>
                                      Unlock Complete Syllabus (₹199)
                                    </Text>
                                  </TouchableOpacity>
                                </View>
                              )}
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
            <View style={{ height: 40 }} />
          </ScrollView>

          {/* Sticky Footer for Unpurchased Users */}
          {!isPurchased && (
            <View style={styles.stickyFooter}>
              <View style={{ flex: 1 }}>
                <Text style={styles.footerPriceLabel}>FULL COURSE & SYLLABUS UNLOCK</Text>
                <Text style={styles.footerPriceValue}>₹199 / 1-Year Pass Pro</Text>
              </View>
              <TouchableOpacity style={styles.footerUnlockBtn} onPress={onUnlockCourse}>
                <Sparkles size={14} color="#070C18" />
                <Text style={styles.footerUnlockBtnText}>Instant Unlock</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#070C18',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '94%',
    borderWidth: 1,
    borderColor: '#1E293B',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#0E172A',
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#00D08415',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#00D084',
  },
  verifiedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00D084',
  },
  mediumBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  mediumBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  subtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  closeBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#1E293B',
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  authorityCard: {
    backgroundColor: '#0E172A',
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 6,
  },
  authorityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorityTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#00D084',
    letterSpacing: 0.5,
  },
  authorityRefText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
    lineHeight: 16,
  },
  authorityOrderText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  patternBox: {
    backgroundColor: '#131F37',
    borderRadius: 10,
    padding: 10,
    marginTop: 6,
    gap: 4,
  },
  patternLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 0.5,
  },
  patternSummary: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E2E8F0',
    lineHeight: 16,
  },
  markingSchemeText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0E172A',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 14,
    fontWeight: '900',
    color: '#F8FAFC',
  },
  statLabel: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#1E293B',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0E172A',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  searchInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 12,
  },
  subjectTabsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 12,
  },
  subjectTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#0E172A',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  subjectTabActive: {
    backgroundColor: '#00D08420',
    borderColor: '#00D084',
  },
  subjectTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  subjectTabTextActive: {
    color: '#00D084',
    fontWeight: '800',
  },
  subjectsContainer: {
    gap: 16,
  },
  subjectBlock: {
    backgroundColor: '#0E172A',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 12,
  },
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  subjectIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#131F37',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectTitleText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  subjectTamilSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  subjectChaptersBadge: {
    backgroundColor: '#131F37',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  subjectChaptersBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  chaptersList: {
    gap: 10,
  },
  chapterCard: {
    backgroundColor: '#131F37',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    overflow: 'hidden',
  },
  chapterCardUnlocked: {
    borderColor: '#1E293B',
  },
  chapterCardLocked: {
    borderColor: '#F59E0B40',
  },
  chapterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  chapterMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  unitNumberBadge: {
    backgroundColor: '#00D08420',
    color: '#00D084',
    fontSize: 9,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  termBadge: {
    backgroundColor: '#38BDF820',
    color: '#38BDF8',
    fontSize: 9,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  freePreviewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#00D08415',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  freePreviewText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#00D084',
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F59E0B20',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  lockedText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#F59E0B',
  },
  chapterTitleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  chapterTamilTitleText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  chapterDescText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 3,
    lineHeight: 14,
  },
  accordionIconBox: {
    padding: 4,
  },
  topicsContainer: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    gap: 12,
  },
  topicItem: {
    backgroundColor: '#0E172A',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 8,
  },
  topicHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  topicBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00D084',
    marginTop: 5,
  },
  topicCodeBadge: {
    backgroundColor: '#38BDF820',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#38BDF850',
  },
  topicCodeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#38BDF8',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#1E293B',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  timeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
  },
  topicTitleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  topicTamilText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  importanceTag: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  importanceTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#38BDF8',
  },
  archetypeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  weightageTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#00D08415',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  weightageTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00D084',
  },
  questionArchetypeTag: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  questionArchetypeText: {
    fontSize: 10,
    color: '#CBD5E1',
  },
  formulaBox: {
    backgroundColor: '#131F37',
    borderRadius: 8,
    padding: 8,
    borderWidth: 0.5,
    borderColor: '#38BDF840',
    gap: 2,
  },
  formulaLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#38BDF8',
    letterSpacing: 0.5,
  },
  formulaContent: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  nanoContainer: {
    backgroundColor: '#080D1A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
    overflow: 'hidden',
    marginTop: 2,
  },
  nanoHeaderToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#131F37',
  },
  nanoHeaderToggleText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 0.3,
  },
  nanoList: {
    padding: 8,
    gap: 8,
  },
  nanoCard: {
    backgroundColor: '#0E172A',
    borderRadius: 8,
    padding: 8,
    borderWidth: 0.5,
    borderColor: '#334155',
    gap: 6,
  },
  nanoCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  nanoCodeBox: {
    backgroundColor: '#38BDF820',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  nanoCodeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#38BDF8',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  nanoNameText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  nanoTamilSub: {
    fontSize: 10,
    color: '#94A3B8',
  },
  questionTypePill: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  questionTypePillText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#F59E0B',
  },
  nanoDescText: {
    fontSize: 10,
    color: '#94A3B8',
    lineHeight: 14,
  },
  nanoRuleBox: {
    backgroundColor: '#131F37',
    padding: 6,
    borderRadius: 6,
    gap: 2,
  },
  nanoRuleLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#00D084',
  },
  nanoRuleContent: {
    fontSize: 10,
    color: '#E2E8F0',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  nanoExampleBox: {
    backgroundColor: '#131F37',
    padding: 6,
    borderRadius: 6,
    gap: 2,
  },
  nanoExampleLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#F59E0B',
  },
  nanoExampleContent: {
    fontSize: 10,
    color: '#CBD5E1',
  },
  pyqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pyqLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#F59E0B',
  },
  pyqText: {
    fontSize: 9,
    color: '#E2E8F0',
  },
  launchAiNanoPlayerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#00D084',
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 4,
  },
  launchAiNanoPlayerBtnText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#070C18',
  },
  askAiNanoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#00D08415',
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#00D08440',
    marginTop: 2,
  },
  askAiNanoBtnText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#00D084',
  },
  topicActionsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  actionPillQuiz: {
    backgroundColor: '#F59E0B15',
  },
  actionPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00D084',
  },
  lockedChapterNotice: {
    alignItems: 'center',
    padding: 16,
    gap: 6,
    backgroundColor: '#0E172A',
    borderRadius: 10,
  },
  lockedNoticeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  lockedNoticeSub: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 16,
  },
  unlockChapterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#00D084',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 6,
  },
  unlockChapterBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#070C18',
  },
  stickyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0E172A',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  footerPriceLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  footerPriceValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#00D084',
  },
  footerUnlockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#00D084',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  footerUnlockBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#070C18',
  },
});
