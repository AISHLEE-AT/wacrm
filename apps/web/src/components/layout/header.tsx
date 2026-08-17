"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, LayoutGrid, MapPin, Sparkles, User, Settings, Shield, CreditCard } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { useState } from "react";
import { AppLauncherModal } from "./app-launcher-modal";

const MODULE_TITLES: Record<string, { name: string; tamil: string; icon: string }> = {
  "/rideo": { name: "RideO", tamil: "பயணி டாக்ஸி", icon: "🚗" },
  "/rento": { name: "RentO", tamil: "விவசாயக் கருவிகள் வாடகை", icon: "🚜" },
  "/drivo": { name: "DriveO", tamil: "ஓட்டுநர் தளம்", icon: "👨‍✈️" },
  "/teacho": { name: "TeachO", tamil: "கல்வி & வகுப்புகள்", icon: "🎓" },
  "/testo": { name: "TestO", tamil: "தேர்வு பயிற்சி மையம்", icon: "📝" },
  "/gameo": { name: "GameO", tamil: "வினாடி வினா & விளையாட்டு", icon: "🎮" },
  "/agro": { name: "AgriO", tamil: "மண்டி விலை & விவசாயம்", icon: "🌾" },
  "/dealo": { name: "DealO", tamil: "உள்ளூர் வணிகம்", icon: "🏪" },
  "/touro": { name: "TourO", tamil: "ஆன்மீக சுற்றுலா", icon: "🗺️" },
  "/tvo": { name: "TvO", tamil: "உள்ளூர் நேரலை டிவி", icon: "📺" },
  "/inbox": { name: "WhatsApp CRM", tamil: "இன்பாக்ஸ்", icon: "💬" },
  "/contacts": { name: "Contacts", tamil: "வாடிக்கையாளர்கள்", icon: "👥" },
  "/dashboard": { name: "Dashboard", tamil: "முகப்பு", icon: "📊" },
  "/wallet": { name: "Wallet & UPI", tamil: "பணப்பை", icon: "💳" },
  "/profile": { name: "Profile & Settings", tamil: "சுயவிவரம்", icon: "👤" },
  "/admin": { name: "Admin Hub", tamil: "நிர்வாகம்", icon: "🛡️" },
};

export function Header({ onOpenSidebar }: { onOpenSidebar?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, signOut } = useAuth();
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);

  const currentMod = Object.entries(MODULE_TITLES).find(([path]) =>
    pathname === path || pathname.startsWith(`${path}/`)
  )?.[1] || { name: "SuprO Ecosystem", tamil: "சுப்ரோ", icon: "✨" };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border/60 bg-card/75 backdrop-blur-xl sticky top-0 z-40 px-4 sm:px-6">
        {/* Left: Brand Logo & Active Module */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-2xl bg-black border border-primary/40 flex items-center justify-center shadow-md shadow-primary/20 transition-transform group-hover:scale-105">
              <img src="/supro-logo-ai.jpg" alt="SuprO" className="w-7 h-7 object-contain rounded-xl" />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-sm font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
                SuprO
              </span>
              <span className="text-[10px] text-muted-foreground font-medium -mt-0.5">Tamil Nadu Ecosystem</span>
            </div>
          </Link>

          {/* Vertical Divider */}
          <div className="h-6 w-[1px] bg-border/80 hidden sm:block" />

          {/* Active Module Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-background/80 border border-border/80 shadow-sm">
            <span className="text-sm">{currentMod.icon}</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs font-bold text-foreground">{currentMod.name}</span>
              <span className="text-[10px] text-muted-foreground hidden md:inline">({currentMod.tamil})</span>
            </div>
          </div>
        </div>

        {/* Center/Right: Location, 9-Dot App Grid, Wallet, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User Location Pill */}
          {profile?.location && (
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium max-w-[200px] truncate">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{profile.location}</span>
            </div>
          )}

          {/* 9-Dot All Apps Button */}
          <button
            onClick={() => setIsLauncherOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 border border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground text-xs font-bold transition-all shadow-sm"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">All Apps</span>
          </button>

          <ModeToggle />

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex items-center gap-2 rounded-xl p-1 transition-colors hover:bg-muted/70 focus:outline-none"
              aria-label="Open user menu"
            >
              <Avatar className="size-8 ring-2 ring-primary/30">
                {profile?.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} alt={profile.full_name ?? "Avatar"} />
                ) : null}
                <AvatarFallback className="bg-emerald-950 text-emerald-300 font-bold text-xs">
                  {profile?.full_name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-xs font-bold text-foreground sm:inline max-w-[120px] truncate">
                {profile?.full_name || "Account"}
              </span>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 bg-card/95 backdrop-blur-xl border border-border/80 rounded-2xl shadow-2xl p-1.5">
              <div className="px-3 py-2 border-b border-border/50">
                <p className="text-xs font-bold text-foreground">{profile?.full_name || "SuprO User"}</p>
                <p className="text-[11px] text-muted-foreground truncate">{profile?.phone || profile?.email || ""}</p>
                {profile?.upi_id && (
                  <p className="text-[10px] text-emerald-400 font-mono mt-0.5">UPI: {profile.upi_id}</p>
                )}
              </div>

              <DropdownMenuItem onClick={() => router.push('/profile')} className="rounded-xl mt-1 flex items-center gap-2 text-xs font-medium cursor-pointer">
                <User className="w-4 h-4 text-primary" />
                <span>My Profile & Location</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => router.push('/wallet')} className="rounded-xl flex items-center gap-2 text-xs font-medium cursor-pointer">
                <CreditCard className="w-4 h-4 text-amber-400" />
                <span>Wallet & Payments</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => router.push('/admin')} className="rounded-xl flex items-center gap-2 text-xs font-medium cursor-pointer">
                <Shield className="w-4 h-4 text-indigo-400" />
                <span>Admin Hub</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1 bg-border/50" />

              <DropdownMenuItem
                onClick={() => signOut()}
                className="rounded-xl text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer text-xs font-semibold"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* App Launcher Overlay Modal */}
      <AppLauncherModal isOpen={isLauncherOpen} onClose={() => setIsLauncherOpen(false)} />
    </>
  );
}
