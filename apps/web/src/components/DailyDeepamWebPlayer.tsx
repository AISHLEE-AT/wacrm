'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, Play } from 'lucide-react';

interface DailyDeepamWebPlayerProps {
  videoId: string;
  videoTitle?: string;
  onVideoEnded: () => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function DailyDeepamWebPlayer({
  videoId,
  videoTitle,
  onVideoEnded,
}: DailyDeepamWebPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasEnded, setHasEnded] = useState(false);
  const [canSkip, setCanSkip] = useState(false);
  const isEndingRef = useRef(false);
  const playerRef = useRef<any>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerFinish = () => {
    if (isEndingRef.current) return;
    isEndingRef.current = true;
    setHasEnded(true);
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    onVideoEnded();
  };

  useEffect(() => {
    // Enable Skip button after 3s
    const skipTimer = setTimeout(() => {
      setCanSkip(true);
    }, 3000);

    // Load YouTube IFrame API if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const checkVideoProgress = () => {
      if (isEndingRef.current || !playerRef.current) return;
      try {
        if (playerRef.current.getCurrentTime && playerRef.current.getDuration) {
          const current = playerRef.current.getCurrentTime();
          const duration = playerRef.current.getDuration();
          // Auto-trigger completion 0.35s before video ends to hide suggestions
          if (duration > 0 && duration - current <= 0.35) {
            triggerFinish();
          }
        }
      } catch (_) {}
    };

    const initPlayer = () => {
      try {
        playerRef.current = new window.YT.Player('deepam-web-player', {
          videoId: videoId,
          playerVars: {
            autoplay: 1,
            mute: 0,
            controls: 0,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            iv_load_policy: 3,
            fs: 0,
            disablekb: 1,
            showinfo: 0,
            origin: window.location.origin,
          },
          events: {
            onReady: (e: any) => {
              setIsLoading(false);
              try {
                e.target.playVideo();
              } catch (_) {}
            },
            onStateChange: (e: any) => {
              if (e.data === 1 || e.data === 3) {
                setIsLoading(false);
                if (!pollTimerRef.current) {
                  pollTimerRef.current = setInterval(checkVideoProgress, 150);
                }
              } else if (e.data === 0) {
                triggerFinish();
              }
            },
            onError: () => {
              setIsLoading(false);
            },
          },
        });
      } catch (_) {
        setIsLoading(false);
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      clearTimeout(skipTimer);
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      try {
        if (playerRef.current && playerRef.current.destroy) {
          playerRef.current.destroy();
        }
      } catch (_) {}
    };
  }, [videoId]);

  return (
    <div className="bg-[#0e1628] border border-emerald-500/30 rounded-2xl p-4 shadow-xl overflow-hidden space-y-3">
      {/* Header Banner */}
      <div className="flex items-center justify-center gap-2 text-center">
        <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
        <span className="text-xs font-black tracking-wider text-amber-400 uppercase">
          ✦ TODAY&apos;S SUPRO DEEPAM BROADCAST ✦
        </span>
        <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
      </div>

      <p className="text-[11px] text-gray-400 text-center font-medium line-clamp-1">
        {videoTitle || 'SuprO commercial ad #suprotrailer #suprotec #supro'}
      </p>

      {/* Video Container with CSS cropping to hide YouTube branding */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-emerald-500/20 shadow-inner">
        {isLoading && (
          <div className="absolute inset-0 bg-[#0a0f1e]/90 flex flex-col items-center justify-center gap-2 z-20">
            <div className="animate-spin h-6 w-6 border-2 border-emerald-400 border-t-transparent rounded-full" />
            <span className="text-xs text-emerald-400 font-bold">Starting Daily Broadcast...</span>
          </div>
        )}

        <div className="absolute -top-[12%] -left-[2%] w-[104%] h-[124%] pointer-events-none">
          <div id="deepam-web-player" className="w-full h-full" />
        </div>

        {hasEnded && (
          <div className="absolute inset-0 bg-[#0a0f1e]/95 flex flex-col items-center justify-center gap-1 z-30">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-bounce" />
            <span className="text-sm font-bold text-white">Broadcast Completed</span>
            <span className="text-xs text-emerald-400">Login Unlocked!</span>
          </div>
        )}
      </div>

      {/* Footer / Skip Actions */}
      <div className="flex items-center justify-between pt-1 text-xs">
        <div className="flex items-center gap-1.5 text-gray-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[10px] text-emerald-400 font-bold">1st Start Daily Message</span>
        </div>

        {canSkip && !hasEnded && (
          <button
            type="button"
            onClick={triggerFinish}
            className="flex items-center gap-1 px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-black rounded-lg border border-emerald-500/40 transition text-xs"
          >
            Continue to Login <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
