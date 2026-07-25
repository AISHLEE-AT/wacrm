// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { ExternalLink, RefreshCw, Tv } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function TvOPage() {
  const [sessionParams, setSessionParams] = useState('');
  const [iframeUrl, setIframeUrl] = useState('https://thamizhan.vercel.app/tvo');

  const supabase = createClient();

  useEffect(() => {
    async function syncSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const tokens = `?access_token=${encodeURIComponent(session.access_token)}&refresh_token=${encodeURIComponent(session.refresh_token)}`;
          setSessionParams(tokens);
          setIframeUrl(`https://thamizhan.vercel.app/tvo${tokens}`);
        }
      } catch (err) {
        console.error('Session sync error:', err);
      }
    }
    syncSession();
  }, []);

  return (
    <div className="w-full h-[calc(100vh-5rem)] flex flex-col space-y-3 p-2 sm:p-4">
      <div className="flex items-center justify-between bg-card/80 border border-white/10 px-4 py-2.5 rounded-2xl shadow-sm backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2">
          <Tv className="w-5 h-5 text-purple-400" />
          <h1 className="text-sm sm:text-base font-bold text-foreground">
            TvO - Aishlee Technology Live Streaming & Video Channels
          </h1>
          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            Live Connected Module
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const base = 'https://thamizhan.vercel.app/tvo';
              setIframeUrl(sessionParams ? `${base}${sessionParams}` : base);
            }}
            className="p-2 rounded-xl bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground text-xs flex items-center gap-1 transition"
            title="Refresh Module"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <a
            href={iframeUrl}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 shadow transition"
          >
            Open Full Screen <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      <div className="w-full flex-1 bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
        <iframe
          src={iframeUrl}
          title="Aishlee TvO Channels"
          className="w-full h-full border-0 rounded-2xl"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; camera; microphone"
          allowFullScreen
        />
      </div>
    </div>
  );
}
