// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { CheckSquare, ExternalLink, RefreshCw, ShieldCheck, Loader2 } from 'lucide-react';
import { buildAishleeIframeUrl } from '@/lib/aishlee-sso';

export default function TaskOPage() {
  const { user, profile } = useAuth();
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [key, setKey] = useState(0);

  const supabase = createClient();

  useEffect(() => {
    // ⚡ Fully rewritten from old pattern (no useAuth, no phone, no embed=true)
    // to match the standard WACRM SSO pattern used by TradeO, MoneyO, etc.
    if (user === undefined) return; // wait for auth to resolve

    async function syncAishleeSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIframeUrl(buildAishleeIframeUrl('tasko', user, profile, session));
      } catch (err) {
        console.error('TaskO SSO sync error:', err);
        setIframeUrl('https://thamizhan.vercel.app/tasko');
      }
    }
    syncAishleeSession();
  }, [user, profile]);

  const handleRefresh = () => setKey(prev => prev + 1);

  return (
    <div className="w-full h-[calc(100vh-4rem)] flex flex-col p-2 md:p-4 space-y-2 bg-[#0A0D14]">
      {/* Window Header Toolbar */}
      <div className="flex items-center justify-between bg-card/60 border border-white/10 px-4 py-2.5 rounded-2xl shadow-sm backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-extrabold text-white flex items-center gap-2">
              TaskO • பணிகள் & பாடல்வரி
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Aishlee Technology Daily Tasks & Surveys — Live Connected Module
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> SSO Connected
          </span>
          <button
            onClick={handleRefresh}
            disabled={!iframeUrl}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs flex items-center gap-1 transition disabled:opacity-40"
            title="Refresh Window"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <a
            href={iframeUrl ?? '#'}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs flex items-center gap-1.5 shadow transition"
          >
            Full Screen <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Embedded Aishlee Web Window Container */}
      <div className="flex-1 w-full bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
        {!iframeUrl ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-slate-500">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
            <p className="text-sm font-medium">Connecting to Aishlee TaskO…</p>
            <p className="text-xs text-slate-600">Authenticating your session</p>
          </div>
        ) : (
          <iframe
            key={key}
            src={iframeUrl}
            title="Aishlee TaskO Module Window"
            className="w-full h-full border-0"
            allow="camera; microphone; geolocation; clipboard-write; encrypted-media; autoplay"
          />
        )}
      </div>
    </div>
  );
}
