'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { createClient } from '@/lib/supabase/client';

const AISHLEE_URL =
  process.env.NEXT_PUBLIC_AISHLEE_URL ?? 'https://thamizhan.vercel.app';

interface AishleeEmbedProps {
  /** Path on the Aishlee app, e.g. '/teacho' or '/moneyo' */
  path: string;
  /** Display name shown in the loading/error states */
  moduleName: string;
  /** Accent colour for the module (hex) */
  accentColor?: string;
  /** Icon emoji shown while loading */
  icon?: string;
}

/**
 * Embeds an Aishlee-app page inside an <iframe> with:
 *  - Supabase access/refresh tokens injected via postMessage so the
 *    user is automatically signed in inside the Aishlee frame.
 *  - A native-app flag so Aishlee hides its own navigation.
 *  - A loading skeleton and network-error fallback with retry.
 */
export default function AishleeEmbed({
  path,
  moduleName,
  accentColor = '#10b981',
  icon = 'app',
}: AishleeEmbedProps) {
  const { user } = useAuth();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tokenInjected, setTokenInjected] = useState(false);

  // Build the iframe URL - add embed=true so Aishlee hides its own nav
  let iframeUrl = `${AISHLEE_URL}${path}?embed=true&source=supro`;

  // We need the session tokens directly in the URL because postMessage is often too late 
  // (Next.js middleware already redirects to /login)
  const [sessionTokens, setSessionTokens] = useState<{access: string, refresh: string} | null>(null);

  useEffect(() => {
    async function fetchTokens() {
      if (!user) return;
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        setSessionTokens({
          access: data.session.access_token,
          refresh: data.session.refresh_token
        });
      }
    }
    fetchTokens();
  }, [user]);

  if (sessionTokens) {
    iframeUrl += `&access_token=${sessionTokens.access}&refresh_token=${sessionTokens.refresh}`;
  }

  // Inject Supabase session tokens into the iframe via postMessage
  const injectAuth = useCallback(async () => {
    if (!user || tokenInjected) return;
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      if (session && iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          {
            type: 'SUPRO_AUTH_INJECT',
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            supabaseKey: 'sb-jjgdatjthyeesmgunnlp-auth-token',
            user: { id: user.id, phone: user.phone ?? '', email: user.email ?? '' },
          },
          AISHLEE_URL
        );
        setTokenInjected(true);
      }
    } catch (err) {
      console.error('[AishleeEmbed] auth inject failed:', err);
    }
  }, [user, tokenInjected]);

  const handleLoad = useCallback(() => {
    setLoading(false);
    setError(false);
    setTokenInjected(false);
    setTimeout(() => injectAuth(), 400);
  }, [injectAuth]);

  const handleError = useCallback(() => {
    setLoading(false);
    setError(true);
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.includes('thamizhan.vercel.app') && !origin.includes('localhost')) return;
      if (event.data?.type === 'AISHLEE_READY') injectAuth();
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [injectAuth]);

  const handleRetry = () => {
    setLoading(true);
    setError(false);
    setTokenInjected(false);
    if (iframeRef.current) iframeRef.current.src = iframeUrl;
  };

  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-slate-950" style={{ height: 'calc(100vh - 8rem)', minHeight: '600px' }}>
      {/* Loading skeleton */}
      {loading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950 z-10">
          <div className="flex flex-col items-center gap-2">
            <div className="h-1.5 w-48 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
            <p className="text-sm font-semibold" style={{ color: accentColor }}>Loading {moduleName}...</p>
            <p className="text-xs text-slate-500">Powered by Aishlee Platform</p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3 opacity-20 pointer-events-none">
            {[100, 85, 70, 55].map((w, i) => (
              <div key={i} className="h-12 rounded-xl animate-pulse bg-slate-800" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950 z-10 p-6 text-center">
          <span className="text-5xl">📡</span>
          <div>
            <p className="text-white font-bold text-lg">{moduleName} is unreachable</p>
            <p className="text-slate-400 text-sm mt-1">Check your connection and try again.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRetry}
              className="px-4 py-2 rounded-xl text-sm font-semibold border transition-all hover:opacity-80"
              style={{ borderColor: accentColor, color: accentColor, backgroundColor: `${accentColor}20` }}
            >
              Retry
            </button>
            <a
              href={`${AISHLEE_URL}${path}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all"
            >
              Open in Browser
            </a>
          </div>
        </div>
      )}

      {/* The actual iframe */}
      <iframe
        ref={iframeRef}
        src={iframeUrl}
        title={moduleName}
        onLoad={handleLoad}
        onError={handleError}
        className="w-full h-full border-0"
        style={{ opacity: loading || error ? 0 : 1, transition: 'opacity 0.3s ease' }}
        allow="microphone; camera; geolocation; autoplay; clipboard-write"
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
      />
    </div>
  );
}