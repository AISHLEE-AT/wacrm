// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Wrench, ExternalLink, RefreshCw, ShieldCheck } from 'lucide-react';

export default function ToolsOPage() {
  const { user, profile } = useAuth();
  const [iframeUrl, setIframeUrl] = useState('https://thamizhan.vercel.app/toolso');
  const [key, setKey] = useState(0);

  const supabase = createClient();

  useEffect(() => {
    async function syncAishleeSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const phone = profile?.phone || user?.phone || user?.email?.split('@')[0] || '';
        const name = profile?.full_name || user?.user_metadata?.full_name || 'User';

        let params = `?embed=true&phone=${encodeURIComponent(phone)}&name=${encodeURIComponent(name)}`;
        if (session) {
          params += `&access_token=${encodeURIComponent(session.access_token)}&refresh_token=${encodeURIComponent(session.refresh_token)}#access_token=${session.access_token}&refresh_token=${session.refresh_token}&token_type=bearer`;
        }
        setIframeUrl(`https://thamizhan.vercel.app/toolso${params}`);
      } catch (err) {
        console.error('SSO sync error:', err);
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
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-extrabold text-white flex items-center gap-2">
              ToolsO • வணிகக் கருவிகள் & கணிப்பான்
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Business Calculators & Agri Seed Calculators from Aishlee Web
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> SSO Connected
          </span>
          <button
            onClick={handleRefresh}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs flex items-center gap-1 transition"
            title="Refresh Window"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <a
            href={iframeUrl}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition"
          >
            Full Screen <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Embedded Aishlee Web Window Container */}
      <div className="flex-1 w-full bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
        <iframe
          key={key}
          src={iframeUrl}
          title="Aishlee ToolsO Module Window"
          className="w-full h-full border-0"
          allow="camera; microphone; geolocation; clipboard-write; encrypted-media; autoplay"
        />
      </div>
    </div>
  );
}
