'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { createClient } from '@/lib/supabase/client';
import { buildAishleeIframeUrl } from '@/lib/aishlee-sso';
import { RefreshCw, ExternalLink, ShieldCheck } from 'lucide-react';

const AISHLEE_URL =
  process.env.NEXT_PUBLIC_AISHLEE_URL ?? 'https://thamizhan.vercel.app';

interface AishleeEmbedProps {
  /** Path on the Aishlee app, e.g. '/teacho' or '/tvo' or '/moneyo' */
  path: string;
  /** Display name shown in loading/error states */
  moduleName: string;
  /** Accent colour for the module (hex) */
  accentColor?: string;
  /** Icon emoji shown while loading */
  icon?: string;
}

export default function AishleeEmbed({
  path,
  moduleName,
  accentColor = '#10b981',
  icon = '✨',
}: AishleeEmbedProps) {
  const { user, profile } = useAuth();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [session, setSession] = useState<any>(null);

  // Fetch Supabase session for SSO URL injection
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) setSession(data.session);
    });
  }, []);

  const cleanModule = path.replace(/^\//, '');

  // Build the complete SSO iframe URL with embed=true, phone, name, access_token, refresh_token, and gemini_api_key
  const extraParams: Record<string, string> = {};
  if (profile?.gemini_api_key) {
    extraParams.gemini_api_key = profile.gemini_api_key;
  }
  const iframeUrl = buildAishleeIframeUrl(cleanModule, user, profile, session, extraParams);

  const handleLoad = useCallback(() => {
    setLoading(false);
    setError(false);
  }, []);

  const handleError = useCallback(() => {
    setLoading(false);
    setError(true);
  }, []);

  // Safety fallback: Unveil iframe after 3 seconds even if onLoad doesn't fire cleanly
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setError(false);
    if (iframeRef.current) iframeRef.current.src = iframeUrl;
  };

  return (
    <div className="flex flex-col w-full h-[calc(100vh-5rem)] min-h-[640px] rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-950 shadow-2xl">
      {/* Control Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-xs shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <span className="font-bold text-white tracking-wide">{moduleName}</span>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1 font-mono">
            <ShieldCheck className="w-3 h-3" /> Aishlee Live Module
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRetry}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 font-medium"
            title="Reload Module"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Reload</span>
          </button>
          <a
            href={`${AISHLEE_URL}/${cleanModule}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 font-medium"
            title="Open in new window"
          >
            <ExternalLink className="w-3 h-3" />
            <span className="hidden sm:inline">Direct Tab</span>
          </a>
        </div>
      </div>

      {/* Frame Container */}
      <div className="relative flex-1 w-full bg-slate-950 overflow-hidden">
        {/* Loading overlay */}
        {loading && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950 z-10 p-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="h-1.5 w-48 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
              <p className="text-sm font-semibold mt-2" style={{ color: accentColor }}>
                Loading {moduleName}...
              </p>
              <p className="text-xs text-slate-500">Aishlee Web App Module</p>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950 z-10 p-6 text-center">
            <span className="text-5xl">📡</span>
            <div>
              <p className="text-white font-bold text-lg">{moduleName} Module Unavailable</p>
              <p className="text-slate-400 text-sm mt-1">Check your network connection and retry.</p>
            </div>
            <div className="flex gap-3 mt-2">
              <button
                onClick={handleRetry}
                className="px-4 py-2 rounded-xl text-sm font-semibold border transition-all hover:opacity-80"
                style={{ borderColor: accentColor, color: accentColor, backgroundColor: `${accentColor}20` }}
              >
                Retry
              </button>
              <a
                href={`${AISHLEE_URL}/${cleanModule}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all"
              >
                Open Direct Tab
              </a>
            </div>
          </div>
        )}

        {/* The iframe */}
        <iframe
          ref={iframeRef}
          src={iframeUrl}
          title={moduleName}
          onLoad={handleLoad}
          onError={handleError}
          className="w-full h-full border-0"
          style={{ opacity: loading || error ? 0 : 1, transition: 'opacity 0.3s ease' }}
          allow="microphone; camera; geolocation; autoplay; clipboard-write; display-capture"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
        />
      </div>
    </div>
  );
}