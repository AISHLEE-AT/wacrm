import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { aishleeSupabase } from '../services/aishleeSupabase';
import { useNavigation } from '@react-navigation/native';

export default function TestOHubScreen() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      // Fetch up to 2000 tests to ensure we get all of them
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
          try { ai = JSON.parse(ai); } catch(e) {}
        }
        
        // Only include tests that actually have questions
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
        data: groups[key]
      }));

      setSections(formattedSections);
    } catch (err) {
      console.error('Error fetching tests:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderTestCard = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('TestOExamScreen', { testId: item.id, title: item.displayTitle || item.title_name })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.displayTitle || item.title_name}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.questionCount || 0} Qs</Text>
          </View>
        </View>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description_purpose || item.description || 'No description provided.'}
        </Text>
        <View style={styles.cardFooter}>
          <TouchableOpacity 
            style={styles.startBtn}
            onPress={() => navigation.navigate('TestOExamScreen', { testId: item.id, title: item.displayTitle || item.title_name })}
          >
            <Text style={styles.startBtnText}>Start Test</Text>
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
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TestO Assessment Hub</Text>
        <Text style={styles.headerSubtitle}>Master competitive exams with high-yield practice tests</Text>
      </View>

      {/* Guided Path Finder Banner */}
      <TouchableOpacity
        style={styles.guidedBanner}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('FlowQuestionScreen')}
      >
        <View style={styles.guidedBannerLeft}>
          <Text style={styles.guidedBannerBadge}>NEW • AI GUIDED FLOW</Text>
          <Text style={styles.guidedBannerTitle}>Narrow Down Your Test Topic</Text>
          <Text style={styles.guidedBannerDesc}>
            Step-by-step branch navigation to find your exact syllabus mock test.
          </Text>
        </View>
        <View style={styles.guidedBannerArrow}>
          <Text style={styles.guidedBannerArrowText}>→</Text>
        </View>
      </TouchableOpacity>
      
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderTestCard}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No tests available right now.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Dark premium background
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  header: {
    marginTop: 50,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#a1a1aa',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionHeader: {
    backgroundColor: '#121212',
    paddingVertical: 12,
    paddingHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    marginBottom: 12,
    marginTop: 10,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  sectionCount: {
    color: '#a1a1aa',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#1e1e24',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    marginRight: 10,
  },
  badge: {
    backgroundColor: '#8b5cf630',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#c4b5fd',
    fontSize: 12,
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: 14,
    color: '#a1a1aa',
    marginBottom: 16,
    lineHeight: 20,
  },
  cardFooter: {
    alignItems: 'flex-end',
  },
  startBtn: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  startBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyText: {
    color: '#a1a1aa',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  guidedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0f291e',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  guidedBannerLeft: {
    flex: 1,
    marginRight: 12,
  },
  guidedBannerBadge: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 4,
  },
  guidedBannerTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  guidedBannerDesc: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 16,
  },
  guidedBannerArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guidedBannerArrowText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
