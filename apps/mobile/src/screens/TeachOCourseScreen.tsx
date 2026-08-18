import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  SafeAreaView,
  StatusBar,
  Modal,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Share,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import {
  PlayCircle,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Sparkles,
  FileText,
  FileCheck2,
  CheckCircle2,
  X,
  BookOpen,
  Network,
  MessageSquare,
  Download,
  Share2,
  Send,
  Lightbulb,
  Check,
} from 'lucide-react-native';
import { geminiToolsService } from '../services/geminiToolsService';

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

  const [activeCourseTab, setActiveCourseTab] = useState<'curriculum' | 'notes' | 'mindmap' | 'forum'>('curriculum');
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({ 0: true });
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({});

  // AI Tutor Modal
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [aiPromptTitle, setAiPromptTitle] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Q&A Forum State
  const [forumQuestion, setForumQuestion] = useState('');
  const [forumPosts, setForumPosts] = useState<any[]>([
    {
      id: '1',
      author: 'Karthik R.',
      question: 'How do we solve chapter problems in under 60 seconds for competitive exams?',
      answer: '🤖 AI Tutor: Focus on identifying the given values first, eliminate options using unit consistency, and memorize the 10 core shortcut formulas.',
      time: '2 hours ago',
    },
    {
      id: '2',
      author: 'Priya S.',
      question: 'Where can I find the official Tamil Nadu State Board solution notes for Unit 2?',
      answer: '🤖 AI Tutor: You can open the "Notes & PDF" tab right here to download the verified PDF summary and formula sheets.',
      time: 'Yesterday',
    },
  ]);
  const [isAskingForum, setIsAskingForum] = useState(false);

  const toggleModule = (index: number) => {
    setExpandedModules(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const toggleLessonComplete = (key: string) => {
    setCompletedLessons(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const openVideo = (url: string) => {
    if (url) {
      Linking.openURL(url).catch(() => alert('Could not open video URL'));
    }
  };

  const handleAskAi = async (promptType: 'explain_tamil' | 'quiz' | 'summary', topicTitle: string) => {
    setAiModalVisible(true);
    setAiLoading(true);
    setAiResponse('');

    let prompt = '';
    if (promptType === 'explain_tamil') {
      setAiPromptTitle(`எளிய விளக்கம்: ${topicTitle}`);
      prompt = `Course: "${course.title_name}". Topic: "${topicTitle}". Please explain this topic clearly in simple Tamil (தமிழ்) with real-world examples and 3 key takeaways.`;
    } else if (promptType === 'quiz') {
      setAiPromptTitle(`5 Quick Practice MCQs: ${topicTitle}`);
      prompt = `Course: "${course.title_name}". Topic: "${topicTitle}". Create 5 high-yield multiple-choice questions (MCQs) with 4 options (A, B, C, D), the correct answer marked clearly, and a brief explanation in Tamil & English.`;
    } else {
      setAiPromptTitle(`Summary & Notes: ${topicTitle}`);
      prompt = `Course: "${course.title_name}". Topic: "${topicTitle}". Provide comprehensive study revision notes, formulas/concepts, and a bullet-point summary.`;
    }

    try {
      const res = await geminiToolsService.executePrompt(prompt);
      setAiResponse(res.text || 'Could not generate explanation. Please check your Gemini API key in Profile.');
    } catch (e: any) {
      setAiResponse(`Error generating explanation: ${e.message || e}`);
    } finally {
      setAiLoading(false);
    }
  };

  const generateAndSharePDF = async (title: string, content: string) => {
    try {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 24px; color: #1e293b; line-height: 1.6; }
            .header { border-bottom: 3px solid #10b981; padding-bottom: 12px; margin-bottom: 20px; }
            .badge { display: inline-block; background: #ecfdf5; color: #059669; font-weight: bold; font-size: 11px; padding: 4px 10px; border-radius: 6px; border: 1px solid #10b981; text-transform: uppercase; margin-bottom: 6px; }
            h1 { color: #0f172a; margin: 0; font-size: 20px; }
            .meta { color: #64748b; font-size: 12px; margin-top: 4px; }
            .content { white-space: pre-wrap; font-size: 13px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 10px; margin-top: 15px; }
            .footer { margin-top: 25px; border-top: 1px solid #e2e8f0; padding-top: 10px; font-size: 11px; color: #94a3b8; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <span class="badge">EduVerse AI Verified Study Document</span>
            <h1>${title}</h1>
            <div class="meta">Course: ${course.title_name} • Date: ${new Date().toLocaleDateString()}</div>
          </div>
          <div class="content">${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          <div class="footer">
            Generated via SuprO TeachO LMS • Digital Learning Platform
          </div>
        </body>
        </html>
      `;
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      } else {
        Share.share({ message: `${title}\n\n${content}` });
      }
    } catch (e: any) {
      Share.share({ message: `${title}\n\n${content}` });
    }
  };

  const handlePostForumQuestion = async () => {
    if (!forumQuestion.trim()) return;
    setIsAskingForum(true);

    const newQuestion = forumQuestion.trim();
    setForumQuestion('');

    const prompt = `Student asked a question in the course "${course.title_name}":
Question: "${newQuestion}"
Provide a concise, helpful, and encouraging educational response in Tamil and English with practical steps.`;

    try {
      const res = await geminiToolsService.executePrompt(prompt);
      const aiReply = res.text || 'Thank you for your question! Your instructor and peers will also review it.';
      setForumPosts(prev => [
        {
          id: Date.now().toString(),
          author: 'You (Student)',
          question: newQuestion,
          answer: `🤖 AI Tutor: ${aiReply}`,
          time: 'Just now',
        },
        ...prev,
      ]);
    } catch (e) {
      setForumPosts(prev => [
        {
          id: Date.now().toString(),
          author: 'You (Student)',
          question: newQuestion,
          answer: 'Question posted to discussion board. AI Tutor will answer shortly.',
          time: 'Just now',
        },
        ...prev,
      ]);
    } finally {
      setIsAskingForum(false);
    }
  };

  const renderCurriculum = () => (
    <FlatList
      data={curriculum}
      keyExtractor={(_, index) => index.toString()}
      contentContainerStyle={styles.listContainer}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No curriculum modules uploaded for this course yet.</Text>
        </View>
      }
      renderItem={({ item, index }) => {
        const isExpanded = !!expandedModules[index];
        const videos = item.videos || [];

        return (
          <View style={styles.moduleCard}>
            <TouchableOpacity style={styles.moduleHeader} onPress={() => toggleModule(index)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.moduleIndex}>CHAPTER {index + 1}</Text>
                <Text style={styles.moduleTitle}>{item.title}</Text>
              </View>
              {isExpanded ? <ChevronUp color="#10b981" size={22} /> : <ChevronDown color="#94a3b8" size={22} />}
            </TouchableOpacity>

            {isExpanded && (
              <View style={styles.videosContainer}>
                {videos.length === 0 ? (
                  <Text style={styles.noVideosText}>No lessons uploaded for this chapter yet.</Text>
                ) : (
                  videos.map((vid: any, vIdx: number) => {
                    const lessonKey = `${index}-${vIdx}`;
                    const isDone = !!completedLessons[lessonKey];

                    return (
                      <View key={vIdx} style={styles.lessonRow}>
                        <TouchableOpacity
                          style={styles.checkCircle}
                          onPress={() => toggleLessonComplete(lessonKey)}
                        >
                          <CheckCircle2 size={20} color={isDone ? '#10b981' : '#475569'} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.lessonContent} onPress={() => openVideo(vid.url)}>
                          <PlayCircle size={20} color="#10b981" style={{ marginRight: 10 }} />
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.videoTitle, isDone && styles.videoTitleDone]}>{vid.title}</Text>
                            <Text style={styles.lessonMeta}>Video Lecture • Full HD</Text>
                          </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.aiHelpPill}
                          onPress={() => handleAskAi('explain_tamil', vid.title)}
                        >
                          <Sparkles size={12} color="#f59e0b" style={{ marginRight: 4 }} />
                          <Text style={styles.aiHelpText}>AI</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })
                )}

                <View style={styles.chapterFooter}>
                  <TouchableOpacity
                    style={styles.chapterTestBtn}
                    onPress={() => navigation.navigate('TestOHubScreen')}
                  >
                    <FileCheck2 size={16} color="#0a0f1e" style={{ marginRight: 6 }} />
                    <Text style={styles.chapterTestText}>Take Chapter Practice Test</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        );
      }}
    />
  );

  const renderNotesAndPDFs = () => (
    <ScrollView style={styles.tabContent} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.notesHero}>
        <FileText size={22} color="#10b981" style={{ marginBottom: 6 }} />
        <Text style={styles.notesHeroTitle}>Verified Digital Study Notes & PDFs</Text>
        <Text style={styles.notesHeroSub}>High-yield revision notes, formula sheets, and chapter summaries.</Text>
      </View>

      {(curriculum.length > 0 ? curriculum : [{ title: 'Chapter 1: Complete Fundamentals & Core Concepts' }]).map((chap: any, idx: number) => (
        <View key={idx} style={styles.pdfCard}>
          <View style={styles.pdfCardHeader}>
            <View style={styles.pdfIconBox}>
              <FileText size={20} color="#38bdf8" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.pdfTitle}>{chap.title || `Chapter ${idx + 1} Study Notes`}</Text>
              <Text style={styles.pdfMeta}>PDF Document • Complete Formulas & Theory</Text>
            </View>
          </View>

          <View style={styles.pdfActionsRow}>
            <TouchableOpacity
              style={styles.pdfActionBtn}
              onPress={() => handleAskAi('summary', chap.title || course.title_name)}
            >
              <Sparkles size={13} color="#10b981" style={{ marginRight: 4 }} />
              <Text style={styles.pdfActionText}>Instant Summary</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.pdfActionBtn, { backgroundColor: '#10b981' }]}
              onPress={() => handleAskAi('explain_tamil', chap.title || course.title_name)}
            >
              <Download size={13} color="#0a0f1e" style={{ marginRight: 4 }} />
              <Text style={[styles.pdfActionText, { color: '#0a0f1e', fontWeight: 'bold' }]}>Download Notes</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderMindMaps = () => (
    <ScrollView style={styles.tabContent} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.mindMapHero}>
        <Network size={22} color="#a855f7" style={{ marginBottom: 6 }} />
        <Text style={styles.mindMapHeroTitle}>Visual Concept & Mind Map Graph</Text>
        <Text style={styles.mindMapHeroSub}>Accelerated memory retention through structured concept node hierarchies.</Text>
      </View>

      <View style={styles.conceptCard}>
        <Text style={styles.conceptNodeTitle}>🎯 Core Theme</Text>
        <Text style={styles.conceptNodeText}>{course.title_name}</Text>
      </View>

      <View style={styles.mindMapGrid}>
        <View style={styles.mindMapNode}>
          <View style={[styles.nodeBadge, { backgroundColor: '#3b82f620', borderColor: '#3b82f6' }]}>
            <Text style={[styles.nodeBadgeText, { color: '#3b82f6' }]}>BRANCH 1</Text>
          </View>
          <Text style={styles.nodeTitle}>Key Principles & Axioms</Text>
          <Text style={styles.nodeDesc}>Fundamental definitions, laws, and structural foundation.</Text>
        </View>

        <View style={styles.mindMapNode}>
          <View style={[styles.nodeBadge, { backgroundColor: '#10b98120', borderColor: '#10b981' }]}>
            <Text style={[styles.nodeBadgeText, { color: '#10b981' }]}>BRANCH 2</Text>
          </View>
          <Text style={styles.nodeTitle}>Formulas & Shortcuts</Text>
          <Text style={styles.nodeDesc}>Standard derivation formulas, constants, and speed techniques.</Text>
        </View>

        <View style={styles.mindMapNode}>
          <View style={[styles.nodeBadge, { backgroundColor: '#f59e0b20', borderColor: '#f59e0b' }]}>
            <Text style={[styles.nodeBadgeText, { color: '#f59e0b' }]}>BRANCH 3</Text>
          </View>
          <Text style={styles.nodeTitle}>Problem Patterns</Text>
          <Text style={styles.nodeDesc}>Previous year exam questions (PYQs) and high-yield MCQ types.</Text>
        </View>

        <View style={styles.mindMapNode}>
          <View style={[styles.nodeBadge, { backgroundColor: '#a855f720', borderColor: '#a855f7' }]}>
            <Text style={[styles.nodeBadgeText, { color: '#a855f7' }]}>BRANCH 4</Text>
          </View>
          <Text style={styles.nodeTitle}>Self-Assessment</Text>
          <Text style={styles.nodeDesc}>Chapter practice tests and speed accuracy checks.</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.generateMapBtn}
        onPress={() => handleAskAi('summary', `Visual Concept Mind Map Breakdown for: ${course.title_name}`)}
      >
        <Sparkles size={16} color="#0a0f1e" style={{ marginRight: 6 }} />
        <Text style={styles.generateMapText}>Generate AI Visual Mind Map Notes</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderForum = () => (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.tabContent} contentContainerStyle={{ paddingBottom: 80 }}>
        <View style={styles.forumHeader}>
          <MessageSquare size={20} color="#10b981" style={{ marginBottom: 4 }} />
          <Text style={styles.forumTitle}>Doubt & Discussion Forum</Text>
          <Text style={styles.forumSub}>Ask questions and get instant solutions from AI Tutor & peers.</Text>
        </View>

        {forumPosts.map(post => (
          <View key={post.id} style={styles.forumCard}>
            <View style={styles.forumCardTop}>
              <Text style={styles.forumAuthor}>{post.author}</Text>
              <Text style={styles.forumTime}>{post.time}</Text>
            </View>
            <Text style={styles.forumQuestion}>{post.question}</Text>
            <View style={styles.forumAnswerBox}>
              <Text style={styles.forumAnswer}>{post.answer}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Forum Bottom Ask Bar */}
      <View style={styles.forumInputBar}>
        <TextInput
          placeholder="Ask a doubt or formula question..."
          placeholderTextColor="#64748b"
          value={forumQuestion}
          onChangeText={setForumQuestion}
          style={styles.forumInput}
        />
        <TouchableOpacity
          style={styles.forumSendBtn}
          disabled={isAskingForum}
          onPress={handlePostForumQuestion}
        >
          {isAskingForum ? (
            <ActivityIndicator size="small" color="#0a0f1e" />
          ) : (
            <Send size={16} color="#0a0f1e" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0f1e" />
      <View style={styles.container}>
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ChevronLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <View style={{ flex: 1, marginHorizontal: 12 }}>
            <Text style={styles.navCategory}>{course.category || 'Masterclass Course'}</Text>
            <Text style={styles.navTitle} numberOfLines={1}>
              {course.title_name}
            </Text>
          </View>
        </View>

        {/* Course Header Bar */}
        <View style={styles.courseHeader}>
          <Text style={styles.courseTitle}>{course.title_name}</Text>
          <Text style={styles.courseSubtitle}>
            {curriculum.length} Chapters • Verified Syllabus
          </Text>

          {/* Quick AI Action Pills */}
          <View style={styles.aiActionBar}>
            <TouchableOpacity
              style={styles.aiActionPill}
              onPress={() => handleAskAi('explain_tamil', course.title_name)}
            >
              <Sparkles size={13} color="#10b981" style={{ marginRight: 5 }} />
              <Text style={styles.aiActionText}>தமிழில் விளக்கம்</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.aiActionPill}
              onPress={() => handleAskAi('quiz', course.title_name)}
            >
              <FileCheck2 size={13} color="#38bdf8" style={{ marginRight: 5 }} />
              <Text style={styles.aiActionText}>5 Practice MCQs</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.aiActionPill}
              onPress={() => handleAskAi('summary', course.title_name)}
            >
              <FileText size={13} color="#f59e0b" style={{ marginRight: 5 }} />
              <Text style={styles.aiActionText}>Summary Notes</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Course Player Sub-Tabs */}
        <View style={styles.subTabContainer}>
          <TouchableOpacity
            style={[styles.subTabBtn, activeCourseTab === 'curriculum' && styles.subTabBtnActive]}
            onPress={() => setActiveCourseTab('curriculum')}
          >
            <BookOpen size={13} color={activeCourseTab === 'curriculum' ? '#0a0f1e' : '#94a3b8'} style={{ marginRight: 4 }} />
            <Text style={[styles.subTabText, activeCourseTab === 'curriculum' && styles.subTabTextActive]}>Curriculum</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTabBtn, activeCourseTab === 'notes' && styles.subTabBtnActive]}
            onPress={() => setActiveCourseTab('notes')}
          >
            <FileText size={13} color={activeCourseTab === 'notes' ? '#0a0f1e' : '#94a3b8'} style={{ marginRight: 4 }} />
            <Text style={[styles.subTabText, activeCourseTab === 'notes' && styles.subTabTextActive]}>Notes & PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTabBtn, activeCourseTab === 'mindmap' && styles.subTabBtnActive]}
            onPress={() => setActiveCourseTab('mindmap')}
          >
            <Network size={13} color={activeCourseTab === 'mindmap' ? '#0a0f1e' : '#94a3b8'} style={{ marginRight: 4 }} />
            <Text style={[styles.subTabText, activeCourseTab === 'mindmap' && styles.subTabTextActive]}>Mind Map</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTabBtn, activeCourseTab === 'forum' && styles.subTabBtnActive]}
            onPress={() => setActiveCourseTab('forum')}
          >
            <MessageSquare size={13} color={activeCourseTab === 'forum' ? '#0a0f1e' : '#94a3b8'} style={{ marginRight: 4 }} />
            <Text style={[styles.subTabText, activeCourseTab === 'forum' && styles.subTabTextActive]}>Q&A Forum</Text>
          </TouchableOpacity>
        </View>

        {/* Active Tab Body */}
        {activeCourseTab === 'curriculum' && renderCurriculum()}
        {activeCourseTab === 'notes' && renderNotesAndPDFs()}
        {activeCourseTab === 'mindmap' && renderMindMaps()}
        {activeCourseTab === 'forum' && renderForum()}

        {/* AI Tutor Bottom Sheet Modal */}
        <Modal
          visible={aiModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setAiModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Sparkles size={18} color="#10b981" style={{ marginRight: 8 }} />
                  <Text style={styles.modalTitle} numberOfLines={1}>
                    {aiPromptTitle || 'EduVerse AI Tutor'}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setAiModalVisible(false)} style={styles.closeBtn}>
                  <X size={20} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                {aiLoading ? (
                  <View style={styles.modalLoading}>
                    <ActivityIndicator size="large" color="#10b981" />
                    <Text style={styles.modalLoadingText}>Gemini AI is analyzing topic and drafting explanations...</Text>
                  </View>
                ) : (
                  <Text style={styles.modalResponseText}>{aiResponse}</Text>
                )}
              </ScrollView>

              {!aiLoading && aiResponse ? (
                <View style={{ flexDirection: 'row', padding: 16, backgroundColor: '#111827', borderTopWidth: 1, borderTopColor: '#1e293b', gap: 10 }}>
                  <TouchableOpacity
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#10b981', paddingVertical: 12, borderRadius: 12 }}
                    onPress={() => generateAndSharePDF(aiPromptTitle || course.title_name, aiResponse)}
                  >
                    <Download size={16} color="#0a0f1e" style={{ marginRight: 6 }} />
                    <Text style={{ color: '#0a0f1e', fontWeight: 'bold', fontSize: 13 }}>Export PDF Document</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1e293b', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#334155' }}
                    onPress={() => Share.share({ message: `${aiPromptTitle}\n\n${aiResponse}` })}
                  >
                    <Share2 size={16} color="#38bdf8" />
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0f1e',
  },
  container: {
    flex: 1,
    backgroundColor: '#0a0f1e',
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
  navCategory: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  courseHeader: {
    backgroundColor: '#111827',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  courseSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 12,
  },
  aiActionBar: {
    flexDirection: 'row',
    gap: 8,
  },
  aiActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0f1e',
    borderColor: '#1e293b',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  aiActionText: {
    color: '#e2e8f0',
    fontSize: 11,
    fontWeight: '600',
  },
  subTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  subTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  subTabBtnActive: {
    backgroundColor: '#10b981',
  },
  subTabText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  subTabTextActive: {
    color: '#0a0f1e',
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  moduleCard: {
    backgroundColor: '#111827',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 12,
    overflow: 'hidden',
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  moduleIndex: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#10b981',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  moduleTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  videosContainer: {
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    padding: 12,
    backgroundColor: '#0c1322',
  },
  noVideosText: {
    color: '#64748b',
    fontSize: 13,
    textAlign: 'center',
    marginVertical: 8,
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  checkCircle: {
    paddingRight: 8,
  },
  lessonContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e2e8f0',
  },
  videoTitleDone: {
    color: '#64748b',
    textDecorationLine: 'line-through',
  },
  lessonMeta: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  aiHelpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f59e0b20',
    borderColor: '#f59e0b50',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 6,
  },
  aiHelpText: {
    color: '#f59e0b',
    fontSize: 10,
    fontWeight: 'bold',
  },
  chapterFooter: {
    marginTop: 6,
  },
  chapterTestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 8,
    borderRadius: 8,
  },
  chapterTestText: {
    color: '#0a0f1e',
    fontWeight: 'bold',
    fontSize: 12,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
  },
  notesHero: {
    backgroundColor: '#111827',
    borderRadius: 16,
    borderColor: '#1e293b',
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
    alignItems: 'center',
  },
  notesHeroTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notesHeroSub: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
  },
  pdfCard: {
    backgroundColor: '#111827',
    borderRadius: 14,
    borderColor: '#1e293b',
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  pdfCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pdfIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#38bdf820',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pdfTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  pdfMeta: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 2,
  },
  pdfActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  pdfActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pdfActionText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '600',
  },
  mindMapHero: {
    backgroundColor: '#111827',
    borderRadius: 16,
    borderColor: '#1e293b',
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
    alignItems: 'center',
  },
  mindMapHeroTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  mindMapHeroSub: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
  },
  conceptCard: {
    backgroundColor: '#111827',
    borderRadius: 14,
    borderColor: '#10b981',
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 12,
  },
  conceptNodeTitle: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  conceptNodeText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  mindMapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  mindMapNode: {
    width: '48%',
    backgroundColor: '#111827',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 12,
  },
  nodeBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 6,
  },
  nodeBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  nodeTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  nodeDesc: {
    color: '#94a3b8',
    fontSize: 11,
    lineHeight: 15,
  },
  generateMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  generateMapText: {
    color: '#0a0f1e',
    fontSize: 13,
    fontWeight: 'bold',
  },
  forumHeader: {
    backgroundColor: '#111827',
    borderRadius: 16,
    borderColor: '#1e293b',
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
    alignItems: 'center',
  },
  forumTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  forumSub: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
  forumCard: {
    backgroundColor: '#111827',
    borderRadius: 14,
    borderColor: '#1e293b',
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  forumCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  forumAuthor: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: 'bold',
  },
  forumTime: {
    color: '#64748b',
    fontSize: 10,
  },
  forumQuestion: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  forumAnswerBox: {
    backgroundColor: '#0a0f1e',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 10,
  },
  forumAnswer: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18,
  },
  forumInputBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  forumInput: {
    flex: 1,
    backgroundColor: '#0a0f1e',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    color: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    marginRight: 8,
  },
  forumSendBtn: {
    backgroundColor: '#10b981',
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#111827',
    height: '75%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    paddingBottom: 14,
    marginBottom: 16,
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 4,
  },
  modalBody: {
    flex: 1,
  },
  modalLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  modalLoadingText: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center',
  },
  modalResponseText: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 22,
  },
});
