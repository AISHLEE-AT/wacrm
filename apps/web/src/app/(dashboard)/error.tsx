'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw, Home, Terminal, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    console.error('Dashboard layout error caught:', error);
  }, [error]);

  const handleClearCacheAndReset = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('tuto_active_course_id');
        localStorage.removeItem('tuto_course_day');
        localStorage.removeItem('tuto_course_xp');
        sessionStorage.clear();
      }
    } catch (e) {}
    reset();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="p-4 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-4 animate-bounce">
        <AlertTriangle className="w-10 h-10" />
      </div>
      <h2 className="text-xl font-bold text-white">Something went wrong</h2>
      <p className="text-xs text-slate-400 max-w-md mt-1 mb-4">
        An error occurred while loading this page. Click below to refresh or navigate back to safety.
      </p>

      {error?.message && (
        <div className="mb-6 max-w-xl w-full text-left bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-mono text-red-400 font-bold flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" /> Error Diagnostic
            </span>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-[11px] text-slate-400 hover:text-white underline"
            >
              {showDetails ? 'Hide Details' : 'Show Stack'}
            </button>
          </div>
          <p className="text-xs font-mono text-red-300 font-semibold break-words">{error.message}</p>
          {error.digest && (
            <p className="text-[10px] font-mono text-slate-500 mt-1">Digest: {error.digest}</p>
          )}
          {showDetails && error.stack && (
            <pre className="mt-3 text-[10px] font-mono text-slate-400 overflow-x-auto p-2 bg-slate-950 rounded-xl max-h-40">
              {error.stack}
            </pre>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => reset()}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-amber-500/20"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
        <button
          onClick={handleClearCacheAndReset}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-700 transition"
        >
          <Trash2 className="w-4 h-4 text-red-400" /> Reset Page Cache
        </button>
        <Link
          href="/rideo"
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-2 border border-slate-700 transition"
        >
          <Home className="w-4 h-4" /> Go to Home
        </Link>
      </div>
    </div>
  );
}
