import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
  TextInput,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  BookOpen,
  Zap,
  Edit3,
  CheckCircle2,
  HelpCircle,
  FileText,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Award,
  ExternalLink,
  Maximize2,
  Minimize2,
} from 'lucide-react-native';
import {
  CoursePlayerContent,
  getCoursePlayerContent,
} from '../lib/coursePlayerEngine';

const { width } = Dimensions.get('window');

interface TeachOCoursePlayerModalProps {
  visible: boolean;
  onClose: () => void;
  topicTitle: string;
  subject: string;
  courseTitle: string;
  dayNumber: number;
  onCompleteTask: (earnedXp: number) => void;
}

type PlayerTab = 'video' | 'notes' | 'oneline' | 'blanks' | 'mcq' | 'twoFiveMark' | 'essay' | 'bookback' | 'solved' | 'diagrams';

function getEducationalFallbackVideoId(topic: string, subject: string): { videoId: string; title: string } {
  const t = (topic || '').toLowerCase();
  const s = (subject || '').toLowerCase();

  // 1. Primary EVS & Sense Organs / Body Parts (Class 1 to 5)
  if (
    t.includes('sense') ||
    t.includes('body') ||
    t.includes('five senses') ||
    t.includes('plant') ||
    t.includes('animal') ||
    t.includes('water') ||
    t.includes('organ') ||
    t.includes('புலன்') ||
    t.includes('உடல்') ||
    s.includes('evs') ||
    s.includes('environmental') ||
    s.includes('சூழ்நிலையியல்')
  ) {
    return {
      videoId: 'q1xNuU7gaAQ',
      title: `${topic} - 5 Senses & Science Masterclass`
    };
  }

  // 2. Primary Phonics & Alphabet Sounds
  if (
    t.includes('phonic') ||
    t.includes('alphabet') ||
    t.includes('letter') ||
    t.includes('cvc') ||
    t.includes('sight word') ||
    t.includes('rhyme')
  ) {
    return {
      videoId: 'BELlZKpi1Zs',
      title: `${topic} - Phonics & Alphabet Masterclass`
    };
  }

  // 3. Primary Counting & Number Magic
  if (
    t.includes('counting') ||
    t.includes('number magic') ||
    t.includes('1 to 20') ||
    t.includes('addition') ||
    t.includes('subtraction') ||
    t.includes('shapes') ||
    t.includes('எண்') ||
    t.includes('எளிய கணிதம்')
  ) {
    return {
      videoId: 'igcoDFokKzM',
      title: `${topic} - Number Counting & Magic Math`
    };
  }

  // 4. Tamil Basics & உயிர் எழுத்துகள்
  if (
    t.includes('உயிர்') ||
    t.includes('அ முதல் ஔ') ||
    t.includes('ஆத்திசூடி') ||
    t.includes('மெய் எழுத்து')
  ) {
    return {
      videoId: '_sF-D_oN-2Y',
      title: `${topic} - தமிழ் உயிர் எழுத்துக்கள் 12`
    };
  }

  // 5. Tamil Literature & Grammar (Thirukkural, Silappathikaram)
  if (
    t.includes('திருக்குறள்') ||
    t.includes('thirukkural') ||
    t.includes('தமிழ்') ||
    s.includes('தமிழ்') ||
    s.includes('செய்யுள்') ||
    t.includes('இலக்கணம்') ||
    t.includes('உரைநடை')
  ) {
    return {
      videoId: 'EpdTHQ0s6oM',
      title: `${topic} - Samacheer Tamil & TNPSC Masterclass`
    };
  }

  // 6. Indian Polity & Constitution (Articles 14-32, Writs, Fundamental Rights)
  if (
    t.includes('polity') ||
    t.includes('அரசியலமைப்பு') ||
    s.includes('polity') ||
    s.includes('அரசியலமைப்பு') ||
    t.includes('rights') ||
    t.includes('art 14') ||
    t.includes('உரிமைகள்')
  ) {
    return {
      videoId: 'LgCg_1yP6_M',
      title: `${topic} - Indian Polity & Constitution Masterclass`
    };
  }

  // 7. Mathematics & Quantitative Aptitude (Algebra, Geometry, Vedic Maths)
  if (
    t.includes('math') ||
    t.includes('கணிதம்') ||
    t.includes('வட்டி') ||
    t.includes('interest') ||
    t.includes('algebra') ||
    s.includes('கணிதம்') ||
    t.includes('aptitude') ||
    t.includes('திறனறிவு') ||
    t.includes('vedic')
  ) {
    return {
      videoId: 'CsJboyHUTlI',
      title: `${topic} - Quantitative Aptitude & Mathematics Tricks`
    };
  }

  // 8. Science (Optics, Light, Physics, Chemistry, Biology, Motion)
  if (
    t.includes('science') ||
    t.includes('அறிவியல்') ||
    t.includes('optics') ||
    t.includes('ஒளியியல்') ||
    t.includes('physics') ||
    t.includes('chemistry') ||
    s.includes('அறிவியல்') ||
    t.includes('motion') ||
    t.includes('விசை')
  ) {
    return {
      videoId: 'ia9XqGuXimc',
      title: `${topic} - Science & Physics Deep-Dive Masterclass`
    };
  }

  // 9. History & Freedom Struggle (1857 Revolt, National Movement)
  if (
    t.includes('history') ||
    t.includes('வரலாறு') ||
    t.includes('1857') ||
    t.includes('revolt') ||
    t.includes('nationalist') ||
    s.includes('history') ||
    s.includes('வரலாறு')
  ) {
    return {
      videoId: '4FVGKkMjSRU',
      title: `${topic} - Indian Freedom Struggle & History Masterclass`
    };
  }

  // 10. Technology, Programming, Full-Stack & AI
  if (
    t.includes('python') ||
    t.includes('code') ||
    t.includes('developer') ||
    t.includes('react') ||
    t.includes('tech') ||
    s.includes('skill') ||
    t.includes('scratch')
  ) {
    return {
      videoId: 'fBNz5xF-Kx4',
      title: `${topic} - Programming & Technical Masterclass`
    };
  }

  // General Educational Default
  return {
    videoId: 'q1xNuU7gaAQ',
    title: `${topic} - Complete Educational Masterclass`
  };
}

export default function TeachOCoursePlayerModal({
  visible,
  onClose,
  topicTitle,
  subject,
  courseTitle,
  dayNumber,
  onCompleteTask,
}: TeachOCoursePlayerModalProps) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<PlayerTab>('video');
  const [content, setContent] = useState<CoursePlayerContent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const webViewRef = useRef<WebView>(null);

  // Interactive MCQ & Card States
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});
  const [revealedBlanks, setRevealedBlanks] = useState<Record<number, boolean>>({});
  const [revealedQnA, setRevealedQnA] = useState<Record<number, boolean>>({});
  const [expanded2M, setExpanded2M] = useState<Record<number, boolean>>({});
  const [expanded5M, setExpanded5M] = useState<Record<number, boolean>>({});

  // Admin Video Mapping State
  const [isAdminVideoOpen, setIsAdminVideoOpen] = useState<boolean>(false);
  const [customVideoInput, setCustomVideoInput] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [isFullscreenVideo, setIsFullscreenVideo] = useState<boolean>(false);

  useEffect(() => {
    if (visible && topicTitle) {
      setLoading(true);
      getCoursePlayerContent(topicTitle, subject, courseTitle, dayNumber, false)
        .then((res) => {
          setContent(res);
          setLoading(false);
        })
        .catch(() => {
          setContent(null);
          setLoading(false);
        });
    }
  }, [visible, topicTitle, subject, courseTitle, dayNumber]);

  const handleGenerateAiOnDemand = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await getCoursePlayerContent(topicTitle, subject, courseTitle, dayNumber, true);
      if (res) {
        setContent(res);
      } else {
        Alert.alert('Notice', 'Express AI content generation is currently busy. Please try again in a few moments.');
      }
    } catch (e) {
      Alert.alert('Notice', 'AI generation request failed.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data && data.type === 'YT_STATE') {
        if (data.state === 1) {
          setIsPlaying(true);
        } else if (data.state === 2 || data.state === 0) {
          setIsPlaying(false);
        }
      }
    } catch (e) {}
  };

  const handlePlayPause = () => {
    if (webViewRef.current) {
      if (isPlaying) {
        webViewRef.current.injectJavaScript(`
          if (typeof window.pauseAppVideo === 'function') {
            window.pauseAppVideo();
          }
          true;
        `);
        setIsPlaying(false);
      } else {
        webViewRef.current.injectJavaScript(`
          if (typeof window.playAppVideo === 'function') {
            window.playAppVideo();
          }
          true;
        `);
        setIsPlaying(true);
      }
    }
  };

  const handleRestart = () => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        if (typeof window.restartAppVideo === 'function') {
          window.restartAppVideo();
        }
        true;
      `);
      setIsPlaying(true);
    }
  };

  const handleSaveCustomVideo = () => {
    let vid = customVideoInput.trim();
    if (!vid) return;

    if (vid.includes('youtu.be/')) {
      vid = vid.split('youtu.be/')[1].split('?')[0];
    } else if (vid.includes('youtube.com/watch?v=')) {
      vid = vid.split('v=')[1].split('&')[0];
    } else if (vid.includes('youtube.com/embed/')) {
      vid = vid.split('embed/')[1].split('?')[0];
    }

    if (content) {
      setContent({
        ...content,
        videoMeta: {
          ...content.videoMeta,
          youtubeVideoId: vid,
          videoTitle: `${topicTitle} Official Masterclass | @aishleetechnology`
        }
      });
      setIsAdminVideoOpen(false);
      setCustomVideoInput('');
      Alert.alert('Official Video Mapped! 🎥', `Topic "${topicTitle}" is now bound to YouTube Video ID: ${vid}`);
    }
  };

  const handleFinish = () => {
    onCompleteTask(20);
    Alert.alert(
      'Topic Completed! 🎉',
      `You earned +20 XP!\nDay ${dayNumber} task marked complete. The next day has been unlocked in your Roadmap!`
    );
    onClose();
  };

  if (!visible) return null;

  const rawVid = content?.videoMeta?.youtubeVideoId;
  const fallbackInfo = getEducationalFallbackVideoId(topicTitle, subject);
  const activeVideoId = (rawVid && rawVid.length === 11 && rawVid !== 'dQw4w9WgXcQ') 
    ? rawVid 
    : fallbackInfo.videoId;

  const videoSrc = `https://www.youtube-nocookie.com/embed/${activeVideoId}?enablejsapi=1&playsinline=1&controls=1&rel=0&modestbranding=1&fs=1`;

  // Clean, Ad-Free In-App Embed HTML (No suggested videos, no branding, no external redirects)
  const embedHtml = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          html, body {
            background-color: #000000;
            width: 100%;
            height: 100%;
            overflow: hidden;
          }
          iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: 0;
          }
        </style>
      </head>
      <body>
        <div id="ytplayer"></div>
        <script src="https://www.youtube.com/iframe_api"></script>
        <script>
          var player;
          function onYouTubeIframeAPIReady() {
            player = new YT.Player('ytplayer', {
              height: '100%',
              width: '100%',
              videoId: '${activeVideoId}',
              playerVars: {
                playsinline: 1,
                controls: 1,
                rel: 0,
                modestbranding: 1,
                fs: 1
              },
              events: {
                'onStateChange': onPlayerStateChange
              }
            });
          }

          function onPlayerStateChange(event) {
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'YT_STATE',
                state: event.data
              }));
            }
          }

          window.playAppVideo = function() {
            if (player && typeof player.playVideo === 'function') {
              player.playVideo();
            }
          };
          window.pauseAppVideo = function() {
            if (player && typeof player.pauseVideo === 'function') {
              player.pauseVideo();
            }
          };
          window.restartAppVideo = function() {
            if (player && typeof player.seekTo === 'function') {
              player.seekTo(0, true);
              player.playVideo();
            }
          };
        </script>
      </body>
    </html>
  `;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0B1120" />

        {/* ─── 1. TOP HEADER ────────────────────────────────────────────── */}
        <View style={[styles.header, { paddingTop: Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0) + 8 }]}>
          <View style={styles.headerLeft}>
            <View style={styles.badgeRow}>
              <View style={styles.subjectBadge}>
                <Text style={styles.subjectBadgeText}>{subject || 'Academic'}</Text>
              </View>
              <View style={styles.dayBadge}>
                <Text style={styles.dayBadgeText}>Day {dayNumber}</Text>
              </View>
            </View>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {topicTitle || 'Micro-Topic Masterclass'}
            </Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {courseTitle}
            </Text>
          </View>

          <View style={styles.headerRight}>
            <View style={styles.xpPill}>
              <Sparkles size={14} color="#fbbf24" />
              <Text style={styles.xpPillText}>+20 XP</Text>
            </View>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={onClose}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              activeOpacity={0.7}
              accessibilityLabel="Close Player"
            >
              <X size={22} color="#f8fafc" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── 2. TAB NAVIGATION BAR ────────────────────────────────────── */}
        <View style={styles.tabBarContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'video' && styles.tabButtonActive]}
              onPress={() => setActiveTab('video')}
            >
              <Play size={14} color={activeTab === 'video' ? '#06b6d4' : '#94a3b8'} />
              <Text style={[styles.tabButtonText, activeTab === 'video' && styles.tabButtonTextActive]}>
                In-App Video
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'notes' && styles.tabButtonActive]}
              onPress={() => setActiveTab('notes')}
            >
              <BookOpen size={14} color={activeTab === 'notes' ? '#06b6d4' : '#94a3b8'} />
              <Text style={[styles.tabButtonText, activeTab === 'notes' && styles.tabButtonTextActive]}>
                Study Notes
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'oneline' && styles.tabButtonActive]}
              onPress={() => setActiveTab('oneline')}
            >
              <Zap size={14} color={activeTab === 'oneline' ? '#06b6d4' : '#94a3b8'} />
              <Text style={[styles.tabButtonText, activeTab === 'oneline' && styles.tabButtonTextActive]}>
                1-Line Q&A
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'blanks' && styles.tabButtonActive]}
              onPress={() => setActiveTab('blanks')}
            >
              <Edit3 size={14} color={activeTab === 'blanks' ? '#06b6d4' : '#94a3b8'} />
              <Text style={[styles.tabButtonText, activeTab === 'blanks' && styles.tabButtonTextActive]}>
                Fill Blanks
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'mcq' && styles.tabButtonActive]}
              onPress={() => setActiveTab('mcq')}
            >
              <HelpCircle size={14} color={activeTab === 'mcq' ? '#06b6d4' : '#94a3b8'} />
              <Text style={[styles.tabButtonText, activeTab === 'mcq' && styles.tabButtonTextActive]}>
                MCQ Drill
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'twoFiveMark' && styles.tabButtonActive]}
              onPress={() => setActiveTab('twoFiveMark')}
            >
              <FileText size={14} color={activeTab === 'twoFiveMark' ? '#06b6d4' : '#94a3b8'} />
              <Text style={[styles.tabButtonText, activeTab === 'twoFiveMark' && styles.tabButtonTextActive]}>
                2M & 5M Qs
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'essay' && styles.tabButtonActive]}
              onPress={() => setActiveTab('essay')}
            >
              <Award size={14} color={activeTab === 'essay' ? '#06b6d4' : '#94a3b8'} />
              <Text style={[styles.tabButtonText, activeTab === 'essay' && styles.tabButtonTextActive]}>
                Essay Type
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'bookback' && styles.tabButtonActive]}
              onPress={() => setActiveTab('bookback')}
            >
              <FileText size={14} color={activeTab === 'bookback' ? '#f59e0b' : '#94a3b8'} />
              <Text style={[styles.tabButtonText, activeTab === 'bookback' && styles.tabButtonTextActive]}>
                Book-Back Q&A
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'solved' && styles.tabButtonActive]}
              onPress={() => setActiveTab('solved')}
            >
              <CheckCircle2 size={14} color={activeTab === 'solved' ? '#06b6d4' : '#94a3b8'} />
              <Text style={[styles.tabButtonText, activeTab === 'solved' && styles.tabButtonTextActive]}>
                Solved Problems
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'diagrams' && styles.tabButtonActive]}
              onPress={() => setActiveTab('diagrams')}
            >
              <Sparkles size={14} color={activeTab === 'diagrams' ? '#f43f5e' : '#94a3b8'} />
              <Text style={[styles.tabButtonText, activeTab === 'diagrams' && styles.tabButtonTextActive]}>
                Diagrams & Mnemonics
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* ─── 3. BODY CONTENT ──────────────────────────────────────────── */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#06b6d4" />
            <Text style={styles.loadingText}>Loading Lesson Content...</Text>
          </View>
        ) : !content ? (
          <ScrollView style={styles.scrollBody} contentContainerStyle={styles.notAvailableScrollContent}>
            <View style={styles.notAvailableContainer}>
              <View style={styles.notAvailableIconCircle}>
                <BookOpen size={36} color="#06b6d4" />
              </View>

              <View style={styles.notAvailableBadge}>
                <Text style={styles.notAvailableBadgeText}>CONTENT COMING SOON</Text>
              </View>

              <Text style={styles.notAvailableTitle}>{topicTitle}</Text>
              <Text style={styles.notAvailableSub}>
                {subject} • {courseTitle} (Day {dayNumber})
              </Text>

              <View style={styles.notAvailableCard}>
                <Text style={styles.notAvailableDesc}>
                  This micro-topic study material is currently being finalized with verified syllabus notes, conceptual videos, and exam question bank.
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.generateAiBtn, isGeneratingAi && { opacity: 0.7 }]}
                onPress={handleGenerateAiOnDemand}
                disabled={isGeneratingAi}
                activeOpacity={0.8}
              >
                {isGeneratingAi ? (
                  <>
                    <ActivityIndicator size="small" color="#0B1120" />
                    <Text style={styles.generateAiBtnText}>Generating Lesson Content...</Text>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} color="#0B1120" />
                    <Text style={styles.generateAiBtnText}>Generate Lesson with AI</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.backBtn} onPress={onClose} activeOpacity={0.7}>
                <Text style={styles.backBtnText}>Back to Daily Routine</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : (
          <ScrollView style={styles.scrollBody} contentContainerStyle={styles.scrollContent}>
            {/* 🎥 TAB 1: IN-APP CLEAN YOUTUBE PLAYER (NO ADS, NO SUGGESTIONS) */}
            {activeTab === 'video' && (
              <View style={styles.tabSection}>
                {/* Embedded Player Container */}
                <View style={styles.playerCard}>
                  <View style={styles.webViewWrapper}>
                    <WebView
                      key={activeVideoId}
                      ref={webViewRef}
                      source={{
                        html: embedHtml,
                        baseUrl: 'https://www.youtube-nocookie.com'
                      }}
                      style={styles.webView}
                      javaScriptEnabled={true}
                      domStorageEnabled={true}
                      allowsInlineMediaPlayback={true}
                      mediaPlaybackRequiresUserAction={false}
                      allowsFullscreenVideo={true}
                      mixedContentMode="always"
                      originWhitelist={['*']}
                      onMessage={handleWebViewMessage}
                    />
                  </View>

                  {/* Clean In-App Controls */}
                  <View style={styles.playerControlsRow}>
                    <TouchableOpacity style={styles.controlBtn} onPress={handlePlayPause}>
                      {isPlaying ? (
                        <>
                          <Pause size={16} color="#0B1120" />
                          <Text style={styles.controlBtnText}>Pause</Text>
                        </>
                      ) : (
                        <>
                          <Play size={16} color="#0B1120" fill="#0B1120" />
                          <Text style={styles.controlBtnText}>Play</Text>
                        </>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.secondaryControlBtn} onPress={handleRestart}>
                      <RotateCcw size={16} color="#94a3b8" />
                      <Text style={styles.secondaryControlText}>Replay</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.secondaryControlBtn, { borderColor: '#06b6d4', backgroundColor: 'rgba(6, 182, 212, 0.18)' }]}
                      onPress={() => setIsFullscreenVideo(true)}
                    >
                      <Maximize2 size={16} color="#06b6d4" />
                      <Text style={[styles.secondaryControlText, { color: '#06b6d4', fontWeight: '800' }]}>Full Screen</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.secondaryControlBtn, { borderColor: '#06b6d440', backgroundColor: 'rgba(6, 182, 212, 0.12)' }]}
                      onPress={() => Linking.openURL(`https://www.youtube.com/watch?v=${activeVideoId}`)}
                    >
                      <ExternalLink size={14} color="#06b6d4" />
                      <Text style={[styles.secondaryControlText, { color: '#06b6d4', fontWeight: '700' }]}>App / HD</Text>
                    </TouchableOpacity>

                    <View style={styles.channelBadge}>
                      <Text style={styles.channelBadgeText}>@aishleetechnology</Text>
                    </View>
                  </View>
                </View>

                {/* 📺 Official Channel Auto-Match Badge */}
                <View style={[styles.card, { borderColor: '#06b6d440', backgroundColor: 'rgba(6, 182, 212, 0.05)' }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Play size={16} color="#06b6d4" />
                      <Text style={{ color: '#06b6d4', fontSize: 13, fontWeight: '800' }}>Official Channel Stream</Text>
                    </View>
                    <View style={{ backgroundColor: 'rgba(6, 182, 212, 0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                      <Text style={{ color: '#38bdf8', fontSize: 10, fontWeight: '700' }}>@aishleetechnology</Text>
                    </View>
                  </View>
                  <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 6, lineHeight: 17 }}>
                    🎯 <Text style={{ color: '#f8fafc', fontWeight: '600' }}>Auto-Matched Topic:</Text> {topicTitle}
                  </Text>

                  {/* Admin Video Mapper Toggle */}
                  <TouchableOpacity
                    style={{ marginTop: 10, alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, backgroundColor: '#1E293B', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}
                    onPress={() => setIsAdminVideoOpen(!isAdminVideoOpen)}
                  >
                    <Text style={{ color: '#cbd5e1', fontSize: 11, fontWeight: '700' }}>
                      {isAdminVideoOpen ? '▲ Hide Video Config' : '⚙️ Admin Video Mapping'}
                    </Text>
                  </TouchableOpacity>

                  {isAdminVideoOpen && (
                    <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' }}>
                      <Text style={{ color: '#94a3b8', fontSize: 11, marginBottom: 6 }}>Enter Custom YouTube Video ID or URL:</Text>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TextInput
                          style={{ flex: 1, backgroundColor: '#0F172A', color: '#ffffff', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6, fontSize: 12, borderWidth: 1, borderColor: '#334155' }}
                          placeholder="e.g. dQw4w9WgXcQ or youtu.be/..."
                          placeholderTextColor="#64748b"
                          value={customVideoInput}
                          onChangeText={setCustomVideoInput}
                        />
                        <TouchableOpacity
                          style={{ backgroundColor: '#06b6d4', paddingHorizontal: 12, borderRadius: 6, justifyContent: 'center', alignItems: 'center' }}
                          onPress={handleSaveCustomVideo}
                        >
                          <Text style={{ color: '#0B1120', fontSize: 12, fontWeight: '800' }}>Bind</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>

                {/* Key Takeaways */}
                <View style={styles.card}>
                  <View style={styles.cardHeaderRow}>
                    <Sparkles size={18} color="#06b6d4" />
                    <Text style={styles.cardHeaderTitle}>Key Masterclass Takeaways</Text>
                  </View>
                  {content.notes.keyPoints.map((pt, idx) => (
                    <View key={idx} style={styles.bulletRow}>
                      <View style={styles.bulletDot} />
                      <Text style={styles.bulletText}>{pt}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* 📝 TAB 2: STUDY NOTES */}
            {activeTab === 'notes' && (
              <View style={styles.tabSection}>
                <View style={styles.card}>
                  <Text style={styles.cardHeaderTitle}>📖 Conceptual Theory</Text>
                  <Text style={styles.overviewText}>{content.notes.overview}</Text>
                </View>

                {content.notes.coreConcepts.map((concept, idx) => {
                  const bodyText = concept.body || (concept as any).content || content.notes.overview || '';
                  const exampleText = concept.formulaOrExample || (concept as any).example || '';
                  return (
                    <View key={idx} style={styles.card}>
                      <Text style={styles.conceptHeading}>{concept.heading}</Text>
                      <Text style={styles.conceptBody}>{bodyText}</Text>
                      {exampleText ? (
                        <View style={styles.exampleBox}>
                          <Text style={styles.exampleText}>{exampleText}</Text>
                        </View>
                      ) : null}
                    </View>
                  );
                })}

                {content.notes.bilingualExplanation && (
                  <View style={[styles.card, { borderColor: '#10b98140' }]}>
                    <Text style={[styles.cardHeaderTitle, { color: '#34d399' }]}>🇮🇳 எளிய தமிழ் விளக்கம் (Bilingual Summary)</Text>
                    <Text style={styles.tamilText}>{content.notes.bilingualExplanation.tamil}</Text>
                  </View>
                )}

                {content.notes.formulasAndShortcuts.length > 0 && (
                  <View style={styles.card}>
                    <Text style={styles.cardHeaderTitle}>⚡ Formulas & Shortcut Tricks</Text>
                    {content.notes.formulasAndShortcuts.map((f, idx) => (
                      <View key={idx} style={styles.formulaItem}>
                        <Text style={styles.formulaName}>{f.name}</Text>
                        <Text style={styles.formulaEquation}>{f.formula}</Text>
                        {f.tip && <Text style={styles.formulaTip}>💡 Tip: {f.tip}</Text>}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* ⚡ TAB 3: 1-LINE Q&A */}
            {activeTab === 'oneline' && (
              <View style={styles.tabSection}>
                <Text style={styles.sectionHeaderTitle}>⚡ Rapid Memory Booster (1-Line Q&A)</Text>
                {content.oneLineQnA.map((q, idx) => {
                  const isRev = revealedQnA[idx];
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={styles.qnaCard}
                      onPress={() => setRevealedQnA((prev) => ({ ...prev, [idx]: !prev[idx] }))}
                      activeOpacity={0.8}
                    >
                      <View style={styles.qnaQuestionRow}>
                        <Text style={styles.qnaNumber}>Q{idx + 1}.</Text>
                        <Text style={styles.qnaQuestionText}>{q.question}</Text>
                      </View>

                      {isRev ? (
                        <View style={styles.qnaAnswerBox}>
                          <CheckCircle2 size={16} color="#10b981" />
                          <Text style={styles.qnaAnswerText}>{q.answer}</Text>
                        </View>
                      ) : (
                        <View style={styles.tapToReveal}>
                          <Text style={styles.tapToRevealText}>Tap to reveal answer 👁️</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* ✏️ TAB 4: FILL IN THE BLANKS */}
            {activeTab === 'blanks' && (
              <View style={styles.tabSection}>
                <Text style={styles.sectionHeaderTitle}>✏️ Interactive Fill in the Blanks</Text>
                {content.fillInTheBlanks.map((b, idx) => {
                  const isRev = revealedBlanks[idx];
                  return (
                    <View key={idx} style={styles.blankCard}>
                      <Text style={styles.blankSentence}>{idx + 1}. {b.sentenceWithBlank}</Text>
                      {isRev ? (
                        <View style={styles.blankAnswerBox}>
                          <Text style={styles.blankAnswerLabel}>Correct Answer:</Text>
                          <Text style={styles.blankAnswerValue}>{b.answer}</Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.blankCheckBtn}
                          onPress={() => setRevealedBlanks((prev) => ({ ...prev, [idx]: true }))}
                        >
                          <Text style={styles.blankCheckBtnText}>Show Answer {b.hint ? `(Hint: ${b.hint})` : ''}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              </View>
            )}

            {/* 🎯 TAB 5: INTERACTIVE MCQS */}
            {activeTab === 'mcq' && (
              <View style={styles.tabSection}>
                <Text style={styles.sectionHeaderTitle}>🎯 High-Yield Exam MCQ Drill</Text>
                {content.mcqs.map((mcq, qIdx) => {
                  const selectedIdx = selectedOptions[qIdx];
                  const hasAnswered = selectedIdx !== undefined;

                  return (
                    <View key={qIdx} style={styles.mcqCard}>
                      <Text style={styles.mcqQuestion}>{qIdx + 1}. {mcq.question}</Text>

                      <View style={styles.mcqOptionsList}>
                        {mcq.options.map((opt, optIdx) => {
                          const isSelected = selectedIdx === optIdx;
                          const isCorrect = mcq.correctIndex === optIdx;

                          let optionStyle = styles.mcqOption;
                          if (hasAnswered) {
                            if (isCorrect) optionStyle = styles.mcqOptionCorrect;
                            else if (isSelected && !isCorrect) optionStyle = styles.mcqOptionWrong;
                          }

                          return (
                            <TouchableOpacity
                              key={optIdx}
                              style={optionStyle}
                              onPress={() => {
                                if (!hasAnswered) {
                                  setSelectedOptions((prev) => ({ ...prev, [qIdx]: optIdx }));
                                }
                              }}
                              disabled={hasAnswered}
                            >
                              <View style={styles.optLetterBadge}>
                                <Text style={styles.optLetterText}>{String.fromCharCode(65 + optIdx)}</Text>
                              </View>
                              <Text style={styles.optText}>{opt}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>

                      {hasAnswered && (
                        <View style={styles.explanationBox}>
                          <Text style={styles.explanationTitle}>💡 Explanation:</Text>
                          <Text style={styles.explanationText}>{mcq.explanation}</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}

            {/* 📋 TAB 6: 2-MARK & 5-MARK QUESTIONS */}
            {activeTab === 'twoFiveMark' && (
              <View style={styles.tabSection}>
                <Text style={styles.sectionHeaderTitle}>📋 2-Mark Short Answer Questions</Text>
                {content.twoMarkQuestions.map((q, idx) => {
                  const isExp = expanded2M[idx];
                  return (
                    <View key={idx} style={styles.examQCard}>
                      <TouchableOpacity
                        style={styles.examQHeader}
                        onPress={() => setExpanded2M((prev) => ({ ...prev, [idx]: !prev[idx] }))}
                      >
                        <View style={{ flex: 1 }}>
                          <View style={styles.marksBadge2M}>
                            <Text style={styles.marksBadgeText}>2 MARKS</Text>
                          </View>
                          <Text style={styles.examQTitle}>{q.question}</Text>
                        </View>
                        {isExp ? <ChevronUp size={20} color="#94a3b8" /> : <ChevronDown size={20} color="#94a3b8" />}
                      </TouchableOpacity>

                      {isExp && (
                        <View style={styles.examAnswerContainer}>
                          <Text style={styles.modelAnswerLabel}>Model Answer / Scoring Points:</Text>
                          <Text style={styles.modelAnswerText}>{q.modelAnswer}</Text>
                        </View>
                      )}
                    </View>
                  );
                })}

                <Text style={[styles.sectionHeaderTitle, { marginTop: 24 }]}>📋 5-Mark Detailed Questions & Derivations</Text>
                {content.fiveMarkQuestions.map((q, idx) => {
                  const isExp = expanded5M[idx];
                  return (
                    <View key={idx} style={styles.examQCard}>
                      <TouchableOpacity
                        style={styles.examQHeader}
                        onPress={() => setExpanded5M((prev) => ({ ...prev, [idx]: !prev[idx] }))}
                      >
                        <View style={{ flex: 1 }}>
                          <View style={styles.marksBadge5M}>
                            <Text style={styles.marksBadgeText}>5 MARKS</Text>
                          </View>
                          <Text style={styles.examQTitle}>{q.question}</Text>
                        </View>
                        {isExp ? <ChevronUp size={20} color="#94a3b8" /> : <ChevronDown size={20} color="#94a3b8" />}
                      </TouchableOpacity>

                      {isExp && (
                        <View style={styles.examAnswerContainer}>
                          <Text style={styles.modelAnswerLabel}>Step-by-Step Structured Solution:</Text>
                          {q.stepByStepSolution.map((step, sIdx) => (
                            <Text key={sIdx} style={styles.stepText}>{step}</Text>
                          ))}
                          {q.diagramOrFormulaNote && (
                            <View style={styles.diagramNoteBox}>
                              <Text style={styles.diagramNoteText}>📐 {q.diagramOrFormulaNote}</Text>
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}

            {/* 🏛️ TAB 7: ESSAY TYPE QUESTIONS */}
            {activeTab === 'essay' && (
              <View style={styles.tabSection}>
                <Text style={styles.sectionHeaderTitle}>🏛️ 10-Mark / Essay Descriptive Questions</Text>
                {content.essayQuestions.map((q, idx) => (
                  <View key={idx} style={styles.essayCard}>
                    <View style={styles.marksBadge10M}>
                      <Text style={styles.marksBadgeText}>10 / 15 MARKS ESSAY</Text>
                    </View>
                    <Text style={styles.essayQTitle}>{q.question}</Text>

                    <View style={styles.outlineBox}>
                      <Text style={styles.outlineTitle}>Structured Answer Outline:</Text>
                      {q.structuredOutline.map((item, oIdx) => (
                        <Text key={oIdx} style={styles.outlineItem}>• {item}</Text>
                      ))}
                    </View>

                    <Text style={styles.modelEssayLabel}>Model Descriptive Answer:</Text>
                    <Text style={styles.modelEssayText}>{q.modelEssay}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* ─── TAB: BOOK-BACK Q&A (குறுவினாக்கள் & நெடுவினாக்கள்) ─── */}
            {activeTab === 'bookback' && (
              <View style={styles.tabSection}>
                <Text style={styles.sectionHeaderTitle}>📚 Book-Back Q&A (புத்தகத்தின் பின்புற வினா-விடைகள்)</Text>
                
                {/* 2-Mark Short Answers */}
                <Text style={{ color: '#f59e0b', fontSize: 12, fontWeight: '700', marginTop: 12, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                  📝 2-Mark Short Answers (குறுவினாக்கள்)
                </Text>
                {(content as any)?.bookBackSolutions?.twoMarkShortAnswers?.length > 0 ? (
                  (content as any).bookBackSolutions.twoMarkShortAnswers.map((qa: any, idx: number) => (
                    <View key={idx} style={{ backgroundColor: '#111827', borderRadius: 16, borderWidth: 1, borderColor: '#1e293b', padding: 16, marginBottom: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                        <View style={{ backgroundColor: 'rgba(245,158,11,0.2)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
                          <Text style={{ color: '#f59e0b', fontSize: 10, fontWeight: '700' }}>{qa.marks} Marks</Text>
                        </View>
                        <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '700', flex: 1, lineHeight: 18 }}>{qa.question}</Text>
                      </View>
                      <View style={{ backgroundColor: 'rgba(16,185,129,0.1)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)', padding: 12 }}>
                        <Text style={{ color: '#10b981', fontSize: 10, fontWeight: '700', marginBottom: 4 }}>📝 Model Answer:</Text>
                        <Text style={{ color: '#d1fae5', fontSize: 12, lineHeight: 18 }}>{qa.modelAnswer}</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  content.twoMarkQuestions.map((q, idx) => (
                    <View key={idx} style={{ backgroundColor: '#111827', borderRadius: 16, borderWidth: 1, borderColor: '#1e293b', padding: 16, marginBottom: 12 }}>
                      <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '700', marginBottom: 6 }}>{q.question}</Text>
                      <Text style={{ color: '#10b981', fontSize: 12, lineHeight: 18 }}>{q.modelAnswer}</Text>
                    </View>
                  ))
                )}

                {/* 5-Mark Essay Answers */}
                <Text style={{ color: '#a855f7', fontSize: 12, fontWeight: '700', marginTop: 16, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                  📖 5-Mark Essay Answers (நெடுவினாக்கள் / விரிவான விடை)
                </Text>
                {(content as any)?.bookBackSolutions?.fiveMarkEssayAnswers?.length > 0 ? (
                  (content as any).bookBackSolutions.fiveMarkEssayAnswers.map((qa: any, idx: number) => (
                    <View key={idx} style={{ backgroundColor: '#111827', borderRadius: 16, borderWidth: 1, borderColor: '#1e293b', padding: 16, marginBottom: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                        <View style={{ backgroundColor: 'rgba(168,85,247,0.2)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
                          <Text style={{ color: '#a855f7', fontSize: 10, fontWeight: '700' }}>{qa.marks} Marks</Text>
                        </View>
                        <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '700', flex: 1, lineHeight: 18 }}>{qa.question}</Text>
                      </View>
                      <View style={{ backgroundColor: 'rgba(168,85,247,0.08)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(168,85,247,0.2)', padding: 12 }}>
                        <Text style={{ color: '#a855f7', fontSize: 10, fontWeight: '700', marginBottom: 4 }}>📖 Model Essay Answer:</Text>
                        <Text style={{ color: '#e2e8f0', fontSize: 12, lineHeight: 18 }}>{qa.modelAnswer}</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  content.fiveMarkQuestions.map((q, idx) => (
                    <View key={idx} style={{ backgroundColor: '#111827', borderRadius: 16, borderWidth: 1, borderColor: '#1e293b', padding: 16, marginBottom: 12 }}>
                      <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '700', marginBottom: 6 }}>{q.question}</Text>
                      {q.stepByStepSolution.map((step, sIdx) => (
                        <Text key={sIdx} style={{ color: '#10b981', fontSize: 12, marginLeft: 8, lineHeight: 18 }}>• {step}</Text>
                      ))}
                    </View>
                  ))
                )}
              </View>
            )}

            {/* ─── TAB: STEP-BY-STEP SOLVED PROBLEMS ─── */}
            {activeTab === 'solved' && (
              <View style={styles.tabSection}>
                <Text style={styles.sectionHeaderTitle}>🧮 Step-by-Step Solved Problems (படிப்படியான தீர்வு)</Text>
                {(content as any)?.solvedProblems?.length > 0 ? (
                  (content as any).solvedProblems.map((prob: any, idx: number) => (
                    <View key={idx} style={{ backgroundColor: '#111827', borderRadius: 16, borderWidth: 1, borderColor: '#1e293b', padding: 16, marginBottom: 16 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, flex: 1 }}>
                          <View style={{ backgroundColor: 'rgba(6,182,212,0.2)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
                            <Text style={{ color: '#06b6d4', fontSize: 10, fontWeight: '700' }}>Problem {idx + 1}</Text>
                          </View>
                          <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '700', flex: 1, lineHeight: 18 }}>{prob.problemStatement}</Text>
                        </View>
                        {prob.difficulty && (
                          <View style={{ backgroundColor: prob.difficulty === 'Challenge' ? 'rgba(239,68,68,0.2)' : prob.difficulty === 'Medium' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 8 }}>
                            <Text style={{ color: prob.difficulty === 'Challenge' ? '#ef4444' : prob.difficulty === 'Medium' ? '#f59e0b' : '#10b981', fontSize: 10, fontWeight: '700' }}>{prob.difficulty}</Text>
                          </View>
                        )}
                      </View>
                      {prob.steps?.map((step: string, sIdx: number) => (
                        <View key={sIdx} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#080d1a', borderRadius: 12, borderWidth: 1, borderColor: '#1e293b', padding: 10, marginBottom: 6 }}>
                          <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(6,182,212,0.2)', borderWidth: 1, borderColor: 'rgba(6,182,212,0.3)', justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ color: '#06b6d4', fontSize: 10, fontWeight: '700' }}>{sIdx + 1}</Text>
                          </View>
                          <Text style={{ color: '#cbd5e1', fontSize: 12, flex: 1, lineHeight: 18 }}>{step}</Text>
                        </View>
                      ))}
                      <View style={{ backgroundColor: 'rgba(6,182,212,0.1)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(6,182,212,0.2)', padding: 12, marginTop: 8 }}>
                        <Text style={{ color: '#06b6d4', fontSize: 10, fontWeight: '700', marginBottom: 4 }}>✅ Answer:</Text>
                        <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '600' }}>{prob.answer}</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={{ backgroundColor: '#111827', borderRadius: 16, borderWidth: 1, borderColor: '#1e293b', padding: 20, alignItems: 'center' }}>
                    <Text style={{ color: '#64748b', fontSize: 12 }}>Solved problem sets will be populated for this topic.</Text>
                  </View>
                )}
              </View>
            )}

            {/* ─── TAB: DIAGRAMS & VISUAL MEMORIZATION MNEMONICS ─── */}
            {activeTab === 'diagrams' && (
              <View style={styles.tabSection}>
                <Text style={styles.sectionHeaderTitle}>🎨 Diagrams & Visual Memorization (வரைபடங்கள் & நினைவு உத்திகள்)</Text>
                {(content as any)?.diagramsAndVisuals ? (
                  <View style={{ backgroundColor: '#111827', borderRadius: 16, borderWidth: 1, borderColor: '#1e293b', padding: 16, marginBottom: 12 }}>
                    <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '700', marginBottom: 8 }}>{(content as any).diagramsAndVisuals.diagramTitle}</Text>
                    <Text style={{ color: '#94a3b8', fontSize: 12, lineHeight: 18, marginBottom: 12 }}>{(content as any).diagramsAndVisuals.diagramDescription}</Text>
                    
                    {(content as any).diagramsAndVisuals.keyLabels?.map((label: string, lIdx: number) => (
                      <View key={lIdx} style={{ backgroundColor: 'rgba(244,63,94,0.08)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(244,63,94,0.2)', padding: 12, marginBottom: 8 }}>
                        <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '600' }}>{label}</Text>
                      </View>
                    ))}

                    {(content as any).diagramsAndVisuals.mnemonicTrick && (
                      <View style={{ backgroundColor: 'rgba(245,158,11,0.1)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)', padding: 12, marginTop: 8 }}>
                        <Text style={{ color: '#f59e0b', fontSize: 10, fontWeight: '700', marginBottom: 4 }}>🧠 Memory Trick (நினைவு உத்தி):</Text>
                        <Text style={{ color: '#fde68a', fontSize: 12, lineHeight: 18 }}>{(content as any).diagramsAndVisuals.mnemonicTrick}</Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={{ backgroundColor: '#111827', borderRadius: 16, borderWidth: 1, borderColor: '#1e293b', padding: 20, alignItems: 'center' }}>
                    <Text style={{ color: '#64748b', fontSize: 12 }}>Diagram and visual memorization aids will be generated for this topic.</Text>
                  </View>
                )}

                {/* AI Doubt Solver Prompt */}
                <View style={{ backgroundColor: 'rgba(99,102,241,0.08)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(99,102,241,0.3)', padding: 16, marginTop: 12 }}>
                  <Text style={{ color: '#818cf8', fontSize: 12, fontWeight: '700', marginBottom: 6 }}>🤖 Live AI Doubt Solver</Text>
                  <Text style={{ color: '#cbd5e1', fontSize: 11, lineHeight: 16 }}>
                    Ask TeachO AI: &quot;இதை எனக்கு இன்னும் எளிமையாக விளக்கு&quot; (Explain this even simpler to me)
                  </Text>
                  <Text style={{ color: '#64748b', fontSize: 10, marginTop: 4 }}>
                    Gemini AI chat integration is active in TeachO Studio for real-time doubt resolution.
                  </Text>
                </View>
              </View>
            )}

            {/* ─── 4. COMPLETE TASK & UNLOCK NEXT DAY ACTION BUTTON ────────── */}
            <View style={styles.footerAction}>
              <TouchableOpacity style={styles.completeButton} onPress={handleFinish}>
                <Sparkles size={20} color="#0B1120" />
                <Text style={styles.completeButtonText}>Complete Topic & Unlock Next Day (+20 XP)</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {/* ─── FULL SCREEN CINEMATIC VIDEO PLAYER MODAL ────────────────── */}
        <Modal
          visible={isFullscreenVideo}
          animationType="fade"
          transparent={false}
          onRequestClose={() => setIsFullscreenVideo(false)}
          supportedOrientations={['portrait', 'landscape', 'landscape-left', 'landscape-right']}
        >
          <View style={styles.fullscreenContainer}>
            <StatusBar hidden={true} />
            <WebView
              key={activeVideoId}
              source={{
                html: embedHtml,
                baseUrl: 'https://www.youtube-nocookie.com'
              }}
              style={styles.fullscreenWebView}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              allowsInlineMediaPlayback={true}
              mediaPlaybackRequiresUserAction={false}
              allowsFullscreenVideo={true}
              mixedContentMode="always"
              originWhitelist={['*']}
            />

            {/* Floating Top Bar with Exit Full Screen Button */}
            <SafeAreaView style={styles.fullscreenTopOverlay} pointerEvents="box-none">
              <View style={styles.fullscreenHeaderRow}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={styles.fullscreenTitle} numberOfLines={1}>
                    {topicTitle}
                  </Text>
                  <Text style={styles.fullscreenSub} numberOfLines={1}>
                    {subject} • {courseTitle} (Day {dayNumber})
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.fullscreenExitBtn}
                  onPress={() => setIsFullscreenVideo(false)}
                  activeOpacity={0.8}
                >
                  <Minimize2 size={18} color="#ffffff" />
                  <Text style={styles.fullscreenExitText}>Exit Full Screen</Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </View>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1120',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerLeft: {
    flex: 1,
    flexShrink: 1,
    paddingRight: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  subjectBadge: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  subjectBadgeText: {
    color: '#06b6d4',
    fontSize: 11,
    fontWeight: '700',
  },
  dayBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dayBadgeText: {
    color: '#fbbf24',
    fontSize: 11,
    fontWeight: '700',
  },
  headerTitle: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 50,
    elevation: 50,
  },
  xpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: '#f59e0b40',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  xpPillText: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '800',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 60,
    elevation: 60,
  },
  tabBarContainer: {
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  tabScroll: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#1e293b',
  },
  tabButtonActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    borderWidth: 1,
    borderColor: '#06b6d4',
  },
  tabButtonText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: '#06b6d4',
    fontWeight: '800',
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  tabSection: {
    gap: 16,
  },
  sectionHeaderTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  playerCard: {
    backgroundColor: '#000',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  webViewWrapper: {
    width: '100%',
    height: 220,
    backgroundColor: '#000',
  },
  webView: {
    flex: 1,
    backgroundColor: '#000',
  },
  playerControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#06b6d4',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  controlBtnText: {
    color: '#0B1120',
    fontSize: 13,
    fontWeight: '800',
  },
  secondaryControlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0f172a',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  secondaryControlText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  channelBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  channelBadgeText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 10,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardHeaderTitle: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '800',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#06b6d4',
    marginTop: 6,
  },
  bulletText: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
  },
  overviewText: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 20,
  },
  conceptHeading: {
    color: '#38bdf8',
    fontSize: 14,
    fontWeight: '700',
  },
  conceptBody: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 19,
  },
  exampleBox: {
    backgroundColor: '#0f172a',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#06b6d4',
  },
  exampleText: {
    color: '#94a3b8',
    fontSize: 12,
    fontStyle: 'italic',
  },
  tamilText: {
    color: '#6ee7b7',
    fontSize: 13,
    lineHeight: 20,
  },
  formulaItem: {
    backgroundColor: '#0f172a',
    padding: 10,
    borderRadius: 8,
    gap: 4,
  },
  formulaName: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '700',
  },
  formulaEquation: {
    color: '#38bdf8',
    fontSize: 14,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  formulaTip: {
    color: '#fbbf24',
    fontSize: 11,
  },
  qnaCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 8,
  },
  qnaQuestionRow: {
    flexDirection: 'row',
    gap: 6,
  },
  qnaNumber: {
    color: '#06b6d4',
    fontSize: 14,
    fontWeight: '800',
  },
  qnaQuestionText: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  tapToReveal: {
    backgroundColor: '#0f172a',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  tapToRevealText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  qnaAnswerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: '#10b981',
    padding: 10,
    borderRadius: 6,
  },
  qnaAnswerText: {
    color: '#34d399',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  blankCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 8,
  },
  blankSentence: {
    color: '#f8fafc',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  blankCheckBtn: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  blankCheckBtnText: {
    color: '#06b6d4',
    fontSize: 12,
    fontWeight: '700',
  },
  blankAnswerBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: 10,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#10b981',
  },
  blankAnswerLabel: {
    color: '#94a3b8',
    fontSize: 11,
  },
  blankAnswerValue: {
    color: '#34d399',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  mcqCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 12,
  },
  mcqQuestion: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  mcqOptionsList: {
    gap: 8,
  },
  mcqOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    padding: 10,
    borderRadius: 8,
  },
  mcqOptionCorrect: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: '#10b981',
    padding: 10,
    borderRadius: 8,
  },
  mcqOptionWrong: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: '#ef4444',
    padding: 10,
    borderRadius: 8,
  },
  optLetterBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optLetterText: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '800',
  },
  optText: {
    color: '#cbd5e1',
    fontSize: 13,
    flex: 1,
  },
  explanationBox: {
    backgroundColor: '#0f172a',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#fbbf24',
  },
  explanationTitle: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '700',
  },
  explanationText: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
  examQCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  examQHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  marksBadge2M: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
  },
  marksBadge5M: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
  },
  marksBadge10M: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 8,
  },
  marksBadgeText: {
    color: '#06b6d4',
    fontSize: 10,
    fontWeight: '800',
  },
  examQTitle: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '700',
  },
  examAnswerContainer: {
    backgroundColor: '#0f172a',
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    gap: 8,
  },
  modelAnswerLabel: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '700',
  },
  modelAnswerText: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 19,
  },
  stepText: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 19,
  },
  diagramNoteBox: {
    backgroundColor: '#1e293b',
    padding: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  diagramNoteText: {
    color: '#fbbf24',
    fontSize: 11,
  },
  essayCard: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 12,
  },
  essayQTitle: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 22,
  },
  outlineBox: {
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#a855f7',
    gap: 4,
  },
  outlineTitle: {
    color: '#c084fc',
    fontSize: 12,
    fontWeight: '700',
  },
  outlineItem: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18,
  },
  modelEssayLabel: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: '700',
  },
  modelEssayText: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 20,
  },
  footerAction: {
    marginTop: 24,
    marginBottom: 20,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fbbf24',
    paddingVertical: 14,
    borderRadius: 12,
  },
  completeButtonText: {
    color: '#0B1120',
    fontSize: 15,
    fontWeight: '900',
  },
  notAvailableScrollContent: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 400,
  },
  notAvailableContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 20,
  },
  notAvailableIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  notAvailableBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  notAvailableBadgeText: {
    color: '#fbbf24',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  notAvailableTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  notAvailableSub: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 18,
  },
  notAvailableCard: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 24,
  },
  notAvailableDesc: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  generateAiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#06b6d4',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 12,
  },
  generateAiBtnText: {
    color: '#0B1120',
    fontSize: 14,
    fontWeight: '800',
  },
  backBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  backBtnText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'relative',
  },
  fullscreenWebView: {
    flex: 1,
    backgroundColor: '#000000',
  },
  fullscreenTopOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: 'rgba(11, 17, 32, 0.85)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  fullscreenHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fullscreenTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  fullscreenSub: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  fullscreenExitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  fullscreenExitText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
});
