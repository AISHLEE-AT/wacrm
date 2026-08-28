'use client';

import React, { useState } from 'react';
import {
  Maximize2,
  Minimize2,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface ImmersiveVideoWebPlayerProps {
  videoId: string;
  title: string;
  channelName?: string;
  summary?: string;
  durationMinutes?: number;
  isCompleted?: boolean;
  onMarkComplete?: () => void;
  xpReward?: number;
}

export const ImmersiveVideoWebPlayer: React.FC<ImmersiveVideoWebPlayerProps> = ({
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
  const [reloadKey, setReloadKey] = useState(0);

  const cleanId = (videoId || '').replace(/[^a-zA-Z0-9-_]/g, '').trim() || 'dQw4w9WgXcQ';
  const embedUrl = `https://www.youtube-nocookie.com/embed/${cleanId}?modestbranding=1&rel=0&iv_load_policy=3&playsinline=1&enablejsapi=1&fs=1&controls=1`;
  const isIcleOfficial = (channelName || '').toLowerCase().includes('icle');

  return (
    <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4 space-y-3.5 shadow-xl">
      {/* Title & Channel Header */}
      <div className="space-y-1">
        <h4 className="text-sm md:text-base font-bold text-white leading-snug">{title}</h4>
        {summary && <p className="text-xs text-slate-400 leading-relaxed">{summary}</p>}
      </div>

      {/* Player Box */}
      <div
        className={`bg-[#070C18] border border-slate-800 rounded-xl overflow-hidden shadow-2xl transition-all ${
          isFullscreen ? 'fixed inset-0 z-50 rounded-none bg-black flex flex-col p-4' : ''
        }`}
      >
        {/* Header Bar */}
        <div className="px-3.5 py-2.5 bg-[#090E1A] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isIcleOfficial ? (
              <span className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-[#00D084] text-[10px] font-black px-2.5 py-1 rounded-md tracking-wide">
                <ShieldCheck className="w-3.5 h-3.5" />
                ICLE TECHNOLOGY OFFICIAL
              </span>
            ) : (
              <span className="flex items-center gap-1.5 bg-sky-500/10 border border-sky-500/30 text-sky-400 text-[10px] font-extrabold px-2.5 py-1 rounded-md">
                <Sparkles className="w-3.5 h-3.5" />
                {channelName.toUpperCase()}
              </span>
            )}

            <span className="flex items-center gap-1 bg-slate-800/80 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded">
              <Clock className="w-3 h-3" />
              {durationMinutes} Min
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Replay */}
            <button
              type="button"
              onClick={() => setReloadKey((k) => k + 1)}
              title="Reload Video"
              className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* 16:9 Video Container */}
        <div className={`w-full bg-black relative ${isFullscreen ? 'flex-1 h-full' : 'aspect-video'}`}>
          <iframe
            key={`web_${cleanId}_${reloadKey}`}
            src={embedUrl}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
          />
        </div>
      </div>

      {/* Footer Complete Button */}
      {onMarkComplete && (
        <div className="flex items-center justify-end pt-1">
          <button
            type="button"
            onClick={onMarkComplete}
            disabled={isCompleted}
            className={`flex items-center gap-2 text-xs font-black px-4 py-2 rounded-xl transition shadow-md ${
              isCompleted
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 cursor-default'
                : 'bg-[#00D084] hover:bg-[#00B774] text-[#070C18] hover:scale-[1.02]'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isCompleted ? 'Completed (+XP Earned)' : `Mark Complete (+${xpReward} XP)`}</span>
          </button>
        </div>
      )}
    </div>
  );
};
