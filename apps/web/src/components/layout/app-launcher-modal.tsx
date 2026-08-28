"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Car,
  Tractor,
  Truck,
  GraduationCap,
  FileCheck,
  Gamepad2,
  Tv,
  Store,
  Compass,
  MessageSquare,
  Users,
  Shield,
  Zap,
  Bot,
  Settings,
  Search,
  X,
  Sparkles,
  LayoutGrid,
  TrendingUp,
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModuleItem {
  id: string;
  href: string;
  name: string;
  tamilName: string;
  category: "mobility" | "learning" | "commerce" | "crm" | "account";
  icon: any;
  color: string;
  bgGradient: string;
  badge?: string;
  description: string;
}

export const ALL_MODULES: ModuleItem[] = [
  // Mobility & Transport
  {
    id: "rideo",
    href: "/rideo",
    name: "RideO",
    tamilName: "பயணி டாக்ஸி",
    category: "mobility",
    icon: Car,
    color: "text-emerald-400",
    bgGradient: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30",
    badge: "11 Categories",
    description: "Book Auto, Bike, Cabs & Buses instantly"
  },
  {
    id: "rento",
    href: "/rento",
    name: "RentO",
    tamilName: "விவசாயக் கருவிகள்",
    category: "mobility",
    icon: Tractor,
    color: "text-amber-400",
    bgGradient: "from-amber-500/20 to-orange-500/10 border-amber-500/30",
    badge: "Agri & Cargo",
    description: "Tractors, Harvesters & Goods Trucks rental"
  },
  {
    id: "drivo",
    href: "/drivo",
    name: "DriveO",
    tamilName: "ஓட்டுநர் தளம்",
    category: "mobility",
    icon: Truck,
    color: "text-cyan-400",
    bgGradient: "from-cyan-500/20 to-blue-500/10 border-cyan-500/30",
    badge: "Driver Console",
    description: "Accept rides, turn-by-turn map & earnings"
  },

  // Learning & Career
  {
    id: "tuto",
    href: "/tuto",
    name: "TutO",
    tamilName: "கல்வி & பயிற்சி",
    category: "learning",
    icon: GraduationCap,
    color: "text-indigo-400",
    bgGradient: "from-indigo-500/20 to-purple-500/10 border-indigo-500/30",
    badge: "Super LMS",
    description: "Unified LMS: TeachO + TestO All-in-One"
  },

  {
    id: "agro",
    href: "/agro",
    name: "AgrO",
    tamilName: "தமிழ்நாடு உழவர் உலகம் & வேளாண் டிவி",
    category: "commerce",
    icon: Tractor,
    color: "text-emerald-400",
    bgGradient: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30",
    badge: "Agri TV & AI Hub",
    description: "Daily farm tasks, modern crops, Agri TV & AI crop doctor"
  },
  {
    id: "dealo",
    href: "/dealo",
    name: "DealO",
    tamilName: "உள்ளூர் வணிகம்",
    category: "commerce",
    icon: Store,
    color: "text-yellow-400",
    bgGradient: "from-yellow-500/20 to-amber-500/10 border-yellow-500/30",
    description: "Hyperlocal marketplace & store discounts"
  },
  {
    id: "groupo",
    href: "/groupo",
    name: "GroupO",
    tamilName: "சுயஉதவிக் குழு",
    category: "commerce",
    icon: Users,
    color: "text-purple-400",
    bgGradient: "from-purple-500/20 to-violet-500/10 border-purple-500/30",
    badge: "Community",
    description: "SHG & Village Ecosystem Management"
  },
  {
    id: "touro",
    href: "/touro",
    name: "TourO",
    tamilName: "ஆன்மீக சுற்றுலா",
    category: "commerce",
    icon: Compass,
    color: "text-sky-400",
    bgGradient: "from-sky-500/20 to-indigo-500/10 border-sky-500/30",
    description: "Temple, heritage & vacation tour packages"
  },

  // CRM & Business
  {
    id: "inbox",
    href: "/inbox",
    name: "WhatsApp CRM",
    tamilName: "வாட்ஸ்அப் இன்பாக்ஸ்",
    category: "crm",
    icon: MessageSquare,
    color: "text-emerald-400",
    bgGradient: "from-emerald-500/20 to-green-500/10 border-emerald-500/30",
    badge: "Live Chat",
    description: "Multi-agent customer support & bot automations"
  },
  {
    id: "contacts",
    href: "/contacts",
    name: "Contacts",
    tamilName: "வாடிக்கையாளர் பட்டியல்",
    category: "crm",
    icon: Users,
    color: "text-blue-400",
    bgGradient: "from-blue-500/20 to-cyan-500/10 border-blue-500/30",
    description: "Customer directory, tags & engagement logs"
  },
  {
    id: "admin",
    href: "/admin",
    name: "Admin Hub",
    tamilName: "நிர்வாக மையம்",
    category: "crm",
    icon: Shield,
    color: "text-violet-400",
    bgGradient: "from-violet-500/20 to-purple-500/10 border-violet-500/30",
    description: "Platform metrics, driver approvals & demands"
  },

  // Account & Tools
  {
    id: "wallet",
    href: "/wallet",
    name: "Wallet & UPI",
    tamilName: "பணப்பை & கட்டணம்",
    category: "account",
    icon: CreditCard,
    color: "text-amber-400",
    bgGradient: "from-amber-500/20 to-yellow-500/10 border-amber-500/30",
    description: "Manage UPI payments, dues & SuprO coins"
  },
  {
    id: "profile",
    href: "/profile",
    name: "Profile & Settings",
    tamilName: "சுயவிவரம் & அமைப்புகள்",
    category: "account",
    icon: Settings,
    color: "text-zinc-300",
    bgGradient: "from-zinc-500/20 to-slate-500/10 border-zinc-500/30",
    description: "Manage full name, live location, avatar & UPI ID"
  }
];

interface AppLauncherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppLauncherModal({ isOpen, onClose }: AppLauncherModalProps) {
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "mobility" | "learning" | "commerce" | "crm">("all");

  const filteredModules = useMemo(() => {
    return ALL_MODULES.filter((mod) => {
      const matchSearch =
        mod.name.toLowerCase().includes(search.toLowerCase()) ||
        mod.tamilName.toLowerCase().includes(search.toLowerCase()) ||
        mod.description.toLowerCase().includes(search.toLowerCase());
      
      const matchTab = activeTab === "all" || mod.category === activeTab;
      return matchSearch && matchTab;
    });
  }, [search, activeTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-card/95 border border-border/80 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header with Search */}
        <div className="p-6 border-b border-border/60 bg-gradient-to-b from-background/90 to-card/95">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-primary/10 border border-primary/30">
                <LayoutGrid className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">SuprO Ecosystem Modules</h2>
                <p className="text-xs text-muted-foreground">Select any module to switch workspaces instantly</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search bar & Category filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search modules (e.g. Ride, Tractor, Exam, CRM)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                className="w-full pl-10 pr-4 py-2.5 bg-background/80 border border-border/80 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: "all", label: "All" },
                { id: "mobility", label: "🚗 Mobility" },
                { id: "learning", label: "🎓 Learning" },
                { id: "commerce", label: "🏪 Commerce" },
                { id: "crm", label: "💬 CRM" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all",
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Module Grid */}
        <div className="flex-1 p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {filteredModules.map((mod) => {
            const Icon = mod.icon;
            const isActive = pathname === mod.href || pathname.startsWith(`${mod.href}/`);
            return (
              <Link
                key={mod.id}
                href={mod.href}
                onClick={onClose}
                className={cn(
                  "group relative flex flex-col p-4 rounded-2xl border transition-all duration-200 hover:scale-[1.02] hover:shadow-xl",
                  isActive
                    ? "bg-primary/10 border-primary shadow-lg shadow-primary/10"
                    : `bg-gradient-to-br ${mod.bgGradient} hover:border-foreground/30`
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className={cn("p-2.5 rounded-xl bg-background/80 border border-border/50 shadow-sm", mod.color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {mod.badge && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-foreground/10 text-foreground/90 border border-foreground/15">
                      {mod.badge}
                    </span>
                  )}
                </div>
                <div className="mt-auto">
                  <div className="flex items-baseline gap-1.5">
                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors text-sm">
                      {mod.name}
                    </h3>
                    <span className="text-[11px] text-muted-foreground font-medium">({mod.tamilName})</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{mod.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
