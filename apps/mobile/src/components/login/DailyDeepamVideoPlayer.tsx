import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { WebView } from 'react-native-webview';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react-native';

interface DailyDeepamVideoPlayerProps {
  videoId: string;
  videoTitle?: string;
  onVideoEnded: () => void;
}

export const DailyDeepamVideoPlayer: React.FC<DailyDeepamVideoPlayerProps> = ({
  videoId,
  videoTitle,
  onVideoEnded,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasEnded, setHasEnded] = useState(false);
  const [canSkip, setCanSkip] = useState(false);
  const pulseAnim = useRef(new Animated.Value(0.95)).current;
  const webViewRef = useRef<WebView>(null);
  const isEndingRef = useRef(false);

  const triggerFinish = () => {
    if (isEndingRef.current) return;
    isEndingRef.current = true;
    setHasEnded(true);
    // Immediately notify parent to close player and enable login
    onVideoEnded();
  };

  useEffect(() => {
    // Dismiss loading overlay quickly so video renders
    const loadTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    // Enable skip/continue button after 3 seconds
    const skipTimer = setTimeout(() => {
      setCanSkip(true);
    }, 3000);

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.95,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => {
      clearTimeout(loadTimer);
      clearTimeout(skipTimer);
    };
  }, []);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data?.type === 'ENDED' || data?.type === 'NEAR_END') {
        triggerFinish();
      } else if (data?.type === 'PLAYING' || data?.type === 'READY') {
        setIsLoading(false);
      } else if (data?.type === 'ERROR') {
        setIsLoading(false);
      }
    } catch {
      setIsLoading(false);
    }
  };

  // Pure immersive HTML with CSS cropping to hide YouTube top header/name and auto-close before end screen
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body {
            width: 100%;
            height: 100%;
            background-color: #0a0f1e;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .video-wrapper {
            position: relative;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background: #000;
            border-radius: 12px;
          }
          /* Crop top YouTube app header, search icon, 3 dots, and bottom controls */
          iframe {
            position: absolute;
            top: -15%;
            left: -2%;
            width: 104%;
            height: 130%;
            border: 0;
            pointer-events: none; /* Block ad clicks or external navigation */
          }
          .touch-blocker {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10;
            background: transparent;
          }
        </style>
      </head>
      <body>
        <div class="video-wrapper">
          <iframe
            id="ytplayer"
            src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&iv_load_policy=3&fs=0&disablekb=1&showinfo=0&origin=https://www.youtube.com"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen>
          </iframe>
          <div class="touch-blocker"></div>
        </div>
        <script>
          var tag = document.createElement('script');
          tag.src = "https://www.youtube.com/iframe_api";
          var firstScriptTag = document.getElementsByTagName('script')[0];
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

          var player;
          var pollTimer = null;
          var hasTriggeredEnd = false;

          function notifyApp(msg) {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify(msg));
            }
          }

          function checkVideoProgress() {
            if (hasTriggeredEnd || !player) return;
            try {
              if (player.getCurrentTime && player.getDuration) {
                var current = player.getCurrentTime();
                var duration = player.getDuration();
                if (duration > 0 && (duration - current) <= 0.35) {
                  hasTriggeredEnd = true;
                  if (pollTimer) clearInterval(pollTimer);
                  notifyApp({ type: 'NEAR_END' });
                }
              }
            } catch(e) {}
          }

          function onYouTubeIframeAPIReady() {
            try {
              player = new YT.Player('ytplayer', {
                events: {
                  'onReady': function(e) {
                    try { e.target.playVideo(); } catch(err) {}
                    notifyApp({ type: 'READY' });
                  },
                  'onStateChange': function(e) {
                    if (e.data === 1 || e.data === 3) {
                      notifyApp({ type: 'PLAYING' });
                      if (!pollTimer) {
                        pollTimer = setInterval(checkVideoProgress, 150);
                      }
                    } else if (e.data === 0) {
                      if (!hasTriggeredEnd) {
                        hasTriggeredEnd = true;
                        if (pollTimer) clearInterval(pollTimer);
                        notifyApp({ type: 'ENDED' });
                      }
                    }
                  },
                  'onError': function(e) {
                    notifyApp({ type: 'ERROR', code: e.data });
                  }
                }
              });
            } catch(err) {}
          }
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      {/* Header Banner */}
      <View style={styles.header}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Sparkles size={16} color="#fbbf24" />
        </Animated.View>
        <Text style={styles.headerTitle}>✦ TODAY'S SUPRO DEEPAM BROADCAST ✦</Text>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Sparkles size={16} color="#fbbf24" />
        </Animated.View>
      </View>

      <Text style={styles.subtext}>
        {videoTitle || 'Aishlee Technology Daily Inspiration'}
      </Text>

      {/* Immersive Video Container */}
      <View style={styles.videoContainer}>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color="#10b981" />
            <Text style={styles.loadingText}>Starting Daily Broadcast...</Text>
          </View>
        )}

        <WebView
          ref={webViewRef}
          source={{ html: htmlContent, baseUrl: 'https://www.youtube.com' }}
          userAgent="Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
          style={styles.webview}
          originWhitelist={['*']}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          mixedContentMode="always"
          androidLayerType="hardware"
          setSupportMultipleWindows={false}
          onMessage={handleMessage}
          onLoadEnd={() => setIsLoading(false)}
          scrollEnabled={false}
          bounces={false}
        />

        {hasEnded && (
          <View style={styles.endedOverlay}>
            <CheckCircle2 size={36} color="#10b981" />
            <Text style={styles.endedText}>Broadcast Completed</Text>
            <Text style={styles.endedSubtext}>Entering SuprO...</Text>
          </View>
        )}
      </View>

      {/* Bottom Actions & Status */}
      <View style={styles.footerRow}>
        <View style={styles.statusIndicator}>
          <View style={styles.activeDot} />
          <Text style={styles.statusText}>1st Start Daily Message</Text>
        </View>

        {canSkip && (
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={triggerFinish}
            activeOpacity={0.8}
          >
            <Text style={styles.continueBtnText}>Continue to Login</Text>
            <ArrowRight size={14} color="#10b981" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0a0f1e',
    borderRadius: 18,
    padding: 14,
    marginTop: 18,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(52, 211, 153, 0.4)',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 4,
  },
  headerTitle: {
    color: '#fbbf24',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  subtext: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '500',
  },
  videoContainer: {
    width: '100%',
    height: 190,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#050811',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  webview: {
    flex: 1,
    backgroundColor: '#0a0f1e',
  },
  loadingOverlay: {
    ...(StyleSheet.absoluteFill as any),
    backgroundColor: '#0a0f1e',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    gap: 8,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  endedOverlay: {
    ...(StyleSheet.absoluteFill as any),
    backgroundColor: 'rgba(10, 15, 30, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
    gap: 6,
  },
  endedText: {
    color: '#10b981',
    fontSize: 15,
    fontWeight: 'bold',
  },
  endedSubtext: {
    color: '#94a3b8',
    fontSize: 12,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  statusText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '500',
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  continueBtnText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
