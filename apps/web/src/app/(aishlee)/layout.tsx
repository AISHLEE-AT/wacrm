// @ts-nocheck
import React from 'react';
import '@/aishlee/App.css';
import '@/aishlee/index.css';

export default function AishleeRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="aishlee-app" style={{ minHeight: '100vh', background: 'var(--background)' }}>
      {children}
    </div>
  );
}
