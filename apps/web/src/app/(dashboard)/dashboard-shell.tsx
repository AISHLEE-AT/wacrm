"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { PresenceHeartbeat } from "@/components/presence/presence-heartbeat";
import { MessageCircle } from "lucide-react";

// Auth-gated dashboard shell. Extracted from the layout so the layout
// itself can stay a server component and export metadata (noindex) —
// client components can't export Next's metadata object.

function DashboardShellInner({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Sidebar drawer state — only used on mobile. On lg+ the sidebar is
  // always visible and this stays at `false` (ignored by the component).
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const ADMINS = ["919486335870", "9486335870", "919123596988", "9123596988", "aishleetechnology@gmail.com"];
  const isAdmin = ADMINS.some(admin => 
    profile?.email?.includes(admin) || profile?.phone?.includes(admin) || user?.phone?.includes(admin) || user?.email?.includes(admin)
  );

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    if (!loading && user) {
      // Allow all users to access the CRM paths (WhatsApp CRM)
    }
  }, [user, loading, isAdmin, pathname, router]);

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

  if (!user) return null;

  if (!isAdmin) {
    return (
      <div className="flex h-screen overflow-hidden bg-background w-full relative">
        <PresenceHeartbeat />
        <main className="flex-1 overflow-y-auto w-full">{children}</main>
        
        {/* WhatsApp Help Button */}
        <a 
          href="https://wa.me/916381029380?text=Hi%20Fago%20Support,%20I%20need%20help!" 
          target="_blank" 
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center gap-2 bg-[#25D366] text-white px-5 py-3 rounded-full font-bold shadow-lg hover:bg-[#20bd5a] hover:scale-105 transition-all"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="hidden sm:inline">Help</span>
        </a>
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

        {/* WhatsApp Help Button for Admins too */}
        <a 
          href="https://wa.me/916381029380?text=Hi%20Fago%20Support,%20I%20need%20help!" 
          target="_blank" 
          rel="noopener noreferrer"
          className="absolute bottom-6 right-6 z-50 flex items-center justify-center gap-2 bg-[#25D366] text-white px-5 py-3 rounded-full font-bold shadow-lg hover:bg-[#20bd5a] hover:scale-105 transition-all"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="hidden sm:inline">Help</span>
        </a>
      </div>
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardShellInner>{children}</DashboardShellInner>
    </AuthProvider>
  );
}
