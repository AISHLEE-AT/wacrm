"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useTotalUnread } from "@/hooks/use-total-unread";
import {
  Crown,
  GitBranch,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Radio,
  Settings,
  Shield,
  User,
  UserCog,
  Users,
  UsersRound,
  Workflow,
  X,
  Zap,
  Car,
  Truck,
  Tractor,
  Store,
  Compass,
  GraduationCap,
  Gauge,
  Share2,
  Globe,
  ShoppingBag,
} from "lucide-react";
import type { AccountRole } from "@/lib/auth/roles";
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

const ROLE_CHIP: Record<
  AccountRole,
  { icon: typeof Crown; label: string; className: string }
> = {
  owner: {
    icon: Crown,
    label: "Owner",
    className: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  },
  admin: {
    icon: Shield,
    label: "Admin",
    className: "border-primary/40 bg-primary/10 text-primary",
  },
  agent: {
    icon: UserCog,
    label: "Agent",
    className: "border-border bg-muted text-foreground",
  },
  viewer: {
    icon: User,
    label: "Viewer",
    className: "border-border bg-card text-muted-foreground",
  },
};

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  beta?: boolean;
  isExternal?: boolean;
}

const crmItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inbox", label: "Inbox", icon: MessageSquare },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/pipelines", label: "Pipelines", icon: GitBranch },
  { href: "/broadcasts", label: "Broadcasts", icon: Radio },
  { href: "/automations", label: "Automations", icon: Zap },
  { href: "/flows", label: "Flows", icon: Workflow, beta: true },
];

const adminItems: NavItem[] = [
  { href: "/admin", label: "Admin Overview", icon: Shield },
  { href: "/admin/drivers", label: "Manage Drivers", icon: Car },
  { href: "/admin/providers", label: "Manage Providers", icon: UsersRound },
];

const bottomNavItems = [
  { href: "/wallet", label: "Wallet", icon: Zap },
  { href: "/profile", label: "Profile & Settings", icon: Settings },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, profile, profileLoading, account, accountRole, signOut } = useAuth();
  const totalUnread = useTotalUnread();
  const [isRegisteredDriver, setIsRegisteredDriver] = useState(false);

  // STRICT ADMIN CHECK: Only 9486335870 or aishleetechnology@gmail.com is Administrator
  const isAdmin = Boolean(
    profile?.email?.includes("aishleetechnology@gmail.com") ||
    profile?.email?.includes("9486335870") ||
    profile?.phone?.includes("9486335870") ||
    user?.email?.includes("aishleetechnology@gmail.com") ||
    user?.email?.includes("9486335870") ||
    user?.phone?.includes("9486335870")
  );

  useEffect(() => {
    if (!user?.id) return;
    const checkDriverStatus = async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data } = await supabase
          .from("drivers")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
        if (data) setIsRegisteredDriver(true);
      } catch (err) {
        console.error(err);
      }
    };
    checkDriverStatus();
  }, [user?.id]);

  const showAccountStrip =
    !profileLoading &&
    !!account?.name &&
    account.name !== profile?.full_name;

  let displayEmail = profile?.email ?? "";
  if (displayEmail.includes("@whatsapp.wacrm.local")) {
    const rawNumber = displayEmail.split("@")[0];
    displayEmail = rawNumber.slice(-10);
  }

  useEffect(() => {
    onClose?.();
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  // Dynamic Mobility & Local Services Items
  const mobilityItems: NavItem[] = [
    { href: "/rideo", label: "RideO", icon: Car },
    { href: "/rento", label: "RentO (Agri)", icon: Tractor },
    { href: "/mandi", label: "உழவர் சந்தை (Mandi)", icon: Store },
    { href: "/dealo", label: "DealO (வியாபாரம் / Deals)", icon: ShoppingBag },
    { href: "/touro", label: "TourO (ஆன்மீகம்)", icon: Compass },
    { href: "/teacho", label: "TeachO (பயிற்சி)", icon: GraduationCap },
    { href: "https://thamizhan.vercel.app", label: "Aishlee Web (தமிழன்)", icon: Globe, isExternal: true },
    ...(isAdmin || isRegisteredDriver
      ? [{ href: "/drivo", label: "DriveO", icon: Gauge }]
      : []),
  ];

  return (
    <>
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-30 bg-background/70 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-full w-64 flex-col border-r border-white/5 bg-card/40 backdrop-blur-2xl",
          "transition-transform duration-200 ease-out will-change-transform",
          open ? "translate-x-0" : "-translate-x-full",
          "lg:static lg:z-0 lg:w-60 lg:translate-x-0 lg:transition-none"
        )}
        aria-label="Primary"
      >
        <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-white/5 px-4">
          <Link href={isAdmin ? "/dashboard" : "/rideo"} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-600 shadow-[0_0_10px_rgba(16,185,129,0.3)] border border-white/10">
              <span className="text-lg font-black text-white tracking-tighter">F</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 leading-none">
                FAGO
              </span>
              <span className="text-[9px] font-bold tracking-widest text-emerald-500/80 uppercase mt-0.5 leading-none">
                LetsGo...
              </span>
            </div>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {/* CRM Section — STRICTLY Only Visible to 9486335870 / aishleetechnology@gmail.com */}
          {isAdmin && (
            <>
              <div className="px-3 mb-2 mt-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">WAPP CRM</h3>
              </div>
              <ul className="flex flex-col gap-1">
                {crmItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));

                  const showUnreadDot =
                    item.href === "/inbox" && totalUnread > 0 && !isActive;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300 lg:py-2",
                          isActive
                            ? "bg-primary/15 text-primary shadow-[0_0_15px_var(--color-primary-soft)] border border-primary/20"
                            : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span className="flex-1">{item.label}</span>
                        {item.beta && (
                          <span
                            aria-label="Beta feature"
                            className="rounded-full border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-amber-300"
                          >
                            Beta
                          </span>
                        )}
                        {showUnreadDot && (
                          <span
                            aria-label={`${totalUnread} unread conversation${totalUnread === 1 ? "" : "s"}`}
                            className="relative flex h-2 w-2"
                          >
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          {/* Mobility & Logistics Section — Always Visible */}
          <div className="px-3 mb-2 mt-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mobility & Logistics</h3>
          </div>
          <ul className="flex flex-col gap-1">
            {mobilityItems.map((item: any) => {
              const isActive = !item.isExternal && pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  {item.isExternal ? (
                    <a
                      href={`${item.href}?phone=${displayEmail}&name=${encodeURIComponent(profile?.full_name || 'User')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-cyan-400 hover:bg-cyan-500/10 transition-all lg:py-2"
                    >
                      <item.icon className="h-4 w-4 text-cyan-400" />
                      <span className="flex-1">{item.label}</span>
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300 lg:py-2",
                        isActive
                          ? "bg-primary/15 text-primary shadow-[0_0_15px_var(--color-primary-soft)] border border-primary/20"
                          : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="flex-1">{item.label}</span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Administration Section — STRICTLY Only Visible to 9486335870 / aishleetechnology@gmail.com */}
          {isAdmin && (
            <>
              <div className="px-3 mb-2 mt-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Administration</h3>
              </div>
              <ul className="flex flex-col gap-1">
                {adminItems.map((item) => {
                  const isActive =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300 lg:py-2",
                          isActive
                            ? "bg-primary/15 text-primary shadow-[0_0_15px_var(--color-primary-soft)] border border-primary/20"
                            : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span className="flex-1">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          <div className="my-4 border-t border-border" />

          {/* Account & Settings Section — Always Visible */}
          <ul className="flex flex-col gap-1">
            {bottomNavItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300 lg:py-2",
                      isActive
                        ? "bg-primary/15 text-primary shadow-[0_0_15px_var(--color-primary-soft)] border border-primary/20"
                        : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Footer Strip */}
        <div className="shrink-0 border-t border-white/5 p-3">
          {showAccountStrip && account?.name ? (
            <div className="mb-2 flex items-center gap-2 px-3 text-xs text-muted-foreground">
              <UsersRound className="size-3.5 shrink-0" />
              <span className="truncate" title={account.name}>
                {account.name}
              </span>
              {isAdmin ? (
                <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider border-amber-500/40 bg-amber-500/10 text-amber-300">
                  <Crown className="size-3" />
                  Admin
                </span>
              ) : (
                <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider border-border bg-card text-muted-foreground">
                  <User className="size-3" />
                  User
                </span>
              )}
            </div>
          ) : null}
          {/* 1-Tap Viral WhatsApp Invite Button */}
          <a
            href="https://wa.me/?text=Hey!%20Book%20local%20rides,%20rentals%20%26%20services%20with%200%25%20commission%20on%20FAGO%20Super%20App:%20https://watscrm.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="mb-2 flex items-center justify-center gap-2 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 px-3 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 transition-all border border-emerald-400/30"
          >
            <MessageSquare className="size-4 animate-bounce text-white" />
            <span>Invite & Earn on WhatsApp</span>
          </a>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted/60 focus:bg-muted/60 focus:outline-none data-popup-open:bg-muted/60">
              <Avatar className="size-8 shrink-0">
                {profile?.avatar_url ? (
                  <AvatarImage
                    src={profile.avatar_url}
                    alt={profile.full_name ?? "Avatar"}
                  />
                ) : null}
                <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
                  {profile?.full_name?.charAt(0)?.toUpperCase() ??
                    profile?.email?.charAt(0)?.toUpperCase() ??
                    "U"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {profile?.full_name ?? displayEmail}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {displayEmail}
                </p>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              side="top"
              sideOffset={6}
              className="min-w-56 bg-popover text-popover-foreground ring-border"
            >
              <DropdownMenuItem
                render={
                  <Link
                    href="/profile"
                    onClick={onClose}
                    className="text-popover-foreground focus:bg-accent focus:text-accent-foreground"
                  />
                }
              >
                <User className="size-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                render={
                  <Link
                    href="/profile?tab=account"
                    onClick={onClose}
                    className="text-popover-foreground focus:bg-accent focus:text-accent-foreground"
                  />
                }
              >
                <Settings className="size-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                onClick={signOut}
                className="text-popover-foreground focus:bg-accent focus:text-accent-foreground"
              >
                <LogOut className="size-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </>
  );
}
