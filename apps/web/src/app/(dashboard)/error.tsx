'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard layout error caught:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="p-4 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-4">
        <AlertTriangle className="w-10 h-10" />
      </div>
      <h2 className="text-xl font-bold text-foreground">Something went wrong</h2>
      <p className="text-xs text-muted-foreground max-w-md mt-1 mb-6">
        An error occurred while loading this page. Click below to refresh or navigate back to safety.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-2 hover:bg-primary/90 transition shadow"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
        <Link
          href="/rideo"
          className="px-4 py-2 rounded-xl bg-muted text-muted-foreground font-semibold text-xs flex items-center gap-2 hover:bg-muted/80 transition"
        >
          <Home className="w-4 h-4" /> Go to Home
        </Link>
      </div>
    </div>
  );
}
