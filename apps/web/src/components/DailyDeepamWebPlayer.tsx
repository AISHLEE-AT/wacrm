'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, Volume2, VolumeX, Play } from 'lucide-react';

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
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const isEndingRef = useRef(false);
  const playerRef = useRef<any>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerFinish = () => {
    if (isEndingRef.current) return;
    isEndingRef.current = true;
    setHasEnded(true);
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    
    // Automatically transition to login within 400ms
    setTimeout(() => {
      onVideoEnded();
    }, 400);
  };

  const attemptUnmute = () => {
    if (!playerRef.current) return;
    try {
      playerRef.current.unMute();
      playerRef.current.setVolume(100);
      if (!playerRef.current.isMuted()) {
        setIsMuted(false);
      }
    } catch (_) {}
  };

  const toggleSound = () => {
    if (!playerRef.current) return;
    try {
      if (playerRef.current.isMuted()) {
        playerRef.current.unMute();
        playerRef.current.setVolume(100);
        setIsMuted(false);
      } else {
        playerRef.current.mute();
        setIsMuted(true);
      }
    } catch (_) {}
  };

  const resumePlay = () => {
    if (!playerRef.current) return;
    try {
      playerRef.current.playVideo();
      playerRef.current.unMute();
      playerRef.current.setVolume(100);
      setIsMuted(false);
      setIsPlaying(true);
    } catch (_) {}
  };

  useEffect(() => {
    // Enable Skip button after 3s
    const skipTimer = setTimeout(() => {
      setCanSkip(true);
    }, 3000);

    // Global listener to immediately unlock and enable audio on any user interaction with the page
    const handleGlobalInteraction = () => {
      attemptUnmute();
      if (playerRef.current) {
        try {
          playerRef.current.playVideo();
        } catch (_) {}
      }
    };

    window.addEventListener('click', handleGlobalInteraction, { passive: true });
    window.addEventListener('touchstart', handleGlobalInteraction, { passive: true });
    window.addEventListener('pointerdown', handleGlobalInteraction, { passive: true });
    window.addEventListener('mousemove', handleGlobalInteraction, { passive: true, once: true });
    window.addEventListener('keydown', handleGlobalInteraction, { passive: true });

    const checkVideoProgress = () => {
      if (isEndingRef.current || !playerRef.current) return;
      try {
        if (playerRef.current.getCurrentTime && playerRef.current.getDuration) {
          const current = playerRef.current.getCurrentTime();
          const duration = playerRef.current.getDuration();
          // Auto-trigger completion 0.35s before video ends to prevent end-screen suggestions
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
            mute: 1, // Start muted for 100% browser autoplay guarantee
            controls: 0,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            iv_load_policy: 3,
            fs: 0,
            disablekb: 1,
            autohide: 1,
            showinfo: 0,
            origin: typeof window !== 'undefined' ? window.location.origin : 'https://watscrm.vercel.app',
          },
          events: {
            onReady: (e: any) => {
              setIsLoading(false);
              setIsPlaying(true);
              try {
                e.target.playVideo();
                // Attempt unmute immediately
                e.target.unMute();
                e.target.setVolume(100);
                setIsMuted(e.target.isMuted ? e.target.isMuted() : false);
              } catch (_) {
                setIsMuted(true);
              }
            },
            onStateChange: (e: any) => {
              if (e.data === 1) {
                // Playing
                setIsLoading(false);
                setIsPlaying(true);
                // Attempt auto unmute during playback
                try {
                  e.target.unMute();
                  e.target.setVolume(100);
                  if (e.target.isMuted && !e.target.isMuted()) {
                    setIsMuted(false);
                  }
                } catch (_) {}

                if (!pollTimerRef.current) {
                  pollTimerRef.current = setInterval(checkVideoProgress, 120);
                }
              } else if (e.data === 2) {
                // Paused
                setIsPlaying(false);
              } else if (e.data === 0) {
                // Ended
                triggerFinish();
              }
            },
            onError: () => {
              setIsLoading(false);
              // In case of any playback error, smoothly proceed to login
              setTimeout(() => {
                triggerFinish();
              }, 1500);
            },
          },
        });
      } catch (_) {
        setIsLoading(false);
      }
    };

    // Load YouTube IFrame API if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = initPlayer;
    } else if (window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      clearTimeout(skipTimer);
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      window.removeEventListener('click', handleGlobalInteraction);
      window.removeEventListener('touchstart', handleGlobalInteraction);
      window.removeEventListener('pointerdown', handleGlobalInteraction);
      window.removeEventListener('keydown', handleGlobalInteraction);
      try {
        if (playerRef.current && playerRef.current.destroy) {
          playerRef.current.destroy();
        }
      } catch (_) {}
    };
  }, [videoId]);

  return (
    <div className="bg-[#0e1628] border border-emerald-500/30 rounded-2xl p-4 shadow-2xl overflow-hidden space-y-3">
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

      {/* Video Container with aggressive CSS cropping to hide YouTube top branding & controls */}
      <div 
        onClick={resumePlay}
        className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-emerald-500/20 shadow-inner group cursor-pointer"
      >
        {isLoading && (
          <div className="absolute inset-0 bg-[#0a0f1e]/90 flex flex-col items-center justify-center gap-2 z-20 pointer-events-none">
            <div className="animate-spin h-6 w-6 border-2 border-emerald-400 border-t-transparent rounded-full" />
            <span className="text-xs text-emerald-400 font-bold">Starting Daily Broadcast...</span>
          </div>
        )}

        {/* Cropped YouTube Frame */}
        <div className="absolute -top-[16%] -left-[3%] w-[106%] h-[132%] pointer-events-none">
          <div id="deepam-web-player" className="w-full h-full" />
        </div>

        {/* Custom Clean Overlay Controls */}
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          {!isPlaying && !isLoading && !hasEnded && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); resumePlay(); }}
              className="p-4 rounded-full bg-emerald-500/90 hover:bg-emerald-400 text-white shadow-xl hover:scale-110 active:scale-95 transition flex items-center justify-center pointer-events-auto"
            >
              <Play className="w-7 h-7 fill-white translate-x-0.5" />
            </button>
          )}
        </div>

        {/* Audio Toggle Floating Button */}
        {!isLoading && !hasEnded && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); toggleSound(); }}
            className="absolute top-2 right-2 z-20 px-2.5 py-1 rounded-full bg-black/70 hover:bg-black/90 text-white text-[11px] font-bold border border-white/20 backdrop-blur-md flex items-center gap-1.5 transition pointer-events-auto shadow-md"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-300">Tap for Sound</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Sound ON 🔊</span>
              </>
            )}
          </button>
        )}

        {/* Completion Transition Overlay */}
        {hasEnded && (
          <div className="absolute inset-0 bg-[#0a0f1e]/95 flex flex-col items-center justify-center gap-1.5 z-30 animate-in fade-in duration-300 pointer-events-none">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-bounce" />
            <span className="text-sm font-bold text-white">Broadcast Completed</span>
            <span className="text-xs text-emerald-400 font-medium">Entering SuprO Login...</span>
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
