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
import { X, Search, Check, GraduationCap, School, Award, Sparkles, Target, Briefcase, BookOpen, Layers } from 'lucide-react-native';
import { CourseOption } from '../../data/coursesCatalog';

interface TeachOCoursePickerSheetProps {
  visible: boolean;
  courses: CourseOption[];
  selectedCourseId: string;
  onClose: () => void;
  onSelectCourse: (course: CourseOption) => void;
}

export const TeachOCoursePickerSheet: React.FC<TeachOCoursePickerSheetProps> = ({
  visible,
  courses,
  selectedCourseId,
  onClose,
  onSelectCourse,
}) => {
  const [search, setSearch] = useState('');
  const [selectedTab, setSelectedTab] = useState<
    | 'all'
    | 'tnsb_en'
    | 'tnsb_ta'
    | 'cbse'
    | 'matric'
    | 'tnpsc'
    | 'upsc'
    | 'entrance'
    | 'college'
    | 'skills'
    | 'kids'
  >('all');

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: courses.length };
    courses.forEach((c) => {
      if (c.category === 'school_tnsb_en') counts['tnsb_en'] = (counts['tnsb_en'] || 0) + 1;
      if (c.category === 'school_tnsb_ta') counts['tnsb_ta'] = (counts['tnsb_ta'] || 0) + 1;
      if (c.category === 'school_cbse') counts['cbse'] = (counts['cbse'] || 0) + 1;
      if (c.category === 'school_matric') counts['matric'] = (counts['matric'] || 0) + 1;
      if (c.category === 'tnpsc') counts['tnpsc'] = (counts['tnpsc'] || 0) + 1;
      if (c.category === 'upsc_central') counts['upsc'] = (counts['upsc'] || 0) + 1;
      if (c.category === 'entrance') counts['entrance'] = (counts['entrance'] || 0) + 1;
      if (c.category === 'college_degree' || c.gradeLevel === 'college') counts['college'] = (counts['college'] || 0) + 1;
      if (c.category === 'skills' || c.gradeLevel === 'skill') counts['skills'] = (counts['skills'] || 0) + 1;
      if (c.category === 'kids_skills') counts['kids'] = (counts['kids'] || 0) + 1;
    });
    return counts;
  }, [courses]);

  const filteredCourses = useMemo(() => {
    const q = search.trim().toLowerCase();
    return courses.filter((c) => {
      // 1. Search Query Filter (deep multi-field search across all courses)
      let matchSearch = true;
      if (q) {
        const titleMatch = c.title.toLowerCase().includes(q);
        const shortMatch = c.short.toLowerCase().includes(q);
        const subMatch = c.subtitle.toLowerCase().includes(q);
        const badgeMatch = (c.badge || '').toLowerCase().includes(q);
        const boardMatch = (c.board || '').toLowerCase().includes(q);
        const medMatch = (c.medium || '').toLowerCase().includes(q);
        const subjMatch = (c.subjects || []).some((s) => s.name.toLowerCase().includes(q));
        const idMatch = c.id.toLowerCase().includes(q.replace(/\s+/g, '-'));

        matchSearch = titleMatch || shortMatch || subMatch || badgeMatch || boardMatch || medMatch || subjMatch || idMatch;
        return matchSearch;
      }

      // 2. Category Tab Filter (applied when no global search is active)
      if (selectedTab === 'tnsb_en') {
        return c.category === 'school_tnsb_en';
      }
      if (selectedTab === 'tnsb_ta') {
        return c.category === 'school_tnsb_ta';
      }
      if (selectedTab === 'cbse') {
        return c.category === 'school_cbse';
      }
      if (selectedTab === 'matric') {
        return c.category === 'school_matric';
      }
      if (selectedTab === 'tnpsc') {
        return c.category === 'tnpsc';
      }
      if (selectedTab === 'upsc') {
        return c.category === 'upsc_central';
      }
      if (selectedTab === 'entrance') {
        return c.category === 'entrance';
      }
      if (selectedTab === 'college') {
        return c.category === 'college_degree' || c.gradeLevel === 'college';
      }
      if (selectedTab === 'skills') {
        return c.category === 'skills' || c.gradeLevel === 'skill';
      }
      if (selectedTab === 'kids') {
        return c.category === 'kids_skills';
      }

      return true;
    });
  }, [courses, search, selectedTab]);

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
              <Text style={styles.sheetTitle}>Select Tuition Program</Text>
              <Text style={styles.sheetSubtitle}>
                {courses.length} Master Programs (LKG to 12th, Boards, Exams & Degrees)
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
              placeholder="Search 7th, CBSE, Matric, TNPSC, Python..."
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
                { key: 'all', label: `All (${tabCounts.all || courses.length})` },
                { key: 'tnsb_en', label: `🎒 TNSB English (${tabCounts.tnsb_en || 0})` },
                { key: 'tnsb_ta', label: `🎒 TNSB தமிழ் வழி (${tabCounts.tnsb_ta || 0})` },
                { key: 'cbse', label: `🎒 CBSE NCERT (${tabCounts.cbse || 0})` },
                { key: 'matric', label: `🎒 Matriculation (${tabCounts.matric || 0})` },
                { key: 'tnpsc', label: `🏛️ TNPSC (${tabCounts.tnpsc || 0})` },
                { key: 'upsc', label: `🏛️ UPSC & Bank (${tabCounts.upsc || 0})` },
                { key: 'entrance', label: `🩺 NEET & JEE (${tabCounts.entrance || 0})` },
                { key: 'college', label: `🎓 Degrees (${tabCounts.college || 0})` },
                { key: 'skills', label: `🚀 Skills & AI (${tabCounts.skills || 0})` },
                { key: 'kids', label: `🎨 Kids Skills (${tabCounts.kids || 0})` },
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
          </View>

          {/* Courses List */}
          <FlatList
            data={filteredCourses}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const isSelected = item.id === selectedCourseId;
              return (
                <TouchableOpacity
                  style={[styles.courseCard, isSelected && styles.courseCardSelected]}
                  onPress={() => {
                    onSelectCourse(item);
                    onClose();
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
                      <Text style={styles.mediumPill}>{item.medium}</Text>
                      <Text style={styles.daysText}>{item.totalDays || 200} Days</Text>
                    </View>
                    <Text style={styles.courseTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.courseSubtitle} numberOfLines={1}>
                      {item.subtitle}
                    </Text>
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
                <Text style={styles.emptySub}>Try searching "7th std", "CBSE", "TNPSC", or "Python"</Text>
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
    paddingRight: 10,
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
    fontWeight: '500',
  },
  sheetSub: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
    fontWeight: '500',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 14,
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 10,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  searchIcon: {
    marginRight: 10,
  },
  clearSearchBtn: {
    padding: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 14,
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 10,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#f8fafc',
    paddingVertical: 0,
  },
  tabsWrapper: {
    paddingVertical: 4,
  },
  tabsRow: {
    paddingHorizontal: 20,
    gap: 8,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  tabPillActive: {
    backgroundColor: '#06b6d4',
    borderColor: '#06b6d4',
  },
  tabPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
  tabPillTextActive: {
    color: '#0B1120',
    fontWeight: '700',
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 4,
  },
  resultsCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 30,
    gap: 10,
  },
  courseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  courseCardSelected: {
    borderColor: '#06b6d4',
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
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
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  mediumPill: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
    backgroundColor: '#1e293b',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  daysText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 3,
  },
  courseSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
  },
  selectedCheck: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#06b6d4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
  },
});
