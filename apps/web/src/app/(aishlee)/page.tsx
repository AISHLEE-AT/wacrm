"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // If the module selector is handled by MainLayout, we just wait.
    // If a module was already selected, MainLayout won't show the selector,
    // so we should redirect to their last module or home.
    const lastModule = typeof window !== 'undefined' ? window.sessionStorage.getItem('aishlee_last_module') : null;
    if (lastModule) {
      router.push(lastModule);
    }
  }, [router]);

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
      {/* Module selector overlay from MainLayout will cover this */}
    </div>
  );
}
