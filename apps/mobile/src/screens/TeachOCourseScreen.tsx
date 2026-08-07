// @ts-nocheck
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking, SafeAreaView, Modal } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { PlayCircle, ChevronDown, ChevronUp, X } from 'lucide-react-native';
import { WebView } from 'react-native-webview';

export default function TeachOCourseScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { course } = route.params;

  let curriculum: any[] = [];
  try {
    let ai = course.additional_info;
    if (typeof ai === 'string') ai = JSON.parse(ai);
    if (ai && ai.curriculum) {
      curriculum = ai.curriculum;
    }
  } catch (e) {
    console.error('Error parsing curriculum', e);
  }

  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({ 0: true });
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');

  const toggleModule = (index: number) => {
    setExpandedModules(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const openVideo = (url: string) => {
    if (url) {
      let finalUrl = url;
      if (url.includes('youtube.com/watch?v=')) {
        finalUrl = url.replace('watch?v=', 'embed/');
      } else if (url.includes('youtu.be/')) {
        const vidId = url.split('youtu.be/')[1];
        finalUrl = `https://www.youtube.com/embed/${vidId}`;
      }
      setCurrentVideoUrl(finalUrl);
      setVideoModalVisible(true);
    }
  };

  const renderModule = ({ item, index }: { item: any; index: number }) => {
    const isExpanded = !!expandedModules[index];
    const videos = item.videos || [];

    return (
      <View style={styles.moduleCard}>
        <TouchableOpacity style={styles.moduleHeader} onPress={() => toggleModule(index)}>
          <Text style={styles.moduleTitle}>{item.title}</Text>
          {isExpanded ? <ChevronUp color="#a1a1aa" size={20} /> : <ChevronDown color="#a1a1aa" size={20} />}
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.videosContainer}>
            {videos.length === 0 ? (
              <Text style={styles.noVideosText}>No content available for this module.</Text>
            ) : (
              videos.map((vid: any, vIdx: number) => (
                <TouchableOpacity key={vIdx} style={styles.videoItem} onPress={() => openVideo(vid.url)}>
                  <PlayCircle size={20} color="#f59e0b" style={{ marginRight: 12 }} />
                  <Text style={styles.videoTitle}>{vid.title}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.courseTitle}>{course.title_name}</Text>
          <Text style={styles.courseSubtitle}>{curriculum.length} Modules</Text>
        </View>

        <FlatList
          data={curriculum}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderModule}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No curriculum data available for this course.</Text>
            </View>
          }
        />
      </View>

      <Modal visible={videoModalVisible} animationType="slide" transparent={false} onRequestClose={() => setVideoModalVisible(false)}>
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setVideoModalVisible(false)} style={styles.closeBtn}>
              <X color="#fff" size={24} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Content Viewer</Text>
          </View>
          <WebView source={{ uri: currentVideoUrl }} style={styles.webview} allowsFullscreenVideo={true} />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  courseTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  courseSubtitle: {
    color: '#f59e0b',
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  moduleCard: {
    backgroundColor: '#1e1e24',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#27272f',
  },
  moduleTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    paddingRight: 12,
  },
  videosContainer: {
    padding: 16,
  },
  videoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  videoTitle: {
    color: '#e4e4e7',
    fontSize: 14,
    flex: 1,
  },
  noVideosText: {
    color: '#a1a1aa',
    fontSize: 14,
    fontStyle: 'italic',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#a1a1aa',
    fontSize: 16,
    textAlign: 'center',
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#121212',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  closeBtn: {
    padding: 8,
    marginRight: 8,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  }
});
