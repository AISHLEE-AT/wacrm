// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Share2, ExternalLink, RefreshCw, ShieldCheck, Loader2 } from 'lucide-react';

export default function TradeOPage() {
  const { user, profile } = useAuth();
  // null = not yet resolved (show skeleton), string = ready to render
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [key, setKey] = useState(0);

  const supabase = createClient();

  useEffect(() => {
    // ⚡ Only build the iframe URL after we have the user object.
    // Without this guard the iframe loads immediately with phone=''
    // and aishlee-web falls back to id='guest_user'.
    if (user === undefined) return; // still loading auth, wait

    async function syncAishleeSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        // Derive a clean phone number from whatever field is available.
        // WACRM stores phone as the email prefix for WhatsApp users:
        //   e.g. '9344532738@whatsapp.wacrm.local' → '9344532738'
        const rawPhone = profile?.phone
          || user?.phone
          || (user?.email?.includes('@whatsapp.wacrm.local')
              ? user.email.split('@')[0]
              : user?.email?.split('@')[0])
          || '';
        // Keep only digits and take last 10 for local format
        const phone = rawPhone.replace(/\D/g, '').slice(-10);
        const name = profile?.full_name || user?.user_metadata?.full_name || 'User';

        let params = `?embed=true&phone=${encodeURIComponent(phone)}&name=${encodeURIComponent(name)}`;
        if (session) {
          // Pass tokens in BOTH query string AND hash so aishlee-web
          // AppProvider can pick them up regardless of parsing method.
          params += `&access_token=${encodeURIComponent(session.access_token)}`
            + `&refresh_token=${encodeURIComponent(session.refresh_token)}`
            + `#access_token=${session.access_token}`
            + `&refresh_token=${session.refresh_token}`
            + `&token_type=bearer`;
        }
        setIframeUrl(`https://thamizhan.vercel.app/tradeo${params}`);
      } catch (err) {
        console.error('SSO sync error:', err);
        // Fallback: load without SSO so at least the page renders
        setIframeUrl('https://thamizhan.vercel.app/tradeo');
      }
    }
    syncAishleeSession();
  }, [user, profile]);

  const handleRefresh = () => {
    setKey(prev => prev + 1);
  };

  return (
    <div className="w-full h-[calc(100vh-4rem)] flex flex-col p-2 md:p-4 space-y-2 bg-[#0A0D14]">
      {/* Window Header Toolbar */}
      <div className="flex items-center justify-between bg-card/60 border border-white/10 px-4 py-2.5 rounded-2xl shadow-sm backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-extrabold text-white flex items-center gap-2">
              TradeO • மொத்த வர்த்தகம் & சந்தை
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Aishlee Technology B2B & Wholesale Trading Live Connected Module
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
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition"
          >
            Full Screen <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Embedded Aishlee Web Window Container */}
      <div className="flex-1 w-full bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
        {!iframeUrl ? (
          /* Loading skeleton — shown while we wait for auth to resolve */
          <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-slate-500">
            <Loader2 className="w-10 h-10 animate-spin text-cyan-500" />
            <p className="text-sm font-medium">Connecting to Aishlee TradeO…</p>
            <p className="text-xs text-slate-600">Authenticating your session</p>
          </div>
        ) : (
          <iframe
            key={key}
            src={iframeUrl}
            title="Aishlee TradeO Module Window"
            className="w-full h-full border-0"
            allow="camera; microphone; geolocation; clipboard-write; encrypted-media; autoplay"
          />
        )}
      </div>
    </div>
  );
}


