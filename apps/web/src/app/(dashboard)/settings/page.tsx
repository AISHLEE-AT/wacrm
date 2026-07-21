// @ts-nocheck
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Legacy /settings route — redirects to the unified /profile page.
 * Preserves the ?tab= query param so old deep links still work
 * (the unified profile page maps legacy tab names to their new IDs).
 */
export default function SettingsRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tab = searchParams.get('tab');
    const target = tab ? `/profile?tab=${tab}` : '/profile';
    router.replace(target);
  }, [router, searchParams]);

  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Redirecting to Profile...</p>
      </div>
    </div>
  );
}
