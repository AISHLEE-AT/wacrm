'use client';

import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface IframeWrapperProps {
  modulePath: string; // e.g. "/teacho"
}

export default function IframeWrapper({ modulePath }: IframeWrapperProps) {
  const { session } = useAuth();
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);

  useEffect(() => {
    // Determine target URL
    const baseUrl = 'https://thamizhan.vercel.app';
    const targetUrl = new URL(modulePath, baseUrl);
    
    // Add referral to distinguish embedded mode if needed
    targetUrl.searchParams.set('ref', 'wacrm_embed');

    // Add session tokens to URL if they exist
    if (session?.access_token && session?.refresh_token) {
      targetUrl.searchParams.set('sb_access_token', session.access_token);
      targetUrl.searchParams.set('sb_refresh_token', session.refresh_token);
    }

    setIframeUrl(targetUrl.toString());
  }, [modulePath, session]);

  if (!iframeUrl) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#0A0D14]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <p className="text-sm text-slate-400">Loading module...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] w-full bg-[#0A0D14] overflow-hidden">
      <iframe
        src={iframeUrl}
        className="h-full w-full border-none"
        allow="camera *; microphone *; geolocation *; clipboard-read *; clipboard-write *"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads"
        title={`Module ${modulePath}`}
      />
    </div>
  );
}
