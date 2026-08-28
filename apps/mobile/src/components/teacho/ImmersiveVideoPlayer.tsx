import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import {
  Play,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Clock,
  Volume2,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface ImmersiveVideoPlayerProps {
  videoId: string;
  title: string;
  channelName?: string;
  summary?: string;
  durationMinutes?: number;
  isCompleted?: boolean;
  onMarkComplete?: () => void;
  xpReward?: number;
}

export const ImmersiveVideoPlayer: React.FC<ImmersiveVideoPlayerProps> = ({
  videoId,
  title,
  channelName = 'ICLE Technology Official',
  summary,
  durationMinutes = 15,
  isCompleted = false,
  onMarkComplete,
  xpReward = 30,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [speed, setSpeed] = useState<number>(1.0);
  const [reloadKey, setReloadKey] = useState(0);

  // Clean video ID
  const cleanId = (videoId || '').replace(/[^a-zA-Z0-9-_]/g, '').trim() || 'dQw4w9WgXcQ';
  const embedUrl = `https://www.youtube-nocookie.com/embed/${cleanId}?modestbranding=1&rel=0&iv_load_policy=3&playsinline=1&enablejsapi=1&fs=1&controls=1`;

  const isIcleOfficial = channelName.toLowerCase().includes('icle');

  const speeds = [0.75, 1.0, 1.25, 1.5, 2.0];

  const handleNextSpeed = () => {
    const nextIdx = (speeds.indexOf(speed) + 1) % speeds.length;
    setSpeed(speeds[nextIdx]);
  };

  const renderPlayer = (isFull: boolean = false) => (
    <View style={[styles.playerBox, isFull && styles.playerBoxFullscreen]}>
      {/* Header bar over player */}
      <View style={styles.playerHeader}>
        <View style={styles.badgeRow}>
          {isIcleOfficial ? (
            <View style={styles.icleBadge}>
              <ShieldCheck size={11} color="#00D084" />
              <Text style={styles.icleBadgeText}>ICLE TECHNOLOGY OFFICIAL</Text>
            </View>
          ) : (
            <View style={styles.channelBadge}>
              <Sparkles size={11} color="#38BDF8" />
              <Text style={styles.channelBadgeText}>{channelName.toUpperCase()}</Text>
            </View>
          )}

          <View style={styles.durationPill}>
            <Clock size={10} color="#94A3B8" />
            <Text style={styles.durationPillText}>{durationMinutes} Min</Text>
          </View>
        </View>

        <View style={styles.playerActionsRow}>
          {/* Replay */}
          <TouchableOpacity
            style={styles.controlPill}
            activeOpacity={0.8}
            onPress={() => setReloadKey((k) => k + 1)}
          >
            <RotateCcw size={12} color="#94A3B8" />
          </TouchableOpacity>

          {/* Fullscreen Toggle */}
          <TouchableOpacity
            style={styles.controlPill}
            activeOpacity={0.8}
            onPress={() => setIsFullscreen(!isFullscreen)}
          >
            {isFull ? <Minimize2 size={13} color="#00D084" /> : <Maximize2 size={13} color="#CBD5E1" />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Web & Native View */}
      <View style={[styles.embedContainer, isFull && styles.embedContainerFullscreen]}>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color="#00D084" />
            <Text style={styles.loadingText}>Loading Immersive Masterclass...</Text>
          </View>
        )}

        {Platform.OS === 'web' ? (
          <iframe
            key={`web_${cleanId}_${reloadKey}`}
            src={embedUrl}
            style={{ width: '100%', height: isFull ? '100%' : 220, border: 0, borderRadius: isFull ? 0 : 12 }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
            onLoad={() => setIsLoading(false)}
          />
        ) : (
          <WebView
            key={`native_${cleanId}_${reloadKey}`}
            style={[styles.nativeWebView, isFull && styles.nativeWebViewFullscreen]}
            source={{ uri: embedUrl }}
            allowsFullscreenVideo
            javaScriptEnabled
            domStorageEnabled
            onLoadEnd={() => setIsLoading(false)}
          />
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Title & Channel Header */}
      <View style={styles.infoSection}>
        <Text style={styles.titleText}>{title}</Text>
        {summary && <Text style={styles.summaryText}>{summary}</Text>}
      </View>

      {/* Standard In-Page Player */}
      {renderPlayer(false)}

      {/* Action Footer */}
      <View style={styles.footerRow}>
        {onMarkComplete && (
          <TouchableOpacity
            style={[styles.markCompleteBtn, isCompleted && styles.markCompleteBtnDone]}
            activeOpacity={0.85}
            onPress={onMarkComplete}
            disabled={isCompleted}
          >
            <CheckCircle2 size={15} color={isCompleted ? '#00D084' : '#070C18'} />
            <Text style={[styles.markCompleteBtnText, isCompleted && styles.markCompleteBtnTextDone]}>
              {isCompleted ? 'Completed (+XP Earned)' : `Mark Complete (+${xpReward} XP)`}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Fullscreen Player Modal */}
      <Modal visible={isFullscreen} animationType="fade" transparent={false} onRequestClose={() => setIsFullscreen(false)}>
        <View style={styles.fullscreenModalContainer}>{renderPlayer(true)}</View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 14,
    gap: 12,
    marginVertical: 4,
  },
  infoSection: {
    gap: 4,
  },
  titleText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F8FAFC',
    lineHeight: 20,
  },
  summaryText: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
  },
  playerBox: {
    backgroundColor: '#070C18',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  playerBoxFullscreen: {
    flex: 1,
    borderRadius: 0,
    borderWidth: 0,
    backgroundColor: '#000000',
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#090E1A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  icleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 208, 132, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 208, 132, 0.3)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  icleBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#00D084',
    letterSpacing: 0.3,
  },
  channelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  channelBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#38BDF8',
  },
  durationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#1E293B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  durationPillText: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '700',
  },
  playerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  controlPill: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: '#131F37',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  embedContainer: {
    width: '100%',
    height: 220,
    backgroundColor: '#000000',
    position: 'relative',
  },
  embedContainerFullscreen: {
    flex: 1,
    height: '100%',
  },
  nativeWebView: {
    width: '100%',
    height: 220,
    backgroundColor: '#000000',
  },
  nativeWebViewFullscreen: {
    flex: 1,
    height: '100%',
  },
  loadingOverlay: {
    ...(StyleSheet.absoluteFill as any),
    backgroundColor: '#070C18',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    zIndex: 10,
  },
  loadingText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 2,
  },
  markCompleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#00D084',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    shadowColor: '#00D084',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  markCompleteBtnDone: {
    backgroundColor: 'rgba(0, 208, 132, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 208, 132, 0.3)',
    shadowOpacity: 0,
    elevation: 0,
  },
  markCompleteBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#070C18',
  },
  markCompleteBtnTextDone: {
    color: '#00D084',
  },
  fullscreenModalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
