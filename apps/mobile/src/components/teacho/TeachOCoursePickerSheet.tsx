import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  Platform,
  ScrollView,
} from 'react-native';
import { X, Search, Check, GraduationCap, School, Award, Sparkles, Target, Briefcase, BookOpen, Layers, ShieldCheck, Building2 } from 'lucide-react-native';
import { ALL_COURSES, CourseOption, SCHOOL_BOARDS } from '../../data/coursesCatalog';

interface TeachOCoursePickerSheetProps {
  visible: boolean;
  courses?: CourseOption[];
  selectedCourseId?: string;
  selectedCourse?: CourseOption;
  onClose: () => void;
  onSelectCourse?: (course: CourseOption) => void;
  onSelect?: (course: CourseOption) => void;
}

export const TeachOCoursePickerSheet: React.FC<TeachOCoursePickerSheetProps> = ({
  visible,
  courses = ALL_COURSES,
  selectedCourseId,
  selectedCourse,
  onClose,
  onSelectCourse,
  onSelect,
}) => {
  const safeCourses = courses || ALL_COURSES;
  const activeCourseId = selectedCourseId || selectedCourse?.id;
  const [search, setSearch] = useState('');
  const [selectedTab, setSelectedTab] = useState<
    | 'all'
    | 'featured'
    | 'school'
    | 'degree'
    | 'entrance'
    | 'tn_govt'
    | 'banking_ssc'
    | 'upsc_defense'
    | 'skills'
  >('all');

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: safeCourses.length };
    safeCourses.forEach((c) => {
      if (c.category === 'featured_junior' || c.id.startsWith('jr-')) counts['featured'] = (counts['featured'] || 0) + 1;
      if (c.category === 'school_k12' || c.category.startsWith('school_')) counts['school'] = (counts['school'] || 0) + 1;
      if (c.category === 'college_degree' || c.gradeLevel === 'college') counts['degree'] = (counts['degree'] || 0) + 1;
      if (c.category === 'entrance') counts['entrance'] = (counts['entrance'] || 0) + 1;
      if (c.category === 'tnpsc') counts['tn_govt'] = (counts['tn_govt'] || 0) + 1;
      if (c.category === 'banking_finance' || c.category === 'ssc_railway') counts['banking_ssc'] = (counts['banking_ssc'] || 0) + 1;
      if (c.category === 'upsc_central') counts['upsc_defense'] = (counts['upsc_defense'] || 0) + 1;
      if (c.category === 'skills' || c.gradeLevel === 'skill' || c.category === 'kids_skills') counts['skills'] = (counts['skills'] || 0) + 1;
    });
    return counts;
  }, [safeCourses]);

  const filteredCourses = useMemo(() => {
    const q = search.trim().toLowerCase();
    return safeCourses.filter((c) => {
      // 1. Search Query Filter
      if (q) {
        const titleMatch = c.title.toLowerCase().includes(q);
        const shortMatch = c.short.toLowerCase().includes(q);
        const subMatch = c.subtitle.toLowerCase().includes(q);
        const badgeMatch = (c.badge || '').toLowerCase().includes(q);
        const boardMatch = (c.board || '').toLowerCase().includes(q);
        const medMatch = (c.medium || '').toLowerCase().includes(q);
        const subjMatch = (c.subjects || []).some((s) => s.name.toLowerCase().includes(q));
        const idMatch = c.id.toLowerCase().includes(q.replace(/\\s+/g, '-'));

        return titleMatch || shortMatch || subMatch || badgeMatch || boardMatch || medMatch || subjMatch || idMatch;
      }

      // 2. Category Tab Filter
      if (selectedTab === 'featured') {
        return c.category === 'featured_junior' || c.id.startsWith('jr-');
      }
      if (selectedTab === 'school') {
        return c.category === 'school_k12' || c.category.startsWith('school_');
      }
      if (selectedTab === 'degree') {
        return c.category === 'college_degree' || c.gradeLevel === 'college';
      }
      if (selectedTab === 'entrance') {
        return c.category === 'entrance';
      }
      if (selectedTab === 'tn_govt') {
        return c.category === 'tnpsc';
      }
      if (selectedTab === 'banking_ssc') {
        return c.category === 'banking_finance' || c.category === 'ssc_railway';
      }
      if (selectedTab === 'upsc_defense') {
        return c.category === 'upsc_central';
      }
      if (selectedTab === 'skills') {
        return c.category === 'skills' || c.gradeLevel === 'skill' || c.category === 'kids_skills';
      }

      return true;
    });
  }, [safeCourses, search, selectedTab]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.sheetTitle}>Select Curriculum Program</Text>
              <Text style={styles.sheetSubtitle}>
                {safeCourses.length} Master Programs (LKG to 12th, Boards, Exams, Degrees & Skills)
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Search size={18} color="#64748b" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search 10th, TN Samacheer, NEET, TNPSC, Python..."
              placeholderTextColor="#64748b"
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} style={styles.clearSearchBtn}>
                <X size={16} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Category Filter Horizontal Scroll */}
          <View style={styles.tabsWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
              {[
                { key: 'all', label: `All Programs (${tabCounts.all || safeCourses.length})` },
                { key: 'featured', label: `⭐ Jr Leaders (${tabCounts.featured || 10})` },
                { key: 'school', label: `🏫 School LKG-12th (${tabCounts.school || 0})` },
                { key: 'degree', label: `🎓 Top Degrees (${tabCounts.degree || 0})` },
                { key: 'entrance', label: `🎯 NEET / JEE (${tabCounts.entrance || 0})` },
                { key: 'tn_govt', label: `🏛️ TNPSC & Police (${tabCounts.tn_govt || 0})` },
                { key: 'banking_ssc', label: `🏦 Bank & SSC (${tabCounts.banking_ssc || 0})` },
                { key: 'upsc_defense', label: `🇮🇳 UPSC & Defense (${tabCounts.upsc_defense || 0})` },
                { key: 'skills', label: `💡 Career Skills (${tabCounts.skills || 0})` },
              ].map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.tabPill, selectedTab === tab.key && styles.tabPillActive]}
                  onPress={() => {
                    setSelectedTab(tab.key as any);
                    setSearch('');
                  }}
                >
                  <Text
                    style={[styles.tabPillText, selectedTab === tab.key && styles.tabPillTextActive]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Results Count */}
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCountText}>
              Showing {filteredCourses.length} programs
            </Text>
            <Text style={styles.bilingualHint}>Bilingual (தமிழ் & English)</Text>
          </View>

          {/* Courses List */}
          <FlatList
            data={filteredCourses}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const isSelected = item.id === activeCourseId;
              const isSchool = item.category === 'school_k12' || item.category.startsWith('school_');

              return (
                <TouchableOpacity
                  style={[styles.courseCard, isSelected && styles.courseCardSelected]}
                  onPress={() => {
                    try {
                      if (typeof onSelectCourse === 'function') {
                        onSelectCourse(item);
                      }
                      if (typeof onSelect === 'function') {
                        onSelect(item);
                      }
                    } catch (err) {
                      console.warn('Error selecting course:', err);
                    } finally {
                      if (typeof onClose === 'function') {
                        onClose();
                      }
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.courseInfo}>
                    <View style={styles.badgeRow}>
                      <View style={[styles.badgeTag, { backgroundColor: `${item.badgeColor || '#06b6d4'}25` }]}>
                        <Text style={[styles.badgeTagText, { color: item.badgeColor || '#06b6d4' }]}>
                          {item.badge || item.short}
                        </Text>
                      </View>
                      <View style={styles.mediumBadge}>
                        <Text style={styles.mediumPill}>{item.medium}</Text>
                      </View>
                      <Text style={styles.daysText}>{item.totalDays || 200} Days</Text>
                    </View>

                    <Text style={styles.courseTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.courseSubtitle} numberOfLines={1}>
                      {item.subtitle}
                    </Text>

                    {/* Multi-Board Indicators for School Standards */}
                    {isSchool && (
                      <View style={styles.boardsRow}>
                        <View style={styles.boardChip}>
                          <Text style={styles.boardChipText}>🏛️ TN Samacheer</Text>
                        </View>
                        <View style={styles.boardChip}>
                          <Text style={styles.boardChipText}>📘 CBSE NCERT</Text>
                        </View>
                        <View style={styles.boardChip}>
                          <Text style={styles.boardChipText}>🌐 ICSE/Intl</Text>
                        </View>
                      </View>
                    )}
                  </View>

                  {isSelected ? (
                    <View style={styles.selectedCheck}>
                      <Check size={16} color="#0B1120" strokeWidth={3} />
                    </View>
                  ) : (
                    <View style={styles.selectRadio} />
                  )}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No matching programs found</Text>
                <Text style={styles.emptySub}>Try searching "10th", "TNPSC", "NEET", or "Python"</Text>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#0B1120',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '88%',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerLeft: {
    flex: 1,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  sheetSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#1e293b',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131d31',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 42,
    color: '#ffffff',
    fontSize: 14,
  },
  clearSearchBtn: {
    padding: 4,
  },
  tabsWrapper: {
    paddingVertical: 6,
  },
  tabsRow: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#131d31',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  tabPillActive: {
    backgroundColor: '#00D08420',
    borderColor: '#00D084',
  },
  tabPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
  tabPillTextActive: {
    color: '#00D084',
    fontWeight: '700',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  resultsCountText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  bilingualHint: {
    fontSize: 11,
    color: '#00D084',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 10,
  },
  courseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  courseCardSelected: {
    borderColor: '#00D084',
    backgroundColor: '#00D0840c',
  },
  courseInfo: {
    flex: 1,
    marginRight: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  badgeTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  mediumBadge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  mediumPill: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
  },
  daysText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  courseSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
  },
  boardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  boardChip: {
    backgroundColor: '#1e293b80',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#334155',
  },
  boardChipText: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '500',
  },
  selectRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#334155',
  },
  selectedCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#00D084',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  emptySub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
});
