// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, Linking } from 'react-native';
import { aishleeSupabase } from '../services/aishleeSupabase';
import { useNavigation } from '@react-navigation/native';
import { PlayCircle } from 'lucide-react-native';

export default function TeachOScreen() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await aishleeSupabase
        .from('unified_master_data')
        .select('*')
        .eq('item_type', 'COURSE')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderCourseCard = ({ item }: { item: any }) => {
    let metadata = item.metadata || {};
    if (typeof metadata === 'string') {
      try { metadata = JSON.parse(metadata); } catch(e) {}
    }
    const thumbnailUrl = metadata.thumbnail_url || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=400';
    
    return (
      <View style={styles.card}>
        <Image source={{ uri: thumbnailUrl }} style={styles.thumbnail} />
        <View style={styles.cardContent}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.category || 'General'}</Text>
          </View>
          <Text style={styles.cardTitle}>{item.title_name}</Text>
          <Text style={styles.cardDescription} numberOfLines={2}>
            {item.description_purpose || item.description || 'Learn and excel with TeachO.'}
          </Text>
          <View style={styles.cardFooter}>
            <TouchableOpacity 
              style={styles.watchBtn}
              onPress={() => {
                navigation.navigate('TeachOCourseScreen', { course: item });
              }}
            >
              <PlayCircle size={16} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.watchBtnText}>Watch Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>TeachO</Text>
      <Text style={styles.headerSubtitle}>Masterclass Courses & Tuitions</Text>
      
      <FlatList
        data={courses}
        keyExtractor={(item) => item.id}
        renderItem={renderCourseCard}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No courses available right now.</Text>
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 60,
    marginHorizontal: 20,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#a1a1aa',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#1e1e24',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: 180,
    backgroundColor: '#2d2d2d',
  },
  cardContent: {
    padding: 16,
  },
  badge: {
    backgroundColor: '#f59e0b30',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  badgeText: {
    color: '#fcd34d',
    fontSize: 12,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#a1a1aa',
    marginBottom: 16,
    lineHeight: 20,
  },
  cardFooter: {
    alignItems: 'flex-start',
  },
  watchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f59e0b',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  watchBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyText: {
    color: '#a1a1aa',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  }
});
