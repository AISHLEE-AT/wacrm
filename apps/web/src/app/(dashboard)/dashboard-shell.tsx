"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { PresenceHeartbeat } from "@/components/presence/presence-heartbeat";
import { MessageCircle } from "lucide-react";

// Auth-gated dashboard shell. Extracted from the layout so the layout
// itself can stay a server component and export metadata (noindex) —
// client components can't export Next's metadata object.

import { checkIsAdmin } from "@/lib/auth/admin";

import { createClient } from "@/lib/supabase/client";

function DashboardShellInner({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isEmbed = searchParams.get("embed") === "true";

  // Sidebar drawer state — only used on mobile. On lg+ the sidebar is
  // always visible and this stays at `false` (ignored by the component).
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const isAdmin = checkIsAdmin(user, profile ?? undefined);

  useEffect(() => {
    if (!loading && !user && !isEmbed) {
      router.push("/login");
      return;
    }
  }, [user, loading, isAdmin, pathname, router, isEmbed]);

  const supabase = createClient();
  const lastTrackedModuleRef = useRef<string | null>(null);

  // Track module visits to update "last visited module" in Supabase
  useEffect(() => {
    if (!user || !profile || !pathname) return;

    const topLevelModules = ['/crm', '/rideo', '/drivo', '/gameo', '/teacho', '/agro', '/dealo', '/touro', '/moneyo', '/toolso', '/testo', '/tvo', '/tasko', '/tradeo'];
    
    // Check if the current route belongs to a top-level module
    const currentModule = topLevelModules.find(m => pathname === m || pathname.startsWith(`${m}/`));
    
    if (currentModule && lastTrackedModuleRef.current !== currentModule) {
      lastTrackedModuleRef.current = currentModule;
      
      // Fire and forget
      supabase
        .from('profiles')
        .update({ default_module: currentModule })
        .eq('id', user.id)
        .then(({ error }) => {
          if (error) console.error("Failed to update last visited module:", error);
        });
    }
  }, [pathname, user, profile, supabase]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user && !isEmbed) return null;

  if (isEmbed) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <main className="flex-1 overflow-y-auto w-full h-full">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Reports this tab's online/away presence once we know a user is
          signed in. Headless — renders nothing. */}
      <PresenceHeartbeat />
      <Sidebar open={sidebarOpen} onClose={closeSidebar} />
      <div className="flex flex-1 flex-col overflow-hidden relative">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />
        {/* Thinner horizontal padding on mobile so cards have room to breathe. */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

import { Suspense } from "react";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Suspense fallback={
        <div className="flex h-screen items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }>
        <DashboardShellInner>{children}</DashboardShellInner>
      </Suspense>
    </AuthProvider>
  );
}
