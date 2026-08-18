"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Car,
  Tractor,
  Truck,
  GraduationCap,
  FileCheck,
  MessageSquare,
  Gamepad2,
  Settings,
  LayoutGrid,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppLauncherModal } from "./app-launcher-modal";

const PRIMARY_DOCK_ITEMS = [
  { href: "/rideo", label: "RideO", tamil: "டாக்ஸி", icon: Car, color: "text-emerald-400" },
  { href: "/rento", label: "RentO", tamil: "வாடகை", icon: Tractor, color: "text-amber-400" },
  { href: "/drivo", label: "DriveO", tamil: "ஓட்டுநர்", icon: Truck, color: "text-cyan-400" },
  { href: "/teacho", label: "TeachO", tamil: "கல்வி", icon: GraduationCap, color: "text-indigo-400" },
  { href: "/testo", label: "TestO", tamil: "தேர்வு", icon: FileCheck, color: "text-purple-400" },
  { href: "/inbox", label: "CRM", tamil: "இன்பாக்ஸ்", icon: MessageSquare, color: "text-emerald-400" },
  { href: "/agro", label: "AgrO", tamil: "உழவர்", icon: Tractor, color: "text-emerald-400" },
  { href: "/profile", label: "Profile", tamil: "சுயவிவரம்", icon: Settings, color: "text-zinc-300" },
];

export function FloatingDock() {
  const pathname = usePathname();
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);

  return (
    <>
      {/* Floating Bottom Glass Dock */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-[94vw] sm:max-w-fit">
        <nav className="flex items-center gap-1 sm:gap-1.5 p-1.5 sm:p-2 rounded-3xl bg-card/85 backdrop-blur-2xl border border-border/80 shadow-2xl shadow-black/50 transition-all hover:border-foreground/20">
          {PRIMARY_DOCK_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex flex-col items-center justify-center w-12 sm:w-14 h-12 sm:h-14 rounded-2xl transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/70 hover:scale-105"
                )}
              >
                <Icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", !isActive && item.color)} />
                <span className="text-[9px] font-bold tracking-tight mt-0.5 sm:mt-1 truncate max-w-[48px]">
                  {item.label}
                </span>

                {/* Active Indicator Dot */}
                {isActive && (
                  <span className="absolute -top-1 w-1.5 h-1.5 rounded-full bg-primary-foreground ring-2 ring-primary" />
                )}
              </Link>
            );
          })}

          {/* Vertical Separator */}
          <div className="h-8 w-[1px] bg-border/80 mx-1" />

          {/* All Modules App Launcher Button */}
          <button
            onClick={() => setIsLauncherOpen(true)}
            className="group flex flex-col items-center justify-center w-12 sm:w-14 h-12 sm:h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:scale-105 shadow-md shadow-primary/10"
            title="Open all 16+ modules (Cmd+K)"
          >
            <LayoutGrid className="w-5 h-5 transition-transform group-hover:rotate-90" />
            <span className="text-[9px] font-bold mt-0.5 sm:mt-1">All Apps</span>
          </button>
        </nav>
      </div>

      {/* App Launcher Overlay Modal */}
      <AppLauncherModal isOpen={isLauncherOpen} onClose={() => setIsLauncherOpen(false)} />
    </>
  );
}
