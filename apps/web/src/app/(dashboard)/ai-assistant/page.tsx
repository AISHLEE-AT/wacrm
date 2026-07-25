'use client';

// The AI Assistant has been merged into the unified AI & Tools Hub at /toolso.
// This redirect preserves all existing bookmarks and links.

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AiAssistantRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/toolso?tab=gemini');
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-[#0A0D14]">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
        <p className="text-sm">Redirecting to AI & Tools Hub...</p>
      </div>
    </div>
  );
}
