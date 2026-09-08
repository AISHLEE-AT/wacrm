// @ts-nocheck
import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Platform,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Play, ExternalLink, RotateCcw, AlertTriangle } from 'lucide-react-native';

export interface SuproYouTubePlayerProps {
  videoId?: string;
  url?: string;
  title?: string;
  autoplay?: boolean;
  controls?: boolean;
  style?: StyleProp<ViewStyle>;
  onEnded?: () => void;
  onReady?: () => void;
  onError?: (err: any) => void;
  showFallbackButton?: boolean;
}

export function extractYouTubeId(urlOrId?: string): string {
  if (!urlOrId) return 'dQw4w9WgXcQ';
  const trimmed = urlOrId.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([a-zA-Z0-9_-]{11})/
  );
  if (match && match[1]) {
    return match[1];
  }
  const cleaned = trimmed.split('?')[0].split('&')[0];
  if (/^[a-zA-Z0-9_-]{11}$/.test(cleaned)) {
    return cleaned;
  }
  return trimmed || 'dQw4w9WgXcQ';
}

export const SuproYouTubePlayer: React.FC<SuproYouTubePlayerProps> = ({
  videoId,
  url,
  title,
  autoplay = true,
  controls = true,
  style,
  onEnded,
  onReady,
  onError,
  showFallbackButton = true,
}) => {
  const [hasError, setHasError] = useState(false);
  const [errorCode, setErrorCode] = useState<string | number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const webViewRef = useRef<WebView>(null);

  const cleanVideoId = useMemo(() => {
    return extractYouTubeId(videoId || url);
  }, [videoId, url]);

  const handleOpenInYouTubeApp = () => {
    const appUrl = 'vnd.youtube:' + cleanVideoId;
    const webUrl = 'https://www.youtube.com/watch?v=' + cleanVideoId;
    Linking.canOpenURL(appUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(appUrl);
        } else {
          Linking.openURL(webUrl);
        }
      })
      .catch(() => {
        Linking.openURL(webUrl);
      });
  };

  const handleReload = () => {
    setHasError(false);
    setErrorCode(null);
    setIsLoading(true);
    setReloadKey((prev) => prev + 1);
  };

  // Build responsive HTML document with correct origin & referrer headers to prevent YouTube Error 153
  const htmlContent = useMemo(() => {
    const origin = 'https://watscrm.vercel.app';
    const autoPlayVal = autoplay ? 1 : 0;
    const controlsVal = controls ? 1 : 0;
    const queryParams = [
      'autoplay=' + autoPlayVal,
      'controls=' + controlsVal,
      'playsinline=1',
      'rel=0',
      'modestbranding=1',
      'enablejsapi=1',
      'fs=1',
      'origin=' + origin,
    ].join('&');

    return `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="referrer" content="strict-origin-when-cross-origin">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body {
        width: 100%;
        height: 100%;
        background-color: #050811;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .player-container {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: #050811;
      }
      iframe {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: 0;
      }
      .error-card {
        display: none;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        color: #ffffff;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        text-align: center;
        padding: 20px;
        background: #0f172a;
      }
      .error-btn {
        margin-top: 14px;
        padding: 10px 18px;
        background: #ef4444;
        color: white;
        border-radius: 8px;
        text-decoration: none;
        font-weight: bold;
        font-size: 14px;
      }
    </style>
  </head>
  <body>
    <div class="player-container">
      <iframe
        id="supro-yt-player"
        src="https://www.youtube-nocookie.com/embed/${cleanVideoId}?${queryParams}"
        referrerpolicy="strict-origin-when-cross-origin"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        allowfullscreen>
      </iframe>
      <div id="error-view" class="error-card">
        <p style="font-size: 14px; margin-bottom: 6px;">YouTube video restricted in in-app player</p>
        <a class="error-btn" href="https://www.youtube.com/watch?v=${cleanVideoId}">▶ Open in YouTube</a>
      </div>
    </div>
    <script>
      var tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      var player;
      function notify(msg) {
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(JSON.stringify(msg));
        }
      }

      function onYouTubeIframeAPIReady() {
        try {
          player = new YT.Player('supro-yt-player', {
            events: {
              'onReady': function() {
                notify({ type: 'READY' });
              },
              'onStateChange': function(e) {
                if (e.data === 1) {
                  notify({ type: 'PLAYING' });
                } else if (e.data === 0) {
                  notify({ type: 'ENDED' });
                }
              },
              'onError': function(e) {
                notify({ type: 'ERROR', code: e.data });
                var errView = document.getElementById('error-view');
                var iframe = document.getElementById('supro-yt-player');
                if (errView && iframe) {
                  iframe.style.display = 'none';
                  errView.style.display = 'flex';
                }
              }
            }
          });
        } catch(e) {
          notify({ type: 'ERROR', message: e.message });
        }
      }
    </script>
  </body>
</html>`;
  }, [cleanVideoId, autoplay, controls]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data?.type === 'READY') {
        setIsLoading(false);
        onReady?.();
      } else if (data?.type === 'PLAYING') {
        setIsLoading(false);
      } else if (data?.type === 'ENDED') {
        onEnded?.();
      } else if (data?.type === 'ERROR') {
        setIsLoading(false);
        setHasError(true);
        setErrorCode(data.code || 'Playback error');
        onError?.(data);
      }
    } catch {
      // Ignored
    }
  };

  return (
    <View style={[styles.container, style]}>
      {hasError ? (
        <View style={styles.errorContainer}>
          <AlertTriangle size={32} color="#f59e0b" style={{ marginBottom: 8 }} />
          <Text style={styles.errorTitle}>YouTube Playback Notice</Text>
          <Text style={styles.errorSubtext}>
            {title || 'Video embedding restricted by owner or requires YouTube app.'}
          </Text>
          <View style={styles.errorActions}>
            <TouchableOpacity style={styles.appFallbackBtn} onPress={handleOpenInYouTubeApp} activeOpacity={0.85}>
              <Play size={14} color="#ffffff" fill="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.appFallbackText}>Watch on YouTube App</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.reloadBtn} onPress={handleReload} activeOpacity={0.75}>
              <RotateCcw size={14} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.playerWrapper}>
          {isLoading && (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#10b981" />
              <Text style={styles.loadingText}>Loading Video...</Text>
            </View>
          )}

          <WebView
            key={'yt_' + cleanVideoId + '_' + reloadKey}
            ref={webViewRef}
            source={{
              html: htmlContent,
              baseUrl: 'https://watscrm.vercel.app',
            }}
            userAgent="Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
            originWhitelist={['*']}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowsFullscreenVideo={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            mixedContentMode="always"
            androidLayerType="hardware"
            setSupportMultipleWindows={false}
            onMessage={handleMessage}
            onLoadEnd={() => setIsLoading(false)}
            onError={(e) => {
              setIsLoading(false);
              setHasError(true);
              setErrorCode(e.nativeEvent.description);
            }}
            style={styles.webView}
            scrollEnabled={false}
            bounces={false}
          />

          {showFallbackButton && (
            <TouchableOpacity
              style={styles.quickExternalBtn}
              onPress={handleOpenInYouTubeApp}
              activeOpacity={0.8}
            >
              <ExternalLink size={11} color="#38bdf8" style={{ marginRight: 4 }} />
              <Text style={styles.quickExternalText}>Open in YouTube App</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#050811',
    overflow: 'hidden',
    position: 'relative',
  },
  playerWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
    backgroundColor: '#000000',
  },
  webView: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingBox: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
    backgroundColor: '#050811',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 8,
  },
  quickExternalBtn: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  quickExternalText: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    minHeight: 200,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  errorTitle: {
    color: '#f1f5f9',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  errorSubtext: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
  },
  errorActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  appFallbackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  appFallbackText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  reloadBtn: {
    backgroundColor: '#1e293b',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
});

export default SuproYouTubePlayer;
