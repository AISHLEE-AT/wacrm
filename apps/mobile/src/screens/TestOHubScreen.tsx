import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  TextInput,
} from 'react-native';
import { aishleeSupabase } from '../services/aishleeSupabase';
import { useNavigation } from '@react-navigation/native';
import {
  ChevronLeft,
  Search,
  Award,
  FileCheck2,
  Sparkles,
  ArrowRight,
  Clock,
} from 'lucide-react-native';

export default function TestOHubScreen() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation<any>();

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const { data, error } = await aishleeSupabase
        .from('unified_master_data')
        .select('*')
        .eq('item_type', 'o_test')
        .limit(2000);

      if (error) throw error;

      const groups: Record<string, any[]> = {};

      (data || []).forEach(item => {
        let ai = item.additional_info;
        if (typeof ai === 'string') {
          try {
            ai = JSON.parse(ai);
          } catch (e) {}
        }

        if (ai && ai.questions && ai.questions.length > 0) {
          const title = item.title_name || '';
          let courseName = 'General Tests';
          let testName = title;

          if (title.includes(':')) {
            const parts = title.split(':');
            courseName = parts[0].trim();
            testName = parts.slice(1).join(':').trim();
          }

          item.displayTitle = testName;
          item.questionCount = ai.questions.length;

          if (!groups[courseName]) {
            groups[courseName] = [];
          }
          groups[courseName].push(item);
        }
      });

      const formattedSections = Object.keys(groups).map(key => ({
        title: key,
        data: groups[key],
      }));

      setSections(formattedSections);
    } catch (err) {
      console.error('Error fetching tests:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const q = searchQuery.toLowerCase();

    return sections
      .map(sec => ({
        ...sec,
        data: sec.data.filter(
          (t: any) =>
            (t.displayTitle && t.displayTitle.toLowerCase().includes(q)) ||
            (t.title_name && t.title_name.toLowerCase().includes(q)) ||
            (sec.title && sec.title.toLowerCase().includes(q))
        ),
      }))
      .filter(sec => sec.data.length > 0);
  }, [sections, searchQuery]);

  const renderTestCard = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate('TestOExamScreen', {
            testId: item.id,
            title: item.displayTitle || item.title_name,
          })
        }
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.displayTitle || item.title_name}</Text>
          <View style={styles.badge}>
            <Award size={11} color="#10b981" style={{ marginRight: 4 }} />
            <Text style={styles.badgeText}>{item.questionCount || 0} Qs</Text>
          </View>
        </View>

        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description_purpose ||
            item.description ||
            'Timed examination with instant scorecard analytics & verifiable certificate.'}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.timeInfo}>
            <Clock size={12} color="#64748b" style={{ marginRight: 4 }} />
            <Text style={styles.timeText}>15–30 Mins</Text>
          </View>

          <TouchableOpacity
            style={styles.startBtn}
            onPress={() =>
              navigation.navigate('TestOExamScreen', {
                testId: item.id,
                title: item.displayTitle || item.title_name,
              })
            }
          >
            <FileCheck2 size={14} color="#0a0f1e" style={{ marginRight: 6 }} />
            <Text style={styles.startBtnText}>Start Exam</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section: { title, data } }: any) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionCount}>{data.length} Tests</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#0a0f1e" />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>Loading TestO Exam Hub...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0f1e" />

      {/* Navigation Header */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginHorizontal: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.navTitle}>TestO</Text>
            <View style={styles.eduBadge}>
              <Sparkles size={10} color="#10b981" style={{ marginRight: 3 }} />
              <Text style={styles.eduBadgeText}>Exam Engine</Text>
            </View>
          </View>
          <Text style={styles.navSub}>National Standard Mock Tests & Assessments</Text>
        </View>
      </View>

      {/* Search Filter */}
      <View style={styles.searchBar}>
        <Search size={18} color="#94a3b8" style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Search tests, TNPSC, Banking, NEET, Coding..."
          placeholderTextColor="#64748b"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
      </View>

      <SectionList
        sections={filteredSections}
        keyExtractor={item => item.id}
        renderItem={renderTestCard}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FileCheck2 size={44} color="#334155" style={{ marginBottom: 10 }} />
            <Text style={styles.emptyText}>No mock tests match your search.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0f1e',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0f1e',
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 12,
    fontSize: 14,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backBtn: {
    padding: 4,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
  },
  eduBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b98120',
    borderColor: '#10b98150',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  eduBadgeText: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: 'bold',
  },
  navSub: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 12,
    borderColor: '#1e293b',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
    padding: 0,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    marginBottom: 12,
    marginTop: 10,
  },
  sectionTitle: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  sectionCount: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    marginRight: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b98120',
    borderColor: '#10b98150',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: 'bold',
  },
  cardDescription: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 14,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    color: '#64748b',
    fontSize: 12,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  startBtnText: {
    color: '#0a0f1e',
    fontWeight: 'bold',
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
  },
});

