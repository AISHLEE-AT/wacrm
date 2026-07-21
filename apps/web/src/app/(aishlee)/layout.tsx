// @ts-nocheck
import React from 'react';
import { AppProvider } from '@/aishlee/context/AppProvider';
import { GamificationProvider } from '@/aishlee/context/GamificationProvider';
import MainLayout from '@/aishlee/components/layout/MainLayout';
import ErrorBoundary from '@/aishlee/components/ErrorBoundary';
import '@/aishlee/App.css';
import '@/aishlee/index.css';

export default function AishleeRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <GamificationProvider>
        <ErrorBoundary>
          <div className="aishlee-app">
            <MainLayout>
              {children}
            </MainLayout>
          </div>
        </ErrorBoundary>
      </GamificationProvider>
    </AppProvider>
  );
}
